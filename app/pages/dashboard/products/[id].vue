<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'
import { useToast } from '~/composables/useToast'
import type { Product } from '~/composables/useProducts'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const router = useRouter()
const { products, load, updateProduct } = useProducts()
const { show } = useToast()

const productId = computed(() => String(route.params.id || ''))
const loading = ref(true)
const saving = ref(false)
const notFound = ref(false)

/* ═══ المنتج الحالي ═══ */
const product = computed<Product | null>(
  () => products.value.find((p) => p.id === productId.value) || null,
)

/* ═══ SEO ديناميكي ═══ */
useSeoMeta({
  title: () => `تعديل ${productId.value.toUpperCase()} — لوحة التحكم`,
})

/* ═══ تحميل ═══ */
onMounted(async () => {
  loading.value = true
  try {
    if (!products.value.length) await load(true)
    if (!product.value) notFound.value = true
  } finally {
    loading.value = false
  }
})

/* ═══ حفظ ═══ */
async function handleSubmit(data: Partial<Product>) {
  if (!product.value) return
  saving.value = true
  try {
    // لا نرسل id في التعديل
    const { id, ...patch } = data
    await updateProduct(product.value.id, patch)
    show('تم حفظ التعديلات ✅', 'check')
    router.push('/dashboard/products')
  } catch (e: any) {
    show(e?.data?.statusMessage || 'فشل الحفظ', 'alert-circle')
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
    <!-- ═══ Loading ═══ -->
    <div v-if="loading" class="state">
      <Icon name="loader" :size="32" class="state__spin" />
      <b>جاري التحميل…</b>
    </div>

    <!-- ═══ Not Found ═══ -->
    <div v-else-if="notFound || !product" class="state">
      <Icon name="package-x" :size="52" :stroke-width="1.5" />
      <h2>المنتج غير موجود</h2>
      <p>لم نجد منتجًا بالكود <code dir="ltr">{{ productId }}</code></p>
      <NuxtLink to="/dashboard/products" class="state__btn">
        <Icon name="arrow-right" :size="16" />
        العودة للمنتجات
      </NuxtLink>
    </div>

    <!-- ═══ Form ═══ -->
    <template v-else>
      <header class="dash-page__head">
        <div>
          <nav class="crumbs">
            <NuxtLink to="/dashboard">الرئيسية</NuxtLink>
            <span class="crumbs__sep">/</span>
            <NuxtLink to="/dashboard/products">المنتجات</NuxtLink>
            <span class="crumbs__sep">/</span>
            <span class="crumbs__current">تعديل {{ product.id.toUpperCase() }}</span>
          </nav>
          <h1>تعديل المنتج</h1>
          <p>
            كود المنتج: <code dir="ltr">{{ product.id.toUpperCase() }}</code>
          </p>
        </div>

        <NuxtLink to="/dashboard/products" class="back-btn">
          <Icon name="arrow-right" :size="16" />
          رجوع
        </NuxtLink>
      </header>

      <ProductForm
        mode="edit"
        :product="product"
        :saving="saving"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </template>
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
.dash-page__head code {
  font-family: monospace;
  padding: 2px 8px;
  background: var(--cream);
  border-radius: 6px;
  color: var(--burgundy);
  font-weight: 700;
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

/* ═══ State ═══ */
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 80px 20px;
  text-align: center;
  color: var(--ink-mute);
}
.state__spin {
  animation: spin 1.4s linear infinite;
  color: var(--bronze);
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.state h2 {
  font-family: "Playfair Display", serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--ink);
  margin: 0;
}
.state p { margin: 0; font-size: 13.5px; }
.state code {
  font-family: monospace;
  padding: 2px 8px;
  background: var(--cream);
  border-radius: 6px;
  color: var(--burgundy);
  font-weight: 700;
}
.state__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(150deg, #8b2e3f, #6e1f2e);
  color: #fbefe0;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 14px 28px -16px rgba(110, 31, 46, 0.6);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.state__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 36px -18px rgba(110, 31, 46, 0.75);
}
</style>