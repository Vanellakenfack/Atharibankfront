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
    } catch (error: any) {
      console.error('Erreur lors de la récupération des permissions:', error);
      
      if (error.response?.status === 403) {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour voir les permissions');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Impossible de récupérer les permissions');
    }
  },

  /**
   * Crée une nouvelle permission
   */
  create: async (permissionData: { name: string; description?: string }): Promise<Permission> => {
    try {
      const response = await ApiClient.post('/permissions/creer', permissionData);
      return response.data.permission;
    } catch (error: any) {
      console.error('Erreur lors de la création de la permission:', error);
      
      if (error.response?.status === 403) {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour créer une permission');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Impossible de créer la permission');
    }
  },

  /**
   * Met à jour une permission existante
   */
  update: async (permissionId: number, permissionData: Partial<Permission>): Promise<Permission> => {
    try {
      const response = await ApiClient.put(`/permissions/${permissionId}`, permissionData);
      return response.data.permission;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour de la permission ${permissionId}:`, error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Impossible de mettre à jour la permission');
    }
  },

  /**
   * Supprime une permission
   */
  delete: async (permissionId: number): Promise<void> => {
    try {
      await ApiClient.delete(`/permissions/${permissionId}`);
    } catch (error: any) {
      console.error(`Erreur lors de la suppression de la permission ${permissionId}:`, error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Impossible de supprimer la permission');
    }
  }
};

export default permissionService;