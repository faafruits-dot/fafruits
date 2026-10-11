<script setup lang="ts">
import { useCart } from '~/composables/useCart'
import { useFavorites } from '~/composables/useFavorites'
import { useToast } from '~/composables/useToast'
import type { Product } from '~/data/seed'

/* ═══ Props ═══ */
const props = defineProps<{
  product: Product
  message?: string | null
}>()

/* ═══ Composables ═══ */
const { cart, count, add } = useCart()
const { favorites, toggle } = useFavorites()
const { show } = useToast()

/* ═══════════════════════════════════════════════════════
   ⭐ حالة التوفر — لو مش موجود، نفترض إنه متوفر
   ═══════════════════════════════════════════════════════ */
const isAvailable = computed(() => props.product.available !== false)

/* ═══════════════════════════════════════════════════════
   ⭐ حالة السلة — تعتمد مباشرة على cart.value
   ═══════════════════════════════════════════════════════ */
const inCart = computed(() =>
  cart.value.some(
    (item: any) =>
      item.id === props.product.id ||
      item.id?.startsWith(props.product.id + '-'),
  ),
)

/* ═══ Computed ═══ */
const isFav = computed(() => favorites.value.includes(props.product.id))
const mainOcc = computed(() => props.product.occ?.[0] || '')
const hasMessage = computed(() => !!props.message?.trim())

/* ═══ Badge ═══ */
const badge = computed<{ label: string; cls: string } | null>(() => {
  // ⭐ لو غير متوفر، الأولوية للـ badge ده
  if (!isAvailable.value) {
    return { label: 'غير متوفر', cls: 'bs-card__badge--off' }
  }
  if (props.product.luxury) return { label: 'فاخر', cls: 'bs-card__badge--gold' }
  if (props.product.best) return { label: 'الأكثر مبيعًا', cls: '' }
  if (props.product.ready) return { label: 'جاهز اليوم', cls: 'bs-card__badge--ready' }
  return null
})

/* ═══ Format price ═══ */
const priceInt = computed(() => {
  const p = Number(props.product.price) || 0
  return p.toFixed(3).split('.')[0]
})

const priceDec = computed(() => {
  const p = Number(props.product.price) || 0
  return p.toFixed(3).split('.')[1]
})

/* ═══ Add to Cart ═══ */
const handleAdd = () => {
  // ⭐ حماية إضافية
  if (!isAvailable.value) {
    show('⚠️ هذا المنتج غير متوفر حاليًا', 'alert-circle')
    return
  }

  add({
    id: props.product.id,
    title: mainOcc.value || 'هدية فواكه',
    img: props.product.img,
    price: props.product.price,
    serving: props.product.serving,
    grad: props.product.grad,
    extras: { message: false, juice: false, chocolate: false },
    extrasTotal: 0,
    deliveryDate: 'غداً',
  })
  show('أُضيف إلى السلة ✨')
}

/* ═══ Toggle favorite ═══ */
const handleFav = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  toggle(props.product.id)
}
</script>

<template>
  <article :class="['bs-card', { 'is-unavailable': !isAvailable }]">
    <!-- ═══════════════════════════════════════════════
         MEDIA
         ═══════════════════════════════════════════════ -->
    <NuxtLink :to="`/product/${product.id}`" class="bs-card__media">
      <img
        :src="product.img"
        :alt="product.mood || 'هدية فواكه'"
        loading="lazy"
      />

      <!-- Badge (بيشمل "غير متوفر") -->
      <span v-if="badge" :class="['bs-card__badge', badge.cls]">
        {{ badge.label }}
      </span>

      <!-- Occasion chip -->
      <span v-if="mainOcc && !badge" class="bs-card__badge">
        {{ mainOcc }}
      </span>

      <!-- Message Badge -->
      <span v-if="hasMessage" class="bs-card__message">
        <Icon name="feather" :size="12" />
        {{ message }}
      </span>

      <span class="bs-card__veil" aria-hidden="true"></span>

      <!-- ⭐ Overlay للـ Unavailable -->
      <span v-if="!isAvailable" class="bs-card__off-overlay" aria-hidden="true">
        <Icon name="eye-off" :size="32" />
      </span>
    </NuxtLink>

    <!-- ═══════════════════════════════════════════════
         FAVORITE
         ═══════════════════════════════════════════════ -->
    <button
      type="button"
      :class="['bs-card__fav', { on: isFav }]"
      :aria-label="isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'"
      @click="handleFav"
    >
      <Icon
        name="heart"
        :size="18"
        :fill="isFav ? 'currentColor' : 'none'"
      />
    </button>

    <!-- ═══════════════════════════════════════════════
         INFO
         ═══════════════════════════════════════════════ -->
    <div class="bs-card__info">
      <!-- Price -->
      <div class="bs-card__price">
        <span class="bs-card__price-val">{{ priceInt }}.{{ priceDec }}</span>
        <span class="bs-card__price-cur">د.ك</span>
      </div>

      <!-- ═══ Actions ═══ -->
      <div class="bs-card__actions">
        <!-- ⭐ حالة 0: منتج غير متوفر -->
        <button
          v-if="!isAvailable"
          type="button"
          class="btn-unavailable"
          disabled
          aria-label="غير متوفر"
        >
          <Icon name="eye-off" :size="16" />
          غير متوفر حاليًا
        </button>

        <!-- ⭐ حالة 1: زر "أضف إلى السلة" -->
        <button
          v-else-if="!inCart"
          type="button"
          class="btn-add"
          :aria-label="`أضف ${product.mood || 'هدية'} إلى السلة`"
          @click="handleAdd"
        >
          <Icon name="plus" :size="16" />
          أضف إلى السلة
        </button>

        <!-- ⭐ حالة 2: زرين "عرض السلة" + "الدفع الآن" -->
        <div v-else class="bs-card__added">
          <NuxtLink to="/cart" class="btn-view">
            <Icon name="shopping-bag" :size="15" />
            عرض السلة
          </NuxtLink>
          <NuxtLink to="/checkout" class="btn-checkout">
            <Icon name="credit-card" :size="15" />
            الدفع الآن
          </NuxtLink>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   BS CARD
   ═══════════════════════════════════════════════════════════ */
