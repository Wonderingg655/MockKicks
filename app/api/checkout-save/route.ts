import { NextRequest, NextResponse } from 'next/server'
import { readCSV, insert, update, remove, nextId } from '@/lib/csv'

export async function POST(req: NextRequest) {
  const data = await req.json()
  if (!data?.action) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  if (data.action === 'save') {
    if (!data.checkout_ref || !data.user_id || !data.order_data) {
      return NextResponse.json({ error: 'checkout_ref, user_id, and order_data are required.' }, { status: 400 })
    }
    const pending = await readCSV<any>('pending_checkouts')
    const existing = pending.find((p: any) => p.checkout_ref === data.checkout_ref)
    if (existing) {
      await update('pending_checkouts', Number(existing.id), { data: JSON.stringify(data.order_data) })
    } else {
      await insert('pending_checkouts', { id: String(await nextId('pending_checkouts')), checkout_ref: data.checkout_ref, user_id: String(data.user_id), payment_intent_id: '', data: JSON.stringify(data.order_data), created_at: new Date().toISOString() })
    }
    return NextResponse.json({ message: 'Saved.' })
  }

  if (data.action === 'update_pi') {
    if (!data.checkout_ref || !data.payment_intent_id) {
      return NextResponse.json({ error: 'checkout_ref and payment_intent_id required.' }, { status: 400 })
    }
    const pending = await readCSV<any>('pending_checkouts')
    const p = pending.find((p: any) => p.checkout_ref === data.checkout_ref)
    if (p) await update('pending_checkouts', Number(p.id), { payment_intent_id: data.payment_intent_id })
    return NextResponse.json({ message: 'Updated.' })
  }

  if (data.action === 'finalize') {
    if (!data.checkout_ref) return NextResponse.json({ error: 'checkout_ref required.' }, { status: 400 })
    const pending = await readCSV<any>('pending_checkouts')
    const p = pending.find((p: any) => p.checkout_ref === data.checkout_ref)
    if (!p) return NextResponse.json({ message: 'Order already processed.', already_processed: true })

    const orderData = JSON.parse(p.data)
    let total = 0
    for (const item of orderData.items) total += Number(item.price) * Number(item.quantity)

    const paymentMethod = data.wallet_type || data.payment_method_type || 'card'
    const orderId = await nextId('orders')
    const now = new Date().toISOString()

    await insert('orders', {
      id: String(orderId), user_id: p.user_id,
      name: orderData.name, email: orderData.email, phone: orderData.phone,
      address: orderData.address, city: orderData.city, state: orderData.state,
      postal_code: orderData.postal_code, country: orderData.country,
      total: String(total), payment_method: paymentMethod,
      payment_details: JSON.stringify({ stripe_payment_intent_id: p.payment_intent_id }),
      status: 'paid', created_at: now
    })

    for (const item of orderData.items) {
      await insert('order_items', {
        id: String(await nextId('order_items')), order_id: String(orderId),
        sneaker_id: String(item.sneaker_id), name: item.name,
        price: String(item.price), quantity: String(item.quantity)
      })
    }

    await remove('cart', (c: any) => Number(c.user_id) === Number(p.user_id))
    await remove('pending_checkouts', (pc: any) => Number(pc.id) === Number(p.id))

    try {
      const { sendOrderNotification } = await import('@/lib/mail')
      await sendOrderNotification(orderId, orderData.name, orderData.email, orderData.phone, orderData.address, orderData.city, orderData.state, orderData.postal_code, orderData.country, total, paymentMethod, orderData.items)
    } catch (e) { console.error('Order notification failed:', e) }

    return NextResponse.json({ message: 'Order placed successfully.', order_id: orderId })
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('checkout_ref')
  const pi = searchParams.get('payment_intent_id')
  if (!ref && !pi) return NextResponse.json({ error: 'checkout_ref or payment_intent_id required.' }, { status: 400 })
  const pending = await readCSV<any>('pending_checkouts')
  const p = ref ? pending.find((p: any) => p.checkout_ref === ref) : pending.find((p: any) => p.payment_intent_id === pi)
  if (!p) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  return NextResponse.json({ checkout_ref: p.checkout_ref, user_id: Number(p.user_id), payment_intent_id: p.payment_intent_id, order_data: JSON.parse(p.data) })
}

export async function DELETE(req: NextRequest) {
  const data = await req.json()
  if (!data?.checkout_ref) return NextResponse.json({ error: 'checkout_ref required.' }, { status: 400 })
  await remove('pending_checkouts', (p: any) => p.checkout_ref === data.checkout_ref)
  return NextResponse.json({ message: 'Deleted.' })
}
