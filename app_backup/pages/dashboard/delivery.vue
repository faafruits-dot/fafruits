<script setup lang="ts">
import { useOrders, MOCK_DRIVERS } from '~/composables/useOrders'
import { useAuth } from '~/composables/useAuth'
import { useProducts } from '~/composables/useProducts'
import { KD } from '~/utils/format'
import { productTitle } from '~/utils/product'
import type { DashOrder } from '~/composables/useOrders'

definePageMeta({ layout: 'dashboard' })

const { user } = useAuth()
const router = useRouter()
const { orders, assignments, getDriverByPhone, persist } = useOrders()
const { products } = useProducts()

/* ============ المندوب الحالي ============ */
const currentDriver = computed(() => {
  if (!user.value) return null
  return getDriverByPhone(user.value.phone)
})

/* ============ طلبات المندوب ============ */
const myOrders = computed(() => {
  if (!currentDriver.value) return [] as DashOrder[]
  return orders.value.filter(o => assignments.value[o.id] === currentDriver.value!.id)
})

const readyOrders = computed(() => myOrders.value.filter(o => o.status === 'ready'))
const activeOrders = computed(() => myOrders.value.filter(o => o.status === 'delivering' && !o.issue))
const issueOrders = computed(() => myOrders.value.filter(o => !!o.issue))
const doneToday = computed(() => {
  return myOrders.value.filter(o => {
    if (o.status !== 'delivered') return false
    if (!o.deliveredAt) return true
    return Date.now() - o.deliveredAt < 24 * 60 * 60 * 1000
  })
})

const totalActive = computed(() =>
  readyOrders.value.length + activeOrders.value.length + issueOrders.value.length
)

const kpis = computed(() => ({
  ready: readyOrders.value.length,
  active: activeOrders.value.length,
  issues: issueOrders.value.length,
  done: doneToday.value.length
}))

/* ============ UI State ============ */
const showDoneList = ref(false)
const showIssueModal = ref(false)
const issueModalOrderId = ref<string | null>(null)
const showDeliverModal = ref(false)
const deliverModalOrderId = ref<string | null>(null)
const codCollected = ref(false)
const deliverNote = ref('')

/* ============ Timer ============ */
const now = ref(Date.now())
if (process.client) {
  setInterval(() => { now.value = Date.now() }, 30000)
}

/* ============ Helpers ============ */
const getProd = (pid: string) => products.value.find(p => p.id === pid)

const orderProdNames = (o: DashOrder) => {
  return o.items
    .map(it => {
      const p = getProd(it.pid)
      return p ? productTitle(p) : ''
    })
    .filter(Boolean)
}

const orderProdNamesShort = (o: DashOrder) => {
  const names = orderProdNames(o)
  const first = names.slice(0, 2).join(' · ')
  return names.length > 2 ? first + '…' : first
}

const orderItemsCount = (o: DashOrder) =>
  o.items.reduce((s, i) => s + (i.qty || 1), 0)

const elapsedStr = (o: DashOrder) => {
  if (!o.deliveryStartedAt) return ''
  const ms = now.value - o.deliveryStartedAt
  const m = Math.floor(ms / 60000)
  if (m < 60) return `${m} دقيقة`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r ? `${h} س ${r} د` : `${h} ساعة`
}

