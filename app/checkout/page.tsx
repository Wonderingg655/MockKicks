'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { createOrder, type Order } from '../../lib/store'

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
}

function SuccessView({ order }: { order: Order }) {
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
          <h1 className="text-2xl font-bold text-gray-900">Order Placed!</h1>
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
          <p className="text-sm text-gray-600">Method: Mock payment (no charge)</p>
          <p className="text-sm text-gray-600 mt-1">Status: <span className="text-green-600 font-medium">{order.status}</span></p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Items</h2>
          <div className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-gray-400">x{item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3 mt-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Total</p>
            <p className="text-base font-bold text-gray-900">฿{order.total.toLocaleString()}</p>
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

export default function CheckoutPage() {
  const { user, loading } = useAuth()
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  useEffect(() => {
    if (user?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill the email once the session is available
      setForm((current) => (current.email ? current : { ...current, email: user.email }))
    }
  }, [user?.email])

  const update = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) return
    const required = Object.values(form).every((value) => value.trim())
    if (!required) {
      setError('Please fill in all shipping fields.')
      return
    }
    if (!items.length) {
      setError('Your cart is empty.')
      return
    }

    setSubmitting(true)
    const created = createOrder({
      userId: user.id,
      username: user.username,
      shipping: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postal_code: form.postal_code.trim(),
        country: form.country.trim(),
      },
      items,
      total,
      paymentMethod: 'mock',
    })
    await clearCart()
    setOrder(created)
    setSubmitting(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading...</div>
  if (!user) return null
  if (order) return <SuccessView order={order} />

  return (
    <div className="min-h-screen bg-white font-sans">
      {submitting && <div className="fixed inset-0 z-50 flex items-center justify-center bg-white"><div className="relative w-10 h-10"><div className="absolute inset-0 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" /><div className="absolute inset-1.5 border-[3px] border-gray-400 border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} /></div></div>}
      <nav className="border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-700 tracking-widest">Mock•Kicks</Link>
        <Link href="/cart" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Back to Cart</Link>
      </nav>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
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
              <p className="text-sm font-semibold text-gray-900 mb-3">Payment</p>
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <p className="text-sm text-gray-700 font-medium">Mock payment</p>
                <p className="text-xs text-gray-500 mt-1">This demo does not process real payments. Placing an order records it in your browser only.</p>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
              {submitting ? 'Placing order…' : `Place Order — ฿${total.toLocaleString()}`}
            </button>
          </form>
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
              <span className="text-lg font-bold text-gray-900">฿{total.toLocaleString()}</span>
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
                <Link href="/#shop" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Shop</Link>
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
