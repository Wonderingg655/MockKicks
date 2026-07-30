import { NextRequest, NextResponse } from 'next/server'
import { readCSV, insert, update, remove, nextId } from '@/lib/csv'

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') || 'en'
  const sneakers = (await readCSV<any>('sneakers')).map((s: any) => ({
    id: Number(s.id), name: s.name, price: Number(s.price),
    image: s.image, description: s[`description_${lang}`] || s.description,
    category: s[`category_${lang}`] || s.category
  }))
  return NextResponse.json(sneakers)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  if (!data?.name || !data?.category) {
    return NextResponse.json({ error: 'Name and category are required.' }, { status: 400 })
  }
  const id = await nextId('sneakers')
  await insert('sneakers', {
    id: String(id), name: data.name.trim(), price: String(Number(data.price) || 0),
    image: (data.image || '/sneakplaceholder.png').trim(),
    description: (data.description || '').trim(),
    category: data.category.trim(), created_at: new Date().toISOString()
  })
  return NextResponse.json({ message: 'Sneaker created.', id })
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
  const data = await req.json()
  const updates: any = {}
  if (data.name) updates.name = data.name.trim()
  if (data.price !== undefined) updates.price = String(Number(data.price))
  if (data.image !== undefined) updates.image = data.image.trim()
  if (data.description !== undefined) updates.description = data.description.trim()
  if (data.category) updates.category = data.category.trim()
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
  await update('sneakers', Number(id), updates)
  return NextResponse.json({ message: 'Sneaker updated.' })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
  await remove('sneakers', (s: any) => Number(s.id) === Number(id))
  return NextResponse.json({ message: 'Sneaker deleted.' })
}
