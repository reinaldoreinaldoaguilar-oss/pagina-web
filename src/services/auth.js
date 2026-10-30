import { ref, computed } from 'vue';
import { API_BASE_URL } from '../config/api';

const TOKEN_KEY = 'med_auth_token';

export const token = ref(localStorage.getItem(TOKEN_KEY) || '');
export const currentUser = ref(null);
export const authLoading = ref(false);

export const isAuthenticated = computed(() => !!token.value && !!currentUser.value);
export const isPatient = computed(() => currentUser.value?.rol === 'paciente');
export const isDoctor = computed(() => currentUser.value?.rol === 'doctor' || currentUser.value?.rol === 'administrador');
export const isAdmin = computed(() => currentUser.value?.rol === 'administrador');

export const setAuthToken = (newToken) => {
  token.value = newToken;
  if (newToken) {
    localStorage.setItem(TOKEN_KEY, newToken);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    currentUser.value = null;
  }
};

export const fetchCurrentUser = async () => {
  if (!token.value) {
    currentUser.value = null;
    return null;
  }
  try {
    authLoading.value = true;
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      currentUser.value = data.usuario;
      return currentUser.value;
    } else {
      // Token inválido o vencido
      setAuthToken('');
      return null;
    }
  } catch (err) {
    console.warn('Error al verificar sesión actual:', err);
    return null;
  } finally {
    authLoading.value = false;
  }
};

export const loginWithGoogleCredential = async (credential) => {
  try {
    authLoading.value = true;
    const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || 'Error en autenticación con Google');
    }

    setAuthToken(data.token);
    currentUser.value = data.usuario;
    return {
      success: true,
      usuario: data.usuario,
      requierePerfil: data.requiere_perfil
    };
  } catch (err) {
    console.error('Error en login Google:', err);
    throw err;
  } finally {
    authLoading.value = false;
  }
};

export const updatePatientProfile = async (profileData) => {
  if (!token.value) throw new Error('No hay sesión activa');
  const res = await fetch(`${API_BASE_URL}/api/auth/perfil`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.value}`
    },
    body: JSON.stringify(profileData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.mensaje || 'Error al actualizar perfil');
  }
  await fetchCurrentUser();
  return data;
};

export const logout = () => {
  setAuthToken('');
  currentUser.value = null;
  if (window.google?.accounts?.id) {
    try {
      window.google.accounts.id.disableAutoSelect();
    } catch (e) {}
  }
};
