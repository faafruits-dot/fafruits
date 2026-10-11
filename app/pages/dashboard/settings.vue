<script setup lang="ts">
import { useAuth, ROLE_LABELS, type Role } from '~/composables/useAuth'
import { useTeam, type TeamMember } from '~/composables/useTeam'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'الإعدادات — لوحة التحكم' })

/* ═══ Composables ═══ */
const { user, loadMe } = useAuth()
const {
  notifyNumbers,
  loading,
  error,
  load,
  addNotifyNumber,
  deleteMember,
  changeMyPhone,
  changeMyPassword
} = useTeam()
const { show } = useToast()

const isAssistant = computed(() => user.value?.role === 'assistant')

/* ═══════════════════════════════════════════════════════════
   MODALS
   ═══════════════════════════════════════════════════════════ */

/* ═══ تغيير الرقم ═══ */
const phoneModal = ref(false)
const phoneForm = reactive({ newPhone: '', password: '' })
const phoneSaving = ref(false)

function openPhoneModal() {
  phoneForm.newPhone = ''
  phoneForm.password = ''
  phoneModal.value = true
}

async function submitPhoneChange() {
  if (!phoneForm.newPhone.trim()) {
    show('رقم الجوال الجديد مطلوب', 'alert-circle'); return
  }
  if (!phoneForm.password) {
    show('كلمة المرور للتأكيد مطلوبة', 'alert-circle'); return
  }

  phoneSaving.value = true
  try {
    const res = await changeMyPhone(
      phoneForm.newPhone.replace(/\D/g, ''),
      phoneForm.password
    )
    show('✅ ' + res.message, 'check')
    phoneModal.value = false
    await loadMe()  // ⭐ نحدّث بيانات المستخدم الحالي
  } catch (e: any) {
    show(e?.data?.statusMessage || 'فشل تغيير الرقم', 'alert-circle')
  } finally {
    phoneSaving.value = false
  }
}

/* ═══ تغيير كلمة المرور ═══ */
const pwModal = ref(false)
const pwForm = reactive({ current: '', newPw: '', confirm: '' })
const pwSaving = ref(false)

function openPwModal() {
  pwForm.current = ''
  pwForm.newPw = ''
  pwForm.confirm = ''
  pwModal.value = true
}

async function submitPasswordChange() {
  if (!pwForm.current) {
    show('كلمة المرور الحالية مطلوبة', 'alert-circle'); return
  }
  if (pwForm.newPw.length < 8) {
    show('كلمة المرور الجديدة 8 أحرف على الأقل', 'alert-circle'); return
  }
  if (!/[a-zA-Z]/.test(pwForm.newPw) || !/[0-9]/.test(pwForm.newPw)) {
    show('كلمة المرور يجب أن تحتوي على حروف وأرقام', 'alert-circle'); return
  }
  if (pwForm.newPw !== pwForm.confirm) {
    show('كلمتا المرور غير متطابقتين', 'alert-circle'); return
  }

  pwSaving.value = true
  try {
    const res = await changeMyPassword(pwForm.current, pwForm.newPw)
    show('✅ ' + res.message, 'check')
    pwModal.value = false
  } catch (e: any) {
    show(e?.data?.statusMessage || 'فشل تغيير كلمة المرور', 'alert-circle')
  } finally {
    pwSaving.value = false
  }
}

/* ═══ إضافة رقم إشعار ═══ */
const addModal = ref(false)
const addForm = reactive({
  name: '',
  phone: '',
  role: 'chef' as 'chef' | 'driver'
})
const addSaving = ref(false)

function openAddModal() {
  addForm.name = ''
  addForm.phone = ''
  addForm.role = 'chef'
  addModal.value = true
}

async function submitAddNumber() {
  if (!addForm.name.trim()) {
    show('الاسم مطلوب', 'alert-circle'); return
  }
  if (!addForm.phone.trim()) {
    show('رقم الجوال مطلوب', 'alert-circle'); return
  }

  addSaving.value = true
  try {
    await addNotifyNumber({
      name: addForm.name.trim(),
      phone: addForm.phone.replace(/\D/g, ''),
      role: addForm.role
    })
    show('✅ تمت الإضافة', 'check')
    addModal.value = false
  } catch (e: any) {
    show(e?.data?.statusMessage || 'فشل الإضافة', 'alert-circle')
  } finally {
    addSaving.value = false
  }
}

