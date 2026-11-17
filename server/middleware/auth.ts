// server/middleware/auth.ts
import { useSupabaseAdmin } from '../utils/supabase';

interface PublicRoute {
  regex: RegExp;
  methods: string[];
}

const PUBLIC_ROUTES: PublicRoute[] = [
  { regex: /^\/api\/auth\/team\/(login|logout)$/, methods: ['POST'] },
  { regex: /^\/api\/products($|\/[^/]+(\/styles)?)$/, methods: ['GET'] },
  { regex: /^\/api\/styles($|\/[^/]+)$/, methods: ['GET'] },
  { regex: /^\/api\/extras$/, methods: ['GET'] },
  { regex: /^\/api\/settings$/, methods: ['GET'] },
  { regex: /^\/api\/orders$/, methods: ['POST'] },
  { regex: /^\/api\/orders\/track\/[^/]+$/, methods: ['GET'] },
  { regex: /^\/api\/orders\/by-phone\/[^/]+$/, methods: ['GET'] },
];

const ADMIN_ONLY_ROUTES: RegExp[] = [
  /^\/api\/team(\/|$)/,
  /^\/api\/settings$/,
  /^\/api\/products(\/|$)/,
  /^\/api\/styles(\/|$)/,
];

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;
  const method = event.method.toUpperCase();

  if (!path.startsWith('/api/')) return;

  const isPublic = PUBLIC_ROUTES.some(
    (route) => route.regex.test(path) && route.methods.includes(method)
  );
  if (isPublic) return;

  const token = getCookie(event, 'fa_session');
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized — الرجاء تسجيل الدخول',
    });
  }

  const sb = useSupabaseAdmin();

  const { data: session, error: sessionError } = await sb
    .from('team_sessions')
    .select('team_phone, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (sessionError || !session) {
    throw createError({ statusCode: 401, statusMessage: 'جلسة غير صالحة' });
  }

  if (new Date(session.expires_at) < new Date()) {
    throw createError({ statusCode: 401, statusMessage: 'انتهت الجلسة' });
  }

  const { data: member, error: memberError } = await sb
    .from('team')
    .select('phone, name, role')
    .eq('phone', session.team_phone)
    .maybeSingle();

  if (memberError || !member) {
    throw createError({ statusCode: 401, statusMessage: 'حساب الموظف غير موجود' });
  }

  const requiresAdmin = ADMIN_ONLY_ROUTES.some((regex) => regex.test(path));
  
  // ⭐ السماح للمساعد بقراءة (GET) وإضافة (POST) أرقام الشيف والمندوب على المسار الرئيسي /api/team
  const isAssistantTeamAllowed = 
    member.role === 'assistant' && 
    path === '/api/team' && 
    (method === 'GET' || method === 'POST');

  if (requiresAdmin && member.role !== 'admin' && !isAssistantTeamAllowed) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden — هذه العملية متاحة للمدير فقط',
    });
  }

  event.context.team = {
    phone: member.phone,
    name: member.name,
    role: member.role,
  };
});