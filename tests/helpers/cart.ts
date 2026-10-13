import { Page, expect } from '@playwright/test'

/**
 * الانتقال لصفحة السلة.
 */
export async function gotoCart(page: Page): Promise<void> {
  await page.goto('/cart')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(/\/cart/)
}

/**
 * التحقق من عدد المنتجات في السلة.
 */
export async function expectCartItemCount(
  page: Page,
  count: number,
): Promise<void> {
  const items = page.locator('.cart-item')
  await expect(items).toHaveCount(count)
}

/**
 * التحقق من أن السلة فارغة (empty-state).
 */
export async function expectEmptyCart(page: Page): Promise<void> {
  await expect(page.getByText('سلتك فارغة')).toBeVisible()
}

/**
 * إزالة أول عنصر من السلة.
 */
export async function removeFirstCartItem(page: Page): Promise<void> {
  const firstRemove = page.locator('.ci-remove').first()
  await firstRemove.click()
}

/**
 * تغيير كمية أول عنصر.
 */
export async function changeFirstItemQty(
  page: Page,
  delta: 1 | -1,
): Promise<void> {
  const firstItem = page.locator('.cart-item').first()
  const btn = firstItem.locator('.qty button').nth(delta > 0 ? 1 : 0)
  await btn.click()
}

/**
 * الضغط على "متابعة الدفع".
 */
export async function proceedToCheckout(page: Page): Promise<void> {
  await page.getByRole('link', { name: /متابعة الدفع/ }).click()
  await expect(page).toHaveURL(/\/checkout/, { timeout: 10_000 })
}

/**
 * ⭐ إفراغ السلة + بيانات localStorage — نسخة مُصحّحة.
 *
 * الاستخدام:
 *   await page.goto('/')              // ← أول زيارة، بعدها
 *   await clearCartViaStorage(page)   // ← امسح دلوقتي
 *   // باقي الاختبار
 *
 * ⚠️ ملاحظة مهمة:
 *   لا تستخدم addInitScript لأنها تشتغل مع كل page.goto()
 *   وبالتالي تمسح السلة عند التنقل بين الصفحات.
 */
export async function clearCartViaStorage(page: Page): Promise<void> {
  // لازم نكون على صفحة من الموقع أول حاجة
  if (!page.url().startsWith('http')) {
    await page.goto('/')
  }

  await page.evaluate(() => {
    localStorage.removeItem('fa_cart')
    localStorage.removeItem('fa_favorites')
    localStorage.removeItem('fa_last_order')
    localStorage.removeItem('fa_user_phone')
  })
}