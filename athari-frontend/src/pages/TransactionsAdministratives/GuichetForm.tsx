import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem,
  FormControl, InputLabel, Select, Grid, Card, CardContent,
  CircularProgress, Alert, Snackbar, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import sessionService from '../../services/sessionService';

// Types
interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface GuichetState {
  isOpen: boolean;
  sessionId?: number;
  codeGuichet?: string;
}

interface ApiResponse {
  statut: 'success' | 'error';
  message: string;
  data?: any;
}

const GuichetForm: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAgence, setLoadingAgence] = useState<boolean>(true);
  const [loadingGuichetState, setLoadingGuichetState] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  
  // États
  const [agenceSessionId, setAgenceSessionId] = useState<string>('');
  const [agenceEtat, setAgenceEtat] = useState<'OU' | 'FE'>('FE');
  const [guichetState, setGuichetState] = useState<GuichetState>({
    isOpen: false
  });
  const [operation, setOperation] = useState<'OU' | 'FE'>('OU');

  // États du formulaire OUVERTURE
  const [formDataOuverture, setFormDataOuverture] = useState({
    agence_session_id: '',
    code_guichet: '',
  });

  // États du formulaire FERMETURE
  const [formDataFermeture, setFormDataFermeture] = useState({
    guichet_session_id: '',
    code_guichet: '',
  });

  // Charger l'état de l'agence et du guichet depuis localStorage
  useEffect(() => {
    console.log('🔄 Initialisation GuichetForm...');
    
    const init = async () => {
      try {
        const sessionId = localStorage.getItem('session_agence_id');
        const agenceId = localStorage.getItem('agence_id');
        const guichetSessionId = localStorage.getItem('guichet_session_id');
        const codeGuichet = localStorage.getItem('code_guichet');
        
        console.log('📋 localStorage au démarrage GuichetForm:', {
          session_agence_id: sessionId,
          agence_id: agenceId,
          guichet_session_id: guichetSessionId,
          code_guichet: codeGuichet
        });
        
        if (sessionId) {
          console.log('✅ Session agence trouvée:', sessionId);
          setAgenceSessionId(sessionId);
          setAgenceEtat('OU');
          
          setFormDataOuverture(prev => ({
            ...prev,
            agence_session_id: sessionId
          }));
          
          // Si un guichet est déjà ouvert
          if (guichetSessionId && codeGuichet) {
            console.log('✅ Guichet déjà ouvert:', { guichetSessionId, codeGuichet });
            setGuichetState({
              isOpen: true,
              sessionId: parseInt(guichetSessionId),
              codeGuichet: codeGuichet
            });
            
            setFormDataFermeture({
              guichet_session_id: guichetSessionId,
              code_guichet: codeGuichet
            });
            
            setOperation('FE');
          } else {
            setOperation('OU');
          }
        } else {
          console.warn('⚠️ Aucune session agence trouvée');
          setAgenceEtat('FE');
        }

      } catch (error: any) {
        console.error('❌ Erreur initialisation:', error);
      } finally {
        setLoadingAgence(false);
      }
    };

    init();
  }, []);

  // Vérifier l'état du guichet quand on change le code
  useEffect(() => {
    const checkGuichetState = async () => {
      if (!formDataOuverture.code_guichet || !agenceSessionId) return;
      
      try {
        setLoadingGuichetState(true);
        
        const storedCode = localStorage.getItem('code_guichet');
        const storedSessionId = localStorage.getItem('guichet_session_id');
        
        if (storedCode === formDataOuverture.code_guichet && storedSessionId) {
          console.log('✅ Guichet déjà ouvert avec ce code');
          setGuichetState({
            isOpen: true,
            sessionId: parseInt(storedSessionId),
            codeGuichet: storedCode
          });
        } else {
          console.log('❌ Guichet non ouvert avec ce code');
          setGuichetState({ isOpen: false });
        }
        
      } catch (error: any) {
        console.error('❌ Erreur vérification état guichet:', error);
        setGuichetState({ isOpen: false });
      } finally {
        setLoadingGuichetState(false);
      }
    };

    const timeoutId = setTimeout(checkGuichetState, 500);
    return () => clearTimeout(timeoutId);
  }, [formDataOuverture.code_guichet, agenceSessionId]);

  const handleOperationChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value as 'OU' | 'FE';
    setOperation(value);
  };

  const handleOuvertureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'code_guichet') {
      const numValue = parseInt(value, 10);
      if ((isNaN(numValue) && value !== '') || (numValue < 1)) {
        return;
      }
      setFormDataOuverture(prev => ({ ...prev, [name]: value }));
    }
  };

  const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'success') => {
    console.log(`📢 Snackbar ${severity}: ${message}`);
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenGuichet = async (): Promise<ApiResponse> => {
    console.log('📞 Appel API ouverture guichet...');
    
    try {
      const response = await sessionService.ouvrirGuichet(
        agenceSessionId,
        parseInt(formDataOuverture.code_guichet)
      );

      console.log('✅ Réponse API ouverture guichet:', response);
      
      const responseData = response.data;
      
      return {
        statut: 'success',
        message: responseData?.message || 'Guichet ouvert avec succès !',
        data: responseData
      };
      
    } catch (err: any) {
      console.error('❌ Erreur ouverture guichet:', err);
      
      if (err.response && err.response.status === 201) {
        console.log('⚠️ Hook a intercepté un statut 201 (succès)');
        
        const errorData = err.response.data;
        if (errorData && errorData.statut === 'success') {
          console.log('✅ Correction: c\'était un succès');
          return {
            statut: 'success',
            message: errorData.message || 'Guichet ouvert avec succès !',
            data: errorData
          };
        }
      }
      
      throw err;
    }
  };

  const handleCloseGuichet = async (): Promise<ApiResponse> => {
    const guichetSessionId = formDataFermeture.guichet_session_id || localStorage.getItem('guichet_session_id');
    
    if (!guichetSessionId) {
      throw new Error('ID de session guichet manquant');
    }

    try {
      console.log('📞 Appel API fermeture guichet...');
      const response = await sessionService.fermerGuichet(guichetSessionId);
      
      console.log('✅ Réponse API fermeture guichet:', response);
      
      const responseData = response.data;
      
      return {
        statut: 'success',
        message: responseData?.message || 'Guichet fermé avec succès !',
        data: responseData
      };
      
    } catch (err: any) {
      console.error('❌ Erreur fermeture guichet:', err);
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
    showSnackbar(message || 'Guichet ouvert avec succès !', 'success');
    
    // Extraire le guichet_session_id
    const guichetSessionId = 
      responseData.data?.guichet_session_id || 
      responseData.data?.data?.guichet_session_id;
    
    if (guichetSessionId) {
      console.log('💾 Stockage guichet dans localStorage:', {
        guichet_session_id: guichetSessionId,
        code_guichet: formDataOuverture.code_guichet
      });
      
      localStorage.setItem('guichet_session_id', guichetSessionId.toString());
      localStorage.setItem('code_guichet', formDataOuverture.code_guichet);
      
      setGuichetState({
        isOpen: true,
        sessionId: guichetSessionId,
        codeGuichet: formDataOuverture.code_guichet
      });
      
      setFormDataFermeture({
        guichet_session_id: guichetSessionId.toString(),
        code_guichet: formDataOuverture.code_guichet
      });
      
      setOperation('FE');
      
      setTimeout(() => {
        navigate('/caisse/form');
      }, 2000);
    }
    
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
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('erreur') || 
          lowerMessage.includes('error') || 
          lowerMessage.includes('échec') || 
          lowerMessage.includes('failed')) {
        console.log('❌ Message d\'erreur détecté:', message);
        showSnackbar(message || 'Erreur lors de la fermeture', 'error');
        return false;
      } else {
        console.log('⚠️ Statut "error" mais message ne semble pas être une erreur:', message);
        showSnackbar(message || 'Avertissement lors de l\'opération', 'warning');
        return false;
      }
    }
    
    console.log('✅ Fermeture réussie:', message);
    showSnackbar(message || 'Guichet fermé avec succès !', 'success');
    
    setGuichetState({ isOpen: false });
    
    localStorage.removeItem('guichet_session_id');
    localStorage.removeItem('code_guichet');
    localStorage.removeItem('caisse_session_id');
    localStorage.removeItem('code_caisse');
    localStorage.removeItem('solde_caisse');
    
    setOperation('OU');
    
    setFormDataOuverture(prev => ({ 
      ...prev, 
      code_guichet: ''
    }));
    
    return true;
  };

  const handleSubmitOuverture = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Soumission ouverture guichet:', formDataOuverture);
    
    if (agenceEtat === 'FE') {
      showSnackbar('L\'agence est fermée. Ouvrez d\'abord l\'agence.', 'warning');
      return;
    }

    if (!agenceSessionId) {
      showSnackbar('Session agence manquante', 'error');
      return;
    }

    if (!formDataOuverture.code_guichet || isNaN(parseInt(formDataOuverture.code_guichet, 10))) {
      showSnackbar('Code guichet invalide', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const responseData = await handleOpenGuichet();
      processOuvertureResponse(responseData);
    } catch (err: any) {
      console.error('❌ Erreur lors de l\'ouverture:', err);
      showSnackbar(err.message || 'Erreur lors de l\'ouverture', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFermeture = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Soumission fermeture guichet:', formDataFermeture);
    
    if (!formDataFermeture.guichet_session_id) {
      showSnackbar('Session guichet manquante', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const responseData = await handleCloseGuichet();
      processFermetureResponse(responseData);
    } catch (err: any) {
      console.error('❌ Erreur lors de la fermeture:', err);
      showSnackbar(err.message || 'Erreur lors de la fermeture', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/agence/form');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getButtonText = () => {
    if (loading) return '';
    return operation === 'OU' ? 'Ouvrir le Guichet' : 'Fermer le Guichet';
  };

  const isButtonDisabled = () => {
    if (loading) return true;
    if (!agenceSessionId) return true;
    if (agenceEtat === 'FE') return true;
    
    if (operation === 'OU') {
      if (!formDataOuverture.code_guichet || isNaN(parseInt(formDataOuverture.code_guichet, 10))) return true;
    } else if (operation === 'FE') {
      if (!formDataFermeture.guichet_session_id) return true;
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
              {operation === 'OU' ? 'Ouverture du Guichet' : 'Fermeture du Guichet'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Étape 3 : Gérer l'ouverture ou la fermeture des guichets
            </Typography>
            
            {/* Indicateur d'état de l'agence */}
            <Box sx={{ mt: 2 }}>
              {loadingAgence ? (
                <Alert severity="info">Chargement...</Alert>
              ) : agenceEtat === 'FE' ? (
                <Alert severity="warning">
                  ⚠️ L'agence est FERMÉE. Ouvrez d'abord l'agence.
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate('/agence/form')}
                    sx={{ ml: 2 }}
                  >
                    Ouvrir l'agence
                  </Button>
                </Alert>
              ) : agenceEtat === 'OU' ? (
                <Alert severity="success">
                  ✅ L'agence est OUVERTE (Session ID: {agenceSessionId})
                </Alert>
              ) : null}
            </Box>

            {/* État du guichet */}
            {guichetState.isOpen && operation === 'FE' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  ℹ️ Guichet {guichetState.codeGuichet} est OUVERT
                </Typography>
                <Typography variant="body2">
                  Session ID: {guichetState.sessionId}
                </Typography>
              </Alert>
            )}
          </Box>

          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <Grid container spacing={3}>
                {/* Sélection Opération */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Opération</InputLabel>
                    <Select
                      value={operation}
                      onChange={handleOperationChange}
                      label="Opération"
                      disabled={!agenceSessionId || agenceEtat === 'FE'}
                    >
                      <MenuItem value="OU">Ouverture (OU)</MenuItem>
                      <MenuItem value="FE">Fermeture (FE)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Informations communes */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Session Agence ID"
                    value={agenceSessionId || 'Non disponible'}
                    disabled
                    helperText="Récupéré automatiquement"
                  />
                </Grid>

                {/* FORMULAIRE OUVERTURE */}
                {operation === 'OU' ? (
                  <form onSubmit={handleSubmitOuverture} style={{ width: '100%' }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Tooltip 
                          title={agenceEtat === 'FE' ? "L'agence doit être ouverte" : ""}
                        >
                          <TextField
                            fullWidth
                            size="small"
                            label="Code du guichet *"
                            name="code_guichet"
                            value={formDataOuverture.code_guichet}
                            onChange={handleOuvertureChange}
                            required
                            placeholder="Ex: 1001"
                            type="number"
                            inputProps={{ min: 1 }}
                            disabled={agenceEtat === 'FE'}
                            helperText={loadingGuichetState ? "Vérification..." : ""}
                          />
                        </Tooltip>
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
                          label="Code du guichet"
                          value={formDataFermeture.code_guichet || 'Non disponible'}
                          disabled
                          helperText="Guichet à fermer"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Session Guichet ID"
                          value={formDataFermeture.guichet_session_id || 'Non disponible'}
                          disabled
                          helperText="ID de session du guichet"
                        />
                      </Grid>
                    </Grid>
                  </form>
                )}

                {/* Informations de session */}
                <Grid item xs={12}>
                  <Alert severity="info" icon={false}>
                    <Typography variant="body2" fontWeight="bold">
                      Informations stockées dans localStorage:
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '12px' }}>
                      session_agence_id: {localStorage.getItem('session_agence_id') || 'null'}<br/>
                      guichet_session_id: {localStorage.getItem('guichet_session_id') || 'null'}<br/>
                      code_guichet: {localStorage.getItem('code_guichet') || 'null'}
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
                    <Tooltip title={isButtonDisabled() ? "Remplissez tous les champs" : ""}>
                      <span>
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
                      </span>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
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

export default GuichetForm;