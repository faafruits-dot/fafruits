import { Page, expect } from '@playwright/test'

/**
 * الانتقال لصفحة الطلبات في لوحة التحكم.
 */
export async function gotoDashboardOrders(page: Page): Promise<void> {
  await page.goto('/dashboard/orders')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(/\/dashboard\/orders/)
}

/**
 * التحقق إن الصفحة اتحمّلت + انتظار انتهاء التحميل.
 */
export async function expectOrdersPageLoaded(page: Page): Promise<void> {
  // العنوان
  const heading = page.getByRole('heading', { name: /^الطلبات$/ })
  await expect(heading.first()).toBeVisible({ timeout: 10_000 })

  // ⭐ انتظر ما يختفي الـ spinner (لو ظاهر)
  const spinner = page.locator('.dash-empty .spin')
  if (await spinner.isVisible().catch(() => false)) {
    await expect(spinner).toBeHidden({ timeout: 15_000 }).catch(() => {})
  }
}

/**
 * عدد الطلبات الظاهرة في الصفحة.
 * - الأدمن: الجدول (.order-id-cell)
 * - المساعد: الكروت (.orders-grid > *)
 */
export async function getOrdersCount(page: Page): Promise<number> {
  // ⭐ انتظر ما ينتهي التحميل
  const spinner = page.locator('.dash-empty .spin')
  if (await spinner.isVisible().catch(() => false)) {
    await expect(spinner).toBeHidden({ timeout: 15_000 }).catch(() => {})
  }

  // جرّب عرض الأدمن (الجدول)
  const adminRows = await page.locator('.orders-table .order-id-cell').count()
  if (adminRows > 0) return adminRows

  // جرّب عرض المساعد (الكروت)
  const cards = await page.locator('.orders-grid > *').count()
  if (cards > 0) return cards

  return 0
}

/**
 * افتح تفاصيل أول طلب.
 * - الأدمن: زر "عرض التفاصيل" (.view-btn) في أول صف
 */
export async function openFirstOrder(page: Page): Promise<void> {
  // ⭐ عرض الأدمن — زر في أول صف
  const viewBtn = page.locator('.orders-table .view-btn').first()
  if (await viewBtn.isVisible().catch(() => false)) {
    await viewBtn.click()
    return
  }

  // ⭐ عرض المساعد — اضغط أول كارت
  const card = page.locator('.orders-grid > *').first()
  await expect(card).toBeVisible({ timeout: 10_000 })
  await card.click()
}

/**
 * تحقق إن تفاصيل الطلب ظهرت (Drawer / Modal).
 */
export async function expectOrderDetailsVisible(page: Page): Promise<void> {
  // ⭐ انتظر لحظة لفتح الـ drawer
  await page.waitForTimeout(600)

  // ⭐ ندوّر على أي عنصر يشبه الـ overlay/drawer/modal
  const candidates = [
    '.drawer',
    '.drawer-panel',
    '.modal',
    '[class*="Drawer"]',
    '[class*="drawer"]',
    '[role="dialog"]',
  ]

  for (const sel of candidates) {
    const el = page.locator(sel).first()
    if (await el.isVisible().catch(() => false)) {
      return
    }
  }

  // ⭐ fallback: أي عنصر جديد بمساحة كبيرة (overlay)
  const overlay = page.locator('[class*="overlay"], [class*="backdrop"]')
  if ((await overlay.count()) > 0) return

  throw new Error(
    '[dashboard-orders] Order details drawer/modal لم يظهر بعد الضغط على view-btn',
  )
}