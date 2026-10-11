import { useSupabaseAdmin } from '../../utils/supabase'
import { requireTeam } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireTeam(event)

  const query = getQuery(event)
  const supabase = useSupabaseAdmin()

  let q = supabase
    .from('orders')
    .select(`
      id, customer_name, customer_phone, area, street,
      delivery_date, slot, total, payment_method, status, notes,
      chef_sent_at, driver_sent_at, created_at, updated_at,
      items:order_items(
        id, product_id, product_name, product_img, qty, unit_price, line_total,
        extras:order_item_extras(id, extra_id, extra_name, price, input_value)
      )
    `)
    .order('created_at', { ascending: false })

  if (query.status) q = q.eq('status', String(query.status))
  if (query.from)   q = q.gte('created_at', String(query.from))
  if (query.to)     q = q.lte('created_at', String(query.to))

  const limit = Math.min(Number(query.limit) || 100, 500)
  q = q.limit(limit)

  const { data, error } = await q
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { ok: true, orders: data ?? [] }
})