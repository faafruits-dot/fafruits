// المتوقع في seed.ts
export const OCCASIONS = [
  { id: 'birthday',    icon: 'cake',            name: 'عيد ميلاد',   count: 45, filter: 'عيد ميلاد', cta: 'احتفل الآن' },
  { id: 'wedding',     icon: 'gem',             name: 'زواج',         count: 22, filter: 'زواج',       cta: 'بارك لهم' },
  { id: 'newbaby',     icon: 'baby',            name: 'مولود جديد',   count: 15, filter: 'مولود',      cta: 'هنّئهم' },
  { id: 'graduation',  icon: 'graduation-cap',  name: 'تخرج',         count: 18, filter: 'تخرج',       cta: 'احتفل بنجاحه' },
  { id: 'anniversary', icon: 'heart',           name: 'ذكرى زواج',    count: 30, filter: 'ذكرى',       cta: 'جدّد الذكرى' },
  { id: 'ramadan',     icon: 'moon',            name: 'رمضان',        count: 25, filter: 'رمضان',      cta: 'شارك الفرحة' },
  { id: 'justbecause', icon: 'sparkles',        name: 'بدون مناسبة',  count: 20, filter: 'زيارة',      cta: 'فاجئهم' }
]

export const SHAPES = [
  { id:'circle',  icon:'circle',   name:'دائري',   desc:'الأكثر طلباً' },
  { id:'heart',   icon:'heart',    name:'قلب',     desc:'للحب والذكرى' },
  { id:'tower',   icon:'triangle', name:'برج',     desc:'للمناسبات الكبيرة' },
  { id:'rect',    icon:'square',   name:'مستطيل',  desc:'هدايا الشركات' },
  { id:'bouquet', icon:'flower',   name:'باقة',    desc:'للمفاجآت' },
  { id:'number',  icon:'hash',     name:'رقم',     desc:'أعياد الميلاد' },
  { id:'letter',  icon:'type',     name:'حرف',     desc:'تصاميم مخصصة' },
  { id:'skewer',  icon:'minus',    name:'سيخ',     desc:'للتقديم السريع' }
]

export const SHAPE_META: Record<string, { title: string; line: string }> = {
  circle:  { title:'الدائرة الذهبية', line:'الأكثر طلبًا · تكفي ٤–٦ أشخاص' },
  heart:   { title:'قلب الحبيب',      line:'للحب والذكرى · تكفي ٤–٦ أشخاص' },
  tower:   { title:'البرج الملكي',    line:'للمناسبات الكبيرة · ٦–٨ أشخاص' },
  rect:    { title:'المستطيل الرخامي', line:'هدايا الشركات والضيافة · ٨–١٠' },
  bouquet: { title:'باقة الفرح',      line:'للمفاجآت · تكفي ٣–٥ أشخاص' },
  number:  { title:'رقمك المميّز',    line:'اكتب عمره واحتفل · ٦–٨ أشخاص' },
  letter:  { title:'حرفك المميّز',    line:'اسم من تحب بفواكه · ٦–٨ أشخاص' },
  skewer:  { title:'سيخ الفواكه',     line:'للتقديم السريع · ١–٢ أشخاص' }
}

export interface Product {
  id: string
  img: string
  price: number
  serving: string
  shape: string
  ready: boolean
  best: boolean
  luxury: boolean
  occ: string[]
  fruits: string[]
  grad: string
  rating: number
  reviews: number
  mood?: string
}

