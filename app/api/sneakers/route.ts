import { NextResponse } from 'next/server'
import { readCSV } from '@/lib/csv'

export async function GET() {
  const sneakers = readCSV<any>('sneakers').map(s => ({
    id: Number(s.id), name: s.name, price: Number(s.price),
    image: s.image, description: s.description, category: s.category
  }))
  return NextResponse.json(sneakers)
}
