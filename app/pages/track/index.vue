<script setup lang="ts">
/* ═══ SEO ═══ */
useSeoMeta({
  title: 'تتبع طلبك — FA Fruits',
  description:
    'ادخل رقم طلبك لتتبع حالته خطوة بخطوة. توصيل في اليوم نفسه داخل الكويت.',
  ogTitle: 'تتبع طلبك — FA Fruits',
  ogDescription: 'تابع حالة طلبك من التحضير حتى التسليم',
})

/* ═══ Composables ═══ */
const router = useRouter()
const route = useRoute()

/* ═══ الحالة ═══ */
const orderId = ref((route.query.id as string) || '')
const error = ref('')
const submitting = ref(false)

/* ═══ الاقتراحات السريعة ═══ */
const recentOrders = ref<string[]>([])

onMounted(() => {
  if (!import.meta.client) return
  try {
    const saved = localStorage.getItem('fa_recent_track')
    if (saved) recentOrders.value = JSON.parse(saved).slice(0, 3)
  } catch {}
})

/* ═══ التتبع ═══ */
async function handleTrack() {
  const q = orderId.value.trim().toUpperCase()
  error.value = ''

  if (!q) {
    error.value = 'من فضلك اكتب رقم الطلب'
    return
  }

  submitting.value = true
  try {
    // حفظ في recent
    if (import.meta.client) {
      const updated = [q, ...recentOrders.value.filter((r) => r !== q)].slice(0, 3)
      recentOrders.value = updated
      localStorage.setItem('fa_recent_track', JSON.stringify(updated))
    }

    await router.push(`/track/${encodeURIComponent(q)}`)
  } catch (e: any) {
    error.value = 'حدث خطأ، حاول مرة أخرى'
  } finally {
    submitting.value = false
  }
}

/* ═══ اختصار من الاقتراحات ═══ */
function useRecent(id: string) {
  orderId.value = id
  handleTrack()
}
</script>

