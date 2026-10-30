<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { currentUser, isAuthenticated, logout, updatePatientProfile } from '../services/auth';
import { API_BASE_URL } from '../config/api';
import doctorData from '../data/doctor.json';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'toast', 'openBooking']);

const activeTab = ref('proximas'); // 'proximas' | 'historial' | 'notificaciones' | 'perfil'
const proximasCitas = ref([]);
const historialCitas = ref([]);
const notificaciones = ref([]);
const loadingCitas = ref(false);

// Modales internos
const showCancelModal = ref(false);
const appointmentToCancel = ref(null);
const cancelReason = ref('');
const cancelingLoading = ref(false);

// Sedes de atención médica
const sedesList = [
  {
    id: 1,
    nombre: 'Caracas — Clínica VidaMed',
    detalle: 'Sede Quirúrgica & Consultorios Principales',
    ciudad: 'Caracas',
    dias: 'Lunes a Viernes'
  },
  {
    id: 2,
    nombre: 'Guatire — Clínica San Martín de Porres',
    detalle: 'Unidad Urológica Dr. Gregorio Hernández',
    ciudad: 'Guatire',
    dias: 'Martes y Jueves'
  },
  {
    id: 3,
    nombre: 'Barlovento — Clínica Caucagua',
    detalle: 'Jornadas Especiales Urológicas',
    ciudad: 'Barlovento',
    dias: 'Sábados'
  }
];

const showRescheduleModal = ref(false);
const appointmentToReschedule = ref(null);
const rescheduleSedeId = ref(1);
const rescheduleSedeSchedule = ref(null);
const loadingRescheduleSchedule = ref(false);
const newDate = ref('');
const newTime = ref('');
const availableSlots = ref([]);
const loadingSlots = ref(false);
const isRescheduleDateBlocked = ref(false);
const rescheduleBlockedReason = ref('');
const reschedulingLoading = ref(false);
const minRescheduleDate = ref('');
const maxRescheduleDate = ref('');

const selectedRescheduleSedeObj = computed(() => {
  return sedesList.find(s => s.id === rescheduleSedeId.value) || sedesList[0];
});

const setupRescheduleDatesRange = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  minRescheduleDate.value = tomorrow.toISOString().split('T')[0];

  const max = new Date();
  max.setDate(max.getDate() + 60);
  maxRescheduleDate.value = max.toISOString().split('T')[0];
};

const loadRescheduleSedeSchedule = async (sedeId) => {
  if (!sedeId) return;
  loadingRescheduleSchedule.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/api/disponibilidad/resumen-sede/${sedeId}`);
    if (res.ok) {
      rescheduleSedeSchedule.value = await res.json();
    }
  } catch (e) {
    console.warn('Error al cargar disponibilidad de sede para reprogramación:', e);
  } finally {
    loadingRescheduleSchedule.value = false;
  }
};

const upcomingRescheduleDates = computed(() => {
  if (!rescheduleSedeSchedule.value || !rescheduleSedeSchedule.value.dias_activos) {
    return [];
  }
  const diasActivos = rescheduleSedeSchedule.value.dias_activos;
  const bloqueos = (rescheduleSedeSchedule.value.bloqueos_activos || []).map(b => b.fecha);
  const diasNombresCortos = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const mesesCortos = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const results = [];
  const cur = new Date();
  cur.setDate(cur.getDate() + 1);

  for (let i = 0; i < 45 && results.length < 5; i++) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const jsDay = cur.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
    const pyDay = jsDay === 0 ? 6 : jsDay - 1; // 0=Lun, 6=Dom

    if (diasActivos.includes(pyDay) && !bloqueos.includes(dateStr)) {
      results.push({
        fecha: dateStr,
        diaTexto: diasNombresCortos[pyDay],
        diaNumero: cur.getDate(),
        mesTexto: mesesCortos[cur.getMonth()],
        label: `${diasNombresCortos[pyDay]} ${cur.getDate()} ${mesesCortos[cur.getMonth()]}`
      });
    }

    cur.setDate(cur.getDate() + 1);
  }

  return results;
});

const selectQuickRescheduleDate = (dateStr) => {
  newDate.value = dateStr;
  onRescheduleDateChange();
};

// Perfil editable
const editPhone = ref('');
const editIdDoc = ref('');
const savingProfile = ref(false);

const nextAppointment = computed(() => {
  return proximasCitas.value.length ? proximasCitas.value[0] : null;
});

const unreadNotifsCount = computed(() => {
  return notificaciones.value.filter(n => !n.leida).length;
});

const loadPatientAppointments = async () => {
  const token = localStorage.getItem('med_auth_token');
  if (!token) return;

  loadingCitas.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/api/citas/mis-citas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      proximasCitas.value = data.proximas || [];
      historialCitas.value = data.historial || [];
    }
  } catch (err) {
    console.warn('Error al cargar citas del paciente:', err);
  } finally {
    loadingCitas.value = false;
  }
};

const loadNotifications = async () => {
  const token = localStorage.getItem('med_auth_token');
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/notificaciones`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      notificaciones.value = await res.json();
    }
  } catch (err) {
    console.warn('Error al cargar notificaciones:', err);
  }
};

