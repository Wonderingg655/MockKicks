import { NextRequest, NextResponse } from 'next/server'
import { readCSV } from '@/lib/csv'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orders = readCSV<any>('orders').sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const users = readCSV<any>('users')

  if (searchParams.has('id')) {
    const orderId = searchParams.get('id')
    const order = orders.find((o: any) => Number(o.id) === Number(orderId))
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    const u = users.find((u: any) => Number(u.id) === Number(order.user_id))
    order.username = u?.username || ''
    order.total = Number(order.total)
    const items = readCSV<any>('order_items').filter((i: any) => Number(i.order_id) === Number(orderId))
    order.items = items.map((i: any) => ({ id: Number(i.id), sneaker_id: Number(i.sneaker_id), name: i.name, price: Number(i.price), quantity: Number(i.quantity) }))
    return NextResponse.json(order)
  }

  const result = orders.map((o: any) => {
    const u = users.find((u: any) => Number(u.id) === Number(o.user_id))
    return { id: Number(o.id), user_id: Number(o.user_id), username: u?.username || '', total: Number(o.total), payment_method: o.payment_method, status: o.status, created_at: o.created_at }
  })
  return NextResponse.json(result)
}
