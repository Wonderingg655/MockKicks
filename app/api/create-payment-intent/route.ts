import { NextResponse } from 'next/server'
import { stripe } from '../../../lib/stripe'

export async function POST(req: Request) {
  try {
    const { amount, checkout_ref } = await req.json()
    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'thb',
      automatic_payment_methods: { enabled: true },
      metadata: checkout_ref ? { checkout_ref } : undefined,
    })
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
