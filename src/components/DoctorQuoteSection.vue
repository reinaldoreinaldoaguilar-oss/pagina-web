<script setup>
import doctorData from '../data/doctor.json';

defineEmits(['openBooking']);
</script>

<template>
  <section class="py-16 lg:py-20 bg-[#F8FAFC] border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      
      <div class="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div class="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <!-- Imagen del Doctor en Quirófano con la Frase -->
          <div class="lg:col-span-5 p-4 sm:p-6 lg:p-8">
            <div class="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 group bg-slate-900">
              <img 
                :src="doctorData.foto_frase" 
                alt="Dr. Lisandro Márquez en Quirófano - Urología"
                class="w-full h-auto max-h-[560px] object-cover object-center group-hover:scale-102 transition-transform duration-500"
                loading="lazy"
              />
              
              <!-- Badge Flotante Superior Quirófano -->
              <div class="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold py-1.5 px-3 rounded-full border border-white/20 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Quirófano & Procedimientos Láser</span>
              </div>
            </div>
          </div>

          <!-- Texto y Filosofía Médica -->
          <div class="lg:col-span-7 p-6 sm:p-8 lg:pr-12 lg:pl-0 flex flex-col items-start">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-sky-50 text-sky-700 border border-sky-200 mb-3">
              Compromiso con tu Salud
            </span>

            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              "Tu salud es lo primero. No dejes que un pequeño problema se convierta en algo grande."
            </h2>

            <p class="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              El <strong>{{ doctorData.nombre }}</strong> destaca la importancia de acudir a una valoración a tiempo. Muchas patologías urológicas —desde molestias urinarias y cálculos renales hasta temas prostáticos— son mucho más sencillas y rápidas de resolver cuando se atienden en su etapa inicial.
            </p>

            <!-- 2 Puntos Clave de Confianza -->
            <div class="grid sm:grid-cols-2 gap-3.5 mb-8 w-full">
              <div class="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div class="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <strong class="text-xs sm:text-sm text-slate-900 block font-bold">Diagnóstico Preciso:</strong>
                  <span class="text-xs text-slate-600 leading-relaxed">Evaluación integral con 3 Ecos en una misma consulta.</span>
                </div>
              </div>

              <div class="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div class="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <strong class="text-xs sm:text-sm text-slate-900 block font-bold">Mínima Invasión:</strong>
                  <span class="text-xs text-slate-600 leading-relaxed">Cirugía láser y endoscópica sin cicatrices abiertas.</span>
                </div>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="flex flex-wrap gap-3.5 w-full sm:w-auto">
              <button 
                type="button" 
                @click="$emit('openBooking')"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0EA5E9] hover:bg-[#0284C7] shadow-md shadow-sky-500/25 transition-all cursor-pointer">
                <span>📅</span>
                <span>¡Agenda tu Consulta Hoy!</span>
              </button>

              <a 
                :href="`https://wa.me/${doctorData.whatsapp}?text=Hola%20Dr.%20Lisandro%20M%C3%A1rquez,%20le%C3%AD%20su%20mensaje%20sobre%20la%20prevenci%C3%B3n%20y%20deseo%20agendar%20una%20consulta.`" 
                target="_blank" 
                rel="noopener noreferrer"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-xs transition-all cursor-pointer">
                <span>💬</span>
                <span>WhatsApp: {{ doctorData.telefono_display }}</span>
              </a>
            </div>

          </div>

        </div>
      </div>

    </div>
  </section>
</template>
