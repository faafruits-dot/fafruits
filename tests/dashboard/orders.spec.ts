import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/login'
import { adminUser } from '../fixtures/admin'
import {
  gotoDashboardOrders,
  expectOrdersPageLoaded,
  getOrdersCount,
  openFirstOrder,
  expectOrderDetailsVisible,
} from '../helpers/dashboard-orders'

test.describe('Dashboard — Orders', () => {
  test.beforeEach(async ({ page, context }) => {
    // ⭐ كل اختبار يبدأ بمتصفح نضيف
    await context.clearCookies()
    await loginAsAdmin(page, adminUser)
  })

  test('admin can access orders page', async ({ page }) => {
    await gotoDashboardOrders(page)
    await expectOrdersPageLoaded(page)
  })

  test('orders page displays list of orders', async ({ page }) => {
    await gotoDashboardOrders(page)
    await expectOrdersPageLoaded(page)

    const count = await getOrdersCount(page)
    console.log(`[ORDERS] Found ${count} orders`)
    expect(count).toBeGreaterThan(0)
  })

  test('admin can open order details', async ({ page }) => {
    await gotoDashboardOrders(page)
    await expectOrdersPageLoaded(page)

    // تأكد إن في طلبات
    const count = await getOrdersCount(page)
    expect(count).toBeGreaterThan(0)

    await openFirstOrder(page)
    await expectOrderDetailsVisible(page)
  })
})