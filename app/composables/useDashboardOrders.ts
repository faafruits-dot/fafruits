// composables/useDashboardOrders.ts
export interface OrderExtra {
  id: number
  extra_id: string
  extra_name: string
  price: number
  input_value: string | null
}

export interface OrderItem {
  id: number
  product_id: string
  product_name: string
  product_img: string
  qty: number
  unit_price: number
  line_total: number
  extras: OrderExtra[]
}

export interface DashOrder {
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
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export const useDashboardOrders = () => {
  const orders = useState<DashOrder[]>('dash-orders', () => [])
  const loading = useState<boolean>('dash-orders-loading', () => false)
  const error = useState<string | null>('dash-orders-error', () => null)

  const load = async (params?: {
    status?: string
    from?: string
    to?: string
  }) => {
    loading.value = true
    error.value = null
    try {
      const qs = new URLSearchParams()
      if (params?.status) qs.set('status', params.status)
      if (params?.from) qs.set('from', params.from)
      if (params?.to) qs.set('to', params.to)

      const fetcher = useApiFetch()
      const res = await fetcher<{ ok: boolean; orders: DashOrder[] }>(
        `/api/orders${qs.toString() ? '?' + qs : ''}`,
      )
      orders.value = res.orders
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'فشل تحميل الطلبات'
      orders.value = []
    } finally {
      loading.value = false
    }
  }

  const markChefSent = async (id: string) => {
    const fetcher = useApiFetch()
    await fetcher(`/api/orders/${id}/mark-chef-sent`, { method: 'POST' })
    await load()
  }

  const markDriverSent = async (id: string) => {
    const fetcher = useApiFetch()
    await fetcher(`/api/orders/${id}/mark-driver-sent`, { method: 'POST' })
    await load()
  }

  const markDelivered = async (id: string) => {
    const fetcher = useApiFetch()
    await fetcher(`/api/orders/${id}/deliver`, { method: 'POST' })
    await load()
  }

  const getById = (id: string) =>
    orders.value.find((o) => o.id === id) || null

  return {
    orders,
    loading,
    error,
    load,
    markChefSent,
    markDriverSent,
    markDelivered,
    getById,
  }
}