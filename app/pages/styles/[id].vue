<script setup lang="ts">
import { useStyles } from '~/composables/useStyles'
import type { Product } from '~/composables/useProducts'

/* ═══ Route ═══ */
const route = useRoute()
const styleId = computed(() => String(route.params.id || ''))

/* ═══ الحالة ═══ */
const style    = ref<any>(null)
const products = ref<Product[]>([])
const loading  = ref(true)
const error    = ref<string | null>(null)

/* ═══ فلتر الميزانية ═══ */
type BudgetRange = { min: number; max: number }
const budget = ref<BudgetRange>({ min: 0, max: 9999 })

const budgetOptions: { label: string; min: number; max: number }[] = [
  { label: 'الكل',        min: 0,  max: 9999 },
  { label: 'حتى 40',      min: 0,  max: 40 },
  { label: '40 – 60',     min: 40, max: 60 },
  { label: '60 – 80',     min: 60, max: 80 },
  { label: '80+',         min: 80, max: 9999 }
]

const isBudgetActive = (opt: { min: number; max: number }) =>
  budget.value.min === opt.min && budget.value.max === opt.max

const setBudget = (opt: { min: number; max: number }) => {
  budget.value = { min: opt.min, max: opt.max }
}

/* ═══ المنتجات المفلترة ═══ */
const filteredProducts = computed(() =>
  products.value.filter(p => {
    const price = Number(p.price)
    return price >= budget.value.min && price <= budget.value.max
  })
)

/* ═══ تحميل البيانات ═══ */
const loadData = async () => {
  if (!styleId.value) return

  loading.value = true
  error.value = null

  try {
    const res = await $fetch<{
      ok: boolean
      style: any
      products: Product[]
    }>(`/api/styles/${styleId.value}`)

    style.value = res.style
    products.value = res.products || []
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'تعذر تحميل التصنيف'
    style.value = null
    products.value = []
  } finally {
    loading.value = false
  }
}

/* ═══ SEO ═══ */
watchEffect(() => {
  if (style.value) {
    useSeoMeta({
      title: `${style.value.name_ar} — FA Fruits`,
      description: style.value.description || ''
    })
  }
})

/* ═══ SSR + Client ═══ */
if (import.meta.server) {
  await loadData()
} else {
  loadData()
}
</script>

<template>
  <div>
    <!-- ═══════ Page Head ═══════ -->
    <section class="page-head">
      <div class="wrap">
        <!-- Breadcrumbs -->
        <div class="crumbs">
          <NuxtLink to="/">الرئيسية</NuxtLink>
          <span class="sep">/</span>
          <NuxtLink to="/styles">حسب التصميم</NuxtLink>
          <span class="sep">/</span>
          <span class="current">{{ style?.name_ar || '…' }}</span>
        </div>

        <!-- Loading state for head -->
        <div v-if="loading" class="head-loading">
          <h1>…</h1>
        </div>

        <!-- Title -->
        <template v-else-if="style">
          <h1 class="style-title">
            <span class="title-icon">
              <Icon :name="style.icon || 'circle'" :size="30" :stroke-width="1.8" />
            </span>
            {{ style.name_ar }}
          </h1>
          <p v-if="style.description">{{ style.description }}</p>
        </template>
      </div>
    </section>

    <!-- ═══════ Content ═══════ -->
    <section class="sec">
      <div class="wrap">

        <!-- Loading -->
        <div v-if="loading" class="state-box">
          <Icon name="loader" :size="40" :stroke-width="1.8" />
          <p>جاري التحميل…</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="state-box">
          <Icon name="alert-circle" :size="48" :stroke-width="1.5" />
          <h3>{{ error }}</h3>
          <div class="actions">
            <NuxtLink to="/styles" class="btn btn-ghost">
              <Icon name="arrow-right" :size="16" />
              كل التصاميم
            </NuxtLink>
            <button class="btn btn-primary" @click="loadData">
              <Icon name="refresh-cw" :size="16" />
              إعادة المحاولة
            </button>
          </div>
        </div>

        <!-- Products -->
        <template v-else-if="style">
          <!-- Info note -->
          <div class="collection-note">
            <Icon name="sparkles" :size="18" />
            <div>
              <b>كل تصميم يناسب كل مناسبة.</b>
              <span>
                اختر العبارة اللي تُنحت على الفواكه من صفحة المنتج —
                «مبروك المولود»، «مبروك الزواج»، أو اكتب عبارتك الخاصة.
              </span>
            </div>
          </div>

          <!-- Toolbar -->
          <div class="collection-toolbar">
            <div class="toolbar-count">
              <b>{{ filteredProducts.length }}</b>
              <span>منتج</span>
            </div>

            <div class="budget-bar">
              <span class="budget-label">
                <Icon name="wallet" :size="14" />
                الميزانية
              </span>
              <div class="budget-chips">
                <button
                  v-for="opt in budgetOptions"
                  :key="opt.label"
                  :class="['bud-chip', { on: isBudgetActive(opt) }]"
                  @click="setBudget(opt)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Grid -->
          <div v-if="filteredProducts.length" class="prod-grid">
            <ProductCard
              v-for="p in filteredProducts"
              :key="p.id"
              :product="p"
            />
          </div>

          <!-- Empty after filter -->
          <div v-else class="state-box">
            <Icon name="search-x" :size="48" :stroke-width="1.5" />
            <h3>لا توجد منتجات في هذا النطاق</h3>
            <p>جرّب توسيع نطاق الميزانية</p>
            <button class="btn btn-primary" @click="setBudget({ min: 0, max: 9999 })">
              <Icon name="refresh-cw" :size="16" />
              عرض الكل
            </button>
          </div>
        </template>

      </div>
    </section>
  </div>
