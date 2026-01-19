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
    const response = await ApiClient.get(`/guichets/disponibles/${agenceSessionId}`);
    return response.data.data || response.data;
  },

  // Récupérer les caisses d'un guichet
  getCaissesByGuichet: async (guichetId: number) => {
    const response = await ApiClient.get(`/guichets/${guichetId}/caisses`);
    return response.data.data || response.data;
  }
};

export default guichetService;