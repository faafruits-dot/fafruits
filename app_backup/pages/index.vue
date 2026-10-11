<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'
import { OCCASIONS } from '~/data/seed'

const { products } = useProducts()

const best    = computed(() => products.value.filter(p => p.best).slice(0, 8))
const ready   = computed(() => products.value.filter(p => p.ready).slice(0, 4))
const luxury  = computed(() => products.value.filter(p => p.luxury).slice(0, 4))

/* عناصر "صمّم هديتك" */
const designerSteps = [
  { icon: 'shapes',       label: 'الشكل' },
  { icon: 'ruler',        label: 'الحجم' },
  { icon: 'cherry',       label: 'الفواكه' },
  { icon: 'plus-circle',  label: 'الإضافات' },
  { icon: 'sparkles',     label: 'العناية' }
]

/* لماذا FA */
const whyItems = [
  { icon: 'leaf',   title: 'طازج يوميًا',      sub: 'يُحضَّر صباح كل يوم' },
  { icon: 'grape',  title: 'فواكه فاخرة',      sub: 'مختارة يدويًا' },
  { icon: 'truck',  title: 'توصيل نفس اليوم',   sub: 'داخل الكويت' },
  { icon: 'gift',   title: 'تغليف هدايا',       sub: 'بشكل فاخر' },
  { icon: 'mail',   title: 'رسائل مخصصة',      sub: 'بخط أنيق' }
]
</script>

<template>
  <div>
    <!-- ============ HERO ============ -->
    <section class="hero2">
      <div class="wrap hero2-grid">
        <div class="hero2-text">
          <span class="eyebrow">
            <i data-lucide="sparkles" />
            منصة هدايا الفواكه الفاخرة
          </span>
          <h1 class="hero2-title">
            <span> ماذا </span>
            <span class="t-red">تختفل  </span>
            <span> به </span>
            <span class="t-orange">اليوم </span>
            <span class="t-leaf">؟</span>
          </h1>
          <p class="hero2-sub">
            اختر المناسبة ودعنا نقترح عليك الهدية المثالية — جاهزة اليوم،
            ومخصّصة باسمك ورسالتك.
          </p>
          <div class="hero2-cta">
            <NuxtLink to="/gift-finder" class="btn btn-primary btn-lg">
              <i data-lucide="sparkles" /> هدية مثالية
            </NuxtLink>
            <NuxtLink to="/collections" class="play-link">
              <span class="pl-dot"><i data-lucide="gift" /></span>
              تصفّح الهدايا
            </NuxtLink>
          </div>
        </div>

        <div class="hero2-visual">
          <span class="orb" />

          <!-- ⭐ الصورة الرئيسية -->
          <div class="plate">
            <img
              src="/images/hero-fruit-tower.png"
              alt="برج فواكه فاخر"
              fetchpriority="high"
            />
          </div>

          <!-- ⭐ صورة floating badge (اختياري) -->
          <div class="badge-scallop">
            <img
              src="/images/hero-fruit-tower-flow.png"
              alt="برج فواكه فاخر"
              fetchpriority="high"
            />
          </div>

          <div class="glass-card">
            <div class="gc-row">
              <i><i data-lucide="truck" /></i>
              <div>
                <b>توصيل نفس اليوم</b>
                <small>يصلك خلال ساعات داخل الكويت</small>
              </div>
            </div>
            <div class="gc-row">
              <i><i data-lucide="store" /></i>
              <div>
                <b>استلام من الفرع</b>
                <small>السالمية، شارع سالم المبارك</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ OCCASION RAIL ============ -->
    <div class="wrap fruit-rail-wrap">
      <div class="fruit-rail">
        <div class="fr-track" id="occRail">
          <NuxtLink
            v-for="(o, i) in OCCASIONS"
            :key="o.id"
            :to="`/occasions/${o.id}`"
            :class="['fr-card', `c${i % 4}`]"
          >
            <span class="fr-medal"><i :data-lucide="o.icon" /></span>
            <b>{{ o.name }}</b>
            <span class="fr-meta">{{ o.count }} هدية</span>
            <span class="fr-go">اطلب الآن <i data-lucide="chevron-left" /></span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- ============ الأكثر مبيعًا ============ -->
    <section class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div>
            <h2>الأكثر مبيعًا</h2>
            <p>اختيارات العملاء هذا الشهر</p>
          </div>
          <NuxtLink to="/collections" class="link-more">
            عرض الكل <i data-lucide="chevron-left" />
          </NuxtLink>
        </div>
        <div class="prod-grid">
          <ProductCard v-for="p in best" :key="p.id" :product="p" />
        </div>
      </div>
    </section>

    <!-- ============ STRIP جاهز اليوم ============ -->
    <section class="sec">
      <div class="wrap">
        <div class="strip-ready">
          <div class="strip-ready-txt">
            <h3>جاهز اليوم — يصل خلال ساعات</h3>
            <p>
              إذا كانت مناسبتك اليوم، لا تقلق. هذه الهدايا تُحضَّر وتُوصَّل
              في نفس اليوم داخل الكويت قبل الساعة ١١ مساءً.
            </p>
          </div>
          <NuxtLink to="/collections?filter=ready" class="btn btn-gold btn-lg">
            اطلب الآن — جاهز اليوم
          </NuxtLink>
        </div>

        <div class="prod-grid" style="margin-top: 24px">
          <ProductCard v-for="p in ready" :key="p.id" :product="p" />
        </div>
      </div>
    </section>

    <!-- ============ المجموعة الفاخرة ============ -->
    <section class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div>
            <h2>المجموعة الفاخرة</h2>
            <p>للمناسبات التي تستحق انطباعًا لا يُنسى</p>
          </div>
          <NuxtLink to="/collections?filter=luxury" class="link-more">
            عرض الكل <i data-lucide="chevron-left" />
          </NuxtLink>
        </div>
        <div class="prod-grid">
          <ProductCard v-for="p in luxury" :key="p.id" :product="p" />
        </div>
      </div>
    </section>

    <!-- ============ شاهدتها مؤخراً ============ -->
    <section class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div>
            <h2>👀 شاهدتها مؤخراً</h2>
            <p>لم تكمل طلبها؟ ابدأ من حيث توقفت</p>
          </div>
        </div>
        <div class="prod-grid">
          <ProductCard
            v-for="p in products.slice(0, 4)"
            :key="p.id"
            :product="p"
          />
        </div>
      </div>
    </section>

    <!-- ============ صمّم هديتك بنفسك ============ -->
    <section class="sec">
      <div class="wrap">
        <div class="designer-banner">
          <h3 class="designer-title">صمّم هديتك بنفسك</h3>
          <p class="designer-sub">
            أنشئ تجربة هدية فريدة بتخصيص الفواكه والتفاصيل — من الشكل
            حتى الرسالة الشخصية
          </p>

          <div class="designer-steps">
            <span v-for="s in designerSteps" :key="s.label" class="designer-step">
              <i :data-lucide="s.icon" />
              {{ s.label }}
            </span>
          </div>

          <NuxtLink to="/product/p1" class="btn btn-primary btn-lg">
            <i data-lucide="palette" /> ابدأ التصميم
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============ لماذا FA Fruits؟ ============ -->
    <section class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div>
            <h2>لماذا FA Fruits؟</h2>
            <p>خمسة أسباب تجعل تجربة الهدايا مختلفة تمامًا</p>
          </div>
        </div>
        <div class="why-grid">
          <div v-for="w in whyItems" :key="w.title" class="why">
            <i :data-lucide="w.icon" />
            <b>{{ w.title }}</b>
            <span>{{ w.sub }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>