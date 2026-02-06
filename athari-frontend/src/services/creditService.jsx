import axios from 'axios';

/**
 * ==============================
 * AXIOS INSTANCE
 * ==============================
 */
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * ==============================
 * INTERCEPTOR ERREURS - CORRIGÉ
 * ==============================
 */

// Fonction pour rafraîchir le token
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('🔄 Attempting token refresh, refreshToken exists:', !!refreshToken);

    if (!refreshToken) {
      console.error('❌ No refresh token available in localStorage');
      throw new Error('No refresh token available');
    }

    console.log('📡 Calling refresh endpoint...');
    console.log('📤 Sending refreshToken:', refreshToken.substring(0, 20) + '...');

    const response = await axios.post('http://127.0.0.1:8000/api/auth/refresh', {
      refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('✅ Refresh response:', response.data);
    const { token, token_type, user } = response.data;

    if (!token) {
      throw new Error('No token received from refresh endpoint');
    }

    localStorage.setItem('authToken', token);
    console.log('💾 New token stored');

    // Backend returns user data, update if needed
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
      console.log('💾 User data updated');
    }
    return token;
  } catch (error) {
    console.error('❌ Token refresh failed:', error.response?.data || error.message);

    // Only clear tokens and redirect if refresh token is actually invalid (401)
    // Don't auto-logout for network errors or server issues
    if (error.response?.status === 401) {
      console.log('🔐 Refresh token invalid, clearing session');
      localStorage.clear();
      window.location.href = '/login';
    }

    throw error;
  }
};

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Avoid circular references - extract only primitive data
    if (error.response) {
      console.error(`❌ API ERROR - url: ${error.response.config?.url || 'unknown'}, status: ${error.response.status}, message: ${error.response.data?.message || error.response.data?.error || 'Erreur inconnue'}`);

      // Si 401 et pas déjà une tentative de refresh
      if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh a échoué, l'utilisateur sera redirigé
          return Promise.reject(refreshError);
        }
      }
    } else if (error.request) {
      console.error('❌ NO SERVER RESPONSE - Le serveur ne répond pas');
    } else {
      // Only log the message, not the entire error object
      console.error(`❌ REQUEST ERROR: ${error.message || 'Erreur de requête'}`);
    }
    return Promise.reject(error);
  }
);

/**
 * ==============================
 * UTILITAIRES
 * ==============================
 */

// Fonction pour extraire les données de façon sécurisée
const extractData = (response) => {
  if (!response || !response.data) return null;
  
  // Si la réponse a une structure standard
  if (response.data.data !== undefined) {
    return response.data.data;
  }
  
  return response.data;
};

// Fonction pour formater les erreurs (sans circular references)
const formatError = (error) => {
  if (!error) return 'Erreur inconnue';
  
  // Extract only primitive data to avoid circular references
  if (error.response) {
    const data = error.response.data;
    
    // Safely extract string data
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      if (data.message) return data.message;
      if (data.error) return data.error;
      if (data.errors) {
        // Handle validation errors
        if (typeof data.errors === 'string') return data.errors;
        if (Array.isArray(data.errors)) return data.errors.join(', ');
        if (typeof data.errors === 'object') {
          return Object.values(data.errors).flat().join(', ');
        }
      }
    }
    
    return `Erreur ${error.response.status}: ${error.response.statusText || 'Erreur serveur'}`;
  }
  
  if (error.request) {
    return 'Le serveur ne répond pas';
  }
  
  // Safely get message without serializing the entire error
  return error.message || 'Erreur de requête';
};

/**
 * ==============================
 * CREDIT APPLICATIONS
 * ==============================
 */

