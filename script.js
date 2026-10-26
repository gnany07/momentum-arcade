// Sound Effects Controller (Native Web Audio API)
class SoundController {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.enabled = true;
        this.userToggled = false;
        this.activeTimeouts = [];
        this.loadPreference();
    }

    async loadPreference() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['soundEnabled'], (result) => {
                    if (!this.userToggled && result.soundEnabled !== undefined) {
                        this.enabled = result.soundEnabled === true;
                        this.applyGainState();
                        this.updateIcon();
                    }
                });
            } else {
                const stored = localStorage.getItem('soundEnabled');
                if (!this.userToggled && stored !== null) {
                    this.enabled = stored === 'true';
                    this.applyGainState();
                    this.updateIcon();
                }
            }
        } catch (e) {
            console.warn('Storage not available for sound preference', e);
        }
    }

    applyGainState() {
        if (this.masterGain && this.ctx) {
            try {
                this.masterGain.gain.setValueAtTime(this.enabled ? 1 : 0, this.ctx.currentTime);
            } catch (e) {}
        }
        if (this.ctx) {
            try {
                if (!this.enabled && this.ctx.state === 'running') {
                    this.ctx.suspend();
                } else if (this.enabled && this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            } catch (e) {}
        }
    }

    toggle() {
        this.userToggled = true;
        this.enabled = !this.enabled;

        // Clear any pending melody timeouts (win/gameover sounds)
        this.activeTimeouts.forEach(t => clearTimeout(t));
        this.activeTimeouts = [];

        this.applyGainState();

        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ soundEnabled: this.enabled });
            } else {
                localStorage.setItem('soundEnabled', this.enabled.toString());
            }
        } catch (e) {}

        this.updateIcon();

        // If muting and Lo-Fi music is playing, pause it so all audio completely stops
        if (!this.enabled) {
            if (window.lofiPlayer && window.lofiPlayer.isPlaying) {
                window.lofiPlayer.pause();
            }
        } else {
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

        // Also update all in-cabinet game sound buttons
        document.querySelectorAll('.cabinet-sound-btn').forEach(btn => {
            btn.classList.toggle('muted', !this.enabled);
            const bIcon = btn.querySelector('.cabinet-sound-icon');
            if (bIcon) bIcon.textContent = this.enabled ? '🔊' : '🔇';
            const bText = btn.querySelector('.cabinet-sound-text');
            if (bText) bText.textContent = this.enabled ? 'Sound: ON' : 'Sound: OFF';
            btn.title = this.enabled ? 'Disable Sound (Press M)' : 'Enable Sound (Press M)';
        });
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(this.enabled ? 1 : 0, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);
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
            gain.connect(this.masterGain || this.ctx.destination);
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
        if (!this.enabled) return;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
        notes.forEach((f, i) => {
            const t = setTimeout(() => {
                if (this.enabled) this.playTone(f, 'triangle', 0.22, 0.14);
            }, i * 95);
            this.activeTimeouts.push(t);
        });
        const chordTimeout = setTimeout(() => {
            if (this.enabled) {
                this.playTone(523.25, 'triangle', 0.45, 0.09);
                this.playTone(783.99, 'triangle', 0.45, 0.09);
                this.playTone(1046.50, 'triangle', 0.45, 0.11);
                this.playTone(1567.98, 'sine', 0.5, 0.08);
            }
        }, notes.length * 95 + 60);
        this.activeTimeouts.push(chordTimeout);
    }
    gameOver() {
        if (!this.enabled) return;
        [300, 240, 180].forEach((f, i) => {
            const t = setTimeout(() => {
                if (this.enabled) this.playTone(f, 'sawtooth', 0.22, 0.15);
            }, i * 140);
            this.activeTimeouts.push(t);
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
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.sounds.toggle();
            });
        }

        const arcadeBtn = document.getElementById('arcadeSoundToggleBtn');
        if (arcadeBtn) {
            arcadeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.sounds.toggle();
            });
        }

        // Wire any cabinet sound toggle buttons
        document.querySelectorAll('.cabinet-sound-btn').forEach(cBtn => {
            cBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.sounds.toggle();
            });
        });

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
const nerdleTimer = new Timer('nerdleTimer');
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

// ==========================================================================
// Universal Victory Celebration & Confetti Engine
// ==========================================================================
class ConfettiEngine {
    constructor(canvasId = 'confettiCanvas') {
        this.canvasId = canvasId;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationFrame = null;
        this.colors = ['#f59e0b', '#ec4899', '#38bdf8', '#10b981', '#a855f7', '#fbbf24', '#f43f5e'];
    }

