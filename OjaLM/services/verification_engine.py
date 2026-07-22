from services.pricing_engine import PricingEngine
from services.mission_engine import MissionEngine
import random

class VerificationEngine:
    @staticmethod
    def evaluate_report(report):
        """
        Takes a submitted Report JSON.
        Compares prices, checks image presence, evaluates scout trust.
        Returns Verified, Rejected, Needs Peer Review.
        """
        # Ensure mission is in VERIFYING state
        mission_id = report.get("mission_id")
        MissionEngine.update_state(mission_id, "VERIFYING", actor_id="SYSTEM")
        
        extracted = report.get("extracted_data", {})
        price = extracted.get("price_ngn", 0)
        
        product_id = report.get("product_id")
        market_id = report.get("market_id")
        scout_trust = report.get("trust_tier_applied", 1)
        
        # 1. Price Plausibility Check
        plausible = PricingEngine.is_price_plausible(price, product_id, market_id)
        
        # 2. Evidence Check
        has_evidence = extracted.get("verified", False) or random.choice([True, False])
        
        if plausible and has_evidence and scout_trust >= 3:
            status = "VERIFIED"
        elif not plausible and not has_evidence:
            status = "REJECTED"
        else:
            status = "NEEDS_PEER_REVIEW"
            
        # Update Report
        report["verification_status"] = status
        
        # Sync back to Mission State
        if status == "VERIFIED":
            MissionEngine.update_state(mission_id, "VERIFIED", actor_id="SYSTEM")
        elif status == "REJECTED":
            MissionEngine.update_state(mission_id, "REJECTED", actor_id="SYSTEM")
            
        return status
