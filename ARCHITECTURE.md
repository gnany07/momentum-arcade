# System Architecture & Technical Specifications

This document details the architectural topology, security controls, and individual game engine state machines for **Momentum Arcade**.

---

## 🏗️ 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph BrowserEnvironment ["🌐 Google Chrome Runtime (Manifest V3)"]
        NewTab["New Tab Page (chrome://newtab)"]
        LocalStorage["Storage Engine (chrome.storage.local)"]
        AudioHardware["Audio Output (Speakers / Headphones)"]
    end

    subgraph PresentationLayer ["🖥️ Presentation & UI (index.html + styles.css)"]
        ZenUI["Zen Dashboard UI (Clock, Date, Quotes)"]
        LoFiUI["Lo-Fi Floating Widget & Popover"]
        ArcadeModal["Arcade Lounge Modal (Cabinet Hub)"]
        ToastUI["Non-Blocking Toast System"]
        CelebrationUI["Celebration Overlay (#winCelebrationOverlay)"]
    end

    subgraph CoreEngines ["⚙️ Core Client Engines (script.js & lofi.js)"]
        ClockEngine["Clock & Greeting Timer"]
        QuotesEngine["Quotes Randomizer (quotes.js)"]
        ArcadeApp["ArcadeApp Lifecycle Manager"]
        ConfettiEngine["Confetti Particle Physics Engine"]
        SoundFX["SoundController (Native Web Audio)"]
        LoFiEngine["LoFiPlayer (Procedural Web Audio)"]
        ScoreStorage["ScoreStorage Adapter"]
    end

    subgraph GameEngines ["🎮 10-in-1 Arcade Games"]
        BB["Block Breaker (60 FPS Canvas)"]
        SN["Snake (Grid Canvas)"]
        SD["Sudoku (Canvas + Solver)"]
        WD["Wordle (DOM Matrix)"]
        TT["Tetris (60 FPS Canvas)"]
        G2["2048 (DOM Grid)"]
        CB["Cyber Bird (Physics Canvas)"]
        MS["Minesweeper (DOM Grid)"]
        PG["Cyber Pong (Canvas vs AI)"]
        SI["Space Invaders (Canvas Waves)"]
    end

    NewTab --> PresentationLayer
    PresentationLayer --> CoreEngines
    ArcadeApp --> GameEngines

    LoFiEngine --> AudioHardware
    SoundFX --> AudioHardware
    ConfettiEngine --> CelebrationUI

    ScoreStorage <--> LocalStorage
    GameEngines <--> ScoreStorage
    GameEngines --> SoundFX
    GameEngines --> CelebrationUI
    GameEngines --> ToastUI
```

---

## 🔒 2. Security & Chrome Web Store Compliance Audit

| Security Checklist Item | Status | Verification & Evidence |
| :--- | :---: | :--- |
| **API Keys & Secrets Exposure** | 🟢 **PASS (0 Found)** | Zero API keys, JWTs, client secrets, passwords, or cloud credentials found. |
| **External Network Telemetry** | 🟢 **PASS (0 Calls)** | Zero `fetch()`, `XMLHttpRequest`, `WebSocket`, or beacon calls. No external data transmission. |
| **Dynamic Code Execution** | 🟢 **PASS (0 Found)** | No `eval()`, `new Function()`, or dynamic script string execution. Strict CSP compliant. |
| **Manifest V3 Least Privilege** | 🟢 **PASS** | Only `"permissions": ["storage"]` requested. Zero sensitive permissions (`tabs`, `webRequest`, `cookies`). |
| **Remote Script Injections** | 🟢 **PASS** | All scripts, styles, and fonts are 100% packaged locally. Zero CDN dependencies. |
| **Offline Execution** | 🟢 **PASS** | `offline_enabled: true` declared; procedural audio and games function without internet. |
| **Distribution Zip Hygiene** | 🟢 **PASS** | 22 extension files strictly bundled. Developer files, `node_modules`, and `.git` excluded (70 KB total). |

---

## 🕹️ 3. Individual Game Architecture Diagrams

---

### 1. 🐍 Snake Architecture

```mermaid
flowchart TD
    subgraph Inputs ["Input Handlers"]
        Keys["Arrow Keys / WASD"]
        Btn["Start / Restart Button"]
    end

    subgraph State ["Snake State (snake.js)"]
        Head["Head & Body Segments: [{x, y}]"]
        Food["Food Coordinates: {x, y}"]
        Dir["Direction: up | down | left | right"]
        Speed["Speed: 130ms Tick Interval"]
        Scores["Score & High Score"]
    end

    subgraph Loop ["Game Loop (setInterval)"]
        Tick["Next Step Translation"]
        OppositeGuard{"180° Reverse?"}
        BoundCheck{"Wall / Self Collision?"}
        FoodCheck{"Head on Food?"}
    end

    subgraph Outputs ["Audio & Visual Rendering"]
        DrawGrid["Canvas Render (Grid + Apple)"]
        AudioSfx["Sound: score / gameOver"]
        EndModals["celebrateWin (Record) / showGameOverModal"]
        SaveScore["ScoreStorage.set('snakeHighScore')"]
    end

    Keys --> OppositeGuard
    OppositeGuard -- No --> Dir
    Btn --> State

    Tick --> BoundCheck
    BoundCheck -- Yes --> AudioSfx
    BoundCheck -- Yes --> EndModals
    BoundCheck -- Yes --> SaveScore

    BoundCheck -- No --> FoodCheck
    FoodCheck -- Yes --> Head
    FoodCheck -- Yes --> Food
    FoodCheck -- Yes --> AudioSfx
    FoodCheck -- No --> Head
    Head --> DrawGrid
