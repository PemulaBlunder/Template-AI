<?php
require_once '../databases/config.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode([
        'success' => false,
        'message' => 'Not logged in'
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['score'], $data['game'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid data'
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];
$score = (int)$data['score'];
$game_key = $data['game'];

// Validasi skor
if ($score < 0 || $score > 1000000) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid score'
    ]);
    exit;
}

// Ambil game_id
$stmt = $pdo->prepare("SELECT id FROM games WHERE game_key = ?");
$stmt->execute([$game_key]);
$game = $stmt->fetch();

if (!$game) {
    echo json_encode([
        'success' => false,
        'message' => 'Game not found'
    ]);
    exit;
}

$game_id = $game['id'];

// Simpan / update high score
$stmt = $pdo->prepare("
    INSERT INTO scores (user_id, game_id, score)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE score = GREATEST(score, VALUES(score))
");

$stmt->execute([$user_id, $game_id, $score]);

echo json_encode([
    'success' => true,
    'score' => $score
]);
