/**
 * منتجات تجريبية من كتالوج FA Fruits.
 *
 * ⚠️ ملاحظة مهمة:
 * الـ IDs الحقيقية في المشروع بحروف **صغيرة** (p01, p02, ...).
 * استخرجناها من /collections، وموجودة في:
 *   public/images/products/p01.png ... p78.png
 *
 * total = 78 منتج متاح.
 */

export interface ProductFixture {
  id: string              // مثل: 'p01'
  slug: string            // المسار: /product/p01
  image: string           // /images/products/p01.png
}

/**
 * منتجات مُتحقَّق من وجودها في:
 * public/images/products/p01.png … p78.png
 */
export const testProducts: ProductFixture[] = [
  { id: 'p01', slug: 'p01', image: '/images/products/p01.png' },
  { id: 'p02', slug: 'p02', image: '/images/products/p02.png' },
  { id: 'p03', slug: 'p03', image: '/images/products/p03.png' },
  { id: 'p04', slug: 'p04', image: '/images/products/p04.png' },
  { id: 'p05', slug: 'p05', image: '/images/products/p05.png' },
]

/**
 * المنتج الافتراضي لاختبارات السلة والـ Checkout.
 */
export const defaultProduct = testProducts[0] // p01

/**
 * منتج بديل للاختبارات.
 */
export const singleProduct = defaultProduct

/**
 * المدن المتاحة للتوصيل — مأخوذة من app/data/cities.ts
 */
export const KUWAIT_CITIES = [
  'السالمية',
  'حولي',
  'الجابرية',
  'الفروانية',
  'الجهراء',
  'الأحمدي',
] as const

export type KuwaitCity = (typeof KUWAIT_CITIES)[number]

/**
 * أوقات التوصيل — مأخوذة حرفيًا من checkout.vue → slots
 */
export const DELIVERY_SLOTS = [
  '١٠ص — ١م',
  '١م — ٤م',
  '٤م — ٧م',
  '٧م — ١٠م',
] as const

export type DeliverySlot = (typeof DELIVERY_SLOTS)[number]