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
  
  // Contexte de l'opération
  motif?: string;
  ref_lettrage?: string;
  
  // Informations de localisation
  agence_code?: string;
  guichet_code?: string;
  caisse_code?: string;
  caisse_id?: number;
  guichet_id?: number;
  
  // NOUVEAU: Code de validation (sera ajouté si nécessaire)
  code_validation?: string;
  
  // CORRECTION ICI: Ajouter les champs bordereau
  numero_bordereau?: string;
  type_bordereau?: string;
  
  // Ajouter les dates
  date_operation?: string;
  date_valeur?: string;
  date_indisponible?: string;
  
  // Champs pour la validation
  remettant_nom?: string;
  remettant_type_piece?: string;
  remettant_numero_piece?: string;
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
    transaction_id?: number;
  };
  errors?: Record<string, string[]>;
  requires_validation?: boolean;
  demande_id?: number;
  validation_code?: string;
}

class RetraitService {
  /**
   * Effectuer un retrait espèces
   */
  async effectuerRetrait(data: RetraitData, billetage: BilletageItem[]): Promise<RetraitResponse> {
    try {
      // CORRECTION ICI: Préparer le payload avec tous les champs nécessaires
      const payload = {
        // Données de base
        compte_id: data.compte_id,
        montant_brut: data.montant_brut,
        
        // Champs bordereau (CORRECTION)
        numero_bordereau: data.numero_bordereau || '',
        type_bordereau: data.type_bordereau || 'RETRAIT',
        
        // Données de frais
        commissions: data.commissions || 0,
        taxes: data.taxes || 0,
        
        // Données tiers/porteur
        tiers: {
          nom_complet: data.tiers.nom_complet,
          type_piece: data.tiers.type_piece,
          numero_piece: data.tiers.numero_piece,
          adresse: data.tiers.adresse || '',
          date_delivrance_piece: data.tiers.date_delivrance_piece || '',
          lieu_delivrance_piece: data.tiers.lieu_delivrance_piece || '',
        },
        
        // Champs requis pour Laravel (compatibilité backend)
        remettant_nom: data.tiers.nom_complet,
        remettant_type_piece: data.tiers.type_piece,
        remettant_numero_piece: data.tiers.numero_piece,
        
        // Contexte de l'opération
        motif: data.motif || 'Retrait espèces',
        ref_lettrage: data.ref_lettrage || '',
        
        // Informations de localisation
        agence_code: data.agence_code || '',
        guichet_code: data.guichet_code || '',
        caisse_code: data.caisse_code || '',
        caisse_id: data.caisse_id || null,
        guichet_id: data.guichet_id || null,
        
        // Dates
        date_operation: data.date_operation || new Date().toISOString().split('T')[0],
        date_valeur: data.date_valeur || new Date().toISOString().split('T')[0],
        date_indisponible: data.date_indisponible || '',
        
        // Code de validation (si fourni)
        code_validation: data.code_validation || null,
        
        // Billetage
        billetage: billetage
          .filter(item => item.quantite > 0)
          .map(item => ({
            valeur: item.valeur,
            quantite: item.quantite
          }))
      };

      console.log('=== PAYLOAD RETRAIT COMPLET ===');
      console.log('Payload:', JSON.stringify(payload, null, 2));
      
      const response = await ApiClient.post('/caisse/retrait', payload);
      
      // Si la réponse indique qu'une validation est requise
      if (response.data?.requires_validation) {
        return {
          success: false,
          requires_validation: true,
          demande_id: response.data.demande_id,
          message: response.data.message || 'Validation requise par l\'assistant comptable'
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors du retrait:', error);
      
      if (error.response) {
        // Gérer spécifiquement le cas de validation requise
        if (error.response.status === 202 && error.response.data?.requires_validation) {
          return {
            success: false,
            requires_validation: true,
            demande_id: error.response.data.demande_id,
            message: error.response.data.message || 'Validation requise'
          };
        }
        
        // Log des erreurs détaillées
        console.error('Erreur backend:', {
          status: error.response.status,
          data: error.response.data,
          errors: error.response.data?.errors
        });
        
        return error.response.data;
      }
      
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  /**
   * SIMPLIFIÉ: Vérifier localement le code (sans appel API)
   */
  verifierCodeValidationLocal(code: string): { valid: boolean; message: string } {
    // Validation simple: code doit être 6 caractères alphanumériques
    if (!code || code.trim() === '') {
      return { valid: false, message: 'Le code ne peut pas être vide' };
    }
    
    if (code.length !== 6) {
      return { valid: false, message: 'Le code doit contenir exactement 6 caractères' };
    }
    
    const regex = /^[A-Z0-9]{6}$/;
    if (!regex.test(code)) {
      return { valid: false, message: 'Code invalide. Utilisez seulement des lettres majuscules et chiffres' };
    }
    
    return { valid: true, message: 'Code validé localement' };
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
      const response = await ApiClient.get(`/caisse/recu/${transactionId}`, {
        responseType: 'blob'
      });
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

  /**
   * Sauvegarder un code de validation dans le localStorage
   */
  static saveValidationCodeToStorage(demandeId: number, code: string): void {
    try {
      const codes = JSON.parse(localStorage.getItem('validation_codes') || '{}');
      codes[demandeId] = {
        code,
        demandeId,
        date: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      };
      localStorage.setItem('validation_codes', JSON.stringify(codes));
    } catch (error) {
      console.error('Erreur sauvegarde localStorage:', error);
    }
  }

  /**
   * Supprimer un code de validation du localStorage
   */
  static removeValidationCodeFromStorage(demandeId: number): void {
    try {
      const codes = JSON.parse(localStorage.getItem('validation_codes') || '{}');
      delete codes[demandeId];
      localStorage.setItem('validation_codes', JSON.stringify(codes));
    } catch (error) {
      console.error('Erreur suppression localStorage:', error);
    }
  }
}

// Créer une instance par défaut
const retraitServiceInstance = new RetraitService();

// Exporter l'instance par défaut
export default retraitServiceInstance;

// Exporter la classe nommée
export { RetraitService };