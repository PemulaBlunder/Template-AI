
// ========================================
// 3. SNAKE SCORE MANAGER
// ========================================

class SnakeScoreManager extends BaseScoreManager {
  constructor(difficulty) {
    super(difficulty, 'snake');
    
    const DIFFICULTY = {
      EASY: { BASE_TPS: 8, MAX_TPS: 15, SPEED_INCREMENT: 0.5 },
      NORMAL: { BASE_TPS: 10, MAX_TPS: 20, SPEED_INCREMENT: 1 },
      HARD: { BASE_TPS: 13, MAX_TPS: 25, SPEED_INCREMENT: 1.5 }
    };
    
    this.tps = DIFFICULTY[difficulty].BASE_TPS;
    this.difficultyConfig = DIFFICULTY[difficulty];
  }

  reset() {
    super.reset();
    this.tps = this.difficultyConfig.BASE_TPS;
  }

  /**
   * Tambah score saat makan food
   */
  addScore() {
    const SCORE_PER_FOOD = 10;
    const SCORE_FOR_SPEED_UP = 50;
    
    this.score += SCORE_PER_FOOD;
    
    // Update speed setiap kelipatan tertentu
    if (this.score % SCORE_FOR_SPEED_UP === 0) {
      this.tps = Math.min(
        this.tps + this.difficultyConfig.SPEED_INCREMENT,
        this.difficultyConfig.MAX_TPS
      );
    }
    
    this.updateBest();
  }

  /**
   * Get tick interval (waktu antar update)
   */
  getGameInterval() {
    return 1 / this.tps;
  }
}

// ========================================
// 4. BASE GAME CLASS
// ========================================

/**
 * Base class untuk semua game
 * Menghandle state management, game loop, dan lifecycle
 */
class BaseGame {
  constructor(gameKey) {
    this.gameKey = gameKey;
    this.running = false;
    this.paused = false;
    this.gameOver = false;
    this.lastTime = 0;
    this.accumulator = 0;
  }

  /**
   * Initialize DOM elements
   * Harus diimplementasi oleh subclass
   */
  initDOM() {
    throw new Error('initDOM() must be implemented by subclass');
  }

  /**
   * Initialize game components
   * Harus diimplementasi oleh subclass
   */
  initComponents() {
    throw new Error('initComponents() must be implemented by subclass');
  }

  /**
   * Initialize game state
   */
  initState() {
    this.running = false;
    this.paused = false;
    this.gameOver = false;
    this.lastTime = 0;
    this.accumulator = 0;
  }

  /**
   * Reset game ke state awal
   * Harus diimplementasi oleh subclass
   */
  reset() {
    throw new Error('reset() must be implemented by subclass');
  }

