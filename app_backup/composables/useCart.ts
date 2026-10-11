export interface CartItem {
  key: string
  id: string
  title: string
  img: string
  price: number
  qty: number
  serving?: string
  grad?: string
  extras?: { message: boolean; juice: boolean; chocolate: boolean }
  extrasTotal?: number
  messageText?: string
  giftName?: string
  deliveryDate?: string
}

const STORAGE_KEY = 'fa_cart'

export function useCart() {
  const cart = useState<CartItem[]>('cart', () => {
    if (process.client) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw)
      } catch {}
    }
    return []
  })

  const persist = () => {
    if (process.client) localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.value))
  }

  const count = computed(() => cart.value.reduce((a, i) => a + i.qty, 0))
  const subtotal = computed(() => cart.value.reduce((a, i) => a + i.price * i.qty, 0))
  const extrasTotal = computed(() => cart.value.reduce((a, i) => a + (i.extrasTotal || 0) * i.qty, 0))
  const total = computed(() => subtotal.value + extrasTotal.value)

  const add = (item: Omit<CartItem, 'key' | 'qty'> & { qty?: number }) => {
    const key = item.id + '-' + Date.now()
    const found = cart.value.find(i => i.id === item.id)
    if (found && !item.deliveryDate) {
      found.qty += item.qty || 1
    } else {
      cart.value.push({ ...item, key, qty: item.qty || 1 })
    }
    persist()
  }

  const remove = (key: string) => {
    cart.value = cart.value.filter(i => i.key !== key)
    persist()
  }

  const setQty = (key: string, qty: number) => {
    const item = cart.value.find(i => i.key === key)
    if (item) { item.qty = Math.max(1, qty); persist() }
  }

  const clear = () => { cart.value = []; persist() }

  const hasProduct = (productId: string) =>
    cart.value.some(i => i.id === productId || i.id.startsWith(productId + '-'))

  return { cart, count, subtotal, extrasTotal, total, add, remove, setQty, clear, hasProduct, persist }
}