// CREATE
const createCreditApplication = async (formData) => {
  try {
    const response = await apiClient.post(
      '/credit-applications',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return { success: true, data: extractData(response) };
  } catch (error) {
    return { 
      success: false, 
      error: formatError(error),
      status: error.response?.status 
    };
  }
};

// GET ALL
const getCreditApplications = async (params = {}) => {
  try {
    const response = await apiClient.get('/credit-applications', { params });
    return { success: true, data: extractData(response) };
  } catch (error) {
    return { 
      success: false, 
      error: formatError(error),
      status: error.response?.status,
      data: [] 
    };
  }
};

// GET BY ID
const getCreditApplicationById = async (id) => {
  try {
    const response = await apiClient.get(`/credit-applications/${id}`);
    return { success: true, data: extractData(response) };
  } catch (error) {
    return { 
      success: false, 
      error: formatError(error),
      status: error.response?.status 
    };
  }
};

// UPDATE STATUS
const updateCreditStatus = async (id, status, comment = '') => {
  try {
    const response = await apiClient.put(
      `/credit-applications/${id}/status`,
      { status, comment }
    );
    return { success: true, data: extractData(response) };
  } catch (error) {
    return {
      success: false,
      error: formatError(error),
      status: error.response?.status
    };
  }
};

// UPDATE CREDIT DETAILS
const updateCreditDetails = async (id, details) => {
  try {
    const response = await apiClient.put(
      `/credit-applications/${id}/details`,
      details
    );
    return { success: true, data: extractData(response) };
  } catch (error) {
    return {
      success: false,
      error: formatError(error),
      status: error.response?.status
    };
  }
};

/**
 * ==============================
 * FILTERS
 * ==============================
 */

const getApplicationsByStatus = async (status, params = {}) => {
  try {
    const response = await apiClient.get('/credit-applications', {
      params: { ...params, status },
    });
    return { success: true, data: extractData(response) };
  } catch (error) {
    return { 
      success: false, 
      data: [], 
      error: formatError(error) 
    };
  }
};

const getApplicationsByRole = async (role, params = {}) => {
  try {
    const response = await apiClient.get('/credit-applications', {
      params: { ...params, role },
    });
    return { success: true, data: extractData(response) };
  } catch (error) {
    return { 
      success: false, 
      data: [], 
      error: formatError(error) 
    };
  }
};

/**
 * ==============================
 * AVIS WORKFLOW
 * ==============================
 */

// GET /api/credit-applications/{applicationId}/avis - Get All Avis for Flash Credit
const getAvisFlash = async (applicationId) => {
  try {
    const response = await apiClient.get(`/credit-applications/${applicationId}/avis`);
    return { success: true, data: extractData(response) };
  } catch (error) {
    console.error('Error in getAvisFlash:', error.message);
    return { 
      success: false, 
      error: formatError(error),
      status: error.response?.status 
    };
  }
};

// POST /api/credit-applications/{applicationId}/avis - Submit Avis for Flash Credit
const submitAvisFlash = async (applicationId, avisData) => {
  try {
    console.log('Submitting avis for application:', applicationId, 'with data:', avisData);
    
    const response = await apiClient.post(
      `/credit-applications/${applicationId}/avis`, 
      avisData
    );
    
    console.log('Avis submitted successfully:', response.data);
    return { success: true, data: extractData(response) };
  } catch (error) {
    // Log only safe information, not the entire error object
    console.error('Error in submitAvisFlash:', {
      message: error.message,
      status: error.response?.status,
      url: error.response?.config?.url,
      data: error.response?.data
    });
    
    return { 
      success: false, 
      error: formatError(error),
      status: error.response?.status,
      validationErrors: error.response?.data?.errors || error.response?.data?.data?.errors
    };
  }
};

// GET /api/credit-applications/{applicationId}/avis/expected-level - Get expected level
const getExpectedLevel = async (applicationId) => {
  try {
    const response = await apiClient.get(
      `/credit-applications/${applicationId}/avis/expected-level`
    );
    return { success: true, data: extractData(response) };
  } catch (error) {
    console.error('Error in getExpectedLevel:', error.message);
    return { 
      success: false, 
      error: formatError(error),
      status: error.response?.status 
    };
  }
};

// GET /api/credit-applications/{applicationId}/avis/can-give/{level} - Check if user can give opinion
const canGiveOpinion = async (applicationId, level) => {
  try {
    const response = await apiClient.get(
      `/credit-applications/${applicationId}/avis/can-give/${level}`
    );
    return { success: true, data: extractData(response) };
  } catch (error) {
    console.error('Error in canGiveOpinion:', error.message);
    return { 
      success: false, 
      error: formatError(error),
      status: error.response?.status 
    };
  }
};

/**
 * ==============================
 * COMITÉ
 * ==============================
 */

const submitCommitteeOpinion = async (creditId, opinions) => {
  try {
    const response = await apiClient.post(
      `/credit-applications/${creditId}/committee-opinions`,
      { opinions }
    );
    return { success: true, data: extractData(response) };
  } catch (error) {
    console.error('Error in submitCommitteeOpinion:', error.message);
    return { 
      success: false, 
      error: formatError(error),
      status: error.response?.status 
    };
  }
};

const getCommitteeOpinions = async (creditId) => {
  try {
    const response = await apiClient.get(
      `/credit-applications/${creditId}/committee-opinions`
    );
    return { success: true, data: extractData(response) };
  } catch (error) {
    console.error('Error in getCommitteeOpinions:', error.message);
    return { 
      success: false, 
      error: formatError(error),
      status: error.response?.status 
    };
  }
};

/**
 * ==============================
 * CREDIT FLASH
 * ==============================
 */

const createFlashDemande = async (formData) => {
  try {
    const response = await apiClient.post(
      '/credit-flash/demande',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return { success: true, data: extractData(response) };
  } catch (error) {
    console.error('Error in createFlashDemande:', error.message);
    return { 
      success: false, 
      error: formatError(error),
      status: error.response?.status 
    };
  }
};

const getFlashDemandes = async (params = {}) => {
  try {
    const response = await apiClient.get('/credit-flash/demande', { params });
    return { success: true, data: extractData(response) };
  } catch (error) {
    console.error('Error in getFlashDemandes:', error.message);
    return { 
      success: false, 
      error: formatError(error),
      status: error.response?.status 
    };
  }
};

/**
 * ==============================
 * PV / COMPTABILITÉ / DOCUMENTS
 * ==============================
 */

const generatePV = async (creditId, pvData = {}) => {
  try {
    const response = await apiClient.post(
      '/credit-pvs',
      pvData
    );
    return { success: true, data: extractData(response) };
  } catch (error) {
    console.error('Error in generatePV:', error.message);
    return {
      success: false,
      error: formatError(error),
      status: error.response?.status
    };
  }
};

const executeAccountMovement = async (creditId, movementData) => {
  try {
    const response = await apiClient.post(
      `/credit-applications/${creditId}/movement`,
      movementData
    );
    return { success: true, data: extractData(response) };
  } catch (error) {
    console.error('Error in executeAccountMovement:', error.message);
    return { 
      success: false, 
      error: formatError(error),
      status: error.response?.status 
    };
  }
};

const downloadDocument = async (creditId, documentType) => {
  try {
    const response = await apiClient.get(
      `/credit-applications/${creditId}/documents/${documentType}`,
      { responseType: 'blob' }
    );
    return { success: true, data: response.data, headers: response.headers };
  } catch (error) {
    console.error('Error in downloadDocument:', error.message);
    return {
      success: false,
      error: formatError(error),
      status: error.response?.status
    };
  }
};

const downloadPV = async (pvId) => {
  try {
    const response = await apiClient.get(
      `/credit-pvs/${pvId}/download`,
      { responseType: 'blob' }
    );
    return { success: true, data: response.data, headers: response.headers };
  } catch (error) {
    console.error('Error in downloadPV:', error.message);
    return {
      success: false,
      error: formatError(error),
      status: error.response?.status
    };
  }
};

const getPV = async (creditId) => {
  try {
    const response = await apiClient.get(`/credit-applications/${creditId}/pv`);
    return { success: true, data: extractData(response) };
  } catch (error) {
    console.error('Error in getPV:', error.message);
    return {
      success: false,
      error: formatError(error),
      status: error.response?.status
    };
  }
};

/**
 * ==============================
 * CREDIT TYPES
 * ==============================
 */

const getCreditTypes = async () => {
  try {
    const response = await apiClient.get('/credit-types');
    return { success: true, data: extractData(response) };
  } catch (error) {
    console.error('Error in getCreditTypes:', error.message);
    return { 
      success: false, 
      data: [], 
      error: formatError(error) 
    };
  }
};

/**
 * ==============================
 * HEALTH CHECK
 * ==============================
 */

const checkApiHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error in checkApiHealth:', error.message);
    return { 
      success: false, 
      error: formatError(error),
      status: error.response?.status 
    };
  }
};

/**
 * ==============================
 * EXPORT
 * ==============================
 */
export default {
  // Credit Applications
  createCreditApplication,
  getCreditApplications,
  getCreditApplicationById,
  updateCreditStatus,
  updateCreditDetails,

  // Filters
  getApplicationsByStatus,
  getApplicationsByRole,

  // Avis Workflow
  getAvisFlash,
  submitAvisFlash,
  getExpectedLevel,
  canGiveOpinion,

  // Comité
  submitCommitteeOpinion,
  getCommitteeOpinions,

  // Flash Credit
  createFlashDemande,
  getFlashDemandes,

  // Documents
  generatePV,
  executeAccountMovement,
  downloadDocument,
  downloadPV,
  getPV,

  // Credit Types
  getCreditTypes,

  // Health Check
  checkApiHealth,

  // Utilitaires
  extractData,
  formatError
};
