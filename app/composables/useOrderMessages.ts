// composables/useOrderMessages.ts
import type { DashOrder } from './useDashboardOrders'

/* ═══ أرقام عربية ═══ */
const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩']
function toAr(n: number | string): string {
  return String(n).replace(/\d/g, d => AR_DIGITS[+d])
}

const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const AR_DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']

function parseDate(s: string) { return new Date(s + 'T00:00:00') }

function fmtDateFull(s: string) {
  if (!s) return '—'
  const d = parseDate(s)
  return `${AR_DAYS[d.getDay()]}، ${toAr(d.getDate())} ${AR_MONTHS[d.getMonth()]}`
}

function fmtDateRelative(s: string) {
  if (!s) return '—'
  const today = new Date(); today.setHours(0,0,0,0)
  const target = parseDate(s)
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'اليوم'
  if (diff === 1) return 'غدًا'
  if (diff === -1) return 'أمس'
  if (diff < 0) return `متأخر ${toAr(Math.abs(diff))} ${Math.abs(diff) === 1 ? 'يوم' : 'أيام'}`
  return fmtDateFull(s)
}

function fmtOrderTime(createdAt: string) {
  if (!createdAt) return ''
  const d = new Date(createdAt)
  let h = d.getHours()
  const m = d.getMinutes()
  const period = h >= 12 ? 'م' : 'ص'
  h = h % 12 || 12
  return `${toAr(h)}:${toAr(m.toString().padStart(2, '0'))} ${period}`
}

function fullImgUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const config = useRuntimeConfig()
  const base = (config.public.siteUrl as string) || 'https://fafruits.vercel.app'
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

function buildWaUrl(phone: string, message: string) {
  const clean = phone.replace(/\D/g, '').replace(/^0+/, '')
  const full = clean.startsWith('965') ? clean : `965${clean}`
  return `https://wa.me/${full}?text=${encodeURIComponent(message)}`
}

/* ═══ الإضافات ═══ */
function fmtExtrasBlock(extras: any[]): { additions: string[]; message: string | null } {
  const additions: string[] = []
  let message: string | null = null

  for (const ex of extras || []) {
    if (ex.extra_id === 'message' && ex.input_value) {
      message = ex.input_value
      continue
    }
    const price = ex.price > 0 ? ` (+${toAr(ex.price.toFixed(0))} د.ك)` : ''
    additions.push(`  • ${ex.extra_name}${price}`)
  }

  return { additions, message }
}

/* ═══════════════════════════════════════════════════════════
   Composable
   ═══════════════════════════════════════════════════════════ */
export const useOrderMessages = () => {

  /* ═══ 🧑‍🍳 رسالة الشيف ═══ */
  function buildChefMessage(order: DashOrder): string {
    const lines: string[] = []

    lines.push(`🧑‍🍳 *طلب جديد — #${order.id}*`)
    lines.push('━━━━━━━━━━━━━━━━━━━━')
    lines.push(`⏰ *وقت الطلب:* ${fmtOrderTime(order.created_at)}`)
    lines.push(`📅 *التسليم:* ${fmtDateRelative(order.delivery_date)} — ${order.slot}`)
    lines.push('━━━━━━━━━━━━━━━━━━━━')
    lines.push('')
    lines.push('📦 *المنتجات المطلوبة:*')
    lines.push('')

    order.items?.forEach((item, idx) => {
      lines.push(`*${toAr(idx + 1)}. ${item.product_name}* × ${toAr(item.qty)}`)
      lines.push(`🖼️ الصورة:`)
      lines.push(fullImgUrl(item.product_img))

      const { additions, message } = fmtExtrasBlock(item.extras)
      if (additions.length) {
        lines.push('')
        lines.push(`  ➕ *الإضافات:*`)
        additions.forEach(l => lines.push(l))
      }
      if (message) {
        lines.push('')
        lines.push(`  ✍️ *العبارة المحفورة:* «${message}»`)
      }
      if (idx < order.items.length - 1) lines.push('')
    })

    if (order.notes) {
      lines.push('')
      lines.push(`📝 *ملاحظات:* ${order.notes}`)
    }

    lines.push('')
    lines.push('━━━━━━━━━━━━━━━━━━━━')
    lines.push('✅ *جاهز للتحضير*')

    return lines.join('\n')
  }

  /* ═══ 🚚 رسالة المندوب ═══ */
  function buildDriverMessage(order: DashOrder): string {
    const lines: string[] = []

    lines.push(`🚚 *طلب للتوصيل — #${order.id}*`)
    lines.push('━━━━━━━━━━━━━━━━━━━━')
    lines.push(`👤 *العميل:* ${order.customer_name}`)
    lines.push(`📱 *الجوال:* ${order.customer_phone}`)
    lines.push('━━━━━━━━━━━━━━━━━━━━')
    lines.push('')
    lines.push('📍 *العنوان:*')
    lines.push(`${order.area} — ${order.street}`)
    lines.push('')
    lines.push(`📅 *التاريخ:* ${fmtDateRelative(order.delivery_date)}`)
    lines.push(`⏰ *الوقت:* ${order.slot}`)
    lines.push('')
    lines.push('━━━━━━━━━━━━━━━━━━━━')
    lines.push(`📦 *عدد المنتجات:* ${toAr(order.items?.length || 0)}`)
    lines.push('💳 *الدفع:* مدفوع مسبقًا')
    lines.push('━━━━━━━━━━━━━━━━━━━━')
    lines.push('✅ *جاهز للاستلام والتوصيل*')

    return lines.join('\n')
  }

  /* ═══ روابط ═══ */
  function getChefUrl(order: DashOrder, chefPhone: string) {
    return buildWaUrl(chefPhone, buildChefMessage(order))
  }
  function getDriverUrl(order: DashOrder, driverPhone: string) {
    return buildWaUrl(driverPhone, buildDriverMessage(order))
  }

  function openWhatsApp(url: string) {
    if (import.meta.client) window.open(url, '_blank')
  }

  return {
    buildChefMessage,
    buildDriverMessage,
    getChefUrl,
    getDriverUrl,
    openWhatsApp,
    fullImgUrl,
    fmtDateFull,
    fmtDateRelative,
    fmtOrderTime,
    toAr,
  }
}