import json
import os
from datetime import datetime

class MissionEngine:
    VALID_STATES = [
        "OPEN", "ACCEPTED", "IN_PROGRESS", "REPORT_SUBMITTED", 
        "VERIFYING", "VERIFIED", "REWARDED", "ARCHIVED", "REJECTED"
    ]
    
    @staticmethod
    def get_mission(mission_id):
        path = f"datasets/scouts/missions/{mission_id}.json"
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
        
    @staticmethod
    def update_state(mission_id, new_state, actor_id=None):
        if new_state not in MissionEngine.VALID_STATES:
            raise ValueError(f"Invalid mission state transition to: {new_state}")
            
        mission = MissionEngine.get_mission(mission_id)
        if not mission:
            raise FileNotFoundError(f"Mission {mission_id} not found.")
            
        old_state = mission.get("status", "OPEN")
        mission["status"] = new_state
        mission["last_updated"] = datetime.now().isoformat()
        
        if actor_id:
            mission["assigned_scout_id"] = actor_id
            
        # Log the transition (in memory for now)
        if "lifecycle_log" not in mission:
            mission["lifecycle_log"] = []
        mission["lifecycle_log"].append({
            "from": old_state,
            "to": new_state,
            "timestamp": mission["last_updated"],
            "actor": actor_id or "SYSTEM"
        })
        
        path = f"datasets/scouts/missions/{mission_id}.json"
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(mission, f, indent=2)
            
        return mission
