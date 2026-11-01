'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setSubmitting(true)

    const result = login(username, password)
    if (result.error) {
      setMessage(result.error)
      setSubmitting(false)
      return
    }
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-white font-sans flex items-center justify-center px-4">
      {submitting && <div className="fixed inset-0 z-50 flex items-center justify-center bg-white"><div className="relative w-10 h-10"><div className="absolute inset-0 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" /><div className="absolute inset-1.5 border-[3px] border-gray-400 border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} /></div></div>}
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-gray-700 tracking-widest">Mock•Kicks</Link>
          <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
          <button type="submit" className="w-full py-3 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">Sign In</button>
        </form>
        {message && <p className="text-sm text-center mt-4 text-red-600">{message}</p>}
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 leading-relaxed">
          <p className="font-semibold text-gray-700 mb-1">Demo accounts</p>
          <p>Admin: <span className="font-mono">admin / admin123</span></p>
          <p>Customer: <span className="font-mono">demo / demo123</span></p>
        </div>
        <p className="text-sm text-center mt-6 text-gray-400">
          Don&apos;t have an account? <Link href="/register" className="text-gray-900 font-medium hover:underline">Register</Link>
        </p>
      </div>
      <p className="fixed bottom-4 left-0 right-0 text-center text-[10px] text-gray-400">This is a mock e-commerce site project meant for experimental and learning only.</p>
    </div>
  )
}
