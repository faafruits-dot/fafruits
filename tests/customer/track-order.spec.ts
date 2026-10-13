import { test, expect } from '@playwright/test'
import { gotoProduct, addCurrentProductToCart } from '../helpers/products'
import { expectCartItemCount, clearCartViaStorage } from '../helpers/cart'
import { defaultProduct } from '../fixtures/products'
import { testCustomer } from '../fixtures/customer'
import { completeCheckoutFlow } from '../helpers/checkout'
import {
  extractOrderIdFromSuccess,
  gotoTrackPage,
  lookupOrdersByPhone,
} from '../helpers/track'

test.describe('Customer — Order Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearCartViaStorage(page)
  })

  test('customer can view order tracking page after checkout', async ({
    page,
  }) => {
    // 1) اعمل طلب كامل
    await gotoProduct(page, defaultProduct)
    await addCurrentProductToCart(page)
    await expectCartItemCount(page, 1)

    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    await completeCheckoutFlow(page, testCustomer)

    // 2) خد رقم الطلب من الـ URL
    const orderId = await extractOrderIdFromSuccess(page)
    expect(orderId).toBeTruthy()
    console.log(`[TRACK] Order created: ${orderId}`)

    // 3) روح لصفحة التتبع
    await gotoTrackPage(page, orderId!)

    // 4) تأكد إن الصفحة بتعرض بيانات الطلب
    //    ⭐ لازم نلاقي رقم الطلب ظاهر
    await expect(page.getByText(orderId!)).toBeVisible({ timeout: 10_000 })
  })

  test('customer can lookup orders by phone number', async ({ page }) => {
    // 1) اعمل طلب كامل
    await gotoProduct(page, defaultProduct)
    await addCurrentProductToCart(page)
    await expectCartItemCount(page, 1)

    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    await completeCheckoutFlow(page, testCustomer)

    // 2) خد رقم الطلب
    const orderId = await extractOrderIdFromSuccess(page)
    expect(orderId).toBeTruthy()

    // 3) روح لصفحة البحث عن الطلبات
    await lookupOrdersByPhone(page, testCustomer.phone)

    // 4) تأكد إن الطلب ظاهر في القائمة
    await expect(page.getByText(orderId!)).toBeVisible({ timeout: 10_000 })
  })
})