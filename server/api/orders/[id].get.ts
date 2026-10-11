import { useSupabaseAdmin } from '../../utils/supabase'
import { requireTeam } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireTeam(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'معرّف الطلب مطلوب' })

  const supabase = useSupabaseAdmin()

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*, extras:order_item_extras(*))
    `)
    .eq('id', id)
    .single()

  if (error || !order) {
    throw createError({ statusCode: 404, statusMessage: 'الطلب غير موجود' })
  }

  const { data: events } = await supabase
    .from('order_events')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: true })

  return { ok: true, order, events: events ?? [] }
})