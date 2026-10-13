import { Page, expect } from '@playwright/test'

type DashboardSection =
  | 'overview'
  | 'today'
  | 'orders'
  | 'products'
  | 'availability'
  | 'reports'
  | 'settings'
  | 'team'
  | 'users'

/**
 * الانتقال لقسم معيّن في لوحة التحكم.
 *
 * @example
 *   await gotoDashboard(page, 'orders')
 */
export async function gotoDashboard(
  page: Page,
  section: DashboardSection = 'overview'
): Promise<void> {
  await page.goto(`/dashboard/${section}`)
  await expect(page).toHaveURL(new RegExp(`/dashboard/${section}`))
}

/**
 * فتح تفاصيل طلب معيّن.
 */
export async function openOrderDetails(
  page: Page,
  orderId: string
): Promise<void> {
  await gotoDashboard(page, 'orders')
  await page.getByText(orderId).first().click()
  await expect(page.getByText(/تفاصيل الطلب/i)).toBeVisible({ timeout: 5_000 })
}