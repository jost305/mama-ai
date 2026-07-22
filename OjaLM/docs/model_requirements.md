# OjaLM Model Requirements Specification (MRS)

**Version:** 1.0
**Status:** Official
**Project:** OjaLM Research

This Model Requirements Specification (MRS) acts as the contract for the OjaLM model. It defines exactly what capabilities, safety boundaries, and performance targets a model must achieve before it can officially be released as **OjaLM-1**.

---

## 1. Functional Requirements
OjaLM MUST be capable of the following out of the box:
- **Understand Commerce**: Navigate the taxonomy of African products and markets.
- **Compare Products**: Contextually weigh alternatives (e.g., Ofada vs. Parboiled rice).
- **Explain Products**: Clarify product usages, grading, and variations.
- **Recommend Products**: Factor in consumer context (budget, health, logistics) to suggest items.
- **Negotiate**: Simulate polite, culturally accurate bargaining.
- **Plan Shopping**: Budget and structure lists across complex use cases (e.g., weddings, monthly rations).
- **Reason Over Budgets**: Apply multi-step math to commerce decisions.
- **Use Tools**: Autonomously recognize when to fetch live data vs. rely on static weights.
- **Work with Knowledge Graphs**: Seamlessly ingest data from OjaGraph.
- **Support Multilingual Commerce**: Function across defined vernaculars without performance degradation.

---

## 2. Non-Functional Requirements
- **Latency Target**: < 2 seconds for initial token generation.
- **Hallucination Rate**: < 5% across commerce queries.
- **Tool Success Rate**: > 95% execution reliability when a tool is required.
- **Reasoning Accuracy**: > 85% on complex multi-step shopping logic.

---

## 3. Supported Languages
**Version 1 (OjaLM-1):**
- English
- Nigerian Pidgin
- Yoruba
- Hausa
- Igbo

**Version 2 (Future):**
- Swahili
- French
- Arabic

---

## 4. Tool Integration
OjaLM must natively support parsing and executing calls to:
- MarketMama APIs (Live Prices)
- Google Maps (Logistics & Routing)
- Weather APIs (Seasonal availability)
- Payments Infrastructure
- Vendor Search
- Product Search
- OjaGraph (Knowledge Graph)
- Live Inventory Databases

---

## 5. Modalities
**Current (OjaLM-1):**
- ✅ Text (Multilingual)

**Future (OjaLM-Vision & OjaLM-Voice):**
- Voice (Vernacular speech-to-intent)
- Vision (Product imagery, shelf scanning)
- OCR (Handwritten shopping lists, paper receipts, invoices, waybills)

---

## 6. Safety & Boundaries
OjaLM is strictly governed by these behavioral constraints:
- **Never** hallucinate prices.
- **Always** retrieve live prices via APIs/Tools.
- **Never** invent vendors or phantom marketplaces.
- **Never** invent inventory counts.
- **Never** pretend to know today's fluctuating market prices.
- **Always** cite uncertainty when live data cannot be retrieved.

---

## 7. Performance Targets
To be classified as release-ready (OjaLM-1), the model must achieve the following scores on the **African Commerce Intelligence Benchmark (ACIB)**:

- **ACIB-Core**: > 85%
- **ACIB-Agent (Tool Calling)**: > 97%
- **Negotiation Intelligence**: > 88%
- **Commerce Planning & Reasoning**: > 91%
- **Hallucination Rate**: < 3%

If a candidate model cannot hit these metrics, it remains in the research phase and will not be deployed to MarketMama AI.
