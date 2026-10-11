<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'
import { productTitle } from '~/utils/product'
import { KD, cleanPhone } from '~/utils/format'

const route = useRoute()
const router = useRouter()
const { products } = useProducts()

const currentPhone = computed(() => cleanPhone(route.params.phone as string))
const orders = ref<any[]>([])

onMounted(() => {
  if (process.client) {
    const all = JSON.parse(localStorage.getItem('fa_orders') || '[]')
    orders.value = all.filter((o: any) => cleanPhone(o.phone) === currentPhone.value)
  }
})

const displayTitle = (item: any) => {
  if (item.title) return item.title
  const p = products.value.find(x => x.id === item.id || item.id?.startsWith(x.id))
  return p ? productTitle(p) : 'هدية فواكه'
}

const changePhone = () => {
  if (process.client) localStorage.removeItem('fa_user_phone')
  router.push('/orders')
}
</script>

<template>
  <section class="page-head" style="padding-bottom:10px">
    <div class="wrap">
      <div class="crumbs"><NuxtLink to="/">الرئيسية</NuxtLink> / طلباتي</div>
      <h1>طلباتي</h1>
      <p v-if="orders.length">لديك <strong>{{ orders.length }}</strong> طلب مسجّل برقمك.</p>
    </div>
  </section>

  <section class="wrap" style="padding-bottom:80px">
    <div v-if="!orders.length" class="empty-state">
      <i data-lucide="package-search" />
      <h3>لا توجد طلبات لهذا الرقم</h3>
      <p>الرقم: <strong>{{ currentPhone }}</strong></p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px">
        <NuxtLink to="/occasions" class="btn btn-primary">ابدأ التسوق</NuxtLink>
        <button class="btn btn-ghost" @click="changePhone">تغيير الرقم</button>
      </div>
    </div>

    <template v-else>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;gap:12px;flex-wrap:wrap">
        <span style="font-size:.88rem;color:var(--muted)">
          <i data-lucide="phone" style="width:14px;height:14px;vertical-align:middle" /> {{ currentPhone }}
        </span>
        <button class="btn btn-ghost" style="padding:8px 14px;font-size:.82rem" @click="changePhone">
          <i data-lucide="log-out" /> تغيير الرقم
        </button>
      </div>

      <div v-for="o in orders.slice().reverse()" :key="o.id" class="order-history-card">
        <div class="ohc-header">
          <div class="ohc-num">
            <span class="ohc-label">رقم الطلب</span>
            <b>#{{ o.id }}</b>
          </div>
          <div class="ohc-status"><span class="order-status preparing">قيد التحضير</span></div>
        </div>
        <div class="ohc-meta">
          <div><i data-lucide="calendar" /> {{ o.date || '—' }}</div>
          <div><i data-lucide="shopping-bag" /> {{ o.itemsCount || 0 }} منتج</div>
          <div><i data-lucide="wallet" /> {{ KD(o.total) }}</div>
        </div>
        <div v-if="o.items?.[0]" class="ohc-items-preview">
          <img :src="o.items[0].img" alt="" />
          <div style="flex:1"><b style="font-size:.9rem;display:block">{{ displayTitle(o.items[0]) }}</b></div>
        </div>
        <div class="ohc-actions">
          <NuxtLink :to="`/track/${o.id}`" class="btn btn-primary">
            <i data-lucide="map-pin" /> تتبع
          </NuxtLink>
        </div>
      </div>
    </template>
  </section>
</template>