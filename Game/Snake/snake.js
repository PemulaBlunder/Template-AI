// =====================
// SNAKE OOP IMPLEMENTATION
// =====================

// Konfigurasi konstanta
class Config {
  static TILE = 20;
  static COLS = 21;
  static ROWS = 21;
  
  static DIFFICULTY = {
    EASY: {
      BASE_TPS: 8,
      MAX_TPS: 15,
      SPEED_INCREMENT: 0.5
    },
    NORMAL: {
      BASE_TPS: 10,
      MAX_TPS: 20,
      SPEED_INCREMENT: 1
    },
    HARD: {
      BASE_TPS: 13,
      MAX_TPS: 25,
      SPEED_INCREMENT: 1.5
    }
  };
  
  static COLORS = {
    background: '#081022',
    grid: 'rgba(29,42,74,.35)',
    food: '#ff3d5a',
    snakeHead: '#7cff6b',
    snakeBody: '#2ee59d'
  };
  
  static SCORE_PER_FOOD = 10;
  static SCORE_FOR_SPEED_UP = 50;
}

// Class untuk mengelola Snake
class Snake {
  constructor(startX, startY) {
    this.segments = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
  }

  getHead() {
    return this.segments[0];
  }

  setDirection(newDir) {
    // Cegah balik arah
    if (newDir.x === -this.direction.x && newDir.y === -this.direction.y) {
      return false;
    }
    this.nextDirection = newDir;
    return true;
  }

  move() {
    this.direction = this.nextDirection;
    const head = this.getHead();
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };
    this.segments.unshift(newHead);
  }

  removeTail() {
    this.segments.pop();
  }

  grow() {
    // Tidak perlu removeTail(), jadi snake bertambah panjang
  }

  checkSelfCollision() {
    const head = this.getHead();
    return this.segments.some((seg, idx) => 
      idx !== 0 && seg.x === head.x && seg.y === head.y
    );
  }

  contains(x, y) {
    return this.segments.some(seg => seg.x === x && seg.y === y);
  }
}

// Class untuk mengelola Food
class Food {
  constructor() {
    this.position = null;
  }

  spawn(snake) {
    let newPos;
    do {
      newPos = {
        x: Math.floor(Math.random() * Config.COLS),
        y: Math.floor(Math.random() * Config.ROWS)
      };
    } while (snake.contains(newPos.x, newPos.y));
    
    this.position = newPos;
  }

  isEaten(x, y) {
    return this.position && this.position.x === x && this.position.y === y;
  }
}

// Class untuk collision detection
class CollisionDetector {
  checkWallCollision(x, y) {
    return x < 0 || x >= Config.COLS || y < 0 || y >= Config.ROWS;
  }

  checkCollision(snake) {
    const head = snake.getHead();
    
    // Cek tabrak tembok
    if (this.checkWallCollision(head.x, head.y)) {
      return true;
    }
    
    // Cek tabrak badan sendiri
    if (snake.checkSelfCollision()) {
      return true;
    }
    
    return false;
  }
}

// Class untuk scoring system
class ScoreManager {
  constructor(difficulty) {
    this.difficulty = difficulty;
    this.score = 0;
    this.best = Number(localStorage.getItem('snake_best') || 0);
    this.tps = Config.DIFFICULTY[difficulty].BASE_TPS;
  }

  reset() {
    this.score = 0;
    this.tps = Config.DIFFICULTY[this.difficulty].BASE_TPS;
  }

  addScore() {
    this.score += Config.SCORE_PER_FOOD;
    
    // Update speed
    if (this.score % Config.SCORE_FOR_SPEED_UP === 0) {
      const maxTPS = Config.DIFFICULTY[this.difficulty].MAX_TPS;
      const increment = Config.DIFFICULTY[this.difficulty].SPEED_INCREMENT;
      this.tps = Math.min(this.tps + increment, maxTPS);
    }
    
    this.updateBest();
  }

