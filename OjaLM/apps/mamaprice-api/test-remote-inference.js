const API_BASE = process.env.MAMAPRICE_API_URL || "http://localhost:3001";

async function runTests() {
    console.log("==================================================");
    console.log(" 🧪 MAMAPRICE API + OJALM INFERENCE TEST SUITE");
    print(` Target API: ${API_BASE}`);
    console.log("==================================================");

    // 1. Status Check
    console.log("\n1. Testing GET /api/status...");
    try {
        const res = await fetch(`${API_BASE}/api/status`);
        const statusData = await res.json();
        console.log("   Status Code:", res.status);
        console.log("   API Response:", JSON.stringify(statusData, null, 2));
        if (res.status === 200 && statusData.status === "ok") {
            console.log("   ✓ GET /api/status PASSED!");
        } else {
            console.error("   ❌ GET /api/status FAILED!");
        }
    } catch (err) {
        console.error("   ❌ GET /api/status Error:", err.message);
    }

    // 2. Identity Query Test ("Hello, who are you?")
    console.log("\n2. Testing POST /api/chat (Identity Query)...");
    try {
        const res = await fetch(`${API_BASE}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: "Hello, who are you?",
                sessionId: "test-session-01"
            })
        });
        const chatData = await res.json();
        console.log("   Status Code:", res.status);
        console.log("   Provider Used:", chatData.provider);
        console.log("   Model Used:", chatData.modelUsed || chatData.model);
        console.log("\n   Response Content:");
        console.log("   --------------------------------------------------");
        console.log("   " + chatData.response);
        console.log("   --------------------------------------------------");
        if (res.status === 200 && chatData.response) {
            console.log("   ✓ Identity Query PASSED!");
        } else {
            console.error("   ❌ Identity Query FAILED!");
        }
    } catch (err) {
        console.error("   ❌ Identity Query Error:", err.message);
    }

    // 3. Grounded Commerce RAG Query Test ("Where is rice cheapest in Ibadan?")
    console.log("\n3. Testing POST /api/chat (Grounded Commerce Query)...");
    try {
        const res = await fetch(`${API_BASE}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: "Where is rice cheapest in Ibadan?",
                sessionId: "test-session-02"
            })
        });
        const chatData = await res.json();
        console.log("   Status Code:", res.status);
        console.log("   Provider Used:", chatData.provider);
        console.log("   Intents Detected:", chatData.intents);
        console.log("\n   Response Content:");
        console.log("   --------------------------------------------------");
        console.log("   " + chatData.response);
        console.log("   --------------------------------------------------");
        if (res.status === 200 && chatData.response) {
            console.log("   ✓ Grounded Commerce Query PASSED!");
        } else {
            console.error("   ❌ Grounded Commerce Query FAILED!");
        }
    } catch (err) {
        console.error("   ❌ Grounded Commerce Query Error:", err.message);
    }
}

function print(msg) {
    console.log(msg);
}

runTests();
