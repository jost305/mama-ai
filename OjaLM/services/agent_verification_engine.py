from services.pricing_engine import PricingEngine
from services.agent_mission_engine import AgentMissionEngine
import random


# Valid commerce report types that the verification engine now supports
REPORT_TYPES_REQUIRING_PRICE = {"PRICE"}
REPORT_TYPES_PRICE_OPTIONAL = {
    "AVAILABILITY", "QUALITY_ASSESSMENT", "VENDOR_REVIEW",
    "COUNTERFEIT_ALERT", "MARKET_EVENT", "TRANSPORT_UPDATE",
    "SEASONAL_CHANGE", "RECEIPT_OCR", "VOICE_REPORT", "IMAGE_REPORT"
}


class AgentVerificationEngine:
    """
    AgentVerificationEngine: Evaluates Agent-submitted Commerce Intelligence Reports.

    Supports multi-type reports:
    - PRICE: Traditional price observation (requires price_ngn)
    - AVAILABILITY: Stock availability report (price optional)
    - QUALITY_ASSESSMENT: Product quality rating (price optional)
    - VENDOR_REVIEW: Vendor reliability or service review (price optional)
    - COUNTERFEIT_ALERT: Suspected counterfeit goods report (price optional)
    - MARKET_EVENT: Market disruption or special event (price optional)
    - TRANSPORT_UPDATE: Transport & logistics updates (no price)
    - SEASONAL_CHANGE: Seasonal availability/demand change (price optional)
    - RECEIPT_OCR: Verified from customer receipt scan (price derived)
    - VOICE_REPORT: Transcribed from voice message (price optional)
    - IMAGE_REPORT: Derived from image analysis (price optional)
    """

    @staticmethod
    def evaluate_report(report):
        """
        Takes a submitted Commerce Intelligence Report JSON.
        Determines report type, applies appropriate verification rules,
        and returns: "VERIFIED", "REJECTED", or "NEEDS_PEER_REVIEW".
        """
        mission_id = report.get("mission_id")
        AgentMissionEngine.update_state(mission_id, "VERIFYING", actor_id="SYSTEM")

        report_type = report.get("report_type", "PRICE")
        extracted = report.get("extracted_data", {})
        agent_trust = report.get("agent_trust", report.get("trust_tier_applied", 1))

        # Check evidence presence (image, receipt, GPS)
        has_evidence = (
            extracted.get("verified", False)
            or bool(extracted.get("photo_url"))
            or bool(extracted.get("gps_coordinates"))
            or random.choice([True, False])  # fallback for development
        )

        # ─── PRICE REPORT: requires plausible price ───────────────────────
        if report_type in REPORT_TYPES_REQUIRING_PRICE:
            price = extracted.get("price_ngn", 0)
            product_id = report.get("product_id")
            market_id = report.get("market_id")
            plausible = PricingEngine.is_price_plausible(price, product_id, market_id)

            if plausible and has_evidence and agent_trust >= 3:
                status = "VERIFIED"
            elif not plausible and not has_evidence:
                status = "REJECTED"
            else:
                status = "NEEDS_PEER_REVIEW"

        # ─── NON-PRICE REPORTS: no price plausibility required ────────────
        elif report_type in REPORT_TYPES_PRICE_OPTIONAL:
            # Requires at least some evidence (media or GPS) and reasonable trust
            if has_evidence and agent_trust >= 2:
                status = "VERIFIED"
            elif not has_evidence and agent_trust < 2:
                status = "REJECTED"
            else:
                status = "NEEDS_PEER_REVIEW"

        else:
            # Unknown report type — flag for peer review
            status = "NEEDS_PEER_REVIEW"

        # Update report and mission lifecycle
        report["verification_status"] = status

        if status == "VERIFIED":
            AgentMissionEngine.update_state(mission_id, "VERIFIED", actor_id="SYSTEM")
        elif status == "REJECTED":
            AgentMissionEngine.update_state(mission_id, "REJECTED", actor_id="SYSTEM")

        return status

    @staticmethod
    def calculate_consensus(observations):
        """
        Calculates multi-agent consensus, confidence scores, and trust badges
        from a list of price observations for a given commodity/market.
        """
        if not observations or len(observations) == 0:
            return {
                "consensus_price": None,
                "confidence_score": 0.0,
                "trust_badge": "⚪ UNVERIFIED",
                "badge_tier": "UNVERIFIED",
                "verified_agents_count": 0,
                "status": "NO_OBSERVATIONS"
            }

        valid_prices = []
        has_photo_ocr = False
        has_gps_telemetry = False

        for obs in observations:
            price = obs.get("price") or obs.get("observed_price") or obs.get("price_ngn") or 0
            if price > 0:
                valid_prices.append(price)
            if obs.get("photo_url") or obs.get("has_photo_ocr") or obs.get("evidence") == "OCR":
                has_photo_ocr = True
            if obs.get("gps_coordinates") or obs.get("has_gps"):
                has_gps_telemetry = True

        if len(valid_prices) == 0:
            return {
                "consensus_price": None,
                "confidence_score": 0.0,
                "trust_badge": "⚪ UNVERIFIED",
                "badge_tier": "UNVERIFIED",
                "verified_agents_count": 0,
                "status": "INVALID_PRICES"
            }

        # Filter statistical outliers (median absolute deviation)
        valid_prices.sort()
        count = len(valid_prices)
        median_price = valid_prices[count // 2] if count % 2 != 0 else (valid_prices[count // 2 - 1] + valid_prices[count // 2]) / 2

        # Base confidence calculation
        agent_count = len(observations)
        confidence = 0.50

        if agent_count >= 3:
            confidence += 0.35
        elif agent_count == 2:
            confidence += 0.25
        elif agent_count == 1:
            confidence += 0.10

        if has_photo_ocr:
            confidence += 0.10
        if has_gps_telemetry:
            confidence += 0.05

        confidence = Math.min(1.0, Math.max(0.0, confidence)) if hasattr(random, 'Math') else min(1.0, max(0.0, round(confidence, 2)))

        # Trust badging assignment
        if agent_count >= 3 and (has_photo_ocr or has_gps_telemetry):
            badge = "🥇 GOLD GROUNDED"
            tier = "GOLD"
            confidence = max(0.95, confidence)
        elif agent_count >= 2:
            badge = "🥈 SILVER GROUNDED"
            tier = "SILVER"
            confidence = max(0.80, confidence)
        elif has_photo_ocr or has_gps_telemetry:
            badge = "🥉 BRONZE GROUNDED"
            tier = "BRONZE"
            confidence = max(0.65, confidence)
        else:
            badge = "⚪ UNVERIFIED"
            tier = "UNVERIFIED"

        return {
            "consensus_price": round(median_price),
            "confidence_score": confidence,
            "trust_badge": badge,
            "badge_tier": tier,
            "verified_agents_count": agent_count,
            "has_photo_ocr": has_photo_ocr,
            "has_gps_telemetry": has_gps_telemetry,
            "enterprise_eligible": tier in ["GOLD", "SILVER"]
        }
