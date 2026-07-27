document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatHistory = document.getElementById('chat-history');
    const welcomeScreen = document.getElementById('welcome-screen');
    const newChatBtn = document.getElementById('new-chat-btn');
    const sidebar = document.getElementById('sidebar');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const mobileCloseBtn = document.getElementById('mobile-close-btn');

    // Navigation & Views
    const navHome = document.getElementById('nav-home');
    const navExplore = document.getElementById('nav-explore');
    const navMap = document.getElementById('nav-map');
    const navMarkets = document.getElementById('nav-markets');
    const navAgent = document.getElementById('nav-agent');
    const navHistory = document.getElementById('nav-history');
    const brandLogoBtn = document.getElementById('brand-logo-btn');

    const navProfile = document.getElementById('nav-profile');

    const pageHome = document.getElementById('page-home');
    const pageExplore = document.getElementById('page-explore');
    const pageMap = document.getElementById('page-map');
    const pageMarkets = document.getElementById('page-markets');
    const pageAgent = document.getElementById('page-agent');
    const pageHistory = document.getElementById('page-history');
    const pageProfile = document.getElementById('page-profile');

    // Dropdown & Modals
    const modelPickerBtn = document.getElementById('model-picker-btn');
    const modelDropdown = document.getElementById('model-dropdown');
    const selectedModelText = document.getElementById('selected-model-text');

    const userProfileBtn = document.getElementById('user-profile-btn');
    const profileModal = document.getElementById('profile-modal');
    const closeProfileModal = document.getElementById('close-profile-modal');

    const planBadgeBtn = document.getElementById('plan-badge-btn');
    const planModal = document.getElementById('plan-modal');
    const closePlanModal = document.getElementById('close-plan-modal');

    // Search & History
    const searchInput = document.getElementById('search-input');
    const historyContainer = id => document.getElementById(id);

    // Audio & Tags
    const micBtn = document.getElementById('mic-btn');
    const tagBtns = document.querySelectorAll('.tag-btn');

    let API_URL = 'http://localhost:3001';
    let currentSessionId = `session_${Date.now()}`;
    let agentEarnings = 148500;

    function updateAgentBadge(amount) {
        if (amount) agentEarnings += amount;
        const badge = document.getElementById('nav-agent-badge');
        if (badge) {
            const formatted = agentEarnings >= 1000 ? `₦${(agentEarnings / 1000).toFixed(1)}k` : `₦${agentEarnings.toLocaleString()}`;
            badge.textContent = formatted;
        }
    }
    updateAgentBadge();

    // Dynamic Time-of-day Greeting
    const heroGreetingTitle = document.getElementById('hero-greeting-title');
    if (heroGreetingTitle) {
        const hour = new Date().getHours();
        let greeting = "Good Morning";
        if (hour >= 12 && hour < 17) {
            greeting = "Good Afternoon";
        } else if (hour >= 17 || hour < 5) {
            greeting = "Good Evening";
        }
        heroGreetingTitle.textContent = greeting;
    }

    // Interactive Pearl Orb Engine States
    const interactiveOrb = document.getElementById('interactive-orb');
    const orbStateTag = document.getElementById('orb-state-tag');

    const orbStates = [
        { label: "OjaGraph RAG Active", color: "linear-gradient(135deg, #a5b4fc, #818cf8)", badgeBg: "#e0e7ff", badgeText: "#4338ca", badgeBorder: "#c7d2fe" },
        { label: "Agent Verification Mode", color: "linear-gradient(135deg, #34d399, #10b981)", badgeBg: "#d1fae5", badgeText: "#065f46", badgeBorder: "#a7f3d0" },
        { label: "OjaLM Local CPU Engine", color: "linear-gradient(135deg, #f472b6, #ec4899)", badgeBg: "#fce7f3", badgeText: "#9d174d", badgeBorder: "#fbcfe8" },
        { label: "Deep Research Engine", color: "linear-gradient(135deg, #60a5fa, #3b82f6)", badgeBg: "#dbeafe", badgeText: "#1e40af", badgeBorder: "#bfdbfe" }
    ];
    let currentOrbIndex = 0;

    function cycleOrbState() {
        currentOrbIndex = (currentOrbIndex + 1) % orbStates.length;
        const st = orbStates[currentOrbIndex];
        if (interactiveOrb) {
            interactiveOrb.style.background = st.color;
        }
        if (orbStateTag) {
            orbStateTag.textContent = st.label;
            orbStateTag.style.background = st.badgeBg;
            orbStateTag.style.color = st.badgeText;
            orbStateTag.style.borderColor = st.badgeBorder;
        }
    }

    if (interactiveOrb) interactiveOrb.addEventListener('click', cycleOrbState);
    if (orbStateTag) orbStateTag.addEventListener('click', cycleOrbState);

    // Sidebar Docking Handler
    const sidebarDockBtn = document.getElementById('sidebar-dock-btn');
    const topDockBtn = document.getElementById('top-dock-btn');

    // Only auto-open sidebar on desktop — never force-open on mobile
    if (sidebar && window.innerWidth > 768) sidebar.classList.add('open');

    function toggleSidebarDock() {
        if (!sidebar) return;
        sidebar.classList.toggle('docked');
        document.body.classList.toggle('sidebar-docked');
    }

    if (sidebarDockBtn) sidebarDockBtn.addEventListener('click', toggleSidebarDock);
    if (topDockBtn) topDockBtn.addEventListener('click', toggleSidebarDock);

    // Auto-resize textarea
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            if(this.value === '') this.style.height = 'auto';
        });
    }

    // ----------------------------------------------------
    // 1. Navigation & View Switching
    // ----------------------------------------------------
    function switchView(targetNav, targetPage) {
        if (!targetPage) return;
        document.querySelectorAll('.nav-item, .m-nav-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));

        if (targetNav) targetNav.classList.add('active');
        
        // Sync highlighting across both sidebar and mobile bottom nav
        const pageKey = targetPage.id.replace('page-', '');
        const desktopNav = document.getElementById(`nav-${pageKey}`);
        const mobileNav = document.getElementById(`m-nav-${pageKey}`);
        if (desktopNav) desktopNav.classList.add('active');
        if (mobileNav) mobileNav.classList.add('active');

        targetPage.classList.add('active');
        document.body.classList.toggle('map-page-active', targetPage.id === 'page-map');
        document.body.classList.toggle('not-home-page', targetPage.id !== 'page-home');

        if (targetPage.id === 'page-map' && typeof window.refreshMamaMap === 'function') {
            setTimeout(() => window.refreshMamaMap(), 150);
        }

        // Update URL hash without scroll jump
        const hashKey = (pageKey === 'agent') ? 'agents' : (pageKey === 'library' ? 'watchlist' : pageKey);
        if (window.location.hash !== `#${hashKey}`) {
            history.replaceState(null, '', `#${hashKey}`);
        }
    }

    function handleHashRouting() {
        const hash = window.location.hash.replace('#', '').toLowerCase();
        if (!hash || hash === 'home') {
            document.body.classList.remove('not-home-page');
            return;
        }
        let pageKey = hash;
        if (hash === 'agents') pageKey = 'agent';
        if (hash === 'watchlist') pageKey = 'library';
        
        const targetPage = document.getElementById(`page-${pageKey}`);
        const desktopNav = document.getElementById(`nav-${pageKey}`);
        if (targetPage) {
            switchView(desktopNav, targetPage);
        }
    }

    window.addEventListener('hashchange', handleHashRouting);
    handleHashRouting();

    const navPrices = document.getElementById('nav-prices');
    const navLibrary = document.getElementById('nav-library');
    const pagePrices = document.getElementById('page-prices');
    const pageLibrary = document.getElementById('page-library');

    // Mobile Bottom Nav Elements
    const mNavHome = document.getElementById('m-nav-home');
    const mNavPrices = document.getElementById('m-nav-prices');
    const mNavMarkets = document.getElementById('m-nav-markets');
    const mNavMap = document.getElementById('m-nav-map');
    const mNavAgent = document.getElementById('m-nav-agent');

    if (navHome) navHome.addEventListener('click', (e) => { e.preventDefault(); switchView(navHome, pageHome); });
    if (navPrices) navPrices.addEventListener('click', (e) => { e.preventDefault(); switchView(navPrices, pagePrices); });
    if (navExplore) navExplore.addEventListener('click', (e) => { e.preventDefault(); switchView(navExplore, pageExplore); });
    if (navMap) navMap.addEventListener('click', (e) => { e.preventDefault(); switchView(navMap, pageMap); });
    if (navMarkets) navMarkets.addEventListener('click', (e) => { e.preventDefault(); switchView(navMarkets, pageMarkets); });
    if (navAgent) navAgent.addEventListener('click', (e) => { e.preventDefault(); switchView(navAgent, pageAgent); });
    if (navLibrary) navLibrary.addEventListener('click', (e) => { e.preventDefault(); switchView(navLibrary, pageLibrary); });
    if (navHistory) navHistory.addEventListener('click', (e) => { 
        e.preventDefault(); 
        populateFullHistory();
        switchView(navHistory, pageHistory); 
    });
    if (navProfile) navProfile.addEventListener('click', (e) => { e.preventDefault(); switchView(navProfile, pageProfile); });
    if (userProfileBtn) userProfileBtn.addEventListener('click', () => switchView(navProfile, pageProfile));
    if (brandLogoBtn) brandLogoBtn.addEventListener('click', () => switchView(navHome, pageHome));

    // Global Navigation Click Delegator (Prevents '#' hashtag jump & guarantees view switching)
    document.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item, .m-nav-item');
        if (navItem && navItem.id) {
            e.preventDefault();
            const pageKey = navItem.id.replace(/^(nav-|m-nav-)/, '');
            const targetPage = document.getElementById(`page-${pageKey}`);
            if (targetPage) {
                if (pageKey === 'history' && typeof populateFullHistory === 'function') {
                    populateFullHistory();
                }
                switchView(navItem, targetPage);
            }
        }
    });

    // ────────────────────────────────────────────────────────────────────────
    // REFERRAL ENGINE — Persistent, Functional, Cross-User
    // ────────────────────────────────────────────────────────────────────────
    const REFERRAL_BONUS_THRESHOLD = 5;   // reports before bonus fires
    const REFERRAL_BONUS_AMOUNT    = 200; // MarketPoints per referral unlock

    function generateRefCode(name) {
        const prefix = (name || 'USER').replace(/\s+/g, '').toUpperCase().slice(0, 5);
        const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}${suffix}`;
    }

    function getMyRefCode() {
        const userJson = localStorage.getItem('mamaprice_auth_user');
        if (!userJson) return null;
        const user = JSON.parse(userJson);
        if (!user.refCode) {
            user.refCode = generateRefCode(user.name);
            localStorage.setItem('mamaprice_auth_user', JSON.stringify(user));
        }
        return user.refCode;
    }

    function getReferredAgents() {
        try { return JSON.parse(localStorage.getItem('mama_referred_agents') || '[]'); }
        catch { return []; }
    }

    function saveReferredAgents(list) {
        localStorage.setItem('mama_referred_agents', JSON.stringify(list));
    }

    // Called when a new user signs in and has a ?ref= code
    function registerReferral(newUserName, newUserPhone, refCode) {
        // Store on the new user: who referred them
        const userJson = localStorage.getItem('mamaprice_auth_user');
        if (userJson) {
            const user = JSON.parse(userJson);
            if (!user.referredBy) {
                user.referredBy = refCode;
                localStorage.setItem('mamaprice_auth_user', JSON.stringify(user));
            }
        }
        // Store on the referrer's list (keyed by refCode in a shared store)
        const allRef = JSON.parse(localStorage.getItem('mama_all_referrals') || '{}');
        if (!allRef[refCode]) allRef[refCode] = [];
        const already = allRef[refCode].find(r => r.phone === newUserPhone);
        if (!already) {
            allRef[refCode].push({
                name: newUserName,
                phone: newUserPhone,
                reports: 0,
                bonusPaid: false,
                joinedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            });
            localStorage.setItem('mama_all_referrals', JSON.stringify(allRef));

            // Notify the NEW user
            if (typeof window.pushAlertGraphNotification === 'function') {
                window.pushAlertGraphNotification({
                    type: 'inbox',
                    text: `🎉 <strong>Welcome to MamaPrice!</strong><br>You joined via a referral link. Complete your first 5 price reports to earn MarketPoints for both you and your referrer.`,
                    tag: 'Referral Welcome',
                    actionQuery: ''
                });
            }
        }
    }

    // Called after every report — checks if a referred agent has hit the bonus threshold
    function checkReferralMilestone(agentName, agentPhone, reportCount) {
        const allRef = JSON.parse(localStorage.getItem('mama_all_referrals') || '{}');
        for (const refCode in allRef) {
            const list = allRef[refCode];
            const referred = list.find(r => r.phone === agentPhone || r.name === agentName);
            if (referred) {
                referred.reports = reportCount;
                if (reportCount >= REFERRAL_BONUS_THRESHOLD && !referred.bonusPaid) {
                    referred.bonusPaid = true;
                    allRef[refCode] = list;
                    localStorage.setItem('mama_all_referrals', JSON.stringify(allRef));

                    // Notify the REFERRED agent (current user)
                    if (typeof window.pushAlertGraphNotification === 'function') {
                        window.pushAlertGraphNotification({
                            type: 'inbox',
                            text: `🏆 <strong>Referral Milestone Unlocked!</strong><br>You've completed 5 verified reports. Your referrer just earned <strong>200 MarketPoints</strong> — and you've unlocked Agent status on MamaPrice!`,
                            tag: 'Referral Milestone',
                            actionQuery: ''
                        });
                    }

                    // Credit + notify the REFERRER (stored in localStorage under their refCode)
                    const myRefCode = getMyRefCode();
                    if (myRefCode !== refCode) {
                        // We're on the referred agent's session — referrer gets notified next time they open
                        const pendingBonuses = JSON.parse(localStorage.getItem('mama_pending_bonuses') || '{}');
                        if (!pendingBonuses[refCode]) pendingBonuses[refCode] = 0;
                        pendingBonuses[refCode] += REFERRAL_BONUS_AMOUNT;
                        localStorage.setItem('mama_pending_bonuses', JSON.stringify(pendingBonuses));
                    } else {
                        // Referrer is the current user — credit immediately
                        awardReferralBonus(agentName);
                    }
                }
                localStorage.setItem('mama_all_referrals', JSON.stringify(allRef));
                break;
            }
        }
        renderReferralTable();
    }

    // Credit the current user's MarketPoints + fire notification
    function awardReferralBonus(agentName) {
        const userJson = localStorage.getItem('mamaprice_auth_user');
        if (userJson) {
            const user = JSON.parse(userJson);
            user.referralPoints = (user.referralPoints || 600) + REFERRAL_BONUS_AMOUNT;
            user.marketPoints = (user.marketPoints || 3550) + REFERRAL_BONUS_AMOUNT;
            localStorage.setItem('mamaprice_auth_user', JSON.stringify(user));
        }
        if (typeof window.pushAlertGraphNotification === 'function') {
            window.pushAlertGraphNotification({
                type: 'inbox',
                text: `🎁 <strong>Referral Bonus Credited: +200 MarketPoints!</strong><br>${agentName} completed their 5th verified price report. 200 MarketPoints added to your balance.`,
                tag: 'Referral Bonus',
                actionQuery: ''
            });
        }
        updateReferralStats();
    }

    // Check for pending bonuses owed to the current user when they open the app
    function claimPendingBonuses() {
        const myRefCode = getMyRefCode();
        if (!myRefCode) return;
        const pending = JSON.parse(localStorage.getItem('mama_pending_bonuses') || '{}');
        if (pending[myRefCode] && pending[myRefCode] > 0) {
            const amount = pending[myRefCode];
            const userJson = localStorage.getItem('mamaprice_auth_user');
            if (userJson) {
                const user = JSON.parse(userJson);
                user.referralPoints = (user.referralPoints || 600) + amount;
                user.marketPoints = (user.marketPoints || 3550) + amount;
                localStorage.setItem('mamaprice_auth_user', JSON.stringify(user));
            }
            delete pending[myRefCode];
            localStorage.setItem('mama_pending_bonuses', JSON.stringify(pending));
            if (typeof window.pushAlertGraphNotification === 'function') {
                window.pushAlertGraphNotification({
                    type: 'inbox',
                    text: `🎁 <strong>Referral Points Credited: +${amount} MarketPoints</strong><br>Your referred agents completed their milestones while you were away. Points added to your balance.`,
                    tag: 'Referral Bonus',
                    actionQuery: ''
                });
            }
            updateReferralStats();
        }
    }

    function updateReferralStats() {
        const userJson = localStorage.getItem('mamaprice_auth_user');
        const user = userJson ? JSON.parse(userJson) : {};
        if (user.referralPoints === undefined) {
            user.referralPoints = 600;
            localStorage.setItem('mamaprice_auth_user', JSON.stringify(user));
        }
        const totalPoints = user.referralPoints || 600;
        const bonusEl = document.getElementById('prof-ref-total-bonus');
        if (bonusEl) bonusEl.textContent = `${totalPoints.toLocaleString()} pts`;
    }

    function renderReferralTable() {
        const tbody = document.getElementById('prof-ref-tbody');
        if (!tbody) return;
        let myRefCode = getMyRefCode();
        if (!myRefCode) myRefCode = 'AMINA92X';
        const allRef = JSON.parse(localStorage.getItem('mama_all_referrals') || '{}');
        
        if (!allRef[myRefCode] || allRef[myRefCode].length === 0) {
            allRef[myRefCode] = [
                { name: 'Maryam Abubakar', phone: '0803 123 4567', reports: 5, bonusPaid: true, joinedAt: '12 Jul 2026' },
                { name: 'Chinedu Okafor', phone: '0812 345 6789', reports: 5, bonusPaid: true, joinedAt: '15 Jul 2026' },
                { name: 'Aisha Bello', phone: '0706 789 0123', reports: 5, bonusPaid: true, joinedAt: '18 Jul 2026' },
                { name: 'Emeka Nwosu', phone: '0810 222 3344', reports: 3, bonusPaid: false, joinedAt: '22 Jul 2026' },
                { name: 'Grace Adeyemi', phone: '0901 556 7788', reports: 1, bonusPaid: false, joinedAt: '24 Jul 2026' }
            ];
            localStorage.setItem('mama_all_referrals', JSON.stringify(allRef));
        }
        
        const myList = allRef[myRefCode] || [];

        tbody.innerHTML = myList.map(r => {
            const pct = Math.min(r.reports, 5);
            const statusBadge = r.bonusPaid
                ? `<span style="background:#dcfce7;color:#15803d;padding:3px 8px;border-radius:6px;font-size:0.72rem;font-weight:700;">Completed</span>`
                : `<span style="background:#dbeafe;color:#1d4ed8;padding:3px 8px;border-radius:6px;font-size:0.72rem;font-weight:700;">In Progress</span>`;
            const reward = r.bonusPaid
                ? `<strong style="color:#15803d;font-size:0.82rem;">+200 pts</strong>`
                : `<span style="color:#94a3b8;font-size:0.78rem;">Pending (${5 - pct} left)</span>`;
            return `
            <tr>
                <td>
                    <strong style="color:#0f172a;font-size:0.82rem;">${r.name}</strong>
                    <span style="font-size:0.72rem;color:#64748b;display:block;">SC-00${Math.floor(10 + Math.random() * 89)}</span>
                </td>
                <td style="font-size:0.78rem;color:#475569;">${r.joinedAt}</td>
                <td><strong style="color:${r.reports>=5?'#15803d':'#2563eb'};font-size:0.82rem;">${pct} / 5 Reports</strong></td>
                <td>${statusBadge}</td>
                <td>${reward}</td>
            </tr>`;
        }).join('');
    }

    // Update the referral link input with the real user code
    function initReferralLink() {
        const myCode = getMyRefCode();
        if (!myCode) return;
        const refUrl = `https://mamaprice.ng/invite?ref=${myCode}`;
        ['prof-ref-link-input', 'referral-link-input'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = refUrl;
        });
        // Update WhatsApp share link
        document.querySelectorAll('a[href*="mamaprice.ng/invite"]').forEach(a => {
            a.href = `https://wa.me/?text=${encodeURIComponent(`Join me on MamaPrice! Track live market prices, compare regional markets & shop smart: ${refUrl}`)}`;
        });
        updateReferralStats();
        renderReferralTable();
    }

    // Capture ?ref= param from URL on page load
    (function captureReferralParam() {
        const params = new URLSearchParams(window.location.search);
        const refCode = params.get('ref');
        if (refCode) {
            localStorage.setItem('mama_pending_referral_code', refCode);
        }
    })();

    // Agent Report Form Submission
    window.recordAgentReport = function(commodityName = 'Commodity', marketName = 'Mile 12', priceVal = 0) {
        const userJson = localStorage.getItem('mamaprice_auth_user');
        const userName = userJson ? JSON.parse(userJson).name : 'Amina Yusuf';
        const userPhone = userJson ? JSON.parse(userJson).phone : '0801 234 5678';
        
        let agent = scoutsData.find(a => a.name.toLowerCase() === userName.toLowerCase() || a.phone === userPhone);
        
        if (agent) {
            agent.reports += 1;
            agent.earnings += 250;
            agent.trustScore = Math.min(100, agent.trustScore + 1);
            if (marketName && !agent.markets.includes(marketName)) {
                agent.markets.push(marketName);
            }
            // Recalculate Agent Level & Leaderboard Ranking
            if (agent.reports > 400) agent.level = 'Market Captain';
            else if (agent.reports > 200) agent.level = 'Senior Agent';
            else if (agent.reports > 50) agent.level = 'Market Agent';
            else agent.level = 'Agent Explorer';

            // ── Referral milestone check ──
            checkReferralMilestone(userName, userPhone, agent.reports);
        } else {
            agent = {
                id: `AG-${Math.floor(1000 + Math.random() * 9000)}`,
                name: userName,
                phone: userPhone,
                level: 'Agent Explorer',
                markets: [marketName || 'Mile 12'],
                reports: 1,
                trustScore: 85,
                trustLabel: 'Great',
                earnings: 250,
                status: 'Active',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
            };
            scoutsData.unshift(agent);
            checkReferralMilestone(userName, userPhone, 1);
        }
        
        if (typeof window.pushAlertGraphNotification === 'function') {
            window.pushAlertGraphNotification({
                type: 'inbox',
                text: `🎯 <strong>Report Verified (+25 MarketPoints)</strong><br>${commodityName} price report for ${marketName} logged: ₦${parseInt(priceVal || 0).toLocaleString()} (+₦250 credited)`,
                tag: 'Agent Payout',
                actionQuery: ''
            });
        }

        if (typeof updateScoutsDashboard === 'function') {
            updateScoutsDashboard();
        }
    };

    const agentReportForm = document.getElementById('agent-report-form');
    if (agentReportForm) {
        agentReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const commodity = document.getElementById('report-commodity').value;
            const market = document.getElementById('report-market').value;
            const price = document.getElementById('report-price').value;
            if (!price) return;
            
            // Record Agent Report & Award MarketPoints
            window.recordAgentReport(commodity, market, price);

            const queryText = `Report price: ${commodity} ₦${parseInt(price).toLocaleString()} at ${market}`;
            switchView(navHome, pageHome);
            sendSuggestion(queryText);
        });
    }

    // ----------------------------------------------------
    // 2. Mobile Sidebar & Shortcuts
    // ----------------------------------------------------
    if (menuToggleBtn) menuToggleBtn.addEventListener('click', () => sidebar.classList.add('open'));
    if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    // Keyboard shortcut (⌘K / Ctrl+K) for search focus
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) searchInput.focus();
        }
    });

    // ----------------------------------------------------
    // 3. Search History Filter
    // ----------------------------------------------------
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const items = document.querySelectorAll('.history-link');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // History Item Click Handling
    document.querySelectorAll('.history-link').forEach(link => {
        link.addEventListener('click', function() {
            const queryText = this.getAttribute('data-query');
            if (queryText) {
                switchView(navHome, pageHome);
                sendSuggestion(queryText);
            }
        });
    });

    function populateFullHistory() {
        const fullList = document.getElementById('history-full-list');
        if (!fullList) return;
        fullList.innerHTML = `
            <div class="library-item" style="cursor: pointer;" onclick="sendSuggestion('Where can I buy the cheapest 50kg bag of Dangote Cement in Lagos?')">
                <i class="fa-regular fa-message"></i>
                <div class="item-info">
                    <strong>Lagos Cement Price Inquiry</strong>
                    <span>Executed today · Session: ${currentSessionId}</span>
                </div>
                <span class="status-tag">Active</span>
            </div>
            <div class="library-item" style="cursor: pointer;" onclick="sendSuggestion('Golden Penny Flour price at Mile 12 Market')">
                <i class="fa-regular fa-message"></i>
                <div class="item-info">
                    <strong>Flour Prices Mile 12</strong>
                    <span>Executed today · Grounded RAG</span>
                </div>
                <span class="status-tag">Completed</span>
            </div>
        `;
    }

    let selectedModel = 'MamaPrice 4o';

    // ----------------------------------------------------
    // 4. Model Picker Dropdown
    // ----------------------------------------------------
    if (modelPickerBtn && modelDropdown) {
        modelPickerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            modelDropdown.classList.toggle('open');
        });

        document.addEventListener('click', () => {
            modelDropdown.classList.remove('open');
        });

        document.querySelectorAll('#model-dropdown .dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('#model-dropdown .dropdown-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                const modelName = this.getAttribute('data-model');
                selectedModel = modelName;
                if (selectedModelText) selectedModelText.textContent = modelName;

                // Sync Orb Preset with selected model engine
                if (window.metasiddOrbInstance) {
                    if (modelName === 'MamaPrice 4o') window.metasiddOrbInstance.applyPreset(0);
                    else if (modelName === 'OjaLM v0.1') window.metasiddOrbInstance.applyPreset(2);
                    else if (modelName === 'OjaGraph RAG') window.metasiddOrbInstance.applyPreset(1);
                }
            });
        });
    }

    // ----------------------------------------------------
    // 5. Modals (Profile & Upgrade)
    // ----------------------------------------------------
    if (userProfileBtn && profileModal) {
        userProfileBtn.addEventListener('click', () => profileModal.classList.add('open'));
    }
    if (closeProfileModal) {
        closeProfileModal.addEventListener('click', () => profileModal.classList.remove('open'));
    }

    if (planBadgeBtn && planModal) {
        planBadgeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            planModal.classList.add('open');
        });
    }
    if (closePlanModal) {
        closePlanModal.addEventListener('click', () => planModal.classList.remove('open'));
    }

    // Profile Dashboard Page Tab Switching
    document.querySelectorAll('.prof-page-tab, .prof-tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.prof-page-tab, .prof-tab-btn').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const targetPaneId = `prof-pane-${tab.dataset.profTab}`;
            document.querySelectorAll('.prof-page-pane, .prof-tab-pane').forEach(pane => {
                pane.style.display = (pane.id === targetPaneId) ? 'block' : 'none';
            });
        });
    });

    // Payout / Cashout Handlers
    const cashoutBtn = document.getElementById('cashout-now-btn');
    const profPayoutBtn = document.getElementById('prof-payout-btn');
    const profWalletVal = document.getElementById('prof-wallet-val');

    function triggerPayout() {
        alert("💰 Payout Request Initiated!\n\n₦148,500 transferred to OPay Account (703****892 - Amina Yusuf). Payout processed via MamaPrice Instant Settlement.");
        if (profWalletVal) profWalletVal.textContent = '₦0';
        updateAgentBadge(-148500);
    }

    if (cashoutBtn) cashoutBtn.addEventListener('click', triggerPayout);
    if (profPayoutBtn) profPayoutBtn.addEventListener('click', () => {
        const tabBtn = document.querySelector('[data-prof-tab="payouts"]');
        if (tabBtn) tabBtn.click();
    });

    // ── WhatsApp Reverse Authentication Engine (No OTP, No OAuth) ──
    const waAuthBtn = document.getElementById('wa-auth-btn');
    const waAuthModal = document.getElementById('wa-auth-modal');
    const closeWaModal = document.getElementById('close-wa-modal');
    const waCodeVal = document.getElementById('wa-code-val');
    const waDeepLinkBtn = document.getElementById('wa-deep-link-btn');
    const waCopyCodeBtn = document.getElementById('wa-copy-code-btn');
    const waSimVerifyBtn = document.getElementById('wa-sim-verify-btn');
    const waStatusText = document.getElementById('wa-status-text');

    let currentWaSession = null;

    function generateWaLoginSession() {
        const randomCode = 'LOGIN_' + Math.random().toString(36).substring(2, 8).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
        const sessionId = `wa_sess_${Date.now()}`;
        const whatsappNumber = '2348123456789';
        const deepLink = `https://wa.me/${whatsappNumber}?text=${randomCode}`;

        currentWaSession = {
            sessionId,
            loginCode: randomCode,
            deepLink,
            status: 'pending',
            expiresAt: Date.now() + 300000
        };

        if (waCodeVal) waCodeVal.textContent = randomCode;
        if (waDeepLinkBtn) waDeepLinkBtn.href = deepLink;
        if (waStatusText) waStatusText.textContent = 'Listening for WhatsApp Confirmation...';

        return currentWaSession;
    }

    if (waAuthBtn) {
        waAuthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const token = localStorage.getItem('mamaprice_jwt_token');
            if (token) {
                const pageProfile = document.getElementById('page-profile');
                const navProfile = document.getElementById('nav-profile');
                if (pageProfile && typeof switchView === 'function') {
                    switchView(navProfile, pageProfile);
                }
            } else if (waAuthModal) {
                generateWaLoginSession();
                waAuthModal.classList.add('open');
            }
        });
    }

    if (closeWaModal && waAuthModal) {
        closeWaModal.addEventListener('click', () => {
            waAuthModal.classList.remove('open');
        });
    }

    const signInForm = document.getElementById('sign-in-form');
    if (signInForm) {
        signInForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phoneInput = document.getElementById('sign-in-phone');
            const nameInput = document.getElementById('sign-in-name');
            const phone = phoneInput ? phoneInput.value : '+234 801 234 5678';
            const name = nameInput ? nameInput.value : 'Amina Yusuf';

            currentWaSession = { loginCode: 'DIRECT_AUTH', status: 'pending' };
            completeWaAuthentication(phone, name);

            // Check if there was a pending referral code from URL
            const pendingRefCode = localStorage.getItem('mama_pending_referral_code');
            if (pendingRefCode && typeof registerReferral === 'function') {
                registerReferral(name, phone, pendingRefCode);
                localStorage.removeItem('mama_pending_referral_code');
            }
        });
    }

    if (waCopyCodeBtn) {
        waCopyCodeBtn.addEventListener('click', () => {
            if (currentWaSession && currentWaSession.loginCode) {
                navigator.clipboard.writeText(currentWaSession.loginCode);
                alert(`Copied verification code: ${currentWaSession.loginCode}`);
            }
        });
    }

    // ── Invite Market Scouts Referral Modal Handlers ──
    const inviteScoutsBtn = document.getElementById('invite-scouts-btn');
    const inviteScoutsModal = document.getElementById('invite-scouts-modal');
    const closeInviteModal = document.getElementById('close-invite-modal');
    const copyRefLinkBtn = document.getElementById('copy-ref-link-btn');
    const referralLinkInput = document.getElementById('referral-link-input');

    if (inviteScoutsBtn && inviteScoutsModal) {
        inviteScoutsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            inviteScoutsModal.classList.add('open');
        });
    }

    if (closeInviteModal && inviteScoutsModal) {
        closeInviteModal.addEventListener('click', () => {
            inviteScoutsModal.classList.remove('open');
        });
    }

    if (copyRefLinkBtn && referralLinkInput) {
        copyRefLinkBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(referralLinkInput.value);
            copyRefLinkBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
            setTimeout(() => {
                copyRefLinkBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy`;
            }, 2000);
        });
    }

    const profCopyRefBtn = document.getElementById('prof-copy-ref-btn');
    const profRefLinkInput = document.getElementById('prof-ref-link-input');
    if (profCopyRefBtn && profRefLinkInput) {
        profCopyRefBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(profRefLinkInput.value);
            profCopyRefBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
            setTimeout(() => {
                profCopyRefBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy Link`;
            }, 2000);
        });
    }

    // ── Simulation Button for Interactive Referral & Report Testing ──
    const simInviteBtn = document.getElementById('sim-invite-btn');
    if (simInviteBtn) {
        simInviteBtn.addEventListener('click', () => {
            const sampleNames = ['Fatima Garba', 'Babatunde Raji', 'Kalu Okoro', 'Zainab Danjuma', 'Olumide Fashola'];
            const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)] + ` (${Math.floor(100 + Math.random() * 899)})`;
            
            let myRefCode = getMyRefCode();
            if (!myRefCode) myRefCode = 'AMINA92X';
            const allRef = JSON.parse(localStorage.getItem('mama_all_referrals') || '{}');
            if (!allRef[myRefCode]) allRef[myRefCode] = [];
            
            // Add referred agent with 5 completed reports directly
            allRef[myRefCode].unshift({
                name: randomName,
                phone: `0803 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`,
                reports: 5,
                bonusPaid: true,
                joinedAt: 'Just Now'
            });
            localStorage.setItem('mama_all_referrals', JSON.stringify(allRef));
            
            // Award bonus to current user
            awardReferralBonus(randomName);
            renderReferralTable();
            
            // Update profile MarketPoints stat card
            const profPointsVal = document.getElementById('prof-points-val');
            if (profPointsVal) {
                const currentPts = parseInt(profPointsVal.textContent.replace(/[^0-9]/g, '') || '3550');
                profPointsVal.textContent = (currentPts + 200).toLocaleString();
            }
            
            alert(`🎉 Referral Milestone Completed!\n\n${randomName} signed up using your link and logged 5 verified price reports.\n\n✅ +200 MarketPoints Credited to your balance\n✅ Real-time Notification sent to your Inbox`);
        });
    }

    // Startup Referral Initialization
    initReferralLink();
    claimPendingBonuses();

    // ── Dynamic Market Agents Management & Real-time Filter Engine ──
    const scoutsData = [
        { id: 'AG-0001', name: 'Maryam Abubakar', phone: '0803 123 4567', level: 'Market Captain', markets: ['Mile 12', 'Balogun', 'Oyingbo'], reports: 482, points: 12050, trustScore: 98, trustLabel: 'Excellent', earnings: 84750, status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80' },
        { id: 'AG-0002', name: 'Chinedu Okafor', phone: '0812 345 6789', level: 'Senior Agent', markets: ['Onitsha Main', 'Ariaria'], reports: 356, points: 8900, trustScore: 94, trustLabel: 'Excellent', earnings: 61200, status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80' },
        { id: 'AG-0003', name: 'Aisha Bello', phone: '0706 789 0123', level: 'Senior Agent', markets: ['Computer Village', 'Ikeja'], reports: 298, points: 7450, trustScore: 92, trustLabel: 'Excellent', earnings: 48600, status: 'Active', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80' },
        { id: 'AG-0004', name: 'Emeka Nwosu', phone: '0810 222 3344', level: 'Market Agent', markets: ['Mile 12'], reports: 215, points: 5375, trustScore: 90, trustLabel: 'Great', earnings: 31450, status: 'Active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80' },
        { id: 'AG-0005', name: 'Grace Adeyemi', phone: '0901 556 7788', level: 'Market Agent', markets: ['Bodija', 'Dugbe', 'Sango'], reports: 184, points: 4600, trustScore: 88, trustLabel: 'Great', earnings: 26200, status: 'Active', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80' },
        { id: 'AG-0006', name: 'Ibrahim Musa', phone: '0815 667 8899', level: 'Agent Explorer', markets: ['Dawanau', 'Kano Main'], reports: 76, points: 1900, trustScore: 76, trustLabel: 'Good', earnings: 9800, status: 'Active', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80' },
        { id: 'AG-0007', name: 'Patience Johnson', phone: '0702 334 5678', level: 'Agent Explorer', markets: ['Computer Village'], reports: 42, points: 1050, trustScore: 68, trustLabel: 'Fair', earnings: 5250, status: 'Inactive', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&auto=format&fit=crop&q=80' },
        { id: 'AG-0008', name: 'David Williams', phone: '0807 889 9900', level: 'Agent Explorer', markets: ['Mile 12'], reports: 28, points: 700, trustScore: 64, trustLabel: 'Fair', earnings: 3500, status: 'Inactive', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&auto=format&fit=crop&q=80' }
    ];

    const scoutSearchInput = document.getElementById('scout-search-input');
    const scoutStatusFilter = document.getElementById('scout-status-filter');
    const scoutLevelFilter = document.getElementById('scout-level-filter');
    const scoutMarketFilter = document.getElementById('scout-market-filter');
    const scoutMoreFiltersBtn = document.getElementById('scout-more-filters-btn');
    const scoutsTableBody = document.getElementById('scouts-table-body');
    const scoutsCountLabel = document.getElementById('scouts-count-label');

    const kpiTotalEl = document.getElementById('scout-kpi-total');
    const kpiActiveEl = document.getElementById('scout-kpi-active');
    const kpiReportsEl = document.getElementById('scout-kpi-reports');
    const kpiPaidEl = document.getElementById('scout-kpi-paid');
    const kpiTrustEl = document.getElementById('scout-kpi-trust');

    function maskPhoneNumber(phone) {
        if (!phone) return '';
        const clean = phone.replace(/\s+/g, '');
        if (clean.length < 8) return phone;
        return `${clean.slice(0, 4)} *** ${clean.slice(-4)}`;
    }

    function getLevelBadgeClass(level) {
        switch (level) {
            case 'Market Captain': return 'lvl-captain';
            case 'Senior Agent': return 'lvl-senior';
            case 'Market Agent': return 'lvl-scout';
            default: return 'lvl-explorer';
        }
    }

    function getTrustScoreClass(score) {
        if (score >= 92) return 'score-excellent';
        if (score >= 85) return 'score-great';
        if (score >= 70) return 'score-good';
        return 'score-fair';
    }

    window.viewScoutDetails = function(id) {
        const s = scoutsData.find(x => x.id === id);
        if (!s) return;
        alert(`👤 Agent Details:\n\nName: ${s.name}\nPhone: ${maskPhoneNumber(s.phone)}\nLevel: ${s.level}\nMarkets: ${s.markets.join(', ')}\nReports: ${s.reports}\nMarketPoints: ${(s.points || s.reports * 25).toLocaleString()} pts\nTrust Score: ${s.trustScore}% (${s.trustLabel})\nTotal Earnings: ₦${s.earnings.toLocaleString()}`);
    };

    window.triggerScoutActions = function(id) {
        const s = scoutsData.find(x => x.id === id);
        if (!s) return;
        alert(`⚡ Quick Actions for ${s.name}:\n\n1. Send WhatsApp Message (${maskPhoneNumber(s.phone)})\n2. Assign Market Mission\n3. Toggle Agent Status (Current: ${s.status})`);
    };

    function renderScoutsTable(list) {
        if (!scoutsTableBody) return;
        if (list.length === 0) {
            scoutsTableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 32px 16px; color: #64748b;">
                        <i class="fa-solid fa-user-slash" style="font-size: 1.8rem; margin-bottom: 8px; color: #cbd5e1; display: block;"></i>
                        <strong>No Market Agents found matching your filters.</strong>
                        <p style="font-size: 0.76rem; margin-top: 4px;">Try adjusting your search query, status, level, or market filter.</p>
                    </td>
                </tr>
            `;
            return;
        }

        scoutsTableBody.innerHTML = list.map(s => {
            const lvlClass = getLevelBadgeClass(s.level);
            const lvlIcon = {
                'lvl-captain': '<i class="fa-solid fa-star"></i>',
                'lvl-senior':  '<i class="fa-solid fa-shield-halved"></i>',
                'lvl-scout':   '<i class="fa-solid fa-user-shield"></i>',
                'lvl-explorer':'<i class="fa-solid fa-compass"></i>'
            }[lvlClass] || '<i class="fa-solid fa-compass"></i>';
            const lvlTitle = s.level;
            const statusDot = s.status === 'Active'
                ? `<span class="scout-status-dot dot-active" title="Active"></span>`
                : `<span class="scout-status-dot dot-inactive" title="Inactive"></span>`;
            const pts = (s.points || (s.reports * 25)).toLocaleString();
            return `
            <tr>
                <td>
                    <div class="scout-user-cell">
                        <div class="scout-avatar-wrap">
                            <img src="${s.avatar}" alt="${s.name}" class="scout-avatar" />
                            <span class="scout-lvl-dot ${lvlClass}" title="${lvlTitle}">${lvlIcon}</span>
                            ${statusDot}
                        </div>
                        <div>
                            <strong class="scout-name">${s.name}</strong>
                            <span class="scout-meta">${maskPhoneNumber(s.phone)} · ${s.id}</span>
                        </div>
                    </div>
                </td>
                <td><strong class="scout-earning-val">₦${s.earnings.toLocaleString()}</strong></td>
                <td><span class="scout-markets-text">${s.markets.join(', ')}</span></td>
                <td><strong class="scout-stat-num">${s.reports.toLocaleString()}</strong></td>
                <td><strong class="scout-stat-num">${pts} pts</strong></td>
                <td>
                    <div class="trust-score-pill ${getTrustScoreClass(s.trustScore)}">
                        <i class="fa-solid fa-shield"></i> <strong>${s.trustScore}%</strong> <small>${s.trustLabel}</small>
                    </div>
                </td>
                <td style="text-align: right;">
                    <div class="table-action-btns">
                        <button class="tbl-act-btn" onclick="viewScoutDetails('${s.id}')" title="View Agent Profile"><i class="fa-regular fa-eye"></i></button>
                        <button class="tbl-act-btn" onclick="triggerScoutActions('${s.id}')" title="Agent Actions"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    function updateScoutsDashboard() {
        const query = scoutSearchInput ? scoutSearchInput.value.toLowerCase().trim() : '';
        const statusVal = scoutStatusFilter ? scoutStatusFilter.value : 'all';
        const levelVal = scoutLevelFilter ? scoutLevelFilter.value : 'all';
        const marketVal = scoutMarketFilter ? scoutMarketFilter.value : 'all';

        const filtered = scoutsData.filter(s => {
            const matchesQuery = !query || s.name.toLowerCase().includes(query) || s.phone.includes(query) || s.id.toLowerCase().includes(query);
            const matchesStatus = statusVal === 'all' || s.status === statusVal;
            const matchesLevel = levelVal === 'all' || s.level === levelVal;
            const matchesMarket = marketVal === 'all' || s.markets.some(m => m.toLowerCase().includes(marketVal.toLowerCase()));

            return matchesQuery && matchesStatus && matchesLevel && matchesMarket;
        });

        // Recalculate Live KPIs
        const activeCount = filtered.filter(s => s.status === 'Active').length;
        const totalReports = filtered.reduce((acc, s) => acc + s.reports, 0);
        const totalPoints = filtered.reduce((acc, s) => acc + (s.points || (s.reports * 25)), 0);
        const totalPaid = filtered.reduce((acc, s) => acc + s.earnings, 0);
        const avgTrust = filtered.length ? Math.round(filtered.reduce((acc, s) => acc + s.trustScore, 0) / filtered.length) : 0;

        const kpiPointsEl = document.getElementById('scout-kpi-points');

        if (kpiTotalEl) kpiTotalEl.textContent = filtered.length.toLocaleString();
        if (kpiActiveEl) kpiActiveEl.textContent = activeCount.toLocaleString();
        if (kpiReportsEl) kpiReportsEl.textContent = totalReports.toLocaleString();
        if (kpiPointsEl) kpiPointsEl.textContent = `${totalPoints.toLocaleString()} pts`;
        if (kpiPaidEl) kpiPaidEl.textContent = `₦${totalPaid.toLocaleString()}`;
        if (kpiTrustEl) kpiTrustEl.textContent = `${avgTrust}%`;

        if (scoutsCountLabel) {
            scoutsCountLabel.textContent = `Showing ${filtered.length > 0 ? 1 : 0} to ${filtered.length} of ${scoutsData.length} agents`;
        }

        renderScoutsTable(filtered);
        updateUserProfileDashboard();
    }

    function updateUserProfileDashboard() {
        const userJson = localStorage.getItem('mamaprice_auth_user');
        const userName = userJson ? JSON.parse(userJson).name : 'Amina Yusuf';
        const userPhone = userJson ? JSON.parse(userJson).phone : '0801 234 5678';

        const agent = scoutsData.find(a => a.name.toLowerCase() === userName.toLowerCase() || a.phone === userPhone);

        const profHeroName = document.getElementById('prof-hero-name');
        const profHeroLevel = document.getElementById('prof-hero-level');
        const profWalletVal = document.getElementById('prof-wallet-val');
        const profPointsVal = document.getElementById('prof-points-val');
        const profReportsVal = document.getElementById('prof-reports-val');
        const profTrustVal = document.getElementById('prof-trust-val');

        if (profHeroName) profHeroName.textContent = userName;
        
        if (agent) {
            if (profHeroLevel) profHeroLevel.textContent = agent.level;
            if (profWalletVal) profWalletVal.textContent = `₦${agent.earnings.toLocaleString()}`;
            if (profPointsVal) profPointsVal.innerHTML = `<i class="fa-solid fa-coins" style="color: #eab308; margin-right: 4px;"></i>${(agent.points || (agent.reports * 25)).toLocaleString()} pts`;
            if (profReportsVal) profReportsVal.textContent = agent.reports.toLocaleString();
            if (profTrustVal) profTrustVal.textContent = `${agent.trustScore}%`;
        }
    }

    if (scoutSearchInput) scoutSearchInput.addEventListener('input', updateScoutsDashboard);
    if (scoutStatusFilter) scoutStatusFilter.addEventListener('change', updateScoutsDashboard);
    if (scoutLevelFilter) scoutLevelFilter.addEventListener('change', updateScoutsDashboard);
    if (scoutMarketFilter) scoutMarketFilter.addEventListener('change', updateScoutsDashboard);

    if (scoutMoreFiltersBtn) {
        scoutMoreFiltersBtn.addEventListener('click', () => {
            alert("🔍 Extended Agent Filters:\n\n- Filter by Trust Score Range (60% - 100%)\n- Filter by Monthly Earnings Range\n- Filter by Region (Lagos, Kano, Oyo, Anambra, Rivers)");
        });
    }

    // Redesigned Profile Tab Switcher
    const profTabBtns = document.querySelectorAll('.prof-tab-btn');
    profTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabTarget = btn.getAttribute('data-prof-tab');
            profTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const panes = document.querySelectorAll('.prof-pane');
            panes.forEach(pane => {
                if (pane.id === `prof-pane-${tabTarget}`) {
                    pane.style.display = 'block';
                    pane.classList.add('active');
                } else {
                    pane.style.display = 'none';
                    pane.classList.remove('active');
                }
            });
        });
    });

    // View mode toggle
    const vmBtnList = document.getElementById('vm-btn-list');
    const vmBtnGrid = document.getElementById('vm-btn-grid');
    if (vmBtnList && vmBtnGrid) {
        vmBtnList.addEventListener('click', () => {
            vmBtnList.classList.add('active');
            vmBtnGrid.classList.remove('active');
        });
        vmBtnGrid.addEventListener('click', () => {
            vmBtnGrid.classList.add('active');
            vmBtnList.classList.remove('active');
            alert("Grid View Mode Toggled! (Showing compact scout avatar cards grid).");
        });
    }

    // Initial render of Scouts Dashboard
    updateScoutsDashboard();

    function updateUserProfileDashboard() {
        const userJson = localStorage.getItem('mamaprice_auth_user');
        const user = userJson ? JSON.parse(userJson) : null;
        const isAgent = localStorage.getItem('mama_user_is_agent') === 'true';

        const nameEl = document.getElementById('prof-hero-name');
        const subEl = document.getElementById('prof-user-phone-loc');
        const avatarEl = document.querySelector('.prof-avatar-img');
        const statusBadge = document.getElementById('prof-status-badge');
        const agentToggleBtn = document.getElementById('prof-agent-toggle-btn');
        const payoutBtn = document.getElementById('prof-payout-btn');

        const savingsVal = document.getElementById('prof-savings-val');
        const walletVal = document.getElementById('prof-wallet-val');
        const pointsVal = document.getElementById('prof-points-val');
        const trustVal = document.getElementById('prof-trust-val');
        const reportsLoggedSub = document.getElementById('prof-reports-logged-sub');
        const agentSub = document.getElementById('prof-agent-sub');

        if (user) {
            if (nameEl) nameEl.textContent = user.name || 'Amina Yusuf';
            if (subEl) subEl.innerHTML = `<i class="fa-solid fa-phone"></i> ${user.phone || '+234 801 234 5678'} · <i class="fa-solid fa-location-dot"></i> ${user.location || 'Dawanau & Sabon Gari Markets, Kano'}`;
            if (avatarEl && user.avatar) avatarEl.src = user.avatar;
        }

        // Check if agent status is active
        if (isAgent) {
            if (statusBadge) {
                statusBadge.innerHTML = `<span class="live-dot"></span> Active Scout Agent`;
                statusBadge.style.background = '#f0fdf4';
                statusBadge.style.color = '#166534';
                statusBadge.style.borderColor = '#bbf7d0';
            }
            if (agentToggleBtn) agentToggleBtn.style.display = 'none';
            if (payoutBtn) payoutBtn.style.display = 'inline-flex';
            if (agentSub) agentSub.textContent = 'Available Earnings';
        } else {
            if (statusBadge) {
                statusBadge.innerHTML = `<span class="live-dot" style="background:#22c55e;"></span> Smart Saver`;
                statusBadge.style.background = '#f1f5f9';
                statusBadge.style.color = '#475569';
                statusBadge.style.borderColor = '#cbd5e1';
            }
            if (agentToggleBtn) agentToggleBtn.style.display = 'inline-flex';
            if (payoutBtn) payoutBtn.style.display = 'none';
            if (agentSub) agentSub.textContent = 'Become Agent to Earn';
        }

        // Calculate MarketPoints
        let totalPts = user ? (user.referralPoints || 600) : 600;
        const agentData = user ? scoutsData.find(a => a.name.toLowerCase() === (user.name || '').toLowerCase()) : null;

        if (agentData) {
            totalPts += (agentData.points || 0);
            if (walletVal) walletVal.textContent = `₦${(agentData.earnings || 0).toLocaleString()}`;
            if (trustVal) trustVal.textContent = `${agentData.trustScore || 98}%`;
            if (reportsLoggedSub) reportsLoggedSub.textContent = `${agentData.reports || 0} Reports Logged`;
        } else {
            if (walletVal) walletVal.textContent = isAgent ? `₦148,500` : `₦0`;
            if (trustVal) trustVal.textContent = isAgent ? `98.4%` : `100%`;
            if (reportsLoggedSub) reportsLoggedSub.textContent = isAgent ? `142 Reports Logged` : `0 Reports Logged`;
        }

        if (pointsVal) pointsVal.textContent = totalPts.toLocaleString();
        if (savingsVal) savingsVal.textContent = `₦128,500`;
    }

    function updateAuthUIState() {
        const token = localStorage.getItem('mamaprice_jwt_token');
        const userJson = localStorage.getItem('mamaprice_auth_user');

        const navProfile = document.getElementById('nav-profile');
        const mNavProfile = document.getElementById('m-nav-profile');
        const userProfileBtn = document.getElementById('user-profile-btn');

        if (token && userJson) {
            const user = JSON.parse(userJson);
            const avatarUrl = user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80';
            if (waAuthBtn) {
                waAuthBtn.innerHTML = `<img src="${avatarUrl}" alt="${user.name || 'User Profile'}" class="header-user-avatar-img" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid #16a34a; display: block; box-shadow: 0 1px 3px rgba(0,0,0,0.15);" />`;
                waAuthBtn.style.background = 'transparent';
                waAuthBtn.style.padding = '0';
                waAuthBtn.style.border = 'none';
                waAuthBtn.title = `${user.name || 'User Profile'} (${user.phone || ''})`;
            }
            if (navProfile) navProfile.style.display = 'flex';
            if (mNavProfile) mNavProfile.style.display = 'flex';
            if (userProfileBtn) userProfileBtn.style.display = 'flex';
        } else {
            if (waAuthBtn) {
                waAuthBtn.innerHTML = `<span>Sign in</span>`;
                waAuthBtn.style.background = '#ffffff';
                waAuthBtn.style.color = '#0f172a';
                waAuthBtn.style.border = '1px solid #cbd5e1';
                waAuthBtn.style.padding = '6px 14px';
                waAuthBtn.style.borderRadius = '20px';
                waAuthBtn.title = `Sign in via WhatsApp Reverse Authentication`;
            }
            if (navProfile) navProfile.style.display = 'none';
            if (mNavProfile) mNavProfile.style.display = 'none';
            if (userProfileBtn) userProfileBtn.style.display = 'none';
        }

        updateUserProfileDashboard();
    }
    updateAuthUIState();

    // ─────────────────────────────────────────────────────────────────────────
    // HEADER INTERACTIVE BUTTONS ENGINE
    // ─────────────────────────────────────────────────────────────────────────
    const weatherPill = document.getElementById('weather-location-pill');
    const weatherPopover = document.getElementById('weather-popover-card');
    const notifBtn = document.getElementById('notif-btn');
    const notifPopover = document.getElementById('notif-popover');
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    const notifBadge = document.querySelector('.notif-badge');
    // waAuthBtn already declared at top level

    // 1. Weather Location Pill Click
    if (weatherPill && weatherPopover) {
        weatherPill.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = weatherPopover.classList.contains('open');
            document.querySelectorAll('.weather-popover-card, .notif-popover-card').forEach(el => el.classList.remove('open'));
            if (!isOpen) weatherPopover.classList.add('open');
        });
    }

    // Weather City Switcher Buttons
    document.querySelectorAll('.w-city-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.w-city-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const cityName = this.getAttribute('data-city') || 'Kano, NG';

            const cityData = {
                'Kano, NG': { temp: '29°C', icon: '🌤️', desc: 'Partly Cloudy · Dawanau Hub', humidity: '64%', wind: '12 km/h' },
                'Lagos, NG': { temp: '31°C', icon: '🌧️', desc: 'Light Rain · Mile 12 Hub', humidity: '82%', wind: '18 km/h' },
                'Ibadan, NG': { temp: '28°C', icon: '⛅', desc: 'Cloudy · Bodija Hub', humidity: '75%', wind: '10 km/h' },
                'Abuja, NG': { temp: '30°C', icon: '☀️', desc: 'Sunny · Wuse Market Hub', humidity: '55%', wind: '14 km/h' }
            };

            const info = cityData[cityName] || cityData['Kano, NG'];
            
            const cityEl = document.getElementById('weather-city');
            const popCityEl = document.getElementById('w-pop-city');
            const iconEl = document.getElementById('weather-icon');
            const popIconEl = document.getElementById('w-pop-icon');
            const tempEl = document.getElementById('weather-temp');
            const popTempEl = document.getElementById('w-pop-temp');
            const popDescEl = document.getElementById('w-pop-desc');
            const popHumEl = document.getElementById('w-pop-humidity');
            const popWindEl = document.getElementById('w-pop-wind');

            if (cityEl) cityEl.textContent = cityName;
            if (popCityEl) popCityEl.textContent = cityName;
            if (iconEl) iconEl.textContent = info.icon;
            if (popIconEl) popIconEl.textContent = info.icon;
            if (tempEl) tempEl.textContent = info.temp;
            if (popTempEl) popTempEl.textContent = info.temp;
            if (popDescEl) popDescEl.textContent = info.desc;
            if (popHumEl) popHumEl.textContent = info.humidity;
            if (popWindEl) popWindEl.textContent = info.wind;
        });
    });

    // 2. Notifications Bell Button Click
    if (notifBtn && notifPopover) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = notifPopover.classList.contains('open');
            document.querySelectorAll('.weather-popover-card, .notif-popover-card').forEach(el => el.classList.remove('open'));
            if (!isOpen) notifPopover.classList.add('open');
        });
    }

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (notifBadge) {
                notifBadge.style.display = 'none';
                notifBadge.textContent = '0';
            }
            document.querySelectorAll('.notif-row-item.unread').forEach(item => item.classList.remove('unread'));
        });
    }

    // 3. Sign In / User Avatar Header Button Click
    if (waAuthBtn) {
        waAuthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const token = localStorage.getItem('mamaprice_jwt_token');
            if (token) {
                const pageProfile = document.getElementById('page-profile');
                const navProfile = document.getElementById('nav-profile');
                if (pageProfile && typeof switchView === 'function') {
                    switchView(navProfile, pageProfile);
                }
            } else {
                const waModal = document.getElementById('wa-auth-modal');
                if (waModal) {
                    waModal.classList.add('open');
                    waModal.style.display = 'flex';
                }
            }
        });
    }


    // Close header popovers on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.weather-pill-container') && !e.target.closest('.notif-popover-wrapper')) {
            document.querySelectorAll('.weather-popover-card, .notif-popover-card').forEach(el => el.classList.remove('open'));
        }
    });

    function completeWaAuthentication(phoneNumber = '+234 801 **** 578', userName = 'Amina Yusuf') {
        const PRIVY_APP_ID = "5QTVCAo3hoBRmse1JXmPwghbfeSmcAGcj7pMmwgqhNsnsvVzK1dgPy9B9Gud7f874NzJXTtgrXtLdRoJzG3fwvQG";
        const dummyJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ phone: phoneNumber, user: userName, privyAppId: PRIVY_APP_ID, exp: Date.now() + 864000000 }))}.signature`;
        
        localStorage.setItem('mamaprice_jwt_token', dummyJwt);
        localStorage.setItem('mamaprice_auth_user', JSON.stringify({ name: userName, phone: phoneNumber, provider: 'Privy Auth', appId: PRIVY_APP_ID }));

        updateAuthUIState();

        if (typeof window.pushAlertGraphNotification === 'function') {
            window.pushAlertGraphNotification({
                type: 'inbox',
                text: `🔒 <strong>Privy Authentication Verified!</strong><br>Welcome ${userName} (${phoneNumber}). Session active under Privy Auth App ID: <code>5QTVCAo3...</code>`,
                tag: 'Privy Auth',
                actionQuery: ''
            });
        }

        setTimeout(() => {
            const waAuthModal = document.getElementById('wa-auth-modal');
            if (waAuthModal) waAuthModal.classList.remove('open');
            const pageProfile = document.getElementById('page-profile');
            const navProfile = document.getElementById('nav-profile');
            if (pageProfile && typeof switchView === 'function') {
                switchView(navProfile, pageProfile);
            }
            alert(`🎉 Privy Authentication Successful!\n\nAuthenticated ${userName} (${phoneNumber}) via Privy Auth App ID.\nSaved to active session.`);
        }, 400);
    }

    window.triggerPrivyMethod = async function(method) {
        if (window.privyClient && typeof window.privyClient.login === 'function') {
            try {
                const user = await window.privyClient.login({ loginMethod: method });
                if (user) {
                    const uName = user.email ? user.email.address : (user.phone ? user.phone.number : (user.wallet ? user.wallet.address : 'Privy Verified User'));
                    completeWaAuthentication(uName, uName);
                    return;
                }
            } catch (err) {
                console.warn("Privy SDK trigger login info:", err);
            }
        }

        const methodLabels = {
            'google': { name: 'Google OAuth', user: 'Amina Yusuf (Google)' },
            'apple': { name: 'Apple ID', user: 'Amina Yusuf (Apple)' },
            'twitter': { name: 'Twitter / X', user: '@aminayusuf' },
            'telegram': { name: 'Telegram Auth', user: 'Amina Yusuf (Telegram)' },
            'wallet': { name: 'Web3 Wallet (EVM)', user: '0x71C...38f9 (Web3 Wallet)' }
        };
        const m = methodLabels[method] || { name: 'Privy Method', user: 'Amina Yusuf' };
        completeWaAuthentication(m.user, m.user);
    };

    if (waSimVerifyBtn) {
        waSimVerifyBtn.addEventListener('click', () => {
            completeWaAuthentication();
        });
    }

    // Logout Handler
    const profLogoutBtn = document.getElementById('prof-logout-btn');
    function handleLogout() {
        localStorage.removeItem('mamaprice_jwt_token');
        localStorage.removeItem('mamaprice_auth_user');
        updateAuthUIState();
        alert('👋 Logged out successfully. You can log back in anytime using WhatsApp Reverse Authentication.');
        
        const pageHome = document.getElementById('page-home');
        const navHome = document.getElementById('nav-home');
        if (pageHome && typeof switchView === 'function') {
            switchView(navHome, pageHome);
        }
    }
    if (profLogoutBtn) profLogoutBtn.addEventListener('click', handleLogout);

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('open');
            }
        });
    });

    // ----------------------------------------------------
    // 6. Action Tags & Voice Input
    // ----------------------------------------------------
    tagBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });

    if (micBtn) {
        micBtn.addEventListener('click', () => {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.onstart = () => {
                    micBtn.style.color = '#ef4444';
                    messageInput.placeholder = 'Listening...';
                };
                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    messageInput.value = transcript;
                    micBtn.style.color = '';
                    messageInput.placeholder = 'Initiate a query or send a market command to MamaPrice...';
                };
                recognition.onerror = () => {
                    micBtn.style.color = '';
                    messageInput.placeholder = 'Initiate a query or send a market command to MamaPrice...';
                };
                recognition.start();
            } else {
                alert("Voice input listening activated for MamaPrice Speech.");
            }
        });
    }

    // ----------------------------------------------------
    // 7. Suggestions & Chat Stream logic
    // ----------------------------------------------------
    window.sendSuggestion = function(text) {
        switchView(navHome, pageHome);
        if (messageInput) messageInput.value = text;
        if (chatForm) chatForm.dispatchEvent(new Event('submit'));
    };

    window.askMamaAboutMarket = function(commodity, location, benchmark, discovered, saved) {
        let query = '';
        if (saved && benchmark && discovered) {
            query = `How much did I save buying ${commodity} at ${location}, and how was my ₦${saved} savings calculated?`;
        } else if (commodity && location) {
            query = `How much did I save on ${commodity} at ${location}?`;
        } else if (commodity) {
            query = `How much can I save on ${commodity} across regional markets today?`;
        } else {
            query = `How much have I saved on my market purchases this month?`;
        }

        if (typeof window.sendSuggestion === 'function') {
            window.sendSuggestion(query);
        }
    };

    // New Chat handler
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            currentSessionId = `session_${Date.now()}`;
            if (chatHistory) chatHistory.innerHTML = '';
            if (welcomeScreen) {
                welcomeScreen.style.display = 'block';
                if (chatHistory) chatHistory.appendChild(welcomeScreen);
            }
            if (messageInput) {
                messageInput.value = '';
                messageInput.style.height = 'auto';
            }
            switchView(navHome, pageHome);
        });
    }

    // Handle form submission
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!messageInput) return;
            const message = messageInput.value.trim();
            if (!message) return;

            // Auto-detect market price reporting & recognize user as Agent Scout
            if (/report|price update|selling for|market price|market report|scout|i bought/i.test(message)) {
                if (typeof window.activateUserAgentStatus === 'function') {
                    window.activateUserAgentStatus();
                }
            }

            // Hide welcome screen on first message
            if (welcomeScreen && welcomeScreen.parentNode) {
                welcomeScreen.style.display = 'none';
            }

            // 1. Add user message
            addUserMessage(message);
            
            // Reset input
            messageInput.value = '';
            messageInput.style.height = 'auto';

        // 2. Show Typing Indicator
        showTypingIndicator();

        // 3. Fetch data from local OjaLM API
        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-session-id': currentSessionId
                },
                body: JSON.stringify({ 
                    prompt: message,
                    sessionId: currentSessionId,
                    modelId: selectedModel
                })
            });

            if (!response.ok) {
                let errData;
                try { errData = await response.json(); } catch(_) {}
                const msg = (errData && errData.error) ? errData.error : `HTTP Error: ${response.status}`;
                throw new Error(msg);
            }

            const data = await response.json();
            
            removeTypingIndicator();
            addAgentMessage(data.response, data.evidence, data.modelUsed);
        } catch (error) {
            console.error("API Error:", error);
            removeTypingIndicator();
            addAgentErrorMessage("Connection to local OjaLM API failed: " + error.message);
        }
    });
}

    function addUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message-row user-row';
        msgDiv.innerHTML = `
            <div class="message-container">
                <div class="bubble-user">${escapeHTML(text)}</div>
            </div>
        `;
        chatHistory.appendChild(msgDiv);
        scrollToBottom();
    }

    function addAgentMessage(responseText, evidenceList = [], modelUsed = 'MamaPrice 4o') {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message-row agent-row';
        
        let evidenceHtml = '';
        if (evidenceList && evidenceList.length > 0) {
            evidenceHtml = `
                <div style="margin-top: 12px; padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;">
                    <div style="color: #15803d; font-weight: 600; font-size: 0.85em; margin-bottom: 8px;">
                        <i class="fa-solid fa-shield-halved"></i> Grounded OjaGraph Evidence
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
            `;

            evidenceList.forEach(obs => {
                const priceFormatted = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(obs.observed_price);
                const confPercent = Math.round((obs.confidence || 0.95) * 100);
                evidenceHtml += `
                    <div style="background: #ffffff; border: 1px solid #dcfce7; padding: 8px 10px; border-radius: 8px; font-size: 0.86em;">
                        <div><strong>${escapeHTML(obs.product)}</strong> — <span style="color: #16a34a; font-weight: 700;">${priceFormatted}</span> (${escapeHTML(obs.quantity)})</div>
                        <div style="color: #4b5563; font-size: 0.82em; margin-top: 2px;">
                            📍 ${escapeHTML(obs.market)} (${escapeHTML(obs.state)}) · ⏱️ ${obs.freshness_hours}h ago · 🎯 ${confPercent}% confidence
                        </div>
                    </div>
                `;
            });

            evidenceHtml += `
                    </div>
                </div>
            `;
        }

        // Extract JSON block if it exists
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
        const modelBadgeHtml = `<div style="font-size: 0.72em; color: #6366f1; font-weight: 600; margin-bottom: 6px;"><i class="fa-solid fa-microchip"></i> Engine: ${escapeHTML(modelUsed)}</div>`;
        
        let bubbleContent = '';
        if (jsonMatch) {
            const textPart = responseText.replace(/```json\n[\s\S]*?\n```/, '').trim();
            const jsonStr = jsonMatch[1];
            
            bubbleContent = `
                ${modelBadgeHtml}
                <p>${escapeHTML(textPart).replace(/\n/g, '<br>')}</p>
                ${evidenceHtml}
                <div style="margin-top: 12px; padding: 12px; background: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px;">
                    <div style="color: #c2410c; font-weight: 600; font-size: 0.85em; margin-bottom: 6px;">
                        <i class="fa-solid fa-code"></i> Extracted OjaData JSON
                    </div>
                    <pre style="margin: 0; padding: 8px; background: #ffffff; border: 1px solid #fed7aa; border-radius: 6px; font-size: 0.82em; color: #9a3412; overflow-x: auto;"><code>${escapeHTML(jsonStr)}</code></pre>
                </div>
            `;
        } else {
            bubbleContent = `
                ${modelBadgeHtml}
                <p>${escapeHTML(responseText).replace(/\n/g, '<br>')}</p>
                ${evidenceHtml}
            `;
        }
        
        msgDiv.innerHTML = `
            <div class="message-container">
                <div class="message-avatar-orb"><i class="fa-solid fa-sparkles"></i></div>
                <div class="bubble-agent">${bubbleContent}</div>
            </div>
        `;
        
        chatHistory.appendChild(msgDiv);
        scrollToBottom();
    }

    function addAgentErrorMessage(errorMsg) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message-row agent-row';
        msgDiv.innerHTML = `
            <div class="message-container">
                <div class="message-avatar-orb" style="background: #fee2e2; color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div class="bubble-agent" style="color: #b91c1c; border-color: #fca5a5;">${escapeHTML(errorMsg)}</div>
            </div>
        `;
        chatHistory.appendChild(msgDiv);
        scrollToBottom();
    }

    let typingDiv = null;
    function showTypingIndicator() {
        typingDiv = document.createElement('div');
        typingDiv.className = 'message-row agent-row';
        typingDiv.innerHTML = `
            <div class="message-container">
                <div class="message-avatar-orb"><i class="fa-solid fa-sparkles"></i></div>
                <div class="bubble-agent">
                    <div class="typing-dots">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
            </div>
        `;
        chatHistory.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        if(typingDiv) {
            typingDiv.remove();
            typingDiv = null;
        }
    }

    function scrollToBottom() {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&#34;'
            }[tag] || tag)
        );
    }
});

// ─── Live Market Snapshot Monitoring Engine ─────────────────────────────
(function initLiveSnapshot() {
    const keys = ['rice', 'tomatoes', 'pepper', 'eggs'];
    const commodities = {
        rice:     { priceEl: 'snap-price-rice',     trendEl: 'snap-trend-rice',     base: 72000, step: 500, min: 68000, max: 76000 },
        tomatoes: { priceEl: 'snap-price-tomatoes', trendEl: 'snap-trend-tomatoes', base: 1950,  step: 50,  min: 1700,  max: 2300  },
        pepper:   { priceEl: 'snap-price-pepper',   trendEl: 'snap-trend-pepper',   base: 14000, step: 200, min: 12500, max: 15500 },
        eggs:     { priceEl: 'snap-price-eggs',     trendEl: 'snap-trend-eggs',     base: 4500,  step: 100, min: 4100,  max: 4900  }
    };

    const current = {};
    for (const k of keys) {
        current[k] = commodities[k].base;
    }

    function fmt(n) {
        return '₦' + Math.round(n).toLocaleString('en-NG');
    }

    function updateTimestamp() {
        const el = document.getElementById('snap-last-updated');
        if (!el) return;
        el.textContent = 'just now';
    }

    function animateValue(el, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const val = start + (end - start) * progress;
            el.textContent = fmt(val);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function tickSingle(key) {
        const cfg = commodities[key];
        const priceEl = document.getElementById(cfg.priceEl);
        const trendEl = document.getElementById(cfg.trendEl);
        if (!priceEl || !trendEl) return;

        const card = priceEl.closest('.snap-card');
        const oldVal = current[key];
        const dir = Math.random() > 0.45 ? 1 : -1;
        const delta = dir * cfg.step * (Math.random() < 0.25 ? 2 : 1);
        let newVal = oldVal + delta;
        if (newVal < cfg.min) newVal = cfg.min + cfg.step;
        if (newVal > cfg.max) newVal = cfg.max - cfg.step;

        current[key] = newVal;
        const isUp = newVal >= oldVal;
        const pct = Math.abs(((newVal - cfg.base) / cfg.base) * 100).toFixed(0);

        // Animate counter
        animateValue(priceEl, oldVal, newVal, 400);

        // Update trend
        trendEl.className = `snap-trend ${isUp ? 'up' : 'down'}`;
        trendEl.innerHTML = isUp
            ? `<i class="fa-solid fa-arrow-up"></i> ${pct}%`
            : `<i class="fa-solid fa-arrow-down"></i> ${pct}%`;

        // Trigger card pulse & flash
        if (card) {
            card.classList.remove('pulse-up', 'pulse-down');
            void card.offsetWidth;
            card.classList.add(isUp ? 'pulse-up' : 'pulse-down');
        }

        priceEl.classList.remove('flash-up', 'flash-down');
        void priceEl.offsetWidth;
        priceEl.classList.add(isUp ? 'flash-up' : 'flash-down');

        updateTimestamp();
    }

    function tick() {
        // Pick 1 or 2 random commodities to tick live
        const count = Math.random() < 0.4 ? 2 : 1;
        const shuffled = [...keys].sort(() => Math.random() - 0.5);
        for (let i = 0; i < count; i++) {
            setTimeout(() => tickSingle(shuffled[i]), i * 300);
        }
    }

    // High frequency live market monitoring ticks (every 3.5s)
    setInterval(tick, 3500);
})();

// -----------------------------------------------------------------------------
// Interactive Leaflet Market Map Engine
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('leaflet-map-canvas');
    const mapSheet = document.getElementById('map-redesign-card');
    if (!mapContainer || !mapSheet) return;

    const marketData = {
        dawanau: { key: 'dawanau', title: 'Dawanau Wholesale Market', lat: 12.0833, lon: 8.4415, category: 'grain', emoji: '🌾', price: '₦72,000', priceSub: 'Rice · 50kg bag', address: 'Katsina Road · Dawakin Tofa LGA, Kano State', distance: '12.4 km', rating: '4.9', reviews: '128 verified reports', status: 'Open now · Major Grain Hub' },
        sabongari: { key: 'sabongari', title: 'Sabon Gari Building Market', lat: 12.0003, lon: 8.5367, category: 'building', emoji: '🏗️', price: '₦8,500', priceSub: 'Dangote Cement · 50kg bag', address: 'France Road · Fagge LGA, Kano State', distance: '6.8 km', rating: '4.7', reviews: '94 verified reports', status: 'Open now · Materials Hub' },
        mile12: { key: 'mile12', title: 'Mile 12 Perishable Market', lat: 6.6139, lon: 3.3917, category: 'produce', emoji: '🍅', price: '₦41,650', priceSub: 'Tomatoes · Full Basket', address: 'Ikorodu Road · Kosofe LGA, Lagos State', distance: '4.2 km', rating: '4.8', reviews: '215 verified reports', status: 'Busy · Peak Trading Hours' },
        computervillage: { key: 'computervillage', title: 'Computer Village Market', lat: 6.5931, lon: 3.3422, category: 'tech', emoji: '💻', price: '₦18,200', priceSub: 'Solar Accessories / Electronics', address: 'Otigba Street · Ikeja, Lagos State', distance: '9.6 km', rating: '4.5', reviews: '310 verified reports', status: 'Open now · Tech Center' },
        oyingbo: { key: 'oyingbo', title: 'Oyingbo Food Market', lat: 6.4789, lon: 3.3852, category: 'produce', emoji: '🐟', price: '₦18,500', priceSub: 'Fresh Seafood & Tubers', address: 'Ebute Metta · Lagos Mainland, Lagos State', distance: '11.1 km', rating: '4.7', reviews: '88 verified reports', status: 'Open now · Fresh Supply' },
        bodija: { key: 'bodija', title: 'Bodija International Market', lat: 7.4211, lon: 3.8967, category: 'produce', emoji: '🌴', price: '₦54,000', priceSub: 'Palm Oil · 25L Jerrican', address: 'Bodija-Secretariat Road · Ibadan North, Oyo State', distance: '18.1 km', rating: '4.6', reviews: '162 verified reports', status: 'Open now · Wholesale' },
        onitsha: { key: 'onitsha', title: 'Onitsha Main Wholesale Market', lat: 6.1478, lon: 6.7828, category: 'grain', emoji: '🍞', price: '₦64,800', priceSub: 'Golden Penny Flour · 50kg', address: 'Commercial Avenue · Onitsha, Anambra State', distance: '24.5 km', rating: '4.9', reviews: '204 verified reports', status: 'Open now · Commercial Hub' },
        wuse: { key: 'wuse', title: 'Wuse Main Market', lat: 9.0645, lon: 7.4682, category: 'grain', emoji: '🥩', price: '₦82,000', priceSub: 'Imported Rice & Provisions', address: 'Herbert Macaulay Way · Wuse Zone 5, Abuja', distance: '15.3 km', rating: '4.8', reviews: '175 verified reports', status: 'Open now · Federal Hub' },
        oilmill: { key: 'oilmill', title: 'Oil Mill Market', lat: 4.8456, lon: 7.0421, category: 'energy', emoji: '🦐', price: '₦95,000', priceSub: 'Crayfish & Seafood Bag', address: 'Eleme Flyover · Port Harcourt, Rivers State', distance: '28.0 km', rating: '4.7', reviews: '119 verified reports', status: 'Active Trading Day' },
        ariaria: { key: 'ariaria', title: 'Ariaria International Market', lat: 5.1124, lon: 7.3458, category: 'building', emoji: '👞', price: '₦9,700', priceSub: 'Cement & Hardware Goods', address: 'Faulks Road · Aba South, Abia State', distance: '32.1 km', rating: '4.6', reviews: '143 verified reports', status: 'Open now · Industrial' },
        jos: { key: 'jos', title: 'Jos Main Terminal Market', lat: 9.9231, lon: 8.8912, category: 'produce', emoji: '🥔', price: '₦28,000', priceSub: 'Irish Potatoes · 50kg', address: 'Ahmadu Bello Way · Jos North, Plateau State', distance: '45.0 km', rating: '4.8', reviews: '97 verified reports', status: 'Open now · Cold Climate Hub' },
        ogbete: { key: 'ogbete', title: 'Ogbete Main Market', lat: 6.4358, lon: 7.4942, category: 'grain', emoji: '🍠', price: '₦34,000', priceSub: 'Yellow Garri & Yam', address: 'Market Road · Enugu North, Enugu State', distance: '38.2 km', rating: '4.7', reviews: '110 verified reports', status: 'Open now · South East Hub' }
    };

    let map = null;
    let markersMap = {};
    let activeKey = 'dawanau';
    let currentPolyline = null;
    let activeLayerIndex = 0;

    const tileProviders = [
        { name: 'Voyager', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', attribution: '&copy; OpenStreetMap &copy; CARTO' },
        { name: 'Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '&copy; OpenStreetMap &copy; CARTO' },
        { name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: 'Source: Esri, Maxar' }
    ];

    let currentTileLayer = null;

    if (typeof L !== 'undefined') {
        map = L.map('leaflet-map-canvas', {
            zoomControl: false,
            attributionControl: false
        }).setView([ marketData.dawanau.lat, marketData.dawanau.lon ], 12);

        currentTileLayer = L.tileLayer(tileProviders[0].url, {
            maxZoom: 19,
            attribution: tileProviders[0].attribution
        }).addTo(map);

        // Add user location pulse marker (Kano central mock user)
        const userIcon = L.divIcon({
            className: 'user-location-div-icon',
            html: `<div class="map-user-location" style="position:relative; width:36px; height:36px;"><span class="map-user-pulse"></span><span class="map-user-arrow"><i class="fa-solid fa-location-arrow"></i></span></div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        L.marker([11.9964, 8.5167], { icon: userIcon, zIndexOffset: 2000 }).addTo(map).bindTooltip("Your Location (Kano)", { permanent: false });

        // Add market markers
        Object.values(marketData).forEach(m => {
            const pinIcon = L.divIcon({
                className: 'custom-pin-wrapper',
                html: `<div class="custom-market-pin-badge ${m.key === activeKey ? 'active-pin' : ''}" id="pin-badge-${m.key}"><span class="pin-emoji-icon">${m.emoji}</span><div class="pin-text-block"><strong>${m.title}</strong><span>${m.price}</span></div></div>`,
                iconSize: [160, 42],
                iconAnchor: [80, 21]
            });

            const marker = L.marker([m.lat, m.lon], { icon: pinIcon }).addTo(map);
            marker.on('click', () => selectMarket(m.key));
            markersMap[m.key] = marker;
        });

        window.mamaPriceMap = map;
        window.refreshMamaMap = () => {
            if (map) map.invalidateSize();
        };
    }

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    function updateNearbyList(currentKey) {
        const container = document.getElementById('map-nearby-list-container');
        if (!container) return;

        const otherMarkets = Object.values(marketData).filter(m => m.key !== currentKey).slice(0, 3);
        container.innerHTML = otherMarkets.map(m => `
            <button class="map-nearby-item" data-key="${m.key}">
                <span class="nearby-icon ${m.category === 'building' ? 'building' : (m.category === 'produce' ? 'produce' : '')}"><i class="fa-solid ${m.category === 'grain' ? 'fa-wheat-awn' : (m.category === 'produce' ? 'fa-carrot' : (m.category === 'building' ? 'fa-trowel-bricks' : 'fa-shop'))}"></i></span>
                <span><strong>${m.title}</strong><small>${m.address.split('·')[0]} · ${m.distance}</small></span>
                <b>${m.price}</b>
            </button>
        `).join('');

        container.querySelectorAll('.map-nearby-item').forEach(btn => {
            btn.addEventListener('click', () => selectMarket(btn.dataset.key));
        });
    }

    function selectMarket(key) {
        const data = marketData[key];
        if (!data) return;

        activeKey = key;

        // Highlight marker icon
        Object.keys(markersMap).forEach(k => {
            const badge = document.getElementById(`pin-badge-${k}`);
            if (badge) badge.classList.toggle('active-pin', k === key);
        });

        // Update bottom sheet
        setText('map-redesign-status', data.status);
        setText('map-redesign-title', data.title);
        setText('map-redesign-address', data.address);
        setText('map-redesign-price', data.price);
        setText('map-redesign-price-sub', data.priceSub);
        setText('map-redesign-distance', data.distance);
        setText('map-redesign-rating', data.rating);
        setText('map-redesign-reviews', data.reviews);

        updateNearbyList(key);

        mapSheet.classList.remove('is-collapsed');

        // Smooth flyTo map location
        if (map) {
            map.flyTo([data.lat, data.lon], 13, { duration: 1.2, animate: true });

            // Draw connecting route polyline from user position
            if (currentPolyline) map.removeLayer(currentPolyline);
            currentPolyline = L.polyline([[11.9964, 8.5167], [data.lat, data.lon]], {
                color: '#f59e0b',
                weight: 4,
                dashArray: '8, 8',
                opacity: 0.85
            }).addTo(map);
        }
    }

    window.selectMapMarket = selectMarket;
    selectMarket('dawanau');

    // Filter pills handler
    document.querySelectorAll('#page-map .map-pill-btn').forEach(pill => {
        pill.addEventListener('click', () => {
            const category = pill.dataset.category || 'all';
            document.querySelectorAll('#page-map .map-pill-btn').forEach(item => item.classList.toggle('active', item === pill));

            let count = 0;
            Object.values(marketData).forEach(m => {
                const marker = markersMap[m.key];
                const show = (category === 'all' || m.category === category);
                if (marker && map) {
                    if (show) {
                        marker.addTo(map);
                        count++;
                    } else {
                        map.removeLayer(marker);
                    }
                }
            });
            setText('map-tracked-count', `${count} markets tracked`);
        });
    });

    // Live search input
    const searchInput = document.getElementById('map-live-search-input');
    const searchBtn = document.getElementById('map-redesign-search-action');

    function performSearch() {
        if (!searchInput) return;
        const q = searchInput.value.trim().toLowerCase();
        if (!q) return;

        const match = Object.values(marketData).find(m => 
            m.title.toLowerCase().includes(q) || 
            m.address.toLowerCase().includes(q) || 
            m.priceSub.toLowerCase().includes(q)
        );

        if (match) {
            selectMarket(match.key);
        } else {
            alert(`No markets found matching "${q}". Try searching for Rice, Kano, Lagos, or Tomatoes.`);
        }
    }

    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
    if (searchBtn) searchBtn.addEventListener('click', performSearch);

    // Map control buttons
    document.getElementById('map-zoom-in-btn')?.addEventListener('click', () => map && map.zoomIn());
    document.getElementById('map-zoom-out-btn')?.addEventListener('click', () => map && map.zoomOut());
    document.getElementById('map-recenter-btn')?.addEventListener('click', () => {
        if (map) {
            map.flyTo([9.0820, 8.6753], 6, { duration: 1.2 });
        }
    });

    // Layer toggle
    document.getElementById('map-layer-toggle-btn')?.addEventListener('click', () => {
        if (!map) return;
        activeLayerIndex = (activeLayerIndex + 1) % tileProviders.length;
        const prov = tileProviders[activeLayerIndex];
        if (currentTileLayer) map.removeLayer(currentTileLayer);
        currentTileLayer = L.tileLayer(prov.url, { maxZoom: 19, attribution: prov.attribution }).addTo(map);

        if (typeof window.pushAlertGraphNotification === 'function') {
            window.pushAlertGraphNotification({
                type: 'price',
                text: `<strong>Map Layer Switch:</strong> Map view changed to <strong>${prov.name} Layer</strong>`,
                tag: prov.name
            });
        }
    });

    // Sheet toggle
    const toggleSheet = () => mapSheet.classList.toggle('is-collapsed');
    document.getElementById('map-redesign-handle')?.addEventListener('click', toggleSheet);
    document.getElementById('map-redesign-collapse-btn')?.addEventListener('click', toggleSheet);
    document.getElementById('map-redesign-view-list-btn')?.addEventListener('click', () => mapSheet.classList.remove('is-collapsed'));

    document.getElementById('map-redesign-favorite-btn')?.addEventListener('click', event => {
        const button = event.currentTarget;
        button.classList.toggle('active');
        const icon = button.querySelector('i');
        if (icon) icon.className = button.classList.contains('active') ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    });

    document.getElementById('map-redesign-profile-btn')?.addEventListener('click', () => document.getElementById('nav-profile')?.click());
    document.getElementById('map-redesign-notification-btn')?.addEventListener('click', () => document.getElementById('notif-btn')?.click());

    // Directions and Ask Mama buttons
    document.getElementById('map-directions-btn')?.addEventListener('click', () => {
        const m = marketData[activeKey];
        if (!m) return;
        if (typeof window.pushAlertGraphNotification === 'function') {
            window.pushAlertGraphNotification({
                type: 'price',
                text: `<strong>Route Calculated:</strong> Fastest route to <strong>${m.title}</strong> (${m.distance}). Estimated arrival: ~22 mins`,
                tag: 'Directions',
                actionQuery: `Directions to ${m.title}`
            });
        }
    });

    document.getElementById('map-ask-mama-btn')?.addEventListener('click', () => {
        const m = marketData[activeKey];
        if (!m) return;
        document.getElementById('nav-home')?.click();
        if (typeof window.sendSuggestion === 'function') {
            window.sendSuggestion(`Where can I buy the cheapest commodities at ${m.title}?`);
        }
    });
});



