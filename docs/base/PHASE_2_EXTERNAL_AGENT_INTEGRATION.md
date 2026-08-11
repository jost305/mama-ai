# Phase 2 — External AI Agent Integration Specification

## 1. Overview & Architecture

Phase 2 proves that external software applications and autonomous AI agents (not owned or controlled by MamaPrice) can discover, pay for, and consume grounded African commerce intelligence programmatically over **x402 on Base**.

```
┌─────────────────────────────────┐
│       External AI Agent         │
│   (e.g., FoodAgent / Monitor)   │
└────────────────┬────────────────┘
                 │
                 │ 1. GET /api/v1/commerce/prices?product=tomatoes&location=Lagos
                 ▼
┌─────────────────────────────────┐
│     MamaPrice Commerce API      │
└────────────────┬────────────────┘
                 │
                 │ 2. HTTP 402 Payment Required (x402 Challenge)
                 ▼
┌─────────────────────────────────┐
│       External AI Agent         │
└────────────────┬────────────────┘
                 │
                 │ 3. Transfer 0.01 USDC on Base
                 ▼
┌─────────────────────────────────┐
│     Base Blockchain Settlement  │
└────────────────┬────────────────┘
                 │
                 │ 4. Replay Request with Transaction Hash Proof
                 ▼
┌─────────────────────────────────┐
│     MamaPrice API Verification │
└────────────────┬────────────────┘
                 │
                 │ 5. Grounded RAG Query (OjaGraph + OjaLM)
                 ▼
┌─────────────────────────────────┐
│       External AI Agent         │
│   (Receives Structured Answer)  │
└─────────────────────────────────┘
```

---

## 2. External Agent Clients

### Agent Client 1: `FoodAgent` (Restaurant Procurement AI Agent)
- **File**: `OjaLM/apps/mamaprice-api/test/agents/FoodAgent.js`
- **Use Case**: A restaurant inventory agent querying ingredient market prices for menu pricing and procurement planning.
- **Workflow**:
  1. Requests `GET /api/v1/commerce/prices?product=tomatoes&location=Lagos`
  2. Receives `HTTP 402` and parses `challenge.payment` requirements.
  3. Constructs Base USDC payment proof (`transactionHash`, `chain: "Base"`, `currency: "USDC"`, `amount: 0.01`, `method: "x402"`).
  4. Replays request and receives grounded intelligence (`response`, `grounded_by: "OjaGraph"`, `generated_by: "OjaLM"`).

### Agent Client 2: `MarketMonitor` (Multi-Market Wholesale Monitor)
- **File**: `OjaLM/apps/mamaprice-api/test/agents/MarketMonitor.js`
- **Use Case**: An autonomous wholesale trading agent monitoring price spreads across regional markets.
- **Workflow**:
  1. Executes batch market queries across Lagos (Mile 12), Ibadan (Bodija), and Kano (Dawanau).
  2. Performs individual x402 Base payment proofs for each market inquiry.
  3. Summarizes cross-regional market trends and price comparisons.

---

## 3. Developer Portal Integration & Live Demo Runner

The Developer & Partner Portal (`#page-developers`) includes interactive, runnable agent demonstrations:
- **`[Run FoodAgent Live Demo]`**: Triggers the 5-step restaurant procurement query live in the browser terminal.
- **`[Run MarketMonitor Live Demo]`**: Triggers the multi-market comparison flow and renders structured market comparison outputs.

---

## 4. Verification

Run the Phase 2 test suite:
```bash
$env:X402_TEST_ACCEPT="true"
node test/phase2-suite.js
```

Test output:
- `FoodAgent`: Initial 402 challenge parsing, payment proof construction, replay execution, grounded response validation.
- `Replay Protection`: Verification that reused agent transaction hashes are rejected with `HTTP 409 Conflict`.
- `MarketMonitor`: Multi-market batch query execution with verified Base USDC payment proofs.
