<script setup lang="ts">
import { useCart } from '~/composables/useCart'
import { useFavorites } from '~/composables/useFavorites'

const { count } = useCart()
const { favorites } = useFavorites()

/* ═══ State ═══ */
const showDrawer = ref(false)
const scrolled = ref(false)

/* ═══ Search Ref ═══ */
const searchRef = ref<InstanceType<typeof AppSearch> | null>(null)

/* ═══ Scroll Handler ═══ */
const onScroll = () => {
  if (import.meta.client) scrolled.value = window.scrollY > 24
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

/* ═══ Body Lock عند فتح القائمة ═══ */
watch(showDrawer, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

/* ═══ روابط التنقل (Desktop) ═══ */
const mainNav = [
  { to: '/',            label: 'الرئيسية' },
  { to: '/styles',      label: 'حسب التصميم' },
  { to: '/occasions',   label: 'المناسبات' },
  { to: '/collections', label: 'المجموعات' },
  { to: '/gift-finder', label: 'هدية مثالية' },
]

/* ═══ روابط القائمة (Mobile) ═══ */
const drawerLinks = [
  { to: '/',            label: 'الرئيسية' },
  { to: '/styles',      label: 'حسب التصميم' },
  { to: '/occasions',   label: 'المناسبات' },
  { to: '/collections', label: 'المجموعات' },
  { to: '/gift-finder', label: 'هدية مثالية' },
  { to: '/orders',      label: 'طلباتي' },
  { to: '/favorites',   label: 'المفضلة' },
]

/* ═══ Actions ═══ */
function openMenu() { showDrawer.value = true }
function closeMenu() { showDrawer.value = false }
function openSearch() { searchRef.value?.openSearch() }

/* ═══ Keyboard Shortcut: Ctrl/Cmd + K ═══ */
function onGlobalKey(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    openSearch()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKey)
})
</script>

<template>
  <!-- ═══════════════════════════════════════════════════
       SITE NAV
       ═══════════════════════════════════════════════════ -->
  <header
    class="site-nav"
    :class="{
      'is-scrolled': scrolled,
      'is-menu-open': showDrawer,
    }"
  >
    <div class="site-nav__inner">

      <!-- Burger (Mobile) -->
      <button
        class="burger"
        :class="{ 'is-open': showDrawer }"
        type="button"
        :aria-label="showDrawer ? 'إغلاق' : 'القائمة'"
        :aria-expanded="showDrawer"
        @click="showDrawer ? closeMenu() : openMenu()"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Brand -->
      <NuxtLink to="/" class="brand" aria-label="FA Fruits — الصفحة الرئيسية">
        <span class="brand__mark">FA</span>
        <span class="brand__text">
          <span class="brand__ar">فواكه</span>
          <span class="brand__en">FA FRUITS</span>
        </span>
      </NuxtLink>

      <!-- Nav Links (Desktop) -->
      <nav class="nav-links" aria-label="التنقل الرئيسي">
        <NuxtLink
          v-for="link in mainNav"
          :key="link.to"
          :to="link.to"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- Actions -->
      <div class="nav-actions">

        <!-- ⭐ Search -->
        <button
          class="icon-btn"
          type="button"
          aria-label="بحث"
          @click="openSearch"
        >
          <Icon name="search" :size="20" />
        </button>

        <!-- Favorites (Desktop only) -->
        <NuxtLink
          to="/favorites"
          class="icon-btn only-desktop"
          aria-label="المفضلة"
        >
          <Icon name="heart" :size="20" />
          <span
            v-if="favorites.length > 0"
            class="cart__count"
          >{{ favorites.length }}</span>
        </NuxtLink>

        <!-- Cart -->
        <NuxtLink
          to="/cart"
          class="icon-btn"
          aria-label="سلة المشتريات"
        >
          <Icon name="shopping-bag" :size="20" />
          <span
            v-if="count > 0"
            class="cart__count"
          >{{ count }}</span>
        </NuxtLink>

        <!-- User (Desktop only) -->
        <NuxtLink
          to="/orders"
          class="icon-btn only-desktop"
          aria-label="حسابي"
        >
          <Icon name="user" :size="20" />
        </NuxtLink>

      </div>

    </div>
  </header>

  <!-- ═══════════════════════════════════════════════════
       MOBILE MENU — Full Screen
       ═══════════════════════════════════════════════════ -->
  <Transition name="menu-fade">
    <nav
      v-if="showDrawer"
      class="mobile-menu"
      aria-label="قائمة الجوال"
    >
      <NuxtLink
        v-for="link in drawerLinks"
        :key="link.to"
        :to="link.to"
        @click="closeMenu"
      >
        {{ link.label }}
      </NuxtLink>

      <a
        href="https://wa.me/96551180015"
        target="_blank"
        rel="noopener"
        @click="closeMenu"
      >
        تواصل واتساب
      </a>
    </nav>
  </Transition>

  <!-- ⭐ Search Overlay -->
  <AppSearch ref="searchRef" />
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   SITE NAV — Main Header
   ═══════════════════════════════════════════════════════════ */
