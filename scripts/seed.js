const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

const DATA = path.join(__dirname, '..', 'data')

function writeCSV(table, rows) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const lines = [headers.join(','), ...rows.map(r => headers.map(h => {
    const v = String(r[h] ?? '')
    return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v
  }).join(','))]
  fs.writeFileSync(path.join(DATA, `${table}.csv`), lines.join('\n'), 'utf-8')
}

async function main() {
  const hash = await bcrypt.hash('admin123', 10)
  const now = new Date().toISOString()

  writeCSV('users', [
    { id: '1', username: 'admin', email: 'admin@mockkicks.com', password: hash, role: '1', created_at: now, updated_at: now },
  ])

  writeCSV('sneakers', [
    { id: '1', name: 'Air Max Pulse', price: '4590', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', description: 'Bold design meets everyday comfort in the Air Max Pulse.', category: 'Running, Lifestyle', created_at: now },
    { id: '2', name: 'Cloud Runner Pro', price: '5200', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600', description: 'Lightweight running shoes with responsive cushioning.', category: 'Running', created_at: now },
    { id: '3', name: 'Street Glide', price: '3800', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', description: 'Sleek lifestyle sneakers for the urban explorer.', category: 'Lifestyle', created_at: now },
    { id: '4', name: 'Trail Blazer', price: '6100', image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600', description: 'Rugged trail shoes built for off-road adventures.', category: 'Trail', created_at: now },
    { id: '5', name: 'Flex Training', price: '3400', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600', description: 'Versatile training shoes with maximum flexibility.', category: 'Training', created_at: now },
    { id: '6', name: 'Urban Stride', price: '4200', image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600', description: 'Everyday sneakers with premium comfort and style.', category: 'Lifestyle', created_at: now },
  ])

  fs.writeFileSync(path.join(DATA, '_counters.json'), JSON.stringify({ users: 1, sneakers: 6 }), 'utf-8')

  console.log('Seeded successfully.')
}

main().catch(console.error)
