<script setup lang="ts">
import { useAuth, ROLE_HOME } from '~/composables/useAuth'

definePageMeta({ layout: false })

const { user } = useAuth()

onMounted(() => {
  if (user.value) {
    const home = ROLE_HOME[user.value.role] || 'today'
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