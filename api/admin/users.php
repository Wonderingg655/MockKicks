<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

require_once __DIR__ . '/../../database/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
  case 'GET';
    $stmt = $pdo->query('SELECT id, username, email, role, created_at FROM users ORDER BY id ASC');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($users as &$u) { $u['role'] = (int)$u['role']; }
    echo json_encode($users);
    break;

  case 'POST';
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['username']) || empty($data['email']) || empty($data['password'])) {
      http_response_code(400);
      echo json_encode(['error' => 'Username, email, and password are required.']);
      exit;
    }
    $role = isset($data['role']) ? ($data['role'] ? 1 : 0) : 0;
    $stmt = $pdo->prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)');
    $stmt->execute([trim($data['username']), trim($data['email']), password_hash($data['password'], PASSWORD_BCRYPT), $role]);
    echo json_encode(['message' => 'User created.', 'id' => $pdo->lastInsertId()]);
    break;

  case 'PUT';
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'Missing id.']); exit; }
    $data = json_decode(file_get_contents('php://input'), true);
    $fields = [];
    $params = [];
    if (!empty($data['username'])) { $fields[] = 'username = ?'; $params[] = trim($data['username']); }
    if (!empty($data['email'])) { $fields[] = 'email = ?'; $params[] = trim($data['email']); }
    if (!empty($data['password'])) { $fields[] = 'password = ?'; $params[] = password_hash($data['password'], PASSWORD_BCRYPT); }
    if (isset($data['role'])) { $fields[] = 'role = ?'; $params[] = $data['role'] ? 1 : 0; }
    if (empty($fields)) { http_response_code(400); echo json_encode(['error' => 'No fields to update.']); exit; }
    $params[] = $id;
    $stmt = $pdo->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?');
    $stmt->execute($params);
    echo json_encode(['message' => 'User updated.']);
    break;

  case 'DELETE';
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'Missing id.']); exit; }
    $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['message' => 'User deleted.']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
}
