import ApiClient from './ApiClient';

export const typeCompteService = {
  getTypesComptes: async () => {
    try {
      const response = await ApiClient.get('/types-comptes');
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des types de comptes:', error);
      throw error;
    }
  },
  
  getTypeCompteById: async (id: number) => {
    try {
      const response = await ApiClient.get(`/types-comptes/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du type de compte ${id}:`, error);
      throw error;
    }
  }
};
