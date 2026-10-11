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

/* ============ الفلاتر ============ */
const statusFilter = ref<OrderStatus | 'all'>('all')
const timeFilter = ref<'today' | 'week' | 'month' | 'all'>('today')
const search = ref('')

/* ============ STATUS_META ============ */
const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
  new:        { label:'جديد',         color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe', icon:'sparkles' },
  preparing:  { label:'قيد التحضير', color:'#f59e0b', bg:'#fffbeb', border:'#fde68a', icon:'chef-hat' },
  ready:      { label:'جاهز',         color:'#10b981', bg:'#ecfdf5', border:'#a7f3d0', icon:'check-circle' },
  delivering: { label:'مع المندوب',   color:'#8b5cf6', bg:'#f5f3ff', border:'#ddd6fe', icon:'truck' },
  delivered:  { label:'تم التوصيل',  color:'#64748b', bg:'#f8fafc', border:'#e2e8f0', icon:'check-check' }
}

/* ============ Timeline Flow — 5 خطوات كاملة ============ */
const STATUS_FLOW: { id: OrderStatus; label: string; icon: string }[] = [
  { id: 'new',        label: 'جديد',         icon: 'sparkles' },
  { id: 'preparing',  label: 'قيد التحضير', icon: 'chef-hat' },
  { id: 'ready',      label: 'جاهز',         icon: 'check-circle' },
  { id: 'delivering', label: 'مع المندوب',   icon: 'truck' },
  { id: 'delivered',  label: 'تم التوصيل',  icon: 'check-check' }
]

const statusIndex = (s: OrderStatus) => STATUS_FLOW.findIndex(x => x.id === s)

/* ============ الفلترة ============ */
const filtered = computed(() => {
  let list = [...orders.value]

  /* Time filter */
  if (timeFilter.value !== 'all') {
    const maxDay = timeFilter.value === 'today' ? 0
                 : timeFilter.value === 'week'  ? 7
                 : 30
    list = list.filter(o => (o.day ?? 0) <= maxDay)
  }

  /* Status filter */
  if (statusFilter.value !== 'all') {
    list = list.filter(o => o.status === statusFilter.value)
  }

  /* Search */
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.phone.includes(q)
    )
  }

  return list.sort((a, b) => b.createdAt - a.createdAt)
})

const counts = computed(() => {
  let base = orders.value
  if (timeFilter.value !== 'all') {
    const maxDay = timeFilter.value === 'today' ? 0
                 : timeFilter.value === 'week'  ? 7
                 : 30
    base = base.filter(o => (o.day ?? 0) <= maxDay)
  }
  return {
    all: base.length,
    new: base.filter(o => o.status === 'new').length,
    preparing: base.filter(o => o.status === 'preparing').length,
    ready: base.filter(o => o.status === 'ready').length,
    delivering: base.filter(o => o.status === 'delivering').length,
    delivered: base.filter(o => o.status === 'delivered').length
  }
})

/* ============ Helpers ============ */
const getProd = (pid: string) => products.value.find(p => p.id === pid)
const itemsCount = (o: DashOrder) =>
  o.items.reduce((s, i) => s + (i.qty || 1), 0)
const extraCount = (o: DashOrder) => o.items.length > 1 ? o.items.length - 1 : 0
const firstImg = (o: DashOrder) => getProd(o.items[0]?.pid)?.img || ''
</script>

