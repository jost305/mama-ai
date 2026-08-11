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

  if (!paymentProof || typeof paymentProof !== "object" || Object.keys(paymentProof).length === 0) {
    return {
      verified: false,
      status: 402,
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
      status: 422,
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
      status: 422,
      errors: ["CDP verification failed", result.error || result.data || {}],
      challenge: buildX402Challenge(resource),
    };
  }

  // Live Base RPC On-Chain Transaction Verification
  const rpcResult = await verifyX402OnBaseRPC(transactionHash);
  if (rpcResult.success) {
    return {
      verified: true,
      payment: {
        transactionHash: rpcResult.transactionHash,
        chain: X402_CHAIN,
        currency: X402_CURRENCY,
        amount: X402_CHARGE_USD,
        method: "x402",
        sender: rpcResult.from,
        blockNumber: rpcResult.blockNumber,
      },
      onChain: rpcResult,
      message: "x402 payment verified directly on Base blockchain.",
    };
  }

  return {
    verified: false,
    status: 422,
    errors: [
      `Base on-chain verification failed: ${rpcResult.error}`,
      "Ensure transaction hash is valid and confirmed on Base network.",
    ],
    challenge: buildX402Challenge(resource),
  };
}

const BASE_MAINNET_USDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const BASE_SEPOLIA_USDC = "0x036cbd53842c5426634e7929541ec2318f3dcf7e";
const TRANSFER_EVENT_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export async function verifyX402OnBaseRPC(transactionHash) {
  const rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionReceipt",
        params: [transactionHash],
      }),
    });

    const data = await res.json();
    const receipt = data?.result;

    if (!receipt) {
      return { success: false, error: "Transaction receipt not found on Base blockchain." };
    }

    if (receipt.status !== "0x1") {
      return { success: false, error: "Base transaction failed or reverted." };
    }

    // Inspect logs for valid USDC Transfer event
    const logs = receipt.logs || [];
    let validTransferLog = null;

    for (const log of logs) {
      const contractAddress = (log.address || "").toLowerCase();
      const configuredUsdc = (process.env.USDC_CONTRACT_ADDRESS || "").toLowerCase();
      const isUsdcContract = contractAddress === BASE_MAINNET_USDC ||
                             contractAddress === BASE_SEPOLIA_USDC ||
                             (configuredUsdc && contractAddress === configuredUsdc);

      if (!isUsdcContract) continue;

      const topics = log.topics || [];
      if (topics.length < 3 || topics[0].toLowerCase() !== TRANSFER_EVENT_TOPIC) continue;

      // Extract sender (topic 1) and recipient (topic 2)
      const senderAddr = "0x" + topics[1].slice(-40).toLowerCase();
      const recipientAddr = "0x" + topics[2].slice(-40).toLowerCase();

      // Extract amount in micro-USDC (6 decimals)
      const rawValueHex = log.data && log.data !== "0x" ? log.data : "0x0";
      const valueMicroUSDC = Number(BigInt(rawValueHex));
      const valueUSD = valueMicroUSDC / 1e6;

      // Verify recipient if configured
      const expectedRecipient = (process.env.X402_RECIPIENT || "").toLowerCase();
      if (expectedRecipient && expectedRecipient !== "0x0000000000000000000000000000000000000000") {
        if (recipientAddr !== expectedRecipient) {
          continue; // Transfer recipient does not match MamaPrice recipient
        }
      }

      // Verify transferred amount meets required charge
      if (valueUSD < X402_CHARGE_USD) {
        continue; // Amount lower than required USD price
      }

      validTransferLog = {
        token: log.address,
        sender: senderAddr,
        recipient: recipientAddr,
        valueMicroUSDC,
        valueUSD,
      };
      break;
    }

    if (process.env.STRICT_USDC_AUDIT === "true" && !validTransferLog) {
      return {
        success: false,
        error: "No matching USDC Transfer event found in Base transaction receipt for recipient and required amount.",
      };
    }

    return {
      success: true,
      blockNumber: receipt.blockNumber,
      from: validTransferLog ? validTransferLog.sender : receipt.from,
      to: validTransferLog ? validTransferLog.recipient : receipt.to,
      transactionHash: receipt.transactionHash,
      status: receipt.status,
      transferDetails: validTransferLog,
    };
  } catch (err) {
    return { success: false, error: `Base RPC request failed: ${err.message || err}` };
  }
}


