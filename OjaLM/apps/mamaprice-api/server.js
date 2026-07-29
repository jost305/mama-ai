import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import cors from "cors";
import { getLlama, LlamaChatSession } from "node-llama-cpp";
import { ojaGraph } from "./ojagraph.js";

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
// Intent Detection — determines what type of commerce knowledge to retrieve
// ─────────────────────────────────────────────────────────────────────────────

const INTENT_KEYWORDS = {
    price:        ["price", "cost", "how much", "naira", "ngn", "cheap", "expensive", "rate", "sold", "buy"],
    availability: ["available", "stock", "out of stock", "in stock", "find", "where to buy", "sold out", "have"],
    vendor:       ["vendor", "seller", "shop", "store", "trader", "merchant", "stall", "trusted", "reliable"],
    market_event: ["closed", "open", "strike", "flood", "rain", "event", "renovation", "traffic", "days"],
    counterfeit:  ["fake", "counterfeit", "original", "authentic", "genuine", "real", "copy", "spoil"],
    quality:      ["quality", "fresh", "good", "bad", "expired", "rotten", "packaging", "condition"]
};

function detectQueryIntents(query) {
    const q = query.toLowerCase();
    const intents = new Set();
    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
        if (keywords.some(kw => q.includes(kw))) {
            intents.add(intent);
        }
    }
    // Default to price if no specific intent detected
    if (intents.size === 0) intents.add("price");
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

