import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { readCSV } from '@/lib/csv'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    if (!data?.username || !data?.password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 })
    }
    const users = readCSV<any>('users')
    const user = users.find((u: any) => u.username === data.username.trim())
    if (user && await bcrypt.compare(data.password, user.password)) {
      return NextResponse.json({
        message: 'Login successful.',
        user: { id: Number(user.id), username: user.username, email: user.email, role: Number(user.role) }
      })
    }
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })
  } catch { return NextResponse.json({ error: 'Server error.' }, { status: 500 }) }
}
