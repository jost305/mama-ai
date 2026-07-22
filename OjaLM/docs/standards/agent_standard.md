# Agent Standard (MamaPrice)

MamaPrice is the AI agent runtime that wraps OjaLM, granting it access to the OjaGraph and external APIs to execute commerce workflows.

## Definition of Done (DoD)
An agent runtime release is considered **DONE** when it meets the following criteria:

- [ ] **Tool Calling Passes Tests:** The agent must flawlessly emit structured tool calls (e.g., `<get_price>`, `<search_market>`) and parse the results back into natural language.
- [ ] **Retrieval Validated:** RAG pipelines connecting to OjaGraph must demonstrate high precision and recall.
- [ ] **Voice Tested:** If applicable, Speech-to-Text and Text-to-Speech pipelines must accurately handle Nigerian accents and code-switched vernacular.
- [ ] **Safety Reviewed:** The agent must safely handle adversarial inputs (e.g., dangerous goods requests) without breaking character or violating system prompts.
