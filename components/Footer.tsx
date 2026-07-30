'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { useLang } from '@/app/context/LanguageContext'

export default function Footer() {
  const pathname = usePathname()
  if (pathname === '/login' || pathname === '/register') return null

  const { user, logout } = useAuth()
  const { t } = useLang()

  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-12">
          <div>
            <Link href="/" className="text-xl font-bold text-gray-700 tracking-widest">Mock•Kicks</Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">{t('premiumTagline')}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{t('navigate')}</h4>
            <div className="mt-4 flex flex-col gap-2.5">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('home')}</Link>
              <Link href="/#shop" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('shop')}</Link>
              {user && <Link href="/cart" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('cart')}</Link>}
              {user?.role === 1 && <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('dashboard')}</Link>}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{t('account')}</h4>
            <div className="mt-4 flex flex-col gap-2.5">
                {user ? (
                  <>
                    <Link href="/orders" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('myOrders')}</Link>
                    <button onClick={logout} className="text-left text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">{t('signOut')}</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('signIn')}</Link>
                    <Link href="/register" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{t('signUp')}</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 py-6">
        <p className="text-xs text-gray-400 text-center max-w-md mx-auto leading-relaxed">
          {t('mockDisclaimer')}
        </p>
      </div>
    </footer>
  )
}
