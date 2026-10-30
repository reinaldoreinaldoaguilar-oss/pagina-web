<script setup>
import { ref, computed, watch } from 'vue';
import doctorData from '../data/doctor.json';
import fallbackServices from '../data/servicios.json';
import countriesList from '../data/countries.json';
import { API_BASE_URL } from '../config/api';
import { currentUser, isAuthenticated, isPatient, token, updatePatientProfile } from '../services/auth';
import GoogleAuthButton from './GoogleAuthButton.vue';

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

const emit = defineEmits(['close', 'toast', 'openPortal']);

// Pasos:
// Si no autenticado: paso 0 (Acceso con Google obligatorio)
// Si autenticado: paso 1 (Servicio y Sede) -> paso 2 (Fecha y Horario real) -> paso 3 (Resumen y Confirmar)
const step = ref(1);

const selectedServiceId = ref(null);
const selectedDate = ref('');
const selectedTime = ref('');
const selectedCountry = ref(countriesList[0]); // Por defecto: Venezuela (+58)
const rawPhoneNumber = ref('');
const caseSymptoms = ref('');

// Lista de Sedes Clínicas del Dr. Lisandro Márquez
const sedesList = [
  {
    id: 1,
    nombre: 'Caracas — Clínica VidaMed',
    detalle: 'Sede Quirúrgica & Consultorios Principales',
    ciudad: 'Caracas',
    dias: 'Lunes a Viernes (08:30 a 17:00)'
  },
  {
    id: 2,
    nombre: 'Guatire — Clínica San Martín de Porres',
    detalle: 'Unidad Urológica Dr. Gregorio Hernández',
    ciudad: 'Guatire',
    dias: 'Martes y Jueves (08:30 a 14:00)'
  },
  {
    id: 3,
    nombre: 'Barlovento — Clínica Caucagua',
    detalle: 'Jornadas Especiales Urológicas',
    ciudad: 'Barlovento',
    dias: 'Sábados (08:30 a 13:00)'
  }
];

const selectedSedeObj = ref(sedesList[0]);

// Estado de carga y confirmación
const loading = ref(false);
const confirmedData = ref(null);

// Motor de disponibilidad en tiempo real
const availableSlots = ref([]);
const loadingSlots = ref(false);
const slotErrorMessage = ref('');
const isDateBlockedByDoctor = ref(false);
const doctorBlockedReason = ref('');

// Formato internacional de teléfono
const formattedFullPhone = computed(() => {
  if (!rawPhoneNumber.value || !rawPhoneNumber.value.trim()) return '';
  let clean = rawPhoneNumber.value.trim();
  const code = selectedCountry.value ? selectedCountry.value.code : '+58';

  if (clean.startsWith('+')) return clean;

  if (code === '+58' && clean.startsWith('0')) {
    clean = clean.substring(1);
  }

  const dialDigits = code.replace(/[^0-9]/g, '');
  const onlyDigits = clean.replace(/[^0-9]/g, '');
  if (dialDigits && onlyDigits.startsWith(dialDigits) && onlyDigits.length > dialDigits.length + 6) {
    return `+${onlyDigits}`;
  }

  return `${code} ${clean}`;
});

const minDate = ref('');
const maxDate = ref('');

const setupDatesRange = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  minDate.value = tomorrow.toISOString().split('T')[0];

  const max = new Date();
  max.setDate(max.getDate() + 60);
  maxDate.value = max.toISOString().split('T')[0];
};

const selectedServiceObj = computed(() => {
  const s = fallbackServices.find(item => item.id == selectedServiceId.value);
  return s || {
    id: 1,
    nombre_servicio: 'Evaluación Urológica Completa con 3 Ecos',
    duracion_minutos: 45,
    descripcion: 'Consulta exhaustiva que incluye eco renal, vesical y prostático en tiempo real.'
  };
});

// Sincronizar datos de paciente al autenticarse o abrir el modal
const syncUserData = () => {
  if (currentUser.value) {
    if (currentUser.value.telefono && !rawPhoneNumber.value) {
      const ph = currentUser.value.telefono;
      // Tratar de asignar teléfono
      rawPhoneNumber.value = ph.replace(/^\+58\s?/, '');
    }
  }
};

