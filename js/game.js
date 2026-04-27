/**
 * MINESWEEPER PRO+ - CORE GAME ENGINE
 * 
 * Ovaj file je srce igre. Upravlja životnim ciklusom partije (start, init, win/loss),
 * algoritamskim postavljanjem mina, rekurzivnim otkrivanjem polja (Flood-fill)
 * te specifičnim mehanikama svih mini-igara (Zen, Fog, MineDash, itd.).
 */

// --- CORE GAME LOGIKA ---

/**
 * Pokreće proces konfiguracije igre na osnovu odabranog moda.
 * Postavlja veličinu ploče i broj mina prema težini ili karijernom nivou.
 * @param {string} m - Naziv moda igre (npr. "Career", "Training", "MineDash")
 */
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
    } else if (mode === "ZenMode") {
        size = 12; mines = 25;
    } else if (mode === "Fog") {
        size = 15; mines = 35;
    }

    initGame();
}

/**
 * Inicijalizira igračku ploču (Grid), kreira DOM elemente i postavlja mine.
 * Upravlja specifičnim startnim vizualima za memorijske modove (TreasureHunter).
 * @param {number} seed - Opcionalni seed za determinističko generiranje (Daily Challenge)
 */
function initGame(seed = null) {
    gameOver = false;
    gameStarted = true;
    hasDefuseKit = false; 
    radarActive = false;
    isReplaying = false;
    gameReplay = [];
    startTime = Date.now();
    resetTimer();
    
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("hud").classList.remove("hidden");
    document.getElementById("game-container").classList.remove("hidden");
    
    const currentUserEl = document.getElementById("current-user");
    if(currentUserEl) currentUserEl.innerText = currentUser;

    const levelVal = document.getElementById("level-val");
    if(levelVal) levelVal.innerText = (mode === "Career") ? level : (mode === "ChainReaction" ? chainReactionEnergy : "T");

    const mineVal = document.getElementById("mine-val");
    if(mineVal) mineVal.innerText = (mode === "MineDash") ? "∞" : mines;
    
    gameDiv.innerHTML = "";
    if (mode === "Fog") gameDiv.classList.add("foggy");
    else gameDiv.classList.remove("foggy");

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
            div.style.fontSize = `min(1.1rem, calc(80vw / ${size} * 0.5))`; 
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
            if(window.startTimer) window.startTimer();
        }, 2000);
    } else if (mode === "ChainReaction") {
        if(window.startTimer) window.startTimer();
        setupChainReaction();
    } else {
        if(window.startTimer) window.startTimer();
    }
}

/**
 * Priprema ploču za Chain Reaction mod (Puzzle). 
 * Otkriva dio sigurne zone na početku.
 */
