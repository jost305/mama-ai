# ACIB Annotation Guidelines

**Version:** 1.0
**Project:** Oja AI Research Lab

This handbook serves as the definitive guide for researchers and data engineers writing benchmark tasks for the **African Commerce Intelligence Benchmark (ACIB)**. It ensures consistency, cultural accuracy, and rigorous evaluation regardless of how many contributors work on the project.

---

## 1. What Makes a Good Benchmark Question?
A high-quality ACIB question evaluates **commerce intelligence**, not just trivia.
- **Bad:** "What is garri?" (Tests simple retrieval).
- **Good:** "I have ₦15,000 to feed six people for three days. What should I buy?" (Tests budgeting, nutrition, market pricing, and multi-step reasoning).
- **Core Principle:** Every question must force the model to analyze a trade-off, evaluate a situational constraint, or resolve ambiguity.

---

## 2. Context & Constraints
Do not write generic prompts. Use the `consumer_context` field to enforce specific constraints:
- **Budget constraints** (e.g., "tight budget", "₦5,000 max").
- **Logistical constraints** (e.g., "I need to transport 50 bags of cement to a muddy site").
- **Health constraints** (e.g., "diabetic", "ulcer patient").
- **Event constraints** (e.g., "cooking party jollof for 50 people").

---

## 3. Ground Truth & Multiple Answers
Unlike multiple-choice tests, commerce decisions often lack a single "correct" answer.
- The `ground_truth` array must list **required logical components** rather than strict verbatim strings.
- Example: If asked about buying a cheap phone, the ground truth should include "Acknowledges budget constraint", "Suggests a specific entry-level brand like Tecno or Itel", and "Warns about fake accessories". It should NOT just say "Buy Tecno".

---

## 4. Regional Terminology
African commerce thrives on regional slang and aliases.
- Use the `aliases` array in the schema to document acceptable alternatives.
- Example: `["Ata Rodo", "Scotch Bonnet", "Hot Pepper"]`.
- Do not penalize a model for using a valid regional alias unless the prompt specifically restricts it.

---

## 5. Multilingual Translations & Code-Switching
The `variants` block must accurately reflect street-level commerce, not formal textbook grammar.
- **Do NOT literally translate sentences.** Translate the *intent*.
- **Formal English:** "Which rice do you recommend for making stew?"
- **Pidgin:** "Madam, which rice sweet pass for stew?"
- **Code-Switching:** This is highly encouraged. Market vernacular naturally blends English and local dialects (e.g., "Ẹ jọ̀ọ́, which rice una recommend?").
- **Slang:** Never sterilize market slang. Use words like "Gbese" (debt), "Owa" (stop), "Jara" (extra), or "Awoof" (free).

---

## 6. Tone & Persona
- When evaluating the `Negotiation` vertical, the model must be penalized if it sounds like a corporate customer service bot. It should mirror the polite, culturally-nuanced pushback typical of African markets.
- Safety metrics should only trigger on actual harm (e.g., illegal goods, dangerous medical advice) and should NOT trigger on aggressive bargaining or slang.