.site-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 22px 0;
  background: transparent;
  transition:
    background 0.45s var(--ease),
    box-shadow 0.45s var(--ease),
    backdrop-filter 0.45s var(--ease),
    padding 0.45s var(--ease);
}

.site-nav.is-scrolled {
  padding: 12px 0;
  background: rgba(247, 242, 236, 0.72);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  backdrop-filter: blur(20px) saturate(1.5);
  box-shadow:
    0 1px 0 rgba(27, 23, 20, 0.07),
    0 18px 40px -30px rgba(27, 23, 20, 0.5);
}

/* عند فتح القائمة — شفاف دايمًا */
.site-nav.is-menu-open {
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}

.site-nav__inner {
  width: var(--shell, min(1280px, 92vw));
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: clamp(16px, 3vw, 40px);
}

/* ═══════════════════════════════════════════════════════════
   BRAND
   ═══════════════════════════════════════════════════════════ */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  flex-shrink: 0;
}

.brand__mark {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--burgundy-lt);
  color: #F3E8D8;
  font-family: var(--ff-display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.02em;
  box-shadow: 0 12px 26px -12px rgba(27, 23, 20, 0.75);
  transition: transform 0.4s var(--ease-bounce);
  flex-shrink: 0;
}

.brand:hover .brand__mark {
  transform: rotate(-6deg) scale(1.06);
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

.brand__ar {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
}

.brand__en {
  font-family: var(--ff-display);
  font-size: 9.5px;
  letter-spacing: 0.34em;
  color: var(--ink-mute);
  margin-top: 3px;
  text-transform: uppercase;
}

/* ═══════════════════════════════════════════════════════════
   NAV LINKS (Desktop)
   ═══════════════════════════════════════════════════════════ */
.nav-links {
  display: flex;
  align-items: center;
  gap: clamp(14px, 2.2vw, 30px);
  margin-inline: auto;
}

.nav-links a {
  position: relative;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  color: var(--ink-soft);
  padding: 6px 0;
  transition: color 0.35s var(--ease);
  white-space: nowrap;
}

.nav-links a::after {
  content: "";
  position: absolute;
  bottom: 0;
  inset-inline-start: 0;
  width: 0;
  height: 1.5px;
  background: var(--bronze);
  transition: width 0.45s var(--ease);
}

.nav-links a:hover {
  color: var(--ink);
}

.nav-links a:hover::after,
.nav-links a.router-link-active::after {
  width: 100%;
}

.nav-links a.router-link-active {
  color: var(--ink);
}

/* ═══════════════════════════════════════════════════════════
   NAV ACTIONS
   ═══════════════════════════════════════════════════════════ */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  position: relative;
  transition:
    background 0.3s var(--ease),
    transform 0.3s var(--ease);
  text-decoration: none;
  font-family: inherit;
  padding: 0;
  flex-shrink: 0;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.65);
  transform: translateY(-1px);
}

