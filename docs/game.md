---
title: Snake Game | Alessandro Sanvito
layout: default
permalink: /game/
---

<div class="game-container">
  <h1>Snake Game</h1>
  <p class="game-description">Take a break and play a classic game of Snake! On desktop use the arrow keys; on a phone, swipe on the board or use the on-screen pad below. Eat the food to grow longer.</p>
  
  <div class="game-wrapper">
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    <div class="game-controls">
      <div class="score">Score: <span id="score">0</span></div>
      <button id="startButton">Start Game</button>
      <button id="resetButton">Reset Game</button>
    </div>

    <div class="dpad" id="dpad" aria-label="Directional controls">
      <button class="dpad-btn dpad-up" data-dir="up" aria-label="Move up">&#9650;</button>
      <button class="dpad-btn dpad-left" data-dir="left" aria-label="Move left">&#9664;</button>
      <button class="dpad-btn dpad-right" data-dir="right" aria-label="Move right">&#9654;</button>
      <button class="dpad-btn dpad-down" data-dir="down" aria-label="Move down">&#9660;</button>
    </div>
  </div>
</div>

<script>
// Game constants
const GRID_SIZE = 20;
const GAME_SPEED = 100;
const CANVAS_SIZE = 400;

// Game variables
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameInterval;
let score = 0;
let gameStarted = false;
let listenersBound = false;

// Initialize game
function initGame() {
  canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }
  
  ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get canvas context!');
    return;
  }
  
  // Initialize snake
  snake = [
    {x: 5, y: 5},
    {x: 4, y: 5},
    {x: 3, y: 5}
  ];
  
  // Initialize food
  generateFood();
  
  // Set up event listeners once (initGame also runs on reset)
  if (!listenersBound) {
    document.addEventListener('keydown', handleKeyPress);

    canvas.addEventListener('touchstart', handleTouchStart, {passive: false});
    canvas.addEventListener('touchmove', handleTouchMove, {passive: false});
    canvas.addEventListener('touchend', handleTouchEnd, {passive: false});

    // On-screen directional pad (taps and presses)
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      const dir = btn.getAttribute('data-dir');
      const press = (e) => { e.preventDefault(); setDirection(dir); };
      btn.addEventListener('click', press);
      btn.addEventListener('touchstart', press, {passive: false});
    });

    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');

    if (startButton) {
      startButton.addEventListener('click', startGame);
    }

    if (resetButton) {
      resetButton.addEventListener('click', resetGame);
    }

    listenersBound = true;
  }
  
  // Draw initial state
  draw();
}

// Generate food at random position
function generateFood() {
  food = {
    x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
    y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
  };
  
  // Make sure food doesn't appear on snake
  while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    food = {
      x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
    };
  }
}

// Opposite directions can't be entered (no 180° turns)
const OPPOSITE = {up: 'down', down: 'up', left: 'right', right: 'left'};

// Apply a direction change from any input source (keyboard, swipe, d-pad)
function setDirection(dir) {
  if (!gameStarted) return;
  if (OPPOSITE[dir] !== direction) {
    nextDirection = dir;
  }
}

// Handle keyboard input
function handleKeyPress(e) {
  if (!gameStarted) return;
  
  switch(e.key) {
    case 'ArrowUp':
      setDirection('up');
      e.preventDefault();
      break;
    case 'ArrowDown':
      setDirection('down');
      e.preventDefault();
      break;
    case 'ArrowLeft':
      setDirection('left');
      e.preventDefault();
      break;
    case 'ArrowRight':
      setDirection('right');
      e.preventDefault();
      break;
  }
}

// Handle swipe gestures on the canvas (touch devices)
let touchStartX = 0;
let touchStartY = 0;
let touchActive = false;

function handleTouchStart(e) {
  const t = e.changedTouches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
  touchActive = true;
  // Prevent the page from scrolling while swiping on the board
  e.preventDefault();
}

function handleTouchMove(e) {
  if (touchActive) e.preventDefault();
}

function handleTouchEnd(e) {
  if (!touchActive) return;
  touchActive = false;

  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  // Ignore tiny movements (treat as a tap, not a swipe)
  if (Math.max(absX, absY) < 20) return;

  if (absX > absY) {
    setDirection(dx > 0 ? 'right' : 'left');
  } else {
    setDirection(dy > 0 ? 'down' : 'up');
  }
  e.preventDefault();
}

// Move snake
function moveSnake() {
  direction = nextDirection;
  const head = {x: snake[0].x, y: snake[0].y};
  
  switch(direction) {
    case 'up':
      head.y--;
      break;
    case 'down':
      head.y++;
      break;
    case 'left':
      head.x--;
      break;
    case 'right':
      head.x++;
      break;
  }
  
  // Check for collisions
  if (checkCollision(head)) {
    gameOver();
    return;
  }
  
  snake.unshift(head);
  
  // Check if snake ate food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.textContent = score;
    }
    generateFood();
  } else {
    snake.pop();
  }
}

// Check for collisions
function checkCollision(head) {
  // Wall collision
  if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE ||
      head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
    return true;
  }
  
  // Self collision
  return snake.some(segment => segment.x === head.x && segment.y === head.y);
}

// Draw game state
function draw() {
  if (!ctx || !canvas) return;
  
  // Clear canvas
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw snake
  snake.forEach((segment, index) => {
    // Make head slightly darker
    ctx.fillStyle = index === 0 ? '#388E3C' : '#4CAF50';
    ctx.fillRect(
      segment.x * GRID_SIZE,
      segment.y * GRID_SIZE,
      GRID_SIZE - 1,
      GRID_SIZE - 1
    );
  });
  
  // Draw food
  ctx.fillStyle = '#FF5722';
  ctx.fillRect(
    food.x * GRID_SIZE,
    food.y * GRID_SIZE,
    GRID_SIZE - 1,
    GRID_SIZE - 1
  );
}

// Game loop
function gameLoop() {
  moveSnake();
  draw();
}

// Start game
function startGame() {
  const startButton = document.getElementById('startButton');
  if (!startButton) return;
  
  if (!gameStarted) {
    gameStarted = true;
    startButton.textContent = 'Pause Game';
    gameInterval = setInterval(gameLoop, GAME_SPEED);
  } else {
    gameStarted = false;
    startButton.textContent = 'Resume Game';
    clearInterval(gameInterval);
  }
}

// Reset game
function resetGame() {
  clearInterval(gameInterval);
  gameStarted = false;
  score = 0;
  
  const scoreElement = document.getElementById('score');
  const startButton = document.getElementById('startButton');
  
  if (scoreElement) {
    scoreElement.textContent = score;
  }
  
  if (startButton) {
    startButton.textContent = 'Start Game';
  }
  
  direction = 'right';
  nextDirection = 'right';
  initGame();
}

// Game over
function gameOver() {
  clearInterval(gameInterval);
  gameStarted = false;
  
  const startButton = document.getElementById('startButton');
  if (startButton) {
    startButton.textContent = 'Start Game';
  }
  
  alert(`Game Over! Your score: ${score}`);
}

// Initialize game when page loads
window.addEventListener('load', initGame);
</script> 
