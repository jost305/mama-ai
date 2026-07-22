# Reproducibility Standard

Oja AI Research is built on the principle that "Trust requires verification." If a third-party researcher cannot reproduce our ACIB scores or our training runs, the research is invalid.

## Definition of Done (DoD)
A research artifact satisfies the Reproducibility Standard when:

- [ ] **ACIB Scores are Reproducible:** Anyone can clone the repository, run `python scripts/evaluate_acib.py --model [ModelName] --benchmark [Path]`, and achieve the exact scores reported in our papers.
- [ ] **OjaLM Training is Reproducible:** The exact training configs, hyperparameters, and datasets are provided (subject to PII restrictions) so that an external GPU cluster can replicate the LoRA adapter.
- [ ] **Evaluation is Open:** The full evaluation suite, including the LLM-as-a-judge prompts and scoring matrices, is open-sourced.
- [ ] **Environment is Documented:** `requirements.txt` or Dockerfiles are provided to eliminate "it works on my machine" errors.
