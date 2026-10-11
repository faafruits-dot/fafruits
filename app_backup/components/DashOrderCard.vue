<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'
import { KD, timeAgo } from '~/utils/format'
import type { DashOrder } from '~/composables/useOrders'

const props = defineProps<{
  order: DashOrder
  nextLabel?: string
}>()

const emit = defineEmits<{
  (e: 'advance', id: string): void
}>()

const { products } = useProducts()

const getProd = (pid: string) => products.value.find(p => p.id === pid)

const totalQty = computed(() =>
  props.order.items.reduce((s, i) => s + i.qty, 0)
)

const whatsappUrl = computed(() => `https://wa.me/${props.order.phone}`)
</script>

<template>
  <div class="dash-order-card">
    <!-- Head -->
    <div class="dash-order-head">
      <div class="dash-order-num">
        <b>#{{ order.id }}</b>
        <span v-if="order.isVip" class="dash-vip">VIP</span>
        <span v-if="order.issue === 'no-answer'" class="dash-issue-badge">
          <i data-lucide="alert-triangle" /> لم يرد
        </span>
      </div>
      <div class="dash-order-time">
        <i data-lucide="clock" /> {{ timeAgo(order.createdAt) }}
      </div>
    </div>

    <!-- Info -->
    <div class="dash-order-info">
      <div class="dash-order-row">
        <i data-lucide="user" />
        <b>{{ order.customerName }}</b>
        <span class="dash-order-phone">{{ order.phone }}</span>
      </div>

      <div class="dash-order-row">
        <i data-lucide="map-pin" />
        <span>{{ order.area }} · {{ order.street }}</span>
      </div>

      <div class="dash-order-row dash-order-items-row">
        <div class="dash-items-images">
          <div class="dash-items-stack">
            <span
              v-for="it in order.items.slice(0, 3)"
              :key="it.pid"
              class="dash-item-img"
            >
              <img v-if="getProd(it.pid)" :src="getProd(it.pid)!.img" alt="" />
              <b v-if="it.qty > 1" class="dash-item-qty">×{{ it.qty }}</b>
            </span>
            <span v-if="order.items.length > 3" class="dash-item-more">
              +{{ order.items.length - 3 }}
            </span>
          </div>
          <span class="dash-items-count">{{ totalQty }} منتج</span>
        </div>
      </div>

      <div class="dash-order-row">
        <i data-lucide="calendar" />
        <span>{{ order.slot }} · <b>{{ KD(order.total) }}</b></span>
      </div>

      <div v-if="order.notes" class="dash-order-note">
        <i data-lucide="message-square" /> {{ order.notes }}
      </div>
    </div>

    <!-- Actions -->
    <div class="dash-order-actions">
      <button
        v-if="nextLabel"
        class="dash-btn dash-btn-primary"
        @click="emit('advance', order.id)"
      >
        <i data-lucide="check" /> {{ nextLabel }}
      </button>
      <a
        class="dash-btn dash-btn-ghost"
        :href="whatsappUrl"
        target="_blank"
        rel="noopener"
      >
        <i data-lucide="message-circle" /> واتساب
      </a>
    </div>
  </div>
</template>