<script setup lang="ts">
import { cleanPhone } from '~/utils/format'

const router = useRouter()
const phone = ref('')

const savedPhone = import.meta.client
  ? (localStorage.getItem('fa_user_phone') || '')
  : ''

onMounted(() => {
  if (savedPhone) phone.value = savedPhone
})

const submit = () => {
  const clean = cleanPhone(phone.value)
  if (clean.length < 7) {
    alert('أدخل رقم صحيح')
    return
  }
  if (import.meta.client) {
    localStorage.setItem('fa_user_phone', clean)
  }
  router.push(`/orders/${clean}`)
}
</script>

<template>
  <div>
    <section class="page-head">
      <div class="wrap">
        <div class="crumbs">
          <NuxtLink to="/">الرئيسية</NuxtLink> / طلباتي
        </div>
        <h1>طلباتي</h1>
        <p>بدون حساب — أدخل رقم هاتفك لعرض كل طلباتك.</p>
      </div>
    </section>

    <section class="wrap" style="padding-bottom:80px">
      <div class="phone-form">
        <div style="text-align:center;margin-bottom:24px">
          <div class="phone-icon">
            <Icon name="phone" :size="36" />
          </div>
          <h2>أدخل رقم هاتفك</h2>
          <p>سنعرض لك كل طلباتك المرتبطة بهذا الرقم.</p>
        </div>

        <input
          v-model="phone"
          class="custom-input"
          type="tel"
          placeholder="965XXXXXXXX"
          dir="ltr"
          style="text-align:center;font-size:1.2rem;padding:18px;letter-spacing:2px"
          @keydown.enter="submit"
        />

        <button class="btn btn-primary btn-block btn-lg" style="margin-top:16px" @click="submit">
          <Icon name="search" :size="18" />
          ابحث عن طلباتي
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.phone-form {
  max-width: 480px;
  margin: 20px auto;
  padding: 34px 26px;
  border-radius: var(--radius-lg);
   border: 2px dashed var(--line);
  border-radius: var(--radius-lg);
}
.phone-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--green-50);
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
  color: var(--green-700);
}
.phone-form h2 {
  font-family: var(--ff-display);
  font-size: 1.5rem;
  color: var(--green-900);
  margin: 0 0 8px;
}
.phone-form p {
  color: var(--muted);
  font-size: .9rem;
  margin: 0;
}
</style>