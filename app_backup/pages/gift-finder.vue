<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'
import { GIFT_MOMENTS, GIFT_WHO, GIFT_BUDGETS } from '~/data/seed'

const { products } = useProducts()

const moment = ref('')
const who = ref('')
const budget = ref('')

const step = computed(() => !moment.value ? 1 : (!who.value ? 2 : (!budget.value ? 3 : 4)))

const momentToOcc: Record<string, string[]> = {
  celebration: ['عيد ميلاد', 'تخرج'],
  love: ['ذكرى', 'زواج'],
  surprise: ['زيارة'],
  formal: ['شركات', 'رمضان']
}

const matches = computed(() => {
  if (step.value !== 4) return []
  const b = GIFT_BUDGETS.find(x => x.id === budget.value)
  if (!b) return []
  let list = products.value.filter(p => p.price >= b.min && p.price <= b.max)
  if (moment.value && momentToOcc[moment.value]) {
    const filtered = list.filter(p => p.occ.some(o => momentToOcc[moment.value].some(m => o.includes(m) || m.includes(o))))
    if (filtered.length) list = filtered
  }
  return list.slice(0, 8)
})

const back = () => {
  if (budget.value) budget.value = ''
  else if (who.value) who.value = ''
  else if (moment.value) moment.value = ''
}

const reset = () => {
  moment.value = ''
  who.value = ''
  budget.value = ''
}
</script>

<template>
  <section class="gift-finder-page">
    <div class="wrap">
      <div class="gf-steps">
        <div :class="['gf-step', { on: step === 1, done: step > 1 }]">
          <span class="n">{{ step > 1 ? '✓' : '1' }}</span> اللحظة
        </div>
        <div :class="['gf-step', { on: step === 2, done: step > 2 }]">
          <span class="n">{{ step > 2 ? '✓' : '2' }}</span> المُهدى إليه
        </div>
        <div :class="['gf-step', { on: step === 3, done: step > 3 }]">
          <span class="n">{{ step > 3 ? '✓' : '3' }}</span> الميزانية
        </div>
      </div>

      <!-- Step 1: Moment -->
      <template v-if="step === 1">
        <div class="gf-head">
          <h1>ما هي اللحظة؟</h1>
          <p>كل هدية تحكي حكاية… اختر اللحظة ونحن نكمل</p>
        </div>
        <div class="gf-moments">
          <button v-for="m in GIFT_MOMENTS" :key="m.id" class="gf-moment-card" :style="`--gf-c:${m.color}`" @click="moment = m.id">
            <span class="gf-moment-icon"><span class="gf-moment-blob" /><i :data-lucide="m.icon" /></span>
            <b>{{ m.name }}</b>
            <small>{{ m.line }}</small>
          </button>
        </div>
      </template>

      <!-- Step 2: Who -->
      <template v-if="step === 2">
        <div class="gf-head"><h1>لمن الهدية؟</h1><p>نعرف العلاقة… ونقترح الأنسب</p></div>
        <div class="gf-whos">
          <button v-for="w in GIFT_WHO" :key="w.id" class="gf-who-card" :style="`--gf-c:${w.color}`" @click="who = w.id">
            <span class="gf-who-icon"><span class="gf-who-blob" /><i :data-lucide="w.icon" /></span>
            <b>{{ w.name }}</b>
          </button>
        </div>
        <button class="btn btn-ghost gf-back" @click="back"><i data-lucide="arrow-right" /> السابق</button>
      </template>

      <!-- Step 3: Budget -->
      <template v-if="step === 3">
        <div class="gf-head"><h1>ما ميزانيتك؟</h1><p>سنرشّح لك الهدايا في هذا النطاق</p></div>
        <div class="gf-budgets">
          <button v-for="b in GIFT_BUDGETS" :key="b.id" class="gf-budget-card" @click="budget = b.id">
            <span class="gf-budget-range">{{ b.name }}</span>
          </button>
        </div>
        <button class="btn btn-ghost gf-back" @click="back"><i data-lucide="arrow-right" /> السابق</button>
      </template>

      <!-- Step 4: Results -->
      <template v-if="step === 4">
        <div class="gf-head">
          <h1>وجدنا لك {{ matches.length }} هدية مثالية</h1>
        </div>
        <div class="prod-grid">
          <ProductCard v-for="p in matches" :key="p.id" :product="p" />
        </div>
        <div class="gf-restart">
          <button class="btn btn-ghost" @click="reset"><i data-lucide="rotate-ccw" /> ابدأ من جديد</button>
          <NuxtLink to="/collections" class="btn btn-primary"><i data-lucide="grid" /> تصفّح كل الهدايا</NuxtLink>
        </div>
      </template>
    </div>
  </section>
</template>