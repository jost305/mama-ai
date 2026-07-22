import os
from unsloth import FastLanguageModel
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset
from unsloth.chat_templates import get_chat_template

def main():
    print("==========================================")
    print(" OJA-LM-1 TRAINING (AFRIQUE-QWEN via COLAB)")
    print("==========================================\n")

    # 1. Load the AfriqueQwen Base Model (1.5B parameters)
    print("[*] Booting up unsloth/Qwen2.5-1.5B-Instruct...")
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name = "unsloth/Qwen2.5-1.5B-Instruct",
        max_seq_length = 2048,
        load_in_4bit = True,
    )

    # 2. Add LoRA Adapters for reasoning retention
    print("[*] Injecting LoRA adapters...")
    model = FastLanguageModel.get_peft_model(
        model,
        r = 16,
        target_modules = ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        lora_alpha = 16,
        lora_dropout = 0,
        bias = "none",
        use_gradient_checkpointing = "unsloth",
        random_state = 3407,
    )

    # 3. Format our OjaData for the ChatML architecture
    print("[*] Formatting ShareGPT dataset into ChatML...")
    tokenizer = get_chat_template(
        tokenizer, 
        chat_template="chatml", 
        mapping={"role": "from", "content": "value", "user": "human", "assistant": "gpt"}
    )

    def formatting_prompts_func(examples):
        convos = examples["conversations"]
        texts = [tokenizer.apply_chat_template(c, tokenize=False, add_generation_prompt=False) for c in convos]
        return { "text" : texts }

    # Make sure this points to the uploaded dataset in Colab!
    dataset_path = "training_corpus.jsonl"
    if not os.path.exists(dataset_path):
        print(f"[!] Error: Could not find {dataset_path}. Please upload it to Colab.")
        return

    dataset = load_dataset("json", data_files=dataset_path, split="train")
    dataset = dataset.map(formatting_prompts_func, batched=True)

    # 4. Train!
    print("[*] Starting SFT Training Loop...")
    trainer = SFTTrainer(
        model = model,
        train_dataset = dataset,
        tokenizer = tokenizer,
        dataset_text_field = "text",
        max_seq_length = 2048,
        args = SFTConfig(
            per_device_train_batch_size = 2,
            gradient_accumulation_steps = 4,
            max_steps = 60,
            learning_rate = 2e-4,
            output_dir = "outputs",
            optim = "adamw_8bit",
            seed = 3407,
        ),
    )
    trainer.train()

    # 5. Export the trained adapter
    print("[*] Saving trained model adapters to 'ojalm-v1-lora'...")
    model.save_pretrained("ojalm-v1-lora")
    tokenizer.save_pretrained("ojalm-v1-lora")
    
    print("[*] SUCCESS! OjaLM-1 Fine-tuning Complete.")

if __name__ == "__main__":
    main()
