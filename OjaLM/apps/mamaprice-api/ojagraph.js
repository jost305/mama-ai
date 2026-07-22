import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OBSERVATIONS_DIR = path.join(__dirname, "..", "..", "datasets", "ojagraph", "dynamic", "price_observations");

// Pre-seeded high-quality market observations for Nigerian commodities
const SEEDED_OBSERVATIONS = [
    {
        id: "obs_cement_001",
        type: "PriceObservation",
        product: "Dangote Cement",
        brand: "Dangote",
        market: "Balogun Market",
        state: "Lagos",
        observed_price: 8500,
        currency: "NGN",
        quantity: "50kg bag",
        observed_date: "2026-07-21",
        confidence: 0.96,
        sources_count: 12,
        freshness_hours: 3
    },
    {
        id: "obs_cement_002",
        type: "PriceObservation",
        product: "Dangote Cement",
        brand: "Dangote",
        market: "Trade Fair Complex",
        state: "Lagos",
        observed_price: 8650,
        currency: "NGN",
        quantity: "50kg bag",
        observed_date: "2026-07-21",
        confidence: 0.94,
        sources_count: 8,
        freshness_hours: 5
    },
    {
        id: "obs_flour_001",
        type: "PriceObservation",
        product: "Golden Penny Flour",
        brand: "Golden Penny",
        market: "Mile 12 Market",
        state: "Lagos",
        observed_price: 72500,
        currency: "NGN",
        quantity: "50kg bag",
        observed_date: "2026-07-21",
        confidence: 0.98,
        sources_count: 19,
        freshness_hours: 2
    },
    {
        id: "obs_rice_001",
        type: "PriceObservation",
        product: "Mama Gold Rice",
        brand: "Mama Gold",
        market: "Bodija Market",
        state: "Oyo",
        observed_price: 88000,
        currency: "NGN",
        quantity: "50kg bag",
        observed_date: "2026-07-21",
        confidence: 0.95,
        sources_count: 14,
        freshness_hours: 4
    },
    {
        id: "obs_tomato_001",
        type: "PriceObservation",
        product: "Fresh Tomatoes",
        brand: "Local Produce",
        market: "Mile 12 Market",
        state: "Lagos",
        observed_price: 42000,
        currency: "NGN",
        quantity: "Big Raffia Basket",
        observed_date: "2026-07-21",
        confidence: 0.92,
        sources_count: 22,
        freshness_hours: 1
    }
];

class OjaGraphService {
    constructor() {
        this.observations = [...SEEDED_OBSERVATIONS];
        this.loadDiskObservations();
    }

    loadDiskObservations() {
        try {
            if (fs.existsSync(OBSERVATIONS_DIR)) {
                const files = fs.readdirSync(OBSERVATIONS_DIR).filter(f => f.endsWith(".json"));
                for (const file of files) {
                    const content = fs.readFileSync(path.join(OBSERVATIONS_DIR, file), "utf-8");
                    const obs = JSON.parse(content);
                    if (obs && obs.product) {
                        this.observations.push(obs);
                    }
                }
            }
        } catch (err) {
            console.error("[OjaGraph] Error loading disk observations:", err.message);
        }
    }

    /**
     * Search OjaGraph observations by product/market keywords
     */
    searchPriceObservations(query) {
        if (!query || typeof query !== "string") return [];
        
        const q = query.toLowerCase();
        const keywords = q.split(/\s+/).filter(w => w.length > 2);

        return this.observations.filter(obs => {
            const prod = (obs.product || "").toLowerCase();
            const brand = (obs.brand || "").toLowerCase();
            const mkt = (obs.market || "").toLowerCase();

            return keywords.some(k => prod.includes(k) || brand.includes(k) || mkt.includes(k));
        });
    }

    /**
     * Add a newly extracted observation from a Scout report
     */
    addObservation(obsData) {
        const newObs = {
            id: `obs_${Date.now()}`,
            type: "PriceObservation",
            product: obsData.product || "Unknown Product",
            brand: obsData.brand || "Generic",
            market: obsData.market || "General Market",
            state: obsData.state || "Lagos",
            observed_price: obsData.price_ngn || obsData.observed_price || 0,
            currency: "NGN",
            quantity: obsData.unit || "unit",
            observed_date: new Date().toISOString().split("T")[0],
            confidence: obsData.confidence || 0.90,
            sources_count: 1,
            freshness_hours: 0
        };

        this.observations.unshift(newObs);
        return newObs;
    }
}

export const ojaGraph = new OjaGraphService();
