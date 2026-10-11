<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'
import { productTitle, productRef } from '~/utils/product'
import { KD } from '~/utils/format'
import { SHAPES } from '~/data/seed'

definePageMeta({ layout: 'dashboard' })

const { products, add, update, remove, reset } = useProducts()

/* ============ KPI ============ */
const total = computed(() => products.value.length)
const availableCount = computed(() => products.value.filter(p => p.available !== false).length)
const disabledCount = computed(() => total.value - availableCount.value)
const luxuryCount = computed(() => products.value.filter(p => p.luxury).length)

/* ============ Search ============ */
const search = ref('')
const filtered = computed(() => {
  if (!search.value.trim()) return products.value
  const q = search.value.trim().toLowerCase()
  return products.value.filter(p => {
    const ref = productRef(p).toLowerCase()
    const mood = (p.mood || '').toLowerCase()
    const fruits = (p.fruits || []).join(' ').toLowerCase()
    const occ = (p.occ || []).join(' ').toLowerCase()
    return ref.includes(q) || mood.includes(q) || fruits.includes(q) || occ.includes(q)
  })
})

/* ============ Toggle Availability ============ */
const savedAvail = ref<Record<string, boolean>>({})
onMounted(() => {
  if (process.client) {
    try {
      savedAvail.value = JSON.parse(localStorage.getItem('fa_dash_availability') || '{}')
    } catch {}
  }
})
const isAvailable = (p: any) => savedAvail.value[p.id] !== false
const toggleAvailable = (p: any) => {
  const next = !isAvailable(p)
  savedAvail.value[p.id] = next
  if (process.client) {
    localStorage.setItem('fa_dash_availability', JSON.stringify(savedAvail.value))
  }
}

/* ============ Modal ============ */
const showModal = ref(false)
const editId = ref<string | null>(null)
const form = reactive({
  img: '', price: 0, serving: '', shape: '', rating: 5,
  occ: '', fruits: '', mood: '',
  ready: false, best: false, luxury: false,
  available: true
})

const previewTitle = computed(() => {
  const fruits = form.fruits.split(/[,،]/).map(s => s.trim()).filter(Boolean)
  if (!form.shape && !fruits.length) return '— يُولّد بعد اختيار الشكل والفواكه —'
  return productTitle({ shape: form.shape, fruits })
})

const openAdd = () => {
  editId.value = null
  Object.assign(form, {
    img: '', price: 0, serving: '', shape: '', rating: 5,
    occ: '', fruits: '', mood: '',
    ready: false, best: false, luxury: false,
    available: true
  })
  showModal.value = true
}

const openEdit = (p: any) => {
  editId.value = p.id
  Object.assign(form, {
    img: p.img, price: p.price, serving: p.serving || '', shape: p.shape || '',
    rating: p.rating || 5,
    occ: (p.occ || []).join('، '),
    fruits: (p.fruits || []).join('، '),
    mood: p.mood || '',
    ready: !!p.ready, best: !!p.best, luxury: !!p.luxury,
    available: p.available !== false
  })
  showModal.value = true
}

const save = () => {
  const split = (s: string) => s.split(/[,،]/).map(x => x.trim()).filter(Boolean)
  const data: any = {
    img: form.img,
    price: Number(form.price) || 0,
    serving: form.serving,
    shape: form.shape,
    rating: Number(form.rating) || 5,
    occ: split(form.occ),
    fruits: split(form.fruits),
    mood: form.mood,
    ready: form.ready,
    best: form.best,
    luxury: form.luxury
  }
  if (!data.img || !data.price || !data.shape) {
    alert('املأ الحقول المطلوبة (الصورة، السعر، الشكل)')
    return
  }
  if (editId.value) {
    update(editId.value, data)
  } else {
    add(data)
  }
  showModal.value = false
}

const confirmDelete = (p: any) => {
  if (confirm(`سيتم حذف "${productTitle(p)}" نهائياً. متابعة؟`)) {
    remove(p.id)
  }
}

