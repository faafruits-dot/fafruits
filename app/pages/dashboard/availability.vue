<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'
import { productTitle } from '~/utils/product'
import { KD } from '~/utils/format'

definePageMeta({ layout: 'dashboard' })

const { products } = useProducts()

const saved = ref<Record<string, boolean>>({})

onMounted(() => {
  if (process.client) {
    try {
      saved.value = JSON.parse(localStorage.getItem('fa_dash_availability') || '{}')
    } catch {}
  }
})

const availableCount = computed(() => products.value.filter(p => saved.value[p.id] !== false).length)
const disabledCount = computed(() => products.value.length - availableCount.value)

const toggle = (id: string) => {
  const current = saved.value[id] !== false
  saved.value[id] = !current
  if (process.client) {
    localStorage.setItem('fa_dash_availability', JSON.stringify(saved.value))
  }
}
</script>

<template>
  <div>
    <div class="dash-head">
      <h1>التوفر اليومي</h1>
      <p>عطّل المنتجات التي نفدت — التغيير فوري</p>
    </div>

    <div class="avail-summary">
      <div class="avail-summary-stat">
        <span class="avail-summary-icon is-on"><Icon name="check-circle" /></span>
        <div><b>{{ availableCount }}</b><small>متاح للبيع</small></div>
      </div>
      <div class="avail-summary-divider" />
      <div class="avail-summary-stat">
        <span class="avail-summary-icon is-off"><Icon name="x-circle" /></span>
        <div><b>{{ disabledCount }}</b><small>معطّل اليوم</small></div>
      </div>
      <div class="avail-summary-divider" />
      <div class="avail-summary-stat">
        <span class="avail-summary-icon is-info"><Icon name="box" /></span>
        <div><b>{{ products.length }}</b><small>إجمالي المنتجات</small></div>
      </div>
    </div>

    <div v-if="disabledCount > 0" class="avail-alert">
      <Icon name="alert-circle" />
      <span>{{ disabledCount }} منتج معطّل — لن يظهر في المتجر للعملاء.</span>
    </div>

    <div class="avail-list">
      <div v-for="p in products" :key="p.id" :class="['avail-item', saved[p.id] !== false ? 'is-on' : 'is-off']">
        <div class="avail-img-wrap"><img :src="p.img" :alt="productTitle(p)" /></div>
        <div class="avail-info">
          <b>{{ productTitle(p) }}</b>
          <span class="avail-price">{{ KD(p.price) }}</span>
        </div>
        <label class="avail-switch">
          <input type="checkbox" :checked="saved[p.id] !== false" @change="toggle(p.id)" />
          <span class="avail-switch-track"><span class="avail-switch-knob" /></span>
        </label>
      </div>
    </div>
  </div>
</template>