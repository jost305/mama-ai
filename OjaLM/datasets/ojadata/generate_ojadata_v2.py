import json
import os
import random

DYNAMIC_DIR = "../ojagraph/dynamic"
OUTPUT_FILE = "v0.2_commerce_graph.jsonl"

def generate_training_data():
    examples = []
    
    # Generate Availability Data
    avail_dir = os.path.join(DYNAMIC_DIR, "availability")
    if os.path.exists(avail_dir):
        for f in os.listdir(avail_dir):
            if f.endswith(".json"):
                with open(os.path.join(avail_dir, f), 'r', encoding='utf-8') as file:
                    doc = json.load(file)
                    examples.append({
                        "system": "You are MamaPrice, the intelligent Commerce AI for African markets. Answer accurately based on grounded evidence.",
                        "instruction": f"Is {doc.get('product')} available at {doc.get('market')}?",
                        "output": f"Yes, {doc.get('product')} is currently {doc.get('stock_level', 'available')} at {doc.get('market')}. It was reported as in stock." if doc.get('in_stock') else f"No, {doc.get('product')} is currently OUT OF STOCK at {doc.get('market')}.",
                        "source": "availability_report"
                    })

    # Generate Counterfeit Alert Data
    fake_dir = os.path.join(DYNAMIC_DIR, "counterfeit_alerts")
    if os.path.exists(fake_dir):
        for f in os.listdir(fake_dir):
            if f.endswith(".json"):
                with open(os.path.join(fake_dir, f), 'r', encoding='utf-8') as file:
                    doc = json.load(file)
                    examples.append({
                        "system": "You are MamaPrice, the intelligent Commerce AI for African markets. Answer accurately based on grounded evidence.",
                        "instruction": f"Are there any fake {doc.get('product')} in {doc.get('market')}?",
                        "output": f"⚠️ COUNTERFEIT WARNING: There is a {doc.get('risk_level')} risk of counterfeit {doc.get('product')} at {doc.get('market')}. Details: {doc.get('description')}",
                        "source": "counterfeit_alert"
                    })

    # Generate Market Event Data
    event_dir = os.path.join(DYNAMIC_DIR, "market_events")
    if os.path.exists(event_dir):
        for f in os.listdir(event_dir):
            if f.endswith(".json"):
                with open(os.path.join(event_dir, f), 'r', encoding='utf-8') as file:
                    doc = json.load(file)
                    examples.append({
                        "system": "You are MamaPrice, the intelligent Commerce AI for African markets. Answer accurately based on grounded evidence.",
                        "instruction": f"What's happening at {doc.get('market')}?",
                        "output": f"Market Event: {doc.get('title')}. {doc.get('description')} (Severity: {doc.get('severity')})",
                        "source": "market_event"
                    })

    # Generate Vendor Review Data
    vendor_dir = os.path.join(DYNAMIC_DIR, "vendor_reviews")
    if os.path.exists(vendor_dir):
        for f in os.listdir(vendor_dir):
            if f.endswith(".json"):
                with open(os.path.join(vendor_dir, f), 'r', encoding='utf-8') as file:
                    doc = json.load(file)
                    examples.append({
                        "system": "You are MamaPrice, the intelligent Commerce AI for African markets. Answer accurately based on grounded evidence.",
                        "instruction": f"Is {doc.get('vendor_name')} a good vendor at {doc.get('market')}?",
                        "output": f"Vendor {doc.get('vendor_name')} at {doc.get('market')} has a {doc.get('rating')}/5 rating and is considered {doc.get('reliability')} reliability. {doc.get('notes', '')}",
                        "source": "vendor_review"
                    })

    # Write to JSONL
    random.shuffle(examples)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out:
        for ex in examples:
            out.write(json.dumps(ex) + '\n')
            
    print(f"Generated {len(examples)} new multi-type OjaData examples in {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_training_data()
