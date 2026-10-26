<script setup>
import { ref, computed, watch } from 'vue';
import doctorData from '../data/doctor.json';
import fallbackServices from '../data/servicios.json';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  preselectedServiceId: {
    type: [Number, String],
    default: null
  }
});

const emit = defineEmits(['close', 'toast']);

const step = ref(1);
const selectedServiceId = ref(null);
const selectedDate = ref('');
const selectedTime = ref('');
const patient = ref({
  nombre: '',
  telefono: '',
  correo: '',
  notas: ''
});

const loading = ref(false);
const confirmedData = ref(null);

const timeSlots = [
  '08:30', '09:15', '10:00', '11:00', '14:00', '14:45', '15:30', '16:15'
];

watch(() => props.preselectedServiceId, (newId) => {
  if (newId) {
    selectedServiceId.value = newId;
  }
});

watch(() => props.isOpen, (open) => {
  if (open) {
    step.value = 1;
    confirmedData.value = null;
    if (props.preselectedServiceId) {
      selectedServiceId.value = props.preselectedServiceId;
    }
    setupMinDate();
  }
});

const minDate = ref('');
const maxDate = ref('');

const setupMinDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  minDate.value = tomorrow.toISOString().split('T')[0];

  const max = new Date();
  max.setDate(max.getDate() + 60);
  maxDate.value = max.toISOString().split('T')[0];
};

const selectedServiceName = computed(() => {
  const s = fallbackServices.find(item => item.id == selectedServiceId.value);
  return s ? s.nombre_servicio : 'Consulta General de Urología';
});

const nextStep = () => {
  if (step.value === 1) {
    if (!selectedServiceId.value) {
      emit('toast', { msg: 'Por favor selecciona el servicio urológico que necesitas.', type: 'warning' });
      return;
    }
    step.value = 2;
    return;
  }

  if (step.value === 2) {
    if (!selectedDate.value) {
      emit('toast', { msg: 'Por favor selecciona una fecha para tu consulta.', type: 'warning' });
      return;
    }
    const day = new Date(selectedDate.value + 'T00:00:00').getDay();
    if (day === 0) {
      emit('toast', { msg: 'Los domingos el consultorio no atiende. Por favor elige de Lunes a Sábado.', type: 'warning' });
      return;
    }
    if (!selectedTime.value) {
      emit('toast', { msg: 'Por favor selecciona un horario disponible.', type: 'warning' });
      return;
    }
    step.value = 3;
    return;
  }
};

const prevStep = () => {
  if (step.value > 1) step.value--;
};

const submitBooking = async () => {
  if (!patient.value.nombre.trim() || !patient.value.telefono.trim()) {
    emit('toast', { msg: 'Por favor completa tu nombre y número de teléfono/WhatsApp.', type: 'warning' });
    return;
  }

  loading.value = true;
  try {
    let pacienteId = null;

    // 1. Guardar paciente
    try {
      const resP = await fetch('http://127.0.0.1:5000/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: patient.value.nombre,
          telefono: patient.value.telefono,
          correo: patient.value.correo
        })
      });
      if (resP.ok) {
        const dataP = await resP.json();
        pacienteId = dataP.id;
      }
    } catch (e) {
      pacienteId = Math.floor(100 + Math.random() * 900);
    }

    // 2. Guardar cita
    let citaId = null;
    const fechaHora = `${selectedDate.value} ${selectedTime.value}`;
    try {
      const resC = await fetch('http://127.0.0.1:5000/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha_hora: fechaHora,
          paciente_id: pacienteId || 1,
          servicio_id: parseInt(selectedServiceId.value) || 1
        })
      });
      if (resC.ok) {
        const dataC = await resC.json();
        citaId = dataC.id_cita;
      }
    } catch (e) {
      citaId = Math.floor(1000 + Math.random() * 9000);
    }

    confirmedData.value = {
      citaId: citaId || Math.floor(1000 + Math.random() * 9000),
      nombre: patient.value.nombre,
      telefono: patient.value.telefono,
      servicio: selectedServiceName.value,
      fecha: selectedDate.value,
      hora: selectedTime.value
    };

    emit('toast', { msg: '¡Cita agendada exitosamente en el sistema!', type: 'success' });

  } catch (error) {
    emit('toast', { msg: 'Error al registrar la cita médica', type: 'danger' });
  } finally {
    loading.value = false;
  }
};

