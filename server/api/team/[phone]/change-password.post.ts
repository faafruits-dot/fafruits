// server/api/team/[phone]/change-password.post.ts
import { useSupabaseAdmin } from '../../../utils/supabase'
import {
  requireTeam,
  hashPassword,
  verifyPassword
} from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireTeam(event)
  const targetPhone = String(getRouterParam(event, 'phone') || '').replace(/\D/g, '')

  if (!targetPhone) {
    throw createError({ statusCode: 400, statusMessage: 'رقم الجوال مطلوب' })
  }

  const body = await readBody(event)
  const currentPassword = String(body?.currentPassword || '')
  const newPassword = String(body?.newPassword || '')

  /* ═══ التحقق ═══ */
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

  const isSelf = auth.phone === targetPhone
  const isAdmin = auth.role === 'admin'

  /* ═══ الصلاحيات ═══ */
  if (!isSelf && !isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'غير مصرّح — فقط المدير أو صاحب الحساب'
    })
  }

  const supabase = useSupabaseAdmin()

  /* ═══ جلب العضو ═══ */
  const { data: target, error: fetchErr } = await supabase
    .from('team')
    .select('phone, name, role, password_hash, active')
    .eq('phone', targetPhone)
    .single()

  if (fetchErr || !target) {
    throw createError({ statusCode: 404, statusMessage: 'العضو غير موجود' })
  }

  /* ═══ التحقق من كلمة المرور الحالية (فقط لو بيغيّر حسابه) ═══ */
  if (isSelf && !isAdmin) {
    if (!currentPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'كلمة المرور الحالية مطلوبة'
      })
    }
    const ok = await verifyPassword(currentPassword, target.password_hash)
    if (!ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'كلمة المرور الحالية غير صحيحة'
      })
    }
  }

  /* ⭐ لو المدير بيغيّر لنفسه، يتحقق كذلك */
  if (isSelf && isAdmin && currentPassword) {
    const ok = await verifyPassword(currentPassword, target.password_hash)
    if (!ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'كلمة المرور الحالية غير صحيحة'
      })
    }
  }

  /* ═══ تحديث كلمة المرور ═══ */
  const newHash = await hashPassword(newPassword)
  const now = new Date().toISOString()

  const { error: updateErr } = await supabase
    .from('team')
    .update({ password_hash: newHash, updated_at: now })
    .eq('phone', targetPhone)

  if (updateErr) {
    throw createError({ statusCode: 500, statusMessage: updateErr.message })
  }

  /* ⭐ لو المدير بيغيّر لغيره، نبطّل كل جلساته (إلا لو نفس الحساب) */
  if (!isSelf) {
    await supabase
      .from('team_sessions')
      .delete()
      .eq('team_phone', targetPhone)
  }

  return {
    ok: true,
    message: isSelf
      ? 'تم تغيير كلمة مرورك بنجاح'
      : `تم تعيين كلمة مرور جديدة لـ ${target.name}`
  }
})