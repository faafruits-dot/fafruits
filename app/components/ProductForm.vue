<script setup lang="ts">
import type { Product } from '~/composables/useProducts'
import { useStyles } from '~/composables/useStyles'

/* ═══ Props ═══ */
interface Props {
  product?: Product | null
  mode: 'new' | 'edit'
  saving?: boolean
  selectedStyles?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  product: null,
  saving: false,
  selectedStyles: () => [],
})

/* ═══ Emits ═══ */
const emit = defineEmits<{
  submit: [data: Partial<Product> & { styles: string[] }]
  cancel: []
}>()

/* ═══ Composables ═══ */
const {
  styles: allStyles,
  load: loadStyles,
  loaded: stylesLoaded,
} = useStyles()

if (!stylesLoaded.value) {
  loadStyles()
}

/* ═══ الحالة المحلية ═══ */
const form = reactive({
  id: '',
  img: '',
  price: 0,
  mood: '',
  rating: 5,
  reviews: 0,
  grad: 'grad-1',
  serving: '',
  occText: '',
  best: false,
  luxury: false,
  ready: true,
  available: true,
})

const errors = ref<Record<string, string>>({})

/* ═══ ملء النموذج ═══ */
watch(
  () => props.product,
  (p) => {
    if (!p) return
    form.id = p.id || ''
    form.img = p.img || ''
    form.price = Number(p.price) || 0
    form.mood = p.mood || ''
    form.rating = Number(p.rating) || 5
    form.reviews = Number(p.reviews) || 0
    form.grad = p.grad || 'grad-1'
    form.serving = (p as any).serving || ''
    form.occText = (p.occ || []).join('، ')
    form.best = !!p.best
    form.luxury = !!p.luxury
    form.ready = !!p.ready
    form.available = !!p.available
  },
  { immediate: true },
)

/* ═══ التصنيفات المختارة ═══ */
const selected = ref<string[]>([...props.selectedStyles])

watch(
  () => props.selectedStyles,
  (v) => {
    selected.value = [...v]
  },
)

function toggleStyle(id: string) {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter((s) => s !== id)
  } else {
    selected.value.push(id)
  }
}

/* ═══ التحقق ═══ */
function validate(): boolean {
  errors.value = {}
  if (!form.id.trim()) errors.value.id = 'الكود مطلوب'
  else if (!/^[A-Za-z0-9_-]+$/.test(form.id))
    errors.value.id = 'فقط أحرف إنجليزية وأرقام وشرطات'
  if (!form.img.trim()) errors.value.img = 'مسار الصورة مطلوب'
  if (form.price < 0) errors.value.price = 'السعر لا يمكن أن يكون سالبًا'
  if (form.rating < 0 || form.rating > 5) errors.value.rating = 'من 0 إلى 5'
  return Object.keys(errors.value).length === 0
}

/* ═══ الإرسال ═══ */
function handleSubmit() {
  if (!validate()) return
  emit('submit', {
    id: form.id.trim(),
    img: form.img.trim(),
    price: form.price,
    mood: form.mood.trim() || null,
    rating: form.rating,
    reviews: form.reviews,
    grad: form.grad,
    serving: form.serving.trim() || undefined,
    occ: form.occText
      .split(/[،,]/)
      .map((s) => s.trim())
      .filter(Boolean),
    best: form.best,
    luxury: form.luxury,
    ready: form.ready,
    available: form.available,
    styles: selected.value,
  } as any)
}
</script>

