import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { readCSV, insert, update, remove, nextId } from '@/lib/csv'

export async function GET() {
  const users = readCSV<any>('users').map((u: any) => ({ id: Number(u.id), username: u.username, email: u.email, role: Number(u.role), created_at: u.created_at }))
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  if (!data?.username || !data?.email || !data?.password) {
    return NextResponse.json({ error: 'Username, email, and password are required.' }, { status: 400 })
  }
  const hash = await bcrypt.hash(data.password, 10)
  const now = new Date().toISOString()
  const id = nextId('users')
  insert('users', { id: String(id), username: data.username.trim(), email: data.email.trim(), password: hash, role: data.role ? '1' : '0', created_at: now, updated_at: now })
  return NextResponse.json({ message: 'User created.', id })
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
  const data = await req.json()
  const updates: any = {}
  if (data.username) updates.username = data.username.trim()
  if (data.email) updates.email = data.email.trim()
  if (data.password) updates.password = await bcrypt.hash(data.password, 10)
  if (data.role !== undefined) updates.role = data.role ? '1' : '0'
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
  update('users', Number(id), updates)
  return NextResponse.json({ message: 'User updated.' })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
  remove('users', (u: any) => Number(u.id) === Number(id))
  return NextResponse.json({ message: 'User deleted.' })
}
