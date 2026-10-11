<script setup lang="ts">
import { useCart } from '~/composables/useCart'
import { useProducts } from '~/composables/useProducts'
import { productTitle } from '~/utils/product'
import { KD, cleanPhone } from '~/utils/format'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '~/data/seed'
import { useToast } from '~/composables/useToast'

const { cart, count, subtotal, extrasTotal, clear } = useCart()
const { products } = useProducts()
const { show } = useToast()
const router = useRouter()

if (process.client && !cart.value.length) {
  router.replace('/cart')
}

const step = ref(1)
const delivery = ref({ name: '', phone: '', area: '', street: '', date: '', slot: '' })
const recipient = ref({ name: '', phone: '' })
const payment = ref('knet')

const deliveryFee = computed(() => subtotal.value >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE)
const total = computed(() => subtotal.value + extrasTotal.value + deliveryFee.value)

const slots = ['١٠ص — ١م', '١م — ٤م', '٤م — ٧م', '٧م — ١٠م']

const displayTitle = (item: any) => {
  if (item.title) return item.title
  const p = products.value.find(x => x.id === item.id || item.id?.startsWith(x.id))
  return p ? productTitle(p) : 'هدية فواكه'
}

const next = () => {
  if (step.value === 1) {
    if (!delivery.value.name || !delivery.value.phone) { show('أدخل الاسم والهاتف', 'alert-circle'); return }
  }
  if (step.value < 4) step.value++
}

const back = () => { if (step.value > 1) step.value-- }

const finish = () => {
  // بناء رقم الطلب
  const orderId = `${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`

  const order = {
    id: orderId,
    phone: cleanPhone(delivery.value.phone),
    name: delivery.value.name,
    area: delivery.value.area,
    street: delivery.value.street,
    address: [delivery.value.area, delivery.value.street].filter(Boolean).join('، '),
    deliveryDate: delivery.value.date || delivery.value.slot,
    slot: delivery.value.slot,
    recipient: recipient.value,
    payment: payment.value,
    items: JSON.parse(JSON.stringify(cart.value)),
    itemsCount: cart.value.length,
    total: total.value,
    date: new Date().toLocaleDateString('ar-KW'),
    status: 'preparing',
    created_at: new Date().toISOString()
  }

  // حفظ في localStorage
  if (process.client) {
    const orders = JSON.parse(localStorage.getItem('fa_orders') || '[]')
    orders.push(order)
    localStorage.setItem('fa_orders', JSON.stringify(orders))
    if (order.phone) localStorage.setItem('fa_user_phone', order.phone)
  }

  clear()
  router.push('/success')
}
</script>

