<script setup lang="ts">
import { useTrackOrder } from "~/composables/useTrackOrder";
import type { TrackOrder, TrackEvent } from "~/composables/useTrackOrder";
import { KD, timeAgo } from "~/utils/format";

/* ═══ Composables ═══ */
const route = useRoute();
const router = useRouter();
const { loading, error, fetchOrder } = useTrackOrder();

/* ═══ State ═══ */
const order = ref<TrackOrder | null>(null);
const events = ref<TrackEvent[]>([]);
const searchInput = ref("");
const searchError = ref("");
const copied = ref(false);

/* ═══ تحميل الطلب ═══ */
const loadOrder = async (id: string) => {
  if (!id) {
    order.value = null;
    events.value = [];
    return;
  }
  const res = await fetchOrder(id);
  order.value = res.order;
  events.value = res.events;
};

/* ═══ مراقبة الـ URL ═══ */
watch(
  () => route.params.id,
  (id) => {
    const orderId = String(id || "").trim();
    if (orderId) {
      searchInput.value = orderId;
      loadOrder(orderId);
    } else {
      order.value = null;
      events.value = [];
    }
  },
  { immediate: true },
);

/* ═══ البحث ═══ */
const searchOrder = () => {
  searchError.value = "";
  const val = searchInput.value.trim().replace(/^#/, "").toUpperCase();

  if (!val) {
    searchError.value = "أدخل رقم الطلب";
    return;
  }
  router.push(`/track/${val}`);
};

/* ═══ الخطوات ═══ */
const STEPS = [
  {
    key: "new",
    icon: "check-circle",
    title: "تم استلام الطلب",
    sub: "وصلنا طلبك بنجاح",
  },
  {
    key: "sent_to_chef",
    icon: "chef-hat",
    title: "قيد التحضير",
    sub: "نحضّر هديتك بعناية",
  },
  {
    key: "sent_to_driver",
    icon: "truck",
    title: "مع المندوب",
    sub: "في الطريق إليك",
  },
  {
    key: "delivered",
    icon: "home",
    title: "تم التوصيل",
    sub: "وصلت الهدية بسلام",
  },
] as const;

const currentStep = computed(() => {
  if (!order.value) return 0;
  const map: Record<string, number> = {
    new: 0,
    sent_to_chef: 1,
    sent_to_driver: 2,
    delivered: 3,
    cancelled: -1,
  };
  return map[order.value.status] ?? 0;
});

/* ═══ حالة الطلب ═══ */
const statusInfo = computed(() => {
  if (!order.value) return null;
  const map: Record<
    string,
    { label: string; sub: string; color: string; bg: string; icon: string }
  > = {
    new: {
      label: "تم استلام الطلب",
      sub: "سيبدأ التحضير قريبًا",
      color: "#2f5d3f",
      bg: "#e7f4e9",
      icon: "sparkles",
    },
    sent_to_chef: {
      label: "قيد التحضير",
      sub: "نحضّر هديتك الآن بعناية",
      color: "#c47000",
      bg: "#fff4d6",
      icon: "chef-hat",
    },
    sent_to_driver: {
      label: "مع المندوب",
      sub: "في الطريق إليك",
      color: "#7c5cff",
      bg: "#f0ecff",
      icon: "truck",
    },
    delivered: {
      label: "تم التوصيل",
      sub: "وصلت الهدية بسلام 🎉",
      color: "#0e8a4f",
      bg: "#dff5e7",
      icon: "check-check",
    },
    cancelled: {
      label: "تم إلغاء الطلب",
      sub: "تواصل معنا للاستفسار",
      color: "#c92a3d",
      bg: "#ffe4e9",
      icon: "x-circle",
    },
  };
  return map[order.value.status] || null;
});

/* ═══ ETA ═══ */
const etaText = computed(() => {
  if (!order.value) return "";
  if (order.value.status === "delivered") return "وصل طلبك ✨";
  if (order.value.status === "cancelled") return "ملغي";
  if (order.value.status === "sent_to_driver") return "يصلك اليوم";
  return order.value.slot || "قريبًا";
});

/* ═══ Helpers ═══ */
const itemsCount = (o: TrackOrder) =>
  (o.items || []).reduce((s, i) => s + (i.qty || 1), 0);

const formatDate = (d: string) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("ar-KW", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return "—";
  }
};

