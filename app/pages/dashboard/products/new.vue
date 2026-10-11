<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'
import { useToast } from '~/composables/useToast'
import type { Product } from '~/composables/useProducts'

definePageMeta({ layout: 'dashboard' })

useSeoMeta({
  title: 'إضافة منتج — لوحة التحكم',
})

const { createProduct } = useProducts()
const { show } = useToast()
const router = useRouter()

const saving = ref(false)

async function handleSubmit(data: Partial<Product>) {
  saving.value = true
  try {
    await createProduct(data as any)
    show('تمت إضافة المنتج بنجاح ✅', 'check')
    router.push('/dashboard/products')
  } catch (e: any) {
    show(e?.data?.statusMessage || 'فشل إضافة المنتج', 'alert-circle')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/dashboard/products')
}
</script>

<template>
  <div class="dash-page">
    <!-- ═══ Head ═══ -->
    <header class="dash-page__head">
      <div>
        <nav class="crumbs">
          <NuxtLink to="/dashboard">الرئيسية</NuxtLink>
          <span class="crumbs__sep">/</span>
          <NuxtLink to="/dashboard/products">المنتجات</NuxtLink>
          <span class="crumbs__sep">/</span>
          <span class="crumbs__current">إضافة منتج</span>
        </nav>
        <h1>إضافة منتج جديد</h1>
        <p>أضف بيانات المنتج كاملة — سيظهر مباشرة في الكتالوج.</p>
      </div>

      <NuxtLink to="/dashboard/products" class="back-btn">
        <Icon name="arrow-right" :size="16" />
        رجوع
      </NuxtLink>
    </header>

    <!-- ═══ Form ═══ -->
    <ProductForm
      mode="new"
      :saving="saving"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.dash-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dash-page__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.crumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ink-mute);
  margin-bottom: 10px;
}
.crumbs a {
  color: var(--ink-soft);
  text-decoration: none;
  transition: color 0.2s ease;
}
.crumbs a:hover { color: var(--burgundy); }
.crumbs__sep { opacity: 0.4; }
.crumbs__current { color: var(--burgundy); font-weight: 700; }

.dash-page__head h1 {
  font-family: "Playfair Display", "Almarai", serif;
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}

.dash-page__head p {
  margin: 0;
  font-size: 13.5px;
  color: var(--ink-mute);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: #fff;
  border: 1.5px solid rgba(27, 23, 20, 0.1);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.back-btn:hover {
  border-color: var(--burgundy);
  color: var(--burgundy);
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -16px rgba(110, 31, 46, 0.5);
}
</style>