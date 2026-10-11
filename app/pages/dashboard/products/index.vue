<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'
import { useToast } from '~/composables/useToast'
import { KD } from '~/utils/format'
import type { Product } from '~/composables/useProducts'

definePageMeta({ layout: 'dashboard' })

const { products, load, updateProduct } = useProducts()
const { show } = useToast()

const loading = ref(false)
const search = ref('')
type Filter = 'all' | 'available' | 'unavailable' | 'low'
const filter = ref<Filter>('all')

/* ═══ وضع التحديد ═══ */
const selectionMode = ref(false)
const selectedIds = ref<Set<string>>(new Set())

/* ═══ حالة التراجع ═══ */
const lastAction = ref<{
  type: 'toggle' | 'bulk' | null
  snapshot: Map<string, boolean> | null
}>({ type: null, snapshot: null })

/* ═══ تحميل المنتجات ═══ */
onMounted(async () => {
  loading.value = true
  try { await load(true) } finally { loading.value = false }
})

/* ═══ عنوان المنتج (من mood أو name_ar أو id) ═══ */
function productTitle(p: Product): string {
  return (p as any).name_ar || p.mood || p.id
}

/* ═══ حساب عدد المنتجات حسب الفلتر ═══ */
const LOW_STOCK_THRESHOLD = 3

function isLowStock(p: Product): boolean {
  const stock = (p as any).stock
  return p.available && stock > 0 && stock <= LOW_STOCK_THRESHOLD
}

const counts = computed(() => {
  const list = products.value
  return {
    total: list.length,
    available: list.filter(p => p.available).length,
    unavailable: list.filter(p => !p.available).length,
    low: list.filter(isLowStock).length,
  }
})

/* ═══ المنتجات المفلترة ═══ */
const filtered = computed(() => {
  let list = [...products.value]

  // Filter
  if (filter.value === 'available')   list = list.filter(p => p.available)
  if (filter.value === 'unavailable') list = list.filter(p => !p.available)
  if (filter.value === 'low')         list = list.filter(isLowStock)

  // Search
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(p =>
      p.id.toLowerCase().includes(q) ||
      productTitle(p).toLowerCase().includes(q)
    )
  }

  return list
})

/* ═══ إحصائيات للـ Page Head ═══ */
const stats = computed(() => counts.value)

/* ═══ التبديل السريع للتوفر ═══ */
async function toggleAvailability(id: string) {
  const p = products.value.find(x => x.id === id)
  if (!p) return

  // Snapshot للـ undo
  lastAction.value = {
    type: 'toggle',
    snapshot: new Map([[id, p.available]]),
  }

  const newVal = !p.available
  p.available = newVal
  // لو رجع متاح ومخزونه صفر، نخليه 1
  if (newVal && (p as any).stock === 0) (p as any).stock = 1

  try {
    await updateProduct(id, { available: newVal } as any)
    if (newVal) {
      showToast(`✅ تم تفعيل "${productTitle(p)}"`, 'success')
    } else {
      showToast(`⛔ تم تعطيل "${productTitle(p)}"`, 'warn', true)
    }
  } catch (e: any) {
    p.available = !newVal
    show(e?.data?.statusMessage || 'فشل التحديث', 'alert-circle')
  }
}

/* ═══ الإجراءات الجماعية ═══ */
async function bulkSetAvailable(available: boolean) {
  const ids = Array.from(selectedIds.value)
  if (!ids.length) return

  // Snapshot
  const snapshot = new Map<string, boolean>()
  ids.forEach(id => {
    const p = products.value.find(x => x.id === id)
    if (p) snapshot.set(id, p.available)
  })
  lastAction.value = { type: 'bulk', snapshot }

  // Apply optimistic
  ids.forEach(id => {
    const p = products.value.find(x => x.id === id)
    if (p) {
      p.available = available
      if (available && (p as any).stock === 0) (p as any).stock = 1
    }
  })

  try {
    await Promise.all(
      ids.map(id => updateProduct(id, { available } as any))
    )
    showToast(
      available
        ? `✅ تم تفعيل ${ids.length} منتج`
        : `⛔ تم تعطيل ${ids.length} منتج`,
      available ? 'success' : 'warn',
      true
    )
  } catch (e: any) {
    // Rollback
    snapshot.forEach((val, id) => {
      const p = products.value.find(x => x.id === id)
      if (p) p.available = val
    })
    show(e?.data?.statusMessage || 'فشل التحديث الجماعي', 'alert-circle')
  }
}

