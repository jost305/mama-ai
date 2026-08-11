# Build with MamaPrice — Developer & Partner Integration Guide

> Access real-time African commerce intelligence for your application, restaurant procurement system, retail marketplace, or autonomous AI agent. Powered by **Base x402** micro-payments and grounded **OjaGraph + OjaLM** RAG.

---

## 1. Overview & Vision

MamaPrice is an **AI-native commerce intelligence layer for Africa**, enabling software applications and autonomous AI agents to query grounded market commodity intelligence programmatically. Using **x402 on Base**, autonomous agents pay programmatically in USDC per API query.

```
DISCOVER
   ↓
Choose MamaPrice Service (Price, Market, Vendor, Commerce RAG)
   ↓
CREATE ACCOUNT / GET CREDENTIALS
   ↓
Get API Sandbox Credentials
   ↓
READ DOCS & SPECIFICATIONS
   ↓
TEST ON SANDBOX (http://localhost:3001)
   ↓
BASE SEPOLIA TESTNET
   ↓
GO LIVE (BASE MAINNET + x402 Protocol)
```

---

## 2. Supported Capabilities & Endpoints

### 1. Price Intelligence (`GET /api/v1/commerce/prices`)
Query real-time commodity prices across major African trading hubs.
- **Parameters**: `product` (e.g., `Rice`, `Tomatoes`, `Cement`), `location` (e.g., `Lagos`, `Ibadan`, `Kano`).

**Example Request**:
```bash
curl -X GET "https://api.mamaprice.ai/api/v1/commerce/prices?product=Rice&location=Lagos"
```

**Response**:
```json
{
  "product": "Rice",
  "location": "Lagos",
  "observations": [
    {
      "id": "doc_001",
      "commodity": "Rice (50kg)",
      "price": 72000,
      "currency": "NGN",
      "market": "Mile 12 Market",
      "location": "Lagos"
    }
  ],
  "analysis": {
    "trend": "STABLE"
  },
  "grounded_by": "OjaGraph",
  "generated_by": "OjaLM",
  "response": "The current price of a 50kg bag of rice in Lagos (Mile 12 Market) is ₦72,000..."
}
```

### 2. Paid Commerce RAG Query (`POST /api/commerce/intel`)
Execute natural language inquiries backed by MamaPrice scout observations.

**Example Request**:
```bash
curl -X POST "https://api.mamaprice.ai/api/commerce/intel" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is the price of tomatoes in Ibadan?",
    "paymentProof": {
      "transactionHash": "0x...",
      "chain": "Base",
      "currency": "USDC",
      "amount": 0.01,
      "method": "x402"
    }
  }'
```

---

## 3. Base x402 Machine Payment Protocol

Unpaid or unauthenticated requests return `HTTP 402 Payment Required` with the x402 challenge:

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
  "timestamp": "2026-08-11T18:00:00.000Z",
  "instructions": "Pay this Base x402 charge and replay the original request with proof of settlement."
}
```

### On-Chain Verification Audit
MamaPrice native RPC verification audits transaction receipts on Base:
1. Verifies transaction receipt success (`status: 0x1`).
2. Audits log topics for ERC-20 `Transfer(from, to, value)` event (`0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`).
3. Verifies token address matches Base Mainnet (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`) or Base Sepolia (`0x036CbD53842c5426634e7929541eC2318f3dCF7e`) USDC.
4. Verifies destination recipient matches `X402_RECIPIENT`.
5. Verifies transferred value is at least 0.01 USDC (`10,000` micro-USDC).

---

## 4. Web Application Developer Portal

Developers can test and interact with the API live in the MamaPrice UI under **Build with MamaPrice** (`#page-developers`).

Key UI features:
- **Interactive API Sandbox**: Live query runner against local sandbox or Base testnets.
- **Code Generator**: Automatic snippet generation in JavaScript (`fetch`), cURL, and Python (`requests`).
- **Network Switcher**: Switch between Local Sandbox, Base Sepolia, and Base Mainnet.
- **Developer Key Generator**: Instant creation of sandbox API credentials.
