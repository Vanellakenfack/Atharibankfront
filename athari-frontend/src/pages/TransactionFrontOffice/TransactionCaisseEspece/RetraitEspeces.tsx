import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  styled,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Autocomplete,
  CircularProgress,
  TableHead,
  IconButton,
  InputAdornment,
  Avatar,
  Divider,
  Radio,
  RadioGroup,
  FormLabel,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Person,
  Photo,
  AttachMoney,
  Description,
  Add as AddIcon,
  Remove as RemoveIcon,
  Calculate as CalculateIcon,
  Warning,
  Key,
  Lock,
  Portrait,
  Fingerprint,
  AlternateEmail,
  Phone,
  AccountBalance,
  AccountBalanceWallet,
  Print,
  Download,
  CloudUpload,
  CloudDownload,
  Badge,
} from '@mui/icons-material';

import logo from '../../../assets/img/logo.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import Sidebar from '../../../components/layout/Sidebar';
import TopBar from '../../../components/layout/TopBar';

import retraitService, { 
  RetraitService,
  type BilletageItem, 
  type RetraitData, 
  type TiersData 
} from '../../../services/versementEtRetraitservice/retraitServices'; 
import compteService from '../../../services/api/compteService';
import agenceService, { type Agence as AgenceApi } from '../../../services/agenceService';
import guichetService from '../../../services/guichetService';
import caisseService from '../../../services/caisseService';
import ApiClient from '../../../services/api/ApiClient';

// --- INTERFACES AJOUTÉES POUR LA VALIDATION ---
interface DemandeValidationData {
  compte_id: number;
  montant: number;
  motif?: string;
  caisse_id: number;
  agence_id: number;
  guichet_id: number;
}

interface ValidationResponse {
  success: boolean;
  demande_id: number;
  message: string;
  code_expiration?: string;
}

interface VerificationResponse {
  valid: boolean;
  message: string;
  demande_id?: number;
}

// --- INTERFACES EXISTANTES ---
interface Guichet {
  id: number;
  agence_id: number;
  code_guichet: string;
  nom_guichet: string;
  est_actif: number;
  created_at: string;
  updated_at: string;
}

interface Caisse {
  id: number;
  guichet_id: number;
  code_caisse: string;
  libelle: string;
  solde_actuel: string;
  plafond_max: string | null;
  est_active: boolean;
  created_at: string;
  updated_at: string;
  compte_comptable_id: number;
  plafond_autonomie_caissiere: string;
}

interface ClientPhysique {
  id: number;
  client_id: number;
  nom_prenoms: string;
  sexe: string;
  date_naissance: string;
  lieu_naissance?: string;
  cni_numero?: string;
  cni_delivrance?: string;
  cni_expiration?: string;
  profession?: string;
  nom_pere?: string;
  nom_mere?: string;
  nationalite?: string;
  photo?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

interface ClientMorale {
  id: number;
  client_id: number;
  raison_sociale: string;
  sigle?: string;
  forme_juridique?: string;
  activite_principale?: string;
  capital_social?: string;
  registre_commerce?: string;
  numero_contribuable?: string;
  nom_representant?: string;
  qualite_representant?: string;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: number;
  nom_complet: string;
  type_client: string;
  telephone?: string;
  email?: string;
  physique?: ClientPhysique;
  morale?: ClientMorale;
  adresse_quartier?: string;
  adresse_ville?: string;
  pays_residence?: string;
}

interface Mandataire {
  id: number;
  adresse?: string;
  cni_conjoint?: string | null;
  compte_id: number;
  created_at: string;
  date_naissance: string;
  date_naissance_conjoint?: string | null;
  lieu_naissance: string;
  lieu_naissance_conjoint?: string | null;
  nationalite: string;
  nom: string;
  nom_conjoint?: string | null;
  nom_jeune_fille_mere: string;
  numero_cni: string;
  ordre: number;
  prenom: string;
  profession: string;
  sexe: string;
  signature_path?: string | null;
  situation_familiale: string;
  telephone: string;
  updated_at: string;
  type_piece?: string;
  numero_piece?: string;
  signature_url?: string;
  photo?: string;
  photo_url?: string;
  date_delivrance_piece?: string;
  lieu_delivrance_piece?: string;
}

interface ReceiptData {
  reference: string;
  date: string;
  compte: string;
  titulaire: string;
  porteur: string;
  pieceId: string;
  montant: string;
  caissierId: string;
  typeOperation: 'RETRAIT' | 'VERSEMENT';
  agence?: string;
  guichet?: string;
  motif?: string;
  billetage?: BilletageItem[];
}

interface SuccessModalData {
  open: boolean;
  transactionData?: ReceiptData;
}

interface PlanComptable {
  id: number;
  code: string;
  libelle: string;
  categorie_id: number;
  nature_solde: string;
}

interface Compte {
  id: number;
  numero_compte: string;
  solde: string;
  client_id: number;
  client: Client;
  plan_comptable_id: number;
  plan_comptable: PlanComptable;
  signature_path?: string;
  mandataires?: Mandataire[];
  type_compte?: {
    code_chapitre?: string;
    nom?: string;
  };
}

interface RetraitFormData {
  agenceCode: string;
  selectedAgence: string;
  guichet: string;
  caisse: string;
  typeRetrait: string;
  compte: string;
  compte_id: number | null;
  chapitre: string;
  client: string;
  motif: string;
  dateOperation: string;
  dateValeur: string;
  smsEnabled: boolean;
  telephone: string;
  fraisEnCompte: boolean;
  montant: string;
  commissions: string;
  taxes: string;
  refLettrage: string;
  numero_bordereau: string;
  type_bordereau: string;
  typePorteur: 'client' | 'mandataire' | 'autre';
  selectedMandataireId: string;
  nomPorteur: string;
  adresse: string;
  typeId: string;
  numeroId: string;
  delivreLe: string;
  delivreA: string;
  soldeComptable: string;
  indisponible: string;
  netAEncaisser: string;
  netADebiter: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// --- COMPOSANTS STYLISÉS ---
const StyledTabs = styled(Tabs)({
  '& .MuiTab-root': {
    minHeight: 48,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  '& .Mui-selected': {
    color: '#1976D2',
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#1976D2',
    height: 3,
  },
});

const StyledCard = styled(Card)({
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  transition: 'box-shadow 0.2s',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
});

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  borderRadius: 6,
  padding: '8px 12px',
  border: '1px solid #dee2e6',
  fontSize: '0.875rem',
}));

const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
  color: 'white',
  fontWeight: 600,
  padding: '8px 24px',
  borderRadius: 6,
  '&:hover': {
    background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #BDBDBD 0%, #9E9E9E 100%)',
  },
});

const SecondaryButton = styled(Button)({
  backgroundColor: '#f5f5f5',
  color: '#424242',
  fontWeight: 500,
  padding: '8px 20px',
  borderRadius: 6,
  border: '1px solid #e0e0e0',
  '&:hover': {
    backgroundColor: '#eeeeee',
    border: '1px solid #bdbdbd',
  },
});

const ValidationCodeInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '0.5em',
    textAlign: 'center',
  },
});

const StyledAvatar = styled(Avatar)({
  width: 120,
  height: 120,
  border: '3px solid #e0e0e0',
});

const SignatureContainer = styled(Box)({
  border: '1px solid #ddd',
  borderRadius: 4,
  padding: 10,
  backgroundColor: '#f9f9f9',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 100,
});

const API_BASE_URL = ApiClient;

