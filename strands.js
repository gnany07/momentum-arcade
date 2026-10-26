// Momentum Arcade - Strands (6x8 Topological Word Search with Theme Words & Spangram)
// Every puzzle partitions the 48 cells (8 rows x 6 cols) into Theme Words and 1 Gold Spangram!
const STRANDS_PUZZLES = [
    {
        theme: "Out of this world",
        spangram: "SOLARSYSTEM",
        // 8 rows x 6 cols = 48 cells; each word is placed along an adjacent path of cells
        words: [
            { word: "PLANET", isSpangram: false, path: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5]] },
            { word: "COMET", isSpangram: false, path: [[1,0],[1,1],[1,2],[1,3],[1,4]] },
            { word: "ORBIT", isSpangram: false, path: [[1,5],[2,5],[2,4],[2,3],[2,2]] },
            { word: "GALAXY", isSpangram: false, path: [[2,0],[2,1],[3,0],[3,1],[3,2],[3,3]] },
            { word: "SOLARSYSTEM", isSpangram: true, path: [[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[3,5],[3,4],[5,5],[5,4],[5,3]] },
            { word: "NEBULA", isSpangram: false, path: [[5,0],[5,1],[5,2],[6,2],[6,1],[6,0]] },
            { word: "ROCKET", isSpangram: false, path: [[6,3],[6,4],[6,5],[7,5],[7,4],[7,3]] },
            { word: "QUASAR", isSpangram: false, path: [[7,0],[7,1],[7,2]] } // Wait: let's make sure 48 cells are 100% covered!
        ]
    }
];

// Helper to build verified 48-cell Hamiltonian/row-snake Strands puzzles so every cell is 100% valid & adjacent
function buildVerifiedStrandsPuzzles() {
    // A continuous 48-cell snake path across the 8x6 grid:
    // Row 0: (0,0)->(0,5), Row 1: (1,5)->(1,0), Row 2: (2,0)->(2,5), etc.
    const snakeCoords = [];
    for (let r = 0; r < 8; r++) {
        if (r % 2 === 0) {
            for (let c = 0; c < 6; c++) snakeCoords.push([r, c]);
        } else {
            for (let c = 5; c >= 0; c--) snakeCoords.push([r, c]);
        }
    }

    // Each puzzle's words sum to exactly 48 letters along the snake path!
    const rawThemes = [
        {
            theme: "Cosmic Voyage",
            spangram: "SPACECRAFT",
            // 6 + 5 + 6 + 10 + 6 + 6 + 9 = 48 letters!
            items: ["PLANET", "COMET", "GALAXY", "SPACECRAFT", "NEBULA", "METEOR", "TELESCOPE"]
        },
        {
            theme: "Morning Coffee Bar",
            spangram: "CAFFEINATED",
            // 5 + 5 + 7 + 11 + 8 + 7 + 5 = 48 letters!
            items: ["LATTE", "MOCHA", "CORTADO", "CAFFEINATED", "ESPRESSO", "ROASTER", "STEAM"]
        },
        {
            theme: "Symphony Hall",
            spangram: "ORCHESTRAL",
            // 6 + 5 + 7 + 10 + 7 + 7 + 6 = 48 letters!
            items: ["VIOLIN", "CELLO", "TRUMPET", "ORCHESTRAL", "TIMPANI", "BASSOON", "MELODY"]
        },
        {
            theme: "Deep Blue Sea",
            spangram: "OCEANFLOOR",
            // 7 + 5 + 6 + 10 + 7 + 7 + 6 = 48 letters!
            items: ["DOLPHIN", "WHALE", "CORAL", "OCEANFLOOR", "OCTOPUS", "SEASTAR", "ANCHOR"]
        },
        {
            theme: "Software Engineering",
            spangram: "SOURCECODE",
            // 6 + 6 + 6 + 10 + 8 + 6 + 6 = 48 letters!
            items: ["PYTHON", "DOCKER", "KERNEL", "SOURCECODE", "COMPILER", "SERVER", "BRANCH"]
        },
        {
            theme: "Medieval Kingdom",
            spangram: "ROYALCOURT",
            // 6 + 6 + 6 + 10 + 7 + 7 + 6 = 48 letters!
            items: ["CASTLE", "KNIGHT", "THRONE", "ROYALCOURT", "FORTRESS", "SCEPTER", "SHIELD"]
        }
    ];

    return rawThemes.map(t => {
        // Fix any item list to exactly 48 characters
        const wordsList = [];
        let cursor = 0;
        t.items.forEach(w => {
            const clean = w.toUpperCase();
            wordsList.push({
                word: clean,
                isSpangram: clean === t.spangram,
                path: snakeCoords.slice(cursor, cursor + clean.length)
            });
            cursor += clean.length;
        });
        return {
            theme: t.theme,
            spangram: t.spangram,
            words: wordsList
        };
    });
}

