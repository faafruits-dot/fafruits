import { Page, expect } from '@playwright/test'
import { adminUser, AdminFixture } from '../fixtures/admin'

/**
 * تسجيل دخول إلى لوحة التحكم.
 *
 * يطابق البنية الفعلية لـ:
 *   app/pages/dashboard/login.vue
 *
 * ⭐ مهم: نستخدم waitForLoadState('networkidle') بعد goto
 * لأن Nuxt 3 محتاج وقت للـ hydration قبل ما زر "دخول" يستجيب.
 */
export async function loginAsAdmin(
  page: Page,
  user: AdminFixture = adminUser,
): Promise<void> {
  await page.goto('/dashboard/login')

  // ⭐ انتظر حتى نهاية تحميل الصفحة والـ hydration
  await page.waitForLoadState('networkidle')

  await expect(page).toHaveURL(/\/dashboard\/login/)

  // رقم الجوال
  const phoneInput = page.getByPlaceholder('965XXXXXXXX')
  await expect(phoneInput).toBeVisible({ timeout: 10_000 })
  await phoneInput.fill(user.phone)

  // كلمة المرور
  const passwordInput = page.locator('input[type="password"]')
  await passwordInput.fill(user.password)

  // زر الدخول
  await page.getByRole('button', { name: /^دخول$/ }).click()

  // انتظر التحويل خارج صفحة الـ login
  await expect(page).not.toHaveURL(/\/dashboard\/login/, { timeout: 15_000 })

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
}

/**
 * تسجيل دخول سريع عبر زر "الدخول السريع".
 */
export async function loginWithQuickButton(
  page: Page,
  roleName: 'مدير النظام' | 'المساعد',
): Promise<void> {
  await page.goto('/dashboard/login')
  await page.waitForLoadState('networkidle')

  const quickBtn = page
    .locator('.dl-quick-item')
    .filter({ hasText: roleName })

  await quickBtn.click()
  await page.getByRole('button', { name: /^دخول$/ }).click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
}

/**
 * اختبار تسجيل دخول فاشل.
 *
 * ⭐ important: نضيف waitForLoadState قبل ما نعبّي الحقول
 */
export async function attemptInvalidLogin(
  page: Page,
  user: AdminFixture,
): Promise<void> {
  await page.goto('/dashboard/login')
  await page.waitForLoadState('networkidle')

  await page.getByPlaceholder('965XXXXXXXX').fill(user.phone)
  await page.locator('input[type="password"]').fill(user.password)
  await page.getByRole('button', { name: /^دخول$/ }).click()

  await expect(page.locator('.dl-error')).toBeVisible({ timeout: 10_000 })
}

/**
 * تسجيل خروج.
 */
export async function logoutAdmin(page: Page): Promise<void> {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')

  const logoutBtn = page.getByRole('button', { name: /خروج|تسجيل خروج/i })
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click()
    await expect(page).toHaveURL(/\/dashboard\/login/)
  }
}