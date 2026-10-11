<script setup lang="ts">
import { useProducts } from "~/composables/useProducts";
import { OCCASIONS } from "~/data/seed";

const { products } = useProducts();

/* ═══ SEO ═══ */
useSeoMeta({
  title: "المناسبات — FA Fruits",
  description:
    "اختر مناسبتك — وبنحفر العبارة المناسبة على الفواكه. كل تصميم يناسب كل مناسبة.",
});

/* ═══ كل المنتجات ═══ */
const totalProducts = computed(
  () => products.value.filter((p) => p.available !== false).length,
);

/* ═══ منتجات مميزة ═══ */
const featuredProducts = computed(() =>
  products.value.filter((p) => p.available !== false && p.best).slice(0, 4),
);

/* ═══ خريطة عبارات المناسبات ═══ */
const OCCASION_MESSAGES: Record<string, string> = {
  birthday: "كل عام وأنت بخير",
  wedding: "مبروك الزواج",
  newbaby: "مبروك المولود",
  graduation: "مبروك التخرج",
  anniversary: "عقبال ١٠٠ سنة",
  ramadan: "رمضان مبارك",
  justbecause: "هدية من القلب",
};

/* ⭐ خريطة الألوان لكل مناسبة */
const OCCASION_COLORS: Record<
  string,
  { primary: string; secondary: string; soft: string; text: string }
> = {
  birthday: {
    primary: "#f59a23",
    secondary: "#ffb020",
    soft: "#fff4d6",
    text: "#8a5a00",
  },
  wedding: {
    primary: "#7c5cff",
    secondary: "#9b7fff",
    soft: "#f0ecff",
    text: "#4a2e9e",
  },
  newbaby: {
    primary: "#e94a63",
    secondary: "#f4726e",
    soft: "#ffe4e9",
    text: "#9e1e35",
  },
  graduation: {
    primary: "#2f5d3f",
    secondary: "#4ca83d",
    soft: "#e7f4e9",
    text: "#1a3a26",
  },
  anniversary: {
    primary: "#d43a52",
    secondary: "#e94a63",
    soft: "#ffe4e9",
    text: "#8a1e32",
  },
  ramadan: {
    primary: "#1a4d2e",
    secondary: "#2f6b3f",
    soft: "#dff5e7",
    text: "#0f2e1b",
  },
  justbecause: {
    primary: "#ffb020",
    secondary: "#f59a23",
    soft: "#fff4d6",
    text: "#8a5a00",
  },
};

/* ⭐ مناسبات مميزة (badge) */
const FEATURED_OCCASIONS = ["birthday", "wedding", "ramadan"];

const getMessage = (id: string) => OCCASION_MESSAGES[id] || null;
const getColors = (id: string) =>
  OCCASION_COLORS[id] || OCCASION_COLORS.birthday;
const isFeatured = (id: string) => FEATURED_OCCASIONS.includes(id);
</script>