/* ═══ حذف رقم ═══ */
async function confirmDelete(member: TeamMember) {
  if (!confirm(`حذف "${member.name}"؟`)) return
  try {
    await deleteMember(member.phone)
    show('✅ تم الحذف', 'check')
  } catch (e: any) {
    show(e?.data?.statusMessage || 'فشل الحذف', 'alert-circle')
  }
}

/* ═══ Helpers ═══ */
const roleLabel = (role: string) =>
  (ROLE_LABELS as any)[role] || role

const roleEmoji = (role: string) => {
  if (role === 'chef') return '👨‍🍳'
  if (role === 'driver') return '🚚'
  if (role === 'admin') return '👑'
  if (role === 'assistant') return '📋'
  return '👤'
}

const displayPhone = (phone: string) =>
  phone.startsWith('965') ? `+${phone}` : `+965${phone}`

/* ═══ Load ═══ */
onMounted(async () => {
  if (!user.value) await loadMe()
  await load()
})
</script>

<template>
  <div class="settings-page">
    <!-- ═══ Header ═══ -->
    <header class="page-head">
      <div>
        <h1>الإعدادات</h1>
        <p>إدارة حسابك وأرقام الإشعارات</p>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════
         Section 1: حسابي
         ═══════════════════════════════════════════════════ -->
    <section class="s-section">
      <header class="s-section-head">
        <span class="s-ico"><Icon name="user" :size="20" /></span>
        <div>
          <h2>حسابي</h2>
          <p>بياناتك الشخصية وطريقة الدخول</p>
        </div>
      </header>

      <div class="s-cards">
        <!-- بطاقة الملف الشخصي -->
        <article class="s-card">
          <div class="s-card-body">
            <div class="s-row">
              <span class="s-row-ico s-ico-burgundy">
                <Icon name="user" :size="18" />
              </span>
              <div class="s-row-text">
                <b>الاسم</b>
                <span>{{ user?.name }}</span>
              </div>
            </div>

            <div class="s-row">
              <span class="s-row-ico s-ico-bronze">
                <Icon name="shield" :size="18" />
              </span>
              <div class="s-row-text">
                <b>الدور</b>
                <span>{{ roleLabel(user?.role || '') }}</span>
              </div>
            </div>

            <div class="s-row">
              <span class="s-row-ico s-ico-info">
                <Icon name="phone" :size="18" />
              </span>
              <div class="s-row-text">
                <b>رقم الجوال</b>
                <span dir="ltr">{{ displayPhone(user?.phone || '') }}</span>
              </div>
            </div>
          </div>

          <div class="s-card-foot">
            <button class="s-btn s-btn--primary" @click="openPhoneModal">
              <Icon name="edit-3" :size="14" />
              تغيير رقم الجوال
            </button>
          </div>
        </article>

        <!-- بطاقة كلمة المرور -->
        <article class="s-card">
          <div class="s-card-body">
            <div class="s-row">
              <span class="s-row-ico s-ico-purple">
                <Icon name="key" :size="18" />
              </span>
              <div class="s-row-text">
                <b>كلمة المرور</b>
                <span>●●●●●●●●</span>
              </div>
            </div>

            <p class="s-hint">
              ننصحك بتغيير كلمة المرور من وقت لآخر لضمان أمان حسابك.
            </p>
          </div>

          <div class="s-card-foot">
            <button class="s-btn s-btn--ghost" @click="openPwModal">
              <Icon name="lock" :size="14" />
              تغيير كلمة المرور
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════
         Section 2: أرقام الإشعارات
         ═══════════════════════════════════════════════════ -->
    <section class="s-section">
      <header class="s-section-head">
        <span class="s-ico s-ico-blue"><Icon name="bell" :size="20" /></span>
        <div>
          <h2>أرقام الإشعارات</h2>
          <p>أرقام واتساب الشيف والمندوب لإرسال إشعارات الطلبات</p>
        </div>
        <button class="s-btn s-btn--primary" @click="openAddModal">
          <Icon name="plus" :size="14" />
          إضافة رقم
        </button>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="s-state">
        <Icon name="loader" :size="28" class="spin" />
        <p>جاري التحميل…</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="s-state">
        <Icon name="alert-circle" :size="28" />
        <p>{{ error }}</p>
        <button class="s-btn s-btn--ghost" @click="load">إعادة المحاولة</button>
      </div>

      <!-- List -->
      <div v-else-if="notifyNumbers.length" class="s-numbers">
        <article
          v-for="m in notifyNumbers"
          :key="m.phone"
          class="s-number"
        >
          <span class="s-number-emoji">{{ roleEmoji(m.role) }}</span>
          <div class="s-number-info">
            <b>{{ m.name }}</b>
            <span dir="ltr">{{ displayPhone(m.phone) }}</span>
          </div>
          <span :class="['s-number-tag', `tag-${m.role}`]">
            {{ roleLabel(m.role) }}
          </span>
          <button
            class="s-number-del"
            @click="confirmDelete(m)"
            title="حذف"
          >
            <Icon name="trash-2" :size="14" />
          </button>
        </article>
      </div>

      <!-- Empty -->
      <div v-else class="s-empty">
        <Icon name="bell-off" :size="40" :stroke-width="1.4" />
        <b>لا توجد أرقام إشعار بعد</b>
        <p>أضف أول رقم شيف أو مندوب</p>
        <button class="s-btn s-btn--primary" @click="openAddModal">
          <Icon name="plus" :size="14" />
          إضافة أول رقم
        </button>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════
         MODALS
         ═══════════════════════════════════════════════════ -->

    <!-- تغيير الرقم -->
    <Teleport to="body">
      <Transition name="s-fade">
        <div v-if="phoneModal" class="s-overlay" @click.self="phoneModal = false">
          <div class="s-modal">
            <header class="s-modal-head">
              <span class="s-modal-ico">
                <Icon name="phone" :size="20" />
              </span>
              <div>
                <b>تغيير رقم الجوال</b>
                <span>{{ displayPhone(user?.phone || '') }} → رقم جديد</span>
              </div>
              <button class="s-modal-close" @click="phoneModal = false">
                <Icon name="x" :size="16" />
              </button>
            </header>

            <div class="s-modal-body">
              <div class="s-field">
                <label>رقم الجوال الجديد</label>
                <input
                  v-model="phoneForm.newPhone"
                  type="tel"
                  dir="ltr"
                  placeholder="96550003333"
                />
                <small>بدون الرمز الدولي — مثال: 96550003333</small>
              </div>

              <div class="s-field">
                <label>كلمة المرور (للتأكيد)</label>
                <input
                  v-model="phoneForm.password"
                  type="password"
                  placeholder="••••••••"
                />
                <small>لأمان حسابك، نطلب كلمة المرور قبل التغيير.</small>
              </div>
            </div>

            <footer class="s-modal-foot">
              <button class="s-btn s-btn--ghost" @click="phoneModal = false">إلغاء</button>
              <button
                class="s-btn s-btn--primary"
                :disabled="phoneSaving"
                @click="submitPhoneChange"
              >
                <Icon :name="phoneSaving ? 'loader' : 'check'" :size="14" :class="{ spin: phoneSaving }" />
                {{ phoneSaving ? 'جاري الحفظ…' : 'حفظ التغيير' }}
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- تغيير كلمة المرور -->
    <Teleport to="body">
      <Transition name="s-fade">
        <div v-if="pwModal" class="s-overlay" @click.self="pwModal = false">
          <div class="s-modal">
            <header class="s-modal-head">
              <span class="s-modal-ico s-modal-ico--purple">
                <Icon name="key" :size="20" />
              </span>
              <div>
                <b>تغيير كلمة المرور</b>
                <span>{{ user?.name }}</span>
              </div>
              <button class="s-modal-close" @click="pwModal = false">
                <Icon name="x" :size="16" />
              </button>
            </header>

            <div class="s-modal-body">
              <div class="s-field">
                <label>كلمة المرور الحالية</label>
                <input v-model="pwForm.current" type="password" placeholder="••••••••" />
              </div>
              <div class="s-field">
                <label>كلمة المرور الجديدة</label>
                <input v-model="pwForm.newPw" type="password" placeholder="8 أحرف على الأقل" />
                <small>8 أحرف على الأقل، مزيج من حروف وأرقام.</small>
              </div>
              <div class="s-field">
                <label>تأكيد كلمة المرور</label>
                <input v-model="pwForm.confirm" type="password" placeholder="••••••••" />
              </div>
            </div>

            <footer class="s-modal-foot">
              <button class="s-btn s-btn--ghost" @click="pwModal = false">إلغاء</button>
              <button
                class="s-btn s-btn--primary"
                :disabled="pwSaving"
                @click="submitPasswordChange"
              >
                <Icon :name="pwSaving ? 'loader' : 'check'" :size="14" :class="{ spin: pwSaving }" />
                {{ pwSaving ? 'جاري الحفظ…' : 'حفظ' }}
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- إضافة رقم إشعار -->
    <Teleport to="body">
      <Transition name="s-fade">
        <div v-if="addModal" class="s-overlay" @click.self="addModal = false">
          <div class="s-modal">
            <header class="s-modal-head">
              <span class="s-modal-ico s-modal-ico--blue">
                <Icon name="plus" :size="20" />
              </span>
              <div>
                <b>إضافة رقم إشعار</b>
                <span>شيف أو مندوب</span>
              </div>
              <button class="s-modal-close" @click="addModal = false">
                <Icon name="x" :size="16" />
              </button>
            </header>

            <div class="s-modal-body">
              <div class="s-field">
                <label>الاسم</label>
                <input v-model="addForm.name" type="text" placeholder="مثال: الشيف خالد" />
              </div>
              <div class="s-field">
                <label>رقم الواتساب</label>
                <input
                  v-model="addForm.phone"
                  type="tel"
                  dir="ltr"
                  placeholder="96550003333"
                />
              </div>
              <div class="s-field">
                <label>الدور</label>
                <div class="role-picker">
                  <button
                    type="button"
                    :class="['role-btn', { on: addForm.role === 'chef' }]"
                    @click="addForm.role = 'chef'"
                  >
                    👨‍🍳 شيف
                  </button>
                  <button
                    type="button"
                    :class="['role-btn', { on: addForm.role === 'driver' }]"
                    @click="addForm.role = 'driver'"
                  >
                    🚚 مندوب
                  </button>
                </div>
              </div>
            </div>

            <footer class="s-modal-foot">
              <button class="s-btn s-btn--ghost" @click="addModal = false">إلغاء</button>
              <button
                class="s-btn s-btn--primary"
                :disabled="addSaving"
                @click="submitAddNumber"
              >
                <Icon :name="addSaving ? 'loader' : 'check'" :size="14" :class="{ spin: addSaving }" />
                {{ addSaving ? 'جاري الإضافة…' : 'إضافة' }}
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.settings-page { padding-bottom: 40px; }

