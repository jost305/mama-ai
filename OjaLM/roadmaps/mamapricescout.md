# MamaPrice Scout: Contributor Platform Roadmap

The MamaPrice Scout system is an on-demand, crowdsourced intelligence network. It is a **separate subsystem** from the consumer-facing MamaPrice chat, designed exclusively for **Registered Contributors (Persona 2)**.

## The Purpose
Scouts exist to improve the knowledge base (OjaGraph). They do not use the system to shop; they use it to receive missions and earn rewards.

Examples of missions:
- Verify a product price at Mile 12
- Upload a receipt via OCR
- Verify market hours or report vendor closures
- Report shortages or price crashes

## The Economy: Reputation vs Cash
Scouts operate in a dual-economy system to prevent fraud and incentivize quality.
1. **MarketPoints (Reputation):** Non-transferable. Unlocks levels, missions, and ranking. Cannot be withdrawn.
2. **Cash (NGN):** Paid in Naira via Bank/Paystack for completed bounties. Fully withdrawable.
3. **Badges:** Permanent achievements used by the Dispatch Engine for routing.

## Scout DNA (Specialization)
Scouts are not generic. The engine builds an evolving DNA profile for each scout:
- `Specialization`: (e.g., Food Scout, Pharmacy Scout, Auto Parts)
- `Negotiation Style`, `Fast Reporter`, `Image Quality`, `Fraud Probability`

## Reports & Verification States
Every submission generates a unique `Report ID`. Knowledge in OjaGraph originates *only* from Reports.
Reports move through strict verification states before the AI accepts them: Pending -> Auto Validated -> Peer Verified -> Golden.

## The Dispatch Engine
See `docs/scout_dispatch_engine.md` for the algorithmic routing, surge pricing, and multi-scout consensus rules that automatically dispatch bounties to the best available Scouts.
