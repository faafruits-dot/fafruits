<script setup lang="ts">
import { useAuth, ROLE_LABEL } from '~/composables/useAuth'

definePageMeta({ layout: 'dashboard' })

const { team, user, addMember, updateMember, deleteMember } = useAuth()

const showModal = ref(false)
const editPhone = ref<string | null>(null)
const form = reactive({
  name: '', phone: '', role: 'chef', password: '', active: true
})

const openAdd = () => {
  editPhone.value = null
  Object.assign(form, { name: '', phone: '', role: 'chef', password: '', active: true })
  showModal.value = true
}

const openEdit = (u: any) => {
  editPhone.value = u.phone
  Object.assign(form, { name: u.name, phone: u.phone, role: u.role, password: '', active: u.active })
  showModal.value = true
}

const save = () => {
  if (!form.name || !form.phone) { alert('املأ الحقول'); return }
  if (editPhone.value) {
    const patch: any = { name: form.name, role: form.role as any, active: form.active }
    if (form.password) patch.password = form.password
    updateMember(editPhone.value, patch)
  } else {
    if (!form.password || form.password.length < 6) { alert('كلمة المرور 6 أحرف على الأقل'); return }
    const res = addMember({
      phone: form.phone,
      password: form.password,
      name: form.name,
      role: form.role as any
    })
    if (!res.ok) { alert(res.error); return }
  }
  showModal.value = false
}

const confirmDelete = (phone: string, name: string) => {
  if (confirm(`سيتم حذف "${name}" نهائياً. متابعة؟`)) deleteMember(phone)
}
</script>

<template>
  <div>
    <div class="dash-head">
      <h1>إدارة الفريق</h1>
      <p>{{ team.length }} عضو</p>
    </div>

    <div class="dash-users-toolbar">
      <button class="dash-btn dash-btn-primary" @click="openAdd">
        <i data-lucide="user-plus" /> إضافة عضو
      </button>
    </div>

    <div class="dash-users-list">
      <div v-for="u in team" :key="u.phone" class="dash-user-row">
        <div class="dash-user-avatar">
          <i :data-lucide="u.role === 'admin' ? 'shield' : u.role === 'chef' ? 'chef-hat' : u.role === 'driver' ? 'truck' : 'calculator'" />
        </div>
        <div class="dash-user-info">
          <b>
            {{ u.name }}
            <span v-if="user?.phone === u.phone" class="dash-user-me">أنت</span>
          </b>
          <span>{{ u.phone }}</span>
        </div>
        <span :class="['dash-user-role', `role-${u.role}`]">{{ ROLE_LABEL[u.role] }}</span>
        <div class="dash-user-actions">
          <button class="dash-icon-btn dash-icon-sm" @click="openEdit(u)"><i data-lucide="edit-3" /></button>
          <button v-if="user?.phone !== u.phone" class="dash-icon-btn dash-icon-sm dash-icon-danger" @click="confirmDelete(u.phone, u.name)">
            <i data-lucide="trash-2" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="dash-modal-overlay" @click.self="showModal = false">
      <div class="dash-modal" @click.stop>
        <div class="dash-modal-head">
          <h2>{{ editPhone ? 'تعديل عضو' : 'إضافة عضو' }}</h2>
          <button class="dash-icon-btn" @click="showModal = false"><i data-lucide="x" /></button>
        </div>
        <form class="dash-modal-body" @submit.prevent="save">
          <div class="dash-field"><label>الاسم</label><input v-model="form.name" class="dash-input" required /></div>
          <div class="dash-field">
            <label>رقم الجوال (بدون +)</label>
            <input v-model="form.phone" class="dash-input" type="tel" :readonly="!!editPhone" required />
          </div>
          <div class="dash-field">
            <label>الدور</label>
            <select v-model="form.role" class="dash-input">
              <option value="admin">مدير النظام</option>
              <option value="chef">المطبخ</option>
              <option value="driver">التوصيل</option>
              <option value="accountant">المحاسبة</option>
            </select>
          </div>
          <div class="dash-field">
            <label>{{ editPhone ? 'كلمة مرور جديدة (اتركها فاضية للإبقاء)' : 'كلمة المرور' }}</label>
            <input v-model="form.password" class="dash-input" type="text" :required="!editPhone" />
          </div>
          <div v-if="editPhone" class="dash-field">
            <label class="dash-checkbox">
              <input v-model="form.active" type="checkbox" /><span>الحساب نشط</span>
            </label>
          </div>
          <div class="dash-modal-actions">
            <button type="button" class="dash-btn dash-btn-ghost" @click="showModal = false">إلغاء</button>
            <button type="submit" class="dash-btn dash-btn-primary">
              <i data-lucide="check" /> {{ editPhone ? 'حفظ' : 'إضافة' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>