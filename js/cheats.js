/**
 * --- MINESWEEPER PRO+ EASTER EGGS / CHEATS ---
 * Ove funkcije se mogu upisati u konzolu (F12 -> Console) za aktivaciju "power-upova".
 */

// 1. X-RAY: Vidi sve mine kroz polja
function xray() {
    isXrayActive = !isXrayActive;
    
    grid.forEach(row => row.forEach(c => {
        if (c.mine && !c.open) {
            let d = document.getElementById(`cell-${c.x}-${c.y}`);
            if (isXrayActive) {
                // Postavi prozirnu masku mine
                d.style.boxShadow = "inset 0 0 10px rgba(255, 75, 43, 0.8)";
                d.style.background = "rgba(255, 75, 43, 0.2)";
                d.title = "MINA DETEKTIRANA";
            } else {
                // Vrati na staro
                d.style.boxShadow = "";
                d.style.background = "";
                d.title = "";
            }
        }
    }));
    
    console.log(`%c X-RAY ${isXrayActive ? 'AKTIVIRAN' : 'DEAKTIVIRAN'} `, 'background: #ff4b2b; color: #fff; font-weight: bold;');
}

// 2. GOD MODE: Beskonačno života (Mine vas ne mogu ubiti)
function godmode() {
    isInvincible = !isInvincible;
    console.log(`%c GOD MODE ${isInvincible ? 'AKTIVIRAN' : 'DEAKTIVIRAN'} `, 'background: #00d2ff; color: #000; font-weight: bold;');
    if (isInvincible) console.log("Sada možeš klikati na mine bez straha.");
}

// 3. ADD COINS: Dodaj novčiće (npr. addCoins(500))
function addCoins(n = 100) {
    playerCoins += n;
    document.getElementById("coins-display").innerText = playerCoins;
    
    // Sinkronizacija sa serverom kako bi kupnja u shopu radila
    if (typeof saveProgress === "function" && !isGuest) {
        saveProgress(level, false, n); // Spremamo n kao 'mines cleared' što povećava balans
    }
    
    console.log(`%c DODANO ${n} NOVČIĆA. Trenutno stanje: ${playerCoins} `, 'background: #ffeb3b; color: #000; font-weight: bold;');
    console.log("Balans na serveru je također ažuriran.");
}

// 4. INSTA-WIN: Automatski riješi trenutnu mapu
function instaWin() {
    console.log("%c HACKIRANJE SUSTAVA... POBJEDA POTVRĐENA. ", 'color: #4CAF50; font-weight: bold;');
    grid.forEach(row => row.forEach(c => {
        if (!c.mine && !c.open) {
            revealCell(c.x, c.y);
        }
    }));
    checkWin();
}

// 5. BULLET TIME: Uspori ili ubrzaj vrijeme (npr. setSpeed(0.5) za duplo sporije)
function setSpeed(factor = 1) {
    // Ovo utječe na Timer koji broji sekunde
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            secondsPassed++;
            updateTimerDisplay();
        }, 1000 / factor);
        console.log(`%c BRZINA VREMENA POSTAVLJENA NA: ${factor}x `, 'background: #9c27b0; color: #fff;');
    }
}

// 6. CLEAR AREA: Otkrij N nasumičnih sigurnih polja
function clearArea(n = 5) {
    let cleared = 0;
    let safeCells = [];
    grid.forEach(row => row.forEach(c => {
        if (!c.mine && !c.open) safeCells.push(c);
    }));
    
    safeCells.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(n, safeCells.length); i++) {
        revealCell(safeCells[i].x, safeCells[i].y);
        cleared++;
    }
    console.log(`%c Radar otkrio ${cleared} sigurnih polja. `, 'color: #4CAF50;');
    checkWin();
}

// 7. GAVE RADAR: Aktiviraj radar odmah bez kupnje
function radar() {
    radarActive = true;
    document.body.classList.add("cursor-target");
    console.log("%c RADAR AKTIVIRAN (Cheat) ", 'background: #00d2ff; font-weight: bold;');
}

// 8. GIVE DEFUSE: Aktiviraj zaštitu od mina odmah
function defuse() {
    hasDefuseKit = true;
    console.log("%c DEFUSE KIT AKTIVIRAN (Cheat) ", 'background: #4CAF50; color: #fff; font-weight: bold;');
}

console.log("%c MINESWEEPER PRO+ CHEATS LOADED ", 'color: #00d2ff; font-size: 14px; font-weight: bold;');
console.log("Dostupne komande: xray(), godmode(), addCoins(n), radar(), defuse(), instaWin(), setSpeed(f), clearArea(n)");
