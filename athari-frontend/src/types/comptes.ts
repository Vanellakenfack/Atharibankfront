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
