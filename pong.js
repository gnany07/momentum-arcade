class CyberPong {
    constructor() {
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 500;
        this.canvas.height = 360;

        this.paddleWidth = 12;
        this.paddleHeight = 65;

        this.player = {
            y: (this.canvas.height - this.paddleHeight) / 2,
            score: 0,
            speed: 6
        };

        this.ai = {
            y: (this.canvas.height - this.paddleHeight) / 2,
            score: 0,
            speed: 4.6
        };

        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 7,
            dx: 5,
            dy: 2.5,
            speed: 5.5
        };

        this.isPlaying = false;
        this.gameLoop = null;
        this.winningScore = 5;
        this.keys = {};

        this.setupEventListeners();
        this.drawStartScreen();

        if (window.arcadeApp) {
            window.arcadeApp.registerGame('pong', this);
        }
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (window.arcadeApp && !window.arcadeApp.isGameActive('pong')) return;
            this.keys[e.key] = true;
            if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isPlaying) return;
            const rect = this.canvas.getBoundingClientRect();
            const scaleY = this.canvas.height / rect.height;
            const mouseY = (e.clientY - rect.top) * scaleY;
            this.player.y = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, mouseY - this.paddleHeight / 2));
        });

        const startBtn = document.getElementById('startPong');
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());
    }

    resetBall(direction = 1) {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speed = 5.5;
        const angle = (Math.random() * 0.4 - 0.2) * Math.PI;
        this.ball.dx = direction * this.ball.speed * Math.cos(angle);
        this.ball.dy = this.ball.speed * Math.sin(angle);
    }

    startGame() {
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.isPlaying = true;
        this.player.score = 0;
        this.ai.score = 0;
        this.updateHUD();
        this.resetBall();
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
        const pEl = document.getElementById('pongPlayerScore');
        if (pEl) pEl.textContent = this.player.score;
        const aiEl = document.getElementById('pongAiScore');
        if (aiEl) aiEl.textContent = this.ai.score;
    }

    loop() {
        if (!this.isPlaying) return;
        this.update();
        this.draw();
        if (this.isPlaying) {
            this.gameLoop = requestAnimationFrame(() => this.loop());
        }
    }

    update() {
        // Keyboard player movement
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            this.player.y = Math.max(0, this.player.y - this.player.speed);
        }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            this.player.y = Math.min(this.canvas.height - this.paddleHeight, this.player.y + this.player.speed);
        }

        // AI movement with slight latency
        const aiCenter = this.ai.y + this.paddleHeight / 2;
        if (aiCenter < this.ball.y - 12) {
            this.ai.y = Math.min(this.canvas.height - this.paddleHeight, this.ai.y + this.ai.speed);
        } else if (aiCenter > this.ball.y + 12) {
            this.ai.y = Math.max(0, this.ai.y - this.ai.speed);
        }

        // Ball position
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Top / bottom wall bounce
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.y = this.ball.radius;
            this.ball.dy = Math.abs(this.ball.dy);
            if (window.sounds) window.sounds.move();
        } else if (this.ball.y + this.ball.radius >= this.canvas.height) {
            this.ball.y = this.canvas.height - this.ball.radius;
            this.ball.dy = -Math.abs(this.ball.dy);
            if (window.sounds) window.sounds.move();
        }

        // Player paddle collision (Left side)
        const playerX = 20;
        if (this.ball.dx < 0 &&
            this.ball.x - this.ball.radius <= playerX + this.paddleWidth &&
            this.ball.x + this.ball.radius >= playerX &&
            this.ball.y >= this.player.y &&
            this.ball.y <= this.player.y + this.paddleHeight) {

            this.ball.x = playerX + this.paddleWidth + this.ball.radius;
            const hitOffset = (this.ball.y - (this.player.y + this.paddleHeight / 2)) / (this.paddleHeight / 2);
            const bounceAngle = hitOffset * (Math.PI * 0.35);

            this.ball.speed = Math.min(9.5, this.ball.speed + 0.25);
            this.ball.dx = this.ball.speed * Math.cos(bounceAngle);
            this.ball.dy = this.ball.speed * Math.sin(bounceAngle);
            if (window.sounds) window.sounds.paddleHit();
        }

        // AI paddle collision (Right side)
        const aiX = this.canvas.width - 20 - this.paddleWidth;
        if (this.ball.dx > 0 &&
            this.ball.x + this.ball.radius >= aiX &&
            this.ball.x - this.ball.radius <= aiX + this.paddleWidth &&
            this.ball.y >= this.ai.y &&
            this.ball.y <= this.ai.y + this.paddleHeight) {

            this.ball.x = aiX - this.ball.radius;
            const hitOffset = (this.ball.y - (this.ai.y + this.paddleHeight / 2)) / (this.paddleHeight / 2);
            const bounceAngle = hitOffset * (Math.PI * 0.35);

            this.ball.speed = Math.min(9.5, this.ball.speed + 0.25);
            this.ball.dx = -this.ball.speed * Math.cos(bounceAngle);
            this.ball.dy = this.ball.speed * Math.sin(bounceAngle);
            if (window.sounds) window.sounds.paddleHit();
        }

        // Point scored
        if (this.ball.x < 0) {
            // AI scored
            this.ai.score++;
            this.updateHUD();
            if (window.sounds) window.sounds.lostLife();
            if (this.ai.score >= this.winningScore) {
                this.gameOver(false);
            } else {
                this.resetBall(1);
            }
        } else if (this.ball.x > this.canvas.width) {
            // Player scored
            this.player.score++;
            this.updateHUD();
            if (window.sounds) window.sounds.score();
            if (this.player.score >= this.winningScore) {
                this.gameOver(true);
            } else {
                this.resetBall(-1);
            }
        }
    }

    gameOver(playerWon) {
        this.isPlaying = false;
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        if (playerWon && window.sounds) window.sounds.win();
        else if (!playerWon && window.sounds) window.sounds.gameOver();

        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = playerWon ? '#10b981' : '#ef4444';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(playerWon ? 'VICTORY!' : 'DEFEATED!', this.canvas.width / 2, this.canvas.height / 2 - 30);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Final Match: ${this.player.score} - ${this.ai.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Click "Start Game" for rematch', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Court background
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Net dashed line
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([8, 8]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Player paddle (cyan)
        this.ctx.fillStyle = '#38bdf8';
        this.ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(20, this.player.y, this.paddleWidth, this.paddleHeight);

        // AI paddle (purple)
        this.ctx.fillStyle = '#c084fc';
        this.ctx.shadowColor = 'rgba(192, 132, 252, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.canvas.width - 20 - this.paddleWidth, this.ai.y, this.paddleWidth, this.paddleHeight);

        // Ball
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    drawStartScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('CYBER PONG', this.canvas.width / 2, this.canvas.height / 2 - 30);

        this.ctx.fillStyle = '#38bdf8';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('First to 5 Points Wins!', this.canvas.width / 2, this.canvas.height / 2 + 10);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '13px Arial';
        this.ctx.fillText('Steer with Mouse or ▲ ▼ / W S', this.canvas.width / 2, this.canvas.height / 2 + 38);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.pongGame = new CyberPong();
});
