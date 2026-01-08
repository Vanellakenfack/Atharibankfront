/**
 * Types et interfaces pour la gestion des frais et des opérations MATA
 */

export interface TypeCompte {
  id: number;
  libelle: string;
  description?: string;
  est_mata?: boolean;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface FraisCommission {
  id: number;
  type_compte_id: number;
  typeCompte?: TypeCompte;
  frais_ouverture: number | null;
  frais_tenue_compte: number | null;
  commission_mouvement: number | null;
  commission_retrait: number | null;
  commission_sms: number | null;
  taux_interet_annuel: number | null;
  penalite_retrait_anticipe: number | null;
  minimum_compte: number | null;
  seuil_commission_mensuelle: number | null;
  commission_mensuelle_elevee: number | null;
  commission_mensuelle_basse: number | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface FraisApplication {
  id: number;
  compte_id: number;
  type_frais: 'OUVERTURE' | 'TENUE' | 'OPERATION' | string;
  montant: number;
  reference: string;
  description?: string;
  annule: boolean;
  date_application: string;
  created_at: string;
  updated_at: string;
  compte?: {
    id: number;
    numero_compte: string;
    client: {
      id: number;
      nom_complet: string;
    };
  };
}

export interface MouvementRubriqueMata {
  id: string;
  compte_id: number;
  rubrique: 'COTISATION' | 'EPARGNE' | 'AUTRE' | string;
  type_mouvement: 'CREDIT' | 'DEBIT';
  montant: number;
  solde_apres_operation: number;
  reference: string;
  description?: string;
  annule: boolean;
  date_operation: string;
  created_at: string;
  updated_at: string;
  compte?: {
    id: number;
    numero_compte: string;
    solde: number;
    type_compte: TypeCompte;
    client: {
      id: number;
      nom_complet: string;
    };
  };
}

export interface RecapitulatifMataData {
  compte: {
    id: number;
    numero_compte: string;
    solde: number;
    client: {
      id: number;
      nom_complet: string;
    };
  };
  total_cotisations: number;
  total_epargne: number;
  solde_total: number;
  nombre_cotisations: number;
  nombre_epargnes: number;
  derniere_cotisation: string | null;
  montant_derniere_cotisation: number | null;
  derniere_epargne: string | null;
  montant_derniere_epargne: number | null;
  derniers_mouvements: MouvementRubriqueMata[];
}

export interface StatistiquesMata {
  evolution_mensuelle: Array<{
    mois: string;
    annee: string;
    total_cotisations: number;
    total_epargne: number;
  }>;
  moyenne_mensuelle_cotisations: number;
  moyenne_mensuelle_epargne: number;
  evolution_cotisations: {
    variation: number;
    pourcentage: number;
  };
  evolution_epargne: {
    variation: number;
    pourcentage: number;
  };
  evolution_solde: {
    variation: number;
    pourcentage: number;
  };
}

// Types pour les formulaires
export interface FraisCommissionFormData {
  type_compte_id: string;
  frais_ouverture: string | number | null;
  frais_tenue_compte: string | number | null;
  commission_mouvement: string | number | null;
  commission_retrait: string | number | null;
  commission_sms: string | number | null;
  taux_interet_annuel: string | number | null;
  penalite_retrait_anticipe: string | number | null;
  minimum_compte: string | number | null;
  seuil_commission_mensuelle: string | number | null;
  commission_mensuelle_elevee: string | number | null;
  commission_mensuelle_basse: string | number | null;
  actif: boolean;
}

export interface MouvementMataFormData {
  rubrique: string;
  type_mouvement: 'CREDIT' | 'DEBIT';
  montant: number | string;
  description?: string;
  date_operation: string;
}
