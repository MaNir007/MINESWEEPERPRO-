// --- AUTH & API LOGIKA ---
async function login() {
    const nameInput = document.getElementById("username-input");
    const name = nameInput.value.trim();
    
    if (name.length < 3) return Notifier.error("Agent: Identitet prekratak (min. 3 znaka)!");

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
            playerCoins = parseInt(data.coins) || 0;
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

async function saveProgress(newLvl, won = false, minesCleared = 0) {
    if (isGuest) return;
    
    const formData = new FormData();
    formData.append("username", currentUser);
    formData.append("level", newLvl);
    formData.append("won", won ? 1 : 0);
    formData.append("mines_cleared", minesCleared);

    try {
        await fetch("api.php?action=save", { method: "POST", body: formData });
        localStorage.setItem(`ms_pro_level_${currentUser}`, newLvl);
    } catch (e) { console.error("API Save Error"); }
}

async function fetchLeaderboard() {
    try {
        const response = await fetch("api.php?action=leaderboard");
        const data = await response.json();
        
        const list = document.getElementById("leaderboard-list");
        list.innerHTML = "";
        
        if (data.status === "success" && data.leaderboard && data.leaderboard.length > 0) {
            data.leaderboard.forEach((player, index) => {
                const li = document.createElement("li");
                li.className = "leaderboard-item";
                
                let color = "white";
                if (index === 0) color = "#ffeb3b"; // Gold
                else if (index === 1) color = "#e0e0e0"; // Silver
                else if (index === 2) color = "#cd7f32"; // Bronze
                
                let hs = player.high_score_mines ? ` | HS: ${player.high_score_mines}💣` : '';
                li.innerHTML = `<span style="color:${color}"><b>${index + 1}.</b> ${player.username}</span> 
                                <span style="color:var(--primary)">Lvl: ${player.level} <span style="font-size:0.7em; color:var(--mine);">${hs}</span></span>`;
                list.appendChild(li);
            });
        } else {
            list.innerHTML = `<li class="leaderboard-empty">Nema podataka</li>`;
        }
    } catch (e) {
        document.getElementById("leaderboard-list").innerHTML = `<li class="leaderboard-empty">Greška pri učitavanju</li>`;
    }
}

async function buyPerk(type, cost) {
    if (isGuest) { alert("Gosti nemaju pristup Crnom tržištu."); return; }
    if (playerCoins < cost) { alert("Nemaš dovoljno novčića (mina)!"); return; }
    
    const fd = new FormData();
    fd.append("username", currentUser);
    fd.append("cost", cost);
    
    try {
        const response = await fetch("api.php?action=buy", { method: "POST", body: fd });
        const data = await response.json();
        if (data.status === "success") {
            playerCoins = data.new_balance;
            document.getElementById("coins-display").innerText = playerCoins;
            
            if (type === 'radar') {
                radarActive = true;
                document.body.classList.add("cursor-target");
                alert("Radar je napunjen! Sljedeći klik na polje vrši skeniranje 3x3 perimetra.");
            } else if (type === 'defuse') {
                hasDefuseKit = true;
                alert("Oklop aktiviran! Prvi krivi korak na minu je zaštićen.");
            }
        } else {
            alert(data.message);
        }
    } catch (e) {
        console.error("Greška kupnje", e);
    }
}
