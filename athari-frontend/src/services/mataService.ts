import api from './api/axios';

/**
 * Service pour la gestion des opérations MATA (Mouvement Autonome de Toutes les Activités)
 */
export const mataService = {
  /**
   * Récupère l'historique des mouvements MATA d'un compte
   */
  async getMouvements(compteId: string, filters: any = {}) {
    const response = await api.get(`/comptes/${compteId}/mouvements-mata`, { params: filters });
    return response.data;
  },

  /**
   * Récupère le récapitulatif des rubriques MATA d'un compte
   */
  async getRecapitulatif(compteId: string) {
    const response = await api.get(`/comptes/${compteId}/mata/recapitulatif`);
    return response.data;
  },

  /**
   * Crée un nouveau mouvement MATA
   */
  async createMouvement(compteId: string, data: any) {
    const response = await api.post(`/comptes/${compteId}/mouvements-mata`, data);
    return response.data;
  },

  /**
   * Annule un mouvement MATA
   */
  async annulerMouvement(mouvementId: string) {
    const response = await api.post(`/mouvements-mata/${mouvementId}/annuler`);
    return response.data;
  },

  /**
   * Récupère les statistiques des mouvements MATA
   */
  async getStatistiques(compteId: string, params: any = {}) {
    const response = await api.get(`/comptes/${compteId}/mata/statistiques`, { params });
    return response.data;
  },

  /**
   * Exporte les mouvements MATA au format Excel
   */
  async exporterMouvements(compteId: string, filters: any = {}) {
    const response = await api.get(`/comptes/${compteId}/mouvements-mata/export`, {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
};
