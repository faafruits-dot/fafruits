<script setup lang="ts">
import { useCart } from "~/composables/useCart";
import { useProducts } from "~/composables/useProducts";
import { useExtras } from "~/composables/useExtras";
import { useToast } from "~/composables/useToast";
import { productTitle } from "~/utils/product";
import { KD, cleanPhone } from "~/utils/format";
import { CITIES, DEFAULT_CITY, type City } from "~/data/cities";

/* ═══ Composables ═══ */
const { cart, count, subtotal, extrasTotal, clear } = useCart();
const { products } = useProducts();
const { extras, load: loadExtras } = useExtras();
const { show } = useToast();
const router = useRouter();

/* ═══ State ═══ */
const step = ref(1);
const delivery = ref({
  name: "",
  phone: "",
  area: "",
  street: "",
  date: "",
  slot: "",
});
const recipient = ref({ name: "", phone: "" });
const payment = ref("knet");

/* ═══ Helpers — هل الحقل ممتلئ؟ ═══ */
const isFilled = (v: string) => v.trim().length > 0;

/* ═══ التهيئة الأولية ═══ */
onMounted(() => {
  loadExtras();

  // Redirect لو السلة فاضية
  if (!cart.value.length) {
    router.replace("/cart");
    return;
  }

  // ⭐ اقرأ التاريخ من أول عنصر في السلة
  const first = cart.value[0] as any;
  if (first?.deliveryDateISO) {
    delivery.value.date = first.deliveryDateISO;
  } else if (first?.deliveryDate) {
    // fallback للعناصر القديمة
    delivery.value.date = new Date().toISOString().slice(0, 10);
  }
    delivery.value.area = deliveryCity.value.name_ar;
});

/* ═══ المدينة والتوصيل ═══ */
const deliveryCity = computed<City>(() => {
  const first = cart.value[0] as any;
  if (!first?.deliveryCity) return DEFAULT_CITY;
  return CITIES.find((c) => c.id === first.deliveryCity) ?? DEFAULT_CITY;
});

const deliveryCityName = computed(() => deliveryCity.value.name_ar);

const deliveryFee = computed(() => {
  if (!cart.value.length) return 0;
  return Math.max(
    ...cart.value.map((it: any) => Number(it.deliveryFee ?? DEFAULT_CITY.fee)),
  );
});

const total = computed(
  () => subtotal.value + extrasTotal.value + deliveryFee.value,
);

/* ═══ اختيار المدينة في Step 1 ═══ */
const selectedCityId = ref(deliveryCity.value.id);

// مزامنة selectedCityId عند تغيير السلة
watch(
  deliveryCity,
  (c) => {
    selectedCityId.value = c.id;
  },
  { immediate: true },
);

watch(selectedCityId, (newId) => {
  const city = CITIES.find((c) => c.id === newId);
  if (!city) return;
  cart.value = cart.value.map((it: any) => ({
    ...it,
    deliveryCity: city.id,
    deliveryCityName: city.name_ar,
    deliveryFee: city.fee,
  }));
  delivery.value.area = city.name_ar;
});

/* ═══ Helpers ═══ */
const slots = ["١٠ص — ١م", "١م — ٤م", "٤م — ٧م", "٧م — ١٠م"];

const displayTitle = (item: any) => {
  if (item.title) return item.title;
  const p = products.value.find(
    (x) => x.id === item.id || item.id?.startsWith(x.id),
  );
  return p ? productTitle(p) : "هدية فواكه";
};

const extraName = (id: string): string => {
  const found = extras.value.find((e) => e.id === id);
  return found?.name || id;
};

const extraPrice = (id: string): number => {
  const found = extras.value.find((e) => e.id === id);
  return Number(found?.price) || 0;
};

/* ═══ Steps Navigation ═══ */
const next = () => {
  if (step.value === 1) {
    if (!delivery.value.name || !delivery.value.phone) {
      show("أدخل الاسم والهاتف", "alert-circle");
      return;
    }
    if (!delivery.value.area || !delivery.value.street) {
      show("أدخل العنوان", "alert-circle");
      return;
    }
  }
  if (step.value < 4) step.value++;
};

