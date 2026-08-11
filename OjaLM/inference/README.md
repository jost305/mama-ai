# OjaLM Cloud GPU Inference Service (Modal)

Dedicated, scalable cloud GPU microservice for **OjaLM-v0.1** (~3.07 GB GGUF Q4_K_M) serving OpenAI-compatible Chat Completion endpoints.

---

## Architectural Overview

```text
User Request
     ↓
MamaPrice API (Orchestrator + RAG)
     ├── OjaGraph (Retrieves real-time commodity prices)
     └── queryOjaLM()
           ↓
     Modal Cloud GPU API (https://<modal-endpoint>/v1/chat/completions)
           └── persistent Volume (/vol/models/OjaLM-v0.1.gguf)
                 └── llama-cpp-python (NVIDIA L4 GPU)
                       └── OjaLM-v0.1.gguf
```

---

## 1. Prerequisites & Setup

Install Modal CLI and dependencies:

```bash
pip install modal fastapi uvicorn requests huggingface_hub
```

Authenticate Modal CLI (first time setup):

```bash
modal setup
```

---

## 2. Deploying to Modal

To deploy the OjaLM inference service to Modal:

```bash
cd OjaLM/inference
modal deploy modal_app.py
```

Upon completion, Modal will display your live production endpoint URL, e.g.:
`https://your-username--ojalm-inference-serve.modal.run`

---

## 3. Environment Variables & Security

### Modal Environment Variables (Optional Secrets)
Set `OJALM_API_KEY` in your Modal Secrets dashboard or environment:

```bash
modal secret create ojalm-secrets OJALM_API_KEY="your-secure-secret-key"
```

### MamaPrice API Environment Variables (`.env`)
In your `MamaPrice API` configuration (`OjaLM/apps/mamaprice-api/.env` or shell):

```env
OJALM_INFERENCE_URL=https://your-username--ojalm-inference-serve.modal.run
OJALM_API_KEY=your-secure-secret-key
```

---

## 4. API Endpoints

### 1. Public Health Check
- **Endpoint**: `GET /health` or `GET /v1/health`
- **Response**:
```json
{
  "status": "ok",
  "service": "OjaLM",
  "model": "ctrlprompt/OjaLM-v0.1",
  "filename": "OjaLM-v0.1.gguf",
  "version": "v0.1",
  "provider": "Modal Cloud GPU",
  "gpu": "L4"
}
```

### 2. OpenAI-Compatible Chat Completion
- **Endpoint**: `POST /v1/chat/completions`
- **Header**: `Authorization: Bearer <OJALM_API_KEY>`
- **Body**:
```json
{
  "model": "OjaLM-v0.1",
  "messages": [
    {
      "role": "system",
      "content": "You are MamaPrice, the intelligent Commerce AI for African markets."
    },
    {
      "role": "user",
      "content": "Where is rice cheapest in Ibadan?"
    }
  ],
  "temperature": 0.3,
  "max_tokens": 512
}
```

---

## 5. Model Caching & Modal Volume

- **Volume Name**: `ojalm-model-vol`
- **Mount Point**: `/vol/models/OjaLM-v0.1.gguf`
- On the first container start, Modal downloads `OjaLM-v0.1.gguf` (3.07 GB) from `https://huggingface.co/ctrlprompt/OjaLM-v0.1` and commits it to the persistent Modal volume.
- Subsequent cold-starts read directly from the persistent volume without re-downloading.

---

## 6. GPU Hardware Switching

The deployment defaults to NVIDIA `L4` GPU for optimal balance of speed and cost.
To change GPU architecture (e.g. `A10G` or `L40S`), update `gpu="L4"` in `modal_app.py`:

```python
@app.cls(
    image=image,
    gpu="A10G", # Options: "L4", "A10G", "L40S", "A100"
    volumes={MODEL_DIR: vol}
)
```

---

## 7. Testing Deployment

Run the included diagnostic script:

```bash
python OjaLM/inference/test_inference.py --url https://your-username--ojalm-inference-serve.modal.run --key your-secure-secret-key
```

Or via `curl`:

```bash
curl -X POST "https://your-username--ojalm-inference-serve.modal.run/v1/chat/completions" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-secure-secret-key" \
     -d '{
       "model": "OjaLM-v0.1",
       "messages": [{"role": "user", "content": "Hello, who are you?"}]
     }'
```

---

## 8. Deleting Deployment

To delete or stop the Modal app:

```bash
modal app stop ojalm-inference
```