    init() {
        if (!this.canvas) {
            this.canvas = document.getElementById(this.canvasId);
            if (this.canvas) {
                this.ctx = this.canvas.getContext('2d');
                window.addEventListener('resize', () => this.resize());
            }
        }
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    burst(count = 95) {
        this.init();
        if (!this.canvas || !this.ctx) return;
        this.resize();
        this.particles = [];
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2 - 40;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 6 + Math.random() * 14;
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 4,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                size: 6 + Math.random() * 8,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 12,
                opacity: 1,
                gravity: 0.28,
                drag: 0.982,
                decay: 0.007 + Math.random() * 0.008,
                shape: Math.random() > 0.4 ? 'rect' : 'circle'
            });
        }

        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        this.render();
    }

    render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.rotation += p.rotationSpeed;
            p.opacity -= p.decay;

            if (p.opacity <= 0 || p.y > this.canvas.height + 20) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = Math.max(0, p.opacity);
            this.ctx.fillStyle = p.color;

            if (p.shape === 'rect') {
                this.ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        }

        if (this.particles.length > 0) {
            this.animationFrame = requestAnimationFrame(() => this.render());
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    clear() {
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.particles = [];
    }
}

window.confetti = new ConfettiEngine();

// Universal Floating Toast Notification (Replaces alert())
window.showToast = function(text, icon = 'ℹ️', duration = 3000) {
    const toast = document.getElementById('gameToast');
    const toastIcon = document.getElementById('gameToastIcon');
    const toastText = document.getElementById('gameToastText');
    if (!toast || !toastText) return;

    if (toastIcon) toastIcon.textContent = icon;
    toastText.textContent = text;
    toast.classList.remove('hidden');

    if (window._toastTimeout) clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
};

// Universal Win Celebration Modal
window.celebrateWin = function({ title = 'VICTORY!', subtitle = 'You beat the challenge!', trophy = '🏆', stats = [], onRestart = null }) {
    if (window.sounds) window.sounds.win();
    window.confetti.burst(110);

    const overlay = document.getElementById('winCelebrationOverlay');
    const trophyEl = document.getElementById('winTrophy');
    const titleEl = document.getElementById('winTitle');
    const subtitleEl = document.getElementById('winSubtitle');
    const statsContainer = document.getElementById('winStats');
    const playAgainBtn = document.getElementById('winPlayAgainBtn');
    const closeBtn = document.getElementById('winCloseBtn');

    if (trophyEl) trophyEl.textContent = trophy;
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;

    if (statsContainer) {
        statsContainer.innerHTML = '';
        stats.forEach(s => {
            const pill = document.createElement('div');
            pill.className = 'stat-pill';
            pill.innerHTML = `<span class="stat-pill-label">${s.label}</span><span class="stat-pill-val">${s.val}</span>`;
            statsContainer.appendChild(pill);
        });
    }

    const closeOverlay = () => {
        if (overlay) overlay.classList.add('hidden');
        window.confetti.clear();
    };

    if (playAgainBtn) {
        playAgainBtn.innerHTML = '<span>🎮 Play Again</span>';
        playAgainBtn.onclick = () => {
            closeOverlay();
            if (typeof onRestart === 'function') onRestart();
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            closeOverlay();
        };
    }

    if (overlay) overlay.classList.remove('hidden');
};

// Universal Game Over Modal for non-canvas games (Wordle, 2048, Minesweeper)
window.showGameOverModal = function({ title = 'GAME OVER', subtitle = 'Better luck next time!', icon = '💀', stats = [], onRestart = null }) {
    if (window.sounds) window.sounds.gameOver();

    const overlay = document.getElementById('winCelebrationOverlay');
    const trophyEl = document.getElementById('winTrophy');
    const titleEl = document.getElementById('winTitle');
    const subtitleEl = document.getElementById('winSubtitle');
    const statsContainer = document.getElementById('winStats');
    const playAgainBtn = document.getElementById('winPlayAgainBtn');
    const closeBtn = document.getElementById('winCloseBtn');

    if (trophyEl) trophyEl.textContent = icon;
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;

    if (statsContainer) {
        statsContainer.innerHTML = '';
        stats.forEach(s => {
            const pill = document.createElement('div');
            pill.className = 'stat-pill';
            pill.innerHTML = `<span class="stat-pill-label">${s.label}</span><span class="stat-pill-val">${s.val}</span>`;
            statsContainer.appendChild(pill);
        });
    }

    const closeOverlay = () => {
        if (overlay) overlay.classList.add('hidden');
    };

    if (playAgainBtn) {
        playAgainBtn.innerHTML = '<span>🔄 Try Again</span>';
        playAgainBtn.onclick = () => {
            closeOverlay();
            if (typeof onRestart === 'function') onRestart();
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            closeOverlay();
        };
    }

    if (overlay) overlay.classList.remove('hidden');
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.confetti.init();
    window.arcadeApp.init();
});