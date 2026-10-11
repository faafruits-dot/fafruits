// app/middleware/dashboard-auth.global.ts
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/dashboard')) return
  if (to.path === '/dashboard/login') return

  const { team, ready, loadMe, allowedScreens } = useAuth()

  if (!ready.value) {
    await loadMe()
  }

  if (!team.value) {
    return navigateTo('/dashboard/login')
  }

  const screen = to.path.split('/')[2] || 'today'
  if (screen && !allowedScreens.value.includes(screen)) {
    const first = allowedScreens.value[0] || 'today'
    return navigateTo(`/dashboard/${first}`)
  }
})