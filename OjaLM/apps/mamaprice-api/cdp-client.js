// CDP Client for Base / Coinbase x402 payment verification


const CDP_ENDPOINT = process.env.CDP_ENDPOINT || "";
const CDP_API_KEY = process.env.CDP_API_KEY || "";

export async function verifyX402WithCDP(paymentProof, resource) {
  if (!CDP_ENDPOINT) {
    return {
      success: false,
      error: "CDP_ENDPOINT_NOT_CONFIGURED",
      message: "No CDP endpoint configured. Set CDP_ENDPOINT to the Coinbase/CDP verification endpoint.",
    };
  }

  try {
    const payload = {
      payment: paymentProof,
      resource,
      timestamp: new Date().toISOString(),
    };

    const res = await fetch(CDP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(CDP_API_KEY ? { "Authorization": `Bearer ${CDP_API_KEY}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, status: res.status, error: data };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
}
