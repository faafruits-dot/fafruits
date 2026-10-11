// composables/useTrackOrder.ts
export interface TrackExtra {
  id: number
  extra_id: string
  extra_name: string
  price: number
  input_value: string | null
}

export interface TrackItem {
  id: number
  product_id: string
  product_name: string
  product_img: string
  qty: number
  unit_price: number
  line_total: number
  extras: TrackExtra[]
}

export interface TrackEvent {
  event: string
  created_at: string
  note: string | null
}

export interface TrackOrder {
  id: string
  customer_name: string
  customer_phone: string
  area: string
  street: string
  delivery_date: string
  slot: string
  total: number
  payment_method: string
  status: 'new' | 'sent_to_chef' | 'sent_to_driver' | 'delivered' | 'cancelled'
  notes: string | null
  chef_sent_at: string | null
  driver_sent_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  items: TrackItem[]
}

export const useTrackOrder = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchOrder = async (
    id: string,
  ): Promise<{ order: TrackOrder | null; events: TrackEvent[] }> => {
    loading.value = true
    error.value = null

    try {
      const fetcher = useApiFetch()
      const res = await fetcher<{
        ok: boolean
        order: TrackOrder
        events: TrackEvent[]
      }>(`/api/orders/track/${id}`)

      return { order: res.order, events: res.events || [] }
    } catch (e: any) {
      error.value = e?.data?.statusMessage || 'لم يتم العثور على الطلب'
      return { order: null, events: [] }
    } finally {
      loading.value = false
    }
  }

  return { loading, error, fetchOrder }
}