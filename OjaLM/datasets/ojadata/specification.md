# OjaData v0.1 Specification

Before a single byte of training data is synthesized from OjaCollect, it must adhere to this specification. OjaData is not a random text corpus; it is a highly curated instruction dataset designed to teach foundation models *how* to reason in African commerce.

## 1. What is a Training Example?
A training example is a discrete JSON object representing a task and the expected model behavior. It can represent:
- **Static Knowledge:** E.g., The difference between 'Oloyin' and 'Drum' beans.
- **Dynamic Reasoning:** E.g., How to calculate a bulk discount based on a hypothetical quote.
- ***Note:* OjaData does NOT teach live prices.** E.g., "What is the price of rice today?" is an illegal training example. The model must instead be taught to output a `<get_price>` tool call.

## 2. Instruction Format
OjaData utilizes a multi-turn **ShareGPT** format to natively support agentic workflows and tool-calling.
```json
{
  "conversations": [
    {"from": "user", "value": "How much for palm oil?"},
    {"from": "assistant", "value": "<tool_call>{\"name\": \"get_price\", \"args\": {\"item\": \"palm oil\"}}</tool_call>"},
    {"from": "tool", "value": "{\"price\": 28000}"},
    {"from": "assistant", "value": "The current market rate is around ₦28,000."}
  ]
}
```

## 3. Multilingual & Code-Switching
OjaData requires fluid code-switching. Examples must include Nigerian Pidgin, Yoruba, Hausa, and Igbo.
- **Rule:** If the user prompts in Pidgin, the assistant must reply in Pidgin, unless explicitly asked to translate.
- **Rule:** Vernacular (e.g., "Iyaoloja", "Derica") must not be sanitized into formal English.

## 4. Versioning & Splits
- **Splits:** 80% Train / 10% Validation / 10% Test.
- **Versioning:** Semantic versioning (e.g., v0.1.0). Every version corresponds to an immutable checksum.

## 5. Licensing
All synthetic data and verified Knowledge Objects ingested into OjaData must be released under **CC-BY-4.0** to benefit the broader African NLP community, explicitly excluding any Tier 4/5 user data containing PII.
