/* =========================================================
   Middleware — حماية صفحات الداشبورد + فلترة حسب الدور
   ========================================================= */

import { useAuth, SCREENS_BY_ROLE, ROLE_HOME } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  // يشتغل بس على صفحات الداشبورد
  if (!to.path.startsWith('/dashboard')) return

  // صفحة تسجيل الدخول — لا تحتاج حماية
  if (to.path === '/dashboard/login') {
    const { user } = useAuth()
    if (user.value) {
      // لو داخل بالفعل، وجّهه لصفحته الرئيسية
      return navigateTo(`/dashboard/${ROLE_HOME[user.value.role] || 'today'}`)
    }
    return
  }

  // باقي الصفحات — لازم تسجيل دخول
  const { user } = useAuth()
  if (!user.value) {
    return navigateTo('/dashboard/login')
  }

  // فحص الصلاحية حسب الدور
  const screen = to.path.replace('/dashboard/', '').split('/')[0]
  const allowed = SCREENS_BY_ROLE[user.value.role] || []

  if (!allowed.includes(screen)) {
    // عرض صفحة "لا تملك صلاحية"
    return abortNavigation({
      statusCode: 403,
      message: 'لا تملك صلاحية الوصول لهذه الصفحة'
    })
  }
})