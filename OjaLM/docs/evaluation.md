# OjaBench: African Commerce Intelligence Benchmark (ACIB)

**Version:** 1.0
**Status:** Official Schema Defined

To ensure OjaLM is genuinely improving, we evaluate it systematically rather than relying on vibes or general-purpose benchmarks. 

**OjaBench (ACIB)** is the official benchmark that every OjaLM model must pass. We establish this benchmark *before* evaluating or fine-tuning any base models to ensure a rigorous, scientific approach to AI development.

ACIB evaluates **commerce decisions**, not just static commerce knowledge.

---

## The Three ACIB Tracks

As OjaLM evolves, ACIB is divided into three distinct evaluation tracks:

### 🟢 ACIB-Core
Evaluates commerce knowledge, trade-off analysis, recommendations, and multi-step reasoning using static and dynamic scenarios.

### 🔵 ACIB-Agent
Evaluates tool expectation, API calling (e.g., retrieving live prices from MarketMama API), and autonomous workflow completion.

### 🟣 ACIB-Multimodal (Future)
Evaluates visual and auditory commerce inputs, including product photographs, handwritten receipts, market shelves, and vernacular voice notes.

---

## Benchmark Schema (JSONL)

To support scaling from hundreds to tens of thousands of evaluations across multiple countries and models, OjaBench uses a strict JSONL (JSON Lines) machine-readable format. 

### Key Innovations in the v1.0 Schema:
- **Pan-African Scaling (`country`)**: Benchmarks are tied to specific countries (e.g., Nigeria, Ghana, Kenya).
- **Environment (`market_type`)**: Distinguishes reasoning between Open Markets, Supermarkets, and Pharmacies.
- **Cognitive Tagging (`reasoning_type`)**: Explicitly tags the required skills (e.g., Trade-off Analysis, Budgeting, Risk Assessment).
- **Time/State Awareness (`knowledge_type`)**: Defines whether the knowledge is Static, Seasonal, Dynamic, or Live (which triggers Tool Calling).
- **Dimensional Scoring (`evaluation_dimensions`)**: Replaces binary exact-matching with weighted scores for Accuracy, Reasoning, Completeness, and Safety.
- **Situational Constraints (`consumer_context`)**: Forces the model to evaluate context (budget, health constraints, location) rather than generating generic advice.
- **Multilingual Decoupling (`variants`)**: Languages are not baked into the benchmark ID. A single ID contains variants for English, Pidgin, Yoruba, Hausa, Igbo, etc.

### Example Schema Object:
```json
{
  "id": "OBJ-SR-0042",
  "track": "ACIB-Core",
  "version": "1.0",
  "domain": "Food & Groceries",
  "vertical": "Shopping Reasoning",
  "country": "Nigeria",
  "region": "South West",
  "market_type": "Supermarket",
  "difficulty_score": 4,
  "knowledge_type": "Static",
  "reasoning_type": ["Recommendation", "Trade-off Analysis", "Budgeting"],
  "consumer_context": {
    "budget": "Low",
    "household_size": 6,
    "health_constraint": "Diabetic mother",
    "goal": "Buy milk"
  },
  "tool_expectation": {
    "requires_tool": false,
    "preferred_tool": null
  },
  "variants": {
    "en": {
      "prompt": "I'm buying milk for my diabetic mother and a household of 6 on a tight budget. Between Peak Milk and Three Crowns, which should I buy and why?"
    },
    "pcm": {
      "prompt": "My mama get diabetes and we be 6 for house, but money no too dey. Which milk better make I buy between Peak and Three Crowns?"
    }
  },
  "aliases": ["Evaporated milk"],
  "ground_truth": [
    "Recommend Three Crowns",
    "Three Crowns is formulated with low cholesterol/vegetable fat which is better for health-conscious/diabetic consumers",
    "Three Crowns is generally more affordable than Peak",
    "Peak is full cream and high fat, which is less ideal for this specific health constraint"
  ],
  "evaluation_dimensions": {
    "factual_accuracy": 40,
    "reasoning": 40,
    "completeness": 20,
    "safety": 0
  }
}
```

---

## Unique ID Standard

Every benchmark item is traceable via a rigid ID nomenclature: `OBJ-[VERTICAL_CODE]-[NUMBER]`

**Vertical Codes:**
- `PI` = Product Intelligence
- `NG` = Negotiation
- `SR` = Shopping Reasoning
- `MI` = Market Intelligence
- `VI` = Vendor Intelligence
- `TC` = Tool Calling
- `CM` = Commerce Mathematics
- `FR` = Financial Reasoning
- `LD` = Logistics & Delivery
- `ML` = Multilingual Commerce
- `VS` = Vision Commerce
- `VC` = Voice Commerce
- `HA` = Safety & Hallucination

*Example:* `OBJ-SR-0042` (OjaBench -> Shopping Reasoning -> Question 42)
