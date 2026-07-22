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

// Multi-user Session Store (sessionId -> { context, sequence, chatSession, lastActive })
const sessions = new Map();

const SYSTEM_PROMPT = `You are MamaPrice, the friendly and intelligent AI agent for commerce and market prices in Nigeria.

When provided with GROUNDED OJAGRAPH EVIDENCE, use those exact verified prices, markets, confidence levels, and freshness indicators to answer the user accurately and clearly.`;

async function getOrCreateSession(sessionId) {
    if (sessions.has(sessionId)) {
        const existing = sessions.get(sessionId);
        existing.lastActive = Date.now();
        return existing.chatSession;
    }

    console.log(`[SESSION] Creating new isolated context & chat session for ID: "${sessionId}"`);
    const context = await model.createContext();
    const sequence = context.getSequence();
    const chatSession = new LlamaChatSession({
        contextSequence: sequence,
        systemPrompt: SYSTEM_PROMPT
    });

    const sessionObj = {
        context,
        sequence,
        chatSession,
        lastActive: Date.now()
    };

    sessions.set(sessionId, sessionObj);
    return chatSession;
}

app.post("/chat", async (req, res) => {
    console.log("\n--- POST /chat received ---");
    
    let prompt;
    let sessionId;
    let modelId;
    try {
        prompt = req.body.prompt;
        sessionId = req.body.sessionId || req.headers["x-session-id"] || "default-session";
        modelId = req.body.modelId || "MamaPrice 4o";
        console.log(`[SESSION: ${sessionId}] [MODEL: ${modelId}] Prompt: "${prompt}"`);
    } catch (error) {
        console.error("❌ Stage [parse_body] failed:", error);
        return res.status(400).json({ stage: "parse_body", error: error.message });
    }

    if (!model) {
        console.error("❌ Stage [model_check] failed: OjaLM model is not loaded.");
        return res.status(500).json({ stage: "model_check", error: "Model not loaded" });
    }

    let chatSession;
    try {
        chatSession = await getOrCreateSession(sessionId);
    } catch (error) {
        console.error(`❌ Stage [getOrCreateSession] failed for session "${sessionId}":`, error);
        return res.status(500).json({ stage: "getOrCreateSession", error: error.message });
    }

    // Stage 1: RAG Retrieval over OjaGraph (Enabled for MamaPrice 4o and OjaGraph RAG)
    const enableRAG = (modelId === "MamaPrice 4o" || modelId === "OjaGraph RAG");
    
    let matchedEvidence = [];
    if (enableRAG) {
        console.log(`[RAG] Searching OjaGraph for: "${prompt}"`);
        matchedEvidence = ojaGraph.searchPriceObservations(prompt);
        console.log(`[RAG] Retained ${matchedEvidence.length} matching price observations from OjaGraph.`);
    } else {
        console.log(`[DIRECT OJALM] Bypassing RAG for direct GGUF inference mode.`);
    }

    let augmentedPrompt = prompt;
    if (matchedEvidence.length > 0) {
        const evidenceStr = JSON.stringify(matchedEvidence.map(obs => ({
            product: obs.product,
            brand: obs.brand,
            market: obs.market,
            state: obs.state,
            price_ngn: obs.observed_price,
            unit: obs.quantity,
            confidence: obs.confidence,
            freshness_hours: obs.freshness_hours
        })), null, 2);

        augmentedPrompt = `GROUNDED OJAGRAPH EVIDENCE:\n${evidenceStr}\n\nUSER QUESTION: ${prompt}`;
    }

    try {
        console.log(`[SESSION: ${sessionId}] [MODEL: ${modelId}] Generating response...`);
        const responseText = await chatSession.prompt(augmentedPrompt);
        console.log(`[SESSION: ${sessionId}] Response complete (${responseText.length} chars).`);
        return res.json({ 
            sessionId: sessionId,
            modelUsed: modelId,
            response: responseText.trim(),
            evidence: matchedEvidence
        });
    } catch (error) {
        console.error(`❌ Stage [session.prompt] failed for session "${sessionId}":`, error);
        return res.status(500).json({ stage: "session.prompt", error: error.message });
    }
});

async function initLlama() {
    try {
        console.log("STEP 1 - getLlama()");
        llama = await getLlama({ gpu: false });
        console.log("✓ STEP 1 COMPLETE");

        console.log("STEP 2 - loadModel()");
        model = await llama.loadModel({
            modelPath: MODEL_PATH
        });
        console.log("✓ STEP 2 COMPLETE");

        console.log("OjaLM Model loaded successfully onto CPU!");
    } catch (error) {
        console.error("\n❌ FAILED TO LOAD OJALM MODEL ❌");
        console.error(error);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

async function startServer() {
    await initLlama();

    const PORT = 3001;
    app.listen(PORT, () => {
        console.log(`MamaPrice API (powered by OjaLM + OjaGraph RAG) listening locally on port ${PORT}`);
    });
}

startServer();
