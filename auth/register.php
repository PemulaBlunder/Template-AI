<?php
require_once '../databases/config.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    
    // Validasi
    if (empty($username) || empty($email) || empty($password)) {
        $error = 'Semua field harus diisi!';
    } elseif ($password !== $confirm_password) {
        $error = 'Password tidak cocok!';
    } elseif (strlen($password) < 6) {
        $error = 'Password minimal 6 karakter!';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Format email tidak valid!';
    } else {
        // Cek apakah username atau email sudah ada
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        
        if ($stmt->rowCount() > 0) {
            $error = 'Username atau email sudah terdaftar!';
        } else {
            // Insert user baru
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
            
            if ($stmt->execute([$username, $email, $password_hash])) {
                $success = 'Registrasi berhasil! Silakan login.';
            } else {
                $error = 'Terjadi kesalahan. Silakan coba lagi.';
            }
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

    <link href="https://fonts.googleapis.com/css2?family=Jaro:opsz@6..72&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght,YOPQ@500,300&display=swap" rel="stylesheet" />
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
            <div class="alert alert-error"><?php echo $error; ?></div>
            <?php endif; ?>

            <?php if ($success): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
            <?php endif; ?>

            <form method="POST">
                <div class="input-group">
                    <label>Username</label>
                    <input type="text" name="username"
                        value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>"
                        required />
                </div>

                <div class="input-group">
                    <label>Email</label>
                    <input type="email" name="email"
                        value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>"
                        required />
                </div>

                <div class="input-group">
                    <label>Password</label>
                    <input type="password" name="password" required />
                </div>

                <div class="input-group">
                    <label>Konfirmasi Password</label>
                    <input type="password" name="confirm_password" required />
                </div>

                <button type="submit" class="btn primary-btn">Daftar</button>
            </form>
            <div class="links">
                Sudah punya akun?
                <a href="login.php" class="link">Login di sini</a>
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