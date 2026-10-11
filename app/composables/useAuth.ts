// composables/useAuth.ts
import { useState, computed } from '#imports'

/* ═══════════════════════════════════════════
   الأنواع
   ═══════════════════════════════════════════ */
export type Role = 'admin' | 'assistant'

export interface TeamMember {
  phone: string
  name: string
  role: Role
}

/* ═══════════════════════════════════════════
   الصفحات المسموحة لكل دور
   ═══════════════════════════════════════════ */
export const SCREENS_BY_ROLE: Record<Role, string[]> = {
  admin:     ['today', 'orders', 'products', 'availability', 'settings', 'users'],
  assistant: ['today', 'orders']
}

/* ⭐ الصفحة الرئيسية لكل دور */
export const ROLE_HOME: Record<Role, string> = {
  admin:     '/dashboard/today',
  assistant: '/dashboard/today'
}

/* ⭐ كل الأدوار */
export const ROLES: Role[] = ['admin', 'assistant']

/* ⭐ أسماء الأدوار بالعربي */
export const ROLE_LABELS: Record<Role, string> = {
  admin:     'مدير النظام',
  assistant: 'المساعد'
}



/* ⭐ alias — بعض الملفات بتستخدم المفرد */
export const ROLE_LABEL = ROLE_LABELS
/* ═══════════════════════════════════════════
   Composable
   ═══════════════════════════════════════════ */
export const useAuth = () => {
  const team  = useState<TeamMember | null>('auth-team', () => null)
  const ready = useState<boolean>('auth-ready', () => false)

  /* ⭐ استخدام useRequestFetch للـ SSR (تمرير الكوكيز) */
  const fetchWithCookies = import.meta.server ? useRequestFetch() : $fetch

  /* ═══ تحميل بيانات الفريق الحالي ═══ */
  const loadMe = async () => {
    try {
      const res = await fetchWithCookies<{ ok: boolean; team: TeamMember }>(
        '/api/auth/team/me'
      )
      team.value = res.team
    } catch {
      team.value = null
    } finally {
      ready.value = true
    }
  }

  /* ═══ تسجيل الدخول ═══ */
  const login = async (phone: string, password: string) => {
    const res = await $fetch<{ ok: boolean; team: TeamMember }>(
      '/api/auth/team/login',
      { method: 'POST', body: { phone, password } }
    )
    team.value = res.team
    return res.team
  }

 const logout = async () => {
  try {
    await $fetch('/api/auth/team/logout', { method: 'POST' })
  } catch (e) {
    console.warn('[logout] error:', e)
  } finally {
    // ⭐ صفّر الحالة
    team.value = null
    ready.value = true
    
    // ⭐ استخدم window.location للضمانة القصوى
    if (import.meta.client) {
      window.location.href = '/dashboard/login'
    } else {
      await navigateTo('/dashboard/login')
    }
  }
}

  /* ═══ هل الفريق عنده صلاحية لصفحة معينة؟ ═══ */
  const can = (screen: string): boolean => {
    if (!team.value) return false
    return SCREENS_BY_ROLE[team.value.role]?.includes(screen) ?? false
  }

  /* ═══ الصفحات المسموحة للفريق الحالي ═══ */
  const allowedScreens = computed<string[]>(() =>
    team.value ? SCREENS_BY_ROLE[team.value.role] || [] : []
  )

  /* ⭐ الصفحة الرئيسية للفريق الحالي */
  const homeScreen = computed<string>(() =>
    team.value ? ROLE_HOME[team.value.role] : '/dashboard/login'
  )

  /* ⭐ هل هو admin؟ */
  const isAdmin = computed<boolean>(() => team.value?.role === 'admin')

  /* ⭐ هل هو assistant؟ */
  const isAssistant = computed<boolean>(() => team.value?.role === 'assistant')

   return {
    // state
    team,
    user: team,        // ⭐ alias — بعض الملفات بتستخدم user
    ready,

    // actions
    loadMe,
    login,
    logout,

    // helpers
    can,
    allowedScreens,
    homeScreen,
    isAdmin,
    isAssistant
  }
}