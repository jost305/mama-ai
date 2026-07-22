import os
import glob
import re
import json

KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), "..", "knowledge_sources")
OUTPUT_SQL = os.path.join(os.path.dirname(__file__), "..", "..", "market-mama-brand", "db", "migrations", "seed_knowledge_cards.sql")

def parse_md_file(file_path):
    filename = os.path.basename(file_path)
    topic = os.path.splitext(filename)[0]
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    sections = re.split(r'\n(?=##\s+)', content)
    cards = []
    
    for sec in sections:
        sec = sec.strip()
        if not sec:
            continue
        
        lines = sec.split("\n")
        title_line = lines[0].lstrip("#").strip()
        body = "\n".join(lines[1:]).strip() if len(lines) > 1 else title_line
        
        # Determine entity and card type based on topic and content
        entity_type = "market" if topic in ["markets", "vendors", "retailers"] else "product"
        if "manufacturer" in topic:
            entity_type = "brand"
        elif "fx" in topic or "government" in topic or "import" in topic:
            entity_type = "regulatory"

        card_type = "wholesale_guide"
        if "vendor" in topic or "retailer" in topic:
            card_type = "vendor_guide"
        elif "price" in title_line.lower() or "cost" in title_line.lower():
            card_type = "price_guide"
        elif "fake" in title_line.lower() or "counterfeit" in title_line.lower():
            card_type = "how_to_identify_fake"
        elif "quality" in title_line.lower():
            card_type = "quality_indicators"

        cards.append({
            "entity_type": entity_type,
            "entity_id": f"{topic}_card_{len(cards)+1}",
            "card_type": card_type,
            "title": title_line,
            "content": body if body else title_line,
            "content_pidgin": None,
            "author_type": "research",
            "verified": True
        })
    return cards

def generate_sql_seed():
    md_files = glob.glob(os.path.join(KNOWLEDGE_DIR, "*.md"))
    all_cards = []
    for f in md_files:
        all_cards.extend(parse_md_file(f))
        
    print(f"[*] Parsed {len(all_cards)} knowledge cards from {len(md_files)} knowledge sources.")

    sql_statements = [
        "-- Seed Script for knowledge_cards table --",
        "TRUNCATE TABLE knowledge_cards RESTART IDENTITY CASCADE;\n"
    ]

    # Generate dummy zero-vector of dimension 1536 for pgvector if embedding is not populated yet
    dummy_vector = "[" + ",".join(["0.0"] * 1536) + "]"

    for card in all_cards:
        clean_title = card["title"].replace("'", "''")
        clean_content = card["content"].replace("'", "''")
        
        stmt = f"""INSERT INTO knowledge_cards (entity_type, entity_id, card_type, title, content, author_type, verified, embedding) 
VALUES ('{card["entity_type"]}', '{card["entity_id"]}', '{card["card_type"]}', '{clean_title}', '{clean_content}', '{card["author_type"]}', {'TRUE' if card["verified"] else 'FALSE'}, '{dummy_vector}'::vector);"""
        sql_statements.append(stmt)

    os.makedirs(os.path.dirname(OUTPUT_SQL), exist_ok=True)
    with open(OUTPUT_SQL, "w", encoding="utf-8") as f:
        f.write("\n\n".join(sql_statements))

    print(f"[+] SQL Seed file generated at: {OUTPUT_SQL}")

if __name__ == "__main__":
    generate_sql_seed()
