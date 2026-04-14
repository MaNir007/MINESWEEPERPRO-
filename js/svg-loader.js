// --- SVG LOADER ---
// SVG ikone su sada definirane kao inline SVG kod.
// Nema više fetch() poziva — sve je čitljivo direktno iz koda.
// Izvorni SVG kod se može pregledati na stranici: svg-icons.html

const Icons = {

    // ===== BOLT (Munja) =====
    bolt: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2 L5 14 h6 l-2 8 L21 10 h-6 l2 -8z"
              fill="#ffeb3b" stroke="#f57f17" stroke-width="1"
              stroke-linejoin="round"/>
    </svg>`,

    // ===== CHECK (Kvačica) =====
    check: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <style>
            .check-path {
                stroke-dasharray: 40;
                stroke-dashoffset: 40;
                animation: drawCheck 0.5s ease-out forwards;
            }
            @keyframes drawCheck {
                to { stroke-dashoffset: 0; }
            }
        </style>
        <path d="M5 12l5 5L20 7"
              fill="none" stroke="#00d2ff" stroke-width="3"
              stroke-linecap="round" stroke-linejoin="round"
              class="check-path"/>
    </svg>`,

    // ===== COIN (Novčić) =====
    coin: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#ffeb3b" stroke="#f57f17" stroke-width="2"/>
        <circle cx="12" cy="12" r="6" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.5"/>
        <path d="M12 7 v10 M10 9 h4 M10 15 h4"
              stroke="#f57f17" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    // ===== EXPLOSION (Eksplozija) =====
    explosion: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <style>
            .burst {
                animation: burstExpand 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite;
                transform-origin: center;
            }
            @keyframes burstExpand {
                0%   { transform: scale(0.5) rotate(0deg);   opacity: 1;   stroke: #ffeb3b; }
                50%  { transform: scale(1.2) rotate(45deg);  opacity: 0.8; stroke: #ff4b2b; }
                100% { transform: scale(0.8) rotate(90deg);  opacity: 0;   stroke: #9c27b0; }
            }
            .core {
                animation: corePulse 1s infinite alternate;
                transform-origin: center;
            }
            @keyframes corePulse {
                from { transform: scale(1); }
                to   { transform: scale(2.5); fill: #ffffff; }
            }
        </style>
        <path d="M12 2l2 4 4-2-1 4 4 1-3 3 3 3-4 1 1 4-4-2-2 4-2-4-4 2 1-4-4-1 3-3-3-3 4-1-1-4 4 2z"
              fill="none" stroke="#ff4b2b" stroke-width="2" class="burst"/>
        <circle cx="12" cy="12" r="3" fill="#ffeb3b" class="core"/>
    </svg>`,

    // ===== FLAG (Zastavica) =====
    flag: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 22V2 M6 4l12 4-12 4"
              fill="none" stroke="#ff4b2b" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="6" cy="2" r="1.5" fill="#ffeb3b"/>
    </svg>`,

    // ===== MINE (Mina) =====
    mine: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <style>
            .fuse-spark {
                stroke-dasharray: 10;
                animation: fuseBurn 1s linear infinite;
            }
            @keyframes fuseBurn {
                0%   { stroke-dashoffset: 10; }
                100% { stroke-dashoffset: 0; }
            }
            .mine-blink {
                animation: mineBlink 1s infinite alternate;
                transform-origin: center;
            }
            @keyframes mineBlink {
                from { fill: #ff4b2b; transform: scale(1); }
                to   { fill: #ffeb3b; transform: scale(1.5); }
            }
        </style>
        <circle cx="12" cy="14" r="6" fill="rgba(0,0,0,0.5)" stroke="#ff4b2b" stroke-width="2"/>
        <rect x="10" y="5" width="4" height="3" fill="#ff4b2b"/>
        <path d="M12 5 C 12 1, 15 1, 16 3"
              fill="none" stroke="#ffeb3b" stroke-width="1.5"
              stroke-linecap="round" class="fuse-spark"/>
        <circle cx="12" cy="14" r="2" fill="#ff4b2b" class="mine-blink"/>
    </svg>`,

    // ===== STOPWATCH (Štoperica) =====
    stopwatch: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="14" r="8" fill="none" stroke="#00d2ff" stroke-width="2"/>
        <rect x="10" y="3" width="4" height="3" rx="1" fill="#00d2ff"/>
        <path d="M12 10 v4 l3 2"
              fill="none" stroke="#00d2ff" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18 7 l2 -2"
              stroke="#00d2ff" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    // ===== TARGET (Nišan) =====
    target: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#111" stroke-width="2"/>
        <circle cx="12" cy="12" r="6" fill="none" stroke="#111" stroke-width="2"/>
        <circle cx="12" cy="12" r="2" fill="#111"/>
        <path d="M12 2 v4 M12 18 v4 M2 12 h4 M18 12 h4"
              stroke="#111" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    // ===== TROPHY (Pehar) =====
    trophy: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <style>
            .trophy-gem {
                animation: gemGlow 1.5s infinite alternate;
                transform-origin: center;
            }
            @keyframes gemGlow {
                from { opacity: 0.5; filter: blur(1px); }
                to   { opacity: 1;   filter: blur(2px) drop-shadow(0 0 8px #00d2ff); }
            }
        </style>
        <path d="M4 4h16v6a8 8 0 0 1-16 0z"
              fill="none" stroke="#ffeb3b" stroke-width="2"/>
        <path d="M12 18v4 m-4 0h8"
              stroke="#ffeb3b" stroke-width="2" stroke-linecap="round"/>
        <path d="M4 7H2v2a3 3 0 0 0 3 3h2 m13-5h2v2a3 3 0 0 1-3 3h-2"
              fill="none" stroke="#ffeb3b" stroke-width="2"/>
        <circle cx="12" cy="10" r="2" fill="#00d2ff" class="trophy-gem"/>
    </svg>`,

    // ===== WRONG (Pogrešno/X) =====
    wrong: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6l12 12" 
              stroke="#ff4b2b" stroke-width="3" 
              stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
};

// Dodaj CSS klase na SVG-ove za animacije (kao i prije)
Icons.mine = Icons.mine.replace('<svg', '<svg class="animated-mine"');
Icons.flag = Icons.flag.replace('<svg', '<svg class="animated-flag"');
Icons.check = Icons.check.replace('<svg', '<svg class="animated-check"');
Icons.trophy = Icons.trophy.replace('<svg', '<svg class="animated-trophy"');
Icons.explosion = Icons.explosion.replace('<svg', '<svg class="animated-explosion"');

// Učitaj inline SVG sadržaj u HTML elemente koji imaju data-svg atribut
function injectStaticSVGs() {
    const targets = document.querySelectorAll('[data-svg]');
    
    for (const el of targets) {
        const name = el.getAttribute('data-svg');
        const svgContent = Icons[name];
        
        if (!svgContent) {
            console.warn(`SVG ikona nije pronađena: ${name}`);
            continue;
        }
        
        // Zadrži dimenzije iz data-atributa
        const w = el.getAttribute('data-width') || '18';
        const h = el.getAttribute('data-height') || '18';
        const cls = el.getAttribute('data-class') || '';
        
        const styled = svgContent.replace('<svg', 
            `<svg width="${w}" height="${h}" class="${cls}"`);
        el.innerHTML = styled;
    }
}

// Pokreni pri učitavanju stranice — sada sinkrono jer nema fetch poziva
document.addEventListener('DOMContentLoaded', () => {
    injectStaticSVGs();
});
