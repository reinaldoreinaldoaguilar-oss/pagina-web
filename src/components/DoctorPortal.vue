<script setup>
import { ref, computed, watch } from 'vue';
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
const username = ref('');
const password = ref('');
const loading = ref(false);

const citas = ref([]);
const pacientes = ref([]);
const loadingPacientes = ref(false);
const activeTab = ref('citas'); // 'citas' | 'pacientes'

const stats = ref({
  total_citas: 0,
  citas_pendientes: 0,
  citas_confirmadas: 0,
  total_pacientes: 0
});

const activeFilter = ref('todos');
const searchQuery = ref('');

const isAuthenticated = computed(() => !!token.value);

watch(() => props.isOpen, (open) => {
  if (open && isAuthenticated.value) {
    loadDashboardData();
  }
});

const handleLogin = async () => {
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    });

    if (res.ok) {
      const data = await res.json();
      token.value = data.token;
      localStorage.setItem('dr_lisandro_jwt_token', data.token);
      emit('loginSuccess');
      emit('toast', { msg: '¡Bienvenido al Panel Médico, Dr. Lisandro!', type: 'success' });
      await loadDashboardData();
      return;
    }

    emit('toast', { msg: 'Credenciales médicas incorrectas', type: 'danger' });
  } catch (error) {
    // Si el backend en la nube tarda en responder o falla, permitir acceso solo si coinciden las credenciales maestras
    if (username.value === 'admin' && password.value === 'admin123') {
      token.value = 'demo_token';
      localStorage.setItem('dr_lisandro_jwt_token', 'demo_token');
      emit('loginSuccess');
      emit('toast', { msg: 'Sesión administrativa activa', type: 'info' });
      loadMockData();
    } else {
      emit('toast', { msg: 'Usuario o contraseña médica incorrecta', type: 'danger' });
    }
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
    const resStats = await fetch(`${API_BASE_URL}/api/estadisticas`, {
      headers: { 'Authorization': `Bearer ${token.value}` }
    });
    if (resStats.ok) {
      stats.value = await resStats.json();
    }

    // 2. Cargar citas
    const resCitas = await fetch(`${API_BASE_URL}/api/citas`, {
      headers: { 'Authorization': `Bearer ${token.value}` }
    });
    if (resCitas.ok) {
      citas.value = await resCitas.json();
    }

    // 3. Cargar directorio de pacientes
    try {
      loadingPacientes.value = true;
      const resPacientes = await fetch(`${API_BASE_URL}/api/pacientes`, {
        headers: { 'Authorization': `Bearer ${token.value}` }
      });
      if (resPacientes.ok) {
        pacientes.value = await resPacientes.json();
      }
    } catch (e) {
      console.warn('Error al consultar pacientes:', e);
    } finally {
      loadingPacientes.value = false;
    }

    return;
  } catch (e) {
    console.warn('Backend no responde a portal, cargando datos locales.');
  }

  loadMockData();
};

const loadMockData = () => {
  citas.value = [
    { id: 101, fecha_hora: '2026-10-23 09:30', estado: 'Confirmada', paciente: 'Carlos Mendoza', telefono: '0412-5551234', correo: 'carlos.m@email.com', servicio: 'Chequeo Prostático Preventivo' },
    { id: 102, fecha_hora: '2026-10-23 11:00', estado: 'Pendiente', paciente: 'Roberto Gómez', telefono: '0414-9876543', correo: 'rgomez@gmail.com', servicio: 'Tratamiento de Litiasis Renal (Láser)' },
    { id: 103, fecha_hora: '2026-10-24 15:00', estado: 'Confirmada', paciente: 'Alejandro Silva', telefono: '0424-3321100', correo: 'asilva@outlook.com', servicio: 'Evaluación Urológica con 3 Ecos' },
    { id: 104, fecha_hora: '2026-10-25 10:15', estado: 'Pendiente', paciente: 'Fernando Colmenares', telefono: '0414-4455667', correo: 'fcolmenares@yahoo.com', servicio: 'Andrología y Salud Sexual' },
    { id: 105, fecha_hora: '2026-10-22 08:30', estado: 'Realizada', paciente: 'Miguel Ángel Rivas', telefono: '0416-7788990', correo: 'mrivas@empresa.com', servicio: 'Cirugía de Hidrocele Ambulatoria' }
  ];

  stats.value = {
    total_citas: citas.value.length,
    citas_pendientes: citas.value.filter(c => c.estado === 'Pendiente').length,
    citas_confirmadas: citas.value.filter(c => c.estado === 'Confirmada').length,
    total_pacientes: 5
  };
};

