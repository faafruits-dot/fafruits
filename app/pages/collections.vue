<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'

const { products } = useProducts()
const route = useRoute()

const filter = ref((route.query.filter as string) || 'all')

const filters = [
  { id: 'all',    label: 'الكل',          icon: 'layout-grid' },
  { id: 'ready',  label: 'جاهز اليوم',    icon: 'truck' },
  { id: 'luxury', label: 'فاخر',          icon: 'sparkles' },
  { id: 'best',   label: 'الأكثر مبيعًا', icon: 'star' },
  { id: 'offers', label: 'عروض',          icon: 'tag' },
] as const

const list = computed(() => {
  switch (filter.value) {
    case 'ready': return products.value.filter(p => p.ready)
    case 'luxury': return products.value.filter(p => p.luxury)
    case 'best': return products.value.filter(p => p.best)
    case 'offers': return products.value.filter(p => p.price < 25)
    default: return products.value
  }
})
</script>

<template>
  <div class="collections-page">
    <!-- ═══════ Page Head ═══════ -->
    <section class="page-head">
      <div class="page-head__inner">
        <nav class="crumbs" aria-label="breadcrumb">
          <NuxtLink to="/">الرئيسية</NuxtLink>
          <span class="crumbs__sep">/</span>
          <span class="crumbs__current">المجموعات</span>
        </nav>

        <span class="eyebrow">
          <span class="eyebrow__dot"></span>
          تصفح المتجر
        </span>

        <h1 class="page-title">
          كل <em>المجموعات</em>
        </h1>

        <p class="page-lead">
          اكتشف كل تصاميمنا في مكان واحد — فلاتر ذكية تساعدك تختار الأنسب.
        </p>
      </div>
    </section>

    <!-- ═══════ Content ═══════ -->
    <section class="sec">
      <div class="sec__inner">
        <!-- ⭐ Filters -->
        <div class="filters-wrap">
          <div class="filters" role="tablist" aria-label="فلترة المنتجات">
            <button
              v-for="f in filters"
              :key="f.id"
              type="button"
              role="tab"
              :aria-selected="filter === f.id"
              :class="['chip', { on: filter === f.id }]"
              @click="filter = f.id"
            >
              <Icon :name="f.icon" :size="14" />
              <span>{{ f.label }}</span>
            </button>
          </div>
        </div>

        <!-- ⭐ Grid -->
        <div v-if="list.length" class="prod-grid">
          <ProductCard v-for="p in list" :key="p.id" :product="p" />
        </div>

        <!-- Empty -->
        <div v-else class="state">
          <Icon name="package-x" :size="48" :stroke-width="1.5" class="state__ico" />
          <h3 class="state__title">لا توجد منتجات</h3>
          <p class="state__text">جرّب فلتر آخر</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   Collections Page — Heritage
   ═══════════════════════════════════════════════════════════ */
.collections-page {
  overflow-x: hidden;
}

/* ═══ Page Head ═══ */
.page-head {
  position: relative;
  padding: clamp(80px, 12vh, 140px) 0 clamp(40px, 6vh, 70px);
  background:
    radial-gradient(110% 80% at 88% 6%, #fdfaf6 0%, rgba(253, 250, 246, 0) 58%),
    radial-gradient(90% 70% at 6% 98%, #e0d2c0 0%, rgba(224, 210, 192, 0) 62%),
    linear-gradient(155deg, #f5efe7 0%, #ebe2d6 42%, #dbcdbd 100%);
  overflow: hidden;
  isolation: isolate;
  text-align: center;
}

.page-head::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
  opacity: 0.28;
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: 1;
}

.page-head__inner {
  position: relative;
  z-index: 2;
  width: min(1280px, 92vw);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.crumbs {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--ink-mute);
  margin-bottom: 22px;
}
.crumbs a {
  color: var(--ink-soft);
  text-decoration: none;
  transition: color 0.25s ease;
}
.crumbs a:hover { color: var(--burgundy); }
.crumbs__sep { opacity: 0.4; }
.crumbs__current { color: var(--burgundy); font-weight: 700; }

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
  font-weight: 800;
  color: var(--ink-soft);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.85);
  padding: 8px 16px 8px 14px;
  border-radius: 999px;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 26px -18px rgba(27, 23, 20, 0.6);
  margin-bottom: 22px;
}
.eyebrow__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--bronze);
  box-shadow: 0 0 0 4px rgba(168, 133, 91, 0.18);
  flex-shrink: 0;
}

.page-title {
  margin: 0 0 18px;
  font-size: clamp(32px, 4.5vw, 60px);
  font-weight: 300;
  line-height: 1.28;
  color: var(--ink);
}
.page-title em {
  font-family: "Amiri", serif;
  font-style: normal;
  font-weight: 700;
  color: var(--burgundy);
  position: relative;
  padding-inline-end: 4px;
}
.page-title em::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: 6px;
  height: 7px;
  background: linear-gradient(90deg, rgba(110, 31, 46, 0.22), rgba(110, 31, 46, 0));
  border-radius: 4px;
  z-index: -1;
}

