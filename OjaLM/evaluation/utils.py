import json
import os
from typing import List, Dict, Any

def load_jsonl(filepath: str) -> List[Dict[str, Any]]:
    """Loads a JSONL file and returns a list of dictionaries."""
    data = []
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")
        
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                data.append(json.loads(line.strip()))
    return data

def save_jsonl(filepath: str, data: List[Dict[str, Any]]) -> None:
    """Saves a list of dictionaries to a JSONL file."""
    ensure_dir(os.path.dirname(filepath))
    with open(filepath, 'w', encoding='utf-8') as f:
        for item in data:
            f.write(json.dumps(item) + '\n')

def save_json(filepath: str, data: Any) -> None:
    """Saves data to a JSON file."""
    ensure_dir(os.path.dirname(filepath))
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def ensure_dir(directory: str) -> None:
    """Ensures a directory exists."""
    if directory and not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)
