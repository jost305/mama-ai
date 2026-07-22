import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

import { customMiddleware } from "./custom-middleware";

// Using free OpenRouter model: Meta Llama 3.1 8B - completely free on OpenRouter
// OpenRouter API is compatible with OpenAI API format
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export const geminiProModel = wrapLanguageModel({
  model: openrouter("meta-llama/llama-3.1-8b-instruct") as any,
  middleware: customMiddleware,
});

export const geminiFlashModel = wrapLanguageModel({
  model: openrouter("meta-llama/llama-3.1-8b-instruct") as any,
  middleware: customMiddleware,
});
