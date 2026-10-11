<script setup lang="ts">
import { KD } from '~/utils/format'
import type { DashOrder } from '~/composables/useDashboardOrders'

const props = defineProps<{
  open: boolean
  order: DashOrder | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

/* ═══ Status meta ═══ */
const statusMeta: Record<string, { label: string; color: string; icon: string }> = {
  new:             { label: 'جديدة',        color: '#3B82F6', icon: 'sparkles' },
  sent_to_chef:    { label: 'جاري التحضير', color: '#F59E0B', icon: 'chef-hat' },
  sent_to_driver:  { label: 'في الطريق',    color: '#8B5CF6', icon: 'truck' },
  delivered:       { label: 'تم التوصيل',   color: '#10B981', icon: 'check-circle' },
  cancelled:       { label: 'ملغي',         color: '#DC2626', icon: 'x-circle' },
}

const meta = computed(() => {
  if (!props.order) return statusMeta.new
  return statusMeta[props.order.status] || statusMeta.new
})

/* ═══ Timeline steps ═══ */
const flow = ['new', 'sent_to_chef', 'sent_to_driver', 'delivered']
const currentIdx = computed(() =>
  props.order ? flow.indexOf(props.order.status) : 0
)

function stepState(idx: number): 'done' | 'active' | '' {
  if (idx < currentIdx.value) return 'done'
  if (idx === currentIdx.value) return 'active'
  return ''
}

const timelineSteps = [
  { key: 'new',            label: 'استلمنا الطلب',      icon: 'sparkles' },
  { key: 'sent_to_chef',   label: 'جاري التحضير',       icon: 'chef-hat' },
  { key: 'sent_to_driver', label: 'في الطريق',          icon: 'truck' },
  { key: 'delivered',      label: 'تم التوصيل',         icon: 'check-circle' },
]

/* ═══ Helpers ═══ */
function fmtDateFull(s?: string | null) {
  if (!s) return '—'
  const d = new Date(s + 'T00:00:00')
  const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
  return `${days[d.getDay()]}، ${d.getDate()} ${months[d.getMonth()]}`
}

function fmtDateTime(s?: string | null) {
  if (!s) return '—'
  const d = new Date(s)
  return d.toLocaleString('ar-KW', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit'
  })
}

