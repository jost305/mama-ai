# Architecture Freeze v2.1
**Date:** July 21, 2026
**Status:** FROZEN (Supersedes all previous versions)

This document is the single source of truth for the Oja AI Research project. Any architectural drift, component splitting, or re-definition is strictly forbidden. 

---

## 1. The Core Philosophy (The Moat)

The competitive advantage of this project is **NOT** a static AI model. 
The true product is the **Self-Improving Commerce Intelligence System** (The Flywheel). 

The continuous learning flywheel is the asset. OjaLM improves because MamaPrice continuously generates new proprietary commerce data, which flows through OjaCollect, OjaGraph, and OjaData before producing the next version of OjaLM.

### The Data Flywheel Architecture
```text
Foundation Model
        │
        ▼
Training
        │
        ▼
OjaLM
        │
        ▼
MamaPrice AI
        │
 ┌──────┼──────────┐
 │      │          │
 ▼      ▼          ▼

Chat  Scout   OjaGraph

 │      │          │

 ▼      ▼          ▼

Users  Reports  Knowledge

        │

        ▼

OjaData

        │

        ▼

Next OjaLM
```

---

## 2. MamaPrice: The Orchestrator

MamaPrice is the central orchestration agent. People don't use OjaLM; they use MamaPrice.

OjaLM is **only one component** within the MamaPrice ecosystem. 

```text
                MamaPrice
                     │
         ┌───────────┼────────────┐
         │           │            │
         ▼           ▼            ▼

      OjaLM     MamaPrice API   OjaGraph

         │           │            │

         ▼           ▼            ▼

      OjaCollect   Scout Engine  Dispatch
```

MamaPrice adapts its behavior dynamically based purely on the **user's intent**:
- **Consumer Flow:** MamaPrice handles the conversation, querying OjaLM for reasoning and OjaGraph for pricing knowledge.
- **Scout Flow:** MamaPrice thanks the user naturally, while simultaneously generating a structured report that is silently sent to OjaCollect.

---

## 3. The Deployment Boundary

An absolute firewall must be maintained between the Training Phase and the Deployment Phase.

```text
FOUNDATION MODEL
↓

Training Dependency Only

↓

LoRA Training

↓

Merge

↓

OjaLM-v0.1.gguf

=========================
   DEPLOYMENT BOUNDARY
=========================

Everything below this line MUST NEVER reference:
- AfriqueQwen
- Qwen
- LoRA
- Adapters
- Fine-tuning

Deployment begins at:
models/OjaLM/OjaLM-v0.1.gguf
```

**Rule:** `OjaLM-v0.1` is the deployable model artifact. The runtime never needs to know about the underlying training dependency. The deployment loads only `OjaLM-v0.1.gguf`.

---

## 4. Component Responsibilities

| Component | Responsible For | NOT Responsible For |
| :--- | :--- | :--- |
| **MamaPrice** | Orchestrating the system; serving as the UI; routing user intents to OjaLM, OjaCollect, and OjaGraph. | Extracting data itself; running inference directly. |
| **OjaLM** | The core reasoning engine. Performing conversational generation and structural extraction. | Acting as the orchestrator; accessing the internet directly. |
| **OjaCollect** | Ingesting raw JSON reports from MamaPrice, sanitizing data, scrubbing PII. | Answering user questions; talking to users. |
| **OjaGraph** | The master knowledge graph; storing structured market, price, and product data. | Training models; parsing raw WhatsApp text. |
| **OjaData** | The curated datasets used for fine-tuning the next generation of OjaLM. | Live production querying; user-facing APIs. |
