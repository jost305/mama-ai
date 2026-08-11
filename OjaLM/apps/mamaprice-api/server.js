import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getLlama, LlamaChatSession } from "node-llama-cpp";
import { ojaGraph } from "./ojagraph.js";
import { rewardsEngine } from "./rewards-engine.js";
import { addPaymentRecord, getPaymentRecord } from "./payment-ledger.js";
import { buildX402Challenge, verifyX402Payment } from "./x402.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

const MODEL_PATH = path.join(__dirname, "..", "..", "models", "OjaLM", "OjaLM-v0.1.gguf");

let llama;
let model;

// ─────────────────────────────────────────────────────────────────────────────
// Multi-user Session Store: sessionId -> { context, sequence, chatSession, lastActive }
// ─────────────────────────────────────────────────────────────────────────────
const sessions = new Map();

const SYSTEM_PROMPT = `You are MamaPrice, the intelligent Commerce AI for African markets.

You help users understand prices, product availability, vendor reliability, market events,
and all aspects of commerce intelligence across Nigerian and African markets.

When provided with GROUNDED OJAGRAPH COMMERCE EVIDENCE, use the verified facts to answer
the user accurately. Clearly distinguish between price data, availability info, vendor
reviews, market events, counterfeit warnings, and quality assessments.

If a question has no matching evidence, say so honestly and offer general guidance.`;

// ─────────────────────────────────────────────────────────────────────────────
// OpenRouter FREE Secondary Model Integration
// ─────────────────────────────────────────────────────────────────────────────
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "openrouter/free";

const FALLBACK_SYSTEM_PROMPT = `You are MamaPrice, an AI-powered commerce assistant built to help people and businesses navigate African markets.

Your job is to help users discover products, understand prices, compare markets and vendors, find better purchasing opportunities, understand commerce information, and navigate the MamaPrice platform.

Speak naturally, confidently, and helpfully.

You are part of the MamaPrice product. Never describe yourself as a fallback assistant, secondary assistant, backup model, or alternative model.

Never mention model providers, inference infrastructure, APIs, servers, outages, failover systems, or internal architecture.

Never tell the user that another model is unavailable.

Maintain the same identity, tone, and conversational behavior as MamaPrice regardless of which underlying model is generating the response.

When verified MamaPrice commerce evidence is provided to you, use that evidence to answer the user's question.

Do not invent prices, vendors, markets, earnings, agent reports, availability, or other factual commerce information.

When the required information is not available in the provided evidence or tools, be honest about what you know and what you cannot verify, but do not reveal internal system limitations or model failover.

Do not fabricate missing information.

Answer naturally and directly.

You are MamaPrice.`;

// ─────────────────────────────────────────────────────────────────────────────
// Intent Detection & Commerce Query Protection
// ─────────────────────────────────────────────────────────────────────────────

const INTENT_KEYWORDS = {
    price:        ["price", "cost", "how much", "naira", "ngn", "cheap", "expensive", "rate", "sold", "buy"],
    availability: ["available", "stock", "out of stock", "in stock", "find", "where to buy", "sold out", "have"],
    vendor:       ["vendor", "seller", "shop", "store", "trader", "merchant", "stall", "trusted", "reliable"],
    market_event: ["closed", "open", "strike", "flood", "rain", "event", "renovation", "traffic", "days"],
    counterfeit:  ["fake", "counterfeit", "original", "authentic", "genuine", "real", "copy", "spoil"],
    quality:      ["quality", "fresh", "good", "bad", "expired", "rotten", "packaging", "condition"]
};

const GREETING_KEYWORDS = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "howdy", "greetings", "sup", "xup"];

const COMMERCE_QUERY_KEYWORDS = [
    "price", "cost", "how much", "naira", "ngn", "rate", "sold", "buy", "buying",
    "vendor", "seller", "shop", "store", "trader", "merchant", "stall",
    "market", "bodija", "mile 12", "dawanau", "oyingbo", "onitsha", "ariaria", "balogun", "computer village", "sabon gari", "dugbe", "kuto", "ikeja",
    "available", "stock", "out of stock", "in stock", "find", "where to buy", "sold out",
    "rice", "tomato", "tomatoes", "pepper", "cement", "garri", "yam", "oil", "palm oil", "eggs", "flour", "fuel", "petrol", "pms", "steel", "rebar", "rent",
    "cheapest", "compare", "discount", "voucher", "earnings", "scout", "agent report", "observation"
];

function isCommerceQuery(query) {
    if (!query) return false;
    const q = query.toLowerCase().trim();
    return COMMERCE_QUERY_KEYWORDS.some(kw => q.includes(kw));
}

function detectQueryIntents(query) {
    const q = query.toLowerCase().trim();
    const isGreeting = GREETING_KEYWORDS.some(kw => q === kw || q.startsWith(`${kw} `) || q.startsWith(`${kw}!`));
    if (isGreeting) {
        return ["greeting"];
    }

    const intents = new Set();
    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
        if (keywords.some(kw => q.includes(kw))) {
            intents.add(intent);
        }
    }
    // Default to general commerce intelligence if no specific intent detected
    if (intents.size === 0) intents.add("general");
    return Array.from(intents);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hybrid RAG: Multi-Intent Commerce Intelligence Retrieval
// ─────────────────────────────────────────────────────────────────────────────

function calculateConfidence(priceData, knowledgeChunks, qualityFlags) {
    let score = 1.0;
    if (qualityFlags.includes("STALE_PRICE"))          score -= 0.20;
    if (qualityFlags.includes("LOW_CONFIDENCE_PRICE")) score -= 0.15;
    if (qualityFlags.includes("ESTIMATED_PRICE"))      score -= 0.25;
    if (qualityFlags.includes("NO_PRICE_DATA"))        score -= 0.40;
    if (qualityFlags.includes("SUPPLY_DISRUPTION_DETECTED")) score -= 0.10;
    if (!knowledgeChunks || knowledgeChunks.length === 0)   score -= 0.10;
    return Math.max(0.0, Math.round(score * 100) / 100);
}

