import { DEFAULT_PRODUCTS, type Product } from '~/data/seed'

const STORAGE_KEY = 'fa_products'

export function useProducts() {
  const products = useState<Product[]>('products', () => {
    if (process.client) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length) return parsed
        }
      } catch {}
    }
    return [...DEFAULT_PRODUCTS]
  })

  const persist = () => {
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products.value))
    }
  }

  const find = (id: string) => products.value.find(p => p.id === id)

  const add = (data: Omit<Product, 'id' | 'reviews' | 'grad'>) => {
    const newId = 'p-' + Date.now().toString(36)
    const newProduct: Product = {
      id: newId, reviews: 0, grad: 'grad-1', ...data
    }
    products.value.push(newProduct)
    persist()
    return newProduct
  }

  const update = (id: string, data: Partial<Product>) => {
    const idx = products.value.findIndex(p => p.id === id)
    if (idx === -1) return false
    products.value[idx] = { ...products.value[idx], ...data, id }
    persist()
    return true
  }

  const remove = (id: string) => {
    products.value = products.value.filter(p => p.id !== id)
    persist()
  }

  const reset = () => {
    products.value = [...DEFAULT_PRODUCTS]
    persist()
  }

  return { products, find, add, update, remove, reset, persist }
}