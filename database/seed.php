<?php
$pdo = new PDO('mysql:host=localhost;dbname=emock_db;charset=utf8mb4', 'root', '');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$pdo->exec('DELETE FROM users');

$users = [
  ['john_doe', 'john@example.com', bin2hex(random_bytes(8)), 0],
  ['jane_smith', 'jane@example.com', bin2hex(random_bytes(8)), 0],
  ['mike_wilson', 'mike@example.com', bin2hex(random_bytes(8)), 0],
  ['admin', 'bosspollawit@gmail.com', '123', 1],
];

$stmt = $pdo->prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)');

foreach ($users as $u) {
  $stmt->execute([$u[0], $u[1], password_hash($u[2], PASSWORD_BCRYPT), $u[3]]);
  $role = $u[3] ? 'admin' : 'user';
  $label = $u[3] ? 'password: 123 (admin)' : "password: {$u[2]} (user)";
  echo "Inserted: {$u[0]} - {$label}\n";
}

echo "\n--- Users in table ---\n";
$result = $pdo->query('SELECT id, username, email, role, created_at FROM users');
foreach ($result as $row) {
  $role = $row['role'] ? 'admin' : 'user';
  echo "{$row['id']} | {$row['username']} | {$row['email']} | {$role} ({$row['role']}) | {$row['created_at']}\n";
}