const back = () => {
  if (step.value > 1) step.value--;
};

/* ═══ Submit ═══ */
const submitting = ref(false);
const submitError = ref("");

const finish = async () => {
  if (submitting.value) return;

  submitting.value = true;
  submitError.value = "";

  try {
    const items = cart.value.map((item: any) => {
      const productId = item.product_id || (item.id as string).split("-")[0];
      const product = products.value.find((p) => p.id === productId);

      const selectedExtras: any[] = [];
      if (item.extras && typeof item.extras === "object") {
        for (const [exId, checked] of Object.entries(item.extras)) {
          if (checked) {
            selectedExtras.push({
              extra_id: exId,
              extra_name: extraName(exId),
              price: extraPrice(exId),
              input_value:
                exId === "message" ? item.messageText || null : null,
            });
          }
        }
      }

      const unitPrice = Number(item.price) || 0;
      const extrasPerUnit = Number(item.extrasTotal) || 0;
      const lineTotal = (unitPrice + extrasPerUnit) * (item.qty || 1);

      return {
        product_id: productId,
        product_name:
          product?.mood || displayTitle(item) || item.title || "هدية فواكه",
        product_img: item.img || product?.img || "",
        qty: item.qty || 1,
        unit_price: unitPrice,
        line_total: lineTotal,
        extras: selectedExtras,
      };
    });

    const calcSubtotal = items.reduce((s, i) => s + i.unit_price * i.qty, 0);
    const calcExtras = items.reduce(
      (s, i) =>
        s +
        i.extras.reduce(
          (es: number, e: any) => es + (Number(e.price) || 0),
          0,
        ) *
          i.qty,
      0,
    );
    const calcDelivery = deliveryFee.value;
    const calcTotal = calcSubtotal + calcExtras + calcDelivery;

    const payload = {
      customer_name: delivery.value.name.trim(),
      customer_phone: cleanPhone(delivery.value.phone),
      area: delivery.value.area.trim(),
      street: delivery.value.street.trim(),
      delivery_date:
        delivery.value.date || new Date().toISOString().slice(0, 10),
      slot: delivery.value.slot || "",
      payment_method: payment.value || "knet",
      notes: recipient.value.name
        ? `المستلم: ${recipient.value.name} — ${recipient.value.phone || ""}`
        : "",
      delivery_city: deliveryCity.value.id,
      delivery_city_name: deliveryCity.value.name_ar,
      subtotal: calcSubtotal,
      extras_total: calcExtras,
      delivery_fee: calcDelivery,
      total: calcTotal,
      items,
    };

    const res = await $fetch<{ ok: boolean; order_id: string }>(
      "/api/orders",
      { method: "POST", body: payload },
    );

    if (import.meta.client) {
      localStorage.setItem("fa_last_order", res.order_id);
      localStorage.setItem("fa_user_phone", payload.customer_phone);
    }

    clear();
    await router.push(`/success?order=${res.order_id}`);
  } catch (e: any) {
    console.error("[checkout] error:", e);
    submitError.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      e?.message ||
      "فشل إرسال الطلب — حاول مرة أخرى";
    show(submitError.value, "alert-circle");
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <section class="page-head" style="padding-bottom: 10px">
    <div class="wrap">
      <div class="crumbs">
        <NuxtLink to="/cart">السلة</NuxtLink> / الدفع
      </div>
      <h1>إتمام الطلب</h1>
    </div>
  </section>

  <section class="wrap checkout-section">
    <!-- Step bar -->
    <div class="co-steps">
      <div
        v-for="(label, i) in ['التوصيل', 'المستلم', 'الدفع', 'المراجعة']"
        :key="i"
        :class="['co-step', { on: step === i + 1, done: step > i + 1 }]"
      >
        <span class="n">
          <Icon v-if="step > i + 1" name="check" :size="14" />
          <template v-else>{{ i + 1 }}</template>
        </span>
        {{ label }}
      </div>
    </div>

    <div class="cart-wrap">
      <div class="summary" style="position: static">
        <!-- ═══ Step 1: Delivery ═══ -->
        <template v-if="step === 1">
          <h2 class="co-title">معلومات التوصيل</h2>

          <div class="form-grid two">
            <div class="field" :class="{ filled: isFilled(delivery.name) }">
              <label>
                <span class="req-dot" />
                الاسم الكامل
              </label>
              <input
                v-model="delivery.name"
                class="custom-input"
                placeholder="مثال: أحمد السالم"
              />
            </div>

            <div class="field" :class="{ filled: isFilled(delivery.phone) }">
              <label>
                <span class="req-dot" />
                رقم الهاتف
              </label>
              <input
                v-model="delivery.phone"
                class="custom-input"
                type="tel"
                placeholder="965XXXXXXXX"
                dir="ltr"
              />
            </div>
          </div>

          <div class="form-grid" style="margin-top: 16px">
            <div
              class="field"
              :class="{ filled: isFilled(selectedCityId) }"
            >
              <label>
                <span class="req-dot" />
                المنطقة
              </label>
              <select v-model="selectedCityId" class="custom-input">
                <option
                  v-for="city in CITIES"
                  :key="city.id"
                  :value="city.id"
                >
                  {{ city.name_ar }} — {{ city.fee.toFixed(2) }} د.ك
                </option>
              </select>
            </div>

            <div class="field" :class="{ filled: isFilled(delivery.street) }">
              <label>
                <span class="req-dot" />
                الشارع ورقم المبنى
              </label>
              <input
                v-model="delivery.street"
                class="custom-input"
                placeholder="شارع سالم المبارك، مبنى 5"
              />
            </div>
          </div>

          <div class="field" style="margin-top: 16px">
            <label>تاريخ التوصيل</label>
            <input v-model="delivery.date" class="custom-input" type="date" />
          </div>

          <div
            class="field"
            style="margin-top: 16px"
            :class="{ filled: isFilled(delivery.slot) }"
          >
            <label>
              <span class="req-dot" />
              وقت التوصيل
            </label>
            <div class="slot-grid">
              <button
                v-for="t in slots"
                :key="t"
                type="button"
                :class="['slot', { on: delivery.slot === t }]"
                @click="delivery.slot = t"
              >
                {{ t }}
              </button>
            </div>
          </div>
        </template>

        <!-- ═══ Step 2: Recipient ═══ -->
        <template v-if="step === 2">
          <h2 class="co-title">بيانات المستلم</h2>
          <p class="co-hint">
            <Icon name="info" :size="14" />
            املأ هذه البيانات لو الهدية لشخص آخر — اختياري
          </p>
          <div class="form-grid two">
            <div class="field">
              <label>اسم المستلم</label>
              <input v-model="recipient.name" class="custom-input" />
            </div>
            <div class="field">
              <label>هاتف المستلم</label>
              <input
                v-model="recipient.phone"
                class="custom-input"
                type="tel"
                dir="ltr"
              />
            </div>
          </div>
        </template>

        <!-- ═══ Step 3: Payment ═══ -->
        <template v-if="step === 3">
          <h2 class="co-title">طريقة الدفع</h2>
          <div class="pay-methods">
            <button
              type="button"
              :class="['pay', { on: payment === 'knet' }]"
              @click="payment = 'knet'"
            >
              <Icon name="credit-card" :size="18" />
              <b>KNET</b>
              <span class="radio" />
            </button>
          </div>
          <p class="co-hint" style="margin-top: 16px">
            <Icon name="lock" :size="14" />
            دفع آمن 100% — يمكنك الإلغاء قبل بدء التحضير
          </p>
        </template>

        <!-- ═══ Step 4: Review ═══ -->
        <template v-if="step === 4">
          <h2 class="co-title">مراجعة الطلب</h2>

          <div class="review-card">
            <h4><Icon name="truck" :size="16" /> التوصيل</h4>
            <p>
              {{ delivery.name }} · {{ delivery.phone }}<br />
              {{ delivery.area }} — {{ delivery.street }}<br />
              {{ delivery.date || "—" }} — {{ delivery.slot || "—" }}
            </p>
          </div>

          <div v-if="recipient.name" class="review-card">
            <h4><Icon name="user" :size="16" /> المستلم</h4>
            <p>
              {{ recipient.name }}<br />
              {{ recipient.phone || "" }}
            </p>
          </div>

          <div class="review-card">
            <h4><Icon name="map-pin" :size="16" /> منطقة التوصيل</h4>
            <p>
              {{ deliveryCityName }}
              <b style="color: var(--gold)">
                — {{ deliveryFee.toFixed(2) }} د.ك
              </b>
            </p>
          </div>

          <div class="review-card">
            <h4><Icon name="credit-card" :size="16" /> الدفع</h4>
            <p>KNET</p>
          </div>

          <div class="review-card" style="background: var(--green-50)">
            <h4 style="color: var(--green-900)">
              <Icon name="shopping-bag" :size="16" />
              المنتجات ({{ count }})
            </h4>
            <p
              v-for="it in cart"
              :key="(it as any).key"
              style="
                display: flex;
                justify-content: space-between;
                font-size: 0.88rem;
                margin-bottom: 6px;
              "
            >
              <span>{{ displayTitle(it) }} × {{ it.qty }}</span>
              <b>{{ KD((it.price + (it.extrasTotal || 0)) * it.qty) }}</b>
            </p>
          </div>

          <div
            v-if="submitError"
            style="
              margin-top: 16px;
              padding: 12px 16px;
              background: #ffe8ec;
              color: #b00020;
              border-radius: 12px;
              font-size: 0.9rem;
            "
          >
            <Icon name="alert-circle" :size="16" />
            {{ submitError }}
          </div>
        </template>

        <!-- ═══ Navigation ═══ -->
        <div
          class="wz-nav"
          style="border-top: 1px solid var(--line); margin-top: 24px"
        >
          <button
            v-if="step > 1"
            type="button"
            class="btn btn-ghost"
            :disabled="submitting"
            @click="back"
          >
            <Icon name="chevron-right" :size="18" /> السابق
          </button>
          <NuxtLink v-else to="/cart" class="btn btn-ghost">
            <Icon name="chevron-right" :size="18" /> السلة
          </NuxtLink>

          <button
            v-if="step < 4"
            type="button"
            class="btn btn-primary"
            @click="next"
          >
            التالي <Icon name="chevron-left" :size="18" />
          </button>
          <button
            v-else
            type="button"
            class="btn btn-gold btn-lg"
            :disabled="submitting"
            @click="finish"
          >
            <Icon v-if="submitting" name="loader" :size="18" />
            {{ submitting ? "جاري الإرسال…" : `تأكيد الطلب — ${KD(total)}` }}
          </button>
        </div>
      </div>

      <!-- ═══ Summary Aside ═══ -->
      <aside class="summary">
        <h3>ملخص</h3>

        <div class="sum-row">
          <span>المنتجات ({{ count }})</span>
          <span>{{ KD(subtotal) }}</span>
        </div>

        <div v-if="extrasTotal > 0" class="sum-row">
          <span>الإضافات</span>
          <span>{{ KD(extrasTotal) }}</span>
        </div>

        <div class="sum-row">
          <span>
            <Icon name="truck" :size="14" />
            التوصيل — <b class="city-name">{{ deliveryCityName }}</b>
          </span>
          <span>{{ KD(deliveryFee) }}</span>
        </div>

        <div class="sum-row total">
          <span>الإجمالي</span>
          <span>{{ KD(total) }}</span>
        </div>

        <div class="sum-note">
          <Icon name="lock" :size="12" />
          دفع آمن · يمكنك الإلغاء قبل التحضير
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
/* ═══ City Name ═══ */
.city-name {
  color: var(--gold);
  font-weight: 800;
  margin-inline-start: 4px;
}

/* ═══════════════════════════════════════════════════
   Required Field Indicator — نقطة ذكية
   ═══════════════════════════════════════════════════ */
.req-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold);
  margin-inline-end: 8px;
  vertical-align: middle;
  opacity: 0.7;
  position: relative;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: reqPulse 2.2s ease-in-out infinite;
}

