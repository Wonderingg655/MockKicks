// Client-side mock data store.
// Products are hardcoded and users/carts/orders are persisted in localStorage,
// so the app can be deployed to Vercel without a database or payment provider.

export type Lang = 'th' | 'en'

export interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  category: string
  descriptionTh?: string
  categoryTh?: string
}

export interface LocalizedProduct {
  id: number
  name: string
  price: number
  image: string
  description: string
  category: string
}

export interface User {
  id: number
  username: string
  email: string
  password: string
  role: number
  created_at: string
}

export type PublicUser = Omit<User, 'password'>

export interface CartItem {
  id: number
  sneaker_id: number
  quantity: number
  name: string
  price: number
  image: string
  category: string
}

export interface OrderItem {
  id: number
  sneaker_id: number
  name: string
  price: number
  quantity: number
}

export interface ShippingDetails {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface Order extends ShippingDetails {
  id: number
  user_id: number
  username: string
  total: number
  payment_method: string
  status: string
  created_at: string
  items: OrderItem[]
}

const STORE_EVENT = 'mock-kicks:store'

const KEYS = {
  users: 'mk_users',
  session: 'user',
  products: 'mk_products',
  orders: 'mk_orders',
  cart: (userId: number) => `mk_cart_${userId}`,
}

const SEED_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Air Max Pulse',
    price: 45,
    image: '/sneakplaceholder.png',
    description: 'Bold design meets everyday comfort in the Air Max Pulse.',
    category: 'Running, Lifestyle',
    descriptionTh: 'ดีไซน์โดดเด่นผสานความสบายในทุกวัน',
    categoryTh: 'วิ่ง, ไลฟ์สไตล์',
  },
  {
    id: 2,
    name: 'Cloud Runner Pro',
    price: 52,
    image: '/sneakplaceholder.png',
    description: 'Lightweight running shoes with responsive cushioning.',
    category: 'Running',
    descriptionTh: 'รองเท้าวิ่งน้ำหนักเบาพร้อมรองรับแรงกระแทก',
    categoryTh: 'วิ่ง',
  },
  {
    id: 3,
    name: 'Street Glide',
    price: 38,
    image: '/sneakplaceholder.png',
    description: 'Sleek lifestyle sneakers for the urban explorer.',
    category: 'Lifestyle',
    descriptionTh: 'รองเท้าสไตล์สบายสำหรับคนเมือง',
    categoryTh: 'ไลฟ์สไตล์',
  },
  {
    id: 4,
    name: 'Trail Blazer',
    price: 61,
    image: '/sneakplaceholder.png',
    description: 'Rugged trail shoes built for off-road adventures.',
    category: 'Trail',
    descriptionTh: 'รองเท้าเส้นทางทรหดสำหรับการผจญภัยนอกเส้นทาง',
    categoryTh: 'เทรล',
  },
  {
    id: 5,
    name: 'Flex Training',
    price: 34,
    image: '/sneakplaceholder.png',
    description: 'Versatile training shoes with maximum flexibility.',
    category: 'Training',
    descriptionTh: 'รองเท้าเทรนนิ่งอเนกประสงค์ที่ยืดหยุ่นสูงสุด',
    categoryTh: 'เทรนนิ่ง',
  },
  {
    id: 6,
    name: 'Urban Stride',
    price: 42,
    image: '/sneakplaceholder.png',
    description: 'Everyday sneakers with premium comfort and style.',
    category: 'Lifestyle',
    descriptionTh: 'รองเท้าผ้าใบสำหรับทุกวันด้วยความสบายระดับพรีเมียม',
    categoryTh: 'ไลฟ์สไตล์',
  },
]

