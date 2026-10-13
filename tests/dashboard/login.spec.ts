import { test, expect } from '@playwright/test'
import { loginAsAdmin, attemptInvalidLogin } from '../helpers/login'
import { adminUser, invalidUser } from '../fixtures/admin'

test.describe('Dashboard — Login', () => {
  // ⭐ كل اختبار يبدأ بمتصفح نضيف
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('admin can login with valid credentials', async ({ page }) => {
    await loginAsAdmin(page, adminUser)
    // ⭐ بعد الدخول الناجح: أي صفحة داخلية ما عدا login
    await expect(page).toHaveURL(/\/dashboard\/(?!login)/)
  })

  test('invalid credentials show error message', async ({ page }) => {
    await attemptInvalidLogin(page, invalidUser)
    // ⭐ بعد الفشل: نفضل على صفحة الـ login
    await expect(page).toHaveURL(/\/dashboard\/login/)
  })
})