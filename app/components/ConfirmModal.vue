<script setup lang="ts">
interface Props {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  icon?: string
  variant?: 'danger' | 'warning' | 'primary'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'هل أنت متأكد؟',
  message: '',
  confirmText: 'تأكيد',
  cancelText: 'إلغاء',
  icon: 'alert-triangle',
  variant: 'danger'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

/* إغلاق بـ Escape */
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) emit('cancel')
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

/* منع scroll الخلفية */
watch(() => props.open, (v) => {
  if (import.meta.client) {
    document.body.style.overflow = v ? 'hidden' : ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="cm-fade">
      <div
        v-if="open"
        class="cm-overlay"
        @click.self="emit('cancel')"
      >
        <Transition name="cm-pop" appear>
          <div :class="['cm-card', `cm-${variant}`]">
            <!-- Icon -->
            <div class="cm-icon-wrap">
              <Icon :name="icon" :size="30" :stroke-width="2" />
            </div>

            <!-- Title -->
            <h3 class="cm-title">{{ title }}</h3>

            <!-- Message -->
            <p v-if="message" class="cm-message">{{ message }}</p>

            <!-- Actions -->
            <div class="cm-actions">
              <button
                type="button"
                class="cm-btn cm-btn-cancel"
                @click="emit('cancel')"
              >
                {{ cancelText }}
              </button>
              <button
                type="button"
                class="cm-btn cm-btn-confirm"
                @click="emit('confirm')"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ═══ Overlay ═══ */
.cm-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(20, 30, 20, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* ═══ Card ═══ */
.cm-card {
  width: 100%;
  max-width: 400px;
  padding: 32px 28px 24px;
  background: #fff;
  border-radius: 24px;
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(0, 0, 0, 0.04);
  text-align: center;
  font-family: var(--ff-body, inherit);
}

/* ═══ Icon ═══ */
.cm-icon-wrap {
  width: 72px;
  height: 72px;
  margin: 0 auto 18px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  position: relative;
}

.cm-icon-wrap::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  opacity: .15;
  z-index: -1;
}

/* ألوان حسب النوع */
.cm-danger  .cm-icon-wrap { background: linear-gradient(135deg, #E94A63, #F4726E); }
.cm-danger  .cm-icon-wrap::after { background: #E94A63; }

.cm-warning .cm-icon-wrap { background: linear-gradient(135deg, #F59A23, #FFB020); }
.cm-warning .cm-icon-wrap::after { background: #F59A23; }

.cm-primary .cm-icon-wrap { background: linear-gradient(135deg, #2F5D3F, #4CA83D); }
.cm-primary .cm-icon-wrap::after { background: #2F5D3F; }

/* ═══ Text ═══ */
.cm-title {
  font-family: var(--ff-display, inherit);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--green-900, #24382C);
  margin: 0 0 8px;
  line-height: 1.3;
}

.cm-message {
  font-size: .9rem;
  color: var(--muted, #8B8578);
  line-height: 1.6;
  margin: 0 0 24px;
}

/* ═══ Actions ═══ */
.cm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.cm-btn {
  padding: 13px 20px;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: .95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s ease;
}

.cm-btn-cancel {
  background: var(--cream, #FFF8EE);
  color: var(--green-900, #24382C);
  border: 1.5px solid var(--line, #EDE4D3);
}
.cm-btn-cancel:hover {
  background: #F5EDDC;
  transform: translateY(-1px);
}

.cm-btn-confirm {
  color: #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.cm-danger  .cm-btn-confirm {
  background: linear-gradient(135deg, #E94A63, #F4726E);
  box-shadow: 0 8px 20px rgba(233, 74, 99, 0.35);
}
.cm-warning .cm-btn-confirm {
  background: linear-gradient(135deg, #F59A23, #FFB020);
  box-shadow: 0 8px 20px rgba(245, 154, 35, 0.35);
}
.cm-primary .cm-btn-confirm {
  background: linear-gradient(135deg, #2F5D3F, #4CA83D);
  box-shadow: 0 8px 20px rgba(76, 168, 61, 0.35);
}

.cm-btn-confirm:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.cm-btn:active {
  transform: translateY(0);
}

/* ═══ Animations ═══ */
.cm-fade-enter-active,
.cm-fade-leave-active {
  transition: opacity .25s ease;
}
.cm-fade-enter-from,
.cm-fade-leave-to {
  opacity: 0;
}

.cm-pop-enter-active {
  transition: transform .3s cubic-bezier(.34, 1.56, .64, 1), opacity .25s ease;
}
.cm-pop-leave-active {
  transition: transform .2s ease, opacity .2s ease;
}
.cm-pop-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(10px);
}
.cm-pop-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* ═══ Mobile ═══ */
@media (max-width: 480px) {
  .cm-card {
    padding: 26px 22px 20px;
    border-radius: 20px;
  }
  .cm-icon-wrap {
    width: 62px;
    height: 62px;
  }
  .cm-title {
    font-size: 1.2rem;
  }
}
</style>