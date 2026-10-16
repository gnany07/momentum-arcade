// Sound Effects Controller (Native Web Audio API)
class SoundController {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.loadPreference();
    }

    async loadPreference() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['soundEnabled'], (result) => {
                    if (result.soundEnabled !== undefined) {
                        this.enabled = result.soundEnabled;
                        this.updateIcon();
                    }
                });
            } else {
                const stored = localStorage.getItem('soundEnabled');
                if (stored !== null) {
                    this.enabled = stored === 'true';
                    this.updateIcon();
                }
            }
        } catch (e) {
            console.warn('Storage not available for sound preference', e);
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ soundEnabled: this.enabled });
            } else {
                localStorage.setItem('soundEnabled', this.enabled.toString());
            }
        } catch (e) {}
        this.updateIcon();
        if (this.enabled) {
            this.playTone(520, 'sine', 0.1, 0.1);
        }
    }

    updateIcon() {
        const icon = document.getElementById('soundIcon');
        if (icon) {
            icon.textContent = this.enabled ? '🔊' : '🔇';
        }
        const topBtn = document.getElementById('soundToggleBtn');
        if (topBtn) {
            topBtn.classList.toggle('muted', !this.enabled);
            topBtn.title = this.enabled ? 'Game Sound: ON (Press M to mute)' : 'Game Sound: OFF (Press M to unmute)';
            topBtn.setAttribute('aria-label', this.enabled ? 'Mute Game Sound' : 'Unmute Game Sound');
        }

        const arcadeIcon = document.getElementById('arcadeSoundIcon');
        if (arcadeIcon) {
            arcadeIcon.textContent = this.enabled ? '🔊' : '🔇';
        }
        const arcadeText = document.getElementById('arcadeSoundText');
        if (arcadeText) {
            arcadeText.textContent = this.enabled ? 'Sound: ON' : 'Sound: OFF';
        }
        const arcadeBtn = document.getElementById('arcadeSoundToggleBtn');
        if (arcadeBtn) {
            arcadeBtn.classList.toggle('muted', !this.enabled);
            arcadeBtn.title = this.enabled ? 'Disable Game Sound (Press M)' : 'Enable Game Sound (Press M)';
            arcadeBtn.setAttribute('aria-label', this.enabled ? 'Disable Game Sound' : 'Enable Game Sound');
        }
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    }

    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.1) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn('Audio play error:', e);
        }
    }

    paddleHit() { this.playTone(320, 'triangle', 0.08, 0.12); }
    brickHit(combo = 1) { 
        const baseFreq = 440;
        const freq = Math.min(900, baseFreq * Math.pow(1.06, combo));
        this.playTone(freq, 'square', 0.09, 0.1);
    }
    launch() { this.playTone(520, 'sine', 0.12, 0.1); }
    lostLife() { this.playTone(180, 'sawtooth', 0.25, 0.15); }
    score() { this.playTone(660, 'triangle', 0.1, 0.1); }
    move() { this.playTone(280, 'sine', 0.04, 0.05); }
    win() {
        [523, 659, 784, 1046].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.2, 0.12), i * 110);
        });
    }
    gameOver() {
        [300, 240, 180].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sawtooth', 0.22, 0.15), i * 140);
        });
    }
}

window.sounds = new SoundController();

// Global Arcade App Manager
class ArcadeApp {
    constructor() {
        this.activeGame = 'snake';
        this.isArcadeOpen = false;
        this.games = {};
    }

    init() {
        this.setupClock();
        this.setupQuotes();
        this.setupBackground();
        this.setupSoundToggle();
        this.setupArcadeToggles();
        this.setupTabs();
        this.loadStoredTab();
    }

    setupClock() {
        const update = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            
            const timeEl = document.getElementById('time');
            if (timeEl) timeEl.textContent = timeString;

            const compactTimeEl = document.getElementById('compactClock');
            if (compactTimeEl) compactTimeEl.textContent = timeString;

            // Date display
            const dateEl = document.getElementById('date');
            if (dateEl) {
                const options = { weekday: 'long', month: 'long', day: 'numeric' };
                dateEl.textContent = now.toLocaleDateString(undefined, options);
            }

            // Greeting
            const greetingEl = document.getElementById('greeting');
            if (greetingEl) {
                let greeting = 'Good evening!';
                if (hours < 12) greeting = 'Good morning!';
                else if (hours < 18) greeting = 'Good afternoon!';
                greetingEl.textContent = greeting;
            }
        };

