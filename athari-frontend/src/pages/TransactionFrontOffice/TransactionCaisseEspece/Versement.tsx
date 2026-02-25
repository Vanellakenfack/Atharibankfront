import React, { useState, useEffect, useRef } from 'react';
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
  Print,
  Download,
  AccountBalance,
  AccountBalanceWallet,
  Portrait,
  Receipt,
} from '@mui/icons-material';

// Import pour génération PDF
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import logo from '../../../assets/img/logo.png';

// --- IMPORT DES COMPOSANTS DE LAYOUT ---
import Sidebar from '../../../components/layout/Sidebar';
import TopBar from '../../../components/layout/TopBar';

// --- IMPORT DES SERVICES ---
import caisseServices from '../../../services/versementEtRetraitservice/caisseServices';
import type { BilletageItem, VersementData, TiersData } from '../../../services/versementEtRetraitservice/caisseServices';
import compteService from '../../../services/api/compteService';
import agenceService, { type Agence as AgenceApi } from '../../../services/agenceService';
import guichetService from '../../../services/guichetService';
import caisseService from '../../../services/caisseService';

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

interface Client {
  id: number;
  nom_complet: string;
  type_client: string;
  telephone?: string;
  email?: string;
  physique?: {
    nom_prenoms: string;
    sexe: string;
    date_naissance: string;
  };
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
  type_compte?: {
    code_chapitre?: string;
    nom?: string;
  };
}

interface VersementFormData {
  // Onglet Versement Espèces
  agenceCode: string;
  selectedAgence: string;
  guichet: string;
  caisse: string;
  typeVersement: string;
  agenceCompte: string;
  compte: string;
  compte_id: number | null;
  chapitre: string;
  client: string;
  motif: string;
  dateOperation: string;
  dateValeur: string;
  dateIndisponible: string;
  smsEnabled: boolean;
  telephone: string;
  fraisEnCompte: boolean;
  montant: string;
  commissions: string;
  taxes: string;
  refLettrage: string;
  
  // NOUVEAUX CHAMPS : Bordereau
  numero_bordereau: string;
  type_bordereau: string;
  
  // Onglet Remettant
  nomRemettant: string;
  adresse: string;
  typeId: string;
  numeroId: string;
  delivreLe: string;
  delivreA: string;
  
  // NOUVEAU CHAMP : Provenance des fonds
  provenance_fonds: string;
  
