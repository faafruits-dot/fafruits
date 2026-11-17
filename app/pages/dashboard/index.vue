<script setup lang="ts">
import { useAuth, ROLE_HOME } from '~/composables/useAuth'

definePageMeta({ layout: false })

const { user, ready, loadMe } = useAuth()

onMounted(async () => {
  if (!ready.value) await loadMe()

  if (user.value) {
    // ⭐ تعديل: إذا كان المساعد، يذهب للطلبات مباشرة
    const home = user.value.role === 'assistant' ? 'orders' : (ROLE_HOME[user.value.role] || 'overview')
    navigateTo(`/dashboard/${home}`, { replace: true })
  } else {
    navigateTo('/dashboard/login', { replace: true })
  }
})
</script>

<template>
  <div style="display:grid;place-items:center;min-height:100vh">
    <p>جاري التحويل...</p>
  </div>
</template>