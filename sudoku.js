class Sudoku {
    constructor() {
        this.canvas = document.getElementById('sudokuCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = 450;
        this.canvas.height = 450;
        this.cellSize = this.canvas.width / 9;
        this.selectedCell = null;
        this.board = this.generateEmptyBoard();
        this.originalBoard = [];
        this.difficulty = 'medium';
        this.isPlaying = false;
        
        this.canvas.tabIndex = 0;
        this.canvas.style.outline = 'none';
        
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        const startBtn = document.getElementById('startSudoku');
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());

        const newBtn = document.getElementById('newSudoku');
        if (newBtn) newBtn.addEventListener('click', () => this.newGame());

        const checkBtn = document.getElementById('checkSudoku');
        if (checkBtn) checkBtn.addEventListener('click', () => this.checkSolution());
        
        // Wire difficulty buttons
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.getAttribute('data-diff') || 'medium';
                if (this.isPlaying) this.newGame();
            });
        });

        // Wire on-screen numpad
        document.querySelectorAll('.num-key').forEach(keyBtn => {
            keyBtn.addEventListener('click', () => {
                const num = parseInt(keyBtn.getAttribute('data-num'), 10);
                this.enterNumber(num);
            });
        });

        this.drawStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame('sudoku', this);
        }
    }

    drawStartScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('SUDOKU', this.canvas.width / 2, this.canvas.height / 2 - 30);

        this.ctx.fillStyle = '#06b6d4';
        this.ctx.font = '15px Arial';
        this.ctx.fillText('Click "Start Game" to Play', this.canvas.width / 2, this.canvas.height / 2 + 10);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '13px Arial';
        this.ctx.fillText('Select cell, then tap numpad or keys 1–9', this.canvas.width / 2, this.canvas.height / 2 + 38);
    }

    startGame() {
        this.isPlaying = true;
        this.newGame();
    }

    pause() {
        if (this.isPlaying) {
            sudokuTimer.stop();
        }
    }

    generateEmptyBoard() {
        return Array(9).fill().map(() => Array(9).fill(0));
    }

    newGame() {
        sudokuTimer.reset();
        sudokuTimer.start();
        
        this.board = this.generateEmptyBoard();
        this.solveSudoku(this.board);
        this.originalBoard = JSON.parse(JSON.stringify(this.board));
        
        const cellsToRemove = this.difficulty === 'easy' ? 36 : 
                             this.difficulty === 'medium' ? 46 : 54;
        
        let removed = 0;
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (this.board[row][col] !== 0) {
                this.board[row][col] = 0;
                this.originalBoard[row][col] = 0;
                removed++;
            }
        }
        
        this.selectedCell = null;
        this.draw();
        if (window.sounds) window.sounds.launch();
    }

    solveSudoku(board) {
        const empty = this.findEmptyCell(board);
        if (!empty) return true;
        const [row, col] = empty;
        
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (let num of nums) {
            if (this.isValid(board, row, col, num)) {
                board[row][col] = num;
                if (this.solveSudoku(board)) return true;
                board[row][col] = 0;
            }
        }
        return false;
    }

    findEmptyCell(board) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) return [i, j];
            }
        }
        return null;
    }

    isValid(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num) return false;
            if (board[i][col] === num) return false;
        }
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[boxRow + i][boxCol + j] === num) return false;
            }
        }
        return true;
    }

    handleClick(event) {
        if (!this.isPlaying) return;
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < 9 && col >= 0 && col < 9) {
            this.selectedCell = [row, col];
            this.canvas.focus();
            this.draw();
            if (window.sounds) window.sounds.move();
        }
    }

    enterNumber(num) {
        if (!this.isPlaying || !this.selectedCell) return;
        const [row, col] = this.selectedCell;
        if (this.originalBoard[row][col] !== 0) return; // Clue cannot be edited

        this.board[row][col] = num;
        this.draw();
        if (num > 0 && window.sounds) window.sounds.score();
    }

    handleKeyPress(event) {
        if (!this.isPlaying) return;
        if (window.arcadeApp && !window.arcadeApp.isGameActive('sudoku')) return;
        if (!this.selectedCell) return;

        const [row, col] = this.selectedCell;
        
        if (event.key >= '1' && event.key <= '9') {
            event.preventDefault();
            this.enterNumber(parseInt(event.key, 10));
        } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
            event.preventDefault();
            this.enterNumber(0);
        } else if (event.key === 'ArrowUp' && row > 0) {
            event.preventDefault();
            this.selectedCell = [row - 1, col];
            this.draw();
        } else if (event.key === 'ArrowDown' && row < 8) {
            event.preventDefault();
            this.selectedCell = [row + 1, col];
            this.draw();
        } else if (event.key === 'ArrowLeft' && col > 0) {
            event.preventDefault();
            this.selectedCell = [row, col - 1];
            this.draw();
        } else if (event.key === 'ArrowRight' && col < 8) {
            event.preventDefault();
            this.selectedCell = [row, col + 1];
            this.draw();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Highlight selected cell row and col
        if (this.selectedCell) {
            const [selRow, selCol] = this.selectedCell;
            this.ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
            this.ctx.fillRect(0, selRow * this.cellSize, this.canvas.width, this.cellSize);
            this.ctx.fillRect(selCol * this.cellSize, 0, this.cellSize, this.canvas.height);

            // Highlight selected cell
            this.ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            this.ctx.fillRect(selCol * this.cellSize, selRow * this.cellSize, this.cellSize, this.cellSize);
        }

        // Draw grid lines
        for (let i = 0; i <= 9; i++) {
            const isThick = i % 3 === 0;
            this.ctx.strokeStyle = isThick ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)';
            this.ctx.lineWidth = isThick ? 2.5 : 1;
            
            // Vertical
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();
            
            // Horizontal
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
        
        // Draw numbers
        this.ctx.font = `600 ${this.cellSize * 0.55}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const val = this.board[r][c];
                if (val !== 0) {
                    const isOriginal = this.originalBoard[r][c] !== 0;
                    this.ctx.fillStyle = isOriginal ? '#ffffff' : '#38bdf8';
                    this.ctx.fillText(
                        val.toString(),
                        c * this.cellSize + this.cellSize / 2,
                        r * this.cellSize + this.cellSize / 2 + 2
                    );
                }
            }
        }
        
        // Selected cell border
        if (this.selectedCell) {
            const [selRow, selCol] = this.selectedCell;
            this.ctx.strokeStyle = '#38bdf8';
            this.ctx.lineWidth = 2.5;
            this.ctx.strokeRect(
                selCol * this.cellSize + 1,
                selRow * this.cellSize + 1,
                this.cellSize - 2,
                this.cellSize - 2
            );
        }
    }

    checkSolution() {
        sudokuTimer.stop();
        
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.board[r][c] === 0) {
                    if (window.showToast) {
                        window.showToast('Please fill in all empty cells before checking!', '⚠️');
                    }
                    sudokuTimer.start();
                    return;
                }
            }
        }

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const val = this.board[r][c];
                this.board[r][c] = 0;
                const ok = this.isValid(this.board, r, c, val);
                this.board[r][c] = val;
                if (!ok) {
                    if (window.sounds) window.sounds.lostLife();
                    if (window.showToast) {
                        window.showToast('There are conflicting numbers. Keep trying!', '❌');
                    }
                    sudokuTimer.start();
                    return;
                }
            }
        }

        const timeStr = document.getElementById('sudokuTimer') ? document.getElementById('sudokuTimer').textContent : '00:00';
        if (window.celebrateWin) {
            window.celebrateWin({
                title: 'PUZZLE SOLVED!',
                subtitle: `Brilliant! You cracked the Sudoku grid in ${timeStr}!`,
                trophy: '🧩',
                stats: [
                    { label: 'Difficulty', val: this.difficulty.toUpperCase() },
                    { label: 'Time', val: timeStr },
                    { label: 'Accuracy', val: '100% Solved' }
                ],
                onRestart: () => this.newGame()
            });
        } else if (window.sounds) {
            window.sounds.win();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.sudokuGame = new Sudoku();
});