export const DEFAULT_PRODUCTS: Product[] = [
  { id:'p1',  img:'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=600', price:29.5, serving:'٤–٦ أشخاص', shape:'tower', ready:true,  best:true,  luxury:false, occ:['عيد ميلاد','زيارة','ذكرى'], fruits:['عنب','فراولة','كيوي','أناناس'], grad:'grad-1', rating:4.9, reviews:128, mood:'لبدايات مشرقة' },
  { id:'p2',  img:'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=600', price:22.0, serving:'٢–٤ أشخاص', shape:'heart', ready:true,  best:true,  luxury:false, occ:['ذكرى','عيد ميلاد'], fruits:['فراولة','توت','عنب'], grad:'grad-2', rating:5.0, reviews:96, mood:'لقلوب عاشقة' },
  { id:'p3',  img:'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?q=80&w=600', price:45.0, serving:'٦–٨ أشخاص', shape:'tower', ready:false, best:true,  luxury:true,  occ:['زواج','تخرج','شركات'], fruits:['أناناس','شمام','كيوي','عنب','فراولة'], grad:'grad-4', rating:4.8, reviews:74, mood:'للمناسبات الكبرى' },
  { id:'p4',  img:'https://images.unsplash.com/photo-1596544754039-2d8e8e8e8e8e?q=80&w=600', price:38.0, serving:'٤–٦ أشخاص', shape:'rect', ready:true,  best:false, luxury:true,  occ:['رمضان','زيارة'], fruits:['تمر','رطب','فراولة','عنب'], grad:'grad-5', rating:4.9, reviews:52, mood:'لروح رمضان' },
  { id:'p5',  img:'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600', price:26.5, serving:'٣–٥ أشخاص', shape:'bouquet', ready:true,  best:false, luxury:false, occ:['مولود','زيارة'], fruits:['عنب','تفاح','كيوي'], grad:'grad-3', rating:4.7, reviews:41, mood:'لبشائر الفرح' },
  { id:'p6',  img:'https://images.unsplash.com/photo-1629811298079-1b6c92a28c9e?q=80&w=600', price:33.0, serving:'٤–٦ أشخاص', shape:'rect', ready:true,  best:false, luxury:false, occ:['تخرج','عيد ميلاد'], fruits:['أناناس','عنب','كيوي','فراولة'], grad:'grad-4', rating:4.8, reviews:63, mood:'لنجاح يستحق' },
  { id:'p7',  img:'https://images.unsplash.com/photo-1537151377170-9c19a7918141?q=80&w=600', price:52.0, serving:'٨–١٠ أشخاص',shape:'tower', ready:false, best:false, luxury:true,  occ:['زواج','ذكرى'], fruits:['عنب','فراولة','كيوي','أناناس','شمام'], grad:'grad-2', rating:5.0, reviews:38, mood:'لعرس لا يُنسى' },
  { id:'p8',  img:'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?q=80&w=600', price:18.5, serving:'٢–٤ أشخاص', shape:'circle', ready:true,  best:true,  luxury:false, occ:['زيارة','شركات'], fruits:['برتقال','تفاح','عنب'], grad:'grad-1', rating:4.6, reviews:210, mood:'لضيافة يومية' },
  { id:'p9',  img:'https://images.unsplash.com/photo-1549007994-0a76acf0c7a1?q=80&w=600', price:31.0, serving:'٤–٦ أشخاص', shape:'rect', ready:true, best:false, luxury:true,  occ:['عيد ميلاد','ذكرى','شركات'], fruits:['شوكولاتة','فراولة','عنب'], grad:'grad-6', rating:4.9, reviews:88, mood:'لمزاج راقي' },
  { id:'p10', img:'https://images.unsplash.com/photo-1615485291234-9d4c9e8e6e8e?q=80&w=600', price:65.0, serving:'١٠–١٢ شخص',shape:'rect', ready:false, best:false, luxury:true,  occ:['شركات','تخرج'], fruits:['متنوع فاخر','أناناس','عنب','كيوي'], grad:'grad-5', rating:4.9, reviews:29, mood:'لكبار الضيوف' },
  { id:'p11', img:'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=600', price:36.0, serving:'٣–٥ أشخاص', shape:'heart', ready:true, best:false, luxury:false, occ:['ذكرى','عيد ميلاد'], fruits:['شوكولاتة','فراولة','توت'], grad:'grad-6', rating:4.8, reviews:57, mood:'لذكرى تستحق' },
  { id:'p12', img:'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=600', price:14.0, serving:'١–٢ شخص',  shape:'circle', ready:true,  best:false, luxury:false, occ:['زيارة','شركات'], fruits:['تفاح','برتقال','عنب'], grad:'grad-3', rating:4.5, reviews:143, mood:'لمسة سريعة' },
  { id:'p13', img:'https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=600', price:55.0, serving:'٦–٨ أشخاص', shape:'number', ready:false, best:true, luxury:true, occ:['عيد ميلاد','تخرج'], fruits:['فراولة','كيوي','عنب','أناناس'], grad:'grad-4', rating:5.0, reviews:42, mood:'لعمر جديد' },
  { id:'p14', img:'https://images.unsplash.com/photo-1549007994-0a76acf0c7a1?q=80&w=600', price:18.0, serving:'٢–٣ أشخاص', shape:'skewer', ready:true, best:true, luxury:false, occ:['ذكرى','عيد ميلاد'], fruits:['شوكولاتة','فراولة'], grad:'grad-6', rating:4.9, reviews:115, mood:'لتغميس ممتع' },
  { id:'p15', img:'https://images.unsplash.com/photo-1596544754039-2d8e8e8e8e8e?q=80&w=600', price:15.0, serving:'٢–٤ أشخاص', shape:'skewer', ready:true, best:false, luxury:false, occ:['زيارة','شركات'], fruits:['شوكولاتة','عنب','أناناس'], grad:'grad-3', rating:4.7, reviews:88, mood:'لمشاركة خفيفة' },
  { id:'p16', img:'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=600', price:35.0, serving:'٤–٦ أشخاص', shape:'heart', ready:true, best:true, luxury:true, occ:['ذكرى','زواج'], fruits:['شوكولاتة','فراولة','توت'], grad:'grad-2', rating:5.0, reviews:64, mood:'لفرح مضاعف' }
]

