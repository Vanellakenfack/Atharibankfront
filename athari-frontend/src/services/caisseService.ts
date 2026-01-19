import ApiClient from './api/ApiClient';

const caisseService = {
  // Récupérer toutes les caisses
  getCaisses: async () => {
    const response = await ApiClient.get('caisse/caisses');
    return response.data.data || response.data;
  },

};

export default caisseService;