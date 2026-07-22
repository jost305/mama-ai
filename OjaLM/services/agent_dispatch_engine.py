import os
import json
import random
from services.location_engine import LocationEngine

class AgentDispatchEngine:
    """
    AgentDispatchEngine: Assigns human Agent contributors to Market Missions.
    Agents are human commerce contributors (NOT AI entities).
    """

    @staticmethod
    def _load_all_agents():
        agents = []
        profile_dir = "datasets/agents/profiles"
        if not os.path.exists(profile_dir):
            return agents
        for f in os.listdir(profile_dir):
            if f.endswith('.json'):
                with open(os.path.join(profile_dir, f), 'r', encoding='utf-8') as file:
                    agents.append(json.load(file))
        return agents

    @staticmethod
    def _load_market(market_id):
        mkt_path = f"datasets/ojagraph/static/markets/{market_id}.json"
        if os.path.exists(mkt_path):
            with open(mkt_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None

    @staticmethod
    def rank_eligible_agents(mission):
        """
        Ranks human Agents based on:
        - Location proximity (state match)
        - Trust Tier
        - Domain DNA Match (e.g. Food mission goes to Food-specialist Agent)
        """
        agents = AgentDispatchEngine._load_all_agents()
        market = AgentDispatchEngine._load_market(mission.get('target_market_id'))

        if not market:
            return []

        eligible = []
        for agent in agents:
            # Geographic matching by state
            if agent.get("state") == market.get("state"):
                score = agent.get("trust_tier", 1) * 10
                # Domain DNA Match bonus
                if agent.get("dna") in mission.get("mission_type", ""):
                    score += 20

                eligible.append((score, agent))

        # Sort by score descending
        eligible.sort(key=lambda x: x[0], reverse=True)
        return [a[1] for a in eligible]

    @staticmethod
    def calculate_bounty(mission_type, distance_km, base_rate=300):
        """Calculate Agent bounty: ₦50 per km + base rate."""
        bounty = base_rate + (distance_km * 50)
        return int(bounty)

    @staticmethod
    def dispatch_mission(mission):
        """
        Dispatch a mission to the best eligible Agent contributor.
        Returns the selected Agent profile or None if no eligible agents exist.
        """
        ranked_agents = AgentDispatchEngine.rank_eligible_agents(mission)
        if not ranked_agents:
            return None

        best_agent = ranked_agents[0]
        # Calculate distance
        dist = LocationEngine.calculate_distance("Agent", "Market")
        mission["reward_ngn"] = AgentDispatchEngine.calculate_bounty(mission["mission_type"], dist)

        # Dispatch returns the chosen human Agent
        return best_agent
