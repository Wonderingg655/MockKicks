'use client'

import { ReactNode } from 'react'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { LanguageProvider } from './context/LanguageContext'

export default function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider><LanguageProvider><CartProvider>{children}</CartProvider></LanguageProvider></AuthProvider>
}
