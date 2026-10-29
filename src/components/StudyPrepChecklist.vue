<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['openBooking', 'selectServiceToBook']);

const studies = [
  {
    id: '3-ecos',
    title: 'Evaluación Integral con 3 Ecos',
    subtitle: 'Ecografía Renal, Vesical y Prostática en una sola cita',
    badge: 'Estudio Más Frecuente',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    icon: '🩺',
    summary: {
      ayuno: 'No estricto (Comida ligera 2h antes)',
      agua: '1 a 1.2 litros 1 hora antes',
      duracion: '30 - 40 minutos',
      acompanante: 'Opcional'
    },
    steps: [
      {
        titulo: 'Vejiga Cómodamente Llena',
        desc: 'Toma entre 4 y 5 vasos de agua (1 a 1.2 litros) 1 hora antes de tu hora pautada y abstente de orinar. La vejiga llena sirve como una ventana de ultrasonido para ver con nitidez la próstata.',
        urgente: true
      },
      {
        titulo: 'Fase Post-Miccional en el Consultorio',
        desc: 'Durante la consulta, el Dr. Lisandro te pedirá orinar en el baño privado del consultorio para luego medir el residuo urinario exacto.',
        urgente: false
      },
      {
        titulo: 'Exámenes Previos en Mano',
        desc: 'Trae exámenes de orina (urocultivo o examen simple), química sanguínea y antígeno prostático (PSA) si te los has realizado en los últimos 6 meses.',
        urgente: false
      },
      {
        titulo: 'Ropa Cómoda de Dos Piezas',
        desc: 'Viste pantalón y camisa o franela cómoda para facilitar el acceso al abdomen inferior sin necesidad de desvestirte por completo.',
        urgente: false
      }
    ],
    consejoMedico: 'No te sobrecargues de agua al punto de tener dolor por aguantar las ganas; la vejiga debe estar confortablemente llena para una medición fisiológica real.'
  },
  {
    id: 'uroflujometria',
    title: 'Uroflujometría Computarizada',
    subtitle: 'Medición de la fuerza, curva y velocidad del chorro miccional',
    badge: 'Prueba Funcional',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: '💧',
    summary: {
      ayuno: 'No requiere ayuno',
      agua: 'Ingesta normal hasta deseo natural',
      duracion: '15 - 20 minutos',
      acompanante: 'No requerido'
    },
    steps: [
      {
        titulo: 'Deseo Miccional Fisiológico',
        desc: 'Bebe agua normalmente. Debes realizar la prueba en el uroflujómetro solo cuando sientas un deseo habitual y natural de orinar, no forzado.',
        urgente: true
      },
      {
        titulo: 'Evitar el Aguante Excesivo',
        desc: 'Si retienes la orina más de lo debido por aguantar el chorro, el músculo detrusor de la vejiga se fatiga y la prueba puede arrojar un resultado falso.',
        urgente: false
      },
      {
        titulo: 'Medicamentos Habituales',
        desc: 'Informa al Dr. Lisandro si estás tomando fármacos para la próstata (Tamsulosina, Silodosina, Finasteride) o diuréticos.',
        urgente: false
      }
    ],
    consejoMedico: 'La uroflujometría es una prueba completamente indolora y no invasiva: simplemente orinas dentro de un embudo computarizado que registra el flujo de forma automática.'
  },
  {
    id: 'biopsia',
    title: 'Biopsia Prostática Ecodirigida',
    subtitle: 'Procedimiento ambulatorio de precisión guiado por ultrasonido',
    badge: 'Procedimiento Clínico',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '🔬',
    summary: {
      ayuno: '6 a 8 horas de ayuno',
      agua: 'Solo sorbos mínimos con medicación',
      duracion: '45 minutos',
      acompanante: 'Estrictamente Requerido'
    },
    steps: [
      {
        titulo: 'Antibioprofilaxis Obligatoria',
        desc: 'Inicia el antibiótico prescrito por el Dr. Márquez exactamente 24 horas antes del procedimiento para proteger contra infecciones.',
        urgente: true
      },
      {
        titulo: 'Limpieza Rectal (Enema)',
        desc: 'Aplica un enema evacuante la noche anterior y otro 2 horas antes de la cita según las indicaciones personalizadas entregadas.',
        urgente: true
      },
      {
        titulo: 'Suspensión de Anticoagulantes / Aspirina',
        desc: 'Suspende aspirina, warfarina, clopidogrel u otros anticoagulantes entre 5 y 7 días previos, siempre con la debida autorización de tu cardiólogo.',
        urgente: true
      },
      {
        titulo: 'Urocultivo Negativo Vigente',
        desc: 'Es indispensable presentar el resultado de un cultivo de orina reciente que demuestre que no hay infección urinaria activa.',
        urgente: false
      },
      {
        titulo: 'Venir con Acompañante Adulto',
        desc: 'Por seguridad tras la sedación local o anestesia ambulatoria, debes retirarte acompañado y no conducir vehículos por el resto del día.',
        urgente: false
      }
    ],
    consejoMedico: 'El procedimiento se realiza con anestesia local periprostática para garantizar la máxima comodidad y tolerancia sin dolor.'
  },
  {
    id: 'litotricia',
    title: 'Cirugía Láser de Cálculos (Litiasis)',
    subtitle: 'Desintegración endoscópica con Láser Holmium / Tulio',
    badge: 'Mínimamente Invasiva',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '⚡',
    summary: {
      ayuno: '8 horas absoluto (Sólidos y líquidos)',
      agua: 'Nada de agua las 8h previas',
      duracion: '1 a 2 horas (Ambulatorio)',
      acompanante: 'Estrictamente Requerido'
    },
    steps: [
      {
        titulo: 'Ayuno Absoluto de 8 Horas',
        desc: 'No ingerir ningún alimento sólido ni líquido (incluyendo agua o café) durante las 8 horas previas a la hora pautada en quirófano.',
        urgente: true
      },
      {
        titulo: 'Perfil Preoperatorio y Riesgo Quirúrgico',
        desc: 'Trae la carpeta física con pruebas de coagulación (PT, PTT, Plaquetas), química sanguínea completa y la valoración cardiovascular aprobada.',
        urgente: true
      },
      {
        titulo: 'Tomografía (UroTAC) en Físico o Digital',
        desc: 'Trae el disco o las placas de la tomografía computarizada helicoidal sin contraste para visualizar la posición exacta y dureza del cálculo.',
        urgente: false
      },
      {
        titulo: 'Higiene Personal Previa',
        desc: 'Ducha corporal completa la mañana de la cirugía con jabón antiséptico. Retirar relojes, cadenas y prótesis dentales removibles.',
        urgente: false
      }
    ],
    consejoMedico: 'Al ser una técnica 100% endoscópica a través de las vías urinarias naturales, no deja cicatrices visibles y permite una reincorporación rápida a las actividades habituales.'
  },
  {
    id: 'primera-vez',
    title: 'Chequeo Preventivo / Primera Consulta',
    subtitle: 'Evaluación urológica general masculina y despistaje prostático',
    badge: 'Control Anual',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🛡️',
    summary: {
      ayuno: 'No indispensable',
      agua: '1 litro 1 hora antes (si incluye eco)',
      duracion: '30 - 45 minutos',
      acompanante: 'Opcional'
    },
    steps: [
      {
        titulo: 'PSA en Sangre (Si ya lo tienes)',
        desc: 'Si te realizaste el Antígeno Prostático Específico (PSA Total y Libre), trae el informe impreso. Recuerda que para el examen de sangre del PSA se recomiendan 48h de abstinencia sexual previa.',
        urgente: false
      },
      {
        titulo: 'Lista de Medicamentos Actuales',
        desc: 'Anota los nombres de medicamentos que tomes para hipertensión, diabetes, anticoagulantes o suplementos nutricionales.',
        urgente: false
      },
      {
        titulo: 'Estudios de Años Anteriores',
        desc: 'Si posees ecografías prostáticas o exámenes de orina de años previos, tráelos para evaluar la evolución histórica del tamaño prostático.',
        urgente: false
      }
    ],
    consejoMedico: 'El chequeo preventivo a partir de los 45 años (o 40 si hay antecedentes familiares) es la herramienta más eficaz de la urología moderna para proteger tu calidad de vida.'
  }
];

