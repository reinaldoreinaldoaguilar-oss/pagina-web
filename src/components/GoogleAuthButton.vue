<script setup>
import { ref, computed, onMounted } from 'vue';
import { loginWithGoogleCredential, authLoading } from '../services/auth';
import { API_BASE_URL } from '../config/api';

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

// Client ID oficial de Google Cloud configurado para el proyecto
const OFFICIAL_CLIENT_ID = '218889080146-1v3rcqk04m3dchj8g7iu5do3ovq84rll.apps.googleusercontent.com';
const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || OFFICIAL_CLIENT_ID;
const customClientId = ref(localStorage.getItem('custom_google_client_id') || '');

const googleClientId = computed(() => {
  return customClientId.value || envClientId || OFFICIAL_CLIENT_ID;
});

const buttonContainer = ref(null);
const errorMessage = ref('');
const isGisLoaded = ref(false);

/**
 * Procesa la credencial oficial (ID Token JWT) devuelta por Google
 */
const handleCredentialResponse = async (response) => {
  if (!response || !response.credential) {
    emit('error', 'No se recibió la credencial de Google');
    return;
  }
  try {
    errorMessage.value = '';
    const res = await loginWithGoogleCredential(response.credential);
    emit('success', res);
  } catch (err) {
    errorMessage.value = err.message || 'Error al autenticar y validar con Google';
    emit('error', errorMessage.value);
  }
};

/**
 * Renderiza el botón nativo oficial de Google Identity Services (GIS)
 * Al hacer clic, Google abre su ventana emergente nativa "Elige una cuenta"
 */
const renderGoogleButton = () => {
  if (!window.google?.accounts?.id || !buttonContainer.value) return;

  try {
    window.google.accounts.id.initialize({
      client_id: googleClientId.value,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });

    buttonContainer.value.innerHTML = '';
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

const triggerPrompt = () => {
  if (window.google?.accounts?.id) {
    try {
      window.google.accounts.id.prompt();
    } catch (e) {}
  }
};

onMounted(() => {
  const init = () => {
    if (window.google?.accounts?.id && buttonContainer.value) {
      renderGoogleButton();
    }
  };

  if (window.google?.accounts?.id) {
    init();
  } else {
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);
        init();
      }
    }, 150);
    setTimeout(() => clearInterval(timer), 6000);
  }
});
</script>

<template>
  <div class="flex flex-col items-center w-full max-w-sm mx-auto">
    
    <!-- Contenedor Oficial del Botón Renderizado por Google Identity Services -->
    <div class="w-full flex flex-col items-center space-y-2">
      <div ref="buttonContainer" class="min-h-[44px] flex items-center justify-center"></div>

      <!-- Respaldo interactivo mientras el SDK de Google monta el iframe -->
      <button
        v-if="!isGisLoaded"
        type="button"
        @click="triggerPrompt"
        :disabled="authLoading"
        class="w-full py-3 px-4 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition active:scale-[0.99] cursor-pointer"
      >
        <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>Continuar con Google</span>
      </button>

      <p class="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
        <span>✓</span> Conexión oficial activa con Google Identity Services
      </p>
    </div>

    <!-- Indicador de Carga mientras el Backend Valida Criptográficamente el Token -->
    <div v-if="authLoading" class="mt-3 flex items-center gap-2 text-xs text-sky-700 font-semibold animate-pulse">
      <div class="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Validando identidad médica con Google...</span>
    </div>

    <!-- Mensaje de Error en caso de rechazo -->
    <div v-if="errorMessage" class="mt-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-center w-full">
      {{ errorMessage }}
    </div>

  </div>
</template>
