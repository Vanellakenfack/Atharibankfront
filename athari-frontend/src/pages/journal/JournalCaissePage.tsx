// src/pages/JournalCaissePage.tsx

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  CircularProgress,
  Alert,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Stack,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Snackbar from '@mui/material/Snackbar';

// Composants de mise en page
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';

// Import des services
import journalCaisseService, { type CaisseFilterParams, type CaisseMovement, type CaisseJournalApiResponse } from '../../services/api/journalCaisseService';
import agenceService from '../../services/agenceService';
import caisseService from '../../services/caisseService';
import type { Agence } from '../../types/agenceTypes';

// Types
interface Caisse {
  id: number;
  guichet_id: number;
  code_caisse: string;
  libelle: string;
  solde_actuel: number;
  plafond_max: number | null;
  est_active: boolean;
  created_at: string;
  updated_at: string;
  compte_comptable_id: number;
  plafond_autonomie_caissiere: number;
  agence_code?: string;
  agence_id?: string;
}

interface CaisseSection {
  sectionTitle: string;
  totalLabel: string;
  entries: CaisseMovement[];
  count: number;
  totalDebit: number;
  totalCredit: number;
}

interface CaisseJournalData {
  agence: string;
  caisse: string;
  dateDebut: string;
  dateFin: string;
  soldeOuverture: number;
  soldeCloture: number;
  sections: CaisseSection[];
  totalGeneral: number;
  totalDebit: number;
  totalCredit: number;
  synthese: Record<string, number>;
}

// Palette de couleurs bleue dégradée
const blueGradient = {
  primary: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
  dark: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
  light: 'linear-gradient(135deg, #42a5f5 0%, #64b5f6 100%)',
  lighter: 'linear-gradient(135deg, #bbdefb 0%, #e3f2fd 100%)',
  header: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
  button: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
  buttonHover: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
  success: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
  successHover: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
  error: 'linear-gradient(135deg, #c62828 0%, #d32f2f 100%)',
  warning: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'
};

// Types de versement avec nuances de bleu
const typeVersementColors: Record<string, string> = {
  'ESPECE': '#1976d2',
  'ORANGE_MONEY': '#ff9800',
  'MOBILE_MONEY': '#ff5722',
  'VIREMENT': '#2196f3',
  'CHEQUE': '#42a5f5',
  'CARTE': '#f44336',
  'AUTRE': '#757575',
};

// CORRECTION : Fonction pour grouper les mouvements par type de versement
const groupMovementsByTypeVersement = (mouvements: CaisseMovement[]): CaisseSection[] => {
  const groupedData: Record<string, CaisseMovement[]> = {};
  
  mouvements.forEach((mouvement: CaisseMovement) => {
    const key = mouvement.type_versement || 'AUTRE';
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(mouvement);
  });
  
  const sections: CaisseSection[] = Object.entries(groupedData).map(([typeVersement, entries]) => {
    // CORRECTION : Assurez-vous que les totaux sont des NOMBRES
    const totalDebit = entries.reduce((sum, entry) => sum + (Number(entry.montant_debit) || 0), 0);
    const totalCredit = entries.reduce((sum, entry) => sum + (Number(entry.montant_credit) || 0), 0);
    
    return {
      sectionTitle: `${typeVersement} - ${entries.length} opération${entries.length > 1 ? 's' : ''}`,
      totalLabel: typeVersement,
      entries: entries,
      count: entries.length,
      totalDebit, // Nombre, pas chaîne
      totalCredit // Nombre, pas chaîne
    };
  });
  
  // Trier par montant total décroissant
  sections.sort((a, b) => (b.totalDebit + b.totalCredit) - (a.totalDebit + a.totalCredit));
  
  return sections;
};

// CORRECTION : Fonction pour transformer les données API
const transformCaisseApiData = (
  apiData: CaisseJournalApiResponse, 
  filtres: CaisseFilterParams, 
  agencesList: Agence[],
  caissesList: Caisse[]
): CaisseJournalData => {
  
  if (!apiData.mouvements || apiData.mouvements.length === 0) {
    let agenceLabel = 'TOUTES LES AGENCES';
    let caisseLabel = 'TOUTES LES CAISSES';
    
    if (filtres.code_agence !== 'all') {
      const selectedAgence = agencesList.find(a => a.code === filtres.code_agence);
      agenceLabel = selectedAgence ? selectedAgence.name : `AGENCE ${filtres.code_agence}`;
    }
    
    if (filtres.caisse_id !== 'all') {
      const selectedCaisse = caissesList.find(c => c.id.toString() === filtres.caisse_id);
      caisseLabel = selectedCaisse ? selectedCaisse.libelle : `CAISSE ${filtres.caisse_id}`;
    }
    
    return {
      agence: agenceLabel,
      caisse: caisseLabel,
      dateDebut: format(filtres.dateDebut, 'dd/MM/yyyy'),
      dateFin: format(filtres.dateFin, 'dd/MM/yyyy'),
      soldeOuverture: apiData.solde_ouverture || 0,
      soldeCloture: apiData.solde_cloture || 0,
      sections: [],
      totalGeneral: 0,
      totalDebit: 0,
      totalCredit: 0,
      synthese: apiData.synthese || {}
    };
  }
  
  // Créer les sections par type de versement
  const sections = groupMovementsByTypeVersement(apiData.mouvements);
  
  // CORRECTION : Calculer les totaux - utiliser les totaux API si disponibles
  const totalGeneral = apiData.mouvements.length || 0;
  const totalDebit = apiData.total_debit || sections.reduce((total, section) => total + section.totalDebit, 0);
  const totalCredit = apiData.total_credit || sections.reduce((total, section) => total + section.totalCredit, 0);
  
  // Déterminer les labels
  let agenceLabel = 'TOUTES LES AGENCES';
  let caisseLabel = 'TOUTES LES CAISSES';
  
  if (filtres.code_agence !== 'all') {
    const selectedAgence = agencesList.find(a => a.code === filtres.code_agence);
    agenceLabel = selectedAgence ? selectedAgence.name : `AGENCE ${filtres.code_agence}`;
  }
  
  if (filtres.caisse_id !== 'all') {
    const selectedCaisse = caissesList.find(c => c.id.toString() === filtres.caisse_id);
    caisseLabel = selectedCaisse ? selectedCaisse.libelle : `CAISSE ${filtres.caisse_id}`;
  } else {
    // Si "all", prendre le nom de la première caisse dans les mouvements
    const firstCaisseCode = apiData.mouvements[0]?.code_caisse;
    if (firstCaisseCode) {
      const foundCaisse = caissesList.find(c => c.code_caisse === firstCaisseCode);
      if (foundCaisse) {
        caisseLabel = foundCaisse.libelle;
      }
    }
  }
  
  return {
    agence: agenceLabel,
    caisse: caisseLabel,
    dateDebut: format(filtres.dateDebut, 'dd/MM/yyyy'),
    dateFin: format(filtres.dateFin, 'dd/MM/yyyy'),
    soldeOuverture: apiData.solde_ouverture || 0,
    soldeCloture: apiData.solde_cloture || 0,
    sections: sections,
    totalGeneral: totalGeneral,
    totalDebit: totalDebit, // Nombre, pas chaîne
    totalCredit: totalCredit, // Nombre, pas chaîne
    synthese: apiData.synthese || {}
  };
};