.bs-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.9);
  transition:
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.bs-card:hover {
  transform: translateY(-6px);
  border-color: #fff;
  box-shadow: 0 25px 50px -20px rgba(60, 45, 30, 0.35);
}

/* ⭐ المنتج غير متوفر — باهت */
.bs-card.is-unavailable {
  opacity: 0.65;
  filter: grayscale(0.4);
}
.bs-card.is-unavailable:hover {
  opacity: 0.8;
  filter: grayscale(0.2);
}

/* ═══ MEDIA ═══ */
.bs-card__media {
  position: relative;
  display: block;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: linear-gradient(160deg, #e8c9a0 0%, #c89765 45%, #8c5a2e 100%);
  text-decoration: none;
  color: inherit;
}

.bs-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition:
    transform 1.3s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.65s cubic-bezier(0.22, 1, 0.36, 1);
  filter: saturate(0.95) contrast(1.02);
}

.bs-card:hover .bs-card__media img {
  transform: scale(1.06);
  filter: saturate(1.05) contrast(1.05);
}

.bs-card__veil {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    to top,
    rgba(18, 11, 5, 0.38) 0%,
    rgba(18, 11, 5, 0) 45%
  );
  opacity: 0.85;
  transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}

.bs-card:hover .bs-card__veil {
  opacity: 1;
}

/* ⭐ Overlay للـ Unavailable */
.bs-card__off-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: repeating-linear-gradient(
    45deg,
    transparent 0,
    transparent 20px,
    rgba(220, 38, 38, 0.08) 20px,
    rgba(220, 38, 38, 0.08) 40px
  );
  color: rgba(220, 38, 38, 0.5);
  z-index: 2;
  pointer-events: none;
}

/* ═══ BADGE ═══ */
.bs-card__badge {
  position: absolute;
  top: 14px;
  inset-inline-start: 14px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #fff;
  background: rgba(110, 31, 46, 0.92);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 18px -8px rgba(110, 31, 46, 0.7);
  z-index: 2;
  white-space: nowrap;
}

.bs-card__badge--gold {
  background: rgba(201, 168, 124, 0.95);
  color: var(--ink);
}

.bs-card__badge--ready {
  background: linear-gradient(135deg, #0e8a4f, #0a6b3c);
  color: #fff;
  box-shadow: 0 8px 18px -8px rgba(14, 138, 79, 0.7);
}

/* ⭐ Badge "غير متوفر" */
.bs-card__badge--off {
  background: linear-gradient(135deg, #DC2626, #B91C1C);
  color: #fff;
  box-shadow: 0 8px 18px -8px rgba(220, 38, 38, 0.7);
}

/* ═══ MESSAGE ═══ */
.bs-card__message {
  position: absolute;
  bottom: 14px;
  inset-inline: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: rgba(255, 255, 255, 0.95);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1.5px solid rgba(110, 31, 46, 0.3);
  box-shadow: 0 6px 16px -6px rgba(27, 23, 20, 0.25);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--burgundy);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  animation: msgFade 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.bs-card__message :deep(svg) {
  flex-shrink: 0;
  color: var(--burgundy);
}

@keyframes msgFade {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ═══ FAVORITE ═══ */
.bs-card__fav {
  position: absolute;
  top: 14px;
  inset-inline-end: 14px;
  z-index: 3;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.95);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  color: var(--ink-soft);
  cursor: pointer;
  box-shadow: 0 4px 12px -4px rgba(27, 23, 20, 0.2);
  transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 0;
}

.bs-card__fav:hover {
  transform: scale(1.1);
  color: var(--burgundy);
  box-shadow: 0 6px 16px -4px rgba(110, 31, 46, 0.3);
}

.bs-card__fav.on {
  background: linear-gradient(135deg, var(--burgundy), var(--burgundy-dk));
  color: #fbefe0;
  box-shadow: 0 8px 18px -6px rgba(110, 31, 46, 0.55);
  animation: favPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bs-card__fav.on:hover {
  transform: scale(1.14);
  background: linear-gradient(135deg, var(--burgundy-lt), var(--burgundy));
}

@keyframes favPop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}

/* ═══ INFO ═══ */
.bs-card__info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 18px 18px;
}

.bs-card__price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-family: "Playfair Display", serif;
  color: var(--ink);
}

