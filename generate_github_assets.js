const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'assets');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// 1. HERO BANNER (1280 x 640)
const heroSvg = `
<svg width="1280" height="640" viewBox="0 0 1280 640" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="45%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="neonTitle" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="35%" stop-color="#818cf8" />
      <stop offset="70%" stop-color="#c084fc" />
      <stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>
    <linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="1280" height="640" fill="url(#heroBg)" />

  <circle cx="240" cy="180" r="160" fill="rgba(56, 189, 248, 0.15)" filter="url(#glow)" />
  <circle cx="1060" cy="380" r="190" fill="rgba(192, 132, 252, 0.12)" filter="url(#glow)" />
  <circle cx="640" cy="500" r="140" fill="rgba(99, 102, 241, 0.14)" filter="url(#glow)" />

  <g stroke="rgba(255, 255, 255, 0.03)" stroke-width="1">
    ${Array.from({length: 32}, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="640" />`).join('')}
    ${Array.from({length: 16}, (_, i) => `<line x1="0" y1="${i * 40}" x2="1280" y2="${i * 40}" />`).join('')}
  </g>

  <!-- Header Badge -->
  <rect x="495" y="45" width="290" height="34" rx="17" fill="rgba(99, 102, 241, 0.15)" stroke="rgba(99, 102, 241, 0.4)" stroke-width="1.2" />
  <text x="640" y="67" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#a5b4fc" text-anchor="middle" letter-spacing="1.5">CHROME EXTENSION • MANIFEST V3</text>

  <!-- Big Title -->
  <text x="640" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="url(#neonTitle)" text-anchor="middle" letter-spacing="1">MOMENTUM ARCADE</text>
  
  <!-- Subtitle -->
  <text x="640" y="185" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" fill="#e2e8f0" text-anchor="middle">Your Aesthetic New Tab Oasis with 10 Classic Games &amp; Procedural Lo-Fi</text>

  <!-- Feature Pills -->
  <g transform="translate(640, 225)">
    <g transform="translate(-360, 0)">
      <rect x="0" y="0" width="165" height="34" rx="17" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.12)" />
      <text x="82" y="21" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#38bdf8" text-anchor="middle">🕹️ 10 Classic Games</text>
    </g>
    <g transform="translate(-180, 0)">
      <rect x="0" y="0" width="165" height="34" rx="17" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.12)" />
      <text x="82" y="21" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#a855f7" text-anchor="middle">🎧 Lo-Fi Radio (Web Audio)</text>
    </g>
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="165" height="34" rx="17" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.12)" />
      <text x="82" y="21" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#10b981" text-anchor="middle">⚡ 100% Offline Ready</text>
    </g>
    <g transform="translate(180, 0)">
      <rect x="0" y="0" width="165" height="34" rx="17" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.12)" />
      <text x="82" y="21" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#fbbf24" text-anchor="middle">🔒 Zero Tracking</text>
    </g>
  </g>

  <!-- Browser Window Frame Simulation -->
  <g transform="translate(140, 280)">
    <rect x="-10" y="-10" width="1020" height="340" rx="20" fill="rgba(0, 0, 0, 0.6)" filter="url(#glow)" />
    <rect x="0" y="0" width="1000" height="330" rx="16" fill="rgba(15, 23, 42, 0.95)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" />
    <rect x="0" y="0" width="1000" height="38" rx="16" fill="rgba(30, 41, 59, 0.6)" />
    <circle cx="22" cy="19" r="6" fill="#ef4444" />
    <circle cx="40" cy="19" r="6" fill="#f59e0b" />
    <circle cx="58" cy="19" r="6" fill="#10b981" />
    
    <rect x="320" y="8" width="360" height="22" rx="11" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(255, 255, 255, 0.08)" />
    <text x="500" y="23" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">chrome://newtab — Momentum Arcade</text>
    
    <g transform="translate(0, 38)">
      <rect x="0" y="0" width="1000" height="292" fill="url(#heroBg)" />
      <polygon points="0,292 200,160 400,292" fill="rgba(30, 41, 59, 0.4)" />
      <polygon points="280,292 520,110 780,292" fill="rgba(30, 41, 59, 0.6)" />
      <polygon points="650,292 840,140 1000,240 1000,292" fill="rgba(30, 41, 59, 0.5)" />

      <rect x="740" y="16" width="130" height="32" rx="16" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(255, 255, 255, 0.15)" />
      <text x="805" y="37" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#38bdf8" text-anchor="middle">🎧 Chill Lo-Fi</text>
      <circle cx="895" cy="32" r="16" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(255, 255, 255, 0.15)" />
      <text x="895" y="37" font-size="12" text-anchor="middle" fill="#fff">✦</text>
      <circle cx="935" cy="32" r="16" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(255, 255, 255, 0.15)" />
      <text x="935" y="37" font-size="12" text-anchor="middle" fill="#fff">🔊</text>

      <text x="500" y="85" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="400" fill="rgba(255, 255, 255, 0.8)" text-anchor="middle">Good afternoon</text>
      <text x="500" y="160" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="76" font-weight="200" fill="#ffffff" text-anchor="middle">12:45</text>
      <text x="500" y="195" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="rgba(255, 255, 255, 0.7)" text-anchor="middle">Thursday, October 16</text>

      <rect x="250" y="215" width="500" height="32" rx="16" fill="rgba(15, 23, 42, 0.6)" stroke="rgba(255, 255, 255, 0.1)" />
      <text x="500" y="235" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-style="italic" fill="#cbd5e1" text-anchor="middle">"First, solve the problem. Then, write the code." — John Johnson</text>

      <rect x="400" y="258" width="200" height="30" rx="15" fill="url(#btnGrad)" />
      <text x="500" y="278" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">🎮 Play Games (10 Games)</text>
    </g>
  </g>
