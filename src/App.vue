<script setup>
import { ref, onMounted } from 'vue';

// Componentes Estructurales
import LeftSidebar from './components/LeftSidebar.vue';
import Navbar from './components/Navbar.vue';
import FooterSection from './components/FooterSection.vue';
import BookingModal from './components/BookingModal.vue';
import DoctorPortal from './components/DoctorPortal.vue';
import WhatsAppButton from './components/WhatsAppButton.vue';

// Estado de Colapso de la Barra Lateral Izquierda (con persistencia)
const isSidebarCollapsed = ref(localStorage.getItem('sidebar_collapsed') === 'true');

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  localStorage.setItem('sidebar_collapsed', isSidebarCollapsed.value ? 'true' : 'false');
};

// Estados reactivos globales
const isBookingOpen = ref(false);
const preselectedService = ref(null);
const isPortalOpen = ref(false);
const isDoctorLogged = ref(!!localStorage.getItem('dr_lisandro_jwt_token'));
const backendOnline = ref(true);

// Sistema de Alertas Toast
const toasts = ref([]);

const showToast = ({ msg, type = 'info' }) => {
  const id = Date.now();
  toasts.value.push({ id, msg, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 4000);
};

const openBookingWithService = (serviceId = null) => {
  preselectedService.value = serviceId;
  isBookingOpen.value = true;
};

// Verificar conexión con el backend Flask / PostgreSQL
onMounted(async () => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('http://127.0.0.1:5000/', { signal: controller.signal });
    clearTimeout(timer);
    backendOnline.value = res.ok;
  } catch (e) {
    backendOnline.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-sky-500 selection:text-white flex relative">
    
    <!-- 1. BARRA LATERAL IZQUIERDA (Sidebar Plegable/Desplegable con Rutas Reales) -->
    <LeftSidebar 
      :isCollapsed="isSidebarCollapsed"
      :isDoctorLogged="isDoctorLogged"
      @toggleCollapse="toggleSidebar"
      @openBooking="openBookingWithService(null)"
      @openPortal="isPortalOpen = true"
    />

    <!-- 2. CONTENEDOR DEL CONTENIDO PRINCIPAL CON MARGEN DINÁMICO ADAPTATIVO -->
    <div 
      class="flex-1 flex flex-col justify-between min-h-screen transition-all duration-300 ease-in-out min-w-0 w-full"
      :class="isSidebarCollapsed ? 'ml-20' : 'ml-64'"
      :style="{ marginLeft: isSidebarCollapsed ? '5rem' : '16rem' }"
    >
      <!-- Cabecera Superior (Navbar) -->
      <Navbar 
        :isDoctorLogged="isDoctorLogged"
        :backendOnline="backendOnline"
        @openBooking="openBookingWithService(null)"
        @openPortal="isPortalOpen = true"
      />

      <!-- Vistas Multi-página Renderizadas por vue-router -->
      <main class="flex-1 w-full">
        <router-view 
          @openBooking="openBookingWithService(null)"
          @selectServiceToBook="openBookingWithService"
        />
      </main>

      <!-- Pie de Página Institucional -->
      <FooterSection 
        @openPortal="isPortalOpen = true" 
      />
    </div>

    <!-- 3. Modal de Agendamiento de Citas (Conectado a PostgreSQL) -->
    <BookingModal 
      :isOpen="isBookingOpen"
      :preselectedServiceId="preselectedService"
      @close="isBookingOpen = false"
      @toast="showToast"
    />

    <!-- 4. Modal del Portal Médico Privado (Doctor / Secretaria) -->
    <DoctorPortal 
      :isOpen="isPortalOpen"
      @close="isPortalOpen = false"
      @loginSuccess="isDoctorLogged = true"
      @logoutSuccess="isDoctorLogged = false"
      @toast="showToast"
    />

    <!-- 5. Botón Flotante de WhatsApp Oficial (0424-1851027) -->
    <WhatsAppButton />

    <!-- 6. Sistema de Alertas Toast Flotantes -->
    <div class="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <div v-for="t in toasts" 
           :key="t.id"
           class="pointer-events-auto p-3.5 rounded-xl text-xs font-semibold shadow-xl border flex items-center justify-between gap-3 animate-fade-in"
           :class="{
             'bg-emerald-50 text-emerald-900 border-emerald-300': t.type === 'success',
             'bg-amber-50 text-amber-900 border-amber-300': t.type === 'warning',
             'bg-rose-50 text-rose-900 border-rose-300': t.type === 'danger',
             'bg-sky-50 text-sky-900 border-sky-300': t.type === 'info'
           }">
        <span>{{ t.msg }}</span>
        <button type="button" @click="toasts = toasts.filter(item => item.id !== t.id)" class="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer">
          &times;
        </button>
      </div>
    </div>

  </div>
</template>
