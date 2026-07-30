<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

require_once __DIR__ . '/../database/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
  case 'GET';
    $userId = $_GET['user_id'] ?? null;
    if (!$userId) { http_response_code(400); echo json_encode(['error' => 'Missing user_id.']); exit; }
    $stmt = $pdo->prepare('
      SELECT c.id, c.sneaker_id, c.quantity, s.name, s.price, s.image, s.category
      FROM cart c
      JOIN sneakers s ON c.sneaker_id = s.id
      WHERE c.user_id = ?
      ORDER BY c.created_at ASC
    ');
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($items as &$item) {
      $item['id'] = (int)$item['id'];
      $item['sneaker_id'] = (int)$item['sneaker_id'];
      $item['quantity'] = (int)$item['quantity'];
      $item['price'] = (int)$item['price'];
    }
    echo json_encode($items);
    break;

  case 'POST';
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['user_id']) || !isset($data['sneaker_id'])) {
      http_response_code(400);
      echo json_encode(['error' => 'user_id and sneaker_id are required.']);
      exit;
    }
    $qty = isset($data['quantity']) ? max(1, (int)$data['quantity']) : 1;
    $stmt = $pdo->prepare('INSERT INTO cart (user_id, sneaker_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?');
    $stmt->execute([$data['user_id'], $data['sneaker_id'], $qty, $qty]);
    echo json_encode(['message' => 'Added to cart.']);
    break;

  case 'PUT';
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['id']) || !isset($data['quantity'])) {
      http_response_code(400);
      echo json_encode(['error' => 'id and quantity are required.']);
      exit;
    }
    if ((int)$data['quantity'] < 1) {
      $stmt = $pdo->prepare('DELETE FROM cart WHERE id = ?');
      $stmt->execute([$data['id']]);
    } else {
      $stmt = $pdo->prepare('UPDATE cart SET quantity = ? WHERE id = ?');
      $stmt->execute([(int)$data['quantity'], $data['id']]);
    }
    echo json_encode(['message' => 'Cart updated.']);
    break;

  case 'DELETE';
    $id = $_GET['id'] ?? null;
    $userId = $_GET['user_id'] ?? null;
    $clear = isset($_GET['clear']);
    if ($clear && $userId) {
      $stmt = $pdo->prepare('DELETE FROM cart WHERE user_id = ?');
      $stmt->execute([$userId]);
    } elseif ($id) {
      $stmt = $pdo->prepare('DELETE FROM cart WHERE id = ?');
      $stmt->execute([$id]);
    } else {
      http_response_code(400);
      echo json_encode(['error' => 'Missing id or user_id.']);
      exit;
    }
    echo json_encode(['message' => 'Cart updated.']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
}
