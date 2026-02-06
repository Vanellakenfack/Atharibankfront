// Interface pour les données du compte
export interface CompteData {
  client: any;
  accountType: string;
  accountSubType: string;
  options: {
    montant: string;
    duree: string;
    module: string;
    chapitre_id: string;
    solde?: string;
    duree_blocage_mois?: string;
    devise?: string;
    categorie_id?: string;
  };
  gestionnaire?: {
    nom: string;
    prenom: string;
    code: string;
  };
  mandataire1: any;
  mandataire2: any;
  documents: {
    cni_client: File | null;
    autres_documents: File[];
  };
  engagementAccepted: boolean;
  clientSignature: File | null;
}
