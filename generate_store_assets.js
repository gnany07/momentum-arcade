const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'store_assets');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// 1. Promo Small: 440 x 280 px
const smallSvg = `
<svg width="440" height="280" viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="neon" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
  </defs>
  <rect width="440" height="280" fill="url(#bg)" />

  <!-- Background decorative glowing rings -->
  <circle cx="220" cy="140" r="130" fill="none" stroke="rgba(99, 102, 241, 0.2)" stroke-width="2" />
  <circle cx="220" cy="140" r="90" fill="none" stroke="rgba(56, 189, 248, 0.15)" stroke-width="1.5" />

  <!-- Arcade Logo Glyphs -->
  <text x="220" y="85" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="42" font-weight="900" fill="url(#neon)" text-anchor="middle">MOMENTUM</text>
  <text x="220" y="125" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="700" fill="#f8fafc" text-anchor="middle" letter-spacing="4">ARCADE LOUNGE</text>
  
  <!-- Pill badge -->
  <rect x="135" y="150" width="170" height="30" rx="15" fill="rgba(99, 102, 241, 0.3)" stroke="rgba(99, 102, 241, 0.6)" stroke-width="1.5" />
  <text x="220" y="170" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#e0e7ff" text-anchor="middle">10 GAMES • LO-FI RADIO</text>

  <!-- Game icons ribbon -->
  <text x="220" y="225" font-size="22" text-anchor="middle">🐍 🔢 🔤 🧱 🏓 🐦 💣 👾</text>
  <text x="220" y="255" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">Transform your new tab into an aesthetic oasis</text>
</svg>
`;

// 2. Marquee Promo: 1400 x 560 px
const marqueeSvg = `
<svg width="1400" height="560" viewBox="0 0 1400 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mqBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="40%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>
  </defs>
  <rect width="1400" height="560" fill="url(#mqBg)" />

  <!-- Ambient light blobs -->
  <circle cx="250" cy="280" r="220" fill="rgba(99, 102, 241, 0.25)" filter="blur(60px)" />
  <circle cx="1150" cy="280" r="220" fill="rgba(6, 182, 212, 0.2)" filter="blur(60px)" />

  <!-- Left Side: Typography -->
  <text x="140" y="190" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="64" font-weight="900" fill="url(#textGrad)">MOMENTUM ARCADE</text>
  <text x="140" y="250" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="28" font-weight="600" fill="#f8fafc">Your New Tab Oasis with 10 Classic Games &amp; Lo-Fi</text>
  <text x="140" y="300" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" fill="#94a3b8">Snake • Sudoku • Wordle • Tetris • Block Breaker • 2048 • Cyber Bird • Minesweeper • Cyber Pong • Space Invaders</text>

  <!-- Feature Pills -->
  <rect x="140" y="340" width="160" height="38" rx="19" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.2)" />
  <text x="220" y="364" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">🎧 Lo-Fi Radio</text>

  <rect x="320" y="340" width="180" height="38" rx="19" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.2)" />
  <text x="410" y="364" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">⚡ 100% Offline Ready</text>

  <rect x="520" y="340" width="160" height="38" rx="19" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.2)" />
  <text x="600" y="364" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">🔒 Zero Tracking</text>

  <!-- Right Side Mockup Card -->
  <rect x="940" y="100" width="380" height="360" rx="28" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="2" />
  <text x="1130" y="160" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="700" fill="#ffffff" text-anchor="middle">ARCADE LOUNGE</text>
  <text x="1130" y="210" font-size="40" text-anchor="middle">🕹️ 🎧 ✨</text>
  <text x="1130" y="260" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" fill="#38bdf8" text-anchor="middle">10 Instant Games</text>
  <text x="1130" y="300" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">Real-time Clock &amp; Daily Quotes</text>
  <rect x="1030" y="340" width="200" height="42" rx="21" fill="url(#textGrad)" />
  <text x="1130" y="367" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="800" fill="#ffffff" text-anchor="middle">OPEN ARCADE</text>
</svg>
`;

