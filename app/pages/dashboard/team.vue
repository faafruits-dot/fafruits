<script setup lang="ts">
import { useAuth, ROLE_LABELS } from '~/composables/useAuth'
import { useTeam, type TeamRecord } from '~/composables/useTeam'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'الفريق — لوحة التحكم' })

/* ═══ Composables ═══ */
const { team: currentUser, isAdmin } = useAuth()
const {
  loginMembers,
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

/* ═══ Computed — تأمين ضد undefined ═══ */
const safeLoginMembers = computed<TeamRecord[]>(() =>
  Array.isArray(loginMembers.value) ? loginMembers.value : []
)
const safeNotifyNumbers = computed<TeamRecord[]>(() =>
  Array.isArray(notifyNumbers.value) ? notifyNumbers.value : []
)

/* ═══════════════════════════════════════════════════════════
   Modals
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
    show('✅ ' + (res?.message || 'تم التحديث'), 'check')
    phoneModal.value = false
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
  if (!pwForm.current) { show('كلمة المرور الحالية مطلوبة', 'alert-circle'); return }
  if (pwForm.newPw.length < 8) { show('كلمة المرور الجديدة 8 أحرف على الأقل', 'alert-circle'); return }
  if (!/[a-zA-Z]/.test(pwForm.newPw) || !/[0-9]/.test(pwForm.newPw)) {
    show('كلمة المرور يجب أن تحتوي على حروف وأرقام', 'alert-circle'); return
  }
  if (pwForm.newPw !== pwForm.confirm) {
    show('كلمتا المرور غير متطابقتين', 'alert-circle'); return
  }
  pwSaving.value = true
  try {
    const res = await changeMyPassword(pwForm.current, pwForm.newPw)
    show('✅ ' + (res?.message || 'تم التغيير'), 'check')
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
  if (!addForm.name.trim()) { show('الاسم مطلوب', 'alert-circle'); return }
  if (!addForm.phone.trim()) { show('رقم الجوال مطلوب', 'alert-circle'); return }
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
async function confirmDelete(member: TeamRecord) {
  if (!confirm(`حذف "${member.name}"؟`)) return
  try {
    await deleteMember(member.phone)
    show('✅ تم الحذف', 'check')
  } catch (e: any) {
    show(e?.data?.statusMessage || 'فشل الحذف', 'alert-circle')
  }
}

/* ═══ Helpers ═══ */
const roleLabel = (role: string) => (ROLE_LABELS as any)[role] || role

const roleEmoji = (role: string) => {
  if (role === 'chef') return '👨‍🍳'
  if (role === 'driver') return '🚚'
  if (role === 'admin') return '👑'
  if (role === 'assistant') return '📋'
  return '👤'
}

const displayPhone = (phone: string) =>
  phone?.startsWith('965') ? `+${phone}` : `+965${phone || ''}`

/* ═══ Load ═══ */
onMounted(async () => {
  await load()
})
</script>

<template>
  <div class="team-page">
    <!-- Head -->
    <header class="page-head">
      <div>
        <h1>الفريق</h1>
        <p>
          {{ safeLoginMembers.length }} عضو بتسجيل دخول ·
          {{ safeNotifyNumbers.length }} رقم إشعار
        </p>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="state">
      <Icon name="loader" :size="28" class="spin" />
      <b>جاري التحميل…</b>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state">
      <Icon name="alert-circle" :size="28" />
      <b>{{ error }}</b>
      <button class="btn-primary" @click="load">إعادة المحاولة</button>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- ═══ Section 1: Login Members ═══ -->
      <section class="section-head">
        <span class="section-ico"><Icon name="users" :size="20" /></span>
        <div class="section-title">
          <h2>حسابي والإدارة</h2>
          <p>الأعضاء الذين يستطيعون تسجيل الدخول للوحة التحكم</p>
        </div>
        <span class="section-count">{{ safeLoginMembers.length }}</span>
      </section>

      <div class="team-cards">
        <!-- بطاقة حسابي -->
        <article class="info-card">
          <div class="info-card__head">
            <div class="info-card__avatar">
              <Icon name="user" :size="22" />
            </div>
            <div class="info-card__meta">
              <b>{{ currentUser?.name || '—' }}</b>
              <span dir="ltr">{{ displayPhone(currentUser?.phone || '') }}</span>
            </div>
            <span class="info-card__role">
              {{ roleLabel(currentUser?.role || '') }}
            </span>
          </div>

          <div class="info-card__rows">
            <div class="info-row">
              <span class="info-row__ico"><Icon name="shield" :size="16" /></span>
              <div class="info-row__text">
                <b>الدور</b>
                <span>{{ roleLabel(currentUser?.role || '') }}</span>
              </div>
            </div>
            <div class="info-row">
              <span class="info-row__ico"><Icon name="phone" :size="16" /></span>
              <div class="info-row__text">
                <b>رقم الجوال</b>
                <span dir="ltr">{{ displayPhone(currentUser?.phone || '') }}</span>
              </div>
            </div>
          </div>

          <div class="info-card__actions">
            <button class="action-btn" @click="openPhoneModal">
              <Icon name="edit-3" :size="14" />
              تغيير الرقم
            </button>
            <button class="action-btn action-btn--ghost" @click="openPwModal">
              <Icon name="key" :size="14" />
              تغيير كلمة المرور
            </button>
          </div>
        </article>

        <!-- بطاقات باقي الأعضاء (للأدمن فقط) -->
        <article
          v-for="m in safeLoginMembers.filter(x => x.phone !== currentUser?.phone)"
          :key="m.phone"
          class="info-card"
        >
          <div class="info-card__head">
            <div :class="['info-card__avatar', `av-${m.role}`]">
              {{ m.name?.split(' ').map(w => w[0]).slice(0, 2).join('') || '👤' }}
            </div>
            <div class="info-card__meta">
              <b>{{ m.name }}</b>
              <span dir="ltr">{{ displayPhone(m.phone) }}</span>
            </div>
            <span class="info-card__role">
              {{ roleLabel(m.role) }}
            </span>
          </div>

          <div class="info-card__actions">
            <button
              v-if="isAdmin"
              class="action-btn action-btn--admin"
              @click="openPwModal"
            >
              <Icon name="shield" :size="14" />
              تغيير كلمة المرور
            </button>
            <button v-else class="action-btn" disabled>
              <Icon name="lock" :size="14" />
              كلمة المرور
            </button>
          </div>
        </article>
      </div>

      <!-- ═══ Section 2: Notify Numbers ═══ -->
      <section class="section-head section-head--spaced">
        <span class="section-ico section-ico--blue">
          <Icon name="bell" :size="20" />
        </span>
        <div class="section-title">
          <h2>أرقام الإشعارات</h2>
          <p>أرقام واتساب الشيف والمندوب — بدون تسجيل دخول</p>
        </div>
        <span class="section-count">{{ safeNotifyNumbers.length }}</span>
        <button class="btn-primary btn-primary--sm" @click="openAddModal">
          <Icon name="plus" :size="14" />
          إضافة رقم
        </button>
      </section>

      <div v-if="safeNotifyNumbers.length" class="notify-grid">
        <article
          v-for="m in safeNotifyNumbers"
          :key="m.phone"
          class="notify-card"
        >
          <span class="notify-emoji">{{ roleEmoji(m.role) }}</span>
          <div class="notify-info">
            <b>{{ m.name }}</b>
            <span dir="ltr">{{ displayPhone(m.phone) }}</span>
          </div>
          <span :class="['notify-tag', `tag-${m.role}`]">
            {{ roleLabel(m.role) }}
          </span>
          <button class="notify-del" @click="confirmDelete(m)" title="حذف">
            <Icon name="trash-2" :size="14" />
          </button>
        </article>
      </div>

      <div v-else class="empty-notify">
        <Icon name="bell-off" :size="40" />
        <b>لا توجد أرقام إشعار</b>
        <p>أضف أول رقم شيف أو مندوب</p>
        <button class="btn-primary btn-primary--sm" @click="openAddModal">
          + إضافة أول رقم
        </button>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════
         Modals
         ═══════════════════════════════════════════════════ -->

    <!-- تغيير الرقم -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="phoneModal" class="overlay" @click.self="phoneModal = false">
          <div class="modal">
            <header class="modal-head">
              <span class="modal-ico"><Icon name="phone" :size="20" /></span>
              <div>
                <b>تغيير رقم الجوال</b>
                <span>{{ displayPhone(currentUser?.phone || '') }} → رقم جديد</span>
              </div>
              <button class="modal-close" @click="phoneModal = false">
                <Icon name="x" :size="16" />
              </button>
            </header>
            <div class="modal-body">
              <div class="field">
                <label>رقم الجوال الجديد</label>
                <input v-model="phoneForm.newPhone" type="tel" dir="ltr" placeholder="96550003333" />
              </div>
              <div class="field">
                <label>كلمة المرور (للتأكيد)</label>
                <input v-model="phoneForm.password" type="password" placeholder="••••••••" />
              </div>
            </div>
            <footer class="modal-foot">
              <button class="btn-ghost" @click="phoneModal = false">إلغاء</button>
              <button class="btn-primary" :disabled="phoneSaving" @click="submitPhoneChange">
                <Icon :name="phoneSaving ? 'loader' : 'check'" :size="14" :class="{ spin: phoneSaving }" />
                {{ phoneSaving ? 'جاري الحفظ…' : 'حفظ' }}
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- تغيير كلمة المرور -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="pwModal" class="overlay" @click.self="pwModal = false">
          <div class="modal">
            <header class="modal-head">
              <span class="modal-ico modal-ico--purple"><Icon name="key" :size="20" /></span>
              <div>
                <b>تغيير كلمة المرور</b>
                <span>{{ currentUser?.name }}</span>
              </div>
              <button class="modal-close" @click="pwModal = false">
                <Icon name="x" :size="16" />
              </button>
            </header>
            <div class="modal-body">
              <div class="field">
                <label>كلمة المرور الحالية</label>
                <input v-model="pwForm.current" type="password" placeholder="••••••••" />
              </div>
              <div class="field">
                <label>كلمة المرور الجديدة</label>
                <input v-model="pwForm.newPw" type="password" placeholder="8 أحرف على الأقل" />
                <small>8 أحرف على الأقل، مزيج من حروف وأرقام.</small>
              </div>
              <div class="field">
                <label>تأكيد كلمة المرور</label>
                <input v-model="pwForm.confirm" type="password" placeholder="••••••••" />
              </div>
            </div>
            <footer class="modal-foot">
              <button class="btn-ghost" @click="pwModal = false">إلغاء</button>
              <button class="btn-primary" :disabled="pwSaving" @click="submitPasswordChange">
                <Icon :name="pwSaving ? 'loader' : 'check'" :size="14" :class="{ spin: pwSaving }" />
                {{ pwSaving ? 'جاري الحفظ…' : 'حفظ' }}
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- إضافة رقم -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="addModal" class="overlay" @click.self="addModal = false">
          <div class="modal">
            <header class="modal-head">
              <span class="modal-ico modal-ico--blue"><Icon name="plus" :size="20" /></span>
              <div>
                <b>إضافة رقم إشعار</b>
                <span>شيف أو مندوب</span>
              </div>
              <button class="modal-close" @click="addModal = false">
                <Icon name="x" :size="16" />
              </button>
            </header>
            <div class="modal-body">
  <div class="field">
    <label>الاسم</label>
    <input v-model="addForm.name" type="text" placeholder="مثال: الشيف خالد" />
  </div>

  <div class="field">
    <label>رقم الواتساب</label>
    <input v-model="addForm.phone" type="tel" dir="ltr" placeholder="96550003333" />
  </div>

  <div class="field">
    <label>الدور</label>
    <div class="role-picker">
      <button
        type="button"
        :class="['role-btn', { on: addForm.role === 'chef' }]"
        @click="addForm.role = 'chef'"
      >
        <Icon name="chef-hat" :size="16" />
        <span>شيف</span>
      </button>

      <button
        type="button"
        :class="['role-btn', { on: addForm.role === 'driver' }]"
        @click="addForm.role = 'driver'"
      >
        <Icon name="truck" :size="16" />
        <span>مندوب</span>
      </button>
    </div>
  </div>
</div>
            <footer class="modal-foot">
              <button class="btn-ghost" @click="addModal = false">إلغاء</button>
              <button class="btn-primary" :disabled="addSaving" @click="submitAddNumber">
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
.team-page { padding-bottom: 40px; }

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

/* ═══ Section Head ═══ */
.section-head {
  display: flex; align-items: center; gap: 14px;
  margin-bottom: 18px;
}
.section-head--spaced { margin-top: 36px; }
.section-ico {
  width: 42px; height: 42px;
  display: grid; place-items: center;
  border-radius: 12px;
  background: rgba(110,31,46,.08);
  color: var(--burgundy);
  flex-shrink: 0;
}
.section-ico--blue {
  background: rgba(59,130,246,.12);
  color: #3B82F6;
}
.section-title { flex: 1; min-width: 0; }
.section-title h2 {
  font-family: "Playfair Display", "Almarai", serif;
  font-size: 18px; font-weight: 600;
  color: var(--ink); margin: 0 0 3px;
}
.section-title p { font-size: 12.5px; color: var(--ink-mute); margin: 0; }
.section-count {
  display: inline-grid; place-items: center;
  min-width: 28px; height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--cream);
  border: 1px solid var(--line);
  font-size: 13px; font-weight: 800;
  color: var(--ink-mute);
}

