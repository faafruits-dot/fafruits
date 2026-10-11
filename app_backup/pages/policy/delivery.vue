<script setup lang="ts">
import { WHATSAPP_NUMBER } from '~/data/seed'
</script>

<template>
  <section class="page-head">
    <div class="wrap">
      <div class="crumbs"><NuxtLink to="/">الرئيسية</NuxtLink> / سياسة التوصيل</div>
      <h1>سياسة التوصيل</h1>
      <p>كل ما تحتاج معرفته عن وصول هديتك — بأسرع وقت وبأعلى جودة</p>
    </div>
  </section>

  <section class="sec" style="padding-top:20px">
    <div class="wrap">
      <div class="policy-highlight">
        <span class="policy-highlight-icon"><i data-lucide="zap" /></span>
        <div>
          <h3>توصيل في نفس اليوم</h3>
          <p>نوفّر خدمة التوصيل الفوري داخل الكويت — اطلب قبل الساعة ٦ مساءً ويصلك طلبك خلال ساعات.</p>
        </div>
      </div>

      <div class="policy-grid">
        <div class="policy-card">
          <span class="policy-icon"><i data-lucide="clock" /></span>
          <h4>ساعات التوصيل</h4>
          <ul class="policy-list">
            <li>يوميًا من ١٠ صباحًا حتى ١١ مساءً</li>
            <li>الجمعة: من ٢ ظهرًا حتى ١١ مساءً</li>
            <li>آخر موعد لطلب نفس اليوم: ٦ مساءً</li>
          </ul>
        </div>

        <div class="policy-card">
          <span class="policy-icon"><i data-lucide="wallet" /></span>
          <h4>رسوم التوصيل</h4>
          <ul class="policy-list">
            <li>١ د.ك لكل طلب داخل الكويت</li>
            <li>التوصيل <b>مجاني</b> للطلبات فوق ٤٠ د.ك</li>
            <li>لا توجد رسوم إضافية للمناطق البعيدة</li>
          </ul>
        </div>

        <div class="policy-card">
          <span class="policy-icon"><i data-lucide="map-pin" /></span>
          <h4>المناطق المغطاة</h4>
          <ul class="policy-list">
            <li>جميع مناطق الكويت</li>
            <li>السالمية، حولي، الجابرية، الفنطاس</li>
            <li>الفروانية، الأحمدي، الجهراء</li>
            <li>العاصمة والمناطق المحيطة</li>
          </ul>
        </div>

        <div class="policy-card">
          <span class="policy-icon"><i data-lucide="calendar-clock" /></span>
          <h4>فترات التوصيل</h4>
          <ul class="policy-list">
            <li>١٠ص — ١م (صباحي)</li>
            <li>١م — ٤م (بعد الظهر)</li>
            <li>٤م — ٧م (مسائي)</li>
            <li>٧م — ١٠م (ليلي)</li>
          </ul>
        </div>

        <div class="policy-card">
          <span class="policy-icon"><i data-lucide="package" /></span>
          <h4>التغليف</h4>
          <ul class="policy-list">
            <li>تغليف هدايا فاخر مشمول بالكامل</li>
            <li>علب مبرّدة للحفاظ على الطزاجة</li>
            <li>بطاقة الإهداء ضمن الطلب</li>
          </ul>
        </div>

        <div class="policy-card">
          <span class="policy-icon"><i data-lucide="store" /></span>
          <h4>الاستلام من الفرع</h4>
          <ul class="policy-list">
            <li>السالمية، شارع سالم المبارك</li>
            <li>متاح بدون رسوم إضافية</li>
            <li>يحتاج تأكيد مسبق عبر واتساب</li>
          </ul>
        </div>
      </div>

      <div class="policy-cta">
        <h3>لديك سؤال عن التوصيل؟</h3>
        <p>فريقنا جاهز للإجابة على أي استفسار خلال دقائق.</p>
        <a class="btn btn-whatsapp btn-lg" :href="`https://wa.me/${WHATSAPP_NUMBER}`" target="_blank">
          <i data-lucide="message-circle" /> تواصل معنا عبر واتساب
        </a>
      </div>
    </div>
  </section>
</template>