import path from "path";
import { fileURLToPath } from "url";
import { getLlama } from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_PATH = path.join(__dirname, "..", "..", "models", "OjaLM", "OjaLM-v0.1.gguf");

async function runDiagnostic() {
    console.log("==========================================");
    console.log("  node-llama-cpp RUNTIME DIAGNOSTIC AUDIT ");
    console.log("==========================================");

    console.log("\n1. Initializing Llama with gpu: false...");
    // FORCING CPU BACKEND
    const llama = await getLlama({ gpu: false });
    
    console.log("   - Llama GPU Backend detected:", llama.gpu);
    console.log("   - Llama Build Type:", llama.buildType);

    console.log("\n2. Testing Model Load (CPU-only)...");
    try {
        const model = await llama.loadModel({
            modelPath: MODEL_PATH
        });
        console.log("   ✓ Model loaded cleanly!");

        console.log("\n3. Testing Context Creation...");
        const context = await model.createContext();
        console.log("   ✓ Context created cleanly!");

        console.log("\n4. Testing Standalone Chat Session...");
        const sequence = context.getSequence();
        const { LlamaChatSession } = await import("node-llama-cpp");
        const session = new LlamaChatSession({
            contextSequence: sequence,
            systemPrompt: "You are MamaPrice, an AI for Nigerian market prices."
        });

        console.log("   - Sending prompt: 'Hello'");
        const response = await session.prompt("Hello");
        console.log("   ✓ Standalone inference successful!");
        console.log("\nResponse from OjaLM:");
        console.log("------------------------------------------");
        console.log(response);
        console.log("------------------------------------------");

    } catch (err) {
        console.error("\n❌ DIAGNOSTIC FAILED AT STAGE:", err);
        if (err.stack) console.error(err.stack);
    }
}

runDiagnostic();
