# WHATSAPP_ARCHITECTURE_v2.md
## MamaPrice Omnichannel Identity & Permission-Aware Client Architecture

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
                                  └───────────────┬───────────────┘
                                                  │
                                       Incoming WhatsApp Message
                                                  │
                                                  ▼
                                       ┌─────────────────────┐
                                       │   Identity Layer    │
                                       │ (Phone ➔ User ID)   │
                                       └──────────┬──────────┘
                                                  │
                                                  ▼
                                       ┌─────────────────────┐
                                       │  Permission Layer   │
                                       │   (Role Matrix)     │
                                       └──────────┬──────────┘
                                                  │
                                                  ▼
                                       ┌─────────────────────┐
                                       │  Intent Classifier  │
                                       └──────────┬──────────┘
                                                  │
                              ┌───────────────────┴───────────────────┐
                              ▼                                       ▼
                     WhatsApp Flow (Meta)                    OjaLM + OjaGraph AI
                   (Registration, Withdraw, KYC)           (Prices, Advice, Reports, OCR)
```

---

## 1. Architectural Evolution (v1 vs. v2)

In **v1**, the message router evaluated intent directly from phone numbers (`Phone Number ➔ Intent Router ➔ Engine`).

In **v2**, an **Identity & Permission Layer** is inserted **before** intent classification (`Phone Number ➔ Identity Layer ➔ Permission Layer ➔ Intent Router ➔ Engine`).

### Why Identity First?
1. **Unified Identity**: Conversations, memory, reports, payouts, rewards, and missions belong to an **Identity** (`Agent #1042`), not a raw phone number.
2. **Instant Recognition**: When a user messages *"Hi"*, the system recognizes their role and context immediately without prompting:
   - **Agent**: *"👋 Welcome back Emmanuel (Level 4 Agent). Today's earnings: ₦3,400. 3 Missions waiting."*
   - **Consumer**: *"👋 Welcome back Sarah! 2 price drops detected on your watchlist today."*
   - **Unregistered**: *"👋 Welcome to MamaPrice! Would you like to track prices or register as a paid Field Agent?"*
3. **Multi-Persona Security & Auditing**: Verification scores, confidence metrics, and government/business reports display verified Agent reputation metrics (*"Verified by 18 Field Agents (Avg Accuracy: 97%)"*).

---

## 2. Identity Service Data Contract

Every incoming phone number resolves to a unified `MamaPriceIdentity` profile:

```json
{
  "userId": "USR-89201",
  "phoneNumber": "2348012345678",
  "name": "Emmanuel Nwosu",
  "role": "AGENT", 
  "agentDetails": {
    "scoutId": "SC-1042",
    "level": 4,
    "levelLabel": "Senior Field Scout",
    "reputationScore": 97,
    "state": "Oyo",
    "lga": "Ibadan North",
    "primaryMarket": "Bodija Market",
    "todayEarnings": 2400,
    "walletBalance": 18900,
    "lifetimeReports": 342,
    "accuracyRating": 96.8
  },
  "consumerDetails": {
    "watchlist": ["Rice", "Tomatoes", "Dangote Cement"],
    "favoriteMarkets": ["Bodija", "Mile 12"]
  },
  "permissions": ["LOG_PRICES", "REQUEST_PAYOUT", "ACCEPT_MISSIONS", "VIEW_ANALYTICS"],
  "activeSessionId": "sess_wa_2348012345678_17849102"
}
```

---

## 3. The 4-Tier Permission Matrix

| Role | Default Capabilities & Actions | Default Greeting & Interface |
| :--- | :--- | :--- |
| **UNREGISTERED** | Launch Agent Registration Flow, Browse Public Prices, Query AI | *"Welcome to MamaPrice! Find prices or tap below to become a paid Agent Scout."* |
| **CONSUMER** | Price Search, Market Comparison, Watchlist Alerts, Shopping Advice | *"Welcome back! Ask me for local market prices or regional comparisons."* |
| **AGENT** | Log Unstructured Price Reports, Upload Receipt Photos, Voice Notes, View Wallet, Withdraw Cash, Accept Missions | *"Welcome back [Name] (Level [X] Scout). Today's earnings: ₦[X]. [Y] Missions available!"* |
| **BUSINESS / GOVT** | Market Intelligence Dashboards, Inflation Tracking, Regional Price Comparisons, CSV Data Export | *"MamaPrice Enterprise Intelligence. Ask for regional inflation indices or market analytics."* |

---

## 4. Revised Execution Roadmap

- **Phase 0 — Freeze Architecture v2 (`WHATSAPP_ARCHITECTURE_v2.md`)** ✅
- **Phase 1 — Endpoint Standardization** (JSON contracts for Web & WhatsApp APIs) ✅
- **Phase 2 — Webhook Transport Layer** (`GET` & `POST /webhook/whatsapp`) ✅
- **Phase 3 — Identity & Permission Service** (`lookupIdentityByPhone(phone)`) 👈 **NEXT**
- **Phase 4 — Persona-Aware Conversation Engine** (Identity-injected system prompts & greetings)
- **Phase 5 — Meta WhatsApp Flows Integration** (Flows triggered based on user state)
- **Phase 6 — Persona-Based Push Alerts & Missions** (Targeted outbound notifications)
- **Phase 7 — Rich Media Engine** (Receipt OCR & Voice Transcriber tied to Agent ID)
