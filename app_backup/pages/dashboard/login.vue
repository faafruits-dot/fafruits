<script setup lang="ts">
import { useAuth, ROLE_HOME } from '~/composables/useAuth'

definePageMeta({ layout: false })

const { login, user } = useAuth()
const router = useRouter()

const phone = ref('')
const password = ref('')
const error = ref('')
const showPw = ref(false)
const loading = ref(false)

/* الحسابات التجريبية للاختبار السريع */
const testAccounts = [
  { phone: '96550001111', pwd: 'admin123',  label: 'مدير النظام', role: 'admin' },
  { phone: '96550002222', pwd: 'chef123',   label: 'المطبخ',      role: 'chef' },
  { phone: '96550003333', pwd: 'driver123', label: 'التوصيل',     role: 'driver' },
  { phone: '96550004444', pwd: 'money123',  label: 'المحاسبة',    role: 'accountant' }
]

/* لو مسجّل دخول بالفعل، وجّهه */
onMounted(() => {
  if (user.value) {
    router.replace(`/dashboard/${ROLE_HOME[user.value.role] || 'today'}`)
  }
})

const quickLogin = (acc: typeof testAccounts[0]) => {
  phone.value = acc.phone
  password.value = acc.pwd
  submit()
}

const submit = () => {
  error.value = ''
  loading.value = true

  if (!phone.value || phone.value.replace(/\D/g, '').length < 8) {
    error.value = 'أدخل رقم جوال صحيح'
    loading.value = false
    return
  }
  if (!password.value) {
    error.value = 'أدخل كلمة المرور'
    loading.value = false
    return
  }

  const res = login(phone.value, password.value)
  loading.value = false

  if (res.ok && res.user) {
    /* توجيه حسب الدور */
    const home = ROLE_HOME[res.user.role] || 'today'
    router.push(`/dashboard/${home}`)
  } else {
    error.value = res.error || 'خطأ في تسجيل الدخول'
  }
}
</script>

<template>
  <div class="dash-login">
    <div class="dash-login-card">
      <div class="dash-login-icon"><i data-lucide="chef-hat" /></div>
      <h1>لوحة التشغيل</h1>
      <p class="dash-login-sub">FA Fruits · نظام إدارة الطلبات</p>

      <form class="dash-login-form" @submit.prevent="submit">
        <div class="dash-field">
          <label>رقم الجوال</label>
          <div class="dash-input-wrap">
            <span class="dash-input-prefix"><i data-lucide="phone" /></span>
            <input v-model="phone" type="tel" placeholder="96550001111" inputmode="numeric" />
          </div>
        </div>

        <div class="dash-field">
          <label>كلمة المرور</label>
          <div class="dash-input-wrap">
            <span class="dash-input-prefix"><i data-lucide="lock" /></span>
            <input v-model="password" :type="showPw ? 'text' : 'password'" placeholder="••••••••" />
            <button type="button" class="dash-input-action" @click="showPw = !showPw">
              <i :data-lucide="showPw ? 'eye-off' : 'eye'" />
            </button>
          </div>
        </div>

        <div v-if="error" class="dash-login-error">
          <i data-lucide="alert-circle" /><span>{{ error }}</span>
        </div>

        <button type="submit" class="dash-btn dash-btn-primary dash-btn-lg dash-btn-block" :disabled="loading">
          <i data-lucide="log-in" /> {{ loading ? 'جاري الدخول...' : 'دخول' }}
        </button>
      </form>

      <!-- حسابات تجريبية (اضغط للدخول السريع) -->
      <div class="dash-login-hint">
        <b>🎯 اضغط للدخول السريع:</b>
        <div class="dash-login-hint-grid">
          <button v-for="acc in testAccounts" :key="acc.phone"
                  type="button"
                  class="test-account-btn"
                  @click="quickLogin(acc)">
            <span class="test-role">{{ acc.label }}</span>
            <code>{{ acc.phone }}</code>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-account-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #f6dfc4;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.test-account-btn:hover {
  background: #fff8ee;
  border-color: #f59a23;
  transform: translateY(-1px);
}
.test-role {
  font-size: 0.72rem;
  color: #7d8a80;
  font-weight: 600;
}
.test-account-btn code {
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
  color: #e94a63;
  font-weight: 800;
  background: #fff0f3;
  padding: 2px 6px;
  border-radius: 6px;
}
</style>