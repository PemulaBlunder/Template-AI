// =====================
// TETRIS OOP IMPLEMENTATION
// =====================

// Konfigurasi konstanta
class Config {
  static COLS = 10;
  static ROWS = 20;
  static BLOCK = 32;

  static COLORS = {
    I: "#00e5ff",
    O: "#ffd500",
    T: "#b45cff",
    S: "#2ee59d",
    Z: "#ff3d5a",
    J: "#2e6bff",
    L: "#ff8a00",
    X: "#0a0f1d",
  };

  static SHAPES = {
    I: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    O: [
      [1, 1],
      [1, 1],
    ],
    T: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    S: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    J: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    L: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
  };

  static BAG = ["I", "O", "T", "S", "Z", "J", "L"];
  //static BASE_DROP_INTERVAL = 700;
  //static MIN_DROP_INTERVAL = 120;
  static DROP_SPEED_DECREASE = 60;
  static LINES_PER_LEVEL = 10;
  static LINE_SCORES = [0, 100, 300, 500, 800];

  static DIFFICULTY = {
    EASY: {
      BASE_DROP: 900,
      MIN_DROP: 200,
    },
    NORMAL: {
      BASE_DROP: 700,
      MIN_DROP: 120,
    },
    HARD: {
      BASE_DROP: 500,
      MIN_DROP: 80,
    },
  };
}

// Class untuk mengelola piece/tetromino
class Piece {
  constructor(type) {
    this.type = type;
    this.shape = this.cloneMatrix(Config.SHAPES[type]);
    this.x = Math.floor((Config.COLS - this.shape[0].length) / 2);
    this.y = -1;
  }

  cloneMatrix(matrix) {
    return matrix.map((row) => row.slice());
  }

  rotateCW() {
    const N = this.shape.length;
    const M = this.shape[0].length;
    const result = Array.from({ length: M }, () => Array(N).fill(0));

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < M; c++) {
        result[c][N - 1 - r] = this.shape[r][c];
      }
    }
    return result;
  }

  rotateCCW() {
    const N = this.shape.length;
    const M = this.shape[0].length;
    const result = Array.from({ length: M }, () => Array(N).fill(0));

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < M; c++) {
        result[M - 1 - c][r] = this.shape[r][c];
      }
    }
    return result;
  }

  static random() {
    const type = Config.BAG[Math.floor(Math.random() * Config.BAG.length)];
    return new Piece(type);
  }
}

// Class untuk mengelola grid/papan permainan
class Grid {
  constructor() {
    this.cells = this.create();
  }

  create() {
    return Array.from({ length: Config.ROWS }, () =>
      Array(Config.COLS).fill("X")
    );
  }

  reset() {
    this.cells = this.create();
  }

  isInside(x, y) {
    return x >= 0 && x < Config.COLS && y < Config.ROWS;
  }

  isOccupied(x, y) {
    return y >= 0 && this.cells[y][x] !== "X";
  }

  mergePiece(piece) {
    const { shape, type, x, y } = piece;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;

        const cellX = x + c;
        const cellY = y + r;

        if (cellY >= 0) {
          this.cells[cellY][cellX] = type;
        }
      }
    }
  }

  clearLines() {
    let cleared = 0;

    outer: for (let r = Config.ROWS - 1; r >= 0; r--) {
      for (let c = 0; c < Config.COLS; c++) {
        if (this.cells[r][c] === "X") continue outer;
      }

      this.cells.splice(r, 1);
      this.cells.unshift(Array(Config.COLS).fill("X"));
      cleared++;
      r++;
    }

    return cleared;
  }
}

// Class untuk collision detection
class CollisionDetector {
  constructor(grid) {
    this.grid = grid;
  }

  check(piece, dx = 0, dy = 0, customShape = null) {
    const shape = customShape || piece.shape;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;

        const nx = piece.x + c + dx;
        const ny = piece.y + r + dy;

        if (!this.grid.isInside(nx, ny)) return true;
        if (this.grid.isOccupied(nx, ny)) return true;
      }
    }

    return false;
  }
}

// Class untuk scoring system
class ScoreManager {
  constructor(difficulty) {
    this.difficulty = difficulty;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.best = Number(localStorage.getItem("tetris_best") || 0);
  }

  reset() {
    this.score = 0;
    this.lines = 0;
    this.level = 1;
  }

  addLines(cleared) {
    if (cleared === 0) return;

    const lineScore = Config.LINE_SCORES[cleared] || 0;
    this.score += lineScore * this.level;
    this.lines += cleared;

    const newLevel = Math.floor(this.lines / Config.LINES_PER_LEVEL) + 1;
    return newLevel !== this.level ? newLevel : null;
  }

  addSoftDrop() {
    this.score += 1;
    this.updateBest();
  }

  addHardDrop(distance) {
    this.score += distance * 2;
    this.updateBest();
  }

  updateBest() {
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem("tetris_best", String(this.best));
    }
  }

  getDropInterval() {
    const diff = Config.DIFFICULTY[this.difficulty];

    return Math.max(
      diff.MIN_DROP,
      diff.BASE_DROP - (this.level - 1) * Config.DROP_SPEED_DECREASE
    );
  }
}

