<script setup>
import doctorData from '../data/doctor.json';

defineEmits(['openBooking']);
</script>

<template>
  <section id="inicio" class="relative bg-gradient-to-b from-white via-sky-50/30 to-[#F8FAFC] py-12 lg:py-20 border-b border-slate-200 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        <!-- 1. IMAGEN DEL DOCTOR A LA IZQUIERDA (5 columnas) -->
        <div class="lg:col-span-5 order-1">
          <div class="relative bg-white p-3 sm:p-4 rounded-3xl shadow-xl border border-sky-100 max-w-md mx-auto">
            
            <!-- Marco de la Fotografía del Doctor -->
            <div class="relative rounded-2xl overflow-hidden h-[420px] bg-slate-900 flex items-center justify-center">
              <img :src="doctorData.foto_hero" 
                   :alt="doctorData.nombre" 
                   class="w-full h-full object-cover object-center"
                   loading="eager" />
              
              <!-- Badge inferior de Consultorio Abierto con SVG Pulse -->
              <div class="absolute bottom-3 inset-x-3 bg-slate-900/90 backdrop-blur-md text-white text-xs py-2.5 px-3.5 rounded-xl border border-white/10 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="relative flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                  </span>
                  <span class="font-medium text-slate-200">Consultas en Caracas y Guatire</span>
                </div>
                <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Activo</span>
              </div>
            </div>

            <!-- Badge Superior UCV Flotante -->
            <div class="absolute -top-3 -right-3 bg-white py-2 px-3.5 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center">
                UCV
              </div>
              <div class="flex flex-col text-left">
                <span class="text-[10px] font-extrabold text-slate-900 uppercase leading-none">Especialista</span>
                <span class="text-[9px] font-semibold text-slate-500 uppercase leading-tight">Certificado</span>
              </div>
            </div>

          </div>
        </div>

        <!-- 2. TEXTO OFICIAL A LA DERECHA (7 columnas) -->
        <div class="lg:col-span-7 order-2 flex flex-col items-start">
          
          <!-- Badges de Titulación Médica -->
          <div class="inline-flex items-center gap-2 bg-sky-50 text-sky-900 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 border border-sky-200">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-sky-600" style="width: 15px; height: 15px;">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            </svg>
            <span>Médico Cirujano UNERG • Cirujano General UCV • Urólogo UCV</span>
          </div>

          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
            Salud Urológica con <span class="text-sky-600 font-extrabold">Vanguardia Quirúrgica</span> y Trato Cercano
          </h2>

          <p class="text-base sm:text-lg text-slate-700 mb-7 leading-relaxed font-normal">
            El <strong>{{ doctorData.nombre }}</strong> ofrece diagnóstico de alta precisión y procedimientos mínimamente invasivos para patologías de riñones, vejiga, próstata, aparato reproductor masculino y piso pélvico. Consultas con <strong>Evaluación Completa + 3 Ecos</strong> en Caracas (Clínica VidaMed), Guatire y Barlovento.
          </p>

          <!-- Botones de Acción Principales (CTAs Modernizados) -->
          <div class="flex flex-wrap gap-3.5 mb-8 w-full sm:w-auto">
            
            <!-- Botón Primario: Agendar Consulta en Línea (#0EA5E9) -->
            <button type="button" 
                    @click="$emit('openBooking')"
                    class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white bg-[#0EA5E9] hover:bg-[#0284C7] shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              <span>Agendar Consulta en Línea</span>
            </button>

            <!-- Botón Secundario: Guía Médica al Paciente (Ruta Independiente) -->
            <router-link
              to="/guia-medica" 
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 hover:border-sky-400 hover:text-sky-600 shadow-xs hover:shadow-md transition-all cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-sky-600" style="width: 16px; height: 16px;">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                <path d="M6 6h10"/>
                <path d="M6 10h10"/>
              </svg>
              <span>Guía Médica al Paciente</span>
            </router-link>

            <!-- Botón Instagram Oficial -->
            <a :href="doctorData.instagram_url" 
               target="_blank" 
               rel="noopener noreferrer"
               class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:opacity-95 shadow-md shadow-pink-600/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="width: 15px; height: 15px;">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </a>

          </div>

          <!-- Credential Badges Minimalistas -->
          <div class="flex flex-wrap gap-2 pt-5 border-t border-slate-200 w-full text-xs font-semibold text-slate-700">
            <span class="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-emerald-500" style="width: 12px; height: 12px;">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Cirujano General UCV</span>
            </span>
            <span class="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-emerald-500" style="width: 12px; height: 12px;">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Urólogo UCV</span>
            </span>
            <span class="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-emerald-500" style="width: 12px; height: 12px;">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Uretrocistoscopia HD</span>
            </span>
            <span class="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-emerald-500" style="width: 12px; height: 12px;">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Cálculos con Láser</span>
            </span>
          </div>

        </div>

      </div>

      <!-- Accesos Rápidos a las Secciones de Contenido (Rutas Multi-página) -->
      <div class="mt-14 pt-10 border-t border-slate-200 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <router-link to="/guia-medica" 
             class="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
          <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10"/>
              <path d="M6 10h10"/>
            </svg>
          </div>
          <h4 class="font-bold text-slate-900 group-hover:text-sky-600 transition-colors text-sm mb-1">Guía Médica al Paciente</h4>
          <p class="text-xs text-slate-500 leading-relaxed">Educación sobre PSA, tacto rectal, hidrocele y cálculos con láser.</p>
        </router-link>

        <router-link to="/servicios" 
             class="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
          <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </div>
          <h4 class="font-bold text-slate-900 group-hover:text-sky-600 transition-colors text-sm mb-1">Evaluación con 3 Ecos</h4>
          <p class="text-xs text-slate-500 leading-relaxed">Eco renal, vesical y prostático en una misma consulta especializada.</p>
        </router-link>

        <router-link to="/test-prostata" 
             class="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
          <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <path d="m9 14 2 2 4-4"/>
            </svg>
          </div>
          <h4 class="font-bold text-slate-900 group-hover:text-sky-600 transition-colors text-sm mb-1">Test de Próstata (IPSS)</h4>
          <p class="text-xs text-slate-500 leading-relaxed">Autoevaluación confidencial de síntomas urinarios en 1 minuto.</p>
        </router-link>

        <router-link to="/citas" 
             class="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
          <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h4 class="font-bold text-slate-900 group-hover:text-sky-600 transition-colors text-sm mb-1">Sedes Clínicas</h4>
          <p class="text-xs text-slate-500 leading-relaxed">Caracas (VidaMed), Guatire y Barlovento con mapa y WhatsApp.</p>
        </router-link>

      </div>

    </div>
  </section>
</template>
