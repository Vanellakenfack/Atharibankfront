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
// Import pour génération PDF
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- IMPORT DES COMPOSANTS DE LAYOUT ---
import Sidebar from '../../../components/layout/Sidebar';
import TopBar from '../../../components/layout/TopBar';

// --- IMPORT DES SERVICES ---
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
import type { color } from 'html2canvas/dist/types/css/types/color';

// --- INTERFACES ---
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

// Interface pour les données du reçu
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

// Interface pour le retrait à distance
interface RetraitDistanceData {
  numeroCompte: string;
  montant: string;
  procurationFile: File | null;
  demandeRetraitFile: File | null;
  nomGestionnaire: string;
  prenomGestionnaire: string;
  codeGestionnaire: string;
}

// Fonction utilitaire pour obtenir le nom complet du mandataire
const getMandataireNomComplet = (mandataire: Mandataire): string => {
  return `${mandataire.prenom || ''} ${mandataire.nom || ''}`.trim();
};

// Fonction utilitaire pour obtenir le type de pièce (par défaut CNI)
const getMandataireTypePiece = (mandataire: Mandataire): string => {
  return mandataire.type_piece || 'CNI';
};

// Fonction utilitaire pour obtenir le numéro de pièce
const getMandataireNumeroPiece = (mandataire: Mandataire): string => {
  return mandataire.numero_piece || mandataire.numero_cni || '';
};

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

// Interface pour retrait
interface RetraitFormData {
  // Onglet Retrait Espèces
  agenceCode: string;
  selectedAgence: string;
  guichet: string;
  caisse: string;
  typeRetrait: string;
  //agenceCompte: string;
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
  
  // Bordereau pour retrait
  numero_bordereau: string;
  type_bordereau: string;
  
  // Onglet Porteur - Type de porteur
  typePorteur: 'client' | 'mandataire' | 'autre';
  selectedMandataireId: string;
  
  // Informations porteur
  nomPorteur: string;
  adresse: string;
  typeId: string;
  numeroId: string;
  delivreLe: string;
  delivreA: string;
  
