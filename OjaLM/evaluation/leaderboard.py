import os
from typing import Dict, Any
from .utils import load_jsonl, save_json, ensure_dir
import json

class Leaderboard:
    def __init__(self, filepath: str = "reports/leaderboard.json"):
        self.filepath = filepath
        self.md_filepath = filepath.replace(".json", ".md")
        ensure_dir(os.path.dirname(self.filepath))
        
    def update(self, model_name: str, score: float) -> None:
        """Updates the leaderboard with a new score."""
        entries = []
        if os.path.exists(self.filepath):
            with open(self.filepath, 'r') as f:
                try:
                    entries = json.load(f)
                except json.JSONDecodeError:
                    entries = []
                    
        # Update if exists, else append
        found = False
        for entry in entries:
            if entry["model"] == model_name:
                entry["score"] = score
                found = True
                break
                
        if not found:
            entries.append({"model": model_name, "score": score})
            
        # Sort descending
        entries.sort(key=lambda x: x["score"], reverse=True)
        
        # Save JSON
        save_json(self.filepath, entries)
        
        # Save Markdown
        self._export_markdown(entries)
        
    def _export_markdown(self, entries: list) -> None:
        md = "# ACIB Leaderboard\n\n"
        md += "| Model | ACIB |\n"
        md += "| ----------- | ---- |\n"
        for entry in entries:
            md += f"| {entry['model']} | {entry['score']} |\n"
            
        with open(self.md_filepath, 'w', encoding='utf-8') as f:
            f.write(md)
