<script setup lang="ts">
import { useCustomerOrders } from '~/composables/useCustomerOrders'
import { KD, cleanPhone } from '~/utils/format'
import type { CustomerOrder } from '~/composables/useCustomerOrders'

const route = useRoute()
const router = useRouter()
const { orders, loading, error, loadByPhone } = useCustomerOrders()

const phone = computed(() => cleanPhone(String(route.params.phone || '')))

/* ═══ تحميل الطلبات ═══ */
watch(phone, (p) => {
  if (p) loadByPhone(p)
}, { immediate: true })

/* ═══ الحالة ═══ */
const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  new:            { label: 'جديد',        color: '#3b82f6', icon: 'sparkles' },
  sent_to_chef:   { label: 'قيد التحضير', color: '#f59e0b', icon: 'chef-hat' },
  sent_to_driver: { label: 'مع المندوب', color: '#8b5cf6', icon: 'truck' },
  delivered:      { label: 'تم التوصيل', color: '#10b981', icon: 'check-check' },
  cancelled:      { label: 'ملغي',        color: '#ef4444', icon: 'x-circle' }
}

const itemsCount = (o: CustomerOrder) =>
  (o.items || []).reduce((s, i) => s + (i.qty || 1), 0)

const formatDate = (d: string) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('ar-KW', {
      day: 'numeric', month: 'short'
    })
  } catch {
    return '—'
  }
}

/* ═══ تغيير الرقم ═══ */
const changePhone = () => {
  router.push('/orders')
}
</script>

<template>
  <div>
    <!-- Head -->
    <section class="page-head" style="padding-bottom:10px">
      <div class="wrap">
        <div class="crumbs">
          <NuxtLink to="/">الرئيسية</NuxtLink> / طلباتي
        </div>
        <h1>طلباتي</h1>
        <p v-if="!loading && orders.length">
          لديك <strong>{{ orders.length }}</strong> طلب مسجّل برقمك
        </p>
      </div>
    </section>

    <section class="wrap" style="padding-bottom:80px">

      <!-- Loading -->
      <div v-if="loading" class="empty-state">
        <Icon name="loader" :size="48" :stroke-width="1.5" />
        <h3>جاري التحميل…</h3>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="empty-state">
        <Icon name="alert-circle" :size="48" :stroke-width="1.5" />
        <h3>{{ error }}</h3>
        <button class="btn btn-primary" @click="loadByPhone(phone)">
          إعادة المحاولة
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="!orders.length" class="empty-state">
        <Icon name="package-search" :size="48" :stroke-width="1.5" />
        <h3>لا توجد طلبات لهذا الرقم</h3>
        <p>الرقم: <strong dir="ltr">{{ phone }}</strong></p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px">
          <NuxtLink to="/occasions" class="btn btn-primary">
            ابدأ التسوق
          </NuxtLink>
          <button class="btn btn-ghost" @click="changePhone">
            تغيير الرقم
          </button>
        </div>
      </div>

      <!-- Orders -->
      <template v-else>
        <!-- Header bar -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;gap:12px;flex-wrap:wrap">
          <span style="font-size:.88rem;color:var(--muted)">
            <Icon name="phone" :size="14" style="vertical-align:middle" />
            <span dir="ltr">{{ phone }}</span>
          </span>
          <button class="btn btn-ghost" style="padding:8px 14px;font-size:.82rem" @click="changePhone">
            <Icon name="log-out" :size="14" />
            تغيير الرقم
          </button>
        </div>

        <!-- Orders list -->
        <div class="orders-list">
          <article
            v-for="o in orders"
            :key="o.id"
            class="order-card"
          >
            <!-- Header -->
            <div class="order-card-head">
              <div>
                <div class="order-card-label">رقم الطلب</div>
                <div class="order-card-id" dir="ltr">#{{ o.id }}</div>
              </div>
              <span
                class="order-status"
                :style="{
                  background: (STATUS_META[o.status]?.color || '#888') + '15',
                  color: STATUS_META[o.status]?.color || '#888'
                }"
              >
                <Icon :name="STATUS_META[o.status]?.icon || 'circle'" :size="12" />
                {{ STATUS_META[o.status]?.label || o.status }}
              </span>
            </div>

            <!-- Meta -->
            <div class="order-card-meta">
              <div><Icon name="calendar" :size="14" /> {{ formatDate(o.created_at) }}</div>
              <div><Icon name="shopping-bag" :size="14" /> {{ itemsCount(o) }} منتج</div>
              <div><Icon name="wallet" :size="14" /> {{ KD(o.total) }}</div>
            </div>

            <!-- Items preview -->
            <div v-if="o.items?.length" class="order-card-items">
              <div
                v-for="it in o.items.slice(0, 3)"
                :key="it.id"
                class="order-card-item"
              >
                <img v-if="it.product_img" :src="it.product_img" :alt="it.product_name" />
                <div class="oci-info">
                  <b>{{ it.product_name || 'هدية فواكه' }}</b>
                  <span>×{{ it.qty }}</span>
                </div>
              </div>
              <div v-if="o.items.length > 3" class="order-card-more">
                +{{ o.items.length - 3 }} منتج آخر
              </div>
            </div>

            <!-- Actions -->
            <div class="order-card-actions">
              <NuxtLink :to="`/track/${o.id}`" class="btn btn-primary">
                <Icon name="map-pin" :size="16" />
                تتبع
              </NuxtLink>
              <NuxtLink :to="`/track/${o.id}`" class="btn btn-ghost">
                <Icon name="eye" :size="16" />
                التفاصيل
              </NuxtLink>
            </div>
          </article>
        </div>
      </template>

    </section>
  </div>
</template>

<style scoped>
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  border-radius: 18px;
  padding: 20px;
  transition: all .18s ease;
   border: 2px dashed var(--line);
  border-radius: var(--radius-lg);
}
/* .order-card:hover {
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
} */

.order-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.order-card-label {
  font-size: .72rem;
  color: var(--muted);
  margin-bottom: 4px;
}

.order-card-id {
  font-family: var(--ff-display);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--green-900);
  letter-spacing: 1px;
}

.order-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: .78rem;
  font-weight: 600;
}

.order-card-meta {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px dashed var(--line);
  border-bottom: 1px dashed var(--line);
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.order-card-meta > div {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: .82rem;
  color: var(--muted);
}

.order-card-items {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.order-card-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 6px 6px;
  background: var(--cream);
  border-radius: 12px;
}
.order-card-item img {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
}
.oci-info {
  display: flex;
  flex-direction: column;
  font-size: .78rem;
}
.oci-info b { color: var(--green-900); }
.oci-info span { color: var(--muted); font-size: .72rem; }

.order-card-more {
  display: grid;
  place-items: center;
  padding: 0 14px;
  background: var(--cream);
  border-radius: 12px;
  font-size: .78rem;
  color: var(--muted);
  font-weight: 600;
}

.order-card-actions {
  display: flex;
  gap: 8px;
}
.order-card-actions .btn {
  flex: 1;
  justify-content: center;
}
</style>