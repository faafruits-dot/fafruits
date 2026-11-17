<script setup lang="ts">
import { useDashboardOrders } from '~/composables/useDashboardOrders'
import { useSettings } from '~/composables/useSettings'
import { useAuth } from '~/composables/useAuth'
import { useOrderMessages } from '~/composables/useOrderMessages'
import { useToast } from '~/composables/useToast'
import { KD } from '~/utils/format'
import type { DashOrder, OrderStatus } from '~/composables/useDashboardOrders'

definePageMeta({ layout: 'dashboard' })

const router = useRouter()
const { team, ready, loadMe, isAdmin } = useAuth()
const {
  orders, loading, error, load,
  notifyChef, notifyDriver, markDelivered
} = useDashboardOrders()
const { settings, load: loadSettings } = useSettings()
const { getChefUrl, getDriverUrl, buildChefMessage, buildDriverMessage } = useOrderMessages()
const { show } = useToast()

/* ═══ حالة الـ filters للمساعد ═══ */
type Tab = 'all' | 'today' | 'tomorrow' | 'week' | 'later' | 'delivered'
const activeTab = ref<Tab>('all')
const search = ref('')

/* ═══ حالة الأدمن — عرض فقط ═══ */
const adminSearch = ref('')
const adminStatusFilter = ref<OrderStatus | 'all'>('all')

/* ═══ Modal ═══ */
const waModal = ref({
  open: false,
  type: 'chef' as 'chef' | 'driver',
  orderId: '',
  message: '',
  waUrl: '',
})

/* ═══ Deliver Confirmation Modal ═══ */
const deliverModal = ref({
  open: false,
  orderId: '',
})

/* ═══ Load ═══ */
onMounted(async () => {
  if (!ready.value) await loadMe()
  if (!team.value) { router.push('/dashboard/login'); return }
  await Promise.all([load(), loadSettings()])
})

const chefPhone = computed(() => settings.value.chef_whatsapp || '')
const driverPhone = computed(() => settings.value.driver_whatsapp || '')

/* ═══ Helpers ═══ */
function daysDiff(dateStr: string) {
  if (!dateStr) return 999
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

function bucket(o: DashOrder): Tab {
  const d = daysDiff(o.delivery_date)
  if (d <= 0) return 'today'
  if (d === 1) return 'tomorrow'
  if (d <= 7) return 'week'
  return 'later'
}

/* ═══ Filtered — للمساعد (كروت) ═══ */
const filtered = computed(() => {
  const list = Array.isArray(orders.value) ? [...orders.value] : []
  let result = list

  if (activeTab.value === 'delivered') {
    result = result.filter(o => o.status === 'delivered')
  } else if (activeTab.value !== 'all') {
    result = result.filter(o => o.status !== 'delivered' && bucket(o) === activeTab.value)
  }

  const q = search.value.trim().toLowerCase()
  if (q) {
    result = result.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q)
    )
  }
  return result.sort((a, b) =>
    (a.delivery_date || '').localeCompare(b.delivery_date || '')
  )
})

/* ═══ Filtered — للأدمن (جدول) ═══ */
const adminFiltered = computed(() => {
  const list = Array.isArray(orders.value) ? [...orders.value] : []
  let result = list

  if (adminStatusFilter.value !== 'all') {
    result = result.filter(o => o.status === adminStatusFilter.value)
  }
  const q = adminSearch.value.trim().toLowerCase()
  if (q) {
    result = result.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q)
    )
  }
  return result.sort((a, b) => {
    return (b.created_at || '').localeCompare(a.created_at || '')
  })
})

/* ═══ Counts ═══ */
function countTab(t: Tab): number {
  const list = Array.isArray(orders.value) ? orders.value : []
  if (t === 'all') return list.length
  if (t === 'delivered') return list.filter(o => o.status === 'delivered').length
  return list.filter(o => o.status !== 'delivered' && bucket(o) === t).length
}

