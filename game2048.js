class Game2048 {
    constructor() {
        this.boardContainer = document.getElementById('board2048');
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.highScore = 0;
        this.gameOver = false;
        this.won = false;
        this.isPlaying = false;

        this.setupEventListeners();
        this.loadHighScore();
        this.initGrid();
        this.render();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame('2048', this);
        }
    }

    loadHighScore() {
        if (window.ScoreStorage) {
            window.ScoreStorage.get('highScore2048', (val) => {
                this.highScore = val || 0;
                const el = document.getElementById('highScore2048');
                if (el) el.textContent = this.highScore;
            });
        }
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            const el = document.getElementById('highScore2048');
            if (el) el.textContent = this.highScore;
            if (window.ScoreStorage) {
                window.ScoreStorage.set('highScore2048', this.highScore);
            }
        }
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (!this.isPlaying || this.gameOver) return;
            if (window.arcadeApp && !window.arcadeApp.isGameActive('2048')) return;

            let moved = false;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                moved = this.moveUp();
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                e.preventDefault();
                moved = this.moveDown();
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                e.preventDefault();
                moved = this.moveLeft();
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                e.preventDefault();
                moved = this.moveRight();
            }

            if (moved) {
                this.spawnRandomTile();
                this.render();
                if (window.sounds) window.sounds.move();
                this.checkGameStatus();
            }
        });

        const startBtn = document.getElementById('start2048');
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());

        const newBtn = document.getElementById('new2048');
        if (newBtn) newBtn.addEventListener('click', () => this.startGame());
    }

    startGame() {
        this.isPlaying = true;
        this.gameOver = false;
        this.won = false;
        this.score = 0;
        this.updateScore();
        this.initGrid();
        this.spawnRandomTile();
        this.spawnRandomTile();
        this.render();
        if (window.sounds) window.sounds.launch();
    }

    pause() {}

    initGrid() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
    }

    spawnRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length === 0) return;
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.grid[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    }

    updateScore() {
        const el = document.getElementById('score2048');
        if (el) el.textContent = this.score;
        this.updateHighScore();
    }

    slideAndMerge(row) {
        let arr = row.filter(val => val !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                this.score += arr[i];
                arr.splice(i + 1, 1);
                if (arr[i] === 2048 && !this.won) {
                    this.won = true;
                    if (window.sounds) window.sounds.win();
                }
            }
        }
        while (arr.length < this.size) arr.push(0);
        return arr;
    }

    moveLeft() {
        let moved = false;
        for (let r = 0; r < this.size; r++) {
            const original = [...this.grid[r]];
            const newRow = this.slideAndMerge(original);
            this.grid[r] = newRow;
            if (original.some((val, idx) => val !== newRow[idx])) moved = true;
        }
        if (moved) this.updateScore();
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let r = 0; r < this.size; r++) {
            const original = [...this.grid[r]];
            const reversed = [...original].reverse();
            const newRow = this.slideAndMerge(reversed).reverse();
            this.grid[r] = newRow;
            if (original.some((val, idx) => val !== newRow[idx])) moved = true;
        }
        if (moved) this.updateScore();
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let c = 0; c < this.size; c++) {
            const col = [];
            for (let r = 0; r < this.size; r++) col.push(this.grid[r][c]);
            const newCol = this.slideAndMerge(col);
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] !== newCol[r]) moved = true;
                this.grid[r][c] = newCol[r];
            }
        }
        if (moved) this.updateScore();
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let c = 0; c < this.size; c++) {
            const col = [];
            for (let r = 0; r < this.size; r++) col.push(this.grid[r][c]);
            col.reverse();
            const newCol = this.slideAndMerge(col).reverse();
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] !== newCol[r]) moved = true;
                this.grid[r][c] = newCol[r];
            }
        }
        if (moved) this.updateScore();
        return moved;
    }

    checkGameStatus() {
        // Check if any empty cell exists
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) return;
                if (c < this.size - 1 && this.grid[r][c] === this.grid[r][c + 1]) return;
                if (r < this.size - 1 && this.grid[r][c] === this.grid[r + 1][c]) return;
            }
        }
        this.gameOver = true;
        if (window.sounds) window.sounds.gameOver();
        setTimeout(() => alert(`Game Over! Final Score: ${this.score}`), 300);
    }

    render() {
        if (!this.boardContainer) return;
        this.boardContainer.innerHTML = '';
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const val = this.grid[r][c];
                const tile = document.createElement('div');
                tile.className = `tile-2048 ${val ? 'tile-' + val : 'tile-empty'}`;
                tile.textContent = val > 0 ? val : '';
                this.boardContainer.appendChild(tile);
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game2048 = new Game2048();
});
