class BlockBreaker {
    constructor() {
        this.canvas = document.getElementById('blockbreakerCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Logical internal resolution
        this.canvas.width = 400;
        this.canvas.height = 520;

        this.paddle = {
            width: 86,
            height: 14,
            x: 0,
            y: this.canvas.height - 24,
            speed: 7
        };
        this.paddle.x = (this.canvas.width - this.paddle.width) / 2;

        this.ball = {
            x: 0,
            y: 0,
            radius: 7,
            dx: 0,
            dy: 0,
            baseSpeed: 5.2,
            speed: 5.2,
            maxSpeed: 8.5
        };

        this.blocks = [];
        this.particles = [];
        this.score = 0;
        this.highScore = 0;
        this.lives = 3;
        this.level = 1;
        this.maxLevels = 3;
        this.isPlaying = false;
        this.isPaused = false;
        this.isLaunched = false;
        this.combo = 0;
        this.gameLoop = null;
        this.keys = {};

        this.setupEventListeners();
        this.loadHighScore();
        this.resetBall();
        this.setupBlocks();
        this.drawStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame('blockbreaker', this);
        }
    }

    loadHighScore() {
        if (window.ScoreStorage) {
            window.ScoreStorage.get('blockbreakerHighScore', (val) => {
                this.highScore = val || 0;
                const el = document.getElementById('blockbreakerHighScore');
                if (el) el.textContent = this.highScore;
            });
        }
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            const el = document.getElementById('blockbreakerHighScore');
            if (el) el.textContent = this.highScore;
            if (window.ScoreStorage) {
                window.ScoreStorage.set('blockbreakerHighScore', this.highScore);
            }
        }
    }

    resetBall() {
        this.isLaunched = false;
        this.ball.x = this.paddle.x + this.paddle.width / 2;
        this.ball.y = this.paddle.y - this.ball.radius - 1;
        this.ball.dx = 0;
        this.ball.dy = 0;
        this.ball.speed = this.ball.baseSpeed + (this.level - 1) * 0.4;
        this.combo = 0;
    }

    launchBall() {
        if (this.isLaunched || !this.isPlaying || this.isPaused) return;
        this.isLaunched = true;
        const angle = (Math.random() * 0.5 - 0.25) * Math.PI;
        this.ball.dx = this.ball.speed * Math.sin(angle);
        this.ball.dy = -Math.abs(this.ball.speed * Math.cos(angle));
        if (window.sounds) window.sounds.launch();
    }

    setupBlocks() {
        this.blocks = [];
        const cols = 8;
        const padding = 6;
        const offsetTop = 45;
        const offsetLeft = 14;
        const blockWidth = (this.canvas.width - offsetLeft * 2 - (cols - 1) * padding) / cols;
        const blockHeight = 18;

        const palette = [
            '#ef4444',
            '#f97316',
            '#eab308',
            '#10b981',
            '#06b6d4',
            '#8b5cf6'
        ];

        if (this.level === 1) {
            const rows = 5;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    this.blocks.push({
                        x: offsetLeft + c * (blockWidth + padding),
                        y: offsetTop + r * (blockHeight + padding),
                        width: blockWidth,
                        height: blockHeight,
                        color: palette[r % palette.length],
                        hitsLeft: 1,
                        points: (rows - r) * 10,
                        destroyed: false
                    });
                }
            }
        } else if (this.level === 2) {
            const rows = 6;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const distFromCenter = Math.abs(c - 3.5);
                    if (r >= distFromCenter - 1 && r <= 7 - distFromCenter) {
                        const isSilver = (r + c) % 3 === 0;
                        this.blocks.push({
                            x: offsetLeft + c * (blockWidth + padding),
                            y: offsetTop + r * (blockHeight + padding),
                            width: blockWidth,
                            height: blockHeight,
                            color: isSilver ? '#94a3b8' : palette[r % palette.length],
                            hitsLeft: isSilver ? 2 : 1,
                            isSilver: isSilver,
                            points: isSilver ? 30 : 15,
                            destroyed: false
                        });
                    }
                }
            }
        } else {
            const rows = 7;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const isTough = r === 0 || r === 3 || c === 0 || c === cols - 1;
                    this.blocks.push({
                        x: offsetLeft + c * (blockWidth + padding),
                        y: offsetTop + r * (blockHeight + padding),
                        width: blockWidth,
                        height: blockHeight,
                        color: isTough ? '#94a3b8' : palette[(r + c) % palette.length],
                        hitsLeft: isTough ? 2 : 1,
                        isSilver: isTough,
                        points: isTough ? 40 : 20,
                        destroyed: false
                    });
                }
            }
        }
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (!this.isPlaying) return;
            if (window.arcadeApp && !window.arcadeApp.isGameActive('blockbreaker')) return;

            this.keys[e.key] = true;
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                this.launchBall();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
            } else if (e.key === 'p' || e.key === 'P') {
                this.togglePause();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isPlaying || this.isPaused) return;
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const mouseX = (e.clientX - rect.left) * scaleX;
            this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, mouseX - this.paddle.width / 2));
            if (!this.isLaunched) {
                this.ball.x = this.paddle.x + this.paddle.width / 2;
            }
        });

        this.canvas.addEventListener('click', () => {
            if (this.isPlaying && !this.isLaunched && !this.isPaused) {
                this.launchBall();
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.isPlaying || this.isPaused || !e.touches[0]) return;
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const touchX = (e.touches[0].clientX - rect.left) * scaleX;
            this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, touchX - this.paddle.width / 2));
            if (!this.isLaunched) {
                this.ball.x = this.paddle.x + this.paddle.width / 2;
            }
        }, { passive: false });

        this.canvas.addEventListener('touchstart', () => {
            if (this.isPlaying && !this.isLaunched && !this.isPaused) {
                this.launchBall();
            }
        });

        const startBtn = document.getElementById('startBlockBreaker');
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());

        const pauseBtn = document.getElementById('pauseBlockBreaker');
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
    }

    startGame() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }

        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.particles = [];
        this.isPlaying = true;
        this.isPaused = false;

        this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
        this.resetBall();
        this.setupBlocks();
        this.updateHUD();

        blockbreakerTimer.reset();
        blockbreakerTimer.start();

        const pauseBtn = document.getElementById('pauseBlockBreaker');
        if (pauseBtn) pauseBtn.textContent = 'Pause';

        this.gameLoop = requestAnimationFrame((t) => this.loop(t));
    }

    updateHUD() {
        const scoreEl = document.getElementById('blockbreakerScore');
        if (scoreEl) scoreEl.textContent = this.score;

        const levelEl = document.getElementById('blockbreakerLevel');
        if (levelEl) levelEl.textContent = this.level;

        const livesEl = document.getElementById('blockbreakerLives');
        if (livesEl) {
            livesEl.textContent = '❤️'.repeat(Math.max(0, this.lives)) || '💀';
        }
    }

    togglePause() {
        if (!this.isPlaying) return;
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBlockBreaker');
        if (pauseBtn) pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';

        if (this.isPaused) {
            blockbreakerTimer.stop();
            this.drawPauseScreen();
        } else {
            blockbreakerTimer.start();
            this.gameLoop = requestAnimationFrame((t) => this.loop(t));
        }
    }

    pause() {
        if (this.isPlaying && !this.isPaused) {
            this.togglePause();
        }
    }

    spawnParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: 2 + Math.random() * 3,
                alpha: 1.0,
                decay: 0.03 + Math.random() * 0.03
            });
        }
    }

    loop(time) {
        if (!this.isPlaying || this.isPaused) return;

        this.update();
        this.draw();

        if (this.isPlaying && !this.isPaused) {
            this.gameLoop = requestAnimationFrame((t) => this.loop(t));
        }
    }

    update() {
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.paddle.x = Math.max(0, this.paddle.x - this.paddle.speed);
            if (!this.isLaunched) this.ball.x = this.paddle.x + this.paddle.width / 2;
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.paddle.x = Math.min(this.canvas.width - this.paddle.width, this.paddle.x + this.paddle.speed);
            if (!this.isLaunched) this.ball.x = this.paddle.x + this.paddle.width / 2;
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08;
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        if (!this.isLaunched) {
            this.ball.x = this.paddle.x + this.paddle.width / 2;
            this.ball.y = this.paddle.y - this.ball.radius - 1;
            return;
        }

        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        if (this.ball.x - this.ball.radius <= 0) {
            this.ball.x = this.ball.radius;
            this.ball.dx = Math.abs(this.ball.dx);
            if (window.sounds) window.sounds.move();
        } else if (this.ball.x + this.ball.radius >= this.canvas.width) {
            this.ball.x = this.canvas.width - this.ball.radius;
            this.ball.dx = -Math.abs(this.ball.dx);
            if (window.sounds) window.sounds.move();
        }

        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.y = this.ball.radius;
            this.ball.dy = Math.abs(this.ball.dy);
            if (window.sounds) window.sounds.move();
        }

        if (this.ball.dy > 0 &&
            this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.y - this.ball.radius <= this.paddle.y + this.paddle.height &&
            this.ball.x + this.ball.radius >= this.paddle.x &&
            this.ball.x - this.ball.radius <= this.paddle.x + this.paddle.width) {

            this.ball.y = this.paddle.y - this.ball.radius - 1;

            const paddleCenter = this.paddle.x + this.paddle.width / 2;
            const offset = (this.ball.x - paddleCenter) / (this.paddle.width / 2);
            const clampedOffset = Math.max(-0.92, Math.min(0.92, offset));

            const maxAngle = (60 * Math.PI) / 180;
            const bounceAngle = clampedOffset * maxAngle;

            this.combo = 0;
            this.ball.speed = Math.min(this.ball.maxSpeed, this.ball.speed + 0.05);

            this.ball.dx = this.ball.speed * Math.sin(bounceAngle);
            this.ball.dy = -Math.abs(this.ball.speed * Math.cos(bounceAngle));

            if (window.sounds) window.sounds.paddleHit();
        }

        let hitOccurred = false;
        for (let i = 0; i < this.blocks.length; i++) {
            const b = this.blocks[i];
            if (b.destroyed) continue;

            const nearestX = Math.max(b.x, Math.min(this.ball.x, b.x + b.width));
            const nearestY = Math.max(b.y, Math.min(this.ball.y, b.y + b.height));

            const deltaX = this.ball.x - nearestX;
            const deltaY = this.ball.y - nearestY;
            const distSq = deltaX * deltaX + deltaY * deltaY;

            if (distSq <= this.ball.radius * this.ball.radius) {
                b.hitsLeft--;
                this.combo++;
                const comboBonus = Math.min(50, (this.combo - 1) * 5);
                this.score += b.points + comboBonus;
                this.updateHighScore();
                this.updateHUD();

                this.spawnParticles(nearestX, nearestY, b.color);

                if (b.hitsLeft <= 0) {
                    b.destroyed = true;
                } else {
                    b.color = '#cbd5e1';
                }

                if (window.sounds) window.sounds.brickHit(this.combo);

                if (!hitOccurred) {
                    const overlapLeft = Math.abs((b.x) - (this.ball.x + this.ball.radius));
                    const overlapRight = Math.abs((b.x + b.width) - (this.ball.x - this.ball.radius));
                    const overlapTop = Math.abs((b.y) - (this.ball.y + this.ball.radius));
                    const overlapBottom = Math.abs((b.y + b.height) - (this.ball.y - this.ball.radius));

                    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                    if (minOverlap === overlapLeft) {
                        this.ball.dx = -Math.abs(this.ball.dx);
                        this.ball.x = b.x - this.ball.radius - 1;
                    } else if (minOverlap === overlapRight) {
                        this.ball.dx = Math.abs(this.ball.dx);
                        this.ball.x = b.x + b.width + this.ball.radius + 1;
                    } else if (minOverlap === overlapTop) {
                        this.ball.dy = -Math.abs(this.ball.dy);
                        this.ball.y = b.y - this.ball.radius - 1;
                    } else {
                        this.ball.dy = Math.abs(this.ball.dy);
                        this.ball.y = b.y + b.height + this.ball.radius + 1;
                    }
                    hitOccurred = true;
                }
                break;
            }
        }

        if (this.ball.y - this.ball.radius > this.canvas.height) {
            this.lives--;
            this.updateHUD();
            if (window.sounds) window.sounds.lostLife();

            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.resetBall();
            }
            return;
        }

        const remainingBlocks = this.blocks.filter(b => !b.destroyed);
        if (remainingBlocks.length === 0) {
            this.levelWon();
        }
    }

    levelWon() {
        if (window.sounds) window.sounds.win();
        if (this.level < this.maxLevels) {
            this.level++;
            this.score += 500;
            this.updateHUD();
            this.resetBall();
            this.setupBlocks();
        } else {
            this.isPlaying = false;
            blockbreakerTimer.stop();
            this.updateHighScore();
            this.drawWinScreen();
        }
    }

    gameOver() {
        this.isPlaying = false;
        blockbreakerTimer.stop();
        this.updateHighScore();
        if (window.sounds) window.sounds.gameOver();
        this.drawGameOverScreen();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let i = 0; i < this.blocks.length; i++) {
            const b = this.blocks[i];
            if (b.destroyed) continue;

            this.ctx.fillStyle = b.color;
            this.ctx.beginPath();
            if (this.ctx.roundRect) {
                this.ctx.roundRect(b.x, b.y, b.width, b.height, 4);
            } else {
                this.ctx.rect(b.x, b.y, b.width, b.height);
            }
            this.ctx.fill();

            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.beginPath();
            if (this.ctx.roundRect) {
                this.ctx.roundRect(b.x + 2, b.y + 2, b.width - 4, b.height / 2 - 2, 2);
            } else {
                this.ctx.rect(b.x + 2, b.y + 2, b.width - 4, b.height / 2 - 2);
            }
            this.ctx.fill();

            if (b.isSilver && b.hitsLeft === 1) {
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.moveTo(b.x + b.width * 0.3, b.y + 2);
                this.ctx.lineTo(b.x + b.width * 0.5, b.y + b.height * 0.6);
                this.ctx.lineTo(b.x + b.width * 0.7, b.y + b.height - 2);
                this.ctx.stroke();
            }
        }

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        const pGrad = this.ctx.createLinearGradient(this.paddle.x, this.paddle.y, this.paddle.x, this.paddle.y + this.paddle.height);
        pGrad.addColorStop(0, '#38bdf8');
        pGrad.addColorStop(1, '#0284c7');

        this.ctx.fillStyle = pGrad;
        this.ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        if (this.ctx.roundRect) {
            this.ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, 7);
        } else {
            this.ctx.rect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        }
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        if (this.isPlaying && !this.isLaunched && !this.isPaused) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.font = '13px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press Space or Click to Launch', this.canvas.width / 2, this.paddle.y - 18);
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
        this.ctx.fillText('BLOCK BREAKER', this.canvas.width / 2, this.canvas.height / 2 - 40);

        this.ctx.fillStyle = '#38bdf8';
        this.ctx.font = '15px Arial';
        this.ctx.fillText('Click "Start Game" to Play', this.canvas.width / 2, this.canvas.height / 2);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '13px Arial';
        this.ctx.fillText('Controls: Mouse or ◄ ► / A D', this.canvas.width / 2, this.canvas.height / 2 + 30);
        this.ctx.fillText('Space or Click to Launch Ball', this.canvas.width / 2, this.canvas.height / 2 + 52);
    }

    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.fillText('Click Resume or press P to continue', this.canvas.width / 2, this.canvas.height / 2 + 35);
    }

    drawGameOverScreen() {
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 45);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.fillText(`Best: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 28);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Click "Start Game" to Play Again', this.canvas.width / 2, this.canvas.height / 2 + 65);
    }

    drawWinScreen() {
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#10b981';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('VICTORY!', this.canvas.width / 2, this.canvas.height / 2 - 45);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('You Cleared All Levels!', this.canvas.width / 2, this.canvas.height / 2 - 10);
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Click "Start Game" to Play Again', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.blockBreakerGame = new BlockBreaker();
});
