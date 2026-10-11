<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'
import type { Product } from '~/composables/useProducts'

/* ═══ State ═══ */
const open = useState('search-open', () => false)
const query = ref('')
const selectedIndex = ref(-1)
const inputRef = ref<HTMLInputElement | null>(null)

/* ═══ Products ═══ */
const { products, load, loaded } = useProducts()

if (!loaded.value) load()

/* ═══ Normalize Helper ═══ */
function normalize(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, '') // إزالة التشكيل
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim()
}

/* ═══ Live Results ═══ */
const results = computed<Product[]>(() => {
  const q = normalize(query.value)
  if (!q || q.length < 2) return []

  return products.value
    .filter((p) => {
      const haystack = normalize(
        [
          p.id,
          p.mood || '',
          ...(p.occ || []),
          (p as any).serving || '',
          p.category || '',
        ].join(' '),
      )
      return haystack.includes(q)
    })
    .slice(0, 8)
})

/* ═══ Suggestions (when empty) ═══ */
const suggestions = [
  { label: 'عيد ميلاد', q: 'عيد ميلاد', icon: 'cake' },
  { label: 'مولود جديد', q: 'مولود', icon: 'baby' },
  { label: 'تخرج', q: 'تخرج', icon: 'graduation-cap' },
  { label: 'زواج', q: 'زواج', icon: 'heart' },
  { label: 'فاخر', q: 'فاخر', icon: 'sparkles' },
  { label: 'أبراج', q: 'أبراج', icon: 'building-2' },
  { label: 'سلال', q: 'سلال', icon: 'shopping-basket' },
  { label: 'بوكيهات', q: 'بوكيهات', icon: 'flower-2' },
]

/* ═══ Handlers ═══ */
function openSearch() {
  open.value = true
  nextTick(() => inputRef.value?.focus())
}

function closeSearch() {
  open.value = false
  query.value = ''
  selectedIndex.value = -1
}

function goToProduct(id: string) {
  closeSearch()
  navigateTo(`/product/${id}`)
}

function useSuggestion(q: string) {
  query.value = q
  nextTick(() => inputRef.value?.focus())
}

function onKeydown(e: KeyboardEvent) {
  if (!open.value) return

  if (e.key === 'Escape') {
    closeSearch()
    return
  }

  if (!results.value.length) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % results.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value =
      selectedIndex.value <= 0
        ? results.value.length - 1
        : selectedIndex.value - 1
  } else if (e.key === 'Enter' && selectedIndex.value >= 0) {
    e.preventDefault()
    goToProduct(results.value[selectedIndex.value].id)
  }
}

/* ═══ Keyboard & Body Lock ═══ */
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (import.meta.client) document.body.style.overflow = ''
})

watch(open, (v) => {
  if (!import.meta.client) return
  document.body.style.overflow = v ? 'hidden' : ''
  if (v) nextTick(() => inputRef.value?.focus())
})

watch(query, () => {
  selectedIndex.value = -1
})

/* ⭐ فتح المودال من أي مكان */
defineExpose({ openSearch })
</script>

