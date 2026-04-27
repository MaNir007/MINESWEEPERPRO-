/**
 * MINESWEEPER PRO+ - NETWORK API CLIENT
 * 
 * Ovaj file upravlja AJAX komunikacijom sa backend serverom (api.php).
 * Služi za autentifikaciju, spremanje progresa i kupnju predmeta u trgovini.
 */

/**
 * Glavni ulaz za prijavu iz HTML-a. Dohvaća podatke iz input polja.
 */
window.login = async function() {
    const user = document.getElementById("username-input").value;
    if (!user) {
        if(window.Notifier) Notifier.error("Unesite ime agenta.");
        else alert("Unesite ime agenta.");
        return;
    }
    
    try {
        const response = await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=login&username=${encodeURIComponent(user)}`
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            currentUser = user;
            playerCoins = parseInt(data.coins);
            level = parseInt(data.level);
            isGuest = false;
            if(window.showMenu) showMenu();
        } else {
            if(window.Notifier) Notifier.error("Greška: " + data.message);
            else alert("Greška: " + data.message);
        }
    } catch (e) {
        console.error("Mrežna greška:", e);
    }
};

/**
 * Ulazna funkcija za igranje kao gost.
 */
window.playAsGuest = function() {
    currentUser = "Gost";
    playerCoins = 0;
    level = 1;
    isGuest = true;
    if(window.showMenu) showMenu();
};

/**
 * Šalje informaciju o pobjedi/porazu na server.
 * @param {number} newLevel - Novi dosegnuti nivo
 * @param {boolean} isWin - Rezultat partije
 * @param {number} score - Broj bodova/mina
 */
window.saveProgress = async function(newLevel, isWin, score) {
    if (isGuest) return;
    
    try {
        const response = await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=save_progress&username=${encodeURIComponent(currentUser)}&level=${newLevel}&is_win=${isWin ? 1 : 0}&score=${score}`
        });
        const data = await response.json();
        if (data.status === 'success') {
            playerCoins = parseInt(data.coins);
            const coinsEl = document.getElementById("coins-display");
            if(coinsEl) coinsEl.innerText = playerCoins;
        }
    } catch (e) {
        console.error("Spremanje nije uspjelo:", e);
    }
};

/**
 * Obrađuje transakciju kupnje u trgovini.
 * @param {string} type - 'radar' ili 'defuse'
 * @param {number} cost - Cijena predmeta
 */
window.buyPerk = async function(type, cost) {
    if (playerCoins < cost) {
        if(window.Notifier) Notifier.warning("NEDOVOLJNO COINSA!");
        return;
    }
    
    if (isGuest) {
        playerCoins -= cost;
        const coinsEl = document.getElementById("coins-display");
        if(coinsEl) coinsEl.innerText = playerCoins;
        activatePerk(type);
        return;
    }

    try {
        const response = await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=buy_perk&username=${encodeURIComponent(currentUser)}&type=${type}&cost=${cost}`
        });
        const data = await response.json();
        if (data.status === 'success') {
            playerCoins = parseInt(data.coins);
            const coinsEl = document.getElementById("coins-display");
            if(coinsEl) coinsEl.innerText = playerCoins;
            activatePerk(type);
        } else {
            if(window.Notifier) Notifier.error("TRANSAKCIJA ODBIJENA!");
        }
    } catch (e) {
        console.error("Greška pri kupnji:", e);
    }
};

/**
 * Aktivira kupljeni predmet.
 * @param {string} type - Vrsta aktiviranog perka
 */
window.activatePerk = function(type) {
    if (type === 'radar') {
        radarActive = true;
        document.body.classList.add("cursor-target");
        if(window.Notifier) Notifier.success("RADAR AKTIVAN - ODABERI CILJ");
    } else {
        hasDefuseKit = true;
        if(window.Notifier) Notifier.success("OKLOP OPREMLJEN!");
    }
};

/**
 * Dohvaća top listu igrača sa servera.
 */
window.fetchLeaderboard = async function() {
    try {
        const response = await fetch('api.php?action=leaderboard');
        const data = await response.json();
        const list = document.getElementById("leaderboard-list");
        if (!list) return;
        
        list.innerHTML = "";
        data.forEach((entry, i) => {
            const div = document.createElement("div");
            div.className = "leaderboard-item";
            div.innerHTML = `<span>#${i+1} ${entry.username}</span><span>LVL ${entry.level}</span>`;
            list.appendChild(div);
        });
    } catch (e) {
        console.error("Leaderboard nedostupan.");
    }
};
