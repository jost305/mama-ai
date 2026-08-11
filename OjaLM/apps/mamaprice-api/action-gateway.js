/**
 * Action Gateway & Monitoring Manager
 * Stores agent monitoring rules and processes action proposals through policy evaluation.
 */

import { evaluatePolicy } from "./policy-engine.js";

const monitorsStore = new Map();
const actionProposalsStore = [];

export function createMonitor({ agentId, product, location, condition, maxSpendUSD = 100, intervalMinutes = 15 }) {
  const monitorId = `mon_${product.toLowerCase()}_${location.toLowerCase()}_${Date.now().toString(36)}`;
  const monitor = {
    monitorId,
    agentId: agentId || "agent_external_001",
    product,
    location,
    condition,
    maxSpendUSD,
    intervalMinutes,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    lastChecked: null,
  };
  monitorsStore.set(monitorId, monitor);
  return monitor;
}

export function getMonitor(monitorId) {
  return monitorsStore.get(monitorId) || null;
}

export function listMonitors(agentId) {
  const all = Array.from(monitorsStore.values());
  if (!agentId) return all;
  return all.filter(m => m.agentId === agentId);
}

export function processActionProposal({ agentId, monitorId, proposedAction, groundedPrice, quantity = 1, unit = "unit", estimatedUSD = 10.0, paymentProof }) {
  const monitor = monitorId ? getMonitor(monitorId) : null;
  const condition = monitor?.condition || { operator: "LESS_THAN", targetValue: 70000 };

  const policyEval = evaluatePolicy({
    proposedAction,
    groundedPrice,
    thresholdCondition: condition,
    estimatedUSD,
    asset: "USDC",
    chain: "Base",
  });

  const actionId = `act_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;
  const proposalRecord = {
    actionId,
    agentId: agentId || "agent_external_001",
    monitorId: monitorId || null,
    proposedAction: proposedAction || "BUY_COMMODITY_WHOLESALE",
    groundedPrice,
    quantity,
    unit,
    estimatedUSD,
    paymentProof,
    policyEvaluation: policyEval,
    actionStatus: policyEval.approved ? "SIMULATED_SUCCESS" : "REJECTED_BY_POLICY",
    createdAt: new Date().toISOString(),
    baseTransactionPayload: policyEval.approved ? {
      network: "Base",
      asset: "USDC",
      recipient: process.env.X402_RECIPIENT || "0x0000000000000000000000000000000000000000",
      amountMicroUSDC: Math.round(estimatedUSD * 1e6),
    } : null,
  };

  actionProposalsStore.push(proposalRecord);
  return proposalRecord;
}
