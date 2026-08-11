# MamaPrice × Base
# AI Commerce Infrastructure Roadmap

Version: 1.0
Status: Proposed
Owner: Ctrl+Prompt / MamaPrice

---

## 1. Purpose

This document defines the technical roadmap for integrating Base into MamaPrice and OjaLM.

The objective is not to put OjaLM on-chain.

The objective is to make MamaPrice a programmable commerce-intelligence and transaction layer that AI agents can access, pay, monitor, and eventually transact through.

The architecture separates four responsibilities:

- OjaLM — AI reasoning and language intelligence
- OjaGraph — commerce knowledge and evidence
- MamaPrice — commerce intelligence API and application layer
- Base — machine-readable payment and transaction settlement

The long-term system should allow an external AI agent to:

1. Request African commerce intelligence.
2. Pay MamaPrice programmatically.
3. Receive grounded intelligence.
4. Continuously monitor commerce conditions.
5. Trigger authorized actions.
6. Execute permitted transactions on Base.

---

# 2. Product Vision

MamaPrice should evolve from an AI consumer application into an infrastructure layer for AI-powered commerce.

Today:

    Human
      ↓
    MamaPrice
      ↓
    OjaLM + OjaGraph
      ↓
    Commerce intelligence

Future:

    AI Agent
      ↓
    MamaPrice Commerce API
      ↓
    OjaGraph + OjaLM
      ↓
    Commerce intelligence
      ↓
    Agent decision
      ↓
    Policy / authorization
      ↓
    Base
      ↓
    Commerce transaction

This creates two complementary products:

### Product A — Commerce Intelligence

MamaPrice sells access to its commerce intelligence to other AI agents.

### Product B — Autonomous Commerce Infrastructure

MamaPrice allows authorized AI agents to use commerce intelligence to initiate permitted commerce actions.

---

# 3. Core Architectural Principle

Base must remain outside the OjaLM model.

OjaLM is not a wallet.

OjaLM is not a payment processor.

OjaLM is not a transaction signer.

OjaLM does not determine whether money can be spent.

The correct architecture is:

    External Agent
          ↓
    MamaPrice API
          ↓
    Payment / Authorization
          ↓
    OjaGraph
          ↓
    OjaLM
          ↓
    Structured Intelligence
          ↓
    Policy Engine
          ↓
    Transaction Service
          ↓
    Base

LLM output must never directly authorize a blockchain transaction.

---

# 4. Phase Overview

The integration will be implemented in four major phases.

## Phase 1 — Paid Commerce Intelligence

### Objective

Allow an external AI agent to pay MamaPrice on Base and receive commerce intelligence.

### Core technologies

- MamaPrice Commerce API
- x402
- Base
- OjaGraph
- existing OjaLM inference service

### User/agent experience

An external AI agent asks:

    "What is the current price of 50kg rice in Lagos?"

MamaPrice responds with a payment requirement.

The agent pays using Base.

MamaPrice verifies the payment.

MamaPrice then executes:

    OjaGraph
       ↓
    evidence
       ↓
    OjaLM
       ↓
    commerce response

### End-to-end flow

    AI Agent
       ↓
    GET /v1/commerce/prices
       ↓
    HTTP 402
       ↓
    x402 payment
       ↓
    Base
       ↓
    payment verification
       ↓
    Commerce Intelligence Service
       ↓
    OjaGraph
       ↓
    OjaLM
       ↓
    response

### Phase 1 deliverables

- Commerce Intelligence API
- x402 middleware
- Base payment configuration
- payment verification
- payment records
- replay protection
- structured commerce response
- external AI agent test client
- API documentation
- automated tests

### Phase 1 does NOT include

- autonomous wallets
- autonomous purchasing
- spending policies
- vendor transactions
- agent monitoring
- smart contracts
- agent marketplace

### Phase 1 success condition

A completely external client can:

    Request
      ↓
    Receive 402
      ↓
    Pay on Base
      ↓
    Retry
      ↓
    Receive grounded MamaPrice intelligence

