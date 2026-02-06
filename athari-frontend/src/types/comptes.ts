export interface Account {
  id: string;
  accountNumber: string;
  clientInfo: ClientInfo;
  accountType: AccountType;
  mandataires: Mandataire[];
  documents: Document[];
  status: 'active' | 'inactive' | 'banned' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  birthPlace: string;
  address: string;
  nationality: string;
  profession: string;
}

export interface AccountType {
  category: 'courant' | 'epargne' | 'professionnel';
  options: AccountOption[];
}

export interface AccountOption {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

export interface Mandataire {
  id: string;
  sexe: 'feminin' | 'masculin';
  noms: string;
  prenoms: string;
  dateNaissance: string;
  lieuNaissance: string;
  telephone: string;
  adresse: string;
  nationalite: string;
  profession: string;
  nomJeuneFilleMere: string;
  numeroCNI: string;
  situationFamiliale: 'marié' | 'célibataire' | 'autres';
  nomConjoint?: string;
  dateNaissanceConjoint?: string;
  lieuNaissanceConjoint?: string;
  CNIConjoint?: string;
  signature?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'jpg' | 'pdf' | 'docx' | 'xlsx';
  file: File | string;
  uploadedAt: string;
}

// Type pour Compte (alias d'Account)
export type Compte = Account;

export interface TypeDeCompte {
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
}

export interface CreationCompte {
  client_id: number;
  type_compte_id: number;
  numero: string;
  statut?: string;
  duree_blocage_mois?: number | null;
}

export interface ModificationCompte extends CreationCompte {
  id: number;
}

export interface FlitrageCompte {
  search?: string;
  type_compte_id?: number;
  statut?: string;
  page?: number;
  per_page?: number;
}

export interface PaginationCompte {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface StatistiquesCompte {
  total_comptes: number;
  comptes_actifs: number;
  comptes_bloques: number;
  comptes_fermes: number;
}