// ─── Live Weather & Clock Capsule Engine ─────────────────────────────
(function initLiveWeatherAndClock() {
    const WMO_CONDITIONS = {
        0: { icon: '☀️', text: 'Clear Sky' },
        1: { icon: '🌤️', text: 'Mainly Clear' },
        2: { icon: '⛅', text: 'Partly Cloudy' },
        3: { icon: '☁️', text: 'Overcast' },
        45: { icon: '🌫️', text: 'Foggy' },
        51: { icon: '🌦️', text: 'Drizzle' },
        61: { icon: '🌧️', text: 'Rain' },
        80: { icon: '🌦️', text: 'Rain Showers' },
        95: { icon: '⛈️', text: 'Thunderstorm' }
    };

    const CITY_COORDS = { name: 'Kano, NG', lat: 12.0022, lon: 8.5919 };

    async function fetchWeather(lat, lon, cityName) {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Africa%2FLagos`;
            const res = await fetch(url);
            const data = await res.json();
            const curr = data.current || {};
            const code = curr.weather_code || 0;
            const cond = WMO_CONDITIONS[code] || { icon: '🌤️', text: 'Partly Cloudy' };

            const temp = Math.round(curr.temperature_2m || 29);
            const feels = Math.round(curr.apparent_temperature || temp + 2);
            const humidity = curr.relative_humidity_2m || 60;
            const wind = Math.round(curr.wind_speed_10m || 10);

            // Update main pill elements
            const iconEl = document.getElementById('weather-icon');
            const tempEl = document.getElementById('weather-temp');
            const cityEl = document.getElementById('weather-city');
            if (iconEl) iconEl.textContent = cond.icon;
            if (tempEl) tempEl.textContent = `${temp}°C`;
            if (cityEl) cityEl.textContent = cityName;

            // Update popover elements
            const popCity = document.getElementById('w-pop-city');
            const popDesc = document.getElementById('w-pop-desc');
            const popIcon = document.getElementById('w-pop-icon');
            const popTemp = document.getElementById('w-pop-temp');
            const popFeels = document.getElementById('w-pop-feels');
            const popHum = document.getElementById('w-pop-humidity');
            const popWind = document.getElementById('w-pop-wind');

            if (popCity) popCity.textContent = cityName;
            if (popDesc) popDesc.textContent = `${cond.text} · Real-time`;
            if (popIcon) popIcon.textContent = cond.icon;
            if (popTemp) popTemp.textContent = `${temp}°C`;
            if (popFeels) popFeels.textContent = `${feels}°C`;
            if (popHum) popHum.textContent = `${humidity}%`;
            if (popWind) popWind.textContent = `${wind} km/h`;

        } catch (e) {
            // Keep fallback values
        }
    }

    function updateClock() {
        const clockEl = document.getElementById('live-clock');
        if (!clockEl) return;
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    async function getCityFromCoords(lat, lon) {
        try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            const data = await res.json();
            const city = data.city || data.locality || data.principalSubdivision || 'Lagos';
            const country = data.countryCode || 'NG';
            return `${city}, ${country}`;
        } catch {
            return CITY_COORDS.name;
        }
    }

    function load(lat, lon, name) {
        if (!lat || !lon) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async pos => {
                        const cityName = await getCityFromCoords(pos.coords.latitude, pos.coords.longitude);
                        fetchWeather(pos.coords.latitude, pos.coords.longitude, cityName);
                    },
                    () => fetchWeather(CITY_COORDS.lat, CITY_COORDS.lon, CITY_COORDS.name)
                );
            } else {
                fetchWeather(CITY_COORDS.lat, CITY_COORDS.lon, CITY_COORDS.name);
            }
        } else {
            fetchWeather(lat, lon, name);
        }
    }

    // Weather Popover Toggle & City Buttons
    const pill = document.getElementById('weather-location-pill');
    const popover = document.getElementById('weather-popover-card');

    if (pill && popover) {
        pill.addEventListener('click', (e) => {
            e.stopPropagation();
            popover.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!popover.contains(e.target) && !pill.contains(e.target)) {
                popover.classList.remove('open');
            }
        });

        document.querySelectorAll('.w-city-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.w-city-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const city = btn.dataset.city;
                const lat = parseFloat(btn.dataset.lat);
                const lon = parseFloat(btn.dataset.lon);
                fetchWeather(lat, lon, city);

                // AlertGraph Location Switcher Alert Trigger
                if (typeof window.pushAlertGraphNotification === 'function') {
                    const hubName = city.split(',')[0].trim();
                    window.pushAlertGraphNotification({
                        type: 'price',
                        text: `<strong>Location Switched: ${hubName} Hub</strong> — Real-time price feeds active`,
                        tag: `${hubName} Market`,
                        actionQuery: `Cheapest market prices in ${hubName}`
                    });
                }
            });
        });
    }

    load();
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(load, 10 * 60 * 1000);

    // Automatic Silky-Smooth Auto-Slider for Snapshot Cards
    const snapshotGrid = document.getElementById('snapshot-grid');
    if (snapshotGrid) {
        let isHovered = false;
        let autoScrollSpeed = 0.6;

        snapshotGrid.addEventListener('mouseenter', () => { isHovered = true; });
        snapshotGrid.addEventListener('mouseleave', () => { isHovered = false; });
        snapshotGrid.addEventListener('touchstart', () => { isHovered = true; }, { passive: true });
        snapshotGrid.addEventListener('touchend', () => { isHovered = false; }, { passive: true });

        setInterval(() => {
            if (!isHovered && snapshotGrid) {
                snapshotGrid.scrollLeft += autoScrollSpeed;
                if (snapshotGrid.scrollLeft >= (snapshotGrid.scrollWidth - snapshotGrid.clientWidth - 2)) {
                    snapshotGrid.scrollLeft = 0;
                }
            }
        }, 25);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Dynamic Real-Time Hyperlocal Market Alerts Engine (Exact LGA & Market Specs)
    // ─────────────────────────────────────────────────────────────────────────
    let systemNotifications = [
        {
            id: 'notif_001',
            type: 'price',
            text: '📍 <strong>Mile 12 Market, Kosofe LGA, Lagos</strong><br>Rice (50kg, Mama Gold) dropped ₦81,000 → ₦73,000',
            time: '18m ago',
            tag: 'Kosofe LGA',
            read: false,
            actionQuery: 'Rice 50kg Mama Gold price today Mile 12 Lagos'
        },
        {
            id: 'notif_002',
            type: 'price',
            text: '📍 <strong>Oyingbo Market, Ebute Metta, Lagos</strong><br>Fresh tomatoes (basket) now ₦15,500 (Save ~₦2,700 vs Lagos avg)',
            time: '35m ago',
            tag: 'Ebute Metta',
            read: false,
            actionQuery: 'Tomatoes basket price today Oyingbo Lagos'
        },
        {
            id: 'notif_003',
            type: 'inbox',
            text: '📍 <strong>Ariaria Market, Aba South, Abia</strong><br>Dangote Cement 50kg increased by ₦1,200 (₦8,500 → ₦9,700)',
            time: '1h ago',
            tag: 'Aba South',
            read: false,
            actionQuery: 'Dangote Cement 50kg price today Ariaria Aba'
        },
        {
            id: 'notif_004',
            type: 'price',
            text: '📍 <strong>Bodija Market, Ibadan North LGA, Oyo</strong><br>Frozen Chicken (Carton) selling for ₦41,500 (Was ₦45,000)',
            time: '2h ago',
            tag: 'Ibadan North',
            read: true,
            actionQuery: 'Frozen Chicken carton price Bodija Ibadan'
        },
        {
            id: 'notif_005',
            type: 'inbox',
            text: '📍 <strong>Lokoja → Abuja Logistics Corridor</strong><br>Heavy truck delays detected (8–14h delay). Rice & Cement transport affected.',
            time: '3h ago',
            tag: 'Abuja Corridor',
            read: true,
            actionQuery: 'Logistics delay Rice Cement Lokoja Abuja'
        }
    ];

    // Real Alert Preferences State Engine
    let alertPreferences = {
        food: true,
        building: true,
        energy: true
    };

    try {
        const saved = localStorage.getItem('mama_alert_prefs');
        if (saved) alertPreferences = { ...alertPreferences, ...JSON.parse(saved) };
    } catch (e) {}

    window.pushAlertGraphNotification = function(notifObj) {
        if (notifObj && notifObj.category) {
            if (alertPreferences[notifObj.category] === false) return;
        }

        const newNotif = {
            id: `notif_${Date.now()}`,
            time: 'Just now',
            read: false,
            ...notifObj
        };
        systemNotifications.unshift(newNotif);
        renderNotifications();
    };

    function initAlertPreferencesEngine() {
        ['food', 'building', 'energy'].forEach(cat => {
            const toggleEl = document.getElementById(`pref-toggle-${cat}`);
            if (toggleEl) {
                toggleEl.checked = alertPreferences[cat] !== false;

                toggleEl.addEventListener('change', (e) => {
                    const isEnabled = e.target.checked;
                    alertPreferences[cat] = isEnabled;
                    try {
                        localStorage.setItem('mama_alert_prefs', JSON.stringify(alertPreferences));
                    } catch (err) {}

                    const catNames = {
                        food: 'Food & Agriculture',
                        building: 'Building Materials & Steel',
                        energy: 'Fuel & Energy'
                    };

                    const label = catNames[cat] || cat;
                    const statusText = isEnabled ? 'Activated (Real-Time)' : 'Muted';
                    const icon = isEnabled ? '🔔' : '🔕';

                    const newNotif = {
                        id: `notif_pref_${Date.now()}`,
                        type: 'inbox',
                        text: `${icon} <strong>Alert Preference Saved:</strong><br>${label} price shift notifications are now <strong>${statusText}</strong>.`,
                        tag: isEnabled ? 'Active' : 'Muted',
                        time: 'Just now',
                        read: false
                    };
                    systemNotifications.unshift(newNotif);
                    renderNotifications();
                });
            }
        });
    }

    let currentNotifFilter = 'all';

    function renderNotifications() {
        const notifBadge = document.querySelector('.notif-badge');
        const notifBtn = document.getElementById('notif-btn');
        const unreadCount = systemNotifications.filter(n => !n.read).length;

        if (notifBadge) {
            notifBadge.textContent = unreadCount;
            notifBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }
        if (notifBtn) {
            notifBtn.title = `${unreadCount} Unread Market Alerts`;
        }

        const countInboxBadge = document.getElementById('count-inbox-badge');
        if (countInboxBadge) {
            const inboxUnread = systemNotifications.filter(n => n.type === 'inbox' && !n.read).length;
            countInboxBadge.textContent = inboxUnread;
            countInboxBadge.style.display = inboxUnread > 0 ? 'inline-block' : 'none';
        }

        const container = document.getElementById('notif-list-container');
        if (!container) return;

        const filtered = currentNotifFilter === 'all'
            ? systemNotifications
            : (currentNotifFilter === 'inbox'
                ? systemNotifications.filter(n => n.type === 'inbox')
                : (currentNotifFilter === 'price'
                    ? systemNotifications.filter(n => n.type === 'price')
                    : systemNotifications.filter(n => n.read)));

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 28px 16px; color: #94a3b8;">
                    <i class="fa-regular fa-bell-slash" style="font-size: 1.5rem; margin-bottom: 6px;"></i>
                    <p style="font-size: 0.82rem; font-weight: 600;">No alerts in this view.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(n => `
            <div class="notif-row-item ${n.read ? '' : 'unread'}" data-id="${n.id}" data-query="${n.actionQuery || ''}">
                <div class="notif-row-content">
                    <div class="notif-row-text">
                        ${n.text}
                    </div>
                    <div class="notif-row-meta">
                        <span>${n.time}</span>
                        ${n.tag ? `• <span class="notif-tag-pill">${n.tag}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Row Click Handler
        container.querySelectorAll('.notif-row-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                const query = item.dataset.query;
                const target = systemNotifications.find(n => n.id === id);
                if (target) target.read = true;
                renderNotifications();

                const popover = document.getElementById('notif-popover');
                if (popover) popover.classList.remove('open');

                if (query && typeof sendSuggestion === 'function') {
                    sendSuggestion(query);
                }
            });
        });
    }

    // Toggle Popover Dropdown
    const notifBtn = document.getElementById('notif-btn');
    const notifPopover = document.getElementById('notif-popover');
    const markAllReadBtn = document.getElementById('mark-all-read-btn');

    if (notifBtn && notifPopover) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifPopover.classList.toggle('open');
            renderNotifications();
        });

        document.addEventListener('click', (e) => {
            if (!notifPopover.contains(e.target) && !notifBtn.contains(e.target)) {
                notifPopover.classList.remove('open');
            }
        });
    }

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            systemNotifications.forEach(n => n.read = true);
            renderNotifications();
        });
    }

    // Filter Tabs
    document.querySelectorAll('.pop-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.pop-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentNotifFilter = tab.dataset.filter || 'all';
            renderNotifications();
        });
    });

    // Background Ingestion of Real-Time Hyperlocal Commodity Alerts
    setInterval(() => {
        const dynamicEvents = [
            {
                type: 'price',
                text: '📍 <strong>Onitsha Main Market, Anambra</strong><br>Rice ₦72,800 · Groundnut Oil 25L ₦39,500',
                tag: 'Onitsha Main',
                actionQuery: 'Onitsha Main Market prices today'
            },
            {
                type: 'price',
                text: '📍 <strong>Sabon Gari Market, Kano</strong><br>Sugar back in stock after 6 days (₦82,000/bag)',
                tag: 'Kano Hub',
                actionQuery: 'Sugar bag price Sabon Gari Kano'
            },
            {
                type: 'inbox',
                text: '📍 <strong>Mile 12 Market Agent Award</strong><br>Report verified! +35 Points & ₦250 pending payout credited',
                tag: 'Scout Payout',
                actionQuery: ''
            },
            {
                type: 'price',
                text: '📍 <strong>Bodija Market AI Prediction</strong><br>Beans prices predicted to rise 8–11% over next 5 days (92% Confidence)',
                tag: 'AI Forecast',
                actionQuery: 'Beans price trend Bodija Ibadan'
            }
        ];
        const randomEvt = dynamicEvents[Math.floor(Math.random() * dynamicEvents.length)];
        const newNotif = {
            id: `notif_${Date.now()}`,
            ...randomEvt,
            time: 'Just now',
            read: false
        };
        systemNotifications.unshift(newNotif);
        renderNotifications();
    }, 30000);

    renderNotifications();
    initAlertPreferencesEngine();

    // ── Ultra-Premium Leaflet.js Real Interactive Map Engine ──
    let leafletMapInstance = null;
    let mapTileLayer = null;
    let mapMarkersGroup = [];
    let currentMapTileStyle = 'street';

    const MAP_TILES = {
        street: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    };

    const NIGERIA_MARKETS_DATA = [
        {
            id: 'dawanau',
            name: 'Dawanau Wholesale Market',
            city: 'Kano',
            state: 'Kano State',
            lat: 12.0833,
            lng: 8.4667,
            category: 'grain',
            price: '₦72,000',
            item: 'Rice 50kg (Mama Gold)',
            address: 'Katsina Road · Dawakin Tofa LGA, Kano State',
            icon: '🌾',
            img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
            distance: '12.4 km',
            rating: '4.9',
            reviews: '142 reports',
            status: 'Open now · Major Grain Hub'
        },
        {
            id: 'mile12',
            name: 'Mile 12 Perishable Market',
            city: 'Lagos',
            state: 'Lagos State',
            lat: 6.6083,
            lng: 3.3917,
            category: 'produce',
            price: '₦41,650',
            item: 'Fresh Tomatoes (Basket)',
            address: 'Ikorodu Road · Ketu-Mile 12, Lagos State',
            icon: '🍅',
            img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
            distance: '4.2 km',
            rating: '4.8',
            reviews: '210 reports',
            status: 'Open now · Direct Perishable Hub'
        },
        {
            id: 'sabongari',
            name: 'Sabon Gari Building Market',
            city: 'Kano',
            state: 'Kano State',
            lat: 12.0000,
            lng: 8.5167,
            category: 'building',
            price: '₦8,500',
            item: 'Dangote Cement 50kg',
            address: 'France Road · Fagge LGA, Kano State',
            icon: '🏗️',
            img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80',
            distance: '6.8 km',
            rating: '4.7',
            reviews: '94 reports',
            status: 'Open now · Building Materials'
        },
        {
            id: 'bodija',
            name: 'Bodija International Market',
            city: 'Ibadan',
            state: 'Oyo State',
            lat: 7.4333,
            lng: 3.9000,
            category: 'produce',
            price: '₦54,000',
            item: 'Refined Palm Oil 25L',
            address: 'Bodija-Secretariat Road · Ibadan, Oyo State',
            icon: '🌴',
            img: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=600&auto=format&fit=crop&q=80',
            distance: '18.1 km',
            rating: '4.6',
            reviews: '115 reports',
            status: 'Open now · Food Processing Hub'
        },
        {
            id: 'onitsha',
            name: 'Onitsha Main Wholesale Market',
            city: 'Onitsha',
            state: 'Anambra State',
            lat: 6.1500,
            lng: 6.7833,
            category: 'grain',
            price: '₦64,800',
            item: 'Golden Penny Flour 50kg',
            address: 'Commercial Avenue · Onitsha, Anambra State',
            icon: '🍞',
            img: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop&q=80',
            distance: '24.5 km',
            rating: '4.9',
            reviews: '185 reports',
            status: 'Open now · Regional Distribution'
        },
        {
            id: 'jos',
            name: 'Jos Grain & Vegetable Market',
            city: 'Jos',
            state: 'Plateau State',
            lat: 9.9167,
            lng: 8.9000,
            category: 'produce',
            price: '₦18,500',
            item: 'Irish Potatoes (Big Bag)',
            address: 'Terminus Market Road · Jos, Plateau State',
            icon: '🥔',
            img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
            distance: '35.0 km',
            rating: '4.8',
            reviews: '88 reports',
            status: 'Open now · Cold Climate Hub'
        },
        {
            id: 'wuse',
            name: 'Wuse Ultra-Modern Market',
            city: 'Abuja',
            state: 'FCT Abuja',
            lat: 9.0667,
            lng: 7.4667,
            category: 'all',
            price: '₦35,000',
            item: 'Benue Yam 10 Tubers',
            address: 'Wuse Zone 5 · Abuja, FCT',
            icon: '🍠',
            img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
            distance: '15.2 km',
            rating: '4.7',
            reviews: '160 reports',
            status: 'Open now · Central Capital Hub'
        },
        {
            id: 'ph_oil',
            name: 'Oil Mill Market Port Harcourt',
            city: 'Port Harcourt',
            state: 'Rivers State',
            lat: 4.8333,
            lng: 7.0333,
            category: 'energy',
            price: '₦650',
            item: 'PMS Petrol (Litre)',
            address: 'Eleme Junction · Port Harcourt, Rivers State',
            icon: '⛽',
            img: 'https://images.unsplash.com/photo-1527018601619-a508a2be00d6?w=600&auto=format&fit=crop&q=80',
            distance: '8.4 km',
            rating: '4.5',
            reviews: '130 reports',
            status: 'Open now · Coastal Energy Hub'
        },
        {
            id: 'alaba',
            name: 'Alaba International Tech Market',
            city: 'Lagos',
            state: 'Lagos State',
            lat: 6.4667,
            lng: 3.1833,
            category: 'tech',
            price: '₦245,000',
            item: 'Solar Generator 3.5kVA',
            address: 'Ojo Alaba Highway · Ojo LGA, Lagos State',
            icon: '💻',
            img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
            distance: '14.0 km',
            rating: '4.9',
            reviews: '310 reports',
            status: 'Open now · Electronics & Solar'
        }
    ];

    function createMarketLeafletPopupHtml(mkt) {
        return `
            <div class="map-popup-card">
                <div class="mpc-cover-box">
                    <img src="${mkt.img}" alt="${mkt.name}" class="mpc-cover-img" />
                    <span class="mpc-badge">🟢 Open for trading</span>
                </div>
                <div class="mpc-content">
                    <div class="mpc-price-row">
                        <strong class="mpc-price">${mkt.price}</strong>
                        <span class="mpc-item">${mkt.item}</span>
                    </div>
                    <h4 class="mpc-title">${mkt.name}</h4>
                    <p class="mpc-address">📍 ${mkt.address}</p>
                    <div class="mpc-meta">
                        <span><i class="fa-solid fa-star" style="color:#f59e0b;"></i> ${mkt.rating} (${mkt.reviews})</span>
                        <span><i class="fa-solid fa-location-arrow"></i> ${mkt.distance}</span>
                    </div>
                    <div class="mpc-actions">
                        <button onclick="window.askMamaAboutMarket('${mkt.name}', '${mkt.city}')" class="mpc-btn-primary"><i class="fa-solid fa-compass"></i> Directions</button>
                        <button onclick="window.askMamaAboutMarket('${mkt.name}', '${mkt.city}')" class="mpc-btn-outline"><i class="fa-solid fa-robot"></i> Ask Mama AI</button>
                    </div>
                </div>
            </div>
        `;
    }

    function initLeafletMapEngine() {
        const container = document.getElementById('leaflet-map-canvas');
        if (!container || typeof L === 'undefined') return;

        // Prevent duplicate initialization
        if (leafletMapInstance) {
            setTimeout(() => leafletMapInstance.invalidateSize(), 300);
            return;
        }

        // Create Leaflet Map instance centered over Nigeria
        leafletMapInstance = L.map('leaflet-map-canvas', {
            center: [9.0820, 8.6753],
            zoom: 6,
            zoomControl: false
        });

        // Add CartoDB Voyager tiles
        mapTileLayer = L.tileLayer(MAP_TILES.street, {
            attribution: '© OpenStreetMap contributors, CartoDB',
            maxZoom: 18,
            subdomains: 'abcd'
        }).addTo(leafletMapInstance);

        // Render all market markers on the map
        renderLeafletMarketMarkers(NIGERIA_MARKETS_DATA);

        // Wire Up Controls & Event Handlers
        bindMapControlEvents();

        // Start Live Pulsing Price Ticker Engine
        startLivePriceTicker();

        // Invalidate size to fit 2-column structural layout
        setTimeout(() => {
            if (leafletMapInstance) leafletMapInstance.invalidateSize();
        }, 300);
    }

    function renderLeafletMarketMarkers(marketsList) {
        if (!leafletMapInstance) return;

        // Clear existing markers
        mapMarkersGroup.forEach(m => leafletMapInstance.removeLayer(m.marker));
        mapMarkersGroup = [];

        marketsList.forEach(mkt => {
            const customHtml = `
                <div class="leaflet-custom-marker" data-id="${mkt.id}">
                    <span class="l-marker-icon">${mkt.icon}</span>
                    <div class="l-marker-pill">
                        <strong>${mkt.name.split(' ')[0]}</strong>
                        <span class="l-marker-price">${mkt.price}</span>
                    </div>
                </div>
            `;

            const customIcon = L.divIcon({
                html: customHtml,
                className: 'leaflet-marker-parent',
                iconSize: [120, 40],
                iconAnchor: [60, 40]
            });

            const marker = L.marker([mkt.lat, mkt.lng], { icon: customIcon }).addTo(leafletMapInstance);

            const popupContent = createMarketLeafletPopupHtml(mkt);
            marker.bindPopup(popupContent, {
                className: 'custom-leaflet-popup-wrapper',
                maxWidth: 290,
                minWidth: 260,
                closeButton: true,
                autoPan: false,
                offset: [0, -25]
            });

            marker.on('click', () => {
                selectLeafletMarket(mkt, false);
            });

            mapMarkersGroup.push({ id: mkt.id, marker: marker, data: mkt });
        });

        const countEl = document.getElementById('map-tracked-count');
        if (countEl) countEl.textContent = `${marketsList.length} markets tracked`;

        renderBottomCardsCarousel(marketsList);
        renderMapLeftSidebar(marketsList);
    }

    function renderMapLeftSidebar(marketsList) {
        const container = document.getElementById('mls-list-container');
        const countBadge = document.getElementById('mls-count-badge');
        if (countBadge) countBadge.textContent = `${marketsList.length} Hubs`;
        if (!container) return;

        container.innerHTML = marketsList.map(mkt => `
            <div class="mls-item" id="mls-item-${mkt.id}" onclick="selectMapMarketById('${mkt.id}')">
                <div class="mls-item-left">
                    <span class="mls-item-icon">${mkt.icon}</span>
                    <div class="mls-item-info">
                        <strong>${mkt.name}</strong>
                        <span>${mkt.city} · ${mkt.item.split('(')[0].trim()}</span>
                    </div>
                </div>
                <div class="mls-item-right">
                    <strong class="mls-item-price" id="mls-price-${mkt.id}">${mkt.price}</strong>
                    <span class="mls-item-trend ${mkt.trendDir || 'up'}">
                        <i class="fa-solid ${mkt.trendDir === 'down' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                        <span>${mkt.trendVal || 'Live'}</span>
                    </span>
                </div>
            </div>
        `).join('');
    }

    let priceTickerInterval = null;

    function startLivePriceTicker() {
        if (priceTickerInterval) clearInterval(priceTickerInterval);

        priceTickerInterval = setInterval(() => {
            if (!NIGERIA_MARKETS_DATA || NIGERIA_MARKETS_DATA.length === 0) return;

            const randomIndex = Math.floor(Math.random() * NIGERIA_MARKETS_DATA.length);
            const mkt = NIGERIA_MARKETS_DATA[randomIndex];
            if (!mkt) return;

            const rawNum = parseInt(mkt.price.replace(/[^0-9]/g, ''), 10);
            if (isNaN(rawNum) || rawNum < 100) return;

            const delta = (Math.floor(Math.random() * 7) - 3) * 500;
            if (delta === 0) return;

            const newNum = rawNum + delta;
            const formattedPrice = `₦${newNum.toLocaleString()}`;
            const isUp = delta > 0;

            mkt.price = formattedPrice;
            mkt.trendDir = isUp ? 'up' : 'down';
            mkt.trendVal = `${isUp ? '+' : ''}₦${Math.abs(delta).toLocaleString()}`;

            const priceEl = document.getElementById(`mls-price-${mkt.id}`);
            const itemEl = document.getElementById(`mls-item-${mkt.id}`);

            if (priceEl) priceEl.textContent = formattedPrice;

            if (itemEl) {
                const animClass = isUp ? 'price-pulse-up' : 'price-pulse-down';
                itemEl.classList.add(animClass);
                setTimeout(() => itemEl.classList.remove('price-pulse-up', 'price-pulse-down'), 1200);
            }

            const targetMarkerObj = mapMarkersGroup.find(item => item.id === mkt.id);
            if (targetMarkerObj && targetMarkerObj.marker) {
                const markerEl = targetMarkerObj.marker.getElement();
                if (markerEl) {
                    const priceSpan = markerEl.querySelector('.l-marker-price');
                    if (priceSpan) priceSpan.textContent = formattedPrice;
                    markerEl.classList.add(isUp ? 'price-pulse-up' : 'price-pulse-down');
                    setTimeout(() => markerEl.classList.remove('price-pulse-up', 'price-pulse-down'), 1200);
                }
            }

            if (typeof window.pushAlertGraphNotification === 'function' && Math.random() > 0.6) {
                window.pushAlertGraphNotification({
                    type: 'price',
                    text: `⚡ <strong>Live Price Discovery: ${mkt.name}</strong><br>${mkt.item}: Now <strong>${formattedPrice}</strong> (${mkt.trendVal})`,
                    tag: mkt.city,
                    actionQuery: `${mkt.name} live prices`
                });
            }
        }, 7000);
    }

    function renderBottomCardsCarousel(marketsList) {
        const container = document.getElementById('map-cards-carousel');
        if (!container) return;

        container.innerHTML = marketsList.map(mkt => `
            <div class="mcc-card" onclick="selectMapMarketById('${mkt.id}')">
                <div class="mcc-img-box">
                    <img src="${mkt.img}" alt="${mkt.name}" />
                    <span class="mcc-badge">${mkt.icon}</span>
                </div>
                <div class="mcc-info">
                    <div class="mcc-price-row">
                        <strong>${mkt.price}</strong>
                        <span>${mkt.item.split('(')[0].trim()}</span>
                    </div>
                    <h4>${mkt.name}</h4>
                    <p>📍 ${mkt.city}, ${mkt.state.split(' ')[0]}</p>
                </div>
            </div>
        `).join('');
    }

    function selectLeafletMarket(mkt, zoomMap = false) {
        if (!mkt) return;

        // 1. Pop out Market Details Sheet / Modal Card (#map-redesign-card)
        const titleEl = document.getElementById('map-redesign-title');
        const addrEl = document.getElementById('map-redesign-address');
        const priceEl = document.getElementById('map-redesign-price');
        const priceSubEl = document.getElementById('map-redesign-price-sub');
        const distEl = document.getElementById('map-redesign-distance');
        const ratingEl = document.getElementById('map-redesign-rating');
        const reviewsEl = document.getElementById('map-redesign-reviews');
        const statusEl = document.getElementById('map-redesign-status');

        if (titleEl) titleEl.textContent = mkt.name;
        if (addrEl) addrEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${mkt.address}`;
        if (priceEl) priceEl.textContent = mkt.price;
        if (priceSubEl) priceSubEl.textContent = mkt.item;
        if (distEl) distEl.textContent = mkt.distance;
        if (ratingEl) ratingEl.textContent = mkt.rating;
        if (reviewsEl) reviewsEl.textContent = mkt.reviews;
        if (statusEl) statusEl.textContent = mkt.status;

        const cardEl = document.getElementById('map-redesign-card');
        if (cardEl) cardEl.classList.add('open');

        renderNearbyMarketsList(mkt.id);

        // 2. Render Market Details directly inside the Right Sidebar Panel!
        renderSidebarMarketDetail(mkt);

        // 3. Highlight active item in sidebar list if present
        document.querySelectorAll('.mls-item').forEach(el => el.classList.remove('active'));
        const activeItem = document.getElementById(`mls-item-${mkt.id}`);
        if (activeItem) activeItem.classList.add('active');

        // 4. Only zoom/pan map camera if explicitly requested (default false keeps map zoom 100% stable!)
        if (zoomMap && leafletMapInstance) {
            leafletMapInstance.flyTo([mkt.lat, mkt.lng], 13, { duration: 1.2 });
            const targetObj = mapMarkersGroup.find(item => item.id === mkt.id);
            if (targetObj && targetObj.marker) {
                targetObj.marker.openPopup();
            }
        }
    }

    function renderSidebarMarketDetail(mkt) {
        const sidebar = document.getElementById('map-right-sidebar');
        if (!sidebar) return;

        const others = NIGERIA_MARKETS_DATA.filter(m => m.id !== mkt.id).slice(0, 3);
        const nearbyHtml = others.map(m => `
            <div class="mls-nearby-item" onclick="selectMapMarketById('${m.id}')">
                <span class="mni-icon">${m.icon}</span>
                <div class="mni-info">
                    <strong>${m.name}</strong>
                    <span>${m.city} · ${m.distance}</span>
                </div>
                <strong class="mni-price">${m.price}</strong>
            </div>
        `).join('');

        sidebar.innerHTML = `
            <div class="mls-detail-header">
                <button class="mls-back-btn" onclick="window.resetSidebarToMarketList()"><i class="fa-solid fa-arrow-left"></i> Back to Hubs</button>
                <span class="mls-count-badge">Active Hub</span>
            </div>
            <div class="mls-detail-body">
                <div class="mls-cover-box">
                    <img src="${mkt.img}" alt="${mkt.name}" />
                    <span class="mls-status-tag">🟢 ${mkt.status || 'Open now'}</span>
                </div>
                <div class="mls-detail-content">
                    <h3 class="mls-detail-title">${mkt.name}</h3>
                    <p class="mls-detail-addr"><i class="fa-solid fa-location-dot"></i> ${mkt.address}</p>

                    <div class="mls-price-card">
                        <div class="mls-pc-row">
                            <div>
                                <span class="mls-pc-label">Best Price Today</span>
                                <h2 class="mls-pc-price">${mkt.price}</h2>
                                <span class="mls-pc-sub">${mkt.item}</span>
                            </div>
                            <div class="mls-pc-trend ${mkt.trendDir || 'up'}">
                                <i class="fa-solid ${mkt.trendDir === 'down' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                                <span>${mkt.trendVal || 'Verified'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="mls-stats-grid">
                        <div class="mls-stat-box">
                            <span>Distance</span>
                            <strong>${mkt.distance}</strong>
                        </div>
                        <div class="mls-stat-box">
                            <span>Rating</span>
                            <strong>⭐ ${mkt.rating}</strong>
                        </div>
                    </div>

                    <div class="mls-action-buttons">
                        <button onclick="window.askMamaAboutMarket('${mkt.name}', '${mkt.city}')" class="mls-btn-primary"><i class="fa-solid fa-compass"></i> Directions</button>
                        <button onclick="window.askMamaAboutMarket('${mkt.name}', '${mkt.city}')" class="mls-btn-outline"><i class="fa-solid fa-robot"></i> Ask Mama AI</button>
                    </div>

                    <div class="mls-nearby-section">
                        <h4>Nearby Hubs</h4>
                        <div class="mls-nearby-list">
                            ${nearbyHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    window.resetSidebarToMarketList = function() {
        const sidebar = document.getElementById('map-right-sidebar');
        if (!sidebar) return;

        sidebar.innerHTML = `
            <div class="mls-header" id="mls-header-section">
                <div class="mls-title-row">
                    <div>
                        <span class="mls-kicker"><span class="mls-live-pulse"></span> LIVE PRICE FEEDS</span>
                        <h3>Market Intelligence</h3>
                    </div>
                    <span class="mls-count-badge" id="mls-count-badge">${NIGERIA_MARKETS_DATA.length} Hubs</span>
                </div>
                <div class="mls-filter-mini-pills">
                    <button class="mls-pill active" data-cat="all">All</button>
                    <button class="mls-pill" data-cat="grain">Grains</button>
                    <button class="mls-pill" data-cat="produce">Produce</button>
                    <button class="mls-pill" data-cat="building">Building</button>
                </div>
            </div>
            <div class="mls-body" id="mls-list-container">
            </div>
        `;

        renderMapLeftSidebar(NIGERIA_MARKETS_DATA);

        // Rebind mini filter pills
        document.querySelectorAll('.mls-filter-mini-pills .mls-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mls-filter-mini-pills .mls-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const cat = btn.dataset.cat || 'all';
                const filtered = cat === 'all'
                    ? NIGERIA_MARKETS_DATA
                    : NIGERIA_MARKETS_DATA.filter(m => m.category === cat);

                renderMapLeftSidebar(filtered);
                renderLeafletMarketMarkers(filtered);
            });
        });
    };

    function renderNearbyMarketsList(currentId) {
        const listContainer = document.getElementById('map-nearby-list-container');
        if (!listContainer) return;

        const others = NIGERIA_MARKETS_DATA.filter(m => m.id !== currentId).slice(0, 3);
        listContainer.innerHTML = others.map(m => `
            <div class="nearby-market-item" onclick="selectMapMarketById('${m.id}')">
                <span class="nmi-icon">${m.icon}</span>
                <div class="nmi-info">
                    <strong>${m.name}</strong>
                    <span>${m.address}</span>
                </div>
                <div class="nmi-price">
                    <strong>${m.price}</strong>
                    <small>${m.distance}</small>
                </div>
            </div>
        `).join('');
    }

    window.selectMapMarketById = function(id) {
        const mkt = NIGERIA_MARKETS_DATA.find(m => m.id === id);
        if (mkt) selectLeafletMarket(mkt);
    };

    function bindMapControlEvents() {
        // Mobile Back Arrow Button
        const mobileBackBtn = document.getElementById('map-mobile-back-btn');
        if (mobileBackBtn) {
            mobileBackBtn.onclick = () => {
                const homeNav = document.getElementById('nav-home');
                if (homeNav) homeNav.click();
            };
        }

        // Search Trigger Card & Action -> Opens Search Modal
        const searchTriggerCard = document.getElementById('map-search-trigger-card');
        const mobileSearchTriggerBtn = document.getElementById('map-mobile-search-trigger-btn');
        const searchModal = document.getElementById('map-search-modal');
        const searchModalClose = document.getElementById('map-modal-close-btn');
        const modalSearchInput = document.getElementById('map-modal-search-input');

        const openSearchModal = () => {
            if (searchModal) {
                searchModal.style.display = 'flex';
                if (modalSearchInput) {
                    modalSearchInput.value = '';
                    setTimeout(() => modalSearchInput.focus(), 100);
                }
                renderModalSearchResults(NIGERIA_MARKETS_DATA);
            }
        };

        const closeSearchModal = () => {
            if (searchModal) searchModal.style.display = 'none';
        };

        if (searchTriggerCard) searchTriggerCard.onclick = openSearchModal;
        if (mobileSearchTriggerBtn) mobileSearchTriggerBtn.onclick = openSearchModal;
        if (searchModalClose) searchModalClose.onclick = closeSearchModal;

        if (searchModal) {
            searchModal.onclick = (e) => {
                if (e.target === searchModal) closeSearchModal();
            };
        }

        // Close / Dismiss Selected Market Sheet Card
        const collapseBtn = document.getElementById('map-redesign-collapse-btn');
        const dragHandle = document.getElementById('map-redesign-handle');
        const sheetCard = document.getElementById('map-redesign-card');

        const closeSheetCard = () => {
            if (sheetCard) sheetCard.classList.remove('open');
        };

        if (collapseBtn) collapseBtn.onclick = closeSheetCard;
        if (dragHandle) dragHandle.onclick = closeSheetCard;

        // Zoom in & out
        const zoomIn = document.getElementById('map-zoom-in-btn');
        const zoomOut = document.getElementById('map-zoom-out-btn');
        if (zoomIn) zoomIn.onclick = () => leafletMapInstance && leafletMapInstance.zoomIn();
        if (zoomOut) zoomOut.onclick = () => leafletMapInstance && leafletMapInstance.zoomOut();

        // Recenter on Nigeria
        const recenterBtn = document.getElementById('map-recenter-btn');
        if (recenterBtn) {
            recenterBtn.onclick = () => {
                if (leafletMapInstance) leafletMapInstance.flyTo([9.0820, 8.6753], 6);
            };
        }

        // Left Sidebar Mini Category Filter Pills
        document.querySelectorAll('.mls-filter-mini-pills .mls-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mls-filter-mini-pills .mls-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const cat = btn.dataset.cat || 'all';
                const filtered = cat === 'all'
                    ? NIGERIA_MARKETS_DATA
                    : NIGERIA_MARKETS_DATA.filter(m => m.category === cat);

                renderMapLeftSidebar(filtered);
                renderLeafletMarketMarkers(filtered);
            });
        });

        // Layer Toggle (Street ➔ Satellite ➔ Dark)
        const layerBtn = document.getElementById('map-layer-toggle-btn');
        if (layerBtn) {
            layerBtn.onclick = () => {
                if (!mapTileLayer || !leafletMapInstance) return;

                if (currentMapTileStyle === 'street') {
                    currentMapTileStyle = 'satellite';
                    mapTileLayer.setUrl(MAP_TILES.satellite);
                } else if (currentMapTileStyle === 'satellite') {
                    currentMapTileStyle = 'dark';
                    mapTileLayer.setUrl(MAP_TILES.dark);
                } else {
                    currentMapTileStyle = 'street';
                    mapTileLayer.setUrl(MAP_TILES.street);
                }
            };
        }

        // Category Pills Filter inside Modal
        document.querySelectorAll('.map-modal-pills .map-pill-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.map-modal-pills .map-pill-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const cat = btn.dataset.category || 'all';
                const filtered = cat === 'all'
                    ? NIGERIA_MARKETS_DATA
                    : NIGERIA_MARKETS_DATA.filter(m => m.category === cat || cat === 'all');

                renderLeafletMarketMarkers(filtered);
                renderModalSearchResults(filtered);
            });
        });

        // Search Modal Input Filtering
        if (modalSearchInput) {
            modalSearchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const matches = !query
                    ? NIGERIA_MARKETS_DATA
                    : NIGERIA_MARKETS_DATA.filter(m =>
                        m.name.toLowerCase().includes(query) ||
                        m.city.toLowerCase().includes(query) ||
                        m.item.toLowerCase().includes(query) ||
                        m.state.toLowerCase().includes(query)
                    );

                renderLeafletMarketMarkers(matches);
                renderModalSearchResults(matches);
            });
        }

        // Directions Button Action
        const directionsBtn = document.getElementById('map-directions-btn');
        if (directionsBtn) {
            directionsBtn.onclick = () => {
                if (typeof window.askMamaAboutMarket === 'function') {
                    const currentTitle = document.getElementById('map-redesign-title').textContent;
                    window.askMamaAboutMarket(currentTitle, 'Directions & Route ETA');
                }
            };
        }

        // Ask Mama AI Button Action
        const askMamaBtn = document.getElementById('map-ask-mama-btn');
        if (askMamaBtn) {
            askMamaBtn.onclick = () => {
                if (typeof window.askMamaAboutMarket === 'function') {
                    const currentTitle = document.getElementById('map-redesign-title').textContent;
                    window.askMamaAboutMarket(currentTitle, 'Price Analysis');
                }
            };
        }
    }

    function renderModalSearchResults(list) {
        const container = document.getElementById('map-modal-results-container');
        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = `<div style="padding: 14px; text-align: center; color: #94a3b8; font-size: 0.85rem;">No markets or commodities found</div>`;
            return;
        }

        container.innerHTML = list.map(m => `
            <div class="msm-result-item" onclick="selectMarketFromModal('${m.id}')">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.2rem;">${m.icon}</span>
                    <div>
                        <strong style="font-size: 0.82rem; color: #0f172a; display: block;">${m.name}</strong>
                        <span style="font-size: 0.72rem; color: #64748b;">${m.address}</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <strong style="font-size: 0.85rem; color: #16a34a; font-weight: 800; display: block;">${m.price}</strong>
                    <small style="font-size: 0.68rem; color: #94a3b8;">${m.item}</small>
                </div>
            </div>
        `).join('');
    }

    window.selectMarketFromModal = function(id) {
        const mkt = NIGERIA_MARKETS_DATA.find(m => m.id === id);
        if (mkt) {
            selectLeafletMarket(mkt);
            const searchModal = document.getElementById('map-search-modal');
            if (searchModal) searchModal.style.display = 'none';
        }
    };

    // Initialize Map when navigating to #page-map route
    const observer = new MutationObserver(() => {
        const pageMap = document.getElementById('page-map');
        if (pageMap && pageMap.classList.contains('active')) {
            initLeafletMapEngine();
        }
    });

    const pageMapEl = document.getElementById('page-map');
    if (pageMapEl) {
        observer.observe(pageMapEl, { attributes: true, attributeFilter: ['class'] });
    }

    // Trigger initial check
    if (pageMapEl && pageMapEl.classList.contains('active')) {
        initLeafletMapEngine();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Interactive Payout / Cashout Action (Withdrawing & Success States)
    // ─────────────────────────────────────────────────────────────────────────
    function handleCashoutAction(btnElement) {
        if (!btnElement || btnElement.disabled) return;

        const originalHtml = btnElement.innerHTML;
        btnElement.disabled = true;

        // 1. Withdrawing / Transferring State (Loading Spinner)
        btnElement.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Transferring ₦148,500...`;

        setTimeout(() => {
            // 2. Success State
            btnElement.innerHTML = `<i class="fa-solid fa-circle-check"></i> ₦148,500 Sent to OPay!`;
            btnElement.style.background = '#15803d';

            // Update Wallet Balance to ₦0
            const walletValEl = document.getElementById('prof-wallet-val');
            if (walletValEl) walletValEl.textContent = '₦0';

            // Push Instant Notification
            if (typeof window.pushAlertGraphNotification === 'function') {
                window.pushAlertGraphNotification({
                    type: 'inbox',
                    text: '⚡ <strong>Instant Cashout Successful!</strong><br>₦148,500 credited to OPay Digital Bank (Account: 703****892)',
                    tag: 'Payout OK',
                    actionQuery: ''
                });
            }

            // Reset state after 4 seconds
            setTimeout(() => {
                btnElement.disabled = false;
                btnElement.style.background = '';
                btnElement.innerHTML = originalHtml;
            }, 4000);
        }, 1800);
    }

    const cashoutBtn = document.getElementById('cashout-now-btn');
    if (cashoutBtn) {
        cashoutBtn.addEventListener('click', () => handleCashoutAction(cashoutBtn));
    }

    const profPayoutHeroBtn = document.getElementById('prof-payout-btn');
    if (profPayoutHeroBtn) {
        profPayoutHeroBtn.addEventListener('click', () => {
            const payoutTabBtn = document.querySelector('.prof-tab-btn[data-prof-tab="payouts"]');
            if (payoutTabBtn) payoutTabBtn.click();
            handleCashoutAction(profPayoutHeroBtn);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Real Agent Registration & Persistent State Engine
    // ─────────────────────────────────────────────────────────────────────────
    window.activateUserAgentStatus = function() {
        try {
            localStorage.setItem('mama_user_is_agent', 'true');
        } catch (e) {}

        const statusBadge = document.getElementById('prof-status-badge');
        const levelBadge = document.getElementById('prof-hero-level');
        const payoutBtn = document.getElementById('prof-payout-btn');
        const agentSub = document.getElementById('prof-agent-sub');
        const walletVal = document.getElementById('prof-wallet-val');
        const agentToggleBtn = document.getElementById('prof-agent-toggle-btn');

        if (statusBadge) {
            statusBadge.innerHTML = `<span class="live-dot"></span> Active Scout Agent`;
            statusBadge.style.background = '#f0fdf4';
            statusBadge.style.color = '#166534';
            statusBadge.style.borderColor = '#bbf7d0';
        }

        if (levelBadge) levelBadge.textContent = 'Level 1 Field Scout Agent';
        if (payoutBtn) payoutBtn.style.display = 'inline-flex';
        if (agentSub) agentSub.textContent = 'Available Balance';
        if (walletVal) walletVal.style.color = '#15803d';
        if (agentToggleBtn) agentToggleBtn.style.display = 'none';

        if (typeof window.pushAlertGraphNotification === 'function') {
            window.pushAlertGraphNotification({
                type: 'inbox',
                text: '🎉 <strong>Agent Scout Activated!</strong><br>You are now a recognized Field Agent. Every price report you submit earns instant cash & points.',
                tag: 'Agent Scout',
                actionQuery: ''
            });
        }
    };

    // Check saved Agent state on load
    try {
        if (localStorage.getItem('mama_user_is_agent') === 'true') {
            window.activateUserAgentStatus();
        }
    } catch (e) {}

    // Modal Triggers & Controls
    window.openAgentModal = function() {
        const modal = document.getElementById('agent-onboarding-modal');
        if (modal) {
            modal.classList.add('open');
            modal.style.display = 'flex';
        }
    };

    window.closeAgentModal = function() {
        const modal = document.getElementById('agent-onboarding-modal');
        if (modal) {
            modal.classList.remove('open');
            modal.style.display = 'none';
        }
    };

    const agentOnboardModal = document.getElementById('agent-onboarding-modal');
    const closeAgentModalBtn = document.getElementById('close-agent-modal');
    const modalStartReportBtn = document.getElementById('modal-start-report-btn');
    const agentToggleBtn = document.getElementById('prof-agent-toggle-btn');

    if (agentToggleBtn) {
        agentToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.openAgentModal();
        });
    }

    if (closeAgentModalBtn) {
        closeAgentModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.closeAgentModal();
        });
    }

    if (agentOnboardModal) {
        agentOnboardModal.addEventListener('click', (e) => {
            if (e.target === agentOnboardModal) window.closeAgentModal();
        });
    }

    if (modalStartReportBtn) {
        modalStartReportBtn.addEventListener('click', () => {
            window.activateUserAgentStatus();
            window.closeAgentModal();
            if (typeof window.sendSuggestion === 'function') {
                window.sendSuggestion('I want to submit a market price report for my local market.');
            }
        });
    }
});
