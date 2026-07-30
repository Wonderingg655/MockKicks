<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

require_once __DIR__ . '/../database/config.php';

$stmt = $pdo->query('SELECT id, name, price, image, description, category FROM sneakers ORDER BY id ASC');
$sneakers = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($sneakers as &$s) {
  $s['price'] = (int)$s['price'];
  $s['id'] = (int)$s['id'];
}
echo json_encode($sneakers);