/* عند التعبئة → يتحول لأخضر ويختفي الـ pulse */
.field.filled .req-dot {
  background: var(--green-500);
  opacity: 1;
  animation: none;
  transform: scale(0.85);
}

/* علامة ✓ تظهر بدل النقطة */
.field.filled .req-dot::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  transform: translate(-50%, -50%) scale(0);
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234ca83d' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  animation: checkPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes reqPulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.15);
  }
}

@keyframes checkPop {
  0% {
    transform: translate(-50%, -50%) scale(0);
  }
  60% {
    transform: translate(-50%, -50%) scale(1.3);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* ═══ Field Label ═══ */
.field label {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--green-900);
  transition: color 0.25s ease;
}

.field.filled label {
  color: var(--green-700);
}

/* ═══ Hint Text ═══ */
.co-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  margin: 0 0 16px;
  background: #fff8ee;
  border: 1px solid rgba(245, 154, 35, 0.25);
  border-radius: 10px;
  font-size: 0.78rem;
  color: #7a5b00;
  line-height: 1.5;
}

.co-hint svg {
  color: var(--gold);
  flex-shrink: 0;
}

/* ═══ Select Style ═══ */
select.custom-input {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23f59a23' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: left 14px center;
  padding-inline-end: 42px;
  padding-inline-start: 14px;
  cursor: pointer;
}

