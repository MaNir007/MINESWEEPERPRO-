// --- CORE GAME LOGIKA ---
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
            size = Math.min(Math.max(size, 5), 30);
            mines = Math.min(mines, Math.floor((size * size) * 0.5));
        }
    } else if (mode === "Career") {
        let config = careerLevels[level - 1] || careerLevels[careerLevels.length - 1];
        size = config.size;
        mines = config.mines;
    } else if (mode === "MineDash") {
        size = 10; mines = 0;
    } else if (mode === "TreasureHunter") {
        size = 8; mines = 15;
    } else if (mode === "ChainReaction") {
        size = 10; mines = 12;
    } else if (mode === "Daily") {
        size = 15; mines = 40;
    }

    initGame();
}

function initGame(seed = null) {
    gameOver = false;
    gameStarted = true;
    hasDefuseKit = false; // Reset per game
    radarActive = false;
    isReplaying = false;
    gameReplay = [];
    startTime = Date.now();
    resetTimer();
    
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("hud").classList.remove("hidden");
    document.getElementById("game-container").classList.remove("hidden");
    
    document.getElementById("current-user").innerText = currentUser;
    document.getElementById("level-val").innerText = (mode === "Career") ? level : (mode === "ChainReaction" ? chainReactionEnergy : "T");
    document.getElementById("mine-val").innerText = (mode === "MineDash") ? "∞" : mines;
    
    gameDiv.innerHTML = "";

    // Dinamički izračun veličine ćelije za velike mape i mobitele
    let maxPx = size > 15 ? 25 : 35;
    let cellSize = `min(${maxPx}px, calc(90vw / ${size}))`;
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
            div.style.fontSize = `min(1.1rem, calc(80vw / ${size} * 0.5))`; // responsive font
            div.id = `cell-${x}-${y}`;
            div.onclick = () => handleCellClick(x, y);
            div.oncontextmenu = (e) => { e.preventDefault(); toggleFlag(x, y); };
            gameDiv.appendChild(div);
        }
    }
    
    placeMines();
    calculateNumbers();
    
    if (mode === "TreasureHunter") {
        gameStarted = false;
        grid.forEach(row => row.forEach(c => {
            if (c.mine) {
                let d = document.getElementById(`cell-${c.x}-${c.y}`);
                d.innerHTML = Icons.mine;
            }
        }));
        setTimeout(() => {
            grid.forEach(row => row.forEach(c => {
                if (c.mine) {
                    let d = document.getElementById(`cell-${c.x}-${c.y}`);
                    d.innerHTML = "";
                }
            }));
            gameStarted = true;
            startTimer();
        }, 2000);
    } else if (mode === "ChainReaction") {
        startTimer();
        setupChainReaction();
    } else {
        startTimer();
    }
}

function setupChainReaction() {
    chainReactionEnergy = 3;
    document.getElementById("level-val").innerText = chainReactionEnergy;
    
    let startX = -1, startY = -1;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!grid[y][x].mine && grid[y][x].count === 0) {
                startX = x; startY = y;
                break;
            }
        }
        if (startX !== -1) break;
    }
    if (startX !== -1) {
        revealCell(startX, startY);
    } else {
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (!grid[y][x].mine) { revealCell(x, y); break; }
            }
        }
    }
}