const markNotificationAsRead = async (notifId) => {
  const token = localStorage.getItem('med_auth_token');
  try {
    await fetch(`${API_BASE_URL}/api/notificaciones/${notifId}/leer`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const target = notificaciones.value.find(n => n.id === notifId);
    if (target) target.leida = true;
  } catch (e) {}
};

const markAllNotificationsAsRead = async () => {
  const token = localStorage.getItem('med_auth_token');
  try {
    await fetch(`${API_BASE_URL}/api/notificaciones/leer-todas`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    notificaciones.value.forEach(n => n.leida = true);
    emit('toast', { msg: 'Todas las notificaciones marcadas como leídas', type: 'info' });
  } catch (e) {}
};

// Cancelación de Cita
const openCancelDialog = (cita) => {
  appointmentToCancel.value = cita;
  cancelReason.value = '';
  showCancelModal.value = true;
};

const confirmCancelAppointment = async () => {
  if (!appointmentToCancel.value) return;
  const token = localStorage.getItem('med_auth_token');

  cancelingLoading.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/api/citas/${appointmentToCancel.value.id}/cancelar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ motivo: cancelReason.value || 'Cancelada por el paciente desde el portal' })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al cancelar la cita');

    emit('toast', { msg: 'Tu cita ha sido cancelada y el cupo fue liberado correctamente.', type: 'info' });
    showCancelModal.value = false;
    appointmentToCancel.value = null;
    await loadPatientAppointments();
    await loadNotifications();
  } catch (err) {
    emit('toast', { msg: err.message, type: 'danger' });
  } finally {
    cancelingLoading.value = false;
  }
};

// Reprogramación de Cita con soporte de sedes y disponibilidad
const openRescheduleDialog = (cita) => {
  appointmentToReschedule.value = cita;
  rescheduleSedeId.value = cita.sede_id || cita.sede?.id || 1;
  newDate.value = '';
  newTime.value = '';
  availableSlots.value = [];
  isRescheduleDateBlocked.value = false;
  rescheduleBlockedReason.value = '';
  setupRescheduleDatesRange();
  loadRescheduleSedeSchedule(rescheduleSedeId.value);
  showRescheduleModal.value = true;
};

const onRescheduleSedeChange = () => {
  newDate.value = '';
  newTime.value = '';
  availableSlots.value = [];
  isRescheduleDateBlocked.value = false;
  rescheduleBlockedReason.value = '';
  loadRescheduleSedeSchedule(rescheduleSedeId.value);
};