select.custom-input:focus {
  border-color: var(--gold);
  background-color: #fff;
}

/* ═══ Review Card ═══ */
.review-card {
  padding: 14px 16px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  margin-bottom: 12px;
}

.review-card h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--green-900);
}

.review-card h4 svg {
  color: var(--gold);
}

.review-card p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
  line-height: 1.7;
}

/* ═══ Pay Methods ═══ */
.pay-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pay {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  font: inherit;
  color: var(--green-900);
  cursor: pointer;
  text-align: start;
  transition: all 0.2s ease;
}

.pay:hover {
  border-color: var(--gold);
  transform: translateY(-1px);
}

.pay.on {
  background: linear-gradient(135deg, #fff8ee, #fff3d6);
  border-color: var(--gold);
  box-shadow: 0 6px 16px rgba(245, 154, 35, 0.15);
}

.pay svg {
  color: var(--gold);
  flex-shrink: 0;
}

.pay b {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 800;
}

.pay .radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--line);
  background: #fff;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.pay.on .radio {
  border-color: var(--gold);
  background: var(--gold);
  box-shadow: inset 0 0 0 3px #fff;
}

/* ═══ Slots ═══ */
.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}

.slot {
  padding: 11px 14px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--green-900);
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.slot:hover {
  border-color: var(--green-500);
}

