<script setup>
import { ref } from 'vue';
import doctorData from '../data/doctor.json';

defineEmits(['selectServiceToBook']);

const selectedTopic = ref(null);

const articulosClinicos = [
  {
    id: 'psa',
    titulo: 'El Antígeno Prostático (PSA): Cuándo Hacerlo y Qué Significa',
    badge: 'Próstata & Prevención',
    resumen: 'El PSA es una proteína producida por la próstata. Un valor elevado no siempre significa cáncer: puede deberse a infecciones, inflamación (prostatitis) o agrandamiento benigno.',
    detalles: [
      '¿A qué edad comenzar?: A partir de los 45 años en hombres sin antecedentes, o desde los 40 años si hay historial familiar directo.',
      '¿Qué eleva el PSA?: Infecciones urinarias, relaciones sexuales recientes, andar en bicicleta o hiperplasia benigna.',
      'Importancia médica: Debe correlacionarse siempre con el tacto rectal y la ecografía prostática para un diagnóstico confiable.'
    ],
    accion: 'Agendar Chequeo Prostático',
    servicioId: 1
  },
  {
    id: 'tacto-rectal',
    titulo: 'Mitos del Tacto Rectal: 15 Segundos que Salvan Vidas',
    badge: 'Diagnóstico Temprano',
    resumen: 'Es el examen físico más rápido, indoloro y determinante en la urología moderna. Permite palpar nódulos en zonas periféricas que los exámenes de sangre pueden no reflejar.',
    detalles: [
      'Duración real: El procedimiento toma menos de 15 segundos y no causa dolor cuando es realizado con técnica quirúrgica adecuada.',
      'Complemento del PSA: Hasta un 20% de las afecciones prostáticas relevantes tienen niveles de PSA normales y solo se detectan al tacto.',
      'Trato médico profesional: En consultorio privado, con estricta discreción, ética médica y total respeto a la dignidad del paciente.'
    ],
    accion: 'Agendar Consulta de Valoración',
    servicioId: 1
  },
  {
    id: 'tres-ecos',
    titulo: 'Evaluación Urológica con 3 Ecos: Máxima Precisión en Una Cita',
    badge: 'Protocolo Urológico Exclusivo',
    resumen: 'Consiste en la realización de Ecografía Renal, Vesical y Prostática en una misma consulta. Ofrece una radiografía completa del tracto urinario en tiempo real.',
    detalles: [
      'Eco Renal: Evalúa tamaño y morfología de los riñones, descartando quistes, tumores y piedras (litiasis).',
      'Eco Vesical: Mide la capacidad de la vejiga y el residuo de orina que queda después de miccionar.',
      'Eco Prostático: Determina el volumen exacto de la próstata en gramos y el grado de obstrucción urinaria.'
    ],
    accion: 'Agendar Combo con 3 Ecos',
    servicioId: 1
  },
  {
    id: 'hidrocele',
    titulo: '¿Qué es el Hidrocele Testicular?: Síntomas y Solución Sin Dolor',
    badge: 'Salud Masculina',
    resumen: 'Es la acumulación progresiva de líquido seroso alrededor del testículo, generando un aumento de volumen notable en la bolsa escrotal sin dolor agudo.',
    detalles: [
      '¿Por qué se produce?: Por desequilibrio entre la producción y absorción de líquido en las túnicas testiculares, traumatismos o infecciones.',
      'Diagnóstico diferencial: La ecografía testicular confirma que no se trata de una hernia inguinal ni de una masa tumoral.',
      'Tratamiento quirúrgico: Hidrocelectomía ambulatoria mediante microincisión, rápida recuperación y sin cicatrices notorias.'
    ],
    accion: 'Consultar Cirugía de Hidrocele',
    servicioId: 5
  },
  {
    id: 'laser-holmium',
    titulo: 'Cálculos Renales y Láser Holmium: Pulverización Sin Cicatrices',
    badge: 'Vanguardia Láser',
    resumen: 'La endourología moderna permite ingresar por vías naturales sin cortes externos, alcanzando las piedras en uréter o riñón para convertirlas en polvo microscópico.',
    detalles: [
      'Cero heridas abiertas: Procedimiento endoscópico de mínima invasión con fibra óptica de alta definición.',
      'Pulverización con Láser: La energía del Láser Holmium fragmenta litiasis de cualquier dureza y composición química.',
      'Alta médica rápida: En la gran mayoría de los casos el paciente egresa el mismo día o en 24 horas sin dolor invalidante.'
    ],
    accion: 'Consultar Tratamiento Láser',
    servicioId: 4
  }
];

