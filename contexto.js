// Momentum Arcade - Contexto (Semantic Word Similarity Ranking #1 to #10,000)
const CONTEXTO_PUZZLES = [
    {
        secret: "OCEAN",
        topWords: [
            "OCEAN", "SEA", "WATER", "WAVE", "MARINE", "PACIFIC", "ATLANTIC", "TIDE", "COAST", "BEACH",
            "CORAL", "WHALE", "SHARK", "ISLAND", "DEEP", "SAIL", "SHIP", "HARBOR", "CURRENT", "REEF",
            "DOLPHIN", "ANCHOR", "SUBMARINE", "NAVY", "SALT", "SURF", "SHORE", "BREEZE", "CRUISE", "PORT",
            "RIVER", "LAKE", "STREAM", "STORM", "BOAT", "FISH", "SHELL", "SAND", "DIVE", "TROPICAL"
        ]
    },
    {
        secret: "COFFEE",
        topWords: [
            "COFFEE", "ESPRESSO", "LATTE", "CAFFEINE", "MOCHA", "CAPPUCCINO", "ROAST", "BREW", "BEAN", "CAFE",
            "BARISTA", "MUG", "CUP", "MORNING", "CREAM", "SUGAR", "AROMA", "TEA", "DRINK", "FILTER",
            "GRIND", "CORTADO", "STEAM", "MILK", "BAKERY", "BREAKFAST", "COCOA", "WATER", "TOAST", "ENERGY"
        ]
    },
    {
        secret: "PLANET",
        topWords: [
            "PLANET", "EARTH", "MARS", "SATURN", "JUPITER", "VENUS", "ORBIT", "SOLAR", "SPACE", "GALAXY",
            "MOON", "STAR", "COSMOS", "UNIVERSE", "GRAVITY", "COMET", "ASTEROID", "NEBULA", "ROCKET", "TELESCOPE",
            "ASTRONAUT", "ECLIPSE", "METEOR", "WORLD", "SKY", "NIGHT", "SUN", "SCIENCE", "PHYSICS", "ALIEN"
        ]
    },
    {
        secret: "GUITAR",
        topWords: [
            "GUITAR", "MUSIC", "CHORD", "ACOUSTIC", "STRINGS", "BASS", "MELODY", "PIANO", "VIOLIN", "SONG",
            "CONCERT", "BAND", "STAGE", "RHYTHM", "TEMPO", "DRUM", "SINGER", "SOUND", "ALBUM", "ROCK",
            "JAZZ", "BLUES", "AMPLIFIER", "RADIO", "STUDIO", "CELLO", "HARP", "FLUTE", "VOICE", "ARTIST"
        ]
    },
    {
        secret: "FOREST",
        topWords: [
            "FOREST", "TREE", "WOODS", "JUNGLE", "NATURE", "PINE", "OAK", "LEAF", "CANOPY", "TRAIL",
            "MOUNTAIN", "VALLEY", "RIVER", "WILDLIFE", "DEER", "BEAR", "CAMP", "MOSS", "BRANCH", "ROOT",
            "GARDEN", "PARK", "MEADOW", "GREEN", "EARTH", "RAIN", "TIMBER", "CABIN", "HIKE", "FLOWER"
        ]
    },
    {
        secret: "CASTLE",
        topWords: [
            "CASTLE", "FORTRESS", "PALACE", "TOWER", "KING", "QUEEN", "KNIGHT", "THRONE", "CROWN", "ROYAL",
            "MOAT", "DRAGON", "EMPIRE", "SWORD", "SHIELD", "ARMOR", "HISTORY", "ANCIENT", "STONE", "GATE",
            "WALL", "GUARD", "PRINCE", "LEGEND", "MYTH", "TEMPLE", "MANOR", "COURT", "DYNASTY", "FEUDAL"
        ]
    },
    {
        secret: "WINTER",
        topWords: [
            "WINTER", "SNOW", "COLD", "FROST", "ICE", "FREEZE", "BLIZZARD", "GLACIER", "DECEMBER", "JANUARY",
            "SCARF", "COAT", "FIREPLACE", "SLEIGH", "SKI", "STORM", "ARCTIC", "CHILL", "WIND", "NORTH",
            "AUTUMN", "SPRING", "SUMMER", "SEASON", "CLOUD", "JACKET", "BOOTS", "CABIN", "COCOA", "HOLIDAY"
        ]
    },
    {
        secret: "CAMERA",
        topWords: [
            "CAMERA", "PHOTO", "LENS", "PICTURE", "IMAGE", "FILM", "VIDEO", "SHUTTER", "FOCUS", "PORTRAIT",
            "FLASH", "STUDIO", "CINEMA", "FRAME", "DIGITAL", "MEMORY", "GALLERY", "LIGHT", "SCREEN", "ART",
            "MIRROR", "COLOR", "SCENE", "MOVIE", "DIRECTOR", "ACTOR", "TRIPOD", "ZOOM", "PIXEL", "DESIGN"
        ]
    }
];

