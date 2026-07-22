import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GRAPH_BASE = path.join(__dirname, "..", "..", "datasets", "ojagraph", "dynamic");

// ─────────────────────────────────────────────────────────────────────────────
// OjaGraph Commerce Intelligence Corpus — Seeded with real market observations
// ─────────────────────────────────────────────────────────────────────────────

const SEEDED_PRICE_OBSERVATIONS = [
    {
        id: "obs_cement_001", type: "PriceObservation",
        product: "Dangote Cement", brand: "Dangote",
        market: "Balogun Market", state: "Lagos",
        observed_price: 8500, currency: "NGN", quantity: "50kg bag",
        observed_date: "2026-07-21", confidence: 0.96, sources_count: 12, freshness_hours: 3
    },
    {
        id: "obs_flour_001", type: "PriceObservation",
        product: "Golden Penny Flour", brand: "Golden Penny",
        market: "Mile 12 Market", state: "Lagos",
        observed_price: 72500, currency: "NGN", quantity: "50kg bag",
        observed_date: "2026-07-21", confidence: 0.98, sources_count: 19, freshness_hours: 2
    },
    {
        id: "obs_rice_001", type: "PriceObservation",
        product: "Mama Gold Rice", brand: "Mama Gold",
        market: "Bodija Market", state: "Oyo",
        observed_price: 88000, currency: "NGN", quantity: "50kg bag",
        observed_date: "2026-07-21", confidence: 0.95, sources_count: 14, freshness_hours: 4
    },
    {
        id: "obs_tomato_001", type: "PriceObservation",
        product: "Fresh Tomatoes", brand: "Local Produce",
        market: "Mile 12 Market", state: "Lagos",
        observed_price: 42000, currency: "NGN", quantity: "Big Raffia Basket",
        observed_date: "2026-07-21", confidence: 0.92, sources_count: 22, freshness_hours: 1
    }
];

const SEEDED_AVAILABILITY_REPORTS = [
    {
        id: "avail_yam_001", type: "AvailabilityReport",
        product: "Pounded Yam Flour", brand: "Ola Ola",
        market: "Balogun Market", state: "Lagos",
        in_stock: true, stock_level: "HIGH",
        vendor_section: "Foodstuff Section, Block A",
        observed_date: "2026-07-21", confidence: 0.93, freshness_hours: 2,
        notes: "Plentiful supply this week due to harvest season."
    },
    {
        id: "avail_palm_001", type: "AvailabilityReport",
        product: "Palm Oil", brand: "Local",
        market: "Bodija Market", state: "Oyo",
        in_stock: true, stock_level: "MEDIUM",
        vendor_section: "Oils & Condiments Lane",
        observed_date: "2026-07-21", confidence: 0.88, freshness_hours: 6,
        notes: "Mid-week supply is moderate; early morning recommended."
    }
];

const SEEDED_MARKET_EVENTS = [
    {
        id: "event_012_001", type: "MarketEvent",
        market: "Oshodi Market", state: "Lagos",
        event_type: "CLOSURE",
        title: "Oshodi Market Closed for Renovation",
        description: "Oshodi International Market is partially closed Tuesdays and Thursdays for renovation works. Alternative: Balogun Market.",
        severity: "MEDIUM", start_date: "2026-07-20", end_date: "2026-08-15",
        confidence: 0.99, freshness_hours: 48
    }
];

const SEEDED_VENDOR_REVIEWS = [
    {
        id: "vendor_rev_001", type: "VendorReview",
        vendor_name: "Mama Nkechi Provisions", market: "Mile 12 Market", state: "Lagos",
        products_sold: ["Fresh Tomatoes", "Pepper", "Onions"],
        rating: 4.7, total_reviews: 34,
        reliability: "HIGH", delivery: false,
        notes: "Highly trusted vendor. Always has fresh produce early morning.",
        observed_date: "2026-07-20", confidence: 0.95, freshness_hours: 24
    }
];

