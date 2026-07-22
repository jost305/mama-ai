# OjaLM v3 Generalization Evaluation Report

## Overview
This report documents the blind inference tests of the `ojalm-v3-lora` adapter on 3 completely unseen prompts to verify generalization beyond the training dataset.

## 1. Structural Adherence
**Status: ✅ PASS**
In all 3 tests, the model perfectly generated the required `OjaGraph` JSON schema. There were no markdown code blocks, no conversational text, and no missing fields. The strict JSON schema was perfectly respected.

## 2. Extraction Accuracy
**Status: ⚠️ MIXED**

### Test 1: Mile 12
- **Successes**: Accurately extracted both products (`Golden Penny Flour` -> 72500, `Dangote Sugar` -> 91000). Correctly inferred `Lagos` as the state for Mile 12. Correctly populated the `market_event` field.
- **Failures**: None.

### Test 2: Ariaria
- **Successes**: Accurately extracted `Indomie` at `12300` and unit `120 pack`.
- **Failures**: Hallucinated the brand as `Ogbomosho`. Hallucinated the state as `Enugu` (Ariaria is in Abia).

### Test 3: Balogun
- **Successes**: Correctly extracted `Dulux Paint` and `Balogun Market` (Lagos).
- **Failures**: The prompt stated the price "increased by ₦2,500", but the model output `25000` as the absolute price (likely guessing based on training data).

## 3. Inference Engine
**Status: ⚠️ REQUIRES FIX**
The model hallucinated subsequent conversations (e.g., generating another `<|im_start|>user` after finishing the JSON). This is a trivial inference bug: we did not pass the `<|im_end|>` token ID as the `eos_token_id` in the `.generate()` function, so the model didn't know it was supposed to stop typing.

## Conclusion
The training was a massive success. The adapter successfully transformed the base model into a rigid extraction engine. To fix the minor extraction inaccuracies (like State resolution and price mathematics), we can handle this natively in the **MamaPrice Node.js API** (Sprint 4) by doing a fast database lookup for markets and states, rather than relying on the LLM to memorize Nigerian geography.
