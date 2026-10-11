// server/api/team/my-phone.post.ts
import { useSupabaseAdmin } from '../../utils/supabase'
import { requireTeam } from '../../utils/auth'

const SESSION_COOKIE = 'fa_session'
const SESSION_TTL_HOURS = 24 * 7

export default defineEventHandler(async (event) => {
  const auth = await requireTeam(event)
  const body = await readBody(event)

  const newPhone = String(body?.newPhone || '').replace(/\D/g, '')
  const password = String(body?.password || '')

  /* ═══ التحقق ═══ */
  if (!newPhone || newPhone.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'رقم الجوال الجديد غير صالح' })
  }
  if (newPhone === auth.phone) {
    throw createError({
      statusCode: 400,
      statusMessage: 'الرقم الجديد مطابق للرقم الحالي'
    })
  }
  if (!password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'كلمة المرور مطلوبة للتأكيد'
    })
  }

  const supabase = useSupabaseAdmin()

  /* ═══ تحقق من كلمة المرور ═══ */
  const { data: me, error: fetchErr } = await supabase
    .from('team')
    .select('phone, name, role, password_hash')
    .eq('phone', auth.phone)
    .single()

  if (fetchErr || !me) {
    throw createError({ statusCode: 404, statusMessage: 'الحساب غير موجود' })
  }

  const { verifyPassword } = await import('../../utils/auth')
  const ok = await verifyPassword(password, me.password_hash)
  if (!ok) {
    throw createError({
      statusCode: 401,
      statusMessage: 'كلمة المرور غير صحيحة'
    })
  }

  /* ═══ تحقق من عدم استخدام الرقم الجديد ═══ */
  const { data: taken } = await supabase
    .from('team')
    .select('phone')
    .eq('phone', newPhone)
    .maybeSingle()

  if (taken) {
    throw createError({
      statusCode: 409,
      statusMessage: 'الرقم الجديد مستخدم بالفعل'
    })
  }

  /* ═══ الحصول على التوكن الحالي ═══ */
  const currentToken = getCookie(event, SESSION_COOKIE)

  /* ═══ تحديث الفريق (FK cascade يحدّث الجلسات) ═══ */
  const { error: updateErr } = await supabase
    .from('team')
    .update({ phone: newPhone, updated_at: new Date().toISOString() })
    .eq('phone', auth.phone)

  if (updateErr) {
    throw createError({ statusCode: 500, statusMessage: updateErr.message })
  }

  /* ═══ إعادة تعيين الـ cookie لو التوكن اتأثر ═══ */
  if (currentToken) {
    // FK cascade بيحدّث team_phone تلقائيًا — التوكن لسه صالح
    // لكن نجدده للتأكد
    setCookie(event, SESSION_COOKIE, currentToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_TTL_HOURS * 3600,
      path: '/'
    })
  }

  return {
    ok: true,
    phone: newPhone,
    message: 'تم تحديث رقمك بنجاح'
  }
})