/* ═══ نسخ رقم الطلب ═══ */
const copyOrderId = async () => {
  if (!order.value) return;
  try {
    await navigator.clipboard.writeText(`#${order.value.id}`);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {}
};

/* ═══ واتساب ═══ */
const whatsappUrl = computed(() => {
  if (!order.value) return "#";
  const msg = `مرحباً، بخصوص طلبي #${order.value.id}`;
  return `https://wa.me/96551180015?text=${encodeURIComponent(msg)}`;
});
</script>

<template>
  <div class="track-page">
    <!-- ═══════ Page Head ═══════ -->
    <section class="page-head">
      <div class="wrap">
        <div class="crumbs">
          <NuxtLink to="/">الرئيسية</NuxtLink>
          <span class="sep">/</span>
          <span class="current">تتبع الطلب</span>
        </div>
        <h1>تتبّع طلبك</h1>
        <p>أدخل رقم طلبك لعرض حالة التوصيل مباشرةً</p>
      </div>
    </section>

    <section class="wrap track-body">
      <!-- ═══════ Search Bar ═══════ -->
      <div class="search-box">
        <div class="search-input-wrap">
          <Icon name="hash" :size="18" class="search-hash" />
          <input
            v-model="searchInput"
            class="search-input"
            placeholder="مثال: D-1042"
            dir="ltr"
            @keydown.enter="searchOrder"
          />
          <button
            class="search-btn"
            @click="searchOrder"
            :disabled="loading"
          >
            <Icon name="search" :size="18" />
            <span>تتبع</span>
          </button>
        </div>

        <div v-if="searchError" class="search-error">
          <Icon name="alert-circle" :size="14" />
          {{ searchError }}
        </div>
      </div>

      <!-- ═══════ Loading ═══════ -->
      <div v-if="loading" class="state-box">
        <div class="state-spinner">
          <Icon name="loader" :size="36" :stroke-width="2" />
        </div>
        <b>جاري تحميل بيانات الطلب…</b>
        <span>ثواني وبيظهر كل حاجة</span>
      </div>

      <!-- ═══════ Not Found ═══════ -->
      <div v-else-if="error" class="state-box state-error">
        <div class="state-icon">
          <Icon name="package-x" :size="42" :stroke-width="1.6" />
        </div>
        <b>لم نجد هذا الطلب</b>
        <span>
          رقم الطلب:
          <strong dir="ltr">#{{ route.params.id }}</strong>
        </span>
        <NuxtLink to="/track" class="btn btn-primary" style="margin-top: 16px">
          <Icon name="search" :size="16" />
          جرّب رقم آخر
        </NuxtLink>
      </div>

      <!-- ═══════ Order Found ═══════ -->
      <template v-else-if="order && statusInfo">
        <!-- ⭐ HERO: Status Banner -->
        <div
          class="status-hero"
          :style="{ '--c': statusInfo.color, '--bg': statusInfo.bg }"
        >
          <div class="sh-glow"></div>
          <div class="sh-content">
            <span class="sh-icon">
              <Icon :name="statusInfo.icon" :size="34" :stroke-width="2.2" />
            </span>

            <div class="sh-text">
              <b>{{ statusInfo.label }}</b>
              <span>{{ statusInfo.sub }}</span>
            </div>

            <div class="sh-eta">
              <span class="sh-eta-label">التوصيل</span>
              <b>{{ etaText }}</b>
            </div>
          </div>
        </div>

        <!-- ⭐ Meta Row -->
        <div class="meta-row">
          <button
            class="meta-chip meta-copy"
            type="button"
            @click="copyOrderId"
          >
            <Icon :name="copied ? 'check' : 'hash'" :size="14" />
            <b dir="ltr">#{{ order.id }}</b>
            <span class="copy-hint">{{ copied ? "تم النسخ" : "نسخ" }}</span>
          </button>

          <div class="meta-chip">
            <Icon name="calendar" :size="14" />
            <span>{{ formatDate(order.delivery_date) }}</span>
          </div>

          <div class="meta-chip">
            <Icon name="clock" :size="14" />
            <span>{{ order.slot || "—" }}</span>
          </div>

          <div class="meta-chip">
            <Icon name="shopping-bag" :size="14" />
            <span>{{ itemsCount(order) }} منتج</span>
          </div>

          <div class="meta-chip meta-total">
            <Icon name="wallet" :size="14" />
            <b>{{ KD(order.total) }}</b>
          </div>
        </div>

        <!-- ⭐ Timeline -->
        <div class="timeline-card">
          <h3 class="card-title">
            <Icon name="route" :size="18" />
            رحلة طلبك
          </h3>

          <div class="timeline">
            <div
              v-for="(step, i) in STEPS"
              :key="step.key"
              :class="[
                'tl-step',
                {
                  done: i < currentStep,
                  now: i === currentStep,
                  pending: i > currentStep,
                },
              ]"
            >
              <div class="tl-marker">
                <span class="tl-dot">
                  <Icon
                    :name="i < currentStep ? 'check' : step.icon"
                    :size="16"
                    :stroke-width="2.6"
                  />
                </span>
                <span
                  v-if="i < STEPS.length - 1"
                  class="tl-line"
                ></span>
              </div>

              <div class="tl-body">
                <b>{{ step.title }}</b>
                <span>{{ step.sub }}</span>
              </div>

              <span v-if="i === currentStep" class="tl-now-badge">
                الآن
              </span>
            </div>
          </div>
        </div>

        <!-- ⭐ Order Summary -->
        <div v-if="order.items?.length" class="summary-card">
          <h3 class="card-title">
            <Icon name="package" :size="18" />
            ملخص الطلب
          </h3>

          <div class="summary-list">
            <div
              v-for="it in order.items"
              :key="it.id"
              class="summary-item"
            >
              <div class="si-thumb">
                <img
                  v-if="it.product_img"
                  :src="it.product_img"
                  :alt="it.product_name"
                  loading="lazy"
                />
                <Icon
                  v-else
                  name="gift"
                  :size="22"
                  :stroke-width="1.6"
                />
              </div>

              <div class="si-body">
                <b class="si-name">
                  {{ it.product_name || "هدية فواكه" }}
                </b>

                <span class="si-qty">
                  <Icon name="layers" :size="12" />
                  الكمية: {{ it.qty }}
                </span>

                <div v-if="it.extras?.length" class="si-extras">
                  <span
                    v-for="ex in it.extras"
                    :key="ex.id"
                    class="si-extra"
                  >
                    <Icon name="plus-circle" :size="10" />
                    {{ ex.extra_name }}
                    <em v-if="ex.input_value">« {{ ex.input_value }} »</em>
                  </span>
                </div>
              </div>

              <span class="si-price">{{ KD(it.line_total) }}</span>
            </div>
          </div>

          <!-- Totals -->
          <div class="summary-totals">
            <div v-if="order.subtotal" class="st-row">
              <span>المنتجات</span>
              <b>{{ KD(order.subtotal) }}</b>
            </div>
            <div v-if="order.extras_total" class="st-row">
              <span>الإضافات</span>
              <b>{{ KD(order.extras_total) }}</b>
            </div>
            <div v-if="order.delivery_fee != null" class="st-row">
              <span>التوصيل</span>
              <b>{{ KD(order.delivery_fee) }}</b>
            </div>
            <div class="st-row st-total">
              <span>الإجمالي</span>
              <b>{{ KD(order.total) }}</b>
            </div>
          </div>
        </div>

        <!-- ⭐ Actions -->
        <div class="actions-row">
          <a
            class="action-btn action-whatsapp"
            :href="whatsappUrl"
            target="_blank"
            rel="noopener"
          >
            <Icon name="message-circle" :size="18" />
            <span>تواصل معنا</span>
          </a>

          <NuxtLink to="/orders" class="action-btn action-ghost">
            <Icon name="package" :size="18" />
            <span>كل طلباتي</span>
          </NuxtLink>

          <NuxtLink to="/" class="action-btn action-ghost">
            <Icon name="home" :size="18" />
            <span>الرئيسية</span>
          </NuxtLink>
        </div>
      </template>

      <!-- ═══════ Empty State ═══════ -->
      <div v-else class="state-box">
        <div class="state-icon state-icon-soft">
          <Icon name="package-search" :size="42" :stroke-width="1.6" />
        </div>
        <b>ابدأ بتتبع طلبك</b>
        <span>أدخل رقم الطلب في الأعلى لعرض حالة التوصيل</span>

        <div class="hint-chips">
          <span class="hint-chip">
            <Icon name="hash" :size="12" />
            يبدأ بـ D-
          </span>
          <span class="hint-chip">
            <Icon name="mail" :size="12" />
            وصلك في رسالة التأكيد
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════
   Base
   ═══════════════════════════════════════════════════ */
