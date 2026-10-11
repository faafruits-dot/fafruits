<script setup lang="ts">
import { computed } from 'vue'

/* ═══ Props ═══ */
type Variant = 'primary' | 'ghost' | 'outline' | 'whatsapp' | 'phone' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    /* نوع العنصر */
    to?: string          // NuxtLink داخلي
    href?: string        // رابط خارجي <a>
    type?: 'button' | 'submit' | 'reset'

    /* المظهر */
    variant?: Variant
    size?: Size
    block?: boolean      // عرض كامل
    loading?: boolean
    disabled?: boolean

    /* أيقونات */
    icon?: string        // اسم أيقونة prefix
    iconEnd?: string     // اسم أيقونة suffix

    /* إضافي */
    ariaLabel?: string
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    block: false,
    loading: false,
    disabled: false,
  }
)

/* ═══ تحديد العنصر ═══ */
const tag = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  if (props.href) return 'a'
  return 'button'
})

/* ═══ bindings ديناميكية ═══ */
const bindings = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) {
    return {
      href: props.href,
      target: props.href.startsWith('http') ? '_blank' : undefined,
      rel: props.href.startsWith('http') ? 'noopener' : undefined,
    }
  }
  return {
    type: props.type,
    disabled: props.disabled || props.loading,
  }
})

/* ═══ classes ═══ */
const classes = computed(() => [
  'app-btn',
  `app-btn--${props.variant}`,
  `app-btn--${props.size}`,
  {
    'app-btn--block': props.block,
    'app-btn--loading': props.loading,
    'app-btn--disabled': props.disabled,
  },
])
</script>

<template>
  <component
    :is="tag"
    v-bind="bindings"
    :class="classes"
    :aria-label="ariaLabel"
    :aria-busy="loading || undefined"
  >
    <!-- ⭐ Loading spinner -->
    <span v-if="loading" class="app-btn__spinner" aria-hidden="true" />

    <!-- ⭐ Prefix icon -->
    <Icon
      v-else-if="icon"
      :name="icon"
      class="app-btn__icon app-btn__icon--start"
    />

    <!-- ⭐ Slot النص -->
    <span class="app-btn__label">
      <slot />
    </span>

    <!-- ⭐ Suffix icon -->
    <Icon
      v-if="iconEnd && !loading"
      :name="iconEnd"
      class="app-btn__icon app-btn__icon--end"
    />
  </component>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════
   AppButton — Heritage Rebrand
   ═══════════════════════════════════════════════════ */

.app-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: inherit;
  font-weight: 800;
  letter-spacing: 0.01em;
  text-decoration: none;
  border: 1.5px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  isolation: isolate;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.app-btn__label {
  display: inline-flex;
  align-items: center;
}

.app-btn__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ═══ الأحجام ═══ */
.app-btn--sm {
  padding: 11px 20px;
  font-size: 13px;
  gap: 8px;
}
.app-btn--sm .app-btn__icon { width: 15px; height: 15px; }

.app-btn--md {
  padding: 15px 28px;
  font-size: 14.5px;
}

.app-btn--lg {
  padding: 18px 34px;
  font-size: 15px;
}

.app-btn--block {
  display: flex;
  width: 100%;
}

/* ═══ حالة Loading ═══ */
.app-btn--loading {
  cursor: wait;
  pointer-events: none;
}

.app-btn__spinner {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  animation: appBtnSpin 0.7s linear infinite;
}

@keyframes appBtnSpin {
  to { transform: rotate(360deg); }
}

/* ═══ حالة Disabled ═══ */
.app-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* ═══════════════════════════════════════════════════
   Variants
   ═══════════════════════════════════════════════════ */

