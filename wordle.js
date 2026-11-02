// Momentum Arcade - Wordle
// Features: 5, 6, and 7-Letter Words (10,000 Most Common Words per category)
// Chances: 5-Letter = 6 tries, 6-Letter = 8 tries, 7-Letter = 10 tries
// Timer: 5:00 countdown timer per game/turn
// Mode: Solo & 2-Player Dual Tournament (5 Games) with comprehensive scoreboard

class Wordle {
    constructor() {
        // Load the 10,000 most common words dictionaries from wordle_words.js
        const list5 = (typeof WORDLE_5_LETTERS !== "undefined" && WORDLE_5_LETTERS) || (typeof window !== "undefined" && window.WORDLE_5_LETTERS) || [];
        const list6 = (typeof WORDLE_6_LETTERS !== "undefined" && WORDLE_6_LETTERS) || (typeof window !== "undefined" && window.WORDLE_6_LETTERS) || [];
        const list7 = (typeof WORDLE_7_LETTERS !== "undefined" && WORDLE_7_LETTERS) || (typeof window !== "undefined" && window.WORDLE_7_LETTERS) || [];

        this.wordLists = { 5: list5, 6: list6, 7: list7 };
        this.dictSets = {
            5: new Set(list5),
            6: new Set(list6),
            7: new Set(list7)
        };

        // Curated recognizable everyday words for target selection (top 2,500)
        this.answerPools = {
            5: list5.slice(0, 2500),
            6: list6.slice(0, 2500),
            7: list7.slice(0, 2500)
        };

        this.definitions = (typeof WORDLE_DEFINITIONS !== "undefined" && WORDLE_DEFINITIONS) ||
                           (typeof window !== "undefined" && window.WORDLE_DEFINITIONS) || {};

        this.maxGuessesByLength = { 5: 6, 6: 8, 7: 10 };

        // Configuration State
        this.wordLength = 5;
        this.maxGuesses = 6;
        this.mode = "solo"; // "solo" or "dual"

        // Active Dictionary references
        this.wordList = this.wordLists[5];
        this.validWordSet = this.dictSets[5];
        this.answerPool = this.answerPools[5];

        // Solo Game State
        this.currentWord = "";
        this.guesses = [];
        this.currentGuess = "";
        this.gameOver = false;
        this.isPlaying = false;
        this.played = 0;
        this.streak = 0;
        this.revealedIndices = new Set();
        this.clueShown = false;

        // 5-Minute Timer State (300 seconds)
        this.timeLimit = 300;
        this.timeLeft = 300;
        this.timerId = null;
        this.timerRunning = false;

        // Dual Tournament State (5-game series)
        this.maxTournamentGames = 5;
        this.tournamentGame = 1; // 1 to 5
        this.currentPlayer = 1; // 1 or 2
        this.p1Wins = 0;
        this.p2Wins = 0;
        this.tournamentDraws = 0;
        this.p1TurnResult = null; // { word, guesses, timeLeft, timeSpent, solved }
        this.tournamentHistory = [];
        this.intermissionShown = false;
        this.setupOverlayShown = false;
        this.p1Name = "Player 1";
        this.p2Name = "Player 2";

        // Cache DOM Elements
        this.board = document.getElementById("wordleBoard");
        this.keyboard = document.getElementById("wordleKeyboard");
        this.cluePanel = document.getElementById("wordleCluePanel");
        this.cluePatternEl = document.getElementById("wordleCluePattern");
        this.clueTextEl = document.getElementById("wordleClueText");
        this.validCountEl = document.getElementById("wordleValidCount");
        this.timerEl = document.getElementById("wordleTimer");
        this.controlsHintEl = document.getElementById("wordleControlsHint");

        // Word Meaning Elements
        this.meaningPanel = document.getElementById("wordleMeaningPanel");
        this.meaningWordTitle = document.getElementById("meaningWordTitle");
        this.meaningBody = document.getElementById("meaningBody");

        // Tournament DOM Elements
        this.tournamentBanner = document.getElementById("wordleTournamentBanner");
        this.tournamentGameNumEl = document.getElementById("tournamentGameNum");
        this.p1ScoreCard = document.getElementById("p1ScoreCard");
        this.p2ScoreCard = document.getElementById("p2ScoreCard");
        this.p1WinsEl = document.getElementById("p1Wins");
        this.p2WinsEl = document.getElementById("p2Wins");
        this.p1TurnTag = document.getElementById("p1TurnTag");
        this.p2TurnTag = document.getElementById("p2TurnTag");
        this.p1Label = document.getElementById("p1Label");
        this.p2Label = document.getElementById("p2Label");

        // Tournament Setup DOM Elements
        this.setupOverlay = document.getElementById("wordleTournamentSetupOverlay");
        this.p1Input = document.getElementById("wordleP1Input");
        this.p2Input = document.getElementById("wordleP2Input");
        this.startTournamentBtn = document.getElementById("wordleStartTournamentBtn");
        this.cancelTournamentBtn = document.getElementById("wordleCancelTournamentBtn");

        // Intermission Overlay Elements
        this.intermissionOverlay = document.getElementById("wordleIntermissionOverlay");
        this.intermissionIcon = document.getElementById("intermissionIcon");
        this.intermissionTitle = document.getElementById("intermissionTitle");
        this.intermissionDesc = document.getElementById("intermissionDesc");
        this.intermissionNotice = document.getElementById("intermissionNotice");
        this.intermissionActionBtn = document.getElementById("intermissionActionBtn");

        // Buttons
        const startBtn = document.getElementById("startWordle");
        if (startBtn) startBtn.addEventListener("click", () => this.startGame());

        const newBtn = document.getElementById("newWordle");
        if (newBtn) newBtn.addEventListener("click", () => this.handleNewGameClick());

        const hintBtn = document.getElementById("wordleHintBtn");
        if (hintBtn) hintBtn.addEventListener("click", () => this.revealClue());

        if (this.startTournamentBtn) {
            this.startTournamentBtn.addEventListener("click", () => this.confirmTournamentSetup());
        }
        if (this.cancelTournamentBtn) {
            this.cancelTournamentBtn.addEventListener("click", () => this.cancelTournamentSetup());
        }
        [this.p1Input, this.p2Input].forEach(inp => {
            if (!inp) return;
            inp.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    this.confirmTournamentSetup();
                }
            });
        });

        // Length group listeners
        const lengthBtns = document.querySelectorAll("#wordleLengthGroup .diff-btn");
        lengthBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const len = parseInt(btn.dataset.length, 10);
                if (len && len !== this.wordLength) {
                    this.setWordLength(len);
                }
            });
        });

        // Mode group listeners
        const modeBtns = document.querySelectorAll("#wordleModeGroup .diff-btn");
        modeBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const mode = btn.dataset.mode;
                if (mode && mode !== this.mode) {
                    this.setGameMode(mode);
                }
            });
        });

        if (this.intermissionActionBtn) {
            this.intermissionActionBtn.addEventListener("click", () => this.handleIntermissionAction());
        }

        document.addEventListener("keydown", this.handleKeyPress.bind(this));

        this.loadStats();
        this.showStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame("wordle", this);
        }
    }

    loadStats() {
        if (window.ScoreStorage) {
            window.ScoreStorage.get("wordlePlayed", (p) => {
                this.played = p || 0;
                const el = document.getElementById("wordlePlayed");
                if (el) el.textContent = this.played;
            });
            window.ScoreStorage.get("wordleStreak", (s) => {
                this.streak = s || 0;
                const el = document.getElementById("wordleStreak");
                if (el) el.textContent = this.streak;
            });
            window.ScoreStorage.get("wordleP1Name", (name) => {
                if (name && typeof name === "string") {
                    this.p1Name = name;
                    if (this.p1Input) this.p1Input.value = name;
                    if (this.p1Label) this.p1Label.textContent = name;
                }
            });
            window.ScoreStorage.get("wordleP2Name", (name) => {
                if (name && typeof name === "string") {
                    this.p2Name = name;
                    if (this.p2Input) this.p2Input.value = name;
                    if (this.p2Label) this.p2Label.textContent = name;
                }
            });
        }
    }

    saveStats() {
        const pEl = document.getElementById("wordlePlayed");
        if (pEl) pEl.textContent = this.played;
        const sEl = document.getElementById("wordleStreak");
        if (sEl) sEl.textContent = this.streak;

        if (window.ScoreStorage) {
            window.ScoreStorage.set("wordlePlayed", this.played);
            window.ScoreStorage.set("wordleStreak", this.streak);
        }
    }

    setWordLength(len) {
        if (![5, 6, 7].includes(len)) return;
        this.wordLength = len;
        this.maxGuesses = this.maxGuessesByLength[len];
        this.wordList = this.wordLists[len];
        this.validWordSet = this.dictSets[len];
        this.answerPool = this.answerPools[len];

        // Update active UI button
        document.querySelectorAll("#wordleLengthGroup .diff-btn").forEach(btn => {
            btn.classList.toggle("active", parseInt(btn.dataset.length, 10) === len);
        });

        this.updateControlsHint();

        if (this.mode === "dual") {
            this.openTournamentSetup();
        } else if (this.isPlaying) {
            this.newGame();
        } else {
            this.showStartScreen();
        }
    }

    setGameMode(mode) {
        if (mode !== "solo" && mode !== "dual") return;
        this.mode = mode;

        document.querySelectorAll("#wordleModeGroup .diff-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.mode === mode);
        });

        if (mode === "dual") {
            if (this.tournamentBanner) this.tournamentBanner.classList.remove("hidden");
            this.openTournamentSetup();
        } else {
            if (this.tournamentBanner) this.tournamentBanner.classList.add("hidden");
            this.hideTournamentSetup();
            this.hideIntermission();
            this.updateControlsHint();
            if (this.isPlaying) {
                this.newGame();
            } else {
                this.showStartScreen();
            }
        }
    }

    updateControlsHint() {
        if (!this.controlsHintEl) return;
        if (this.mode === "dual") {
            this.controlsHintEl.textContent = `Dual Tournament (5 Games • ${this.wordLength}-Letter): ${this.p1Name} vs ${this.p2Name}. 5:00 timer per turn. Most game wins takes the championship!`;
        } else {
            this.controlsHintEl.textContent = `Guess the hidden ${this.wordLength}-letter word in ${this.maxGuesses} tries. 5:00 countdown timer. Green = exact match, Gold = in word.`;
        }
    }

    getDefinition(word) {
        if (!word) return "A recognized English word.";
        const upper = word.toUpperCase();
        if (this.definitions && this.definitions[upper]) {
            return this.definitions[upper];
        }
        return `A recognized ${word.length}-letter English word.`;
    }

    showMeaning(word) {
        if (!this.meaningPanel || !word) return;
        const def = this.getDefinition(word);
        if (this.meaningWordTitle) this.meaningWordTitle.textContent = word.toUpperCase();
        if (this.meaningBody) this.meaningBody.textContent = def;
        this.meaningPanel.classList.remove("hidden");
    }

    hideMeaning() {
        if (this.meaningPanel) this.meaningPanel.classList.add("hidden");
    }

    showStartScreen() {
        this.stopTimer();
        this.resetTimer();
        this.hideIntermission();
        this.hideTournamentSetup();
        this.hideMeaning();

        if (this.board) {
            this.board.setAttribute("data-length", this.wordLength);
            this.board.innerHTML = `<div style="grid-column: span ${this.wordLength}; text-align: center; color: #94a3b8; padding: 2.2rem 0; font-size: 1.05rem;">Click <b>Start Game</b> to play ${this.wordLength}-Letter Wordle!</div>`;
        }
        if (this.keyboard && this.keyboard.style) {
            this.keyboard.style.display = "none";
        }
        if (this.cluePanel) {
            this.cluePanel.classList.add("hidden");
        }
        if (this.validCountEl) {
            this.validCountEl.textContent = (this.wordList ? this.wordList.length : 10000).toLocaleString();
        }
    }

    showKeyboard() {
        if (!this.keyboard) return;
        if (this.keyboard.style) {
            this.keyboard.style.display = "flex";
        }
        if (this.keyboard.children.length === 0) {
            this.initializeKeyboard();
        }
    }

    hideKeyboard() {
        if (this.keyboard && this.keyboard.style) {
            this.keyboard.style.display = "none";
        }
    }

    startGame() {
        this.isPlaying = true;
        this.hideIntermission();
        this.hideTournamentSetup();
        this.showKeyboard();
        if (this.cluePanel) this.cluePanel.classList.add("hidden");

        this.initializeBoard();
        this.initializeKeyboard();

        if (this.mode === "dual") {
            this.openTournamentSetup();
        } else {
            this.newGame();
        }
    }

    handleNewGameClick() {
        if (!this.isPlaying) {
            this.startGame();
            return;
        }
        if (this.mode === "dual") {
            this.openTournamentSetup();
        } else {
            this.newGame();
        }
    }

    newGame() {
        this.isPlaying = true;
        this.hideIntermission();
        this.hideTournamentSetup();
        this.hideMeaning();
        this.showKeyboard();
        this.currentWord = this.answerPool[Math.floor(Math.random() * this.answerPool.length)];
        this.guesses = [];
        this.currentGuess = "";
        this.gameOver = false;
        this.revealedIndices = new Set();
        this.clueShown = false;

        if (this.cluePanel) {
            this.cluePanel.classList.add("hidden");
        }

        this.resetTimer();
        this.startTimer();

        this.initializeBoard();
        this.resetKeyboardColors();
        this.updateClueAndValidationUI();

        if (window.sounds) window.sounds.launch();
    }

    pause() {
        if (this.isPlaying && !this.gameOver) {
            this.stopTimer();
        }
    }

    resume() {
        if (this.isPlaying && !this.gameOver && !this.intermissionShown) {
            this.startTimer();
        }
    }

    // ----------------------------------------------------
    // 5-Minute Countdown Timer Implementation
    // ----------------------------------------------------
    startTimer() {
        this.stopTimer();
        this.timerRunning = true;
        this.updateTimerDisplay();

        this.timerId = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.handleTimeUp();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.timerRunning = false;
        if (this.timerEl) this.timerEl.classList.remove("timer-warning");
    }

    resetTimer() {
        this.stopTimer();
        this.timeLeft = this.timeLimit;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        if (!this.timerEl) return;
        const mins = Math.floor(Math.max(0, this.timeLeft) / 60);
        const secs = Math.max(0, this.timeLeft) % 60;
        this.timerEl.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

        if (this.timeLeft <= 60 && this.timeLeft > 0 && this.timerRunning) {
            this.timerEl.classList.add("timer-warning");
        } else {
            this.timerEl.classList.remove("timer-warning");
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    handleTimeUp() {
        if (this.gameOver) return;
        if (window.sounds) window.sounds.lostLife();

        if (this.mode === "solo") {
            this.gameOver = true;
            this.played++;
            this.streak = 0;
            this.saveStats();
            this.updateClueAndValidationUI();
            this.showMeaning(this.currentWord);

            if (window.showGameOverModal) {
                setTimeout(() => {
                    const def = this.getDefinition(this.currentWord);
                    window.showGameOverModal({
                        title: "TIME'S UP!",
                        subtitle: `5 minutes expired! The secret word was "${this.currentWord}".`,
                        icon: "⏰",
                        stats: [
                            { label: "Word", val: this.currentWord },
                            { label: "Meaning", val: def, wide: true },
                            { label: "Length", val: `${this.wordLength} Letters` },
                            { label: "Guesses", val: `${this.guesses.length}/${this.maxGuesses}` },
                            { label: "Streak Reset", val: "0" }
                        ],
                        onRestart: () => this.newGame()
                    });
                }, 350);
            }
        } else {
            // Dual Tournament Timeout
            this.handleDualTurnEnd(false, true);
        }
    }

    // ----------------------------------------------------
    // Dual Tournament Logic (5-Game Series)
    // ----------------------------------------------------
    openTournamentSetup() {
        this.setupOverlayShown = true;
        this.stopTimer();
        this.hideIntermission();
        this.hideMeaning();

        if (this.p1Input) this.p1Input.value = this.p1Name;
        if (this.p2Input) this.p2Input.value = this.p2Name;
        if (this.setupOverlay) this.setupOverlay.classList.remove("hidden");

        setTimeout(() => {
            if (this.p1Input) this.p1Input.focus();
        }, 60);
    }

    hideTournamentSetup() {
        this.setupOverlayShown = false;
        if (this.setupOverlay) this.setupOverlay.classList.add("hidden");
    }

    confirmTournamentSetup() {
        const p1 = (this.p1Input && this.p1Input.value.trim()) || "Player 1";
        const p2 = (this.p2Input && this.p2Input.value.trim()) || "Player 2";
        this.p1Name = p1.slice(0, 15);
        this.p2Name = p2.slice(0, 15);

        if (window.ScoreStorage) {
            window.ScoreStorage.set("wordleP1Name", this.p1Name);
            window.ScoreStorage.set("wordleP2Name", this.p2Name);
        }

        this.hideTournamentSetup();
        this.startNewTournament();
    }

    cancelTournamentSetup() {
        this.hideTournamentSetup();
        // If tournament was not active, switch back to solo
        if (this.tournamentHistory.length === 0 && !this.isPlaying) {
            this.setGameMode("solo");
        } else if (this.isPlaying && this.tournamentGame > 0) {
            this.resume();
        }
    }

    startNewTournament() {
        this.mode = "dual";
        document.querySelectorAll("#wordleModeGroup .diff-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.mode === "dual");
        });
        if (this.tournamentBanner) this.tournamentBanner.classList.remove("hidden");

        this.isPlaying = true;
        this.tournamentGame = 1;
        this.currentPlayer = 1;
        this.p1Wins = 0;
        this.p2Wins = 0;
        this.tournamentDraws = 0;
        this.p1TurnResult = null;
        this.tournamentHistory = [];

        this.showKeyboard();
        this.updateTournamentScoreboard();
        this.updateControlsHint();
        this.startTournamentGame();
    }

    updateTournamentScoreboard() {
        if (this.tournamentGameNumEl) {
            this.tournamentGameNumEl.textContent = `Game ${this.tournamentGame} of ${this.maxTournamentGames}`;
        }
        if (this.p1WinsEl) this.p1WinsEl.textContent = `${this.p1Wins} ${this.p1Wins === 1 ? "Win" : "Wins"}`;
        if (this.p2WinsEl) this.p2WinsEl.textContent = `${this.p2Wins} ${this.p2Wins === 1 ? "Win" : "Wins"}`;

        if (this.p1Label) this.p1Label.textContent = this.p1Name;
        if (this.p2Label) this.p2Label.textContent = this.p2Name;

        if (this.p1ScoreCard && this.p2ScoreCard) {
            if (this.currentPlayer === 1) {
                this.p1ScoreCard.classList.add("active");
                this.p2ScoreCard.classList.remove("active");
                if (this.p1TurnTag) this.p1TurnTag.textContent = "Turn";
                if (this.p2TurnTag) this.p2TurnTag.textContent = "Waiting";
            } else {
                this.p1ScoreCard.classList.remove("active");
                this.p2ScoreCard.classList.add("active");
                if (this.p1TurnTag) this.p1TurnTag.textContent = "Ready";
                if (this.p2TurnTag) this.p2TurnTag.textContent = "Turn";
            }
        }
    }

    startTournamentGame() {
        this.currentPlayer = 1;
        this.p1TurnResult = null;
        this.updateTournamentScoreboard();
        this.startTurn(1);
    }

    startTurn(playerNum) {
        this.isPlaying = true;
        this.currentPlayer = playerNum;
        this.hideIntermission();
        this.hideTournamentSetup();
        this.hideMeaning();
        this.showKeyboard();
        this.updateTournamentScoreboard();

        this.currentWord = this.answerPool[Math.floor(Math.random() * this.answerPool.length)];
        this.guesses = [];
        this.currentGuess = "";
        this.gameOver = false;
        this.revealedIndices = new Set();
        this.clueShown = false;

        if (this.cluePanel) this.cluePanel.classList.add("hidden");

        this.resetTimer();
        this.startTimer();

        this.initializeBoard();
        this.resetKeyboardColors();
        this.updateClueAndValidationUI();

        const activeName = playerNum === 1 ? this.p1Name : this.p2Name;
        if (window.showToast) {
            window.showToast(`Game ${this.tournamentGame}/5: ${activeName}'s Turn!`, "👥", 2500);
        }
        if (window.sounds) window.sounds.launch();
    }

    handleDualTurnEnd(solved, timedOut = false) {
        this.stopTimer();
        this.gameOver = true;
        const timeSpent = Math.max(1, 300 - this.timeLeft);

        const result = {
            word: this.currentWord,
            guesses: this.guesses.length,
            timeSpent: timedOut ? 300 : timeSpent,
            solved: solved,
            timedOut: timedOut
        };

        if (this.currentPlayer === 1) {
            this.p1TurnResult = result;
            const p1Def = this.getDefinition(this.currentWord);
            this.showIntermission({
                icon: solved ? "🎯" : timedOut ? "⏰" : "⏸️",
                title: `${this.p1Name}'s Turn Complete!`,
                desc: (solved
                    ? `<b>${this.p1Name}</b> solved <b>"${this.currentWord}"</b> in ${result.guesses} ${result.guesses === 1 ? "try" : "tries"} (${this.formatTime(result.timeSpent)})!`
                    : timedOut
                    ? `<b>${this.p1Name}</b> timed out on <b>"${this.currentWord}"</b>.`
                    : `<b>${this.p1Name}</b> used all ${this.maxGuesses} tries without solving <b>"${this.currentWord}"</b>.`) +
                    `<div class="intermission-word-def"><b>Meaning:</b> ${p1Def}</div>`,
                notice: `Hand the device to <b>${this.p2Name}</b> to take their turn!`,
                btnText: `Start ${this.p2Name}'s Turn 🚀`,
                action: () => this.startTurn(2)
            });
        } else {
            // Player 2 finished; resolve Game N
            const p2Result = result;
            this.resolveTournamentGame(this.p1TurnResult, p2Result);
        }
    }

    resolveTournamentGame(p1, p2) {
        let gameWinner = 0; // 0 = draw, 1 = P1, 2 = P2
        let reason = "";

        if (p1.solved && p2.solved) {
            if (p1.guesses < p2.guesses) {
                gameWinner = 1;
                reason = `${this.p1Name} solved in fewer tries (${p1.guesses} vs ${p2.guesses})!`;
            } else if (p2.guesses < p1.guesses) {
                gameWinner = 2;
                reason = `${this.p2Name} solved in fewer tries (${p2.guesses} vs ${p1.guesses})!`;
            } else {
                // Tiebreaker on time spent
                if (p1.timeSpent < p2.timeSpent) {
                    gameWinner = 1;
                    reason = `Tiebreaker! ${this.p1Name} was faster (${this.formatTime(p1.timeSpent)} vs ${this.formatTime(p2.timeSpent)})!`;
                } else if (p2.timeSpent < p1.timeSpent) {
                    gameWinner = 2;
                    reason = `Tiebreaker! ${this.p2Name} was faster (${this.formatTime(p2.timeSpent)} vs ${this.formatTime(p1.timeSpent)})!`;
                } else {
                    gameWinner = 0;
                    reason = `Exact tie! Same guesses (${p1.guesses}) and time (${this.formatTime(p1.timeSpent)})!`;
                }
            }
        } else if (p1.solved && !p2.solved) {
            gameWinner = 1;
            reason = `${this.p1Name} solved their word while ${this.p2Name} missed!`;
        } else if (!p1.solved && p2.solved) {
            gameWinner = 2;
            reason = `${this.p2Name} solved their word while ${this.p1Name} missed!`;
        } else {
            gameWinner = 0;
            reason = "Neither player solved their word!";
        }

        if (gameWinner === 1) this.p1Wins++;
        else if (gameWinner === 2) this.p2Wins++;
        else this.tournamentDraws++;

        this.tournamentHistory.push({
            game: this.tournamentGame,
            p1,
            p2,
            winner: gameWinner
        });

        this.updateTournamentScoreboard();
        const p1Def = this.getDefinition(p1.word);
        const p2Def = this.getDefinition(p2.word);
        this.showMeaning(this.currentWord);

        if (this.tournamentGame < this.maxTournamentGames) {
            const nextGameNum = this.tournamentGame + 1;
            const winnerTitle = gameWinner === 1
                ? `${this.p1Name} Wins Game ${this.tournamentGame}!`
                : gameWinner === 2
                ? `${this.p2Name} Wins Game ${this.tournamentGame}!`
                : `Game ${this.tournamentGame} is a Draw!`;

            this.showIntermission({
                icon: gameWinner === 1 ? "🥇" : gameWinner === 2 ? "🥈" : "🤝",
                title: winnerTitle,
                desc: `${reason}<br><br><b>Series:</b> ${this.p1Name}: ${this.p1Wins} | ${this.p2Name}: ${this.p2Wins}` +
                      `<div class="intermission-word-def"><b>${this.p1Name}'s Word (${p1.word}):</b> ${p1Def}</div>` +
                      `<div class="intermission-word-def"><b>${this.p2Name}'s Word (${p2.word}):</b> ${p2Def}</div>`,
                notice: `Get ready for <b>Game ${nextGameNum} of ${this.maxTournamentGames}</b>!`,
                btnText: `Start Game ${nextGameNum} of 5 ➡️`,
                action: () => {
                    this.tournamentGame++;
                    this.startTurn(1);
                }
            });
        } else {
            // Tournament Finished after 5 games!
            this.concludeTournament();
        }
    }

    concludeTournament() {
        let championTitle = "";
        let championSub = "";
        let trophy = "🏆";

        if (this.p1Wins > this.p2Wins) {
            championTitle = `${this.p1Name.toUpperCase()} WINS THE TOURNAMENT!`;
            championSub = `${this.p1Name} dominated the 5-game series with ${this.p1Wins} wins to ${this.p2Wins}!`;
            trophy = "🏆";
        } else if (this.p2Wins > this.p1Wins) {
            championTitle = `${this.p2Name.toUpperCase()} WINS THE TOURNAMENT!`;
            championSub = `${this.p2Name} claimed victory in the 5-game series with ${this.p2Wins} wins to ${this.p1Wins}!`;
            trophy = "🏆";
        } else {
            championTitle = "TOURNAMENT DRAW!";
            championSub = `${this.p1Name} & ${this.p2Name} tied at ${this.p1Wins}–${this.p2Wins} after 5 thrilling games!`;
            trophy = "🤝";
        }

        if (window.celebrateWin) {
            setTimeout(() => {
                window.celebrateWin({
                    title: championTitle,
                    subtitle: championSub,
                    trophy: trophy,
                    stats: [
                        { label: "Tournament", val: "5 Games (Dual)" },
                        { label: "Word Length", val: `${this.wordLength} Letters` },
                        { label: `${this.p1Name} Wins`, val: this.p1Wins },
                        { label: `${this.p2Name} Wins`, val: this.p2Wins },
                        { label: "Draws", val: this.tournamentDraws }
                    ],
                    onRestart: () => this.openTournamentSetup()
                });
            }, 350);
        } else if (window.sounds) {
            window.sounds.win();
        }
    }

    showIntermission({ icon, title, desc, notice, btnText, action }) {
        this.intermissionShown = true;
        if (this.intermissionIcon) this.intermissionIcon.textContent = icon || "🔄";
        if (this.intermissionTitle) this.intermissionTitle.textContent = title || "Next Turn";
        if (this.intermissionDesc) this.intermissionDesc.innerHTML = desc || "";
        if (this.intermissionNotice) this.intermissionNotice.innerHTML = notice || "";
        if (this.intermissionActionBtn) this.intermissionActionBtn.textContent = btnText || "Continue 🚀";

        this._intermissionActionCallback = action;
        if (this.intermissionOverlay) this.intermissionOverlay.classList.remove("hidden");
    }

    hideIntermission() {
        this.intermissionShown = false;
        if (this.intermissionOverlay) this.intermissionOverlay.classList.add("hidden");
        this._intermissionActionCallback = null;
    }

    handleIntermissionAction() {
        const callback = this._intermissionActionCallback;
        this.hideIntermission();
        if (typeof callback === "function") {
            callback();
        }
    }

    // ----------------------------------------------------
    // Board & Keyboard DOM Initialization
    // ----------------------------------------------------
    initializeBoard() {
        if (!this.board) return;
        this.board.innerHTML = "";
        this.board.setAttribute("data-length", this.wordLength);

        for (let i = 0; i < this.maxGuesses; i++) {
            const row = document.createElement("div");
            row.className = "wordle-row";
            row.setAttribute("data-length", this.wordLength);

            for (let j = 0; j < this.wordLength; j++) {
                const cell = document.createElement("div");
                cell.className = "wordle-cell";
                row.appendChild(cell);
            }
            this.board.appendChild(row);
        }
    }

    initializeKeyboard() {
        if (!this.keyboard) return;
        if (this.keyboard.style) {
            this.keyboard.style.display = "flex";
        }
        const keyboardLayout = [
            ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
            ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
            ["↵", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
        ];

        this.keyboard.innerHTML = "";
        keyboardLayout.forEach(row => {
            const keyboardRow = document.createElement("div");
            keyboardRow.className = "keyboard-row";

            row.forEach(key => {
                const keyElement = document.createElement("div");
                keyElement.className = "key";
                keyElement.textContent = key;

                if (key === "↵") {
                    keyElement.classList.add("enter-key");
                } else if (key === "⌫") {
                    keyElement.classList.add("backspace-key");
                }

                keyElement.addEventListener("click", () => this.handleKeyClick(key));
                keyboardRow.appendChild(keyElement);
            });

            this.keyboard.appendChild(keyboardRow);
        });
    }

    resetKeyboardColors() {
        if (!this.keyboard || this.keyboard.children.length === 0) {
            this.initializeKeyboard();
        }
        const keys = this.keyboard ? this.keyboard.querySelectorAll(".key") : [];
        keys.forEach(key => {
            key.className = "key";
            if (key.textContent === "↵") key.classList.add("enter-key");
            if (key.textContent === "⌫") key.classList.add("backspace-key");
        });
    }

    // ----------------------------------------------------
    // Clues & Validation
    // ----------------------------------------------------
    getWordBaseClue() {
        if (!this.currentWord) return "";
        const vowels = (this.currentWord.match(/[AEIOU]/g) || []).length;
        const uniqueCount = new Set(this.currentWord.split("")).size;
        const repeatInfo = uniqueCount === this.wordLength ? "No repeating letters" : "Has repeating letters";
        return `${vowels} ${vowels === 1 ? "vowel" : "vowels"} • ${repeatInfo}`;
    }

    getClueState() {
        const exactPositions = new Array(this.wordLength).fill(null);
        const minLetterCounts = {};

        this.revealedIndices.forEach(idx => {
            const letter = this.currentWord[idx];
            if (letter) {
                exactPositions[idx] = letter;
                minLetterCounts[letter] = Math.max(minLetterCounts[letter] || 0, 1);
            }
        });

        this.guesses.forEach(guess => {
            const targetCounts = {};
            for (let i = 0; i < this.wordLength; i++) {
                const ch = this.currentWord[i];
                targetCounts[ch] = (targetCounts[ch] || 0) + 1;
            }

            const matchedCounts = {};
            for (let i = 0; i < this.wordLength; i++) {
                if (guess[i] === this.currentWord[i]) {
                    exactPositions[i] = guess[i];
                    targetCounts[guess[i]]--;
                    matchedCounts[guess[i]] = (matchedCounts[guess[i]] || 0) + 1;
                }
            }

            for (let i = 0; i < this.wordLength; i++) {
                if (guess[i] !== this.currentWord[i]) {
                    const gChar = guess[i];
                    if (this.currentWord.includes(gChar) && targetCounts[gChar] > 0) {
                        targetCounts[gChar]--;
                        matchedCounts[gChar] = (matchedCounts[gChar] || 0) + 1;
                    }
                }
            }

            Object.keys(matchedCounts).forEach(letter => {
                minLetterCounts[letter] = Math.max(minLetterCounts[letter] || 0, matchedCounts[letter]);
            });
        });

        return { exactPositions, minLetterCounts };
    }

    isValidDictionaryWord(word) {
        if (!word || typeof word !== "string" || word.length !== this.wordLength) return false;
        return this.validWordSet.has(word.toUpperCase());
    }

    validateWordForClue(word) {
        const upper = (word || "").toUpperCase();
        if (upper.length !== this.wordLength) {
            return { valid: false, code: "LENGTH", reason: `Word must be ${this.wordLength} letters!` };
        }
        if (!this.isValidDictionaryWord(upper)) {
            return { valid: false, code: "NOT_IN_LIST", reason: `"${upper}" is not in the ${this.wordLength}-letter dictionary!` };
        }
        return { valid: true, code: "VALID", reason: `Valid ${this.wordLength}-letter word` };
    }

    getMatchingWordsForClues(clueState = null) {
        const state = clueState || this.getClueState();
        return this.wordList.filter(w => {
            for (let i = 0; i < this.wordLength; i++) {
                if (state.exactPositions[i] && w[i] !== state.exactPositions[i]) return false;
            }
            for (const [letter, minCount] of Object.entries(state.minLetterCounts)) {
                let count = 0;
                for (let i = 0; i < this.wordLength; i++) {
                    if (w[i] === letter) count++;
                }
                if (count < minCount) return false;
            }
            return true;
        });
    }

    revealClue() {
        if (!this.isPlaying || this.gameOver || !this.currentWord || this.intermissionShown) {
            if (window.showToast) window.showToast("Click Start Game first to use a clue!", "💡");
            return;
        }

        const clueState = this.getClueState();
        const unrevealed = [];
        for (let i = 0; i < this.wordLength; i++) {
            if (!clueState.exactPositions[i]) {
                unrevealed.push(i);
            }
        }

        if (unrevealed.length <= 1) {
            this.clueShown = true;
            this.updateClueAndValidationUI();
            if (window.showToast) window.showToast("Almost all letters are known — solve the word!", "💡");
            return;
        }

        const pickIdx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        this.revealedIndices.add(pickIdx);
        this.clueShown = true;
        this.updateClueAndValidationUI();

        const revealedLetter = this.currentWord[pickIdx];
        if (window.showToast) {
            window.showToast(`Clue: Position ${pickIdx + 1} is '${revealedLetter}'!`, "💡");
        }
        if (window.sounds) window.sounds.score();
    }

    updateClueAndValidationUI() {
        if (!this.isPlaying || !this.currentWord) return;

        const clueState = this.getClueState();
        const matchingWords = this.getMatchingWordsForClues(clueState);

        if (this.validCountEl) {
            this.validCountEl.textContent = matchingWords.length.toLocaleString();
        }

        if (!this.cluePanel) return;
        if (!this.clueShown) {
            this.cluePanel.classList.add("hidden");
            return;
        }

        this.cluePanel.classList.remove("hidden");

        const patternStr = clueState.exactPositions.map(ch => ch || "_").join(" ");
        if (this.cluePatternEl) {
            this.cluePatternEl.textContent = `💡 Clue: ${patternStr}`;
        }

        if (this.clueTextEl) {
            this.clueTextEl.textContent = this.getWordBaseClue();
        }
    }

    shakeCurrentRow() {
        const currentRow = this.guesses.length;
        const rowEl = document.querySelector(`.wordle-row:nth-child(${currentRow + 1})`);
        if (rowEl) {
            rowEl.classList.remove("shake");
            void rowEl.offsetWidth;
            rowEl.classList.add("shake");
        }
        if (window.sounds) window.sounds.lostLife();
    }

    // ----------------------------------------------------
    // User Input & Guess Processing
    // ----------------------------------------------------
    handleKeyPress(event) {
        if (this.setupOverlayShown || this.intermissionShown) return;
        if (event.target && (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA")) return;
        if (!this.isPlaying || this.gameOver) return;
        if (window.arcadeApp && !window.arcadeApp.isGameActive("wordle")) return;
        if (event.ctrlKey || event.metaKey || event.altKey) return;

        if (event.key === "Enter") {
            event.preventDefault();
            this.submitGuess();
        } else if (event.key === "Backspace") {
            event.preventDefault();
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.updateBoard();
            if (window.sounds) window.sounds.move();
        } else if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
            if (this.currentGuess.length < this.wordLength) {
                this.currentGuess += event.key.toUpperCase();
                this.updateBoard();
                if (window.sounds) window.sounds.move();
            }
        }
    }

    handleKeyClick(key) {
        if (this.setupOverlayShown || this.intermissionShown || !this.isPlaying || this.gameOver) return;

        if (key === "↵" || key === "ENTER") {
            this.submitGuess();
        } else if (key === "⌫" || key === "BACKSPACE") {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.updateBoard();
            if (window.sounds) window.sounds.move();
        } else if (this.currentGuess.length < this.wordLength) {
            this.currentGuess += key;
            this.updateBoard();
            if (window.sounds) window.sounds.move();
        }
    }

    updateBoard() {
        const currentRow = this.guesses.length;
        const cells = document.querySelectorAll(`.wordle-row:nth-child(${currentRow + 1}) .wordle-cell`);

        cells.forEach((cell, index) => {
            cell.textContent = this.currentGuess[index] || "";
            cell.className = "wordle-cell";
        });
    }

    submitGuess() {
        if (this.currentGuess.length !== this.wordLength) {
            this.shakeCurrentRow();
            if (window.showToast) window.showToast(`Word must be ${this.wordLength} letters!`, "⚠️");
            return;
        }

        const guess = this.currentGuess.toUpperCase();

        const validation = this.validateWordForClue(guess);
        if (!validation.valid) {
            this.shakeCurrentRow();
            if (window.showToast) window.showToast(validation.reason, "❌");
            return;
        }

        if (this.guesses.includes(guess)) {
            this.shakeCurrentRow();
            if (window.showToast) window.showToast(`You already guessed "${guess}"!`, "⚠️");
            return;
        }

        this.guesses.push(guess);

        const currentRow = this.guesses.length - 1;
        const cells = document.querySelectorAll(`.wordle-row:nth-child(${currentRow + 1}) .wordle-cell`);

        const letterCounts = {};
        for (let i = 0; i < this.wordLength; i++) {
            const letter = this.currentWord[i];
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        }

        // Exact matches (Green)
        for (let i = 0; i < this.wordLength; i++) {
            cells[i].textContent = guess[i];
            if (guess[i] === this.currentWord[i]) {
                cells[i].classList.add("correct");
                letterCounts[guess[i]]--;
            }
        }

        // Partial matches (Yellow) & Absent (Gray)
        for (let i = 0; i < this.wordLength; i++) {
            if (guess[i] !== this.currentWord[i]) {
                if (this.currentWord.includes(guess[i]) && letterCounts[guess[i]] > 0) {
                    cells[i].classList.add("present");
                    letterCounts[guess[i]]--;
                } else {
                    cells[i].classList.add("absent");
                }
            }
        }

        // Update keyboard colors
        const keys = this.keyboard ? this.keyboard.querySelectorAll(".key") : [];
        for (let i = 0; i < this.wordLength; i++) {
            const gChar = guess[i];
            const isCorrect = cells[i].classList.contains("correct");
            const isPresent = cells[i].classList.contains("present");
            keys.forEach(key => {
                if (key.textContent !== gChar) return;
                if (isCorrect) {
                    key.classList.remove("present", "absent");
                    key.classList.add("correct");
                } else if (isPresent && !key.classList.contains("correct")) {
                    key.classList.remove("absent");
                    key.classList.add("present");
                } else if (!key.classList.contains("correct") && !key.classList.contains("present")) {
                    key.classList.add("absent");
                }
            });
        }

        this.currentGuess = "";

        if (guess === this.currentWord) {
            // Solved!
            if (this.mode === "dual") {
                this.handleDualTurnEnd(true, false);
            } else {
                this.gameOver = true;
                this.stopTimer();
                this.played++;
                this.streak++;
                this.saveStats();
                this.updateClueAndValidationUI();
                this.showMeaning(this.currentWord);
                const timeSpent = 300 - this.timeLeft;
                const timeStr = this.formatTime(timeSpent);
                const def = this.getDefinition(this.currentWord);

                if (window.celebrateWin) {
                    setTimeout(() => {
                        window.celebrateWin({
                            title: "SPLENDID!",
                            subtitle: `You deciphered "${this.currentWord}" in ${this.guesses.length} ${this.guesses.length === 1 ? "try" : "tries"}!`,
                            trophy: "🔤",
                            stats: [
                                { label: "Word", val: this.currentWord },
                                { label: "Meaning", val: def, wide: true },
                                { label: "Length", val: `${this.wordLength} Letters` },
                                { label: "Guesses", val: `${this.guesses.length}/${this.maxGuesses}` },
                                { label: "Win Streak", val: this.streak },
                                { label: "Time Taken", val: timeStr }
                            ],
                            onRestart: () => this.newGame()
                        });
                    }, 350);
                } else if (window.sounds) {
                    window.sounds.win();
                }
            }
        } else if (this.guesses.length === this.maxGuesses) {
            // Out of guesses!
            if (this.mode === "dual") {
                this.handleDualTurnEnd(false, false);
            } else {
                this.gameOver = true;
                this.stopTimer();
                this.played++;
                this.streak = 0;
                this.saveStats();
                this.updateClueAndValidationUI();
                this.showMeaning(this.currentWord);
                const def = this.getDefinition(this.currentWord);

                if (window.showGameOverModal) {
                    setTimeout(() => {
                        window.showGameOverModal({
                            title: "WORD MISSED",
                            subtitle: `The secret word was "${this.currentWord}".`,
                            icon: "💡",
                            stats: [
                                { label: "Correct Word", val: this.currentWord },
                                { label: "Meaning", val: def, wide: true },
                                { label: "Length", val: `${this.wordLength} Letters` },
                                { label: "Games Played", val: this.played },
                                { label: "Streak Reset", val: "0" }
                            ],
                            onRestart: () => this.newGame()
                        });
                    }, 350);
                } else if (window.sounds) {
                    window.sounds.gameOver();
                }
            }
        } else {
            this.updateBoard();
            this.updateClueAndValidationUI();
            if (window.sounds) window.sounds.score();
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.wordleGame = new Wordle();
});

if (typeof module !== "undefined" && module.exports) {
    module.exports = Wordle;
}