import { useSupabaseAdmin } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'معرّف المنتج مطلوب' })

  const supabase = useSupabaseAdmin()

  const { data: links } = await supabase
    .from('product_style_links')
    .select('style_id')
    .eq('product_id', id)

  const styleIds = (links || []).map(l => l.style_id)
  if (!styleIds.length) return { ok: true, styles: [] }

  const { data: styles } = await supabase
    .from('product_styles')
    .select('*')
    .in('id', styleIds)
    .eq('is_active', true)
    .order('sort_order')

  return { ok: true, styles: styles || [] }
})