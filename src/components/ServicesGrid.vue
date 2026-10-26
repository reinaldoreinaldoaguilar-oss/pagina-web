<script setup>
import { ref, onMounted } from 'vue';
import fallbackServices from '../data/servicios.json';

defineEmits(['selectServiceToBook']);

const servicios = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/servicios');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        servicios.value = data;
        loading.value = false;
        return;
      }
    }
  } catch (error) {
    console.warn('Backend offline, cargando catálogo JSON de servicios.');
  }
  servicios.value = fallbackServices;
  loading.value = false;
});
</script>

<template>
  <section id="servicios" class="py-16 lg:py-24 bg-white border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      
      <!-- Encabezado -->
      <div class="text-center max-w-3xl mx-auto mb-14">
        <span class="text-sky-600 text-xs font-extrabold uppercase tracking-widest block mb-2">
          Catálogo Clínico
        </span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
          Procedimientos y Servicios Especializados
        </h2>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
          Atención médica de alta precisión respaldada por tecnología diagnóstica de última generación y protocolos universitarios actualizados.
        </p>
      </div>

      <!-- Grilla de Servicios -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(srv, idx) in servicios" 
             :key="srv.id || idx"
             class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-xs">
                0{{ idx + 1 }}
              </span>
              <span v-if="srv.badge" class="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {{ srv.badge }}
              </span>
            </div>

            <h3 class="text-lg font-bold text-slate-900 mb-2.5 leading-snug">
              {{ srv.nombre_servicio || srv.nombre }}
            </h3>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              {{ srv.descripcion || 'Evaluación personalizada con el Dr. Lisandro Márquez en Caracas, Guatire o Barlovento.' }}
            </p>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Previa Cita</span>
            <button type="button" 
                    @click="$emit('selectServiceToBook', srv.id)"
                    class="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1">
              <span>Agendar este Servicio</span>
              <span>→</span>
            </button>
          </div>

        </div>
      </div>

      <!-- CTA Inferior -->
      <div class="text-center mt-12">
        <p class="text-xs sm:text-sm text-slate-500 mb-3">¿Deseas una valoración clínica general de tu caso?</p>
        <button type="button" 
                @click="$emit('selectServiceToBook', 1)"
                class="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition">
          📅 Agendar Evaluación Urológica Completa (Con 3 Ecos)
        </button>
      </div>

    </div>
  </section>
</template>
