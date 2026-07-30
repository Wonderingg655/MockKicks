import { NextResponse } from 'next/server'
import { stripe } from '../../../lib/stripe'

export async function POST(req: Request) {
  try {
    const { payment_method_id } = await req.json()
    if (!payment_method_id) {
      return NextResponse.json({ error: 'payment_method_id required' }, { status: 400 })
    }
    const pm = await stripe.paymentMethods.retrieve(payment_method_id)
    const type = pm.type
    const walletType = (pm as any).card?.wallet?.type || null
    return NextResponse.json({ type, wallet_type: walletType })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
