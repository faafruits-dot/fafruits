import { useSupabaseAdmin } from '../../utils/supabase'
import { requireAdmin } from '../../utils/auth'

const ALLOWED = [
  'img', 'price', 'mood', 'occ', 'best', 'luxury', 'ready', 'available',
  'rating', 'reviews', 'grad', 'name_ar', 'description'
]

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'معرّف المنتج مطلوب' })

  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'بيانات غير صالحة' })
  }

  const updates: Record<string, any> = {}
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED.includes(k)) updates[k] = v
  }

  if (!Object.keys(updates).length) {
    throw createError({ statusCode: 400, statusMessage: 'مافيش حقول صالحة' })
  }

  updates.updated_at = new Date().toISOString()

  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { ok: true, product: data }
})