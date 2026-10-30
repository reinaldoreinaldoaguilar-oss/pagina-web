<script setup>
import { ref, onMounted } from 'vue';
import { loginWithGoogleCredential, authLoading } from '../services/auth';

const props = defineProps({
  buttonText: {
    type: String,
    default: 'continue_with' // 'signin_with' | 'signup_with' | 'continue_with'
  },
  promptOneTap: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['success', 'error', 'cancel']);

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const buttonContainer = ref(null);
const errorMessage = ref('');
const isGisLoaded = ref(false);

const handleCredentialResponse = async (response) => {
  if (!response || !response.credential) {
    emit('error', 'No se recibió credencial de Google');
    return;
  }
  try {
    errorMessage.value = '';
    const res = await loginWithGoogleCredential(response.credential);
    emit('success', res);
  } catch (err) {
    errorMessage.value = err.message || 'Error al autenticar con Google';
    emit('error', errorMessage.value);
  }
};

const renderGoogleButton = () => {
  if (!window.google?.accounts?.id || !buttonContainer.value) return;

  try {
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });

    window.google.accounts.id.renderButton(buttonContainer.value, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      shape: 'pill',
      text: props.buttonText,
      logo_alignment: 'left',
      width: 290
    });

    isGisLoaded.value = true;

    if (props.promptOneTap) {
      window.google.accounts.id.prompt();
    }
  } catch (e) {
    console.warn('Error inicializando Google GIS:', e);
  }
};

// Modo de prueba asistida para desarrollo cuando no se haya suministrado un Client ID en .env
const loginConGoogleDemo = async () => {
  // Genera un ID Token representativo con el emisor oficial de Google para probar el flujo completo
  try {
    errorMessage.value = '';
    // Simula la interacción OAuth para pruebas locales
    const demoPayload = {
      sub: `demo_${Date.now()}`,
      email: 'paciente.demo@gmail.com',
      name: 'Carlos Mendoza (Demo Google)',
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
    };
    
    // Si hay un Client ID real, abrimos el selector oficial de Google
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }

    emit('error', 'Configura VITE_GOOGLE_CLIENT_ID en el archivo .env para conectar con tu proyecto en Google Cloud.');
  } catch (err) {
    errorMessage.value = err.message;
  }
};

onMounted(() => {
  // Esperar a que el script de Google cargue
  if (window.google?.accounts?.id) {
    renderGoogleButton();
  } else {
    const checkInterval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkInterval);
        renderGoogleButton();
      }
    }, 200);

    setTimeout(() => clearInterval(checkInterval), 6000);
  }
});
</script>

<template>
  <div class="flex flex-col items-center w-full">
    
    <!-- Contenedor Oficial del Botón Renderizado por Google Identity Services -->
    <div ref="buttonContainer" class="min-h-[44px] flex items-center justify-center"></div>

    <!-- Si Google no ha renderizado aún o no hay Client ID configurado -->
    <div v-if="!googleClientId" class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left w-full text-xs text-amber-900">
      <div class="flex items-center gap-2 font-bold mb-1">
        <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Autenticación Real con Google:</span>
      </div>
      <p class="text-[11px] text-amber-800 leading-relaxed mb-2">
        El sistema está listo para recibir tokens criptográficos de Google. Para activar la ventana emergente oficial de cuentas de Google, debes ingresar tu <strong>Client ID de Google Cloud</strong> en el archivo <code>.env</code>.
      </p>
    </div>

    <!-- Mensaje de Error en caso de rechazo o fallo de red -->
    <div v-if="errorMessage" class="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-center w-full">
      {{ errorMessage }}
    </div>

    <!-- Indicador de Carga mientras se valida en el backend -->
    <div v-if="authLoading" class="mt-2 flex items-center gap-2 text-xs text-sky-700 font-semibold animate-pulse">
      <svg class="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Validando identidad médica con Google...</span>
    </div>

  </div>
</template>
