import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { readCSV, insert, nextId } from '@/lib/csv'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    if (!data?.username || !data?.email || !data?.password) {
      return NextResponse.json({ error: 'Username, email, and password are required.' }, { status: 400 })
    }
    const users = readCSV<any>('users')
    if (users.some((u: any) => u.username === data.username.trim() || u.email === data.email.trim())) {
      return NextResponse.json({ error: 'Username or email already exists.' }, { status: 409 })
    }
    const hash = await bcrypt.hash(data.password, 10)
    const now = new Date().toISOString()
    insert('users', { id: String(nextId('users')), username: data.username.trim(), email: data.email.trim(), password: hash, role: '0', created_at: now, updated_at: now })
    return NextResponse.json({ message: 'User registered successfully.' })
  } catch { return NextResponse.json({ error: 'Registration failed.' }, { status: 500 }) }
}
