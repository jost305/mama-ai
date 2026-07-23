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

    if (sidebar) sidebar.classList.add('open');

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

        // Update URL hash without scroll jump
        const hashKey = (pageKey === 'agent') ? 'agents' : (pageKey === 'library' ? 'watchlist' : pageKey);
        if (window.location.hash !== `#${hashKey}`) {
            history.replaceState(null, '', `#${hashKey}`);
        }
    }

    function handleHashRouting() {
        const hash = window.location.hash.replace('#', '').toLowerCase();
        if (!hash) return;
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

    // Agent Report Form Submission
    const agentReportForm = document.getElementById('agent-report-form');
    if (agentReportForm) {
        agentReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const commodity = document.getElementById('report-commodity').value;
            const market = document.getElementById('report-market').value;
            const price = document.getElementById('report-price').value;
            if (!price) return;
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

    if (waAuthBtn && waAuthModal) {
        waAuthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            generateWaLoginSession();
            waAuthModal.classList.add('open');
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
            const phone = phoneInput ? phoneInput.value : '+234 801 234 5678';
            currentWaSession = { loginCode: 'DIRECT_AUTH', status: 'pending' };
            completeWaAuthentication(phone, 'Amina Yusuf');
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

    // ── Dynamic Market Scouts Management & Real-time Filter Engine ──
    const scoutsData = [
        { id: 'SC-0001', name: 'Maryam Abubakar', phone: '0803 123 4567', level: 'Market Captain', markets: ['Mile 12', 'Balogun', 'Oyingbo'], reports: 482, trustScore: 98, trustLabel: 'Excellent', earnings: 84750, status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80' },
        { id: 'SC-0002', name: 'Chinedu Okafor', phone: '0812 345 6789', level: 'Senior Scout', markets: ['Onitsha Main', 'Ariaria'], reports: 356, trustScore: 94, trustLabel: 'Excellent', earnings: 61200, status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80' },
        { id: 'SC-0003', name: 'Aisha Bello', phone: '0706 789 0123', level: 'Senior Scout', markets: ['Computer Village', 'Ikeja'], reports: 298, trustScore: 92, trustLabel: 'Excellent', earnings: 48600, status: 'Active', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80' },
        { id: 'SC-0004', name: 'Emeka Nwosu', phone: '0810 222 3344', level: 'Scout', markets: ['Mile 12'], reports: 215, trustScore: 90, trustLabel: 'Great', earnings: 31450, status: 'Active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80' },
        { id: 'SC-0005', name: 'Grace Adeyemi', phone: '0901 556 7788', level: 'Scout', markets: ['Bodija', 'Dugbe', 'Sango'], reports: 184, trustScore: 88, trustLabel: 'Great', earnings: 26200, status: 'Active', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80' },
        { id: 'SC-0006', name: 'Ibrahim Musa', phone: '0815 667 8899', level: 'Explorer', markets: ['Dawanau', 'Kano Main'], reports: 76, trustScore: 76, trustLabel: 'Good', earnings: 9800, status: 'Active', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80' },
        { id: 'SC-0007', name: 'Patience Johnson', phone: '0702 334 5678', level: 'Explorer', markets: ['Computer Village'], reports: 42, trustScore: 68, trustLabel: 'Fair', earnings: 5250, status: 'Inactive', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&auto=format&fit=crop&q=80' },
        { id: 'SC-0008', name: 'David Williams', phone: '0807 889 9900', level: 'Explorer', markets: ['Mile 12'], reports: 28, trustScore: 64, trustLabel: 'Fair', earnings: 3500, status: 'Inactive', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&auto=format&fit=crop&q=80' }
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
            case 'Senior Scout': return 'lvl-senior';
            case 'Scout': return 'lvl-scout';
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
        alert(`👤 Scout Details:\n\nName: ${s.name}\nPhone: ${maskPhoneNumber(s.phone)}\nLevel: ${s.level}\nMarkets: ${s.markets.join(', ')}\nReports: ${s.reports}\nTrust Score: ${s.trustScore}% (${s.trustLabel})\nTotal Earnings: ₦${s.earnings.toLocaleString()}`);
    };

    window.triggerScoutActions = function(id) {
        const s = scoutsData.find(x => x.id === id);
        if (!s) return;
        alert(`⚡ Quick Actions for ${s.name}:\n\n1. Send WhatsApp Message (${maskPhoneNumber(s.phone)})\n2. Assign Market Mission\n3. Toggle Scout Status (Current: ${s.status})`);
    };

    function renderScoutsTable(list) {
        if (!scoutsTableBody) return;
        if (list.length === 0) {
            scoutsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 32px 16px; color: #64748b;">
                        <i class="fa-solid fa-user-slash" style="font-size: 1.8rem; margin-bottom: 8px; color: #cbd5e1; display: block;"></i>
                        <strong>No Market Scouts found matching your filters.</strong>
                        <p style="font-size: 0.76rem; margin-top: 4px;">Try adjusting your search query, status, level, or market filter.</p>
                    </td>
                </tr>
            `;
            return;
        }

        scoutsTableBody.innerHTML = list.map(s => `
            <tr>
                <td>
                    <div class="scout-user-cell">
                        <img src="${s.avatar}" alt="${s.name}" class="scout-avatar" />
                        <div>
                            <strong class="scout-name">${s.name}</strong>
                            <span class="scout-meta">${maskPhoneNumber(s.phone)} · ${s.id}</span>
                        </div>
                    </div>
                </td>
                <td><span class="scout-lvl-badge ${getLevelBadgeClass(s.level)}">${s.level}</span></td>
                <td><span class="scout-markets-text">${s.markets.join(', ')}</span></td>
                <td><strong class="scout-stat-num">${s.reports.toLocaleString()}</strong></td>
                <td>
                    <div class="trust-score-pill ${getTrustScoreClass(s.trustScore)}">
                        <i class="fa-solid fa-shield"></i> <strong>${s.trustScore}%</strong> <small>${s.trustLabel}</small>
                    </div>
                </td>
                <td><strong class="scout-earning-val">₦${s.earnings.toLocaleString()}</strong></td>
                <td><span class="scout-status-badge ${s.status === 'Active' ? 'status-active' : 'status-inactive'}">${s.status}</span></td>
                <td style="text-align: right;">
                    <div class="table-action-btns">
                        <button class="tbl-act-btn" onclick="viewScoutDetails('${s.id}')" title="View Scout Profile"><i class="fa-regular fa-eye"></i></button>
                        <button class="tbl-act-btn" onclick="triggerScoutActions('${s.id}')" title="Scout Actions"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
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
        const totalPaid = filtered.reduce((acc, s) => acc + s.earnings, 0);
        const avgTrust = filtered.length ? Math.round(filtered.reduce((acc, s) => acc + s.trustScore, 0) / filtered.length) : 0;

        if (kpiTotalEl) kpiTotalEl.textContent = filtered.length.toLocaleString();
        if (kpiActiveEl) kpiActiveEl.textContent = activeCount.toLocaleString();
        if (kpiReportsEl) kpiReportsEl.textContent = totalReports.toLocaleString();
        if (kpiPaidEl) kpiPaidEl.textContent = `₦${totalPaid.toLocaleString()}`;
        if (kpiTrustEl) kpiTrustEl.textContent = `${avgTrust}%`;

        if (scoutsCountLabel) {
            scoutsCountLabel.textContent = `Showing ${filtered.length > 0 ? 1 : 0} to ${filtered.length} of ${scoutsData.length} scouts`;
        }

        renderScoutsTable(filtered);
    }

    if (scoutSearchInput) scoutSearchInput.addEventListener('input', updateScoutsDashboard);
    if (scoutStatusFilter) scoutStatusFilter.addEventListener('change', updateScoutsDashboard);
    if (scoutLevelFilter) scoutLevelFilter.addEventListener('change', updateScoutsDashboard);
    if (scoutMarketFilter) scoutMarketFilter.addEventListener('change', updateScoutsDashboard);

    if (scoutMoreFiltersBtn) {
        scoutMoreFiltersBtn.addEventListener('click', () => {
            alert("🔍 Extended Scout Filters:\n\n- Filter by Trust Score Range (60% - 100%)\n- Filter by Monthly Earnings Range\n- Filter by Region (Lagos, Kano, Oyo, Anambra, Rivers)");
        });
    }

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

    function updateAuthUIState() {
        const token = localStorage.getItem('mamaprice_jwt_token');
        const userJson = localStorage.getItem('mamaprice_auth_user');

        const navProfile = document.getElementById('nav-profile');
        const mNavProfile = document.getElementById('m-nav-profile');
        const userProfileBtn = document.getElementById('user-profile-btn');

        if (token && userJson) {
            const user = JSON.parse(userJson);
            if (waAuthBtn) {
                waAuthBtn.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #16a34a;"></i> <span>${user.name || 'Sign in'}</span>`;
                waAuthBtn.style.background = '#ffffff';
                waAuthBtn.style.color = '#0f172a';
                waAuthBtn.style.border = '1px solid #cbd5e1';
                waAuthBtn.title = `Logged in (${user.phone})`;
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
                waAuthBtn.title = `Sign in via WhatsApp Reverse Authentication`;
            }
            if (navProfile) navProfile.style.display = 'none';
            if (mNavProfile) mNavProfile.style.display = 'none';
            if (userProfileBtn) userProfileBtn.style.display = 'none';
        }
    }
    updateAuthUIState();

    function completeWaAuthentication(phoneNumber = '+234 801 **** 578', userName = 'Amina Yusuf') {
        if (!currentWaSession) return;
        currentWaSession.status = 'authenticated';
        const dummyJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ phone: phoneNumber, user: userName, exp: Date.now() + 900000 }))}.signature`;
        localStorage.setItem('mamaprice_jwt_token', dummyJwt);
        localStorage.setItem('mamaprice_auth_user', JSON.stringify({ name: userName, phone: phoneNumber }));

        updateAuthUIState();

        if (waStatusText) waStatusText.innerHTML = '✅ <span style="color: #15803d;">Authenticated Successfully! Redirecting to Dashboard...</span>';

        setTimeout(() => {
            if (waAuthModal) waAuthModal.classList.remove('open');
            const pageProfile = document.getElementById('page-profile');
            const navProfile = document.getElementById('nav-profile');
            if (pageProfile && typeof switchView === 'function') {
                switchView(navProfile, pageProfile);
            }
            alert(`🎉 Welcome to your Dashboard, ${userName}!\n\nYou are logged in via WhatsApp Reverse Auth (${phoneNumber}). Saved to persistent session.`);
        }, 800);
    }

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

    window.pushAlertGraphNotification = function(notifObj) {
        const newNotif = {
            id: `notif_${Date.now()}`,
            time: 'Just now',
            read: false,
            ...notifObj
        };
        systemNotifications.unshift(newNotif);
        renderNotifications();
    };

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
})();
