<script setup lang="ts">
import { KD } from '~/utils/format'
import type { DashOrder } from '~/composables/useDashboardOrders'

const props = defineProps<{
  order: DashOrder
}>()

const emit = defineEmits<{
  (e: 'notify-chef', id: string): void
  (e: 'notify-driver', id: string): void
  (e: 'deliver', id: string): void
}>()

/* ═══ Helpers ═══ */
const itemsCount = computed(() =>
  (props.order.items || []).reduce((s, i) => s + (i.qty || 1), 0)
)
const firstImg = computed(() => props.order.items?.[0]?.product_img || '')

/* ═══ Time badges ═══ */
const AR_DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

const deliveryInfo = computed(() => {
  const s = props.order.delivery_date
  if (!s) return { cls: 'later', label: '—', icon: 'calendar' }
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(s + 'T00:00:00')
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)

  if (diff <= 0) return { cls: 'today', label: 'اليوم', icon: 'check' }
  if (diff === 1) return { cls: 'tomorrow', label: 'غدًا', icon: 'clock' }
  if (diff <= 7) return { cls: 'week', label: `بعد ${diff} أيام`, icon: 'calendar' }
  return { cls: 'later', label: `بعد ${diff} يوم`, icon: 'calendar' }
})

const fmtDateFull = (s: string) => {
  if (!s) return '—'
  const d = new Date(s + 'T00:00:00')
  return `${AR_DAYS[d.getDay()]}، ${d.getDate()} ${AR_MONTHS[d.getMonth()]}`
}

const chefNotified = computed(() => !!props.order.chef_sent_at)
const driverNotified = computed(() => !!props.order.driver_sent_at)
const isDelivered = computed(() => props.order.status === 'delivered')

const canNotifyChef = computed(() => {
  if (chefNotified.value) return false
  const info = deliveryInfo.value
  return info.cls === 'today' || info.cls === 'tomorrow'
})

const canNotifyDriver = computed(() => {
  if (driverNotified.value) return false
  const info = deliveryInfo.value
  return info.cls === 'today'
})

const isScheduled = computed(() => {
  const info = deliveryInfo.value
  return info.cls === 'week' || info.cls === 'later'
})

const activationLabel = computed(() => {
  const s = props.order.delivery_date
  if (!s) return ''
  const d = new Date(s + 'T00:00:00')
  d.setDate(d.getDate() - 1)
  const today = new Date(); today.setHours(0,0,0,0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diff <= 0) return 'اليوم'
  if (diff === 1) return 'غدًا'
  return `${d.getDate()} ${AR_MONTHS[d.getMonth()]}`
})
</script>

