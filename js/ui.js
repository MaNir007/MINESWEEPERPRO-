/**
 * MINESWEEPER PRO+ - UI & INTERACTION ENGINE
 * 
 * Ovaj file upravlja cjelokupnim korisničkim sučeljem (DOM manipulacijom).
 * Sadrži funkcije za upravljanje modalima, primjenu vizualnih tema,
 * slavljeničke efekte (konfeti) te sustav notifikacija i replay reprodukciju.
 */

// --- MODALS ---

/**
 * Otvara terminal za odabir dizajna (Theme Picker).
 */
window.openThemeModal = function() {
    const modal = document.getElementById("theme-modal");
    if (modal) modal.classList.remove("hidden");
};

/**
 * Zatvara terminal za odabir dizajna.
 */
window.closeThemeModal = function() {
    const modal = document.getElementById("theme-modal");
    if (modal) modal.classList.add("hidden");
};

/**
 * Postavlja odabranu temu u localStorage i trenutačno je primjenjuje na GUI.
 * @param {string} themeName - Naziv teme (npr. "cyberpunk", "matrix")
 */
window.setUserTheme = function(themeName) {
    localStorage.setItem("minesweeper_theme", themeName);
    applyTheme();
    closeThemeModal();
    if (window.showNotification) {
        window.showNotification(`TEMA: ${themeName.toUpperCase()}`, "success");
    }
};

/**
 * Otvara modal za potvrdu kupnje perka (Radar ili Oklop).
 * @param {string} type - Vrsta perka
 * @param {number} cost - Cijena u novčićima
 */
window.requestPerk = function(type, cost) {
    const title = type === 'radar' ? "RADAR SKENER" : "DEFUSE KIT (OKLOP)";
    const desc = type === 'radar' 
        ? "Aktivira holografski puls koji skenira 3x3 područje."
        : "Automatski deaktivira prvu nagaznu minu na koju naiđete.";
    
    const titleEl = document.getElementById("perk-title");
    const descEl = document.getElementById("perk-desc");
    const costEl = document.getElementById("perk-cost");
    const modal = document.getElementById("perk-modal");
    
    if (titleEl) titleEl.innerText = title;
    if (descEl) descEl.innerText = desc;
    if (costEl) costEl.innerText = cost;
    
    const confirmBtn = document.getElementById("perk-confirm-btn");
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            closePerkModal();
            if (window.buyPerk) window.buyPerk(type, cost);
        };
    }
    
    if (modal) modal.classList.remove("hidden");
};

/**
 * Zatvara trgovinu perkovima.
 */
window.closePerkModal = function() {
    const modal = document.getElementById("perk-modal");
    if (modal) modal.classList.add("hidden");
};

// --- UI CORE ---

/**
 * Učitava temu iz memorije i dodaje odgovarajuću klasu na body element.
 * Očistiti sve prethodne teme radi sprječavanja konflikta.
 */
window.applyTheme = function() {
    const savedTheme = localStorage.getItem("minesweeper_theme") || "classic";
    document.body.className = ""; 
    if (savedTheme !== "classic") {
        document.body.classList.add(`theme-${savedTheme}`);
    }
};

/**
 * Prelazi s login ekrana na glavni izbornik i ažurira korisničke podatke.
 */
window.showMenu = function() {
    const auth = document.getElementById("auth-card");
    const menu = document.getElementById("menu");
    const welcome = document.getElementById("welcome-msg");
    const coins = document.getElementById("coins-display");
    
    if (auth) auth.classList.add("hidden");
    if (menu) menu.classList.remove("hidden");
    if (welcome) welcome.innerText = `Agent: ${currentUser}`;
    if (coins) coins.innerText = playerCoins;
    
    applyTheme();
    
    const highDisplay = document.getElementById("high-level-display");
    if (highDisplay) {
        highDisplay.innerText = isGuest ? "Napredak gosta se ne sprema." : `Karijera: Nivo ${level}`;
    }
    
    if (window.fetchLeaderboard) window.fetchLeaderboard();
};

/**
 * Izlazi iz aktivne partije i vraća korisnika na početni izbornik.
 */
window.backToMenu = function() {
    if (window.stopTimer) window.stopTimer();
    const hud = document.getElementById("hud");
    const gameCont = document.getElementById("game-container");
    const menu = document.getElementById("menu");
    
    if (hud) hud.classList.add("hidden");
    if (gameCont) gameCont.classList.add("hidden");
    if (menu) menu.classList.remove("hidden");
    
    const highDisplay = document.getElementById("high-level-display");
    if (highDisplay && !isGuest) {
        highDisplay.innerText = `Karijera: Nivo ${level}`;
    }
};

/**
 * Prikazuje dodatne inpute za veličinu mape ako je odabran 'Custom' mod.
 */
