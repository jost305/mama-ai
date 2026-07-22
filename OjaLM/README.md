# Oja AI Research

> **[ARCHITECTURE FROZEN - v1.0](ARCHITECTURE_FREEZE_v1.0.md)**: The ecosystem design is complete. We are now in the Execution Phase.

Oja AI Research is the open research infrastructure for African Commerce AI. We are building the foundational datasets, benchmarks, models, and agent runtimes required to bring deeply contextual, multilingual commerce intelligence to the African continent.

## Core Principle: Persona Separation

The ecosystem serves two completely distinct personas. **Do not mix these systems.**

### Persona 1: Everyday Shoppers (The Consumers)
- **Product:** **MamaPrice** (The ChatGPT for Commerce).
- **Behavior:** They ask questions, compare products, check budgets, find routes, and negotiate.
- **Rules:** Shoppers DO NOT report prices. They only consume intelligence.

### Persona 2: Scouts (The Contributors)
- **Product:** **MamaPrice Scout** (The Data Collection Subsystem).
- **Behavior:** They deliberately register to earn bounties by verifying prices, uploading receipts, and inspecting markets.
- **Rules:** Scouts are the *only* source of ground-truth updates to the knowledge graph.

## The Knowledge Flow

```text
                     MamaPrice
           (Commerce AI Assistant)

      ┌─────────────────────────────────┐
      │                                 │
 Everyday Users                  Registered Scouts
 (Persona 1)                     (Persona 2)

      │                                 │
Conversations                   Missions
Questions                       Reports
Recommendations                 Observations
Tool Calls                      Verification

      │                                 │
      ▼                                 ▼
  OjaReplay                         OjaGraph
      │                                 │
      └──────────────┬──────────────────┘
                     │
                 OjaData
                     │
                   OjaLM
                     │
               MarketMama AI
```

## The Ecosystem
1. **[ACIB](roadmaps/acib.md)** (African Commerce Intelligence Benchmark): The pristine evaluation standard.
2. **[OjaCollect](roadmaps/ojacollect.md)** (Data Ingestion Engine): The normalization pipeline for raw commerce data.
3. **[OjaReplay](roadmaps/ojareplay.md)** (Interaction Repository): The anonymized, real-world commerce feedback loop from everyday shoppers.
4. **[OjaGraph](roadmaps/ojagraph.md)** (African Commerce Knowledge Graph): The structured commerce knowledge base built exclusively from verified Scout reports.
5. **[OjaData](roadmaps/ojadata.md)** (African Commerce Instruction Dataset): The highly-categorized training corpus (Conversation, Extraction, Tools, Reasoning).
6. **[OjaLM](roadmaps/ojalm.md)** (Commerce Foundation Models): The open-weight family of reasoning engines.
7. **[MamaPrice](roadmaps/mamaprice.md)** (Commerce AI Agent): The AI agent runtime connecting OjaLM to tools and knowledge for consumers.
8. **[MamaPrice Scout](roadmaps/mamapricescout.md)** (Contributor Network): The incentive-driven subsystem where humans gather intelligence.
9. **[MarketMama AI](roadmaps/marketmama.md)** (Commerce Operating System): The flagship user application built on top of the stack.

## The Research Flywheel (Our Moat)
Our ultimate advantage is the self-improving loop: 
*Shoppers use MamaPrice* → *OjaReplay captures interactions* → *Scouts update OjaGraph* → *OjaData improves* → *OjaLM gets smarter* → *Better MarketMama*.

## Research Standards
Read our [Manifesto](docs/manifesto.md) and adhere to our strict definitions of done (DoD) to ensure reproducibility.
