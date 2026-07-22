import os
import json
import argparse

# In a real environment, you'd import your LLM client (e.g., openai, anthropic, or a local vLLM endpoint)
# import openai

def load_golden_seed(filepath: str) -> dict:
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_variations(seed_task: dict, target_count: int) -> list:
    """
    Uses the provided Golden Seed task as a few-shot prompt to generate 
    `target_count` new variations via an LLM.
    """
    print(f"[*] Scaling {seed_task['vertical']} from Golden Seed {seed_task['id']}...")
    
    # MOCK LLM CALL
    # prompt = f"Given this ACIB task schema and example:\n{json.dumps(seed_task)}\nGenerate {target_count} new tasks in the same vertical..."
    # response = openai.chat.completions.create(model="gpt-4o", messages=[{"role": "user", "content": prompt}])
    
    mock_tasks = []
    for i in range(target_count):
        new_task = seed_task.copy()
        new_task["id"] = f"{seed_task['id'].split('-')[0]}-{seed_task['id'].split('-')[1]}-MOCK{i+1}"
        new_task["review"]["status"] = "Draft"
        mock_tasks.append(new_task)
        
    return mock_tasks

def main():
    parser = argparse.ArgumentParser(description="ACIB Batch Scaling Engine")
    parser.add_argument("--seed_dir", type=str, default="datasets/acib/golden", help="Directory containing golden seeds")
    parser.add_argument("--output", type=str, default="datasets/acib/v0.1_scaled.jsonl", help="Output file for generated tasks")
    parser.add_argument("--target_per_vertical", type=int, default=19, help="Number of tasks to generate per seed")
    args = parser.parse_args()

    print("====================================")
    print("ACIB Scaling Engine")
    print("====================================\n")

    if not os.path.exists(args.seed_dir):
        print(f"[!] Error: Seed directory {args.seed_dir} not found.")
        return

    all_scaled_tasks = []
    for filename in os.listdir(args.seed_dir):
        if filename.endswith(".json"):
            filepath = os.path.join(args.seed_dir, filename)
            seed = load_golden_seed(filepath)
            
            scaled_tasks = generate_variations(seed, args.target_per_vertical)
            all_scaled_tasks.extend(scaled_tasks)
            
            print(f"[+] Generated {len(scaled_tasks)} tasks for {seed['vertical']}")

    # Write out scaled batch for manual review
    with open(args.output, 'w', encoding='utf-8') as f:
        for t in all_scaled_tasks:
            f.write(json.dumps(t) + '\n')
            
    print(f"\n[SUCCESS] Scaled dataset written to {args.output} for human review. Total new tasks: {len(all_scaled_tasks)}")

if __name__ == "__main__":
    main()
