# Model Card Standard

Every formal base model release from Oja AI Research (e.g., `OjaLM-0.1 Alpha`, `OjaLM-8B`) MUST include a `README.md` formatted exactly like this Model Card on the HuggingFace Hub.

---

# [Model Name] (e.g., OjaLM-0.1 Alpha)

## Model Details
- **Base Model:** [Candidate Model Name, e.g., AfriqueQwen, Qwen3-8B]
- **Architecture:** [e.g., Transformer, Qwen Dense]
- **Parameters:** [e.g., 8B]
- **Method:** [e.g., QLoRA]
- **Framework:** [e.g., Unsloth]
- **License:** [e.g., Apache 2.0 / Llama 3 Community]

## Training Data
- **Dataset:** [e.g., OjaData v0.1]
- **Knowledge Base:** [e.g., OjaGraph v0.1]
- **Domain:** African Commerce (Food, Groceries, FMCG)

## Evaluation Results
- **Benchmark:** [e.g., ACIB Food Suite v0.1]
- **Overall Score:** [e.g., 78.4%]
*(Include breakdown of Shopping Reasoning, Negotiation, Math, etc.)*

## Supported Languages
- English
- Nigerian Pidgin
- Yoruba
- Hausa
- Igbo

## Known Capabilities
- Fluid code-switching in market negotiations.
- Accurate Tool-Calling for `<get_price>` and `<calculate_discount>`.
- Cultural alignment with informal market dynamics (haggling, seasonal availability).

## Known Limitations
- The model does NOT memorize live prices. It relies on tool-calling for real-time market data.
- Poor performance in highly specialized medical or legal commerce outside of standard retail FMCG.
- [Any region-specific failures identified in Lab C].

## Safety & Ethical Considerations
- Tuned to refuse illegal or unsafe commercial activities without being aggressively unhelpful for standard haggling.
- All training data scrubbed of PII via OjaCollect ingestion pipelines.
