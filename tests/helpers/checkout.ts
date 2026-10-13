import { Page, expect } from '@playwright/test'
import { CustomerFixture, testCustomer } from '../fixtures/customer'

/**
 * الانتقال لصفحة الدفع.
 */
export async function gotoCheckout(page: Page): Promise<void> {
  await page.goto('/checkout')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(/\/checkout/)
}

/**
 * ملء خطوة "التوصيل" (Step 1) في checkout.vue.
 */
export async function fillDeliveryStep(
  page: Page,
  customer: CustomerFixture = testCustomer,
): Promise<void> {
  // 1) الاسم
  const nameInput = page.getByPlaceholder('مثال: أحمد السالم')
  await expect(nameInput).toBeVisible({ timeout: 10_000 })
  await nameInput.fill(customer.name)

  // 2) الهاتف — أول input type="tel"
  const phoneInput = page.locator('input[type="tel"]').first()
  await phoneInput.fill(customer.phone)

  // 3) المنطقة — select
  const areaSelect = page.locator('select.custom-input')
  await expect(areaSelect).toBeVisible({ timeout: 5_000 })

  if (customer.areaId) {
    await areaSelect.selectOption(customer.areaId)
  } else if (customer.area) {
    const optionCount = await areaSelect.locator('option').count()
    let matched = false
    for (let i = 0; i < optionCount; i++) {
      const text = (await areaSelect.locator('option').nth(i).innerText()).trim()
      if (text.includes(customer.area)) {
        await areaSelect.selectOption({ index: i })
        matched = true
        break
      }
    }
    if (!matched) {
      throw new Error(`[checkout] لم يتم العثور على منطقة "${customer.area}" في القائمة`)
    }
  }

  // 4) الشارع
  const streetInput = page.getByPlaceholder('شارع سالم المبارك، مبنى 5')
  await streetInput.fill(customer.street)

  // 5) وقت التوصيل (slot)
  if (customer.slot) {
    const slotBtn = page.locator('.slot', { hasText: customer.slot }).first()
    if (await slotBtn.isVisible().catch(() => false)) {
      await slotBtn.click()
    }
  }
}

/**
 * ملء خطوة "المستلم" (Step 2) — اختيارية.
 */
export async function fillRecipientStep(
  page: Page,
  recipientName: string,
  recipientPhone: string,
): Promise<void> {
  const inputs = page.locator('.form-grid.two input')
  const count = await inputs.count()
  if (count >= 2) {
    await inputs.nth(0).fill(recipientName)
    await inputs.nth(1).fill(recipientPhone)
  }
}

/**
 * الضغط على زر "التالي".
 */
export async function clickNext(page: Page): Promise<void> {
  const btn = page.getByRole('button', { name: /التالي/ })
  await expect(btn).toBeVisible({ timeout: 5_000 })
  await btn.click()
  await page.waitForTimeout(300)
}

/**
 * الضغط على زر "السابق".
 */
export async function clickBack(page: Page): Promise<void> {
  const btn = page.getByRole('button', { name: /السابق/ })
  await btn.click()
  await page.waitForTimeout(300)
}

/**
 * خطوة الدفع (Step 3) — KNET افتراضيًا.
 */
export async function selectPayment(page: Page): Promise<void> {
  const knetBtn = page.locator('.pay', { hasText: 'KNET' })
  if (await knetBtn.isVisible().catch(() => false)) {
    const classes = (await knetBtn.getAttribute('class')) || ''
    if (!classes.includes('on')) {
      await knetBtn.click()
    }
  }
}

/**
 * تخطي إلى خطوة المراجعة (Step 4).
 */
export async function skipToReview(page: Page): Promise<void> {
  await clickNext(page) // 1 → 2
  await clickNext(page) // 2 → 3
  await clickNext(page) // 3 → 4
}

/**
 * تأكيد الطلب النهائي (Step 4).
 */
export async function confirmOrder(page: Page): Promise<void> {
  const confirmBtn = page.getByRole('button', { name: /تأكيد الطلب/ })
  await expect(confirmBtn).toBeVisible({ timeout: 10_000 })
  await confirmBtn.click()
}

/**
 * انتظار الوصول لصفحة النجاح.
 */
export async function expectOrderSuccess(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/success/, { timeout: 30_000 })
}

/**
 * سيناريو كامل.
 */
export async function completeCheckoutFlow(
  page: Page,
  customer: CustomerFixture = testCustomer,
): Promise<void> {
  await fillDeliveryStep(page, customer)
  await skipToReview(page)
  await selectPayment(page)
  await confirmOrder(page)
  await expectOrderSuccess(page)
}