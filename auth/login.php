<?php
require_once '../databases/config.php';

// Jika sudah login, redirect ke homepage
if (isLoggedIn()) {
    redirect('../homepage/homepage.php');
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = trim($_POST['username']);
    $password = $_POST['password'];
    
    if (empty($username) || empty($password)) {
        $error = 'Username dan password harus diisi!';
    } else {
        // Cari user berdasarkan username atau email
        $stmt = $pdo->prepare("SELECT id, username, password_hash FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password_hash'])) {
            // Login berhasil
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            redirect('../homepage/homepage.php');
        } else {
            $error = 'Username/email atau password salah!';
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
                    <label>Username / Email</label>
                    <input type="text" name="username"
                        value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>"
                        required>
                </div>

                <div class="input-group">
                    <label>Password</label>
                    <input type="password" name="password" required>
                </div>

                <button type="submit" class="btn primary-btn">Login</button>
            </form>

            <div class="links">
                Belum punya akun? <a href="register.php" class="link">Daftar di sini</a>
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