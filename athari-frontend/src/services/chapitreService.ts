import api from './api/axios';

/**
 * Service pour la gestion des chapitres comptables
 */
export const chapitreService = {
  /**
   * Récupère la liste des chapitres comptables
   */
  async getChapitres() {
    try {
      const response = await api.get('plan-comptable/comptes');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des chapitres:', error);
      throw error;
    }
  },

  /**
   * Récupère un chapitre par son ID
   */
  async getChapitre(id: number) {
    try {
      const response = await api.get(`plan-comptable/comptes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du chapitre ${id}:`, error);
      throw error;
    }
  },

  /**
   * Recherche des chapitres par libellé ou code
   */
  async searchChapitres(searchTerm: string) {
    try {
      const response = await api.get('plan-comptable/comptes/search', {
        params: { q: searchTerm }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche des chapitres:', error);
      throw error;
    }
  }
};
