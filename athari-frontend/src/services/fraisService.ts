import api from './api/axios';

/**
 * Service pour la gestion des frais de commission
 */
export const fraisService = {
  /**
   * Récupère la liste des configurations de frais
   */
  async getFraisCommissions() {
    try {
      const response = await api.get('/frais-commissions');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des frais de commission:', error);
      throw error;
    }
  },

  /**
   * Récupère une configuration de frais par son ID
   */
  async getFraisCommission(id: number) {
    try {
      console.log(`[fraisService] Fetching frais commission with ID: ${id}`);
      const response = await api.get(`/frais-commissions/${id}`);
      console.log(`[fraisService] Response for ID ${id}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`[fraisService] Erreur lors de la récupération du frais de commission ${id}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      throw error;
    }
  },

  /**
   * Crée une nouvelle configuration de frais
   */
  async createFraisCommission(data: any) {
    try {
      const response = await api.post('/frais-commissions', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du frais de commission:', error);
      throw error;
    }
  },

  /**
   * Met à jour une configuration de frais existante
   */
  async updateFraisCommission(id: number, data: any) {
    try {
      const response = await api.put(`/frais-commissions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du frais de commission ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une configuration de frais
   */
  async deleteFraisCommission(id: number) {
    try {
      await api.delete(`/frais-commissions/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du frais de commission ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère la liste des frais appliqués
   */
  async getFraisApplications(params: any = {}) {
    try {
      console.log('Appel API GET /frais-applications avec params:', params);
      const response = await api.get('/frais-applications', { 
        params,
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => {
              if (value === undefined || value === null) return '';
              return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
            })
            .filter(Boolean)
            .join('&');
        }
      });
      console.log('Réponse API /frais-applications:', response.data);
      return response;
    } catch (error: any) {
      console.error('Erreur API lors de la récupération des frais appliqués:', {
        error: {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText
        },
        params
      });
      throw error;
    }
  },

  /**
   * Récupère les détails d'un frais appliqué
   */
  async getFraisApplication(id: number) {
    try {
      const response = await api.get(`/frais-applications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du frais appliqué ${id}:`, error);
      throw error;
    }
  },

  /**
   * Annule un frais appliqué
   */
  async cancelFraisApplication(id: number) {
    try {
      const response = await api.put(`/frais-applications/${id}/annuler`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'annulation du frais appliqué ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les types de compte pour le formulaire
   */
  async getTypeComptes() {
    try {
      const response = await api.get('/types-comptes');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des types de comptes:', error);
      throw error;
    }
  }
};