// Class untuk rendering
class Renderer {
  constructor(boardCanvas, nextCanvas) {
    this.boardCanvas = boardCanvas;
    this.nextCanvas = nextCanvas;
    this.ctx = boardCanvas.getContext("2d");
    this.nctx = nextCanvas.getContext("2d");
  }

  clearCanvas(context, width, height) {
    context.fillStyle = "#081022";
    context.fillRect(0, 0, width, height);
  }

  drawCell(context, x, y, color, size = Config.BLOCK) {
    context.fillStyle = color;
    context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  }

  drawGridLines() {
    this.ctx.strokeStyle = "rgba(29,42,74,.35)";
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= Config.COLS; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * Config.BLOCK, 0);
      this.ctx.lineTo(x * Config.BLOCK, Config.ROWS * Config.BLOCK);
      this.ctx.stroke();
    }

    for (let y = 0; y <= Config.ROWS; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * Config.BLOCK);
      this.ctx.lineTo(Config.COLS * Config.BLOCK, y * Config.BLOCK);
      this.ctx.stroke();
    }
  }

  drawBoard(grid, currentPiece) {
    this.clearCanvas(this.ctx, this.boardCanvas.width, this.boardCanvas.height);
    this.drawGridLines();

    // Draw locked pieces
    for (let r = 0; r < Config.ROWS; r++) {
      for (let c = 0; c < Config.COLS; c++) {
        const type = grid.cells[r][c];
        if (type !== "X") {
          this.drawCell(this.ctx, c, r, Config.COLORS[type]);
        }
      }
    }

    // Draw current piece
    const { shape, x, y, type } = currentPiece;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;

        const px = x + c;
        const py = y + r;

        if (py >= 0) {
          this.drawCell(this.ctx, px, py, Config.COLORS[type]);
        }
      }
    }
  }

  drawNext(nextPiece) {
    this.clearCanvas(this.nctx, this.nextCanvas.width, this.nextCanvas.height);

    const { shape, type } = nextPiece;
    const size = 32;

    const offsetX = Math.floor((5 - shape[0].length) / 2);
    const offsetY = Math.floor((5 - shape.length) / 2);

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        this.drawCell(
          this.nctx,
          offsetX + c,
          offsetY + r,
          Config.COLORS[type],
          size
        );
      }
    }
  }

  drawGameOver() {
    this.ctx.fillStyle = "rgba(0,0,0,.55)";
    this.ctx.fillRect(0, 0, this.boardCanvas.width, this.boardCanvas.height);

    this.ctx.fillStyle = "#fff";
    this.ctx.textAlign = "center";
    this.ctx.font = "bold 34px ui-sans-serif, system-ui";
    this.ctx.fillText(
      "GAME OVER",
      this.boardCanvas.width / 2,
      this.boardCanvas.height / 2 - 10
    );

    this.ctx.font = "14px ui-sans-serif, system-ui";
    this.ctx.fillText(
      "Tekan R untuk restart",
      this.boardCanvas.width / 2,
      this.boardCanvas.height / 2 + 20
    );
  }
}

// Main Game class
class TetrisGame {
  constructor() {
    this.initDOM();
    this.initComponents();
    this.initState();
    this.setupEventListeners();
    this.setDifficulty("NORMAL");
    this.reset();
  }

  initDOM() {
    this.elements = {
      boardCanvas: document.getElementById("board"),
      nextCanvas: document.getElementById("next"),
      score: document.getElementById("score"),
      lines: document.getElementById("lines"),
      level: document.getElementById("level"),
      best: document.getElementById("best"),
      status: document.getElementById("status"),
      btnStart: document.getElementById("btnStart"),
      btnPause: document.getElementById("btnPause"),
      btnRestart: document.getElementById("btnRestart"),
    };
  }

  initComponents() {
    this.grid = new Grid();
    this.scoreManager = new ScoreManager(this.difficulty);
    this.collisionDetector = new CollisionDetector(this.grid);
    this.renderer = new Renderer(
      this.elements.boardCanvas,
      this.elements.nextCanvas
    );
  }

  initState() {
    this.running = false;
    this.paused = false;
    this.gameOver = false;
    this.lastTime = 0;
    this.dropAcc = 0;
  }

  reset() {
    this.grid.reset();
    this.scoreManager.reset();
    this.initState();

    this.currentPiece = Piece.random();
    this.nextPiece = Piece.random();

    this.updateHUD();
    this.setStatus("Ready");
    this.render();
  }

