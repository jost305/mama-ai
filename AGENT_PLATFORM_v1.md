# AGENT_PLATFORM_v1.md
## AgentOS — MamaPrice Human Field Intelligence Network Operating System

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
                                  │   AgentOS Intelligence Hub    │
                                  └───────────────┬───────────────┘
                                                  │
        ┌───────────────────┬─────────────────────┼─────────────────────┬───────────────────┐
        │                   │                     │                     │                   │
┌───────┴───────┐   ┌───────┴───────┐     ┌───────┴───────┐     ┌───────┴───────┐   ┌───────┴───────┐
│ Career Engine │   │ Reputation    │     │  Verification │     │ Dynamic Reward│   │ Mission & Gap │
│ (Progression) │   │ Engine (0-100)│     │ Engine (Cons) │     │ Engine ($/pts)│   │ Coverage Eng  │
└───────────────┘   └───────────────┘     └───────────────┘     └───────────────┘   └───────────────┘
```

---

## 1. Architectural Vision & Core Principles

1. **Workforce Operating System, Not Simple App Users**:
   - Field Agents are the core data pipeline powering MamaPrice. AgentOS operates as a managed, reputation-based field intelligence workforce.
2. **Defensible Field Data Moat**:
   - Competitors can copy UI code or AI prompts, but they cannot replicate a multi-tier, reputation-scored human network executing multi-agent consensus verification across 36 Nigerian states.
3. **Data Confidence Score Over Binary Logic**:
   - Every price observation in OjaGraph carries a **Confidence Score (0% – 100%)** calculated from multi-agent consensus, photo/receipt OCR proof, and GPS telemetry.

---

## 2. Agent Career Progression Hierarchy

Agents progress through structured ranks. Higher ranks unlock higher base payouts, enterprise verification contracts, and regional oversight:

```
Consumer ➔ Junior Scout ➔ Market Agent ➔ Senior Agent ➔ Regional Captain ➔ State Coordinator ➔ National Ambassador
```

| Rank Level | Title | Verification Criteria | Earnings Multiplier | Unlocked Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Level 1** | Junior Scout | Registered Profile | `1.0x` (Base ₦250) | Standard Price Reporting, Basic Missions |
| **Level 2** | Market Agent | 50+ Verified Reports, Reputation > 80% | `1.2x` (₦300) | Priority Ingestion, Streak Bonuses |
| **Level 3** | Senior Agent | 200+ Reports, Reputation > 90%, OCR/Photo Proof | `1.5x` (₦375) | Multi-Agent Consensus Validator, High-Reward Missions |
| **Level 4** | Regional Captain | 400+ Reports, Reputation > 95%, LGA Coverage Lead | `2.0x` (₦500) | Enterprise Verification Contracts (e.g. Nestlé, Ministry) |
| **Level 5** | State Coordinator | Top 1% State Leaderboard, LGA Coverage Management | `2.5x` (₦625) | Regional Operations & Verification Auditing |

---

## 3. Reputation Engine (0 – 100 Score Matrix)

An Agent's **Reputation Score** is dynamically computed in real-time based on 8 telemetry factors:

$$\text{Reputation Score} = \sum (\text{Metric Weight} \times \text{Performance Score})$$

- **Accuracy Score (25%)**: Historical match rate against multi-agent consensus.
- **Evidence Weight (20%)**: Ratio of reports submitted with receipt OCR photos / clear market images.
- **GPS Telemetry Confidence (15%)**: Geofence match of Agent device location to target market coordinates.
- **Completeness (10%)**: Quantity, brand name, unit, and condition logged per observation.
- **Speed & Freshness (10%)**: Latency between price capture and report submission.
- **Consistency (10%)**: Active reporting days streak.
- **Community Cross-Votes (5%)**: Peer verification from other Agents in the same market.
- **Verification Rate (5%)**: Percentage of reports passing automated anomaly checks.

---

## 4. Multi-Agent Verification & Consensus Engine

No single report becomes **Gold Grounded Evidence** without passing the Consensus Protocol:

```
  Agent A Observation (Bodija: Rice ₦84,000)
                    │
  Agent B Observation (Bodija: Rice ₦84,500)
                    │
  Agent C Observation (Bodija: Rice ₦84,000)
                    │
           Consensus Evaluator
                    │
                    ▼
     [GOLD BADGE] Grounded Evidence
    (Confidence: 98.4% · 3 Agents Verified)
```

### Trust Badging Tiers
- 🥇 **Gold Grounded**: Verified by 3+ independent Agents with Photo OCR & GPS $\rightarrow$ **Confidence 95% - 100%**.
- 🥈 **Silver Grounded**: Verified by 2 independent Agents with GPS telemetry $\rightarrow$ **Confidence 80% - 94%**.
- 🥉 **Bronze Grounded**: Verified by 1 Agent with photo evidence $\rightarrow$ **Confidence 65% - 79%**.
- ⚪ **Unverified / Pending**: Single unverified report $\rightarrow$ **Confidence < 65%** (Excluded from Enterprise/Gov Index).

---

## 5. Dynamic Reward Engine Formula

Instead of static flat payouts, Agent earnings per report are calculated dynamically:

$$\text{Total Payout} = \text{Base Reward} + \text{Bonus}_{\text{Difficulty}} + \text{Bonus}_{\text{Urgency}} + \text{Bonus}_{\text{Rarity}} + \text{Bonus}_{\text{Evidence}} + \text{Bonus}_{\text{Coverage}} + \text{Bonus}_{\text{Streak}}$$

```
Example Calculation (High Priority Gap Mission):
• Base Reward:          ₦250
• Evidence Bonus (OCR): +₦100
• Rarity (Yola Market): +₦450
• Urgent Gap Mission:   +₦300
• Senior Agent Rank:    +₦150
-----------------------------
TOTAL AGENT PAYOUT:     ₦1,250
```

---

## 6. OjaGraph Gap Detection & Dynamic Mission Engine

OjaGraph monitors regional data completeness across all 36 states:

```
Regional Coverage Index:
• Lagos State:  95% Coverage (Saturated — Standard ₦250 Reward)
• Oyo State:    82% Coverage (Optimal — Standard Missions)
• Adamawa (Yola): 11% Coverage (High Gap — Dynamic Mission: ₦1,200 Reward)
• Zamfara (Gusau): 3% Coverage (Critical Gap — Dynamic Mission: ₦1,800 Reward)
```

When coverage in an LGA/Market drops below threshold (e.g. < 40%), the **Mission Engine** automatically generates high-reward priority missions and dispatches push alerts to local Scouts.

---

## 7. Development Order Roadmap

1. **AgentOS Architecture Specification (`AGENT_PLATFORM_v1.md`)** ✅
2. **Mission Engine (`services/agent_mission_engine.py`)** 👈 **NEXT STEP**
3. **Verification & Consensus Engine (`services/agent_verification_engine.py`)**
4. **Dynamic Reward Engine (`services/agent_reward_engine.py`)**
5. **AlertGraph Intelligent Push Dispatcher**
6. **Meta WhatsApp Flows UI Wrappers**
