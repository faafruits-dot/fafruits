// composables/useProductStyles.ts
export interface ProductStyle {
  id: string
  name_ar: string
  name_en: string
  icon: string
  description: string | null
  sort_order: number
}

export const useProductStyles = (productId: MaybeRefOrGetter<string>) => {
  const styles = ref<ProductStyle[]>([])
  const loading = ref(false)

  const load = async () => {
    const id = toValue(productId)
    if (!id) {
      styles.value = []
      return
    }

    loading.value = true
    try {
      const fetcher = useApiFetch()
      const res = await fetcher<{ ok: boolean; styles: ProductStyle[] }>(
        `/api/products/${id}/styles`,
      )
      styles.value = res.styles || []
    } catch {
      styles.value = []
    } finally {
      loading.value = false
    }
  }

  return { styles, loading, load }
}