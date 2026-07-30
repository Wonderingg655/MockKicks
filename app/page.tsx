'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useAuth } from './context/AuthContext'
import { useCart } from './context/CartContext'
import { useLang } from './context/LanguageContext'

interface Sneaker {
  id: number
  name: string
  price: number
  image: string
  description: string
  category: string
}

function Banner() {
  const { t } = useLang()
  const newLocal = "max-sm:hidden max-md:visible uppercase tracking-[0.3em] text-base relative z-10"
  return (
    <section id="banner" className="relative h-[calc(100vh-4rem)] bg-cover bg-center bg-no-repeat flex flex-col overflow-hidden" style={{ backgroundImage: "url('/banner04.jpg')" }}>

      <div className="z-1 absolute right-0 top-1/2 -translate-y-1/2 -translate-x-10 max-lg:translate-x-10 max-[434px]:translate-x-20! max-lg:w-150 max-md:w-115 max-sm:w-110 ">
        <Image src="/sneakr.png" alt="sneaker" width={800} height={800} className="object-contain w-100% h-auto" unoptimized />
      </div>

      <div className="relative max-w-7xl px-5 sm:px-10 lg:px-15 h-full flex flex-col py-6">
        <div className="max-w-4xl flex-1 flex flex-col">

          <Image src="/bannerlogo.png" alt="Mock•Kicks" width={400} height={133} className="z-0 mb-6 -ml-3.5 w-75 h-auto  max-lg:w-55" loading="eager" />
          <Image src="/bannerbigtext.png" alt="MOVE YOUR WAY" width={500} height={300} className="mb-4 z-0 w-100.5 h-auto max-lg:w-87.5 max-md:max-w-75 max-sm:w-62.5" loading="eager" />

          <div className={newLocal}>Performance meets everyday comfort.</div>

          <a href="#shop" className="relative z-0 inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all mt-4 text-sm w-fit">{t('shopNow')} <span aria-hidden="true" className="font-black text-lg">&rarr;</span></a>

          <div className="flex flex-row flex-no-wrap gap-10 uppercase text-[0.7rem] relative z-10 mt-auto">
            <div className="group flex items-center flex-col hover:-translate-y-1 transition-all duration-300">
              <div className="h-15 w-15 rounded-full bg-accent group-hover:bg-white flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300">
                <Image src="/bannericosneaker.png" alt="icon" width={48} height={48} style={{ width: '45px', height: 'auto' }} className='mix-blend-darken ' />
              </div>
              <p className="font-bold mt-2  transition-colors duration-300">Premium</p>
              <p className=" transition-colors duration-300">Quality</p>
            </div>
            <div className="group flex items-center flex-col hover:-translate-y-1 transition-all duration-300">
              <div className="h-15 w-15 rounded-full bg-accent group-hover:bg-white flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300">
                <Image src="/bannericofeather.png" alt="icon" width={48} height={48} style={{ width: '36px', height: 'auto' }} className='mix-blend-darken ' />
              </div>
              <p className="font-bold mt-2  transition-colors duration-300">Lightweight</p>
              <p className=" transition-colors duration-300">Comfort</p>
            </div>
            <div className="group flex items-center flex-col hover:-translate-y-1 transition-all duration-300">
              <div className="h-15 w-15 rounded-full bg-accent group-hover:bg-white flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300">
                <Image src="/bannericorunning.png" alt="icon" width={48} height={48} style={{ width: '40px', height: 'auto' }} className='mix-blend-darken ' />
              </div>
              <p className="font-bold mt-2  transition-colors duration-300">Built for</p>
              <p className=" transition-colors duration-300">Performance</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-sm:hidden absolute bottom-0 right-0 w-64 h-32 bg-contain bg-center bg-no-repeat flex flex-col items-end justify-end py-5 px-6" style={{ backgroundImage: "url('/banneraccent.png')" }}>
        <div className="text-white flex flex-col w-auto h-auto">
          <p className="font-black text-m">NEW</p>
          <p className="text-s">COLLECTION</p>
          <p className="font-black text-m w-fit pb-1 border-b-3 border-white relative z-10">2024</p>
        </div>
      </div>
    </section>
  )
}