</svg>
`;

// 2. ZEN DASHBOARD SCREENSHOT (1280 x 800)
const zenSvg = `
<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="zenSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="35%" stop-color="#0369a1" />
      <stop offset="70%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    <linearGradient id="arcadePill" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>

  <rect width="1280" height="800" fill="url(#zenSky)" />

  <g fill="#ffffff" opacity="0.6">
    ${Array.from({length: 45}, (_, i) => `<circle cx="${(i * 97) % 1280}" cy="${(i * 53) % 400}" r="${(i % 3 === 0) ? 1.5 : 1}" opacity="${0.3 + (i % 5) * 0.15}" />`).join('')}
  </g>

  <polygon points="0,800 240,540 520,800" fill="#0f172a" opacity="0.8" />
  <polygon points="340,800 680,480 1020,800" fill="#090d16" opacity="0.9" />
  <polygon points="800,800 1080,520 1280,680 1280,800" fill="#0f172a" opacity="0.85" />
  <rect x="0" y="760" width="1280" height="40" fill="#090d16" />

  <!-- TOP BAR -->
  <g transform="translate(860, 32)">
    <rect x="0" y="0" width="220" height="46" rx="23" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1.2" />
    <circle cx="24" cy="23" r="14" fill="#6366f1" />
    <polygon points="21,17 30,23 21,29" fill="#ffffff" />
    
    <text x="48" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#ffffff">Chill Lo-Fi Chords</text>
    <text x="48" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" fill="#94a3b8">Procedural • 4 Modes</text>
    
    <g transform="translate(178, 14)" fill="#38bdf8">
      <rect x="0" y="6" width="3" height="12" rx="1.5" />
      <rect x="6" y="2" width="3" height="16" rx="1.5" />
      <rect x="12" y="8" width="3" height="10" rx="1.5" />
      <rect x="18" y="4" width="3" height="14" rx="1.5" />
      <rect x="24" y="9" width="3" height="9" rx="1.5" />
    </g>
  </g>

  <circle cx="1115" cy="55" r="23" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1.2" />
  <text x="1115" y="61" font-size="16" text-anchor="middle" fill="#ffffff">✦</text>

  <circle cx="1175" cy="55" r="23" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1.2" />
  <text x="1175" y="61" font-size="16" text-anchor="middle" fill="#ffffff">🔊</text>

  <text x="640" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="300" fill="rgba(255, 255, 255, 0.9)" text-anchor="middle" letter-spacing="1">Good afternoon</text>
  
  <text x="640" y="405" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="140" font-weight="200" fill="#ffffff" text-anchor="middle" letter-spacing="-2">12:45</text>
  
  <text x="640" y="465" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="rgba(255, 255, 255, 0.85)" text-anchor="middle">Wednesday, October 14</text>

  <g transform="translate(320, 520)">
    <rect x="0" y="0" width="640" height="74" rx="20" fill="rgba(15, 23, 42, 0.6)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.2" />
    <text x="320" y="38" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="17" font-style="italic" fill="#ffffff" text-anchor="middle">"Small daily improvements over time lead to stunning results."</text>
    <text x="320" y="58" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#94a3b8" text-anchor="middle">— Robin Sharma</text>
  </g>

  <g transform="translate(485, 630)">
    <rect x="0" y="0" width="310" height="60" rx="30" fill="url(#arcadePill)" stroke="rgba(255, 255, 255, 0.3)" stroke-width="1.5" />
    <text x="155" y="37" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="19" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">🎮 Play Games (10 Games)</text>
  </g>

  <text x="640" y="740" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#64748b" text-anchor="middle">Press M to toggle game sounds • Click ✦ for scenic wallpapers</text>
