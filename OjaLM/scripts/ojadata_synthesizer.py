import os
import json
import random

def load_json_dir(directory):
    data = []
    if not os.path.exists(directory): return data
    for f in os.listdir(directory):
        if f.endswith('.json'):
            with open(os.path.join(directory, f), 'r', encoding='utf-8') as file:
                data.append(json.load(file))
    return data

def generate_sharegpt_corpus():
    print("==========================================")
    print(" OJADATA SYNTHESIZER v1.0")
    print("==========================================\n")
    
    print("[*] Loading Knowledge Graph...")
    products = load_json_dir("datasets/ojagraph/static/products")
    markets = {m['id']: m for m in load_json_dir("datasets/ojagraph/static/markets")}
    scouts = {s['id']: s for s in load_json_dir("datasets/scouts/profiles")}
    reports = load_json_dir("datasets/scouts/reports")
    observations = load_json_dir("datasets/scouts/observations")
    
    corpus = []
    
    # 1. Price Inquiry Scenarios
    print("[*] Synthesizing Price Inquiries...")
    for prod in products:
        history = prod.get("pricing_history", [])
        if not history: continue
        
        latest = history[-1]
        market = markets.get(latest['market_id'])
        if not market: continue
        
        # User variations
        questions = [
            f"What is the current price of {prod['name']} at {market['name']}?",
            f"How much is {prod['name']} selling for in {market['name']} today?",
            f"Can you check the price of {prod['name']} in {market['state']}?"
        ]
        
        # Assistant Response
        ans = f"Based on our latest intelligence, {prod['name']} is currently selling for ₦{latest['price']} at {market['name']}. This price has a confidence tier of {prod.get('trust', 1)}/5 in the OjaGraph."
        
        corpus.append({
            "conversations": [
                {"from": "human", "value": random.choice(questions)},
                {"from": "gpt", "value": ans}
            ]
        })
        
    # 2. Trust Evaluation Scenarios
    print("[*] Synthesizing Trust & Verification logic...")
    for rep in reports:
        if rep.get("verification_status") != "VERIFIED": continue
        
        scout = scouts.get(rep["scout_id"])
        if not scout: continue
        
        questions = [
            f"How verified is the report {rep['id']}?",
            f"Can I trust the pricing data submitted by {scout['name']}?",
            f"What is the trust tier of scout {scout['name']}?"
        ]
        
        ans = f"Yes, the data is highly trusted. It was verified by {scout['name']}, who is a Tier {scout.get('trust_tier', 1)} Scout ({scout.get('level', 'Scout')}) operating in {scout.get('state', 'Nigeria')}. Their core DNA includes {scout.get('dna')}."
        
        corpus.append({
            "conversations": [
                {"from": "human", "value": random.choice(questions)},
                {"from": "gpt", "value": ans}
            ]
        })
        
    # 3. Observation / Event Scenarios
    print("[*] Synthesizing Market Events...")
    for obs in observations:
        market = markets.get(obs.get("market_id"))
        if not market: continue
        
        questions = [
            f"Are there any market events at {market['name']}?",
            f"What is happening at {market['name']} right now?",
            f"Any disruptions in {market['name']}?"
        ]
        
        ans = f"Yes, a Scout recently reported a '{obs['observation_type']}' at {market['name']}. This is currently classified as a {obs.get('impact_level', 'Medium')}-impact event."
        
        corpus.append({
            "conversations": [
                {"from": "human", "value": random.choice(questions)},
                {"from": "gpt", "value": ans}
            ]
        })
        
    # Save the corpus
    out_path = "datasets/ojadata/training_corpus.jsonl"
    with open(out_path, 'w', encoding='utf-8') as f:
        for item in corpus:
            f.write(json.dumps(item) + '\n')
            
    print(f"\n[*] Synthesized {len(corpus)} high-quality ShareGPT conversations.")
    print(f"[*] Saved to {out_path}.")
    
    # Print a sample
    print("\n[ SAMPLE CONVERSATION ]")
    sample = random.choice(corpus)["conversations"]
    print(f"Human: {sample[0]['value']}")
    print(f"GPT:   {sample[1]['value']}")
    print("==========================================")

if __name__ == "__main__":
    generate_sharegpt_corpus()
