#!/usr/bin/env node

/**
 * Phase 3 — Agent Monitoring & Autonomous Commerce Decisioning Test Suite
 */

import { runPriceMonitorAgent } from "./agents/PriceMonitorAgent.js";
import { evaluatePolicy } from "../policy-engine.js";

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

async function runSuite() {
  console.log("==========================================================");
  console.log("⚡ Starting Phase 3 — Agent Monitoring & Autonomous Commerce Test Suite");
  console.log("==========================================================");

  // Test 1: Monitoring rule creation endpoint
  console.log("\n[Test 1] POST /api/v1/monitors — Create monitoring rule");
  const monRes = await fetch("http://localhost:3001/api/v1/monitors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: "test_agent_001",
      product: "tomatoes",
      location: "Lagos",
      condition: { field: "price", operator: "LESS_THAN", targetValue: 65000 },
      maxSpendUSD: 100,
    }),
  });
  const monData = await monRes.json();
  assert(monRes.status === 200, `Expected status 200, got ${monRes.status}`);
  assert(monData.success === true, "Expected success: true");
  assert(typeof monData.monitor?.monitorId === "string", "Expected string monitorId");

  // Test 2: Deterministic Policy Engine Budget Cap Rejection (> $100 cap)
  console.log("\n[Test 2] Policy Engine — Reject action exceeding spending cap ($150 > $100 cap)");
  const overCapEval = evaluatePolicy({
    proposedAction: "BUY_BULK_TOMATOES",
    groundedPrice: 60000,
    thresholdCondition: { operator: "LESS_THAN", targetValue: 65000 },
    estimatedUSD: 150.0, // Exceeds $100 cap
    asset: "USDC",
    chain: "Base",
  });
  assert(overCapEval.approved === false, "Policy Engine correctly rejected action exceeding $100 cap");
  assert(overCapEval.errors.some(e => e.includes("exceeds maximum allowable cap")), "Error message mentions spending cap");

  // Test 3: Deterministic Policy Engine Approval (< $100 cap and price < threshold)
  console.log("\n[Test 3] Policy Engine — Approve valid action ($45 < $100 cap, 63800 < 65000)");
  const validEval = evaluatePolicy({
    proposedAction: "BUY_WHOLESALE_TOMATOES",
    groundedPrice: 63800,
    thresholdCondition: { operator: "LESS_THAN", targetValue: 65000 },
    estimatedUSD: 45.0,
    asset: "USDC",
    chain: "Base",
  });
  assert(validEval.approved === true, "Policy Engine correctly approved valid action proposal");
  assert(validEval.rulesPassed.includes("WITHIN_SPENDING_CAP"), "Rules passed includes WITHIN_SPENDING_CAP");

  // Test 4: Run PriceMonitorAgent End-to-End
  console.log("\n[Test 4] Running PriceMonitorAgent End-to-End...");
  const agentResult = await runPriceMonitorAgent({
    product: "tomatoes",
    location: "Lagos",
    targetThresholdPrice: 65000,
    maxSpendUSD: 100,
    verbose: false,
  });
  assert(agentResult.success === true, "PriceMonitorAgent executed successfully");
  assert(agentResult.conditionMet === true, "PriceMonitorAgent evaluated conditionMet as TRUE");
  assert(agentResult.actionProposed === true, "PriceMonitorAgent submitted action proposal");
  assert(agentResult.actionProposal?.actionStatus === "SIMULATED_SUCCESS", "Action proposal status is SIMULATED_SUCCESS");
  assert(agentResult.actionProposal?.baseTransactionPayload?.asset === "USDC", "Base transaction payload asset is USDC");

  console.log("\n==========================================================");
  console.log(`📊 Phase 3 Test Summary: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
  console.log("==========================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error("Phase 3 test suite fatal error:", err);
  process.exit(1);
});
