<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import doctorData from '../data/doctor.json';
import { API_BASE_URL } from '../config/api';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'toast', 'loginSuccess', 'logoutSuccess']);

const token = ref(localStorage.getItem('dr_lisandro_jwt_token') || '');
const username = ref('admin');
const password = ref('admin123');
const loading = ref(false);

const citas = ref([]);
const pacientes = ref([]);
const bloqueos = ref([]);
const sedes = ref([]);
const loadingPacientes = ref(false);
const loadingBloqueos = ref(false);
const activeTab = ref('citas'); // 'citas' | 'pacientes' | 'bloqueos'

// Formulario de bloqueo de agenda y días que no atiende
const blockMode = ref('semanal'); // 'semanal' | 'dia' | 'rango'
const singleDayDate = ref('');

// Gestión de Días de Atención Semanales por Sede
const selectedScheduleSedeId = ref(1);
const horariosEdit = ref({
  0: { dia: 'Lunes', activo: true, hora_inicio: '08:30', hora_fin: '16:30', intervalo: 45 },
  1: { dia: 'Martes', activo: false, hora_inicio: '08:30', hora_fin: '16:30', intervalo: 45 },
  2: { dia: 'Miércoles', activo: true, hora_inicio: '08:30', hora_fin: '16:30', intervalo: 45 },
  3: { dia: 'Jueves', activo: false, hora_inicio: '08:30', hora_fin: '16:30', intervalo: 45 },
  4: { dia: 'Viernes', activo: true, hora_inicio: '08:30', hora_fin: '16:30', intervalo: 45 },
  5: { dia: 'Sábado', activo: false, hora_inicio: '08:30', hora_fin: '13:00', intervalo: 45 },
  6: { dia: 'Domingo', activo: false, hora_inicio: '08:30', hora_fin: '13:00', intervalo: 45 }
});
const savingWeeklySchedule = ref(false);
const loadingWeeklySchedule = ref(false);

const loadWeeklyScheduleForSede = async (sedeId) => {
  if (!sedeId) return;
  loadingWeeklySchedule.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/api/disponibilidad/resumen-sede/${sedeId}`);
    if (res.ok) {
      const data = await res.json();
      const porDia = data.horarios_por_dia || {};
      const diasNombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      for (let i = 0; i <= 6; i++) {
        if (porDia[i]) {
          horariosEdit.value[i] = {
            dia: diasNombres[i],
            activo: porDia[i].activo,
            hora_inicio: porDia[i].hora_inicio || '08:30',
            hora_fin: porDia[i].hora_fin || (i === 5 ? '13:00' : '16:30'),
            intervalo: porDia[i].intervalo || 45
          };
        } else {
          horariosEdit.value[i] = {
            dia: diasNombres[i],
            activo: (data.dias_activos || []).includes(i),
            hora_inicio: '08:30',
            hora_fin: i === 5 ? '13:00' : '16:30',
            intervalo: 45
          };
        }
      }
    }
  } catch (e) {
    console.warn('Error al cargar horarios de sede:', e);
  } finally {
    loadingWeeklySchedule.value = false;
  }
};

const handleSaveWeeklySchedule = async () => {
  if (!selectedScheduleSedeId.value) return;
  savingWeeklySchedule.value = true;
  try {
    const diasArray = Object.keys(horariosEdit.value).map(k => ({
      dia_semana: parseInt(k),
      activo: horariosEdit.value[k].activo,
      hora_inicio: horariosEdit.value[k].hora_inicio,
      hora_fin: horariosEdit.value[k].hora_fin,
      intervalo_minutos: horariosEdit.value[k].intervalo || 45
    }));

    const res = await fetch(`${API_BASE_URL}/api/doctor/horarios/sede/${selectedScheduleSedeId.value}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ dias: diasArray })
    });

    if (res.ok) {
      const sedeObj = sedes.value.find(s => s.id === selectedScheduleSedeId.value);
      emit('toast', {
        msg: `✓ Días de atención guardados para ${sedeObj ? sedeObj.nombre : 'la sede'}. Los pacientes verán esta disponibilidad al agendar.`,
        type: 'success'
      });
      await loadWeeklyScheduleForSede(selectedScheduleSedeId.value);
    } else {
      const errData = await res.json().catch(() => ({}));
      emit('toast', { msg: errData.mensaje || 'Error al guardar horarios', type: 'danger' });
    }
  } catch (e) {
    emit('toast', { msg: 'Error de conexión al guardar horarios', type: 'danger' });
  } finally {
    savingWeeklySchedule.value = false;
  }
};
const singleDayMotivoPreset = ref('No atiendo consultas en este día (Día No Laborable)');
const singleDayCustomMotivo = ref('');
const singleDaySedeId = ref(null);

const minTodayDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const newBlock = ref({
  fecha_inicio: '',
  hora_inicio: '08:00',
  fecha_fin: '',
  hora_fin: '17:00',
  motivo: 'Procedimiento Quirúrgico / Cirugía',
  sede_id: null
});
const savingBlock = ref(false);

const stats = ref({
  total_citas: 0,
  citas_pendientes: 0,
  citas_confirmadas: 0,
  citas_completadas: 0,
  total_pacientes: 0
});

const activeFilter = ref('todos');
const searchQuery = ref('');

// Filtros avanzados para la Agenda de Citas (Sedes y Fechas)
const selectedSedeFilter = ref('todas'); // 'todas' | 1 | 2 | 3
const selectedDateQuickFilter = ref('todas'); // 'todas' | 'hoy' | 'semana' | 'proximas' | 'custom'
const customDateFilter = ref('');

// Modal de Ficha Médica y Notas Clínicas Privadas de la Consulta
const showClinicalNoteModal = ref(false);
const activeCitaForNote = ref(null);
const doctorNoteEdit = ref('');
const savingClinicalNote = ref(false);

const openClinicalNote = (cita) => {
  activeCitaForNote.value = cita;
  doctorNoteEdit.value = cita.notas_doctor || '';
  showClinicalNoteModal.value = true;
};

const saveClinicalNote = async () => {
  if (!activeCitaForNote.value) return;
  savingClinicalNote.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/api/citas/${activeCitaForNote.value.id}/notas`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({
        notas_doctor: doctorNoteEdit.value.trim()
      })
    });

    if (res.ok) {
      activeCitaForNote.value.notas_doctor = doctorNoteEdit.value.trim();
      const inList = citas.value.find(c => c.id === activeCitaForNote.value.id);
      if (inList) inList.notas_doctor = doctorNoteEdit.value.trim();
      emit('toast', { msg: '✓ Notas médicas y diagnóstico guardados en el expediente', type: 'success' });
      showClinicalNoteModal.value = false;
    } else {
      emit('toast', { msg: 'No se pudieron guardar las notas médicas', type: 'danger' });
    }
  } catch (e) {
    emit('toast', { msg: 'Error de conexión al guardar nota médica', type: 'danger' });
  } finally {
    savingClinicalNote.value = false;
  }
};

// Modal de Expediente Integral del Paciente
const showPatientRecordModal = ref(false);
const loadingPatientRecord = ref(false);
const patientRecordData = ref(null);

const openPatientRecordModal = async (paciente) => {
  showPatientRecordModal.value = true;
  loadingPatientRecord.value = true;
  patientRecordData.value = null;

  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/pacientes/${paciente.id}/expediente`);

    if (res.ok) {
      patientRecordData.value = await res.json();
    } else {
      // Fallback local con las citas ya cargadas en memoria
      const pacienteCitas = citas.value.filter(c => 
        (c.correo && paciente.correo && c.correo.toLowerCase() === paciente.correo.toLowerCase()) ||
        (c.paciente && paciente.nombre && c.paciente.toLowerCase() === paciente.nombre.toLowerCase())
      );
      patientRecordData.value = {
        paciente: {
          id: paciente.id,
          tipo: paciente.tipo || 'web',
          nombre: paciente.nombre,
          correo: paciente.correo,
          telefono: paciente.telefono,
          foto_url: paciente.foto_url
        },
        estadisticas: {
          total: pacienteCitas.length,
          completadas: pacienteCitas.filter(c => (c.estado || '').toLowerCase() === 'completada').length,
          confirmadas: pacienteCitas.filter(c => (c.estado || '').toLowerCase() === 'confirmada').length,
          pendientes: pacienteCitas.filter(c => (c.estado || '').toLowerCase() === 'pendiente').length,
          inasistencias: pacienteCitas.filter(c => (c.estado || '').toLowerCase().includes('no_asistio')).length,
          canceladas: pacienteCitas.filter(c => (c.estado || '').toLowerCase().includes('cancelada')).length
        },
        historial: pacienteCitas
      };
    }
  } catch (e) {
    console.warn('Error al cargar expediente:', e);
  } finally {
    loadingPatientRecord.value = false;
  }
};

const citasTodayCount = computed(() => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;
  return citas.value.filter(c => (c.fecha || (c.fecha_hora ? c.fecha_hora.split(' ')[0] : '')) === todayStr).length;
});

const isAuthenticated = computed(() => !!token.value);

