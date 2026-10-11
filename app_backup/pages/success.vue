<script setup lang="ts">
import { KD } from '~/utils/format'
import { WHATSAPP_NUMBER } from '~/data/seed'

const order = ref<any>(null)
const route = useRoute()

onMounted(() => {
  if (process.client) {
    const orders = JSON.parse(localStorage.getItem('fa_orders') || '[]')
    order.value = orders[orders.length - 1] || null
  }
})

const trackUrl = computed(() => {
  if (!order.value || !process.client) return ''
  return `${window.location.origin}/track/${order.value.id}`
})

const qrUrl = computed(() => {
  if (!trackUrl.value) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackUrl.value)}&bgcolor=FFFFFF&color=24382C&qzone=1`
})

const waUrl = computed(() => {
  if (!order.value) return ''
  const msg = `مرحباً FA Fruits 🍓،\nتم استلام طلبي بنجاح ✅\n\n📋 رقم الطلب: ${order.value.id}\n💰 الإجمالي: ${Number(order.value.total).toFixed(2)} د.ك\n📅 تاريخ التوصيل: ${order.value.deliveryDate || 'حسب الاتفاق'}\n\nشكراً لكم!`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
})

const copyId = () => {
  if (order.value?.id && navigator.clipboard) {
    navigator.clipboard.writeText(order.value.id)
  }
}

const steps = [
  { icon: 'check-circle', t: 'تم تأكيد الطلب', s: 'استلمنا طلبك بنجاح' },
  { icon: 'cherry', t: 'تحضير الفواكه', s: 'نختار الفواكه الطازجة' },
  { icon: 'gift', t: 'تنسيق السلة', s: 'نصمم هديتك بعناية' },
  { icon: 'truck', t: 'مع المندوب', s: 'في الطريق إليك' },
  { icon: 'home', t: 'تم التوصيل', s: 'وصلت الهدية بسلام' }
]
</script>

<template>
  <section v-if="order" class="wrap">
    <div class="success-hero">
      <div class="success-icon"><i data-lucide="check" /></div>
      <h1>شكراً لك</h1>
      <p>طلبك في أيدٍ أمينة. ستبدأ رحلة تحضير هديتك الآن.</p>
      <div class="order-num">رقم الطلب: #{{ order.id }}</div>
    </div>

    <div class="qr-card">
      <div class="qr-card-inner">
        <div class="qr-text">
          <h3>احفظ رقم طلبك</h3>
          <p>امسح الرمز بكاميرا الجوال لفتح صفحة التتبع مباشرة من أي جهاز.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
            <button class="btn btn-ghost" @click="copyId">
              <i data-lucide="copy" /> نسخ رقم الطلب
            </button>
            <a class="btn btn-whatsapp" :href="waUrl" target="_blank">
              <i data-lucide="message-circle" /> أرسل التفاصيل للواتساب
            </a>
          </div>
        </div>
        <div class="qr-code-wrap"><img :src="qrUrl" alt="QR" width="160" height="160" /></div>
      </div>
    </div>

    <div class="timeline">
      <div v-for="(s, i) in steps" :key="i" :class="['tl-item', { done: i === 0, now: i === 1 }]">
        <div class="tl-dot">
          <i v-if="i === 0" data-lucide="check" />
          <i v-else :data-lucide="s.icon" />
        </div>
        <div class="tl-body"><b>{{ s.t }}</b><span>{{ s.s }}</span></div>
      </div>
    </div>

    <div style="text-align:center;padding-bottom:60px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <NuxtLink :to="`/track/${order.id}`" class="btn btn-primary">تتبع الطلب</NuxtLink>
      <NuxtLink to="/orders" class="btn btn-ghost">كل طلباتي</NuxtLink>
      <NuxtLink to="/" class="btn btn-ghost">متابعة التسوق</NuxtLink>
    </div>
  </section>

  <section v-else class="sec">
    <div class="wrap">
      <div class="empty-state">
        <i data-lucide="package" />
        <h3>لا يوجد طلب حديث</h3>
        <NuxtLink to="/" class="btn btn-primary">ابدأ التسوق</NuxtLink>
      </div>
    </div>
  </section>
</template>