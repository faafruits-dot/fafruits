<script setup lang="ts">
import { useOrders } from '~/composables/useOrders'
import { KD } from '~/utils/format'

definePageMeta({ layout: 'dashboard' })

const { orders } = useOrders()

const revenue = computed(() => orders.value.reduce((s, o) => s + o.total, 0))
const deliveredCount = computed(() => orders.value.filter(o => o.status === 'delivered').length)

const print = () => window.print()
</script>

<template>
  <div>
    <div class="dash-head"><h1>التقارير</h1><p>ملخص الأداء</p></div>

    <div class="dash-reports-grid">
      <div class="dash-report-card">
        <div class="dash-report-label">إيراد اليوم</div>
        <div class="dash-report-value">{{ KD(revenue) }}</div>
        <div class="dash-report-sub">{{ orders.length }} طلب</div>
      </div>
      <div class="dash-report-card">
        <div class="dash-report-label">تم التوصيل</div>
        <div class="dash-report-value">{{ deliveredCount }}</div>
        <div class="dash-report-sub">طلب مكتمل</div>
      </div>
      <div class="dash-report-card">
        <div class="dash-report-label">متوسط الطلب</div>
        <div class="dash-report-value">{{ KD(orders.length ? revenue / orders.length : 0) }}</div>
        <div class="dash-report-sub">لكل طلب</div>
      </div>
    </div>

    <div class="dash-actions-bar">
      <button class="dash-btn dash-btn-ghost" @click="print">
        <i data-lucide="printer" /> طباعة تقرير
      </button>
    </div>
  </div>
</template>