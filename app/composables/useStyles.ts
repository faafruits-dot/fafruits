// composables/useStyles.ts
export interface ProductStyle {
  id: string
  name_ar: string
  name_en: string
  icon: string
  description: string | null
  cover_image?: string | null
  sort_order: number
  is_primary: boolean
  is_active: boolean
  products_count?: number
}

export const useStyles = () => {
  const styles  = useState<ProductStyle[]>('product-styles', () => [])
  const loading = useState<boolean>('product-styles-loading', () => false)
  const loaded  = useState<boolean>('product-styles-loaded', () => false)
  const error   = useState<string | null>('product-styles-error', () => null)

  const load = async (force = false) => {
    if (loaded.value && !force) return

    loading.value = true
    error.value = null

    try {
      const res = await $fetch<{ ok: boolean; styles: ProductStyle[] }>(
        '/api/styles'
      )
      styles.value = res.styles || []
      loaded.value = true
    } catch (e: any) {
      // ⭐ بنمسك الخطأ بدل ما نسيب الصفحة تقع
      error.value =
        e?.data?.statusMessage ||
        e?.statusMessage ||
        e?.message ||
        'فشل تحميل التصنيفات'

      styles.value = []
      console.error('[useStyles] load failed:', {
        status: e?.statusCode,
        message: e?.message,
        statusMessage: e?.statusMessage,
        data: e?.data,
      })
    } finally {
      loading.value = false
    }
  }

  return { styles, loading, loaded, error, load }   // ⭐ error رجع
}