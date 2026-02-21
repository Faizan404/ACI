const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const message = document.getElementById('message');
const subMessage = document.getElementById('sub-message');

// Game constants
const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;
const GRAVITY = 0.25;
const JUMP = -4.5;
const PIPE_SPEED = 2;
const PIPE_GAP = 120;
const PIPE_WIDTH = 50;
const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Game state
let gameState = 'START'; // START, PLAYING, GAME_OVER
let score = 0;
let frames = 0;

// Bird object
const bird = {
    x: 50,
    y: CANVAS_HEIGHT / 2,
    velocity: 0,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,

    draw() {
        ctx.fillStyle = '#f7d308';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Add a small eye
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 24, this.y + 5, 4, 4);
    },

    update() {
        if (gameState === 'PLAYING') {
            this.velocity += GRAVITY;
            this.y += this.velocity;
        }

        // Ceiling collision
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }

        // Ground collision
        if (this.y + this.height > CANVAS_HEIGHT) {
            this.y = CANVAS_HEIGHT - this.height;
            if (gameState === 'PLAYING') gameOver();
        }
    },

    flap() {
        this.velocity = JUMP;
    },

    reset() {
        this.y = CANVAS_HEIGHT / 2;
        this.velocity = 0;
    }
};

// Pipes array
let pipes = [];

function createPipe() {
    const minPipeHeight = 50;
    const maxPipeHeight = CANVAS_HEIGHT - PIPE_GAP - minPipeHeight;
    const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;

    pipes.push({
        x: CANVAS_WIDTH,
        topHeight: topHeight,
        passed: false
    });
}

function updatePipes() {
    if (gameState !== 'PLAYING') return;

    if (frames % 100 === 0) {
        createPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= PIPE_SPEED;

        // Collision detection
        if (
            bird.x < p.x + PIPE_WIDTH &&
            bird.x + bird.width > p.x &&
            (bird.y < p.topHeight || bird.y + bird.height > p.topHeight + PIPE_GAP)
        ) {
            gameOver();
        }

        // Score update
        if (!p.passed && bird.x > p.x + PIPE_WIDTH) {
            p.passed = true;
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
        }

        // Remove off-screen pipes
        if (p.x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
        }
    }
}

function drawPipes() {
    ctx.fillStyle = '#2e8b57';
    pipes.forEach(p => {
        // Top pipe
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
        // Bottom pipe
        ctx.fillRect(p.x, p.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - (p.topHeight + PIPE_GAP));
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    bird.update();
    updatePipes();

    drawPipes();
    bird.draw();

    frames++;
    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameState = 'PLAYING';
    score = 0;
    frames = 0;
    pipes = [];
    bird.reset();
    scoreDisplay.textContent = `Score: ${score}`;
    message.textContent = '';
    subMessage.textContent = '';
}

function gameOver() {
    gameState = 'GAME_OVER';
    message.textContent = 'Game Over';
    subMessage.textContent = 'Press Space to Restart';
}

// Input handling
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameState === 'START' || gameState === 'GAME_OVER') {
            startGame();
        } else if (gameState === 'PLAYING') {
            bird.flap();
        }
    }
});

// Also handle click/touch for better experience
canvas.addEventListener('mousedown', () => {
    if (gameState === 'START' || gameState === 'GAME_OVER') {
        startGame();
    } else if (gameState === 'PLAYING') {
        bird.flap();
    }
});

gameLoop();
