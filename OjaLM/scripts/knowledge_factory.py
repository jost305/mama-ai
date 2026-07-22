import os
import json
import uuid
import random
from datetime import datetime, timedelta

# Constants for Relational Generation
STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa",
    "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
    "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
    "Federal Capital Territory (FCT)"
]

DOMAINS = ["Food", "Fashion", "Electronics", "Agriculture", "Healthcare", "Construction", "Automotive", "Beauty"]
LANGUAGES = ["English", "Pidgin", "Yoruba", "Igbo", "Hausa"]
MISSION_TYPES = ["Price Verification", "Image Capture", "Receipt Upload", "Shelf Audit", "Counterfeit Check", "Stock Check", "Queue Length", "Distance Audit", "Vendor Verification", "Negotiation"]

# Memory Banks to store created entities for relational linking
MEMORY = {
    "states": [], "markets": [], "categories": [], "manufacturers": [], 
    "brands": [], "products": [], "skills": [], "vendors": [], "scouts": []
}

def save_ku(ku, dir_path):
    os.makedirs(dir_path, exist_ok=True)
    out_path = os.path.join(dir_path, f"{ku['id']}.json")
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(ku, f, indent=2)
    return ku

# ==========================================
# WAVE 1: GEOGRAPHY
# ==========================================
def wave_1_geography():
    print("[*] Wave 1: Generating Geography (States, FCT, Markets)...")
    for state in STATES:
        st_id = f"state_{str(uuid.uuid4())[:8]}"
        st_ku = save_ku({
            "id": st_id, "type": "State", "name": state, "country": "Nigeria",
            "trust": 5, "verification_status": "Golden"
        }, "datasets/locations/places")
        MEMORY["states"].append(st_ku)
        
        # Generate 2-3 Markets per state
        for i in range(random.randint(2, 3)):
            mkt_id = f"market_{str(uuid.uuid4())[:8]}"
            mkt_ku = save_ku({
                "id": mkt_id, "type": "Market", "name": f"{state} Central Market {i+1}", 
                "state": state, "state_id": st_id, "trust": 4, "verification_status": "Golden"
            }, "datasets/ojagraph/static/markets")
            MEMORY["markets"].append(mkt_ku)

# ==========================================
# WAVE 2: COMMERCE
# ==========================================
def wave_2_commerce():
    print("[*] Wave 2: Generating Commerce (Domains, Manufacturers, Brands, Products, Skills)...")
    
    for dom in DOMAINS:
        cat_ku = save_ku({"id": f"category_{str(uuid.uuid4())[:8]}", "type": "Category", "name": dom, "trust": 5}, "datasets/ojagraph/static/categories")
        MEMORY["categories"].append(cat_ku)
    
    # 20 Manufacturers
    for i in range(20):
        mfg_ku = save_ku({"id": f"manufacturer_{str(uuid.uuid4())[:8]}", "type": "Manufacturer", "name": f"Global {random.choice(DOMAINS)} Corp {i}", "trust": 4}, "datasets/ojagraph/static/manufacturers")
        MEMORY["manufacturers"].append(mfg_ku)
        
        # 3 Brands per Manufacturer
        for j in range(3):
            brand_ku = save_ku({"id": f"brand_{str(uuid.uuid4())[:8]}", "type": "Brand", "name": f"{mfg_ku['name']} Brand {j}", "manufacturer_id": mfg_ku['id'], "trust": 4}, "datasets/ojagraph/static/brands")
            MEMORY["brands"].append(brand_ku)
            
            # 5 Products per Brand
            for k in range(5):
                cat = random.choice(MEMORY["categories"])
                prod_ku = save_ku({"id": f"product_{str(uuid.uuid4())[:8]}", "type": "Product", "name": f"{brand_ku['name']} Item {k}", "brand_id": brand_ku['id'], "category": cat["name"], "trust": 4}, "datasets/ojagraph/static/products")
                MEMORY["products"].append(prod_ku)

    # Core Skills
    for skill in ["Bargaining", "Quality Inspection", "Counterfeit Detection", "Supply Chain Tracing", "Local Dialect Negotiation"]:
        sk_ku = save_ku({"id": f"skill_{str(uuid.uuid4())[:8]}", "type": "Skill", "name": skill, "trust": 5}, "datasets/ojagraph/static/skills")
        MEMORY["skills"].append(sk_ku)

