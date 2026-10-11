<script setup lang="ts">
const props = defineProps<{
  open: boolean
  type: 'chef' | 'driver'
  orderId: string
  message: string
  waUrl: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'sent'): void
}>()

function messageToHtml(msg: string) {
  let html = msg
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  html = html.replace(/\*(.+?)\*/g, '<b>$1</b>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')
  html = html.replace(/(https?:\/\/[^\s]+)/g, '<a class="wa-link" href="$1" target="_blank">$1</a>')
  return html
}

function handleSend() {
  window.open(props.waUrl, '_blank')
  emit('sent')
  emit('close')
}

function close() {
  emit('close')
}

/* Keyboard */
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

/* Body lock */
watch(() => props.open, (v) => {
  if (!import.meta.client) return
  document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="wa-fade">
      <div v-if="open" class="wa-overlay" @click.self="close">
        <div class="wa-modal">
          <!-- Head -->
          <div class="wa-modal__head">
            <div class="wa-modal__avatar">
              {{ type === 'chef' ? '🧑‍🍳' : '🚚' }}
            </div>
            <div class="wa-modal__meta">
              <b>{{ type === 'chef' ? 'رسالة للشيف' : 'رسالة للمندوب' }}</b>
              <span>#{{ orderId }} — معاينة قبل الإرسال</span>
            </div>
            <button class="wa-modal__close" @click="close" aria-label="إغلاق">
              <Icon name="x" :size="18" />
            </button>
          </div>

          <!-- Body -->
          <div class="wa-modal__body">
            <div class="wa-bubble" v-html="messageToHtml(message)" />
          </div>

          <!-- Foot -->
          <div class="wa-modal__foot">
            <button class="wa-btn wa-btn--cancel" @click="close">إلغاء</button>
            <button class="wa-btn wa-btn--send" @click="handleSend">
              <Icon name="message-circle" :size="16" />
              فتح واتساب
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.wa-overlay {
  position: fixed; inset: 0;
  background: rgba(27,23,20,.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.wa-modal {
  background: #fff;
  border-radius: 24px;
  width: min(520px, 100%);
  max-height: 92vh;
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow: 0 30px 60px -20px rgba(0,0,0,.4);
}
.wa-modal__head {
  display: flex; align-items: center; gap: 12px;
  padding: 18px 22px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  color: #fff;
}
.wa-modal__avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,.2);
  display: grid; place-items: center;
  font-size: 20px; flex-shrink: 0;
}
.wa-modal__meta { flex: 1; min-width: 0; }
.wa-modal__meta b { display: block; font-size: 15px; font-weight: 800; }
.wa-modal__meta span { font-size: 12px; opacity: .85; }
.wa-modal__close {
  width: 36px; height: 36px;
  display: grid; place-items: center;
  background: rgba(255,255,255,.15);
  border: 0; border-radius: 50%;
  color: #fff; cursor: pointer;
  transition: all .2s ease;
}
.wa-modal__close:hover { background: rgba(255,255,255,.3); transform: rotate(90deg); }

.wa-modal__body {
  padding: 20px 22px;
  overflow-y: auto; flex: 1;
  background: linear-gradient(180deg, rgba(233,221,200,.4) 0%, rgba(247,242,236,.5) 100%);
}
.wa-bubble {
  background: #fff;
  border-radius: 4px 12px 12px 12px;
  padding: 14px 16px;
  font-size: 13.5px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-wrap: break-word;
  box-shadow: 0 2px 6px rgba(0,0,0,.08);
  color: var(--ink);
  direction: rtl;
  text-align: right;
}
.wa-bubble :deep(b) { font-weight: 800; }
.wa-bubble :deep(em) { font-style: italic; }
.wa-bubble :deep(.wa-link) {
  color: #0b8bc8;
  text-decoration: underline;
  word-break: break-all;
  font-size: 12.5px;
  display: inline-block;
  margin: 2px 0;
}

.wa-modal__foot {
  padding: 14px 22px;
  display: flex; gap: 10px;
  background: #f9f9f9;
  border-top: 1px solid rgba(0,0,0,.06);
}
.wa-btn {
  flex: 1;
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; padding: 13px 20px;
  border-radius: 999px;
  font: 800 13.5px inherit;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all .25s ease;
}
.wa-btn--cancel {
  background: #fff;
  border-color: rgba(0,0,0,.1);
  color: var(--ink);
}
.wa-btn--cancel:hover { background: var(--cream); }
.wa-btn--send {
  background: linear-gradient(135deg, #25D366, #128C7E);
  color: #fff;
  box-shadow: 0 12px 26px -14px rgba(37,211,102,.7);
}
.wa-btn--send:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px -16px rgba(37,211,102,.85);
}

.wa-fade-enter-active, .wa-fade-leave-active { transition: opacity .25s ease; }
.wa-fade-enter-from, .wa-fade-leave-to { opacity: 0; }
</style>