```

---

### 2. 🔢 Sudoku Architecture

```mermaid
flowchart TD
    subgraph Controls ["User Interaction"]
        CanvasClick["Cell Selection (Scale Adjusted)"]
        Numpad["Virtual Numpad (1–9, ⌫)"]
        Keys["Keyboard (1–9, Arrow Keys, Backspace)"]
        DiffBtns["Difficulty Selector: Easy (36) | Med (46) | Hard (54)"]
        CheckBtn["Check Solution Button"]
    end

    subgraph SolverEngine ["Backtracking Generation Engine"]
        EmptyBoard["Empty 9x9 Board Matrix"]
        Backtrack["solveSudoku(board) with Randomized Permutations"]
        Masker["Remove Clues Based on Difficulty"]
    end

    subgraph Validator ["Validation Matrix"]
        RowVal["Row Uniqueness Check"]
        ColVal["Column Uniqueness Check"]
        BoxVal["3x3 Subgrid Uniqueness Check"]
    end

    subgraph Outcome ["UI & Feedback"]
        DrawBoard["Canvas Draw: Highlight Rows, Cols & Clues"]
        ToastWarn["showToast('Unfilled or conflicting numbers', '⚠️')"]
        WinModal["celebrateWin({ title: 'PUZZLE SOLVED!', stats: [Time, Difficulty] })"]
    end

    DiffBtns --> SolverEngine
    EmptyBoard --> Backtrack --> Masker --> DrawBoard
    CanvasClick --> DrawBoard
    Numpad --> DrawBoard
    Keys --> DrawBoard

    CheckBtn --> Validator
    Validator -- Incomplete / Error --> ToastWarn
    Validator -- Valid Solution --> WinModal
```

---

### 3. 🔤 Wordle Architecture

```mermaid
flowchart TD
    subgraph Inputs ["Inputs"]
        PhysKey["Physical Keyboard (A-Z, Enter, Backspace)"]
        VirtKey["On-Screen QWERTY Virtual Keyboard"]
    end

    subgraph State ["Wordle State (wordle.js)"]
        TargetWord["Target Word (Random 5-Letter Selection)"]
        Guesses["Guesses Matrix: max 6 attempts"]
        CurrentGuess["Current String Buffer"]
        Streak["Played & Current Streak Stats"]
    end

    subgraph Validation ["Two-Pass Verification Algorithm"]
        Pass1["Pass 1: Exact Matches (Green / Correct)"]
        Pass2["Pass 2: Partial Matches (Yellow / Present) vs Absent (Gray)"]
        KeyMap["Sync Virtual Keypad Colors"]
    end

    subgraph Outcomes ["Outcomes"]
        RowRender["DOM Letter Cells Row Update"]
        WinCheck{"Guess === Target?"}
        LossCheck{"Guesses.length === 6?"}
        WinModal["celebrateWin({ title: 'SPLENDID!', Word, Tries, Streak })"]
        LossModal["showGameOverModal({ Word Missed, Reveal Secret })"]
    end

    PhysKey --> CurrentGuess
    VirtKey --> CurrentGuess
    CurrentGuess --> RowRender

    CurrentGuess -- Enter Pressed --> Validation
    Validation --> KeyMap
    KeyMap --> WinCheck

    WinCheck -- Yes --> WinModal
    WinCheck -- No --> LossCheck
    LossCheck -- Yes --> LossModal
