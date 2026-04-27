/**
 * MINESWEEPER PRO+ - TIME & APM TRACKING SYSTEM
 * 
 * Ovaj file upravlja sinkronizacijom vremena i live kalkulacijom akcija.
 */

/**
 * Pokreće interval timera (1 sekunda).
 */
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    if (mode === "MineDash") {
        timeLeft = 20; 
        document.getElementById("timer-val").innerText = timeLeft + "s";
    }

    timerInterval = setInterval(() => {
        if (mode === "MineDash") {
            timeLeft--;
            const timerVal = document.getElementById("timer-val");
            if(timerVal) timerVal.innerText = timeLeft + "s";
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                if(window.triggerGameOver) window.triggerGameOver();
            }
        } else {
            secondsPassed++;
            const timerVal = document.getElementById("timer-val");
            if(timerVal) timerVal.innerText = formatTime(secondsPassed);
        }

        // Live APM kalkulacija
        calculateLiveAPM();
    }, 1000);
}

/**
 * Izračunava "Actions Per Minute" u stvarnom vremenu na temelju gameReplay niza.
 */
function calculateLiveAPM() {
    const apmVal = document.getElementById("apm-val");
    if (!apmVal || !gameReplay.length) return;

    let durationMins = Math.max((Date.now() - startTime) / 60000, 0.01);
    let apm = Math.round(gameReplay.length / durationMins);
    
    apmVal.innerText = apm;
}

/**
 * Zaustavlja timer interval.
 */
function stopTimer() {
    clearInterval(timerInterval);
}

/**
 * Resetira vrijednosti vremena i APM-a.
 */
function resetTimer() {
    secondsPassed = 0;
    timeLeft = 0;
    const timerVal = document.getElementById("timer-val");
    const apmVal = document.getElementById("apm-val");
    if(timerVal) timerVal.innerText = "00:00";
    if(apmVal) apmVal.innerText = "0";
}

/**
 * Pomoćna funkcija za formatiranje u MM:SS.
 */
function formatTime(s) {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs);
}
