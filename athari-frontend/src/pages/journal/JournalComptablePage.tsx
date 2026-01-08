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
import Snackbar from '@mui/material/Snackbar';

// Composants de mise en page
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';

// Import des services
import journalService from '../../services/api/journalService';
import agenceService from '../../services/agenceService';
import type { JournalEntryApi, JournalApiResponse, FilterParams } from '../../services/api/journalService';
import type { Agence } from '../../types/agenceTypes';

// Types internes
interface JournalEntry {
  devise: string;
  compte: string;
  intituleCompte: string;
  client: string;
  nomClient: string;
  dateOuverture: string;
  intituleTypeCompte: string;
  montant: string;
  journal: string;
  commissions?: string;
}

interface JournalSection {
  sectionTitle: string;
  totalLabel: string;
  entries: JournalEntry[];
  count: number;
}

interface JournalData {
  agence: string;
  dateDebut: string;
  dateFin: string;
  sections: JournalSection[];
  totalGeneral: number;
  totalMontant: number;
}

// Couleurs bleues pour les dégradés
const blueGradients = {
  primary: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
  dark: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
  light: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
  header: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
  button: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
  buttonHover: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
};

// Couleur verte pour le bouton exporter
const greenGradient = {
  primary: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
  hover: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
};

// Devises
const devises = [
  { value: 'all', label: 'Toutes les devises', code: 'ALL', symbol: '' },
  { value: 'xaf', label: 'FCFA (XAF)', code: 'XAF', symbol: 'FCFA' },
  { value: 'eur', label: 'Euro (EUR)', code: 'EUR', symbol: '€' },
  { value: 'usd', label: 'Dollar (USD)', code: 'USD', symbol: '$' },
];

// Couleurs pour les types de comptes
const typeCompteColors: Record<string, string> = {
  'Compte courant particulier': '#1976d2',
  'Compte courant association': '#2196f3',
  'Compte épargne': '#42a5f5',
  'Compte courant entreprise': '#64b5f6',
  'Compte courant standard': '#90caf9',
};

// Fonction pour générer un dégradé basé sur l'index
const generateAgenceGradient = (index: number): string => {
  const gradients = [
    'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
    'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)',
    'linear-gradient(135deg, #01579b 0%, #0288d1 100%)',
    'linear-gradient(135deg, #006064 0%, #0097a7 100%)',
    'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
    'linear-gradient(135deg, #311b92 0%, #4527a0 100%)',
    'linear-gradient(135deg, #004d40 0%, #00796b 100%)',
    'linear-gradient(135deg, #bf360c 0%, #d84315 100%)',
  ];
  return gradients[index % gradients.length];
};

