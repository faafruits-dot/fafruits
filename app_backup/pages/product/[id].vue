<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'
import { useCart } from '~/composables/useCart'
import { useFavorites } from '~/composables/useFavorites'
import { useToast } from '~/composables/useToast'
import { productTitle } from '~/utils/product'
import { KD } from '~/utils/format'

const route = useRoute()
const { find } = useProducts()
const { add } = useCart()
const { favorites, toggle } = useFavorites()
const { show } = useToast()

const product = computed(() => find(route.params.id as string))
const title = computed(() => productTitle(product.value))

const quantity = ref(1)
const giftName = ref('')
const messageText = ref('')
const selectedExtras = reactive({ message: false, juice: false, chocolate: false })

const isFav = computed(() => product.value ? favorites.value.includes(product.value.id) : false)

const extrasSum = computed(() => {
  let sum = 0
  if (selectedExtras.message) sum += 3
  if (selectedExtras.juice) sum += 3
  if (selectedExtras.chocolate) sum += 2
  return sum
})

const totalPrice = computed(() => product.value ? (product.value.price + extrasSum.value) * quantity.value : 0)

const addToCart = () => {
  if (!product.value) return
  add({
    id: product.value.id,
    title: title.value,
    img: product.value.img,
    price: product.value.price,
    serving: product.value.serving,
    grad: product.value.grad,
    qty: quantity.value,
    extras: { ...selectedExtras },
    extrasTotal: extrasSum.value,
    messageText: messageText.value,
    giftName: giftName.value,
    deliveryDate: 'غداً'
  })
  show('أُضيف إلى السلة')
  navigateTo('/cart')
}
</script>

<template>
  <section v-if="product" class="sec">
    <div class="wrap">
      <div class="pd">
        <div class="pd-gallery">
          <div class="pd-main"><img :src="product.img" :alt="title" /></div>
        </div>
        <div class="pd-info">
          <div class="pd-badges">
            <span v-if="product.ready" class="badge ready">جاهز اليوم</span>
            <span v-if="product.luxury" class="badge gold">مجموعة فاخرة</span>
          </div>
          <h1>{{ title }}</h1>
          <p v-if="product.mood" class="pd-mood">{{ product.mood }}</p>
          <div class="pd-price">
            {{ KD(product.price) }} <small>شامل التغليف · تكفي {{ product.serving }}</small>
          </div>
          <div class="pd-sec">
            <h3><i data-lucide="sparkles" /> المناسبات</h3>
            <div class="occ-badges">
              <span v-for="o in product.occ" :key="o" class="occ-badge">{{ o }}</span>
            </div>
          </div>
          <div class="pd-sec">
            <h3><i data-lucide="leaf" /> ماذا تحتوي؟</h3>
            <div class="fruits-list">
              <span v-for="f in product.fruits" :key="f" class="fruit-static">
                <i data-lucide="cherry" /> {{ f }}
              </span>
            </div>
          </div>
          <div class="pd-quantity-row">
            <span class="custom-label">الكمية</span>
            <div class="qty qty-large">
              <button @click="quantity = Math.max(1, quantity - 1)"><i data-lucide="minus" /></button>
              <span>{{ quantity }}</span>
              <button @click="quantity = Math.min(10, quantity + 1)"><i data-lucide="plus" /></button>
            </div>
          </div>
          <div class="pd-actions">
            <button class="btn btn-primary btn-lg" style="flex:1" @click="addToCart">
              أضف إلى السلة — {{ KD(totalPrice) }}
            </button>
            <button :class="['icon-btn', { 'is-fav': isFav }]" @click="toggle(product.id)">
              <i data-lucide="heart" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>