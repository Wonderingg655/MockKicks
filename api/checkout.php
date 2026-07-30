<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed.']);
  exit;
}

require_once __DIR__ . '/../database/config.php';

$data = json_decode(file_get_contents('php://input'), true);

$required = ['user_id', 'name', 'email', 'phone', 'address', 'city', 'state', 'postal_code', 'country', 'items', 'payment_method'];
$missing = [];
foreach ($required as $field) {
  if (!isset($data[$field]) || (is_array($data[$field]) ? empty($data[$field]) : $data[$field] === '')) {
    $missing[] = $field;
  }
}
if ($missing) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing fields: ' . implode(', ', $missing)]);
  exit;
}

$pdo->beginTransaction();

try {
  $total = 0;
  foreach ($data['items'] as $item) {
    $total += (int)$item['price'] * (int)$item['quantity'];
  }

  $paymentDetails = isset($data['payment_details']) ? json_encode($data['payment_details']) : '';
  $stripeIntent = isset($data['stripe_payment_intent_id']) ? $data['stripe_payment_intent_id'] : '';
  $status = $stripeIntent ? 'paid' : 'pending';
  $stmt = $pdo->prepare('INSERT INTO orders (user_id, name, email, phone, address, city, state, postal_code, country, total, payment_method, payment_details, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  $stmt->execute([$data['user_id'], trim($data['name']), trim($data['email']), trim($data['phone']), trim($data['address']), trim($data['city']), trim($data['state']), trim($data['postal_code']), trim($data['country']), $total, $data['payment_method'], $paymentDetails, $status]);
  $orderId = $pdo->lastInsertId();

  $stmt = $pdo->prepare('INSERT INTO order_items (order_id, sneaker_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)');
  foreach ($data['items'] as $item) {
    $stmt->execute([$orderId, (int)$item['sneaker_id'], $item['name'], (int)$item['price'], (int)$item['quantity']]);
  }

  $stmt = $pdo->prepare('DELETE FROM cart WHERE user_id = ?');
  $stmt->execute([$data['user_id']]);

  $pdo->commit();
  echo json_encode(['message' => 'Order placed successfully.', 'order_id' => (int)$orderId]);
} catch (Exception $e) {
  $pdo->rollBack();
  http_response_code(500);
  echo json_encode(['error' => 'Order failed.']);
}