// --- FONCTIONS UTILITAIRES ---
const formatCurrency = (value: string) => {
  const num = parseFloat(value || '0');
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const generateReference = (type: 'RET' | 'VER' = 'RET'): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${type}-${year}${month}${day}${hours}${minutes}${seconds}-${randomId}`;
};

const numberToFrenchWords = (num: number): string => {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
  
  if (num === 0) return 'zéro';
  
  let result = '';
  
  if (num >= 1000000) {
    const millions = Math.floor(num / 1000000);
    result += numberToFrenchWords(millions) + ' million';
    if (millions > 1) result += 's';
    num %= 1000000;
    if (num > 0) result += ' ';
  }
  
  if (num >= 1000) {
    const thousands = Math.floor(num / 1000);
    if (thousands === 1) {
      result += 'mille';
    } else {
      result += numberToFrenchWords(thousands) + ' mille';
    }
    num %= 1000;
    if (num > 0) result += ' ';
  }
  
  if (num >= 100) {
    const hundreds = Math.floor(num / 100);
    if (hundreds === 1) {
      result += 'cent';
    } else {
      result += units[hundreds] + ' cent';
    }
    num %= 100;
    if (num > 0) result += ' ';
  }
  
  if (num >= 10) {
    if (num >= 10 && num < 20) {
      result += teens[num - 10];
      num = 0;
    } else {
      const ten = Math.floor(num / 10);
      const unit = num % 10;
      
      if (ten === 7 || ten === 9) {
        const base = ten === 7 ? 60 : 80;
        const remainder = num - base;
        if (remainder === 0) {
          result += tens[ten];
        } else if (remainder === 1) {
          result += tens[ten] + '-et-un';
        } else if (remainder < 10) {
          result += tens[ten] + '-' + units[remainder];
        } else {
          result += tens[ten] + '-' + teens[remainder - 10];
        }
        num = 0;
      } else {
        result += tens[ten];
        if (unit === 1 && ten !== 8) {
          result += '-et-un';
          num = 0;
        } else if (unit > 0) {
          result += '-' + units[unit];
          num = 0;
        }
      }
    }
  }
  
  if (num > 0) {
    result += units[num];
  }
  
  return result;
};

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`retrait-tabpanel-${index}`}
      aria-labelledby={`retrait-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const RetraitEspeces: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [tabValue, setTabValue] = useState<number>(0);
  const [agences, setAgences] = useState<AgenceApi[]>([]);
  const [guichets, setGuichets] = useState<Guichet[]>([]);
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingGuichets, setLoadingGuichets] = useState<boolean>(false);
  const [loadingCaisses, setLoadingCaisses] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [validationDialog, setValidationDialog] = useState<boolean>(false);
  const [validationData, setValidationData] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'warning' | 'info' 
  });
  
  // NOUVEAUX ÉTATS
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'validating' | 'success' | 'error'>('idle');
  const [backendMessage, setBackendMessage] = useState<string>('');
  const [backendError, setBackendError] = useState<string>('');
  const [validationRequired, setValidationRequired] = useState<boolean>(false);
  const [needsSupervisorValidation, setNeedsSupervisorValidation] = useState<boolean>(false);

  // États pour les comptes
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [loadingComptes, setLoadingComptes] = useState<boolean>(false);
  const [compteDetails, setCompteDetails] = useState<Compte | null>(null);
  
  // États pour le billetage
  const [billetage, setBilletage] = useState<BilletageItem[]>([
    { valeur: 10000, quantite: 0 },
    { valeur: 5000, quantite: 0 },
    { valeur: 2000, quantite: 0 },
    { valeur: 1000, quantite: 0 },
    { valeur: 500, quantite: 0 },
    { valeur: 200, quantite: 0 },
    { valeur: 100, quantite: 0 },
  ]);
  
  const [calculating, setCalculating] = useState<boolean>(false);
  
  // États pour la validation
  const [validationCode, setValidationCode] = useState<string>('');
  const [showValidationInput, setShowValidationInput] = useState<boolean>(false);
  const [pendingDemandeId, setPendingDemandeId] = useState<number | null>(null);
  const [isCodeValid, setIsCodeValid] = useState<boolean>(false);
  const [codeValidationError, setCodeValidationError] = useState<string>('');
  
  // États pour la photo/signature
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [signatureUrl, setSignatureUrl] = useState<string>('');

  const [successModal, setSuccessModal] = useState<SuccessModalData>({
    open: false,
    transactionData: undefined,
  });

  const [downloading, setDownloading] = useState<boolean>(false);
  const [lastSuccessfulTransaction, setLastSuccessfulTransaction] = useState<ReceiptData | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [clientRealCni, setClientRealCni] = useState<string>('');
  const [cniValidationError, setCniValidationError] = useState<string>('');

  // Initialisation avec RetraitFormData
  const [formData, setFormData] = useState<RetraitFormData>({
    agenceCode: '',
    selectedAgence: '',
    guichet: '',
    caisse: '',
    typeRetrait: '01',
    compte: '',
    compte_id: null,
    chapitre: '',
    client: '',
    motif: '',
    dateOperation: new Date().toISOString().split('T')[0],
    dateValeur: new Date().toISOString().split('T')[0],
    smsEnabled: false,
    telephone: '',
    fraisEnCompte: true,
    montant: '',
    commissions: '0',
    taxes: '0',
    refLettrage: '',
    numero_bordereau: '',
    type_bordereau: 'RETRAIT',
    typePorteur: 'client',
    selectedMandataireId: '',
    nomPorteur: '',
    adresse: '',
    typeId: 'CNI',
    numeroId: '',
    delivreLe: '',
    delivreA: '',
    soldeComptable: '0',
    indisponible: '0',
    netAEncaisser: '0',
    netADebiter: '0',
  });

  // --- NOUVELLES FONCTIONS API POUR LA VALIDATION ---

  /**
   * Route 1: Demander une validation au backend
   * POST /retraits/demandes-validation
   */
  const demanderValidation = async (data: DemandeValidationData): Promise<ValidationResponse> => {
    try {
      const response = await ApiClient.post('/retraits/demandes-validation', data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur demande validation:', error);
      throw error;
    }
  };

  /**
   * Route 2: Vérifier un code de validation
   * POST /retraits/demandes-validation/{id}/verifier
   */
  const verifierCodeValidation = async (demandeId: number, code: string): Promise<VerificationResponse> => {
    try {
      const response = await ApiClient.post(`/retraits/demandes-validation/${demandeId}/verifier`, { code });
      return response.data;
    } catch (error: any) {
      console.error('Erreur vérification code:', error);
      throw error;
    }
  };

  // FONCTIONS DE VÉRIFICATION DES PLAFONDS
  const checkPlafondCaissiere = (): { ok: boolean; message: string } => {
    if (!formData.selectedAgence || !formData.guichet || !formData.caisse) {
      return { ok: false, message: 'Veuillez sélectionner une agence, un guichet et une caisse' };
    }
    
    const selectedCaisse = caisses.find(c => c.id.toString() === formData.caisse);
    if (!selectedCaisse) {
      return { ok: false, message: 'Caisse non trouvée' };
    }
    
    const montant = parseFloat(formData.montant) || 0;
    const plafondCaissiere = parseFloat(selectedCaisse.plafond_autonomie_caissiere) || 0;
    
    if (montant > plafondCaissiere) {
      const message = `Le montant (${formatCurrency(formData.montant)} FCFA) dépasse votre plafond d'autonomie (${formatCurrency(plafondCaissiere.toString())} FCFA). Validation requise par l'assistant comptable.`;
      console.log('Plafond dépassé:', message);
      return { ok: false, message };
    }
    
    return { ok: true, message: 'Plafond respecté' };
  };

  const checkSoldeCaisse = (): { ok: boolean; message: string } => {
    const selectedCaisse = caisses.find(c => c.id.toString() === formData.caisse);
    if (!selectedCaisse) {
      return { ok: false, message: 'Caisse non trouvée' };
    }
    
    const montant = parseFloat(formData.montant) || 0;
    const soldeCaisse = parseFloat(selectedCaisse.solde_actuel) || 0;
    
    if (montant > soldeCaisse) {
      const message = `Solde caisse insuffisant. Disponible: ${formatCurrency(soldeCaisse.toString())} FCFA, Montant demandé: ${formatCurrency(formData.montant)} FCFA`;
      return { ok: false, message };
    }
    
    return { ok: true, message: 'Solde caisse suffisant' };
  };

  const checkSoldeCompte = (): { ok: boolean; message: string } => {
    const soldeCompte = parseFloat(formData.soldeComptable) || 0;
    const montantTotal = parseFloat(formData.netADebiter) || 0;
    
    if (montantTotal > soldeCompte) {
      const message = `Solde compte insuffisant. Disponible: ${formatCurrency(soldeCompte.toString())} FCFA, Montant à débiter: ${formatCurrency(montantTotal.toString())} FCFA`;
      return { ok: false, message };
    }
    
    return { ok: true, message: 'Solde compte suffisant' };
  };

  // Préparer les données du reçu
  const prepareReceiptData = (): ReceiptData => {
    const selectedAgence = agences.find(a => a.id.toString() === formData.selectedAgence);
    const selectedGuichet = guichets.find(g => g.id.toString() === formData.guichet);
    const caissierId = "Caissier";
    
    return {
      reference: generateReference('RET'),
      date: formatDateTime(new Date().toISOString()),
      compte: formData.compte,
      titulaire: formData.client,
      porteur: formData.nomPorteur,
      pieceId: `${formData.typeId} - ${formData.numeroId}`,
      montant: formData.montant,
      caissierId: caissierId,
      typeOperation: 'RETRAIT' as const,
      agence: selectedAgence?.name,
      guichet: selectedGuichet?.nom_guichet,
      motif: formData.motif,
      billetage: billetage.filter(item => item.quantite > 0),
    };
  };

  // Générer le reçu PDF
  const generateAndDownloadReceipt = async (receiptData: ReceiptData) => {
    try {
      setDownloading(true);
      
      const receiptElement = document.createElement('div');
      receiptElement.style.position = 'absolute';
      receiptElement.style.left = '-9999px';
      receiptElement.style.top = '0';
      receiptElement.style.width = '150mm';
      receiptElement.style.minHeight = 'auto';
      receiptElement.style.maxWidth = '150mm';
      receiptElement.style.backgroundColor = 'white';
      receiptElement.style.padding = '5mm';
      receiptElement.style.fontFamily = "'Courier New', monospace";
      receiptElement.style.color = '#000';
      receiptElement.style.fontSize = '9px';
      receiptElement.style.lineHeight = '1.1';
      receiptElement.style.wordWrap = 'break-word';
      receiptElement.style.overflowWrap = 'break-word';
      
      const montantNumerique = parseFloat(receiptData.montant.replace(/\s/g, '')) || 0;
      const montantEnLettres = numberToFrenchWords(montantNumerique).toUpperCase();
      
      receiptElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 5px; border-bottom: 1px solid #000; padding-bottom: 3px;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 2px;">
            <div style="width: 20mm; height: 20mm; margin-right: 5mm;">
              <img src="${logo}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
            <div style="text-align: left;">
              <div style="font-size: 12px; font-weight: bold; margin-bottom: 1px; text-transform: uppercase;">
                ATHARI FINANCIAL COOP-CA
              </div>
              <div style="font-size: 8px; margin-bottom: 2px;">
                Coopérative d'Épargne et de Crédit
              </div>
              <div style="font-size: 7px; border-top: 1px dashed #ccc; padding-top: 2px; margin-top: 2px;">
                Tél: XX XX XX XX - Email: contact@athari.bf
              </div>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 5px;">
          <div style="font-size: 10px; font-weight: bold; margin-bottom: 2px; text-decoration: underline;">
            REÇU DE RETRAIT D'ESPÈCES
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 8px; margin-bottom: 1px;">
            <span>Réf: ${receiptData.reference}</span>
            <span>${receiptData.date}</span>
          </div>
        </div>
        
        <div style="display: flex; gap: 10px; margin-bottom: 5px;">
          <div style="flex: 1; font-size: 8px;">
            <div style="display: flex; margin-bottom: 1px;">
              <span style="min-width: 30mm;">Compte:</span>
              <span style="font-weight: bold;">${receiptData.compte}</span>
            </div>
            <div style="display: flex; margin-bottom: 1px;">
              <span style="min-width: 30mm;">Titulaire:</span>
              <span>${receiptData.titulaire}</span>
            </div>
            ${receiptData.agence ? `
            <div style="display: flex; margin-bottom: 1px;">
              <span style="min-width: 30mm;">Agence:</span>
              <span>${receiptData.agence}</span>
            </div>
            ` : ''}
          </div>
          
          <div style="flex: 1; font-size: 8px;">
            <div style="display: flex; margin-bottom: 1px;">
              <span style="min-width: 30mm;">Porteur:</span>
              <span>${receiptData.porteur}</span>
            </div>
            <div style="display: flex; margin-bottom: 1px;">
              <span style="min-width: 30mm;">Pièce:</span>
              <span>${receiptData.pieceId}</span>
            </div>
            ${receiptData.guichet ? `
            <div style="display: flex; margin-bottom: 1px;">
              <span style="min-width: 30mm;">Guichet:</span>
              <span>${receiptData.guichet}</span>
            </div>
            ` : ''}
            ${receiptData.motif ? `
            <div style="display: flex; margin-bottom: 1px;">
              <span style="min-width: 30mm;">Motif:</span>
              <span>${receiptData.motif}</span>
            </div>
            ` : ''}
          </div>
        </div>
        
        <div style="border: 1px solid #000; padding: 3px; margin-bottom: 5px; text-align: center;">
          <div style="font-size: 9px; font-weight: bold; margin-bottom: 2px;">
            MONTANT DU RETRAIT
          </div>
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 2px;">
            ${formatCurrency(receiptData.montant)} FCFA
          </div>
          <div style="font-size: 7px; font-style: italic;">
            (${montantEnLettres.substring(0, 60)}${montantEnLettres.length > 60 ? '...' : ''})
          </div>
        </div>
        
        ${receiptData.billetage && receiptData.billetage.some(item => item.quantite > 0) ? `
        <div style="margin-bottom: 5px;">
          <div style="font-size: 8px; font-weight: bold; text-align: center; margin-bottom: 2px; border-bottom: 1px dashed #666; padding-bottom: 1px;">
            COMPOSITION DU BILLETAGE
          </div>
          <div style="font-size: 7px; display: flex; flex-wrap: wrap; gap: 10px;">
            ${receiptData.billetage
              .filter(item => item.quantite > 0)
              .map(item => `
                <div style="flex: 1; min-width: 45mm; display: flex; justify-content: space-between; margin-bottom: 1px;">
                  <span>${item.valeur.toLocaleString()} FCFA × ${item.quantite}</span>
                  <span>${(item.valeur * item.quantite).toLocaleString()} FCFA</span>
                </div>
              `).join('')}
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 2px; border-top: 1px dashed #666; padding-top: 2px; font-weight: bold; font-size: 8px;">
            <span>TOTAL BILLETAGE:</span>
            <span>${receiptData.billetage.reduce((sum, item) => sum + (item.valeur * item.quantite), 0).toLocaleString()} FCFA</span>
          </div>
        </div>
        ` : ''}
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 7px;">
          <div>
            <div>Caissier: ${receiptData.caissierId}</div>
          </div>
          <div>
            <div>Généré le: ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
        
        <div style="border-top: 1px dashed #000; margin: 5px 0; padding-top: 3px; text-align: center; font-size: 6px;">
          --------------------------------
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <div style="text-align: center; width: 48%;">
            <div style="border-bottom: 1px solid #000; height: 20px; margin-bottom: 2px;"></div>
            <div style="font-size: 7px;">Signature du porteur</div>
          </div>
          <div style="text-align: center; width: 48%;">
            <div style="border-bottom: 1px solid #000; height: 20px; margin-bottom: 2px;"></div>
            <div style="font-size: 7px;">Signature & cachet</div>
          </div>
        </div>
        
        <div style="text-align: center; font-size: 6px; color: #666; border-top: 1px dashed #ccc; padding-top: 2px;">
          <div>Conservez ce reçu comme preuve de transaction</div>
          <div>Merci de votre confiance !</div>
        </div>
      `;
      
      document.body.appendChild(receiptElement);
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [150, 100],
      });
      
      const canvas = await html2canvas(receiptElement, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        width: 150 * 3.78,
        height: receiptElement.scrollHeight,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pageWidth = 150;
      const pageHeight = 100;
      const imgWidth = pageWidth - 10;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const xPos = 5;
      const yPos = 5;
      
      pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
      
      const fileName = `Retrait-${receiptData.reference}.pdf`;
      pdf.save(fileName);
      
      document.body.removeChild(receiptElement);
      
      showSnackbar('Reçu PDF généré avec succès', 'success');
      
    } catch (error) {
      console.error('Erreur lors de la génération du reçu:', error);
      showSnackbar('Erreur lors de la génération du reçu', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const downloadReceipt = async (receiptData: ReceiptData) => {
    await generateAndDownloadReceipt(receiptData);
  };

  const openPrintModal = () => {
    if (lastSuccessfulTransaction) {
      setSuccessModal({
        open: true,
        transactionData: lastSuccessfulTransaction,
      });
    } else {
      showSnackbar('Aucune transaction récente à imprimer', 'warning');
    }
  };

  const openSuccessModal = (transactionData: any) => {
    const receiptData = prepareReceiptData();
    setLastSuccessfulTransaction(receiptData);
    setSuccessModal({
      open: true,
      transactionData: receiptData,
    });
  };

  const closeSuccessModal = () => {
    setSuccessModal({
      open: false,
      transactionData: undefined,
    });
  };

  // Fonction pour charger les informations du client
  const loadClientInfo = (compte: Compte) => {
    if (!compte || !compte.client) return;
    
    const client = compte.client;
    let nomClient = '';
    let adresse = '';
    let photo = '';
    let signature = '';
    let typeId = 'CNI';
    let numeroId = '';
    let realCni = '';
    let delivreLe = '';
    let delivreA = '';
    
    if (client.type_client === 'physique' && client.physique) {
      const physique = client.physique;
      nomClient = physique.nom_prenoms || client.nom_complet;
      adresse = `${client.adresse_quartier || ''}, ${client.adresse_ville || ''}`;
      photo = physique.photo_url || '';
      typeId = 'CNI';
      numeroId = physique.cni_numero || '';
      realCni = physique.cni_numero || '';
      delivreLe = physique.cni_delivrance || '';
      delivreA = physique.lieu_naissance || '';
    } else if (client.type_client === 'morale' && client.morale) {
      const morale = client.morale;
      nomClient = morale.raison_sociale || client.nom_complet;
      adresse = `${client.adresse_quartier || ''}, ${client.adresse_ville || ''}`;
      if (formData.typePorteur === 'client' && morale.nom_representant) {
        nomClient = morale.nom_representant;
      }
    }
    
    setClientRealCni(realCni);
    
    if (formData.typePorteur === 'client') {
      setFormData(prev => ({
        ...prev,
        nomPorteur: nomClient,
        adresse: adresse,
        typeId: typeId || 'CNI',
        numeroId: '',
        delivreLe: delivreLe,
        delivreA: delivreA,
      }));
      
      if (photo) {
        setPhotoUrl(photo);
      }
      
      if (compte.signature_path) {
        const fullSignatureUrl = compte.signature_path.startsWith('http') 
          ? compte.signature_path 
          : `${API_BASE_URL}/storage/${compte.signature_path}`;
        setSignatureUrl(fullSignatureUrl);
      }
    }
  };

  // Fonction pour charger les informations du mandataire
  const loadMandataireInfo = (mandataireId: string) => {
    if (!compteDetails || !compteDetails.mandataires || !mandataireId) return;
    
    const mandataire = compteDetails.mandataires.find(m => m.id.toString() === mandataireId);
    if (!mandataire) return;
    
    const nomComplet = getMandataireNomComplet(mandataire);
    const typePiece = getMandataireTypePiece(mandataire);
    const numeroPiece = getMandataireNumeroPiece(mandataire);
    
    setClientRealCni(numeroPiece);
    
    setFormData(prev => ({
      ...prev,
      nomPorteur: nomComplet,
      adresse: mandataire.adresse || '',
      typeId: typePiece,
      numeroId: '',
      delivreLe: mandataire.date_delivrance_piece || '',
      delivreA: mandataire.lieu_delivrance_piece || mandataire.lieu_naissance || '',
    }));
    
    if (mandataire.photo_url) {
      setPhotoUrl(mandataire.photo_url);
    } else if (mandataire.photo) {
      const fullPhotoUrl = mandataire.photo.startsWith('http')
        ? mandataire.photo
        : `${API_BASE_URL}/storage/${mandataire.photo}`;
      setPhotoUrl(fullPhotoUrl);
    } else {
      setPhotoUrl('');
    }
    
    if (mandataire.signature_url) {
      setSignatureUrl(mandataire.signature_url);
    } else if (mandataire.signature_path) {
      const fullSignatureUrl = mandataire.signature_path.startsWith('http')
        ? mandataire.signature_path
        : `${API_BASE_URL}/storage/${mandataire.signature_path}`;
      setSignatureUrl(fullSignatureUrl);
    } else {
      setSignatureUrl('');
    }
  };

  // Fonction pour valider le CNI saisi
  const validateCni = (): boolean => {
    setCniValidationError('');
    
    if (!clientRealCni || clientRealCni.trim() === '') {
      console.log('Aucun CNI stocké pour validation');
      return true;
    }
    
    if (!formData.numeroId || formData.numeroId.trim() === '') {
      setCniValidationError('Veuillez saisir le numéro de pièce');
      return false;
    }
    
    const enteredCni = formData.numeroId.trim();
    const storedCni = clientRealCni.trim();
    
    console.log('CNI saisi:', enteredCni);
    console.log('CNI stocké:', storedCni);
    
    if (enteredCni !== storedCni) {
      const errorMessage = formData.typePorteur === 'client' 
        ? `Le numéro CNI pour ce client n'est pas correct. Veuillez entrer le bon numéro.`
        : `Le numéro de pièce pour ce mandataire n'est pas correct. Veuillez entrer le bon numéro.`;
      
      setCniValidationError(errorMessage);
      return false;
    }
    
    return true;
  };

  // Fonction utilitaire pour obtenir le nom complet du mandataire
  const getMandataireNomComplet = (mandataire: Mandataire): string => {
    return `${mandataire.prenom || ''} ${mandataire.nom || ''}`.trim();
  };

  // Fonction utilitaire pour obtenir le type de pièce
  const getMandataireTypePiece = (mandataire: Mandataire): string => {
    return mandataire.type_piece || 'CNI';
  };

  // Fonction utilitaire pour obtenir le numéro de pièce
  const getMandataireNumeroPiece = (mandataire: Mandataire): string => {
    return mandataire.numero_piece || mandataire.numero_cni || '';
  };

  // Effet pour charger les informations quand le type de porteur change
  useEffect(() => {
    console.log('Type porteur changé:', formData.typePorteur);
    
    if (!compteDetails) return;
    
    setCniValidationError('');
    setClientRealCni('');
    
    if (formData.typePorteur === 'client') {
      loadClientInfo(compteDetails);
    } else if (formData.typePorteur === 'mandataire') {
      console.log('Sélection mandataire ID:', formData.selectedMandataireId);
      
      if (formData.selectedMandataireId) {
        loadMandataireInfo(formData.selectedMandataireId);
      } else if (compteDetails.mandataires && compteDetails.mandataires.length > 0) {
        const firstMandataire = compteDetails.mandataires[0];
        console.log('Premier mandataire par défaut:', firstMandataire);
        
        setFormData(prev => ({
          ...prev,
          selectedMandataireId: firstMandataire.id.toString(),
        }));
        loadMandataireInfo(firstMandataire.id.toString());
      } else {
        console.log('Aucun mandataire disponible');
        setFormData(prev => ({
          ...prev,
          nomPorteur: '',
          adresse: '',
          typeId: 'CNI',
          numeroId: '',
          delivreLe: '',
          delivreA: '',
        }));
        setPhotoUrl('');
        setSignatureUrl('');
      }
    } else if (formData.typePorteur === 'autre') {
      setFormData(prev => ({
        ...prev,
        selectedMandataireId: '',
        nomPorteur: '',
        adresse: '',
        typeId: 'CNI',
        numeroId: '',
        delivreLe: '',
        delivreA: '',
      }));
      setPhotoUrl('');
      setSignatureUrl('');
    }
  }, [formData.typePorteur, formData.selectedMandataireId, compteDetails]);

  // Effet pour charger les infos client quand un compte est sélectionné
  useEffect(() => {
    console.log('Compte détail changé:', compteDetails);
    if (compteDetails) {
      loadClientInfo(compteDetails);
    }
  }, [compteDetails]);

  // Effet pour charger les infos mandataire quand la sélection change
  useEffect(() => {
    console.log('Mandataire sélectionné changé:', formData.selectedMandataireId);
    if (formData.typePorteur === 'mandataire' && formData.selectedMandataireId) {
      loadMandataireInfo(formData.selectedMandataireId);
    }
  }, [formData.selectedMandataireId]);

  // Charger les agences au montage
  useEffect(() => {
    const loadAgences = async () => {
      try {
        setLoading(true);
        const agencesData = await agenceService.getAgences();
        setAgences(agencesData);
        showSnackbar('Agences chargées avec succès', 'success');
      } catch (error) {
        console.error('Erreur chargement agences:', error);
        showSnackbar('Erreur de chargement des agences', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadAgences();
  }, []);

  // Charger les comptes
  useEffect(() => {
    const loadComptes = async () => {
      setLoadingComptes(true);
      try {
        const comptesData = await compteService.getComptes();
        setComptes(comptesData);
      } catch (error) {
        console.error('Erreur chargement comptes:', error);
        showSnackbar('Erreur lors du chargement des comptes', 'error');
      } finally {
        setLoadingComptes(false);
      }
    };
    
    loadComptes();
  }, []);

  // Charger les guichets quand une agence est sélectionnée
  useEffect(() => {
    const loadGuichets = async () => {
      if (!formData.selectedAgence) {
        setGuichets([]);
        setCaisses([]);
        setFormData(prev => ({ ...prev, guichet: '', caisse: '' }));
        return;
      }

      try {
        setLoadingGuichets(true);
        const response = await guichetService.getGuichets();
        
        let guichetsArray: Guichet[] = [];
        if (Array.isArray(response)) {
          guichetsArray = response;
        } else if (response && typeof response === 'object') {
          if (response.success !== undefined && response.data !== undefined) {
            if (response.success && Array.isArray(response.data)) {
              guichetsArray = response.data;
            }
          } else if (response.data !== undefined) {
            if (Array.isArray(response.data)) {
              guichetsArray = response.data;
            }
          }
        }
        
        const filteredGuichets = guichetsArray.filter((guichet: Guichet) => 
          guichet.agence_id === parseInt(formData.selectedAgence)
        );
        
        setGuichets(filteredGuichets);
        setCaisses([]);
        setFormData(prev => ({ ...prev, guichet: '', caisse: '' }));
        
      } catch (error) {
        console.error('Erreur chargement guichets:', error);
        showSnackbar('Erreur de chargement des guichets', 'error');
        setGuichets([]);
      } finally {
        setLoadingGuichets(false);
      }
    };

    loadGuichets();
  }, [formData.selectedAgence]);

  // Charger les caisses quand un guichet est sélectionné
  useEffect(() => {
    const loadCaisses = async () => {
      if (!formData.guichet) {
        setCaisses([]);
        setFormData(prev => ({ ...prev, caisse: '' }));
        return;
      }

      try {
        setLoadingCaisses(true);
        const response = await caisseService.getCaisses();
        
        let caissesArray: Caisse[] = [];
        if (Array.isArray(response)) {
          caissesArray = response;
        } else if (response && typeof response === 'object') {
          if (response.success !== undefined && response.data !== undefined) {
            if (response.success && Array.isArray(response.data)) {
              caissesArray = response.data;
            }
          } else if (response.data !== undefined) {
            if (Array.isArray(response.data)) {
              caissesArray = response.data;
            }
          }
        }
        
        const guichetId = parseInt(formData.guichet);
        const filteredCaisses = caissesArray.filter((caisse: Caisse) => 
          caisse.guichet_id === guichetId && caisse.est_active === true
        );
        
        setCaisses(filteredCaisses);
        setFormData(prev => ({ ...prev, caisse: '' }));
        
      } catch (error) {
        console.error('Erreur chargement caisses:', error);
        showSnackbar('Erreur de chargement des caisses', 'error');
        setCaisses([]);
      } finally {
        setLoadingCaisses(false);
      }
    };

    loadCaisses();
  }, [formData.guichet]);

  // Calculer les montants nets POUR RETRAIT
  useEffect(() => {
    const montant = parseFloat(formData.montant || '0');
    const commissions = parseFloat(formData.commissions || '0');
    const taxes = parseFloat(formData.taxes || '0');
    
    const totalFrais = commissions + taxes;
    
    const montantTotalADebiter = formData.fraisEnCompte ? montant : montant + totalFrais;
    const netAEncaisser = montant;
    
    setFormData(prev => ({
      ...prev,
      netAEncaisser: Math.max(0, netAEncaisser).toFixed(2),
      netADebiter: Math.max(0, montantTotalADebiter).toFixed(2),
    }));
  }, [formData.montant, formData.commissions, formData.taxes, formData.fraisEnCompte]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      const newData = {
        ...formData,
        [name]: target.checked,
      };

      if (name === 'smsEnabled' && !target.checked) {
        newData.telephone = '';
      }

      setFormData(newData);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    const newData = {
      ...formData,
      [name]: value,
    };

    if (name === 'selectedAgence') {
      if (value) {
        const selectedAgence = agences.find(agence => agence.id.toString() === value);
        if (selectedAgence) {
          newData.agenceCode = selectedAgence.code;
        }
      } else {
        newData.agenceCode = '';
        newData.guichet = '';
        newData.caisse = '';
      }
    }

    setFormData(newData);
  };

  // Fonction pour sélectionner un compte
  const handleCompteSelect = async (compte: Compte | null) => {
    if (!compte) {
      setCompteDetails(null);
      setFormData(prev => ({
        ...prev,
        compte: '',
        compte_id: null,
        client: '',
        chapitre: '',
        soldeComptable: '0',
        typePorteur: 'client',
        selectedMandataireId: '',
      }));
      setPhotoUrl('');
      setSignatureUrl('');
      setClientRealCni('');
      setCniValidationError('');
      return;
    }
    
    try {
      setCompteDetails(compte);
      
      console.log('Compte sélectionné:', compte);
      
      const client = compte.client;
      let nomClient = '';
      let chapitreLibelle = compte.plan_comptable?.libelle || 'N/A';
      
      if (client.type_client === 'physique' && client.physique) {
        nomClient = client.physique.nom_prenoms || client.nom_complet;
      } else if (client.type_client === 'morale' && client.morale) {
        nomClient = client.morale.raison_sociale || client.nom_complet;
      } else {
        nomClient = client.nom_complet;
      }
      
      setFormData(prev => ({
        ...prev,
        compte: compte.numero_compte || '',
        compte_id: compte.id,
        client: nomClient,
        chapitre: chapitreLibelle,
        soldeComptable: compte.solde || '0',
        typePorteur: 'client',
        selectedMandataireId: '',
        numeroId: '',
      }));
      
      setCniValidationError('');
      loadClientInfo(compte);
      
      showSnackbar('Compte chargé avec succès', 'success');
    } catch (error) {
      console.error('Erreur chargement détails compte:', error);
      showSnackbar('Erreur lors du chargement du compte', 'error');
    }
  };

  // Gestion du type de porteur
  const handleTypePorteurChange = (type: 'client' | 'mandataire' | 'autre') => {
    console.log('Changement type porteur vers:', type);
    
    setCniValidationError('');
    setClientRealCni('');
    
    let selectedMandataireId = '';
    if (type === 'mandataire' && compteDetails?.mandataires?.length) {
      selectedMandataireId = compteDetails.mandataires[0].id.toString();
      console.log('Sélection auto mandataire ID:', selectedMandataireId);
    }
    
    setFormData(prev => ({
      ...prev,
      typePorteur: type,
      selectedMandataireId: selectedMandataireId,
      numeroId: '',
    }));
  };

  // Gestion du billetage
  const updateBilletage = (index: number, field: 'valeur' | 'quantite', value: number) => {
    const newBilletage = [...billetage];
    newBilletage[index] = { ...newBilletage[index], [field]: Math.max(0, value) };
    setBilletage(newBilletage);
    
    const total = newBilletage.reduce((sum, item) => sum + (item.valeur * item.quantite), 0);
    
    setFormData(prev => ({
      ...prev,
      montant: total.toString()
    }));
  };

  // Calculer le billetage à partir du montant
  const calculateBilletageFromAmount = (montantStr: string) => {
    const montant = parseFloat(montantStr) || 0;
    if (montant <= 0) return;
    
    setCalculating(true);
    
    setTimeout(() => {
      let remaining = montant;
      const coupures = [10000, 5000, 2000, 1000, 500, 200, 100];
      const newBilletage = coupures.map(valeur => {
        const quantite = Math.floor(remaining / valeur);
        remaining = remaining % valeur;
        return { valeur, quantite };
      });
      
      setBilletage(newBilletage);
      
      if (remaining > 0) {
        showSnackbar(`Attention: ${remaining} FCFA non alloués (montant non divisible)`, 'warning');
      }
      
      setCalculating(false);
    }, 300);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity: severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // --- FONCTION DE VÉRIFICATION DU CODE (APPEL API RÉEL) ---
  const handleVerifyCode = async () => {
    if (validationCode.length !== 6) {
      setIsCodeValid(false);
      setCodeValidationError('Le code doit contenir 6 caractères');
      showSnackbar('Le code doit contenir 6 caractères', 'error');
      return;
    }
    
    if (!pendingDemandeId) {
      setCodeValidationError('Aucune demande de validation en cours');
      showSnackbar('Aucune demande de validation en cours', 'error');
      return;
    }
    
    try {
      setTransactionStatus('validating');
      
      // Appel API réel pour vérifier le code
      const result = await verifierCodeValidation(pendingDemandeId, validationCode);
      
      if (result.valid) {
        setIsCodeValid(true);
        setCodeValidationError('');
        showSnackbar('Code validé avec succès', 'success');
        
        // Fermer le modal et permettre la soumission
        setValidationDialog(false);
      } else {
        setIsCodeValid(false);
        setCodeValidationError(result.message);
        showSnackbar(result.message, 'error');
      }
    } catch (error: any) {
      console.error('Erreur validation code:', error);
      setIsCodeValid(false);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la validation du code';
      setCodeValidationError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setTransactionStatus('idle');
    }
  };

  // Fonction pour soumettre au backend
  const submitToBackend = async (retraitData: RetraitData, billetageValide: BilletageItem[]) => {
    try {
      console.log('=== ENVOI AU BACKEND ===');
      console.log('RetraitData:', retraitData);
      console.log('Billetage:', billetageValide);
      
      // Appel réel au service de retrait
      const result = await retraitService.effectuerRetrait(retraitData, billetageValide);
      
      console.log('Réponse backend:', result);
      
      if (result.success) {
        // Transaction réussie
        setBackendMessage(result.message || 'Retrait effectué avec succès');
        
        // Préparer et sauvegarder les données du reçu
        const receiptData = prepareReceiptData();
        setLastSuccessfulTransaction(receiptData);
        
        // Ouvrir la modal de succès avec le reçu
        openSuccessModal(result.data);
        
        // Réinitialiser le formulaire
        resetForm();
        
        return { success: true, data: result.data };
      } else {
        // Erreur du backend
        setBackendError(result.message || 'Erreur lors du retrait');
        showSnackbar(result.message || 'Erreur lors du retrait', 'error');
        return { success: false, message: result.message };
      }
      
    } catch (error: any) {
      console.error('Erreur lors de la soumission au backend:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de connexion au serveur';
      setBackendError(errorMessage);
      showSnackbar(errorMessage, 'error');
      return { success: false, message: errorMessage };
    }
  };

  // Traitement principal du retrait - VERSION AMÉLIORÉE
  const processRetrait = async () => {
    try {
      console.log('=== DÉBUT SOUMISSION RETRAIT ===');
      
      setTransactionStatus('pending');
      setBackendMessage('');
      setBackendError('');
      
      // Validation des champs obligatoires
      if (!formData.compte_id) {
        showSnackbar('Veuillez sélectionner un compte', 'error');
        setTransactionStatus('idle');
        return;
      }
      
      const montant = parseFloat(formData.montant);
      if (!montant || montant <= 0) {
        showSnackbar('Le montant doit être supérieur à 0', 'error');
        setTransactionStatus('idle');
        return;
      }
      
      // Vérification des plafonds et soldes
      const plafondCheck = checkPlafondCaissiere();
      const soldeCaisseCheck = checkSoldeCaisse();
      const soldeCompteCheck = checkSoldeCompte();
      
      console.log('Vérifications:');
      console.log('- Plafond caissière:', plafondCheck);
      console.log('- Solde caisse:', soldeCaisseCheck);
      console.log('- Solde compte:', soldeCompteCheck);
      
      // Récupérer les entités sélectionnées
      const selectedAgence = agences.find(a => a.id.toString() === formData.selectedAgence);
      const selectedGuichet = guichets.find(g => g.id.toString() === formData.guichet);
      const selectedCaisse = caisses.find(c => c.id.toString() === formData.caisse);
      
      // SI LE MONTANT DÉPASSE LE PLAFOND DE LA CAISSIÈRE
      if (!plafondCheck.ok) {
        try {
          setTransactionStatus('validating');
          
          // Activer l'affichage du champ de validation IMMÉDIATEMENT
          setNeedsSupervisorValidation(true);
          setValidationRequired(true);
          setShowValidationInput(true);
          setValidationDialog(true);
          setValidationData({
            demande_id: null, // Sera mis à jour si l'API réussit
            message: plafondCheck.message,
            montant: formData.montant,
            expiration: null
          });
          
          // Tentative de créer une demande de validation (optionnelle)
          const demandeData: DemandeValidationData = {
            compte_id: formData.compte_id,
            montant: montant,
            motif: formData.motif || 'Retrait espèces',
            caisse_id: selectedCaisse?.id || 0,
            agence_id: parseInt(formData.selectedAgence),
            guichet_id: selectedGuichet?.id || 0,
          };
          
          try {
            const validationResponse = await demanderValidation(demandeData);
            
            if (validationResponse.success) {
              // Mettre à jour avec les données reçues du backend
              setPendingDemandeId(validationResponse.demande_id);
              setValidationData({
                demande_id: validationResponse.demande_id,
                message: plafondCheck.message,
                montant: formData.montant,
                expiration: validationResponse.code_expiration
              });
              
              showSnackbar('Demande de validation créée avec succès', 'success');
            } else {
              // Même si la création échoue, on garde l'interface de validation
              showSnackbar(validationResponse.message || 'Erreur lors de la demande de validation', 'warning');
            }
          } catch (apiError) {
            console.error('Erreur API validation (non bloquante):', apiError);
            showSnackbar('Impossible de créer la demande de validation, mais vous pouvez toujours saisir un code', 'warning');
          }
          
          showSnackbar('Validation requise par l\'assistant comptable', 'warning');
        } catch (error) {
          console.error('Erreur inattendue:', error);
          showSnackbar('Erreur lors de la demande de validation', 'error');
        } finally {
          setTransactionStatus('idle');
        }
        return; // IMPORTANT: Arrêter ici pour la validation
      }
      
      // Vérifier les autres contraintes
      if (!soldeCaisseCheck.ok) {
        showSnackbar(soldeCaisseCheck.message, 'error');
        setTransactionStatus('idle');
        return;
      }
      
      if (!soldeCompteCheck.ok) {
        showSnackbar(soldeCompteCheck.message, 'error');
        setTransactionStatus('idle');
        return;
      }
      
      // Validation du CNI (uniquement pour client ou mandataire)
      if (formData.typePorteur === 'client' || formData.typePorteur === 'mandataire') {
        if (!validateCni()) {
          showSnackbar('Numéro de pièce incorrect. Veuillez vérifier.', 'error');
          setTransactionStatus('idle');
          return;
        }
      }
      
      // Vérifier le billetage
      const billetageValide = billetage.filter(item => item.quantite > 0);
      if (billetageValide.length === 0) {
        showSnackbar('Veuillez saisir le billetage', 'error');
        setTransactionStatus('idle');
        return;
      }
      
      const totalBilletage = billetageValide.reduce((sum, item) => sum + (item.valeur * item.quantite), 0);
      if (Math.abs(totalBilletage - montant) > 1) {
        showSnackbar(`Le billetage (${totalBilletage} FCFA) ne correspond pas au montant (${montant} FCFA)`, 'error');
        setTransactionStatus('idle');
        return;
      }
      
      // Validation des sélections
      if (!selectedAgence) {
        showSnackbar('Veuillez sélectionner une agence', 'error');
        setTransactionStatus('idle');
        return;
      }
      
      if (!selectedGuichet) {
        showSnackbar('Veuillez sélectionner un guichet', 'error');
        setTransactionStatus('idle');
        return;
      }
      
      if (!selectedCaisse) {
        showSnackbar('Veuillez sélectionner une caisse', 'error');
        setTransactionStatus('idle');
        return;
      }
      
      if (!selectedCaisse.est_active) {
        showSnackbar('La caisse sélectionnée n\'est pas active', 'error');
        setTransactionStatus('idle');
        return;
      }
      
      // Calcul des frais
      const commissions = parseFloat(formData.commissions) || 0;
      const taxes = parseFloat(formData.taxes) || 0;
      
      // PRÉPARER LES DONNÉES POUR RETRAIT
      const retraitData: RetraitData = {
        compte_id: formData.compte_id,
        montant_brut: montant,
        
        tiers: {
          nom_complet: formData.nomPorteur.trim(),
          type_piece: formData.typeId,
          numero_piece: formData.numeroId.trim(),
          adresse: formData.adresse?.trim(),
          date_delivrance_piece: formData.delivreLe || '',
          lieu_delivrance_piece: formData.delivreA || '',
        },
        
        commissions: commissions,
        taxes: taxes,
        
        motif: formData.motif?.trim() || 'Retrait espèces',
        ref_lettrage: formData.refLettrage?.trim() || '',
        
        agence_code: selectedAgence?.code || '',
        guichet_code: selectedGuichet?.code_guichet || '',
        caisse_code: selectedCaisse?.code_caisse || '',
        caisse_id: selectedCaisse?.id,
        guichet_id: selectedGuichet?.id,
        
        numero_bordereau: formData.numero_bordereau || '',
        type_bordereau: formData.type_bordereau || 'RETRAIT',
        
        date_operation: formData.dateOperation,
        date_valeur: formData.dateValeur,
      };
      
      // AJOUTER LE CODE DE VALIDATION SI NÉCESSAIRE
      if (needsSupervisorValidation && validationCode && isCodeValid) {
        retraitData.code_validation = validationCode;
        console.log('Code de validation ajouté aux données:', validationCode);
      }
      
      console.log('=== DONNÉES RETRAIT PRÉPARÉES ===');
      console.log('RetraitData:', retraitData);
      console.log('Billetage:', billetageValide);
      
      // Soumettre au backend
      const result = await submitToBackend(retraitData, billetageValide);
      
      if (result.success) {
        // Transaction réussie
        setTransactionStatus('success');
        showSnackbar('Retrait effectué avec succès !', 'success');
        
        // Réinitialiser les états de validation
        setNeedsSupervisorValidation(false);
        setValidationRequired(false);
        setShowValidationInput(false);
        setValidationCode('');
        setIsCodeValid(false);
        setPendingDemandeId(null);
        
      } else {
        // Erreur
        setTransactionStatus('error');
        
        // Si l'erreur nécessite une validation (cas où le backend retourne une demande de validation)
        if (result.message && (result.message.includes('validation') || result.message.includes('plafond'))) {
          // Activer l'interface de validation même en cas d'erreur backend
          setNeedsSupervisorValidation(true);
          setShowValidationInput(true);
          setValidationDialog(true);
          
          try {
            // Tenter de créer une demande de validation automatiquement
            const demandeData: DemandeValidationData = {
              compte_id: formData.compte_id,
              montant: montant,
              motif: formData.motif || 'Retrait espèces',
              caisse_id: selectedCaisse?.id || 0,
              agence_id: parseInt(formData.selectedAgence),
              guichet_id: selectedGuichet?.id || 0,
            };
            
            const validationResponse = await demanderValidation(demandeData);
            
            if (validationResponse.success) {
              setPendingDemandeId(validationResponse.demande_id);
              setValidationData({
                demande_id: validationResponse.demande_id,
                message: result.message,
                montant: formData.montant,
                expiration: validationResponse.code_expiration
              });
            }
          } catch (error) {
            console.error('Erreur création auto validation:', error);
          }
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setTransactionStatus('error');
      showSnackbar('Erreur technique lors du retrait', 'error');
    } finally {
      // Garder le statut 'success' si la transaction a réussi, sinon revenir à 'idle'
      if (transactionStatus !== 'success') {
        setTimeout(() => setTransactionStatus('idle'), 2000);
      }
    }
  };

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      agenceCode: '',
      selectedAgence: '',
      guichet: '',
      caisse: '',
      typeRetrait: '01',
      compte: '',
      compte_id: null,
      chapitre: '',
      client: '',
      motif: '',
      dateOperation: new Date().toISOString().split('T')[0],
      dateValeur: new Date().toISOString().split('T')[0],
      smsEnabled: false,
      telephone: '',
      fraisEnCompte: true,
      montant: '',
      commissions: '0',
      taxes: '0',
      refLettrage: '',
      numero_bordereau: '',
      type_bordereau: 'RETRAIT',
      typePorteur: 'client',
      selectedMandataireId: '',
      nomPorteur: '',
      adresse: '',
      typeId: 'CNI',
      numeroId: '',
      delivreLe: '',
      delivreA: '',
      soldeComptable: '0',
      indisponible: '0',
      netAEncaisser: '0',
      netADebiter: '0',
    });
    
    setBilletage(billetage.map(item => ({ ...item, quantite: 0 })));
    setCompteDetails(null);
    setGuichets([]);
    setCaisses([]);
    setValidationCode('');
    setIsCodeValid(false);
    setCodeValidationError('');
    setShowValidationInput(false);
    setPendingDemandeId(null);
    setPhotoUrl('');
    setSignatureUrl('');
    setClientRealCni('');
    setCniValidationError('');
    setNeedsSupervisorValidation(false);
    setValidationRequired(false);
    setTransactionStatus('idle');
  };

  const handleConfirmValidation = () => {
    setDialogOpen(false);
    processRetrait();
  };

  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette transaction ?')) {
      setDialogOpen(false);
      showSnackbar('Transaction annulée', 'info');
      setTransactionStatus('idle');
    }
  };

  const shouldDisableField = (fieldName: keyof RetraitFormData) => {
    if (formData.typePorteur === 'autre') {
      return false;
    }
    
    if (fieldName === 'typeId') {
      return false;
    }
    
    if (formData.typePorteur === 'client') {
      return !['adresse', 'delivreLe', 'delivreA', 'typeId', 'numeroId'].includes(fieldName);
    }
    
    if (formData.typePorteur === 'mandataire') {
      return !['adresse', 'delivreLe', 'delivreA', 'typeId', 'numeroId'].includes(fieldName);
    }
    
    return true;
  };

  const getSelectedMandataireName = () => {
    if (!compteDetails || !compteDetails.mandataires || !formData.selectedMandataireId) {
      return '';
    }
    
    const mandataire = compteDetails.mandataires.find(m => m.id.toString() === formData.selectedMandataireId);
    if (!mandataire) return '';
    
    return getMandataireNomComplet(mandataire);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: `calc(100% - ${sidebarOpen ? '260px' : '80px'})`,
          transition: 'width 0.3s ease',
        }}
      >
        <TopBar sidebarOpen={sidebarOpen} />

        {/* Zone de travail */}
        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>
                Retrait Espèces
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Interface de retrait d'espèces - ATHARIbank
              </Typography>
            </Box>
            
            {lastSuccessfulTransaction && (
              <Tooltip title="Réimprimer le reçu de la dernière transaction">
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Print />}
                  onClick={openPrintModal}
                  sx={{
                    bgcolor: '#9C27B0',
                    '&:hover': { bgcolor: '#7B1FA2' },
                  }}
                >
                  Imprimer le dernier reçu
                </Button>
              </Tooltip>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
              Retrait espèces
            </Typography>
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CloudDownload />}
              onClick={() => navigate('/Retrait-distance')}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: '2px',
                '&:hover': { borderWidth: '2px' }
              }}
            >
              Aller au Retrait à Distance
            </Button>
          </Box>

          {/* Indicateur de statut de transaction */}
          {transactionStatus === 'pending' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 2 }} />
                <Typography>Soumission du retrait en cours...</Typography>
              </Box>
            </Alert>
          )}

          {backendError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography>{backendError}</Typography>
            </Alert>
          )}

          {backendMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography>{backendMessage}</Typography>
            </Alert>
          )}

          {/* Indicateur de validation requise */}
          {needsSupervisorValidation && !showValidationInput && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography>
                  Validation requise par l'assistant comptable. Montant: {formatCurrency(formData.montant)} FCFA
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => setValidationDialog(true)}
                >
                  Saisir le code
                </Button>
              </Box>
            </Alert>
          )}

          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            {/* Barre d'onglets */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f9fa' }}>
              <StyledTabs value={tabValue} onChange={handleTabChange} aria-label="retrait tabs">
                <Tab 
                  label="Retrait Espèces"
                  icon={<AttachMoney fontSize="small" />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Porteur"
                  icon={<Person fontSize="small" />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Condition" 
                  icon={<Description fontSize="small" />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Photo/signature" 
                  icon={<Photo fontSize="small" />} 
                  iconPosition="start"
                />
              </StyledTabs>
            </Box>

            {/* Contenu des onglets */}
            <Box sx={{ p: 3 }}>
              {/* Onglet Retrait Espèces */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                  {/* Colonne 1: Informations de base */}
                  <Grid item xs={12} md={6}>
                    <StyledCard sx={{ mb: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Informations Agence & Guichet
                        </Typography>
                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Code Agence"
                              name="agenceCode"
                              value={formData.agenceCode}
                              variant="outlined"
                              disabled
                              helperText="Récupéré automatiquement"
                              sx={{ minWidth: 250 }}
                            />
                          </Grid>
                          
                          <Grid item xs={6}>
                            <FormControl fullWidth size="small" sx={{ minWidth: 250 }}>
                              <InputLabel>Agence *</InputLabel>
                              <Select
                                name="selectedAgence"
                                value={formData.selectedAgence}
                                label="Agence *"
                                onChange={handleSelectChange}
                                variant="outlined"
                                disabled={loading || transactionStatus === 'pending'}
                              >
                                <MenuItem value=""><em>Sélectionner une agence</em></MenuItem>
                                {agences.map((agence) => (
                                  <MenuItem key={agence.id} value={agence.id.toString()}>
                                    {agence.name} ({agence.code})
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={6}>
                            <FormControl fullWidth size="small" sx={{ minWidth: 250 }}>
                              <InputLabel>Guichet *</InputLabel>
                              <Select
                                name="guichet"
                                value={formData.guichet}
                                label="Guichet *"
                                onChange={handleSelectChange}
                                disabled={!formData.selectedAgence || loadingGuichets || transactionStatus === 'pending'}
                              >
                                <MenuItem value=""><em>Sélectionner un guichet</em></MenuItem>
                                {guichets.map((guichet) => (
                                  <MenuItem key={guichet.id} value={guichet.id.toString()}>
                                    {guichet.nom_guichet} ({guichet.code_guichet})
                                  </MenuItem>
                                ))}
                              </Select>
                              {loadingGuichets && (
                                <CircularProgress size={20} sx={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)' }} />
                              )}
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <FormControl fullWidth size="small" sx={{ minWidth: 250 }}>
                              <InputLabel>Caisse *</InputLabel>
                              <Select
                                name="caisse"
                                value={formData.caisse}
                                label="Caisse *"
                                onChange={handleSelectChange}
                                disabled={!formData.guichet || loadingCaisses || transactionStatus === 'pending'}
                              >
                                <MenuItem value=""><em>Sélectionner une caisse</em></MenuItem>
                                {caisses.map((caisse) => (
                                  <MenuItem key={caisse.id} value={caisse.id.toString()}>
                                    {caisse.libelle} ({caisse.code_caisse})
                                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                      Plafond: {formatCurrency(caisse.plafond_autonomie_caissiere)} FCFA
                                    </Typography>
                                  </MenuItem>
                                ))}
                              </Select>
                              {loadingCaisses && (
                                <CircularProgress size={20} sx={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)' }} />
                              )}
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <FormControl fullWidth size="small" sx={{ minWidth: 250 }}>
                              <InputLabel>Type retrait *</InputLabel>
                              <Select
                                name="typeRetrait"
                                value={formData.typeRetrait}
                                label="Type retrait *"
                                onChange={handleSelectChange}
                                disabled={transactionStatus === 'pending'}
                              >
                                <MenuItem value="01">01 - Retrait espèces</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>

                    {/* Infos solde */}
                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Informations Compte
                        </Typography>
                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <InfoBox>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Solde comptable
                              </Typography>
                              <Typography variant="body2" fontWeight={500} color="success.main">
                                {formatCurrency(formData.soldeComptable)} FCFA
                              </Typography>
                            </InfoBox>
                          </Grid>
                          <Grid item xs={6}>
                            <InfoBox>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Indisponible
                              </Typography>
                              <Typography variant="body2" fontWeight={500} color="error.main">
                                {formatCurrency(formData.indisponible)} FCFA
                              </Typography>
                            </InfoBox>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>

                  {/* Colonne 2: Détails du retrait */}
                  <Grid item xs={12} md={6}>
                    <StyledCard sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 2, height: '100%' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Détails du Retrait
                        </Typography>
                        <Grid container spacing={2}>
                          {/* CHAMP Bordereau */}
                          <Grid item xs={12}>
                            <Grid container spacing={1.5}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Numéro bordereau"
                                  name="numero_bordereau"
                                  value={formData.numero_bordereau}
                                  onChange={handleChange}
                                  placeholder="Ex: BDR-2023-001"
                                  disabled={transactionStatus === 'pending'}
                                  sx={{ minWidth: 250 }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <FormControl fullWidth size="small" sx={{ minWidth: 250 }}>
                                  <InputLabel>Type bordereau</InputLabel>
                                  <Select
                                    name="type_bordereau"
                                    value={formData.type_bordereau}
                                    label="Type bordereau"
                                    onChange={handleSelectChange}
                                    disabled={transactionStatus === 'pending'}
                                  >
                                    <MenuItem value="RETRAIT">RETRAIT</MenuItem>
                                    <MenuItem value="VERSEMENT">VERSEMENT</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                            </Grid>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Autocomplete
                              options={comptes}
                              getOptionLabel={(option) => 
                                `${option.numero_compte || 'N/A'} - ${option.client?.nom_complet || ''}`
                              }
                              loading={loadingComptes}
                              onChange={(event, value) => handleCompteSelect(value)}
                              disabled={transactionStatus === 'pending'}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Rechercher un compte *"
                                  variant="outlined"
                                  size="small"
                                  required
                                  sx={{ minWidth: 250 }}
                                  InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                      <>
                                        {loadingComptes ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                      </>
                                    ),
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          
                          {/* Informations compte sélectionné */}
                          <Grid item xs={12}>
                            <Grid container spacing={1.5}>
                              <Grid item xs={6}>
                                <InfoBox sx={{ height: '100%' }}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Numéro compte
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-all' }}>
                                    {formData.compte || 'Non sélectionné'}
                                  </Typography>
                                </InfoBox>
                              </Grid>
                              <Grid item xs={6}>
                                <InfoBox sx={{ height: '100%' }}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Chapitre
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-all' }}>
                                    {formData.chapitre || 'N/A'}
                                  </Typography>
                                </InfoBox>
                              </Grid>
                            </Grid>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <InfoBox>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Client
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {formData.client || 'Non sélectionné'}
                              </Typography>
                            </InfoBox>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Motif"
                              name="motif"
                              value={formData.motif}
                              onChange={handleChange}
                              placeholder="Objet du retrait"
                              multiline
                              rows={2}
                              disabled={transactionStatus === 'pending'}
                              sx={{ minWidth: 250 }}
                            />
                          </Grid>
                          
                          {/* Dates */}
                          <Grid item xs={12}>
                            <Grid container spacing={1.5}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Date opération"
                                  name="dateOperation"
                                  type="date"
                                  value={formData.dateOperation}
                                  onChange={handleChange}
                                  InputLabelProps={{ shrink: true }}
                                  disabled
                                  sx={{ minWidth: 250 }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Date valeur"
                                  name="dateValeur"
                                  type="date"
                                  value={formData.dateValeur}
                                  onChange={handleChange}
                                  InputLabelProps={{ shrink: true }}
                                  disabled
                                  sx={{ minWidth: 250 }}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>

                  {/* Section SMS et Frais */}
                  <Grid item xs={12}>
                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    name="smsEnabled"
                                    checked={formData.smsEnabled}
                                    onChange={handleChange}
                                    disabled={transactionStatus === 'pending'}
                                  />
                                }
                                label="SMS"
                              />
                              {formData.smsEnabled && (
                                <TextField
                                  size="small"
                                  label="Téléphone"
                                  name="telephone"
                                  value={formData.telephone}
                                  onChange={handleChange}
                                  placeholder="Numéro SMS"
                                  disabled={transactionStatus === 'pending'}
                                  sx={{ flexGrow: 1, minWidth: 250 }}
                                />
                              )}
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={8}>
                            <Grid container spacing={1.5}>
                              <Grid item xs={4}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Montant *"
                                  name="montant"
                                  value={formData.montant}
                                  onChange={(e) => {
                                    handleChange(e);
                                    if (e.target.value) {
                                      calculateBilletageFromAmount(e.target.value);
                                    }
                                  }}
                                  placeholder="0"
                                  type="number"
                                  required
                                  disabled={transactionStatus === 'pending'}
                                  sx={{ minWidth: 250 }}
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
                                  }}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Commissions"
                                  name="commissions"
                                  value={formData.commissions}
                                  onChange={handleChange}
                                  type="number"
                                  disabled={transactionStatus === 'pending'}
                                  sx={{ minWidth: 250 }}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Taxes"
                                  name="taxes"
                                  value={formData.taxes}
                                  onChange={handleChange}
                                  type="number"
                                  disabled={transactionStatus === 'pending'}
                                  sx={{ minWidth: 250 }}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Réf lettrage"
                                  name="refLettrage"
                                  value={formData.refLettrage}
                                  onChange={handleChange}
                                  disabled={transactionStatus === 'pending'}
                                  sx={{ minWidth: 250 }}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>

                  {/* Section Billetage */}
                  <Grid item xs={12}>
                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Billetage - Saisie des coupures *
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                          <TextField
                            size="small"
                            label="Montant à diviser"
                            value={formData.montant}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, montant: e.target.value }));
                              calculateBilletageFromAmount(e.target.value);
                            }}
                            type="number"
                            disabled={transactionStatus === 'pending'}
                            sx={{ minWidth: 250 }}
                          />
                          <Button
                            variant="outlined"
                            startIcon={calculating ? <CircularProgress size={20} /> : <CalculateIcon />}
                            onClick={() => calculateBilletageFromAmount(formData.montant)}
                            disabled={calculating || !formData.montant || parseFloat(formData.montant) <= 0 || transactionStatus === 'pending'}
                            sx={{ minWidth: 250 }}
                          >
                            Calculer billetage
                          </Button>
                          <Typography variant="caption" color="text.secondary">
                            Total: {billetage.reduce((sum, item) => sum + (item.valeur * item.quantite), 0).toLocaleString()} FCFA
                          </Typography>
                        </Box>
                        
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Valeur (FCFA)</strong></TableCell>
                                <TableCell><strong>Quantité</strong></TableCell>
                                <TableCell><strong>Sous-total</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {billetage.map((item, index) => (
                                <TableRow key={item.valeur}>
                                  <TableCell>{item.valeur.toLocaleString()} FCFA</TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <IconButton 
                                        size="small" 
                                        onClick={() => updateBilletage(index, 'quantite', Math.max(0, item.quantite - 1))}
                                        disabled={transactionStatus === 'pending'}
                                      >
                                        <RemoveIcon fontSize="small" />
                                      </IconButton>
                                      <TextField
                                        size="small"
                                        value={item.quantite}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 0;
                                          updateBilletage(index, 'quantite', Math.max(0, val));
                                        }}
                                        type="number"
                                        disabled={transactionStatus === 'pending'}
                                        sx={{ width: 80 }}
                                        inputProps={{ min: 0 }}
                                      />
                                      <IconButton 
                                        size="small" 
                                        onClick={() => updateBilletage(index, 'quantite', item.quantite + 1)}
                                        disabled={transactionStatus === 'pending'}
                                      >
                                        <AddIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <strong>{(item.valeur * item.quantite).toLocaleString()} FCFA</strong>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="small"
                                      onClick={() => updateBilletage(index, 'quantite', 0)}
                                      disabled={transactionStatus === 'pending'}
                                    >
                                      Effacer
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell colSpan={2} align="right">
                                  <strong>Total billetage:</strong>
                                </TableCell>
                                <TableCell colSpan={2}>
                                  <strong style={{ color: '#1976D2', fontSize: '1.1rem' }}>
                                    {billetage.reduce((sum, item) => sum + (item.valeur * item.quantite), 0).toLocaleString()} FCFA
                                  </strong>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                        
                        <Alert severity="info" sx={{ mt: 2 }}>
                          Le total du billetage doit correspondre au montant du retrait
                        </Alert>
                      </CardContent>
                    </StyledCard>
                  </Grid>

                  {/* Section Validation Code - S'affiche TOUJOURS quand showValidationInput est true */}
                  {showValidationInput && (
                    <Grid item xs={12}>
                      <StyledCard>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 2, color: '#d32f2f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Lock fontSize="small" />
                            Code de Validation Requis
                          </Typography>
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            {validationData?.message || 'Cette opération nécessite une validation. Veuillez saisir le code fourni par l\'assistant comptable.'}
                            {validationData?.expiration && (
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Expire le: {formatDateTime(validationData.expiration)}
                              </Typography>
                            )}
                            {!validationData?.demande_id && (
                              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'info.main' }}>
                                Note: La demande de validation n'a pas pu être créée, mais vous pouvez toujours saisir un code de validation existant.
                              </Typography>
                            )}
                          </Alert>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <ValidationCodeInput
                              label="Code de validation *"
                              value={validationCode}
                              onChange={(e) => {
                                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                                setValidationCode(value);
                                setCodeValidationError('');
                                setIsCodeValid(false);
                              }}
                              placeholder="Ex: A1B2C3"
                              size="medium"
                              sx={{ minWidth: 250 }}
                              inputProps={{ maxLength: 6 }}
                              error={!!codeValidationError}
                              helperText={codeValidationError || "Code à 6 caractères fourni par l'assistant"}
                              disabled={transactionStatus === 'pending' || transactionStatus === 'validating'}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Key />
                                  </InputAdornment>
                                ),
                              }}
                            />
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handleVerifyCode}
                              disabled={validationCode.length !== 6 || transactionStatus === 'pending' || transactionStatus === 'validating'}
                              startIcon={transactionStatus === 'validating' ? <CircularProgress size={20} /> : <CheckCircle />}
                              sx={{ minWidth: 250 }}
                            >
                              {transactionStatus === 'validating' ? 'Vérification...' : 'Vérifier le code'}
                            </Button>
                            {isCodeValid && (
                              <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                                <CheckCircle sx={{ mr: 1 }} />
                                <Typography variant="body2">Code valide</Typography>
                              </Box>
                            )}
                            <Button
                              variant="outlined"
                              color="secondary"
                              onClick={() => {
                                setShowValidationInput(false);
                                setPendingDemandeId(null);
                                setValidationCode('');
                                setIsCodeValid(false);
                                setCodeValidationError('');
                                setNeedsSupervisorValidation(false);
                              }}
                              disabled={transactionStatus === 'pending'}
                              sx={{ minWidth: 250 }}
                            >
                              Annuler
                            </Button>
                          </Box>
                          {pendingDemandeId && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                              Demande #{pendingDemandeId}
                            </Typography>
                          )}
                        </CardContent>
                      </StyledCard>
                    </Grid>
                  )}

                  {/* Résumé financier POUR RETRAIT */}
                  <Grid item xs={12}>
                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Résumé Financier - Retrait
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Montant brut (à encaisser)</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                  {formatCurrency(formData.montant)} FCFA
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Frais (commissions + taxes)</TableCell>
                                <TableCell align="right" sx={{ color: '#d32f2f' }}>
                                  {formatCurrency((parseFloat(formData.commissions) + parseFloat(formData.taxes)).toString())} FCFA
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Net à débiter du compte</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                                  {formatCurrency(formData.netADebiter)} FCFA
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Solde après opération</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                                  {formatCurrency((parseFloat(formData.soldeComptable) - parseFloat(formData.netADebiter)).toString())} FCFA
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Onglet Porteur */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Type de Porteur *
                        </Typography>
                        
                        <Box sx={{ mb: 3 }}>
                          <FormControl component="fieldset">
                            <RadioGroup
                              aria-label="type-porteur"
                              name="typePorteur"
                              value={formData.typePorteur}
                              onChange={(e) => handleTypePorteurChange(e.target.value as 'client' | 'mandataire' | 'autre')}
                            >
                              <FormControlLabel 
                                value="client" 
                                control={<Radio />} 
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Portrait fontSize="small" />
                                    <Typography>Je suis le client (titulaire du compte)</Typography>
                                  </Box>
                                } 
                                disabled={transactionStatus === 'pending'}
                              />
                              <FormControlLabel 
                                value="mandataire" 
                                control={<Radio />} 
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Fingerprint fontSize="small" />
                                    <Typography>Je suis le mandataire</Typography>
                                  </Box>
                                } 
                                disabled={!compteDetails?.mandataires || compteDetails.mandataires.length === 0 || transactionStatus === 'pending'}
                              />
                             {/** <FormControlLabel 
                                value="autre" 
                                control={<Radio />} 
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Person fontSize="small" />
                                    <Typography>Autre (remplir manuellement)</Typography>
                                  </Box>
                                } 
                                disabled={transactionStatus === 'pending'}
                              /> */}
                            </RadioGroup>
                          </FormControl>
                        </Box>

                        {/* Sélection du mandataire */}
                        {formData.typePorteur === 'mandataire' && compteDetails?.mandataires && compteDetails.mandataires.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <FormControl fullWidth size="small" sx={{ minWidth: 250 }}>
                              <InputLabel>Mandataire *</InputLabel>
                              <Select
                                name="selectedMandataireId"
                                value={formData.selectedMandataireId}
                                label="Mandataire *"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    selectedMandataireId: value
                                  }));
                                }}
                                disabled={transactionStatus === 'pending'}
                              >
                                <MenuItem value="">
                                  <em>Sélectionner un mandataire</em>
                                </MenuItem>
                                {compteDetails.mandataires.map((mandataire) => (
                                  <MenuItem key={mandataire.id} value={mandataire.id.toString()}>
                                    {getMandataireNomComplet(mandataire) || 'Sans nom'}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                        )}

                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Identité du Porteur *
                        </Typography>
                        <Grid container spacing={1.5}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label={
                                formData.typePorteur === 'client' ? 'Nom du client chargé automatiquement' :
                                formData.typePorteur === 'mandataire' ? `Mandataire: ${getSelectedMandataireName()}` :
                                ''
                              }
                              name="nomPorteur"
                              value={formData.nomPorteur}
                              onChange={handleChange}
                              placeholder="Nom complet du porteur"
                              required
                              disabled={shouldDisableField('nomPorteur') || transactionStatus === 'pending'}
                              helperText={
                                formData.typePorteur === 'client' ? 'Nom du client chargé automatiquement' :
                                formData.typePorteur === 'mandataire' ? `Mandataire: ${getSelectedMandataireName()}` :
                                ''
                              }
                              sx={{ minWidth: 250 }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Adresse"
                              name="adresse"
                              value={formData.adresse}
                              onChange={handleChange}
                              placeholder="Adresse complète"
                              multiline
                              rows={2}
                              disabled={shouldDisableField('adresse') || transactionStatus === 'pending'}
                              helperText={formData.typePorteur === 'autre' ? '' : 'Modifiable si nécessaire'}
                              sx={{ minWidth: 250 }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <FormControl fullWidth size="small" sx={{ minWidth: 250 }}>
                              <InputLabel>Type pièce *</InputLabel>
                              <Select
                                name="typeId"
                                value={formData.typeId || 'CNI'}
                                label="Type pièce *"
                                onChange={handleSelectChange}
                                disabled={shouldDisableField('typeId') || transactionStatus === 'pending'}
                              >
                                <MenuItem value="CNI">CNI</MenuItem>
                                <MenuItem value="PASSEPORT">Passeport</MenuItem>
                                <MenuItem value="PERMIS">Permis de conduire</MenuItem>
                                <MenuItem value="CARTE_SEJOUR">Carte de séjour</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label={
                                formData.typePorteur === 'client' ? 'N° CNI * (à vérifier)' :
                                formData.typePorteur === 'mandataire' ? 'N° Pièce * (à vérifier)' :
                                'N° Pièce *'
                              }
                              name="numeroId"
                              value={formData.numeroId}
                              onChange={handleChange}
                              placeholder={
                                formData.typePorteur === 'client' ? 'Saisissez le N° CNI du client' :
                                formData.typePorteur === 'mandataire' ? 'Saisissez le N° pièce du mandataire' :
                                'Numéro de pièce'
                              }
                              required
                              error={!!cniValidationError}
                              disabled={transactionStatus === 'pending'}
                              helperText={
                                cniValidationError || (
                                  formData.typePorteur === 'client' ? 'Le système a déjà le N° CNI du client. Saisissez-le pour vérification.' :
                                  formData.typePorteur === 'mandataire' ? 'Le système a déjà le N° pièce du mandataire. Saisissez-le pour vérification.' :
                                  ''
                                )
                              }
                              sx={{ minWidth: 250 }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Délivré le"
                              name="delivreLe"
                              type="date"
                              value={formData.delivreLe}
                              onChange={handleChange}
                              InputLabelProps={{ shrink: true }}
                              disabled={shouldDisableField('delivreLe') || transactionStatus === 'pending'}
                              helperText={formData.typePorteur === 'client' || formData.typePorteur === 'mandataire' ? 'Modifiable si nécessaire' : ''}
                              sx={{ minWidth: 250 }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Lieu de délivrance"
                              name="delivreA"
                              value={formData.delivreA}
                              onChange={handleChange}
                              placeholder="Lieu de délivrance"
                              disabled={shouldDisableField('delivreA') || transactionStatus === 'pending'}
                              helperText={formData.typePorteur === 'client' || formData.typePorteur === 'mandataire' ? 'Modifiable si nécessaire' : ''}
                              sx={{ minWidth: 250 }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <StyledCard sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalance fontSize="small" />
                          Détails du compte sélectionné
                        </Typography>
                        {compteDetails ? (
                          <Box>
                            <InfoBox sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <AccountBalanceWallet fontSize="small" />
                                  Numéro compte
                                </Box>
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {compteDetails.numero_compte}
                              </Typography>
                            </InfoBox>
                            <InfoBox sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Portrait fontSize="small" />
                                  Client
                                </Box>
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {compteDetails.client.type_client === 'physique' && compteDetails.client.physique
                                  ? compteDetails.client.physique.nom_prenoms
                                  : compteDetails.client.type_client === 'morale' && compteDetails.client.morale
                                  ? compteDetails.client.morale.raison_sociale
                                  : compteDetails.client.nom_complet}
                              </Typography>
                            </InfoBox>
                            <InfoBox sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Type client
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {compteDetails.client.type_client === 'physique' ? 'Personne physique' : 
                                 compteDetails.client.type_client === 'morale' ? 'Personne morale' : 
                                 'N/A'}
                              </Typography>
                            </InfoBox>
                            <InfoBox sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Phone fontSize="small" />
                                  Téléphone
                                </Box>
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {compteDetails.client.telephone || 'Non renseigné'}
                              </Typography>
                            </InfoBox>
                            <InfoBox sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <AttachMoney fontSize="small" />
                                  Solde actuel
                                </Box>
                              </Typography>
                              <Typography variant="body2" fontWeight={500} color="success.main">
                                {parseFloat(compteDetails.solde || '0').toLocaleString()} FCFA
                              </Typography>
                            </InfoBox>
                            {compteDetails.plan_comptable && (
                              <InfoBox sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Description fontSize="small" />
                                    Plan comptable
                                  </Box>
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {compteDetails.plan_comptable.libelle} ({compteDetails.plan_comptable.code})
                                </Typography>
                              </InfoBox>
                            )}
                            {compteDetails.mandataires && compteDetails.mandataires.length > 0 && (
                              <InfoBox sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Mandataires disponibles
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {compteDetails.mandataires.length} mandataire(s) enregistré(s)
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  {compteDetails.mandataires.map((mandataire, index) => (
                                    <Typography key={mandataire.id} variant="body2" sx={{ 
                                      fontSize: '0.8rem',
                                      backgroundColor: formData.selectedMandataireId === mandataire.id.toString() ? '#e3f2fd' : 'transparent',
                                      p: 0.5,
                                      borderRadius: 1,
                                      mb: 0.5
                                    }}>
                                      {index + 1}. {getMandataireNomComplet(mandataire)} - {getMandataireNumeroPiece(mandataire)}
                                    </Typography>
                                  ))}
                                </Box>
                              </InfoBox>
                            )}
                          </Box>
                        ) : (
                          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography color="text.secondary">
                              Aucun compte sélectionné
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </StyledCard>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Onglet Condition */}
              <TabPanel value={tabValue} index={2}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                      Conditions de Retrait
                    </Typography>
                    <Alert severity="info">
                      <Typography variant="body2">
                        Conditions applicables aux retraits:
                        <br />
                        • Taux de commission: 0.5%
                        <br />
                        • Taxe fixe: 100 FCFA
                        <br />
                        • Montant minimum: 1000 FCFA
                        <br />
                        • Montant maximum par retrait: 5,000,000 FCFA
                        <br />
                        • Plafond quotidien: 10,000,000 FCFA
                        <br />
                        • Pièce d'identité obligatoire pour retrait ≥ 500,000 FCFA
                      </Typography>
                    </Alert>
                  </CardContent>
                </StyledCard>
              </TabPanel>

              {/* Onglet Photo/signature */}
              <TabPanel value={tabValue} index={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <StyledCard sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600, alignSelf: 'flex-start' }}>
                          Photo du porteur
                        </Typography>
                        {photoUrl ? (
                          <>
                            <StyledAvatar 
                              src={photoUrl} 
                              alt="Photo porteur"
                              sx={{ mb: 2 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Photo du {formData.typePorteur === 'client' ? 'client' : 
                                       formData.typePorteur === 'mandataire' ? 'mandataire' : 
                                       'porteur'}
                            </Typography>
                            {formData.typePorteur === 'mandataire' && (
                              <Typography variant="caption" color="primary" sx={{ mt: 1 }}>
                                {getSelectedMandataireName()}
                              </Typography>
                            )}
                          </>
                        ) : (
                          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                            <Portrait sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                              Aucune photo disponible
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center">
                              {formData.typePorteur === 'autre' 
                                ? 'Aucune photo chargée pour ce porteur'
                                : `La photo du ${formData.typePorteur} n'est pas disponible dans le système`}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledCard sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Signature du porteur
                        </Typography>
                        {signatureUrl ? (
                          <>
                            <SignatureContainer sx={{ flexGrow: 1, mb: 2 }}>
                              <Box 
                                component="img" 
                                src={signatureUrl} 
                                alt="Signature"
                                sx={{ maxWidth: '100%', maxHeight: 150 }}
                              />
                            </SignatureContainer>
                            <Typography variant="caption" color="text.secondary">
                              Signature du {formData.typePorteur === 'client' ? 'client' : 
                                         formData.typePorteur === 'mandataire' ? 'mandataire' : 
                                         'porteur'}
                            </Typography>
                            {formData.typePorteur === 'mandataire' && (
                              <Typography variant="caption" color="primary" sx={{ mt: 1 }}>
                                {getSelectedMandataireName()}
                              </Typography>
                            )}
                          </>
                        ) : (
                          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                            <Description sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                              Aucune signature disponible
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center">
                              {formData.typePorteur === 'autre' 
                                ? 'Aucune signature chargée pour ce porteur'
                                : `La signature du ${formData.typePorteur} n'est pas disponible dans le système`}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </StyledCard>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Boutons d'action */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <SecondaryButton 
                  onClick={() => window.history.back()}
                  disabled={transactionStatus === 'pending'}
                >
                  Annuler
                </SecondaryButton>
                <GradientButton
                  variant="contained"
                  onClick={processRetrait}
                  startIcon={transactionStatus === 'pending' ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                  disabled={
                    transactionStatus === 'pending' ||
                    !formData.compte_id || 
                    !formData.montant || 
                    parseFloat(formData.montant) <= 0 ||
                    !formData.nomPorteur ||
                    !formData.numeroId ||
                    billetage.every(item => item.quantite === 0) ||
                    !formData.selectedAgence ||
                    !formData.guichet ||
                    !formData.caisse ||
                    (needsSupervisorValidation && !isCodeValid)
                  }
                  sx={{ minWidth: 250 }}
                >
                  {transactionStatus === 'pending' ? 'Traitement en cours...' : 
                   needsSupervisorValidation ? 'Valider le retrait avec code' : 'Valider le retrait'}
                </GradientButton>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Dialog de confirmation */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle color="primary" />
          Confirmation de retrait
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Validation de retrait. Vérifiez les informations ci-dessous.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Souhaitez-vous confirmer ce retrait ?
            <br />
            Un reçu de caisse sera édité après confirmation.
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" display="block" color="text.secondary">
              Détails du retrait:
            </Typography>
            <Typography variant="body2">
              • Agence: {agences.find(a => a.id.toString() === formData.selectedAgence)?.name}
              <br />
              • Guichet: {guichets.find(g => g.id.toString() === formData.guichet)?.nom_guichet}
              <br />
              • Caisse: {caisses.find(c => c.id.toString() === formData.caisse)?.libelle}
              <br />
              • Compte: {formData.compte}
              <br />
              • Type retrait: {formData.typeRetrait === '01' ? 'Retrait espèces' : 'Retrait guichet'}
              <br />
              • Montant: {formatCurrency(formData.montant)} FCFA
              <br />
              • Porteur: {formData.nomPorteur}
              <br />
              • Type porteur: {
                formData.typePorteur === 'client' ? 'Client (titulaire)' :
                formData.typePorteur === 'mandataire' ? 'Mandataire' : 'Autre'
              }
              <br />
              • Pièce: {formData.typeId} - {formData.numeroId}
              <br />
              • Net à débiter: {formatCurrency(formData.netADebiter)} FCFA
              <br />
              • Bordereau: {formData.numero_bordereau || 'Non spécifié'} ({formData.type_bordereau})
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit" disabled={transactionStatus === 'pending'}>
            Annuler
          </Button>
          <Button onClick={handleConfirmValidation} variant="contained" color="primary" autoFocus disabled={transactionStatus === 'pending'}>
            Confirmer le retrait
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal pour la validation requise */}
      <Dialog 
        open={validationDialog} 
        onClose={() => {
          setValidationDialog(false);
          if (!showValidationInput) {
            setPendingDemandeId(null);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          Validation requise par l'assistant comptable
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {validationData?.message || "Cette opération nécessite une validation supplémentaire car elle dépasse votre plafond."}
          </Typography>
          
          {showValidationInput ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Veuillez demander le code de validation à l'assistant comptable
                {validationData?.expiration && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Ce code expire le: {formatDateTime(validationData.expiration)}
                  </Typography>
                )}
                {!validationData?.demande_id && (
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'info.main' }}>
                    Note: La demande de validation n'a pas pu être créée, mais vous pouvez toujours saisir un code de validation existant.
                  </Typography>
                )}
              </Alert>
              <ValidationCodeInput
                autoFocus
                margin="dense"
                label="Code de validation"
                fullWidth
                value={validationCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                  setValidationCode(value);
                  setCodeValidationError('');
                  setIsCodeValid(false);
                }}
                placeholder="Ex: A1B2C3"
                inputProps={{ maxLength: 6 }}
                error={!!codeValidationError}
                helperText={codeValidationError || "Code à 6 caractères"}
                disabled={transactionStatus === 'pending' || transactionStatus === 'validating'}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  onClick={handleVerifyCode}
                  variant="contained"
                  color="primary"
                  disabled={validationCode.length !== 6 || transactionStatus === 'pending' || transactionStatus === 'validating'}
                  startIcon={transactionStatus === 'validating' ? <CircularProgress size={20} /> : null}
                >
                  {transactionStatus === 'validating' ? 'Vérification...' : 'Vérifier le code'}
                </Button>
              </Box>
            </>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Demande #{validationData?.demande_id} en attente d'approbation
            </Alert>
          )}
          
          <Typography variant="body2" color="text.secondary">
            {showValidationInput 
              ? "Saisissez le code reçu et cliquez sur 'Vérifier' avant de soumettre."
              : "L'assistant comptable doit approuver cette transaction. Vous serez notifié lorsqu'une décision sera prise."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setValidationDialog(false);
            if (!showValidationInput) {
              setPendingDemandeId(null);
            }
          }} disabled={transactionStatus === 'pending'}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de succès - Impression du reçu */}
      <Dialog 
        open={successModal.open} 
        onClose={closeSuccessModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
          <CheckCircle />
          Retrait effectué avec succès !
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Votre transaction a été validée et enregistrée avec succès.
          </Alert>
          
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976D2', fontWeight: 600 }}>
              Détails de la transaction :
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Référence :
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {successModal.transactionData?.reference || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Date :
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {successModal.transactionData?.date || formatDateTime(new Date().toISOString())}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Compte :
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {successModal.transactionData?.compte || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Titulaire :
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {successModal.transactionData?.titulaire || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Montant :
                </Typography>
                <Typography variant="body2" fontWeight={500} color="success.main">
                  {successModal.transactionData?.montant ? formatCurrency(successModal.transactionData.montant) : '0'} FCFA
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Porteur :
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {successModal.transactionData?.porteur || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500, textAlign: 'center' }}>
            Télécharger le reçu de votre retrait <span style={{ color: 'red' }}>AVANT DE FERMER CETTE POP-UP</span>
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Cliquez sur le bouton ci-dessous pour télécharger le reçu PDF professionnel de votre transaction.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <Download />}
              onClick={() => successModal.transactionData && downloadReceipt(successModal.transactionData)}
              disabled={downloading || !successModal.transactionData}
              sx={{ px: 4, py: 1.5, minWidth: 250 }}
            >
              {downloading ? 'Téléchargement en cours...' : 'Télécharger le reçu PDF'}
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={() => successModal.transactionData && downloadReceipt(successModal.transactionData)}
              disabled={downloading || !successModal.transactionData}
              sx={{ minWidth: 250 }}
            >
              Imprimer le reçu
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Astuce :</strong> Vous pourrez réimprimer ce reçu à tout moment en utilisant le bouton 
              "Imprimer le dernier reçu" dans l'en-tête de la page.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeSuccessModal} color="inherit">
            Fermer
          </Button>
          <Button 
            onClick={() => {
              closeSuccessModal();
            }} 
            variant="contained" 
            color="primary"
          >
            Terminer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Élément caché pour le reçu */}
      <div ref={receiptRef} style={{ position: 'absolute', left: '-9999px', top: '0' }}></div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RetraitEspeces;