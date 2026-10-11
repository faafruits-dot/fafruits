import { useSupabaseAdmin } from '../../utils/supabase'

interface IncomingItem {
  product_id: string
  product_name: string
  product_img: string
  qty: number
  unit_price: number
  line_total: number
  extras?: Array<{
    extra_id: string
    extra_name: string
    price: number
    input_value?: string | null
  }>
}

interface IncomingOrder {
  customer_name: string
  customer_phone: string
  area: string
  street: string
  delivery_date: string
  slot: string
  payment_method: string
  notes?: string
  subtotal: number
  extras_total: number
  delivery_fee: number
  total: number
  items: IncomingItem[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<IncomingOrder>(event)

  /* ═══ تحقق أساسي ═══ */
  if (!body?.customer_name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'اسم العميل مطلوب' })
  }
  const phone = String(body.customer_phone || '').replace(/\D/g, '')
  if (phone.length < 7) {
    throw createError({ statusCode: 400, statusMessage: 'رقم الجوال غير صحيح' })
  }
  if (!body.area?.trim() || !body.street?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'العنوان مطلوب' })
  }
  if (!Array.isArray(body.items) || !body.items.length) {
    throw createError({ statusCode: 400, statusMessage: 'الطلب فارغ' })
  }

  const supabase = useSupabaseAdmin()

  /* ═══ 1) upsert عميل ═══ */
  const { data: existing } = await supabase
    .from('customers')
    .select('phone, orders_count')
    .eq('phone', phone)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('customers')
      .update({
        name: body.customer_name,
        area: body.area,
        street: body.street,
        last_order_at: new Date().toISOString(),
        orders_count: (existing.orders_count || 0) + 1
      })
      .eq('phone', phone)
  } else {
    await supabase
      .from('customers')
      .insert({
        phone,
        name: body.customer_name,
        area: body.area,
        street: body.street,
        orders_count: 1
      })
  }

  /* ═══ 2) ولّد رقم الطلب ═══ */
  const { data: idData, error: idErr } = await supabase.rpc('generate_order_id')
  if (idErr || !idData) {
    throw createError({
      statusCode: 500,
      statusMessage: `فشل توليد رقم الطلب: ${idErr?.message || 'unknown'}`
    })
  }
  const orderId = idData as string

  /* ═══ 3) أنشئ الطلب ═══ */
  const { error: orderErr } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      customer_phone: phone,
      customer_name: body.customer_name,
      area: body.area,
      street: body.street,
      delivery_date: body.delivery_date || new Date().toISOString().slice(0, 10),
      slot: body.slot || '',
      subtotal: body.subtotal,
      extras_total: body.extras_total || 0,
      delivery_fee: body.delivery_fee || 0,
      total: body.total,
      payment_method: body.payment_method || 'knet',
      status: 'new',
      notes: body.notes || null
    })

  if (orderErr) {
    throw createError({ statusCode: 500, statusMessage: `فشل إنشاء الطلب: ${orderErr.message}` })
  }

  /* ═══ 4) أضف العناصر + الإضافات ═══ */
  for (const it of body.items) {
    const { data: itemRow, error: itemErr } = await supabase
      .from('order_items')
      .insert({
        order_id: orderId,
        product_id: it.product_id,
        product_name: it.product_name,
        product_img: it.product_img,
        qty: it.qty,
        unit_price: it.unit_price,
        line_total: it.line_total
      })
      .select('id')
      .single()

    if (itemErr) {
      console.error('[order_items] error:', itemErr)
      continue
    }

    if (it.extras?.length && itemRow?.id) {
      const extrasRows = it.extras.map(e => ({
        order_item_id: itemRow.id,
        extra_id: e.extra_id,
        extra_name: e.extra_name,
        price: e.price,
        input_value: e.input_value || null
      }))
      await supabase.from('order_item_extras').insert(extrasRows)
    }
  }

  /* ═══ 5) سجل الحدث ═══ */
  await supabase.from('order_events').insert({
    order_id: orderId,
    event: 'created',
    actor_phone: phone,
    note: null
  })

  return {
    ok: true,
    order_id: orderId,
    message: `تم إنشاء الطلب #${orderId} بنجاح`
  }
})