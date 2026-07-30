'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { useCart } from '@/app/context/CartContext'
import { useLang } from '@/app/context/LanguageContext'

export default function Navbar() {
  const pathname = usePathname()
  if (pathname === '/login' || pathname === '/register') return null

  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const { count } = useCart()
  const { t, lang, toggleLang } = useLang()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-gray-700 tracking-widest">Mock•Kicks</Link>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="relative text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{t('home')}</Link>
              <Link href="/#shop" className="relative text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{t('shop')}</Link>
              {user ? <>
                <Link href="/cart" className="relative text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{t('myCart')}{count > 0 && <span className="ml-1 text-xs font-semibold text-white bg-gray-800 px-1.5 h-5 leading-5 rounded-full text-center inline-block min-w-[1.25rem]">{count}</span>}</Link>
              </> : null}
              {user ? (
                <>
                  <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="text-sm font-medium text-gray-600 flex items-center gap-1.5 hover:text-gray-900 transition-colors cursor-pointer">{user.username}{user.role === 1 && <span className="text-xs font-semibold text-white bg-gray-800 px-2 py-0.5 rounded-full">Admin</span>}<svg className={`w-4 h-4 ml-0.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 animate-fade-in">
                        <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">{t('myOrders')}</Link>
                        {user.role === 1 && <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">{t('dashboard')}</Link>}
                        <button onClick={() => { setUserMenuOpen(false); logout() }} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">{t('signOut')}</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="relative text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{t('signIn')}</Link>
                  <Link href="/register" className="text-sm  text-white bg-gray-600 hover:bg-gray-800 px-4 py-2 rounded-full transition-colors">{t('signUp')}</Link>
                </>
              )}
            </div>
            <button onClick={toggleLang} className="text-xs font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer">{lang === 'th' ? 'TH' : 'EN'}</button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full border-b border-gray-100 animate-slide-down bg-white/95 backdrop-blur-xl shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5 pt-4">
            <div className="flex flex-col gap-1">
              <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all">{t('home')}</Link>
              <Link href="/#shop" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all">{t('shop')}</Link>
              {user ? (
                <>
                  <Link href="/cart" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all">{t('myCart')}{count > 0 ? ` (${count})` : ''}</Link>
                  <Link href="/orders" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all">{t('myOrders')}</Link>
                  <span className="text-sm font-medium text-gray-600 px-3 py-2.5 flex items-center gap-1.5">{user.username}{user.role === 1 && <span className="text-xs font-semibold text-white bg-gray-800 px-2 py-0.5 rounded-full">Admin</span>}</span>
                  {user.role === 1 && <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all ml-4">{t('dashboard')}</Link>}
                  <button onClick={() => { setMenuOpen(false); logout(); }} className="w-full text-left text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all cursor-pointer">{t('signOut')}</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all">{t('signIn')}</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="text-sm text-white bg-gray-600 hover:bg-gray-800 px-4 py-2.5 rounded-full transition-all text-center">{t('signUp')}</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="text-center pb-2 -mt-2">
        <p className="text-[10px] text-gray-400 leading-none">{t('mockDisclaimer')}</p>
      </div>
    </nav>
  )
}