class ContextoGame {
    constructor() {
        this.puzzles = CONTEXTO_PUZZLES;
        this.puzzleIndex = 0;
        this.currentPuzzle = null;
        this.guesses = []; // [{ word, rank }]
        this.isPlaying = false;
        this.gameOver = false;
        this.wins = 0;

        this.inputEl = document.getElementById("contextoInput");
        this.submitBtn = document.getElementById("submitContexto");
        this.historyEl = document.getElementById("contextoHistory");
        this.guessCountEl = document.getElementById("contextoGuessCount");
        this.bestRankEl = document.getElementById("contextoBestRank");
        this.winsEl = document.getElementById("contextoWins");

        const startBtn = document.getElementById("startContexto");
        if (startBtn) startBtn.addEventListener("click", () => this.startGame());

        if (this.submitBtn) this.submitBtn.addEventListener("click", () => this.submitGuess());
        if (this.inputEl) {
            this.inputEl.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    this.submitGuess();
                }
            });
        }

        const hintBtn = document.getElementById("hintContexto");
        if (hintBtn) hintBtn.addEventListener("click", () => this.giveHint());

        const giveUpBtn = document.getElementById("giveUpContexto");
        if (giveUpBtn) giveUpBtn.addEventListener("click", () => this.revealSecret());

        const newBtn = document.getElementById("newContexto");
        if (newBtn) newBtn.addEventListener("click", () => this.nextPuzzle());

        this.loadStats();
        this.showStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame("contexto", this);
        }
    }

    loadStats() {
        if (window.ScoreStorage) {
            window.ScoreStorage.get("contextoWins", (w) => {
                this.wins = w || 0;
                if (this.winsEl) this.winsEl.textContent = this.wins;
            });
        }
    }

    saveStats() {
        if (this.winsEl) this.winsEl.textContent = this.wins;
        if (window.ScoreStorage) {
            window.ScoreStorage.set("contextoWins", this.wins);
        }
    }

    pause() {}

    showStartScreen() {
        if (this.historyEl) {
            this.historyEl.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 1.5rem 0; font-size: 1rem;">Click <b>Start Game</b> to play Contexto!</div>';
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
        this.guesses = [];
        this.gameOver = false;
        if (this.inputEl) {
            this.inputEl.value = "";
            this.inputEl.disabled = false;
            this.inputEl.focus();
        }
        this.render();
        if (window.sounds) window.sounds.launch();
    }

    // Compute deterministic semantic similarity rank (#1 to #10,000)
    computeRank(word) {
        const clean = word.toUpperCase().trim();
        const topIdx = this.currentPuzzle.topWords.indexOf(clean);
        if (topIdx === 0) return 1;
        if (topIdx > 0) {
            // Curated top words span ranks 2 to ~280
            return topIdx * 7 + 1;
        }

        // Check if word shares stems/bigrams with any top cluster words
        const secret = this.currentPuzzle.secret;
        let overlapScore = 0;
        for (const tw of this.currentPuzzle.topWords.slice(0, 15)) {
            for (let i = 0; i < clean.length - 1; i++) {
                const bg = clean.slice(i, i + 2);
                if (tw.includes(bg)) overlapScore += 18;
            }
            if (clean[0] === tw[0]) overlapScore += 10;
        }

        // Deterministic hash for consistent rank across the 10,000 word space
        let hash = 0;
        const combined = `${secret}:${clean}`;
        for (let i = 0; i < combined.length; i++) {
            hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
        }
        const baseRank = 310 + (Math.abs(hash) % 9200);
        return Math.max(290, Math.min(9999, baseRank - overlapScore * 12));
    }

    submitGuess(forcedWord = null) {
        if (!this.isPlaying || this.gameOver) {
            this.startGame();
            if (!forcedWord) return;
        }

        const raw = forcedWord || (this.inputEl ? this.inputEl.value : "");
        const word = raw.toUpperCase().trim().replace(/[^A-Z]/g, "");
        if (word.length < 2) {
            if (window.showToast) window.showToast("Please enter a valid English word!", "⚠️");
            return;
        }

        if (this.inputEl && !forcedWord) this.inputEl.value = "";

        const existing = this.guesses.find(g => g.word === word);
        if (existing) {
            if (window.showToast) window.showToast(`Already guessed "${word}" (Rank #${existing.rank})`, "ℹ️");
            return;
        }

        const rank = this.computeRank(word);
        this.guesses.push({ word, rank, isLatest: true });
        this.guesses.forEach(g => {
            if (g.word !== word) g.isLatest = false;
        });
        this.guesses.sort((a, b) => a.rank - b.rank);

        this.render();

        if (rank === 1) {
            this.gameOver = true;
            this.wins++;
            this.saveStats();
            if (window.celebrateWin) {
                setTimeout(() => {
                    window.celebrateWin({
                        title: "CONTEXTO #1 FOUND!",
                        subtitle: `You discovered the secret word "${word}" in ${this.guesses.length} ${this.guesses.length === 1 ? "guess" : "guesses"}!`,
                        trophy: "🎯",
                        stats: [
                            { label: "Secret Word", val: word },
                            { label: "Guesses", val: this.guesses.length },
                            { label: "Total Solved", val: this.wins }
                        ],
                        onRestart: () => this.nextPuzzle()
                    });
                }, 350);
            }
        } else {
            if (window.sounds) window.sounds.score();
        }
    }

    giveHint() {
        if (!this.isPlaying || this.gameOver) {
            if (window.showToast) window.showToast("Start a game first!", "💡");
            return;
        }
        const guessedSet = new Set(this.guesses.map(g => g.word));
        // Find an unguessed word in topWords (excluding index 0 secret unless all others are guessed)
        const candidates = this.currentPuzzle.topWords.slice(1).filter(w => !guessedSet.has(w));
        if (candidates.length === 0) {
            if (window.showToast) {
                window.showToast(`Final Hint: Starts with '${this.currentPuzzle.secret[0]}', ${this.currentPuzzle.secret.length} letters!`, "💡");
            }
            return;
        }
        // Pick a closer word than current best
        const pick = candidates[Math.min(candidates.length - 1, Math.max(0, Math.floor(candidates.length / 2) - 1))];
        this.submitGuess(pick);
        if (window.showToast) {
            window.showToast(`Hint revealed: "${pick}"`, "💡");
        }
    }

    revealSecret() {
        if (!this.isPlaying || this.gameOver) return;
        this.gameOver = true;
        const secret = this.currentPuzzle.secret;
        this.guesses.unshift({ word: secret, rank: 1, isLatest: true });
        this.render();
        if (window.showGameOverModal) {
            setTimeout(() => {
                window.showGameOverModal({
                    title: "SECRET WORD REVEALED",
                    subtitle: `The #1 secret word was "${secret}".`,
                    icon: "🎯",
                    stats: [
                        { label: "Secret Word", val: secret },
                        { label: "Guesses Made", val: this.guesses.length - 1 }
                    ],
                    onRestart: () => this.nextPuzzle()
                });
            }, 300);
        }
    }

    render() {
        if (this.guessCountEl) this.guessCountEl.textContent = this.guesses.length;
        if (this.bestRankEl) {
            this.bestRankEl.textContent = this.guesses.length > 0 ? `#${this.guesses[0].rank}` : "—";
        }

        if (!this.historyEl) return;
        if (this.guesses.length === 0) {
            this.historyEl.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 1.2rem 0; font-size: 0.88rem;">Type any word above to see how close it is to #1!</div>';
            return;
        }

        this.historyEl.innerHTML = this.guesses.map(g => {
            let colorClass = "rank-red";
            if (g.rank <= 300) colorClass = "rank-green";
            else if (g.rank <= 1500) colorClass = "rank-gold";

            const pct = g.rank === 1 ? 100 : Math.max(8, Math.round(100 - Math.log10(g.rank) * 23));
            const borderStyle = g.isLatest ? "border-color: #38bdf8; box-shadow: 0 0 10px rgba(56,189,248,0.35);" : "";

            return `
                <div class="contexto-row" style="${borderStyle}">
                    <div class="contexto-bar ${colorClass}" style="width: ${pct}%;"></div>
                    <span class="contexto-word">${g.word}</span>
                    <span class="contexto-rank">#${g.rank}</span>
                </div>
            `;
        }).join("");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.contextoGame = new ContextoGame();
});
