<script setup lang="ts">
import { cleanPhone } from '~/utils/format'

const router = useRouter()
const phone = ref('')

onMounted(() => {
  if (process.client) {
    phone.value = localStorage.getItem('fa_user_phone') || ''
  }
})

const lookup = () => {
  const val = cleanPhone(phone.value)
  if (val.length < 7) return
  router.push(`/orders/${val}`)
}
</script>

<template>
  <section class="page-head" style="padding-bottom:10px">
    <div class="wrap">
      <div class="crumbs"><NuxtLink to="/">الرئيسية</NuxtLink> / طلباتي</div>
      <h1>طلباتي</h1>
      <p>بدون حساب — أدخل رقم هاتفك لعرض كل طلباتك.</p>
    </div>
  </section>

  <section class="wrap" style="padding-bottom:80px">
    <div class="orders-phone-form">
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:80px;height:80px;border-radius:50%;background:var(--green-50);display:grid;place-items:center;margin:0 auto 16px">
          <i data-lucide="phone" style="width:36px;height:36px;color:var(--green-700)" />
        </div>
        <h2 style="font-family:var(--ff-display);font-size:1.5rem;color:var(--green-900);margin-bottom:8px">أدخل رقم هاتفك</h2>
        <p style="color:var(--muted);font-size:.9rem">سنعرض لك كل طلباتك المرتبطة بهذا الرقم.</p>
      </div>
      <div class="field">
        <input v-model="phone" class="custom-input" type="tel" placeholder="965XXXXXXXX"
               style="text-align:center;font-size:1.2rem;padding:18px;letter-spacing:2px" />
      </div>
      <button class="btn btn-primary btn-block btn-lg" style="margin-top:16px" @click="lookup">
        <i data-lucide="search" /> ابحث عن طلباتي
      </button>
    </div>
  </section>
</template>