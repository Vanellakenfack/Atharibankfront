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
import guichetService from '../../services/guichetService';

// Types
interface Guichet {
  id: number;
  nom_guichet: string;
  code_guichet: string;
  statut?: string;
  agence_id: number;
  est_actif: number;
  created_at: string;
  updated_at: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface GuichetState {
  isOpen: boolean;
  sessionId?: number;
  guichetId?: number;
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
  const [loadingGuichets, setLoadingGuichets] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  
  // États
  const [agenceSessionId, setAgenceSessionId] = useState<string>('');
  const [guichets, setGuichets] = useState<Guichet[]>([]);
  const [guichetState, setGuichetState] = useState<GuichetState>({
    isOpen: false
  });
  const [operation, setOperation] = useState<'OU' | 'FE'>('OU');

  // États du formulaire OUVERTURE
  const [formDataOuverture, setFormDataOuverture] = useState({
    agence_session_id: '',
    guichet_id: '',
    code_guichet: ''
  });

  // États du formulaire FERMETURE
  const [formDataFermeture, setFormDataFermeture] = useState({
    guichet_session_id: '',
    guichet_id: '',
    code_guichet: ''
  });

  // Charger l'état de l'agence et les guichets
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Vérifier si on a une session agence active
        const responseAgence = await sessionService.getAgenceActive();
        
        if (responseAgence.statut === 'success' && responseAgence.session) {
          const agenceSession = responseAgence.session;
          setAgenceSessionId(agenceSession.id);
          
          // 2. Vérifier si on a une session guichet active
          const responseGuichet = await sessionService.getGuichetActive();
          
          if (responseGuichet.statut === 'success' && responseGuichet.session) {
            const guichetSession = responseGuichet.session;
            
            setGuichetState({
              isOpen: true,
              sessionId: guichetSession.id,
              guichetId: guichetSession.guichet_id,
              codeGuichet: guichetSession.code
            });
            
            setFormDataFermeture({
              guichet_session_id: guichetSession.id.toString(),
              guichet_id: guichetSession.guichet_id.toString(),
              code_guichet: guichetSession.code
            });
            
            setOperation('FE');
            
          } else {
            setOperation('OU');
          }
          
          // 3. Charger les guichets disponibles avec l'ID de session
          await loadGuichets(agenceSession.id);
          
        } else {
          showSnackbar('Ouvrez d\'abord l\'agence', 'warning');
        }
        
      } catch (error) {
        console.error('❌ Erreur initialisation:', error);
      } finally {
        setLoadingGuichets(false);
      }
    };

    init();
  }, []);

  // Fonction pour vérifier l'état du guichet
  const checkGuichetSession = async () => {
    try {
      const guichetSessionId = localStorage.getItem('guichet_session_id');
      const guichetId = localStorage.getItem('guichet_id');
      const codeGuichet = localStorage.getItem('code_guichet');
      
      if (guichetSessionId && guichetId) {
        console.log('✅ Guichet déjà ouvert:', { guichetSessionId, guichetId, codeGuichet });
        
        // Vérifier si la session guichet est toujours active
        try {
          setGuichetState({
            isOpen: true,
            sessionId: parseInt(guichetSessionId),
            guichetId: parseInt(guichetId),
            codeGuichet: codeGuichet || ''
          });
          
          setFormDataFermeture({
            guichet_session_id: guichetSessionId,
            guichet_id: guichetId,
            code_guichet: codeGuichet || ''
          });
          
          setOperation('FE');
          showSnackbar(`Guichet ${codeGuichet} est déjà ouvert`, 'info');
          
        } catch (error) {
          // Si la session n'est plus valide, nettoyer
          console.log('Session guichet invalide, nettoyage...');
          clearGuichetStorage();
        }
      } else {
        setOperation('OU');
      }
    } catch (error) {
      console.error('Erreur vérification session guichet:', error);
    }
  };

  const clearGuichetStorage = () => {
    localStorage.removeItem('guichet_session_id');
    localStorage.removeItem('guichet_id');
    localStorage.removeItem('code_guichet');
    setGuichetState({ isOpen: false });
    setOperation('OU');
  };

  const loadGuichets = async (sessionId?: string) => {
    try {
      setLoadingGuichets(true);
      
      // Utiliser l'ID passé en paramètre ou celui de l'état
      const currentSessionId = sessionId || agenceSessionId;
      
      console.log('🔄 1. Début loadGuichets, sessionId:', currentSessionId);
      
      // Vérifier si on a une session agence
      if (!currentSessionId) {
        console.log('❌ Aucune session agence active');
        setGuichets([]);
        showSnackbar('Ouvrez d\'abord l\'agence', 'warning');
        return;
      }
      
      console.log(`Appel API: /sessions/guichets/disponibles/${currentSessionId}`);
      
      // Utiliser la méthode getGuichetsDisponibles
      const data = await guichetService.getGuichetsDisponibles(parseInt(currentSessionId));
      
      console.log('📦 4. Réponse API brute:', data);
      
      // Gérer la structure de la réponse
      if (Array.isArray(data)) {
        console.log('✅ 5. Données (tableau direct):', data.length, 'guichets');
        setGuichets(data);
      } else if (data && typeof data === 'object') {
        console.log('✅ 5. Données (objet):', Object.keys(data));
        
        // Vérifier différentes structures possibles
        if (data.statut === 'success' && Array.isArray(data.data)) {
          console.log('✅ Structure: data.statut success avec data.data');
          setGuichets(data.data);
        } else if (data.data && Array.isArray(data.data)) {
          console.log('✅ Structure: data.data (sans statut)');
          setGuichets(data.data);
        } else if (Array.isArray(data.guichets)) {
          console.log('✅ Structure: data.guichets');
          setGuichets(data.guichets);
        } else {
          console.warn('⚠️ Structure de données inattendue:', data);
          setGuichets([]);
        }
      } else {
        console.log('ℹ️ Aucun guichet disponible ou réponse vide');
        setGuichets([]);
      }
      
    } catch (error: any) {
      console.error('❌ ERREUR dans loadGuichets:', error);
      
      // Log détaillé de l'erreur
      if (error.response) {
        console.error('📊 Détails erreur:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          url: error.response.config?.url
        });
      }
      
      let errorMessage = 'Erreur lors du chargement des guichets';
      
      if (error && typeof error === 'object') {
        const err = error as any;
        
        // Messages d'erreur spécifiques
        if (err.response?.status === 404) {
          errorMessage = 'Aucun guichet disponible pour cette agence';
        } else if (err.response?.status === 400) {
          errorMessage = 'Session agence invalide';
        } else if (err.response?.status === 401) {
          errorMessage = 'Session expirée, veuillez vous reconnecter';
        } else if (err.response?.status === 500) {
          errorMessage = 'Erreur serveur, veuillez réessayer';
        } else {
          errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        err.message || 
                        errorMessage;
        }
      }
      
      showSnackbar(errorMessage, 'error');
      setGuichets([]);
    } finally {
      setLoadingGuichets(false);
    }
  };

  const handleOperationChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value as 'OU' | 'FE';
    setOperation(value);
  };

  const handleOuvertureChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    console.log(`🔄 handleOuvertureChange - name: ${name}, value: ${value}`);
    
    if (name && name in formDataOuverture) {
      // Créer une copie des données actuelles
      const updatedData = { ...formDataOuverture, [name]: value as string };
      
      // Si on change le guichet, récupérer automatiquement son code
      if (name === 'guichet_id' && value) {
        console.log('🔍 Recherche du guichet sélectionné...');
        const selectedGuichet = guichets.find(g => g.id.toString() === value.toString());
        console.log('🔍 Guichet trouvé:', selectedGuichet);
        
        if (selectedGuichet) {
          console.log(`✅ Code guichet trouvé: ${selectedGuichet.code_guichet}`);
          updatedData.code_guichet = selectedGuichet.code_guichet;
        } else {
          console.warn('⚠️ Aucun guichet trouvé avec cet ID');
          updatedData.code_guichet = '';
        }
      }
      
      console.log('📝 Données mises à jour:', updatedData);
      setFormDataOuverture(updatedData);
    }
  };

  const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'success') => {
    console.log(`📢 Snackbar ${severity}: ${message}`);
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenGuichet = async (): Promise<ApiResponse> => {
    console.log('📞 Appel API ouverture guichet...', {
      agence_session_id: parseInt(agenceSessionId),
      guichet_id: parseInt(formDataOuverture.guichet_id),
      guichet_code: formDataOuverture.code_guichet
    });
    
    if (!formDataOuverture.guichet_id) {
      throw new Error('Veuillez sélectionner un guichet');
    }

    if (!agenceSessionId) {
      throw new Error('Session agence non disponible');
    }

    if (!formDataOuverture.code_guichet) {
      throw new Error('Code guichet non disponible');
    }

    try {
      const response = await sessionService.ouvrirGuichet(
        parseInt(agenceSessionId),
        parseInt(formDataOuverture.guichet_id),
        formDataOuverture.code_guichet
      );

      console.log('✅ Réponse API ouverture guichet:', response);
      
      return {
        statut: 'success',
        message: response.data?.message || 'Guichet ouvert avec succès !',
        data: response.data?.data || response.data
      };
      
    } catch (err: any) {
      console.error('❌ Erreur ouverture guichet:', err);
      
      const errorData = err.response?.data;
      if (errorData) {
        return {
          statut: 'error',
          message: errorData.message || errorData.error || 'Erreur lors de l\'ouverture',
          data: errorData
        };
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
      console.log('📞 Appel API fermeture guichet...', { guichet_session_id: guichetSessionId });
      const response = await sessionService.fermerGuichet(parseInt(guichetSessionId));
      
      console.log('✅ Réponse API fermeture guichet:', response);
      
      return {
        statut: 'success',
        message: response.data?.message || 'Guichet fermé avec succès !',
        data: response.data
      };
      
    } catch (err: any) {
      console.error('❌ Erreur fermeture guichet:', err);
      
      const errorData = err.response?.data;
      if (errorData) {
        return {
          statut: 'error',
          message: errorData.message || errorData.error || 'Erreur lors de la fermeture',
          data: errorData
        };
      }
      
      throw err;
    }
  };

  const processOuvertureResponse = (responseData: ApiResponse): boolean => {
    console.log('🔄 Traitement réponse ouverture:', responseData);
    
    if (responseData.statut !== 'success') {
      showSnackbar(responseData.message || 'Erreur lors de l\'ouverture', 'error');
      return false;
    }
    
    console.log('✅ Ouverture réussie:', responseData.message);
    showSnackbar(responseData.message || 'Guichet ouvert avec succès !', 'success');
    
    // Extraire les données
    let guichetSessionId: number | undefined;
    let codeGuichet: string | undefined;
    let guichetId: number | undefined;
    
    if (responseData.data) {
      guichetSessionId = responseData.data.id || responseData.data.guichet_session_id;
      codeGuichet = responseData.data.code_guichet || responseData.data.code;
      guichetId = responseData.data.guichet_id || responseData.data.guichetId;
    }
    
    if (!guichetSessionId && responseData.data?.data) {
      guichetSessionId = responseData.data.data.id;
      codeGuichet = responseData.data.data.code_guichet;
      guichetId = responseData.data.data.guichet_id;
    }
    
    if (!guichetId) {
      guichetId = parseInt(formDataOuverture.guichet_id);
    }
    
    if (!codeGuichet) {
      codeGuichet = formDataOuverture.code_guichet;
    }
    
    const selectedGuichet = guichets.find(g => g.id.toString() === formDataOuverture.guichet_id);
    
    if (!codeGuichet && selectedGuichet) {
      codeGuichet = selectedGuichet.code_guichet;
    }
    
    // Préparer les données à stocker
    const finalGuichetSessionId = guichetSessionId || Date.now();
    const finalGuichetId = guichetId || selectedGuichet?.id || parseInt(formDataOuverture.guichet_id);
    const finalCodeGuichet = codeGuichet || selectedGuichet?.code_guichet || formDataOuverture.code_guichet;
    
    console.log('💾 Données finales à stocker:', {
      guichet_session_id: finalGuichetSessionId,
      guichet_id: finalGuichetId,
      code_guichet: finalCodeGuichet
    });
    
    // Stocker dans localStorage
    localStorage.setItem('guichet_session_id', finalGuichetSessionId.toString());
    localStorage.setItem('guichet_id', finalGuichetId.toString());
    localStorage.setItem('code_guichet', finalCodeGuichet);
    
    // Mettre à jour l'état
    setGuichetState({
      isOpen: true,
      sessionId: finalGuichetSessionId,
      guichetId: finalGuichetId,
      codeGuichet: finalCodeGuichet
    });
    
    setFormDataFermeture({
      guichet_session_id: finalGuichetSessionId.toString(),
      guichet_id: finalGuichetId.toString(),
      code_guichet: finalCodeGuichet
    });
    
    setOperation('FE');
    
    // Redirection vers caisse après 1.5 secondes
    console.log('🔄 Redirection vers caisse dans 1.5s...');
    setTimeout(() => {
      console.log('🚀 Redirection vers /caisse/form');
      navigate('/caisse/form');
    }, 1500);
    
    return true;
  };

  const processFermetureResponse = (responseData: ApiResponse): boolean => {
    console.log('🔄 Traitement réponse fermeture:', responseData);
    
    if (responseData.statut !== 'success') {
      showSnackbar(responseData.message || 'Erreur lors de la fermeture', 'error');
      return false;
    }
    
    console.log('✅ Fermeture réussie:', responseData.message);
    showSnackbar(responseData.message || 'Guichet fermé avec succès !', 'success');
    
    // Réinitialiser
    clearGuichetStorage();
    
    setOperation('OU');
    
    setFormDataOuverture(prev => ({ 
      ...prev, 
      guichet_id: '',
      code_guichet: ''
    }));
    
    // Recharger les guichets
    loadGuichets();
    
    return true;
  };

  const handleSubmitOuverture = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Soumission ouverture guichet:', formDataOuverture);
    
    if (!agenceSessionId) {
      showSnackbar('Session agence manquante', 'error');
      return;
    }

    if (!formDataOuverture.guichet_id) {
      showSnackbar('Veuillez sélectionner un guichet', 'error');
      return;
    }

    if (!formDataOuverture.code_guichet) {
      showSnackbar('Code guichet non disponible', 'error');
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
    
    if (operation === 'OU') {
      if (!formDataOuverture.guichet_id || !formDataOuverture.code_guichet) return true;
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
            
            {/* Indicateur d'état */}
            <Box sx={{ mt: 2 }}>
              {!agenceSessionId ? (
                <Alert severity="warning">
                  ⚠️ L'agence n'est pas ouverte. Ouvrez d'abord l'agence.
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate('/agence/form')}
                    sx={{ ml: 2 }}
                  >
                    Ouvrir l'agence
                  </Button>
                </Alert>
              ) : guichetState.isOpen && operation === 'FE' ? (
                <Alert severity="info">
                  <Typography variant="body2" fontWeight="bold">
                    ℹ️ Guichet {guichetState.codeGuichet} est OUVERT
                  </Typography>
                  <Typography variant="body2">
                    Session ID: {guichetState.sessionId} | Guichet ID: {guichetState.guichetId}
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="success">
                  ✅ L'agence est OUVERTE (Session ID: {agenceSessionId})
                </Alert>
              )}
            </Box>
          </Box>

          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <Grid container spacing={3}>
                {/* Sélection Opération */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" disabled={!agenceSessionId}>
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
                      <Grid item xs={12} md={6}>
                        <FormControl sx={{minWidth:200}} size="small" required>
                          <InputLabel>Sélectionner Guichet</InputLabel>
                          <Select
                            name="guichet_id"
                            value={formDataOuverture.guichet_id}
                            onChange={handleOuvertureChange}
                            label="Guichet *"
                            required
                            disabled={loadingGuichets}
                          >
                            <MenuItem value=""><em>Sélectionner un guichet</em></MenuItem>
                            {guichets.length > 0 ? (
                              guichets.map((guichet) => (
                                <MenuItem key={guichet.id} value={guichet.id.toString()}>
                                  {guichet.nom_guichet} ({guichet.code_guichet})
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem value="" disabled>
                                {loadingGuichets ? 'Chargement...' : 'Aucun guichet disponible'}
                              </MenuItem>
                            )}
                          </Select>
                          {loadingGuichets && (
                            <CircularProgress size={20} sx={{ position: 'absolute', right: 40, top: '50%' }} />
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Code du Guichet"
                          name="code_guichet"
                          value={formDataOuverture.code_guichet}
                          disabled
                          helperText="Code généré automatiquement"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          Sélectionnez un guichet pour afficher son code
                        </Typography>
                      </Grid>
                    </Grid>
                  </form>
                ) : (
                  /* FORMULAIRE FERMETURE */
                  <form onSubmit={handleSubmitFermeture} style={{ width: '100%' }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Code du guichet"
                          value={formDataFermeture.code_guichet || 'Non disponible'}
                          disabled
                          helperText="Guichet à fermer"
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="ID Guichet"
                          value={formDataFermeture.guichet_id || 'Non disponible'}
                          disabled
                          helperText="ID du guichet"
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
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
                              ? 'linear-gradient(135deg, #3B82F6 0%, #1D4Ed8 100%)'
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