/* ═══ Actions (للمساعد فقط) ═══ */
async function handleNotifyChef(id: string) {
  if (!chefPhone.value) { show('⚠️ رقم الشيف غير محفوظ', 'alert-circle'); return }
  const o = orders.value?.find(x => x.id === id)
  if (!o) return

  const oldVal = o.chef_sent_at
  o.chef_sent_at = new Date().toISOString()

  waModal.value = {
    open: true, type: 'chef', orderId: id,
    message: buildChefMessage(o),
    waUrl: getChefUrl(o, chefPhone.value),
  }

  try {
    await notifyChef(id)
  } catch (e: any) {
    o.chef_sent_at = oldVal
    show(e?.data?.statusMessage || 'فشل حفظ إشعار الشيف', 'alert-circle')
  }
}

async function handleNotifyDriver(id: string) {
  if (!driverPhone.value) { show('⚠️ رقم المندوب غير محفوظ', 'alert-circle'); return }
  const o = orders.value?.find(x => x.id === id)
  if (!o) return

  const oldVal = o.driver_sent_at
  o.driver_sent_at = new Date().toISOString()

  waModal.value = {
    open: true, type: 'driver', orderId: id,
    message: buildDriverMessage(o),
    waUrl: getDriverUrl(o, driverPhone.value),
  }

  try {
    await notifyDriver(id)
  } catch (e: any) {
    o.driver_sent_at = oldVal
    show(e?.data?.statusMessage || 'فشل حفظ إشعار المندوب', 'alert-circle')
  }
}

/* فتح مودال تأكيد التوصيل */
function openDeliverModal(id: string) {
  deliverModal.value = {
    open: true,
    orderId: id,
  }
}

/* تأكيد التوصيل من داخل المودال */
async function confirmDeliver() {
  const id = deliverModal.value.orderId
  if (!id) return
  deliverModal.value.open = false
  try {
    await markDelivered(id)
    show('✅ تم تحديث الطلب إلى مكتمل', 'check-circle')
  } catch (e: any) {
    show(e?.data?.statusMessage || 'فشل تحديث حالة الطلب', 'alert-circle')
  }
}