/* ═══ Team Cards ═══ */
.team-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}
.info-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 18px;
  padding: 20px;
  transition: all .3s ease;
}
.info-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px -24px rgba(50,35,20,.4);
}
.info-card__head {
  display: flex; align-items: center; gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 16px;
}
.info-card__avatar {
  width: 48px; height: 48px;
  display: grid; place-items: center;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #D4A574, #A8855B);
  flex-shrink: 0;
}
.av-admin { background: linear-gradient(135deg, #D4A574, #A8855B); }
.av-assistant { background: linear-gradient(135deg, #8B2E3F, #6E1F2E); }
.info-card__meta { flex: 1; min-width: 0; }
.info-card__meta b {
  display: block;
  font-size: 15px;
  font-weight: 800;
  color: var(--ink);
}
.info-card__meta span {
  font-size: 12px;
  color: var(--ink-mute);
  margin-top: 2px;
  display: block;
  font-family: monospace;
}
.info-card__role {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 800;
  background: rgba(110,31,46,.1);
  color: var(--burgundy);
}

.info-card__rows {
  display: flex; flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
.info-row {
  display: flex; align-items: center; gap: 12px;
}
.info-row__ico {
  width: 36px; height: 36px;
  display: grid; place-items: center;
  border-radius: 10px;
  background: rgba(110,31,46,.08);
  color: var(--burgundy);
  flex-shrink: 0;
}
.info-row__text b {
  display: block;
  font-size: 11px;
  font-weight: 800;
  color: var(--ink-mute);
  text-transform: uppercase;
  letter-spacing: .05em;
}
.info-row__text span {
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink);
  margin-top: 2px;
}

.info-card__actions {
  display: flex; gap: 8px; flex-wrap: wrap;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}
.action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border: 1.5px solid var(--line);
  background: #fff;
  border-radius: 10px;
  font: 800 12.5px inherit;
  color: var(--ink);
  cursor: pointer;
  transition: all .25s ease;
  min-width: 0;
}
.action-btn:hover:not(:disabled) {
  border-color: var(--burgundy);
  color: var(--burgundy);
  background: rgba(110,31,46,.03);
}
.action-btn--ghost { background: var(--cream); }
.action-btn--admin {
  border-color: rgba(168,133,91,.3);
  color: var(--bronze);
}
.action-btn--admin:hover {
  border-color: var(--bronze);
  background: rgba(168,133,91,.05);
}
.action-btn:disabled {
  color: var(--ink-mute);
  cursor: not-allowed;
  opacity: .6;
}

/* ═══ Notify Grid ═══ */
.notify-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}
.notify-card {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  transition: all .25s ease;
}
.notify-card:hover {
  border-color: var(--bronze);
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -18px rgba(50,35,20,.35);
}
.notify-emoji {
  width: 42px; height: 42px;
  display: grid; place-items: center;
  border-radius: 12px;
  background: rgba(59,130,246,.08);
  font-size: 20px;
  flex-shrink: 0;
}
.notify-info { flex: 1; min-width: 0; }
.notify-info b {
  display: block;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 3px;
}
.notify-info span {
  font-size: 12px;
  color: var(--ink-mute);
  font-family: monospace;
}
.notify-tag {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}
.tag-chef { background: rgba(245,158,11,.12); color: #F59E0B; }
.tag-driver { background: rgba(59,130,246,.12); color: #3B82F6; }
.notify-del {
  width: 32px; height: 32px;
  display: grid; place-items: center;
  border: 0;
  background: transparent;
  border-radius: 8px;
  color: var(--ink-mute);
  cursor: pointer;
  transition: all .2s ease;
  flex-shrink: 0;
}
.notify-del:hover { background: rgba(220,38,38,.1); color: #DC2626; }

/* ═══ Empty ═══ */
.empty-notify {
  display: flex; flex-direction: column;
  align-items: center; gap: 10px;
  padding: 50px 20px;
  text-align: center;
  background: rgba(255,255,255,.5);
  border: 1.5px dashed var(--line);
  border-radius: 18px;
  color: var(--ink-mute);
}
.empty-notify :deep(svg) { color: var(--bronze); opacity: .6; }
.empty-notify b { font-size: 14px; color: var(--ink); font-weight: 800; }
.empty-notify p { margin: 0 0 8px; font-size: 13px; }

/* ═══ States ═══ */
.state {
  display: flex; flex-direction: column;
  align-items: center; gap: 12px;
  padding: 60px 20px;
  text-align: center;
  color: var(--ink-mute);
}
.state b { font-size: 14px; color: var(--ink); }

/* ═══ Buttons ═══ */
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 12px 22px;
  background: linear-gradient(135deg, #8B2E3F, #6E1F2E);
  color: #FBEFE0;
  border: 0;
  border-radius: 12px;
  font: 800 13px inherit;
  cursor: pointer;
  box-shadow: 0 10px 22px -12px rgba(110,31,46,.6);
  transition: all .25s ease;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
.btn-primary:disabled { opacity: .6; cursor: wait; }
.btn-primary--sm { padding: 9px 16px; font-size: 12.5px; }

.btn-ghost {
  padding: 12px 22px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  font: 800 13px inherit;
  color: var(--ink);
  cursor: pointer;
}
.btn-ghost:hover { background: var(--cream); }

.spin { animation: spin .9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ═══ Modals ═══ */
.overlay {
  position: fixed; inset: 0;
  background: rgba(27,23,20,.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal {
  background: #fff;
  border-radius: 24px;
  width: min(440px, 100%);
  max-height: 92vh;
  overflow: hidden;
  box-shadow: 0 30px 60px -20px rgba(0,0,0,.4);
}
.modal-head {
  display: flex; align-items: center; gap: 12px;
  padding: 20px 22px;
  border-bottom: 1px solid var(--line);
}
.modal-ico {
  width: 42px; height: 42px;
  display: grid; place-items: center;
  border-radius: 12px;
  background: rgba(110,31,46,.08);
  color: var(--burgundy);
  flex-shrink: 0;
}
.modal-ico--purple { background: rgba(139,92,246,.12); color: #8B5CF6; }
.modal-ico--blue { background: rgba(59,130,246,.12); color: #3B82F6; }
.modal-head > div { flex: 1; min-width: 0; }
.modal-head b { display: block; font-size: 15px; font-weight: 800; color: var(--ink); }
.modal-head span { font-size: 12px; color: var(--ink-mute); margin-top: 2px; display: flex;
  justify-content: center;
  align-items: center; }
.modal-close {
  width: 34px; height: 34px;
  display: grid; place-items: center;
  background: var(--cream);
  border: 0;
  border-radius: 50%;
  color: var(--ink);
  cursor: pointer;
  transition: all .2s ease;
  flex-shrink: 0;
}
.modal-close:hover {
  background: var(--burgundy);
  color: #fff;
  transform: rotate(90deg);
}

.modal-body { padding: 22px; }
.field { margin-bottom: 16px; }
.field:last-child { margin-bottom: 0; }
.field label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-soft);
  margin-bottom: 7px;
}
.field input {
  width: 100%;
  padding: 13px 15px;
  background: var(--cream);
  border: 1.5px solid var(--line);
  border-radius: 12px;
  font: 600 14px inherit;
  color: var(--ink);
  transition: all .2s ease;
}
.field input:focus {
  outline: 0;
  border-color: var(--burgundy);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(110,31,46,.08);
}
.field small {
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
  border: 1.5px solid var(--line);
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
}

.modal-foot {
  display: flex; gap: 10px;
  padding: 16px 22px;
  background: #fafafa;
  border-top: 1px solid var(--line);
}
.modal-foot .btn-primary,
.modal-foot .btn-ghost { flex: 1; }

.fade-enter-active, .fade-leave-active { transition: opacity .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.role-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  /* باقي الستايل زي ما هو */
}

.role-btn :deep(svg) {
  flex-shrink: 0;
}
</style>