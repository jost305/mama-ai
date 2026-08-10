import dotenv from "dotenv";
dotenv.config();

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "openrouter/free";

const FALLBACK_SYSTEM_PROMPT = `You are MamaPrice, an AI-powered commerce assistant built to help people and businesses navigate African markets.

Your job is to help users discover products, understand prices, compare markets and vendors, find better purchasing opportunities, understand commerce information, and navigate the MamaPrice platform.

Speak naturally, confidently, and helpfully.

You are part of the MamaPrice product. Never describe yourself as a fallback assistant, secondary assistant, backup model, or alternative model.

Never mention model providers, inference infrastructure, APIs, servers, outages, failover systems, or internal architecture.

Never tell the user that another model is unavailable.

Maintain the same identity, tone, and conversational behavior as MamaPrice regardless of which underlying model is generating the response.

When verified MamaPrice commerce evidence is provided to you, use that evidence to answer the user's question.

Do not invent prices, vendors, markets, earnings, agent reports, availability, or other factual commerce information.

When the required information is not available in the provided evidence or tools, be honest about what you know and what you cannot verify, but do not reveal internal system limitations or model failover.

Do not fabricate missing information.

Answer naturally and directly.

You are MamaPrice.`;

async function queryFallbackLLM(prompt, options = {}) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY environment variable is not configured.");
    }

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs || 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        console.log(`[LLM] Requesting secondary inference engine (${OPENROUTER_MODEL})...`);
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
            throw new Error(`Secondary engine API error (${res.status}): ${errText}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error("Invalid or empty response from secondary inference engine.");
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

async function simulateInference(userQuery, ojaGraphEvidence = "", forceOjaLMFail = false, forceSecondaryFail = false) {
    console.log(`\n==================================================`);
    console.log(`QUERY: "${userQuery}" (OjaGraph Evidence Present: ${Boolean(ojaGraphEvidence)})`);

    const augmentedPrompt = ojaGraphEvidence 
        ? `=== GROUNDED OJAGRAPH EVIDENCE ===\n${ojaGraphEvidence}\n\nUSER QUESTION: ${userQuery}`
        : userQuery;

    // Step 1: OjaLM Primary Inference
    if (!forceOjaLMFail) {
        console.log(`[LLM] provider=ojalm fallback=false`);
        return {
            provider: "ojalm",
            fallback: false,
            response: `I'm MamaPrice! Here is your commerce answer for "${userQuery}".`
        };
    }

    // Step 2: Silent Secondary Failover (receives SAME augmentedPrompt & evidence)
    console.warn("⚠️ [LLM] Primary OjaLM unavailable. Executing secondary inference engine silently...");

    if (forceSecondaryFail) {
        console.log("[LLM] provider=static fallback=true reason=secondary_engine_failed");
        let staticMsg = "I'm having trouble finding verified market information for your query right now. Please check back shortly or try rephrasing your search!";
        if (ojaGraphEvidence) {
            staticMsg = `Here is the latest verified MamaPrice market snapshot for your query:\n\n${ojaGraphEvidence}`;
        }
        return {
            provider: "static",
            fallback: true,
            reason: "secondary_engine_failed",
            response: staticMsg
        };
    }

    try {
        const secondaryRes = await queryFallbackLLM(augmentedPrompt);
        console.log(`[LLM] provider=openrouter fallback=true model=${secondaryRes.model}`);
        return secondaryRes;
    } catch (err) {
        console.warn("⚠️ Secondary inference error:", err.message);
        console.log("[LLM] provider=static fallback=true reason=secondary_engine_failed");
        return {
            provider: "static",
            fallback: true,
            reason: "secondary_engine_failed",
            response: "I'm having trouble finding verified market information for your query right now. Please check back shortly!"
        };
    }
}

async function runAllTests() {
    console.log("Starting Seamless MamaPrice Failover Acceptance Test Suite...\n");

    // Test A: Hi (Primary OjaLM working)
    const tA1 = await simulateInference("Hi, who are you?", "", false);
    console.log("Result T-A1 (Primary Active):", tA1.response);

    // Test B: Hi (Secondary Failover active)
    const tB1 = await simulateInference("Hi, who are you?", "", true);
    console.log("\nResult T-B1 (Silent Failover - Identity Check):", tB1.content || tB1.response);

    // Test C: Rice price query in Ibadan WITH OjaGraph evidence (Secondary Failover active)
    const mockIbadanEvidence = "Bodija Market: 50kg rice — ₦73,500 (95% confidence)\nDugbe Market: 50kg rice — ₦76,000 (91% confidence)";
    const tC1 = await simulateInference("Where can I get cheaper rice in Ibadan?", mockIbadanEvidence, true);
    console.log("\nResult T-C1 (Silent Failover - OjaGraph Evidence Answer):", tC1.content || tC1.response);

    console.log("\n✅ All Failover Acceptance Tests Execution Completed.");
}

runAllTests().catch(err => console.error("Test Suite Error:", err));