function SneakerCard({ sneaker, onClick }: { sneaker: Sneaker; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300"
    >
      <div className="cursor-pointer h-58 bg-gray-50 relative overflow-hidden">
        <Image
          src={sneaker.image}
          alt={sneaker.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="eager"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="cursor-pointer p-4 sm:p-5">
        <div className="flex flex-wrap gap-1.5">
          {sneaker.category.split(', ').map((cat) => (
            <span key={cat} className="text-xs font-medium text-white bg-gray-400 px-2.5 py-1 rounded-full">
              {cat}
            </span>
          ))}
        </div>
        <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
          {sneaker.name}
        </h3>
        <p className="mt-1.5 text-sm font-bold text-gray-900">
          ฿{sneaker.price.toLocaleString()}
        </p>
      </div>
    </button>
  )
}

function SneakerModal({ sneaker, onClose, user }: { sneaker: Sneaker; onClose: () => void; user: { id: number; username: string; email: string; role: number } | null }) {
  const [closing, setClosing] = useState(false)
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()
  const { t } = useLang()

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 200)
  }

  const handleAdd = async () => {
    await addToCart(sneaker.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={handleClose}>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${closing ? 'opacity-0' : 'animate-fade-in'}`} />
      <div
        className={`relative bg-white border-2 border-gray-200 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-200 ${closing ? 'opacity-0 scale-95' : 'animate-scale-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="cursor-pointer absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="h-56 bg-gray-50 relative">
          <Image src={sneaker.image} alt={sneaker.name} fill loading="eager" sizes="(max-width: 512px) 100vw, 512px" className="object-cover" />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
        <div className="flex flex-wrap gap-1.5">
                {sneaker.category.split(', ').map((cat) => (
                  <span key={cat} className="text-xs font-medium text-white bg-gray-400 px-2.5 py-1 rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-bold text-gray-900">{sneaker.name}</h2>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 whitespace-nowrap">
              ฿{sneaker.price.toLocaleString()}
            </p>
          </div>

          <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
            {sneaker.description}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button disabled={!user} onClick={handleAdd} className={`cursor-pointer flex-1 font-semibold px-6 py-3 rounded-xl transition-colors ${user ? (added ? 'bg-green-700 text-white' : 'bg-gray-900 text-white hover:bg-gray-800') : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              {user ? (added ? t('added') : t('addToCart')) : t('signIn')}
            </button>
            <button
              onClick={handleClose}
              className="cursor-pointer flex-1 border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {t('close') || 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const { t, lang, fontClass } = useLang()
  const [sneakers, setSneakers] = useState<Sneaker[]>([])
  const [selected, setSelected] = useState<Sneaker | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    fetch(`/api/sneakers?lang=${lang}`)
      .then((r) => r.json())
      .then(setSneakers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [lang])

  const filtered = sneakers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (!category || s.category.split(', ').includes(category))
  )

  const categoryRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className={`min-h-screen bg-white ${fontClass}`}>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-1.5 border-[3px] border-gray-400 border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
        </div>
      )}
      <Banner />

      <section id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 overflow-hidden">
        <h2 className="text-3xl sm:text-5xl font-bold text-gray-700 mb-12 text-center">{t('ourCollection')}</h2>
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 mb-10 max-w-xl sm:max-w-2xl mx-auto w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchSneakers')}
            className="w-full sm:flex-1 pl-9 pr-3 py-2.5 sm:py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative shrink-0" ref={categoryRef}>
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center gap-2 px-5 py-2.5 sm:py-2 text-sm border border-gray-200 rounded-full bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer whitespace-nowrap"
              >
                <span className={category === '' ? 'text-gray-500' : 'text-gray-900 font-medium'}>{category || t('allCategories')}</span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {categoryOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-45 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 animate-fade-in">
                  <div className="flex flex-col">
                    {[{ value: '', label: t('allCategories'), className: 'text-gray-500' }, { value: 'Running', label: 'Running', className: 'font-medium' }, { value: 'Lifestyle', label: 'Lifestyle', className: 'font-medium' }, { value: 'Training', label: 'Training', className: 'font-medium' }, { value: 'Trail', label: 'Trail', className: 'font-medium' }].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setCategory(opt.value); setCategoryOpen(false); }}
                        className={`w-full text-left px-5 py-2.5 sm:py-2 text-sm hover:bg-gray-100 transition-colors cursor-pointer ${category === opt.value ? 'bg-gray-50 font-semibold' : ''} ${opt.className}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap shrink-0">{filtered.length} {t('items')}</span>
          </div>
        </div>



        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No sneakers found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((s) => (
              <SneakerCard key={s.id} sneaker={s} onClick={() => setSelected(s)} />
            ))}
          </div>
        )}

      </section>

      {selected && (
        <SneakerModal sneaker={selected} onClose={() => setSelected(null)} user={user} />
      )}
    </div>
  )
}
