import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'rewards-data.json');

// Default initial database state if no persisted file exists
const DEFAULT_DATA = {
    userBalances: {
        "usr_demo": {
            userId: "usr_demo",
            name: "MamaPrice User",
            availableSpins: 3,
            todayProgress: 60, // percentage
            dailyStreak: 4,
            earnedSources: [
                { source: "DAILY_ACTIVITY", label: "Daily activity streak", spins: 1, date: new Date().toISOString() },
                { source: "VERIFIED_PRICE_REPORT", label: "Verified Bodija Rice Report", spins: 1, date: new Date().toISOString() },
                { source: "MISSION_COMPLETED", label: "Gusau Central Market Gap Mission", spins: 1, date: new Date().toISOString() }
            ]
        },
        "usr_agent_001": {
            userId: "usr_agent_001",
            name: "Chinedu Okafor",
            availableSpins: 5,
            todayProgress: 80,
            dailyStreak: 7,
            earnedSources: [
                { source: "VERIFIED_PRICE_REPORT", label: "Mile 12 Pepper observation", spins: 2, date: new Date().toISOString() },
                { source: "AGENT_MILESTONE", label: "Reached 300 verified reports", spins: 3, date: new Date().toISOString() }
            ]
        }
    },
    rewardsCatalog: [
        {
            id: "rew_food_1000",
            type: "FOOD_VOUCHER",
            title: "₦1,000 Food Voucher",
            description: "Valid for ready meals and fresh produce",
            value: 1000,
            currency: "NGN",
            probability: 15, // weight out of 100
            active: true,
            inventory: 50,
            dailyLimit: 20,
            totalLimit: 100,
            partnerId: "prt_mamas_kitchen",
            partnerName: "Mama's Kitchen",
            campaignId: "cmp_friday_food_rush",
            redemptionType: "QR_CODE",
            expiryDays: 30,
            locationTargeting: { country: "Nigeria", state: "Oyo", city: "Ibadan", lga: "Ibadan North", market: "Bodija" }
        },
        {
            id: "rew_airtime_500",
            type: "AIRTIME",
            title: "₦500 Airtime Voucher",
            description: "Direct recharge code for MTN, Airtel, Glo or 9mobile",
            value: 500,
            currency: "NGN",
            probability: 20,
            active: true,
            inventory: 100,
            dailyLimit: 40,
            totalLimit: 200,
            partnerId: "prt_mamaprice_telecom",
            partnerName: "MamaPrice Connect",
            campaignId: "cmp_airtime_boost",
            redemptionType: "PIN_CODE",
            expiryDays: 60,
            locationTargeting: { country: "Nigeria" }
        },
        {
            id: "rew_meal_free",
            type: "FOOD_VOUCHER",
            title: "Free Jollof Meal",
            description: "Complimentary special rice bowl from Chicken Republic",
            value: 2500,
            currency: "NGN",
            probability: 8,
            active: true,
            inventory: 25,
            dailyLimit: 10,
            totalLimit: 50,
            partnerId: "prt_chicken_rep",
            partnerName: "Chicken Republic",
            campaignId: "cmp_jollof_fiesta",
            redemptionType: "QR_CODE",
            expiryDays: 14,
            locationTargeting: { country: "Nigeria", state: "Lagos", city: "Lagos", market: "Ikeja" }
        },
        {
            id: "rew_points_100",
            type: "POINTS",
            title: "+100 MamaPrice Points",
            description: "Added to your MamaPrice Points balance",
            value: 100,
            currency: "PTS",
            probability: 25,
            active: true,
            inventory: 999999,
            dailyLimit: 99999,
            totalLimit: 999999,
            partnerId: "prt_mamaprice_core",
            partnerName: "MamaPrice Rewards",
            campaignId: "cmp_points_reward",
            redemptionType: "AUTO_CREDIT",
            expiryDays: 365,
            locationTargeting: {}
        },
        {
            id: "rew_extra_spin",
            type: "EXTRA_SPIN",
            title: "+1 Extra Spin",
            description: "Instant bonus spin added to your balance!",
            value: 1,
            currency: "SPIN",
            probability: 12,
            active: true,
            inventory: 999999,
            dailyLimit: 99999,
            totalLimit: 999999,
            partnerId: "prt_mamaprice_core",
            partnerName: "MamaPrice Rewards",
            campaignId: "cmp_extra_spin",
            redemptionType: "AUTO_CREDIT",
            expiryDays: 365,
            locationTargeting: {}
        },
        {
            id: "rew_credit_500",
            type: "MAMAPRICE_CREDIT",
            title: "₦500 MamaPrice Credit",
            description: "Usable for API intelligence queries and featured listings",
            value: 500,
            currency: "NGN",
            probability: 10,
            active: true,
            inventory: 200,
            dailyLimit: 50,
            totalLimit: 500,
            partnerId: "prt_mamaprice_core",
            partnerName: "MamaPrice Platform",
            campaignId: "cmp_platform_credit",
            redemptionType: "AUTO_CREDIT",
            expiryDays: 90,
            locationTargeting: {}
        },
        {
            id: "rew_discount_20",
            type: "DISCOUNT",
            title: "20% Off Groceries",
            description: "Discount voucher for Kilimanjaro & Supermarket partners",
            value: 20,
            currency: "PERCENT",
            probability: 7,
            active: true,
            inventory: 40,
            dailyLimit: 15,
            totalLimit: 100,
            partnerId: "prt_kilimanjaro",
            partnerName: "Kilimanjaro Foods",
            campaignId: "cmp_grocery_save",
            redemptionType: "CODE",
            expiryDays: 30,
            locationTargeting: { country: "Nigeria", state: "Rivers", city: "Port Harcourt" }
        },
        {
            id: "rew_try_again",
            type: "TRY_AGAIN",
            title: "Try Again Tomorrow",
            description: "No prize this time, but complete a task to earn another spin!",
            value: 0,
            currency: "NONE",
            probability: 3,
            active: true,
            inventory: 999999,
            dailyLimit: 99999,
            totalLimit: 999999,
            partnerId: "prt_mamaprice_core",
            partnerName: "MamaPrice Rewards",
            campaignId: "cmp_try_again",
            redemptionType: "NONE",
            expiryDays: 0,
            locationTargeting: {}
        }
    ],
    partnerCampaigns: [
        {
            id: "cmp_friday_food_rush",
            partnerId: "prt_mamas_kitchen",
            partnerName: "Mama's Kitchen",
            campaignTitle: "Friday Food Rush",
            budgetNgn: 100000,
            allocatedVouchers: 100,
            claimedVouchers: 14,
            redeemedVouchers: 8,
            startDate: "2026-08-01T00:00:00Z",
            endDate: "2026-08-31T23:59:59Z",
            locationTargeting: { country: "Nigeria", state: "Oyo", city: "Ibadan", lga: "Ibadan North", market: "Bodija" }
        },
        {
            id: "cmp_jollof_fiesta",
            partnerId: "prt_chicken_rep",
            partnerName: "Chicken Republic",
            campaignTitle: "Lagos Jollof Fiesta",
            budgetNgn: 125000,
            allocatedVouchers: 50,
            claimedVouchers: 9,
            redeemedVouchers: 4,
            startDate: "2026-08-01T00:00:00Z",
            endDate: "2026-09-15T23:59:59Z",
            locationTargeting: { country: "Nigeria", state: "Lagos", city: "Lagos", market: "Ikeja" }
        }
    ],
    rewardLedger: [
        {
            id: "tx_001",
            userId: "usr_demo",
            rewardId: "rew_food_1000",
            campaignId: "cmp_friday_food_rush",
            partnerId: "prt_mamas_kitchen",
            partnerName: "Mama's Kitchen",
            type: "FOOD_VOUCHER",
            title: "₦1,000 Food Voucher",
            value: 1000,
            currency: "NGN",
            status: "AVAILABLE",
            source: "SPIN_WHEEL",
            spinId: "spn_881923",
            voucherCode: "MAMA-IBD-82K7P",
            qrData: "MAMAPRICE:VOUCHER:MAMA-IBD-82K7P",
            location: "Bodija Market, Ibadan North, Oyo State",
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            expiresAt: new Date(Date.now() + 3600000 * 24 * 25).toISOString()
        },
        {
            id: "tx_002",
            userId: "usr_demo",
            rewardId: "rew_airtime_500",
            campaignId: "cmp_airtime_boost",
            partnerId: "prt_mamaprice_telecom",
            partnerName: "MamaPrice Connect",
            type: "AIRTIME",
            title: "₦500 Airtime Voucher",
            value: 500,
            currency: "NGN",
            status: "REDEEMED",
            source: "SPIN_WHEEL",
            spinId: "spn_881912",
            voucherCode: "MTN-8849-2041-9984",
            qrData: "MAMAPRICE:AIRTIME:MTN-8849-2041-9984",
            location: "Nationwide",
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            redeemedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
            expiresAt: new Date(Date.now() + 3600000 * 24 * 59).toISOString()
        }
    ],
    processedSpins: {}, // Idempotency check: spinId -> transaction record
    analytics: {
        totalSpins: 148,
        uniqueUsers: 64,
        rewardsDistributed: 142,
        voucherClaims: 43,
        voucherRedemptions: 29,
        totalRewardValueNgn: 86500,
        partnerImpressions: 1240
    }
};

