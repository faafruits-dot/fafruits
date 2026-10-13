/**
 * بيانات فريق لوحة التحكم — مأخوذة من quickAccounts في:
 * app/pages/dashboard/login.vue
 */

export interface AdminFixture {
  phone: string
  password: string
  role: 'admin' | 'assistant'
  label: string
  homeScreen: string
}

/**
 * مدير النظام — صلاحيات كاملة.
 */
export const adminUser: AdminFixture = {
  phone: '96550001111',
  password: 'admin123',
  role: 'admin',
  label: 'مدير النظام',
  homeScreen: '/dashboard/today',
}

/**
 * المساعد — صلاحيات محدودة.
 */
export const assistantUser: AdminFixture = {
  phone: '96550002222',
  password: 'assistant123',
  role: 'assistant',
  label: 'المساعد',
  homeScreen: '/dashboard/today',
}

/**
 * حساب خاطئ — لاختبار حالات الفشل.
 */
export const invalidUser: AdminFixture = {
  phone: '96500000000',
  password: 'wrong-password',
  role: 'admin',
  label: 'حساب وهمي',
  homeScreen: '/dashboard/today',
}

/**
 * كل الحسابات في مصفوفة — لتشغيل اختبارات متعددة.
 */
export const allAdminUsers: AdminFixture[] = [adminUser, assistantUser]