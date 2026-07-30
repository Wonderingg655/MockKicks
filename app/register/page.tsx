'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '../context/LanguageContext'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { t, fontClass } = useLang()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Registration successful! Redirecting to sign in...')
        setTimeout(() => router.push('/login'), 1500)
      } else {
        setMessage(data.error || 'Registration failed.')
      }
    } catch {
      setMessage('Connection error.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen bg-white ${fontClass} flex items-center justify-center px-4`}>
      {submitting && <div className="fixed inset-0 z-50 flex items-center justify-center bg-white"><div className="relative w-10 h-10"><div className="absolute inset-0 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" /><div className="absolute inset-1.5 border-[3px] border-gray-400 border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} /></div></div>}
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-gray-700 tracking-widest">Mock•Kicks</Link>
          <p className="text-sm text-gray-400 mt-1">{t('createAccount')}</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" placeholder={t('username')} value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
          <input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
          <input type="password" placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
          <button type="submit" className="w-full py-3 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">{t('createAccount')}</button>
        </form>
        {message && <p className="text-sm text-center mt-4 text-gray-600">{message}</p>}
        <p className="text-sm text-center mt-6 text-gray-400">
          {t('haveAccount')} <Link href="/login" className="text-gray-900 font-medium hover:underline">{t('signIn')}</Link>
        </p>
      </div>
      <p className="fixed bottom-4 left-0 right-0 text-center text-[10px] text-gray-400">{t('mockDisclaimer')}</p>
    </div>
  )
}