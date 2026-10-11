import { useSupabaseAdmin } from '../../../utils/supabase'
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'رقم الطلب مطلوب' })

  const supabase = useSupabaseAdmin()

  const { data: order, error } = await supabase
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
    .eq('id', id)
    .single()

  if (error || !order) {
    throw createError({ statusCode: 404, statusMessage: 'لم يتم العثور على الطلب' })
  }

  /* ⭐ اجلب أحداث الطلب للـ timeline */
  const { data: events } = await supabase
    .from('order_events')
    .select('event, created_at, note')
    .eq('order_id', id)
    .order('created_at', { ascending: true })

  return {
    ok: true,
    order,
    events: events ?? []
  }
})