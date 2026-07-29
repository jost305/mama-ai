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

    @staticmethod
    def calculate_dynamic_reward(report=None, mission=None, agent_level=1):
        """
        Calculates itemized dynamic reward payout based on AgentOS formula:
        Payout = Base (250) + Evidence OCR + Coverage Gap + Urgency + Streak + Rank Multiplier
        """
        report = report or {}
        mission = mission or {}

        base_reward = 250
        evidence_bonus = 100 if (report.get("has_photo_ocr") or report.get("photo_url")) else 0
        gps_bonus = 50 if report.get("has_gps") else 0
        urgency_bonus = 150 if mission.get("urgencyLevel") in ["HIGH_GAP", "CRITICAL_GAP"] else 0
        
        coverage_bonus = 0
        coverage_idx = mission.get("coverageIndex", "100%")
        try:
            cov_num = int(coverage_idx.replace("%", ""))
            if cov_num < 10:
                coverage_bonus = 1200
            elif cov_num < 30:
                coverage_bonus = 500
            elif cov_num < 60:
                coverage_bonus = 200
        except ValueError:
            coverage_bonus = 0

        streak_bonus = 100 if report.get("streak_days", 0) >= 3 else 0

        subtotal = base_reward + evidence_bonus + gps_bonus + urgency_bonus + coverage_bonus + streak_bonus

        multipliers = {1: 1.0, 2: 1.2, 3: 1.5, 4: 2.0, 5: 2.5}
        multiplier = multipliers.get(agent_level, 1.0)

        final_ngn = round(subtotal * multiplier)
        final_pts = round((base_reward / 10) * multiplier)

        return {
            "base_reward": base_reward,
            "evidence_bonus": evidence_bonus,
            "gps_bonus": gps_bonus,
            "urgency_bonus": urgency_bonus,
            "coverage_gap_bonus": coverage_bonus,
            "streak_bonus": streak_bonus,
            "rank_multiplier": multiplier,
            "subtotal_ngn": subtotal,
            "final_payout_ngn": final_ngn,
            "final_market_points": final_pts
        }
