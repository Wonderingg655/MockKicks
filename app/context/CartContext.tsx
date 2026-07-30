'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface CartItem {
  id: number
  sneaker_id: number
  quantity: number
  name: string
  price: number
  image: string
  category: string
}

interface CartContextType {
  items: CartItem[]
  count: number
  total: number
  ready: boolean
  refreshCart: () => void
  addToCart: (sneakerId: number) => Promise<void>
  updateQuantity: (cartId: number, quantity: number) => Promise<void>
  removeFromCart: (cartId: number) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

let fetchReqId = 0

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  const fetchCart = () => {
    if (!user) { setItems([]); setReady(true); return }
    const id = Date.now()
    fetchReqId = id
    fetch(`/api/cart?user_id=${user.id}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && id === fetchReqId) { setItems(data); setReady(true) } })
      .catch(() => { setReady(true) })
  }

  useEffect(() => { fetchCart() }, [user?.id])

  const count = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  const addToCart = async (sneakerId: number) => {
    if (!user) return
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, sneaker_id: sneakerId }),
        cache: 'no-store',
      })
    } catch {}
    fetchCart()
  }

  const updateQuantity = async (cartId: number, quantity: number) => {
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cartId, quantity }),
        cache: 'no-store',
      })
    } catch {}
    fetchCart()
  }

  const removeFromCart = async (cartId: number) => {
    try {
      await fetch(`/api/cart?id=${cartId}`, { method: 'DELETE', cache: 'no-store' })
    } catch {}
    fetchCart()
  }

  const clearCart = async () => {
    fetchReqId = Date.now()
    setItems([])
    setReady(true)
    if (!user) return
    try {
      await fetch(`/api/cart?user_id=${user.id}&clear=1`, { method: 'DELETE', cache: 'no-store' })
    } catch {}
  }

  return (
    <CartContext.Provider value={{ items, count, total, ready, refreshCart: fetchCart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
