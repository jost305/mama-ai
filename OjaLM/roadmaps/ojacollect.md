# OjaCollect Roadmap
**Data Ingestion Engine**

OjaCollect is the normalization factory of Oja AI Research. It acts as the gatekeeper for Lab G, ensuring that raw, chaotic data (receipts, WhatsApp logs, government PDFs) is validated, scored for trust, and normalized before it can ever enter OjaGraph or OjaData.

## The Ingestion Pipeline
Every piece of data must pass through this lifecycle:
1. **Source:** Originates from one of the 12 `knowledge_sources`.
2. **Collection:** Scraped, uploaded, or captured.
3. **Validation:** Cross-referenced for accuracy.
4. **Normalization:** Converted into a universal `Knowledge Object`.
5. **Annotation:** Tagged with metadata (License, Language, Region).
6. **Promotion:** Pushed to OjaGraph (structured facts) and OjaData (training pairs).

## The Trust Tiers
Not all knowledge is equal. OjaCollect classifies data to inform how much confidence OjaLM should place on a fact:
- **Tier 1 (Highest Trust):** Government statistics (NBS), manufacturers, official structured catalogs.
- **Tier 2 (High Trust):** Formal retailers, POS system APIs, distributor catalogs.
- **Tier 3 (Medium Trust):** Verified market surveys, trained field agent reports.
- **Tier 4 (Medium/Low Trust):** Community reports, user-submitted receipts (requires verification).
- **Tier 5 (Lowest Trust):** Social media, rumors, unverified WhatsApp forwards.

## Current Focus: v0.1 Architecture
- [ ] Build the normalization schema mapping raw inputs to Knowledge Objects.
- [ ] Establish automated PII scrubbers for Tier 4 (user submissions) and WhatsApp logs.

## Future Milestones
### v1.0: Multimodal Ingestion
- Native OCR and audio transcription pipelines mapping receipts and voice notes directly to Knowledge Objects without human intervention.