const fetchWithAuth = async (url, options = {}) => {
  // 1. Si no hay token o es demo_token, auto-autenticar con Render primero
  if (!token.value || token.value === 'demo_token') {
    await handleLogin(true);
  }

  const reqHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    'Authorization': `Bearer ${token.value}`
  };

  let res;
  try {
    res = await fetch(url, { ...options, headers: reqHeaders });
  } catch (err) {
    console.warn(`Error de red al consultar ${url}:`, err);
    throw err;
  }

  // 2. Si el token expiró o fue rechazado con 401 Unauthorized, auto-renovar contra Render y reintentar
  if (res.status === 401) {
    console.warn(`401 Unauthorized en ${url}. Auto-renovando token médico contra Render...`);
    const refreshed = await handleLogin(true);
    if (refreshed && token.value && token.value !== 'demo_token') {
      reqHeaders['Authorization'] = `Bearer ${token.value}`;
      res = await fetch(url, { ...options, headers: reqHeaders });
    }
  }

  return res;
};

watch(() => props.isOpen, async (open) => {
  if (open) {
    if (!token.value || token.value === 'demo_token') {
      await handleLogin(true);
    } else {
      await loadDashboardData();
    }
  }
});

onMounted(async () => {
  if (token.value && token.value !== 'demo_token') {
    await loadDashboardData();
  }
});

const handleLogin = async (silent = false) => {
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value || 'admin',
        password: password.value || 'admin123'
      })
    });

    if (res.ok) {
      const data = await res.json();
      token.value = data.token;
      localStorage.setItem('dr_lisandro_jwt_token', data.token);
      emit('loginSuccess');
      if (!silent) {
        emit('toast', { msg: '¡Bienvenido al Panel Médico, Dr. Lisandro!', type: 'success' });
      }
      await loadDashboardData();
      return true;
    }

    if (!silent) {
      emit('toast', { msg: 'Credenciales médicas incorrectas', type: 'danger' });
    }
    return false;
  } catch (error) {
    console.warn('Error al autenticar contra /api/login:', error);
    if (!silent) {
      emit('toast', { msg: 'Conectando con el servidor médico en Render...', type: 'warning' });
    }
    return false;
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  token.value = '';
  localStorage.removeItem('dr_lisandro_jwt_token');
  emit('logoutSuccess');
  emit('toast', { msg: 'Sesión médica cerrada', type: 'info' });
};

const loadDashboardData = async () => {
  try {
    // 1. Cargar estadísticas
    const resStats = await fetchWithAuth(`${API_BASE_URL}/api/estadisticas`);
    if (resStats.ok) {
      stats.value = await resStats.json();
    }

    // 2. Cargar citas
    const resCitas = await fetchWithAuth(`${API_BASE_URL}/api/citas`);
    if (resCitas.ok) {
      citas.value = await resCitas.json();
    }

    // 3. Cargar directorio de pacientes
    try {
      loadingPacientes.value = true;
      const resPacientes = await fetchWithAuth(`${API_BASE_URL}/api/pacientes`);
      if (resPacientes.ok) {
        pacientes.value = await resPacientes.json();
      }
    } catch (e) {
      console.warn('Error al consultar pacientes:', e);
    } finally {
      loadingPacientes.value = false;
    }

    // 4. Cargar bloqueos de agenda y horarios semanales
    loadBloqueos();
    loadWeeklyScheduleForSede(selectedScheduleSedeId.value);

    // 5. Cargar sedes
    try {
      const resSedes = await fetch(`${API_BASE_URL}/api/sedes`);
      if (resSedes.ok) {
        sedes.value = await resSedes.json();
        if (sedes.value.length && !newBlock.value.sede_id) {
          newBlock.value.sede_id = sedes.value[0].id;
        }
      }
    } catch (e) {}

    return;
  } catch (e) {
    console.error('Error al conectar con Render en dashboard:', e);
  }
};

const loadBloqueos = async () => {
  loadingBloqueos.value = true;
  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/doctor/bloqueos`);
    if (res.ok) {
      bloqueos.value = await res.json();
    }
  } catch (e) {
    console.warn('Error al cargar bloqueos:', e);
  } finally {
    loadingBloqueos.value = false;
  }
};

const handleCreateSingleDayBlock = async () => {
  if (!singleDayDate.value) {
    emit('toast', { msg: 'Por favor selecciona la fecha que deseas bloquear', type: 'warning' });
    return;
  }
  
  const motivoFinal = singleDayMotivoPreset.value === 'otro'
    ? (singleDayCustomMotivo.value.trim() || 'No disponible para consultas')
    : singleDayMotivoPreset.value;

  savingBlock.value = true;
  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/doctor/bloqueos`, {
      method: 'POST',
      body: JSON.stringify({
        fecha: singleDayDate.value,
        motivo: motivoFinal,
        sede_id: singleDaySedeId.value
      })
    });

    if (res.ok) {
      emit('toast', { msg: `¡Día ${singleDayDate.value} bloqueado! Los pacientes verán este día bloqueado para citas.`, type: 'success' });
      singleDayDate.value = '';
      singleDayCustomMotivo.value = '';
      await loadBloqueos();
    } else {
      const data = await res.json();
      emit('toast', { msg: data.mensaje || 'Error al guardar bloqueo', type: 'danger' });
    }
  } catch (e) {
    emit('toast', { msg: 'Error de conexión al registrar bloqueo', type: 'danger' });
  } finally {
    savingBlock.value = false;
  }
};

const handleCreateBlock = async () => {
  if (!newBlock.value.fecha_inicio || !newBlock.value.fecha_fin) {
    emit('toast', { msg: 'Por favor complete fecha de inicio y fin para el bloqueo', type: 'warning' });
    return;
  }

  savingBlock.value = true;
  try {
    const inicioStr = `${newBlock.value.fecha_inicio} ${newBlock.value.hora_inicio || '08:00'}`;
    const finStr = `${newBlock.value.fecha_fin} ${newBlock.value.hora_fin || '17:00'}`;

    const res = await fetch(`${API_BASE_URL}/api/doctor/bloqueos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({
        fecha_inicio: inicioStr,
        fecha_fin: finStr,
        motivo: newBlock.value.motivo,
        sede_id: newBlock.value.sede_id
      })
    });

    if (res.ok) {
      emit('toast', { msg: 'Bloqueo de agenda guardado correctamente', type: 'success' });
      newBlock.value.fecha_inicio = '';
      newBlock.value.fecha_fin = '';
      await loadBloqueos();
    } else {
      const data = await res.json();
      emit('toast', { msg: data.mensaje || 'Error al guardar bloqueo', type: 'danger' });
    }
  } catch (e) {
    emit('toast', { msg: 'Error de conexión al registrar bloqueo', type: 'danger' });
  } finally {
    savingBlock.value = false;
  }
};

const deleteBloqueo = async (blockId) => {
  if (!confirm('¿Desea desbloquear este intervalo y habilitar nuevamente la disponibilidad médica?')) return;
  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/doctor/bloqueos/${blockId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      bloqueos.value = bloqueos.value.filter(b => b.id !== blockId);
      emit('toast', { msg: 'Bloqueo eliminado y agenda liberada', type: 'info' });
    }
  } catch (e) {
    emit('toast', { msg: 'Error al eliminar bloqueo', type: 'danger' });
  }
};

const loadMockData = () => {
  citas.value = [
    { id: 101, fecha_hora: '2026-10-31 09:30', estado: 'Confirmada', paciente: 'Carlos Mendoza', telefono: '0412-5551234', correo: 'carlos.m@email.com', servicio: 'Chequeo Prostático Preventivo' },
    { id: 102, fecha_hora: '2026-10-31 11:00', estado: 'Pendiente', paciente: 'Roberto Gómez', telefono: '0414-9876543', correo: 'rgomez@gmail.com', servicio: 'Tratamiento de Litiasis Renal (Láser)' },
    { id: 103, fecha_hora: '2026-11-01 15:00', estado: 'Presente', paciente: 'Alejandro Silva', telefono: '0424-3321100', correo: 'asilva@outlook.com', servicio: 'Evaluación Urológica con 3 Ecos' },
    { id: 104, fecha_hora: '2026-11-02 10:15', estado: 'Completada', paciente: 'Fernando Colmenares', telefono: '0414-4455667', correo: 'fcolmenares@yahoo.com', servicio: 'Andrología y Salud Sexual' }
  ];

  stats.value = {
    total_citas: citas.value.length,
    citas_pendientes: citas.value.filter(c => c.estado === 'Pendiente').length,
    citas_confirmadas: citas.value.filter(c => c.estado === 'Confirmada').length,
    total_pacientes: 4
  };
};

const filteredCitas = computed(() => {
  let list = citas.value;

  // 1. Filtro por Estado Clínico
  if (activeFilter.value !== 'todos') {
    list = list.filter(c => (c.estado || '').toLowerCase() === activeFilter.value.toLowerCase());
  }

  // 2. Filtro por Sede Médica
  if (selectedSedeFilter.value !== 'todas') {
    list = list.filter(c => c.sede_id === selectedSedeFilter.value);
  }

  // 3. Filtro por Fecha Rápida
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  if (selectedDateQuickFilter.value === 'hoy') {
    list = list.filter(c => (c.fecha || (c.fecha_hora ? c.fecha_hora.split(' ')[0] : '')) === todayStr);
  } else if (selectedDateQuickFilter.value === 'proximas') {
    list = list.filter(c => (c.fecha || (c.fecha_hora ? c.fecha_hora.split(' ')[0] : '')) >= todayStr);
  } else if (selectedDateQuickFilter.value === 'semana') {
    const currentDayOfWeek = now.getDay();
    const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const fmt = dt => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    const monStr = fmt(monday);
    const sunStr = fmt(sunday);

    list = list.filter(c => {
      const f = c.fecha || (c.fecha_hora ? c.fecha_hora.split(' ')[0] : '');
      return f >= monStr && f <= sunStr;
    });
  } else if (selectedDateQuickFilter.value === 'custom' && customDateFilter.value) {
    list = list.filter(c => (c.fecha || (c.fecha_hora ? c.fecha_hora.split(' ')[0] : '')) === customDateFilter.value);
  }

  // 4. Búsqueda Textual
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(c =>
      (c.paciente && c.paciente.toLowerCase().includes(q)) ||
      (c.telefono && c.telefono.toLowerCase().includes(q)) ||
      (c.correo && c.correo.toLowerCase().includes(q)) ||
      (c.servicio && c.servicio.toLowerCase().includes(q)) ||
      (c.codigo_cita && c.codigo_cita.toLowerCase().includes(q)) ||
      (c.codigo && c.codigo.toLowerCase().includes(q))
    );
  }
  return list;
});

const filteredPacientes = computed(() => {
  let list = pacientes.value;
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(p =>
      (p.nombre && p.nombre.toLowerCase().includes(q)) ||
      (p.telefono && p.telefono.toLowerCase().includes(q)) ||
      (p.correo && p.correo.toLowerCase().includes(q))
    );
  }
  return list;
});

const getWhatsAppPatientDirectLink = (paciente) => {
  const cleanPhone = (paciente.telefono || '').replace(/[^0-9]/g, '');
  const phone = cleanPhone.startsWith('58') ? cleanPhone : (cleanPhone.startsWith('0') ? '58' + cleanPhone.substring(1) : cleanPhone);
  const msg = `Hola ${paciente.nombre || 'estimado paciente'}, le escribimos desde el consultorio del Dr. Lisandro Márquez (Urólogo). Nos comunicamos para verificar su estado y coordinar su próxima consulta médica.`;
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
};

const changeStatus = async (citaId, newStatus) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/citas/${citaId}/estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ estado: newStatus })
    });
    if (!res.ok) {
      // Reintentar en ruta legacy
      await fetch(`${API_BASE_URL}/api/citas/${citaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({ estado: newStatus })
      });
    }
  } catch (e) {}

  const c = citas.value.find(item => item.id === citaId);
  if (c) c.estado = newStatus;
  emit('toast', { msg: `Cita #${citaId} actualizada a ${newStatus}`, type: 'success' });
  loadDashboardData();
};

