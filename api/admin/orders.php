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

require_once __DIR__ . '/../../database/config.php';

if (!empty($_GET['id'])) {
  $orderId = (int)$_GET['id'];
  $stmt = $pdo->prepare('SELECT o.*, u.username FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?');
  $stmt->execute([$orderId]);
  $order = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$order) {
    http_response_code(404);
    echo json_encode(['error' => 'Order not found.']);
    exit;
  }
  $order['total'] = (int)$order['total'];
  $stmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id = ?');
  $stmt->execute([$orderId]);
  $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
  foreach ($items as &$item) {
    $item['id'] = (int)$item['id'];
    $item['sneaker_id'] = (int)$item['sneaker_id'];
    $item['price'] = (int)$item['price'];
    $item['quantity'] = (int)$item['quantity'];
  }
  $order['items'] = $items;
  echo json_encode($order);
} else {
  $stmt = $pdo->query('SELECT o.id, o.user_id, u.username, o.total, o.payment_method, o.status, o.created_at FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC');
  $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
  foreach ($orders as &$o) {
    $o['id'] = (int)$o['id'];
    $o['user_id'] = (int)$o['user_id'];
    $o['total'] = (int)$o['total'];
  }
  echo json_encode($orders);
}
