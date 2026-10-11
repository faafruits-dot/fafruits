<script setup lang="ts">
const route = useRoute()
const isActive = (path: string) => route.path === path
</script>

<template>
  <nav class="bottom-nav">
    <NuxtLink to="/" :class="{ active: isActive('/') }">
      <i data-lucide="home" /><span>الرئيسية</span>
    </NuxtLink>
    <NuxtLink to="/occasions" :class="{ active: isActive('/occasions') }">
      <i data-lucide="cake" /><span>المناسبات</span>
    </NuxtLink>
    <NuxtLink to="/gift-finder" :class="['bn-center', { active: isActive('/gift-finder') }]">
      <span class="bn-fab"><i data-lucide="sparkles" /></span>
      <span>هدية مثالية</span>
    </NuxtLink>
    <NuxtLink to="/favorites" :class="{ active: isActive('/favorites') }">
      <i data-lucide="heart" /><span>المفضلة</span>
    </NuxtLink>
    <NuxtLink to="/orders" :class="{ active: isActive('/orders') }">
      <i data-lucide="package" /><span>طلباتي</span>
    </NuxtLink>
  </nav>
</template>