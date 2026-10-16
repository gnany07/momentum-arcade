const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Modern high-res SVG icon for Momentum Arcade
const svgContent = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="50%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#0F172A" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Background rounded rectangle -->
  <rect x="24" y="24" width="464" height="464" rx="112" fill="url(#bgGrad)" filter="url(#shadow)"/>
  
  <!-- Subtle inner gloss -->
  <rect x="24" y="24" width="464" height="232" rx="112" fill="url(#glowGrad)"/>

  <!-- Stylized Geometric "M" arcade glyph -->
  <path d="M 120 370 L 120 180 C 120 160 144 146 162 158 L 256 226 L 350 158 C 368 146 392 160 392 180 L 392 370" 
        stroke="#FFFFFF" 
        stroke-width="36" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        fill="none" />

  <!-- Center Accent Gem (Play / Power Diamond) -->
  <polygon points="256,270 286,305 256,340 226,305" fill="#FDE047" />

  <!-- Modern dots / arcade buttons -->
  <circle cx="175" cy="305" r="14" fill="#67E8F9" />
  <circle cx="337" cy="305" r="14" fill="#F472B6" />
</svg>
`;

async function generateIcons() {
  const iconsDir = path.join(__dirname, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sizes = [16, 32, 48, 128];
  
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon${size}.png`);
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated ${outputPath} (${size}x${size})`);
  }
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
}); 