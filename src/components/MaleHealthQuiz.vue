<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['openBookingWithService']);

const questions = [
  {
    id: 1,
    title: 'Confianza en la Firmeza',
    text: '¿Cómo calificaría su nivel de confianza para lograr y mantener una erección satisfactoria?',
    options: [
      { text: 'Muy baja confianza', score: 1 },
      { text: 'Baja confianza', score: 2 },
      { text: 'Confianza moderada', score: 3 },
      { text: 'Alta confianza', score: 4 },
      { text: 'Muy alta confianza', score: 5 }
    ]
  },
  {
    id: 2,
    title: 'Firmeza para la Penetración',
    text: 'Al tener erecciones con estimulación sexual, ¿con qué frecuencia fueron lo suficientemente firmes y rígidas para la penetración?',
    options: [
      { text: 'Casi nunca o nunca (Menos del 20% de las veces)', score: 1 },
      { text: 'Pocas veces (Menos de la mitad de las veces)', score: 2 },
      { text: 'A veces (Aproximadamente la mitad de las veces)', score: 3 },
      { text: 'La mayoría de las veces (Mucho más de la mitad)', score: 4 },
      { text: 'Casi siempre o siempre (Siempre firme)', score: 5 }
    ]
  },
  {
    id: 3,
    title: 'Mantenimiento de la Erección',
    text: 'Durante la relación sexual, una vez lograda la penetración, ¿con qué frecuencia fue capaz de mantener la erección dentro de su pareja?',
    options: [
      { text: 'Casi nunca o nunca', score: 1 },
      { text: 'Pocas veces', score: 2 },
      { text: 'A veces (La mitad de las veces)', score: 3 },
      { text: 'La mayoría de las veces', score: 4 },
      { text: 'Casi siempre o siempre', score: 5 }
    ]
  },
  {
    id: 4,
    title: 'Dificultad hasta el Final',
    text: 'Durante el acto sexual, ¿qué tan difícil le resultó mantener la rigidez hasta completar la relación?',
    options: [
      { text: 'Extremadamente difícil', score: 1 },
      { text: 'Muy difícil', score: 2 },
      { text: 'Difícil', score: 3 },
      { text: 'Ligeramente difícil', score: 4 },
      { text: 'Sin ninguna dificultad', score: 5 }
    ]
  },
  {
    id: 5,
    title: 'Satisfacción Global',
    text: 'Cuando intentó la relación sexual, ¿con qué frecuencia resultó satisfactoria y placentera para usted?',
    options: [
      { text: 'Casi nunca o nunca', score: 1 },
      { text: 'Pocas veces', score: 2 },
      { text: 'A veces', score: 3 },
      { text: 'La mayoría de las veces', score: 4 },
      { text: 'Casi siempre o siempre', score: 5 }
    ]
  }
];

const answers = ref({});
const isSubmitted = ref(false);

const totalQuestions = questions.length;
const answeredCount = computed(() => Object.keys(answers.value).length);
const isComplete = computed(() => answeredCount.value === totalQuestions);

const totalScore = computed(() => {
  return Object.values(answers.value).reduce((acc, curr) => acc + curr, 0);
});

