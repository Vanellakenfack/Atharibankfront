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
import caisseService from '../../services/caisseService';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalculateIcon from '@mui/icons-material/Calculate';

// Types
interface Caisse {
  id: number;
  code_caisse: string;
  libelle: string;
  solde_actuel: number;
  guichet_id?: number;
}

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
  caisseId?: number;
  soldeOuverture?: number;
}

interface ApiResponse {
  statut: 'success' | 'error';
  message: string;
  data?: any;
}

const CaisseForm = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingCaisses, setLoadingCaisses] = useState(true);
  const [loadingSolde, setLoadingSolde] = useState(false);
  const [loadingBilan, setLoadingBilan] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  
  // États
  const [guichetSessionId, setGuichetSessionId] = useState<string>('');
  const [guichetId, setGuichetId] = useState<string>('');
  const [codeGuichet, setCodeGuichet] = useState<string>('');
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [caisseState, setCaisseState] = useState<CaisseState>({
    isOpen: false
  });
  const [operation, setOperation] = useState<'OU' | 'FE'>('OU');
  const [billetageDialogOpen, setBilletageDialogOpen] = useState(false);
  const [bilanDialogOpen, setBilanDialogOpen] = useState(false);
  
  // Solde informatique
  const [soldeInfo, setSoldeInfo] = useState<{montant: number, disponible: boolean} | null>(null);
  
  // États du formulaire OUVERTURE
  const [formDataOuverture, setFormDataOuverture] = useState({
    guichet_session_id: '',
    caisse_id: '',
    solde_saisi: 0,
  });
  
  // États du formulaire FERMETURE
  const [formDataFermeture, setFormDataFermeture] = useState({
    caisse_session_id: '',
    caisse_id: '',
    code_caisse: '',
    solde_fermeture: 0,
    solde_ouverture: 0
  });

  // Bilan de fermeture
  const [bilanData, setBilanData] = useState<any>(null);
  
  // Billets et pièces
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
        const guichetId = localStorage.getItem('guichet_id');
        const codeGuichet = localStorage.getItem('code_guichet');
        const caisseSessionId = localStorage.getItem('caisse_session_id');
        const caisseId = localStorage.getItem('caisse_id');
        const codeCaisse = localStorage.getItem('code_caisse');
        const soldeCaisse = localStorage.getItem('solde_caisse');
        
        console.log('📋 localStorage CaisseForm:', {
          guichet_session_id: guichetSessionId,
          guichet_id: guichetId,
          code_guichet: codeGuichet,
          caisse_session_id: caisseSessionId,
          caisse_id: caisseId,
          code_caisse: codeCaisse,
          solde_caisse: soldeCaisse
        });
        
        if (guichetSessionId && guichetId) {
          setGuichetSessionId(guichetSessionId);
          setGuichetId(guichetId);
          setCodeGuichet(codeGuichet || '');
          
          setFormDataOuverture(prev => ({
            ...prev,
            guichet_session_id: guichetSessionId
          }));
          
          // Charger les caisses du guichet
          await loadCaisses(parseInt(guichetId));
          
          // Si une caisse est déjà ouverte
          if (caisseSessionId && caisseId && codeCaisse) {
            console.log('✅ Caisse déjà ouverte:', { caisseSessionId, caisseId, codeCaisse });
            
            setCaisseState({
              isOpen: true,
              sessionId: parseInt(caisseSessionId),
              caisseId: parseInt(caisseId),
              soldeOuverture: soldeCaisse ? parseFloat(soldeCaisse) : undefined
            });
            
            // Trouver la caisse correspondante
            const caisse = caisses.find(c => c.id.toString() === caisseId);
            
            setFormDataFermeture({
              caisse_session_id: caisseSessionId,
              caisse_id: caisseId,
              code_caisse: codeCaisse || (caisse ? caisse.code : ''),
              solde_fermeture: soldeCaisse ? parseFloat(soldeCaisse) : 0,
              solde_ouverture: soldeCaisse ? parseFloat(soldeCaisse) : 0
            });
            
            setOperation('FE');
          } else {
            setOperation('OU');
          }
        } else {
          showSnackbar('Aucun guichet ouvert. Ouvrez d\'abord un guichet.', 'warning');
        }

      } catch (error: any) {
        console.error('❌ Erreur initialisation:', error);
      } finally {
        setLoadingCaisses(false);
      }
    };

    init();
  }, []);

  // Charger les caisses du guichet
  const loadCaisses = async (guichetId: number) => {
    try {
      setLoadingCaisses(true);
      console.log(`🔄 Chargement des caisses pour guichet ID: ${guichetId}`);
      
      const data = await caisseService.getCaisses();
      console.log('📦 Réponse API caisses:', data);
      
      // Gestion des différents formats de réponse
      let caissesArray: Caisse[] = [];
      
      if (Array.isArray(data)) {
        caissesArray = data;
      } else if (data && typeof data === 'object') {
        if (data.statut === 'success' && Array.isArray(data.data)) {
          caissesArray = data.data;
        } else if (Array.isArray(data)) {
          caissesArray = data;
        } else if (data.id) { // Si c'est un objet unique
          caissesArray = [data];
        } else if (data.data && Array.isArray(data.data)) {
          caissesArray = data.data;
        }
      }
      
      console.log('✅ Caisses chargées:', caissesArray);
      setCaisses(caissesArray);
      
    } catch (error: any) {
      console.error('❌ Erreur chargement caisses:', error);
      showSnackbar('Erreur lors du chargement des caisses', 'error');
      setCaisses([]);
    } finally {
      setLoadingCaisses(false);
    }
  };

  // Récupérer le solde informatique quand la caisse change (ouverture)
  useEffect(() => {
    if (formDataOuverture.caisse_id && formDataOuverture.caisse_id !== '' && operation === 'OU') {
      const caisseId = parseInt(formDataOuverture.caisse_id);
      fetchSoldeInformatique(caisseId);
    } else {
      setSoldeInfo(null);
    }
  }, [formDataOuverture.caisse_id, operation]);

  // Calculer le billetage (ouverture seulement)
  useEffect(() => {
    if (operation === 'OU') {
      calculateBilletage();
    }
  }, [billets, formDataOuverture.solde_saisi]);

  const fetchSoldeInformatique = async (caisseId: number) => {
    if (!caisseId) return;
    
    setLoadingSolde(true);
    try {
      console.log(`🔍 Récupération solde informatique pour caisse ID: ${caisseId}`);
      
      const response = await sessionService.getSoldeInformatique(caisseId);
      console.log('📦 Réponse solde informatique:', response);
      
      if (response) {
        const montant = response.data?.solde_actuel || 
                        response.data?.montant || 
                        response.solde_actuel || 
                        0;
        
        setSoldeInfo({
          montant: montant,
          disponible: true
        });
        
        console.log(`✅ Solde informatique: ${formatCurrency(montant)} FCFA`);
        
        // Pré-remplir le solde saisi avec le solde informatique
        if (montant > 0) {
          setFormDataOuverture(prev => ({
            ...prev,
            solde_saisi: montant
          }));
        }
        
        if (montant === 0) {
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
        guichet_session_id: guichetSessionId,
        caisse_id: '',
        solde_saisi: 0
      }));
      resetBilletage();
    }
  };

  const handleOuvertureChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (name === 'caisse_id') {
      setFormDataOuverture(prev => ({ ...prev, [name]: value as string }));
    } else if (name === 'solde_saisi') {
      const numValue = parseFloat(value as string);
      if (!isNaN(numValue) && numValue >= 0) {
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
      if (!isNaN(numValue) && numValue >= 0) {
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
    setTotalBilletage(0);
    setDifference(0);
    setValidationMessage('');
  };

  const handleOpenBilletageDialog = () => {
    if (operation === 'OU') {
      if (formDataOuverture.solde_saisi === undefined || formDataOuverture.solde_saisi < 0) {
        showSnackbar('Veuillez d\'abord saisir un solde valide', 'warning');
        return;
      }
    } else {
      if (formDataFermeture.solde_fermeture === undefined || formDataFermeture.solde_fermeture < 0) {
        showSnackbar('Veuillez d\'abord saisir un solde valide', 'warning');
        return;
      }
    }
    setBilletageDialogOpen(true);
  };

  const handleCloseBilletageDialog = () => {
    setBilletageDialogOpen(false);
  };

  const handleOpenBilanDialog = async () => {
    if (!formDataFermeture.caisse_session_id) {
      showSnackbar('Session caisse manquante', 'error');
      return;
    }

    setLoadingBilan(true);
    try {
      const response = await sessionService.getBilanCaisse(parseInt(formDataFermeture.caisse_session_id));
      console.log('📊 Bilan récupéré:', response);
      
      // Gérer différents formats de réponse
      const bilan = response.data?.data || response.data || response;
      setBilanData(bilan);
      setBilanDialogOpen(true);
    } catch (error: any) {
      console.error('❌ Erreur récupération bilan:', error);
      showSnackbar('Erreur lors du calcul du bilan', 'error');
    } finally {
      setLoadingBilan(false);
    }
  };

  const handleCloseBilanDialog = () => {
    setBilanDialogOpen(false);
    setBilanData(null);
  };

  const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'success') => {
    console.log(`📢 Snackbar ${severity}: ${message}`);
    setSnackbar({ open: true, message, severity });
  };

  const prepareBilletageForApi = (): Record<string, number> => {
    const billetage: Record<string, number> = {};
    
    billets.forEach(billet => {
      if (billet.quantite > 0) {
        billetage[billet.codeApi] = billet.quantite;
      }
    });
    
    console.log('📦 Billetage formaté pour API:', billetage);
    return billetage;
  };

  const suggestBilletage = () => {
    const solde = operation === 'OU' ? formDataOuverture.solde_saisi : formDataFermeture.solde_fermeture;
    
    if (solde === undefined || solde < 0) return;
    
    if (solde === 0) {
      resetBilletage();
      showSnackbar('Billetage réinitialisé', 'info');
      return;
    }
    
    let remaining = Math.floor(solde);
    const newBillets = [...billets];
    
    // Réinitialiser
    newBillets.forEach(billet => {
      billet.quantite = 0;
      billet.total = 0;
    });
    
    // Trier par valeur décroissante
    const sortedBillets = [...newBillets]
      .filter(b => b.type === 'BILLET') // Commencer par les billets
      .sort((a, b) => b.valeur - a.valeur);
    
    // Distribuer les billets
    for (const billet of sortedBillets) {
      if (remaining >= billet.valeur && billet.valeur > 0) {
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
    
    // Si il reste de la monnaie, utiliser les pièces
    if (remaining > 0) {
      const pieces = [...newBillets]
        .filter(b => b.type === 'PIECE')
        .sort((a, b) => b.valeur - a.valeur);
      
      for (const piece of pieces) {
        if (remaining >= piece.valeur && piece.valeur > 0) {
          const quantite = Math.floor(remaining / piece.valeur);
          if (quantite > 0) {
            const index = newBillets.findIndex(b => b.id === piece.id);
            if (index !== -1) {
              newBillets[index].quantite = quantite;
              newBillets[index].total = quantite * piece.valeur;
              remaining -= quantite * piece.valeur;
            }
          }
        }
      }
    }
    
    setBillets(newBillets);
    showSnackbar('Billetage suggéré', 'info');
  };

  const handleOpenCaisse = async (): Promise<ApiResponse> => {
    const billetage = prepareBilletageForApi();
    const sessionIdNum = parseInt(guichetSessionId);
    const caisseIdNum = parseInt(formDataOuverture.caisse_id);
    const soldeNum = parseFloat(formDataOuverture.solde_saisi.toString());
    
    console.log('📤 Données ouverture caisse:', {
      guichet_session_id: sessionIdNum,
      caisse_id: caisseIdNum,
      solde_saisi: soldeNum,
      billetage: billetage
    });
    
    try {
      const response = await sessionService.ouvrirCaisse(
        sessionIdNum,
        caisseIdNum,
        billetage,
        soldeNum
      );

      console.log('✅ Réponse API ouverture caisse:', response);
      
      return {
        statut: 'success',
        message: response.data?.message || 'Caisse ouverte avec succès !',
        data: response.data?.data || response.data
      };
      
    } catch (err: any) {
      console.error('❌ Erreur API ouverture caisse:', err);
      
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

  const handleCloseCaisse = async (): Promise<ApiResponse> => {
    const sessionIdNum = parseInt(formDataFermeture.caisse_session_id);
    const billetageFermeture = prepareBilletageForApi();
    
    console.log('📤 Données fermeture caisse:', {
      caisse_session_id: sessionIdNum,
      solde_fermeture: formDataFermeture.solde_fermeture,
      billetage: billetageFermeture
    });

    try {
      const response = await sessionService.fermerCaisse(
        sessionIdNum,
        formDataFermeture.solde_fermeture,
        billetageFermeture
      );
      
      console.log('✅ Réponse API fermeture caisse:', response);
      
      return {
        statut: 'success',
        message: response.data?.message || 'Caisse fermée avec succès !',
        data: response.data
      };
      
    } catch (err: any) {
      console.error('❌ Erreur API fermeture caisse:', err);
      
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

  const processOuvertureResponse = (responseData: ApiResponse) => {
    console.log('🔄 Traitement réponse ouverture:', responseData);
    
    if (responseData.statut !== 'success') {
      showSnackbar(responseData.message || 'Erreur lors de l\'ouverture', 'error');
      return false;
    }
    
    console.log('✅ Ouverture réussie:', responseData.message);
    showSnackbar(responseData.message || 'Caisse ouverte avec succès !', 'success');
    
    // Extraire les données
    const caisseSessionId = responseData.data?.caisse_session_id;
    const codeCaisse = responseData.data?.code_caisse;
    
    // Trouver la caisse sélectionnée
    const selectedCaisse = caisses.find(c => c.id.toString() === formDataOuverture.caisse_id);
    
    if (caisseSessionId && selectedCaisse) {
      console.log('💾 Stockage caisse dans localStorage:', {
        caisse_session_id: caisseSessionId,
        caisse_id: selectedCaisse.id,
        code_caisse: codeCaisse || selectedCaisse.code,
        solde_caisse: formDataOuverture.solde_saisi
      });
      
      localStorage.setItem('caisse_session_id', caisseSessionId.toString());
      localStorage.setItem('caisse_id', selectedCaisse.id.toString());
      localStorage.setItem('code_caisse', codeCaisse || selectedCaisse.code);
      localStorage.setItem('solde_caisse', formDataOuverture.solde_saisi.toString());
      
      setCaisseState({
        isOpen: true,
        sessionId: caisseSessionId,
        caisseId: selectedCaisse.id,
        soldeOuverture: formDataOuverture.solde_saisi
      });
      
      setFormDataFermeture({
        caisse_session_id: caisseSessionId.toString(),
        caisse_id: selectedCaisse.id.toString(),
        code_caisse: codeCaisse || selectedCaisse.code,
        solde_fermeture: formDataOuverture.solde_saisi,
        solde_ouverture: formDataOuverture.solde_saisi
      });
      
      setOperation('FE');
      setBilletageDialogOpen(false);
      resetBilletage();
      
      return true;
    }
    
    return false;
  };

  const processFermetureResponse = (responseData: ApiResponse) => {
    console.log('🔄 Traitement réponse fermeture:', responseData);
    
    if (responseData.statut !== 'success') {
      showSnackbar(responseData.message || 'Erreur lors de la fermeture', 'error');
      return false;
    }
    
    console.log('✅ Fermeture réussie:', responseData.message);
    showSnackbar(responseData.message || 'Caisse fermée avec succès !', 'success');
    
    // Réinitialiser
    setCaisseState({ isOpen: false });
    
    // Nettoyage localStorage
    localStorage.removeItem('caisse_session_id');
    localStorage.removeItem('caisse_id');
    localStorage.removeItem('code_caisse');
    localStorage.removeItem('solde_caisse');

    setOperation('OU');
    
    // Reset formulaire ouverture
    setFormDataOuverture({
      guichet_session_id: guichetSessionId,
      caisse_id: '',
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

    if (!formDataOuverture.caisse_id) {
      showSnackbar('Veuillez sélectionner une caisse.', 'error');
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
      if (!formDataOuverture.caisse_id) return true;
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
              {loadingCaisses ? (
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
                    Session ID: {guichetSessionId} | Guichet ID: {guichetId}
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
                      <Grid item xs={12}>
                        <FormControl fullWidth size="small" required>
                          <InputLabel>Caisse *</InputLabel>
                          <Select
                            name="caisse_id"
                            value={formDataOuverture.caisse_id}
                            onChange={handleOuvertureChange}
                            label="Caisse *"
                            required
                            disabled={loadingCaisses}
                          >
                            <MenuItem value=""><em>Sélectionner une caisse</em></MenuItem>
                            {caisses.length > 0 ? (
                              caisses.map((caisse) => (
                                <MenuItem key={caisse.id} value={caisse.id}>
                                  {caisse.libelle || caisse.code_caisse} ({caisse.code_caisse})
                                  {caisse.solde_actuel > 0 && ` - Solde: ${formatCurrency(caisse.solde_actuel)} FCFA`}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem value="" disabled>
                                {loadingCaisses ? 'Chargement...' : 'Aucune caisse disponible'}
                              </MenuItem>
                            )}
                          </Select>
                          {loadingCaisses && (
                            <CircularProgress size={20} sx={{ position: 'absolute', right: 40, top: '50%' }} />
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Solde d'ouverture *"
                              name="solde_saisi"
                              value={formDataOuverture.solde_saisi === 0 ? "" : formDataOuverture.solde_saisi || ''}
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
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CalculateIcon />}
                            onClick={handleOpenBilanDialog}
                            sx={{ mt: 1 }}
                            disabled={loadingBilan}
                          >
                            {loadingBilan ? 'Calcul en cours...' : 'Voir le bilan'}
                          </Button>
                        </Alert>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Solde de fermeture *"
                          name="solde_fermeture"
                          value={formDataFermeture.solde_fermeture === 0 ? "" : formDataFermeture.solde_fermeture || ''}
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

                      <Grid item xs={12}>
                        <Alert severity="info">
                          <Typography variant="body2">
                            💡 <strong>Note importante:</strong> N'oubliez pas de saisir également le billetage de fermeture.
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleOpenBilletageDialog}
                            sx={{ mt: 1 }}
                          >
                            Saisir le billetage de fermeture
                          </Button>
                        </Alert>
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
                      • Guichet ID: {localStorage.getItem('guichet_id') || 'Non défini'}<br/>
                      • Caisse Session ID: {localStorage.getItem('caisse_session_id') || 'Non défini'}<br/>
                      • Caisse ID: {localStorage.getItem('caisse_id') || 'Non défini'}<br/>
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

      {/* Dialog Billetage */}
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
                {operation === 'OU' ? 'Billetage d\'ouverture' : 'Billetage de fermeture'} - 
                Solde à billeter: {formatCurrency(
                  operation === 'OU' ? formDataOuverture.solde_saisi : formDataFermeture.solde_fermeture
                )} FCFA
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
                    {formatCurrency(
                      operation === 'OU' ? formDataOuverture.solde_saisi : formDataFermeture.solde_fermeture
                    )} FCFA
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
                disabled={
                  operation === 'OU' 
                    ? formDataOuverture.solde_saisi === 0
                    : formDataFermeture.solde_fermeture === 0
                }
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

      {/* Dialog Bilan */}
      <Dialog 
        open={bilanDialogOpen} 
        onClose={handleCloseBilanDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Bilan de Caisse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Caisse: {formDataFermeture.code_caisse}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseBilanDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {loadingBilan ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : bilanData ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert 
                  severity={bilanData.ecart === 0 ? "success" : "warning"}
                  icon={bilanData.ecart === 0 ? <CheckCircleIcon /> : <WarningIcon />}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {bilanData.ecart === 0 ? '✅ Caisse Équilibrée' : '⚠️ Écart Détecté'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {bilanData.ecart === 0 
                      ? 'La caisse est parfaitement équilibrée.' 
                      : `Il y a un écart de ${formatCurrency(Math.abs(bilanData.ecart))} FCFA.`}
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                    Ouverture
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {formatCurrency(bilanData.ouverture || bilanData.solde_ouverture || 0)} FCFA
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="secondary" sx={{ mb: 2 }}>
                    Total Entrées
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="secondary">
                    {formatCurrency(bilanData.total_entrees || 0)} FCFA
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="error" sx={{ mb: 2 }}>
                    Total Sorties
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error">
                    {formatCurrency(bilanData.total_sorties || 0)} FCFA
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: '8px', bgcolor: '#f8fafc' }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Solde Théorique
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(bilanData.solde_theorique || 0)} FCFA
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, border: '2px solid', 
                  borderColor: (bilanData.ecart || 0) === 0 ? '#10B981' : '#EF4444',
                  borderRadius: '8px'
                }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Écart
                  </Typography>
                  <Typography 
                    variant="h3" 
                    fontWeight="bold"
                    sx={{ 
                      color: (bilanData.ecart || 0) === 0 ? '#10B981' : '#EF4444'
                    }}
                  >
                    {formatCurrency(bilanData.ecart || 0)} FCFA
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Solde Réel
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(bilanData.solde_reel || 0)} FCFA
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="error">
              <Typography variant="body1">
                Impossible de calculer le bilan
              </Typography>
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseBilanDialog} variant="contained">
            Fermer
          </Button>
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