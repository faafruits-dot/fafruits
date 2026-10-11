<script setup lang="ts">
import * as icons from "lucide-vue-next";
import { computed } from "vue";

const props = defineProps<{
  name: string;
  size?: number | string;
  class?: string;
  strokeWidth?: number;
}>();

/* تحويل "shopping-cart" → "ShoppingCart" */
const pascalCase = (str: string) =>
  str
    .split(/[-_\s]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");

const iconComponent = computed(() => {
  const pascal = pascalCase(props.name);
  const found = (icons as any)[pascal];

  /* ⭐ تحذير لو الأيقونة مش موجودة */
  if (!found && import.meta.client) {
    console.warn(
      `[Icon] "${props.name}" (→ ${pascal}) not found in lucide-vue-next. Falling back to Circle.`,
    );
  }

  /* ⭐ Fallback: Circle بدل ما يختفي */
  return found || (icons as any).Circle || (icons as any).HelpCircle;
});
</script>

<template>
  <component
    :is="iconComponent"
    :size="size ?? 20"
    :stroke-width="strokeWidth ?? 2"
    :class="class"
    aria-hidden="true"
    v-bind="$attrs"
  />
</template>