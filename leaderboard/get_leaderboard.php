<?php
// get_leaderboard.php
// API untuk mengambil data leaderboard

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Koneksi database
require_once '../databases/config.php'; // Sesuaikan path

// Fungsi untuk mendapatkan leaderboard overall
function getOverallLeaderboard($pdo, $limit = 10) {
    $sql = "
        SELECT 
            u.id,
            u.username,
            u.photo,
            SUM(s.score) AS total_score
        FROM users u
        INNER JOIN scores s ON u.id = s.user_id
        GROUP BY u.id, u.username, u.photo
        ORDER BY total_score DESC
        LIMIT :limit
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Fungsi untuk mendapatkan leaderboard per game
function getGameLeaderboard($pdo, $gameKey, $limit = 10) {
    $sql = "
        SELECT 
            u.id,
            u.username,
            u.photo,
            MAX(s.score) AS best_score
        FROM users u
        INNER JOIN scores s ON u.id = s.user_id
        INNER JOIN games g ON s.game_id = g.id
        WHERE g.game_key = :game_key
        GROUP BY u.id, u.username, u.photo
        ORDER BY best_score DESC
        LIMIT :limit
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':game_key', $gameKey, PDO::PARAM_STR);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

try {
    // Ambil parameter
    $type = $_GET['type'] ?? 'overall';
    $game = $_GET['game'] ?? '';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    
    // Validasi limit (max 10)
    $limit = min(max($limit, 1), 10);
    
    $data = [];
    
    if ($type === 'overall') {
        $data = getOverallLeaderboard($pdo, $limit);
    } elseif ($type === 'game' && !empty($game)) {
        // Validasi game key
        $validGames = ['snake', 'tetris'];
        if (!in_array($game, $validGames)) {
            throw new Exception('Invalid game key');
        }
        
        $data = getGameLeaderboard($pdo, $game, $limit);
    } else {
        throw new Exception('Invalid request parameters');
    }
    
    echo json_encode([
        'success' => true,
        'data' => $data,
        'count' => count($data)
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}