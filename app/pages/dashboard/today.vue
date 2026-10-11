<script setup lang="ts">
import { useDashboardOrders } from '~/composables/useDashboardOrders'
import { useSettings } from '~/composables/useSettings'
import { useAuth } from '~/composables/useAuth'
import { useOrderMessages } from '~/composables/useOrderMessages'
import { useToast } from '~/composables/useToast'
import { KD } from '~/utils/format'
import type { DashOrder } from '~/composables/useDashboardOrders'

definePageMeta({ layout: 'dashboard' })

const router = useRouter()
const { team, ready, loadMe } = useAuth()
const {
  orders, loading, error, load,
  notifyChef, notifyDriver,
  startPreparation, goOnWay, markDelivered
} = useDashboardOrders()
const { settings, load: loadSettings } = useSettings()
const { getChefUrl, getDriverUrl, buildChefMessage, buildDriverMessage } = useOrderMessages()
const { show } = useToast()

/* ═══ Modal state ═══ */
const waModal = ref<{
  open: boolean
  type: 'chef' | 'driver'
  orderId: string
  message: string
  waUrl: string
}>({
  open: false,
  type: 'chef',
  orderId: '',
  message: '',
  waUrl: '',
})

const pendingOrderId = ref<string | null>(null)

/* ═══ Load ═══ */
onMounted(async () => {
  if (!ready.value) await loadMe()
  if (!team.value) {
    router.push('/dashboard/login')
    return
  }
  await Promise.all([load(), loadSettings()])
})

/* ═══ الأرقام ═══ */
const chefPhone = computed(() => settings.value.chef_whatsapp || '')
const driverPhone = computed(() => settings.value.driver_whatsapp || '')

/* ═══ Actions ═══ */
function handleNotifyChef(id: string) {
  if (!chefPhone.value) {
    show('⚠️ رقم الشيف غير محفوظ — اذهب للإعدادات', 'alert-circle')
    return
  }
  const o = orders.value.find(x => x.id === id)
  if (!o) return

  waModal.value = {
    open: true,
    type: 'chef',
    orderId: id,
    message: buildChefMessage(o),
    waUrl: getChefUrl(o, chefPhone.value),
  }
  pendingOrderId.value = id
}

function handleNotifyDriver(id: string) {
  if (!driverPhone.value) {
    show('⚠️ رقم المندوب غير محفوظ — اذهب للإعدادات', 'alert-circle')
    return
  }
  const o = orders.value.find(x => x.id === id)
  if (!o) return

  waModal.value = {
    open: true,
    type: 'driver',
    orderId: id,
    message: buildDriverMessage(o),
    waUrl: getDriverUrl(o, driverPhone.value),
  }
  pendingOrderId.value = id
}

async function onWaSent() {
  const id = pendingOrderId.value
  if (!id) return
  try {
    if (waModal.value.type === 'chef') {
      await notifyChef(id)
      show('✅ تم إبلاغ الشيف', 'check')
    } else {
      await notifyDriver(id)
      show('✅ تم إبلاغ المندوب', 'check')
    }
  } catch (e: any) {
    show(e?.data?.statusMessage || 'فشل تسجيل الإشعار', 'alert-circle')
  }
  pendingOrderId.value = null
}

async function handleStartPrep(id: string) {
  try {
    await startPreparation(id)
    show('🍳 بدء التحضير', 'chef-hat')
  } catch (e: any) {
    show(e?.data?.statusMessage || 'فشل التحديث', 'alert-circle')
  }
}

async function handleGoWay(id: string) {
  try {
    await goOnWay(id)
    show('🚚 الطلب في الطريق', 'truck')
  } catch (e: any) {
    show(e?.data?.statusMessage || 'فشل التحديث', 'alert-circle')
  }
}

async function handleDeliver(id: string) {
  if (!confirm(`تأكيد توصيل الطلب #${id}؟`)) return
  try {
    await markDelivered(id)
    show('✅ تم التوصيل', 'check-circle')
  } catch (e: any) {
    show(e?.data?.statusMessage || 'فشل التحديث', 'alert-circle')
  }
}

/* ═══ Filters — "اليوم" ═══ */
const todayDate = new Date().toISOString().slice(0, 10)

const todayOrders = computed(() =>
  orders.value.filter(o => o.delivery_date === todayDate)
)

const lateOrders = computed(() =>
  orders.value.filter(o => {
    if (o.status === 'delivered') return false
    return o.delivery_date < todayDate
  })
)

/* ═══ KPIs ═══ */
const kpis = computed(() => {
  const list = todayOrders.value
  return {
    total:     list.length,
    prep:      list.filter(o => o.status === 'sent_to_chef').length,
    way:       list.filter(o => o.status === 'sent_to_driver').length,
    delivered: list.filter(o => o.status === 'delivered').length,
    revenue:   list.reduce((s, o) => s + Number(o.total || 0), 0),
  }
})

/* ═══ Sections ═══ */
const sections = computed(() => {
  const list = todayOrders.value
  return [
    {
      id: 'new',
      title: 'طلبات جديدة',
      icon: 'bell',
      color: 'blue',
      orders: list.filter(o => o.status === 'new'),
    },
    {
      id: 'prep',
      title: 'جاري التحضير',
      icon: 'chef-hat',
      color: 'amber',
      orders: list.filter(o => o.status === 'sent_to_chef'),
    },
    {
      id: 'way',
      title: 'في الطريق',
      icon: 'truck',
      color: 'purple',
      orders: list.filter(o => o.status === 'sent_to_driver'),
    },
    {
      id: 'delivered',
      title: 'تم التوصيل',
      icon: 'check-circle',
      color: 'green',
      orders: list.filter(o => o.status === 'delivered'),
    },
  ]
})