// Fonction pour filtrer et transformer les données API
const transformApiData = (apiData: JournalApiResponse, filtres: FilterParams, agencesList: Agence[]): JournalData => {
  console.log('Transformation des données API:', {
    apiDataLength: apiData.donnees?.length || 0,
    filtres,
    agencesCount: agencesList.length
  });
  
  // Si pas de données, retourner une structure vide
  if (!apiData.donnees || apiData.donnees.length === 0) {
    console.log('Aucune donnée à transformer');
    // Trouver le nom de l'agence sélectionnée
    let agenceLabel = 'TOUTES LES AGENCES';
    if (filtres.agence !== 'all') {
      const selectedAgence = agencesList.find(a => a.code === filtres.agence);
      agenceLabel = selectedAgence ? selectedAgence.name : `AGENCE ${filtres.agence}`;
    }
    
    return {
      agence: agenceLabel,
      dateDebut: format(filtres.dateDebut, 'dd/MM/yyyy'),
      dateFin: format(filtres.dateFin, 'dd/MM/yyyy'),
      sections: [],
      totalGeneral: 0,
      totalMontant: 0
    };
  }

  console.log('Données à transformer:', apiData.donnees.length, 'entrées');
  
  // Grouper par type de compte
  const groupedData: Record<string, JournalEntryApi[]> = {};
  
  apiData.donnees.forEach((entry: JournalEntryApi) => {
    if (!groupedData[entry.type_compte]) {
      groupedData[entry.type_compte] = [];
    }
    groupedData[entry.type_compte].push(entry);
  });
  
  console.log('Données groupées par type de compte:', Object.keys(groupedData).length, 'types');
  
  // Créer les sections
  const sections: JournalSection[] = Object.entries(groupedData).map(([typeCompte, entries]) => {
    // Créer un code de compte basé sur le type de compte
    const accountCode = typeCompte === 'Compte courant particulier' ? '37126000' :
                       typeCompte === 'Compte courant association' ? '37127000' :
                       typeCompte === 'Compte épargne' ? '37225000' :
                       typeCompte === 'Compte courant entreprise' ? '37128000' : '37129000';
    
    // Transformer chaque entrée pour le format frontend
    const transformedEntries = entries.map(entry => {
      const deviseObj = devises.find(d => d.value === filtres.devise) || devises[1];
      
      return {
        devise: filtres.devise === 'all' ? 'MULTI' : deviseObj.code,
        compte: entry.numero_compte,
        intituleCompte: entry.type_compte,
        client: entry.numero_client,
        nomClient: entry.nom_client || `Client ${entry.numero_client}`,
        dateOuverture: entry.date_ouverture,
        intituleTypeCompte: entry.type_compte,
        montant: entry.montant_debit,
        journal: entry.journal || 'BANQUE',
        commissions: entry.intitule_mouvement.includes('Frais') || entry.intitule_mouvement.includes('Déduction') 
          ? entry.montant_debit 
          : '0'
      };
    });
    
    return {
      sectionTitle: `${accountCode}: ${typeCompte}`,
      totalLabel: typeCompte,
      entries: transformedEntries,
      count: transformedEntries.length
    };
  });
  
  // Trier les sections par ordre alphabétique
  sections.sort((a, b) => a.sectionTitle.localeCompare(b.sectionTitle));
  
  // Calculer le total général
  const totalGeneral = sections.reduce((total, section) => total + section.count, 0);
  const totalMontant = sections.reduce((total, section) => {
    return total + section.entries.reduce((sum, entry) => 
      sum + (parseFloat(entry.montant) || 0), 0
    );
  }, 0);
  
  // Déterminer le nom de l'agence
  let agenceLabel: string;
  if (filtres.agence === 'all') {
    agenceLabel = 'TOUTES LES AGENCES';
  } else {
    const selectedAgence = agencesList.find(a => a.code === filtres.agence);
    agenceLabel = selectedAgence ? selectedAgence.name : `AGENCE ${filtres.agence}`;
  }
  
  console.log('Transformation terminée:', {
    sectionsCount: sections.length,
    totalGeneral,
    totalMontant,
    agenceLabel
  });
  
  return {
    agence: agenceLabel,
    dateDebut: format(filtres.dateDebut, 'dd/MM/yyyy'),
    dateFin: format(filtres.dateFin, 'dd/MM/yyyy'),
    sections: sections,
    totalGeneral: totalGeneral,
    totalMontant: totalMontant
  };
};

