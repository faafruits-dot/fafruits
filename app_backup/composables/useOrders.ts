/* =========================================================
   useOrders — إدارة طلبات الداشبورد + الإسنادات
   ========================================================= */

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'delivering' | 'delivered'

export interface OrderExtras {
  message?: boolean
  juice?: boolean
  chocolate?: boolean
}

export interface OrderItem {
  pid: string
  qty: number
  extras?: OrderExtras
  extrasTotal?: number
  messageText?: string
  giftName?: string
}

export interface DashOrder {
  id: string
  customerName: string
  phone: string
  area: string
  street: string
  items: OrderItem[]
  total: number
  slot: string
  status: OrderStatus
  notes: string
  createdAt: number
  payment: 'knet' | 'cod'
  day: number
  isVip?: boolean
  issue?: string
  deliveryPhase?: 'started' | 'arrived' | 'completed' | 'assigned'
  deliveryStartedAt?: number
  deliveredAt?: number
  attemptCount?: number
  paymentCollected?: boolean
  deliveryNote?: string
  postponedUntil?: number
}

export interface Driver {
  id: string
  name: string
  phone: string
  avatar: string
  status: 'available' | 'busy' | 'offline'
  maxOrders: number
}

export const MOCK_DRIVERS: Driver[] = [
  { id:'drv1', name:'المندوب خالد', phone:'96550003333', avatar:'خ', status:'available', maxOrders:8 },
  { id:'drv2', name:'أحمد السالم',  phone:'96550009999', avatar:'أ', status:'available', maxOrders:3 },
  { id:'drv3', name:'يوسف الرشيد',  phone:'96550007777', avatar:'ي', status:'offline',   maxOrders:3 }
]

const NOW = Date.now()
const DAY = 24 * 60 * 60 * 1000
const MIN = 60 * 1000

const MOCK_ORDERS: DashOrder[] = [
  {
    id:'D-1041', customerName:'نورة العلي', phone:'96550001234',
    area:'السالمية', street:'ق ٥، ش ١٢، م ٣',
    items:[{ pid:'p2', qty:1, extras:{ message:false, juice:false, chocolate:false } }],
    total:22, slot:'٤م — ٧م', status:'new', notes:'', createdAt: NOW - 12*MIN, payment:'knet', day:0
  },
  {
    id:'D-1040', customerName:'أحمد يوسف', phone:'96550009876',
    area:'الجابرية', street:'ق ٣، ش ٨، م ٧',
    items:[
      { pid:'p3', qty:1, extras:{ message:true, juice:true, chocolate:true }, messageText:'كل عام وأنت بخير', giftName:'إلى نورة' },
      { pid:'p14', qty:2, extras:{ message:false, juice:false, chocolate:true } }
    ],
    total:81, slot:'٤م — ٧م', status:'new', notes:'', createdAt: NOW - 28*MIN, payment:'knet', day:0
  },
  {
    id:'D-1039', customerName:'سارة الخالد', phone:'96550001111',
    area:'حولي', street:'ش تونس، م ٥',
    items:[{ pid:'p1', qty:2, extras:{ message:false, juice:true, chocolate:false } }],
    total:59, slot:'٧م — ١٠م', status:'new', notes:'', createdAt: NOW - 45*MIN, payment:'cod', day:0
  },
  {
    id:'D-1038', customerName:'فهد المطيري', phone:'96550002222',
    area:'السالمية', street:'ق ٧، ش ٣، م ١',
    items:[{ pid:'p16', qty:1, extras:{ message:false, juice:false, chocolate:true } }],
    total:35, slot:'٤م — ٧م', status:'preparing', notes:'', createdAt: NOW - 90*MIN, payment:'knet', day:0
  },
  {
    id:'D-1037', customerName:'ليلى أحمد', phone:'96550003333',
    area:'الجابرية', street:'ق ١، ش ٥، م ٩',
    items:[
      { pid:'p2', qty:1, extras:{ message:true, juice:false, chocolate:false }, messageText:'هني وعافية' },
      { pid:'p14', qty:1, extras:{ message:false, juice:false, chocolate:false } }
    ],
    total:40, slot:'٤م — ٧م', status:'preparing', notes:'بدون مكسرات', createdAt: NOW - 120*MIN, payment:'knet', day:0
  },
  {
    id:'D-1036', customerName:'محمد العجمي', phone:'96550004444',
    area:'حولي', street:'ش بيروت، م ١٢',
    items:[{ pid:'p3', qty:1, extras:{ message:true, juice:false, chocolate:true }, messageText:'مبروك النجاح' }],
    total:45, slot:'٧م — ١٠م', status:'preparing', notes:'', createdAt: NOW - 150*MIN, payment:'knet', day:0, isVip:true
  },
  {
    id:'D-1034', customerName:'خالد الرشيد', phone:'96550006666',
    area:'السالمية', street:'ق ٩، ش ٢، م ٤',
    items:[{ pid:'p1', qty:1, extras:{ message:false, juice:false, chocolate:false } }],
    total:29.5, slot:'١م — ٤م', status:'ready', notes:'', createdAt: NOW - 240*MIN, payment:'knet', day:0
  },
  {
    id:'D-1033', customerName:'هند سالم', phone:'96550007777',
    area:'الجابرية', street:'ق ٤، ش ٦، م ٢',
    items:[{ pid:'p16', qty:2, extras:{ message:true, juice:false, chocolate:true }, messageText:'مبروك المولود' }],
    total:70, slot:'١م — ٤م', status:'ready', notes:'', createdAt: NOW - 270*MIN, payment:'knet', day:0
  },
  {
    id:'D-1031', customerName:'رنا الفهد', phone:'96550009999',
    area:'السالمية', street:'ق ١، ش ٧، م ٥',
    items:[{ pid:'p2', qty:1, extras:{ message:false, juice:true, chocolate:false } }],
    total:22, slot:'١٠ص — ١م', status:'delivering', notes:'', createdAt: NOW - 360*MIN, payment:'knet', day:0
  },
  {
    id:'D-1030', customerName:'سلطان القحطاني', phone:'96550000000',
    area:'الجابرية', street:'ق ٨، ش ١، م ١٠',
    items:[{ pid:'p3', qty:1, extras:{ message:false, juice:false, chocolate:false } }],
    total:45, slot:'١٠ص — ١م', status:'delivering', notes:'', createdAt: NOW - 380*MIN, payment:'knet', day:0
  }
]