const todayLabel = computed(() =>
  new Date().toLocaleDateString('ar-KW', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
)

function switchToLate() {
  router.push('/dashboard/orders')
}
</script>

<template>
  <div>
    <!-- ═══ Header ═══ -->
    <div class="dash-head">
      <div>
        <h1>لوحة العمل</h1>
        <p>{{ todayLabel }} — الطلبات المقرّرة النهاردة فقط</p>
      </div>
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
      <!-- Late Banner -->
      <div v-if="lateOrders.length" class="late-banner">
        <span class="late-banner__ico"><Icon name="alert-triangle" :size="20" /></span>
        <div class="late-banner__txt">
          <b>{{ lateOrders.length }} {{ lateOrders.length === 1 ? 'طلب متأخر' : 'طلبات متأخرة' }} يحتاج تصرّف فوري</b>
          <span>موعد التوصيل فات، لسه محتاجة إجراء</span>
        </div>
        <button class="late-banner__action" @click="switchToLate">
          <Icon name="eye" :size="14" /> عرض المتأخرة
        </button>
      </div>

      <!-- KPIs -->
      <div class="dash-kpis">
        <div class="dash-kpi">
          <span class="dash-kpi-icon"><Icon name="package" :size="20" /></span>
          <div><b>{{ kpis.total }}</b><small>طلبات اليوم</small></div>
        </div>
        <div class="dash-kpi dash-kpi-warn">
          <span class="dash-kpi-icon"><Icon name="chef-hat" :size="20" /></span>
          <div><b>{{ kpis.prep }}</b><small>جاري التحضير</small></div>
        </div>
        <div class="dash-kpi dash-kpi-purple">
          <span class="dash-kpi-icon"><Icon name="truck" :size="20" /></span>
          <div><b>{{ kpis.way }}</b><small>في الطريق</small></div>
        </div>
        <div class="dash-kpi dash-kpi-ok">
          <span class="dash-kpi-icon"><Icon name="check-circle" :size="20" /></span>
          <div><b>{{ kpis.delivered }}</b><small>تم التوصيل</small></div>
        </div>
      </div>

      <!-- Sections -->
      <section
        v-for="sec in sections"
        :key="sec.id"
        v-show="sec.orders.length > 0"
        class="monitor-section"
      >
        <div class="monitor-section-head">
          <span :class="['monitor-section-icon', `ico-${sec.color}`]">
            <Icon :name="sec.icon" :size="18" />
          </span>
          <div class="monitor-section-title">
            <h2>{{ sec.title }}</h2>
          </div>
          <span class="monitor-section-count">{{ sec.orders.length }}</span>
        </div>

        <div class="orders-grid">
          <OrderCard
            v-for="o in sec.orders"
            :key="o.id"
            :order="o"
            @notify-chef="handleNotifyChef"
            @notify-driver="handleNotifyDriver"
            @start-prep="handleStartPrep"
            @go-way="handleGoWay"
            @deliver="handleDeliver"
          />
        </div>
      </section>

      <!-- Empty -->
      <div v-if="todayOrders.length === 0" class="dash-empty">
        <Icon name="inbox" :size="48" :stroke-width="1.5" />
        <b>لا توجد طلبات النهاردة</b>
        <span>استمتع بيومك ☕</span>
      </div>
    </template>

    <!-- WhatsApp Preview -->
    <WhatsAppPreviewModal
      :open="waModal.open"
      :type="waModal.type"
      :order-id="waModal.orderId"
      :message="waModal.message"
      :wa-url="waModal.waUrl"
      @close="waModal.open = false"
      @sent="onWaSent"
    />
  </div>
</template>

<style scoped>
/* ═══ Late Banner ═══ */
.late-banner {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 20px; border-radius: 16px;
  margin-bottom: 24px; flex-wrap: wrap;
  background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
  border: 1.5px solid rgba(220,38,38,.3);
  color: #991B1B;
}
.late-banner__ico {
  width: 40px; height: 40px;
  display: grid; place-items: center;
  background: #DC2626; color: #fff;
  border-radius: 12px; flex-shrink: 0;
}
.late-banner__txt { flex: 1; min-width: 0; }
.late-banner__txt b { display: block; font-size: 14px; font-weight: 800; }
.late-banner__txt span { font-size: 12.5px; opacity: .85; display: block; margin-top: 3px; }
.late-banner__action {
  padding: 10px 18px;
  background: #DC2626; color: #fff;
  border: 0; border-radius: 999px;
  font: 800 12.5px inherit;
  display: inline-flex; align-items: center; gap: 6px;
  cursor: pointer;
}

/* ═══ KPI colors ═══ */
.dash-kpi-purple .dash-kpi-icon {
  background: rgba(139,92,246,.12);
  color: #8B5CF6;
}

/* ═══ Section icon colors ═══ */
.monitor-section-icon {
  width: 40px; height: 40px;
  display: grid; place-items: center;
  border-radius: 12px;
}
.ico-blue    { background: rgba(59,130,246,.12);  color: #3B82F6; }
.ico-amber   { background: rgba(245,158,11,.12);  color: #F59E0B; }
.ico-purple  { background: rgba(139,92,246,.12);  color: #8B5CF6; }
.ico-green   { background: rgba(16,185,129,.12);  color: #10B981; }

/* ═══ Orders Grid ═══ */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
}

@media (max-width: 900px) {
  .orders-grid { grid-template-columns: 1fr; }
}
</style>