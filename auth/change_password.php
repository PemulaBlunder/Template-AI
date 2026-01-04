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

?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login</title>

    <link rel="stylesheet" href="login_style_legacy.css" />

    <link href="https://fonts.googleapis.com/css2?family=Jaro:opsz@6..72&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght,YOPQ@500,300&display=swap" rel="stylesheet">

</head>

<body>
    <div class="container">
        <div class="left-panel">
            <!-- Sidebar -->
            <div class="side-nav">
                <div class="side-text">
                    <div class="side-line mb-44"></div>
                    <div class="side-text mb-15">
                        <span>EN</span>
                    </div>
                    <div class="side-line26 mb-15"></div>
                    <div class="side-text mb-44">
                        <span class="active">ID</span>
                    </div>
                    <span>HELP</span>
                </div>
            </div>

            <!-- Logo -->
            <div class="logo">
                <h1>LEVITAS</h1>
            </div>

            <?php if ($error): ?>
            <div class="alert-error"><?php echo $error; ?></div>
            <?php endif; ?>

            <form method="POST">
                <div class="input-group">
                    <label>Password Lama</label>
                    <input type="password" name="current_password" required>
                </div>
                <div class="input-group">
                    <label>Password Baru</label>
                    <input type="password" name="new_password" required>
                </div>
                <div class="input-group">
                    <label>Konfirmasi Password Baru</label>
                    <input type="password" name="confirm_password" required>
                </div>
                <button type="submit" class="btn primary-btn" name="update_password">Ubah Password</button>
            </form>

            <div class="links">
                Kembali? <a href="../homepage/homepage.php" class="link">Kembali ke Homepage</a>
            </div>

            <!-- ================= SOCIAL ICONS ================= -->
            <div class="social-icons">
                <a href="#"><img src="../image/gmail.png" alt="Gmail" /></a>
                <a href="#"><img src="../image/instagram.png" alt="Instagram" /></a>
                <a href="#"><img src="../image/linkedin.png" alt="LinkedIn" /></a>
            </div>

            <!-- ================= FOOTER ================= -->
            <footer class="footer">
                <a href="#" class="footer-link">Legal Stuff</a>
                <span class="dot">·</span>
                <a href="#" class="footer-link">Blogs</a>
                <span class="dot">·</span>
                <a href="#" class="footer-link">Terms</a>
                <div class="footer-line"></div>
            </footer>
        </div>
    </div>
</body>

</html>