/* ═══ التراجع ═══ */
async function undoLast() {
  const snap = lastAction.value.snapshot
  if (!snap) return

  const ids = Array.from(snap.keys())
  const updates = ids.map(id => {
    const p = products.value.find(x => x.id === id)
    const oldVal = snap.get(id)!
    if (p) p.available = oldVal
    return updateProduct(id, { available: oldVal } as any)
  })

  try {
    await Promise.all(updates)
    showToast('↺ تم التراجع', 'success')
  } catch (e: any) {
    show(e?.data?.statusMessage || 'فشل التراجع', 'alert-circle')
  } finally {
    lastAction.value = { type: null, snapshot: null }
  }
}

/* ═══ تحديد الكل / إلغاء ═══ */
function selectAllVisible() {
  filtered.value.forEach(p => selectedIds.value.add(p.id))
  // trigger reactivity
  selectedIds.value = new Set(selectedIds.value)
}

function clearSelection() {
  selectedIds.value = new Set()
}

function toggleSelect(id: string) {
  const set = new Set(selectedIds.value)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  selectedIds.value = set
}

function toggleSelectionMode() {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) clearSelection()
}

/* ═══ Toast مخصص مع Undo ═══ */
interface ToastItem {
  id: number
  msg: string
  type: 'success' | 'warn' | 'danger'
  withUndo: boolean
}
const toasts = ref<ToastItem[]>([])
let toastId = 0

function showToast(
  msg: string,
  type: 'success' | 'warn' | 'danger' = 'success',
  withUndo = false
) {
  const id = ++toastId
  toasts.value.push({ id, msg, type, withUndo })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, withUndo ? 4000 : 2600)
}

function dismissToast(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}
</script>

