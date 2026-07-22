import os

sources = {
    "markets": {
        "name": "Open Market Locations & Dynamics",
        "coverage": "Physical GPS locations, operating hours, and dominant traded goods for open markets.",
        "collection": "Manual geographic survey and API scraping (Google Maps/OSM)."
    },
    "vendors": {
        "name": "Vendor Stalls & Contacts",
        "coverage": "Profiles of physical market vendors, stall numbers, and direct contact methods.",
        "collection": "Opt-in vendor registration via the MarketMama platform."
    },
    "manufacturers": {
        "name": "FMCG Supply Chains",
        "coverage": "Product lines, bulk wholesale pricing, and distribution centers for major manufacturers.",
        "collection": "Direct B2B API integrations and PDF catalog scraping."
    },
    "government": {
        "name": "Government Regulatory & Economic Data",
        "coverage": "National Bureau of Statistics (NBS) inflation rates, NAFDAC registrations.",
        "collection": "Automated scraping of official government publications."
    },
    "imports": {
        "name": "Import Duty & Port Logistics",
        "coverage": "Customs duty rates, clearing delays, and shipping container costs.",
        "collection": "Port authority bulletins and clearing agent surveys."
    },
    "retailers": {
        "name": "Structured Supermarket Inventory",
        "coverage": "Fixed-price inventory, SKUs, and barcodes from formal supermarkets.",
        "collection": "E-commerce scraping and Point-of-Sale (POS) API partnerships."
    },
    "whatsapp": {
        "name": "Anonymized P2P Negotiations",
        "coverage": "Real-world haggling, price discovery, and conversational commerce.",
        "collection": "OjaReplay ingestion from WhatsApp Business API (strictly anonymized)."
    },
    "voice": {
        "name": "Market Accents & Voice Notes",
        "coverage": "Audio recordings of negotiations and product names in native dialects.",
        "collection": "Opt-in voice queries from the MarketMama application."
    },
    "images": {
        "name": "Product Packaging & Shelf Layouts",
        "coverage": "Visual data of local product variants, counterfeits, and packaging sizes.",
        "collection": "User-submitted photos and field agent captures."
    },
    "receipts": {
        "name": "Raw Transactional Data",
        "coverage": "Itemized proof of purchase, ground-truth pricing, and bulk discounts.",
        "collection": "OCR processing of uploaded physical receipts."
    },
    "weather": {
        "name": "Seasonal & Weather Impacts",
        "coverage": "Rainy/Dry season transitions impacting agricultural supply chains.",
        "collection": "Historical meteorological data APIs."
    },
    "fx": {
        "name": "Foreign Exchange Rates",
        "coverage": "Parallel market (black market) vs official CBN exchange rates.",
        "collection": "Daily financial API aggregation (e.g., AbokiFX equivalents)."
    }
}

template = """# {name}

## Metadata
- **Source Name:** {name}
- **License:** Oja AI Proprietary / CC-BY-4.0 (Depends on aggregation level)
- **Update Frequency:** Daily / Weekly
- **Data Quality:** High (Requires verification)

## Scope
- **Coverage:** {coverage}
- **Countries:** Nigeria (Initial), Ghana, Kenya
- **Languages:** English, Pidgin, Yoruba, Hausa, Igbo

## Acquisition Strategy
- **Collection Method:** {collection}
- **Privacy Considerations:** Strict PII scrubbing required for any user or vendor-submitted data.
- **Validation Process:** Cross-referenced against minimum 3 distinct data points before promoting to OjaGraph.
"""

os.makedirs('knowledge_sources', exist_ok=True)

for slug, data in sources.items():
    filepath = os.path.join('knowledge_sources', f"{slug}.md")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(template.format(**data))

print("Successfully generated 12 knowledge source registries.")
