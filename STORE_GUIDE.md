# Google Chrome Web Store Publishing Guide

This document provides a step-by-step checklist to publish **Momentum Arcade** to the official Google Chrome Web Store.

---

## 1. Prerequisites

1. **Google Developer Account**:
   - Register at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
   - Pay the one-time $5 Google registration fee.
2. **Built Extension Package**:
   - Run `npm run pack` (or `node pack.js`).
   - The generated zip will be located at `dist/momentum-arcade-v1.0.0.zip`.

---

## 2. Store Asset Requirements

All visual assets are pre-generated and ready in the `store_assets/` and `icons/` folders:

| Asset | Dimensions | Format | File Location |
|---|---|---|---|
| **Store Icon** | 128 x 128 px | PNG | `icons/icon128.png` |
| **Store Screenshot 1** | 1280 x 800 px | PNG | `store_assets/screenshot_1280x800_zen.png` |
| **Store Screenshot 2** | 1280 x 800 px | PNG | `store_assets/screenshot_1280x800_arcade.png` |
| **Small Promo Tile** | 440 x 280 px | PNG | `store_assets/promo_small_440x280.png` |
| **Marquee Promo Tile** | 1400 x 560 px | PNG | `store_assets/promo_marquee_1400x560.png` |

---

## 3. Step-by-Step Submission Process

### Step 1: Upload the Package
1. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Click **"New Item"** (top right).
3. Drag and drop `dist/momentum-arcade-v1.1.0.zip` or click "Browse files".
4. Chrome will validate `manifest.json`.

---

### Step 2: Store Listing Information

- **Product Name**: `Momentum Arcade - New Tab with 10 Games & Lo-Fi`
- **Summary Description** (under 132 characters):
  > *A beautiful new tab dashboard with Lo-Fi ambient music, quotes, and 10 classic games: Snake, Sudoku, Wordle, Tetris, 2048 & more.*
- **Detailed Description**:
  Copy the description below:
  ```markdown
  Transform your new tab into an aesthetic, productive oasis featuring procedural Lo-Fi ambient music, digital clock, inspirational quotes, and 10 classic arcade games!

  FEATURES:
  - Procedural Lo-Fi Ambient Player: 4 relaxing soundscapes (Chill Lo-Fi Chords & Beats, Night Rain, Vinyl Warmth, and 432Hz Focus). 100% offline, zero bandwidth.
  - 10 Built-In Mini Games:
    • Snake: Classic slither with score tracking.
    • Sudoku: Easy, Medium, and Hard puzzles with on-screen numpad.
    • Wordle: 5-letter word puzzle with full virtual keyboard and streaks.
    • Tetris: Block stacking with soft drop and rotation.
    • Block Breaker: Brick-breaker with mouse tracking and 3 progressive levels.
    • 2048: Slide and merge numbers to reach 2048.
    • Cyber Bird: One-tap flapping flight through neon pipes.
    • Minesweeper: Classic mine clearance with 9x9 and 12x12 modes and flags.
    • Cyber Pong: Retro paddle duel vs smart AI (first to 5 points).
    • Space Invaders: Shoot down waves of invading aliens.
  - Minimal Permissions: Only requests "storage" to save your high scores locally.
  - 100% Local-First: Zero tracking, zero telemetry, and zero ads.
  ```
- **Category**: Select `Fun` or `Productivity`.
- **Language**: `English`.

---

### Step 3: Privacy Practices Tab (Crucial for Approval)

1. **Single Purpose Policy**:
   - Select: *"A new tab replacement dashboard providing a clock, quotes, and casual mini-games."*
2. **Permission Justification**:
   - `storage`: *"Required solely to store high scores, game preferences, and audio mute state locally on the user's device via chrome.storage.local."*
3. **Data Usage Disclosures**:
   - Under Data Usage, check:
     - [x] *"I do not collect or use user data"*
   - Check all declarations confirming compliance with Chrome Web Store policies.
4. **Privacy Policy URL**:
   - If hosting on GitHub Pages, enter:
     `https://gnany07.github.io/momentum-arcade/privacy_policy.html`
   - (Or your personal website / custom domain).

---

### Step 4: Submit for Review
1. Review all tabs to ensure there are no red warning icons.
2. Click **"Submit for Review"**.
3. Google automated checks will run, followed by manual review (typically approved in 24–48 hours).