const confirmReset = () => {
  if (confirm('سيتم حذف كل التعديلات والعودة للقائمة الافتراضية. متابعة؟')) {
    reset()
    if (process.client) {
      localStorage.removeItem('fa_dash_availability')
      savedAvail.value = {}
    }
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="dash-head">
      <h1>المنتجات</h1>
      <p>إدارة كتالوج المنتجات · {{ total }} منتج</p>
    </div>

    <!-- KPI Cards -->
    <div class="dash-kpis">
      <div class="dash-kpi">
        <span class="dash-kpi-icon"><i data-lucide="box" /></span>
        <div><b>{{ total }}</b><small>إجمالي المنتجات</small></div>
      </div>
      <div class="dash-kpi dash-kpi-ok">
        <span class="dash-kpi-icon"><i data-lucide="check-circle" /></span>
        <div><b>{{ availableCount }}</b><small>متاح للبيع</small></div>
      </div>
      <div class="dash-kpi dash-kpi-warn">
        <span class="dash-kpi-icon"><i data-lucide="x-circle" /></span>
        <div><b>{{ disabledCount }}</b><small>معطّل</small></div>
      </div>
      <div class="dash-kpi dash-kpi-money">
        <span class="dash-kpi-icon"><i data-lucide="crown" /></span>
        <div><b>{{ luxuryCount }}</b><small>منتج فاخر</small></div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="pm-toolbar">
      <div class="dash-search pm-search">
        <i data-lucide="search" />
        <input v-model="search" type="search" placeholder="ابحث باسم المنتج أو الرقم..." />
      </div>
      <button class="dash-btn dash-btn-primary pm-add-btn" @click="openAdd">
        <i data-lucide="plus" /> <span>إضافة منتج</span>
      </button>
    </div>

    <!-- Reset button -->
    <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
      <button class="dash-btn dash-btn-ghost" style="padding:8px 14px;font-size:.82rem" @click="confirmReset">
        <i data-lucide="rotate-ccw" /> إعادة تعيين
      </button>
    </div>

    <!-- Grid -->
    <div v-if="filtered.length" class="pm-grid">
      <div v-for="p in filtered" :key="p.id" :class="['pm-card', isAvailable(p) ? 'is-on' : 'is-off']">
        <!-- Image + badges -->
        <div class="pm-img-wrap">
          <img :src="p.img" :alt="productTitle(p)" loading="lazy" />
          <div class="pm-badges">
            <span v-if="p.luxury" class="pm-badge pm-badge-luxury">
              <i data-lucide="crown" /> فاخر
            </span>
            <span v-if="p.best" class="pm-badge pm-badge-best">الأكثر مبيعًا</span>
            <span v-if="p.ready" class="pm-badge pm-badge-ready">جاهز اليوم</span>
          </div>
        </div>

        <!-- Body -->
        <div class="pm-body">
          <div class="pm-head">
            <span class="pm-id">{{ productRef(p) }}</span>
          </div>

          <div class="pm-meta">
            <span class="pm-price">{{ KD(p.price) }}</span>
            <span v-if="p.serving" class="pm-serving">
              <i data-lucide="users" /> {{ p.serving }}
            </span>
          </div>

          <p v-if="p.mood" class="pm-mood">"{{ p.mood }}"</p>

          <!-- Actions row -->
          <div class="pm-actions">
            <label class="avail-switch pm-switch" aria-label="تبديل التوفر">
              <input type="checkbox" :checked="isAvailable(p)" @change="toggleAvailable(p)" />
              <span class="avail-switch-track">
                <span class="avail-switch-knob" />
              </span>
            </label>
            <span class="pm-status">{{ isAvailable(p) ? 'متاح' : 'معطّل' }}</span>

            <div class="pm-tools">
              <button class="pm-btn pm-btn-edit" @click="openEdit(p)" title="تعديل">
                <i data-lucide="pencil" />
              </button>
              <button class="pm-btn pm-btn-delete" @click="confirmDelete(p)" title="حذف">
                <i data-lucide="trash-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="dash-empty">
      <i data-lucide="package-search" />
      <b>لا توجد منتجات</b>
      <span>{{ search ? 'لم يتم العثور على نتائج مطابقة' : 'ابدأ بإضافة منتج جديد' }}</span>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="dash-modal-overlay" @click.self="showModal = false">
      <div class="dash-modal dash-modal-lg" @click.stop>
        <div class="dash-modal-head">
          <h2>{{ editId ? 'تعديل منتج' : 'إضافة منتج جديد' }}</h2>
          <button class="dash-icon-btn" @click="showModal = false"><i data-lucide="x" /></button>
        </div>
        <form class="dash-modal-body" @submit.prevent="save">
          <!-- Preview -->
          <div class="dash-field">
            <label>العنوان التلقائي <small style="color:var(--muted);font-weight:400">(يُولّد من الشكل والفواكه)</small></label>
            <input class="dash-input" disabled :value="previewTitle" style="background:#f5f5f5;font-weight:600" />
          </div>

          <div class="dash-field">
            <label>رابط الصورة *</label>
            <input v-model="form.img" class="dash-input" type="url" placeholder="https://..." required />
          </div>

          <div class="dash-row-2">
            <div class="dash-field">
              <label>السعر (د.ك) *</label>
              <input v-model="form.price" class="dash-input" type="number" step="0.5" min="0" required />
            </div>
            <div class="dash-field">
              <label>يكفي كم شخص</label>
              <input v-model="form.serving" class="dash-input" placeholder="٤–٦ أشخاص" />
            </div>
          </div>

          <div class="dash-row-2">
            <div class="dash-field">
              <label>الشكل *</label>
              <select v-model="form.shape" class="dash-input" required>
                <option value="">— اختر —</option>
                <option v-for="s in SHAPES" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="dash-field">
              <label>التقييم (0–5)</label>
              <input v-model="form.rating" class="dash-input" type="number" step="0.1" min="0" max="5" />
            </div>
          </div>

          <div class="dash-field">
            <label>المناسبات <small style="color:var(--muted);font-weight:400">(افصل بفاصلة)</small></label>
            <input v-model="form.occ" class="dash-input" placeholder="عيد ميلاد، ذكرى، زواج" />
          </div>

          <div class="dash-field">
            <label>الفواكه * <small style="color:var(--muted);font-weight:400">(افصل بفاصلة)</small></label>
            <input v-model="form.fruits" class="dash-input" placeholder="فراولة، عنب، كيوي" required />
          </div>

          <div class="dash-field">
            <label>وصف مختصر</label>
            <input v-model="form.mood" class="dash-input" placeholder="لقلوب عاشقة" />
          </div>

          <div class="dash-field">
            <label>الوسوم</label>
            <div class="dash-checkboxes">
              <label class="dash-checkbox"><input v-model="form.ready" type="checkbox" /><span>جاهز اليوم</span></label>
              <label class="dash-checkbox"><input v-model="form.best" type="checkbox" /><span>الأكثر مبيعًا</span></label>
              <label class="dash-checkbox"><input v-model="form.luxury" type="checkbox" /><span>مجموعة فاخرة</span></label>
            </div>
          </div>

          <div class="dash-modal-actions">
            <button type="button" class="dash-btn dash-btn-ghost" @click="showModal = false">إلغاء</button>
            <button type="submit" class="dash-btn dash-btn-primary">
              <i data-lucide="check" /> {{ editId ? 'حفظ التعديلات' : 'إضافة المنتج' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>