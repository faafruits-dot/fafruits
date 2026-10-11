import { useSupabaseAdmin } from '../../../utils/supabase'
import { requireTeam, logOrderEvent } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const team = await requireTeam(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'معرّف الطلب مطلوب' })

  const supabase = useSupabaseAdmin()

  const { data: order, error: fetchErr } = await supabase
    .from('orders')
    .select('id, chef_sent_at, status')
    .eq('id', id)
    .single()

  if (fetchErr || !order) {
    throw createError({ statusCode: 404, statusMessage: 'الطلب غير موجود' })
  }

  // لو اتبعت قبل كده — ما نكرر
  if (order.chef_sent_at) {
    return { ok: true, sent_at: order.chef_sent_at, already: true }
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from('orders')
    .update({ chef_sent_at: now, updated_at: now })
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // ⚠️ ملاحظة: ما نغيّرش الـ status
  await logOrderEvent(id, 'chef_notified', team.phone)

  return { ok: true, sent_at: now }
})