  updateBest() {
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('snake_best', String(this.best));
    }
  }

  getTickInterval() {
    return 1 / this.tps;
  }
}

// Class untuk rendering
class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  clear() {
    this.ctx.fillStyle = Config.COLORS.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    this.ctx.strokeStyle = Config.COLORS.grid;
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= Config.COLS; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * Config.TILE, 0);
      this.ctx.lineTo(x * Config.TILE, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= Config.ROWS; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * Config.TILE);
      this.ctx.lineTo(this.canvas.width, y * Config.TILE);
      this.ctx.stroke();
    }
  }

  drawFood(food) {
    if (!food.position) return;
    
    this.ctx.fillStyle = Config.COLORS.food;
    this.ctx.beginPath();
    this.roundRect(
      food.position.x * Config.TILE + 3,
      food.position.y * Config.TILE + 3,
      Config.TILE - 6,
      Config.TILE - 6,
      6
    );
    this.ctx.fill();
  }

  drawSnake(snake) {
    snake.segments.forEach((seg, i) => {
      this.ctx.fillStyle = i === 0 
        ? Config.COLORS.snakeHead 
        : Config.COLORS.snakeBody;
      this.ctx.beginPath();
      this.roundRect(
        seg.x * Config.TILE + 2,
        seg.y * Config.TILE + 2,
        Config.TILE - 4,
        Config.TILE - 4,
        6
      );
      this.ctx.fill();
    });
  }

  drawGameOver() {
    this.ctx.fillStyle = 'rgba(0,0,0,.55)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 26px ui-sans-serif, system-ui';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'GAME OVER',
      this.canvas.width / 2,
      this.canvas.height / 2 - 10
    );
    
    this.ctx.font = '14px ui-sans-serif, system-ui';
    this.ctx.fillText(
      'Tekan R untuk restart',
      this.canvas.width / 2,
      this.canvas.height / 2 + 18
    );
  }

  roundRect(x, y, w, h, r) {
    if (!this.ctx.roundRect) {
      // Polyfill untuk browser lama
      r = Math.min(r, w / 2, h / 2);
      this.ctx.beginPath();
      this.ctx.moveTo(x + r, y);
      this.ctx.arcTo(x + w, y, x + w, y + h, r);
      this.ctx.arcTo(x + w, y + h, x, y + h, r);
      this.ctx.arcTo(x, y + h, x, y, r);
      this.ctx.arcTo(x, y, x + w, y, r);
      this.ctx.closePath();
    } else {
      this.ctx.roundRect(x, y, w, h, r);
    }
  }

  render(snake, food, gameOver = false) {
    this.clear();
    this.drawGrid();
    this.drawFood(food);
    this.drawSnake(snake);
    
    if (gameOver) {
      this.drawGameOver();
    }
  }
}

// Main Game class
class SnakeGame {
  constructor() {
    this.initDOM();
    this.setDifficulty('NORMAL');
    this.initComponents();
    this.initState();
    this.setupEventListeners();
    this.reset();
  }

  initDOM() {
    this.elements = {
      canvas: document.getElementById('game'),
      score: document.getElementById('score'),
      best: document.getElementById('best'),
      status: document.getElementById('status'),
      btnStart: document.getElementById('btnStart'),
      btnPause: document.getElementById('btnPause'),
      btnRestart: document.getElementById('btnRestart')
    };
  }

  initComponents() {
    this.renderer = new Renderer(this.elements.canvas);
    this.collisionDetector = new CollisionDetector();
    this.scoreManager = new ScoreManager(this.difficulty);
  }

  initState() {
    this.running = false;
    this.paused = false;
    this.gameOver = false;
    this.lastTime = 0;
    this.acc = 0;
  }

  reset() {
    this.initState();
    this.scoreManager.reset();
    
    const startX = Math.floor(Config.COLS / 2);
    const startY = Math.floor(Config.ROWS / 2);
    
    this.snake = new Snake(startX, startY);
    this.food = new Food();
    this.food.spawn(this.snake);
    
    this.updateHUD();
    this.setStatus('Ready');
    this.renderer.render(this.snake, this.food);
  }