// 3. Store Screenshot: 1280 x 800 px (Zen Dashboard)
const screenshotZenSvg = `
<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0c4a6e" />
      <stop offset="45%" stop-color="#075985" />
      <stop offset="85%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
  </defs>
  <!-- Background scenic illustration -->
  <rect width="1280" height="800" fill="url(#skyGrad)" />
  
  <!-- Subtle dark vignette overlay -->
  <radialGradient id="vig" cx="50%" cy="50%" r="50%">
    <stop offset="40%" stop-color="#000000" stop-opacity="0.1" />
    <stop offset="100%" stop-color="#000000" stop-opacity="0.65" />
  </radialGradient>
  <rect width="1280" height="800" fill="url(#vig)" />

  <!-- Mountains -->
  <polygon points="0,800 240,580 480,800" fill="rgba(15, 23, 42, 0.7)" />
  <polygon points="350,800 680,500 1020,800" fill="rgba(15, 23, 42, 0.85)" />
  <polygon points="850,800 1100,560 1280,720 1280,800" fill="rgba(15, 23, 42, 0.75)" />

  <!-- Top bar -->
  <rect x="940" y="30" width="160" height="42" rx="21" fill="rgba(15, 23, 42, 0.6)" stroke="rgba(255, 255, 255, 0.2)" />
  <text x="1020" y="56" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#ffffff" text-anchor="middle">🎧 Lo-Fi Radio</text>
  <circle cx="1135" cy="51" r="20" fill="rgba(15, 23, 42, 0.6)" stroke="rgba(255, 255, 255, 0.2)" />
  <text x="1135" y="56" font-size="14" text-anchor="middle" fill="#fff">🔄</text>
  <circle cx="1185" cy="51" r="20" fill="rgba(15, 23, 42, 0.6)" stroke="rgba(255, 255, 255, 0.2)" />
  <text x="1185" y="56" font-size="14" text-anchor="middle" fill="#fff">🔊</text>

  <!-- Clock & Greeting -->
  <text x="640" y="270" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="32" font-weight="300" fill="rgba(255, 255, 255, 0.9)" text-anchor="middle">Good afternoon</text>
  <text x="640" y="380" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="120" font-weight="200" fill="#ffffff" text-anchor="middle">12:45</text>
  <text x="640" y="430" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="400" fill="rgba(255, 255, 255, 0.8)" text-anchor="middle">Wednesday, October 14</text>

  <!-- Quote Card -->
  <rect x="360" y="475" width="560" height="65" rx="20" fill="rgba(15, 23, 42, 0.55)" stroke="rgba(255, 255, 255, 0.15)" />
  <text x="640" y="514" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-style="italic" fill="#f8fafc" text-anchor="middle">"Small daily improvements over time lead to stunning results."</text>

  <!-- Open Arcade Button -->
  <rect x="515" y="580" width="250" height="52" rx="26" fill="linear-gradient(135deg, #6366f1, #06b6d4)" stroke="rgba(255, 255, 255, 0.3)" />
  <text x="640" y="612" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">🎮 Play Games (10 Games)</text>
</svg>
`;