---

# 5. Phase 2 — Commerce Agent Monitoring

## Objective

Allow AI agents to continuously monitor MamaPrice commerce intelligence and receive events when predefined conditions occur.

Phase 1 answers:

    "What is the price now?"

Phase 2 introduces:

    "Tell me when the price changes."

### Example

An AI procurement agent creates:

    Product: Tomatoes
    Market: Lagos
    Condition: Price < ₦70,000

MamaPrice continuously evaluates commerce observations.

When the condition becomes true:

    OjaGraph
       ↓
    Condition Engine
       ↓
    Trigger
       ↓
    Agent Event
       ↓
    External Agent

### Example

    Tomato price
         ↓
    ₦74,000
         ↓
    ₦72,000
         ↓
    ₦69,500
         ↓
    CONDITION TRUE
         ↓
    Agent notified

### Phase 2 components

- Agent registration
- Agent identity
- Monitoring rules
- Condition engine
- event bus
- webhook delivery
- event signatures
- retry handling
- event history
- monitoring dashboard

### Example monitoring API

    POST /v1/agents

    POST /v1/agents/:id/monitors

    GET /v1/agents/:id/monitors

    DELETE /v1/agents/:id/monitors/:monitorId

### Phase 2 success condition

An external AI agent can subscribe to a commerce condition and reliably receive an event when MamaPrice detects it.

---

# 6. Phase 3 — Controlled Autonomous Commerce

## Objective

Allow authorized AI agents to take actions based on commerce intelligence.

This is where the system becomes an autonomous commerce infrastructure.

The agent does NOT receive unrestricted control of funds.

Instead:

    Agent
      ↓
    proposes action
      ↓
    Policy Engine
      ↓
    authorization
      ↓
    Transaction Service
      ↓
    Base

### Example

A restaurant procurement agent wants to buy rice whenever:

    Rice price < ₦70,000

The agent has:

    Maximum transaction: $100
    Daily limit: $500
    Approved product: Rice
    Approved market: Lagos
    Approved asset: USDC

When the condition triggers:

    Price observation
         ↓
    Agent condition
         ↓
    Action proposal
         ↓
    Policy Engine
         ↓
    APPROVED
         ↓
    Transaction Service
         ↓
    Base
         ↓
    Transaction confirmation

### Critical security principle

OjaLM may propose an action.

OjaLM may NOT authorize the action.

The Policy Engine independently evaluates:

- amount
- product
- vendor
- wallet
- spending limit
- frequency
- network
- asset
- authorization status

### Phase 3 components

- Agent policies
- delegated wallet / smart account infrastructure
- transaction service
- transaction simulation
- policy engine
- spending limits
- approved vendors
- approved assets
- emergency kill switch
- transaction monitoring
- transaction reconciliation

### Phase 3 success condition

An authorized agent can autonomously execute a permitted transaction on Base while remaining constrained by deterministic policies.

---

# 7. Phase 4 — MamaPrice Agent Infrastructure

## Objective

Turn the system into a developer platform.

At this stage MamaPrice is no longer simply an application.

It becomes infrastructure other developers can build on.

### Developer experience

A developer should eventually be able to:

    npm install mamaprice-agent-sdk

Then:

    const mama = new MamaPrice({
        apiKey: "...",
        network: "base"
    });

    const price = await mama.commerce.prices({
        product: "rice",
        location: "Lagos"
    });

### Developer capabilities

Developers can:

- query commerce intelligence
- pay per request
- subscribe to intelligence
- create monitoring agents
- receive commerce events
- create policies
- execute authorized transactions

### Platform components

- Agent SDK
- API keys
- developer dashboard
- usage dashboard
- payment dashboard
- agent dashboard
- API documentation
- webhooks
- x402 integration
- Base integration
- usage metering
- developer analytics

### Phase 4 success condition

An independent developer can build an AI commerce agent using MamaPrice without modifying the MamaPrice codebase.

---

# 8. Long-Term Architecture

