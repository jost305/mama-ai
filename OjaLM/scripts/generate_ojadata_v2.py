import json
import random
import uuid
import os
from datetime import datetime, timedelta

# ---------------------------------------------------------
# CONSTANTS & CONFIGURATION
# ---------------------------------------------------------
OUTPUT_FILE = r"C:\Users\olusegun\Desktop\mama-ai\OjaLM\datasets\ojadata\training_corpus_v2.jsonl"

SYSTEM_PROMPT = """You are MamaPrice Scout AI.

You convert WhatsApp messages from price scouts into structured OjaGraph reports.

Never summarize.

Never explain.

Output ONLY valid JSON.

Use the following schema:
{
  "report_id":"",
  "market":"",
  "state":"",
  "scout":"",
  "timestamp":"",
  "products":[
      {
        "product":"",
        "brand":"",
        "price_ngn":0,
        "unit":"",
        "confidence":0.0
      }
  ],
  "market_event":"",
  "evidence":[]
}"""

MARKETS = [
    {"market": "Mile 12", "state": "Lagos"},
    {"market": "Balogun Market", "state": "Lagos"},
    {"market": "Alaba International", "state": "Lagos"},
    {"market": "Wuse Market", "state": "Abuja"},
    {"market": "Kasuwar Kwari", "state": "Kano"},
    {"market": "Ogbete Main Market", "state": "Enugu"},
    {"market": "Onitsha Main Market", "state": "Anambra"},
    {"market": "Bodija Market", "state": "Oyo"}
]

PRODUCTS = [
    {"product": "Rice", "brands": ["Mama Gold", "Caprice", "Stallion", "Local"], "units": ["50kg bag", "derica"], "price_range": (60000, 95000)},
    {"product": "Cement", "brands": ["Dangote", "BUA", "Lafarge"], "units": ["50kg bag"], "price_range": (7500, 11000)},
    {"product": "Tomatoes", "brands": ["Fresh", "Jos", "Ogbomosho"], "units": ["small basket", "big basket"], "price_range": (2000, 15000)},
    {"product": "Garri", "brands": ["Ijebu", "White", "Yellow"], "units": ["paint bucket", "derica"], "price_range": (1500, 4500)},
    {"product": "Vegetable Oil", "brands": ["Kings", "Power Oil", "Devon"], "units": ["5 liters", "1 liter"], "price_range": (2000, 12000)}
]

SCOUTS = ["Scout_Alpha", "Oja_Watcher_1", "MarketBoy01", "IyaEleja_Scout", "Abuja_Agent_4"]

REASONS = [
    "Rain affected tomato market today",
    "Transport costs causing price jumps",
    "Fuel scarcity driving up delivery fees",
    "Dollar rate just went up, imported goods cost more",
    "Border closure affecting rice supply",
    "Festive season rush causing scarcity"
]

def generate_timestamp():
    # Random date within the last 30 days
    dt = datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")

def format_json_output(market_info, products_list, reason, scout):
    return json.dumps({
        "report_id": str(uuid.uuid4()),
        "market": market_info["market"],
        "state": market_info["state"],
        "scout": scout,
        "timestamp": generate_timestamp(),
        "products": products_list,
        "market_event": reason,
        "evidence": []
    }, indent=2)

# ---------------------------------------------------------
# GENERATOR FUNCTIONS
# ---------------------------------------------------------

def generate_whatsapp_scout():
    m = random.choice(MARKETS)
    p = random.choice(PRODUCTS)
    b = random.choice(p["brands"])
    u = random.choice(p["units"])
    price = random.randint(p["price_range"][0], p["price_range"][1])
    r = random.choice(REASONS)
    scout = random.choice(SCOUTS)

    templates = [
        f"Omo {p['product']} don cost oo. {b} now {price}. {m['market']}. {r}.",
        f"Just checked {m['market']}, {b} {p['product']} is selling for {price} per {u}. Traders are saying {r.lower()}.",
        f"Update from {m['market']}: {b} {p['product']} hit {price} naira today for {u}. {r}."
    ]
    
    input_text = random.choice(templates)
    
    prod_obj = {
        "product": p['product'],
        "brand": b,
        "price_ngn": price,
        "unit": u,
        "confidence": round(random.uniform(0.9, 0.99), 2)
    }
    
    return input_text, format_json_output(m, [prod_obj], r, scout)

