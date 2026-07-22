import nest_asyncio
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from unsloth import FastLanguageModel
import torch
import json

app = FastAPI()

# Allow CORS for the local UI to connect to Colab
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Load OjaLM
max_seq_length = 2048
dtype = None
load_in_4bit = True

print("Loading OjaLM Inference Engine for API...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "ojalm-v3-lora", 
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)
FastLanguageModel.for_inference(model)

SYSTEM_PROMPT = """You are MamaPrice, the friendly and intelligent AI assistant for commerce and market prices in Nigeria.

You chat warmly and naturally with the user like a human. You love helping people find good prices and understand the market.

CRITICAL INSTRUCTION:
If you notice the user is acting as a "Scout" (i.e. they are reporting prices or market events), you MUST do two things in your response:
1. Acknowledge their report in a friendly, conversational way.
2. At the very end of your response, output a structured JSON block wrapped in ```json containing the data they reported. Use this schema:
{
  "report_id": "random-uuid",
  "market": "Market Name",
  "state": "State Name",
  "scout": "Unknown",
  "timestamp": "Current Date",
  "products": [
      {
        "product": "Product Name",
        "brand": "Brand Name",
        "price_ngn": 1000,
        "unit": "Unit",
        "confidence": 0.99
      }
  ],
  "market_event": "Any events mentioned",
  "evidence": []
}

If the user is just asking a normal question, just answer them conversationally and DO NOT output JSON."""

class ChatRequest(BaseModel):
    prompt: str

@app.post("/chat")
async def chat_with_mamaprice(req: ChatRequest):
    # Fix from evaluation: explicitly tell the model to stop generating at <|im_end|>
    eos_token_id = tokenizer.convert_tokens_to_ids("<|im_end|>")
    
    prompt = f"<|im_start|>system\n{SYSTEM_PROMPT}<|im_end|>\n<|im_start|>user\n{req.prompt}<|im_end|>\n<|im_start|>assistant\n"
    
    inputs = tokenizer(
        text=[prompt],
        return_tensors="pt"
    ).input_ids.to("cuda")
    
    outputs = model.generate(
        input_ids=inputs, 
        max_new_tokens=512, 
        use_cache=True,
        eos_token_id=eos_token_id # STOP hallucinatory conversations
    )
    
    response_text = tokenizer.batch_decode(outputs)[0]
    
    # Extract only the assistant's reply
    reply = response_text.split("<|im_start|>assistant\n")[-1].replace("<|im_end|>", "").strip()
    
    return {"response": reply}

if __name__ == "__main__":
    # nest_asyncio is required to run uvicorn inside a Colab Notebook
    nest_asyncio.apply()
    print("MamaPrice API is running on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