/* ═══ Page Head ═══ */
.page-head { margin-bottom: 24px; }
.page-head h1 {
  font-family: "Playfair Display", "Almarai", serif;
  font-size: clamp(24px, 3vw, 30px);
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 6px;
}
.page-head p { margin: 0; font-size: 13.5px; color: var(--ink-mute); width: 100%;
  max-width: 100%}

/* ═══ Section ═══ */
.s-section { margin-bottom: 32px; }
.s-section-head {
  display: flex; align-items: center; gap: 14px;
  margin-bottom: 18px;
}
.s-ico {
  width: 42px; height: 42px;
  display: grid; place-items: center;
  border-radius: 12px;
  background: rgba(110,31,46,.08);
  color: var(--burgundy);
  flex-shrink: 0;
}
.s-ico-blue { background: rgba(59,130,246,.12); color: #3B82F6; }
.s-section-head > div { flex: 1;  }
.s-section-head h2 {
  font-family: "Playfair Display", "Almarai", serif;
  font-size: 18px; font-weight: 600;
  color: var(--ink); margin: 0 0 3px;
}
.s-section-head p { margin: 0; font-size: 12.5px; color: var(--ink-mute); }

/* ═══ Cards Grid ═══ */
.s-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}
.s-card {
  background: #fff;
  border: 1.5px solid rgba(27,23,20,.08);
  border-radius: 18px;
  overflow: hidden;
  display: flex; flex-direction: column;
}
.s-card-body {
  padding: 20px;
  display: flex; flex-direction: column;
  gap: 14px; flex: 1;
}
.s-row {
  display: flex; align-items: center; gap: 12px;
}
.s-row-ico {
  width: 38px; height: 38px;
  display: grid; place-items: center;
  border-radius: 10px;
  flex-shrink: 0;
}
.s-ico-burgundy { background: rgba(110,31,46,.08); color: var(--burgundy); }
.s-ico-bronze { background: rgba(168,133,91,.12); color: var(--bronze); }
.s-ico-info { background: rgba(59,130,246,.12); color: #3B82F6; }
.s-ico-purple { background: rgba(139,92,246,.12); color: #8B5CF6; }

.s-row-text { flex: 1; min-width: 0; }
.s-row-text b {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: var(--ink-mute);
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-bottom: 3px;
}
.s-row-text span {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  display: block;
  word-break: break-word;
}
.s-hint {
  font-size: 12.5px;
  color: var(--ink-mute);
  line-height: 1.6;
  margin: 0;
}

.s-card-foot {
  padding: 14px 20px;
  background: rgba(247,242,236,.5);
  border-top: 1px solid rgba(27,23,20,.06);
}

/* ═══ Buttons ═══ */
.s-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px;
  padding: 11px 18px;
  border: 1.5px solid transparent;
  border-radius: 12px;
  font: 800 13px inherit;
  cursor: pointer;
  transition: all .25s cubic-bezier(.22,1,.36,1);
  text-decoration: none;

}
.s-btn--primary {
  background: linear-gradient(135deg, #8B2E3F, #6E1F2E);
  color: #FBEFE0;
  box-shadow: 0 10px 22px -12px rgba(110,31,46,.6);
}
.s-btn--primary:hover:not(:disabled) { transform: translateY(-1px); }
.s-btn--primary:disabled { opacity: .6; cursor: wait; }
.s-btn--ghost {
  background: #fff;
  border-color: rgba(27,23,20,.12);
  color: var(--ink);
}
.s-btn--ghost:hover { border-color: var(--burgundy); color: var(--burgundy); }

/* ═══ Numbers List ═══ */
.s-numbers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}
.s-number {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1.5px solid rgba(27,23,20,.08);
  border-radius: 16px;
  transition: all .25s ease;
}
.s-number:hover {
  border-color: var(--bronze);
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -18px rgba(50,35,20,.35);
}
.s-number-emoji {
  width: 42px; height: 42px;
  display: grid; place-items: center;
  border-radius: 12px;
  background: rgba(59,130,246,.08);
  font-size: 20px;
  flex-shrink: 0;
}
.s-number-info { flex: 1; min-width: 0; }
.s-number-info b {
  display: block;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 3px;
}
.s-number-info span {
  font-size: 12px;
  color: var(--ink-mute);
  font-family: monospace;
}
.s-number-tag {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px; font-weight: 800;
  white-space: nowrap;
}
.tag-chef { background: rgba(245,158,11,.12); color: #F59E0B; }
.tag-driver { background: rgba(59,130,246,.12); color: #3B82F6; }
.s-number-del {
  width: 32px; height: 32px;
  display: grid; place-items: center;
  border: 0; background: transparent;
  border-radius: 8px;
  color: var(--ink-mute);
  cursor: pointer;
  transition: all .2s ease;
  flex-shrink: 0;
}
.s-number-del:hover { background: rgba(220,38,38,.1); color: var(--danger); }

/* ═══ States ═══ */
.s-state, .s-empty {
  display: flex; flex-direction: column;
  align-items: center; gap: 10px;
  padding: 50px 20px;
  text-align: center;
  background: rgba(255,255,255,.5);
  border: 1.5px dashed rgba(27,23,20,.1);
  border-radius: 18px;
  color: var(--ink-mute);
}
.s-state :deep(svg), .s-empty :deep(svg) {
  color: var(--bronze);
  opacity: .7;
}
.s-empty b {
  font-size: 14px;
  color: var(--ink);
  font-weight: 800;
}
.s-empty p {
  margin: 0 0 8px;
  font-size: 13px;
}
.s-empty .s-btn { width: auto; padding: 11px 22px; }

/* ═══ Modals ═══ */
.s-overlay {
  position: fixed; inset: 0;
  background: rgba(27,23,20,.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.s-modal {
  background: #fff;
  border-radius: 24px;
  width: min(440px, 100%);
  overflow: hidden;
  box-shadow: 0 30px 60px -20px rgba(0,0,0,.4);
}
.s-modal-head {
  display: flex; align-items: center; gap: 12px;
  padding: 20px 22px;
  border-bottom: 1px solid rgba(27,23,20,.06);
}
.s-modal-ico {
  width: 42px; height: 42px;
  display: grid; place-items: center;
  border-radius: 12px;
  background: rgba(110,31,46,.08);
  color: var(--burgundy);
  flex-shrink: 0;
}
.s-modal-ico--purple { background: rgba(139,92,246,.12); color: #8B5CF6; }
.s-modal-ico--blue { background: rgba(59,130,246,.12); color: #3B82F6; }
.s-modal-head > div { flex: 1; min-width: 0; }
.s-modal-head b {
  display: block;
  font-size: 15px;
  font-weight: 800;
  color: var(--ink);
}
.s-modal-head span {
  font-size: 12px;
  color: var(--ink-mute);
  margin-top: 2px;
  display: block;
}
.s-modal-close {
  width: 34px; height: 34px;
  display: grid; place-items: center;
  background: rgba(247,242,236,.8);
  border: 0;
  border-radius: 50%;
  color: var(--ink);
  cursor: pointer;
  transition: all .2s ease;
  flex-shrink: 0;
}
.s-modal-close:hover {
  background: var(--burgundy);
  color: #fff;
  transform: rotate(90deg);
}

.s-modal-body { padding: 22px; }
.s-field { margin-bottom: 16px; }
.s-field:last-child { margin-bottom: 0; }
.s-field label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-soft);
  margin-bottom: 7px;
}
.s-field input {
  width: 100%; padding: 13px 15px;
  background: var(--cream);
  border: 1.5px solid rgba(27,23,20,.08);
  border-radius: 12px;
  font: 600 14px inherit;
  color: var(--ink);
  transition: all .2s ease;
}
.s-field input:focus {
  outline: 0;
  border-color: var(--burgundy);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(110,31,46,.08);
}
.s-field small {
  display: block;
  font-size: 11.5px;
  color: var(--ink-mute);
  margin-top: 5px;
}

.role-picker {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.role-btn {
  padding: 14px;
  background: var(--cream);
  border: 1.5px solid rgba(27,23,20,.08);
  border-radius: 12px;
  font: 800 13px inherit;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all .25s ease;
}
.role-btn:hover { border-color: var(--bronze); }
.role-btn.on {
  background: linear-gradient(135deg, #8B2E3F, #6E1F2E);
  color: #FBEFE0;
  border-color: transparent;
  box-shadow: 0 10px 22px -12px rgba(110,31,46,.6);
}

.s-modal-foot {
  display: flex; gap: 10px;
  padding: 16px 22px;
  background: #fafafa;
  border-top: 1px solid rgba(27,23,20,.06);
}
.s-modal-foot .s-btn { flex: 1; width: auto; }

/* ═══ Animations ═══ */
.spin { animation: spin .9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.s-fade-enter-active, .s-fade-leave-active { transition: opacity .25s ease; }
.s-fade-enter-from, .s-fade-leave-to { opacity: 0; }

/* ═══ Responsive ═══ */
@media (max-width: 640px) {
  .s-section-head {
    flex-wrap: wrap;
  }
  .s-section-head .s-btn { width: 100%; margin-top: 8px; }
  .s-cards { grid-template-columns: 1fr; }
  .s-numbers { grid-template-columns: 1fr; }
}
</style>