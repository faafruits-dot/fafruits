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
const filter = ref<'all' | 'best' | 'luxury' | 'ready'>('all')

onMounted(async () => {
  loading.value = true
  try { await load(true) } finally { loading.value = false }
})

const filtered = computed(() => {
  let list = products.value
  if (filter.value === 'best') list = list.filter(p => p.best)
  if (filter.value === 'luxury') list = list.filter(p => p.luxury)
  if (filter.value === 'ready') list = list.filter(p => p.ready)
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter(p => p.id.toLowerCase().includes(q) || (p.mood || '').toLowerCase().includes(q))
  return list
})

const stats = computed(() => ({
  total: products.value.length,
  best: products.value.filter(p => p.best).length,
  luxury: products.value.filter(p => p.luxury).length,
  ready: products.value.filter(p => p.ready).length,
}))

/* ⭐ Toggle سريع */
const toggleField = async (p: Product, field: 'best' | 'luxury' | 'ready' | 'available') => {
  const oldVal = p[field]
  p[field] = !oldVal
  try {
    await updateProduct(p.id, { [field]: !oldVal })
    show(`تم تحديث ${p.id.toUpperCase()}`, 'check')
  } catch (e: any) {
    p[field] = oldVal
    show(e?.data?.statusMessage || 'فشل التحديث', 'alert-circle')
  }
}
</script>

<template>
  <div class="dash-page">
    <!-- ═══ Head ═══ -->
    <header class="dash-page__head">
      <div>
        <h1>المنتجات</h1>
        <p>{{ stats.total }} منتج في الكتالوج</p>
      </div>

      <!-- ⭐ زر إضافة منتج -->
      <NuxtLink to="/dashboard/products/new" class="add-btn">
        <Icon name="plus" :size="18" />
        إضافة منتج
      </NuxtLink>
    </header>

    <!-- ═══ KPIs ═══ -->
    <div class="dash-kpis">
      <div class="dash-kpi">
        <span class="dash-kpi-icon"><Icon name="package" :size="20" /></span>
        <div><b>{{ stats.total }}</b><small>الكل</small></div>
      </div>
      <div class="dash-kpi">
        <span class="dash-kpi-icon"><Icon name="star" :size="20" /></span>
        <div><b>{{ stats.best }}</b><small>مميز</small></div>
      </div>
      <div class="dash-kpi">
        <span class="dash-kpi-icon"><Icon name="sparkles" :size="20" /></span>
        <div><b>{{ stats.luxury }}</b><small>فاخر</small></div>
      </div>
      <div class="dash-kpi dash-kpi-ok">
        <span class="dash-kpi-icon"><Icon name="zap" :size="20" /></span>
        <div><b>{{ stats.ready }}</b><small>جاهز</small></div>
      </div>
    </div>

    <!-- ═══ Toolbar ═══ -->
    <div class="prod-toolbar">
      <div class="prod-search">
        <Icon name="search" :size="18" />
        <input v-model="search" type="text" placeholder="ابحث بالكود أو المود…" />
      </div>
      <div class="prod-filters">
        <button :class="['pill', { on: filter === 'all' }]" @click="filter = 'all'">الكل</button>
        <button :class="['pill', { on: filter === 'best' }]" @click="filter = 'best'">مميز</button>
        <button :class="['pill', { on: filter === 'luxury' }]" @click="filter = 'luxury'">فاخر</button>
        <button :class="['pill', { on: filter === 'ready' }]" @click="filter = 'ready'">جاهز</button>
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
      <b>لا توجد منتجات</b>
      <NuxtLink to="/dashboard/products/new" class="add-btn add-btn--sm">
        <Icon name="plus" :size="16" />
        إضافة أول منتج
      </NuxtLink>
    </div>

    <!-- ═══ Grid ═══ -->
    <div v-else class="dash-prod-grid">
      <article v-for="p in filtered" :key="p.id" class="dash-prod-card">
        <div class="dpc-img">
          <img :src="p.img" :alt="p.id" loading="lazy" />
          <span class="dpc-sku">#{{ p.id.toUpperCase() }}</span>

          <!-- ⭐ زر التعديل — يوجّه لصفحة مستقلة -->
          <NuxtLink
            :to="`/dashboard/products/${p.id}`"
            class="dpc-edit"
            title="تعديل"
          >
            <Icon name="pencil" :size="16" />
          </NuxtLink>
        </div>

        <div class="dpc-body">
          <div class="dpc-tags">
            <button :class="['dpc-tag', { on: p.best }]" @click="toggleField(p, 'best')">
              <Icon name="star" :size="12" /> مميز
            </button>
            <button :class="['dpc-tag', { on: p.luxury }]" @click="toggleField(p, 'luxury')">
              <Icon name="sparkles" :size="12" /> فاخر
            </button>
            <button :class="['dpc-tag', { on: p.ready }]" @click="toggleField(p, 'ready')">
              <Icon name="zap" :size="12" /> جاهز
            </button>
            <button :class="['dpc-tag', { on: p.available }]" @click="toggleField(p, 'available')">
              <Icon name="eye" :size="12" /> متاح
            </button>
          </div>

          <div class="dpc-foot">
            <span class="dpc-price-display"><b>{{ KD(p.price) }}</b></span>
            <span v-if="p.rating" class="dpc-rating-sm">
              <Icon name="star" :size="11" />
              {{ p.rating }}
            </span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.dash-page {
  display: flex;
  flex-direction: column;
}

