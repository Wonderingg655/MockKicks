const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA = path.join(__dirname, '..', 'data');
const now = new Date().toISOString();

// Update sneakers
let text = fs.readFileSync(path.join(DATA, 'sneakers.csv'), 'utf-8').trim();
let lines = text.split('\n');
let header = lines[0];
let rows = lines.slice(1).map(l => {
  let parts = [];
  let cur = '';
  let inQ = false;
  for (let c of l) {
    if (c === '"') { inQ = !inQ; continue; }
    if (c === ',' && !inQ) { parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  parts.push(cur);
  parts[2] = String(Math.floor(Number(parts[2]) / 100));
  parts[3] = '/sneakplaceholder.png';
  return parts.join(',');
});
fs.writeFileSync(path.join(DATA, 'sneakers.csv'), [header, ...rows].join('\n'), 'utf-8');
console.log('Sneakers updated');

// Seed users
async function seed() {
  const hash = await bcrypt.hash('password123', 10);
  const users = [
    { id: 1, username: 'admin', email: 'admin@mockkicks.com', password: hash, role: 1 },
    { id: 2, username: 'john', email: 'john@example.com', password: hash, role: 0 },
    { id: 3, username: 'jane', email: 'jane@example.com', password: hash, role: 0 },
    { id: 4, username: 'bob', email: 'bob@example.com', password: hash, role: 0 },
    { id: 5, username: 'alice', email: 'alice@example.com', password: hash, role: 0 },
  ];
  let csv = 'id,username,email,password,role,created_at,updated_at\n';
  csv += users.map(u => [u.id, u.username, u.email, u.password, u.role, now, now].join(',')).join('\n');
  fs.writeFileSync(path.join(DATA, 'users.csv'), csv, 'utf-8');
  fs.writeFileSync(path.join(DATA, '_counters.json'), JSON.stringify({ users: 5, sneakers: 6 }), 'utf-8');
  console.log('Users updated');
}
seed().catch(console.error);
