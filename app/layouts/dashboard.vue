<script setup lang="ts">
import { useAuth, ROLE_LABEL, SCREENS_BY_ROLE } from '~/composables/useAuth'

const route = useRoute()
const { user, logout } = useAuth()

const showLogoutModal = ref(false)

/* ⭐ القائمة الجديدة */
const ALL_NAV = [
  { id: 'overview',     label: 'نظرة عامة',   icon: 'layout-dashboard' },
  { id: 'reports',      label: 'التقارير',    icon: 'bar-chart-3' },
  { id: 'orders',       label: 'الطلبات',     icon: 'package' },
  { id: 'products',     label: 'المنتجات',    icon: 'box' },
  { id: 'team',         label: 'الفريق',      icon: 'users' },
  { id: 'settings',     label: 'الإعدادات',   icon: 'settings' }
]

const visibleNav = computed(() => {
  if (!user.value) return []
  const allowed = SCREENS_BY_ROLE[user.value.role] || []
  return ALL_NAV.filter(n => allowed.includes(n.id))
})

const currentScreen = computed(() => {
  const path = route.path
  const afterDash = path.startsWith('/dashboard/')
    ? path.slice('/dashboard/'.length)
    : ''
  const parts = afterDash.split('/').filter(Boolean)
  return parts[0] || 'today'
})

function isActive(id: string): boolean {
  return currentScreen.value === id
}

const openLogoutModal = () => { showLogoutModal.value = true }

const confirmLogout = async () => {
  showLogoutModal.value = false
  await logout()
}

const initials = computed(() => {
  if (!user.value?.name) return '؟'
  return user.value.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('')
})
</script>

<template>
  <div class="dash">
    <aside class="dash-sidebar">
      <div class="dash-sidebar-head">
        <span class="dash-sidebar-logo"><Icon name="chef-hat" /></span>
        <div class="dash-sidebar-title">
          <b>لوحة التشغيل</b>
          <i>FA Fruits</i>
        </div>
      </div>

      <nav class="dash-sidebar-nav">
        <NuxtLink
          v-for="n in visibleNav"
          :key="n.id"
          :to="`/dashboard/${n.id}`"
          :class="{ on: isActive(n.id) }"
        >
          <Icon :name="n.icon" :size="18" />
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
        <button
          class="dash-sidebar-btn dash-sidebar-btn-danger"
          @click="openLogoutModal"
        >
          <Icon name="log-out" :size="16" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>

    <div class="dash-body">
      <header class="dash-hdr">
        <div class="dash-hdr-in">
          <div class="dash-brand">
            <span class="dash-brand-icon"><Icon name="chef-hat" /></span>
            <div class="dash-brand-txt">
              <b>{{ user?.name }}</b>
              <i>{{ user?.role && ROLE_LABEL[user.role] }}</i>
            </div>
          </div>
          <div class="dash-hdr-actions">
            <button class="dash-icon-btn" @click="openLogoutModal" title="تسجيل الخروج">
              <Icon name="log-out" :size="18" />
            </button>
          </div>
        </div>
      </header>

      <main class="dash-main">
        <slot />
      </main>
    </div>

    <nav v-if="visibleNav.length > 1" class="dash-nav">
      <NuxtLink
        v-for="n in visibleNav"
        :key="n.id"
        :to="`/dashboard/${n.id}`"
        :class="{ on: isActive(n.id) }"
      >
        <Icon :name="n.icon" :size="20" />
        <span>{{ n.label }}</span>
      </NuxtLink>
    </nav>

    <ConfirmModal
      :open="showLogoutModal"
      icon="log-out"
      variant="danger"
      title="تسجيل الخروج؟"
      :message="`هل تريد الخروج من حساب ${user?.name || ''}؟ ستحتاج لتسجيل الدخول مرة أخرى.`"
      confirm-text="نعم، تسجيل الخروج"
      cancel-text="البقاء"
      @confirm="confirmLogout"
      @cancel="showLogoutModal = false"
    />
  </div>
</template>