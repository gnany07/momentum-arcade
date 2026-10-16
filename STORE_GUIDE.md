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

Before submitting, prepare these visual assets:

| Asset | Dimensions | Format | Notes |
|---|---|---|---|
| **Store Icon** | 128 x 128 px | PNG | Located in `icons/icon128.png` |
| **Store Screenshots** | 1280 x 800 px (or 640 x 400 px) | PNG / JPEG | At least 1 screenshot is required (up to 5 recommended). Show Zen mode and the games. |
| **Small Promo Tile** (Optional) | 440 x 280 px | PNG / JPEG | Featured in search results and collections |
| **Marquee Promo Tile** (Optional) | 1400 x 560 px | PNG / JPEG | Highlight banner on Chrome Web Store homepage |

---

## 3. Step-by-Step Submission Process

### Step 1: Upload the Package
1. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Click **"New Item"** (top right).
3. Drag and drop `dist/momentum-arcade-v1.0.0.zip` or click "Browse files".
4. Chrome will validate `manifest.json`.

---

### Step 2: Store Listing Information

- **Product Name**: `Momentum Arcade - New Tab with Games`
- **Summary Description** (under 132 characters):
  > *A beautiful new tab dashboard with daily quotes, clock, and 5 classic games: Snake, Sudoku, Wordle, Tetris & Block Breaker.*
- **Detailed Description**:
  Copy the description below:
  ```markdown
  Elevate your browsing routine with Momentum Arcade! Transform every new tab into a clean, inspiring sanctuary featuring relaxing photography, a digital clock, inspirational quotes, and 5 classic arcade games.

  FEATURES:
  - Zen Mode: Clean clock, greeting, date, and daily motivational quotes.
  - 5 Classic Games:
    - 🐍 Snake: Slither, collect apples, and beat your high score.
    - 🔢 Sudoku: Number puzzle with Easy, Medium, and Hard difficulty modes plus on-screen numpad.
    - 🔤 Wordle: 6 chances to guess the hidden 5-letter word with streak tracking.
    - 🧱 Tetris: Full-featured block-stacking classic with soft drop and rotation.
    - 🏓 Block Breaker: Brick-breaker with mouse and keyboard paddle control, multi-level progression, spark particles, and power bounces.
  - Sound Effects: Synthesized Web Audio sound effects with one-click mute/unmute.
  - High Score Persistence: Scores and streaks saved locally on your device.
  - Minimal Permissions: Only requests "storage" to save your high scores locally.
  - Lightweight & Fast: 100% offline-ready with zero telemetry, trackers, or ads.
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
