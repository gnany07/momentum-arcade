# Momentum Arcade - New Tab with Games 🕹️✨

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://chrome.google.com/webstore)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-10B981)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A gorgeous, responsive Chrome extension that upgrades your new tab into an inspiring dashboard with scenic wallpapers, digital clock, motivational quotes, and an integrated **Arcade Lounge** featuring 5 classic games: **Snake**, **Sudoku**, **Wordle**, **Tetris**, and **Block Breaker**.

---

## ✨ Features

- 🌅 **Zen Dashboard**:
  - Crisp live digital clock, date, and adaptive greeting.
  - Curated inspirational quotes with one-click refresh (`✦`).
  - Scenic wallpaper integration with smooth transitions and refresh button.
- 🕹️ **Arcade Lounge (5 Built-in Games)**:
  - 🐍 **Snake**: Classic slither gameplay with apple collection, responsive speed, and high score tracking.
  - 🔢 **Sudoku**: Generator with Easy, Medium, and Hard difficulty modes, cell highlighting, and an on-screen number pad for mouse & touch users.
  - 🔤 **Wordle**: 6-attempt 5-letter word game with letter validation, virtual keyboard (with Enter & Backspace), and win streak stats.
  - 🧱 **Tetris**: Full tetromino gameplay with line clears, score progression, soft drop, and rotation controls without page scrolling.
  - 🏓 **Block Breaker**: Complete overhaul featuring:
    - Mouse tracking and keyboard (Arrow / A-D) paddle movement.
    - Ball sits on paddle before launch; launches with Space or click.
    - 3 progressive levels (Rainbow, Pyramid with reinforced bricks, and Castle).
    - Particle explosion sparks on brick destruction.
    - Robust physics with zero ball-tunneling and angle-based paddle bounce.
- 🔊 **Synthesized Web Audio**: Retro sound effects for hits, scores, launches, and game overs (toggleable mute/unmute).
- 💾 **Local-First Persistence**: High scores and game states are saved locally with `chrome.storage.local`.
- 🔒 **Privacy Focused**: No analytics, no telemetry, no tracking, and zero external script injection (100% Manifest V3 compliant).

---

## 🎮 Game Controls

| Game | Keyboard Controls | Mouse / Touch Controls |
|---|---|---|
| **Block Breaker** | ◄ ► or `A`/`D` to Move, `Space`/`W` to Launch, `P` to Pause | Move mouse over canvas to steer paddle, Click to launch |
| **Snake** | Arrow Keys or `W`/`A`/`S`/`D` to Slither | Start button |
| **Sudoku** | Arrow Keys to navigate, `1`–`9` to enter number, `Backspace` to clear | Click cell to select, Click on-screen numpad (1–9, ⌫) |
| **Wordle** | Type letters on physical keyboard, `Enter` to submit, `Backspace` to delete | Click onscreen virtual keyboard keys |
| **Tetris** | ◄ ► to Move, ▲ or `Space` to Rotate, ▼ for Soft Drop, `P` to Pause | Start and Pause buttons |

---

## 🚀 Local Installation & Testing

1. Clone or download this repository:
   ```bash
   git clone https://github.com/gnany07/momentum-arcade.git
   cd momentum-arcade
   ```
2. Open Google Chrome and navigate to:
   ```
   chrome://extensions/
   ```
3. Enable **Developer mode** (toggle switch in the top-right corner).
4. Click **"Load unpacked"** and select the `momentum-arcade` directory.
5. Open a new tab (`Cmd+T` or `Ctrl+T`) to see Momentum Arcade in action!

---

## 📦 Packaging for Chrome Web Store

To build the production zip file ready for Google Chrome Web Store upload:

```bash
npm run pack
```

This creates a clean, validated distribution package at:
```
dist/momentum-arcade-v1.0.0.zip
```

For the complete step-by-step submission guide, review [STORE_GUIDE.md](STORE_GUIDE.md).

---

## 🛠️ Project Structure

```
├── manifest.json         # Manifest V3 extension configuration
├── index.html            # Main new tab DOM structure (Zen & Arcade Hub)
├── styles.css            # Glassmorphism design system & game cabinet styling
├── script.js             # Arcade App manager, clock, sound synthesizer, storage
├── quotes.js             # Curated inspirational quotes collection
├── snake.js              # Snake game engine
├── sudoku.js             # Sudoku generator, solver, and validator
├── wordle.js             # Wordle engine with virtual keyboard
├── tetris.js             # Tetris tetromino engine
├── blockbreaker.js       # Overhauled Block Breaker with multi-level physics
├── generate_icons.js     # Sharp icon generator (16, 32, 48, 128 px)
├── pack.js               # Distribution packager script
├── privacy_policy.html   # Chrome Web Store compliant privacy policy
├── STORE_GUIDE.md        # Official Chrome Web Store publishing manual
├── icons/                # Extension icons (16, 32, 48, 128 px)
└── dist/                 # Ready-to-upload zip package
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
