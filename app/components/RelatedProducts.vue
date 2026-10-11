<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'

const props = defineProps<{
  currentId: string
  occ: string[]
  mood: string | null
}>()

const { products } = useProducts()

/* ⭐ تأكد إن كل العناصر صالحة */
const safeProducts = computed(() =>
  (products.value || []).filter(p => p && p.id)
)

const sameOccasion = computed(() => {
  const occ = props.occ
  if (!occ || !occ.length) return []
  if (!props.currentId) return []

  return safeProducts.value
    .filter(p => {
      if (p.id === props.currentId) return false
      const pOcc = p.occ || []
      return pOcc.some(o => o && occ.includes(o))
    })
    .sort((a, b) => {
      const aShared = (a.occ || []).filter(o => occ.includes(o)).length
      const bShared = (b.occ || []).filter(o => occ.includes(o)).length
      return bShared - aShared
    })
    .slice(0, 4)
})

const sameMood = computed(() => {
  if (!props.currentId) return []

  let list = safeProducts.value.filter(p => p.id !== props.currentId)

  if (props.mood) {
    list = list.filter(p => p.mood === props.mood)
  }

  if (list.length < 4) {
    const best = safeProducts.value.filter(p =>
      p.id !== props.currentId && p.best && !list.find(x => x.id === p.id)
    )
    list = [...list, ...best]
  }

  return list.slice(0, 4)
})
</script>

<template>
  <section v-if="sameOccasion.length" class="sec" style="padding-top:20px">
    <div class="wrap">
      <div class="sec-head">
        <div>
          <h2>
            <Icon name="party-popper" :size="22" />
            نفس المناسبة، خيارات ثانية
          </h2>
          <p>إذا أعجبتك هذه، فهذه أيضاً ستعجبك</p>
        </div>
        <NuxtLink to="/collections" class="link-more">
          عرض الكل <Icon name="chevron-left" :size="16" />
        </NuxtLink>
      </div>
      <div class="prod-grid">
        <ProductCard v-for="p in sameOccasion" :key="p.id" :product="p" />
      </div>
    </div>
  </section>

  <section v-if="sameMood.length" class="sec" style="padding-top:20px">
    <div class="wrap">
      <div class="sec-head">
        <div>
          <h2>
            <Icon name="sparkles" :size="22" />
            اخترناها لك
          </h2>
          <p>لمسة مشابهة قد تعجبك أكثر</p>
        </div>
        <NuxtLink to="/collections?filter=best" class="link-more">
          عرض الكل <Icon name="chevron-left" :size="16" />
        </NuxtLink>
      </div>
      <div class="prod-grid">
        <ProductCard v-for="p in sameMood" :key="p.id" :product="p" />
      </div>
    </div>
  </section>
</template>