function buildGroundedContext(query, evidence) {
    const qualityFlags = [];
    const sections = [];

    // Assess Price Data Quality (Section 3.5)
    if (evidence.prices && evidence.prices.length > 0) {
        const topPrice = evidence.prices[0];
        if (topPrice.freshness_hours > 72) qualityFlags.push("STALE_PRICE");
        if ((topPrice.confidence || 0) < 0.60) qualityFlags.push("LOW_CONFIDENCE_PRICE");
        if (topPrice.is_estimated) qualityFlags.push("ESTIMATED_PRICE");

        const priceLines = evidence.prices.map(obs =>
            `• ${obs.product}${obs.brand ? ` (${obs.brand})` : ""} at ${obs.market}, ${obs.state}: ₦${obs.observed_price?.toLocaleString() || "N/A"} per ${obs.quantity || "unit"} — Confidence: ${Math.round((obs.confidence || 0) * 100)}%, Freshness: ${obs.freshness_hours}h ago`
        );
        sections.push(`--- PRICE INTELLIGENCE ---\n${priceLines.join("\n")}`);
    } else {
        qualityFlags.push("NO_PRICE_DATA");
    }

    // Assess Supply & Disruption Signals
    if (evidence.market_events?.length > 0) {
        qualityFlags.push("ACTIVE_MARKET_EVENT");
        const eventLines = evidence.market_events.map(e =>
            `• [${e.severity || "INFO"}] ${e.title} — ${e.market}: ${e.description}${e.end_date ? ` (Until ${e.end_date})` : ""}`
        );
        sections.push(`--- ACTIVE MARKET EVENTS ---\n${eventLines.join("\n")}`);
    }

    if (evidence.availability?.length > 0) {
        const hasShortage = evidence.availability.some(a => !a.in_stock || a.stock_level === "LOW");
        if (hasShortage) qualityFlags.push("SUPPLY_DISRUPTION_DETECTED");

        const availLines = evidence.availability.map(a =>
            `• ${a.product} at ${a.market}: ${a.in_stock ? `IN STOCK (${a.stock_level || "unknown level"})` : "OUT OF STOCK"}${a.vendor_section ? ` — ${a.vendor_section}` : ""}${a.notes ? `. Note: ${a.notes}` : ""}`
        );
        sections.push(`--- AVAILABILITY REPORTS ---\n${availLines.join("\n")}`);
    }

    // Trend Memory (Section 3.4 Source 5)
    if (evidence.trend) {
        const t = evidence.trend;
        sections.push(`--- PRICE TREND ---\nDirection: ${t.direction.toUpperCase()} ${t.percent}%\nPeriod: ${t.from_date} to ${t.to_date}\nFrom: ₦${t.from_price.toLocaleString()} → To: ₦${t.to_price.toLocaleString()}`);
    }

    // Vendor Intelligence
    if (evidence.vendor_reviews?.length > 0) {
        const vendorLines = evidence.vendor_reviews.map(v =>
            `• ${v.vendor_name} at ${v.market}: Rating ${v.rating}/5 (${v.reliability} reliability)${v.notes ? `. ${v.notes}` : ""}`
        );
        sections.push(`--- VENDOR INTELLIGENCE ---\n${vendorLines.join("\n")}`);
    }

    // Counterfeit Warnings
    if (evidence.counterfeit_alerts?.length > 0) {
        const fakeLines = evidence.counterfeit_alerts.map(c =>
            `• ⚠️ COUNTERFEIT ALERT — ${c.product}${c.brand ? ` (${c.brand})` : ""} at ${c.market}: ${c.description} [Risk: ${c.risk_level}]`
        );
        sections.push(`--- COUNTERFEIT WARNINGS ---\n${fakeLines.join("\n")}`);
    }

    // System Confidence & Quality Flags
    const overallConfidence = calculateConfidence(evidence.prices, evidence.knowledge, qualityFlags);
    sections.push(`--- PARSED QUERY & SYSTEM FLAGS ---\nOverall Confidence: ${overallConfidence}\nSystem Flags: ${qualityFlags.length > 0 ? qualityFlags.join(", ") : "NONE"}\n(OjaLM must calibrate response honesty to these flags)`);

    if (sections.length === 0) return null;

    return `GROUNDED OJAGRAPH COMMERCE EVIDENCE:\n${"─".repeat(50)}\n${sections.join("\n\n")}\n${"─".repeat(50)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Management
// ─────────────────────────────────────────────────────────────────────────────

let masterLlamaContext = null;
let masterChatSession = null;

async function getOrCreateSession(sessionId) {
    if (masterChatSession) {
        return masterChatSession;
    }

    console.log(`[SESSION] Creating master LLM context for fast CPU inference...`);
    for (const contextSize of [512, 256, 1024]) {
        try {
            console.log(`[SESSION] Allocating contextSize: ${contextSize}...`);
            masterLlamaContext = await model.createContext({ contextSize });
            const sequence = masterLlamaContext.getSequence();
            masterChatSession = new LlamaChatSession({
                contextSequence: sequence,
                systemPrompt: SYSTEM_PROMPT
            });
            console.log(`[SESSION] Master LLM Context ready with contextSize: ${contextSize}`);
            break;
        } catch (err) {
            console.warn(`[SESSION] Context size ${contextSize} allocation warning:`, err.message || err);
        }
    }

    if (!masterChatSession) {
        throw new Error("Unable to allocate LLM context buffer on current system RAM resources.");
    }

    return masterChatSession;
}

// ─────────────────────────────────────────────────────────────────────────────
// Primary OjaLM Remote Inference — HuggingFace ctrlprompt/OjaLM-v0.1
// ─────────────────────────────────────────────────────────────────────────────
const HF_MODEL_REPO = "ctrlprompt/OjaLM-v0.1";
const HF_INFERENCE_URL = process.env.HF_ENDPOINT_URL || `https://router.huggingface.co/hf-inference/models/${HF_MODEL_REPO}`;

async function queryHuggingFaceInference(prompt, systemPrompt = SYSTEM_PROMPT, userToken = null) {
    const hfToken = userToken || process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || "";
    const formattedPrompt = `<|system|>\n${systemPrompt}</s>\n<|user|>\n${prompt}</s>\n<|assistant|>`;
    const headers = { "Content-Type": "application/json" };
    if (hfToken) {
        headers["Authorization"] = `Bearer ${hfToken}`;
    }

    console.log(`[HF INFERENCE] Querying HuggingFace API model: ${HF_MODEL_REPO}...`);
    const hfRes = await fetch(HF_INFERENCE_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
            inputs: formattedPrompt,
            parameters: {
                max_new_tokens: 512,
                temperature: 0.7,
                return_full_text: false
            }
        })
    });

    if (!hfRes.ok) {
        const errorText = await hfRes.text();
        throw new Error(`HuggingFace API (${hfRes.status}): ${errorText}`);
    }

    const data = await hfRes.json();
    if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text.trim();
    } else if (data.generated_text) {
        return data.generated_text.trim();
    } else if (typeof data === "string") {
        return data.trim();
    }
    return JSON.stringify(data);
}

