<script setup lang="ts">
const route = useRoute()

const orderId = computed(() => {
  // من query param أو من localStorage
  const fromQuery = route.query.order as string
  if (fromQuery) return fromQuery
  if (import.meta.client) {
    return localStorage.getItem('fa_last_order') || ''
  }
  return ''
})

onMounted(() => {
  // امسح بعد العرض
  if (import.meta.client && orderId.value) {
    localStorage.removeItem('fa_last_order')
  }
})
</script>

<template>
  <section class="sec">
    <div class="wrap" style="text-align:center;padding:60px 0">
      <div style="width:100px;height:100px;margin:0 auto 24px;display:grid;place-items:center;background:linear-gradient(135deg,#10b981,#34d399);border-radius:50%;box-shadow:0 12px 32px rgba(16,185,129,.3)">
        <Icon name="check" :size="48" :stroke-width="3" style="color:#fff" />
      </div>

      <h1 style="font-family:var(--ff-display);font-size:2rem;color:var(--green-900);margin:0 0 12px">
        شكراً لك! 🎉
      </h1>
      <p style="color:var(--muted);font-size:1rem;margin:0 0 32px">
        تم استلام طلبك وسيبدأ التحضير فورًا
      </p>

      <div v-if="orderId" style="display:inline-block;padding:16px 32px;background:var(--cream);border:2px dashed var(--gold);border-radius:16px;margin-bottom:32px">
        <div style="font-size:.85rem;color:var(--muted);margin-bottom:4px">رقم الطلب</div>
        <div style="font-family:var(--ff-display);font-size:1.8rem;color:var(--green-900);font-weight:700">
          #{{ orderId }}
        </div>
      </div>

      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <NuxtLink :to="`/track/${orderId}`" class="btn btn-primary btn-lg">
          <Icon name="map-pin" :size="18" />
          تتبع الطلب
        </NuxtLink>
        <NuxtLink to="/" class="btn btn-ghost btn-lg">
          <Icon name="home" :size="18" />
          الرئيسية
        </NuxtLink>
      </div>
    </div>
  </section>
</template>