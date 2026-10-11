// composables/useTeam.ts

/* ⭐ اسم مختلف عن الـ TeamMember في useAuth */
export type TeamRole = 'admin' | 'assistant' | 'chef' | 'driver'

export interface TeamRecord {
  phone: string
  name: string
  role: TeamRole
  active: boolean
  created_at?: string
  updated_at?: string
}

export const useTeam = () => {
  const allMembers    = useState<TeamRecord[]>('team-all', () => [])
  const notifyNumbers = useState<TeamRecord[]>('team-notify', () => [])
  const loginMembers  = useState<TeamRecord[]>('team-login', () => [])
  const loading       = useState<boolean>('team-loading', () => false)
  const error         = useState<string | null>('team-error', () => null)

  /* ═══ جلب الأعضاء ═══ */
  const load = async () => {
    loading.value = true
    error.value = null
    try {
      const fetcher = import.meta.server ? useRequestFetch() : $fetch
      const res = await fetcher<{
        ok: boolean
        all: TeamRecord[]
        notifyNumbers: TeamRecord[]
      }>('/api/team')

      /* ⭐ تأمين ضد undefined */
      const all = Array.isArray(res?.all) ? res.all : []
      const notif = Array.isArray(res?.notifyNumbers) ? res.notifyNumbers : []

      allMembers.value = all
      notifyNumbers.value = notif
      loginMembers.value = all.filter(
        (m: TeamRecord) => m.role === 'admin' || m.role === 'assistant'
      )
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'فشل تحميل الفريق'
      allMembers.value = []
      notifyNumbers.value = []
      loginMembers.value = []
    } finally {
      loading.value = false
    }
  }

  /* ═══ إضافة رقم إشعار ═══ */
  const addNotifyNumber = async (data: {
    name: string
    phone: string
    role: 'chef' | 'driver'
  }) => {
    const fetcher = import.meta.server ? useRequestFetch() : $fetch
    const res = await fetcher<{ ok: boolean; member: TeamRecord }>(
      '/api/team',
      { method: 'POST', body: data }
    )
    notifyNumbers.value.push(res.member)
    allMembers.value.push(res.member)
    return res.member
  }

  /* ═══ حذف عضو ═══ */
  const deleteMember = async (phone: string) => {
    const fetcher = import.meta.server ? useRequestFetch() : $fetch
    await fetcher(`/api/team/${phone}`, { method: 'DELETE' })
    notifyNumbers.value = notifyNumbers.value.filter(m => m.phone !== phone)
    allMembers.value = allMembers.value.filter(m => m.phone !== phone)
    loginMembers.value = loginMembers.value.filter(m => m.phone !== phone)
  }

  /* ═══ تغيير رقمي ═══ */
  const changeMyPhone = async (newPhone: string, password: string) => {
    const fetcher = import.meta.server ? useRequestFetch() : $fetch
    const res = await fetcher<{ ok: boolean; phone: string; message: string }>(
      '/api/team/my-phone',
      { method: 'POST', body: { newPhone, password } }
    )
    return res
  }

  /* ═══ تغيير كلمة مروري ═══ */
  const changeMyPassword = async (currentPassword: string, newPassword: string) => {
    const fetcher = import.meta.server ? useRequestFetch() : $fetch
    const res = await fetcher<{ ok: boolean; message: string }>(
      '/api/auth/team/change-password',
      { method: 'POST', body: { currentPassword, newPassword } }
    )
    return res
  }

  return {
    allMembers,
    notifyNumbers,
    loginMembers,
    loading,
    error,
    load,
    addNotifyNumber,
    deleteMember,
    changeMyPhone,
    changeMyPassword
  }
}