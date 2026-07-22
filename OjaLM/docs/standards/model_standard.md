# Model Standard (OjaLM Family)

The OjaLM family represents the core reasoning engines of the ecosystem. Not every training run yields a foundation model; most are simply experimental adapters.

## Definition of Done (DoD)
A model is only officially designated an **OjaLM Release** (e.g., OjaLM-1B v1.0) when it meets the following criteria:

- [ ] **MRS Requirements Satisfied:** The model must meet the functional capabilities outlined in the Model Requirements Specification.
- [ ] **ACIB ≥ Target Score:** The model must achieve a statistically significant improvement over baseline models on the pristine ACIB benchmark.
- [ ] **Hallucination Rate Below Threshold:** The model must confidently refuse to answer or output a tool-call expectation when faced with Live pricing queries rather than hallucinating.
- [ ] **Model Card Written:** A comprehensive HuggingFace Model Card detailing architecture, training data, and limitations must be published.
- [ ] **Weights Released:** The model weights (or LoRA adapters) must be publicly released (where applicable under the governance model).
