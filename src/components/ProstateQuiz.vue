<script setup>
import { ref, computed } from 'vue';

defineEmits(['openBookingWithService']);

const currentStep = ref(0);
const answers = ref({});

const questions = [
  {
    id: 'frecuencia',
    title: '1. Frecuencia Urinaria',
    desc: '¿Con qué frecuencia sientes la necesidad de orinar antes de que pasen dos horas desde la última vez?',
    options: [
      { text: 'Rara vez o casi nunca', score: 0 },
      { text: 'Ocasionalmente (menos de la mitad de las veces)', score: 1 },
      { text: 'Frecuentemente (más de la mitad de las veces)', score: 2 },
      { text: 'Casi siempre o todo el tiempo', score: 3 }
    ]
  },
  {
    id: 'nicturia',
    title: '2. Interrupciones Nocturnas',
    desc: '¿Cuántas veces sueles levantarte durante la noche para orinar?',
    options: [
      { text: 'Ninguna o máximo 1 vez', score: 0 },
      { text: '2 veces por noche', score: 1 },
      { text: '3 a 4 veces por noche', score: 2 },
      { text: '5 o más veces por noche', score: 3 }
    ]
  },
  {
    id: 'fuerza',
    title: '3. Fuerza del Chorro Urinario',
    desc: '¿Has notado que la fuerza o el calibre del chorro de orina es débil o se entrecorta?',
    options: [
      { text: 'Chorro fuerte y continuo sin dificultad', score: 0 },
      { text: 'Ligera disminución de fuerza algunas veces', score: 1 },
      { text: 'Chorro débil evidente o con esfuerzo', score: 2 },
      { text: 'Chorro muy fino, goteo o micción entrecortada', score: 3 }
    ]
  },
  {
    id: 'urgencia',
    title: '4. Urgencia o Dificultad para Retener',
    desc: '¿Te ha resultado difícil aguantar las ganas de orinar cuando sobreviene el deseo?',
    options: [
      { text: 'No, puedo esperar con total tranquilidad', score: 0 },
      { text: 'A veces siento una urgencia moderada', score: 1 },
      { text: 'Frecuentemente debo buscar un baño inmediato', score: 2 },
      { text: 'Sensación de urgencia extrema o goteo involuntario', score: 3 }
    ]
  }
];

const totalScore = computed(() => {
  return Object.values(answers.value).reduce((acc, curr) => acc + curr, 0);
});

const progress = computed(() => {
  return ((currentStep.value + 1) / questions.length) * 100;
});

const selectOption = (qId, score) => {
  answers.value[qId] = score;
  currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--;
};

const restart = () => {
  currentStep.value = 0;
  answers.value = {};
};
</script>

<template>
  <section id="evaluacion" class="py-12 lg:py-16 bg-[#F8FAFC] border-b border-slate-200">
    <div class="max-w-3xl mx-auto px-4 sm:px-6">
      
      <!-- Card Principal del Cuestionario -->
      <div class="bg-white rounded-3xl p-6 sm:p-9 shadow-lg border border-slate-200">
        
        <!-- Preguntas Activas -->
        <div v-if="currentStep < questions.length">
          <!-- Barra de Progreso -->
          <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-6">
            <div class="h-full bg-[#0EA5E9] transition-all duration-300" :style="{ width: `${progress}%` }"></div>
          </div>

          <div class="mb-6">
            <span class="bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Pregunta {{ currentStep + 1 }} de {{ questions.length }}
            </span>
            <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3 mb-1">
              {{ questions[currentStep].title }}
            </h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              {{ questions[currentStep].desc }}
            </p>
          </div>

          <!-- Opciones de Respuesta -->
          <div class="space-y-3 mb-6">
            <button v-for="(opt, idx) in questions[currentStep].options" 
                    :key="idx"
                    type="button"
                    @click="selectOption(questions[currentStep].id, opt.score)"
                    class="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/60 transition-all flex items-center gap-3.5 group cursor-pointer">
              <span class="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#0EA5E9] group-hover:text-white font-bold text-xs flex items-center justify-center transition flex-shrink-0 text-slate-700">
                {{ String.fromCharCode(65 + idx) }}
              </span>
              <span class="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-sky-950">
                {{ opt.text }}
              </span>
            </button>
          </div>

          <div v-if="currentStep > 0" class="flex justify-start">
            <button type="button" @click="prevStep" class="text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer">
              ← Volver a la pregunta anterior
            </button>
          </div>
        </div>

        <!-- Pantalla de Resultados -->
        <div v-else class="text-center py-4 animate-fade-in">
          <span class="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold mb-4"
                :class="totalScore <= 3 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : totalScore <= 7 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-rose-100 text-rose-800 border border-rose-200'">
            {{ totalScore <= 3 ? 'Puntuación Leve (0 - 3 pts)' : totalScore <= 7 ? 'Puntuación Moderada (4 - 7 pts)' : 'Puntuación Significativa (8 - 12 pts)' }}
          </span>

          <h3 class="text-2xl font-extrabold text-slate-900 mb-2">Resultado de tu Autoevaluación Urológica</h3>
          <p class="text-xs sm:text-sm text-slate-600 mb-6 max-w-lg mx-auto leading-relaxed">
            {{ totalScore <= 3 ? 'Tus respuestas reflejan una salud urinaria dentro de parámetros habituales.' : totalScore <= 7 ? 'Presentas síntomas compatibles con crecimiento prostático leve a moderado.' : 'Existe un impacto evidente en tu bienestar urinario y descanso nocturno.' }}
          </p>

          <div class="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-left max-w-xl mx-auto mb-6 text-xs sm:text-sm leading-relaxed text-slate-700">
            <strong class="text-sky-900 block mb-1.5 font-bold">Recomendación Médica del Dr. Lisandro Márquez:</strong>
            <p v-if="totalScore <= 3">
              Si eres mayor de 45 años (o 40 con antecedentes), se sugiere tu Chequeo Prostático Preventivo y Antígeno (PSA) anual para mantener el control de rutina.
            </p>
            <p v-else-if="totalScore <= 7">
              Se recomienda agendar una consulta médica especializada para valorar la próstata con ecografía y analítica, evitando que la dificultad para orinar avance.
            </p>
            <p v-else>
              Es altamente recomendable solicitar una consulta de valoración urológica con 3 Ecos para diagnosticar la causa exacta de la obstrucción y recibir tratamiento eficaz.
            </p>
          </div>

          <div class="flex flex-wrap justify-center gap-3 mb-4">
            <button type="button" 
                    @click="$emit('openBookingWithService', 2)"
                    class="px-6 py-3 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-sky-500/25 transition cursor-pointer">
              📅 Agendar Consulta con el Dr. Lisandro
            </button>
            <button type="button" 
                    @click="restart"
                    class="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer">
              🔄 Repetir Evaluación
            </button>
          </div>

          <small class="text-[11px] text-slate-400 block mt-2">
            * Herramienta informativa basada en el índice internacional IPSS. No sustituye la consulta médica presencial.
          </small>
        </div>

      </div>

    </div>
  </section>
</template>
