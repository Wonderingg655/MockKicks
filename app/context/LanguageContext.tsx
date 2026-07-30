'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Lang } from '@/lib/translations'

interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  toggleLang: () => void
  t: (key: keyof typeof translations.en) => string
  fontClass: string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key,
  fontClass: '',
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const toggleLang = () => setLang(l => l === 'en' ? 'th' : 'en')
  const t = (key: keyof typeof translations.en): string => translations[lang][key] || key
  const fontClass = 'font-sans'

  useEffect(() => {
    const saved = localStorage.getItem('lang')
    if (saved === 'th' || saved === 'en') setLang(saved)
  }, [])

  useEffect(() => localStorage.setItem('lang', lang), [lang])
  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, fontClass }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)