const isSyncing = ref(false);

const handleSync = async () => {
  isSyncing.value = true;
  try {
    // Re-autenticar silenciosamente para garantizar token fresco de Render
    await handleLogin(true);
    await loadDashboardData();
    emit('toast', { msg: `✓ Sincronizado con Render: ${citas.value.length} citas y ${pacientes.value.length} pacientes activos`, type: 'success' });
  } catch (e) {
    emit('toast', { msg: 'Error al sincronizar datos con el servidor', type: 'danger' });
  } finally {
    isSyncing.value = false;
  }
};

const deleteCita = async (citaId) => {
  if (!confirm(`¿Desea cancelar y eliminar definitivamente la cita #${citaId}?`)) return;

  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/citas/${citaId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      emit('toast', { msg: data.mensaje || `Error al eliminar cita #${citaId}`, type: 'danger' });
      return;
    }
    citas.value = citas.value.filter(c => c.id !== citaId);
    stats.value.total_citas = citas.value.length;
    emit('toast', { msg: `Cita #${citaId} eliminada correctamente de la base de datos`, type: 'info' });
  } catch (e) {
    emit('toast', { msg: `Error de conexión al eliminar cita #${citaId}`, type: 'danger' });
  }
};

const deletePaciente = async (pacienteId) => {
  const displayId = String(pacienteId).replace('leg_', '');
  if (!confirm(`¿Desea eliminar definitivamente al paciente #${displayId} de la base de datos?\n\nEsta acción borrará el registro de forma permanente junto con su historial de citas.`)) return;

  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/pacientes/${pacienteId}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      emit('toast', { msg: data.mensaje || `Error al eliminar paciente #${displayId}`, type: 'danger' });
      return;
    }

    pacientes.value = pacientes.value.filter(p => p.id !== pacienteId);
    citas.value = citas.value.filter(c => c.paciente_id !== pacienteId);
    stats.value.total_pacientes = pacientes.value.length;
    emit('toast', { msg: `✓ Paciente #${displayId} eliminado definitivamente de la base de datos`, type: 'success' });
  } catch (e) {
    emit('toast', { msg: `Error de conexión al eliminar paciente #${displayId}`, type: 'danger' });
  }
};

const getWhatsAppPatientLink = (cita) => {
  const cleanPhone = (cita.telefono || '').replace(/[^0-9]/g, '');
  const phone = cleanPhone.startsWith('58') ? cleanPhone : (cleanPhone.startsWith('0') ? '58' + cleanPhone.substring(1) : cleanPhone);
  const msg = encodeURIComponent(
    `Estimado/a ${cita.paciente}, le contactamos del consultorio del Dr. Lisandro Márquez para coordinar su cita de ${cita.servicio} pautada para el ${cita.fecha_hora}. ¿Nos confirma su asistencia? Muchas gracias.`
  );
  return `https://wa.me/${phone || doctorData.whatsapp}?text=${msg}`;
};