</svg>
`;

// 3. ARCADE LOUNGE MODAL SCREENSHOT (1280 x 800)
const arcadeSvg = `
<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="arcBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#030712" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="paddleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
  </defs>

  <rect width="1280" height="800" fill="url(#arcBg)" />
  <circle cx="640" cy="400" r="400" fill="rgba(99, 102, 241, 0.08)" />

  <rect x="140" y="35" width="1000" height="730" rx="28" fill="rgba(15, 23, 42, 0.94)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" />

  <g transform="translate(180, 50)">
    <text x="0" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="800" fill="#ffffff">🕹️ ARCADE LOUNGE</text>
    <text x="460" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="300" fill="#94a3b8" text-anchor="middle">12:45</text>
    
    <rect x="740" y="10" width="110" height="34" rx="17" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.15)" />
    <text x="795" y="32" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#e2e8f0" text-anchor="middle">🔊 Sound: ON</text>

    <rect x="865" y="10" width="55" height="34" rx="17" fill="rgba(239, 68, 68, 0.15)" stroke="rgba(239, 68, 68, 0.3)" />
    <text x="892" y="32" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#f87171" text-anchor="middle">✕</text>
  </g>

  <g transform="translate(165, 105)">
    <rect x="0" y="0" width="950" height="46" rx="14" fill="rgba(30, 41, 59, 0.8)" stroke="rgba(255, 255, 255, 0.08)" />
    
    <g transform="translate(8, 6)">
      <text x="42" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">🐍 Snake</text>
      <text x="135" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">🔢 Sudoku</text>
      <text x="228" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">🔤 Wordle</text>
      <text x="320" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">🧱 Tetris</text>
      
      <rect x="368" y="0" width="110" height="34" rx="10" fill="#6366f1" />
      <text x="423" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">🏓 Bricks</text>
      
      <text x="525" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">🔢 2048</text>
      <text x="612" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">🐦 Cyber Bird</text>
      <text x="705" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">💣 Mines</text>
      <text x="790" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">🏓 Pong</text>
      <text x="880" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">👾 Invaders</text>
    </g>
  </g>

  <g transform="translate(380, 168)">
    <rect x="0" y="0" width="115" height="34" rx="8" fill="rgba(30, 41, 59, 0.85)" stroke="rgba(255, 255, 255, 0.1)" />
    <text x="57" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">SCORE 1,450</text>
    
    <rect x="130" y="0" width="95" height="34" rx="8" fill="rgba(30, 41, 59, 0.85)" stroke="rgba(255, 255, 255, 0.1)" />
    <text x="177" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#38bdf8" text-anchor="middle">LEVEL 2</text>
    
    <rect x="240" y="0" width="110" height="34" rx="8" fill="rgba(30, 41, 59, 0.85)" stroke="rgba(255, 255, 255, 0.1)" />
    <text x="295" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#ef4444" text-anchor="middle">LIVES ❤️❤️❤️</text>

    <rect x="365" y="0" width="150" height="34" rx="8" fill="rgba(30, 41, 59, 0.85)" stroke="rgba(255, 255, 255, 0.1)" />
    <text x="440" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#f59e0b" text-anchor="middle">BEST 3,800</text>
  </g>

  <g transform="translate(390, 215)">
    <rect x="0" y="0" width="500" height="460" rx="16" fill="#0d1117" stroke="rgba(56, 189, 248, 0.4)" stroke-width="2" />
    
    ${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${20 + i * 66}" y="35" width="58" height="20" rx="4" fill="#f43f5e" /><rect x="${22 + i * 66}" y="37" width="54" height="6" rx="2" fill="rgba(255,255,255,0.3)" />`).join('')}
    ${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${20 + i * 66}" y="62" width="58" height="20" rx="4" fill="#fb923c" /><rect x="${22 + i * 66}" y="64" width="54" height="6" rx="2" fill="rgba(255,255,255,0.3)" />`).join('')}
    ${[0, 1, 2, 4, 5, 6].map(i => `<rect x="${20 + i * 66}" y="89" width="58" height="20" rx="4" fill="#06b6d4" /><rect x="${22 + i * 66}" y="91" width="54" height="6" rx="2" fill="rgba(255,255,255,0.3)" />`).join('')}
    ${[0, 2, 3, 4, 6].map(i => `<rect x="${20 + i * 66}" y="116" width="58" height="20" rx="4" fill="#10b981" /><rect x="${22 + i * 66}" y="118" width="54" height="6" rx="2" fill="rgba(255,255,255,0.3)" />`).join('')}

    <circle cx="218" cy="116" r="3" fill="#fbbf24" />
    <circle cx="225" cy="125" r="2.5" fill="#f43f5e" />
    <circle cx="210" cy="130" r="2" fill="#06b6d4" />
    <circle cx="230" cy="110" r="2.8" fill="#38bdf8" />

    <circle cx="235" cy="230" r="4" fill="rgba(255, 255, 255, 0.2)" />
    <circle cx="240" cy="245" r="5.5" fill="rgba(255, 255, 255, 0.5)" />
    <circle cx="245" cy="260" r="7.5" fill="#ffffff" />

    <rect x="195" y="415" width="110" height="14" rx="7" fill="url(#paddleGrad)" stroke="#38bdf8" stroke-width="1.5" />

    <text x="250" y="450" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Mouse or ◄ ► to steer paddle • Space to launch</text>
  </g>

  <g transform="translate(530, 690)">
    <rect x="0" y="0" width="110" height="38" rx="19" fill="#6366f1" />
    <text x="55" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">Start Game</text>
    
    <rect x="125" y="0" width="95" height="38" rx="19" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.15)" />
    <text x="172" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#cbd5e1" text-anchor="middle">Pause</text>
  </g>
</svg>
`;

// 4. VICTORY CELEBRATION & CONFETTI (1280 x 800)
const celebrationSvg = `
<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="celBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
    <linearGradient id="modalCard" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(30, 41, 59, 0.98)" />
      <stop offset="100%" stop-color="rgba(15, 23, 42, 0.99)" />
    </linearGradient>
  </defs>

  <rect width="1280" height="800" fill="url(#celBg)" />

  <g stroke="rgba(255, 255, 255, 0.04)" stroke-width="1">
    ${Array.from({length: 32}, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="800" />`).join('')}
    ${Array.from({length: 20}, (_, i) => `<line x1="0" y1="${i * 40}" x2="1280" y2="${i * 40}" />`).join('')}
  </g>

  <!-- CONFETTI BURST -->
  <g>
    ${[
      {x: 420, y: 220, w: 12, h: 8, r: 24, c: '#f59e0b'},
      {x: 480, y: 160, w: 10, h: 6, r: -35, c: '#ec4899'},
      {x: 390, y: 310, w: 14, h: 9, r: 60, c: '#38bdf8'},
      {x: 820, y: 180, w: 12, h: 7, r: 42, c: '#10b981'},
      {x: 890, y: 250, w: 11, h: 8, r: -18, c: '#a855f7'},
      {x: 760, y: 140, w: 9, h: 6, r: 55, c: '#f43f5e'},
      {x: 340, y: 240, w: 13, h: 9, r: -45, c: '#fbbf24'},
      {x: 940, y: 320, w: 10, h: 7, r: 70, c: '#38bdf8'},
      {x: 460, y: 480, w: 12, h: 8, r: -20, c: '#ec4899'},
      {x: 830, y: 510, w: 14, h: 9, r: 35, c: '#10b981'},
      {x: 310, y: 380, w: 11, h: 7, r: -50, c: '#a855f7'},
      {x: 980, y: 420, w: 12, h: 8, r: 15, c: '#f59e0b'},
      {x: 520, y: 110, w: 10, h: 6, r: -12, c: '#06b6d4'},
      {x: 720, y: 90, w: 12, h: 8, r: 28, c: '#ec4899'},
      {x: 600, y: 80, w: 14, h: 9, r: -65, c: '#fbbf24'},
      {x: 670, y: 70, w: 9, h: 6, r: 40, c: '#10b981'},
      {x: 280, y: 290, w: 13, h: 8, r: 33, c: '#f43f5e'},
      {x: 1020, y: 280, w: 11, h: 7, r: -28, c: '#38bdf8'},
      {x: 400, y: 600, w: 12, h: 8, r: 52, c: '#a855f7'},
      {x: 880, y: 620, w: 10, h: 7, r: -38, c: '#fbbf24'},
      {x: 500, y: 690, w: 14, h: 9, r: 22, c: '#38bdf8'},
      {x: 780, y: 680, w: 11, h: 7, r: -48, c: '#ec4899'},
      {x: 220, y: 450, w: 13, h: 8, r: 18, c: '#10b981'},
      {x: 1060, y: 470, w: 12, h: 8, r: -62, c: '#f59e0b'}
    ].map(p => `
      <g transform="translate(${p.x}, ${p.y}) rotate(${p.r})">
        <rect x="${-p.w/2}" y="${-p.h/2}" width="${p.w}" height="${p.h}" rx="2" fill="${p.c}" opacity="0.9" />
      </g>
    `).join('')}
    
    ${[
      {x: 450, y: 200, r: 4.5, c: '#f59e0b'},
      {x: 840, y: 210, r: 4, c: '#38bdf8'},
      {x: 370, y: 350, r: 5, c: '#ec4899'},
      {x: 910, y: 360, r: 4.5, c: '#10b981'},
      {x: 540, y: 150, r: 3.5, c: '#a855f7'},
      {x: 740, y: 130, r: 4, c: '#fbbf24'},
      {x: 320, y: 480, r: 4.5, c: '#f43f5e'},
      {x: 960, y: 490, r: 4, c: '#06b6d4'}
    ].map(d => `<circle cx="${d.x}" cy="${d.y}" r="${d.r}" fill="${d.c}" opacity="0.85" />`).join('')}
  </g>

  <!-- CELEBRATION MODAL CARD -->
  <g transform="translate(400, 160)">
    <rect x="-10" y="-10" width="500" height="490" rx="28" fill="rgba(0, 0, 0, 0.6)" />
    <rect x="0" y="0" width="480" height="470" rx="24" fill="url(#modalCard)" stroke="rgba(245, 158, 11, 0.45)" stroke-width="1.8" />
    
    <circle cx="240" cy="85" r="46" fill="rgba(245, 158, 11, 0.12)" />
    <text x="240" y="105" font-size="62" text-anchor="middle">🏆</text>

    <text x="240" y="170" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="url(#goldText)" text-anchor="middle" letter-spacing="1">VICTORY!</text>
    
    <text x="240" y="202" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="500" fill="#cbd5e1" text-anchor="middle">PUZZLE SOLVED!</text>
    <text x="240" y="225" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">Brilliant! You cracked the Sudoku grid with zero mistakes!</text>

    <g transform="translate(45, 255)">
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="120" height="64" rx="14" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.15)" />
        <text x="60" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#94a3b8" text-anchor="middle" letter-spacing="0.5">DIFFICULTY</text>
        <text x="60" y="48" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="800" fill="#38bdf8" text-anchor="middle">HARD</text>
      </g>
      
      <g transform="translate(135, 0)">
        <rect x="0" y="0" width="120" height="64" rx="14" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.15)" />
        <text x="60" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#94a3b8" text-anchor="middle" letter-spacing="0.5">TIME</text>
        <text x="60" y="48" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="800" fill="#fbbf24" text-anchor="middle">03:42</text>
      </g>

      <g transform="translate(270, 0)">
        <rect x="0" y="0" width="120" height="64" rx="14" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.15)" />
        <text x="60" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#94a3b8" text-anchor="middle" letter-spacing="0.5">ACCURACY</text>
        <text x="60" y="48" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="800" fill="#10b981" text-anchor="middle">100%</text>
      </g>
    </g>

    <g transform="translate(100, 360)">
      <rect x="0" y="0" width="170" height="46" rx="23" fill="linear-gradient(135deg, #6366f1, #06b6d4)" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1.2" />
      <text x="85" y="28" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">🎮 Play Again</text>

      <rect x="185" y="0" width="95" height="46" rx="23" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.15)" />
      <text x="232" y="28" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#cbd5e1" text-anchor="middle">✕ Close</text>
    </g>

    <text x="240" y="440" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">🎵 Synthesized Web Audio Fanfare Playing</text>
  </g>
</svg>
`;

// 5. 4-GAME SHOWCASE GRID (1280 x 720)
const gamesGridSvg = `
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gridBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>

  <rect width="1280" height="720" fill="url(#gridBg)" />

  <text x="640" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#ffffff" text-anchor="middle">10 IN 1 RETRO ARCADE SUITE</text>
  <text x="640" y="82" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">Pure JavaScript • Zero External Canvas Libraries • 60 FPS Smooth RAF Loops</text>

  <!-- PANEL 1: WORDLE -->
  <g transform="translate(60, 110)">
    <rect x="0" y="0" width="560" height="270" rx="20" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.2" />
    <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="700" fill="#ffffff">🔤 Wordle — 6 Tries</text>
    <rect x="440" y="18" width="96" height="26" rx="13" fill="rgba(34, 197, 94, 0.15)" stroke="rgba(34, 197, 94, 0.3)" />
    <text x="488" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#4ade80" text-anchor="middle">STREAK: 7 🔥</text>
    
    <g transform="translate(145, 60)">
      ${['C', 'L', 'O', 'U', 'D'].map((l, i) => {
        const bg = i === 1 ? '#eab308' : '#334155';
        return `<rect x="${i * 48}" y="0" width="42" height="42" rx="6" fill="${bg}" /><text x="${i * 48 + 21}" y="27" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">${l}</text>`;
      }).join('')}
      
      ${['S', 'P', 'A', 'R', 'K'].map((l, i) => {
        const bg = i === 0 || i === 2 ? '#22c55e' : (i === 3 ? '#eab308' : '#334155');
        return `<rect x="${i * 48}" y="48" width="42" height="42" rx="6" fill="${bg}" /><text x="${i * 48 + 21}" y="75" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">${l}</text>`;
      }).join('')}

      ${['S', 'O', 'L', 'A', 'R'].map((l, i) => {
        return `<rect x="${i * 48}" y="96" width="42" height="42" rx="6" fill="#22c55e" stroke="#4ade80" stroke-width="1.2" /><text x="${i * 48 + 21}" y="123" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">${l}</text>`;
      }).join('')}
    </g>
    <text x="280" y="248" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">On-screen keyboard &amp; physical keyboard support with letter color memory</text>
  </g>

  <!-- PANEL 2: SPACE INVADERS -->
  <g transform="translate(660, 110)">
    <rect x="0" y="0" width="560" height="270" rx="20" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.2" />
    <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="700" fill="#ffffff">👾 Space Invaders — Wave Defense</text>
    <rect x="430" y="18" width="105" height="26" rx="13" fill="rgba(6, 182, 212, 0.15)" stroke="rgba(6, 182, 212, 0.3)" />
    <text x="482" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#22d3ee" text-anchor="middle">WAVE 2 / 3</text>

    <g transform="translate(50, 60)">
      <rect x="0" y="0" width="460" height="165" rx="10" fill="#090d16" />
      <circle cx="50" cy="30" r="1" fill="#ffffff" opacity="0.5" />
      <circle cx="140" cy="80" r="1.5" fill="#ffffff" opacity="0.6" />
      <circle cx="340" cy="40" r="1" fill="#ffffff" opacity="0.4" />
      <circle cx="410" cy="110" r="1" fill="#ffffff" opacity="0.7" />

      ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${90 + i * 48}" y="20" width="24" height="15" rx="3" fill="#f43f5e" /><circle cx="${97 + i * 48}" cy="26" r="2" fill="#fff" /><circle cx="${107 + i * 48}" cy="26" r="2" fill="#fff" />`).join('')}
      ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${90 + i * 48}" y="45" width="24" height="15" rx="3" fill="#8b5cf6" /><circle cx="${97 + i * 48}" cy="51" r="2" fill="#fff" /><circle cx="${107 + i * 48}" cy="51" r="2" fill="#fff" />`).join('')}

      <rect x="238" y="70" width="2" height="12" fill="#f43f5e" />
      <rect x="334" y="90" width="2" height="12" fill="#f43f5e" />
      <rect x="230" y="105" width="2.5" height="14" fill="#38bdf8" />
      <polygon points="230,135 242,152 218,152" fill="#38bdf8" />
    </g>
    <text x="280" y="248" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">Dynamic speed ramp, 3 progressive waves, and lives tracking</text>
  </g>

  <!-- PANEL 3: 2048 -->
  <g transform="translate(60, 410)">
    <rect x="0" y="0" width="560" height="270" rx="20" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.2" />
    <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="700" fill="#ffffff">🔢 2048 — Number Merging</text>
    <rect x="420" y="18" width="115" height="26" rx="13" fill="rgba(245, 158, 11, 0.15)" stroke="rgba(245, 158, 11, 0.3)" />
    <text x="477" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#fbbf24" text-anchor="middle">SCORE: 18,460</text>

    <g transform="translate(195, 60)">
      <rect x="0" y="0" width="170" height="170" rx="12" fill="#1e293b" />
      <rect x="8" y="8" width="34" height="34" rx="6" fill="#38bdf8" /><text x="25" y="29" font-family="sans-serif" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">128</text>
      <rect x="48" y="8" width="34" height="34" rx="6" fill="#818cf8" /><text x="65" y="29" font-family="sans-serif" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">256</text>
      <rect x="88" y="8" width="34" height="34" rx="6" fill="#c084fc" /><text x="105" y="29" font-family="sans-serif" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">512</text>
      <rect x="128" y="8" width="34" height="34" rx="6" fill="#f43f5e" /><text x="145" y="29" font-family="sans-serif" font-size="11" font-weight="800" fill="#fff" text-anchor="middle">1024</text>
      
      <rect x="8" y="48" width="34" height="34" rx="6" fill="#64748b" /><text x="25" y="69" font-family="sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">64</text>
      <rect x="48" y="48" width="34" height="34" rx="6" fill="#f59e0b" /><text x="65" y="69" font-family="sans-serif" font-size="11" font-weight="900" fill="#fff" text-anchor="middle">2048</text>
      <rect x="88" y="48" width="34" height="34" rx="6" fill="#334155" /><text x="105" y="69" font-family="sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">16</text>
      <rect x="128" y="48" width="34" height="34" rx="6" fill="#334155" /><text x="145" y="69" font-family="sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">8</text>
      
      <rect x="8" y="88" width="34" height="34" rx="6" fill="#334155" /><text x="25" y="109" font-family="sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">4</text>
      <rect x="48" y="88" width="34" height="34" rx="6" fill="#334155" /><text x="65" y="109" font-family="sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">2</text>
      <rect x="88" y="88" width="34" height="34" rx="6" fill="rgba(255,255,255,0.05)" />
      <rect x="128" y="88" width="34" height="34" rx="6" fill="rgba(255,255,255,0.05)" />

      <rect x="8" y="128" width="34" height="34" rx="6" fill="rgba(255,255,255,0.05)" />
      <rect x="48" y="128" width="34" height="34" rx="6" fill="rgba(255,255,255,0.05)" />
      <rect x="88" y="128" width="34" height="34" rx="6" fill="rgba(255,255,255,0.05)" />
      <rect x="128" y="128" width="34" height="34" rx="6" fill="rgba(255,255,255,0.05)" />
    </g>
    <text x="280" y="248" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">Automatic board lock detection, slide animations, and victory celebration</text>
  </g>

  <!-- PANEL 4: CYBER BIRD -->
  <g transform="translate(660, 410)">
    <rect x="0" y="0" width="560" height="270" rx="20" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.2" />
    <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="700" fill="#ffffff">🐦 Cyber Bird — Flappy Flight</text>
    <rect x="435" y="18" width="100" height="26" rx="13" fill="rgba(236, 72, 153, 0.15)" stroke="rgba(236, 72, 153, 0.3)" />
    <text x="485" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#f472b6" text-anchor="middle">BEST: 42</text>

    <g transform="translate(50, 60)">
      <rect x="0" y="0" width="460" height="165" rx="10" fill="#0f172a" />
      <line x1="0" y1="140" x2="460" y2="140" stroke="rgba(255,255,255,0.05)" />
      <line x1="0" y1="90" x2="460" y2="90" stroke="rgba(255,255,255,0.05)" />

      <rect x="150" y="0" width="36" height="50" fill="linear-gradient(to right, #06b6d4, #0284c7)" stroke="#38bdf8" stroke-width="1.5" />
      <rect x="150" y="110" width="36" height="55" fill="linear-gradient(to right, #06b6d4, #0284c7)" stroke="#38bdf8" stroke-width="1.5" />

      <rect x="320" y="0" width="36" height="70" fill="linear-gradient(to right, #06b6d4, #0284c7)" stroke="#38bdf8" stroke-width="1.5" />
      <rect x="320" y="130" width="36" height="35" fill="linear-gradient(to right, #06b6d4, #0284c7)" stroke="#38bdf8" stroke-width="1.5" />

      <g transform="translate(100, 80) rotate(-10)">
        <circle cx="0" cy="0" r="10" fill="#f59e0b" />
        <circle cx="4" cy="-3" r="3" fill="#ffffff" />
        <circle cx="5" cy="-3" r="1.5" fill="#000" />
        <polygon points="7,0 14,2 7,4" fill="#ef4444" />
        <ellipse cx="-3" cy="2" rx="4" ry="2.5" fill="#d97706" />
      </g>
    </g>
    <text x="280" y="248" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">Space or Tap to flap • Accurate circle-to-box collision &amp; neon aesthetics</text>
  </g>
</svg>
`;

async function run() {
  console.log('Generating crisp GitHub showcase screenshots...');

  await sharp(Buffer.from(heroSvg)).png().toFile(path.join(outDir, 'hero_banner.png'));
  console.log('✓ Created assets/hero_banner.png (1280x640)');

  await sharp(Buffer.from(zenSvg)).png().toFile(path.join(outDir, 'preview_dashboard.png'));
  console.log('✓ Created assets/preview_dashboard.png (1280x800)');

  await sharp(Buffer.from(arcadeSvg)).png().toFile(path.join(outDir, 'preview_arcade_lounge.png'));
  console.log('✓ Created assets/preview_arcade_lounge.png (1280x800)');

  await sharp(Buffer.from(celebrationSvg)).png().toFile(path.join(outDir, 'preview_celebration.png'));
  console.log('✓ Created assets/preview_celebration.png (1280x800)');

  await sharp(Buffer.from(gamesGridSvg)).png().toFile(path.join(outDir, 'preview_games_grid.png'));
  console.log('✓ Created assets/preview_games_grid.png (1280x720)');

  console.log('\nAll GitHub screenshot assets generated successfully!');
}

run().catch(err => {
  console.error('Generation error:', err);
  process.exit(1);
});
