const { execSync } = require('child_process');
const path = require('path');

console.log("Starting Privy SDK bundle build...");

try {
    const cmd = `npx esbuild "${path.join(__dirname, 'market-mama-brand', 'privy-entry.jsx')}" --bundle --outfile="${path.join(__dirname, 'MamaPrice-UI', 'privy-bundle.js')}" --format=iife --target=es2020 "--define:process.env.NODE_ENV=\\"production\\"" "--define:global=window"`;
    execSync(cmd, { stdio: 'inherit' });
    console.log("✅ Successfully built MamaPrice-UI/privy-bundle.js!");
} catch (err) {
    console.error("❌ Build failed:", err.message);
    process.exit(1);
}
