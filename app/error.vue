<script setup lang="ts">
const props = defineProps<{ error: any }>()

const handleClear = () => {
  clearError({ redirect: '/dashboard/login' })
}
</script>

<template>
  <div style="min-height:100vh;display:grid;place-items:center;padding:20px;font-family:'Cairo',sans-serif">
    <div style="text-align:center;max-width:480px">
      <h1 style="font-size:4rem;color:#e94a63;margin-bottom:8px">
        {{ error?.statusCode || 500 }}
      </h1>
      <h2 style="font-size:1.5rem;color:#24382c;margin-bottom:16px">
        {{ error?.statusCode === 403 ? 'لا تملك صلاحية الوصول' :
           error?.statusCode === 404 ? 'الصفحة غير موجودة' :
           'حدث خطأ غير متوقع' }}
      </h2>
      <p style="color:#7d8a80;margin-bottom:24px">
        {{ error?.message || 'يرجى المحاولة مرة أخرى' }}
      </p>
      <button
        style="padding:12px 24px;background:linear-gradient(120deg,#e94a63,#ff8a3c);color:#fff;border:none;border-radius:99px;font-family:inherit;font-weight:700;cursor:pointer"
        @click="handleClear">
        العودة لتسجيل الدخول
      </button>
    </div>
  </div>
</template>