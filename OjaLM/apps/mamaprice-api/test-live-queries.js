const API_BASE = "http://localhost:3001";

async function testQuery(label, prompt) {
    console.log(`\n==================================================`);
    console.log(` 🧪 TEST: ${label}`);
    console.log(`    Prompt: "${prompt}"`);
    console.log(`==================================================`);

    try {
        const start = Date.now();
        const res = await fetch(`${API_BASE}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt,
                sessionId: "live-verification-sess",
                modelId: "OjaLM v0.1"
            })
        });

        const elapsed = Date.now() - start;
        const data = await res.json();

        console.log(`   Status Code: ${res.status}`);
        console.log(`   Provider: ${data.provider}`);
        console.log(`   Model: ${data.model || data.modelUsed}`);
        console.log(`   Latency: ${elapsed} ms`);
        console.log(`\n   --- MAMAPRICE RESPONSE ---`);
        console.log(data.response);
        console.log(`   --------------------------`);
    } catch (err) {
        console.error(`❌ Query Error:`, err.message);
    }
}

async function main() {
    await testQuery("1. Identity", "Hello, who are you?");
    await testQuery("2. Capabilities", "What can you help me with?");
    await testQuery("3. Grounded Rice Query (Ibadan)", "What are the current rice prices in Ibadan?");
    await testQuery("4. Grounded Market Comparison", "Compare rice prices between Bodija and another market you have data for.");
}

main();
