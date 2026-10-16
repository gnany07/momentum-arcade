class Tetris {
    constructor() {
        this.canvas = document.getElementById('tetrisCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.CELL_SIZE = 30;
        this.canvas.width = this.BOARD_WIDTH * this.CELL_SIZE;
        this.canvas.height = this.BOARD_HEIGHT * this.CELL_SIZE;
        
        this.board = [];
        this.currentPiece = null;
        this.score = 0;
        this.lines = 0;
        this.highScore = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.isPlaying = false;
        this.isPaused = false;
        this.gameLoop = null;
        this.lastTime = 0;
        
        this.pieces = [
            { shape: [[1, 1, 1, 1]], color: '#06b6d4' }, // I
            { shape: [[1, 1], [1, 1]], color: '#eab308' }, // O
            { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' }, // T
            { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e' }, // S
            { shape: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' }, // Z
            { shape: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6' }, // J
            { shape: [[0, 0, 1], [1, 1, 1]], color: '#f97316' }  // L
        ];
        
        this.loadHighScore();
        this.setupEventListeners();
        this.drawStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame('tetris', this);
        }
    }

    loadHighScore() {
        if (window.ScoreStorage) {
            window.ScoreStorage.get('tetrisHighScore', (val) => {
                this.highScore = val || 0;
                const el = document.getElementById('tetrisHighScore');
                if (el) el.textContent = this.highScore;
            });
        }
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            const el = document.getElementById('tetrisHighScore');
            if (el) el.textContent = this.highScore;
            if (window.ScoreStorage) {
                window.ScoreStorage.set('tetrisHighScore', this.highScore);
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        const startBtn = document.getElementById('startTetris');
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());

        const pauseBtn = document.getElementById('pauseTetris');
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
    }

    drawStartScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('TETRIS', this.canvas.width / 2, this.canvas.height / 2 - 35);

        this.ctx.fillStyle = '#a855f7';
        this.ctx.font = '15px Arial';
        this.ctx.fillText('Click "Start Game" to Play', this.canvas.width / 2, this.canvas.height / 2 + 10);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '13px Arial';
        this.ctx.fillText('◄ ► Move • ▲ or Space: Rotate • ▼: Soft Drop', this.canvas.width / 2, this.canvas.height / 2 + 38);
    }

    startGame() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }

        this.initBoard();
        this.score = 0;
        this.lines = 0;
        this.dropInterval = 900;
        this.isPlaying = true;
        this.isPaused = false;
        
        const scoreEl = document.getElementById('tetrisScore');
        if (scoreEl) scoreEl.textContent = '0';
        const linesEl = document.getElementById('tetrisLines');
        if (linesEl) linesEl.textContent = '0';
        
        tetrisTimer.reset();
        tetrisTimer.start();
        
        this.currentPiece = this.generatePiece();
        this.lastTime = performance.now();
        this.dropTime = 0;

        const pauseBtn = document.getElementById('pauseTetris');
        if (pauseBtn) pauseBtn.textContent = 'Pause';

        this.gameLoop = requestAnimationFrame((t) => this.gameUpdate(t));
        if (window.sounds) window.sounds.launch();
    }

    initBoard() {
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
    }

    generatePiece() {
        const p = this.pieces[Math.floor(Math.random() * this.pieces.length)];
        return {
            shape: p.shape,
            color: p.color,
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(p.shape[0].length / 2),
            y: 0
        };
    }

    gameUpdate(time) {
        if (!this.isPlaying || this.isPaused) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropTime += deltaTime;
        
        if (this.dropTime >= this.dropInterval) {
            this.dropPiece();
            this.dropTime = 0;
        }

        if (!this.isPlaying) return;
        
        this.draw();
        if (this.isPlaying && !this.isPaused) {
            this.gameLoop = requestAnimationFrame((t) => this.gameUpdate(t));
        }
    }

    handleKeyPress(event) {
        if (!this.isPlaying || this.isPaused) return;
        if (window.arcadeApp && !window.arcadeApp.isGameActive('tetris')) return;
        
        const key = event.key;
        if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(key)) {
            event.preventDefault();
        }

        switch (key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.dropPiece();
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
            case ' ':
                this.rotatePiece();
                break;
            case 'p':
            case 'P':
                this.togglePause();
                break;
        }
    }

    movePiece(dx, dy) {
        if (this.canMove(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            if (window.sounds) window.sounds.move();
        }
    }

    rotatePiece() {
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        if (this.canPlace(this.currentPiece, rotated)) {
            this.currentPiece.shape = rotated;
            if (window.sounds) window.sounds.move();
        }
    }

    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = [];
        for (let i = 0; i < cols; i++) {
            rotated[i] = [];
            for (let j = 0; j < rows; j++) {
                rotated[i][j] = matrix[rows - 1 - j][i];
            }
        }
        return rotated;
    }

    canMove(piece, dx, dy) {
        return this.canPlace(piece, piece.shape, dx, dy);
    }

    canPlace(piece, shape, dx = 0, dy = 0) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    if (boardX < 0 || boardX >= this.BOARD_WIDTH || boardY >= this.BOARD_HEIGHT) {
                        return false;
                    }
                    if (boardY >= 0 && this.board[boardY][boardX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    dropPiece() {
        if (this.canMove(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
        } else {
            this.lockPiece();
            this.clearLines();
            this.currentPiece = this.generatePiece();
            
            if (!this.canPlace(this.currentPiece, this.currentPiece.shape)) {
                this.gameOver();
            }
        }
    }

    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        if (window.sounds) window.sounds.paddleHit();
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += [0, 100, 300, 500, 800][linesCleared] || 100;
            this.dropInterval = Math.max(200, 900 - Math.floor(this.lines / 5) * 60);
            
            const scoreEl = document.getElementById('tetrisScore');
            if (scoreEl) scoreEl.textContent = this.score;
            const linesEl = document.getElementById('tetrisLines');
            if (linesEl) linesEl.textContent = this.lines;
            
            this.updateHighScore();
            if (window.sounds) window.sounds.score();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.CELL_SIZE, 0);
            this.ctx.lineTo(x * this.CELL_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.CELL_SIZE);
            this.ctx.lineTo(this.canvas.width, y * this.CELL_SIZE);
            this.ctx.stroke();
        }

        // Draw locked cells
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawCell(x, y, this.board[y][x]);
                }
            }
        }

        // Draw current falling piece
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.drawCell(
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.currentPiece.color
                        );
                    }
                }
            }
        }
    }

    drawCell(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        if (this.ctx.roundRect) {
            this.ctx.roundRect(
                x * this.CELL_SIZE + 1.5,
                y * this.CELL_SIZE + 1.5,
                this.CELL_SIZE - 3,
                this.CELL_SIZE - 3,
                3
            );
        } else {
            this.ctx.rect(
                x * this.CELL_SIZE + 1.5,
                y * this.CELL_SIZE + 1.5,
                this.CELL_SIZE - 3,
                this.CELL_SIZE - 3
            );
        }
        this.ctx.fill();

        // Inner gloss
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        this.ctx.fillRect(
            x * this.CELL_SIZE + 3,
            y * this.CELL_SIZE + 3,
            this.CELL_SIZE - 6,
            4
        );
    }

    togglePause() {
        if (!this.isPlaying) return;
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseTetris');
        if (pauseBtn) pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';

        if (this.isPaused) {
            tetrisTimer.stop();
        } else {
            tetrisTimer.start();
            this.lastTime = performance.now();
            this.gameLoop = requestAnimationFrame((t) => this.gameUpdate(t));
        }
    }

    pause() {
        if (this.isPlaying && !this.isPaused) {
            this.togglePause();
        }
    }

    gameOver() {
        this.isPlaying = false;
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        tetrisTimer.stop();
        this.updateHighScore();
        if (window.sounds) window.sounds.gameOver();
        
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText(`Lines: ${this.lines}`, this.canvas.width / 2, this.canvas.height / 2 + 25);
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.fillText(`Best: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 50);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '13px Arial';
        this.ctx.fillText('Click "Start Game" to Play Again', this.canvas.width / 2, this.canvas.height / 2 + 85);

        if (this.lines >= 10 && window.celebrateWin) {
            setTimeout(() => {
                window.celebrateWin({
                    title: 'TETRIS MASTER!',
                    subtitle: `Fantastic stacking! You wiped out ${this.lines} complete lines!`,
                    trophy: '🧱',
                    stats: [
                        { label: 'Final Score', val: this.score },
                        { label: 'Lines Cleared', val: this.lines },
                        { label: 'High Score', val: this.highScore }
                    ],
                    onRestart: () => this.startGame()
                });
            }, 300);
        } else if (window.showGameOverModal) {
            setTimeout(() => {
                window.showGameOverModal({
                    title: 'GRID LOCKOUT',
                    subtitle: 'The blocks stacked all the way to the top ceiling.',
                    icon: '🧱',
                    stats: [
                        { label: 'Score', val: this.score },
                        { label: 'Lines', val: this.lines },
                        { label: 'Best Score', val: this.highScore }
                    ],
                    onRestart: () => this.startGame()
                });
            }, 300);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.tetrisGame = new Tetris();
});
