import os
import sys
from huggingface_hub import HfApi, create_repo

file_path = r"C:\Users\olusegun\Desktop\mama-ai\OjaLM\models\OjaLM\OjaLM-v0.1.gguf"
repo_id = "oxxcloud/OjaLM-v0.1"

print(f"Checking model file: {file_path}")
if not os.path.exists(file_path):
    models_dir = r"C:\Users\olusegun\Desktop\mama-ai\OjaLM\models"
    for root, dirs, files in os.walk(models_dir):
        for f in files:
            if f.endswith(".gguf"):
                file_path = os.path.join(root, f)
                break

if os.path.exists(file_path):
    size_mb = os.path.getsize(file_path) / (1024 * 1024)
    filename = os.path.basename(file_path)
    print(f"Found model: {filename} ({size_mb:.2f} MB)")
    
    api = HfApi()
    
    try:
        print(f"Ensuring repository {repo_id} exists on Hugging Face...")
        api.create_repo(repo_id=repo_id, repo_type="model", exist_ok=True)
        
        print(f"Uploading {filename} to https://huggingface.co/{repo_id}...")
        api.upload_file(
            path_or_fileobj=file_path,
            path_in_repo=filename,
            repo_id=repo_id,
            repo_type="model"
        )
        print(f"SUCCESS! Model uploaded to https://huggingface.co/{repo_id}")
    except Exception as e:
        print(f"Error: {e}")
        print("\nIf 401 Unauthorized occurs, please run 'huggingface-cli login' or set HF_TOKEN environment variable with write permissions.")
else:
    print("Model file GGUF not found.")
