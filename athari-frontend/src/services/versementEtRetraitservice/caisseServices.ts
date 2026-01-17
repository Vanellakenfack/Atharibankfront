import ApiClient from '../api/ApiClient';

interface BilletageItem {
  valeur: number;
  quantite: number;
}

interface TiersData {
  nom_complet: string;
  type_piece: string;
  numero_piece: string;
}

interface VersementData {
  compte_id: number;
  montant_brut: number;
  commissions?: number;
  taxes?: number;
  frais_en_compte?: boolean;
  origine_fonds?: string;
  numero_bordereau?: string; // NOUVEAU CHAMP
  type_bordereau?: string;   // NOUVEAU CHAMP
  date_valeur?: string;
  net_a_percevoir_payer?: number;
  tiers?: TiersData;
  agence_code?: string;
  guichet_code?: string;
  caisse_code?: string;
  caisse_id?: number;
  guichet_id?: number;
  type_versement?: string;
  ref_lettrage?: string;
  montant_net?: number;
  adresse_remettant?: string;
  date_delivrance_piece?: string;
  lieu_delivrance_piece?: string;
  // IMPORTANT: Ajouter remettant_nom pour Laravel
  remettant_nom?: string;
  remettant_type_piece?: string;
  remettant_numero_piece?: string;
  // NOUVEAU CHAMP : Provenance des fonds
  provenance_fonds?: string;
}

interface VersementResponse {
  success: boolean;
  message?: string;
  data?: {
    reference: string;
    montant_verse: number;
    frais_appliques: number;
    date_operation: string;
    caissier: string;
    agence_code: string;
  };
  requires_validation?: boolean;
  demande_id?: number;
  errors?: any;
}