export const PRODUCT_EXTRAS = [
  { id:'message',   icon:'card',     name:'إضافة عبارة',      desc:'على بطاقة أنيقة', price:3, hasInput:true },
  { id:'juice',     icon:'cup-soda', name:'بوكس عصير صغير', desc:'٤ عصائر طازجة',   price:3 },
  { id:'chocolate', icon:'cookie',   name:'صوص شوكولاتة',     desc:'صوص فاخر',        price:2 }
]

export const WHATSAPP_NUMBER = '96551180015'
export const DELIVERY_FEE = 1
export const FREE_DELIVERY_THRESHOLD = 40

export const GIFT_MOMENTS = [
  { id:'celebration', icon:'party-popper', name:'لحظة احتفال', line:'أعياد الميلاد والنجاحات', color:'#ffb020' },
  { id:'love',        icon:'heart',        name:'لحظة حب',      line:'ذكرى، زواج، اعتراف',     color:'#e94a63' },
  { id:'surprise',    icon:'gift',         name:'لحظة مفاجأة',  line:'بدون مناسبة، زيارة',     color:'#7c5cff' },
  { id:'formal',      icon:'briefcase',    name:'لحظة رسمية',   line:'شركات وضيافة',           color:'#2fbf9b' }
]

export const GIFT_WHO = [
  { id:'mom',    icon:'flower',    name:'الوالدة',         color:'#e94a63' },
  { id:'wife',   icon:'heart',     name:'الزوجة/الحبيبة',  color:'#d43a52' },
  { id:'friend', icon:'users',     name:'صديق/صديقة',      color:'#2fbf9b' },
  { id:'boss',   icon:'briefcase', name:'المدير/زميل',     color:'#7c5cff' },
  { id:'kids',   icon:'baby',      name:'طفل',             color:'#ffb020' },
  { id:'other',  icon:'gift',      name:'آخر',             color:'#f59a23' }
]

export const GIFT_BUDGETS = [
  { id:'low',  name:'حتى ٢٠ د.ك',   min:0,  max:20 },
  { id:'mid',  name:'٢٠ — ٣٥ د.ك', min:20, max:35 },
  { id:'high', name:'٣٥ — ٥٥ د.ك', min:35, max:55 },
  { id:'lux',  name:'أكثر من ٥٥ د.ك', min:55, max:9999 }
]