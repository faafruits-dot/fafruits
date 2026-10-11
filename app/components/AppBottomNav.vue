<script setup lang="ts">
const route = useRoute()
const isActive = (path: string) => route.path === path
</script>

<template>
  <nav class="bottom-nav">
    <NuxtLink to="/" :class="{ active: isActive('/') }">
      <Icon name="home" /><span>الرئيسية</span>
    </NuxtLink>
    <NuxtLink to="/occasions" :class="{ active: isActive('/occasions') }">
      <Icon name="cake" /><span>المناسبات</span>
    </NuxtLink>
    <NuxtLink to="/gift-finder" :class="['bn-center', { active: isActive('/gift-finder') }]">
      <span class="bn-fab"><Icon name="sparkles" /></span>
      <span>هدية مثالية</span>
    </NuxtLink>
    <NuxtLink to="/favorites" :class="{ active: isActive('/favorites') }">
      <Icon name="heart" /><span>المفضلة</span>
    </NuxtLink>
    <NuxtLink to="/orders" :class="{ active: isActive('/orders') }">
      <Icon name="package" /><span>طلباتي</span>
    </NuxtLink>
  </nav>
</template>