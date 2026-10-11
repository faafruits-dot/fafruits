// utils/format.ts

/* ═══════════════════════════════════════════
   الدينار الكويتي
   ═══════════════════════════════════════════ */
export function KD(value: number | string | null | undefined): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0.00 د.ك'
  return `${n.toFixed(2)} د.ك`
}

/* ═══════════════════════════════════════════
   تنظيف رقم الهاتف
   ═══════════════════════════════════════════ */
export function cleanPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  return String(phone).replace(/\D/g, '')
}

/* ═══════════════════════════════════════════
   "منذ X" — محصّنة ضد NaN
   ═══════════════════════════════════════════ */
export function timeAgo(input: string | number | Date | null | undefined): string {
  if (!input) return '—'

  let ms: number
  if (typeof input === 'number') {
    ms = input
  } else if (input instanceof Date) {
    ms = input.getTime()
  } else {
    ms = new Date(input).getTime()
  }

  if (!Number.isFinite(ms)) return '—'

  const diff = Date.now() - ms
  if (diff < 0) return 'الآن'

  const sec  = Math.floor(diff / 1000)
  const min  = Math.floor(sec / 60)
  const hour = Math.floor(min / 60)
  const day  = Math.floor(hour / 24)

  if (sec < 60)   return 'الآن'
  if (min < 60)   return `منذ ${min} دقيقة`
  if (hour < 24)  return `منذ ${hour} ساعة`
  if (day  < 30)  return `منذ ${day} يوم`
  if (day  < 365) return `منذ ${Math.floor(day / 30)} شهر`
  return `منذ ${Math.floor(day / 365)} سنة`
}

/* ═══════════════════════════════════════════
   تنسيق التاريخ بالعربي
   ═══════════════════════════════════════════ */
export function formatDate(input: string | number | Date | null | undefined): string {
  if (!input) return '—'
  try {
    const d = input instanceof Date ? input : new Date(input)
    if (!Number.isFinite(d.getTime())) return '—'
    return d.toLocaleDateString('ar-KW', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  } catch {
    return '—'
  }
}

/* ═══════════════════════════════════════════
   تنسيق التاريخ القصير (10 أكتوبر)
   ═══════════════════════════════════════════ */
export function formatDateShort(input: string | number | Date | null | undefined): string {
  if (!input) return '—'
  try {
    const d = input instanceof Date ? input : new Date(input)
    if (!Number.isFinite(d.getTime())) return '—'
    return d.toLocaleDateString('ar-KW', { day: 'numeric', month: 'short' })
  } catch {
    return '—'
  }
}

/* ═══════════════════════════════════════════
   تنسيق الوقت (3:45 م)
   ═══════════════════════════════════════════ */
export function formatTime(input: string | number | Date | null | undefined): string {
  if (!input) return '—'
  try {
    const d = input instanceof Date ? input : new Date(input)
    if (!Number.isFinite(d.getTime())) return '—'
    return d.toLocaleTimeString('ar-KW', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '—'
  }
}