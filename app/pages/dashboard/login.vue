<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: false
})

const { login, team, homeScreen } = useAuth()

const phone = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

/* ⭐ بيانات سريعة — الدورين فقط */
const quickAccounts = [
  { phone: '96550001111', role: 'مدير النظام',  password: 'admin123' },
  { phone: '96550002222', role: 'المساعد',      password: 'assistant123' }
]

const fillQuick = (acc: typeof quickAccounts[0]) => {
  phone.value = acc.phone
  password.value = acc.password
  error.value = ''
}

const handleLogin = async () => {
  error.value = ''
  const p = phone.value.replace(/\D/g, '')

  if (!p || !password.value) {
    error.value = 'أدخل رقم الجوال وكلمة المرور'
    return
  }

  loading.value = true
  try {
    await login(p, password.value)
    await navigateTo(homeScreen.value || '/dashboard/today')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'خطأ في تسجيل الدخول'
  } finally {
    loading.value = false
  }
}

/* لو مسجّل دخول، وجّهه مباشرة */
onMounted(() => {
  if (team.value) {
    navigateTo(homeScreen.value || '/dashboard/today')
  }
})
</script>

<template>
  <div class="dl-wrap">
    <div class="dl-card">

      <!-- Logo -->
      <div class="dl-logo">
        <Icon name="chef-hat" :size="36" :stroke-width="1.8" />
      </div>

      <h1 class="dl-title">لوحة التشغيل</h1>
      <p class="dl-sub">FA Fruits · نظام إدارة الطلبات</p>

      <!-- Phone -->
      <label class="dl-label">رقم الجوال</label>
      <div class="dl-input">
        <input
          v-model="phone"
          type="tel"
          inputmode="numeric"
          placeholder="965XXXXXXXX"
          dir="ltr"
          @keydown.enter="handleLogin"
        />
        <Icon name="phone" :size="18" />
      </div>

      <!-- Password -->
      <label class="dl-label">كلمة المرور</label>
      <div class="dl-input">
        <input
          v-model="password"
          type="password"
          placeholder="••••••••"
          @keydown.enter="handleLogin"
        />
        <Icon name="lock" :size="18" />
      </div>

      <!-- Error -->
      <div v-if="error" class="dl-error">
        <Icon name="alert-circle" :size="16" />
        <span>{{ error }}</span>
      </div>

      <!-- Submit -->
      <button
        class="dl-btn"
        :disabled="loading"
        @click="handleLogin"
      >
        <Icon v-if="!loading" name="log-in" :size="18" />
        <span v-if="loading" class="dl-spinner" />
        {{ loading ? 'جاري الدخول…' : 'دخول' }}
      </button>

      <!-- Quick accounts -->
      <div class="dl-quick">
        <div class="dl-quick-head">
          <Icon name="zap" :size="14" />
          <span>اضغط للدخول السريع:</span>
        </div>

        <button
          v-for="acc in quickAccounts"
          :key="acc.phone"
          class="dl-quick-item"
          type="button"
          @click="fillQuick(acc)"
        >
          <span class="dl-quick-role">{{ acc.role }}</span>
          <span class="dl-quick-phone" dir="ltr">{{ acc.phone }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.dl-wrap {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--cream);
  background-image:
    radial-gradient(circle at 20% 0%, rgba(245, 154, 35, 0.08), transparent 50%),
    radial-gradient(circle at 80% 100%, rgba(233, 74, 99, 0.06), transparent 50%);
}

.dl-card {
  width: 100%;
  max-width: 400px;
  padding: 36px 32px 28px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}

/* Logo */
.dl-logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #f59a23, #ffb020);
  border-radius: 18px;
  color: #fff;
  box-shadow: 0 8px 20px rgba(245, 154, 35, 0.35);
}

.dl-title {
  text-align: center;
  font-family: var(--ff-display);
  font-size: 1.7rem;
  color: var(--green-900);
  margin: 0 0 6px;
}

.dl-sub {
  text-align: center;
  color: var(--muted);
  font-size: .85rem;
  margin: 0 0 28px;
}

/* Inputs */
.dl-label {
  display: block;
  margin-bottom: 8px;
  font-size: .85rem;
  font-weight: 600;
  color: var(--green-900);
}

.dl-input {
  position: relative;
  margin-bottom: 16px;
}

.dl-input input {
  width: 100%;
  padding: 14px 46px 14px 16px;
  background: var(--cream);
  border: 1.5px solid var(--line);
  border-radius: 14px;
  font-family: inherit;
  font-size: 1rem;
  color: var(--green-900);
  transition: all .18s ease;
}

.dl-input input:focus {
  outline: none;
  border-color: var(--gold);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(245, 154, 35, 0.15);
}

.dl-input svg {
  position: absolute;
  top: 50%;
  inset-inline-end: 16px;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
}

/* Error */
.dl-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 14px;
  background: #FFE8EC;
  color: #B00020;
  border-radius: 12px;
  font-size: .85rem;
}

/* Button */
.dl-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px;
  background: linear-gradient(135deg, #E94A63 0%, #F59A23 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s ease;
  box-shadow: 0 8px 20px rgba(233, 74, 99, 0.3);
}

.dl-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(233, 74, 99, 0.4);
}

.dl-btn:disabled {
  opacity: .7;
  cursor: not-allowed;
}

.dl-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: dl-spin .8s linear infinite;
}

@keyframes dl-spin {
  to { transform: rotate(360deg); }
}

/* Quick accounts */
.dl-quick {
  margin-top: 26px;
  padding: 14px;
  background: var(--cream);
  border-radius: 16px;
  border: 1px dashed var(--line);
}

.dl-quick-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: .78rem;
  color: var(--muted);
  font-weight: 600;
}

.dl-quick-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 6px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  cursor: pointer;
  font-family: inherit;
  font-size: .85rem;
  transition: all .15s ease;
}

.dl-quick-item:last-child {
  margin-bottom: 0;
}

.dl-quick-item:hover {
  border-color: var(--gold);
  background: #FFF9F0;
}

.dl-quick-role {
  color: var(--green-900);
  font-weight: 600;
}

.dl-quick-phone {
  color: var(--muted);
  font-size: .78rem;
  font-family: 'IBM Plex Sans Arabic', monospace;
}
</style>