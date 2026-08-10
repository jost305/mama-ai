import dotenv from "dotenv";
dotenv.config();

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "openrouter/free";

const COMMERCE_QUERY_KEYWORDS = [
    "price", "cost", "how much", "naira", "ngn", "rate", "sold", "buy", "buying",
    "vendor", "seller", "shop", "store", "trader", "merchant", "stall",
    "market", "bodija", "mile 12", "dawanau", "oyingbo", "onitsha", "ariaria", "balogun", "computer village", "sabon gari", "dugbe", "kuto", "ikeja",
    "available", "stock", "out of stock", "in stock", "find", "where to buy", "sold out",
    "rice", "tomato", "tomatoes", "pepper", "cement", "garri", "yam", "oil", "palm oil", "eggs", "flour", "fuel", "petrol", "pms", "steel", "rebar", "rent",
    "cheapest", "compare", "discount", "voucher", "earnings", "scout", "agent report", "observation"
];

function isCommerceQuery(query) {
    if (!query) return false;
    const q = query.toLowerCase().trim();
    return COMMERCE_QUERY_KEYWORDS.some(kw => q.includes(kw));
}

const FALLBACK_SYSTEM_PROMPT = `You are MamaPrice's fallback assistant.
MamaPrice is an AI-powered commerce intelligence platform for African markets.
You are operating as a temporary fallback because MamaPrice's primary OjaLM inference service is unavailable.
You may answer general questions about MamaPrice and general conversational questions.
You MUST NOT invent current prices, vendors, market conditions, agent reports, earnings, availability, or other live commerce information.
When a question requires live MamaPrice data that is unavailable, clearly explain that live commerce intelligence is temporarily unavailable.
Keep responses concise, helpful, and natural.`;

async function queryFallbackLLM(prompt, options = {}) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY environment variable is not configured.");
    }

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs || 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        console.log(`[LLM] Requesting OpenRouter FREE fallback model (${OPENROUTER_MODEL})...`);
        const res = await fetch(OPENROUTER_ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    { role: "system", content: FALLBACK_SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 500
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`OpenRouter API error (${res.status}): ${errText}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error("Invalid or empty response from OpenRouter free model.");
        }

        return {
            content: content.trim(),
            provider: "openrouter",
            model: OPENROUTER_MODEL,
            fallback: true
        };
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

async function simulateInference(prompt, forceOjaLMFail = false, forceOpenRouterFail = false) {
    console.log(`\n==================================================`);
    console.log(`TEST PROMPT: "${prompt}" (forceOjaLMFail=${forceOjaLMFail}, forceOpenRouterFail=${forceOpenRouterFail})`);
    
    // Step 1: OjaLM Primary Inference
    if (!forceOjaLMFail) {
        console.log(`[LLM] provider=ojalm fallback=false`);
        return {
            provider: "ojalm",
            fallback: false,
            response: `OjaLM Primary Response for "${prompt}"`
        };
    }

    // Step 2: Fallback Route
    console.warn("⚠️ [LLM] OjaLM primary inference service unavailable. Activating fallback pipeline...");
    const isCommerce = isCommerceQuery(prompt);

    if (isCommerce) {
        console.log("[LLM] provider=static fallback=true reason=commerce_query_protection");
        return {
            provider: "static",
            fallback: true,
            reason: "commerce_query_protection",
            response: "Sorry, MamaPrice's live commerce intelligence is temporarily unavailable. Please try again shortly."
        };
    }

    if (forceOpenRouterFail) {
        console.log("[LLM] provider=static fallback=true reason=openrouter_failed");
        return {
            provider: "static",
            fallback: true,
            reason: "openrouter_failed",
            response: "I'm having trouble responding right now. Please try again shortly."
        };
    }

    try {
        const fallbackRes = await queryFallbackLLM(prompt);
        console.log(`[LLM] provider=openrouter fallback=true model=${fallbackRes.model}`);
        return fallbackRes;
    } catch (err) {
        console.warn("⚠️ OpenRouter error:", err.message);
        console.log("[LLM] provider=static fallback=true reason=openrouter_failed");
        return {
            provider: "static",
            fallback: true,
            reason: "openrouter_failed",
            response: "I'm having trouble responding right now. Please try again shortly."
        };
    }
}

async function runAllTests() {
    console.log("Starting MamaPrice Fallback Routing Verification Suite...\n");

    // Test 1: Normal working request
    const t1 = await simulateInference("What is MamaPrice?", false);
    console.log("Result T1:", t1);

    // Test 2: Forced OjaLM failure with non-commerce query (OpenRouter fallback)
    const t2 = await simulateInference("Hello, who are you?", true);
    console.log("Result T2:", t2);

    // Test 3: Forced OjaLM failure with commerce query (Commerce protection guard)
    const t3 = await simulateInference("What is rice selling for in Bodija today?", true);
    console.log("Result T3:", t3);

    // Test 4: Forced both OjaLM & OpenRouter failure
    const t4 = await simulateInference("Hello, who are you?", true, true);
    console.log("Result T4:", t4);

    // Test 5: Commerce query with vendor check under OjaLM failure
    const t5 = await simulateInference("Which vendor has the cheapest cement in Mile 12?", true);
    console.log("Result T5:", t5);

    console.log("\n✅ All 5 Fallback Verification Tests Execution Completed.");
}

runAllTests().catch(err => console.error("Test Suite Error:", err));
