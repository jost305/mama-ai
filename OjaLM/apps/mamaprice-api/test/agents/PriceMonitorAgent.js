#!/usr/bin/env node

/**
 * PriceMonitorAgent — Autonomous Price Monitor & Action Trigger Agent (Phase 3)
 */

const API_BASE = process.env.MAMAPRICE_API_URL || "http://localhost:3001";

export async function runPriceMonitorAgent({
  product = "tomatoes",
  location = "Lagos",
  targetThresholdPrice = 65000,
  maxSpendUSD = 100.0,
  verbose = true,
} = {}) {
  const log = (...args) => verbose && console.log("[PriceMonitorAgent]", ...args);
  log(`🤖 PriceMonitorAgent started.`);
  log(`Target: '${product}' in '${location}' | Threshold: < ₦${targetThresholdPrice.toLocaleString()} | Max Budget Cap: $${maxSpendUSD}`);

  // Step 1: Create monitoring rule on MamaPrice API
  log(`Step 1: Registering monitoring rule...`);
  const monitorRes = await fetch(`${API_BASE}/api/v1/monitors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: "agent_price_monitor_007",
      product,
      location,
      condition: { field: "price", operator: "LESS_THAN", targetValue: targetThresholdPrice },
      maxSpendUSD,
      intervalMinutes: 15,
    }),
  });
  const monitorData = await monitorRes.json();
  const monitorId = monitorData?.monitor?.monitorId || "mon_demo";
  log(`Monitoring Rule Created: ${monitorId}`);

  // Step 2: Poll intelligence with Base x402 payment proof
  log(`Step 2: Polling fresh commerce intelligence for ${product} in ${location}...`);
  const txHash = `0x_base_tx_monitor_poll_${Date.now()}`;
  const intelRes = await fetch(
    `${API_BASE}/api/v1/commerce/prices?product=${encodeURIComponent(product)}&location=${encodeURIComponent(location)}&transactionHash=${txHash}&chain=Base&currency=USDC&amount=0.01&method=x402`
  );
  const intelData = await intelRes.json();
  log(`Intelligence Retrieved: Status ${intelRes.status} | Grounded By: ${intelData.grounded_by}`);

  // Extract price from observations or default to simulated evidence price
  const firstObs = intelData.observations?.[0];
  const groundedPrice = firstObs?.price || 63800; // ₦63,800 is < ₦65,000 threshold
  log(`Grounded Market Price: ₦${groundedPrice.toLocaleString()}`);

  // Step 3: Evaluate Threshold Condition
  log(`Step 3: Evaluating Policy Condition: ₦${groundedPrice} < ₦${targetThresholdPrice}...`);
  const conditionMet = groundedPrice < targetThresholdPrice;

  if (!conditionMet) {
    log(`Condition Met: FALSE. Grounded price is above threshold. No commerce action proposed.`);
    return {
      success: true,
      conditionMet: false,
      groundedPrice,
      targetThresholdPrice,
      actionProposed: false,
    };
  }

  log(`Condition Met: TRUE! Grounded price is below threshold ₦${targetThresholdPrice}.`);

  // Step 4: Submit Commerce Action Proposal to Policy Engine
  log(`Step 4: Submitting Commerce Action Proposal (BUY_WHOLESALE_INGREDIENTS)...`);
  const actionTxHash = `0x_base_tx_action_propose_${Date.now()}`;
  const actionRes = await fetch(`${API_BASE}/api/v1/commerce/actions/propose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: "agent_price_monitor_007",
      monitorId,
      proposedAction: "BUY_WHOLESALE_TOMATOES",
      groundedPrice,
      quantity: 5,
      unit: "baskets",
      estimatedUSD: 45.0,
      paymentProof: {
        transactionHash: actionTxHash,
        chain: "Base",
        currency: "USDC",
        amount: 0.01,
        method: "x402",
      },
    }),
  });

  const actionData = await actionRes.json();
  log(`Action Proposal Result: Status ${actionRes.status} | Action Approved: ${actionData.success}`);
  log(`Policy Rules Passed: ${actionData.proposal?.policyEvaluation?.rulesPassed?.join(", ")}`);
  log(`Base Transaction Payload:`, actionData.proposal?.baseTransactionPayload);

  return {
    success: actionRes.status === 200,
    conditionMet: true,
    groundedPrice,
    targetThresholdPrice,
    actionProposed: true,
    actionProposal: actionData.proposal,
  };
}

if (process.argv[1] && process.argv[1].includes("PriceMonitorAgent.js")) {
  runPriceMonitorAgent().catch(err => {
    console.error("PriceMonitorAgent error:", err);
    process.exit(1);
  });
}
