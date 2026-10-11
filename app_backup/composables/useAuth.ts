/* =========================================================
   useAuth — المصادقة وإدارة الفريق (v2 — إصلاح SSR)
   ========================================================= */

export type UserRole = 'admin' | 'chef' | 'driver' | 'accountant'

export interface TeamMember {
  phone: string
  passwordHash: string
  name: string
  role: UserRole
  active: boolean
  createdAt: number
}

export interface Session {
  phone: string
  name: string
  role: UserRole
  startedAt: number
  expiresAt: number
}

const TEAM_KEY = 'fa_dash_team_v2'
const SESSION_KEY = 'fa_dash_session'

/* ============ HASH ============ */
function hash(str: string): string {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i)
    h = h & 0xffffffff
  }
  return 'fa_' + Math.abs(h).toString(36)
}

/* ============ SEED ============ */
const SEED_USERS: Array<{ phone: string; password: string; name: string; role: UserRole }> = [
  { phone: '96550001111', password: 'admin123',  name: 'محمد المدير',   role: 'admin' },
  { phone: '96550002222', password: 'chef123',   name: 'الشيف أحمد',    role: 'chef' },
  { phone: '96550003333', password: 'driver123', name: 'المندوب خالد',  role: 'driver' },
  { phone: '96550004444', password: 'money123',  name: 'سارة المحاسبة', role: 'accountant' }
]

function seedTeam(): TeamMember[] {
  return SEED_USERS.map(u => ({
    phone: u.phone,
    passwordHash: hash(u.password),
    name: u.name,
    role: u.role,
    active: true,
    createdAt: Date.now()
  }))
}

/* ⭐ تحميل الفريق من localStorage (يُستدعى في كل عملية) */
function loadTeamFromStorage(): TeamMember[] {
  if (!process.client) return []
  try {
    const raw = localStorage.getItem(TEAM_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {}
  /* مفيش بيانات — ازرع الافتراضية */
  const seeded = seedTeam()
  try { localStorage.setItem(TEAM_KEY, JSON.stringify(seeded)) } catch {}
  return seeded
}

/* =========================================================
   useAuth
   ========================================================= */
export function useAuth() {
  /* ============ STATE ============ */
  const user = useState<Session | null>('auth-user', () => {
    if (process.client) {
      try {
        const raw = localStorage.getItem(SESSION_KEY)
        if (!raw) return null
        const sess = JSON.parse(raw) as Session
        if (sess.expiresAt && sess.expiresAt < Date.now()) {
          localStorage.removeItem(SESSION_KEY)
          return null
        }
        return sess
      } catch { return null }
    }
    return null
  })

  /* ⭐ STATE مع تهيئة صحيحة على الـ client */
  const team = useState<TeamMember[]>('auth-team', () => {
    if (process.client) {
      return loadTeamFromStorage()
    }
    return []
  })

  /* ============ PERSIST ============ */
  const persistTeam = () => {
    if (process.client) {
      try { localStorage.setItem(TEAM_KEY, JSON.stringify(team.value)) } catch {}
    }
  }

  const persistSession = (sess: Session | null) => {
    if (!process.client) return
    try {
      if (sess) localStorage.setItem(SESSION_KEY, JSON.stringify(sess))
      else localStorage.removeItem(SESSION_KEY)
    } catch {}
  }

  /* ============ AUTH ============ */
  const login = (phone: string, password: string): { ok: boolean; error?: string; user?: Session } => {
    const clean = String(phone).replace(/\D/g, '')

    /* ⭐ إعادة تحميل team من localStorage لو فاضي */
    if (process.client && team.value.length === 0) {
      team.value = loadTeamFromStorage()
    }

    /* لو لسه فاضي، ازرع */
    if (team.value.length === 0) {
      team.value = seedTeam()
      persistTeam()
    }

    const found = team.value.find(u => u.phone === clean)
    if (!found) return { ok: false, error: 'رقم الجوال غير مسجل' }
    if (!found.active) return { ok: false, error: 'الحساب معطّل — تواصل مع الإدارة' }
    if (found.passwordHash !== hash(password)) return { ok: false, error: 'كلمة المرور غير صحيحة' }

    const sess: Session = {
      phone: found.phone,
      name: found.name,
      role: found.role,
      startedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    }
    user.value = sess
    persistSession(sess)
    return { ok: true, user: sess }
  }

  const logout = () => {
    user.value = null
    persistSession(null)
  }

  /* ============ TEAM ============ */
  const addMember = (data: { phone: string; password: string; name: string; role: UserRole }): { ok: boolean; error?: string } => {
    if (process.client && team.value.length === 0) team.value = loadTeamFromStorage()
    const clean = String(data.phone).replace(/\D/g, '')
    if (team.value.some(u => u.phone === clean)) return { ok: false, error: 'رقم الجوال مسجل مسبقاً' }
    team.value.push({
      phone: clean,
      passwordHash: hash(data.password),
      name: data.name,
      role: data.role,
      active: true,
      createdAt: Date.now()
    })
    persistTeam()
    return { ok: true }
  }

  const updateMember = (phone: string, patch: { name?: string; role?: UserRole; active?: boolean; password?: string }): { ok: boolean } => {
    if (process.client && team.value.length === 0) team.value = loadTeamFromStorage()
    const idx = team.value.findIndex(u => u.phone === phone)
    if (idx === -1) return { ok: false }
    const newPatch: Partial<TeamMember> = { ...patch }
    if (patch.password) {
      newPatch.passwordHash = hash(patch.password)
      delete (newPatch as any).password
    }
    team.value[idx] = { ...team.value[idx], ...newPatch }
    persistTeam()
    return { ok: true }
  }

  const deleteMember = (phone: string) => {
    if (process.client && team.value.length === 0) team.value = loadTeamFromStorage()
    team.value = team.value.filter(u => u.phone !== phone)
    persistTeam()
  }

  const findMember = (phone: string) => {
    if (process.client && team.value.length === 0) team.value = loadTeamFromStorage()
    return team.value.find(u => u.phone === phone)
  }

  return {
    user, team,
    login, logout,
    addMember, updateMember, deleteMember, findMember,
    hash
  }
}

/* =========================================================
   CONSTANTS
   ========================================================= */
export const ROLE_HOME: Record<string, string> = {
  admin: 'today',
  chef: 'preparation',
  driver: 'delivery',
  accountant: 'reports'
}

export const SCREENS_BY_ROLE: Record<string, string[]> = {
  admin:      ['today', 'orders', 'products', 'availability', 'reports', 'users'],
  chef:       ['preparation'],
  driver:     ['delivery'],
  accountant: ['reports', 'orders']
}

export const ROLE_LABEL: Record<string, string> = {
  admin: 'مدير النظام',
  chef: 'المطبخ',
  driver: 'التوصيل',
  accountant: 'المحاسبة'
}