<script setup>
import Hero from '../components/Hero.vue';
import Testimonials from '../components/Testimonials.vue';

defineEmits(['openBooking']);
</script>

<template>
  <div class="animate-fade-in">
    <!-- Hero Principal -->
    <Hero @openBooking="$emit('openBooking')" />

    <!-- Sección de Bienvenida & Accesos a las Páginas Principales -->
    <section class="py-16 bg-white border-b border-slate-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-sky-50 text-sky-700 border border-sky-200 mb-3">
          Atención Urológica de Confianza
        </span>
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          ¿Por qué consultar con el Dr. Lisandro Márquez?
        </h2>
        <p class="text-slate-600 leading-relaxed text-sm sm:text-base mb-8">
          Formado en la prestigiosa <strong>Universidad Central de Venezuela (UCV)</strong> y la <strong>UNERG</strong>, el Dr. Márquez combina rigurosidad académica universitaria con tecnología de última generación para ofrecer diagnósticos certeros, chequeo preventivo con 3 Ecos y procedimientos mínimamente invasivos sin heridas abiertas.
        </p>
        
        <div class="flex flex-wrap justify-center gap-3.5">
          <router-link to="/especialista" class="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all cursor-pointer">
            <span>👨‍⚕️</span>
            <span>Trayectoria UCV / UNERG</span>
          </router-link>
          
          <router-link to="/guia-medica" class="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all cursor-pointer">
            <span>📖</span>
            <span>Guía Médica al Paciente</span>
          </router-link>
          
          <router-link to="/servicios" class="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0EA5E9] hover:bg-[#0284C7] shadow-md shadow-sky-500/25 transition-all cursor-pointer">
            <span>🩺</span>
            <span>Evaluación con 3 Ecos</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Testimonios de Pacientes -->
    <Testimonials />
  </div>
</template>
