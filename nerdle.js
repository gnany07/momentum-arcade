// Momentum Arcade - Nerdle (8-Character Math Equation Deduction Game)
const NERDLE_EQUATIONS = [
    "12+35=47", "24+18=42", "56-19=37", "64-28=36", "15*3+2=47", "8*7-6=50",
    "9*6+4=58", "72/8+5=14", "48/6+7=15", "81/9+6=15", "14*3-5=37", "16*2+9=41",
    "45-18=27", "37+28=65", "63/7+8=17", "54/6+9=18", "12*4-7=41", "13*3+8=47",
    "84-39=45", "92-47=45", "29+46=75", "38+54=92", "18*3-6=48", "11*5+9=64",
    "42/6+2=9", "36/4-2=7", "49/7+1=8", "27/3-4=5", "7*8+12=68", "6*9+15=69",
    "95-38=57", "73-26=47", "19+54=73", "26+49=75", "15*4-8=52", "17*2+6=40"
].filter(eq => eq.length === 8);

class NerdleGame {
    constructor() {
        this.equations = NERDLE_EQUATIONS;
        this.currentEquation = "";
        this.guesses = [];
        this.currentGuess = "";
        this.maxGuesses = 6;
        this.length = 8;
        this.isPlaying = false;
        this.gameOver = false;
        this.played = 0;
        this.streak = 0;

        this.board = document.getElementById("nerdleBoard");
        this.keyboard = document.getElementById("nerdleKeyboard");

        const startBtn = document.getElementById("startNerdle");
        if (startBtn) startBtn.addEventListener("click", () => this.startGame());

        const newBtn = document.getElementById("newNerdle");
        if (newBtn) newBtn.addEventListener("click", () => this.newGame());

        const hintBtn = document.getElementById("hintNerdle");
        if (hintBtn) hintBtn.addEventListener("click", () => this.revealClue());

        document.addEventListener("keydown", this.handleKeyPress.bind(this));

        this.loadStats();
        this.showStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame("nerdle", this);
        }
    }

    loadStats() {
        if (window.ScoreStorage) {
            window.ScoreStorage.get("nerdlePlayed", (p) => {
                this.played = p || 0;
                const el = document.getElementById("nerdlePlayed");
                if (el) el.textContent = this.played;
            });
            window.ScoreStorage.get("nerdleStreak", (s) => {
                this.streak = s || 0;
                const el = document.getElementById("nerdleStreak");
                if (el) el.textContent = this.streak;
            });
        }
    }

    saveStats() {
        const pEl = document.getElementById("nerdlePlayed");
        if (pEl) pEl.textContent = this.played;
        const sEl = document.getElementById("nerdleStreak");
        if (sEl) sEl.textContent = this.streak;

        if (window.ScoreStorage) {
            window.ScoreStorage.set("nerdlePlayed", this.played);
            window.ScoreStorage.set("nerdleStreak", this.streak);
        }
    }

    showStartScreen() {
        if (this.board) {
            this.board.innerHTML = '<div style="grid-column: span 8; text-align: center; color: #94a3b8; padding: 2rem 0; font-size: 1.05rem;">Click <b>Start Game</b> to play Nerdle!</div>';
        }
        if (this.keyboard) {
            this.keyboard.style.display = "none";
        }
    }

    startGame() {
        this.isPlaying = true;
        if (this.keyboard) this.keyboard.style.display = "flex";
        this.initializeBoard();
        this.initializeKeyboard();
        this.newGame();
    }

    pause() {
        if (this.isPlaying && !this.gameOver && typeof nerdleTimer !== "undefined") {
            nerdleTimer.stop();
        }
    }

    initializeBoard() {
        this.board.innerHTML = "";
        for (let i = 0; i < this.maxGuesses; i++) {
            const row = document.createElement("div");
            row.className = "nerdle-row";
            for (let j = 0; j < this.length; j++) {
                const cell = document.createElement("div");
                cell.className = "nerdle-cell";
                row.appendChild(cell);
            }
            this.board.appendChild(row);
        }
    }

    initializeKeyboard() {
        const rows = [
            ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
            ["+", "-", "*", "/", "=", "↵", "⌫"]
        ];
        this.keyboard.innerHTML = "";
        rows.forEach(row => {
            const rEl = document.createElement("div");
            rEl.className = "keyboard-row";
            row.forEach(k => {
                const keyEl = document.createElement("div");
                keyEl.className = "key";
                keyEl.textContent = k;
                if (k === "↵") keyEl.classList.add("enter-key");
                if (k === "⌫") keyEl.classList.add("backspace-key");
                keyEl.addEventListener("click", () => this.handleInput(k));
                rEl.appendChild(keyEl);
            });
            this.keyboard.appendChild(rEl);
        });
    }

    newGame() {
        if (!this.isPlaying) {
            this.startGame();
            return;
        }
        this.currentEquation = this.equations[Math.floor(Math.random() * this.equations.length)];
        this.guesses = [];
        this.currentGuess = "";
        this.gameOver = false;

        if (typeof nerdleTimer !== "undefined") {
            nerdleTimer.reset();
            nerdleTimer.start();
        }

        this.board.querySelectorAll(".nerdle-cell").forEach(c => {
            c.textContent = "";
            c.className = "nerdle-cell";
        });
        this.keyboard.querySelectorAll(".key").forEach(k => {
            k.className = "key";
            if (k.textContent === "↵") k.classList.add("enter-key");
            if (k.textContent === "⌫") k.classList.add("backspace-key");
        });

        if (window.sounds) window.sounds.launch();
    }

    revealClue() {
        if (!this.isPlaying || this.gameOver || !this.currentEquation) {
            if (window.showToast) window.showToast("Start a game first!", "💡");
            return;
        }
        const eqIdx = this.currentEquation.indexOf("=");
        const ops = this.currentEquation.match(/[\+\-\*\/]/g) || [];
        if (window.showToast) {
            window.showToast(`Clue: '=' is at position ${eqIdx + 1}, uses operator '${ops[0]}'`, "💡");
        }
        if (window.sounds) window.sounds.score();
    }

    // Safely evaluate a mathematical expression string with +, -, *, /
    evaluateMathLHS(expr) {
        if (!/^[0-9\+\-\*\/]+$/.test(expr)) return null;
        if (/^[\+\-\*\/]|[\+\-\*\/]$|[\+\-\*\/]{2,}/.test(expr)) return null;
        // Reject leading zeros on multi-digit numbers (e.g. 05)
        const tokens = expr.match(/[0-9]+|[\+\-\*\/]/g);
        if (!tokens) return null;
        for (const t of tokens) {
            if (/^[0-9]+$/.test(t) && t.length > 1 && t.startsWith("0")) return null;
        }

        // First pass: * and /
        const pass1 = [];
        let i = 0;
        while (i < tokens.length) {
            const tk = tokens[i];
            if (tk === "*" || tk === "/") {
                const prev = pass1.pop();
                const next = Number(tokens[i + 1]);
                if (tk === "/" && next === 0) return null;
                pass1.push(tk === "*" ? prev * next : prev / next);
                i += 2;
            } else {
                pass1.push(/^[0-9]+$/.test(tk) ? Number(tk) : tk);
                i++;
            }
        }

        // Second pass: + and -
        let result = pass1[0];
        for (let j = 1; j < pass1.length; j += 2) {
            const op = pass1[j];
            const val = pass1[j + 1];
            result = op === "+" ? result + val : result - val;
        }
        return result;
    }

    validateEquation(eq) {
        if (eq.length !== 8) return { valid: false, reason: "Equation must be 8 characters!" };
        const parts = eq.split("=");
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
            return { valid: false, reason: "Equation must contain one '=' sign!" };
        }
        const [lhs, rhs] = parts;
        if (!/^[0-9]+$/.test(rhs) || (rhs.length > 1 && rhs.startsWith("0"))) {
            return { valid: false, reason: "Right side of '=' must be a valid number!" };
        }
        const lhsVal = this.evaluateMathLHS(lhs);
        if (lhsVal === null || Math.abs(lhsVal - Number(rhs)) > 1e-9) {
            return { valid: false, reason: `That math doesn't compute! (${lhs} ≠ ${rhs})` };
        }
        return { valid: true };
    }

    handleKeyPress(event) {
        if (!this.isPlaying || this.gameOver) return;
        if (window.arcadeApp && !window.arcadeApp.isGameActive("nerdle")) return;
        if (event.ctrlKey || event.metaKey || event.altKey) return;

        if (event.key === "Enter") {
            event.preventDefault();
            this.handleInput("↵");
        } else if (event.key === "Backspace") {
            event.preventDefault();
            this.handleInput("⌫");
        } else if (/^[0-9\+\-\*\/\=]$/.test(event.key)) {
            event.preventDefault();
            this.handleInput(event.key);
        }
    }

    handleInput(key) {
        if (!this.isPlaying || this.gameOver) return;

        if (key === "↵") {
            this.submitGuess();
        } else if (key === "⌫") {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.updateBoard();
            if (window.sounds) window.sounds.move();
        } else if (this.currentGuess.length < this.length) {
            this.currentGuess += key;
            this.updateBoard();
            if (window.sounds) window.sounds.move();
        }
    }

    updateBoard() {
        const r = this.guesses.length;
        const cells = this.board.querySelectorAll(`.nerdle-row:nth-child(${r + 1}) .nerdle-cell`);
        cells.forEach((cell, idx) => {
            cell.textContent = this.currentGuess[idx] || "";
            cell.className = "nerdle-cell";
        });
    }

    shakeRow() {
        const r = this.guesses.length;
        const rowEl = this.board.querySelector(`.nerdle-row:nth-child(${r + 1})`);
        if (rowEl) {
            rowEl.classList.remove("shake");
            void rowEl.offsetWidth;
            rowEl.classList.add("shake");
        }
        if (window.sounds) window.sounds.lostLife();
    }

    submitGuess() {
        const check = this.validateEquation(this.currentGuess);
        if (!check.valid) {
            this.shakeRow();
            if (window.showToast) window.showToast(check.reason, "🧮");
            return;
        }

        const guess = this.currentGuess;
        this.guesses.push(guess);

        const r = this.guesses.length - 1;
        const cells = this.board.querySelectorAll(`.nerdle-row:nth-child(${r + 1}) .nerdle-cell`);

        const counts = {};
        for (let i = 0; i < this.length; i++) {
            const ch = this.currentEquation[i];
            counts[ch] = (counts[ch] || 0) + 1;
        }

        for (let i = 0; i < this.length; i++) {
            cells[i].textContent = guess[i];
            if (guess[i] === this.currentEquation[i]) {
                cells[i].classList.add("correct");
                counts[guess[i]]--;
            }
        }

        for (let i = 0; i < this.length; i++) {
            if (guess[i] !== this.currentEquation[i]) {
                if (this.currentEquation.includes(guess[i]) && counts[guess[i]] > 0) {
                    cells[i].classList.add("present");
                    counts[guess[i]]--;
                } else {
                    cells[i].classList.add("absent");
                }
            }
        }

        // Update keyboard colors
        const keys = this.keyboard.querySelectorAll(".key");
        for (let i = 0; i < this.length; i++) {
            const ch = guess[i];
            const isCorrect = cells[i].classList.contains("correct");
            const isPresent = cells[i].classList.contains("present");
            keys.forEach(k => {
                if (k.textContent !== ch) return;
                if (isCorrect) {
                    k.classList.remove("present", "absent");
                    k.classList.add("correct");
                } else if (isPresent && !k.classList.contains("correct")) {
                    k.classList.remove("absent");
                    k.classList.add("present");
                } else if (!k.classList.contains("correct") && !k.classList.contains("present")) {
                    k.classList.add("absent");
                }
            });
        }

        this.currentGuess = "";

        if (guess === this.currentEquation) {
            this.gameOver = true;
            if (typeof nerdleTimer !== "undefined") nerdleTimer.stop();
            this.played++;
            this.streak++;
            this.saveStats();
            const timeStr = document.getElementById("nerdleTimer") ? document.getElementById("nerdleTimer").textContent : "00:00";
            if (window.celebrateWin) {
                setTimeout(() => {
                    window.celebrateWin({
                        title: "MATH GENIUS!",
                        subtitle: `You solved "${this.currentEquation}" in ${this.guesses.length} ${this.guesses.length === 1 ? "try" : "tries"}!`,
                        trophy: "🧮",
                        stats: [
                            { label: "Equation", val: this.currentEquation },
                            { label: "Guesses", val: `${this.guesses.length}/6` },
                            { label: "Streak", val: this.streak },
                            { label: "Time", val: timeStr }
                        ],
                        onRestart: () => this.newGame()
                    });
                }, 350);
            }
        } else if (this.guesses.length >= this.maxGuesses) {
            this.gameOver = true;
            if (typeof nerdleTimer !== "undefined") nerdleTimer.stop();
            this.played++;
            this.streak = 0;
            this.saveStats();
            if (window.showGameOverModal) {
                setTimeout(() => {
                    window.showGameOverModal({
                        title: "EQUATION MISSED",
                        subtitle: `The secret equation was "${this.currentEquation}".`,
                        icon: "🧮",
                        stats: [
                            { label: "Equation", val: this.currentEquation },
                            { label: "Played", val: this.played }
                        ],
                        onRestart: () => this.newGame()
                    });
                }, 350);
            }
        } else {
            if (window.sounds) window.sounds.score();
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.nerdleGame = new NerdleGame();
});