.track-page {
  min-height: 100vh;
}

.track-body {
  padding-bottom: 80px;
  max-width: 720px;
}

/* ═══════ Breadcrumbs ═══════ */
.crumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--muted);
  margin-bottom: 12px;
  justify-content: center;
}
.crumbs a {
  color: var(--green-700);
  text-decoration: none;
  transition: color 0.15s;
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
   Search Box
   ═══════════════════════════════════════════════════ */
.search-box {
  margin: 8px 0 24px;
  text-align: right;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 6px 6px 18px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 18px;
  transition: all 0.25s ease;
  box-shadow: 0 6px 20px -10px rgba(36, 56, 44, 0.15);
  text-align: right;
}

.search-input-wrap:focus-within {
  border-color: var(--gold);
  box-shadow: 0 8px 24px -8px rgba(245, 154, 35, 0.3);
}

.search-hash {
  color: var(--muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  padding: 12px 0;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--green-900);
  letter-spacing: 0.5px;
  min-width: 0;
  text-align: right;
}

.search-input::placeholder {
  color: #b8afa0;
  font-weight: 400;
  letter-spacing: normal;
}

.search-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 22px;
  background: linear-gradient(135deg, var(--melon), var(--gold));
  color: #fff;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(233, 74, 99, 0.25);
  white-space: nowrap;
  flex-shrink: 0;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(233, 74, 99, 0.35);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 10px 14px;
  background: #ffe4e9;
  color: #b00020;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 600;
}

