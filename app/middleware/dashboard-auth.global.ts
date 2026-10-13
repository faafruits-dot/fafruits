// app/middleware/dashboard-auth.global.ts
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  // ⭐ تجاهل أي مسار مش /dashboard
  if (!to.path.startsWith('/dashboard')) return

  // ⭐ صفحة الـ login مستثناة
  if (to.path === '/dashboard/login') return

  const { team, ready, loadMe, allowedScreens } = useAuth()

  // ⭐ نحمّل بيانات المستخدم لو لسه ما اتحملتش
  if (!ready.value) {
    await loadMe()
  }

  // ⭐ مش مسجل دخول → روّح لصفحة الـ login
  if (!team.value) {
    return navigateTo('/dashboard/login')
  }

  // ⭐ استخرج اسم القسم من المسار
  //    /dashboard/overview → 'overview'
  //    /dashboard/orders   → 'orders'
  const screen = to.path.split('/')[2] || ''

  // ⭐ لو القسم مش من ضمن المسموح، روّح لأول صفحة مسموحة
  if (screen && !allowedScreens.value.includes(screen)) {
    const first = allowedScreens.value[0] || 'overview'
    return navigateTo(`/dashboard/${first}`)
  }
})