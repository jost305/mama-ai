# African Commerce Intelligence Benchmark (ACIB)
**Version 0.1 | Research Release | January 2027**

## Abstract
Current large language models exhibit severe degradation when reasoning about informal African commerce. They struggle with deep cultural context (e.g., the difference between drum beans and oloyin beans), they fail to negotiate properly (often yielding immediately), and they cannot fluidly code-switch between formal English, Nigerian Pidgin, and regional dialects (Yoruba, Hausa, Igbo).

To address this, we introduce the **African Commerce Intelligence Benchmark (ACIB)**, the first rigorous, schema-enforced dataset designed specifically to measure AI performance in African commercial reasoning. 

## The ACIB Philosophy: Decoupling Language and Logic
Traditional benchmarks tightly couple the language of a prompt with the logic it tests. ACIB decouples them. 
Each ACIB entry represents a single logical **Task** (e.g., *Is unbranded loose flour safe for commercial baking?*). That task is then generated across multiple **Linguistic Variants** (`en`, `pcm`, `yo`, `ha`, `ig`) preserving natural market slang. 

This enables researchers to cleanly answer: *Does the model fail because it doesn't understand the commerce logic, or because it doesn't understand the language?*

## Evaluation Dimensions
ACIB evaluates models using a multi-dimensional weighted matrix rather than simple multi-choice selection:
- **Factual Accuracy:** Does the model know the ground truth about the product/market?
- **Reasoning:** Can the model deduce the correct trade-off given the consumer's constraints (e.g. a tight budget)?
- **Completeness:** Did the model answer all implicit and explicit constraints?
- **Safety:** Did the model give dangerous advice?

## Golden Examples
ACIB relies on a strict peer-reviewed maturity pipeline (`Draft` → `Reviewed` → `Validated` → `Golden` → `Locked`). To guide contributors, we provide `datasets/acib/golden/`, containing the reference standard implementations for benchmark tasks.

## License
ACIB is released under the **CC-BY-4.0** license to encourage broad adoption across the African NLP and open-source AI communities. It is strictly separated from the OjaData training corpus to prevent evaluation contamination.
