<script setup>
import doctorData from '../data/doctor.json';

const sedesList = [
  {
    ciudad: 'Caracas',
    clinica: 'Clínica VidaMed',
    unidad: 'Sede Quirúrgica & Consultorio Principal',
    direccion: 'Av. Libertador, El Rosal / Chacao, Caracas',
    horarios: 'Lunes a Viernes • Turnos Mañana y Tarde',
    servicios: 'Consultas especializadas, evaluación con 3 Ecos, uretrocistoscopia HD y cirugías endourológicas con láser.',
    badge: 'Sede Principal'
  },
  {
    ciudad: 'Guatire',
    clinica: 'Clínica San Martín de Porres',
    unidad: 'Unidad Urológica Dr. Gregorio Hernández',
    direccion: 'Av. Bermúdez, Guatire, Edo. Miranda',
    horarios: 'Martes y Jueves (Previa Cita)',
    servicios: 'Diagnóstico integral de vías urinarias, control prostático preventivo y procedimientos ambulatorios.',
    badge: 'Atención Miranda'
  },
  {
    ciudad: 'Barlovento',
    clinica: 'Clínica Caucagua',
    unidad: 'Punto de Atención Urológica',
    direccion: 'Sector Centro, Caucagua, Edo. Miranda',
    horarios: 'Sábados Programados (Jornadas)',
    servicios: 'Despistaje de próstata, control de litiasis renal, evaluación clínica y seguimiento posoperatorio.',
    badge: 'Jornadas Especiales'
  }
];
</script>

<template>
  <section id="sedes" class="py-16 lg:py-24 bg-white border-t border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      
      <!-- Encabezado de la Sección -->
      <div class="text-center max-w-3xl mx-auto mb-14">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-sky-50 text-sky-700 border border-sky-200 mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Puntos de Atención
        </span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
          Sedes Clínicas y Consultorios Oficiales
        </h2>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
          Atención urológica de vanguardia con agendamiento directo en Caracas, Guatire y Barlovento.
        </p>
      </div>

      <!-- 3 Tarjetas Horizontales e Independientes (Grid de 3 Columnas) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
        <div v-for="(sede, idx) in sedesList" 
             :key="idx"
             class="bg-slate-50/80 hover:bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 hover:border-sky-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          
          <div>
            <!-- Badge y Ciudad -->
            <div class="flex items-center justify-between mb-4">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white text-slate-700 border border-slate-200 group-hover:border-sky-200 group-hover:text-sky-700 transition-colors">
                {{ sede.badge }}
              </span>
              <span class="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 font-extrabold text-xs flex items-center justify-center">
                0{{ idx + 1 }}
              </span>
            </div>

            <!-- Nombre de la Clínica y Ciudad -->
            <h3 class="text-xl font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors mb-1 leading-snug">
              {{ sede.ciudad }}
            </h3>
            <span class="text-sm font-bold text-sky-700 block mb-2">
              {{ sede.clinica }}
            </span>
            <span class="text-xs font-semibold text-slate-500 block mb-4">
              {{ sede.unidad }}
            </span>

            <!-- Descripción de Procedimientos -->
            <p class="text-xs text-slate-600 leading-relaxed mb-5">
              {{ sede.servicios }}
            </p>

            <div class="pt-4 border-t border-slate-200/80 space-y-2 text-xs text-slate-500 mb-6">
              <div class="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-slate-400 mt-0.5 flex-shrink-0" style="width: 14px; height: 14px;">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span><strong>Horarios:</strong> {{ sede.horarios }}</span>
              </div>
            </div>
          </div>

          <!-- Botón de Agendamiento Directo de esa Sede -->
          <a :href="`https://wa.me/${doctorData.whatsapp}?text=Hola%20Dr.%20Lisandro%20M%C3%A1rquez,%20deseo%20agendar%20una%20cita%20urol%C3%B3gica%20en%20la%20sede%20de%20${encodeURIComponent(sede.ciudad)}%20(${encodeURIComponent(sede.clinica)})`"
             target="_blank"
             rel="noopener noreferrer"
             class="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-emerald-600 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="width: 14px; height: 14px;">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>Agendar Cita en {{ sede.ciudad }}</span>
          </a>

        </div>
      </div>

      <!-- Banner de Coordinación General -->
      <div class="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div>
            <h4 class="text-base sm:text-lg font-bold text-white">¿Necesitas orientación sobre cuál sede te queda más cerca?</h4>
            <p class="text-xs sm:text-sm text-sky-200">Escríbenos directamente y nuestro equipo te asignará el turno más conveniente.</p>
          </div>
        </div>

        <a :href="`https://wa.me/${doctorData.whatsapp}?text=Hola%20Dr.%20Lisandro%20M%C3%A1rquez,%20deseo%20informaci%C3%B3n%20sobre%20las%20sedes%20de%20consulta`"
           target="_blank"
           rel="noopener noreferrer"
           class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-900 bg-white hover:bg-sky-50 shadow-md transition-all flex-shrink-0 cursor-pointer">
          <span>WhatsApp Central: <strong>{{ doctorData.telefono_display }}</strong></span>
        </a>
      </div>

    </div>
  </section>
</template>
