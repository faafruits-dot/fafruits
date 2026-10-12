<script setup lang="ts">
/* ═══════════════════════════════════════════════════════════
   AppDatePicker — Heritage Date Picker
   ═══════════════════════════════════════════════════════════ */

const props = withDefaults(defineProps<{
  modelValue: string           // ISO: YYYY-MM-DD
  min?: string                 // ISO
  max?: string                 // ISO
  label?: string
  placeholder?: string
  disabled?: boolean
}>(), {
  label: '',
  placeholder: 'اختر التاريخ',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

/* ═══ State ═══ */
const isOpen = ref(false)
const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth()) // 0-11

/* ═══ Helpers ═══ */
const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]
const AR_DAYS = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'] // الأحد → السبت

const toISO = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const parseISO = (s?: string): Date | null => {
  if (!s) return null
  const d = new Date(s + 'T12:00:00')
  return isNaN(d.getTime()) ? null : d
}

const minDate = computed(() => parseISO(props.min))
const maxDate = computed(() => parseISO(props.max))
const selectedDate = computed(() => parseISO(props.modelValue))

/* ═══ Label للعرض ═══ */
const displayLabel = computed(() => {
  const d = selectedDate.value
  if (!d) return props.placeholder
  return d.toLocaleDateString('ar-KW', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

/* ═══ فتح/غلق ═══ */
const open = () => {
  if (props.disabled) return
  // ابدأ من الشهر المختار أو الحالي
  const base = selectedDate.value || new Date()
  viewYear.value = base.getFullYear()
  viewMonth.value = base.getMonth()
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

/* ═══ التنقل بين الشهور ═══ */
const prevMonth = () => {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

const nextMonth = () => {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

/* ═══ هل نقدر نروح للشهر السابق/التالي؟ ═══ */
const canGoPrev = computed(() => {
  if (!minDate.value) return true
  const firstOfMonth = new Date(viewYear.value, viewMonth.value, 1)
  return firstOfMonth > new Date(minDate.value.getFullYear(), minDate.value.getMonth(), 1)
})

const canGoNext = computed(() => {
  if (!maxDate.value) return true
  const lastOfMonth = new Date(viewYear.value, viewMonth.value + 1, 0)
  return lastOfMonth < new Date(maxDate.value.getFullYear(), maxDate.value.getMonth() + 1, 0)
})

/* ═══ بناء شبكة الأيام ═══ */
interface DayCell {
  date: Date | null
  iso: string
  day: number
  isToday: boolean
  isSelected: boolean
  isDisabled: boolean
  isCurrentMonth: boolean
}

const calendarDays = computed<DayCell[]>(() => {
  const firstOfMonth = new Date(viewYear.value, viewMonth.value, 1)
  const startDay = firstOfMonth.getDay() // 0=Sunday
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const daysInPrevMonth = new Date(viewYear.value, viewMonth.value, 0).getDate()

  const cells: DayCell[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // أيام الشهر السابق (شبكة)
  for (let i = startDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const d = new Date(viewYear.value, viewMonth.value - 1, day)
    cells.push(makeCell(d, today, false))
  }

  // أيام الشهر الحالي
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(viewYear.value, viewMonth.value, day)
    cells.push(makeCell(d, today, true))
  }

  // أيام الشهر التالي (نكمّل لـ 42 خلية)
  const remaining = 42 - cells.length
  for (let day = 1; day <= remaining; day++) {
    const d = new Date(viewYear.value, viewMonth.value + 1, day)
    cells.push(makeCell(d, today, false))
  }

  return cells
})

function makeCell(d: Date, today: Date, isCurrentMonth: boolean): DayCell {
  const iso = toISO(d)
  const dNorm = new Date(d); dNorm.setHours(0, 0, 0, 0)

  let isDisabled = false
  if (minDate.value) {
    const m = new Date(minDate.value); m.setHours(0, 0, 0, 0)
    if (dNorm < m) isDisabled = true
  }
  if (maxDate.value) {
    const m = new Date(maxDate.value); m.setHours(0, 0, 0, 0)
    if (dNorm > m) isDisabled = true
  }

  return {
    date: d,
    iso,
    day: d.getDate(),
    isToday: dNorm.getTime() === today.getTime(),
    isSelected: props.modelValue === iso,
    isDisabled,
    isCurrentMonth,
  }
}

/* ═══ اختيار يوم ═══ */
const pickDay = (cell: DayCell) => {
  if (cell.isDisabled) return
  emit('update:modelValue', cell.iso)
  close()
}

/* ═══ اختيار "اليوم" ═══ */
const pickToday = () => {
  const today = new Date()
  const iso = toISO(today)
  // تأكد إنه في النطاق
  if (minDate.value && today < minDate.value) return
  if (maxDate.value && today > maxDate.value) return
  emit('update:modelValue', iso)
  close()
}

/* ═══ اغلاق عند Escape ═══ */
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="apd">
    <!-- Trigger -->
    <button
      type="button"
      :class="['apd-trigger', { on: !!modelValue, disabled }]"
      :disabled="disabled"
      @click="open"
    >
      <Icon name="calendar" :size="16" class="apd-trigger-icon" />
      <span class="apd-trigger-text">{{ displayLabel }}</span>
      <Icon name="chevron-down" :size="14" class="apd-trigger-arrow" />
    </button>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="apd-fade">
        <div v-if="isOpen" class="apd-overlay" @click.self="close">
          <div class="apd-modal" role="dialog" aria-modal="true">
            <!-- Head -->
            <div class="apd-head">
              <button
                type="button"
                class="apd-nav"
                :disabled="!canGoPrev"
                @click="prevMonth"
                aria-label="الشهر السابق"
              >
                <Icon name="chevron-right" :size="18" />
              </button>

              <div class="apd-month">
                <b>{{ AR_MONTHS[viewMonth] }}</b>
                <span>{{ viewYear }}</span>
              </div>

              <button
                type="button"
                class="apd-nav"
                :disabled="!canGoNext"
                @click="nextMonth"
                aria-label="الشهر التالي"
              >
                <Icon name="chevron-left" :size="18" />
              </button>
            </div>

            <!-- Days header -->
            <div class="apd-week">
              <span v-for="d in AR_DAYS" :key="d">{{ d }}</span>
            </div>

            <!-- Days grid -->
            <div class="apd-grid">
              <button
                v-for="(cell, i) in calendarDays"
                :key="i"
                type="button"
                :class="[
                  'apd-day',
                  {
                    'is-out': !cell.isCurrentMonth,
                    'is-today': cell.isToday,
                    'is-selected': cell.isSelected,
                    'is-disabled': cell.isDisabled,
                  },
                ]"
                :disabled="cell.isDisabled"
                @click="pickDay(cell)"
              >
                {{ cell.day }}
              </button>
            </div>

            <!-- Footer -->
            <div class="apd-foot">
              <button
                type="button"
                class="apd-btn apd-btn-ghost"
                @click="close"
              >
                إلغاء
              </button>
              <button
                type="button"
                class="apd-btn apd-btn-gold"
                @click="pickToday"
              >
                <Icon name="calendar-check" :size="14" />
                اليوم
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   TRIGGER
   ═══════════════════════════════════════════════════════════ */
.apd {
  position: relative;
  width: 100%;
}

.apd-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border: 1.5px solid var(--line, rgba(27,23,20,.10));
  border-radius: 14px;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--muted, #7A7065);
  cursor: pointer;
  text-align: start;
  transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

.apd-trigger:hover:not(.disabled) {
  border-color: var(--gold, #A8855B);
  background: #fff8ee;
}

.apd-trigger.on {
  color: var(--green-900, #1B1714);
  border-color: var(--gold, #A8855B);
  background: linear-gradient(135deg, #fffcf5, #fff8ee);
}

.apd-trigger.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apd-trigger-icon {
  color: var(--gold, #A8855B);
  flex-shrink: 0;
}

.apd-trigger-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.apd-trigger-arrow {
  color: var(--muted, #7A7065);
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.apd-trigger.on .apd-trigger-arrow {
  color: var(--gold, #A8855B);
}

/* ═══════════════════════════════════════════════════════════
   OVERLAY + MODAL
   ═══════════════════════════════════════════════════════════ */
.apd-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(27, 23, 20, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 20px;
}

.apd-modal {
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 32px 64px -16px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(168, 133, 91, 0.15);
  animation: apdSlide 0.32s cubic-bezier(0.34, 1.4, 0.64, 1);
}

@keyframes apdSlide {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ═══ Head ═══ */
.apd-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #fffcf5 0%, #fff8ee 100%);
  border-bottom: 1.5px solid rgba(245, 154, 35, 0.15);
}

.apd-nav {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  background: #fff;
  border: 1.5px solid var(--line, rgba(27,23,20,.10));
  border-radius: 12px;
  color: var(--green-900, #1B1714);
  cursor: pointer;
  transition: all 0.18s ease;
  flex-shrink: 0;
}

.apd-nav:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--gold, #A8855B), var(--mango, #C9A87C));
  border-color: transparent;
  color: #fff;
  transform: scale(1.05);
}

.apd-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.apd-month {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.apd-month b {
  font-family: 'Playfair Display', 'Almarai', serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--green-900, #1B1714);
  letter-spacing: 0.02em;
}

.apd-month span {
  font-family: 'Playfair Display', serif;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--gold, #A8855B);
  letter-spacing: 0.15em;
}

/* ═══ Week Header ═══ */
.apd-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 14px 16px 8px;
  gap: 4px;
}

.apd-week span {
  text-align: center;
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--muted, #7A7065);
  letter-spacing: 0.05em;
}

/* ═══ Days Grid ═══ */
.apd-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  padding: 0 16px 16px;
}

.apd-day {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  background: transparent;
  border: 1.5px solid transparent;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--green-900, #1B1714);
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.apd-day:hover:not(.is-disabled):not(.is-selected) {
  background: #fff8ee;
  border-color: var(--gold, #A8855B);
  transform: scale(1.08);
}

.apd-day.is-out {
  color: rgba(27, 23, 20, 0.25);
}

.apd-day.is-today:not(.is-selected) {
  border-color: var(--gold, #A8855B);
  color: var(--gold, #A8855B);
  font-weight: 900;
}

.apd-day.is-today::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--gold, #A8855B);
}

.apd-day.is-selected {
  background: linear-gradient(135deg, var(--burgundy, #6E1F2E), var(--burgundy-dk, #551621));
  color: #FBEFE0;
  border-color: transparent;
  box-shadow:
    0 6px 14px -4px rgba(110, 31, 46, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: scale(1.02);
}

.apd-day.is-selected::after {
  background: #FBEFE0;
}

.apd-day.is-disabled {
  color: rgba(27, 23, 20, 0.15);
  cursor: not-allowed;
  text-decoration: line-through;
  text-decoration-color: rgba(27, 23, 20, 0.15);
}

/* ═══ Footer ═══ */
.apd-foot {
  display: flex;
  gap: 8px;
  padding: 14px 20px 18px;
  border-top: 1.5px solid rgba(245, 154, 35, 0.12);
  background: #fffcf5;
}

.apd-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1.5px solid transparent;
}

.apd-btn-ghost {
  background: #fff;
  color: var(--green-900, #1B1714);
  border-color: var(--line, rgba(27,23,20,.10));
}

.apd-btn-ghost:hover {
  border-color: var(--gold, #A8855B);
  background: #fff8ee;
}

.apd-btn-gold {
  background: linear-gradient(135deg, var(--gold, #A8855B), var(--mango, #C9A87C));
  color: #fff;
  box-shadow: 0 6px 14px -6px rgba(168, 133, 91, 0.6);
}

.apd-btn-gold:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
  box-shadow: 0 8px 18px -6px rgba(168, 133, 91, 0.7);
}

/* ═══ Transition ═══ */
.apd-fade-enter-active,
.apd-fade-leave-active {
  transition: opacity 0.22s ease;
}
.apd-fade-enter-from,
.apd-fade-leave-to {
  opacity: 0;
}

/* ═══ Mobile — Bottom Sheet ═══ */
@media (max-width: 560px) {
  .apd-overlay {
    align-items: end;
    padding: 0;
  }

  .apd-modal {
    max-width: 100%;
    border-radius: 24px 24px 0 0;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  @keyframes apdSlide {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .apd-day {
    font-size: 0.9rem;
  }
}

/* ═══ Reduced Motion ═══ */
@media (prefers-reduced-motion: reduce) {
  .apd-modal,
  .apd-day,
  .apd-btn {
    animation: none !important;
    transition: none !important;
  }
}
</style>