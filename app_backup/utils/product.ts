import { SHAPES, SHAPE_META, type Product } from '~/data/seed'

export function shapeInfo(id: string) {
  if (!id) return null
  const meta = SHAPE_META[id]
  const base = SHAPES.find(s => s.id === id)
  if (!meta && !base) return null
  return {
    id,
    icon: base?.icon || 'circle',
    name: base?.name || meta?.title || '',
    title: meta?.title || base?.name || '',
    line: meta?.line || base?.desc || ''
  }
}

export function productTitle(p: Partial<Product> | null | undefined): string {
  if (!p) return 'هدية فواكه'
  const shapeObj = shapeInfo(p.shape || '')
  const shapeName = shapeObj?.name || shapeObj?.title || ''
  const fruitsArr = (p.fruits || []).slice(0, 2)
  const fruitsTxt = fruitsArr.join('، ')
  if (shapeName && fruitsTxt) return `${shapeName} · ${fruitsTxt}`
  if (shapeName) return shapeName
  if (fruitsTxt) return fruitsTxt
  return 'هدية فواكه'
}

export function productRef(p: Partial<Product> | null | undefined): string {
  if (!p?.id) return '—'
  return '#' + String(p.id).replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase()
}