.slot.on {
  background: linear-gradient(135deg, var(--green-700), var(--green-500));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(76, 168, 61, 0.3);
}

/* ═══ Form Grid ═══ */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.form-grid.two {
  grid-template-columns: 1fr 1fr;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ═══ Title ═══ */
.co-title {
  margin: 0 0 20px;
  font-family: var(--ff-body);
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--green-900);
}

/* ═══ Steps Bar ═══ */
.co-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto 32px;
  flex-wrap: wrap;
  padding: 0 12px;
}

.co-step {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--muted);
  transition: all 0.25s ease;
}

.co-step .n {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  background: var(--cream);
  border-radius: 50%;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--muted);
  transition: all 0.25s ease;
}

.co-step.on {
  background: linear-gradient(135deg, var(--melon), var(--gold));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 16px rgba(233, 74, 99, 0.3);
}

.co-step.on .n {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.co-step.done {
  background: #fff8ee;
  border-color: var(--gold);
  color: var(--green-900);
}

.co-step.done .n {
  background: var(--gold);
  color: #fff;
}

/* ═══ Navigation ═══ */
.wz-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 24px;
}

.wz-nav .btn {
  min-width: 120px;
  justify-content: center;
}

/* ═══ Responsive ═══ */
@media (max-width: 768px) {
  .form-grid.two {
    grid-template-columns: 1fr;
  }
  .co-steps {
    gap: 6px;
    margin-bottom: 24px;
  }
  .co-step {
    padding: 6px 12px;
    font-size: 0.72rem;
  }
  .co-step .n {
    width: 20px;
    height: 20px;
    font-size: 0.68rem;
  }
  .slot-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .wz-nav {
    flex-direction: row-reverse;
  }
  .wz-nav .btn {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .co-step {
    padding: 6px 10px;
    font-size: 0.68rem;
    gap: 5px;
  }
  .co-title {
    font-size: 1rem;
  }
  .review-card {
    padding: 12px 14px;
  }
}
.checkout-section {
  padding-bottom: 120px; /* ⭐ مساحة للـ Bottom Nav */
}

@media (max-width: 900px) {
  .checkout-section {
    padding-bottom: 140px; /* ⭐ أكثر على الموبايل */
  }
}
/* ═══ Steps Bar — Responsive ═══ */
.co-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto 32px;
  flex-wrap: wrap;
  padding: 0 12px;
}

