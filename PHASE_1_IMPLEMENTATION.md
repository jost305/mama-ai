# PHASE_1_IMPLEMENTATION

## Implementation Instruction — MamaPrice × Base Phase 1
You are implementing **Phase 1 only** of the MamaPrice × Base integration.

### Objective
Build the first working version of a **paid MamaPrice Commerce Intelligence API** where an external AI agent can request commerce intelligence, pay for the request using **x402 on Base**, and receive a response grounded in MamaPrice's existing **OjaGraph + OjaLM** pipeline.

The target flow is:

```
External AI Agent
        ↓
MamaPrice Commerce API
        ↓
x402 Payment Required
        ↓
Agent pays on Base
        ↓
MamaPrice verifies payment
        ↓
OjaGraph retrieves commerce evidence
        ↓
OjaLM generates grounded intelligence
        ↓
Structured API response
```

---

# IMPORTANT — DEVELOPMENT RULES

### 1. DO NOT jump ahead
Implement the work **one phase/task at a time**.
Do not start Phase 2, Phase 3, or Phase 4 functionality.
Do not implement:

- autonomous purchasing
- autonomous agent wallets
- agent spending policies
- vendor execution
- commerce transactions
- smart contracts
- agent marketplace
- autonomous monitoring
- user crypto wallets
- Base-based reward payments
- agent-to-agent transactions
Those are future phases.

**Stop after Phase 1 is working.**

### 2. DO NOT modify OjaLM itself
Do **not**:

- modify OjaLM model weights
- retrain OjaLM
- fine-tune OjaLM
- change its architecture
- change its inference behavior
- add blockchain logic to OjaLM
- add payment logic to OjaLM
OjaLM is an existing intelligence component.

Treat it as a service/module that MamaPrice already knows how to call.

The integration should happen **around OjaLM**, not inside it.

### 3. Preserve the existing MamaPrice system
Before changing anything:

1. Inspect the existing architecture.
2. Identify the existing OjaGraph query interface.
3. Identify the existing OjaLM inference interface.
4. Identify the existing MamaPrice API routes.
5. Identify the existing authentication/session mechanisms.
6. Identify existing database/storage models.
7. Identify whether x402 or Base functionality already exists.
Do not duplicate functionality that already exists.

Do not rewrite working systems unnecessarily.

Prefer adding isolated modules/services over modifying large existing files.

---

# TASK 1 — Architecture inspection
First inspect the repository and report:

```
1. Current API architecture
2. Current OjaGraph interface
3. Current OjaLM interface
4. Existing commerce query flow
5. Existing authentication
6. Existing database/storage
7. Existing payment functionality
8. Existing Base integration, if any
9. Existing environment variables
10. Recommended integration points
```

**Do not implement anything yet.**

After inspection, provide the findings and proposed files to create/modify.

---

# TASK 2 — Commerce API
Create a clean machine-facing API.

Preferred endpoint:

```
GET /api/v1/commerce/prices
```
Example:

```
GET /api/v1/commerce/prices?product=rice&location=Lagos
```
The endpoint must eventually produce structured commerce intelligence from the existing MamaPrice pipeline.

Do not expose internal OjaLM implementation details to the API consumer.

The external consumer should see:

```
{
  "product": "rice",
  "location": "Lagos",
  "observations": [],
  "analysis": {},
  "grounded_by": "OjaGraph",
  "generated_by": "OjaLM"
}
```
Adapt the exact schema to the existing MamaPrice data structures rather than inventing incompatible models.

---

# TASK 3 — x402 payment gate
Add x402 payment protection **at the API boundary**.

Unauthenticated/unpaid request:

```
GET /api/v1/commerce/prices?product=rice&location=Lagos
```
should return:

```
402 Payment Required
```
with a proper x402 payment challenge.

The response should include x402 metadata such as:

- Base network
- settlement asset
- recipient
- required amount
- requested resource
- human-readable instructions for replaying the request after payment

Do not create a custom payment protocol if the existing x402 implementation provides the required mechanism.

The ledger may remain useful for internal accounting/auditing, but it must not be the primary x402 verification system.
Payment verification and settlement should follow Base/CDP x402 infrastructure.

---

# TASK 4 — Payment verification
After the client provides the x402 payment:

```
Payment
   ↓
x402 verification
   ↓
Base transaction validation
   ↓
Valid?
```
Validate at minimum:

- correct network
- correct asset
- correct recipient
- correct amount
- valid transaction/payment proof
- payment has not already been consumed
- payment corresponds to the requested resource
Do not trust client-provided transaction status.

---

# TASK 5 — Idempotency and replay protection
Implement payment/request tracking.

