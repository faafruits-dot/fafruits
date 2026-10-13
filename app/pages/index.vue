<script setup lang="ts">
import { useProducts } from "~/composables/useProducts";
import { useStyles } from "~/composables/useStyles";
import { OCCASIONS } from "~/data/seed";

/* ═══ Composables ═══ */
const { products } = useProducts();

/* ═══ جلب تصنيفات التصاميم — بنفس composable صفحة /styles ═══ */
const {
  styles: remoteStyles,
  loaded: stylesLoaded,
  load: loadStyles,
} = useStyles();

if (import.meta.server) {
  await loadStyles();
} else if (!stylesLoaded.value) {
  loadStyles();
}

/* ═══ المنتجات المفلترة ═══ */
const bestSellers = computed(() =>
  products.value.filter((p) => p.best).slice(0, 4),
);

/* ═══ التصاميم (Designs) — الأساس المحلي ═══ */
const baseDesigns = [
  {
    id: "baskets",
    ar: "سلال وتشكيلات",
    en: "Baskets & Arrangements",
    count: "٢٤",
    cls: "d-card--wide",
    grad: "linear-gradient(160deg,#E8C9A0 0%,#C89765 45%,#8C5A2E 100%)",
    img: "/images/products/P11.png",
  },
  {
    id: "bouquets",
    ar: "بوكيهات وأسياخ",
    en: "Bouquets & Skewers",
    count: "١٨",
    cls: "d-card--tall",
    grad: "linear-gradient(160deg,#E5B8B0 0%,#B96B63 45%,#6E2F2A 100%)",
    img: "/images/products/P42.png",
  },
  {
    id: "sculptures",
    ar: "منحوتات فنية",
    en: "Art Sculptures",
    count: "١٢",
    cls: "d-card--sq",
    grad: "linear-gradient(160deg,#C8CEB8 0%,#8A9A78 45%,#43513A 100%)",
    img: "/images/products/P15.png",
  },
  {
    id: "signature",
    ar: "تصاميم مميزة",
    en: "Signature Designs",
    count: "٣١",
    cls: "d-card--sq",
    grad: "linear-gradient(160deg,#F0E4CE 0%,#C9A87C 45%,#7A5A34 100%)",
    img: "/images/products/P04.png",
  },
  {
    id: "towers",
    ar: "أبراج فاخرة",
    en: "Luxury Towers",
    count: "٩",
    cls: "d-card--sq",
    grad: "linear-gradient(160deg,#D9C2CC 0%,#9A6B85 45%,#4A2B3E 100%)",
    img: "/images/products/P33.png",
  },
];

/* ═══ دمج بيانات Supabase — تغيير العنوان والصورة فقط ═══ */
const designs = computed(() => {
  const list = Array.isArray(remoteStyles.value) ? remoteStyles.value : [];

  const map = new Map(list.map((s) => [s.id, s]));

  return baseDesigns.map((d) => {
    const remote = map.get(d.id);
    return {
      ...d,
      ar: remote?.name_ar || d.ar,
      img: remote?.cover_image || d.img,
    };
  });
});

/* ═══ المناسبات (Occasions) ═══ */
const occasions = computed(() => OCCASIONS.slice(0, 7));

/* ═══ Why Items ═══ */
const whyItems = [
  { icon: "sun", title: "طازج 100%", desc: "تُحضَّر صباح كل يوم" },
  { icon: "palette", title: "تصاميم فنية", desc: "كل هدية قطعة فنية" },
  { icon: "pen-tool", title: "تخصيص مجاني", desc: "عبارتك منحوتة على الفواكه" },
  { icon: "truck", title: "توصيل سريع", desc: "نفس اليوم داخل الكويت" },
  { icon: "shield-check", title: "ضمان الجودة", desc: "استبدال أو استرداد" },
];

/* ═══ Spotlight Chips ═══ */
const spotlightChips = [
  "مبروك المولود",
  "كل عام وأنت بخير",
  "عقبال ١٠٠ سنة",
  "مبروك التخرج",
];

/* ═══ SEO ═══ */
useSeoMeta({
  title: "FA Fruits — هدايا فواكه فاخرة في الكويت",
  description:
    "هدايا فواكه فنية، توصيل نفس اليوم داخل الكويت. اختر التصميم، وأضف عبارتك المنحوتة.",
  ogTitle: "FA Fruits — هدايا فواكه تُروى",
  ogDescription: "تصاميم فنية، توصيل نفس اليوم",
});

/* ═══════════════════════════════════════════════════
   ⭐ Interactive
   ═══════════════════════════════════════════════════ */

/* ═══ Scroll for Nav ═══ */
const isScrolled = ref(false);

/* ═══ Occasions Track Ref ═══ */
const occasionsTrack = ref<HTMLElement | null>(null);

function scrollOccasions(dir: number) {
  const track = occasionsTrack.value;
  if (!track) return;
  const isRTL = getComputedStyle(track).direction === "rtl";
  const sign = isRTL ? -1 : 1;
  const card = track.querySelector(".occ-card") as HTMLElement | null;
  const amount = card ? card.offsetWidth + 20 : 320;
  track.scrollBy({ left: dir * amount * sign, behavior: "smooth" });
}

/* ═══ Hero Stats — أرقام حقيقية من المشروع ═══ */
const heroStats = [
  { value: 78, suffix: "+", label: "تصميم حصري" },
  { value: 5, suffix: "", label: "تصنيفات رئيسية" },
  { value: 6, suffix: "", label: "محافظات الكويت" },
];

const displayStats = ref(heroStats.map(() => 0));