  start() {
    if (this.gameOver) this.reset();

    if (!this.running) {
      this.running = true;
      this.paused = false;
      this.setStatus("Playing");
      this.lastTime = performance.now();
      this.dropAcc = 0;
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  togglePause() {
    if (!this.running && !this.paused) return;

    this.paused = !this.paused;
    this.setStatus(this.paused ? "Paused" : "Playing");

    if (!this.paused) {
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  loop(now) {
    if (!this.running || this.paused) return;

    const dt = now - this.lastTime;
    this.lastTime = now;

    this.dropAcc += dt;
    const dropInterval = this.scoreManager.getDropInterval();

    if (this.dropAcc >= dropInterval) {
      this.stepDown();
      this.dropAcc = 0;
    }

    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  stepDown() {
    if (!this.collisionDetector.check(this.currentPiece, 0, 1)) {
      this.currentPiece.y++;
    } else {
      this.lockPiece();
    }
  }

  lockPiece() {
    this.grid.mergePiece(this.currentPiece);

    const cleared = this.grid.clearLines();
    const newLevel = this.scoreManager.addLines(cleared);

    if (newLevel) {
      this.scoreManager.level = newLevel;
    }

    this.scoreManager.updateBest();
    this.updateHUD();

    this.currentPiece = this.nextPiece;
    this.nextPiece = Piece.random();

    if (this.collisionDetector.check(this.currentPiece, 0, 0)) {
      this.endGame();
    }
  }

  endGame() {
    this.running = false;
    this.gameOver = true;
    this.setStatus("Game Over");
    this.scoreManager.updateBest();
    this.updateHUD();
    this.render(true);

    sendScoreToServer(this.scoreManager.score);
  }

  moveLeft() {
    if (!this.canMove()) return;
    if (!this.collisionDetector.check(this.currentPiece, -1, 0)) {
      this.currentPiece.x--;
    }
  }

  moveRight() {
    if (!this.canMove()) return;
    if (!this.collisionDetector.check(this.currentPiece, 1, 0)) {
      this.currentPiece.x++;
    }
  }

  softDrop() {
    if (!this.canMove()) return;
    if (!this.collisionDetector.check(this.currentPiece, 0, 1)) {
      this.currentPiece.y++;
      this.scoreManager.addSoftDrop();
      this.updateHUD();
    }
  }

  hardDrop() {
    if (!this.canMove()) return;

    let distance = 0;
    while (!this.collisionDetector.check(this.currentPiece, 0, distance + 1)) {
      distance++;
    }

    this.currentPiece.y += distance;
    this.scoreManager.addHardDrop(distance);
    this.lockPiece();
  }

  rotate(direction) {
    if (!this.canMove()) return;

    const rotated =
      direction === "CW"
        ? this.currentPiece.rotateCW()
        : this.currentPiece.rotateCCW();

    const kicks = [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: -1 },
    ];

    for (const kick of kicks) {
      if (
        !this.collisionDetector.check(
          this.currentPiece,
          kick.x,
          kick.y,
          rotated
        )
      ) {
        this.currentPiece.shape = rotated;
        this.currentPiece.x += kick.x;
        this.currentPiece.y += kick.y;
        return;
      }
    }
  }

  canMove() {
    return this.running && !this.paused && !this.gameOver;
  }

  render(showGameOver = false) {
    this.renderer.drawBoard(this.grid, this.currentPiece);
    this.renderer.drawNext(this.nextPiece);

    if (showGameOver) {
      this.renderer.drawGameOver();
    }
  }

  updateHUD() {
    this.elements.score.textContent = this.scoreManager.score;
    this.elements.lines.textContent = this.scoreManager.lines;
    this.elements.level.textContent = this.scoreManager.level;
    this.elements.best.textContent = this.scoreManager.best;
  }

  setStatus(text) {
    this.elements.status.textContent = text;
  }

  setupEventListeners() {
    this.elements.btnStart.addEventListener("click", () => this.start());
    this.elements.btnPause.addEventListener("click", () => this.togglePause());
    this.elements.btnRestart.addEventListener("click", () => {
      this.reset();
      this.start();
    });

    const diffButtons = document.querySelectorAll(".difficulty-btn");

    diffButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const diff = btn.dataset.diff;

        this.setDifficulty(diff);

        diffButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }

  handleKeyDown(e) {
    const key = e.key.toLowerCase();

    if (key === "p") {
      this.togglePause();
      return;
    }

    if (key === "r") {
      this.reset();
      this.start();
      return;
    }

    if (!this.canMove()) return;

    switch (key) {
      case "arrowleft":
        this.moveLeft();
        break;
      case "arrowright":
        this.moveRight();
        break;
      case "arrowdown":
        this.softDrop();
        break;
      case " ":
      case "spacebar":
        this.hardDrop();
        break;
      case "arrowup":
      case "x":
        this.rotate("CW");
        break;
      case "z":
        this.rotate("CCW");
        break;
    }
  }

  setDifficulty(diff) {
    if (this.running) return;

    this.difficulty = diff;
    this.scoreManager.difficulty = diff;
    this.setStatus(`Difficulty: ${diff}`);
  }
}

// API: SAVE SCORE TO SERVER
function sendScoreToServer(score) {
  console.log("🚀 Sending score:", score);

  fetch("/osaindiasnjd/Game/save_score.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "same-origin",
    body: JSON.stringify({
      game: "tetris",
      score: score
    })
  })
    .then((res) => {
      console.log("📡 Response status:", res.status);
      return res.text();
    })
    .then((text) => {
      console.log("📨 Raw response:", text);
    })
    .catch((err) => {
      console.error("🔥 Fetch error:", err);
    });
}


// Initialize game
const game = new TetrisGame();
