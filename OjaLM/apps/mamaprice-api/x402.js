import { verifyX402WithCDP } from "./cdp-client.js";

export const X402_CHARGE_USD = Number(process.env.X402_PRICE_USD || "0.01");
export const X402_CURRENCY = process.env.X402_CURRENCY || "USDC";
export const X402_CHAIN = process.env.X402_CHAIN || "Base";
export const X402_RECIPIENT = process.env.X402_RECIPIENT || "0x0000000000000000000000000000000000000000";
export const X402_RESOURCE = process.env.X402_RESOURCE || "/api/commerce/intel";
export const X402_DESCRIPTION = process.env.X402_DESCRIPTION || "Base x402 payment for MamaPrice commerce intelligence access.";

export function buildX402Challenge(resource = X402_RESOURCE) {
  return {
    code: "x402",
    message: "Payment Required",
    payment: {
      amount: X402_CHARGE_USD,
      currency: X402_CURRENCY,
      network: X402_CHAIN,
      recipient: X402_RECIPIENT,
      resource,
      description: X402_DESCRIPTION,
    },
    timestamp: new Date().toISOString(),
    instructions: "Pay this Base x402 charge and replay the original request with proof of settlement.",
  };
}

export async function verifyX402Payment(paymentProof, resource = X402_RESOURCE) {
  const errors = [];

  if (!paymentProof || typeof paymentProof !== "object") {
    return {
      verified: false,
      errors: ["payment proof object is required"],
      challenge: buildX402Challenge(resource),
    };
  }

  const { transactionHash, chain, currency, amount, method } = paymentProof;

  if (!transactionHash || typeof transactionHash !== "string") {
    errors.push("transactionHash is required and must be a string");
  }
  if (!chain || typeof chain !== "string" || chain.toLowerCase() !== X402_CHAIN.toLowerCase()) {
    errors.push(`chain must be ${X402_CHAIN}`);
  }
  if (!currency || typeof currency !== "string" || currency.toUpperCase() !== X402_CURRENCY) {
    errors.push(`currency must be ${X402_CURRENCY}`);
  }
  if (typeof amount !== "number" || amount !== X402_CHARGE_USD) {
    errors.push(`amount must be ${X402_CHARGE_USD}`);
  }
  if (!method || typeof method !== "string" || method.toLowerCase() !== "x402") {
    errors.push("method must be x402");
  }

  if (errors.length > 0) {
    return {
      verified: false,
      errors,
      challenge: buildX402Challenge(resource),
    };
  }

  // Accept test mode short-circuit for local Sepolia demos
  if (process.env.X402_TEST_ACCEPT === "true") {
    return {
      verified: true,
      payment: {
        transactionHash,
        chain: X402_CHAIN,
        currency: X402_CURRENCY,
        amount: X402_CHARGE_USD,
        method: "x402",
      },
      message: "x402 payment proof accepted by local test mode.",
    };
  }

  // If a CDP endpoint is configured, forward verification to it
  if (process.env.CDP_ENDPOINT) {
    const result = await verifyX402WithCDP(paymentProof, resource);
    if (result.success && result.data && result.data.verified) {
      return {
        verified: true,
        payment: {
          transactionHash,
          chain: X402_CHAIN,
          currency: X402_CURRENCY,
          amount: X402_CHARGE_USD,
          method: "x402",
        },
        cdp: result.data,
        message: "x402 payment verified by CDP.",
      };
    }

    return {
      verified: false,
      errors: ["CDP verification failed", result.error || result.data || {}],
      challenge: buildX402Challenge(resource),
    };
  }

  return {
    verified: false,
    errors: [
      "x402 verification is not implemented in this environment. Configure CDP_ENDPOINT or enable X402_TEST_ACCEPT=true for demos.",
    ],
    challenge: buildX402Challenge(resource),
  };
}