<template>
  <div>
    <!-- Header -->
    <div class="dash-head">
      <h1>الطلبات</h1>
      <p>{{ counts.all }} طلب — عرض فقط</p>
    </div>

    <!-- Filters -->
    <div class="dash-filters">
      <!-- Time -->
      <div class="filter-row">
        <button
          v-for="tf in [
            { id:'today', label:'اليوم',        icon:'sun' },
            { id:'week',  label:'هذا الأسبوع', icon:'calendar-days' },
            { id:'month', label:'هذا الشهر',   icon:'calendar' },
            { id:'all',   label:'الكل',         icon:'layers' }
          ]"
          :key="tf.id"
          :class="['filter-chip', { on: timeFilter === tf.id }]"
          @click="timeFilter = tf.id as any"
        >
          <i :data-lucide="tf.icon" />
          <span>{{ tf.label }}</span>
        </button>
      </div>

      <!-- Search -->
      <div class="dash-search">
        <i data-lucide="search" />
        <input
          v-model="search"
          type="search"
          placeholder="ابحث برقم الطلب، الاسم، الجوال..."
        />
      </div>

      <!-- Status -->
      <div class="filter-row">
        <button
          :class="['filter-chip', { on: statusFilter === 'all' }]"
          @click="statusFilter = 'all'"
        >
          <span>الكل</span>
          <b>{{ counts.all }}</b>
        </button>
        <button
          v-for="(meta, key) in STATUS_META"
          :key="key"
          :class="['filter-chip', { on: statusFilter === key }]"
          :style="{ '--chip-c': meta.color, '--chip-bg': meta.bg }"
          @click="statusFilter = key as any"
        >
          <span class="filter-dot" :style="{ background: meta.color }" />
          <span>{{ meta.label }}</span>
          <b>{{ counts[key as keyof typeof counts] }}</b>
        </button>
      </div>
    </div>

    <!-- Grid -->
    <div v-if="filtered.length" class="monitor-grid">
      <article
        v-for="o in filtered"
        :key="o.id"
        class="monitor-card"
        :style="{
          '--c': STATUS_META[o.status].color,
          '--c-bg': STATUS_META[o.status].bg,
          '--c-border': STATUS_META[o.status].border
        }"
      >
        <!-- Status strip -->
        <div class="monitor-status-strip">
          <span class="monitor-status-pill">
            <i :data-lucide="STATUS_META[o.status].icon" />
            <b>{{ STATUS_META[o.status].label }}</b>
          </span>
          <span class="monitor-time">
            <i data-lucide="clock" />
            {{ timeAgo(o.createdAt) }}
          </span>
        </div>

        <!-- Top row -->
        <div class="monitor-card-top">
          <div class="monitor-card-id">
            <b>#{{ o.id }}</b>
            <span v-if="o.isVip" class="monitor-vip">VIP</span>
            <span v-if="o.issue === 'no-answer'" class="monitor-issue-chip">
              <i data-lucide="alert-triangle" />
            </span>
          </div>
        </div>

        <!-- Body -->
        <div class="monitor-card-body">
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
              <span>{{ o.area }} · {{ o.street }}</span>
            </div>
            <div class="monitor-row">
              <i data-lucide="calendar" />
              <span>{{ o.slot }}</span>
            </div>
            <div class="monitor-row">
              <i data-lucide="shopping-bag" />
              <span>{{ itemsCount(o) }} منتج</span>
            </div>
            <div v-if="o.notes" class="monitor-note">
              <i data-lucide="message-square" />
              <span>{{ o.notes }}</span>
            </div>
          </div>
        </div>

        <!-- ⭐ Timeline — 5 خطوات كاملة -->
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

        <!-- Foot -->
        <div class="monitor-card-foot">
          <div class="monitor-price">
            <b>{{ KD(o.total) }}</b>
            <small>{{ o.payment === 'cod' ? 'عند الاستلام' : 'مدفوع' }}</small>
          </div>
          <span class="monitor-delivery-date">
            <i data-lucide="calendar" />
            {{ o.day === 0 ? 'اليوم' : `منذ ${o.day} يوم` }}
          </span>
        </div>
      </article>
    </div>

    <!-- Empty -->
    <div v-else class="dash-empty">
      <i data-lucide="inbox" />
      <b>لا توجد طلبات</b>
      <span>لم يتم العثور على طلبات مطابقة</span>
    </div>
  </div>
</template>