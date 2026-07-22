# Oja AI Research: The 5-Paper Vision

Our research output is structured around 5 distinct, foundational papers that map to the layers of our ecosystem.

## Paper 1: ACIB
**Title:** *ACIB: The African Commerce Intelligence Benchmark*
**Focus:** Decoupling linguistic evaluation from reasoning logic. Proving that current models fail at deep commerce reasoning in African contexts, and introducing the schema/evaluation engine to fix it.

## Paper 2: OjaData
**Title:** *OjaData: A Multilingual African Commerce Instruction Dataset*
**Focus:** How we synthesized, curated, and translated empirical commerce data to teach foundation models how to respectfully negotiate and calculate trade-offs in local markets.

## Paper 3: OjaLM
**Title:** *OjaLM: A Commerce Foundation Model for African Markets*
**Focus:** The fine-tuning methodology. Comparing LoRA adapters on AfriqueQwen vs Qwen3 vs Llama 3.1 using OjaData, and measuring the resulting intelligence leaps on ACIB.

## Paper 4: MamaPrice
**Title:** *MamaPrice: Tool-Augmented Commerce Agents in Informal Economies*
**Focus:** Deploying OjaLM as an agent runtime. How we integrated RAG (OjaGraph) and tool-calling to allow the model to query live prices rather than hallucinate static data.

## Paper 5: MarketMama
**Title:** *MarketMama: Deploying Commerce AI at Consumer Scale*
**Focus:** The final product layer. Lessons learned from launching a commerce operating system via WhatsApp and Web, and introducing OjaReplay to continuously feed real-world interactions back into training.
