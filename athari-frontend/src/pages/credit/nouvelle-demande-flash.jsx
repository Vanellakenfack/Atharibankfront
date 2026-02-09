// src/pages/credit/nouvelle-demande-flash.jsx
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
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../services/api/clientApi';
import { compteService } from '../../services/api/compteApi';

// ============================
// STYLED COMPONENTS
// ============================
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
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
const NouvelleDemandeFlash = () => {
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
  
  // ============================
  // ÉTATS POUR LA RECHERCHE ET PAGINATION
  // ============================
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // ============================
  // ÉTATS POUR LES TYPES DE CRÉDIT FLASH
  // ============================
  const [creditFlashTypes, setCreditFlashTypes] = useState([]);
  const [loadingCreditTypes, setLoadingCreditTypes] = useState(false);
  const [creditTypesError, setCreditTypesError] = useState(null);
  
  // ============================
  // ÉTATS POUR LE CALCUL D'INTÉRÊT
  // ============================
  const [calculationResult, setCalculationResult] = useState(null);
  const [showCalculation, setShowCalculation] = useState(false);
  const [amortizationData, setAmortizationData] = useState([]);
  
  // ============================
  // ÉTATS POUR LE FORMULAIRE
  // ============================
  const [creditData, setCreditData] = useState({
    credit_type_id: '',
    montant: '',
    duree: '',
    observation: 'RAS',
    urgence: 'normale',
    source_revenus: '',
    revenus_mensuels: '',
    autres_revenus: '0.00',
    montant_dettes: '0.00',
    description_dette: 'RAS',
    nom_banque: 'N/A',
    numero_banque: 'N/A',
    contact_urgence: ''
  });

  // ============================
  // ÉTATS POUR LES DOCUMENTS SPÉCIFIQUES AU CRÉDIT FLASH
  // ============================
  const [documents, setDocuments] = useState({
    demande_credit: { file: null },
    photocopie_cni: { file: null },
    plan_localisation_domicile: { file: null },
    description_domicile: { file: null },
    geolocalisation_domicile: { file: null },
    photo_domicile_1: { file: null },
    photo_domicile_2: { file: null },
    photo_domicile_3: { file: null },
    plan_localisation_activite: { file: null },
    description_activite: { file: null },
    geolocalisation_activite: { file: null },
    photo_activite_1: { file: null },
    photo_activite_2: { file: null },
    photo_activite_3: { file: null },
    lettre_non_remboursement: { file: null }
  });

  // État pour suivre les documents chargés automatiquement
  const [autoLoadedDocuments, setAutoLoadedDocuments] = useState({});

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
  // LISTE DES DOCUMENTS REQUIS POUR CRÉDIT FLASH
  // ============================
  const documentList = [
    { key: 'demande_credit', label: "Demande de crédit", required: true, icon: <DescriptionOutlinedIcon />, apiField: 'demande_credit_img' },
    { key: 'photocopie_cni', label: "Photocopie de la CNI", required: true, icon: <InsertDriveFileIcon />, apiField: 'photocopie_cni' },
    { key: 'plan_localisation_domicile', label: "Plan de localisation du domicile", required: true, icon: <HomeIcon />, apiField: 'plan_localisation_domicile' },
    { key: 'description_domicile', label: "Description du domicile", required: true, icon: <DescriptionOutlinedIcon />, apiField: 'description_domicile' },
    { key: 'geolocalisation_domicile', label: "Géolocalisation du lieu de résidence", required: true, icon: <LocationOnIcon />, apiField: 'geolocalisation_domicile' },
    { key: 'photo_domicile_1', label: "Photo du domicile 1", required: true, icon: <PhotoCameraIcon />, apiField: 'photo_domicile_1' },
    { key: 'photo_domicile_2', label: "Photo du domicile 2", required: true, icon: <PhotoCameraIcon />, apiField: 'photo_domicile_2' },
    { key: 'photo_domicile_3', label: "Photo du domicile 3", required: true, icon: <PhotoCameraIcon />, apiField: 'photo_domicile_3' },
    { key: 'plan_localisation_activite', label: "Plan de localisation du lieu d'activité", required: true, icon: <BusinessIcon />, apiField: 'plan_localisation_img' },
    { key: 'description_activite', label: "Description du lieu d'activité", required: true, icon: <DescriptionOutlinedIcon />, apiField: 'description_activite' },
    { key: 'geolocalisation_activite', label: "Géolocalisation de l'activité", required: true, icon: <LocationOnIcon />, apiField: 'geolocalisation_img' },
    { key: 'photo_activite_1', label: "Photo de l'activité 1", required: true, icon: <PhotoCameraIcon />, apiField: 'photo_activite_1' },
    { key: 'photo_activite_2', label: "Photo de l'activité 2", required: true, icon: <PhotoCameraIcon />, apiField: 'photo_activite_2' },
    { key: 'photo_activite_3', label: "Photo de l'activité 3", required: true, icon: <PhotoCameraIcon />, apiField: 'photo_activite_3' },
    { key: 'lettre_non_remboursement', label: "Lettre de non remboursement des frais d'étude signée", required: true, icon: <DescriptionOutlinedIcon />, apiField: 'lettre_non_remboursement' }
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
        // Charger les comptes et types de crédit flash en parallèle
        await Promise.all([
          loadComptes(),
          loadCreditFlashTypes()
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

  // Effet pour calculer automatiquement l'amortissement quand le résultat du calcul change
  useEffect(() => {
    if (calculationResult && calculationResult.montant && calculationResult.duree) {
      calculateAmortization();
    } else {
      setAmortizationData([]);
    }
  }, [calculationResult]);

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

  // Fonction pour récupérer un document comme fichier
  const fetchPhotoAsFile = async (url, fileName) => {
    const token = getToken();
    const fullUrl = `http://127.0.0.1:8000/${url}`;

    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    return file;
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

  // Charger uniquement les types de crédit flash depuis l'API
  const loadCreditFlashTypes = async () => {
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
        // Filtrer uniquement les crédits flash
        const flashTypes = creditTypesArray.filter(type => {
          const categorie = type.category?.toLowerCase() || '';
          const code = type.code?.toLowerCase() || '';
          const libelle = type.libelle?.toLowerCase() || '';
          const nom = type.nom?.toLowerCase() || '';
          
          return categorie.includes('flash') || 
                 code.includes('flash') || 
                 libelle.includes('flash') ||
                 nom.includes('flash') ||
                 code === 'flash_24h' ||
                 code === 'credit_flash';
        });

        if (flashTypes.length > 0) {
          // Formater les types de crédit flash
          const formattedTypes = flashTypes.map(type => {
            const nomValue = extractStringValue(type.credit_characteristics || type.nom || type.code || type.libelle || 'Crédit Flash');
            const descriptionValue = extractStringValue(type.description || type.libelle || 'Crédit flash rapide');

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
              details_supplementaires: type.details_supplementaires
            };
          });

          setCreditFlashTypes(formattedTypes);

          // Sélectionner automatiquement le premier type de crédit flash
          if (formattedTypes.length > 0) {
            const firstType = formattedTypes[0];
            setCreditData(prev => ({
              ...prev,
              credit_type_id: firstType.id,
            }));
          }
        } else {
          setCreditTypesError('Aucun type de crédit flash disponible');
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
  // FONCTIONS DE CALCUL D'INTÉRÊT
  // ============================

  // Calculer les intérêts basés sur la grille de tarification
  const calculateInterest = () => {
    const selectedType = creditFlashTypes.find(type => type.id === parseInt(creditData.credit_type_id));
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

  // Calculer le tableau d'amortissement
  const calculateAmortization = () => {
    if (!calculationResult || !calculationResult.montant || !calculationResult.duree) {
      setAmortizationData([]);
      return;
    }

    const montant = parseFloat(calculationResult.montant);
    const duree = parseInt(calculationResult.duree);
    const totalInteret = parseFloat(calculationResult.interet);
    const fraisDossier = parseFloat(calculationResult.frais_dossier || 0);
    const fraisEtude = parseFloat(calculationResult.frais_etude || 0);

    // Montant total à rembourser
    const totalARembourser = montant + totalInteret + fraisDossier + fraisEtude;

    // Remboursement quotidien (capital + intérêts + frais répartis)
    const remboursementQuotidien = totalARembourser / duree;

    const amortizationData = [];
    let soldeRestant = montant;
    let cumulRembourse = 0;
    const startDate = new Date();

    for (let jour = 1; jour <= duree; jour++) {
      // Calculer la date du remboursement
      const dateRemboursement = new Date(startDate);
      dateRemboursement.setDate(startDate.getDate() + jour);

      // Calculer les intérêts quotidiens (répartis proportionnellement)
      const interetQuotidien = totalInteret / duree;

      // Calculer le capital remboursé ce jour
      const capitalRembourse = remboursementQuotidien - interetQuotidien;

      // Mettre à jour le solde restant
      soldeRestant = Math.max(0, soldeRestant - capitalRembourse);

      // Mettre à jour le cumul remboursé
      cumulRembourse += remboursementQuotidien;

      amortizationData.push({
        numero: jour,
        dateRemboursement: dateRemboursement.toLocaleDateString('fr-FR'),
        montantRemboursement: remboursementQuotidien.toFixed(2),
        soldeRestant: soldeRestant.toFixed(2),
        cumulRembourse: cumulRembourse.toFixed(2)
      });
    }

    setAmortizationData(amortizationData);
  };

  // ============================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ============================

  // Sélectionner un compte
  const handleCompteSelect = async (compteId, compte) => {
    console.log('handleCompteSelect called with compte:', compte);
    setSelectedCompteId(compteId);
    setSelectedCompte(compte);
    setClientDetails(null); // Reset client details
    console.log('selectedCompte set to:', compte);

    // Récupérer les détails complets du client depuis l'API pour obtenir tous les documents
    const clientId = compte.client_id || compte.client?.id;
    console.log('Fetching client details for ID:', clientId);

    if (!clientId) {
      console.log('No clientId found, skipping document loading');
      showToast('Aucun client associé à ce compte', 'warning');
      return;
    }

    try {
      const fullClientDetails = await clientService.getClientById(clientId);
      console.log('Full client details received:', fullClientDetails);
      setClientDetails(fullClientDetails);

      // Pré-remplir le contact d'urgence si disponible
      if (fullClientDetails.telephone_urgence) {
        setCreditData(prev => ({ ...prev, contact_urgence: fullClientDetails.telephone_urgence }));
      }

      // Pré-remplir les documents disponibles
      const updatedDocuments = { ...documents };
      const newAutoLoadedDocuments = {};

      // Photo de localisation d'activité
      if (fullClientDetails.photo_localisation_activite) {
        console.log('Loading photo_localisation_activite:', fullClientDetails.photo_localisation_activite);
        try {
          const photoFile = await fetchPhotoAsFile(fullClientDetails.photo_localisation_activite, 'photo_activite.png');
          updatedDocuments.photo_activite = { file: photoFile };
          newAutoLoadedDocuments.photo_activite = true;
        } catch (error) {
          console.error('Erreur lors de la récupération de la photo de localisation d\'activité:', error);
          showToast('Erreur lors du chargement automatique de la photo d\'activité', 'warning');
        }
      }

      // Photo de localisation du domicile
      if (fullClientDetails.photo_localisation_domicile) {
        console.log('Loading photo_localisation_domicile:', fullClientDetails.photo_localisation_domicile);
        try {
          const photoFile = await fetchPhotoAsFile(fullClientDetails.photo_localisation_domicile, 'photo_domicile.png');
          updatedDocuments.photo_domicile = { file: photoFile };
          newAutoLoadedDocuments.photo_domicile = true;
        } catch (error) {
          console.error('Erreur lors de la récupération de la photo de localisation du domicile:', error);
        }
      }

      // Plan de localisation d'activité
      if (fullClientDetails.plan_localisation_activite) {
        console.log('Loading plan_localisation_activite:', fullClientDetails.plan_localisation_activite);
        try {
          const planFile = await fetchPhotoAsFile(fullClientDetails.plan_localisation_activite, 'plan_localisation_activite.png');
          updatedDocuments.plan_localisation_activite = { file: planFile };
          newAutoLoadedDocuments.plan_localisation_activite = true;
        } catch (error) {
          console.error('Erreur lors de la récupération du plan de localisation d\'activité:', error);
        }
      }

      // Plan de localisation du domicile
      if (fullClientDetails.plan_localisation_domicile) {
        console.log('Loading plan_localisation_domicile:', fullClientDetails.plan_localisation_domicile);
        try {
          const planFile = await fetchPhotoAsFile(fullClientDetails.plan_localisation_domicile, 'plan_localisation_domicile.png');
          updatedDocuments.plan_localisation_domicile = { file: planFile };
          newAutoLoadedDocuments.plan_localisation_domicile = true;
        } catch (error) {
          console.error('Erreur lors de la récupération du plan de localisation du domicile:', error);
        }
      }

      // Géolocalisation d'activité
      if (fullClientDetails.geolocalisation_activite) {
        console.log('Loading geolocalisation_activite:', fullClientDetails.geolocalisation_activite);
        try {
          const geoFile = await fetchPhotoAsFile(fullClientDetails.geolocalisation_activite, 'geolocalisation_activite.png');
          updatedDocuments.geolocalisation_activite = { file: geoFile };
          newAutoLoadedDocuments.geolocalisation_activite = true;
        } catch (error) {
          console.error('Erreur lors de la récupération de la géolocalisation d\'activité:', error);
        }
      }

      // Photocopiecopie CNI
      if (fullClientDetails.photocopie_cni) {
        console.log('Loading photocopie_cni:', fullClientDetails.photocopie_cni);
        try {
          const cniFile = await fetchPhotoAsFile(fullClientDetails.photocopie_cni, 'photocopie_cni.png');
          updatedDocuments.photocopie_cni = { file: cniFile };
          newAutoLoadedDocuments.photocopie_cni = true;
        } catch (error) {
          console.error('Erreur lors de la récupération de la photocopie CNI:', error);
        }
      }

      // Lettre de non remboursement
      if (fullClientDetails.lettre_non_remboursement) {
        console.log('Loading lettre_non_remboursement:', fullClientDetails.lettre_non_remboursement);
        try {
          const lettreFile = await fetchPhotoAsFile(fullClientDetails.lettre_non_remboursement, 'lettre_non_remboursement.pdf');
          updatedDocuments.lettre_non_remboursement = { file: lettreFile };
          newAutoLoadedDocuments.lettre_non_remboursement = true;
        } catch (error) {
          console.error('Erreur lors de la récupération de la lettre de non remboursement:', error);
        }
      }

      console.log('Setting documents:', updatedDocuments);
      console.log('Setting auto loaded documents:', newAutoLoadedDocuments);
      setDocuments(updatedDocuments);
      setAutoLoadedDocuments(newAutoLoadedDocuments);

      const loadedCount = Object.keys(newAutoLoadedDocuments).length;
      if (loadedCount > 0) {
        showToast(`${loadedCount} document(s) du client chargé(s) automatiquement`, 'success');
      } else {
        showToast('Aucun document disponible pour ce client', 'info');
      }

    } catch (error) {
      console.error('Erreur lors de la récupération des détails du client:', error);

      // Handle 403 Forbidden specifically
      if (error.status === 403 || error.response?.status === 403) {
        console.warn('Accès refusé (403) pour le client ID:', clientId);
        showToast('Accès refusé: Vous n\'avez pas les permissions pour consulter les détails de ce client. Contactez votre administrateur.', 'error');
        // Fallback aux données partielles du compte si disponible
        if (compte.client) {
          setClientDetails(compte.client);
          showToast('Utilisation des données partielles du compte', 'info');
        } else {
          setClientDetails(null);
        }
      } else {
        // Handle other errors
        showToast('Erreur lors du chargement des documents du client', 'warning');
        // Fallback aux données partielles du compte si disponible
        if (compte.client) {
          setClientDetails(compte.client);
        } else {
          setClientDetails(null);
        }
      }
    }
  };

  // Changer les données du crédit
  const handleCreditChange = (field, value) => {
    const updatedData = { ...creditData, [field]: value };
    
    // Réinitialiser le calcul si le type de crédit change
    if (field === 'credit_type_id') {
      const selectedType = creditFlashTypes.find(type => type.id === parseInt(value));
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
    const selectedType = creditFlashTypes.find(type => type.id === parseInt(creditData.credit_type_id));
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

    // Validation des documents obligatoires - plus stricte
    documentList.forEach(doc => {
      if (doc.required) {
        if (!documents[doc.key] || !documents[doc.key].file) {
          errors.push(`Document "${doc.label}" est obligatoire et doit être téléchargé`);
        } else if (documents[doc.key].file.size === 0) {
          errors.push(`Document "${doc.label}" semble être vide`);
        }
      }
    });

    // Afficher toutes les erreurs
    if (errors.length > 0) {
      console.error('Erreurs de validation:', errors);
      alert('Erreurs de validation:\n\n' + errors.join('\n\n'));
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
      credit_type_id: creditFlashTypes.length > 0 ? creditFlashTypes[0].id : '',
      montant: '',
      duree: '',
      observation: '',
      urgence: 'normale',
      source_revenus: '',
      revenus_mensuels: '',
      autres_revenus: '',
      montant_dettes: '',
      description_dette: '',
      nom_banque: '',
      numero_banque: '',
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

      // Always send all fields with meaningful values to prevent null values in database
      formData.append('observation', creditData.observation && creditData.observation.trim() !== '' ? creditData.observation : 'RAS');
      formData.append('source_revenus', creditData.source_revenus || 'N/A');
      formData.append('revenus_mensuels', creditData.revenus_mensuels || '0.00');

      // Always send autres_revenus with a value
      const autresRevenusValue = creditData.autres_revenus && creditData.autres_revenus.trim() !== '' ? creditData.autres_revenus : '0.00';
      formData.append('autres_revenus', autresRevenusValue);

      // Always send montant_dettes with a value
      const montantDettesValue = creditData.montant_dettes && creditData.montant_dettes.trim() !== '' ? creditData.montant_dettes : '0.00';
      formData.append('montant_dettes', montantDettesValue);

      // Always send description_dette with a value
      const descriptionDetteValue = creditData.description_dette && creditData.description_dette.trim() !== '' ? creditData.description_dette : 'RAS';
      formData.append('description_dette', descriptionDetteValue);

      // Always send nom_banque with a value
      const nomBanqueValue = creditData.nom_banque && creditData.nom_banque.trim() !== '' ? creditData.nom_banque : 'N/A';
      formData.append('nom_banque', nomBanqueValue);

      // Always send numero_banque with a value
      const numeroBanqueValue = creditData.numero_banque && creditData.numero_banque.trim() !== '' ? creditData.numero_banque : 'N/A';
      formData.append('numero_banque', numeroBanqueValue);

      // Always send numero_personne_contact with a value
      formData.append('numero_personne_contact', creditData.contact_urgence && creditData.contact_urgence.trim() !== '' ? creditData.contact_urgence : 'N/A');

      // Ajouter les documents spécifiques au crédit flash - only if they exist
      documentList.forEach(doc => {
        if (documents[doc.key]?.file) {
          formData.append(doc.apiField, documents[doc.key].file);
        }
        // Don't append empty strings - let backend handle missing documents
      });
      
      const token = getToken();
      
      // Envoyer la demande à l'API
      console.log('Envoi de la demande à:', `${API_BASE_URL}/credit-applications`);
      console.log('Token:', token ? 'Présent' : 'Absent');
      console.log('FormData contenu:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch(`${API_BASE_URL}/credit-applications`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      console.log('Réponse status:', response.status);
      console.log('Réponse headers:', response.headers);

      let responseData;
      try {
        responseData = await response.json();
        console.log('Réponse data:', responseData);
      } catch (e) {
        console.error('Erreur parsing JSON:', e);
        throw new Error('Réponse invalide du serveur');
      }

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
      console.log('Demande créée avec succès:', responseData);
      showToast('Demande de crédit flash créée avec succès !', 'success');
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
      <TextField
        fullWidth
        placeholder="Rechercher par numéro compte, nom client, email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} /> }}
        sx={{ mb: 2 }}
      />
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

  // Rendre la sélection des types de crédit flash
  const renderCreditTypeSelection = () => (
    <Grid container spacing={2}>
      {creditFlashTypes.map((type) => (
        <Grid size={{ xs: 12, md: 6 }} key={type.id}>
          <Card 
            variant="outlined"
            sx={{
              cursor: 'pointer',
              border: creditData.credit_type_id === type.id.toString() ? '2px solid #1976d2' : '1px solid #e0e0e0',
              backgroundColor: creditData.credit_type_id === type.id.toString() ? 'rgba(25, 118, 210, 0.08)' : 'white',
              '&:hover': {
                borderColor: '#1976d2',
              },
            }}
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
                    label="Crédit Flash"
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
                    {type.duree_max || 0} jours
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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
          label="Durée (jours)"
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
          label="Autres revenus (FCFA)"
          type="number"
          value={creditData.autres_revenus}
          onChange={(e) => handleCreditChange('autres_revenus', e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
          }}
          helperText="Revenus supplémentaires (optionnel)"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Montant des dettes (FCFA)"
          type="number"
          value={creditData.montant_dettes}
          onChange={(e) => handleCreditChange('montant_dettes', e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
          }}
          helperText="Montant total des dettes actuelles"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Description des dettes"
          value={creditData.description_dette}
          onChange={(e) => handleCreditChange('description_dette', e.target.value)}
          multiline
          rows={2}
          placeholder="Décrivez vos dettes actuelles..."
          helperText="Détaillez vos engagements financiers"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Nom de la banque"
          value={creditData.nom_banque}
          onChange={(e) => handleCreditChange('nom_banque', e.target.value)}
          placeholder="Ex: CCA, BICICI, etc."
          helperText="Banque principale du client"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Numéro de compte bancaire"
          value={creditData.numero_banque}
          onChange={(e) => handleCreditChange('numero_banque', e.target.value)}
          placeholder="Numéro de compte bancaire"
          helperText="Numéro de compte à la banque"
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
          {renderAmortizationTable()}
        </AccordionDetails>
      </Accordion>
    );
  };

  // Rendre le tableau d'amortissement
  const renderAmortizationTable = () => {
    if (!amortizationData || amortizationData.length === 0) return null;

    return (
      <Box sx={{ mt: 4 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          p: 2,
          backgroundColor: 'primary.light',
          borderRadius: 2,
          color: 'white'
        }}>
          <AttachMoneyIcon />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Tableau d'Amortissement
          </Typography>
        </Box>
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            maxHeight: 700,
            borderRadius: 2,
            overflow: 'hidden',
            '& .MuiTable-root': { borderCollapse: 'separate', borderSpacing: '0 4px' }
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid #1976d2',
                '& .MuiTableCell-head': {
                  color: '#1976d2',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  border: 'none',
                  py: 2.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }
              }}>
                <TableCell sx={{ borderTopLeftRadius: 8 }}>Numéro</TableCell>
                <TableCell>Date de remboursement</TableCell>
                <TableCell align="right">Montant du remboursement</TableCell>
                <TableCell align="right">Solde restant</TableCell>
                <TableCell align="right" sx={{ borderTopRightRadius: 8 }}>Cumul remboursé</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {amortizationData.map((row, index) => (
                <TableRow
                  key={row.numero}
                  sx={{
                    backgroundColor: index % 2 === 0 ? 'grey.50' : 'white',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      opacity: 0.8,
                      transform: 'scale(1.01)',
                      transition: 'all 0.2s ease-in-out'
                    },
                    '& .MuiTableCell-body': {
                      border: 'none',
                      py: 1.5,
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  <TableCell>
                    <Chip
                      label={row.numero}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {row.dateRemboursement}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {parseFloat(row.montantRemboursement).toLocaleString('fr-FR')} FCFA
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500, color: 'warning.main' }}>
                    {parseFloat(row.soldeRestant).toLocaleString('fr-FR')} FCFA
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {parseFloat(row.cumulRembourse).toLocaleString('fr-FR')} FCFA
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{
          mt: 2,
          p: 2,
          backgroundColor: 'grey.100',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.300'
        }}>
          <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalculateIcon fontSize="small" />
            <strong>Note:</strong> Le tableau montre le plan de remboursement quotidien pour la durée du crédit sélectionné.
            Les montants sont calculés automatiquement en fonction des paramètres saisis.
          </Typography>
        </Box>
      </Box>
    );
  };

  // Rendre la section des documents spécifiques au crédit flash
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
                  sx={{
                    backgroundColor: autoLoadedDocuments[doc.key] ? 'rgba(76, 175, 80, 0.08)' : 'transparent',
                    borderColor: autoLoadedDocuments[doc.key] ? '#4caf50' : undefined,
                  }}
                >
                  {documents[doc.key]?.file ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{documents[doc.key].file.name}</Typography>
                      {autoLoadedDocuments[doc.key] && (
                        <Chip
                          label="Auto-chargé"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: '18px' }}
                        />
                      )}
                    </Box>
                  ) : 'Choisir un fichier'}
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
        Nouvelle Demande de Crédit Flash
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

        {/* SECTION 2: Type de Crédit Flash */}
        <StyledPaper elevation={2}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoneyIcon color="primary" />
          </Typography>
          
          {/* Indicateur de chargement */}
          {loadingCreditTypes && <CircularProgress size={24} sx={{ mr: 2 }} />}
          
          {/* Message d'erreur */}
          {creditTypesError && (
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={loadCreditFlashTypes}>
                  <RefreshIcon fontSize="small" /> Réessayer
                </Button>
              }
              sx={{ mb: 2 }}
            >
              {creditTypesError}
            </Alert>
          )}
          
          {/* Sélection des types de crédit flash ou message d'information */}
          {creditFlashTypes.length > 0 ? (
            renderCreditTypeSelection()
          ) : !loadingCreditTypes && !creditTypesError ? (
            <Alert severity="info">
              Aucun type de crédit flash disponible.
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

        {/* SECTION 4: Documents Requis pour Crédit Flash */}
        <StyledPaper elevation={2}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InsertDriveFileIcon color="primary" />
            4. Documents Requis pour Crédit Flash
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
    </Box>
  );
};

export default NouvelleDemandeFlash;