const SEED_USERS: User[] = [
  { id: 1, username: 'admin', email: 'admin@mockkicks.test', password: 'admin123', role: 1, created_at: '2026-01-01T00:00:00.000Z' },
  { id: 2, username: 'demo', email: 'demo@mockkicks.test', password: 'demo123', role: 0, created_at: '2026-01-01T00:00:00.000Z' },
]

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function read<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeRaw<T>(key: string, value: T): void {
  if (!hasStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function write<T>(key: string, value: T): void {
  writeRaw(key, value)
  notify()
}

function notify(): void {
  if (hasStorage()) window.dispatchEvent(new Event(STORE_EVENT))
}

/** Subscribe to local store changes (same tab) and other-tab updates. */
export function subscribeStore(callback: () => void): () => void {
  if (!hasStorage()) return () => {}
  const handler = () => callback()
  window.addEventListener(STORE_EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(STORE_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}

function toPublicUser(user: User): PublicUser {
  const publicUser: Partial<User> = { ...user }
  delete publicUser.password
  return publicUser as PublicUser
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export function getProducts(): Product[] {
  if (!hasStorage()) return SEED_PRODUCTS
  const stored = read<Product[] | null>(KEYS.products, null)
  if (!stored) {
    writeRaw(KEYS.products, SEED_PRODUCTS)
    return SEED_PRODUCTS
  }
  return stored
}

export function localizeProduct(product: Product, lang: Lang): LocalizedProduct {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    description: (lang === 'th' && product.descriptionTh) || product.description,
    category: (lang === 'th' && product.categoryTh) || product.category,
  }
}

export function getLocalizedProducts(lang: Lang): LocalizedProduct[] {
  return getProducts().map((product) => localizeProduct(product, lang))
}

function saveProducts(products: Product[]): void {
  write(KEYS.products, products)
}

export function addProduct(data: Omit<Product, 'id'>): Product {
  const products = getProducts()
  const id = products.reduce((max, p) => Math.max(max, p.id), 0) + 1
  const product: Product = { ...data, id }
  saveProducts([...products, product])
  return product
}

export function updateProduct(id: number, data: Omit<Product, 'id'>): void {
  saveProducts(getProducts().map((p) => (p.id === id ? { ...data, id } : p)))
}

export function deleteProduct(id: number): void {
  saveProducts(getProducts().filter((p) => p.id !== id))
}

/* ------------------------------------------------------------------ */
/* Users & session                                                     */
/* ------------------------------------------------------------------ */

export function getUsers(): User[] {
  if (!hasStorage()) return SEED_USERS
  const stored = read<User[] | null>(KEYS.users, null)
  if (!stored) {
    writeRaw(KEYS.users, SEED_USERS)
    return SEED_USERS
  }
  return stored
}

function saveUsers(users: User[]): void {
  write(KEYS.users, users)
}

export function authenticate(username: string, password: string): { user?: PublicUser; error?: string } {
  const user = getUsers().find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
  )
  if (!user) return { error: 'Invalid username or password.' }
  return { user: toPublicUser(user) }
}

export function registerUser(username: string, email: string, password: string): { user?: PublicUser; error?: string } {
  const name = username.trim()
  const mail = email.trim().toLowerCase()
  if (!name || !mail || !password) return { error: 'All fields are required.' }

  const users = getUsers()
  if (users.some((u) => u.username.toLowerCase() === name.toLowerCase())) {
    return { error: 'That username is already taken.' }
  }
  if (users.some((u) => u.email.toLowerCase() === mail)) {
    return { error: 'That email is already registered.' }
  }

  const id = users.reduce((max, u) => Math.max(max, u.id), 0) + 1
  const user: User = {
    id,
    username: name,
    email: mail,
    password,
    role: 0,
    created_at: new Date().toISOString(),
  }
  saveUsers([...users, user])
  return { user: toPublicUser(user) }
}

export function addUser(data: { username: string; email: string; password: string; role: number }): { error?: string } {
  const name = data.username.trim()
  const mail = data.email.trim().toLowerCase()
  if (!name || !mail) return { error: 'Username and email are required.' }
  if (!data.password) return { error: 'Password is required for new users.' }

  const users = getUsers()
  if (users.some((u) => u.username.toLowerCase() === name.toLowerCase())) {
    return { error: 'That username is already taken.' }
  }
  if (users.some((u) => u.email.toLowerCase() === mail)) {
    return { error: 'That email is already registered.' }
  }

  const id = users.reduce((max, u) => Math.max(max, u.id), 0) + 1
  saveUsers([
    ...users,
    { id, username: name, email: mail, password: data.password, role: data.role, created_at: new Date().toISOString() },
  ])
  return {}
}

export function updateUser(
  id: number,
  data: { username: string; email: string; password?: string; role: number }
): { error?: string } {
  const name = data.username.trim()
  const mail = data.email.trim().toLowerCase()
  if (!name || !mail) return { error: 'Username and email are required.' }

  const users = getUsers()
  if (users.some((u) => u.id !== id && u.username.toLowerCase() === name.toLowerCase())) {
    return { error: 'That username is already taken.' }
  }
  if (users.some((u) => u.id !== id && u.email.toLowerCase() === mail)) {
    return { error: 'That email is already registered.' }
  }

  saveUsers(
    users.map((u) =>
      u.id === id
        ? { ...u, username: name, email: mail, role: data.role, ...(data.password ? { password: data.password } : {}) }
        : u
    )
  )
  return {}
}

export function deleteUser(id: number): void {
  saveUsers(getUsers().filter((u) => u.id !== id))
}

export function getSession(): PublicUser | null {
  return read<PublicUser | null>(KEYS.session, null)
}

export function setSession(user: PublicUser | null): void {
  if (!user) {
    if (hasStorage()) window.localStorage.removeItem(KEYS.session)
    notify()
    return
  }
  write(KEYS.session, user)
}

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */

export function getCart(userId: number, lang: Lang = 'en'): CartItem[] {
  const stored = read<Array<Omit<CartItem, 'name' | 'category'> & { name?: string; category?: string }>>(
    KEYS.cart(userId),
    []
  )
  const products = getProducts()
  return stored.map((item) => {
    const product = products.find((p) => p.id === item.sneaker_id)
    const localized = product ? localizeProduct(product, lang) : null
    return {
      id: item.id,
      sneaker_id: item.sneaker_id,
      quantity: item.quantity,
      price: localized?.price ?? item.price,
      image: localized?.image ?? item.image,
      name: localized?.name ?? item.name ?? '',
      category: localized?.category ?? item.category ?? '',
    }
  })
}

function saveCart(userId: number, items: Array<Omit<CartItem, 'name' | 'category'>>): void {
  write(KEYS.cart(userId), items)
}

export function addCartItem(userId: number, productId: number): void {
  const cart = getCart(userId)
  const existing = cart.find((item) => item.sneaker_id === productId)
  if (existing) {
    saveCart(
      userId,
      cart.map((item) => (item.id === existing.id ? { id: item.id, sneaker_id: item.sneaker_id, quantity: item.quantity + 1, price: item.price, image: item.image } : item))
    )
    return
  }

  const product = getProducts().find((p) => p.id === productId)
  if (!product) return

  saveCart(userId, [
    ...cart,
    {
      id: product.id,
      sneaker_id: product.id,
      quantity: 1,
      price: product.price,
      image: product.image,
    },
  ])
}

export function updateCartQuantity(userId: number, cartId: number, quantity: number): void {
  const cart = getCart(userId)
  if (quantity <= 0) {
    removeCartItem(userId, cartId)
    return
  }
  saveCart(
    userId,
    cart.map((item) => (item.id === cartId ? { id: item.id, sneaker_id: item.sneaker_id, quantity, price: item.price, image: item.image } : item))
  )
}

export function removeCartItem(userId: number, cartId: number): void {
  const cart = getCart(userId)
  saveCart(
    userId,
    cart.filter((item) => item.id !== cartId).map((item) => ({ id: item.id, sneaker_id: item.sneaker_id, quantity: item.quantity, price: item.price, image: item.image }))
  )
}

export function clearCart(userId: number): void {
  saveCart(userId, [])
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export function getOrders(): Order[] {
  return read<Order[]>(KEYS.orders, []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function getOrdersByUser(userId: number): Order[] {
  return getOrders().filter((order) => order.user_id === userId)
}

export function getOrderById(id: number, userId?: number): Order | null {
  const order = getOrders().find((o) => o.id === id)
  if (!order) return null
  if (userId !== undefined && order.user_id !== userId) return null
  return order
}

export function createOrder(input: {
  userId: number
  username: string
  shipping: ShippingDetails
  items: CartItem[]
  total: number
  paymentMethod?: string
}): Order {
  const orders = read<Order[]>(KEYS.orders, [])
  const id = orders.reduce((max, order) => Math.max(max, order.id), 0) + 1

  const order: Order = {
    id,
    user_id: input.userId,
    username: input.username,
    ...input.shipping,
    total: input.total,
    payment_method: input.paymentMethod || 'mock',
    status: 'paid',
    created_at: new Date().toISOString(),
    items: input.items.map((item) => ({
      id: item.id,
      sneaker_id: item.sneaker_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  }

  write(KEYS.orders, [...orders, order])
  return order
}
