import ApiClient from './api/ApiClient';

const guichetService = {
  // Récupérer tous les guichets
  getGuichets: async () => {
    const response = await ApiClient.get('/caisse/guichets');
    // Vérifier si la réponse a une structure data
    return response.data.data || response.data;
  },

  // Récupérer un guichet par ID
  getGuichetById: async (id: number) => {
    const response = await ApiClient.get(`/guichets/${id}`);
    return response.data.data || response.data;
  },

// Récupérer les guichets disponibles pour une session agence
getGuichetsDisponibles: async (agenceSessionId: number) => {
  console.log('🔗 Appel API: GET /sessions/guichets/disponibles/' + agenceSessionId);
  
  try {
    const response = await ApiClient.get(`/sessions/guichets/disponibles/${agenceSessionId}`);
    
    console.log('📡 Réponse API:', {
      status: response.status,
      data: response.data
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Erreur API getGuichetsDisponibles:', error);
    throw error;
  }
},

  // Récupérer les caisses d'un guichet
  getCaissesByGuichet: async (guichetId: number) => {
    const response = await ApiClient.get(`/guichets/${guichetId}/caisses`);
    return response.data.data || response.data;
  }
};

export default guichetService;