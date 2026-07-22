# Architecture Standard

Oja AI Research operates on a strictly versioned and disciplined architectural foundation. Constant redesigning prevents deep execution. 

## The Architectural Freeze (v0)
As of the completion of **Milestone 1 (Pipeline Validation)**, the 8-layer architecture of Oja AI Research is formally frozen.

The stack consists of:
1. **ACIB** (Evaluation)
2. **OjaCollect** (Ingestion)
3. **OjaReplay** (Feedback)
4. **OjaGraph** (Structured Knowledge)
5. **OjaData** (Training Corpus)
6. **OjaLM** (Foundation Models)
7. **MamaPrice** (Agent Runtime)
8. **MarketMama AI** (Commerce OS)

## The Golden Rule of OARS
> **No new architectural components may be introduced unless they eliminate an existing limitation that cannot be solved within the current architecture.**

Any proposed sub-system, new artifact, or pipeline restructuring must first attempt to map its logic into the existing 8 layers. Only if the current architecture fundamentally fails to support the requirement may a new layer be proposed.
