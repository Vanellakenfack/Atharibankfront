import { api } from './clientApi';

interface Compte {
  id: number;
  numero_compte: string;
  client_id: number;
  type_compte_id: number;
  chapitre_comptable_id: number | null;
  plan_comptable_id: number | null;
  solde: number | string;
  solde_disponible: number | string;
  solde_bloque: number | string;
  devise: string;
  gestionnaire_nom: string;
  gestionnaire_prenom: string;
  gestionnaire_code: string;
  rubriques_mata: Record<string, any> | null;
  duree_blocage_mois: number | null;
  statut: 'actif' | 'inactif' | 'cloture' | 'suspendu';
  notice_acceptee: boolean;
  date_acceptation_notice: string | null;
  signature_path: string | null;
  date_ouverture: string;
  date_cloture: string | null;
  observations: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  type_compte: {
    id: number;
    code: string;
    libelle: string;
    description: string;
    est_mata: boolean;
    necessite_duree: boolean;
    est_islamique: boolean;
    actif: boolean;
    created_at: string;
    updated_at: string;
  };
  client: {
    id: number;
    num_client: string;
    type_client: string;
    nom: string;
    prenom: string;
    telephone: string;
    email: string | null;
    adresse_ville: string;
    adresse_quartier: string;
    bp: string;
    pays_residence: string;
    created_at: string;
    updated_at: string;
  };
  plan_comptable?: {
    id: number;
    code: string;
    libelle: string;
    categorie_id?: number;
    nature_solde?: string;
  };
  mandataires?: Array<{
    id: number;
    nom: string;
    prenom: string;
    relation: string;
  }>;
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
      // Extraire uniquement les champs autorisés pour la mise à jour
      const { 
        devise, 
        statut, 
        gestionnaire_nom = '', 
        gestionnaire_prenom = '', 
        gestionnaire_code = '',
        rubriques_mata,
        duree_blocage_mois,
        observations
      } = data;

      // Validation et formatage des données
      const devisesValides = ['FCFA', 'EURO', 'DOLLAR', 'POUND'];
      
      // Vérification de la devise (insensible à la casse)
      if (devise) {
        const deviseNormalisee = devise.toUpperCase();
        if (!devisesValides.includes(deviseNormalisee)) {
          throw new Error(`Devise non valide. Les valeurs acceptées sont : ${devisesValides.join(', ')}`);
        }
        // S'assurer que la devise est en majuscules pour l'envoi au serveur
        data.devise = deviseNormalisee;
      }

      // Formatage de rubriques_mata
      let rubriquesMataFormatees = rubriques_mata;
      if (rubriques_mata) {
        // Si c'est une chaîne, convertir en tableau
        if (typeof rubriques_mata === 'string') {
          rubriquesMataFormatees = [rubriques_mata];
        }
        // S'assurer que c'est un tableau
        if (!Array.isArray(rubriquesMataFormatees)) {
          rubriquesMataFormatees = [];
        }
        // Filtrer les valeurs non valides
        const rubriquesValides = ['SANTE', 'BUSINESS', 'FETE', 'FOURNITURE', 'IMMO', 'SCOLARITE'];
        rubriquesMataFormatees = rubriquesMataFormatees.filter((r: string) => rubriquesValides.includes(r));
      }

      // Validation de la durée de blocage
      let dureeFormatee: number | undefined = undefined;
      
      if (duree_blocage_mois !== null && duree_blocage_mois !== undefined && duree_blocage_mois !== '') {
        // Convertir en nombre entier
        const dureeNum = typeof duree_blocage_mois === 'string' 
          ? parseInt(duree_blocage_mois, 10)
          : Math.floor(Number(duree_blocage_mois));
        
        // Valider que c'est bien un nombre valide
        if (!isNaN(dureeNum)) {
          dureeFormatee = dureeNum;
          
          // Valider la plage
          if (dureeFormatee < 3 || dureeFormatee > 12) {
            throw new Error('La durée de blocage doit être un nombre entier entre 3 et 12 mois');
          }
        }
      }

      const payload: any = {
        ...(devise && { devise: devise.toUpperCase() }),
        ...(statut && { statut }),
        ...(gestionnaire_nom && { gestionnaire_nom }),
        ...(gestionnaire_prenom && { gestionnaire_prenom }),
        ...(gestionnaire_code && { gestionnaire_code }),
        ...(rubriquesMataFormatees && { rubriques_mata: rubriquesMataFormatees }),
        ...(dureeFormatee !== undefined ? { duree_blocage_mois: dureeFormatee } : {}),
        ...(observations !== undefined && { observations })
      };

      const response = await api.put(`/comptes/${id}`, payload);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour du compte ${id}:`, error);
      
      // Afficher plus de détails sur l'erreur
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
        
        // Si l'API renvoie des messages d'erreur de validation, les inclure dans le message d'erreur
        if (error.response.status === 422 && error.response.data.errors) {
          const validationErrors = Object.values(error.response.data.errors).flat().join('\n');
          throw new Error(`Erreur de validation :\n${validationErrors}`);
        }
      }
      
      throw new Error(error.response?.data?.message || 'Échec de la mise à jour du compte. Veuillez vérifier les données.');
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
      
      // Préparer les données à mettre à jour en incluant la durée de blocage actuelle
      const updateData: any = { statut: newStatus };
      
      // Si le compte a une durée de blocage, l'inclure dans la mise à jour
      if (currentAccount.duree_blocage_mois !== null && currentAccount.duree_blocage_mois !== undefined) {
        updateData.duree_blocage_mois = currentAccount.duree_blocage_mois;
      }
      
      // Mettre à jour le compte avec le nouveau statut et la durée de blocage actuelle
      return await this.updateCompte(id, updateData);
    } catch (error: any) {
      console.error(`Erreur lors du changement de statut du compte ${id}:`, error);
      
      // Gestion des erreurs avec vérification de type sécurisée
      if (error?.response?.data?.errors) {
        const validationErrors = Object.values(error.response.data.errors).flat().join('\n');
        throw new Error(`Erreur de validation :\n${validationErrors}`);
      }
      
      const errorMessage = error?.response?.data?.message || 'Impossible de modifier le statut du compte. Veuillez réessayer.';
      throw new Error(errorMessage);
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
