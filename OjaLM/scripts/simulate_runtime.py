import os
import json
import uuid
import random
from services.dispatch_engine import DispatchEngine
from services.mission_engine import MissionEngine
from services.verification_engine import VerificationEngine
from services.reward_engine import RewardEngine
from services.graph_engine import GraphEngine

def simulate_full_lifecycle():
    print("==========================================")
    print(" OJA RUNTIME SIMULATOR v1.0")
    print("==========================================\n")
    
    # 1. Grab a target mission
    mission_dir = "datasets/scouts/missions"
    mission_files = [f for f in os.listdir(mission_dir) if f.endswith('.json')]
    if not mission_files:
        print("No missions found to simulate.")
        return
        
    target_file = random.choice(mission_files)
    with open(os.path.join(mission_dir, target_file), 'r', encoding='utf-8') as f:
        mission = json.load(f)
        
    # Reset to OPEN for simulation
    mission["status"] = "OPEN"
    mission_id = mission["id"]
    
    with open(os.path.join(mission_dir, target_file), 'w', encoding='utf-8') as f:
        json.dump(mission, f)
        
    print(f"[*] Step 1: Mission {mission_id} is OPEN.")
    
    # 2. Dispatch
    scout = DispatchEngine.dispatch_mission(mission)
    if not scout:
        print("[!] No eligible scouts found. Aborting.")
        return
        
    print(f"[*] Step 2: Dispatched to Scout '{scout['name']}' (DNA: {scout['dna']}). Bounty: NGN {mission.get('reward_ngn', 500)}.")
    
    # 3. Accept & Progress
    MissionEngine.update_state(mission_id, "ACCEPTED", actor_id=scout["id"])
    print(f"    - State Transition: -> ACCEPTED")
    MissionEngine.update_state(mission_id, "IN_PROGRESS", actor_id=scout["id"])
    print(f"    - State Transition: -> IN_PROGRESS")
    
    # 4. Scout Submits Report
    report_id = f"report_{str(uuid.uuid4())[:8]}"
    report = {
        "id": report_id,
        "type": "Report",
        "mission_id": mission_id,
        "scout_id": scout["id"],
        "product_id": mission["target_product_id"],
        "market_id": mission["target_market_id"],
        "extracted_data": {
            "price_ngn": random.randint(1500, 18000), # Plausible range
            "verified": True
        },
        "trust_tier_applied": scout.get("trust_tier", 3)
    }
    
    # Save Report
    with open(f"datasets/scouts/reports/{report_id}.json", 'w') as f:
        json.dump(report, f)
        
    MissionEngine.update_state(mission_id, "REPORT_SUBMITTED", actor_id=scout["id"])
    print(f"[*] Step 3: Scout submitted Report {report_id}.")
    print(f"    - State Transition: -> REPORT_SUBMITTED")
    
    # 5. Verification
    status = VerificationEngine.evaluate_report(report)
    print(f"[*] Step 4: Verification Engine Output -> {status}")
    
    if status == "VERIFIED":
        # Reload mission to get updated reward NGN calculated by dispatch engine
        with open(os.path.join(mission_dir, target_file), 'r', encoding='utf-8') as f:
            mission = json.load(f)
            
        # 6. Reward
        rewarded = RewardEngine.process_payout(report, mission)
        if rewarded:
            print(f"[*] Step 5: Reward Engine -> Disbursed ₦{mission.get('reward_ngn', 0)} to {scout['name']}.")
            
        # 7. Update Graph
        graphed = GraphEngine.update_knowledge_graph(report)
        if graphed:
            print(f"[*] Step 6: Graph Engine -> OjaGraph Mutated with verified price intelligence.")
            
    # Check final state
    final_mission = MissionEngine.get_mission(mission_id)
    print(f"\n[FINAL STATUS]: Mission {mission_id} is {final_mission['status']}.")
    print("==========================================")
    
if __name__ == "__main__":
    simulate_full_lifecycle()
