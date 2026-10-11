// server/api/auth/team/change-password.post.ts
import { useSupabaseAdmin } from '../../../utils/supabase'
import {
  requireTeam,
  hashPassword,
  verifyPassword
} from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireTeam(event)
  const body = await readBody(event)

  const currentPassword = String(body?.currentPassword || '')
  const newPassword = String(body?.newPassword || '')

  /* ═══ التحقق ═══ */
  if (!currentPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'كلمة المرور الحالية مطلوبة'
    })
  }
  if (!newPassword || newPassword.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'
    })
  }
  if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'كلمة المرور يجب أن تحتوي على حروف وأرقام'
    })
  }
  if (newPassword === currentPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'كلمة المرور الجديدة مطابقة للحالية'
    })
  }

  const supabase = useSupabaseAdmin()

  /* ═══ جلب الحساب ═══ */
  const { data: me, error: fetchErr } = await supabase
    .from('team')
    .select('phone, password_hash')
    .eq('phone', auth.phone)
    .single()

  if (fetchErr || !me) {
    throw createError({ statusCode: 404, statusMessage: 'الحساب غير موجود' })
  }

  /* ═══ التحقق من كلمة المرور الحالية ═══ */
  const ok = await verifyPassword(currentPassword, me.password_hash)
  if (!ok) {
    throw createError({
      statusCode: 401,
      statusMessage: 'كلمة المرور الحالية غير صحيحة'
    })
  }

  /* ═══ تحديث ═══ */
  const newHash = await hashPassword(newPassword)
  const { error } = await supabase
    .from('team')
    .update({
      password_hash: newHash,
      updated_at: new Date().toISOString()
    })
    .eq('phone', auth.phone)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true, message: 'تم تغيير كلمة المرور بنجاح' }
})