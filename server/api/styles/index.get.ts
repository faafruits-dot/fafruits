// server/api/styles/index.get.ts
import { useSupabaseAdmin } from '../../utils/supabase'

export default defineEventHandler(async () => {
  const supabase = useSupabaseAdmin()

  const { data: styles, error } = await supabase
    .from('product_styles')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const { data: links } = await supabase
    .from('product_style_links')
    .select('style_id')

  const counts: Record<string, number> = {}
  links?.forEach(l => {
    counts[l.style_id] = (counts[l.style_id] || 0) + 1
  })

  return {
    ok: true,
    styles: (styles || []).map(s => ({
      ...s,
      products_count: counts[s.id] || 0
    }))
  }
})