/* ═══════════════════════════════════════════════════
   Status Hero
   ═══════════════════════════════════════════════════ */
.status-hero {
  position: relative;
  overflow: hidden;
  padding: 24px 26px;
  margin-bottom: 16px;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--bg), color-mix(in srgb, var(--bg) 60%, #fff));
  border: 1.5px solid color-mix(in srgb, var(--c) 25%, transparent);
  box-shadow: 0 12px 30px -18px color-mix(in srgb, var(--c) 50%, transparent);
  animation: heroFadeIn 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
}

@keyframes heroFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Glow خلفي */
.sh-glow {
  position: absolute;
  top: -40%;
  inset-inline-end: -20%;
  width: 240px;
  height: 240px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--c) 25%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
  animation: glowPulse 4s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

.sh-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.sh-icon {
  width: 62px;
  height: 62px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  background: #fff;
  color: var(--c);
  border-radius: 20px;
  box-shadow: 0 6px 18px color-mix(in srgb, var(--c) 25%, transparent);
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.sh-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sh-text b {
  font-family: var(--ff-display);
  font-size: 1.35rem;
  color: var(--c);
  line-height: 1.2;
  letter-spacing: -0.3px;
}

.sh-text span {
  font-size: 0.82rem;
  color: color-mix(in srgb, var(--c) 70%, var(--muted));
  line-height: 1.4;
}

.sh-eta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  flex-shrink: 0;
}

.sh-eta-label {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sh-eta b {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--c);
  white-space: nowrap;
}

/* ═══════════════════════════════════════════════════
   Meta Row
   ═══════════════════════════════════════════════════ */
.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  font-size: 0.78rem;
  color: var(--green-900);
  font-weight: 600;
  white-space: nowrap;
}

.meta-chip svg {
  color: var(--gold);
  flex-shrink: 0;
}

.meta-chip b {
  font-weight: 800;
}

.meta-copy {
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  position: relative;
}

.meta-copy:hover {
  border-color: var(--gold);
  background: #fff8ee;
  transform: translateY(-1px);
}

.meta-copy .copy-hint {
  font-size: 0.65rem;
  color: var(--gold);
  font-weight: 700;
  padding-inline-start: 6px;
  opacity: 0;
  max-width: 0;
  overflow: hidden;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.meta-copy:hover .copy-hint {
  opacity: 1;
  max-width: 60px;
}

.meta-total {
  background: linear-gradient(135deg, #fff8ee, #fff3d6);
  border-color: var(--gold);
}

.meta-total b {
  color: var(--gold);
  font-family: var(--ff-display);
  font-size: 1rem;
}

/* ═══════════════════════════════════════════════════
   Timeline Card
   ═══════════════════════════════════════════════════ */
.timeline-card {
  padding: 22px 24px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 22px;
  margin-bottom: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px;
  font-family: var(--ff-body);
  font-size: 1rem;
  font-weight: 800;
  color: var(--green-900);
  padding-bottom: 14px;
  border-bottom: 1.5px dashed var(--line);
}

.card-title svg {
  color: var(--gold);
}

/* ═══ Timeline ═══ */
.timeline {
  display: flex;
  flex-direction: column;
}

.tl-step {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 14px;
  align-items: flex-start;
  position: relative;
}

.tl-marker {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.tl-dot {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--cream);
  color: #b8afa0;
  flex-shrink: 0;
  z-index: 1;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 2px solid transparent;
}

.tl-line {
  flex: 1;
  width: 3px;
  min-height: 44px;
  background: var(--line);
  margin: 4px 0 -8px;
  border-radius: 3px;
  position: relative;
  overflow: hidden;
}

.tl-line::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, var(--green-500), var(--gold));
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
}

