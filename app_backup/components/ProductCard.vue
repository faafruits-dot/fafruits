<script setup lang="ts">
import { useCart } from '~/composables/useCart'
import { useFavorites } from '~/composables/useFavorites'
import { useToast } from '~/composables/useToast'
import { KD } from '~/utils/format'
import type { Product } from '~/data/seed'

const props = defineProps<{ product: Product }>()

const { hasProduct, count, add } = useCart()
const { favorites, toggle } = useFavorites()
const { show } = useToast()

const isFav = computed(() => favorites.value.includes(props.product.id))
const inCart = computed(() => hasProduct(props.product.id))

const mainOcc = computed(() => props.product.occ?.[0] || '')

/* وسوم المنتج */
const tags = computed(() => {
  const list: { label: string; cls: string }[] = []
  if (props.product.luxury) list.push({ label: 'فاخر', cls: 'luxury' })
  if (props.product.best)   list.push({ label: 'الأكثر مبيعًا', cls: 'best' })
  if (props.product.ready)  list.push({ label: 'جاهز اليوم', cls: 'ready' })
  return list
})

const addToCart = () => {
  add({
    id: props.product.id,
    title: mainOcc.value || 'هدية فواكه',
    img: props.product.img,
    price: props.product.price,
    serving: props.product.serving,
    grad: props.product.grad,
    extras: { message: false, juice: false, chocolate: false },
    extrasTotal: 0,
    deliveryDate: 'غداً'
  })
  show('أُضيف إلى السلة بنجاح')
}
</script>

<template>
  <article class="pcard">
    <NuxtLink :to="`/product/${product.id}`" class="pcard-link">
      <div class="pcard-img">
        <img :src="product.img" alt="" loading="lazy" />

        <!-- ⭐ Occasion chip — أعلى يمين -->
        <span v-if="mainOcc" class="pcard-occ">
          {{ mainOcc }}
        </span>

        <!-- ⭐ Tags — أسفل الصورة (تراكم) -->
        <div class="pcard-tags">
          <span
            v-for="t in tags"
            :key="t.cls"
            :class="['pcard-tag', `pcard-tag-${t.cls}`]"
          >
            {{ t.label }}
          </span>
        </div>
      </div>
    </NuxtLink>

    <!-- ⭐ Heart — أعلى يسار -->
    <button
      :class="['pcard-fav', { on: isFav }]"
      @click.stop="toggle(product.id)"
      aria-label="المفضلة"
    >
      <i data-lucide="heart" />
    </button>

    <!-- Footer: price + add -->
    <div class="pcard-foot">
      <template v-if="inCart">
        <div class="pcard-in-cart">
          <NuxtLink to="/cart" class="pcard-btn pcard-btn-ghost">
            <i data-lucide="shopping-bag" />
            <span>السلة ({{ count }})</span>
          </NuxtLink>
          <NuxtLink to="/checkout" class="pcard-btn pcard-btn-gold">
            <i data-lucide="zap" />
            <span>الدفع</span>
          </NuxtLink>
        </div>
      </template>
      <template v-else>
        <span class="pcard-price">{{ KD(product.price) }}</span>
        <button class="pcard-add" @click="addToCart" aria-label="أضف">
          <i data-lucide="plus" />
        </button>
      </template>
    </div>
  </article>
</template>