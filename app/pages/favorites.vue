<script setup lang="ts">
import { useFavorites } from '~/composables/useFavorites'
import { useProducts } from '~/composables/useProducts'

const { favorites } = useFavorites()
const { products } = useProducts()

const favProducts = computed(() => products.value.filter(p => favorites.value.includes(p.id)))
</script>

<template>
  <section class="page-head" style="padding-bottom:10px">
    <div class="wrap">
      <div class="crumbs"><NuxtLink to="/">الرئيسية</NuxtLink> / المفضلة</div>
      <h1>المفضلة</h1>
      <p v-if="favProducts.length">{{ favProducts.length }} منتج محفوظ ❤️</p>
    </div>
  </section>

  <section class="wrap" style="padding-bottom:80px">
    <div v-if="!favProducts.length" class="empty-state">
      <Icon name="heart" />
      <h3>لا يوجد شيء في المفضلة</h3>
      <NuxtLink to="/occasions" class="btn btn-primary" style="margin-top:16px">تصفّح</NuxtLink>
    </div>

    <div v-else class="prod-grid">
      <ProductCard v-for="p in favProducts" :key="p.id" :product="p" />
    </div>
  </section>
</template>