/* ═══ States ═══ */

/* Done — أخضر */
.tl-step.done .tl-dot {
  background: linear-gradient(135deg, var(--green-700), var(--green-500));
  color: #fff;
  box-shadow: 0 4px 12px rgba(76, 168, 61, 0.3);
}

.tl-step.done .tl-line::after {
  transform: scaleY(1);
}

.tl-step.done .tl-body b {
  color: var(--green-900);
}

/* Now — ذهبي برّاق */
.tl-step.now .tl-dot {
  background: linear-gradient(135deg, var(--gold), var(--mango));
  color: #fff;
  box-shadow: 0 6px 18px rgba(245, 154, 35, 0.4);
  animation: pulseGlow 2s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 6px 18px rgba(245, 154, 35, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 8px 24px rgba(245, 154, 35, 0.6);
    transform: scale(1.06);
  }
}

.tl-step.now .tl-body b {
  color: var(--gold);
}

/* Pending — رمادي */
.tl-step.pending .tl-body b {
  color: var(--muted);
}

.tl-step.pending .tl-body span {
  color: #b8afa0;
}

/* ═══ Body ═══ */
.tl-body {
  padding: 6px 0 24px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.tl-body b {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--green-900);
  line-height: 1.3;
  transition: color 0.3s ease;
}

.tl-body span {
  font-size: 0.78rem;
  color: var(--muted);
  line-height: 1.5;
}

.tl-step:last-child .tl-body {
  padding-bottom: 0;
}

/* Now badge */
.tl-now-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  margin-top: 4px;
  background: linear-gradient(135deg, var(--gold), var(--mango));
  color: #fff;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  animation: badgePulse 2s ease-in-out infinite;
  box-shadow: 0 3px 10px rgba(245, 154, 35, 0.3);
}

@keyframes badgePulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.75;
  }
}

/* ═══════════════════════════════════════════════════
   Summary Card
   ═══════════════════════════════════════════════════ */
.summary-card {
  padding: 22px 24px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 22px;
  margin-bottom: 16px;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
}

.summary-item {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: 12px;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px dashed var(--line);
}

.summary-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.si-thumb {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(135deg, #fff8ee, #fff3d6);
  display: grid;
  place-items: center;
  color: var(--gold);
  flex-shrink: 0;
  border: 1px solid var(--line);
}

.si-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.si-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.si-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--green-900);
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
}

.si-qty {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: var(--muted);
  font-weight: 600;
}

.si-extras {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.si-extra {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  background: #fff8ee;
  color: #7a5b00;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 700;
  border: 1px solid rgba(245, 154, 35, 0.25);
}

.si-extra em {
  font-style: normal;
  opacity: 0.85;
  font-weight: 600;
}

.si-price {
  font-family: var(--ff-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--gold);
  white-space: nowrap;
  align-self: center;
}

/* ═══ Totals ═══ */
.summary-totals {
  padding-top: 16px;
  border-top: 2px dashed var(--line);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.st-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 0.82rem;
  color: var(--muted);
}

.st-row b {
  color: var(--green-900);
  font-weight: 700;
}

.st-total {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1.5px solid var(--green-900);
  font-size: 0.95rem;
}

.st-total span {
  color: var(--green-900);
  font-weight: 800;
}

.st-total b {
  font-family: var(--ff-display);
  font-size: 1.35rem;
  color: var(--green-900);
}

/* ═══════════════════════════════════════════════════
   Actions
   ═══════════════════════════════════════════════════ */
.actions-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 18px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-whatsapp {
  background: linear-gradient(135deg, #25d366, #1eb356);
  color: #fff;
  box-shadow: 0 6px 16px rgba(37, 211, 102, 0.3);
}

.action-whatsapp:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(37, 211, 102, 0.4);
}

.action-ghost {
  background: #fff;
  color: var(--green-900);
  border: 1.5px solid var(--line);
}

.action-ghost:hover {
  border-color: var(--gold);
  background: #fff8ee;
  transform: translateY(-2px);
}

/* ═══════════════════════════════════════════════════
   State Boxes (Empty / Loading / Error)
   ═══════════════════════════════════════════════════ */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 24px;
  text-align: center;
  background: #fff;
  border: 1.5px dashed var(--line);
  border-radius: 22px;
  margin-top: 24px;
}

