import { useSupabaseAdmin } from '../../../utils/supabase'
import { requireTeam, logOrderEvent } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const team = await requireTeam(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'معرّف الطلب مطلوب' })

  const supabase = useSupabaseAdmin()

  const { data: order, error: fetchErr } = await supabase
    .from('orders')
    .select('id, status, chef_sent_at')
    .eq('id', id)
    .single()

  if (fetchErr || !order) {
    throw createError({ statusCode: 404, statusMessage: 'الطلب غير موجود' })
  }

  if (order.status !== 'new') {
    throw createError({ statusCode: 400, statusMessage: 'الحالة الحالية لا تسمح بالتحضير' })
  }

  if (!order.chef_sent_at) {
    throw createError({ statusCode: 400, statusMessage: 'يجب إبلاغ الشيف أولاً' })
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from('orders')
    .update({ status: 'sent_to_chef', updated_at: now })
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await logOrderEvent(id, 'started_preparation', team.phone)

  return { ok: true }
})