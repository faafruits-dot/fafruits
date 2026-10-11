/* ═══════════════════════════════════════════════════════════
   مدن التوصيل — FA Fruits
   ═══════════════════════════════════════════════════════════ */

export interface City {
  id: string
  name_ar: string
  fee: number
}

/* ═══ قائمة المناطق والأسعار ═══ */
export const CITIES: City[] = [
  { id: 'mutlaa',                     name_ar: 'المطلاع',                 fee: 3 },
  { id: 'umm_al_haiman',              name_ar: 'أم الهيمان',              fee: 3 },
  { id: 'sabah_al_ahmad_residential', name_ar: 'صباح الأحمد السكنية',     fee: 4 },
  { id: 'khairan_chalets',            name_ar: 'شاليهات الخيران',         fee: 7 },
  { id: 'sabah_al_ahmad_sea',         name_ar: 'صباح الأحمد البحرية',     fee: 7 },
  { id: 'kabd',                       name_ar: 'كبد',                     fee: 3 },
  { id: 'hajan',                      name_ar: 'الهجن',                   fee: 3 },
  { id: 'other_areas',                name_ar: 'مناطق أخرى',              fee: 1 },
]

/* ═══ المنطقة الافتراضية ═══ */
export const DEFAULT_CITY: City =
  CITIES.find((c) => c.id === 'mutlaa') ?? CITIES[0]