<template>
  <Teleport to="body">
    <Transition name="search-fade">
      <div
        v-if="open"
        class="search-overlay"
        @click.self="closeSearch"
        role="dialog"
        aria-modal="true"
        aria-label="البحث في الموقع"
      >
        <div class="search-panel">
          <!-- ═══ Head ═══ -->
          <div class="search-head">
            <Icon name="search" :size="22" class="search-head__ico" />

            <input
              ref="inputRef"
              v-model="query"
              type="search"
              class="search-head__input"
              placeholder="ابحث… جرّب: عيد ميلاد، فاخر، أبراج"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
              dir="auto"
            />

            <button
              type="button"
              class="search-head__close"
              @click="closeSearch"
              aria-label="إغلاق البحث"
            >
              <Icon name="x" :size="20" />
            </button>
          </div>

          <!-- ═══ Body ═══ -->
          <div class="search-body">
            <!-- Suggestions (empty query) -->
            <template v-if="!query">
              <div class="search-section">
                <h3 class="search-section__title">
                  <Icon name="trending-up" :size="14" />
                  اقتراحات سريعة
                </h3>
                <div class="search-chips">
                  <button
                    v-for="s in suggestions"
                    :key="s.q"
                    type="button"
                    class="search-chip"
                    @click="useSuggestion(s.q)"
                  >
                    <Icon :name="s.icon" :size="14" />
                    {{ s.label }}
                  </button>
                </div>
              </div>
            </template>

            <!-- Too short -->
            <template v-else-if="query.length < 2">
              <div class="search-hint">
                <Icon name="type" :size="24" />
                <p>اكتب حرفين على الأقل للبحث</p>
              </div>
            </template>

            <!-- No results -->
            <template v-else-if="!results.length">
              <div class="search-empty">
                <Icon name="search-x" :size="42" :stroke-width="1.4" />
                <h3>لا توجد نتائج لـ "{{ query }}"</h3>
                <p>جرّب كلمة أبسط أو تصفّح الأقسام من الأعلى</p>
              </div>
            </template>

            <!-- Results -->
            <template v-else>
              <div class="search-section">
                <h3 class="search-section__title">
                  <Icon name="package" :size="14" />
                  {{ results.length }} نتيجة
                </h3>
                <ul class="search-results">
                  <li
                    v-for="(p, i) in results"
                    :key="p.id"
                    :class="{ on: selectedIndex === i }"
                  >
                    <NuxtLink
                      :to="`/product/${p.id}`"
                      class="search-result"
                      @click="closeSearch"
                      @mouseenter="selectedIndex = i"
                    >
                      <div class="search-result__img">
                        <img :src="p.img" :alt="p.mood || p.id" loading="lazy" />
                      </div>
                      <div class="search-result__body">
                        <span class="search-result__title">
                          {{ p.mood || p.id.toUpperCase() }}
                        </span>
                        <span class="search-result__meta">
                          <span v-if="p.occ?.length" class="search-result__occ">
                            {{ p.occ.slice(0, 2).join(' · ') }}
                          </span>
                        </span>
                      </div>
                      <span class="search-result__price">
                        {{ Number(p.price).toFixed(3) }}
                        <small>د.ك</small>
                      </span>
                      <Icon
                        name="arrow-left"
                        :size="16"
                        class="search-result__arrow"
                      />
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </template>
          </div>

          <!-- ═══ Foot ═══ -->
          <div class="search-foot">
            <span class="search-foot__hint">
              <kbd>↑</kbd><kbd>↓</kbd> للتنقل
            </span>
            <span class="search-foot__hint">
              <kbd>Enter</kbd> للفتح
            </span>
            <span class="search-foot__hint">
              <kbd>Esc</kbd> للإغلاق
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   Search Overlay — Heritage
   ═══════════════════════════════════════════════════════════ */
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(27, 23, 20, 0.45);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 8vh 4vw 4vh;
  overflow-y: auto;
}

