<script setup lang="ts">
import { useDashboardStats } from '~/composables/useDashboardStats'
import { KD } from '~/utils/format'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'التقارير — لوحة الإدارة' })

const { kpis, topProducts, topZones, weekly } = useDashboardStats()

const maxWeekly = computed(() => Math.max(...weekly.value.map(d => d.value), 1))
</script>

<template>
  <div class="reports-page">
    <header class="page-head">
      <div>
        <h1>التقارير</h1>
        <p>تحليلات مفصلة لأداء البيزنس</p>
      </div>
    </header>

    <!-- KPIs -->
    <div class="kpis">
      <div class="kpi" style="--kpi-color: #6E1F2E">
        <div class="kpi__head">
          <span class="kpi__ico"><Icon name="dollar-sign" :size="20" /></span>
        </div>
        <div class="kpi__value">{{ KD(kpis.revenue) }}<small>د.ك</small></div>
        <div class="kpi__label">إيراد اليوم</div>
      </div>
      <div class="kpi" style="--kpi-color: #3B82F6">
        <div class="kpi__head">
          <span class="kpi__ico"><Icon name="shopping-cart" :size="20" /></span>
        </div>
        <div class="kpi__value">{{ kpis.ordersCount }}</div>
        <div class="kpi__label">طلبات اليوم</div>
      </div>
      <div class="kpi" style="--kpi-color: #A8855B">
        <div class="kpi__head">
          <span class="kpi__ico"><Icon name="trending-up" :size="20" /></span>
        </div>
        <div class="kpi__value">{{ KD(kpis.avgOrder) }}<small>د.ك</small></div>
        <div class="kpi__label">متوسط الطلب</div>
      </div>
      <div class="kpi" style="--kpi-color: #10B981">
        <div class="kpi__head">
          <span class="kpi__ico"><Icon name="check-circle" :size="20" /></span>
        </div>
        <div class="kpi__value">96<small>%</small></div>
        <div class="kpi__label">معدل التسليم</div>
      </div>
    </div>

    <!-- Chart -->
    <div class="card">
      <div class="card__head">
        <span class="card__head-ico"><Icon name="trending-up" :size="18" /></span>
        <h3 class="card__title">الإيراد اليومي — آخر 7 أيام</h3>
      </div>
      <div class="card__body">
        <div class="chart-bars">
          <div
            v-for="(d, i) in weekly"
            :key="i"
            :class="['chart-bar', { 'chart-bar--today': d.isToday }]"
          >
            <div
              class="chart-bar__fill"
              :style="{ height: `${Math.max((d.value / maxWeekly) * 100, 4)}%` }"
              :data-value="`${KD(d.value)} د.ك`"
            />
            <span class="chart-bar__label">{{ d.day }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tables -->
    <div class="grid-even">
      <div class="card">
        <div class="card__head">
          <span class="card__head-ico"><Icon name="flame" :size="18" /></span>
          <h3 class="card__title">أداء المنتجات</h3>
        </div>
        <div class="card__body" style="padding: 0;">
          <table class="report-table">
            <thead>
              <tr><th>المنتج</th><th>المبيعات</th><th>الإيراد</th></tr>
            </thead>
            <tbody>
              <tr v-for="p in topProducts" :key="p.name">
                <td><b>{{ p.name }}</b></td>
                <td>{{ p.count }}</td>
                <td class="price-cell">{{ KD(p.revenue) }} د.ك</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <span class="card__head-ico"><Icon name="map-pin" :size="18" /></span>
          <h3 class="card__title">أداء المناطق</h3>
        </div>
        <div class="card__body" style="padding: 8px 12px;">
          <div
            v-for="z in topZones"
            :key="z.name"
            class="zone-row"
          >
            <div class="zone-row__name">{{ z.name }}</div>
            <div class="zone-row__bar">
              <div
                class="zone-row__fill"
                :style="{ width: `${(z.revenue / (topZones[0]?.revenue || 1)) * 100}%` }"
              >
                {{ z.orders }}
              </div>
            </div>
            <div class="zone-row__count">{{ z.orders }}</div>
            <div class="zone-row__revenue">{{ KD(z.revenue) }}<small>د.ك</small></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reports-page { padding-bottom: 20px; }

.page-head { margin-bottom: 24px; }
.page-head h1 {
  font-family: "Playfair Display", "Almarai", serif;
  font-size: clamp(24px, 3vw, 30px);
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 6px;
}
.page-head p { margin: 0; font-size: 13.5px; color: var(--ink-mute); width: 100%;
  max-width: 100%}

.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}
.kpi {
  position: relative;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 20px;
  padding: 20px;
  overflow: hidden;
}
/* .kpi::before {
  content: "";
  position: absolute;
  top: 0;
  inset-inline: 0;
  height: 3px;
  background: var(--kpi-color);
} */
.kpi__ico {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: color-mix(in srgb, var(--kpi-color) 12%, transparent);
  color: var(--kpi-color);
  margin-bottom: 12px;
}
.kpi__value {
  font-family: "Playfair Display", serif;
  font-size: 32px;
  font-weight: 600;
  color: var(--ink);
  line-height: 1;
  margin-bottom: 8px;
}
.kpi__value small {
  font-size: 14px;
  color: var(--bronze);
  margin-inline-start: 4px;
}
.kpi__label {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-mute);
}

