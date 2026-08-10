/* ------------------------------------------
   SPIN & WIN MODAL ENGINE — spin.js
   Loaded after app.js — IIFE scoped to avoid any global conflicts.
------------------------------------------ */
(function () {
    "use strict";

    var SPIN_PRIZES = [
        { label: "?300", value: 300, color: "#f59e0b" },
        { label: "?50",  value: 50,  color: "#10b981" },
        { label: "?100", value: 100, color: "#059669" },
        { label: "?150", value: 150, color: "#10b981" },
        { label: "?200", value: 200, color: "#059669" },
        { label: "?250", value: 250, color: "#10b981" }
    ];

    var spinWheelAngle = 0;
    var spinIsRunning  = false;
    var spinCanvas     = null;
    var spinCtx        = null;

    function drawWheel(angle) {
        if (!spinCanvas || !spinCtx) return;
        var cx = spinCanvas.width / 2;
        var cy = spinCanvas.height / 2;
        var r  = cx - 4;
        var sliceAngle = (2 * Math.PI) / SPIN_PRIZES.length;
        spinCtx.clearRect(0, 0, spinCanvas.width, spinCanvas.height);
        SPIN_PRIZES.forEach(function (prize, i) {
            var start = angle + i * sliceAngle;
            var end   = start + sliceAngle;
            spinCtx.beginPath();
            spinCtx.moveTo(cx, cy);
            spinCtx.arc(cx, cy, r, start, end);
            spinCtx.closePath();
            spinCtx.fillStyle = prize.color;
            spinCtx.fill();
            spinCtx.strokeStyle = "#fff";
            spinCtx.lineWidth = 2;
            spinCtx.stroke();
            spinCtx.save();
            spinCtx.translate(cx, cy);
            spinCtx.rotate(start + sliceAngle / 2);
            spinCtx.textAlign = "right";
            spinCtx.fillStyle = "#fff";
            spinCtx.font = "bold 15px \"Plus Jakarta Sans\", sans-serif";
            spinCtx.shadowColor = "rgba(0,0,0,0.25)";
            spinCtx.shadowBlur = 3;
            spinCtx.fillText(prize.label, r - 14, 5);
            spinCtx.restore();
        });
        spinCtx.beginPath();
        spinCtx.arc(cx, cy, r, 0, 2 * Math.PI);
        spinCtx.strokeStyle = "#10b981";
        spinCtx.lineWidth = 5;
        spinCtx.stroke();
    }

    window.openSpinModal = function () {
        var overlay = document.getElementById("spin-modal-overlay");
        if (!overlay) return;
        overlay.classList.add("open");
        spinCanvas = document.getElementById("spin-wheel-canvas");
        spinCtx    = spinCanvas ? spinCanvas.getContext("2d") : null;
        drawWheel(spinWheelAngle);
        scheduleSocialToast();
    };

    window.closeSpinModal = function (e) {
        if (e && e.target && e.target.id !== "spin-modal-overlay") return;
        var overlay = document.getElementById("spin-modal-overlay");
        if (overlay) overlay.classList.remove("open");
    };

    window.spinWheel = function () {
        if (spinIsRunning) return;
        var spinsEl  = document.getElementById("sm-spins-remaining");
        var spinLeft = parseInt((spinsEl && spinsEl.textContent) || "1");
        if (spinLeft <= 0) {
            var cta = document.getElementById("sm-cta-btn");
            if (cta) cta.textContent = "No spins left today!";
            return;
        }
        if (spinsEl) spinsEl.textContent = spinLeft - 1;
        spinIsRunning = true;
        var centerBtn = document.getElementById("sm-spin-now-btn");
        var ctaBtn    = document.getElementById("sm-cta-btn");
        if (centerBtn) centerBtn.disabled = true;
        if (ctaBtn)    ctaBtn.disabled    = true;

        var winIndex    = Math.floor(Math.random() * SPIN_PRIZES.length);
        var sliceAngle  = (2 * Math.PI) / SPIN_PRIZES.length;
        var segCenter   = winIndex * sliceAngle + sliceAngle / 2;
        var targetAngle = -Math.PI / 2 - segCenter;
        var extraSpins  = (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
        var finalAngle  = targetAngle + extraSpins;
        var duration    = 4500;
        var startAngle  = spinWheelAngle;
        var startTime   = performance.now();

        function easeOut(t) { return 1 - Math.pow(1 - t, 4); }
        function step(now) {
            var t = Math.min((now - startTime) / duration, 1);
            spinWheelAngle = startAngle + (finalAngle - startAngle) * easeOut(t);
            drawWheel(spinWheelAngle);
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                spinWheelAngle = finalAngle % (2 * Math.PI);
                spinIsRunning = false;
                showSpinResult(SPIN_PRIZES[winIndex]);
            }
        }
        requestAnimationFrame(step);
    };

    function showSpinResult(prize) {
        document.getElementById("spin-modal-overlay").classList.remove("open");
        if (prize.value > 0) {
            var amtEl = document.getElementById("sr-win-amount");
            if (amtEl) amtEl.textContent = prize.label;
            var win = document.getElementById("spin-win-overlay");
            if (win) win.classList.add("open");
            spawnConfetti();
        } else {
            var lose = document.getElementById("spin-lose-overlay");
            if (lose) lose.classList.add("open");
        }
    }

    window.closeSpinResult = function () {
        var w = document.getElementById("spin-win-overlay");
        var l = document.getElementById("spin-lose-overlay");
        if (w) w.classList.remove("open");
        if (l) l.classList.remove("open");
        var cb = document.getElementById("sm-spin-now-btn");
        var ct = document.getElementById("sm-cta-btn");
        if (cb) cb.disabled = false;
        if (ct) { ct.disabled = false; ct.innerHTML = "<i class=\"fa-solid fa-dharmachakra\"></i> Spin Now"; }
    };

    function spawnConfetti() {
        var c = document.getElementById("sr-confetti-container");
        if (!c) return;
        c.innerHTML = "";
        var colors = ["#10b981","#f59e0b","#ef4444","#6366f1","#ec4899","#14b8a6"];
        for (var i = 0; i < 42; i++) {
            var p = document.createElement("div");
            p.className = "confetti-p";
            p.style.left = (Math.random() * 100) + "%";
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.animationDelay = (Math.random() * 0.8) + "s";
            p.style.animationDuration = (1.2 + Math.random() * 0.8) + "s";
            var sz = (6 + Math.random() * 6) + "px";
            p.style.width = sz; p.style.height = sz;
            c.appendChild(p);
        }
    }

    var TOAST_PEOPLE = [
        { name: "Martha Ikenna",   prize: "?50",  init: "MI" },
        { name: "Chidi Okafor",    prize: "?200", init: "CO" },
        { name: "Amina Bello",     prize: "?100", init: "AB" },
        { name: "Emeka Eze",       prize: "?300", init: "EE" },
        { name: "Fatima Suleiman", prize: "?150", init: "FS" },
        { name: "Kola Adeyemi",    prize: "?50",  init: "KA" }
    ];
    var toastIdx   = 0;
    var toastTimer = null;

    function scheduleSocialToast() {
        clearTimeout(toastTimer);
        toastTimer = setTimeout(showSocialToast, 2800);
    }

    function showSocialToast() {
        var person = TOAST_PEOPLE[toastIdx % TOAST_PEOPLE.length];
        toastIdx++;
        var toast = document.getElementById("spin-social-toast");
        if (!toast) return;
        document.getElementById("sst-avatar").textContent = person.init;
        document.getElementById("sst-name").textContent   = person.name;
        document.getElementById("sst-msg").textContent    = "just won " + person.prize + " spin bonus!";
        toast.classList.add("show");
        setTimeout(function () {
            toast.classList.remove("show");
            var ov = document.getElementById("spin-modal-overlay");
            if (ov && ov.classList.contains("open")) {
                toastTimer = setTimeout(showSocialToast, 4000);
            }
        }, 3200);
    }

}());
