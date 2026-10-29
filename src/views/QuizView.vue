<script setup>
import { ref } from 'vue';
import ProstateQuiz from '../components/ProstateQuiz.vue';
import MaleHealthQuiz from '../components/MaleHealthQuiz.vue';

defineEmits(['openBooking', 'selectServiceToBook']);

const currentTab = ref('prostate'); // 'prostate' | 'male-health'
</script>

<template>
  <div class="animate-fade-in">
    <!-- Banner de Encabezado de Página -->
    <div class="bg-medical-banner bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white py-12 border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center gap-2 text-xs text-sky-300 font-semibold mb-2">
          <router-link to="/" class="hover:underline text-sky-300">Inicio</router-link>
          <span>/</span>
          <span class="text-white">Autoevaluación Urológica</span>
        </div>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          Centro de Autoevaluación Urológica & Andrológica
        </h1>
        <p class="text-xs sm:text-sm text-sky-200 mt-1">
          Tests clínicos validados internacionalmente de forma 100% confidencial y anónima
        </p>
      </div>
    </div>

    <!-- Selector de Test (Pestañas Superiores) -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-2">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
        
        <!-- Pestaña 1: Próstata (IPSS) -->
        <button
          type="button"
          @click="currentTab = 'prostate'"
          class="flex items-center gap-3.5 p-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer text-left"
          :class="[
            currentTab === 'prostate'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          ]"
        >
          <span class="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl flex-shrink-0">
            🩺
          </span>
          <div>
            <span class="block text-xs sm:text-sm font-black">Salud Prostática (IPSS)</span>
            <span class="block text-[11px] font-medium text-slate-500">Chorro débil, frecuencia nocturna y urgencia</span>
          </div>
        </button>

        <!-- Pestaña 2: Salud Masculina (IIEF-5) -->
        <button
          type="button"
          @click="currentTab = 'male-health'"
          class="flex items-center gap-3.5 p-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer text-left"
          :class="[
            currentTab === 'male-health'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          ]"
        >
          <span class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl flex-shrink-0">
            🛡️
          </span>
          <div>
            <span class="block text-xs sm:text-sm font-black">Salud Masculina (IIEF-5)</span>
            <span class="block text-[11px] font-medium text-slate-500">Firmeza eréctil y bienestar andrológico</span>
          </div>
        </button>

      </div>
    </div>

    <!-- Contenido Dinámico según la pestaña activa -->
    <div class="transition-all duration-300">
      <!-- Test 1: Próstata IPSS -->
      <ProstateQuiz 
        v-if="currentTab === 'prostate'"
        @openBookingWithService="$emit('selectServiceToBook', $event)" 
      />

      <!-- Test 2: Salud Masculina IIEF-5 (Propuesta 5) -->
      <MaleHealthQuiz 
        v-else
        @openBookingWithService="$emit('selectServiceToBook', $event)" 
      />
    </div>

  </div>
</template>
