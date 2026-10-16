# Momentum Arcade - New Tab with 10 Games & Lo-Fi 🕹️🎧✨

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://chrome.google.com/webstore)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-10B981)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A gorgeous, responsive Chrome extension that upgrades your new tab into an inspiring sanctuary with scenic wallpapers, digital clock, motivational quotes, integrated **procedural Lo-Fi music / ambient soundscapes**, and an **Arcade Lounge** featuring **10 classic games**!

---

## ✨ Features

- 🎧 **Built-in Lo-Fi & Ambient Soundscape Player**:
  - **Procedural Audio Generation**: Zero audio file downloads, works 100% offline with zero bandwidth.
  - **4 Ambient Sound Modes**:
    1. 🎵 **Chill Lo-Fi Chords & Beats**: Mellow electric piano jazz chords with tape warble and soft beat.
    2. 🌧️ **Night Rain**: Calming rainfall white/pink noise generator.
    3. 📻 **Vinyl Warmth**: Authentic vinyl crackle and record needle atmosphere.
    4. 🧘 **432Hz Focus**: Binaural theta wave ambient drone.
  - Floating player with volume slider, equalizer animation, and persistent memory.
- 🌅 **Zen Dashboard**:
  - Live clock, date, and adaptive greeting.
  - Curated inspirational quotes with one-click refresh (`✦`).
  - Scenic wallpaper integration with smooth transitions and refresh button.
- 🕹️ **Arcade Lounge (10 Built-in Games)**:
  1. 🐍 **Snake**: Classic slither gameplay with apple eating and high score tracking.
  2. 🔢 **Sudoku**: Puzzles with Easy, Medium, and Hard difficulty modes, cell highlighting, and an on-screen numpad for mouse & touch users.
  3. 🔤 **Wordle**: 6-attempt 5-letter word puzzle with letter validation, on-screen keyboard (with Enter & Backspace), and win streak stats.
  4. 🧱 **Tetris**: Full tetromino gameplay with line clears, score progression, soft drop, and rotation controls without page scrolling.
  5. 🏓 **Block Breaker**: Overhauled brick-breaker with mouse and keyboard steering, 3 progressive levels, spark particles, and power bounces.
  6. 🔢 **2048**: Slide and merge numbers to reach the legendary 2048 tile with high score tracking.
  7. 🐦 **Cyber Bird (Flappy)**: One-tap flapping flight through neon pipes with responsive gravity and best score.
  8. 💣 **Minesweeper**: Retro mine clearance with 9x9 and 12x12 modes, smiley reset button, flags, and flood fill.
  9. 🏓 **Cyber Pong**: Fast-paced Player vs AI retro paddle duel; first to 5 points takes the crown.
  10. 👾 **Space Invaders**: Defend Earth against waves of descending alien armadas with missile shooting.
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
| **2048** | Arrow Keys or `W`/`A`/`S`/`D` to slide tiles | Start and Reset buttons |
| **Cyber Bird** | `Space` or ▲ to Flap | Click / Tap anywhere on canvas to flap |
| **Minesweeper** | Left Click to dig, Right Click to flag | Left Click, Right Click, or toggle Flag Mode |
| **Cyber Pong** | ▲ ▼ or `W`/`S` to move paddle | Move mouse vertically over canvas |
| **Space Invaders** | ◄ ► or `A`/`D` to Move, `Space` to Fire | Move ship, Tap canvas to shoot |

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
dist/momentum-arcade-v1.1.0.zip
```

For the complete step-by-step submission guide, review [STORE_GUIDE.md](STORE_GUIDE.md).

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
