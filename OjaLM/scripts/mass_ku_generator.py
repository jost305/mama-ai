import os
import json
import uuid
import random
import argparse
from datetime import datetime, timedelta

# Context Arrays
PREFIXES = ["Iya", "Alhaji", "Chinedu", "Mama", "Oga", "Emeka", "Ngozi", "Bisi", "Sani", "Tunde"]
SUFFIXES = ["Provisions", "Enterprises", "Stores", "Global", "Ventures", "Plastics", "Electronics"]
STATES = ["Lagos", "Kano", "Abia", "Anambra", "Oyo", "Rivers", "Enugu", "Kaduna"]
MARKET_NAMES = ["Balogun", "Onitsha Main", "Ariaria", "Kurmi", "Mile 12", "Alaba", "Bodija", "Wuse"]
PRODUCT_ADJECTIVES = ["Premium", "Standard", "Local", "Imported", "Refined", "Raw", "Golden"]
CATEGORIES_LIST = ["Grains & Staples", "Electronics", "Textiles", "Building Materials", "Auto Parts", "Pharmaceuticals", "Fresh Produce", "Beverages", "Spices", "Livestock"]
MANUFACTURERS_LIST = ["Dangote Group", "BUA Group", "Flour Mills of Nigeria", "Nestle Nigeria", "Unilever Nigeria", "PZ Cussons", "Promasidor", "FrieslandCampina", "Guinness Nigeria", "Nigerian Breweries"]
BRANDS_LIST = ["Dangote", "BUA", "Golden Penny", "Honeywell", "Maggi", "Knorr", "Peak", "Three Crowns", "Milo", "Bournvita", "Indomie", "Minimie", "Onga", "Gino", "Devon King's", "Power Oil", "Ariel", "Omo"]
SKILL_NAMES = ["Bargaining", "Quality Inspection", "Counterfeit Detection", "Supply Chain Tracing", "Local Dialect Negotiation"]
MISSION_TYPES = ["Price Verification", "Image Capture", "Receipt Upload", "Shelf Audit", "Counterfeit Check", "Stock Check", "Queue Length", "Distance Audit", "Vendor Verification", "Negotiation"]

def generate_skills(count):
    kus = []
    for _ in range(count):
        ku = {
            "id": f"skill_{str(uuid.uuid4())[:8]}",
            "type": "Skill",
            "name": random.choice(SKILL_NAMES),
            "level": random.choice(["Beginner", "Intermediate", "Expert", "Master"]),
            "trust": 5,
            "verification_status": "Golden"
        }
        kus.append(ku)
    return kus

def generate_locations(count):
    kus = []
    for _ in range(count):
        ku = {
            "id": f"location_{str(uuid.uuid4())[:8]}",
            "type": "Location",
            "name": f"Lat:{random.uniform(4.0, 14.0):.4f}, Lng:{random.uniform(2.0, 15.0):.4f}",
            "state": random.choice(STATES),
            "trust": 4,
            "verification_status": "Auto Validated"
        }
        kus.append(ku)
    return kus

def generate_missions(count):
    kus = []
    for _ in range(count):
        ku = {
            "id": f"mission_{str(uuid.uuid4())[:8]}",
            "type": "Mission",
            "mission_type": random.choice(MISSION_TYPES),
            "target_market": random.choice(MARKET_NAMES),
            "target_product": random.choice(BRANDS_LIST),
            "reward_ngn": random.randint(300, 2000),
            "reward_alphapoints": random.randint(50, 200),
            "status": random.choice(["Open", "Accepted", "Completed", "Expired"]),
            "created_at": (datetime.now() - timedelta(minutes=random.randint(1, 1000))).isoformat()
        }
        kus.append(ku)
    return kus

def generate_reports(count):
    kus = []
    for _ in range(count):
        ku = {
            "id": f"report_{str(uuid.uuid4())[:8]}",
            "type": "Report",
            "mission_id": f"mission_{str(uuid.uuid4())[:8]}",
            "scout_id": f"scout_{str(uuid.uuid4())[:8]}",
            "data": {
                "price": random.randint(1000, 50000),
                "has_image": random.choice([True, False]),
                "has_receipt": random.choice([True, False])
            },
            "confidence": random.randint(60, 99),
            "verification_status": random.choice(["Pending", "Verified", "Rejected"]),
            "timestamp": (datetime.now() - timedelta(minutes=random.randint(1, 100))).isoformat()
        }
        kus.append(ku)
    return kus

