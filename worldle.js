// Momentum Arcade - Worldle (Guess the Country from its SVG Silhouette, Distance & Compass Bearing)
const WORLDLE_COUNTRIES = [
    { name: "UNITED KINGDOM", lat: 55.3781, lon: -3.4360, continent: "Europe", capital: "London", svg: "M48,12 L56,16 L54,28 L64,42 L68,58 L74,72 L58,82 L36,86 L38,72 L46,64 L42,50 L46,34 Z M26,46 L38,44 L36,58 L24,56 Z" },
    { name: "ITALY", lat: 41.8719, lon: 12.5674, continent: "Europe", capital: "Rome", svg: "M24,14 L46,12 L56,22 L48,34 L62,54 L78,72 L72,82 L64,76 L58,88 L46,84 L52,68 L36,44 L22,26 Z M30,78 L42,76 L38,88 L28,86 Z" },
    { name: "JAPAN", lat: 36.2048, lon: 138.2529, continent: "Asia", capital: "Tokyo", svg: "M66,12 L82,18 L76,30 L64,26 Z M62,34 L72,42 L66,62 L52,74 L36,78 L32,68 L48,58 L56,42 Z M26,78 L36,82 L30,92 L22,86 Z" },
    { name: "FRANCE", lat: 46.2276, lon: 2.2137, continent: "Europe", capital: "Paris", svg: "M46,14 L68,22 L82,36 L74,62 L78,78 L54,84 L28,78 L32,52 L18,36 L36,26 Z" },
    { name: "AUSTRALIA", lat: -25.2744, lon: 133.7751, continent: "Oceania", capital: "Canberra", svg: "M28,28 L52,22 L66,18 L84,36 L86,58 L72,74 L54,72 L36,66 L16,68 L14,46 Z M68,80 L76,80 L72,90 Z" },
    { name: "BRAZIL", lat: -14.2350, lon: -51.9253, continent: "South America", capital: "Brasilia", svg: "M34,16 L64,20 L86,38 L78,62 L58,88 L44,86 L46,66 L26,52 L16,34 Z" },
    { name: "INDIA", lat: 20.5937, lon: 78.9629, continent: "Asia", capital: "New Delhi", svg: "M38,10 L54,14 L58,28 L78,34 L68,48 L56,64 L48,90 L38,68 L22,46 L32,30 Z" },
    { name: "UNITED STATES", lat: 37.0902, lon: -95.7129, continent: "North America", capital: "Washington, D.C.", svg: "M14,26 L54,26 L76,22 L88,32 L78,58 L74,74 L66,64 L48,66 L36,76 L26,62 L12,54 Z" },
    { name: "CANADA", lat: 56.1304, lon: -106.3468, continent: "North America", capital: "Ottawa", svg: "M16,24 L48,14 L78,22 L88,48 L74,68 L52,62 L18,64 L12,44 Z" },
    { name: "GERMANY", lat: 51.1657, lon: 10.4515, continent: "Europe", capital: "Berlin", svg: "M38,14 L64,18 L72,38 L64,56 L70,78 L42,84 L28,68 L26,36 Z" },
    { name: "SPAIN", lat: 40.4637, lon: -3.7492, continent: "Europe", capital: "Madrid", svg: "M18,22 L78,24 L86,44 L68,78 L32,82 L26,62 L30,38 L16,36 Z" },
    { name: "EGYPT", lat: 26.8206, lon: 30.8025, continent: "Africa", capital: "Cairo", svg: "M20,22 L68,22 L82,34 L74,50 L68,38 L66,82 L22,82 Z" },
    { name: "MEXICO", lat: 23.6345, lon: -102.5528, continent: "North America", capital: "Mexico City", svg: "M16,18 L48,22 L58,48 L74,68 L86,62 L82,78 L58,82 L36,58 L24,38 L18,48 Z" },
    { name: "ARGENTINA", lat: -38.4161, lon: -63.6167, continent: "South America", capital: "Buenos Aires", svg: "M42,12 L64,16 L68,36 L56,58 L48,88 L36,92 L38,54 L34,28 Z" },
    { name: "SOUTH AFRICA", lat: -30.5595, lon: 22.9375, continent: "Africa", capital: "Pretoria", svg: "M24,32 L54,22 L78,34 L82,58 L58,82 L24,80 L16,56 Z" },
    { name: "NORWAY", lat: 60.4720, lon: 8.4689, continent: "Europe", capital: "Oslo", svg: "M64,10 L82,14 L66,34 L48,62 L44,86 L26,82 L32,56 L52,28 Z" },
    { name: "GREECE", lat: 39.0742, lon: 21.8243, continent: "Europe", capital: "Athens", svg: "M28,18 L68,18 L64,32 L48,38 L58,58 L46,78 L32,68 L24,42 Z M52,86 L74,86 L72,92 L50,92 Z" },
    { name: "NEW ZEALAND", lat: -40.9006, lon: 174.8860, continent: "Oceania", capital: "Wellington", svg: "M62,14 L74,26 L68,48 L56,46 Z M48,54 L60,60 L38,88 L26,80 Z" }
];