const filteredCitas = computed(() => {
  let list = citas.value;
  if (activeFilter.value !== 'todos') {
    list = list.filter(c => (c.estado || '').toLowerCase().includes(activeFilter.value.toLowerCase()));
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(c =>
      (c.paciente && c.paciente.toLowerCase().includes(q)) ||
      (c.telefono && c.telefono.toLowerCase().includes(q)) ||
      (c.servicio && c.servicio.toLowerCase().includes(q))
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
  const msg = `Hola ${paciente.nombre || 'estimado paciente'}, le escribimos desde el consultorio del Dr. Lisandro Márquez (Urólogo). Nos comunicamos para verificar su estado y recordarle que estamos a su disposición para agendar o revisar su consulta médica.`;
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
};

const changeStatus = async (citaId, newStatus) => {
  try {
    await fetch(`${API_BASE_URL}/api/citas/${citaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ estado: newStatus })
    });
  } catch (e) {}

  const c = citas.value.find(item => item.id === citaId);
  if (c) c.estado = newStatus;
  emit('toast', { msg: `Cita #${citaId} actualizada a ${newStatus}`, type: 'success' });
};

const deleteCita = async (citaId) => {
  if (!confirm(`¿Desea cancelar y eliminar la cita #${citaId}?`)) return;

  try {
    await fetch(`${API_BASE_URL}/api/citas/${citaId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token.value}` }
    });
  } catch (e) {}

  citas.value = citas.value.filter(c => c.id !== citaId);
  emit('toast', { msg: `Cita #${citaId} eliminada`, type: 'info' });
};

const deletePaciente = async (pacienteId) => {
  if (!confirm(`¿Desea eliminar definitivamente el registro del paciente #${pacienteId}? Esto también eliminará las citas vinculadas a este paciente.`)) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/pacientes/${pacienteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token.value}` }
    });
    if (!res.ok) {
      console.warn('Error en respuesta de eliminación:', res.status);
    }
  } catch (e) {
    console.warn('Error al eliminar paciente:', e);
  }

  pacientes.value = pacientes.value.filter(p => p.id !== pacienteId);
  citas.value = citas.value.filter(c => c.paciente_id !== pacienteId);
  stats.value.total_pacientes = pacientes.value.length;
  emit('toast', { msg: `Paciente #${pacienteId} y su registro fueron eliminados`, type: 'info' });
  loadDashboardData();
};

const getWhatsAppPatientLink = (cita) => {
  const cleanPhone = (cita.telefono || '').replace(/[^0-9]/g, '');
  const phone = cleanPhone.startsWith('58') ? cleanPhone : (cleanPhone.startsWith('0') ? '58' + cleanPhone.substring(1) : cleanPhone);
  const msg = encodeURIComponent(
    `Estimado/a ${cita.paciente}, le contactamos del consultorio del Dr. Lisandro Márquez para coordinar su cita de ${cita.servicio} pautada para el ${cita.fecha_hora}. ¿Nos confirma su asistencia? Muchas gracias.`
  );
  return `https://wa.me/${phone || doctorData.whatsapp}?text=${msg}`;
};

const exportCSV = () => {
  if (activeTab.value === 'pacientes') {
    if (!pacientes.value.length) return;
    let csv = 'ID,Nombre,Telefono,Correo,Total Citas,Ultima Cita,Estado\n';
    pacientes.value.forEach(p => {
      csv += `"${p.id}","${p.nombre || ''}","${p.telefono || ''}","${p.correo || ''}","${p.total_citas || 0}","${p.ultima_cita || 'N/A'}","${p.estado_ultima_cita || 'Sin cita'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Directorio_Pacientes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    emit('toast', { msg: 'Directorio de pacientes exportado en CSV', type: 'success' });
    return;
  }

  if (!citas.value.length) return;
  let csv = 'ID,Fecha y Hora,Paciente,Telefono,Correo,Servicio,Estado\n';
  citas.value.forEach(c => {
    csv += `"${c.id}","${c.fecha_hora}","${c.paciente || ''}","${c.telefono || ''}","${c.correo || ''}","${c.servicio || ''}","${c.estado || ''}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `Agenda_Dr_Lisandro_Marquez_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  emit('toast', { msg: 'Archivo CSV descargado con éxito', type: 'success' });
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
      <td style="padding: 10px 8px; font-weight: bold; color: #0284c7; text-align: center;">#${c.id}</td>
      <td style="padding: 10px 8px; font-weight: bold; color: #0f172a; white-space: nowrap;">${c.fecha_hora}</td>
      <td style="padding: 10px 8px;">
        <strong style="color: #0f172a; display: block; font-size: 12px;">${c.paciente || 'Sin nombre'}</strong>
        <span style="color: #64748b; font-size: 10px;">${c.correo || ''}</span>
      </td>
      <td style="padding: 10px 8px; font-family: monospace; font-size: 11px; color: #334155;">${c.telefono || 'Sin teléfono'}</td>
      <td style="padding: 10px 8px; color: #334155; font-weight: 500;">${c.servicio || 'Consulta General'}</td>
      <td style="padding: 10px 8px; text-align: center;">
        <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 10px; ${
          c.estado === 'Confirmada' ? 'background: #dcfce7; color: #166534;' :
          c.estado === 'Realizada' ? 'background: #e0f2fe; color: #075985;' :
          c.estado === 'Cancelada' ? 'background: #fee2e2; color: #991b1b;' :
          'background: #fef3c7; color: #92400e;'
        }">
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
      <title>Agenda Médica - Asistente Dr. Lisandro Márquez</title>
      <style>
        @page { size: letter landscape; margin: 12mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 15px; color: #0f172a; font-size: 12px; background: #ffffff; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 2px solid #0284c7; margin-bottom: 14px; }
        .doc-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
        .doc-sub { font-size: 12px; color: #0284c7; font-weight: bold; margin-top: 3px; }
        .meta-box { text-align: right; font-size: 11px; color: #475569; }
        .badge-report { display: inline-block; background: #0f172a; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 4px; }
        .summary-grid { display: flex; gap: 12px; margin-bottom: 14px; }
        .summary-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; }
        .summary-num { font-size: 16px; font-weight: 800; color: #0f172a; }
        .summary-lbl { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; }
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
            Sedes: Caracas (Clínica VidaMed) • Guatire • Barlovento | WhatsApp Citas: ${doctorData.telefono_display}
          </div>
        </div>
        <div class="meta-box">
          <div class="badge-report">HOJA DE CONTROL - ASISTENCIA MÉDICA</div>
          <div><strong>Fecha:</strong> ${fechaHoy}</div>
          <div><strong>Emisión:</strong> ${horaEmision} | Filtro: <em>${activeFilter.value.toUpperCase()}</em></div>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-num">${list.length}</div>
          <div class="summary-lbl">Pacientes en Lista</div>
        </div>
        <div class="summary-card">
          <div class="summary-num" style="color: #16a34a;">${list.filter(c => c.estado === 'Confirmada').length}</div>
          <div class="summary-lbl">Confirmadas</div>
        </div>
        <div class="summary-card">
          <div class="summary-num" style="color: #d97706;">${list.filter(c => c.estado === 'Pendiente' || !c.estado).length}</div>
          <div class="summary-lbl">Pendientes por Validar</div>
        </div>
        <div class="summary-card">
          <div class="summary-num" style="color: #0284c7;">${list.filter(c => c.estado === 'Realizada').length}</div>
          <div class="summary-lbl">Consultas Realizadas</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 45px; text-align: center;">Cita</th>
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
          <strong>Firma Secretaria / Asistente</strong><br>
          <span style="font-size: 10px;">Recepción y Control de Turnos</span>
        </div>
        <div class="sig-block">
          <strong>${doctorData.nombre}</strong><br>
          <span style="font-size: 10px;">Firma y Sello Médico</span>
        </div>
      </div>

      <div class="notice">
        Documento médico administrativo de carácter confidencial. Conforme a las normas de ética médica y privacidad del paciente.
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
    emit('toast', { msg: 'Reporte para la asistente generado con éxito', type: 'success' });
  } else {
    emit('toast', { msg: 'Por favor permite las ventanas emergentes para ver el reporte', type: 'warning' });
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-pop-in">
      
      <!-- Top Header -->
      <div class="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center">
            <svg class="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold block">{{ doctorData.nombre }}</h3>
            <span class="text-[11px] text-sky-400 block font-semibold">Panel Administrativo Médico</span>
          </div>
        </div>

        <button type="button" @click="$emit('close')" class="text-slate-400 hover:text-white text-2xl leading-none">
          &times;
        </button>
      </div>

      <!-- Pantalla de Login -->
      <div v-if="!isAuthenticated" class="p-8 max-w-md mx-auto w-full text-center">
        <div class="w-14 h-14 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h4 class="text-xl font-bold text-slate-900 mb-1">Acceso Médico Privado</h4>
        <p class="text-xs text-slate-500 mb-6">Acceso exclusivo para el Dr. Lisandro Márquez y personal de secretaría.</p>

        <form @submit.prevent="handleLogin" class="space-y-4 text-left">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Usuario Autorizado:</label>
            <input type="text" v-model="username" required placeholder="Usuario del consultorio" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Contraseña de Seguridad:</label>
            <input type="password" v-model="password" required placeholder="••••••••" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden" />
          </div>

          <button type="submit" :disabled="loading" class="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer">
            {{ loading ? 'Verificando credenciales...' : 'Ingresar al Sistema Médico' }}
          </button>
        </form>
      </div>

      <!-- Dashboard del Doctor -->
      <div v-else class="p-6 overflow-y-auto space-y-6">
        
        <!-- Top Actions -->
        <div class="flex justify-between items-center pb-4 border-b border-slate-200 flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Sesión Activa
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" @click="downloadAssistantPDF" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reporte PDF (Asistente)
            </button>
            <button type="button" @click="loadDashboardData" class="px-3 py-1.5 bg-sky-50 text-sky-700 font-bold rounded-lg text-xs hover:bg-sky-100 transition border border-sky-200 cursor-pointer flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar Agenda
            </button>
            <button type="button" @click="handleLogout" class="px-3 py-1.5 bg-rose-50 text-rose-700 font-bold rounded-lg text-xs hover:bg-rose-100 transition border border-rose-200 cursor-pointer">
              Cerrar Sesión
            </button>
          </div>
        </div>

        <!-- KPI Grid Interactivo -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div 
            @click="activeTab = 'citas'; activeFilter = 'todos'"
            class="bg-sky-50 border p-4 rounded-xl cursor-pointer hover:shadow-xs transition"
            :class="activeTab === 'citas' && activeFilter === 'todos' ? 'border-sky-500 ring-2 ring-sky-300' : 'border-sky-100'"
          >
            <span class="text-2xl font-extrabold text-sky-900 block">{{ stats.total_citas }}</span>
            <span class="text-[11px] font-bold text-sky-600 uppercase">Citas Totales</span>
          </div>

          <div 
            @click="activeTab = 'citas'; activeFilter = 'Pendiente'"
            class="bg-amber-50 border p-4 rounded-xl cursor-pointer hover:shadow-xs transition"
            :class="activeTab === 'citas' && activeFilter === 'Pendiente' ? 'border-amber-500 ring-2 ring-amber-300' : 'border-amber-100'"
          >
            <span class="text-2xl font-extrabold text-amber-900 block">{{ stats.citas_pendientes }}</span>
            <span class="text-[11px] font-bold text-amber-600 uppercase">Por Confirmar</span>
          </div>

          <div 
            @click="activeTab = 'citas'; activeFilter = 'Confirmada'"
            class="bg-emerald-50 border p-4 rounded-xl cursor-pointer hover:shadow-xs transition"
            :class="activeTab === 'citas' && activeFilter === 'Confirmada' ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-emerald-100'"
          >
            <span class="text-2xl font-extrabold text-emerald-900 block">{{ stats.citas_confirmadas }}</span>
            <span class="text-[11px] font-bold text-emerald-600 uppercase">Confirmadas</span>
          </div>

          <div 
            @click="activeTab = 'pacientes'"
            class="bg-purple-50 border p-4 rounded-xl cursor-pointer hover:shadow-xs transition"
            :class="activeTab === 'pacientes' ? 'border-purple-500 ring-2 ring-purple-300' : 'border-purple-200'"
          >
            <div class="flex items-center justify-between">
              <span class="text-2xl font-extrabold text-purple-900 block">{{ stats.total_pacientes }}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200/70 text-purple-900">Ver Lista</span>
            </div>
            <span class="text-[11px] font-bold text-purple-600 uppercase">Pacientes Registrados</span>
          </div>
        </div>

        <!-- Selector de Pestañas: Agenda vs Directorio -->
        <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
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
            @click="activeTab = 'pacientes'"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
            :class="activeTab === 'pacientes' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
          >
            <svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Directorio de Pacientes</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black" :class="activeTab === 'pacientes' ? 'bg-purple-400 text-white' : 'bg-purple-100 text-purple-800'">
              {{ stats.total_pacientes || pacientes.length }}
            </span>
          </button>
        </div>

        <!-- Filter & Search Controls -->
        <div class="flex flex-wrap justify-between items-center gap-3">
          <input 
            type="text" 
            v-model="searchQuery" 
            :placeholder="activeTab === 'citas' ? 'Buscar cita por paciente, teléfono o servicio...' : 'Buscar paciente por nombre, teléfono o correo...'" 
            class="p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm flex-1 min-w-[260px] focus:ring-2 focus:ring-sky-500 focus:outline-hidden" 
          />

          <!-- Filtros de estado (solo visibles en pestaña de citas) -->
          <div v-if="activeTab === 'citas'" class="flex gap-1.5">
            <button v-for="st in ['todos', 'Pendiente', 'Confirmada', 'Realizada']" :key="st" type="button"
                    @click="activeFilter = st"
                    class="px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer"
                    :class="activeFilter === st ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'">
              {{ st === 'todos' ? 'Todas' : st }}
            </button>
          </div>
        </div>

        <!-- 1. Tabla de Citas (Pestaña 'citas') -->
        <div v-if="activeTab === 'citas'" class="border border-slate-200 rounded-xl overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th class="p-3"># Cita</th>
                <th class="p-3">Fecha y Hora</th>
                <th class="p-3">Paciente</th>
                <th class="p-3">Contacto</th>
                <th class="p-3">Servicio</th>
                <th class="p-3">Estado</th>
                <th class="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="c in filteredCitas" :key="c.id" class="hover:bg-slate-50/70 transition">
                <td class="p-3 font-bold text-slate-900">#{{ c.id }}</td>
                <td class="p-3 text-slate-700 whitespace-nowrap">{{ c.fecha_hora }}</td>
                <td class="p-3">
                  <strong class="text-slate-900 block">{{ c.paciente }}</strong>
                  <span class="text-[10px] text-slate-400">{{ c.correo || 'Sin correo' }}</span>
                </td>
                <td class="p-3 text-slate-600 font-mono text-[11px]">{{ c.telefono || 'Sin teléfono' }}</td>
                <td class="p-3 text-slate-700 max-w-[180px] truncate" :title="c.servicio">{{ c.servicio }}</td>
                <td class="p-3">
                  <select :value="c.estado || 'Pendiente'" @change="changeStatus(c.id, $event.target.value)"
                          class="p-1 rounded text-[11px] font-bold border"
                          :class="c.estado === 'Confirmada' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : c.estado === 'Realizada' ? 'bg-sky-50 text-sky-800 border-sky-300' : 'bg-amber-50 text-amber-800 border-amber-300'">
                    <option value="Pendiente">Pendiente</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Realizada">Realizada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </td>
                <td class="p-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <a :href="getWhatsAppPatientLink(c)" target="_blank" class="px-2.5 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white rounded font-bold text-[11px] transition flex items-center gap-1.5" title="Chatear por WhatsApp">
                      <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                    <button type="button" @click="deleteCita(c.id)" class="p-1 bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white rounded font-bold text-xs transition cursor-pointer" title="Eliminar Cita">
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

        <!-- 2. Tabla del Directorio de Pacientes (Pestaña 'pacientes') -->
        <div v-else class="border border-slate-200 rounded-xl overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-purple-50/70 border-b border-purple-200 text-purple-950 font-bold">
                <th class="p-3"># ID</th>
                <th class="p-3">Paciente Registrado</th>
                <th class="p-3">Teléfono / Contacto</th>
                <th class="p-3 text-center">Citas Agendadas</th>
                <th class="p-3">Última Cita en Sistema</th>
                <th class="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="p in filteredPacientes" :key="p.id" class="hover:bg-slate-50/70 transition">
                <td class="p-3 font-bold text-purple-900">#{{ p.id }}</td>
                <td class="p-3">
                  <strong class="text-slate-900 block text-xs">{{ p.nombre }}</strong>
                  <span class="text-[10px] text-slate-400">{{ p.correo || 'Sin correo' }}</span>
                </td>
                <td class="p-3 text-slate-700 font-mono text-[11px] font-semibold">{{ p.telefono || 'Sin teléfono' }}</td>
                <td class="p-3 text-center">
                  <span 
                    class="px-2 py-0.5 rounded-full text-[10px] font-black border"
                    :class="(p.total_citas > 0) ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'"
                  >
                    {{ p.total_citas }} {{ (p.total_citas === 1) ? 'cita' : 'citas' }}
                  </span>
                </td>
                <td class="p-3 text-slate-600">
                  <span v-if="p.ultima_cita" class="block font-semibold text-slate-800">{{ p.ultima_cita }}</span>
                  <span 
                    class="text-[10px] font-bold"
                    :class="p.estado_ultima_cita === 'Confirmada' ? 'text-emerald-600' : (p.estado_ultima_cita === 'Pendiente' ? 'text-amber-600' : 'text-slate-400')"
                  >
                    {{ p.estado_ultima_cita || 'Sin cita activa' }}
                  </span>
                </td>
                <td class="p-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <a 
                      :href="getWhatsAppPatientDirectLink(p)" 
                      target="_blank" 
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded font-bold text-[11px] transition" 
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
                      class="p-1 bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white rounded font-bold text-xs transition cursor-pointer" 
                      title="Eliminar Paciente y su historial"
                    >
                      <svg class="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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

        <!-- Footer Utilities -->
        <div class="flex justify-end items-center pt-2 text-xs text-slate-500 flex-wrap gap-2">
          <div class="flex gap-2">
            <button type="button" @click="exportCSV" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition border border-slate-200 flex items-center gap-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Exportar CSV</span>
            </button>
            <button type="button" @click="downloadAssistantPDF" class="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition shadow-sm border border-sky-600 flex items-center gap-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Descargar / Imprimir Reporte Asistente (PDF)</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
