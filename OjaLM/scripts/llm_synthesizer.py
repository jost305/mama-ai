import os
import json
import uuid
import argparse
import urllib.request
import urllib.error

# OjaGraph Schema Templates
SCHEMAS = {
    "market": {
        "id": "market_ID",
        "type": "Market",
        "name": "Market Name",
        "state": "Nigerian State",
        "specialty": "Primary goods sold",
        "trust": 3,
        "verification_status": "Draft",
        "license": "CC-BY-4.0"
    },
    "vendor": {
        "id": "vendor_ID",
        "type": "Vendor",
        "name": "Vendor/Shop Name",
        "market": "Market Location",
        "category": "Goods Sold",
        "trust": 4,
        "verification_status": "Draft",
        "license": "CC-BY-4.0"
    }
}

def generate_prompt(ku_type, count):
    schema = json.dumps(SCHEMAS.get(ku_type, {}), indent=2)
    return (
        f"Generate a JSON array of {count} realistic, strictly formatted African commerce "
        f"Knowledge Units (KUs) for a '{ku_type}'.\n\n"
        f"You MUST output ONLY a valid JSON array. Each object MUST match this exact schema:\n{schema}\n\n"
        f"Ensure the data is hyper-realistic to Nigerian commerce. For vendors, use common naming patterns "
        f"(e.g., 'Iya Emeka Provisions', 'Chinedu Electronics')."
    )

def call_llm_api(prompt, api_key):
    """Fallback stub to call an LLM API. Replace URL/Headers with actual provider (OpenAI, Gemini)."""
    # For OjaLM infrastructure, we expect standard OpenAI compatible endpoints or local vLLM.
    # Because this is a generic synthesizer, we mock the HTTP call logic.
    print("[*] Sending prompt to LLM Endpoint...")
    
    # MOCK IMPLEMENTATION FOR SAFETY IF NO KEY IS PROVIDED
    if not api_key or api_key == "mock":
        print("[!] No API key provided. Executing mock generation for architecture validation.")
        return [
            {
                "id": f"vendor_{str(uuid.uuid4())[:8]}",
                "type": "Vendor",
                "name": "Iya Femi Provisions",
                "market": "Balogun Market",
                "category": "Groceries",
                "trust": 4,
                "verification_status": "Draft",
                "license": "CC-BY-4.0"
            }
        ]
        
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    data = json.dumps({
        "model": "gpt-4o", # Or other model
        "messages": [{"role": "system", "content": prompt}],
        "temperature": 0.7
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            content = result["choices"][0]["message"]["content"]
            # Clean up markdown code blocks if present
            if content.startswith("```json"):
                content = content[7:-3].strip()
            return json.loads(content)
    except Exception as e:
        print(f"[!] API Error: {e}")
        return []

def save_kus(kus, ku_type):
    output_dir = f"datasets/ojagraph/static/{ku_type}s"
    os.makedirs(output_dir, exist_ok=True)
    
    for ku in kus:
        # Override ID just in case the LLM hallucinated a bad one
        ku["id"] = f"{ku_type}_{str(uuid.uuid4())[:8]}"
        out_path = os.path.join(output_dir, f"{ku['id']}.json")
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(ku, f, indent=2)
        print(f"[+] Saved {ku_type.capitalize()} KU: {ku.get('name', 'Unknown')}")

def main():
    parser = argparse.ArgumentParser(description="OjaGraph LLM Synthetic Scaling Engine")
    parser.add_argument("--type", required=True, choices=["market", "vendor", "brand", "product", "skill"], help="The type of KU to generate.")
    parser.add_argument("--count", type=int, default=10, help="Number of KUs to generate in this batch.")
    
    args = parser.parse_args()
    api_key = os.environ.get("LLM_API_KEY", "mock")
    
    print("==========================================")
    print(f" LLM SYNTHESIS ENGINE - GENERATING {args.count} {args.type.upper()}S")
    print("==========================================")
    
    prompt = generate_prompt(args.type, args.count)
    kus = call_llm_api(prompt, api_key)
    
    if kus:
        save_kus(kus, args.type)
        print(f"[*] Successfully synthesized and saved {len(kus)} {args.type}s.")
        print("[*] Run 'python scripts/coverage_dashboard.py' to view updated matrix.")
    else:
        print("[!] Synthesis failed. No KUs saved.")

if __name__ == "__main__":
    main()