<template>
  <div>
    <!-- ═══════ Page Head ═══════ -->
    <section class="page-head">
      <div class="wrap">
        <div class="crumbs">
          <NuxtLink to="/">الرئيسية</NuxtLink>
          <span class="sep">/</span>
          <span class="current">المناسبات</span>
        </div>

        <h1 class="page-title">
          <span class="title-icon">
            <Icon name="party-popper" :size="30" :stroke-width="1.8" />
          </span>
          اختر مناسبتك
        </h1>

        <p class="page-subtitle">
          كل هدية تحكي حكاية — اختر اللحظة ونحفر عبارتها على الفواكه
        </p>
      </div>
    </section>

    <!-- ═══════ Concept Note ═══════ -->
    <section class="sec" style="padding-top: 10px">
      <div class="wrap">
        <div class="concept-note">
          <span class="cn-icon">
            <Icon name="sparkles" :size="20" />
          </span>
          <div>
            <b>كل تصميم يناسب كل مناسبة.</b>
            <span>
              بنسألك عن المناسبة عشان نقترح عليك العبارة المناسبة اللي هتتحفر
              على الفواكه — لكن الـ {{ totalProducts }} تصميم متاحة لأي مناسبة.
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════ Occasions Grid ═══════ -->
    <section class="sec" style="padding-top: 0">
      <div class="wrap">
        <div class="sec-head">
          <div>
            <h2>🎉 تصفح المناسبات</h2>
            <p>{{ OCCASIONS.length }} مناسبات — اختر ما يناسبك</p>
          </div>
        </div>

        <div class="occasions-grid">
          <NuxtLink
            v-for="o in OCCASIONS"
            :key="o.id"
            :to="`/occasions/${o.id}`"
            class="occasion-card"
            :style="{
              '--c1': getColors(o.id).primary,
              '--c2': getColors(o.id).secondary,
              '--c-soft': getColors(o.id).soft,
              '--c-text': getColors(o.id).text,
            }"
          >
            <!-- ⭐ Badge "الأكثر طلبًا" -->
            <span v-if="isFeatured(o.id)" class="oc-badge">
              <Icon name="flame" :size="12" :stroke-width="2.5" />
              الأكثر طلبًا
            </span>

            <!-- ⭐ أيقونة كبيرة في دائرة بيضاء -->
            <span class="oc-icon">
              <Icon :name="o.icon" :size="34" :stroke-width="1.9" />
            </span>

            <!-- ⭐ الاسم -->
            <h3 class="oc-name">{{ o.name }}</h3>

            <!-- ⭐ العبارة -->
            <div v-if="getMessage(o.id)" class="oc-message">
              <Icon name="feather" :size="12" />
              <span>«{{ getMessage(o.id) }}»</span>
            </div>

            <!-- ⭐ Footer -->
            <div class="oc-foot">
              <span class="oc-count">
                <b>{{ totalProducts }}</b>
                تصميم
              </span>
              <span class="oc-cta">
                اختر
                <Icon name="arrow-left" :size="14" :stroke-width="2.4" />
              </span>
            </div>

            <!-- ⭐ زخرفة خلفية -->
            <span class="oc-blob" aria-hidden="true"></span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══════ Featured Products ═══════ -->
    <section v-if="featuredProducts.length" class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div>
            <h2>🔥 الأكثر طلبًا</h2>
            <p>اختيارات العملاء هذا الشهر</p>
          </div>
          <NuxtLink to="/collections" class="link-more">
            عرض الكل
            <Icon name="chevron-left" :size="16" :stroke-width="2.4" />
          </NuxtLink>
        </div>

        <div class="prod-grid">
          <ProductCard
            v-for="p in featuredProducts"
            :key="p.id"
            :product="p"
          />
        </div>
      </div>
    </section>

    <!-- ═══════ Cross-link ═══════ -->
    <section class="sec">
      <div class="wrap">
        <div class="cross-link-card">
          <span class="cross-link-icon">
            <Icon name="palette" :size="32" :stroke-width="1.8" />
          </span>
          <div class="cross-link-body">
            <h3>تفضّل تختار حسب الشكل؟</h3>
            <p>سلال، أبراج، بوكيهات، تصاميم مميزة، منحوتات فنية</p>
          </div>
          <NuxtLink to="/styles" class="cross-link-btn">
            تصفح حسب التصميم
            <Icon name="chevron-left" :size="16" :stroke-width="2.4" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════
   Breadcrumbs
   ═══════════════════════════════════════════════════ */
.crumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--muted);
  margin-bottom: 14px;
  flex-wrap: wrap;
  justify-content: center;
}
.crumbs a {
  color: var(--green-700);
  text-decoration: none;
  transition: color 0.15s ease;
}
.crumbs a:hover {
  color: var(--gold);
}
.crumbs .sep {
  opacity: 0.5;
}
.crumbs .current {
  color: var(--green-900);
  font-weight: 600;
}

/* ═══════════════════════════════════════════════════
   Page Title
   ═══════════════════════════════════════════════════ */
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
  background: linear-gradient(135deg, #fff3d6 0%, #ffe8b8 100%);
  border-radius: 16px;
  color: #8a5a00;
  flex-shrink: 0;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--muted);
  max-width: 620px;
  margin: 8px auto 0;
  line-height: 1.7;
}

/* ═══════════════════════════════════════════════════
   Concept Note
   ═══════════════════════════════════════════════════ */