/* ═══ Helpers للعرض ═══ */
const fmtDate = (s: string) => {
  if (!s) return '—'
  const d = new Date(s + 'T00:00:00')
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

const statusLabel = {
  new: 'جديدة',
  sent_to_chef: 'جاري التحضير',
  sent_to_driver: 'في الطريق',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي'
} as const

/* ═══ Tabs data (للمساعد) ═══ */
const tabs = computed(() => [
  { id: 'all' as Tab,       label: 'الكل',        count: countTab('all') },
  { id: 'today' as Tab,     label: 'اليوم',       count: countTab('today') },
  { id: 'tomorrow' as Tab,  label: 'غدًا',        count: countTab('tomorrow') },
  { id: 'week' as Tab,      label: 'هذا الأسبوع', count: countTab('week') },
  { id: 'later' as Tab,     label: 'لاحقًا',      count: countTab('later') },
  { id: 'delivered' as Tab, label: 'تم التوصيل',   count: countTab('delivered'), success: true },
])

/* ═══ Tabs data (للأدمن) ═══ */
const adminStatusFilters: { id: OrderStatus | 'all'; label: string }[] = [
  { id: 'all',            label: 'الكل' },
  { id: 'new',            label: 'جديدة' },
  { id: 'sent_to_chef',   label: 'جاري التحضير' },
  { id: 'sent_to_driver', label: 'في الطريق' },
  { id: 'delivered',      label: 'تم التوصيل' },
]

/* ═══ Details Drawer ═══ */
const detailsOpen = ref(false)
const detailsOrder = ref<DashOrder | null>(null)

function openDetails(order: DashOrder) {
  detailsOrder.value = order
  detailsOpen.value = true
}
</script>

<template>
  <div>
    <!-- ═══════════════════════════════════════════════════
         👑 واجهة الأدمن — جدول عرض فقط
         ═══════════════════════════════════════════════════ -->
    <template v-if="isAdmin">
      <div class="dash-head">
        <div>
          <h1>الطلبات</h1>
          <p>عرض فقط — للمتابعة والإشراف</p>
        </div>
        <div class="admin-actions">
          <button class="head-btn">
            <Icon name="filter" :size="14" />
            فلترة
          </button>
          <button class="head-btn">
            <Icon name="download" :size="14" />
            تصدير
          </button>
        </div>
      </div>

      <!-- Filters للأدمن -->
      <div class="admin-filters">
        <div class="admin-search">
          <Icon name="search" :size="18" />
          <input v-model="adminSearch" type="search" placeholder="ابحث برقم الطلب أو الاسم أو الجوال…" />
        </div>
        <div class="admin-status-chips">
          <button
            v-for="s in adminStatusFilters"
            :key="s.id"
            :class="['admin-chip', { on: adminStatusFilter === s.id }]"
            @click="adminStatusFilter = s.id"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="dash-empty">
        <Icon name="loader" class="spin" :size="28" />
        <b>جاري التحميل…</b>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="dash-empty">
        <Icon name="alert-circle" :size="28" />
        <b>{{ error }}</b>
        <button class="head-btn" @click="load()">إعادة المحاولة</button>
      </div>

      <!-- Table -->
      <div v-else class="table-card">
        <div class="table-card__head">
          <span class="table-card__ico">
            <Icon name="package" :size="18" />
          </span>
          <h3 class="table-card__title">كل الطلبات</h3>
          <span class="table-card__meta">{{ adminFiltered.length }} طلب</span>
        </div>

        <div class="table-wrap">
          <table class="orders-table">
            <thead>
              <tr>
                <th>الطلب</th>
                <th>العميل</th>
                <th>المنطقة</th>
                <th>التسليم</th>
                <th>الحالة</th>
                <th>المبلغ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in adminFiltered" :key="o.id">
                <td class="order-id-cell">#{{ o.id }}</td>
                <td class="customer-cell">
                  <b>{{ o.customer_name }}</b>
                  <span dir="ltr">{{ o.customer_phone }}</span>
                </td>
                <td>{{ o.area }}</td>
                <td>{{ fmtDate(o.delivery_date) }} · {{ o.slot }}</td>
                <td>
                  <span :class="['status-tag', o.status]">
                    {{ statusLabel[o.status] }}
                  </span>
                </td>
                <td class="price-cell">{{ KD(o.total) }}</td>
                <td>
                  <button class="view-btn" title="عرض التفاصيل" @click="openDetails(o)">
                    <Icon name="eye" :size="16" />
                  </button>
                </td>
              </tr>
              <tr v-if="!adminFiltered.length">
                <td colspan="7" class="empty-row">
                  <Icon name="inbox" :size="32" />
                  <span>لا توجد طلبات مطابقة</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════
         👤 واجهة المساعد — كروت مع أزرار
         ═══════════════════════════════════════════════════ -->
    <template v-else>
      <div class="dash-head">
        <div>
          <h1>الطلبات</h1>
          <p>{{ Array.isArray(orders) ? orders.length : 0 }} طلب — عرض الكل أو فلترة</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-wrap">
        <div class="tabs">
          <button
            v-for="t in tabs"
            :key="t.id"
            :class="['tab', { on: activeTab === t.id, 'tab--success': t.success }]"
            @click="activeTab = t.id"
          >
            {{ t.label }}
            <span class="tab__count">{{ t.count }}</span>
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="search-box">
        <Icon name="search" :size="18" />
        <input v-model="search" type="search" placeholder="ابحث برقم الطلب، الاسم، الجوال…" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="dash-empty">
        <Icon name="loader" class="spin" />
        <b>جاري التحميل…</b>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="dash-empty">
        <Icon name="alert-circle" />
        <b>{{ error }}</b>
        <button class="head-btn" @click="load()">إعادة المحاولة</button>
      </div>

      <!-- Grid -->
      <div v-else-if="filtered.length" class="orders-grid">
        <OrderCard
          v-for="o in filtered"
          :key="o.id"
          :order="o"
          @notify-chef="handleNotifyChef"
          @notify-driver="handleNotifyDriver"
          @deliver="openDeliverModal"
        />
      </div>

      <!-- Empty -->
      <div v-else class="dash-empty">
        <Icon name="inbox" :size="48" :stroke-width="1.5" />
        <b>لا توجد طلبات</b>
        <span>لم يتم العثور على طلبات مطابقة</span>
      </div>
    </template>

    <!-- ⭐⭐ المكونات المشتركة والمودال الاحترافي ⭐⭐ -->
    <OrderDetailsDrawer
      :open="detailsOpen"
      :order="detailsOrder"
      @close="detailsOpen = false"
    />

    <WhatsAppPreviewModal
      :open="waModal.open"
      :type="waModal.type"
      :order-id="waModal.orderId"
      :message="waModal.message"
      :wa-url="waModal.waUrl"
      @close="waModal.open = false"
    />

    <!-- مودال تأكيد التوصيل الاحترافي -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div v-if="deliverModal.open" class="dr-overlay" @click.self="deliverModal.open = false">
          <div class="confirm-modal" dir="rtl">
            <div class="confirm-modal__icon">
              <Icon name="check-circle" :size="24" />
            </div>
            <h3>تأكيد تسليم الطلب</h3>
            <p>هل أنت متأكد من تغيير حالة الطلب <b>#{{ deliverModal.orderId }}</b> إلى تم التوصيل؟</p>
            <div class="confirm-modal__actions">
              <button class="dash-btn dash-btn-ghost" @click="deliverModal.open = false">إلغاء</button>
              <button class="dash-btn dash-btn-primary" @click="confirmDeliver">تأكيد التوصيل</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.dash-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}