# ==========================================
# WAVE 3: PEOPLE
# ==========================================
def wave_3_people():
    print("[*] Wave 3: Generating People (Vendors, Scouts)...")
    
    # 200 Vendors assigned to Markets
    for i in range(200):
        mkt = random.choice(MEMORY["markets"])
        cat = random.choice(MEMORY["categories"])
        ven_ku = save_ku({"id": f"vendor_{str(uuid.uuid4())[:8]}", "type": "Vendor", "name": f"Vendor {i} Enterprises", "market_id": mkt['id'], "market_name": mkt['name'], "category": cat['name'], "trust": 3}, "datasets/ojagraph/static/vendors")
        MEMORY["vendors"].append(ven_ku)
        
    # 50 Scouts
    for i in range(50):
        state = random.choice(MEMORY["states"])
        dna = random.choice(DOMAINS)
        lang = random.choice(LANGUAGES)
        scout_ku = save_ku({"id": f"scout_{str(uuid.uuid4())[:8]}", "type": "Scout", "name": f"Scout_{i}", "state": state['name'], "dna": dna, "language": lang, "trust_tier": random.randint(1, 5)}, "datasets/scouts/profiles")
        MEMORY["scouts"].append(scout_ku)

# ==========================================
# WAVE 4: ACTIVITY (SIMULATION ENGINE)
# ==========================================
def wave_4_activity():
    print("[*] Wave 4: Simulating Activity (Missions -> Reports)...")
    
    # Simulate 100 Missions closing the loop
    for i in range(100):
        m_type = random.choice(MISSION_TYPES)
        target_prod = random.choice(MEMORY["products"])
        target_mkt = random.choice(MEMORY["markets"])
        
        # 1. Create Mission
        mission_id = f"mission_{str(uuid.uuid4())[:8]}"
        mission_ku = save_ku({
            "id": mission_id, "type": "Mission", "mission_type": m_type, "target_market_id": target_mkt['id'], 
            "target_product_id": target_prod['id'], "status": "Completed"
        }, "datasets/scouts/missions")
        
        # 2. Find a Scout in the same State (Simulated Dispatch)
        scouts_in_state = [s for s in MEMORY["scouts"] if s['state'] == target_mkt['state']]
        assigned_scout = random.choice(scouts_in_state) if scouts_in_state else random.choice(MEMORY["scouts"])
        
        # 3. Generate Scout Report resolving the Mission
        report_id = f"report_{str(uuid.uuid4())[:8]}"
        report_ku = save_ku({
            "id": report_id, "type": "Report", "mission_id": mission_id, "scout_id": assigned_scout['id'],
            "market_id": target_mkt['id'], "product_id": target_prod['id'],
            "extracted_data": {"price_ngn": random.randint(500, 25000), "verified": True},
            "trust_tier_applied": assigned_scout['trust_tier']
        }, "datasets/scouts/reports")
        
        # 4. Generate random Observations (Proactive)
        if random.random() > 0.7:
            obs_id = f"observation_{str(uuid.uuid4())[:8]}"
            save_ku({
                "id": obs_id, "type": "Observation", "observation_type": "Market Event", 
                "scout_id": assigned_scout['id'], "market_id": target_mkt['id']
            }, "datasets/scouts/observations")

def main():
    print("==========================================")
    print(" OJA KNOWLEDGE FACTORY v1.0")
    print("==========================================")
    
    wave_1_geography()
    wave_2_commerce()
    wave_3_people()
    wave_4_activity()
    
    print("[*] Simulation Complete. Relational Graph established.")

if __name__ == "__main__":
    main()
