'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'

interface OrderItem {
  id: number
  sneaker_id: number
  name: string
  price: number
  quantity: number
}

interface Order {
  id: number
  total: number
  payment_method: string
  status: string
  created_at: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postal_code: string
  country: string
  items: OrderItem[]
}

const pmtLabels: Record<string, string> = {
  card: 'Credit Card', promptpay: 'PromptPay', credit: 'Credit', truemoney: 'TrueMoney Wallet',
  alipay: 'Alipay', grabpay: 'GrabPay', wechat_pay: 'WeChat Pay', fpx: 'FPX', duitnow: 'DuitNow',
  paynow: 'PayNow', apple_pay: 'Apple Pay', google_pay: 'Google Pay',
}

export default function OrderDetailPage() {
  const { user, loading } = useAuth()
  const { t, fontClass } = useLang()
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/login'); return }
    if (!params.id) return
    fetch(`/api/orders?user_id=${user.id}&id=${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setOrder(data)
      })
      .catch(() => setError('Failed to load order.'))
      .finally(() => setFetching(false))
  }, [user, loading, params.id])

  if (loading || fetching) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-white"><div className="relative w-10 h-10"><div className="absolute inset-0 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" /><div className="absolute inset-1.5 border-[3px] border-gray-400 border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} /></div></div>
  if (!user) return null

  if (error) return (
    <div className={`min-h-screen flex items-center justify-center ${fontClass}`}>
      <div className="text-center">
        <p className="text-gray-500">{error}</p>
        <Link href="/orders" className="inline-block mt-4 text-sm font-semibold text-white bg-gray-900 px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors">{t('backToOrders') || 'Back to Orders'}</Link>
      </div>
    </div>
  )

  if (!order) return null

  return (
    <div>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('orderId')}{order.id}</h1>
            <p className="text-sm text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString()} &middot; <span className={order.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>{order.status}</span></p>
          </div>
          <span className="text-2xl font-bold text-gray-900">฿{Number(order.total).toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">{t('shipping')}</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium text-gray-900">{t('fullName')}:</span> {order.name}</p>
              <p><span className="font-medium text-gray-900">{t('email')}:</span> {order.email}</p>
              <p><span className="font-medium text-gray-900">{t('phone')}:</span> {order.phone}</p>
              <p><span className="font-medium text-gray-900">{t('streetAddress')}:</span> {order.address}, {order.city}, {order.state} {order.postal_code}, {order.country}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">{t('paymentMethod')}</h2>
            <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">{t('paymentMethod')}:</span> {pmtLabels[order.payment_method] || order.payment_method}</p>
            <p className="text-sm text-gray-600 mt-1"><span className="font-medium text-gray-900">Status:</span> <span className={order.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>{order.status}</span></p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">{t('items' as any) || 'Items'}</h2>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 sm:px-6 py-4">
                <div className="min-w-0 mr-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('qty')}: {item.quantity} &times; ฿{Number(item.price).toLocaleString()}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">฿{(Number(item.price) * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 px-4 sm:px-6">
            <span className="text-sm font-semibold text-gray-900">{t('total')}</span>
            <span className="text-lg font-bold text-gray-900">฿{Number(order.total).toLocaleString()}</span>
          </div>
        </div>
      </main>
    </div>
  )
}