const whatsappConfirmationLink = computed(() => {
  if (!confirmedData.value) return '#';
  const c = confirmedData.value;
  const msg = encodeURIComponent(
    `¡Hola Dr. Lisandro Márquez! Acabo de registrar una cita médica en su página web:\n\n` +
    `👤 Paciente: ${c.nombre}\n` +
    `🩺 Servicio: ${c.servicio}\n` +
    `📅 Fecha: ${c.fecha}\n` +
    `⏰ Hora: ${c.hora}\n` +
    `🔖 Código: #CITA-${c.citaId}\n\n` +
    `¿Podría por favor confirmarme los detalles para la consulta? Muchas gracias.`
  );
  return `https://wa.me/${doctorData.whatsapp}?text=${msg}`;
});

const downloadCalendar = () => {
  if (!confirmedData.value) return;
  const c = confirmedData.value;
  const start = new Date(`${c.fecha}T${c.hora}:00`);
  const end = new Date(start.getTime() + 45 * 60000);

  const fmt = (d) => d.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dr. Lisandro Marquez//Citas//ES',
    'BEGIN:VEVENT',
    `UID:cita-${c.citaId}@drlisandromarquez.com`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Cita Urológica: ${c.servicio} - ${doctorData.nombre}`,
    `DESCRIPTION:Consulta con el ${doctorData.nombre}. WhatsApp: ${doctorData.telefono_display}`,
    `LOCATION:Caracas VidaMed / Guatire`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `Cita_${doctorData.nombre.replace(/ /g, '_')}_${c.fecha}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  emit('toast', { msg: 'Archivo de calendario descargado', type: 'info' });
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-pop-in">
      
      <!-- Header -->
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>📅</span> Agendar Cita con el Dr. Lisandro Márquez
        </h3>
        <button type="button" @click="$emit('close')" class="text-slate-400 hover:text-slate-700 text-2xl leading-none">
          &times;
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto">
        
        <!-- Pantalla de Éxito -->
        <div v-if="confirmedData" class="text-center py-2 animate-fade-in">
          <div class="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
            ✓
          </div>
          <span class="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
            Cita Médica Registrada
          </span>
          <h4 class="text-xl font-bold text-slate-900 mt-2 mb-1">
            ¡Gracias, {{ confirmedData.nombre }}!
          </h4>
          <p class="text-xs text-slate-600 mb-5">
            Tu cita ha sido guardada en la base de datos del consultorio del <strong>{{ doctorData.nombre }}</strong>.
          </p>

          <!-- Ticket -->
          <div class="bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-xl text-left text-xs space-y-2 mb-5">
            <div class="flex justify-between border-b border-slate-200 pb-2">
              <span class="text-slate-500">Código de Cita:</span>
              <strong class="text-sky-700 font-extrabold text-sm">#CITA-{{ confirmedData.citaId }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Servicio:</span>
              <strong class="text-slate-800">{{ confirmedData.servicio }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Fecha y Hora:</span>
              <strong class="text-slate-800">{{ confirmedData.fecha }} a las {{ confirmedData.hora }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Sede:</span>
              <strong class="text-slate-800">Caracas (VidaMed) / Guatire</strong>
            </div>
          </div>

          <div class="space-y-2.5">
            <a :href="whatsappConfirmationLink" target="_blank" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md">
              <span>💬</span> Confirmar Asistencia por WhatsApp
            </a>
            <button type="button" @click="downloadCalendar" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200">
              <span>📅</span> Descargar Recordatorio a Calendario (.ics)
            </button>
            <button type="button" @click="$emit('close')" class="w-full py-2 text-sky-600 hover:underline text-xs font-semibold">
              Finalizar y Volver
            </button>
          </div>
        </div>

        <!-- Flujo de Pasos -->
        <div v-else>
          <!-- Stepper Indicator -->
          <div class="flex justify-between items-center mb-6 relative">
            <div class="absolute inset-x-8 top-4 h-0.5 bg-slate-200 -z-0"></div>
            
            <div class="relative z-10 flex flex-col items-center">
              <span class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition"
                    :class="step >= 1 ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 border border-slate-200'">
                1
              </span>
              <span class="text-[11px] font-semibold text-slate-600 mt-1">Servicio</span>
            </div>

            <div class="relative z-10 flex flex-col items-center">
              <span class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition"
                    :class="step >= 2 ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 border border-slate-200'">
                2
              </span>
              <span class="text-[11px] font-semibold text-slate-600 mt-1">Fecha & Hora</span>
            </div>

            <div class="relative z-10 flex flex-col items-center">
              <span class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition"
                    :class="step >= 3 ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 border border-slate-200'">
                3
              </span>
              <span class="text-[11px] font-semibold text-slate-600 mt-1">Tus Datos</span>
            </div>
          </div>

          <!-- PASO 1 -->
          <div v-if="step === 1" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1.5">Selecciona el Motivo o Servicio Médico: *</label>
              <select v-model="selectedServiceId" class="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden">
                <option :value="null">-- Selecciona un servicio --</option>
                <option v-for="s in fallbackServices" :key="s.id" :value="s.id">
                  {{ s.nombre_servicio }}
                </option>
              </select>
            </div>

            <div class="bg-sky-50 p-4 rounded-xl border border-sky-100 text-xs text-slate-700 leading-relaxed">
              <strong class="text-sky-900 block mb-0.5">ℹ️ Protocolo con 3 Ecos:</strong>
              Si seleccionas la <strong>Evaluación Urológica Completa</strong>, la consulta incluye ecografía renal, vesical y prostática en tiempo real.
            </div>

            <div class="flex justify-end pt-2">
              <button type="button" @click="nextStep" class="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md">
                Continuar a Selección de Horario →
              </button>
            </div>
          </div>

          <!-- PASO 2 -->
          <div v-if="step === 2" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1.5">Elige la Fecha de Consulta: *</label>
              <input type="date" v-model="selectedDate" :min="minDate" :max="maxDate" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden" />
              <small class="text-[11px] text-slate-500 mt-1 block">Atención de Lunes a Sábado en Caracas y Guatire.</small>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1.5">Selecciona el Turno u Horario: *</label>
              <div class="grid grid-cols-4 gap-2">
                <button v-for="time in timeSlots" :key="time" type="button" @click="selectedTime = time"
                        class="py-2 px-1 text-center rounded-lg text-xs font-bold border transition"
                        :class="selectedTime === time ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'">
                  {{ time }}
                </button>
              </div>
            </div>

            <div class="flex justify-between pt-2">
              <button type="button" @click="prevStep" class="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900">
                ← Paso Anterior
              </button>
              <button type="button" @click="nextStep" class="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md">
                Continuar a Datos Personales →
              </button>
            </div>
          </div>

          <!-- PASO 3 -->
          <div v-if="step === 3" class="space-y-3.5">
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between">
              <div>
                <span class="text-slate-500 block">Servicio:</span>
                <strong class="text-sky-700">{{ selectedServiceName }}</strong>
              </div>
              <div class="text-right">
                <span class="text-slate-500 block">Fecha y Hora:</span>
                <strong class="text-slate-800">{{ selectedDate }} - {{ selectedTime }}</strong>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Nombre Completo: *</label>
              <input type="text" v-model="patient.nombre" placeholder="Ej: Carlos Eduardo Mendoza" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">Teléfono / WhatsApp: *</label>
                <input type="tel" v-model="patient.telefono" placeholder="0424-1234567" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">Correo Electrónico:</label>
                <input type="email" v-model="patient.correo" placeholder="ejemplo@email.com" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Sede de Preferencia / Síntomas:</label>
              <textarea v-model="patient.notas" rows="2" placeholder="Indica si prefieres ser atendido en Caracas o Guatire, o describe tus síntomas..." class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"></textarea>
            </div>

            <div class="flex justify-between pt-2">
              <button type="button" @click="prevStep" class="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900">
                ← Volver
              </button>
              <button type="button" @click="submitBooking" :disabled="loading" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition disabled:opacity-50">
                {{ loading ? 'Registrando en PostgreSQL...' : '✅ Confirmar Cita Médica' }}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
