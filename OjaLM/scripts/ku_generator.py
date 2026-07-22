import os
import json
import uuid

# Wave 1 Seeds
MARKETS = [
    {"name": "Balogun Market", "state": "Lagos", "specialty": "Textiles, Shoes, General Goods"},
    {"name": "Onitsha Main Market", "state": "Anambra", "specialty": "Electronics, Clothing, Groceries"},
    {"name": "Mile 12 Market", "state": "Lagos", "specialty": "Fresh Produce, Tomatoes, Peppers"},
    {"name": "Kurmi Market", "state": "Kano", "specialty": "Traditional Wares, Spices"},
    {"name": "Ariaria International Market", "state": "Abia", "specialty": "Leather goods, Shoes, Bags"}
]

BRANDS = [
    {"name": "Dangote", "category": "Sugar, Cement, Salt"},
    {"name": "BUA", "category": "Pasta, Sugar, Cement"},
    {"name": "Golden Penny", "category": "Flour, Pasta, Noodles"},
    {"name": "Honeywell", "category": "Flour, Pasta"},
    {"name": "Nestle Nigeria", "category": "Beverages, Seasoning (Maggi)"}
]

def create_ku(ku_type, data, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    obj_id = f"{ku_type}_{str(uuid.uuid4())[:8]}"
    
    ku = {
        "id": obj_id,
        "type": ku_type.capitalize(),
        "trust": 2, # High trust for this initial synthetic batch
        "license": "CC-BY-4.0"
    }
    ku.update(data)
    
    out_path = os.path.join(output_dir, f"{obj_id}.json")
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(ku, f, indent=2)
    print(f"[+] Generated {ku_type.capitalize()} KU: {data['name']}")

def main():
    print("[*] Starting KU Generator: Wave 1 (Staples & Hubs)")
    
    for m in MARKETS:
        create_ku("market", m, "datasets/ojagraph/markets")
        
    for b in BRANDS:
        create_ku("brand", b, "datasets/ojagraph/brands")

if __name__ == "__main__":
    main()