.concept-note {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff8ee 0%, #fff3d6 100%);
  border: 1.5px dashed var(--gold);
  border-radius: 18px;
  color: #7a5b00;
}

.cn-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 12px;
  color: var(--gold);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(245, 154, 35, 0.15);
}

.concept-note b {
  display: block;
  margin-bottom: 4px;
  font-size: 0.95rem;
  color: var(--green-900);
}

.concept-note span {
  font-size: 0.85rem;
  line-height: 1.7;
}

/* ═══════════════════════════════════════════════════
   Occasions Grid (تم التعديل ليعرض 3 كروت في الصف)
   ═══════════════════════════════════════════════════ */
.occasions-grid {
  display: grid;
  /* الافتراضي للجوال: عمود واحد */
  grid-template-columns: 1fr;
  gap: 16px;
}

/* التابلت: عمودين */
@media (min-width: 768px) {
  .occasions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
}

/* الديسكتوب: 3 أعمدة بالضبط */
@media (min-width: 1024px) {
  .occasions-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
  }
}

/* ═══════════════════════════════════════════════════
   Occasion Card — التصميم الحالي (لم يتغير)
   ═══════════════════════════════════════════════════ */
.occasion-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  padding: 28px 20px 20px;
  /* background: #fff; */
  border: 1px solid var(--line);
  border-radius: 24px;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  isolation: isolate;

  transition:
    transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1),
    box-shadow 0.35s ease,
    border-color 0.3s ease;
}

/* ⭐ الشريط العلوي الملوّن */
.occasion-card::before {
  content: "";
  position: absolute;
  top: 0;
  inset-inline: 0;
  height: 6px;
  background: linear-gradient(90deg, var(--c1), var(--c2));
  z-index: 2;
  display: none;
}

/* ⭐ زخرفة خلفية دائرية */
.oc-blob {
  position: absolute;
  top: -60px;
  inset-inline-end: -60px;
  width: 180px;
  height: 180px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--c1) 12%, transparent) 0%,
    transparent 70%
  );
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
  transition: transform 0.5s ease;
}

.occasion-card:hover .oc-blob {
  transform: scale(1.3);
}

/* ⭐ Hover — رفع + ظل ملوّن */
.occasion-card:hover {
  transform: translateY(-6px);
  border-color: var(--c1);
  box-shadow:
    0 20px 40px -20px color-mix(in srgb, var(--c1) 60%, transparent),
    0 0 0 1px color-mix(in srgb, var(--c1) 20%, transparent);
}

/* ⭐ Badge "الأكثر طلبًا" */
.oc-badge {
  position: absolute;
  top: 14px;
  inset-inline-start: 14px;
  z-index: 3;

  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: linear-gradient(135deg, var(--c1), var(--c2));
  color: #fff;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--c1) 45%, transparent);
  animation: badgePulse 2.5s ease-in-out infinite;
}

@keyframes badgePulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.04);
  }
}

/* ⭐ الأيقونة الكبيرة */
.oc-icon {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  background: var(--c-soft);
  color: var(--c1);
  border-radius: 22px;
  margin-bottom: 16px;

  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 20px -8px color-mix(in srgb, var(--c1) 30%, transparent);
}

.occasion-card:hover .oc-icon {
  transform: rotate(-6deg) scale(1.08);
  background: linear-gradient(135deg, var(--c1), var(--c2));
  color: #fff;
  box-shadow: 0 12px 28px -8px color-mix(in srgb, var(--c1) 55%, transparent);
}

/* ⭐ الاسم */
.oc-name {
  position: relative;
  z-index: 1;
  font-family: var(--ff-display);
  font-size: 1.3rem;
  color: var(--green-900);
  margin: 0 0 10px;
  line-height: 1.25;
  letter-spacing: -0.3px;
}