function animateCounters() {
  const duration = 1500;
  const startTime = performance.now();
  const targets = heroStats.map((s) => s.value);

  const step = (now: number) => {
    const p = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    displayStats.value = targets.map((t) => Math.round(t * eased));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ═══ Parallax على Hero ═══ */
const heroRef = ref<HTMLElement | null>(null);
const ghostRef = ref<HTMLElement | null>(null);
const visualRef = ref<HTMLElement | null>(null);

function onHeroMove(e: MouseEvent) {
  if (!heroRef.value || !ghostRef.value || !visualRef.value) return;
  const rect = heroRef.value.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;

  ghostRef.value.style.transform = `translate(calc(-50% + ${(x * -28).toFixed(1)}px), calc(-50% + ${(y * -18).toFixed(1)}px))`;
  visualRef.value.style.transform = `translate(${(x * 12).toFixed(1)}px, ${(y * 12).toFixed(1)}px)`;
}

function onHeroLeave() {
  if (ghostRef.value) ghostRef.value.style.transform = "translate(-50%, -50%)";
  if (visualRef.value) visualRef.value.style.transform = "translate(0, 0)";
}

/* ═══ Card Spotlight Effect ═══ */
function onCardMove(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  el.style.setProperty(
    "--mx",
    `${((e.clientX - rect.left) / rect.width) * 100}%`,
  );
  el.style.setProperty(
    "--my",
    `${((e.clientY - rect.top) / rect.height) * 100}%`,
  );
}

/* ═══ Lifecycle ═══ */
onMounted(() => {
  if (!import.meta.client) return;

  /* Scroll listener */
  const onScroll = () => {
    isScrolled.value = window.scrollY > 24;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Counter */
  animateCounters();

  /* Section Reveals */
  const sections = document.querySelectorAll(
    ".designs, .occasions, .bestsellers, .spotlight, .why, .contact-cta, .designs__grid",
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
  );
  sections.forEach((s) => observer.observe(s));
});
</script>

<template>
  <div class="home-page">
    <!-- ═══════════════════════════════════════════════════
         1. HERO
         ═══════════════════════════════════════════════════ -->
    <section
      ref="heroRef"
      class="hero"
      aria-label="هدايا فواكه فاخرة"
      @mousemove="onHeroMove"
      @mouseleave="onHeroLeave"
    >
      <span ref="ghostRef" class="hero__ghost" aria-hidden="true"
        >FA FRUITS</span
      >

      <div class="hero__inner">
        <div class="hero__content">
          <svg
            class="hero__calligraphy"
            viewBox="0 0 280 120"
            aria-hidden="true"
          >
            <path
              d="M8 88 Q 40 20, 90 55 T 175 42 Q 210 25, 240 60 T 272 78"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              style="--draw-len: 520"
            />
            <path
              d="M30 100 Q 70 70, 120 88"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              style="--draw-len: 120"
            />
          </svg>

          <span class="eyebrow reveal" style="--d: 0.15s">
            <span class="eyebrow__dot"></span>
            هدايا فواكه فاخرة · الكويت
          </span>

          <h1 class="hero__title">
            <span class="hero__line reveal" style="--d: 0.25s">
              نُصمّم لحظة <em>لا تُنسى</em>
            </span>
            <span class="hero__line reveal" style="--d: 0.35s">
              لكل مناسبة تستحق
            </span>
          </h1>

          <p class="hero__lead reveal" style="--d: 0.45s">
            سلال وأبراج وبوكيهات فواكه طازجة تُجهَّز يوميًا، مع إمكانية حفر
            عبارتك الخاصة على الفواكه. توصيل في اليوم نفسه داخل جميع مناطق
            الكويت، ودفع آمن عبر KNET.
          </p>

          <div class="hero__cta reveal" style="--d: 0.55s">
            <AppButton
              to="/gift-finder"
              variant="primary"
              size="lg"
              icon-end="arrow-left"
            >
              اطلب هديتك الآن
            </AppButton>

            <AppButton to="/styles" variant="ghost" size="lg">
              استعرض التصاميم
            </AppButton>
          </div>
          <!-- ⭐ Hero Stats — أرقام حقيقية + عدّاد -->
          <div class="hero__stats reveal" style="--d: 0.65s">
            <div v-for="(s, i) in heroStats" :key="i" class="stat">
              <div class="stat__value">
                <span>{{ displayStats[i] }}</span>
                <span v-if="s.suffix" class="stat__suffix">{{ s.suffix }}</span>
              </div>
              <span class="stat__label">{{ s.label }}</span>
            </div>
          </div>
        </div>

        <div ref="visualRef" class="hero__visual reveal" style="--d: 0.5s">
          <div class="arch-outline" aria-hidden="true"></div>

          <div class="arch">
            <div class="arch__fallback" aria-hidden="true">
              <span>FA</span>
            </div>

            <img
              class="arch__img"
              src="/images/hero-fruit-tower.png"
              alt="هدية فواكه فاخرة من FA Fruits مع عبارة محفورة"
              loading="eager"
            />

            <div class="arch__sheen" aria-hidden="true"></div>
          </div>

          <div class="float-card float-card--phrase">
            <span class="float-card__ico">
              <Icon name="pen-tool" :size="16" />
            </span>
            <div>
              <strong>عبارة محفورة</strong>
              <span>اكتبها واحنا نحفرها</span>
            </div>
          </div>

          <div class="float-card float-card--delivery">
            <span class="pulse-dot" aria-hidden="true"></span>
            <div>
              <strong>توصيل اليوم نفسه</strong>
              <span>لجميع مناطق الكويت</span>
            </div>
          </div>

          <div class="badge" aria-hidden="true">
  <!-- ⭐ النص الدائري -->
  <svg class="badge__ring" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <path
        id="badgeRingPath"
        d="M 60,60 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0"
        fill="none"
      />
    </defs>
    <text
      fill="#c9a87c"
      font-family="Playfair Display, serif"
      font-size="7.5"
      font-weight="500"
      letter-spacing="2.4"
    >
      <textPath href="#badgeRingPath" xlink:href="#badgeRingPath" startOffset="0">
        FA FRUITS · KUWAIT · PREMIUM GIFTS ·
      </textPath>
    </text>
  </svg>

  <!-- ⭐ اللوجو — بدون خلفية بيضاء -->
  <img
    src="/images/fafruits.png"
    alt="FA Fruits"
    class="badge__logo"
    loading="lazy"
  />
</div>
        </div>
      </div>

      <div class="hero__bottom">
        <div class="trust-bar reveal" style="--d: 0.8s">
          <div class="trust-item">
            <span class="trust-item__ico">
              <Icon name="truck" :size="18" />
            </span>
            <div class="trust-item__txt">
              <strong>توصيل في اليوم نفسه</strong>
              <span>لجميع مناطق الكويت</span>
            </div>
          </div>

          <div class="trust-item">
            <span class="trust-item__ico">
              <Icon name="shield-check" :size="18" />
            </span>
            <div class="trust-item__txt">
              <strong>دفع آمن KNET</strong>
              <span>Apple Pay متوفر أيضًا</span>
            </div>
          </div>

          <div class="trust-item">
            <span class="trust-item__ico">
              <Icon name="sparkles" :size="18" />
            </span>
            <div class="trust-item__txt">
              <strong>حفر مخصص مجاني</strong>
              <span>اسم أو عبارة على الفواكه</span>
            </div>
          </div>

          <div class="trust-item">
            <span class="trust-item__ico">
              <Icon name="message-circle" :size="18" />
            </span>
            <div class="trust-item__txt">
              <strong>دعم واتساب 24/7</strong>
              <span>رد فوري على استفساراتك</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════
         2. SADOU DIVIDER
         ═══════════════════════════════════════════════════ -->
    <div class="sadou-divider" aria-hidden="true">
      <span class="sadou-divider__line"></span>

      <div class="sadou-divider__pattern">
        <svg
          viewBox="0 0 220 22"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <defs>
            <pattern
              id="sadouStrip"
              x="0"
              y="0"
              width="44"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M22 4 L32 11 L22 18 L12 11 Z"
                stroke="currentColor"
                stroke-width="1"
                opacity="0.55"
              />
              <path
                d="M22 8 L27 11 L22 14 L17 11 Z"
                fill="currentColor"
                opacity="0.85"
              />
              <circle
                cx="4"
                cy="11"
                r="0.9"
                fill="currentColor"
                opacity="0.5"
              />
              <circle
                cx="40"
                cy="11"
                r="0.9"
                fill="currentColor"
                opacity="0.5"
              />
            </pattern>
          </defs>
          <rect width="220" height="22" fill="url(#sadouStrip)" />
        </svg>
      </div>

      <span class="sadou-divider__diamond"></span>

      <div class="sadou-divider__pattern">
        <svg
          viewBox="0 0 220 22"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <rect width="220" height="22" fill="url(#sadouStrip)" />
        </svg>
      </div>

      <span class="sadou-divider__line"></span>
    </div>

    <!-- ═══════════════════════════════════════════════════
         3. BROWSE BY DESIGN — بيانات Supabase
         ═══════════════════════════════════════════════════ -->
    <section class="designs" aria-label="تصفح حسب التصميم">
      <div class="designs__inner">
        <div class="section-head">
          <div class="section-head__left">
            <span class="eyebrow reveal" style="--d: 0.05s">
              <span class="eyebrow__dot"></span>
              تصفح حسب التصميم
            </span>
            <h2 class="reveal" style="--d: 0.15s">
              اختر التصميم الذي يناسب <em>مناسبتك</em>
            </h2>
          </div>

          <div class="section-head__right reveal" style="--d: 0.25s">
            <p class="section-head__lead">
              من السلال الكلاسيكية إلى الأبراج الفاخرة — كل تصميم يُجهَّز طازجًا
              في يوم التوصيل، ويُخصَّص بعبارتك أو اسم المُهدى إليه.
            </p>
            <AppButton
              to="/styles"
              variant="ghost"
              size="sm"
              icon-end="arrow-left"
            >
              استعرض كل التصاميم
            </AppButton>
          </div>
        </div>

        <div class="designs__grid">
          <NuxtLink
            v-for="(d, i) in designs"
            :key="d.id"
            :to="`/styles/${d.id}`"
            :class="['d-card', d.cls]"
            :style="{ '--g': d.grad }"
            @pointermove="onCardMove"
          >
            <span class="d-card__media" aria-hidden="true">
              <img :src="d.img" alt="" loading="lazy" />
            </span>
            <span class="d-card__veil" aria-hidden="true"></span>
            <span class="d-card__glow" aria-hidden="true"></span>

            <span class="d-card__body">
              <span class="d-card__top">
                <span class="d-card__num">0{{ i + 1 }}</span>
                <span class="d-card__arrow">
                  <Icon name="arrow-left" :size="17" />
                </span>
              </span>

              <span class="d-card__bottom">
                <span class="d-card__ar">{{ d.ar }}</span>
                <span class="d-card__en">{{ d.en }}</span>
                <span class="d-card__count">{{ d.count }} تصميم</span>
              </span>
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════
         4. BROWSE BY OCCASION
         ═══════════════════════════════════════════════════ -->
    <section class="occasions" aria-label="تصفح حسب المناسبة">
      <div class="occasions__inner">
        <div class="section-head">
          <div class="section-head__left">
            <span class="eyebrow reveal" style="--d: 0.05s">
              <span class="eyebrow__dot"></span>
              تصفح حسب المناسبة
            </span>
            <h2 class="reveal" style="--d: 0.15s">
              اختر المناسبة، ودعنا نُهدي <em>باسمك</em>
            </h2>
          </div>

          <div class="section-head__right reveal" style="--d: 0.25s">
            <p class="section-head__lead">
              سبع مناسبات، وسبع طرق لتقول «أنا معك في هذه اللحظة» — كل تصميم يصل
              بعبارة محفورة تناسب المناسبة.
            </p>

            <div
              class="occasions__nav"
              role="group"
              aria-label="التنقل بين المناسبات"
            >
              <button
                class="occ-nav"
                type="button"
                aria-label="السابق"
                @click="scrollOccasions(-1)"
              >
                <Icon name="arrow-right" :size="20" />
              </button>
              <button
                class="occ-nav"
                type="button"
                aria-label="التالي"
                @click="scrollOccasions(1)"
              >
                <Icon name="arrow-left" :size="20" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="occasions__scroller">
        <div ref="occasionsTrack" class="occasions__track">
          <NuxtLink
            v-for="(o, i) in occasions"
            :key="o.id"
            :to="`/occasions/${o.id}`"
            class="occ-card"
            :style="{
              '--accent':
                i % 3 === 0
                  ? '110,31,46'
                  : i % 3 === 1
                    ? '139,46,63'
                    : '168,133,91',
            }"
          >
            <span class="occ-card__deco" aria-hidden="true"></span>

            <span class="occ-card__top">
              <span class="occ-card__ico" aria-hidden="true">
                <Icon :name="o.icon || 'sparkles'" :size="22" />
              </span>
              <span class="occ-card__num">0{{ i + 1 }}</span>
            </span>

            <span class="occ-card__body">
              <span class="occ-card__name">{{ o.name }}</span>
              <span class="occ-card__greeting">{{
                o.cta || "هدية من القلب"
              }}</span>
            </span>

            <span class="occ-card__cta">
              تصفح التصاميم
              <Icon name="arrow-left" :size="14" />
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════
         5. BEST SELLERS — يستخدم مكوّن ProductCard
         ═══════════════════════════════════════════════════ -->
    <section class="bestsellers" aria-label="الأكثر طلبًا">
      <div class="bestsellers__inner">
        <div class="section-head">
          <div class="section-head__left">
            <span class="eyebrow reveal" style="--d: 0.05s">
              <span class="eyebrow__dot"></span>
              مختارات فاخرة
            </span>
            <h2 class="reveal" style="--d: 0.15s">
              الأكثر <em>طلبًا</em> هذا الموسم
            </h2>
          </div>

          <div class="section-head__right reveal" style="--d: 0.25s">
            <p class="section-head__lead">
              تصاميم اختارها عملاؤنا أكثر من غيرها — جودة استثنائية، وتغليف
              فاخر، وتوصيل في اليوم نفسه.
            </p>
            <NuxtLink to="/collections" class="section-head__all">
              استعرض المتجر كاملًا
              <Icon name="arrow-left" :size="16" />
            </NuxtLink>
          </div>
        </div>

        <!-- ⭐ مكوّن ProductCard بياخد كل حاجة أوتوماتيك -->
        <div class="bestsellers__grid">
          <ProductCard
            v-for="(p, i) in bestSellers"
            :key="p.id"
            :product="p"
            :message="
              i === 1 ? 'الأكثر مبيعًا' : i === 2 ? 'إصدار محدود' : null
            "
            class="reveal"
            :style="{ '--d': `${0.05 + i * 0.07}s` }"
          />
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════
         6. MESSAGE SPOTLIGHT
         ═══════════════════════════════════════════════════ -->
    <section class="spotlight" aria-label="العبارة المنحوتة">
      <div class="spotlight__inner">
        <div class="spotlight__text">
          <span class="eyebrow reveal" style="--d: 0.05s">
            <Icon name="pen-tool" :size="14" />
            ميزتنا
          </span>

          <h2 class="spotlight__title reveal" style="--d: 0.15s">
            اكتب عبارتك… واحنا <em>نحفرها</em> على الفواكه
          </h2>

          <p class="spotlight__lead reveal" style="--d: 0.25s">
            عبارة تخصك، بخط عربي أنيق، تُحفر على الشوكولاتة. بدون تكلفة إضافية
            على معظم التصاميم.
          </p>

          <div class="spotlight__chips reveal" style="--d: 0.35s">
            <span
              v-for="chip in spotlightChips"
              :key="chip"
              class="spotlight__chip"
            >
              {{ chip }}
            </span>
          </div>

          <AppButton
            to="/styles"
            variant="primary"
            size="lg"
            icon-end="arrow-left"
            class="reveal"
            style="--d: 0.45s"
          >
            اكتب عبارتك الآن
          </AppButton>
        </div>

        <div class="spotlight__visual reveal" style="--d: 0.3s">
          <span class="spotlight__badge">حفر مجاني</span>
          <span class="spotlight__glow" aria-hidden="true"></span>
          <img
            src="/images/messages.png"
            alt="كارت منحوت عليه عبارة"
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════
         7. WHY FA FRUITS
         ═══════════════════════════════════════════════════ -->
    <section class="why" aria-label="ليه FA Fruits؟">
      <div class="why__inner">
        <div class="why__head">
          <span class="eyebrow reveal" style="--d: 0.05s">
            <span class="eyebrow__dot"></span>
            لماذا نحن
          </span>

          <h2 class="why__title reveal" style="--d: 0.15s">
            ليه <em>FA Fruits</em>؟
          </h2>

          <p class="why__lead reveal" style="--d: 0.25s">
            خمسة أسباب تجعلنا الخيار الأول لهدايا الفواكه الفاخرة في الكويت — من
            الطزاجة إلى الضمان.
          </p>
        </div>

        <div class="why__grid">
          <div
            v-for="(w, i) in whyItems"
            :key="w.title"
            class="why-card reveal"
            :style="{ '--d': `${0.05 + i * 0.07}s` }"
          >
            <span class="why-card__deco" aria-hidden="true"></span>

            <div class="why-card__top">
              <span class="why-card__ico" aria-hidden="true">
                <Icon :name="w.icon" :size="22" :stroke-width="1.8" />
              </span>
              <span class="why-card__num">0{{ i + 1 }}</span>
            </div>

            <h3 class="why-card__title">{{ w.title }}</h3>
            <p class="why-card__desc">{{ w.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  <!-- ═══════════════════════════════════════════════════
         2. SADOU DIVIDER
         ═══════════════════════════════════════════════════ -->
    <div class="sadou-divider" aria-hidden="true">
      <span class="sadou-divider__line"></span>

      <div class="sadou-divider__pattern">
        <svg
          viewBox="0 0 220 22"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <defs>
            <pattern
              id="sadouStrip"
              x="0"
              y="0"
              width="44"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M22 4 L32 11 L22 18 L12 11 Z"
                stroke="currentColor"
                stroke-width="1"
                opacity="0.55"
              />
              <path
                d="M22 8 L27 11 L22 14 L17 11 Z"
                fill="currentColor"
                opacity="0.85"
              />
              <circle
                cx="4"
                cy="11"
                r="0.9"
                fill="currentColor"
                opacity="0.5"
              />
              <circle
                cx="40"
                cy="11"
                r="0.9"
                fill="currentColor"
                opacity="0.5"
              />
            </pattern>
          </defs>
          <rect width="220" height="22" fill="url(#sadouStrip)" />
        </svg>
      </div>

      <span class="sadou-divider__diamond"></span>

      <div class="sadou-divider__pattern">
        <svg
          viewBox="0 0 220 22"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <rect width="220" height="22" fill="url(#sadouStrip)" />
        </svg>
      </div>

      <span class="sadou-divider__line"></span>
    </div>

    <!-- ═══════════════════════════════════════════════════
         8. CONTACT CTA
         ═══════════════════════════════════════════════════ -->
    <section class="contact-cta" aria-label="دعوة للتواصل">
      <span
        class="contact-cta__deco contact-cta__deco--1"
        aria-hidden="true"
      ></span>
      <span
        class="contact-cta__deco contact-cta__deco--2"
        aria-hidden="true"
      ></span>
      <span
        class="contact-cta__deco contact-cta__deco--3"
        aria-hidden="true"
      ></span>

      <div class="contact-cta__inner">
        <span class="eyebrow reveal" style="--d: 0.05s">
          <span class="eyebrow__dot"></span>
          نحن هنا للمساعدة
        </span>

        <h2 class="contact-cta__title reveal" style="--d: 0.15s">
          محتاج مساعدة في <em>الاختيار</em>؟
        </h2>

        <p class="contact-cta__lead reveal" style="--d: 0.25s">
          فريقنا جاهز يساعدك تختار الهدية المناسبة لمناسبتك — تواصل معنا مباشرة
          عبر واتساب.
        </p>

        <div class="contact-cta__actions reveal" style="--d: 0.35s">
          <AppButton
            href="https://wa.me/96551180015"
            variant="whatsapp"
            size="lg"
            icon="message-circle"
          >
            تواصل عبر واتساب
          </AppButton>

          <AppButton
            href="tel:+96551180015"
            variant="phone"
            size="lg"
            icon="phone"
          >
            965 5118 0015
          </AppButton>
        </div>

        <div class="contact-cta__micro reveal" style="--d: 0.45s">
          <span class="pulse-dot" aria-hidden="true"></span>
          متاحون يوميًا ٩ص — ١١م
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════ */
.home-page {
  overflow-x: hidden;
}

/* ═══════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════ */
.hero {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(110% 80% at 88% 6%, #fdfaf6 0%, rgba(253, 250, 246, 0) 58%),
    radial-gradient(90% 70% at 6% 98%, #e0d2c0 0%, rgba(224, 210, 192, 0) 62%),
    linear-gradient(155deg, #f5efe7 0%, #ebe2d6 42%, #dbcdbd 100%);
}

.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
  opacity: 0.3;
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: 1;
}

.hero__ghost {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: "Playfair Display", serif;
  font-weight: 500;
  font-size: clamp(80px, 17vw, 300px);
  line-height: 0.8;
  letter-spacing: 0.015em;
  white-space: nowrap;
  color: rgba(27, 23, 20, 0.03);
  user-select: none;
  pointer-events: none;
  z-index: 0;
  transition: transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
  animation: ghostIn 1.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes ghostIn {
  from {
    opacity: 0;
    transform: translate(-50%, -46%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.hero__inner {
  position: relative;
  z-index: 2;
  width: min(1280px, 92vw);
  margin: 0 auto;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: clamp(24px, 4vw, 64px);
  padding: clamp(120px, 15vh, 172px) 0 clamp(28px, 5vh, 56px);
}

.hero__content {
  max-width: 600px;
  position: relative;
}

.hero__content .eyebrow {
  margin-bottom: 26px;
}

.hero__calligraphy {
  position: absolute;
  top: -30px;
  inset-inline-start: -40px;
  width: 280px;
  height: 120px;
  pointer-events: none;
  z-index: -1;
  opacity: 0.35;
  color: var(--bronze);
  overflow: visible;
}

.hero__calligraphy path {
  stroke-dasharray: var(--draw-len, 400);
  stroke-dashoffset: var(--draw-len, 400);
  animation: drawStroke 2.8s cubic-bezier(0.22, 1, 0.36, 1) 1.2s forwards;
}

@keyframes drawStroke {
  to {
    stroke-dashoffset: 0;
  }
}

.hero__title {
  margin: 0 0 22px;
  font-size: clamp(38px, 4.9vw, 72px);
  font-weight: 300;
  line-height: 1.32;
  color: var(--ink);
}

.hero__line {
  display: block;
}

.hero__line em {
  font-family: "Amiri", serif;
  font-style: normal;
  font-weight: 700;
  color: var(--burgundy);
  position: relative;
  padding-inline-end: 6px;
}

.hero__line em::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: 6px;
  height: 8px;
  background: linear-gradient(
    90deg,
    rgba(110, 31, 46, 0.22),
    rgba(110, 31, 46, 0)
  );
  border-radius: 4px;
  z-index: -1;
}

.hero__lead {
  margin: 0 0 34px;
  font-size: clamp(14.5px, 1.15vw, 16.5px);
  line-height: 2;
  color: var(--ink-soft);
  font-weight: 400;
  max-width: 520px;
}

.hero__cta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 42px;
}

.hero__stats {
  display: flex;
  gap: clamp(18px, 3vw, 46px);
  padding-top: 28px;
  border-top: 1px solid var(--line);
}

.stat {
  min-width: 0;
}

.stat__value {
  display: flex;
  align-items: flex-start;
  gap: 2px;
  font-family: "Playfair Display", serif;
  font-size: clamp(26px, 2.5vw, 38px);
  font-weight: 500;
  line-height: 1;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.stat__suffix {
  font-size: 0.55em;
  color: var(--burgundy);
  font-weight: 600;
  transform: translateY(4px);
}

.stat__label {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-mute);
}

/* ═══ Hero Visual ═══ */
.hero__visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.arch-outline {
  position: absolute;
  width: min(420px, 78vw);
  aspect-ratio: 0.78;
  border-radius: 999px 999px 34px 34px;
  border: 1px solid rgba(27, 23, 20, 0.14);
  transform: translate(20px, 18px) rotate(2.4deg);
  pointer-events: none;
}

.arch-outline::after {
  content: "";
  position: absolute;
  inset: 14px;
  border-radius: 999px 999px 24px 24px;
  border: 1px solid rgba(27, 23, 20, 0.07);
}

.arch {
  position: relative;
  width: min(420px, 78vw);
  aspect-ratio: 0.78;
  border-radius: 999px 999px 34px 34px;
  overflow: hidden;
  /* background: linear-gradient(165deg, #dcc9b0 0%, #be9e78 42%, #ffc384 100%);
  box-shadow:
    0 50px 90px -40px rgba(60, 42, 24, 0.65),
    0 0 0 1px rgba(255, 255, 255, 0.35) inset; */
}

.arch__fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  /* background:
    radial-gradient(
      70% 55% at 50% 22%,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0) 65%
    ),
    radial-gradient(
      80% 60% at 50% 105%,
      rgba(60, 35, 15, 0.45) 0%,
      rgba(60, 35, 15, 0) 60%
    ); */
}

.arch__fallback span {
  font-family: "Playfair Display", serif;
  font-size: clamp(80px, 12vw, 140px);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.2);
  letter-spacing: 0.02em;
  user-select: none;
}

.arch__img {
  position: absolute;
  inset: 0;
  width: 100%;
  top: 15%;
}

.arch__sheen {
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* background:
    linear-gradient(to top, rgba(28, 18, 8, 0.38) 0%, rgba(28, 18, 8, 0) 42%),
    linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.28) 0%,
      rgba(255, 255, 255, 0) 38%
    ); */
}

/* ═══ Float Cards ═══ */
.float-card {
  position: absolute;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.9);
  -webkit-backdrop-filter: blur(18px) saturate(1.6);
  backdrop-filter: blur(18px) saturate(1.6);
  box-shadow: 0 24px 46px -26px rgba(60, 45, 30, 0.75);
  animation: floatY 6s ease-in-out infinite;
}

.float-card strong {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
  line-height: 1.3;
}

.float-card span {
  display: block;
  font-size: 11px;
  color: var(--ink-mute);
  margin-top: 2px;
  font-weight: 400;
}

.float-card__ico {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: linear-gradient(150deg, var(--burgundy-lt), var(--burgundy));
  color: #fff;
  box-shadow: 0 8px 18px -8px rgba(110, 31, 46, 0.9);
  display: flex !important;
  justify-content: center;
  align-items: center;
  color: #e9e4da !important;
}

.float-card--phrase {
  top: 12%;
  inset-inline-end: -20px;
  animation-delay: -1s;
}

.float-card--delivery {
  bottom: 15%;
  inset-inline-start: -20px;
  animation-delay: -3.2s;
}

.pulse-dot {
  position: relative;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #3fa96a;
  flex-shrink: 0;
}

.pulse-dot::after {
  content: "";
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 1.5px solid rgba(63, 169, 106, 0.55);
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes floatY {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-9px);
  }
}


/* ═══ Badge — إعادة تصميم ═══ */
.badge {
  position: absolute;
  inset-inline-end: -40px;
  bottom: 54px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  /* ⭐ burgundy gradient بدل الأسود */

  box-shadow:
    0 32px 60px -28px rgba(110, 31, 46, 0.8),
    0 0 0 1px rgba(201, 168, 124, 0.35) inset,
    0 0 0 5px rgba(247, 242, 236, 0.04) inset;
  z-index: 5;
  overflow: hidden;
}

.badge__ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  animation: spin 30s linear infinite;
  pointer-events: none;
}

/* ⭐ اللوجو — حجم متوازن، بدون خلفية */
.badge__logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: relative;
  z-index: 2;
  /* لو اللوجو فاتح، ممكن نضيف ظل خفيف */
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ⭐ Responsive */
@media (max-width: 1080px) {
  .badge {
    inset-inline-end: -16px;
    bottom: 34px;
    width: 110px;
    height: 110px;
  }
}

@media (max-width: 560px) {
  .badge {
    width: 96px;
    height: 96px;
    bottom: 24px;
  }
}

/* ═══ Trust Bar ═══ */
.hero__bottom {
  position: relative;
  z-index: 3;
  width: min(1280px, 92vw);
  margin: 0 auto;
  padding-bottom: clamp(22px, 4vh, 42px);
}

.trust-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  padding: 16px 8px;
  border-radius: 22px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.6),
    rgba(255, 255, 255, 0.4)
  );
  border: 1px solid rgba(255, 255, 255, 0.75);
  -webkit-backdrop-filter: blur(22px) saturate(1.5);
  backdrop-filter: blur(22px) saturate(1.5);
  box-shadow:
    0 30px 60px -40px rgba(50, 35, 20, 0.85),
    0 1px 0 rgba(255, 255, 255, 0.6) inset;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 22px;
  min-width: 0;
}