function placeMines() {
    if (mode === "MineDash") {
        mineDashCurrentCol = 0;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) { grid[y][x].mine = true; }
        }
        for (let x = 0; x < size; x++) {
            let safeY = Math.floor(Math.random() * size);
            grid[safeY][x].mine = false;
        }
        return;
    }

    let randomFunc = Math.random;
    if (mode === "Daily") {
        let today = new Date().toISOString().slice(0, 10);
        let seed = parseInt(today.replace(/-/g, ''));
        randomFunc = mulberry32(seed);
    }

    let placed = 0;
    while (placed < mines) {
        let rx = Math.floor(randomFunc() * size), ry = Math.floor(randomFunc() * size);
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

function handleCellClick(x, y, isReplay = false) {
    if (gameOver || !gameStarted || (isReplaying && !isReplay)) return;
    
    // Radarska provjera
    if (radarActive && !isReplaying) {
        radarScan(x, y);
        return;
    }

    // Snimanje poteza
    if (!isReplay && !isReplaying) {
        gameReplay.push({ type: 'click', x, y, time: Date.now() - startTime });
    }

    // Chording mehanika (Pravi Minesweeper Pro detalj)
    if (grid[y][x].open && grid[y][x].count > 0) {
        let flags = 0;
        iterateNeighbors(x, y, (nx, ny) => { if (grid[ny][nx].flagged) flags++; });
        if (flags === grid[y][x].count) {
            SFX.playClick();
            iterateNeighbors(x, y, (nx, ny) => {
                if (!grid[ny][nx].flagged && !grid[ny][nx].open) {
                    processCellClick(nx, ny);
                }
            });
        }
        return;
    }

    if (grid[y][x].flagged || grid[y][x].open) return;
    
    processCellClick(x, y);
}

function processCellClick(x, y) {
    if (gameOver || grid[y][x].flagged || grid[y][x].open) return;
    
    if (mode === "MineDash") {
        if (x !== mineDashCurrentCol) return;
        if (grid[y][x].mine) {
            mineDashCurrentCol = 0;
            grid.forEach(row => row.forEach(c => {
                c.open = false;
                let div = document.getElementById(`cell-${c.x}-${c.y}`);
                div.classList.remove("open");
                div.innerText = "";
            }));
            document.body.classList.add("shake");
            setTimeout(() => document.body.classList.remove("shake"), 300);
        } else {
            grid[y][x].open = true;
            let div = document.getElementById(`cell-${x}-${y}`);
            div.classList.add("open");
            div.innerHTML = Icons.check;
            SFX.playClick();
            mineDashCurrentCol++;
            timeLeft += 2;
            if (mineDashCurrentCol >= size) {
                gameOver = true;
                stopTimer();
                saveProgress(level, true, size); // Number of safe steps = size (mines conceptually clear)
                showOverlay("POBJEDA!", `Sjajno! Preostalo vrijeme: ${timeLeft}s`);
            }
        }
        return;
    }

    if (grid[y][x].mine) {
        if (hasDefuseKit) {
            hasDefuseKit = false;
            let div = document.getElementById(`cell-${x}-${y}`);
            div.classList.add("open");
            div.innerHTML = `<span class="cell-shield">🛡️</span>`;
            grid[y][x].open = true;
            SFX.playBoom(); // Mali prigušeni boom
            document.body.classList.add("shake");
            setTimeout(() => document.body.classList.remove("shake"), 300);
            return;
        } else {
            triggerGameOver(x, y);
        }
    } else {
        SFX.playClick();
        revealCell(x, y);
        checkWin();
    }
}

function radarScan(x, y) {
    radarActive = false;
    document.body.classList.remove("cursor-target");
    SFX.playClick();
    
    // Provjera funkcije dodjeljivanjem privremene CSS animacije ili stila
    const radarHighlight = (nx, ny) => {
        let div = document.getElementById(`cell-${nx}-${ny}`);
        div.classList.add("radar-highlight");
        setTimeout(() => div.classList.remove("radar-highlight"), 3000);
    };

    iterateNeighbors(x, y, (nx, ny) => {
        if (grid[ny][nx].mine && !grid[ny][nx].open) radarHighlight(nx, ny);
    });
    // Provjera i same ciljane ćelije
    if (grid[y][x].mine && !grid[y][x].open) radarHighlight(x, y);
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

function toggleFlag(x, y, isReplay = false) {
    if (gameOver || !gameStarted || grid[y][x].open || (isReplaying && !isReplay)) return;
    
    if (!isReplay && !isReplaying) {
        gameReplay.push({ type: 'flag', x, y, time: Date.now() - startTime });
    }
    
    if (mode === "ChainReaction") {
        if (!grid[y][x].flagged) {
            if (!grid[y][x].mine) {
                chainReactionEnergy--;
                document.getElementById("level-val").innerText = chainReactionEnergy;
                document.body.classList.add("shake");
                let div = document.getElementById(`cell-${x}-${y}`);
                let oldBg = div.style.background;
                div.style.background = "#ff4b2b";
                setTimeout(() => div.style.background = oldBg, 500);
                setTimeout(() => document.body.classList.remove("shake"), 300);
                
                if (chainReactionEnergy <= 0) triggerGameOver(x, y);
                return;
            } else {
                grid[y][x].flagged = true;
                let div = document.getElementById(`cell-${x}-${y}`);
                div.classList.add("flagged");
                div.innerHTML = Icons.flag;
                
                let flaggedMines = 0;
                grid.forEach(row => row.forEach(c => {
                    if (c.mine && c.flagged) flaggedMines++;
                }));
                if (flaggedMines === mines) {
                    gameOver = true;
                    stopTimer();
                    saveProgress(level, true, mines);
                    showOverlay("POBJEDA!", `Uspješno ste riješili Puzzle Mode!`);
                }
                return;
            }
        } else {
            grid[y][x].flagged = false;
            let div = document.getElementById(`cell-${x}-${y}`);
            div.classList.remove("flagged");
            div.innerHTML = "";
            return;
        }
    }

    grid[y][x].flagged = !grid[y][x].flagged;
    let div = document.getElementById(`cell-${x}-${y}`);
    div.classList.toggle("flagged");
    if (grid[y][x].flagged) {
        div.innerHTML = Icons.flag;
    } else {
        div.innerHTML = "";
    }
}

function triggerGameOver(hitX = -1, hitY = -1) {
    gameOver = true;
    stopTimer();
    document.body.classList.add("shake");
    SFX.playBoom();
    
    // 1. Odmah označi minu koju smo pogodili
    if (hitX !== -1 && hitY !== -1) {
        let hitCell = document.getElementById(`cell-${hitX}-${hitY}`);
        hitCell.classList.add("mine", "hit-mine");
        hitCell.innerHTML = Icons.explosion; // Prikupi eksploziju odmah
    }

    let openedCount = 0;
    grid.forEach(row => row.forEach(c => {
        if (c.open && !c.mine) openedCount++;
    }));

    saveProgress(level, false, openedCount);

    // 2. Skupi preostale mine i krive zastavice
    let hiddenMines = [];
    let wrongFlags = [];

    grid.forEach(row => row.forEach(c => {
        // Preskoči minu koju smo upravo pogodili (već je otkrivena)
        if (c.mine && !c.open && !(c.x === hitX && c.y === hitY)) {
            hiddenMines.push(c);
        }
        if (c.flagged && !c.mine) {
            wrongFlags.push(c);
        }
    }));

    // Nasumično za "Google" efekt
    hiddenMines.sort(() => Math.random() - 0.5);

    const MINE_DELAY = 100;

    // 3. Sekvencijalno otkrivanje ostalih mina
    hiddenMines.forEach((c, i) => {
        setTimeout(() => {
            let d = document.getElementById(`cell-${c.x}-${c.y}`);
            if (c.flagged) d.classList.remove("flagged");
            
            d.classList.add("mine", "mine-reveal-anim");
            d.innerHTML = Icons.mine;
            SFX.playClick();
        }, i * 250); // Puno sporije (v2.0)
    });

    // 4. Padanje krivih zastavica
    let flagStart = (hiddenMines.length * 250) + 500;
    wrongFlags.forEach((c, i) => {
        setTimeout(() => {
            let d = document.getElementById(`cell-${c.x}-${c.y}`);
            d.classList.add("wrong-flag-fall");
            setTimeout(() => {
                d.classList.remove("flagged");
                d.innerHTML = Icons.wrong;
            }, 600);
        }, flagStart + (i * 200));
    });

    // 5. Završni overlay
    let overlayDelay = flagStart + (wrongFlags.length * 200) + 1200;
    setTimeout(() => {
        document.body.classList.remove("shake");
        showOverlay("MISIJA NEUSPJEŠNA", "Aktivirali ste minu. Pokušajte ponovno.");
    }, overlayDelay);
}

async function checkWin() {
    let opened = 0;
    grid.forEach(row => row.forEach(c => { if(c.open) opened++; }));
    
    if (opened === (size * size) - mines) {
        gameOver = true;
        stopTimer();
        
        // APM Kalkulacija
        let durationMins = Math.max((Date.now() - startTime) / 60000, 0.01);
        let apm = Math.round(gameReplay.length / durationMins);
        
        if (mode === "Career" && !isGuest) {
            level++;
            saveProgress(level, true, mines);
        } else {
            saveProgress(level, true, mines);
        }
        
        let stopwatchIcon = Icons.stopwatch.replace('<svg', '<svg width="16" height="16" class="win-icon"');
        let boltIcon = Icons.bolt.replace('<svg', '<svg width="16" height="16" class="win-icon"');
        let winMsg = `
            <div class="win-stats">
                <span>${stopwatchIcon} Vrijeme: <b>${document.getElementById("timer-val").innerText}</b></span>
                <span>${boltIcon} APM: <b>${apm}</b></span>
            </div>
            <button class="btn btn-small btn-primary" onclick="startReplay()">POKAŽI REPLAY</button>
        `;
        showOverlay("POBJEDA!", winMsg);
    }
}

function iterateNeighbors(x, y, callback) {
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            let nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < size && ny >= 0 && ny < size && !(dx === 0 && dy === 0)) callback(nx, ny);
        }
    }
}
