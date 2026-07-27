const esbuild = require('market-mama-brand/node_modules/esbuild');

console.log("Starting Privy SDK bundle build...");

esbuild.build({
    entryPoints: ['market-mama-brand/privy-entry.jsx'],
    bundle: true,
    outfile: 'MamaPrice-UI/privy-bundle.js',
    format: 'iife',
    target: ['es2020'],
    define: {
        'process.env.NODE_ENV': '"production"',
        'global': 'window'
    },
    minify: false
}).then(() => {
    console.log("✅ Successfully built MamaPrice-UI/privy-bundle.js!");
}).catch((err) => {
    console.error("❌ Build failed:", err);
    process.exit(1);
});
