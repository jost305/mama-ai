# Public /partner Commercial Entry Point Reference Guide

## 1. Overview

The **Public `/partner` Commercial Entry Point** in `MamaPrice-UI` serves as the commercial front door for external organizations, restaurants, supermarkets, delivery apps, software developers, and autonomous AI agents seeking to integrate African commerce intelligence.

---

## 2. Key Commercial Audiences & Sectors

| Sector | Target Audience | Value Proposition / Use Case | Integration |
| ------ | --------------- | ----------------------------- | ----------- |
| 👨‍💻 **Developers** | Software Engineers, App Builders | Programmatic API access to commodity prices and currency trends. | `GET /api/v1/commerce/prices` |
| 🍽️ **Restaurants** | Procurement Teams, Caterers | Automated market price tracking across wholesale hubs (Mile 12, Bodija, Dawanau) for menu costing. | `POST /api/commerce/intel` |
| 🏪 **Supermarkets** | Retail Merchandisers | Real-time competitor tracking and regional wholesale margin analytics. | OjaGraph Merchant Lookup |
| 🛍️ **Food Apps** | Delivery & Logistics Apps | Grounded commerce data integrated directly into checkout and recommendation engines. | RAG Commerce Inquiries |
| 🤖 **AI Agents** | Autonomous Agent Builders | Autonomous agents querying intelligence programmatically using USDC micro-payments on Base. | `x402 Base Protocol` |

---

## 3. Supported URL Routes & Hashes

The portal can be accessed directly using any of the following URL patterns:
- `http://localhost:3000/#partner`
- `http://localhost:3000/#partners`
- `http://localhost:3000/#developers`
- `http://localhost:3000/#partner-portal`

---

## 4. Key Page Sections & Flow

1. **Hero Header**: "Build with MamaPrice — Give your application, business, or AI agent access to real-time African commerce intelligence."
2. **Infrastructure Status Bar**: Displays Base Network (Sepolia / Mainnet), x402 Protocol status, OjaGraph RAG status, and $0.01 USDC query cost.
3. **Commercial Entry Points Grid**: 5 audience cards detailing target commercial use cases.
4. **Core Services Grid**: Interactive cards for Price Intelligence, Market Intelligence, Vendor Intelligence, Commerce RAG Query, and x402 AI Agent Access.
5. **Developer Journey Visualizer**: 5-step pathway from discovery to Base Mainnet x402 deployment.
6. **Live Runnable Agent Demos**: Live browser terminal execution for **FoodAgent** (Procurement), **MarketMonitor** (Multi-Market Comparison), and **PriceMonitorAgent** (Phase 3 Autonomous Threshold Monitoring).
7. **Commercial Partner Onboarding Modal (`#partner-modal-overlay`)**: Enterprise application form for commercial partner onboarding.