watch(() => props.isOpen, (open) => {
  if (open) {
    confirmedData.value = null;
    selectedDate.value = '';
    selectedTime.value = '';
    availableSlots.value = [];
    slotErrorMessage.value = '';
    isDateBlockedByDoctor.value = false;
    doctorBlockedReason.value = '';
    caseSymptoms.value = '';

    setupDatesRange();
    syncUserData();

    if (props.preselectedServiceId) {
      selectedServiceId.value = props.preselectedServiceId;
    } else if (!selectedServiceId.value) {
      selectedServiceId.value = fallbackServices[0]?.id || 1;
    }

    // Si el usuario no ha iniciado sesión con Google, llevar al paso 0 (Acceso con Google)
    if (!isAuthenticated.value) {
      step.value = 0;
    } else {
      step.value = 1;
    }
  }
});

watch(isAuthenticated, (authed) => {
  if (authed) {
    syncUserData();
    if (step.value === 0) {
      step.value = 1;
    }
  }
});

watch(() => props.preselectedServiceId, (newId) => {
  if (newId) {
    selectedServiceId.value = newId;
  }
});

// Consultar disponibilidad real al seleccionar o cambiar fecha o servicio
const fetchAvailability = async () => {
  if (!selectedDate.value) {
    isDateBlockedByDoctor.value = false;
    doctorBlockedReason.value = '';
    availableSlots.value = [];
    selectedTime.value = '';
    return;
  }

  const day = new Date(selectedDate.value + 'T00:00:00').getDay();
  if (day === 0) {
    slotErrorMessage.value = 'Los domingos el consultorio permanece cerrado. Por favor elija un día de Lunes a Sábado.';
    isDateBlockedByDoctor.value = false;
    doctorBlockedReason.value = '';
    availableSlots.value = [];
    selectedTime.value = '';
    return;
  }

  loadingSlots.value = true;
  slotErrorMessage.value = '';
  isDateBlockedByDoctor.value = false;
  doctorBlockedReason.value = '';
  selectedTime.value = '';

  try {
    const srvId = selectedServiceId.value || 1;
    const sedeId = selectedSedeObj.value?.id || 1;
    const url = `${API_BASE_URL}/api/disponibilidad?fecha=${selectedDate.value}&sede_id=${sedeId}&servicio_id=${srvId}`;
    
    const res = await fetch(url);
    if (res.ok) {
      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        data = { mensaje: 'Error de respuesta del servidor' };
      }

      // 1. Caso de día bloqueado explícitamente por el doctor en su portal
      if (data.dia_bloqueado || (data.disponible === false && data.motivo)) {
        isDateBlockedByDoctor.value = true;
        doctorBlockedReason.value = data.motivo || 'El Dr. Lisandro Márquez indicó que no atiende pacientes en esta fecha.';
        availableSlots.value = [];
        selectedTime.value = '';
        return;
      }

      // 2. Comprobar si hay turnos disponibles
      if (data.slots && data.slots.length) {
        const hayLibres = data.slots.some(s => s.disponible);
        if (!hayLibres) {
          isDateBlockedByDoctor.value = true;
          doctorBlockedReason.value = data.motivo || 'Todos los turnos de esta fecha ya han sido reservados o bloqueados por el médico.';
          availableSlots.value = [];
          selectedTime.value = '';
          return;
        }

        isDateBlockedByDoctor.value = false;
        doctorBlockedReason.value = '';
        availableSlots.value = data.slots;
      } else {
        isDateBlockedByDoctor.value = true;
        doctorBlockedReason.value = data.motivo || 'No hay turnos disponibles para esta fecha. Por favor seleccione otro día.';
        availableSlots.value = [];
        selectedTime.value = '';
      }
    } else {
      slotErrorMessage.value = 'No se pudo conectar con el servidor para verificar disponibilidad. Por favor intente nuevamente.';
      availableSlots.value = [];
    }
  } catch (err) {
    console.warn('Error al consultar disponibilidad:', err);
    slotErrorMessage.value = 'Error al consultar disponibilidad médica. Por favor seleccione nuevamente la fecha.';
    availableSlots.value = [];
  } finally {
    loadingSlots.value = false;
  }
};

