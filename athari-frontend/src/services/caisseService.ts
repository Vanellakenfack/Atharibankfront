import ApiClient from './api/ApiClient';

const caisseService = {
  // Récupérer toutes les caisses (ancienne méthode)
  getCaisses: async () => {
    const response = await ApiClient.get('caisse/caisses');
    return response.data.data || response.data;
  },

  // Récupérer les caisses disponibles pour un guichet spécifique
  getCaissesDisponiblesParGuichet: async (guichetSessionId: number) => {
    try {
      console.log(`🔄 Chargement caisses pour session guichet: ${guichetSessionId}`);
      const response = await ApiClient.get(`sessions/caisses/disponibles/${guichetSessionId}`);
      console.log('📦 Réponse API caisses par guichet:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur chargement caisses par guichet:', error);
      throw error;
    }
  }
};

export default caisseService;