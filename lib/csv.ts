import { kv } from '@vercel/kv'

const USE_KV = !!process.env.KV_URL

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function toCSVLine(values: string[]): string {
  return values.map(v => {
    if (v.includes(',') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/"/g, '""')}"`
    }
    return v
  }).join(',')
}

function tableKey(table: string): string {
  return `tables:${table}`
}

function counterKey(table: string): string {
  return `counters:${table}`
}

async function seedFromCSVIfNeeded<T extends Record<string, string>>(table: string): Promise<T[]> {
  const existing = await kv.get<T[]>(tableKey(table))
  if (existing) return existing

  try {
    const fs = await import('fs')
    const path = await import('path')
    const file = path.join(process.cwd(), 'data', `${table}.csv`)
    if (fs.existsSync(file)) {
      const text = fs.readFileSync(file, 'utf-8').trim()
      if (!text) return []
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      const rows = lines.slice(1).filter(l => l.trim()).map(line => {
        const values = parseCSVLine(line)
        const row: any = {}
        headers.forEach((h, i) => { row[h] = values[i] || '' })
        return row as T
      })
      await kv.set(tableKey(table), rows)

      const maxId = rows.reduce((max, r: any) => Math.max(max, Number(r.id) || 0), 0)
      if (maxId > 0) await kv.set(counterKey(table), maxId)

      return rows
    }
  } catch {}
  return []
}

export async function readCSV<T extends Record<string, string>>(table: string): Promise<T[]> {
  if (USE_KV) {
    return await seedFromCSVIfNeeded<T>(table)
  }

  const fs = await import('fs')
  const path = await import('path')
  const file = path.join(process.cwd(), 'data', `${table}.csv`)
  if (!fs.existsSync(file)) return []
  const text = fs.readFileSync(file, 'utf-8').trim()
  if (!text) return []
  const lines = text.split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = parseCSVLine(line)
    const row: any = {}
    headers.forEach((h, i) => { row[h] = values[i] || '' })
    return row as T
  })
}

async function writeCSV<T extends Record<string, string>>(table: string, rows: T[]): Promise<void> {
  if (USE_KV) {
    await kv.set(tableKey(table), rows)
    return
  }

  const fs = await import('fs')
  const path = await import('path')
  const dataDir = path.join(process.cwd(), 'data')
  const file = path.join(dataDir, `${table}.csv`)
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (rows.length === 0) {
    fs.writeFileSync(file, '', 'utf-8')
    return
  }
  const headers = Object.keys(rows[0])
  const lines = [headers.join(','), ...rows.map(r => toCSVLine(headers.map(h => String(r[h] ?? ''))))]
  fs.writeFileSync(file, lines.join('\n'), 'utf-8')
}

export async function nextId(table: string): Promise<number> {
  if (USE_KV) {
    return await kv.incr(counterKey(table))
  }

  const fs = await import('fs')
  const path = await import('path')
  const file = path.join(process.cwd(), 'data', '_counters.json')
  let counters: Record<string, number> = {}
  if (fs.existsSync(file)) {
    try { counters = JSON.parse(fs.readFileSync(file, 'utf-8')) } catch {}
  }
  if (!counters[table]) counters[table] = 0
  counters[table]++
  fs.writeFileSync(file, JSON.stringify(counters), 'utf-8')
  return counters[table]
}

export async function insert<T extends Record<string, string>>(table: string, row: T): Promise<T> {
  const rows = await readCSV<T>(table)
  rows.push(row)
  await writeCSV(table, rows)
  return row
}

export async function update<T extends Record<string, string>>(table: string, id: number, updates: Partial<T>): Promise<T | null> {
  const rows = await readCSV<any>(table)
  const idx = rows.findIndex((r: any) => Number(r.id) === id)
  if (idx === -1) return null
  rows[idx] = { ...rows[idx], ...updates }
  await writeCSV(table, rows)
  return rows[idx]
}

export async function remove<T extends Record<string, string>>(table: string, predicate: (row: T) => boolean): Promise<void> {
  const rows = await readCSV<T>(table)
  const filtered = rows.filter(r => !predicate(r))
  await writeCSV(table, filtered)
}