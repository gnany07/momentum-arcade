class SpaceInvaders {
    constructor() {
        this.canvas = document.getElementById('invadersCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 500;

        this.player = {
            x: this.canvas.width / 2 - 16,
            y: this.canvas.height - 35,
            width: 32,
            height: 18,
            speed: 5.5
        };

        this.bullets = [];
        this.alienBullets = [];
        this.aliens = [];
        this.score = 0;
        this.highScore = 0;
        this.lives = 3;
        this.alienDirection = 1;
        this.alienSpeed = 1.0;
        this.isPlaying = false;
        this.gameLoop = null;
        this.keys = {};
        this.lastShotTime = 0;

        this.setupEventListeners();
        this.loadHighScore();
        this.drawStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame('invaders', this);
        }
    }

    loadHighScore() {
        if (window.ScoreStorage) {
            window.ScoreStorage.get('highScoreInvaders', (val) => {
                this.highScore = val || 0;
                const el = document.getElementById('highScoreInvaders');
                if (el) el.textContent = this.highScore;
            });
        }
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            const el = document.getElementById('highScoreInvaders');
            if (el) el.textContent = this.highScore;
            if (window.ScoreStorage) {
                window.ScoreStorage.set('highScoreInvaders', this.highScore);
            }
        }
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (window.arcadeApp && !window.arcadeApp.isGameActive('invaders')) return;
            this.keys[e.key] = true;
            if (e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
            }
            if (e.key === ' ' && this.isPlaying) {
                this.shoot();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        this.canvas.addEventListener('click', () => {
            if (this.isPlaying) this.shoot();
        });

        const startBtn = document.getElementById('startInvaders');
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());
    }

    shoot() {
        const now = performance.now();
        if (now - this.lastShotTime < 280) return; // cooldown
        this.lastShotTime = now;

        this.bullets.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y - 4,
            speed: 7
        });
        if (window.sounds) window.sounds.launch();
    }

    initAliens() {
        this.aliens = [];
        const rows = 4;
        const cols = 8;
        const spacingX = 42;
        const spacingY = 30;
        const startX = 35;
        const startY = 50;

        const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#06b6d4'];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.aliens.push({
                    x: startX + c * spacingX,
                    y: startY + r * spacingY,
                    width: 26,
                    height: 18,
                    color: colors[r],
                    points: (rows - r) * 10
                });
            }
        }
    }

    startGame() {
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.isPlaying = true;
        this.lives = 3;
        this.score = 0;
        this.wave = 1;
        this.bullets = [];
        this.alienBullets = [];
        this.alienSpeed = 1.0;
        this.alienDirection = 1;

        this.player.x = this.canvas.width / 2 - 16;
        this.updateHUD();
        this.initAliens();

        this.gameLoop = requestAnimationFrame(() => this.loop());
        if (window.sounds) window.sounds.launch();
    }

    pause() {
        if (this.isPlaying) {
            this.isPlaying = false;
            if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        }
    }

    updateHUD() {
        const sEl = document.getElementById('scoreInvaders');
        if (sEl) sEl.textContent = this.score;
        const lEl = document.getElementById('livesInvaders');
        if (lEl) lEl.textContent = '🚀'.repeat(Math.max(0, this.lives)) || '💀';
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
        // Player movement
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.player.x = Math.max(10, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.player.x = Math.min(this.canvas.width - this.player.width - 10, this.player.x + this.player.speed);
        }

        // Move player bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.y -= b.speed;
            if (b.y < 0) {
                this.bullets.splice(i, 1);
                continue;
            }

            // Hit alien test
            for (let j = this.aliens.length - 1; j >= 0; j--) {
                const a = this.aliens[j];
                if (b.x >= a.x && b.x <= a.x + a.width && b.y >= a.y && b.y <= a.y + a.height) {
                    this.score += a.points;
                    this.updateHighScore();
                    this.updateHUD();
                    this.aliens.splice(j, 1);
                    this.bullets.splice(i, 1);
                    if (window.sounds) window.sounds.brickHit();
                    break;
                }
            }
        }

        // Alien movement
        let switchDirection = false;
        this.aliens.forEach(a => {
            a.x += this.alienSpeed * this.alienDirection;
            if (a.x + a.width >= this.canvas.width - 10 || a.x <= 10) {
                switchDirection = true;
            }
        });

        if (switchDirection) {
            this.alienDirection *= -1;
            this.alienSpeed = Math.min(3.2, this.alienSpeed + 0.12);
            this.aliens.forEach(a => {
                a.y += 12;
                if (a.y + a.height >= this.player.y) {
                    this.gameOver();
                }
            });
        }

        // Alien shooting
        if (Math.random() < 0.025 && this.aliens.length > 0) {
            const shooter = this.aliens[Math.floor(Math.random() * this.aliens.length)];
            this.alienBullets.push({
                x: shooter.x + shooter.width / 2,
                y: shooter.y + shooter.height,
                speed: 3.5
            });
        }

        // Move alien bullets
        for (let i = this.alienBullets.length - 1; i >= 0; i--) {
            const ab = this.alienBullets[i];
            ab.y += ab.speed;

            // Hit player
            if (ab.x >= this.player.x && ab.x <= this.player.x + this.player.width &&
                ab.y >= this.player.y && ab.y <= this.player.y + this.player.height) {
                this.alienBullets.splice(i, 1);
                this.lives--;
                this.updateHUD();
                if (window.sounds) window.sounds.lostLife();
                if (this.lives <= 0) {
                    this.gameOver();
                    return;
                }
                continue;
            }

            if (ab.y > this.canvas.height) {
                this.alienBullets.splice(i, 1);
            }
        }

        // Win wave check
        if (this.aliens.length === 0) {
            this.score += 500;
            this.updateHighScore();
            if (this.wave >= 3) {
                this.isPlaying = false;
                if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
                this.updateHUD();
                if (window.celebrateWin) {
                    window.celebrateWin({
                        title: 'GALAXY SAVED!',
                        subtitle: 'Glorious victory! You repelled all 3 alien invasion waves!',
                        trophy: '👾',
                        stats: [
                            { label: 'Final Score', val: this.score },
                            { label: 'Armadas Defeated', val: '3 Waves' },
                            { label: 'Ships Left', val: this.lives }
                        ],
                        onRestart: () => this.startGame()
                    });
                } else if (window.sounds) {
                    window.sounds.win();
                }
                return;
            } else {
                this.wave++;
                if (window.showToast) {
                    window.showToast(`Wave ${this.wave} Approaching! Faster & Stronger!`, '👾');
                }
                this.initAliens();
                this.alienSpeed += 0.45;
                if (window.sounds) window.sounds.win();
            }
        }
    }

    gameOver() {
        this.isPlaying = false;
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.updateHighScore();
        if (window.sounds) window.sounds.gameOver();

        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DEFENSE BREACHED', this.canvas.width / 2, this.canvas.height / 2 - 35);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 5);

        this.ctx.fillStyle = '#f59e0b';
        this.ctx.fillText(`Best: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 32);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Click "Start Game" to Defend Again', this.canvas.width / 2, this.canvas.height / 2 + 70);

        if (window.showGameOverModal) {
            setTimeout(() => {
                window.showGameOverModal({
                    title: 'DEFENSE BREACHED',
                    subtitle: 'The alien armada broke through planetary shields!',
                    icon: '👾',
                    stats: [
                        { label: 'Score', val: this.score },
                        { label: 'Best', val: this.highScore },
                        { label: 'Wave Reached', val: `Wave ${this.wave || 1}` }
                    ],
                    onRestart: () => this.startGame()
                });
            }, 300);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Starfield background
        this.ctx.fillStyle = '#090d16';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 25; i++) {
            const sx = (i * 73) % this.canvas.width;
            const sy = (i * 97) % this.canvas.height;
            this.ctx.fillRect(sx, sy, 1.5, 1.5);
        }

        // Draw Player Ship
        this.ctx.fillStyle = '#38bdf8';
        this.ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Draw Aliens
        this.aliens.forEach(a => {
            this.ctx.fillStyle = a.color;
            this.ctx.shadowColor = a.color;
            this.ctx.shadowBlur = 4;

            // Space invader sprite geometry
            this.ctx.fillRect(a.x + 4, a.y, a.width - 8, a.height - 4);
            this.ctx.fillRect(a.x, a.y + 4, a.width, a.height - 8);

            // Alien eyes
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(a.x + 5, a.y + 6, 3, 4);
            this.ctx.fillRect(a.x + a.width - 8, a.y + 6, 3, 4);
            this.ctx.shadowBlur = 0;
        });

        // Draw Player Lasers
        this.ctx.fillStyle = '#38bdf8';
        this.bullets.forEach(b => {
            this.ctx.fillRect(b.x - 1.5, b.y, 3, 9);
        });

        // Draw Alien Lasers
        this.ctx.fillStyle = '#f43f5e';
        this.alienBullets.forEach(ab => {
            this.ctx.fillRect(ab.x - 1.5, ab.y, 3, 9);
        });
    }

    drawStartScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPACE INVADERS', this.canvas.width / 2, this.canvas.height / 2 - 30);

        this.ctx.fillStyle = '#06b6d4';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Defend Earth from Alien Armada', this.canvas.width / 2, this.canvas.height / 2 + 10);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '13px Arial';
        this.ctx.fillText('◄ ► to Move • Space or Tap to Fire', this.canvas.width / 2, this.canvas.height / 2 + 38);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.invadersGame = new SpaceInvaders();
});
