// Momentum Arcade - Connections (Group 16 Words into 4 Categories of 4)
const CONNECTIONS_PUZZLES = [
    {
        categories: [
            { tier: 0, title: "PROGRAMMING LANGUAGES", words: ["PYTHON", "RUST", "SWIFT", "RUBY"] },
            { tier: 1, title: "COFFEE ESPRESSO DRINKS", words: ["LATTE", "MOCHA", "CORTADO", "LUNGO"] },
            { tier: 2, title: "PLANETS & MOONS", words: ["TITAN", "VENUS", "EUROPA", "PHOBOS"] },
            { tier: 3, title: "___ BOARD", words: ["KEY", "SKATE", "CHALK", "SOUND"] }
        ]
    },
    {
        categories: [
            { tier: 0, title: "PALINDROMES", words: ["KAYAK", "LEVEL", "RADAR", "CIVIC"] },
            { tier: 1, title: "GREEK LETTERS", words: ["ALPHA", "DELTA", "SIGMA", "OMEGA"] },
            { tier: 2, title: "CHESS PIECES", words: ["BISHOP", "KNIGHT", "ROOK", "QUEEN"] },
            { tier: 3, title: "THINGS WITH RINGS", words: ["SATURN", "CIRCUS", "TREE", "BOXER"] }
        ]
    },
    {
        categories: [
            { tier: 0, title: "MUSICAL INSTRUMENTS", words: ["CELLO", "FLUTE", "BANJO", "HARP"] },
            { tier: 1, title: "TYPES OF CLOUDS", words: ["CIRRUS", "CUMULUS", "STRATUS", "NIMBUS"] },
            { tier: 2, title: "FAMOUS SCIENTISTS", words: ["NEWTON", "TESLA", "CURIE", "DARWIN"] },
            { tier: 3, title: "FIRE ___", words: ["WALL", "PLACE", "WORKS", "SIDE"] }
        ]
    },
    {
        categories: [
            { tier: 0, title: "PRECIOUS GEMS", words: ["OPAL", "TOPAZ", "JADE", "PEARL"] },
            { tier: 1, title: "PASTA SHAPES", words: ["PENNE", "FUSILLI", "FARFALLE", "RIGATONI"] },
            { tier: 2, title: "WEB BROWSERS", words: ["CHROME", "SAFARI", "BRAVE", "OPERA"] },
            { tier: 3, title: "WORDS AFTER 'COLD'", words: ["BREW", "FRONT", "TURKEY", "FEET"] }
        ]
    },
    {
        categories: [
            { tier: 0, title: "OCEAN CREATURES", words: ["ORCA", "CORAL", "SQUID", "KRILL"] },
            { tier: 1, title: "MARTIAL ARTS", words: ["JUDO", "KARATE", "AIKIDO", "KENDO"] },
            { tier: 2, title: "WORLD CURRENCIES", words: ["FRANC", "POUND", "DINAR", "RUPEE"] },
            { tier: 3, title: "SILENT FIRST LETTER", words: ["KNIGHT", "GNOME", "PSALM", "WRIST"] }
        ]
    },
    {
        categories: [
            { tier: 0, title: "CITRUS FRUITS", words: ["LEMON", "LIME", "POMELO", "YUZU"] },
            { tier: 1, title: "CARD GAMES", words: ["POKER", "BRIDGE", "HEARTS", "RUMMY"] },
            { tier: 2, title: "SHAKESPEARE PLAYS", words: ["HAMLET", "MACBETH", "OTHELLO", "TEMPEST"] },
            { tier: 3, title: "___ LIGHT", words: ["FLASH", "GREEN", "SPOT", "MOON"] }
        ]
    },
    {
        categories: [
            { tier: 0, title: "TREES", words: ["MAPLE", "BIRCH", "CEDAR", "WILLOW"] },
            { tier: 1, title: "DANCE STYLES", words: ["SALSA", "TANGO", "WALTZ", "SWING"] },
            { tier: 2, title: "NOBEL GASES", words: ["HELIUM", "NEON", "ARGON", "XENON"] },
            { tier: 3, title: "THINGS THAT HAVE KEYS", words: ["PIANO", "MAP", "LOCK", "LAPTOP"] }
        ]
    },
    {
        categories: [
            { tier: 0, title: "WINTER GEAR", words: ["SCARF", "GLOVE", "BEANIE", "PARKA"] },
            { tier: 1, title: "GEOMETRIC SHAPES", words: ["PRISM", "TORUS", "CONE", "SPHERE"] },
            { tier: 2, title: "MYTHICAL CREATURES", words: ["SPHINX", "HYDRA", "GRIFFIN", "KRAKEN"] },
            { tier: 3, title: "SUN ___", words: ["FLOWER", "GLASSES", "BURN", "DIAL"] }
        ]
    },
    {
        categories: [
            { tier: 0, title: "BAKERY ITEMS", words: ["BAGEL", "SCONE", "MUFFIN", "DANISH"] },
            { tier: 1, title: "LINUX DISTROS", words: ["UBUNTU", "DEBIAN", "FEDORA", "ARCH"] },
            { tier: 2, title: "CONSTELLATIONS", words: ["ORION", "LYRA", "DRACO", "CYGNUS"] },
            { tier: 3, title: "PAPER ___", words: ["CLIP", "TIGER", "TRAIL", "WEIGHT"] }
        ]
    },
    {
        categories: [
            { tier: 0, title: "SPICES & HERBS", words: ["THYME", "CUMIN", "CLOVE", "BASIL"] },
            { tier: 1, title: "FILM GENRES", words: ["NOIR", "DRAMA", "WESTERN", "THRILLER"] },
            { tier: 2, title: "MOUNTAIN RANGES", words: ["ANDES", "ALPS", "ROCKIES", "URALS"] },
            { tier: 3, title: "THINGS WITH TEETH", words: ["COMB", "SAW", "ZIPPER", "GEAR"] }
        ]
    }
];

