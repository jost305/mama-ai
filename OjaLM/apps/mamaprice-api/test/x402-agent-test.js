#!/usr/bin/env node

const API_BASE = process.env.MAMAPRICE_API_URL || "http://localhost:3001";

async function main() {
  const prompt = "What is the current price of tomatoes in Lagos?";
  console.log(`Requesting paid commerce intel for: ${prompt}`);

  // Step 1: initial request without paymentProof
  let res = await fetch(`${API_BASE}/api/commerce/intel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (res.status === 402) {
    const challenge = await res.json();
    console.log("Received 402 challenge:", JSON.stringify(challenge, null, 2));

    // If test mode enabled, create a fake transaction and replay
    if (process.env.X402_TEST_ACCEPT === "true") {
      console.log("X402_TEST_ACCEPT=true, simulating payment on Base Sepolia...");
      const fakeTx = `sep_tx_${Date.now()}`;
      const paymentProof = {
        transactionHash: fakeTx,
        chain: (challenge?.challenge?.payment?.network) || "Base",
        currency: (challenge?.challenge?.payment?.currency) || "USDC",
        amount: (challenge?.challenge?.payment?.amount) || 0.01,
        method: "x402",
      };

      const replay = await fetch(`${API_BASE}/api/commerce/intel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, paymentProof }),
      });

      const body = await replay.json();
      console.log("Replay response:", replay.status, JSON.stringify(body, null, 2));
      return;
    }

    console.log("Not in test accept mode. Please pay the challenge on Base Sepolia and replay the request with proof.");
    return;
  }

  const data = await res.json();
  console.log("Response status:", res.status, JSON.stringify(data, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
