<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: number | string
  strokeWidth?: number
}>(), {
  size: 22,
  strokeWidth: 1.7
})

/* Convert kebab-case → PascalCase */
const iconComponent = computed(() => {
  if (!props.name) return null
  const pascalName = props.name
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
  return (LucideIcons as any)[pascalName] || null
})
</script>

<template>
  <component
    :is="iconComponent"
    v-if="iconComponent"
    :size="size"
    :stroke-width="strokeWidth"
    class="lucide-icon"
  />
</template>

<style scoped>
.lucide-icon {
  flex: none;
  display: inline-block;
  vertical-align: middle;
}
</style>