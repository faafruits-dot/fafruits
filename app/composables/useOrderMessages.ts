// app/composables/useOrderMessages.ts
import { KD } from '~/utils/format'
import type { DashOrder } from '~/composables/useDashboardOrders'

export function useOrderMessages() {
  const origin = import.meta.client ? window.location.origin : ''

  /* ═══ بناء رسالة الشيف ═══ */
  function buildChefMessage(order: DashOrder): string {
    const itemsText = (order.items || [])
      .map((item, idx) => {
        const imgUrl = item.product_img
          ? (item.product_img.startsWith('http') ? item.product_img : `${origin}${item.product_img}`)
          : ''
        return `${idx + 1}. ${item.title || 'منتج'} (×${item.qty || 1})${imgUrl ? `\n🖼️ الصورة: ${imgUrl}` : ''}`
      })
      .join('\n')

    return [
      `👨‍🍳 *طلب تحضير جديد — #${order.id}*`,
      `📅 التسليم: ${order.delivery_date} — ${order.slot}`,
      ``,
      `🍓 *المنتجات:*`,
      itemsText,
      order.notes ? `\n📝 ملاحظات: ${order.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  /* ═══ بناء رسالة المندوب (مع صورة المنتج) ═══ */
  function buildDriverMessage(order: DashOrder): string {
    const itemsWithImages = (order.items || [])
      .map((item, idx) => {
        const imgUrl = item.product_img
          ? (item.product_img.startsWith('http') ? item.product_img : `${origin}${item.product_img}`)
          : ''
        return [
          `${idx + 1}. ${item.title || 'هدية فواكه'} (×${item.qty || 1})`,
          imgUrl ? `🖼️ صورة المنتج: ${imgUrl}` : '',
        ]
          .filter(Boolean)
          .join('\n')
      })
      .join('\n\n')

    return [
      `🚚 *طلب توصيل جديد — #${order.id}*`,
      ``,
      `👤 العميل: ${order.customer_name}`,
      `📞 الجوال: ${order.customer_phone}`,
      `📍 العنوان: ${order.area} · ${order.street}`,
      `📅 الموعد: ${order.delivery_date} — ${order.slot}`,
      `💰 المبلغ: ${KD(order.total)}`,
      ``,
      `📦 *تفاصيل وصور الطلب:*`,
      itemsWithImages,
      order.notes ? `\n📝 ملاحظات التوصيل: ${order.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  function getChefUrl(order: DashOrder, phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '')
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(buildChefMessage(order))}`
  }

  function getDriverUrl(order: DashOrder, phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '')
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(buildDriverMessage(order))}`
  }

  return {
    buildChefMessage,
    buildDriverMessage,
    getChefUrl,
    getDriverUrl,
  }
}