import os
from unsloth import FastLanguageModel
from transformers import TextStreamer
from unsloth.chat_templates import get_chat_template

# ---------------------------------------------------------
# CONSTANTS
# ---------------------------------------------------------
# Path to the locally downloaded or currently active Colab adapter
ADAPTER_PATH = "ojalm-v3-lora" 

SYSTEM_PROMPT = """You are MamaPrice Scout AI.

You convert WhatsApp messages from price scouts into structured OjaGraph reports.

Never summarize.

Never explain.

Output ONLY valid JSON.

Use the following schema:
{
  "report_id":"",
  "market":"",
  "state":"",
  "scout":"",
  "timestamp":"",
  "products":[
      {
        "product":"",
        "brand":"",
        "price_ngn":0,
        "unit":"",
        "confidence":0.0
      }
  ],
  "market_event":"",
  "evidence":[]
}"""

UNSEEN_PROMPTS = [
    "I'm at Mile 12. Golden Penny Flour is now ₦72,500. Dangote Sugar 50kg is ₦91,000. Heavy rain today. Tomato sellers say supply is low.",
    "Just checked Ariaria. A carton of Indomie (120 pack) sells for ₦12,300. Many shops are out of stock.",
    "Balogun market. A painter told me Dulux paint increased by ₦2,500 this week because of import costs."
]

def main():
    print("[*] Loading OjaLM Inference Engine...")
    
    # Load the model with the LoRA adapter applied
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name = ADAPTER_PATH, # Loads the fine-tuned adapter directly
        max_seq_length = 2048,
        load_in_4bit = True,
    )
    
    # We bypass apply_chat_template due to a transformers library bug with AfriqueQwen
    # and format the ChatML string directly instead.
    
    # Enable native 2x faster inference
    FastLanguageModel.for_inference(model)
    streamer = TextStreamer(tokenizer)
    
    print("\n==========================================")
    print(" GENERALIZATION EVALUATION: UNSEEN PROMPTS")
    print("==========================================\n")
    
    for i, user_prompt in enumerate(UNSEEN_PROMPTS, 1):
        print(f"--- TEST {i} ---")
        print(f"RAW INPUT: {user_prompt}\n")
        print("OJALM OUTPUT:")
        
        # Bypass transformers apply_chat_template bug by manually formatting ChatML
        prompt = f"<|im_start|>system\n{SYSTEM_PROMPT}<|im_end|>\n<|im_start|>user\n{user_prompt}<|im_end|>\n<|im_start|>assistant\n"
        
        inputs = tokenizer(
            text=[prompt],
            return_tensors="pt"
        ).input_ids.to("cuda")
        
        # Generate the structured response
        _ = model.generate(
            input_ids = inputs,
            streamer = streamer,
            max_new_tokens = 512,
            temperature = 0.1, # Keep it deterministic for JSON
        )
        print("\n\n")

if __name__ == "__main__":
    main()
