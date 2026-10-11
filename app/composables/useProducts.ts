// composables/useProducts.ts
import { useSupabase } from './useSupabase'

export interface Product {
  id: string
  img: string
  price: number
  rating: number
  reviews: number
  mood: string | null
  occ: string[]
  ready: boolean
  best: boolean
  luxury: boolean
  available: boolean
  grad: string
  name_ar?: string | null
}

export const useProducts = () => {
  const products = useState<Product[]>('products', () => [])
  const loading = useState<boolean>('products-loading', () => false)
  const loaded = useState<boolean>('products-loaded', () => false)

  const load = async (force = false) => {
    if (loaded.value && !force) return
    loading.value = true
    try {
      const supabase = useSupabase()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('available', true)
        .order('id', { ascending: true })

      if (error) {
        console.error('❌ Supabase error:', error)
        products.value = []
      } else {
        products.value = (data || []) as Product[]
        loaded.value = true
      }
    } finally {
      loading.value = false
    }
  }

  if (import.meta.client && !loaded.value) load()

  const getProduct = (id: string) =>
    products.value.find((p) => p.id === id) || null
  const find = getProduct

  /* ═══ تحديث منتج ═══ */
  const updateProduct = async (
    id: string,
    patch: Partial<Product>,
  ): Promise<Product> => {
    const res = await $fetch<{ ok: boolean; product: Product }>(
      `/api/products/${id}`,
      { method: 'PATCH', body: patch },
    )
    const idx = products.value.findIndex((p) => p.id === id)
    if (idx >= 0) products.value[idx] = res.product
    return res.product
  }

  /* ═══ إضافة منتج ═══ */
  const createProduct = async (p: Partial<Product>): Promise<Product> => {
    const res = await $fetch<{ ok: boolean; product: Product }>(
      '/api/products',
      { method: 'POST', body: p },
    )
    products.value.push(res.product)
    return res.product
  }

  /* ═══ حذف منتج ═══ */
  const deleteProduct = async (id: string): Promise<void> => {
    await $fetch(`/api/products/${id}`, { method: 'DELETE' })
    products.value = products.value.filter((p) => p.id !== id)
  }

  return {
    products,
    loading,
    loaded,
    load,
    getProduct,
    find,
    updateProduct,
    createProduct,
    deleteProduct,
  }
}