/* ═══ Body lock + Escape ═══ */
watch(() => props.open, (v) => {
  if (!import.meta.client) return
  document.body.style.overflow = v ? 'hidden' : ''
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="open" class="dr-overlay" @click.self="emit('close')">
        <Transition name="drawer-slide" appear>
          <aside v-if="order" class="dr-panel" dir="rtl">
            <!-- ═══ Head ═══ -->
            <header class="dr-head">
              <span class="dr-head__ico" :style="{ background: meta.color + '18', color: meta.color }">
                <Icon :name="meta.icon" :size="20" />
              </span>
              <div class="dr-head__meta">
                <b>#{{ order.id }}</b>
                <span :style="{ color: meta.color }">{{ meta.label }}</span>
              </div>
              <button class="dr-close" @click="emit('close')" aria-label="إغلاق">
                <Icon name="x" :size="18" />
              </button>
            </header>

            <!-- ═══ Body ═══ -->
            <div class="dr-body">

              <!-- ─── Timeline ─── -->
              <section class="dr-section">
                <h3 class="dr-section__title">
                  <Icon name="activity" :size="14" />
                  مراحل الطلب
                </h3>
                <div class="timeline">
                  <div
                    v-for="(step, i) in timelineSteps"
                    :key="step.key"
                    :class="['tl-step', stepState(i)]"
                  >
                    <span class="tl-step__dot">
                      <Icon :name="stepState(i) === 'done' ? 'check' : step.icon" :size="12" />
                    </span>
                    <span class="tl-step__label">{{ step.label }}</span>
                  </div>
                </div>
              </section>

              <!-- ─── Info ─── -->
              <section class="dr-section">
                <h3 class="dr-section__title">
                  <Icon name="user" :size="14" />
                  معلومات العميل
                </h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-item__ico"><Icon name="user" :size="14" /></span>
                    <div>
                      <small>الاسم</small>
                      <b>{{ order.customer_name }}</b>
                    </div>
                  </div>
                  <div class="info-item">
                    <span class="info-item__ico"><Icon name="phone" :size="14" /></span>
                    <div>
                      <small>الجوال</small>
                      <b dir="ltr">{{ order.customer_phone }}</b>
                    </div>
                  </div>
                  <div class="info-item info-item--wide">
                    <span class="info-item__ico"><Icon name="map-pin" :size="14" /></span>
                    <div>
                      <small>العنوان</small>
                      <b>{{ order.area }} — {{ order.street }}</b>
                    </div>
                  </div>
                  <div class="info-item">
                    <span class="info-item__ico"><Icon name="calendar" :size="14" /></span>
                    <div>
                      <small>التسليم</small>
                      <b>{{ fmtDateFull(order.delivery_date) }} · {{ order.slot }}</b>
                    </div>
                  </div>
                  <div class="info-item">
                    <span class="info-item__ico"><Icon name="clock" :size="14" /></span>
                    <div>
                      <small>وقت الطلب</small>
                      <b>{{ fmtDateTime(order.created_at) }}</b>
                    </div>
                  </div>
                </div>
              </section>

              <!-- ─── Items ─── -->
              <section class="dr-section">
                <h3 class="dr-section__title">
                  <Icon name="package" :size="14" />
                  المنتجات ({{ order.items?.length || 0 }})
                </h3>
                <div class="items-list">
                  <div v-for="item in order.items" :key="item.id" class="item-row">
                    <div class="item-row__img">
                      <img :src="item.product_img" :alt="item.product_name" loading="lazy" />
                    </div>
                    <div class="item-row__body">
                      <b>{{ item.product_name }}</b>
                      <span class="item-row__qty">{{ item.qty }} × {{ KD(item.unit_price) }} د.ك</span>
                      <div v-if="item.extras?.length" class="item-row__extras">
                        <span v-for="ex in item.extras" :key="ex.id" class="ex-chip">
                          {{ ex.extra_name }}
                          <template v-if="ex.input_value">: {{ ex.input_value }}</template>
                        </span>
                      </div>
                    </div>
                    <div class="item-row__total">
                      {{ KD(item.line_total) }}
                      <small>د.ك</small>
                    </div>
                  </div>
                  <div v-if="!order.items?.length" class="items-empty">
                    لا توجد منتجات مسجّلة
                  </div>
                </div>
              </section>

              <!-- ─── Notes ─── -->
              <section v-if="order.notes" class="dr-section">
                <h3 class="dr-section__title">
                  <Icon name="message-square" :size="14" />
                  ملاحظات
                </h3>
                <p class="dr-note">{{ order.notes }}</p>
              </section>

              <!-- ─── Notifications (send status) ─── -->
              <section class="dr-section">
                <h3 class="dr-section__title">
                  <Icon name="bell" :size="14" />
                  الإشعارات
                </h3>
                <div class="notify-grid">
                  <div :class="['notify-item', order.chef_sent_at ? 'done' : 'pending']">
                    <span class="notify-item__ico"><Icon name="chef-hat" :size="14" /></span>
                    <div>
                      <small>الشيف</small>
                      <b>{{ order.chef_sent_at ? 'تم الإبلاغ' : 'لم يُبلَّغ بعد' }}</b>
                    </div>
                  </div>
                  <div :class="['notify-item', order.driver_sent_at ? 'done' : 'pending']">
                    <span class="notify-item__ico"><Icon name="truck" :size="14" /></span>
                    <div>
                      <small>المندوب</small>
                      <b>{{ order.driver_sent_at ? 'تم الإبلاغ' : 'لم يُبلَّغ بعد' }}</b>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- ═══ Foot — Total ═══ -->
            <footer class="dr-foot">
              <div class="dr-total">
                <small>الإجمالي</small>
                <div>
                  <b>{{ KD(order.total) }}</b>
                  <span>د.ك</span>
                </div>
              </div>
              <div class="dr-pay">
                <Icon name="credit-card" :size="16" />
                {{ order.payment_method === 'cod' ? 'عند الاستلام' : 'مدفوع مسبقًا' }}
              </div>
            </footer>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ═══ Overlay ═══ */
.dr-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(27,23,20,.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* ═══ Panel ═══ */
.dr-panel {
  position: fixed;
  top: 0;
  inset-inline-end: 0;
  bottom: 0;
  width: 100%;
  max-width: 500px;
  background: #F7F2EC;
  display: flex;
  flex-direction: column;
  box-shadow: -20px 0 60px -20px rgba(0,0,0,.4);
}

/* ═══ Head ═══ */
.dr-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 22px;
  background: #fff;
  border-bottom: 1px solid rgba(27,23,20,.08);
}
.dr-head__ico {
  width: 44px; height: 44px;
  display: grid; place-items: center;
  border-radius: 12px;
  flex-shrink: 0;
}
.dr-head__meta { flex: 1; min-width: 0; }
.dr-head__meta b {
  display: block;
  font-family: monospace;
  font-size: 14px;
  font-weight: 800;
  color: #1B1714;
  margin-bottom: 3px;
}
.dr-head__meta span {
  font-size: 12px;
  font-weight: 800;
}
.dr-close {
  width: 36px; height: 36px;
  display: grid; place-items: center;
  background: #F7F2EC;
  border: 0;
  border-radius: 50%;
  color: #1B1714;
  cursor: pointer;
  transition: all .2s ease;
  flex-shrink: 0;
}
.dr-close:hover {
  background: #6E1F2E;
  color: #fff;
  transform: rotate(90deg);
}

/* ═══ Body ═══ */
.dr-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.dr-section {
  background: #fff;
  border: 1.5px solid rgba(27,23,20,.06);
  border-radius: 16px;
  padding: 16px 18px;
}
.dr-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  color: #4C443B;
  margin: 0 0 14px;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(27,23,20,.08);
}

/* ═══ Timeline ═══ */
.timeline {
  display: flex;
  align-items: center;
}
.tl-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  position: relative;
}
.tl-step__dot {
  width: 30px; height: 30px;
  display: grid; place-items: center;
  border-radius: 50%;
  background: #F7F2EC;
  border: 2px solid rgba(27,23,20,.1);
  color: #7A7065;
  z-index: 2;
  transition: all .3s ease;
}
.tl-step__label {
  font-size: 10.5px;
  font-weight: 700;
  color: #7A7065;
  text-align: center;
  line-height: 1.3;
}
.tl-step.done .tl-step__dot {
  background: #10B981;
  border-color: #10B981;
  color: #fff;
}
.tl-step.done .tl-step__label { color: #10B981; }
.tl-step.active .tl-step__dot {
  background: #6E1F2E;
  border-color: #6E1F2E;
  color: #fff;
  box-shadow: 0 0 0 5px rgba(110,31,46,.12);
}
.tl-step.active .tl-step__label {
  color: #6E1F2E;
  font-weight: 800;
}
.tl-step + .tl-step::before {
  content: "";
  position: absolute;
  top: 15px;
  inset-inline-end: 50%;
  width: 100%;
  height: 2px;
  background: rgba(27,23,20,.1);
  z-index: 1;
}
.tl-step.done + .tl-step::before { background: #10B981; }

/* ═══ Info Grid ═══ */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.info-item--wide { grid-column: 1 / -1; }
.info-item__ico {
  width: 32px; height: 32px;
  display: grid; place-items: center;
  background: rgba(110,31,46,.06);
  color: #6E1F2E;
  border-radius: 9px;
  flex-shrink: 0;
}
.info-item small {
  display: block;
  font-size: 10.5px;
  font-weight: 700;
  color: #7A7065;
  margin-bottom: 2px;
}
.info-item b {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #1B1714;
  line-height: 1.4;
  word-break: break-word;
}

/* ═══ Items ═══ */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item-row {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 12px;
  padding: 12px;
  background: #F7F2EC;
  border-radius: 12px;
  align-items: flex-start;
}
.item-row__img {
  width: 56px; height: 56px;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  flex-shrink: 0;
}
.item-row__img img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.item-row__body { min-width: 0; }
.item-row__body b {
  display: block;
  font-size: 13.5px;
  font-weight: 800;
  color: #1B1714;
  margin-bottom: 4px;
}
.item-row__qty {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  color: #7A7065;
}
.item-row__extras {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}
.ex-chip {
  padding: 3px 8px;
  background: rgba(168,133,91,.12);
  color: #A8855B;
  font-size: 10.5px;
  font-weight: 700;
  border-radius: 6px;
}
.item-row__total {
  font-family: "Playfair Display", serif;
  font-size: 15px;
  font-weight: 700;
  color: #6E1F2E;
  white-space: nowrap;
}
.item-row__total small {
  font-size: 10px;
  color: #A8855B;
  margin-inline-start: 2px;
}
.items-empty {
  padding: 20px;
  text-align: center;
  font-size: 12.5px;
  color: #7A7065;
}

/* ═══ Notes ═══ */
.dr-note {
  margin: 0;
  padding: 12px 14px;
  background: rgba(245,158,11,.08);
  border: 1px solid rgba(245,158,11,.2);
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: #92400E;
}

/* ═══ Notify Grid ═══ */
.notify-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.notify-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
}
.notify-item__ico {
  width: 30px; height: 30px;
  display: grid; place-items: center;
  border-radius: 50%;
  flex-shrink: 0;
}
.notify-item small {
  display: block;
  font-size: 10.5px;
  font-weight: 700;
  color: #7A7065;
  margin-bottom: 2px;
}
.notify-item b {
  display: block;
  font-size: 12.5px;
  font-weight: 800;
}
.notify-item.pending {
  background: #F7F2EC;
  border: 1px dashed rgba(122,112,101,.3);
  color: #7A7065;
}
.notify-item.pending .notify-item__ico {
  background: rgba(122,112,101,.15);
}
.notify-item.done {
  background: rgba(5,150,105,.08);
  border: 1px solid rgba(5,150,105,.25);
  color: #059669;
}
.notify-item.done .notify-item__ico {
  background: #059669;
  color: #fff;
}

/* ═══ Foot ═══ */
.dr-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 22px;
  background: #fff;
  border-top: 1px solid rgba(27,23,20,.08);
  box-shadow: 0 -8px 24px -16px rgba(50,35,20,.3);
}
.dr-total small {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #7A7065;
  margin-bottom: 3px;
}
.dr-total > div {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.dr-total b {
  font-family: "Playfair Display", serif;
  font-size: 24px;
  font-weight: 700;
  color: #6E1F2E;
  line-height: 1;
}
.dr-total span {
  font-size: 13px;
  color: #A8855B;
  font-weight: 700;
}
.dr-pay {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(16,185,129,.1);
  color: #059669;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

/* ═══ Animations ═══ */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity .25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to { opacity: 0; }

.drawer-slide-enter-active {
  transition: transform .35s cubic-bezier(.22,1,.36,1);
}
.drawer-slide-leave-active {
  transition: transform .25s ease;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(-100%);
}

/* ═══ Mobile ═══ */
@media (max-width: 640px) {
  .dr-panel { max-width: 100%; }
  .drawer-slide-enter-from,
  .drawer-slide-leave-to {
    transform: translateY(100%);
  }
  .info-grid { grid-template-columns: 1fr; }
  .notify-grid { grid-template-columns: 1fr; }
}
</style>