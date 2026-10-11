<script setup lang="ts">
import { useCart } from '~/composables/useCart'
import { useProducts } from '~/composables/useProducts'
import { productTitle } from '~/utils/product'
import { KD } from '~/utils/format'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '~/data/seed'

const { cart, count, subtotal, extrasTotal, setQty, remove } = useCart()
const { products } = useProducts()

const delivery = computed(() => subtotal.value >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE)
const total = computed(() => subtotal.value + extrasTotal.value + delivery.value)

const displayTitle = (item: any) => {
  if (item.title) return item.title
  const p = products.value.find(x => x.id === item.id || item.id?.startsWith(x.id))
  return p ? productTitle(p) : 'هدية فواكه'
}

const extraText = (item: any) => {
  const ex = []
  if (item.extras?.message) ex.push('عبارة')
  if (item.extras?.juice) ex.push('عصير')
  if (item.extras?.chocolate) ex.push('شوكولاتة')
  return ex.join(' · ')
}
</script>

<template>
  <section v-if="!cart.length" class="sec">
    <div class="wrap">
      <div class="empty-state">
        <i data-lucide="shopping-bag" />
        <h3>سلتك فارغة</h3>
        <p>ابدأ باختيار المناسبة أو استخدم "هدية مثالية"</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <NuxtLink to="/gift-finder" class="btn btn-primary">
            <i data-lucide="sparkles" /> هدية مثالية
          </NuxtLink>
          <NuxtLink to="/occasions" class="btn btn-ghost">تصفّح المناسبات</NuxtLink>
        </div>
      </div>
    </div>
  </section>

  <template v-else>
    <section class="page-head" style="padding-bottom:10px">
      <div class="wrap">
        <div class="crumbs"><NuxtLink to="/">الرئيسية</NuxtLink> / السلة</div>
        <h1>سلة الهدايا</h1>
      </div>
    </section>

    <section class="wrap">
      <div class="cart-wrap">
        <div class="cart-list">
          <div v-for="it in cart" :key="it.key" class="cart-item">
            <div class="ci-img"><img :src="it.img" :alt="displayTitle(it)" /></div>
            <div class="ci-body">
              <h4>{{ displayTitle(it) }}</h4>
              <div class="ci-meta">
                <div v-if="it.serving"><i data-lucide="user" /> <b>{{ it.serving }}</b></div>
                <div v-if="it.giftName"><i data-lucide="gift" /> إلى: <b>{{ it.giftName }}</b></div>
                <div v-if="extraText(it)"><i data-lucide="plus-circle" /> {{ extraText(it) }}</div>
                <div v-if="it.messageText"><i data-lucide="message-circle" /> "{{ it.messageText }}"</div>
                <div v-if="it.deliveryDate"><i data-lucide="calendar" /> {{ it.deliveryDate }}</div>
              </div>
              <div class="ci-foot">
                <div class="qty">
                  <button @click="setQty(it.key, it.qty - 1)"><i data-lucide="minus" /></button>
                  <span>{{ it.qty }}</span>
                  <button @click="setQty(it.key, it.qty + 1)"><i data-lucide="plus" /></button>
                </div>
                <div class="ci-price">{{ KD((it.price + (it.extrasTotal || 0)) * it.qty) }}</div>
                <button class="ci-remove" @click="remove(it.key)">إزالة</button>
              </div>
            </div>
          </div>
        </div>

        <aside class="summary">
          <h3>ملخص الطلب</h3>
          <div class="sum-row"><span>المنتجات ({{ count }})</span><span>{{ KD(subtotal) }}</span></div>
          <div v-if="extrasTotal > 0" class="sum-row"><span>الإضافات</span><span>{{ KD(extrasTotal) }}</span></div>
          <div class="sum-row"><span>التوصيل</span><span>{{ delivery === 0 ? 'مجاني' : KD(delivery) }}</span></div>
          <div class="sum-note">✦ التوصيل {{ delivery === 0 ? 'مجاني' : '١ د.ك فقط' }}<br>✦ تغليف هدايا فاخر مشمول</div>
          <div class="sum-row total"><span>الإجمالي</span><span>{{ KD(total) }}</span></div>
          <NuxtLink to="/checkout" class="btn btn-primary btn-block btn-lg" style="margin-top:16px">
            متابعة الدفع <i data-lucide="chevron-left" />
          </NuxtLink>
        </aside>
      </div>
    </section>
  </template>
</template>