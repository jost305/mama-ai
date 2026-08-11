# Phase 3 — Agent Monitoring & Autonomous Commerce Decisioning Specification

## 1. Executive Summary

Phase 3 transitions MamaPrice from an AI commerce query endpoint into an **Autonomous Agent Monitoring & Decision Infrastructure**. 

While Phase 2 proved:
> *"An external AI agent can ask MamaPrice and pay for the answer via x402 on Base."*

Phase 3 proves:
> *"An external AI agent can continuously use MamaPrice as an intelligence source, evaluate deterministic threshold policies on fresh commerce data, and autonomously trigger authorized commerce actions."*

```
                    ┌─────────────────────────┐
                    │      FoodAgent          │
                    │   (Procurement AI)      │
                    └────────────┬────────────┘
                                 │
                 1. Poll Intelligence (x402 / Base)
                                 ▼
                    ┌─────────────────────────┐
                    │      MamaPrice API      │
                    │    (OjaGraph + OjaLM)   │
                    └────────────┬────────────┘
                                 │
                  2. Grounded Price: ₦63,800
                                 ▼
                    ┌─────────────────────────┐
                    │    Policy Engine        │
                    │  Threshold Check: < 65k │
                    └────────────┬────────────┘
                                 │
                   3. Threshold Met? TRUE
                                 ▼
                    ┌─────────────────────────┐
                    │ Simulated Action Service│
                    │  (Base Commerce Action) │
                    └─────────────────────────┘
```

---

## 2. Phase 3 Components & Architecture

### 3.1 Autonomous Price Monitor Agent (`PriceMonitorAgent.js`)
- Periodically queries MamaPrice API (`GET /api/v1/commerce/prices` or `/api/v1/agents/monitors`).
- Pays x402 charge ($0.01 USDC on Base) per query execution when fresh intelligence is needed.
- Maintains state machine tracking historical price observations, latency, and settlement receipts.

### 3.2 Deterministic Threshold Policy Engine (`policy-engine.js`)
- Evaluates intelligence responses against strict, pre-configured rules:
  - **Product**: e.g., `Tomatoes`, `Rice`
  - **Target Location**: e.g., `Lagos (Mile 12)`
  - **Threshold Condition**: e.g., `price < 65000 NGN` or `priceDrop24h > 5%`
  - **Spending Cap**: e.g., `$100.00 USD` max per action proposal
  - **Approved Asset**: `USDC`
  - **Approved Network**: `Base`
- **Critical Security Rule**: OjaLM / LLM may *propose* an action. The Policy Engine *independently approves or rejects* the action deterministically.

### 3.3 Commerce Action / Agent-to-Agent Gateway (`action-gateway.js`)
- When a policy threshold condition evaluates to `TRUE`, the agent submits an action proposal (`POST /api/v1/commerce/actions/propose`).
- Simulates Base commerce transaction execution (order intent, recipient verification, settlement payload construction).

---

## 3. Agent Execution State Machine

```
     ┌───────────┐
     │   IDLE    │
     └─────┬─────┘
           │ Schedule Trigger / Interval
           ▼
     ┌───────────┐
     │ POLL_INTEL│ ── Requests GET /api/v1/commerce/prices
     └─────┬─────┘
           │ Receives 402 Challenge
           ▼
     ┌───────────┐
     │ PAY_X402  │ ── Pays 0.01 USDC on Base
     └─────┬─────┘
           │ Receives Verified Intelligence
           ▼
     ┌───────────┐
     │ EVAL_POLICY│ ── Compares Grounded Price vs Threshold
     └─────┬─────┘
           │
     ┌─────┴────────────────┐
     │                      │
Condition Met = FALSE    Condition Met = TRUE
     │                      │
     ▼                      ▼
┌───────────┐         ┌──────────────┐
│ LOG_SKIP  │         │ PROPOSE_ACTION│
└───────────┘         └──────┬───────┘
                             │ Policy Engine Approved
                             ▼
                      ┌──────────────┐
                      │ EXEC_ACTION  │ ── Base Commerce Transaction
                      └──────────────┘
```

---

## 4. API Endpoints Specification

### 1. `POST /api/v1/monitors` (Create Monitoring Rule)
**Request**:
```json
{
  "agentId": "agent_food_001",
  "product": "tomatoes",
  "location": "Lagos",
  "condition": {
    "field": "price",
    "operator": "LESS_THAN",
    "targetValue": 65000,
    "currency": "NGN"
  },
  "maxSpendUSD": 100.0,
  "intervalMinutes": 15
}
```
**Response**:
```json
{
  "success": true,
  "monitorId": "mon_tomatoes_lagos_65k",
  "status": "ACTIVE",
  "createdAt": "2026-08-11T18:57:00.000Z"
}
```

### 2. `POST /api/v1/commerce/actions/propose` (Propose Action)
**Request**:
```json
{
  "agentId": "agent_food_001",
  "monitorId": "mon_tomatoes_lagos_65k",
  "proposedAction": "BUY_WHOLESALE_TOMATOES",
  "groundedPrice": 63800,
  "quantity": 10,
  "unit": "baskets",
  "estimatedUSD": 45.0,
  "paymentProof": {
    "transactionHash": "0x...",
    "chain": "Base",
    "currency": "USDC",
    "amount": 0.01,
    "method": "x402"
  }
}
```
**Response**:
```json
{
  "success": true,
  "actionId": "act_891237",
  "policyEvaluation": {
    "approved": true,
    "rulesPassed": ["BELOW_THRESHOLD", "WITHIN_SPENDING_CAP", "APPROVED_ASSET_USDC"],
    "spendingCapUSD": 100.0,
    "proposedSpendUSD": 45.0
  },
  "actionStatus": "SIMULATED_SUCCESS",
  "baseTransactionPayload": {
    "network": "Base",
    "asset": "USDC",
    "recipient": "0x0000000000000000000000000000000000000000",
    "amountMicroUSDC": 45000000
  }
}
```

---

## 5. Security & Safety Boundaries

1. **LLM Non-Authority**: OjaLM or external LLMs generate suggestions or text answers; LLM outputs CANNOT directly sign or execute blockchain transactions.
2. **Deterministic Policy Check**: All action proposals pass through `policy-engine.js` strict code rules.
3. **Hard Budget Caps**: Max spend per transaction is capped (default `$100 USD`).
4. **Approved Token & Chain Filter**: Transactions restricted to `USDC` on `Base`.
5. **Kill-Switch**: Emergency flag `AGENT_KILL_SWITCH=true` halts all autonomous action proposals immediately.

---

## 6. Out of Scope for Phase 3

- Unrestricted wallet auto-signing without policy approval.
- Real mainnet fiat off-ramps or bank transfers.
- Multi-chain bridging (Ethereum, Solana, Polygon).
- Model weight re-training or modification.