/* ⭐ العبارة */
.oc-message {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: var(--c-soft);
  color: var(--c-text);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  margin-bottom: 16px;
  border: 1px solid color-mix(in srgb, var(--c1) 20%, transparent);
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.oc-message svg {
  flex-shrink: 0;
  color: var(--c1);
}

/* ⭐ Footer */
.oc-foot {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding-top: 14px;
  margin-top: auto;
  border-top: 1px dashed var(--line);
}

.oc-count {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  font-size: 0.72rem;
  color: var(--muted);
  font-weight: 600;
}

.oc-count b {
  font-family: var(--ff-display);
  font-size: 1rem;
  color: var(--c1);
  font-weight: 700;
}

/* ⭐ زر "اختر" */
.oc-cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  background: linear-gradient(135deg, var(--c1), var(--c2));
  color: #fff;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 4px 12px -4px color-mix(in srgb, var(--c1) 50%, transparent);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.occasion-card:hover .oc-cta {
  transform: translateX(-4px);
  box-shadow: 0 6px 18px -4px color-mix(in srgb, var(--c1) 70%, transparent);
}

/* ═══════════════════════════════════════════════════
   Cross-link Card
   ═══════════════════════════════════════════════════ */
.cross-link-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #fff0f5 0%, #f5e8ff 100%);
  border: 2px solid #e8c4e0;
  border-radius: 22px;
  transition: all 0.25s ease;
  flex-wrap: wrap;
}

.cross-link-card:hover {
  border-color: var(--plum);
  box-shadow: 0 12px 32px rgba(124, 92, 255, 0.15);
}

.cross-link-icon {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  background: #fff;
  border-radius: 20px;
  color: var(--plum);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(124, 92, 255, 0.15);
}

.cross-link-body {
  flex: 1;
  min-width: 180px;
}

.cross-link-body h3 {
  font-family: var(--ff-display);
  font-size: 1.3rem;
  color: var(--green-900);
  margin: 0 0 4px;
}

.cross-link-body p {
  font-size: 0.85rem;
  color: var(--muted);
  margin: 0;
  line-height: 1.6;
}

.cross-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, var(--plum), #9b7fff);
  color: #fff;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.18s ease;
  box-shadow: 0 6px 16px rgba(124, 92, 255, 0.3);
  flex-shrink: 0;
}

.cross-link-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
  box-shadow: 0 10px 24px rgba(124, 92, 255, 0.4);
}

/* ═══════════════════════════════════════════════════
   Responsive (تم تنظيف القواعد القديمة لتتناسب مع الشبكة الجديدة)
   ═══════════════════════════════════════════════════ */
@media (max-width: 767px) {
  .page-title {
    font-size: 1.4rem;
    gap: 8px;
  }

  .title-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
  }

  .title-icon svg {
    width: 24px;
    height: 24px;
  }

  .concept-note {
    padding: 16px 18px;
    gap: 12px;
  }

  .cn-icon {
    width: 36px;
    height: 36px;
  }

  .concept-note b {
    font-size: 0.88rem;
  }

  .concept-note span {
    font-size: 0.78rem;
  }

  .occasion-card {
    padding: 22px 16px 16px;
    border-radius: 20px;
  }

  .oc-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    margin-bottom: 12px;
  }

  .oc-icon svg {
    width: 28px;
    height: 28px;
  }

  .oc-name {
    font-size: 1.15rem;
    margin-bottom: 8px;
  }

  .oc-message {
    font-size: 0.68rem;
    padding: 5px 10px;
    margin-bottom: 12px;
  }

  .oc-foot {
    padding-top: 12px;
  }

  .oc-count b {
    font-size: 0.92rem;
  }

  .oc-cta {
    padding: 6px 12px;
    font-size: 0.72rem;
  }

  .oc-badge {
    top: 12px;
    inset-inline-start: 12px;
    font-size: 0.62rem;
    padding: 3px 8px;
  }

  .cross-link-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
    gap: 14px;
  }

  .cross-link-icon {
    width: 56px;
    height: 56px;
  }

  .cross-link-body h3 {
    font-size: 1.15rem;
  }

  .cross-link-btn {
    width: 100%;
    justify-content: center;
  }
}

/* ═══════════════════════════════════════════════════
   Reduced Motion
   ═══════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .occasion-card,
  .oc-icon,
  .oc-cta,
  .oc-blob,
  .oc-badge {
    transition: none !important;
    animation: none !important;
  }
}
</style>