<template>
  <section class="page-head" style="padding-bottom:10px">
    <div class="wrap">
      <div class="crumbs"><NuxtLink to="/cart">السلة</NuxtLink> / الدفع</div>
      <h1>إتمام الطلب</h1>
    </div>
  </section>

  <section class="wrap" style="padding-bottom:60px">
    <!-- Step bar -->
    <div class="co-steps">
      <div v-for="(label, i) in ['التوصيل', 'المستلم', 'الدفع', 'المراجعة']" :key="i"
           :class="['co-step', { on: step === i + 1, done: step > i + 1 }]">
        <span class="n">
          <i v-if="step > i + 1" data-lucide="check" />
          <template v-else>{{ i + 1 }}</template>
        </span>
        {{ label }}
      </div>
    </div>

    <div class="cart-wrap">
      <div class="summary" style="position:static">
        <!-- Step 1: Delivery -->
        <template v-if="step === 1">
          <h2 class="co-title">معلومات التوصيل</h2>
          <div class="form-grid two">
            <div class="field">
              <label>الاسم الكامل</label>
              <input v-model="delivery.name" class="custom-input" />
            </div>
            <div class="field">
              <label>رقم الهاتف</label>
              <input v-model="delivery.phone" class="custom-input" type="tel" />
            </div>
          </div>
          <div class="form-grid" style="margin-top:16px">
            <div class="field"><label>المنطقة</label><input v-model="delivery.area" class="custom-input" /></div>
            <div class="field"><label>الشارع ورقم المبنى</label><input v-model="delivery.street" class="custom-input" /></div>
          </div>
          <div class="field" style="margin-top:16px">
            <label>تاريخ التوصيل</label>
            <input v-model="delivery.date" class="custom-input" type="date" />
          </div>
          <div class="field" style="margin-top:16px">
            <label>وقت التوصيل</label>
            <div class="slot-grid">
              <button v-for="t in slots" :key="t" :class="['slot', { on: delivery.slot === t }]" @click="delivery.slot = t">
                {{ t }}
              </button>
            </div>
          </div>
        </template>

        <!-- Step 2: Recipient -->
        <template v-if="step === 2">
          <h2 class="co-title">بيانات المستلم</h2>
          <div class="form-grid two">
            <div class="field"><label>اسم المستلم</label><input v-model="recipient.name" class="custom-input" /></div>
            <div class="field"><label>هاتف المستلم</label><input v-model="recipient.phone" class="custom-input" type="tel" /></div>
          </div>
        </template>

        <!-- Step 3: Payment -->
        <template v-if="step === 3">
          <h2 class="co-title">طريقة الدفع</h2>
          <div class="pay-methods">
            <button :class="['pay', { on: payment === 'knet' }]" @click="payment = 'knet'">
              <i data-lucide="credit-card" /><b>KNET</b><span class="radio" />
            </button>
          </div>
        </template>

        <!-- Step 4: Review -->
        <template v-if="step === 4">
          <h2 class="co-title">مراجعة الطلب</h2>
          <div class="review-card">
            <h4><i data-lucide="truck" /> التوصيل</h4>
            <p>{{ delivery.name }} · {{ delivery.phone }}<br>{{ delivery.area }} {{ delivery.street }}<br>{{ delivery.date }} — {{ delivery.slot }}</p>
          </div>
          <div class="review-card">
            <h4><i data-lucide="user" /> المستلم</h4>
            <p>{{ recipient.name || '—' }}<br>{{ recipient.phone || '' }}</p>
          </div>
          <div class="review-card">
            <h4><i data-lucide="credit-card" /> الدفع</h4>
            <p>KNET</p>
          </div>
          <div class="review-card" style="background:var(--green-50)">
            <h4 style="color:var(--green-900)"><i data-lucide="shopping-bag" /> المنتجات ({{ count }})</h4>
            <p v-for="it in cart" :key="it.key" style="display:flex;justify-content:space-between;font-size:.88rem;margin-bottom:6px">
              <span>{{ displayTitle(it) }} × {{ it.qty }}</span>
              <b>{{ KD((it.price + (it.extrasTotal || 0)) * it.qty) }}</b>
            </p>
          </div>
        </template>

        <!-- Navigation -->
        <div class="wz-nav" style="border-top:1px solid var(--line);margin-top:24px">
          <button v-if="step > 1" class="btn btn-ghost" @click="back">
            <i data-lucide="chevron-right" /> السابق
          </button>
          <NuxtLink v-else to="/cart" class="btn btn-ghost">
            <i data-lucide="chevron-right" /> السلة
          </NuxtLink>

          <button v-if="step < 4" class="btn btn-primary" @click="next">
            التالي <i data-lucide="chevron-left" />
          </button>
          <button v-else class="btn btn-gold btn-lg" @click="finish">
            تأكيد الطلب — {{ KD(total) }}
          </button>
        </div>
      </div>

      <aside class="summary">
        <h3>ملخص</h3>
        <div class="sum-row"><span>المنتجات ({{ count }})</span><span>{{ KD(subtotal) }}</span></div>
        <div v-if="extrasTotal > 0" class="sum-row"><span>الإضافات</span><span>{{ KD(extrasTotal) }}</span></div>
        <div class="sum-row"><span>التوصيل</span><span>{{ deliveryFee === 0 ? 'مجاني' : KD(deliveryFee) }}</span></div>
        <div class="sum-row total"><span>الإجمالي</span><span>{{ KD(total) }}</span></div>
        <div class="sum-note">🔒 دفع آمن · يمكنك الإلغاء قبل التحضير</div>
      </aside>
    </div>
  </section>
</template>