class ConnectionsGame {
    constructor() {
        this.puzzles = CONNECTIONS_PUZZLES;
        this.puzzleIndex = 0;
        this.currentPuzzle = null;
        this.remainingWords = [];
        this.selectedWords = new Set();
        this.solvedCategories = [];
        this.previousGuesses = new Set();
        this.mistakesLeft = 4;
        this.isPlaying = false;
        this.gameOver = false;
        this.wins = 0;
        this.streak = 0;
        this.hintWords = new Set();

        this.gridEl = document.getElementById("connectionsGrid");
        this.solvedEl = document.getElementById("connectionsSolved");
        this.mistakesEl = document.getElementById("connectionsMistakes");
        this.puzzleNumEl = document.getElementById("connectionsPuzzleNum");
        this.submitBtn = document.getElementById("submitConnections");

        const startBtn = document.getElementById("startConnections");
        if (startBtn) startBtn.addEventListener("click", () => this.startGame());

        if (this.submitBtn) this.submitBtn.addEventListener("click", () => this.submitGroup());

        const shuffleBtn = document.getElementById("shuffleConnections");
        if (shuffleBtn) shuffleBtn.addEventListener("click", () => this.shuffleWords());

        const deselectBtn = document.getElementById("deselectConnections");
        if (deselectBtn) deselectBtn.addEventListener("click", () => this.deselectAll());

        const hintBtn = document.getElementById("hintConnections");
        if (hintBtn) hintBtn.addEventListener("click", () => this.useHint());

        const newBtn = document.getElementById("newConnections");
        if (newBtn) newBtn.addEventListener("click", () => this.nextPuzzle());

        this.loadStats();
        this.showStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame("connections", this);
        }
    }

    loadStats() {
        if (window.ScoreStorage) {
            window.ScoreStorage.get("connectionsWins", (w) => {
                this.wins = w || 0;
                const el = document.getElementById("connectionsWins");
                if (el) el.textContent = this.wins;
            });
            window.ScoreStorage.get("connectionsStreak", (s) => {
                this.streak = s || 0;
                const el = document.getElementById("connectionsStreak");
                if (el) el.textContent = this.streak;
            });
        }
    }

    saveStats() {
        const wEl = document.getElementById("connectionsWins");
        if (wEl) wEl.textContent = this.wins;
        const sEl = document.getElementById("connectionsStreak");
        if (sEl) sEl.textContent = this.streak;

        if (window.ScoreStorage) {
            window.ScoreStorage.set("connectionsWins", this.wins);
            window.ScoreStorage.set("connectionsStreak", this.streak);
        }
    }

    pause() {}

    showStartScreen() {
        if (this.solvedEl) this.solvedEl.innerHTML = "";
        if (this.gridEl) {
            this.gridEl.innerHTML = '<div style="grid-column: span 4; text-align: center; color: #94a3b8; padding: 2rem 0; font-size: 1.05rem;">Click <b>Start Game</b> to play Connections!</div>';
        }
        if (this.submitBtn) this.submitBtn.classList.add("hidden");
    }

    startGame() {
        this.isPlaying = true;
        const startBtn = document.getElementById("startConnections");
        if (startBtn) startBtn.classList.add("hidden");
        if (this.submitBtn) this.submitBtn.classList.remove("hidden");
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
        this.solvedCategories = [];
        this.selectedWords.clear();
        this.previousGuesses.clear();
        this.hintWords.clear();
        this.mistakesLeft = 4;
        this.gameOver = false;

        this.remainingWords = [];
        this.currentPuzzle.categories.forEach(cat => {
            cat.words.forEach(w => this.remainingWords.push(w));
        });
        this.shuffleArray(this.remainingWords);

        if (this.puzzleNumEl) {
            this.puzzleNumEl.textContent = `Puzzle #${index + 1}`;
        }
        this.render();
        if (window.sounds) window.sounds.launch();
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    shuffleWords() {
        if (!this.isPlaying || this.gameOver) return;
        this.shuffleArray(this.remainingWords);
        this.renderGrid();
        if (window.sounds) window.sounds.move();
    }

    deselectAll() {
        if (!this.isPlaying || this.gameOver) return;
        this.selectedWords.clear();
        this.renderGrid();
        if (window.sounds) window.sounds.move();
    }

    toggleWord(word) {
        if (!this.isPlaying || this.gameOver) return;
        if (this.selectedWords.has(word)) {
            this.selectedWords.delete(word);
            if (window.sounds) window.sounds.move();
        } else {
            if (this.selectedWords.size >= 4) {
                if (window.showToast) window.showToast("Maximum 4 words selected!", "⚠️");
                return;
            }
            this.selectedWords.add(word);
            if (window.sounds) window.sounds.move();
        }
        this.renderGrid();
    }

    useHint() {
        if (!this.isPlaying || this.gameOver) {
            if (window.showToast) window.showToast("Start a game first!", "💡");
            return;
        }
        const unsolved = this.currentPuzzle.categories.filter(
            cat => !this.solvedCategories.some(s => s.title === cat.title)
        );
        if (unsolved.length === 0) return;

        const targetCat = unsolved[0];
        this.hintWords.clear();
        this.selectedWords.clear();
        this.hintWords.add(targetCat.words[0]);
        this.hintWords.add(targetCat.words[1]);
        this.selectedWords.add(targetCat.words[0]);
        this.selectedWords.add(targetCat.words[1]);

        this.renderGrid();
        if (window.showToast) {
            window.showToast(`Hint: "${targetCat.words[0]}" & "${targetCat.words[1]}" belong in the same group!`, "💡");
        }
        if (window.sounds) window.sounds.score();
    }

    submitGroup() {
        if (!this.isPlaying || this.gameOver || this.selectedWords.size !== 4) return;

        const chosen = Array.from(this.selectedWords).sort();
        const sig = chosen.join("|");
        if (this.previousGuesses.has(sig)) {
            if (window.showToast) window.showToast("Already guessed that exact combination!", "⚠️");
            return;
        }
        this.previousGuesses.add(sig);

        // Check if all 4 belong to one category
        let matchedCat = null;
        let maxOverlap = 0;

        this.currentPuzzle.categories.forEach(cat => {
            if (this.solvedCategories.some(s => s.title === cat.title)) return;
            const overlap = chosen.filter(w => cat.words.includes(w)).length;
            if (overlap > maxOverlap) maxOverlap = overlap;
            if (overlap === 4) matchedCat = cat;
        });

        if (matchedCat) {
            this.solvedCategories.push(matchedCat);
            this.remainingWords = this.remainingWords.filter(w => !matchedCat.words.includes(w));
            this.selectedWords.clear();
            this.hintWords.clear();
            this.render();

            if (this.solvedCategories.length === 4) {
                this.gameOver = true;
                this.wins++;
                this.streak++;
                this.saveStats();
                if (window.celebrateWin) {
                    setTimeout(() => {
                        window.celebrateWin({
                            title: "CONNECTIONS SOLVED!",
                            subtitle: `You grouped all 4 categories with ${this.mistakesLeft} mistakes remaining!`,
                            trophy: "🟨",
                            stats: [
                                { label: "Puzzle", val: `#${this.puzzleIndex + 1}` },
                                { label: "Mistakes Left", val: this.mistakesLeft },
                                { label: "Total Solved", val: this.wins },
                                { label: "Win Streak", val: this.streak }
                            ],
                            onRestart: () => this.nextPuzzle()
                        });
                    }, 350);
                }
            } else {
                if (window.sounds) window.sounds.score();
            }
        } else {
            this.mistakesLeft--;
            this.renderMistakes();
            if (window.sounds) window.sounds.lostLife();

            if (this.mistakesLeft <= 0) {
                this.gameOver = true;
                this.streak = 0;
                this.saveStats();
                // Reveal remaining categories
                this.currentPuzzle.categories.forEach(cat => {
                    if (!this.solvedCategories.some(s => s.title === cat.title)) {
                        this.solvedCategories.push(cat);
                    }
                });
                this.remainingWords = [];
                this.selectedWords.clear();
                this.render();

                if (window.showGameOverModal) {
                    setTimeout(() => {
                        window.showGameOverModal({
                            title: "OUT OF MISTAKES",
                            subtitle: "All 4 category connections have been revealed on the board.",
                            icon: "🧩",
                            stats: [
                                { label: "Puzzle", val: `#${this.puzzleIndex + 1}` },
                                { label: "Total Solved", val: this.wins }
                            ],
                            onRestart: () => this.nextPuzzle()
                        });
                    }, 500);
                }
            } else if (maxOverlap === 3) {
                if (window.showToast) window.showToast("One away...!", "🤏");
            } else {
                if (window.showToast) window.showToast("Not a matching group — try again!", "❌");
            }
        }
    }

    renderMistakes() {
        if (!this.mistakesEl) return;
        this.mistakesEl.textContent = "⚫".repeat(Math.max(0, this.mistakesLeft)) + "⚪".repeat(4 - Math.max(0, this.mistakesLeft));
    }

    renderSolved() {
        if (!this.solvedEl) return;
        this.solvedEl.innerHTML = this.solvedCategories.map(cat => `
            <div class="connections-category-banner tier-${cat.tier}">
                <span class="connections-cat-title">${cat.title}</span>
                <span class="connections-cat-words">${cat.words.join(", ")}</span>
            </div>
        `).join("");
    }

    renderGrid() {
        if (!this.gridEl) return;
        this.gridEl.innerHTML = "";
        this.remainingWords.forEach(word => {
            const tile = document.createElement("div");
            tile.className = "connections-tile";
            if (this.selectedWords.has(word)) tile.classList.add("selected");
            if (this.hintWords.has(word)) tile.classList.add("hint-glow");
            tile.textContent = word;
            tile.addEventListener("click", () => this.toggleWord(word));
            this.gridEl.appendChild(tile);
        });

        if (this.submitBtn) {
            this.submitBtn.disabled = this.selectedWords.size !== 4 || this.gameOver;
            this.submitBtn.textContent = `Submit (${this.selectedWords.size}/4)`;
        }
    }

    render() {
        this.renderMistakes();
        this.renderSolved();
        this.renderGrid();
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.connectionsGame = new ConnectionsGame();
});