```

---

### 4. 🧱 Tetris Architecture

```mermaid
flowchart TD
    subgraph Controls ["Controls"]
        MoveKeys["◄ ► / A D: Lateral Move"]
        RotateKey["▲ / Space / W: Rotate Matrix"]
        DropKey["▼ / S: Soft Drop"]
        PauseKey["P: Toggle Pause"]
    end

    subgraph Loop ["RAF Game Loop (60 FPS)"]
        DeltaTimer["Delta-Time Drop Accumulator"]
        DropLogic["dropPiece()"]
        canMoveCheck{"canMove(piece, dx, dy)?"}
    end

    subgraph MatrixEngine ["Matrix & Collision Logic"]
        Rotation["rotateMatrix(): Transpose & Reverse"]
        LockPiece["lockPiece(): Stamp into 20x10 Board"]
        ClearLines["clearLines(): Splice & Unshift Empty Rows"]
        ScoreCalc["Scoring: [0, 100, 300, 500, 800]"]
    end

    subgraph SafeExit ["Termination & Presentation"]
        Render["Canvas Draw: Locked Cells & Active Glow"]
        CeilingCheck{"Can place new piece at top?"}
        GameOverUI["showGameOverModal / celebrateWin (10+ Lines)"]
        SaveScore["ScoreStorage.set('highScoreTetris')"]
    end

    MoveKeys --> canMoveCheck
    RotateKey --> Rotation --> canMoveCheck
    DropKey --> DropLogic

    DeltaTimer --> DropLogic
    DropLogic -- Bottom Hit --> LockPiece
    LockPiece --> ClearLines --> ScoreCalc --> CeilingCheck
    CeilingCheck -- Blocked --> SafeExit
    CeilingCheck -- Clear --> Render
```

---

### 5. 🏓 Block Breaker Architecture

```mermaid
flowchart TD
    subgraph Controls ["Steering & Input"]
        Mouse["Mouse Position Tracking"]
        Keys["◄ ► or A / D Keyboard"]
        Launch["Space / Click: Launch Ball"]
    end

    subgraph Physics ["Physics & Raycast Reflection"]
        PaddlePos["Paddle Position & Bounds"]
        BallVector["Ball Vector (x, y, dx, dy, speed)"]
        AngleReflect["Surface Angle Clamping (-60° to +60°)"]
        OverlapResolve["Min Overlap Edge Normal Bouncing"]
    end

    subgraph BricksSystem ["Brick Matrix & Progression"]
        Bricks["Dynamic Brick Array: 4 Rows of Neon Blocks"]
        SilverBricks["Multi-Hit Silver Bricks (2 Hits)"]
        Particles["Particle Explosion Spawner"]
        Combo["Combo Multiplier Bonus"]
        LevelAdv{"All Bricks Destroyed?"}
    end

    subgraph Results ["State Evaluation"]
        LifeLost{"Ball below screen bottom?"}
        LevelUp["Next Level (Level 1 ➔ 2 ➔ 3)"]
        WinModal["celebrateWin({ title: 'FORTRESS CLEARED!', 3 Levels })"]
        OverModal["showGameOverModal({ 'OUT OF PADDLES' })"]
    end

    Mouse --> PaddlePos
    Keys --> PaddlePos
    Launch --> BallVector

    BallVector --> AngleReflect
    BallVector --> OverlapResolve
    OverlapResolve --> Bricks
    Bricks --> SilverBricks --> Particles --> Combo

    Bricks --> LevelAdv
    LevelAdv -- Level < 3 --> LevelUp
    LevelAdv -- Level 3 Done --> WinModal

    BallVector --> LifeLost
    LifeLost -- Lives <= 0 --> OverModal
