# Benchmark Standard (ACIB)

The African Commerce Intelligence Benchmark (ACIB) is the pristine evaluation asset of Oja AI Research. It must never be compromised or contaminated by training data.

## Definition of Done (DoD)
A benchmark version (e.g., v0.1) is only considered **DONE** and ready for official evaluation when it meets the following criteria:

- [ ] **100 Locked Tasks:** The benchmark must contain at least 100 fully independent, schema-compliant reasoning tasks.
- [ ] **All Language Variants Reviewed:** Every task must have its linguistic variants (`en`, `pcm`, `yo`, `ha`, `ig`) manually reviewed for cultural accuracy and natural code-switching.
- [ ] **No Schema Violations:** The JSONL must pass automated schema validation.
- [ ] **Golden Examples Complete:** The reference examples must be extracted and approved.
- [ ] **Technical Report Complete:** A formal technical report detailing the benchmark methodology must be published.
- [ ] **Dataset Card Published:** A formal HuggingFace Dataset Card must be generated explaining the evaluation dimensions.
