import os
import json
import uuid
import random

SCOUTS = [
    {"name": "Adekunle T.", "state": "Lagos", "lga": "Lagos Island", "market": "Balogun", "langs": ["English", "Yoruba", "Pidgin"], "level": "Master Scout", "spec": "Food Scout"},
    {"name": "Ngozi O.", "state": "Anambra", "lga": "Onitsha North", "market": "Onitsha Main", "langs": ["English", "Igbo", "Pidgin"], "level": "Diamond", "spec": "Electronics Scout"},
    {"name": "Ibrahim M.", "state": "Kano", "lga": "Kano Municipal", "market": "Kurmi", "langs": ["English", "Hausa", "Arabic"], "level": "Elite", "spec": "Agriculture Scout"},
    {"name": "Chidinma U.", "state": "Abia", "lga": "Aba North", "market": "Ariaria", "langs": ["English", "Igbo"], "level": "Silver", "spec": "Fashion Scout"},
    {"name": "Oluwaseun A.", "state": "Lagos", "lga": "Kosofe", "market": "Mile 12", "langs": ["Yoruba", "Pidgin"], "level": "Bronze", "spec": "Food Scout"},
    {"name": "Femi K.", "state": "Oyo", "lga": "Ibadan North", "market": "Bodija", "langs": ["Yoruba", "English"], "level": "Gold", "spec": "Pharmacy Scout"}
]

def generate_scouts():
    print("[*] Generating MamaPrice Scouts with Split Economy & DNA...")
    output_dir = "datasets/scouts"
    os.makedirs(output_dir, exist_ok=True)
    
    for s in SCOUTS:
        scout_id = f"scout_{str(uuid.uuid4())[:8]}"
        
        # Determine metrics based on level
        is_high_tier = s["level"] in ["Diamond", "Elite", "Master Scout"]
        
        scout_ku = {
            "id": scout_id,
            "type": "Scout",
            "name": s["name"],
            "languages": s["langs"],
            "geography": {
                "country": "Nigeria",
                "state": s["state"],
                "lga": s["lga"],
                "home_market": s["market"],
                "gps": f"{random.uniform(4.0, 14.0):.4f}, {random.uniform(2.0, 14.0):.4f}"
            },
            "scout_dna": {
                "specialization": s["spec"],
                "negotiation_style": random.choice(["Aggressive", "Friendly", "Passive"]),
                "fast_reporter": is_high_tier,
                "image_quality": round(random.uniform(0.8, 1.0), 2),
                "fraud_probability": round(random.uniform(0.01, 0.05) if is_high_tier else random.uniform(0.05, 0.20), 2),
                "typical_working_hours": "08:00 - 16:00",
                "travel_radius_km": random.randint(5, 20)
            },
            "reputation": {
                "trust_score": random.choice([1, 2]) if is_high_tier else random.choice([3, 4, 5]),
                "verification_status": "Verified",
                "activity_score": random.randint(80, 100) if is_high_tier else random.randint(30, 79),
                "accuracy": round(random.uniform(0.95, 0.99) if is_high_tier else random.uniform(0.70, 0.94), 2),
                "dispute_count": random.randint(0, 5)
            },
            "performance": {
                "experience": f"{random.randint(2, 5)} years" if is_high_tier else "1 year",
                "average_submissions_day": random.randint(30, 100) if is_high_tier else random.randint(5, 29),
                "response_speed": f"{random.randint(2, 10)} mins",
                "mission_completion_rate": round(random.uniform(0.85, 0.99), 2)
            },
            "economy": {
                "level": s["level"],
                "alphapoints_reputation": random.randint(20000, 50000) if is_high_tier else random.randint(1000, 15000),
                "cash_earned_ngn": random.randint(50000, 200000) if is_high_tier else random.randint(5000, 45000),
                "badges": [f"{s['spec'].split()[0]} Expert", "Fast Responder"] if is_high_tier else []
            },
            "device_info": "Android 13"
        }
        out_path = os.path.join(output_dir, f"{scout_id}.json")
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(scout_ku, f, indent=2)
        print(f"[+] Saved Scout: {s['name']} [{s['level']}] - NGN: {scout_ku['economy']['cash_earned_ngn']} | Pts: {scout_ku['economy']['alphapoints_reputation']}")

if __name__ == "__main__":
    generate_scouts()