// 4. Store Screenshot: 1280 x 800 px (Arcade Lounge with 10 Games)
const screenshotArcadeSvg = `
<svg width="1280" height="800" viewBox="0 0 1280 800" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="800" fill="#0b0f19" />

  <!-- Background ambience -->
  <circle cx="640" cy="400" r="450" fill="rgba(99, 102, 241, 0.12)" filter="blur(80px)" />

  <!-- Arcade Container -->
  <rect x="180" y="40" width="920" height="720" rx="28" fill="rgba(15, 23, 42, 0.88)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" />

  <!-- Header -->
  <text x="220" y="90" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="800" fill="#ffffff">🕹️ Arcade Lounge</text>
  <text x="640" y="90" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="300" fill="#94a3b8" text-anchor="middle">12:45</text>
  <rect x="960" y="68" width="110" height="32" rx="16" fill="rgba(239, 68, 68, 0.2)" stroke="rgba(239, 68, 68, 0.4)" />
  <text x="1015" y="89" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#fca5a5" text-anchor="middle">✕ Close</text>

  <!-- 10 Games Tab Bar -->
  <rect x="210" y="120" width="860" height="44" rx="14" fill="rgba(30, 41, 59, 0.7)" />
  <rect x="215" y="124" width="86" height="36" rx="10" fill="#6366f1" />
  <text x="258" y="147" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">🐍 Snake</text>

  <text x="345" y="147" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">🔢 Sudoku</text>
  <text x="430" y="147" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">🔤 Wordle</text>
  <text x="515" y="147" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">🧱 Tetris</text>
  <text x="600" y="147" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">🏓 Bricks</text>
  <text x="680" y="147" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">🔢 2048</text>
  <text x="765" y="147" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">🐦 Bird</text>
  <text x="850" y="147" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">💣 Mines</text>
  <text x="935" y="147" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">🏓 Pong</text>
  <text x="1025" y="147" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">👾 Invaders</text>

  <!-- Active Cabinet Header -->
  <rect x="420" y="185" width="110" height="32" rx="8" fill="rgba(30, 41, 59, 0.8)" stroke="rgba(255, 255, 255, 0.1)" />
  <text x="475" y="206" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">SCORE 240</text>
  <rect x="545" y="185" width="110" height="32" rx="8" fill="rgba(30, 41, 59, 0.8)" stroke="rgba(255, 255, 255, 0.1)" />
  <text x="600" y="206" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#f59e0b" text-anchor="middle">BEST 820</text>
  <rect x="740" y="185" width="100" height="32" rx="8" fill="rgba(30, 41, 59, 0.8)" stroke="rgba(255, 255, 255, 0.1)" />
  <text x="790" y="206" font-family="monospace" font-size="14" font-weight="700" fill="#38bdf8" text-anchor="middle">02:14</text>

  <!-- Canvas Simulation -->
  <rect x="440" y="235" width="400" height="400" rx="16" fill="#0d1117" stroke="rgba(34, 197, 94, 0.4)" stroke-width="2" />
  
  <!-- Snake Segments -->
  <rect x="560" y="415" width="18" height="18" rx="4" fill="#22c55e" />
  <rect x="540" y="415" width="18" height="18" rx="4" fill="#16a34a" />
  <rect x="520" y="415" width="18" height="18" rx="4" fill="#16a34a" />
  <rect x="520" y="395" width="18" height="18" rx="4" fill="#16a34a" />
  <rect x="520" y="375" width="18" height="18" rx="4" fill="#16a34a" />
  
  <!-- Food -->
  <circle cx="689" cy="384" r="8" fill="#ef4444" />

  <!-- Action Controls -->
  <rect x="550" y="655" width="180" height="42" rx="12" fill="#6366f1" />
  <text x="640" y="681" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#ffffff" text-anchor="middle">Start Game</text>
  <text x="640" y="722" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">Controls: Use Arrow Keys or WASD to Slither</text>
</svg>
`;

async function renderAssets() {
  await sharp(Buffer.from(smallSvg)).png().toFile(path.join(outDir, 'promo_small_440x280.png'));
  console.log('Generated promo_small_440x280.png');

  await sharp(Buffer.from(marqueeSvg)).png().toFile(path.join(outDir, 'promo_marquee_1400x560.png'));
  console.log('Generated promo_marquee_1400x560.png');

  await sharp(Buffer.from(screenshotZenSvg)).png().toFile(path.join(outDir, 'screenshot_1280x800_zen.png'));
  console.log('Generated screenshot_1280x800_zen.png');

  await sharp(Buffer.from(screenshotArcadeSvg)).png().toFile(path.join(outDir, 'screenshot_1280x800_arcade.png'));
  console.log('Generated screenshot_1280x800_arcade.png');
}

renderAssets().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
