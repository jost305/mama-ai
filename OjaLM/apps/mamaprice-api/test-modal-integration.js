/**
 * Integration Test: MamaPrice API connected to Modal GPU OjaLM Inference Engine
 */

async function testModalIntegration() {
    console.log("==================================================");
    console.log(" 🧪 MAMAPRICE API + MODAL OJALM INTEGRATION TEST");
    console.log("==================================================");

    const targetUrl = "http://localhost:3001/chat";
    const payload = {
        prompt: "What is the current price of 50kg Rice in Lagos?",
        sessionId: "test-modal-session",
        modelId: "MamaPrice 4o"
    };

    console.log(`Sending POST to ${targetUrl}...`);
    try {
        const res = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log(`HTTP Status: ${res.status}`);
        const parsed = await res.json();
        
        console.log("\n--- RESPONSE PAYLOAD ---");
        console.log(`Provider: ${parsed.provider}`);
        console.log(`Fallback: ${parsed.fallback}`);
        console.log(`Intents Detected: ${JSON.stringify(parsed.intents)}`);
        console.log("\nGenerated Text:\n", parsed.response);
        console.log("------------------------");

        if (parsed.provider === 'ojalm-modal' && parsed.fallback === false) {
            console.log("\n✅ SUCCESS: MamaPrice API successfully powered by Modal GPU OjaLM!");
        } else {
            console.log(`\n⚠️ Note: Provider was '${parsed.provider}' (fallback=${parsed.fallback})`);
        }
    } catch (e) {
        console.error("HTTP Request Error:", e.message);
    }
}

testModalIntegration();
