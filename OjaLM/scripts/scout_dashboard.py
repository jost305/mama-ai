import os
import json
from collections import Counter

def scan_scouts():
    scout_dir = "datasets/scouts"
    if not os.path.exists(scout_dir):
        return []
    
    scouts = []
    for f in os.listdir(scout_dir):
        if f.endswith(".json"):
            with open(os.path.join(scout_dir, f), 'r') as file:
                try:
                    scouts.append(json.load(file))
                except:
                    pass
    return scouts

def generate_dashboard():
    print("==========================================")
    print(" MAMAPRICE SCOUT PLATFORM & ECONOMY ")
    print("==========================================")
    
    scouts = scan_scouts()
    if not scouts:
        print("[!] No scouts found in datasets/scouts/")
        return
        
    total_scouts = len(scouts)
    
    # Calculate Economy Metrics
    total_alphapoints = sum(s.get("economy", {}).get("alphapoints_reputation", 0) for s in scouts)
    total_ngn = sum(s.get("economy", {}).get("cash_earned_ngn", 0) for s in scouts)
    levels = Counter(s.get("economy", {}).get("level", "Unknown") for s in scouts)
    
    # Calculate DNA & Reputation Metrics
    specs = Counter(s.get("scout_dna", {}).get("specialization", "Unknown") for s in scouts)
    avg_accuracy = sum(s.get("reputation", {}).get("accuracy", 0) for s in scouts) / total_scouts
    total_disputes = sum(s.get("reputation", {}).get("dispute_count", 0) for s in scouts)
    avg_trust = sum(s.get("reputation", {}).get("trust_score", 5) for s in scouts) / total_scouts
    
    # Calculate Performance Metrics
    daily_subs = sum(s.get("performance", {}).get("average_submissions_day", 0) for s in scouts)
    states = Counter(s.get("geography", {}).get("state", "Unknown") for s in scouts)
    
    print(f"\n[ PLATFORM METRICS ]")
    print(f"Total Scouts:       {total_scouts}")
    print(f"Daily Submissions:  {daily_subs}/day")
    print(f"Average Accuracy:   {(avg_accuracy * 100):.1f}%")
    print(f"Average Trust Tier: {avg_trust:.1f}")
    print(f"Total Disputes:     {total_disputes}")
    
    print("\n[ CONTRIBUTOR ECONOMY ]")
    print(f"Total Cash Distributed (NGN): NGN {total_ngn:,}")
    print(f"Total AlphaPoints Earned:     {total_alphapoints:,} pts")
    for level, count in levels.most_common():
        print(f" - {level:<15} {count} scouts")
        
    print("\n[ SCOUT DNA (SPECIALIZATIONS) ]")
    for k, v in specs.most_common():
        print(f" - {k:<20} {v} scouts")

if __name__ == "__main__":
    generate_dashboard()