  // Calculs
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

// Interface pour les données de la modal de succès
interface SuccessModalData {
  open: boolean;
  transactionData?: ReceiptData;
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

// Composant pour l'upload de fichiers
const FileUploadBox = styled(Box)({
  border: '2px dashed #1976D2',
  borderRadius: 8,
  padding: 24,
  textAlign: 'center',
  backgroundColor: '#f8f9fa',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#e3f2fd',
    borderColor: '#0D47A1',
  },
});

// Constante pour l'URL de l'API
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

// Fonction pour générer une référence unique
const generateReference = (type: 'RET' | 'VER' = 'RET'): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Générer un identifiant aléatoire de 4 caractères
  const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${type}-${year}${month}${day}${hours}${minutes}${seconds}-${randomId}`;
};

// Fonction pour convertir un nombre en lettres (français)
const numberToFrenchWords = (num: number): string => {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
  
  if (num === 0) return 'zéro';
  
  let result = '';
  
  // Convertir les millions
  if (num >= 1000000) {
    const millions = Math.floor(num / 1000000);
    result += numberToFrenchWords(millions) + ' million';
    if (millions > 1) result += 's';
    num %= 1000000;
    if (num > 0) result += ' ';
  }
  
  // Convertir les milliers
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
  
  // Convertir les centaines
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
  
  // Convertir les dizaines et unités
  if (num >= 10) {
    if (num >= 10 && num < 20) {
      result += teens[num - 10];
      num = 0;
    } else {
      const ten = Math.floor(num / 10);
      const unit = num % 10;
      
      if (ten === 7 || ten === 9) {
        // Soixante-dix ou quatre-vingt-dix
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
  
  // Convertir les unités
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
  const navigate = useNavigate(); // Ajoutez cette ligne
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

  // État pour la modal de succès
  const [successModal, setSuccessModal] = useState<SuccessModalData>({
    open: false,
    transactionData: undefined,
  });

  // État pour le chargement du téléchargement
  const [downloading, setDownloading] = useState<boolean>(false);

  // Référence pour le reçu caché
  const receiptRef = useRef<HTMLDivElement>(null);

  // État pour le retrait à distance


  // États pour la validation du CNI
  const [clientRealCni, setClientRealCni] = useState<string>('');
  const [cniValidationError, setCniValidationError] = useState<string>('');

  // Initialisation avec RetraitFormData
  const [formData, setFormData] = useState<RetraitFormData>({
    // Onglet Retrait Espèces
    agenceCode: '',
    selectedAgence: '',
    guichet: '',
    caisse: '',
    typeRetrait: '01',
   // agenceCompte: '',
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
    
    // Bordereau pour retrait
    numero_bordereau: '',
    type_bordereau: 'RETRAIT',
    
    // Onglet Porteur
    typePorteur: 'client',
    selectedMandataireId: '',
    nomPorteur: '',
    adresse: '',
    typeId: 'CNI',
    numeroId: '',
    delivreLe: '',
    delivreA: '',
    
    // Calculs
    soldeComptable: '0',
    indisponible: '0',
    netAEncaisser: '0',
    netADebiter: '0',
  });

  

// Fonction pour générer et télécharger le reçu PDF simplifié
const generateAndDownloadReceipt = async (receiptData: ReceiptData) => {
  try {
    setDownloading(true);
    
    // Créer un élément temporaire pour le reçu
    const receiptElement = document.createElement('div');
    receiptElement.style.position = 'absolute';
    receiptElement.style.left = '-9999px';
    receiptElement.style.top = '0';
    receiptElement.style.width = '210mm'; // A4 width
    receiptElement.style.minHeight = '150mm'; // Hauteur réduite
    receiptElement.style.backgroundColor = 'white';
    receiptElement.style.padding = '10mm';
    receiptElement.style.fontFamily = "'Arial', sans-serif";
    receiptElement.style.color = '#000';
    receiptElement.style.fontSize = '12px';
    receiptElement.style.lineHeight = '1.3';
    
    // Convertir le montant en lettres
    const montantNumerique = parseFloat(receiptData.montant.replace(/\s/g, '')) || 0;
    const montantEnLettres = numberToFrenchWords(montantNumerique).toUpperCase();
    
    // Contenu HTML du reçu simplifié
    receiptElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">
        <div style="display: inline-block; width: 60px; height: 60px; margin-right: 10px; vertical-align: middle;">
          <img src="${logo}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
        <div style="display: inline-block; vertical-align: middle; text-align: left;">
          <div style="font-size: 16px; font-weight: bold; color: #1976d2; margin-bottom: 2px;">
            ATHARI FINANCIAL COOP-CA
          </div>
          <div style="font-size: 11px; color: #666;">
            Coopérative d'Épargne et de Crédit
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 14px; font-weight: bold; color: #d32f2f; margin-bottom: 5px;">
          REÇU DE RETRAIT D'ESPÈCES
        </div>
        <div style="font-size: 11px; color: #666;">
          Référence: <strong>${receiptData.reference}</strong>
        </div>
        <div style="font-size: 11px; color: #666;">
          Date: ${receiptData.date}
        </div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;">
        <tr>
          <td style="width: 35%; padding: 5px 0; font-weight: bold;">Compte:</td>
          <td style="padding: 5px 0;">${receiptData.compte}</td>
        </tr>
        <tr>
          <td style="width: 35%; padding: 5px 0; font-weight: bold;">Titulaire:</td>
          <td style="padding: 5px 0;">${receiptData.titulaire}</td>
        </tr>
        <tr>
          <td style="width: 35%; padding: 5px 0; font-weight: bold;">Porteur:</td>
          <td style="padding: 5px 0;">${receiptData.porteur}</td>
        </tr>
        <tr>
          <td style="width: 35%; padding: 5px 0; font-weight: bold;">Pièce d'identité:</td>
          <td style="padding: 5px 0;">${receiptData.pieceId}</td>
        </tr>
        ${receiptData.agence ? `
        <tr>
          <td style="width: 35%; padding: 5px 0; font-weight: bold;">Agence:</td>
          <td style="padding: 5px 0;">${receiptData.agence}</td>
        </tr>
        ` : ''}
      </table>
      
      <div style="border: 2px solid #1976d2; border-radius: 4px; padding: 10px; margin-bottom: 15px; background-color: #f8f9fa;">
        <div style="text-align: center; font-weight: bold; color: #1976d2; margin-bottom: 10px; font-size: 12px;">
          DÉTAILS DU MONTANT
        </div>
        <div style="text-align: center;">
          <div style="font-size: 18px; font-weight: bold; color: #d32f2f; margin-bottom: 5px;">
            ${formatCurrency(receiptData.montant)} FCFA
          </div>
          <div style="font-size: 11px; font-style: italic; color: #666; margin-bottom: 10px;">
            ${montantEnLettres} FRANCS CFA
          </div>
        </div>
      </div>
      
      <!-- Tableau billetage compact -->
      ${receiptData.billetage && receiptData.billetage.some(item => item.quantite > 0) ? `
      <div style="margin-bottom: 15px;">
        <div style="font-weight: bold; color: #1976d2; margin-bottom: 5px; font-size: 11px; text-align: center;">
          COMPOSITION DU BILLETAGE
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 4px; text-align: left; border-bottom: 1px solid #ddd;">Coupure</th>
              <th style="padding: 4px; text-align: center; border-bottom: 1px solid #ddd;">Qté</th>
              <th style="padding: 4px; text-align: right; border-bottom: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${receiptData.billetage
              .filter(item => item.quantite > 0)
              .map(item => `
                <tr>
                  <td style="padding: 4px; border-bottom: 1px solid #eee;">${item.valeur.toLocaleString()} FCFA</td>
                  <td style="padding: 4px; text-align: center; border-bottom: 1px solid #eee;">${item.quantite}</td>
                  <td style="padding: 4px; text-align: right; border-bottom: 1px solid #eee; font-weight: 500;">${(item.valeur * item.quantite).toLocaleString()} FCFA</td>
                </tr>
              `).join('')}
            <tr style="background-color: #f9f9f9; font-weight: bold;">
              <td style="padding: 4px; border-top: 2px solid #ddd;" colspan="2">TOTAL:</td>
              <td style="padding: 4px; text-align: right; border-top: 2px solid #ddd; color: #1976d2;">
                ${receiptData.billetage.reduce((sum, item) => sum + (item.valeur * item.quantite), 0).toLocaleString()} FCFA
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      ` : ''}
      
      <!-- Signatures -->
      <div style="margin-top: 25px; padding-top: 10px; border-top: 1px solid #ddd;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div style="text-align: center; flex: 1;">
            <div style="height: 40px; margin-bottom: 5px; border-bottom: 1px solid #999; position: relative;">
              <div style="position: absolute; bottom: 5px; left: 0; right: 0; height: 1px; background-color: #999;"></div>
            </div>
            <div style="font-size: 10px; font-weight: bold; color: #333;">Signature du porteur</div>
          </div>
          <div style="width: 30px;"></div>
          <div style="text-align: center; flex: 1;">
            <div style="height: 40px; margin-bottom: 5px; border-bottom: 1px solid #999; position: relative;">
              <div style="position: absolute; bottom: 5px; left: 0; right: 0; height: 1px; background-color: #999;"></div>
            </div>
            <div style="font-size: 10px; font-weight: bold; color: #333;">Signature & cachet</div>
          </div>
        </div>
        
        <div style="text-align: center; font-size: 10px; color: #666; margin-top: 10px;">
          <div>Caissier: ${receiptData.caissierId}</div>
          <div style="margin-top: 5px; font-size: 9px;">
            Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      
      <!-- Note -->
      <div style="margin-top: 15px; padding: 8px; background-color: #f5f5f5; border-radius: 3px; border-left: 3px solid #1976d2; font-size: 9px; color: #666;">
        <strong>NOTE:</strong> Ce reçu fait foi de transaction. Conservez-le précieusement.
      </div>
    `;
    
    // Ajouter l'élément au DOM
    document.body.appendChild(receiptElement);
    
    // Générer le PDF
    const canvas = await html2canvas(receiptElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    const imgWidth = 190; // Largeur réduite pour marges
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Positionner l'image au centre de la page
    const xPos = (210 - imgWidth) / 2; // Centrer horizontalement
    const yPos = 10; // Marge supérieure réduite
    
    pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
    
    // Télécharger le PDF
    const fileName = `Retrait-${receiptData.reference}.pdf`;
    pdf.save(fileName);
    
    // Nettoyer
    document.body.removeChild(receiptElement);
    
    showSnackbar('Reçu PDF généré avec succès', 'success');
    
  } catch (error) {
    console.error('Erreur lors de la génération du reçu:', error);
    showSnackbar('Erreur lors de la génération du reçu', 'error');
  } finally {
    setDownloading(false);
  }
};

  // Fonction pour télécharger le reçu
  const downloadReceipt = async (receiptData: ReceiptData) => {
    await generateAndDownloadReceipt(receiptData);
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
      // Pour les clients moraux, on prend le nom du représentant comme porteur par défaut
      if (formData.typePorteur === 'client' && morale.nom_representant) {
        nomClient = morale.nom_representant;
      }
    }
    
    // Stocker le vrai CNI dans l'état
    setClientRealCni(realCni);
    
    // Mise à jour des informations du porteur si c'est le client
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
      
      // Charger la photo si disponible
      if (photo) {
        setPhotoUrl(photo);
      }
      
      // Charger la signature du compte si disponible
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
    
    console.log('Chargement mandataire:', mandataire);
    
    // Utiliser les fonctions utilitaires pour obtenir les informations
    const nomComplet = getMandataireNomComplet(mandataire);
    const typePiece = getMandataireTypePiece(mandataire);
    const numeroPiece = getMandataireNumeroPiece(mandataire);
    
    console.log('Nom complet mandataire:', nomComplet);
    console.log('Type pièce:', typePiece);
    console.log('Numéro pièce:', numeroPiece);
    
    // Stocker le vrai numéro de pièce
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
    
    // Charger la photo du mandataire si disponible
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
    
    // Charger la signature du mandataire si disponible
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
    // Réinitialiser l'erreur
    setCniValidationError('');
    
    // Si on n'a pas de vrai CNI stocké, on ne peut pas valider
    if (!clientRealCni || clientRealCni.trim() === '') {
      console.log('Aucun CNI stocké pour validation');
      return true; // Pas de validation nécessaire
    }
    
    // Si l'utilisateur n'a rien saisi
    if (!formData.numeroId || formData.numeroId.trim() === '') {
      setCniValidationError('Veuillez saisir le numéro de pièce');
      return false;
    }
    
    // Comparer les deux valeurs (sans tenir compte de la casse et des espaces)
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

  // Effet pour charger les informations quand le type de porteur change
  useEffect(() => {
    console.log('Type porteur changé:', formData.typePorteur);
    console.log('Compte details:', compteDetails);
    console.log('Mandataires disponibles:', compteDetails?.mandataires);
    
    if (!compteDetails) return;
    
    // Réinitialiser la validation du CNI
    setCniValidationError('');
    setClientRealCni('');
    
    if (formData.typePorteur === 'client') {
      // Réinitialiser les infos manuelles et charger les infos du client
      loadClientInfo(compteDetails);
    } else if (formData.typePorteur === 'mandataire') {
      console.log('Sélection mandataire ID:', formData.selectedMandataireId);
      
      // Si un mandataire est sélectionné, charger ses infos
      if (formData.selectedMandataireId) {
        loadMandataireInfo(formData.selectedMandataireId);
      } else if (compteDetails.mandataires && compteDetails.mandataires.length > 0) {
        // Sélectionner le premier mandataire par défaut
        const firstMandataire = compteDetails.mandataires[0];
        console.log('Premier mandataire par défaut:', firstMandataire);
        
        setFormData(prev => ({
          ...prev,
          selectedMandataireId: firstMandataire.id.toString(),
        }));
        loadMandataireInfo(firstMandataire.id.toString());
      } else {
        // Pas de mandataire disponible
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
      // Réinitialiser les champs pour saisie manuelle
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
    
    // Pour un retrait, les frais sont ajoutés au montant à débiter
    const montantTotalADebiter = formData.fraisEnCompte ? montant : montant + totalFrais;
    const netAEncaisser = montant; // Le porteur reçoit le montant brut
    
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
        typePorteur: 'client', // Réinitialiser au client par défaut
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
      console.log('Mandataires du compte:', compte.mandataires);
      
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
        typePorteur: 'client', // Par défaut le client est le porteur
        selectedMandataireId: '',
        numeroId: '', // Réinitialiser le champ de saisie du CNI
      }));
      
      // Réinitialiser la validation
      setCniValidationError('');
      
      // Charger les infos du client
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
    
    // Réinitialiser la validation
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
      numeroId: '', // Réinitialiser le champ de saisie du CNI
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

  // Vérifier localement le code de validation
  const handleVerifyCode = () => {
    const validationResult = retraitService.verifierCodeValidationLocal(validationCode);
    
    if (validationResult.valid) {
      setIsCodeValid(true);
      setCodeValidationError('');
      showSnackbar('Code validé localement. Prêt pour soumission.', 'success');
      
      // Fermer le modal de validation
      setValidationDialog(false);
    } else {
      setIsCodeValid(false);
      setCodeValidationError(validationResult.message);
      showSnackbar(validationResult.message, 'error');
    }
  };

  // Fonction pour ouvrir la modal de succès
  const openSuccessModal = (transactionData: any) => {
    // Récupérer l'agence et le guichet sélectionnés
    const selectedAgence = agences.find(a => a.id.toString() === formData.selectedAgence);
    const selectedGuichet = guichets.find(g => g.id.toString() === formData.guichet);
    
    // Récupérer le nom du caissier (à remplacer par les informations réelles de l'utilisateur connecté)
    const caissierId = "Directeur Général"; // À remplacer par l'utilisateur connecté
    
    const receiptData: ReceiptData = {
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
      billetage: billetage,
    };
    
    setSuccessModal({
      open: true,
      transactionData: receiptData,
    });
  };

  // Fonction pour fermer la modal de succès
  const closeSuccessModal = () => {
    setSuccessModal({
      open: false,
      transactionData: undefined,
    });
  };

  // Traitement principal du retrait
  const processRetrait = async () => {
    try {
      console.log('=== DÉBUT SOUMISSION RETRAIT ===');
      
      // Validation des champs obligatoires
      if (!formData.compte_id) {
        showSnackbar('Veuillez sélectionner un compte', 'error');
        return;
      }
      
      const montant = parseFloat(formData.montant);
      if (!montant || montant <= 0) {
        showSnackbar('Le montant doit être supérieur à 0', 'error');
        return;
      }
      
      // Vérifier que le compte a suffisamment de solde
      const soldeCompte = parseFloat(formData.soldeComptable);
      const montantTotal = parseFloat(formData.netADebiter);
      
      if (montantTotal > soldeCompte) {
        showSnackbar(`Solde insuffisant. Solde disponible: ${soldeCompte.toLocaleString()} FCFA`, 'error');
        return;
      }
      
      if (!formData.nomPorteur || !formData.typeId || !formData.numeroId) {
        showSnackbar('Informations du porteur incomplètes', 'error');
        return;
      }
      
      // Validation du CNI (uniquement pour client ou mandataire)
      if (formData.typePorteur === 'client' || formData.typePorteur === 'mandataire') {
        if (!validateCni()) {
          // Le message d'erreur est déjà affiché dans le champ
          showSnackbar('Numéro de pièce incorrect. Veuillez vérifier.', 'error');
          return;
        }
      }
      
      // Vérifier le billetage
      const billetageValide = billetage.filter(item => item.quantite > 0);
      if (billetageValide.length === 0) {
        showSnackbar('Veuillez saisir le billetage', 'error');
        return;
      }
      
      const totalBilletage = billetageValide.reduce((sum, item) => sum + (item.valeur * item.quantite), 0);
      if (Math.abs(totalBilletage - montant) > 1) {
        showSnackbar(`Le billetage (${totalBilletage} FCFA) ne correspond pas au montant (${montant} FCFA)`, 'error');
        return;
      }
      
      // Récupérer les entités sélectionnées
      const selectedAgence = agences.find(a => a.id.toString() === formData.selectedAgence);
      const selectedGuichet = guichets.find(g => g.id.toString() === formData.guichet);
      const selectedCaisse = caisses.find(c => c.id.toString() === formData.caisse);
      
      // Validation des sélections
      if (!selectedAgence) {
        showSnackbar('Veuillez sélectionner une agence', 'error');
        return;
      }
      
      if (!selectedGuichet) {
        showSnackbar('Veuillez sélectionner un guichet', 'error');
        return;
      }
      
      if (!selectedCaisse) {
        showSnackbar('Veuillez sélectionner une caisse', 'error');
        return;
      }
      
      if (!selectedCaisse.est_active) {
        showSnackbar('La caisse sélectionnée n\'est pas active', 'error');
        return;
      }
      
      // Vérifier que la caisse a suffisamment de liquidités
      const soldeCaisse = parseFloat(selectedCaisse.solde_actuel);
      if (montant > soldeCaisse) {
        showSnackbar(`Solde caisse insuffisant. Disponible: ${soldeCaisse.toLocaleString()} FCFA`, 'error');
        return;
      }
      
      // Calcul des frais
      const commissions = parseFloat(formData.commissions) || 0;
      const taxes = parseFloat(formData.taxes) || 0;
      const totalFrais = commissions + taxes;
      const montantTotalADebiter = formData.fraisEnCompte ? montant : montant + totalFrais;
      
      // PRÉPARER LES DONNÉES POUR RETRAIT
      const retraitData: RetraitData = {
        // Données obligatoires
        compte_id: formData.compte_id,
        montant_brut: montant,
        
        // STRUCTURE "tiers" REQUISE (porteur)
        tiers: {
          nom_complet: formData.nomPorteur.trim(),
          type_piece: formData.typeId,
          numero_piece: formData.numeroId.trim(),
          adresse: formData.adresse?.trim(),
          date_delivrance_piece: formData.delivreLe || '',
          lieu_delivrance_piece: formData.delivreA || '',
        },
        
        // Données de frais
        commissions: commissions,
        taxes: taxes,
        
        // Contexte de l'opération
        motif: formData.motif?.trim() || 'Retrait espèces',
        ref_lettrage: formData.refLettrage?.trim() || '',
        
        // Informations de localisation
        agence_code: selectedAgence?.code || '',
        guichet_code: selectedGuichet?.code_guichet || '',
        caisse_code: selectedCaisse?.code_caisse || '',
        caisse_id: selectedCaisse?.id,
        guichet_id: selectedGuichet?.id,
        
        // CORRECTION ICI : Ajouter les champs bordereau
        numero_bordereau: formData.numero_bordereau || '',
        type_bordereau: formData.type_bordereau || 'RETRAIT',
        
        // Ajouter les dates
        date_operation: formData.dateOperation,
        date_valeur: formData.dateValeur,
      };
      
      // AJOUTER LE CODE DE VALIDATION SI DISPONIBLE
      if (showValidationInput && validationCode && isCodeValid) {
        // Ajouter le code de validation aux données envoyées
        retraitData.code_validation = validationCode;
        console.log('Code de validation ajouté aux données:', validationCode);
      }
      
      console.log('=== DONNÉES RETRAIT PRÉPARÉES ===');
      console.log('RetraitData:', retraitData);
      console.log('Billetage:', billetageValide);
      
      // Appeler le service de RETRAIT
      const result = await retraitService.effectuerRetrait(retraitData, billetageValide);
      
      if (result.requires_validation) {
        // Cas où une validation est nécessaire
        setPendingDemandeId(result.demande_id!);
        setValidationData({
          demande_id: result.demande_id,
          message: result.message,
          montant: formData.montant
        });
        setShowValidationInput(true);
        setValidationDialog(true);
        showSnackbar(result.message || 'Validation requise par l\'assistant', 'warning');
      } else if (result.success) {
        // Transaction réussie
        showSnackbar('Retrait effectué avec succès !', 'success');
        console.log('Référence transaction:', result.data?.reference);
        console.log('ID transaction:', result.data?.transaction_id);
        
        // Ouvrir la modal de succès avec les informations de la transaction
        openSuccessModal(result.data);
        
        // Réinitialiser le formulaire
        resetForm();
        
      } else {
        // Erreur
        const errorMsg = result.message || 'Erreur lors du retrait';
        if (result.errors) {
          const errorDetails = Object.entries(result.errors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('; ');
          showSnackbar(`${errorMsg} - Détails: ${errorDetails}`, 'error');
        } else {
          showSnackbar(errorMsg, 'error');
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showSnackbar('Erreur technique lors du retrait', 'error');
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
      //agenceCompte: '',
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
  };

  const handleConfirmValidation = () => {
    setDialogOpen(false);
    processRetrait();
  };

  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette transaction ?')) {
      setDialogOpen(false);
      showSnackbar('Transaction annulée', 'info');
    }
  };

  // Vérifier si les champs doivent être désactivés
  const shouldDisableField = (fieldName: keyof RetraitFormData) => {
    if (formData.typePorteur === 'autre') {
      return false; // Tout est modifiable pour "autre"
    }
    
    // Pour "client" ou "mandataire", le champ "typeId" (type de pièce) doit être modifiable
    if (fieldName === 'typeId') {
      return false; // Le type de pièce est toujours modifiable
    }
    
    if (formData.typePorteur === 'client') {
      // Pour le client, certains champs sont modifiables
      return !['adresse', 'delivreLe', 'delivreA', 'typeId', 'numeroId'].includes(fieldName);
    }
    
    if (formData.typePorteur === 'mandataire') {
      // Pour le mandataire, certains champs peuvent être modifiés
      return !['adresse', 'delivreLe', 'delivreA', 'typeId', 'numeroId'].includes(fieldName);
    }
    
    return true;
  };

  // Récupérer le nom du mandataire sélectionné
  const getSelectedMandataireName = () => {
    if (!compteDetails || !compteDetails.mandataires || !formData.selectedMandataireId) {
      return '';
    }
    
    const mandataire = compteDetails.mandataires.find(m => m.id.toString() === formData.selectedMandataireId);
    if (!mandataire) return '';
    
    return getMandataireNomComplet(mandataire);
  };

  // Récupérer le numéro CNI du mandataire sélectionné
  const getSelectedMandataireNumeroCni = () => {
    if (!compteDetails || !compteDetails.mandataires || !formData.selectedMandataireId) {
      return '';
    }
    
    const mandataire = compteDetails.mandataires.find(m => m.id.toString() === formData.selectedMandataireId);
    if (!mandataire) return '';
    
    return getMandataireNumeroPiece(mandataire);
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>
              Retrait Espèces
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Interface de retrait d'espèces - ATHARIbank
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
              Retrait a distanvce
            </Typography>
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CloudDownload />} // Icône symbolisant le retrait à distance
              onClick={() => navigate('/Retrait-distance')} // Assurez-vous que le chemin correspond à votre Route
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
                <Tab 
                  label="Retrait à distance" 
                  icon={<CloudDownload fontSize="small" />} 
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
                                disabled={loading}
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
                                disabled={!formData.selectedAgence || loadingGuichets}
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
                                disabled={!formData.guichet || loadingCaisses}
                              >
                                <MenuItem value=""><em>Sélectionner une caisse</em></MenuItem>
                                {caisses.map((caisse) => (
                                  <MenuItem key={caisse.id} value={caisse.id.toString()}>
                                    {caisse.libelle} ({caisse.code_caisse})
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
                              >
                                <MenuItem value="01">01 - Retrait espèces</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          {/*<Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Agence Compte"
                              name="agenceCompte"
                              value={formData.agenceCompte}
                              onChange={handleChange}
                              placeholder="Code agence du compte"
                              sx={{ minWidth: 250 }}
                            />
                          </Grid>*/}
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
                                  sx={{ flexGrow: 1, minWidth: 250 }}
                                />
                              )}
                            </Box>
                            {/*<FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                    name="fraisEnCompte"
                                    checked={formData.fraisEnCompte}
                                    onChange={handleChange}
                                />
                              }
                              label="Frais en compte"
                            />*/}
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
                            sx={{ minWidth: 250 }}
                          />
                          <Button
                            variant="outlined"
                            startIcon={calculating ? <CircularProgress size={20} /> : <CalculateIcon />}
                            onClick={() => calculateBilletageFromAmount(formData.montant)}
                            disabled={calculating || !formData.montant || parseFloat(formData.montant) <= 0}
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
                                        sx={{ width: 80 }}
                                        inputProps={{ min: 0 }}
                                      />
                                      <IconButton 
                                        size="small" 
                                        onClick={() => updateBilletage(index, 'quantite', item.quantite + 1)}
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

                  {/* Section Validation Code */}
                  {showValidationInput && (
                    <Grid item xs={12}>
                      <StyledCard>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 2, color: '#d32f2f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Lock fontSize="small" />
                            Code de Validation Requis
                          </Typography>
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            Cette opération nécessite une validation. Veuillez saisir le code fourni par l'assistant comptable.
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
                              disabled={validationCode.length !== 6}
                              startIcon={<CheckCircle />}
                              sx={{ minWidth: 250 }}
                            >
                              Vérifier le code
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
                              }}
                              sx={{ minWidth: 250 }}
                            >
                              Annuler
                            </Button>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                            Demande #{pendingDemandeId} - Le code est valable 30 minutes
                          </Typography>
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
                                disabled={!compteDetails?.mandataires || compteDetails.mandataires.length === 0}
                              />
                              <FormControlLabel 
                                value="autre" 
                                control={<Radio />} 
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Person fontSize="small" />
                                    <Typography>Autre (remplir manuellement)</Typography>
                                  </Box>
                                } 
                              />
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
                              disabled={shouldDisableField('nomPorteur')}
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
                              disabled={shouldDisableField('adresse')}
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
                                disabled={shouldDisableField('typeId')}
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
                              disabled={shouldDisableField('delivreLe')}
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
                              disabled={shouldDisableField('delivreA')}
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
              {tabValue !== 4 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <SecondaryButton onClick={() => window.history.back()}>
                    Annuler
                  </SecondaryButton>
                  <GradientButton
                    variant="contained"
                    onClick={processRetrait}
                    startIcon={<CheckCircle />}
                    disabled={
                      !formData.compte_id || 
                      !formData.montant || 
                      parseFloat(formData.montant) <= 0 ||
                      !formData.nomPorteur ||
                      !formData.numeroId ||
                      billetage.every(item => item.quantite === 0) ||
                      !formData.selectedAgence ||
                      !formData.guichet ||
                      !formData.caisse ||
                      (showValidationInput && !isCodeValid) // Si validation requise, doit avoir un code valide
                    }
                    sx={{ minWidth: 250 }}
                  >
                    {showValidationInput ? 'Valider le retrait avec code' : 'Valider le retrait'}
                  </GradientButton>
                </Box>
              )}
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
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Annuler
          </Button>
          <Button onClick={handleConfirmValidation} variant="contained" color="primary" autoFocus>
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
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  onClick={handleVerifyCode}
                  variant="contained"
                  color="primary"
                  disabled={validationCode.length !== 6}
                >
                  Vérifier le code
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
          }}>
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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeSuccessModal} color="inherit">
            Fermer
          </Button>
          <Button 
            onClick={() => {
              closeSuccessModal();
              // Optionnel: Rediriger vers l'historique des transactions
              // navigate('/transactions');
            }} 
            variant="contained" 
            color="primary"
          >
            Terminer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Élément caché pour le reçu (utilisé pour la génération PDF) */}
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