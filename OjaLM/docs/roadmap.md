# Oja AI Research Roadmap: The 7 Sprints

With the architecture formally locked (**[Architecture Freeze v1.0](../ARCHITECTURE_FREEZE_v1.0.md)**), our complete focus is on execution. We will deploy the ecosystem in 7 sequential sprints.

## Sprint 1: Populate OjaGraph
**Goal:** Build the static knowledge foundation.
- Target: 500 Products
- Target: 2,000 Brands
- Target: 500 Markets
- Target: 5,000 Vendors
- Establish baseline truth before synthetic data generation.

## Sprint 2: Build Scout Platform
**Goal:** Deploy the human data ingestion network.
- Build Scout Mobile / Web Experience.
- Implement the Mission feed (accept/reject).
- Enable Camera, GPS, and Receipt upload.
- Launch Earnings, Wallet, and Leaderboard mechanics.

## Sprint 3: Generate OjaData
**Goal:** Create the training corpus.
- Utilize the LLM Synthesizer.
- Target: 10,000–50,000 high-quality ShareGPT conversations derived from OjaGraph and the Scout Network.

## Sprint 4: Train OjaLM-1
**Goal:** Teach reasoning to the Foundation Model.
- Run Unsloth pipeline.
- Fine-tune base models (e.g., Llama-3/Mistral) on OjaData.

## Sprint 5: Run ACIB
**Goal:** Validate model intelligence.
- Execute the African Commerce Intelligence Benchmark.
- Produce the first public benchmark report comparing OjaLM-1 against generic foundation models.

## Sprint 6: Deploy MamaPrice Agent
**Goal:** Launch the conversational runtime.
- Deploy the trained adapter behind the WhatsApp and Web Agents.
- Connect the agent to live tool use and the Dispatch Engine.

## Sprint 7: Launch MarketMama AI
**Goal:** Close the flywheel.
- Real users begin interacting with the Commerce OS.
- Generate live `OjaReplay` data from user interactions.
- Feed user frustration/success back into the training corpus, cementing the self-improving loop.
