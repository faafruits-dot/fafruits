<script setup lang="ts">
import { useProducts } from "~/composables/useProducts";
import { useCart } from "~/composables/useCart";
import { useFavorites } from "~/composables/useFavorites";
import { useToast } from "~/composables/useToast";
import { useExtras } from "~/composables/useExtras";
import { useProductStyles } from "~/composables/useProductStyles";
import { useStyles } from "~/composables/useStyles";
import { productTitle } from "~/utils/product";
import { KD } from "~/utils/format";
import { CITIES, DEFAULT_CITY, type City } from "~/data/cities";

/* ═══ Constants ═══ */
const WHATSAPP_NUMBER = "96551180015";
const MESSAGE_EXTRA_ID = "message";

const EXTRA_IMAGES: Record<string, string> = {
  message: "/images/extras/message.png",
  chocolate: "/images/extras/chocolate.png",
  juice: "/images/extras/juice.png",
};

const getExtraImage = (id: string) =>
  EXTRA_IMAGES[id] || "/images/extras/default.jpg";

/* ═══ Composables ═══ */
const route = useRoute();
const { find, load: loadProducts } = useProducts();
const { extras, load: loadExtras } = useExtras();
const { add } = useCart();
const { favorites, toggle } = useFavorites();
const { show } = useToast();

const product = computed(() => find(route.params.id as string));
const title = computed(() => productTitle(product.value));
const isFav = computed(() =>
  product.value ? favorites.value.includes(product.value.id) : false,
);

/* ⭐ حالة التحميل — نفرّق بين "بنجهّز" و "مش موجود" */
const isLoading = ref(true);

const productStyles = useProductStyles(
  computed(() => String(route.params.id || "")),
);
const { styles: allStyles, load: loadAllStyles } = useStyles();

onMounted(async () => {
  try {
    await Promise.all([loadProducts(), loadExtras(), loadAllStyles()]);
    if (product.value) await productStyles.load();
  } finally {
    isLoading.value = false;
  }
});

watch(
  () => route.params.id,
  () => {
    if (product.value) productStyles.load();
  },
);

/* ═══ الرسالة المنحوتة ═══ */
const PRESET_MESSAGES = [
  { emoji: "👶", text: "مبروك المولود" },
  { emoji: "🎂", text: "كل عام وأنت بخير" },
  { emoji: "🎓", text: "مبروك التخرج" },
];

const messageMode = ref<"none" | "preset" | "custom">("none");
const messagePreset = ref<string>("");
const messageCustom = ref<string>("");
const customConfirmed = ref(false);
const customInputRef = ref<HTMLInputElement | null>(null);

/* ═══ الإضافات ═══ */
const selectedExtras = reactive<Record<string, boolean>>({});
const extraInputs = reactive<Record<string, string>>({});

const otherExtras = computed(() =>
  extras.value.filter((ex) => ex.id !== MESSAGE_EXTRA_ID),
);

const messageExtra = computed(() =>
  extras.value.find((ex) => ex.id === MESSAGE_EXTRA_ID),
);

const messageExtraPrice = computed(() => {
  if (messageMode.value === "none") return 0;
  if (messageMode.value === "custom" && !messageCustom.value.trim()) return 0;
  return Number(messageExtra.value?.price) || 0;
});

const messageText = computed(() => {
  if (messageMode.value === "preset") return messagePreset.value;
  if (messageMode.value === "custom") return messageCustom.value.trim();
  return "";
});

const hasMessage = computed(
  () => messageMode.value !== "none" && !!messageText.value,
);

/* ═══ Actions للرسالة ═══ */
const setNoMessage = () => {
  customConfirmed.value = false;
  messageMode.value = "none";
  messagePreset.value = "";
  messageCustom.value = "";
};

const setPreset = (text: string) => {
  customConfirmed.value = false;
  messageMode.value = "preset";
  messagePreset.value = text;
  messageCustom.value = "";
};

const setCustom = async () => {
  customConfirmed.value = false;
  messageMode.value = "custom";
  messagePreset.value = "";
  await nextTick();
  customInputRef.value?.focus();
};

const confirmCustom = () => {
  const txt = messageCustom.value.trim();
  if (!txt) return;
  customConfirmed.value = true;
  messageMode.value = "custom";
  messagePreset.value = "";
};

const resetToChips = () => {
  customConfirmed.value = false;
  messageMode.value = "none";
  messageCustom.value = "";
  messagePreset.value = "";
};

const editCustom = async () => {
  customConfirmed.value = false;
  messageMode.value = "custom";
  await nextTick();
  customInputRef.value?.focus();
};

const toggleExtra = (id: string) => {
  selectedExtras[id] = !selectedExtras[id];
  if (!selectedExtras[id]) extraInputs[id] = "";
};

const extrasSum = computed(() =>
  otherExtras.value.reduce(
    (s, ex) => (selectedExtras[ex.id] ? s + Number(ex.price) : s),
    0,
  ),
);

const chosenExtras = computed(() =>
  otherExtras.value.filter((ex) => selectedExtras[ex.id]),
);

const quantity = ref(1);

/* ═══ خيارات الوقت ═══ */
const dateOptions = computed(() => [
  { id: "today", label: "اليوم", isToday: true },
  // { id: "tomorrow", label: "غداً", isToday: false },
]);

const selectedDate = ref<string>("today");
const customDate = ref<string>("");

const isToday = computed(() => selectedDate.value === "today");

