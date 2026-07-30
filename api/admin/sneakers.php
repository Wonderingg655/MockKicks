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
    $stmt = $pdo->query('SELECT id, name, price, image, description, category FROM sneakers ORDER BY id ASC');
    $sneakers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($sneakers as &$s) {
      $s['id'] = (int)$s['id'];
      $s['price'] = (int)$s['price'];
    }
    echo json_encode($sneakers);
    break;

  case 'POST';
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['name']) || empty($data['category'])) {
      http_response_code(400);
      echo json_encode(['error' => 'Name and category are required.']);
      exit;
    }
    $stmt = $pdo->prepare('INSERT INTO sneakers (name, price, image, description, category) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([
      trim($data['name']),
      (int)($data['price'] ?? 0),
      trim($data['image'] ?? '/sneakplaceholder.png'),
      trim($data['description'] ?? ''),
      trim($data['category'])
    ]);
    echo json_encode(['message' => 'Sneaker created.', 'id' => $pdo->lastInsertId()]);
    break;

  case 'PUT';
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'Missing id.']); exit; }
    $data = json_decode(file_get_contents('php://input'), true);
    $fields = [];
    $params = [];
    if (!empty($data['name'])) { $fields[] = 'name = ?'; $params[] = trim($data['name']); }
    if (isset($data['price'])) { $fields[] = 'price = ?'; $params[] = (int)$data['price']; }
    if (isset($data['image'])) { $fields[] = 'image = ?'; $params[] = trim($data['image']); }
    if (isset($data['description'])) { $fields[] = 'description = ?'; $params[] = trim($data['description']); }
    if (!empty($data['category'])) { $fields[] = 'category = ?'; $params[] = trim($data['category']); }
    if (empty($fields)) { http_response_code(400); echo json_encode(['error' => 'No fields to update.']); exit; }
    $params[] = $id;
    $stmt = $pdo->prepare('UPDATE sneakers SET ' . implode(', ', $fields) . ' WHERE id = ?');
    $stmt->execute($params);
    echo json_encode(['message' => 'Sneaker updated.']);
    break;

  case 'DELETE';
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'Missing id.']); exit; }
    $stmt = $pdo->prepare('DELETE FROM sneakers WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['message' => 'Sneaker deleted.']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
}