const mapsUrl = (o: DashOrder) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.area + ' ' + o.street + ' الكويت')}`

const issueHint = (issue: string) => {
  const map: Record<string, string> = {
    'no-answer': 'جرّب الاتصال مرة أخرى أو أرسل واتساب',
    'rejected': 'تواصل مع الإدارة فوراً قبل الإرجاع',
    'wrong-address': 'اطلب من العميل إرسال الموقع عبر واتساب',
    'product-issue': 'صوّر المنتج وأرسله للأدمن',
    'postponed': 'سيتم إعادة الجدولة تلقائياً'
  }
  return map[issue] || 'اتخذ إجراء مناسب'
}

const issueLabel = (issue: string) => {
  const map: Record<string, string> = {
    'no-answer': 'العميل لم يرد',
    'rejected': 'رفض الاستلام',
    'wrong-address': 'العنوان خطأ',
    'product-issue': 'مشكلة بالمنتج',
    'postponed': 'تم التأجيل'
  }
  return map[issue] || 'مشكلة'
}

/* ============ Actions ============ */
const persistOrders = () => {
  if (process.client) {
    localStorage.setItem('fa_dash_orders', JSON.stringify(orders.value))
  }
}

const startDelivery = (id: string) => {
  const o = orders.value.find(x => x.id === id) as DashOrder | undefined
  if (!o) return
  o.status = 'delivering'
  o.deliveryPhase = 'started'
  o.deliveryStartedAt = Date.now()
  o.attemptCount = o.attemptCount || 0
  persistOrders()
}

const arrived = (id: string) => {
  const o = orders.value.find(x => x.id === id) as DashOrder | undefined
  if (!o) return
  o.deliveryPhase = 'arrived'
  persistOrders()
}

const openDeliverModal = (id: string) => {
  deliverModalOrderId.value = id
  codCollected.value = false
  deliverNote.value = ''
  showDeliverModal.value = true
}

const confirmDeliver = () => {
  if (!deliverModalOrderId.value) return
  const o = orders.value.find(x => x.id === deliverModalOrderId.value) as DashOrder | undefined
  if (!o) return
  const isCod = o.payment === 'cod'
  if (isCod && !codCollected.value) return
  o.status = 'delivered'
  o.deliveryPhase = 'completed'
  o.deliveredAt = Date.now()
  o.paymentCollected = codCollected.value
  if (deliverNote.value.trim()) o.deliveryNote = deliverNote.value.trim()
  delete o.issue
  delete o.deliveryStartedAt
  persistOrders()
  showDeliverModal.value = false
  deliverModalOrderId.value = null
}

const markNoAnswer = (id: string) => {
  const o = orders.value.find(x => x.id === id) as DashOrder | undefined
  if (!o) return
  o.issue = 'no-answer'
  o.attemptCount = (o.attemptCount || 0) + 1
  persistOrders()
}

const openIssueModal = (id: string) => {
  issueModalOrderId.value = id
  showIssueModal.value = true
}

const pickIssue = (issue: string) => {
  if (!issueModalOrderId.value) return
  const o = orders.value.find(x => x.id === issueModalOrderId.value) as DashOrder | undefined
  if (!o) return
  o.issue = issue
  o.attemptCount = (o.attemptCount || 0) + 1
  persistOrders()
  showIssueModal.value = false
  issueModalOrderId.value = null
}

const retryContact = (id: string) => {
  const o = orders.value.find(x => x.id === id) as DashOrder | undefined
  if (!o) return
  o.attemptCount = (o.attemptCount || 0) + 1
  persistOrders()
  if (process.client) window.location.href = `tel:${o.phone}`
}

const postpone = (id: string) => {
  const o = orders.value.find(x => x.id === id) as DashOrder | undefined
  if (!o) return
  o.issue = 'postponed'
  o.postponedUntil = Date.now() + 30 * 60000
  persistOrders()
}

const returnToRestaurant = (id: string) => {
  const o = orders.value.find(x => x.id === id) as DashOrder | undefined
  if (!o) return
  if (!confirm(`سيتم إرجاع الطلب #${id} للمطعم وإبلاغ الأدمن. متابعة؟`)) return
  o.status = 'preparing'
  o.deliveryPhase = 'assigned'
  delete o.issue
  delete o.deliveryStartedAt
  delete o.attemptCount
  delete assignments.value[id]
  persistOrders()
}

const resolveIssue = (id: string) => {
  const o = orders.value.find(x => x.id === id) as DashOrder | undefined
  if (!o) return
  delete o.issue
  delete o.postponedUntil
  persistOrders()
}