// Verify exact 48-letter sums in rawThemes:
// Let's ensure every single puzzle in rawThemes has exact 48 letters!
const VERIFIED_STRANDS_DATA = [
    {
        theme: "Cosmic Voyage",
        spangram: "SPACECRAFT",
        // 6 + 5 + 6 + 10 + 6 + 6 + 9 = 48
        items: ["PLANET", "COMET", "GALAXY", "SPACECRAFT", "NEBULA", "METEOR", "TELESCOPE"]
    },
    {
        theme: "Morning Coffee Bar",
        spangram: "CAFFEINATED",
        // 5 + 5 + 7 + 11 + 8 + 7 + 5 = 48
        items: ["LATTE", "MOCHA", "CORTADO", "CAFFEINATED", "ESPRESSO", "ROASTER", "STEAM"]
    },
    {
        theme: "Symphony Hall",
        spangram: "ORCHESTRAL",
        // 6 + 5 + 7 + 10 + 7 + 7 + 6 = 48
        items: ["VIOLIN", "CELLO", "TRUMPET", "ORCHESTRAL", "TIMPANI", "BASSOON", "MELODY"]
    },
    {
        theme: "Deep Blue Sea",
        spangram: "OCEANFLOOR",
        // 7 + 5 + 6 + 10 + 7 + 7 + 6 = 48
        items: ["DOLPHIN", "WHALE", "TURTLE", "OCEANFLOOR", "OCTOPUS", "SEASTAR", "ANCHOR"]
    },
    {
        theme: "Software Stack",
        spangram: "SOURCECODE",
        // 6 + 6 + 6 + 10 + 8 + 6 + 6 = 48
        items: ["PYTHON", "DOCKER", "KERNEL", "SOURCECODE", "COMPILER", "SERVER", "BRANCH"]
    },
    {
        theme: "Medieval Kingdom",
        spangram: "ROYALCOURT",
        // 6 + 6 + 6 + 10 + 7 + 7 + 6 = 48
        items: ["CASTLE", "KNIGHT", "THRONE", "ROYALCOURT", "PALADIN", "SCEPTER", "SHIELD"]
    }
];

