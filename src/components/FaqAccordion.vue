<script setup>
import { ref } from 'vue';
import faqData from '../data/faq.json';

const activeIndex = ref(0);

const toggleFaq = (index) => {
  activeIndex.value = activeIndex.value === index ? -1 : index;
};
</script>

<template>
  <section id="faq" class="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      
      <div class="text-center max-w-2xl mx-auto mb-14">
        <span class="text-sky-600 text-xs font-extrabold uppercase tracking-widest block mb-2">Dudas Frecuentes</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">Preguntas Frecuentes</h2>
        <p class="text-slate-600 text-sm">Aclaramos de forma sencilla las inquietudes habituales sobre las consultas urológicas.</p>
      </div>

      <div class="space-y-3.5">
        <div v-for="(item, idx) in faqData" 
             :key="idx" 
             class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs transition"
             :class="{ 'border-sky-500 shadow-md': activeIndex === idx }">
          
          <button type="button" 
                  @click="toggleFaq(idx)" 
                  class="w-full text-left p-4 sm:p-5 font-bold text-slate-900 hover:text-sky-600 transition flex justify-between items-center text-sm sm:text-base gap-4">
            <span>{{ item.pregunta }}</span>
            <span class="text-xl text-sky-600 transform transition-transform duration-200" :class="{ 'rotate-45': activeIndex === idx }">
              +
            </span>
          </button>

          <div v-if="activeIndex === idx" class="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fade-in">
            {{ item.respuesta }}
          </div>

        </div>
      </div>

    </div>
  </section>
</template>
