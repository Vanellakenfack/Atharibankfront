import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  CircularProgress,
  Alert,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Stack,
  Chip,
  alpha,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import Snackbar from '@mui/material/Snackbar';

// Import du Layout
import Layout from '../../components/layout/Layout';

// Import de ApiClient
import ApiClient from '../../services/api/ApiClient';

// Import des services
import agenceService from '../../services/agenceService';
import type { Agence } from '../../types/agenceTypes';

// Types pour les filtres de balance
interface BalanceFilterParams {
  dateDebut: Date;
  dateFin: Date;
  code_agence: string;
  type_balance: string;
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
  warning: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
  excel: 'linear-gradient(135deg, #1d6f42 0%, #2e7d32 100%)',
  excelHover: 'linear-gradient(135deg, #155d32 0%, #1b5e20 100%)'
};

// Types de balance
type BalanceType = 'GENERALE' | 'AUXILIAIRE';

const BalancePage: React.FC = () => {
  // États
  const [filtres, setFiltres] = useState<BalanceFilterParams>({
    dateDebut: new Date(new Date().setDate(new Date().getDate() - 30)),
    dateFin: new Date(),
    code_agence: 'all',
    type_balance: 'GENERALE',
  });

  // État pour les agences
  const [agences, setAgences] = useState<Agence[]>([]);
  const [chargementAgences, setChargementAgences] = useState(true);
  const [errorAgences, setErrorAgences] = useState<string | null>(null);

  const [chargement, setChargement] = useState(false);
  const [chargementPDF, setChargementPDF] = useState(false);
  const [chargementExcel, setChargementExcel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [backendAccessible, setBackendAccessible] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Charger les agences au démarrage
  useEffect(() => {
    console.log('BalancePage - useEffect de chargement des agences');
    
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
        
        setDebugInfo('✅ Backend accessible');
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
        setDebugInfo(`✅ Utilisation de données fictives (${agencesFictives.length} agences)`);
      } finally {
        setChargementAgences(false);
        console.log('Chargement des agences terminé');
      }
    };
    
    chargerAgences();
  }, []);

  // Fonction pour charger les données de balance
  const chargerBalance = async () => {
    console.log('Chargement de la balance avec filtres:', filtres);
    
    if (!backendAccessible) {
      console.error('Backend non accessible');
      setError('Impossible de se connecter au backend. Vérifiez que le serveur Laravel est démarré.');
      setSnackbarOpen(true);
      return;
    }
    
    if (filtres.code_agence === 'all') {
      setError('Veuillez sélectionner une agence spécifique.');
      setSnackbarOpen(true);
      return;
    }
    
    setChargement(true);
    setError(null);
    setDebugInfo('Chargement des données de balance...');
    
    try {
      console.log('Appel à la route balance...');
      
      // Construire les paramètres de requête
      const params = {
        date_debut: format(filtres.dateDebut, 'yyyy-MM-dd'),
        date_fin: format(filtres.dateFin, 'yyyy-MM-dd'),
        agence_code: filtres.code_agence,
        type_balance: filtres.type_balance
      };
      
      console.log('Paramètres:', params);
      
      // Appeler la route appropriée selon le type de balance
      let endpoint = '/comptabilite/balance/auxiliaire';
      
      const response = await ApiClient.get(endpoint, { params });
      
      console.log('✅ Données de balance reçues:', response.data);
      setDebugInfo(`✅ Balance chargée avec succès`);
      
      // Afficher un message de succès
      setError(null);
      setSnackbarOpen(false);
      
      // Ici vous pourriez traiter les données reçues
      // Par exemple : setDonneesBalance(response.data);
      
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement de la balance:', error);
      let errorMessage = 'Erreur de connexion au serveur.';
      
      if (error.response) {
        console.error('Détails de la réponse erreur:', error.response);
        
        if (error.response.status === 404) {
          errorMessage = 'Endpoint balance non trouvé. Vérifiez que la route /comptabilite/balance/auxiliaire existe.';
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
      console.log('Chargement terminé');
    }
  };

  // Fonction pour générer le PDF de la balance
 const genererPDF = async () => {
  if (!backendAccessible) {
    setError('Le backend n\'est pas accessible.');
    setSnackbarOpen(true);
    return;
  }

  if (filtres.code_agence === 'all') {
    setError('Veuillez sélectionner une agence spécifique.');
    setSnackbarOpen(true);
    return;
  }

  try {
    setChargementPDF(true);
    setError(null);

    // DETERMINATION DE L'URL EN FONCTION DU TYPE
    // On s'aligne sur les routes Laravel : /auxiliaire/export-pdf ou /generale/export-pdf
    const endpoint = filtres.type_balance === 'GENERALE' 
      ? '/comptabilite/balance/generale/export-pdf' 
      : '/comptabilite/balance/auxiliaire/export-pdf';

    const response = await ApiClient.get(endpoint, {
      params: {
        date_debut: format(filtres.dateDebut, 'yyyy-MM-dd'),
        date_fin: format(filtres.dateFin, 'yyyy-MM-dd'),
        agence_id: filtres.code_agence // Utilisation de agence_id pour matcher le Controller Laravel
      },
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `balance_${filtres.type_balance.toLowerCase()}_${format(filtres.dateDebut, 'yyyy-MM-dd')}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setDebugInfo('✅ PDF généré avec succès');
  } catch (error: any) {
    console.error('Erreur PDF:', error);
    setError(error.response?.data?.message || 'Erreur lors de la génération du PDF');
    setSnackbarOpen(true);
  } finally {
    setChargementPDF(false);
  }
};


const genererExcel = async () => {
  if (!backendAccessible) {
    setError('Le backend n\'est pas accessible.');
    setSnackbarOpen(true);
    return;
  }

  if (filtres.code_agence === 'all') {
    setError('Veuillez sélectionner une agence spécifique.');
    setSnackbarOpen(true);
    return;
  }

  try {
    setChargementExcel(true);
    setError(null);

    // DETERMINATION DE L'URL EN FONCTION DU TYPE
    const endpoint = filtres.type_balance === 'GENERALE' 
      ? '/comptabilite/balance/generale/export-excel' 
      : '/comptabilite/balance/auxiliaire/export-excel';

    const response = await ApiClient.get(endpoint, {
      params: {
        date_debut: format(filtres.dateDebut, 'yyyy-MM-dd'),
        date_fin: format(filtres.dateFin, 'yyyy-MM-dd'),
        agence_id: filtres.code_agence // Match avec $request->agence_id du Controller
      },
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `balance_${filtres.type_balance.toLowerCase()}_${format(filtres.dateDebut, 'yyyy-MM-dd')}.xlsx`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setDebugInfo('✅ Excel généré avec succès');
  } catch (error: any) {
    console.error('Erreur Excel:', error);
    setError(error.response?.data?.message || 'Erreur lors de la génération de l\'Excel');
    setSnackbarOpen(true);
  } finally {
    setChargementExcel(false);
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
  const agenceId = event.target.value; // Ceci récupérera l'id car nous allons changer la "value" du MenuItem
  console.log('ID Agence sélectionné:', agenceId);
  
  setFiltres(prev => ({ 
    ...prev, 
    code_agence: agenceId, // On stocke l'ID ici (vous pouvez renommer la clé en agence_id pour plus de clarté)
  }));
};
  const handleTypeBalanceChange = (event: any) => {
    const typeBalance = event.target.value;
    console.log('Type de balance changé:', typeBalance);
    setFiltres(prev => ({ ...prev, type_balance: typeBalance }));
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

  // Fonction pour tester à nouveau la connexion au backend
  const retesterConnexion = async () => {
    console.log('Retest de la connexion balance...');
    setChargement(true);
    setDebugInfo('Test de connexion en cours...');
    
    try {
      // Test simple de connexion au backend
      const response = await ApiClient.get('/comptabilite/balance/auxiliaire');
      setBackendAccessible(true);
      setError(null);
      setDebugInfo('✅ Connexion rétablie');
      console.log('Backend accessible');
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Layout>
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
                Balance Comptable
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {backendAccessible 
                  ? 'Générez et exportez la balance comptable' 
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
                  Filtres de la Balance
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
                            value={agence.id}
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
                      id="type-balance-label"
                      sx={{ 
                        color: '#1976d2',
                        fontWeight: 'bold'
                      }}
                    >
                      Type de Balance
                    </InputLabel>
                    <Select
                      labelId="type-balance-label"
                      value={filtres.type_balance}
                      label="Type de Balance"
                      onChange={handleTypeBalanceChange}
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
                        <AccountBalanceIcon sx={{ mr: 1, color: '#1976d2' }} />
                      }
                    >
                      <MenuItem 
                        value="GENERALE"
                        sx={{ 
                          color: '#1976d2',
                          fontWeight: 'bold',
                          mb: 0.5,
                          '&:hover': {
                            background: alpha('#1976d2', 0.04),
                          }
                        }}
                      >
                        Balance Générale
                      </MenuItem>
                      <MenuItem 
                        value="AUXILIAIRE"
                        sx={{ 
                          color: '#1976d2',
                          fontWeight: 'bold',
                          '&:hover': {
                            background: alpha('#1976d2', 0.04),
                          }
                        }}
                      >
                        Balance Auxiliaire
                      </MenuItem>
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
                    icon={<AccountBalanceIcon />}
                    label={filtres.type_balance === 'GENERALE' ? 'Balance Générale' : 'Balance Auxiliaire'}
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
                
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="contained"
                    onClick={chargerBalance}
                    disabled={chargement || !backendAccessible || chargementAgences || 
                            filtres.code_agence === 'all'}
                    startIcon={chargement ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                    sx={{
                      background: backendAccessible && !chargementAgences && 
                        filtres.code_agence !== 'all'
                        ? blueGradient.button : '#bdbdbd',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: backendAccessible && !chargementAgences && 
                        filtres.code_agence !== 'all'
                        ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                      '&:hover': backendAccessible && !chargementAgences && 
                        filtres.code_agence !== 'all' ? {
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
                      minWidth: 180
                    }}
                  >
                    {chargement ? 'Chargement...' : 'Charger'}
                  </Button>
                  
                  {/* Bouton Exporter Excel */}
                  <Button
                    variant="contained"
                    onClick={genererExcel}
                    disabled={chargementExcel || !backendAccessible || 
                            filtres.code_agence === 'all'}
                    startIcon={chargementExcel ? <CircularProgress size={20} color="inherit" /> : <DescriptionIcon />}
                    sx={{
                      background: backendAccessible && !chargementExcel && 
                        filtres.code_agence !== 'all'
                        ? blueGradient.excel : '#bdbdbd',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: backendAccessible && !chargementExcel && 
                        filtres.code_agence !== 'all'
                        ? '0 4px 12px rgba(29, 111, 66, 0.3)' : 'none',
                      '&:hover': backendAccessible && !chargementExcel && 
                        filtres.code_agence !== 'all' ? {
                        background: blueGradient.excelHover,
                        boxShadow: '0 6px 20px rgba(29, 111, 66, 0.4)',
                        transform: 'translateY(-2px)'
                      } : {},
                      '&:disabled': {
                        background: '#bdbdbd',
                        boxShadow: 'none',
                        transform: 'none'
                      },
                      transition: 'all 0.3s ease',
                      minWidth: 180
                    }}
                  >
                    <DownloadIcon sx={{ mr: 1 }} />
                    {chargementExcel ? 'Génération...' : 'Export Excel'}
                  </Button>
                  
                  {/* Bouton Exporter PDF */}
                  <Button
                    variant="contained"
                    onClick={genererPDF}
                    disabled={chargementPDF || !backendAccessible || 
                            filtres.code_agence === 'all'}
                    startIcon={chargementPDF ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
                    sx={{
                      background: backendAccessible && !chargementPDF && 
                        filtres.code_agence !== 'all'
                        ? blueGradient.success : '#bdbdbd',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: backendAccessible && !chargementPDF && 
                        filtres.code_agence !== 'all'
                        ? '0 4px 12px rgba(46, 125, 50, 0.3)' : 'none',
                      '&:hover': backendAccessible && !chargementPDF && 
                        filtres.code_agence !== 'all' ? {
                        background: blueGradient.successHover,
                        boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)',
                        transform: 'translateY(-2px)'
                      } : {},
                      '&:disabled': {
                        background: '#bdbdbd',
                        boxShadow: 'none',
                        transform: 'none'
                      },
                      transition: 'all 0.3s ease',
                      minWidth: 180
                    }}
                  >
                    <DownloadIcon sx={{ mr: 1 }} />
                    {chargementPDF ? 'Génération...' : 'Export PDF'}
                  </Button>
                </Stack>
              </Stack>
            </Paper>

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
      </Layout>
    </LocalizationProvider>
  );
};

export default BalancePage;