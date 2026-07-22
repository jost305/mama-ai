# Release Standard

To maintain trust with the developer and research communities, every major artifact release from Oja AI Research must be cleanly packaged and documented.

## Definition of Done (DoD)
A release is considered **DONE** when the release package includes all of the following:

- [ ] **Changelog:** A detailed, human-readable log of what changed since the last version.
- [ ] **Model/Dataset Card:** A formal HuggingFace card detailing the artifact's intended use, biases, and metrics.
- [ ] **Benchmark Results:** If a model release, the full ACIB scorecard must be published.
- [ ] **License:** An explicitly stated LICENSE file in the release package.
- [ ] **Checksums:** Cryptographic hashes (e.g., SHA-256) of the weights or dataset files to ensure integrity.
- [ ] **Version Tag:** Proper semantic versioning (e.g., `v0.1.0`) applied to the GitHub repository and HuggingFace hub.
