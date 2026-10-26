<script setup>
import testimoniosData from '../data/testimonios.json';
</script>

<template>
  <section id="testimonios" class="py-16 lg:py-24 bg-white border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      
      <div class="text-center max-w-2xl mx-auto mb-14">
        <span class="text-sky-600 text-xs font-extrabold uppercase tracking-widest block mb-2">Experiencias Reales</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">La Confianza de Nuestros Pacientes</h2>
        <p class="text-slate-600 text-sm">Opiniones verificadas de pacientes atendidos por el Dr. Lisandro Márquez.</p>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <div v-for="t in testimoniosData" :key="t.id" class="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div class="text-amber-400 text-base mb-3">★★★★★</div>
            <p class="text-slate-600 text-sm italic leading-relaxed mb-6">
              "{{ t.texto }}"
            </p>
          </div>
          <div class="pt-4 border-t border-slate-100 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {{ t.nombre.split(' ').map(n => n[0]).join('') }}
            </div>
            <div>
              <strong class="text-xs sm:text-sm text-slate-900 block font-bold">{{ t.nombre }}</strong>
              <span class="text-[11px] text-slate-500">{{ t.tratamiento }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>