<template>
  <div class="track-page">
    <!-- ═══════ Page Head ═══════ -->
    <section class="page-head">
      <div class="page-head__inner">
        <nav class="crumbs" aria-label="breadcrumb">
          <NuxtLink to="/">الرئيسية</NuxtLink>
          <span class="crumbs__sep">/</span>
          <span class="crumbs__current">تتبع الطلب</span>
        </nav>

        <span class="eyebrow">
          <span class="eyebrow__dot"></span>
          تتبع مباشر
        </span>

        <h1 class="page-title">
          تابع <em>طلبك</em> خطوة بخطوة
        </h1>

        <p class="page-lead">
          ادخل رقم الطلب اللي وصلك في رسالة الواتساب، وشوف حالة طلبك من التحضير
          لحد التسليم.
        </p>
      </div>
    </section>

    <!-- ═══════ Form ═══════ -->
    <section class="sec">
      <div class="sec__inner">
        <form class="track-form" @submit.prevent="handleTrack">
          <label for="order-id" class="track-form__label">
            رقم الطلب
          </label>

          <div class="track-form__row">
            <div class="track-form__input-wrap">
              <Icon name="hash" :size="18" class="track-form__icon" />
              <input
                id="order-id"
                v-model="orderId"
                type="text"
                dir="ltr"
                placeholder="D-1041"
                autocomplete="off"
                :class="{ 'track-form__input--error': error }"
              />
            </div>

            <button
              type="submit"
              class="track-form__btn"
              :disabled="submitting"
            >
              <Icon
                :name="submitting ? 'loader' : 'search'"
                :size="18"
                :class="{ spin: submitting }"
              />
              <span>{{ submitting ? 'جاري البحث…' : 'تتبع' }}</span>
            </button>
          </div>

          <p v-if="error" class="track-form__error">
            <Icon name="alert-circle" :size="14" />
            {{ error }}
          </p>

          <!-- ⭐ اقتراحات سريعة -->
          <div v-if="recentOrders.length" class="track-recent">
            <span class="track-recent__title">طلبات سابقة:</span>
            <div class="track-recent__chips">
              <button
                v-for="id in recentOrders"
                :key="id"
                type="button"
                class="track-recent__chip"
                @click="useRecent(id)"
              >
                <Icon name="clock" :size="12" />
                <span dir="ltr">{{ id }}</span>
              </button>
            </div>
          </div>
        </form>

        <!-- ⭐ مساعدة -->
        <div class="track-help">
          <div class="track-help__ico">
            <Icon name="message-circle" :size="22" />
          </div>
          <div>
            <h3>مش لاقي رقم طلبك؟</h3>
            <p>
              تواصل معنا عبر واتساب وإحنا هنساعدك نلاقيه.
            </p>
          </div>
          <a
            href="https://wa.me/96551180015"
            target="_blank"
            rel="noopener"
            class="track-help__btn"
          >
            <Icon name="message-circle" :size="16" />
            تواصل واتساب
          </a>
        </div>

        <!-- ⭐ خطوات التتبع -->
        <div class="track-steps">
          <h3 class="track-steps__title">كيف يعمل التتبع؟</h3>
          <div class="track-steps__grid">
            <div class="track-step">
              <span class="track-step__num">01</span>
              <span class="track-step__ico">
                <Icon name="shopping-bag" :size="20" />
              </span>
              <b>استلمنا طلبك</b>
              <p>بنأكد الطلب ونبعتلك رقم الطلب</p>
            </div>

            <div class="track-step">
              <span class="track-step__num">02</span>
              <span class="track-step__ico">
                <Icon name="chef-hat" :size="20" />
              </span>
              <b>جاري التحضير</b>
              <p>بنحضّر طلبك طازج في نفس اليوم</p>
            </div>

            <div class="track-step">
              <span class="track-step__num">03</span>
              <span class="track-step__ico">
                <Icon name="truck" :size="20" />
              </span>
              <b>في الطريق</b>
              <p>المندوب في الطريق لعنوانك</p>
            </div>

            <div class="track-step">
              <span class="track-step__num">04</span>
              <span class="track-step__ico">
                <Icon name="check-circle-2" :size="20" />
              </span>
              <b>تم التسليم</b>
              <p>وصل طلبك واستلمته بنفسك</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   Track Page — Heritage
   ═══════════════════════════════════════════════════════════ */
