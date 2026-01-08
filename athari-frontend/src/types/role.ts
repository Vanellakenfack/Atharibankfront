export interface PermissionCategory {
  id: string;
  name: string;
  permissions: string[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
  users_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RoleFormData {
  name: string;
  description?: string;
}