After all four phases:

    ┌───────────────────────────────┐
    │       External AI Agents     │
    │                               │
    │ FoodAgent                     │
    │ ProcurementAgent              │
    │ RetailAgent                   │
    │ Trading/Market Agents         │
    └───────────────┬───────────────┘
                    │
                    │ x402 / API
                    ▼
    ┌───────────────────────────────┐
    │       MamaPrice API           │
    │                               │
    │ Commerce Intelligence         │
    │ Agent Monitoring              │
    │ Agent Events                  │
    │ Transaction Gateway           │
    └───────────────┬───────────────┘
                    │
             ┌──────┴──────┐
             ▼             ▼
        ┌─────────┐   ┌───────────┐
        │ OjaGraph│   │   OjaLM   │
        └────┬────┘   └─────┬─────┘
             └──────┬───────┘
                    │
                    ▼
             Commerce Intelligence
                    │
                    ▼
              Policy Engine
                    │
                    ▼
             Transaction Service
                    │
                    ▼
              ┌───────────┐
              │   Base    │
              └───────────┘

---

# 9. Security Architecture

The system has separate trust boundaries.

## Intelligence boundary

OjaGraph + OjaLM

Responsible for:

- retrieval
- reasoning
- natural language

Not responsible for:

- payment authorization
- wallet control
- transaction signing

## Application boundary

MamaPrice API

Responsible for:

- authentication
- authorization
- API access
- usage
- agent identities

## Payment boundary

x402 + Base

Responsible for:

- payment settlement
- payment verification
- transaction references

## Execution boundary

Policy Engine + Transaction Service

Responsible for:

- authorization
- spending controls
- transaction construction
- transaction submission
- reconciliation

---

# 10. Data Placement

## Off-chain

Keep:

- OjaGraph
- price observations
- vendor data
- market data
- agent profiles
- monitoring rules
- intelligence responses
- execution logs

## On-chain

Use Base for:

- payments
- settlement
- transaction execution
- wallet/account state where necessary
- transaction proofs

Do not store the entire commerce graph on-chain.

---

# 11. Phase Dependencies

Phase 1:

    Commerce API
         +
    x402
         +
    Base
         +
    OjaGraph
         +
    OjaLM

Phase 2:

    Phase 1
       +
    Agent identity
       +
    Condition engine
       +
    Event system

Phase 3:

    Phase 2
       +
    Policy engine
       +
    Wallet/account infrastructure
       +
    Transaction service

Phase 4:

    Phase 1-3
       +
    SDK
       +
    Developer platform

---

# 12. Implementation Rule

Development must follow this sequence:

    Phase 1
       ↓
    TEST
       ↓
    VALIDATE
       ↓
    DOCUMENT
       ↓
    STOP

Only after explicit approval:

    Phase 2
       ↓
    TEST
       ↓
    VALIDATE
       ↓
    DOCUMENT
       ↓
    STOP

Then:

    Phase 3

Then:

    Phase 4

Do not implement multiple phases in one development task.

---

# 13. Immediate Development Target

The current implementation target is:

## PHASE 1

Build:

    MamaPrice Commerce Intelligence API
             +
    x402
             +
    Base payment verification
             +
    Existing OjaGraph
             +
    Existing OjaLM

The first successful demonstration must be:

    External AI Agent

        ↓

    "What's the price of rice in Lagos?"

        ↓

    HTTP 402

        ↓

    Agent pays USDC on Base

        ↓

    MamaPrice verifies payment

        ↓

    OjaGraph retrieves evidence

        ↓

    OjaLM generates grounded response

        ↓

    External Agent receives answer

This is the first milestone of the MamaPrice × Base infrastructure.

---

# 14. What We Are Building

The immediate product is NOT:

"An AI that buys things."

The immediate product is:

> **A Base-enabled commerce intelligence API that AI agents can pay programmatically to access.**

The autonomous commerce capability comes later.

This creates the foundation for:

> **AI agents that can discover, understand, monitor, and eventually transact within African commerce markets.**
