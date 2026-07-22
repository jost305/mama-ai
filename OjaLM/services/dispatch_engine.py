import os
import json
import random
from services.location_engine import LocationEngine

class DispatchEngine:
    @staticmethod
    def _load_all_scouts():
        scouts = []
        profile_dir = "datasets/scouts/profiles"
        if not os.path.exists(profile_dir): return scouts
        for f in os.listdir(profile_dir):
            if f.endswith('.json'):
                with open(os.path.join(profile_dir, f), 'r', encoding='utf-8') as file:
                    scouts.append(json.load(file))
        return scouts

    @staticmethod
    def _load_market(market_id):
        mkt_path = f"datasets/ojagraph/static/markets/{market_id}.json"
        if os.path.exists(mkt_path):
            with open(mkt_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None

    @staticmethod
    def rank_eligible_scouts(mission):
        """
        Ranks scouts based on:
        - Location proximity
        - Trust Tier
        - DNA Match (e.g. Food mission goes to Food scout)
        """
        scouts = DispatchEngine._load_all_scouts()
        market = DispatchEngine._load_market(mission.get('target_market_id'))
        
        if not market: return []

        eligible = []
        for s in scouts:
            # Fake geographic matching by state
            if s.get("state") == market.get("state"):
                score = s.get("trust_tier", 1) * 10
                # DNA Match bonus
                if s.get("dna") in mission.get("mission_type", ""):
                    score += 20
                
                eligible.append((score, s))
                
        # Sort by score descending
        eligible.sort(key=lambda x: x[0], reverse=True)
        return [s[1] for s in eligible]

    @staticmethod
    def calculate_bounty(mission_type, distance_km, base_rate=300):
        # ₦50 per km + base rate
        bounty = base_rate + (distance_km * 50)
        return int(bounty)

    @staticmethod
    def dispatch_mission(mission):
        ranked_scouts = DispatchEngine.rank_eligible_scouts(mission)
        if not ranked_scouts:
            return None
            
        best_scout = ranked_scouts[0]
        # Calculate distance
        dist = LocationEngine.calculate_distance("Scout", "Market")
        mission["reward_ngn"] = DispatchEngine.calculate_bounty(mission["mission_type"], dist)
        
        # Dispatch returns the chosen scout
        return best_scout