def generate_voice_transcript():
    m = random.choice(MARKETS)
    p = random.choice(PRODUCTS)
    b = random.choice(p["brands"])
    u = random.choice(p["units"])
    price = random.randint(p["price_range"][0], p["price_range"][1])
    r = random.choice(REASONS)
    scout = random.choice(SCOUTS)

    templates = [
        f"Uh yeah, so I'm currently at um... {m['market']} in {m['state']}. The price of {p['product']}, specifically the {b} one, it's about {price} for a {u} right now. A lot of people are complaining because {r.lower()}.",
        f"Testing... okay. {m['market']} report. Um, {b} {p['product']} is selling for {price}. They said {r.lower()}. That's for a {u}."
    ]
    
    input_text = random.choice(templates)
    
    prod_obj = {
        "product": p['product'],
        "brand": b,
        "price_ngn": price,
        "unit": u,
        "confidence": round(random.uniform(0.8, 0.95), 2)
    }
    
    return input_text, format_json_output(m, [prod_obj], r, scout)

def generate_ocr_receipt():
    m = random.choice(MARKETS)
    p = random.choice(PRODUCTS)
    b = random.choice(p["brands"])
    u = random.choice(p["units"])
    price = random.randint(p["price_range"][0], p["price_range"][1])
    scout = random.choice(SCOUTS)

    input_text = f"""*** RECEIPT ***
{m['market'].upper()} STORES
{m['state'].upper()}
-------------------
ITEM: {b.upper()}_{p['product'].upper()}
QTY: 1 {u.upper()}
TOTAL: NGN {price}.00
-------------------
"""
    prod_obj = {
        "product": p['product'],
        "brand": b,
        "price_ngn": price,
        "unit": u,
        "confidence": 1.0
    }
    
    return input_text, format_json_output(m, [prod_obj], "OCR scan", scout)

def generate_market_observation():
    m = random.choice(MARKETS)
    p = random.choice(PRODUCTS)
    b = random.choice(p["brands"])
    u = random.choice(p["units"])
    price = random.randint(p["price_range"][0], p["price_range"][1])
    r = random.choice(REASONS)
    scout = random.choice(SCOUTS)

    input_text = f"Market observation log: Visiting {m['market']} in {m['state']} today. The market is very crowded. Noticed that {b} {p['product']} ({u}) has stabilized at {price} NGN. Main market driver currently is: {r.lower()}."
    
    prod_obj = {
        "product": p['product'],
        "brand": b,
        "price_ngn": price,
        "unit": u,
        "confidence": round(random.uniform(0.95, 0.99), 2)
    }
    
    return input_text, format_json_output(m, [prod_obj], r, scout)

def generate_negotiation_transcript():
    m = random.choice(MARKETS)
    p = random.choice(PRODUCTS)
    b = random.choice(p["brands"])
    u = random.choice(p["units"])
    price = random.randint(p["price_range"][0], p["price_range"][1])
    scout = random.choice(SCOUTS)

    input_text = f"""Buyer: How much for this {b} {p['product']}?
Seller: Ah, for the {u}, it is {price + 1000} naira.
Buyer: No now, that is too expensive. I will pay {price - 1000}.
Seller: Last price is {price}. {random.choice(REASONS)}.
Buyer: Okay, I will take it for {price} at this {m['market']}.
"""
    
    prod_obj = {
        "product": p['product'],
        "brand": b,
        "price_ngn": price,
        "unit": u,
        "confidence": round(random.uniform(0.85, 0.92), 2)
    }
    
    return input_text, format_json_output(m, [prod_obj], "Negotiation observed", scout)

# ---------------------------------------------------------
# MAIN GENERATION LOOP
# ---------------------------------------------------------
def main():
    print(f"Generating OjaData v2 Dataset...")
    dataset = []
    
    generators = [
        generate_whatsapp_scout,
        generate_voice_transcript,
        generate_ocr_receipt,
        generate_market_observation,
        generate_negotiation_transcript
    ]
    
    # 200 total examples (40 per category)
    total_examples = 200
    per_category = total_examples // len(generators)
    
    for gen_func in generators:
        for _ in range(per_category):
            user_text, assistant_json = gen_func()
            
            conversation = {
                "conversations": [
                    {
                        "from": "system",
                        "value": SYSTEM_PROMPT
                    },
                    {
                        "from": "human",
                        "value": user_text
                    },
                    {
                        "from": "gpt",
                        "value": assistant_json
                    }
                ]
            }
            dataset.append(conversation)
            
    # Shuffle the dataset
    random.shuffle(dataset)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # Write to JSONL
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        for record in dataset:
            f.write(json.dumps(record) + '\n')
            
    print(f"Successfully generated {len(dataset)} strict OjaGraph examples!")
    print(f"Saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
