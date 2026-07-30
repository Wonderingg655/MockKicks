'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'

interface Order {
  id: number
  total: number
  payment_method: string
  status: string
  created_at: string
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const { t, fontClass } = useLang()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/login'); return }
    fetch(`/api/orders?user_id=${user.id}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOrders(data) })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [user, loading])

  if (loading || fetching) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-white"><div className="relative w-10 h-10"><div className="absolute inset-0 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" /><div className="absolute inset-1.5 border-[3px] border-gray-400 border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} /></div></div>
  if (!user) return null

  return (
    <div>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('orderHistory')}</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">{t('noOrders')}</p>
            <Link href="/" className="inline-block mt-4 text-sm font-semibold text-white bg-gray-900 px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors">{t('startShopping')}</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between py-5 hover:bg-gray-50 -mx-4 px-4 rounded-xl transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('orderId')}{order.id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">฿{Number(order.total).toLocaleString()}</p>
                  <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}