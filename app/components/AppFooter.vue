<script setup lang="ts">
import { WHATSAPP_NUMBER } from '~/data/seed'

/* ═══ Scroll to Top ═══ */
function scrollToTop() {
  if (!import.meta.client) return
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/* ═══ السنة الحالية ═══ */
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer" aria-label="تذييل الصفحة">
    <div class="site-footer__inner">

      <div class="footer__grid">

        <!-- ═══════ BRAND COLUMN ═══════ -->
        <div class="footer__brand">
          <div class="footer__brand-head">
            <span class="footer__logo" aria-hidden="true">
              <Icon name="gift" :size="26" :stroke-width="1.8" />
            </span>
            <span class="footer__brand-name">
              <strong>FA Fruits</strong>
              <span>Premium Gifting</span>
            </span>
          </div>

          <p class="footer__tagline">
            لا نبيع فاكهة... <em>نصمّم لحظة</em>. هدايا فواكه فاخرة
            تُحضَّر يوميًا وتوصل في نفس اليوم داخل الكويت.
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener"
            class="footer__social"
            aria-label="Instagram"
          >
            <Icon name="instagram" :size="19" />
          </a>
        </div>

        <!-- ═══════ SHOP COLUMN ═══════ -->
        <div class="footer__col">
          <h3 class="footer__col-title">تسوّق</h3>
          <ul class="footer__links">
            <li><NuxtLink to="/styles">حسب التصميم</NuxtLink></li>
            <li><NuxtLink to="/occasions">المناسبات</NuxtLink></li>
            <li><NuxtLink to="/collections">المجموعات</NuxtLink></li>
            <li><NuxtLink to="/gift-finder">هدية مثالية</NuxtLink></li>
            <li><NuxtLink to="/collections?filter=offers">العروض</NuxtLink></li>
          </ul>
        </div>

        <!-- ═══════ CUSTOMER SERVICE COLUMN ═══════ -->
        <div class="footer__col">
          <h3 class="footer__col-title">خدمة العملاء</h3>
          <ul class="footer__links">
            <li><NuxtLink to="/orders">طلباتي</NuxtLink></li>
            <li><NuxtLink to="/track">تتبع الطلب</NuxtLink></li>
            <li><NuxtLink to="/policy/delivery">سياسة التوصيل</NuxtLink></li>
            <li><NuxtLink to="/policy/returns">الاستبدال والإرجاع</NuxtLink></li>
          </ul>
        </div>

        <!-- ═══════ CONTACT COLUMN ═══════ -->
        <div class="footer__contact">
          <h3 class="footer__col-title">تواصل معنا</h3>

          <ul class="footer__contact-list">
            <li class="footer__contact-item">
              <Icon name="map-pin" :size="17" />
              <strong>السالمية، شارع سالم المبارك، الكويت</strong>
            </li>

            <li class="footer__contact-item">
              <Icon name="clock" :size="17" />
              <strong>يومياً ٩ص — ١١م</strong>
            </li>

            <li>
              <a
                :href="`tel:+${WHATSAPP_NUMBER}`"
                class="footer__contact-item"
              >
                <Icon name="phone" :size="17" />
                <strong dir="ltr">{{ WHATSAPP_NUMBER }}</strong>
              </a>
            </li>
          </ul>

          <span class="footer__knet" aria-label="مدفوعات KNET">
            <Icon name="credit-card" :size="14" />
            KNET
          </span>
        </div>

      </div>

      <!-- ═══════ BOTTOM BAR ═══════ -->
      <div class="site-footer__bottom">
        <p class="footer__copyright">
          © <strong>FA Fruits</strong> {{ currentYear }}
          <span>—</span> جميع الحقوق محفوظة
          <span>·</span> Luxury Fruit Gifting Platform
        </p>

        <button
          type="button"
          class="footer__scrolltop"
          aria-label="الرجوع إلى الأعلى"
          @click="scrollToTop"
        >
          <Icon name="arrow-up" :size="15" />
          الرجوع للأعلى
        </button>
      </div>

    </div>
  </footer>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   SITE FOOTER
   ═══════════════════════════════════════════════════════════ */
.site-footer {
  position: relative;
  background:
    radial-gradient(80% 60% at 100% 0%, rgba(110, 31, 46, 0.10) 0%, rgba(110, 31, 46, 0) 60%),
    radial-gradient(70% 60% at 0% 100%, rgba(168, 133, 91, 0.08) 0%, rgba(168, 133, 91, 0) 60%),
    linear-gradient(180deg, #1B1714 0%, #17130F 100%);
  color: #F7F2EC;
  overflow: hidden;
  isolation: isolate;
}

.site-footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(1280px, 92vw);
  height: 1px;
  background: linear-gradient(90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.14) 20%,
    rgba(255, 255, 255, 0.14) 80%,
    rgba(255, 255, 255, 0) 100%);
}