.dash-page__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}
.dash-page__head h1 {
  font-family: "Playfair Display", "Almarai", serif;
  font-size: clamp(22px, 2.5vw, 30px);
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 4px;
}
.dash-page__head p {
  margin: 0;
  font-size: 13px;
  color: var(--ink-mute);
}

/* ⭐ Add button */
.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  background: linear-gradient(150deg, #8b2e3f, #6e1f2e);
  color: #fbefe0;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 16px 32px -16px rgba(110, 31, 46, 0.7);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 44px -18px rgba(110, 31, 46, 0.85);
}
.add-btn--sm {
  padding: 10px 18px;
  font-size: 12.5px;
  margin-top: 10px;
}

/* Toolbar */
.prod-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.prod-search {
  position: relative;
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  background: #fff;
  border: 1.5px solid rgba(27, 23, 20, 0.08);
  border-radius: 14px;
  height: 48px;
}
.prod-search :deep(svg) { color: var(--ink-mute); }
.prod-search input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink);
}
.prod-filters { display: flex; gap: 6px; flex-wrap: wrap; }

.pill {
  padding: 10px 16px;
  background: #fff;
  border: 1.5px solid rgba(27, 23, 20, 0.08);
  border-radius: 999px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.pill:hover { border-color: var(--bronze); }
.pill.on {
  background: linear-gradient(150deg, #8b2e3f, #6e1f2e);
  color: #fbefe0;
  border-color: transparent;
}

/* Grid */
.dash-prod-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.dash-prod-card {
  background: #f6f1e9;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 20px -10px rgba(50, 35, 20, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.dash-prod-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px -14px rgba(50, 35, 20, 0.25);
}

.dpc-img {
  position: relative;
  aspect-ratio: 1;
  background: var(--cream);
  overflow: hidden;
}
.dpc-img img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}
.dpc-sku {
  position: absolute;
  top: 10px;
  inset-inline-start: 10px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  font-family: monospace;
}
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
}
.dash-prod-card:hover .dpc-edit {
  opacity: 1;
  transform: scale(1);
}
.dpc-edit:hover {
  background: linear-gradient(135deg, #8b2e3f, #6e1f2e);
  color: #fff;
}

.dpc-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dpc-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.dpc-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: var(--cream);
  border: 1.5px solid transparent;
  border-radius: 999px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  color: var(--ink-mute);
  cursor: pointer;
  transition: all 0.2s ease;
}
.dpc-tag.on {
  background: linear-gradient(135deg, #8b2e3f, #6e1f2e);
  color: #fbefe0;
}

.dpc-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px dashed rgba(27, 23, 20, 0.08);
}
.dpc-price-display b {
  font-family: "Playfair Display", serif;
  font-size: 17px;
  color: var(--burgundy);
}
.dpc-rating-sm {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--ink-mute);
}

/* Empty */
.dash-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 80px 20px;
  text-align: center;
  color: var(--ink-mute);
}
.dash-empty :deep(svg) { color: var(--bronze); }
.spin { animation: spin 1.4s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>