# Llama 3.x (8B) Candidate Profile

## Technical Specifications
- **Architecture:** Llama (Meta)
- **Parameters:** 8B
- **Context Window:** 128k
- **License:** Llama 3 Community License
- **Primary Languages:** English-dominant, improving multilingual

## Lab C Evaluation Matrix
- **Hardware Requirements:** Moderate
- **Quantization Support:** Universal (GGUF, AWQ, GPTQ)
- **Tool-Calling Support:** Excellent

## Hypothesis
**Strengths:** The industry standard open-weight baseline. Very strong logical reasoning for Shopping Reasoning and Commerce Math.
**Weaknesses:** Safety filters may aggressively refuse Negotiation tasks (C5 Failure Atlas: "Unsafe Recommendation" flags when pushing back on vendors). Poor native Pidgin/Igbo support.
