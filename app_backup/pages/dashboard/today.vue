<script setup lang="ts">
import { useOrders } from '~/composables/useOrders'
import { useProducts } from '~/composables/useProducts'
import { useAuth } from '~/composables/useAuth'
import { KD, timeAgo } from '~/utils/format'
import type { DashOrder, OrderStatus } from '~/composables/useOrders'

definePageMeta({ layout: 'dashboard' })

const { user } = useAuth()
const router = useRouter()
const { orders } = useOrders()
const { products } = useProducts()

onMounted(() => {
  if (!user.value) router.push('/dashboard/login')
})

/* ============ الإحصائيات ============ */
const kpis = computed(() => {
  const list = orders.value
  return {
    total: list.length,
    preparing: list.filter(o => o.status === 'new' || o.status === 'preparing').length,
    ready: list.filter(o => o.status === 'ready').length,
    delivering: list.filter(o => o.status === 'delivering').length,
    delivered: list.filter(o => o.status === 'delivered').length,
    revenue: list.reduce((s, o) => s + o.total, 0),
    issues: list.filter(o => o.issue === 'no-answer').length
  }
})

/* ============ المسار (Timeline) ============ */
const STATUS_FLOW: { id: OrderStatus; label: string; icon: string }[] = [
  { id: 'new',        label: 'جديد',         icon: 'sparkles' },
  { id: 'preparing',  label: 'قيد التحضير', icon: 'chef-hat' },
  { id: 'ready',      label: 'جاهز',         icon: 'check-circle' },
  { id: 'delivering', label: 'مع المندوب',   icon: 'truck' },
  { id: 'delivered',  label: 'تم التوصيل',  icon: 'check-check' }
]

const statusIndex = (s: OrderStatus) => STATUS_FLOW.findIndex(x => x.id === s)

/* ============ المجموعات ============ */
const activeSections = computed(() => [
  {
    status: 'new',
    title: 'طلبات جديدة',
    subtitle: 'في انتظار المطبخ',
    color: '#3b82f6',
    icon: 'sparkles',
    orders: orders.value.filter(o => o.status === 'new').sort((a,b) => a.createdAt - b.createdAt)
  },
  {
    status: 'preparing',
    title: 'قيد التحضير',
    subtitle: 'المطبخ يحضّرها الآن',
    color: '#f59e0b',
    icon: 'chef-hat',
    orders: orders.value.filter(o => o.status === 'preparing').sort((a,b) => a.createdAt - b.createdAt)
  },
  {
    status: 'ready',
    title: 'جاهزة للتسليم',
    subtitle: 'في انتظار المندوب',
    color: '#10b981',
    icon: 'check-circle',
    orders: orders.value.filter(o => o.status === 'ready').sort((a,b) => a.createdAt - b.createdAt)
  },
  {
    status: 'delivering',
    title: 'مع المندوب',
    subtitle: 'في الطريق للعميل',
    color: '#8b5cf6',
    icon: 'truck',
    orders: orders.value.filter(o => o.status === 'delivering').sort((a,b) => a.createdAt - b.createdAt)
  }
].filter(s => s.orders.length > 0))

/* ============ Helpers ============ */
const getProd = (pid: string) => products.value.find(p => p.id === pid)
const itemsCount = (o: DashOrder) =>
  o.items.reduce((s, i) => s + (i.qty || 1), 0)

const extraCount = (o: DashOrder) =>
  o.items.length > 1 ? o.items.length - 1 : 0

const firstImg = (o: DashOrder) => getProd(o.items[0]?.pid)?.img || ''