const resultClassification = computed(() => {
  const s = totalScore.value;
  if (s >= 22) {
    return {
      severity: 'Función Eréctil Normal',
      colorBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      colorBg: 'bg-emerald-50/80 border-emerald-200',
      colorText: 'text-emerald-950',
      scoreText: `${s} / 25 Puntos (Rango Óptimo)`,
      summary: 'Tu salud sexual y función eréctil se ubican en parámetros fisiológicos excelentes.',
      detail: 'Los resultados reflejan un adecuado flujo sanguíneo vascular y equilibrio hormonal. Para conservar este nivel, mantén actividad física regular, dieta balanceada y chequeos periódicos de tensión arterial y perfil lipídico.',
      urgency: 'Control preventivo anual habitual.'
    };
  } else if (s >= 17) {
    return {
      severity: 'Disfunción Leve',
      colorBadge: 'bg-amber-100 text-amber-800 border-amber-300',
      colorBg: 'bg-amber-50/80 border-amber-200',
      colorText: 'text-amber-950',
      scoreText: `${s} / 25 Puntos (Variación Leve)`,
      summary: 'Presentas ligeras fluctuaciones en la firmeza o en el mantenimiento de la erección.',
      detail: 'En esta etapa temprana suele estar influenciada por estrés laboral, falta de descanso, sobrepeso o ligeras alteraciones vasculares. Con orientación urológica oportuna y ajustes de hábitos se revierte con facilidad sin necesidad de tratamientos invasivos.',
      urgency: 'Consulta urológica recomendada para descartar factores de fatiga o inicio vascular.'
    };
  } else if (s >= 12) {
    return {
      severity: 'Disfunción Leve a Moderada',
      colorBadge: 'bg-orange-100 text-orange-800 border-orange-300',
      colorBg: 'bg-orange-50/80 border-orange-200',
      colorText: 'text-orange-950',
      scoreText: `${s} / 25 Puntos (Grado Leve-Moderado)`,
      summary: 'Dificultades frecuentes que pueden estar generando ansiedad o frustración en tu vida íntima.',
      detail: 'Es el momento adecuado para una evaluación especializada. El Dr. Lisandro evaluará tu flujo vascular, niveles de testosterona libre, glucosa y estado prostático para estructurar una terapia médica adaptada a tus necesidades personales.',
      urgency: 'Evaluación urológica recomendada para iniciar terapia médica con alta tasa de respuesta.'
    };
  } else if (s >= 8) {
    return {
      severity: 'Disfunción Moderada',
      colorBadge: 'bg-rose-100 text-rose-800 border-rose-300',
      colorBg: 'bg-rose-50/80 border-rose-200',
      colorText: 'text-rose-950',
      scoreText: `${s} / 25 Puntos (Grado Moderado)`,
      summary: 'Pérdida notoria de firmeza que dificulta completar la relación de forma habitual.',
      detail: 'Hoy en día la andrología urológica ofrece múltiples alternativas terapéuticas modernas con más de 90% de éxito. No debes resignarte ni automedicarte fármacos sin supervisión médica, ya que puede haber causas vasculares tratables.',
      urgency: 'Consulta médica prioritaria con el especialista.'
    };
  } else {
    return {
      severity: 'Disfunción Severa',
      colorBadge: 'bg-red-100 text-red-900 border-red-300',
      colorBg: 'bg-red-50/80 border-red-200',
      colorText: 'text-red-950',
      scoreText: `${s} / 25 Puntos (Grado Severo)`,
      summary: 'Dificultad marcada y constante para lograr o sostener la rigidez.',
      detail: 'Es fundamental realizar una evaluación urológica integral que revise el estado cardiovascular, diabetes, hipertensión o secuelas de cirugías pélvicas. La medicina urológica cuenta con opciones avanzadas de alta efectividad.',
      urgency: 'Valoración urológica médica requerida para diagnóstico integral.'
    };
  }
});

const selectOption = (questionId, score) => {
  answers.value[questionId] = score;
};

const submitQuiz = () => {
  if (isComplete.value) {
    isSubmitted.value = true;
    window.scrollTo({ top: 350, behavior: 'smooth' });
  }
};

const resetQuiz = () => {
  answers.value = {};
  isSubmitted.value = false;
  window.scrollTo({ top: 200, behavior: 'smooth' });
};

