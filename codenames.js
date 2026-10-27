// Momentum Arcade - Codenames Duet (5x5 Tactical Word Association with AI Spymaster & 2-Player Single-Screen Spymaster Mode)
const CODENAMES_CLUE_CLUSTERS = [
    { clue: "SPACE", words: ["ORBIT", "COMET", "GALAXY", "ROCKET", "SATURN", "METEOR", "ASTRONAUT", "NEBULA"] },
    { clue: "OCEAN", words: ["ANCHOR", "CORAL", "WHALE", "SHARK", "HARBOR", "TRIDENT", "SUBMARINE", "KRAKEN"] },
    { clue: "ROYALTY", words: ["CROWN", "THRONE", "CASTLE", "PALACE", "KNIGHT", "SCEPTER", "DYNASTY", "EMPIRE"] },
    { clue: "SPYCRAFT", words: ["AGENT", "CIPHER", "SHADOW", "LASER", "PASSPORT", "EMBASSY", "SATELLITE", "GADGET"] },
    { clue: "MUSIC", words: ["PIANO", "VIOLIN", "TEMPO", "CHORD", "OPERA", "SYMPHONY", "GUITAR", "TRUMPET"] },
    { clue: "WINTER", words: ["GLACIER", "BLIZZARD", "IGLOO", "FROST", "ICICLE", "AVALANCHE", "TUNDRA", "SLED"] },
    { clue: "KITCHEN", words: ["SKILLET", "KETTLE", "SPATULA", "OVEN", "RECIPE", "PEPPER", "GARLIC", "BAKER"] },
    { clue: "AVIATION", words: ["PILOT", "RUNWAY", "HANGAR", "COCKPIT", "WING", "JET", "RADAR", "PARACHUTE"] },
    { clue: "MYTHOLOGY", words: ["OLYMPUS", "PHOENIX", "PEGASUS", "CENTAUR", "ZEUS", "TITAN", "ORACLE", "DRAGON"] },
    { clue: "COMPUTER", words: ["SERVER", "KERNEL", "BINARY", "PYTHON", "PIXEL", "FIREWALL", "ROUTER", "MATRIX"] },
    { clue: "MEDICINE", words: ["SURGEON", "VACCINE", "PULSE", "CLINIC", "SCALPEL", "BANDAGE", "REMEDY", "CAPSULE"] },
    { clue: "THEATER", words: ["CURTAIN", "STAGE", "SCRIPT", "ACTOR", "DRAMA", "SPOTLIGHT", "BALCONY", "ENCORE"] }
];

