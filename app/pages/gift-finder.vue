<script setup lang="ts">
import { useProducts } from "~/composables/useProducts";
import { GIFT_MOMENTS, GIFT_WHO, GIFT_BUDGETS } from "~/data/seed";

const { products } = useProducts();

const moment = ref("");
const who = ref("");
const budget = ref("");

const step = computed(() =>
  !moment.value ? 1 : !who.value ? 2 : !budget.value ? 3 : 4,
);

const momentToOcc: Record<string, string[]> = {
  celebration: ["عيد ميلاد", "تخرج"],
  love: ["ذكرى", "زواج"],
  surprise: ["زيارة"],
  formal: ["شركات", "رمضان"],
};

const matches = computed(() => {
  if (step.value !== 4) return [];
  const b = GIFT_BUDGETS.find((x) => x.id === budget.value);
  if (!b) return [];
  let list = products.value.filter((p) => p.price >= b.min && p.price <= b.max);
  if (moment.value && momentToOcc[moment.value]) {
    const filtered = list.filter((p) =>
      p.occ.some((o) =>
        momentToOcc[moment.value].some((m) => o.includes(m) || m.includes(m)),
      ),
    );
    if (filtered.length) list = filtered;
  }
  return list.slice(0, 8);
});

const back = () => {
  if (budget.value) budget.value = "";
  else if (who.value) who.value = "";
  else if (moment.value) moment.value = "";
};

const reset = () => {
  moment.value = "";
  who.value = "";
  budget.value = "";
};
</script>

<template>
  <section class="gift-finder-page">
    <div class="wrap">
      <!-- ═══════════ Steps Bar ═══════════ -->
      <div class="gf-steps">
        <div :class="['gf-step', { on: step === 1, done: step > 1 }]">
          <span class="n">
            <Icon v-if="step > 1" name="check" :size="14" :stroke-width="3" />
            <template v-else>1</template>
          </span>
          اللحظة
        </div>

        <div :class="['gf-step', { on: step === 2, done: step > 2 }]">
          <span class="n">
            <Icon v-if="step > 2" name="check" :size="14" :stroke-width="3" />
            <template v-else>2</template>
          </span>
          المُهدى إليه
        </div>

        <div :class="['gf-step', { on: step === 3, done: step > 3 }]">
          <span class="n">
            <Icon v-if="step > 3" name="check" :size="14" :stroke-width="3" />
            <template v-else>3</template>
          </span>
          الميزانية
        </div>
      </div>

      <!-- ═══════════ Step 1: Moment ═══════════ -->
      <template v-if="step === 1">
        <div class="gf-head">
          <h1>
            <Icon name="sparkles" :size="32" />
            ما هي اللحظة؟
          </h1>
          <p>كل هدية تحكي حكاية… اختر اللحظة ونحن نكمل</p>
        </div>

        <div class="gf-moments">
          <button
            v-for="m in GIFT_MOMENTS"
            :key="m.id"
            class="gf-moment-card"
            :style="{ '--gf-c': m.color }"
            @click="moment = m.id"
          >
            <span class="gf-icon-wrap">
              <span class="gf-blob" :style="{ background: m.color }"></span>
              <Icon :name="m.icon" :size="38" :stroke-width="2" />
            </span>
            <b>{{ m.name }}</b>
            <small>{{ m.line }}</small>
          </button>
        </div>
      </template>

      <!-- ═══════════ Step 2: Who ═══════════ -->
      <template v-if="step === 2">
        <div class="gf-head">
          <h1>
            <Icon name="heart" :size="32" />
            لمن الهدية؟
          </h1>
          <p>نعرف العلاقة… ونقترح الأنسب</p>
        </div>

        <div class="gf-whos">
          <button
            v-for="w in GIFT_WHO"
            :key="w.id"
            class="gf-who-card"
            :style="{ '--gf-c': w.color }"
            @click="who = w.id"
          >
            <span class="gf-icon-wrap">
              <span class="gf-blob" :style="{ background: w.color }"></span>
              <Icon :name="w.icon" :size="34" :stroke-width="2" />
            </span>
            <b>{{ w.name }}</b>
          </button>
        </div>
        <div class="gift-prev-btn-wrap">
                  <button class="btn btn-ghost gf-back" @click="back">
          <Icon name="arrow-right" :size="18" />
          السابق
        </button>
        </div>

      </template>

      <!-- ═══════════ Step 3: Budget ═══════════ -->
      <template v-if="step === 3">
        <div class="gf-head">
          <h1>
            <Icon name="wallet" :size="32" />
            ما ميزانيتك؟
          </h1>
          <p>سنرشّح لك الهدايا في هذا النطاق</p>
        </div>

        <div class="gf-budgets">
          <button
            v-for="b in GIFT_BUDGETS"
            :key="b.id"
            class="gf-budget-card"
            @click="budget = b.id"
          >
            <span class="gf-budget-range">{{ b.name }}</span>
          </button>
        </div>
        <div class="gift-prev-btn-wrap">
        <button class="btn btn-ghost gf-back" @click="back">
          <Icon name="arrow-right" :size="18" />
          السابق
        </button>
        </div>
      </template>

      <!-- ═══════════ Step 4: Results ═══════════ -->
      <template v-if="step === 4">
        <div class="gf-head">
          <h1>
            <Icon name="party-popper" :size="32" />
            وجدنا لك {{ matches.length }} هدية مثالية
          </h1>
          <p>
            {{ GIFT_MOMENTS.find((m) => m.id === moment)?.name || "" }} ·
            {{ GIFT_WHO.find((w) => w.id === who)?.name || "" }} ·
            {{ GIFT_BUDGETS.find((b) => b.id === budget)?.name || "" }}
          </p>
        </div>

        <div class="prod-grid">
          <ProductCard v-for="p in matches" :key="p.id" :product="p" />
        </div>

        <div class="gf-restart">
          <button class="btn btn-ghost" @click="reset">
            <Icon name="rotate-ccw" :size="18" />
            ابدأ من جديد
          </button>
          <NuxtLink to="/collections" class="btn btn-primary">
            <Icon name="grid-3x3" :size="18" />
            تصفّح كل الهدايا
          </NuxtLink>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════
   Gift Finder Page
   ═══════════════════════════════════════════════════ */
