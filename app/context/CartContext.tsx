'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import {
  getCart,
  addCartItem,
  updateCartQuantity,
  removeCartItem,
  clearCart as clearStoredCart,
  subscribeStore,
  type CartItem,
} from '../../lib/store'

interface CartContextType {
  items: CartItem[]
  count: number
  total: number
  ready: boolean
  refreshCart: () => void
  addToCart: (sneakerId: number) => void
  updateQuantity: (cartId: number, quantity: number) => void
  removeFromCart: (cartId: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  const refreshCart = useCallback(() => {
    if (!user) {
      setItems([])
      setReady(true)
      return
    }
    setItems(getCart(user.id))
    setReady(true)
  }, [user])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cart can only be read after mount (localStorage)
    refreshCart()
  }, [refreshCart])

  useEffect(() => subscribeStore(refreshCart), [refreshCart])

  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const addToCart = (sneakerId: number) => {
    if (!user) return
    addCartItem(user.id, sneakerId)
    refreshCart()
  }

  const updateQuantity = (cartId: number, quantity: number) => {
    if (!user) return
    updateCartQuantity(user.id, cartId, quantity)
    refreshCart()
  }

  const removeFromCart = (cartId: number) => {
    if (!user) return
    removeCartItem(user.id, cartId)
    refreshCart()
  }

  const clearCart = () => {
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
