<template>
  <a
    :href="whatsappUrl"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Contactar por WhatsApp para agendar cita o resolver dudas"
    class="fixed bottom-6 right-6 z-50 flex items-center justify-center p-4 bg-medical-500 text-white rounded-full shadow-xl transition-all duration-300 hover:bg-medical-800 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-medical-500/50"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  </a>
</template>

<script setup>
import { computed } from 'vue'

// CONFIGURACIÓN: Cambia esto por el número real del consultorio en Valencia.
// Debe incluir el código de país sin el símbolo "+". Ejemplo Venezuela: 584120000000
const phoneNumber = "584120000000" 
const message = "Hola, me gustaría solicitar información para agendar una consulta oncológica con el Dr. Lisandro Márquez."

const whatsappUrl = computed(() => {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
})
</script>