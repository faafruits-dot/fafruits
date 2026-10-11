// composables/useStyles.ts
export interface ProductStyle {
  id: string
  name_ar: string
  name_en: string
  icon: string
  description: string | null
    cover_image?: string | null;   // ⭐ الجديد
  sort_order: number
  is_primary: boolean
  is_active: boolean
  products_count?: number
}

export const useStyles = () => {
  const styles = useState<ProductStyle[]>('product-styles', () => [])
  const loading = useState<boolean>('product-styles-loading', () => false)
  const loaded  = useState<boolean>('product-styles-loaded', () => false)

  const load = async (force = false) => {
    if (loaded.value && !force) return
    loading.value = true
    try {
      const res = await $fetch<{ ok: boolean; styles: ProductStyle[] }>('/api/styles')
      styles.value = res.styles || []
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  return { styles, loading, loaded, load }
}