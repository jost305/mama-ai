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
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));

        if (targetNav) targetNav.classList.add('active');
        targetPage.classList.add('active');

        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    }

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

    // Mobile Bottom Nav Listeners
    if (mNavHome) mNavHome.addEventListener('click', (e) => { e.preventDefault(); switchView(mNavHome, pageHome); });
    if (mNavPrices) mNavPrices.addEventListener('click', (e) => { e.preventDefault(); switchView(mNavPrices, pagePrices); });
    if (mNavMarkets) mNavMarkets.addEventListener('click', (e) => { e.preventDefault(); switchView(mNavMarkets, pageMarkets); });
    if (mNavMap) mNavMap.addEventListener('click', (e) => { e.preventDefault(); switchView(mNavMap, pageMap); });
    if (mNavAgent) mNavAgent.addEventListener('click', (e) => { e.preventDefault(); switchView(mNavAgent, pageAgent); });

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
    // Dynamic Real-Time Market Alerts Engine (Short & Punchy Alerts)
    // ─────────────────────────────────────────────────────────────────────────
    let systemNotifications = [
        {
            id: 'notif_001',
            type: 'price',
            text: '<strong>Rice (50kg)</strong> updated to ₦75,917 (+5%)',
            time: '2m ago',
            tag: 'Lagos Hub',
            read: false,
            actionQuery: 'Rice 50kg bag price today Lagos Kano'
        },
        {
            id: 'notif_002',
            type: 'inbox',
            text: '<strong>Dangote Cement</strong> dropped to ₦8,500 (-3%)',
            time: '12m ago',
            tag: 'Balogun Market',
            read: false,
            actionQuery: 'Dangote Cement 50kg price today Lagos'
        },
        {
            id: 'notif_003',
            type: 'price',
            text: '<strong>Turkish Steel 12mm</strong> at ₦1,250,000/tonne',
            time: '45m ago',
            tag: 'Oshodi Market',
            read: false,
            actionQuery: 'Turkish 12mm rebar steel price today Oshodi'
        },
        {
            id: 'notif_004',
            type: 'inbox',
            text: '<strong>Scout Reward</strong> +₦1,500 payout credited',
            time: '1h ago',
            tag: 'Agent Payout',
            read: true,
            actionQuery: ''
        },
        {
            id: 'notif_005',
            type: 'price',
            text: '<strong>Tomatoes (Basket)</strong> ₦1,800 (+8%)',
            time: '2h ago',
            tag: 'Mile 12',
            read: true,
            actionQuery: 'Tomatoes Basket price today Lagos Mile 12'
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

    // Background Ingestion of Real-Time Market Commodity Alerts
    setInterval(() => {
        const dynamicEvents = [
            {
                type: 'price',
                text: '<strong>Pepper (Basket)</strong> updated to ₦14,800 (+6%)',
                tag: 'Kano Hub',
                actionQuery: 'Pepper Basket price today Kano Kaduna'
            },
            {
                type: 'inbox',
                text: '<strong>Scout Reward</strong> +₦2,000 payout credited',
                tag: 'Agent Payout',
                actionQuery: ''
            },
            {
                type: 'price',
                text: '<strong>Lagos Rent 2-Bed</strong> ₦1.5M avg',
                tag: 'Real Estate',
                actionQuery: 'Average 2-bedroom apartment rent price in Lagos'
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
