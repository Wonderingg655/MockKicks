'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useLang } from './LanguageContext'
import {
  getCart,
  addCartItem,
  updateCartQuantity,
  removeCartItem,
  clearCart as clearStoredCart,
  subscribeStore,
  type CartItem,
} from '@/lib/store'

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

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { lang } = useLang()
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  const refreshCart = useCallback(() => {
    if (!user) {
      setItems([])
      setReady(true)
      return
    }
    setItems(getCart(user.id, lang))
    setReady(true)
  }, [user, lang])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cart can only be read after mount (localStorage)
    refreshCart()
  }, [refreshCart])

  useEffect(() => subscribeStore(refreshCart), [refreshCart])

  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const addToCart = async (sneakerId: number) => {
    if (!user) return
    addCartItem(user.id, sneakerId)
    refreshCart()
  }

  const updateQuantity = async (cartId: number, quantity: number) => {
    if (!user) return
    updateCartQuantity(user.id, cartId, quantity)
    refreshCart()
  }

  const removeFromCart = async (cartId: number) => {
    if (!user) return
    removeCartItem(user.id, cartId)
    refreshCart()
  }

  const clearCart = async () => {
    setItems([])
    setReady(true)
    if (!user) return
    clearStoredCart(user.id)
    refreshCart()
  }

  return (
    <CartContext.Provider
      value={{ items, count, total, ready, refreshCart, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
