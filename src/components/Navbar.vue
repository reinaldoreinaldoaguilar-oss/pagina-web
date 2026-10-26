<script setup>
import doctorData from '../data/doctor.json';

defineProps({
  isDoctorLogged: {
    type: Boolean,
    default: false
  },
  backendOnline: {
    type: Boolean,
    default: true
  }
});

defineEmits(['openBooking', 'openPortal']);
</script>

<template>
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
      
      <!-- Lado Izquierdo: Nombre Imponente y Especialidades en Gris -->
      <router-link 
        to="/" 
        class="flex items-center gap-3.5 group cursor-pointer flex-shrink-0"
        title="Volver al Inicio"
      >
        <!-- Icono Médico con Color Sólido Determinista #0EA5E9 -->
        <div class="w-11 h-11 rounded-xl bg-[#0EA5E9] text-white flex items-center justify-center shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 22px; height: 22px; color: #ffffff;">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </div>

        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <h1 class="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-sky-600 transition-colors">
              {{ doctorData.nombre }}
            </h1>
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              UCV
            </span>
          </div>
          <p class="text-xs sm:text-sm font-medium text-slate-500 leading-tight">
            Cirujano General • Urólogo (UCV)
          </p>
        </div>
      </router-link>

      <!-- Lado Derecho: Datos de Contacto Estilizados (Instagram y WhatsApp con Iconos) + CTAs -->
      <div class="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
        
        <!-- Instagram Estilizado -->
        <a :href="doctorData.instagram_url" 
           target="_blank" 
           rel="noopener noreferrer"
           class="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-pink-50 hover:text-pink-600 border border-slate-200 hover:border-pink-200 transition-colors"
           title="Instagram del Dr. Lisandro Márquez">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" class="text-pink-500" style="width: 15px; height: 15px;">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span>{{ doctorData.instagram }}</span>
        </a>

        <!-- WhatsApp Estilizado -->
        <a :href="`https://wa.me/${doctorData.whatsapp}?text=Hola%20Dr.%20Lisandro%20M%C3%A1rquez,%20deseo%20informaci%C3%B3n%20para%20una%20consulta`" 
           target="_blank" 
           rel="noopener noreferrer"
           class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-colors"
           title="WhatsApp directo de citas">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" class="text-emerald-500" style="width: 15px; height: 15px;">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span class="hidden sm:inline">WhatsApp:</span>
          <span>{{ doctorData.telefono_display }}</span>
        </a>

        <!-- Botón Portal Doctor -->
        <button type="button" 
                @click="$emit('openPortal')"
                class="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>{{ isDoctorLogged ? 'Panel Activo' : 'Portal Doctor' }}</span>
        </button>

        <!-- Botón Agendar Cita Destacado con Color Sólido Determinista #0EA5E9 -->
        <button type="button" 
                @click="$emit('openBooking')"
                class="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0EA5E9] hover:bg-[#0284C7] shadow-md shadow-sky-500/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; color: #ffffff;">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          <span>Agendar Cita</span>
        </button>

      </div>

    </div>
  </header>
</template>