.trust-item + .trust-item {
  border-inline-start: 1px solid rgba(27, 23, 20, 0.09);
}

.trust-item__ico {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(110, 31, 46, 0.1);
  color: var(--burgundy);
  border: 1px solid rgba(110, 31, 46, 0.14);
}

.trust-item__txt {
  min-width: 0;
}

.trust-item__txt strong {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
  line-height: 1.35;
  white-space: nowrap;
}

.trust-item__txt span {
  display: block;
  font-size: 11px;
  color: var(--ink-mute);
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ═══════════════════════════════════════════════════════════
   SADOU DIVIDER
   ═══════════════════════════════════════════════════════════ */
.sadou-divider {
  position: relative;
  z-index: 3;
  width: 100%;
  padding: clamp(28px, 4vh, 42px) 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: linear-gradient(
    180deg,
    rgba(247, 242, 236, 0) 0%,
    rgba(240, 232, 222, 0.4) 50%,
    rgba(247, 242, 236, 0) 100%
  );
  overflow: hidden;
}

.sadou-divider__line {
  flex: 0 0 auto;
  width: clamp(60px, 12vw, 180px);
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(168, 133, 91, 0) 0%,
    rgba(168, 133, 91, 0.35) 50%,
    rgba(168, 133, 91, 0) 100%
  );
}