const ASSIGNMENTS_KEY = 'fa_dash_assignments'
const ORDERS_KEY = 'fa_dash_orders'

const DEFAULT_ASSIGNMENTS: Record<string, string> = {
  'D-1041':'drv1','D-1040':'drv1','D-1039':'drv1','D-1038':'drv1','D-1037':'drv1',
  'D-1036':'drv1','D-1034':'drv1','D-1033':'drv1','D-1031':'drv1','D-1030':'drv1'
}

export function useOrders() {
  const orders = useState<DashOrder[]>('dash-orders', () => {
    if (process.client) {
      try {
        const raw = localStorage.getItem(ORDERS_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length) return parsed
        }
      } catch {}
    }
    return [...MOCK_ORDERS]
  })

  const assignments = useState<Record<string, string>>('dash-assignments', () => {
    if (process.client) {
      try {
        const raw = localStorage.getItem(ASSIGNMENTS_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && Object.keys(parsed).length) return parsed
        }
        localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(DEFAULT_ASSIGNMENTS))
      } catch {}
    }
    return { ...DEFAULT_ASSIGNMENTS }
  })

  const persist = () => {
    if (process.client) localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.value))
  }
  const persistAssignments = () => {
    if (process.client) localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments.value))
  }

  const find = (id: string) => orders.value.find(o => o.id === id)

  const byStatus = (status: OrderStatus | 'all') => {
    if (status === 'all') return orders.value
    return orders.value.filter(o => o.status === status)
  }

  const statusCounts = computed(() => ({
    all: orders.value.length,
    new: orders.value.filter(o => o.status === 'new').length,
    preparing: orders.value.filter(o => o.status === 'preparing').length,
    ready: orders.value.filter(o => o.status === 'ready').length,
    delivering: orders.value.filter(o => o.status === 'delivering').length,
    delivered: orders.value.filter(o => o.status === 'delivered').length
  }))

  const nextStatus = (s: OrderStatus): OrderStatus | null => {
    const map: Record<OrderStatus, OrderStatus | null> = {
      new:'preparing', preparing:'ready', ready:'delivering', delivering:'delivered', delivered: null
    }
    return map[s]
  }

  const updateStatus = (id: string, status: OrderStatus) => {
    const o = find(id)
    if (o) { o.status = status; persist() }
  }

  const assignDriver = (orderId: string, driverId: string) => {
    assignments.value[orderId] = driverId
    persistAssignments()
  }
  const unassignDriver = (orderId: string) => {
    delete assignments.value[orderId]
    persistAssignments()
  }
  const getAssignedOrders = (driverId: string) =>
    orders.value.filter(o => assignments.value[o.id] === driverId)

  const getDriverByPhone = (phone: string) => {
    const clean = String(phone).replace(/\D/g, '')
    return MOCK_DRIVERS.find(d => d.phone.replace(/\D/g, '') === clean)
  }

  const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
    new:        { label:'جديد',         color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe', icon:'sparkles' },
    preparing:  { label:'قيد التحضير', color:'#f59e0b', bg:'#fffbeb', border:'#fde68a', icon:'chef-hat' },
    ready:      { label:'جاهز',         color:'#10b981', bg:'#ecfdf5', border:'#a7f3d0', icon:'check-circle' },
    delivering: { label:'مع المندوب',   color:'#8b5cf6', bg:'#f5f3ff', border:'#ddd6fe', icon:'truck' },
    delivered:  { label:'تم التوصيل',  color:'#64748b', bg:'#f8fafc', border:'#e2e8f0', icon:'check-check' }
  }

  return {
    orders, assignments, find, byStatus, statusCounts, nextStatus,
    updateStatus, assignDriver, unassignDriver, getAssignedOrders,
    getDriverByPhone, MOCK_DRIVERS, STATUS_META, persist, persistAssignments
  }
}