```

---

### 6. 🔢 2048 Architecture

```mermaid
flowchart TD
    subgraph Inputs ["Slide Inputs"]
        Swipes["Arrow Keys / WASD Directional Inputs"]
        Restart["New Game / Start Button"]
    end

    subgraph CoreEngine ["2048 Core Engine (game2048.js)"]
        Grid["4x4 Integer Matrix"]
        SlideMerge["slideAndMerge(row): Filter 0s ➔ Merge Adjacent Equal ➔ Pad 0s"]
        ScoreTracker["Score += Merged Tile Value"]
        Spawn["spawnRandomTile(): 90% '2', 10% '4'"]
    end

    subgraph Evaluation ["State Evaluator"]
        Tile2048Check{"Any tile === 2048 && !won?"}
        LockCheck{"Any empty cells OR equal adjacent neighbors?"}
    end

    subgraph Output ["Display & Celebration"]
        DOMRender["Render HTML .tile-2048 with Dynamic Palette"]
        WinCelebrate["celebrateWin({ '2048 ACHIEVED!', Trophy: 🏆 })"]
        LockModal["showGameOverModal({ 'NO MORE MOVES' })"]
    end

    Swipes --> SlideMerge
    SlideMerge --> ScoreTracker
    ScoreTracker --> Spawn
    Spawn --> DOMRender
    DOMRender --> Tile2048Check

    Tile2048Check -- Yes --> WinCelebrate
    Tile2048Check -- No --> LockCheck
    LockCheck -- Grid Locked --> LockModal
```

---

### 7. 🐦 Cyber Bird Architecture

```mermaid
flowchart TD
    subgraph Controls ["Controls"]
        FlapInput["Space / Up Arrow / Canvas Tap"]
    end

    subgraph Physics ["Bird Physics Engine"]
        Gravity["Gravity Acceleration: +0.45 per frame"]
        Jump["Flap Impulse: velocity = -7.2"]
        Rotation["Tilt Angle: velocity * 0.08"]
    end

    subgraph Obstacles ["Obstacle Pipeline"]
        Timer["Pipe Interval Accumulator"]
        SpawnPipe["Generate Top & Bottom Pipes with Gap Window"]
        MovePipes["Move Left at pipeSpeed (2.8px/frame)"]
        ScorePass{"Bird X > Pipe X + Width?"}
    end

    subgraph Collision ["Collision Detection"]
        FloorCeiling{"Bird Y <= 0 OR Bird Y >= Height?"}
        PipeAABB{"Radial Circle vs Pipe Rectangle Overlap?"}
    end

    subgraph Termination ["Game End & Presentation"]
        GameOver["cancelAnimationFrame & gameOver()"]
        RecordModal["celebrateWin (New Flight Record)"]
        CrashModal["showGameOverModal ('FLIGHT ABORTED')"]
    end

    FlapInput --> Jump
    Jump --> Physics
    Gravity --> Physics
    Physics --> FloorCeiling

    Timer --> SpawnPipe --> MovePipes
    MovePipes --> ScorePass
    MovePipes --> PipeAABB

    FloorCeiling -- Collision --> GameOver
    PipeAABB -- Collision --> GameOver
    GameOver --> RecordModal
    GameOver --> CrashModal
```

---

### 8. 💣 Minesweeper Architecture

```mermaid
flowchart TD
    subgraph UserActions ["Player Actions"]
        LeftClick["Left Click: Reveal Cell"]
        RightClick["Right Click: Flag Mine (🚩)"]
        FlagToggle["Flag Mode Toggle Button"]
        DiffSelect["Difficulty Selector: 9x9 (10) | 12x12 (22)"]
    end

    subgraph BoardInit ["Board Initializer"]
        Matrix["rows x cols Cell Grid"]
        Placer["Random Mine Coordinate Placement"]
        Counter["Calculate 8-Neighbor Mine Proximity Counts"]
    end

    subgraph RevealLogic ["Cell Reveal Logic"]
        FlaggedCheck{"Is cell flagged?"}
        MineHit{"Is cell a mine?"}
        FloodFill["Count === 0: Recursive 8-Direction Reveal"]
    end

    subgraph EndStates ["Resolution"]
        Detonation["revealAllMines() ➔ showGameOverModal ('DETONATION!')"]
        WinCondition{"revealedCount === totalCells - mines?"}
        WinModal["celebrateWin({ 'MINEFIELD CLEARED!', Time, FieldSize })"]
    end

    DiffSelect --> BoardInit
    LeftClick --> FlaggedCheck
    FlaggedCheck -- No --> MineHit
    MineHit -- Yes --> Detonation
    MineHit -- No --> FloodFill
    FloodFill --> WinCondition
    WinCondition -- Yes --> WinModal
