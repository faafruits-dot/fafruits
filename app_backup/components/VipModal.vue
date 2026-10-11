<script setup lang="ts">
import { WHATSAPP_NUMBER } from '~/data/seed'

const isOpen = useState('vip-modal-open', () => false)
const vipData = useState<any>('vip-modal-data', () => null)

const close = () => {
  isOpen.value = false
  vipData.value = null
}

const waUrl = computed(() => {
  if (!vipData.value) return '#'
  const d = vipData.value
  const msg = `مرحباً FA Fruits 🍓،\nأريد طلب خدمة اليوم (VIP):\n\n🍰 المنتج: ${d.name}\n➕ الإضافات: ${d.extrasText || 'بدون إضافات'}\n💰 السعر: ${d.price} د.ك\n📝 رسالة البطاقة: "${d.giftMsg || 'بدون'}"\n👤 إلى: ${d.giftName || 'غير محدد'}\n\nالرجاء تأكيد التوفر.`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
})
</script>

<template>
  <div :class="['vip-modal-overlay', { open: isOpen }]" @click.self="close">
    <div class="vip-modal">
      <div class="vip-modal-header">
        <span class="vip-badge">خدمة VIP</span>
        <div class="vip-icon"><i data-lucide="sparkles" /></div>
        <h2>طلبك لليوم؟</h2>
        <p>لأن كيكنا يُصنع يدوياً طازجاً، طلبات نفس اليوم تحتاج تنسيقاً خاصاً مع فريقنا للتأكد من توفر المكونات والمندوب.</p>
      </div>
      <div class="vip-modal-actions">
        <a :href="waUrl" target="_blank" class="btn btn-whatsapp btn-block">
          <i data-lucide="message-circle" /> تحدث معنا الآن عبر واتساب
        </a>
        <button class="btn btn-ghost btn-block" @click="close">اختيار تاريخ آخر</button>
      </div>
    </div>
  </div>
</template>