function setupChainReaction() {
    chainReactionEnergy = 3;
    const lv = document.getElementById("level-val");
    if(lv) lv.innerText = chainReactionEnergy;
    
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

/**
 * Nasumično postavlja mine na ploči. 
 * Koristi Mulberry32 seed algoritam ako se igra Daily Challenge.
 */
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

/**
 * Izračunava broj susjednih mina za svako polje na mreži.
 */
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

/**
 * Glavni ulaz za korisnički klik. Upravlja chordingom, radarom i replay snimanjem.
 * @param {number} x, y - Koordinate polja
 * @param {boolean} isReplay - Označava je li klik dio replay reprodukcije
 */
function handleCellClick(x, y, isReplay = false) {
    if (gameOver || !gameStarted || (isReplaying && !isReplay)) return;
    
    // Ripple efekt feedback
    const div = document.getElementById(`cell-${x}-${y}`);
    if(div && window.createRipple) window.createRipple(div);

    if (radarActive && !isReplaying) {
        radarScan(x, y);
        return;
    }

    if (!isReplay && !isReplaying) {
        gameReplay.push({ type: 'click', x, y, time: Date.now() - startTime });
    }

    // Chording (klik na broj)
    if (grid[y][x].open && grid[y][x].count > 0) {
        let flags = 0;
        iterateNeighbors(x, y, (nx, ny) => { if (grid[ny][nx].flagged) flags++; });
        if (flags === grid[y][x].count) {
            if(SFX) SFX.playClick();
            iterateNeighbors(x, y, (nx, ny) => {
                if (!grid[ny][nx].flagged && !grid[ny][nx].open) {
                    processCellClick(nx, ny);
                }
            });
            if (mode === "Fog") updateFog();
        }
        return;
    }

    if (grid[y][x].flagged || grid[y][x].open) return;
    
    processCellClick(x, y);
    if (mode === "Fog") updateFog();
}

/**
 * Procesira fizičko otvaranje polja, provjerava mine, Zen mod i defuse kit.
 */
function processCellClick(x, y) {
    if (gameOver || grid[y][x].flagged || grid[y][x].open) return;
    
    if (mode === "MineDash") {
        if (x !== mineDashCurrentCol) return;
        if (grid[y][x].mine) {
            mineDashCurrentCol = 0;
            grid.forEach(row => row.forEach(c => {
                c.open = false;
                let div = document.getElementById(`cell-${c.x}-${c.y}`);
                if(div) { div.classList.remove("open"); div.innerText = ""; }
            }));
            document.body.classList.add("shake");
            setTimeout(() => document.body.classList.remove("shake"), 300);
        } else {
            grid[y][x].open = true;
            let div = document.getElementById(`cell-${x}-${y}`);
            if(div) { div.classList.add("open"); div.innerHTML = Icons.check; }
            if(SFX) SFX.playClick();
            mineDashCurrentCol++;
            timeLeft += 2;
            if (mineDashCurrentCol >= size) {
                gameOver = true;
                if(window.stopTimer) window.stopTimer();
                if(window.saveProgress) window.saveProgress(level, true, size); 
                if(window.showOverlay) window.showOverlay("POBJEDA!", `Sjajno! Preostalo vrijeme: ${timeLeft}s`);
            }
        }
        return;
    }

    if (grid[y][x].mine) {
        if (mode === "ZenMode") {
            grid[y][x].open = true;
            let div = document.getElementById(`cell-${x}-${y}`);
            if(div) { div.classList.add("open"); div.innerHTML = Icons.check; }
            if(SFX) SFX.playClick();
            checkWin();
            return;
        }

        if (hasDefuseKit) {
            hasDefuseKit = false;
            if(SFX) SFX.playBoom(); 
            document.body.classList.add("shake");
            setTimeout(() => document.body.classList.remove("shake"), 300);
            grid[y][x].mine = false;
            calculateNumbers(); 
            revealCell(x, y);
            return;
        } else {
            if (isInvincible) {
                let div = document.getElementById(`cell-${x}-${y}`);
                if(div) { div.classList.add("mine"); div.innerHTML = Icons.mine; }
                grid[y][x].open = true;
                if(SFX) SFX.playBoom();
                return;
            }
            triggerGameOver(x, y);
        }
    } else {
        if(SFX) SFX.playClick();
        revealCell(x, y);
        checkWin();
    }
}

/**
 * Aktivira radarski puls koji privremeno otkriva sadržaj polja u 3x3 radiusu.
 */
function radarScan(x, y) {
    radarActive = false;
    document.body.classList.remove("cursor-target");
    if(SFX) SFX.playBoom(); 
    
    const radarHighlight = (nx, ny) => {
        let div = document.getElementById(`cell-${nx}-${ny}`);
        if(!div) return;
        div.classList.add("radar-pulse");
        if (grid[ny][nx].mine) {
            div.innerHTML = Icons.mine;
        } else {
            div.innerText = grid[ny][nx].count || "";
        }
        
        setTimeout(() => {
            div.classList.remove("radar-pulse");
            if (!grid[ny][nx].open) {
                div.innerHTML = grid[ny][nx].flagged ? Icons.flag : "";
                div.innerText = "";
            }
        }, 2500);
    };

    iterateNeighbors(x, y, (nx, ny) => radarHighlight(nx, ny));
    radarHighlight(x, y);
}

/**
 * Rekurzivna funkcija za otkrivanje polja (Flood Fill).
 * Ako je polje prazno (count=0), otvara sve susjede.
 */
function revealCell(x, y) {
    let cell = grid[y][x];
    if (cell.open || cell.flagged) return;
    
    cell.open = true;
    let div = document.getElementById(`cell-${x}-${y}`);
    if(!div) return;
    div.classList.add("open");
    
    if (cell.count > 0) {
        div.innerText = cell.count;
        div.style.color = ["", "#00d2ff", "#4CAF50", "#ff4b2b", "#9c27b0", "#ffeb3b", "#ec407a", "#1a1a1a"][cell.count];
    } else {
        iterateNeighbors(x, y, (nx, ny) => revealCell(nx, ny));
    }
}

/**
 * Postavlja ili uklanja zastavicu na polje (Desni klik).
 * Upravlja energijom u Chain Reaction modu.
 */
function toggleFlag(x, y, isReplay = false) {
    if (gameOver || !gameStarted || grid[y][x].open || (isReplaying && !isReplay)) return;
    
    if (!isReplay && !isReplaying) {
        gameReplay.push({ type: 'flag', x, y, time: Date.now() - startTime });
    }
    
    if (mode === "ChainReaction") {
        if (!grid[y][x].flagged) {
            if (!grid[y][x].mine) {
                chainReactionEnergy--;
                const lvVal = document.getElementById("level-val");
                if(lvVal) lvVal.innerText = chainReactionEnergy;
                document.body.classList.add("shake");
                let div = document.getElementById(`cell-${x}-${y}`);
                if(div) {
                    let oldBg = div.style.background;
                    div.style.background = "#ff4b2b";
                    setTimeout(() => div.style.background = oldBg, 500);
                }
                setTimeout(() => document.body.classList.remove("shake"), 300);
                
                if (chainReactionEnergy <= 0) triggerGameOver(x, y);
                return;
            } else {
                grid[y][x].flagged = true;
                let div = document.getElementById(`cell-${x}-${y}`);
                if(div) { div.classList.add("flagged"); div.innerHTML = Icons.flag; }
                
                let flaggedMines = 0;
                grid.forEach(row => row.forEach(c => {
                    if (c.mine && c.flagged) flaggedMines++;
                }));
                if (flaggedMines === mines) {
                    gameOver = true;
                    if(window.stopTimer) window.stopTimer();
                    if(window.saveProgress) window.saveProgress(level, true, mines);
                    if(window.showOverlay) window.showOverlay("POBJEDA!", `Uspješno ste riješili Puzzle Mode!`);
                }
                return;
            }
        } else {
            grid[y][x].flagged = false;
            let div = document.getElementById(`cell-${x}-${y}`);
            if(div) { div.classList.remove("flagged"); div.innerHTML = ""; }
            return;
        }
    }

    grid[y][x].flagged = !grid[y][x].flagged;
    let div = document.getElementById(`cell-${x}-${y}`);
    if(!div) return;
    div.classList.toggle("flagged");
    div.innerHTML = grid[y][x].flagged ? Icons.flag : "";
}

/**
 * Zaustavlja igru i pokreće dramatičnu sekvencu otkrivanja mina.
 * @param {number} hitX, hitY - Koordinate mine koja je aktivirala poraz
 */
function triggerGameOver(hitX = -1, hitY = -1) {
    gameOver = true;
    if(window.stopTimer) window.stopTimer();
    document.body.classList.add("shake");
    if(SFX) SFX.playBoom();
    
    if (hitX !== -1 && hitY !== -1) {
        let hitCell = document.getElementById(`cell-${hitX}-${hitY}`);
        if(hitCell) { hitCell.classList.add("mine", "hit-mine"); hitCell.innerHTML = Icons.explosion; }
    }

    let openedCount = 0;
    grid.forEach(row => row.forEach(c => { if (c.open && !c.mine) openedCount++; }));

    if(window.saveProgress) window.saveProgress(level, false, openedCount);

    let hiddenMines = [];
    let wrongFlags = [];

    grid.forEach(row => row.forEach(c => {
        if (c.mine && !c.open && !(c.x === hitX && c.y === hitY)) hiddenMines.push(c);
        if (c.flagged && !c.mine) wrongFlags.push(c);
    }));

    hiddenMines.sort(() => Math.random() - 0.5);

    hiddenMines.forEach((c, i) => {
        setTimeout(() => {
            let d = document.getElementById(`cell-${c.x}-${c.y}`);
            if(!d) return;
            if (c.flagged) d.classList.remove("flagged");
            d.classList.add("mine", "mine-reveal-anim");
            d.innerHTML = Icons.mine;
            if(SFX) SFX.playClick();
        }, i * 250); 
    });

    let flagStart = (hiddenMines.length * 250) + 500;
    wrongFlags.forEach((c, i) => {
        setTimeout(() => {
            let d = document.getElementById(`cell-${c.x}-${c.y}`);
            if(!d) return;
            d.classList.add("wrong-flag-fall");
            setTimeout(() => {
                d.classList.remove("flagged");
                d.innerHTML = Icons.wrong;
            }, 600);
        }, flagStart + (i * 200));
    });

    let overlayDelay = flagStart + (wrongFlags.length * 200) + 1200;
    setTimeout(() => {
        document.body.classList.remove("shake");
        if(window.showOverlay) window.showOverlay("MISIJA NEUSPJEŠNA", "Aktivirali ste minu. Pokušajte ponovno.");
    }, overlayDelay);
}

/**
 * Provjerava jesu li sva sigurna polja otvorena (pobijeđena partija).
 * Izračunava APM i generira slavljenički modal.
 */
async function checkWin() {
    let openedSafe = 0;
    grid.forEach(row => row.forEach(c => { if(c.open && !c.mine) openedSafe++; }));
    
    if (openedSafe === (size * size) - mines) {
        gameOver = true;
        if(window.stopTimer) window.stopTimer();
        
        let durationMins = Math.max((Date.now() - startTime) / 60000, 0.01);
        let apm = Math.round(gameReplay.length / durationMins);
        
        if (mode === "Career" && !isGuest) {
            level++;
            if(window.saveProgress) window.saveProgress(level, true, mines);
        } else {
            if(window.saveProgress) window.saveProgress(level, true, mines);
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
        if(window.showOverlay) window.showOverlay("POBJEDA!", winMsg);
    }
}

/**
 * Pomoćna funkcija za iteraciju kroz 8 susjeda polja (x, y).
 */
function iterateNeighbors(x, y, callback) {
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            let nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < size && ny >= 0 && ny < size && !(dx === 0 && dy === 0)) callback(nx, ny);
        }
    }
}

/**
 * Upravlja vizualnim efektom magle u radiusu oko otvorenih polja.
 */
function updateFog() {
    grid.forEach(row => row.forEach(c => {
        if (c.open) {
            let d = document.getElementById(`cell-${c.x}-${c.y}`);
            if (d && !d.classList.contains("fog-revealed")) d.classList.add("fog-revealed");
            iterateNeighbors(c.x, c.y, (nx, ny) => {
                let nd = document.getElementById(`cell-${nx}-${ny}`);
                if (nd && !nd.classList.contains("fog-revealed")) nd.classList.add("fog-revealed");
            });
        }
    }));
}
