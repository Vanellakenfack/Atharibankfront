// services/pvService.ts
import api from './api';

const pvService = {
  // Récupérer le PV d'une application
  async getPvByApplicationId(applicationId: number) {
    try {
      const response = await api.get(`/credit-applications/${applicationId}/pv`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération du PV'
      };
    }
  },

  // Télécharger un PV
  async downloadPv(pvId: number) {
    try {
      const response = await api.get(`/pv/${pvId}/download`, {
        responseType: 'blob'
      });
      
      // Créer l'URL du blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      return {
        success: true,
        url
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du téléchargement'
      };
    }
  },

  // Générer un PV automatiquement
  async generatePv(applicationId: number) {
    try {
      const response = await api.post(`/credit-applications/${applicationId}/generate-pv`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la génération du PV'
      };
    }
  }
};

export default pvService;