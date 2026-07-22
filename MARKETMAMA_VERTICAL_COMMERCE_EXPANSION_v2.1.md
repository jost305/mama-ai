# MARKETMAMA COMMERCE INTELLIGENCE EXPANSION
## From Price Intelligence → Vertical Commerce Intelligence

**Version:** 2.1 (Expanded Architecture)
**Status:** Approved Specification
**Owner:** MarketMama

---

# Executive Summary

MarketMama is the **Commerce Intelligence Infrastructure for Africa**.

Price is only one observable signal inside commerce. Every commerce vertical (Food, Steel/NaijaSteel, Building Materials, Pharmaceuticals, Electronics, Automotive, Agriculture, Manufacturing, Government, Education, Healthcare) plugs into the exact same intelligence engine.

---

# Core Architectural Integration

```
MarketMama Core Platform

│
├── OjaGraph (Multi-Domain Knowledge Graph & pgvector Engine)
├── OjaLM (Extensible Commerce LLM)
├── MamaPrice (Unified Intelligence App)
├── OjaData (Multi-Vertical Dataset Engine)
├── Agent Network (Universal Unified Field Scout Force)
└── Knowledge Factory (Cross-Domain Seed & Synthetic Generator)
```

### Industry Verticals Supported:
- **Food & Groceries** (Recipes, Nutrition, Seasonality, Freshness)
- **Steel & Building Materials / NaijaSteel** (Rebar 12mm/16mm, Wire Rod, Cement, Depots, Rolling Mills)
- **Pharmaceuticals** (Drug Brands, NAFDAC Warnings, Counterfeits, Generics)
- **Agriculture** (Harvests, Seeds, Fertilizers, Commodity Markets)
- **Electronics & Automotive** (SKUs, Serial/Hologram Verification, Specs)
- **Broader Intelligence Domains** (Government, Education, Healthcare, Housing, Climate, Financial)

---

# Expanded Data Schemas & Field Tags

All core tables (`knowledge_cards`, `products`, `brands`, `manufacturers`, `markets`, `agent_reports`, `supply_signals`, `price_snapshots`) carry an explicit `domain_type` or `vertical_slug` attribute:

- `domain_type` / `vertical_slug`: `"food"`, `"steel"`, `"building_materials"`, `"pharma"`, `"agri"`, `"electronics"`, `"automotive"`, `"government"`, `"education"`, `"healthcare"`.
- `specifications` (JSONB): Dynamic vertical properties (e.g. Steel grade, rebar diameter, drug NAFDAC number, cement strength rating).
