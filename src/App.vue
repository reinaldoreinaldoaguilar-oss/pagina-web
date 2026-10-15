<script setup>
import Hero from './components/Hero.vue'
import BookingCalendar from './components/BookingCalendar.vue'
import WhatsAppButton from './components/WhatsAppButton.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans antialiased text-medical-900 selection:bg-medical-200 selection:text-medical-900">
    
    <Hero />
    
    <section id="agenda" class="py-20 px-6 max-w-5xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-3xl md:text-4xl font-bold text-medical-900 mb-4">Agende su Cita</h2>
        <p class="text-lg text-medical-800 max-w-2xl mx-auto">
          Seleccione el día y la hora que mejor se adapte a su disponibilidad. Recibirá confirmación inmediata y recordatorios previos a su consulta.
        </p>
      </div>
      
      <div class="bg-white p-2 md:p-6 rounded-2xl shadow-sm border border-medical-100">
        <BookingCalendar />
      </div>
    </section>

    <!-- Footer simple y profesional -->
    <footer class="bg-medical-900 text-medical-50 py-8 text-center text-sm">
      <p>&copy; {{ new Date().getFullYear() }} Dr. Lisandro Márquez. Especialista en Oncología Médica.</p>
      <p class="mt-2 text-medical-300">Valencia, Edo. Carabobo, Venezuela.</p>
    </footer>

    <WhatsAppButton />
    
  </div>
</template>