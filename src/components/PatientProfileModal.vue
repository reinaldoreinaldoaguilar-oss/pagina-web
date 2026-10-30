<script setup>
import { ref, computed } from 'vue';
import countriesList from '../data/countries.json';
import { currentUser, updatePatientProfile } from '../services/auth';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'completed', 'toast']);

const selectedCountry = ref(countriesList[0]); // Venezuela (+58)
const rawPhone = ref('');
const idDocument = ref('');
const privacyAccepted = ref(false);
const loading = ref(false);
const errorMsg = ref('');

const formattedPhone = computed(() => {
  if (!rawPhone.value || !rawPhone.value.trim()) return '';
  let clean = rawPhone.value.trim();
  const code = selectedCountry.value?.code || '+58';

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

const handleSubmit = async () => {
  if (!rawPhone.value.trim()) {
    errorMsg.value = 'Por favor ingresa tu número de teléfono / WhatsApp para coordinar tu cita.';
    return;
  }
  if (!privacyAccepted.value) {
    errorMsg.value = 'Debes aceptar la política de privacidad y confidencialidad médica para continuar.';
    return;
  }

  loading.value = true;
  errorMsg.value = '';

  try {
    await updatePatientProfile({
      telefono: formattedPhone.value,
      documento_identidad: idDocument.value.trim(),
      politica_privacidad_aceptada: true
    });

    emit('toast', { msg: '¡Perfil médico completado exitosamente!', type: 'success' });
    emit('completed');
  } catch (err) {
    errorMsg.value = err.message || 'Error al guardar los datos del paciente';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col animate-pop-in">
      
      <!-- Cabecera -->
      <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center overflow-hidden">
            <img v-if="currentUser?.foto_url" :src="currentUser.foto_url" alt="Avatar" class="w-full h-full object-cover" />
            <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold leading-tight">Completar Datos del Paciente</h3>
            <span class="text-[11px] text-sky-400 block font-medium">Dr. Lisandro Márquez • Urología</span>
          </div>
        </div>
      </div>

      <!-- Cuerpo -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 text-left">
        
        <!-- Identidad Google Bloqueada (Seguridad y Privacidad) -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-sky-600 shrink-0">
            G
          </div>
          <div class="min-w-0 flex-1">
            <span class="text-[10px] text-slate-400 block font-semibold uppercase">Cuenta vinculada con Google</span>
            <strong class="text-xs text-slate-800 block truncate">{{ currentUser?.nombre }}</strong>
            <span class="text-[11px] text-slate-500 font-mono truncate block">{{ currentUser?.correo }}</span>
          </div>
          <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">Verificado</span>
        </div>

        <!-- Teléfono con Selector Internacional -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Teléfono / WhatsApp: *</span>
            <span class="text-[10px] text-slate-400 font-normal">Para confirmar tu cita</span>
          </label>

          <div class="flex rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 overflow-hidden bg-white shadow-2xs transition">
            <!-- Selector Desplegable de País -->
            <div class="relative flex items-center bg-slate-50 hover:bg-slate-100 transition border-r border-slate-300 cursor-pointer shrink-0">
              <select
                v-model="selectedCountry"
                class="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              >
                <option v-for="c in countriesList" :key="c.name + c.code" :value="c">
                  {{ c.flag }} {{ c.name }} ({{ c.code }})
                </option>
              </select>

              <div class="flex items-center gap-1 px-2.5 py-2.5 text-xs font-bold text-slate-800 pointer-events-none select-none">
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
              v-model="rawPhone"
              required
              :placeholder="selectedCountry.placeholder"
              class="w-full p-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden bg-white"
            />
          </div>

          <div class="mt-1 text-[10px] text-slate-500 font-mono" v-if="rawPhone.trim()">
            Guardar como: <strong class="text-sky-700">{{ formattedPhone }}</strong>
          </div>
        </div>

        <!-- Documento de Identidad (Cédula o Pasaporte) -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Cédula o Documento de Identidad:</span>
            <span class="text-[10px] text-slate-400 font-normal">Para la orden médica</span>
          </label>
          <input
            type="text"
            v-model="idDocument"
            placeholder="Ej: V-18.452.123 o Pasaporte"
            class="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        <!-- Checkbox de Política de Privacidad Médica -->
        <div class="pt-1">
          <label class="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="privacyAccepted"
              required
              class="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <span class="text-[11px] text-slate-600 leading-snug">
              Acepto los términos de confidencialidad y autorizo al consultorio del Dr. Lisandro Márquez a gestionar mis turnos médicos de manera privada y segura.
            </span>
          </label>
        </div>

        <div v-if="errorMsg" class="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {{ errorMsg }}
        </div>

        <!-- Botones de Acción -->
        <div class="pt-2">
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loading ? 'Guardando datos...' : 'Completar Perfil y Continuar a la Cita' }}</span>
          </button>
        </div>

      </form>

    </div>
  </div>
</template>
