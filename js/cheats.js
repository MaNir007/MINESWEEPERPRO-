/**
 * MINESWEEPER PRO+ - DEVELOPER CONSOLE & CHEATS
 * 
 * Ovaj file je isključivo za razvojne svrhe (Debug).
 * Omogućuje developerima testiranje rubnih slučajeva putem konzole.
 */

/**
 * Aktivira X-Ray viziju. Sva polja na ploči postaju prozirna.
 * (Otkriva mine bez pokretanja eksplozije).
 */
window.xray = function() {
    isXrayActive = !isXrayActive;
    grid.forEach(row => row.forEach(c => {
        let div = document.getElementById(`cell-${c.x}-${c.y}`);
        if(!div) return;
        if (isXrayActive) {
            div.style.opacity = "0.5";
            if (c.mine) div.style.background = "rgba(255,0,0,0.3)";
        } else {
            div.style.opacity = "1";
            div.style.background = "";
        }
    }));
    console.log("X-RAY " + (isXrayActive ? "AKTIVAN" : "ISKLJUČEN"));
};

/**
 * Aktivira God Mode (Besmrtnost).
 * Igrač može kliknuti na minu, ona će se pojaviti, ali igra neće završiti.
 */
window.godmode = function() {
    isInvincible = !isInvincible;
    console.log("GODMODE " + (isInvincible ? "AKTIVAN" : "ISKLJUČEN"));
};

/**
 * Poklanja novčiće korisniku.
 * @param {number} n - Broj novčića (default 1000)
 */
window.addCoins = function(n = 1000) {
    playerCoins += n;
    const coinsEl = document.getElementById("coins-display");
    if(coinsEl) coinsEl.innerText = playerCoins;
    console.log(`Dodano ${n} novčića.`);
};

// ... i ostale pomoćne funkcije ...
console.log("MINESWEEPER PRO+ CHEATS LOADED");
console.log("Dostupne komande: xray(), godmode(), addCoins(n), radar(), defuse(), instaWin(), setSpeed(f), clearArea(n)");
