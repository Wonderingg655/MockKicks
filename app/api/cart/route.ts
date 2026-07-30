import { NextRequest, NextResponse } from 'next/server'
import { readCSV, insert, update, remove, nextId } from '@/lib/csv'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')
  const lang = searchParams.get('lang') || 'en'
  if (!userId) return NextResponse.json({ error: 'Missing user_id.' }, { status: 400 })
  const cart = (await readCSV<any>('cart')).filter((c: any) => Number(c.user_id) === Number(userId))
  const sneakers = await readCSV<any>('sneakers')
  const items = cart.map(c => {
    const s = sneakers.find((s: any) => Number(s.id) === Number(c.sneaker_id))
    return s ? { id: Number(c.id), sneaker_id: Number(c.sneaker_id), quantity: Number(c.quantity), name: s.name, price: Number(s.price), image: s.image, category: s[`category_${lang}`] || s.category } : null
  }).filter(Boolean)
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  if (!data?.user_id || !data?.sneaker_id) {
    return NextResponse.json({ error: 'user_id and sneaker_id are required.' }, { status: 400 })
  }
  const qty = Math.max(1, Number(data.quantity) || 1)
  const cart = await readCSV<any>('cart')
  const existing = cart.find((c: any) => Number(c.user_id) === Number(data.user_id) && Number(c.sneaker_id) === Number(data.sneaker_id))
  if (existing) {
    await update('cart', Number(existing.id), { quantity: String(Number(existing.quantity) + qty) })
  } else {
    await insert('cart', { id: String(await nextId('cart')), user_id: String(data.user_id), sneaker_id: String(data.sneaker_id), quantity: String(qty), created_at: new Date().toISOString() })
  }
  return NextResponse.json({ message: 'Added to cart.' })
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  if (!data?.id || !data?.quantity) {
    return NextResponse.json({ error: 'id and quantity are required.' }, { status: 400 })
  }
  if (Number(data.quantity) < 1) {
    await remove('cart', (c: any) => Number(c.id) === Number(data.id))
  } else {
    await update('cart', Number(data.id), { quantity: String(data.quantity) })
  }
  return NextResponse.json({ message: 'Cart updated.' })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const userId = searchParams.get('user_id')
  if (searchParams.has('clear') && userId) {
    await remove('cart', (c: any) => Number(c.user_id) === Number(userId))
  } else if (id) {
    await remove('cart', (c: any) => Number(c.id) === Number(id))
  } else {
    return NextResponse.json({ error: 'Missing id or user_id.' }, { status: 400 })
  }
  return NextResponse.json({ message: 'Cart updated.' })
}
