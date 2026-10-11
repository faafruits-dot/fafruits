<script setup lang="ts">
import { WHATSAPP_NUMBER } from '~/data/seed'
</script>

<template>
  <section class="page-head">
    <div class="wrap">
      <div class="crumbs"><NuxtLink to="/">الرئيسية</NuxtLink> / الاستبدال والإرجاع</div>
      <h1>سياسة الاستبدال والإرجاع</h1>
      <p>نلتزم بجودة كل هدية — ونوضّح لك سياستنا بشفافية كاملة</p>
    </div>
  </section>

  <section class="sec" style="padding-top:20px">
    <div class="wrap">
      <div class="policy-alert">
        <span class="policy-alert-icon"><Icon name="alert-circle" /></span>
        <div>
          <h3>لا يُقبل الإرجاع بعد الاستلام</h3>
          <p>نظرًا لطبيعة منتجاتنا (فواكه طازجة وسريعة التلف)، <b>لا يمكن إرجاع الطلب بعد استلامه</b>. لكن نضمن لك <b>الاستبدال الكامل</b> في حال وجود أي خلل بالجودة.</p>
        </div>
      </div>

      <div class="policy-grid">
        <div class="policy-card policy-card-good">
          <span class="policy-icon policy-icon-good"><Icon name="shield-check" /></span>
          <h4>ضمان الجودة</h4>
          <ul class="policy-list">
            <li>نختار الفواكه يدويًا صباح كل يوم</li>
            <li>فحص جودة قبل التغليف وقبل التوصيل</li>
            <li>تغليف مبرّد يحافظ على الطزاجة</li>
          </ul>
        </div>

        <div class="policy-card">
          <span class="policy-icon"><Icon name="refresh-cw" /></span>
          <h4>متى يحق الاستبدال؟</h4>
          <ul class="policy-list">
            <li>وصول المنتج تالفًا أو غير صالح</li>
            <li>فواكه غير طازجة بشكل واضح</li>
            <li>خطأ في المنتج أو التصميم المطلوب</li>
            <li>نقص في المكونات المتفق عليها</li>
          </ul>
        </div>

        <div class="policy-card">
          <span class="policy-icon"><Icon name="clock" /></span>
          <h4>نافذة الإبلاغ</h4>
          <ul class="policy-list">
            <li>خلال <b>ساعتين</b> من استلام الطلب</li>
            <li>يجب إرفاق صور واضحة للمنتج</li>
            <li>سيتم مراجعة الحالة فورًا</li>
            <li>قرار الاستبدال خلال ٣٠ دقيقة</li>
          </ul>
        </div>

        <div class="policy-card">
          <span class="policy-icon"><Icon name="camera" /></span>
          <h4>كيف أطلب استبدالًا؟</h4>
          <ul class="policy-list">
            <li>صوّر المنتج فورًا من أكثر من زاوية</li>
            <li>أرسل الصور + رقم الطلب على واتساب</li>
            <li>اذكر وصفًا موجزًا للمشكلة</li>
            <li>سنرد عليك خلال دقائق</li>
          </ul>
        </div>

        <div class="policy-card">
          <span class="policy-icon"><Icon name="x-circle" /></span>
          <h4>حالات لا يُقبل فيها الاستبدال</h4>
          <ul class="policy-list">
            <li>بعد مرور أكثر من ساعتين على الاستلام</li>
            <li>سوء الحفظ بعد الاستلام</li>
            <li>تغيّر الرأي أو عدم الحاجة للمنتج</li>
            <li>طلبات اليوم (VIP) بعد تأكيد التحضير</li>
          </ul>
        </div>

        <div class="policy-card">
          <span class="policy-icon"><Icon name="truck" /></span>
          <h4>طريقة الاستبدال</h4>
          <ul class="policy-list">
            <li>استبدال مجاني بالكامل (بدون رسوم توصيل)</li>
            <li>إعادة تحضير الطلب وتوصيله خلال ٢٤ ساعة</li>
            <li>أو استرداد كامل للمبلغ حسب اختيارك</li>
          </ul>
        </div>
      </div>

      <div class="policy-cta">
        <h3>واجهت مشكلة في طلبك؟</h3>
        <p>راسلنا على واتساب مع صورة المنتج ورقم الطلب — وسنعالج الأمر فورًا.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
          <a class="btn btn-whatsapp btn-lg" :href="`https://wa.me/${WHATSAPP_NUMBER}`" target="_blank">
            <Icon name="message-circle" /> تواصل معنا
          </a>
          <NuxtLink to="/orders" class="btn btn-ghost btn-lg">
            <Icon name="package" /> عرض طلباتي
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>