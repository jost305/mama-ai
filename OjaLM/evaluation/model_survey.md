# Foundation Model Survey

**Version:** 1.0 (Preliminary)
**Phase:** 04.1
**Project:** OjaLM Research

## 1. Executive Summary

**Research Question:** Which open-weight foundation model provides the strongest base for building OjaLM, a multilingual commerce foundation model for Africa?

This survey is **not** intended to identify the best general-purpose Large Language Model (LLM) on the market. Its sole purpose is to evaluate and identify the optimal starting point for fine-tuning OjaLM, based strictly on the strict criteria established in the OjaLM Model Requirements Specification (MRS).

---

## 2. Evaluation Criteria

Candidate models will be empirically evaluated prior to selection. The criteria are weighted as follows to align with OjaLM's objectives:

| Criterion | Weight | Description |
| :--- | :--- | :--- |
| **Commerce reasoning potential** | 25% | Ability to perform logic, math, and trade-off analysis. |
| **Multilingual African capability** | 20% | Base proficiency in Nigerian Pidgin, Yoruba, Hausa, Igbo. |
| **Tool calling & agent readiness** | 15% | API calling fidelity and JSON formatting reliability. |
| **Open licensing** | 10% | Permissive licensing (e.g., Apache 2.0, MIT, Llama). |
| **Fine-tuning ecosystem** | 10% | Compatibility with PEFT, Unsloth, and Hugging Face pipelines. |
| **Community support** | 10% | Active ecosystem for troubleshooting and deployment. |
| **Inference efficiency** | 10% | VRAM requirements and quantization readiness (e.g., GGUF, AWQ). |

---

## 3. Candidate Models

The initial survey targets a mix of globally dominant architectures and African-specialized models:

| Model | Status |
| :--- | :--- |
| **AfriqueQwen** | Primary Candidate |
| **Qwen3-8B** | Primary Candidate |
| **Llama 3.1 8B** | Reference Candidate |
| **Gemma 3** | Reference Candidate |
| **Mistral Small** | Reference Candidate |
| **N-ATLaS** | Specialized African Candidate |

---

## 4. Individual Model Profiles

### AfriqueQwen
**Strengths:**
- High African language adaptation (Hausa, Yoruba, Igbo).
- Built on the highly capable Qwen architecture.
- Strong multilingual foundation.
**Weaknesses:**
- Limited commerce specialization.
- Smaller developer ecosystem than mainstream Qwen releases.
- Requires benchmarking to verify logic retention.
**Risks:**
- Unknown baseline performance on agentic commerce tasks and tool calling.
**Initial Hypothesis:** ⭐⭐⭐⭐☆

### Qwen3-8B
**Strengths:**
- World-class reasoning, coding, and tool use capabilities.
- Exceptionally strong multilingual tokenizer.
- Massive fine-tuning ecosystem support (Unsloth first-class citizen).
**Weaknesses:**
- May lack deep, localized African vernacular idioms.
**Risks:**
- High reliance on generic English reasoning paths.
**Initial Hypothesis:** ⭐⭐⭐⭐⭐

### Llama 3.1 8B
**Strengths:**
- Industry-standard ecosystem and unparalleled stability.
- Massive community support.
**Weaknesses:**
- Historically biased toward English and European languages.
- Multilingual performance requires heavy fine-tuning.
**Risks:**
- High alignment tax (refusals) might hinder certain commerce negotiations.
**Initial Hypothesis:** ⭐⭐⭐⭐☆

### Gemma 3
**Strengths:**
- Efficient, lightweight, and deeply integrated into the Google/Kaggle ecosystem.
**Weaknesses:**
- Potentially restrictive tokenizer for African languages compared to Qwen.
**Risks:**
- Formatting strictness during fine-tuning.
**Initial Hypothesis:** ⭐⭐⭐☆☆

### Mistral Small
**Strengths:**
- Fast inference and famously strong reasoning capabilities.
- Permissive licensing and great fine-tuning receptiveness.
**Weaknesses:**
- Lacks African multilingual focus out-of-the-box.
**Risks:**
- May struggle significantly with Nigerian Pidgin or Code-switching.
**Initial Hypothesis:** ⭐⭐⭐☆☆

### N-ATLaS
**Strengths:**
- Purpose-built for African languages.
- Extremely valuable conceptual checkpoint for regional NLP research.
**Weaknesses:**
- Likely lacks the complex logic and tool-calling infrastructure of top-tier global models.
**Risks:**
- Ecosystem compatibility (Unsloth support, quantization availability).
**Initial Hypothesis:** ⭐⭐⭐☆☆

---

## 5. Comparison Matrix (Preliminary)

*Note: These are **preliminary hypotheses** based on model documentation, not final conclusions. Final scores will be determined empirically via ACIB.*

| Capability | AfriqueQwen | Qwen3 | Llama 3.1 | Gemma 3 | Mistral Small | N-ATLaS |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Commerce reasoning | 4 | 5 | 4 | 4 | 4 | 2 |
| African languages | 5 | 4 | 3 | 3 | 3 | 5 |
| Tool use | 4 | 5 | 4 | 4 | 4 | 2 |
| Ecosystem | 4 | 5 | 5 | 4 | 4 | 3 |
| Fine-tuning support | 5 | 5 | 5 | 5 | 5 | 4 |

---

## 6. Unknowns

The purpose of benchmarking is to resolve the following unknowns prior to Model Selection:
- **Commerce Reasoning Ability:** Which model naturally understands retail trade-offs best?
- **Negotiation Quality:** Can the model adopt a culturally appropriate haggling persona without triggering AI alignment filters?
- **ACIB Performance:** Actual zero-shot scores on the OjaBench task matrix.
- **Hallucination Rate:** Which model most reliably admits ignorance on live pricing?
- **Decision-Making Quality:** Can the model factor in consumer constraints (budget, location, health) correctly?

---

## 7. Evaluation Plan

To resolve the unknowns, we will execute the following pipeline:

```text
Candidate Models
        │
        ▼
   ACIB-Core
        │
        ▼
   ACIB-Agent
        │
        ▼
  Gap Analysis
        │
        ▼
 MRS Compliance
        │
        ▼
Final Selection
```

---

## 8. Decision Criteria

**OjaLM-1 will not be built on the most popular model.** 

It will be built on the model that best satisfies the Model Requirements Specification (MRS) and achieves the strongest empirical performance on ACIB, while simultaneously supporting efficient fine-tuning and scalable deployment within the Oja ecosystem.
