import ApiClient from '../api/ApiClient';

export interface Gestionnaire {
  id: number;
  gestionnaire_code: string;
  gestionnaire_nom: string;
  gestionnaire_prenom: string;
  telephone: string | null;
  email: string | null;
  cni_recto: string | null;
  cni_verso: string | null;
  plan_localisation_domicile: string | null;
  ville: string | null;
  quartier: string | null;
  agence_id: number;
  etat: 'present' | 'supprime';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  // URLs pour les images
  cni_recto_url?: string | null;
  cni_verso_url?: string | null;
  plan_localisation_domicile_url?: string | null;
  
  // Relations
  agence?: {
    id: number;
    code: string;
    name: string;
    agency_name?: string;
  };
}

export interface CreateGestionnaireData {
  gestionnaire_code: string;
  gestionnaire_nom: string;
  gestionnaire_prenom: string;
  telephone?: string;
  email?: string;
  ville?: string;
  quartier?: string;
  agence_id: number;
  cni_recto?: File | null;
  cni_verso?: File | null;
  plan_localisation_domicile?: File | null;
}

export interface UpdateGestionnaireData {
  gestionnaire_code?: string;
  gestionnaire_nom?: string;
  gestionnaire_prenom?: string;
  telephone?: string;
  email?: string;
  ville?: string;
  quartier?: string;
  agence_id?: number;
  cni_recto?: File | null;
  cni_verso?: File | null;
  plan_localisation_domicile?: File | null;
}

export interface PaginatedResponse {
  success: boolean;
  data: Gestionnaire[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

class GestionnaireService {
  // Récupérer tous les gestionnaires avec pagination
  async getAllGestionnaires(page: number = 1, perPage: number = 20, search?: string, agenceId?: number): Promise<PaginatedResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (search) params.append('search', search);
    if (agenceId) params.append('agence_id', agenceId.toString());
    
    const response = await ApiClient.get(`/gestionnaires?${params}`);
    return response.data;
  }

  // Récupérer un gestionnaire par ID
  async getGestionnaireById(id: number): Promise<{ success: boolean; data: Gestionnaire }> {
    const response = await ApiClient.get(`/gestionnaires/${id}`);
    return response.data;
  }

  // Créer un nouveau gestionnaire
  async createGestionnaire(data: CreateGestionnaireData): Promise<{ success: boolean; data: Gestionnaire; message: string }> {
    const formData = new FormData();
    
    // Ajouter les champs texte
    formData.append('gestionnaire_code', data.gestionnaire_code);
    formData.append('gestionnaire_nom', data.gestionnaire_nom);
    formData.append('gestionnaire_prenom', data.gestionnaire_prenom);
    if (data.telephone) formData.append('telephone', data.telephone);
    if (data.email) formData.append('email', data.email);
    if (data.ville) formData.append('ville', data.ville);
    if (data.quartier) formData.append('quartier', data.quartier);
    formData.append('agence_id', data.agence_id.toString());
    
    // Ajouter les fichiers
    if (data.cni_recto) formData.append('cni_recto', data.cni_recto);
    if (data.cni_verso) formData.append('cni_verso', data.cni_verso);
    if (data.plan_localisation_domicile) formData.append('plan_localisation_domicile', data.plan_localisation_domicile);
    
    const response = await ApiClient.post('/gestionnaires', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Mettre à jour un gestionnaire
  async updateGestionnaire(id: number, data: UpdateGestionnaireData): Promise<{ success: boolean; data: Gestionnaire; message: string }> {
    const formData = new FormData();
    
    // Ajouter les champs texte
    if (data.gestionnaire_code) formData.append('gestionnaire_code', data.gestionnaire_code);
    if (data.gestionnaire_nom) formData.append('gestionnaire_nom', data.gestionnaire_nom);
    if (data.gestionnaire_prenom) formData.append('gestionnaire_prenom', data.gestionnaire_prenom);
    if (data.telephone !== undefined) formData.append('telephone', data.telephone || '');
    if (data.email !== undefined) formData.append('email', data.email || '');
    if (data.ville !== undefined) formData.append('ville', data.ville || '');
    if (data.quartier !== undefined) formData.append('quartier', data.quartier || '');
    if (data.agence_id) formData.append('agence_id', data.agence_id.toString());
    
    // Ajouter les fichiers
    if (data.cni_recto !== undefined) {
      if (data.cni_recto) {
        formData.append('cni_recto', data.cni_recto);
      } else {
        formData.append('cni_recto', ''); // Pour supprimer l'image existante
      }
    }
    
    if (data.cni_verso !== undefined) {
      if (data.cni_verso) {
        formData.append('cni_verso', data.cni_verso);
      } else {
        formData.append('cni_verso', '');
      }
    }
    
    if (data.plan_localisation_domicile !== undefined) {
      if (data.plan_localisation_domicile) {
        formData.append('plan_localisation_domicile', data.plan_localisation_domicile);
      } else {
        formData.append('plan_localisation_domicile', '');
      }
    }
    
    const response = await ApiClient.post(`/gestionnaires/${id}?_method=PUT`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Supprimer un gestionnaire (changer l'état à "supprime")
  async deleteGestionnaire(id: number): Promise<{ success: boolean; message: string }> {
    const response = await ApiClient.delete(`/gestionnaires/${id}`);
    return response.data;
  }

  // Récupérer les gestionnaires par agence
  async getGestionnairesByAgence(agenceId: number): Promise<{ success: boolean; data: Gestionnaire[] }> {
    const response = await ApiClient.get(`/gestionnaires/agence/${agenceId}`);
    return response.data;
  }

  // Récupérer les agences
  async getAllAgencies(): Promise<{ success: boolean; data: any[] }> {
    const response = await ApiClient.get('/agencies');
    return response.data;
  }
}

export const gestionnaireService = new GestionnaireService();
export default gestionnaireService;