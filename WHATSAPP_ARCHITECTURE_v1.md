# WHATSAPP_ARCHITECTURE_v1.md
## MamaPrice Omnichannel Backend & WhatsApp Client Architecture

```
                                  ┌───────────────────────────────┐
                                  │      OjaLM Neural Engine      │
                                  └───────────────┬───────────────┘
                                                  │
                                  ┌───────────────┴───────────────┐
                                  │   OjaGraph + Grounded RAG    │
                                  └───────────────┬───────────────┘
                                                  │
                                  ┌───────────────┴───────────────┐
                                  │  MamaPrice Unified Backend    │
                                  │       (REST / WebSockets)     │
                                  └───────────────┬───────────────┘
                                                  │
                ┌─────────────────────────────────┼─────────────────────────────────┐
                │                                 │                                 │
     ┌──────────┴──────────┐           ┌──────────┴──────────┐           ┌──────────┴──────────┐
     │  Web Application    │           │ WhatsApp Client     │           │  Future Mobile App  │
     │  (Vanilla JS UI)    │           │ (Business API)      │           │  (iOS / Android)    │
     └─────────────────────┘           └─────────────────────┘           └─────────────────────┘
```

---

## 1. Architectural Philosophy & Core Principles

1. **WhatsApp is a Client, Not a Separate Bot**:
   - The WhatsApp Business API serves as an external interface client targeting the exact same backend endpoints (`/chat`, `/report`, `/alerts`, `/prices`, `/markets`, `/withdraw`, `/dashboard`) that power the web application.
   - Zero duplicated business logic or prompt engineering.

2. **The 99% Parity Mandate**:
   - Every consumer action, agent reporting workflow, merchant alert, and analytics request available on the web MUST be executable via WhatsApp.

3. **Hybrid Routing Engine (Structured vs. Natural Language)**:
   - **WhatsApp Flows (Meta Workflow)** for high-precision, multi-step structured tasks (Agent Registration, KYC, Earnings Withdrawals, Alert Configuration).
   - **OjaLM + OjaGraph AI** for natural language shopping queries, price comparisons, unstructured agent reporting, image OCR, voice transcription, and market intelligence.

---

## 2. Intent Routing & Flow Decision Matrix

```
                          Incoming WhatsApp Webhook Payload
                                         │
                                  Intent Classifier
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
          Structured Intent                           Unstructured / NL Intent
                   │                                           │
          Meta WhatsApp Flow                                MamaPrice AI
                   │                                           │
   ┌───────────────┼───────────────┐           ┌───────────────┼───────────────┐
   │               │               │           │               │               │
Agent Reg       Withdrawal      KYC / Alerts   Price Query    Agent Report   Voice/OCR/Media
```

### A. WhatsApp Flows (Structured Tasks)
Used exclusively where precision, validation, and zero AI ambiguity are required:
- **Agent Registration & Onboarding**: Name, State, LGA, Primary Market, Bank Details.
- **KYC Verification**: ID Upload, Selfie, Address details.
- **Cash Withdrawal & Payouts**: Bank choice, Amount, PIN/OTP confirmation.
- **Points & Rewards Redemption**: Convert MarketPoints to Cash / Mobile Data.
- **Notification & Alert Settings**: Product subscriptions (Rice, Tomatoes, Cement), frequency (Instant, Daily).

### B. Natural Language Engine (OjaLM + OjaGraph)
Processes all conversational inputs directly:
- **Consumer Search & Price Inquiries**: *"Where can I buy cheap rice in Ibadan?"*
- **Market Comparisons**: *"Which market is cheaper: Mile 12 or Oyingbo?"*
- **Unstructured Agent Reports**:
  - Text: *"Golden Penny Flour is ₦72,500 today at Mile 12"*
  - Voice Note: Transcribed via Whisper/OjaLM voice engine.
  - Image / Photo: Receipts parsed via Vision OCR.
- **Outbound Notifications**: Price drops, surge alerts, mission availability, level-up bonuses.

---

## 3. Backend Endpoint Mapping

| WhatsApp Action / Command | Web App Endpoint | Payload / Parameters | Execution Engine |
| :--- | :--- | :--- | :--- |
| Natural Query / Price Search | `POST /chat` | `{ prompt, sessionId, modelId }` | OjaLM + OjaGraph RAG |
| Unstructured Price Report | `POST /report` | `{ message, mediaUrl, market }` | OjaLM Extractor + Supabase |
| Agent Withdrawal | `POST /withdraw` | `{ agentId, amount, bankCode }` | MamaPrice Payout Engine |
| Configure Price Alert | `POST /alerts` | `{ product, market, threshold }` | AlertGraph Engine |
| Fetch Market Indexes | `GET /prices` | `{ commodity, region }` | OjaGraph Database |
| Fetch Agent Missions | `GET /missions` | `{ agentId, lga }` | Leaderboard Engine |

---

## 4. Implementation Phasing Roadmap

- **Phase 0 — Frozen Architecture Blueprint** (`WHATSAPP_ARCHITECTURE_v1.md`).
- **Phase 1 — Unified Backend Endpoint Standardization** (Ensure all web endpoints expose clean JSON contracts for WhatsApp transport).
- **Phase 2 — Transport Webhook Layer** (`POST /webhook/whatsapp` & `GET /webhook/whatsapp` verification).
- **Phase 3 — Natural Language Router** (Pipe incoming messages to `POST /chat`).
- **Phase 4 — WhatsApp Flows Setup** (Register Meta JSON schemas for Registration, KYC, Payouts).
- **Phase 5 — Push Notification Engine** (Outbound WhatsApp Template Messages for AlertGraph & Missions).
- **Phase 6 — Rich Media Intelligence** (Voice note audio transcription & receipt photo OCR).
