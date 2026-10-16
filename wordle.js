class Wordle {
    constructor() {
        this.wordList = [
            'APPLE', 'BEACH', 'CHAIR', 'DREAM', 'EARTH', 'FLAME', 'GHOST', 'HEART',
            'IGLOO', 'JUICE', 'KNIFE', 'LIGHT', 'MUSIC', 'NIGHT', 'OCEAN', 'PEACH',
            'QUEEN', 'RIVER', 'SNAKE', 'TIGER', 'UMBRA', 'VOICE', 'WATER', 'XENON',
            'YACHT', 'ZEBRA', 'ALBUM', 'BRAIN', 'CLOUD', 'DANCE', 'EAGLE', 'FROST',
            'GRAPE', 'HORSE', 'ISLAND', 'JOKER', 'KARMA', 'LEMON', 'MAGIC', 'NOVEL',
            'POWER', 'SHINE', 'STORM', 'TRAIN', 'VIVID', 'WORLD', 'YOUTH', 'SOLAR'
        ];
        
        this.currentWord = '';
        this.guesses = [];
        this.currentGuess = '';
        this.maxGuesses = 6;
        this.gameOver = false;
        this.isPlaying = false;
        this.played = 0;
        this.streak = 0;
        
        this.board = document.getElementById('wordleBoard');
        this.keyboard = document.getElementById('wordleKeyboard');
        
        const startBtn = document.getElementById('startWordle');
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());

        const newBtn = document.getElementById('newWordle');
        if (newBtn) newBtn.addEventListener('click', () => this.newGame());
        
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        this.loadStats();
        this.showStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame('wordle', this);
        }
    }

    loadStats() {
        if (window.ScoreStorage) {
            window.ScoreStorage.get('wordlePlayed', (p) => {
                this.played = p || 0;
                const el = document.getElementById('wordlePlayed');
                if (el) el.textContent = this.played;
            });
            window.ScoreStorage.get('wordleStreak', (s) => {
                this.streak = s || 0;
                const el = document.getElementById('wordleStreak');
                if (el) el.textContent = this.streak;
            });
        }
    }

    showStartScreen() {
        if (this.board) {
            this.board.innerHTML = '<div style="grid-column: span 5; text-align: center; color: #94a3b8; padding: 2rem 0; font-size: 1.1rem;">Click "Start Game" to play Wordle!</div>';
        }
        if (this.keyboard) {
            this.keyboard.style.display = 'none';
        }
    }

    startGame() {
        this.isPlaying = true;
        if (this.keyboard) this.keyboard.style.display = 'flex';
        this.initializeBoard();
        this.initializeKeyboard();
        this.newGame();
    }

    pause() {
        if (this.isPlaying && !this.gameOver) {
            wordleTimer.stop();
        }
    }

    initializeBoard() {
        this.board.innerHTML = '';
        for (let i = 0; i < this.maxGuesses; i++) {
            const row = document.createElement('div');
            row.className = 'wordle-row';
            for (let j = 0; j < 5; j++) {
                const cell = document.createElement('div');
                cell.className = 'wordle-cell';
                row.appendChild(cell);
            }
            this.board.appendChild(row);
        }
    }

    initializeKeyboard() {
        // Includes Enter (↵) and Backspace (⌫) on the 3rd row
        const keyboardLayout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['↵', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
        ];

        this.keyboard.innerHTML = '';
        keyboardLayout.forEach(row => {
            const keyboardRow = document.createElement('div');
            keyboardRow.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyElement = document.createElement('div');
                keyElement.className = 'key';
                keyElement.textContent = key;
                
                if (key === '↵') {
                    keyElement.classList.add('enter-key');
                } else if (key === '⌫') {
                    keyElement.classList.add('backspace-key');
                }
                
                keyElement.addEventListener('click', () => this.handleKeyClick(key));
                keyboardRow.appendChild(keyElement);
            });
            
            this.keyboard.appendChild(keyboardRow);
        });
    }

    newGame() {
        if (!this.isPlaying) return;
        
        this.currentWord = this.wordList[Math.floor(Math.random() * this.wordList.length)];
        this.guesses = [];
        this.currentGuess = '';
        this.gameOver = false;
        
        wordleTimer.reset();
        wordleTimer.start();
        
        const cells = document.querySelectorAll('.wordle-cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'wordle-cell';
        });
        
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            key.className = 'key';
            if (key.textContent === '↵') key.classList.add('enter-key');
            if (key.textContent === '⌫') key.classList.add('backspace-key');
        });

        if (window.sounds) window.sounds.launch();
    }

    handleKeyPress(event) {
        if (!this.isPlaying || this.gameOver) return;
        if (window.arcadeApp && !window.arcadeApp.isGameActive('wordle')) return;
        
        if (event.key === 'Enter') {
            event.preventDefault();
            this.submitGuess();
        } else if (event.key === 'Backspace') {
            event.preventDefault();
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.updateBoard();
            if (window.sounds) window.sounds.move();
        } else if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
            if (this.currentGuess.length < 5) {
                this.currentGuess += event.key.toUpperCase();
                this.updateBoard();
                if (window.sounds) window.sounds.move();
            }
        }
    }

    handleKeyClick(key) {
        if (!this.isPlaying || this.gameOver) return;
        
        if (key === '↵' || key === 'ENTER') {
            this.submitGuess();
        } else if (key === '⌫' || key === 'BACKSPACE') {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.updateBoard();
            if (window.sounds) window.sounds.move();
        } else if (this.currentGuess.length < 5) {
            this.currentGuess += key;
            this.updateBoard();
            if (window.sounds) window.sounds.move();
        }
    }

    updateBoard() {
        const currentRow = this.guesses.length;
        const cells = document.querySelectorAll(`.wordle-row:nth-child(${currentRow + 1}) .wordle-cell`);
        
        cells.forEach((cell, index) => {
            cell.textContent = this.currentGuess[index] || '';
            cell.className = 'wordle-cell';
        });
    }

    submitGuess() {
        if (this.currentGuess.length !== 5) return;
        
        const guess = this.currentGuess;
        this.guesses.push(guess);
        
        const currentRow = this.guesses.length - 1;
        const cells = document.querySelectorAll(`.wordle-row:nth-child(${currentRow + 1}) .wordle-cell`);
        
        const letterCounts = {};
        for (let i = 0; i < this.currentWord.length; i++) {
            const letter = this.currentWord[i];
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        }
        
        // Exact matches
        for (let i = 0; i < 5; i++) {
            if (guess[i] === this.currentWord[i]) {
                cells[i].classList.add('correct');
                letterCounts[guess[i]]--;
            }
        }
        
        // Partial matches
        for (let i = 0; i < 5; i++) {
            if (guess[i] !== this.currentWord[i]) {
                if (this.currentWord.includes(guess[i]) && letterCounts[guess[i]] > 0) {
                    cells[i].classList.add('present');
                    letterCounts[guess[i]]--;
                } else {
                    cells[i].classList.add('absent');
                }
            }
        }
        
        // Update keyboard colors
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            const letter = key.textContent;
            if (letter === '↵' || letter === '⌫') return;
            
            if (guess.includes(letter)) {
                if (this.currentWord.includes(letter)) {
                    if (this.currentWord.indexOf(letter) === guess.indexOf(letter)) {
                        key.classList.add('correct');
                    } else if (!key.classList.contains('correct')) {
                        key.classList.add('present');
                    }
                } else {
                    key.classList.add('absent');
                }
            }
        });
        
        if (guess === this.currentWord) {
            this.gameOver = true;
            wordleTimer.stop();
            this.played++;
            this.streak++;
            this.saveStats();
            if (window.sounds) window.sounds.win();
            const timeStr = document.getElementById('wordleTimer') ? document.getElementById('wordleTimer').textContent : '00:00';
            setTimeout(() => alert(`Splendid! You guessed the word in ${this.guesses.length} tries! Time: ${timeStr}`), 400);
        } else if (this.guesses.length === this.maxGuesses) {
            this.gameOver = true;
            wordleTimer.stop();
            this.played++;
            this.streak = 0;
            this.saveStats();
            if (window.sounds) window.sounds.gameOver();
            setTimeout(() => alert(`Game Over! The word was ${this.currentWord}.`), 400);
        } else {
            if (window.sounds) window.sounds.score();
        }
        
        this.currentGuess = '';
    }

    saveStats() {
        const pEl = document.getElementById('wordlePlayed');
        if (pEl) pEl.textContent = this.played;
        const sEl = document.getElementById('wordleStreak');
        if (sEl) sEl.textContent = this.streak;
        
        if (window.ScoreStorage) {
            window.ScoreStorage.set('wordlePlayed', this.played);
            window.ScoreStorage.set('wordleStreak', this.streak);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.wordleGame = new Wordle();
});