.sadou-divider__pattern {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0;
  color: var(--burgundy);
  opacity: 0.65;
}

.sadou-divider__pattern svg {
  display: block;
  height: 22px;
  width: auto;
}

.sadou-divider__diamond {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  margin: 0 8px;
  transform: rotate(45deg);
  background: var(--bronze);
  box-shadow: 0 0 0 3px rgba(168, 133, 91, 0.15);
}

/* ═══════════════════════════════════════════════════════════
   SECTION HEAD (shared)
   ═══════════════════════════════════════════════════════════ */
.section-head {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: clamp(24px, 4vw, 64px);
  align-items: end;
  margin-bottom: clamp(38px, 5vw, 68px);
}

.section-head__left h2 {
  margin: 14px 0 0;
  font-size: clamp(32px, 4vw, 56px);
  font-weight: 300;
  line-height: 1.28;
  color: var(--ink);
  letter-spacing: -0.005em;
}

.section-head__left h2 em {
  font-family: "Amiri", serif;
  font-style: normal;
  font-weight: 700;
  color: var(--burgundy);
  position: relative;
  padding-inline-end: 4px;
}

.section-head__left h2 em::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: 5px;
  height: 7px;
  background: linear-gradient(
    90deg,
    rgba(110, 31, 46, 0.2),
    rgba(110, 31, 46, 0)
  );
  border-radius: 4px;
  z-index: -1;
}

