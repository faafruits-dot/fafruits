<script setup lang="ts">
import { useCart } from "~/composables/useCart";
import { useProducts } from "~/composables/useProducts";
import { productTitle } from "~/utils/product";
import { KD } from "~/utils/format";
import { CITIES, DEFAULT_CITY, type City } from "~/data/cities";

const { cart, count, subtotal, extrasTotal, setQty, remove } = useCart();
const { products } = useProducts();

/* ═══ التوصيل من عناصر السلة ═══ */
const deliveryCity = computed<City>(() => {
  const first = cart.value[0] as any;
  if (!first?.deliveryCity) return DEFAULT_CITY;
  return CITIES.find((c) => c.id === first.deliveryCity) ?? DEFAULT_CITY;
});

const deliveryCityName = computed(() => deliveryCity.value.name_ar);

// أعلى رسوم توصيل بين العناصر (لو مختلفة)
const deliveryFee = computed(() => {
  if (!cart.value.length) return 0;
  return Math.max(
    ...cart.value.map((it: any) => Number(it.deliveryFee ?? DEFAULT_CITY.fee))
  );
});

const total = computed(
  () => subtotal.value + extrasTotal.value + deliveryFee.value
);

/* ═══ City Picker ═══ */
const showCityPicker = ref(false);

const pickCity = (city: City) => {
  // حدّث كل عنصر في السلة بنفس المدينة
  cart.value = cart.value.map((it: any) => ({
    ...it,
    deliveryCity: city.id,
    deliveryCityName: city.name_ar,
    deliveryFee: city.fee,
  }));
  showCityPicker.value = false;
};

/* ═══ Helpers ═══ */
const displayTitle = (item: any) => {
  if (item.title) return item.title;
  const p = products.value.find(
    (x) => x.id === item.id || item.id?.startsWith(x.id)
  );
  return p ? productTitle(p) : "هدية فواكه";
};

const extraText = (item: any) => {
  const ex: string[] = [];
  if (item.extras?.message) ex.push("عبارة");
  if (item.extras?.juice) ex.push("عصير");
  if (item.extras?.chocolate) ex.push("شوكولاتة");
  return ex.join(" · ");
};
</script>

<template>
  <!-- Empty state -->
  <section v-if="!cart.length" class="sec">
    <div class="wrap">
      <div class="empty-state">
        <Icon name="shopping-bag" />
        <h3>سلتك فارغة</h3>
        <p>ابدأ باختيار المناسبة أو استخدم "هدية مثالية"</p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap">
          <NuxtLink to="/gift-finder" class="btn btn-primary">
            <Icon name="sparkles" /> هدية مثالية
          </NuxtLink>
          <NuxtLink to="/occasions" class="btn btn-ghost">تصفّح المناسبات</NuxtLink>
        </div>
      </div>
    </div>
  </section>

  <template v-else>
    <section class="page-head" style="padding-bottom: 10px">
      <div class="wrap">
        <div class="crumbs">
          <NuxtLink to="/">الرئيسية</NuxtLink> / السلة
        </div>
        <h1>سلة الهدايا</h1>
      </div>
    </section>

    <section class="wrap">
      <div class="cart-wrap">
        <div class="cart-list">
          <div v-for="it in cart" :key="(it as any).key" class="cart-item">
            <div class="ci-img">
              <img :src="it.img" :alt="displayTitle(it)" />
            </div>
            <div class="ci-body">
              <h4>{{ displayTitle(it) }}</h4>
              <div class="ci-meta">
                <div v-if="extraText(it)">
                  <Icon name="plus-circle" /> {{ extraText(it) }}
                </div>
                <div v-if="it.messageText">
                  <Icon name="message-circle" /> "{{ it.messageText }}"
                </div>
                <div v-if="it.deliveryDate">
                  <Icon name="calendar" /> {{ it.deliveryDate }}
                </div>
                <div v-if="(it as any).deliveryCityName">
                  <Icon name="map-pin" /> {{ (it as any).deliveryCityName }}
                </div>
              </div>
              <div class="ci-foot">
                <div class="qty">
                  <button @click="setQty((it as any).key, it.qty - 1)">
                    <Icon name="minus" />
                  </button>
                  <span>{{ it.qty }}</span>
                  <button @click="setQty((it as any).key, it.qty + 1)">
                    <Icon name="plus" />
                  </button>
                </div>
                <div class="ci-price">
                  {{ KD((it.price + (it.extrasTotal || 0)) * it.qty) }}
                </div>
                <button class="ci-remove" @click="remove((it as any).key)">
                  إزالة
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside class="summary">
          <h3>ملخص الطلب</h3>

          <div class="sum-row">
            <span>المنتجات ({{ count }})</span>
            <span>{{ KD(subtotal) }}</span>
          </div>

          <div v-if="extrasTotal > 0" class="sum-row">
            <span>الإضافات</span>
            <span>{{ KD(extrasTotal) }}</span>
          </div>

          <!-- ⭐ صف التوصيل — قابل للنقر لتغيير المدينة -->
          <button
            type="button"
            class="sum-row sum-row-btn"
            @click="showCityPicker = true"
          >
            <span>
              <Icon name="truck" :size="14" />
              التوصيل — <b class="city-name">{{ deliveryCityName }}</b>
              <Icon name="chevron-down" :size="12" />
            </span>
            <span>{{ KD(deliveryFee) }}</span>
          </button>

