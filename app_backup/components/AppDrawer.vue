<script setup lang="ts">
const showDrawer = useState('drawer-open', () => false)
const closeMenu = () => { showDrawer.value = false }
</script>

<template>
  <div :class="['drawer', { open: showDrawer }]" @click.self="closeMenu">
    <div class="drawer-panel">
      <div class="drawer-head">
        <span class="brand-txt"><b>FA Fruits</b><i>هدايا فواكه فاخرة</i></span>
        <button class="icon-btn" @click="closeMenu"><i data-lucide="x" /></button>
      </div>
      <nav class="drawer-nav" @click="closeMenu">
        <NuxtLink to="/"><i data-lucide="home" /> الرئيسية</NuxtLink>
        <NuxtLink to="/occasions"><i data-lucide="cake" /> المناسبات</NuxtLink>
        <NuxtLink to="/collections"><i data-lucide="sparkles" /> المجموعات</NuxtLink>
        <NuxtLink to="/gift-finder"><i data-lucide="sparkles" /> هدية مثالية</NuxtLink>
        <NuxtLink to="/orders"><i data-lucide="package" /> طلباتي</NuxtLink>
        <NuxtLink to="/favorites"><i data-lucide="heart" /> المفضلة</NuxtLink>
        <NuxtLink to="/track"><i data-lucide="truck" /> تتبع الطلب</NuxtLink>
        <NuxtLink to="/policy/delivery"><i data-lucide="truck" /> سياسة التوصيل</NuxtLink>
        <NuxtLink to="/policy/returns"><i data-lucide="shield-check" /> الاستبدال والإرجاع</NuxtLink>
        <NuxtLink to="/dashboard"><i data-lucide="layout-dashboard" /> لوحة التشغيل</NuxtLink>
      </nav>
    </div>
  </div>
</template>