.section-head__right {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 22px;
  padding-bottom: 6px;
}

.section-head__lead {
  margin: 0;
  font-size: clamp(14px, 1.05vw, 15.5px);
  line-height: 1.95;
  color: var(--ink-soft);
  max-width: 440px;
}

.section-head__all {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--ink);
  text-decoration: none;
  padding: 12px 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.9);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  backdrop-filter: blur(14px) saturate(1.4);
  box-shadow: 0 18px 36px -26px rgba(50, 35, 20, 0.75);
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.section-head__all:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 26px 46px -26px rgba(50, 35, 20, 0.85);
}

.section-head__all:hover :deep(svg) {
  transform: translateX(-4px);
}

/* ═══════════════════════════════════════════════════════════
   BROWSE BY DESIGN
   ═══════════════════════════════════════════════════════════ */
.designs {
  position: relative;
  padding: clamp(80px, 12vh, 140px) 0 clamp(70px, 10vh, 120px);
  background:
    radial-gradient(75% 55% at 100% 0%, #fcf8f2 0%, rgba(252, 248, 242, 0) 60%),
    radial-gradient(70% 50% at 0% 100%, #eae0d3 0%, rgba(234, 224, 211, 0) 60%),
    linear-gradient(180deg, #efe8df 0%, #f7f2ec 55%, #f2eae0 100%);
  overflow: hidden;
  isolation: isolate;
}

.designs::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(1280px, 92vw);
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(27, 23, 20, 0) 0%,
    rgba(27, 23, 20, 0.14) 20%,
    rgba(27, 23, 20, 0.14) 80%,
    rgba(27, 23, 20, 0) 100%
  );
}

.designs__inner {
  width: min(1280px, 92vw);
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.designs__grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: clamp(14px, 1.6vw, 22px);
}

.d-card--wide {
  grid-column: span 4;
  min-height: clamp(360px, 44vw, 500px);
}

.d-card--tall {
  grid-column: span 2;
  min-height: clamp(360px, 44vw, 500px);
}

.d-card--sq {
  grid-column: span 2;
  min-height: clamp(280px, 32vw, 360px);
}

.d-card {
  position: relative;
  display: block;
  border-radius: 28px;
  overflow: hidden;
  text-decoration: none;
  color: #fff;
  isolation: isolate;
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 20px 40px -15px rgba(50, 35, 20, 0.15);
  transition:
    transform 0.65s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.65s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.65s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.d-card:hover {
  transform: translateY(-7px);
  border-color: rgba(255, 255, 255, 0.32);
  box-shadow: 0 30px 60px -20px rgba(50, 35, 20, 0.25);
}

.d-card__media {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: var(--g, linear-gradient(160deg, #ddd, #888));
  overflow: hidden;
}

.d-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition:
    transform 1.3s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.65s cubic-bezier(0.22, 1, 0.36, 1);
  filter: saturate(0.92) contrast(1.02);
}

.d-card:hover .d-card__media img {
  transform: scale(1.075);
  filter: saturate(1.05) contrast(1.05);
}

.d-card__veil {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(
    to top,
    rgba(18, 11, 5, 0.88) 0%,
    rgba(18, 11, 5, 0.5) 34%,
    rgba(18, 11, 5, 0.1) 66%,
    rgba(18, 11, 5, 0.3) 100%
  );
  transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}

.d-card:hover .d-card__veil {
  opacity: 0.94;
}

.d-card__glow {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(
    340px circle at var(--mx, 50%) var(--my, 50%),
    rgba(255, 236, 205, 0.26),
    rgba(255, 236, 205, 0) 62%
  );
  transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.d-card:hover .d-card__glow {
  opacity: 1;
}

.d-card__body {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(20px, 2.1vw, 30px);
}

.d-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.d-card__num {
  font-family: "Playfair Display", serif;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.82);
  padding: 7px 13px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.11);
  border: 1px solid rgba(255, 255, 255, 0.18);
  -webkit-backdrop-filter: blur(10px) saturate(1.3);
  backdrop-filter: blur(10px) saturate(1.3);
  line-height: 1;
}

.d-card__arrow {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.28);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  backdrop-filter: blur(12px) saturate(1.4);
  transition:
    background 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.d-card:hover .d-card__arrow {
  background: #f5eada;
  border-color: #f5eada;
  color: var(--ink);
  transform: translateX(-4px);
}

.d-card__bottom {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transform: translateY(0);
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.d-card:hover .d-card__bottom {
  transform: translateY(-3px);
}

.d-card__ar {
  font-size: clamp(20px, 1.75vw, 27px);
  font-weight: 800;
  line-height: 1.32;
  letter-spacing: -0.012em;
  color: #fff;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.35);
}

.d-card--wide .d-card__ar {
  font-size: clamp(25px, 2.4vw, 37px);
  line-height: 1.22;
}

.d-card__en {
  margin-top: 8px;
  font-family: "Playfair Display", serif;
  font-style: italic;
  font-size: 12.5px;
  letter-spacing: 0.045em;
  color: rgba(255, 255, 255, 0.76);
}

.d-card__count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 6px 13px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.94);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  -webkit-backdrop-filter: blur(10px) saturate(1.3);
  backdrop-filter: blur(10px) saturate(1.3);
  line-height: 1;
}

.designs__grid .d-card {
  opacity: 0;
  clip-path: inset(0 0 100% 0 round 28px);
}

.designs__grid.is-visible .d-card {
  animation: cardIn 1.05s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.designs__grid.is-visible .d-card:nth-child(1) {
  animation-delay: 0.06s;
}
.designs__grid.is-visible .d-card:nth-child(2) {
  animation-delay: 0.15s;
}
.designs__grid.is-visible .d-card:nth-child(3) {
  animation-delay: 0.24s;
}
.designs__grid.is-visible .d-card:nth-child(4) {
  animation-delay: 0.33s;
}
.designs__grid.is-visible .d-card:nth-child(5) {
  animation-delay: 0.42s;
}

@keyframes cardIn {
  from {
    opacity: 0;
    clip-path: inset(0 0 100% 0 round 28px);
  }
  to {
    opacity: 1;
    clip-path: inset(0 0 0 0 round 28px);
  }
}

/* ═══════════════════════════════════════════════════════════
   OCCASIONS
   ═══════════════════════════════════════════════════════════ */
.occasions {
  position: relative;
  padding: clamp(70px, 10vh, 120px) 0 clamp(60px, 9vh, 110px);
  background:
    radial-gradient(70% 50% at 100% 0%, #fcf8f2 0%, rgba(252, 248, 242, 0) 60%),
    radial-gradient(60% 50% at 0% 100%, #e8dccb 0%, rgba(232, 220, 203, 0) 60%),
    linear-gradient(180deg, #f2eae0 0%, #efe6da 50%, #ede3d5 100%);
  overflow: hidden;
  isolation: isolate;
}

.occasions::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(1280px, 92vw);
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(27, 23, 20, 0) 0%,
    rgba(27, 23, 20, 0.12) 20%,
    rgba(27, 23, 20, 0.12) 80%,
    rgba(27, 23, 20, 0) 100%
  );
}

.occasions__inner {
  width: min(1280px, 92vw);
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.occasions__nav {
  display: flex;
  gap: 8px;
}

.occ-nav {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(27, 23, 20, 0.12);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  color: var(--ink);
  cursor: pointer;
  transition:
    background 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.occ-nav:hover {
  background: #fff;
  border-color: var(--burgundy);
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -16px rgba(110, 31, 46, 0.5);
}

.occasions__scroller {
  position: relative;
  z-index: 2;
  width: 100%;
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 24px,
    #000 calc(100% - 24px),
    transparent 100%
  );
  mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 24px,
    #000 calc(100% - 24px),
    transparent 100%
  );
}

.occasions__track {
  display: flex;
  gap: clamp(14px, 1.6vw, 22px);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 16px max(calc((100vw - min(1280px, 92vw)) / 2), 30px) 32px;
  scroll-padding-inline-start: max(calc((100vw - min(1280px, 92vw)) / 2), 30px);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.occasions__track::-webkit-scrollbar {
  display: none;
}

.occ-card {
  position: relative;
  flex: 0 0 auto;
  width: clamp(240px, 24vw, 300px);
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 26px 24px 22px;
  border-radius: 24px;
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.82) 0%,
    rgba(255, 255, 255, 0.52) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.9);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  backdrop-filter: blur(16px) saturate(1.4);
  box-shadow:
    0 15px 35px -20px rgba(60, 45, 30, 0.25),
    0 1px 0 rgba(255, 255, 255, 0.7) inset;
  text-decoration: none;
  color: var(--ink);
  overflow: hidden;
  isolation: isolate;
  transition:
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.occ-card:hover {
  transform: translateY(-6px);
  border-color: #fff;
  box-shadow:
    0 25px 50px -20px rgba(60, 45, 30, 0.35),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.occ-card__deco {
  position: absolute;
  top: -40%;
  inset-inline-end: -30%;
  width: 80%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(var(--accent), 0.3) 0%,
    rgba(var(--accent), 0) 70%
  );
  pointer-events: none;
  z-index: -1;
  transition:
    transform 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    opacity: 0.3;
}

.occ-card:hover .occ-card__deco {
  transform: scale(1.25);
  opacity: 0.85;
}

.occ-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.occ-card__ico {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(var(--accent), 0.15);
  color: rgb(var(--accent));
  border: 1px solid rgba(var(--accent), 0.25);
  transition:
    background 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.occ-card:hover .occ-card__ico {
  background: rgb(var(--accent));
  color: #fff;
  transform: rotate(-6deg) scale(1.05);
}

.occ-card__num {
  font-family: "Playfair Display", serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--ink-mute);
}

.occ-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.occ-card__name {
  font-size: 21px;
  font-weight: 800;
  line-height: 1.3;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.occ-card__greeting {
  font-family: "Amiri", serif;
  font-style: italic;
  font-size: 15.5px;
  line-height: 1.55;
  color: var(--burgundy);
  font-weight: 400;
}

.occ-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-top: 16px;
  margin-top: auto;
  border-top: 1px solid rgba(27, 23, 20, 0.08);
  font-size: 12.5px;
  font-weight: 800;
  color: var(--ink-soft);
  transition:
    color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    gap 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.occ-card:hover .occ-card__cta {
  color: var(--burgundy);
  gap: 12px;
}

.occasions__track .occ-card {
  opacity: 0;
  transform: translateY(20px);
}

.occasions.is-visible .occasions__track .occ-card {
  animation: occIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.occasions.is-visible .occ-card:nth-child(1) {
  animation-delay: 0.05s;
}
.occasions.is-visible .occ-card:nth-child(2) {
  animation-delay: 0.12s;
}
.occasions.is-visible .occ-card:nth-child(3) {
  animation-delay: 0.19s;
}
.occasions.is-visible .occ-card:nth-child(4) {
  animation-delay: 0.26s;
}
.occasions.is-visible .occ-card:nth-child(5) {
  animation-delay: 0.33s;
}
.occasions.is-visible .occ-card:nth-child(6) {
  animation-delay: 0.4s;
}
.occasions.is-visible .occ-card:nth-child(7) {
  animation-delay: 0.47s;
}

@keyframes occIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ═══════════════════════════════════════════════════════════
   BEST SELLERS — يستخدم ProductCard
   ═══════════════════════════════════════════════════════════ */
.bestsellers {
  position: relative;
  padding: clamp(70px, 10vh, 120px) 0 clamp(60px, 9vh, 110px);
  background:
    radial-gradient(70% 50% at 100% 0%, #fcf8f2 0%, rgba(252, 248, 242, 0) 60%),
    radial-gradient(60% 50% at 0% 100%, #e8dccb 0%, rgba(232, 220, 203, 0) 60%),
    linear-gradient(180deg, #ede3d5 0%, #f7f2ec 50%, #f2eae0 100%);
  overflow: hidden;
  isolation: isolate;
}

.bestsellers::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(1280px, 92vw);
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(27, 23, 20, 0) 0%,
    rgba(27, 23, 20, 0.12) 20%,
    rgba(27, 23, 20, 0.12) 80%,
    rgba(27, 23, 20, 0) 100%
  );
}

.bestsellers__inner {
  width: min(1280px, 92vw);
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.bestsellers__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(14px, 1.6vw, 22px);
}

/* ═══════════════════════════════════════════════════════════
   SPOTLIGHT (USP)
   ═══════════════════════════════════════════════════════════ */
.spotlight {
  position: relative;
  padding: clamp(80px, 12vh, 140px) 0;
  background:
    radial-gradient(80% 60% at 100% 0%, #fcf8f2 0%, rgba(252, 248, 242, 0) 60%),
    radial-gradient(70% 50% at 0% 100%, #e8dccb 0%, rgba(232, 220, 203, 0) 60%),
    linear-gradient(180deg, #f2eae0 0%, #ede3d5 50%, #f7f2ec 100%);
  overflow: hidden;
  isolation: isolate;
}

.spotlight::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(1280px, 92vw);
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(27, 23, 20, 0) 0%,
    rgba(27, 23, 20, 0.12) 20%,
    rgba(27, 23, 20, 0.12) 80%,
    rgba(27, 23, 20, 0) 100%
  );
}

.spotlight__inner {
  width: min(1280px, 92vw);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(30px, 6vw, 80px);
  align-items: center;
  position: relative;
  z-index: 2;
}

.spotlight__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.spotlight__title {
  margin: 14px 0 0;
  font-size: clamp(32px, 4vw, 56px);
  font-weight: 300;
  line-height: 1.28;
  color: var(--ink);
  letter-spacing: -0.005em;
}

.spotlight__title em {
  font-family: "Amiri", serif;
  font-style: normal;
  font-weight: 700;
  color: var(--burgundy);
  position: relative;
  padding-inline-end: 4px;
}

.spotlight__title em::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: 5px;
  height: 7px;
  background: linear-gradient(
    90deg,
    rgba(110, 31, 46, 0.2),
    rgba(110, 31, 46, 0)
  );
  border-radius: 4px;
  z-index: -1;
}

.spotlight__lead {
  margin: 20px 0 28px;
  font-size: clamp(14.5px, 1.15vw, 16.5px);
  line-height: 2;
  color: var(--ink-soft);
  max-width: 520px;
}

.spotlight__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 34px;
}

.spotlight__chip {
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.9);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-soft);
  box-shadow: 0 8px 18px -12px rgba(27, 23, 20, 0.3);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.spotlight__chip:hover {
  background: #fff;
  color: var(--burgundy);
  transform: translateY(-2px);
  box-shadow: 0 14px 24px -14px rgba(110, 31, 46, 0.5);
  border-color: rgba(110, 31, 46, 0.15);
}

.spotlight__cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14.5px;
  font-weight: 800;
  padding: 16px 28px;
  border-radius: 999px;
  background: linear-gradient(150deg, var(--burgundy), var(--burgundy-dk));
  color: #fbefe0;
  text-decoration: none;
  box-shadow: 0 20px 40px -18px rgba(110, 31, 46, 0.75);
  transition: all 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.spotlight__cta:hover {
  transform: translateY(-3px);
  background: linear-gradient(150deg, var(--burgundy-lt), var(--burgundy));
  box-shadow: 0 28px 52px -20px rgba(110, 31, 46, 0.85);
}

.spotlight__cta:hover :deep(svg) {
  transform: translateX(-4px);
}

.spotlight__visual {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  box-shadow:
    0 40px 80px -30px rgba(60, 45, 30, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
}

.spotlight__visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.spotlight__visual:hover img {
  transform: scale(1.05);
}

.spotlight__badge {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(110, 31, 46, 0.9);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  color: #fbefe0;
  font-family: "Playfair Display", serif;
  font-size: 14px;
  letter-spacing: 0.05em;
  box-shadow: 0 12px 24px -10px rgba(110, 31, 46, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 2;
}

.spotlight__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 30% 80%,
    rgba(201, 168, 124, 0.3),
    transparent 60%
  );
  pointer-events: none;
  z-index: 1;
}

/* ═══════════════════════════════════════════════════════════
   WHY FA FRUITS
   ═══════════════════════════════════════════════════════════ */
.why {
  position: relative;
  padding: clamp(70px, 10vh, 120px) 0;
  background:
    radial-gradient(70% 50% at 100% 0%, #fcf8f2 0%, rgba(252, 248, 242, 0) 60%),
    radial-gradient(60% 50% at 0% 100%, #eae0d3 0%, rgba(234, 224, 211, 0) 60%),
    linear-gradient(180deg, #f7f2ec 0%, #f2eae0 50%, #ede3d5 100%);
  overflow: hidden;
  isolation: isolate;
}

.why::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(1280px, 92vw);
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(27, 23, 20, 0) 0%,
    rgba(27, 23, 20, 0.12) 20%,
    rgba(27, 23, 20, 0.12) 80%,
    rgba(27, 23, 20, 0) 100%
  );
}

.why__inner {
  width: min(1280px, 92vw);
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.why__head {
  text-align: center;
  max-width: 640px;
  margin: 0 auto clamp(44px, 6vw, 72px);
}

.why__head .eyebrow {
  margin-bottom: 22px;
}

.why__title {
  margin: 14px 0 0;
  font-size: clamp(30px, 4vw, 54px);
  font-weight: 300;
  line-height: 1.28;
  color: var(--ink);
  letter-spacing: -0.005em;
}

.why__title em {
  font-family: "Amiri", serif;
  font-style: normal;
  font-weight: 700;
  color: var(--burgundy);
  position: relative;
  padding-inline-end: 4px;
}

.why__title em::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: 5px;
  height: 7px;
  background: linear-gradient(
    90deg,
    rgba(110, 31, 46, 0.2),
    rgba(110, 31, 46, 0)
  );
  border-radius: 4px;
  z-index: -1;
}

.why__lead {
  margin: 20px auto 0;
  font-size: clamp(14px, 1.05vw, 15.5px);
  line-height: 1.95;
  color: var(--ink-soft);
  max-width: 520px;
}

.why__grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: clamp(14px, 1.6vw, 20px);
}

.why-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding: clamp(22px, 2.4vw, 30px) clamp(18px, 2vw, 24px);
  border-radius: 22px;
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(255, 255, 255, 0.55) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.9);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  backdrop-filter: blur(16px) saturate(1.4);
  box-shadow:
    0 15px 35px -20px rgba(60, 45, 30, 0.25),
    0 1px 0 rgba(255, 255, 255, 0.7) inset;
  text-align: right;
  overflow: hidden;
  isolation: isolate;
  transition:
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.why-card:hover {
  transform: translateY(-6px);
  border-color: #fff;
  box-shadow:
    0 25px 50px -20px rgba(60, 45, 30, 0.35),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.why-card__deco {
  position: absolute;
  top: -30%;
  inset-inline-end: -30%;
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(110, 31, 46, 0.15) 0%,
    rgba(110, 31, 46, 0) 70%
  );
  pointer-events: none;
  z-index: -1;
  transition:
    transform 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    opacity: 0.3;
}

.why-card:hover .why-card__deco {
  transform: scale(1.3);
  opacity: 0.9;
}

.why-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.why-card__ico {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(150deg, var(--burgundy-lt), var(--burgundy));
  color: #fff;
  box-shadow: 0 10px 22px -10px rgba(110, 31, 46, 0.9);
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.why-card:hover .why-card__ico {
  transform: rotate(-6deg) scale(1.06);
}

.why-card__num {
  font-family: "Playfair Display", serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.14em;
  color: var(--ink-mute);
}

.why-card__title {
  font-size: clamp(15px, 1.15vw, 17px);
  font-weight: 800;
  line-height: 1.35;
  color: var(--ink);
  letter-spacing: -0.01em;
  margin: 0;
}

.why-card__desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--ink-soft);
  font-weight: 400;
}

.why__grid .why-card {
  opacity: 0;
  transform: translateY(20px);
}

.why.is-visible .why__grid .why-card {
  animation: whyIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.why.is-visible .why-card:nth-child(1) {
  animation-delay: 0.05s;
}
.why.is-visible .why-card:nth-child(2) {
  animation-delay: 0.12s;
}
.why.is-visible .why-card:nth-child(3) {
  animation-delay: 0.19s;
}
.why.is-visible .why-card:nth-child(4) {
  animation-delay: 0.26s;
}
.why.is-visible .why-card:nth-child(5) {
  animation-delay: 0.33s;
}

@keyframes whyIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ═══════════════════════════════════════════════════════════
   CONTACT CTA
   ═══════════════════════════════════════════════════════════ */
.contact-cta {
  position: relative;
  padding: clamp(70px, 10vh, 120px) 0;
  background:
    radial-gradient(
      90% 70% at 100% 0%,
      rgba(255, 236, 205, 0.5) 0%,
      rgba(255, 236, 205, 0) 60%
    ),
    radial-gradient(
      80% 70% at 0% 100%,
      rgba(110, 31, 46, 0.35) 0%,
      rgba(110, 31, 46, 0) 60%
    ),
    linear-gradient(135deg, #6e1f2e 0%, #551621 38%, #3d0f19 70%, #2a0a11 100%);
  overflow: hidden;
  isolation: isolate;
}

.contact-cta::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  opacity: 0.18;
  mix-blend-mode: overlay;
  pointer-events: none;
  z-index: 1;
}

.contact-cta__deco {
  position: absolute;
  pointer-events: none;
  z-index: 1;
}

.contact-cta__deco--1 {
  width: 420px;
  height: 420px;
  border-radius: 50%;
  border: 1px solid rgba(255, 240, 220, 0.18);
  top: -140px;
  left: -100px;
}

.contact-cta__deco--2 {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  border: 1px solid rgba(255, 240, 220, 0.14);
  bottom: -100px;
  right: -60px;
}

.contact-cta__deco--3 {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 240, 220, 0.7);
  top: 22%;
  left: 12%;
  box-shadow:
    120px 80px 0 -1px rgba(255, 240, 220, 0.5),
    280px -40px 0 -2px rgba(255, 240, 220, 0.4),
    420px 200px 0 -2px rgba(255, 240, 220, 0.5),
    620px 60px 0 -1px rgba(255, 240, 220, 0.6);
  opacity: 0.7;
}

.contact-cta__inner {
  width: min(1280px, 92vw);
  margin: 0 auto;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.contact-cta .eyebrow {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.28);
  color: #fff5e6;
  box-shadow: 0 10px 26px -18px rgba(0, 0, 0, 0.5);
  margin-bottom: 26px;
}

.contact-cta .eyebrow__dot {
  background: #fff5e6;
  box-shadow: 0 0 0 4px rgba(255, 245, 230, 0.22);
}

.contact-cta__title {
  margin: 0 0 22px;
  font-size: clamp(30px, 4.2vw, 60px);
  font-weight: 300;
  line-height: 1.28;
  color: #fff9f0;
  letter-spacing: -0.005em;
  max-width: 820px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.18);
}

.contact-cta__title em {
  font-family: "Amiri", serif;
  font-style: normal;
  font-weight: 700;
  color: #ffe9c7;
  position: relative;
  padding-inline-end: 4px;
}

.contact-cta__title em::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: 6px;
  height: 8px;
  background: linear-gradient(
    90deg,
    rgba(255, 233, 199, 0.35),
    rgba(255, 233, 199, 0)
  );
  border-radius: 4px;
  z-index: -1;
}

