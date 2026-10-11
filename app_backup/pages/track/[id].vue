<script setup lang="ts">
const route = useRoute()
const orderId = computed(() => route.params.id as string)

const steps = [
  { icon: 'cherry', t: 'تحضير الفواكه', s: 'اختيار وغسل الفواكه', done: true },
  { icon: 'palette', t: 'تصميم السلة', s: 'تنسيق الهدية', done: true },
  { icon: 'gift', t: 'التغليف', s: 'تغليف فاخر', done: true },
  { icon: 'truck', t: 'مع المندوب', s: 'خرج للتوصيل', now: true },
  { icon: 'home', t: 'تم التوصيل', s: 'قريباً', done: false }
]
</script>

<template>
  <section class="page-head" style="padding-bottom:10px">
    <div class="wrap">
      <div class="crumbs"><NuxtLink to="/">الرئيسية</NuxtLink> / تتبع الطلب</div>
      <h1>تتبّع طلبك</h1>
    </div>
  </section>

  <section class="wrap" style="padding-bottom:60px">
    <div class="track-box">
      <div class="track-input">
        <input class="custom-input" placeholder="رقم الطلب" :value="'#' + orderId" />
        <button class="btn btn-primary">تتبع</button>
      </div>

      <div class="track-status">
        <i data-lucide="truck" />
        <div><b>طلبك في الطريق إليك</b><span>الوصول: اليوم قبل ٨:٠٠ م</span></div>
      </div>

      <div class="timeline" style="padding:0;border:0;background:none">
        <div v-for="(s, i) in steps" :key="i" :class="['tl-item', { done: s.done, now: s.now }]">
          <div class="tl-dot">
            <i v-if="s.done" data-lucide="check" />
            <i v-else :data-lucide="s.icon" />
          </div>
          <div class="tl-body"><b>{{ s.t }}</b><span>{{ s.s }}</span></div>
        </div>
      </div>
    </div>
  </section>
</template>