.gift-finder-page {
  padding: 22px 0 80px;
}

/* ═══════════════════════════════════════════════════
   Steps Bar
   ═══════════════════════════════════════════════════ */
.gf-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto 36px;
  flex-wrap: wrap;
  padding: 0 12px;
}

.gf-step {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--muted);
  transition: all 0.25s ease;
  white-space: nowrap;
}

.gf-step .n {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  background: var(--cream);
  border-radius: 50%;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--muted);
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.gf-step.on {
  background: linear-gradient(135deg, var(--melon), var(--gold));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 16px rgba(233, 74, 99, 0.3);
}

.gf-step.on .n {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.gf-step.done {
  background: #fff8ee;
  border-color: var(--gold);
  color: var(--green-900);
}

.gf-step.done .n {
  background: var(--gold);
  color: #fff;
}

/* ═══════════════════════════════════════════════════
   Header (عنوان + وصف)
   ═══════════════════════════════════════════════════ */
.gf-head {
  text-align: center;
  margin: 0 auto 36px;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.gf-head h1 {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: var(--ff-display);
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  color: var(--green-900);
  margin: 0 0 10px;
  letter-spacing: -0.5px;
}

.gf-head h1 svg {
  color: var(--gold);
  flex-shrink: 0;
}

.gf-head p {
  font-size: 0.92rem;
  color: var(--muted);
  margin: 0;
  line-height: 1.6;
}

/* ═══════════════════════════════════════════════════
   Icon Wrap + Blob — ⭐ الحل الجذري
   ═══════════════════════════════════════════════════ */
.gf-icon-wrap {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 96px;
  height: 96px;
  margin: 0 auto 16px;
}

/* الدائرة الملونة */
.gf-blob {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  z-index: 0;
  box-shadow: 0 5px 22px -10px currentColor;
  opacity: 0.95;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ⭐ الأيقونة فوق الدائرة — إجبار أبيض */
.gf-icon-wrap > svg {
  position: relative;
  z-index: 1;
  color: #fff !important;
  stroke: #fff !important;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Hover effect */
.gf-moment-card:hover .gf-blob,
.gf-who-card:hover .gf-blob {
  transform: scale(1.1);
}

.gf-moment-card:hover .gf-icon-wrap > svg,
.gf-who-card:hover .gf-icon-wrap > svg {
  transform: rotate(-8deg) scale(1.08);
}

/* ═══════════════════════════════════════════════════
   Moment Cards
   ═══════════════════════════════════════════════════ */
.gf-moments {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
  max-width: 908px;
}

.gf-moment-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 26px 18px 22px;
  border: 1px solid var(--line);
  border-radius: 24px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.gf-moment-card:hover {
  border-color: var(--gf-c);
  transform: translateY(-5px);
  box-shadow: 0 18px 34px -18px var(--gf-c);
}

.gf-moment-card b {
  font-family: var(--ff-display);
  font-size: 1.1rem;
  color: var(--green-900);
  margin: 4px 0 4px;
}

.gf-moment-card small {
  font-size: 0.78rem;
  color: var(--muted);
  line-height: 1.5;
}

/* ═══════════════════════════════════════════════════
   Who Cards
   ═══════════════════════════════════════════════════ */
.gf-whos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
  max-width: 651px;
}

.gf-who-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 14px 20px;
  border: 1px solid var(--line);
  border-radius: 22px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.gf-who-card:hover {
  border-color: var(--gf-c);
  transform: translateY(-5px);
  box-shadow: 0 18px 34px -18px var(--gf-c);
}

.gf-who-card b {
  font-family: var(--ff-display);
  font-size: 1rem;
  color: var(--green-900);
  margin-top: 4px;
}

.gf-who-card .gf-icon-wrap {
  width: 84px;
  height: 84px;
}

/* ═══════════════════════════════════════════════════
   Budget Cards
   ═══════════════════════════════════════════════════ */
.gf-budgets {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 32px;
}

.gf-budget-card {
  padding: 22px 18px;
  border: 1px solid var(--line);
  border-radius: 18px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.28s cubic-bezier(0.34, 1.2, 0.64, 1);
  text-align: center;
}

.gf-budget-card:hover {
  border-color: var(--gold);
  background: linear-gradient(135deg, #fff8ee, #fff3d6);
  transform: translateY(-4px);
  box-shadow: 0 14px 30px -18px rgba(245, 154, 35, 0.5);
}

.gf-budget-range {
  font-family: var(--ff-display);
  font-size: 1.15rem;
  color: var(--green-900);
  font-weight: 700;
}

/* ═══════════════════════════════════════════════════
   Back Button
   ═══════════════════════════════════════════════════ */
   .gift-prev-btn-wrap {
  display: flex;
  justify-content: center;  
   }
.gf-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
}

/* ═══════════════════════════════════════════════════
   Restart (Step 4)
   ═══════════════════════════════════════════════════ */
.gf-restart {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 40px;
  flex-wrap: wrap;
}

/* ═══════════════════════════════════════════════════
   Responsive — Mobile
   ═══════════════════════════════════════════════════ */
@media (max-width: 640px) {
  .gift-finder-page {
    padding: 16px 0 60px;
  }

  .gf-steps {
    gap: 6px;
    margin-bottom: 24px;
  }

  .gf-step {
    padding: 6px 12px;
    font-size: 0.72rem;
    gap: 6px;
  }

  .gf-step .n {
    width: 20px;
    height: 20px;
    font-size: 0.66rem;
  }

  .gf-head {
    margin-bottom: 24px;
  }

  .gf-head h1 {
    font-size: 1.35rem;
    gap: 8px;
  }

  .gf-head h1 svg {
    width: 24px;
    height: 24px;
  }

  .gf-head p {
    font-size: 0.82rem;
  }

  .gf-moments,
  .gf-whos {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .gf-icon-wrap {
    width: 76px;
    height: 76px;
    margin-bottom: 12px;
  }

  .gf-icon-wrap > svg {
    width: 30px;
    height: 30px;
  }

  .gf-who-card .gf-icon-wrap {
    width: 68px;
    height: 68px;
  }

  .gf-who-card .gf-icon-wrap > svg {
    width: 26px;
    height: 26px;
  }

  .gf-moment-card,
  .gf-who-card {
    padding: 18px 10px 16px;
    border-radius: 18px;
  }

  .gf-moment-card b,
  .gf-who-card b {
    font-size: 0.92rem;
  }

  .gf-moment-card small {
    font-size: 0.7rem;
  }

  .gf-budgets {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .gf-budget-card {
    padding: 16px 12px;
  }

  .gf-budget-range {
    font-size: 0.95rem;
  }

  .gf-restart {
    flex-direction: column;
    align-items: stretch;
  }

  .gf-restart .btn {
    justify-content: center;
    width: 100%;
  }
}
</style>