.site-footer__inner {
  width: min(1280px, 92vw);
  margin: 0 auto;
  position: relative;
  z-index: 2;
  padding: clamp(60px, 8vh, 100px) 0 clamp(28px, 4vh, 42px);
}

/* ═══ GRID ═══ */
.footer__grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
  gap: clamp(28px, 4vw, 60px);
  align-items: start;
  margin-bottom: clamp(48px, 6vh, 72px);
}

/* ═══ BRAND COLUMN ═══ */
.footer__brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 22px;
}

.footer__brand-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer__logo {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: linear-gradient(135deg, #8B2E3F 0%, #6E1F2E 100%);
  color: #fff;
  box-shadow:
    0 14px 32px -14px rgba(110, 31, 46, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.15) inset;
  flex-shrink: 0;
}

.footer__brand-name {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.footer__brand-name strong {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #FFF9F0;
}

.footer__brand-name span {
  font-family: 'Playfair Display', serif;
  font-size: 9.5px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: rgba(247, 242, 236, 0.55);
  margin-top: 4px;
}

.footer__tagline {
  margin: 0;
  font-size: 13.5px;
  line-height: 2;
  color: rgba(247, 242, 236, 0.62);
  max-width: 340px;
  font-weight: 400;
}

.footer__tagline em {
  font-family: 'Amiri', serif;
  font-style: normal;
  font-weight: 700;
  color: #D9A8B6;
}

.footer__social {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #FFF9F0;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  flex-shrink: 0;
}

.footer__social:hover {
  background: linear-gradient(135deg, #8B2E3F 0%, #6E1F2E 100%);
  border-color: transparent;
  transform: translateY(-3px);
  box-shadow: 0 16px 30px -14px rgba(110, 31, 46, 0.6);
}

/* ═══ LINK COLUMNS ═══ */
.footer__col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.footer__col-title {
  font-family: 'Playfair Display', serif;
  font-size: 15px;
  font-weight: 600;
  color: #FFF9F0;
  margin: 0;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  letter-spacing: 0.01em;
}

.footer__col-title::after {
  content: "";
  position: absolute;
  bottom: -1px;
  inset-inline-start: 0;
  width: 36px;
  height: 1.5px;
  background: linear-gradient(90deg, #D9A8B6, #8B2E3F);
  border-radius: 2px;
}

.footer__links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer__links a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 400;
  color: rgba(247, 242, 236, 0.62);
  text-decoration: none;
  transition: color 0.35s cubic-bezier(0.22, 1, 0.36, 1),
              padding-inline-start 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
}

.footer__links a::before {
  content: "";
  position: absolute;
  inset-inline-start: -10px;
  top: 50%;
  transform: translateY(-50%) scale(0);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #D9A8B6;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.footer__links a:hover {
  color: #FFF9F0;
  padding-inline-start: 6px;
}

.footer__links a:hover::before {
  transform: translateY(-50%) scale(1);
}

/* ═══ CONTACT COLUMN ═══ */
.footer__contact {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.footer__contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer__contact-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13.5px;
  color: rgba(247, 242, 236, 0.72);
  line-height: 1.7;
  text-decoration: none;
  transition: color 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.footer__contact-item:hover {
  color: #FFF9F0;
}

.footer__contact-item :deep(svg) {
  color: #D9A8B6;
  margin-top: 3px;
  flex-shrink: 0;
}

.footer__contact-item strong {
  display: block;
  font-weight: 400;
  color: inherit;
  font-size: 13.5px;
}

/* ═══ KNET ═══ */
.footer__knet {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-family: 'Playfair Display', serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: #FFF9F0;
  align-self: flex-start;
}

.footer__knet :deep(svg) {
  color: #D9A8B6;
}

/* ═══ BOTTOM BAR ═══ */
.site-footer__bottom {
  padding-top: clamp(24px, 3.5vh, 36px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.footer__copyright {
  margin: 0;
  font-size: 12.5px;
  color: rgba(247, 242, 236, 0.55);
  font-weight: 400;
  letter-spacing: 0.01em;
}

.footer__copyright strong {
  color: #FFF9F0;
  font-weight: 700;
  font-family: 'Playfair Display', serif;
  letter-spacing: 0.02em;
}

.footer__copyright span {
  color: #D9A8B6;
  margin: 0 8px;
}

.footer__scrolltop {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 11px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #FFF9F0;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.footer__scrolltop :deep(svg) {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.footer__scrolltop:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.28);
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -16px rgba(0, 0, 0, 0.5);
}

.footer__scrolltop:hover :deep(svg) {
  transform: translateY(-2px);
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════ */

/* Tablet — 1080px */
@media (max-width: 1080px) {
  .footer__grid {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  .footer__brand {
    grid-column: span 2;
    align-items: center;
    text-align: center;
  }

  .footer__tagline {
    margin-inline: auto;
  }

  .footer__social {
    align-self: center;
  }

  .footer__col-title::after {
    inset-inline-start: 50%;
    transform: translateX(-50%);
  }

  .footer__col {
    align-items: center;
    text-align: center;
  }

  .footer__contact {
    align-items: center;
    text-align: center;
  }

  .footer__contact-list {
    align-items: center;
  }

  .footer__contact-item {
    justify-content: center;
  }

  .footer__knet {
    align-self: center;
  }
}

/* Mobile — 560px */
@media (max-width: 560px) {
  /* .site-footer {
    margin-top: 40px;
    border-radius: 32px 32px 0 0;
  } */

  .site-footer__inner {
    padding: 50px 0 26px;
  }

  .footer__grid {
    grid-template-columns: 1fr;
    gap: 36px;
    margin-bottom: 40px;
  }

  .footer__brand {
    grid-column: span 1;
    align-items: center;
    text-align: center;
  }

  .footer__brand-head {
    flex-direction: column;
    gap: 14px;
  }

  .footer__brand-name {
    align-items: center;
  }

  .footer__tagline {
    max-width: 100%;
  }

  .footer__col {
    align-items: center;
    text-align: center;
  }

  .footer__col-title {
    width: 100%;
    text-align: center;
  }

  .footer__col-title::after {
    inset-inline-start: 50%;
    transform: translateX(50%);
  }

  .footer__links {
    align-items: center;
  }

  .footer__links a::before {
    display: none;
  }

  .footer__contact {
    align-items: center;
  }

  .footer__contact-list {
    align-items: center;
  }

  .footer__contact-item {
    justify-content: center;
  }

  .footer__knet {
    align-self: center;
  }

  .site-footer__bottom {
    flex-direction: column-reverse;
    text-align: center;
    gap: 20px;
  }

  .footer__scrolltop {
    width: 100%;
    justify-content: center;
  }

  .footer__copyright {
    font-size: 11.5px;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .footer__social,
  .footer__links a,
  .footer__links a::before,
  .footer__contact-item,
  .footer__scrolltop,
  .footer__scrolltop :deep(svg) {
    transition: none !important;
  }
}
</style>