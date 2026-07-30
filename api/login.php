<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

require_once __DIR__ . '/../database/config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['username']) || empty($data['password'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Username and password are required.']);
  exit;
}

$username = trim($data['username']);
$password = $data['password'];

$stmt = $pdo->prepare("SELECT id, username, email, password, role FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {
  echo json_encode([
    'message' => 'Login successful.',
    'user' => [
      'id' => $user['id'],
      'username' => $user['username'],
      'email' => $user['email'],
      'role' => (int)$user['role']
    ]
  ]);
} else {
  http_response_code(401);
  echo json_encode(['error' => 'Invalid email or password.']);
}
