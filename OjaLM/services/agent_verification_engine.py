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