const handleGoogleSuccess = (userData) => {
  emit('toast', { msg: `¡Sesión iniciada como ${userData.nombre}!`, type: 'success' });
  syncUserData();
  step.value = 1;
};

const nextStep = () => {
  if (step.value === 1) {
    if (!selectedServiceId.value) {
      emit('toast', { msg: 'Por favor selecciona el servicio médico que necesitas.', type: 'warning' });
      return;
    }
    step.value = 2;
    if (selectedDate.value) {
      fetchAvailability();
    }
    return;
  }

  if (step.value === 2) {
    if (!selectedDate.value) {
      emit('toast', { msg: 'Por favor selecciona una fecha para tu consulta.', type: 'warning' });
      return;
    }
    if (isDateBlockedByDoctor.value) {
      emit('toast', { msg: `Esta fecha está bloqueada por el doctor (${doctorBlockedReason.value || 'No atiende consultas'}). Por favor elija otra fecha.`, type: 'warning' });
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
  if (step.value > 1) {
    step.value--;
  }
};

// Envío seguro de la reserva vinculada a la cuenta de Google
const submitBooking = async () => {
  const fullPhone = formattedFullPhone.value;
  if (!fullPhone.trim()) {
    emit('toast', { msg: 'Por favor ingresa tu número de WhatsApp para confirmar tu cita.', type: 'warning' });
    return;
  }

  loading.value = true;
  const fechaHora = `${selectedDate.value} ${selectedTime.value}`;
  const srvId = parseInt(selectedServiceId.value) || 1;
  const sedeId = selectedSedeObj.value?.id || 1;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`;
    }

    const payload = {
      fecha_hora: fechaHora,
      servicio_id: srvId,
      sede_id: sedeId,
      sintomas: caseSymptoms.value.trim() || null,
      telefono: fullPhone,
      nombre_paciente: currentUser.value?.nombre || 'Paciente',
      correo_paciente: currentUser.value?.correo || null
    };

    const res = await fetch(`${API_BASE_URL}/api/citas`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      data = { mensaje: 'Respuesta del servidor no válida' };
    }

    if (res.ok) {
      confirmedData.value = {
        citaId: data.id_cita || data.id || Math.floor(1000 + Math.random() * 9000),
        codigo: data.codigo || `#CIT-${data.id_cita || Math.floor(1000 + Math.random() * 9000)}`,
        nombre: currentUser.value?.nombre || 'Paciente Registrado',
        correo: currentUser.value?.correo || '',
        telefono: fullPhone,
        servicio: selectedServiceObj.value.nombre_servicio,
        duracion: selectedServiceObj.value.duracion_minutos || 45,
        sede: selectedSedeObj.value.nombre,
        direccion: selectedSedeObj.value.detalle,
        sintomas: caseSymptoms.value.trim(),
        fecha: selectedDate.value,
        hora: selectedTime.value
      };

      // Si el paciente no tenía teléfono guardado en perfil, actualizarlo
      if (token.value && (!currentUser.value?.telefono || currentUser.value?.telefono !== fullPhone)) {
        updatePatientProfile({ telefono: fullPhone }).catch(() => {});
      }

      emit('toast', { msg: '¡Cita médica agendada y asegurada con éxito!', type: 'success' });
    } else {
      // Conflicto de concurrencia o bloqueo
      if (res.status === 409) {
        emit('toast', { msg: data.mensaje || 'El turno acaba de ser reservado. Por favor elige otro horario.', type: 'warning' });
        step.value = 2;
        await fetchAvailability();
      } else {
        emit('toast', { msg: data.mensaje || 'Error al procesar la reserva. Intenta nuevamente.', type: 'danger' });
      }
    }
  } catch (error) {
    console.error('Error al agendar cita:', error);
    emit('toast', { msg: 'No se pudo conectar con el servidor. Por favor intenta de nuevo en unos segundos.', type: 'danger' });
  } finally {
    loading.value = false;
  }
};