```

---

### 9. 🏓 Cyber Pong Architecture

```mermaid
flowchart TD
    subgraph Controls ["Controls"]
        Mouse["Mouse Vertical Tracking"]
        Keys["Arrow Keys / W S Movement"]
    end

    subgraph Court ["Court Dynamics (pong.js)"]
        PaddlePlayer["Player Paddle (Cyan, Left)"]
        PaddleAI["AI Paddle (Purple, Right)"]
        Ball["Ball Position & Velocity Vector (dx, dy)"]
        SpeedRamp["Progressive Ball Velocity Multiplier"]
    end

    subgraph AIIntelligence ["AI Tracking Engine"]
        Prediction["Calculate Target Y from Ball Position"]
        Damping["Clamped Maximum Velocity (4.5px/frame)"]
    end

    subgraph GoalCheck ["Scoring System"]
        LeftOut{"Ball past Left Boundary?"}
        RightOut{"Ball past Right Boundary?"}
        ScoreWin{"Score >= 5?"}
    end

    subgraph Outcomes ["Match Outcome"]
        PlayerWin["celebrateWin({ 'PONG CHAMPION!', 🏆 })"]
        AIWin["showGameOverModal({ 'DEFEATED BY AI' })"]
    end

    Mouse --> PaddlePlayer
    Keys --> PaddlePlayer
    Ball --> Prediction --> Damping --> PaddleAI

    Ball --> LeftOut -- Yes --> GoalCheck
    Ball --> RightOut -- Yes --> GoalCheck

    GoalCheck --> ScoreWin
    ScoreWin -- Player Won --> PlayerWin
    ScoreWin -- AI Won --> AIWin
```

---

### 10. 👾 Space Invaders Architecture

```mermaid
flowchart TD
    subgraph Controls ["Player Defense"]
        Nav["◄ ► or A / D Lateral Ship Steering"]
        Fire["Space or Canvas Tap: Fire Laser Missile"]
    end

    subgraph InvaderArmada ["Alien Fleet Engine"]
        Armada["4x8 Matrix (32 Alien Invaders)"]
        March["Horizontal Sweep with Wall Bounce"]
        Descent["Step Descent (y += 12px) & Speed Acceleration"]
        Shooter["Random Alien Laser Drop (2.5% per frame)"]
    end

    subgraph Combat ["Ballistics & Collision Resolution"]
        PlayerLaser["Player Missiles Ascending"]
        AlienLaser["Alien Missiles Descending"]
        HitAlien{"Player Laser hits Alien Box?"}
        HitPlayer{"Alien Laser hits Player Ship?"}
    end

    subgraph WaveProgression ["Wave Control"]
        AllDead{"Aliens.length === 0?"}
        WaveCheck{"Wave >= 3?"}
        NextWave["Wave++ with Faster Speed + Toast Alert"]
        WinGame["celebrateWin({ 'GALAXY SAVED!', 3 Waves Defeated })"]
        DefenseBreach["showGameOverModal ('DEFENSE BREACHED')"]
    end

    Nav --> PlayerLaser
    Fire --> PlayerLaser
    March --> Descent --> Armada
    Armada --> Shooter --> AlienLaser

    PlayerLaser --> HitAlien
    HitAlien -- Yes --> AllDead
    AllDead -- Wave < 3 --> NextWave --> Armada
    AllDead -- Wave >= 3 --> WinGame

    AlienLaser --> HitPlayer
    HitPlayer -- Lives <= 0 --> DefenseBreach
    Descent -- Alien Y >= Player Y --> DefenseBreach
```