</template>

<style scoped>
/* ═══ Breadcrumbs ═══ */
.crumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: .82rem;
  color: var(--muted);
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.crumbs a {
  color: var(--green-700);
  text-decoration: none;
  transition: color .15s ease;
}
.crumbs a:hover { color: var(--gold); }
.crumbs .sep { opacity: .5; }
.crumbs .current { color: var(--green-900); font-weight: 600; }

/* ═══ Title ═══ */
.style-title {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.title-icon {
  display: inline-grid;
  place-items: center;
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #FFF3D6 0%, #FFE8B8 100%);
  border-radius: 16px;
  color: #8A5A00;
}

/* ═══ Info note ═══ */
.collection-note {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #FFF8EE 0%, #FFF3D6 100%);
  border: 1.5px dashed var(--gold);
  border-radius: 16px;
  margin-bottom: 20px;
  color: #7A5B00;
}

.collection-note svg { flex-shrink: 0; margin-top: 2px; color: var(--gold); }
.collection-note b { display: block; margin-bottom: 4px; font-size: .9rem; color: var(--green-900); }
.collection-note span { font-size: .82rem; line-height: 1.7; }

/* ═══ Toolbar ═══ */
.collection-toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.toolbar-count {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  padding: 8px 14px;
  background: var(--green-50);
  border-radius: 999px;
  font-size: .82rem;
  color: var(--green-700);
}

.toolbar-count b {
  font-family: var(--ff-display);
  font-size: 1.1rem;
  color: var(--green-900);
}

/* ═══ Budget Bar ═══ */
.budget-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  flex: 1;
  min-width: 280px;
  flex-wrap: wrap;
}

.budget-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: .78rem;
  font-weight: 700;
  color: var(--muted);
  flex-shrink: 0;
}

.budget-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.bud-chip {
  padding: 6px 14px;
  background: var(--cream);
  border: 1.5px solid transparent;
  border-radius: 999px;
  font-family: inherit;
  font-size: .78rem;
  font-weight: 600;
  color: var(--green-900);
  cursor: pointer;
  transition: all .18s ease;
}

.bud-chip:hover { border-color: var(--gold); }

.bud-chip.on {
  background: var(--green-900);
  color: #fff;
}

/* ═══ State Box ═══ */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  text-align: center;
  color: var(--muted);
}

.state-box svg { color: var(--gold); }

.state-box h3 {
  font-family: var(--ff-display);
  font-size: 1.3rem;
  color: var(--green-900);
  margin: 0;
}

.state-box p {
  font-size: .88rem;
  margin: 0;
  max-width: 340px;
  line-height: 1.6;
}

.state-box .actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

/* ═══ Responsive ═══ */
@media (max-width: 640px) {
  .style-title { font-size: 1.4rem; gap: 8px; }
  .title-icon { width: 42px; height: 42px; border-radius: 12px; }
  .title-icon svg { width: 24px; height: 24px; }

  .collection-note { padding: 14px 16px; }

  .collection-toolbar { gap: 10px; }
  .budget-bar { padding: 10px 12px; min-width: 100%; }
  .budget-label { font-size: .72rem; }
  .bud-chip { padding: 5px 10px; font-size: .72rem; }
}
</style>