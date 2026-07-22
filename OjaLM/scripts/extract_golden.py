import json
import os

filepath = 'datasets/acib/v0.1.jsonl'
golden_dir = 'datasets/acib/golden'
os.makedirs(golden_dir, exist_ok=True)

# Define mapping for filenames
golden_ids = {
    "OBJ-PI-0007": "rice",
    "OBJ-PI-0008": "beans",
    "OBJ-PI-0009": "garri",
    "OBJ-PI-0010": "yam",
    "OBJ-PI-0011": "flour"
}

updated_lines = []

if os.path.exists(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip(): continue
            task = json.loads(line)
            
            # If it's one of the 5 tasks, update status and save to golden
            if task.get("id") in golden_ids:
                if "review" not in task:
                    task["review"] = {}
                task["review"]["status"] = "Golden"
                
                # Save as individual golden file
                golden_filename = f'{task["id"]}_{golden_ids[task["id"]]}.json'
                with open(os.path.join(golden_dir, golden_filename), 'w', encoding='utf-8') as gf:
                    json.dump(task, gf, indent=2)
                    
            updated_lines.append(json.dumps(task))

# Rewrite the main jsonl file with updated statuses
with open(filepath, 'w', encoding='utf-8') as f:
    for line in updated_lines:
        f.write(line + '\n')

print("Extraction and status update complete.")