/* ============ Deliver Modal Computed ============ */
const deliverOrder = computed(() => {
  if (!deliverModalOrderId.value) return null
  return orders.value.find(x => x.id === deliverModalOrderId.value) || null
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="dash-head">
      <h1>🚚 جدول التوصيل</h1>
      <p v-if="currentDriver">
        مرحباً {{ currentDriver.name }} · {{ totalActive }} طلب نشط
      </p>
      <p v-else>لا يوجد حساب مندوب مرتبط</p>
    </div>

    <!-- Not a driver -->
    <div v-if="!currentDriver" class="dash-empty">
      <i data-lucide="alert-circle" />
      <b>حسابك غير مرتبط بمندوب</b>
      <span>تواصل مع الإدارة لربط حسابك بمندوب في النظام</span>
    </div>

    <template v-else>
      <!-- KPIs -->
      <div class="dash-kpis">
        <div class="dash-kpi">
          <span class="dash-kpi-icon"><i data-lucide="package" /></span>
          <div><b>{{ kpis.ready }}</b><small>جاهز للاستلام</small></div>
        </div>
        <div class="dash-kpi dash-kpi-warn">
          <span class="dash-kpi-icon"><i data-lucide="truck" /></span>
          <div><b>{{ kpis.active }}</b><small>في الطريق</small></div>
        </div>
        <div class="dash-kpi" :class="kpis.issues ? 'dash-kpi-money' : ''">
          <span class="dash-kpi-icon"><i data-lucide="alert-triangle" /></span>
          <div><b>{{ kpis.issues }}</b><small>مشاكل</small></div>
        </div>
        <div class="dash-kpi dash-kpi-ok">
          <span class="dash-kpi-icon"><i data-lucide="check-check" /></span>
          <div><b>{{ kpis.done }}</b><small>تم التوصيل اليوم</small></div>
        </div>
      </div>

      <!-- Issues banner -->
      <div v-if="kpis.issues > 0" class="dash-issues-banner">
        <i data-lucide="alert-triangle" />
        <span>{{ kpis.issues }} طلب بحاجة إلى معالجة فورية</span>
      </div>

      <!-- ============ Section: جاهز للاستلام ============ -->
      <section v-if="readyOrders.length" class="dv-section dv-section-new">
        <div class="dv-section-head">
          <span class="dv-section-icon" style="--c:#10b981">
            <i data-lucide="package-check" />
          </span>
          <div>
            <b>جاهز للاستلام</b>
            <small>ابدأ التوصيل الآن</small>
          </div>
          <span class="dv-section-count">{{ readyOrders.length }}</span>
        </div>

        <div class="dv-list">
          <article v-for="o in readyOrders" :key="o.id" class="dv-card dv-card-ready">
            <div class="dv-card-head">
              <div class="dv-card-id">
                <b>#{{ o.id }}</b>
                <span v-if="o.isVip" class="dash-vip">VIP</span>
              </div>
              <span class="dv-badge dv-badge-ready">
                <i data-lucide="package-check" /> جاهز للاستلام
              </span>
              <span class="dv-card-time">
                <i data-lucide="clock" /> {{ o.slot }}
              </span>
            </div>

            <div class="dv-card-body">
              <div class="dv-card-prod">
                <span class="dv-prod-thumb">
                  <img v-if="getProd(o.items[0]?.pid)" :src="getProd(o.items[0].pid)!.img" alt="" />
                  <b v-if="o.items.length > 1" class="dv-prod-badge">+{{ o.items.length - 1 }}</b>
                </span>
                <div class="dv-prod-info">
                  <b>{{ orderItemsCount(o) }} منتج</b>
                  <small>{{ orderProdNamesShort(o) }}</small>
                </div>
                <div class="dv-card-price">
                  <b>{{ KD(o.total) }}</b>
                  <small :class="o.payment === 'cod' ? 'dv-cod' : 'dv-paid'">
                    <i :data-lucide="o.payment === 'cod' ? 'banknote' : 'check-circle'" />
                    {{ o.payment === 'cod' ? 'تحصيل نقدي' : 'مدفوع' }}
                  </small>
                </div>
              </div>

              <div class="dv-card-customer">
                <div class="dv-cust-row">
                  <i data-lucide="user" />
                  <b>{{ o.customerName }}</b>
                  <span class="dv-cust-phone">{{ o.phone }}</span>
                </div>
                <div class="dv-cust-row">
                  <i data-lucide="map-pin" />
                  <span>{{ o.area }} · {{ o.street }}</span>
                  <a :href="mapsUrl(o)" target="_blank" class="dv-map-link" title="افتح بالخرائط">
                    <i data-lucide="external-link" />
                  </a>
                </div>
                <div v-if="o.notes" class="dv-cust-row dv-note">
                  <i data-lucide="message-square" />
                  <span>{{ o.notes }}</span>
                </div>
              </div>
            </div>

            <div class="dv-actions">
              <button class="dv-btn dv-btn-primary" @click="startDelivery(o.id)">
                <i data-lucide="play" /> <span>ابدأ التوصيل</span>
              </button>
              <a class="dv-btn dv-btn-ghost" :href="`tel:${o.phone}`" title="اتصال">
                <i data-lucide="phone" />
              </a>
              <a class="dv-btn dv-btn-ghost" :href="`https://wa.me/${o.phone}`" target="_blank" title="واتساب">
                <i data-lucide="message-circle" />
              </a>
              <a class="dv-btn dv-btn-ghost" :href="mapsUrl(o)" target="_blank" title="الموقع">
                <i data-lucide="map-pin" />
              </a>
            </div>
          </article>
        </div>
      </section>

      <!-- ============ Section: في الطريق الآن ============ -->
      <section v-if="activeOrders.length" class="dv-section dv-section-active">
        <div class="dv-section-head">
          <span class="dv-section-icon" style="--c:#8b5cf6">
            <i data-lucide="truck" />
          </span>
          <div>
            <b>في الطريق الآن</b>
            <small>متابعة حية</small>
          </div>
          <span class="dv-section-count">{{ activeOrders.length }}</span>
        </div>

        <div class="dv-list">
          <article v-for="o in activeOrders" :key="o.id" class="dv-card dv-card-active">
            <div class="dv-card-head">
              <div class="dv-card-id">
                <b>#{{ o.id }}</b>
                <span v-if="o.isVip" class="dash-vip">VIP</span>
              </div>
              <span class="dv-badge dv-badge-active">
                <i data-lucide="truck" /> في الطريق
              </span>
              <span class="dv-card-time">
                <i data-lucide="clock" /> {{ o.slot }}
              </span>
            </div>

            <div class="dv-card-body">
              <div class="dv-card-prod">
                <span class="dv-prod-thumb">
                  <img v-if="getProd(o.items[0]?.pid)" :src="getProd(o.items[0].pid)!.img" alt="" />
                  <b v-if="o.items.length > 1" class="dv-prod-badge">+{{ o.items.length - 1 }}</b>
                </span>
                <div class="dv-prod-info">
                  <b>{{ orderItemsCount(o) }} منتج</b>
                  <small>{{ orderProdNamesShort(o) }}</small>
                </div>
                <div class="dv-card-price">
                  <b>{{ KD(o.total) }}</b>
                  <small :class="o.payment === 'cod' ? 'dv-cod' : 'dv-paid'">
                    <i :data-lucide="o.payment === 'cod' ? 'banknote' : 'check-circle'" />
                    {{ o.payment === 'cod' ? 'تحصيل نقدي' : 'مدفوع' }}
                  </small>
                </div>
              </div>

              <div class="dv-card-customer">
                <div class="dv-cust-row">
                  <i data-lucide="user" />
                  <b>{{ o.customerName }}</b>
                  <span class="dv-cust-phone">{{ o.phone }}</span>
                </div>
                <div class="dv-cust-row">
                  <i data-lucide="map-pin" />
                  <span>{{ o.area }} · {{ o.street }}</span>
                  <a :href="mapsUrl(o)" target="_blank" class="dv-map-link">
                    <i data-lucide="external-link" />
                  </a>
                </div>
                <div v-if="o.notes" class="dv-cust-row dv-note">
                  <i data-lucide="message-square" />
                  <span>{{ o.notes }}</span>
                </div>
              </div>
            </div>

            <div class="dv-timer">
              <i data-lucide="clock" />
              <span>منذ بدء التوصيل: <b>{{ elapsedStr(o) }}</b></span>
            </div>

            <div class="dv-actions">
              <button class="dv-btn dv-btn-success" @click="arrived(o.id)">
                <i data-lucide="map-pin-check" /> <span>وصلت للموقع</span>
              </button>
              <a class="dv-btn dv-btn-ghost" :href="mapsUrl(o)" target="_blank" title="الموقع">
                <i data-lucide="navigation" />
              </a>
              <a class="dv-btn dv-btn-ghost" :href="`tel:${o.phone}`" title="اتصال">
                <i data-lucide="phone" />
              </a>
              <a class="dv-btn dv-btn-ghost" :href="`https://wa.me/${o.phone}`" target="_blank" title="واتساب">
                <i data-lucide="message-circle" />
              </a>
            </div>

            <div class="dv-actions dv-actions-secondary">
              <button class="dv-btn dv-btn-warn" @click="markNoAnswer(o.id)">
                <i data-lucide="phone-off" /> <span>لم يرد العميل</span>
              </button>
              <button class="dv-btn dv-btn-success-outline" @click="openDeliverModal(o.id)">
                <i data-lucide="check-check" /> <span>تم التسليم</span>
              </button>
              <button class="dv-btn dv-btn-danger-outline" @click="openIssueModal(o.id)" title="مشكلة أخرى">
                <i data-lucide="alert-triangle" />
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- ============ Section: بحاجة إلى معالجة ============ -->
      <section v-if="issueOrders.length" class="dv-section dv-section-issues">
        <div class="dv-section-head">
          <span class="dv-section-icon" style="--c:#dc2626">
            <i data-lucide="alert-triangle" />
          </span>
          <div>
            <b>بحاجة إلى معالجة</b>
            <small>اتخذ إجراء الآن</small>
          </div>
          <span class="dv-section-count">{{ issueOrders.length }}</span>
        </div>

        <div class="dv-list">
          <article v-for="o in issueOrders" :key="o.id" class="dv-card dv-card-issue">
            <div class="dv-card-head">
              <div class="dv-card-id">
                <b>#{{ o.id }}</b>
                <span v-if="o.isVip" class="dash-vip">VIP</span>
              </div>
              <span class="dv-badge dv-badge-issue">
                <i data-lucide="alert-triangle" /> {{ issueLabel(o.issue || '') }}
              </span>
              <span class="dv-card-time">
                <i data-lucide="clock" /> {{ o.slot }}
              </span>
            </div>

            <div class="dv-card-body">
              <div class="dv-card-prod">
                <span class="dv-prod-thumb">
                  <img v-if="getProd(o.items[0]?.pid)" :src="getProd(o.items[0].pid)!.img" alt="" />
                  <b v-if="o.items.length > 1" class="dv-prod-badge">+{{ o.items.length - 1 }}</b>
                </span>
                <div class="dv-prod-info">
                  <b>{{ orderItemsCount(o) }} منتج</b>
                  <small>{{ orderProdNamesShort(o) }}</small>
                </div>
                <div class="dv-card-price">
                  <b>{{ KD(o.total) }}</b>
                  <small :class="o.payment === 'cod' ? 'dv-cod' : 'dv-paid'">
                    <i :data-lucide="o.payment === 'cod' ? 'banknote' : 'check-circle'" />
                    {{ o.payment === 'cod' ? 'تحصيل نقدي' : 'مدفوع' }}
                  </small>
                </div>
              </div>

              <div class="dv-card-customer">
                <div class="dv-cust-row">
                  <i data-lucide="user" />
                  <b>{{ o.customerName }}</b>
                  <span class="dv-cust-phone">{{ o.phone }}</span>
                </div>
                <div class="dv-cust-row">
                  <i data-lucide="map-pin" />
                  <span>{{ o.area }} · {{ o.street }}</span>
                </div>
              </div>
            </div>

            <div class="dv-issue-panel">
              <div class="dv-issue-info">
                <i data-lucide="alert-triangle" />
                <div>
                  <b>
                    {{ issueLabel(o.issue || '') }}
                    <span v-if="o.attemptCount"> ({{ o.attemptCount }} محاولة)</span>
                  </b>
                  <small>{{ issueHint(o.issue || '') }}</small>
                </div>
              </div>

              <div class="dv-issue-actions">
                <button class="dv-btn dv-btn-primary" @click="retryContact(o.id)">
                  <i data-lucide="phone-call" /> <span>محاولة أخرى</span>
                </button>
                <button class="dv-btn dv-btn-warn" @click="postpone(o.id)">
                  <i data-lucide="clock" /> <span>تأجيل 30 د</span>
                </button>
                <button class="dv-btn dv-btn-danger-outline" @click="returnToRestaurant(o.id)">
                  <i data-lucide="undo-2" /> <span>إرجاع للمطعم</span>
                </button>
                <a class="dv-btn dv-btn-ghost" href="https://wa.me/96551180015" target="_blank" title="الأدمن">
                  <i data-lucide="headset" /> <span>الأدمن</span>
                </a>
                <button class="dv-btn dv-btn-success-outline" style="grid-column:1 / -1" @click="resolveIssue(o.id)">
                  <i data-lucide="check" /> <span>تم حل المشكلة — متابعة التسليم</span>
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- ============ Section: تم التوصيل اليوم ============ -->
      <section v-if="doneToday.length" class="dv-section dv-section-done">
        <div class="dv-section-head" style="cursor:pointer" @click="showDoneList = !showDoneList">
          <span class="dv-section-icon" style="--c:#64748b">
            <i data-lucide="check-check" />
          </span>
          <div>
            <b>تم التوصيل اليوم</b>
            <small>{{ doneToday.length }} طلب</small>
          </div>
          <i
            data-lucide="chevron-down"
            class="dv-section-chevron"
            :style="{ transform: showDoneList ? 'rotate(180deg)' : 'rotate(0)' }"
          />
        </div>

        <div v-show="showDoneList" class="dv-done-list">
          <div v-for="o in doneToday" :key="o.id" class="dv-done-row">
            <span class="dv-done-id">#{{ o.id }}</span>
            <span class="dv-done-name">{{ o.customerName }}</span>
            <span class="dv-done-price">{{ KD(o.total) }}</span>
            <i data-lucide="check-circle" style="color:#10b981" />
          </div>
        </div>
      </section>

      <!-- Empty state -->
      <div v-if="!readyOrders.length && !activeOrders.length && !issueOrders.length && !doneToday.length" class="dash-empty">
        <i data-lucide="party-popper" />
        <b>لا توجد طلبات مسندة إليك حالياً</b>
        <span>سيتم إشعارك عند إسناد طلب جديد من الإدارة</span>
      </div>
    </template>

    <!-- ============ Deliver Modal ============ -->
    <div v-if="showDeliverModal" class="dash-modal-overlay" @click.self="showDeliverModal = false">
      <div class="dash-modal" @click.stop>
        <div class="dash-modal-head">
          <div>
            <h2>تأكيد التسليم</h2>
            <p style="font-size:.8rem;color:var(--muted);margin:4px 0 0">
              #{{ deliverModalOrderId }}
            </p>
          </div>
          <button class="dash-icon-btn" @click="showDeliverModal = false"><i data-lucide="x" /></button>
        </div>

        <div class="dash-modal-body">
          <template v-if="deliverOrder">
            <div :class="['dash-deliver-cod', { ok: codCollected }]">
              <div class="dv-cod-head">
                <i :data-lucide="deliverOrder.payment === 'cod' ? (codCollected ? 'check-circle' : 'banknote') : 'check-circle'" />
                <div>
                  <b v-if="deliverOrder.payment === 'cod'">
                    {{ codCollected ? 'تم تحصيل المبلغ' : 'تحصيل نقدي مطلوب' }}
                  </b>
                  <b v-else>الطلب مدفوع مسبقاً — لا مبلغ مطلوب</b>
                  <small>المبلغ: {{ KD(deliverOrder.total) }}</small>
                </div>
              </div>

              <label v-if="deliverOrder.payment === 'cod'" class="dash-checkbox" style="margin-top:10px">
                <input v-model="codCollected" type="checkbox" />
                <span>تم استلام المبلغ نقداً من العميل</span>
              </label>
            </div>

            <div class="dash-field">
              <label>ملاحظة (اختياري)</label>
              <textarea v-model="deliverNote" class="dash-input" rows="2" placeholder="ملاحظة للتسليم..." />
            </div>

            <div class="dash-modal-actions">
              <button class="dash-btn dash-btn-ghost" @click="showDeliverModal = false">إلغاء</button>
              <button class="dash-btn dash-btn-primary" @click="confirmDeliver">
                <i data-lucide="check-check" /> تأكيد التسليم
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- ============ Issue Modal ============ -->
    <div v-if="showIssueModal" class="dash-modal-overlay" @click.self="showIssueModal = false">
      <div class="dash-modal" @click.stop>
        <div class="dash-modal-head">
          <div>
            <h2>ما هي المشكلة؟</h2>
            <p style="font-size:.8rem;color:var(--muted);margin:4px 0 0">
              #{{ issueModalOrderId }}
            </p>
          </div>
          <button class="dash-icon-btn" @click="showIssueModal = false"><i data-lucide="x" /></button>
        </div>

        <div class="dash-modal-body">
          <div class="dv-issue-options">
            <button class="dv-issue-option" @click="pickIssue('no-answer')">
              <span class="dv-issue-icon"><i data-lucide="phone-off" /></span>
              <div><b>العميل لم يرد</b><small>لا يوجد رد على الهاتف</small></div>
              <i data-lucide="chevron-left" class="dv-issue-arrow" />
            </button>
            <button class="dv-issue-option" @click="pickIssue('wrong-address')">
              <span class="dv-issue-icon"><i data-lucide="map-pin-off" /></span>
              <div><b>العنوان خطأ</b><small>لم أستطع الوصول للعنوان</small></div>
              <i data-lucide="chevron-left" class="dv-issue-arrow" />
            </button>
            <button class="dv-issue-option" @click="pickIssue('rejected')">
              <span class="dv-issue-icon"><i data-lucide="x-circle" /></span>
              <div><b>العميل رفض</b><small>رفض استلام الطلب</small></div>
              <i data-lucide="chevron-left" class="dv-issue-arrow" />
            </button>
            <button class="dv-issue-option" @click="pickIssue('product-issue')">
              <span class="dv-issue-icon"><i data-lucide="alert-triangle" /></span>
              <div><b>مشكلة بالمنتج</b><small>ملاحظة على المنتج نفسه</small></div>
              <i data-lucide="chevron-left" class="dv-issue-arrow" />
            </button>
          </div>

          <div class="dash-modal-actions">
            <button class="dash-btn dash-btn-ghost" @click="showIssueModal = false">إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>