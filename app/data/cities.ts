export interface City {
  id: string
  name_ar: string
  zone: 1 | 2 | 3           // 1 = قريب، 2 = متوسط، 3 = بعيد
  fee: number               // بالدينار
}

export const CITIES: City[] = [
  // ═══ المنطقة 1 — قريبة (1 د.ك) ═══
  { id: 'kuwait-city',   name_ar: 'مدينة الكويت',   zone: 1, fee: 1 },
  { id: 'hawalli',       name_ar: 'حولي',           zone: 1, fee: 1 },
  { id: 'salmiya',       name_ar: 'السالمية',       zone: 1, fee: 1 },
  { id: 'salwa',         name_ar: 'سلوى',           zone: 1, fee: 1 },
  { id: 'ruhathiya',     name_ar: 'الرقة',          zone: 1, fee: 1 },
  { id: 'shamiya',       name_ar: 'الشامية',        zone: 1, fee: 1 },
  { id: 'kaifan',        name_ar: 'كيفان',          zone: 1, fee: 1 },
  { id: 'sharq',         name_ar: 'شرق',            zone: 1, fee: 1 },
  { id: 'qibla',         name_ar: 'القبلة',         zone: 1, fee: 1 },
  { id: 'mirqab',        name_ar: 'المرقاب',        zone: 1, fee: 1 },

  // ═══ المنطقة 2 — متوسطة (1.5 د.ك) ═══
  { id: 'farwaniya',     name_ar: 'الفروانية',      zone: 2, fee: 1.5 },
  { id: 'khaitan',       name_ar: 'خيطان',          zone: 2, fee: 1.5 },
  { id: 'jleeb',         name_ar: 'جليب الشيوخ',    zone: 2, fee: 1.5 },
  { id: 'ardiya',        name_ar: 'العارضية',       zone: 2, fee: 1.5 },
  { id: 'sabah-alsalem', name_ar: 'صباح السالم',    zone: 2, fee: 1.5 },
  { id: 'mubarak',       name_ar: 'مبارك الكبير',   zone: 2, fee: 1.5 },
  { id: 'sabah-nasser',  name_ar: 'صباح الناصر',    zone: 2, fee: 1.5 },
  { id: 'fintas',        name_ar: 'الفنطاس',        zone: 2, fee: 1.5 },
  { id: 'mangaf',        name_ar: 'المنقف',         zone: 2, fee: 1.5 },
  { id: 'abu-halifa',    name_ar: 'أبو حليفة',      zone: 2, fee: 1.5 },

  // ═══ المنطقة 3 — بعيدة (2 د.ك) ═══
  { id: 'ahmadi',        name_ar: 'الأحمدي',        zone: 3, fee: 2 },
  { id: 'fahaheel',      name_ar: 'الفحيحيل',       zone: 3, fee: 2 },
  { id: 'mahboula',      name_ar: 'المهبولة',       zone: 3, fee: 2 },
  { id: 'jahra',         name_ar: 'الجهراء',        zone: 3, fee: 2 },
  { id: 'sulaibiya',     name_ar: 'الصليبية',       zone: 3, fee: 2 },
  { id: 'wafra',         name_ar: 'الوفرة',         zone: 3, fee: 2 },
  { id: 'kabad',         name_ar: 'كبد',            zone: 3, fee: 2 },
  { id: 'sabah-ahmad',   name_ar: 'صباح الأحمد',    zone: 3, fee: 2 },
]

export const DEFAULT_CITY = CITIES[0]  // مدينة الكويت