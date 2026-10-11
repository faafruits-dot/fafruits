import { useSupabaseAdmin } from '../../../utils/supabase'
import { requireTeam, logOrderEvent } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const team = await requireTeam(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'معرّف الطلب مطلوب' })

  const supabase = useSupabaseAdmin()

  const { data: order, error: fetchErr } = await supabase
    .from('orders')
    .select('id, status, driver_sent_at')
    .eq('id', id)
    .single()

  if (fetchErr || !order) {
    throw createError({ statusCode: 404, statusMessage: 'الطلب غير موجود' })
  }

  if (order.status !== 'sent_to_chef') {
    throw createError({ statusCode: 400, statusMessage: 'يجب بدء التحضير أولاً' })
  }

  if (!order.driver_sent_at) {
    throw createError({ statusCode: 400, statusMessage: 'يجب إبلاغ المندوب أولاً' })
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from('orders')
    .update({ status: 'sent_to_driver', updated_at: now })
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await logOrderEvent(id, 'on_the_way', team.phone)

  return { ok: true }
})