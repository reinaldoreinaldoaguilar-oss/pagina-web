<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['openBooking', 'selectServiceToBook']);

const studies = [
  {
    id: '3-ecos',
    title: 'Evaluación Integral con 3 Ecos',
    subtitle: 'Ecografía Renal, Vesical y Prostática en una sola cita',
    badge: 'Evaluación Integral',
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
    consejoMedico: 'No es necesario sobrecargarse de agua al punto de sentir dolor. La vejiga debe estar confortablemente llena para que la medición del residuo refleje un estado fisiológico natural.'
  },
  {
    id: 'biopsia',
    title: 'Biopsia Prostática Ecodirigida',
    subtitle: 'Procedimiento ambulatorio de precisión guiado por ultrasonido',
    badge: 'Procedimiento Clínico',
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
        desc: 'Suspende aspirina, warfarina, clopidogrel u otros anticoagulantes entre 5 y 7 días previos, siempre con la debida autorización de tu cardiólogo tratante.',
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
    consejoMedico: 'Al ser una técnica endoscópica a través de las vías urinarias naturales, no deja cicatrices externas y favorece una pronta recuperación.'
  },
  {
    id: 'uroflujometria',
    title: 'Uroflujometría Computarizada',
    subtitle: 'Medición de la fuerza, curva y velocidad del chorro miccional',
    badge: 'Prueba Funcional',
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
    consejoMedico: 'La uroflujometría es una prueba no invasiva e indolora: se registra el flujo de forma electrónica durante una micción habitual.'
  },
  {
    id: 'primera-vez',
    title: 'Chequeo Preventivo / Primera Consulta',
    subtitle: 'Evaluación urológica general masculina y despistaje prostático',
    badge: 'Control Periódico',
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
    consejoMedico: 'La evaluación urológica preventiva es el estándar más efectivo para preservar la salud prostática y renal con total tranquilidad.'
  }
];

const selectedStudyId = ref('biopsia');
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
  text += `*Procedimiento:* ${study.title}\n\n`;
  text += `*Ayuno:* ${study.summary.ayuno}\n`;
  text += `*Ingesta de Agua:* ${study.summary.agua}\n`;
  text += `*Acompañante:* ${study.summary.acompanante}\n\n`;
  text += `*Requisitos y pasos:*\n`;
  study.steps.forEach((s, idx) => {
    text += `${idx + 1}. *${s.titulo}:* ${s.desc}\n`;
  });
  text += `\n_${study.consejoMedico}_\n\n`;
  text += `*Consultorios en Caracas:* Policlínica Méndez Gimón & Centro Médico Loira.`;
  
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};
</script>

