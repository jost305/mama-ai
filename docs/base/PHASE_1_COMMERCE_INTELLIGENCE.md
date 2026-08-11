# Phase 1 — MamaPrice × Base Paid Commerce Intelligence API

## 1. Architecture Overview

The MamaPrice × Base Integration Phase 1 makes MamaPrice a programmable commerce-intelligence infrastructure layer accessible to external AI agents over x402 payments on the Base blockchain network.

```
┌─────────────────────────────────┐
│     External AI Agent           │
└────────────────┬────────────────┘
                 │
                 │ 1. GET /api/v1/commerce/prices or POST /api/commerce/intel
                 ▼
┌─────────────────────────────────┐
│     MamaPrice Commerce API      │
└────────────────┬────────────────┘
                 │
                 │ 2. 402 Payment Required (x402 Challenge)
                 ▼
┌─────────────────────────────────┐
│     Base Network (USDC)        │
└────────────────┬────────────────┘
                 │
                 │ 3. Settlement & Verification (CDP / Verifier)
                 ▼
┌─────────────────────────────────┐
│     OjaGraph Evidence Engine    │
└────────────────┬────────────────┘
                 │
                 │ 4. Grounded Context Retrieval
                 ▼
┌─────────────────────────────────┐
│     OjaLM Inference Engine      │
└────────────────┬────────────────┘
                 │
                 │ 5. Grounded Intelligence Response
                 ▼
┌─────────────────────────────────┐
│     External AI Agent           │
└─────────────────────────────────┘
```

---

## 2. API Endpoints

### Endpoint 1: `GET /api/v1/commerce/prices` (Machine-Facing Endpoint)

- **Method**: `GET`
- **Query Parameters**:
  - `product` (string): Target commodity (e.g., `rice`, `tomatoes`, `garri`)
  - `location` (string): Market location (e.g., `Lagos`, `Mile 12`, `Ibadan`)
  - `prompt` (string, optional): Specific natural language question
  - `transactionHash` (string, optional): Base transaction hash proof
  - `chain` (string, optional): Network (must be `Base`)
  - `currency` (string, optional): Payment token (must be `USDC`)
  - `amount` (number, optional): Payment amount in USD (must be `0.01`)
  - `method` (string, optional): Protocol identifier (must be `x402`)

### Endpoint 2: `POST /api/commerce/intel` (JSON Protocol Endpoint)

- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "prompt": "What is the current price of 50kg rice in Lagos?",
  "paymentProof": {
    "transactionHash": "0x...",
    "chain": "Base",
    "currency": "USDC",
    "amount": 0.01,
    "method": "x402"
  }
}
```

---

## 3. x402 Flow Protocol

1. **Initial Unpaid Request**: The client requests commerce intelligence without `paymentProof`.
2. **HTTP 402 Challenge**: Server responds with status `402 Payment Required` and an x402 challenge object:
```json
{
  "code": "x402",
  "message": "Payment Required",
  "payment": {
    "amount": 0.01,
    "currency": "USDC",
    "network": "Base",
    "recipient": "0x0000000000000000000000000000000000000000",
    "resource": "/api/v1/commerce/prices",
    "description": "Base x402 payment for MamaPrice commerce intelligence access."
  },
  "timestamp": "2026-08-11T17:28:00.000Z",
  "instructions": "Pay this Base x402 charge and replay the original request with proof of settlement."
}
```
3. **Settlement**: The external AI agent transfers 0.01 USDC on Base to the recipient address.
4. **Replay Request**: The agent replays the request with `paymentProof` attached.
5. **Verification**: MamaPrice verifies the transaction with CDP / on-chain verifier.
6. **Execution**: Grounded query executes via OjaGraph + OjaLM and returns the intelligence payload.

---

## 4. Base Network Configuration

- **Chain**: Base (Mainnet / Sepolia Testnet)
- **Settlement Token**: USDC
- **Standard Unit Cost**: $0.01 USD per request
- **Payment Verification Provider**: Coinbase Developer Platform (CDP) / Local Test Verifier

---

## 5. Payment Lifecycle & Replay Protection

Each transaction hash is validated against the following criteria:
- Mandatory string format for `transactionHash`
- Network matches `Base`
- Currency matches `USDC`
- Amount matches `0.01`
- Method matches `x402`
- Replay check against `payment-ledger.json`: duplicate transaction hashes are rejected with `HTTP 409 Conflict`.

---

## 6. Response Schema

Successful Response (`HTTP 200 OK`):
```json
{
  "product": "rice",
  "location": "Lagos",
  "observations": [
    {
      "id": "doc_001",
      "commodity": "Rice (50kg)",
      "price": 72000,
      "currency": "NGN",
      "market": "Mile 12 Market",
      "location": "Lagos",
      "timestamp": "2026-08-11T12:00:00Z"
    }
  ],
  "analysis": {
    "commodity": "rice",
    "location": "Lagos",
    "priceChange24h": "+1.5%",
    "trend": "STABLE"
  },
  "grounded_by": "OjaGraph",
  "generated_by": "OjaLM",
  "response": "The current price of a 50kg bag of rice in Lagos (Mile 12 Market) is approximately ₦72,000...",
  "payment": {
    "verified": true,
    "record": {
      "transactionHash": "0x...",
      "amount": 0.01,
      "currency": "USDC",
      "chain": "Base",
      "processedAt": "2026-08-11T17:28:01.000Z"
    }
  }
}
```

---

## 7. Error Status Code Reference

| Status Code | Description | Cause |
|---|---|---|
| `400` | Bad Request | Missing required parameters (e.g. `prompt`) |
| `402` | Payment Required | Unpaid request; returns x402 challenge metadata |
| `422` | Unprocessable Entity | Malformed proof, wrong chain (not Base), wrong currency (not USDC), or wrong amount |
| `409` | Conflict | Payment already processed / duplicate transaction hash (Replay attack) |
| `503` | Service Unavailable | Downstream intelligence or model service unavailable (clean machine error) |

---

## 8. Structured Logging System

All commerce API interactions emit structured JSON logs tagged with `[COMMERCE_LOG]` for observability:

Events emitted:
- `COMMERCE_REQUEST`
- `PAYMENT_REQUIRED`
- `PAYMENT_RECEIVED`
- `PAYMENT_VERIFIED`
- `PAYMENT_REJECTED`
- `COMMERCE_QUERY_STARTED`
- `OGRAPHER_RETRIEVAL`
- `OJALM_INFERENCE`
- `COMMERCE_RESPONSE`
- `COMMERCE_REQUEST_FAILED`

---

## 9. Local Development & Testing

1. Start the API Server in test accept mode:
```powershell
$env:X402_TEST_ACCEPT="true"
npm start
```

2. Run the automated test suite:
```bash
node test/phase1-suite.js
```

---

## 10. Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3001` | Server listening port |
| `X402_PRICE_USD` | `0.01` | Price in USD for commerce queries |
| `X402_CURRENCY` | `USDC` | Settlement currency |
| `X402_CHAIN` | `Base` | Blockchain network |
| `X402_RECIPIENT` | `0x00...` | Treasury recipient wallet address |
| `X402_TEST_ACCEPT` | `false` | Enable simulated test proof verification for local testing |
| `CDP_ENDPOINT` | `""` | Remote CDP verification endpoint |
| `CDP_API_KEY` | `""` | CDP API authentication bearer key |