<div class="sum-note">
  <span class="sum-note-line">
    <Icon name="truck" :size="14" />
    رسوم التوصيل حسب المنطقة
  </span>
  <span class="sum-note-line">
    <Icon name="package" :size="14" />
    تغليف هدايا فاخر مشمول
  </span>
  <span class="sum-note-line highlight">
    <Icon name="gift" :size="14" />
    <b>كارت إهداء مجاني</b> مع كل طلب
  </span>
</div>

          <div class="sum-row total">
            <span>الإجمالي</span>
            <span>{{ KD(total) }}</span>
          </div>

          <NuxtLink
            to="/checkout"
            class="btn btn-primary btn-block btn-lg"
            style="margin-top: 16px"
          >
            متابعة الدفع <Icon name="chevron-left" />
          </NuxtLink>
        </aside>
      </div>
    </section>

    <!-- ⭐ City Picker Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showCityPicker"
          class="city-modal-overlay"
          @click.self="showCityPicker = false"
        >
          <div class="city-modal">
            <div class="city-modal-head">
              <h3>
                <Icon name="map-pin" :size="20" />
                اختر منطقة التوصيل
              </h3>
              <button
                type="button"
                class="city-modal-close"
                @click="showCityPicker = false"
                aria-label="إغلاق"
              >
                <Icon name="x" :size="18" />
              </button>
            </div>

            <p class="city-modal-hint">
              رسوم التوصيل تختلف حسب المنطقة — الحد الأدنى 1 د.ك
            </p>

            <div class="city-list">
              <button
                v-for="city in CITIES"
                :key="city.id"
                type="button"
                :class="['city-item', { on: deliveryCity.id === city.id }]"
                @click="pickCity(city)"
              >
                <span class="ci-info">
                  <Icon name="map-pin" :size="16" />
                  <b>{{ city.name_ar }}</b>
                </span>
                <span class="ci-fee">{{ city.fee.toFixed(2) }} د.ك</span>
                <span v-if="deliveryCity.id === city.id" class="ci-check">
                  <Icon name="check" :size="14" :stroke-width="3" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </template>
</template>

<style scoped>
/* ═══ صف التوصيل القابل للنقر ═══ */
.sum-row-btn {
  width: 100%;
  background: none;
  border: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-align: start;
  padding: 7px 6px;
  margin: 0 -6px;
  border-radius: 8px;
  transition: all 0.18s ease;
}