  // Calculs
  soldeComptable: string;
  indisponible: string;
  netEncaisser: string;
  netCrediter: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Interface pour les données du reçu
interface ReceiptData {
  reference: string;
  date: string;
  compte: string;
  titulaire: string;
  remettant: string;
  pieceId: string;
  montant: string;
  caissierId: string;
  typeOperation: 'VERSEMENT' | 'RETRAIT';
  agence?: string;
  guichet?: string;
  motif?: string;
  provenance_fonds?: string;
  billetage?: BilletageItem[];
}

// Interface pour la modal de succès
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

const StyledAvatar = styled(Avatar)({
  width: 120,
  height: 120,
  border: '3px solid #e0e0e0',
});

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
const generateReference = (type: 'VER' | 'RET' = 'VER'): string => {
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

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`versement-tabpanel-${index}`}
      aria-labelledby={`versement-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const Versement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [agences, setAgences] = useState<AgenceApi[]>([]);
  const [guichets, setGuichets] = useState<Guichet[]>([]);
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGuichets, setLoadingGuichets] = useState(false);
  const [loadingCaisses, setLoadingCaisses] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [validationDialog, setValidationDialog] = useState(false);
  const [validationData, setValidationData] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // États pour les comptes
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [loadingComptes, setLoadingComptes] = useState(false);
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
  
  const [calculating, setCalculating] = useState(false);
  
  // État pour la modal de succès
  const [successModal, setSuccessModal] = useState<SuccessModalData>({
    open: false,
    transactionData: undefined,
  });

  // État pour le chargement du téléchargement
  const [downloading, setDownloading] = useState<boolean>(false);

  // NOUVEL ÉTAT: Stocker la dernière transaction réussie
  const [lastSuccessfulTransaction, setLastSuccessfulTransaction] = useState<ReceiptData | null>(null);

  // Référence pour le reçu caché
  const receiptRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<VersementFormData>({
    // Onglet Versement Espèces
    agenceCode: '',
    selectedAgence: '',
    guichet: '',
    caisse: '',
    // CORRECTION ICI: Utiliser les valeurs de l'enum Laravel
    typeVersement: 'ESPECE', // Changé de '01' à 'ESPECE'
    agenceCompte: '',
    compte: '',
    compte_id: null,
    chapitre: '',
    client: '',
    motif: '',
    dateOperation: new Date().toISOString().split('T')[0],
    dateValeur: new Date().toISOString().split('T')[0],
    dateIndisponible: '',
    smsEnabled: false,
    telephone: '',
    fraisEnCompte: true,
    montant: '',
    commissions: '0',
    taxes: '0',
    refLettrage: '',
    
    // NOUVEAUX CHAMPS : Bordereau
    numero_bordereau: '',
    type_bordereau: 'VERSEMENT',
    
    // Onglet Remettant
    nomRemettant: '',
    adresse: '',
    typeId: 'CNI',
    numeroId: '',
    delivreLe: '',
    delivreA: '',
    
    // NOUVEAU CHAMP : Provenance des fonds
    provenance_fonds: '',
    
    // Calculs
    soldeComptable: '0',
    indisponible: '0',
    netEncaisser: '0',
    netCrediter: '0',
  });

  // Fonction pour préparer les données du reçu
  const prepareReceiptData = (): ReceiptData => {
    // Récupérer l'agence et le guichet sélectionnés
    const selectedAgence = agences.find(a => a.id.toString() === formData.selectedAgence);
    const selectedGuichet = guichets.find(g => g.id.toString() === formData.guichet);
    
    // Récupérer le nom du caissier (à remplacer par les informations réelles de l'utilisateur connecté)
    const caissierId = "Caissier"; // À remplacer par l'utilisateur connecté
    
    return {
      reference: generateReference('VER'),
      date: formatDateTime(new Date().toISOString()),
      compte: formData.compte,
      titulaire: formData.client,
      remettant: formData.nomRemettant,
      pieceId: `${formData.typeId} - ${formData.numeroId}`,
      montant: formData.montant,
      caissierId: caissierId,
      typeOperation: 'VERSEMENT' as const,
      agence: selectedAgence?.name,
      guichet: selectedGuichet?.nom_guichet,
      motif: formData.motif,
      provenance_fonds: formData.provenance_fonds,
      billetage: billetage.filter(item => item.quantite > 0),
    };
  };

  // Fonction pour générer et télécharger le reçu PDF pour VERSEMENT
  const generateAndDownloadReceipt = async (receiptData: ReceiptData) => {
    try {
      setDownloading(true);
      
      // Créer un élément temporaire pour le reçu en FORMAT PAYSAGE
      const receiptElement = document.createElement('div');
      receiptElement.style.position = 'absolute';
      receiptElement.style.left = '-9999px';
      receiptElement.style.top = '0';
      receiptElement.style.width = '150mm'; // Largeur pour format paysage
      receiptElement.style.minHeight = 'auto';
      receiptElement.style.maxWidth = '150mm'; // Augmenté pour paysage
      receiptElement.style.backgroundColor = 'white';
      receiptElement.style.padding = '5mm'; // Légèrement augmenté
      receiptElement.style.fontFamily = "'Courier New', monospace";
      receiptElement.style.color = '#000';
      receiptElement.style.fontSize = '9px';
      receiptElement.style.lineHeight = '1.1';
      receiptElement.style.wordWrap = 'break-word';
      receiptElement.style.overflowWrap = 'break-word';
      
      // Convertir le montant en lettres
      const montantNumerique = parseFloat(receiptData.montant.replace(/\s/g, '')) || 0;
      const montantEnLettres = numberToFrenchWords(montantNumerique).toUpperCase();
      
      receiptElement.innerHTML = `
        <!-- En-tête avec logo -->
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
        
        <!-- Titre principal -->
        <div style="text-align: center; margin-bottom: 5px;">
          <div style="font-size: 10px; font-weight: bold; margin-bottom: 2px; text-decoration: underline;">
            REÇU DE VERSEMENT D'ESPÈCES
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 8px; margin-bottom: 1px;">
            <span>Réf: ${receiptData.reference}</span>
            <span>${receiptData.date}</span>
          </div>
        </div>
        
        <!-- Informations du compte en deux colonnes -->
        <div style="display: flex; gap: 10px; margin-bottom: 5px;">
          <!-- Colonne gauche -->
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
            ${receiptData.provenance_fonds ? `
            <div style="display: flex; margin-bottom: 1px;">
              <span style="min-width: 30mm;">Provenance:</span>
              <span>${receiptData.provenance_fonds}</span>
            </div>
            ` : ''}
          </div>
          
          <!-- Colonne droite -->
          <div style="flex: 1; font-size: 8px;">
            <div style="display: flex; margin-bottom: 1px;">
              <span style="min-width: 30mm;">Remettant:</span>
              <span>${receiptData.remettant}</span>
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
        
        <!-- Montant en évidence -->
        <div style="border: 1px solid #000; padding: 3px; margin-bottom: 5px; text-align: center;">
          <div style="font-size: 9px; font-weight: bold; margin-bottom: 2px;">
            MONTANT DU VERSEMENT
          </div>
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 2px;">
            ${formatCurrency(receiptData.montant)} FCFA
          </div>
          <div style="font-size: 7px; font-style: italic;">
            (${montantEnLettres.substring(0, 60)}${montantEnLettres.length > 60 ? '...' : ''})
          </div>
        </div>
        
        <!-- Billetage -->
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
        
        <!-- Informations supplémentaires -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 7px;">
          <div>
            <div>Caissier: ${receiptData.caissierId}</div>
          </div>
          <div>
            <div>Généré le: ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
        
        <!-- Séparateur -->
        <div style="border-top: 1px dashed #000; margin: 5px 0; padding-top: 3px; text-align: center; font-size: 6px;">
          --------------------------------
        </div>
        
        <!-- Zone de signatures -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <div style="text-align: center; width: 48%;">
            <div style="border-bottom: 1px solid #000; height: 20px; margin-bottom: 2px;"></div>
            <div style="font-size: 7px;">Signature du remettant</div>
          </div>
          <div style="text-align: center; width: 48%;">
            <div style="border-bottom: 1px solid #000; height: 20px; margin-bottom: 2px;"></div>
            <div style="font-size: 7px;">Signature & cachet</div>
          </div>
        </div>
        
        <!-- Message final -->
        <div style="text-align: center; font-size: 6px; color: #666; border-top: 1px dashed #ccc; padding-top: 2px;">
          <div>Conservez ce reçu comme preuve de transaction</div>
          <div>Merci de votre confiance !</div>
        </div>
      `;
      
      // Ajouter l'élément au DOM
      document.body.appendChild(receiptElement);
      
      // Générer le PDF en orientation paysage
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [150, 100],
      });
      
      // Générer le canvas
      const canvas = await html2canvas(receiptElement, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        width: 150 * 3.78,
        height: receiptElement.scrollHeight,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculer les dimensions
      const pageWidth = 150;
      const pageHeight = 100;
      const imgWidth = pageWidth - 10;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Positionner l'image
      const xPos = 5;
      const yPos = 5;
      
      pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
      
      // Télécharger le PDF
      const fileName = `Versement-${receiptData.reference}.pdf`;
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

  // Fonction pour ouvrir la modal de succès
  const openSuccessModal = (transactionData: any) => {
    const receiptData = prepareReceiptData();
    
    // Sauvegarder la transaction pour réutilisation
    setLastSuccessfulTransaction(receiptData);
    
    setSuccessModal({
      open: true,
      transactionData: receiptData,
    });
  };

  // NOUVELLE FONCTION : Ouvrir la modal d'impression à tout moment
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

  // Fonction pour fermer la modal de succès
  const closeSuccessModal = () => {
    setSuccessModal({
      open: false,
      transactionData: undefined,
    });
  };

  // Charger les agences au montage
  useEffect(() => {
    const loadAgences = async () => {
      try {
        setLoading(true);
        console.log('Chargement des agences...');
        const agencesData = await agenceService.getAgences();
        console.log('Agences chargées:', agencesData);
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
        console.log(`${comptesData.length} comptes chargés`);
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
        console.log(`Chargement des guichets pour l'agence ${formData.selectedAgence}...`);
        
        const response = await guichetService.getGuichets();
        console.log('Guichets disponibles:', response);
        
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
          } else {
            const values = Object.values(response);
            if (values.length > 0 && typeof values[0] === 'object' && values[0] !== null) {
              guichetsArray = values as Guichet[];
            }
          }
        }
        
        const filteredGuichets = guichetsArray.filter((guichet: Guichet) => 
          guichet.agence_id === parseInt(formData.selectedAgence)
        );
        
        console.log(`Guichets filtrés pour agence ${formData.selectedAgence}:`, filteredGuichets);
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
        console.log(`Chargement des caisses pour le guichet ${formData.guichet}...`);
        
        const response = await caisseService.getCaisses();
        console.log('Caisses disponibles:', response);
        
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
          } else {
            const values = Object.values(response);
            if (values.length > 0 && typeof values[0] === 'object' && values[0] !== null) {
              caissesArray = values as Caisse[];
            }
          }
        }
        
        const guichetId = parseInt(formData.guichet);
        const filteredCaisses = caissesArray.filter((caisse: Caisse) => 
          caisse.guichet_id === guichetId && caisse.est_active === true
        );
        
        console.log(`Caisses filtrées pour guichet ${guichetId}:`, filteredCaisses);
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

  // Calculer les montants nets
  useEffect(() => {
    const montant = parseFloat(formData.montant || '0');
    const commissions = parseFloat(formData.commissions || '0');
    const taxes = parseFloat(formData.taxes || '0');
    
    const totalFrais = commissions + taxes;
    const netEncaisser = formData.fraisEnCompte ? montant : montant + totalFrais;
    const netCrediter = formData.fraisEnCompte ? montant - totalFrais : montant;
    
    setFormData(prev => ({
      ...prev,
      netEncaisser: Math.max(0, netEncaisser).toFixed(2),
      netCrediter: Math.max(0, netCrediter).toFixed(2),
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
        soldeComptable: '0'
      }));
      return;
    }
    
    console.log('Compte sélectionné:', compte);
    
    try {
      setCompteDetails(compte);
      
      const clientName = compte.client?.nom_complet || 
                        (compte.client?.physique?.nom_prenoms) || 
                        'Client inconnu';
      
      const chapitreLibelle = compte.plan_comptable?.libelle || 'N/A';
      
      setFormData(prev => ({
        ...prev,
        compte: compte.numero_compte || '',
        compte_id: compte.id,
        client: clientName,
        chapitre: chapitreLibelle,
        soldeComptable: compte.solde || '0'
      }));
      
      console.log('Informations compte chargées:', {
        numero: compte.numero_compte,
        client: clientName,
        chapitre: chapitreLibelle,
        solde: compte.solde
      });
      
      showSnackbar('Compte chargé avec succès', 'success');
    } catch (error) {
      console.error('Erreur chargement détails compte:', error);
      showSnackbar('Erreur lors du chargement du compte', 'error');
    }
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
    setSnackbar({ open: true, message, severity: severity as any });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fonction principale de soumission
  const handleSubmitVersement = async () => {
    try {
      console.log('=== DÉBUT SOUMISSION VERSEMENT ===');
      
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
      
      if (!formData.nomRemettant || !formData.typeId || !formData.numeroId) {
        showSnackbar('Informations du remettant incomplètes', 'error');
        return;
      }
      
      if (!formData.provenance_fonds) {
        showSnackbar('Veuillez indiquer la provenance des fonds', 'error');
        return;
      }
      
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
      
      const selectedAgence = agences.find(a => a.id.toString() === formData.selectedAgence);
      const selectedGuichet = guichets.find(g => g.id.toString() === formData.guichet);
      const selectedCaisse = caisses.find(c => c.id.toString() === formData.caisse);
      
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
      
      const commissions = parseFloat(formData.commissions) || 0;
      const taxes = parseFloat(formData.taxes) || 0;
      const totalFrais = commissions + taxes;
      const netCrediter = formData.fraisEnCompte ? montant - totalFrais : montant;
      
      // CORRECTION ICI: Utiliser la valeur correcte pour type_versement
      const versementData: VersementData = {
        // Données obligatoires de base
        compte_id: formData.compte_id,
        montant_brut: montant,
        montant_net: netCrediter,
        
        // CHAMP REQUIS : net_a_percevoir_payer
        net_a_percevoir_payer: netCrediter,
        
        // Données de frais
        commissions: commissions,
        taxes: taxes,
        frais_en_compte: formData.fraisEnCompte,
        
        // NOUVEAUX CHAMPS : Bordereau
        numero_bordereau: formData.numero_bordereau || '',
        type_bordereau: formData.type_bordereau || 'VERSEMENT',
        
        // STRUCTURE "tiers" REQUISE
        tiers: {
          nom_complet: formData.nomRemettant.trim(),
          type_piece: formData.typeId,
          numero_piece: formData.numeroId.trim()
        },
        
        // CHAMPS "remettant_" REQUIS
        remettant_nom: formData.nomRemettant.trim(),
        remettant_type_piece: formData.typeId,
        remettant_numero_piece: formData.numeroId.trim(),
        
        // Autres informations sur le remettant
        adresse_remettant: formData.adresse?.trim() || '',
        date_delivrance_piece: formData.delivreLe || '',
        lieu_delivrance_piece: formData.delivreA || '',
        
        // NOUVEAU CHAMP : Provenance des fonds
        provenance_fonds: formData.provenance_fonds?.trim() || '',
        
        // Contexte de l'opération
        origine_fonds: formData.motif?.trim() || 'Versement espèces',
        // CORRECTION ICI: Utiliser la valeur de l'enum
        type_versement: formData.typeVersement,
        date_valeur: formData.dateValeur,
        ref_lettrage: formData.refLettrage?.trim() || '',
        
        // Informations de localisation
        agence_code: selectedAgence.code,
        guichet_code: selectedGuichet.code_guichet,
        caisse_code: selectedCaisse.code_caisse,
        caisse_id: selectedCaisse.id,
        guichet_id: selectedGuichet.id
      };
      
      console.log('=== DONNÉES PRÉPARÉES POUR LARAVEL ===');
      console.log('VersementData:', versementData);
      console.log('Billetage:', billetageValide);
      console.log('Type versement envoyé:', versementData.type_versement);
      console.log('Provenance des fonds:', versementData.provenance_fonds);
      
      try {
        const plafondCheck = await caisseServices.verifierPlafond(selectedCaisse.id, montant);
        if (!plafondCheck.success) {
          showSnackbar(`Attention: ${plafondCheck.message}`, 'warning');
          if (!window.confirm(`${plafondCheck.message}\n\nVoulez-vous continuer ?`)) {
            return;
          }
        }
      } catch (error) {
        console.warn('Erreur lors de la vérification du plafond:', error);
      }
      
      const result = await caisseServices.effectuerVersement(versementData, billetageValide);
      
      if (result.requires_validation) {
        setValidationData({
          demande_id: result.demande_id,
          message: result.message,
          montant: formData.montant
        });
        setValidationDialog(true);
        showSnackbar(result.message || 'Validation requise par l\'assistant', 'warning');
      } else if (result.success) {
        showSnackbar('Versement effectué avec succès !', 'success');
        console.log('Référence transaction:', result.data?.reference);
        
        // Préparer et sauvegarder les données du reçu
        const receiptData = prepareReceiptData();
        setLastSuccessfulTransaction(receiptData);
        
        // Ouvrir la modal de succès avec le reçu
        openSuccessModal(result.data);
        
        resetForm();
        
        if (result.data) {
          setSnackbar({
            open: true,
            message: `Versement réussi! Référence: ${result.data.reference}`,
            severity: 'success'
          });
        }
      } else {
        const errorMsg = result.message || 'Erreur lors du versement';
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
      showSnackbar('Erreur technique lors du versement', 'error');
    }
  };

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      agenceCode: '',
      selectedAgence: '',
      guichet: '',
      caisse: '',
      typeVersement: 'ESPECE',
      agenceCompte: '',
      compte: '',
      compte_id: null,
      chapitre: '',
      client: '',
      motif: '',
      dateOperation: new Date().toISOString().split('T')[0],
      dateValeur: new Date().toISOString().split('T')[0],
      dateIndisponible: '',
      smsEnabled: false,
      telephone: '',
      fraisEnCompte: true,
      montant: '',
      commissions: '0',
      taxes: '0',
      refLettrage: '',
      numero_bordereau: '',
      type_bordereau: 'VERSEMENT',
      nomRemettant: '',
      adresse: '',
      typeId: 'CNI',
      numeroId: '',
      delivreLe: '',
      delivreA: '',
      provenance_fonds: '',
      soldeComptable: '0',
      indisponible: '0',
      netEncaisser: '0',
      netCrediter: '0',
    });
    
    setBilletage(billetage.map(item => ({ ...item, quantite: 0 })));
    setCompteDetails(null);
    setGuichets([]);
    setCaisses([]);
  };

  const handleConfirmValidation = () => {
    setDialogOpen(false);
    handleSubmitVersement();
  };

  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette transaction ?')) {
      setDialogOpen(false);
      showSnackbar('Transaction annulée', 'info');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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

        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>
                Versement Espèces
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Interface de versement d'espèces - Turbobank
              </Typography>
            </Box>
            
            {/* NOUVEAU BOUTON: Imprimer le dernier reçu */}
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

          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f9fa' }}>
              <StyledTabs value={tabValue} onChange={handleTabChange} aria-label="versement tabs">
                <Tab 
                  label="Versement Espèces" 
                  icon={<AttachMoney fontSize="small" />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Remettant" 
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

            <Box sx={{ p: 3 }}>
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
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
                            />
                          </Grid>
                          
                          <Grid item xs={6}>
                            <FormControl sx={{minWidth: 200}} size="small">
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
                            <FormControl sx={{minWidth: 200}} size="small">
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
                            <FormControl sx={{minWidth: 200}} size="small">
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
                            <FormControl sx={{minWidth: 200}} size="small">
                              <InputLabel>Type versement *</InputLabel>
                              <Select
                                name="typeVersement"
                                value={formData.typeVersement}
                                label="Type versement *"
                                onChange={handleSelectChange}
                              >
                                <MenuItem value="ESPECE">Espèces</MenuItem>
                                <MenuItem value="ORANGE_MONEY">Orange Money</MenuItem>
                                <MenuItem value="MOBILE_MONEY">Mobile Money</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          
                         {/**<Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Agence Compte"
                              name="agenceCompte"
                              value={formData.agenceCompte}
                              onChange={handleChange}
                              placeholder="Code agence du compte"
                            />
                          </Grid> */} 
                        </Grid>
                      </CardContent>
                    </StyledCard>

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

                  <Grid item xs={12} md={6}>
                    <StyledCard sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 2, height: '100%' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Détails du Versement
                        </Typography>
                        <Grid container spacing={2}>
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
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Type bordereau</InputLabel>
                                  <Select
                                    name="type_bordereau"
                                    value={formData.type_bordereau}
                                    label="Type bordereau"
                                    onChange={handleSelectChange}
                                  >
                                    <MenuItem value="VERSEMENT">VERSEMENT</MenuItem>
                                    <MenuItem value="RETRAIT">RETRAIT</MenuItem>
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
                                  sx={{minWidth: 250}}
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
                              placeholder="Objet du versement"
                              multiline
                              rows={2}
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Provenance des fonds *"
                              name="provenance_fonds"
                              value={formData.provenance_fonds}
                              onChange={handleChange}
                              placeholder="Ex: Revenus professionnels, Épargne, Vente..."
                              required
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Grid container spacing={1.5}>
                              <Grid item xs={4}>
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
                                  helperText="Date automatique"
                                />
                              </Grid>
                              <Grid item xs={4}>
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
                                  helperText="Date automatique"
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Date indisponible"
                                  name="dateIndisponible"
                                  type="date"
                                  value={formData.dateIndisponible}
                                  onChange={handleChange}
                                  InputLabelProps={{ shrink: true }}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>

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
                                  sx={{ flexGrow: 1 }}
                                />
                              )}
                            </Box>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  name="fraisEnCompte"
                                  checked={formData.fraisEnCompte}
                                  onChange={handleChange}
                                />
                              }
                              label="Frais en compte"
                            />
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
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>

                  <Grid item xs={12}>
                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Billetage - Saisie des coupures *
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <TextField
                            size="small"
                            label="Montant à diviser"
                            value={formData.montant}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, montant: e.target.value }));
                              calculateBilletageFromAmount(e.target.value);
                            }}
                            type="number"
                            sx={{ width: 200 }}
                          />
                          <Button
                            variant="outlined"
                            startIcon={calculating ? <CircularProgress size={20} /> : <CalculateIcon />}
                            onClick={() => calculateBilletageFromAmount(formData.montant)}
                            disabled={calculating || !formData.montant || parseFloat(formData.montant) <= 0}
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
                          Le total du billetage doit correspondre au montant du versement
                        </Alert>
                      </CardContent>
                    </StyledCard>
                  </Grid>

                  <Grid item xs={12}>
                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Résumé Financier
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Montant brut</TableCell>
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
                                <TableCell sx={{ fontWeight: 600 }}>Net à encaisser</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#1976D2' }}>
                                  {formatCurrency(formData.netEncaisser)} FCFA
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Net à créditer</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                                  {formatCurrency(formData.netCrediter)} FCFA
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

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Identité du Remettant *
                        </Typography>
                        <Grid container spacing={1.5}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nom complet *"
                              name="nomRemettant"
                              value={formData.nomRemettant}
                              onChange={handleChange}
                              placeholder="Nom complet du remettant"
                              required
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
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <FormControl sx={{minWidth: 200}} size="small">
                              <InputLabel>Type pièce *</InputLabel>
                              <Select
                                name="typeId"
                                value={formData.typeId}
                                label="Type pièce *"
                                onChange={handleSelectChange}
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
                              label="N° Pièce *"
                              name="numeroId"
                              value={formData.numeroId}
                              onChange={handleChange}
                              placeholder="Numéro de pièce"
                              required
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
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <StyledCard sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Détails du compte sélectionné
                        </Typography>
                        {compteDetails ? (
                          <Box>
                            <InfoBox sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Numéro compte
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {compteDetails.numero_compte}
                              </Typography>
                            </InfoBox>
                            <InfoBox sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Client
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {compteDetails.client?.nom_complet || 
                                 compteDetails.client?.physique?.nom_prenoms || 
                                 'Client inconnu'}
                              </Typography>
                            </InfoBox>
                            <InfoBox sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Type client
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {compteDetails.client?.type_client || 'N/A'}
                              </Typography>
                            </InfoBox>
                            <InfoBox>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Solde actuel
                              </Typography>
                              <Typography variant="body2" fontWeight={500} color="success.main">
                                {parseFloat(compteDetails.solde || '0').toLocaleString()} FCFA
                              </Typography>
                            </InfoBox>
                            {compteDetails.plan_comptable && (
                              <InfoBox sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Plan comptable
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {compteDetails.plan_comptable.libelle} ({compteDetails.plan_comptable.code})
                                </Typography>
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

              <TabPanel value={tabValue} index={2}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                      Conditions de Banque
                    </Typography>
                    <Alert severity="info">
                      <Typography variant="body2">
                        Les conditions applicables à cette transaction s'affichent ici.
                        <br />
                        • Taux de commission: 0.5%
                        <br />
                        • Taxe: 100 FCFA fixe
                        <br />
                        • Montant minimum: 1000 FCFA
                        <br />
                        • Montant maximum: 10,000,000 FCFA
                      </Typography>
                    </Alert>
                  </CardContent>
                </StyledCard>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <StyledCard sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600, alignSelf: 'flex-start' }}>
                          Photo du remettant
                        </Typography>
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                          <Portrait sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
                          <Typography variant="body1" color="text.secondary" gutterBottom>
                            Aucune photo disponible
                          </Typography>
                          <Typography variant="body2" color="text.secondary" align="center">
                            La photo du remettant n'est pas disponible dans le système
                          </Typography>
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledCard sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Signature du remettant
                        </Typography>
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                          <Description sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
                          <Typography variant="body1" color="text.secondary" gutterBottom>
                            Aucune signature disponible
                          </Typography>
                          <Typography variant="body2" color="text.secondary" align="center">
                            La signature du remettant n'est pas disponible dans le système
                          </Typography>
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                </Grid>
              </TabPanel>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <SecondaryButton onClick={() => window.history.back()}>
                  Annuler
                </SecondaryButton>
                <GradientButton
                  variant="contained"
                  onClick={handleSubmitVersement}
                  startIcon={<CheckCircle />}
                  disabled={
                    !formData.compte_id || 
                    !formData.montant || 
                    parseFloat(formData.montant) <= 0 ||
                    !formData.nomRemettant ||
                    !formData.numeroId ||
                    !formData.provenance_fonds ||
                    billetage.every(item => item.quantite === 0) ||
                    !formData.selectedAgence ||
                    !formData.guichet ||
                    !formData.caisse
                  }
                >
                  Valider le versement
                </GradientButton>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle color="primary" />
          Confirmation de validation
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Aucun désaccord détecté. La caisse est soumise à billetage.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Souhaitez-vous confirmer cette transaction ?
            <br />
            Un reçu de caisse sera édité après confirmation.
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" display="block" color="text.secondary">
              Détails de la transaction:
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
              • Type versement: {formData.typeVersement === 'ESPECE' ? 'Espèces' : 
                                formData.typeVersement === 'ORANGE_MONEY' ? 'Orange Money' :
                                formData.typeVersement === 'MOBILE_MONEY' ? 'Mobile Money' : 'Autres'}
              <br />
              • Montant: {formatCurrency(formData.montant)} FCFA
              <br />
              • Remettant: {formData.nomRemettant}
              <br />
              • Provenance des fonds: {formData.provenance_fonds}
              <br />
              • Net à créditer: {formatCurrency(formData.netCrediter)} FCFA
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
            Confirmer le versement
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
          Versement effectué avec succès !
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
                  Remettant :
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {successModal.transactionData?.remettant || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500, textAlign: 'center' }}>
            Télécharger le reçu de votre versement <span style={{ color: 'red' }}>AVANT DE FERMER CETTE POP-UP</span>
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
          
          {/* NOUVELLE SECTION : Message d'information */}
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

      {/* Élément caché pour le reçu (utilisé pour la génération PDF) */}
      <div ref={receiptRef} style={{ position: 'absolute', left: '-9999px', top: '0' }}></div>

      <Dialog open={validationDialog} onClose={() => setValidationDialog(false)}>
        <DialogTitle>
          <Warning color="warning" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Validation requise par l'assistant comptable
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {validationData?.message || "Cette opération nécessite une validation supplémentaire car elle dépasse votre plafond."}
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Demande #{validationData?.demande_id} en attente d'approbation
          </Alert>
          <Typography variant="body2" color="text.secondary">
            L'assistant comptable doit approuver cette transaction. Vous serez notifié lorsqu'une décision sera prise.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidationDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

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

export default Versement;