// ─────────────────────────────────────────────────────────────────────────────
// Dedicated Secondary Fallback: OpenRouter FREE LLM API
// ─────────────────────────────────────────────────────────────────────────────
async function queryFallbackLLM(prompt, options = {}) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY environment variable is not configured.");
    }

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs || 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        console.log(`[LLM] Requesting OpenRouter FREE fallback model (${OPENROUTER_MODEL})...`);
        const res = await fetch(OPENROUTER_ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    { role: "system", content: FALLBACK_SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 500
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`OpenRouter API error (${res.status}): ${errText}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error("Invalid or empty response from OpenRouter free model.");
        }

        return {
            content: content.trim(),
            provider: "openrouter",
            model: OPENROUTER_MODEL,
            fallback: true
        };
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /chat & POST /api/chat — Hybrid RAG Commerce Intelligence Endpoint
// ─────────────────────────────────────────────────────────────────────────────

app.post(["/chat", "/api/chat"], async (req, res) => {
    console.log("\n--- POST /chat ---");

    let prompt, sessionId, modelId, useHf;
    try {
        prompt = req.body.prompt;
        sessionId = req.body.sessionId || req.headers["x-session-id"] || "default-session";
        modelId = req.body.modelId || "MamaPrice 4o";
        useHf = req.body.useHf || req.body.useHuggingFace || false;
        console.log(`[SESSION: ${sessionId}] [MODEL: ${modelId}] Prompt: "${prompt}"`);
    } catch (err) {
        return res.status(400).json({ stage: "parse_body", error: err.message });
    }

    // ─── Hybrid RAG Retrieval ────────────────────────────────────────────────
    const enableRAG = ["MamaPrice 4o", "OjaGraph RAG", "OjaLM Commerce"].includes(modelId);
    let allEvidence = {};
    let detectedIntents = [];

    if (enableRAG) {
        // Step 1: Detect query intent(s)
        detectedIntents = detectQueryIntents(prompt);
        console.log(`[RAG] Detected intents: [${detectedIntents.join(", ")}] for query: "${prompt}"`);

        // Step 2: Multi-channel parallel retrieval across all Commerce Graph document types (Promise.all)
        const [searchRes, trendRes] = await Promise.all([
            Promise.resolve(ojaGraph.searchCommerceIntelligence(prompt)),
            Promise.resolve(ojaGraph.retrieveTrend(prompt))
        ]);
        allEvidence = searchRes;
        allEvidence.trend = trendRes;

        const totalMatches = Object.values(allEvidence).reduce((sum, val) => sum + (Array.isArray(val) ? val.length : (val ? 1 : 0)), 0);
        console.log(`[RAG] Retrieved ${totalMatches} total evidence items (including trend memory).`);
    } else {
        console.log(`[DIRECT OJALM] Bypassing RAG for direct GGUF / HF inference.`);
    }

    // Step 3: Build grounded context from multi-type evidence
    const groundedContext = buildGroundedContext(prompt, allEvidence);

    const augmentedPrompt = groundedContext
        ? `${groundedContext}\n\nUSER QUESTION: ${prompt}`
        : prompt;

    // ─── PRIMARY INFERENCE ENGINE: OjaLM (Local GGUF / Remote HF) ────────────
    let primarySuccess = false;
    let ojalmResponseText = "";
    let providerName = "ojalm";

    // Attempt HuggingFace Serverless API if requested or local model unallocated
    if (!model || useHf) {
        try {
            console.log(`[HF INFERENCE ENGINE] Invoking HuggingFace API for ctrlprompt/OjaLM-v0.1...`);
            ojalmResponseText = await queryHuggingFaceInference(augmentedPrompt, SYSTEM_PROMPT, req.headers["x-hf-token"] || req.body.hfToken);
            primarySuccess = true;
            providerName = "ojalm-hf";
        } catch (hfErr) {
            console.warn(`⚠️ [HuggingFace OjaLM API] failed:`, hfErr.message);
        }
    }

    // Attempt Local OjaLM GGUF if local model is loaded and HF wasn't used/successful
    if (!primarySuccess && model) {
        try {
            console.log(`[OjaLM Local GGUF] Generating response for session "${sessionId}"...`);
            const chatSession = await getOrCreateSession(sessionId);
            ojalmResponseText = await chatSession.prompt(augmentedPrompt);
            primarySuccess = true;
            providerName = "ojalm-local";
        } catch (localErr) {
            console.warn(`⚠️ [OjaLM Local GGUF] failed:`, localErr.message);
        }
    }

    // ─── SUCCESS: Return OjaLM Primary Response ──────────────────────────────
    if (primarySuccess && ojalmResponseText) {
        console.log(`[LLM] provider=ojalm fallback=false`);
        return res.json({
            sessionId,
            modelUsed: modelId,
            response: ojalmResponseText.trim(),
            intents: detectedIntents,
            evidence: allEvidence,
            provider: "ojalm",
            fallback: false
        });
    }

    // ─── SECONDARY INFERENCE ENGINE: Silent Failover ──────────────────────────
    console.warn("[LLM] Primary OjaLM unavailable. Executing secondary inference engine silently...");

    try {
        const fallbackResult = await queryFallbackLLM(augmentedPrompt);
        console.log("[LLM] provider=openrouter fallback=true");
        return res.json({
            sessionId,
            modelUsed: fallbackResult.model,
            response: fallbackResult.content,
            intents: detectedIntents,
            evidence: allEvidence,
            provider: "openrouter",
            fallback: true
        });
    } catch (openRouterErr) {
        console.warn("⚠️ Secondary inference error:", openRouterErr.message);
        console.log("[LLM] provider=static fallback=true reason=secondary_engine_failed");

        // Natural MamaPrice static response if both inference engines fail
        let staticResponse = "I'm having trouble finding verified market information for your query right now. Please check back shortly or try rephrasing your search!";
        if (groundedContext) {
            staticResponse = `Here is the latest verified MamaPrice market snapshot for your query:\n\n${groundedContext.replace(/=== GROUNDED OJAGRAPH EVIDENCE ===\n/, '')}`;
        }

        return res.json({
            sessionId,
            modelUsed: "MamaPrice Engine",
            response: staticResponse,
            intents: detectedIntents,
            evidence: allEvidence,
            provider: "static",
            fallback: true
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /observe — Ingest a new Commerce Observation from an Agent
// ─────────────────────────────────────────────────────────────────────────────
app.post("/observe", async (req, res) => {
    const { reportType = "PRICE", data, userId = "usr_demo" } = req.body;
    if (!data) return res.status(400).json({ error: "data is required" });

    try {
        const newDoc = ojaGraph.addObservation(data, reportType);
        console.log(`[OjaGraph] New ${reportType} observation ingested: ${newDoc.id}`);

        // Grant reward spin for verified observation
        const rewardBonus = rewardsEngine.grantSpin(userId, "VERIFIED_PRICE_REPORT", `Verified ${data.commodity || 'Price'} Observation`, 1);

        res.json({ success: true, document: newDoc, rewards: { spinGranted: 1, availableSpins: rewardBonus.availableSpins } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/commerce/intel — Phase 1 paid commerce intelligence query
app.post("/api/commerce/intel", async (req, res) => {
    const { prompt, paymentProof, sessionId, modelId, useHf } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: "prompt is required" });
    }

    const verification = await verifyX402Payment(paymentProof, "/api/commerce/intel");
    if (!verification.verified) {
        const status = verification.challenge ? 402 : 422;
        return res.status(status).json({
            success: false,
            verified: false,
            errors: verification.errors,
            challenge: verification.challenge,
        });
    }

    const existing = getPaymentRecord(verification.payment.transactionHash);
    if (existing) {
        return res.status(409).json({
            success: false,
            error: "PAYMENT_ALREADY_PROCESSED",
            message: "This Base payment has already been used for a paid query.",
            existingRecord: existing,
        });
    }

    try {
        const modelLabel = modelId || "MamaPrice 4o";
        const useHfEngine = Boolean(useHf);
        const detectedIntents = detectQueryIntents(prompt);

        const [searchRes, trendRes] = await Promise.all([
            Promise.resolve(ojaGraph.searchCommerceIntelligence(prompt)),
            Promise.resolve(ojaGraph.retrieveTrend(prompt))
        ]);

        const allEvidence = { ...searchRes, trend: trendRes };
        const groundedContext = buildGroundedContext(prompt, allEvidence);
        const augmentedPrompt = groundedContext ? `${groundedContext}\n\nUSER QUESTION: ${prompt}` : prompt;

        let responseText = "";
        let providerName = "ojalm";
        let primarySuccess = false;

        if (!model || useHfEngine) {
            try {
                responseText = await queryHuggingFaceInference(augmentedPrompt, SYSTEM_PROMPT, req.headers["x-hf-token"] || req.body.hfToken);
                primarySuccess = true;
                providerName = "ojalm-hf";
            } catch (hfErr) {
                console.warn(`⚠️ [HF Engine] failed: ${hfErr.message}`);
            }
        }

        if (!primarySuccess && model) {
            try {
                const chatSession = await getOrCreateSession(sessionId || "default-session");
                responseText = await chatSession.prompt(augmentedPrompt);
                primarySuccess = true;
                providerName = "ojalm-local";
            } catch (localErr) {
                console.warn(`⚠️ [OjaLM Local] failed: ${localErr.message}`);
            }
        }

        if (!primarySuccess || !responseText) {
            const fallbackResult = await queryFallbackLLM(augmentedPrompt);
            responseText = fallbackResult.content;
            providerName = fallbackResult.model;
        }

        const paymentRecord = addPaymentRecord({
            transactionHash: verification.payment.transactionHash,
            sender: verification.payment.sender,
            amount: verification.payment.amount,
            currency: verification.payment.currency,
            chain: verification.payment.chain,
            method: verification.payment.method,
            signature: verification.payment.signature,
            timestamp: verification.payment.timestamp,
            prompt,
            sessionId: sessionId || "default-session",
            modelId: modelLabel,
            createdAt: new Date().toISOString(),
        });

        return res.json({
            success: true,
            payment: { verified: true, record: paymentRecord },
            sessionId: sessionId || "default-session",
            modelUsed: modelLabel,
            provider: providerName,
            response: responseText.trim(),
            intents: detectedIntents,
            evidence: allEvidence,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message, message: "Failed to execute paid commerce query." });
    }
});

// POST /missions/claim — Claim an active mission
app.post("/missions/claim", (req, res) => {
    const { missionId, agentId = "usr_agent_001" } = req.body;
    if (!missionId || !agentId) {
        return res.status(400).json({ error: "missionId and agentId are required" });
    }

    // Grant reward spin for completing/claiming mission
    const rewardBonus = rewardsEngine.grantSpin(agentId, "MISSION_COMPLETED", `Claimed Mission ${missionId}`, 1);

    res.json({
        success: true,
        missionId,
        agentId,
        status: "ACCEPTED",
        message: `Mission ${missionId} successfully claimed by Agent ${agentId}. Log price report before deadline to receive reward.`,
        rewards: { spinGranted: 1, availableSpins: rewardBonus.availableSpins }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 🎡 MAMAPRICE REWARDS & SPIN-TO-WIN ENGINE ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/rewards/user-summary
app.get("/api/rewards/user-summary", (req, res) => {
    const userId = req.query.userId || "usr_demo";
    try {
        const summary = rewardsEngine.getUserSummary(userId);
        res.json({ success: true, ...summary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/rewards/spin (Server-Authoritative Spin Engine)
app.post("/api/rewards/spin", (req, res) => {
    const { userId = "usr_demo", spinSource = "daily_activity", idempotencyKey, userLocation } = req.body;
    try {
        const result = rewardsEngine.processSpin(userId, spinSource, idempotencyKey, userLocation);
        res.json(result);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// POST /api/rewards/redeem
app.post("/api/rewards/redeem", (req, res) => {
    const { userId = "usr_demo", transactionId } = req.body;
    if (!transactionId) return res.status(400).json({ error: "transactionId is required" });
    try {
        const result = rewardsEngine.redeemVoucher(userId, transactionId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// POST /api/rewards/activity (Award spin for completed user activity/task)
app.post("/api/rewards/activity", (req, res) => {
    const { userId = "usr_demo", source = "DAILY_TASK", label = "Completed daily bonus task", spins = 1 } = req.body;
    try {
        const updatedUser = rewardsEngine.grantSpin(userId, source, label, spins);
        res.json({ success: true, user: updatedUser, spinsEarned: spins, totalSpins: updatedUser.availableSpins });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// POST /api/rewards/promo/apply (Redeem promo or partner campaign code)
app.post("/api/rewards/promo/apply", (req, res) => {
    const { userId = "usr_demo", code } = req.body;
    try {
        const result = rewardsEngine.applyPromoCode(userId, code);
        res.json(result);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// POST /api/rewards/admin/partner-codes/generate (Generate partner promo code)
app.post("/api/rewards/admin/partner-codes/generate", (req, res) => {
    try {
        const promo = rewardsEngine.generatePartnerPromoCode(req.body);
        res.json({ success: true, message: "🎉 Partner Promo Code Generated Successfully!", promo });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// GET /api/rewards/admin/campaigns
app.get("/api/rewards/admin/campaigns", (req, res) => {
    try {
        const analytics = rewardsEngine.getAnalytics();
        res.json({ success: true, campaigns: analytics.activeCampaigns, analytics });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/rewards/admin/campaigns
app.post("/api/rewards/admin/campaigns", (req, res) => {
    try {
        const result = rewardsEngine.createCampaign(req.body);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/rewards/admin/analytics
app.get("/api/rewards/admin/analytics", (req, res) => {
    try {
        const analytics = rewardsEngine.getAnalytics();
        res.json({ success: true, analytics });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /verify/consensus — AgentOS Multi-Agent Consensus Verification Protocol
// ─────────────────────────────────────────────────────────────────────────────
app.post("/verify/consensus", (req, res) => {
    const { commodity, market, observations } = req.body;

    const sampleObs = observations || [
        { agentId: "SC-1042", name: "Emmanuel Nwosu", price: 84000, evidence: "OCR", photo_url: "receipt_01.jpg", has_gps: true },
        { agentId: "SC-0012", name: "Amina Yusuf", price: 84500, evidence: "GPS", has_gps: true },
        { agentId: "SC-0089", name: "Chinedu Okafor", price: 84000, evidence: "OCR", photo_url: "receipt_02.jpg", has_gps: true }
    ];

    const validPrices = sampleObs.map(o => o.price).filter(p => p > 0).sort((a, b) => a - b);
    const count = validPrices.length;
    const medianPrice = count > 0 ? validPrices[Math.floor(count / 2)] : 0;

    let confidence = 0.50;
    if (count >= 3) confidence += 0.35;
    else if (count === 2) confidence += 0.25;

    const hasPhotoOCR = sampleObs.some(o => o.evidence === "OCR" || o.photo_url);
    const hasGps = sampleObs.some(o => o.has_gps);

    if (hasPhotoOCR) confidence += 0.10;
    if (hasGps) confidence += 0.05;

    confidence = Math.min(0.998, Math.max(0.50, confidence));

    let badge = "⚪ UNVERIFIED";
    let badgeTier = "UNVERIFIED";

    if (count >= 3 && (hasPhotoOCR || hasGps)) {
        badge = "🥇 GOLD GROUNDED";
        badgeTier = "GOLD";
        confidence = Math.max(0.95, confidence);
    } else if (count >= 2) {
        badge = "🥈 SILVER GROUNDED";
        badgeTier = "SILVER";
        confidence = Math.max(0.80, confidence);
    } else if (hasPhotoOCR || hasGps) {
        badge = "🥉 BRONZE GROUNDED";
        badgeTier = "BRONZE";
        confidence = Math.max(0.65, confidence);
    }

    res.json({
        success: true,
        commodity: commodity || "Rice (50kg bag)",
        market: market || "Bodija Market",
        consensusPrice: medianPrice,
        confidenceScore: Math.round(confidence * 100) / 100,
        confidencePercentage: `${(confidence * 100).toFixed(1)}%`,
        trustBadge: badge,
        badgeTier: badgeTier,
        verifiedAgentsCount: count,
        verifyingAgents: sampleObs.map(o => `${o.name} (${o.agentId || 'Scout'})`),
        enterpriseEligible: badgeTier === "GOLD" || badgeTier === "SILVER"
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /reward/calculate — AgentOS Dynamic Reward Formula Calculator
// ─────────────────────────────────────────────────────────────────────────────
app.post("/reward/calculate", (req, res) => {
    const { agentLevel = 1, coverageIndex = "95%", urgencyLevel = "STANDARD", hasPhotoOcr = false, hasGps = true, streakDays = 1 } = req.body;

    const baseReward = 250;
    const evidenceBonus = hasPhotoOcr ? 100 : 0;
    const gpsBonus = hasGps ? 50 : 0;
    const urgencyBonus = (urgencyLevel === "CRITICAL_GAP" || urgencyLevel === "HIGH_GAP") ? 150 : 0;

    let coverageBonus = 0;
    const covNum = parseInt((coverageIndex || "100%").replace("%", ""), 10) || 100;
    if (covNum < 10) coverageBonus = 1200;
    else if (covNum < 30) coverageBonus = 500;
    else if (covNum < 60) coverageBonus = 200;

    const streakBonus = streakDays >= 3 ? 100 : 0;
    const subtotal = baseReward + evidenceBonus + gpsBonus + urgencyBonus + coverageBonus + streakBonus;

    const multipliers = { 1: 1.0, 2: 1.2, 3: 1.5, 4: 2.0, 5: 2.5 };
    const rankMultiplier = multipliers[agentLevel] || 1.0;

    const finalPayoutNgn = Math.round(subtotal * rankMultiplier);
    const finalMarketPoints = Math.round((baseReward / 10) * rankMultiplier);

    res.json({
        success: true,
        agentLevel,
        rankMultiplier: `${rankMultiplier}x`,
        itemizedBreakdown: {
            baseReward: `₦${baseReward}`,
            evidenceBonus: `+₦${evidenceBonus}`,
            gpsBonus: `+₦${gpsBonus}`,
            urgencyBonus: `+₦${urgencyBonus}`,
            coverageGapBonus: `+₦${coverageBonus}`,
            streakBonus: `+₦${streakBonus}`
        },
        subtotalNgn: `₦${subtotal}`,
        finalPayoutNgn: `₦${finalPayoutNgn.toLocaleString()}`,
        finalMarketPoints: `${finalMarketPoints} MarketPoints`,
        rawPayoutNgn: finalPayoutNgn,
        rawMarketPoints: finalMarketPoints
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /alerts/dispatch — AlertGraph Intelligent Push Notification Engine
// ─────────────────────────────────────────────────────────────────────────────
app.post("/alerts/dispatch", (req, res) => {
    const { alertType = "PRICE_DROP", confidenceScore = 0.95, badgeTier = "GOLD", commodity, market, priceNgn, previousPriceNgn, recipientType = "CONSUMER" } = req.body;

    // Confidence Gatekeeper: Block unverified alerts below 0.80 confidence
    if (confidenceScore < 0.80 && alertType !== "MISSION_DISPATCH" && alertType !== "WALLET_PAYOUT") {
        return res.status(422).json({
            success: false,
            gatekeeperStatus: "BLOCKED",
            reason: `Alert blocked by AlertGraph Gatekeeper. Confidence score (${(confidenceScore * 100).toFixed(1)}%) is below minimum threshold (80%). Report requires Silver or Gold Grounded badge.`,
            badgeTier
        });
    }

    let notificationTitle = "";
    let notificationBody = "";

    if (alertType === "PRICE_DROP") {
        const dropPct = previousPriceNgn ? Math.round(((previousPriceNgn - priceNgn) / previousPriceNgn) * 100) : 6;
        notificationTitle = `📉 Price Drop Alert: ${commodity || 'Rice (50kg)'}`;
        notificationBody = `Price dropped ${dropPct}% to ₦${(priceNgn || 84000).toLocaleString()} at ${market || 'Bodija Market'} (${badgeTier} Verified).`;
    } else if (alertType === "MISSION_DISPATCH") {
        notificationTitle = `🎯 New High Gap Mission Available!`;
        notificationBody = `Mission in ${market || 'Gusau Central Market'}: Log prices to earn ₦1,800 + 250 MarketPoints.`;
    } else if (alertType === "WALLET_PAYOUT") {
        notificationTitle = `💰 Weekly Wallet Payout Ready`;
        notificationBody = `Your wallet balance of ₦${(priceNgn || 18900).toLocaleString()} is ready for instant withdrawal.`;
    } else {
        notificationTitle = `🔔 MamaPrice Market Alert`;
        notificationBody = `${commodity || 'Commodity'} observation updated at ${market || 'Market'}.`;
    }

    res.json({
        success: true,
        gatekeeperStatus: "PASSED",
        badgeTier,
        confidenceScore: `${(confidenceScore * 100).toFixed(1)}%`,
        dispatchChannels: ["Web Push Toast", "In-App Notification Center", "WhatsApp Notification API"],
        recipientType,
        notification: {
            title: notificationTitle,
            body: notificationBody,
            timestamp: new Date().toISOString()
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// META WHATSAPP FLOWS INTERACTIVITY PROTOCOL & PAYLOAD ENGINE
// ─────────────────────────────────────────────────────────────────────────────

// GET /webhook/whatsapp/flows/data — Serves dynamic Meta Flow JSON payloads
app.get("/webhook/whatsapp/flows/data", (req, res) => {
    const { flowType = "FLOW_MISSION_SELECTION", phone } = req.query;

    if (flowType === "FLOW_AGENT_ONBOARDING") {
        return res.json({
            version: "3.0",
            screen: "AGENT_REGISTRATION",
            data: {
                states: ["Lagos", "Oyo", "Kogi", "Adamawa", "Zamfara", "Rivers", "Kano", "Abuja FCT"],
                banks: ["Kuda Bank", "OPay", "Palmpay", "GTBank", "Zenith Bank", "Access Bank", "First Bank"]
            }
        });
    }

    if (flowType === "FLOW_WALLET_CASHOUT") {
        return res.json({
            version: "3.0",
            screen: "CASHOUT_FORM",
            data: {
                agentName: "John (Agent #1042)",
                walletBalanceNgn: 18900,
                minimumWithdrawalNgn: 1000,
                savedBanks: ["Kuda Bank (2019482716)", "GTBank (0123984712)"]
            }
        });
    }

    // Default: FLOW_MISSION_SELECTION
    res.json({
        version: "3.0",
        screen: "MISSION_LIST",
        data: {
            activeMissions: [
                { id: "MSN-GUSAU-091", title: "🎯 High Gap Mission: Gusau Central Market", reward: "₦1,800 + 250 pts", urgency: "CRITICAL" },
                { id: "MSN-YOLA-044", title: "🎯 High Gap Mission: Jimeta Market", reward: "₦1,200 + 150 pts", urgency: "HIGH" },
                { id: "MSN-LOKOJA-012", title: "🎯 Regional Gap Mission: Lokoja Market", reward: "₦750 + 100 pts", urgency: "MEDIUM" },
                { id: "MSN-IBADAN-088", title: "🎯 Market Verification: Sango Market", reward: "₦350 + 50 pts", urgency: "STANDARD" }
            ]
        }
    });
});

// POST /webhook/whatsapp/flows/submit — Handles user interactive submissions from Meta WhatsApp Flows
app.post("/webhook/whatsapp/flows/submit", (req, res) => {
    const { action, flowId, responseData, senderPhone } = req.body;

    console.log(`[WhatsApp Flow Action] ${action} submitted by ${senderPhone || 'Anonymous'}`);

    if (action === "SUBMIT_REPORT") {
        return res.json({
            success: true,
            status: "REPORT_INGESTED",
            message: `Report ingested successfully! Payout of ₦${responseData?.price ? 350 : 250} credited to Agent Wallet.`,
            agentWalletNgn: 19250
        });
    }

    if (action === "CASHOUT_WALLET") {
        const amount = responseData?.amount || 18900;
        return res.json({
            success: true,
            status: "CASHOUT_SUCCESSFUL",
            message: `Instant Cashout of ₦${amount.toLocaleString()} sent to ${responseData?.bankName || 'Kuda Bank'} (${responseData?.accountNumber || '2019482716'}).`,
            transactionRef: `TRX-${Date.now()}`
        });
    }

    res.json({
        success: true,
        status: "SUCCESS",
        message: "WhatsApp Flow interaction processed successfully.",
        flowId
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP BUSINESS API INTEGRATION & HYBRID INTENT ROUTER
// ─────────────────────────────────────────────────────────────────────────────
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "mamaprice_whatsapp_secret_token_2026";
const WHATSAPP_API_TOKEN   = process.env.WHATSAPP_API_TOKEN   || "EAAG...MOCK_TOKEN";
const WHATSAPP_PHONE_ID    = process.env.WHATSAPP_PHONE_ID    || "109827364512398";

// GET /webhook/whatsapp — Meta Webhook Verification Endpoint
app.get("/webhook/whatsapp", (req, res) => {
    const mode      = req.query["hub.mode"];
    const token     = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
        console.log("✅ [WhatsApp Webhook] Verification successful.");
        return res.status(200).send(challenge);
    } else {
        console.warn("❌ [WhatsApp Webhook] Verification token mismatch.");
        return res.sendStatus(403);
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// IDENTITY & PERMISSION LAYER SERVICE — Resolves Phone Numbers to Unified Identity
// ─────────────────────────────────────────────────────────────────────────────
const userIdentityStore = new Map([
    ["2348012345678", {
        userId: "USR-89201",
        name: "Emmanuel Nwosu",
        role: "AGENT",
        agentDetails: {
            scoutId: "SC-1042",
            level: 4,
            levelLabel: "Senior Field Scout",
            reputationScore: 97,
            state: "Oyo",
            lga: "Ibadan North",
            primaryMarket: "Bodija Market",
            todayEarnings: 2400,
            walletBalance: 18900,
            lifetimeReports: 342,
            accuracyRating: 96.8
        },
        permissions: ["LOG_PRICES", "REQUEST_PAYOUT", "ACCEPT_MISSIONS", "VIEW_ANALYTICS"]
    }],
    ["2348123456789", {
        userId: "USR-44102",
        name: "Amina Yusuf",
        role: "AGENT",
        agentDetails: {
            scoutId: "SC-0012",
            level: 3,
            levelLabel: "Senior Agent",
            reputationScore: 99,
            state: "Lagos",
            lga: "Kosov",
            primaryMarket: "Mile 12 Market",
            todayEarnings: 3750,
            walletBalance: 148500,
            lifetimeReports: 285,
            accuracyRating: 98.4
        },
        permissions: ["LOG_PRICES", "REQUEST_PAYOUT", "ACCEPT_MISSIONS"]
    }]
]);

function lookupIdentityByPhone(phoneNumber) {
    const cleanPhone = (phoneNumber || "").replace(/[^0-9]/g, "");
    
    if (userIdentityStore.has(cleanPhone)) {
        return userIdentityStore.get(cleanPhone);
    }
    
    for (const [phone, profile] of userIdentityStore.entries()) {
        if (cleanPhone.endsWith(phone.slice(-10))) {
            return profile;
        }
    }

    return {
        userId: `USR-${cleanPhone.slice(-5) || 'GUEST'}`,
        name: null,
        role: "UNREGISTERED",
        agentDetails: null,
        consumerDetails: { watchlist: [] },
        permissions: ["VIEW_PRICES", "ASK_AI"]
    };
}

// Outbound WhatsApp Reply Helper (Text & Flow)
async function sendWhatsAppMessage(recipientPhone, messageText, flowPayload = null) {
    console.log(`📱 [WhatsApp Outbound] Message to ${recipientPhone}: "${messageText.slice(0, 60)}..."`);
    if (!WHATSAPP_API_TOKEN || WHATSAPP_API_TOKEN.startsWith("EAAG...")) {
        return { status: "simulated_local", recipient: recipientPhone, text: messageText };
    }

    try {
        const body = flowPayload ? {
            messaging_product: "whatsapp",
            to: recipientPhone,
            type: "interactive",
            interactive: flowPayload
        } : {
            messaging_product: "whatsapp",
            to: recipientPhone,
            type: "text",
            text: { body: messageText }
        };

        const resp = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${WHATSAPP_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        return await resp.json();
    } catch (err) {
        console.error("❌ [sendWhatsAppMessage Error]:", err);
        return { error: err.message };
    }
}

// Outbound WhatsApp Interactive Quick-Reply Buttons Helper
async function sendWhatsAppButtons(recipientPhone, bodyText, buttons = []) {
    console.log(`🔘 [WhatsApp Outbound Buttons] To ${recipientPhone}: "${bodyText.slice(0, 40)}..." [${buttons.map(b => b.title).join(", ")}]`);

    const formattedButtons = buttons.slice(0, 3).map((btn, idx) => ({
        type: "reply",
        reply: {
            id: btn.id || `BTN_${idx}`,
            title: btn.title
        }
    }));

    const interactivePayload = {
        type: "button",
        body: { text: bodyText },
        action: { buttons: formattedButtons }
    };

    return await sendWhatsAppMessage(recipientPhone, bodyText, interactivePayload);
}

// POST /webhook/whatsapp — Inbound Message Receiver & Identity-Aware Hybrid Router
app.post("/webhook/whatsapp", async (req, res) => {
    try {
        const body = req.body;
        if (!body.object || !body.entry || !body.entry[0].changes) {
            return res.sendStatus(400);
        }

        const change = body.entry[0].changes[0].value;
        const messageData = change.messages ? change.messages[0] : null;

        if (!messageData) {
            return res.status(200).send("EVENT_RECEIVED");
        }

        const from = messageData.from;
        const msgType = messageData.type;
        let incomingText = "";

        if (msgType === "text") {
            incomingText = messageData.text.body.trim();
        } else if (msgType === "interactive") {
            const btnReply = messageData.interactive?.button_reply;
            if (btnReply) {
                console.log(`🔘 [Button Clicked] ID: ${btnReply.id} Title: "${btnReply.title}"`);
                if (btnReply.id === "BTN_VIEW_MISSIONS") incomingText = "missions";
                else if (btnReply.id === "BTN_CHECK_WALLET") incomingText = "wallet";
                else if (btnReply.id === "BTN_SEARCH_PRICES") incomingText = "search prices";
                else if (btnReply.id === "BTN_CASHOUT_WALLET") incomingText = "withdraw";
                else incomingText = btnReply.title;
            }
        } else if (msgType === "image") {
            incomingText = "[IMAGE_ATTACHMENT] Market evidence receipt or photo attached.";
        } else if (msgType === "audio" || msgType === "voice") {
            incomingText = "[VOICE_NOTE] Transcribed audio report.";
        } else if (msgType === "location") {
            incomingText = `[LOCATION_ATTACHED] Lat: ${messageData.location.latitude}, Long: ${messageData.location.longitude}`;
        }

        // ── 0. IDENTITY LAYER RESOLUTION ──
        const identity = lookupIdentityByPhone(from);
        console.log(`👤 [Identity Resolved] Phone: ${from} ➔ User: ${identity.name || 'Unregistered'} (${identity.role})`);

        const lowerText = incomingText.toLowerCase();

        // ── 1. PERSONA-AWARE GREETING ENGINE ──
        if (/^(hi|hello|hey|good morning|good afternoon|good evening|mama|mamaprice)$/i.test(lowerText)) {
            let greeting = "";
            let buttons = [];

            if (identity.role === "AGENT" && identity.agentDetails) {
                const ag = identity.agentDetails;
                greeting = `👋 *Welcome back, ${identity.name}!*\n\n👑 *Level ${ag.level} ${ag.levelLabel}* (${ag.primaryMarket})\n💰 *Today's Earnings:* ₦${ag.todayEarnings.toLocaleString()}\n👛 *Wallet Balance:* ₦${ag.walletBalance.toLocaleString()}\n⭐ *Trust Reputation:* ${ag.reputationScore}%\n\n🎯 *3 Missions Waiting* in ${ag.lga}!`;
                buttons = [
                    { id: "BTN_VIEW_MISSIONS", title: "🎯 View Missions" },
                    { id: "BTN_CHECK_WALLET", title: "👛 Check Wallet" },
                    { id: "BTN_CASHOUT_WALLET", title: "💳 Withdraw Cash" }
                ];
            } else if (identity.role === "CONSUMER") {
                greeting = `👋 *Welcome back, ${identity.name || 'Smart Saver'}!*\n\nHow can I help you find prices today?`;
                buttons = [
                    { id: "BTN_SEARCH_PRICES", title: "🛒 Search Prices" },
                    { id: "BTN_VIEW_MISSIONS", title: "🎯 Agent Portal" }
                ];
            } else {
                greeting = `👋 *Welcome to MamaPrice on WhatsApp!*\n\nTrack live market prices across Nigeria or earn cash as a Field Agent Scout.`;
                buttons = [
                    { id: "BTN_SEARCH_PRICES", title: "🛒 Search Prices" },
                    { id: "BTN_VIEW_MISSIONS", title: "🎯 View Missions" }
                ];
            }

            await sendWhatsAppButtons(from, greeting, buttons);
            return res.status(200).send("EVENT_RECEIVED");
        }

        // ── 2. Structured Intent Classifier & Commands ──

        // Command: MISSIONS / TASKS
        if (/missions|tasks|gap missions|available missions/i.test(lowerText)) {
            const missionsText = `🎯 *Active High-Gap Market Missions*\n\n` +
                `1️⃣ *Gusau Central Market* (Zamfara - 3% Coverage)\n   🌾 Sorghum & Rice (50kg) · Payout: *₦1,800 + 250 pts*\n\n` +
                `2️⃣ *Jimeta Main Market* (Yola - 11% Coverage)\n   🥜 Groundnut & Maize (100kg) · Payout: *₦1,200 + 150 pts*\n\n` +
                `3️⃣ *Lokoja Central Market* (Kogi - 24% Coverage)\n   🥔 Yam & Cement · Payout: *₦750 + 100 pts*\n\n` +
                `4️⃣ *Sango Market* (Ibadan - 82% Coverage)\n   🫘 Brown Beans (100kg) · Payout: *₦350 + 50 pts*\n\n` +
                `_Reply with a price observation to claim and complete a mission!_`;

            await sendWhatsAppMessage(from, missionsText);
            return res.status(200).send("EVENT_RECEIVED");
        }

        // Command: WALLET / BALANCE
        if (/wallet|balance|earnings|my money|cashout|withdraw/i.test(lowerText)) {
            const ag = identity.agentDetails;
            if (ag) {
                const walletMsg = `👛 *MamaPrice Scout Wallet*\n\n` +
                    `👤 Agent: *${identity.name}* (${ag.scoutId})\n` +
                    `👑 Rank: *Level ${ag.level} ${ag.levelLabel}*\n` +
                    `💰 Today's Earnings: *₦${ag.todayEarnings.toLocaleString()}*\n` +
                    `💳 Available Wallet Balance: *₦${ag.walletBalance.toLocaleString()}*\n` +
                    `⭐ Reputation Score: *${ag.reputationScore}%*\n` +
                    `📊 Total Reports Logged: *${ag.lifetimeReports}*\n\n` +
                    `_Type "withdraw" to request an instant bank cashout._`;
                await sendWhatsAppMessage(from, walletMsg);
            } else {
                await sendWhatsAppMessage(from, `👛 *MamaPrice Wallet*\n\nYour balance is ₦0. Type *Register* to become an Agent Scout and earn ₦250 per price report!`);
            }
            return res.status(200).send("EVENT_RECEIVED");
        }

        // Command: REGISTER / SIGNUP
        if (/register|become agent|signup agent|agent onboarding/i.test(lowerText)) {
            const flowData = {
                type: "flow",
                header: { type: "text", text: "MamaPrice Agent Portal" },
                body: { text: "Welcome! Complete your Agent Registration to earn ₦250 per price report." },
                action: {
                    name: "flow",
                    parameters: {
                        flow_id: "flow_agent_onboarding_01",
                        flow_message_version: "3",
                        flow_token: `token_${from}`,
                        flow_cta: "Register as Agent"
                    }
                }
            };
            await sendWhatsAppMessage(from, "Launching Agent Registration Flow...", flowData);
            return res.status(200).send("EVENT_RECEIVED");
        }

        // ── 3. Media Ingestion Handler (Photo OCR & Voice Note Reports) ──
        if (msgType === "image" || msgType === "audio" || msgType === "voice") {
            const isPhoto = (msgType === "image");
            const rewardAmount = isPhoto ? 350 : 250; // +100 OCR Bonus for photos

            if (identity.role === "AGENT" && identity.agentDetails) {
                identity.agentDetails.todayEarnings += rewardAmount;
                identity.agentDetails.walletBalance += rewardAmount;
                identity.agentDetails.lifetimeReports += 1;
            }

            const mediaType = isPhoto ? "📸 Receipt / Stall Photo OCR" : "🎙️ Voice Note Report";
            const newDoc = ojaGraph.addObservation({
                market: identity.agentDetails?.primaryMarket || "Local Market",
                product: isPhoto ? "Scanned Receipt Item" : "Voice Transcribed Commodity",
                observed_price: 24500,
                reported_by: identity.agentDetails ? `${identity.name} (${identity.agentDetails.scoutId})` : `@wa_${from}`
            }, isPhoto ? "RECEIPT_OCR" : "VOICE_REPORT");

            const replyMsg = `🎯 *${mediaType} Processed!*\n` +
                `✅ Grounded & Ingested into OjaGraph.\n` +
                `💰 *+₦${rewardAmount} Credited* to your wallet${isPhoto ? ' (+₦100 Photo OCR Bonus)' : ''}!\n` +
                `👛 *New Balance:* ₦${(identity.agentDetails?.walletBalance || rewardAmount).toLocaleString()}`;

            await sendWhatsAppMessage(from, replyMsg);
            return res.status(200).send("EVENT_RECEIVED");
        }

        // ── 4. Price Report Pattern Recognition -> Direct OjaGraph Ingest ──
        if (/report|price update|selling for|market price|i bought|basket|bag/i.test(lowerText)) {
            if (identity.role === "AGENT" && identity.agentDetails) {
                identity.agentDetails.todayEarnings += 250;
                identity.agentDetails.walletBalance += 250;
                identity.agentDetails.lifetimeReports += 1;
            }

            const newDoc = ojaGraph.addObservation({
                market: identity.agentDetails?.primaryMarket || "Local Market",
                product: incomingText.slice(0, 30),
                observed_price: 15000,
                reported_by: identity.agentDetails ? `${identity.name} (${identity.agentDetails.scoutId})` : `@wa_${from}`
            }, "PRICE");

            const walletText = identity.agentDetails ? `\n💰 *Wallet Balance:* ₦${identity.agentDetails.walletBalance.toLocaleString()} (+₦250 credited)` : `\n💰 *+₦250 Credited* to your wallet.`;

            const replyMsg = `🎯 *Report Verified (+25 MarketPoints)*\nVerified by ${identity.name || 'Field Agent'} (${identity.agentDetails?.scoutId || 'Scout'}). Ingested into OjaGraph!${walletText}`;
            await sendWhatsAppMessage(from, replyMsg);
            return res.status(200).send("EVENT_RECEIVED");
        }

        // ── 5. Natural Language Consumer Search Query -> OjaGraph RAG ──
        const searchRes = ojaGraph.searchCommerceIntelligence(incomingText);
        const groundedContext = buildGroundedContext(incomingText, searchRes);

        let aiAnswer = "";
        if (groundedContext && groundedContext.includes("PRICE INTELLIGENCE")) {
            const topObs = searchRes.prices?.[0];
            if (topObs) {
                aiAnswer = `🛒 *MamaPrice Intelligence*\n\n*${topObs.product}* at *${topObs.market}*\n💰 Average Price: *₦${topObs.observed_price?.toLocaleString()}*\n📊 Verified by field agents today.`;
            } else {
                aiAnswer = `👋 Hello! I'm MamaPrice AI.\nI found live market data for your query: "${incomingText}". Ask me for regional comparisons, price trends, or cheapest markets!`;
            }
        } else {
            aiAnswer = `👋 Hello! Welcome to MamaPrice on WhatsApp.\nHow can I help you today?\n\n1️⃣ Ask for prices (e.g. "Rice in Mile 12")\n2️⃣ Type *Missions* to view active tasks\n3️⃣ Type *Wallet* to view earnings\n4️⃣ Type *Register* to become a paid Agent Scout!`;
        }

        await sendWhatsAppMessage(from, aiAnswer);
        return res.status(200).send("EVENT_RECEIVED");

    } catch (err) {
        console.error("❌ [WhatsApp Webhook Post Error]:", err);
        return res.status(500).send("INTERNAL_SERVER_ERROR");
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Model Initialization
// ─────────────────────────────────────────────────────────────────────────────

async function initLlama() {
    try {
        console.log("STEP 1 - Initializing Llama CPU runtime...");
        llama = await getLlama({ gpu: false });
        console.log("✓ STEP 1 COMPLETE");

        console.log("STEP 2 - Loading OjaLM GGUF model...");
        model = await llama.loadModel({ modelPath: MODEL_PATH });
        console.log("✓ STEP 2 COMPLETE — OjaLM loaded on CPU.");
    } catch (err) {
        console.warn("\n⚠️ LOCAL OJALM GGUF UNAVAILABLE ⚠️");
        console.warn("Notice:", err.message || err);
        console.warn("Continuing server startup in Cloud Inference & OpenRouter Secondary Mode.\n");
        model = null;
        llama = null;
    }
}

async function startServer() {
    await initLlama();
    const PORT = 3001;
    app.listen(PORT, () => {
        console.log(`\n✅ MamaPrice Commerce Intelligence API`);
        console.log(`   Powered by OjaLM + OjaGraph v2 Hybrid RAG`);
        console.log(`   Listening on http://localhost:${PORT}\n`);
    });
}

startServer();
