# Model Selection Standard

Selecting the foundation base model for OjaLM is the most consequential decision in the ecosystem. To prevent subjective or hype-driven choices, any model selected to become `OjaLM-1` must formally pass this criteria checklist via the Model Selection Report.

## Definition of Done (DoD)
A model is only selected for fine-tuning when it meets the following objective thresholds:

- [ ] **ACIB Baseline Score:** Must achieve a competitive baseline score across the 5 commerce verticals before any fine-tuning.
- [ ] **Language Coverage:** Must demonstrate non-zero baseline comprehension of Nigerian Pidgin, Yoruba, Hausa, and Igbo.
- [ ] **Safety Score:** Must not suffer from excessive refusal (e.g., refusing to answer standard commerce queries due to overly aggressive alignment).
- [ ] **Licensing Compatibility:** The base model license must permit commercial use (e.g., Apache 2.0, MIT, Llama 3 Community License).
- [ ] **Hardware Feasibility:** The parameter count (e.g., 8B) must be trainable via LoRA on accessible consumer/cloud GPUs (e.g., RTX 4090 / A100).
- [ ] **Tool-Calling Capability:** Must demonstrate the intrinsic ability to emit structured `<tool_call>` tags when prompted.
- [ ] **Long-term Maintainability:** Supported by an active open-weight community with a track record of stable architectural updates.