window.toggleCustom = function() {
    const select = document.getElementById("difficulty-select");
    const custom = document.getElementById("custom-inputs");
    if (select && custom) {
        custom.classList.toggle("hidden", select.value !== "custom");
    }
};

/**
 * Prikazuje pobjednički ili gubitnički modal s dinamičkim tekstom i ikonom.
 */
window.showOverlay = function(title, text) {
    const modal = document.getElementById("message-overlay");
    const titleEl = document.getElementById("overlay-title");
    const textEl = document.getElementById("overlay-text");
    
    if (!modal || !titleEl || !textEl) return;
    
    const isWin = title.includes("POBJEDA");
    const icon = isWin ? (window.Icons ? Icons.trophy : "🏆") : (window.Icons ? Icons.explosion : "💥");
    
    titleEl.innerHTML = `<span class="end-icon">${icon}</span>${title}`;
    textEl.innerHTML = text;
    
    if (isWin && window.createConfetti) window.createConfetti();
    modal.classList.remove("hidden");
};

/**
 * Zatvara završni prozor i odlučuje o idućem koraku (Karijera nastavlja, ostalo u meni).
 */
window.closeOverlay = function() {
    const modal = document.getElementById("message-overlay");
    if (modal) modal.classList.add("hidden");
    
    if (mode === "Career" && gameOver && document.getElementById("overlay-title").innerText.includes("POBJEDA")) {
        if (window.startGame) window.startGame("Career");
    } else {
        backToMenu();
    }
};

/**
 * Prikazuje upozorenje prije nego što igrač napusti misiju usred igre.
 */
window.confirmExit = function() {
    if (window.Notifier) {
        Notifier.confirm("Želite li prekinuti trenutnu misiju?", () => {
            backToMenu();
        }, "PREKID MISIJE");
    } else {
        if (confirm("Prekid misije?")) backToMenu();
    }
};

/**
 * Generira niz CSS partikala koji simulatoru konfete prilikom pobjede.
 */
window.createConfetti = function() {
    const colors = ['#00d2ff', '#3a7bd5', '#ffffff', '#ffeb3b', '#4CAF50'];
    for (let i = 0; i < 40; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 8 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        const duration = Math.random() * 3 + 2;
        confetti.style.animation = `confettiFall ${duration}s linear forwards`;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), duration * 1000);
    }
};

/**
 * Inicijalizacija pri učitavanju prozora. Primenjuje temu, skenira ikone i pokreće čestice.
 */
window.addEventListener('load', () => {
    applyTheme();
    if (window.injectStaticSVGs) window.injectStaticSVGs();
    if (window.createAmbientParticles) window.createAmbientParticles();
});

/**
 * Generira plutajuće čestice u pozadini koje daju dubinu sučelju.
 */
window.createAmbientParticles = function() {
    const container = document.getElementById('bg-effects');
    if (!container) return;
    
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'ambient-particle';
        const size = Math.random() * 5 + 2;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = '0';
        p.style.setProperty('--x', (Math.random() * 100) + 'vw');
        p.style.setProperty('--d', (Math.random() * 15 + 10) + 's');
        p.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(p);
    }
};

/**
 * Stvara vizualni ripple efekt (krug koji se širi) na kliknutom elementu.
 * @param {HTMLElement} el - Element na kojem se stvara efekt
 */
window.createRipple = function(el) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-fx';
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
};

window.startReplay = async function() {
    const modal = document.getElementById("message-overlay");
    if (modal) modal.classList.add("hidden");
    
    isReplaying = true;
    gameOver = false;
    
    grid.forEach(row => row.forEach(c => {
        c.open = false;
        c.flagged = false;
        let d = document.getElementById(`cell-${c.x}-${c.y}`);
        if(d) {
            d.className = "cell";
            d.innerHTML = "";
            d.style.background = "";
        }
    }));
    
    if (window.resetTimer) window.resetTimer();
    if (window.startTimer) window.startTimer();
    
    for (let move of gameReplay) {
        let delay = Math.max(200, 2500 / gameReplay.length);
        await new Promise(r => setTimeout(r, delay)); 
        
        if (move.type === 'click') {
            let cell = grid[move.y][move.x];
            if (!cell.open && !cell.flagged) {
                if (window.SFX) SFX.playClick();
                if (window.revealCell) window.revealCell(move.x, move.y);
            }
        } else if (move.type === 'flag') {
            let cell = grid[move.y][move.x];
            cell.flagged = !cell.flagged;
            let div = document.getElementById(`cell-${move.x}-${move.y}`);
            if(div) {
                div.classList.toggle("flagged");
                div.innerHTML = cell.flagged ? (window.Icons ? Icons.flag : "🚩") : "";
            }
        }
    }
    
    if (window.stopTimer) window.stopTimer();
    
    setTimeout(() => {
        isReplaying = false;
        gameOver = true;
        showOverlay("REPLAY GOTOV", "Prikaz uspješne misije je završen.");
    }, 800);
};
