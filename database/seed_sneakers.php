<?php
require_once __DIR__ . '/config.php';

$pdo->exec('DELETE FROM sneakers');

$sneakers = [
  ['Air Max Pulse', 4590, 'Running, Lifestyle', 'Premium comfort meets street-ready style with responsive cushioning and a sleek mesh upper.'],
  ['Court Vision Lo', 3290, 'Lifestyle', 'A classic court shoe reimagined with modern materials, padded collar, and timeless appeal.'],
  ['Zoom Rival Fly', 3890, 'Running', 'Lightweight speed for race day. Breathable upper with Zoom Air units for explosive takeoffs.'],
  ['Revolution 7', 2790, 'Running', 'Everyday running made softer with plush cushioning and a smooth, comfortable ride.'],
  ["Air Force 1 '07", 3990, 'Lifestyle', 'The legend lives on. Iconic style, premium leather, and durable construction since 1982.'],
  ['Dunk Low Retro', 3590, 'Lifestyle', 'Bold colors meet heritage design. A streetwear icon reissued for a new generation.'],
  ['Vaporfly 3', 7590, 'Running, Training', 'Elite marathon speed with carbon fiber plate and ZoomX foam for record-breaking performance.'],
  ['Metcon 9', 4190, 'Training', 'Built for the toughest workouts. Stability, durability, and grip for every rep.'],
  ['Pegasus Plus', 4990, 'Running', 'Responsive cushioning meets reliable traction for your daily training runs.'],
  ['Challenger AT', 3490, 'Trail, Running', 'Trail-ready with aggressive tread and protective upper for off-road adventures.'],
  ['Free Run 5.0', 3190, 'Running, Training', 'Natural motion with a flexible sole and minimalist design for a barefoot-like feel.'],
  ['Retro Gato', 2790, 'Lifestyle', 'Vintage court style with a modern twist. Premium suede and clean lines.'],
];

$stmt = $pdo->prepare('INSERT INTO sneakers (name, price, image, description, category) VALUES (?, ?, ?, ?, ?)');

foreach ($sneakers as $s) {
  $stmt->execute([$s[0], $s[1], '/sneakplaceholder.png', $s[3], $s[2]]);
  echo "Inserted: {$s[0]}\n";
}

echo "\n--- Sneakers in table ---\n";
$result = $pdo->query('SELECT id, name, price, category FROM sneakers');
foreach ($result as $row) {
  echo "{$row['id']} | {$row['name']} | {$row['price']} | {$row['category']}\n";
}
