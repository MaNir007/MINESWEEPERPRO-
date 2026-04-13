/**
 * MINESWEEPER PRO+ 
 * Napredna logika igre s PHP/MySQL sinkronizacijom
 */

// Globalno stanje
let grid = [];
let size = 10;
let mines = 15;
let mode = "";
let level = 1;
let totalMinesCleared = 0;
let gameOver = false;
let currentUser = null;
let isGuest = false;

// Timer varijable
let timerInterval = null;
let secondsPassed = 0;

const gameDiv = document.getElementById("game");
const overlay = document.getElementById("message-overlay");

// Postavke za Karijeru
const careerLevels = [
    { size: 6, mines: 4 },
    { size: 8, mines: 10 },
    { size: 10, mines: 18 },
    { size: 12, mines: 28 },
    { size: 14, mines: 42 },
    { size: 16, mines: 60 }
];

// --- AUTH LOGIKA ---

async function login() {
    const nameInput = document.getElementById("username-input");
    const name = nameInput.value.trim();
    
    if (name.length < 3) return alert("Ime mora imati min. 3 znaka!");

    const formData = new FormData();
    formData.append("username", name);

    try {
        const response = await fetch("api.php?action=login", {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        
        if (data.status === "success" || data.status === "created") {
            currentUser = name;
            isGuest = false;
            level = parseInt(data.level) || 1;
            // Ovdje bismo mogli dohvatiti i total_mines_cleared iz baze u naprednijoj verziji
            showMenu();
        }
    } catch (error) {
        console.warn("Fallback na LocalStorage");
        currentUser = name;
        isGuest = false;
        level = parseInt(localStorage.getItem(`ms_pro_level_${currentUser}`)) || 1;
        showMenu();
    }
}

function playAsGuest() {
    currentUser = "Gost";
    isGuest = true;
    level = 1;
    showMenu();
}

function showMenu() {
    document.getElementById("auth-card").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
    document.getElementById("welcome-msg").innerText = `Agent: ${currentUser}`;
    
    const highDisplay = document.getElementById("high-level-display");
    if (isGuest) {
        highDisplay.innerText = "Napredak gosta se ne sprema.";
    } else {
        highDisplay.innerText = `Karijera: Nivo ${level}`;
    }
}

// --- GAME LOGIKA ---

function toggleCustom() {
    const diff = document.getElementById("difficulty-select").value;
    document.getElementById("custom-inputs").classList.toggle("hidden", diff !== "custom");
}

function startGame(m) {
    mode = m;
    const diff = document.getElementById("difficulty-select").value;

    if (mode === "Training") {
        if (diff === "easy") { size = 6; mines = 4; }
        else if (diff === "medium") { size = 10; mines = 15; }
        else if (diff === "hard") { size = 15; mines = 45; }
        else if (diff === "impossible") { size = 20; mines = 85; }
        else if (diff === "custom") {
            size = parseInt(document.getElementById("custom-size").value) || 10;
            mines = parseInt(document.getElementById("custom-mines").value) || 15;
            // Limitacija radi performansi
            size = Math.min(Math.max(size, 5), 30);
            mines = Math.min(mines, Math.floor((size * size) * 0.5));
        }
    } else {
        // Career Mode
        let config = careerLevels[level - 1] || careerLevels[careerLevels.length - 1];
        size = config.size;
        mines = config.mines;
    }

    initGame();
}

function initGame() {
    gameOver = false;
    resetTimer();
    
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("hud").classList.remove("hidden");
    document.getElementById("game-container").classList.remove("hidden");
    
    // HUD Update
    document.getElementById("current-user").innerText = currentUser;
    document.getElementById("level-val").innerText = (mode === "Career") ? level : "T";
    document.getElementById("mine-val").innerText = mines;

    // Grid generacija
    gameDiv.innerHTML = "";
    // Dinamički izračun veličine ćelije za velike mape
    let cellSize = size > 15 ? "25px" : "35px";
    gameDiv.style.gridTemplateColumns = `repeat(${size}, ${cellSize})`;
    
    grid = [];
    for (let y = 0; y < size; y++) {
        grid[y] = [];
        for (let x = 0; x < size; x++) {
            grid[y][x] = { x, y, mine: false, open: false, flagged: false, count: 0 };
            let div = document.createElement("div");
            div.classList.add("cell");
            div.style.width = cellSize;
            div.style.height = cellSize;
            div.id = `cell-${x}-${y}`;
            div.onclick = () => handleCellClick(x, y);
            div.oncontextmenu = (e) => { e.preventDefault(); toggleFlag(x, y); };
            gameDiv.appendChild(div);
        }
    }
    
    placeMines();
    calculateNumbers();
    startTimer();
}

// --- CORE MEHANIKA ---

function placeMines() {
    let placed = 0;
    while (placed < mines) {
        let rx = Math.floor(Math.random() * size), ry = Math.floor(Math.random() * size);
        if (!grid[ry][rx].mine) { grid[ry][rx].mine = true; placed++; }
    }
}

function calculateNumbers() {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (grid[y][x].mine) continue;
            let count = 0;
            iterateNeighbors(x, y, (nx, ny) => { if (grid[ny][nx].mine) count++; });
            grid[y][x].count = count;
        }
    }
}