<template>
  <section class="py-16 lg:py-20 bg-[#F8FAFC] border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Encabezado de Sección: Tipografía Institucional y Espaciado Generoso -->
      <div class="max-w-3xl mb-12">
        <span class="inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest bg-slate-200/70 text-slate-700 mb-3">
          Protocolos de Atención
        </span>
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Guía de Preparación Pre-Consulta & Procedimientos
        </h2>
        <p class="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
          Seleccione el estudio o procedimiento médico para revisar las indicaciones técnicas de ayuno, ingesta hídrica y documentación clínica requerida.
        </p>
      </div>

      <!-- Selector de Estudios: Pestañas Minimalistas Corporativas -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
        <button
          v-for="study in studies"
          :key="study.id"
          type="button"
          @click="selectedStudyId = study.id"
          class="flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer relative"
          :class="[
            selectedStudyId === study.id
              ? 'bg-white border-[#0A192F] shadow-sm ring-1 ring-[#0A192F]'
              : 'bg-white/80 hover:bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          ]"
        >
          <span 
            class="text-[10px] font-bold uppercase tracking-wider mb-2"
            :class="selectedStudyId === study.id ? 'text-[#0A192F]' : 'text-slate-400'"
          >
            {{ study.badge }}
          </span>
          <span 
            class="text-xs sm:text-sm font-bold leading-snug line-clamp-2"
            :class="selectedStudyId === study.id ? 'text-slate-900' : 'text-slate-700'"
          >
            {{ study.title }}
          </span>
        </button>
      </div>

      <!-- Tarjeta Principal del Protocolo Seleccionado -->
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        
        <!-- 1. Banner Principal: Azul Marino Institucional #0A192F con Tipografía Blanca/Plateada -->
        <div 
          class="text-white p-7 sm:p-10 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6"
          style="background-color: #0A192F !important;"
        >
          <div class="space-y-2 max-w-2xl">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-white/10 text-slate-300 border border-white/10">
              Protocolo Clínico Oficial
            </span>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {{ currentStudy.title }}
            </h3>
            <p class="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              {{ currentStudy.subtitle }}
            </p>
          </div>

          <!-- Acción de contacto secundario: Guardar en WhatsApp -->
          <div class="flex items-center flex-shrink-0">
            <button
              type="button"
              @click="shareViaWhatsApp"
              class="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
              title="Guardar o compartir las indicaciones en WhatsApp"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>Guardar en WhatsApp</span>
            </button>
          </div>
        </div>

        <!-- 2. Módulos Individuales con Bordes Finos: Ayuno, Toma de Agua, Tiempo Estimado y Acompañante -->
        <div class="p-6 sm:p-8 bg-[#F8FAFC] border-b border-slate-200">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <!-- Módulo Ayuno -->
            <div class="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ayuno</span>
                <div class="w-7 h-7 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                </div>
              </div>
              <p class="text-sm font-bold text-slate-900 leading-snug">
                {{ currentStudy.summary.ayuno }}
              </p>
            </div>

            <!-- Módulo Toma de Agua -->
            <div class="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ingesta Hídrica</span>
                <div class="w-7 h-7 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                  </svg>
                </div>
              </div>
              <p class="text-sm font-bold text-slate-900 leading-snug">
                {{ currentStudy.summary.agua }}
              </p>
            </div>

            <!-- Módulo Tiempo Estimado -->
            <div class="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Duración Estimada</span>
                <div class="w-7 h-7 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
              </div>
              <p class="text-sm font-bold text-slate-900 leading-snug">
                {{ currentStudy.summary.duracion }}
              </p>
            </div>

            <!-- Módulo Acompañante -->
            <div class="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Acompañante</span>
                <div class="w-7 h-7 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
              </div>
              <p class="text-sm font-bold text-slate-900 leading-snug">
                {{ currentStudy.summary.acompanante }}
              </p>
            </div>

          </div>
        </div>

        <!-- 3. Contenido Central: Checklist Corporativo y Tarjeta Formal de Cita Médica -->
        <div class="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Columna Izquierda: Checklist Corporativo (7 cols) -->
          <div class="lg:col-span-7 space-y-5">
            
            <!-- Barra Superior del Checklist con Indicador de Progreso Integrado -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h4 class="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Requisitos y Pasos de Preparación
                </h4>
                <p class="text-xs text-slate-500 mt-0.5">
                  Seleccione cada requisito completado antes de acudir al centro médico.
                </p>
              </div>

              <!-- Indicador de Progreso -->
              <div class="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200 flex-shrink-0">
                <div class="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    class="h-1.5 rounded-full transition-all duration-300"
                    :class="completedCount.percent === 100 ? 'bg-emerald-600' : 'bg-sky-600'"
                    :style="{ width: `${completedCount.percent}%` }"
                  ></div>
                </div>
                <span class="text-xs font-bold text-slate-700 font-mono">
                  {{ completedCount.percent }}%
                </span>
              </div>
            </div>

            <!-- Lista de Pasos Verificables -->
            <div class="space-y-3">
              <div
                v-for="(step, idx) in currentStudy.steps"
                :key="idx"
                @click="toggleStep(idx)"
                class="p-4 sm:p-5 rounded-xl border transition-all cursor-pointer flex items-start gap-4 select-none"
                :class="[
                  isStepChecked(idx)
                    ? 'bg-slate-50/70 border-slate-200 text-slate-500'
                    : 'bg-white hover:bg-slate-50/50 border-slate-200/90 shadow-2xs hover:border-slate-300'
                ]"
              >
                <!-- Checkbox Estilizado -->
                <div 
                  class="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                  :class="[
                    isStepChecked(idx)
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'border-slate-300 bg-white'
                  ]"
                >
                  <svg v-if="isStepChecked(idx)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span 
                      class="text-sm font-bold tracking-tight"
                      :class="isStepChecked(idx) ? 'line-through text-slate-400' : 'text-slate-900'"
                    >
                      {{ step.titulo }}
                    </span>
                    <span 
                      v-if="step.urgente"
                      class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-amber-800 bg-amber-50 border border-amber-200"
                    >
                      Indispensable
                    </span>
                  </div>
                  <p 
                    class="text-xs sm:text-sm mt-1.5 leading-relaxed font-normal"
                    :class="isStepChecked(idx) ? 'text-slate-400' : 'text-slate-600'"
                  >
                    {{ step.desc }}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <!-- Columna Derecha: Tarjeta de Cita Médica Formal y Llamado a Consulta (5 cols) -->
          <div class="lg:col-span-5 space-y-6">
            
            <!-- Tarjeta de Cita Médica Formal (Tipografía Serif Elegante) -->
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative space-y-4">
              <span class="text-[10px] font-bold tracking-widest uppercase text-slate-400 block font-mono">
                Criterio del Especialista
              </span>
              
              <blockquote class="font-serif text-slate-800 text-sm sm:text-base italic leading-relaxed">
                “{{ currentStudy.consejoMedico }}”
              </blockquote>
              
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p class="font-sans font-bold text-slate-900 text-xs sm:text-sm">
                    Dr. Lisandro Márquez
                  </p>
                  <p class="text-[11px] text-slate-500 font-medium">
                    Cirujano General • Urólogo (UCV)
                  </p>
                </div>
              </div>

              <!-- Botón de WhatsApp como ÚNICA acción secundaria de contacto en esta zona -->
              <button
                type="button"
                @click="shareViaWhatsApp"
                class="w-full mt-2 inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>Consultar Dudas por WhatsApp</span>
              </button>
            </div>

            <!-- Tarjeta de Agendamiento Institucional -->
            <div 
              class="p-6 rounded-2xl text-white shadow-md space-y-4"
              style="background-color: #0A192F !important;"
            >
              <span class="text-[10px] font-bold tracking-widest uppercase text-sky-400 block font-mono">
                Agendamiento Presencial
              </span>
              <h5 class="text-base font-bold text-white leading-tight">
                Solicite su Cita o Procedimiento en Caracas
              </h5>
              <p class="text-xs text-slate-300 leading-relaxed">
                Consultorios activos en Policlínica Méndez Gimón (San Bernardino) y Centro Médico Loira (El Paraíso).
              </p>
              <button
                type="button"
                @click="$emit('openBooking')"
                class="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#0EA5E9] hover:bg-[#0284C7] text-white shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Solicitar Cita Médica</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  </section>
</template>