  start() {
    if (this.gameOver) this.reset();
    
    if (!this.running) {
      this.running = true;
      this.paused = false;
      this.setStatus('Playing');
      this.lastTime = performance.now();
      this.acc = 0;
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  togglePause() {
    if (!this.running && !this.paused) return;
    
    this.paused = !this.paused;
    this.setStatus(this.paused ? 'Paused' : 'Playing');
    
    if (!this.paused) {
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  loop(now) {
    if (!this.running || this.paused) return;
    
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    
    this.acc += dt;
    const step = this.scoreManager.getTickInterval();
    
    while (this.acc >= step) {
      this.update();
      this.acc -= step;
      if (this.gameOver) break;
    }
    
    this.renderer.render(this.snake, this.food, this.gameOver);
    
    if (!this.gameOver) {
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  update() {
    this.snake.move();
    
    // Cek collision
    if (this.collisionDetector.checkCollision(this.snake)) {
      this.endGame();
      return;
    }
    
    const head = this.snake.getHead();
    
    // Cek makan food
    if (this.food.isEaten(head.x, head.y)) {
      this.scoreManager.addScore();
      this.updateHUD();
      this.snake.grow();
      this.food.spawn(this.snake);
    } else {
      this.snake.removeTail();
    }
  }

  endGame() {
    this.running = false;
    this.gameOver = true;
    this.setStatus('Game Over');
    this.scoreManager.updateBest();
    this.updateHUD();
    
    sendScoreToServer(this.scoreManager.score);
  }

  updateHUD() {
    this.elements.score.textContent = this.scoreManager.score;
    this.elements.best.textContent = this.scoreManager.best;
  }

  setStatus(text) {
    this.elements.status.textContent = text;
  }

  setDifficulty(diff) {
    if (this.running) return;
    
    this.difficulty = diff;
    if (this.scoreManager) {
      this.scoreManager.difficulty = diff;
    }
    this.setStatus(`Difficulty: ${diff}`);
  }

  setupEventListeners() {
    this.elements.btnStart.addEventListener('click', () => this.start());
    this.elements.btnPause.addEventListener('click', () => this.togglePause());
    this.elements.btnRestart.addEventListener('click', () => {
      this.reset();
      this.start();
    });

    const diffButtons = document.querySelectorAll('.difficulty-btn');
    diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const diff = btn.dataset.diff;
        this.setDifficulty(diff);
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  handleKeyDown(e) {
    const key = e.key.toLowerCase();
    
    if (key === 'p') {
      this.togglePause();
      return;
    }
    
    if (key === 'r') {
      this.reset();
      this.start();
      return;
    }
    
    if (!this.running || this.paused || this.gameOver) return;
    
    switch (key) {
      case 'arrowup':
      case 'w':
        this.snake.setDirection({ x: 0, y: -1 });
        break;
      case 'arrowdown':
      case 's':
        this.snake.setDirection({ x: 0, y: 1 });
        break;
      case 'arrowleft':
      case 'a':
        this.snake.setDirection({ x: -1, y: 0 });
        break;
      case 'arrowright':
      case 'd':
        this.snake.setDirection({ x: 1, y: 0 });
        break;
    }
  }
}

// API: SAVE SCORE TO SERVER
function sendScoreToServer(score) {
  console.log('🚀 Sending score:', score);
  
  fetch('/osaindiasnjd/Game/save_score.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      game: 'snake',
      score: score
    })
  })
    .then(res => {
      console.log('📡 Response status:', res.status);
      return res.text();
    })
    .then(text => {
      console.log('📨 Raw response:', text);
    })
    .catch(err => {
      console.error('🔥 Fetch error:', err);
    });
}

// Initialize game
const game = new SnakeGame();