const downloadAssistantPDF = () => {
  if (!citas.value.length) {
    emit('toast', { msg: 'No hay citas registradas para generar el reporte.', type: 'warning' });
    return;
  }

  const list = filteredCitas.value;
  const fechaHoy = new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const horaEmision = new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });

  const rowsHtml = list.map((c, i) => `
    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px; background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 10px 8px; font-weight: bold; color: #0284c7; text-align: center;">${c.codigo || '#' + c.id}</td>
      <td style="padding: 10px 8px; font-weight: bold; color: #0f172a; white-space: nowrap;">${c.fecha_hora}</td>
      <td style="padding: 10px 8px;">
        <strong style="color: #0f172a; display: block; font-size: 12px;">${c.paciente || 'Sin nombre'}</strong>
        <span style="color: #64748b; font-size: 10px;">${c.correo || ''}</span>
      </td>
      <td style="padding: 10px 8px; font-family: monospace; font-size: 11px; color: #334155;">${c.telefono || 'Sin teléfono'}</td>
      <td style="padding: 10px 8px; color: #334155; font-weight: 500;">${c.servicio || 'Consulta General'}</td>
      <td style="padding: 10px 8px; text-align: center;">
        <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 10px; background: #e0f2fe; color: #0369a1;">
          ${c.estado || 'Pendiente'}
        </span>
      </td>
      <td style="padding: 10px 8px; border-left: 1px dashed #cbd5e1; width: 120px;">
        <div style="height: 18px; border-bottom: 1px dotted #94a3b8;"></div>
      </td>
    </tr>
  `).join('');

  const reportHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Agenda Médica - Dr. Lisandro Márquez</title>
      <style>
        @page { size: letter landscape; margin: 12mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 15px; color: #0f172a; font-size: 12px; background: #ffffff; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 2px solid #0284c7; margin-bottom: 14px; }
        .doc-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
        .doc-sub { font-size: 12px; color: #0284c7; font-weight: bold; margin-top: 3px; }
        .meta-box { text-align: right; font-size: 11px; color: #475569; }
        .badge-report { display: inline-block; background: #0f172a; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #0f172a; color: #ffffff; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px; text-align: left; }
        .signatures { display: flex; justify-content: space-between; margin-top: 35px; page-break-inside: avoid; }
        .sig-block { width: 220px; text-align: center; border-top: 1px solid #94a3b8; padding-top: 6px; font-size: 11px; color: #475569; }
        .notice { font-size: 9px; color: #94a3b8; text-align: center; margin-top: 18px; border-top: 1px solid #f1f5f9; padding-top: 8px; }
        .no-print-bar { background: #0ea5e9; color: #ffffff; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(14, 165, 233, 0.25); }
        @media print { .no-print-bar { display: none !important; } }
      </style>
    </head>
    <body>
      <div class="no-print-bar">
        <span>Reporte Oficial para Asistente / Secretaría Médica — Dr. Lisandro Márquez</span>
        <button onclick="window.print()" style="background: #ffffff; color: #0284c7; border: none; padding: 7px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">
          Imprimir / Guardar como PDF
        </button>
      </div>

      <div class="header">
        <div>
          <h1 class="doc-title">${doctorData.nombre}</h1>
          <div class="doc-sub">Cirujano General (UCV) • Urólogo (UCV) • Especialista UNERG</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
            Sedes: Caracas (Clínica VidaMed) • Guatire • Barlovento | WhatsApp: ${doctorData.telefono_display}
          </div>
        </div>
        <div class="meta-box">
          <div class="badge-report">HOJA DE CONTROL - ASISTENCIA MÉDICA</div>
          <div><strong>Fecha:</strong> ${fechaHoy}</div>
          <div><strong>Emisión:</strong> ${horaEmision}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 50px; text-align: center;">Código</th>
            <th style="width: 110px;">Fecha y Hora</th>
            <th style="width: 170px;">Paciente</th>
            <th style="width: 115px;">Contacto</th>
            <th>Servicio Clínico</th>
            <th style="width: 90px; text-align: center;">Estado</th>
            <th style="width: 120px; text-align: center;">Asistencia / Firma</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="signatures">
        <div class="sig-block">
          <strong>Firma Asistente Médica</strong><br>
          <span style="font-size: 10px;">Recepción y Control</span>
        </div>
        <div class="sig-block">
          <strong>${doctorData.nombre}</strong><br>
          <span style="font-size: 10px;">Firma y Sello Médico</span>
        </div>
      </div>

      <div class="notice">
        Documento médico administrativo confidencial. Sujeto a normas de ética y secreto profesional.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        };
      <\/script>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(reportHtml);
    win.document.close();
    emit('toast', { msg: 'Reporte para asistente generado', type: 'success' });
  } else {
    emit('toast', { msg: 'Por favor permite ventanas emergentes', type: 'warning' });
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
    <div class="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] overflow-hidden shadow-2xl flex flex-col animate-pop-in border border-slate-100">
      
      <!-- Top Header -->
      <div class="px-3.5 sm:px-6 py-3 sm:py-4 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
        <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <svg class="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="min-w-0">
            <h3 class="text-xs sm:text-base font-extrabold block leading-tight truncate max-w-[200px] xs:max-w-[260px] sm:max-w-none">{{ doctorData.nombre }}</h3>
            <span class="text-[10px] sm:text-[11px] text-sky-400 block font-semibold truncate max-w-[220px] xs:max-w-[280px] sm:max-w-none">Portal Médico Privado • Agenda & Disponibilidad</span>
          </div>
        </div>

        <button 
          type="button" 
          @click="$emit('close')" 
          class="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center text-xl transition cursor-pointer shrink-0 ml-2"
          title="Cerrar"
        >
          &times;
        </button>
      </div>

      <!-- Pantalla de Login Médico -->
      <div v-if="!isAuthenticated" class="p-6 sm:p-8 max-w-md mx-auto w-full text-center my-auto">
        <div class="w-14 h-14 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <svg class="w-7 h-7 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h4 class="text-xl font-extrabold text-slate-900 mb-1">Acceso Administrativo Médico</h4>
        <p class="text-xs text-slate-500 mb-4">Exclusivo para el Dr. Lisandro Márquez y personal de secretaría médica.</p>



        <form @submit.prevent="handleLogin(false)" class="space-y-3.5 text-left">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Usuario Autorizado:</label>
            <input type="text" v-model="username" required placeholder="admin" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white shadow-2xs" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Contraseña de Seguridad:</label>
            <input type="password" v-model="password" required placeholder="admin123" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white shadow-2xs" />
          </div>

          <button type="submit" :disabled="loading" class="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
            <svg v-if="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loading ? 'Conectando con base de datos...' : 'Ingresar al Portal Médico (Dr. Lisandro)' }}</span>
          </button>
        </form>
      </div>

      <!-- Dashboard Principal del Doctor -->
      <div v-else class="p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
        
        <!-- Top Bar Actions -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3.5 sm:pb-4 border-b border-slate-200 gap-2.5 sm:gap-3">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Sesión Médica Activa
            </span>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button type="button" @click="downloadAssistantPDF" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reporte Asistente (PDF)
            </button>
            <button 
              type="button" 
              @click="handleSync" 
              :disabled="isSyncing"
              class="px-3 py-1.5 bg-sky-50 text-sky-700 font-bold rounded-xl text-xs hover:bg-sky-100 transition border border-sky-200 cursor-pointer flex items-center gap-1.5 disabled:opacity-60 shadow-2xs"
              title="Actualiza citas, directorio de pacientes y bloqueos de agenda en tiempo real desde la base de datos"
            >
              <svg 
                class="w-3.5 h-3.5 fill-none stroke-current" 
                :class="{ 'animate-spin': isSyncing }"
                viewBox="0 0 24 24" 
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{{ isSyncing ? 'Sincronizando...' : 'Sincronizar' }}</span>
            </button>
            <button type="button" @click="handleLogout" class="px-3 py-1.5 bg-rose-50 text-rose-700 font-bold rounded-xl text-xs hover:bg-rose-100 transition border border-rose-200 cursor-pointer">
              Cerrar Sesión
            </button>
          </div>
        </div>

        <!-- Indicadores / KPIs -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div 
            @click="activeTab = 'citas'; activeFilter = 'todos'"
            class="bg-sky-50/80 border p-4 rounded-2xl cursor-pointer hover:shadow-xs transition"
            :class="activeTab === 'citas' && activeFilter === 'todos' ? 'border-sky-500 ring-2 ring-sky-300' : 'border-sky-100'"
          >
            <span class="text-2xl font-extrabold text-sky-900 block">{{ stats.total_citas }}</span>
            <span class="text-[11px] font-bold text-sky-600 uppercase">Total Citas</span>
          </div>

          <div 
            @click="activeTab = 'citas'; activeFilter = 'pendiente'"
            class="bg-amber-50/80 border p-4 rounded-2xl cursor-pointer hover:shadow-xs transition"
            :class="activeTab === 'citas' && activeFilter === 'pendiente' ? 'border-amber-500 ring-2 ring-amber-300' : 'border-amber-100'"
          >
            <span class="text-2xl font-extrabold text-amber-900 block">{{ stats.citas_pendientes }}</span>
            <span class="text-[11px] font-bold text-amber-600 uppercase">Por Confirmar</span>
          </div>

          <div 
            @click="activeTab = 'citas'; activeFilter = 'confirmada'"
            class="bg-emerald-50/80 border p-4 rounded-2xl cursor-pointer hover:shadow-xs transition"
            :class="activeTab === 'citas' && activeFilter === 'confirmada' ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-emerald-100'"
          >
            <span class="text-2xl font-extrabold text-emerald-900 block">{{ stats.citas_confirmadas }}</span>
            <span class="text-[11px] font-bold text-emerald-600 uppercase">Confirmadas</span>
          </div>

          <div 
            @click="activeTab = 'pacientes'"
            class="bg-purple-50/80 border p-4 rounded-2xl cursor-pointer hover:shadow-xs transition"
            :class="activeTab === 'pacientes' ? 'border-purple-500 ring-2 ring-purple-300' : 'border-purple-200'"
          >
            <div class="flex items-center justify-between">
              <span class="text-2xl font-extrabold text-purple-900 block">{{ stats.total_pacientes }}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200/70 text-purple-900">Directorio</span>
            </div>
            <span class="text-[11px] font-bold text-purple-600 uppercase">Pacientes Registrados</span>
          </div>
        </div>

        <!-- Pestañas de Navegación del Panel -->
        <div class="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            @click="activeTab = 'citas'"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
            :class="activeTab === 'citas' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
          >
            <svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Agenda de Citas</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black" :class="activeTab === 'citas' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-700'">
              {{ citas.length }}
            </span>
          </button>

          <button
            type="button"
            @click="activeTab = 'bloqueos'"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
            :class="activeTab === 'bloqueos' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
          >
            <svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Días & Disponibilidad</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black" :class="activeTab === 'bloqueos' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'">
              {{ bloqueos.length }} bloqueos
            </span>
          </button>

          <button
            type="button"
            @click="activeTab = 'pacientes'"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
            :class="activeTab === 'pacientes' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
          >
            <svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Directorio Pacientes</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black" :class="activeTab === 'pacientes' ? 'bg-purple-400 text-white' : 'bg-purple-100 text-purple-800'">
              {{ stats.total_pacientes || pacientes.length }}
            </span>
          </button>
        </div>

        <!-- Filtros y Búsqueda -->
        <div v-if="activeTab !== 'bloqueos'" class="space-y-3">
          <div class="flex flex-wrap justify-between items-center gap-3">
            <input 
              type="text" 
              v-model="searchQuery" 
              :placeholder="activeTab === 'citas' ? 'Buscar cita por paciente, teléfono o comprobante...' : 'Buscar paciente por nombre, teléfono o correo...'" 
              class="p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm flex-1 min-w-[260px] focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white shadow-2xs" 
            />

            <!-- Filtros de estado para citas -->
            <div v-if="activeTab === 'citas'" class="flex gap-1.5 flex-wrap">
              <button 
                v-for="st in [
                  { id: 'todos', label: 'Todas' },
                  { id: 'pendiente', label: 'Pendiente' },
                  { id: 'confirmada', label: 'Confirmada' },
                  { id: 'presente', label: 'Presente' },
                  { id: 'completada', label: 'Completada' },
                  { id: 'no_asistio', label: 'Inasistencia' }
                ]" 
                :key="st.id" 
                type="button"
                @click="activeFilter = st.id"
                class="px-3 py-1 rounded-full text-[11px] font-bold transition border cursor-pointer"
                :class="activeFilter === st.id ? 'bg-slate-900 text-white border-slate-900 shadow-2xs' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'"
              >
                {{ st.label }}
              </button>
            </div>
          </div>

          <!-- FILTROS AVANZADOS POR SEDE Y FECHA (SOLO PARA AGENDA DE CITAS) -->
          <div v-if="activeTab === 'citas'" class="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
            <!-- Filtro por Sede Médica -->
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5 min-w-[65px]">
                <svg class="w-3.5 h-3.5 text-sky-700 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Sedes:</span>
              </span>
              <button 
                type="button" 
                @click="selectedSedeFilter = 'todas'"
                class="px-2.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer"
                :class="selectedSedeFilter === 'todas' ? 'bg-sky-700 text-white border-sky-700 shadow-2xs' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'"
              >
                Todas las Sedes ({{ citas.length }})
              </button>
              <button 
                v-for="s in sedes" 
                :key="s.id"
                type="button" 
                @click="selectedSedeFilter = s.id"
                class="px-2.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center gap-1.5"
                :class="selectedSedeFilter === s.id ? 'bg-sky-700 text-white border-sky-700 shadow-2xs' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'"
              >
                <span>{{ s.nombre.split('—')[0].trim() }}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold" :class="selectedSedeFilter === s.id ? 'bg-sky-800 text-sky-100' : 'bg-slate-100 text-slate-600'">
                  {{ citas.filter(c => c.sede_id === s.id).length }}
                </span>
              </button>
            </div>

            <!-- Filtro por Fecha -->
            <div class="flex items-center gap-2 flex-wrap pt-2.5 border-t border-slate-200/70">
              <span class="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5 min-w-[65px]">
                <svg class="w-3.5 h-3.5 text-slate-700 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Fechas:</span>
              </span>
              <button 
                type="button" 
                @click="selectedDateQuickFilter = 'todas'; customDateFilter = ''"
                class="px-2.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer"
                :class="selectedDateQuickFilter === 'todas' ? 'bg-slate-800 text-white border-slate-800 shadow-2xs' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'"
              >
                Historial Completo
              </button>
              <button 
                type="button" 
                @click="selectedDateQuickFilter = 'hoy'; customDateFilter = ''"
                class="px-2.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center gap-1.5"
                :class="selectedDateQuickFilter === 'hoy' ? 'bg-amber-600 text-white border-amber-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'"
              >
                <span>Citas de Hoy</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="selectedDateQuickFilter === 'hoy' ? 'bg-white text-amber-900 font-extrabold' : 'bg-amber-100 text-amber-900 font-extrabold'">
                  {{ citasTodayCount }}
                </span>
              </button>
              <button 
                type="button" 
                @click="selectedDateQuickFilter = 'semana'; customDateFilter = ''"
                class="px-2.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer"
                :class="selectedDateQuickFilter === 'semana' ? 'bg-slate-800 text-white border-slate-800 shadow-2xs' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'"
              >
                Esta Semana
              </button>
              <button 
                type="button" 
                @click="selectedDateQuickFilter = 'proximas'; customDateFilter = ''"
                class="px-2.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer"
                :class="selectedDateQuickFilter === 'proximas' ? 'bg-slate-800 text-white border-slate-800 shadow-2xs' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'"
              >
                Próximas Citas
              </button>
              <div class="flex items-center gap-1">
                <input 
                  type="date" 
                  v-model="customDateFilter" 
                  @change="selectedDateQuickFilter = 'custom'"
                  class="p-1 rounded-lg border border-slate-300 text-xs bg-white font-mono cursor-pointer"
                  title="Elegir fecha específica para ver la agenda"
                />
              </div>
              <span v-if="filteredCitas.length !== citas.length" class="text-[11px] font-semibold text-sky-800 ml-auto">
                Mostrando <strong>{{ filteredCitas.length }}</strong> de <strong>{{ citas.length }}</strong> citas
              </span>
            </div>
          </div>
        </div>

        <!-- 1. PESTAÑA: AGENDA DE CITAS -->
        <div v-if="activeTab === 'citas'" class="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
          <table class="w-full text-left text-xs border-collapse min-w-[720px]">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th class="p-3">Comprobante</th>
                <th class="p-3">Fecha y Hora</th>
                <th class="p-3">Paciente</th>
                <th class="p-3">Contacto</th>
                <th class="p-3">Servicio</th>
                <th class="p-3">Estado Clínico</th>
                <th class="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="c in filteredCitas" :key="c.id" class="hover:bg-slate-50/70 transition">
                <td class="p-3 font-mono font-bold text-sky-700">
                  {{ c.codigo || '#' + c.id }}
                </td>
                <td class="p-3 text-slate-700 whitespace-nowrap font-medium">{{ c.fecha_hora }}</td>
                <td class="p-3">
                  <strong class="text-slate-900 block text-xs">{{ c.paciente }}</strong>
                  <span class="text-[10px] text-slate-400 block font-mono">{{ c.correo || 'Sin correo' }}</span>
                </td>
                <td class="p-3 text-slate-600 font-mono text-[11px]">{{ c.telefono || 'Sin teléfono' }}</td>
                <td class="p-3 text-slate-700 max-w-[180px] truncate" :title="c.servicio">{{ c.servicio }}</td>
                <td class="p-3">
                  <!-- Selector de Estado con Transiciones Médicas -->
                  <select 
                    :value="(c.estado || 'pendiente').toLowerCase()" 
                    @change="changeStatus(c.id, $event.target.value)"
                    class="p-1.5 rounded-lg text-[11px] font-bold border cursor-pointer"
                    :class="{
                      'bg-amber-50 text-amber-900 border-amber-300': (c.estado || '').toLowerCase() === 'pendiente',
                      'bg-emerald-50 text-emerald-900 border-emerald-300': (c.estado || '').toLowerCase() === 'confirmada',
                      'bg-indigo-50 text-indigo-900 border-indigo-300': (c.estado || '').toLowerCase() === 'presente',
                      'bg-sky-50 text-sky-900 border-sky-300': (c.estado || '').toLowerCase() === 'completada',
                      'bg-rose-50 text-rose-900 border-rose-300': (c.estado || '').toLowerCase().includes('no_asistio'),
                      'bg-slate-100 text-slate-700 border-slate-300': (c.estado || '').toLowerCase().includes('cancelada')
                    }"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="presente">Llegó / En Espera</option>
                    <option value="completada">Completada</option>
                    <option value="no_asistio">No asistió</option>
                    <option value="cancelada_doctor">Cancelar por Doctor</option>
                  </select>
                </td>
                <td class="p-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <button 
                      type="button" 
                      @click="openClinicalNote(c)" 
                      class="px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      :class="c.notas_doctor ? 'bg-indigo-100 text-indigo-900 hover:bg-indigo-600 hover:text-white border border-indigo-200' : 'bg-slate-100 text-slate-700 hover:bg-sky-600 hover:text-white border border-slate-200'"
                      :title="c.notas_doctor ? 'Ver o editar notas médicas de esta cita' : 'Añadir notas clínicas y diagnóstico a esta cita'"
                    >
                      <svg class="w-3.5 h-3.5 stroke-current fill-none shrink-0" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>{{ c.notas_doctor ? 'Ficha Médica' : '+ Ficha' }}</span>
                      <span v-if="c.notas_doctor" class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    </button>
                    <a :href="getWhatsAppPatientLink(c)" target="_blank" class="px-2.5 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white rounded-lg font-bold text-[11px] transition flex items-center gap-1.5" title="Chatear por WhatsApp">
                      <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                    <button type="button" @click="deleteCita(c.id)" class="p-1 bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg font-bold text-xs transition cursor-pointer" title="Eliminar Cita">
                      <svg class="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filteredCitas.length">
                <td colspan="7" class="p-8 text-center text-slate-400 text-xs">
                  No se encontraron citas con los filtros seleccionados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. PESTAÑA: BLOQUEOS DE AGENDA Y DISPONIBILIDAD -->
        <div v-else-if="activeTab === 'bloqueos'" class="space-y-6">
          
          <!-- Encabezado de la Sección con selector de modo -->
          <div class="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 class="text-base font-extrabold text-amber-950 flex items-center gap-2">
                  <span class="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    📅
                  </span>
                  <span>Gestión de Días que Atiende el Dr. Lisandro Márquez</span>
                </h5>
                <p class="text-xs text-amber-900/80 mt-1">
                  Configure los días que atiende o marque días en los que <strong>NO podrá atender pacientes</strong>. Al bloquear una fecha, quedará bloqueada en el calendario de reserva.
                </p>
              </div>

              <!-- Selector de Modo de Disponibilidad y Bloqueo -->
              <div class="flex items-center gap-1.5 p-1 bg-amber-200/60 rounded-2xl shrink-0 self-start sm:self-center flex-wrap">
                <button
                  type="button"
                  @click="blockMode = 'semanal'"
                  class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer"
                  :class="blockMode === 'semanal' ? 'bg-amber-800 text-white shadow-xs' : 'text-amber-950 hover:bg-amber-300/60'"
                >
                  🗓️ Días Semanales por Sede
                </button>
                <button
                  type="button"
                  @click="blockMode = 'dia'"
                  class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer"
                  :class="blockMode === 'dia' ? 'bg-amber-800 text-white shadow-xs' : 'text-amber-950 hover:bg-amber-300/60'"
                >
                  🚫 Bloquear Día Específico
                </button>
                <button
                  type="button"
                  @click="blockMode = 'rango'"
                  class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer"
                  :class="blockMode === 'rango' ? 'bg-amber-800 text-white shadow-xs' : 'text-amber-950 hover:bg-amber-300/60'"
                >
                  ⏱️ Por Horas / Rango
                </button>
              </div>
            </div>

            <!-- MODO 0: DÍAS DE ATENCIÓN SEMANALES POR SEDE (HORARIOS Y DÍAS HÁBILES) -->
            <div v-if="blockMode === 'semanal'" class="bg-white/95 border border-amber-200 rounded-2xl p-4 sm:p-6 space-y-5">
              
              <!-- Selector de Sede a Configurar -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                <div>
                  <label class="block text-xs font-bold text-slate-800 mb-1">Sede Médica a Configurar:</label>
                  <p class="text-[11px] text-slate-500">Seleccione la clínica para definir en qué días atenderá consultas.</p>
                </div>
                <select 
                  v-model="selectedScheduleSedeId" 
                  @change="loadWeeklyScheduleForSede(selectedScheduleSedeId)"
                  class="p-2.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-amber-950 focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer min-w-[260px]"
                >
                  <option v-for="s in sedes" :key="s.id" :value="s.id">{{ s.nombre }}</option>
                </select>
              </div>

              <!-- Indicador de Carga -->
              <div v-if="loadingWeeklySchedule" class="py-8 text-center text-xs text-amber-800 animate-pulse font-semibold">
                Cargando configuración de horarios para esta sede...
              </div>

              <!-- Matriz de los 7 Días de la Semana -->
              <div v-else class="space-y-3">
                <div 
                  v-for="(cfg, diaKey) in horariosEdit" 
                  :key="diaKey"
                  class="p-3.5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                  :class="cfg.activo ? 'bg-emerald-50/50 border-emerald-200 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-80'"
                >
                  <!-- Nombre del Día y Switch Toggle -->
                  <div class="flex items-center gap-3 min-w-[180px]">
                    <div class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs" :class="cfg.activo ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'">
                      {{ cfg.dia.slice(0, 2) }}
                    </div>
                    <div>
                      <span class="text-xs font-extrabold text-slate-900 block">{{ cfg.dia }}</span>
                      <span class="text-[10px] font-semibold" :class="cfg.activo ? 'text-emerald-700' : 'text-slate-400'">
                        {{ cfg.activo ? '✓ Atiende consultas' : '✕ No atiende en esta sede' }}
                      </span>
                    </div>
                  </div>

                  <!-- Botón Switch Toggle -->
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="cfg.activo = !cfg.activo"
                      class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-2xs"
                      :class="cfg.activo ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
                    >
                      {{ cfg.activo ? 'Habilitado' : 'Deshabilitado' }}
                    </button>
                  </div>

                  <!-- Configuración de Horas si está Activo -->
                  <div v-if="cfg.activo" class="flex items-center gap-2 flex-wrap text-xs">
                    <div class="flex items-center gap-1">
                      <span class="text-[11px] text-slate-500 font-medium">De:</span>
                      <input 
                        type="time" 
                        v-model="cfg.hora_inicio" 
                        class="p-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs font-semibold focus:ring-1 focus:ring-emerald-500" 
                      />
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-[11px] text-slate-500 font-medium">Hasta:</span>
                      <input 
                        type="time" 
                        v-model="cfg.hora_fin" 
                        class="p-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs font-semibold focus:ring-1 focus:ring-emerald-500" 
                      />
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-[11px] text-slate-500 font-medium">Turnos de:</span>
                      <select 
                        v-model="cfg.intervalo" 
                        class="p-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                      >
                        <option :value="30">30 min</option>
                        <option :value="45">45 min</option>
                        <option :value="60">60 min</option>
                      </select>
                    </div>
                  </div>

                  <div v-else class="text-xs text-slate-400 italic">
                    Día bloqueado automáticamente para los pacientes en esta sede.
                  </div>
                </div>

                <!-- Botón de Guardar Horarios Semanales -->
                <div class="pt-3 flex justify-between items-center border-t border-slate-200 flex-wrap gap-2">
                  <span class="text-[11px] text-slate-500">
                    💡 Al guardar, los pacientes sólo podrán elegir los días habilitados para esta sede.
                  </span>
                  <button 
                    type="button" 
                    @click="handleSaveWeeklySchedule"
                    :disabled="savingWeeklySchedule"
                    class="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    <span>💾</span>
                    <span>{{ savingWeeklySchedule ? 'Guardando horarios...' : 'Guardar Días de Atención para esta Sede' }}</span>
                  </button>
                </div>
              </div>

            </div>

            <!-- MODO 1: BLOQUEAR DÍA COMPLETO (RÁPIDO Y DIRECTO) -->
            <div v-else-if="blockMode === 'dia'" class="bg-white/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                
                <!-- Selector de Fecha -->
                <div>
                  <label class="block font-bold text-slate-800 mb-1.5">
                    Fecha a bloquear (Día que NO atiende): *
                  </label>
                  <input 
                    type="date" 
                    v-model="singleDayDate" 
                    :min="minTodayDate"
                    class="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden shadow-2xs" 
                  />
                  <small class="text-[10px] text-slate-500 mt-1 block">
                    Seleccione el día en que no atenderá pacientes.
                  </small>
                </div>

                <!-- Motivo Predefinido -->
                <div>
                  <label class="block font-bold text-slate-800 mb-1.5">
                    Motivo de la no atención:
                  </label>
                  <select 
                    v-model="singleDayMotivoPreset" 
                    class="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden shadow-2xs"
                  >
                    <option value="No atiendo consultas en este día (Día No Laborable)">🚫 No atiendo en consultorio este día</option>
                    <option value="Procedimiento Quirúrgico / Quirófano">🏥 Día Quirúrgico / Cirugías</option>
                    <option value="Congreso Médico / Jornada Científica Urológica">🎓 Congreso Médico / Conferencia</option>
                    <option value="Día Libre / Descanso / Vacaciones Médicas">🏖️ Día Libre / Vacaciones</option>
                    <option value="Asuntos Personales y Administrativos">💼 Permiso o Asuntos Personales</option>
                    <option value="otro">✏️ Escribir otro motivo personalizado...</option>
                  </select>

                  <input 
                    v-if="singleDayMotivoPreset === 'otro'" 
                    type="text" 
                    v-model="singleDayCustomMotivo" 
                    placeholder="Escriba el motivo médico..."
                    class="w-full mt-2 p-2 rounded-xl border border-amber-300 bg-amber-50/50 text-xs focus:outline-hidden"
                  />
                </div>

                <!-- Sede -->
                <div>
                  <label class="block font-bold text-slate-800 mb-1.5">
                    Sede que aplica:
                  </label>
                  <select 
                    v-model="singleDaySedeId" 
                    class="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden shadow-2xs"
                  >
                    <option :value="null">Todas las sedes (Bloqueo Total)</option>
                    <option v-for="s in sedes" :key="s.id" :value="s.id">{{ s.nombre }}</option>
                  </select>
                  <small class="text-[10px] text-slate-500 mt-1 block">
                    Aplica a todas las sedes o a una en específico.
                  </small>
                </div>

              </div>

              <!-- Botón de Acción -->
              <div class="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                <span class="text-[11px] text-amber-900 font-medium">
                  Al confirmar, esta fecha quedará <strong>bloqueada inmediatamente</strong> para reservas de pacientes.
                </span>

                <button 
                  type="button" 
                  @click="handleCreateSingleDayBlock" 
                  :disabled="savingBlock || !singleDayDate" 
                  class="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-extrabold rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                  </svg>
                  <span>{{ savingBlock ? 'Bloqueando día...' : '🚫 Bloquear este Día para Pacientes' }}</span>
                </button>
              </div>
            </div>

            <!-- MODO 2: BLOQUEAR POR HORAS O RANGO -->
            <div v-else class="bg-white/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Fecha Inicio:</label>
                  <input type="date" v-model="newBlock.fecha_inicio" class="w-full p-2 rounded-xl border border-slate-300 bg-white" />
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Hora Inicio:</label>
                  <input type="time" v-model="newBlock.hora_inicio" class="w-full p-2 rounded-xl border border-slate-300 bg-white" />
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Fecha Fin:</label>
                  <input type="date" v-model="newBlock.fecha_fin" class="w-full p-2 rounded-xl border border-slate-300 bg-white" />
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Hora Fin:</label>
                  <input type="time" v-model="newBlock.hora_fin" class="w-full p-2 rounded-xl border border-slate-300 bg-white" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Motivo del Bloqueo:</label>
                  <input type="text" v-model="newBlock.motivo" placeholder="Ej: Cirugía Programada, Descanso" class="w-full p-2 rounded-xl border border-slate-300 bg-white" />
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Sede:</label>
                  <select v-model="newBlock.sede_id" class="w-full p-2 rounded-xl border border-slate-300 bg-white">
                    <option :value="null">Todas las sedes del Dr. Lisandro</option>
                    <option v-for="s in sedes" :key="s.id" :value="s.id">{{ s.nombre }}</option>
                  </select>
                </div>
              </div>

              <div class="flex justify-end pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  @click="handleCreateBlock" 
                  :disabled="savingBlock" 
                  class="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {{ savingBlock ? 'Guardando bloqueo...' : '+ Aplicar Bloqueo por Horas' }}
                </button>
              </div>
            </div>

          </div>

          <!-- Tabla / Lista de Días Bloqueados Activos -->
          <div class="border border-slate-200 rounded-3xl overflow-hidden shadow-2xs bg-white">
            <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-xs sm:text-sm text-slate-900">
                  Días y Horarios Bloqueados en el Calendario
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                  {{ bloqueos.length }} activos
                </span>
              </div>
              <button 
                type="button" 
                @click="loadBloqueos" 
                class="text-xs text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>↻ Actualizar</span>
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse min-w-[720px]">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th class="p-3.5"># ID</th>
                    <th class="p-3.5">Fecha o Período Bloqueado</th>
                    <th class="p-3.5">Tipo de Bloqueo</th>
                    <th class="p-3.5">Motivo Indicado</th>
                    <th class="p-3.5">Sede Médica</th>
                    <th class="p-3.5 text-right">Acción de Liberación</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="b in bloqueos" :key="b.id" class="hover:bg-slate-50/70 transition">
                    <td class="p-3.5 font-mono font-bold text-amber-900">#BLQ-{{ b.id }}</td>
                    
                    <td class="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      <span v-if="b.es_dia_completo" class="text-rose-700 font-mono text-sm">
                        📅 {{ b.fecha_dia || (b.fecha_inicio ? b.fecha_inicio.split(' ')[0] : '') }}
                      </span>
                      <span v-else class="font-mono text-slate-700 text-xs">
                        {{ b.fecha_inicio }} &rarr; {{ b.fecha_fin }}
                      </span>
                    </td>

                    <td class="p-3.5">
                      <span v-if="b.es_dia_completo" class="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                        🔴 DÍA COMPLETO BLOQUEADO
                      </span>
                      <span v-else class="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                        ⏱️ Franja de Horas
                      </span>
                    </td>

                    <td class="p-3.5 font-medium text-slate-800 max-w-[200px] truncate" :title="b.motivo">
                      {{ b.motivo }}
                    </td>

                    <td class="p-3.5 text-slate-600 font-medium">
                      {{ b.sede_nombre || 'Todas las sedes' }}
                    </td>

                    <td class="p-3.5 text-right whitespace-nowrap">
                      <button 
                        type="button" 
                        @click="deleteBloqueo(b.id)" 
                        class="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-300 rounded-xl font-bold text-xs transition cursor-pointer shadow-2xs"
                        title="Desbloquear este día y permitir que los pacientes agenden citas"
                      >
                        🟢 Habilitar Día / Desbloquear
                      </button>
                    </td>
                  </tr>

                  <tr v-if="!bloqueos.length">
                    <td colspan="6" class="p-10 text-center text-slate-400 text-xs">
                      No hay ningún día bloqueado. El Dr. Lisandro Márquez tiene disponibilidad abierta en todas sus fechas habituales.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- 3. PESTAÑA: DIRECTORIO DE PACIENTES -->
        <div v-else class="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
          <table class="w-full text-left text-xs border-collapse min-w-[720px]">
            <thead>
              <tr class="bg-purple-50/70 border-b border-purple-200 text-purple-950 font-bold">
                <th class="p-3"># ID</th>
                <th class="p-3">Paciente Registrado</th>
                <th class="p-3">Teléfono / WhatsApp</th>
                <th class="p-3 text-center">Citas Agendadas</th>
                <th class="p-3">Última Cita</th>
                <th class="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="p in filteredPacientes" :key="p.id" class="hover:bg-slate-50/70 transition">
                <td class="p-3 font-bold text-purple-900 font-mono text-xs whitespace-nowrap">
                  #{{ String(p.id).replace('leg_', '') }}
                  <span v-if="p.tipo === 'google'" class="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-sans font-bold">Google</span>
                  <span v-else class="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-sans font-medium">Web</span>
                </td>
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <img v-if="p.foto_url" :src="p.foto_url" alt="Avatar" class="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0" />
                    <div v-else class="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-black text-[10px] flex items-center justify-center shrink-0">
                      {{ (p.nombre || 'P')[0] }}
                    </div>
                    <div class="min-w-0">
                      <strong class="text-slate-900 block text-xs truncate">{{ p.nombre }}</strong>
                      <span class="text-[10px] text-slate-400 font-mono block truncate">{{ p.correo || 'Sin correo' }}</span>
                    </div>
                  </div>
                </td>
                <td class="p-3 text-slate-700 font-mono text-[11px] font-semibold whitespace-nowrap">{{ p.telefono || 'Sin teléfono' }}</td>
                <td class="p-3 text-center">
                  <button 
                    type="button"
                    @click="activeTab = 'citas'; searchQuery = p.nombre || p.correo || ''"
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-black border transition hover:scale-105 cursor-pointer inline-flex items-center gap-1"
                    :class="(p.total_citas > 0) ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'"
                    :title="p.total_citas > 0 ? 'Ver citas de este paciente en la agenda' : 'Sin citas agendadas'"
                  >
                    <span>{{ p.total_citas }}</span>
                    <span>{{ (p.total_citas === 1) ? 'cita' : 'citas' }}</span>
                  </button>
                </td>
                <td class="p-3 text-slate-600 whitespace-nowrap">
                  <span v-if="p.ultima_cita" class="block font-semibold text-slate-800 font-mono text-[11px]">{{ p.ultima_cita }}</span>
                  <span class="text-[10px] font-bold text-sky-700">
                    {{ p.estado_ultima_cita || 'Sin cita activa' }}
                  </span>
                </td>
                <td class="p-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <button 
                      type="button" 
                      @click="openPatientRecordModal(p)" 
                      class="px-2.5 py-1 bg-purple-100 hover:bg-purple-700 text-purple-900 hover:text-white rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 shadow-2xs border border-purple-200"
                      title="Ver expediente clínico integral y consultas de este paciente"
                    >
                      <svg class="w-3.5 h-3.5 fill-none stroke-current shrink-0" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span>Expediente</span>
                    </button>
                    <a 
                      :href="getWhatsAppPatientDirectLink(p)" 
                      target="_blank" 
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-lg font-bold text-[11px] transition shadow-2xs" 
                      title="Enviar mensaje por WhatsApp al paciente"
                    >
                      <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                    <button 
                      type="button" 
                      @click="deletePaciente(p.id)" 
                      class="px-2 py-1 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-2xs" 
                      title="Eliminar este paciente y su historial de la base de datos"
                    >
                      <svg class="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span class="text-[10px] font-semibold">Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filteredPacientes.length">
                <td colspan="6" class="p-8 text-center text-slate-400 text-xs">
                  No se encontraron pacientes que coincidan con la búsqueda.
                </td>
              </tr>
            </tbody>
          </table>
        </div>



      </div>

    </div>
  </div>

  <!-- MODAL 1: FICHA MÉDICA Y NOTAS CLÍNICAS PRIVADAS DEL DOCTOR -->
  <div v-if="showClinicalNoteModal && activeCitaForNote" class="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-6">
    <div class="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-8 shadow-2xl animate-pop-in space-y-4 sm:space-y-5 max-h-[94vh] overflow-y-auto border border-slate-100">
      
      <!-- Encabezado del Modal -->
      <div class="flex justify-between items-center border-b border-slate-200 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
            <svg class="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h4 class="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                Ficha Médica de Consulta #{{ activeCitaForNote.codigo || activeCitaForNote.id }}
              </h4>
              <span class="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full"
                :class="{
                  'bg-amber-100 text-amber-900': (activeCitaForNote.estado || '').toLowerCase() === 'pendiente',
                  'bg-emerald-100 text-emerald-900': (activeCitaForNote.estado || '').toLowerCase() === 'confirmada',
                  'bg-indigo-100 text-indigo-900': (activeCitaForNote.estado || '').toLowerCase() === 'presente',
                  'bg-sky-100 text-sky-900': (activeCitaForNote.estado || '').toLowerCase() === 'completada',
                  'bg-rose-100 text-rose-900': (activeCitaForNote.estado || '').toLowerCase().includes('no_asistio')
                }"
              >
                {{ activeCitaForNote.estado }}
              </span>
            </div>
            <p class="text-xs text-slate-500 font-medium mt-0.5">
              Registro clínico confidencial • Dr. Lisandro Márquez
            </p>
          </div>
        </div>
        <button 
          type="button" 
          @click="showClinicalNoteModal = false" 
          class="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-2xl transition cursor-pointer"
          title="Cerrar Ficha"
        >
          &times;
        </button>
      </div>

      <!-- Resumen del Paciente y Cita -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-1.5">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Datos del Paciente</span>
          <strong class="text-sm sm:text-base text-slate-900 block font-black">{{ activeCitaForNote.paciente }}</strong>
          <span class="text-slate-600 block font-mono text-xs">{{ activeCitaForNote.correo || 'Sin correo registrado' }}</span>
          <div class="flex items-center gap-2 pt-1.5">
            <span class="font-mono text-slate-700 font-bold text-xs">{{ activeCitaForNote.telefono || 'Sin teléfono' }}</span>
            <a 
              v-if="activeCitaForNote.telefono" 
              :href="getWhatsAppPatientLink(activeCitaForNote)" 
              target="_blank" 
              class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold hover:bg-emerald-600 hover:text-white transition flex items-center gap-1"
            >
              <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-1.5">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detalles de la Consulta</span>
          <strong class="text-sm text-sky-950 block font-extrabold">{{ activeCitaForNote.servicio }}</strong>
          <div class="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ activeCitaForNote.sede }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-slate-700 text-xs font-mono font-bold">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ activeCitaForNote.fecha_hora }}</span>
          </div>
        </div>
      </div>

      <!-- Motivo o Síntomas reportados por el paciente -->
      <div class="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-1.5">
        <span class="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
          <svg class="w-4 h-4 text-amber-700 stroke-current fill-none shrink-0" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Motivo de Consulta o Síntomas Reportados por el Paciente:</span>
        </span>
        <p class="text-amber-900 font-medium italic text-xs sm:text-sm pl-5.5 leading-relaxed">
          "{{ activeCitaForNote.sintomas || 'El paciente no ingresó síntomas previos al agendar.' }}"
        </p>
      </div>

      <!-- Área de Notas Médicas y Diagnóstico del Doctor -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-600 stroke-current fill-none shrink-0" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Notas Clínicas, Diagnóstico y Conducta Médica (Uso Privado):</span>
          </label>
          <span class="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold border border-indigo-100">
            Confidencial • Solo para el Doctor
          </span>
        </div>
        <textarea
          v-model="doctorNoteEdit"
          rows="7"
          placeholder="Escriba aquí los hallazgos del examen físico, ecografía (renal, vesical, prostática), diagnóstico clínico, tratamiento prescrito o conducta para el paciente..."
          class="w-full p-4 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white shadow-2xs font-sans leading-relaxed"
        ></textarea>
        <span class="text-[11px] text-slate-500 block">
          Estas notas quedan archivadas de manera confidencial en el expediente del paciente y solo son visibles para usted.
        </span>
      </div>

      <!-- Cambio de Estado Rápido -->
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between flex-wrap gap-2.5 text-xs">
        <span class="font-bold text-slate-700">Cambiar estado de la consulta:</span>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="st in [
              { id: 'confirmada', label: 'Confirmada', color: 'bg-emerald-600 hover:bg-emerald-700' },
              { id: 'presente', label: 'En Espera / Llegó', color: 'bg-indigo-600 hover:bg-indigo-700' },
              { id: 'completada', label: 'Completada', color: 'bg-sky-600 hover:bg-sky-700' },
              { id: 'no_asistio', label: 'Inasistencia', color: 'bg-rose-600 hover:bg-rose-700' }
            ]"
            :key="st.id"
            type="button"
            @click="changeStatus(activeCitaForNote.id, st.id); activeCitaForNote.estado = st.id"
            class="px-3 py-1.5 rounded-xl text-white text-xs font-bold cursor-pointer transition shadow-2xs"
            :class="[st.color, (activeCitaForNote.estado || '').toLowerCase() === st.id ? 'ring-2 ring-slate-900 scale-105' : 'opacity-85 hover:opacity-100']"
          >
            {{ st.label }}
          </button>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
        <button
          type="button"
          @click="showClinicalNoteModal = false"
          class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
        >
          Cerrar
        </button>
        <button
          type="button"
          @click="saveClinicalNote"
          :disabled="savingClinicalNote"
          class="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold rounded-xl text-xs transition shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          <svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ savingClinicalNote ? 'Guardando notas...' : 'Guardar Notas Médicas' }}</span>
        </button>
      </div>

    </div>
  </div>

  <!-- MODAL 2: EXPEDIENTE INTEGRAL DEL PACIENTE -->
  <div v-if="showPatientRecordModal" class="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-6">
    <div class="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-8 shadow-2xl animate-pop-in space-y-4 sm:space-y-5 max-h-[94vh] overflow-y-auto border border-slate-100">
      
      <!-- Encabezado del Modal -->
      <div class="flex justify-between items-center border-b border-slate-200 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
            <svg class="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <h4 class="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
              Expediente Clínico del Paciente
            </h4>
            <p class="text-xs text-slate-500 font-medium mt-0.5">
              Historial médico longitudinal y registro de consultas • Dr. Lisandro Márquez
            </p>
          </div>
        </div>
        <button 
          type="button" 
          @click="showPatientRecordModal = false" 
          class="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-2xl transition cursor-pointer"
          title="Cerrar Expediente"
        >
          &times;
        </button>
      </div>

      <!-- Estado de Carga -->
      <div v-if="loadingPatientRecord" class="py-12 text-center text-xs text-purple-700 animate-pulse font-semibold">
        Cargando expediente e historial del paciente...
      </div>

      <div v-else-if="patientRecordData" class="space-y-4">
        
        <!-- Tarjeta de Identidad del Paciente -->
        <div class="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <img 
              v-if="patientRecordData.paciente.foto_url" 
              :src="patientRecordData.paciente.foto_url" 
              alt="Avatar" 
              class="w-12 h-12 rounded-full object-cover border-2 border-purple-300 shadow-xs" 
            />
            <div v-else class="w-12 h-12 rounded-full bg-purple-600 text-white font-extrabold text-base flex items-center justify-center shadow-xs">
              {{ (patientRecordData.paciente.nombre || 'P')[0] }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h5 class="text-sm sm:text-base font-black text-slate-900">{{ patientRecordData.paciente.nombre }}</h5>
                <span v-if="patientRecordData.paciente.tipo === 'google'" class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-800">Google ID</span>
                <span v-else class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-200 text-slate-700">Web</span>
              </div>
              <span class="text-xs text-slate-600 font-mono block">{{ patientRecordData.paciente.correo || 'Sin correo' }}</span>
              <span class="text-xs text-purple-900 font-mono font-bold block">{{ patientRecordData.paciente.telefono || 'Sin teléfono' }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <a 
              v-if="patientRecordData.paciente.telefono" 
              :href="getWhatsAppPatientDirectLink(patientRecordData.paciente)" 
              target="_blank" 
              class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <!-- KPIs de Asistencia Médica -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span class="text-xl font-extrabold text-slate-900 block">{{ patientRecordData.estadisticas.total }}</span>
            <span class="text-[10px] font-bold text-slate-500 uppercase">Total Citas</span>
          </div>
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span class="text-xl font-extrabold text-emerald-800 block">{{ patientRecordData.estadisticas.completadas }}</span>
            <span class="text-[10px] font-bold text-emerald-600 uppercase">Atendidas</span>
          </div>
          <div class="p-3 bg-sky-50 border border-sky-200 rounded-xl">
            <span class="text-xl font-extrabold text-sky-800 block">{{ patientRecordData.estadisticas.confirmadas + patientRecordData.estadisticas.pendientes }}</span>
            <span class="text-[10px] font-bold text-sky-600 uppercase">Activas</span>
          </div>
          <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl">
            <span class="text-xl font-extrabold text-rose-800 block">{{ patientRecordData.estadisticas.inasistencias }}</span>
            <span class="text-[10px] font-bold text-rose-600 uppercase">Inasistencias</span>
          </div>
        </div>

        <!-- Historial Cronológico de Consultas -->
        <div class="space-y-2.5">
          <h6 class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>🗓️</span>
            <span>Historial de Consultas Médicas ({{ patientRecordData.historial.length }})</span>
          </h6>

          <div v-if="!patientRecordData.historial.length" class="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
            Este paciente aún no registra consultas médicas completadas.
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="h in patientRecordData.historial" 
              :key="h.id"
              class="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 hover:shadow-xs transition"
            >
              <div class="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <strong class="text-xs sm:text-sm text-slate-900 block font-bold">{{ h.servicio }}</strong>
                  <span class="text-[11px] text-slate-500 block font-medium">📍 {{ h.sede }}</span>
                  <span class="text-[11px] text-slate-700 block font-mono font-bold">🗓️ {{ h.fecha_hora }}</span>
                </div>
                <span 
                  class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase"
                  :class="{
                    'bg-amber-100 text-amber-900': (h.estado || '').toLowerCase() === 'pendiente',
                    'bg-emerald-100 text-emerald-900': (h.estado || '').toLowerCase() === 'confirmada',
                    'bg-indigo-100 text-indigo-900': (h.estado || '').toLowerCase() === 'presente',
                    'bg-sky-100 text-sky-900': (h.estado || '').toLowerCase() === 'completada',
                    'bg-rose-100 text-rose-900': (h.estado || '').toLowerCase().includes('no_asistio')
                  }"
                >
                  {{ h.estado }}
                </span>
              </div>

              <!-- Síntomas -->
              <div v-if="h.sintomas" class="text-xs bg-slate-50 p-2.5 rounded-xl text-slate-700">
                <span class="font-bold text-slate-800">Motivo reportado:</span> {{ h.sintomas }}
              </div>

              <!-- Notas Médicas Registradas -->
              <div class="text-xs p-3 rounded-xl border" :class="h.notas_doctor ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950' : 'bg-slate-50 border-slate-200 text-slate-500 italic'">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold text-[11px] flex items-center gap-1" :class="h.notas_doctor ? 'text-indigo-900' : 'text-slate-500'">
                    <span>🩺</span>
                    <span>Notas Médicas del Dr. Lisandro Márquez:</span>
                  </span>
                  <button 
                    type="button" 
                    @click="showPatientRecordModal = false; openClinicalNote(h)" 
                    class="text-[10px] text-indigo-700 hover:text-indigo-950 font-bold underline cursor-pointer"
                  >
                    {{ h.notas_doctor ? 'Editar Notas' : '+ Agregar Nota' }}
                  </button>
                </div>
                <p class="font-sans leading-relaxed whitespace-pre-wrap">
                  {{ h.notas_doctor || 'Sin notas registradas para esta consulta.' }}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Pie del Modal -->
      <div class="flex justify-end pt-2 border-t border-slate-200">
        <button
          type="button"
          @click="showPatientRecordModal = false"
          class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
        >
          Cerrar Expediente
        </button>
      </div>

    </div>
  </div>
</template>