.icon-btn:active {
  transform: scale(0.94);
}

/* ═══ Cart Count Badge ═══ */
.cart__count {
  position: absolute;
  top: 4px;
  inset-inline-end: 4px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--burgundy);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: grid;
  place-items: center;
  line-height: 1;
  box-shadow: 0 0 0 2px rgba(247, 242, 236, 0.9);
  animation: badgePop 0.4s var(--ease-bounce);
}

@keyframes badgePop {
  from { transform: scale(0); }
  to   { transform: scale(1); }
}

/* ═══════════════════════════════════════════════════════════
   BURGER (Mobile)
   ═══════════════════════════════════════════════════════════ */
.burger {
  display: none;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  place-items: center;
  align-content: center;
  gap: 0;
  flex-shrink: 0;
  transition: background 0.3s var(--ease);
}

.burger:hover {
  background: rgba(255, 255, 255, 0.9);
}

.burger span {
  display: block;
  width: 18px;
  height: 1.6px;
  background: var(--ink);
  border-radius: 2px;
  transition:
    transform 0.4s var(--ease),
    opacity 0.3s var(--ease);
  grid-column: 1;
}

.burger span + span {
  margin-top: 5px;
}

.burger.is-open span:nth-child(1) {
  transform: translateY(6.6px) rotate(45deg);
}
.burger.is-open span:nth-child(2) {
  opacity: 0;
}
.burger.is-open span:nth-child(3) {
  transform: translateY(-6.6px) rotate(-45deg);
}

/* ═══════════════════════════════════════════════════════════
   MOBILE MENU — Full Screen Overlay
   ═══════════════════════════════════════════════════════════ */
.mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 15;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 0 12vw;
  background: rgba(247, 242, 236, 0.92);
  -webkit-backdrop-filter: blur(26px) saturate(1.4);
  backdrop-filter: blur(26px) saturate(1.4);
}

.mobile-menu a {
  font-size: clamp(24px, 5vw, 34px);
  font-weight: 300;
  text-decoration: none;
  color: var(--ink);
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
  transition:
    color 0.3s var(--ease),
    padding-inline-start 0.3s var(--ease);
}

.mobile-menu a:hover,
.mobile-menu a.router-link-active {
  color: var(--burgundy);
  padding-inline-start: 8px;
}

/* Animation */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition:
    opacity 0.35s var(--ease),
    transform 0.4s var(--ease);
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* ═══════════════════════════════════════════════════════════
   ONLY DESKTOP
   ═══════════════════════════════════════════════════════════ */
.only-desktop {
  display: grid;
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE — 1080px
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 1080px) {
  .nav-links {
    display: none;
  }

  .burger {
    display: grid;
    margin-inline-start: 6px;
  }

  .brand {
    margin-inline-end: auto;
  }
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE — 560px
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 560px) {
  .site-nav {
    padding: 14px 0;
  }

  .site-nav.is-scrolled {
    padding: 10px 0;
  }

  .brand__mark {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    font-size: 15px;
  }

  .brand__ar {
    font-size: 13px;
  }

  .brand__en {
    font-size: 8.5px;
    letter-spacing: 0.28em;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
  }

  .burger {
    width: 36px;
    height: 36px;
  }

  /* على الموبايل نخفي المفضلة والحساب (موجودين في القائمة) */
  .only-desktop {
    display: none;
  }
}

/* ═══════════════════════════════════════════════════════════
   REDUCED MOTION
   ═══════════════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .site-nav,
  .brand__mark,
  .icon-btn,
  .burger,
  .burger span,
  .nav-links a::after,
  .mobile-menu a,
  .cart__count {
    transition: none !important;
    animation: none !important;
  }
}
</style>