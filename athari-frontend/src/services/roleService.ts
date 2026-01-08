import ApiClient from './api/ApiClient';

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];  // Noms des permissions
  created_at?: string;
  updated_at?: string;
}

// Interface pour la réponse de l'API
export interface ApiRoleResponse {
  id: number;
  name: string;
  description?: string;
  permissions?: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export const roleService = {
  /**
   * Récupère tous les rôles avec leurs permissions
   */
  getRoles: async (): Promise<Role[]> => {
    try {
      const response = await ApiClient.get('/roles');
      
      // Transformer la réponse de l'API pour extraire les noms des permissions
      const roles: Role[] = response.data.map((apiRole: ApiRoleResponse) => {
        // Extraire les noms des permissions
        const permissionNames = apiRole.permissions 
          ? apiRole.permissions.map(p => p.name)
          : [];
        
        return {
          id: apiRole.id,
          name: apiRole.name,
          description: apiRole.description,
          permissions: permissionNames,
          created_at: apiRole.created_at,
          updated_at: apiRole.updated_at
        };
      });
      
      return roles;
    } catch (error: any) {
      console.error('Erreur lors du chargement des rôles:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Impossible de charger les rôles');
    }
  },

  /**
   * Crée un nouveau rôle
   */
  createRole: async (roleData: { name: string; description?: string }): Promise<Role> => {
    try {
      const response = await ApiClient.post('/roles/creer', roleData);
      
      // Transformer la réponse
      const apiRole = response.data.role;
      const permissionNames = apiRole.permissions 
        ? apiRole.permissions.map((p: any) => p.name)
        : [];
      
      return {
        id: apiRole.id,
        name: apiRole.name,
        description: apiRole.description,
        permissions: permissionNames,
        created_at: apiRole.created_at,
        updated_at: apiRole.updated_at
      };
    } catch (error: any) {
      console.error('Erreur lors de la création du rôle:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Impossible de créer le rôle');
    }
  },

  /**
   * Met à jour un rôle existant
   */
  updateRole: async (roleId: number, roleData: Partial<Role>): Promise<Role> => {
    try {
      const response = await ApiClient.put(`/roles/${roleId}`, roleData);
      
      // Transformer la réponse
      const apiRole = response.data.role;
      const permissionNames = apiRole.permissions 
        ? apiRole.permissions.map((p: any) => p.name)
        : [];
      
      return {
        id: apiRole.id,
        name: apiRole.name,
        description: apiRole.description,
        permissions: permissionNames,
        created_at: apiRole.created_at,
        updated_at: apiRole.updated_at
      };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Impossible de mettre à jour le rôle');
    }
  },

  /**
   * Supprime un rôle
   */
  deleteRole: async (roleId: number): Promise<void> => {
    try {
      await ApiClient.delete(`/roles/${roleId}`);
    } catch (error: any) {
      console.error('Erreur lors de la suppression du rôle:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Impossible de supprimer le rôle');
    }
  },

  /**
   * Synchronise les permissions d'un rôle
   */
  syncRolePermissions: async (roleId: number, permissions: string[]): Promise<Role> => {
    try {
      const response = await ApiClient.post(`/roles/${roleId}/sync-permissions`, { 
        permissions 
      });
      
      // Transformer la réponse
      const apiRole = response.data;
      const permissionNames = apiRole.permissions 
        ? apiRole.permissions.map((p: any) => p.name)
        : [];
      
      return {
        id: apiRole.id,
        name: apiRole.name,
        description: apiRole.description,
        permissions: permissionNames,
        created_at: apiRole.created_at,
        updated_at: apiRole.updated_at
      };
    } catch (error: any) {
      console.error('Erreur lors de la synchronisation des permissions:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Impossible de synchroniser les permissions');
    }
  },

  /**
   * Attribue une permission à un rôle
   */
  assignPermissionToRole: async (roleId: number, permissionName: string): Promise<Role> => {
    try {
      // D'abord, récupérer le rôle actuel avec ses permissions
      const allRoles = await roleService.getRoles();
      const currentRole = allRoles.find(r => r.id === roleId);
      
      if (!currentRole) {
        throw new Error('Rôle non trouvé');
      }
      
      // Vérifier si la permission existe déjà
      const permissionExists = currentRole.permissions.some(
        p => p.toLowerCase() === permissionName.toLowerCase()
      );
      
      if (permissionExists) {
        return currentRole; // Permission déjà présente
      }
      
      // Ajouter la nouvelle permission
      const updatedPermissions = [...currentRole.permissions, permissionName];
      
      // Synchroniser toutes les permissions
      return await roleService.syncRolePermissions(roleId, updatedPermissions);
    } catch (error: any) {
      console.error('Erreur lors de l\'attribution de la permission au rôle:', error);
      throw error;
    }
  },

  /**
   * Retire une permission d'un rôle
   */
  revokePermissionFromRole: async (roleId: number, permissionName: string): Promise<Role> => {
    try {
      // D'abord, récupérer le rôle actuel avec ses permissions
      const allRoles = await roleService.getRoles();
      const currentRole = allRoles.find(r => r.id === roleId);
      
      if (!currentRole) {
        throw new Error('Rôle non trouvé');
      }
      
      // Filtrer la permission à retirer
      const updatedPermissions = currentRole.permissions.filter(
        p => p.toLowerCase() !== permissionName.toLowerCase()
      );
      
      // Synchroniser les permissions restantes
      return await roleService.syncRolePermissions(roleId, updatedPermissions);
    } catch (error: any) {
      console.error('Erreur lors du retrait de la permission du rôle:', error);
      throw error;
    }
  }
};

export default roleService;