const todayDate = computed(() =>
  new Date().toLocaleDateString('ar-KW', { weekday: 'long', day: 'numeric', month: 'long' })
)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="dash-head">
      <h1>اليوم</h1>
      <p>{{ todayDate }} · عرض لحظي لكل الطلبات</p>
    </div>

    <!-- KPIs -->
    <div class="dash-kpis">
      <div class="dash-kpi">
        <span class="dash-kpi-icon"><i data-lucide="package" /></span>
        <div>
          <b>{{ kpis.total }}</b>
          <small>إجمالي الطلبات</small>
        </div>
      </div>
      <div class="dash-kpi dash-kpi-warn">
        <span class="dash-kpi-icon"><i data-lucide="chef-hat" /></span>
        <div>
          <b>{{ kpis.preparing }}</b>
          <small>في المطبخ</small>
        </div>
      </div>
      <div class="dash-kpi dash-kpi-ok">
        <span class="dash-kpi-icon"><i data-lucide="truck" /></span>
        <div>
          <b>{{ kpis.ready + kpis.delivering }}</b>
          <small>جاهز / مع المندوب</small>
        </div>
      </div>
      <div class="dash-kpi dash-kpi-money">
        <span class="dash-kpi-icon"><i data-lucide="wallet" /></span>
        <div>
          <b>{{ KD(kpis.revenue) }}</b>
          <small>إيراد اليوم</small>
        </div>
      </div>
    </div>

    <!-- Issues banner -->
    <div v-if="kpis.issues > 0" class="dash-issues-banner">
      <i data-lucide="alert-triangle" />
      <span>{{ kpis.issues }} طلب — العميل لم يرد (المندوب يتعامل)</span>
    </div>

    <!-- ============ Sections ============ -->
    <section
      v-for="sec in activeSections"
      :key="sec.status"
      class="monitor-section"
      :style="{ '--c': sec.color }"
    >
      <!-- Section head -->
      <div class="monitor-section-head">
        <span class="monitor-section-icon">
          <i :data-lucide="sec.icon" />
        </span>
        <div class="monitor-section-title">
          <h2>{{ sec.title }}</h2>
          <small>{{ sec.subtitle }}</small>
        </div>
        <span class="monitor-section-count">{{ sec.orders.length }}</span>
      </div>

      <!-- Cards -->
      <div class="monitor-grid">
        <article
          v-for="o in sec.orders"
          :key="o.id"
          class="monitor-card"
        >
          <!-- Top: order id + time -->
          <div class="monitor-card-top">
            <div class="monitor-card-id">
              <b>#{{ o.id }}</b>
              <span v-if="o.isVip" class="monitor-vip">VIP</span>
            </div>
            <span class="monitor-time">
              <i data-lucide="clock" />
              {{ timeAgo(o.createdAt) }}
            </span>
          </div>

          <!-- Main body: image + info -->
          <div class="monitor-card-body">
            <!-- Image -->
            <div class="monitor-hero">
              <img
                v-if="firstImg(o)"
                :src="firstImg(o)"
                alt=""
                loading="lazy"
              />
              <b v-if="extraCount(o) > 0" class="monitor-hero-badge">
                +{{ extraCount(o) }}
              </b>
            </div>

            <!-- Info -->
            <div class="monitor-info">
              <div class="monitor-row">
                <i data-lucide="user" />
                <b>{{ o.customerName }}</b>
              </div>
              <div class="monitor-row">
                <i data-lucide="phone" />
                <span class="monitor-phone">{{ o.phone }}</span>
              </div>
              <div class="monitor-row">
                <i data-lucide="map-pin" />
                <span>{{ o.area }}</span>
              </div>
              <div class="monitor-row">
                <i data-lucide="calendar" />
                <span>{{ o.slot }}</span>
              </div>
              <div class="monitor-row">
                <i data-lucide="shopping-bag" />
                <span>{{ itemsCount(o) }} منتج</span>
              </div>
            </div>
          </div>

          <!-- Extras -->
          <div v-if="o.issue === 'no-answer'" class="monitor-issue">
            <i data-lucide="alert-triangle" />
            <span>العميل لم يرد — المندوب يتعامل</span>
          </div>

          <!-- Bottom: price + timeline -->
          <div class="monitor-card-foot">
            <div class="monitor-price">
              <b>{{ KD(o.total) }}</b>
              <small>{{ o.payment === 'cod' ? 'عند الاستلام' : 'مدفوع' }}</small>
            </div>
          </div>

          <!-- ⭐ Status Timeline -->
          <div class="monitor-timeline">
            <div
              v-for="(step, i) in STATUS_FLOW"
              :key="step.id"
              :class="[
                'monitor-step',
                {
                  done: i < statusIndex(o.status),
                  current: i === statusIndex(o.status)
                }
              ]"
            >
              <span class="monitor-step-dot">
                <i :data-lucide="i < statusIndex(o.status) ? 'check' : step.icon" />
              </span>
              <span class="monitor-step-label">{{ step.label }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Empty -->
    <div v-if="activeSections.length === 0" class="dash-empty">
      <i data-lucide="inbox" />
      <b>لا توجد طلبات نشطة</b>
      <span>كل الطلبات تم توصيلها</span>
    </div>
  </div>
</template>