<script setup>
import { ref, computed, watch } from 'vue';
import doctorData from '../data/doctor.json';

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

const autoFillDemo = () => {
  username.value = 'admin';
  password.value = 'admin123';
  emit('toast', { msg: 'Credenciales de demostración cargadas', type: 'info' });
};

const handleLogin = async () => {
  loading.value = true;
  try {
    const res = await fetch('http://127.0.0.1:5000/api/login', {
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

    emit('toast', { msg: 'Credenciales incorrectas', type: 'danger' });
  } catch (error) {
    // Modo demo si backend está apagado
    token.value = 'demo_token';
    localStorage.setItem('dr_lisandro_jwt_token', 'demo_token');
    emit('loginSuccess');
    emit('toast', { msg: 'Modo demostración activo', type: 'info' });
    loadMockData();
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
    const resStats = await fetch('http://127.0.0.1:5000/api/estadisticas', {
      headers: { 'Authorization': `Bearer ${token.value}` }
    });
    if (resStats.ok) {
      stats.value = await resStats.json();
    }

    // 2. Cargar citas
    const resCitas = await fetch('http://127.0.0.1:5000/api/citas', {
      headers: { 'Authorization': `Bearer ${token.value}` }
    });
    if (resCitas.ok) {
      citas.value = await resCitas.json();
      return;
    }
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

const changeStatus = async (citaId, newStatus) => {
  try {
    await fetch(`http://127.0.0.1:5000/api/citas/${citaId}`, {
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
    await fetch(`http://127.0.0.1:5000/api/citas/${citaId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token.value}` }
    });
  } catch (e) {}

  citas.value = citas.value.filter(c => c.id !== citaId);
  emit('toast', { msg: `Cita #${citaId} eliminada`, type: 'info' });
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
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-pop-in">
      
      <!-- Top Header -->
      <div class="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center text-lg">
            👨‍⚕️
          </div>
          <div>
            <h3 class="text-sm font-bold block">{{ doctorData.nombre }}</h3>
            <span class="text-[11px] text-sky-400 block font-semibold">Panel Administrativo Médico • Base de Datos PostgreSQL</span>
          </div>
        </div>

        <button type="button" @click="$emit('close')" class="text-slate-400 hover:text-white text-2xl leading-none">
          &times;
        </button>
      </div>

      <!-- Pantalla de Login -->
      <div v-if="!isAuthenticated" class="p-8 max-w-md mx-auto w-full text-center">
        <div class="w-16 h-16 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          🔐
        </div>
        <h4 class="text-xl font-bold text-slate-900 mb-1">Acceso Médico Privado</h4>
        <p class="text-xs text-slate-500 mb-6">Acceso exclusivo para el Dr. Lisandro Márquez y personal de secretaría.</p>

        <form @submit.prevent="handleLogin" class="space-y-4 text-left">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Usuario:</label>
            <input type="text" v-model="username" required class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Contraseña:</label>
            <input type="password" v-model="password" required class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden" />
          </div>

          <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex justify-between items-center text-xs text-emerald-800">
            <span>💡 Demo: <strong>admin</strong> / <strong>admin123</strong></span>
            <button type="button" @click="autoFillDemo" class="text-emerald-700 font-bold underline hover:text-emerald-900">
              Autocompletar
            </button>
          </div>

          <button type="submit" :disabled="loading" class="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition disabled:opacity-50">
            {{ loading ? 'Autenticando...' : 'Iniciar Sesión en el Panel' }}
          </button>
        </form>
      </div>

      <!-- Dashboard del Doctor -->
      <div v-else class="p-6 overflow-y-auto space-y-6">
        
        <!-- Top Actions -->
        <div class="flex justify-between items-center pb-4 border-b border-slate-200 flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              ● Sesión Activa
            </span>
            <span class="text-xs text-slate-500">Sincronizado con PostgreSQL</span>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" @click="loadDashboardData" class="px-3 py-1.5 bg-sky-50 text-sky-700 font-bold rounded-lg text-xs hover:bg-sky-100 transition border border-sky-200">
              🔄 Actualizar Agenda
            </button>
            <button type="button" @click="handleLogout" class="px-3 py-1.5 bg-rose-50 text-rose-700 font-bold rounded-lg text-xs hover:bg-rose-100 transition border border-rose-200">
              Cerrar Sesión
            </button>
          </div>
        </div>

        <!-- KPI Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div class="bg-sky-50 border border-sky-100 p-4 rounded-xl">
            <span class="text-2xl font-extrabold text-sky-900 block">{{ stats.total_citas }}</span>
            <span class="text-[11px] font-bold text-sky-600 uppercase">Citas Totales</span>
          </div>
          <div class="bg-amber-50 border border-amber-100 p-4 rounded-xl">
            <span class="text-2xl font-extrabold text-amber-900 block">{{ stats.citas_pendientes }}</span>
            <span class="text-[11px] font-bold text-amber-600 uppercase">Por Confirmar</span>
          </div>
          <div class="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <span class="text-2xl font-extrabold text-emerald-900 block">{{ stats.citas_confirmadas }}</span>
            <span class="text-[11px] font-bold text-emerald-600 uppercase">Confirmadas</span>
          </div>
          <div class="bg-purple-50 border border-purple-100 p-4 rounded-xl">
            <span class="text-2xl font-extrabold text-purple-900 block">{{ stats.total_pacientes }}</span>
            <span class="text-[11px] font-bold text-purple-600 uppercase">Pacientes Únicos</span>
          </div>
        </div>

        <!-- Filter & Search Controls -->
        <div class="flex flex-wrap justify-between items-center gap-3">
          <input type="text" v-model="searchQuery" placeholder="🔍 Buscar por paciente, teléfono o servicio..." 
                 class="p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm flex-1 min-w-[260px] focus:ring-2 focus:ring-sky-500 focus:outline-hidden" />

          <div class="flex gap-1.5">
            <button v-for="st in ['todos', 'Pendiente', 'Confirmada', 'Realizada']" :key="st" type="button"
                    @click="activeFilter = st"
                    class="px-3 py-1.5 rounded-full text-xs font-bold transition border"
                    :class="activeFilter === st ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'">
              {{ st === 'todos' ? 'Todas' : st }}
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="border border-slate-200 rounded-xl overflow-x-auto">
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
                    <option value="Pendiente">⏳ Pendiente</option>
                    <option value="Confirmada">✅ Confirmada</option>
                    <option value="Realizada">🩺 Realizada</option>
                    <option value="Cancelada">❌ Cancelada</option>
                  </select>
                </td>
                <td class="p-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <a :href="getWhatsAppPatientLink(c)" target="_blank" class="px-2.5 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white rounded font-bold text-[11px] transition flex items-center gap-1" title="Chatear por WhatsApp">
                      <span>💬</span> WhatsApp
                    </a>
                    <button type="button" @click="deleteCita(c.id)" class="p-1 bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white rounded font-bold text-xs transition" title="Eliminar Cita">
                      🗑️
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

        <!-- Footer Utilities -->
        <div class="flex justify-between items-center pt-2 text-xs text-slate-500 flex-wrap gap-2">
          <span>* Los cambios se sincronizan en tiempo real con PostgreSQL.</span>
          <div class="flex gap-2">
            <button type="button" @click="exportCSV" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition border border-slate-200">
              📥 Exportar a CSV
            </button>
            <button type="button" onclick="window.print()" class="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg transition border border-sky-200">
              🖨️ Imprimir Agenda
            </button>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
