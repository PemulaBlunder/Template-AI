<?php
require_once '../databases/config.php';

// Cek apakah user sudah login
if (!isLoggedIn()) {
    redirect('../auth/login.php');
}

// Ambil data user
$user = getCurrentUser($pdo);

$success = '';
$error = '';

// Handle logout
if (isset($_GET['action']) && $_GET['action'] == 'logout') {
    session_destroy();
    redirect('../auth/login.php');
}

// Handle update username
if (isset($_POST['update_username'])) {
    $new_username = trim($_POST['new_username']);
    
    if (empty($new_username)) {
        $error = 'Username tidak boleh kosong!';
    } else {
        // Cek apakah username sudah digunakan user lain
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $stmt->execute([$new_username, $_SESSION['user_id']]);
        
        if ($stmt->rowCount() > 0) {
            $error = 'Username sudah digunakan!';
        } else {
            $stmt = $pdo->prepare("UPDATE users SET username = ? WHERE id = ?");
            if ($stmt->execute([$new_username, $_SESSION['user_id']])) {
                $_SESSION['username'] = $new_username;
                $success = 'Username berhasil diubah!';
                $user = getCurrentUser($pdo);
            }
        }
    }
}

// Handle update password
if (isset($_POST['update_password'])) {
    $current_password = $_POST['current_password'];
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];
    
    // Ambil password hash dari database
    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user_data = $stmt->fetch();
    
    if (!password_verify($current_password, $user_data['password_hash'])) {
        $error = 'Password lama salah!';
    } elseif ($new_password !== $confirm_password) {
        $error = 'Password baru tidak cocok!';
    } elseif (strlen($new_password) < 6) {
        $error = 'Password minimal 6 karakter!';
    } else {
        $password_hash = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        if ($stmt->execute([$password_hash, $_SESSION['user_id']])) {
            $success = 'Password berhasil diubah!';
        }
    }
}

// Handle update photo
if (isset($_POST['update_photo']) && isset($_FILES['photo'])) {
    $file = $_FILES['photo'];
    
    if ($file['error'] == 0) {
        $allowed = ['jpg', 'jpeg', 'png', 'gif'];
        $filename = $file['name'];
        $file_ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        if (in_array($file_ext, $allowed)) {
            if ($file['size'] <= 5000000) { // 5MB
                // Buat folder jika belum ada
                $upload_dir = '../uploads/users/';
                if (!is_dir($upload_dir)) {
                    mkdir($upload_dir, 0777, true);
                }
                
                // Generate nama file unik
                $new_filename = uniqid() . '.' . $file_ext;
                $upload_path = $upload_dir . $new_filename;
                
                if (move_uploaded_file($file['tmp_name'], $upload_path)) {
                    // Hapus foto lama jika bukan default
                    if ($user['photo'] != '../uploads/users/default.png' && file_exists($user['photo'])) {
                        unlink($user['photo']);
                    }
                    
                    // Update database
                    $stmt = $pdo->prepare("UPDATE users SET photo = ? WHERE id = ?");
                    if ($stmt->execute([$upload_path, $_SESSION['user_id']])) {
                        $success = 'Foto profil berhasil diubah!';
                        $user = getCurrentUser($pdo);
                    }
                } else {
                    $error = 'Gagal mengupload foto!';
                }
            } else {
                $error = 'Ukuran file maksimal 5MB!';
            }
        } else {
            $error = 'Format file tidak valid! Gunakan JPG, JPEG, PNG, atau GIF.';
        }
    }
}

?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Homepage - <?php echo htmlspecialchars($user['username']); ?></title>

    <link rel="stylesheet" href="homepage_style.css" />

    <link href="https://fonts.googleapis.com/css2?family=Jaro:opsz@6..72&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght,YOPQ@500,300&display=swap" rel="stylesheet">

</head>

<body>
    <div class="header">
        <div class="logo">
            <h1>LEVITAS</h1>
            <h2>Play Without Weight</h2>
        </div>

        <div class="fab-container">
            <div class="user-info">
                <div class="fab">
                    <img src="<?php echo file_exists($user['photo']) ? htmlspecialchars($user['photo']) : '../uploads/users/default.png'; ?>"
                        alt="Profile" class="profile-photo"
                        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23667eea%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2240%22 font-family=%22Arial%22%3E<?php echo strtoupper(substr($user['username'], 0, 1)); ?>%3C/text%3E%3C/svg%3E'">
                    <div class="user-details">
                        <h2>👋 Halo, <?php echo htmlspecialchars($user['username']); ?>!</h2>
                        <p>📧 <?php echo htmlspecialchars($user['email']); ?></p>
                    </div>
                    <div class="fab-menu">

                        <div class="card">
                            <h2>Ubah Username</h2>
                            <form method="POST">
                                <div class="form-group">
                                    <label>Username Baru</label>
                                    <input type="text" name="new_username" required>
                                </div>
                                <button type="submit" name="update_username">Simpan Perubahan</button>
                            </form>
                        </div>

                        <div class="card">
                            <h2>Ubah Profil</h2>
                            <form method="POST" enctype="multipart/form-data">
                                <div class="form-group">
                                    <label>Pilih Foto Baru (JPG, PNG, GIF - Max 5MB)</label>
                                    <input type="file" name="photo" accept="image/*" required>
                                </div>
                                <button type="submit" name="update_photo">Upload Foto</button>
                            </form>
                        </div>
                        <a href="../auth/change_password.php" class="test-btn">Rubah Password</a>
                        <a href="?action=logout" class="logout-btn"
                            onclick="return confirm('Yakin ingin logout?')">Logout</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="fab-overlay"></div>
    </div>

    <div class="container">

        <?php if ($success): ?>
        <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
        <div class="alert alert-error"><?php echo $error; ?></div>
        <?php endif; ?>

        <h2 class="section-title">Selamat Datang</h2>
        <div class="games-grid">
            <a href="../leaderboard/leaderboard.html" class="game-card">
                <div class="game-icon">🏆</div>
                <h3>Leaderboard</h3>
                <p>Lihat peringkat pemain terbaik dan bandingkan skor Anda dengan pemain lain!</p>
                <button class="play-button">Lihat Peringkat</button>
            </a>
        </div>
        <div class="games-grid">
            <a href="../Game/Tetoris/index_tetris.html" class="game-card">
                <div class="game-icon">🧱</div>
                <h3>Tetris</h3>
                <p>Game puzzle klasik yang menantang! Susun balok-balok untuk membuat baris sempurna.</p>
                <button class="play-button">Main Sekarang</button>
            </a>

            <a href="../Game/Snake/index_snake.html" class="game-card">
                <div class="game-icon">🐍</div>
                <h3>Snake</h3>
                <p>Kendalikan ular untuk memakan makanan dan tumbuh semakin panjang tanpa menabrak dinding!</p>
                <button class="play-button">Main Sekarang</button>
            </a>
        </div>

        <!-- ================= FOOTER ================= -->

    </div>

    <footer class="footer">
        <div class="footer-links">
            <a href="" class="footer-link">Legal Stuff</a>
            <span class="dot">·</span>
            <a href="" class="footer-link">Blogs</a>
            <span class="dot">·</span>
            <a href="" class="footer-link">Terms</a>
            <div class="footer-line"></div>
        </div>

        <div class="social-icons">
            <a href=""><img src="../image/gmail.png" alt="Gmail" /></a>
            <a href=""><img src="../image/instagram.png" alt="Instagram" /></a>
            <a href=""><img src="../image/linkedin.png" alt="LinkedIn" /></a>
        </div>
    </footer>

    <script src="../refference/script.js"></script>
</body>

</html>