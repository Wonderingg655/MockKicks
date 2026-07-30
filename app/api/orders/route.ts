import { NextRequest, NextResponse } from 'next/server'
import { readCSV } from '@/lib/csv'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'user_id required.' }, { status: 400 })

  if (searchParams.has('id')) {
    const orderId = searchParams.get('id')
    const orders = await readCSV<any>('orders')
    const order = orders.find((o: any) => Number(o.id) === Number(orderId) && Number(o.user_id) === Number(userId))
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    const items = (await readCSV<any>('order_items')).filter((i: any) => Number(i.order_id) === Number(orderId))
    order.items = items.map((i: any) => ({
      id: Number(i.id), sneaker_id: Number(i.sneaker_id), name: i.name,
      price: Number(i.price), quantity: Number(i.quantity)
    }))
    return NextResponse.json(order)
  }

  const orders = (await readCSV<any>('orders')).filter((o: any) => Number(o.user_id) === Number(userId))
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((o: any) => ({ id: Number(o.id), total: Number(o.total), payment_method: o.payment_method, status: o.status, created_at: o.created_at }))
  return NextResponse.json(orders)
}
