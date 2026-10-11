<script setup lang="ts">
import { useDashboardOrders } from '~/composables/useDashboardOrders'
import { useSettings } from '~/composables/useSettings'
import { useAuth } from '~/composables/useAuth'
import { KD, timeAgo } from '~/utils/format'
import type { DashOrder, OrderStatus } from '~/composables/useDashboardOrders'

definePageMeta({ layout: 'dashboard' })

const router = useRouter()
const { team, ready, loadMe } = useAuth()
const {
  orders, loading, error, load,
  markChefSent, markDriverSent, markDelivered
} = useDashboardOrders()
const { settings, load: loadSettings } = useSettings()

const sendingId = ref<string | null>(null)

/* ═══ تحميل البيانات ═══ */
onMounted(async () => {
  if (!ready.value) await loadMe()
  if (!team.value) {
    router.push('/dashboard/login')
    return
  }
  await Promise.all([load(), loadSettings()])
})

/* ═══ أرقام الواتساب ═══ */
const chefPhone   = computed(() => settings.value.chef_whatsapp   || '')
const driverPhone = computed(() => settings.value.driver_whatsapp || '')

/* ═══ بناء رسالة الشيف ═══ */
const buildChefMessage = (o: DashOrder): string => {
  const time = new Date(o.created_at).toLocaleTimeString('ar-KW', {
    hour: '2-digit', minute: '2-digit'
  })
  const origin = import.meta.client ? window.location.origin : ''

  const lines: string[] = [
    `🍓 طلب جديد — #${o.id}`,
    '━━━━━━━━━━━━━━━━━',
    `⏰ وقت الطلب: ${time}`,
    '',
    '📦 المنتجات:'
  ]

  o.items?.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.product_name} × ${it.qty}`)
    if (it.product_img) {
      lines.push(`   🖼 ${origin}${it.product_img}`)
    }
    if (it.extras?.length) {
      const ex = it.extras.map(e =>
        e.input_value ? `${e.extra_name} "${e.input_value}"` : e.extra_name
      ).join(' + ')
      lines.push(`   ➕ ${ex}`)
    }
  })

  if (o.notes) {
    lines.push('', `📝 ملاحظات: ${o.notes}`)
  }
  return lines.join('\n')
}

/* ═══ بناء رسالة المندوب ═══ */
const buildDriverMessage = (o: DashOrder): string => {
  const lines: string[] = [
    `🚚 طلب للتوصيل — #${o.id}`,
    '━━━━━━━━━━━━━━━━━',
    `👤 العميل: ${o.customer_name}`,
    `📞 الجوال: ${o.customer_phone}`,
    `📍 العنوان: ${o.area}، ${o.street}`,
    `📅 تاريخ التسليم: ${o.delivery_date}`,
    `⏰ وقت التسليم: ${o.slot}`,
    '',
    `💰 المطلوب تحصيله: ${Number(o.total).toFixed(2)} د.ك`,
    `💳 طريقة الدفع: ${o.payment_method === 'cod' ? 'عند الاستلام' : 'مدفوع مسبقًا'}`
  ]
  if (o.notes) lines.push('', `📝 ${o.notes}`)
  return lines.join('\n')
}

