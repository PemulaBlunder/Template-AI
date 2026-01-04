class BaseScoreManager {
  constructor(difficulty, gameKey) {
    this.difficulty = difficulty;
    this.gameKey = gameKey;
    this.score = 0;
    this.best = this.loadBestScore();
  }

  /**
   * Reset score ke nilai awal
   */
  reset() {
    this.score = 0;
  }

  /**
   * Update best score jika score saat ini lebih tinggi
   */
  updateBest() {
    if (this.score > this.best) {
      this.best = this.score;
      this.saveBestScore();
    }
  }

  /**
   * Load best score dari localStorage
   */
  loadBestScore() {
    const key = this.getStorageKey();
    return Number(localStorage.getItem(key) || 0);
  }

  /**
   * Save best score ke localStorage
   */
  saveBestScore() {
    const key = this.getStorageKey();
    localStorage.setItem(key, String(this.best));
  }

  /**
   * Get storage key untuk localStorage
   * Harus diimplementasi oleh subclass
   */
  getStorageKey() {
    return `${this.gameKey}_best`;
  }

  /**
   * Format score untuk display
   */
  formatScore(score) {
    return parseInt(score).toLocaleString('id-ID');
  }

  /**
   * Get game interval/speed - abstract method
   * Harus diimplementasi oleh subclass
   */
  getGameInterval() {
    throw new Error('getGameInterval() must be implemented by subclass');
  }
}

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