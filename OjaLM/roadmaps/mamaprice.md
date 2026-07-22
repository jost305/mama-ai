# MamaPrice Roadmap
**Commerce AI Agent (Consumer Facing)**

MamaPrice is the "ChatGPT for Commerce." It is an intelligent AI agent built on top of OjaLM designed exclusively for **Everyday Shoppers (Persona 1)**.

## Core Principle
Anyone can use MamaPrice without ever becoming a Scout. These users **do not report prices**. They use the agent to:
- Ask for prices and compare products
- Find nearby markets and vendors
- Estimate transport costs and budgets
- Detect counterfeits and get shopping advice

## Current Focus: v0.1 Architecture
- [ ] Define the MamaPrice Agent schema and tool interfaces (e.g., `get_price`, `calculate_budget`).
- [ ] Establish the Retrieval-Augmented Generation (RAG) pipeline connecting OjaLM to OjaGraph so shoppers get accurate answers.

## Future Milestones
### v0.5: WhatsApp Integration
- Deploying the MamaPrice agent runtime to intercept, reason over, and respond to WhatsApp user messages.

### v1.0: Multimodal Voice
- Implementing Speech-to-Text and Text-to-Speech logic to allow Voice interactions with MamaPrice in local dialects.
