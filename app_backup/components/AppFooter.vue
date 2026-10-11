<script setup lang="ts">
import { WHATSAPP_NUMBER } from '~/data/seed'
</script>

<template>
  <footer class="ftr">
    <div class="wrap ftr-in">
      <div class="ftr-brand">
        <span class="brand-mark big"><i data-lucide="leaf" /></span>
        <h4>FA Fruits</h4>
        <p>لا نبيع فاكهة… نصمّم لحظة. هدايا فواكه فاخرة تُحضَّر يوميًا وتوصل في نفس اليوم داخل الكويت.</p>
        <div class="ftr-social">
          <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
            <i data-lucide="instagram" />
          </a>
        </div>
      </div>

      <div class="ftr-col">
        <h5>تسوّق</h5>
        <NuxtLink to="/occasions">المناسبات</NuxtLink>
        <NuxtLink to="/collections">المجموعات</NuxtLink>
        <NuxtLink to="/gift-finder">هدية مثالية</NuxtLink>
        <NuxtLink to="/collections">العروض</NuxtLink>
      </div>

      <div class="ftr-col">
        <h5>خدمة العملاء</h5>
        <NuxtLink to="/orders">طلباتي</NuxtLink>
        <NuxtLink to="/track">تتبع الطلب</NuxtLink>
        <NuxtLink to="/policy/delivery">سياسة التوصيل</NuxtLink>
        <NuxtLink to="/policy/returns">الاستبدال والإرجاع</NuxtLink>
      </div>

      <div class="ftr-col">
        <h5>تواصل معنا</h5>
        <p class="ftr-line"><i data-lucide="map-pin" /> السالمية، شارع سالم المبارك، الكويت</p>
        <p class="ftr-line"><i data-lucide="clock" /> يوميًا ٩:٠٠ ص — ١١:٠٠ م</p>
        <p class="ftr-line"><i data-lucide="phone" /> ٩٦٥٠ ١٢٣٤</p>
        <div class="ftr-pay"><span>KNET</span></div>
      </div>
    </div>
    <div class="ftr-bottom">
      <div class="wrap">© 2025 FA Fruits — جميع الحقوق محفوظة · Luxury Fruit Gifting Platform</div>
    </div>
  </footer>
</template>