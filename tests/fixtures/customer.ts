/**
 * عملاء تجريبيون لاختبارات الـ Checkout في FA Fruits.
 *
 * المدن مطابقة لـ app/data/cities.ts:
 *   المطلاع، أم الهيمان، صباح الأحمد السكنية، شاليهات الخيران،
 *   صباح الأحمد البحرية، كبد، الهجن، مناطق أخرى
 */

export interface CustomerFixture {
  name: string
  phone: string           // بصيغة 965XXXXXXXX
  area: string            // الاسم العربي (يطابق CITIES.name_ar)
  areaId?: string         // ⭐ اختياري: ID المنطقة (يطابق CITIES.id)
  street: string
  slot: string            // وقت التوصيل
  recipientName?: string
  recipientPhone?: string
}

/**
 * القيم الافتراضية للتوصيل — مطابقة لـ slots في checkout.vue
 */
export const DEFAULT_SLOT = '١م — ٤م'

/**
 * عميل أساسي — المطلاع (المنطقة الافتراضية في المشروع).
 */
export const testCustomer: CustomerFixture = {
  name: 'أحمد السالم',
  phone: '96550001234',
  area: 'المطلاع',
  areaId: 'mutlaa',
  street: 'شارع سالم المبارك، مبنى 5، شقة 12',
  slot: DEFAULT_SLOT,
}

/**
 * عميل ثاني — أم الهيمان.
 */
export const secondCustomer: CustomerFixture = {
  name: 'فاطمة العنزي',
  phone: '96550005678',
  area: 'أم الهيمان',
  areaId: 'umm_al_haiman',
  street: 'شارع تونس، مبنى 22',
  slot: '٤م — ٧م',
}

/**
 * هدية لشخص آخر — كبد.
 */
export const giftCustomer: CustomerFixture = {
  name: 'أحمد السالم',
  phone: '96550001234',
  area: 'كبد',
  areaId: 'kabd',
  street: 'شارع 4، مبنى 8',
  slot: '٧م — ١٠م',
  recipientName: 'منى العلي',
  recipientPhone: '96599998888',
}

/**
 * بيانات غير صحيحة — لاختبار Validation.
 */
export const invalidCustomer: CustomerFixture = {
  name: '',
  phone: '',
  area: '',
  street: '',
  slot: '',
}