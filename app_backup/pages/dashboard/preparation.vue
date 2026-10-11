<script setup lang="ts">
import { useOrders } from '~/composables/useOrders'
import { useProducts } from '~/composables/useProducts'
import { useAuth } from '~/composables/useAuth'
import type { DashOrder } from '~/composables/useOrders'

definePageMeta({ layout: 'dashboard' })

const { user } = useAuth()
const router = useRouter()
const { orders, updateStatus } = useOrders()
const { products } = useProducts()

onMounted(() => {
  if (!user.value) router.push('/dashboard/login')
})

/* ============ التقسيم ============ */
const toPrepareOrders = computed(() =>
  orders.value
    .filter(o => o.status === 'new' || o.status === 'preparing')
    .sort((a, b) => a.createdAt - b.createdAt)
)

const preparedOrders = computed(() =>
  orders.value
    .filter(o => o.status === 'ready')
    .sort((a, b) => a.createdAt - b.createdAt)
)

/* ============ Helpers ============ */
const getProd = (pid: string) => products.value.find(p => p.id === pid)
const orderItemsCount = (o: DashOrder) =>
  o.items.reduce((s, i) => s + (i.qty || 1), 0)

const firstItemImg = (o: DashOrder) => {
  const p = getProd(o.items[0]?.pid)
  return p ? p.img : ''
}

const extraCount = (o: DashOrder) =>
  o.items.length > 1 ? o.items.length - 1 : 0

/* ⭐ الإضافات — نجمعها من كل الـ items */
const hasMessage = (o: DashOrder) =>
  o.items.some(it => it.extras?.message)

const hasJuice = (o: DashOrder) =>
  o.items.some(it => it.extras?.juice)

const hasChocolate = (o: DashOrder) =>
  o.items.some(it => it.extras?.chocolate)

const getMessageText = (o: DashOrder) => {
  const withMsg = o.items.find(it => it.extras?.message && it.messageText)
  return withMsg?.messageText || (hasMessage(o) ? '(بدون نص)' : '')
}

const getGiftName = (o: DashOrder) => {
  const withGift = o.items.find(it => it.giftName)
  return withGift?.giftName || ''
}

const hasExtras = (o: DashOrder) =>
  hasMessage(o) || hasJuice(o) || hasChocolate(o) || !!getGiftName(o)

/* ============ WhatsApp ============ */
const ADMIN_PHONE = '96551180015'

const notifyReadyWhatsApp = (o: DashOrder) => {
  if (!process.client) return

  const extras: string[] = []
  if (hasMessage(o)) extras.push(`  💬 عبارة: "${getMessageText(o)}"`)
  if (hasJuice(o)) extras.push(`  🥤 بوكس عصير صغير`)
  if (hasChocolate(o)) extras.push(`  🍫 صوص شوكولاتة`)
  if (getGiftName(o)) extras.push(`  🎁 بطاقة باسم: ${getGiftName(o)}`)

  const msg =
`✅ *الطلب جاهز للتوصيل*

📦 رقم الطلب: #${o.id}
👤 العميل: ${o.customerName}
📱 الجوال: ${o.phone}
⏰ الفترة: ${o.slot}
🛒 المنتجات: ${orderItemsCount(o)} منتج
${o.notes ? `\n📝 ملاحظات: ${o.notes}` : ''}${extras.length ? `\n\n➕ *الإضافات:*\n${extras.join('\n')}` : ''}

🍳 تم التحضير بواسطة: ${user.value?.name || 'المطبخ'}

يرجى إسناد مندوب للتوصيل 🚗`

  window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`, '_blank')
}

const cannotPrepareWhatsApp = (o: DashOrder) => {
  if (!process.client) return
  const msg =
`⚠️ *تعذّر التحضير*

📦 رقم الطلب: #${o.id}
👤 العميل: ${o.customerName}
⏰ الفترة: ${o.slot}

🔴 السبب: (اكتب السبب هنا)`

  window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`, '_blank')
}

/* ============ Action ============ */
const markReady = (orderId: string) => {
  updateStatus(orderId, 'ready')
}
</script>

