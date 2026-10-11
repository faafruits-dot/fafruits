<script setup lang="ts">
import { useAuth, ROLE_LABEL, SCREENS_BY_ROLE } from '~/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { user, logout } = useAuth()

/* كل العناصر مع تحديد الأدوار المسموح لها */
const ALL_NAV = [
  { id: 'today',        label: 'اليوم',    icon: 'home' },
  { id: 'orders',       label: 'الطلبات',  icon: 'package' },
  { id: 'preparation',  label: 'التحضير',  icon: 'chef-hat' },
  { id: 'products',     label: 'المنتجات', icon: 'box' },
  { id: 'delivery',     label: 'التوصيل',  icon: 'truck' },
  { id: 'reports',      label: 'التقارير', icon: 'bar-chart-3' },
  { id: 'users',        label: 'الفريق',   icon: 'users' }
]

/* فلترة حسب صلاحيات الدور */
const visibleNav = computed(() => {
  if (!user.value) return []
  const allowed = SCREENS_BY_ROLE[user.value.role] || []
  return ALL_NAV.filter(n => allowed.includes(n.id))
})

/* الصفحة الحالية */
const currentScreen = computed(() => {
  const parts = route.path.replace('/dashboard/', '').split('/')
  return parts[0]
})

const handleLogout = () => {
  if (confirm('سيتم تسجيل الخروج. متابعة؟')) {
    logout()
    router.push('/dashboard/login')
  }
}

/* Initials */
const initials = computed(() => {
  if (!user.value?.name) return '؟'
  return user.value.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('')
})
</script>

<template>
  <div class="dash">
    <aside class="dash-sidebar">
      <div class="dash-sidebar-head">
        <span class="dash-sidebar-logo"><i data-lucide="chef-hat" /></span>
        <div class="dash-sidebar-title"><b>لوحة التشغيل</b><i>FA Fruits</i></div>
      </div>

      <nav class="dash-sidebar-nav">
        <NuxtLink v-for="n in visibleNav" :key="n.id"
                  :to="`/dashboard/${n.id}`"
                  :class="{ on: currentScreen === n.id }">
          <i :data-lucide="n.icon" />
          <span>{{ n.label }}</span>
        </NuxtLink>
      </nav>

      <div class="dash-sidebar-user">
        <span class="dash-user-avatar-sm">{{ initials }}</span>
        <div class="dash-user-meta">
          <b>{{ user?.name }}</b>
          <span>{{ user?.role && ROLE_LABEL[user.role] }}</span>
        </div>
      </div>

      <div class="dash-sidebar-actions">
        <button class="dash-sidebar-btn dash-sidebar-btn-danger" @click="handleLogout">
          <i data-lucide="log-out" /><span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>

    <div class="dash-body">
      <header class="dash-hdr">
        <div class="dash-hdr-in">
          <div class="dash-brand">
            <span class="dash-brand-icon"><i data-lucide="chef-hat" /></span>
            <div class="dash-brand-txt">
              <b>{{ user?.name }}</b>
              <i>{{ user?.role && ROLE_LABEL[user.role] }}</i>
            </div>
          </div>
          <div class="dash-hdr-actions">
            <button class="dash-icon-btn" @click="handleLogout" title="خروج">
              <i data-lucide="log-out" />
            </button>
          </div>
        </div>
      </header>
      <main class="dash-main">
        <slot />
      </main>
    </div>

    <!-- Bottom nav for mobile -->
    <nav v-if="visibleNav.length > 1" class="dash-nav">
      <NuxtLink v-for="n in visibleNav" :key="n.id"
                :to="`/dashboard/${n.id}`"
                :class="{ on: currentScreen === n.id }">
        <i :data-lucide="n.icon" /><span>{{ n.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>