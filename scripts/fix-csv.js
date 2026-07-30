const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data');
const now = new Date().toISOString();

function esc(v) {
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

const sneakers = [
  [1, 'Air Max Pulse', 45, '/sneakplaceholder.png', 'Bold design meets everyday comfort in the Air Max Pulse.', 'Running, Lifestyle', now],
  [2, 'Cloud Runner Pro', 52, '/sneakplaceholder.png', 'Lightweight running shoes with responsive cushioning.', 'Running', now],
  [3, 'Street Glide', 38, '/sneakplaceholder.png', 'Sleek lifestyle sneakers for the urban explorer.', 'Lifestyle', now],
  [4, 'Trail Blazer', 61, '/sneakplaceholder.png', 'Rugged trail shoes built for off-road adventures.', 'Trail', now],
  [5, 'Flex Training', 34, '/sneakplaceholder.png', 'Versatile training shoes with maximum flexibility.', 'Training', now],
  [6, 'Urban Stride', 42, '/sneakplaceholder.png', 'Everyday sneakers with premium comfort and style.', 'Lifestyle', now],
];
let csv = 'id,name,price,image,description,category,created_at\n';
csv += sneakers.map(r => r.map(esc).join(',')).join('\n');
fs.writeFileSync(path.join(DATA, 'sneakers.csv'), csv, 'utf-8');
console.log('Sneakers fixed');
