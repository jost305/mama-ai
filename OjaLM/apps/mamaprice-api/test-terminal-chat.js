async function testChat(query) {
    console.log(`\n==================================================`);
    console.log(` 💬 MAMAPRICE TERMINAL CHAT TEST`);
    console.log(`==================================================`);
    console.log(`User Question: "${query}"\n`);
    console.log(`Sending request to http://127.0.0.1:3001/chat...`);

    const start = Date.now();
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s client timeout for CPU inference

        const res = await fetch('http://127.0.0.1:3001/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: query,
                sessionId: `term_${Date.now()}`,
                modelId: 'MamaPrice 4o'
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await res.json();
        const duration = ((Date.now() - start) / 1000).toFixed(2);

        console.log(`\n--- RESPONSE RECEIVED (${duration}s) ---`);
        console.log(`Provider  : ${data.provider}`);
        console.log(`Fallback  : ${data.fallback}`);
        console.log(`Model Used: ${data.modelUsed}`);
        console.log(`Intents   : ${JSON.stringify(data.intents)}`);
        console.log(`\n--- MAMAPRICE AI ANSWER ---`);
        console.log(data.response);
        console.log(`==================================================\n`);
    } catch (err) {
        console.error("❌ Terminal chat error:", err.message);
    }
}

const userQuery = process.argv[2] || "Where can I buy the cheapest 50kg bag of Rice in Lagos?";
testChat(userQuery);
