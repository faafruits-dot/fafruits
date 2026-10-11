<script setup lang="ts">
const showDrawer = useState('drawer-open', () => false)
const closeMenu = () => { showDrawer.value = false }
</script>

<template>
  <div :class="['drawer', { open: showDrawer }]" @click.self="closeMenu">
    <div class="drawer-panel">
      <div class="drawer-head">
        <span class="brand-txt"><b>FA Fruits</b><i>هدايا فواكه فاخرة</i></span>
        <button class="icon-btn" @click="closeMenu"><Icon name="x" /></button>
      </div>
      <nav class="drawer-nav" @click="closeMenu">
        <NuxtLink to="/"><Icon name="home" /> الرئيسية</NuxtLink>
        <NuxtLink to="/occasions"><Icon name="cake" /> المناسبات</NuxtLink>
        <NuxtLink to="/collections"><Icon name="sparkles" /> المجموعات</NuxtLink>
        <NuxtLink to="/gift-finder"><Icon name="sparkles" /> هدية مثالية</NuxtLink>
        <NuxtLink to="/orders"><Icon name="package" /> طلباتي</NuxtLink>
        <NuxtLink to="/favorites"><Icon name="heart" /> المفضلة</NuxtLink>
        <NuxtLink to="/track"><Icon name="truck" /> تتبع الطلب</NuxtLink>
        <NuxtLink to="/policy/delivery"><Icon name="truck" /> سياسة التوصيل</NuxtLink>
        <NuxtLink to="/policy/returns"><Icon name="shield-check" /> الاستبدال والإرجاع</NuxtLink>
        <NuxtLink to="/dashboard"><Icon name="layout-dashboard" /> لوحة التشغيل</NuxtLink>
      </nav>
    </div>
  </div>
</template>