<template>
  <form class="pform" @submit.prevent="handleSubmit">
    <!-- ═══ Grid ═══ -->
    <div class="pform__grid">
      <!-- ═══ Preview Card ═══ -->
      <aside class="pform__side">
        <div class="pform__preview">
          <img v-if="form.img" :src="form.img" alt="" />
          <div v-else class="pform__preview-empty">
            <Icon name="image-off" :size="42" :stroke-width="1.4" />
            <span>لا توجد صورة</span>
          </div>
        </div>

        <div class="pform__preview-meta">
          <span class="pform__sku">#{{ form.id.toUpperCase() || 'NEW' }}</span>
          <span class="pform__price-preview">
            {{ Number(form.price).toFixed(3) }} <small>د.ك</small>
          </span>
        </div>

        <!-- Badges live preview -->
        <div class="pform__badges">
          <span v-if="form.best" class="pform__chip pform__chip--gold">
            <Icon name="star" :size="12" /> مميز
          </span>
          <span v-if="form.luxury" class="pform__chip pform__chip--lux">
            <Icon name="sparkles" :size="12" /> فاخر
          </span>
          <span v-if="form.ready" class="pform__chip pform__chip--ready">
            <Icon name="zap" :size="12" /> جاهز اليوم
          </span>
          <span v-if="!form.available" class="pform__chip pform__chip--off">
            <Icon name="eye-off" :size="12" /> غير متاح
          </span>
        </div>
      </aside>

      <!-- ═══ Fields ═══ -->
      <div class="pform__main">
        <!-- Section: أساسي -->
        <section class="pform__section">
          <h3 class="pform__section-title">
            <Icon name="info" :size="16" />
            البيانات الأساسية
          </h3>

          <div class="pform__row">
            <div class="pform__field">
              <label for="pf-id">
                كود المنتج
                <span class="pform__req">*</span>
              </label>
              <input
                id="pf-id"
                v-model="form.id"
                type="text"
                dir="ltr"
                placeholder="P01"
                :disabled="mode === 'edit'"
                :class="{ 'pform__input--error': errors.id }"
              />
              <small v-if="errors.id" class="pform__error">{{ errors.id }}</small>
              <small v-else-if="mode === 'edit'" class="pform__hint">
                لا يمكن تغيير الكود بعد الإنشاء
              </small>
            </div>

            <div class="pform__field">
              <label for="pf-price">
                السعر (د.ك)
                <span class="pform__req">*</span>
              </label>
              <input
                id="pf-price"
                v-model.number="form.price"
                type="number"
                step="0.001"
                min="0"
                dir="ltr"
                :class="{ 'pform__input--error': errors.price }"
              />
              <small v-if="errors.price" class="pform__error">{{ errors.price }}</small>
            </div>
          </div>

          <div class="pform__field">
            <label for="pf-mood">المود / الوصف</label>
            <input
              id="pf-mood"
              v-model="form.mood"
              type="text"
              placeholder="مثال: لمّة العائلة، تهنئة، عيد ميلاد"
            />
          </div>

          <div class="pform__field">
            <label for="pf-serving">التقديم (اختياري)</label>
            <input
              id="pf-serving"
              v-model="form.serving"
              type="text"
              placeholder="مثال: يكفي 4-6 أشخاص"
            />
          </div>
        </section>

        <!-- Section: الصورة -->
        <section class="pform__section">
          <h3 class="pform__section-title">
            <Icon name="image" :size="16" />
            الصورة
          </h3>

          <div class="pform__field">
            <label for="pf-img">
              مسار الصورة
              <span class="pform__req">*</span>
            </label>
            <input
              id="pf-img"
              v-model="form.img"
              type="text"
              dir="ltr"
              placeholder="/images/products/P01.png"
              :class="{ 'pform__input--error': errors.img }"
            />
            <small v-if="errors.img" class="pform__error">{{ errors.img }}</small>
          </div>

          <div class="pform__field">
            <label for="pf-grad">التدرّج اللوني (احتياطي)</label>
            <input
              id="pf-grad"
              v-model="form.grad"
              type="text"
              dir="ltr"
              placeholder="grad-1"
            />
          </div>
        </section>

        <!-- Section: التصنيفات ⭐ جديد -->
        <section class="pform__section">
          <h3 class="pform__section-title">
            <Icon name="layers" :size="16" />
            التصنيفات
          </h3>

          <p class="pform__hint" style="margin: -4px 0 4px;">
            اختر تصنيفًا أو أكثر — يمكن للمنتج أن ينتمي لأكثر من تصنيف.
          </p>

          <div class="pform__styles">
            <button
              v-for="s in allStyles"
              :key="s.id"
              type="button"
              :class="['pform__style', { on: selected.includes(s.id) }]"
              @click="toggleStyle(s.id)"
            >
              <Icon :name="s.icon || 'circle'" :size="16" />
              <span>{{ s.name_ar }}</span>
              <span v-if="selected.includes(s.id)" class="pform__style-check">
                <Icon name="check" :size="14" />
              </span>
            </button>
          </div>

          <p v-if="!selected.length" class="pform__error" style="margin-top: 4px;">
            ⚠️ لم يتم اختيار أي تصنيف — المنتج مش هيظهر في صفحات التصاميم.
          </p>
        </section>

        <!-- Section: التقييم -->
        <section class="pform__section">
          <h3 class="pform__section-title">
            <Icon name="star" :size="16" />
            التقييم والمراجعات
          </h3>

          <div class="pform__row">
            <div class="pform__field">
              <label for="pf-rating">التقييم (0-5)</label>
              <input
                id="pf-rating"
                v-model.number="form.rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                dir="ltr"
                :class="{ 'pform__input--error': errors.rating }"
              />
              <small v-if="errors.rating" class="pform__error">{{ errors.rating }}</small>
            </div>

            <div class="pform__field">
              <label for="pf-reviews">عدد المراجعات</label>
              <input
                id="pf-reviews"
                v-model.number="form.reviews"
                type="number"
                min="0"
                dir="ltr"
              />
            </div>
          </div>
        </section>

        <!-- Section: المناسبات -->
        <section class="pform__section">
          <h3 class="pform__section-title">
            <Icon name="calendar-heart" :size="16" />
            المناسبات
          </h3>

          <div class="pform__field">
            <label for="pf-occ">المناسبات (افصل بفاصلة)</label>
            <input
              id="pf-occ"
              v-model="form.occText"
              type="text"
              placeholder="شكر، تهنئة، عيد ميلاد، زواج"
            />
            <small class="pform__hint">
              اكتب المناسبات مفصولة بفاصلة عربية (،) أو إنجليزية (,)
            </small>
          </div>
        </section>

        <!-- Section: الحالة -->
        <section class="pform__section">
          <h3 class="pform__section-title">
            <Icon name="settings-2" :size="16" />
            حالة المنتج
          </h3>

          <div class="pform__toggles">
            <button
              type="button"
              :class="['pform__toggle', { on: form.best }]"
              @click="form.best = !form.best"
            >
              <Icon name="star" :size="16" />
              <span>مميز</span>
            </button>

            <button
              type="button"
              :class="['pform__toggle', { on: form.luxury }]"
              @click="form.luxury = !form.luxury"
            >
              <Icon name="sparkles" :size="16" />
              <span>فاخر</span>
            </button>

            <button
              type="button"
              :class="['pform__toggle', { on: form.ready }]"
              @click="form.ready = !form.ready"
            >
              <Icon name="zap" :size="16" />
              <span>جاهز اليوم</span>
            </button>

            <button
              type="button"
              :class="['pform__toggle', { on: form.available }]"
              @click="form.available = !form.available"
            >
              <Icon :name="form.available ? 'eye' : 'eye-off'" :size="16" />
              <span>{{ form.available ? 'متاح للبيع' : 'غير متاح' }}</span>
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- ═══ Actions ═══ -->
    <footer class="pform__foot">
      <button type="button" class="pform__btn pform__btn--ghost" @click="emit('cancel')">
        إلغاء
      </button>
      <button type="submit" class="pform__btn pform__btn--primary" :disabled="saving">
        <Icon :name="saving ? 'loader' : 'check'" :size="16" :class="{ spin: saving }" />
        {{ saving ? 'جاري الحفظ…' : mode === 'new' ? 'إضافة المنتج' : 'حفظ التعديلات' }}
      </button>
    </footer>
  </form>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   Product Form — Heritage Quiet Luxury
   ═══════════════════════════════════════════════════════════ */