const dateLabel = computed(() => {
  if (selectedDate.value === "custom") {
    if (!customDate.value) return "تاريخ آخر";
    return formatArabicDate(customDate.value);
  }
  return (
    dateOptions.value.find((d) => d.id === selectedDate.value)?.label ?? ""
  );
});

/* ⭐ التاريخ بصيغة ISO للاستخدام في checkout */
const deliveryDateISO = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate.value === "today") {
    return today.toISOString().slice(0, 10);
  }
  if (selectedDate.value === "tomorrow") {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return t.toISOString().slice(0, 10);
  }
  if (selectedDate.value === "custom" && customDate.value) {
    return customDate.value;
  }
  return "";
});

/* ⭐ حدود التاريخ للـ Date Picker — يبدأ من غدًا */
const minCustomDate = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
});

const maxCustomDate = computed(() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
});

/* ⭐ لما يختار تاريخ من الـ Picker */
const onDatePicked = (iso: string) => {
  if (!iso) return;
  customDate.value = iso;
  selectedDate.value = "custom";
};

function formatArabicDate(isoDate: string): string {
  try {
    const d = new Date(isoDate + "T12:00:00");
    return d.toLocaleDateString("ar-KW", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return isoDate;
  }
}

/* ═══ المدينة والتوصيل ═══ */
const selectedCity = ref<City>(DEFAULT_CITY);
const showCityPicker = ref(false);

const deliveryFee = computed(() => selectedCity.value.fee);

const pickCity = (city: City) => {
  selectedCity.value = city;
  showCityPicker.value = false;
  show(`تم اختيار ${city.name_ar} — التوصيل ${city.fee.toFixed(2)} د.ك`);
};

/* ═══ الحسابات ═══ */
const productSubtotal = computed(() =>
  product.value ? Number(product.value.price) * quantity.value : 0,
);

const messageTotalAll = computed(
  () => messageExtraPrice.value * quantity.value,
);

const extrasTotalAll = computed(() => extrasSum.value * quantity.value);

const subtotalBefore = computed(
  () => productSubtotal.value + messageTotalAll.value + extrasTotalAll.value,
);

const totalPrice = computed(() => subtotalBefore.value + deliveryFee.value);

/* ═══ WhatsApp VIP ═══ */
const vipWhatsAppUrl = computed(() => {
  if (!product.value) return "#";

  const productUrl = import.meta.client
    ? `${window.location.origin}/product/${product.value.id}`
    : `/product/${product.value.id}`;

  const productImgUrl = import.meta.client
    ? `${window.location.origin}${product.value.img}`
    : product.value.img;

  const lines = [
    "مرحباً FA Fruits 🍓",
    "أريد طلب خدمة اليوم (VIP):",
    "",
    `🍓 المنتج: #${product.value.id.toUpperCase()}`,
    `🖼️ الصورة: ${productImgUrl}`,
    `🔗 الرابط: ${productUrl}`,
    `🔢 الكمية: ${quantity.value}`,
    `📍 المنطقة: ${selectedCity.value.name_ar}`,
  ];

  if (hasMessage.value) {
    lines.push(`✍️ العبارة: "${messageText.value}"`);
  }

  if (chosenExtras.value.length) {
    lines.push(
      `➕ الإضافات: ${chosenExtras.value.map((e) => e.name).join(" + ")}`,
    );
  }

  lines.push(`💰 الإجمالي: ${KD(totalPrice.value)}`);
  lines.push("", "الرجاء تأكيد التوفر.");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    lines.join("\n"),
  )}`;
});

/* ═══ Add to cart ═══ */
const addToCart = () => {
  if (!product.value || isToday.value) return;

  const extrasPayload = { ...selectedExtras };
  if (hasMessage.value) extrasPayload[MESSAGE_EXTRA_ID] = true;

  add({
    id: product.value.id + "-" + Date.now(),
    title: title.value,
    img: product.value.img,
    price: product.value.price,
    grad: product.value.grad,
    qty: quantity.value,
    extras: extrasPayload,
    extrasTotal: extrasSum.value + messageExtraPrice.value,
    messageText: messageText.value || "",
    deliveryDate: dateLabel.value,
    deliveryDateISO: deliveryDateISO.value,
    deliveryCity: selectedCity.value.id,
    deliveryCityName: selectedCity.value.name_ar,
    deliveryFee: deliveryFee.value,
  });
  show("أُضيف إلى السلة ✨");
  navigateTo("/cart");
};

/* ═══ تصنيفات أخرى ═══ */
const otherStyles = computed(() => {
  const currentIds = productStyles.styles.value.map((s) => s.id);
  return allStyles.value.filter((s) => !currentIds.includes(s.id)).slice(0, 3);
});
</script>

<template>
  <section v-if="product" class="product-page">
    <div class="wrap">
      <!-- Breadcrumbs -->
      <div class="crumbs">
        <NuxtLink to="/">الرئيسية</NuxtLink>
        <span class="sep">/</span>
        <NuxtLink to="/collections">المجموعات</NuxtLink>
        <span class="sep">/</span>
        <span class="current" dir="ltr">#{{ product.id.toUpperCase() }}</span>
      </div>

      <!-- Two-Column Layout -->
      <div class="pd-layout">
        <!-- Right Column (40%) -->
        <div class="pd-col-image">
          <div class="pd-gallery-wrap">
            <ProductGallery
              :main-image="product.img"
              :images="product.images"
              :alt="title"
            />
          </div>

          <!-- كارت الإهداء المجاني -->
          <div class="gift-card-hint">
            <span class="gch-icon">
              <Icon name="gift" :size="18" />
            </span>
            <div class="gch-text">
              <b>كارت إهداء مجاني</b>
              <small>مع كل طلب — اكتب رسالتك وسنطبعها بخط أنيق</small>
            </div>
          </div>

          <div class="style-and-occasions">
            <div v-if="productStyles.styles.value.length" class="pd-styles-row">
              <span class="pd-styles-label">التصنيف:</span>
              <NuxtLink
                v-for="s in productStyles.styles.value"
                :key="s.id"
                :to="`/styles/${s.id}`"
                class="style-link"
              >
                <Icon :name="s.icon || 'circle'" :size="14" />
                {{ s.name_ar }}
                <Icon
                  name="arrow-up-left"
                  :size="12"
                  class="style-link-arrow"
                />
              </NuxtLink>
            </div>

            <div v-if="product.rating" class="pd-rating-inline">
              <span class="stars">★★★★★</span>
              <span>{{ product.rating }} · {{ product.reviews }} تقييم</span>
            </div>
          </div>

          <ul class="pd-quick-facts">
            <li>
              <Icon name="package" :size="18" />
              <span>شامل التغليف الفاخر</span>
            </li>
            <li>
              <Icon name="truck" :size="18" />
              <span>توصيل داخل الكويت</span>
            </li>
            <li>
              <Icon name="sparkles" :size="18" />
              <span>يُحضَّر صباح كل يوم</span>
            </li>
          </ul>

          <p class="pd-vip-note desktop-only" v-if="isToday">
            <Icon name="info" :size="14" />
            خدمة اليوم (VIP) تُحضَّر فورًا وتُوصَّل خلال ساعات. سيتم تأكيد
            التوفر عبر واتساب.
          </p>
        </div>

        <!-- Left Column (60%) -->
        <div class="pd-col-info">
          <div class="pd-price-hero">
            <div class="pd-price-value">{{ KD(product.price) }}</div>
            <div class="pd-badges">
              <span v-if="product.ready" class="badge ready">
                <Icon name="zap" :size="12" />
                جاهز اليوم
              </span>
              <span v-if="product.luxury" class="badge gold">مجموعة فاخرة</span>
              <span v-if="product.best" class="badge">الأكثر مبيعًا</span>
            </div>
          </div>

          <!-- Extras Row -->
          <div v-if="otherExtras.length || messageExtra" class="pd-section">
            <h3 class="pd-section-title">
              <Icon name="plus-circle" :size="16" />
              أضف لمسة إلى هديتك
            </h3>

            <div class="extras-row-extra">
              <!-- كارت العبارة المنحوتة -->
              <div
                class="extra-card extra-card-message"
                :class="{ on: hasMessage }"
              >
                <div class="extra-card-header">
                  <span class="extra-card-icon">
                    <img
                      :src="getExtraImage('message')"
                      alt="العبارة المنحوتة"
                      class="extra-card-img"
                    />
                  </span>
                  <div class="extra-card-info">
                    <b>العبارة المنحوتة</b>
                    <small v-if="messageExtra">
                      +{{ Number(messageExtra.price).toFixed(0) }} د.ك
                    </small>
                  </div>
                </div>

                <!-- الحالة المؤكدة -->
                <template v-if="customConfirmed">
                  <div class="confirmed-message">
                    <Icon name="check-circle" :size="18" />
                    <span>«{{ messageCustom }}»</span>
                  </div>

                  <div class="confirmed-actions">
                    <button
                      type="button"
                      class="action-btn action-btn-primary"
                      @click="editCustom"
                    >
                      <Icon name="pencil" :size="12" />
                      مخصص
                    </button>

                    <button
                      type="button"
                      class="action-btn action-btn-ghost"
                      @click="resetToChips"
                    >
                      <Icon name="sparkles" :size="12" />
                      اقتراح
                    </button>
                  </div>
                </template>

                <!-- الحالة الافتراضية -->
                <template v-else>
                  <div class="message-chips compact">
                    <button
                      type="button"
                      :class="[
                        'msg-chip',
                        'sm',
                        { on: messageMode === 'none' },
                      ]"
                      @click="setNoMessage"
                    >
                      بدون
                    </button>

                    <button
                      v-for="m in PRESET_MESSAGES"
                      :key="m.text"
                      type="button"
                      :class="[
                        'msg-chip',
                        'sm',
                        {
                          on:
                            messageMode === 'preset' &&
                            messagePreset === m.text,
                        },
                      ]"
                      @click="setPreset(m.text)"
                    >
                      {{ m.text }}
                    </button>

                    <button
                      type="button"
                      :class="[
                        'msg-chip',
                        'sm',
                        'custom-chip',
                        { on: messageMode === 'custom' },
                      ]"
                      @click="setCustom"
                    >
                      <Icon name="pencil" :size="11" />
                      مخصصة
                    </button>
                  </div>

                  <Transition name="expand">
                    <div
                      v-if="messageMode === 'custom'"
                      class="custom-input-compact"
                    >
                      <input
                        ref="customInputRef"
                        v-model="messageCustom"
                        type="text"
                        class="custom-input"
                        maxlength="40"
                        placeholder="اكتب عبارتك… مثال: هني وعافية"
                        @keydown.enter="confirmCustom"
                      />
                      <span
                        :class="[
                          'char-counter-sm',
                          { warn: messageCustom.length >= 35 },
                        ]"
                      >
                        {{ messageCustom.length }}/40
                      </span>

                      <button
                        type="button"
                        class="confirm-btn"
                        :disabled="!messageCustom.trim()"
                        @click="confirmCustom"
                        aria-label="تأكيد العبارة"
                      >
                        <Icon name="check" :size="16" :stroke-width="3" />
                      </button>
                    </div>
                  </Transition>
                </template>
              </div>

              <!-- الإضافات العادية -->
              <label
                v-for="ex in otherExtras"
                :key="ex.id"
                :class="['extra-card', { on: selectedExtras[ex.id] }]"
                @click.prevent="toggleExtra(ex.id)"
              >
                <span class="extra-img">
                  <img
                    :src="getExtraImage(ex.id)"
                    :alt="ex.name"
                    class="extra-img-inner"
                    loading="lazy"
                  />
                </span>
                <span class="extra-info">
                  <b>{{ ex.name }}</b>
                  <small>+{{ Number(ex.price).toFixed(0) }} د.ك</small>
                </span>
                <span class="extra-check">
                  <Icon name="check" :size="12" :stroke-width="3.5" />
                </span>
              </label>
            </div>
          </div>

          <div class="when-and-cont">
            <div class="pd-quantity-row">
              <span class="custom-label">الكمية</span>
              <div class="qty">
                <button
                  type="button"
                  @click="quantity = Math.max(1, quantity - 1)"
                  aria-label="ناقص"
                >
                  <Icon name="minus" :size="16" />
                </button>
                <span>{{ quantity }}</span>
                <button
                  type="button"
                  @click="quantity = Math.min(10, quantity + 1)"
                  aria-label="زائد"
                >
                  <Icon name="plus" :size="16" />
                </button>
              </div>
            </div>

            <div class="p-actions-button">
              <div class="cont">
                <h3 class="pd-section-title">متى تحتاج الهدية؟</h3>
                <div class="date-scroll">
                  <button
                    v-for="d in dateOptions"
                    :key="d.id"
                    type="button"
                    :class="[
                      'date-chip',
                      { on: selectedDate === d.id, vip: d.isToday },
                    ]"
                    @click="selectedDate = d.id"
                  >
                    {{ d.label }}
                  </button>

                  <!-- ⭐ الـ Date Picker المخصص -->
                  <AppDatePicker
                    v-model="customDate"
                    :min="minCustomDate"
                    :max="maxCustomDate"
                    placeholder="تاريخ آخر"
                    @update:model-value="onDatePicked"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="pd-summary">
            <div class="ps-row">
              <span>المنتج × {{ quantity }}</span>
              <b>{{ KD(productSubtotal) }}</b>
            </div>

            <div v-if="hasMessage && messageExtraPrice > 0" class="ps-row">
              <span>
                <Icon name="feather" :size="14" />
                العبارة «{{
                  messageText.length > 20
                    ? messageText.slice(0, 20) + "…"
                    : messageText
                }}»
              </span>
              <b>{{ KD(messageTotalAll) }}</b>
            </div>

            <div v-if="extrasTotalAll > 0" class="ps-row">
              <span>الإضافات ({{ chosenExtras.length }})</span>
              <b>{{ KD(extrasTotalAll) }}</b>
            </div>

            <!-- ⭐ صف التوصيل — قابل للنقر -->
            <button
              type="button"
              class="ps-row ps-delivery ps-delivery-btn"
              @click="showCityPicker = true"
            >
              <span>
                <Icon name="truck" :size="16" />
                التوصيل إلى
                <b class="city-name">{{ selectedCity.name_ar }}</b>
                <Icon name="chevron-down" :size="12" class="city-arrow" />
              </span>
              <b>{{ KD(deliveryFee) }}</b>
            </button>

            <div class="ps-row ps-total">
              <span>الإجمالي</span>
              <b>{{ KD(totalPrice) }}</b>
            </div>
          </div>

          <!-- Desktop CTA -->
          <div class="pd-actions p-when desktop-only">
            <a
              v-if="isToday"
              :href="vipWhatsAppUrl"
              target="_blank"
              rel="noopener"
              class="btn btn-gold btn-lg pd-main-btn"
            >
              <Icon name="zap" :size="20" />
              طلب خدمة اليوم (VIP)
            </a>

            <button
              v-else
              class="btn btn-primary btn-lg pd-main-btn"
              @click="addToCart"
            >
              <Icon name="shopping-bag" :size="20" />
              أضف إلى السلة — {{ KD(totalPrice) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Style Navigation -->
      <section v-if="otherStyles.length" class="style-nav-section">
        <h3 class="section-title">
          <Icon name="layers-3" :size="20" />
          تصنيفات أخرى قد تعجبك
        </h3>
        <div class="style-nav-grid">
          <NuxtLink
            v-for="s in otherStyles"
            :key="s.id"
            :to="`/styles/${s.id}`"
            class="style-nav-card"
          >
            <span class="snc-icon">
              <Icon :name="s.icon || 'circle'" :size="26" />
            </span>
            <b>{{ s.name_ar }}</b>
            <span class="snc-arrow">
              <Icon name="chevron-left" :size="14" />
            </span>
          </NuxtLink>
        </div>
      </section>

      <RelatedProducts
        :current-id="product.id"
        :occ="product.occ || []"
        :mood="product.mood || null"
      />
    </div>
  </section>

  <!-- ⭐ حالة التحميل — Skeleton -->
  <section v-else-if="isLoading" class="sec">
    <div class="wrap loading-state">
      <div class="loader-spinner" />
      <p class="loading-text">جاري تحميل المنتج…</p>
    </div>
  </section>

  <!-- ⭐ المنتج مش موجود فعلاً -->
  <section v-else class="sec">
    <div class="wrap" style="text-align: center; padding: 80px 0">
      <Icon name="package-x" :size="48" :stroke-width="1.5" />
      <h2>المنتج غير موجود</h2>
      <NuxtLink
        to="/collections"
        class="btn btn-primary"
        style="margin-top: 16px"
      >
        تصفّح المنتجات
      </NuxtLink>
    </div>
  </section>

  <!-- Sticky CTA Mobile -->
  <Teleport to="body">
    <div v-if="product && !isToday" class="sticky-cta mobile-only">
      <div class="sticky-cta-info">
        <span class="sticky-cta-total">{{ KD(totalPrice) }}</span>
        <span class="sticky-cta-sub"
          >{{ quantity }} منتج{{
            hasMessage
              ? " · " +
                (messageText.length > 15
                  ? messageText.slice(0, 15) + "…"
                  : messageText)
              : ""
          }}</span
        >
      </div>
      <button class="sticky-cta-btn" @click="addToCart">
        <Icon name="shopping-bag" :size="18" />
        أضف إلى السلة
      </button>
    </div>

    <div
      v-else-if="product && isToday"
      class="sticky-cta mobile-only sticky-cta-vip"
    >
      <div class="sticky-cta-info">
        <span class="sticky-cta-total">{{ KD(totalPrice) }}</span>
        <span class="sticky-cta-sub">خدمة اليوم · VIP</span>
      </div>
      <a
        :href="vipWhatsAppUrl"
        target="_blank"
        rel="noopener"
        class="sticky-cta-btn sticky-cta-btn-gold"
      >
        <Icon name="zap" :size="18" />
        اطلب VIP
      </a>
    </div>

    <!-- ⭐ City Picker Modal -->
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
              اختر منطقتك
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
              :class="['city-item', { on: selectedCity.id === city.id }]"
              @click="pickCity(city)"
            >
              <span class="ci-info">
                <Icon name="map-pin" :size="16" />
                <b>{{ city.name_ar }}</b>
              </span>
              <span class="ci-fee">{{ city.fee.toFixed(2) }} د.ك</span>
              <span v-if="selectedCity.id === city.id" class="ci-check">
                <Icon name="check" :size="14" :stroke-width="3" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════
   Base
   ═══════════════════════════════════════════════════ */
.product-page {
  padding-top: 22px;
  padding-bottom: 100px;
}

.crumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--muted);
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.crumbs a {
  color: var(--green-700);
  text-decoration: none;
  transition: color 0.15s ease;
}
.crumbs a:hover {
  color: var(--gold);
}
.crumbs .sep {
  opacity: 0.5;
}
.crumbs .current {
  color: var(--green-900);
  font-weight: 700;
  font-family: monospace;
  letter-spacing: 0.5px;
}

.pd-layout {
  display: grid;
  grid-template-columns: minmax(0, 40fr) minmax(0, 60fr);
  gap: 32px;
  align-items: start;
}

.pg-main {
  border-radius: 24px;
  overflow: hidden;
}

/* ═══ Gift Card Hint ═══ */
.gift-card-hint {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fff8ee 0%, #fff3d6 100%);
  border: 1.5px dashed var(--gold);
  border-radius: 14px;
  position: relative;
  overflow: hidden;
}

.gift-card-hint::before {
  content: "مجاني";
  position: absolute;
  top: 0;
  inset-inline-end: 0;
  padding: 3px 10px;
  background: linear-gradient(135deg, var(--gold), var(--mango));
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  border-radius: 0 13px 0 12px;
  letter-spacing: 0.5px;
}

.gch-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  background: #fff;
  border-radius: 12px;
  color: var(--gold);
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(245, 154, 35, 0.12);
}

.gch-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding-inline-end: 50px;
}

.gch-text b {
  font-size: 0.85rem;
  color: var(--green-900);
  font-weight: 700;
}

.gch-text small {
  font-size: 0.72rem;
  color: #8a5a00;
  line-height: 1.4;
}

.pd-col-image {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 92px;
  min-width: 0;
}
.pd-col-info {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

/* ═══ Badges ═══ */
.pd-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ═══ Price Hero ═══ */
.pd-price-hero {
  display: flex;
  justify-content: space-between;
}

.pd-price-value {
  font-family: var(--ff-display);
  font-size: 3rem;
  color: var(--gold);
  line-height: 1;
  letter-spacing: -1px;
}

.pd-rating-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--muted);
}

.pd-rating-inline .stars {
  color: var(--gold);
  letter-spacing: 2px;
  font-size: 0.9rem;
}

/* ═══ Quick Facts ═══ */
.pd-quick-facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 14px 12px;
  background: linear-gradient(135deg, #fffcf5 0%, #fff8ee 100%);
  border: 1px solid rgba(245, 154, 35, 0.2);
  border-radius: 14px;
  list-style: none;
  margin: 0;
}

.pd-quick-facts li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  text-align: center;
  border-inline-end: 1px dashed rgba(245, 154, 35, 0.25);
}

.pd-quick-facts li:last-child {
  border-inline-end: none;
}
.pd-quick-facts svg {
  color: var(--gold);
}
.pd-quick-facts span {
  font-size: 0.72rem;
  color: var(--green-900);
  line-height: 1.4;
  font-weight: 600;
}

.style-and-occasions {
  display: flex;
  justify-content: space-between;
}

/* ═══ Styles Row ═══ */
.pd-styles-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pd-styles-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--muted);
}

.style-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px 6px 12px;
  background: #fff;
  color: var(--green-900);
  font-weight: 700;
  border: 1.5px dashed var(--gold);
  border-radius: 999px;
  font-size: 0.75rem;
  text-decoration: none;
  transition: all 0.18s ease;
}

.style-link:hover {
  border-style: solid;
  background: #fff8ee;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(245, 154, 35, 0.15);
}

.style-link-arrow {
  color: var(--gold);
  opacity: 0.6;
  transition: all 0.18s ease;
}
.style-link:hover .style-link-arrow {
  opacity: 1;
  transform: translate(2px, -2px);
}

/* ═══ Sections ═══ */
.pd-section {
  padding: 18px 20px;
  background: transparent;
  border: 1.5px dashed var(--gold);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.pd-section-title {
  font-family: var(--ff-body);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--green-900);
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pd-section-title svg {
  color: var(--gold);
}

/* ═══ Extras Row ═══ */
.extras-row-extra {
  display: flex;
  gap: 10px;
  align-items: stretch;
  margin-top: 10px;
}

.extra-card-message {
  flex: 2;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  transition: all 0.2s ease;
}

.extra-card-message.on {
  background: linear-gradient(135deg, #fff8ee 0%, #fff3d6 100%);
  border-color: var(--gold);
  box-shadow: 0 6px 16px rgba(245, 154, 35, 0.12);
}

.extra-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.extra-card-icon {
  width: 60px;
  height: 60px;
  display: grid;
  place-items: center;
  background: #fff;
  border: 2px solid var(--line);
  border-radius: 50%;
  overflow: hidden;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.extra-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1.15);
  transition: transform 0.3s ease;
}

.extra-card-message.on .extra-card-icon {
  border-color: var(--gold);
  background: #fff;
  box-shadow: 0 4px 12px rgba(245, 154, 35, 0.25);
}

.extra-card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.extra-card-info b {
  font-size: 0.85rem;
  color: var(--green-900);
  font-weight: 700;
}

.extra-card-info small {
  font-family: var(--ff-display);
  font-size: 1.2rem;
  color: var(--gold);
  font-weight: 500;
}

/* ═══ Message Chips ═══ */
.message-chips.compact {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.msg-chip.sm {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 5px 10px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  font-family: inherit;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--green-900);
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.msg-chip.sm:hover {
  border-color: var(--gold);
}

.msg-chip.sm.on {
  background: linear-gradient(135deg, var(--gold), var(--mango));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 3px 8px rgba(245, 154, 35, 0.3);
}

.msg-chip.sm.custom-chip {
  border-style: dashed;
  border-color: var(--gold);
}

.msg-chip.sm.custom-chip.on {
  border-style: solid;
}

.custom-input-compact {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #fff;
  border: 1.5px solid var(--gold);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(245, 154, 35, 0.1);
}

.custom-input {
  flex: 1;
  padding: 8px 10px;
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.82rem;
  color: var(--green-900);
  outline: none;
  transition: all 0.18s ease;
  min-width: 0;
}

.custom-input:focus {
  border-color: var(--gold);
  background: #fff;
}

.custom-input::placeholder {
  color: #b8afa0;
}

.char-counter-sm {
  font-size: 0.65rem;
  color: var(--muted);
  font-weight: 600;
  flex-shrink: 0;
  white-space: nowrap;
}

.char-counter-sm.warn {
  color: var(--melon);
}

.confirm-btn {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--green-700), var(--green-500));
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 3px 10px rgba(76, 168, 61, 0.3);
}

.confirm-btn:hover:not(:disabled) {
  transform: scale(1.06);
  filter: brightness(1.08);
  box-shadow: 0 5px 14px rgba(76, 168, 61, 0.4);
}

.confirm-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.confirm-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}

.confirmed-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fff8ee 0%, #fff3d6 100%);
  border: 1.5px solid var(--gold);
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--green-900);
  animation: slideDownAnim 0.28s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.confirmed-message svg {
  color: var(--green-500);
  flex-shrink: 0;
}

.confirmed-message span {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.confirmed-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  animation: slideDownAnim 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 9px 12px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  border: 1.5px solid transparent;
}

.action-btn-primary {
  background: linear-gradient(135deg, var(--gold), var(--mango));
  color: #fff;
  box-shadow: 0 4px 10px rgba(245, 154, 35, 0.25);
}

.action-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(245, 154, 35, 0.35);
  filter: brightness(1.05);
}

.action-btn-ghost {
  background: #fff;
  color: var(--green-900);
  border-color: var(--line);
}

.action-btn-ghost:hover {
  border-color: var(--gold);
  background: #fff8ee;
  transform: translateY(-1px);
}

@keyframes slideDownAnim {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (max-width: 676px) {
  .extras-row-extra,
  .when-and-cont,
  .style-and-occasions {
    flex-direction: column;
  }
  .pd-rating-inline {
    justify-content: center;
    padding-top: 12px;
  }
  .pd-quantity-row {
    width: 100%;
  }
  .when-and-cont .p-actions-button {
    width: 100%;
    padding: 0 !important;
  }
  .when-and-cont .cont {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding-right: 0 !important;
  }
}
/* ═══ Regular Extras Cards ═══ */
.extra-card:not(.extra-card-message) {
  flex: 1;
  min-width: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 10px 12px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.extra-card:not(.extra-card-message):hover {
  border-color: var(--gold);
  transform: translateY(-2px);
}

.extra-card:not(.extra-card-message).on {
  background: linear-gradient(135deg, #fff8ee 0%, #fff3d6 100%);
  border-color: var(--gold);
  box-shadow: 0 6px 16px rgba(245, 154, 35, 0.15);
}

.extra-img {
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
  background: #fff;
  border: 2px solid var(--line);
  border-radius: 50%;
  overflow: hidden;
  padding: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.extra-img-inner {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1.15);
  transition: transform 0.3s ease;
}

.extra-card:not(.extra-card-message).on .extra-img {
  border-color: var(--gold);
  box-shadow: 0 4px 12px rgba(245, 154, 35, 0.25);
  transform: scale(1.02);
}

.extra-card:hover .extra-img-inner {
  transform: scale(1.25);
}

.extra-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.extra-info b {
  font-size: 0.78rem;
  color: var(--green-900);
  font-weight: 700;
  line-height: 1.3;
}

.extra-info small {
  font-family: var(--ff-display);
  font-size: 1.2rem;
  color: var(--gold);
  font-weight: 500;
}

.extra-check {
  position: absolute;
  top: 8px;
  inset-inline-end: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid var(--line);
  background: #fff;
  display: grid;
  place-items: center;
  color: transparent;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.extra-card.on .extra-check {
  background: var(--gold);
  border-color: var(--gold);
  color: #fff;
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(245, 154, 35, 0.3);
}

.extra-check svg {
  width: 11px;
  height: 11px;
  stroke-width: 3.5;
}

/* ═══ Expand Transition ═══ */
.expand-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
}
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 200px;
}

/* ═══ Date Scroll ═══ */
.date-scroll {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow: visible;
  margin-bottom: 14px;
  align-items: center;
}

.date-chip {
  flex: 0 0 auto;
  padding: 9px 14px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--green-900);
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.date-chip:hover {
  border-color: var(--green-500);
}

.date-chip.on {
  background: var(--green-900);
  color: #fff;
  border-color: var(--green-900);
}

.date-chip.vip.on {
  background: linear-gradient(135deg, var(--gold), var(--mango));
  border-color: transparent;
}

/* ⭐ الـ Date Picker داخل date-scroll ياخد حجم مناسب */
.date-scroll .apd {
  flex: 0 0 auto;
  width: auto;
  min-width: 180px;
  max-width: 240px;
}

/* ═══ Quantity ═══ */
.pd-quantity-row {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px dashed var(--line);
  gap: 16px;
}

.cont {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--green-900);
}

.qty {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--cream);
  border-radius: 12px;
  padding: 4px;
}

.qty button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  background: #fff;
  border: none;
  border-radius: 10px;
  color: var(--green-900);
  cursor: pointer;
  transition: all 0.18s ease;
}

.qty button:hover {
  background: var(--gold);
  color: #fff;
}

.qty span {
  min-width: 28px;
  text-align: center;
  font-family: var(--ff-display);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--green-900);
}

.when-and-cont {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.when-and-cont .pd-quantity-row {
  flex-direction: row;
  align-items: center;
  margin-top: 0;
  border-top: none;
}

.when-and-cont .cont {
  align-items: center;
  padding-right: 32px;
  justify-content: start;
  gap: 24px;
}

.when-and-cont .cont .pd-section-title,
.when-and-cont .cont .date-scroll {
  margin-bottom: 0;
}

.p-actions-button {
  flex: 1;
  padding: 0 24px;
}

.p-actions-button .btn-lg {
  padding: 17px 34px;
  font-size: 1.02rem;
  width: 100%;
}

.p-actions-button .pd-quantity-row {
  border: none;
  margin: 0;
  padding: 8px 0;
}

/* ═══ Summary ═══ */
.pd-summary {
  padding: 18px 20px;
  background: linear-gradient(135deg, #fffcf5 0%, #fff8ee 100%);
  border: 1.5px dashed var(--gold);
  border-radius: 18px;
  margin-top: 0;
}

.ps-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 7px 0;
  font-size: 0.88rem;
  color: var(--green-900);
}

.ps-row > span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  min-width: 0;
  flex: 1;
}

.ps-row > span svg {
  flex-shrink: 0;
}

.ps-row > b {
  color: var(--green-900);
  font-weight: 700;
  white-space: nowrap;
}

.ps-delivery {
  border-top: 1px dashed rgba(245, 154, 35, 0.4);
  margin-top: 6px;
  padding-top: 12px;
}

.ps-delivery-btn {
  width: 100%;
  background: none;
  border: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-align: start;
  transition: all 0.18s ease;
  border-radius: 10px;
  padding-inline: 6px;
  margin-inline: -6px;
}

.ps-delivery-btn:hover {
  background: rgba(245, 154, 35, 0.08);
}

.ps-delivery-btn:hover .city-arrow {
  color: var(--gold);
  transform: translateY(2px);
}

.city-name {
  color: var(--gold) !important;
  font-weight: 800;
  margin-inline-start: 4px;
}

.city-arrow {
  color: var(--muted);
  transition: all 0.18s ease;
  margin-inline-start: 2px;
}

.ps-total {
  border-top: 1.5px solid var(--green-900);
  margin-top: 10px;
  padding-top: 14px;
}

.ps-total > span {
  font-size: 1rem;
  color: var(--green-900);
  font-weight: 700;
}

.ps-total > b {
  font-family: var(--ff-display);
  font-size: 1.5rem;
  color: var(--green-900);
}

/* ═══ Actions ═══ */
.pd-actions {
  display: flex;
  gap: 10px;
  align-items: stretch;
  margin-top: 10px;
  background: transparent;
}

.pd-main-btn {
  flex: 1;
  justify-content: center;
}

.pd-vip-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: #fff3d6;
  color: #7a5b00;
  border-radius: 12px;
  font-size: 0.8rem;
  line-height: 1.6;
  margin: 0;
}

.pd-vip-note svg {
  flex-shrink: 0;
  margin-top: 2px;
}

/* ═══ Style Navigation ═══ */
.style-nav-section {
  margin: 44px 0 0;
  padding-top: 32px;
  border-top: 2px dashed var(--line);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--ff-display);
  font-size: 1.35rem;
  color: var(--green-900);
  margin: 0 0 18px;
}

.section-title svg {
  color: var(--gold);
}

.style-nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.style-nav-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: #fff;
  border: 2px solid var(--line);
  border-radius: 16px;
  text-decoration: none;
  color: var(--green-900);
  transition: all 0.22s ease;
}

.style-nav-card:hover {
  border-color: var(--gold);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(245, 154, 35, 0.12);
}

.snc-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #fff3d6 0%, #ffe8b8 100%);
  border-radius: 12px;
  color: #8a5a00;
  flex-shrink: 0;
}

.style-nav-card b {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 700;
}

.snc-arrow {
  color: var(--muted);
  transition: all 0.22s ease;
}

.style-nav-card:hover .snc-arrow {
  color: var(--gold);
  transform: translateX(-4px);
}

/* ═══ Sticky CTA Mobile ═══ */
.sticky-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9998;
  display: none;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid var(--line);
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.08);
}

.sticky-cta-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 0 0 auto;
}

.sticky-cta-total {
  font-family: var(--ff-display);
  font-size: 1.3rem;
  color: var(--gold);
  line-height: 1.1;
  font-weight: 700;
}

.sticky-cta-sub {
  font-size: 0.68rem;
  color: var(--muted);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sticky-cta-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background: linear-gradient(135deg, var(--melon), var(--gold));
  color: #fff;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  box-shadow: 0 6px 16px rgba(233, 74, 99, 0.3);
  transition: all 0.18s ease;
}

.sticky-cta-btn-gold {
  background: linear-gradient(135deg, var(--gold), var(--mango));
  box-shadow: 0 6px 16px rgba(245, 154, 35, 0.35);
}

/* ═══ City Picker Modal ═══ */
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
  font-family: var(--ff-body);
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  animation: popIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
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

@keyframes popIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
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

/* ═══ Utilities ═══ */
.mobile-only {
  display: none !important;
}
.desktop-only {
  display: flex;
}

/* ⭐ Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
  gap: 20px;
}

.loader-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--line);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.loading-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--muted);
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ═══ Responsive ═══ */
@media (max-width: 960px) {
  .pd-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .pd-col-image {
    position: static;
  }
  .mobile-only {
    display: flex !important;
  }
  .desktop-only {
    display: none !important;
  }
  .pd-price-value {
    font-size: 2.4rem;
  }
}

@media (max-width: 640px) {
  .pd-section {
    padding: 16px;
    border-radius: 16px;
  }
  .pd-price-value {
    font-size: 2.2rem;
  }
  .pd-quick-facts {
    padding: 12px 8px;
  }
  .pd-quick-facts span {
    font-size: 0.68rem;
  }
  .pd-quick-facts svg {
    width: 16px;
    height: 16px;
  }

  .extra-card-message {
    flex: 1 1 100%;
  }
  .extra-card:not(.extra-card-message) {
    flex: 1 1 calc(50% - 5px);
  }

  .extra-img {
    width: 64px;
    height: 64px;
  }
  .extra-card-icon {
    width: 52px;
    height: 52px;
  }
  .extra-info b {
    font-size: 0.72rem;
  }
  .msg-chip.sm {
    font-size: 0.68rem;
    padding: 4px 9px;
  }

  .confirm-btn {
    width: 30px;
    height: 30px;
    border-radius: 8px;
  }
  .confirmed-message {
    font-size: 0.78rem;
    padding: 10px 12px;
  }
  .action-btn {
    font-size: 0.72rem;
    padding: 8px 10px;
  }

  .pd-summary {
    padding: 16px;
  }
  .ps-total > b {
    font-size: 1.3rem;
  }

  .style-nav-grid {
    grid-template-columns: 1fr;
  }

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
  .city-item {
    padding: 14px 16px;
  }
  .ci-info b {
    font-size: 0.92rem;
  }
  .ci-fee {
    font-size: 1.05rem;
  }

  /* ⭐ الـ Date Picker ياخد عرض كامل على الموبايل */
  .date-scroll .apd {
    width: 100%;
    max-width: 100%;
  }
}

@supports (padding: max(0px)) {
  .sticky-cta {
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}
</style>