.dash-head h1 {
  font-family: "Playfair Display", "Almarai", serif;
  font-size: clamp(22px, 2.8vw, 30px);
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 6px;
}
.dash-head p { margin: 0; font-size: 13.5px; color: var(--ink-mute); }

.admin-actions { display: flex; gap: 8px; }
.head-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  font: 700 13px inherit;
  color: var(--ink);
  cursor: pointer;
  transition: all .25s ease;
}
.head-btn:hover { border-color: var(--burgundy); color: var(--burgundy); }

/* ═══ Admin Filters ═══ */
.admin-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.admin-search {
  flex: 1;
  min-width: 240px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
}
.admin-search :deep(svg) { color: var(--ink-mute); }
.admin-search input {
  flex: 1;
  border: 0; outline: 0;
  font: 600 14px inherit;
  color: var(--ink);
  background: transparent;
}
.admin-status-chips {
  display: flex; gap: 6px; flex-wrap: wrap;
}
.admin-chip {
  padding: 10px 16px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  font: 700 13px inherit;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all .2s ease;
}
.admin-chip:hover { border-color: var(--bronze); }
.admin-chip.on {
  background: linear-gradient(135deg, #8B2E3F, #6E1F2E);
  color: #FBEFE0;
  border-color: transparent;
}

/* ═══ Table Card ═══ */
.table-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
}
.table-card__head {
  display: flex; align-items: center; gap: 10px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--line);
}
.table-card__ico {
  width: 34px; height: 34px;
  display: grid; place-items: center;
  border-radius: 10px;
  background: rgba(110,31,46,.08);
  color: var(--burgundy);
}
.table-card__title {
  font-family: "Playfair Display", "Almarai", serif;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  color: var(--ink);
}
.table-card__meta {
  font-size: 12px;
  color: var(--ink-mute);
  font-weight: 700;
}

.table-wrap { overflow-x: auto; }
.orders-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.orders-table th {
  text-align: right;
  padding: 12px 14px;
  font-size: 11.5px;
  font-weight: 800;
  color: var(--ink-mute);
  text-transform: uppercase;
  letter-spacing: .05em;
  background: var(--cream);
  border-bottom: 1px solid var(--line);
}
.orders-table td {
  padding: 14px;
  font-size: 13px;
  color: var(--ink-soft);
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}
.orders-table tr:hover td { background: var(--cream); }
.orders-table tr:last-child td { border-bottom: 0; }

.order-id-cell {
  font-family: monospace;
  font-weight: 800;
  color: var(--burgundy);
  font-size: 13px;
}
.customer-cell b {
  display: block;
  font-size: 13.5px;
  color: var(--ink);
  font-weight: 700;
}
.customer-cell span {
  font-size: 11.5px;
  color: var(--ink-mute);
  display: block;
  margin-top: 2px;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}
