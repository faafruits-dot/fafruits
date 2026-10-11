// server/utils/auth.ts
// server/utils/auth.ts
import { createHmac, timingSafeEqual, randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import type { H3Event } from 'h3'
import { useSupabaseAdmin } from './supabase'   // ⭐ السطر الناقص

const SESSION_COOKIE = 'fa_session'
const SESSION_TTL_HOURS = 24 * 7
// ... باقي الملف زي ما هو

export interface TeamMember {
  phone: string
  name: string
  role: 'admin' | 'assistant'
}

/* ═══════════════════════════════════════════
   تشفير كلمة المرور
   ═══════════════════════════════════════════ */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/* ═══════════════════════════════════════════
   توليد token
   ═══════════════════════════════════════════ */
export function generateToken(): string {
  return randomBytes(48).toString('hex')
}

/* ═══════════════════════════════════════════
   إنشاء جلسة جديدة
   ═══════════════════════════════════════════ */
export async function createSession(
  event: H3Event,
  teamPhone: string
): Promise<string> {
  const supabase = useSupabaseAdmin()
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000)

  const { error } = await supabase
    .from('team_sessions')
    .insert({
      token,
      team_phone: teamPhone,
      user_agent: getHeader(event, 'user-agent') || null,
      ip: getRequestIP(event, { xForwardedFor: true }) || null,
      expires_at: expiresAt.toISOString()
    })

  if (error) throw error

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_HOURS * 3600,
    path: '/'
  })

  return token
}

/* ═══════════════════════════════════════════
   قراءة الجلسة الحالية
   ═══════════════════════════════════════════ */
export async function getCurrentTeam(event: H3Event): Promise<TeamMember | null> {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null

  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase
    .from('team_sessions')
    .select('team_phone, expires_at, team(phone, name, role, active)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) return null

  const team = Array.isArray((data as any).team)
    ? (data as any).team[0]
    : (data as any).team

  if (!team || !team.active) return null

  return {
    phone: team.phone,
    name: team.name,
    role: team.role
  }
}

/* ═══════════════════════════════════════════
   حذف الجلسة (logout)
   ═══════════════════════════════════════════ */
export async function destroySession(event: H3Event): Promise<void> {
  const token = getCookie(event, SESSION_COOKIE)
  if (token) {
    const supabase = useSupabaseAdmin()
    await supabase.from('team_sessions').delete().eq('token', token)
  }
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

/* ═══════════════════════════════════════════
   الحماية
   ═══════════════════════════════════════════ */
export async function requireTeam(event: H3Event): Promise<TeamMember> {
  const team = await getCurrentTeam(event)
  if (!team) {
    throw createError({ statusCode: 401, statusMessage: 'غير مصرّح — سجّل الدخول' })
  }
  return team
}

export async function requireAdmin(event: H3Event): Promise<TeamMember> {
  const team = await requireTeam(event)
  if (team.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'هذه العملية للأدمن فقط' })
  }
  return team
}

/* ═══════════════════════════════════════════
   تسجيل حدث في order_events
   ═══════════════════════════════════════════ */
export async function logOrderEvent(
  orderId: string,
  event: string,
  actorPhone: string,
  note?: string
): Promise<void> {
  const supabase = useSupabaseAdmin()
  await supabase.from('order_events').insert({
    order_id: orderId,
    event,
    actor_phone: actorPhone,
    note: note || null
  })
}