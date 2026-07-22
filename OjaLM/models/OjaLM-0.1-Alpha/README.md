# OjaLM-0.1 Alpha

This is the very first, experimental fine-tuning run from Oja AI Research. 
**Note:** This model is a pipeline prototype. Its primary purpose is to validate the end-to-end ingestion, knowledge graph, synthetic generation, and training architecture (Lab A through Lab H). It is not intended for production usage.

## Model Details
- **Base Model:** unsloth/Qwen2.5-1.5B-Instruct
- **Architecture:** Qwen Dense
- **Parameters:** 1.5B
- **Method:** 4-bit QLoRA
- **Framework:** Unsloth
- **License:** Apache 2.0

## Training Data
- **Dataset:** OjaData v0.1 (100 synthetic conversational pairs)
- **Knowledge Base:** OjaGraph v0.1
- **Domain:** African Commerce (Food, Groceries, FMCG)

## Evaluation Results
- **Benchmark:** ACIB Food Suite v0.1 (Draft Phase)
- **Status:** Pipeline Validation Successful. (Adapter saved and inference runs without crashing). 
- *Detailed performance benchmarking will commence in OjaLM v0.2 after larger data ingestion.*

## Supported Languages
- English (Primary)
- Nigerian Pidgin (Emergent)
- Yoruba, Hausa, Igbo (Untested in v0.1)

## Known Capabilities
- Capable of basic tool-calling syntax (`<get_price>`).
- Can identify structured graph relationships (e.g., manufacturers of staple foods).

## Known Limitations
- The model is trained on a tiny fraction of OjaData (100 examples). It will hallucinate heavily outside of the specific Knowledge Objects ingested during Lab G.
- It is a 1.5B parameter model; complex multi-step reasoning is brittle.

## Safety & Ethical Considerations
- Tuned to refuse illegal or unsafe commercial activities without being aggressively unhelpful for standard haggling.
- All training data scrubbed of PII via OjaCollect ingestion pipelines.
