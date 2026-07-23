import os
from huggingface_hub import HfApi

dataset_dir = r"C:\Users\olusegun\Desktop\mama-ai\OjaLM\datasets\ojadata"
repo_id = "oxxcloud/ojadata-v0.1"

print(f"Checking dataset directory: {dataset_dir}")
api = HfApi()

try:
    print(f"Ensuring dataset repository {repo_id} exists on Hugging Face...")
    api.create_repo(repo_id=repo_id, repo_type="dataset", exist_ok=True)

    for fname in ["v0.1.jsonl", "training_corpus.jsonl", "v0.2_commerce_graph.jsonl"]:
        fpath = os.path.join(dataset_dir, fname)
        if os.path.exists(fpath):
            size_kb = os.path.getsize(fpath) / 1024
            print(f"Uploading {fname} ({size_kb:.2f} KB) to https://huggingface.co/datasets/{repo_id}...")
            api.upload_file(
                path_or_fileobj=fpath,
                path_in_repo=fname,
                repo_id=repo_id,
                repo_type="dataset"
            )
    print(f"SUCCESS! Dataset uploaded to https://huggingface.co/datasets/{repo_id}")
except Exception as e:
    print(f"Error: {e}")
