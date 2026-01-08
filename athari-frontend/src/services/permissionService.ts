import ApiClient from './api/ApiClient';

export interface Permission {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const permissionService = {
  /**
   * Récupère toutes les permissions disponibles
   */
  getAll: async (): Promise<Permission[]> => {
    try {
      const response = await ApiClient.get('/permissions');
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des permissions:', error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle permission
   */
  create: async (permissionData: { name: string; description?: string }): Promise<Permission> => {
    try {
      const response = await ApiClient.post('/permissions/creer', permissionData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la permission:', error);
      throw error;
    }
  },

  /**
   * Met à jour une permission existante
   */
  update: async (permissionId: number, permissionData: Partial<Permission>): Promise<Permission> => {
    try {
      const response = await ApiClient.put(`/permissions/${permissionId}`, permissionData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la permission ${permissionId}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une permission
   */
  delete: async (permissionId: number): Promise<void> => {
    try {
      await ApiClient.delete(`/permissions/${permissionId}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la permission ${permissionId}:`, error);
      throw error;
    }
  }
};

export default permissionService;