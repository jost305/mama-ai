import json
import os
from datetime import datetime


class AgentMissionEngine:
    """
    AgentMissionEngine: Manages lifecycle of Agent Missions.
    Missions are tasks assigned to human Agent contributors to gather Commerce Intelligence.
    """

    VALID_STATES = [
        "OPEN", "ACCEPTED", "IN_PROGRESS", "REPORT_SUBMITTED",
        "VERIFYING", "VERIFIED", "REWARDED", "ARCHIVED", "REJECTED"
    ]

    @staticmethod
    def get_mission(mission_id):
        path = f"datasets/agents/missions/{mission_id}.json"
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None

    @staticmethod
    def update_state(mission_id, new_state, actor_id=None):
        if new_state not in AgentMissionEngine.VALID_STATES:
            raise ValueError(f"Invalid mission state transition to: {new_state}")

        mission = AgentMissionEngine.get_mission(mission_id)
        if not mission:
            raise FileNotFoundError(f"Mission {mission_id} not found.")

        old_state = mission.get("status", "OPEN")
        mission["status"] = new_state
        mission["last_updated"] = datetime.now().isoformat()

        if actor_id:
            mission["assigned_agent_id"] = actor_id

        # Log the lifecycle transition
        if "lifecycle_log" not in mission:
            mission["lifecycle_log"] = []
        mission["lifecycle_log"].append({
            "from": old_state,
            "to": new_state,
            "timestamp": mission["last_updated"],
            "actor": actor_id or "SYSTEM"
        })

        path = f"datasets/agents/missions/{mission_id}.json"
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(mission, f, indent=2)

        return mission