const openModal = (art) => {
  selectedTopic.value = art;
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  selectedTopic.value = null;
  document.body.style.overflow = '';
};
</script>

<template>
  <section id="educacion" class="py-16 lg:py-24 bg-[#F8FAFC] border-t border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      
      <!-- Encabezado de la Guía Médica -->
      <div class="text-center max-w-3xl mx-auto mb-14">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-sky-100 text-sky-800 border border-sky-200 mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
            <path d="M6 6h10"/>
            <path d="M6 10h10"/>
          </svg>
          Educación & Orientación Clínica
        </span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
          Guía Médica al Paciente: Información Clara y Sin Tabúes
        </h2>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
          Artículos clínicos explicados en lenguaje accesible basados en los casos clínicos y publicaciones del Dr. Lisandro Márquez.
        </p>
      </div>

      <!-- Grilla de Artículos Clínicos Independientes -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        
        <article 
          v-for="art in articulosClinicos" 
          :key="art.id"
          class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
        >
          <div>
            <!-- Badge de Categoría -->
            <div class="flex items-center justify-between mb-4">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                {{ art.badge }}
              </span>
              <span class="text-xs font-semibold text-slate-400">
                Guía Clínica
              </span>
            </div>

            <!-- Título del Artículo -->
            <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors mb-3 leading-snug">
              {{ art.titulo }}
            </h3>

            <!-- Resumen Informativo -->
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
              {{ art.resumen }}
            </p>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button 
              type="button" 
              @click="openModal(art)"
              class="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer">
              <span>Leer detalles</span>
              <span>→</span>
            </button>

            <button 
              type="button" 
              @click="$emit('selectServiceToBook', art.servicioId)"
              class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 transition cursor-pointer">
              {{ art.accion }}
            </button>
          </div>

        </article>

      </div>

    </div>

    <!-- Modal Emergente de Lectura de Artículo -->
    <div v-if="selectedTopic" 
         class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
         @click.self="closeModal">
      
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-fade-in">
        
        <button 
          type="button" 
          @click="closeModal"
          class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xl leading-none transition cursor-pointer">
          &times;
        </button>

        <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 inline-block mb-3">
          {{ selectedTopic.badge }}
        </span>

        <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3 leading-tight">
          {{ selectedTopic.titulo }}
        </h3>

        <p class="text-sm text-slate-600 leading-relaxed mb-5">
          {{ selectedTopic.resumen }}
        </p>

        <div class="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 mb-6 space-y-2.5">
          <strong class="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-1">
            Puntos Clave Explicados por el Dr. Lisandro Márquez:
          </strong>
          <div v-for="(punto, idx) in selectedTopic.detalles" :key="idx" class="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
            <span class="text-sky-600 font-bold">•</span>
            <span>{{ punto }}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 justify-end">
          <button 
            type="button" 
            @click="closeModal"
            class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer">
            Cerrar
          </button>
          
          <button 
            type="button" 
            @click="$emit('selectServiceToBook', selectedTopic.servicioId); closeModal();"
            class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0EA5E9] hover:bg-[#0284C7] shadow-md transition cursor-pointer">
            {{ selectedTopic.accion }}
          </button>
        </div>

      </div>
    </div>

  </section>
</template>