.contact-cta__lead {
  margin: 0 0 38px;
  font-size: clamp(14.5px, 1.2vw, 17px);
  line-height: 2;
  color: rgba(255, 249, 240, 0.86);
  max-width: 620px;
  font-weight: 400;
}

.contact-cta__actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 26px;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14.5px;
  font-weight: 800;
  padding: 17px 30px;
  border-radius: 999px;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  white-space: nowrap;
}

.cta-btn--whatsapp {
  background: #fff9f0;
  color: #1b1714;
  box-shadow:
    0 22px 44px -18px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.4) inset;
}

.cta-btn--whatsapp:hover {
  transform: translateY(-3px);
  background: #ffffff;
  box-shadow:
    0 32px 60px -20px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.6) inset;
}

.cta-btn--whatsapp :deep(svg) {
  color: #25d366;
  stroke-width: 2.2;
}

.cta-btn--whatsapp:hover :deep(svg) {
  transform: rotate(-12deg) scale(1.08);
}

.cta-btn--phone {
  background: rgba(255, 255, 255, 0.1);
  color: #fff9f0;
  border-color: rgba(255, 249, 240, 0.42);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 28px -18px rgba(0, 0, 0, 0.5);
}

.cta-btn--phone:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 249, 240, 0.7);
  transform: translateY(-3px);
  box-shadow: 0 22px 40px -18px rgba(0, 0, 0, 0.6);
}

