<script setup lang="ts">
import { useDashboardOrders } from '~/composables/useDashboardOrders'
import { useSettings } from '~/composables/useSettings'
import { useAuth } from '~/composables/useAuth'
import { KD, timeAgo } from '~/utils/format'
import type { DashOrder, OrderStatus } from '~/composables/useDashboardOrders'

definePageMeta({ layout: 'dashboard' })

const router = useRouter()
const { team, ready, loadMe } = useAuth()
const { orders, loading, error, load } = useDashboardOrders()
const { settings, load: loadSettings } = useSettings()

/* ═══ الفلاتر ═══ */
const statusFilter = ref<OrderStatus | 'all'>('all')
const timeFilter   = ref<'today' | 'week' | 'month' | 'all'>('all')
const search       = ref('')

/* ═══ تحميل ═══ */
onMounted(async () => {
  if (!ready.value) await loadMe()
  if (!team.value) {
    router.push('/dashboard/login')
    return
  }
  await Promise.all([load(), loadSettings()])
})

/* ═══ STATUS_META ═══ */
const STATUS_META: Record<OrderStatus, {
  label: string; color: string; bg: string; border: string; icon: string
}> = {
  new:            { label: 'جديد',        color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', icon: 'sparkles' },
  sent_to_chef:   { label: 'عند الشيف',   color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: 'chef-hat' },
  sent_to_driver: { label: 'مع المندوب', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', icon: 'truck' },
  delivered:      { label: 'تم التوصيل', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', icon: 'check-check' },
  cancelled:      { label: 'ملغي',        color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: 'x-circle' }
}

/* ═══ Timeline ═══ */
const STATUS_FLOW: { id: OrderStatus; label: string; icon: string }[] = [
  { id: 'new',            label: 'جديد',        icon: 'sparkles' },
  { id: 'sent_to_chef',   label: 'عند الشيف',   icon: 'chef-hat' },
  { id: 'sent_to_driver', label: 'مع المندوب', icon: 'truck' },
  { id: 'delivered',      label: 'تم التوصيل', icon: 'check-check' }
]
const statusIndex = (s: OrderStatus) =>
  STATUS_FLOW.findIndex(x => x.id === s)

/* ═══ فلترة زمنية ═══ */
const timeFiltered = computed(() => {
  if (timeFilter.value === 'all') return orders.value
  const now = Date.now()
  const limits = { today: 86400000, week: 7 * 86400000, month: 30 * 86400000 }
  const maxAge = limits[timeFilter.value]
  return orders.value.filter(o => {
    const age = now - new Date(o.created_at).getTime()
    return age <= maxAge
  })
})

/* ═══ الفلترة النهائية ═══ */
const filtered = computed(() => {
  let list = [...timeFiltered.value]

  if (statusFilter.value !== 'all') {
    list = list.filter(o => o.status === statusFilter.value)
  }

  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q)
    )
  }

  return list.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
})

/* ═══ العدادات ═══ */
const counts = computed(() => {
  const base = timeFiltered.value
  return {
    all:            base.length,
    new:            base.filter(o => o.status === 'new').length,
    sent_to_chef:   base.filter(o => o.status === 'sent_to_chef').length,
    sent_to_driver: base.filter(o => o.status === 'sent_to_driver').length,
    delivered:      base.filter(o => o.status === 'delivered').length,
    cancelled:      base.filter(o => o.status === 'cancelled').length
  }
})

/* ═══ Helpers ═══ */
const itemsCount = (o: DashOrder) =>
  (o.items || []).reduce((s, i) => s + (i.qty || 1), 0)

const extrasCount = (o: DashOrder) =>
  (o.items || []).reduce((s, i) => s + (i.extras?.length || 0), 0)

const firstImg = (o: DashOrder) => o.items?.[0]?.product_img || ''

const deliveryDate = (o: DashOrder) => {
  if (!o.delivery_date) return '—'
  const d = new Date(o.delivery_date)
  return d.toLocaleDateString('ar-KW', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="dash-head">
      <div>
        <h1>الطلبات</h1>
        <p>{{ counts.all }} طلب — عرض فقط</p>
      </div>
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
          <Icon :name="tf.icon" :size="14" />
          <span>{{ tf.label }}</span>
        </button>
      </div>

      <!-- Search -->
      <div class="dash-search">
        <Icon name="search" :size="18" />
        <input
          v-model="search"
          type="search"
          placeholder="ابحث برقم الطلب، الاسم، الجوال…"
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

    <!-- Loading -->
    <div v-if="loading" class="dash-empty">
      <Icon name="loader" :size="32" />
      <b>جاري التحميل…</b>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="dash-empty">
      <Icon name="alert-circle" :size="32" />
      <b>{{ error }}</b>
      <button class="btn btn-primary" @click="load()">إعادة المحاولة</button>
    </div>

    <!-- Grid -->
    <div v-else-if="filtered.length" class="monitor-grid">
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
            <Icon :name="STATUS_META[o.status].icon" :size="12" />
            <b>{{ STATUS_META[o.status].label }}</b>
          </span>
          <span class="monitor-time">
            <Icon name="clock" :size="12" />
            {{ timeAgo(o.created_at) }}
          </span>
        </div>

        <!-- Top -->
        <div class="monitor-card-top">
          <div class="monitor-card-id">
            <b>#{{ o.id }}</b>
          </div>
        </div>

        <!-- Body -->
        <div class="monitor-card-body">
          <div class="monitor-hero">
            <img v-if="firstImg(o)" :src="firstImg(o)" alt="" loading="lazy" />
            <b v-if="extrasCount(o) > 0" class="monitor-hero-badge">
              +{{ extrasCount(o) }}
            </b>
          </div>

          <div class="monitor-info">
            <div class="monitor-row">
              <Icon name="user" :size="14" />
              <b>{{ o.customer_name }}</b>
            </div>
            <div class="monitor-row">
              <Icon name="phone" :size="14" />
              <span dir="ltr">{{ o.customer_phone }}</span>
            </div>
            <div class="monitor-row">
              <Icon name="map-pin" :size="14" />
              <span>{{ o.area }} · {{ o.street }}</span>
            </div>
            <div class="monitor-row">
              <Icon name="calendar" :size="14" />
              <span>{{ deliveryDate(o) }} · {{ o.slot }}</span>
            </div>
            <div class="monitor-row">
              <Icon name="shopping-bag" :size="14" />
              <span>{{ itemsCount(o) }} منتج</span>
            </div>
            <div v-if="o.notes" class="monitor-note">
              <Icon name="message-square" :size="13" />
              <span>{{ o.notes }}</span>
            </div>
          </div>
        </div>

        <!-- Timeline -->
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
              <Icon :name="i < statusIndex(o.status) ? 'check' : step.icon" :size="12" />
            </span>
            <span class="monitor-step-label">{{ step.label }}</span>
          </div>
        </div>

        <!-- Foot -->
        <div class="monitor-card-foot">
          <div class="monitor-price">
            <b>{{ KD(o.total) }}</b>
            <small>{{ o.payment_method === 'cod' ? 'عند الاستلام' : 'مدفوع' }}</small>
          </div>
        </div>
      </article>
    </div>

    <!-- Empty -->
    <div v-else class="dash-empty">
      <Icon name="inbox" :size="48" :stroke-width="1.5" />
      <b>لا توجد طلبات</b>
      <span>لم يتم العثور على طلبات مطابقة</span>
    </div>
  </div>
</template>