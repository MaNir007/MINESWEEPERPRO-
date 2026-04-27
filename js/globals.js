/**
 * MINESWEEPER PRO+ - GLOBAL STATE & CONSTANTS
 * 
 * Ovaj file drži sve globalne varijable koje dijele ostale JS skripte.
 * Sadrži konfiguracije karijere, zvučne efekte i pomoćne generatore.
 */

// --- GLOBALNO STANJE ---
let grid = [];               // Matrica koja drži objekte stanja svakog polja
let size = 10;               // Trenutna širina/visina ploče
let mines = 15;              // Trenutni broj postavljenih mina
let mode = "";               // Naziv aktivnog moda igre
let level = 1;               // Trenutni nivo karijere korisnika
let totalMinesCleared = 0;   // Kumulativna statistika
let gameOver = false;        // Flag koji zaustavlja sve interakcije na kraju
let currentUser = null;      // Ime ulogiranog agenta
let isGuest = false;         // Označava gostujući mod (nema spremanja)

// --- TIMER VARIJABLE ---
let timerInterval = null;
let secondsPassed = 0;
let timeLeft = 0;            // Koristi se za Mine Dash (vrijeme se smanjuje)

// --- MINIGAME SPECIFIČNE VARIJABLE ---
let mineDashCurrentCol = 0;
let chainReactionEnergy = 3;
let gameStarted = true;

// --- TRGOVINA, APM I REPLAY ---
let playerCoins = 0;
let hasDefuseKit = false;
let radarActive = false;
let gameReplay = [];        // Niz koji snima svaki klik (x, y, type, time)
let isReplaying = false;
let startTime = 0;

// --- CHEAT / EASTER EGG FLAGS ---
let isInvincible = false;
let isXrayActive = false;

/**
 * Deterministički generator nasumičnih brojeva (PRNG).
 * Koristi se za generiranje identične mape za sve igrače (Daily Challenge).
 * @param {number} a - Seed vrijednost
 */
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

const gameDiv = document.getElementById("game");
const overlay = document.getElementById("message-overlay");

/**
 * Konfiguracija težine za Karijera mod.
 */
const careerLevels = [
    { size: 6, mines: 4 },
    { size: 8, mines: 10 },
    { size: 10, mines: 18 },
    { size: 12, mines: 28 },
    { size: 14, mines: 42 },
    { size: 16, mines: 60 }
];

// --- ZVUČNI EFEKTI (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/**
 * SFX Objekt s metodama za generiranje proceduralnih zvukova.
 * Ne koristi .wav fajlove već sintetizira zvuk direktno.
 */
const SFX = {
    /** Generira kratki visoki ton ('klik'). */
    playClick: function() {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    },
    
    /** Generira niski šum s filterom koji simulira eksploziju. */
    playBoom: function() {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const bufferSize = audioCtx.sampleRate * 1.5;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 1.2);
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.8, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        noise.start();
    }
};