        update();
        setInterval(update, 1000);
    }

    setupQuotes() {
        const updateQuote = () => {
            if (typeof quotes !== 'undefined' && quotes.length > 0) {
                const randomIndex = Math.floor(Math.random() * quotes.length);
                const quoteEl = document.getElementById('quote');
                if (quoteEl) {
                    quoteEl.textContent = `"${quotes[randomIndex]}"`;
                }
            }
        };

        updateQuote();

        const quoteRefreshBtn = document.getElementById('newQuoteBtn');
        if (quoteRefreshBtn) {
            quoteRefreshBtn.addEventListener('click', updateQuote);
        }
    }

    setupBackground() {
        const setBg = () => {
            const timestamp = new Date().getTime();
            const imageUrl = `https://bingw.jasonzeng.dev/?index=random&t=${timestamp}`;
            const img = new Image();
            img.onload = () => {
                document.body.style.backgroundImage = `url(${imageUrl})`;
            };
            img.src = imageUrl;
        };

        setBg();

        const refreshBgBtn = document.getElementById('refreshBgBtn');
        if (refreshBgBtn) {
            refreshBgBtn.addEventListener('click', () => {
                setBg();
                window.sounds.playTone(480, 'sine', 0.08, 0.08);
            });
        }
    }

    setupSoundToggle() {
        const btn = document.getElementById('soundToggleBtn');
        if (btn) {
            btn.addEventListener('click', () => window.sounds.toggle());
        }

        const arcadeBtn = document.getElementById('arcadeSoundToggleBtn');
        if (arcadeBtn) {
            arcadeBtn.addEventListener('click', () => window.sounds.toggle());
        }

        // Global hotkey: press 'M' to mute/unmute game sounds (unless typing or playing Wordle)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'm' || e.key === 'M') {
                if (e.ctrlKey || e.metaKey || e.altKey) return;
                const tag = (e.target && e.target.tagName) || '';
                if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
                if (this.isGameActive('wordle')) {
                    const wGame = this.games['wordle'];
                    if (wGame && wGame.isPlaying && !wGame.gameOver) {
                        return; // Let Wordle type the letter 'M'
                    }
                }
                e.preventDefault();
                window.sounds.toggle();
            }
        });

        window.sounds.updateIcon();
    }

    setupArcadeToggles() {
        const openBtn = document.getElementById('openArcadeBtn');
        const closeBtn = document.getElementById('closeArcadeBtn');
        const zenSection = document.getElementById('zenSection');
        const arcadeHub = document.getElementById('arcadeHub');

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                this.openArcade();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeArcade();
            });
        }
    }

    openArcade() {
        this.isArcadeOpen = true;
        const zenSection = document.getElementById('zenSection');
        const arcadeHub = document.getElementById('arcadeHub');
        
        if (zenSection) zenSection.classList.add('hidden');
        if (arcadeHub) arcadeHub.classList.remove('hidden');

        window.sounds.playTone(587, 'triangle', 0.1, 0.1);
        this.switchTab(this.activeGame);
    }

    closeArcade() {
        this.isArcadeOpen = false;
        const zenSection = document.getElementById('zenSection');
        const arcadeHub = document.getElementById('arcadeHub');
        
        if (arcadeHub) arcadeHub.classList.add('hidden');
        if (zenSection) zenSection.classList.remove('hidden');

        // Pause currently active game when closing arcade
        if (this.games[this.activeGame] && typeof this.games[this.activeGame].pause === 'function') {
            this.games[this.activeGame].pause();
        }
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.game-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const gameName = tab.getAttribute('data-game');
                this.switchTab(gameName);
            });
        });
    }

    switchTab(gameName) {
        // Pause previous game
        if (this.games[this.activeGame] && typeof this.games[this.activeGame].pause === 'function') {
            this.games[this.activeGame].pause();
        }

        this.activeGame = gameName;

        // Update active tab buttons
        document.querySelectorAll('.game-tab').forEach(tab => {
            if (tab.getAttribute('data-game') === gameName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Hide all cabinets, show chosen one
        document.querySelectorAll('.game-cabinet').forEach(cab => {
            if (cab.id === `game-${gameName}`) {
                cab.classList.remove('hidden');
            } else {
                cab.classList.add('hidden');
            }
        });

        // Store preference
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ lastGame: gameName });
            } else {
                localStorage.setItem('lastGame', gameName);
            }
        } catch (e) {}

        window.sounds.playTone(440, 'sine', 0.06, 0.06);
    }

    loadStoredTab() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['lastGame'], (res) => {
                    if (res.lastGame) {
                        this.activeGame = res.lastGame;
                    }
                });
            } else {
                const stored = localStorage.getItem('lastGame');
                if (stored) this.activeGame = stored;
            }
        } catch (e) {}
    }

    registerGame(name, instance) {
        this.games[name] = instance;
    }

    isGameActive(name) {
        return this.isArcadeOpen && this.activeGame === name;
    }
}

window.arcadeApp = new ArcadeApp();

// Timer Class with Pause and Resume
class Timer {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.seconds = 0;
        this.timer = null;
    }

    start() {
        if (this.timer) return;
        this.timer = setInterval(() => {
            this.seconds++;
            this.updateDisplay();
        }, 1000);
        this.updateDisplay();
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    reset() {
        this.stop();
        this.seconds = 0;
        this.updateDisplay();
    }

    updateDisplay() {
        if (!this.element) return;
        const minutes = Math.floor(this.seconds / 60);
        const remainingSeconds = this.seconds % 60;
        this.element.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Global Timers for Games
const snakeTimer = new Timer('snakeTimer');
const sudokuTimer = new Timer('sudokuTimer');
const wordleTimer = new Timer('wordleTimer');
const tetrisTimer = new Timer('tetrisTimer');
const blockbreakerTimer = new Timer('blockbreakerTimer');

// High Score Storage Helper
window.ScoreStorage = {
    get: function(key, callback) {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([key], (res) => callback(res[key] || 0));
            } else {
                callback(parseInt(localStorage.getItem(key) || '0', 10));
            }
        } catch (e) {
            callback(0);
        }
    },
    set: function(key, val) {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ [key]: val });
            } else {
                localStorage.setItem(key, val.toString());
            }
        } catch (e) {}
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.arcadeApp.init();
});