<script setup>
import { useRoute } from 'vue-router';
import doctorData from '../data/doctor.json';
import { currentUser, isAuthenticated, logout } from '../services/auth';

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  },
  isDoctorLogged: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggleCollapse', 'openBooking', 'openPortal', 'openPatientPortal', 'openLogin', 'toast']);

const handleLogout = () => {
  logout();
  emit('toast', { msg: 'Sesión de Google cerrada correctamente', type: 'info' });
};

const route = useRoute();

const navItems = [
  {
    to: '/',
    label: 'Inicio',
    shortLabel: 'Inicio',
    svg: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  {
    to: '/especialista',
    label: 'El Especialista',
    shortLabel: 'Doctor',
    svg: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  {
    to: '/guia-medica',
    label: 'Guía Médica',
    shortLabel: 'Guía',
    svg: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
  },
  {
    to: '/servicios',
    label: 'Servicios',
    shortLabel: 'Servicios',
    svg: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    to: '/test-prostata',
    label: 'Salud Masculina',
    shortLabel: 'Tests',
    svg: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
  },
  {
    to: '/citas',
    label: 'Sedes y Citas',
    shortLabel: 'Sedes',
    svg: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z'
  }
];

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};
</script>

<template>
  <aside 
    aria-label="Barra Lateral de Navegación Principal"
    class="fixed top-0 left-0 h-screen z-40 bg-white border-r border-slate-200/90 shadow-lg flex flex-col justify-between transition-all duration-300 ease-in-out select-none overflow-x-hidden"
    :class="isCollapsed ? 'w-20' : 'w-64'"
    :style="{ width: isCollapsed ? '5rem' : '16rem' }"
  >
    <!-- Encabezado del Menú Lateral -->
    <div>
      <div class="h-20 flex items-center border-b border-slate-100 transition-all px-4"
           :class="isCollapsed ? 'justify-center' : 'justify-between'">
        
        <!-- Branding (Visible cuando está desplegado) -->
        <router-link to="/" v-if="!isCollapsed" class="flex items-center gap-3 overflow-hidden group">
          <div class="w-10 h-10 rounded-xl bg-[#0EA5E9] text-white flex items-center justify-center shadow-md shadow-sky-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; color: #ffffff;">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-extrabold text-slate-900 leading-tight truncate">Dr. L. Márquez</span>
            <span class="text-[10px] font-bold text-sky-600 uppercase tracking-wide">Urólogo</span>
          </div>
        </router-link>

        <!-- Botón Minimalista de Plegar/Desplegar (Toggle) -->
        <button
          type="button"
          @click="$emit('toggleCollapse')"
          class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-600 text-slate-500 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
          :title="isCollapsed ? 'Expandir barra lateral' : 'Plegar barra lateral'"
        >
          <!-- Flecha de toggle animada -->
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            class="transition-transform duration-300"
            :class="isCollapsed ? 'rotate-180' : 'rotate-0'"
            style="width: 16px; height: 16px;"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

      </div>

      <!-- Lista de Enlaces de Navegación Multi-página -->
      <nav class="p-3 space-y-1.5">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="group relative flex items-center rounded-xl transition-all duration-200 cursor-pointer overflow-hidden"
          :class="[
            isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3',
            isActive(item.to)
              ? 'bg-[#0F172A] text-white shadow-md shadow-slate-900/20'
              : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/80'
          ]"
          :title="item.label"
        >
          <!-- Icono Vectorial Seguro -->
          <div class="flex items-center gap-3 min-w-0">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
              class="flex-shrink-0 transition-transform group-hover:scale-110"
              :class="isActive(item.to) ? 'text-sky-400' : 'text-slate-500 group-hover:text-sky-600'"
              style="width: 20px; height: 20px;"
            >
              <path :d="item.svg" />
            </svg>

            <!-- Etiqueta de Texto (Visible cuando está desplegado) -->
            <span v-if="!isCollapsed" class="text-xs font-bold tracking-tight truncate">
              {{ item.label }}
            </span>
          </div>

          <!-- Badge o Indicador Activo (Cuando está desplegado) -->
          <div v-if="!isCollapsed" class="flex items-center flex-shrink-0 ml-2">
            <span 
              v-if="isActive(item.to)"
              class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"
            ></span>
            <span 
              v-else-if="item.badge"
              class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-700"
            >
              {{ item.badge }}
            </span>
          </div>

          <!-- Tooltip Flotante al estar Plegado -->
          <div 
            v-if="isCollapsed"
            class="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0F172A] text-white text-xs font-bold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap"
          >
            {{ item.label }}
          </div>
        </router-link>
      </nav>
    </div>

    <!-- Parte Inferior del Sidebar: Botones de Acción Rápidos -->
    <div class="p-3 border-t border-slate-100 space-y-2">
      
      <!-- Botón Portal del Paciente / Mis Citas con Google -->
      <div v-if="isAuthenticated" class="flex items-center gap-1.5" :class="isCollapsed ? 'flex-col' : ''">
        <button
          type="button"
          @click="$emit('openPatientPortal')"
          class="flex-1 flex items-center justify-center rounded-xl font-bold transition-all text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-300 cursor-pointer overflow-hidden"
          :class="isCollapsed ? 'p-2.5 w-full' : 'py-2 px-2.5 text-xs gap-2 min-w-0'"
          :title="isCollapsed ? `${currentUser?.nombre || 'Paciente'} (Mis Citas)` : 'Ver mis citas'"
        >
          <img 
            v-if="currentUser?.foto_url || currentUser?.foto_perfil" 
            :src="currentUser.foto_url || currentUser.foto_perfil" 
            alt="Avatar" 
            class="w-4 h-4 rounded-full object-cover shrink-0 border border-sky-300"
          />
          <span v-else class="w-4 h-4 rounded-full bg-sky-600 text-white text-[9px] flex items-center justify-center font-black shrink-0">
            {{ currentUser?.nombre?.charAt(0) || 'P' }}
          </span>
          <span v-if="!isCollapsed" class="truncate font-semibold text-[11px]">
            {{ currentUser?.nombre?.split(' ')[0] || 'Mis Citas' }}
          </span>
        </button>

        <button
          type="button"
          @click="handleLogout"
          class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition cursor-pointer shrink-0"
          title="Cerrar sesión de Google"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      <!-- Si NO está autenticado, muestra el botón Iniciar Sesión con Google -->
      <button
        v-else
        type="button"
        @click="$emit('openLogin')"
        class="w-full flex items-center justify-center rounded-xl font-bold transition-all text-slate-700 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 cursor-pointer"
        :class="isCollapsed ? 'p-3' : 'py-2.5 px-3 text-xs gap-2'"
        :title="isCollapsed ? 'Iniciar Sesión con Google' : ''"
      >
        <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span v-if="!isCollapsed" class="truncate">
          Iniciar Sesión
        </span>
      </button>

      <!-- Botón Agendar Cita con Color Sólido Determinista #0EA5E9 -->
      <button
        type="button"
        @click="$emit('openBooking')"
        class="w-full flex items-center justify-center rounded-xl font-bold text-white bg-[#0EA5E9] hover:bg-[#0284C7] shadow-md shadow-sky-500/25 transition-all cursor-pointer"
        :class="isCollapsed ? 'p-3' : 'py-3 px-4 text-xs gap-2'"
        :title="isCollapsed ? 'Agendar Cita' : ''"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; color: #ffffff;">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
          <line x1="16" x2="16" y1="2" y2="6"/>
          <line x1="8" x2="8" y1="2" y2="6"/>
          <line x1="3" x2="21" y1="10" y2="10"/>
        </svg>
        <span v-if="!isCollapsed" class="truncate">Agendar Cita</span>
      </button>

    </div>
  </aside>
</template>
