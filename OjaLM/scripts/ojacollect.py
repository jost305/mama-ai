import argparse
import os
import json
import uuid
from datetime import datetime

# OjaCollect Trust Matrix based on OARS standard
TRUST_TIERS = {
    "government": 1,
    "manufacturers": 1,
    "retailers": 2,
    "markets": 3,
    "vendors": 3,
    "whatsapp": 4,
    "receipts": 4,
    "images": 4,
    "voice": 4
}

def ingest_raw_data(source, input_dir):
    """Placeholder for raw data ingestion logic."""
    print(f"[*] Ingesting raw data from {input_dir} (Source: {source})")
    
    trust_tier = TRUST_TIERS.get(source, 5)
    print(f"[*] Assigned Trust Tier: {trust_tier}")
    
    # Simulate processing files and generating Knowledge Objects
    if not os.path.exists(input_dir):
        print(f"[!] Warning: Input directory {input_dir} not found. Simulating...")
        
    print(f"[*] Ingestion complete.")
    
def normalize_data(input_file, output_dir):
    """Normalize raw JSON into an OjaGraph Knowledge Object."""
    print(f"[*] Normalizing {input_file} into Knowledge Objects at {output_dir}")
    os.makedirs(output_dir, exist_ok=True)
    
    if not os.path.exists(input_file):
        print(f"[!] Error: {input_file} not found.")
        return
        
    with open(input_file, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
        
    for item in raw_data.get("items", []):
        obj_id = f"product_{str(uuid.uuid4())[:8]}"
        knowledge_object = {
            "id": obj_id,
            "type": "Product",
            "name": item.get("name", "Unknown"),
            "country": item.get("country", "Nigeria"),
            "category": item.get("category", "Uncategorized"),
            "brand": item.get("brand", ""),
            "aliases": item.get("aliases", []),
            "relationships": item.get("relationships", []),
            "trust": TRUST_TIERS.get(item.get("source_type"), 5),
            "sources": [
                {
                    "name": item.get("source_name", "Unknown"),
                    "type": item.get("source_type", "unknown"),
                    "date_ingested": datetime.now().strftime("%Y-%m-%d")
                }
            ],
            "verification_status": "Pending Validation",
            "license": "CC-BY-4.0"
        }
        
        output_file = os.path.join(output_dir, f"{obj_id}.json")
        with open(output_file, 'w', encoding='utf-8') as out:
            json.dump(knowledge_object, out, indent=2)
            
        print(f"[+] Created Knowledge Object: {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OjaCollect: The Knowledge Ingestion Engine")
    subparsers = parser.add_subparsers(dest="command")
    
    # Ingest Command
    ingest_parser = subparsers.add_parser("ingest", help="Ingest raw data from a source.")
    ingest_parser.add_argument("--source", required=True, help="The knowledge source (e.g. receipts, whatsapp)")
    ingest_parser.add_argument("--dir", required=True, help="Directory containing raw data")
    
    # Normalize Command
    norm_parser = subparsers.add_parser("normalize", help="Normalize raw JSON into Knowledge Objects.")
    norm_parser.add_argument("--input", required=True, help="Raw JSON input file")
    norm_parser.add_argument("--output", required=True, help="Output directory for Knowledge Objects")
    
    args = parser.parse_args()
    
    if args.command == "ingest":
        ingest_raw_data(args.source, args.dir)
    elif args.command == "normalize":
        normalize_data(args.input, args.output)
    else:
        parser.print_help()