const onRescheduleDateChange = async () => {
  if (!newDate.value || !appointmentToReschedule.value) {
    isRescheduleDateBlocked.value = false;
    rescheduleBlockedReason.value = '';
    availableSlots.value = [];
    newTime.value = '';
    return;
  }

  loadingSlots.value = true;
  newTime.value = '';
  isRescheduleDateBlocked.value = false;
  rescheduleBlockedReason.value = '';
  availableSlots.value = [];

  try {
    const sedeId = rescheduleSedeId.value || appointmentToReschedule.value.sede_id || appointmentToReschedule.value.sede?.id || 1;
    const srvId = appointmentToReschedule.value.servicio_id || 1;
    const res = await fetch(`${API_BASE_URL}/api/disponibilidad?fecha=${newDate.value}&sede_id=${sedeId}&servicio_id=${srvId}`);
    
    if (res.ok) {
      const data = await res.json();

      // Caso 1: Día bloqueado por el doctor o no atendido en esa sede
      if (data.dia_no_atiende_sede || data.dia_bloqueado || (data.disponible === false && data.motivo)) {
        isRescheduleDateBlocked.value = true;
        rescheduleBlockedReason.value = data.motivo || 'El Dr. Lisandro Márquez no atiende pacientes en esta fecha o sede.';
        availableSlots.value = [];
        return;
      }

      // Caso 2: Turnos disponibles
      if (data.slots && data.slots.length) {
        availableSlots.value = data.slots;
        const hayLibres = data.slots.some(s => s.disponible);
        if (!hayLibres) {
          isRescheduleDateBlocked.value = true;
          rescheduleBlockedReason.value = data.motivo || 'Todos los turnos de esta fecha ya se encuentran ocupados o reservados por otros pacientes.';
        }
      } else {
        isRescheduleDateBlocked.value = true;
        rescheduleBlockedReason.value = data.motivo || 'No hay turnos disponibles para esta fecha. Por favor seleccione otro día.';
      }
    } else {
      isRescheduleDateBlocked.value = true;
      rescheduleBlockedReason.value = 'Error al consultar disponibilidad del servidor. Por favor intente con otra fecha.';
    }
  } catch (e) {
    console.warn('Error al consultar horarios para reprogramar:', e);
    isRescheduleDateBlocked.value = true;
    rescheduleBlockedReason.value = 'Error de conexión al consultar horarios. Por favor intente nuevamente.';
  } finally {
    loadingSlots.value = false;
  }
};