const SEEDED_COUNTERFEIT_ALERTS = [
    {
        id: "counterfeit_001", type: "CounterfeitAlert",
        product: "Indomie Instant Noodles", brand: "Indomie",
        market: "Ladipo Market", state: "Lagos",
        risk_level: "HIGH",
        description: "Multiple counterfeit Indomie packs spotted with slightly different labeling. Check hologram on pack.",
        observed_date: "2026-07-18", confidence: 0.85, freshness_hours: 72,
        agent_id: "agent_001"
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// CommerceGraph — Multi-Entity Knowledge Engine
// ─────────────────────────────────────────────────────────────────────────────

class CommerceGraphService {
    constructor() {
        // In-memory stores per document type
        this.priceObservations = [...SEEDED_PRICE_OBSERVATIONS];
        this.availabilityReports = [...SEEDED_AVAILABILITY_REPORTS];
        this.marketEvents = [...SEEDED_MARKET_EVENTS];
        this.vendorReviews = [...SEEDED_VENDOR_REVIEWS];
        this.counterfeitAlerts = [...SEEDED_COUNTERFEIT_ALERTS];
        this.qualityAssessments = [];

        // Load all from disk
        this._loadDynamic("price_observations", this.priceObservations);
        this._loadDynamic("availability", this.availabilityReports);
        this._loadDynamic("market_events", this.marketEvents);
        this._loadDynamic("vendor_reviews", this.vendorReviews);
        this._loadDynamic("counterfeit_alerts", this.counterfeitAlerts);
        this._loadDynamic("quality_assessments", this.qualityAssessments);

        console.log(`[OjaGraph v2] Commerce Graph loaded. Nodes: ${this._totalNodes()} documents across ${this._nodeTypes()} categories.`);
    }

    _loadDynamic(folderName, store) {
        try {
            const dir = path.join(GRAPH_BASE, folderName);
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
                for (const file of files) {
                    const content = fs.readFileSync(path.join(dir, file), "utf-8");
                    const doc = JSON.parse(content);
                    if (doc && (doc.product || doc.market || doc.title)) {
                        store.push(doc);
                    }
                }
            }
        } catch (err) {
            console.error(`[OjaGraph] Error loading ${folderName}:`, err.message);
        }
    }

    _totalNodes() {
        return this.priceObservations.length + this.availabilityReports.length +
               this.marketEvents.length + this.vendorReviews.length +
               this.counterfeitAlerts.length + this.qualityAssessments.length;
    }

    _nodeTypes() { return 6; }

    /**
     * Multi-intent commerce search across all document types.
     * @param {string} query - Natural language user query
     * @returns {object} - Categorized evidence across all knowledge types
     */
    searchCommerceIntelligence(query) {
        if (!query || typeof query !== "string") return {};

        const q = query.toLowerCase();
        const keywords = q.split(/\s+/).filter(w => w.length > 2);

        const matches = {
            prices: [],
            availability: [],
            market_events: [],
            vendor_reviews: [],
            counterfeit_alerts: [],
            quality_assessments: []
        };

        const scorer = (doc) => {
            const fields = [
                doc.product, doc.brand, doc.market, doc.state,
                doc.title, doc.description, doc.notes, doc.vendor_name
            ].filter(Boolean).map(f => f.toLowerCase()).join(" ");
            return keywords.filter(k => fields.includes(k)).length;
        };

        const filterAndScore = (store, key) => {
            store.forEach(doc => {
                const score = scorer(doc);
                if (score > 0) matches[key].push({ ...doc, _relevance: score });
            });
            matches[key].sort((a, b) => b._relevance - a._relevance);
            matches[key] = matches[key].slice(0, 5); // top 5 per category
        };

        filterAndScore(this.priceObservations, "prices");
        filterAndScore(this.availabilityReports, "availability");
        filterAndScore(this.marketEvents, "market_events");
        filterAndScore(this.vendorReviews, "vendor_reviews");
        filterAndScore(this.counterfeitAlerts, "counterfeit_alerts");
        filterAndScore(this.qualityAssessments, "quality_assessments");

        return matches;
    }

    /**
     * Legacy: search only price observations (backward compatible)
     */
    searchPriceObservations(query) {
        return this.searchCommerceIntelligence(query).prices || [];
    }

    /**
     * Add a new observation or report to the in-memory graph and persist to disk.
     * @param {object} data - Observation/report data from an Agent
     * @param {string} reportType - Type of report (PRICE, AVAILABILITY, etc.)
     */
    addObservation(data, reportType = "PRICE") {
        const id = `obs_${reportType.toLowerCase()}_${Date.now()}`;
        const timestamp = new Date().toISOString().split("T")[0];

        let newDoc;
        let targetStore;
        let targetFolder;

        switch (reportType.toUpperCase()) {
            case "AVAILABILITY":
                newDoc = {
                    id, type: "AvailabilityReport",
                    product: data.product || "Unknown",
                    brand: data.brand || "Generic",
                    market: data.market || "General Market",
                    state: data.state || "Lagos",
                    in_stock: data.in_stock !== undefined ? data.in_stock : true,
                    stock_level: data.stock_level || "UNKNOWN",
                    observed_date: timestamp, confidence: data.confidence || 0.80,
                    freshness_hours: 0, notes: data.notes || ""
                };
                targetStore = this.availabilityReports;
                targetFolder = "availability";
                break;

            case "MARKET_EVENT":
                newDoc = {
                    id, type: "MarketEvent",
                    market: data.market || "Unknown Market",
                    state: data.state || "Lagos",
                    event_type: data.event_type || "GENERAL",
                    title: data.title || "Market Update",
                    description: data.description || "",
                    severity: data.severity || "INFO",
                    start_date: timestamp, confidence: data.confidence || 0.85,
                    freshness_hours: 0
                };
                targetStore = this.marketEvents;
                targetFolder = "market_events";
                break;

            case "COUNTERFEIT_ALERT":
                newDoc = {
                    id, type: "CounterfeitAlert",
                    product: data.product || "Unknown",
                    brand: data.brand || "Unknown",
                    market: data.market || "Unknown",
                    state: data.state || "Lagos",
                    risk_level: data.risk_level || "MEDIUM",
                    description: data.description || "",
                    observed_date: timestamp, confidence: data.confidence || 0.80,
                    freshness_hours: 0, agent_id: data.agent_id || "anonymous"
                };
                targetStore = this.counterfeitAlerts;
                targetFolder = "counterfeit_alerts";
                break;

            case "VENDOR_REVIEW":
                newDoc = {
                    id, type: "VendorReview",
                    vendor_name: data.vendor_name || "Unknown Vendor",
                    market: data.market || "Unknown",
                    state: data.state || "Lagos",
                    products_sold: data.products_sold || [],
                    rating: data.rating || 3.0,
                    reliability: data.reliability || "MEDIUM",
                    observed_date: timestamp, confidence: data.confidence || 0.80,
                    freshness_hours: 0, notes: data.notes || ""
                };
                targetStore = this.vendorReviews;
                targetFolder = "vendor_reviews";
                break;

            default: // PRICE (backward compatible)
                newDoc = {
                    id, type: "PriceObservation",
                    product: data.product || "Unknown Product",
                    brand: data.brand || "Generic",
                    market: data.market || "General Market",
                    state: data.state || "Lagos",
                    observed_price: data.price_ngn || data.observed_price || null,
                    currency: "NGN",
                    quantity: data.unit || "unit",
                    observed_date: timestamp, confidence: data.confidence || 0.90,
                    sources_count: 1, freshness_hours: 0
                };
                targetStore = this.priceObservations;
                targetFolder = "price_observations";
                break;
        }

        targetStore.unshift(newDoc);
        this._persistToDisk(targetFolder, newDoc);
        return newDoc;
    }

    /**
     * Save a document to the appropriate disk folder.
     */
    _persistToDisk(folder, doc) {
        try {
            const dir = path.join(GRAPH_BASE, folder);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const filePath = path.join(dir, `${doc.id}.json`);
            fs.writeFileSync(filePath, JSON.stringify(doc, null, 2), "utf-8");
        } catch (err) {
            console.error(`[OjaGraph] Failed to persist ${folder}/${doc.id}:`, err.message);
        }
    }
}

// Singleton export — single shared Commerce Graph instance
export const ojaGraph = new CommerceGraphService();
