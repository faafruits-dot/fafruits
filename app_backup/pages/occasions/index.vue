<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'
import { OCCASIONS } from '~/data/seed'

const { products } = useProducts()
const active = ref('all')

const list = computed(() => {
  if (active.value === 'all') return products.value
  const o = OCCASIONS.find(x => x.id === active.value)
  if (!o) return products.value
  return products.value.filter(p => p.occ.some(x => x.includes(o.filter) || o.filter.includes(x)))
})
</script>

<template>
  <section class="page-head">
    <div class="wrap">
      <div class="crumbs"><NuxtLink to="/">الرئيسية</NuxtLink> / المناسبات</div>
      <h1>اختر المناسبة</h1>
      <p>جمعنا لك الهدايا حسب اللحظة.</p>
    </div>
  </section>

  <section class="sec" style="padding-top:10px">
    <div class="wrap">
      <div class="filter-row">
        <button :class="['pill', { on: active === 'all' }]" @click="active = 'all'">الكل</button>
        <button v-for="o in OCCASIONS" :key="o.id" :class="['pill', { on: active === o.id }]" @click="active = o.id">
          <i :data-lucide="o.icon" /> {{ o.name }}
        </button>
      </div>

      <div class="prod-grid">
        <ProductCard v-for="p in list" :key="p.id" :product="p" />
      </div>
    </div>
  </section>
</template>