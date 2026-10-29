<script setup>
import { ref } from 'vue';

const emit = defineEmits(['openBooking']);

const activeTab = ref('renal');

const echoes = {
  renal: {
    id: 'renal',
    name: '1. Ecografía Renal',
    organ: 'Riñones (Bilateral)',
    color: 'sky',
    badgeText: 'Filtro Renal & Cálculos',
    icon: '🫘',
    imageTag: 'Evaluación del Parénquima y Vía Excretora',
    queDetecta: [
      {
        titulo: 'Cálculos y Litiasis Renal',
        desc: 'Detecta piedras desde pocos milímetros hasta litiasis complejas antes de que desciendan al uréter y provoquen un cólico nefrítico.'
      },
      {
        titulo: 'Hidronefrosis (Retención en el Riñón)',
        desc: 'Identifica dilatación de los cálices renales ocasionada por obstrucciones urinarias bajas no tratadas (próstata crecida o piedras trabadas).'
      },
      {
        titulo: 'Quistes Renales y Masas Sólidas',
        desc: 'Clasifica quistes simples benignos y pesquisa de forma precoz lesiones tumorales asintomáticas en etapa temprana curable.'
      },
      {
        titulo: 'Grosor de la Corteza Renal',
        desc: 'Verifica la salud del tejido funcional del riñón para prevenir insuficiencia renal crónica silenciosa.'
      }
    ],
    parametros: [
      { label: 'Longitud Normal', val: '10 a 12 cm' },
      { label: 'Espesor Cortical', val: '> 14 - 15 mm' },
      { label: 'Sistema Colector', val: 'Sin dilatación' }
    ],
    fraseEspecialista: 'Un cálculo diagnosticado a tiempo en el riñón se puede resolver de forma programada con láser o tratamiento médico, evitando el dolor de una emergencia nocturna.'
  },
  vesical: {
    id: 'vesical',
    name: '2. Ecografía Vesical',
    organ: 'Vejiga Urinaria (Pre y Post-Miccional)',
    color: 'cyan',
    badgeText: 'Capacidad & Residuo Oculto',
    icon: '💧',
    imageTag: 'Dinámica de Vaciado y Esfuerzo Vesical',
    queDetecta: [
      {
        titulo: 'Residuo Post-Miccional (RPM)',
        desc: 'Calcula con precisión matemática cuánta orina se queda retenida dentro de la vejiga después de orinar en el baño del consultorio.'
      },
      {
        titulo: 'Vejiga de Lucha o Esfuerzo',
        desc: 'Detecta engrosamiento de las paredes musculares y trabeculaciones causadas por hacer fuerza prolongada para orinar.'
      },
      {
        titulo: 'Divertículos y Pólipos Vesicales',
        desc: 'Visualiza saculaciones anormales en la pared de la vejiga y lesiones en la mucosa (pólipos o papilomas) con alta definición.'
      },
      {
        titulo: 'Cálculos Vesicales Secundarios',
        desc: 'Identifica piedras formadas en la vejiga por estasis de orina y vaciado incompleto crónico.'
      }
    ],
    parametros: [
      { label: 'Residuo Normal', val: '< 10% del total' },
      { label: 'Pared Vesical Llena', val: '< 3 a 5 mm' },
      { label: 'Mucosa Interna', val: 'Lisa y homogénea' }
    ],
    fraseEspecialista: 'El residuo post-miccional es el termómetro real del paciente: muchos hombres creen que orinan bien, pero la ecografía revela que dejan medio vaso de orina estancado.'
  },
  prostatica: {
    id: 'prostatica',
    name: '3. Ecografía Prostática',
    organ: 'Glándula Prostática & Vesículas Seminales',
    color: 'indigo',
    badgeText: 'Volumen & Lóbulo Medio',
    icon: '🛡️',
    imageTag: 'Morfología y Grado de Crecimiento',
    queDetecta: [
      {
        titulo: 'Volumen y Peso Prostático (Gramos / cc)',
        desc: 'Mide con exactitud el tamaño de la próstata para clasificar el grado de Hiperplasia Prostática Benigna (HPB Grado I a IV).'
      },
      {
        titulo: 'Crecimiento del Lóbulo Medio',
        desc: 'Examina si la porción central de la próstata creció hacia adentro de la vejiga, funcionando como una válvula de tapón obstructivo.'
      },
      {
        titulo: 'Integridad Capsular y Asimetrías',
        desc: 'Evalúa la regularidad de los bordes glandulares y zonas ecográficas periféricas sospechosas para correlacionar con el PSA.'
      },
      {
        titulo: 'Calcificaciones y Prostatitis Previa',
        desc: 'Detecta microcalcificaciones intraprostáticas que evidencian inflamaciones o infecciones crónicas pasadas.'
      }
    ],
    parametros: [
      { label: 'Volumen Normal Joven', val: '15 a 25 cc' },
      { label: 'Hiperplasia Moderada', val: '40 a 60 cc' },
      { label: 'Lóbulo Medio', val: 'Intravesical / Extra' }
    ],
    fraseEspecialista: 'No todas las próstatas grandes necesitan cirugía: lo que define la conducta médica no es solo el peso en gramos, sino cuánto obstruye el flujo y cómo afecta a los riñones.'
  }
};
</script>

