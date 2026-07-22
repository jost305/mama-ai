import json
import os
from services.agent_mission_engine import AgentMissionEngine


class AgentRewardEngine:
    """
    AgentRewardEngine: Disburses NGN and AlphaPoints to human Agent contributors.
    Agents are human commerce contributors who submit verified intelligence reports.
    """

    LEVEL_THRESHOLDS = {
        "Silver": 1000,
        "Gold": 5000,
        "Platinum": 10000,
        "Diamond": 15000,
        "Legend": 30000,
    }

    @staticmethod
    def process_payout(report, mission):
        """
        Disburses NGN and AlphaPoints to the Agent contributor.
        Only processes VERIFIED reports.
        """
        if report.get("verification_status") != "VERIFIED":
            return False

        agent_id = report.get("agent_id") or report.get("scout_id")  # backward compat
        reward_ngn = mission.get("reward_ngn", 500)
        reward_pts = mission.get("reward_alphapoints", 50)

        path = f"datasets/agents/profiles/{agent_id}.json"
        if not os.path.exists(path):
            return False

        with open(path, 'r', encoding='utf-8') as f:
            agent = json.load(f)

        # Initialize wallet if not exists
        if "wallet" not in agent:
            agent["wallet"] = {"ngn": 0, "alphapoints": 0}

        agent["wallet"]["ngn"] += reward_ngn
        agent["wallet"]["alphapoints"] += reward_pts

        # Update reputation level based on AlphaPoints
        alphapoints = agent["wallet"]["alphapoints"]
        for level_name, threshold in reversed(list(AgentRewardEngine.LEVEL_THRESHOLDS.items())):
            if alphapoints >= threshold:
                agent["level"] = level_name
                break

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(agent, f, indent=2)

        # Update Mission to REWARDED state
        AgentMissionEngine.update_state(mission.get("id"), "REWARDED", actor_id="SYSTEM")
        return True
