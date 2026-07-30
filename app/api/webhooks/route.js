import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from '../../../lib/stripe'

export async function POST(req) {
  let event

  try {
    const sig = (await headers()).get('stripe-signature')
    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(
        await req.text(),
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } else {
      const text = await req.text()
      event = JSON.parse(text)
    }
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`)
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    const checkoutRef = pi.metadata?.checkout_ref
    if (checkoutRef) {
      let paymentMethodType = pi.payment_method_types?.[0] || 'card'
      let walletType
      if (pi.payment_method) {
        try {
          const pm = await stripe.paymentMethods.retrieve(pi.payment_method)
          const wt = pm?.card?.wallet?.type
          if (wt) walletType = wt
        } catch {}
      }
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/checkout-save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'finalize', checkout_ref: checkoutRef, payment_method_type: paymentMethodType, wallet_type: walletType }),
        })
      } catch (err) {
        console.log('Webhook finalize error:', err)
      }
    }
  }

  return NextResponse.json({ message: 'Received' }, { status: 200 })
}
