// composables/useStyleDetail.ts
import type { ProductStyle } from './useStyles'
import type { Product } from './useProducts'

interface StyleDetailResponse {
  ok: boolean
  style: ProductStyle
  products: Product[]
}

export const useStyleDetail = (id: MaybeRefOrGetter<string>) => {
  const style    = ref<ProductStyle | null>(null)
  const products = ref<Product[]>([])
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  const load = async () => {
    const styleId = toValue(id)
    if (!styleId) {
      style.value = null
      products.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const res = await $fetch<StyleDetailResponse>(`/api/styles/${styleId}`)
      style.value = res.style
      products.value = res.products || []
    } catch (e: any) {
      error.value = e?.data?.statusMessage || 'فشل تحميل التصنيف'
      style.value = null
      products.value = []
    } finally {
      loading.value = false
    }
  }

  return { style, products, loading, error, load }
}