<template>
  <div class="products-page">

    <!-- ═══ Page Head ═══ -->
    <header class="page-head">
      <div class="page-head__title">
        <h1>المنتجات</h1>
        <p>
          <strong>{{ stats.available }}</strong> متاح من <strong>{{ stats.total }}</strong>
          <template v-if="stats.low > 0">
            · <span class="stat stat--warn">
              <Icon name="alert-triangle" :size="11" />
              {{ stats.low }} منخفض المخزون
            </span>
          </template>
          <template v-if="stats.unavailable > 0">
            · <span class="stat stat--off">
              <Icon name="x-circle" :size="11" />
              {{ stats.unavailable }} معطّل
            </span>
          </template>
        </p>
      </div>
      <div class="page-head__actions">
        <button
          :class="['head-btn', { 'head-btn--active': selectionMode }]"
          @click="toggleSelectionMode"
        >
          <Icon :name="selectionMode ? 'x' : 'square-check'" :size="14" />
          {{ selectionMode ? 'إلغاء التحديد' : 'وضع التحديد' }}
        </button>
        <NuxtLink to="/dashboard/products/new" class="head-btn head-btn--primary">
          <Icon name="plus" :size="14" />
          إضافة منتج
        </NuxtLink>
      </div>
    </header>

    <!-- ═══ Filters Bar ═══ -->
    <div class="filters-bar">
      <div class="filter-tabs">
        <button
          :class="['filter-tab', { on: filter === 'all' }]"
          @click="filter = 'all'"
        >
          <Icon name="layout-grid" :size="14" />
          الكل
          <span class="filter-tab__count">{{ stats.total }}</span>
        </button>
        <button
          :class="['filter-tab', { on: filter === 'available' }]"
          @click="filter = 'available'"
        >
          <span class="filter-tab__dot dot-ok"></span>
          متاح
          <span class="filter-tab__count">{{ stats.available }}</span>
        </button>
        <button
          :class="['filter-tab', { on: filter === 'unavailable' }]"
          @click="filter = 'unavailable'"
        >
          <span class="filter-tab__dot dot-off"></span>
          معطّل
          <span class="filter-tab__count">{{ stats.unavailable }}</span>
        </button>
        <button
          :class="['filter-tab', { on: filter === 'low' }]"
          @click="filter = 'low'"
        >
          <span class="filter-tab__dot dot-low"></span>
          منخفض المخزون
          <span class="filter-tab__count">{{ stats.low }}</span>
        </button>
      </div>

      <div class="search-box">
        <Icon name="search" :size="18" />
        <input v-model="search" type="text" placeholder="ابحث برقم المنتج أو الاسم…" />
      </div>
    </div>

    <!-- ═══ Bulk Toolbar ═══ -->
    <div :class="['bulk-toolbar', { on: selectionMode && selectedIds.size > 0 }]">
      <div class="bulk-toolbar__info">
        <Icon name="square-check" :size="20" />
        <strong>{{ selectedIds.size }}</strong>
        <span>منتج محدّد</span>
      </div>
      <div class="bulk-toolbar__actions">
        <button class="bulk-btn bulk-btn--success" @click="bulkSetAvailable(true)">
          <Icon name="check" :size="14" />
          تفعيل
        </button>
        <button class="bulk-btn bulk-btn--danger" @click="bulkSetAvailable(false)">
          <Icon name="x" :size="14" />
          تعطيل
        </button>
        <button class="bulk-btn" @click="selectAllVisible">تحديد الكل</button>
        <button class="bulk-btn" @click="clearSelection">إلغاء التحديد</button>
      </div>
    </div>

    <!-- ═══ Loading ═══ -->
    <div v-if="loading" class="dash-empty">
      <Icon name="loader" :size="32" class="spin" />
      <b>جاري التحميل…</b>
    </div>

    <!-- ═══ Empty ═══ -->
    <div v-else-if="!filtered.length" class="dash-empty">
      <Icon name="package-x" :size="48" :stroke-width="1.5" />
      <b>لا توجد منتجات مطابقة</b>
      <span>جرّب فلتر آخر أو ابحث بكلمة مختلفة</span>
    </div>

    <!-- ═══ Products Grid ═══ -->
    <div v-else :class="['products-grid', { 'selection-mode': selectionMode }]">
      <article
        v-for="p in filtered"
        :key="p.id"
        :class="['product-card', { 'is-off': !p.available }]"
      >
        <div class="product-card__img">
          <img :src="p.img" :alt="productTitle(p)" loading="lazy" />

          <!-- Low stock warning -->
          <span v-if="isLowStock(p)" class="stock-warn">
            <Icon name="alert-triangle" :size="11" />
            باقي {{ (p as any).stock }}
          </span>
          <!-- SKU badge -->
          <span v-else class="sku-badge">#{{ p.id.toUpperCase() }}</span>

          <!-- Selection checkbox -->
          <button
            v-if="selectionMode"
            :class="['select-check', { on: selectedIds.has(p.id) }]"
            @click.stop="toggleSelect(p.id)"
            aria-label="تحديد"
          ></button>

          <!-- Edit button -->
          <NuxtLink
            v-if="!selectionMode"
            :to="`/dashboard/products/${p.id}`"
            class="dpc-edit"
            title="تعديل"
          >
            <Icon name="pencil" :size="16" />
          </NuxtLink>
        </div>

        <div class="product-card__body">
          <h3 class="product-card__name">{{ productTitle(p) }}</h3>

          <div v-if="p.luxury || p.best || p.ready" class="product-card__tags">
            <span v-if="p.luxury" class="tag-chip tag-chip--luxury">فاخر</span>
            <span v-if="p.best" class="tag-chip tag-chip--best">الأكثر مبيعًا</span>
            <span v-if="p.ready" class="tag-chip tag-chip--ready">جاهز</span>
          </div>

          <div class="product-card__meta">
            <span class="price-tag">
              {{ p.price.toFixed(3) }}
              <small>د.ك</small>
            </span>

            <button
              :class="['availability-badge', p.available ? 'availability-badge--on' : 'availability-badge--off']"
              :disabled="selectionMode"
              :title="p.available ? 'اضغط للتعطيل' : 'اضغط للتفعيل'"
              @click="toggleAvailability(p.id)"
            >
              <Icon :name="p.available ? 'eye' : 'eye-off'" :size="13" />
              {{ p.available ? 'متاح' : 'معطّل' }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- ═══ Toast Container ═══ -->
    <div class="toast-container">
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="['toast', `toast--${t.type}`]"
      >
        <span class="toast__ico">
          <Icon :name="t.type === 'success' ? 'check' : 'alert-triangle'" :size="16" />
        </span>
        <span class="toast__msg">{{ t.msg }}</span>
        <button
          v-if="t.withUndo"
          class="toast__undo"
          @click="undoLast(); dismissToast(t.id)"
        >
          تراجع
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════ */
.products-page {
  --ink:         #1B1714;
  --ink-soft:    #4C443B;
  --ink-mute:    #7A7065;
  --cream:       #F7F2EC;
  --sand:        #E7DED2;
  --bronze:      #A8855B;
  --bronze-lt:   #C9A87C;
  --burgundy:    #6E1F2E;
  --burgundy-dk: #551621;
  --burgundy-lt: #8B2E3F;
  --line:        rgba(27,23,20,.10);
  --success: #10B981;
  --warning: #F59E0B;
  --danger:  #DC2626;
  --info:    #3B82F6;
  --ease: cubic-bezier(.22,1,.36,1);
  --ease-bounce: cubic-bezier(.34,1.56,.64,1);
}

/* ═══════════════════════════════════════════════════════════
   PAGE HEAD
   ═══════════════════════════════════════════════════════════ */
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}
.page-head__title h1 {
  font-family: 'Playfair Display', 'Almarai', serif;
  font-size: clamp(24px, 3vw, 30px);
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--ink);
}
.page-head__title p {
  margin: 0;
  font-size: 13.5px;
  color: var(--ink-mute);
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  align-items: center;
}
.page-head__title p strong {
  color: var(--ink);
  font-weight: 800;
}
.stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;
  white-space: nowrap;
}
.stat--warn { background: rgba(245,158,11,.12); color: #D97706; }
.stat--off  { background: rgba(220,38,38,.10); color: #DC2626; }

.page-head__actions {
  display: flex; gap: 8px; flex-wrap: wrap;
}
.head-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 18px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  font: 700 13px inherit;
  color: var(--ink);
  cursor: pointer;
  transition: all .25s var(--ease);
  text-decoration: none;
}
.head-btn:hover { border-color: var(--burgundy); color: var(--burgundy); }
.head-btn--primary {
  background: linear-gradient(135deg, #8B2E3F, #6E1F2E);
  color: #FBEFE0;
  border-color: transparent;
  box-shadow: 0 12px 26px -14px rgba(110,31,46,.6);
}
.head-btn--primary:hover { color: #fff; transform: translateY(-1px); }
.head-btn--active {
  background: var(--ink);
  color: #fff;
  border-color: var(--ink);
}

/* ═══════════════════════════════════════════════════════════
   FILTERS
   ═══════════════════════════════════════════════════════════ */
.filters-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}
.filter-tabs {
  display: flex; gap: 6px; flex-wrap: wrap;
  padding: 5px;
  background: rgba(255,255,255,.6);
  border: 1.5px solid rgba(255,255,255,.9);
  border-radius: 14px;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
.filter-tab {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: 0; border-radius: 10px;
  font: 700 13px inherit;
  color: var(--ink-soft);
  cursor: pointer;
  white-space: nowrap;
  transition: all .25s var(--ease);
}
.filter-tab:hover { background: rgba(255,255,255,.7); color: var(--ink); }
.filter-tab.on {
  background: linear-gradient(135deg, #8B2E3F, #6E1F2E);
  color: #FBEFE0;
  box-shadow: 0 8px 18px -10px rgba(110,31,46,.6);
}
.filter-tab__count {
  display: inline-grid; place-items: center;
  min-width: 22px; height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(0,0,0,.06);
  font-size: 11px; font-weight: 800;
}
.filter-tab.on .filter-tab__count {
  background: rgba(255,255,255,.22);
  color: #FBEFE0;
}
.filter-tab__dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-ok { background: #10B981; }
.dot-off { background: #DC2626; }
.dot-low { background: #F59E0B; }

.search-box {
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
}
.search-box :deep(svg) { color: var(--ink-mute); }
.search-box input {
  flex: 1;
  border: 0; outline: 0;
  font: 600 14px inherit;
  color: var(--ink);
  background: transparent;
}

/* ═══════════════════════════════════════════════════════════
   BULK TOOLBAR
   ═══════════════════════════════════════════════════════════ */
.bulk-toolbar {
  position: sticky;
  top: 16px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #1B1714 0%, #2E2520 100%);
  color: #F7F2EC;
  border-radius: 16px;
  box-shadow: 0 20px 40px -20px rgba(0,0,0,.4);
  opacity: 0;
  transform: translateY(-12px);
  pointer-events: none;
  transition: all .35s var(--ease);
}
.bulk-toolbar.on {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.bulk-toolbar__info {
  display: flex; align-items: center; gap: 10px;
  font-weight: 800;
  flex: 1;
  min-width: 0;
}
.bulk-toolbar__info strong {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: #E9DAC4;
  font-weight: 600;
}
.bulk-toolbar__actions {
  display: flex; gap: 8px; flex-wrap: wrap;
}
.bulk-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 16px;
  border: 1.5px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.06);
  border-radius: 10px;
  font: 800 12.5px inherit;
  color: #F7F2EC;
  cursor: pointer;
  transition: all .25s var(--ease);
}
.bulk-btn:hover { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.3); }
.bulk-btn--danger {
  background: rgba(220,38,38,.15);
  border-color: rgba(220,38,38,.35);
  color: #FCA5A5;
}
.bulk-btn--danger:hover { background: rgba(220,38,38,.25); }
.bulk-btn--success {
  background: rgba(16,185,129,.15);
  border-color: rgba(16,185,129,.35);
  color: #6EE7B7;
}
.bulk-btn--success:hover { background: rgba(16,185,129,.25); }

/* ═══════════════════════════════════════════════════════════
   PRODUCTS GRID
   ═══════════════════════════════════════════════════════════ */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 18px;
}

.product-card {
  position: relative;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
  transition: all .35s var(--ease);
  display: flex;
  flex-direction: column;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -24px rgba(50,35,20,.4);
  border-color: rgba(168,133,91,.3);
}
.product-card.is-off {
  opacity: .55;
  filter: grayscale(.5);
}
.product-card.is-off:hover {
  opacity: .75;
  filter: grayscale(.3);
}
.product-card.is-off .product-card__img::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(45deg,
      transparent 0,
      transparent 20px,
      rgba(220,38,38,.10) 20px,
      rgba(220,38,38,.10) 40px);
  pointer-events: none;
}

.product-card__img {
  position: relative;
  aspect-ratio: 1;
  background: var(--cream);
  overflow: hidden;
}
.product-card__img img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .6s var(--ease);
}
.product-card:hover .product-card__img img {
  transform: scale(1.05);
}

.sku-badge {
  position: absolute;
  top: 10px;
  inset-inline-start: 10px;
  padding: 4px 10px;
  background: rgba(0,0,0,.6);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  border-radius: 999px;
  font-family: monospace;
  z-index: 2;
}

.select-check {
  position: absolute;
  top: 10px;
  inset-inline-end: 10px;
  width: 28px; height: 28px;
  display: none;
  place-items: center;
  background: rgba(255,255,255,.95);
  border: 2px solid rgba(27,23,20,.15);
  border-radius: 8px;
  cursor: pointer;
  transition: all .25s var(--ease-bounce);
  z-index: 4;
}
.products-grid.selection-mode .select-check { display: grid; }
.select-check:hover { border-color: var(--burgundy); }
.select-check.on {
  background: var(--burgundy);
  border-color: var(--burgundy);
}
.select-check.on::after {
  content: "";
  width: 12px; height: 7px;
  border-left: 2.5px solid #fff;
  border-bottom: 2.5px solid #fff;
  transform: rotate(-45deg) translate(1px, -2px);
}

/* Edit button */
.dpc-edit {
  position: absolute;
  top: 10px;
  inset-inline-end: 10px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  border-radius: 50%;
  color: var(--ink);
  text-decoration: none;
  opacity: 0;
  transform: scale(0.85);
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 5;
}
.product-card:hover .dpc-edit {
  opacity: 1;
  transform: scale(1);
}
.dpc-edit:hover {
  background: linear-gradient(135deg, #8b2e3f, #6e1f2e);
  color: #fff;
}

.product-card__body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.product-card__name {
  font-family: 'Playfair Display', 'Almarai', serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  margin: 0;
  line-height: 1.3;
}

.product-card__tags {
  display: flex; gap: 5px; flex-wrap: wrap;
}
.tag-chip {
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
}
.tag-chip--luxury { background: rgba(110,31,46,.10); color: var(--burgundy); }
.tag-chip--best { background: rgba(168,133,91,.15); color: var(--bronze); }
.tag-chip--ready { background: rgba(16,185,129,.12); color: #059669; }

.product-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(27,23,20,.08);
  margin-top: auto;
}

.price-tag {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--burgundy);
}
.price-tag small {
  font-size: 11px;
  color: var(--bronze);
  margin-inline-start: 3px;
  font-weight: 700;
}

.availability-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 999px;
  font: 800 11.5px inherit;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: all .25s var(--ease-bounce);
  position: relative;
  z-index: 5;
}
.availability-badge:disabled {
  cursor: not-allowed;
  opacity: .5;
}
.availability-badge--on {
  background: rgba(16,185,129,.10);
  color: #059669;
  border-color: rgba(16,185,129,.25);
}
.availability-badge--on:hover:not(:disabled) {
  background: rgba(16,185,129,.18);
  transform: scale(1.04);
}
.availability-badge--off {
  background: rgba(220,38,38,.10);
  color: #DC2626;
  border-color: rgba(220,38,38,.25);
}
.availability-badge--off:hover:not(:disabled) {
  background: rgba(220,38,38,.18);
  transform: scale(1.04);
}

.stock-warn {
  position: absolute;
  top: 10px;
  inset-inline-start: 10px;
  display: flex; align-items: center; gap: 4px;
  padding: 4px 10px;
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  color: #92400E;
  font-size: 10.5px;
  font-weight: 800;
  border-radius: 999px;
  z-index: 3;
  box-shadow: 0 4px 12px rgba(245,158,11,.25);
}

/* ═══════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════ */
.dash-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  text-align: center;
  color: var(--ink-mute);
}
.dash-empty :deep(svg) { color: var(--bronze); }
.dash-empty b { font-size: 14px; color: var(--ink); font-weight: 800; }
.spin { animation: spin 1.4s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ═══════════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════════ */
.toast-container {
  position: fixed;
  bottom: 24px;
  inset-inline-start: 50%;
  transform: translateX(50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: #1B1714;
  color: #F7F2EC;
  border-radius: 14px;
  box-shadow: 0 20px 40px -14px rgba(0,0,0,.4);
  font-weight: 700;
  font-size: 13.5px;
  min-width: 280px;
  pointer-events: auto;
  animation: toastIn .35s var(--ease-bounce);
}
.toast--success { background: linear-gradient(135deg, #059669, #10B981); }
.toast--warn    { background: linear-gradient(135deg, #D97706, #F59E0B); }
.toast--danger  { background: linear-gradient(135deg, #B91C1C, #DC2626); }
.toast__ico {
  width: 32px; height: 32px;
  display: grid; place-items: center;
  background: rgba(255,255,255,.15);
  border-radius: 50%;
  flex-shrink: 0;
}
.toast__msg { flex: 1; min-width: 0; }
.toast__undo {
  padding: 6px 12px;
  background: rgba(255,255,255,.2);
  border: 0;
  border-radius: 8px;
  color: #fff;
  font: 800 12px inherit;
  cursor: pointer;
  transition: all .2s ease;
}
.toast__undo:hover { background: rgba(255,255,255,.3); }

@keyframes toastIn {
  from { opacity: 0; transform: translateY(20px) scale(.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 900px) {
  .products-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
  .bulk-toolbar { flex-wrap: wrap; }
  .bulk-toolbar__actions { width: 100%; }
  .bulk-btn { flex: 1; justify-content: center; }
}
</style>