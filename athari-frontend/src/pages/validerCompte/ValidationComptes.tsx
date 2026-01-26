import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  InputAdornment,
  Badge,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CardActions,
  ListItemAvatar,
  CardHeader,
  LinearProgress,
  DialogContentText,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  GppMaybe as OppositionIcon,
  Person as PersonIcon,
  AccountBalance as AccountIcon,
  MonetizationOn as CurrencyIcon,
  Event as DateIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Update as UpdateIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Description as DocumentIcon,
  Photo as PhotoIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  BusinessCenter as BusinessCenterIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  Fingerprint as FingerprintIcon,
  AssignmentInd as AssignmentIndIcon,
  Task as TaskIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from '@mui/icons-material';
import { indigo, blueGrey, cyan, red, green, orange, amber, purple, deepPurple, grey } from '@mui/material/colors';
import Layout from '../../components/layout/Layout';
import ApiClient from '../../services/api/ApiClient';
import { compteService } from '../../services/api/compteService';

// Types pour les données
interface ClientMorale {
  id: number;
  client_id: number;
  nui: string;
  niu_image: string | null;
  niu_image_url: string | null;
  pv_agc_image: string | null;
  pv_agc_image_url: string | null;
  attestation_non_redevance_image: string | null;
  attestation_non_redevance_image_url: string | null;
  proces_verbal_image: string | null;
  proces_verbal_image_url: string | null;
  registre_coop_gic_image: string | null;
  registre_coop_gic_image_url: string | null;
  recepisse_declaration_association_image: string | null;
  recepisse_declaration_association_image_url: string | null;
  acte_designation_signataires_pdf: string | null;
  acte_designation_signataires_pdf_url: string | null;
  liste_conseil_administration_pdf: string | null;
  liste_conseil_administration_pdf_url: string | null;
  attestation_conformite_pdf: string | null;
  attestation_conformite_pdf_url: string | null;
  plan_localisation_signataire1_image: string | null;
  plan_localisation_signataire1_image_url: string | null;
  plan_localisation_signataire2_image: string | null;
  plan_localisation_signataire2_image_url: string | null;
  plan_localisation_signataire3_image: string | null;
  plan_localisation_signataire3_image_url: string | null;
  facture_eau_signataire1_image: string | null;
  facture_eau_signataire1_image_url: string | null;
  facture_eau_signataire2_image: string | null;
  facture_eau_signataire2_image_url: string | null;
  facture_eau_signataire3_image: string | null;
  facture_eau_signataire3_image_url: string | null;
  facture_electricite_signataire1_image: string | null;
  facture_electricite_signataire1_image_url: string | null;
  facture_electricite_signataire2_image: string | null;
  facture_electricite_signataire2_image_url: string | null;
  facture_electricite_signataire3_image: string | null;
  facture_electricite_signataire3_image_url: string | null;
  plan_localisation_siege_image: string | null;
  plan_localisation_siege_image_url: string | null;
  facture_eau_siege_image: string | null;
  facture_eau_siege_image_url: string | null;
  facture_electricite_siege_image: string | null;
  facture_electricite_siege_image_url: string | null;
  [key: string]: any;
}

interface ClientPhysique {
  id: number;
  client_id: number;
  nui: string;
  niu_image: string | null;
  niu_image_url: string | null;
  cni_recto: string | null;
  cni_recto_url: string | null;
  cni_verso: string | null;
  cni_verso_url: string | null;
  [key: string]: any;
}

interface Client {
  id: number;
  num_client: string;
  type_client: 'physique' | 'morale';
  nom: string;
  nom_complet: string;
  prenom: string;
  telephone: string;
  email: string | null;
  adresse_ville: string;
  adresse_quartier: string;
  bp: string;
  pays_residence: string;
  nui: string | null;
  
  physique?: ClientPhysique;
  morale?: ClientMorale;
  
  created_at: string;
  updated_at: string;
}

interface Compte {
  id: number;
  numero_compte: string;
  client_id: number;
  type_compte_id: number;
  plan_comptable_id: number | null;
  solde: number | string;
  solde_disponible: number | string;
  solde_bloque: number | string;
  devise: string;
  gestionnaire_nom: string;
  gestionnaire_prenom: string;
  gestionnaire_code: string;
  rubriques_mata: Record<string, any> | null;
  duree_blocage_mois: number | null;
  statut: 'actif' | 'inactif' | 'cloture' | 'suspendu' | 'en_attente';
  notice_acceptee: boolean;
  date_acceptation_notice: string | null;
  signature_path: string | null;
  date_ouverture: string;
  date_cloture: string | null;
  observations: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  validation_chef_agence: boolean;
  validation_juridique: boolean;
  dossier_complet: boolean;
  est_en_opposition: boolean;
  etat: string;
  motif_rejet: string | null;
  checklist_juridique: any[] | null;
  date_validation_juridique: string | null;
  date_rejet: string | null;
  rejete_par: number | null;
  ca_id: number | null;
  juriste_id: number | null;
  
  type_compte: {
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
  };
  
  client: Client;
  
  plan_comptable?: {
    id: number;
    code: string;
    libelle: string;
    categorie_id?: number;
    nature_solde?: string;
  };
  
  mandataires?: Array<{
    id: number;
    nom: string;
    prenom: string;
    relation: string;
  }>;
  
  chefAgence?: {
    id: number;
    name: string;
    email: string;
  };
  
  juriste?: {
    id: number;
    name: string;
    email: string;
  };
  
  rejetePar?: {
    id: number;
    name: string;
    email: string;
  };
}

type EtatValidation = 'enAttenteValidation' | 'MiseEnOposition';

interface ValidationDialogState {
  open: boolean;
  compte: Compte | null;
  action: 'valider' | 'leverOpposition' | null;
}

interface LeverOppositionDialogState {
  open: boolean;
  compte: Compte | null;
  checklist: {
    cni_valide: boolean;
    plan_localisation: boolean;
    photo_identite: boolean;
    signature_specimen: boolean;
  };
}

interface RejetDialogState {
  open: boolean;
  compte: Compte | null;
  motif: string;
}

const CustomAlert = ({ 
  onClose, 
  severity, 
  children, 
  ...props 
}: { 
  onClose?: () => void;
  severity: 'success' | 'error' | 'info' | 'warning';
  children: React.ReactNode;
}) => {
  return (
    <Alert 
      onClose={onClose} 
      severity={severity} 
      elevation={6} 
      variant="filled" 
      {...props}
      sx={{ width: '100%' }}
    >
      {children}
    </Alert>
  );
};

