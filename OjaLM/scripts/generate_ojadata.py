import os
import json
import random

# Synthetic questions to generate training pairs from Knowledge Objects
PROMPT_TEMPLATES = [
    "What brand makes {name}?",
    "Which company manufactures {name}?",
    "Tell me about {name}.",
    "Is {name} sold in {country}?",
    "What category of food is {name}?"
]

def load_knowledge_objects(graph_dir):
    """Load all verified Knowledge Objects from OjaGraph."""
    objects = []
    if not os.path.exists(graph_dir):
        print(f"[!] Error: {graph_dir} not found.")
        return objects
        
    for filename in os.listdir(graph_dir):
        if filename.endswith(".json"):
            with open(os.path.join(graph_dir, filename), 'r', encoding='utf-8') as f:
                try:
                    obj = json.load(f)
                    if obj.get("trust", 5) <= 2: # Only use high trust objects for training
                        objects.append(obj)
                except json.JSONDecodeError:
                    print(f"[!] Failed to parse {filename}")
    return objects

def generate_conversation(obj):
    """Synthesize a ShareGPT conversational pair from a Knowledge Object."""
    template = random.choice(PROMPT_TEMPLATES)
    question = template.format(name=obj.get("name"), country=obj.get("country"))
    
    # Build a simple synthetic answer based on relationships
    brand = obj.get("brand", "Unknown")
    mfg = "Unknown"
    for rel in obj.get("relationships", []):
        if rel.get("type") == "manufactured_by":
            mfg = rel.get("target")
            
    if "brand" in question.lower() or "manufacture" in question.lower():
        answer = f"{obj.get('name')} is a {obj.get('category')} product manufactured by {mfg} under the {brand} brand."
    else:
        answer = f"Yes, {obj.get('name')} is a popular {obj.get('category')} product available in {obj.get('country')}."
        
    return {
        "conversations": [
            {"from": "user", "value": question},
            {"from": "assistant", "value": answer}
        ]
    }

def synthesize_corpus(graph_dir, output_file, num_examples=100):
    print(f"[*] Synthesizing OjaData from Knowledge Objects in {graph_dir}...")
    objects = load_knowledge_objects(graph_dir)
    
    if not objects:
        print("[!] No high-trust Knowledge Objects found. Synthesis aborted.")
        return
        
    dataset = []
    # Loop over objects to generate synthetic data up to num_examples
    # In a real scenario, we'd have hundreds of objects. Here we loop/augment.
    while len(dataset) < num_examples:
        for obj in objects:
            dataset.append(generate_conversation(obj))
            if len(dataset) >= num_examples:
                break
                
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        for item in dataset:
            f.write(json.dumps(item) + "\n")
            
    print(f"[+] Successfully synthesized {len(dataset)} examples to {output_file}.")

if __name__ == "__main__":
    GRAPH_DIR = "datasets/ojagraph/products"
    OUTPUT_FILE = "datasets/ojadata/v0.1.jsonl"
    synthesize_corpus(GRAPH_DIR, OUTPUT_FILE, 100)
