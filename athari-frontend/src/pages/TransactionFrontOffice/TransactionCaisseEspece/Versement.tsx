import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';

// --- IMPORT DES COMPOSANTS DE LAYOUT ---
import Sidebar from '../../../components/layout/Sidebar';
import TopBar from '../../../components/layout/TopBar';

// --- IMPORT DES SERVICES ---
import caisseServices from '../../../services/versementEtRetraitservice/caisseServices';
import type { BilletageItem, VersementData, TiersData } from '../../../services/versementEtRetraitservice/caisseServices';
import compteService from '../../../services/api/compteService';
import agenceService, { type Agence as AgenceApi } from '../../../services/agenceService';
import guichetService from '../../../services/guichetService';
import caisseService from '../../../services/caisseService'; // Service pour récupérer les caisses

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

// --- FONCTIONS UTILITAIRES ---
const formatCurrency = (value: string) => {
  const num = parseFloat(value || '0');
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
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
  
  const [formData, setFormData] = useState<VersementFormData>({
    // Onglet Versement Espèces
    agenceCode: '',
    selectedAgence: '',
    guichet: '',
    caisse: '',
    typeVersement: '01',
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
    
    // Calculs
    soldeComptable: '0',
    indisponible: '0',
    netEncaisser: '0',
    netCrediter: '0',
  });

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
        
        // Récupérer tous les guichets
        const response = await guichetService.getGuichets();
        console.log('Guichets disponibles:', response);
        
        // Vérifier si la réponse est un tableau directement
        let guichetsArray: Guichet[] = [];
        
        if (Array.isArray(response)) {
          guichetsArray = response;
          console.log('Réponse est un tableau direct');
        } else if (response && typeof response === 'object') {
          // Debug: afficher la structure
          console.log('Type de réponse:', typeof response);
          console.log('Propriétés de l\'objet:', Object.keys(response));
          console.log('Valeur de success:', response.success);
          console.log('Valeur de data:', response.data);
          
          if (response.success !== undefined && response.data !== undefined) {
            // Si c'est un objet avec success et data
            if (response.success && Array.isArray(response.data)) {
              guichetsArray = response.data;
              console.log('Structure: {success, data}');
            }
          } else if (response.data !== undefined) {
            // Si c'est un objet avec data seulement
            if (Array.isArray(response.data)) {
              guichetsArray = response.data;
              console.log('Structure: {data}');
            }
          } else {
            // Si c'est un objet qui peut être converti en tableau
            console.log('Tentative de conversion en tableau...');
            const values = Object.values(response);
            if (values.length > 0 && typeof values[0] === 'object' && values[0] !== null) {
              guichetsArray = values as Guichet[];
              console.log('Conversion réussie');
            }
          }
        }
        
        console.log(`Nombre de guichets récupérés: ${guichetsArray.length}`);
        
        // Filtrer les guichets par agence_id
        const filteredGuichets = guichetsArray.filter((guichet: Guichet) => 
          guichet.agence_id === parseInt(formData.selectedAgence)
        );
        
        console.log(`Guichets filtrés pour agence ${formData.selectedAgence}:`, filteredGuichets);
        setGuichets(filteredGuichets);
        
        // Réinitialiser les caisses
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
        
        // Récupérer toutes les caisses
        const response = await caisseService.getCaisses();
        console.log('Caisses disponibles:', response);
        
        // Vérifier si la réponse est un tableau directement
        let caissesArray: Caisse[] = [];
        
        if (Array.isArray(response)) {
          caissesArray = response;
          console.log('Réponse est un tableau direct');
        } else if (response && typeof response === 'object') {
          // Debug: afficher la structure
          console.log('Type de réponse:', typeof response);
          console.log('Propriétés de l\'objet:', Object.keys(response));
          console.log('Valeur de success:', response.success);
          console.log('Valeur de data:', response.data);
          
          if (response.success !== undefined && response.data !== undefined) {
            // Si c'est un objet avec success et data
            if (response.success && Array.isArray(response.data)) {
              caissesArray = response.data;
              console.log('Structure: {success, data}');
            }
          } else if (response.data !== undefined) {
            // Si c'est un objet avec data seulement
            if (Array.isArray(response.data)) {
              caissesArray = response.data;
              console.log('Structure: {data}');
            }
          } else {
            // Si c'est un objet qui peut être converti en tableau
            console.log('Tentative de conversion en tableau...');
            const values = Object.values(response);
            if (values.length > 0 && typeof values[0] === 'object' && values[0] !== null) {
              caissesArray = values as Caisse[];
              console.log('Conversion réussie');
            }
          }
        }
        
        console.log(`Nombre de caisses récupérées: ${caissesArray.length}`);
        
        // Filtrer les caisses par guichet_id
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

    // Mise à jour de l'agence
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
      // Utiliser les données déjà disponibles dans le compte
      setCompteDetails(compte);
      
      // Extraire les informations du client
      const clientName = compte.client?.nom_complet || 
                        (compte.client?.physique?.nom_prenoms) || 
                        'Client inconnu';
      
      // Extraire le libellé du plan comptable
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
    
    // Calculer le total du billetage
    const total = newBilletage.reduce((sum, item) => sum + (item.valeur * item.quantite), 0);
    
    // Mettre à jour le montant dans le formulaire
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

  // Fonction principale de soumission COMPLÈTEMENT CORRIGÉE
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
      
      // Vérifier si la caisse est active
      if (!selectedCaisse.est_active) {
        showSnackbar('La caisse sélectionnée n\'est pas active', 'error');
        return;
      }
      
      // Calcul des montants
      const commissions = parseFloat(formData.commissions) || 0;
      const taxes = parseFloat(formData.taxes) || 0;
      const totalFrais = commissions + taxes;
      const netCrediter = formData.fraisEnCompte ? montant - totalFrais : montant;
      
      // PRÉPARER LES DONNÉES SELON LE FORMAT ATTENDU PAR LARAVEL
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
        
        // CHAMPS "remettant_" REQUIS (en plus de la structure tiers)
        remettant_nom: formData.nomRemettant.trim(),
        remettant_type_piece: formData.typeId,
        remettant_numero_piece: formData.numeroId.trim(),
        
        // Autres informations sur le remettant
        adresse_remettant: formData.adresse?.trim() || '',
        date_delivrance_piece: formData.delivreLe || '',
        lieu_delivrance_piece: formData.delivreA || '',
        
        // Contexte de l'opération
        origine_fonds: formData.motif?.trim() || 'Versement espèces',
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
      
      // Vérifier les plafonds avant soumission (optionnel)
      try {
        const plafondCheck = await caisseServices.verifierPlafond(selectedCaisse.id, montant);
        if (!plafondCheck.success) {
          showSnackbar(`Attention: ${plafondCheck.message}`, 'warning');
          // Demander confirmation si plafond dépassé
          if (!window.confirm(`${plafondCheck.message}\n\nVoulez-vous continuer ?`)) {
            return;
          }
        }
      } catch (error) {
        console.warn('Erreur lors de la vérification du plafond:', error);
        // Continuer même si la vérification échoue
      }
      
      // Appeler le service
      const result = await caisseServices.effectuerVersement(versementData, billetageValide);
      
      if (result.requires_validation) {
        // Cas où une validation est nécessaire (dépassement de plafond)
        setValidationData({
          demande_id: result.demande_id,
          message: result.message,
          montant: formData.montant
        });
        setValidationDialog(true);
        showSnackbar(result.message || 'Validation requise par l\'assistant', 'warning');
      } else if (result.success) {
        // Transaction réussie
        showSnackbar('Versement effectué avec succès !', 'success');
        console.log('Référence transaction:', result.data?.reference);
        
        // Réinitialiser le formulaire
        resetForm();
        
        // Afficher les détails de la transaction réussie
        if (result.data) {
          setSnackbar({
            open: true,
            message: `Versement réussi! Référence: ${result.data.reference}`,
            severity: 'success'
          });
        }
      } else {
        // Erreur
        const errorMsg = result.message || 'Erreur lors du versement';
        if (result.errors) {
          // Afficher les détails des erreurs de validation
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
      typeVersement: '01',
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
      
      nomRemettant: '',
      adresse: '',
      typeId: 'CNI',
      numeroId: '',
      delivreLe: '',
      delivreA: '',
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
              Versement Espèces
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Interface de versement d'espèces - Turbobank
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            {/* Barre d'onglets */}
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

            {/* Contenu des onglets */}
            <Box sx={{ p: 3 }}>
              {/* Onglet Versement Espèces */}
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
                            />
                          </Grid>
                          
                          <Grid item xs={6}>
                            <FormControl fullWidth size="small">
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
                            <FormControl fullWidth size="small">
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
                            <FormControl fullWidth size="small">
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
                            <FormControl fullWidth size="small">
                              <InputLabel>Type versement *</InputLabel>
                              <Select
                                name="typeVersement"
                                value={formData.typeVersement}
                                label="Type versement *"
                                onChange={handleSelectChange}
                              >
                                <MenuItem value="01">01 - Versement espèces</MenuItem>
                                <MenuItem value="02">02 - Versement OM</MenuItem>
                                <MenuItem value="03">03 - Virement MOMO</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Agence Compte"
                              name="agenceCompte"
                              value={formData.agenceCompte}
                              onChange={handleChange}
                              placeholder="Code agence du compte"
                            />
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

                  {/* Colonne 2: Détails du versement - CORRIGÉ POUR MEILLEUR ESPACEMENT */}
                  <Grid item xs={12} md={6}>
                    <StyledCard sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 2, height: '100%' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Détails du Versement
                        </Typography>
                        <Grid container spacing={2}>
                          {/* NOUVEAUX CHAMPS : Bordereau */}
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
                                  fullWidth
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
                          
                          {/* Informations compte sélectionné - MEILLEUR ESPACEMENT */}
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
                          
                          {/* Dates - MEILLEUR ESPACEMENT */}
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

                  {/* Section Billetage */}
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

                  {/* Résumé financier */}
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

              {/* Onglet Remettant */}
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
                            <FormControl fullWidth size="small">
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

              {/* Onglet Condition */}
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

              {/* Onglet Photo/signature */}
              <TabPanel value={tabValue} index={3}>
                <StyledCard>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Photo sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Photo et signature du client
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cette section affiche la photo et la signature si elles ont été rattachées au compte
                    </Typography>
                  </CardContent>
                </StyledCard>
              </TabPanel>

              {/* Boutons d'action */}
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

      {/* Dialog de confirmation */}
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
              • Type versement: {formData.typeVersement === '01' ? 'Versement espèces' : 
                                formData.typeVersement === '02' ? 'Versement OM' :
                                formData.typeVersement === '03' ? 'Virement MOMO' : 'Autres'}
              <br />
              • Montant: {formatCurrency(formData.montant)} FCFA
              <br />
              • Remettant: {formData.nomRemettant}
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

      {/* Modal pour la validation requise */}
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

export default Versement;