<template>
  <div>
    <div class="dash-head">
      <h1>قائمة التحضير</h1>
      <p>{{ toPrepareOrders.length + preparedOrders.length }} طلب</p>
    </div>

    <!-- ============ قسم ١ ============ -->
    <section v-if="toPrepareOrders.length" class="prep-section prep-section-todo">
      <div class="prep-section-head">
        <div class="prep-section-title">
          <span class="prep-section-icon" style="--c:#f59e0b">
            <i data-lucide="chef-hat" />
          </span>
          <div>
            <h2>الطلبات المطلوبة</h2>
            <small>{{ toPrepareOrders.length }} طلب</small>
          </div>
        </div>
      </div>

      <div class="prep-orders-grid">
        <article
          v-for="o in toPrepareOrders"
          :key="o.id"
          class="prep-order-card"
        >
          <!-- Header -->
          <div class="prep-order-top">
            <div class="prep-order-id">
              <b>#{{ o.id }}</b>
              <span v-if="o.isVip" class="prep-order-vip">VIP</span>
            </div>
            <span class="prep-order-slot">
              <i data-lucide="clock" />
              {{ o.slot }}
            </span>
          </div>

          <!-- Big Image -->
          <div class="prep-hero">
            <img
              v-if="firstItemImg(o)"
              :src="firstItemImg(o)"
              alt=""
              loading="lazy"
            />
            <b v-if="extraCount(o) > 0" class="prep-hero-badge">
              +{{ extraCount(o) }}
            </b>
          </div>

          <!-- Customer -->
          <div class="prep-customer">
            <div class="prep-cust-row">
              <i data-lucide="user" />
              <b>{{ o.customerName }}</b>
            </div>
            <div class="prep-cust-row">
              <i data-lucide="shopping-bag" />
              <span>{{ orderItemsCount(o) }} منتج</span>
            </div>
            <div v-if="o.notes" class="prep-note">
              <i data-lucide="message-square" />
              <span>{{ o.notes }}</span>
            </div>
          </div>

          <!-- Extras -->
          <div v-if="hasExtras(o)" class="prep-extras">
            <!-- Message box -->
            <div v-if="hasMessage(o)" class="prep-message-box">
              <div class="prep-message-head">
                <i data-lucide="message-circle" />
                <span>عبارة</span>
              </div>
              <p class="prep-message-text">
                {{ getMessageText(o) }}
              </p>
            </div>

            <!-- Tags for juice/chocolate/gift -->
            <div
              v-if="hasJuice(o) || hasChocolate(o) || getGiftName(o)"
              class="prep-tags"
            >
              <span v-if="hasJuice(o)" class="prep-tag tag-juice">
                <i data-lucide="cup-soda" />
                بوكس عصير صغير
              </span>
              <span v-if="hasChocolate(o)" class="prep-tag tag-choco">
                <i data-lucide="cookie" />
                صوص شوكولاتة
              </span>
              <span v-if="getGiftName(o)" class="prep-tag tag-gift">
                <i data-lucide="gift" />
                بطاقة: {{ getGiftName(o) }}
              </span>
            </div>
          </div>

          <!-- Footer -->
          <div class="prep-footer">
            <button class="prep-ready-btn" @click="markReady(o.id)">
              <i data-lucide="check-circle" />
              <span>جاهز للتسليم</span>
            </button>
            <button
              class="prep-more-btn"
              title="تعذّر التحضير"
              @click="cannotPrepareWhatsApp(o)"
            >
              <i data-lucide="alert-triangle" />
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- ============ قسم ٢ ============ -->
    <section v-if="preparedOrders.length" class="prep-section prep-section-done">
      <div class="prep-section-head">
        <div class="prep-section-title">
          <span class="prep-section-icon" style="--c:#10b981">
            <i data-lucide="check-check" />
          </span>
          <div>
            <h2>تم تحضيرها</h2>
            <small>{{ preparedOrders.length }} طلب</small>
          </div>
        </div>
      </div>

      <div class="prep-orders-grid">
        <article
          v-for="o in preparedOrders"
          :key="o.id"
          class="prep-done-card"
        >
          <div class="prep-done-badge">
            <i data-lucide="check-circle" />
            <span>تم التحضير</span>
          </div>

          <div class="prep-order-top">
            <div class="prep-order-id">
              <b>#{{ o.id }}</b>
              <span v-if="o.isVip" class="prep-order-vip">VIP</span>
            </div>
            <span class="prep-order-slot">
              <i data-lucide="clock" />
              {{ o.slot }}
            </span>
          </div>

          <div class="prep-hero">
            <img
              v-if="firstItemImg(o)"
              :src="firstItemImg(o)"
              alt=""
              loading="lazy"
            />
            <b v-if="extraCount(o) > 0" class="prep-hero-badge">
              +{{ extraCount(o) }}
            </b>
          </div>

          <div class="prep-customer">
            <div class="prep-cust-row">
              <i data-lucide="user" />
              <b>{{ o.customerName }}</b>
            </div>
            <div class="prep-cust-row">
              <i data-lucide="shopping-bag" />
              <span>{{ orderItemsCount(o) }} منتج</span>
            </div>
            <div v-if="o.notes" class="prep-note">
              <i data-lucide="message-square" />
              <span>{{ o.notes }}</span>
            </div>
          </div>

          <div v-if="hasExtras(o)" class="prep-extras">
            <div v-if="hasMessage(o)" class="prep-message-box">
              <div class="prep-message-head">
                <i data-lucide="message-circle" />
                <span>عبارة</span>
              </div>
              <p class="prep-message-text">
                {{ getMessageText(o) }}
              </p>
            </div>

            <div
              v-if="hasJuice(o) || hasChocolate(o) || getGiftName(o)"
              class="prep-tags"
            >
              <span v-if="hasJuice(o)" class="prep-tag tag-juice">
                <i data-lucide="cup-soda" />
                بوكس عصير صغير
              </span>
              <span v-if="hasChocolate(o)" class="prep-tag tag-choco">
                <i data-lucide="cookie" />
                صوص شوكولاتة
              </span>
              <span v-if="getGiftName(o)" class="prep-tag tag-gift">
                <i data-lucide="gift" />
                بطاقة: {{ getGiftName(o) }}
              </span>
            </div>
          </div>

          <div class="prep-footer">
            <button class="prep-notify-btn" @click="notifyReadyWhatsApp(o)">
              <i data-lucide="message-circle" />
              <span>إبلاغ — جاهز للتوصيل</span>
            </button>
          </div>
        </article>
      </div>
    </section>

    <div
      v-if="!toPrepareOrders.length && !preparedOrders.length"
      class="dash-empty"
    >
      <i data-lucide="party-popper" />
      <b>لا يوجد شيء للتحضير</b>
      <span>كل الطلبات جاهزة ☕</span>
    </div>
  </div>
</template>