<template>
  <section class="py-12 bg-white border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      
      <!-- Encabezado de la Infografía -->
      <div class="text-center max-w-3xl mx-auto mb-10">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-sky-50 text-sky-700 border border-sky-200 mb-3">
          Diagnóstico Integral UCV
        </span>
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          La Consulta Integral con 3 Ecos en una Sola Cita
        </h2>
        <p class="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
          El Dr. Lisandro Márquez realiza una <strong>evaluación ecográfica simultánea de los tres órganos del tracto urinario</strong> en el mismo acto médico. Descubre qué revela cada ecografía:
        </p>
      </div>

      <!-- Pestañas Interactivas de los 3 Ecos -->
      <div class="flex flex-col sm:flex-row justify-center gap-3 mb-8">
        <button
          v-for="eco in echoes"
          :key="eco.id"
          type="button"
          @click="activeTab = eco.id"
          class="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-extrabold text-sm transition-all cursor-pointer border shadow-xs"
          :class="[
            activeTab === eco.id
              ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-102 ring-2 ring-sky-500/20'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
          ]"
        >
          <span class="text-2xl">{{ eco.icon }}</span>
          <div class="text-left">
            <span class="block text-xs uppercase tracking-wider text-sky-400 font-bold" v-if="activeTab === eco.id">Activo</span>
            <span class="block text-sm font-extrabold">{{ eco.name }}</span>
          </div>
        </button>
      </div>

      <!-- Tarjeta Interactiva del Eco Activo -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-3xl text-white shadow-2xl p-6 sm:p-10 border border-slate-800 relative overflow-hidden">
        
        <!-- Fondo decorativo abstracto -->
        <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          
          <!-- Columna Izquierda: Información Principal y Parámetros (5 cols) -->
          <div class="lg:col-span-5 space-y-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 mb-3">
                <span>{{ echoes[activeTab].icon }}</span>
                <span>{{ echoes[activeTab].badgeText }}</span>
              </div>
              <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {{ echoes[activeTab].name }}
              </h3>
              <p class="text-xs sm:text-sm text-sky-200 font-semibold mt-1">
                Órgano: {{ echoes[activeTab].organ }}
              </p>
            </div>

            <!-- Fila de Parámetros Médicos Clave -->
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span class="text-[11px] font-extrabold uppercase tracking-wider text-sky-400 block">
                Valores de Referencia Ecográfica:
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div 
                  v-for="(p, i) in echoes[activeTab].parametros" 
                  :key="i"
                  class="bg-black/20 p-2.5 rounded-xl border border-white/5"
                >
                  <p class="text-[10px] text-slate-400 font-medium">{{ p.label }}</p>
                  <p class="text-xs font-black text-white mt-0.5">{{ p.val }}</p>
                </div>
              </div>
            </div>

            <!-- Testimonio Clínico del Dr. Márquez -->
            <div class="p-4.5 rounded-2xl bg-sky-900/30 border border-sky-500/20 relative">
              <div class="flex items-center gap-2 text-sky-300 font-bold text-xs mb-1.5">
                <span>👨‍⚕️</span>
                <span>Criterio del Dr. Lisandro Márquez:</span>
              </div>
              <p class="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                "{{ echoes[activeTab].fraseEspecialista }}"
              </p>
            </div>

            <!-- Botón CTA para agendar con 3 Ecos -->
            <button
              type="button"
              @click="$emit('openBooking')"
              class="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-[#0EA5E9] hover:bg-[#38BDF8] text-white shadow-lg shadow-sky-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📅</span>
              <span>Agendar Evaluación Completa con 3 Ecos</span>
            </button>
          </div>

          <!-- Columna Derecha: ¿Qué Detecta Esta Ecografía? (7 cols) -->
          <div class="lg:col-span-7 bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 class="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                <span>🔍</span>
                <span>Hallazgos Clínicos que Permite Detectar</span>
              </h4>
              <span class="text-xs font-bold text-sky-300 bg-sky-900/50 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                Alta Precisión
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div
                v-for="(item, idx) in echoes[activeTab].queDetecta"
                :key="idx"
                class="p-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-sky-500/40 transition-all space-y-1.5"
              >
                <div class="flex items-center gap-2 text-sky-400 font-extrabold text-xs sm:text-sm">
                  <span>✓</span>
                  <span>{{ item.titulo }}</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  {{ item.desc }}
                </p>
              </div>
            </div>

            <!-- Por qué los 3 Ecos en Conjunto -->
            <div class="mt-4 p-4 rounded-xl bg-gradient-to-r from-sky-950/80 to-slate-900/80 border border-sky-500/30 flex items-start gap-3">
              <span class="text-xl">💡</span>
              <div class="text-xs text-sky-100 leading-relaxed">
                <strong class="text-sky-300">¿Por qué nunca deben hacerse por separado?</strong> 
                Una próstata agrandada no se puede evaluar a ciegas sin ver si la orina retenida en la vejiga ya está causando reflujo retrógrado hacia los riñones. La tríada completa garantiza un diagnóstico 100% seguro.
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  </section>
</template>
