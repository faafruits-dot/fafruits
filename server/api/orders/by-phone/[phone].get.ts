import { useSupabaseAdmin } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  const phone = getRouterParam(event, 'phone')
  if (!phone) throw createError({ statusCode: 400, statusMessage: 'رقم الجوال مطلوب' })

  /* ⭐ نظّف الرقم — نشيل أي حاجة مش رقم */
  const cleaned = String(phone).replace(/\D/g, '')
  if (cleaned.length < 7) {
    throw createError({ statusCode: 400, statusMessage: 'رقم غير صحيح' })
  }

  const supabase = useSupabaseAdmin()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      customer_name,
      customer_phone,
      area,
      street,
      delivery_date,
      slot,
      total,
      payment_method,
      status,
      notes,
      chef_sent_at,
      driver_sent_at,
      delivered_at,
      created_at,
      updated_at,
      items:order_items(
        id,
        product_id,
        product_name,
        product_img,
        qty,
        unit_price,
        line_total,
        extras:order_item_extras(
          id,
          extra_id,
          extra_name,
          price,
          input_value
        )
      )
    `)
    .eq('customer_phone', cleaned)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[by-phone] error:', error)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    ok: true,
    phone: cleaned,
    orders: orders ?? []
  }
})