const selectedStudyId = ref('3-ecos');
const checkedSteps = ref({});

const currentStudy = computed(() => {
  return studies.find(s => s.id === selectedStudyId.value) || studies[0];
});

const isStepChecked = (index) => {
  const key = `${selectedStudyId.value}_${index}`;
  return !!checkedSteps.value[key];
};

const toggleStep = (index) => {
  const key = `${selectedStudyId.value}_${index}`;
  checkedSteps.value[key] = !checkedSteps.value[key];
};

const completedCount = computed(() => {
  const total = currentStudy.value.steps.length;
  let done = 0;
  for (let i = 0; i < total; i++) {
    if (isStepChecked(i)) done++;
  }
  return { done, total, percent: Math.round((done / total) * 100) };
});

const shareViaWhatsApp = () => {
  const study = currentStudy.value;
  let text = `*INDICACIONES PRE-CONSULTA - DR. LISANDRO MÁRQUEZ (URÓLOGO)*\n`;
  text += `📋 *Estudio:* ${study.title}\n\n`;
  text += `⏱️ *Ayuno:* ${study.summary.ayuno}\n`;
  text += `💧 *Ingesta de Agua:* ${study.summary.agua}\n`;
  text += `👥 *Acompañante:* ${study.summary.acompanante}\n\n`;
  text += `*Paso a paso de preparación:*\n`;
  study.steps.forEach((s, idx) => {
    text += `${idx + 1}. *${s.titulo}:* ${s.desc}\n`;
  });
  text += `\n💡 _${study.consejoMedico}_\n`;
  text += `📍 *Consultorios en Caracas:* Policlínica Méndez Gimón & Centro Médico Loira.`;
  
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

const printChecklist = () => {
  window.print();
};
</script>

<template>
  <section class="py-12 bg-slate-50 border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      
      <!-- Encabezado de la Sección -->
      <div class="max-w-3xl mb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-sky-100 text-sky-800 border border-sky-200 mb-3">
          <span>📋</span>
          <span>Herramienta Interactiva para Pacientes</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Guía de Preparación Pre-Consulta & Estudios
        </h2>
        <p class="text-slate-600 text-sm sm:text-base mt-2">
          Selecciona tu estudio médico para conocer de forma clara las indicaciones exactas de ayuno, toma de agua y documentos que debes traer el día de tu cita.
        </p>
      </div>

      <!-- Selector de Estudios (Pestañas / Botones) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-8">
        <button
          v-for="study in studies"
          :key="study.id"
          type="button"
          @click="selectedStudyId = study.id"
          class="flex flex-col text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative"
          :class="[
            selectedStudyId === study.id
              ? 'bg-white border-sky-500 shadow-md ring-2 ring-sky-400/20'
              : 'bg-white/80 hover:bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-2xs'
          ]"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-2xl">{{ study.icon }}</span>
            <span 
              class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              :class="study.badgeColor"
            >
              {{ study.badge }}
            </span>
          </div>
          <span 
            class="text-xs sm:text-sm font-extrabold leading-snug line-clamp-2"
            :class="selectedStudyId === study.id ? 'text-slate-900' : 'text-slate-700'"
          >
            {{ study.title }}
          </span>
        </button>
      </div>

      <!-- Tarjeta Principal del Estudio Seleccionado -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        <!-- Header de la Ficha Técnica -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-3xl">{{ currentStudy.icon }}</span>
              <h3 class="text-xl sm:text-2xl font-black text-white tracking-tight">
                {{ currentStudy.title }}
              </h3>
            </div>
            <p class="text-xs sm:text-sm text-sky-200">
              {{ currentStudy.subtitle }}
            </p>
          </div>

          <!-- Acciones Rápidas (WhatsApp & Imprimir) -->
          <div class="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <button
              type="button"
              @click="shareViaWhatsApp"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
              title="Compartir o enviarse las indicaciones a WhatsApp"
            >
              <span>📲</span>
              <span>Guardar en WhatsApp</span>
            </button>
            <button
              type="button"
              @click="printChecklist"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
              title="Imprimir indicaciones"
            >
              <span>🖨️</span>
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        <!-- Barra de Resumen Clínico Inmediato (4 Indicadores Clave) -->
        <div class="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/80 border-b border-slate-200">
          <div class="p-4 sm:p-5 flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
              🍽️
            </div>
            <div>
              <p class="text-[11px] font-bold uppercase text-slate-500 tracking-wide">Ayuno</p>
              <p class="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">{{ currentStudy.summary.ayuno }}</p>
            </div>
          </div>

          <div class="p-4 sm:p-5 flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
              💧
            </div>
            <div>
              <p class="text-[11px] font-bold uppercase text-slate-500 tracking-wide">Toma de Agua</p>
              <p class="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">{{ currentStudy.summary.agua }}</p>
            </div>
          </div>

          <div class="p-4 sm:p-5 flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
              ⏱️
            </div>
            <div>
              <p class="text-[11px] font-bold uppercase text-slate-500 tracking-wide">Tiempo Estimado</p>
              <p class="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">{{ currentStudy.summary.duracion }}</p>
            </div>
          </div>

          <div class="p-4 sm:p-5 flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
              👥
            </div>
            <div>
              <p class="text-[11px] font-bold uppercase text-slate-500 tracking-wide">Acompañante</p>
              <p class="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">{{ currentStudy.summary.acompanante }}</p>
            </div>
          </div>
        </div>

        <!-- Contenido Central: Checklist Interactivo y Consejo Médico -->
        <div class="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Lista de Pasos Verificables (2 Columnas) -->
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>☑️</span>
                <span>Pasos de Preparación (Marca los que ya tienes listos)</span>
              </h4>
              <span class="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                {{ completedCount.done }} de {{ completedCount.total }} listos ({{ completedCount.percent }}%)
              </span>
            </div>

            <!-- Items del Checklist -->
            <div class="space-y-3">
              <div
                v-for="(step, idx) in currentStudy.steps"
                :key="idx"
                @click="toggleStep(idx)"
                class="p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 select-none"
                :class="[
                  isStepChecked(idx)
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                ]"
              >
                <!-- Casilla de verificación -->
                <div 
                  class="w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                  :class="[
                    isStepChecked(idx)
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'border-slate-300 bg-white'
                  ]"
                >
                  <svg v-if="isStepChecked(idx)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span 
                      class="text-sm font-extrabold"
                      :class="isStepChecked(idx) ? 'line-through text-slate-500' : 'text-slate-900'"
                    >
                      {{ step.titulo }}
                    </span>
                    <span 
                      v-if="step.urgente"
                      class="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200"
                    >
                      Obligatorio
                    </span>
                  </div>
                  <p 
                    class="text-xs sm:text-sm mt-1 leading-relaxed"
                    :class="isStepChecked(idx) ? 'text-slate-400' : 'text-slate-600'"
                  >
                    {{ step.desc }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna Lateral: Consejo Médico y CTA Directo -->
          <div class="space-y-6">
            
            <!-- Tarjeta de Recomendación del Especialista -->
            <div class="p-5 rounded-2xl bg-sky-50/90 border border-sky-200 relative overflow-hidden">
              <div class="flex items-center gap-2 mb-2 text-sky-900 font-extrabold text-sm">
                <span>💡</span>
                <span>Consejo del Dr. Lisandro</span>
              </div>
              <p class="text-xs sm:text-sm text-sky-950 leading-relaxed italic">
                "{{ currentStudy.consejoMedico }}"
              </p>
              <div class="mt-4 pt-3 border-t border-sky-200/80 flex items-center gap-2 text-[11px] font-bold text-sky-800">
                <span>👨‍⚕️</span>
                <span>Dr. Lisandro Márquez • Urólogo UCV</span>
              </div>
            </div>

            <!-- Llamado a Agendar -->
            <div class="p-5 rounded-2xl bg-slate-900 text-white shadow-lg space-y-3">
              <span class="text-xs font-bold text-sky-400 uppercase tracking-widest">¿Aún no tienes fecha?</span>
              <h5 class="text-base font-extrabold text-white leading-tight">
                Agenda tu cita o procedimiento en Caracas
              </h5>
              <p class="text-xs text-slate-300 leading-relaxed">
                Atención personalizada en Policlínica Méndez Gimón y Centro Médico Loira.
              </p>
              <button
                type="button"
                @click="$emit('openBooking')"
                class="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-900 bg-[#0EA5E9] hover:bg-[#38BDF8] text-white shadow-md shadow-sky-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>📅</span>
                <span>Agendar Consulta Ahora</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  </section>
</template>
