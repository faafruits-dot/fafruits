import { test, expect } from '@playwright/test'


test('customer can open FA Fruits homepage', async ({ page }) => {

  // فتح الصفحة الرئيسية
  await page.goto('/')


  // التأكد أن الصفحة اشتغلت
  await expect(page).toHaveURL('/')


  // التأكد أن الصفحة ليست Error
  await expect(
    page.locator('body')
  ).not.toContainText('404')


  await expect(
    page.locator('body')
  ).not.toContainText('500')


})