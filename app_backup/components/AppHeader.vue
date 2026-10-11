<script setup lang="ts">
import { useCart } from '~/composables/useCart'
import { useFavorites } from '~/composables/useFavorites'

const { count } = useCart()
const { favorites } = useFavorites()

const showDrawer = useState('drawer-open', () => false)
const showSearch = useState('search-open', () => false)

const openMenu = () => { showDrawer.value = true }
const openSearch = () => { showSearch.value = true }
</script>

<template>
  <header class="hdr">
    <div class="wrap hdr-in">
      <button class="icon-btn only-mobile" @click="openMenu" aria-label="القائمة">
        <i data-lucide="menu" />
      </button>

      <NuxtLink to="/" class="brand">
        <span class="brand-mark"><i data-lucide="leaf" /></span>
        <span class="brand-txt">
          <b>FA Fruits</b>
          <i>هدايا فواكه فاخرة</i>
        </span>
      </NuxtLink>

      <nav class="main-nav">
        <NuxtLink to="/">الرئيسية</NuxtLink>
        <NuxtLink to="/occasions">المناسبات</NuxtLink>
        <NuxtLink to="/collections">المجموعات</NuxtLink>
        <NuxtLink to="/gift-finder">هدية مثالية</NuxtLink>
        <NuxtLink to="/track">تتبع الطلب</NuxtLink>
      </nav>

      <div class="hdr-actions">
        <button class="icon-btn" @click="openSearch" aria-label="بحث">
          <i data-lucide="search" />
        </button>
        <NuxtLink to="/favorites" class="icon-btn only-desktop" aria-label="المفضلة">
          <i data-lucide="heart" />
          <span :class="['dot', { show: favorites.length > 0 }]" />
        </NuxtLink>
        <NuxtLink to="/cart" class="icon-btn cart-btn" aria-label="السلة">
          <i data-lucide="shopping-bag" />
          <span :class="['cart-count', { show: count > 0 }]">{{ count }}</span>
        </NuxtLink>
        <NuxtLink to="/orders" class="pill-btn only-desktop">
          <i data-lucide="package" /> طلباتي
        </NuxtLink>
      </div>
    </div>
  </header>
</template>