// Additional countries for rich autocomplete & geodesic calculation
const EXTRA_WORLD_COUNTRIES = [
    { name: "SWEDEN", lat: 60.1282, lon: 18.6435 },
    { name: "FINLAND", lat: 61.9241, lon: 25.7482 },
    { name: "POLAND", lat: 51.9194, lon: 19.1451 },
    { name: "SWITZERLAND", lat: 46.8182, lon: 8.2275 },
    { name: "NETHERLANDS", lat: 52.1326, lon: 5.2913 },
    { name: "BELGIUM", lat: 50.5039, lon: 4.4699 },
    { name: "PORTUGAL", lat: 39.3999, lon: -8.2245 },
    { name: "IRELAND", lat: 53.1424, lon: -7.6921 },
    { name: "ICELAND", lat: 64.9631, lon: -19.0208 },
    { name: "TURKEY", lat: 38.9637, lon: 35.2433 },
    { name: "CHINA", lat: 35.8617, lon: 104.1954 },
    { name: "SOUTH KOREA", lat: 35.9078, lon: 127.7669 },
    { name: "THAILAND", lat: 15.8700, lon: 100.9925 },
    { name: "VIETNAM", lat: 14.0583, lon: 108.2772 },
    { name: "INDONESIA", lat: -0.7893, lon: 113.9213 },
    { name: "SINGAPORE", lat: 1.3521, lon: 103.8198 },
    { name: "SAUDI ARABIA", lat: 23.8859, lon: 45.0792 },
    { name: "UNITED ARAB EMIRATES", lat: 23.4241, lon: 53.8478 },
    { name: "KENYA", lat: -0.0236, lon: 37.9062 },
    { name: "NIGERIA", lat: 9.0820, lon: 8.6753 },
    { name: "MOROCCO", lat: 31.7917, lon: -7.0926 },
    { name: "CHILE", lat: -35.6751, lon: -71.5430 },
    { name: "COLOMBIA", lat: 4.5709, lon: -74.2973 },
    { name: "PERU", lat: -9.1900, lon: -75.0152 }
];

