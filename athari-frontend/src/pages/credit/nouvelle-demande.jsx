// src/pages/credit/nouvelle-demande.jsx
import React, { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  LinearProgress,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
  SnackbarContent,
  Slide,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalculateIcon from '@mui/icons-material/Calculate';
import DescriptionIcon from '@mui/icons-material/Description';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import { useNavigate } from 'react-router-dom';

// ============================
// STYLED COMPONENTS
// ============================
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StyledCard = styled(Card)(({ theme, selected }) => ({
  cursor: 'pointer',
  border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  backgroundColor: selected ? theme.palette.action.selected : theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.light,
  },
  transition: 'all 0.2s ease-in-out',
}));

// ============================
// COMPOSANTS PERSONNALISÉS
// ============================

// Transition pour le toast
function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

// Composant Toast pour les notifications
const CustomToast = ({ open, message, type, onClose }) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#323232';
    }
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      TransitionComponent={SlideTransition}
    >
      <SnackbarContent
        style={{
          backgroundColor: getBackgroundColor(),
          display: 'flex',
          alignItems: 'center'
        }}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">{message}</Typography>
          </Box>
        }
        action={
          <IconButton size="small" color="inherit" onClick={onClose}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        }
      />
    </Snackbar>
  );
};

// ============================
// COMPOSANT PRINCIPAL
// ============================
const NouvelleDemande = () => {
  // ============================
  // HOOKS ET NAVIGATION
  // ============================
  const navigate = useNavigate();
  
  // ============================
  // ÉTATS POUR LES COMPTES
  // ============================
  const [isLoading, setIsLoading] = useState(true);
  const [comptes, setComptes] = useState([]);
  const [filteredComptes, setFilteredComptes] = useState([]);
  const [loadingComptes, setLoadingComptes] = useState(false);
  const [comptesError, setComptesError] = useState(null);
  const [selectedCompteId, setSelectedCompteId] = useState('');
  const [selectedCompte, setSelectedCompte] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [accountTypes, setAccountTypes] = useState([
    { value: '', label: 'Tous les types' },
    { value: 'epargne', label: 'Épargne' },
    { value: 'courant', label: 'Courant' },
    { value: 'depot', label: 'Dépôt à terme' },
    { value: 'credit', label: 'Crédit' }
  ]);
  const [accountTypeFilter, setAccountTypeFilter] = useState('');
  
  // ============================
  // ÉTATS POUR LA RECHERCHE ET PAGINATION
  // ============================
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // ============================
  // ÉTATS POUR LES TYPES DE CRÉDIT (EXCEPTÉ FLASH)
  // ============================
  const [creditTypes, setCreditTypes] = useState([]);
  const [loadingCreditTypes, setLoadingCreditTypes] = useState(false);
  const [creditTypesError, setCreditTypesError] = useState(null);
  const [selectedCreditDetails, setSelectedCreditDetails] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // ============================
  // ÉTATS POUR LE CALCUL D'INTÉRÊT
  // ============================
  const [calculationResult, setCalculationResult] = useState(null);
  const [showCalculation, setShowCalculation] = useState(false);
  
  // ============================
  // ÉTATS POUR LE FORMULAIRE
  // ============================
  const [creditData, setCreditData] = useState({
    credit_type_id: '',
    account_type: '',
    montant: '',
    duree: '',
    observation: '',
    urgence: 'normale',
    source_revenus: '',
    revenus_mensuels: '',
    contact_urgence: ''
  });

  // ============================
  // ÉTATS POUR LES DOCUMENTS (TOUS LES DOCUMENTS)
  // ============================
  const [documents, setDocuments] = useState({
    // Documents de base
    demande_credit: { file: null },
    photocopie_cni: { file: null },
    
    // Documents domicile
    plan_localisation_domicile: { file: null },
    description_domicile: { file: null },
    photo_domicile: { file: null },
    
    // Documents activité
    plan_localisation_activite: { file: null },
    description_activite: { file: null },
    geolocalisation_activite: { file: null },
    photo_activite: { file: null },
    
    // Documents supplémentaires
    dernier_bulletin: { file: null },
    attestation_travail: { file: null },
    releve_compte: { file: null },
    
    // Autres
    lettre_non_remboursement: { file: null },
    piece_identite: { file: null }
  });

  // ============================
  // ÉTATS POUR LA SOUMISSION ET TOAST
  // ============================
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'info'
  });

  // ============================
  // LISTE DES DOCUMENTS REQUIS POUR TOUS LES CRÉDITS
  // ============================
  const documentList = [
    // Documents de base
    { key: 'demande_credit', label: "Demande de crédit", required: true, icon: <DescriptionOutlinedIcon /> },
    { key: 'photocopie_cni', label: "Photocopie de la CNI", required: true, icon: <PersonIcon /> },
    
    // Documents domicile
    { key: 'plan_localisation_domicile', label: "Plan de localisation du domicile", required: true, icon: <HomeIcon /> },
    { key: 'description_domicile', label: "Description du domicile", required: false, icon: <DescriptionOutlinedIcon /> },
    { key: 'photo_domicile', label: "Photo du domicile", required: true, icon: <PhotoCameraIcon /> },
    
    // Documents activité
    { key: 'plan_localisation_activite', label: "Plan de localisation du lieu d'activité", required: true, icon: <BusinessIcon /> },
    { key: 'description_activite', label: "Description du lieu d'activité", required: false, icon: <DescriptionOutlinedIcon /> },
    { key: 'geolocalisation_activite', label: "Géolocalisation de l'activité", required: true, icon: <LocationOnIcon /> },
    { key: 'photo_activite', label: "Photo de l'activité", required: true, icon: <PhotoCameraIcon /> },
    
    // Documents financiers
    { key: 'dernier_bulletin', label: "Dernier bulletin de salaire", required: true, icon: <WorkIcon /> },
    { key: 'attestation_travail', label: "Attestation de travail", required: true, icon: <WorkIcon /> },
    { key: 'releve_compte', label: "Relevé de compte récent", required: true, icon: <AccountBalanceIcon /> },
    
    // Autres
    { key: 'lettre_non_remboursement', label: "Lettre de non remboursement des frais d'étude signée", required: true, icon: <DescriptionOutlinedIcon /> },
    { key: 'piece_identite', label: "Pièce d'identité originale", required: true, icon: <PersonIcon /> }
  ];

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // ============================
  // EFFETS
  // ============================

  // Effet pour initialiser la page (chargement des données)
  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);

      // Vérifier si l'utilisateur a un token
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        // Charger les comptes et types de crédit (excepté flash) en parallèle
        await Promise.all([
          loadComptes(),
          loadCreditTypes()
        ]);
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [navigate]);

  // Effet pour filtrer les comptes lors de la recherche
  useEffect(() => {
    const filtered = comptes.filter(compte => {
      const search = searchTerm.toLowerCase();
      const numeroCompte = compte.numero_compte?.toLowerCase() || '';
      const nomComplet = compte.client?.nom_complet?.toLowerCase() || '';
      const numClient = compte.client?.num_client?.toLowerCase() || '';
      const clientEmail = compte.client?.email?.toLowerCase() || '';
      const clientPhone = compte.client?.telephone?.toLowerCase() || '';
      
      return numeroCompte.includes(search) ||
             nomComplet.includes(search) ||
             numClient.includes(search) ||
             clientEmail.includes(search) ||
             clientPhone.includes(search);
    });
    setFilteredComptes(filtered);
    setPage(0);
  }, [searchTerm, comptes]);

  // ============================
  // FONCTIONS D'AUTHENTIFICATION
  // ============================

  // Récupérer le token d'authentification
  const getToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  };

  // Vérifier si l'utilisateur est authentifié
  const isUserAuthenticated = () => {
    const token = getToken();
    return !!token;
  };

  // ============================
  // FONCTIONS UTILITAIRES
  // ============================

  // Fonction utilitaire pour extraire une valeur string d'un objet
  const extractStringValue = (value) => {
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'object' && value !== null) {
      // Si c'est un objet, essayer de trouver une propriété string
      if (value.nom) return String(value.nom);
      if (value.libelle) return String(value.libelle);
      if (value.code) return String(value.code);
      if (value.description) return String(value.description);
      // Sinon, convertir l'objet en string JSON
      return JSON.stringify(value);
    } else {
      // Pour tout autre type, convertir en string
      return String(value || '');
    }
  };

  // ============================
  // FONCTIONS DE CHARGEMENT DES DONNÉES
  // ============================

  // Charger les comptes depuis l'API
  const loadComptes = async () => {
    if (!isUserAuthenticated()) {
      setComptesError('Vous devez être connecté pour accéder à cette fonctionnalité.');
      return;
    }

    setLoadingComptes(true);
    setComptesError(null);
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/comptes`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        setComptesError('Votre session a expiré. Veuillez vous reconnecter.');
        return;
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Gérer différents formats de réponse de l'API
      if (data.success && data.data && Array.isArray(data.data.data)) {
        const comptesArray = data.data.data;
        setComptes(comptesArray);
        setFilteredComptes(comptesArray);
      } else if (data.success && Array.isArray(data.data)) {
        setComptes(data.data);
        setFilteredComptes(data.data);
      } else if (Array.isArray(data)) {
        setComptes(data);
        setFilteredComptes(data);
      } else {
        setComptesError('Format de données inattendu de l\'API');
        console.error('Réponse API inattendue:', data);
      }
    } catch (error) {
      console.error("Erreur chargement comptes:", error);
      setComptesError('Erreur lors du chargement des comptes: ' + error.message);
    } finally {
      setLoadingComptes(false);
    }
  };

  // Charger les types de crédit (excepté flash) depuis l'API
  const loadCreditTypes = async () => {
    if (!isUserAuthenticated()) {
      setCreditTypesError('Vous devez être connecté pour accéder à cette fonctionnalité.');
      return;
    }

    setLoadingCreditTypes(true);
    setCreditTypesError(null);
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/credit-types`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        setCreditTypesError('Votre session a expiré. Veuillez vous reconnecter.');
        return;
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      let creditTypesArray = [];

      // Gérer différents formats de réponse
      if (data.status === 'success' && Array.isArray(data.data)) {
        creditTypesArray = data.data;
      } else if (data.success && data.data && Array.isArray(data.data.data)) {
        creditTypesArray = data.data.data;
      } else if (Array.isArray(data)) {
        creditTypesArray = data;
      } else {
        console.warn('Structure de données non reconnue:', data);
        return;
      }

      if (creditTypesArray.length > 0) {
        // Filtrer pour exclure les crédits flash
        const nonFlashTypes = creditTypesArray.filter(type => {
          const categorie = type.category?.toLowerCase() || '';
          const code = type.code?.toLowerCase() || '';
          const libelle = type.libelle?.toLowerCase() || '';
          const nom = type.nom?.toLowerCase() || '';
          
          return !categorie.includes('flash') && 
                 !code.includes('flash') && 
                 !libelle.includes('flash') &&
                 !nom.includes('flash') &&
                 code !== 'flash_24h' &&
                 code !== 'credit_flash';
        });

        if (nonFlashTypes.length > 0) {
          // Formater les types de crédit
          const formattedTypes = nonFlashTypes.map(type => {
            const nomValue = extractStringValue(type.credit_characteristics || type.nom || type.code || type.libelle || 'Type de crédit');
            const descriptionValue = extractStringValue(type.description || type.libelle || 'Crédit');

            return {
              id: type.id,
              nom: nomValue,
              code: String(type.code || 'N/A'),
              libelle: String(type.libelle || 'N/A'),
              description: descriptionValue,
              taux_interet: parseFloat(type.taux_interet_annuel) || parseFloat(type.taux_interet) || 0,
              montant_max: parseFloat(type.montant) || 0,
              montant_min: type.details_supplementaires?.conditions?.montant_min || 0,
              duree_max: parseInt(type.duree_blocage_max) || parseInt(type.duree) || 0,
              duree_min: type.details_supplementaires?.conditions?.duree_min || 1,
              frais_dossier: parseFloat(type.frais_ouverture) || parseFloat(type.frais_dossier) || 0,
              penalite: parseFloat(type.penalite_retrait_anticipe) || parseFloat(type.penalite) || 0,
              details_supplementaires: type.details_supplementaires,
              chapitre_comptable: type.chapitre_comptable,
              actif: type.actif,
              created_at: type.created_at
            };
          });

          setCreditTypes(formattedTypes);

          // Sélectionner automatiquement le premier type de crédit
          if (formattedTypes.length > 0) {
            const firstType = formattedTypes[0];
            setCreditData(prev => ({
              ...prev,
              credit_type_id: firstType.id,
            }));
          }
        } else {
          setCreditTypesError('Aucun type de crédit (excepté flash) disponible');
        }
      } else {
        setCreditTypesError('Aucun type de crédit disponible');
      }
    } catch (error) {
      console.error("Erreur types de crédit:", error);
      setCreditTypesError('Erreur lors du chargement des types de crédit: ' + error.message);
    } finally {
      setLoadingCreditTypes(false);
    }
  };

  // ============================
  // FONCTIONS POUR LES DÉTAILS DU CRÉDIT
  // ============================

  // Charger les détails d'un type de crédit spécifique
  const loadCreditTypeDetails = async (id) => {
    try {
      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/credit-types/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Formater les données pour s'assurer que toutes les valeurs sont des chaînes
        const formattedData = {
          ...data,
          nom: extractStringValue(data.nom || data.libelle || data.code || 'Détails du crédit'),
          libelle: extractStringValue(data.libelle || 'N/A'),
          code: extractStringValue(data.code || 'N/A'),
          description: extractStringValue(data.description || data.libelle || 'Aucune description disponible'),
          taux_interet_annuel: extractStringValue(data.taux_interet_annuel || 0),
          duree_blocage_min: extractStringValue(data.duree_blocage_min),
          duree_blocage_max: extractStringValue(data.duree_blocage_max),
          frais_ouverture: extractStringValue(data.frais_ouverture),
          observations: extractStringValue(data.observations)
        };
        setSelectedCreditDetails(formattedData);
        setDetailsDialogOpen(true);
      } else {
        throw new Error(`Erreur ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur détails type crédit:", error);
      showToast('Impossible de charger les détails: ' + error.message, 'error');
    }
  };

  // ============================
  // FONCTIONS DE CALCUL D'INTÉRÊT
  // ============================

  // Calculer les intérêts basés sur la grille de tarification
  const calculateInterest = () => {
    const selectedType = creditTypes.find(type => type.id === parseInt(creditData.credit_type_id));
    const montant = parseFloat(creditData.montant) || 0;
    const duree = parseInt(creditData.duree) || 0;

    if (!selectedType || !montant || !duree || duree <= 0) {
      showToast('Veuillez sélectionner un type de crédit et saisir le montant et la durée', 'warning');
      return;
    }

    const details = selectedType.details_supplementaires;
    
    // Si pas de grille de tarification, calcul simple
    if (!details || !details.grille_tarification) {
      const interet = montant * (selectedType.taux_interet / 100) * (duree / 365);
      const total = montant + interet + (selectedType.frais_dossier || 0);
      
      setCalculationResult({
        montant,
        duree,
        interet: interet.toFixed(2),
        frais_dossier: selectedType.frais_dossier || 0,
        total: total.toFixed(2),
        taux_applique: selectedType.taux_interet,
        method: 'Calcul simple'
      });
      setShowCalculation(true);
      return;
    }

    // Calcul avec grille de tarification
    const grille = details.grille_tarification;
    let palier = null;
    
    // Trouver le palier correspondant au montant
    for (const p of grille) {
      if (montant >= p.min && montant <= p.max) {
        palier = p;
        break;
      }
    }

    if (!palier) {
      showToast('Montant hors des paliers définis', 'error');
      return;
    }

    let frais_etude = palier.frais_etude;
    let premier_jour = palier.premier_jour;
    let penalite_jour = palier.penalite_jour;
    let journalier = palier.journalier;

    // Application de la règle de 3 pour le palier 5
    if (palier.palier === 5 && palier.description.includes('Règle de 3')) {
      const proportion = (montant - palier.min) / (palier.max - palier.min);
      const palier4 = grille.find(p => p.palier === 4);
      
      if (palier4) {
        frais_etude = palier4.frais_etude + (3000 - palier4.frais_etude) * proportion;
        premier_jour = palier4.premier_jour + (10000 - palier4.premier_jour) * proportion;
        penalite_jour = palier4.penalite_jour + (3000 - palier4.penalite_jour) * proportion;
      }
    }

    // Calcul des intérêts
    let interet = 0;
    if (duree === 1) {
      interet = parseFloat(premier_jour);
    } else {
      interet = parseFloat(premier_jour) + (parseFloat(journalier) * (duree - 1));
    }

    const total = montant + interet + parseFloat(frais_etude);
    const taux_effectif = (interet / montant) * (365 / duree) * 100;
    
    setCalculationResult({
      montant,
      duree,
      palier: palier.description,
      frais_etude: parseFloat(frais_etude),
      premier_jour: parseFloat(premier_jour),
      journalier: parseFloat(journalier),
      interet: interet.toFixed(2),
      penalite_jour: parseFloat(penalite_jour),
      total: total.toFixed(2),
      taux_effectif: taux_effectif.toFixed(2),
      method: 'Grille de tarification'
    });
    setShowCalculation(true);
  };

  // ============================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ============================

  // Sélectionner un compte
  const handleCompteSelect = (compteId, compte) => {
    setSelectedCompteId(compteId);
    setSelectedCompte(compte);
    if (compte.client) {
      setClientDetails(compte.client);
      // Pré-remplir le contact d'urgence si disponible
      if (compte.client.telephone_urgence) {
        setCreditData(prev => ({ ...prev, contact_urgence: compte.client.telephone_urgence }));
      }
    }
  };

  // Changer les données du crédit
  const handleCreditChange = (field, value) => {
    const updatedData = { ...creditData, [field]: value };
    
    // Réinitialiser le calcul si le type de crédit change
    if (field === 'credit_type_id') {
      const selectedType = creditTypes.find(type => type.id === parseInt(value));
      if (selectedType) {
        setCalculationResult(null);
        setShowCalculation(false);
      }
    }
    
    setCreditData(updatedData);
  };

  // Changer un fichier
  const handleFileChange = (key, file) => {
    setDocuments(prev => ({ ...prev, [key]: { file } }));
  };

  // ============================
  // FONCTIONS UTILITAIRES
  // ============================

  // Afficher une notification toast
  const showToast = (message, type = 'info') => {
    setToast({
      open: true,
      message,
      type
    });
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors = [];
    
    // Validation des champs obligatoires
    if (!selectedCompteId) {
      errors.push("Sélectionnez un compte");
    }
    
    if (!creditData.credit_type_id) {
      errors.push("Type de crédit est requis");
    }
    
    if (!creditData.montant || creditData.montant <= 0) {
      errors.push("Montant demandé est requis");
    }
    
    if (!creditData.duree || creditData.duree <= 0) {
      errors.push("Durée est requise");
    }
    
    if (!creditData.source_revenus || creditData.source_revenus.trim() === '') {
      errors.push("Source de revenus est requise");
    }
    
    if (!creditData.revenus_mensuels || creditData.revenus_mensuels <= 0) {
      errors.push("Revenus mensuels sont requis");
    }
    
    if (!creditData.contact_urgence || creditData.contact_urgence.trim() === '') {
      errors.push("Numéro de contact en cas d'urgence est requis");
    }
    
    // Validation des limites du type de crédit
    const selectedType = creditTypes.find(type => type.id === parseInt(creditData.credit_type_id));
    if (selectedType) {
      if (selectedType.montant_max && creditData.montant > selectedType.montant_max) {
        errors.push(`Le montant maximum pour ${selectedType.nom} est de ${selectedType.montant_max.toLocaleString()} FCFA`);
      }
      if (selectedType.duree_max && creditData.duree > selectedType.duree_max) {
        errors.push(`La durée maximum pour ${selectedType.nom} est de ${selectedType.duree_max} jour(s)`);
      }
      if (selectedType.montant_min && creditData.montant < selectedType.montant_min) {
        errors.push(`Le montant minimum pour ${selectedType.nom} est de ${selectedType.montant_min.toLocaleString()} FCFA`);
      }
    }
    
    // Validation des documents obligatoires
    documentList.forEach(doc => {
      if (doc.required && !documents[doc.key]?.file) {
        errors.push(`Document "${doc.label}" est requis`);
      }
    });
    
    // Afficher la première erreur
    if (errors.length > 0) {
      showToast(errors[0], "error");
      return false;
    }
    
    return true;
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedCompteId('');
    setSelectedCompte(null);
    setClientDetails(null);
    setCreditData({
      credit_type_id: creditTypes.length > 0 ? creditTypes[0].id : '',
      account_type: '',
      montant: '',
      duree: '',
      observation: '',
      urgence: 'normale',
      source_revenus: '',
      revenus_mensuels: '',
      contact_urgence: ''
    });
    setDocuments(Object.fromEntries(documentList.map(d => [d.key, { file: null }])));
    setSearchTerm('');
    setPage(0);
    setCalculationResult(null);
    setShowCalculation(false);
  };

  // ============================
  // SOUMISSION DU FORMULAIRE
  // ============================

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation du formulaire
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    showToast('Envoi de la demande en cours...', 'info');
    
    try {
      const formData = new FormData();
      
      // Ajouter les données du formulaire
      formData.append('compte_id', selectedCompteId);
      formData.append('client_id', selectedCompte?.client_id);
      formData.append('credit_type_id', creditData.credit_type_id);
      formData.append('montant', creditData.montant);
      formData.append('duree', creditData.duree);
      formData.append('urgence', creditData.urgence);
      formData.append('observation', creditData.observation || '');
      formData.append('source_revenus', creditData.source_revenus);
      formData.append('revenus_mensuels', creditData.revenus_mensuels);
      formData.append('contact_urgence', creditData.contact_urgence);
      
      // Ajouter tous les documents
      Object.keys(documents).forEach(key => {
        if (documents[key]?.file) {
          formData.append(`documents[${key}]`, documents[key].file);
        }
      });
      
      const token = getToken();
      
      // Envoyer la demande à l'API
      const response = await fetch(`${API_BASE_URL}/credit-applications`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Erreur de soumission:', responseData);
        
        // Gérer les erreurs de validation
        if (responseData.errors) {
          const errorMessages = [];
          Object.values(responseData.errors).forEach(errors => {
            if (Array.isArray(errors)) {
              errorMessages.push(...errors);
            } else {
              errorMessages.push(errors);
            }
          });
          throw new Error(errorMessages.join('. '));
        }
        
        throw new Error(responseData.message || `Erreur ${response.status}`);
      }
      
      // Succès
      showToast('Demande de crédit créée avec succès !', 'success');
      resetForm();
      
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      showToast(error.message || 'Erreur lors de la création de la demande', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================
  // FONCTIONS DE RENDU DES SECTIONS
  // ============================

  // Rendre le tableau des comptes
  const renderComptesTable = () => (
    <>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Filtrer par type de compte</InputLabel>
            <Select
              value={accountTypeFilter}
              label="Filtrer par type de compte"
              onChange={(e) => setAccountTypeFilter(e.target.value)}
            >
              {accountTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Rechercher par numéro compte, nom client, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} /> }}
          />
        </Grid>
      </Grid>
      <TableContainer sx={{ maxHeight: 300 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Numéro Compte</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Type Client</TableCell>
              <TableCell>Solde (FCFA)</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredComptes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((compte) => (
              <TableRow 
                key={compte.id} 
                hover 
                selected={selectedCompteId === compte.id}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleCompteSelect(compte.id, compte)}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {extractStringValue(compte.numero_compte) || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {compte.statut === 'actif' ? 'Actif' : 'Inactif'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {extractStringValue(compte.client?.nom_complet) || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {extractStringValue(compte.client?.num_client) || 'N/A'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={compte.client?.type_client === 'physique' ? 'Physique' : 'Morale'}
                    size="small"
                    color={compte.client?.type_client === 'physique' ? 'primary' : 'secondary'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold" color={parseFloat(compte.solde || 0) >= 0 ? 'success.main' : 'error.main'}>
                    {parseFloat(compte.solde || 0).toLocaleString('fr-FR')} FCFA
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant={selectedCompteId === compte.id ? "contained" : "outlined"}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompteSelect(compte.id, compte);
                    }}
                  >
                    {selectedCompteId === compte.id ? "Sélectionné" : "Choisir"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredComptes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </>
  );

  // Rendre les détails du compte sélectionné
  const renderCompteDetails = () => {
    if (!selectedCompte) return null;

    return (
      <Accordion defaultExpanded sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AccountBalanceIcon color="primary" />
            <Typography variant="h6">Détails du Compte Sélectionné</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informations du Compte
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography>
                    <strong>Numéro:</strong> {extractStringValue(selectedCompte.numero_compte)}
                  </Typography>
                  <Typography>
                    <strong>Devise:</strong> {extractStringValue(selectedCompte.devise) || 'FCFA'}
                  </Typography>
                  <Typography>
                    <strong>Solde:</strong> {parseFloat(selectedCompte.solde || 0).toLocaleString('fr-FR')} FCFA
                  </Typography>
                  <Typography>
                    <strong>Statut:</strong> {selectedCompte.statut === 'actif' ? 'Actif' : 'Inactif'}
                  </Typography>
                  <Typography>
                    <strong>Type de compte:</strong> {extractStringValue(selectedCompte.type_compte) || 'Standard'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informations du Client
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {clientDetails ? (
                    <>
                      <Typography>
                        <strong>Nom complet:</strong> {extractStringValue(clientDetails.nom_complet)}
                      </Typography>
                      <Typography>
                        <strong>Numéro client:</strong> {extractStringValue(clientDetails.num_client) || 'N/A'}
                      </Typography>
                      <Typography>
                        <strong>Type:</strong> {clientDetails.type_client === 'physique' ? 'Physique' : 'Morale'}
                      </Typography>
                      <Typography>
                        <strong>Téléphone:</strong> {extractStringValue(clientDetails.telephone) || 'N/A'}
                      </Typography>
                      <Typography>
                        <strong>Email:</strong> {extractStringValue(clientDetails.email) || 'N/A'}
                      </Typography>
                      {clientDetails.adresse && (
                        <Typography>
                          <strong>Adresse:</strong> {extractStringValue(clientDetails.adresse)}
                        </Typography>
                      )}
                      {clientDetails.adresse_activite && (
                        <Typography>
                          <strong>Adresse activité:</strong> {extractStringValue(clientDetails.adresse_activite)}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography>Aucune information client disponible</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  // Rendre la sélection des types de crédit
  const renderCreditTypeSelection = () => (
    <Grid container spacing={2}>
      {creditTypes.map((type) => (
        <Grid size={{ xs: 12, md: 6 }} key={type.id}>
          <StyledCard
            selected={creditData.credit_type_id === type.id.toString()}
            onClick={() => handleCreditChange('credit_type_id', type.id)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {extractStringValue(type.nom)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {extractStringValue(type.description)}
                  </Typography>
                  <Chip
                    label={type.code || 'N/A'}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`Taux: ${type.taux_interet}%`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </Box>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    loadCreditTypeDetails(type.id);
                  }}
                  size="small"
                >
                  <InfoIcon />
                </IconButton>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={1}>
                <Grid size={6}>
                  <Typography variant="caption" display="block" color="textSecondary">
                    Montant max
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {type.montant_max ? type.montant_max.toLocaleString('fr-FR') : '0'} FCFA
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" display="block" color="textSecondary">
                    Durée max
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {type.duree_max || 0} Mois
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );

  // Rendre le formulaire des détails du crédit
  const renderCreditDetailsForm = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Montant demandé (FCFA)"
          type="number"
          value={creditData.montant}
          onChange={(e) => handleCreditChange('montant', e.target.value)}
          required
          InputProps={{
            startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
          }}
          helperText="Le montant doit être compris entre les limites du type de crédit"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Durée (Mois)"
          type="number"
          value={creditData.duree}
          onChange={(e) => handleCreditChange('duree', e.target.value)}
          required
          helperText="Durée en jours du crédit"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Source de revenus"
          value={creditData.source_revenus}
          onChange={(e) => handleCreditChange('source_revenus', e.target.value)}
          required
          placeholder="Ex: Salaire, Commerce, etc."
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Revenus mensuels (FCFA)"
          type="number"
          value={creditData.revenus_mensuels}
          onChange={(e) => handleCreditChange('revenus_mensuels', e.target.value)}
          required
          InputProps={{
            startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Numéro de contact en cas d'urgence"
          value={creditData.contact_urgence}
          onChange={(e) => handleCreditChange('contact_urgence', e.target.value)}
          required
          placeholder="Ex: +225 07 00 00 00 00"
          InputProps={{
            startAdornment: <InputAdornment position="start"><ContactPhoneIcon /></InputAdornment>,
          }}
          helperText="Personne à contacter en cas d'urgence"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Type de compte</InputLabel>
          <Select
            value={creditData.account_type}
            label="Type de compte"
            onChange={(e) => handleCreditChange('account_type', e.target.value)}
            required
          >
            <MenuItem value="courant">Courant</MenuItem>
            <MenuItem value="epargne">Épargne</MenuItem>
            <MenuItem value="depot">Dépôt à terme</MenuItem>
            <MenuItem value="credit">Crédit</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Niveau d'urgence</InputLabel>
          <Select
            value={creditData.urgence}
            label="Niveau d'urgence"
            onChange={(e) => handleCreditChange('urgence', e.target.value)}
          >
            <MenuItem value="normale">Normale</MenuItem>
            <MenuItem value="urgente">Urgente</MenuItem>
            <MenuItem value="tres_urgente">Très urgente</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Observations (optionnel)"
          multiline
          rows={3}
          value={creditData.observation}
          onChange={(e) => handleCreditChange('observation', e.target.value)}
          placeholder="Ajoutez des informations complémentaires si nécessaire..."
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Button
          variant="outlined"
          startIcon={<CalculateIcon />}
          onClick={calculateInterest}
          disabled={!creditData.montant || !creditData.duree || !creditData.credit_type_id}
        >
          Calculer les intérêts
        </Button>
      </Grid>
    </Grid>
  );

  // Rendre les résultats du calcul
  const renderCalculationResult = () => {
    if (!showCalculation || !calculationResult) return null;
    
    return (
      <Accordion defaultExpanded sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalculateIcon color="primary" />
            <Typography variant="h6">Résultat du Calcul</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Détails du calcul
                  </Typography>
                  <Typography><strong>Montant:</strong> {calculationResult.montant.toLocaleString('fr-FR')} FCFA</Typography>
                  <Typography><strong>Durée:</strong> {calculationResult.duree} jours</Typography>
                  <Typography><strong>Intérêts:</strong> {calculationResult.interet} FCFA</Typography>
                  {calculationResult.frais_dossier && (
                    <Typography><strong>Frais de dossier:</strong> {calculationResult.frais_dossier} FCFA</Typography>
                  )}
                  {calculationResult.frais_etude && (
                    <Typography><strong>Frais d'étude:</strong> {calculationResult.frais_etude} FCFA</Typography>
                  )}
                  <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
                    Total à rembourser: {calculationResult.total} FCFA
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Informations supplémentaires
                  </Typography>
                  <Typography><strong>Méthode:</strong> {calculationResult.method}</Typography>
                  {calculationResult.taux_applique && (
                    <Typography><strong>Taux appliqué:</strong> {calculationResult.taux_applique}%</Typography>
                  )}
                  {calculationResult.taux_effectif && (
                    <Typography><strong>Taux effectif annuel:</strong> {calculationResult.taux_effectif}%</Typography>
                  )}
                  {calculationResult.palier && (
                    <Typography><strong>Palier appliqué:</strong> {calculationResult.palier}</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  // Rendre la section des documents
  const renderDocumentsSection = () => (
    <Grid container spacing={2}>
      {documentList.map((doc) => (
        <Grid size={{ xs: 12, md: 6 }} key={doc.key}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {doc.icon}
                  <Typography variant="subtitle1">
                    {doc.label}
                    {doc.required && <span style={{ color: 'red' }}>*</span>}
                  </Typography>
                </Box>
                {doc.required ? (
                  <Chip label="Requis" size="small" color="primary" variant="outlined" />
                ) : (
                  <Chip label="Optionnel" size="small" color="default" variant="outlined" />
                )}
              </Box>
              <input
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                id={`file-upload-${doc.key}`}
                type="file"
                onChange={(e) => handleFileChange(doc.key, e.target.files[0])}
              />
              <label htmlFor={`file-upload-${doc.key}`}>
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<InsertDriveFileIcon />}
                >
                  {documents[doc.key]?.file ? documents[doc.key].file.name : 'Choisir un fichier'}
                </Button>
              </label>
              {documents[doc.key]?.file && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`${(documents[doc.key].file.size / 1024).toFixed(2)} KB`}
                    size="small"
                    color="success"
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleFileChange(doc.key, null)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // ============================
  // RENDU PRINCIPAL
  // ============================

  // Afficher le chargement initial
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Nouvelle Demande de Crédit
      </Typography>

      {/* Avertissement si non authentifié */}
      {!isUserAuthenticated() && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Vous devez être connecté pour accéder à cette fonctionnalité.
        </Alert>
      )}

      {/* Formulaire principal */}
      <form onSubmit={handleSubmit}>
        
        {/* SECTION 1: Sélection du Compte */}
        <StyledPaper elevation={2}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceIcon color="primary" />
            1. Sélection du Compte
          </Typography>
          
          {/* Indicateur de chargement */}
          {loadingComptes && <LinearProgress sx={{ mb: 2 }} />}
          
          {/* Message d'erreur */}
          {comptesError && (
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={loadComptes}>
                  <RefreshIcon fontSize="small" /> Réessayer
                </Button>
              }
              sx={{ mb: 2 }}
            >
              {comptesError}
            </Alert>
          )}
          
          {/* Tableau des comptes ou message d'information */}
          {comptes.length > 0 ? (
            renderComptesTable()
          ) : !loadingComptes && !comptesError ? (
            <Alert severity="info">
              Aucun compte disponible. Veuillez créer un compte client d'abord.
            </Alert>
          ) : null}
          
          {/* Détails du compte sélectionné */}
          {renderCompteDetails()}
        </StyledPaper>

        {/* SECTION 2: Type de Crédit */}
        <StyledPaper elevation={2}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoneyIcon color="primary" />
            2. Type de Crédit
          </Typography>
          
          {/* Indicateur de chargement */}
          {loadingCreditTypes && <CircularProgress size={24} sx={{ mr: 2 }} />}
          
          {/* Message d'erreur */}
          {creditTypesError && (
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={loadCreditTypes}>
                  <RefreshIcon fontSize="small" /> Réessayer
                </Button>
              }
              sx={{ mb: 2 }}
            >
              {creditTypesError}
            </Alert>
          )}
          
          {/* Sélection des types de crédit ou message d'information */}
          {creditTypes.length > 0 ? (
            renderCreditTypeSelection()
          ) : !loadingCreditTypes && !creditTypesError ? (
            <Alert severity="info">
              Aucun type de crédit disponible.
            </Alert>
          ) : null}
        </StyledPaper>

        {/* SECTION 3: Détails du Crédit */}
        <StyledPaper elevation={2}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionIcon color="primary" />
            3. Détails du Crédit
          </Typography>
          {renderCreditDetailsForm()}
          {renderCalculationResult()}
        </StyledPaper>

        {/* SECTION 4: Documents Requis */}
        <StyledPaper elevation={2}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InsertDriveFileIcon color="primary" />
            4. Documents Requis
          </Typography>
          {renderDocumentsSection()}
        </StyledPaper>

        {/* Boutons d'action */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={resetForm}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Soumission en cours...' : 'Soumettre la Demande'}
          </Button>
        </Box>
      </form>

      {/* Toast pour les notifications */}
      <CustomToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
      />

      {/* Dialogue pour les détails du type de crédit */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Détails du Type de Crédit</DialogTitle>
        <DialogContent>
          {selectedCreditDetails && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">
                {extractStringValue(selectedCreditDetails.nom || selectedCreditDetails.libelle || selectedCreditDetails.code || 'Détails du crédit')}
              </Typography>
              
              <Typography color="textSecondary" sx={{ mb: 2 }}>
                {extractStringValue(selectedCreditDetails.description || selectedCreditDetails.libelle || 'Aucune description disponible')}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body2">
                    <strong>Code:</strong> {extractStringValue(selectedCreditDetails.code) || 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2">
                    <strong>Libellé:</strong> {extractStringValue(selectedCreditDetails.libelle) || 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2">
                    <strong>Taux d'intérêt annuel:</strong> {extractStringValue(selectedCreditDetails.taux_interet_annuel) || 0}%
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2">
                    <strong>Statut:</strong> {selectedCreditDetails.actif ? 'Actif' : 'Inactif'}
                  </Typography>
                </Grid>
                {selectedCreditDetails.duree_blocage_min && (
                  <Grid size={6}>
                    <Typography variant="body2">
                      <strong>Durée min:</strong> {extractStringValue(selectedCreditDetails.duree_blocage_min)} jours
                    </Typography>
                  </Grid>
                )}
                {selectedCreditDetails.duree_blocage_max && (
                  <Grid size={6}>
                    <Typography variant="body2">
                      <strong>Durée max:</strong> {extractStringValue(selectedCreditDetails.duree_blocage_max)} jours
                    </Typography>
                  </Grid>
                )}
                {selectedCreditDetails.frais_ouverture && (
                  <Grid size={6}>
                    <Typography variant="body2">
                      <strong>Frais d'ouverture:</strong> {extractStringValue(selectedCreditDetails.frais_ouverture)} FCFA
                    </Typography>
                  </Grid>
                )}
                {selectedCreditDetails.created_at && (
                  <Grid size={12}>
                    <Typography variant="body2">
                      <strong>Créé le:</strong> {new Date(selectedCreditDetails.created_at).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Afficher les observations si disponibles */}
              {selectedCreditDetails.observations && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Observations
                  </Typography>
                  <Typography variant="body2">
                    {extractStringValue(selectedCreditDetails.observations)}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NouvelleDemande;