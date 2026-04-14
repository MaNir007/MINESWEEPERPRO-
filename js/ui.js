// --- UI I EFEKTI ---
function showMenu() {
    document.getElementById("auth-card").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
    document.getElementById("welcome-msg").innerText = `Agent: ${currentUser}`;
    
    const highDisplay = document.getElementById("high-level-display");
    document.getElementById("coins-display").innerText = playerCoins;
    
    applyTheme();
    if (isGuest) {
        highDisplay.innerText = "Napredak gosta se ne sprema.";
    } else {
        highDisplay.innerText = `Karijera: Nivo ${level}`;
    }
    
    // Učitaj top listu
    if (typeof fetchLeaderboard === "function") {
        fetchLeaderboard();
    }
}

function toggleCustom() {
    const diff = document.getElementById("difficulty-select").value;
    document.getElementById("custom-inputs").classList.toggle("hidden", diff !== "custom");
}

function showOverlay(title, text) {
    const isWin = title === "POBJEDA!";
    const overlayTitle = document.getElementById("overlay-title");
    const overlayText = document.getElementById("overlay-text");
    
    overlayTitle.innerText = title;
    overlayText.innerHTML = text;

    const icon = isWin ? Icons.trophy : Icons.explosion;
    overlayTitle.innerHTML = `<span class="end-icon">${icon}</span>${title}`;
    
    if (isWin) {
        createConfetti();
    }

    overlay.classList.remove("hidden");
}

function closeOverlay() {
    overlay.classList.add("hidden");
    if (mode === "Career" && gameOver && document.getElementById("overlay-title").innerText.includes("POBJEDA!")) {
        startGame("Career");
    } else {
        backToMenu();
    }
}

function backToMenu() {
    stopTimer();
    document.getElementById("hud").classList.add("hidden");
    document.getElementById("game-container").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
    if (!isGuest) {
        document.getElementById("high-level-display").innerText = `Karijera: Nivo ${level}`;
    }
}

function confirmExit() {
    if (confirm("Želite li prekinuti trenutnu misiju?")) backToMenu();
}

function createConfetti() {
    const colors = ['#00d2ff', '#3a7bd5', '#ffffff', '#ffeb3b', '#4CAF50'];
    for (let i = 0; i < 50; i++) {
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
}

function applyTheme() {
    document.body.className = ""; // Očisti theme
    if (level >= 15) document.body.classList.add("theme-retro");
    else if (level >= 10) document.body.classList.add("theme-matrix");
    else if (level >= 5) document.body.classList.add("theme-cyberpunk");
}

async function startReplay() {
    // Sakrij overlay BEZ pozivanja backToMenu logike
    overlay.classList.add("hidden");
    
    isReplaying = true;
    gameOver = false;
    
    // Očisti grid za vizuale ali zadrži strukturu mina
    grid.forEach(row => row.forEach(c => {
        c.open = false;
        c.flagged = false;
        let d = document.getElementById(`cell-${c.x}-${c.y}`);
        d.className = "cell";
        d.innerHTML = "";
        d.style.background = "";
    }));
    
    resetTimer();
    startTimer();
    
    for (let move of gameReplay) {
        let delay = Math.max(200, 2500 / gameReplay.length);
        await new Promise(r => setTimeout(r, delay)); 
        
        if (move.type === 'click') {
            // Direktno otvori ćeliju bez provjere gameOver/win
            let cell = grid[move.y][move.x];
            if (!cell.open && !cell.flagged) {
                SFX.playClick();
                revealCell(move.x, move.y);
            }
        } else if (move.type === 'flag') {
            let cell = grid[move.y][move.x];
            cell.flagged = !cell.flagged;
            let div = document.getElementById(`cell-${move.x}-${move.y}`);
            div.classList.toggle("flagged");
            div.innerHTML = cell.flagged ? Icons.flag : "";
        }
    }
    
    stopTimer();
    
    setTimeout(() => {
        isReplaying = false;
        gameOver = true;
        showOverlay("REPLAY GOTOV", "Prikaz uspješne misije je završen.");
    }, 800);
}
