'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { user, loading } = useAuth()
  const { items, count, total, updateQuantity, removeFromCart, clearCart } = useCart()
  const router = useRouter()

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading...</div>
  if (!user) { router.push('/login'); return null }

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-700 tracking-widest">Mock•Kicks</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">Continue Shopping</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Your cart is empty.</p>
            <Link href="/" className="inline-block mt-4 text-sm font-semibold text-white bg-gray-900 px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors">Browse Sneakers</Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-5 sm:items-center sm:gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 relative">
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href="/" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">{item.name}</Link>
                    <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">฿{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 sm:items-center sm:flex-row sm:gap-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-sm">−</button>
                      <span className="w-6 sm:w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-sm">+</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 sm:w-20 sm:text-right">฿{(item.price * item.quantity).toLocaleString()}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-600 cursor-pointer transition-colors">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-base">
                <span className="text-gray-600">Total ({count} {count === 1 ? 'item' : 'items'})</span>
                <span className="text-2xl font-bold text-gray-900">฿{total.toLocaleString()}</span>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={clearCart} className="px-6 py-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">Clear Cart</button>
                <Link href="/checkout" className="flex-1 py-3 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors text-center">Checkout</Link>
              </div>
            </div>
          </>
        )}
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
