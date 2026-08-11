/**
 * Deterministic Threshold Policy Engine
 * Evaluates agent action proposals against strict budget caps, approved assets, and price threshold rules.
 */

export const MAX_TRANSACTION_CAP_USD = Number(process.env.MAX_TRANSACTION_CAP_USD || "100.0");
export const APPROVED_ASSETS = ["USDC"];
export const APPROVED_CHAINS = ["Base"];

export function evaluatePolicy({ proposedAction, groundedPrice, thresholdCondition, estimatedUSD, asset = "USDC", chain = "Base" }) {
  const rulesPassed = [];
  const errors = [];

  // Check 1: Chain approval
  if (!APPROVED_CHAINS.map(c => c.toLowerCase()).includes(chain.toLowerCase())) {
    errors.push(`Chain '${chain}' is not approved. Must be Base.`);
  } else {
    rulesPassed.push("APPROVED_CHAIN_BASE");
  }

  // Check 2: Asset approval
  if (!APPROVED_ASSETS.map(a => a.toUpperCase()).includes(asset.toUpperCase())) {
    errors.push(`Asset '${asset}' is not approved. Must be USDC.`);
  } else {
    rulesPassed.push("APPROVED_ASSET_USDC");
  }

  // Check 3: Spending Cap limit
  if (typeof estimatedUSD !== "number" || estimatedUSD <= 0) {
    errors.push("Invalid estimatedUSD amount.");
  } else if (estimatedUSD > MAX_TRANSACTION_CAP_USD) {
    errors.push(`Action estimate ($${estimatedUSD}) exceeds maximum allowable cap of $${MAX_TRANSACTION_CAP_USD}.`);
  } else {
    rulesPassed.push("WITHIN_SPENDING_CAP");
  }

  // Check 4: Threshold Condition evaluation
  if (thresholdCondition && typeof thresholdCondition === "object") {
    const { operator, targetValue } = thresholdCondition;
    if (operator === "LESS_THAN" && typeof groundedPrice === "number") {
      if (groundedPrice < targetValue) {
        rulesPassed.push(`THRESHOLD_MET (${groundedPrice} < ${targetValue})`);
      } else {
        errors.push(`Price condition not met: grounded price ${groundedPrice} is not less than target ${targetValue}.`);
      }
    } else if (operator === "GREATER_THAN" && typeof groundedPrice === "number") {
      if (groundedPrice > targetValue) {
        rulesPassed.push(`THRESHOLD_MET (${groundedPrice} > ${targetValue})`);
      } else {
        errors.push(`Price condition not met: grounded price ${groundedPrice} is not greater than target ${targetValue}.`);
      }
    }
  }

  // Check 5: Emergency Kill Switch
  if (process.env.AGENT_KILL_SWITCH === "true") {
    errors.push("EMERGENCY_KILL_SWITCH_ACTIVE: All autonomous actions are currently disabled.");
  }

  const approved = errors.length === 0;

  return {
    approved,
    rulesPassed,
    errors,
    spendingCapUSD: MAX_TRANSACTION_CAP_USD,
    proposedSpendUSD: estimatedUSD,
    timestamp: new Date().toISOString(),
  };
}
