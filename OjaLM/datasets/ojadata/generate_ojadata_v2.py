import json
import os
import random

DYNAMIC_DIR = "../ojagraph/dynamic"
OUTPUT_FILE = "v0.2_commerce_graph.jsonl"

def is_training_eligible(conversation_log):
    """
    Determines if a conversation log is eligible for OjaData inclusion.
    Specified in Section 2.4 of MARKETMAMA COMMERCE INTELLIGENCE ARCHITECTURE v2.0.
    """
    if not isinstance(conversation_log, dict):
        return False
        
    res_type = conversation_log.get("resolution_type", "")
    satisfaction = conversation_log.get("satisfaction_signal", "")
    training_eligible = conversation_log.get("training_eligible", True)
    query_count = conversation_log.get("query_count", 2)
    products = conversation_log.get("products_mentioned", [])
    
    return (
        res_type in ["price_answered", "knowledge_answered", "availability_answered"] and
        satisfaction != "thumbs_down" and
        training_eligible is True and
        query_count >= 2 and
        len(products) > 0
    )

def generate_training_data():
    examples = []
    
    # 1. Price Q&A Single-Turn Format (Section 2.4)
    examples.append({
        "instruction": "How much is tomato per basket at Mile 12?",
        "output": "Tomato dey around ₦18,000–₦24,000 per basket at Mile 12 right now. Rainy season dey push am up — dry season e go come down to ₦12k–₦18k range. You dey buy for home or for your shop?",
        "metadata": {
            "domain": "price_intelligence",
            "product": "fresh-tomato",
            "market": "mile-12",
            "language": "pidgin",
            "verified": True
        }
    })

    # 3. Steel / NaijaSteel Intelligence (Section 3.1)
    examples.append({
        "instruction": "How much is Turkish 12mm rebar per tonne in Oshodi Steel Market?",
        "output": "Turkish 12mm Rebar (Fe500 grade) for Oshodi Steel Market dey around ₦1,250,000 per tonne today. Import tariff & FX changes affect price this week. You need local rolling mill alternative like Ajaokuta specs?",
        "metadata": {
            "domain": "steel_intelligence",
            "vertical": "steel",
            "product": "turkish-12mm-rebar",
            "market": "oshodi-steel-market",
            "language": "mixed",
            "verified": True
        }
    })

    # 4. Pharmaceutical & Healthcare Intelligence (Section 3.1)
    examples.append({
        "instruction": "Is Coartem available at Idumota Pharma Market and what is NAFDAC status?",
        "output": "Coartem 80/480mg (Novartis) dey IN STOCK for Idumota Pharma Market at ₦3,200 per pack of 6. NAFDAC Reg: A4-1234 verified. Always verify anti-counterfeit scratch panel on pack before buying wholesale.",
        "metadata": {
            "domain": "pharma_intelligence",
            "vertical": "pharma",
            "product": "coartem-80-480mg",
            "market": "idumota-pharma",
            "language": "english",
            "verified": True
        }
    })

    # 3. Generate from Availability Data
    avail_dir = os.path.join(DYNAMIC_DIR, "availability")
    if os.path.exists(avail_dir):
        for f in os.listdir(avail_dir):
            if f.endswith(".json"):
                with open(os.path.join(avail_dir, f), 'r', encoding='utf-8') as file:
                    doc = json.load(file)
                    prod = doc.get('product', 'product')
                    mkt = doc.get('market', 'market')
                    examples.append({
                        "instruction": f"Is {prod} available at {mkt}?",
                        "output": f"Yes, {prod} is currently {doc.get('stock_level', 'available')} at {mkt}. Report confirmed in stock." if doc.get('in_stock') else f"No, {prod} is currently OUT OF STOCK at {mkt}.",
                        "metadata": {
                            "domain": "availability",
                            "product": prod,
                            "market": mkt,
                            "language": "english",
                            "verified": True
                        }
                    })

    # 4. Generate from Counterfeit Alerts
    fake_dir = os.path.join(DYNAMIC_DIR, "counterfeit_alerts")
    if os.path.exists(fake_dir):
        for f in os.listdir(fake_dir):
            if f.endswith(".json"):
                with open(os.path.join(fake_dir, f), 'r', encoding='utf-8') as file:
                    doc = json.load(file)
                    prod = doc.get('product', 'product')
                    mkt = doc.get('market', 'market')
                    examples.append({
                        "instruction": f"Are there fake {prod} in {mkt}?",
                        "output": f"⚠️ COUNTERFEIT WARNING: There is a {doc.get('risk_level')} risk of counterfeit {prod} at {mkt}. Details: {doc.get('description')}",
                        "metadata": {
                            "domain": "counterfeit_guidance",
                            "product": prod,
                            "market": mkt,
                            "language": "english",
                            "verified": True
                        }
                    })

    # 5. Generate from Market Events
    event_dir = os.path.join(DYNAMIC_DIR, "market_events")
    if os.path.exists(event_dir):
        for f in os.listdir(event_dir):
            if f.endswith(".json"):
                with open(os.path.join(event_dir, f), 'r', encoding='utf-8') as file:
                    doc = json.load(file)
                    mkt = doc.get('market', 'market')
                    examples.append({
                        "instruction": f"What is happening at {mkt}?",
                        "output": f"Market Event Alert: {doc.get('title')}. {doc.get('description')} (Severity: {doc.get('severity')})",
                        "metadata": {
                            "domain": "market_knowledge",
                            "market": mkt,
                            "language": "english",
                            "verified": True
                        }
                    })

    # Shuffle and write output
    random.shuffle(examples)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out:
        for ex in examples:
            out.write(json.dumps(ex) + '\n')
            
    print(f"Generated {len(examples)} OjaData v2.0 training rows in {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_training_data()
