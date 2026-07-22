/**
 * Metasidd Orb - SwiftUI Metasidd/Orb Component for Web Canvas
 * Deep Research Engine Configuration (Single Premium Orb)
 */
class MetasiddOrb {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.time = 0;

        // Metasidd/Orb Market Mama Configuration
        this.config = {
            name: "Market Mama Intelligence Engine",
            backgroundColors: ['#0d5c3a', '#10b981', '#34d399'],
            glowColor: 'rgba(167, 243, 208, 0.85)',
            particleColor: 'rgba(255, 255, 255, 0.95)',
            coreGlowIntensity: 1.3,
            speed: 0.038
        };

        // Initialize particles
        this.numParticles = 20;
        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                radius: Math.random() * 24 + 6,
                speed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
                size: Math.random() * 1.8 + 0.8,
                alpha: Math.random() * 0.7 + 0.3
            });
        }

        this.animate();
    }

    animate() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const cx = width / 2;
        const cy = height / 2;
        const radius = width * 0.42;

        this.time += this.config.speed;
        this.ctx.clearRect(0, 0, width, height);

        // 1. Outer Glow Layer
        const outerGlow = this.ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.18);
        outerGlow.addColorStop(0, this.config.glowColor);
        outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = outerGlow;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2);
        this.ctx.fill();

        // 2. Base Sphere Clip & Liquid Gradient Blobs
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.clip();

        // Base linear gradient
        const bgGrad = this.ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, this.config.backgroundColors[0]);
        bgGrad.addColorStop(0.5, this.config.backgroundColors[1]);
        bgGrad.addColorStop(1, this.config.backgroundColors[2]);
        this.ctx.fillStyle = bgGrad;
        this.ctx.fillRect(0, 0, width, height);

        // Dynamic Liquid Wavy Blobs
        for (let i = 0; i < 3; i++) {
            const blobAngle = this.time * (i % 2 === 0 ? 1 : -1.2) + (i * Math.PI / 1.5);
            const bx = cx + Math.cos(blobAngle) * (radius * 0.3);
            const by = cy + Math.sin(blobAngle * 1.3) * (radius * 0.3);
            const br = radius * (0.55 + Math.sin(this.time + i) * 0.1);

            const blobGrad = this.ctx.createRadialGradient(bx, by, 0, bx, by, br);
            const color = this.config.backgroundColors[(i + 1) % this.config.backgroundColors.length];
            blobGrad.addColorStop(0, color);
            blobGrad.addColorStop(1, 'transparent');

            this.ctx.fillStyle = blobGrad;
            this.ctx.beginPath();
            this.ctx.arc(bx, by, br, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // 3. Core Glow Center
        const coreGlow = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.65);
        coreGlow.addColorStop(0, 'rgba(255, 255, 255, ' + (0.65 * this.config.coreGlowIntensity) + ')');
        coreGlow.addColorStop(0.5, this.config.glowColor);
        coreGlow.addColorStop(1, 'transparent');
        this.ctx.fillStyle = coreGlow;
        this.ctx.fillRect(0, 0, width, height);

        // 4. Floating Particles
        this.particles.forEach(p => {
            p.angle += p.speed;
            const px = cx + Math.cos(p.angle) * p.radius;
            const py = cy + Math.sin(p.angle * 1.2) * p.radius;

            this.ctx.fillStyle = this.config.particleColor;
            this.ctx.globalAlpha = p.alpha * (0.6 + Math.sin(this.time * 2 + p.angle) * 0.4);
            this.ctx.beginPath();
            this.ctx.arc(px, py, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;

        // 5. Specular Highlight (Glass Depth)
        const spec = this.ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, 0, cx, cy, radius);
        spec.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        spec.addColorStop(0.4, 'rgba(255, 255, 255, 0.08)');
        spec.addColorStop(1, 'transparent');
        this.ctx.fillStyle = spec;
        this.ctx.fillRect(0, 0, width, height);

        this.ctx.restore();

        requestAnimationFrame(() => this.animate());
    }
}

// Auto-instantiate single Deep Research Orb
document.addEventListener('DOMContentLoaded', () => {
    window.metasiddOrbInstance = new MetasiddOrb('orb-canvas');
});
