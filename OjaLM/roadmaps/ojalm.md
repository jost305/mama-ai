# OjaLM Roadmap
**Commerce Foundation Models**

OjaLM is the underlying intelligence engine. It is an open-weight family of foundation models (e.g., OjaLM-1B, 3B, 7B, 70B, and specialized models like OjaLM-Vision) fine-tuned on OjaData to deeply understand African commerce reasoning, multilingual code-switching, and tool usage.

## Current Focus: v0.1 Research Release
- [ ] **Lab C (Model Intelligence Lab)**: Baseline benchmarking of candidate models against the pristine ACIB.
  - *AfriqueQwen* (African baseline)
  - *Qwen3-8B* (Multilingual baseline)
  - *N-ATLaS* (Nigerian baseline)
  - *Gemma* (Lightweight baseline)
  - *Llama 3.x* (Strong open-weight baseline)
- [ ] Produce the **Model Selection Report** to formally document why the base model was chosen.
- [ ] Establish PEFT / LoRA training pipelines (Lab D).

## Future Milestones
### v0.5: Multilingual Alpha
- A fully trained adapter capable of reasoning fluidly in English, Nigerian Pidgin, Yoruba, and Hausa.

### v1.0: Tool Calling
- Training the model to reliably emit structured tool calls (e.g., `<search_market>`, `<get_price>`) rather than hallucinating static prices.