.state-icon {
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff8ee, #fff3d6);
  color: var(--gold);
  margin-bottom: 8px;
}

.state-icon-soft {
  background: linear-gradient(135deg, #f0f9f1, #e7f4e9);
  color: var(--green-500);
}

.state-box b {
  font-family: var(--ff-display);
  font-size: 1.15rem;
  color: var(--green-900);
  font-weight: 700;
}

.state-box span {
  font-size: 0.85rem;
  color: var(--muted);
  line-height: 1.6;
  max-width: 340px;
}

.state-box strong {
  color: var(--gold);
  font-family: monospace;
  font-weight: 700;
}

.state-error .state-icon {
  background: linear-gradient(135deg, #ffe4e9, #ffd0d8);
  color: #c92a3d;
}

/* ═══ Spinner ═══ */
.state-spinner {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff8ee, #fff3d6);
  color: var(--gold);
  margin-bottom: 8px;
  animation: spin 1.4s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ═══ Hint Chips ═══ */
.hint-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
}

.hint-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: var(--cream);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--muted);
}

.hint-chip svg {
  color: var(--gold);
}

/* ═══════════════════════════════════════════════════
   Responsive
   ═══════════════════════════════════════════════════ */
@media (max-width: 640px) {
  .search-input-wrap {
    padding: 5px 5px 5px 14px;
    border-radius: 16px;
  }

  .search-input {
    font-size: 0.88rem;
    padding: 10px 0;
  }

  .search-btn {
    padding: 10px 16px;
    font-size: 0.82rem;
    border-radius: 12px;
  }

  .status-hero {
    padding: 18px 20px;
    border-radius: 20px;
  }

  .sh-content {
    gap: 12px;
  }

  .sh-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
  }

  .sh-text b {
    font-size: 1.15rem;
  }

  .sh-eta {
    padding: 6px 10px;
  }

  .sh-eta b {
    font-size: 0.78rem;
  }

  .timeline-card,
  .summary-card {
    padding: 18px 16px;
    border-radius: 18px;
  }

  .card-title {
    font-size: 0.92rem;
    margin-bottom: 16px;
  }

  .tl-step {
    grid-template-columns: 38px 1fr auto;
    gap: 10px;
  }

  .tl-dot {
    width: 36px;
    height: 36px;
  }

  .tl-body {
    padding: 4px 0 20px;
  }

  .tl-body b {
    font-size: 0.88rem;
  }

  .tl-body span {
    font-size: 0.72rem;
  }

  .tl-now-badge {
    font-size: 0.6rem;
    padding: 3px 8px;
  }

  .summary-item {
    grid-template-columns: 52px 1fr auto;
    gap: 10px;
  }

  .si-thumb {
    width: 52px;
    height: 52px;
    border-radius: 12px;
  }

  .si-name {
    font-size: 0.82rem;
  }

  .si-price {
    font-size: 0.95rem;
  }

  .actions-row {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .action-whatsapp {
    grid-column: 1 / -1;
  }

  .action-btn {
    padding: 12px 14px;
    font-size: 0.8rem;
    border-radius: 12px;
  }

  .meta-row {
    gap: 6px;
  }

  .meta-chip {
    padding: 6px 10px;
    font-size: 0.72rem;
  }

  .meta-copy .copy-hint {
    display: none;
  }

  .state-box {
    padding: 40px 20px;
    border-radius: 18px;
  }

  .state-icon,
  .state-spinner {
    width: 72px;
    height: 72px;
  }
}

/* ═══ Reduced Motion ═══ */
@media (prefers-reduced-motion: reduce) {
  .status-hero,
  .sh-icon,
  .sh-glow,
  .tl-dot,
  .tl-now-badge,
  .state-spinner {
    animation: none !important;
  }
}
</style>