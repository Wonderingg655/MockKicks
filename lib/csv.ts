import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

export function readCSV<T extends Record<string, string>>(table: string): T[] {
  const file = path.join(DATA_DIR, `${table}.csv`)
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

export function writeCSV<T extends Record<string, string>>(table: string, rows: T[]): void {
  const file = path.join(DATA_DIR, `${table}.csv`)
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (rows.length === 0) {
    fs.writeFileSync(file, '', 'utf-8')
    return
  }
  const headers = Object.keys(rows[0])
  const lines = [headers.join(','), ...rows.map(r => toCSVLine(headers.map(h => String(r[h] ?? ''))))]
  fs.writeFileSync(file, lines.join('\n'), 'utf-8')
}

export function nextId(table: string): number {
  const file = path.join(DATA_DIR, '_counters.json')
  let counters: Record<string, number> = {}
  if (fs.existsSync(file)) {
    try { counters = JSON.parse(fs.readFileSync(file, 'utf-8')) } catch {}
  }
  if (!counters[table]) counters[table] = 0
  counters[table]++
  fs.writeFileSync(file, JSON.stringify(counters), 'utf-8')
  return counters[table]
}

export function insert<T extends Record<string, string>>(table: string, row: T): T {
  const rows = readCSV<T>(table)
  rows.push(row)
  writeCSV(table, rows)
  return row
}

export function update<T extends Record<string, string>>(table: string, id: number, updates: Partial<T>): T | null {
  const rows = readCSV<any>(table)
  const idx = rows.findIndex((r: any) => Number(r.id) === id)
  if (idx === -1) return null
  rows[idx] = { ...rows[idx], ...updates }
  writeCSV(table, rows)
  return rows[idx]
}

export function remove<T extends Record<string, string>>(table: string, predicate: (row: T) => boolean): void {
  const rows = readCSV<T>(table)
  const filtered = rows.filter(r => !predicate(r))
  writeCSV(table, filtered)
}
