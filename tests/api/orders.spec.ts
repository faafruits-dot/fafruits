import { test, expect } from '@playwright/test'
import { testCustomer } from '../fixtures/customer'
import { defaultProduct } from '../fixtures/products'

const API_BASE = 'http://localhost:3000'

/**
 * helper داخلي: يبني body طلب صحيح.
 */
function buildOrderBody(overrides: Partial<any> = {}) {
  return {
    customer_name: testCustomer.name,
    customer_phone: testCustomer.phone,
    area: testCustomer.area,
    street: testCustomer.street,
    delivery_date: new Date().toISOString().slice(0, 10),
    slot: testCustomer.slot,
    payment_method: 'knet',
    notes: '',
    subtotal: 42,
    extras_total: 0,
    delivery_fee: 3,
    total: 45,
    items: [
      {
        product_id: defaultProduct.id,
        product_name: 'لمّة العائلة',
        product_img: defaultProduct.image,
        qty: 1,
        unit_price: 42,
        line_total: 42,
        extras: [],
      },
    ],
    ...overrides,
  }
}

test.describe('API — Orders', () => {
      test.describe.configure({ mode: 'serial' })
  test('POST /api/orders with valid data returns 200', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/orders`, {
      data: buildOrderBody(),
    })

    expect(res.status()).toBe(200)

    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.order_id).toBeTruthy()
    expect(typeof json.order_id).toBe('string')
  })

  test('POST /api/orders without customer_name returns 400', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/orders`, {
      data: buildOrderBody({ customer_name: '' }),
    })

    expect(res.status()).toBe(400)
  })

  test('POST /api/orders without items returns 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/orders`, {
      data: buildOrderBody({ items: [] }),
    })

    expect(res.status()).toBe(400)
  })

  test('POST /api/orders with invalid phone returns 400', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/orders`, {
      data: buildOrderBody({ customer_phone: '123' }), // أقل من 7 أرقام
    })

    expect(res.status()).toBe(400)
  })

  test('POST /api/orders without address returns 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/orders`, {
      data: buildOrderBody({ area: '', street: '' }),
    })

    expect(res.status()).toBe(400)
  })

  test('GET /api/orders/track/{id} returns order data', async ({ request }) => {
    // 1) أنشئ طلب
    const createRes = await request.post(`${API_BASE}/api/orders`, {
      data: buildOrderBody(),
    })
    expect(createRes.status()).toBe(200)
    const { order_id } = await createRes.json()

    // 2) تتبعه (public endpoint)
    const trackRes = await request.get(
      `${API_BASE}/api/orders/track/${order_id}`,
    )
    expect(trackRes.status()).toBe(200)

    const trackJson = await trackRes.json()
    expect(trackJson).toBeTruthy()
    // ⭐ نتأكد إن الرد فيه بيانات الطلب (شكل الرد ممكن يختلف)
    expect(JSON.stringify(trackJson)).toContain(order_id)
  })

  test('GET /api/orders/{id} without auth returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/orders/FAKE-ID`)
    // ⭐ محمي — بدون كوكي fa_session
    expect(res.status()).toBe(401)
  })
})