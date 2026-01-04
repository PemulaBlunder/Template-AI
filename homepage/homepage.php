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
        max-width: 1000px;
        margin: 0 auto;
    }

    .header {
        background: white;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .profile-photo {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid #667eea;
    }

    .user-details h2 {
        color: #333;
        margin-bottom: 5px;
    }

    .user-details p {
        color: #666;
        font-size: 14px;
    }

    .logout-btn {
        padding: 12px 30px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.3s;
    }

    .logout-btn:hover {
        background: #c82333;
        transform: translateY(-2px);
    }

    .content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
    }

    .card {
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .card h3 {
        color: #333;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid #667eea;
    }

    .form-group {
        margin-bottom: 15px;
    }

    label {
        display: block;
        margin-bottom: 8px;
        color: #555;
        font-weight: 500;
        font-size: 14px;
    }

    input[type="text"],
    input[type="password"],
    input[type="file"] {
        width: 100%;
        padding: 10px 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.3s;
    }

    input:focus {
        outline: none;
        border-color: #667eea;
    }

    button[type="submit"] {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 10px;
        transition: transform 0.2s;
    }

    button[type="submit"]:hover {
        transform: translateY(-2px);
    }

    .alert {
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 14px;
    }

    .alert-success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }

    .alert-error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .preview-photo {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
        margin: 15px auto;
        display: block;
        border: 3px solid #667eea;
    }

    .card-link {
        text-decoration: none;
        color: inherit;
    }

    .game-card {
        cursor: pointer;
    }

    .game-card:hover {
        transform: translateY(-5px);
    }

    @media (max-width: 768px) {
        .header {
            flex-direction: column;
            text-align: center;
        }

        .user-info {
            flex-direction: column;
        }
    }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <div class="user-info">
                <img src="<?php echo file_exists($user['photo']) ? htmlspecialchars($user['photo']) : '../uploads/users/default.png'; ?>"
                    alt="Profile" class="profile-photo"
                    onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23667eea%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2240%22 font-family=%22Arial%22%3E<?php echo strtoupper(substr($user['username'], 0, 1)); ?>%3C/text%3E%3C/svg%3E'">
                <div class="user-details">
                    <h2>👋 Halo, <?php echo htmlspecialchars($user['username']); ?>!</h2>
                    <p>📧 <?php echo htmlspecialchars($user['email']); ?></p>
                </div>
            </div>
            <a href="?action=logout" class="logout-btn" onclick="return confirm('Yakin ingin logout?')">Logout</a>
        </div>

        <?php if ($success): ?>
        <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
        <div class="alert alert-error"><?php echo $error; ?></div>
        <?php endif; ?>

        <div class="content">
            <!-- Card Ubah Username -->
            <div class="card">
                <h3>✏️ Ubah Username</h3>
                <form method="POST">
                    <div class="form-group">
                        <label>Username Baru</label>
                        <input type="text" name="new_username"
                            value="<?php echo htmlspecialchars($user['username']); ?>" required>
                    </div>
                    <button type="submit" name="update_username">Simpan Perubahan</button>
                </form>
            </div>

            <!-- Card Ubah Password -->
            <div class="card">
                <h3>🔒 Ubah Password</h3>
                <form method="POST">
                    <div class="form-group">
                        <label>Password Lama</label>
                        <input type="password" name="current_password" required>
                    </div>
                    <div class="form-group">
                        <label>Password Baru</label>
                        <input type="password" name="new_password" required>
                    </div>
                    <div class="form-group">
                        <label>Konfirmasi Password Baru</label>
                        <input type="password" name="confirm_password" required>
                    </div>
                    <button type="submit" name="update_password">Ubah Password</button>
                </form>
            </div>

            <!-- Card Ubah Foto Profil -->
            <div class="card">
                <h3>📸 Ubah Foto Profil</h3>
                <img src="<?php echo file_exists($user['photo']) ? htmlspecialchars($user['photo']) : '../uploads/users/default.png'; ?>"
                    alt="Current Photo" class="preview-photo"
                    onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23667eea%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2240%22 font-family=%22Arial%22%3E<?php echo strtoupper(substr($user['username'], 0, 1)); ?>%3C/text%3E%3C/svg%3E'">
                <form method="POST" enctype="multipart/form-data">
                    <div class="form-group">
                        <label>Pilih Foto Baru (JPG, PNG, GIF - Max 5MB)</label>
                        <input type="file" name="photo" accept="image/*" required>
                    </div>
                    <button type="submit" name="update_photo">Upload Foto</button>
                </form>
            </div>

            <a href="../Game/Tetoris/index_tetris.html" class="card-link">
                <div class="card game-card">
                    <h3>🎮 Mainkan Game Tetris</h3>
                    <p>Klik untuk bermain</p>
                </div>
            </a>

            <a href="../Game/Snake/index_snake.html" class="card-link">
                <div class="card game-card">
                    <h3>🎮 Mainkan Game Ular</h3>
                    <p>Klik untuk bermain</p>
                </div>
            </a>

            <a href="../leaderboard/leaderboard.html" class="card-link">
                <div class="card game-card">
                    <h3>leaderboard</h3>
                    <p>Klik untuk melihat leaderboard</p>
                </div>
            </a>

        </div>
    </div>
</body>

</html>