.cta-btn--phone :deep(svg) {
  color: #ffe9c7;
}

.cta-btn--phone:hover :deep(svg) {
  transform: rotate(-10deg);
}

.contact-cta__micro {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 12.5px;
  font-weight: 700;
  color: rgba(255, 249, 240, 0.78);
  letter-spacing: 0.01em;
}

.contact-cta__micro .pulse-dot {
  background: #b6e5a8;
}

.contact-cta__micro .pulse-dot::after {
  border-color: rgba(182, 229, 168, 0.65);
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE — 1080px
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 1080px) {
  .hero__inner {
    grid-template-columns: 1fr;
    text-align: center;
    padding-top: clamp(104px, 14vh, 140px);
    gap: clamp(34px, 6vw, 56px);
  }

  .hero__content {
    max-width: none;
    margin: 0 auto;
    order: 1;
  }

  .hero__lead {
    margin-inline: auto;
  }

  .hero__cta {
    justify-content: center;
  }

  .hero__stats {
    justify-content: center;
    text-align: center;
  }

  .hero__content .eyebrow {
    margin-inline: auto;
  }

  .hero__calligraphy {
    width: 200px;
    height: 80px;
    top: -20px;
    inset-inline-start: -20px;
  }

  .hero__visual {
    order: 2;
    margin-top: 6px;
  }

  .arch,
  .arch-outline {
    width: min(340px, 72vw);
  }

  .badge {
    inset-inline-end: -16px;
    bottom: 34px;
    width: 96px;
    height: 96px;
  }

  .badge__center {
    font-size: 18px;
  }

  .float-card--phrase {
    inset-inline-end: -10px;
    top: 8%;
  }

  .float-card--delivery {
    inset-inline-start: -10px;
    bottom: 10%;
  }

  .trust-bar {
    grid-template-columns: repeat(2, 1fr);
    row-gap: 6px;
    padding: 14px;
  }

  .trust-item {
    padding: 8px 12px;
  }

  .trust-item + .trust-item {
    border-inline-start: 0;
  }

  .sadou-divider {
    padding: 20px 0;
    gap: 16px;
  }

  .sadou-divider__line {
    width: clamp(30px, 8vw, 100px);
  }

  .section-head {
    grid-template-columns: 1fr;
    gap: 24px;
    align-items: start;
  }

  .section-head__right {
    padding-bottom: 0;
  }

  .section-head__lead {
    max-width: 100%;
  }

  .d-card--wide,
  .d-card--tall {
    grid-column: span 3;
    min-height: clamp(320px, 48vw, 440px);
  }

  .d-card--sq {
    grid-column: span 3;
    min-height: clamp(260px, 36vw, 340px);
  }

  .d-card--sq:last-child {
    grid-column: span 6;
    min-height: clamp(240px, 30vw, 300px);
  }

  .bestsellers__grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .spotlight__inner {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .spotlight__text {
    order: 1;
    align-items: center;
  }

  .spotlight__chips {
    justify-content: center;
  }

  .spotlight__visual {
    order: 2;
    margin-top: 20px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .why__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE — 768px
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .bestsellers__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .why__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE — 560px
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 560px) {
  .hero__stats {
    gap: 18px;
    justify-content: space-between;
    padding-top: 22px;
  }

  .stat__label {
    font-size: 10.5px;
  }

  .hero__calligraphy {
    width: 140px;
    height: 60px;
    top: -14px;
    inset-inline-start: -10px;
    opacity: 0.28;
  }

  .float-card {
    padding: 10px 12px;
    border-radius: 15px;
  }

  .float-card strong {
    font-size: 11.5px;
  }

  .float-card span {
    font-size: 10px;
  }

  .float-card__ico {
    width: 28px;
    height: 28px;
    border-radius: 9px;
  }

  .badge {
    width: 84px;
    height: 84px;
    bottom: 24px;
  }

  .badge__center {
    font-size: 16px;
  }

  .badge__ring text {
    font-size: 8.8px;
    letter-spacing: 0.12em;
  }

  .hero__cta {
    gap: 10px;
  }

  .btn {
    padding: 14px 22px;
    font-size: 13.5px;
  }

  .trust-item__txt strong {
    font-size: 11.5px;
  }

  .trust-item__txt span {
    font-size: 10px;
  }

  .sadou-divider {
    padding: 14px 0;
    gap: 12px;
  }

  .sadou-divider__line {
    width: 20px;
  }

  .sadou-divider__pattern svg {
    height: 16px;
  }

  .sadou-divider__diamond {
    width: 6px;
    height: 6px;
    margin: 0 5px;
  }

  .d-card--wide,
  .d-card--tall,
  .d-card--sq,
  .d-card--sq:last-child {
    grid-column: span 6;
    min-height: 250px;
  }

  .d-card--wide {
    min-height: 320px;
  }

  .d-card__ar {
    font-size: 20px;
  }

  .d-card--wide .d-card__ar {
    font-size: 24px;
  }

  .d-card__arrow {
    width: 38px;
    height: 38px;
  }

  .section-head__all {
    width: 100%;
    justify-content: center;
  }

  .occ-card {
    width: min(260px, 78vw);
    padding: 22px 20px 18px;
  }

  .occ-card__name {
    font-size: 19px;
  }

  .occ-card__greeting {
    font-size: 14.5px;
  }

  .occ-nav {
    width: 40px;
    height: 40px;
  }

  .occ-card__ico {
    width: 44px;
    height: 44px;
  }

  .bestsellers__grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .spotlight__cta {
    width: 100%;
    justify-content: center;
  }

  .spotlight__visual {
    aspect-ratio: 1 / 1;
  }

  .spotlight__chip {
    font-size: 12px;
    padding: 6px 12px;
  }

  .why-card {
    padding: 18px 16px;
    gap: 12px;
  }

  .why-card__ico {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .why-card__title {
    font-size: 14px;
  }

  .why-card__desc {
    font-size: 11.5px;
  }

  .why-card__num {
    font-size: 11px;
  }

  .contact-cta__actions {
    flex-direction: column;
    width: 100%;
    max-width: 400px;
  }

  .cta-btn {
    width: 100%;
  }

  .contact-cta__title {
    font-size: clamp(26px, 7vw, 34px);
  }

  .contact-cta__lead {
    font-size: 13.5px;
  }
}

/* ═══════════════════════════════════════════════════════════
   REDUCED MOTION
   ═══════════════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .hero__ghost,
  .hero__calligraphy path,
  .float-card,
  .badge__ring,
  .designs__grid .d-card,
  .occasions__track .occ-card,
  .why__grid .why-card {
    animation: none !important;
    transition: none !important;
  }
}
</style>
