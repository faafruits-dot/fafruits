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
  admin:     ['overview', 'reports', 'orders', 'products', 'team', 'availability', 'settings', 'users'],
  assistant: ['overview', 'orders', 'settings']
}

/* ⭐ الصفحة الرئيسية لكل دور */
export const ROLE_HOME: Record<Role, string> = {
  admin:     'overview',
  assistant: 'overview'
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

  /* ⭐ استخدام useRequestFetch للـ SSR */
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

  /* ═══ تسجيل الخروج ═══ */
  const logout = async () => {
    try {
      await $fetch('/api/auth/team/logout', { method: 'POST' })
    } catch (e) {
      console.warn('[logout] error:', e)
    } finally {
      team.value = null
      ready.value = true

      if (import.meta.client) {
        window.location.href = '/dashboard/login'
      } else {
        await navigateTo('/dashboard/login')
      }
    }
  }

  /* ═══════════════════════════════════════════
     ⭐ جديد — تغيير كلمة المرور
     ═══════════════════════════════════════════ */
  const changePassword = async (
    targetPhone: string,
    payload: { currentPassword?: string; newPassword: string }
  ) => {
    /* ⭐ التحقق المحلي */
    if (targetPhone !== team.value?.phone && team.value?.role !== 'admin') {
      throw new Error('غير مصرّح — فقط المدير أو صاحب الحساب')
    }

    const res = await $fetch<{ ok: boolean; message: string }>(
      `/api/team/${targetPhone}/change-password`,
      { method: 'POST', body: payload }
    )
    return res
  }

  /* ⭐ هل المستخدم الحالي يقدر يغيّر كلمة مرور عضو معيّن؟ */
  const canChangePasswordOf = (targetPhone: string): boolean => {
    if (!team.value) return false
    if (team.value.phone === targetPhone) return true
    return team.value.role === 'admin'
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
    user: team,
    ready,

    // actions
    loadMe,
    login,
    logout,
    changePassword,          // ⭐ جديد
    canChangePasswordOf,     // ⭐ جديد

    // helpers
    can,
    allowedScreens,
    homeScreen,
    isAdmin,
    isAssistant
  }
}