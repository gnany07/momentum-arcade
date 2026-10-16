class Snake {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Consistent crisp dimensions
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.gridSize = 20; // 20x20 grid
        
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.highScore = 0;
        this.gameLoop = null;
        this.speed = 130;
        this.isPlaying = false;
        this.isPaused = false;

        this.loadHighScore();
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        const startBtn = document.getElementById('startSnake');
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());
        
        this.drawStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame('snake', this);
        }
    }

    loadHighScore() {
        if (window.ScoreStorage) {
            window.ScoreStorage.get('snakeHighScore', (val) => {
                this.highScore = val || 0;
                const el = document.getElementById('snakeHighScore');
                if (el) el.textContent = this.highScore;
            });
        }
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            const el = document.getElementById('snakeHighScore');
            if (el) el.textContent = this.highScore;
            if (window.ScoreStorage) {
                window.ScoreStorage.set('snakeHighScore', this.highScore);
            }
        }
    }

    drawStartScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 26px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('SNAKE', this.canvas.width / 2, this.canvas.height / 2 - 30);

        this.ctx.fillStyle = '#22c55e';
        this.ctx.font = '15px Arial';
        this.ctx.fillText('Click "Start Game" to Slither', this.canvas.width / 2, this.canvas.height / 2 + 10);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '13px Arial';
        this.ctx.fillText('Controls: Arrow Keys or WASD', this.canvas.width / 2, this.canvas.height / 2 + 38);
    }

    startGame() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        
        this.snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.isPlaying = true;
        this.isPaused = false;
        
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.textContent = '0';
        
        this.food = this.generateFood();
        
        snakeTimer.reset();
        snakeTimer.start();
        
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    pause() {
        if (this.isPlaying) {
            this.isPlaying = false;
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
                this.gameLoop = null;
            }
            snakeTimer.stop();
        }
    }

    handleKeyPress(event) {
        if (!this.isPlaying) return;
        if (window.arcadeApp && !window.arcadeApp.isGameActive('snake')) return;

        const key = event.key;
        const keyMap = {
            'ArrowUp': 'up', 'w': 'up', 'W': 'up',
            'ArrowDown': 'down', 's': 'down', 'S': 'down',
            'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
            'ArrowRight': 'right', 'd': 'right', 'D': 'right'
        };

        if (key in keyMap) {
            event.preventDefault();
            const requested = keyMap[key];
            const opposites = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' };
            if (opposites[requested] !== this.direction) {
                this.nextDirection = requested;
            }
        }
    }

    generateFood() {
        const cols = this.canvas.width / this.gridSize;
        const rows = this.canvas.height / this.gridSize;
        let foodPos;
        let attempts = 0;
        while (attempts < 100) {
            foodPos = {
                x: Math.floor(Math.random() * cols),
                y: Math.floor(Math.random() * rows)
            };
            const onSnake = this.snake.some(seg => seg.x === foodPos.x && seg.y === foodPos.y);
            if (!onSnake) break;
            attempts++;
        }
        return foodPos;
    }

    update() {
        this.direction = this.nextDirection;
        const head = {...this.snake[0]};

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            const scoreEl = document.getElementById('score');
            if (scoreEl) scoreEl.textContent = this.score;
            this.updateHighScore();
            this.food = this.generateFood();
            if (window.sounds) window.sounds.score();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    checkCollision(head) {
        const cols = this.canvas.width / this.gridSize;
        const rows = this.canvas.height / this.gridSize;
        return head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows ||
               this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // Draw Snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#22c55e'; // Head
            } else {
                this.ctx.fillStyle = '#16a34a'; // Body
            }
            this.ctx.beginPath();
            if (this.ctx.roundRect) {
                this.ctx.roundRect(
                    segment.x * this.gridSize + 1,
                    segment.y * this.gridSize + 1,
                    this.gridSize - 2,
                    this.gridSize - 2,
                    4
                );
            } else {
                this.ctx.rect(
                    segment.x * this.gridSize + 1,
                    segment.y * this.gridSize + 1,
                    this.gridSize - 2,
                    this.gridSize - 2
                );
            }
            this.ctx.fill();
        });

        // Draw Food (Apple)
        this.ctx.fillStyle = '#ef4444';
        this.ctx.shadowColor = 'rgba(239, 68, 68, 0.7)';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        this.isPlaying = false;
        
        snakeTimer.stop();
        this.updateHighScore();
        if (window.sounds) window.sounds.gameOver();
        
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 35);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 5);

        this.ctx.fillStyle = '#f59e0b';
        this.ctx.fillText(`Best: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 30);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '13px Arial';
        this.ctx.fillText('Click "Start Game" to Play Again', this.canvas.width / 2, this.canvas.height / 2 + 65);

        const timeStr = document.getElementById('snakeTimer') ? document.getElementById('snakeTimer').textContent : '00:00';
        if (this.score > 0 && this.score >= this.highScore && this.score >= 60 && window.celebrateWin) {
            setTimeout(() => {
                window.celebrateWin({
                    title: 'NEW HIGH SCORE!',
                    subtitle: `Sensational slither! You set a personal best of ${this.score} points!`,
                    trophy: '🐍',
                    stats: [
                        { label: 'Score', val: this.score },
                        { label: 'Length', val: this.snake.length },
                        { label: 'Time', val: timeStr }
                    ],
                    onRestart: () => this.startGame()
                });
            }, 300);
        } else if (window.showGameOverModal) {
            setTimeout(() => {
                window.showGameOverModal({
                    title: 'SNAKE COLLISION',
                    subtitle: 'You collided with the boundary wall or tail.',
                    icon: '🐍',
                    stats: [
                        { label: 'Final Score', val: this.score },
                        { label: 'Best Score', val: this.highScore },
                        { label: 'Time', val: timeStr }
                    ],
                    onRestart: () => this.startGame()
                });
            }, 300);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.snakeGame = new Snake();
});
