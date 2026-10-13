import { Page, expect } from '@playwright/test'

/**
 * استخرج رقم الطلب من صفحة النجاح.
 *
 * بعد الـ checkout، الـ URL بيكون:
 *   /success?order=ORD-XXXX
 *
 * @returns رقم الطلب (string) أو null لو مش موجود
 */
export async function extractOrderIdFromSuccess(
  page: Page,
): Promise<string | null> {
  await expect(page).toHaveURL(/\/success/, { timeout: 30_000 })

  const url = new URL(page.url())
  const orderId = url.searchParams.get('order')

  return orderId
}

/**
 * الانتقال لصفحة تتبع الطلب.
 */
export async function gotoTrackPage(
  page: Page,
  orderId: string,
): Promise<void> {
  await page.goto(`/track/${orderId}`)
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(new RegExp(`/track/${orderId}`))
}

/**
 * الانتقال لصفحة البحث عن الطلبات بالرقم.
 */
export async function gotoOrdersLookup(page: Page): Promise<void> {
  await page.goto('/orders')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(/\/orders$/)
}

/**
 * ابحث عن طلبات برقم الهاتف.
 */
export async function lookupOrdersByPhone(
  page: Page,
  phone: string,
): Promise<void> {
  await gotoOrdersLookup(page)

  const phoneInput = page.getByPlaceholder('965XXXXXXXX')
  await expect(phoneInput).toBeVisible({ timeout: 5_000 })
  await phoneInput.fill(phone)

  await page.getByRole('button', { name: /ابحث عن طلباتي/ }).click()

  // بعد البحث، الـ URL بيتحول لـ /orders/{phone}
  await expect(page).toHaveURL(new RegExp(`/orders/${phone}`), {
    timeout: 10_000,
  })
}