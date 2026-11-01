'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useLang } from '../context/LanguageContext'
import { createOrder, type Order } from '@/lib/store'

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
  const { t } = useLang()

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('paymentSuccessful')}</h1>
        <p className="text-gray-500 mt-1">{t('orderId')}{order.id}</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">{t('shipping')}</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>{order.name}</p>
          <p>{order.email} &middot; {order.phone}</p>
          <p>{order.address}</p>
          <p>{order.city}, {order.state} {order.postal_code}</p>
          <p>{order.country}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">{t('paymentMethod')}</h2>
        <p className="text-sm text-gray-600">{t('method')} {t('mockPayment')}</p>
        <p className="text-sm text-gray-600 mt-1">{t('statusLabel')} <span className="text-green-600 font-medium">{order.status}</span></p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">{t('items')}</h2>
        <div className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <div key={order.id + '-' + item.id} className="flex items-center justify-between py-3">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-gray-400">{t('qty')}: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-3 mt-1 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">{t('total')}</p>
          <p className="text-base font-bold text-gray-900">฿{order.total.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Link href={`/orders/${order.id}`} className="text-sm font-semibold text-white bg-gray-900 px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors">{t('viewFullDetails')}</Link>
        <Link href="/" className="text-sm font-semibold text-gray-600 border border-gray-200 px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors">{t('continueShopping')}</Link>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  const { user, loading } = useAuth()
  const { items, total, clearCart } = useCart()
  const { t, fontClass } = useLang()
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
    if (!Object.values(form).every((value) => value.trim())) {
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

  if (loading) return <div className={`min-h-screen flex items-center justify-center text-sm text-gray-400 ${fontClass}`}>{t('loading')}</div>
  if (!user) return null
  if (order) return <div className={fontClass}><SuccessView order={order} /></div>

  return (
    <div className={fontClass}>
      {submitting && <div className="fixed inset-0 z-50 flex items-center justify-center bg-white"><div className="relative w-10 h-10"><div className="absolute inset-0 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" /><div className="absolute inset-1.5 border-[3px] border-gray-400 border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} /></div></div>}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t('checkoutTitle')}</h1>
            <Link href="/cart" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('backToCart')}</Link>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder={t('fullName')} value={form.name} onChange={(e) => update('name', e.target.value)} required className="sm:col-span-2 w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
              <input type="email" placeholder={t('email')} value={form.email} onChange={(e) => update('email', e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
              <input type="tel" placeholder={t('phone')} value={form.phone} onChange={(e) => update('phone', e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
            </div>
            <input type="text" placeholder={t('streetAddress')} value={form.address} onChange={(e) => update('address', e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder={t('city')} value={form.city} onChange={(e) => update('city', e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
              <input type="text" placeholder={t('state')} value={form.state} onChange={(e) => update('state', e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
              <input type="text" placeholder={t('postalCode')} value={form.postal_code} onChange={(e) => update('postal_code', e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
              <input type="text" placeholder={t('country')} value={form.country} onChange={(e) => update('country', e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
            </div>
            <div className="border-t border-gray-200 pt-4 mt-2">
              <p className="text-sm font-semibold text-gray-900 mb-3">{t('paymentMethod')}</p>
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <p className="text-sm text-gray-700 font-medium">{t('mockPayment')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('mockPaymentNote')}</p>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
              {submitting ? t('processing') : `${t('placeOrder')} — ฿${total.toLocaleString()}`}
            </button>
          </form>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">{t('orderSummary')}</h2>
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="w-12 h-12 bg-white rounded-lg overflow-hidden shrink-0 relative">
                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{t('qty')}: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('total')}</span>
              <span className="text-lg font-bold text-gray-900">฿{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
