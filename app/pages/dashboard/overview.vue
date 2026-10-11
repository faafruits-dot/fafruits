<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'dashboard' })

useSeoMeta({ title: 'نظرة عامة — لوحة الإدارة' })

const router = useRouter()
const { user, ready, loadMe } = useAuth()

onMounted(async () => {
  if (!ready.value) await loadMe()

  /* ⭐ لو المساعد → نروح لـ today */
  if (user.value?.role === 'assistant') {
    router.replace('/dashboard/today')
  }
})
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="!ready || !user" class="loading-state">
      <Icon name="loader" :size="32" class="spin" />
      <p>جاري التحميل…</p>
    </div>

    <!-- ⭐ الأدمن يشوف نظرة عامة -->
    <AdminOverview v-else-if="user.role === 'admin'" />
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 20px;
  text-align: center;
  color: var(--ink-mute);
}
.spin {
  animation: spin 1.4s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>