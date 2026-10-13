import { test, expect } from '@playwright/test'
import {
  gotoProduct,
  addCurrentProductToCart,
} from '../helpers/products'
import {
  gotoCart,
  expectCartItemCount,
  expectEmptyCart,
  removeFirstCartItem,
  changeFirstItemQty,
  proceedToCheckout,
  clearCartViaStorage,
} from '../helpers/cart'
import { defaultProduct, testProducts } from '../fixtures/products'

test.describe('Customer — Product to Cart Journey', () => {
  // ⭐ كل اختبار يبدأ بسلة فاضية
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearCartViaStorage(page)
  })

  test('empty cart shows empty-state message', async ({ page }) => {
    await gotoCart(page)
    await expectEmptyCart(page)
  })

  test('customer can add a product to cart and see it', async ({ page }) => {
    // 1) افتح صفحة المنتج
    await gotoProduct(page, defaultProduct)

    // 2) تأكد إن الصفحة اتحمّلت (مش "المنتج غير موجود")
    await expect(page.getByText('المنتج غير موجود')).not.toBeVisible()

    // 3) اضغط "أضف إلى السلة" (الكود هيعمل redirect تلقائي للـ cart)
    await addCurrentProductToCart(page)

    // 4) تأكد إن في عنصر واحد في السلة
    await expectCartItemCount(page, 1)

    // 5) تأكد إن ملخص الطلب ظاهر
    await expect(page.getByText('ملخص الطلب')).toBeVisible()
  })

  test('customer can add two different products', async ({ page }) => {
    const [first, second] = testProducts

    // المنتج الأول
    await gotoProduct(page, first)
    await addCurrentProductToCart(page)
    await expectCartItemCount(page, 1)

    // المنتج التاني — مختلف
    await gotoProduct(page, second)
    await addCurrentProductToCart(page)
    await expectCartItemCount(page, 2)
  })

  test('customer can remove a product from cart', async ({ page }) => {
    // ضيف منتج
    await gotoProduct(page, defaultProduct)
    await addCurrentProductToCart(page)
    await expectCartItemCount(page, 1)

    // شيله
    await removeFirstCartItem(page)

    // المفروض السلة تبقى فاضية
    await expectEmptyCart(page)
  })

  test('customer can increase item quantity', async ({ page }) => {
    // ضيف منتج
    await gotoProduct(page, defaultProduct)
    await addCurrentProductToCart(page)

    // اقف على أول عنصر
    const firstItem = page.locator('.cart-item').first()
    const qtyBefore = await firstItem.locator('.qty span').innerText()

    // اضغط +
    await changeFirstItemQty(page, +1)

    // اقف على القيمة الجديدة
    const qtyAfter = await firstItem.locator('.qty span').innerText()

    // ⭐ المفروض الرقم اتغير
    expect(qtyAfter).not.toBe(qtyBefore)
  })

  test('customer can proceed from cart to checkout', async ({ page }) => {
    // ضيف منتج
    await gotoProduct(page, defaultProduct)
    await addCurrentProductToCart(page)

    // اضغط "متابعة الدفع"
    await proceedToCheckout(page)

    // المفروض نوصل لصفحة الـ checkout
    await expect(page).toHaveURL(/\/checkout/)
  })
})