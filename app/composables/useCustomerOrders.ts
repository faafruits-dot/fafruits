// composables/useCustomerOrders.ts
export interface CustomerOrderItem {
  id: number
  product_id: string
  product_name: string
  product_img: string
  qty: number
  unit_price: number
  line_total: number
  extras: Array<{
    id: number
    extra_id: string
    extra_name: string
    price: number
    input_value: string | null
  }>
}

export interface CustomerOrder {
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
  created_at: string
  items: CustomerOrderItem[]
}

export const useCustomerOrders = () => {
  const orders = ref<CustomerOrder[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadByPhone = async (phone: string) => {
    const clean = String(phone).replace(/\D/g, '')
    if (!clean) {
      orders.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      const fetcher = useApiFetch()
      const res = await fetcher<{
        ok: boolean
        phone: string
        orders: CustomerOrder[]
      }>(`/api/orders/by-phone/${clean}`)
      orders.value = res.orders || []
    } catch (e: any) {
      error.value = e?.data?.statusMessage || 'فشل تحميل الطلبات'
      orders.value = []
    } finally {
      loading.value = false
    }
  }

  return { orders, loading, error, loadByPhone }
}