class WorldleGame {
    constructor() {
        this.targetCountries = WORLDLE_COUNTRIES;
        this.allCountries = [...WORLDLE_COUNTRIES, ...EXTRA_WORLD_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
        this.countryIndex = 0;
        this.target = null;
        this.guesses = [];
        this.maxGuesses = 6;
        this.isPlaying = false;
        this.gameOver = false;
        this.wins = 0;
        this.streak = 0;

        this.mapEl = document.getElementById("worldleMapContainer");
        this.inputEl = document.getElementById("worldleInput");
        this.suggestionsEl = document.getElementById("worldleSuggestions");
        this.guessesEl = document.getElementById("worldleGuesses");
        this.guessCountEl = document.getElementById("worldleGuessCount");
        this.winsEl = document.getElementById("worldleWins");
        this.streakEl = document.getElementById("worldleStreak");

        const startBtn = document.getElementById("startWorldle");
        if (startBtn) startBtn.addEventListener("click", () => this.startGame());

        const submitBtn = document.getElementById("submitWorldle");
        if (submitBtn) submitBtn.addEventListener("click", () => this.submitGuess());

        const hintBtn = document.getElementById("hintWorldle");
        if (hintBtn) hintBtn.addEventListener("click", () => this.revealClue());

        const newBtn = document.getElementById("newWorldle");
        if (newBtn) newBtn.addEventListener("click", () => this.nextCountry());

        if (this.inputEl) {
            this.inputEl.addEventListener("input", () => this.updateSuggestions());
            this.inputEl.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    this.submitGuess();
                }
            });
        }

        this.loadStats();
        this.showStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame("worldle", this);
        }
    }

    loadStats() {
        if (window.ScoreStorage) {
            window.ScoreStorage.get("worldleWins", (w) => {
                this.wins = w || 0;
                if (this.winsEl) this.winsEl.textContent = this.wins;
            });
            window.ScoreStorage.get("worldleStreak", (s) => {
                this.streak = s || 0;
                if (this.streakEl) this.streakEl.textContent = this.streak;
            });
        }
    }

    saveStats() {
        if (this.winsEl) this.winsEl.textContent = this.wins;
        if (this.streakEl) this.streakEl.textContent = this.streak;
        if (window.ScoreStorage) {
            window.ScoreStorage.set("worldleWins", this.wins);
            window.ScoreStorage.set("worldleStreak", this.streak);
        }
    }

    pause() {}

    showStartScreen() {
        if (this.mapEl) {
            this.mapEl.innerHTML = '<div style="text-align: center; color: #94a3b8; font-size: 0.9rem;">Click <b>Start Game</b> to view country silhouette</div>';
        }
    }

    startGame() {
        this.isPlaying = true;
        this.loadCountry(this.countryIndex);
    }

    nextCountry() {
        if (!this.isPlaying) {
            this.startGame();
            return;
        }
        this.countryIndex = (this.countryIndex + 1) % this.targetCountries.length;
        this.loadCountry(this.countryIndex);
    }

    loadCountry(index) {
        this.target = this.targetCountries[index];
        this.guesses = [];
        this.gameOver = false;
        if (this.inputEl) {
            this.inputEl.value = "";
            this.inputEl.focus();
        }
        if (this.suggestionsEl) this.suggestionsEl.classList.add("hidden");
        this.render();
        if (window.sounds) window.sounds.launch();
    }

    updateSuggestions() {
        if (!this.inputEl || !this.suggestionsEl) return;
        const val = this.inputEl.value.toUpperCase().trim();
        if (!val) {
            this.suggestionsEl.classList.add("hidden");
            return;
        }

        const matches = this.allCountries.filter(c => c.name.includes(val)).slice(0, 6);
        if (matches.length === 0) {
            this.suggestionsEl.classList.add("hidden");
            return;
        }

        this.suggestionsEl.innerHTML = matches.map(c => `
            <div class="worldle-suggestion-item" data-country="${c.name}">${c.name}</div>
        `).join("");
        this.suggestionsEl.classList.remove("hidden");

        this.suggestionsEl.querySelectorAll(".worldle-suggestion-item").forEach(el => {
            el.addEventListener("click", () => {
                this.inputEl.value = el.getAttribute("data-country");
                this.suggestionsEl.classList.add("hidden");
                this.submitGuess();
            });
        });
    }

    // Haversine distance in km + Compass bearing
    calculateGeoMetrics(from, to) {
        const toRad = d => (d * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(to.lat - from.lat);
        const dLon = toRad(to.lon - from.lon);
        const lat1 = toRad(from.lat);
        const lat2 = toRad(to.lat);

        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
        const distKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

        if (distKm < 25) {
            return { distKm: 0, arrow: "🎉", proximity: 100 };
        }

        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

        const arrows = ["⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️"];
        const arrow = arrows[Math.round(brng / 45) % 8];
        const proximity = Math.max(0, Math.min(99, Math.round((1 - distKm / 20000) * 100)));

        return { distKm, arrow, proximity };
    }

    revealClue() {
        if (!this.isPlaying || this.gameOver || !this.target) {
            if (window.showToast) window.showToast("Start a game first!", "💡");
            return;
        }
        if (window.showToast) {
            window.showToast(`Clue: Continent is ${this.target.continent} • Capital is ${this.target.capital}`, "🌍");
        }
        if (window.sounds) window.sounds.score();
    }

    submitGuess() {
        if (!this.isPlaying || this.gameOver) {
            this.startGame();
            return;
        }
        if (!this.inputEl) return;

        const typed = this.inputEl.value.toUpperCase().trim();
        let country = this.allCountries.find(c => c.name === typed);
        if (!country) {
            country = this.allCountries.find(c => c.name.startsWith(typed) && typed.length >= 3);
        }
        if (!country) {
            if (window.showToast) window.showToast("Select a valid country from the list!", "🌍");
            return;
        }

        if (this.guesses.some(g => g.name === country.name)) {
            if (window.showToast) window.showToast(`Already guessed ${country.name}!`, "⚠️");
            return;
        }

        this.inputEl.value = "";
        if (this.suggestionsEl) this.suggestionsEl.classList.add("hidden");

        const metrics = this.calculateGeoMetrics(country, this.target);
        this.guesses.push({ name: country.name, ...metrics });
        this.render();

        if (country.name === this.target.name) {
            this.gameOver = true;
            this.wins++;
            this.streak++;
            this.saveStats();
            if (window.celebrateWin) {
                setTimeout(() => {
                    window.celebrateWin({
                        title: "WORLDLE CONQUERED!",
                        subtitle: `You identified ${this.target.name} (${this.target.capital}) in ${this.guesses.length} ${this.guesses.length === 1 ? "guess" : "guesses"}!`,
                        trophy: "🌍",
                        stats: [
                            { label: "Country", val: this.target.name },
                            { label: "Capital", val: this.target.capital },
                            { label: "Guesses", val: `${this.guesses.length}/6` },
                            { label: "Streak", val: this.streak }
                        ],
                        onRestart: () => this.nextCountry()
                    });
                }, 350);
            }
        } else if (this.guesses.length >= this.maxGuesses) {
            this.gameOver = true;
            this.streak = 0;
            this.saveStats();
            if (window.showGameOverModal) {
                setTimeout(() => {
                    window.showGameOverModal({
                        title: "COUNTRY MISSED",
                        subtitle: `The mystery country was ${this.target.name} (Capital: ${this.target.capital}).`,
                        icon: "🌍",
                        stats: [
                            { label: "Country", val: this.target.name },
                            { label: "Continent", val: this.target.continent }
                        ],
                        onRestart: () => this.nextCountry()
                    });
                }, 350);
            }
        } else {
            if (window.sounds) window.sounds.score();
        }
    }

    render() {
        if (!this.target) return;

        if (this.guessCountEl) {
            this.guessCountEl.textContent = `${this.guesses.length} / ${this.maxGuesses}`;
        }

        if (this.mapEl) {
            this.mapEl.innerHTML = `
                <svg class="worldle-svg" viewBox="0 0 100 100">
                    <path d="${this.target.svg}" fill="#38bdf8" stroke="#bae6fd" stroke-width="2" stroke-linejoin="round" />
                </svg>
            `;
        }

        if (this.guessesEl) {
            this.guessesEl.innerHTML = this.guesses.map(g => `
                <div class="worldle-guess-row">
                    <span>${g.name}</span>
                    <span style="font-family: monospace; color: #cbd5e1;">${g.distKm.toLocaleString()} km</span>
                    <span style="text-align: center; font-size: 1.05rem;">${g.arrow}</span>
                    <span class="worldle-prox-badge">${g.proximity}%</span>
                </div>
            `).join("");
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.worldleGame = new WorldleGame();
});