const caisseServices = {
  async effectuerVersement(data: VersementData, billetage: BilletageItem[]): Promise<VersementResponse> {
    try {
      console.log('=== ENVOI VERSEMENT VERS BACKEND ===');
      
      // Récupérer les valeurs pour le remettant
      const nomRemettant = data.remettant_nom || data.tiers?.nom_complet || '';
      const typePiece = data.remettant_type_piece || data.tiers?.type_piece || 'CNI';
      const numeroPiece = data.remettant_numero_piece || data.tiers?.numero_piece || '';
      
      // Construire le payload selon ce qu'attend Laravel
      const payload = {
        // Données de base (obligatoires)
        compte_id: parseInt(data.compte_id.toString()),
        montant_brut: parseFloat(data.montant_brut.toString()),
        
        // IMPORTANT: Ce champ est requis par Laravel
        net_a_percevoir_payer: data.net_a_percevoir_payer || data.montant_net || 
          parseFloat(data.montant_brut.toString()) - 
          (parseFloat(data.commissions?.toString() || '0') + parseFloat(data.taxes?.toString() || '0')),
        
        // Données de frais (optionnelles mais avec valeurs par défaut)
        commissions: parseFloat(data.commissions?.toString() || '0'),
        taxes: parseFloat(data.taxes?.toString() || '0'),
        frais_en_compte: Boolean(data.frais_en_compte),
        
        // NOUVEAUX CHAMPS : Bordereau
        numero_bordereau: data.numero_bordereau || '',
        type_bordereau: data.type_bordereau || 'VERSEMENT',
        
        // NOUVEAU CHAMP : Provenance des fonds
        provenance_fonds: data.provenance_fonds || '',
        
        // Calcul des montants nets
        montant_net: data.montant_net || parseFloat(data.montant_brut.toString()) - 
          (parseFloat(data.commissions?.toString() || '0') + parseFloat(data.taxes?.toString() || '0')),
        
        // IMPORTANT: Structure "tiers" requise par Laravel
        tiers: {
          nom_complet: nomRemettant,
          type_piece: typePiece,
          numero_piece: numeroPiece,
        },
        
        // IMPORTANT: Ces champs sont aussi requis par Laravel
        remettant_nom: nomRemettant,
        remettant_type_piece: typePiece,
        remettant_numero_piece: numeroPiece,
        
        // Autres informations sur le remettant
        adresse_remettant: data.adresse_remettant || '',
        date_delivrance_piece: data.date_delivrance_piece || '',
        lieu_delivrance_piece: data.lieu_delivrance_piece || '',
        
        // Contexte de l'opération
        origine_fonds: data.origine_fonds || 'Versement espèces',
        type_versement: data.type_versement || 'ESPECE',
        date_valeur: data.date_valeur || new Date().toISOString().split('T')[0],
        ref_lettrage: data.ref_lettrage || '',
        
        // Informations de localisation (agence/guichet/caisse)
        agence_code: data.agence_code || '',
        guichet_code: data.guichet_code || '',
        caisse_code: data.caisse_code || '',
        caisse_id: data.caisse_id ? parseInt(data.caisse_id.toString()) : null,
        guichet_id: data.guichet_id ? parseInt(data.guichet_id.toString()) : null,
        
        // Billetage
        billetage: billetage
          .filter(item => item.quantite > 0)
          .map(item => ({
            valeur: item.valeur,
            quantite: item.quantite
          }))
      };
      
      console.log('URL de la requête:', '/caisse/versement');
      console.log('Payload Laravel:', JSON.stringify(payload, null, 2));
      console.log('Billetage:', payload.billetage);
      console.log('Provenance des fonds:', payload.provenance_fonds);
      
      // Vérifications de validation avant envoi
      if (!payload.compte_id || payload.compte_id <= 0) {
        console.error('Erreur: compte_id invalide');
        return {
          success: false,
          message: 'Compte ID invalide'
        };
      }
      
      if (!payload.montant_brut || payload.montant_brut <= 0) {
        console.error('Erreur: montant_brut invalide');
        return {
          success: false,
          message: 'Montant brut invalide'
        };
      }
      
      if (!payload.remettant_nom || !payload.remettant_numero_piece) {
        console.error('Erreur: informations remettant manquantes');
        return {
          success: false,
          message: 'Informations du remettant incomplètes'
        };
      }
      
      if (!payload.provenance_fonds) {
        console.error('Erreur: provenance des fonds manquante');
        return {
          success: false,
          message: 'La provenance des fonds est obligatoire'
        };
      }
      
      const response = await ApiClient.post('/caisse/versement', payload);
      
      console.log('=== RÉPONSE DU BACKEND ===');
      console.log('Status:', response.status);
      console.log('Données:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('=== ERREUR LORS DU VERSEMENT ===');
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Données d\'erreur:', error.response.data);
        console.error('Headers:', error.response.headers);
        
        // Formater les erreurs de validation Laravel
        let errorMessage = error.response.data?.message || `Erreur ${error.response.status}`;
        if (error.response.data?.errors) {
          const validationErrors = Object.entries(error.response.data.errors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('; ');
          errorMessage += ` | ${validationErrors}`;
        }
        
        return {
          success: false,
          message: errorMessage,
          errors: error.response.data?.errors
        };
      } else if (error.request) {
        console.error('Aucune réponse reçue:', error.request);
        console.error('URL tentée:', error.config?.url);
        console.error('URL complète tentée:', error.config?.baseURL + error.config?.url);
        return {
          success: false,
          message: 'Aucune réponse du serveur. Vérifiez votre connexion et l\'URL de l\'API.'
        };
      } else {
        console.error('Erreur de configuration:', error.message);
        return {
          success: false,
          message: `Erreur de configuration: ${error.message}`
        };
      }
    }
  },

  async getDemandesEnAttente() {
    try {
      const response = await ApiClient.get('/assistant/demandes-en-attente');
      console.log('Demandes en attente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération demandes:', error);
      return [];
    }
  },

  async approuverDemande(demandeId: number, codeValidation: string) {
    try {
      const response = await ApiClient.post(`/supervision-caisse/approuver/${demandeId}`, {
        code_validation: codeValidation
      });
      return response.data;
    } catch (error) {
      console.error('Erreur approbation:', error);
      throw error;
    }
  },

  async verifierPlafond(caisseId: number, montant: number) {
    try {
      const response = await ApiClient.post('/caisse/verifier-plafond', {
        caisse_id: caisseId,
        montant: montant
      });
      return response.data;
    } catch (error) {
      console.error('Erreur vérification plafond:', error);
      return { success: false, message: 'Erreur lors de la vérification du plafond' };
    }
  }
};

export default caisseServices;
export type { VersementData, BilletageItem, TiersData, VersementResponse };