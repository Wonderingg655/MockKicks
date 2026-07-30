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

if (!$data || empty($data['username']) || empty($data['email']) || empty($data['password'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Username, email, and password are required.']);
  exit;
}

$username = trim($data['username']);
$email = trim($data['email']);
$password = password_hash($data['password'], PASSWORD_BCRYPT);

try {
  $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 0)");
  $stmt->execute([$username, $email, $password]);
  echo json_encode(['message' => 'User registered successfully.']);
} catch (PDOException $e) {
  if ($e->getCode() == 23000) {
    http_response_code(409);
    echo json_encode(['error' => 'Username or email already exists.']);
  } else {
    http_response_code(500);
    echo json_encode(['error' => 'Registration failed.']);
  }
}
