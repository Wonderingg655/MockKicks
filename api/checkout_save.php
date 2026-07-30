<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

require_once __DIR__ . '/../database/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);
  if (!$data || empty($data['action'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request.']);
    exit;
  }

  if ($data['action'] === 'save') {
    if (empty($data['checkout_ref']) || empty($data['user_id']) || empty($data['order_data'])) {
      http_response_code(400);
      echo json_encode(['error' => 'checkout_ref, user_id, and order_data are required.']);
      exit;
    }
    $stmt = $pdo->prepare('INSERT INTO pending_checkouts (checkout_ref, user_id, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)');
    $stmt->execute([$data['checkout_ref'], (int)$data['user_id'], json_encode($data['order_data'])]);
    echo json_encode(['message' => 'Saved.']);
  } elseif ($data['action'] === 'update_pi') {
    if (empty($data['checkout_ref']) || empty($data['payment_intent_id'])) {
      http_response_code(400);
      echo json_encode(['error' => 'checkout_ref and payment_intent_id required.']);
      exit;
    }
    $stmt = $pdo->prepare('UPDATE pending_checkouts SET payment_intent_id = ? WHERE checkout_ref = ?');
    $stmt->execute([$data['payment_intent_id'], $data['checkout_ref']]);
    echo json_encode(['message' => 'Updated.']);
  } elseif ($data['action'] === 'finalize') {
    if (empty($data['checkout_ref'])) {
      http_response_code(400);
      echo json_encode(['error' => 'checkout_ref required.']);
      exit;
    }
    $stmt = $pdo->prepare('SELECT * FROM pending_checkouts WHERE checkout_ref = ?');
    $stmt->execute([$data['checkout_ref']]);
    $pending = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$pending) {
      echo json_encode(['message' => 'Order already processed.', 'already_processed' => true]);
      exit;
    }
    $orderData = json_decode($pending['data'], true);
    $pdo->beginTransaction();
    try {
      $total = 0;
      foreach ($orderData['items'] as $item) {
        $total += (int)$item['price'] * (int)$item['quantity'];
      }
      $stmt = $pdo->prepare('INSERT INTO orders (user_id, name, email, phone, address, city, state, postal_code, country, total, payment_method, payment_details, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      $paymentMethod = isset($data['wallet_type']) ? $data['wallet_type'] : (isset($data['payment_method_type']) ? $data['payment_method_type'] : 'card');
      $stmt->execute([(int)$pending['user_id'], $orderData['name'], $orderData['email'], $orderData['phone'], $orderData['address'], $orderData['city'], $orderData['state'], $orderData['postal_code'], $orderData['country'], $total, $paymentMethod, json_encode(['stripe_payment_intent_id' => $pending['payment_intent_id']]), 'paid']);
      $orderId = $pdo->lastInsertId();
      $values = [];
      $params = [];
      foreach ($orderData['items'] as $item) {
        $values[] = '(?, ?, ?, ?, ?)';
        $params = array_merge($params, [$orderId, (int)$item['sneaker_id'], $item['name'], (int)$item['price'], (int)$item['quantity']]);
      }
      $stmt = $pdo->prepare('INSERT INTO order_items (order_id, sneaker_id, name, price, quantity) VALUES ' . implode(', ', $values));
      $stmt->execute($params);
      $stmt = $pdo->prepare('DELETE FROM cart WHERE user_id = ?');
      $stmt->execute([(int)$pending['user_id']]);
      $stmt = $pdo->prepare('DELETE FROM pending_checkouts WHERE id = ?');
      $stmt->execute([$pending['id']]);
      $pdo->commit();
      try {
        require_once __DIR__ . '/mail_helper.php';
        sendOrderNotification((int)$orderId, $orderData['name'], $orderData['email'], $orderData['phone'], $orderData['address'], $orderData['city'], $orderData['state'], $orderData['postal_code'], $orderData['country'], $total, $paymentMethod, $orderData['items']);
      } catch (Exception $e) {
        error_log('Order notification failed: ' . $e->getMessage());
      }
      echo json_encode(['message' => 'Order placed successfully.', 'order_id' => (int)$orderId]);
    } catch (Exception $e) {
      $pdo->rollBack();
      http_response_code(500);
      echo json_encode(['error' => 'Order creation failed.']);
    }
  } else {
    http_response_code(400);
    echo json_encode(['error' => 'Unknown action.']);
  }
} elseif ($method === 'GET') {
  if (!empty($_GET['checkout_ref'])) {
    $stmt = $pdo->prepare('SELECT * FROM pending_checkouts WHERE checkout_ref = ?');
    $stmt->execute([$_GET['checkout_ref']]);
  } elseif (!empty($_GET['payment_intent_id'])) {
    $stmt = $pdo->prepare('SELECT * FROM pending_checkouts WHERE payment_intent_id = ?');
    $stmt->execute([$_GET['payment_intent_id']]);
  } else {
    http_response_code(400);
    echo json_encode(['error' => 'checkout_ref or payment_intent_id required.']);
    exit;
  }
  $pending = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$pending) {
    http_response_code(404);
    echo json_encode(['error' => 'Not found.']);
    exit;
  }
  echo json_encode(['checkout_ref' => $pending['checkout_ref'], 'user_id' => (int)$pending['user_id'], 'payment_intent_id' => $pending['payment_intent_id'], 'order_data' => json_decode($pending['data'], true)]);
} elseif ($method === 'DELETE') {
  $data = json_decode(file_get_contents('php://input'), true);
  if (empty($data['checkout_ref'])) {
    http_response_code(400);
    echo json_encode(['error' => 'checkout_ref required.']);
    exit;
  }
  $stmt = $pdo->prepare('DELETE FROM pending_checkouts WHERE checkout_ref = ?');
  $stmt->execute([$data['checkout_ref']]);
  echo json_encode(['message' => 'Deleted.']);
} else {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed.']);
}
