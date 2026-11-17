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

/* ═══ Constants ═══ */
const WHATSAPP_NUMBER = "96551180015";

/* ═══ Composables ═══ */
const { cart, count, add } = useCart()
const { favorites, toggle } = useFavorites()
const { show } = useToast()

/* ═══ State للتوصيل في الكارت (اليوم VIP أو توصيل لاحق) ═══ */
const cardDate = ref<'today' | 'scheduled'>('scheduled')

/* ═══════════════════════════════════════════════════════
   ⭐ حالة التوفر
   ═══════════════════════════════════════════════════════ */
const isAvailable = computed(() => props.product.available !== false)

/* ═══════════════════════════════════════════════════════
   ⭐ حالة السلة
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
const title = computed(() => props.product.mood || mainOcc.value || 'هدية فواكه')

/* ═══ WhatsApp VIP Link للكارت ═══ */
const vipWhatsAppUrl = computed(() => {
  const productUrl = import.meta.client
    ? `${window.location.origin}/product/${props.product.id}`
    : `/product/${props.product.id}`;

  const productImgUrl = import.meta.client
    ? `${window.location.origin}${props.product.img}`
    : props.product.img;

  const lines = [
    "مرحباً FA Fruits 🍓",
    "أريد طلب خدمة اليوم (VIP) من القائمة:",
    "",
    `🍓 المنتج: #${props.product.id.toUpperCase()} - ${title.value}`,
    `🖼️ الصورة: ${productImgUrl}`,
    `🔗 الرابط: ${productUrl}`,
    `💰 السعر: ${Number(props.product.price).toFixed(3)} د.ك`,
    "",
    "الرجاء تأكيد التوفر."
  ];

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    lines.join("\n"),
  )}`;
});

/* ═══ Badge ═══ */
const badge = computed<{ label: string; cls: string } | null>(() => {
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
  if (!isAvailable.value) {
    show('⚠️ هذا المنتج غير متوفر حاليًا', 'alert-circle')
    return
  }

  add({
    id: props.product.id,
    title: title.value,
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

      <span v-if="badge" :class="['bs-card__badge', badge.cls]">
        {{ badge.label }}
      </span>

      <span v-if="mainOcc && !badge" class="bs-card__badge">
        {{ mainOcc }}
      </span>

      <span v-if="hasMessage" class="bs-card__message">
        <Icon name="feather" :size="12" />
        {{ message }}
      </span>

      <span class="bs-card__veil" aria-hidden="true"></span>

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

      <!-- ⭐ خيارات التوصيل السريعة (اليوم VIP vs توصيل لاحق) -->
      <div v-if="isAvailable" class="bs-card__date-toggle">
        <button
          type="button"
          :class="['date-pill', { on: cardDate === 'today' }]"
          @click="cardDate = 'today'"
        >
          <Icon name="zap" :size="11" />
          اليوم (VIP)
        </button>
        <button
          type="button"
          :class="['date-pill', { on: cardDate === 'scheduled' }]"
          @click="cardDate = 'scheduled'"
        >
          <Icon name="calendar" :size="11" />
          توصيل لاحق
        </button>
      </div>

      <!-- ═══ Actions ═══ -->
      <div class="bs-card__actions">
        <!-- ⭐ الحالة 0: منتج غير متوفر -->
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

        <!-- ⭐ الحالة 1: اختيار اليوم (VIP) -> زر واتساب مباشر -->
        <a
          v-else-if="cardDate === 'today'"
          :href="vipWhatsAppUrl"
          target="_blank"
          rel="noopener"
          class="btn-vip-card"
        >
          <Icon name="zap" :size="15" />
          طلب خدمة اليوم (VIP)
        </a>

        <!-- ⭐ الحالة 2: توصيل لاحق + غير موجود بالسلة -> زر "أضف إلى السلة" -->
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

        <!-- ⭐ الحالة 3: توصيل لاحق + موجود بالسلة -> زرين "عرض السلة" + "الدفع الآن" -->
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
}

.bs-card__message :deep(svg) {
  flex-shrink: 0;
  color: var(--burgundy);
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
}

.bs-card__fav.on {
  background: linear-gradient(135deg, var(--burgundy), var(--burgundy-dk));
  color: #fbefe0;
  box-shadow: 0 8px 18px -6px rgba(110, 31, 46, 0.55);
}

/* ═══ INFO ═══ */
.bs-card__info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px 18px;
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
}

.bs-card__price-cur {
  font-size: 13px;
  font-weight: 600;
  color: var(--burgundy);
}

/* ⭐ تصميم شريحة اختيار موعد التوصيل داخل الكارت */
.bs-card__date-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  background: var(--cream);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--line);
}

.date-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 8px;
  background: transparent;
  border: none;
  border-radius: 9px;
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.date-pill:hover {
  color: var(--green-900);
}

.date-pill.on {
  background: #fff;
  color: var(--green-900);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.date-pill.on svg {
  color: var(--gold);
}

/* ═══ ACTIONS ═══ */
.bs-card__actions {
  position: relative;
  height: 48px;
  margin-top: 4px;
}

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
}

/* ⭐ زر طلب VIP السريع من الكارت (ذهبي متناسق مع صفحة المنتج) */
.btn-vip-card {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--gold), var(--mango));
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 10px 24px -12px rgba(245, 154, 35, 0.7);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-vip-card:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);
  box-shadow: 0 16px 30px -14px rgba(245, 154, 35, 0.9);
}

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
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 14px 28px -16px rgba(110, 31, 46, 0.6);
}

.btn-add:hover {
  background: linear-gradient(150deg, var(--burgundy-lt), var(--burgundy));
  transform: translateY(-2px);
  box-shadow: 0 20px 36px -18px rgba(110, 31, 46, 0.75);
}

.bs-card__added {
  position: absolute;
  inset: 0;
  display: flex;
  gap: 8px;
}

.btn-view,
.btn-checkout {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 100%;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.4s ease;
  min-width: 0;
}

.btn-view {
  background: #fff;
  color: var(--ink);
  border: 1.5px solid rgba(27, 23, 20, 0.12);
}

.btn-view:hover {
  background: var(--cream);
  transform: translateY(-2px);
}

.btn-checkout {
  background: linear-gradient(150deg, var(--burgundy-lt), var(--burgundy));
  color: #fbefe0;
  border: 1px solid rgba(110, 31, 46, 0.5);
  box-shadow: 0 14px 26px -14px rgba(110, 31, 46, 0.85);
}

.btn-checkout:hover {
  transform: translateY(-2px);
}
</style>
