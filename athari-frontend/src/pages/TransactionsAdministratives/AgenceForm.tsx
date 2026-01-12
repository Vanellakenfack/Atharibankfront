import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem,
  FormControl, InputLabel, Select, Alert, CircularProgress,
  Grid, Card, CardContent, Snackbar
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import agenceService from '../../services/agenceService';
import sessionService from '../../services/sessionService';

// Types
interface Agence {
  id: number | string;
  name: string;
  code: string;
}

interface AgenceState {
  isOpen: boolean;
  sessionId?: number;
  journeeId?: number;
  dateComptable?: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface ApiResponse {
  statut: 'success' | 'error';
  message: string;
  data?: any;
}

const AgenceForm: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAgences, setLoadingAgences] = useState<boolean>(true);
  const [checkingAgenceState, setCheckingAgenceState] = useState<boolean>(false);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [error, setError] = useState<string>('');
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const [agenceState, setAgenceState] = useState<AgenceState>({
    isOpen: false,
  });

  const [operation, setOperation] = useState<'OU' | 'FE'>('OU');
  const [guichetEstOuvert, setGuichetEstOuvert] = useState<boolean>(false);
  const [caisseEstOuverte, setCaisseEstOuverte] = useState<boolean>(false);

  // États du formulaire OUVERTURE
  const [formDataOuverture, setFormDataOuverture] = useState({
    agence_id: '',
    date_comptable: new Date(),
  });

  // États du formulaire FERMETURE
  const [formDataFermeture, setFormDataFermeture] = useState({
    session_agence_id: '',
    journee_id: '',
    agence_id: '',
    date_comptable: ''
  });

  // Charger les agences
  useEffect(() => {
    const fetchAgences = async () => {
      try {
        console.log('🔄 Chargement des agences...');
        setLoadingAgences(true);
        const data = await agenceService.getAgences();
        console.log('✅ Agences chargées:', data);
        setAgences(data);
        setError('');
      } catch (err: any) {
        console.error('❌ Erreur lors du chargement des agences:', err);
        setError('Impossible de charger la liste des agences');
      } finally {
        setLoadingAgences(false);
      }
    };

    fetchAgences();
  }, []);

  // Vérifier l'état de l'agence et des dépendances
  useEffect(() => {
    const checkAgenceState = async () => {
      try {
        setCheckingAgenceState(true);
        
        const storedAgenceId = localStorage.getItem('agence_id');
        const storedSessionId = localStorage.getItem('session_agence_id');
        const storedJourneeId = localStorage.getItem('journee_id');
        const storedDateComptable = localStorage.getItem('date_comptable');
        const storedGuichetSessionId = localStorage.getItem('guichet_session_id');
        const storedCaisseSessionId = localStorage.getItem('caisse_session_id');
        
        // Vérifier si un guichet est ouvert
        setGuichetEstOuvert(!!storedGuichetSessionId);
        
        // Vérifier si une caisse est ouverte
        setCaisseEstOuverte(!!storedCaisseSessionId);
        
        if (storedAgenceId && storedSessionId && storedJourneeId) {
          console.log('✅ Agence ouverte trouvée dans localStorage');
          console.log('📋 Détails:', {
            agence_id: storedAgenceId,
            session_agence_id: storedSessionId,
            journee_id: storedJourneeId,
            date_comptable: storedDateComptable,
            guichet_ouvert: !!storedGuichetSessionId,
            caisse_ouverte: !!storedCaisseSessionId
          });
          
          setAgenceState({
            isOpen: true,
            sessionId: parseInt(storedSessionId),
            journeeId: storedJourneeId ? parseInt(storedJourneeId) : undefined,
            dateComptable: storedDateComptable || undefined
          });
          
          setFormDataFermeture({
            session_agence_id: storedSessionId,
            journee_id: storedJourneeId,
            agence_id: storedAgenceId,
            date_comptable: storedDateComptable || ''
          });
          
          setFormDataOuverture(prev => ({
            ...prev,
            agence_id: storedAgenceId,
            date_comptable: storedDateComptable 
              ? new Date(storedDateComptable)
              : new Date()
          }));
          
          setOperation('FE');
        } else {
          console.log('❌ Aucune agence ouverte trouvée');
          setAgenceState({ isOpen: false });
          setOperation('OU');
        }
      } catch (err: any) {
        console.error('❌ Erreur vérification état agence:', err);
        setAgenceState({ isOpen: false });
        setOperation('OU');
      } finally {
        setCheckingAgenceState(false);
      }
    };

    checkAgenceState();
  }, []);

  const handleOperationChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value as 'OU' | 'FE';
    setOperation(value);
  };

  const handleOuvertureChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name === 'agence_id') {
      setFormDataOuverture(prev => ({ ...prev, [name]: value as string }));
    } else if (name) {
      setFormDataOuverture(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormDataOuverture(prev => ({ ...prev, date_comptable: date }));
    }
  };

  const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'success') => {
    console.log(`📢 Snackbar ${severity}: ${message}`);
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenAgence = async (): Promise<ApiResponse> => {
    console.log('🚀 Ouverture de l\'agence...');
    
    if (!formDataOuverture.agence_id) {
      throw new Error('Veuillez sélectionner une agence');
    }

    if (!formDataOuverture.date_comptable) {
      throw new Error('Veuillez sélectionner une date comptable');
    }

    try {
      console.log('📞 Appel API ouverture agence...');
      
      const formattedDate = format(formDataOuverture.date_comptable, 'yyyy-MM-dd');
      console.log('📅 Date formatée pour MySQL:', formattedDate);
      
      const response = await sessionService.ouvrirAgence(
        formDataOuverture.agence_id,
        formattedDate
      );

      console.log('✅ Réponse API ouverture agence:', response);
      
      const responseData = response.data;
      
      return {
        statut: 'success',
        message: responseData?.message || 'Agence ouverte avec succès !',
        data: responseData?.data
      };
      
    } catch (err: any) {
      console.error('❌ Erreur lors de l\'ouverture de l\'agence:', err);
      
      if (err.response && err.response.status === 201) {
        console.log('⚠️ Hook a intercepté un statut 201 (succès)');
        
        const errorData = err.response.data;
        if (errorData && errorData.statut === 'success') {
          console.log('✅ Correction: c\'était un succès');
          return {
            statut: 'success',
            message: errorData.message || 'Agence ouverte avec succès !',
            data: errorData.data
          };
        }
      }
      
      throw err;
    }
  };

  const handleCloseAgence = async (): Promise<ApiResponse> => {
    if (!formDataFermeture.session_agence_id || !formDataFermeture.journee_id) {
      throw new Error('Informations de session manquantes');
    }

    try {
      console.log('📞 Appel API fermeture agence...');
      const response = await sessionService.fermerAgence(
        parseInt(formDataFermeture.session_agence_id),
        parseInt(formDataFermeture.journee_id)
      );

      console.log('✅ Réponse API fermeture agence:', response);
      
      const responseData = response.data;
      
      return {
        statut: 'success',
        message: responseData?.message || 'Agence fermée avec succès !',
        data: responseData
      };
      
    } catch (err: any) {
      console.error('❌ Erreur lors de la fermeture de l\'agence:', err);
      
      // Afficher le détail de l'erreur
      if (err.response?.data) {
        console.error('📋 Détails erreur backend:', {
          status: err.response.status,
          data: err.response.data,
          errors: err.response.data?.errors
        });
      }
      
      throw err;
    }
  };

  const processOuvertureResponse = (responseData: ApiResponse) => {
    console.log('🔄 Traitement réponse ouverture:', responseData);
    
    if (!responseData) {
      console.error('❌ Réponse API vide');
      showSnackbar('Réponse du serveur vide ou invalide', 'error');
      return false;
    }
    
    const isSuccess = responseData.statut === 'success';
    const message = responseData.message || '';
    
    console.log(`📊 Analyse réponse: statut=${responseData.statut}, message="${message}"`);
    
    if (!isSuccess) {
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('erreur') || 
          lowerMessage.includes('error') || 
          lowerMessage.includes('échec') || 
          lowerMessage.includes('failed')) {
        console.log('❌ Message d\'erreur détecté:', message);
        showSnackbar(message || 'Erreur lors de l\'ouverture', 'error');
        return false;
      } else {
        console.log('⚠️ Statut "error" mais message ne semble pas être une erreur:', message);
        showSnackbar(message || 'Avertissement lors de l\'opération', 'warning');
        return false;
      }
    }
    
    console.log('✅ Ouverture réussie:', message);
    showSnackbar(message || 'Agence ouverte avec succès !', 'success');
    
    if (responseData.data) {
      const sessionAgenceId = responseData.data.session_agence_id;
      const journeeId = responseData.data.journee_id;
      const dateComptable = responseData.data.date_comptable;
      
      console.log('💾 Stockage des IDs dans localStorage:');
      console.log('- session_agence_id:', sessionAgenceId);
      console.log('- journee_id:', journeeId);
      console.log('- date_comptable:', dateComptable);
      console.log('- agence_id:', formDataOuverture.agence_id);
      
      localStorage.setItem('session_agence_id', sessionAgenceId?.toString() || '');
      localStorage.setItem('journee_id', journeeId?.toString() || '');
      localStorage.setItem('date_comptable', dateComptable || '');
      localStorage.setItem('agence_id', formDataOuverture.agence_id.toString());
      
      setAgenceState({
        isOpen: true,
        sessionId: sessionAgenceId,
        journeeId: journeeId,
        dateComptable: dateComptable
      });
      
      setFormDataFermeture({
        session_agence_id: sessionAgenceId?.toString() || '',
        journee_id: journeeId?.toString() || '',
        agence_id: formDataOuverture.agence_id.toString(),
        date_comptable: dateComptable || ''
      });
      
      setOperation('FE');
    }

    console.log('⏳ Redirection vers guichet dans 2 secondes...');
    setTimeout(() => {
      console.log('➡️ Redirection vers /guichet/form');
      navigate('/guichet/form');
    }, 2000);

    return true;
  };

  const processFermetureResponse = (responseData: ApiResponse) => {
    console.log('🔄 Traitement réponse fermeture:', responseData);
    
    if (!responseData) {
      console.error('❌ Réponse API vide');
      showSnackbar('Réponse du serveur vide ou invalide', 'error');
      return false;
    }
    
    const isSuccess = responseData.statut === 'success';
    const message = responseData.message || '';
    
    console.log(`📊 Analyse réponse: statut=${responseData.statut}, message="${message}"`);
    
    if (!isSuccess) {
      // Essayez d'extraire un message d'erreur plus détaillé
      let errorMessage = message;
      
      if (message.includes('422')) {
        errorMessage = 'Erreur de validation. Vérifiez que la session est valide et que tous les guichets sont fermés.';
      }
      
      console.log('❌ Message d\'erreur:', errorMessage);
      showSnackbar(errorMessage || 'Erreur lors de la fermeture', 'error');
      return false;
    }
    
    console.log('✅ Fermeture réussie:', message);
    showSnackbar(message || 'Agence fermée avec succès !', 'success');
    
    setAgenceState({ isOpen: false });
    
    // Nettoyer TOUTES les données du localStorage
    localStorage.clear();
    
    setOperation('OU');
    
    setFormDataOuverture({
      agence_id: '',
      date_comptable: new Date(),
    });
    
    setGuichetEstOuvert(false);
    setCaisseEstOuverte(false);
    
    return true;
  };

  const handleSubmitOuverture = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formDataOuverture.agence_id) {
      showSnackbar('Veuillez sélectionner une agence', 'error');
      return;
    }

    if (!formDataOuverture.date_comptable) {
      showSnackbar('Veuillez sélectionner une date comptable', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const responseData = await handleOpenAgence();
      processOuvertureResponse(responseData);
    } catch (err: any) {
      console.error('❌ Erreur lors de l\'ouverture de l\'agence:', err);
      showSnackbar(err.message || 'Une erreur est survenue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFermeture = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agenceState.sessionId || !agenceState.journeeId) {
      showSnackbar('Informations de session manquantes', 'error');
      return;
    }

    // Vérifier si un guichet est encore ouvert
    if (guichetEstOuvert) {
      const confirmClose = window.confirm(
        '⚠️ Un ou plusieurs guichets sont encore ouverts. Si vous fermez l\'agence, les guichets seront automatiquement fermés. Continuer ?'
      );
      
      if (!confirmClose) {
        return;
      }
      
      // Avertir l'utilisateur
      showSnackbar('Fermez d\'abord tous les guichets avant de fermer l\'agence', 'warning');
      navigate('/guichet/form');
      return;
    }

    // Vérifier si une caisse est encore ouverte
    if (caisseEstOuverte) {
      const confirmClose = window.confirm(
        '⚠️ Une ou plusieurs caisses sont encore ouvertes. Si vous fermez l\'agence, les caisses seront automatiquement fermées. Continuer ?'
      );
      
      if (!confirmClose) {
        return;
      }
      
      showSnackbar('Fermez d\'abord toutes les caisses avant de fermer l\'agence', 'warning');
      navigate('/caisse/form');
      return;
    }

    setLoading(true);
    
    try {
      const responseData = await handleCloseAgence();
      processFermetureResponse(responseData);
    } catch (err: any) {
      console.error('❌ Erreur lors de la fermeture de l\'agence:', err);
      
      // Message d'erreur amélioré
      let errorMessage = 'Erreur lors de la fermeture';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('❌ Annulation, retour à l\'accueil');
    navigate('/');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getButtonText = () => {
    if (loading) return '';
    return operation === 'OU' ? 'Ouvrir l\'Agence' : 'Fermer l\'Agence';
  };

  const isButtonDisabled = () => {
    if (loading) return true;
    
    if (operation === 'OU') {
      if (!formDataOuverture.agence_id) return true;
      if (!formDataOuverture.date_comptable) return true;
    } else if (operation === 'FE') {
      if (!formDataFermeture.session_agence_id) return true;
      if (!formDataFermeture.journee_id) return true;
    }
    
    return false;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: `calc(100% - ${sidebarOpen ? '260px' : '80px'})`,
          transition: 'width 0.3s ease'
        }}
      >
        <TopBar sidebarOpen={sidebarOpen} />

        <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              {operation === 'OU' ? 'Ouverture de l\'Agence' : 'Fermeture de l\'Agence'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              {operation === 'OU' 
                ? 'Étape 1 & 2 : Ouverture de la Journée et de l\'Agence' 
                : 'Étape finale : Fermeture de la Journée et de l\'Agence (TFJ)'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Card sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <Grid container spacing={3}>
                  {/* Sélection Opération */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" required>
                      <InputLabel>Opération *</InputLabel>
                      <Select
                        value={operation}
                        onChange={handleOperationChange}
                        label="Opération *"
                        required
                      >
                        <MenuItem value="OU">Ouverture (OU)</MenuItem>
                        <MenuItem value="FE">Fermeture (FE)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* État de la session */}
                  <Grid item xs={12}>
                    {agenceState.isOpen && operation === 'FE' ? (
                      <Alert severity="success">
                        <Typography variant="body2" fontWeight="bold">
                          ✅ Cette agence est OUVERTE
                        </Typography>
                        <Typography variant="body2">
                          Session ID: {agenceState.sessionId} | 
                          Journée ID: {agenceState.journeeId} | 
                          Date: {agenceState.dateComptable}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Vous pouvez maintenant fermer l'agence.
                        </Typography>
                      </Alert>
                    ) : operation === 'OU' ? (
                      <Alert severity="info">
                        <Typography variant="body2">
                          ℹ️ Sélectionnez une agence et une date pour ouvrir la session.
                        </Typography>
                      </Alert>
                    ) : null}
                  </Grid>

                  {/* Avertissements pour les dépendances ouvertes */}
                  {operation === 'FE' && (guichetEstOuvert || caisseEstOuverte) && (
                    <Grid item xs={12}>
                      <Alert severity="warning">
                        <Typography variant="body2" fontWeight="bold">
                          ⚠️ Dépendances ouvertes détectées
                        </Typography>
                        {guichetEstOuvert && (
                          <Typography variant="body2">
                            • Guichet ouvert: {localStorage.getItem('code_guichet') || 'Oui'}
                          </Typography>
                        )}
                        {caisseEstOuverte && (
                          <Typography variant="body2">
                            • Caisse ouverte: {localStorage.getItem('code_caisse') || 'Oui'}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Il est recommandé de fermer les dépendances avant de fermer l'agence.
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          {guichetEstOuvert && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate('/guichet/form')}
                            >
                              Fermer le guichet
                            </Button>
                          )}
                          {caisseEstOuverte && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate('/caisse/form')}
                            >
                              Fermer la caisse
                            </Button>
                          )}
                        </Box>
                      </Alert>
                    </Grid>
                  )}

                  {/* FORMULAIRE OUVERTURE */}
                  {operation === 'OU' ? (
                    <form onSubmit={handleSubmitOuverture} style={{ width: '100%' }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <FormControl sx={{ minWidth: 200}} size="small" required>
                            <InputLabel>Agence *</InputLabel>
                            <Select
                              name="agence_id"
                              value={formDataOuverture.agence_id}
                              onChange={handleOuvertureChange}
                              label="Agence *"
                              required
                            >
                              <MenuItem value=""><em>Sélectionner une agence</em></MenuItem>
                              {agences.map((agence) => (
                                <MenuItem key={agence.id} value={agence.id}>
                                  {agence.name} ({agence.code})
                                </MenuItem>
                              ))}
                            </Select>
                            {loadingAgences && (
                              <CircularProgress size={20} sx={{ position: 'absolute', right: 40, top: '50%' }} />
                            )}
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <DatePicker
                            label="Date comptable *"
                            value={formDataOuverture.date_comptable}
                            onChange={handleDateChange}
                            slotProps={{ 
                              textField: { 
                                size: 'small', 
                                fullWidth: true, 
                                required: true
                              } 
                            }}
                            format="dd/MM/yyyy"
                          />
                        </Grid>
                      </Grid>
                    </form>
                  ) : (
                    /* FORMULAIRE FERMETURE */
                    <form onSubmit={handleSubmitFermeture} style={{ width: '100%' }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Agence ID"
                            value={formDataFermeture.agence_id || 'Non disponible'}
                            disabled
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Session Agence ID"
                            value={formDataFermeture.session_agence_id || 'Non disponible'}
                            disabled
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Journée ID"
                            value={formDataFermeture.journee_id || 'Non disponible'}
                            disabled
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Date comptable"
                            value={formDataFermeture.date_comptable || 'Non disponible'}
                            disabled
                          />
                        </Grid>
                      </Grid>
                    </form>
                  )}

                  {/* Informations de session stockées */}
                  <Grid item xs={12}>
                    <Alert severity="info" icon={false}>
                      <Typography variant="body2" fontWeight="bold">
                        Informations stockées dans localStorage:
                      </Typography>
                      <Typography variant="body2" component="div" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '12px' }}>
                        session_agence_id: {localStorage.getItem('session_agence_id') || 'null'}<br/>
                        agence_id: {localStorage.getItem('agence_id') || 'null'}<br/>
                        journee_id: {localStorage.getItem('journee_id') || 'null'}<br/>
                        date_comptable: {localStorage.getItem('date_comptable') || 'null'}<br/>
                        guichet_session_id: {localStorage.getItem('guichet_session_id') || 'null'}<br/>
                        caisse_session_id: {localStorage.getItem('caisse_session_id') || 'null'}
                      </Typography>
                    </Alert>
                  </Grid>

                  {/* Boutons */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleCancel}
                        sx={{ 
                          borderRadius: '8px', 
                          px: 4, 
                          py: 1,
                          textTransform: 'none'
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isButtonDisabled()}
                        onClick={operation === 'OU' ? handleSubmitOuverture : handleSubmitFermeture}
                        sx={{
                          background: operation === 'OU' 
                            ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                            : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                          borderRadius: '8px',
                          px: 4,
                          py: 1,
                          textTransform: 'none'
                        }}
                      >
                        {loading ? <CircularProgress size={24} /> : getButtonText()}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AgenceForm;