class CodenamesDuetGame {
    constructor() {
        this.cards = [];
        this.targetTotal = 9;
        this.agentsFound = 0;
        this.tokensLeft = 9;
        this.currentClue = null;
        this.guessesLeftInTurn = 0;
        this.usedClues = new Set();
        this.isPlaying = false;
        this.gameOver = false;
        this.wins = 0;
        this.mode = "ai"; // "ai" | "2p"
        this.keyMapVisible = false;

        this.gridEl = document.getElementById("codenamesGrid");
        this.foundEl = document.getElementById("codenamesFound");
        this.tokensEl = document.getElementById("codenamesTokens");
        this.winsEl = document.getElementById("codenamesWins");
        this.spymasterTagEl = document.getElementById("codenamesSpymasterTag");
        this.clueWordEl = document.getElementById("codenamesClueWord");
        this.clueCountEl = document.getElementById("codenamesClueCount");
        this.spymasterBarEl = document.getElementById("codenamesSpymasterBar");
        this.toggleKeyMapBtn = document.getElementById("toggleKeyMapBtn");
        this.spymasterClueInput = document.getElementById("spymasterClueInput");
        this.spymasterCountInput = document.getElementById("spymasterCountInput");
        this.setSpymasterClueBtn = document.getElementById("setSpymasterClueBtn");
        this.hintTextEl = document.getElementById("codenamesHintText");

        const modeAI = document.getElementById("codenamesModeAI");
        const mode2P = document.getElementById("codenamesMode2P");
        if (modeAI) modeAI.addEventListener("click", () => this.setMode("ai"));
        if (mode2P) mode2P.addEventListener("click", () => this.setMode("2p"));

        if (this.toggleKeyMapBtn) {
            this.toggleKeyMapBtn.addEventListener("click", () => this.toggleKeyMap());
        }
        if (this.setSpymasterClueBtn) {
            this.setSpymasterClueBtn.addEventListener("click", () => this.submitHumanSpymasterClue());
        }
        if (this.spymasterClueInput) {
            this.spymasterClueInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    this.submitHumanSpymasterClue();
                }
            });
        }

        const startBtn = document.getElementById("startCodenames");
        if (startBtn) startBtn.addEventListener("click", () => this.startGame());

        const nextClueBtn = document.getElementById("nextClueCodenames");
        if (nextClueBtn) nextClueBtn.addEventListener("click", () => this.endTurnAndNextClue());

        const newBtn = document.getElementById("newCodenames");
        if (newBtn) newBtn.addEventListener("click", () => this.newMission());

        this.loadStats();
        this.showStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame("codenames", this);
        }
    }

    setMode(mode) {
        if (this.mode === mode) return;
        this.mode = mode;
        this.keyMapVisible = false;

        const modeAI = document.getElementById("codenamesModeAI");
        const mode2P = document.getElementById("codenamesMode2P");
        if (modeAI) modeAI.classList.toggle("active", mode === "ai");
        if (mode2P) mode2P.classList.toggle("active", mode === "2p");

        if (this.spymasterBarEl) {
            this.spymasterBarEl.classList.toggle("hidden", mode !== "2p");
        }
        if (this.spymasterTagEl) {
            this.spymasterTagEl.textContent = mode === "2p" ? "🕵️ Spymaster Clue:" : "🕵️ AI Spymaster Clue:";
        }
        if (this.hintTextEl) {
            this.hintTextEl.textContent = mode === "2p"
                ? "2P Pass & Play: Spymaster clicks 'Show Key Map' (or snaps a photo), gives a 1-word clue, then hides the map for the Guesser!"
                : "Uncover all 9 Green Agents using the AI Spymaster's 1-word clue. Avoid the 3 Black Assassins!";
        }

        this.updateKeyMapButtonUI();
        if (this.isPlaying) {
            this.newMission();
        }
    }

    toggleKeyMap() {
        if (!this.isPlaying || this.gameOver) {
            this.startGame();
        }
        this.keyMapVisible = !this.keyMapVisible;
        this.updateKeyMapButtonUI();
        this.renderGrid();
        if (window.sounds) window.sounds.move();
        if (this.keyMapVisible && window.showToast) {
            window.showToast("KEY MAP VISIBLE! Guesser look away — Spymaster inspect or snap a photo, then Hide Map.", "👁️");
        }
    }

    updateKeyMapButtonUI() {
        if (!this.toggleKeyMapBtn) return;
        if (this.keyMapVisible) {
            this.toggleKeyMapBtn.textContent = "🙈 Hide Key Map (Pass to Guesser)";
            this.toggleKeyMapBtn.classList.add("key-open");
        } else {
            this.toggleKeyMapBtn.textContent = "👁️ Show Key Map (Spymaster Only)";
            this.toggleKeyMapBtn.classList.remove("key-open");
        }
    }

    submitHumanSpymasterClue() {
        if (!this.isPlaying || this.gameOver) {
            this.startGame();
        }
        const rawWord = (this.spymasterClueInput?.value || "").trim().toUpperCase();
        const count = parseInt(this.spymasterCountInput?.value || "2", 10) || 1;
        const clueWord = rawWord || "VERBAL CLUE";

        // Prevent using a word that is currently visible on the board
        const matchesBoardWord = this.cards.some(c => !c.revealed && c.word === clueWord);
        if (matchesBoardWord) {
            if (window.showToast) {
                window.showToast(`"${clueWord}" is on the board! Pick a different clue word.`, "⚠️");
            }
            return;
        }

        this.currentClue = { word: clueWord, count };
        this.guessesLeftInTurn = count + 1;
        this.keyMapVisible = false;
        this.updateKeyMapButtonUI();

        if (this.clueWordEl) this.clueWordEl.textContent = clueWord;
        if (this.clueCountEl) this.clueCountEl.textContent = `${count} ${count === 1 ? "word" : "words"}`;
        if (this.spymasterClueInput) this.spymasterClueInput.value = "";

        this.renderGrid();
        if (window.sounds) window.sounds.move();
        if (window.showToast) {
            window.showToast(`Key Map hidden! Guesser's turn: "${clueWord} (${count})"`, "🔒");
        }
    }

    loadStats() {
        if (window.ScoreStorage) {
            window.ScoreStorage.get("codenamesWins", (w) => {
                this.wins = w || 0;
                if (this.winsEl) this.winsEl.textContent = this.wins;
            });
        }
    }

    saveStats() {
        if (this.winsEl) this.winsEl.textContent = this.wins;
        if (window.ScoreStorage) {
            window.ScoreStorage.set("codenamesWins", this.wins);
        }
    }

    pause() {}

    showStartScreen() {
        if (this.gridEl) {
            this.gridEl.innerHTML = '<div style="grid-column: span 5; text-align: center; color: #94a3b8; padding: 2rem 0; font-size: 1.05rem;">Click <b>Start Mission</b> to launch Codenames Duet!</div>';
        }
        if (this.clueWordEl) this.clueWordEl.textContent = 'Click "Start Mission"';
        if (this.clueCountEl) this.clueCountEl.textContent = "";
    }

    startGame() {
        this.isPlaying = true;
        this.newMission();
    }

    newMission() {
        if (!this.isPlaying) {
            this.startGame();
            return;
        }

        this.agentsFound = 0;
        this.tokensLeft = 9;
        this.gameOver = false;
        this.keyMapVisible = false;
        this.usedClues.clear();
        this.updateKeyMapButtonUI();

        // Pick 3 distinct semantic clusters for the 9 Green Agents (3 words per cluster)
        const shuffledClusters = [...CODENAMES_CLUE_CLUSTERS].sort(() => Math.random() - 0.5);
        const agentClusters = shuffledClusters.slice(0, 3);
        const otherClusters = shuffledClusters.slice(3);

        const boardItems = [];
        const usedWords = new Set();

        agentClusters.forEach(cluster => {
            const words = [...cluster.words].sort(() => Math.random() - 0.5).slice(0, 3);
            words.forEach(w => {
                usedWords.add(w);
                boardItems.push({ word: w, role: "agent", clue: cluster.clue, revealed: false });
            });
        });

        // Fill remaining 16 cards (3 assassins + 13 bystanders) from other clusters
        const pool = [];
        otherClusters.forEach(c => {
            c.words.forEach(w => {
                if (!usedWords.has(w)) {
                    usedWords.add(w);
                    pool.push({ word: w, clue: c.clue });
                }
            });
        });
        pool.sort(() => Math.random() - 0.5);

        for (let i = 0; i < 3; i++) {
            boardItems.push({ word: pool[i].word, role: "assassin", clue: pool[i].clue, revealed: false });
        }
        for (let i = 3; i < 16; i++) {
            boardItems.push({ word: pool[i].word, role: "bystander", clue: pool[i].clue, revealed: false });
        }

        this.cards = boardItems.sort(() => Math.random() - 0.5);

        if (this.mode === "2p") {
            this.currentClue = { word: "SPYMASTER: PEEK KEY MAP", count: 0 };
            this.guessesLeftInTurn = 9;
            if (this.clueWordEl) this.clueWordEl.textContent = "Spymaster: Click 'Show Key Map' & Give Clue";
            if (this.clueCountEl) this.clueCountEl.textContent = "2P Mode";
        } else {
            this.generateNextSpymasterClue();
        }

        this.render();
        if (window.sounds) window.sounds.launch();
    }

    generateNextSpymasterClue() {
        const unrevealedAgents = this.cards.filter(c => c.role === "agent" && !c.revealed);
        if (unrevealedAgents.length === 0) return;

        if (this.mode === "2p") {
            if (this.clueWordEl) this.clueWordEl.textContent = "Waiting for Spymaster's Next Clue...";
            if (this.clueCountEl) this.clueCountEl.textContent = `${unrevealedAgents.length} left`;
            return;
        }

        // Group unrevealed agents by their semantic clue
        const countsByClue = {};
        unrevealedAgents.forEach(c => {
            countsByClue[c.clue] = (countsByClue[c.clue] || 0) + 1;
        });

        // Prefer a clue with the most unrevealed agents that hasn't been given yet
        const entries = Object.entries(countsByClue).sort((a, b) => {
            const aUnused = !this.usedClues.has(a[0]) ? 1 : 0;
            const bUnused = !this.usedClues.has(b[0]) ? 1 : 0;
            if (bUnused !== aUnused) return bUnused - aUnused;
            return b[1] - a[1];
        });

        const [bestClue, count] = entries[0];
        this.usedClues.add(bestClue);
        this.currentClue = { word: bestClue, count };
        this.guessesLeftInTurn = count + 1;

        if (this.clueWordEl) this.clueWordEl.textContent = bestClue;
        if (this.clueCountEl) this.clueCountEl.textContent = `${count} ${count === 1 ? "word" : "words"}`;
    }

    endTurnAndNextClue() {
        if (!this.isPlaying || this.gameOver) return;
        this.keyMapVisible = false;
        this.updateKeyMapButtonUI();

        this.tokensLeft--;
        if (this.tokensLeft <= 0) {
            this.triggerDefeat("Out of Timer Tokens!", "You ran out of turns before locating all 9 Green Agents.");
            return;
        }
        this.generateNextSpymasterClue();
        this.render();
        if (window.showToast) {
            const msg = this.mode === "2p"
                ? "Turn ended! Spymaster: Give your next clue."
                : `New AI Spymaster Clue: "${this.currentClue.word} (${this.currentClue.count})"`;
            window.showToast(msg, "🕵️");
        }
        if (window.sounds) window.sounds.move();
    }

    selectCard(index) {
        if (!this.isPlaying || this.gameOver) return;

        // Safety lock: if the Spymaster Key Map is currently visible, prevent accidental clicks
        if (this.keyMapVisible) {
            if (window.showToast) {
                window.showToast("Hide the Key Map first before the Guesser selects a card!", "🔒");
            }
            return;
        }

        const card = this.cards[index];
        if (!card || card.revealed) return;

        card.revealed = true;

        if (card.role === "agent") {
            this.agentsFound++;
            this.guessesLeftInTurn--;
            this.render();

            if (this.agentsFound >= this.targetTotal) {
                this.gameOver = true;
                this.wins++;
                this.saveStats();
                this.revealAllCards();
                if (window.celebrateWin) {
                    setTimeout(() => {
                        window.celebrateWin({
                            title: "MISSION ACCOMPLISHED!",
                            subtitle: `You contacted all 9 Green Agents with ${this.tokensLeft} turns remaining!`,
                            trophy: "🕵️",
                            stats: [
                                { label: "Mode", val: this.mode === "2p" ? "2P Co-op" : "AI Duet" },
                                { label: "Agents Found", val: "9 / 9" },
                                { label: "Turns Left", val: this.tokensLeft },
                                { label: "Missions Won", val: this.wins }
                            ],
                            onRestart: () => this.newMission()
                        });
                    }, 350);
                }
                return;
            }

            if (window.sounds) window.sounds.score();

            if (this.mode === "ai") {
                // If all agents for the current AI clue are found, automatically issue next clue
                const remainingForClue = this.cards.filter(
                    c => c.role === "agent" && !c.revealed && c.clue === this.currentClue?.word
                ).length;
                if (remainingForClue === 0 || this.guessesLeftInTurn <= 0) {
                    this.generateNextSpymasterClue();
                    if (window.showToast) {
                        window.showToast(`Clue complete! Next Clue: "${this.currentClue.word} (${this.currentClue.count})"`, "🕵️");
                    }
                }
            }
        } else if (card.role === "bystander") {
            this.tokensLeft--;
            if (window.sounds) window.sounds.lostLife();
            if (this.tokensLeft <= 0) {
                this.render();
                this.triggerDefeat("OUT OF TURNS!", "You contacted a bystander on your final timer token.");
                return;
            }
            this.generateNextSpymasterClue();
            this.render();
            if (window.showToast) {
                const msg = this.mode === "2p"
                    ? "Bystander contacted! Turn ended — Spymaster give next clue."
                    : `Bystander! Turn ended. New Clue: "${this.currentClue.word} (${this.currentClue.count})"`;
                window.showToast(msg, "⚪");
            }
        } else if (card.role === "assassin") {
            this.render();
            this.triggerDefeat("ASSASSIN CONTACTED!", `"${card.word}" was an Assassin! Mission terminated.`);
        }
    }

    revealAllCards() {
        this.keyMapVisible = false;
        this.updateKeyMapButtonUI();
        this.cards.forEach(c => { c.revealed = true; });
        this.renderGrid();
    }

    triggerDefeat(title, subtitle) {
        this.gameOver = true;
        this.revealAllCards();
        if (window.showGameOverModal) {
            setTimeout(() => {
                window.showGameOverModal({
                    title,
                    subtitle,
                    icon: "💀",
                    stats: [
                        { label: "Agents Found", val: `${this.agentsFound} / 9` },
                        { label: "Missions Won", val: this.wins }
                    ],
                    onRestart: () => this.newMission()
                });
            }, 400);
        }
    }

    renderStats() {
        if (this.foundEl) this.foundEl.textContent = `${this.agentsFound} / ${this.targetTotal}`;
        if (this.tokensEl) this.tokensEl.textContent = `${this.tokensLeft} ⏱️`;
    }

    renderGrid() {
        if (!this.gridEl) return;
        this.gridEl.innerHTML = "";
        this.cards.forEach((card, idx) => {
            const el = document.createElement("div");
            el.className = "codenames-card";
            if (card.revealed) {
                el.classList.add("revealed", card.role);
                const icon = card.role === "agent" ? "🟢 " : (card.role === "assassin" ? "💀 " : "");
                el.textContent = `${icon}${card.word}`;
            } else if (this.keyMapVisible) {
                el.classList.add(`key-peek-${card.role}`);
                const peekIcon = card.role === "agent" ? "🟢 " : (card.role === "assassin" ? "💀 " : "⚪ ");
                el.textContent = `${peekIcon}${card.word}`;
            } else {
                el.textContent = card.word;
            }
            el.addEventListener("click", () => this.selectCard(idx));
            this.gridEl.appendChild(el);
        });
    }

    render() {
        this.renderStats();
        this.renderGrid();
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.codenamesGame = new CodenamesDuetGame();
});
