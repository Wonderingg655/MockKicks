<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed.']);
  exit;
}

require_once __DIR__ . '/../database/config.php';

if (empty($_GET['user_id'])) {
  http_response_code(400);
  echo json_encode(['error' => 'user_id required.']);
  exit;
}

$userId = (int)$_GET['user_id'];

if (!empty($_GET['id'])) {
  $orderId = (int)$_GET['id'];
  $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?');
  $stmt->execute([$orderId, $userId]);
  $order = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$order) {
    http_response_code(404);
    echo json_encode(['error' => 'Order not found.']);
    exit;
  }
  $stmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id = ?');
  $stmt->execute([$orderId]);
  $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($order);
} else {
  $stmt = $pdo->prepare('SELECT id, total, payment_method, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC');
  $stmt->execute([$userId]);
  $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($orders);
}
