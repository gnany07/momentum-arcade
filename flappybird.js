class FlappyBird {
    constructor() {
        this.canvas = document.getElementById('flappyCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 500;

        this.bird = {
            x: 70,
            y: 200,
            radius: 12,
            velocity: 0,
            gravity: 0.42,
            jump: -7.5
        };

        this.pipes = [];
        this.score = 0;
        this.highScore = 0;
        this.isPlaying = false;
        this.gameLoop = null;
        this.pipeTimer = 0;
        this.pipeInterval = 100; // frames
        this.pipeGap = 130;
        this.pipeSpeed = 2.4;

        this.setupEventListeners();
        this.loadHighScore();
        this.drawStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame('flappy', this);
        }
    }

    loadHighScore() {
        if (window.ScoreStorage) {
            window.ScoreStorage.get('highScoreFlappy', (val) => {
                this.highScore = val || 0;
                const el = document.getElementById('highScoreFlappy');
                if (el) el.textContent = this.highScore;
            });
        }
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            const el = document.getElementById('highScoreFlappy');
            if (el) el.textContent = this.highScore;
            if (window.ScoreStorage) {
                window.ScoreStorage.set('highScoreFlappy', this.highScore);
            }
        }
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (window.arcadeApp && !window.arcadeApp.isGameActive('flappy')) return;
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
                e.preventDefault();
                if (!this.isPlaying) {
                    this.startGame();
                } else {
                    this.flap();
                }
            }
        });

        this.canvas.addEventListener('click', () => {
            if (!this.isPlaying) {
                this.startGame();
            } else {
                this.flap();
            }
        });

        const startBtn = document.getElementById('startFlappy');
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());
    }

    flap() {
        this.bird.velocity = this.bird.jump;
        if (window.sounds) window.sounds.launch();
    }

    startGame() {
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.isPlaying = true;
        this.bird.y = 200;
        this.bird.velocity = 0;
        this.pipes = [];
        this.score = 0;
        this.pipeTimer = 0;

        const scoreEl = document.getElementById('scoreFlappy');
        if (scoreEl) scoreEl.textContent = '0';

        this.gameLoop = requestAnimationFrame((t) => this.loop(t));
        this.flap();
    }

    pause() {
        if (this.isPlaying) {
            this.isPlaying = false;
            if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        }
    }

    loop() {
        if (!this.isPlaying) return;
        this.update();
        if (!this.isPlaying) return;
        this.draw();
        if (this.isPlaying) {
            this.gameLoop = requestAnimationFrame(() => this.loop());
        }
    }

    update() {
        // Bird physics
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;

        // Ground / ceiling collision
        if (this.bird.y + this.bird.radius >= this.canvas.height || this.bird.y - this.bird.radius <= 0) {
            this.gameOver();
            return;
        }

        // Spawn pipes
        this.pipeTimer++;
        if (this.pipeTimer >= this.pipeInterval) {
            this.pipeTimer = 0;
            const minHeight = 50;
            const maxHeight = this.canvas.height - this.pipeGap - minHeight;
            const topHeight = Math.floor(minHeight + Math.random() * (maxHeight - minHeight));
            this.pipes.push({
                x: this.canvas.width,
                top: topHeight,
                bottom: topHeight + this.pipeGap,
                passed: false
            });
        }

        // Move pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const p = this.pipes[i];
            p.x -= this.pipeSpeed;

            // Score point
            if (!p.passed && p.x + 50 < this.bird.x) {
                p.passed = true;
                this.score++;
                const scoreEl = document.getElementById('scoreFlappy');
                if (scoreEl) scoreEl.textContent = this.score;
                this.updateHighScore();
                if (window.sounds) window.sounds.score();
            }

            // Pipe collision (AABB vs Circle)
            if (this.bird.x + this.bird.radius > p.x && this.bird.x - this.bird.radius < p.x + 50) {
                if (this.bird.y - this.bird.radius < p.top || this.bird.y + this.bird.radius > p.bottom) {
                    this.gameOver();
                    return;
                }
            }

            // Remove off-screen pipes
            if (p.x + 50 < 0) {
                this.pipes.splice(i, 1);
            }
        }
    }

    gameOver() {
        this.isPlaying = false;
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.updateHighScore();
        if (window.sounds) window.sounds.gameOver();

        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 35);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 5);

        this.ctx.fillStyle = '#f59e0b';
        this.ctx.fillText(`Best: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 32);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Tap or press Space to retry', this.canvas.width / 2, this.canvas.height / 2 + 70);

        if (this.score > 0 && this.score >= this.highScore && this.score >= 10 && window.celebrateWin) {
            setTimeout(() => {
                window.celebrateWin({
                    title: 'NEW FLIGHT RECORD!',
                    subtitle: `Spectacular flight! You navigated through ${this.score} neon gates!`,
                    trophy: '🐤',
                    stats: [
                        { label: 'Score', val: this.score },
                        { label: 'High Score', val: this.highScore }
                    ],
                    onRestart: () => this.startGame()
                });
            }, 300);
        } else if (window.showGameOverModal) {
            setTimeout(() => {
                window.showGameOverModal({
                    title: 'FLIGHT ABORTED',
                    subtitle: 'The cyber bird clipped a neon gate or boundary.',
                    icon: '🐤',
                    stats: [
                        { label: 'Gates Cleared', val: this.score },
                        { label: 'High Score', val: this.highScore }
                    ],
                    onRestart: () => this.startGame()
                });
            }, 300);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Cyber background grid
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.canvas.width; x += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Draw pipes
        this.pipes.forEach(p => {
            const pipeGrad = this.ctx.createLinearGradient(p.x, 0, p.x + 50, 0);
            pipeGrad.addColorStop(0, '#06b6d4');
            pipeGrad.addColorStop(1, '#0284c7');

            this.ctx.fillStyle = pipeGrad;
            // Top pipe
            this.ctx.fillRect(p.x, 0, 50, p.top);
            // Bottom pipe
            this.ctx.fillRect(p.x, p.bottom, 50, this.canvas.height - p.bottom);

            // Pipe neon edges
            this.ctx.strokeStyle = '#38bdf8';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(p.x, 0, 50, p.top);
            this.ctx.strokeRect(p.x, p.bottom, 50, this.canvas.height - p.bottom);
        });

        // Draw bird
        this.ctx.save();
        this.ctx.translate(this.bird.x, this.bird.y);
        const rotation = Math.max(-0.4, Math.min(0.6, this.bird.velocity * 0.08));
        this.ctx.rotate(rotation);

        // Bird body
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Eye
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(5, -4, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(6, -4, 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Beak
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.moveTo(8, -1);
        this.ctx.lineTo(16, 2);
        this.ctx.lineTo(8, 5);
        this.ctx.fill();

        // Wing
        this.ctx.fillStyle = '#d97706';
        this.ctx.beginPath();
        this.ctx.ellipse(-4, 2, 6, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawStartScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('CYBER BIRD', this.canvas.width / 2, this.canvas.height / 2 - 30);

        this.ctx.fillStyle = '#f59e0b';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Click or press Space to Flap', this.canvas.width / 2, this.canvas.height / 2 + 10);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '13px Arial';
        this.ctx.fillText('Navigate through neon pipes!', this.canvas.width / 2, this.canvas.height / 2 + 38);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.flappyGame = new FlappyBird();
});
