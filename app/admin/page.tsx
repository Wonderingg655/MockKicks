'use client'

import { useEffect, useState, useCallback, useRef, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import Link from 'next/link'

interface UserRow {
  id: number
  username: string
  email: string
  role: number
  created_at: string
}

interface SneakerRow {
  id: number
  name: string
  price: number
  image: string
  description: string
  category: string
}

type Tab = 'users' | 'sneakers' | 'orders'
type ModalMode = 'add' | 'edit' | null

export default function AdminPage() {
  const { user, loading } = useAuth()
  const { t, fontClass } = useLang()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('users')

  const [users, setUsers] = useState<UserRow[]>([])
  const [sneakers, setSneakers] = useState<SneakerRow[]>([])

  interface OrderRow { id: number; user_id: number; username: string; total: number; payment_method: string; status: string; created_at: string }
  interface OrderItemRow { id: number; sneaker_id: number; name: string; price: number; quantity: number }
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)
  const [orderItems, setOrderItems] = useState<Record<number, OrderItemRow[]>>({})
  const [loadingItems, setLoadingItems] = useState<Record<number, boolean>>({})

  const [fetching, setFetching] = useState(true)

  const [modal, setModal] = useState<ModalMode>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [error, setError] = useState('')

  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 0 })
  const [sneakerForm, setSneakerForm] = useState({ name: '', price: 0, image: '/sneakplaceholder.png', description: '', category: '' })
  const [editUser, setEditUser] = useState<UserRow | null>(null)
  const [editSneaker, setEditSneaker] = useState<SneakerRow | null>(null)

  const fetchUsers = useCallback(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => { setUsers(data); setFetching(false) })
      .catch(() => setFetching(false))
  }, [])

  const fetchSneakers = useCallback(() => {
    fetch('/api/admin/sneakers')
      .then((r) => r.json())
      .then((data) => { setSneakers(data); setFetching(false) })
      .catch(() => setFetching(false))
  }, [])

  const fetchOrders = useCallback(() => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((data) => { setOrders(data); setFetching(false) })
      .catch(() => setFetching(false))
  }, [])

  const toggleOrderItems = async (orderId: number) => {
    if (expandedOrder === orderId) { setExpandedOrder(null); return }
    if (orderItems[orderId]) { setExpandedOrder(orderId); return }
    setLoadingItems(prev => ({ ...prev, [orderId]: true }))
    setExpandedOrder(orderId)
    try {
      const r = await fetch(`/api/admin/orders?id=${orderId}`)
      const data = await r.json()
      setOrderItems(prev => ({ ...prev, [orderId]: data.items || [] }))
    } catch {}
    setLoadingItems(prev => ({ ...prev, [orderId]: false }))
  }

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/login'); return }
    if (user.role !== 1) { router.push('/'); return }
    if (tab === 'users') fetchUsers()
    else if (tab === 'sneakers') fetchSneakers()
    else fetchOrders()
  }, [user, loading, tab])

  const openAdd = () => {
    setUserForm({ username: '', email: '', password: '', role: 0 })
    setSneakerForm({ name: '', price: 0, image: '/sneakplaceholder.png', description: '', category: '' })
    setEditUser(null)
    setEditSneaker(null)
    setModal('add')
    setError('')
  }

  const openEditUser = (u: UserRow) => {
    setUserForm({ username: u.username, email: u.email, password: '', role: u.role })
    setEditUser(u)
    setEditSneaker(null)
    setModal('edit')
    setError('')
  }

  const openEditSneaker = (s: SneakerRow) => {
    setSneakerForm({ name: s.name, price: s.price, image: s.image, description: s.description, category: s.category })
    setEditSneaker(s)
    setEditUser(null)
    setModal('edit')
    setError('')
  }

  const handleSave = async () => {
    setError('')
    if (tab === 'users') {
      if (!userForm.username.trim() || !userForm.email.trim()) { setError('Username and email are required.'); return }
      if (modal === 'add' && !userForm.password) { setError('Password is required for new users.'); return }
      const isEdit = modal === 'edit'
      const url = isEdit ? `/api/admin/users?id=${editUser!.id}` : '/api/admin/users'
      const body: any = { username: userForm.username.trim(), email: userForm.email.trim(), role: userForm.role }
      if (userForm.password) body.password = userForm.password
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setModal(null); fetchUsers() }
      else { const d = await res.json(); setError(d.error || 'Failed to save user.') }
    } else {
      if (!sneakerForm.name.trim() || !sneakerForm.category.trim()) { setError('Name and at least one category are required.'); return }
      const isEdit = modal === 'edit'
      const url = isEdit ? `/api/admin/sneakers?id=${editSneaker!.id}` : '/api/admin/sneakers'
      const body = { name: sneakerForm.name.trim(), price: sneakerForm.price, image: sneakerForm.image.trim(), description: sneakerForm.description.trim(), category: sneakerForm.category.trim() }
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setModal(null); fetchSneakers() }
      else { const d = await res.json(); setError(d.error || 'Failed to save item.') }
    }
  }

  const handleDelete = async (id: number) => {
    const endpoint = tab === 'users' ? '/api/admin/users' : '/api/admin/sneakers'
    await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    if (tab === 'users') fetchUsers()
    else fetchSneakers()
  }

  if (!user || user.role !== 1) return null

  return (
    <div>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
            <p className="text-sm text-gray-400 mt-1">{tab === 'users' ? t('manageUsers') : tab === 'sneakers' ? t('manageItems') : t('viewOrders')}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex bg-gray-100 rounded-full p-1">
              <button onClick={() => { setTab('users'); setFetching(true) }} className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${tab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t('users')}</button>
              <button onClick={() => { setTab('sneakers'); setFetching(true) }} className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${tab === 'sneakers' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t('sneakers')}</button>
              <button onClick={() => { setTab('orders'); setFetching(true); setExpandedOrder(null) }} className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${tab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t('orders')}</button>
            </div>
            {tab !== 'orders' && <button onClick={openAdd} className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span className="hidden sm:inline">{t('add')} {tab === 'users' ? t('user') : t('item')}</span>
              <span className="sm:hidden">{t('add')}</span>
            </button>}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {fetching ? (
            <div className="p-6 text-sm text-gray-400">{t('loading')}</div>
          ) : tab === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-4 sm:px-6 py-3 font-medium">ID</th>
                    <th className="px-4 sm:px-6 py-3 font-medium">Username</th>
                    <th className="px-4 sm:px-6 py-3 font-medium hidden sm:table-cell">Email</th>
                    <th className="px-4 sm:px-6 py-3 font-medium">Role</th>
                    <th className="px-4 sm:px-6 py-3 font-medium hidden md:table-cell">Created</th>
                    <th className="px-4 sm:px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 text-gray-500 text-xs sm:text-sm">{u.id}</td>
                      <td className="px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-sm">{u.username}</td>
                      <td className="px-4 sm:px-6 py-4 text-gray-600 text-xs sm:text-sm hidden sm:table-cell truncate max-w-[120px] lg:max-w-none">{u.email}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.role === 1 ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role === 1 ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-500 text-xs hidden md:table-cell">{u.created_at}</td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <button onClick={() => openEditUser(u)} className="px-2 sm:px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">Edit</button>
                          {u.id !== user.id && (
                            deleteConfirm === u.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDelete(u.id)} className="px-2 sm:px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer">Del</button>
                                <button onClick={() => setDeleteConfirm(null)} className="px-2 sm:px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 rounded-lg transition-colors cursor-pointer">No</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirm(u.id)} className="px-2 sm:px-3 py-1.5 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors cursor-pointer">Del</button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : tab === 'sneakers' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-4 sm:px-6 py-3 font-medium">ID</th>
                    <th className="px-4 sm:px-6 py-3 font-medium">Name</th>
                    <th className="px-4 sm:px-6 py-3 font-medium">Price</th>
                    <th className="px-4 sm:px-6 py-3 font-medium hidden sm:table-cell">Category</th>
                    <th className="px-4 sm:px-6 py-3 font-medium hidden md:table-cell">Image</th>
                    <th className="px-4 sm:px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sneakers.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 text-gray-500 text-xs sm:text-sm">{s.id}</td>
                      <td className="px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-sm truncate max-w-[100px] sm:max-w-none">{s.name}</td>
                      <td className="px-4 sm:px-6 py-4 text-gray-600 text-xs sm:text-sm whitespace-nowrap">฿{s.price.toLocaleString()}</td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {s.category.split(', ').map((cat) => (
                            <span key={cat} className="text-xs font-semibold text-white bg-gray-400 px-2 py-0.5 rounded-full">{cat}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-500 text-xs max-w-[120px] truncate hidden md:table-cell">{s.image}</td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <button onClick={() => openEditSneaker(s)} className="px-2 sm:px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">Edit</button>
                          {deleteConfirm === s.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(s.id)} className="px-2 sm:px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer">Del</button>
                              <button onClick={() => setDeleteConfirm(null)} className="px-2 sm:px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 rounded-lg transition-colors cursor-pointer">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(s.id)} className="px-2 sm:px-3 py-1.5 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors cursor-pointer">Del</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-4 sm:px-6 py-3 font-medium">ID</th>
                    <th className="px-4 sm:px-6 py-3 font-medium">Customer</th>
                    <th className="px-4 sm:px-6 py-3 font-medium hidden sm:table-cell">Total</th>
                    <th className="px-4 sm:px-6 py-3 font-medium hidden sm:table-cell">Payment</th>
                    <th className="px-4 sm:px-6 py-3 font-medium">Status</th>
                    <th className="px-4 sm:px-6 py-3 font-medium hidden md:table-cell">Date</th>
                    <th className="px-4 sm:px-6 py-3 font-medium text-right">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <Fragment key={o.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 text-gray-500 text-xs sm:text-sm">#{o.id}</td>
                        <td className="px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-sm">{o.username}</td>
                        <td className="px-4 sm:px-6 py-4 text-gray-600 text-xs sm:text-sm hidden sm:table-cell">฿{o.total.toLocaleString()}</td>
                        <td className="px-4 sm:px-6 py-4 text-gray-500 text-xs hidden sm:table-cell">{o.payment_method || '—'}</td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${o.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-gray-500 text-xs hidden md:table-cell">{o.created_at}</td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <button onClick={() => toggleOrderItems(o.id)} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                            {expandedOrder === o.id ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                      {expandedOrder === o.id && (
                        <tr>
                          <td colSpan={7} className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
                            {loadingItems[o.id] ? (
                              <p className="text-sm text-gray-400">Loading...</p>
                            ) : !orderItems[o.id] || orderItems[o.id].length === 0 ? (
                              <p className="text-sm text-gray-400">No items found.</p>
                            ) : (
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="pb-2 font-medium">Item</th>
                                    <th className="pb-2 font-medium">Price</th>
                                    <th className="pb-2 font-medium">Qty</th>
                                    <th className="pb-2 font-medium text-right">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {orderItems[o.id].map((item) => (
                                    <tr key={o.id + '-' + item.id}>
                                      <td className="py-2 text-gray-900 font-medium">{item.name}</td>
                                      <td className="py-2 text-gray-600">฿{item.price.toLocaleString()}</td>
                                      <td className="py-2 text-gray-600">{item.quantity}</td>
                                      <td className="py-2 text-gray-900 font-medium text-right">฿{(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" onClick={() => setModal(null)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{modal === 'add' ? t('add') : t('edit')} {tab === 'users' ? t('user') : t('item')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="flex flex-col gap-4">
              {tab === 'users' ? (
                <>
                  <input type="text" placeholder="Username" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                  <input type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                  <input type="password" placeholder={modal === 'edit' ? 'New password (leave blank to keep)' : 'Password'} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required={modal === 'add'} className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">Role:</label>
                    <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: Number(e.target.value) })} className="px-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none">
                      <option value={0}>User</option>
                      <option value={1}>Admin</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <input type="text" placeholder="Name" value={sneakerForm.name} onChange={(e) => setSneakerForm({ ...sneakerForm, name: e.target.value })} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                  <input type="number" placeholder="Price" value={sneakerForm.price || ''} onChange={(e) => setSneakerForm({ ...sneakerForm, price: Number(e.target.value) })} required className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                  <input type="text" placeholder="Image URL" value={sneakerForm.image} onChange={(e) => setSneakerForm({ ...sneakerForm, image: e.target.value })} className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-600">Categories</label>
                    <div className="flex flex-wrap gap-3">
                      {['Running', 'Lifestyle', 'Training', 'Trail'].map((cat) => {
                        const selected = sneakerForm.category.split(', ').includes(cat)
                        return (
                          <label key={cat} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={selected} onChange={() => {
                              const cats = sneakerForm.category ? sneakerForm.category.split(', ') : []
                              const next = selected ? cats.filter((c: string) => c !== cat) : [...cats, cat]
                              setSneakerForm({ ...sneakerForm, category: next.join(', ') })
                            }} className="accent-gray-900" />
                            {cat}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                  <textarea placeholder="Description" value={sneakerForm.description} onChange={(e) => setSneakerForm({ ...sneakerForm, description: e.target.value })} rows={3} className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none" />
                </>
              )}
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              <div className="flex gap-3 mt-2">
                <button type="submit" className="flex-1 py-3 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">{t('save')}</button>
                <button type="button" onClick={() => { setModal(null); setError('') }} className="flex-1 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">{t('cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