<template>
  <article class="order-card" :class="{ 'is-delivered': isDelivered, 'is-scheduled': isScheduled }">
    <!-- ═══ Head ═══ -->
    <div class="oc-head">
      <span class="oc-id">#{{ order.id }}</span>
      <span :class="['oc-badge', `time-${deliveryInfo.cls}`]">
        <Icon :name="deliveryInfo.icon" :size="11" />
        {{ deliveryInfo.label }}
      </span>
      <span v-if="isDelivered" class="oc-badge time-today" style="margin-inline-start: auto;">
        <Icon name="check-circle" :size="11" /> تم التوصيل
      </span>
    </div>

    <!-- ═══ Body ═══ -->
    <div class="oc-body">
      <img class="oc-img" :src="firstImg" :alt="order.id" loading="lazy" />
      <div class="oc-info">
        <div class="oc-row">
          <Icon name="user" :size="14" /><b>{{ order.customer_name }}</b>
        </div>
        <div class="oc-row">
          <Icon name="phone" :size="14" /><span dir="ltr">{{ order.customer_phone }}</span>
        </div>
        <div class="oc-row">
          <Icon name="map-pin" :size="14" /><span>{{ order.area }} · {{ order.street }}</span>
        </div>
        <div class="oc-row">
          <Icon name="calendar" :size="14" />
          <span>{{ fmtDateFull(order.delivery_date) }} — {{ order.slot }}</span>
        </div>
        <div class="oc-row">
          <Icon name="package" :size="14" /><span>{{ itemsCount }} منتج</span>
        </div>
        <!-- السعر أسفل عدد المنتجات -->
        <div class="oc-row oc-price-row">
          <Icon name="tag" :size="14" />
          <span><b>{{ KD(order.total) }}</b> <small>د.ك</small></span>
        </div>
      </div>
    </div>

    <!-- ═══ Notifications (مخفي في الطلبات المجدولة) ═══ -->
    <div v-if="!isScheduled" class="oc-notify">
      <div class="oc-notify__title">
        <Icon name="bell" :size="12" /> الإشعارات
      </div>
      <div class="oc-notify__grid">
        <div :class="['oc-notify__item', chefNotified ? 'done' : 'pending']">
          <span class="oc-notify__ico">
            <Icon :name="chefNotified ? 'check' : 'chef-hat'" :size="12" />
          </span>
          <span>الشيف</span>
          <span v-if="chefNotified" class="oc-notify__time">
            {{ new Date(order.chef_sent_at!).toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' }) }}
          </span>
        </div>
        <div :class="['oc-notify__item', driverNotified ? 'done' : 'pending']">
          <span class="oc-notify__ico">
            <Icon :name="driverNotified ? 'check' : 'truck'" :size="12" />
          </span>
          <span>المندوب</span>
          <span v-if="driverNotified" class="oc-notify__time">
            {{ new Date(order.driver_sent_at!).toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' }) }}
          </span>
        </div>
      </div>
    </div>

    <!-- ═══ Foot (أزرار متوازنة) ═══ -->
    <div class="oc-foot">
      <div v-if="isScheduled" class="oc-scheduled">
        <Icon name="hourglass" :size="14" />
        <span>مجدول — التفعيل <strong>{{ activationLabel }}</strong></span>
      </div>

      <button
        v-if="!isScheduled && !isDelivered"
        :class="['oc-btn', chefNotified ? 'oc-btn--notified' : 'oc-btn--notify-chef']"
        :disabled="!canNotifyChef"
        @click="emit('notify-chef', order.id)"
      >
        <Icon :name="chefNotified ? 'check' : 'send'" :size="14" />
        {{ chefNotified ? 'تم إبلاغ الشيف' : 'إبلاغ الشيف' }}
      </button>

      <button
        v-if="!isScheduled && !isDelivered"
        :class="['oc-btn', driverNotified ? 'oc-btn--notified' : 'oc-btn--notify-driver']"
        :disabled="!canNotifyDriver"
        @click="emit('notify-driver', order.id)"
      >
        <Icon :name="driverNotified ? 'check' : 'send'" :size="14" />
        {{ driverNotified ? 'تم إبلاغ المندوب' : 'إبلاغ المندوب' }}
      </button>

      <!-- زر تأكيد التوصيل (مخفي في الطلبات المجدولة) -->
      <button
        v-if="!isScheduled && !isDelivered"
        class="oc-btn oc-btn--delivered"
        @click="emit('deliver', order.id)"
      >
        <Icon name="check-circle" :size="14" />
        تأكيد التوصيل
      </button>

      <span v-if="isDelivered" class="oc-complete">
        <Icon name="check-circle" :size="16" /> مكتمل
      </span>
    </div>
  </article>
</template>

<style scoped>
.order-card { background: #fff; border: 1.5px solid var(--line); border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; transition: all .3s cubic-bezier(.22,1,.36,1); }
.order-card:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -24px rgba(50,35,20,.4); }
.order-card.is-delivered { opacity: 0.85; background: rgba(16,185,129,.03); }
.oc-head { display: flex; align-items: center; gap: 8px; padding: 14px 16px; border-bottom: 1px dashed var(--line); flex-wrap: wrap; }
.oc-id { font-family: monospace; font-size: 13px; font-weight: 800; color: var(--ink); letter-spacing: .3px; }
.oc-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; color: #fff; white-space: nowrap; }
.oc-badge.time-today { background: linear-gradient(135deg, #10B981, #059669); }
.oc-badge.time-tomorrow { background: linear-gradient(135deg, #F59E0B, #D97706); }
.oc-badge.time-week { background: linear-gradient(135deg, #A8855B, #8B6D45); }
.oc-badge.time-later { background: linear-gradient(135deg, #6B7280, #4B5563); }
.oc-body { display: grid; grid-template-columns: 76px 1fr; gap: 14px; padding: 16px; flex: 1; }
.order-card.is-scheduled .oc-body { border-bottom: 1px dashed var(--line); }
.oc-img { width: 76px; height: 76px; border-radius: 12px; object-fit: cover; background: var(--cream); }
.oc-info { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.oc-row { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--ink-soft); line-height: 1.4; }
.oc-row :deep(svg) { flex-shrink: 0; color: var(--bronze); }
.oc-row b { color: var(--ink); font-weight: 700; }
.oc-price-row b { font-family: "Playfair Display", serif; color: var(--burgundy); font-size: 14px; }
.oc-price-row small { color: var(--bronze); font-weight: 700; }

.oc-notify { padding: 12px 16px; background: rgba(247,242,236,.5); border-top: 1px dashed var(--line); border-bottom: 1px dashed var(--line); }
.oc-notify__title { font-size: 10.5px; font-weight: 800; color: var(--ink-mute); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.oc-notify__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.oc-notify__item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; }
.oc-notify__item.pending { background: rgba(255,255,255,.7); border: 1px dashed rgba(122,112,101,.35); color: var(--ink-mute); }
.oc-notify__item.done { background: rgba(5,150,105,.08); border: 1px solid rgba(5,150,105,.25); color: #059669; }
.oc-notify__ico { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; flex-shrink: 0; }
.oc-notify__item.pending .oc-notify__ico { background: rgba(122,112,101,.15); }
.oc-notify__item.done .oc-notify__ico { background: #059669; color: #fff; }
.oc-notify__time { font-size: 10px; opacity: .75; margin-inline-start: auto; font-weight: 600; }

.oc-foot { display: flex; align-items: center; gap: 8px; padding: 14px 16px; background: rgba(247,242,236,.5); flex-wrap: wrap; }
.oc-foot .oc-btn { flex: 1; justify-content: center; min-width: 0; padding: 9px 8px; font-size: 11.5px; }

.oc-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border: 1.5px solid transparent; border-radius: 999px; font: 800 12px inherit; white-space: nowrap; background: transparent; cursor: pointer; transition: all .25s cubic-bezier(.22,1,.36,1); }
.oc-btn--notify-chef { background: rgba(245,158,11,.12); color: #F59E0B; border-color: rgba(245,158,11,.3); }
.oc-btn--notify-chef:hover:not(:disabled) { background: #F59E0B; color: #fff; }
.oc-btn--notify-driver { background: rgba(139,92,246,.12); color: #8B5CF6; border-color: rgba(139,92,246,.3); }
.oc-btn--notify-driver:hover:not(:disabled) { background: #8B5CF6; color: #fff; }
.oc-btn--delivered { background: rgba(16,185,129,.15); color: #059669; border-color: rgba(16,185,129,.35); }
.oc-btn--delivered:hover { background: #10B981; color: #fff; }
.oc-btn--notified { background: rgba(5,150,105,.08); color: #059669; border-color: rgba(5,150,105,.25); cursor: default; }
.oc-btn:disabled { background: rgba(27,23,20,.05); color: var(--ink-mute); border-color: rgba(27,23,20,.08); box-shadow: none; cursor: not-allowed; opacity: .65; }
.oc-scheduled { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 14px; background: rgba(201,168,124,.10); border: 1px dashed rgba(168,133,91,.4); border-radius: 12px; font-size: 12px; color: var(--bronze); font-weight: 700; width: 100%; }
.oc-scheduled strong { color: var(--burgundy); }
.oc-complete { font-size: 12px; color: #10B981; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; width: 100%; justify-content: center; }
</style>