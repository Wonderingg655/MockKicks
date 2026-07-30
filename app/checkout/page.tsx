'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
const CR = 'checkout_ref'
const CT = 'checkout_total'

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

async function getPaymentMethod(paymentMethodId: string) {
  const res = await fetch('/api/get-payment-method', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payment_method_id: paymentMethodId }),
  })
  return res.json()
}

function CheckoutForm({ clientSecret, checkoutRef, onDone, setProcessing }: { clientSecret: string; checkoutRef: string; onDone: (orderId: number | null) => void; setProcessing: (v: boolean) => void }) {
  const { user } = useAuth()
  const { items, total, clearCart } = useCart()
  const stripe = useStripe()
  const elements = useElements()
  const [form, setForm] = useState({ name: '', email: user?.email || '', phone: '', address: '', city: '', state: '', postal_code: '', country: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const saved = useRef(false)

  useEffect(() => {
    if (user?.email && !form.email) setForm((f) => ({ ...f, email: user.email }))
  }, [user?.email])

  if (!user) return null

  const saveCheckout = async () => {
    if (saved.current) return
    saved.current = true
    const orderData = {
      name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
      address: form.address.trim(), city: form.city.trim(), state: form.state.trim(),
      postal_code: form.postal_code.trim(), country: form.country.trim(),
      total,
      items: items.map((i) => ({ sneaker_id: i.sneaker_id, name: i.name, price: i.price, quantity: i.quantity })),
    }
    await fetch('/api/checkout-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', checkout_ref: checkoutRef, user_id: user.id, order_data: orderData }),
    })
  }

  const finalizeOrder = async (pmt?: string, walletType?: string) => {
    const body: Record<string, any> = { action: 'finalize', checkout_ref: checkoutRef }
    if (pmt) body.payment_method_type = pmt
    if (walletType) body.wallet_type = walletType
    const res = await fetch('/api/checkout-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Order creation failed')
    return data
  }

  const confirmAndFinalize = async () => {
    if (!stripe || !elements) return false
    await saveCheckout()
    sessionStorage.setItem(CR, checkoutRef)
    sessionStorage.setItem(CT, String(total))
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })
    if (confirmError) { setError(confirmError.message || 'Payment failed'); return false }
    if (paymentIntent?.status !== 'succeeded') { setError('Payment not completed.'); return false }
    return paymentIntent
  }

  const completePayment = async (paymentIntent: any, pmtOverride?: string) => {
    let pmt = 'card'
    let wt: string | undefined
    if (pmtOverride) {
      pmt = pmtOverride
    } else if (paymentIntent.payment_method) {
      try {
        const d = await getPaymentMethod(paymentIntent.payment_method as string)
        if (d.type) pmt = d.type
        if (d.wallet_type) wt = d.wallet_type
      } catch {}
    }
    try {
      const result = await finalizeOrder(pmt, wt)
      if (result.order_id || result.already_processed) {
        await clearCart()
        sessionStorage.removeItem(CR)
        sessionStorage.removeItem(CT)
        onDone(result.order_id || null)
      } else {
        setError('Order creation failed.')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setError('')
    setSubmitting(true)
    setProcessing(true)
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim() || !form.postal_code.trim() || !form.country.trim()) {
      setError('Please fill in all shipping fields.')
      setSubmitting(false); setProcessing(false); return
    }
    if (!items.length) { setError('Your cart is empty.'); setSubmitting(false); setProcessing(false); return }
    const { error: submitError } = await elements.submit()
    if (submitError) { setError(submitError.message || 'Validation error'); setSubmitting(false); setProcessing(false); return }
    const paymentIntent = await confirmAndFinalize()
    if (paymentIntent) await completePayment(paymentIntent)
    setSubmitting(false)
    setProcessing(false)
  }

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => update('name', e.target.value)} required className="sm:col-span-2 w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
        <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
      </div>
      <input type="text" placeholder="Street Address" value={form.address} onChange={(e) => update('address', e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" placeholder="City" value={form.city} onChange={(e) => update('city', e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
        <input type="text" placeholder="State" value={form.state} onChange={(e) => update('state', e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
        <input type="text" placeholder="Postal Code" value={form.postal_code} onChange={(e) => update('postal_code', e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
        <input type="text" placeholder="Country" value={form.country} onChange={(e) => update('country', e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
      </div>
      <div className="border-t border-gray-200 pt-4 mt-2">
        <p className="text-sm font-semibold text-gray-900 mb-3">Payment Method</p>
        <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-4">
          <ExpressCheckoutElement options={{ paymentMethods: { applePay: 'always', googlePay: 'always' } }} onConfirm={async (event) => {
            if (!stripe || !elements) return
            if (!items.length) { setError('Your cart is empty.'); return }
            setProcessing(true)
            await saveCheckout()
            sessionStorage.setItem(CR, checkoutRef)
            sessionStorage.setItem(CT, String(total))
            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
              elements, clientSecret,
              confirmParams: { return_url: window.location.href },
              redirect: 'if_required',
            })
            if (confirmError) { event.paymentFailed({ reason: 'fail', message: confirmError.message }); setProcessing(false); return }
            if (paymentIntent?.status !== 'succeeded') { setError('Payment not completed.'); event.paymentFailed({ reason: 'fail' }); setProcessing(false); return }
            await completePayment(paymentIntent, event.expressPaymentType)
            setProcessing(false)
          }} />
          <div className="border-t border-gray-200 pt-4">
            <PaymentElement />
          </div>
        </div>
      </div>
      <button type="submit" disabled={!stripe || !elements || submitting} className="w-full py-3.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
        {submitting ? 'Processing…' : `Pay ฿${total.toLocaleString()}`}
      </button>
    </form>
  )
}

function SuccessView({ total, orderId, userId }: { total: number; orderId: number | null; userId?: number | null }) {
  const [order, setOrder] = useState<any>(null)
  useEffect(() => {
    if (!orderId || !userId) return
    fetch(`/api/orders?user_id=${userId}&id=${orderId}`)
      .then((r) => r.json())
      .then((data) => { if (data && data.id) setOrder(data) })
      .catch(() => {})
  }, [orderId, userId])

  const pmtLabels: Record<string, string> = {
    card: 'Credit Card', promptpay: 'PromptPay', credit: 'Credit', truemoney: 'TrueMoney Wallet',
    alipay: 'Alipay', grabpay: 'GrabPay', wechat_pay: 'WeChat Pay', fpx: 'FPX', duitnow: 'DuitNow',
    paynow: 'PayNow', apple_pay: 'Apple Pay', google_pay: 'Google Pay',
  }

  if (!order || !order.items) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
        <p className="text-gray-500 mt-2">Your order has been placed.</p>
        {total > 0 && <p className="text-sm text-gray-400 mt-1">Total charged: ฿{total.toLocaleString()}</p>}
        <div className="mt-8 flex items-center gap-4">
          {orderId && <Link href={`/orders/${orderId}`} className="text-sm font-semibold text-white bg-gray-900 px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors">View Order</Link>}
          <Link href="/" className="text-sm font-semibold text-gray-600 border border-gray-200 px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-700 tracking-widest">Mock•Kicks</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Continue Shopping</Link>
      </nav>
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="text-gray-500 mt-1">Order #{order.id}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Shipping</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{order.name}</p>
            <p>{order.email} &middot; {order.phone}</p>
            <p>{order.address}</p>
            <p>{order.city}, {order.state} {order.postal_code}</p>
            <p>{order.country}</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Payment</h2>
          <p className="text-sm text-gray-600">Method: {pmtLabels[order.payment_method] || order.payment_method}</p>
          <p className="text-sm text-gray-600 mt-1">Status: <span className="text-green-600 font-medium">{order.status}</span></p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Items</h2>
          <div className="divide-y divide-gray-200">
            {order.items.map((item: any) => (
              <div key={order.id + '-' + item.id} className="flex items-center justify-between py-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-gray-400">x{item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">฿{(Number(item.price) * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3 mt-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Total</p>
            <p className="text-base font-bold text-gray-900">฿{Number(order.total).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link href={`/orders/${order.id}`} className="text-sm font-semibold text-white bg-gray-900 px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors">View Full Details</Link>
          <Link href="/" className="text-sm font-semibold text-gray-600 border border-gray-200 px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors">Continue Shopping</Link>
        </div>
      </main>
    </div>
  )
}

function FailedView() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
      <p className="text-gray-500 mt-2">Your payment could not be processed.</p>
      <p className="text-sm text-gray-400 mt-1">Please try again or use a different card.</p>
      <Link href="/cart" className="mt-8 inline-block text-sm font-semibold text-white bg-gray-900 px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors">Try Again</Link>
    </div>
  )
}

export default function CheckoutPage() {
  const { user, loading } = useAuth()
  const { items, total, clearCart } = useCart()
  const clearCartRef = useRef(clearCart)
  clearCartRef.current = clearCart
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState('')
  const [piError, setPiError] = useState('')
  const [checkoutRef] = useState(genId)
  const [done, setDone] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)
  const [savedTotal, setSavedTotal] = useState(0)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pi = params.get('payment_intent')
    const piSecret = params.get('payment_intent_client_secret')
    const status = params.get('redirect_status')

    if (pi) {
      const ref = sessionStorage.getItem(CR)
      const storedTotal = parseInt(sessionStorage.getItem(CT) || '0', 10)
      sessionStorage.removeItem(CR)
      sessionStorage.removeItem(CT)
      if (status === 'succeeded') {
        setProcessing(true)
        ;(async () => {
          let pmt = 'card'
          let wt: string | undefined
          if (piSecret) {
            try {
              const stripe = await stripePromise
              const { paymentIntent } = await stripe!.retrievePaymentIntent(piSecret)
              if (paymentIntent?.payment_method) {
                const d = await getPaymentMethod(paymentIntent.payment_method as string)
                if (d.type) pmt = d.type
                if (d.wallet_type) wt = d.wallet_type
              }
            } catch {}
          }
          if (ref) {
            try {
              const r = await fetch('/api/checkout-save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'finalize', checkout_ref: ref, payment_method_type: pmt, wallet_type: wt }),
              })
              const data = await r.json()
              if (data.order_id) setOrderId(data.order_id)
              if (data.order_id || data.already_processed) {
                await clearCartRef.current()
                setDone(true)
              }
            } catch {}
          } else {
            await clearCartRef.current()
            setDone(true)
          }
          if (storedTotal) setSavedTotal(storedTotal)
        })()
      } else {
        setFailed(true)
      }
      const url = new URL(window.location.href)
      url.search = ''
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  useEffect(() => {
    if (!total || items.length === 0 || done || failed) return
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total, checkout_ref: checkoutRef }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
          fetch('/api/checkout-save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_pi', checkout_ref: checkoutRef, payment_intent_id: data.paymentIntentId }),
          }).catch(() => {})
        } else setPiError(data.error || 'Failed to initialize payment')
      })
      .catch(() => setPiError('Failed to initialize payment'))
  }, [total, done, failed])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading...</div>
  if (!user) { router.push('/login'); return null }
  if (failed) return <FailedView />
  if (done) return <SuccessView total={savedTotal || total} orderId={orderId} userId={user.id} />

  return (
    <div className="min-h-screen bg-white font-sans">
      {processing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-white"><div className="relative w-10 h-10"><div className="absolute inset-0 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" /><div className="absolute inset-1.5 border-[3px] border-gray-400 border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} /></div></div>}
      <nav className="border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-700 tracking-widest">Mock•Kicks</Link>
        <Link href="/cart" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Back to Cart</Link>
      </nav>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
          {piError && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl mb-4">{piError}</p>}
          {!clientSecret && !piError && <p className="text-sm text-gray-400">Initializing payment…</p>}
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }} key={clientSecret}>
              <CheckoutForm clientSecret={clientSecret} checkoutRef={checkoutRef} onDone={(oid) => { setOrderId(oid); setDone(true) }} setProcessing={setProcessing} />
            </Elements>
          )}
        </div>
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="w-12 h-12 bg-white rounded-lg overflow-hidden shrink-0 relative">
                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-lg font-bold text-gray-900">฿{items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-gray-100 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-12">
            <div>
              <Link href="/" className="text-xl font-bold text-gray-700 tracking-widest">Mock•Kicks</Link>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed">Premium sneakers for every stride. Built for comfort, designed for life.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Navigate</h4>
              <div className="mt-4 flex flex-col gap-2.5">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Shop</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Account</h4>
              <div className="mt-4 flex flex-col gap-2.5">
                <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Sign In</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 py-6">
          <p className="text-xs text-gray-400 text-center max-w-md mx-auto leading-relaxed">This is a mock e-commerce site project meant for experimental and learning only.</p>
        </div>
      </footer>
    </div>
  )
}
