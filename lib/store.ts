// Client-side mock data store.
// Everything is persisted in localStorage, so the app can be deployed as a
// static / serverless Next.js app (e.g. Vercel) without a database.

export interface Product {
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
  session: 'mk_session',
  products: 'mk_products',
  orders: 'mk_orders',
  cart: (userId: number) => `mk_cart_${userId}`,
}

const SEED_PRODUCTS: Product[] = [
  { id: 1, name: 'Air Max Pulse', price: 4590, image: '/sneakplaceholder.png', description: 'Premium comfort meets street-ready style with responsive cushioning and a sleek mesh upper.', category: 'Running, Lifestyle' },
  { id: 2, name: 'Court Vision Lo', price: 3290, image: '/sneakplaceholder.png', description: 'A classic court shoe reimagined with modern materials, padded collar, and timeless appeal.', category: 'Lifestyle' },
  { id: 3, name: 'Zoom Rival Fly', price: 3890, image: '/sneakplaceholder.png', description: 'Lightweight speed for race day. Breathable upper with Zoom Air units for explosive takeoffs.', category: 'Running' },
  { id: 4, name: 'Revolution 7', price: 2790, image: '/sneakplaceholder.png', description: 'Everyday running made softer with plush cushioning and a smooth, comfortable ride.', category: 'Running' },
  { id: 5, name: "Air Force 1 '07", price: 3990, image: '/sneakplaceholder.png', description: 'The legend lives on. Iconic style, premium leather, and durable construction since 1982.', category: 'Lifestyle' },
  { id: 6, name: 'Dunk Low Retro', price: 3590, image: '/sneakplaceholder.png', description: 'Bold colors meet heritage design. A streetwear icon reissued for a new generation.', category: 'Lifestyle' },
  { id: 7, name: 'Vaporfly 3', price: 7590, image: '/sneakplaceholder.png', description: 'Elite marathon speed with carbon fiber plate and ZoomX foam for record-breaking performance.', category: 'Running, Training' },
  { id: 8, name: 'Metcon 9', price: 4190, image: '/sneakplaceholder.png', description: 'Built for the toughest workouts. Stability, durability, and grip for every rep.', category: 'Training' },
  { id: 9, name: 'Pegasus Plus', price: 4990, image: '/sneakplaceholder.png', description: 'Responsive cushioning meets reliable traction for your daily training runs.', category: 'Running' },
  { id: 10, name: 'Challenger AT', price: 3490, image: '/sneakplaceholder.png', description: 'Trail-ready with aggressive tread and protective upper for off-road adventures.', category: 'Trail, Running' },
  { id: 11, name: 'Free Run 5.0', price: 3190, image: '/sneakplaceholder.png', description: 'Natural motion with a flexible sole and minimalist design for a barefoot-like feel.', category: 'Running, Training' },
  { id: 12, name: 'Retro Gato', price: 2790, image: '/sneakplaceholder.png', description: 'Vintage court style with a modern twist. Premium suede and clean lines.', category: 'Lifestyle' },
]

const SEED_USERS: User[] = [
  { id: 1, username: 'admin', email: 'admin@mockkicks.test', password: 'admin123', role: 1, created_at: new Date().toISOString() },
  { id: 2, username: 'demo', email: 'demo@mockkicks.test', password: 'demo123', role: 0, created_at: new Date().toISOString() },
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

export function getCart(userId: number): CartItem[] {
  return read<CartItem[]>(KEYS.cart(userId), [])
}

function saveCart(userId: number, items: CartItem[]): void {
  write(KEYS.cart(userId), items)
}

export function addCartItem(userId: number, productId: number): void {
  const cart = getCart(userId)
  const existing = cart.find((item) => item.sneaker_id === productId)
  if (existing) {
    saveCart(userId, cart.map((item) => (item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item)))
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
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    },
  ])
}

export function updateCartQuantity(userId: number, cartId: number, quantity: number): void {
  if (quantity <= 0) {
    removeCartItem(userId, cartId)
    return
  }
  saveCart(userId, getCart(userId).map((item) => (item.id === cartId ? { ...item, quantity } : item)))
}

export function removeCartItem(userId: number, cartId: number): void {
  saveCart(userId, getCart(userId).filter((item) => item.id !== cartId))
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