.search-panel {
  width: min(640px, 100%);
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 40px 80px -30px rgba(27, 23, 20, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  display: flex;
  flex-direction: column;
  max-height: 82vh;
  animation: panelIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes panelIn {
  from { opacity: 0; transform: translateY(-16px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ═══ Head ═══ */
.search-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(27, 23, 20, 0.06);
  background: #fff;
}

.search-head__ico {
  color: var(--bronze);
  flex-shrink: 0;
}

.search-head__input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  padding: 4px 0;
  min-width: 0;
}

.search-head__input::placeholder {
  color: var(--ink-mute);
  opacity: 0.6;
  font-weight: 500;
}

.search-head__input::-webkit-search-cancel-button {
  display: none;
}

.search-head__close {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  background: var(--cream);
  border: 0;
  border-radius: 50%;
  color: var(--ink);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.search-head__close:hover {
  background: var(--burgundy);
  color: #fff;
  transform: rotate(90deg);
}

/* ═══ Body ═══ */
.search-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 20px 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(27, 23, 20, 0.15) transparent;
}

.search-body::-webkit-scrollbar {
  width: 6px;
}
.search-body::-webkit-scrollbar-thumb {
  background: rgba(27, 23, 20, 0.15);
  border-radius: 3px;
}

.search-section + .search-section {
  margin-top: 20px;
}

.search-section__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 800;
  color: var(--ink-mute);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 12px;
}

.search-section__title :deep(svg) {
  color: var(--bronze);
}

/* ═══ Chips ═══ */
.search-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.search-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 15px;
  background: var(--cream);
  border: 1.5px solid rgba(27, 23, 20, 0.06);
  border-radius: 999px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.search-chip :deep(svg) {
  color: var(--bronze);
  flex-shrink: 0;
}

.search-chip:hover {
  background: #fff;
  border-color: var(--burgundy);
  color: var(--burgundy);
  transform: translateY(-1px);
}

.search-chip:hover :deep(svg) {
  color: var(--burgundy);
}

/* ═══ Results ═══ */
.search-results {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.search-result {
  display: grid;
  grid-template-columns: 56px 1fr auto auto;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 14px;
  text-decoration: none;
  color: var(--ink);
  transition: background 0.2s ease;
}

.search-results li.on .search-result,
.search-result:hover {
  background: var(--cream);
}

.search-result__img {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--cream);
  flex-shrink: 0;
}

.search-result__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.search-result__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.search-result__title {
  font-size: 14.5px;
  font-weight: 800;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-result__meta {
  font-size: 11.5px;
  color: var(--ink-mute);
}

.search-result__occ {
  font-family: "Amiri", serif;
  font-style: italic;
}

.search-result__price {
  font-family: "Playfair Display", serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--burgundy);
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  white-space: nowrap;
}

.search-result__price small {
  font-size: 10px;
  color: var(--bronze);
  font-weight: 600;
}

.search-result__arrow {
  color: var(--ink-mute);
  flex-shrink: 0;
  transition: transform 0.3s ease, color 0.3s ease;
}

.search-results li.on .search-result__arrow,
.search-result:hover .search-result__arrow {
  color: var(--burgundy);
  transform: translateX(-4px);
}

/* ═══ Hint / Empty ═══ */
.search-hint,
.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;
  color: var(--ink-mute);
}

.search-hint :deep(svg),
.search-empty :deep(svg) {
  color: var(--bronze);
  opacity: 0.6;
}

.search-hint p,
.search-empty p {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
}

.search-empty h3 {
  margin: 0;
  font-family: "Playfair Display", serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ink);
}

/* ═══ Foot ═══ */
.search-foot {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border-top: 1px solid rgba(27, 23, 20, 0.06);
  background: var(--cream);
  font-size: 11px;
  color: var(--ink-mute);
  flex-wrap: wrap;
}

.search-foot__hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.search-foot kbd {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #fff;
  border: 1px solid rgba(27, 23, 20, 0.1);
  border-bottom-width: 2px;
  border-radius: 5px;
  font-family: inherit;
  font-size: 10px;
  font-weight: 800;
  color: var(--ink-soft);
}

/* ═══ Animations ═══ */
.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}

/* ═══════════════════════════════════════════════════════════
   Responsive
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 640px) {
  .search-overlay {
    padding: 4vh 3vw;
    align-items: stretch;
  }

  .search-panel {
    border-radius: 20px;
    max-height: 92vh;
  }

  .search-head {
    padding: 14px 16px;
  }

  .search-head__input {
    font-size: 15px;
  }

  .search-body {
    padding: 16px 16px 6px;
  }

  .search-result {
    grid-template-columns: 48px 1fr auto;
    gap: 10px;
    padding: 8px 10px;
  }

  .search-result__img {
    width: 48px;
    height: 48px;
    border-radius: 10px;
  }

  .search-result__title {
    font-size: 13.5px;
  }

  .search-result__price {
    font-size: 14px;
  }

  .search-result__arrow {
    display: none;
  }

  .search-foot {
    padding: 10px 16px;
    gap: 12px;
    font-size: 10px;
  }
}

@media (max-width: 380px) {
  .search-result {
    grid-template-columns: 44px 1fr;
  }
  .search-result__price {
    grid-column: 2;
    font-size: 13px;
    margin-top: 4px;
  }
}

/* ═══ Reduced motion ═══ */
@media (prefers-reduced-motion: reduce) {
  .search-panel,
  .search-head__close,
  .search-chip,
  .search-result,
  .search-result__arrow,
  .search-fade-enter-active,
  .search-fade-leave-active {
    transition: none !important;
    animation: none !important;
  }
}
</style>