// FONCTION CORRIGÉE POUR FORMATER LES MONTANTS
const formatMontant = (montant: number | undefined | null): string => {
  // Vérifier si le montant est valide
  if (montant === undefined || montant === null || isNaN(montant)) {
    return '0,00';
  }
  
  // Formater le montant en français avec séparateurs de milliers
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(Math.abs(montant));
};

// Fonction pour formater le solde (avec signe)
const formatSolde = (montant: number | undefined | null): string => {
  if (montant === undefined || montant === null || isNaN(montant)) {
    return '0,00';
  }
  
  const formatted = formatMontant(montant);
  return montant < 0 ? `-${formatted}` : formatted;
};

// Fonction pour afficher un montant avec la devise
const formatMontantAvecDevise = (montant: number | undefined | null): string => {
  return `${formatMontant(montant)} FCFA`;
};

// Fonction pour formater le solde avec devise
const formatSoldeAvecDevise = (montant: number | undefined | null): string => {
  if (montant === undefined || montant === null || isNaN(montant)) {
    return '0,00 FCFA';
  }
  
  const formatted = formatMontant(montant);
  return montant < 0 ? `-${formatted} FCFA` : `${formatted} FCFA`;
};

const JournalCaissePage: React.FC = () => {
  const theme = useTheme();
  
  // État pour la barre latérale
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // États
  const [filtres, setFiltres] = useState<CaisseFilterParams>({
    dateDebut: new Date(new Date().setDate(new Date().getDate() - 30)),
    dateFin: new Date(),
    caisse_id: 'all',
    code_agence: 'all',
  });

  // État pour les agences
  const [agences, setAgences] = useState<Agence[]>([]);
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [chargementAgences, setChargementAgences] = useState(true);
  const [chargementCaisses, setChargementCaisses] = useState(false);
  const [errorAgences, setErrorAgences] = useState<string | null>(null);
  const [errorCaisses, setErrorCaisses] = useState<string | null>(null);

  const [donneesJournal, setDonneesJournal] = useState<CaisseJournalData | null>(null);
  const [chargement, setChargement] = useState(false);
  const [chargementPDF, setChargementPDF] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [donneesBrutes, setDonneesBrutes] = useState<CaisseJournalApiResponse | null>(null);
  const [backendAccessible, setBackendAccessible] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Charger les agences au démarrage
  useEffect(() => {
    console.log('JournalCaissePage - useEffect de chargement des agences');
    
    const chargerAgences = async () => {
      setChargementAgences(true);
      setErrorAgences(null);
      setDebugInfo('Début du chargement des agences...');
      
      try {
        console.log('Tentative de chargement des agences...');
        const agencesData = await agenceService.getAgences();
        console.log('✅ Agences chargées avec succès:', agencesData.length);
        setDebugInfo(`✅ ${agencesData.length} agences chargées`);
        setAgences(agencesData);
        
        // Tester si le backend est accessible
        console.log('Test de connexion au backend journal caisse...');
        const accessible = await journalCaisseService.testBackend();
        setBackendAccessible(accessible);
        console.log('Backend accessible:', accessible);
        
        if (!accessible) {
          setError('Le backend Laravel n\'est pas accessible. Vérifiez que le serveur est démarré.');
          setSnackbarOpen(true);
          setDebugInfo('❌ Backend non accessible');
        } else {
          setDebugInfo('✅ Backend accessible');
        }
      } catch (error: any) {
        console.error('❌ Erreur lors du chargement des agences:', error);
        
        setErrorAgences(error.message || 'Erreur lors du chargement des agences');
        setBackendAccessible(false);
        setError(`Impossible de charger les agences: ${error.message}.`);
        setSnackbarOpen(true);
        setDebugInfo(`❌ Erreur: ${error.message}`);
        
        // Données fictives pour développement
        const agencesFictives = [
          { id: 1, code: '001', name: 'SIÈGE CENTRAL', shortName: 'SIEGE', createdAt: '', updatedAt: '' },
          { id: 2, code: '002', name: 'AGENCE COMMERCIALE', shortName: 'AGCOMM', createdAt: '', updatedAt: '' },
          { id: 3, code: '003', name: 'AGENCE PRINCIPALE', shortName: 'PRINCIPALE', createdAt: '', updatedAt: '' },
        ];
        setAgences(agencesFictives);
        
        const caissesFictives = [
          { id: 1, code_caisse: 'CAISSE-01', libelle: 'Caisse de Test', solde_actuel: -1201500.00, est_active: true, plafond_autonomie_caissiere: 500000.00 },
        ];
        setCaisses(caissesFictives);
        
        setDebugInfo(`✅ Utilisation de données fictives (${agencesFictives.length} agences, ${caissesFictives.length} caisses)`);
      } finally {
        setChargementAgences(false);
        console.log('Chargement des agences terminé');
      }
    };
    
    chargerAgences();
  }, []);

  // Fonction pour charger les caisses (toutes les caisses, pas besoin de filtrer par agence)
  const chargerCaisses = async () => {
    setChargementCaisses(true);
    setErrorCaisses(null);
    try {
      console.log(`Chargement de toutes les caisses...`);
      
      // Récupérer toutes les caisses via le service
      const response = await caisseService.getCaisses();
      console.log('Réponse API caisses:', response);
      
      let caissesData: Caisse[] = [];
      
      // Gérer la structure de réponse {success: true, data: [...]}
      if (response && typeof response === 'object') {
        if ('success' in response && response.success === true && 'data' in response) {
          caissesData = response.data as Caisse[];
        } else if (Array.isArray(response)) {
          caissesData = response as Caisse[];
        } else if ('data' in response && Array.isArray(response.data)) {
          caissesData = response.data as Caisse[];
        }
      } else if (Array.isArray(response)) {
        caissesData = response as Caisse[];
      }
      
      console.log(`✅ ${caissesData.length} caisses chargées`);
      setCaisses(caissesData);
      
      if (caissesData.length === 0) {
        setErrorCaisses(`Aucune caisse disponible`);
      }
      
    } catch (error: any) {
      console.error('❌ Erreur chargement caisses:', error);
      setErrorCaisses(`Erreur lors du chargement des caisses: ${error.message || 'Erreur inconnue'}`);
      
      // Données fictives pour développement
      const caissesFictives = [
        { 
          id: 1, 
          guichet_id: 1,
          code_caisse: 'CAISSE-01', 
          libelle: 'Caisse de Test', 
          solde_actuel: -1201500.00, 
          plafond_max: null,
          est_active: true,
          created_at: '2026-01-13T09:56:32.000000Z',
          updated_at: '2026-01-14T16:21:33.000000Z',
          compte_comptable_id: 403,
          plafond_autonomie_caissiere: 500000.00
        },
        { 
          id: 2, 
          guichet_id: 1,
          code_caisse: 'CAISSE-02', 
          libelle: 'Caisse Espèces', 
          solde_actuel: 2500000.00, 
          plafond_max: 10000000.00,
          est_active: true,
          created_at: '2026-01-13T09:56:32.000000Z',
          updated_at: '2026-01-14T16:21:33.000000Z',
          compte_comptable_id: 404,
          plafond_autonomie_caissiere: 750000.00
        },
        { 
          id: 3, 
          guichet_id: 2,
          code_caisse: 'CAISSE-03', 
          libelle: 'Caisse Mobile Money', 
          solde_actuel: 1500000.00, 
          plafond_max: 5000000.00,
          est_active: true,
          created_at: '2026-01-13T09:56:32.000000Z',
          updated_at: '2026-01-14T16:21:33.000000Z',
          compte_comptable_id: 405,
          plafond_autonomie_caissiere: 300000.00
        }
      ];
      setCaisses(caissesFictives);
      setDebugInfo(`⚠️ Utilisation de données fictives pour les caisses`);
    } finally {
      setChargementCaisses(false);
    }
  };

  // Effet pour charger les caisses au démarrage
  useEffect(() => {
    if (backendAccessible) {
      chargerCaisses();
    }
  }, [backendAccessible]);

  // Lancer la requête pour le journal de caisse
  const lancerRequete = async () => {
    console.log('Lancement de la requête journal caisse avec filtres:', filtres);
    
    if (!backendAccessible) {
      console.error('Backend non accessible');
      setError('Impossible de se connecter au backend. Vérifiez que le serveur Laravel est démarré.');
      setSnackbarOpen(true);
      return;
    }
    
    if (filtres.caisse_id === 'all') {
      setError('Veuillez sélectionner une caisse spécifique.');
      setSnackbarOpen(true);
      return;
    }
    
    // Pour l'instant, on utilise une valeur par défaut pour code_agence
    // À adapter selon votre logique métier
    if (filtres.code_agence === 'all') {
      setError('Veuillez sélectionner une agence.');
      setSnackbarOpen(true);
      return;
    }
    
    setChargement(true);
    setError(null);
    setDebugInfo('Chargement des données du journal de caisse...');
    
    try {
      console.log('Appel à journalCaisseService.getCaisseJournalEntries...');
      const apiData = await journalCaisseService.getCaisseJournalEntries(filtres);
      console.log('✅ Données du journal de caisse reçues:', apiData);
      setDonneesBrutes(apiData);
      setDebugInfo(`✅ ${apiData.mouvements?.length || 0} mouvements reçus`);
      
      const transformedData = transformCaisseApiData(apiData, filtres, agences, caisses);
      console.log('✅ Données transformées:', transformedData);
      console.log('Total débit transformé:', transformedData.totalDebit, 'Type:', typeof transformedData.totalDebit);
      console.log('Total crédit transformé:', transformedData.totalCredit, 'Type:', typeof transformedData.totalCredit);
      setDonneesJournal(transformedData);
      
      if (transformedData.totalGeneral === 0) {
        console.log('Aucune opération trouvée');
        setError('Aucune opération de caisse trouvée pour les critères sélectionnés');
        setSnackbarOpen(true);
        setDebugInfo('⚠️ Aucune donnée trouvée');
      } else {
        setDebugInfo(`✅ ${transformedData.totalGeneral} opérations trouvées`);
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la requête journal caisse:', error);
      let errorMessage = 'Erreur de connexion au serveur.';
      
      if (error.response) {
        console.error('Détails de la réponse erreur:', error.response);
        
        if (error.response.status === 404) {
          errorMessage = 'Endpoint journal caisse non trouvé. Vérifiez que la route /caisse/journal existe.';
        } else if (error.response.status === 500) {
          errorMessage = 'Erreur serveur interne. Vérifiez les logs Laravel.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setSnackbarOpen(true);
      setDebugInfo(`❌ Erreur: ${errorMessage}`);
    } finally {
      setChargement(false);
      setInitialLoad(false);
      console.log('Chargement terminé');
    }
  };

  // Fonction pour générer le PDF via le backend
  const genererPDF = async () => {
    console.log('Génération PDF journal caisse...');
    
    if (!donneesJournal || donneesJournal.totalGeneral === 0) {
      console.error('Aucune donnée à exporter');
      setError('Aucune donnée à exporter');
      setSnackbarOpen(true);
      return;
    }
    
    if (!backendAccessible) {
      console.error('Backend non accessible');
      setError('Le backend n\'est pas accessible. Impossible de générer le PDF.');
      setSnackbarOpen(true);
      return;
    }
    
    if (filtres.caisse_id === 'all') {
      setError('Veuillez sélectionner une caisse spécifique pour exporter le journal.');
      setSnackbarOpen(true);
      return;
    }
    
    if (filtres.code_agence === 'all') {
      setError('Veuillez sélectionner une agence pour exporter le journal.');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      setChargementPDF(true);
      setError(null);
      setDebugInfo('Génération du PDF journal caisse en cours...');
      
      console.log('Tentative d\'export PDF avec filtres:', {
        ...filtres,
        dateDebut: format(filtres.dateDebut, 'yyyy-MM-dd'),
        dateFin: format(filtres.dateFin, 'yyyy-MM-dd')
      });
      
      await journalCaisseService.exporterJournalPDF(filtres);
      console.log('✅ Export PDF réussi');
      setDebugInfo('✅ PDF généré avec succès');
      
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'export PDF journal caisse:', error);
      let errorMessage = 'Erreur lors de la génération du PDF';
      
      if (error.message) {
        errorMessage = error.message;
        
        if (error.message.includes('Endpoint PDF non trouvé')) {
          errorMessage += '\nVérifiez que la route /caisse/journal/export-pdf existe dans le backend.';
        }
      }
      
      setError(errorMessage);
      setSnackbarOpen(true);
      setDebugInfo(`❌ Erreur PDF: ${errorMessage}`);
    } finally {
      setChargementPDF(false);
    }
  };

  // Gestionnaires d'événements
  const handleDateDebutChange = (date: Date | null) => {
    console.log('Date début changée:', date);
    if (date) {
      setFiltres(prev => ({ ...prev, dateDebut: date }));
    }
  };

  const handleDateFinChange = (date: Date | null) => {
    console.log('Date fin changée:', date);
    if (date) {
      setFiltres(prev => ({ ...prev, dateFin: date }));
    }
  };

  const handleAgenceChange = (event: any) => {
    const agenceCode = event.target.value;
    console.log('Agence changée:', agenceCode);
    
    setFiltres(prev => ({ 
      ...prev, 
      code_agence: agenceCode,
    }));
  };

  const handleCaisseChange = (event: any) => {
    const caisseId = event.target.value;
    console.log('Caisse changée:', caisseId);
    setFiltres(prev => ({ ...prev, caisse_id: caisseId }));
  };

  const handleSnackbarClose = () => {
    console.log('Snackbar fermé');
    setSnackbarOpen(false);
  };

  // Obtenir le label de l'agence sélectionnée
  const getAgenceLabel = (): string => {
    if (filtres.code_agence === 'all') {
      return 'TOUTES LES AGENCES';
    }
    
    const selectedAgence = agences.find(a => a.code === filtres.code_agence);
    return selectedAgence ? selectedAgence.name : `AGENCE ${filtres.code_agence}`;
  };

  // Obtenir le label de la caisse sélectionnée
  const getCaisseLabel = (): string => {
    if (filtres.caisse_id === 'all') {
      return 'TOUTES LES CAISSES';
    }
    
    const selectedCaisse = caisses.find(c => c.id.toString() === filtres.caisse_id);
    return selectedCaisse ? `${selectedCaisse.libelle} (${selectedCaisse.code_caisse})` : `CAISSE ${filtres.caisse_id}`;
  };

  // Fonction pour tester à nouveau la connexion au backend
  const retesterConnexion = async () => {
    console.log('Retest de la connexion journal caisse...');
    setChargement(true);
    setDebugInfo('Test de connexion en cours...');
    
    try {
      const accessible = await journalCaisseService.testBackend();
      setBackendAccessible(accessible);
      console.log('Backend accessible:', accessible);
      
      if (accessible) {
        setError(null);
        setDebugInfo('✅ Connexion rétablie');
        // Recharger les caisses si la connexion est rétablie
        await chargerCaisses();
      } else {
        setError('Le backend Laravel n\'est toujours pas accessible.');
        setSnackbarOpen(true);
        setDebugInfo('❌ Backend toujours inaccessible');
      }
    } catch (error) {
      console.error('❌ Erreur test backend:', error);
      setBackendAccessible(false);
      setError('Erreur lors de la connexion au backend.');
      setSnackbarOpen(true);
      setDebugInfo('❌ Échec du test de connexion');
    } finally {
      setChargement(false);
    }
  };

  // Couleur du solde selon le signe
  const getSoldeColor = (montant: number): string => {
    return montant < 0 ? '#f44336' : '#4caf50';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
        {/* SIDEBAR */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* CONTENU PRINCIPAL */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            width: `calc(100% - ${sidebarOpen ? '280px' : '80px'})`,
            transition: 'width 0.3s ease',
            minHeight: '100vh',
            backgroundColor: '#f5f7fa'
          }}
        >
          {/* TOPBAR */}
          <TopBar sidebarOpen={sidebarOpen} />

          {/* ZONE DE TRAVAIL */}
          <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
            <Container maxWidth="xl" sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: 3 }}>
              
              {/* En-tête principal */}
              <Box sx={{ 
                mb: 4, 
                p: 4,
                textAlign: 'center',
                background: backendAccessible ? blueGradient.primary : blueGradient.error,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                color: 'white'
              }}>
                <Typography variant="h5" component="h5" gutterBottom sx={{ 
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  Journal des Opérations de Caisse
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {backendAccessible 
                    ? 'Consultez et exportez les journaux des opérations de caisse' 
                    : '⚠️ Backend non accessible'}
                </Typography>
                
                {!backendAccessible && (
                  <Button
                    variant="contained"
                    onClick={retesterConnexion}
                    sx={{
                      mt: 2,
                      background: 'white',
                      color: blueGradient.error,
                      fontWeight: 'bold',
                      '&:hover': {
                        background: '#e3f2fd'
                      }
                    }}
                  >
                    Tester la connexion
                  </Button>
                )}
              </Box>

              {/* Section Paramètres */}
              <Paper elevation={6} sx={{ 
                p: 3, 
                mb: 4,
                border: 'none',
                borderRadius: 3,
                background: 'white',
                boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{
                    mr: 2,
                    p: 1.5,
                    background: blueGradient.light,
                    borderRadius: 2,
                    color: 'white'
                  }}>
                    <FilterAltIcon fontSize="large" />
                  </Box>
                  <Typography variant="h5" component="h2" sx={{ 
                    fontWeight: 'bold',
                    background: blueGradient.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Filtres du Journal de Caisse
                  </Typography>
                </Box>
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                      label="Date début"
                      value={filtres.dateDebut}
                      onChange={handleDateDebutChange}
                      format="dd/MM/yyyy"
                      maxDate={filtres.dateFin}
                      disabled={!backendAccessible || chargementAgences}
                      slotProps={{
                        textField: { 
                          fullWidth: true,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#1976d2',
                                borderWidth: 2,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#1976d2',
                                borderWidth: 2,
                              }
                            }
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                      label="Date fin"
                      value={filtres.dateFin}
                      onChange={handleDateFinChange}
                      format="dd/MM/yyyy"
                      minDate={filtres.dateDebut}
                      maxDate={new Date()}
                      disabled={!backendAccessible || chargementAgences}
                      slotProps={{
                        textField: { 
                          fullWidth: true,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#1976d2',
                                borderWidth: 2,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#1976d2',
                                borderWidth: 2,
                              }
                            }
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel 
                        id="agence-label"
                        sx={{ 
                          color: '#1976d2',
                          fontWeight: 'bold'
                        }}
                      >
                        {chargementAgences ? 'Chargement...' : 'Agence'}
                      </InputLabel>
                      <Select
                        labelId="agence-label"
                        value={filtres.code_agence}
                        label={chargementAgences ? 'Chargement...' : 'Agence'}
                        onChange={handleAgenceChange}
                        disabled={!backendAccessible || chargementAgences}
                        sx={{
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha('#1976d2', 0.3),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2',
                            borderWidth: 2,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2',
                            borderWidth: 2,
                          },
                        }}
                        startAdornment={
                          chargementAgences ? (
                            <CircularProgress size={20} sx={{ mr: 1, color: '#1976d2' }} />
                          ) : (
                            <LocationCityIcon sx={{ mr: 1, color: '#1976d2' }} />
                          )
                        }
                      >
                        <MenuItem 
                          value="all"
                          sx={{ 
                            color: '#1976d2',
                            fontWeight: 'bold',
                            background: blueGradient.lighter,
                            mb: 1,
                            borderRadius: 1
                          }}
                        >
                          TOUTES LES AGENCES
                        </MenuItem>
                        
                        {errorAgences ? (
                          <MenuItem disabled>
                            <Typography color="error" variant="body2">
                              {errorAgences}
                            </Typography>
                          </MenuItem>
                        ) : (
                          agences.map((agence) => (
                            <MenuItem 
                              key={agence.id} 
                              value={agence.code}
                              sx={{ 
                                color: '#1976d2',
                                fontWeight: 'medium',
                                borderLeft: `4px solid ${agence.code === '001' ? '#1976d2' : agence.code === '002' ? '#2196f3' : '#42a5f5'}`,
                                mb: 0.5,
                                '&:hover': {
                                  background: alpha('#1976d2', 0.04),
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Box sx={{ 
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: '50%', 
                                  background: agence.code === '001' ? '#1976d2' : agence.code === '002' ? '#2196f3' : '#42a5f5',
                                  mr: 2 
                                }} />
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body1" fontWeight="medium">
                                    {agence.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Code: {agence.code}
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel 
                        id="caisse-label"
                        sx={{ 
                          color: '#1976d2',
                          fontWeight: 'bold'
                        }}
                      >
                        {chargementCaisses ? 'Chargement...' : 'Caisse'}
                      </InputLabel>
                      <Select
                        labelId="caisse-label"
                        value={filtres.caisse_id}
                        label={chargementCaisses ? 'Chargement...' : 'Caisse'}
                        onChange={handleCaisseChange}
                        disabled={!backendAccessible || chargementCaisses}
                        sx={{
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha('#1976d2', 0.3),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2',
                            borderWidth: 2,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2',
                            borderWidth: 2,
                          },
                        }}
                        startAdornment={
                          chargementCaisses ? (
                            <CircularProgress size={20} sx={{ mr: 1, color: '#1976d2' }} />
                          ) : (
                            <PointOfSaleIcon sx={{ mr: 1, color: '#1976d2' }} />
                          )
                        }
                      >
                        <MenuItem 
                          value="all"
                          sx={{ 
                            color: '#1976d2',
                            fontWeight: 'bold',
                            background: blueGradient.lighter,
                            mb: 1,
                            borderRadius: 1
                          }}
                        >
                          TOUTES LES CAISSES
                        </MenuItem>
                        
                        {errorCaisses ? (
                          <MenuItem disabled>
                            <Typography color="error" variant="body2">
                              {errorCaisses}
                            </Typography>
                          </MenuItem>
                        ) : caisses.length === 0 ? (
                          <MenuItem disabled>
                            <Typography color="text.secondary" variant="body2">
                              Aucune caisse disponible
                            </Typography>
                          </MenuItem>
                        ) : (
                          caisses.map((caisse) => (
                            <MenuItem 
                              key={caisse.id} 
                              value={caisse.id.toString()}
                              sx={{ 
                                color: '#1976d2',
                                fontWeight: 'medium',
                                mb: 0.5,
                                '&:hover': {
                                  background: alpha('#1976d2', 0.04),
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Box sx={{ 
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: '50%', 
                                  background: caisse.est_active ? '#1976d2' : '#f44336',
                                  mr: 2 
                                }} />
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body1" fontWeight="medium">
                                    {caisse.libelle}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Code: {caisse.code_caisse} | 
                                    Solde: <span style={{ color: getSoldeColor(caisse.solde_actuel) }}>
                                      {formatSoldeAvecDevise(caisse.solde_actuel)}
                                    </span>
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                  <Box>
                    <Chip 
                      icon={<LocationCityIcon />}
                      label={getAgenceLabel()}
                      sx={{ 
                        background: blueGradient.primary,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        height: 40,
                        px: 2,
                        mr: 2,
                        '& .MuiChip-icon': {
                          color: 'white'
                        }
                      }}
                    />
                    <Chip 
                      icon={<PointOfSaleIcon />}
                      label={getCaisseLabel()}
                      sx={{ 
                        background: blueGradient.light,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        height: 40,
                        px: 2,
                        '& .MuiChip-icon': {
                          color: 'white'
                        }
                      }}
                    />
                  </Box>
                  
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      onClick={lancerRequete}
                      disabled={chargement || !backendAccessible || chargementAgences || 
                              filtres.caisse_id === 'all' || filtres.code_agence === 'all'}
                      startIcon={chargement ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                      sx={{
                        background: backendAccessible && !chargementAgences && 
                          filtres.caisse_id !== 'all' && filtres.code_agence !== 'all'
                          ? blueGradient.button : '#bdbdbd',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: backendAccessible && !chargementAgences && 
                          filtres.caisse_id !== 'all' && filtres.code_agence !== 'all'
                          ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                        '&:hover': backendAccessible && !chargementAgences && 
                          filtres.caisse_id !== 'all' && filtres.code_agence !== 'all' ? {
                          background: blueGradient.buttonHover,
                          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                          transform: 'translateY(-2px)'
                        } : {},
                        '&:disabled': {
                          background: '#bdbdbd',
                          boxShadow: 'none',
                          transform: 'none'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {chargement ? 'Chargement...' : 'Charger le journal'}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>

              {/* Section Tableau */}
              {donneesJournal && !chargement && donneesJournal.totalGeneral > 0 && (
                <Paper elevation={6} sx={{ 
                  p: 0, 
                  mb: 4,
                  border: 'none',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
                }}>
                  {/* En-tête du journal */}
                  <Box sx={{ 
                    p: 4,
                    background: blueGradient.header,
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h4" component="h3" gutterBottom sx={{ 
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      JOURNAL DES OPÉRATIONS DE CAISSE
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                      {donneesJournal.agence} - {donneesJournal.caisse}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                      Période : Du {donneesJournal.dateDebut} au {donneesJournal.dateFin}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mt: 3,
                      opacity: 0.9,
                      fontSize: '0.9rem'
                    }}>
                      <Typography variant="body2">
                        Solde d'ouverture : {formatMontantAvecDevise(donneesJournal.soldeOuverture)}
                      </Typography>
                      <Typography variant="body2">
                        Solde de clôture : {formatMontantAvecDevise(donneesJournal.soldeCloture)}
                      </Typography>
                      <Typography variant="body2">
                        Page 1 / 1
                      </Typography>
                    </Box>
                  </Box>

                  {/* Tableau principal */}
                  <Box sx={{ p: 3 }}>
                    {donneesJournal.sections.map((section, sectionIndex) => (
                      <Box key={sectionIndex} sx={{ mb: 4 }}>
                        {/* En-tête de section */}
                        <Box sx={{ 
                          p: 2.5, 
                          mb: 3,
                          background: blueGradient.light,
                          borderRadius: 2,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{
                              mr: 2,
                              p: 1,
                              background: 'rgba(255, 255, 255, 0.2)',
                              borderRadius: 1
                            }}>
                              <AttachMoneyIcon />
                            </Box>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 'bold',
                              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>
                              {section.sectionTitle}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body1">
                              Débit : {formatMontantAvecDevise(section.totalDebit)}
                            </Typography>
                            <Typography variant="body1">
                              Crédit : {formatMontantAvecDevise(section.totalCredit)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Tableau des entrées */}
                        <TableContainer sx={{ 
                          borderRadius: 2,
                          border: `1px solid ${alpha('#1976d2', 0.2)}`,
                          mb: 4,
                          overflow: 'hidden'
                        }}>
                          <Table size="medium">
                            {/* En-tête du tableau */}
                            <TableHead>
                              <TableRow sx={{ 
                                background: blueGradient.primary,
                                '& th': {
                                  color: 'black',
                                  fontWeight: 'bold',
                                  fontSize: '1rem',
                                  borderBottom: 'none',
                                  py: 2.5,
                                  textAlign: 'left',
                                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                  '&:first-of-type': {
                                    borderTopLeftRadius: '8px'
                                  },
                                  '&:last-of-type': {
                                    borderTopRightRadius: '8px'
                                  }
                                }
                              }}>
                                <TableCell>Date</TableCell>
                                <TableCell>Compte</TableCell>
                                <TableCell>Tiers</TableCell>
                                <TableCell>Libellé</TableCell>
                                <TableCell>Réf. Opération</TableCell>
                                <TableCell align="right">Débit (FCFA)</TableCell>
                                <TableCell align="right">Crédit (FCFA)</TableCell>
                                <TableCell>Type Versement</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {section.entries.map((entry, entryIndex) => (
                                <TableRow 
                                  key={entryIndex}
                                  hover
                                  sx={{ 
                                    '&:nth-of-type(even)': { 
                                      background: alpha('#1976d2', 0.03) 
                                    },
                                    '&:hover': { 
                                      background: alpha('#1976d2', 0.08),
                                      transition: 'all 0.2s ease'
                                    },
                                    borderBottom: `1px solid ${alpha('#1976d2', 0.1)}`
                                  }}
                                >
                                  <TableCell sx={{ 
                                    fontWeight: 'medium', 
                                    color: '#757575',
                                    fontSize: '0.95rem'
                                  }}>
                                    {entry.date_mouvement ? format(new Date(entry.date_mouvement), 'dd/MM/yyyy') : 'N/A'}
                                  </TableCell>
                                  <TableCell sx={{ 
                                    fontFamily: 'monospace',
                                    fontWeight: 'medium',
                                    color: '#1976d2'
                                  }}>
                                    {entry.numero_compte || 'N/A'}
                                  </TableCell>
                                  <TableCell sx={{ 
                                    fontWeight: 'medium',
                                    color: '#424242'
                                  }}>
                                    {entry.tiers_nom || 'N/A'}
                                  </TableCell>
                                  <TableCell sx={{ color: '#424242' }}>
                                    {entry.libelle_mouvement}
                                  </TableCell>
                                  <TableCell sx={{ 
                                    fontFamily: 'monospace',
                                    color: '#2196f3',
                                    fontSize: '0.9rem'
                                  }}>
                                    {entry.reference_operation || 'N/A'}
                                  </TableCell>
                                  <TableCell align="right" sx={{ 
                                    fontWeight: 'bold',
                                    color: '#f44336',
                                    fontSize: '1rem'
                                  }}>
                                    {entry.montant_debit > 0 
                                      ? formatMontantAvecDevise(entry.montant_debit)
                                      : '-'}
                                  </TableCell>
                                  <TableCell align="right" sx={{ 
                                    fontWeight: 'bold',
                                    color: '#4caf50',
                                    fontSize: '1rem'
                                  }}>
                                    {entry.montant_credit > 0 
                                      ? formatMontantAvecDevise(entry.montant_credit)
                                      : '-'}
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={entry.type_versement || 'AUTRE'}
                                      size="small"
                                      sx={{ 
                                        background: alpha(typeVersementColors[entry.type_versement || 'AUTRE'], 0.1),
                                        color: typeVersementColors[entry.type_versement || 'AUTRE'],
                                        fontWeight: 'bold',
                                        fontSize: '0.8rem',
                                        border: `1px solid ${alpha(typeVersementColors[entry.type_versement || 'AUTRE'], 0.3)}`,
                                        height: 28
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                            {/* Pied de section */}
                            <TableFooter>
                              <TableRow sx={{ 
                                background: alpha('#1976d2', 0.05),
                                '& td': {
                                  py: 2.5,
                                  borderTop: `2px solid ${alpha('#1976d2', 0.3)}`,
                                  fontSize: '1rem',
                                  fontWeight: 'bold'
                                }
                              }}>
                                <TableCell colSpan={5} sx={{ pl: 4, color: '#1976d2' }}>
                                  TOTAL {section.totalLabel} ({section.count} opération{section.count > 1 ? 's' : ''})
                                </TableCell>
                                <TableCell align="right" sx={{ 
                                  color: '#f44336',
                                  pr: 4
                                }}>
                                  {formatMontantAvecDevise(section.totalDebit)}
                                </TableCell>
                                <TableCell align="right" sx={{ 
                                  color: '#4caf50',
                                  pr: 4
                                }}>
                                  {formatMontantAvecDevise(section.totalCredit)}
                                </TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableFooter>
                          </Table>
                        </TableContainer>
                      </Box>
                    ))}
                    
                    {/* Total Général */}
                    <Box sx={{ 
                      p: 4,
                      mt: 3,
                      background: blueGradient.primary,
                      borderRadius: 3,
                      color: 'white',
                      textAlign: 'center',
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)'
                    }}>
                      <Typography variant="h4" component="div" sx={{ 
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        mb: 1
                      }}>
                        TOTAL GÉNÉRAL : {donneesJournal.totalGeneral} OPÉRATION{donneesJournal.totalGeneral > 1 ? 'S' : ''}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
                        <Box>
                          <Typography variant="h6">DÉBIT TOTAL</Typography>
                          <Typography variant="h5">
                            {formatMontantAvecDevise(donneesJournal.totalDebit)}
                          </Typography>
                        </Box>
                        <Box sx={{ borderLeft: '2px solid white', height: '60px' }}></Box>
                        <Box>
                          <Typography variant="h6">CRÉDIT TOTAL</Typography>
                          <Typography variant="h5">
                            {formatMontantAvecDevise(donneesJournal.totalCredit)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ 
                    p: 3, 
                    background: alpha('#1976d2', 0.03),
                    borderTop: `1px solid ${alpha('#1976d2', 0.1)}`,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 3
                  }}>
                    {/* Bouton Exporter PDF via backend */}
                    <Button
                      variant="contained"
                      onClick={genererPDF}
                      disabled={chargementPDF || !backendAccessible}
                      startIcon={chargementPDF ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
                      size="large"
                      sx={{
                        background: backendAccessible ? blueGradient.primary : '#bdbdbd',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        px: 5,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: backendAccessible ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                        '&:hover': backendAccessible ? {
                          background: blueGradient.buttonHover,
                          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                          transform: 'translateY(-2px)'
                        } : {},
                        '&:disabled': {
                          background: '#bdbdbd',
                          boxShadow: 'none',
                          transform: 'none'
                        },
                        transition: 'all 0.3s ease',
                        minWidth: 220
                      }}
                    >
                      <DownloadIcon sx={{ mr: 1 }} />
                      {chargementPDF ? 'Génération...' : 'Exporter en PDF'}
                    </Button>
                    
                    {/* Bouton Actualiser */}
                    <Button
                      variant="contained"
                      onClick={lancerRequete}
                      disabled={!backendAccessible}
                      startIcon={<RefreshIcon />}
                      size="large"
                      sx={{
                        background: backendAccessible ? blueGradient.button : '#bdbdbd',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        px: 5,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: backendAccessible ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                        '&:hover': backendAccessible ? {
                          background: blueGradient.buttonHover,
                          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                          transform: 'translateY(-2px)'
                        } : {},
                        transition: 'all 0.3s ease',
                        minWidth: 220
                      }}
                    >
                      Actualiser le journal
                    </Button>
                  </Box>
                </Paper>
              )}

              {/* État chargement */}
              {chargement && (
                <Paper elevation={6} sx={{ 
                  p: 8, 
                  textAlign: 'center',
                  border: 'none',
                  borderRadius: 3,
                  background: 'white',
                  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
                }}>
                  <CircularProgress 
                    size={80} 
                    thickness={4}
                    sx={{ 
                      mb: 3,
                      color: '#1976d2',
                      background: blueGradient.light,
                      borderRadius: '50%',
                      p: 1
                    }} 
                  />
                  <Typography variant="h5" gutterBottom sx={{ 
                    background: blueGradient.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold'
                  }}>
                    Chargement du journal de caisse...
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {debugInfo}
                  </Typography>
                </Paper>
              )}

              {/* Message initial */}
              {initialLoad && !chargement && !donneesJournal && backendAccessible && (
                <Paper elevation={6} sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  border: 'none',
                  borderRadius: 3,
                  background: 'white',
                  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
                }}>
                  <Box sx={{
                    width: 100,
                    height: 100,
                    background: blueGradient.primary,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)'
                  }}>
                    <InfoIcon sx={{ fontSize: 50, color: 'white' }} />
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ 
                    background: blueGradient.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    mb: 2
                  }}>
                    Prêt à consulter votre journal de caisse
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                    Sélectionnez une agence, une caisse et une période pour consulter le journal des opérations de caisse
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={lancerRequete}
                    startIcon={<PlayArrowIcon />}
                    disabled={!backendAccessible || chargementAgences || 
                            filtres.caisse_id === 'all' || filtres.code_agence === 'all'}
                    sx={{
                      background: backendAccessible && !chargementAgences && 
                        filtres.caisse_id !== 'all' && filtres.code_agence !== 'all'
                        ? blueGradient.button : '#bdbdbd',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      px: 5,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: backendAccessible && !chargementAgences && 
                        filtres.caisse_id !== 'all' && filtres.code_agence !== 'all'
                        ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                      '&:hover': backendAccessible && !chargementAgences && 
                        filtres.caisse_id !== 'all' && filtres.code_agence !== 'all' ? {
                        background: blueGradient.buttonHover,
                        boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                        transform: 'translateY(-2px)'
                      } : {},
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Charger le journal
                  </Button>
                </Paper>
              )}

              {/* Message backend non accessible */}
              {!backendAccessible && !chargement && (
                <Paper elevation={6} sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  border: 'none',
                  borderRadius: 3,
                  background: '#e3f2fd',
                  boxShadow: '0 8px 32px rgba(244, 67, 54, 0.1)',
                }}>
                  <Box sx={{
                    width: 100,
                    height: 100,
                    background: blueGradient.error,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 8px 24px rgba(244, 67, 54, 0.3)'
                  }}>
                    <InfoIcon sx={{ fontSize: 50, color: 'white' }} />
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ 
                    color: '#c62828',
                    fontWeight: 'bold',
                    mb: 2
                  }}>
                    Backend non accessible
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                    Le serveur Laravel ne répond pas. Veuillez vérifier que :
                  </Typography>
                  <Box sx={{ textAlign: 'left', maxWidth: 600, mx: 'auto', mb: 4 }}>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li>Le serveur Laravel est démarré (php artisan serve)</li>
                      <li>Les routes API sont définies dans routes/api.php</li>
                      <li>La route /caisse/journal existe</li>
                      <li>La route /caisse/journal/export-pdf existe</li>
                      <li>Le CORS est configuré pour autoriser votre domaine React</li>
                    </ul>
                  </Box>
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                      variant="contained"
                      onClick={retesterConnexion}
                      startIcon={<RefreshIcon />}
                      sx={{
                        background: blueGradient.error,
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: '#b71c1c'
                        }
                      }}
                    >
                      Réessayer la connexion
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => window.open('http://127.0.0.1:8000/api/caisse/journal', '_blank')}
                      sx={{
                        borderColor: blueGradient.error,
                        color: blueGradient.error,
                        fontWeight: 'bold',
                        '&:hover': {
                          borderColor: '#b71c1c',
                          background: 'rgba(244, 67, 54, 0.04)'
                        }
                      }}
                    >
                      Tester l'API journal caisse
                    </Button>
                  </Stack>
                </Paper>
              )}

              {/* Message aucune donnée */}
              {donneesJournal && !chargement && donneesJournal.totalGeneral === 0 && backendAccessible && (
                <Paper elevation={6} sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  border: 'none',
                  borderRadius: 3,
                  background: 'white',
                  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
                }}>
                  <Box sx={{
                    width: 100,
                    height: 100,
                    background: '#f5f5f5',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    border: '2px dashed #bdbdbd'
                  }}>
                    <InfoIcon sx={{ fontSize: 50, color: '#757575' }} />
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ 
                    color: '#757575',
                    fontWeight: 'bold',
                    mb: 2
                  }}>
                    Aucune opération trouvée
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                    Aucune opération de caisse ne correspond à vos critères de recherche.
                    Essayez de modifier les dates, l'agence ou la caisse sélectionnée.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setFiltres({
                        dateDebut: new Date(new Date().setDate(new Date().getDate() - 30)),
                        dateFin: new Date(),
                        caisse_id: 'all',
                        code_agence: 'all',
                      });
                    }}
                    sx={{
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#1565c0',
                        background: alpha('#1976d2', 0.04),
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </Paper>
              )}

              {/* Snackbar pour les messages d'erreur */}
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Alert 
                  onClose={handleSnackbarClose} 
                  severity="error" 
                  sx={{ width: '100%' }}
                  variant="filled"
                >
                  {error}
                </Alert>
              </Snackbar>
            </Container>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default JournalCaissePage;