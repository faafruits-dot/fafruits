// server/middleware/auth.ts
import { useSupabaseAdmin } from '../utils/supabase';

/* ═══════════════════════════════════════════════════
   المسارات العامة — بدون تسجيل دخول
   ═══════════════════════════════════════════════════ */
const PUBLIC_PATHS: RegExp[] = [
  /^\/api\/test-supabase/,
  /^\/api\/auth\/team\/login/,
  /^\/api\/auth\/team\/logout/,
  /^\/api\/products($|\/|\?)/,
  /^\/api\/styles($|\/|\?)/,
  /^\/api\/extras($|\/|\?)/,
  /^\/api\/settings($|\?)/,
  /^\/api\/orders\/track\//,
  /^\/api\/orders\/by-phone\//,
];

/* ═══════════════════════════════════════════════════
   المسارات المحمية — تحتاج auth
   ═══════════════════════════════════════════════════ */
const PROTECTED_PATHS: RegExp[] = [
  /^\/api\/orders($|\?)/,          // GET — عرض الطلبات في الداشبورد
  /^\/api\/orders\/[^/]+\/mark-chef-sent/,
  /^\/api\/orders\/[^/]+\/mark-driver-sent/,
  /^\/api\/orders\/[^/]+\/deliver/,
  /^\/api\/auth\/team\/me/,
  /^\/api\/settings\.patch/,
  /^\/api\/products\/[^/]+\.patch/,  // PATCH المنتجات
];

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;

  /* ⭐ مش API → تجاهل */
  if (!path.startsWith('/api/')) return;

  /* ⭐ مسار عام → اسمح فورًا */
  const isPublic = PUBLIC_PATHS.some((r) => r.test(path));
  if (isPublic) return;

  /* ⭐ مسار مش محمي صراحة → اسمح (افتراضي) */
  const isProtected = PROTECTED_PATHS.some((r) => r.test(path));
  if (!isProtected) return;

  /* ⭐ من هنا → مسار محمي، نتحقق من الجلسة */
  const token = getCookie(event, 'fa_session');
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized — الرجاء تسجيل الدخول',
    });
  }

  const sb = useSupabaseAdmin();
  const { data, error } = await sb
    .from('team_sessions')
    .select('team_phone, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (error || !data) {
    throw createError({ statusCode: 401, statusMessage: 'جلسة غير صالحة' });
  }

  if (new Date(data.expires_at) < new Date()) {
    throw createError({ statusCode: 401, statusMessage: 'انتهت الجلسة' });
  }

  /* ⭐ احفظ بيانات الفريق في الـ context */
  event.context.team = { phone: data.team_phone };
});