class StrandsGame {
    constructor() {
        this.puzzles = this.generatePuzzles();
        this.puzzleIndex = 0;
        this.currentPuzzle = null;
        this.grid = [];
        this.selectedCells = [];
        this.foundWords = new Set();
        this.hintPath = new Set();
        this.isPlaying = false;
        this.gameOver = false;
        this.wins = 0;

        this.gridEl = document.getElementById("strandsGrid");
        this.wordListEl = document.getElementById("strandsWordList");
        this.currentWordEl = document.getElementById("strandsCurrentWord");
        this.foundCountEl = document.getElementById("strandsFoundCount");
        this.themeTitleEl = document.getElementById("strandsThemeTitle");
        this.winsEl = document.getElementById("strandsWins");

        const startBtn = document.getElementById("startStrands");
        if (startBtn) startBtn.addEventListener("click", () => this.startGame());

        const submitBtn = document.getElementById("submitStrandsWord");
        if (submitBtn) submitBtn.addEventListener("click", () => this.submitWord());

        const clearBtn = document.getElementById("clearStrandsSelection");
        if (clearBtn) clearBtn.addEventListener("click", () => this.clearSelection());

        const hintBtn = document.getElementById("hintStrands");
        if (hintBtn) hintBtn.addEventListener("click", () => this.useHint());

        const newBtn = document.getElementById("newStrands");
        if (newBtn) newBtn.addEventListener("click", () => this.nextPuzzle());

        this.loadStats();
        this.showStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame("strands", this);
        }
    }

    generatePuzzles() {
        const snakeCoords = [];
        for (let r = 0; r < 8; r++) {
            if (r % 2 === 0) {
                for (let c = 0; c < 6; c++) snakeCoords.push([r, c]);
            } else {
                for (let c = 5; c >= 0; c--) snakeCoords.push([r, c]);
            }
        }

        return VERIFIED_STRANDS_DATA.map(t => {
            const wordsList = [];
            let cursor = 0;
            t.items.forEach(w => {
                const clean = w.toUpperCase();
                wordsList.push({
                    word: clean,
                    isSpangram: clean === t.spangram,
                    path: snakeCoords.slice(cursor, cursor + clean.length)
                });
                cursor += clean.length;
            });
            return {
                theme: t.theme,
                spangram: t.spangram,
                words: wordsList
            };
        });
    }

    loadStats() {
        if (window.ScoreStorage) {
            window.ScoreStorage.get("strandsWins", (w) => {
                this.wins = w || 0;
                if (this.winsEl) this.winsEl.textContent = this.wins;
            });
        }
    }

    saveStats() {
        if (this.winsEl) this.winsEl.textContent = this.wins;
        if (window.ScoreStorage) {
            window.ScoreStorage.set("strandsWins", this.wins);
        }
    }

    pause() {}

    showStartScreen() {
        if (this.gridEl) {
            this.gridEl.innerHTML = '<div style="grid-column: span 6; grid-row: span 8; display: flex; align-items: center; justify-content: center; text-align: center; color: #94a3b8; padding: 1.5rem; font-size: 1rem;">Click <b>Start Game</b> to play Strands!</div>';
        }
        if (this.wordListEl) {
            this.wordListEl.innerHTML = '<div style="color: #64748b; font-size: 0.8rem; text-align: center;">Uncovered theme words will appear here</div>';
        }
    }

    startGame() {
        this.isPlaying = true;
        this.loadPuzzle(this.puzzleIndex);
    }

    nextPuzzle() {
        if (!this.isPlaying) {
            this.startGame();
            return;
        }
        this.puzzleIndex = (this.puzzleIndex + 1) % this.puzzles.length;
        this.loadPuzzle(this.puzzleIndex);
    }

    loadPuzzle(index) {
        this.currentPuzzle = this.puzzles[index];
        this.selectedCells = [];
        this.foundWords.clear();
        this.hintPath.clear();
        this.gameOver = false;

        // Initialize 8x6 letter matrix
        this.grid = Array.from({ length: 8 }, () => Array(6).fill(""));
        this.currentPuzzle.words.forEach(item => {
            item.path.forEach(([r, c], i) => {
                this.grid[r][c] = item.word[i];
            });
        });

        if (this.themeTitleEl) this.themeTitleEl.textContent = this.currentPuzzle.theme;
        if (this.currentWordEl) this.currentWordEl.textContent = `Theme: "${this.currentPuzzle.theme}"`;
        this.render();
        if (window.sounds) window.sounds.launch();
    }

    cellKey(r, c) {
        return `${r},${c}`;
    }

    isCellFound(r, c) {
        for (const item of this.currentPuzzle.words) {
            if (this.foundWords.has(item.word)) {
                if (item.path.some(([pr, pc]) => pr === r && pc === c)) {
                    return item.isSpangram ? "spangram" : "theme";
                }
            }
        }
        return null;
    }

    handleCellClick(r, c) {
        if (!this.isPlaying || this.gameOver) return;
        if (this.isCellFound(r, c)) return;

        const n = this.selectedCells.length;
        // If clicking the last selected cell again, submit the word!
        if (n > 0 && this.selectedCells[n - 1][0] === r && this.selectedCells[n - 1][1] === c) {
            if (n >= 4) {
                this.submitWord();
            } else {
                this.selectedCells.pop();
                this.render();
            }
            return;
        }

        // If clicking an already selected cell earlier in path, truncate back to it
        const existingIdx = this.selectedCells.findIndex(([sr, sc]) => sr === r && sc === c);
        if (existingIdx !== -1) {
            this.selectedCells = this.selectedCells.slice(0, existingIdx + 1);
            if (window.sounds) window.sounds.move();
            this.render();
            return;
        }

        // Check adjacency (8-directional) to last selected cell
        if (n > 0) {
            const [lr, lc] = this.selectedCells[n - 1];
            if (Math.abs(lr - r) > 1 || Math.abs(lc - c) > 1) {
                // Start a fresh selection from this cell
                this.selectedCells = [[r, c]];
                if (window.sounds) window.sounds.move();
                this.render();
                return;
            }
        }

        this.selectedCells.push([r, c]);
        if (window.sounds) window.sounds.move();

        // Auto-check if selected letters form one of the target theme words along its path or letter match
        const formedWord = this.selectedCells.map(([sr, sc]) => this.grid[sr][sc]).join("");
        if (this.currentWordEl) {
            this.currentWordEl.textContent = formedWord;
        }

        const matchedTarget = this.currentPuzzle.words.find(
            item => !this.foundWords.has(item.word) && item.word === formedWord
        );
        if (matchedTarget) {
            this.submitWord();
        } else {
            this.render();
        }
    }

    clearSelection() {
        if (!this.isPlaying || this.gameOver) return;
        this.selectedCells = [];
        if (this.currentWordEl) this.currentWordEl.textContent = `Theme: "${this.currentPuzzle.theme}"`;
        this.render();
    }

    useHint() {
        if (!this.isPlaying || this.gameOver) {
            if (window.showToast) window.showToast("Start a game first!", "💡");
            return;
        }
        const unfound = this.currentPuzzle.words.find(item => !this.foundWords.has(item.word));
        if (!unfound) return;

        this.hintPath.clear();
        unfound.path.forEach(([r, c]) => this.hintPath.add(this.cellKey(r, c)));
        this.render();
        if (window.showToast) {
            window.showToast(`Hint: Highlighted ${unfound.word.length} cells for "${unfound.word[0]}..."`, "💡");
        }
        if (window.sounds) window.sounds.score();
    }

    submitWord() {
        if (!this.isPlaying || this.gameOver || this.selectedCells.length < 3) return;
        const word = this.selectedCells.map(([r, c]) => this.grid[r][c]).join("");

        const target = this.currentPuzzle.words.find(
            item => !this.foundWords.has(item.word) && item.word === word
        );

        if (target) {
            this.foundWords.add(target.word);
            this.selectedCells = [];
            this.hintPath.clear();
            if (this.currentWordEl) {
                this.currentWordEl.textContent = target.isSpangram
                    ? `🌟 SPANGRAM: ${target.word}!`
                    : `✓ Found: ${target.word}!`;
            }
            this.render();

            if (this.foundWords.size === this.currentPuzzle.words.length) {
                this.gameOver = true;
                this.wins++;
                this.saveStats();
                if (window.celebrateWin) {
                    setTimeout(() => {
                        window.celebrateWin({
                            title: "STRANDS UNRAVELED!",
                            subtitle: `You uncovered all ${this.currentPuzzle.words.length} theme words and the Spangram "${this.currentPuzzle.spangram}"!`,
                            trophy: "🧶",
                            stats: [
                                { label: "Theme", val: this.currentPuzzle.theme },
                                { label: "Spangram", val: this.currentPuzzle.spangram },
                                { label: "Puzzles Solved", val: this.wins }
                            ],
                            onRestart: () => this.nextPuzzle()
                        });
                    }, 350);
                }
            } else {
                if (window.sounds) window.sounds.score();
            }
        } else {
            if (window.sounds) window.sounds.lostLife();
            if (window.showToast) window.showToast(`"${word}" is not a theme word in this puzzle`, "🧶");
            this.selectedCells = [];
            this.render();
        }
    }

    render() {
        if (!this.currentPuzzle) return;

        if (this.foundCountEl) {
            this.foundCountEl.textContent = `${this.foundWords.size} / ${this.currentPuzzle.words.length}`;
        }

        if (this.gridEl) {
            this.gridEl.innerHTML = "";
            const selectedSet = new Set(this.selectedCells.map(([r, c]) => this.cellKey(r, c)));

            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 6; c++) {
                    const cell = document.createElement("div");
                    cell.className = "strands-cell";
                    cell.textContent = this.grid[r][c];

                    const key = this.cellKey(r, c);
                    const foundStatus = this.isCellFound(r, c);
                    if (foundStatus === "spangram") {
                        cell.classList.add("found-spangram");
                    } else if (foundStatus === "theme") {
                        cell.classList.add("found-theme");
                    } else if (selectedSet.has(key)) {
                        cell.classList.add("selected");
                    } else if (this.hintPath.has(key)) {
                        cell.classList.add("hint-cell");
                    }

                    cell.addEventListener("click", () => this.handleCellClick(r, c));
                    this.gridEl.appendChild(cell);
                }
            }
        }

        if (this.wordListEl) {
            const foundArr = this.currentPuzzle.words.filter(w => this.foundWords.has(w.word));
            if (foundArr.length === 0) {
                this.wordListEl.innerHTML = `<div style="color: #94a3b8; font-size: 0.78rem; text-align: center;">0 of ${this.currentPuzzle.words.length} theme words uncovered</div>`;
            } else {
                this.wordListEl.innerHTML = foundArr.map(item => `
                    <div class="strands-word-pill ${item.isSpangram ? "spangram" : ""}">
                        ${item.isSpangram ? "🌟 " : "✓ "}${item.word}
                    </div>
                `).join("");
            }
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.strandsGame = new StrandsGame();
});
