"""
commerce_graph_engine.py

OjaGraph v2 — Commerce Intelligence Graph Engine (Python backend).

This module manages the lifecycle of all Commerce Intelligence Knowledge Units (KUs),
including Products, Markets, Vendors, Brands, Agents, Events, and Observations.

Unlike the legacy graph_engine.py which was price-centric, this engine treats
price as an optional attribute of an Observation, alongside availability, quality,
counterfeit status, and other commerce intelligence signals.
"""

import json
import os
from datetime import datetime
from services.agent_mission_engine import AgentMissionEngine

# Directory roots
STATIC_DIR = "datasets/ojagraph/static"
DYNAMIC_DIR = "datasets/ojagraph/dynamic"

# All supported observation types and their subdirectory
OBSERVATION_TYPE_MAP = {
    "PRICE":               "price_observations",
    "AVAILABILITY":        "availability",
    "COUNTERFEIT_ALERT":   "counterfeit_alerts",
    "MARKET_EVENT":        "market_events",
    "TRANSPORT_UPDATE":    "transport_updates",
    "VENDOR_REVIEW":       "vendor_reviews",
    "QUALITY_ASSESSMENT":  "quality_assessments",
}


class CommerceGraphEngine:
    """
    Manages the OjaGraph Commerce Knowledge Graph.

    Responsibilities:
    - Ingest verified Agent reports into the graph
    - Update static Knowledge Units (products, vendors, markets)
    - Persist dynamic Observations to appropriate folders
    - Archive completed missions

    Backward compatible: existing price reports continue to work unchanged.
    """

    # ─── Ingest Verified Agent Reports ─────────────────────────────────────────

    @staticmethod
    def update_graph(report):
        """
        Main entry point for graph updates.
        Dispatches the report to appropriate handler based on report_type.
        Returns True if update succeeded, False otherwise.
        """
        if report.get("verification_status") != "VERIFIED":
            return False

        report_type = report.get("report_type", "PRICE").upper()

        # Dispatch to type-specific handlers
        handlers = {
            "PRICE":               CommerceGraphEngine._ingest_price_observation,
            "AVAILABILITY":        CommerceGraphEngine._ingest_availability_report,
            "COUNTERFEIT_ALERT":   CommerceGraphEngine._ingest_counterfeit_alert,
            "MARKET_EVENT":        CommerceGraphEngine._ingest_market_event,
            "TRANSPORT_UPDATE":    CommerceGraphEngine._ingest_transport_update,
            "VENDOR_REVIEW":       CommerceGraphEngine._ingest_vendor_review,
            "QUALITY_ASSESSMENT":  CommerceGraphEngine._ingest_quality_assessment,
        }

        handler = handlers.get(report_type)
        if handler:
            handler(report)
        else:
            # Unknown type — save as generic observation for future processing
            CommerceGraphEngine._persist_observation("price_observations", {
                "id": report.get("id", f"unknown_{datetime.now().timestamp()}"),
                "type": "UnknownObservation",
                "raw_report": report,
                "timestamp": datetime.now().isoformat()
            })

        # Archive completed mission
        mission_id = report.get("mission_id")
        if mission_id:
            AgentMissionEngine.update_state(mission_id, "ARCHIVED", actor_id="SYSTEM")

        return True

    # ─── Price Reports (backward compatible) ────────────────────────────────────

    @staticmethod
    def _ingest_price_observation(report):
        """Update product KU with new verified price data."""
        product_id = report.get("product_id")
        market_id = report.get("market_id")
        extracted = report.get("extracted_data", {})
        price = extracted.get("price_ngn")

        # Update product static KU if it exists
        prod_path = f"{STATIC_DIR}/products/{product_id}.json"
        if os.path.exists(prod_path):
            with open(prod_path, 'r', encoding='utf-8') as f:
                product = json.load(f)

            if "pricing_history" not in product:
                product["pricing_history"] = []

            product["pricing_history"].append({
                "price_ngn": price,
                "market_id": market_id,
                "timestamp": datetime.now().isoformat(),
                "source_report_id": report.get("id"),
                "agent_id": report.get("agent_id")
            })

            # Increase confidence trust score (capped at 5)
            product["trust"] = min(5, product.get("trust", 0) + 1)

            with open(prod_path, 'w', encoding='utf-8') as f:
                json.dump(product, f, indent=2)

        # Persist dynamic observation
        observation = {
            "id": f"obs_price_{report.get('id', datetime.now().timestamp())}",
            "type": "PriceObservation",
            "product_id": product_id,
            "market_id": market_id,
            "price_ngn": price,
            "currency": extracted.get("currency", "NGN"),
            "quantity": extracted.get("quantity"),
            "agent_id": report.get("agent_id"),
            "confidence": report.get("confidence", 0.85),
            "timestamp": datetime.now().isoformat()
        }
        CommerceGraphEngine._persist_observation("price_observations", observation)

    # ─── Non-Price Report Ingestors ─────────────────────────────────────────────

    @staticmethod
    def _ingest_availability_report(report):
        extracted = report.get("extracted_data", {})
        observation = {
            "id": f"obs_avail_{report.get('id', datetime.now().timestamp())}",
            "type": "AvailabilityReport",
            "product_id": report.get("product_id"),
            "market_id": report.get("market_id"),
            "in_stock": extracted.get("in_stock", True),
            "stock_level": extracted.get("stock_level", "UNKNOWN"),
            "vendor_section": extracted.get("vendor_section"),
            "notes": extracted.get("notes"),
            "agent_id": report.get("agent_id"),
            "confidence": report.get("confidence", 0.80),
            "timestamp": datetime.now().isoformat()
        }
        CommerceGraphEngine._persist_observation("availability", observation)

    @staticmethod
    def _ingest_counterfeit_alert(report):
        extracted = report.get("extracted_data", {})
        observation = {
            "id": f"obs_counterfeit_{report.get('id', datetime.now().timestamp())}",
            "type": "CounterfeitAlert",
            "product_id": report.get("product_id"),
            "market_id": report.get("market_id"),
            "risk_level": extracted.get("risk_level", "MEDIUM"),
            "description": extracted.get("description", ""),
            "evidence_urls": extracted.get("evidence_urls", []),
            "agent_id": report.get("agent_id"),
            "confidence": report.get("confidence", 0.80),
            "timestamp": datetime.now().isoformat()
        }
        CommerceGraphEngine._persist_observation("counterfeit_alerts", observation)

    @staticmethod
    def _ingest_market_event(report):
        extracted = report.get("extracted_data", {})
        observation = {
            "id": f"obs_event_{report.get('id', datetime.now().timestamp())}",
            "type": "MarketEvent",
            "market_id": report.get("market_id"),
            "event_type": extracted.get("event_type", "GENERAL"),
            "title": extracted.get("title", "Market Update"),
            "description": extracted.get("description", ""),
            "severity": extracted.get("severity", "INFO"),
            "start_date": extracted.get("start_date", datetime.now().isoformat()),
            "end_date": extracted.get("end_date"),
            "agent_id": report.get("agent_id"),
            "confidence": report.get("confidence", 0.85),
            "timestamp": datetime.now().isoformat()
        }
        CommerceGraphEngine._persist_observation("market_events", observation)

    @staticmethod
    def _ingest_transport_update(report):
        extracted = report.get("extracted_data", {})
        observation = {
            "id": f"obs_transport_{report.get('id', datetime.now().timestamp())}",
            "type": "TransportUpdate",
            "market_id": report.get("market_id"),
            "route": extracted.get("route"),
            "disruption_type": extracted.get("disruption_type", "TRAFFIC"),
            "description": extracted.get("description", ""),
            "impact": extracted.get("impact", "MODERATE"),
            "agent_id": report.get("agent_id"),
            "confidence": report.get("confidence", 0.80),
            "timestamp": datetime.now().isoformat()
        }
        CommerceGraphEngine._persist_observation("transport_updates", observation)

    @staticmethod
    def _ingest_vendor_review(report):
        extracted = report.get("extracted_data", {})
        observation = {
            "id": f"obs_vendor_{report.get('id', datetime.now().timestamp())}",
            "type": "VendorReview",
            "vendor_id": report.get("vendor_id"),
            "market_id": report.get("market_id"),
            "rating": extracted.get("rating"),
            "reliability": extracted.get("reliability", "MEDIUM"),
            "products_sold": extracted.get("products_sold", []),
            "notes": extracted.get("notes"),
            "agent_id": report.get("agent_id"),
            "confidence": report.get("confidence", 0.80),
            "timestamp": datetime.now().isoformat()
        }
        CommerceGraphEngine._persist_observation("vendor_reviews", observation)

    @staticmethod
    def _ingest_quality_assessment(report):
        extracted = report.get("extracted_data", {})
        observation = {
            "id": f"obs_quality_{report.get('id', datetime.now().timestamp())}",
            "type": "QualityAssessment",
            "product_id": report.get("product_id"),
            "market_id": report.get("market_id"),
            "quality_rating": extracted.get("quality_rating"),
            "freshness": extracted.get("freshness"),
            "packaging_intact": extracted.get("packaging_intact"),
            "notes": extracted.get("notes"),
            "agent_id": report.get("agent_id"),
            "confidence": report.get("confidence", 0.80),
            "timestamp": datetime.now().isoformat()
        }
        CommerceGraphEngine._persist_observation("quality_assessments", observation)

    # ─── Utility ─────────────────────────────────────────────────────────────────

    # ─── Agent DNA Helper (Section 1.4) ─────────────────────────────────────────

    @staticmethod
    def build_agent_dna(agent_id, profile):
        """
        Builds a structured Agent DNA profile matching Section 1.4 of Architecture v2.0.
        """
        submitted = profile.get("completed_missions", 0) + profile.get("rejected_reports", 0)
        verified = profile.get("verified_reports", 0)
        rejected = profile.get("rejected_reports", 0)
        acceptance_rate = round(verified / max(1, submitted), 3)

        return {
            "agent_id": agent_id,
            "verification_level": profile.get("level", "starter").lower(),
            "trust_score": round(profile.get("trustTier", 1) * 0.20, 2),
            "reputation_score": round(profile.get("reputationScore", 100) / 100.0, 2),
            "expertise_tags": profile.get("domainExpertise", ["general_commerce"]),
            "markets_covered": profile.get("markets_covered", []),
            "report_stats": {
                "total_submitted": submitted,
                "total_verified": verified,
                "total_rejected": rejected,
                "total_flagged": profile.get("fraud_flags", 0),
                "acceptance_rate": acceptance_rate,
            },
            "badges": profile.get("badges", ["verified_agent"]),
            "fraud_flags": profile.get("fraud_flags", 0),
            "income_earned_naira": profile.get("wallet", {}).get("ngn", 0),
            "level": profile.get("level", "starter").lower(),
            "active": profile.get("isActive", True)
        }

    @staticmethod
    def _persist_observation(folder, observation):
        """Save an observation to the appropriate dynamic graph folder."""
        dir_path = f"{DYNAMIC_DIR}/{folder}"
        os.makedirs(dir_path, exist_ok=True)
        file_path = f"{dir_path}/{observation['id']}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(observation, f, indent=2)
