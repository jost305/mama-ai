#!/usr/bin/env node

/**
 * MarketMonitor — Regional Wholesale Commodity Market Monitoring Agent
 * Demonstrates an autonomous AI agent executing multi-market comparisons using Base x402
 */

const API_BASE = process.env.MAMAPRICE_API_URL || "http://localhost:3001";

export async function runMarketMonitor({ product = "rice", markets = ["Lagos", "Ibadan", "Kano"], verbose = true } = {}) {
  const log = (...args) => verbose && console.log("[MarketMonitor]", ...args);
  log(`📊 MarketMonitor initialized. Target commodity: '${product}' across ${markets.length} markets: ${markets.join(", ")}.`);

  const marketResults = [];

  for (const location of markets) {
    log(`\n--- Fetching market data for ${product} in ${location} ---`);

    // Step 1: Initial query (receives 402 challenge)
    const initRes = await fetch(`${API_BASE}/api/v1/commerce/prices?product=${encodeURIComponent(product)}&location=${encodeURIComponent(location)}`);
    if (initRes.status !== 402) {
      log(`⚠️ Expected 402 for ${location}, got ${initRes.status}`);
      continue;
    }

    const challenge = await initRes.json();
    log(`Received 402 challenge for ${location}. Charge: ${challenge?.challenge?.payment?.amount} ${challenge?.challenge?.payment?.currency} on ${challenge?.challenge?.payment?.network}`);

    // Step 2: Payment proof on Base
    const txHash = `0x_base_tx_market_monitor_${location.toLowerCase()}_${Date.now()}`;
    const paymentProof = {
      transactionHash: txHash,
      chain: "Base",
      currency: "USDC",
      amount: 0.01,
      method: "x402",
    };

    // Step 3: Replay query
    const replayRes = await fetch(
      `${API_BASE}/api/v1/commerce/prices?product=${encodeURIComponent(product)}&location=${encodeURIComponent(location)}&transactionHash=${paymentProof.transactionHash}&chain=${paymentProof.chain}&currency=${paymentProof.currency}&amount=${paymentProof.amount}&method=${paymentProof.method}`
    );

    const data = await replayRes.json();
    if (replayRes.status === 200) {
      log(`✅ Verified payment for ${location}! Data retrieved.`);
      marketResults.push({
        location,
        product,
        observationsCount: data.observations?.length || 0,
        trend: data.analysis?.trend || "STABLE",
        responseSnippet: (data.response || "").slice(0, 120) + "...",
        paymentRecord: data.payment?.record,
      });
    } else {
      log(`❌ Failed for ${location}: ${replayRes.status}`);
    }
  }

  log("\n==========================================================");
  log(`📈 MarketMonitor Summary Report for ${product.toUpperCase()}:`);
  log(`Total Markets Queried: ${markets.length} | Successfully Paid & Verified: ${marketResults.length}`);
  log(JSON.stringify(marketResults, null, 2));
  log("==========================================================");

  return {
    success: marketResults.length === markets.length,
    product,
    marketsCount: markets.length,
    results: marketResults,
  };
}

if (process.argv[1] && process.argv[1].includes("MarketMonitor.js")) {
  runMarketMonitor().catch(err => {
    console.error("MarketMonitor error:", err);
    process.exit(1);
  });
}
