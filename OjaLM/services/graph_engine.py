import json
import os
from datetime import datetime
from services.mission_engine import MissionEngine

class GraphEngine:
    @staticmethod
    def update_knowledge_graph(report):
        """
        Mutates foundational KUs with newly verified data.
        """
        if report.get("verification_status") != "VERIFIED":
            return False
            
        product_id = report.get("product_id")
        market_id = report.get("market_id")
        price = report.get("extracted_data", {}).get("price_ngn")
        
        # 1. Update Product KU
        prod_path = f"datasets/ojagraph/static/products/{product_id}.json"
        if os.path.exists(prod_path):
            with open(prod_path, 'r', encoding='utf-8') as f:
                product = json.load(f)
                
            if "pricing_history" not in product:
                product["pricing_history"] = []
                
            product["pricing_history"].append({
                "price": price,
                "market_id": market_id,
                "timestamp": datetime.now().isoformat(),
                "source_report_id": report.get("id")
            })
            
            # Increase Confidence
            product["trust"] = min(5, product.get("trust", 0) + 1)
            
            with open(prod_path, 'w', encoding='utf-8') as f:
                json.dump(product, f, indent=2)
                
        # 2. Archive Mission
        mission_id = report.get("mission_id")
        MissionEngine.update_state(mission_id, "ARCHIVED", actor_id="SYSTEM")
        
        return True