.pform {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pform__grid {
  display: grid;
  grid-template-columns: minmax(240px, 300px) 1fr;
  gap: 28px;
  align-items: start;
}

/* ═══ Side — Preview ═══ */
.pform__side {
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pform__preview {
  position: relative;
  aspect-ratio: 1;
  background: var(--cream);
  border-radius: 20px;
  overflow: hidden;
  border: 1.5px solid rgba(27, 23, 20, 0.08);
  box-shadow: 0 12px 30px -20px rgba(50, 35, 20, 0.4);
}

.pform__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pform__preview-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--ink-mute);
  font-size: 12px;
  background:
    radial-gradient(circle at 50% 40%, rgba(168, 133, 91, 0.08), transparent 70%),
    var(--cream);
}

.pform__preview-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.pform__sku {
  font-family: monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-mute);
  letter-spacing: 0.5px;
}

.pform__price-preview {
  font-family: "Playfair Display", serif;
  font-size: 20px;
  font-weight: 600;
  color: var(--burgundy);
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}
.pform__price-preview small {
  font-size: 11px;
  color: var(--bronze);
  font-weight: 600;
}

.pform__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pform__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  background: rgba(27, 23, 20, 0.85);
}
.pform__chip--gold {
  background: linear-gradient(135deg, #c9a87c, #a8855b);
  color: #fff;
}
.pform__chip--lux {
  background: linear-gradient(135deg, var(--burgundy-lt), var(--burgundy));
}
.pform__chip--ready {
  background: linear-gradient(135deg, #0e8a4f, #0a6b3c);
}
.pform__chip--off {
  background: rgba(122, 112, 101, 0.85);
}

/* ═══ Main — Fields ═══ */
.pform__main {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.pform__section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
  background: #fff;
  border: 1.5px solid rgba(27, 23, 20, 0.06);
  border-radius: 20px;
  box-shadow: 0 6px 20px -14px rgba(50, 35, 20, 0.2);
}

.pform__section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 4px;
  font-family: "Playfair Display", "Almarai", serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(27, 23, 20, 0.06);
}
.pform__section-title :deep(svg) {
  color: var(--bronze);
}

.pform__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.pform__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pform__field label {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-soft);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pform__req {
  color: var(--burgundy);
  font-weight: 900;
}

.pform__field input {
  padding: 12px 14px;
  background: #fff;
  border: 1.5px solid rgba(27, 23, 20, 0.12);
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink);
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.pform__field input::placeholder {
  color: var(--ink-mute);
  opacity: 0.6;
}
.pform__field input:focus {
  outline: none;
  border-color: var(--burgundy);
  box-shadow: 0 0 0 4px rgba(110, 31, 46, 0.08);
}
.pform__field input:disabled {
  background: var(--cream);
  color: var(--ink-mute);
  cursor: not-allowed;
}
.pform__input--error {
  border-color: #dc2626 !important;
}
.pform__input--error:focus {
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1) !important;
}

