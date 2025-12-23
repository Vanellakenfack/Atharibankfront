import { api } from './clientApi';

interface Compte {
  id: number;
  numero_compte: string;
  solde: number;
  solde_disponible: number;
  solde_bloque: number;
  devise: string;
  statut: 'actif' | 'inactif' | 'cloture';
  type_compte: {
    id: number;
    libelle: string;
  };
  client: {
    id: number;
    nom: string;
    prenom: string;
  };
  created_at: string;
  updated_at: string;
}

export const compteService = {
  /**
   * Récupérer tous les comptes
   */
  async getComptes(params: Record<string, any> = {}): Promise<Compte[]> {
    try {
      const response = await api.get('/comptes', { params });
      console.log('Réponse complète de l\'API (compteService):', response);
      
      // Gérer différents formats de réponse
      if (response && response.data) {
        // Si la réponse est déjà un tableau
        if (Array.isArray(response.data)) {
          return response.data;
        }
        // Si la réponse a une propriété data qui est un tableau
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Si la réponse a une propriété data qui est un objet avec une propriété data qui est un tableau
        if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          return response.data.data.data;
        }
      }
      
      console.warn('Format de réponse inattendu, retourne un tableau vide');
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes:', error);
      // En cas d'erreur, on retourne un tableau vide au lieu de lancer une erreur
      // pour éviter de bloquer l'interface utilisateur
      return [];
    }
  },

  /**
   * Récupérer un compte par son ID
   */
  async getCompteById(id: number): Promise<Compte> {
    try {
      const response = await api.get(`/comptes/${id}`);
      console.log('Réponse getCompteById:', response);
      
      // Gérer différents formats de réponse
      if (response && response.data) {
        // Si data contient directement les propriétés du compte
        if (response.data.id && response.data.numero_compte) {
          return response.data;
        }
        // Si data contient une propriété data avec les informations du compte
        if (response.data.data && response.data.data.id) {
          return response.data.data;
        }
      }
      
      throw new Error('Format de réponse inattendu pour le détail du compte');
    } catch (error) {
      console.error(`Erreur lors de la récupération du compte ${id}:`, error);
      // Créer un compte vide avec l'ID demandé pour éviter les erreurs dans l'interface
      return {
        id,
        numero_compte: `COMPTE-${id}`,
        solde: 0,
        solde_disponible: 0,
        solde_bloque: 0,
        devise: 'XOF',
        statut: 'inactif',
        type_compte: { id: 0, libelle: 'Inconnu' },
        client: { id: 0, nom: 'Inconnu', prenom: '' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  },

  /**
   * Mettre à jour un compte
   */
  async updateCompte(id: number, data: Partial<Compte>): Promise<Compte> {
    try {
      const response = await api.put(`/comptes/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du compte ${id}:`, error);
      throw new Error('Échec de la mise à jour du compte. Veuillez vérifier les données.');
    }
  },

  /**
   * Changer le statut d'un compte
   */
  async toggleStatus(id: number): Promise<Compte> {
    try {
      // Récupérer le compte actuel
      const currentAccount = await this.getCompteById(id);
      
      // Inverser le statut
      const newStatus = currentAccount.statut === 'actif' ? 'inactif' : 'actif';
      
      // Mettre à jour le statut
      return await this.updateCompte(id, { statut: newStatus });
    } catch (error) {
      console.error(`Erreur lors du changement de statut du compte ${id}:`, error);
      throw new Error('Impossible de modifier le statut du compte. Veuillez réessayer.');
    }
  },

  /**
   * Créer un nouveau compte
   */
  async createCompte(data: Omit<Compte, 'id' | 'created_at' | 'updated_at'>): Promise<Compte> {
    try {
      const response = await api.post('/comptes', data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      throw new Error('Échec de la création du compte. Veuillez vérifier les données.');
    }
  }
};

export default compteService;
