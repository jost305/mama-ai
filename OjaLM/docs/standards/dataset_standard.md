# Dataset Standard (OjaData & OjaReplay)

OjaData is the primary training corpus used to fine-tune the OjaLM foundation models. Because it ingests synthetic data and real-world interactions (OjaReplay), strict data hygiene is required.

## Definition of Done (DoD)
A training dataset release is only considered **DONE** and ready for model fine-tuning when it meets the following criteria:

- [ ] **Schema Validation Passes:** Must strictly adhere to the designated training schema (e.g., ShareGPT/Alpaca formats).
- [ ] **Licensing Reviewed:** All scraped or ingested data must be cleared of copyright violations.
- [ ] **PII Scrubbed:** Any empirical data from OjaReplay must have Personally Identifiable Information entirely removed.
- [ ] **Metadata Complete:** Source tagging and translation metadata must be fully populated.
- [ ] **Deduplicated:** Automated deduplication must be run to prevent model overfitting on redundant prompts.
- [ ] **Quality Score Threshold:** Human or LLM-as-a-Judge evaluation must verify the data meets the minimum quality threshold.