const JournalComptablePage: React.FC = () => {
  const theme = useTheme();
  
  // État pour la barre latérale
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // États
  const [filtres, setFiltres] = useState<FilterParams>({
    dateDebut: new Date(new Date().setDate(new Date().getDate() - 30)),
    dateFin: new Date(),
    agence: 'all',
    devise: 'xaf',
  });

  // État pour les agences
  const [agences, setAgences] = useState<Agence[]>([]);
  const [chargementAgences, setChargementAgences] = useState(true);
  const [errorAgences, setErrorAgences] = useState<string | null>(null);

  const [donneesJournal, setDonneesJournal] = useState<JournalData | null>(null);
  const [chargement, setChargement] = useState(false);
  const [chargementPDF, setChargementPDF] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [donneesBrutes, setDonneesBrutes] = useState<JournalApiResponse | null>(null);
  const [backendAccessible, setBackendAccessible] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Charger les agences au démarrage
  useEffect(() => {
    console.log('JournalComptablePage - useEffect de chargement des agences');
    
    const chargerAgences = async () => {
      setChargementAgences(true);
      setErrorAgences(null);
      setDebugInfo('Début du chargement des agences...');
      
      try {
        console.log('Tentative de chargement des agences...');
        const agencesData = await agenceService.getAgences();
        console.log('✅ Agences chargées avec succès:', agencesData);
        setDebugInfo(`✅ ${agencesData.length} agences chargées`);
        setAgences(agencesData);
        
        // Tester si le backend est accessible
        console.log('Test de connexion au backend...');
        const accessible = await journalService.testBackend();
        setBackendAccessible(accessible);
        console.log('Backend accessible:', accessible);
        
        if (!accessible) {
          setError('Le backend Laravel n\'est pas accessible. Vérifiez que le serveur est démarré (php artisan serve).');
          setSnackbarOpen(true);
          setDebugInfo('❌ Backend non accessible');
        } else {
          setDebugInfo('✅ Backend accessible');
        }
      } catch (error: any) {
        console.error('❌ Erreur lors du chargement des agences:', error);
        console.error('Message d\'erreur:', error.message);
        console.error('Stack trace:', error.stack);
        
        setErrorAgences(error.message || 'Erreur lors du chargement des agences');
        setBackendAccessible(false);
        setError(`Impossible de charger les agences: ${error.message}. Vérifiez la connexion au serveur.`);
        setSnackbarOpen(true);
        setDebugInfo(`❌ Erreur: ${error.message}`);
        
        // Afficher les données fictives pour le débogage
        console.log('Utilisation de données fictives pour le débogage...');
        const agencesFictives = [
          { id: 1, code: '004', name: 'AGENCE 004', shortName: 'AG004', createdAt: '', updatedAt: '' },
          { id: 2, code: '005', name: 'AGENCE 005', shortName: 'AG005', createdAt: '', updatedAt: '' },
          { id: 3, code: '006', name: 'AGENCE 006', shortName: 'AG006', createdAt: '', updatedAt: '' },
        ];
        setAgences(agencesFictives);
        setDebugInfo(`✅ Utilisation de ${agencesFictives.length} agences fictives`);
      } finally {
        setChargementAgences(false);
        console.log('Chargement des agences terminé');
      }
    };
    
    chargerAgences();
  }, []);

  // Lancer la requête pour le journal
  const lancerRequete = async () => {
    console.log('Lancement de la requête avec filtres:', filtres);
    
    if (!backendAccessible) {
      console.error('Backend non accessible');
      setError('Impossible de se connecter au backend. Vérifiez que le serveur Laravel est démarré (php artisan serve).');
      setSnackbarOpen(true);
      return;
    }
    
    setChargement(true);
    setError(null);
    setDebugInfo('Chargement des données du journal...');
    
    try {
      console.log('Appel à journalService.getJournalEntries...');
      const apiData = await journalService.getJournalEntries(filtres);
      console.log('✅ Données du journal reçues:', apiData);
      setDonneesBrutes(apiData);
      setDebugInfo(`✅ ${apiData.donnees?.length || 0} entrées reçues`);
      
      if (apiData.statut === 'success') {
        const transformedData = transformApiData(apiData, filtres, agences);
        console.log('✅ Données transformées:', transformedData);
        setDonneesJournal(transformedData);
        
        if (transformedData.totalGeneral === 0) {
          console.log('Aucune opération trouvée');
          setError('Aucune opération trouvée pour les critères sélectionnés');
          setSnackbarOpen(true);
          setDebugInfo('⚠️ Aucune donnée trouvée');
        } else {
          setDebugInfo(`✅ ${transformedData.totalGeneral} comptes trouvés`);
        }
      } else {
        console.error('Erreur dans la réponse API:', apiData);
        setError('Erreur lors de la récupération des données');
        setSnackbarOpen(true);
        setDebugInfo('❌ Erreur dans la réponse API');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la requête:', error);
      let errorMessage = 'Erreur de connexion au serveur.';
      
      if (error.response) {
        console.error('Détails de la réponse erreur:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        if (error.response.status === 404) {
          errorMessage = 'Endpoint non trouvé. Vérifiez la configuration des routes.';
        } else if (error.response.status === 500) {
          errorMessage = 'Erreur serveur interne. Vérifiez les logs Laravel.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
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
    console.log('Génération PDF...');
    
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
    
    try {
      setChargementPDF(true);
      setError(null);
      setDebugInfo('Génération du PDF en cours...');
      
      console.log('Tentative d\'export PDF avec filtres:', {
        ...filtres,
        dateDebut: format(filtres.dateDebut, 'yyyy-MM-dd'),
        dateFin: format(filtres.dateFin, 'yyyy-MM-dd')
      });
      
      await journalService.exporterJournalPDF(filtres);
      console.log('✅ Export PDF réussi');
      setDebugInfo('✅ PDF généré avec succès');
      
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'export PDF:', error);
      let errorMessage = 'Erreur lors de la génération du PDF';
      
      if (error.message) {
        errorMessage = error.message;
        
        // Messages d'erreur plus explicites
        if (error.message.includes('Erreur serveur')) {
          errorMessage += '\nVérifiez les logs Laravel pour plus de détails.';
        } else if (error.message.includes('Endpoint PDF non trouvé')) {
          errorMessage += '\nVérifiez que la route /comptes/journal-pdf existe dans le backend.';
        }
      }
      
      setError(errorMessage);
      setSnackbarOpen(true);
      setDebugInfo(`❌ Erreur PDF: ${errorMessage}`);
    } finally {
      setChargementPDF(false);
    }
  };

  // Mettre à jour les données quand les filtres changent (si on a déjà des données brutes)
  useEffect(() => {
    if (donneesBrutes && !initialLoad) {
      console.log('Mise à jour des données avec nouveaux filtres:', filtres);
      const transformedData = transformApiData(donneesBrutes, filtres, agences);
      setDonneesJournal(transformedData);
      setDebugInfo(`Données filtrées: ${transformedData.totalGeneral} comptes`);
    }
  }, [filtres, donneesBrutes, initialLoad, agences]);

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
    console.log('Agence changée:', event.target.value);
    setFiltres(prev => ({ ...prev, agence: event.target.value }));
  };

  const handleDeviseChange = (event: any) => {
    console.log('Devise changée:', event.target.value);
    setFiltres(prev => ({ ...prev, devise: event.target.value }));
  };

  const handleSnackbarClose = () => {
    console.log('Snackbar fermé');
    setSnackbarOpen(false);
  };

  // Obtenir le dégradé de l'agence sélectionnée
  const getAgenceGradient = () => {
    if (filtres.agence === 'all') {
      return 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)';
    }
    
    const agenceIndex = agences.findIndex(a => a.code === filtres.agence);
    if (agenceIndex >= 0) {
      return generateAgenceGradient(agenceIndex);
    }
    
    return blueGradients.primary;
  };

  // Obtenir le label de l'agence sélectionnée
  const getAgenceLabel = (): string => {
    if (filtres.agence === 'all') {
      return 'TOUTES LES AGENCES';
    }
    
    const selectedAgence = agences.find(a => a.code === filtres.agence);
    return selectedAgence ? selectedAgence.name : `AGENCE ${filtres.agence}`;
  };

  // Récupérer le symbole de devise
  const getDeviseSymbol = () => {
    return devises.find(d => d.value === filtres.devise)?.symbol || '';
  };

  // Fonction pour tester à nouveau la connexion au backend
  const retesterConnexion = async () => {
    console.log('Retest de la connexion...');
    setChargement(true);
    setDebugInfo('Test de connexion en cours...');
    
    try {
      // Tester d'abord les agences
      console.log('Test de connexion aux agences...');
      const agencesData = await agenceService.getAgences();
      console.log('✅ Agences rechargées:', agencesData.length);
      setAgences(agencesData);
      setErrorAgences(null);
      
      // Tester ensuite le backend
      console.log('Test de connexion au backend...');
      const accessible = await journalService.testBackend();
      setBackendAccessible(accessible);
      console.log('Backend accessible:', accessible);
      
      if (accessible) {
        setError(null);
        setDebugInfo('✅ Connexion rétablie');
        await lancerRequete();
      } else {
        setError('Le backend Laravel n\'est toujours pas accessible. Vérifiez que le serveur est démarré (php artisan serve).');
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

  // Afficher les informations de débogage dans la console
  useEffect(() => {
    console.log('État actuel du composant:', {
      agencesCount: agences.length,
      chargementAgences,
      backendAccessible,
      donneesJournal: donneesJournal ? `${donneesJournal.totalGeneral} comptes` : 'null',
      filtres,
      debugInfo
    });
  }, [agences, chargementAgences, backendAccessible, donneesJournal, filtres, debugInfo]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
        {/* 1. SIDEBAR */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* 2. CONTENU PRINCIPAL */}
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
          {/* 3. TOPBAR */}
          <TopBar sidebarOpen={sidebarOpen} />

          {/* 4. ZONE DE TRAVAIL */}
          <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
            <Container maxWidth="xl" sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: 3 }}>
              
              {/* En-tête principal */}
              <Box sx={{ 
                mb: 4, 
                p: 4,
                textAlign: 'center',
                background: backendAccessible ? blueGradients.primary : '#f44336',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                color: 'white'
              }}>
                <Typography variant="h5" component="h5" gutterBottom sx={{ 
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  Journal d'Ouverture des Comptes
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {backendAccessible 
                    ? 'Consultez et exportez les journaux d\'ouverture de comptes' 
                    : '⚠️ Backend non accessible'}
                </Typography>
                
                {!backendAccessible && (
                  <Button
                    variant="contained"
                    onClick={retesterConnexion}
                    sx={{
                      mt: 2,
                      background: 'white',
                      color: '#f44336',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: '#ffebee'
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
                    background: blueGradients.light,
                    borderRadius: 2,
                    color: 'white'
                  }}>
                    <FilterAltIcon fontSize="large" />
                  </Box>
                  <Typography variant="h5" component="h2" sx={{ 
                    fontWeight: 'bold',
                    background: blueGradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Filtres de Recherche
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
                        value={filtres.agence}
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
                            background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
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
                          agences.map((agence, index) => (
                            <MenuItem 
                              key={agence.id} 
                              value={agence.code}
                              sx={{ 
                                color: '#1976d2',
                                fontWeight: 'medium',
                                borderLeft: `4px solid ${generateAgenceGradient(index)}`,
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
                                  background: generateAgenceGradient(index),
                                  mr: 2 
                                }} />
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body1" fontWeight="medium">
                                    {agence.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Code: {agence.code} | {agence.shortName}
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
                        id="devise-label"
                        sx={{ 
                          color: '#1976d2',
                          fontWeight: 'bold'
                        }}
                      >
                        Devise
                      </InputLabel>
                      <Select
                        labelId="devise-label"
                        value={filtres.devise}
                        label="Devise"
                        onChange={handleDeviseChange}
                        disabled={!backendAccessible}
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
                          <CurrencyExchangeIcon sx={{ mr: 1, color: '#1976d2' }} />
                        }
                      >
                        {devises.map((devise) => (
                          <MenuItem 
                            key={devise.value} 
                            value={devise.value}
                            sx={{ 
                              color: '#1976d2',
                              fontWeight: 'medium'
                            }}
                          >
                            {devise.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                  <Chip 
                    icon={<LocationCityIcon />}
                    label={getAgenceLabel()}
                    sx={{ 
                      background: getAgenceGradient(),
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
                  <Chip 
                    icon={<CurrencyExchangeIcon />}
                    label={`Devise : ${devises.find(d => d.value === filtres.devise)?.label}`}
                    sx={{ 
                      background: blueGradients.light,
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
                  
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      onClick={lancerRequete}
                      disabled={chargement || !backendAccessible || chargementAgences}
                      startIcon={chargement ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                      sx={{
                        background: backendAccessible && !chargementAgences ? blueGradients.button : '#bdbdbd',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: backendAccessible && !chargementAgences ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                        '&:hover': backendAccessible && !chargementAgences ? {
                          background: blueGradients.buttonHover,
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
                      {chargement ? 'Chargement...' : 'Charger les données'}
                    </Button>
                  </Stack>
                </Stack>
                
                {donneesJournal && !chargement && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    background: alpha('#1976d2', 0.08),
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    border: `1px solid ${alpha('#1976d2', 0.2)}`,
                    justifyContent: 'center'
                  }}>
                    <RefreshIcon sx={{ mr: 1, color: '#1976d2' }} />
                    <Typography variant="body2" color="text.secondary">
                      Les données sont filtrées localement selon vos critères
                    </Typography>
                  </Box>
                )}
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
                    background: blueGradients.header,
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h4" component="h3" gutterBottom sx={{ 
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      JOURNAL OUVERTURE DES COMPTES
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                      {donneesJournal.agence}
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
                        Édité le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}
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
                          background: blueGradients.light,
                          borderRadius: 2,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
                        }}>
                          <Box sx={{
                            mr: 2,
                            p: 1,
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: 1
                          }}>
                            <AccountBalanceIcon />
                          </Box>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 'bold',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}>
                            {section.sectionTitle}
                          </Typography>
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
                                background: blueGradients.primary,
                                '& th': {
                                  color: 'black',
                                  fontWeight: 'bold',
                                  fontSize: '1rem',
                                  borderBottom: 'none',
                                  py: 2.5,
                                  textAlign: 'center',
                                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                  '&:first-of-type': {
                                    borderTopLeftRadius: '8px'
                                  },
                                  '&:last-of-type': {
                                    borderTopRightRadius: '8px'
                                  }
                                }
                              }}>
                                <TableCell>Devise</TableCell>
                                <TableCell>Compte</TableCell>
                                <TableCell>Intitulé Compte</TableCell>
                                <TableCell>Client</TableCell>
                                <TableCell>Nom Client</TableCell>
                                <TableCell>Date ouverture</TableCell>
                                <TableCell>Type Compte</TableCell>
                                <TableCell align="right">Montant</TableCell>
                                <TableCell>Journal</TableCell>
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
                                    fontWeight: 'bold', 
                                    color: '#1976d2',
                                    fontSize: '0.95rem'
                                  }}>
                                    {entry.devise}
                                  </TableCell>
                                  <TableCell sx={{ 
                                    fontFamily: 'monospace',
                                    fontWeight: 'medium',
                                    color: '#1565c0'
                                  }}>
                                    {entry.compte}
                                  </TableCell>
                                  <TableCell sx={{ 
                                    fontWeight: 'medium',
                                    color: '#424242'
                                  }}>
                                    {entry.intituleCompte}
                                  </TableCell>
                                  <TableCell sx={{ 
                                    fontFamily: 'monospace',
                                    color: '#1976d2'
                                  }}>
                                    {entry.client}
                                  </TableCell>
                                  <TableCell sx={{ color: '#424242' }}>
                                    {entry.nomClient}
                                  </TableCell>
                                  <TableCell sx={{ 
                                    color: '#757575',
                                    fontStyle: 'italic'
                                  }}>
                                    {entry.dateOuverture}
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={entry.intituleTypeCompte}
                                      size="small"
                                      sx={{ 
                                        background: alpha(typeCompteColors[entry.intituleTypeCompte] || '#1976d2', 0.1),
                                        color: typeCompteColors[entry.intituleTypeCompte] || '#1976d2',
                                        fontWeight: 'bold',
                                        fontSize: '0.8rem',
                                        border: `1px solid ${alpha(typeCompteColors[entry.intituleTypeCompte] || '#1976d2', 0.3)}`,
                                        height: 28
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell align="right" sx={{ 
                                    fontWeight: 'bold',
                                    color: '#2e7d32',
                                    fontSize: '1rem'
                                  }}>
                                    {parseFloat(entry.montant).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {getDeviseSymbol()}
                                  </TableCell>
                                  <TableCell sx={{ 
                                    color: '#666',
                                    fontStyle: 'italic'
                                  }}>
                                    {entry.journal}
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
                                <TableCell colSpan={8} sx={{ pl: 4, color: '#1976d2' }}>
                                  {section.count} TOTAL {section.totalLabel}
                                </TableCell>
                                <TableCell align="right" sx={{ 
                                  color: '#2e7d32',
                                  pr: 4
                                }}>
                                  {section.entries.reduce((sum, entry) => 
                                    sum + (parseFloat(entry.montant) || 0), 0
                                  ).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {getDeviseSymbol()}
                                </TableCell>
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
                      background: greenGradient.primary,
                      borderRadius: 3,
                      color: 'white',
                      textAlign: 'center',
                      boxShadow: '0 6px 20px rgba(46, 125, 50, 0.3)'
                    }}>
                      <Typography variant="h4" component="div" sx={{ 
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        mb: 1
                      }}>
                        {donneesJournal.totalGeneral} COMPTES - TOTAL GÉNÉRAL
                      </Typography>
                      <Typography variant="h5" sx={{ 
                        opacity: 0.95,
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }}>
                        {donneesJournal.totalMontant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {getDeviseSymbol()}
                      </Typography>
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
                        background: backendAccessible ? greenGradient.primary : '#bdbdbd',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        px: 5,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: backendAccessible ? '0 4px 12px rgba(46, 125, 50, 0.3)' : 'none',
                        '&:hover': backendAccessible ? {
                          background: greenGradient.hover,
                          boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)',
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
                        background: backendAccessible ? blueGradients.button : '#bdbdbd',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        px: 5,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: backendAccessible ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                        '&:hover': backendAccessible ? {
                          background: blueGradients.buttonHover,
                          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                          transform: 'translateY(-2px)'
                        } : {},
                        transition: 'all 0.3s ease',
                        minWidth: 220
                      }}
                    >
                      Actualiser les données
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
                      background: blueGradients.light,
                      borderRadius: '50%',
                      p: 1
                    }} 
                  />
                  <Typography variant="h5" gutterBottom sx={{ 
                    background: blueGradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold'
                  }}>
                    Chargement des données en cours...
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
                    background: blueGradients.primary,
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
                    background: blueGradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    mb: 2
                  }}>
                    Prêt à consulter votre journal comptable
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                    Configurez vos filtres et cliquez sur "Charger les données" pour consulter le journal d'ouverture des comptes
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={lancerRequete}
                    startIcon={<PlayArrowIcon />}
                    disabled={!backendAccessible || chargementAgences}
                    sx={{
                      background: backendAccessible && !chargementAgences ? blueGradients.button : '#bdbdbd',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      px: 5,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: backendAccessible && !chargementAgences ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                      '&:hover': backendAccessible && !chargementAgences ? {
                        background: blueGradients.buttonHover,
                        boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                        transform: 'translateY(-2px)'
                      } : {},
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Charger les données
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
                  background: '#ffebee',
                  boxShadow: '0 8px 32px rgba(244, 67, 54, 0.1)',
                }}>
                  <Box sx={{
                    width: 100,
                    height: 100,
                    background: '#f44336',
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
                    color: '#d32f2f',
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
                      <li>Le serveur écoute sur le port 8000</li>
                      <li>L'URL de l'API est correctement configurée</li>
                      <li>Les routes API sont définies dans routes/api.php</li>
                      <li>Le CORS est configuré pour autoriser votre domaine React</li>
                    </ul>
                  </Box>
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                      variant="contained"
                      onClick={retesterConnexion}
                      startIcon={<RefreshIcon />}
                      sx={{
                        background: '#f44336',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: '#d32f2f'
                        }
                      }}
                    >
                      Réessayer la connexion
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => window.open('http://127.0.0.1:8000/api/agencies', '_blank')}
                      sx={{
                        borderColor: '#f44336',
                        color: '#f44336',
                        fontWeight: 'bold',
                        '&:hover': {
                          borderColor: '#d32f2f',
                          background: 'rgba(244, 67, 54, 0.04)'
                        }
                      }}
                    >
                      Tester l'API des agences
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
                    Aucune donnée trouvée
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                    Aucune opération d'ouverture de compte ne correspond à vos critères de recherche.
                    Essayez de modifier les dates ou l'agence sélectionnée.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setFiltres({
                      dateDebut: new Date(new Date().setDate(new Date().getDate() - 30)),
                      dateFin: new Date(),
                      agence: 'all',
                      devise: 'xaf',
                    })}
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
            </Container>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default JournalComptablePage;