export default function ValidationComptes() {
  const navigate = useNavigate();
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [filteredComptes, setFilteredComptes] = useState<Compte[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [filterEtat, setFilterEtat] = useState<EtatValidation | 'tous'>('tous');
  
  const [detailDialog, setDetailDialog] = useState<{ 
    open: boolean; 
    compte: Compte | null;
    activeTab: number;
  }>({
    open: false,
    compte: null,
    activeTab: 0,
  });
  
  const [validationDialog, setValidationDialog] = useState<ValidationDialogState>({
    open: false,
    compte: null,
    action: null,
  });
  
  const [leverOppositionDialog, setLeverOppositionDialog] = useState<LeverOppositionDialogState>({
    open: false,
    compte: null,
    checklist: {
      cni_valide: false,
      plan_localisation: false,
      photo_identite: false,
      signature_specimen: false,
    }
  });
  
  const [rejetDialog, setRejetDialog] = useState<RejetDialogState>({
    open: false,
    compte: null,
    motif: '',
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [checklistItems, setChecklistItems] = useState<{id: string, label: string, checked: boolean}[]>([]);
  const [validationDirecteInProgress, setValidationDirecteInProgress] = useState(false);

  useEffect(() => {
    fetchComptes();
  }, []);

  useEffect(() => {
    let filtered = comptes;
    
    if (filterEtat !== 'tous') {
      filtered = filtered.filter(compte => {
        if (filterEtat === 'enAttenteValidation') {
          return !compte.validation_chef_agence || !compte.validation_juridique;
        } else if (filterEtat === 'MiseEnOposition') {
          return compte.est_en_opposition;
        }
        return false;
      });
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(compte => 
        compte.numero_compte.toLowerCase().includes(searchLower) ||
        (compte.client.nom_complet || `${compte.client.nom} ${compte.client.prenom}`).toLowerCase().includes(searchLower) ||
        compte.client.email?.toLowerCase().includes(searchLower) ||
        compte.type_compte.libelle.toLowerCase().includes(searchLower) ||
        (compte.gestionnaire_code?.toLowerCase() || '').includes(searchLower)
      );
    }
    
    filtered = filtered.filter(compte => 
      compte.statut === 'en_attente' || compte.statut === 'actif'
    );
    
    setFilteredComptes(filtered);
    setPage(0);
  }, [comptes, search, filterEtat]);

  const fetchComptes = async () => {
    setLoading(true);
    try {
      const data = await compteService.getComptes();
      setComptes(data);
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error);
      showSnackbar('Erreur lors du chargement des comptes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: EtatValidation | 'tous') => {
    if (newFilter !== null) {
      setFilterEtat(newFilter);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const handleViewDetails = () => {
    if (selectedId) {
      const compte = comptes.find(c => c.id === selectedId);
      if (compte) {
        setDetailDialog({
          open: true,
          compte: compte,
          activeTab: 0,
        });
      }
    }
    handleMenuClose();
  };

  // Fonction pour vérifier si tous les documents requis sont présents POUR LA LEVÉE D'OPPOSITION SEULEMENT
  const checkDocumentsForOpposition = (compte: Compte) => {
    const client = compte.client;
    
    if (client.type_client === 'physique') {
      // Pour client physique, vérifier les documents requis pour la levée d'opposition
      const physique = client.physique;
      const documentsRequis = [
        physique?.cni_recto_url,           // CNI Recto
        physique?.cni_verso_url,           // CNI Verso
        physique?.niu_image_url,           // NUI (Image)
        physique?.photo_url,                  // Photo du client
        client.photo_localisation_domicile, // Photo localisation domicile
        physique?.nui                      // Informations NUI (texte)
      ];
      
      // Vérifier si tous les documents requis sont présents (non null/undefined)
      const tousDocumentsPresents = documentsRequis.every(doc => 
        doc !== null && doc !== undefined && doc !== ''
      );
      
      return tousDocumentsPresents;
    } else if (client.type_client === 'morale') {
      // Pour client moral, vérifier les documents requis pour la levée d'opposition
      const morale = client.morale;
      const documentsRequis = [
        morale?.plan_localisation_siege_image_url, // plan_localisation_siege_image
        morale?.nui,                           // nui (texte)
        morale?.niu_image_url,                 // niu_image
        morale?.acte_designation_signataires_pdf_url // acte_designation_signataires_pdf
      ];
      
      // Vérifier si tous les documents requis sont présents (non null/undefined)
      const tousDocumentsPresents = documentsRequis.every(doc => 
        doc !== null && doc !== undefined && doc !== ''
      );
      
      return tousDocumentsPresents;
    }
    
    return false;
  };

  // Fonction pour le bouton Valider dans le menu contextuel (ouvre modal avec checkboxes)
  const handleValidateClick = () => {
    if (selectedId) {
      const compte = comptes.find(c => c.id === selectedId);
      if (compte) {
        // Réinitialiser les checkboxes à chaque ouverture
        initializeChecklist(compte);
        setValidationDialog({
          open: true,
          compte: compte,
          action: 'valider',
        });
      }
    }
    handleMenuClose();
  };

  // Fonction pour valider directement depuis la modal de détail (appel API direct)
  const handleValidateDirect = async (compte: Compte) => {
    setValidationDirecteInProgress(true);
    try {
      // Récupérer le NUI selon le type de client
      const nui = compte.client.type_client === 'physique' 
        ? compte.client.physique?.nui 
        : compte.client.morale?.nui;
      
      const response = await ApiClient.post(`/comptes/${compte.id}/valider`, {
        checkboxes: [], // Validation directe sans checklist
        nui: nui,
      });
      
      await fetchComptes();
      
      showSnackbar(response.data.message || 'Compte validé avec succès', 'success');
      handleCloseDetailDialog();
    } catch (error: any) {
      console.error('Erreur lors de la validation directe:', error);
      showSnackbar(
        error.response?.data?.message || 'Erreur lors de la validation du compte',
        'error'
      );
    } finally {
      setValidationDirecteInProgress(false);
    }
  };

  // Fonction pour le bouton Lever l'opposition dans le menu contextuel
  const handleLeverOppositionValidateClick = () => {
    if (selectedId) {
      const compte = comptes.find(c => c.id === selectedId);
      if (compte) {
        setLeverOppositionDialog({
          open: true,
          compte: compte,
          checklist: {
            cni_valide: false,
            plan_localisation: false,
            photo_identite: false,
            signature_specimen: false,
          }
        });
      }
    }
    handleMenuClose();
  };

  const handleRejectClick = () => {
    if (selectedId) {
      const compte = comptes.find(c => c.id === selectedId);
      if (compte) {
        setRejetDialog({
          open: true,
          compte: compte,
          motif: '',
        });
      }
    }
    handleMenuClose();
  };

  // Fonction pour le bouton Rejeter dans la modal de détail
  const handleRejectInDialog = () => {
    if (detailDialog.compte) {
      setRejetDialog({
        open: true,
        compte: detailDialog.compte,
        motif: '',
      });
    }
  };

  const handleCloseDetailDialog = () => {
    setDetailDialog({ open: false, compte: null, activeTab: 0 });
  };

  const handleCloseValidationDialog = () => {
    setValidationDialog({ open: false, compte: null, action: null });
  };

  const handleCloseLeverOppositionDialog = () => {
    setLeverOppositionDialog({
      open: false,
      compte: null,
      checklist: {
        cni_valide: false,
        plan_localisation: false,
        photo_identite: false,
        signature_specimen: false,
      }
    });
  };

  const handleCloseRejetDialog = () => {
    setRejetDialog({ open: false, compte: null, motif: '' });
  };

  const handleRejetMotifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRejetDialog(prev => ({ ...prev, motif: e.target.value }));
  };

  // Fonction pour valider un compte via modal avec checklist (depuis menu contextuel)
  const handleValidateCompte = async () => {
    if (!validationDialog.compte) return;
    
    setLoadingAction(true);
    try {
      // Récupérer le NUI selon le type de client
      const nui = validationDialog.compte.client.type_client === 'physique' 
        ? validationDialog.compte.client.physique?.nui 
        : validationDialog.compte.client.morale?.nui;
      
      const response = await ApiClient.post(`/comptes/${validationDialog.compte.id}/valider`, {
        checkboxes: checklistItems.filter(item => item.checked).map(item => item.id),
        nui: nui,
      });
      
      await fetchComptes();
      
      showSnackbar(response.data.message || 'Compte validé avec succès', 'success');
      handleCloseValidationDialog();
    } catch (error: any) {
      console.error('Erreur lors de la validation:', error);
      showSnackbar(
        error.response?.data?.message || 'Erreur lors de la validation du compte',
        'error'
      );
    } finally {
      setLoadingAction(false);
    }
  };

  // Fonction pour lever l'opposition
  const handleLeverOppositionCompte = async () => {
    if (!leverOppositionDialog.compte) return;
    
    setLoadingAction(true);
    try {
      // Vérifier si tous les documents sont présents pour la levée d'opposition
      const documentsPresents = checkDocumentsForOpposition(leverOppositionDialog.compte);
      if (!documentsPresents) {
        showSnackbar('Tous les documents requis ne sont pas présents. Impossible de lever l\'opposition.', 'error');
        setLoadingAction(false);
        return;
      }
      
      // Préparer les données pour lever l'opposition
      const checkboxesArray = [];
      if (leverOppositionDialog.checklist.cni_valide) checkboxesArray.push('cni_valide');
      if (leverOppositionDialog.checklist.plan_localisation) checkboxesArray.push('plan_localisation');
      if (leverOppositionDialog.checklist.photo_identite) checkboxesArray.push('photo_identite');
      if (leverOppositionDialog.checklist.signature_specimen) checkboxesArray.push('signature_specimen');
      
      // Récupérer le NUI selon le type de client
      const nui = leverOppositionDialog.compte.client.type_client === 'physique' 
        ? leverOppositionDialog.compte.client.physique?.nui 
        : leverOppositionDialog.compte.client.morale?.nui;
      
      const response = await ApiClient.post(`/comptes/${leverOppositionDialog.compte.id}/valider`, {
        checkboxes: checkboxesArray,
        nui: nui,
      });
      
      await fetchComptes();
      
      showSnackbar(response.data.message || 'Opposition levée avec succès', 'success');
      handleCloseLeverOppositionDialog();
    } catch (error: any) {
      console.error('Erreur lors de la levée d\'opposition:', error);
      showSnackbar(
        error.response?.data?.message || 'Erreur lors de la levée d\'opposition',
        'error'
      );
    } finally {
      setLoadingAction(false);
    }
  };

  // Fonction pour rejeter un compte
  const handleRejectCompte = async () => {
    if (!rejetDialog.compte || !rejetDialog.motif.trim()) {
      showSnackbar('Veuillez saisir un motif de rejet', 'warning');
      return;
    }
    
    setLoadingAction(true);
    try {
      const response = await ApiClient.post(`/comptes/${rejetDialog.compte.id}/rejeter`, {
        motif_rejet: rejetDialog.motif,
      });
      
      await fetchComptes();
      
      showSnackbar(response.data.message || 'Compte rejeté avec succès', 'success');
      handleCloseRejetDialog();
      handleCloseDetailDialog();
    } catch (error: any) {
      console.error('Erreur lors du rejet:', error);
      showSnackbar(
        error.response?.data?.message || 'Erreur lors du rejet du compte',
        'error'
      );
    } finally {
      setLoadingAction(false);
    }
  };

  // Gestion des changements de checklist pour lever l'opposition
  const handleLeverOppositionChecklistChange = (field: keyof LeverOppositionDialogState['checklist']) => {
    setLeverOppositionDialog(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [field]: !prev.checklist[field]
      }
    }));
  };

  const getValidationEtat = (compte: Compte): EtatValidation | 'valide' => {
    if (compte.est_en_opposition) {
      return 'MiseEnOposition';
    } else if (!compte.validation_chef_agence || !compte.validation_juridique) {
      return 'enAttenteValidation';
    } else {
      return 'valide';
    }
  };

  const getEtatColor = (etat: EtatValidation | 'valide') => {
    switch (etat) {
      case 'valide':
        return green[600];
      case 'enAttenteValidation':
        return amber[600];
      case 'MiseEnOposition':
        return red[600];
      default:
        return blueGrey[500];
    }
  };

  const getEtatIcon = (etat: EtatValidation | 'valide') => {
    switch (etat) {
      case 'valide':
        return <CheckCircleIcon />;
      case 'enAttenteValidation':
        return <UpdateIcon />;
      case 'MiseEnOposition':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getEtatLabel = (etat: EtatValidation | 'valide') => {
    switch (etat) {
      case 'valide':
        return 'Validé';
      case 'enAttenteValidation':
        return 'En attente de validation';
      case 'MiseEnOposition':
        return 'En opposition';
      default:
        return 'Inconnu';
    }
  };

  const getStatutColor = (statut: Compte['statut']) => {
    switch (statut) {
      case 'actif':
        return green[500];
      case 'en_attente':
        return orange[500];
      case 'inactif':
        return grey[500];
      case 'cloture':
        return red[500];
      case 'suspendu':
        return purple[500];
      default:
        return blueGrey[500];
    }
  };

  const getStatutLabel = (statut: Compte['statut']) => {
    switch (statut) {
      case 'actif':
        return 'Actif';
      case 'en_attente':
        return 'En attente';
      case 'inactif':
        return 'Inactif';
      case 'cloture':
        return 'Clôturé';
      case 'suspendu':
        return 'Suspendu';
      default:
        return 'Inconnu';
    }
  };

  const getDeviseColor = (devise: string) => {
    switch (devise.toUpperCase()) {
      case 'FCFA':
        return deepPurple[500];
      case 'EURO':
        return indigo[500];
      case 'DOLLAR':
        return green[500];
      case 'POUND':
        return red[500];
      default:
        return blueGrey[500];
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const formatSolde = (solde: number | string, devise: string) => {
    const soldeNum = typeof solde === 'string' ? parseFloat(solde) : solde;
    const deviseSymbols: Record<string, string> = {
      'FCFA': 'FCFA',
      'EURO': '€',
      'DOLLAR': '$',
      'POUND': '£',
    };
    
    const deviseSymbol = deviseSymbols[devise.toUpperCase()] || devise;
    
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(soldeNum) + ` ${deviseSymbol}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const countByEtat = {
    enAttenteValidation: comptes.filter(c => getValidationEtat(c) === 'enAttenteValidation').length,
    MiseEnOposition: comptes.filter(c => getValidationEtat(c) === 'MiseEnOposition').length,
    valide: comptes.filter(c => getValidationEtat(c) === 'valide').length,
  };

  const renderDocument = (label: string, url: string | null, type: 'image' | 'pdf' = 'image') => {
    if (!url) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          {label}: Non fourni
        </Typography>
      );
    }
    
    return (
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" fontWeight="medium" gutterBottom>
          {label}:
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={type === 'pdf' ? <PdfIcon /> : <ImageIcon />}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Voir le document
        </Button>
      </Box>
    );
  };

  const renderDocuments = (compte: Compte) => {
    const client = compte.client;
    
    if (client.type_client === 'physique' && client.physique) {
      const physique = client.physique;
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderDocument('Photo du client', physique.photo_url)}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderDocument('CNI Recto', physique.cni_recto_url)}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderDocument('CNI Verso', physique.cni_verso_url)}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderDocument('Photo localisation domicile', client.photo_localisation_domicile)}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderDocument('NUI (Image)', physique.niu_image_url)}
          </Grid>
          
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Informations NUI:
                </Typography>
                <Typography variant="body2">
                  {physique.nui || 'Non renseigné'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    } else if (client.type_client === 'morale' && client.morale) {
      const morale = client.morale;
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderDocument('NUI (Image)', morale.niu_image_url)}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderDocument('PV AGC', morale.pv_agc_image_url)}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderDocument('Attestation non redevance', morale.attestation_non_redevance_image_url)}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderDocument('Procès verbal', morale.proces_verbal_image_url)}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderDocument('Registre coopérative', morale.registre_coop_gic_image_url)}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderDocument('Récépissé déclaration association', morale.recepisse_declaration_association_image_url)}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderDocument('Acte désignation signataires', morale.acte_designation_signataires_pdf_url, 'pdf')}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderDocument('Liste conseil administration', morale.liste_conseil_administration_pdf_url, 'pdf')}
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2, mt: 2 }}>
              Localisation et factures du siège
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            {renderDocument('Localisation siège', morale.plan_localisation_siege_image_url)}
          </Grid>
          
          <Grid item xs={12} md={4}>
            {renderDocument('Facture eau siège', morale.facture_eau_siege_image_url)}
          </Grid>
          
          <Grid item xs={12} md={4}>
            {renderDocument('Facture électricité siège', morale.facture_electricite_siege_image_url)}
          </Grid>
          
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Informations NUI:
                </Typography>
                <Typography variant="body2">
                  {morale.nui || 'Non renseigné'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }
    
    return (
      <Alert severity="warning">
        Aucun document disponible pour ce client.
      </Alert>
    );
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setDetailDialog(prev => ({ ...prev, activeTab: newValue }));
  };

  // Fonction pour vérifier si tous les checkboxes sont cochés dans la levée d'opposition
  const areAllOppositionCheckboxesChecked = () => {
    return Object.values(leverOppositionDialog.checklist).every(value => value);
  };

  // Fonction pour initialiser les checkboxes
  const initializeChecklist = (compte: Compte) => {
    // D'abord réinitialiser les checkboxes
    setChecklistItems([]);
    
    // Utiliser setTimeout pour s'assurer que la réinitialisation est faite avant de définir les nouvelles valeurs
    setTimeout(() => {
      if (compte.checklist_juridique && Array.isArray(compte.checklist_juridique)) {
        setChecklistItems(compte.checklist_juridique.map((item: any) => ({
          id: item.id || item.label,
          label: item.label || item,
          checked: item.checked || false,
        })));
      } else {
        const client = compte.client;
        let defaultChecklist = [];
        
        if (client.type_client === 'physique') {
          defaultChecklist = [
            { id: 'documents_complets', label: 'Tous les documents sont complets (CNI, photo, signature)', checked: false },
            { id: 'identite_verifiee', label: 'Identité du client vérifiée', checked: false },
            { id: 'conformite_legale', label: 'Conformité légale vérifiée', checked: false },
            { id: 'signatures_valides', label: 'Signatures valides', checked: false },
            { id: 'localisations_verifiees', label: 'Localisations vérifiées', checked: false },
          ];
        } else {
          defaultChecklist = [
            { id: 'documents_legaux_complets', label: 'Documents légaux complets (PV AGC, statuts, etc.)', checked: false },
            { id: 'representants_verifies', label: 'Représentants légaux vérifiés', checked: false },
            { id: 'conformite_legale', label: 'Conformité légale de l\'entreprise vérifiée', checked: false },
            { id: 'signatures_valides', label: 'Signatures des mandataires valides', checked: false },
            { id: 'localisations_verifiees', label: 'Localisations du siège et signataires vérifiées', checked: false },
            { id: 'factures_verifiees', label: 'Factures de services vérifiées', checked: false },
          ];
        }
        setChecklistItems(defaultChecklist);
      }
    }, 0);
  };

  const handleChecklistChange = (id: string) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const snackbarAction = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseSnackbar}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <Layout>
      <Box sx={{ minHeight: '100vh', bgcolor: blueGrey[50], py: 4 }}>
        <Container maxWidth="xl">
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: indigo[900] }}>
                Validation des Comptes
              </Typography>
              <Badge
                badgeContent={countByEtat.enAttenteValidation + countByEtat.MiseEnOposition}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: red[500],
                    fontSize: '1rem',
                    padding: '0 8px',
                  },
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Comptes à traiter
                </Typography>
              </Badge>
            </Box>

            {/* Filtres et statistiques */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Rechercher par numéro, client, email, gestionnaire..."
                  value={search}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <ToggleButtonGroup
                  value={filterEtat}
                  exclusive
                  onChange={handleFilterChange}
                  aria-label="filtre état"
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="tous" aria-label="tous">
                    <Typography variant="body2">Tous ({comptes.length})</Typography>
                  </ToggleButton>
                  <ToggleButton value="enAttenteValidation" aria-label="en attente">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <UpdateIcon fontSize="small" sx={{ color: amber[600] }} />
                      <Typography variant="body2">En attente ({countByEtat.enAttenteValidation})</Typography>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="MiseEnOposition" aria-label="opposition">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon fontSize="small" sx={{ color: red[600] }} />
                      <Typography variant="body2">Opposition ({countByEtat.MiseEnOposition})</Typography>
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              {/* Statistiques */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Chip
                            label={countByEtat.enAttenteValidation}
                            size="small"
                            sx={{ backgroundColor: amber[100], color: amber[800], mb: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            En attente de validation
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Chip
                            label={countByEtat.MiseEnOposition}
                            size="small"
                            sx={{ backgroundColor: red[100], color: red[800], mb: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            En opposition
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Chip
                            label={countByEtat.valide}
                            size="small"
                            sx={{ backgroundColor: green[100], color: green[800], mb: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Validés
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Chip
                            label={comptes.length}
                            size="small"
                            sx={{ backgroundColor: indigo[100], color: indigo[800], mb: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Total des comptes
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            {/* Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: indigo[50] }}>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Numéro Compte</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Client</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Type Compte</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Solde</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Devise</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Type Client</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>État</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Date Ouverture</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                        <CircularProgress />
                        <Typography sx={{ mt: 2 }}>Chargement des comptes...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredComptes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                        <Typography color="text.secondary">
                          {search || filterEtat !== 'tous' 
                            ? 'Aucun compte ne correspond à vos critères de recherche' 
                            : 'Aucun compte trouvé'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComptes
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((compte) => {
                        const etat = getValidationEtat(compte);
                        const clientName = compte.client.nom_complet || `${compte.client.nom} ${compte.client.prenom}`;
                        
                        return (
                          <TableRow 
                            key={compte.id}
                            hover
                            sx={{ 
                              '&:hover': { backgroundColor: blueGrey[50] },
                            }}
                          >
                            <TableCell>
                              <Typography fontWeight="medium" color="primary">
                                {compte.numero_compte}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {compte.id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ bgcolor: indigo[100], color: indigo[700], width: 32, height: 32 }}>
                                  <PersonIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {clientName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {compte.client.email || 'Pas d\'email'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {compte.type_compte.libelle}
                              </Typography>
                              {compte.rubriques_mata && Object.keys(compte.rubriques_mata).length > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                  MATA: {Object.keys(compte.rubriques_mata).join(', ')}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                fontWeight="bold"
                                color={Number(compte.solde) >= 0 ? 'success.main' : 'error.main'}
                              >
                                {formatSolde(compte.solde, compte.devise)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={compte.devise}
                                size="small"
                                sx={{
                                  backgroundColor: getDeviseColor(compte.devise),
                                  color: 'white',
                                  fontWeight: 'medium',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={compte.client.type_client === 'physique' ? 'Physique' : 'Moral'}
                                size="small"
                                sx={{
                                  backgroundColor: compte.client.type_client === 'physique' ? indigo[100] : purple[100],
                                  color: compte.client.type_client === 'physique' ? indigo[800] : purple[800],
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getEtatIcon(etat)}
                                label={getEtatLabel(etat)}
                                size="small"
                                sx={{
                                  backgroundColor: getEtatColor(etat),
                                  color: 'white',
                                  fontWeight: 'medium',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatutLabel(compte.statut)}
                                size="small"
                                sx={{
                                  backgroundColor: getStatutColor(compte.statut),
                                  color: 'white',
                                  fontWeight: 'medium',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(compte.date_ouverture)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Voir les détails">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setDetailDialog({ 
                                        open: true, 
                                        compte,
                                        activeTab: 0
                                      });
                                    }}
                                    color="primary"
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Options">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleMenuOpen(e, compte.id)}
                                  >
                                    <MoreVertIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredComptes.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page :"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />

            {/* Menu contextuel */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleViewDetails}>
                <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                Voir les détails
              </MenuItem>
              
              {selectedId && (() => {
                const compte = comptes.find(c => c.id === selectedId);
                if (!compte) return null;
                
                const etat = getValidationEtat(compte);
                
                return (
                  <>
                    {/* Bouton Valider dans le menu contextuel - ouvre modal avec checkboxes */}
                    {etat === 'enAttenteValidation' && (
                      <MenuItem onClick={handleValidateClick}>
                        <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: green[600] }} />
                        Valider le compte
                      </MenuItem>
                    )}
                    
                    {/* Bouton VALIDER pour lever l'opposition */}
                    {etat === 'MiseEnOposition' && (
                      <MenuItem onClick={handleLeverOppositionValidateClick}>
                        <LockOpenIcon fontSize="small" sx={{ mr: 1, color: green[600] }} />
                        VALIDER le compte
                      </MenuItem>
                    )}
                    
                    <MenuItem onClick={handleRejectClick}>
                      <CancelIcon fontSize="small" sx={{ mr: 1, color: red[600] }} />
                      Rejeter le compte
                    </MenuItem>
                  </>
                );
              })()}
            </Menu>

            {/* Dialog de détails du compte */}
            <Dialog
              open={detailDialog.open}
              onClose={handleCloseDetailDialog}
              maxWidth="lg"
              fullWidth
              fullScreen={window.innerWidth < 900}
            >
              {detailDialog.compte && (
                <>
                  <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: indigo[100], color: indigo[700] }}>
                        <AccountIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">
                          Détails du compte
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {detailDialog.compte.numero_compte} • Client: {detailDialog.compte.client.nom_complet || `${detailDialog.compte.client.nom} ${detailDialog.compte.client.prenom}`}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={getStatutLabel(detailDialog.compte.statut)}
                          size="small"
                          sx={{
                            backgroundColor: getStatutColor(detailDialog.compte.statut),
                            color: 'white',
                          }}
                        />
                        <Chip
                          label={getEtatLabel(getValidationEtat(detailDialog.compte))}
                          size="small"
                          sx={{
                            backgroundColor: getEtatColor(getValidationEtat(detailDialog.compte)),
                            color: 'white',
                          }}
                        />
                      </Box>
                    </Box>
                  </DialogTitle>
                  
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                      value={detailDialog.activeTab}
                      onChange={handleTabChange}
                      variant="scrollable"
                      scrollButtons="auto"
                    >
                      <Tab icon={<AccountIcon />} label="Informations Compte" />
                      <Tab icon={<PersonIcon />} label="Informations Client" />
                      <Tab icon={<DocumentIcon />} label="Documents" />
                      <Tab icon={<TaskIcon />} label="Validations" />
                    </Tabs>
                  </Box>
                  
                  <DialogContent dividers sx={{ minHeight: '60vh' }}>
                    {detailDialog.activeTab === 0 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                            Informations générales
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Numéro de compte
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {detailDialog.compte.numero_compte}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Type de compte
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {detailDialog.compte.type_compte.libelle}
                          </Typography>
                        </Grid>
                        
                        {detailDialog.compte.plan_comptable && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                              Plan comptable
                            </Typography>
                            <Typography variant="body1">
                              {detailDialog.compte.plan_comptable.libelle} ({detailDialog.compte.plan_comptable.code})
                            </Typography>
                          </Grid>
                        )}
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Gestionnaire
                          </Typography>
                          <Typography variant="body1">
                            {detailDialog.compte.gestionnaire_code || 'Non assigné'} - {detailDialog.compte.gestionnaire_nom} {detailDialog.compte.gestionnaire_prenom}
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2, mt: 2 }}>
                            Informations financières
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Solde actuel
                          </Typography>
                          <Typography variant="h6" color={Number(detailDialog.compte.solde) >= 0 ? 'success.main' : 'error.main'}>
                            {formatSolde(detailDialog.compte.solde, detailDialog.compte.devise)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Devise
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={detailDialog.compte.devise}
                              sx={{
                                backgroundColor: getDeviseColor(detailDialog.compte.devise),
                                color: 'white',
                              }}
                            />
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2, mt: 2 }}>
                            Dates
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Date d'ouverture
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(detailDialog.compte.date_ouverture)}
                          </Typography>
                        </Grid>
                        
                        {detailDialog.compte.date_cloture && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                              Date de clôture
                            </Typography>
                            <Typography variant="body1">
                              {formatDate(detailDialog.compte.date_cloture)}
                            </Typography>
                          </Grid>
                        )}

                        {detailDialog.compte.observations && (
                          <>
                            <Grid item xs={12}>
                              <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2, mt: 2 }}>
                                Observations
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="body2">
                                    {detailDialog.compte.observations}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          </>
                        )}
                      </Grid>
                    )}
                    
                    {detailDialog.activeTab === 1 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                            Informations du client
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Type de client
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {detailDialog.compte.client.type_client === 'physique' ? 'Physique' : 'Moral'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Numéro client
                          </Typography>
                          <Typography variant="body1">
                            {detailDialog.compte.client.num_client}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Nom complet
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {detailDialog.compte.client.nom_complet || `${detailDialog.compte.client.nom} ${detailDialog.compte.client.prenom}`}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            NUI
                          </Typography>
                          <Typography variant="body1">
                            {detailDialog.compte.client.type_client === 'physique' 
                              ? detailDialog.compte.client.physique?.nui 
                              : detailDialog.compte.client.morale?.nui || 'Non renseigné'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body1">
                            {detailDialog.compte.client.email || 'Non fourni'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Téléphone
                          </Typography>
                          <Typography variant="body1">
                            {detailDialog.compte.client.telephone}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Adresse
                          </Typography>
                          <Typography variant="body1">
                            {detailDialog.compte.client.adresse_quartier}, {detailDialog.compte.client.adresse_ville}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            BP: {detailDialog.compte.client.bp} • Pays: {detailDialog.compte.client.pays_residence}
                          </Typography>
                        </Grid>
                        
                        {detailDialog.compte.mandataires && detailDialog.compte.mandataires.length > 0 && (
                          <>
                            <Grid item xs={12}>
                              <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2, mt: 2 }}>
                                Mandataires ({detailDialog.compte.mandataires.length})
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              {detailDialog.compte.mandataires.map((mandataire, index) => (
                                <Card key={mandataire.id} variant="outlined" sx={{ mb: 2 }}>
                                  <CardContent>
                                    <Typography variant="body2" fontWeight="medium">
                                      {mandataire.nom} {mandataire.prenom}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Relation: {mandataire.relation}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              ))}
                            </Grid>
                          </>
                        )}
                      </Grid>
                    )}
                    
                    {detailDialog.activeTab === 2 && (
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 3 }}>
                          Documents du client ({detailDialog.compte.client.type_client === 'physique' ? 'Physique' : 'Moral'})
                        </Typography>
                        {renderDocuments(detailDialog.compte)}
                      </Box>
                    )}
                    
                    {detailDialog.activeTab === 3 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                            État des validations
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Stepper orientation="vertical">
                            <Step active={true}>
                              <StepLabel
                                StepIconComponent={() => (
                                  detailDialog.compte!.validation_chef_agence ? 
                                  <CheckCircleIcon color="success" /> : 
                                  <UpdateIcon color="action" />
                                )}
                              >
                                Validation Chef d'Agence
                              </StepLabel>
                              <StepContent>
                                {detailDialog.compte!.validation_chef_agence ? (
                                  <Typography variant="body2" color="success.main">
                                    ✓ Validé par {detailDialog.compte!.chefAgence?.name || 'Chef d\'agence'}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="warning.main">
                                    En attente de validation
                                  </Typography>
                                )}
                              </StepContent>
                            </Step>
                            
                            <Step active={true}>
                              <StepLabel
                                StepIconComponent={() => (
                                  detailDialog.compte!.validation_juridique ? 
                                  <CheckCircleIcon color="success" /> : 
                                  <UpdateIcon color="action" />
                                )}
                              >
                                Validation Juridique
                              </StepLabel>
                              <StepContent>
                                {detailDialog.compte!.validation_juridique ? (
                                  <Typography variant="body2" color="success.main">
                                    ✓ Validé par {detailDialog.compte!.juriste?.name || 'Juriste'}
                                    {detailDialog.compte!.date_validation_juridique && (
                                      <Typography variant="caption" display="block" color="text.secondary">
                                        Le {formatDate(detailDialog.compte!.date_validation_juridique)}
                                      </Typography>
                                    )}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="warning.main">
                                    En attente de validation juridique
                                  </Typography>
                                )}
                              </StepContent>
                            </Step>
                            
                            <Step active={true}>
                              <StepLabel
                                StepIconComponent={() => (
                                  detailDialog.compte!.dossier_complet ? 
                                  <CheckCircleIcon color="success" /> : 
                                  <WarningIcon color="error" />
                                )}
                              >
                                Dossier Complet
                              </StepLabel>
                              <StepContent>
                                {detailDialog.compte!.dossier_complet ? (
                                  <Typography variant="body2" color="success.main">
                                    ✓ Dossier complet
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="error.main">
                                    Dossier incomplet - Des documents manquent
                                  </Typography>
                                )}
                              </StepContent>
                            </Step>
                            
                            <Step active={true}>
                              <StepLabel
                                StepIconComponent={() => (
                                  !detailDialog.compte!.est_en_opposition ? 
                                  <CheckCircleIcon color="success" /> : 
                                  <LockIcon color="error" />
                                )}
                              >
                                Opposition
                              </StepLabel>
                              <StepContent>
                                {detailDialog.compte!.est_en_opposition ? (
                                  <Alert severity="warning" sx={{ mt: 1 }}>
                                    <Typography variant="body2">
                                      ⚠ Compte en opposition
                                    </Typography>
                                    {detailDialog.compte!.motif_rejet && (
                                      <Typography variant="caption" display="block">
                                        Motif: {detailDialog.compte!.motif_rejet}
                                      </Typography>
                                    )}
                                  </Alert>
                                ) : (
                                  <Typography variant="body2" color="success.main">
                                    ✓ Aucune opposition
                                  </Typography>
                                )}
                              </StepContent>
                            </Step>
                          </Stepper>
                        </Grid>
                        
                        {detailDialog.compte!.motif_rejet && (
                          <Grid item xs={12}>
                            <Card variant="outlined" sx={{ borderColor: red[200], backgroundColor: red[50] }}>
                              <CardContent>
                                <Typography variant="subtitle2" color="error" gutterBottom>
                                  Motif de rejet précédent:
                                </Typography>
                                <Typography variant="body2">
                                  {detailDialog.compte!.motif_rejet}
                                </Typography>
                                {detailDialog.compte!.rejetePar && (
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                    Rejeté par: {detailDialog.compte!.rejetePar.name}
                                    {detailDialog.compte!.date_rejet && (
                                      <span> • Le {formatDate(detailDialog.compte!.date_rejet)}</span>
                                    )}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        )}
                        
                        {(detailDialog.compte!.checklist_juridique || getValidationEtat(detailDialog.compte!) === 'enAttenteValidation') && (
                          <Grid item xs={12}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                  Checklist juridique
                                </Typography>
                                <List dense>
                                  {checklistItems.map((item) => (
                                    <ListItem key={item.id}>
                                      <ListItemIcon>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleChecklistChange(item.id)}
                                        >
                                          {item.checked ? (
                                            <CheckBoxIcon color="success" />
                                          ) : (
                                            <CheckBoxOutlineBlankIcon />
                                          )}
                                        </IconButton>
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary={item.label}
                                        sx={{ 
                                          textDecoration: item.checked ? 'line-through' : 'none',
                                          color: item.checked ? 'text.secondary' : 'text.primary'
                                        }}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </DialogContent>
                  
                  <DialogActions>
                    <Button 
                      onClick={handleCloseDetailDialog}
                      disabled={validationDirecteInProgress}
                    >
                      Fermer
                    </Button>
                    
                    {/* MODIFICATION : Bouton Valider dans la modal de détails - Appel API direct */}
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleValidateDirect(detailDialog.compte!)}
                      disabled={validationDirecteInProgress}
                      startIcon={validationDirecteInProgress ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                    >
                      {validationDirecteInProgress ? 'Validation en cours...' : 'Valider'}
                    </Button>
                  </DialogActions>
                </>
              )}
            </Dialog>

            {/* Dialog de validation normale (depuis le menu contextuel) */}
            <Dialog
              open={validationDialog.open}
              onClose={handleCloseValidationDialog}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                Valider le compte
              </DialogTitle>
              <DialogContent>
                {validationDialog.compte && (
                  <>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Confirmation de validation
                      </Typography>
                      <Typography variant="body2">
                        Vous êtes sur le point de valider le compte <strong>{validationDialog.compte.numero_compte}</strong>.
                        Veuillez vérifier la checklist ci-dessous avant de confirmer.
                      </Typography>
                    </Alert>
                    
                    <Card variant="outlined" sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Checklist de validation
                        </Typography>
                        <List dense>
                          {checklistItems.map((item) => (
                            <ListItem key={item.id}>
                              <ListItemIcon>
                                <IconButton
                                  size="small"
                                  onClick={() => handleChecklistChange(item.id)}
                                >
                                  {item.checked ? (
                                    <CheckBoxIcon color="success" />
                                  ) : (
                                    <CheckBoxOutlineBlankIcon />
                                  )}
                                </IconButton>
                              </ListItemIcon>
                              <ListItemText 
                                primary={item.label}
                                sx={{ 
                                  textDecoration: item.checked ? 'line-through' : 'none',
                                  color: item.checked ? 'text.secondary' : 'text.primary'
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                    
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Détails du compte :
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Client" 
                              secondary={validationDialog.compte.client.nom_complet || `${validationDialog.compte.client.nom} ${validationDialog.compte.client.prenom}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <MoneyIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Solde" 
                              secondary={formatSolde(validationDialog.compte.solde, validationDialog.compte.devise)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <AssignmentIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Type" 
                              secondary={validationDialog.compte.type_compte.libelle}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <FingerprintIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="NUI" 
                              secondary={
                                validationDialog.compte.client.type_client === 'physique' 
                                  ? validationDialog.compte.client.physique?.nui 
                                  : validationDialog.compte.client.morale?.nui || 'Non renseigné'
                              }
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={handleCloseValidationDialog} 
                  disabled={loadingAction}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleValidateCompte}
                  variant="contained"
                  color="success"
                  disabled={loadingAction}
                  startIcon={loadingAction ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{
                    '&:disabled': {
                      background: 'grey',
                    },
                  }}
                >
                  {loadingAction ? 'Traitement en cours...' : 'Confirmer la validation'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Dialog pour lever l'opposition */}
            <Dialog
              open={leverOppositionDialog.open}
              onClose={handleCloseLeverOppositionDialog}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                Lever l'opposition
              </DialogTitle>
              <DialogContent>
                {leverOppositionDialog.compte && (
                  <>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Lever l'opposition du compte
                      </Typography>
                      <Typography variant="body2">
                        Vous êtes sur le point de lever l'opposition sur le compte <strong>{leverOppositionDialog.compte.numero_compte}</strong>.
                        Veuillez vérifier les points ci-dessous avant de confirmer.
                      </Typography>
                    </Alert>
                    
                    <Card variant="outlined" sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Checklist de vérification
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {Object.entries(leverOppositionDialog.checklist).map(([key, checked]) => {
                            let label = '';
                            switch(key) {
                              case 'cni_valide':
                                label = 'CNI valide et à jour';
                                break;
                              case 'plan_localisation':
                                label = 'Plan de localisation vérifié';
                                break;
                              case 'photo_identite':
                                label = 'Photo d\'identité conforme';
                                break;
                              case 'signature_specimen':
                                label = 'Spécimen de signature vérifié';
                                break;
                            }
                            
                            const documentsPresents = leverOppositionDialog.compte 
                              ? checkDocumentsForOpposition(leverOppositionDialog.compte)
                              : false;
                            
                            return (
                              <FormControlLabel
                                key={key}
                                control={
                                  <Checkbox
                                    checked={checked}
                                    onChange={() => handleLeverOppositionChecklistChange(key as keyof LeverOppositionDialogState['checklist'])}
                                    color="primary"
                                    disabled={!documentsPresents}
                                  />
                                }
                                label={label}
                                sx={{
                                  color: !documentsPresents ? 'text.disabled' : 'inherit',
                                }}
                              />
                            );
                          })}
                        </Box>
                      </CardContent>
                    </Card>
                    
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Détails du compte :
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Client" 
                              secondary={leverOppositionDialog.compte.client.nom_complet || `${leverOppositionDialog.compte.client.nom} ${leverOppositionDialog.compte.client.prenom}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <MoneyIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Solde" 
                              secondary={formatSolde(leverOppositionDialog.compte.solde, leverOppositionDialog.compte.devise)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <AssignmentIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Type" 
                              secondary={leverOppositionDialog.compte.type_compte.libelle}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <FingerprintIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="NUI" 
                              secondary={
                                leverOppositionDialog.compte.client.type_client === 'physique' 
                                  ? leverOppositionDialog.compte.client.physique?.nui 
                                  : leverOppositionDialog.compte.client.morale?.nui || 'Non renseigné'
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <WarningIcon fontSize="small" color="warning" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="État" 
                              secondary="Compte en opposition"
                              secondaryTypographyProps={{ color: 'warning.main' }}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={handleCloseLeverOppositionDialog} 
                  disabled={loadingAction}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleLeverOppositionCompte}
                  variant="contained"
                  color="warning"
                  disabled={loadingAction || !areAllOppositionCheckboxesChecked() || !checkDocumentsForOpposition(leverOppositionDialog.compte!)}
                  startIcon={loadingAction ? <CircularProgress size={20} color="inherit" /> : <LockOpenIcon />}
                  sx={{
                    '&:disabled': {
                      background: 'grey',
                    },
                  }}
                >
                  {loadingAction ? 'Traitement en cours...' : 'Confirmer la levée'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Dialog de rejet */}
            <Dialog
              open={rejetDialog.open}
              onClose={handleCloseRejetDialog}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                Rejeter le compte
              </DialogTitle>
              <DialogContent>
                {rejetDialog.compte && (
                  <>
                    <Alert severity="error" sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Attention
                      </Typography>
                      <Typography variant="body2">
                        Vous êtes sur le point de rejeter le compte <strong>{rejetDialog.compte.numero_compte}</strong>.
                        Le dossier sera renvoyé pour correction.
                      </Typography>
                    </Alert>
                    
                    <TextField
                      fullWidth
                      label="Motif du rejet"
                      multiline
                      rows={4}
                      value={rejetDialog.motif}
                      onChange={handleRejetMotifChange}
                      placeholder="Veuillez saisir le motif précis du rejet..."
                      required
                      error={!rejetDialog.motif.trim()}
                      helperText={!rejetDialog.motif.trim() ? 'Le motif du rejet est requis' : ''}
                      sx={{ mb: 3 }}
                    />
                    
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Compte concerné :
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>{rejetDialog.compte.numero_compte}</strong> - {rejetDialog.compte.client.nom_complet || `${rejetDialog.compte.client.nom} ${rejetDialog.compte.client.prenom}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Type: {rejetDialog.compte.type_compte.libelle} • Solde: {formatSolde(rejetDialog.compte.solde, rejetDialog.compte.devise)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={handleCloseRejetDialog} 
                  disabled={loadingAction}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleRejectCompte}
                  variant="contained"
                  color="error"
                  disabled={loadingAction || !rejetDialog.motif.trim()}
                  startIcon={loadingAction ? <CircularProgress size={20} color="inherit" /> : <CancelIcon />}
                >
                  {loadingAction ? 'Traitement en cours...' : 'Confirmer le rejet'}
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Container>

        {/* Snackbar pour les notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          action={snackbarAction}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <CustomAlert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </CustomAlert>
        </Snackbar>
      </Box>
    </Layout>
  );
}