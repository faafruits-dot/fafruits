<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'
import { OCCASIONS } from '~/data/seed'

const route = useRoute()
const { products } = useProducts()

/* ═══ المناسبة الحالية ═══ */
const occasion = computed(() => OCCASIONS.find(x => x.id === route.params.id))

/* ⭐ خريطة العبارات — تُضاف لكل مناسبة */
const OCCASION_MESSAGES: Record<string, string> = {
  birthday:    'كل عام وأنت بخير',
  wedding:     'مبروك الزواج',
  newbaby:     'مبروك المولود',
  graduation:  'مبروك التخرج',
  anniversary: 'عقبال ١٠٠ سنة',
  ramadan:     'رمضان مبارك',
  justbecause: 'هدية من القلب'
}

const messageText = computed(() => {
  const id = String(route.params.id || '')
  return OCCASION_MESSAGES[id] || null
})

/* ⭐ كل المنتجات — بدون فلترة ضيقة */
const allProducts = computed(() =>
  products.value.filter(p => p.available !== false)
)

/* ═══ SEO ═══ */
useSeoMeta({
  title: computed(() =>
    occasion.value ? `${occasion.value.name} — FA Fruits` : 'المناسبات — FA Fruits'
  ),
  description: computed(() =>
    occasion.value
      ? `كل تصاميمنا تناسب ${occasion.value.name} — اختر التصميم وبنحفر العبارة`
      : ''
  )
})
</script>

<template>
  <div>
    <!-- ═══════ Page Head ═══════ -->
    <section class="page-head">
      <div class="wrap">
        <div class="crumbs">
          <NuxtLink to="/">الرئيسية</NuxtLink>
          <span class="sep">/</span>
          <NuxtLink to="/occasions">المناسبات</NuxtLink>
          <span class="sep">/</span>
          <span class="current">{{ occasion?.name || '…' }}</span>
        </div>

        <h1 class="page-title">
          <span class="title-icon">
            <Icon :name="occasion?.icon || 'gift'" :size="30" :stroke-width="1.8" />
          </span>
          {{ occasion?.name || 'المناسبة' }}
        </h1>

        <p v-if="occasion" class="page-subtitle">
          {{ occasion.cta || 'احتفل بمناسبتك' }} — كل التصاميم متاحة لك
        </p>
      </div>
    </section>

    <!-- ═══════ Content ═══════ -->
    <section class="sec">
      <div class="wrap">

        <!-- ⭐ رسالة توضيحية -->
        <div v-if="occasion" class="occasion-note">
          <Icon name="sparkles" :size="20" />
          <div>
            <b>كل تصميم يناسب كل مناسبة.</b>
            <span>
              الفرق الوحيد هو العبارة اللي تُنحت على الفواكه.
              اخترنا لك «{{ messageText || occasion.name }}» — يمكنك تغيير العبارة أو حذفها من صفحة المنتج.
            </span>
          </div>
        </div>

        <!-- ⭐ Toolbar -->
        <div class="collection-toolbar">
          <div class="toolbar-count">
            <b>{{ allProducts.length }}</b>
            <span>تصميم متاح</span>
          </div>

          <NuxtLink to="/styles" class="toolbar-link">
            <Icon name="palette" :size="14" />
            تصفح حسب التصميم
          </NuxtLink>
        </div>

        <!-- ⭐ Grid — كل المنتجات مع شارة العبارة -->
        <div v-if="allProducts.length" class="prod-grid">
          <ProductCard
            v-for="p in allProducts"
            :key="p.id"
            :product="p"
            :message="messageText"
          />
        </div>

        <!-- Empty -->
        <div v-else class="empty-state">
          <Icon name="package-x" :size="48" :stroke-width="1.5" />
          <h3>لا توجد منتجات</h3>
          <NuxtLink to="/" class="btn btn-primary">
            العودة للرئيسية
          </NuxtLink>
        </div>

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

/* ═══ Page Title ═══ */
.page-title {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.title-icon {
  display: inline-grid;
  place-items: center;
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #FFF3D6 0%, #FFE8B8 100%);
  border-radius: 16px;
  color: #8A5A00;
  flex-shrink: 0;
}

.page-subtitle {
  font-size: .9rem;
  color: var(--muted);
  max-width: 620px;
  margin: 8px auto 0;
  line-height: 1.7;
}

/* ═══ Occasion Note ═══ */
.occasion-note {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 22px;
  background: linear-gradient(135deg, #FFF8EE 0%, #FFF3D6 100%);
  border: 1.5px dashed var(--gold);
  border-radius: 18px;
  margin-bottom: 20px;
  color: #7A5B00;
}

.occasion-note svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--gold);
}

.occasion-note b {
  display: block;
  margin-bottom: 4px;
  font-size: .92rem;
  color: var(--green-900);
}

.occasion-note span {
  font-size: .84rem;
  line-height: 1.7;
}

/* ═══ Toolbar ═══ */
.collection-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.toolbar-count {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 8px 16px;
  background: var(--green-50);
  border-radius: 999px;
  font-size: .82rem;
  color: var(--green-700);
}

.toolbar-count b {
  font-family: var(--ff-display);
  font-size: 1.15rem;
  color: var(--green-900);
}

.toolbar-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  font-size: .82rem;
  font-weight: 600;
  color: var(--green-900);
  text-decoration: none;
  transition: all .18s ease;
}

.toolbar-link:hover {
  border-color: var(--gold);
  background: #FFF8EE;
  color: var(--gold);
}

/* ═══ Empty State ═══ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  text-align: center;
  color: var(--muted);
}

.empty-state svg { color: var(--gold); }
.empty-state h3 {
  font-family: var(--ff-display);
  font-size: 1.3rem;
  color: var(--green-900);
  margin: 0;
}

/* ═══ Responsive ═══ */
@media (max-width: 640px) {
  .page-title { font-size: 1.4rem; gap: 8px; }
  .title-icon { width: 42px; height: 42px; border-radius: 12px; }
  .title-icon svg { width: 24px; height: 24px; }

  .occasion-note { padding: 14px 16px; }
  .occasion-note b { font-size: .85rem; }
  .occasion-note span { font-size: .78rem; }

  .collection-toolbar { gap: 8px; }
  .toolbar-count b { font-size: 1rem; }
  .toolbar-link { font-size: .75rem; padding: 8px 12px; }
}
</style>