function handleCellClick(x, y) {
    if (gameOver || grid[y][x].flagged || grid[y][x].open) return;
    
    if (grid[y][x].mine) {
        triggerGameOver();
    } else {
        revealCell(x, y);
        checkWin();
    }
}

function revealCell(x, y) {
    let cell = grid[y][x];
    if (cell.open || cell.flagged) return;
    
    cell.open = true;
    let div = document.getElementById(`cell-${x}-${y}`);
    div.classList.add("open");
    
    if (cell.count > 0) {
        div.innerText = cell.count;
        div.style.color = ["", "#00d2ff", "#4CAF50", "#ff4b2b", "#9c27b0", "#ffeb3b", "#ec407a", "#1a1a1a"][cell.count];
    } else {
        iterateNeighbors(x, y, (nx, ny) => revealCell(nx, ny));
    }
}

function toggleFlag(x, y) {
    if (gameOver || grid[y][x].open) return;
    grid[y][x].flagged = !grid[y][x].flagged;
    document.getElementById(`cell-${x}-${y}`).classList.toggle("flagged");
}

// --- ZAVRŠETAK IGRE ---

function triggerGameOver() {
    gameOver = true;
    stopTimer();
    document.body.classList.add("shake");
    
    grid.forEach(row => row.forEach(c => {
        if (c.mine) {
            let d = document.getElementById(`cell-${c.x}-${c.y}`);
            d.classList.add("mine");
            d.innerText = "💣";
        }
    }));

    setTimeout(() => {
        showOverlay("MISIJA NEUSPJEŠNA", "Aktivirali ste minu. Pokušajte ponovno.");
        document.body.classList.remove("shake");
    }, 500);
}

async function checkWin() {
    let opened = 0;
    grid.forEach(row => row.forEach(c => { if(c.open) opened++; }));
    
    if (opened === (size * size) - mines) {
        gameOver = true;
        stopTimer();
        
        if (mode === "Career" && !isGuest) {
            level++;
            saveProgress(level);
        }
        
        showOverlay("POBJEDA!", `Vrijeme: ${document.getElementById("timer-val").innerText}`);
    }
}

async function saveProgress(newLvl) {
    const formData = new FormData();
    formData.append("username", currentUser);
    formData.append("level", newLvl);

    try {
        await fetch("api.php?action=save", { method: "POST", body: formData });
        localStorage.setItem(`ms_pro_level_${currentUser}`, newLvl);
    } catch (e) { console.error("API Save Error"); }
}

// --- POMOĆNI ALATI ---

function startTimer() {
    timerInterval = setInterval(() => {
        secondsPassed++;
        let m = Math.floor(secondsPassed / 60).toString().padStart(2, '0');
        let s = (secondsPassed % 60).toString().padStart(2, '0');
        document.getElementById("timer-val").innerText = `${m}:${s}`;
    }, 1000);
}

function stopTimer() { clearInterval(timerInterval); }
function resetTimer() { stopTimer(); secondsPassed = 0; document.getElementById("timer-val").innerText = "00:00"; }

function iterateNeighbors(x, y, callback) {
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            let nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < size && ny >= 0 && ny < size && !(dx === 0 && dy === 0)) callback(nx, ny);
        }
    }
}

function showOverlay(title, text) {
    document.getElementById("overlay-title").innerText = title;
    document.getElementById("overlay-text").innerText = text;
    overlay.classList.remove("hidden");
}

function closeOverlay() {
    overlay.classList.add("hidden");
    if (mode === "Career" && gameOver && document.getElementById("overlay-title").innerText === "POBJEDA!") {
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

/**
 * Prikazuje prozor s animacijom i efektima
 */
function showOverlay(title, text) {
    const isWin = title === "POBJEDA!";
    const overlayTitle = document.getElementById("overlay-title");
    const overlayText = document.getElementById("overlay-text");
    
    // Postavi sadržaj
    overlayTitle.innerText = title;
    overlayText.innerText = text;

    // Dodaj ikonu ovisno o rezultatu
    const icon = isWin ? "🏆" : "💥";
    overlayTitle.innerHTML = `<span class="end-icon">${icon}</span>${title}`;
    
    // Ako je pobjeda, ispali konfete
    if (isWin) {
        createConfetti();
    }

    // Makni hidden klasu (CSS će odraditi tranziciju)
    overlay.classList.remove("hidden");
}

/**
 * Funkcija za generiranje efekta slavlja
 */
function createConfetti() {
    const colors = ['#00d2ff', '#3a7bd5', '#ffffff', '#ffeb3b', '#4CAF50'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // Nasumične pozicije i stilovi
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 8 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        
        // Animacija
        const duration = Math.random() * 3 + 2;
        confetti.style.animation = `confettiFall ${duration}s linear forwards`;
        
        document.body.appendChild(confetti);
        
        // Obriši element nakon što animacija završi
        setTimeout(() => confetti.remove(), duration * 1000);
    }
}