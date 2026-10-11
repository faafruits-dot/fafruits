<script setup lang="ts">
import type { Product } from '~/composables/useProducts'

interface Props {
  open: boolean
  product: Product | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [data: Partial<Product>]
}>()

/* ═══ النموذج المحلي ═══ */
const form = reactive({
  id: '',
  img: '',
  price: 0,
  mood: '',
  rating: 5,
  reviews: 0,
  grad: 'grad-1',
  occText: '',
  best: false,
  luxury: false,
  ready: true,
  available: true
})

const saving = ref(false)

/* ═══ ملء النموذج عند الفتح ═══ */
watch(() => props.product, (p) => {
  if (!p) return
  form.id       = p.id
  form.img      = p.img
  form.price    = Number(p.price)
  form.mood     = p.mood || ''
  form.rating   = Number(p.rating) || 5
  form.reviews  = Number(p.reviews) || 0
  form.grad     = p.grad || 'grad-1'
  form.occText  = (p.occ || []).join('، ')
  form.best     = !!p.best
  form.luxury   = !!p.luxury
  form.ready    = !!p.ready
  form.available = !!p.available
}, { immediate: true })

/* ═══ إغلاق بـ Escape ═══ */
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

/* ═══ منع scroll الخلفية ═══ */
watch(() => props.open, (v) => {
  if (import.meta.client) document.body.style.overflow = v ? 'hidden' : ''
})

