import { NextRequest, NextResponse } from 'next/server'
import { readCSV } from '@/lib/csv'

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') || 'en'
  const sneakers = (await readCSV<any>('sneakers')).map(s => ({
    id: Number(s.id), name: s.name, price: Number(s.price),
    image: s.image, description: s[`description_${lang}`] || s.description,
    category: s[`category_${lang}`] || s.category
  }))
  return NextResponse.json(sneakers)
}