/* ⭐ Primary — عنابي */
.app-btn--primary {
  background: linear-gradient(150deg, #8b2e3f 0%, #6e1f2e 45%, #551621 100%);
  color: #fbefe0;
  box-shadow:
    0 22px 44px -18px rgba(110, 31, 46, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.12) inset;
}
.app-btn--primary::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.18) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: -1;
}
.app-btn--primary:hover {
  transform: translateY(-3px);
  background: linear-gradient(150deg, #a4384d 0%, #8b2e3f 45%, #6e1f2e 100%);
  box-shadow:
    0 30px 56px -20px rgba(110, 31, 46, 0.85),
    0 0 0 1px rgba(255, 255, 255, 0.18) inset;
}
.app-btn--primary:hover::before { transform: translateX(100%); }
.app-btn--primary:hover .app-btn__icon--end { transform: translateX(-4px); }

/* ⭐ Ghost — كريمي شفاف */
.app-btn--ghost {
  background: rgba(255, 255, 255, 0.65);
  color: var(--ink, #1b1714);
  border-color: rgba(27, 23, 20, 0.14);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  backdrop-filter: blur(14px) saturate(1.4);
  box-shadow: 0 14px 30px -22px rgba(50, 35, 20, 0.6);
}
.app-btn--ghost:hover {
  background: #fff;
  color: var(--burgundy, #6e1f2e);
  border-color: var(--burgundy, #6e1f2e);
  transform: translateY(-3px);
  box-shadow: 0 22px 44px -22px rgba(50, 35, 20, 0.7);
}

/* ⭐ Outline — شفاف بحدود */
.app-btn--outline {
  background: transparent;
  color: var(--ink, #1b1714);
  border-color: rgba(27, 23, 20, 0.25);
}
.app-btn--outline:hover {
  background: rgba(27, 23, 20, 0.05);
  border-color: var(--burgundy, #6e1f2e);
  color: var(--burgundy, #6e1f2e);
  transform: translateY(-2px);
}

/* ⭐ WhatsApp */
.app-btn--whatsapp {
  background: #fff9f0;
  color: #1b1714;
  box-shadow:
    0 22px 44px -18px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
}
.app-btn--whatsapp .app-btn__icon--start {
  color: #25d366;
  stroke-width: 2.2;
}
.app-btn--whatsapp:hover {
  transform: translateY(-3px);
  background: #fff;
  box-shadow: 0 30px 56px -20px rgba(0, 0, 0, 0.45);
}
.app-btn--whatsapp:hover .app-btn__icon--start {
  transform: rotate(-12deg) scale(1.08);
}

/* ⭐ Phone */
.app-btn--phone {
  background: rgba(255, 255, 255, 0.1);
  color: #fff9f0;
  border-color: rgba(255, 249, 240, 0.42);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 28px -18px rgba(0, 0, 0, 0.5);
}
.app-btn--phone .app-btn__icon--start {
  color: #ffe9c7;
}
.app-btn--phone:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 249, 240, 0.7);
  transform: translateY(-3px);
  box-shadow: 0 22px 40px -18px rgba(0, 0, 0, 0.6);
}
.app-btn--phone:hover .app-btn__icon--start { transform: rotate(-10deg); }

/* ⭐ Danger */
.app-btn--danger {
  background: linear-gradient(150deg, #dc2626 0%, #b91c1c 100%);
  color: #fff;
  box-shadow: 0 20px 40px -18px rgba(220, 38, 38, 0.6);
}
.app-btn--danger:hover {
  transform: translateY(-3px);
  box-shadow: 0 28px 52px -20px rgba(220, 38, 38, 0.75);
}

/* ═══ Focus visible ═══ */
.app-btn:focus-visible {
  outline: 2px solid var(--burgundy, #6e1f2e);
  outline-offset: 3px;
}
.app-btn--whatsapp:focus-visible { outline-color: #25d366; }
.app-btn--phone:focus-visible { outline-color: #ffe9c7; }

/* ═══ Reduced motion ═══ */
@media (prefers-reduced-motion: reduce) {
  .app-btn,
  .app-btn__icon,
  .app-btn__spinner {
    animation: none !important;
    transition: none !important;
  }
}
</style>