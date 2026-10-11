<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="toast-wrap">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast">
        <i :data-lucide="t.icon" />
        <span>{{ t.msg }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>