<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { useStyles } from "~/composables/useStyles";
import { useFavorites } from "~/composables/useFavorites";
import { useToast } from "~/composables/useToast";

/* ═══ SEO ═══ */
useSeoMeta({
  title: "تصفح حسب التصميم — FA Fruits",
  description:
    "اختر نوع التصميم: سلال، أبراج، بوكيهات، تصاميم مميزة، منحوتات فنية.",
});

/* ═══ Composables ═══ */
const { styles, loading, loaded, error, load } = useStyles();
const { favorites, toggle } = useFavorites();
const { show } = useToast();

if (import.meta.server) {
  await load();
} else if (!loaded.value) {
  load();
}

/* ═══ الألوان — Heritage Palette ═══ */
const ACCENT_MAP: Record<string, string> = {
  towers:     "#6E1F2E", // burgundy
  baskets:    "#A8855B", // bronze
  signature:  "#8B2E3F", // burgundy-lt
  bouquets:   "#C9A87C", // bronze-lt
  sculptures: "#7A7065", // ink-mute
};

const ORDER = ["towers", "baskets", "signature", "bouquets", "sculptures"];

const sortedStyles = computed(() =>
  [...styles.value].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id)),
);

/* ═══ صورة الغلاف ═══ */
const getCover = (s: any) => s.cover_image || "/images/hero-fruit-tower.png";

/* ═══ Count-up Animation (SSR-safe) ═══ */
const displayCounts = ref<Record<string, number>>({});

