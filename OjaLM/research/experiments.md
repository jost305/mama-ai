# Oja AI Research - Experiment Log

This document tracks all formal training runs, evaluation campaigns, and synthetic data scaling efforts executed by Lab H (Training Operations).

## EXP-001: Pipeline Validation (OjaLM-0.1 Alpha)
**Date:** 2026-07-20  
**Lead:** Oja AI Research  

### Objective
Validate the end-to-end data ingestion, synthesis, and QLoRA fine-tuning pipeline without aiming for benchmark supremacy.

### Configuration
- **Base Model:** `unsloth/Qwen2.5-1.5B-Instruct`
- **Dataset:** `OjaData v0.1` (100 examples)
- **Framework:** `Unsloth` (4-bit QLoRA)
- **Hyperparameters:** `r=16`, `target_modules=['q_proj', 'k_proj', 'v_proj', 'o_proj']`, 1 Epoch.

### Results
- **Execution:** Successfully generated ChatML formatted dataset.
- **Training:** 1-epoch training loop completed without OOM errors.
- **Output:** LoRA adapters successfully saved to `adapters/ojalm-0.1-alpha/`.
- **Verdict:** SUCCESS. The architectural pipeline is structurally sound. We are clear to begin massive data ingestion (Lab G) and scale OjaData for v0.2.