const confirmRescheduleAppointment = async () => {
  if (!appointmentToReschedule.value || !newDate.value || !newTime.value) {
    emit('toast', { msg: 'Por favor selecciona fecha y horario para reprogramar tu cita.', type: 'warning' });
    return;
  }

  const token = localStorage.getItem('med_auth_token');
  reschedulingLoading.value = true;

  try {
    const nuevaFechaHora = `${newDate.value} ${newTime.value}`;
    const res = await fetch(`${API_BASE_URL}/api/citas/${appointmentToReschedule.value.id}/reprogramar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nueva_fecha_hora: nuevaFechaHora,
        nueva_sede_id: rescheduleSedeId.value,
        motivo: 'Reprogramada por el paciente desde el portal web'
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || 'Error al reprogramar la cita médica');
    }

    emit('toast', { msg: `✓ ¡Cita reprogramada con éxito para el ${nuevaFechaHora}!`, type: 'success' });
    showRescheduleModal.value = false;
    appointmentToReschedule.value = null;
    await loadPatientAppointments();
    await loadNotifications();
  } catch (err) {
    emit('toast', { msg: err.message, type: 'danger' });
  } finally {
    reschedulingLoading.value = false;
  }
};

const saveProfileChanges = async () => {
  savingProfile.value = true;
  try {
    await updatePatientProfile({
      telefono: editPhone.value.trim(),
      documento_identidad: editIdDoc.value.trim(),
      politica_privacidad_aceptada: true
    });
    emit('toast', { msg: 'Perfil actualizado con éxito', type: 'success' });
  } catch (err) {
    emit('toast', { msg: err.message, type: 'danger' });
  } finally {
    savingProfile.value = false;
  }
};

const handleLogout = () => {
  logout();
  emit('toast', { msg: 'Sesión finalizada correctamente', type: 'info' });
  emit('close');
};

watch(() => props.isOpen, (open) => {
  if (open) {
    if (!isAuthenticated.value) {
      emit('close');
      return;
    }
    loadPatientAppointments();
    loadNotifications();
    if (currentUser.value) {
      editPhone.value = currentUser.value.telefono || '';
      editIdDoc.value = currentUser.value.documento_identidad || '';
    }
  }
});
</script>

<template>
  <div v-if="isOpen && isAuthenticated" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
    <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-pop-in">
      
      <!-- Top Header Institucional -->
      <div class="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center overflow-hidden border-2 border-sky-400/40">
            <img v-if="currentUser?.foto_url" :src="currentUser.foto_url" alt="Foto Google" class="w-full h-full object-cover" />
            <span v-else class="text-sm font-bold">{{ (currentUser?.nombre || 'P')[0] }}</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm sm:text-base font-bold">{{ currentUser?.nombre }}</h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                Paciente
              </span>
            </div>
            <span class="text-[11px] text-slate-300 block font-mono">{{ currentUser?.correo }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="$emit('openBooking')"
            class="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Nueva Cita</span>
          </button>

          <button
            type="button"
            @click="handleLogout"
            class="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition border border-slate-700 cursor-pointer"
          >
            Cerrar Sesión
          </button>

          <button type="button" @click="$emit('close')" class="text-slate-400 hover:text-white text-2xl leading-none ml-2">
            &times;
          </button>
        </div>
      </div>

      <!-- Barra de Navegación de Pestañas -->
      <div class="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50/50 overflow-x-auto">
        <button
          type="button"
          @click="activeTab = 'proximas'"
          class="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer"
          :class="activeTab === 'proximas' ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg' : 'border-transparent text-slate-600 hover:text-slate-900'"
        >
          <span>Próximas Citas</span>
          <span class="px-2 py-0.2 rounded-full text-[10px] font-black" :class="activeTab === 'proximas' ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-700'">
            {{ proximasCitas.length }}
          </span>
        </button>

        <button
          type="button"
          @click="activeTab = 'historial'"
          class="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer"
          :class="activeTab === 'historial' ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg' : 'border-transparent text-slate-600 hover:text-slate-900'"
        >
          <span>Historial de Citas</span>
          <span class="px-2 py-0.2 rounded-full text-[10px] font-black" :class="activeTab === 'historial' ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-700'">
            {{ historialCitas.length }}
          </span>
        </button>

        <button
          type="button"
          @click="activeTab = 'notificaciones'"
          class="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer"
          :class="activeTab === 'notificaciones' ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg' : 'border-transparent text-slate-600 hover:text-slate-900'"
        >
          <span>Notificaciones</span>
          <span v-if="unreadNotifsCount" class="px-2 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
            {{ unreadNotifsCount }}
          </span>
        </button>

        <button
          type="button"
          @click="activeTab = 'perfil'"
          class="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer"
          :class="activeTab === 'perfil' ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg' : 'border-transparent text-slate-600 hover:text-slate-900'"
        >
          <span>Mi Perfil de Contacto</span>
        </button>
      </div>

      <!-- Contenedor Principal de Contenido -->
      <div class="p-6 overflow-y-auto space-y-6">

        <!-- 1. PESTAÑA: PRÓXIMAS CITAS -->
        <div v-if="activeTab === 'proximas'" class="space-y-5">
          
          <!-- Próxima Cita Destacada Hero Card -->
          <div v-if="nextAppointment" class="p-5 rounded-2xl bg-gradient-to-br from-sky-900 to-slate-900 text-white shadow-lg relative overflow-hidden">
            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 mb-2">
                  Próxima Consulta Médica Confirmada
                </span>
                <h4 class="text-lg sm:text-xl font-extrabold text-white mb-1">
                  {{ nextAppointment.servicio }}
                </h4>
                <p class="text-xs text-sky-200 flex items-center gap-2">
                  <span>👨‍⚕️ {{ doctorData.nombre }}</span>
                  <span>•</span>
                  <span>🏥 {{ nextAppointment.sede?.nombre }}</span>
                </p>
                <p class="text-xs text-slate-300 mt-2 flex items-center gap-4">
                  <span>📅 <strong>{{ nextAppointment.fecha }}</strong></span>
                  <span>⏰ <strong>{{ nextAppointment.hora }}</strong></span>
                  <span class="font-mono text-sky-300">#{{ nextAppointment.codigo_cita }}</span>
                </p>
              </div>

              <div class="flex flex-wrap md:flex-col gap-2 shrink-0">
                <button
                  type="button"
                  @click="openRescheduleDialog(nextAppointment)"
                  class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition border border-white/20 cursor-pointer"
                >
                  Reprogramar Turno
                </button>
                <button
                  type="button"
                  @click="openCancelDialog(nextAppointment)"
                  class="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-xl transition border border-rose-500/30 cursor-pointer"
                >
                  Cancelar Cita
                </button>
              </div>
            </div>
          </div>

          <!-- Listado de Próximas Citas -->
          <div v-if="proximasCitas.length" class="space-y-3">
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Todas tus citas activas</h4>
            
            <div v-for="c in proximasCitas" :key="c.id" class="p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition shadow-2xs flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <strong class="text-sm font-bold text-slate-900">{{ c.servicio }}</strong>
                  <span 
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                    :class="c.estado === 'confirmada' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                  >
                    {{ c.estado }}
                  </span>
                </div>
                <div class="text-xs text-slate-500 space-y-0.5">
                  <p>📅 <strong>{{ c.fecha_hora }}</strong> (Duración est: {{ c.duracion }} min)</p>
                  <p>🏥 {{ c.sede?.nombre }} — <span class="text-slate-400">{{ c.sede?.direccion }}</span></p>
                  <p v-if="c.sintomas" class="text-[11px] text-slate-600 italic">Motivo: "{{ c.sintomas }}"</p>
                </div>
              </div>

              <div class="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  @click="openRescheduleDialog(c)"
                  class="px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-50 rounded-lg border border-sky-200 transition cursor-pointer"
                >
                  Reprogramar
                </button>
                <button
                  type="button"
                  @click="openCancelDialog(c)"
                  class="px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          <!-- Estado Vacío -->
          <div v-else class="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div class="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 class="text-sm font-bold text-slate-800 mb-1">No tienes citas médicas activas por el momento</h4>
            <p class="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Agenda tu consulta con el Dr. Lisandro Márquez en Caracas o Guatire seleccionando la fecha de tu preferencia.
            </p>
            <button
              type="button"
              @click="$emit('openBooking')"
              class="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              Agendar Cita Médica Ahora
            </button>
          </div>

        </div>

        <!-- 2. PESTAÑA: HISTORIAL DE CITAS -->
        <div v-if="activeTab === 'historial'" class="space-y-4">
          <div v-if="historialCitas.length" class="space-y-3">
            <div v-for="c in historialCitas" :key="c.id" class="p-4 rounded-xl border border-slate-200 bg-white flex justify-between items-center text-xs">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <strong class="text-sm font-bold text-slate-800">{{ c.servicio }}</strong>
                  <span 
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="c.estado === 'completada' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'"
                  >
                    {{ c.estado }}
                  </span>
                </div>
                <p class="text-slate-500">📅 {{ c.fecha_hora }} • Sede: {{ c.sede?.nombre }}</p>
                <p v-if="c.motivo_cancelacion" class="text-rose-600 text-[11px] mt-1 font-semibold">
                  Motivo de cancelación: {{ c.motivo_cancelacion }}
                </p>
              </div>
              <span class="font-mono text-slate-400 font-bold">#{{ c.codigo_cita }}</span>
            </div>
          </div>

          <div v-else class="text-center py-10 text-slate-400 text-xs">
            No hay registros en tu historial de consultas pasadas.
          </div>
        </div>

        <!-- 3. PESTAÑA: NOTIFICACIONES -->
        <div v-if="activeTab === 'notificaciones'" class="space-y-4">
          <div class="flex justify-between items-center">
            <h4 class="text-xs font-bold text-slate-700 uppercase">Centro de Avisos Médicos</h4>
            <button
              v-if="unreadNotifsCount"
              type="button"
              @click="markAllNotificationsAsRead"
              class="text-xs text-sky-600 hover:underline font-bold cursor-pointer"
            >
              Marcar todas como leídas
            </button>
          </div>

          <div v-if="notificaciones.length" class="space-y-2.5">
            <div
              v-for="n in notificaciones"
              :key="n.id"
              @click="markNotificationAsRead(n.id)"
              class="p-3.5 rounded-xl border text-xs transition cursor-pointer flex items-start gap-3"
              :class="n.leida ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-sky-50/70 border-sky-200 text-sky-950 font-medium'"
            >
              <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0" :class="n.leida ? 'bg-slate-200 text-slate-500' : 'bg-sky-600 text-white'">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-center mb-0.5">
                  <strong class="font-bold">{{ n.titulo }}</strong>
                  <span class="text-[10px] text-slate-400 font-mono">{{ n.fecha }}</span>
                </div>
                <p class="text-xs leading-relaxed">{{ n.mensaje }}</p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-10 text-slate-400 text-xs">
            No tienes notificaciones en este momento.
          </div>
        </div>

        <!-- 4. PESTAÑA: MI PERFIL -->
        <div v-if="activeTab === 'perfil'" class="max-w-md mx-auto space-y-4">
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase block">Nombre de Google:</span>
              <strong class="text-xs text-slate-800">{{ currentUser?.nombre }}</strong>
            </div>

            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase block">Correo Electrónico (Google):</span>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs font-mono text-slate-700">{{ currentUser?.correo }}</span>
                <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Permanente</span>
              </div>
            </div>
          </div>

          <form @submit.prevent="saveProfileChanges" class="space-y-3 text-left">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp de Contacto:</label>
              <input
                type="tel"
                v-model="editPhone"
                required
                class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Cédula o Pasaporte:</label>
              <input
                type="text"
                v-model="editIdDoc"
                placeholder="V-12.345.678"
                class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              :disabled="savingProfile"
              class="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {{ savingProfile ? 'Guardando cambios...' : 'Guardar Datos de Contacto' }}
            </button>
          </form>
        </div>

      </div>

    </div>
  </div>

  <!-- MODAL DE CANCELACIÓN DE CITA -->
  <div v-if="showCancelModal" class="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-pop-in space-y-4">
      <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div class="text-center">
        <h4 class="text-base font-bold text-slate-900 mb-1">¿Deseas cancelar esta consulta?</h4>
        <p class="text-xs text-slate-600 leading-relaxed">
          Al confirmar la cancelación, el horario quedará liberado inmediatamente para que otro paciente pueda ser atendido. Tu cita quedará archivada en tu historial.
        </p>
      </div>

      <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
        <strong class="block text-slate-900">{{ appointmentToCancel?.servicio }}</strong>
        <span>📅 {{ appointmentToCancel?.fecha_hora }} • {{ appointmentToCancel?.sede?.nombre }}</span>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Motivo de la cancelación (opcional):</label>
        <textarea
          v-model="cancelReason"
          rows="2"
          placeholder="Ej: Viaje de fuerza mayor, cambio de horario laboral..."
          class="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
        ></textarea>
      </div>

      <div class="flex gap-2 pt-2">
        <button
          type="button"
          @click="showCancelModal = false"
          class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
        >
          No cancelar
        </button>
        <button
          type="button"
          @click="confirmCancelAppointment"
          :disabled="cancelingLoading"
          class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-md disabled:opacity-50 cursor-pointer"
        >
          {{ cancelingLoading ? 'Cancelando...' : 'Sí, Cancelar Cita' }}
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL DE REPROGRAMACIÓN ATÓMICA DE CITA -->
  <div v-if="showRescheduleModal && appointmentToReschedule" class="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
    <div class="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl animate-pop-in space-y-4 max-h-[92vh] overflow-y-auto border border-slate-100">
      
      <!-- Encabezado del Modal -->
      <div class="flex justify-between items-center border-b border-slate-200 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
            🗓️
          </div>
          <div>
            <h4 class="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">Reprogramar Consulta Médica</h4>
            <p class="text-[11px] text-slate-500">Seleccione sede, nueva fecha y horario según disponibilidad del Dr. Lisandro Márquez</p>
          </div>
        </div>
        <button 
          type="button" 
          @click="showRescheduleModal = false" 
          class="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-xl transition cursor-pointer"
        >
          &times;
        </button>
      </div>

      <!-- Resumen de la Cita Actual a Reprogramar -->
      <div class="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2 text-xs">
        <div class="flex justify-between items-start gap-2">
          <span class="text-slate-500 font-medium">Servicio Clínico:</span>
          <strong class="text-slate-800 text-right">{{ appointmentToReschedule.servicio }}</strong>
        </div>
        <div class="flex justify-between items-start gap-2">
          <span class="text-slate-500 font-medium">Horario Actual Pautado:</span>
          <span class="font-bold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
            {{ appointmentToReschedule.fecha }} a las {{ appointmentToReschedule.hora }}
          </span>
        </div>
      </div>

      <!-- 1. Selección de Sede Médica -->
      <div>
        <label class="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
          <span>1. Sede de Atención Médica: *</span>
          <span class="text-[10px] text-sky-600 font-semibold">Presencial</span>
        </label>
        <select
          v-model="rescheduleSedeId"
          @change="onRescheduleSedeChange"
          class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden shadow-2xs cursor-pointer"
        >
          <option v-for="s in sedesList" :key="s.id" :value="s.id">
            {{ s.nombre }} — ({{ s.dias }})
          </option>
        </select>
      </div>

      <!-- 2. Información de Días Habilitados por el Doctor para esta Sede -->
      <div class="p-3 rounded-2xl bg-sky-50/80 border border-sky-200 text-xs space-y-2">
        <div class="flex items-center justify-between flex-wrap gap-1">
          <span class="font-extrabold text-sky-950 flex items-center gap-1.5">
            <span>📍</span>
            <span>{{ selectedRescheduleSedeObj.nombre }}</span>
          </span>
          <span v-if="rescheduleSedeSchedule" class="text-[10px] font-extrabold bg-sky-200/90 text-sky-900 px-2.5 py-0.5 rounded-full">
            Atención: {{ rescheduleSedeSchedule.dias_atencion_texto }}
          </span>
        </div>

        <!-- Botones de Acceso Rápido a Próximas Fechas Habilitadas -->
        <div v-if="upcomingRescheduleDates.length">
          <span class="text-[11px] text-slate-600 font-semibold block mb-1.5">
            🗓️ Próximas fechas con consulta habilitada (toque para elegir):
          </span>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="quick in upcomingRescheduleDates"
              :key="quick.fecha"
              type="button"
              @click="selectQuickRescheduleDate(quick.fecha)"
              class="px-2.5 py-1 rounded-xl text-xs font-extrabold transition cursor-pointer border"
              :class="newDate === quick.fecha ? 'bg-sky-600 text-white border-sky-600 shadow-xs' : 'bg-white text-slate-700 border-slate-300 hover:border-sky-400 hover:bg-sky-50 shadow-2xs'"
            >
              {{ quick.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 3. Selección de Nueva Fecha en Calendario -->
      <div>
        <label class="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
          <span>2. Seleccione la Nueva Fecha: *</span>
          <span class="text-[10px] text-slate-500">Anticipación mínima: 1 día</span>
        </label>
        <input
          type="date"
          v-model="newDate"
          :min="minRescheduleDate"
          :max="maxRescheduleDate"
          @change="onRescheduleDateChange"
          class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white shadow-2xs cursor-pointer"
        />

        <!-- ALERTA SI LA FECHA ESTÁ BLOQUEADA POR EL DOCTOR O NO ATIENDE EN ESTA SEDE -->
        <div v-if="isRescheduleDateBlocked" class="mt-3 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2 animate-fade-in shadow-xs">
          <div class="flex items-center gap-2 font-black text-xs text-rose-800">
            <svg class="w-4 h-4 shrink-0 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
            <span>Fecha No Disponible en esta Sede</span>
          </div>
          <p class="text-xs leading-relaxed text-rose-900 font-medium">
            {{ rescheduleBlockedReason }}
          </p>
          <div v-if="upcomingRescheduleDates.length" class="pt-2 border-t border-rose-200">
            <span class="text-[11px] font-bold text-rose-900 block mb-1">
              👉 Fechas recomendadas donde el Dr. sí tiene consulta:
            </span>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="quick in upcomingRescheduleDates"
                :key="quick.fecha"
                type="button"
                @click="selectQuickRescheduleDate(quick.fecha)"
                class="px-2.5 py-1 rounded-xl bg-white border border-rose-300 text-rose-900 text-xs font-extrabold hover:bg-rose-100 transition shadow-2xs cursor-pointer"
              >
                {{ quick.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Selección de Nuevo Horario Disponible -->
      <div v-if="newDate && !isRescheduleDateBlocked">
        <label class="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
          <span>3. Seleccione el Nuevo Horario Disponible: *</span>
          <span class="text-[10px] text-sky-700 font-mono font-semibold">{{ newDate }}</span>
        </label>

        <!-- Indicador de Carga -->
        <div v-if="loadingSlots" class="text-center py-6 text-xs text-sky-600 animate-pulse font-semibold">
          Consultando turnos disponibles en tiempo real...
        </div>

        <!-- Grilla de Slots -->
        <div v-else-if="availableSlots.length" class="grid grid-cols-3 sm:grid-cols-4 gap-2">
          <button
            v-for="s in availableSlots"
            :key="s.hora"
            type="button"
            :disabled="!s.disponible"
            @click="s.disponible && (newTime = s.hora)"
            class="py-2 px-1 text-center rounded-xl text-xs font-extrabold border transition shadow-2xs cursor-pointer"
            :class="!s.disponible 
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50' 
              : (newTime === s.hora 
                ? 'bg-sky-600 text-white border-sky-600 shadow-md ring-2 ring-sky-300' 
                : 'bg-white text-slate-800 border-slate-200 hover:border-sky-400 hover:bg-sky-50')"
            :title="s.motivo || (s.disponible ? 'Turno disponible' : 'Turno ocupado')"
          >
            {{ s.hora }}
          </button>
        </div>

        <div v-else class="text-center py-4 text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
          No hay turnos disponibles para esta fecha.
        </div>
      </div>

      <!-- Preview de Confirmación de Reprogramación -->
      <div v-if="newDate && newTime && !isRescheduleDateBlocked" class="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1 animate-fade-in">
        <div class="flex items-center gap-1.5 font-extrabold text-emerald-800">
          <span>✓</span>
          <span>Nuevo Horario Seleccionado:</span>
        </div>
        <p class="font-medium text-emerald-900">
          <strong>{{ newDate }} a las {{ newTime }}</strong> en <strong>{{ selectedRescheduleSedeObj.nombre }}</strong>.
        </p>
      </div>

      <!-- Botones de Acción -->
      <div class="flex gap-2.5 pt-2 border-t border-slate-200">
        <button
          type="button"
          @click="showRescheduleModal = false"
          class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
        >
          Volver
        </button>
        <button
          type="button"
          @click="confirmRescheduleAppointment"
          :disabled="reschedulingLoading || !newDate || !newTime || isRescheduleDateBlocked"
          class="flex-2 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{{ reschedulingLoading ? 'Reprogramando cita...' : 'Confirmar Nueva Fecha' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>
