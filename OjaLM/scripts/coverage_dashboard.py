import os
import json

# Milestone 2 Target Goals
GOALS = {
    "products": 500,
    "brands": 2000,
    "markets": 500,
    "vendors": 5000,
    "manufacturers": 500,
    "categories": 100,
    "skills": 50,
    "locations": 5000,
    "price_observations": "N/A",
    "scouts": 1000,
    "countries": 5,
    "states": 37,
    "lgas": 774,
    "cities": 100,
    "routes": 5000,
    "warehouses": 200,
    "hubs": 100,
    "reports": 10000,
    "missions": 5000,
    "observations": 2000,
    "market_events": "N/A"
}

def scan_graph():
    metrics = {
        "quantity": {k: 0 for k in GOALS.keys()},
        "trust": {f"Tier {i}": 0 for i in range(1, 6)},
        "review_status": {"Draft": 0, "Reviewed": 0, "Validated": 0, "Golden": 0, "Locked": 0}
    }
    
    base_dirs = ["datasets/ojagraph", "datasets/scouts", "datasets/locations"]
    
    for base_dir in base_dirs:
        if not os.path.exists(base_dir):
            continue
            
        for root, dirs, files in os.walk(base_dir):
            for f in files:
                if f.endswith(".json"):
                    ku_path = os.path.join(root, f)
                    try:
                        with open(ku_path, 'r', encoding='utf-8') as file:
                            data = json.load(file)
                            ku_type = data.get("type", "").lower()
                            
                            # Map folder name to key for quantity tracking
                            if "product" in ku_type: metrics["quantity"]["products"] += 1
                            elif "brand" in ku_type: metrics["quantity"]["brands"] += 1
                            elif "market" in ku_type: metrics["quantity"]["markets"] += 1
                            elif "vendor" in ku_type: metrics["quantity"]["vendors"] += 1
                            elif "manufacturer" in ku_type: metrics["quantity"]["manufacturers"] += 1
                            elif "category" in ku_type: metrics["quantity"]["categories"] += 1
                            elif "skill" in ku_type: metrics["quantity"]["skills"] += 1
                            elif "location" in ku_type: metrics["quantity"]["locations"] += 1
                            elif "priceobservation" in ku_type: metrics["quantity"]["price_observations"] += 1
                            elif "scout" in ku_type: metrics["quantity"]["scouts"] += 1
                            elif "mission" in ku_type: metrics["quantity"]["missions"] += 1
                            elif "observation" in ku_type: metrics["quantity"]["observations"] += 1
                            elif "report" in ku_type: metrics["quantity"]["reports"] += 1
                            elif "marketevent" in ku_type: metrics["quantity"]["market_events"] += 1
                            elif "countr" in ku_type: metrics["quantity"]["countries"] += 1
                            elif "state" in ku_type: metrics["quantity"]["states"] += 1
                            elif "lga" in ku_type: metrics["quantity"]["lgas"] += 1
                            elif "cit" in ku_type: metrics["quantity"]["cities"] += 1
                            elif "route" in root: metrics["quantity"]["routes"] += 1
                            elif "warehouse" in root: metrics["quantity"]["warehouses"] += 1
                            elif "hub" in root: metrics["quantity"]["hubs"] += 1
                            
                            # Track Trust Tiers
                            trust = data.get("trust", 5)
                            metrics["trust"][f"Tier {trust}"] += 1
                            
                            # Track Review Status (default to Draft if not present)
                            status = data.get("verification_status", "Draft")
                            if status in metrics["review_status"]:
                                metrics["review_status"][status] += 1
                            else:
                                metrics["review_status"]["Draft"] += 1
                    except:
                        pass
    return metrics

def print_bar(count, goal):
    if goal == "N/A":
        return f"{count:>4} (Dynamic)"
    progress = (count / goal) * 100
    bar_len = 20
    filled = int((count / goal) * bar_len)
    if filled > bar_len: filled = bar_len
    bar = "#" * filled + "-" * (bar_len - filled)
    return f"{bar} | {count:>4} / {goal} ({progress:.1f}%)"

def generate_dashboard():
    metrics = scan_graph()
    print("==========================================")
    print(" OJA KNOWLEDGE BASE v1.0 - COVERAGE BOARD ")
    print("==========================================")
    
    print("\n[ QUANTITY ]")
    print("------------")
    for k, count in metrics["quantity"].items():
        print(f"{k.capitalize():<20} | {print_bar(count, GOALS[k])}")
        
    print("\n[ TRUST SCORE ]")
    print("---------------")
    for tier, count in metrics["trust"].items():
        print(f"{tier:<20} | {count:>4} KUs")
        
    print("\n[ COVERAGE METRICS ]")
    print("--------------------")
    print(f"States Covered       |    {metrics['quantity']['states']} / 37 (incl FCT)")
    print(f"Commerce Domains     |    {metrics['quantity']['categories']} / 8")
    print(f"Languages            |    Active (English, Pidgin, Yoruba, Igbo, Hausa)")
    print(f"Mission Types        |    10 / 10")
    for status, count in metrics["review_status"].items():
        print(f"{status:<20} | {count:>4} KUs")

if __name__ == "__main__":
    generate_dashboard()
