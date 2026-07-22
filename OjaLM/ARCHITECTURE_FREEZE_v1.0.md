# Architecture Freeze v1.0

**Date:** July 20, 2026  
**Status:** FROZEN  

The Oja AI Research architecture is officially frozen as of v1.0. 

## The 14-Layer Ecosystem

1. **ACIB** (Evaluation Benchmark)
2. **OjaCollect** (Ingestion Engine)
3. **Dispatch Engine** (On-Demand Routing)
4. **Missions** (Task Queue)
5. **Scouts** (Contributor Network)
6. **Reports** (Reactive Submissions)
7. **Observations** (Proactive Submissions)
8. **Verification** (AI & Human Consensus)
9. **OjaGraph** (Commerce Knowledge Graph)
10. **OjaData** (Training Dataset)
11. **OjaReplay** (Reinforcement Engine)
12. **OjaLM** (Foundation Model)
13. **MamaPrice** (AI Agent)
14. **MarketMama AI** (Commerce OS)

## Execution Focus
Future work on this repository focuses exclusively on **implementation, data acquisition, model training, evaluation, and product deployment.**

We are transitioning from the "design" phase to the "scale" phase. The competitive advantage of this platform no longer comes from inventing new layers, but from filling the existing architecture with high-quality data and shipping working software.

## Governance
From this point forward:
- No new architectural layers may be introduced.
- No core components may be renamed.
- No major logical restructuring may occur.

Any structural changes required due to unforeseen scaling bottlenecks must be submitted via a formal **Architecture Decision Record (ADR)** and are considered exceptional events.

---

### ADDENDUM 1: OjaLM Architecture & Unified Agent (Adopted Post-Freeze)
An absolute architectural hierarchy must be maintained:

```
ACIB
      │
      ▼
OjaCollect
      │
      ▼
OjaGraph
      │
      ▼
OjaData
      │
      ▼
AfriqueQwen (Base Foundation Model)
      │
      ▼
Fine-tuning (Unsloth QLoRA)
      │
      ▼
OjaLM (Our Proprietary Model)
      │
      ▼
MamaPrice AI (The Singular Agent)
      │
      ├── Consumer Chat
      ├── Scout Reporting
      ├── Tool Calling
      ├── Maps
      ├── Missions
      ├── Price Intelligence
      └── Commerce Agent
```

**Branding and Deployment:**
- **AfriqueQwen** is *only* the base foundation model used during training. It is NOT the model our application serves. The runtime should never expose AfriqueQwen as the serving model.
- **OjaLM** is our fine-tuned product. Every deployment artifact, folder, API, README, model card, and runtime must refer to OjaLM.
- **MamaPrice** is the *singular* AI Agent powered by OjaLM. There are no separate "Consumer AI" or "Scout AI" models. MamaPrice handles conversation dynamically based on user intent (reporting vs. querying), and silently emits JSON data for OjaCollect when needed.

*Note: Do not make architectural assumptions. This architecture is frozen. New code must conform to the existing architecture, not redefine it.*