class RewardsEngine {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const raw = fs.readFileSync(DATA_FILE, 'utf-8');
                return JSON.parse(raw);
            }
        } catch (e) {
            console.error('[RewardsEngine] Error loading rewards-data.json, using default:', e.message);
        }
        this.saveData(DEFAULT_DATA);
        return DEFAULT_DATA;
    }

    saveData(data = this.data) {
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
        } catch (e) {
            console.error('[RewardsEngine] Error saving rewards-data.json:', e.message);
        }
    }

    // Resolve or initialize user profile balance
    getUserBalance(userId) {
        if (!this.data.userBalances[userId]) {
            this.data.userBalances[userId] = {
                userId,
                name: userId.startsWith('usr_agent') ? 'MamaPrice Agent' : 'MamaPrice Consumer',
                availableSpins: 3,
                todayProgress: 50,
                dailyStreak: 1,
                earnedSources: [
                    { source: "DAILY_LOGIN", label: "Welcome bonus spin", spins: 3, date: new Date().toISOString() }
                ]
            };
            this.saveData();
        }
        return this.data.userBalances[userId];
    }

    // Award spins to user based on activity trigger
    grantSpin(userId, source, label, spinCount = 1) {
        const user = this.getUserBalance(userId);
        user.availableSpins += spinCount;
        user.todayProgress = Math.min(100, user.todayProgress + 20);
        user.earnedSources.unshift({
            source,
            label: label || `Earned from ${source.replace(/_/g, ' ').toLowerCase()}`,
            spins: spinCount,
            date: new Date().toISOString()
        });
        if (user.earnedSources.length > 30) user.earnedSources.pop();
        this.saveData();
        return user;
    }

    // Server-Authoritative Spin Execution (Atomic & Thread-Safe Logic)
    processSpin(userId, spinSource = "daily_activity", idempotencyKey = null, userLocation = null) {
        const key = idempotencyKey || `spin_${userId}_${Date.now()}`;

        // Idempotency check: return cached result if duplicate request
        if (this.data.processedSpins[key]) {
            console.log(`[RewardsEngine] Idempotency match for key ${key}`);
            return this.data.processedSpins[key];
        }

        const user = this.getUserBalance(userId);

        if (user.availableSpins <= 0) {
            throw new Error("INSUFFICIENT_SPINS: You have 0 available spins. Complete a task to earn more.");
        }

        // 1. Lock and decrement spin
        user.availableSpins -= 1;
        this.data.analytics.totalSpins += 1;

        // 2. Filter active rewards & check location eligibility + inventory
        const eligibleRewards = this.data.rewardsCatalog.filter(r => {
            if (!r.active || r.inventory <= 0) return false;
            // Check location matching if specified
            if (r.locationTargeting && Object.keys(r.locationTargeting).length > 0 && userLocation) {
                if (r.locationTargeting.state && userLocation.state && r.locationTargeting.state.toLowerCase() !== userLocation.state.toLowerCase()) {
                    return false;
                }
            }
            return true;
        });

        const pool = eligibleRewards.length > 0 ? eligibleRewards : this.data.rewardsCatalog.filter(r => r.type === "TRY_AGAIN" || r.type === "POINTS");

        // 3. Server-side probability weighted selection
        let totalWeight = pool.reduce((acc, r) => acc + (r.probability || 10), 0);
        let randomNum = Math.random() * totalWeight;
        let selectedReward = pool[0];

        for (let i = 0; i < pool.length; i++) {
            if (randomNum < pool[i].probability) {
                selectedReward = pool[i];
                break;
            }
            randomNum -= pool[i].probability;
        }

        // 4. Decrement inventory (Server-side inventory limit enforcement)
        selectedReward.inventory = Math.max(0, selectedReward.inventory - 1);

        // 5. Generate Voucher or auto-credit payload
        const voucherCode = this.generateVoucherCode(selectedReward);
        const qrData = `MAMAPRICE:${selectedReward.type}:${voucherCode}`;
        const transactionId = `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // Calculate location string
        const locParts = selectedReward.locationTargeting || {};
        const locationStr = [locParts.market, locParts.city || locParts.lga, locParts.state].filter(Boolean).join(', ') || "Nationwide";

        const rewardTx = {
            id: transactionId,
            userId,
            rewardId: selectedReward.id,
            campaignId: selectedReward.campaignId,
            partnerId: selectedReward.partnerId,
            partnerName: selectedReward.partnerName,
            type: selectedReward.type,
            title: selectedReward.title,
            description: selectedReward.description,
            value: selectedReward.value,
            currency: selectedReward.currency,
            status: selectedReward.type === "TRY_AGAIN" ? "CANCELLED" : (selectedReward.redemptionType === "AUTO_CREDIT" ? "REDEEMED" : "AVAILABLE"),
            source: spinSource,
            spinId: key,
            voucherCode,
            qrData,
            location: locationStr,
            createdAt: new Date().toISOString(),
            redeemedAt: selectedReward.redemptionType === "AUTO_CREDIT" ? new Date().toISOString() : null,
            expiresAt: selectedReward.expiryDays ? new Date(Date.now() + 86400000 * selectedReward.expiryDays).toISOString() : null
        };

        // 6. Record transaction in ledger
        this.data.rewardLedger.unshift(rewardTx);
        this.data.analytics.rewardsDistributed += 1;
        if (selectedReward.currency === "NGN") {
            this.data.analytics.totalRewardValueNgn += selectedReward.value;
        }

        // If extra spin won, add it back!
        if (selectedReward.type === "EXTRA_SPIN") {
            user.availableSpins += 1;
        }

        const responsePayload = {
            success: true,
            transactionId: rewardTx.id,
            reward: {
                id: selectedReward.id,
                type: selectedReward.type,
                title: selectedReward.title,
                description: selectedReward.description,
                value: selectedReward.value,
                currency: selectedReward.currency,
                partnerName: selectedReward.partnerName,
                voucherCode,
                qrData,
                location: locationStr,
                expiresAt: rewardTx.expiresAt,
                segmentIndex: this.data.rewardsCatalog.findIndex(r => r.id === selectedReward.id)
            },
            remainingSpins: user.availableSpins,
            todayProgress: user.todayProgress
        };

        // Save idempotency cache
        this.data.processedSpins[key] = responsePayload;
        this.saveData();

        console.log(`[RewardsEngine] Spin executed for user ${userId}: won "${selectedReward.title}" (${user.availableSpins} spins left)`);
        return responsePayload;
    }

    generateVoucherCode(reward) {
        if (reward.type === "TRY_AGAIN") return "N/A";
        const prefix = reward.partnerName ? reward.partnerName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() : "MAMA";
        const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `${prefix}-${rand}`;
    }

    // Redeem a voucher
    redeemVoucher(userId, transactionId) {
        const tx = this.data.rewardLedger.find(t => t.id === transactionId && t.userId === userId);
        if (!tx) {
            throw new Error("VOUCHER_NOT_FOUND: Invalid voucher ID or unauthorized user.");
        }
        if (tx.status === "REDEEMED") {
            throw new Error("ALREADY_REDEEMED: This voucher has already been redeemed.");
        }
        if (tx.status === "EXPIRED" || (tx.expiresAt && new Date(tx.expiresAt) < new Date())) {
            tx.status = "EXPIRED";
            this.saveData();
            throw new Error("VOUCHER_EXPIRED: This voucher has expired.");
        }

        tx.status = "REDEEMED";
        tx.redeemedAt = new Date().toISOString();
        this.data.analytics.voucherRedemptions += 1;

        // Also update campaign statistics
        if (tx.campaignId) {
            const cmp = this.data.partnerCampaigns.find(c => c.id === tx.campaignId);
            if (cmp) cmp.redeemedVouchers += 1;
        }

        this.saveData();
        return { success: true, transaction: tx };
    }

    // Get User Summary
    getUserSummary(userId) {
        const user = this.getUserBalance(userId);
        const userRewards = this.data.rewardLedger.filter(t => t.userId === userId);
        const activeVouchers = userRewards.filter(t => t.status === "AVAILABLE");

        return {
            userId: user.userId,
            name: user.name,
            availableSpins: user.availableSpins,
            todayProgress: user.todayProgress,
            dailyStreak: user.dailyStreak,
            earnedSources: user.earnedSources,
            activeVouchersCount: activeVouchers.length,
            rewardWallet: userRewards,
            catalogSegments: this.data.rewardsCatalog.map((r, index) => ({
                index,
                id: r.id,
                title: r.title,
                type: r.type,
                partnerName: r.partnerName,
                icon: this.getRewardTypeIcon(r.type)
            }))
        };
    }

    getRewardTypeIcon(type) {
        switch(type) {
            case "FOOD_VOUCHER": return "🍔";
            case "AIRTIME": return "📱";
            case "DATA": return "📶";
            case "POINTS": return "⭐";
            case "MAMAPRICE_CREDIT": return "💚";
            case "DISCOUNT": return "🏷️";
            case "BONUS_EARNINGS": return "💰";
            case "EXTRA_SPIN": return "🎟️";
            case "MULTIPLIER": return "⚡";
    // Redeem Promo or Partner Code
    applyPromoCode(userId, rawCode) {
        if (!rawCode) throw new Error("Promo code is required.");
        const code = rawCode.trim().toUpperCase();
        const user = this.getUserBalance(userId);

        if (!this.data.promoCodes) {
            this.data.promoCodes = {
                "MAMAPLUS": { code: "MAMAPLUS", type: "SPINS", spins: 3, title: "+3 Extra Wheel Spins", active: true },
                "BODIJA500": {
                    code: "BODIJA500",
                    type: "VOUCHER",
                    voucher: {
                        id: "rew_bodija_500",
                        type: "FOOD_VOUCHER",
                        title: "₦500 Bodija Market Voucher",
                        description: "Valid for fresh produce and food items at Bodija Market",
                        value: 500,
                        currency: "NGN",
                        partnerName: "Bodija Traders Guild",
                        location: "Bodija Market, Ibadan"
                    },
                    active: true
                },
                "WELCOME5K": { code: "WELCOME5K", type: "CASHBACK", amount: 5000, title: "₦5,000 Welcome Cashback", active: true }
            };
        }

        const promo = this.data.promoCodes[code];

        if (!promo || !promo.active) {
            throw new Error("Invalid or expired promo code.");
        }

        const redemptionKey = `${userId}_${code}`;
        if (!this.data.userPromoRedemptions) this.data.userPromoRedemptions = {};
        if (this.data.userPromoRedemptions[redemptionKey]) {
            throw new Error("You have already redeemed this promo code!");
        }

        let message = "";
        if (promo.type === "SPINS") {
            user.availableSpins += promo.spins;
            user.earnedSources.unshift({
                source: "PROMO_CODE",
                label: `Redeemed code ${code} (+${promo.spins} spins)`,
                spins: promo.spins,
                date: new Date().toISOString()
            });
            message = `🎉 Code Applied! +${promo.spins} Extra Wheel Spins Credited!`;
        } else if (promo.type === "CASHBACK") {
            user.earnedSources.unshift({
                source: "PROMO_CODE",
                label: `Redeemed code ${code} (₦${promo.amount.toLocaleString()} welcome cashback)`,
                spins: 1,
                date: new Date().toISOString()
            });
            user.availableSpins += 1;
            message = `🎉 Code Applied! ₦${promo.amount.toLocaleString()} Welcome Cashback + 1 Spin Credited!`;
        } else if (promo.type === "VOUCHER") {
            const voucherTx = {
                id: `vch_${Date.now()}`,
                userId,
                rewardId: promo.voucher.id,
                title: promo.voucher.title,
                description: promo.voucher.description,
                type: promo.voucher.type,
                value: promo.voucher.value,
                currency: promo.voucher.currency,
                partnerName: promo.voucher.partnerName,
                status: "AVAILABLE",
                source: "PROMO_CODE",
                voucherCode: `PRM-${code}-${Math.floor(1000 + Math.random() * 9000)}`,
                qrData: `MAMAPRICE:VOUCHER:${code}`,
                location: promo.voucher.location,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 3600000 * 24 * 30).toISOString()
            };
            this.data.rewardLedger.unshift(voucherTx);
            user.availableSpins += 1;
            message = `🎉 Code Applied! ${promo.voucher.title} added to your coupons!`;
        }

        this.data.userPromoRedemptions[redemptionKey] = new Date().toISOString();
        this.saveData();

        return {
            success: true,
            message,
            code,
            type: promo.type,
            totalSpins: user.availableSpins,
            summary: this.getUserSummary(userId)
        };
    }

    // Create Partner Campaign (Admin)
    createCampaign(campaignData) {
        const newCmp = {
            id: `cmp_${Date.now()}`,
            partnerId: campaignData.partnerId || `prt_${Date.now()}`,
            partnerName: campaignData.partnerName || "Partner Brand",
            campaignTitle: campaignData.campaignTitle || "MamaPrice Campaign",
            budgetNgn: Number(campaignData.budgetNgn || 50000),
            allocatedVouchers: Number(campaignData.allocatedVouchers || 50),
            claimedVouchers: 0,
            redeemedVouchers: 0,
            startDate: campaignData.startDate || new Date().toISOString(),
            endDate: campaignData.endDate || new Date(Date.now() + 86400000 * 30).toISOString(),
            locationTargeting: campaignData.locationTargeting || {}
        };
        this.data.partnerCampaigns.unshift(newCmp);

        // Also add corresponding reward to catalog
        const newReward = {
            id: `rew_${newCmp.id}`,
            type: campaignData.rewardType || "FOOD_VOUCHER",
            title: campaignData.rewardTitle || `${campaignData.partnerName} Voucher`,
            description: campaignData.rewardDescription || "Sponsored reward voucher",
            value: Number(campaignData.rewardValue || 1000),
            currency: "NGN",
            probability: Number(campaignData.probability || 10),
            active: true,
            inventory: newCmp.allocatedVouchers,
            dailyLimit: Math.ceil(newCmp.allocatedVouchers / 10),
            totalLimit: newCmp.allocatedVouchers,
            partnerId: newCmp.partnerId,
            partnerName: newCmp.partnerName,
            campaignId: newCmp.id,
            redemptionType: "QR_CODE",
            expiryDays: 30,
            locationTargeting: newCmp.locationTargeting
        };
        this.data.rewardsCatalog.push(newReward);
        this.saveData();

        return { campaign: newCmp, reward: newReward };
    }

    // Analytics Summary
    getAnalytics() {
        const totalRedeemedValue = this.data.rewardLedger
            .filter(t => t.status === "REDEEMED" && t.currency === "NGN")
            .reduce((acc, t) => acc + (t.value || 0), 0);

        return {
            ...this.data.analytics,
            totalRedeemedValueNgn: totalRedeemedValue,
            redemptionRate: this.data.analytics.rewardsDistributed > 0 ?
                Math.round((this.data.analytics.voucherRedemptions / this.data.analytics.rewardsDistributed) * 100) : 0,
            campaignsCount: this.data.partnerCampaigns.length,
            activeCampaigns: this.data.partnerCampaigns
        };
    }
}

export const rewardsEngine = new RewardsEngine();