.page-lead {
  margin: 0;
  font-size: clamp(14px, 1.05vw, 15.5px);
  line-height: 1.95;
  color: var(--ink-soft);
  max-width: 560px;
}

/* ═══ Section ═══ */
.sec {
  position: relative;
  padding: clamp(30px, 5vh, 60px) 0 clamp(60px, 9vh, 110px);
  background:
    radial-gradient(70% 50% at 100% 0%, #fcf8f2 0%, rgba(252, 248, 242, 0) 60%),
    radial-gradient(60% 50% at 0% 100%, #e8dccb 0%, rgba(232, 220, 203, 0) 60%),
    linear-gradient(180deg, #efe6da 0%, #f7f2ec 55%, #f2eae0 100%);
}
.sec__inner {
  width: min(1280px, 92vw);
  margin: 0 auto;
}

/* ═══════════════════════════════════════════════════════════
   ⭐ Filters — FIXED
   ═══════════════════════════════════════════════════════════ */
.filters-wrap {
  position: relative;
  margin-bottom: 28px;
}

/* Fade على الحواف — يبان كأنه تلاشى */
/* .filters-wrap::before,
.filters-wrap::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 32px;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
} */

/* .filters-wrap::before {
  inset-inline-start: 0;
  background: linear-gradient(to left, transparent, var(--cream, #efe6da));
}
.filters-wrap::after {
  inset-inline-end: 0;
  background: linear-gradient(to right, transparent, var(--cream, #efe6da));
} */

/* على الموبايل، الفلاتر بتسكرول أفقي */
.filters {
  display: flex;
  gap: 8px;
  /* overflow-x: auto;
  overflow-y: hidden; */
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 4px 0 6px;
  scroll-snap-type: x proximity;
  scroll-padding-inline-start: 4vw;
  /* ⭐ مفيش overflow: visible هنا */
}

.filters::-webkit-scrollbar {
  display: none;
}

.chip {
  flex: 0 0 auto;
  scroll-snap-align: start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.7);
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  font: 700 13px inherit;
  font-family: inherit;
  color: var(--ink);
  cursor: pointer;
  white-space: nowrap;
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  backdrop-filter: blur(12px) saturate(1.4);
  box-shadow: 0 8px 18px -14px rgba(50, 35, 20, 0.4);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.chip :deep(svg) {
  color: var(--bronze);
  flex-shrink: 0;
  transition: color 0.25s ease;
}

.chip:hover {
  background: #fff;
  border-color: rgba(110, 31, 46, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -16px rgba(110, 31, 46, 0.5);
}

.chip.on {
  background: linear-gradient(150deg, #8b2e3f 0%, #6e1f2e 100%);
  border-color: transparent;
  color: #fbefe0;
  box-shadow:
    0 14px 28px -12px rgba(110, 31, 46, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.12) inset;
}

.chip.on :deep(svg) { color: #fbefe0; }

/* ═══════════════════════════════════════════════════════════
   ⭐ Product Grid — Responsive
   ═══════════════════════════════════════════════════════════ */
.prod-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(14px, 1.6vw, 22px);
}

@media (max-width: 1080px) {
  .prod-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .prod-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 400px) {
  .prod-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

/* ═══ State ═══ */
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 80px 20px;
  text-align: center;
  color: var(--ink-mute);
}
.state__ico { color: var(--bronze); opacity: 0.7; }
.state__title {
  font-family: "Playfair Display", serif;
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--ink);
  margin: 0;
}
.state__text {
  font-size: 13.5px;
  margin: 0;
  line-height: 1.7;
}

/* ═══════════════════════════════════════════════════════════
   Responsive — Mobile
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .filters-wrap {
    margin-bottom: 22px;
  }

  /* ⭐ على الموبايل، الـ fade يظهر */
  .filters-wrap::before,
  .filters-wrap::after {
    opacity: 1;
  }

  .chip {
    padding: 9px 15px;
    font-size: 12.5px;
    gap: 6px;
  }

  .chip :deep(svg) {
    width: 13px;
    height: 13px;
  }

  /* ⭐ نخرج الفلاتر من الـ container عشان تاخد عرض الشاشة كامل */
  .filters {
    margin-inline: -4vw;
    padding-inline: 4vw;
    scroll-padding-inline-start: 4vw;
  }
}

@media (max-width: 480px) {
  .page-title { font-size: clamp(26px, 7vw, 34px); }
  .page-lead { font-size: 13px; }
  .eyebrow { font-size: 11.5px; padding: 7px 14px 7px 12px; }
  .crumbs { font-size: 11px; }

  .chip {
    padding: 8px 14px;
    font-size: 12px;
    gap: 5px;
  }

  .state { padding: 60px 20px; }
  .state__title { font-size: 1.2rem; }
}

/* ═══ Reduced motion ═══ */
@media (prefers-reduced-motion: reduce) {
  .chip,
  .filters {
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
</style>