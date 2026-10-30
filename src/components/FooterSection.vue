<script setup>
import doctorData from '../data/doctor.json';

defineEmits(['openPortal']);
</script>

<template>
  <footer class="bg-slate-900 text-slate-400 py-16 border-t border-slate-800 text-xs sm:text-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        <!-- Columna 1: Branding del Doctor -->
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-[#0EA5E9] rounded-xl flex items-center justify-center text-white shadow-md shadow-sky-600/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </div>
            <div>
              <strong class="text-white text-base font-extrabold block leading-tight">{{ doctorData.nombre }}</strong>
              <span class="text-[11px] text-sky-400 font-bold block">{{ doctorData.titulo }}</span>
            </div>
          </div>
          <p class="text-slate-400 text-xs leading-relaxed mb-4">
            Especialista en Cirugía General y Urología formado en la Universidad Central de Venezuela (UCV) y la UNERG. Consultas en Caracas, Guatire y Barlovento.
          </p>
          <a :href="doctorData.instagram_url" 
             target="_blank" 
             rel="noopener noreferrer"
             class="inline-flex items-center gap-2 text-sky-400 font-bold hover:text-sky-300 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" class="text-pink-400" style="width: 15px; height: 15px;">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Instagram: {{ doctorData.instagram }}</span>
          </a>
        </div>

        <!-- Columna 2: Navegación Rápida -->
        <div>
          <h4 class="text-white font-bold text-sm mb-4">Páginas del Sitio</h4>
          <ul class="space-y-2 text-xs">
            <li><router-link to="/" class="hover:text-sky-400 transition">Inicio</router-link></li>
            <li><router-link to="/especialista" class="hover:text-sky-400 transition">El Especialista</router-link></li>
            <li><router-link to="/guia-medica" class="hover:text-sky-400 transition">Guía Médica</router-link></li>
            <li><router-link to="/servicios" class="hover:text-sky-400 transition">Servicios</router-link></li>
            <li><router-link to="/test-prostata" class="hover:text-sky-400 transition">Salud Masculina</router-link></li>
            <li><router-link to="/citas" class="hover:text-sky-400 transition">Sedes y Citas</router-link></li>
          </ul>
        </div>

        <!-- Columna 3: Temas de Orientación -->
        <div>
          <h4 class="text-white font-bold text-sm mb-4">Temas de Orientación</h4>
          <ul class="space-y-2 text-xs">
            <li><router-link to="/guia-medica" class="hover:text-sky-400 transition block">Antígeno Prostático (PSA)</router-link></li>
            <li><router-link to="/guia-medica" class="hover:text-sky-400 transition block">Mitos del Tacto Rectal</router-link></li>
            <li><router-link to="/guia-medica" class="hover:text-sky-400 transition block">Evaluación Urológica con 3 Ecos</router-link></li>
            <li><router-link to="/guia-medica" class="hover:text-sky-400 transition block">¿Qué es el Hidrocele?</router-link></li>
            <li><router-link to="/guia-medica" class="hover:text-sky-400 transition block">Cálculos con Láser Holmium</router-link></li>
          </ul>
        </div>

        <!-- Columna 4: Sedes & Acceso Doctor -->
        <div>
          <h4 class="text-white font-bold text-sm mb-4">Sedes Clínicas</h4>
          <p class="text-xs text-slate-400 mb-2 leading-relaxed">
            Caracas (Clínica VidaMed) • Guatire • Barlovento
          </p>
          <p class="text-xs text-slate-300 mb-4">
            <span class="text-slate-400">WhatsApp Citas:</span> <strong>{{ doctorData.telefono_display }}</strong>
          </p>
          <button type="button" 
                  @click="$emit('openPortal')" 
                  class="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 font-bold rounded-xl text-xs border border-slate-700 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Portal Doctor / Especialista</span>
          </button>
        </div>
      </div>

      <div class="pt-8 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4 text-xs text-slate-500">
        <div>
          &copy; 2026 {{ doctorData.nombre }} • Cirujano General & Urólogo (UCV).
        </div>
        <div class="text-[11px] text-slate-500">
          * La información provista tiene carácter orientativo y médico profesional. No sustituye la consulta médica presencial.
        </div>
      </div>

    </div>
  </footer>
</template>
