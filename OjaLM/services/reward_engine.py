import json
import os
from services.mission_engine import MissionEngine

class RewardEngine:
    @staticmethod
    def process_payout(report, mission):
        """
        Disburses NGN and AlphaPoints to the Scout.
        """
        if report.get("verification_status") != "VERIFIED":
            return False
            
        scout_id = report.get("scout_id")
        reward_ngn = mission.get("reward_ngn", 500)
        reward_pts = mission.get("reward_alphapoints", 50)
        
        path = f"datasets/scouts/profiles/{scout_id}.json"
        if not os.path.exists(path):
            return False
            
        with open(path, 'r', encoding='utf-8') as f:
            scout = json.load(f)
            
        # Initialize wallets if not exist
        if "wallet" not in scout:
            scout["wallet"] = {"ngn": 0, "alphapoints": 0}
            
        scout["wallet"]["ngn"] += reward_ngn
        scout["wallet"]["alphapoints"] += reward_pts
        
        # Update Level logic
        if scout["wallet"]["alphapoints"] > 5000:
            scout["level"] = "Gold"
        if scout["wallet"]["alphapoints"] > 15000:
            scout["level"] = "Diamond"
            
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(scout, f, indent=2)
            
        # Update Mission to REWARDED
        MissionEngine.update_state(mission.get("id"), "REWARDED", actor_id="SYSTEM")
        return True