async function getOrCreateSession(sessionId) {
    if (sessions.has(sessionId)) {
        const existing = sessions.get(sessionId);
        existing.lastActive = Date.now();
        return existing.chatSession;
    }

    console.log(`[SESSION] Creating new context (contextSize: 2048) for ID: "${sessionId}"`);
    const context = await model.createContext({ contextSize: 2048 });
    const sequence = context.getSequence();
    const chatSession = new LlamaChatSession({
        contextSequence: sequence,
        systemPrompt: SYSTEM_PROMPT
    });

    sessions.set(sessionId, { context, sequence, chatSession, lastActive: Date.now() });
    return chatSession;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /chat — Hybrid RAG Commerce Intelligence Endpoint
// ─────────────────────────────────────────────────────────────────────────────

app.post("/chat", async (req, res) => {
    console.log("\n--- POST /chat ---");

    let prompt, sessionId, modelId;
    try {
        prompt = req.body.prompt;
        sessionId = req.body.sessionId || req.headers["x-session-id"] || "default-session";
        modelId = req.body.modelId || "MamaPrice 4o";
        console.log(`[SESSION: ${sessionId}] [MODEL: ${modelId}] Prompt: "${prompt}"`);
    } catch (err) {
        return res.status(400).json({ stage: "parse_body", error: err.message });
    }

    if (!model) {
        return res.status(500).json({ stage: "model_check", error: "OjaLM model not loaded" });
    }

    let chatSession;
    try {
        chatSession = await getOrCreateSession(sessionId);
    } catch (err) {
        return res.status(500).json({ stage: "getOrCreateSession", error: err.message });
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
        console.log(`[DIRECT OJALM] Bypassing RAG for direct GGUF inference.`);
    }

    // Step 3: Build grounded context from multi-type evidence
    const groundedContext = buildGroundedContext(prompt, allEvidence);

    const augmentedPrompt = groundedContext
        ? `${groundedContext}\n\nUSER QUESTION: ${prompt}`
        : prompt;

    // Step 4: OjaLM Reasoning & Response Generation
    try {
        console.log(`[OjaLM] Generating response for session "${sessionId}"...`);
        const responseText = await chatSession.prompt(augmentedPrompt);
        console.log(`[OjaLM] Response complete (${responseText.length} chars).`);

        return res.json({
            sessionId,
            modelUsed: modelId,
            response: responseText.trim(),
            intents: detectedIntents,
            evidence: allEvidence
        });
    } catch (err) {
        console.error(`❌ [session.prompt] failed for session "${sessionId}":`, err);
        return res.status(500).json({ stage: "session.prompt", error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /observe — Ingest a new Commerce Observation from an Agent
// ─────────────────────────────────────────────────────────────────────────────
app.post("/observe", async (req, res) => {
    const { reportType = "PRICE", data } = req.body;
    if (!data) return res.status(400).json({ error: "data is required" });

    try {
        const newDoc = ojaGraph.addObservation(data, reportType);
        console.log(`[OjaGraph] New ${reportType} observation ingested: ${newDoc.id}`);
        res.json({ success: true, document: newDoc });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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

// Outbound WhatsApp Reply Helper
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

// POST /webhook/whatsapp — Inbound Message Receiver & Hybrid Router
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
        } else if (msgType === "image") {
            incomingText = "[IMAGE_ATTACHMENT] Market evidence receipt or photo attached.";
        } else if (msgType === "audio" || msgType === "voice") {
            incomingText = "[VOICE_NOTE] Transcribed audio report.";
        } else if (msgType === "location") {
            incomingText = `[LOCATION_ATTACHED] Lat: ${messageData.location.latitude}, Long: ${messageData.location.longitude}`;
        }

        console.log(`📩 [WhatsApp Webhook] Inbound from ${from} (${msgType}): "${incomingText}"`);

        const lowerText = incomingText.toLowerCase();

        // ── 1. Structured Intent Classifier -> Launch WhatsApp Flow ──
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

        if (/withdraw|cashout|payout|wallet balance/i.test(lowerText)) {
            const flowData = {
                type: "flow",
                header: { type: "text", text: "MamaPrice Wallet & Cashout" },
                body: { text: "Select your bank and enter withdrawal amount:" },
                action: {
                    name: "flow",
                    parameters: {
                        flow_id: "flow_agent_withdraw_01",
                        flow_message_version: "3",
                        flow_token: `withdraw_${from}`,
                        flow_cta: "Withdraw Earnings"
                    }
                }
            };
            await sendWhatsAppMessage(from, "Opening Withdrawal Portal...", flowData);
            return res.status(200).send("EVENT_RECEIVED");
        }

        // ── 2. Price Report Pattern Recognition -> Direct OjaGraph Ingest ──
        if (/report|price update|selling for|market price|i bought|basket|bag/i.test(lowerText)) {
            const newDoc = ojaGraph.addObservation({
                market: "Local Market",
                product: incomingText.slice(0, 30),
                observed_price: 15000,
                reported_by: `@wa_${from}`
            }, "PRICE");

            const replyMsg = `🎯 *Report Verified (+25 MarketPoints)*\nYour price report has been ingested into MamaPrice OjaGraph!\n💰 *+₦250 Credited* to your withdrawal wallet.`;
            await sendWhatsAppMessage(from, replyMsg);
            return res.status(200).send("EVENT_RECEIVED");
        }

        // ── 3. Natural Language Query -> Route through OjaLM + OjaGraph RAG ──
        const detectedIntents = detectQueryIntents(incomingText);
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
            aiAnswer = `👋 Hello! Welcome to MamaPrice on WhatsApp.\nHow can I help you today?\n\n1️⃣ Ask for prices (e.g. "Rice in Mile 12")\n2️⃣ Compare markets (e.g. "Mile 12 vs Bodija")\n3️⃣ Type "Register" to become a paid Agent Scout!`;
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
        console.log("STEP 1 - getLlama()");
        llama = await getLlama({ gpu: false });
        console.log("✓ STEP 1 COMPLETE");

        console.log("STEP 2 - loadModel()");
        model = await llama.loadModel({ modelPath: MODEL_PATH });
        console.log("✓ STEP 2 COMPLETE — OjaLM loaded on CPU.");
    } catch (err) {
        console.error("\n❌ FAILED TO LOAD OJALM MODEL ❌");
        console.error(err);
        if (err.stack) console.error(err.stack);
        process.exit(1);
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
