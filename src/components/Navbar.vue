<script setup>
import doctorData from '../data/doctor.json';
import { currentUser, isAuthenticated } from '../services/auth';

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

defineEmits(['openBooking', 'openPortal', 'openPatientPortal', 'openLogin']);
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
          </div>
          <p class="text-xs sm:text-sm font-medium text-slate-500 leading-tight">
            Cirujano General • Urólogo (UCV)
          </p>
        </div>
      </router-link>

      <!-- Lado Derecho: Acceso Paciente + Contacto + CTAs -->
      <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        
        <!-- ESTADO 1: Paciente CON sesión iniciada -> Muestra botón oficial de "Mis Citas / Historial" -->
        <div v-if="isAuthenticated" class="flex items-center gap-2">
          <button 
            type="button"
            @click="$emit('openPatientPortal')"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 text-xs font-bold transition shadow-xs cursor-pointer"
            title="Abrir Mi Historial de Citas"
          >
            <img 
              v-if="currentUser?.foto_url" 
              :src="currentUser.foto_url" 
              alt="Avatar" 
              class="w-5 h-5 rounded-full object-cover border border-sky-300"
            />
            <span v-else class="w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center font-black">
              {{ currentUser?.nombre?.charAt(0) || 'P' }}
            </span>
            <span class="max-w-[110px] sm:max-w-[140px] truncate">{{ currentUser?.nombre?.split(' ')[0] || 'Mi Cuenta' }}</span>
            <span class="text-[10px] text-sky-700 font-extrabold bg-sky-200/70 px-1.5 py-0.5 rounded-md">Mis Citas</span>
          </button>
        </div>

        <!-- ESTADO 2: Paciente SIN sesión iniciada -> Muestra "Iniciar Sesión" (NUNCA abre el historial antes de iniciar cuenta) -->
        <button 
          v-else
          type="button"
          @click="$emit('openLogin')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 hover:border-sky-300 transition cursor-pointer"
          title="Iniciar sesión con Google para ver citas"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span class="hidden sm:inline">Iniciar Sesión</span>
          <span class="sm:hidden">Acceso</span>
        </button>

        <!-- Botón Agendar Cita Destacado -->
        <button type="button" 
                @click="$emit('openBooking')"
                class="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0EA5E9] hover:bg-[#0284C7] shadow-md shadow-sky-500/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; color: #ffffff;">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>Agendar Cita</span>
        </button>

      </div>

    </div>
  </header>
</template>
