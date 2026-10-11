// server/api/team/index.get.ts
import { useSupabaseAdmin } from '../../utils/supabase'
import { requireTeam } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireTeam(event)
  const supabase = useSupabaseAdmin()

  const allowedRoles = auth.role === 'admin'
    ? ['admin', 'assistant', 'chef', 'driver']
    : ['chef', 'driver']

  try {
    const { data, error } = await supabase
      .from('team')
      .select('phone, name, role, active, created_at, updated_at')
      .in('role', allowedRoles)
      .order('role', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    const all = Array.isArray(data) ? data : []

    const notifyNumbers = all.filter((m: any) =>
      m?.role === 'chef' || m?.role === 'driver'
    )

    return {
      ok: true,
      all,
      notifyNumbers,
      total: all.length
    }
  } catch (e: any) {
    /* ⭐ نرجع مصفوفات فاضية بدل ما نكسر الفرونت */
    return {
      ok: true,
      all: [],
      notifyNumbers: [],
      total: 0,
      _error: e?.message
    }
  }
})