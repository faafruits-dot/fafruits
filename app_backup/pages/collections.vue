<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'

const { products } = useProducts()
const route = useRoute()

const filter = ref((route.query.filter as string) || 'all')

const list = computed(() => {
  switch (filter.value) {
    case 'ready': return products.value.filter(p => p.ready)
    case 'luxury': return products.value.filter(p => p.luxury)
    case 'best': return products.value.filter(p => p.best)
    case 'offers': return products.value.filter(p => p.price < 25)
    default: return products.value
  }
})
</script>

<template>
  <section class="page-head">
    <div class="wrap">
      <div class="crumbs"><NuxtLink to="/">الرئيسية</NuxtLink> / المجموعات</div>
      <h1>المجموعات</h1>
    </div>
  </section>

  <section class="sec" style="padding-top:10px">
    <div class="wrap">
      <div class="filter-row">
        <button :class="['pill', { on: filter === 'all' }]" @click="filter = 'all'">الكل</button>
        <button :class="['pill', { on: filter === 'ready' }]" @click="filter = 'ready'">
          <i data-lucide="truck" /> جاهز اليوم
        </button>
        <button :class="['pill', { on: filter === 'luxury' }]" @click="filter = 'luxury'">
          <i data-lucide="sparkles" /> فاخر
        </button>
        <button :class="['pill', { on: filter === 'best' }]" @click="filter = 'best'">
          <i data-lucide="star" /> الأكثر مبيعًا
        </button>
        <button :class="['pill', { on: filter === 'offers' }]" @click="filter = 'offers'">
          <i data-lucide="tag" /> عروض
        </button>
      </div>

      <div class="prod-grid">
        <ProductCard v-for="p in list" :key="p.id" :product="p" />
      </div>
    </div>
  </section>
</template>