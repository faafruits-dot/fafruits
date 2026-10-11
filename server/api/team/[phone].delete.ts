// server/api/team/[phone].delete.ts
import { useSupabaseAdmin } from '../../utils/supabase'
import { requireTeam } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireTeam(event)

  const phone = String(getRouterParam(event, 'phone') || '').replace(/\D/g, '')
  if (!phone) throw createError({ statusCode: 400, statusMessage: 'الرقم مطلوب' })

  /* ⭐ ما يقدروش يحذفوا نفسهم */
  if (phone === auth.phone) {
    throw createError({ statusCode: 400, statusMessage: 'لا يمكنك حذف حسابك' })
  }

  const supabase = useSupabaseAdmin()

  /* ═══ جلب العضو ═══ */
  const { data: target, error: fetchErr } = await supabase
    .from('team')
    .select('phone, name, role')
    .eq('phone', phone)
    .single()

  if (fetchErr || !target) {
    throw createError({ statusCode: 404, statusMessage: 'العضو غير موجود' })
  }

  /* ═══ صلاحيات الحذف ═══ */
  // الأدمن: يقدر يحذف أي حد (إلا نفسه)
  // المساعد: يقدر يحذف chef/driver فقط
  if (auth.role !== 'admin') {
    if (target.role === 'admin' || target.role === 'assistant') {
      throw createError({
        statusCode: 403,
        statusMessage: 'غير مصرّح — يمكنك حذف أرقام الشيف والمندوب فقط'
      })
    }
  }

  /* ⭐ حذف الجلسات أولاً */
  await supabase.from('team_sessions').delete().eq('team_phone', phone)

  const { error } = await supabase.from('team').delete().eq('phone', phone)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { ok: true }
})