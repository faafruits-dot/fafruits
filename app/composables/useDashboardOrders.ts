// composables/useDashboardOrders.ts
export type OrderStatus = 'new' | 'sent_to_chef' | 'sent_to_driver' | 'delivered' | 'cancelled'

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
  subtotal: number
  extras_total: number | null
  delivery_fee: number | null
  total: number
  payment_method: string
  status: OrderStatus
  is_vip: boolean | null
  notes: string | null
  chef_sent_at: string | null      // ⭐ إشعار الشيف (لا يغيّر الحالة)
  driver_sent_at: string | null    // ⭐ إشعار المندوب (لا يغيّر الحالة)
  delivered_at: string | null
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export const useDashboardOrders = () => {
  const orders = useState<DashOrder[]>('dash-orders', () => [])
  const loading = useState<boolean>('dash-orders-loading', () => false)
  const error = useState<string | null>('dash-orders-error', () => null)

  /* ═══ تحميل ═══ */
  const load = async (params?: { status?: string; from?: string; to?: string }) => {
    loading.value = true
    error.value = null
    try {
      const qs = new URLSearchParams()
      if (params?.status) qs.set('status', params.status)
      if (params?.from) qs.set('from', params.from)
      if (params?.to) qs.set('to', params.to)

      const res = await $fetch<{ ok: boolean; orders: DashOrder[] }>(
        `/api/orders${qs.toString() ? '?' + qs : ''}`
      )
      orders.value = res.orders
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'فشل تحميل الطلبات'
      orders.value = []
    } finally {
      loading.value = false
    }
  }

  /* ═══════════════════════════════════════════════════════════
     ⭐ الإشعارات — لا تغيّر الحالة
     ═══════════════════════════════════════════════════════════ */
  const notifyChef = async (id: string) => {
    await $fetch(`/api/orders/${id}/notify-chef`, { method: 'POST' })
    // تحديث محلي بدون reload
    const o = orders.value.find(x => x.id === id)
    if (o) o.chef_sent_at = new Date().toISOString()
  }

  const notifyDriver = async (id: string) => {
    await $fetch(`/api/orders/${id}/notify-driver`, { method: 'POST' })
    const o = orders.value.find(x => x.id === id)
    if (o) o.driver_sent_at = new Date().toISOString()
  }

  /* ═══════════════════════════════════════════════════════════
     ⭐ تغييرات الحالة — تحدّثها فعليًا
     ═══════════════════════════════════════════════════════════ */
  const startPreparation = async (id: string) => {
    await $fetch(`/api/orders/${id}/start-preparation`, { method: 'POST' })
    const o = orders.value.find(x => x.id === id)
    if (o) o.status = 'sent_to_chef'
  }

  const goOnWay = async (id: string) => {
    await $fetch(`/api/orders/${id}/go-on-way`, { method: 'POST' })
    const o = orders.value.find(x => x.id === id)
    if (o) o.status = 'sent_to_driver'
  }

  const markDelivered = async (id: string) => {
    await $fetch(`/api/orders/${id}/deliver`, { method: 'POST' })
    const o = orders.value.find(x => x.id === id)
    if (o) {
      o.status = 'delivered'
      o.delivered_at = new Date().toISOString()
    }
  }

  const getById = (id: string) => orders.value.find(o => o.id === id) || null

  return {
    orders, loading, error, load,
    notifyChef, notifyDriver,          // ⭐ جديد
    startPreparation, goOnWay,         // ⭐ جديد
    markDelivered,
    getById
  }
}