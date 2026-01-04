<?php
require_once 'databases/config.php';

// Cek apakah user sudah login
$isLoggedIn = isLoggedIn();
$user = null;

if ($isLoggedIn) {
    $user = getCurrentUser($pdo);
    redirect('homepage/homepage.php');
}
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome - Game Portal</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        /* Header/Navbar */
        .navbar {
            background: white;
            padding: 20px 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            margin-bottom: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .logo h1 {
            color: #667eea;
            font-size: 28px;
            font-weight: 700;
        }

        .logo span {
            font-size: 32px;
        }

        .nav-buttons {
            display: flex;
            gap: 15px;
            align-items: center;
        }

        .user-info-small {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 15px;
            background: #f0f0f0;
            border-radius: 25px;
        }

        .user-avatar-small {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #667eea;
        }

        .user-name {
            font-weight: 600;
            color: #333;
        }

        .btn {
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s;
            display: inline-block;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
        }

        .btn-secondary:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
        }

        .btn-dashboard {
            background: #28a745;
            color: white;
        }

        .btn-dashboard:hover {
            background: #218838;
            transform: translateY(-2px);
        }

        /* Hero Section */
        .hero {
            background: white;
            padding: 60px 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            margin-bottom: 40px;
            text-align: center;
        }

        .hero h2 {
            font-size: 48px;
            color: #333;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero p {
            font-size: 18px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }

        .hero-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        /* Games Grid */
        .section-title {
            color: white;
            font-size: 32px;
            text-align: center;
            margin-bottom: 30px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .games-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }

        .game-card {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            text-align: center;
            transition: all 0.3s;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
            display: block;
        }

        .game-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }

        .game-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }

        .game-card h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 24px;
        }

        .game-card p {
            color: #666;
            font-size: 14px;
            line-height: 1.6;
        }

        .play-button {
            margin-top: 20px;
            padding: 10px 25px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        .play-button:hover {
            transform: scale(1.05);
        }

        /* Features Section */
        .features {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            margin-bottom: 40px;
        }

        .features h3 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
            font-size: 28px;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
        }

        .feature-item {
            text-align: center;
        }

        .feature-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }

        .feature-item h4 {
            color: #333;
            margin-bottom: 10px;
            font-size: 18px;
        }

        .feature-item p {
            color: #666;
            font-size: 14px;
        }

        /* Footer */
        .footer {
            text-align: center;
            color: white;
            padding: 20px;
            margin-top: 40px;
        }

        .footer p {
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
            .navbar {
                flex-direction: column;
                text-align: center;
            }

            .hero h2 {
                font-size: 32px;
            }

            .hero p {
                font-size: 16px;
            }

            .nav-buttons {
                width: 100%;
                justify-content: center;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- Navbar -->
        <nav class="navbar">
            <div class="logo">
                <span>🎮</span>
                <h1>Game Portal</h1>
            </div>
            <div class="nav-buttons">
                <?php if ($isLoggedIn): ?>
                    <div class="user-info-small">
                        <img src="<?php echo file_exists($user['photo']) ? htmlspecialchars($user['photo']) : 'uploads/users/default.png'; ?>"
                            alt="Profile" class="user-avatar-small"
                            onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23667eea%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2240%22 font-family=%22Arial%22%3E<?php echo strtoupper(substr($user['username'], 0, 1)); ?>%3C/text%3E%3C/svg%3E'">
                        <span class="user-name"><?php echo htmlspecialchars($user['username']); ?></span>
                    </div>
                    <a href="homepage/homepage.php" class="btn btn-dashboard">Dashboard</a>
                <?php else: ?>
                    <a href="auth/login.php" class="btn btn-secondary">Login</a>
                    <a href="auth/register.php" class="btn btn-primary">Daftar</a>
                <?php endif; ?>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="hero">
            <h2>🎯 Selamat Datang di Game Portal</h2>
            <p>Mainkan berbagai game seru secara gratis! Tidak perlu login untuk bermain, tapi daftar untuk menyimpan
                skor dan bersaing di leaderboard.</p>
            <?php if (!$isLoggedIn): ?>
                <div class="hero-buttons">
                    <a href="auth/register.php" class="btn btn-primary">Daftar Sekarang</a>
                    <a href="auth/login.php" class="btn btn-secondary">Sudah Punya Akun?</a>
                </div>
            <?php endif; ?>
        </section>

        <!-- Games Section -->
        <h2 class="section-title">🎮 Pilih Game Favoritmu</h2>
        <div class="games-grid">
            <a href="Game/Tetoris/index_tetris.html" class="game-card">
                <div class="game-icon">🧱</div>
                <h3>Tetris</h3>
                <p>Game puzzle klasik yang menantang! Susun balok-balok untuk membuat baris sempurna.</p>
                <button class="play-button">Main Sekarang</button>
            </a>

            <a href="Game/Snake/index_snake.html" class="game-card">
                <div class="game-icon">🐍</div>
                <h3>Snake</h3>
                <p>Kendalikan ular untuk memakan makanan dan tumbuh semakin panjang tanpa menabrak dinding!</p>
                <button class="play-button">Main Sekarang</button>
            </a>

            <a href="leaderboard/leaderboard.html" class="game-card">
                <div class="game-icon">🏆</div>
                <h3>Leaderboard</h3>
                <p>Lihat peringkat pemain terbaik dan bandingkan skor Anda dengan pemain lain!</p>
                <button class="play-button">Lihat Peringkat</button>
            </a>
        </div>

        <!-- Features Section -->
        <section class="features">
            <h3>✨ Kenapa Harus Daftar?</h3>
            <div class="features-grid">
                <div class="feature-item">
                    <div class="feature-icon">💾</div>
                    <h4>Simpan Progres</h4>
                    <p>Skor dan pencapaian Anda akan tersimpan</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🏆</div>
                    <h4>Kompetisi</h4>
                    <p>Bersaing di leaderboard global</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🎯</div>
                    <h4>Achievement</h4>
                    <p>Kumpulkan berbagai achievement</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">👥</div>
                    <h4>Profil</h4>
                    <p>Customize profil dan avatar Anda</p>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <p>&copy; 2025 Game Portal. All rights reserved. | Made with ❤️</p>
        </footer>
    </div>
</body>

</html>