.status-tag.new              { background: rgba(59,130,246,.12);  color: #3B82F6; }
.status-tag.sent_to_chef     { background: rgba(245,158,11,.12);  color: #F59E0B; }
.status-tag.sent_to_driver   { background: rgba(139,92,246,.12);  color: #8B5CF6; }
.status-tag.delivered        { background: rgba(16,185,129,.12);  color: #10B981; }
.status-tag.cancelled        { background: rgba(220,38,38,.12);   color: #DC2626; }

.price-cell {
  font-family: "Playfair Display", serif;
  font-weight: 600;
  color: var(--ink);
}

.view-btn {
  display: inline-grid;
  place-items: center;
  width: 34px; height: 34px;
  background: transparent;
  border: 0;
  border-radius: 8px;
  color: var(--burgundy);
  cursor: pointer;
  text-decoration: none;
  transition: all .2s ease;
}
.view-btn:hover { background: rgba(110,31,46,.08); }

.empty-row td {
  padding: 60px 20px;
  text-align: center;
  color: var(--ink-mute);
}
.empty-row :deep(svg) { display: block; margin: 0 auto 12px; color: var(--bronze); opacity: .6; }
.empty-row span { font-size: 13px; }

/* ═══ Assistant Filters ═══ */
.filters-wrap {
  display: flex; gap: 16px; flex-wrap: wrap;
  align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.tabs {
  display: flex; gap: 6px; flex-wrap: wrap;
  padding: 5px;
  background: rgba(255,255,255,.6);
  border: 1.5px solid rgba(255,255,255,.9);
  border-radius: 14px;
}
.tab {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; background: transparent;
  border: 0; border-radius: 10px;
  font: 700 13px inherit;
  color: var(--ink-soft);
  cursor: pointer;
  white-space: nowrap;
  transition: all .25s ease;
}
.tab:hover { background: rgba(255,255,255,.7); color: var(--ink); }
.tab.on {
  background: linear-gradient(135deg, #8B2E3F, #6E1F2E);
  color: #FBEFE0;
}
.tab.on.tab--success {
  background: linear-gradient(135deg, #059669, #047857);
  color: #fff;
}
.tab__count {
  display: inline-grid; place-items: center;
  min-width: 20px; height: 20px; padding: 0 6px;
  border-radius: 999px;
  background: rgba(0,0,0,.06);
  font-size: 11px; font-weight: 800;
}
.tab.on .tab__count { background: rgba(255,255,255,.22); color: #FBEFE0; }

.search-box {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 18px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  margin-bottom: 20px;
}
.search-box :deep(svg) { color: var(--ink-mute); }
.search-box input {
  flex: 1; border: 0; outline: 0;
  font: 600 14px inherit;
  color: var(--ink);
  background: transparent;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(400px, 1fr));
  gap: 16px;
}

/* ═══ States ═══ */
.dash-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  text-align: center;
  color: var(--ink-mute);
}
.dash-empty :deep(svg) { color: var(--bronze); }
.dash-empty b { font-size: 14px; color: var(--ink); font-weight: 800; }
.spin { animation: spin 1.4s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ═══ Confirm Modal Styles ═══ */
.dr-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(27,23,20,.55);
  backdrop-filter: blur(6px);
  display: grid; place-items: center;
  padding: 20px;
}
.confirm-modal {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,.25);
  border: 1.5px solid var(--line);
}
.confirm-modal__icon {
  width: 52px; height: 52px;
  margin: 0 auto 16px;
  background: rgba(16,185,129,.1);
  color: #10B981;
  border-radius: 50%;
  display: grid; place-items: center;
}
.confirm-modal h3 {
  font-family: "Playfair Display", "Almarai", serif;
  font-size: 18px; font-weight: 700;
  color: var(--ink); margin: 0 0 8px;
}
.confirm-modal p {
  font-size: 13.5px; color: var(--ink-soft);
  margin: 0 0 24px; line-height: 1.5;
}
.confirm-modal__actions {
  display: flex; gap: 10px; justify-content: center;
}
.dash-btn {
  padding: 10px 20px; border-radius: 999px;
  font: 700 13px inherit; cursor: pointer; border: 1.5px solid transparent;
  transition: all .2s ease;
}
.dash-btn-ghost {
  background: var(--cream); color: var(--ink-soft); border-color: var(--line);
}
.dash-btn-ghost:hover { background: rgba(0,0,0,.05); }
.dash-btn-primary {
  background: linear-gradient(135deg, #8B2E3F, #6E1F2E); color: #FBEFE0;
}
.dash-btn-primary:hover { filter: brightness(1.1); }

@media (max-width: 900px) {
  .orders-grid { grid-template-columns: 1fr; }
  .orders-table th:nth-child(4),
  .orders-table td:nth-child(4) { display: none; }
}
</style>