.sum-row-btn:hover {
  background: rgba(245, 154, 35, 0.08);
}

.sum-row-btn:hover .city-name {
  text-decoration: underline;
}

.city-name {
  color: var(--gold);
  font-weight: 800;
  margin-inline-start: 4px;
}

/* ═══ City Modal (نفس اللي في product/[id].vue) ═══ */
.city-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(36, 56, 44, 0.5);
  backdrop-filter: blur(4px);
  z-index: 99999;
  display: grid;
  place-items: center;
  padding: 20px;
}

.city-modal {
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  background: #fff;
  border-radius: 22px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  animation: modalSlideUp 0.28s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.city-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1.5px solid var(--line);
  background: linear-gradient(135deg, #fffcf5, #fff8ee);
}

.city-modal-head h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--green-900);
}

.city-modal-head h3 svg {
  color: var(--gold);
}

.city-modal-close {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 50%;
  color: var(--green-900);
  cursor: pointer;
  transition: all 0.18s ease;
}

.city-modal-close:hover {
  background: var(--melon);
  border-color: var(--melon);
  color: #fff;
  transform: rotate(90deg);
}

.city-modal-hint {
  margin: 0;
  padding: 12px 20px;
  background: #fff8ee;
  font-size: 0.78rem;
  color: #8a5a00;
  border-bottom: 1px solid var(--line);
}

.city-list {
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.city-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #fff;
  border: 1.5px solid transparent;
  border-radius: 12px;
  font: inherit;
  color: var(--green-900);
  cursor: pointer;
  text-align: start;
  transition: all 0.18s ease;
}

.city-item:hover {
  background: #fff8ee;
  border-color: var(--line);
}

.city-item.on {
  background: linear-gradient(135deg, #fff8ee, #fff3d6);
  border-color: var(--gold);
  box-shadow: 0 3px 10px rgba(245, 154, 35, 0.15);
}

.ci-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.ci-info svg {
  color: var(--gold);
  flex-shrink: 0;
}

.ci-info b {
  font-size: 0.88rem;
  font-weight: 700;
}

.ci-fee {
  font-family: var(--ff-display);
  font-size: 1rem;
  color: var(--gold);
  font-weight: 700;
  white-space: nowrap;
}

.ci-check {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  background: var(--gold);
  color: #fff;
  border-radius: 50%;
  flex-shrink: 0;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .city-modal {
    max-height: 90vh;
    border-radius: 20px 20px 0 0;
    align-self: end;
    max-width: 100%;
  }
  .city-modal-overlay {
    align-items: end;
    padding: 0;
  }
}
/*------------------------------------------------------------------------------------------------*/
.sum-note {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fff8ee 0%, #fff3d6 100%);
  border: 1.5px dashed var(--gold);
  border-radius: 14px;
  font-size: 0.78rem;
  color: #7a5b00;
  line-height: 1.5;
}

.sum-note-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sum-note-line svg {
  color: var(--gold);
  flex-shrink: 0;
}

.sum-note-line.highlight {
  padding: 8px 10px;
  margin: 2px -4px -4px;
  background: linear-gradient(135deg, rgba(245, 154, 35, 0.15) 0%, rgba(255, 176, 32, 0.12) 100%);
  border: 1px solid rgba(245, 154, 35, 0.3);
  border-radius: 10px;
  font-weight: 600;
  color: var(--green-900);
  position: relative;
  overflow: hidden;
}

.sum-note-line.highlight::after {
  content: "";
  position: absolute;
  top: 0;
  inset-inline-start: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { inset-inline-start: -100%; }
  50%, 100% { inset-inline-start: 100%; }
}

.sum-note-line.highlight svg {
  color: var(--gold);
  animation: giftBounce 2s ease-in-out infinite;
}

.sum-note-line.highlight b {
  color: var(--gold);
  font-weight: 800;
}

@keyframes giftBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
</style>