/* ═══ الحفظ ═══ */
const handleSave = async () => {
  saving.value = true
  try {
    emit('save', {
      img: form.img,
      price: form.price,
      mood: form.mood || null,
      rating: form.rating,
      reviews: form.reviews,
      grad: form.grad,
      occ: form.occText.split(/[،,]/).map(s => s.trim()).filter(Boolean),
      best: form.best,
      luxury: form.luxury,
      ready: form.ready,
      available: form.available
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dr-fade">
      <div v-if="open" class="dr-overlay" @click.self="emit('close')">
        <Transition name="dr-slide" appear>
          <div class="dr-panel">
            <!-- Head -->
            <div class="dr-head">
              <div>
                <h3>تعديل المنتج</h3>
                <small>#{{ form.id.toUpperCase() }}</small>
              </div>
              <button class="dr-close" @click="emit('close')">
                <Icon name="x" :size="20" />
              </button>
            </div>

            <!-- Body -->
            <div class="dr-body">
              <!-- Preview -->
              <div class="dr-preview">
                <img :src="form.img" alt="" />
              </div>

              <!-- Image path -->
              <div class="dr-field">
                <label>مسار الصورة</label>
                <input v-model="form.img" type="text" dir="ltr" placeholder="/images/products/P01.png" />
              </div>

              <!-- Mood -->
              <div class="dr-field">
                <label>المود / الوصف</label>
                <input v-model="form.mood" type="text" placeholder="مثال: لمّة العائلة" />
              </div>

              <!-- Price -->
              <div class="dr-field">
                <label>السعر (د.ك)</label>
                <input v-model.number="form.price" type="number" step="0.01" min="0" dir="ltr" />
              </div>

              <!-- Rating -->
              <div class="dr-row-2">
                <div class="dr-field">
                  <label>التقييم</label>
                  <input v-model.number="form.rating" type="number" step="0.1" min="0" max="5" dir="ltr" />
                </div>
                <div class="dr-field">
                  <label>عدد التقييمات</label>
                  <input v-model.number="form.reviews" type="number" min="0" dir="ltr" />
                </div>
              </div>

              <!-- Occasions -->
              <div class="dr-field">
                <label>المناسبات (افصل بفاصلة)</label>
                <input v-model="form.occText" type="text" placeholder="شكر، تهنئة، عيد ميلاد" />
              </div>

              <!-- Toggles -->
              <div class="dr-toggles">
                <button
                  :class="['dr-toggle', { on: form.best }]"
                  @click="form.best = !form.best"
                  type="button"
                >
                  <Icon name="star" :size="16" />
                  مميز
                </button>
                <button
                  :class="['dr-toggle', { on: form.luxury }]"
                  @click="form.luxury = !form.luxury"
                  type="button"
                >
                  <Icon name="sparkles" :size="16" />
                  فاخر
                </button>
                <button
                  :class="['dr-toggle', { on: form.ready }]"
                  @click="form.ready = !form.ready"
                  type="button"
                >
                  <Icon name="zap" :size="16" />
                  جاهز اليوم
                </button>
                <button
                  :class="['dr-toggle', { on: form.available }]"
                  @click="form.available = !form.available"
                  type="button"
                >
                  <Icon name="eye" :size="16" />
                  متاح للبيع
                </button>
              </div>
            </div>

            <!-- Foot -->
            <div class="dr-foot">
              <button class="dr-btn dr-btn-cancel" @click="emit('close')">
                إلغاء
              </button>
              <button class="dr-btn dr-btn-save" :disabled="saving" @click="handleSave">
                <Icon name="check" :size="16" />
                {{ saving ? 'جاري الحفظ…' : 'حفظ التعديلات' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dr-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(20, 30, 20, 0.5);
  backdrop-filter: blur(4px);
}

.dr-panel {
  position: fixed;
  top: 0;
  inset-inline-end: 0;
  bottom: 0;
  width: 100%;
  max-width: 460px;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.15);
}

/* Head */
.dr-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 22px;
  border-bottom: 1px solid var(--line);
}
.dr-head h3 {
  font-family: var(--ff-display);
  font-size: 1.3rem;
  color: var(--green-900);
  margin: 0;
}
.dr-head small {
  font-family: monospace;
  font-size: .78rem;
  color: var(--muted);
  letter-spacing: .5px;
}
.dr-close {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: var(--cream);
  border: none;
  border-radius: 50%;
  color: var(--green-900);
  cursor: pointer;
  transition: all .18s ease;
}
.dr-close:hover { background: #F5EDDC; }

/* Body */
.dr-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dr-preview {
  aspect-ratio: 1;
  background: var(--cream);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--line);
}
.dr-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.dr-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dr-field label {
  font-size: .82rem;
  font-weight: 600;
  color: var(--green-900);
}
.dr-field input {
  padding: 12px 14px;
  background: var(--cream);
  border: 1.5px solid var(--line);
  border-radius: 12px;
  font-family: inherit;
  font-size: .92rem;
  color: var(--green-900);
  transition: all .18s ease;
}
.dr-field input:focus {
  outline: none;
  border-color: var(--gold);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(245, 154, 35, 0.15);
}

.dr-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Toggles */
.dr-toggles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 6px;
}
.dr-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: #F7F7F7;
  border: 1.5px solid transparent;
  border-radius: 12px;
  font-family: inherit;
  font-size: .85rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: all .18s ease;
}
.dr-toggle:hover { border-color: var(--line); }
.dr-toggle.on {
  background: linear-gradient(135deg, #F59A23, #FFB020);
  color: #fff;
  box-shadow: 0 4px 12px rgba(245, 154, 35, 0.3);
}

/* Foot */
.dr-foot {
  padding: 16px 22px;
  border-top: 1px solid var(--line);
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
}
.dr-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: .92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s ease;
}
.dr-btn-cancel {
  background: var(--cream);
  color: var(--green-900);
  border: 1.5px solid var(--line);
}
.dr-btn-cancel:hover { background: #F5EDDC; }
.dr-btn-save {
  background: linear-gradient(135deg, #2F5D3F, #4CA83D);
  color: #fff;
  box-shadow: 0 6px 16px rgba(76, 168, 61, 0.3);
}
.dr-btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.05);
}
.dr-btn-save:disabled { opacity: .6; cursor: not-allowed; }

/* Animations */
.dr-fade-enter-active, .dr-fade-leave-active { transition: opacity .25s ease; }
.dr-fade-enter-from, .dr-fade-leave-to { opacity: 0; }

.dr-slide-enter-active { transition: transform .3s cubic-bezier(.34, 1.56, .64, 1); }
.dr-slide-leave-active { transition: transform .25s ease; }
.dr-slide-enter-from, .dr-slide-leave-to { transform: translateX(-100%); }

/* Mobile */
@media (max-width: 480px) {
  .dr-panel { max-width: 100%; }
  .dr-slide-enter-from, .dr-slide-leave-to { transform: translateY(100%); }
}
</style>