Each paid request must have a unique request identifier.

Persist enough information to prevent:

- replaying the same payment
- double fulfillment
- accidental duplicate settlement
- duplicate API responses for the same paid entitlement
Use the project's existing database if one exists.

Do not introduce another database unless necessary.

---

# TASK 6 — Connect successful payment to existing intelligence pipeline
Only after payment verification succeeds:

```
Verified Payment
       ↓
Commerce Query
       ↓
OjaGraph
       ↓
Evidence
       ↓
Existing OjaLM inference
       ↓
Structured response
```
Do not bypass OjaGraph.

Do not allow OjaLM to invent commerce data.

The response should remain grounded in available MamaPrice evidence.

---

# TASK 7 — External test client
Create a minimal test client.

It should simulate an external AI agent:

```
FoodAgent
    ↓
requests MamaPrice intelligence
    ↓
receives 402
    ↓
performs Base payment
    ↓
retries request
    ↓
receives commerce intelligence
```
The test client should be separate from the MamaPrice web application.

The purpose is to prove that MamaPrice can serve **external machine consumers**, not merely its own frontend.

---

# TASK 8 — Testing
Do not declare Phase 1 complete until all of these tests pass.

### Test 1 — Normal request

```
Request without payment
→ 402
```

### Test 2 — Invalid payment

```
Invalid payment
→ rejected
```

### Test 3 — Wrong network

```
Payment on wrong network
→ rejected
```
```

### Test 4 — Wrong amount

```
Insufficient payment
→ rejected
```
```

### Test 5 — Valid Base payment

```
Valid Base payment
→ verified
→ commerce query executes
→ response returned
```

### Test 6 — Replay

```
Reuse previous payment
→ rejected
```

### Test 7 — OjaGraph grounding
Verify that the returned intelligence actually comes from the existing MamaPrice/OjaGraph data.

### Test 8 — OjaLM
Verify that the existing OjaLM inference path is invoked normally.

Do not modify OjaLM to make the test pass.

---

# TASK 9 — Failure handling
The API must distinguish between:

```
402 = payment required
401 = authentication failure, if authentication is required
403 = payment/authentication not authorized
404 = resource not found
409 = replay/conflict
429 = rate limit
500 = internal failure
503 = intelligence service unavailable
```
Do not expose internal infrastructure errors to external agents.

Do not expose:

> "OjaLM is down"

as the API's user-facing response.

The API should return a clean machine-readable error.

---

# TASK 10 — Logging
Add structured logs for:

```
COMMERCE_REQUEST
PAYMENT_REQUIRED
PAYMENT_RECEIVED
PAYMENT_VERIFIED
PAYMENT_REJECTED
COMMERCE_QUERY_STARTED
OGRAPH_RETRIEVAL
OJALM_INFERENCE
COMMERCE_RESPONSE
COMMERCE_REQUEST_FAILED
```

Include:

```
requestId
agentId, if available
resource
paymentId, if available
Base transaction hash, if available
timestamp
status
latency
```

Never log:

- private keys
- secrets
- API keys
- wallet credentials

---

# TASK 11 — Documentation
Create:

```
docs/
  base/
    PHASE_1_COMMERCE_INTELLIGENCE.md
```

Document:

1. Architecture
2. API endpoint
3. x402 flow
4. Base network configuration
5. Payment lifecycle
6. Response schema
7. Error responses
8. Replay protection
9. Local development
10. Test procedure
11. Environment variables

---

# FINAL ACCEPTANCE CRITERIA
Phase 1 is complete only when this exact flow works end-to-end:

```
┌──────────────────────┐
│ External AI Agent    │
└──────────┬───────────┘
           │
           │ Commerce request
           ▼
┌──────────────────────┐
│ MamaPrice API        │
└──────────┬───────────┘
           │
           │ 402
           ▼
┌──────────────────────┐
│ x402 / Base Payment  │
└──────────┬───────────┘
           │
           │ verified
           ▼
┌──────────────────────┐
│ Commerce Intelligence│
│ Service              │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ OjaGraph             │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Existing OjaLM       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Structured Response  │
└──────────────────────┘
```

### Do not proceed beyond this point.
Once the end-to-end Phase 1 test passes, stop and provide:

```
PHASE 1 STATUS

Implemented:
- ...
- ...
- ...

Files changed:
- ...

Tests:
- PASS/FAIL

Base transaction:
- ...

x402:
- ...

OjaGraph:
- ...

OjaLM:
- ...

Known issues:
- ...

Next phase:
- Phase 2 Agent Monitoring
```
**Do not implement Phase 2 unless explicitly instructed to do so.**
