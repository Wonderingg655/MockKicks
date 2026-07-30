<?php
$host = 'localhost';
$username = 'root';
$password = '';

try {
  $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $username, $password);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  $sql = file_get_contents(__DIR__ . '/schema.sql');
  $pdo->exec($sql);
  echo "Database and tables created successfully.";
} catch (PDOException $e) {
  echo "Error: " . $e->getMessage();
}
