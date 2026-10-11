<script setup lang="ts">
interface Props {
  mainImage: string
  images?: string[] | null
  alt?: string
}

const props = defineProps<Props>()

const allImages = computed(() => {
  const list: string[] = []
  if (props.mainImage) list.push(props.mainImage)
  if (Array.isArray(props.images)) {
    props.images.forEach(img => {
      if (img && !list.includes(img)) list.push(img)
    })
  }
  return list
})

const activeIndex = ref(0)

const activeImage = computed(() =>
  allImages.value[activeIndex.value] || props.mainImage || ''
)

const goTo = (i: number) => {
  if (!allImages.value.length) return
  if (i < 0) i = allImages.value.length - 1
  if (i >= allImages.value.length) i = 0
  activeIndex.value = i
}

let touchStartX = 0
const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX
}
const onTouchEnd = (e: TouchEvent) => {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) < 50) return
  goTo(dx > 0 ? activeIndex.value - 1 : activeIndex.value + 1)
}
</script>

<template>
  <div class="pd-gallery" v-if="allImages.length">
    <div
      class="pg-main"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <img :src="activeImage" :alt="alt || ''" />

      <template v-if="allImages.length > 1">
        <button class="pg-arrow pg-prev" aria-label="السابق" @click="goTo(activeIndex - 1)">
          <Icon name="chevron-right" :size="22" />
        </button>
        <button class="pg-arrow pg-next" aria-label="التالي" @click="goTo(activeIndex + 1)">
          <Icon name="chevron-left" :size="22" />
        </button>

        <div class="pg-dots">
          <span
            v-for="(_, i) in allImages"
            :key="i"
            :class="['pg-dot', { on: i === activeIndex }]"
            @click="goTo(i)"
          />
        </div>
      </template>
    </div>

    <div v-if="allImages.length > 1" class="pg-thumbs">
      <button
        v-for="(img, i) in allImages"
        :key="i"
        :class="['pg-thumb', { on: i === activeIndex }]"
        @click="goTo(i)"
      >
        <img :src="img" :alt="`صورة ${i + 1}`" />
      </button>
    </div>
  </div>
</template>