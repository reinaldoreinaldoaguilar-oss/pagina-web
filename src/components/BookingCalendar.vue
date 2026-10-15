<template>
  <div class="w-full h-full min-h-[600px] rounded-lg overflow-hidden border border-medical-100 shadow-inner bg-slate-50">
    <!-- 
      Cuando crees la cuenta en Cal.com, te darán un enlace similar a este. 
      Solo tendrás que reemplazar el "src" del iframe.
    -->
    <iframe
      v-if="calLink"
      :src="calLink"
      width="100%"
      height="100%"
      frameborder="0"
      title="Agendar cita con Dr. Lisandro Márquez"
      class="min-h-[600px]"
    ></iframe>
    
    <!-- Estado de carga/placeholder mientras configuramos el enlace real -->
    <div v-else class="flex flex-col items-center justify-center h-full min-h-[600px] text-medical-800 p-8">
      <svg class="w-16 h-16 mb-4 text-medical-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <p class="text-xl font-medium text-center">Configurando disponibilidad médica...</p>
      <p class="text-sm mt-2 opacity-75 text-center">El calendario de citas interactivo estará disponible en breve.</p>
    </div>
  </div>
</template>

<script setup>
// Aquí colocaremos el enlace que nos dé Cal.com (Ej: "https://cal.com/dr-lisandro-marquez/consulta")
// Dejémoslo vacío ('') por ahora para ver la interfaz de carga profesional.
const calLink = '' 
</script>