def generate_observations(count):
    kus = []
    for _ in range(count):
        ku = {
            "id": f"observation_{str(uuid.uuid4())[:8]}",
            "type": "Observation",
            "observation_type": random.choice(["Price Crash", "Price Spike", "Stockout", "Flood", "Road Closure"]),
            "market": random.choice(MARKET_NAMES),
            "impact_level": random.choice(["Low", "Medium", "High", "Critical"]),
            "scout_id": f"scout_{str(uuid.uuid4())[:8]}",
            "timestamp": (datetime.now() - timedelta(minutes=random.randint(1, 100))).isoformat()
        }
        kus.append(ku)
    return kus

def generate_categories(count): return [{"id": f"category_{str(uuid.uuid4())[:8]}", "type": "Category", "name": random.choice(CATEGORIES_LIST)} for _ in range(count)]
def generate_manufacturers(count): return [{"id": f"manufacturer_{str(uuid.uuid4())[:8]}", "type": "Manufacturer", "name": random.choice(MANUFACTURERS_LIST)} for _ in range(count)]
def generate_brands(count): return [{"id": f"brand_{str(uuid.uuid4())[:8]}", "type": "Brand", "name": random.choice(BRANDS_LIST)} for _ in range(count)]
def generate_products(count): return [{"id": f"product_{str(uuid.uuid4())[:8]}", "type": "Product", "name": f"{random.choice(PRODUCT_ADJECTIVES)} Product"} for _ in range(count)]
def generate_markets(count): return [{"id": f"market_{str(uuid.uuid4())[:8]}", "type": "Market", "name": f"{random.choice(MARKET_NAMES)} Market"} for _ in range(count)]
def generate_vendors(count): return [{"id": f"vendor_{str(uuid.uuid4())[:8]}", "type": "Vendor", "name": f"{random.choice(PREFIXES)} {random.choice(SUFFIXES)}"} for _ in range(count)]

def save_kus(kus, dir_path):
    os.makedirs(dir_path, exist_ok=True)
    for ku in kus:
        out_path = os.path.join(dir_path, f"{ku['id']}.json")
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(ku, f, indent=2)

def main():
    parser = argparse.ArgumentParser(description="Mass KU Procedural Generator for Sprint 1")
    parser.add_argument("--scale", type=int, default=1, help="Scale multiplier. 10 = Final Targets.")
    args = parser.parse_args()

    print(f"[*] Starting Procedural KU Generation (Scale: {args.scale}x)...")

    targets = {
        "categories": 10 * args.scale,
        "manufacturers": 50 * args.scale,
        "brands": 200 * args.scale,
        "products": 50 * args.scale,
        "markets": 50 * args.scale,
        "vendors": 500 * args.scale,
        "skills": 5 * args.scale,
        "locations": 500 * args.scale,
        "missions": 500 * args.scale,
        "reports": 1000 * args.scale,
        "observations": 200 * args.scale
    }

    save_kus(generate_categories(targets["categories"]), "datasets/ojagraph/static/categories")
    save_kus(generate_manufacturers(targets["manufacturers"]), "datasets/ojagraph/static/manufacturers")
    save_kus(generate_brands(targets["brands"]), "datasets/ojagraph/static/brands")
    save_kus(generate_products(targets["products"]), "datasets/ojagraph/static/products")
    save_kus(generate_markets(targets["markets"]), "datasets/ojagraph/static/markets")
    save_kus(generate_vendors(targets["vendors"]), "datasets/ojagraph/static/vendors")
    save_kus(generate_skills(targets["skills"]), "datasets/ojagraph/static/skills")
    save_kus(generate_locations(targets["locations"]), "datasets/locations/places")
    save_kus(generate_missions(targets["missions"]), "datasets/scouts/missions")
    save_kus(generate_reports(targets["reports"]), "datasets/scouts/reports")
    save_kus(generate_observations(targets["observations"]), "datasets/scouts/observations")
    
    print("[*] Generation Complete.")

if __name__ == "__main__":
    main()
