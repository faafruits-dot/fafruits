<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'
import { OCCASIONS } from '~/data/seed'

const route = useRoute()
const { products } = useProducts()

const occasion = computed(() => OCCASIONS.find(x => x.id === route.params.id))

const list = computed(() => {
  const o = occasion.value
  if (!o) return []
  return products.value.filter(p => p.occ.some(x => x.includes(o.filter) || o.filter.includes(x)))
})
</script>

<template>
  <section class="page-head">
    <div class="wrap">
      <div class="crumbs"><NuxtLink to="/">الرئيسية</NuxtLink> / <NuxtLink to="/occasions">المناسبات</NuxtLink></div>
      <h1>{{ occasion?.name || 'المناسبة' }}</h1>
      <p>{{ list.length }} هدية مناسبة</p>
    </div>
  </section>

  <section class="sec" style="padding-top:10px">
    <div class="wrap">
      <div class="prod-grid">
        <ProductCard v-for="p in list" :key="p.id" :product="p" />
      </div>
    </div>
  </section>
</template>