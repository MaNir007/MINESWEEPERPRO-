// --- TIMER LOGIKA ---
function startTimer() {
    if (mode === "MineDash") {
        timeLeft = 30;
        document.getElementById("timer-val").innerText = "00:" + timeLeft;
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                document.getElementById("timer-val").innerText = "00:00";
                triggerGameOver();
            } else {
                let m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
                let s = (timeLeft % 60).toString().padStart(2, '0');
                document.getElementById("timer-val").innerText = `${m}:${s}`;
            }
        }, 1000);
    } else {
        timerInterval = setInterval(() => {
            secondsPassed++;
            let m = Math.floor(secondsPassed / 60).toString().padStart(2, '0');
            let s = (secondsPassed % 60).toString().padStart(2, '0');
            document.getElementById("timer-val").innerText = `${m}:${s}`;
        }, 1000);
    }
}

function stopTimer() { clearInterval(timerInterval); }

function resetTimer() { 
    stopTimer(); 
    secondsPassed = 0; 
    timeLeft = 0; 
    document.getElementById("timer-val").innerText = "00:00"; 
}
