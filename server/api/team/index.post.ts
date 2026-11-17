// server/api/team/index.post.ts
import { useSupabaseAdmin } from '../../utils/supabase'
import { requireTeam, hashPassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const team = await requireTeam(event)
  const body = await readBody(event)

  const phone = String(body?.phone || '').replace(/\D/g, '')
  const name  = String(body?.name || '').trim()
  const role  = String(body?.role || '').trim()

  /* ═══ التحقق ═══ */
  if (!phone || phone.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'رقم الجوال غير صالح' })
  }
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'الاسم مطلوب' })
  }
  if (!['chef', 'driver'].includes(role)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'الدور يجب أن يكون chef أو driver'
    })
  }

  const supabase = useSupabaseAdmin()

  /* ═══ تحقق من عدم التكرار ═══ */
  const { data: existing } = await supabase
    .from('team')
    .select('phone')
    .eq('phone', phone)
    .maybeSingle()

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'رقم الجوال مسجّل بالفعل' })
  }

  /* ═══ كلمة مرور عشوائية ═══ */
  const dummyPassword = Math.random().toString(36).slice(2, 12) + Date.now()
  const passwordHash = await hashPassword(dummyPassword)

  const { data, error } = await supabase
    .from('team')
    .insert({
      phone,
      name,
      role,
      password_hash: passwordHash,
      active: false   // لا يمكنه تسجيل الدخول
    })
    .select('phone, name, role, active, created_at')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true, member: data }
})