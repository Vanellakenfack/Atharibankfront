import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, MenuItem,
  FormControl, InputLabel, Select, Grid, Card, CardContent,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip, Snackbar,
  InputAdornment, Chip, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import sessionService from '../../services/sessionService';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// Types
interface BilletItem {
  id: number;
  label: string;
  valeur: number;
  quantite: number;
  total: number;
  type: 'BILLET' | 'PIECE';
  codeApi: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface CaisseState {
  isOpen: boolean;
  sessionId?: number;
  soldeOuverture?: number;
}

interface ApiResponse {
  statut: 'success' | 'error';
  message: string;
  data?: {
    caisse_id?: number;
    [key: string]: any;
  };
}

const CaisseForm = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingCaisseState, setLoadingCaisseState] = useState(true);
  const [loadingSolde, setLoadingSolde] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  
  // États
  const [guichetSessionId, setGuichetSessionId] = useState<string>('');
  const [codeGuichet, setCodeGuichet] = useState<string>('');
  const [caisseState, setCaisseState] = useState<CaisseState>({
    isOpen: false
  });
  const [operation, setOperation] = useState<'OU' | 'FE'>('OU');
  const [billetageDialogOpen, setBilletageDialogOpen] = useState(false);
  
  // Solde informatique
  const [soldeInfo, setSoldeInfo] = useState<{montant: number, disponible: boolean} | null>(null);
  
  // États du formulaire OUVERTURE
  const [formDataOuverture, setFormDataOuverture] = useState({
    guichet_session_id: '',
    code_caisse: '',
    solde_saisi: 0,
  });
  
  // États du formulaire FERMETURE
  const [formDataFermeture, setFormDataFermeture] = useState({
    caisse_session_id: '',
    code_caisse: '',
    solde_fermeture: 0,
    solde_ouverture: 0
  });
  
  // Billets et pièces (pour ouverture seulement)
  const [billets, setBillets] = useState<BilletItem[]>([
    { id: 1, label: 'B.10 000', valeur: 10000, quantite: 0, total: 0, type: 'BILLET', codeApi: '10000' },
    { id: 2, label: 'B.5 000', valeur: 5000, quantite: 0, total: 0, type: 'BILLET', codeApi: '5000' },
    { id: 3, label: 'B.2 000', valeur: 2000, quantite: 0, total: 0, type: 'BILLET', codeApi: '2000' },
    { id: 4, label: 'B.1 000', valeur: 1000, quantite: 0, total: 0, type: 'BILLET', codeApi: '1000' },
    { id: 5, label: 'B.500', valeur: 500, quantite: 0, total: 0, type: 'BILLET', codeApi: '500' },
    { id: 6, label: 'P.500', valeur: 500, quantite: 0, total: 0, type: 'PIECE', codeApi: '500' },
    { id: 7, label: 'P.100', valeur: 100, quantite: 0, total: 0, type: 'PIECE', codeApi: '100' },
    { id: 8, label: 'P.50', valeur: 50, quantite: 0, total: 0, type: 'PIECE', codeApi: '50' },
    { id: 9, label: 'P.25', valeur: 25, quantite: 0, total: 0, type: 'PIECE', codeApi: '25' },
    { id: 10, label: 'P.10', valeur: 10, quantite: 0, total: 0, type: 'PIECE', codeApi: '10' },
    { id: 11, label: 'P.5', valeur: 5, quantite: 0, total: 0, type: 'PIECE', codeApi: '5' },
    { id: 12, label: 'P.1', valeur: 1, quantite: 0, total: 0, type: 'PIECE', codeApi: '1' },
  ]);
  
  const [totalBilletage, setTotalBilletage] = useState(0);
  const [difference, setDifference] = useState(0);
  const [validationMessage, setValidationMessage] = useState<string>('');

  // Initialisation
  useEffect(() => {
    console.log('🔄 Initialisation CaisseForm...');
    
    const init = async () => {
      try {
        const guichetSessionId = localStorage.getItem('guichet_session_id');
        const codeGuichet = localStorage.getItem('code_guichet');
        const caisseSessionId = localStorage.getItem('caisse_session_id');
        const codeCaisse = localStorage.getItem('code_caisse');
        const soldeCaisse = localStorage.getItem('solde_caisse');
        
        console.log('📋 localStorage CaisseForm:', {
          guichet_session_id: guichetSessionId,
          code_guichet: codeGuichet,
          caisse_session_id: caisseSessionId,
          code_caisse: codeCaisse,
          solde_caisse: soldeCaisse
        });
        
        if (guichetSessionId) {
          setGuichetSessionId(guichetSessionId);
          setCodeGuichet(codeGuichet || '');
          
          if (caisseSessionId && codeCaisse) {
            setCaisseState({
              isOpen: true,
              sessionId: parseInt(caisseSessionId),
              soldeOuverture: soldeCaisse ? parseFloat(soldeCaisse) : undefined
            });
            
            setFormDataFermeture({
              caisse_session_id: caisseSessionId,
              code_caisse: codeCaisse,
              solde_fermeture: soldeCaisse ? parseFloat(soldeCaisse) : 0,
              solde_ouverture: soldeCaisse ? parseFloat(soldeCaisse) : 0
            });
            
            setOperation('FE');
          } else {
            setFormDataOuverture(prev => ({
              ...prev,
              guichet_session_id: guichetSessionId
            }));
            setOperation('OU');
          }
        } else {
          showSnackbar('Aucun guichet ouvert. Ouvrez d\'abord un guichet.', 'error');
        }

      } catch (error: any) {
        console.error('❌ Erreur initialisation:', error);
      } finally {
        setLoadingCaisseState(false);
      }
    };

    init();
  }, []);

  // Récupérer le solde informatique quand le code caisse change (ouverture)
  useEffect(() => {
    if (formDataOuverture.code_caisse && formDataOuverture.code_caisse.length >= 2 && operation === 'OU') {
      fetchSoldeInformatique(formDataOuverture.code_caisse);
    } else {
      setSoldeInfo(null);
    }
  }, [formDataOuverture.code_caisse, operation]);

  // Calculer le billetage (ouverture seulement)
  useEffect(() => {
    if (operation === 'OU') {
      calculateBilletage();
    }
  }, [billets, formDataOuverture.solde_saisi]);

  const fetchSoldeInformatique = async (codeCaisse: string) => {
    if (!codeCaisse || codeCaisse.length < 2) return;
    
    setLoadingSolde(true);
    try {
      console.log(`🔍 Récupération solde informatique pour: ${codeCaisse}`);
      
      const response = await sessionService.getSoldeInformatique(codeCaisse);
      
      if (response.statut === 'success' && response.data) {
        setSoldeInfo({
          montant: response.data.solde_informatique || 0,
          disponible: true
        });
        
        console.log(`✅ Solde informatique: ${formatCurrency(response.data.solde_informatique || 0)} FCFA`);
        
        if (response.data.solde_informatique === 0) {
          showSnackbar('Première ouverture de cette caisse. Le solde initial doit être 0.', 'info');
        }
      } else {
        setSoldeInfo(null);
      }
      
    } catch (error: any) {
      console.error('❌ Erreur récupération solde:', error);
      setSoldeInfo(null);
    } finally {
      setLoadingSolde(false);
    }
  };

  const handleOperationChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value as 'OU' | 'FE';
    setOperation(value);
    
    // Si on passe de fermeture à ouverture, reset les données d'ouverture
    if (value === 'OU') {
      setFormDataOuverture(prev => ({
        ...prev,
        guichet_session_id: guichetSessionId
      }));
    }
  };

  const handleOuvertureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'code_caisse') {
      setFormDataOuverture(prev => ({ ...prev, [name]: value }));
    } else if (name === 'solde_saisi') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setFormDataOuverture(prev => ({ ...prev, [name]: numValue }));
      } else {
        setFormDataOuverture(prev => ({ ...prev, [name]: 0 }));
      }
    }
  };

  const handleFermetureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'solde_fermeture') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setFormDataFermeture(prev => ({ ...prev, [name]: numValue }));
      } else {
        setFormDataFermeture(prev => ({ ...prev, [name]: 0 }));
      }
    }
  };

  const handleBilletChange = (id: number, quantite: string) => {
    const numQuantite = parseInt(quantite, 10) || 0;
    
    setBillets(prev => prev.map(billet => {
      if (billet.id === id) {
        const qte = Math.max(0, numQuantite);
        const total = qte * billet.valeur;
        return { ...billet, quantite: qte, total };
      }
      return billet;
    }));
  };

  const calculateBilletage = () => {
    const total = billets.reduce((sum, billet) => sum + billet.total, 0);
    setTotalBilletage(total);
    
    const diff = formDataOuverture.solde_saisi - total;
    setDifference(diff);
    
    if (formDataOuverture.solde_saisi === 0 && total === 0) {
      setValidationMessage('✅ Solde 0 - Billetage correct');
    } else if (Math.abs(diff) <= 1) {
      setValidationMessage('✅ Billetage équilibré');
    } else if (diff > 0) {
      setValidationMessage(`❌ Il manque ${formatCurrency(diff)} FCFA`);
    } else {
      setValidationMessage(`❌ Excédent de ${formatCurrency(Math.abs(diff))} FCFA`);
    }
  };

  const resetBilletage = () => {
    setBillets(prev => prev.map(billet => ({
      ...billet,
      quantite: 0,
      total: 0
    })));
  };

  const handleOpenBilletageDialog = () => {
    if (formDataOuverture.solde_saisi === undefined || formDataOuverture.solde_saisi < 0) {
      showSnackbar('Veuillez d\'abord saisir un solde valide', 'warning');
      return;
    }
    setBilletageDialogOpen(true);
  };

  const handleCloseBilletageDialog = () => {
    setBilletageDialogOpen(false);
  };

  const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'success') => {
    console.log(`📢 Snackbar ${severity}: ${message}`);
    setSnackbar({ open: true, message, severity });
  };

  const prepareBilletageForApi = (): Record<string, number> => {
    const billetage: Record<string, number> = {
      '1': 0,
      '5': 0,
      '10': 0,
      '25': 0,
      '50': 0,
      '100': 0,
      '500': 0,
      '1000': 0,
      '2000': 0,
      '5000': 0,
      '10000': 0
    };
    
    billets.forEach(billet => {
      if (Object.keys(billetage).includes(billet.codeApi)) {
        if (billet.codeApi === '500') {
          billetage['500'] = (billetage['500'] || 0) + billet.quantite;
        } else {
          billetage[billet.codeApi] = billet.quantite;
        }
      }
    });
    
    console.log('📦 Billetage formaté pour API:', billetage);
    return billetage;
  };

  const suggestBilletage = () => {
    if (formDataOuverture.solde_saisi === undefined || formDataOuverture.solde_saisi < 0) return;
    
    if (formDataOuverture.solde_saisi === 0) {
      resetBilletage();
      showSnackbar('Billetage réinitialisé', 'info');
      return;
    }
    
    let remaining = Math.floor(formDataOuverture.solde_saisi);
    const newBillets = [...billets];
    
    newBillets.forEach(billet => {
      billet.quantite = 0;
      billet.total = 0;
    });
    
    const sortedBillets = [...newBillets].sort((a, b) => b.valeur - a.valeur);
    
    for (const billet of sortedBillets) {
      if (remaining >= billet.valeur && billet.valeur > 0) {
        if (billet.valeur === 500 && billet.type === 'PIECE') {
          continue;
        }
        
        const quantite = Math.floor(remaining / billet.valeur);
        if (quantite > 0) {
          const index = newBillets.findIndex(b => b.id === billet.id);
          if (index !== -1) {
            newBillets[index].quantite = quantite;
            newBillets[index].total = quantite * billet.valeur;
            remaining -= quantite * billet.valeur;
          }
        }
      }
    }
    
    if (remaining > 0) {
      const index = newBillets.findIndex(b => b.valeur === 1 && b.type === 'PIECE');
      if (index !== -1) {
        newBillets[index].quantite += remaining;
        newBillets[index].total += remaining;
        remaining = 0;
      }
    }
    
    setBillets(newBillets);
    showSnackbar('Billetage suggéré', 'info');
  };

  const handleOpenCaisse = async (): Promise<ApiResponse> => {
    const billetage = prepareBilletageForApi();
    const sessionIdNum = parseInt(guichetSessionId);
    const soldeNum = parseFloat(formDataOuverture.solde_saisi.toString());
    
    console.log('📤 Données ouverture caisse:', {
      guichet_session_id: sessionIdNum,
      code_caisse: formDataOuverture.code_caisse,
      solde_saisi: soldeNum,
      billetage: billetage
    });
    
    try {
      const response = await sessionService.ouvrirCaisse(
        sessionIdNum,
        formDataOuverture.code_caisse,
        billetage,
        soldeNum
      );

      console.log('✅ Réponse API ouverture caisse complète:', response);
      
      const responseData = response.data as ApiResponse;
      console.log('📊 Données de réponse:', responseData);
      
      return responseData;
      
    } catch (err: any) {
      console.error('❌ Erreur API ouverture caisse:', err);
      
      if (err.response && err.response.status === 201) {
        console.log('⚠️ Hook a intercepté un statut 201');
        const errorData = err.response.data as ApiResponse;
        console.log('📊 Données dans l\'erreur 201:', errorData);
        return errorData;
      }
      
      throw err;
    }
  };

  const handleCloseCaisse = async (): Promise<ApiResponse> => {
    const sessionIdNum = parseInt(formDataFermeture.caisse_session_id);
    
    console.log('📤 Données fermeture caisse:', {
      caisse_session_id: sessionIdNum,
      solde_fermeture: formDataFermeture.solde_fermeture
    });

    try {
      const response = await sessionService.fermerCaisse(
        sessionIdNum,
        formDataFermeture.solde_fermeture
      );
      
      console.log('✅ Réponse API fermeture caisse:', response);
      return response.data as ApiResponse;
      
    } catch (err: any) {
      console.error('❌ Erreur API fermeture caisse:', err);
      
      if (err.response && err.response.status === 201) {
        console.log('⚠️ Hook a intercepté un statut 201');
        return err.response.data as ApiResponse;
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
    showSnackbar(message || 'Caisse ouverte avec succès !', 'success');
    
    if (responseData.data?.caisse_id) {
      const caisseId = responseData.data.caisse_id;
      
      setCaisseState({
        isOpen: true,
        sessionId: caisseId,
        soldeOuverture: formDataOuverture.solde_saisi
      });
      
      // Stockage dans localStorage
      localStorage.setItem('caisse_session_id', caisseId.toString());
      localStorage.setItem('code_caisse', formDataOuverture.code_caisse);
      localStorage.setItem('solde_caisse', formDataOuverture.solde_saisi.toString());
      
      console.log('💾 Caisse stockée dans localStorage:', {
        caisse_session_id: caisseId,
        code_caisse: formDataOuverture.code_caisse,
        solde_caisse: formDataOuverture.solde_saisi
      });
      
      // Mettre à jour le formulaire de fermeture
      setFormDataFermeture({
        caisse_session_id: caisseId.toString(),
        code_caisse: formDataOuverture.code_caisse,
        solde_fermeture: formDataOuverture.solde_saisi,
        solde_ouverture: formDataOuverture.solde_saisi
      });
      
      setOperation('FE');
      setBilletageDialogOpen(false);
      
      return true;
    }
    
    return false;
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
    showSnackbar(message || 'Caisse fermée avec succès !', 'success');
    setCaisseState({ isOpen: false });
    
    // Nettoyage localStorage
    localStorage.removeItem('caisse_session_id');
    localStorage.removeItem('code_caisse');
    localStorage.removeItem('solde_caisse');

    setOperation('OU');
    
    // Reset formulaire ouverture
    setFormDataOuverture({
      guichet_session_id: guichetSessionId,
      code_caisse: '',
      solde_saisi: 0,
    });
    
    resetBilletage();
    
    setTimeout(() => {
      navigate('/guichet/form');
    }, 2000);
    
    return true;
  };

  const handleSubmitOuverture = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Soumission ouverture caisse:', formDataOuverture);
    
    if (!guichetSessionId) {
      showSnackbar('Aucune session guichet active.', 'error');
      return;
    }

    if (!formDataOuverture.code_caisse) {
      showSnackbar('Veuillez entrer un code caisse.', 'error');
      return;
    }

    if (formDataOuverture.solde_saisi === undefined || formDataOuverture.solde_saisi < 0) {
      showSnackbar('Veuillez saisir un solde valide (≥ 0)', 'error');
      return;
    }

    if (Math.abs(difference) > 1) {
      showSnackbar('Le billetage n\'est pas correct. Ajustez le billetage.', 'error');
      setBilletageDialogOpen(true);
      return;
    }

    setLoading(true);
    
    try {
      const responseData = await handleOpenCaisse();
      processOuvertureResponse(responseData);
      
    } catch (err: any) {
      console.error('❌ Erreur lors de l\'ouverture de la caisse:', err);
      
      let errorMessage = 'Une erreur est survenue lors de l\'ouverture';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showSnackbar(errorMessage, 'error');
      
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFermeture = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Soumission fermeture caisse:', formDataFermeture);
    
    if (!formDataFermeture.caisse_session_id) {
      showSnackbar('Session caisse manquante.', 'error');
      return;
    }

    if (formDataFermeture.solde_fermeture === undefined || formDataFermeture.solde_fermeture < 0) {
      showSnackbar('Veuillez saisir un solde de fermeture valide.', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const responseData = await handleCloseCaisse();
      processFermetureResponse(responseData);
      
    } catch (err: any) {
      console.error('❌ Erreur lors de la fermeture de la caisse:', err);
      
      let errorMessage = 'Une erreur est survenue lors de la fermeture';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showSnackbar(errorMessage, 'error');
      
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getButtonText = () => {
    if (loading) return '';
    return operation === 'OU' ? 'Ouvrir la Caisse' : 'Fermer la Caisse';
  };

  const isButtonDisabled = () => {
    if (loading) return true;
    if (!guichetSessionId) return true;
    
    if (operation === 'OU') {
      if (!formDataOuverture.code_caisse) return true;
      if (formDataOuverture.solde_saisi === undefined || formDataOuverture.solde_saisi < 0) return true;
      if (Math.abs(difference) > 1) return true;
    } else if (operation === 'FE') {
      if (!formDataFermeture.caisse_session_id) return true;
      if (formDataFermeture.solde_fermeture === undefined || formDataFermeture.solde_fermeture < 0) return true;
    }
    
    return false;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  // Filtrer les billets et pièces
  const billetsFiltres = billets.filter(b => b.type === 'BILLET');
  const piecesFiltrees = billets.filter(b => b.type === 'PIECE');

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
              {operation === 'OU' ? 'Ouverture de la Caisse' : 'Fermeture de la Caisse'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Étape 4 : Gérer l'ouverture ou la fermeture des caisses
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              {loadingCaisseState ? (
                <Alert severity="info">Chargement des informations...</Alert>
              ) : !guichetSessionId ? (
                <Alert severity="error">
                  <Typography variant="body2" fontWeight="bold">
                    ⚠️ Aucune session guichet active
                  </Typography>
                  <Typography variant="body2">
                    Vous devez d'abord ouvrir un guichet.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate('/guichet/form')}
                    sx={{ mt: 1 }}
                  >
                    Ouvrir un guichet
                  </Button>
                </Alert>
              ) : caisseState.isOpen ? (
                <Alert severity="info">
                  <Typography variant="body2" fontWeight="bold">
                    ✅ La caisse {formDataFermeture.code_caisse} est OUVERTE
                  </Typography>
                  <Typography variant="body2">
                    Guichet: {codeGuichet} | Session ID: {guichetSessionId}
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="success">
                  <Typography variant="body2" fontWeight="bold">
                    ✅ Le guichet {codeGuichet} est OUVERT
                  </Typography>
                  <Typography variant="body2">
                    Session ID: {guichetSessionId}
                  </Typography>
                </Alert>
              )}
            </Box>
          </Box>

          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <Grid container spacing={3}>
                {/* Sélection Opération */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" disabled={!guichetSessionId}>
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
                    label="Session Guichet ID"
                    value={guichetSessionId || 'Non disponible'}
                    disabled
                    helperText="ID récupéré automatiquement"
                  />
                </Grid>

                {/* FORMULAIRE OUVERTURE */}
                {operation === 'OU' ? (
                  <form onSubmit={handleSubmitOuverture} style={{ width: '100%' }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Code de la caisse *"
                          name="code_caisse"
                          value={formDataOuverture.code_caisse}
                          onChange={handleOuvertureChange}
                          required
                          placeholder="Ex: C001, C002"
                          InputProps={{
                            endAdornment: loadingSolde ? (
                              <InputAdornment position="end">
                                <CircularProgress size={20} />
                              </InputAdornment>
                            ) : soldeInfo ? (
                              <InputAdornment position="end">
                                <Chip
                                  size="small"
                                  icon={<InfoIcon />}
                                  label={`${formatCurrency(soldeInfo.montant)} FCFA`}
                                  color={soldeInfo.montant === 0 ? "warning" : "success"}
                                  variant="outlined"
                                />
                              </InputAdornment>
                            ) : null
                          }}
                          helperText="Code unique de la caisse"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Solde d'ouverture *"
                              name="solde_saisi"
                              value={formDataOuverture.solde_saisi === 0 ? "0" : formDataOuverture.solde_saisi || ''}
                              onChange={handleOuvertureChange}
                              required
                              type="number"
                              InputProps={{ 
                                startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
                                endAdornment: (
                                  <Tooltip title="Ouvrir l'assistant de billetage">
                                    <span>
                                      <IconButton 
                                        size="small" 
                                        onClick={handleOpenBilletageDialog}
                                        disabled={!guichetSessionId || formDataOuverture.solde_saisi === undefined || formDataOuverture.solde_saisi < 0}
                                      >
                                        <AttachMoneyIcon />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                )
                              }}
                              helperText="Montant total d'ouverture de caisse"
                            />
                          </Box>
                          
                          {soldeInfo && (
                            <Box sx={{ 
                              minWidth: 250,
                              p: 2,
                              borderRadius: '8px',
                              bgcolor: '#f8fafc',
                              border: '1px solid #E2E8F0'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <InfoIcon sx={{ mr: 1, color: '#64748B', fontSize: 18 }} />
                                <Typography variant="subtitle2" fontWeight="bold" color="#1E293B">
                                  Solde Informatique
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="h6" fontWeight="bold" color="#1E293B">
                                    {formatCurrency(soldeInfo.montant)} FCFA
                                  </Typography>
                                  <Typography variant="caption" color="#64748B">
                                    Dernier solde enregistré
                                  </Typography>
                                </Box>
                                
                                {soldeInfo.montant === 0 && (
                                  <Chip
                                    icon={<WarningIcon />}
                                    label="Première ouverture"
                                    color="warning"
                                    size="small"
                                  />
                                )}
                              </Box>
                              
                              {soldeInfo.montant > 0 && formDataOuverture.solde_saisi > 0 && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                  Vérifiez que le solde saisi correspond au solde informatique.
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Grid>

                      {/* État du billetage (uniquement pour ouverture) */}
                      {formDataOuverture.solde_saisi > 0 && (
                        <Grid item xs={12}>
                          <Alert 
                            severity={Math.abs(difference) <= 1 ? "success" : "warning"}
                            icon={Math.abs(difference) <= 1 ? <CheckCircleIcon /> : <WarningIcon />}
                          >
                            <Typography variant="body2" fontWeight="bold">
                              État du billetage:
                            </Typography>
                            
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2">
                                • Solde à billeter: {formatCurrency(formDataOuverture.solde_saisi)} FCFA
                              </Typography>
                              <Typography variant="body2">
                                • Total billetage: {formatCurrency(totalBilletage)} FCFA
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                • Différence: {formatCurrency(difference)} FCFA
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                              {validationMessage}
                            </Typography>
                            
                            {Math.abs(difference) > 1 && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={handleOpenBilletageDialog}
                                sx={{ mt: 1 }}
                              >
                                Ajuster le billetage
                              </Button>
                            )}
                          </Alert>
                        </Grid>
                      )}
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
                          label="Code de la caisse"
                          value={formDataFermeture.code_caisse || 'Non disponible'}
                          disabled
                          helperText="Caisse à fermer"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Session Caisse ID"
                          value={formDataFermeture.caisse_session_id || 'Non disponible'}
                          disabled
                          helperText="ID de session de la caisse"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Alert severity="info" icon={<InfoIcon />}>
                          <Typography variant="body2" fontWeight="bold">
                            Solde d'ouverture: {formatCurrency(formDataFermeture.solde_ouverture)} FCFA
                          </Typography>
                          <Typography variant="body2">
                            C'est le solde avec lequel la caisse a été ouverte.
                          </Typography>
                        </Alert>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Solde de fermeture *"
                          name="solde_fermeture"
                          value={formDataFermeture.solde_fermeture === 0 ? "0" : formDataFermeture.solde_fermeture || ''}
                          onChange={handleFermetureChange}
                          required
                          type="number"
                          InputProps={{ 
                            startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
                            endAdornment: (
                              <InputAdornment position="end">
                                <AttachMoneyIcon />
                              </InputAdornment>
                            )
                          }}
                          helperText="Solde constaté après comptage à la fermeture"
                        />
                      </Grid>
                    </Grid>
                  </form>
                )}

                {/* Informations techniques */}
                <Grid item xs={12}>
                  <Alert severity="info" icon={false}>
                    <Typography variant="body2" fontWeight="bold">
                      Informations techniques:
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '12px' }}>
                      • Guichet Session ID: {localStorage.getItem('guichet_session_id') || 'Non défini'}<br/>
                      • Caisse Session ID: {localStorage.getItem('caisse_session_id') || 'Non défini'}<br/>
                      • Agence Session ID: {localStorage.getItem('session_agence_id') || 'Non défini'}
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
                        textTransform: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      Annuler
                    </Button>
                    
                    {!guichetSessionId ? (
                      <Button
                        variant="contained"
                        onClick={() => navigate('/guichet/form')}
                        sx={{
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          borderRadius: '8px',
                          px: 4,
                          py: 1,
                          textTransform: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        Ouvrir un Guichet
                      </Button>
                    ) : (
                      <Tooltip 
                        title={isButtonDisabled() ? "Veuillez remplir tous les champs requis correctement" : ""}
                        placement="top"
                      >
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
                              textTransform: 'none',
                              fontWeight: 'bold',
                              '&:disabled': {
                                background: '#94A3B8',
                                color: '#FFFFFF'
                              }
                            }}
                          >
                            {loading ? <CircularProgress size={24} color="inherit" /> : getButtonText()}
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Dialog Billetage (pour ouverture seulement) */}
      <Dialog 
        open={billetageDialogOpen} 
        onClose={handleCloseBilletageDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Assistant de Billetage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Solde à billeter: {formatCurrency(formDataOuverture.solde_saisi)} FCFA
              </Typography>
            </Box>
            <IconButton onClick={handleCloseBilletageDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {/* Section Billets */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
              Billets
            </Typography>
            <Grid container spacing={2}>
              {billetsFiltres.map((billet) => (
                <Grid item xs={12} sm={6} md={4} key={billet.id}>
                  <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '8px', height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {billet.label}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`${formatCurrency(billet.valeur)}`} 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Quantité"
                      value={billet.quantite}
                      onChange={(e) => handleBilletChange(billet.id, e.target.value)}
                      InputProps={{
                        inputProps: { min: 0 },
                        endAdornment: (
                          <Typography variant="caption" color="text.secondary">
                            × {formatCurrency(billet.valeur)}
                          </Typography>
                        )
                      }}
                    />
                    <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Sous-total:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatCurrency(billet.total)} FCFA
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Section Pièces */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="secondary" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
              Pièces
            </Typography>
            <Grid container spacing={2}>
              {piecesFiltrees.map((piece) => (
                <Grid item xs={12} sm={6} md={4} key={piece.id}>
                  <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '8px', height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {piece.label}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`${formatCurrency(piece.valeur)}`} 
                        color="secondary" 
                        variant="outlined"
                      />
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Quantité"
                      value={piece.quantite}
                      onChange={(e) => handleBilletChange(piece.id, e.target.value)}
                      InputProps={{
                        inputProps: { min: 0 },
                        endAdornment: (
                          <Typography variant="caption" color="text.secondary">
                            × {formatCurrency(piece.valeur)}
                          </Typography>
                        )
                      }}
                    />
                    <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Sous-total:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="secondary">
                        {formatCurrency(piece.total)} FCFA
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Résumé */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: '8px', border: '2px solid #e0e0e0' }}>
            <Typography variant="subtitle1" fontWeight="bold" color="#1E293B" sx={{ mb: 3 }}>
              Résumé du Billetage
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: '8px', bgcolor: '#FFFFFF' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Solde à billeter
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {formatCurrency(formDataOuverture.solde_saisi)} FCFA
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: '8px', bgcolor: '#FFFFFF' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total billetage
                  </Typography>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx={{ 
                      color: Math.abs(difference) <= 1 ? '#10B981' : '#EF4444'
                    }}
                  >
                    {formatCurrency(totalBilletage)} FCFA
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: '8px', bgcolor: '#FFFFFF' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Différence
                  </Typography>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx={{ 
                      color: Math.abs(difference) <= 1 ? '#10B981' : '#EF4444'
                    }}
                  >
                    {formatCurrency(difference)} FCFA
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Alert 
              severity={Math.abs(difference) <= 1 ? "success" : "error"}
              sx={{ mt: 3 }}
              icon={Math.abs(difference) <= 1 ? <CheckCircleIcon /> : <WarningIcon />}
            >
              <Typography variant="body1" fontWeight="bold">
                {validationMessage}
              </Typography>
              {Math.abs(difference) > 1 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Le billetage doit correspondre exactement au solde saisi (± 1 FCFA).
                </Typography>
              )}
            </Alert>
          </Paper>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Box>
              <Button 
                onClick={suggestBilletage} 
                variant="outlined" 
                startIcon={<AutoFixHighIcon />}
                sx={{ mr: 1 }}
                disabled={formDataOuverture.solde_saisi === 0}
                size="medium"
              >
                Suggérer automatiquement
              </Button>
              <Button 
                onClick={resetBilletage} 
                variant="outlined"
                startIcon={<RestartAltIcon />}
                size="medium"
              >
                Réinitialiser
              </Button>
            </Box>
            <Box>
              <Button 
                onClick={handleCloseBilletageDialog} 
                variant="outlined"
                sx={{ mr: 1 }}
                size="medium"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCloseBilletageDialog}
                variant="contained"
                disabled={Math.abs(difference) > 1}
                size="medium"
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  minWidth: '120px'
                }}
              >
                Valider
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '0.95rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CaisseForm;