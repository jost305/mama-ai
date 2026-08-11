#!/usr/bin/env node

/**
 * Phase 1 End-to-End Test Suite for MamaPrice x Base Commerce API
 */

import http from "http";

const API_BASE = process.env.MAMAPRICE_API_URL || "http://localhost:3001";
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const method = options.method || "GET";
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const body = options.body ? JSON.stringify(options.body) : undefined;

  const res = await fetch(url, { method, headers, body });
  let json = null;
  try {
    json = await res.json();
  } catch (_) {}
  return { status: res.status, headers: res.headers, data: json };
}

async function runSuite() {
  console.log("==========================================================");
  console.log("⚡ Starting Phase 1 MamaPrice × Base Integration Test Suite");
  console.log("==========================================================");

  // Test 1: Request without payment proof -> 402
  console.log("\n[Test 1] Request without payment proof");
  const res1 = await request("/api/commerce/intel", {
    method: "POST",
    body: { prompt: "What is the price of garri in Ibadan?" },
  });
  assert(res1.status === 402, `Expected status 402, got ${res1.status}`);
  assert(res1.data?.challenge?.code === "x402", "Expected x402 challenge code in response");
  assert(res1.data?.challenge?.payment?.network === "Base", "Expected payment network to be Base");

  // Test 2: Invalid payment proof format -> 422
  console.log("\n[Test 2] Malformed payment proof");
  const res2 = await request("/api/commerce/intel", {
    method: "POST",
    body: { prompt: "What is the price of garri in Ibadan?", paymentProof: { invalid: true } },
  });
  assert(res2.status === 422, `Expected status 422 for malformed proof, got ${res2.status}`);
  assert(res2.data?.verified === false, "Expected verified to be false");

  // Test 3: Wrong network -> 422
  console.log("\n[Test 3] Payment on wrong network (Ethereum)");
  const res3 = await request("/api/commerce/intel", {
    method: "POST",
    body: {
      prompt: "What is the price of garri in Ibadan?",
      paymentProof: {
        transactionHash: "0x123",
        chain: "Ethereum",
        currency: "USDC",
        amount: 0.01,
        method: "x402",
      },
    },
  });
  assert(res3.status === 422, `Expected status 422 for wrong network, got ${res3.status}`);
  assert(res3.data?.errors?.some(e => e.includes("chain must be Base")), "Expected error mentioning chain must be Base");

  // Test 4: Insufficient payment amount -> 422
  console.log("\n[Test 4] Insufficient payment amount");
  const res4 = await request("/api/commerce/intel", {
    method: "POST",
    body: {
      prompt: "What is the price of garri in Ibadan?",
      paymentProof: {
        transactionHash: "0x124",
        chain: "Base",
        currency: "USDC",
        amount: 0.001,
        method: "x402",
      },
    },
  });
  assert(res4.status === 422, `Expected status 422 for wrong amount, got ${res4.status}`);

  // Test 5: Valid Base payment proof -> 200 OK + grounded commerce response
  console.log("\n[Test 5] Valid Base payment proof");
  const validTxHash = `0x_base_tx_test_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const res5 = await request("/api/commerce/intel", {
    method: "POST",
    body: {
      prompt: "What is the price of tomatoes in Lagos?",
      paymentProof: {
        transactionHash: validTxHash,
        chain: "Base",
        currency: "USDC",
        amount: 0.01,
        method: "x402",
      },
    },
  });
  assert(res5.status === 200, `Expected status 200 for valid Base payment, got ${res5.status}`);
  assert(res5.data?.success === true, "Expected success to be true");
  assert(typeof res5.data?.response === "string" && res5.data?.response.length > 0, "Expected non-empty intelligence response");

  // Test 6: Replay attack (reuse previous valid transaction hash) -> 409
  console.log("\n[Test 6] Replay previous payment proof");
  const res6 = await request("/api/commerce/intel", {
    method: "POST",
    body: {
      prompt: "What is the price of tomatoes in Lagos?",
      paymentProof: {
        transactionHash: validTxHash,
        chain: "Base",
        currency: "USDC",
        amount: 0.01,
        method: "x402",
      },
    },
  });
  assert(res6.status === 409, `Expected status 409 for payment replay attack, got ${res6.status}`);
  assert(res6.data?.error === "PAYMENT_ALREADY_PROCESSED", "Expected error PAYMENT_ALREADY_PROCESSED");

  // Test 7: OjaGraph Grounding -> evidence exists
  console.log("\n[Test 7] OjaGraph evidence grounding verification");
  assert(res5.data?.evidence !== undefined, "Expected evidence payload from OjaGraph");

  // Test 8: OjaLM Inference execution
  console.log("\n[Test 8] OjaLM provider & inference verification");
  assert(typeof res5.data?.provider === "string", `Expected provider string, got ${res5.data?.provider}`);

  // Test 9: GET /api/v1/commerce/prices machine-facing endpoint
  console.log("\n[Test 9] GET /api/v1/commerce/prices machine-facing endpoint");
  const getTxHash = `0x_base_tx_get_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const res9 = await request(
    `/api/v1/commerce/prices?product=rice&location=Lagos&transactionHash=${getTxHash}&chain=Base&currency=USDC&amount=0.01&method=x402`
  );
  assert(res9.status === 200, `Expected GET endpoint status 200, got ${res9.status}`);
  assert(res9.data?.product === "rice", "Expected product field in GET response");
  assert(res9.data?.grounded_by === "OjaGraph", "Expected grounded_by field to be OjaGraph");
  assert(res9.data?.generated_by === "OjaLM", "Expected generated_by field to be OjaLM");

  console.log("\n==========================================================");
  console.log(`📊 Test Summary: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
  console.log("==========================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error("Test suite fatal error:", err);
  process.exit(1);
});