const whatsappConfirmationLink = computed(() => {
  if (!confirmedData.value) return '#';
  const c = confirmedData.value;
  let msg = 
    `¡Hola Dr. Lisandro Márquez! He agendado formalmente mi cita médica con mi cuenta de Google en su plataforma:\n\n` +
    `👤 Paciente: ${c.nombre}\n` +
    `📧 Correo verificado: ${c.correo}\n` +
    `📞 WhatsApp: ${c.telefono}\n` +
    `🩺 Servicio: ${c.servicio}\n` +
    `🏥 Sede: ${c.sede}\n` +
    `📅 Fecha: ${c.fecha}\n` +
    `⏰ Hora Turno: ${c.hora}\n` +
    `🔖 Comprobante: ${c.codigo}\n`;

  if (c.sintomas && c.sintomas.trim()) {
    msg += `📝 Síntomas / Motivo: ${c.sintomas.trim()}\n`;
  }

  msg += `\nQuedo a la espera de sus indicaciones para mi consulta. Muchas gracias.`;
  return `https://wa.me/${doctorData.whatsapp}?text=${encodeURIComponent(msg)}`;
});

const downloadCalendar = () => {
  if (!confirmedData.value) return;
  const c = confirmedData.value;
  const dur = c.duracion || 45;
  const start = new Date(`${c.fecha}T${c.hora}:00`);
  const end = new Date(start.getTime() + dur * 60000);

  const fmt = (d) => d.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dr. Lisandro Marquez//Citas Urologia//ES',
    'BEGIN:VEVENT',
    `UID:cita-${c.citaId}@drlisandromarquez.com`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Cita Médica Urológica: ${c.servicio} - ${doctorData.nombre}`,
    `DESCRIPTION:Consulta con el ${doctorData.nombre}. Sede: ${c.sede}. Comprobante: ${c.codigo}. Contacto: ${doctorData.telefono_display}`,
    `LOCATION:${c.sede} - ${c.direccion}`,
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
  emit('toast', { msg: 'Archivo de calendario .ics descargado', type: 'info' });
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
    <div class="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100 animate-pop-in">
      
      <!-- Encabezado del Modal -->
      <div class="px-6 py-4 bg-slate-50/90 border-b border-slate-200/80 flex justify-between items-center">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
              Reservar Cita Médica
            </h3>
            <p class="text-[11px] text-slate-500 font-medium">
              {{ doctorData.nombre }} • Cirujano Urólogo
            </p>
          </div>
        </div>

        <button 
          type="button" 
          @click="$emit('close')" 
          class="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 flex items-center justify-center text-xl transition cursor-pointer"
          title="Cerrar"
        >
          &times;
        </button>
      </div>

      <!-- Cuerpo del Modal -->
      <div class="p-5 sm:p-6 overflow-y-auto">
        
        <!-- PANTALLA DE ÉXITO -->
        <div v-if="confirmedData" class="text-center py-2 animate-fade-in">
          <div class="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 shadow-inner">
            ✓
          </div>
          <span class="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Cita Confirmada y Registrada
          </span>
          <h4 class="text-xl font-extrabold text-slate-900 mt-2 mb-1">
            ¡Muchas gracias, {{ confirmedData.nombre }}!
          </h4>
          <p class="text-xs text-slate-600 mb-4">
            Su turno ha sido reservado y enlazado a su cuenta oficial de Google.
          </p>

          <!-- Tarjeta de Comprobante Oficial -->
          <div class="bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-2xl text-left text-xs space-y-2.5 mb-5 shadow-2xs">
            <div class="flex justify-between items-center border-b border-slate-200 pb-2.5">
              <span class="text-slate-500 font-medium">Código de Comprobante:</span>
              <span class="text-sky-700 font-mono font-extrabold text-sm bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100">
                {{ confirmedData.codigo }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Servicio Clínico:</span>
              <strong class="text-slate-800 text-right">{{ confirmedData.servicio }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Fecha y Turno:</span>
              <strong class="text-slate-800">{{ confirmedData.fecha }} a las {{ confirmedData.hora }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Sede de Atención:</span>
              <strong class="text-slate-800 text-right">{{ confirmedData.sede }}</strong>
            </div>
            <div class="flex justify-between border-t border-slate-200/70 pt-2 text-[11px]">
              <span class="text-slate-500">Cuenta de Google:</span>
              <strong class="text-slate-700 font-mono">{{ confirmedData.correo }}</strong>
            </div>
            <div class="flex justify-between border-t border-slate-200/70 pt-2 text-[11px]">
              <span class="text-slate-500">WhatsApp / Teléfono:</span>
              <strong class="text-sky-700 font-mono font-bold">{{ confirmedData.telefono }}</strong>
            </div>
          </div>

          <!-- Acciones posteriores -->
          <div class="space-y-2.5">
            <button 
              type="button" 
              @click="$emit('openPortal')" 
              class="w-full py-3 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Ver en Mi Portal del Paciente (Mis Citas)
            </button>

            <a 
              :href="whatsappConfirmationLink" 
              target="_blank" 
              class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              Notificar Asistencia por WhatsApp
            </a>

            <button 
              type="button" 
              @click="downloadCalendar" 
              class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 cursor-pointer transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Descargar Recordatorio (.ics)
            </button>

            <button 
              type="button" 
              @click="$emit('close')" 
              class="w-full py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
            >
              Finalizar y Volver a la Web
            </button>
          </div>
        </div>

        <!-- FLUJO DE AGENDAMIENTO -->
        <div v-else>

          <!-- PASO 0: ACCESO CON GOOGLE OBLIGATORIO -->
          <div v-if="step === 0 || !isAuthenticated" class="text-center py-4 space-y-5 animate-fade-in">
            <div class="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-sm">
              <svg class="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>

            <div class="max-w-md mx-auto">
              <h4 class="text-lg sm:text-xl font-extrabold text-slate-900 mb-1.5">
                Acceso con Cuenta de Google
              </h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Para garantizar la seguridad de su historial médico, consultar turnos en tiempo real y gestionar reprogramaciones o cancelaciones directamente desde la web, inicie sesión con su cuenta de Google.
              </p>
            </div>

            <!-- Botón Oficial de Google OAuth 2.0 -->
            <div class="py-2 flex justify-center">
              <GoogleAuthButton 
                buttonText="signin_with" 
                @success="handleGoogleSuccess"
                @error="emit('toast', { msg: 'No se pudo completar el inicio de sesión con Google', type: 'danger' })"
              />
            </div>

            <!-- Garantía de Privacidad y Rol -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-left text-xs text-slate-600 space-y-1.5">
              <div class="flex items-center gap-2 font-bold text-slate-800 text-[11px]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-sky-600">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Privacidad y Confidencialidad Médica</span>
              </div>
              <p class="text-[11px] text-slate-500 leading-relaxed">
                Solo solicitamos su identidad básica (nombre, correo y foto). Su cuenta recibe automáticamente el rol de <strong>Paciente</strong> y sus datos se resguardan bajo estricto secreto profesional.
              </p>
            </div>
          </div>

          <!-- PASOS 1, 2 Y 3: FLUJO AUTENTICADO -->
          <div v-else>
            
            <!-- Barra de Paciente Autenticado con Google -->
            <div class="mb-5 bg-sky-50/80 border border-sky-200/80 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <img 
                  v-if="currentUser?.foto_perfil" 
                  :src="currentUser.foto_perfil" 
                  alt="Avatar" 
                  class="w-8 h-8 rounded-full border border-sky-300 object-cover shrink-0" 
                />
                <div v-else class="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {{ currentUser?.nombre?.charAt(0) || 'P' }}
                </div>
                <div class="min-w-0">
                  <span class="block text-xs font-bold text-slate-900 truncate">
                    {{ currentUser?.nombre }}
                  </span>
                  <span class="block text-[10px] text-sky-700 font-mono truncate">
                    {{ currentUser?.correo }}
                  </span>
                </div>
              </div>

              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-200 text-sky-900 uppercase tracking-wide shrink-0">
                Paciente
              </span>
            </div>

            <!-- Stepper Visual -->
            <div class="flex justify-between items-center mb-6 relative">
              <div class="absolute inset-x-8 top-4 h-0.5 bg-slate-200 -z-0"></div>
              
              <div class="relative z-10 flex flex-col items-center">
                <span class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition"
                      :class="step >= 1 ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 border border-slate-200'">
                  1
                </span>
                <span class="text-[11px] font-semibold text-slate-600 mt-1">Sede & Servicio</span>
              </div>

              <div class="relative z-10 flex flex-col items-center">
                <span class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition"
                      :class="step >= 2 ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 border border-slate-200'">
                  2
                </span>
                <span class="text-[11px] font-semibold text-slate-600 mt-1">Fecha & Turno</span>
              </div>

              <div class="relative z-10 flex flex-col items-center">
                <span class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition"
                      :class="step >= 3 ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 border border-slate-200'">
                  3
                </span>
                <span class="text-[11px] font-semibold text-slate-600 mt-1">Resumen & Datos</span>
              </div>
            </div>

            <!-- PASO 1: SELECCIÓN DE SEDE Y SERVICIO -->
            <div v-if="step === 1" class="space-y-4 animate-fade-in">
              <!-- Sede Clínica -->
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>1. Seleccione la Sede de Atención: *</span>
                  <span class="text-[10px] text-sky-600 font-semibold">Presencial</span>
                </label>
                <div class="space-y-2">
                  <div 
                    v-for="s in sedesList" 
                    :key="s.id"
                    @click="selectedSedeObj = s"
                    class="p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3"
                    :class="selectedSedeObj.id === s.id ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-200 shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'"
                  >
                    <div>
                      <strong class="text-xs font-bold text-slate-900 block">{{ s.nombre }}</strong>
                      <span class="text-[11px] text-slate-500 block">{{ s.detalle }}</span>
                      <span class="text-[10px] text-sky-700 font-medium block mt-0.5">🗓️ {{ s.dias }}</span>
                    </div>
                    <div class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                         :class="selectedSedeObj.id === s.id ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'">
                      <span v-if="selectedSedeObj.id === s.id" class="text-[10px] font-bold">✓</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Servicio Médico -->
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1.5">
                  2. Seleccione el Motivo o Consulta Especializada: *
                </label>
                <select 
                  v-model="selectedServiceId" 
                  class="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white shadow-2xs"
                >
                  <option v-for="s in fallbackServices" :key="s.id" :value="s.id">
                    {{ s.nombre_servicio }} ({{ s.duracion_minutos || 45 }} min)
                  </option>
                </select>
              </div>

              <!-- Banner de Protocolo con 3 Ecos -->
              <div class="bg-sky-50/90 p-3.5 rounded-2xl border border-sky-200 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                <span class="text-sky-600 text-base">ℹ️</span>
                <div>
                  <strong class="text-sky-950 block font-bold mb-0.5">Evaluación Integral en una Sola Sesión:</strong>
                  Si pauta la <strong>Evaluación Urológica Completa</strong>, la consulta incluye ecografía renal, vesical y prostática en tiempo real con diagnóstico de precisión.
                </div>
              </div>

              <div class="flex justify-end pt-2">
                <button 
                  type="button" 
                  @click="nextStep" 
                  class="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
                >
                  Continuar al Calendario de Turnos →
                </button>
              </div>
            </div>

            <!-- PASO 2: CALENDARIO Y DISPONIBILIDAD REAL -->
            <div v-if="step === 2" class="space-y-4 animate-fade-in">
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Seleccione la Fecha de Consulta: *</span>
                  <span class="text-[10px] text-slate-500">Anticipación mínima: 1 día</span>
                </label>
                <input 
                  type="date" 
                  v-model="selectedDate" 
                  :min="minDate" 
                  :max="maxDate" 
                  @change="fetchAvailability"
                  class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white shadow-2xs cursor-pointer" 
                />
                <small class="text-[11px] text-slate-500 mt-1 block">
                  Atención disponible de Lunes a Sábado en sedes de Caracas, Guatire y Barlovento.
                </small>

                <!-- ALERTA CUANDO EL DOCTOR BLOQUEÓ ESTA FECHA EN SU PORTAL -->
                <div v-if="isDateBlockedByDoctor" class="mt-3 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2 animate-fade-in shadow-xs">
                  <div class="flex items-center gap-2 font-black text-xs sm:text-sm text-rose-800">
                    <svg class="w-5 h-5 shrink-0 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                    </svg>
                    <span>Fecha No Disponible para Consultas Médicas</span>
                  </div>
                  <p class="text-xs leading-relaxed text-rose-900 font-medium">
                    El <strong>Dr. Lisandro Márquez</strong> ha indicado en su portal que <strong>no atenderá pacientes</strong> en esta fecha (<span class="font-bold underline">{{ selectedDate }}</span>).
                  </p>
                  <div class="p-2.5 bg-white/90 rounded-xl border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                    <span class="text-rose-500">Motivo:</span>
                    <span class="font-normal italic">{{ doctorBlockedReason }}</span>
                  </div>
                  <p class="text-[11px] text-rose-700 font-medium">
                    👉 Por favor, seleccione otro día en el calendario superior para agendar su consulta.
                  </p>
                </div>
              </div>

              <!-- Horarios en Tiempo Real -->
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Horarios y Espacios Disponibles: *</span>
                  <span v-if="selectedDate" class="text-[10px] text-sky-700 font-semibold font-mono">
                    {{ selectedDate }}
                  </span>
                </label>

                <!-- Estado de Carga -->
                <div v-if="loadingSlots" class="py-8 text-center text-xs text-slate-500 space-y-2">
                  <div class="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <span>Consultando agenda en tiempo real...</span>
                </div>

                <!-- Mensaje de Error o Fecha sin selección -->
                <div v-else-if="!selectedDate" class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  Por favor elija una fecha en el calendario superior para calcular los turnos disponibles.
                </div>

                <div v-else-if="slotErrorMessage" class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center text-xs text-amber-800">
                  {{ slotErrorMessage }}
                </div>

                <!-- Grilla de Slots -->
                <div v-else class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  <button 
                    v-for="slot in availableSlots" 
                    :key="slot.hora" 
                    type="button" 
                    @click="slot.disponible && (selectedTime = slot.hora)"
                    :disabled="!slot.disponible"
                    class="py-2.5 px-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer relative"
                    :class="[
                      !slot.disponible 
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60' 
                        : (selectedTime === slot.hora 
                            ? 'bg-sky-600 text-white border-sky-600 shadow-md ring-2 ring-sky-300' 
                            : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50')
                    ]"
                  >
                    <div>{{ slot.hora }}</div>
                    <span class="text-[9px] font-normal block leading-tight mt-0.5"
                          :class="!slot.disponible ? 'text-slate-400' : (selectedTime === slot.hora ? 'text-sky-100' : 'text-slate-500')">
                      {{ slot.disponible ? 'Disponible' : (slot.motivo || 'Ocupado') }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Leyenda no dependiente solo de color -->
              <div class="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-md bg-white border border-slate-300"></span>
                  <span>Libre</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-md bg-sky-600"></span>
                  <span>Seleccionado</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-md bg-slate-200 border border-slate-300"></span>
                  <span>Ocupado / Bloqueado</span>
                </div>
              </div>

              <div class="flex justify-between pt-2">
                <button 
                  type="button" 
                  @click="prevStep" 
                  class="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← Paso Anterior
                </button>
                <button 
                  type="button" 
                  @click="nextStep" 
                  :disabled="isDateBlockedByDoctor || !selectedTime || !selectedDate"
                  class="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Revisar Resumen y Confirmar →
                </button>
              </div>
            </div>

            <!-- PASO 3: RESUMEN, CONTACTO Y CONFIRMACIÓN -->
            <div v-if="step === 3" class="space-y-4 animate-fade-in">
              
              <!-- Tarjeta de Resumen Detallada -->
              <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5 shadow-2xs">
                <div class="flex justify-between items-start border-b border-slate-200 pb-2">
                  <div>
                    <span class="text-slate-500 block text-[11px]">Especialista Médico:</span>
                    <strong class="text-slate-900 text-sm font-extrabold">{{ doctorData.nombre }}</strong>
                    <span class="text-sky-700 block text-[11px]">Cirujano General • Urólogo UCV</span>
                  </div>
                  <div class="text-right">
                    <span class="text-slate-500 block text-[11px]">Zona Horaria:</span>
                    <strong class="text-slate-700 font-mono text-[11px]">Caracas (UTC-4)</strong>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span class="text-slate-500 block text-[11px]">Servicio Clínico:</span>
                    <strong class="text-slate-800">{{ selectedServiceObj.nombre_servicio }}</strong>
                    <span class="text-[10px] text-slate-500 block">Duración: {{ selectedServiceObj.duracion_minutos || 45 }} min</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[11px]">Sede Asignada:</span>
                    <strong class="text-slate-800">{{ selectedSedeObj.nombre }}</strong>
                    <span class="text-[10px] text-slate-500 block">{{ selectedSedeObj.ciudad }}</span>
                  </div>
                </div>

                <div class="border-t border-slate-200/80 pt-2 flex justify-between items-center">
                  <span class="text-slate-500">Fecha y Horario:</span>
                  <span class="text-sky-800 font-extrabold text-sm font-mono">
                    {{ selectedDate }} a las {{ selectedTime }}
                  </span>
                </div>
              </div>

              <!-- Datos de Contacto y Validación -->
              <div class="space-y-3">
                
                <!-- Nombre y Correo Vinculados a Google (No editables arbitrariamente) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-800 mb-1">
                      Nombre del Paciente (Google):
                    </label>
                    <input 
                      type="text" 
                      :value="currentUser?.nombre" 
                      disabled 
                      class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-xs font-semibold select-none"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                      <span>Correo Verificado:</span>
                      <span class="text-[10px] text-emerald-600 font-bold">Google ID ✓</span>
                    </label>
                    <input 
                      type="text" 
                      :value="currentUser?.correo" 
                      disabled 
                      class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-xs font-mono select-none"
                    />
                  </div>
                </div>

                <!-- Teléfono / WhatsApp con Selector Internacional -->
                <div>
                  <label class="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>Teléfono / WhatsApp de Contacto: *</span>
                    <span class="text-[10px] text-slate-500">Para avisos médicos y reconfirmación</span>
                  </label>

                  <div class="flex rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 overflow-hidden bg-white shadow-2xs">
                    <!-- Selector de País -->
                    <div class="relative flex items-center bg-slate-50 hover:bg-slate-100 transition border-r border-slate-300 cursor-pointer shrink-0">
                      <select
                        v-model="selectedCountry"
                        class="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                        title="Selecciona el país"
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

                    <!-- Input Número Local -->
                    <input
                      type="tel"
                      v-model="rawPhoneNumber"
                      :placeholder="selectedCountry.placeholder"
                      class="w-full p-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div class="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span v-if="rawPhoneNumber.trim()">
                      Formato final: <strong class="text-sky-700 font-mono font-bold">{{ formattedFullPhone }}</strong>
                    </span>
                    <span v-else class="text-slate-400">
                      {{ selectedCountry.code === '+58' ? 'Ejemplo: 4141234567 o 04141234567' : 'Ejemplo: ' + selectedCountry.placeholder }}
                    </span>
                  </div>
                </div>

                <!-- Motivo / Síntomas Opcionales -->
                <div>
                  <label class="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>Motivo de Consulta o Síntomas:</span>
                    <span class="text-[10px] text-slate-400">Opcional</span>
                  </label>
                  <textarea
                    v-model="caseSymptoms"
                    rows="2"
                    placeholder="Describe brevemente tus síntomas o si traes ecografías o exámenes de laboratorio previos..."
                    class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  ></textarea>
                </div>
              </div>

              <!-- Condiciones Previas e Instrucciones -->
              <div class="bg-amber-50/80 border border-amber-200 p-3 rounded-2xl text-[11px] text-amber-900 space-y-1">
                <div class="font-bold flex items-center gap-1.5 text-amber-950">
                  <span>📋 Instrucciones y Política de Reprogramación:</span>
                </div>
                <p class="leading-relaxed">
                  Para las ecografías vesicales y prostáticas, se recomienda ingerir abundante agua 1 hora antes de la consulta. Si requiere reprogramar o cancelar su cita, podrá realizarlo sin costo directamente desde su <strong>Portal del Paciente</strong> hasta 2 horas antes de la hora pautada.
                </p>
              </div>

              <div class="flex justify-between pt-2">
                <button 
                  type="button" 
                  @click="prevStep" 
                  class="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← Volver
                </button>
                <button 
                  type="button" 
                  @click="submitBooking" 
                  :disabled="loading" 
                  class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition disabled:opacity-75 cursor-pointer flex items-center gap-2"
                >
                  <svg v-if="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{{ loading ? 'Agendando cita...' : 'Confirmar Cita Médica' }}</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes popIn {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-pop-in {
  animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(4px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
