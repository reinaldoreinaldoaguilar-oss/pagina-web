<script setup>
import DoctorProfile from '../components/DoctorProfile.vue';
import Testimonials from '../components/Testimonials.vue';

defineEmits(['openBooking']);
</script>

<template>
  <div class="animate-fade-in">
    <!-- Banner de Encabezado de Página -->
    <div class="bg-medical-banner bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white py-12 border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center gap-2 text-xs text-sky-300 font-semibold mb-2">
          <router-link to="/" class="hover:underline text-sky-300">Inicio</router-link>
          <span>/</span>
          <span class="text-white">El Especialista</span>
        </div>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          Dr. Lisandro Márquez
        </h1>
        <p class="text-xs sm:text-sm text-sky-200 mt-1">
          Médico Cirujano (UNERG) • Cirujano General (UCV) • Urólogo (UCV)
        </p>
      </div>
    </div>

    <!-- Perfil y Trayectoria -->
    <DoctorProfile />

    <!-- Testimonios -->
    <Testimonials />
  </div>
</template>
