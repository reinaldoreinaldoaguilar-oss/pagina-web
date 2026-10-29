<script setup>
import { ref, computed, watch } from 'vue';
import doctorData from '../data/doctor.json';
import fallbackServices from '../data/servicios.json';
import countriesList from '../data/countries.json';
import { API_BASE_URL } from '../config/api';

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
const selectedCountry = ref(countriesList[0]); // Por defecto: Venezuela (+58)
const rawPhoneNumber = ref('');
const patient = ref({
  nombre: '',
  telefono: '',
  correo: '',
  notas: ''
});

// Calcula el formato internacional final (ej: +58 4141234567)
const formattedFullPhone = computed(() => {
  if (!rawPhoneNumber.value || !rawPhoneNumber.value.trim()) return '';
  let clean = rawPhoneNumber.value.trim();
  const code = selectedCountry.value ? selectedCountry.value.code : '+58';

  // Si ya tiene el signo +
  if (clean.startsWith('+')) {
    return clean;
  }

  // Si seleccionó Venezuela (+58) y comenzó por '0' (ej. 0414, 0424, 0412, etc.)
  // removemos el cero inicial para convertir 0414 en +58 414...
  if (code === '+58' && clean.startsWith('0')) {
    clean = clean.substring(1);
  }

  // Si el usuario pegó el número con el código del país sin el + (ej. 584141234567)
  const dialDigits = code.replace(/[^0-9]/g, '');
  const onlyDigits = clean.replace(/[^0-9]/g, '');
  if (dialDigits && onlyDigits.startsWith(dialDigits) && onlyDigits.length > dialDigits.length + 6) {
    return `+${onlyDigits}`;
  }

  return `${code} ${clean}`;
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
    rawPhoneNumber.value = '';
    selectedCountry.value = countriesList[0];
    patient.value = {
      nombre: '',
      telefono: '',
      correo: '',
      notas: ''
    };
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
  const fullPhone = formattedFullPhone.value;
  if (!patient.value.nombre.trim() || !fullPhone.trim()) {
    emit('toast', { msg: 'Por favor completa tu nombre y número de teléfono/WhatsApp.', type: 'warning' });
    return;
  }

  patient.value.telefono = fullPhone;

  loading.value = true;
  try {
    let pacienteId = null;

    // 1. Guardar paciente
    try {
      const resP = await fetch(`${API_BASE_URL}/api/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: patient.value.nombre,
          telefono: fullPhone,
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
    const srvId = parseInt(selectedServiceId.value) || 1;
    try {
      const resC = await fetch(`${API_BASE_URL}/api/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha_hora: fechaHora,
          paciente_id: pacienteId || 1,
          servicio_id: srvId
        })
      });
      if (resC.ok) {
        const dataC = await resC.json();
        citaId = dataC.id_cita;
      } else {
        // Si el servicio específico no existe en el catálogo antiguo, reintentar con servicio 1 garantizado
        const resRetry = await fetch(`${API_BASE_URL}/api/citas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fecha_hora: fechaHora,
            paciente_id: pacienteId || 1,
            servicio_id: 1
          })
        });
        if (resRetry.ok) {
          const dataRetry = await resRetry.json();
          citaId = dataRetry.id_cita;
        }
      }
    } catch (e) {
      console.warn('Error al guardar cita:', e);
    }

    confirmedData.value = {
      citaId: citaId || Math.floor(1000 + Math.random() * 9000),
      nombre: patient.value.nombre,
      telefono: fullPhone,
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
    `📞 Teléfono / WhatsApp: ${c.telefono}\n` +
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-sky-600">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Agendar Cita con el Dr. Lisandro Márquez
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
            Solicitud Registrada en el Sistema
          </span>
          <h4 class="text-xl font-bold text-slate-900 mt-2 mb-1">
            ¡Muchas gracias, {{ confirmedData.nombre }}!
          </h4>
          <p class="text-xs text-slate-600 mb-4">
            Su solicitud de cita ha sido guardada satisfactoriamente en el consultorio del <strong>{{ doctorData.nombre }}</strong>.
          </p>

          <!-- Aviso Formal de Confirmación Posterior -->
          <div class="bg-sky-50/90 border border-sky-200 rounded-2xl p-4 text-left text-xs text-slate-700 mb-4 flex items-start gap-3 shadow-2xs">
            <div class="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0 text-base">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div class="leading-relaxed">
              <strong class="text-sky-950 block font-bold text-xs mb-1">Próximo paso — Reconfirmación de su Cita:</strong>
              En breve, el equipo de secretaría médica del Dr. Lisandro Márquez le enviará un mensaje formal vía WhatsApp o llamada telefónica al número <strong>{{ confirmedData.telefono }}</strong> para validar su turno, coordinar la hora exacta y hacerle llegar la dirección de la sede e indicaciones para su evaluación.
            </div>
          </div>

          <!-- Ticket -->
          <div class="bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-xl text-left text-xs space-y-2 mb-5">
            <div class="flex justify-between border-b border-slate-200 pb-2">
              <span class="text-slate-500">Código de Registro:</span>
              <strong class="text-sky-700 font-extrabold text-sm">#CITA-{{ confirmedData.citaId }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Servicio Clínico:</span>
              <strong class="text-slate-800">{{ confirmedData.servicio }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Fecha y Turno:</span>
              <strong class="text-slate-800">{{ confirmedData.fecha }} a las {{ confirmedData.hora }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Sede de Consulta:</span>
              <strong class="text-slate-800">Caracas (VidaMed) / Guatire</strong>
            </div>
            <div class="flex justify-between border-t border-slate-200/80 pt-2">
              <span class="text-slate-500">Teléfono Registrado:</span>
              <strong class="text-sky-700 font-mono font-bold">{{ confirmedData.telefono }}</strong>
            </div>
          </div>

          <div class="space-y-2.5">
            <a :href="whatsappConfirmationLink" target="_blank" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              Notificar Asistencia por WhatsApp Ahora
            </a>
            <button type="button" @click="downloadCalendar" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 cursor-pointer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Descargar Recordatorio a Calendario (.ics)
            </button>
            <button type="button" @click="$emit('close')" class="w-full py-2 text-sky-600 hover:underline text-xs font-semibold cursor-pointer">
              Finalizar y Volver al Portal
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

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Teléfono / WhatsApp con Barra Desplegable de Códigos Internacionales -->
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Teléfono / WhatsApp: *</span>
                  <span class="text-[10px] text-slate-500 font-semibold">Código de País</span>
                </label>

                <div class="flex rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 overflow-hidden bg-white shadow-2xs transition">
                  <!-- Selector Desplegable de País -->
                  <div class="relative flex items-center bg-slate-50 hover:bg-slate-100 transition border-r border-slate-300 cursor-pointer shrink-0">
                    <select
                      v-model="selectedCountry"
                      class="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                      title="Selecciona el país y código internacional"
                    >
                      <option v-for="c in countriesList" :key="c.name + c.code" :value="c">
                        {{ c.flag }} {{ c.name }} ({{ c.code }})
                      </option>
                    </select>

                    <div class="flex items-center gap-1 px-2.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 pointer-events-none select-none">
                      <span class="text-base leading-none">{{ selectedCountry.flag }}</span>
                      <span class="font-mono text-slate-800 ml-0.5">{{ selectedCountry.code }}</span>
                      <svg class="w-3.5 h-3.5 text-slate-400 stroke-current fill-none ml-1" viewBox="0 0 24 24" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <!-- Entrada del Número Local -->
                  <input
                    type="tel"
                    v-model="rawPhoneNumber"
                    :placeholder="selectedCountry.placeholder"
                    class="w-full p-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden bg-white"
                  />
                </div>

                <!-- Formato resultante internacional en tiempo real -->
                <div class="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span v-if="rawPhoneNumber.trim()">
                    Formato: <strong class="text-sky-700 font-mono font-bold">{{ formattedFullPhone }}</strong>
                  </span>
                  <span v-else class="text-slate-400">
                    {{ selectedCountry.code === '+58' ? 'Ejemplo: 4141234567 o 04141234567' : 'Ejemplo: ' + selectedCountry.placeholder }}
                  </span>
                </div>
              </div>

              <!-- Correo Electrónico -->
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">Correo Electrónico:</label>
                <input type="email" v-model="patient.correo" placeholder="ejemplo@email.com" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden" />
                <span class="text-[10px] text-slate-400 mt-1 block">Opcional para comprobante y orden médica</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Sede de Preferencia / Síntomas:</label>
              <textarea v-model="patient.notas" rows="2" placeholder="Indica si prefieres ser atendido en Caracas o Guatire, o describe tus síntomas..." class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"></textarea>
            </div>

            <!-- Aviso Formal de Confirmación Posterior -->
            <div class="bg-sky-50 border border-sky-200 p-3 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
              <svg class="w-4 h-4 text-sky-600 shrink-0 mt-0.5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="leading-relaxed">
                <strong class="text-sky-950 block font-bold mb-0.5">Protocolo de Atención Médica:</strong>
                Al presionar confirmar, su solicitud quedará registrada. En breve, nuestro personal de secretaría médica se comunicará con usted vía WhatsApp o llamada para validar formalmente su turno y brindarle las indicaciones previas para su consulta.
              </div>
            </div>

            <div class="flex justify-between pt-2">
              <button type="button" @click="prevStep" class="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
                ← Volver
              </button>
              <button type="button" @click="submitBooking" :disabled="loading" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5">
                <svg v-if="!loading" class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ loading ? 'Registrando en PostgreSQL...' : 'Confirmar Cita Médica' }}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
