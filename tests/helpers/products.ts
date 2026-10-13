import { Page, expect } from '@playwright/test'
import { ProductFixture, defaultProduct } from '../fixtures/products'

/**
 * الانتقال لصفحة منتج.
 *
 * @example
 *   await gotoProduct(page, 'p01')
 *   await gotoProduct(page) // defaultProduct
 */
export async function gotoProduct(
  page: Page,
  product: ProductFixture | string = defaultProduct,
): Promise<void> {
  const id = typeof product === 'string' ? product : product.id
  await page.goto(`/product/${id}`)
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(new RegExp(`/product/${id}`))
}

/**
 * الانتقال لصفحة المجموعات.
 */
export async function gotoCollections(page: Page): Promise<void> {
  await page.goto('/collections')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(/\/collections/)
}

/**
 * إضافة المنتج الحالي في صفحة المنتج إلى السلة.
 *
 * يتعامل مع حالتين:
 *   1. "خدمة اليوم (VIP)" → زر WhatsApp (مش بنضغطه في الاختبار)
 *   2. الحالة العادية → زر "أضف إلى السلة"
 *
 * ⭐ بعد الإضافة، product/[id].vue بيعمل navigateTo('/cart') تلقائيًا.
 */
export async function addCurrentProductToCart(page: Page): Promise<void> {
  // ⭐ لو المنتج "جاهز اليوم" — نختار "غدًا" لتجنب VIP flow
  const tomorrowChip = page.getByRole('button', { name: 'غداً' })
  if (await tomorrowChip.isVisible().catch(() => false)) {
    await tomorrowChip.click()
  }

  // ⭐ زر "أضف إلى السلة" — النص الكامل: "أضف إلى السلة — X.XXX د.ك"
  const addBtn = page.getByRole('button', { name: /أضف إلى السلة/ })
  await expect(addBtn).toBeVisible({ timeout: 10_000 })
  await addBtn.click()

  // ⭐ بعد الإضافة، الصفحة بتعمل redirect تلقائي لـ /cart
  await expect(page).toHaveURL(/\/cart/, { timeout: 10_000 })
}

/**
 * إضافة المنتج الحالي للسلة مع عبارة منحوتة (preset).
 *
 * @example
 *   await addCurrentProductWithMessageToCart(page, 'كل عام وأنت بخير')
 */
export async function addCurrentProductWithMessageToCart(
  page: Page,
  message: string,
): Promise<void> {
  // ⭐ اختَر "غداً" لتجنب VIP flow
  const tomorrowChip = page.getByRole('button', { name: 'غداً' })
  if (await tomorrowChip.isVisible().catch(() => false)) {
    await tomorrowChip.click()
  }

  // ⭐ اختَر العبارة من الـ chips
  const chip = page.locator('.msg-chip', { hasText: message }).first()
  await expect(chip).toBeVisible({ timeout: 5_000 })
  await chip.click()

  // ⭐ اضغط "أضف إلى السلة"
  const addBtn = page.getByRole('button', { name: /أضف إلى السلة/ })
  await expect(addBtn).toBeVisible({ timeout: 10_000 })
  await addBtn.click()

  await expect(page).toHaveURL(/\/cart/, { timeout: 10_000 })
}

/**
 * اختيار منطقة توصيل (نفس المنطق في صفحة المنتج والسلة).
 */
export async function selectDeliveryCity(
  page: Page,
  cityName: string,
): Promise<void> {
  const deliveryRow = page.locator('.ps-delivery-btn, .sum-row-btn').first()
  await deliveryRow.click()

  const cityBtn = page.locator('.city-item', { hasText: cityName })
  await expect(cityBtn).toBeVisible({ timeout: 5_000 })
  await cityBtn.click()
}

/**
 * اختيار عبارة من القائمة الجاهزة في صفحة المنتج.
 */
export async function selectPresetMessage(
  page: Page,
  message: string,
): Promise<void> {
  const chip = page.locator('.msg-chip', { hasText: message })
  await expect(chip).toBeVisible({ timeout: 5_000 })
  await chip.click()
}