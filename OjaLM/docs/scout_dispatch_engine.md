# Scout Dispatch Engine

The Dispatch Engine transforms MamaPrice from a passive data repository into an on-demand, crowdsourced data acquisition platform (an "Uber for Data").

## Core Philosophy
OjaLM and MamaPrice do not wait for data to become stale. When a user queries MamaPrice for a price and the Knowledge Confidence Score drops below a threshold (or the data is too old), the ecosystem **automatically hires a human** to go check the price.

## Bounty Generation Loop
1. **Knowledge Missing / Confidence Drop**: e.g., "Price of Mama Gold Rice in Ikeja is 6 days old."
2. **Bounty Created**: The engine creates a financial bounty (e.g., ₦500).
3. **Broadcast**: Notification sent to Scouts within a 5km radius.
4. **Acceptance**: First scout to tap [ACCEPT] locks the mission. Others see "Already Assigned."
5. **Execution**: Scout navigates to market -> Takes Photo -> Enters Price -> Uploads Receipt.
7. **Reward**: ₦500 + 80 MarketPoints released to Scout.

## The Mission Marketplace (B2B)
The Dispatch Engine is not just triggered by MamaPrice users. It serves as an open intelligence marketplace where external actors can fund data acquisition at scale.
- **FMCG Brands:** E.g., Nestlé wants to know the price of Milo in 200 markets today.
- **Government Agencies:** E.g., Lagos State commissions a "Distance Mission" deploying 100 scouts to map flooding around Mile 12.
- **NGOs & Researchers:** Fund targeted data collection campaigns.

```text
Consumers
Businesses
Government
Researchers
        │
        ▼
 Mission Marketplace
        │
        ▼
 Dispatch Engine
        │
        ▼
 Scouts
```

## Acquisition Modes

The platform supports two distinct ingestion pipelines to maximize data density.

### 1. Reactive Acquisition (Missions)
Triggered by the system when data decays or a user asks a question.
`Mission` -> `Scout` -> `Report`

### 2. Proactive Acquisition (Observations)
Triggered voluntarily by a Scout when they notice a market shock (e.g., tomatoes crash from ₦15,000 to ₦9,500).
`Observation` -> `Scout` -> `Report`

## Mission Types
Missions are highly specialized tasks.
1. **Price Mission:** "What's today's wholesale price of Golden Penny Flour?"
2. **Image Mission:** "Take a photo of Golden Penny 10kg packaging."
3. **Receipt Mission:** "Upload today's receipt."
4. **Shelf Mission:** "Which brands are available?"
5. **Counterfeit Mission:** "Is this fake Peak Milk?"
6. **Stock Mission:** "Is Indomie finished?"
7. **Queue Mission:** "How busy is Mile 12?"
8. **Distance Mission:** "Estimate parking availability."
9. **Vendor Mission:** "Confirm Shop 23 still exists."
10. **Negotiation Mission:** "Pretend you're buying this item and record the negotiated price."

## Smart Dispatch Ranking
The engine does not spam all scouts. It routes missions using a highly specific Uber-style filter:
```text
Need: Food Price
  ↓
Filter: Food Scout only
  ↓
Filter: within 3km radius
  ↓
Filter: Diamond Level+
  ↓
Filter: Available now
  ↓
Filter: Highest acceptance rate
  ↓
Filter: Lowest fraud score
  ↓
Dispatch Mission
```

## Dynamic Surge Pricing
- **Normal**: ₦300
- **Urgent**: ₦700
- **Rare Product**: ₦1,500
- **Ignored Bounty**: Reward increases automatically every 10 minutes.

## Multi-Scout Verification
For high-value or high-risk products (e.g., expensive electronics, pharmaceuticals), the engine assigns 3 independent scouts. AI compares the three `Reports`. If consensus is reached, the Confidence Score is set to 98% and the data enters OjaGraph.

## User-Triggered Bounties
Users interacting with MamaPrice can sponsor bounties.
*User: "What's the price of Flour in Aba?"*
*AI: "No recent data. Would you like to sponsor a live check for ₦250? ETA: 18 mins."*
*User taps YES -> Bounty dispatched -> User notified upon completion.*
