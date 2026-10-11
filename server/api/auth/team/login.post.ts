import { useSupabaseAdmin } from '../../../utils/supabase'
import { verifyPassword, createSession } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const phone = String(body?.phone || '').replace(/\D/g, '')
  const password = String(body?.password || '')

  if (!phone || !password) {
    throw createError({ statusCode: 400, statusMessage: 'رقم الجوال وكلمة المرور مطلوبة' })
  }

  const supabase = useSupabaseAdmin()
  const { data: member, error } = await supabase
    .from('team')
    .select('phone, name, role, password_hash, active')
    .eq('phone', phone)
    .single()

  if (error || !member) {
    throw createError({ statusCode: 401, statusMessage: 'رقم الجوال أو كلمة المرور غير صحيحة' })
  }

  if (!member.active) {
    throw createError({ statusCode: 403, statusMessage: 'الحساب معطّل' })
  }

  const ok = await verifyPassword(password, member.password_hash)
  if (!ok) {
    throw createError({ statusCode: 401, statusMessage: 'رقم الجوال أو كلمة المرور غير صحيحة' })
  }

  await createSession(event, member.phone)

  return {
    ok: true,
    team: { phone: member.phone, name: member.name, role: member.role }
  }
})