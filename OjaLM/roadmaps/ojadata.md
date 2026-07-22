# OjaData Roadmap
**African Commerce Instruction Dataset**

OjaData is the primary training corpus used to fine-tune foundation models into OjaLM. It is distinct from ACIB and contains a massive blend of human-authored and synthetic commerce interactions.

## Data Separation Principle
To prevent OjaLM from confusing conversational chat with strict data extraction, the dataset is strictly separated by purpose into four pillars:

1. **`conversation/`**: Teaches MamaPrice how to converse with shoppers (e.g., shopping advice, budget planning).
2. **`extraction/`**: Teaches the system to convert unstructured Scout reports into strict `OjaGraph` JSON schemas (e.g., WhatsApp, Voice, OCR).
3. **`reasoning/`**: Teaches logic, multi-step shopping comparisons, and polite vendor negotiations.
4. **`tools/`**: Teaches the MamaPrice Agent when to trigger functions like `get_price()`, `search_vendor()`, and `calculate_distance()`.

## Current Focus: v0.1 Foundation
- [ ] Establish OjaData extraction schema (`OjaGraph Report`).
- [ ] Generate synthetic extraction data for Scouts (v0.1 complete).
- [ ] Build the conversation and tool-calling datasets for the MamaPrice consumer agent.

## Future Milestones
### v0.5: The Negotiation Corpus
- Generating tens of thousands of simulated, multi-turn market negotiations to teach the model how to politely push back on pricing.

### v1.0: Live Market Data Integration
- Integrating anonymized, real-world interactions from MarketMama users into the training pipeline (subject to Data Governance rules).
