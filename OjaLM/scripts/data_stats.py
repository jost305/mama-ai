import json
import argparse
from collections import defaultdict
import os

def load_data(filepath):
    tasks = []
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    tasks.append(json.loads(line))
    return tasks

def main():
    parser = argparse.ArgumentParser(description="ACIB Data Dashboard")
    parser.add_argument("--benchmark", type=str, default="datasets/acib/v0.1.jsonl", help="Path to ACIB JSONL")
    args = parser.parse_args()

    tasks = load_data(args.benchmark)
    
    total = len(tasks)
    
    # Status
    statuses = defaultdict(int)
    
    # Languages
    languages = defaultdict(int)
    
    # Reasoning
    reasoning = defaultdict(int)
    
    # Domains
    domains = {"Food & Groceries": 0, "Electronics": 0, "Fashion & Apparel": 0, "Construction": 0, "Healthcare": 0}
    
    for t in tasks:
        # Status
        status = t.get("review", {}).get("status", "Draft")
        statuses[status] += 1
        
        # Languages
        for lang in t.get("variants", {}).keys():
            languages[lang] += 1
            
        # Reasoning
        for r in t.get("reasoning_type", []):
            reasoning[r] += 1
            
        # Domains
        d = t.get("domain", "Unknown")
        if d in domains:
            domains[d] += 1
        else:
            domains[d] = 1

    print("\n====================================")
    print("ACIB Statistics Dashboard")
    print("====================================\n")
    print(f"Total Tasks{'':.<13}{total}")
    for stat in ["Golden", "Locked", "Validated", "Reviewed", "Draft"]:
        if statuses[stat] > 0 or stat in ["Golden", "Draft"]:
            print(f"{stat}{'':.<19}{statuses[stat]}")

    print("\nLanguages")
    for lang, count in languages.items():
        print(f"{lang}{'':.<20}{count}")

    print("\nReasoning Types")
    for r, count in sorted(reasoning.items(), key=lambda x: x[1], reverse=True):
        print(f"{r}{'':.<15}{count}")

    print("\nDomains")
    for d, count in domains.items():
        print(f"{d}{'':.<15}{count}")
        
    print("\n====================================\n")

if __name__ == "__main__":
    main()