.co-step {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--muted);
  transition: all 0.25s ease;
  white-space: nowrap;
}

.co-step .n {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  background: var(--cream);
  border-radius: 50%;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--muted);
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.co-step.on {
  background: linear-gradient(135deg, var(--melon), var(--gold));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 16px rgba(233, 74, 99, 0.3);
}

.co-step.on .n {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.co-step.done {
  background: #fff8ee;
  border-color: var(--gold);
  color: var(--green-900);
}

.co-step.done .n {
  background: var(--gold);
  color: #fff;
}

/* ⭐ Tablet */
@media (max-width: 768px) {
  .co-steps {
    gap: 6px;
    margin-bottom: 24px;
    padding: 0;
  }

  .co-step {
    padding: 6px 12px;
    font-size: 0.72rem;
    gap: 6px;
  }

  .co-step .n {
    width: 20px;
    height: 20px;
    font-size: 0.66rem;
  }
}

/* ⭐ Mobile — أفقي مع scroll أو wrap */
@media (max-width: 560px) {
  .co-steps {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    padding: 0 4px;
  }

  .co-step {
    flex-direction: column;
    padding: 8px 4px;
    gap: 4px;
    font-size: 0.62rem;
    border-radius: 12px;
    text-align: center;
    line-height: 1.1;
    min-width: 0;
  }

  .co-step .n {
    width: 22px;
    height: 22px;
    font-size: 0.7rem;
  }
}
/* ═══ Review Card — Responsive ═══ */
.review-card {
  padding: 14px 16px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  margin-bottom: 12px;
}

@media (max-width: 480px) {
  .review-card {
    padding: 12px 14px;
    border-radius: 12px;
    margin-bottom: 10px;
  }

  .review-card h4 {
    font-size: 0.82rem;
    margin-bottom: 6px;
  }

  .review-card p {
    font-size: 0.8rem;
    line-height: 1.6;
  }

  .co-title {
    font-size: 1rem;
    margin-bottom: 16px;
  }

  .co-hint {
    font-size: 0.72rem;
    padding: 8px 12px;
  }
}
@media (max-width: 900px) {
  .cart-wrap {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* الـ aside ييجي تحت الفورم على الموبايل */
  .cart-wrap > .summary:first-child {
    order: 1;
  }

  .cart-wrap > .summary:last-child {
    order: 2;
  }
}
.wz-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid var(--line);
}

.wz-nav .btn {
  min-width: 120px;
  justify-content: center;
}

@media (max-width: 560px) {
  .wz-nav {
    flex-direction: column-reverse;
    gap: 10px;
    padding-top: 20px;
  }

  .wz-nav .btn {
    width: 100%;
    min-width: 0;
    justify-content: center;
  }
}
</style>