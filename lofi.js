// Lo-Fi & Ambient Audio Player (Procedural Web Audio Engine)
class LofiPlayer {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.volume = 0.45;
        this.mode = 'lofi'; // 'lofi', 'rain', 'vinyl', 'focus'
        this.masterGain = null;
        this.currentNodes = [];
        this.loopTimers = [];
        this.chordIndex = 0;
        this.step = 0;
        this.hasUserInteracted = false;

        this.chords = [
            [50, 57, 60, 64, 67], // Dm9
            [45, 52, 57, 60, 64], // Am7
            [41, 53, 57, 60, 64], // Fmaj7
            [48, 55, 59, 62, 67], // Cmaj9
            [40, 52, 55, 59, 62], // Em7
            [43, 55, 59, 62, 65]  // G7sus
        ];

        this.initDOM();
        this.loadSettings();
    }

    initAudio() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);
            }
        }
    }

    initDOM() {
        const toggleBtn = document.getElementById('lofiToggleBtn');
        const playBtn = document.getElementById('lofiPlayBtn');
        const popover = document.getElementById('lofiPopover');
        const volumeSlider = document.getElementById('lofiVolume');
        const modeButtons = document.querySelectorAll('.lofi-mode-btn');

        if (toggleBtn && popover) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                popover.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!popover.contains(e.target) && e.target !== toggleBtn) {
                    popover.classList.remove('active');
                }
            });
        }

        const quickPlayBtn = document.getElementById('lofiPlayQuickBtn');
        if (quickPlayBtn) {
            quickPlayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlay();
            });
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.togglePlay();
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(parseFloat(e.target.value));
            });
        }

        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const selectedMode = btn.getAttribute('data-mode');
                this.switchMode(selectedMode);
            });
        });

        // Autoplay on first user interaction if enabled
        const enableOnGesture = () => {
            if (!this.hasUserInteracted) {
                this.hasUserInteracted = true;
                if (this.autoplayPref && !this.isPlaying) {
                    this.play();
                }
            }
            window.removeEventListener('click', enableOnGesture);
            window.removeEventListener('keydown', enableOnGesture);
        };
        window.addEventListener('click', enableOnGesture);
        window.addEventListener('keydown', enableOnGesture);
    }

    loadSettings() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['lofiVolume', 'lofiMode', 'lofiAutoplay'], (res) => {
                    if (res.lofiVolume !== undefined) this.setVolume(res.lofiVolume);
                    if (res.lofiMode) this.switchMode(res.lofiMode, false);
                    this.autoplayPref = res.lofiAutoplay || false;
                });
            } else {
                const vol = localStorage.getItem('lofiVolume');
                if (vol !== null) this.setVolume(parseFloat(vol));
                const m = localStorage.getItem('lofiMode');
                if (m) this.switchMode(m, false);
                this.autoplayPref = localStorage.getItem('lofiAutoplay') === 'true';
            }
        } catch (e) {}
    }

    saveSettings() {
        try {
            const data = {
                lofiVolume: this.volume,
                lofiMode: this.mode,
                lofiAutoplay: this.autoplayPref || false
            };
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set(data);
            } else {
                localStorage.setItem('lofiVolume', this.volume.toString());
                localStorage.setItem('lofiMode', this.mode);
                localStorage.setItem('lofiAutoplay', (this.autoplayPref || false).toString());
            }
        } catch (e) {}
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
        const slider = document.getElementById('lofiVolume');
        if (slider) slider.value = this.volume;
        this.saveSettings();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.initAudio();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.isPlaying = true;
        this.updateUI(true);
        this.startEngine();
    }

    pause() {
        this.isPlaying = false;
        this.updateUI(false);
        this.stopEngine();
    }

    switchMode(newMode, restart = true) {
        this.mode = newMode;
        document.querySelectorAll('.lofi-mode-btn').forEach(btn => {
            if (btn.getAttribute('data-mode') === newMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const statusEl = document.getElementById('lofiStatusText');
        if (statusEl) {
            const labels = {
                'lofi': 'Chill Lo-Fi Chords & Beats',
                'rain': 'Cozy Midnight Rain',
                'vinyl': 'Warm Vinyl Atmosphere',
                'focus': '432Hz Ambient Focus'
            };
            statusEl.textContent = labels[newMode] || 'Lo-Fi Radio';
        }

        this.saveSettings();
        if (this.isPlaying && restart) {
            this.stopEngine();
            this.startEngine();
        }
    }

    updateUI(playing) {
        const playBtn = document.getElementById('lofiPlayBtn');
        const eqAnim = document.getElementById('lofiEqAnim');
        const toggleBtn = document.getElementById('lofiToggleBtn');

        if (playBtn) {
            playBtn.innerHTML = playing ? '❚❚' : '▶';
            playBtn.title = playing ? 'Pause Music' : 'Play Music';
        }

        if (eqAnim) {
            if (playing) eqAnim.classList.add('active');
            else eqAnim.classList.remove('active');
        }

        if (toggleBtn) {
            if (playing) toggleBtn.classList.add('playing');
            else toggleBtn.classList.remove('playing');
        }

        const quickPlayBtn = document.getElementById('lofiPlayQuickBtn');
        const quickIcon = document.getElementById('lofiQuickIcon');
        if (quickIcon) {
            quickIcon.textContent = playing ? '⏸' : '▶';
        }
        if (quickPlayBtn) {
            quickPlayBtn.classList.toggle('playing', playing);
            quickPlayBtn.title = playing ? 'Pause Lo-Fi Music' : 'Play Lo-Fi Music';
        }
    }

    stopEngine() {
        this.loopTimers.forEach(t => clearInterval(t));
        this.loopTimers = [];
        this.currentNodes.forEach(node => {
            try {
                if (typeof node.stop === 'function') node.stop();
                if (typeof node.disconnect === 'function') node.disconnect();
            } catch (e) {}
        });
        this.currentNodes = [];
    }

    startEngine() {
        this.stopEngine();

        if (this.mode === 'lofi') {
            this.startVinylNoise(0.04);
            this.playLofiChord();
            const chordTimer = setInterval(() => this.playLofiChord(), 4000);
            this.loopTimers.push(chordTimer);

            const beatTimer = setInterval(() => this.playLofiBeat(), 500);
            this.loopTimers.push(beatTimer);
        } else if (this.mode === 'rain') {
            this.startRainAudio();
        } else if (this.mode === 'vinyl') {
            this.startVinylNoise(0.2);
        } else if (this.mode === 'focus') {
            this.startDroneAudio();
        }
    }

    midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    playLofiChord() {
        if (!this.ctx || !this.isPlaying) return;

        const chord = this.chords[this.chordIndex];
        this.chordIndex = (this.chordIndex + 1) % this.chords.length;

        const duration = 3.8;
        const now = this.ctx.currentTime;

        chord.forEach((midi, i) => {
            const freq = this.midiToFreq(midi);

            // Dual detuned oscillators for warm rhodes/analog tone
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const noteGain = this.ctx.createGain();

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(freq, now);

            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(freq * 1.002, now); // subtle chorus detune

            // Mellow low-pass filter
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450 + (i * 80), now);
            filter.Q.setValueAtTime(2, now);

            // Tape warble (LFO)
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.setValueAtTime(0.3, now); // slow tape drift
            lfoGain.gain.setValueAtTime(1.5, now);
            lfo.connect(osc1.frequency);
            lfo.connect(osc2.frequency);
            lfo.start(now);
            lfo.stop(now + duration);

            // Envelope
            const noteVolume = 0.055 / chord.length;
            noteGain.gain.setValueAtTime(0.0001, now);
            noteGain.gain.exponentialRampToValueAtTime(noteVolume, now + 0.15 + (i * 0.04));
            noteGain.gain.exponentialRampToValueAtTime(noteVolume * 0.4, now + 1.2);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(noteGain);
            noteGain.connect(this.masterGain);

            osc1.start(now + (i * 0.03));
            osc2.start(now + (i * 0.03));
            osc1.stop(now + duration);
            osc2.stop(now + duration);
        });
    }

    playLofiBeat() {
        if (!this.ctx || !this.isPlaying) return;
        const now = this.ctx.currentTime;
        this.step = (this.step + 1) % 8;

        // Kick on beat 0 and 4.5
        if (this.step === 0 || this.step === 5) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(110, now);
            osc.frequency.exponentialRampToValueAtTime(38, now + 0.18);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.22);
        }

        // Rimshot / Snare brush on beat 2 and 6
        if (this.step === 2 || this.step === 6) {
            const bufferSize = this.ctx.sampleRate * 0.08;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.Q.setValueAtTime(3, now);
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            noise.start(now);
        }
    }

    startVinylNoise(level = 0.05) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            // Subtle crackles and analog floor
            const crackle = Math.random() > 0.998 ? (Math.random() * 2 - 1) * 0.6 : 0;
            data[i] = ((Math.random() * 2 - 1) * 0.03) + crackle;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(level, this.ctx.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start(0);
        this.currentNodes.push(source, gain);
    }

    startRainAudio() {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Pink noise approximation for gentle rainfall
            lastOut = (lastOut + (0.02 * white)) / 1.02;
            data[i] = lastOut * 3.5;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start(0);
        this.currentNodes.push(source, gain);
    }

    startDroneAudio() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const baseFreq = 108; // 432 / 4 = 108Hz harmonic base

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const osc3 = this.ctx.createOscillator();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, now);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(baseFreq + 4, now); // 4Hz binaural theta wave

        osc3.type = 'triangle';
        osc3.frequency.setValueAtTime(baseFreq * 2, now); // Octave overtone

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);

        osc1.connect(filter);
        osc2.connect(filter);
        osc3.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(0);
        osc2.start(0);
        osc3.start(0);

        this.currentNodes.push(osc1, osc2, osc3, gain);
    }
}

// Global Lofi Instance
window.lofiPlayer = new LofiPlayer();
