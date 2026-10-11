<script setup lang="ts">
import { useDashboardStats } from '~/composables/useDashboardStats'
import { KD } from '~/utils/format'

/* ═══ Composables ═══ */
const {
  kpis,
  weekly,
  topProducts,
  topOccasions,
  topZones,
  statusBreakdown,
} = useDashboardStats()

/* ═══ Helpers ═══ */
const todayLabel = new Date().toLocaleDateString('ar-KW', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const maxWeekly = computed(() => Math.max(...weekly.value.map(d => d.value), 1))
const maxProductCount = computed(() =>
  Math.max(...topProducts.value.map(p => p.count), 1)
)
const maxOccCount = computed(() =>
  Math.max(...topOccasions.value.map(o => o.count), 1)
)
const maxZoneRev = computed(() =>
  Math.max(...topZones.value.map(z => z.revenue), 1)
)
const totalStatus = computed(() =>
  Object.values(statusBreakdown.value).reduce((s, n) => s + n, 0)
)

const statusMeta = [
  { key: 'new',            label: 'جديدة',        color: '#3B82F6' },
  { key: 'sent_to_chef',   label: 'جاري التحضير', color: '#F59E0B' },
  { key: 'sent_to_driver', label: 'في الطريق',    color: '#8B5CF6' },
  { key: 'delivered',      label: 'تم التوصيل',   color: '#10B981' },
] as const

const lateCount = computed(() => kpis.value.lateCount)
</script>

<template>
  <div class="admin-overview">
    <!-- ═══ Head ═══ -->
    <header class="page-head">
      <div>
        <h1>نظرة عامة</h1>
        <p>{{ todayLabel }}</p>
      </div>
    </header>

    <!-- ═══ Late Alert ═══ -->
    <div v-if="lateCount > 0" class="alert-warn">
      <span class="alert-warn__ico">
        <Icon name="alert-triangle" :size="20" />
      </span>
      <div class="alert-warn__txt">
        <b>{{ lateCount }} {{ lateCount === 1 ? 'طلب متأخر' : 'طلبات متأخرة' }} تحتاج انتباه</b>
        <span>موعد التسليم فات — المساعد بيتابعها الآن</span>
      </div>
      <NuxtLink to="/dashboard/orders" class="alert-warn__action">
        <Icon name="eye" :size="14" />
        عرض المتأخرة
      </NuxtLink>
    </div>

    <!-- ═══ KPIs ═══ -->
    <div class="kpis">
      <div class="kpi" style="--kpi-color: #6E1F2E">
        <div class="kpi__head">
          <span class="kpi__ico"><Icon name="dollar-sign" :size="20" /></span>
          <span :class="['kpi__delta', kpis.revenueDelta >= 0 ? 'up' : 'down']">
            {{ kpis.revenueDelta >= 0 ? '▲' : '▼' }} {{ Math.abs(kpis.revenueDelta) }}%
            <span>مقابل أمس</span>
          </span>
        </div>
        <div class="kpi__value">{{ KD(kpis.revenue) }}<small>د.ك</small></div>
        <div class="kpi__label">إيراد اليوم</div>
      </div>

      <div class="kpi" style="--kpi-color: #3B82F6">
        <div class="kpi__head">
          <span class="kpi__ico"><Icon name="shopping-cart" :size="20" /></span>
          <span :class="['kpi__delta', kpis.ordersDelta >= 0 ? 'up' : 'down']">
            {{ kpis.ordersDelta >= 0 ? '▲' : '▼' }} {{ Math.abs(kpis.ordersDelta) }}%
            <span>مقابل أمس</span>
          </span>
        </div>
        <div class="kpi__value">{{ kpis.ordersCount }}</div>
        <div class="kpi__label">عدد الطلبات</div>
      </div>

      <div class="kpi" style="--kpi-color: #A8855B">
        <div class="kpi__head">
          <span class="kpi__ico"><Icon name="trending-up" :size="20" /></span>
          <span :class="['kpi__delta', kpis.avgDelta >= 0 ? 'up' : 'down']">
            {{ kpis.avgDelta >= 0 ? '▲' : '▼' }} {{ Math.abs(kpis.avgDelta) }}%
            <span>مقابل أمس</span>
          </span>
        </div>
        <div class="kpi__value">{{ KD(kpis.avgOrder) }}<small>د.ك</small></div>
        <div class="kpi__label">متوسط الطلب</div>
      </div>

      <div class="kpi" style="--kpi-color: #DC2626">
        <div class="kpi__head">
          <span class="kpi__ico"><Icon name="alert-circle" :size="20" /></span>
          <span class="kpi__delta up">
            ▼ 0% <span>أفضل</span>
          </span>
        </div>
        <div class="kpi__value">{{ kpis.lateCount }}</div>
        <div class="kpi__label">طلبات متأخرة</div>
      </div>
    </div>

    <!-- ═══ Chart + Status ═══ -->
    <div class="grid-2">
      <!-- Chart -->
      <div class="card">
        <div class="card__head">
          <span class="card__head-ico"><Icon name="trending-up" :size="18" /></span>
          <h3 class="card__title">إيرادات آخر 7 أيام</h3>
          <span class="card__meta">
            الإجمالي: {{ KD(weekly.reduce((s, d) => s + d.value, 0)) }} د.ك
          </span>
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

      <!-- Status -->
      <div class="card">
        <div class="card__head">
          <span class="card__head-ico"><Icon name="layers" :size="18" /></span>
          <h3 class="card__title">حالة الطلبات النهاردة</h3>
          <span class="card__meta">{{ totalStatus }} طلب</span>
        </div>
        <div class="card__body">
          <div class="status-bar">
            <div
              v-for="s in statusMeta"
              :key="s.key"
              class="status-segment"
              :style="{
                width: totalStatus > 0
                  ? `${(statusBreakdown[s.key] / totalStatus) * 100}%`
                  : '0%',
                background: s.color,
              }"
            />
          </div>
          <div class="status-legend">
            <div v-for="s in statusMeta" :key="s.key" class="legend-item">
              <span class="legend-dot" :style="{ background: s.color }" />
              <div class="legend-info">
                <b>{{ s.label }}</b>
                <span>
                  {{ totalStatus > 0
                    ? ((statusBreakdown[s.key] / totalStatus) * 100).toFixed(0)
                    : 0 }}% من الطلبات
                </span>
              </div>
              <span class="legend-value">{{ statusBreakdown[s.key] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ Top Products + Occasions ═══ -->
    <div class="grid-even">
      <!-- Top Products -->
      <div class="card">
        <div class="card__head">
          <span class="card__head-ico"><Icon name="flame" :size="18" /></span>
          <h3 class="card__title">الأكثر مبيعًا</h3>
        </div>
        <div class="card__body">
          <div v-if="topProducts.length" class="top-list">
            <div
              v-for="(p, i) in topProducts"
              :key="p.name"
              :class="['top-item', { 'top-item--first': i === 0 }]"
            >
              <span class="top-item__rank">{{ i + 1 }}</span>
              <div>
                <div class="top-item__label">{{ p.name }}</div>
                <div class="top-item__bar">
                  <div
                    class="top-item__bar-fill"
                    :style="{ width: `${(p.count / maxProductCount) * 100}%` }"
                  />
                </div>
              </div>
              <div class="top-item__value">
                {{ p.count }}
                <small>{{ KD(p.revenue) }} د.ك</small>
              </div>
            </div>
          </div>
          <div v-else class="empty-mini">لا توجد مبيعات بعد</div>
        </div>
      </div>

      <!-- Top Occasions -->
      <div class="card">
        <div class="card__head">
          <span class="card__head-ico"><Icon name="star" :size="18" /></span>
          <h3 class="card__title">أفضل المناسبات</h3>
        </div>
        <div class="card__body">
          <div v-if="topOccasions.length" class="top-list">
            <div
              v-for="(o, i) in topOccasions"
              :key="o.name"
              :class="['top-item', { 'top-item--first': i === 0 }]"
            >
              <span class="top-item__rank">{{ i + 1 }}</span>
              <div>
                <div class="top-item__label">{{ o.name }}</div>
                <div class="top-item__bar">
                  <div
                    class="top-item__bar-fill"
                    :style="{ width: `${(o.count / maxOccCount) * 100}%` }"
                  />
                </div>
              </div>
              <div class="top-item__value">{{ o.count }}</div>
            </div>
          </div>
          <div v-else class="empty-mini">لا توجد بيانات</div>
        </div>
      </div>
    </div>

    <!-- ═══ Zones ═══ -->
    <div class="card">
      <div class="card__head">
        <span class="card__head-ico"><Icon name="map-pin" :size="18" /></span>
        <h3 class="card__title">الأداء حسب المنطقة</h3>
      </div>
      <div class="card__body card__body--zones">
        <div v-if="topZones.length">
          <div v-for="z in topZones" :key="z.name" class="zone-row">
            <div class="zone-row__name">{{ z.name }}</div>
            <div class="zone-row__bar">
              <div
                class="zone-row__fill"
                :style="{ width: `${(z.revenue / maxZoneRev) * 100}%` }"
              >
                {{ z.orders }}
              </div>
            </div>
            <div class="zone-row__count">{{ z.orders }} طلب</div>
            <div class="zone-row__revenue">
              {{ KD(z.revenue) }}<small>د.ك</small>
            </div>
          </div>
        </div>
        <div v-else class="empty-mini">لا توجد بيانات مناطق</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-overview { padding-bottom: 20px; }

/* ═══ Page Head ═══ */
.page-head { margin-bottom: 24px; }
.page-head h1 {
  font-family: "Playfair Display", "Almarai", serif;
  font-size: clamp(24px, 3vw, 30px);
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 6px;
}
.page-head p { margin: 0; font-size: 13.5px; color: var(--ink-mute); }

/* ═══ Alert ═══ */
.alert-warn {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 20px;
  border-radius: 14px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
  border: 1.5px solid rgba(245,158,11,.3);
  color: #92400E;
  flex-wrap: wrap;
}
.alert-warn__ico {
  width: 38px; height: 38px;
  display: grid; place-items: center;
  background: #F59E0B; color: #fff;
  border-radius: 10px;
  flex-shrink: 0;
}
.alert-warn__txt { flex: 1; min-width: 0; }
.alert-warn__txt b { display: block; font-size: 14px; font-weight: 800; }
.alert-warn__txt span { font-size: 12.5px; opacity: .85; display: block; margin-top: 3px; }
.alert-warn__action {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 18px;
  background: #F59E0B; color: #fff;
  border-radius: 999px;
  font-size: 12.5px; font-weight: 800;
  text-decoration: none;
  transition: all .2s ease;
}
.alert-warn__action:hover { background: #D97706; }

/* ═══ KPIs ═══ */
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
  transition: all .3s ease;
  overflow: hidden;
}
.kpi::before {
  content: "";
  position: absolute;
  top: 0; inset-inline: 0;
  height: 3px;
  background: var(--kpi-color, var(--burgundy));
}
.kpi:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px -24px rgba(50,35,20,.4);
}
.kpi__head {
  display: flex; align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.kpi__ico {
  width: 42px; height: 42px;
  display: grid; place-items: center;
  border-radius: 12px;
  background: color-mix(in srgb, var(--kpi-color) 12%, transparent);
  color: var(--kpi-color);
}
.kpi__delta {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 800;
  padding: 3px 8px; border-radius: 999px;
}
.kpi__delta.up   { background: rgba(16,185,129,.12); color: #10B981; }
.kpi__delta.down { background: rgba(220,38,38,.12);  color: #DC2626; }
.kpi__delta span { font-weight: 600; opacity: .8; }
.kpi__value {
  font-family: "Playfair Display", serif;
  font-size: 32px; font-weight: 600;
  color: var(--ink); line-height: 1;
  margin-bottom: 8px;
  letter-spacing: -.02em;
}
.kpi__value small {
  font-size: 14px; color: var(--bronze);
  font-weight: 600; margin-inline-start: 4px;
}
.kpi__label { font-size: 12px; font-weight: 700; color: var(--ink-mute); }

/* ═══ Grid ═══ */
.grid-2 {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
  margin-bottom: 18px;
}
.grid-even {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 18px;
}
@media (max-width: 1000px) {
  .grid-2, .grid-even { grid-template-columns: 1fr; }
}

/* ═══ Cards ═══ */
.card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
}
.card__head {
  display: flex; align-items: center; gap: 10px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--line);
}
.card__head-ico {
  width: 34px; height: 34px;
  display: grid; place-items: center;
  border-radius: 10px;
  background: rgba(110,31,46,.08);
  color: var(--burgundy);
  flex-shrink: 0;
}
.card__title {
  font-family: "Playfair Display", "Almarai", serif;
  font-size: 16px; font-weight: 600;
  margin: 0; flex: 1;
  color: var(--ink);
}
.card__meta {
  font-size: 12px; color: var(--ink-mute);
  font-weight: 700;
}
.card__body { padding: 20px 22px; }
.card__body--zones { padding: 8px 12px; }

/* ═══ Chart ═══ */
.chart-bars {
  display: flex; align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  height: 200px;
  padding: 12px 0 32px;
  position: relative;
}
.chart-bar {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; gap: 8px;
  position: relative; height: 100%;
  justify-content: flex-end;
}
.chart-bar__fill {
  width: 100%; max-width: 48px;
  background: linear-gradient(180deg, #8B2E3F, #6E1F2E);
  border-radius: 8px 8px 4px 4px;
  transition: all .35s ease;
  cursor: pointer;
  min-height: 8px;
  position: relative;
}
.chart-bar__fill:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
}
.chart-bar__fill::after {
  content: attr(data-value);
  position: absolute;
  top: -22px; left: 50%;
  transform: translateX(-50%);
  font-size: 11px; font-weight: 800;
  color: var(--ink);
  opacity: 0;
  transition: opacity .2s ease;
  white-space: nowrap;
  pointer-events: none;
}
.chart-bar__fill:hover::after { opacity: 1; }
.chart-bar__label {
  position: absolute; bottom: 0;
  font-size: 11.5px; font-weight: 700;
  color: var(--ink-mute);
}
.chart-bar--today .chart-bar__fill {
  background: linear-gradient(180deg, #D4A574, #A8855B);
}
.chart-bar--today .chart-bar__label { color: var(--bronze); }

/* ═══ Status ═══ */
.status-bar {
  display: flex; height: 12px;
  border-radius: 6px; overflow: hidden;
  margin-bottom: 16px;
  background: var(--cream);
}
.status-segment { transition: all .3s ease; }
.status-legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.legend-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--cream);
}
.legend-dot {
  width: 10px; height: 10px;
  border-radius: 50%; flex-shrink: 0;
}
.legend-info { flex: 1; min-width: 0; }
.legend-info b {
  display: block; font-size: 13px;
  font-weight: 700; color: var(--ink);
}
.legend-info span { font-size: 11px; color: var(--ink-mute); }
.legend-value {
  font-family: "Playfair Display", serif;
  font-size: 20px; font-weight: 600;
  color: var(--ink);
}

/* ═══ Top List ═══ */
.top-list { display: flex; flex-direction: column; gap: 12px; }
.top-item {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 12px; align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  transition: background .2s ease;
}
.top-item:hover { background: var(--cream); }
.top-item__rank {
  width: 28px; height: 28px;
  display: grid; place-items: center;
  border-radius: 8px;
  background: var(--cream);
  font-family: "Playfair Display", serif;
  font-size: 13px; font-weight: 700;
  color: var(--burgundy);
}
.top-item--first .top-item__rank {
  background: linear-gradient(135deg, #D4A574, #A8855B);
  color: #fff;
}
.top-item__label {
  font-size: 13.5px; font-weight: 700;
  color: var(--ink);
}
.top-item__bar {
  height: 6px; border-radius: 3px;
  background: var(--cream);
  margin-top: 6px; overflow: hidden;
}
.top-item__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B2E3F, #6E1F2E);
  border-radius: 3px;
}
.top-item__value {
  font-size: 13px; font-weight: 800;
  color: var(--ink); text-align: left;
  white-space: nowrap;
}
.top-item__value small {
  font-size: 11px; font-weight: 600;
  color: var(--ink-mute);
  display: block; margin-top: 2px;
}

/* ═══ Zones ═══ */
.zone-row {
  display: grid;
  grid-template-columns: 120px 1fr 80px 100px;
  gap: 14px; align-items: center;
  padding: 14px 12px;
  border-bottom: 1px dashed var(--line);
}
.zone-row:last-child { border-bottom: 0; }
.zone-row__name {
  font-weight: 800; font-size: 13.5px;
  color: var(--ink);
}
.zone-row__bar {
  height: 24px; background: var(--cream);
  border-radius: 8px; overflow: hidden;
}
.zone-row__fill {
  height: 100%;
  background: linear-gradient(90deg, #8B2E3F, #6E1F2E);
  border-radius: 8px;
  transition: width .6s ease;
  display: flex; align-items: center;
  justify-content: flex-end;
  padding-inline-end: 8px;
  color: #FBEFE0;
  font-size: 11px; font-weight: 800;
  min-width: 30px;
}
.zone-row__count {
  font-size: 13px; font-weight: 700;
  color: var(--ink-soft); text-align: center;
}
.zone-row__revenue {
  font-family: "Playfair Display", serif;
  font-size: 14px; font-weight: 600;
  color: var(--burgundy); text-align: left;
}
.zone-row__revenue small {
  font-size: 10px; color: var(--bronze);
  margin-inline-start: 3px;
}

.empty-mini {
  padding: 30px 20px;
  text-align: center;
  font-size: 13px;
  color: var(--ink-mute);
}

/* ═══ Responsive ═══ */
@media (max-width: 900px) {
  .zone-row { grid-template-columns: 80px 1fr 60px; gap: 8px; }
  .zone-row__revenue { display: none; }
  .status-legend { grid-template-columns: 1fr; }
}
</style>