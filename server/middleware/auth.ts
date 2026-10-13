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
   ⭐ methods: لتحديد أي HTTP method يحتاج حماية
      لو مش محددة → كل الميثودز محمية
   ═══════════════════════════════════════════════════ */
interface ProtectedRoute {
  regex: RegExp;
  methods?: string[];
}

const PROTECTED_PATHS: ProtectedRoute[] = [
  // ⭐ GET فقط — عرض الطلبات في الداشبورد
  //    POST عام → لإنشاء طلب من العميل
  { regex: /^\/api\/orders($|\?)/, methods: ['GET'] },

  { regex: /^\/api\/orders\/[^/]+\/mark-chef-sent/ },
  { regex: /^\/api\/orders\/[^/]+\/mark-driver-sent/ },
  { regex: /^\/api\/orders\/[^/]+\/deliver/ },
  { regex: /^\/api\/auth\/team\/me/ },
  { regex: /^\/api\/settings\.patch/ },
  { regex: /^\/api\/products\/[^/]+\.patch/ },
];

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;
  const method = event.method;

  /* ⭐ مش API → تجاهل */
  if (!path.startsWith('/api/')) return;

  /* ⭐ مسار عام → اسمح فورًا */
  const isPublic = PUBLIC_PATHS.some((r) => r.test(path));
  if (isPublic) return;

  /* ⭐ ابحث عن قاعدة حماية تطابق المسار + الـ method */
  const isProtected = PROTECTED_PATHS.some((rule) => {
    if (!rule.regex.test(path)) return false;
    if (rule.methods && !rule.methods.includes(method)) return false;
    return true;
  });

  /* ⭐ مسار غير محمي → اسمح */
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