  /**
   * Start atau resume game
   */
  start() {
    if (this.gameOver) {
      this.reset();
    }

    if (!this.running) {
      this.running = true;
      this.paused = false;
      this.setStatus('Playing');
      this.lastTime = performance.now();
      this.accumulator = 0;
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    if (!this.running && !this.paused) return;

    this.paused = !this.paused;
    this.setStatus(this.paused ? 'Paused' : 'Playing');

    if (!this.paused) {
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  /**
   * Main game loop dengan fixed timestep
   */
  loop(now) {
    if (!this.running || this.paused) return;

    const deltaTime = now - this.lastTime;
    this.lastTime = now;

    this.accumulator += deltaTime;
    const interval = this.getUpdateInterval();

    // Fixed timestep update
    while (this.accumulator >= interval) {
      this.update();
      this.accumulator -= interval;
      
      if (this.gameOver) break;
    }

    this.render();

    if (!this.gameOver) {
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  /**
   * Get update interval dari score manager
   */
  getUpdateInterval() {
    return this.scoreManager.getGameInterval();
  }

  /**
   * Update game logic - abstract method
   * Harus diimplementasi oleh subclass
   */
  update() {
    throw new Error('update() must be implemented by subclass');
  }

  /**
   * Render game state - abstract method
   * Harus diimplementasi oleh subclass
   */
  render() {
    throw new Error('render() must be implemented by subclass');
  }

  /**
   * End game dan save score
   */
  endGame() {
    this.running = false;
    this.gameOver = true;
    this.setStatus('Game Over');
    this.scoreManager.updateBest();
    this.updateHUD();
    this.render();

    // Send score to server
    this.sendScoreToServer();
  }

  /**
   * Check apakah player bisa melakukan move
   */
  canMove() {
    return this.running && !this.paused && !this.gameOver;
  }

  /**
   * Update HUD display - abstract method
   * Harus diimplementasi oleh subclass
   */
  updateHUD() {
    throw new Error('updateHUD() must be implemented by subclass');
  }

  /**
   * Set status text
   */
  setStatus(text) {
    if (this.elements && this.elements.status) {
      this.elements.status.textContent = text;
    }
  }

  /**
   * Set difficulty dan reset score manager
   */
  setDifficulty(difficulty) {
    if (this.running) return;
    
    this.difficulty = difficulty;
    if (this.scoreManager) {
      this.scoreManager.difficulty = difficulty;
    }
    this.setStatus(`Difficulty: ${difficulty}`);
  }

  /**
   * Setup event listeners untuk controls
   */
  setupEventListeners() {
    // Button listeners
    if (this.elements.btnStart) {
      this.elements.btnStart.addEventListener('click', () => this.start());
    }
    
    if (this.elements.btnPause) {
      this.elements.btnPause.addEventListener('click', () => this.togglePause());
    }
    
    if (this.elements.btnRestart) {
      this.elements.btnRestart.addEventListener('click', () => {
        this.reset();
        this.start();
      });
    }

    // Difficulty buttons
    const diffButtons = document.querySelectorAll('.difficulty-btn');
    diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const diff = btn.dataset.diff;
        this.setDifficulty(diff);
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Keyboard controls
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  /**
   * Handle keyboard input - abstract method
   * Harus diimplementasi oleh subclass
   */
  handleKeyDown(e) {
    const key = e.key.toLowerCase();

    // Common controls
    if (key === 'p') {
      this.togglePause();
      return;
    }

    if (key === 'r') {
      this.reset();
      this.start();
      return;
    }

    // Game-specific controls handled by subclass
    this.handleGameKeyDown(e);
  }

  /**
   * Handle game-specific keyboard input
   * Harus diimplementasi oleh subclass
   */
  handleGameKeyDown(e) {
    throw new Error('handleGameKeyDown() must be implemented by subclass');
  }

  /**
   * Send score ke server
   */
  sendScoreToServer() {
    console.log('🚀 Sending score:', this.scoreManager.score);

    fetch('/osaindiasnjd/Game/save_score.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        game: this.gameKey,
        score: this.scoreManager.score
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
}

// ========================================
// 5. EXAMPLE: TETRIS GAME IMPLEMENTATION
// ========================================

class TetrisGame extends BaseGame {
  constructor() {
    super('tetris');
    this.initDOM();
    this.initComponents();
    this.initState();
    this.setupEventListeners();
    this.setDifficulty('NORMAL');
    this.reset();
  }

  initDOM() {
    this.elements = {
      boardCanvas: document.getElementById('board'),
      nextCanvas: document.getElementById('next'),
      score: document.getElementById('score'),
      lines: document.getElementById('lines'),
      level: document.getElementById('level'),
      best: document.getElementById('best'),
      status: document.getElementById('status'),
      btnStart: document.getElementById('btnStart'),
      btnPause: document.getElementById('btnPause'),
      btnRestart: document.getElementById('btnRestart')
    };
  }

  initComponents() {
    // Initialize Tetris-specific components
    // this.grid = new Grid();
    this.scoreManager = new TetrisScoreManager(this.difficulty);
    // this.collisionDetector = new CollisionDetector(this.grid);
    // this.renderer = new TetrisRenderer(this.elements.boardCanvas, this.elements.nextCanvas);
  }

  reset() {
    this.initState();
    this.scoreManager.reset();
    
    // Reset Tetris-specific state
    // this.grid.reset();
    // this.currentPiece = Piece.random();
    // this.nextPiece = Piece.random();
    
    this.updateHUD();
    this.setStatus('Ready');
    // this.render();
  }

  update() {
    // Tetris-specific update logic
    // this.stepDown();
  }

  render() {
    // Tetris-specific rendering
    // this.renderer.drawBoard(this.grid, this.currentPiece);
    // this.renderer.drawNext(this.nextPiece);
    
    if (this.gameOver) {
      // this.renderer.drawGameOver();
    }
  }

  updateHUD() {
    this.elements.score.textContent = this.scoreManager.score;
    this.elements.lines.textContent = this.scoreManager.lines;
    this.elements.level.textContent = this.scoreManager.level;
    this.elements.best.textContent = this.scoreManager.best;
  }

  handleGameKeyDown(e) {
    if (!this.canMove()) return;

    const key = e.key.toLowerCase();

    switch (key) {
      case 'arrowleft':
        // this.moveLeft();
        break;
      case 'arrowright':
        // this.moveRight();
        break;
      case 'arrowdown':
        // this.softDrop();
        break;
      case ' ':
      case 'spacebar':
        // this.hardDrop();
        break;
      case 'arrowup':
      case 'x':
        // this.rotate('CW');
        break;
      case 'z':
        // this.rotate('CCW');
        break;
    }
  }
}

// ========================================
// 6. EXAMPLE: SNAKE GAME IMPLEMENTATION
// ========================================

class SnakeGame extends BaseGame {
  constructor() {
    super('snake');
    this.initDOM();
    this.initComponents();
    this.initState();
    this.setupEventListeners();
    this.setDifficulty('NORMAL');
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
    // Initialize Snake-specific components
    this.scoreManager = new SnakeScoreManager(this.difficulty);
    // this.renderer = new SnakeRenderer(this.elements.canvas);
    // this.collisionDetector = new CollisionDetector();
  }

  reset() {
    this.initState();
    this.scoreManager.reset();
    
    // Reset Snake-specific state
    // const startX = Math.floor(Config.COLS / 2);
    // const startY = Math.floor(Config.ROWS / 2);
    // this.snake = new Snake(startX, startY);
    // this.food = new Food();
    // this.food.spawn(this.snake);
    
    this.updateHUD();
    this.setStatus('Ready');
    // this.render();
  }

  update() {
    // Snake-specific update logic
    // this.snake.move();
    
    // Check collision
    // if (this.collisionDetector.checkCollision(this.snake)) {
    //   this.endGame();
    //   return;
    // }
    
    // Check if eating food
    // const head = this.snake.getHead();
    // if (this.food.isEaten(head.x, head.y)) {
    //   this.scoreManager.addScore();
    //   this.updateHUD();
    //   this.snake.grow();
    //   this.food.spawn(this.snake);
    // } else {
    //   this.snake.removeTail();
    // }
  }

  render() {
    // Snake-specific rendering
    // this.renderer.render(this.snake, this.food, this.gameOver);
  }

  updateHUD() {
    this.elements.score.textContent = this.scoreManager.score;
    this.elements.best.textContent = this.scoreManager.best;
  }

  handleGameKeyDown(e) {
    if (!this.canMove()) return;

    const key = e.key.toLowerCase();

    switch (key) {
      case 'arrowup':
      case 'w':
        // this.snake.setDirection({ x: 0, y: -1 });
        break;
      case 'arrowdown':
      case 's':
        // this.snake.setDirection({ x: 0, y: 1 });
        break;
      case 'arrowleft':
      case 'a':
        // this.snake.setDirection({ x: -1, y: 0 });
        break;
      case 'arrowright':
      case 'd':
        // this.snake.setDirection({ x: 1, y: 0 });
        break;
    }
  }
}

// ========================================
// 7. USAGE EXAMPLE
// ========================================

/*
// Untuk Tetris
const tetrisGame = new TetrisGame();

// Untuk Snake
const snakeGame = new SnakeGame();
*/

// ========================================
// BENEFITS OF THIS ARCHITECTURE:
// ========================================
// ✅ DRY (Don't Repeat Yourself) - Kode umum di base class
// ✅ Maintainability - Mudah maintain dan update
// ✅ Extensibility - Mudah tambah game baru
// ✅ Consistency - Semua game punya behavior yang konsisten
// ✅ Testability - Lebih mudah untuk testing
// ✅ Single Responsibility - Setiap class punya tanggung jawab jelas