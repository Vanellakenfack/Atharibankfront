import ApiClient from './api/ApiClient';

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
  users_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const roleService = {
  getRoles: async (): Promise<Role[]> => {
    try {
      const response = await ApiClient.get('/roles');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  createRole: async (roleData: { name: string; description?: string }): Promise<Role> => {
    try {
      const response = await ApiClient.post('/roles/creer', roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  updateRole: async (roleId: number, roleData: Partial<Role>): Promise<Role> => {
    try {
      const response = await ApiClient.put(`/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  deleteRole: async (roleId: number): Promise<void> => {
    try {
      await ApiClient.delete(`/roles/${roleId}`);
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  },

  getPermissions: async (): Promise<string[]> => {
    try {
      const response = await ApiClient.get('/permissions');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  },

  syncRolePermissions: async (roleId: number, permissions: string[]): Promise<Role> => {
    try {
      const response = await ApiClient.post(`/roles/${roleId}/sync-permissions`, { permissions });
      return response.data;
    } catch (error) {
      console.error('Error syncing role permissions:', error);
      throw error;
    }
  }
};

export default roleService;