const contactWhatsAppPrivate = () => {
  const s = totalScore.value;
  const sev = resultClassification.value.severity;
  const text = `Hola Dr. Lisandro Márquez / Asistente. Acabo de realizar el Test de Salud Masculina (IIEF-5) en su web oficial y obtuve un puntaje de ${s}/25 (${sev}). Me gustaría agendar una consulta médica confidencial en Caracas para valoración personalizada.`;
  const url = `https://api.whatsapp.com/send?phone=584241851027&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

const printResult = () => {
  window.print();
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    
    <!-- Aviso de Confidencialidad y Anonimato -->
    <div class="mb-8 p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xl flex-shrink-0">
          🔒
        </div>
        <div>
          <h4 class="text-sm font-extrabold text-white">100% Anónimo & Confidencial</h4>
          <p class="text-xs text-slate-300">Tus respuestas no se guardan en ninguna base de datos ni se vinculan con tu nombre.</p>
        </div>
      </div>
      <span class="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-sky-300 border border-white/10 whitespace-nowrap">
        Escala Médica IIEF-5 (SHIM)
      </span>
    </div>

    <!-- Si el cuestionario aún NO ha sido enviado -->
    <div v-if="!isSubmitted" class="space-y-6">
      
      <!-- Barra de Progreso -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
        <div class="flex-1">
          <div class="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
            <span>Progreso del Cuestionario</span>
            <span class="text-sky-600 font-extrabold">{{ answeredCount }} de {{ totalQuestions }} respondidas</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              class="bg-[#0EA5E9] h-2.5 rounded-full transition-all duration-300"
              :style="{ width: `${(answeredCount / totalQuestions) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Preguntas del Test -->
      <div 
        v-for="(q, qIdx) in questions"
        :key="q.id"
        class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm transition-all"
        :class="answers[q.id] ? 'border-sky-300 shadow-sky-500/5' : 'hover:border-slate-300'"
      >
        <div class="flex items-start gap-3.5 mb-4">
          <span class="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
            {{ qIdx + 1 }}
          </span>
          <div>
            <h3 class="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {{ q.text }}
            </h3>
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-1">
              {{ q.title }}
            </span>
          </div>
        </div>

        <!-- Opciones de Respuesta -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          <button
            v-for="opt in q.options"
            :key="opt.score"
            type="button"
            @click="selectOption(q.id, opt.score)"
            class="flex items-center justify-between p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            :class="[
              answers[q.id] === opt.score
                ? 'bg-sky-50 text-sky-900 border-sky-500 font-bold shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            ]"
          >
            <span>{{ opt.text }}</span>
            <span 
              class="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] flex-shrink-0 ml-2"
              :class="answers[q.id] === opt.score ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 bg-white'"
            >
              <span v-if="answers[q.id] === opt.score">✓</span>
            </span>
          </button>
        </div>
      </div>

      <!-- Botón de Envío -->
      <div class="pt-4 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-xs text-slate-500 text-center sm:text-left">
          * Para obtener tu cálculo clínico exacto debes responder las 5 preguntas.
        </p>

        <button
          type="button"
          @click="submitQuiz"
          :disabled="!isComplete"
          class="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-sm transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
          :class="[
            isComplete
              ? 'bg-[#0EA5E9] hover:bg-[#0284C7] text-white shadow-sky-500/25 scale-102'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          ]"
        >
          <span>📊</span>
          <span>Calcular Resultado del Test</span>
        </button>
      </div>

    </div>

    <!-- Si el cuestionario YA fue completado (Pantalla de Resultados) -->
    <div v-else class="space-y-6">
      
      <div class="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        <!-- Header de Resultados -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-sky-400">Resultado Oficial IIEF-5</span>
            <h3 class="text-2xl sm:text-3xl font-black text-white mt-1">
              {{ resultClassification.severity }}
            </h3>
            <p class="text-xs sm:text-sm text-sky-200 mt-1">
              {{ resultClassification.scoreText }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="printResult"
              class="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            >
              🖨️ Imprimir
            </button>
            <button
              type="button"
              @click="resetQuiz"
              class="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            >
              🔄 Repetir
            </button>
          </div>
        </div>

        <!-- Ficha de Diagnóstico y Recomendaciones -->
        <div class="p-6 sm:p-8 space-y-6">
          
          <div 
            class="p-5 rounded-2xl border"
            :class="resultClassification.colorBg"
          >
            <div class="flex items-center gap-2 mb-2 font-extrabold text-sm" :class="resultClassification.colorText">
              <span>🩺</span>
              <span>Interpretación Médica del Especialista:</span>
            </div>
            <p class="text-sm font-bold mb-2" :class="resultClassification.colorText">
              {{ resultClassification.summary }}
            </p>
            <p class="text-xs sm:text-sm leading-relaxed text-slate-700">
              {{ resultClassification.detail }}
            </p>
          </div>

          <!-- Cuadro de Compromiso y Privacidad -->
          <div class="p-5 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="space-y-1">
              <h5 class="text-sm font-extrabold text-slate-900">
                La salud sexual masculina es un signo vital de tu salud global
              </h5>
              <p class="text-xs text-slate-600 leading-relaxed max-w-xl">
                Cualquier alteración en la firmeza puede relacionarse con la circulación arterial, niveles hormonales de testosterona o próstata. Consultar con un urólogo es el paso más seguro para resolverlo con respaldo científico.
              </p>
            </div>

            <!-- Botones de Acción Inmediata -->
            <div class="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto flex-shrink-0">
              <button
                type="button"
                @click="contactWhatsAppPrivate"
                class="px-5 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>💬</span>
                <span>Consulta Discreta por WhatsApp</span>
              </button>

              <button
                type="button"
                @click="$emit('openBookingWithService', 1)"
                class="px-5 py-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>📅</span>
                <span>Agendar Cita en Consultorio</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>

  </div>
</template>