/* ═══ فتح واتساب ═══ */
const openWhatsApp = (phone: string, message: string) => {
  const clean = phone.replace(/\D/g, '')
  const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

/* ═══ الإرسال للشيف ═══ */
const sendToChef = async (o: DashOrder) => {
  if (!chefPhone.value) {
    alert('⚠️ رقم الشيف غير محفوظ. اذهب للإعدادات.')
    return
  }
  openWhatsApp(chefPhone.value, buildChefMessage(o))
  sendingId.value = o.id
  try {
    await markChefSent(o.id)
  } finally {
    sendingId.value = null
  }
}

/* ═══ الإرسال للمندوب ═══ */
const sendToDriver = async (o: DashOrder) => {
  if (!driverPhone.value) {
    alert('⚠️ رقم المندوب غير محفوظ. اذهب للإعدادات.')
    return
  }
  openWhatsApp(driverPhone.value, buildDriverMessage(o))
  sendingId.value = o.id
  try {
    await markDriverSent(o.id)
  } finally {
    sendingId.value = null
  }
}

/* ═══ تم التوصيل ═══ */
const markDone = async (o: DashOrder) => {
  if (!confirm(`تأكيد توصيل الطلب #${o.id}؟`)) return
  sendingId.value = o.id
  try {
    await markDelivered(o.id)
  } finally {
    sendingId.value = null
  }
}

/* ═══ الإحصائيات ═══ */
const kpis = computed(() => {
  const list = orders.value
  return {
    total:     list.length,
    new:       list.filter(o => o.status === 'new').length,
    chef:      list.filter(o => o.status === 'sent_to_chef').length,
    driver:    list.filter(o => o.status === 'sent_to_driver').length,
    delivered: list.filter(o => o.status === 'delivered').length,
    revenue:   list.reduce((s, o) => s + Number(o.total || 0), 0)
  }
})

/* ═══ خط الحالة ═══ */
const STATUS_FLOW: { id: OrderStatus; label: string; icon: string }[] = [
  { id: 'new',            label: 'جديد',        icon: 'sparkles' },
  { id: 'sent_to_chef',   label: 'عند الشيف',   icon: 'chef-hat' },
  { id: 'sent_to_driver', label: 'مع المندوب', icon: 'truck' },
  { id: 'delivered',      label: 'تم التوصيل', icon: 'check-check' }
]
const statusIndex = (s: OrderStatus) =>
  STATUS_FLOW.findIndex(x => x.id === s)

/* ═══ الأقسام النشطة ═══ */
const activeSections = computed(() => [
  {
    status: 'new' as const,
    title: 'طلبات جديدة',
    subtitle: 'لم تُرسل للشيف بعد',
    color: '#3b82f6',
    icon: 'sparkles',
    orders: orders.value.filter(o => o.status === 'new')
  },
  {
    status: 'sent_to_chef' as const,
    title: 'عند الشيف',
    subtitle: 'قيد التحضير في المطبخ',
    color: '#f59e0b',
    icon: 'chef-hat',
    orders: orders.value.filter(o => o.status === 'sent_to_chef')
  },
  {
    status: 'sent_to_driver' as const,
    title: 'مع المندوب',
    subtitle: 'في الطريق للعميل',
    color: '#8b5cf6',
    icon: 'truck',
    orders: orders.value.filter(o => o.status === 'sent_to_driver')
  }
].filter(s => s.orders.length > 0))

/* ═══ Helpers ═══ */
const itemsCount = (o: DashOrder) =>
  (o.items || []).reduce((s, i) => s + (i.qty || 1), 0)

const extrasCount = (o: DashOrder) =>
  (o.items || []).reduce((s, i) => s + (i.extras?.length || 0), 0)

const firstImg = (o: DashOrder) => o.items?.[0]?.product_img || ''

const todayDate = computed(() =>
  new Date().toLocaleDateString('ar-KW', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="dash-head">
      <h1>اليوم</h1>
      <p>{{ todayDate }} · عرض لحظي لكل الطلبات</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="dash-empty">
      <Icon name="loader" />
      <b>جاري التحميل…</b>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="dash-empty">
      <Icon name="alert-circle" />
      <b>{{ error }}</b>
      <button class="btn btn-primary" @click="load()">إعادة المحاولة</button>
    </div>

    <template v-else>
      <!-- KPIs -->
      <div class="dash-kpis">
        <div class="dash-kpi">
          <span class="dash-kpi-icon"><Icon name="package" /></span>
          <div>
            <b>{{ kpis.total }}</b>
            <small>إجمالي الطلبات</small>
          </div>
        </div>
        <div class="dash-kpi dash-kpi-warn">
          <span class="dash-kpi-icon"><Icon name="chef-hat" /></span>
          <div>
            <b>{{ kpis.chef }}</b>
            <small>عند الشيف</small>
          </div>
        </div>
        <div class="dash-kpi dash-kpi-ok">
          <span class="dash-kpi-icon"><Icon name="truck" /></span>
          <div>
            <b>{{ kpis.driver }}</b>
            <small>مع المندوب</small>
          </div>
        </div>
        <div class="dash-kpi dash-kpi-money">
          <span class="dash-kpi-icon"><Icon name="wallet" /></span>
          <div>
            <b>{{ KD(kpis.revenue) }}</b>
            <small>إيراد اليوم</small>
          </div>
        </div>
      </div>

      <!-- Sections -->
      <section
        v-for="sec in activeSections"
        :key="sec.status"
        class="monitor-section"
        :style="{ '--c': sec.color }"
      >
        <div class="monitor-section-head">
          <span class="monitor-section-icon">
            <Icon :name="sec.icon" :size="22" />
          </span>
          <div class="monitor-section-title">
            <h2>{{ sec.title }}</h2>
            <small>{{ sec.subtitle }}</small>
          </div>
          <span class="monitor-section-count">{{ sec.orders.length }}</span>
        </div>

        <div class="monitor-grid">
          <article
            v-for="o in sec.orders"
            :key="o.id"
            class="monitor-card"
          >
            <!-- Top -->
            <div class="monitor-card-top">
              <div class="monitor-card-id">
                <b>#{{ o.id }}</b>
              </div>
              <span class="monitor-time">
                <Icon name="clock" :size="14" />
                {{ timeAgo(o.created_at) }}
              </span>
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
                  <Icon name="user" :size="16" />
                  <b>{{ o.customer_name }}</b>
                </div>
                <div class="monitor-row">
                  <Icon name="phone" :size="16" />
                  <span dir="ltr">{{ o.customer_phone }}</span>
                </div>
                <div class="monitor-row">
                  <Icon name="map-pin" :size="16" />
                  <span>{{ o.area }}</span>
                </div>
                <div class="monitor-row">
                  <Icon name="calendar" :size="16" />
                  <span>{{ o.slot }}</span>
                </div>
                <div class="monitor-row">
                  <Icon name="shopping-bag" :size="16" />
                  <span>{{ itemsCount(o) }} منتج</span>
                </div>
              </div>
            </div>

            <!-- Price -->
            <div class="monitor-card-foot">
              <div class="monitor-price">
                <b>{{ KD(o.total) }}</b>
                <small>
                  {{ o.payment_method === 'cod' ? 'عند الاستلام' : 'مدفوع' }}
                </small>
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
                  <Icon :name="i < statusIndex(o.status) ? 'check' : step.icon" :size="14" />
                </span>
                <span class="monitor-step-label">{{ step.label }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="monitor-actions">
              <button
                class="wa-btn wa-chef"
                :disabled="sendingId === o.id || o.status === 'delivered'"
                @click="sendToChef(o)"
              >
                <Icon name="chef-hat" :size="16" />
                إرسال للشيف
              </button>

              <button
                class="wa-btn wa-driver"
                :disabled="sendingId === o.id || o.status === 'delivered'"
                @click="sendToDriver(o)"
              >
                <Icon name="truck" :size="16" />
                إرسال للمندوب
              </button>

              <button
                v-if="o.status === 'sent_to_driver'"
                class="wa-btn wa-done"
                :disabled="sendingId === o.id"
                @click="markDone(o)"
              >
                <Icon name="check" :size="16" />
                تم التوصيل
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- Empty -->
      <div v-if="activeSections.length === 0" class="dash-empty">
        <Icon name="inbox" />
        <b>لا توجد طلبات نشطة</b>
        <span>كل الطلبات تم توصيلها</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.monitor-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 12px 16px 16px;
}

.wa-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s ease;
  color: #fff;
}

.wa-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.wa-chef {
  background: linear-gradient(135deg, #f59e0b, #ffb020);
  grid-column: 1;
}
.wa-chef:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(245, 154, 35, .35);
}

.wa-driver {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  grid-column: 2;
}
.wa-driver:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(139, 92, 246, .35);
}

.wa-done {
  background: linear-gradient(135deg, #10b981, #34d399);
  grid-column: 1 / -1;
}
.wa-done:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(16, 185, 129, .35);
}
</style>