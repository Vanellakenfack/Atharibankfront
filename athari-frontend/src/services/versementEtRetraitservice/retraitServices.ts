import ApiClient from '../api/ApiClient';

export interface TiersData {
  nom_complet: string;
  type_piece: string;
  numero_piece: string;
  adresse?: string;
  date_delivrance_piece?: string;
  lieu_delivrance_piece?: string;
}

export interface RetraitData {
  // Données obligatoires
  compte_id: number;
  montant_brut: number;
  
  // Informations porteur
  tiers: TiersData;
  
  // Données de frais
  commissions?: number;
  taxes?: number;
  frais_en_compte?: boolean;
  
  // Contexte de l'opération
  motif?: string;
  ref_lettrage?: string;
  
  // Informations de localisation
  agence_code?: string;
  guichet_code?: string;
  caisse_code?: string;
  caisse_id?: number;
  guichet_id?: number;
}

export interface BilletageItem {
  valeur: number;
  quantite: number;
}

export interface RetraitResponse {
  success: boolean;
  message: string;
  data?: {
    reference: string;
    montant: number;
    guichet: string;
  };
  errors?: Record<string, string[]>;
  requires_validation?: boolean;
  demande_id?: number;
}

class RetraitService {
  /**
   * Effectuer un retrait espèces
   */
  async effectuerRetrait(data: RetraitData, billetage: BilletageItem[]): Promise<RetraitResponse> {
    try {
      const payload = {
        ...data,
        billetage,
        // Assurer que les champs nécessaires sont présents
        remettant_nom: data.tiers.nom_complet,
        remettant_type_piece: data.tiers.type_piece,
        remettant_numero_piece: data.tiers.numero_piece,
      };

      console.log('Payload retrait:', payload);
      
      const response = await ApiClient.post('/caisse/retrait', payload);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors du retrait:', error);
      
      if (error.response) {
        return error.response.data;
      }
      
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * Vérifier les plafonds avant retrait
   */
  async verifierPlafond(caisseId: number, montant: number) {
    try {
      const response = await ApiClient.post('/caisse/verifier-plafond', {
        caisse_id: caisseId,
        montant: montant,
        type_operation: 'RETRAIT'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur vérification plafond:', error);
      return { success: true, message: 'Vérification non disponible' };
    }
  }

  /**
   * Générer un reçu de retrait
   */
  async genererRecu(transactionId: number) {
    try {
      const response = await ApiClient.get(`/caisse/recu/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur génération reçu:', error);
      return { success: false, message: 'Erreur génération reçu' };
    }
  }

  /**
   * Obtenir le solde disponible d'un compte
   */
  async getSoldeCompte(compteId: number) {
    try {
      const response = await ApiClient.get(`/comptes/${compteId}/solde`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération solde:', error);
      return { success: false, solde: 0 };
    }
  }
}

export default new RetraitService();