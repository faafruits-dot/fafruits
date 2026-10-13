import { test, expect } from '@playwright/test'
import {
  gotoProduct,
  addCurrentProductToCart,
  addCurrentProductWithMessageToCart,
} from '../helpers/products'
import { expectCartItemCount, clearCartViaStorage } from '../helpers/cart'
import { defaultProduct } from '../fixtures/products'
import {
  testCustomer,
  secondCustomer,
  giftCustomer,
} from '../fixtures/customer'
import {
  fillDeliveryStep,
  fillRecipientStep,
  clickNext,
  selectPayment,
  confirmOrder,
  expectOrderSuccess,
  completeCheckoutFlow,
} from '../helpers/checkout'

test.describe('Customer — Checkout Flow', () => {
  // ⭐ كل اختبار يبدأ بسلة فاضية
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearCartViaStorage(page)
  })

  test('empty cart redirects from checkout to cart', async ({ page }) => {
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/cart/)
    await expect(page.getByText('سلتك فارغة')).toBeVisible()
  })

  test('customer can complete checkout and see success page', async ({
    page,
  }) => {
    await gotoProduct(page, defaultProduct)
    await addCurrentProductToCart(page)
    await expectCartItemCount(page, 1)

    await page.getByRole('link', { name: /متابعة الدفع/ }).click()
    await expect(page).toHaveURL(/\/checkout/)

    await completeCheckoutFlow(page, testCustomer)
  })

  test('customer can complete checkout with a different city', async ({
    page,
  }) => {
    await gotoProduct(page, defaultProduct)
    await addCurrentProductToCart(page)

    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    await completeCheckoutFlow(page, secondCustomer)
  })

  // ═══ 🎁 اختبارات جديدة ═══

  test('customer cannot skip delivery step without filling required fields', async ({
    page,
  }) => {
    await gotoProduct(page, defaultProduct)
    await addCurrentProductToCart(page)

    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    // اضغط "التالي" بدون ما تملأ أي حقل
    await clickNext(page)

    // ⭐ المفروض نفضل على step 1
    const stepBar = page.locator('.co-steps .co-step')
    await expect(stepBar.nth(0)).toHaveClass(/on/)
    // والمفروض ما نكونش على step 2
    await expect(stepBar.nth(1)).not.toHaveClass(/on/)
  })

  test('customer can send gift to a different recipient', async ({ page }) => {
    await gotoProduct(page, defaultProduct)
    await addCurrentProductToCart(page)

    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    // Step 1: بيانات التوصيل
    await fillDeliveryStep(page, giftCustomer)

    // Step 2: المستلم
    await clickNext(page)
    await fillRecipientStep(
      page,
      giftCustomer.recipientName!,
      giftCustomer.recipientPhone!,
    )

    // Step 3: الدفع
    await clickNext(page)
    await selectPayment(page)

    // Step 4: المراجعة + التأكيد
    await clickNext(page)
    await confirmOrder(page)
    await expectOrderSuccess(page)
  })

  test('customer can add engraved message and see it in cart', async ({
    page,
  }) => {
    const MESSAGE = 'كل عام وأنت بخير'

    // ضيف منتج مع العبارة
    await gotoProduct(page, defaultProduct)
    await addCurrentProductWithMessageToCart(page, MESSAGE)

    // ⭐ المفروض نوصل لصفحة السلة
    await expect(page).toHaveURL(/\/cart/)
    await expectCartItemCount(page, 1)

    // ⭐ العبارة ظاهرة في السلة
    await expect(page.getByText(MESSAGE)).toBeVisible()
  })
})