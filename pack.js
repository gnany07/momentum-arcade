const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
const version = manifest.version || '1.0.0';
const zipName = `momentum-arcade-v${version}.zip`;
const zipPath = path.join(distDir, zipName);

console.log(`Packaging Momentum Arcade v${version} for Chrome Web Store...`);

// Files and folders required for Chrome Extension runtime
const filesToInclude = [
    'manifest.json',
    'index.html',
    'styles.css',
    'script.js',
    'quotes.js',
    'snake.js',
    'sudoku.js',
    'wordle.js',
    'tetris.js',
    'blockbreaker.js',
    'privacy_policy.html',
    'icons'
];

// Verify existence
filesToInclude.forEach(file => {
    if (!fs.existsSync(path.join(__dirname, file))) {
        console.error(`ERROR: Required extension file missing: ${file}`);
        process.exit(1);
    }
});

// Remove existing zip if present
if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
}

// Create clean zip using standard OS zip
try {
    const includeArgs = filesToInclude.map(f => `"${f}"`).join(' ');
    execSync(`zip -r "${zipPath}" ${includeArgs}`, { cwd: __dirname, stdio: 'inherit' });
    const stat = fs.statSync(zipPath);
    console.log(`\nSUCCESS! Chrome Web Store package created:`);
    console.log(`  Path: ${zipPath}`);
    console.log(`  Size: ${(stat.size / 1024).toFixed(1)} KB`);
    console.log(`\nYou can directly upload this ZIP to the Chrome Web Store Developer Dashboard!`);
} catch (err) {
    console.error('Failed to create zip file:', err);
    process.exit(1);
}
