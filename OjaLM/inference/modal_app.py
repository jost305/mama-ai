import os
import time
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import modal

# ─────────────────────────────────────────────────────────────────────────────
# 1. Configuration & Constants
# ─────────────────────────────────────────────────────────────────────────────
HF_REPO = "ctrlprompt/OjaLM-v0.1"
MODEL_FILENAME = "OjaLM-v0.1.gguf"
MODEL_DIR = "/vol/models"
MODEL_PATH = f"{MODEL_DIR}/{MODEL_FILENAME}"
GPU_TYPE = os.environ.get("MODAL_GPU_TYPE", "L4")

# Persistent Modal Volume for caching downloaded model weights
vol = modal.Volume.from_name("ojalm-model-vol", create_if_missing=True)

# ─────────────────────────────────────────────────────────────────────────────
# 2. Container Image Specification (Debian + llama-cpp-python)
# ─────────────────────────────────────────────────────────────────────────────
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "fastapi[standard]",
        "pydantic",
        "huggingface_hub",
        "httpx"
    )
    .pip_install(
        "llama-cpp-python",
        extra_index_url="https://abetlen.github.io/llama-cpp-python/wheels/cxx11/cu122"
    )
)

app = modal.App("ojalm-inference")

# ─────────────────────────────────────────────────────────────────────────────
# 3. Pydantic Schemas (OpenAI Chat Completions Compatible)
# ─────────────────────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the message author (system, user, assistant)")
    content: str = Field(..., description="Contents of the message")

class ChatCompletionRequest(BaseModel):
    model: Optional[str] = Field("OjaLM-v0.1", description="Target model name")
    messages: List[ChatMessage] = Field(..., description="Array of chat conversation messages")
    temperature: Optional[float] = Field(0.3, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(256, ge=1, le=4096)
    top_p: Optional[float] = Field(0.9, ge=0.0, le=1.0)
    stream: Optional[bool] = Field(False, description="Streaming support placeholder")

# ─────────────────────────────────────────────────────────────────────────────
# 4. GPU Model Class Definition
# ─────────────────────────────────────────────────────────────────────────────
@app.cls(
    image=image,
    gpu="L4",
    volumes={MODEL_DIR: vol},
    min_containers=1,
    scaledown_window=900
)
class OjaLMModel:
    @modal.enter()
    def initialize_model(self):
        from huggingface_hub import hf_hub_download
        from llama_cpp import Llama

        os.makedirs(MODEL_DIR, exist_ok=True)
        if not os.path.exists(MODEL_PATH):
            print(f"📥 [Modal Cold Start] Downloading {MODEL_FILENAME} from HF: {HF_REPO}...")
            hf_hub_download(
                repo_id=HF_REPO,
                filename=MODEL_FILENAME,
                local_dir=MODEL_DIR,
                local_dir_use_symlinks=False
            )
            vol.commit()
            print("✓ Download complete & volume committed to persistent storage!")
        else:
            print("✓ Model loaded from Modal Volume cache!")

        n_ctx = int(os.environ.get("CONTEXT_SIZE", "2048"))
        n_gpu_layers = int(os.environ.get("N_GPU_LAYERS", "-1"))

        print(f"🚀 Initializing llama-cpp-python (n_ctx={n_ctx}, n_gpu_layers={n_gpu_layers})...")
        self.llm = Llama(
            model_path=MODEL_PATH,
            n_ctx=n_ctx,
            n_gpu_layers=n_gpu_layers,
            verbose=False
        )
        print("✅ OjaLM-v0.1 successfully loaded into GPU VRAM!")

    @modal.method()
    def generate_chat_completion(self, messages: List[dict], temperature: float = 0.3, max_tokens: int = 256):
        start_time = time.time()
        response = self.llm.create_chat_completion(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        response["latency_ms"] = elapsed_ms
        response["provider"] = "modal"
        return response

# ─────────────────────────────────────────────────────────────────────────────
# 5. FastAPI Endpoints (/health and /v1/chat/completions)
# ─────────────────────────────────────────────────────────────────────────────
web_app = FastAPI(title="OjaLM Inference API", version="v0.1")
security = HTTPBearer(auto_error=False)

def verify_api_key(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)):
    expected_key = os.environ.get("OJALM_API_KEY", "").strip()
    if not expected_key:
        return True
    if not credentials or credentials.credentials != expected_key:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Invalid or missing Bearer token in Authorization header."
        )
    return True

@web_app.get("/")
@web_app.get("/health")
@web_app.get("/v1/health")
def health():
    return {
        "status": "ok",
        "service": "OjaLM",
        "model": HF_REPO,
        "filename": MODEL_FILENAME,
        "version": "v0.1",
        "provider": "Modal Cloud GPU",
        "gpu": GPU_TYPE
    }

@web_app.post("/v1/chat/completions")
def chat_completions(
    req: ChatCompletionRequest,
    authorized: bool = Depends(verify_api_key)
):
    try:
        messages_dict = [{"role": m.role, "content": m.content} for m in req.messages]
        model = OjaLMModel()
        return model.generate_chat_completion.remote(
            messages=messages_dict,
            temperature=req.temperature or 0.3,
            max_tokens=req.max_tokens or 256
        )
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Inference Engine Error: {str(err)}")

# ─────────────────────────────────────────────────────────────────────────────
# 6. Modal ASGI Entrypoint
# ─────────────────────────────────────────────────────────────────────────────
@app.function(image=image, volumes={MODEL_DIR: vol})
@modal.asgi_app()
def serve():
    return web_app