.bs-card__price-val {
  font-size: clamp(22px, 1.8vw, 26px);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.01em;
}

.bs-card__price-cur {
  font-size: 13px;
  font-weight: 600;
  color: var(--burgundy);
  letter-spacing: 0.02em;
}

/* ═══════════════════════════════════════════════════════════
   ⭐ ACTIONS — التبديل بين الحالات
   ═══════════════════════════════════════════════════════════ */
.bs-card__actions {
  position: relative;
  height: 48px;
  margin-top: auto;
}

/* ⭐ الحالة 0: زر "غير متوفر" */
.btn-unavailable {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  border: 0;
  border-radius: 999px;
  background: rgba(27, 23, 20, 0.08);
  color: var(--ink-mute);
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: not-allowed;
  white-space: nowrap;
}
.btn-unavailable :deep(svg) {
  opacity: 0.7;
}

/* ═══ الحالة 1: زر "أضف إلى السلة" ═══ */
.btn-add {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(150deg, var(--burgundy), var(--burgundy-dk));
  color: #fbefe0;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 14px 28px -16px rgba(110, 31, 46, 0.6);
  white-space: nowrap;
}

.btn-add :deep(svg) {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.btn-add:hover {
  background: linear-gradient(150deg, var(--burgundy-lt), var(--burgundy));
  transform: translateY(-2px);
  box-shadow: 0 20px 36px -18px rgba(110, 31, 46, 0.75);
}

.btn-add:hover :deep(svg) {
  transform: rotate(90deg);
}

.btn-add:active {
  transform: scale(0.97);
}

/* ═══ الحالة 2: زرين "عرض السلة" + "الدفع الآن" ═══ */
.bs-card__added {
  position: absolute;
  inset: 0;
  display: flex;
  gap: 8px;
  animation: addedFade 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes addedFade {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-view,
.btn-checkout {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 100%;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  min-width: 0;
}

.btn-view :deep(svg),
.btn-checkout :deep(svg) {
  flex-shrink: 0;
}

/* زر "عرض السلة" — أبيض */
.btn-view {
  background: #fff;
  color: var(--ink);
  border: 1.5px solid rgba(27, 23, 20, 0.12);
}

.btn-view:hover {
  background: var(--cream);
  transform: translateY(-2px);
  box-shadow: 0 14px 24px -16px rgba(50, 35, 20, 0.55);
}

/* زر "الدفع الآن" — عنابي */
.btn-checkout {
  background: linear-gradient(150deg, var(--burgundy-lt), var(--burgundy));
  color: #fbefe0;
  border: 1px solid rgba(110, 31, 46, 0.5);
  box-shadow: 0 14px 26px -14px rgba(110, 31, 46, 0.85);
}

.btn-checkout:hover {
  background: linear-gradient(150deg, #a4384d, var(--burgundy-lt));
  transform: translateY(-2px);
  box-shadow: 0 20px 36px -16px rgba(110, 31, 46, 0.95);
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 560px) {
  .bs-card__info {
    padding: 18px 16px 16px;
  }

  .bs-card__price-val {
    font-size: 22px;
  }

  .btn-add,
  .btn-unavailable {
    font-size: 13px;
  }

  .btn-view,
  .btn-checkout {
    font-size: 11.5px;
  }

  .bs-card__fav {
    width: 34px;
    height: 34px;
    top: 10px;
    inset-inline-end: 10px;
  }

  .bs-card__badge {
    top: 10px;
    inset-inline-start: 10px;
    padding: 5px 10px;
    font-size: 10px;
  }

  .bs-card__message {
    bottom: 10px;
    inset-inline: 10px;
    padding: 6px 10px;
    font-size: 0.65rem;
  }
}

@media (max-width: 400px) {
  .btn-view,
  .btn-checkout {
    padding: 0 8px;
    gap: 4px;
  }
}

/* ═══════════════════════════════════════════════════════════
   REDUCED MOTION
   ═══════════════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .bs-card,
  .bs-card__media img,
  .bs-card__veil,
  .bs-card__fav,
  .btn-add,
  .btn-add :deep(svg),
  .btn-unavailable,
  .btn-view,
  .btn-checkout,
  .bs-card__added {
    transition: none !important;
    animation: none !important;
  }
}
</style>