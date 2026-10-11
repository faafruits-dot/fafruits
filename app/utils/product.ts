// utils/product.ts
import type { Product } from '~/composables/useProducts'

export function productTitle(p: Product | null | undefined): string {
  if (!p) return ''
  // 1) الاسم التسويقي لو موجود
  if (p.name_ar) return p.name_ar
  // 2) الـ mood
  if (p.mood) return p.mood
  // 3) fallback
  return `طبق فواكه ${p.id.toUpperCase()}`
}