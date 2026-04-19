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
let timeLeft = 0;

// Minigame varijable
let mineDashCurrentCol = 0;
let chainReactionEnergy = 3;
let gameStarted = true;

// Trgovina, APM i Replay
let playerCoins = 0;
let hasDefuseKit = false;
let radarActive = false;
let gameReplay = [];
let isReplaying = false;
let startTime = 0;

// Cheat / Easter Egg flags
let isInvincible = false;
let isXrayActive = false;

// Seed generator for Daily Challenge
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Ikone su definirane kao inline SVG kod u svg-loader.js (pregledaj svg-icons.html za vizualni pregled)

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

// --- ZVUČNI EFEKTI (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const SFX = {
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
    
    playBoom: function() {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const bufferSize = audioCtx.sampleRate * 1.5;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
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