.grid-even {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
@media (max-width: 1000px) {
  .grid-even { grid-template-columns: 1fr; }
}

.card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 18px;
}
.card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--line);
}
.card__head-ico {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(110, 31, 46, .08);
  color: var(--burgundy);
}
.card__title {
  font-family: "Playfair Display", "Almarai", serif;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--ink);
}
.card__body { padding: 20px 22px; }

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  height: 240px;
  padding: 12px 0 32px;
  position: relative;
}
.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  height: 100%;
  justify-content: flex-end;
}
.chart-bar__fill {
  width: 100%;
  max-width: 48px;
  background: linear-gradient(180deg, #8B2E3F, #6E1F2E);
  border-radius: 8px 8px 4px 4px;
  min-height: 8px;
  position: relative;
  cursor: pointer;
  transition: all .35s ease;
}
.chart-bar__fill:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
}
.chart-bar__fill::after {
  content: attr(data-value);
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 800;
  color: var(--ink);
  opacity: 0;
  transition: opacity .2s ease;
  white-space: nowrap;
}
.chart-bar__fill:hover::after { opacity: 1; }
.chart-bar__label {
  position: absolute;
  bottom: 0;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--cream);
}
.chart-bar--today .chart-bar__fill {
  background: linear-gradient(180deg, #D4A574, #A8855B);
}
.chart-bar--today .chart-bar__label { color: var(--bronze); }

.report-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.report-table th {
  text-align: right;
  padding: 12px 14px;
  font-size: 11.5px;
  font-weight: 800;
  color: var(--ink-mute);
  text-transform: uppercase;
  letter-spacing: .05em;
  background: var(--cream);
  border-bottom: 1px solid var(--line);
}
.report-table td {
  padding: 14px;
  font-size: 13px;
  color: var(--ink-soft);
  border-bottom: 1px solid var(--line);
}
.report-table tr:last-child td { border-bottom: 0; }
.report-table tr:hover td { background: var(--cream); }
.price-cell {
  font-family: "Playfair Display", serif;
  font-weight: 600;
  color: var(--ink);
}

.zone-row {
  display: grid;
  grid-template-columns: 120px 1fr 60px 100px;
  gap: 12px;
  align-items: center;
  padding: 14px 12px;
  border-bottom: 1px dashed var(--line);
}
.zone-row:last-child { border-bottom: 0; }
.zone-row__name {
  font-weight: 800;
  font-size: 13px;
  color: var(--ink);
}
.zone-row__bar {
  height: 22px;
  background: var(--cream);
  border-radius: 8px;
  overflow: hidden;
}
.zone-row__fill {
  height: 100%;
  background: linear-gradient(90deg, #8B2E3F, #6E1F2E);
  border-radius: 8px;
  color: #FBEFE0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-inline-end: 8px;
  font-size: 11px;
  font-weight: 800;
  min-width: 30px;
}
.zone-row__count {
  font-size: 13px;
  text-align: center;
  font-weight: 700;
  color: var(--ink-soft);
}
.zone-row__revenue {
  font-family: "Playfair Display", serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--burgundy);
}
.zone-row__revenue small {
  font-size: 10px;
  color: var(--bronze);
  margin-inline-start: 3px;
}

@media (max-width: 900px) {
  .zone-row {
    grid-template-columns: 80px 1fr 60px;
    gap: 8px;
  }
  .zone-row__revenue { display: none; }
}
</style>