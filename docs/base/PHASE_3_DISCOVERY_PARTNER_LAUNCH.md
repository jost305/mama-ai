# Phase 3 — x402 Discovery + Partner Launch Documentation

## Overview

Phase 3 transitions MamaPrice from a payment-capable prototype into an open, discoverable **AI-Agent Commerce Infrastructure** for African markets.

```text
              MAMAPRICE
                  │
        ┌─────────┴─────────┐
        │                   │
   x402 Discovery       /partners
        │                   │
        ▼                   ▼
   AI Agents           Developers
   discover us         Businesses
        │                   │
        └─────────┬─────────┘
                  ▼
          MamaPrice API
                  │
              x402/Base
                  │
                  ▼
             OjaGraph
                  │
                  ▼
                OjaLM
```

---

## 3.1 — x402 Machine-Readable Discovery Specification

MamaPrice exposes standardized discovery endpoints on its API server so autonomous AI agents, crawlers, and block explorers (like `x402scan`) can programmatically discover, inspect, and invoke the service.

### Live Production Discovery Endpoints:
- **Canonical OpenAPI 3.1 Document**: `https://api.mamaprice.shop/openapi.json` (or `https://mamaprice-api-production.up.railway.app/openapi.json`)
- **x402 Manifest**: `https://api.mamaprice.shop/.well-known/x402.json`

### Metadata Schema Summary:
- **Protocols**: `x402` (Version 2)
- **Chain**: Base
- **Currency**: USDC (6 decimals)
- **Micropayment Price**: $0.01 USDC per query
- **Security Scheme**: `x402` HTTP bearer / payload proof
- **Human Guidance (`info.x-guidance`)**: Includes 8-step machine instructions for agent discovery, payment challenge handling, and transaction replay.

### Instant 402 Challenge Enforcement:
All paid endpoints (`/api/commerce/intel`, `/api/v1/commerce/prices`, `/api/v1/commerce/actions/propose`) respond to unauthenticated probes with an instant `HTTP 402 Payment Required` JSON payload before body validation:

```json
{
  "code": "x402",
  "message": "Payment Required",
  "payment": {
    "amount": 0.01,
    "currency": "USDC",
    "network": "Base",
    "recipient": "0x0000000000000000000000000000000000000000",
    "resource": "/api/commerce/intel",
    "description": "Base x402 payment for MamaPrice commerce intelligence access."
  },
  "timestamp": "2026-08-12T09:00:00.000Z",
  "instructions": "Pay this Base x402 charge and replay the original request with proof of settlement."
}
```

---

## 3.2 — `/partners` Portal & Guided Developer Journey

The `/partners` portal on `https://www.mamaprice.shop/#partners` serves as the entry point for human developers, businesses, and AI agent operators.

### Target Audiences:
1. **For Developers**: Build AI agents and applications using African commerce intelligence.
2. **For Businesses**: Connect MamaPrice to your restaurant, marketplace, procurement system, etc.
3. **For AI Agents**: Request commerce intelligence and pay programmatically with x402 on Base.

### 6-Step Developer Onboarding Flow:
```text
1. Get API Access ➔ 2. Read Docs ➔ 3. Try Sandbox ➔ 4. Base Sepolia ➔ 5. Base Mainnet ➔ 6. Build
```

---

## 3.3 — Real Developer Onboarding & Interactive Sandbox

Developers and agent operators can test endpoints directly inside the portal before writing code:

1. **Endpoint Selection**: Toggle between `GET /api/v1/commerce/prices` and `POST /api/commerce/intel`.
2. **Query Parameters**: Test product (e.g. Rice, Tomatoes, Garri) and location (Lagos, Kano, Ibadan).
3. **x402 Proof Simulation**: Toggle simulated 0.01 USDC Base payment proof on or off to inspect both `402 Payment Required` and `200 OK` responses.
4. **Code Generators**: Copy ready-to-run snippets in **JavaScript (fetch)**, **cURL**, or **Python (requests)**.

---

## 3.4 — Reference Agent Implementations

MamaPrice publishes production-ready reference agent implementations:

### 1. FoodAgent (Restaurant Procurement AI Agent)
- **Goal**: *"Find the best current tomato price for my restaurant."*
- **Pattern**: Queries `/api/v1/commerce/prices`, receives `402`, constructs Base USDC proof, replays request, receives OjaGraph grounded price report.
- **Source File**: `OjaLM/apps/mamaprice-api/test/agents/FoodAgent.js`

### 2. MarketMonitor (Regional Wholesale Commodity Monitor)
- **Goal**: *"Monitor commodity prices across Lagos, Ibadan, and Kano."*
- **Pattern**: Loops across multiple regional markets, pays x402 per query, compiles multi-market arbitrage report.
- **Source File**: `OjaLM/apps/mamaprice-api/test/agents/MarketMonitor.js`

---

## Roadmap Progression

- **Phase 1**: x402 Commerce Intelligence API ✅
- **Phase 1.5**: Developer/Partner Portal ✅
- **Phase 2**: External AI Agents ✅
- **Phase 3**: **x402 Discovery + `/partners` + Real Developer Onboarding** ✅
- **Phase 4**: Autonomous Commerce Agents (Continuous monitoring, target price detection, automated procurement workflows)
- **Phase 5**: Agent-to-Agent Commerce / broader MamaPrice ecosystem
