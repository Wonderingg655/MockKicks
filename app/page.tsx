'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from './context/AuthContext'
import { useCart } from './context/CartContext'

interface Sneaker {
  id: number
  name: string
  price: number
  image: string
  description: string
  category: string
}

function Navbar({ user, onLogout }: { user: { id: number; username: string; email: string; role: number } | null; onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { count } = useCart()

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
          <span className="text-2xl font-bold text-gray-700 tracking-widest">Mock•Kicks</span>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="relative text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
              <Link href="#shop" className="relative text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Shop</Link>
              {user ? <>
                <Link href="/cart" className="relative text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">My Cart{count > 0 && <span className="ml-1 text-xs font-semibold text-white bg-gray-800 px-1.5 h-5 leading-5 rounded-full text-center inline-block min-w-[1.25rem]">{count}</span>}</Link>
              </> : null}
              {user ? (
                <>
                  <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="text-sm font-medium text-gray-600 flex items-center gap-1.5 hover:text-gray-900 transition-colors cursor-pointer">{user.username}{user.role === 1 && <span className="text-xs font-semibold text-white bg-gray-800 px-2 py-0.5 rounded-full">Admin</span>}<svg className={`w-4 h-4 ml-0.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 animate-fade-in">
                        <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">My Orders</Link>
                        {user.role === 1 && <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Dashboard</Link>}
                        <button onClick={() => { setUserMenuOpen(false); onLogout() }} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">Sign Out</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="relative text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
                  <Link href="/register" className="text-sm  text-white bg-gray-600 hover:bg-gray-800 px-4 py-2 rounded-full transition-colors">Sign Up</Link>
                </>
              )}
            </div>
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
              <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all">Home</Link>
              <Link href="#shop" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all">Shop</Link>
              {user ? (
                <>
                  <Link href="/cart" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all">Cart{count > 0 ? ` (${count})` : ''}</Link>
                  <Link href="/orders" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all">My Orders</Link>
                  <span className="text-sm font-medium text-gray-600 px-3 py-2.5 flex items-center gap-1.5">{user.username}{user.role === 1 && <span className="text-xs font-semibold text-white bg-gray-800 px-2 py-0.5 rounded-full">Admin</span>}</span>
                  {user.role === 1 && <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all ml-4">Dashboard</Link>}
                  <button onClick={() => { setMenuOpen(false); onLogout(); }} className="w-full text-left text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all cursor-pointer">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all">Sign In</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="text-sm text-white bg-gray-600 hover:bg-gray-800 px-4 py-2.5 rounded-full transition-all text-center">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="text-center pb-2 -mt-2">
        <p className="text-[10px] text-gray-400 leading-none">This is a mock e-commerce site project meant for experimental and learning only.</p>
      </div>
    </nav>
  )
}

function Banner() {
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

          <a href="#shop" className="relative z-0 inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all mt-4 text-sm w-fit">Shop Now <span aria-hidden="true" className="font-black text-lg">&rarr;</span></a>

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
              {user ? (added ? 'Added!' : 'Add to Cart') : 'Sign in to purchase'}
            </button>
            <button
              onClick={handleClose}
              className="cursor-pointer flex-1 border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { user, logout } = useAuth()
  const [sneakers, setSneakers] = useState<Sneaker[]>([])
  const [selected, setSelected] = useState<Sneaker | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    fetch('/api/sneakers')
      .then((r) => r.json())
      .then(setSneakers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
    <div className="min-h-screen bg-white font-sans">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-1.5 border-[3px] border-gray-400 border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
        </div>
      )}
      <Navbar user={user} onLogout={logout} />
      <Banner />

      <section id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 overflow-hidden">
        <h2 className="text-3xl sm:text-5xl font-bold text-gray-700 mb-12 text-center">Featured Sneakers</h2>
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 mb-10 max-w-xl sm:max-w-2xl mx-auto w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sneakers..."
            className="w-full sm:flex-1 pl-9 pr-3 py-2.5 sm:py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative shrink-0" ref={categoryRef}>
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center gap-2 px-5 py-2.5 sm:py-2 text-sm border border-gray-200 rounded-full bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer whitespace-nowrap"
              >
                <span className={category === '' ? 'text-gray-500' : 'text-gray-900 font-medium'}>{category || 'All Categories'}</span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {categoryOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-45 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 animate-fade-in">
                  <div className="flex flex-col">
                    {[{ value: '', label: 'All Categories', className: 'text-gray-500' }, { value: 'Running', label: 'Running', className: 'font-medium' }, { value: 'Lifestyle', label: 'Lifestyle', className: 'font-medium' }, { value: 'Training', label: 'Training', className: 'font-medium' }, { value: 'Trail', label: 'Trail', className: 'font-medium' }].map((opt) => (
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
            <span className="text-sm text-gray-500 whitespace-nowrap shrink-0">{filtered.length} items</span>
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

      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-12">
            <div>
              <span className="text-xl font-bold text-gray-700 tracking-widest">Mock•Kicks</span>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed">Premium sneakers for every stride. Built for comfort, designed for life.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Navigate</h4>
              <div className="mt-4 flex flex-col gap-2.5">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
                <Link href="#shop" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Shop</Link>
                {user && <Link href="/cart" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Cart</Link>}
                {user?.role === 1 && <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Dashboard</Link>}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Account</h4>
              <div className="mt-4 flex flex-col gap-2.5">
                  {user ? (
                    <>
                      <Link href="/orders" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">My Orders</Link>
                      <button onClick={logout} className="text-left text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">Sign Out</button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Sign In</Link>
                      <Link href="/register" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Sign Up</Link>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 py-6">
          <p className="text-xs text-gray-400 text-center max-w-md mx-auto leading-relaxed">
            This is a mock e-commerce site project meant for experimental and learning only.
          </p>
        </div>
      </footer>

      {selected && (
        <SneakerModal sneaker={selected} onClose={() => setSelected(null)} user={user} />
      )}
    </div>
  )
}