.pform__error {
  font-size: 11.5px;
  color: #dc2626;
  font-weight: 700;
}

.pform__hint {
  font-size: 11.5px;
  color: var(--ink-mute);
  line-height: 1.5;
}

/* ═══ Styles selector ═══ */
.pform__styles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pform__style {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 16px;
  background: var(--cream);
  border: 1.5px solid rgba(27, 23, 20, 0.08);
  border-radius: 999px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.pform__style :deep(svg) {
  color: var(--bronze);
  flex-shrink: 0;
  transition: color 0.25s ease;
}

.pform__style:hover {
  border-color: rgba(110, 31, 46, 0.25);
  transform: translateY(-1px);
  background: #fff;
}

.pform__style.on {
  background: linear-gradient(150deg, #8b2e3f 0%, #6e1f2e 100%);
  border-color: transparent;
  color: #fbefe0;
  padding-inline-end: 40px;
  box-shadow:
    0 12px 24px -14px rgba(110, 31, 46, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.12) inset;
}

.pform__style.on :deep(svg) {
  color: #fbefe0;
}

.pform__style-check {
  position: absolute;
  inset-inline-end: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  animation: styleCheck 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes styleCheck {
  from { transform: translateY(-50%) scale(0); }
  to   { transform: translateY(-50%) scale(1); }
}

/* ═══ Toggles ═══ */
.pform__toggles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.pform__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 12px;
  background: var(--cream);
  border: 1.5px solid rgba(27, 23, 20, 0.06);
  border-radius: 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.pform__toggle:hover {
  border-color: rgba(110, 31, 46, 0.2);
  transform: translateY(-1px);
}
.pform__toggle.on {
  background: linear-gradient(150deg, #8b2e3f 0%, #6e1f2e 100%);
  border-color: transparent;
  color: #fbefe0;
  box-shadow:
    0 12px 24px -14px rgba(110, 31, 46, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.12) inset;
}

/* ═══ Foot ═══ */
.pform__foot {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 18px 22px;
  background: rgba(255, 255, 255, 0.9);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border-top: 1px solid rgba(27, 23, 20, 0.06);
  border-radius: 20px;
  box-shadow: 0 -8px 24px -18px rgba(50, 35, 20, 0.4);
  z-index: 5;
}

.pform__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 26px;
  border-radius: 999px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  border: 1.5px solid transparent;
  min-width: 140px;
}
.pform__btn--ghost {
  background: var(--cream);
  border-color: rgba(27, 23, 20, 0.1);
  color: var(--ink);
}
.pform__btn--ghost:hover {
  background: #fff;
  border-color: rgba(27, 23, 20, 0.2);
}
.pform__btn--primary {
  background: linear-gradient(150deg, #8b2e3f, #6e1f2e);
  color: #fbefe0;
  box-shadow: 0 16px 32px -16px rgba(110, 31, 46, 0.7);
}
.pform__btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 22px 44px -18px rgba(110, 31, 46, 0.85);
}
.pform__btn--primary:disabled {
  opacity: 0.7;
  cursor: wait;
}

.spin {
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ═══════════════════════════════════════════════════════════
   Responsive
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 900px) {
  .pform__grid {
    grid-template-columns: 1fr;
  }
  .pform__side {
    position: static;
    max-width: 280px;
    margin: 0 auto;
  }
}

@media (max-width: 640px) {
  .pform__section {
    padding: 16px;
    border-radius: 16px;
  }
  .pform__row {
    grid-template-columns: 1fr;
  }
  .pform__toggles {
    grid-template-columns: 1fr 1fr;
  }
  .pform__foot {
    flex-direction: column-reverse;
    padding: 14px 16px;
    border-radius: 16px;
  }
  .pform__btn {
    width: 100%;
  }
}
</style>