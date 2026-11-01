'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  authenticate,
  registerUser,
  getSession,
  setSession,
  type PublicUser,
} from '@/lib/store'

interface AuthContextType {
  user: PublicUser | null
  loading: boolean
  login: (username: string, password: string) => { error?: string }
  register: (username: string, email: string, password: string) => { error?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- session can only be read after mount (localStorage)
    setUser(getSession())
    setLoading(false)
  }, [])

  const login = (username: string, password: string) => {
    const result = authenticate(username, password)
    if (result.user) {
      setSession(result.user)
      setUser(result.user)
    }
    return result.error ? { error: result.error } : {}
  }

  const register = (username: string, email: string, password: string) => {
    const result = registerUser(username, email, password)
    return result.error ? { error: result.error } : {}
  }

  const logout = () => {
    setSession(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