.track-page {
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
  padding: clamp(40px, 6vh, 70px) 0 clamp(60px, 9vh, 110px);
  background:
    radial-gradient(70% 50% at 100% 0%, #fcf8f2 0%, rgba(252, 248, 242, 0) 60%),
    radial-gradient(60% 50% at 0% 100%, #e8dccb 0%, rgba(232, 220, 203, 0) 60%),
    linear-gradient(180deg, #efe6da 0%, #f7f2ec 55%, #f2eae0 100%);
}
.sec__inner {
  width: min(720px, 92vw);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ═══ Form ═══ */
.track-form {
  padding: clamp(22px, 3vw, 32px);
  background: #fff;
  border: 1.5px solid rgba(27, 23, 20, 0.06);
  border-radius: 24px;
  box-shadow: 0 12px 30px -20px rgba(50, 35, 20, 0.3);
}

.track-form__label {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: var(--ink-soft);
  margin-bottom: 10px;
}

.track-form__row {
  display: flex;
  gap: 10px;
}

.track-form__input-wrap {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.track-form__icon {
  position: absolute;
  inset-inline-start: 16px;
  color: var(--bronze);
  pointer-events: none;
}

.track-form input {
  width: 100%;
  padding: 16px 18px 16px 46px;
  background: var(--cream);
  border: 1.5px solid rgba(27, 23, 20, 0.08);
  border-radius: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: 0.03em;
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.track-form input::placeholder {
  color: var(--ink-mute);
  opacity: 0.55;
  font-weight: 500;
}

.track-form input:focus {
  outline: none;
  border-color: var(--burgundy);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(110, 31, 46, 0.08);
}

.track-form__input--error {
  border-color: #dc2626 !important;
}

.track-form__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 28px;
  background: linear-gradient(150deg, #8b2e3f, #6e1f2e);
  color: #fbefe0;
  border: 0;
  border-radius: 14px;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 16px 32px -16px rgba(110, 31, 46, 0.7);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.track-form__btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 22px 44px -18px rgba(110, 31, 46, 0.85);
}
.track-form__btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.spin {
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.track-form__error {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 0;
  font-size: 13px;
  font-weight: 700;
  color: #dc2626;
}

/* ═══ Recent ═══ */
.track-recent {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed rgba(27, 23, 20, 0.08);
}
.track-recent__title {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-mute);
  margin-bottom: 8px;
}
.track-recent__chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.track-recent__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: var(--cream);
  border: 1px solid rgba(27, 23, 20, 0.06);
  border-radius: 999px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.25s ease;
}
.track-recent__chip:hover {
  background: #fff;
  border-color: var(--bronze);
  color: var(--burgundy);
}
.track-recent__chip :deep(svg) {
  color: var(--bronze);
}

/* ═══ Help ═══ */
.track-help {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  background: linear-gradient(135deg, #fdfaf6 0%, #f5efe7 100%);
  border: 1.5px solid rgba(168, 133, 91, 0.25);
  border-radius: 20px;
  flex-wrap: wrap;
}
.track-help__ico {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  background: linear-gradient(150deg, #8b2e3f, #6e1f2e);
  color: #fbefe0;
  border-radius: 14px;
  box-shadow: 0 10px 22px -10px rgba(110, 31, 46, 0.7);
}
.track-help h3 {
  margin: 0 0 3px;
  font-size: 15px;
  font-weight: 800;
  color: var(--ink);
}
.track-help p {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink-soft);
  line-height: 1.6;
}
.track-help__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-inline-start: auto;
  padding: 10px 18px;
  background: #fff;
  border: 1.5px solid rgba(110, 31, 46, 0.2);
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 800;
  color: var(--burgundy);
  text-decoration: none;
  transition: all 0.25s ease;
}
.track-help__btn:hover {
  background: var(--burgundy);
  color: #fbefe0;
  border-color: var(--burgundy);
}

/* ═══ Steps ═══ */
.track-steps {
  padding: clamp(22px, 3vw, 32px);
  background: #fff;
  border: 1.5px solid rgba(27, 23, 20, 0.06);
  border-radius: 24px;
  box-shadow: 0 12px 30px -20px rgba(50, 35, 20, 0.3);
}
.track-steps__title {
  margin: 0 0 22px;
  font-family: "Playfair Display", "Almarai", serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(27, 23, 20, 0.06);
}
.track-steps__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.track-step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 18px;
  background: var(--cream);
  border: 1.5px solid rgba(27, 23, 20, 0.05);
  border-radius: 16px;
  transition: all 0.3s ease;
}
.track-step:hover {
  background: #fff;
  border-color: rgba(168, 133, 91, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -18px rgba(50, 35, 20, 0.4);
}
.track-step__num {
  font-family: "Playfair Display", serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--bronze);
}
.track-step__ico {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  background: linear-gradient(150deg, #8b2e3f, #6e1f2e);
  color: #fbefe0;
  border-radius: 12px;
  margin-bottom: 4px;
  box-shadow: 0 8px 18px -8px rgba(110, 31, 46, 0.6);
}
.track-step b {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
}
.track-step p {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--ink-mute);
}

/* ═══════════════════════════════════════════════════════════
   Responsive
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 640px) {
  .track-form__row {
    flex-direction: column;
  }
  .track-form__btn {
    width: 100%;
  }
  .track-steps__grid {
    grid-template-columns: 1fr;
  }
  .track-help {
    padding: 16px;
  }
  .track-help__btn {
    margin-inline-start: 0;
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: clamp(26px, 7vw, 34px);
  }
  .page-lead {
    font-size: 13px;
  }
  .track-form {
    padding: 18px;
    border-radius: 20px;
  }
  .track-steps {
    padding: 18px;
    border-radius: 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .track-form__btn,
  .track-step,
  .track-recent__chip,
  .track-help__btn,
  .spin {
    transition: none !important;
    animation: none !important;
  }
}
</style>