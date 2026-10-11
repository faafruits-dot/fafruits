// composables/useDashboardStats.ts
import { useDashboardOrders } from './useDashboardOrders'
import { useProducts } from './useProducts'

export interface DashboardKpis {
  revenue: number
  revenueDelta: number
  ordersCount: number
  ordersDelta: number
  avgOrder: number
  avgDelta: number
  lateCount: number
  lateDelta: number
}

export interface WeeklyPoint {
  day: string
  value: number
  isToday: boolean
}

export interface TopItem {
  name: string
  count: number
  revenue: number
}

export interface ZoneStat {
  name: string
  orders: number
  revenue: number
}

export const useDashboardStats = () => {
  const { orders } = useDashboardOrders()
  const { products } = useProducts()

  const loading = useState<boolean>('dash-stats-loading', () => false)

  /* ═══ Helpers ═══ */
  const todayStr = () => new Date().toISOString().slice(0, 10)

  const isToday = (dateStr: string) => dateStr === todayStr()

  const dayOffset = (n: number) => {
    const d = new Date()
    d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
  }

  /* ═══ Orders لليوم ═══ */
  const todayOrders = computed(() =>
    orders.value.filter(o => isToday(o.delivery_date))
  )

  const yesterdayOrders = computed(() =>
    orders.value.filter(o => o.delivery_date === dayOffset(-1))
  )

  /* ═══ KPIs ═══ */
  const kpis = computed<DashboardKpis>(() => {
    const t = todayOrders.value
    const y = yesterdayOrders.value

    const rev = t.reduce((s, o) => s + Number(o.total || 0), 0)
    const revY = y.reduce((s, o) => s + Number(o.total || 0), 0)

    const ordersCount = t.length
    const ordersY = y.length

    const avg = ordersCount > 0 ? rev / ordersCount : 0
    const avgY = ordersY > 0 ? revY / ordersY : 0

    const late = orders.value.filter(o =>
      o.delivery_date < todayStr() && o.status !== 'delivered'
    ).length

    const lateY = 0

    const pct = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100)

    return {
      revenue: rev,
      revenueDelta: pct(rev, revY),
      ordersCount,
      ordersDelta: pct(ordersCount, ordersY),
      avgOrder: avg,
      avgDelta: pct(avg, avgY),
      lateCount: late,
      lateDelta: pct(late, lateY),
    }
  })

  /* ═══ Weekly chart (7 days) ═══ */
  const weekly = computed<WeeklyPoint[]>(() => {
    const days: WeeklyPoint[] = []
    const dayNames = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']

    for (let i = 6; i >= 0; i--) {
      const dateStr = dayOffset(-i)
      const dayDate = new Date(dateStr + 'T00:00:00')
      const total = orders.value
        .filter(o => o.delivery_date === dateStr)
        .reduce((s, o) => s + Number(o.total || 0), 0)
      days.push({
        day: dayNames[dayDate.getDay()],
        value: total,
        isToday: i === 0,
      })
    }
    return days
  })

  /* ═══ Top products ═══ */
  const topProducts = computed<TopItem[]>(() => {
    const map = new Map<string, { count: number; revenue: number }>()

    for (const o of orders.value) {
      for (const item of o.items || []) {
        const key = item.product_name || item.product_id
        const cur = map.get(key) || { count: 0, revenue: 0 }
        cur.count += item.qty
        cur.revenue += Number(item.line_total || 0)
        map.set(key, cur)
      }
    }

    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  })

  /* ═══ Top zones ═══ */
  const topZones = computed<ZoneStat[]>(() => {
    const map = new Map<string, { orders: number; revenue: number }>()

    for (const o of orders.value) {
      const key = o.area || 'غير محدد'
      const cur = map.get(key) || { orders: 0, revenue: 0 }
      cur.orders += 1
      cur.revenue += Number(o.total || 0)
      map.set(key, cur)
    }

    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
  })

  /* ═══ Status breakdown ═══ */
  const statusBreakdown = computed(() => {
    const list = todayOrders.value
    return {
      new:             list.filter(o => o.status === 'new').length,
      sent_to_chef:    list.filter(o => o.status === 'sent_to_chef').length,
      sent_to_driver:  list.filter(o => o.status === 'sent_to_driver').length,
      delivered:       list.filter(o => o.status === 'delivered').length,
    }
  })

  /* ═══ Top occasions ═══ */
  const topOccasions = computed<TopItem[]>(() => {
    const map = new Map<string, number>()

    for (const o of orders.value) {
      for (const item of o.items || []) {
        const p = products.value.find(pp => pp.id === item.product_id)
        for (const occ of (p as any)?.occ || []) {
          map.set(occ, (map.get(occ) || 0) + 1)
        }
      }
    }

    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count, revenue: 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  })

  return {
    kpis,
    weekly,
    topProducts,
    topOccasions,
    topZones,
    statusBreakdown,
    loading,
    todayOrders,
  }
}