function animateCount(id: string, target: number) {
  if (!import.meta.client) {
    displayCounts.value[id] = target;
    return;
  }
  const duration = 900;
  const start = performance.now();
  const update = (now: number) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    displayCounts.value[id] = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

onMounted(() => {
  sortedStyles.value.forEach((s) => animateCount(s.id, s.products_count || 0));
});

watch(
  () => sortedStyles.value.map((s) => `${s.id}:${s.products_count}`).join(","),
  () => {
    if (!import.meta.client) return;
    sortedStyles.value.forEach((s) => animateCount(s.id, s.products_count || 0));
  },
);

/* ═══ Spotlight Effect ═══ */
function onCardMove(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
  el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
}

/* ═══ Favorites ═══ */
const isFav = (id: string) => favorites.value.includes(id);

function onFavToggle(e: Event, id: string) {
  e.preventDefault();
  e.stopPropagation();
  toggle(id);
  show(isFav(id) ? "أُضيف للمفضلة ♥" : "أُزيل من المفضلة");
}

/* ═══ Filters ═══ */
type Filter = "all" | "most" | "fav";
const currentFilter = ref<Filter>("all");

const visibleStyles = computed(() => {
  let list = [...sortedStyles.value];
  if (currentFilter.value === "fav") list = list.filter((s) => isFav(s.id));
  if (currentFilter.value === "most")
    list = list.sort((a, b) => (b.products_count || 0) - (a.products_count || 0));
  return list;
});

const favCount = computed(() =>
  sortedStyles.value.filter((s) => isFav(s.id)).length,
);

/* ═══ Note ═══ */
const noteOpen = ref(false);
</script>

<template>
  <div class="styles-page">
    <!-- ═══════ 1. Page Head ═══════ -->
    <section class="page-head">
      <div class="page-head__inner">
        <!-- Breadcrumbs -->
        <nav class="crumbs" aria-label="breadcrumb">
          <NuxtLink to="/">الرئيسية</NuxtLink>
          <span class="crumbs__sep">/</span>
          <span class="crumbs__current">حسب التصميم</span>
        </nav>

        <!-- Eyebrow -->
        <span class="eyebrow">
          <span class="eyebrow__dot"></span>
          تصفح حسب التصميم
        </span>

        <!-- Title -->
        <h1 class="page-title">
          اختر التصميم الذي يناسب <em>مناسبتك</em>
        </h1>

        <!-- Lead -->
        <p class="page-lead">
          كل تصميم له شخصيته الخاصة — من السلال الكلاسيكية إلى الأبراج
          الفاخرة، اختر النوع الذي يعبّر عنك.
        </p>
      </div>
    </section>

    <!-- ═══════ 2. Content ═══════ -->
    <section class="sec">
      <div class="sec__inner">
        <!-- Loading -->
        <div v-if="loading && !styles.length" class="state">
          <Icon name="loader" :size="36" :stroke-width="1.8" class="state__ico state__ico--spin" />
          <p>جاري التحميل…</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="state">
          <Icon name="alert-circle" :size="48" :stroke-width="1.5" class="state__ico" />
          <h3 class="state__title">تعذر تحميل التصنيفات</h3>
          <p class="state__text">{{ error }}</p>
          <button class="btn-retry" @click="load(true)">
            <Icon name="refresh-cw" :size="16" />
            إعادة المحاولة
          </button>
        </div>

        <!-- Empty -->
        <div v-else-if="!styles.length" class="state">
          <Icon name="package-x" :size="48" :stroke-width="1.5" class="state__ico" />
          <h3 class="state__title">لا توجد تصنيفات</h3>
          <p class="state__text">سيتم إضافة التصنيفات قريبًا</p>
        </div>

        <!-- Filters + Grid -->
        <template v-else>
          <!-- ⭐ Filters -->
          <div class="filters">
            <button
              type="button"
              class="chip"
              :class="{ on: currentFilter === 'all' }"
              @click="currentFilter = 'all'"
            >
              <Icon name="layout-grid" :size="14" />
              الكل
            </button>

            <button
              type="button"
              class="chip"
              :class="{ on: currentFilter === 'most' }"
              @click="currentFilter = 'most'"
            >
              <Icon name="trending-up" :size="14" />
              الأكثر تصاميم
            </button>

            <button
              type="button"
              class="chip"
              :class="{ on: currentFilter === 'fav' }"
              @click="currentFilter = 'fav'"
            >
              <Icon name="heart" :size="14" />
              المفضلة
              <span class="chip__badge">{{ favCount }}</span>
            </button>
          </div>

          <!-- ⭐ Grid Layout -->
          <div class="styles-grid">
            <NuxtLink
              v-for="s in visibleStyles"
              :key="s.id"
              :to="`/styles/${s.id}`"
              class="card"
              :style="{ '--acc': ACCENT_MAP[s.id] || '#6E1F2E' }"
              @pointermove="onCardMove"
            >
              <!-- Image Area -->
              <div class="card__media">
                <div
                  class="card__img"
                  :style="{ backgroundImage: `url('${getCover(s)}')` }"
                />
                <span class="card__badge">
                  <Icon
                    :name="s.icon || 'sparkles'"
                    :size="16"
                    :stroke-width="2"
                  />
                </span>
                <!-- Accent Line on Top of Image -->
                <span class="card__accent-line" aria-hidden="true" />
              </div>

              <!-- Content Area -->
              <div class="card__content">
                <h2 class="card__name">{{ s.name_ar }}</h2>
                <p v-if="s.description" class="card__desc">
                  {{ s.description }}
                </p>
              </div>

              <!-- Footer / Meta Area -->
              <div class="card__meta">
                <span class="card__count">
                  <b>{{ displayCounts[s.id] ?? s.products_count ?? 0 }}</b>
                  <span>تصميم</span>
                </span>

                <div class="card__actions">
                  <button
                    type="button"
                    class="card__fav"
                    :class="{ on: isFav(s.id) }"
                    :aria-label="isFav(s.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'"
                    @click="(e) => onFavToggle(e, s.id)"
                  >
                    <Icon
                      name="heart"
                      :size="18"
                      :stroke-width="2"
                      :fill="isFav(s.id) ? 'currentColor' : 'none'"
                    />
                  </button>

                  <span class="card__cta">
                    تصفّح
                    <Icon name="arrow-left" :size="15" :stroke-width="2.4" />
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- No favorites -->
          <div
            v-if="!visibleStyles.length && currentFilter === 'fav'"
            class="state"
          >
            <Icon name="heart-off" :size="42" :stroke-width="1.5" class="state__ico" />
            <h3 class="state__title">لا توجد تصاميم في المفضلة</h3>
            <p class="state__text">اضغط على ♡ في أي تصميم لإضافته هنا</p>
          </div>

          <!-- Note -->
          <button
            type="button"
            class="note"
            :class="{ open: noteOpen }"
            @click="noteOpen = !noteOpen"
          >
            <span class="note__head">
              <Icon name="sparkles" :size="18" />
              <b>ما الفرق بين التصاميم؟</b>
              <span class="note__plus">+</span>
            </span>
            <span class="note__body">
              <span>
                الشكل، عدد الطوابق، وطريقة ترتيب الفواكه. كل تصميم يناسب كل
                مناسبة — والفرق هو العبارة التي تُنحت على الفواكه.
              </span>
            </span>
          </button>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   Styles Page — Heritage Quiet Luxury (Modern Grid Layout)
   ═══════════════════════════════════════════════════════════ */
.styles-page {
  position: relative;
  overflow-x: hidden;
}

/* ═══ 1. Page Head ═══ */
.page-head {
  position: relative;
  padding: clamp(80px, 12vh, 140px) 0 clamp(40px, 6vh, 70px);
  
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

/* Breadcrumbs */
.crumbs {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--ink-mute);
  margin-bottom: 22px;
  letter-spacing: 0.02em;
}
.crumbs a {
  color: var(--ink-soft);
  text-decoration: none;
  transition: color 0.25s ease;
}
.crumbs a:hover { color: var(--burgundy); }
.crumbs__sep { opacity: 0.4; }
.crumbs__current { color: var(--burgundy); font-weight: 700; }

/* Eyebrow */
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

/* Title */
.page-title {
  margin: 0 0 18px;
  font-size: clamp(32px, 4.5vw, 60px);
  font-weight: 300;
  line-height: 1.28;
  color: var(--ink);
  letter-spacing: -0.005em;
  max-width: 820px;
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

/* Lead */
.page-lead {
  margin: 0;
  font-size: clamp(14px, 1.05vw, 15.5px);
  line-height: 1.95;
  color: var(--ink-soft);
  max-width: 560px;
  font-weight: 400;
}

/* ═══ 2. Section ═══ */
.sec {
  position: relative;
  padding: clamp(40px, 6vh, 70px) 0 clamp(60px, 9vh, 110px);
  background:
    radial-gradient(70% 50% at 100% 0%, #FCF8F2 0%, rgba(252, 248, 242, 0) 60%),
    radial-gradient(60% 50% at 0% 100%, #E8DCCB 0%, rgba(232, 220, 203, 0) 60%),
    linear-gradient(180deg, #EFE6DA 0%, #F7F2EC 55%, #F2EAE0 100%);
}
.sec__inner {
  width: min(1280px, 92vw);
  margin: 0 auto;
}

/* ═══ Filters ═══ */
.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: 30px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.65);
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  font: 700 13px inherit;
  font-family: inherit;
  color: var(--ink);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  white-space: nowrap;
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  backdrop-filter: blur(12px) saturate(1.4);
  box-shadow: 0 8px 18px -14px rgba(50, 35, 20, 0.4);
}
.chip svg {
  color: var(--bronze);
  transition: color 0.25s ease;
}
.chip:hover {
  background: #fff;
  border-color: rgba(110, 31, 46, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -16px rgba(110, 31, 46, 0.5);
}
.chip.on {
  background: linear-gradient(150deg, #8B2E3F 0%, #6E1F2E 100%);
  border-color: transparent;
  color: #FBEFE0;
  box-shadow:
    0 14px 28px -12px rgba(110, 31, 46, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.12) inset;
}
.chip.on svg { color: #FBEFE0; }

.chip__badge {
  display: inline-grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  background: rgba(110, 31, 46, 0.1);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  color: var(--burgundy);
}
.chip.on .chip__badge {
  background: rgba(251, 239, 224, 0.2);
  color: #FBEFE0;
}

/* ═══ 3. Modern Grid Layout ═══ */
.styles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* ═══ Card ═══ */
.card {
  --mx: 50%;
  --my: 50%;
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1.5px solid rgba(27, 23, 20, 0.08);
  border-radius: 24px;
  text-decoration: none;
  color: var(--ink);
  isolation: isolate;
  overflow: hidden;
  transition:
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Spotlight */
.card::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 10; /* Above image, below content */
  background: radial-gradient(
    600px circle at var(--mx) var(--my),
    color-mix(in srgb, var(--acc) 8%, transparent),
    transparent 65%
  );
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
}

.card:hover {
  transform: translateY(-6px);
  border-color: color-mix(in srgb, var(--acc) 45%, transparent);
  box-shadow:
    0 24px 48px -24px color-mix(in srgb, var(--acc) 60%, transparent),
    0 4px 12px -6px rgba(27, 23, 20, 0.08);
}
.card:hover::before { opacity: 1; }

/* ═══ Card Media ═══ */
.card__media {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background-color: var(--cream);
}

.card__img {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.card:hover .card__img {
  transform: scale(1.06);
}

/* Accent Line (Top of Image) */
.card__accent-line {
  position: absolute;
  top: 0;
  inset-inline: 0;
  height: 4px;
  background: var(--acc);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 2;
}
.card:hover .card__accent-line {
  transform: scaleX(1);
}

/* Badge */
.card__badge {
  position: absolute;
  top: 16px;
  inset-inline-end: 16px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  color: var(--acc);
  box-shadow:
    0 4px 12px rgba(27, 23, 20, 0.14),
    0 0 0 2px rgba(255, 255, 255, 0.8);
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 3;
}
.card:hover .card__badge {
  background: var(--acc);
  color: #fff;
  transform: scale(1.1) rotate(-8deg);
}

/* ═══ Card Content ═══ */
.card__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px 24px 16px;
  flex-grow: 1;
  z-index: 2;
}

.card__name {
  font-family: "Playfair Display", "Almarai", serif;
  font-size: 1.35rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
  color: var(--ink);
  letter-spacing: -0.01em;
  transition: color 0.3s ease;
}
.card:hover .card__name {
  color: var(--acc);
}

.card__desc {
  font-size: 13.5px;
  color: var(--ink-mute);
  margin: 0;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ═══ Card Meta / Footer ═══ */
.card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px 20px;
  border-top: 1px dashed rgba(27, 23, 20, 0.08);
  margin-top: auto;
  z-index: 2;
}

/* Count */
.card__count {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  padding: 6px 14px;
  background: rgba(168, 133, 91, 0.08);
  border: 1px solid rgba(168, 133, 91, 0.2);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: var(--bronze);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.card__count b {
  font-family: "Playfair Display", serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--bronze);
  line-height: 1;
  transition: color 0.3s ease;
}
.card__count span { opacity: 0.85; }

.card:hover .card__count {
  background: var(--acc);
  border-color: var(--acc);
  color: #FBEFE0;
}
.card:hover .card__count b { color: #FBEFE0; }

/* Actions Container */
.card__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Fav Button */
.card__fav {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  background: rgba(247, 242, 236, 0.7);
  border: 1.5px solid rgba(27, 23, 20, 0.08);
  border-radius: 50%;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}
.card__fav:hover {
  border-color: var(--burgundy);
  color: var(--burgundy);
  transform: scale(1.08);
  background: #fff;
}
.card__fav.on {
  background: linear-gradient(150deg, #8B2E3F, #6E1F2E);
  border-color: var(--burgundy);
  color: #fff;
  transform: scale(1.05);
  box-shadow: 0 8px 18px -8px rgba(110, 31, 46, 0.55);
}

/* CTA Button */
.card__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--ink);
  color: #FBEFE0;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 800;
  white-space: nowrap;
  letter-spacing: 0.01em;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  flex-shrink: 0;
}
.card:hover .card__cta {
  background: var(--acc);
  gap: 12px;
  box-shadow: 0 10px 22px -12px color-mix(in srgb, var(--acc) 70%, transparent);
}

/* ═══ States ═══ */
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
.state__ico--spin { animation: spin 1.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

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
  max-width: 340px;
  line-height: 1.7;
}

.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  margin-top: 6px;
  background: linear-gradient(150deg, #8B2E3F, #6E1F2E);
  color: #FBEFE0;
  border: 0;
  border-radius: 999px;
  font: 800 13.5px inherit;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 14px 28px -14px rgba(110, 31, 46, 0.6);
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 36px -16px rgba(110, 31, 46, 0.7);
}

/* ═══ Note ═══ */
.note {
  all: unset;
  box-sizing: border-box;
  display: grid;
  width: 100%;
  margin-top: 40px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #FDFAF6 0%, #F5EFE7 100%);
  border: 1.5px dashed rgba(168, 133, 91, 0.5);
  border-radius: 22px;
  cursor: pointer;
  transition: all 0.35s ease;
  color: var(--ink);
}
.note:hover {
  border-style: solid;
  border-color: var(--bronze);
  box-shadow: 0 12px 28px -16px rgba(168, 133, 91, 0.5);
  transform: translateY(-2px);
}

.note__head {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}
.note__head svg {
  color: var(--bronze);
  flex-shrink: 0;
}
.note__head b {
  flex: 1;
  color: var(--ink);
  font-weight: 800;
}
.note__plus {
  font-size: 1.5rem;
  line-height: 1;
  color: var(--bronze);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.note.open .note__plus { transform: rotate(45deg); }

.note__body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}
.note.open .note__body { grid-template-rows: 1fr; }
.note__body > span {
  display: block;
  overflow: hidden;
  padding: 0;
  font-size: 13.5px;
  line-height: 1.85;
  color: var(--ink-soft);
  opacity: 0;
  transition: all 0.4s ease;
}
.note.open .note__body > span {
  padding-top: 14px;
  opacity: 1;
}

/* ═══════════════════════════════════════════════════════════
   Responsive
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 640px) {
  .page-title { font-size: clamp(26px, 7vw, 34px); }
  .page-lead { font-size: 13.5px; }
  .filters { gap: 6px; margin-bottom: 20px; }
  .chip { padding: 8px 14px; font-size: 12px; }

  .styles-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .card__media { height: 200px; }
  .card__content { padding: 20px 20px 12px; }
  .card__name { font-size: 1.2rem; }
  .card__desc { font-size: 12.5px; }
  
  .card__meta { padding: 14px 20px 16px; }
  .card__count { padding: 5px 12px; font-size: 11.5px; }
  .card__count b { font-size: 1.15rem; }
  .card__fav { width: 36px; height: 36px; }
  .card__cta { padding: 8px 16px; font-size: 11.5px; }

  .state { padding: 60px 20px; }
  .state__title { font-size: 1.2rem; }
}

/* ═══════════════════════════════════════════════════════════
   Reduced Motion
   ═══════════════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .card,
  .card__img,
  .card__badge,
  .card__cta,
  .card__count,
  .card__fav,
  .note__plus,
  .card__accent-line,
  .state__ico--spin {
    animation: none !important;
    transition: none !important;
  }
}

</style>