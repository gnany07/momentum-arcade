class Minesweeper {
    constructor() {
        this.container = document.getElementById('minesweeperGrid');
        this.rows = 9;
        this.cols = 9;
        this.mines = 10;
        this.board = [];
        this.revealedCount = 0;
        this.gameOver = false;
        this.won = false;
        this.flagMode = false;
        this.isPlaying = false;
        this.timer = 0;
        this.timerInterval = null;

        this.setupDOM();
        this.resetGame();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame('minesweeper', this);
        }
    }

    setupDOM() {
        const resetBtn = document.getElementById('mineResetBtn');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetGame());

        const flagToggle = document.getElementById('mineFlagToggle');
        if (flagToggle) {
            flagToggle.addEventListener('click', () => {
                this.flagMode = !this.flagMode;
                flagToggle.classList.toggle('active', this.flagMode);
            });
        }

        document.querySelectorAll('.mine-diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mine-diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const diff = btn.getAttribute('data-diff');
                if (diff === 'easy') {
                    this.rows = 9; this.cols = 9; this.mines = 10;
                } else {
                    this.rows = 12; this.cols = 12; this.mines = 22;
                }
                this.resetGame();
            });
        });
    }

    resetGame() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timer = 0;
        this.updateTimerDisplay();
        this.gameOver = false;
        this.won = false;
        this.isPlaying = true;
        this.revealedCount = 0;

        const face = document.getElementById('mineResetBtn');
        if (face) face.textContent = '😊';

        const countEl = document.getElementById('mineRemaining');
        if (countEl) countEl.textContent = this.mines;

        this.initBoard();
        this.render();
    }

    pause() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    updateTimerDisplay() {
        const el = document.getElementById('mineTimer');
        if (el) el.textContent = `${Math.floor(this.timer / 60).toString().padStart(2, '0')}:${(this.timer % 60).toString().padStart(2, '0')}`;
    }

    initBoard() {
        this.board = [];
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push({
                    r, c,
                    mine: false,
                    revealed: false,
                    flagged: false,
                    count: 0
                });
            }
            this.board.push(row);
        }

        // Place mines
        let placed = 0;
        while (placed < this.mines) {
            const rr = Math.floor(Math.random() * this.rows);
            const cc = Math.floor(Math.random() * this.cols);
            if (!this.board[rr][cc].mine) {
                this.board[rr][cc].mine = true;
                placed++;
            }
        }

        // Calculate neighbour counts
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c].mine) continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                            if (this.board[nr][nc].mine) count++;
                        }
                    }
                }
                this.board[r][c].count = count;
            }
        }
    }

    handleClick(r, c) {
        if (this.gameOver || this.won) return;
        if (this.revealedCount === 0) this.startTimer();

        const cell = this.board[r][c];
        if (this.flagMode) {
            this.handleRightClick(r, c);
            return;
        }

        if (cell.flagged || cell.revealed) return;

        if (cell.mine) {
            // Hit mine! Game over
            cell.revealed = true;
            this.gameOver = true;
            if (this.timerInterval) clearInterval(this.timerInterval);
            const face = document.getElementById('mineResetBtn');
            if (face) face.textContent = '😵';
            if (window.sounds) window.sounds.lostLife();
            this.revealAllMines();
            this.render();
            if (window.showGameOverModal) {
                setTimeout(() => {
                    const timeStr = document.getElementById('mineTimer')?.textContent || '00:00';
                    window.showGameOverModal({
                        title: 'DETONATION!',
                        subtitle: 'You stepped on a hidden naval mine!',
                        icon: '💥',
                        stats: [
                            { label: 'Revealed', val: `${this.revealedCount}/${(this.rows * this.cols) - this.mines}` },
                            { label: 'Time Survived', val: timeStr }
                        ],
                        onRestart: () => this.resetGame()
                    });
                }, 350);
            }
            return;
        }

        this.reveal(r, c);
        if (window.sounds) window.sounds.move();
        this.checkWin();
        this.render();
    }

    handleRightClick(r, c) {
        if (this.gameOver || this.won) return;
        const cell = this.board[r][c];
        if (cell.revealed) return;

        cell.flagged = !cell.flagged;
        if (window.sounds) window.sounds.score();

        // Update remaining mines counter
        let flaggedCount = 0;
        this.board.forEach(row => row.forEach(cell => { if (cell.flagged) flaggedCount++; }));
        const countEl = document.getElementById('mineRemaining');
        if (countEl) countEl.textContent = Math.max(0, this.mines - flaggedCount);

        this.render();
    }

    reveal(r, c) {
        const cell = this.board[r][c];
        if (cell.revealed || cell.flagged) return;

        cell.revealed = true;
        this.revealedCount++;

        if (cell.count === 0 && !cell.mine) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                        this.reveal(nr, nc);
                    }
                }
            }
        }
    }

    revealAllMines() {
        this.board.forEach(row => {
            row.forEach(cell => {
                if (cell.mine) cell.revealed = true;
            });
        });
    }

    checkWin() {
        const totalNonMines = (this.rows * this.cols) - this.mines;
        if (this.revealedCount === totalNonMines) {
            this.won = true;
            if (this.timerInterval) clearInterval(this.timerInterval);
            const face = document.getElementById('mineResetBtn');
            if (face) face.textContent = '😎';
            const timeStr = document.getElementById('mineTimer') ? document.getElementById('mineTimer').textContent : '00:00';
            if (window.celebrateWin) {
                setTimeout(() => {
                    window.celebrateWin({
                        title: 'MINEFIELD CLEARED!',
                        subtitle: 'Incredible detection! All hidden mines safely defused!',
                        trophy: '🚩',
                        stats: [
                            { label: 'Time', val: timeStr },
                            { label: 'Mines Flagged', val: this.mines },
                            { label: 'Field Size', val: `${this.rows}x${this.cols}` }
                        ],
                        onRestart: () => this.resetGame()
                    });
                }, 250);
            } else if (window.sounds) {
                window.sounds.win();
            }
        }
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.board[r][c];
                const btn = document.createElement('div');
                btn.className = `mine-cell ${cell.revealed ? 'revealed' : ''} ${cell.flagged ? 'flagged' : ''}`;

                if (cell.revealed) {
                    if (cell.mine) {
                        btn.textContent = '💣';
                        btn.classList.add('mine');
                    } else if (cell.count > 0) {
                        btn.textContent = cell.count;
                        btn.setAttribute('data-num', cell.count);
                    }
                } else if (cell.flagged) {
                    btn.textContent = '🚩';
                }

                btn.addEventListener('click', () => this.handleClick(r, c));
                btn.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(r, c);
                });

                this.container.appendChild(btn);
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.minesweeperGame = new Minesweeper();
});
