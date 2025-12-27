import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

// Configuration API
const API_BASE_URL = 'http://localhost:8000/api';

// Instance Axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  console.log('[Axios] Token from localStorage:', token ? 'Present' : 'Missing');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[Axios] Authorization header set with token');
  } else {
    console.warn('[Axios] No auth token found, request will likely fail');
  }
  
  console.log('[Axios] Request config:', {
    url: config.url,
    method: config.method,
    headers: config.headers
  });
  
  return config;
}, (error) => {
  console.error('[Axios] Request interceptor error:', error);
  return Promise.reject(error);
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
    
    console.error('[Axios] API Error:', {
      status,
      message: errorMessage,
      url: error.config?.url,
      method: error.config?.method,
      response: error.response?.data
    });
    
    if (typeof enqueueSnackbar === 'function') {
      if (status === 401) {
        if (!window.location.pathname.includes('/login')) {
          console.log('[Axios] 401 Unauthorized, redirecting to login');
          localStorage.removeItem('token');
          enqueueSnackbar('Session expirée. Veuillez vous reconnecter.', { variant: 'error' });
          window.location.href = '/login';
        }
      } else if (status === 403) {
        enqueueSnackbar('Accès non autorisé', { variant: 'error' });
      } else if (status === 404) {
        enqueueSnackbar('Ressource non trouvée', { variant: 'error' });
      } else if (status >= 500) {
        enqueueSnackbar('Erreur serveur. Veuillez réessayer plus tard.', { variant: 'error' });
      } else if (!error.response) {
        enqueueSnackbar('Erreur de connexion au serveur', { variant: 'error' });
      } else {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    } else {
      console.error('Erreur API:', { status, message: errorMessage });
    }
    
    return Promise.reject(error);
  }
);

export default api;