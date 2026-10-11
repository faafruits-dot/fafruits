<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'

/* ═══ Props ═══ */
const props = defineProps<{
  open: boolean
  targetPhone: string
  targetName: string
  isSelf: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

/* ═══ Composables ═══ */
const { changePassword } = useAuth()
const { show } = useToast()

/* ═══ State ═══ */
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const submitting = ref(false)
const refs = {
  current: ref<HTMLInputElement | null>(null),
  new: ref<HTMLInputElement | null>(null)
}

/* ═══ Reset on open ═══ */
watch(() => props.open, (v) => {
  if (!v) return
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  errorMsg.value = ''
  submitting.value = false
  nextTick(() => {
    refs.current.value?.focus()
  })
})

/* ═══ Body lock ═══ */
watch(() => props.open, (v) => {
  if (!import.meta.client) return
  document.body.style.overflow = v ? 'hidden' : ''
})

/* ═══ Escape ═══ */
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
  if (e.key === 'Enter' && props.open) submit()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

/* ═══ Submit ═══ */
async function submit() {
  errorMsg.value = ''

  /* ═══ Validation ═══ */
  if (props.isSelf && !currentPassword.value) {
    errorMsg.value = 'كلمة المرور الحالية مطلوبة'
    return
  }
  if (!newPassword.value || newPassword.value.length < 8) {
    errorMsg.value = 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'
    return
  }
  if (!/[a-zA-Z]/.test(newPassword.value) || !/[0-9]/.test(newPassword.value)) {
    errorMsg.value = 'كلمة المرور يجب أن تحتوي على حروف وأرقام'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'كلمتا المرور غير متطابقتين'
    return
  }

  submitting.value = true
  try {
    await changePassword(props.targetPhone, {
      currentPassword: props.isSelf ? currentPassword.value : undefined,
      newPassword: newPassword.value
    })
    show(
      props.isSelf
        ? '✅ تم تغيير كلمة مرورك بنجاح'
        : `✅ تم تعيين كلمة مرور جديدة لـ ${props.targetName}`,
      'check'
    )
    emit('success')
    emit('close')
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || e?.message || 'فشل تغيير كلمة المرور'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="pw-overlay" @click.self="emit('close')">
        <div class="pw-modal">
          <!-- ═══ Head ═══ -->
          <div class="pw-head">
            <span :class="['pw-ico', { 'pw-ico--admin': !isSelf }]">
              <Icon :name="isSelf ? 'key' : 'shield'" :size="20" />
            </span>
            <div class="pw-meta">
              <b>{{ isSelf ? 'تغيير كلمة مروري' : `تغيير كلمة مرور ${targetName}` }}</b>
              <span>{{ targetPhone }}</span>
            </div>
            <button class="pw-close" @click="emit('close')" aria-label="إغلاق">
              <Icon name="x" :size="18" />
            </button>
          </div>

          <!-- ═══ Body ═══ -->
          <div class="pw-body">
            <!-- ⭐ ملاحظة للأدمن -->
            <div v-if="!isSelf" class="pw-notice">
              <Icon name="shield" :size="16" />
              <span>
                بصفتك <b>مدير</b>، تقدر تعيّن كلمة مرور جديدة لهذا العضو مباشرة —
                مش محتاج تعرف كلمة المرور القديمة.
              </span>
            </div>

            <!-- ⭐ حقل كلمة المرور الحالية (فقط لو نفس المستخدم) -->
            <div v-if="isSelf" class="pw-field">
              <label for="pw-current">كلمة المرور الحالية</label>
              <input
                id="pw-current"
                ref="current"
                v-model="currentPassword"
                type="password"
                autocomplete="current-password"
                placeholder="••••••••"
              />
            </div>

            <div class="pw-field">
              <label for="pw-new">كلمة المرور الجديدة</label>
              <input
                id="pw-new"
                ref="new"
                v-model="newPassword"
                type="password"
                autocomplete="new-password"
                placeholder="8 أحرف على الأقل"
              />
              <small>8 أحرف على الأقل، بحيث تكون مزيج من حروف وأرقام.</small>
            </div>

            <div class="pw-field">
              <label for="pw-confirm">تأكيد كلمة المرور</label>
              <input
                id="pw-confirm"
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••"
              />
            </div>

            <div v-if="errorMsg" class="pw-error">
              <Icon name="alert-circle" :size="14" />
              {{ errorMsg }}
            </div>
          </div>

          <!-- ═══ Foot ═══ -->
          <div class="pw-foot">
            <button class="pw-btn pw-btn--ghost" @click="emit('close')">إلغاء</button>
            <button
              class="pw-btn pw-btn--primary"
              :disabled="submitting"
              @click="submit"
            >
              <Icon :name="submitting ? 'loader' : 'check'" :size="16" :class="{ spin: submitting }" />
              {{ submitting ? 'جاري الحفظ…' : 'حفظ التغييرات' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.pw-overlay {
  position: fixed; inset: 0;
  background: rgba(27,23,20,.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.pw-modal {
  background: #fff;
  border-radius: 24px;
  width: min(460px, 100%);
  max-height: 92vh;
  overflow: hidden;
  box-shadow: 0 30px 60px -20px rgba(0,0,0,.4);
}
.pw-head {
  display: flex; align-items: center; gap: 12px;
  padding: 20px 22px;
  border-bottom: 1px solid var(--line);
}
.pw-ico {
  width: 42px; height: 42px;
  display: grid; place-items: center;
  border-radius: 12px;
  background: rgba(110,31,46,.08);
  color: var(--burgundy);
  flex-shrink: 0;
}
.pw-ico--admin {
  background: rgba(168,133,91,.12);
  color: var(--bronze);
}
.pw-meta { flex: 1; min-width: 0; }
.pw-meta b { display: block; font-size: 15px; font-weight: 800; color: var(--ink); }
.pw-meta span { font-size: 12px; color: var(--ink-mute); margin-top: 2px; display: block; font-family: monospace; }
.pw-close {
  width: 34px; height: 34px;
  display: grid; place-items: center;
  background: var(--cream);
  border: 0; border-radius: 50%;
  color: var(--ink);
  cursor: pointer;
  transition: all .2s ease;
  flex-shrink: 0;
}
.pw-close:hover { background: var(--burgundy); color: #fff; transform: rotate(90deg); }

.pw-body { padding: 22px; }

.pw-notice {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 14px;
  background: rgba(168,133,91,.08);
  border: 1px solid rgba(168,133,91,.25);
  border-radius: 12px;
  margin-bottom: 18px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--bronze);
  font-weight: 700;
}
.pw-notice :deep(svg) { flex-shrink: 0; margin-top: 2px; }
.pw-notice b { color: var(--burgundy); }

.pw-field { margin-bottom: 16px; }
.pw-field label {
  display: block; font-size: 12.5px; font-weight: 700;
  color: var(--ink-soft); margin-bottom: 7px;
}
.pw-field input {
  width: 100%; padding: 13px 15px;
  background: var(--cream);
  border: 1.5px solid var(--line);
  border-radius: 12px;
  font: 600 14px inherit;
  color: var(--ink);
  transition: all .2s ease;
}
.pw-field input:focus {
  outline: 0; border-color: var(--burgundy);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(110,31,46,.08);
}
.pw-field small {
  display: block;
  font-size: 11.5px;
  color: var(--ink-mute);
  margin-top: 4px;
}

.pw-error {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 14px;
  background: rgba(220,38,38,.08);
  border: 1px solid rgba(220,38,38,.2);
  border-radius: 10px;
  font-size: 12.5px; font-weight: 700;
  color: var(--danger);
  margin-top: 6px;
}

.pw-foot {
  display: flex; gap: 10px;
  padding: 16px 22px;
  background: #fafafa;
  border-top: 1px solid var(--line);
}
.pw-btn {
  flex: 1;
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; padding: 13px 20px;
  border-radius: 12px;
  font: 800 13.5px inherit;
  cursor: pointer;
  transition: all .25s ease;
  border: 1.5px solid transparent;
}
.pw-btn--ghost { background: #fff; border-color: var(--line); color: var(--ink); }
.pw-btn--ghost:hover { background: var(--cream); }
.pw-btn--primary {
  background: linear-gradient(135deg, #8B2E3F, #6E1F2E);
  color: #FBEFE0;
  box-shadow: 0 12px 26px -14px rgba(110,31,46,.6);
}
.pw-btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px -14px rgba(110,31,46,.75);
}
.pw-btn--primary:disabled { opacity: .6; cursor: wait; transform: none; }

.spin { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>