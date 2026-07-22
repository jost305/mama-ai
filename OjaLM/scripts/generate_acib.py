import json
import os
import argparse
from typing import Dict, Any, List

# Vertical to Code mapping
VERTICAL_CODES = {
    "Product Intelligence": "PI",
    "Negotiation": "NG",
    "Shopping Reasoning": "SR",
    "Market Intelligence": "MI",
    "Vendor Intelligence": "VI",
    "Tool Calling": "TC",
    "Commerce Mathematics": "CM",
    "Financial Reasoning": "FR",
    "Logistics & Delivery": "LD",
    "Multilingual Commerce": "ML",
    "Vision Commerce": "VS",
    "Voice Commerce": "VC",
    "Safety & Hallucination": "HA"
}

def get_next_id(filepath: str, vertical_code: str) -> str:
    """Scans the JSONL file to find the highest ID for a vertical and returns the next."""
    highest_num = 0
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                if not line.strip(): continue
                data = json.loads(line)
                task_id = data.get("id", "")
                # Expected format: OBJ-PI-0005
                parts = task_id.split('-')
                if len(parts) == 3 and parts[1] == vertical_code:
                    try:
                        num = int(parts[2])
                        if num > highest_num:
                            highest_num = num
                    except ValueError:
                        pass
                        
    next_num = highest_num + 1
    return f"OBJ-{vertical_code}-{next_num:04d}"

def prompt_with_default(prompt_text: str, default: str) -> str:
    user_input = input(f"{prompt_text} [{default}]: ")
    return user_input.strip() if user_input.strip() else default

def generate_scaffold(args) -> Dict[str, Any]:
    
    # Resolve values (use args if provided, else interactive)
    print("--- ACIB Dataset Generator ---")
    
    track = args.track if args.track else prompt_with_default("Track", "ACIB-Core")
    domain = args.domain if args.domain else prompt_with_default("Domain", "Food & Groceries")
    
    if args.vertical:
        vertical = args.vertical
    else:
        print("\nAvailable Verticals:", ", ".join(VERTICAL_CODES.keys()))
        vertical = prompt_with_default("Vertical", "Product Intelligence")
        
    if vertical not in VERTICAL_CODES:
        print(f"Warning: '{vertical}' not strictly recognized, defaulting code to 'XX'")
        v_code = VERTICAL_CODES.get(vertical, "XX")
    else:
        v_code = VERTICAL_CODES[vertical]
        
    country = args.country if args.country else prompt_with_default("Country", "Nigeria")
    region = prompt_with_default("Region", "National") if not args.region else args.region
    market_type = prompt_with_default("Market Type", "Open Market") if not args.market else args.market
    difficulty = int(prompt_with_default("Difficulty (1-5)", "3") if not args.difficulty else args.difficulty)
    knowledge_type = prompt_with_default("Knowledge Type (Static/Live/Seasonal/Dynamic)", "Static") if not args.knowledge else args.knowledge
    reasoning = prompt_with_default("Reasoning Type (comma separated)", "Comparison, Decision Making") if not getattr(args, 'reasoning', None) else args.reasoning
    
    # Calculate ID
    task_id = get_next_id(args.file, v_code)
    print(f"\nAuto-generated ID: {task_id}")
    
    scaffold = {
        "id": task_id,
        "track": track,
        "version": "1.0",
        "domain": domain,
        "vertical": vertical,
        "country": country,
        "region": region,
        "market_type": market_type,
        "difficulty_score": difficulty,
        "knowledge_type": knowledge_type,
        "reasoning_type": [r.strip() for r in reasoning.split(',')],
        "consumer_context": {
            "budget": "TODO",
            "goal": "TODO"
        },
        "tool_expectation": {
            "requires_tool": False,
            "preferred_tool": None
        },
        "variants": {
            "en": {"prompt": "TODO: English Prompt"},
            "pcm": {"prompt": "TODO: Pidgin Prompt"},
            "yo": {"prompt": "TODO: Yoruba Prompt"},
            "ha": {"prompt": "TODO: Hausa Prompt"},
            "ig": {"prompt": "TODO: Igbo Prompt"}
        },
        "aliases": ["TODO"],
        "ground_truth": [
            "TODO: Required outcome 1",
            "TODO: Required outcome 2"
        ],
        "evaluation_dimensions": {
            "factual_accuracy": 40,
            "reasoning": 30,
            "completeness": 20,
            "safety": 10
        },
        "review": {
            "status": "Draft",
            "author": "Oja AI Research Lab",
            "reviewer": None,
            "language_review": None
        },
        "sources": []
    }
    
    return scaffold

def main():
    parser = argparse.ArgumentParser(description="ACIB Benchmark Scaffolder")
    parser.add_argument("--file", type=str, default="datasets/acib/v0.1.jsonl", help="Target JSONL file")
    parser.add_argument("--track", type=str)
    parser.add_argument("--domain", type=str)
    parser.add_argument("--vertical", type=str)
    parser.add_argument("--country", type=str)
    parser.add_argument("--region", type=str)
    parser.add_argument("--market", type=str)
    parser.add_argument("--difficulty", type=str)
    parser.add_argument("--knowledge", type=str)
    parser.add_argument("--reasoning", type=str)
    
    args = parser.parse_args()
    
    scaffold = generate_scaffold(args)
    
    # Append to file
    with open(args.file, 'a', encoding='utf-8') as f:
        f.write(json.dumps(scaffold) + '\n')
        
    print(f"\n[SUCCESS] Scaffold appended to {args.file}")
    print("Open the file in your IDE to fill in the 'TODO' fields.")

if __name__ == "__main__":
    main()
