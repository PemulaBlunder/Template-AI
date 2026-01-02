<?php
require_once 'config.php';

// Jika sudah login, redirect ke homepage
if (isLoggedIn()) {
    redirect('homepage.php');
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
            redirect('homepage.php');
        } else {
            $error = 'Username/email atau password salah!';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>

    <link rel="stylesheet" href="login_style.css">

</head>
<body>
    <div class="container">
        <h2>🔐 Login</h2>
        
        <?php if ($error): ?>
            <div class="alert-error"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <form method="POST">
            <div class="form-group">
                <label>Username / Email</label>
                <input type="text" name="username" value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>" required>
            </div>
            
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" required>
            </div>
            
            <button type="submit">Login</button>
        </form>
        
        <div class="register-link">
            Belum punya akun? <a href="register.php">Daftar di sini</a>
        </div>
    </div>
</body>
</html>