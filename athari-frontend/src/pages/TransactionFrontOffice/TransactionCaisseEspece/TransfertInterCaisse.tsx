import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  styled,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton,
  Tooltip,
  Divider,
  Avatar,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Fade,
  Zoom,
} from '@mui/material';
import {
  CheckCircle,
  AccountBalance,
  SwapHoriz,
  AccountBalanceWallet,
  MonetizationOn,
  ArrowForward,
  CompareArrows,
  History,
  Print,
  Download,
  Refresh,
  Help,
  Info,
  Warning,
  Close,
  Keyboard,
  LocalAtm,
  CurrencyExchange,
  Lock,
  LockOpen,
  Speed,
  TrendingUp,
} from '@mui/icons-material';

// --- IMPORT DES COMPOSANTS DE LAYOUT ---
import Sidebar from '../../../components/layout/Sidebar';
import TopBar from '../../../components/layout/TopBar';

// --- INTERFACES ---
interface Caisse {
  id: number;
  code: string;
  nom: string;
  type: 'PRINCIPALE' | 'SECONDAIRE';
  devise: string;
  solde: number;
  statut: 'OUVERTE' | 'FERMEE' | 'EN_OPERATION';
}

interface TransfertFormData {
  // Informations de base
  agenceCode: string;
  agenceNom: string;
  guichet: string;
  devise: string;
  
  // Caisses
  caisseProvenance: string;
  caisseDestination: string;
  
  // Transfert
  montant: string;
  
  // Calculs
  nouveauSoldeProvenance: string;
  nouveauSoldeDestination: string;
}

interface TransfertHistory {
  id: number;
  date: string;
  montant: number;
  devise: string;
  caisseSource: string;
  caisseDestination: string;
  statut: 'REUSSI' | 'ECHOUE' | 'EN_COURS';
  reference: string;
  operateur: string;
}

// --- COMPOSANTS STYLISÉS ---
const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
  color: 'white',
  fontWeight: 600,
  padding: '10px 24px',
  borderRadius: 8,
  textTransform: 'none',
  fontSize: '0.875rem',
  '&:hover': {
    background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #BDBDBD 0%, #9E9E9E 100%)',
    color: '#757575',
  },
});

const SuccessButton = styled(Button)({
  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
  color: 'white',
  fontWeight: 600,
  padding: '10px 24px',
  borderRadius: 8,
  textTransform: 'none',
  fontSize: '0.875rem',
  '&:hover': {
    background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)',
  },
});

const SecondaryButton = styled(Button)({
  background: 'linear-gradient(135deg, #F5F7FA 0%, #E4E7EB 100%)',
  color: '#424242',
  fontWeight: 600,
  padding: '10px 20px',
  borderRadius: 8,
  border: '1px solid #E0E0E0',
  textTransform: 'none',
  fontSize: '0.875rem',
  '&:hover': {
    background: 'linear-gradient(135deg, #E4E7EB 0%, #CBD2D9 100%)',
    border: '1px solid #BDBDBD',
  },
});

const TransferCard = styled(Card)({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: '2px solid #E3F2FD',
  borderRadius: 12,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#1976D2',
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(25, 118, 210, 0.15)',
  },
});

const StatCard = styled(Card)({
  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
  border: '1px solid #E0E0E0',
  borderRadius: 10,
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
});

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f0f7ff',
  borderRadius: 8,
  padding: '12px 16px',
  border: '1px solid #bbdefb',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
  },
}));

// --- FONCTIONS UTILITAIRES ---
const formatCurrency = (value: string | number, devise: string = 'FCFA') => {
  const num = typeof value === 'string' ? parseFloat(value || '0') : value;
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + ` ${devise}`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const getCaisseStatusIcon = (statut: string) => {
  switch (statut) {
    case 'OUVERTE':
      return <LockOpen color="success" />;
    case 'FERMEE':
      return <Lock color="error" />;
    case 'EN_OPERATION':
      return <Speed color="warning" />;
    default:
      return <Info />;
  }
};

const getCaisseStatusColor = (statut: string) => {
  switch (statut) {
    case 'OUVERTE':
      return '#4CAF50';
    case 'FERMEE':
      return '#F44336';
    case 'EN_OPERATION':
      return '#FF9800';
    default:
      return '#757575';
  }
};

const getTransferStatusChip = (statut: string) => {
  switch (statut) {
    case 'REUSSI':
      return <Chip size="small" label="Réussi" color="success" icon={<CheckCircle />} />;
    case 'ECHOUE':
      return <Chip size="small" label="Échoué" color="error" icon={<Close />} />;
    case 'EN_COURS':
      return <Chip size="small" label="En cours" color="warning" icon={<CompareArrows />} />;
    default:
      return null;
  }
};

const TransfertInterCaisse = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [transferInProgress, setTransferInProgress] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  
  // Données simulées
  const [caisses, setCaisses] = useState<Caisse[]>([
    { id: 1, code: 'C001', nom: 'Caisse Principale', type: 'PRINCIPALE', devise: 'FCFA', solde: 25000000, statut: 'OUVERTE' },
    { id: 2, code: 'C002', nom: 'Caisse Guichet 1', type: 'SECONDAIRE', devise: 'FCFA', solde: 5000000, statut: 'OUVERTE' },
    { id: 3, code: 'C003', nom: 'Caisse Guichet 2', type: 'SECONDAIRE', devise: 'FCFA', solde: 7500000, statut: 'EN_OPERATION' },
    { id: 4, code: 'C004', nom: 'Caisse Service Client', type: 'SECONDAIRE', devise: 'FCFA', solde: 3000000, statut: 'FERMEE' },
    { id: 5, code: 'C005', nom: 'Caisse Devises', type: 'SECONDAIRE', devise: 'EUR', solde: 50000, statut: 'OUVERTE' },
  ]);

  const [transfertHistory, setTransfertHistory] = useState<TransfertHistory[]>([
    { id: 1, date: '2024-01-15T09:30:00', montant: 2000000, devise: 'FCFA', caisseSource: 'C001', caisseDestination: 'C002', statut: 'REUSSI', reference: 'TRF-001', operateur: 'JDOE' },
    { id: 2, date: '2024-01-15T14:45:00', montant: 1000000, devise: 'FCFA', caisseSource: 'C002', caisseDestination: 'C003', statut: 'REUSSI', reference: 'TRF-002', operateur: 'JDOE' },
    { id: 3, date: '2024-01-16T10:15:00', montant: 5000000, devise: 'FCFA', caisseSource: 'C001', caisseDestination: 'C003', statut: 'EN_COURS', reference: 'TRF-003', operateur: 'JDOE' },
    { id: 4, date: '2024-01-16T11:20:00', montant: 3000000, devise: 'FCFA', caisseSource: 'C002', caisseDestination: 'C001', statut: 'ECHOUE', reference: 'TRF-004', operateur: 'JDOE' },
  ]);

  const [formData, setFormData] = useState<TransfertFormData>({
    // Informations de base
    agenceCode: 'AG001',
    agenceNom: 'Agence Principale',
    guichet: 'G001',
    devise: 'FCFA',
    
    // Caisses
    caisseProvenance: '',
    caisseDestination: '',
    
    // Transfert
    montant: '',
    
    // Calculs
    nouveauSoldeProvenance: '0',
    nouveauSoldeDestination: '0',
  });

  // Récupérer les détails des caisses sélectionnées
  const caisseProvenance = caisses.find(c => c.code === formData.caisseProvenance);
  const caisseDestination = caisses.find(c => c.code === formData.caisseDestination);

  // Effet pour calculer les nouveaux soldes
  useEffect(() => {
    const montant = parseFloat(formData.montant || '0');
    
    if (caisseProvenance) {
      const nouveauSoldeProvenance = caisseProvenance.solde - montant;
      setFormData(prev => ({
        ...prev,
        nouveauSoldeProvenance: nouveauSoldeProvenance.toString(),
      }));
    }
    
    if (caisseDestination) {
      const nouveauSoldeDestination = caisseDestination.solde + montant;
      setFormData(prev => ({
        ...prev,
        nouveauSoldeDestination: nouveauSoldeDestination.toString(),
      }));
    }
  }, [formData.montant, caisseProvenance, caisseDestination]);

  // Gestion des changements de formulaire
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fonction pour échanger les caisses
  const swapCaisses = () => {
    setFormData(prev => ({
      ...prev,
      caisseProvenance: prev.caisseDestination,
      caisseDestination: prev.caisseProvenance,
    }));
  };

  // Gestion du raccourci clavier F4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F4') {
        e.preventDefault();
        handleValidate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Validation du formulaire
  const handleValidate = () => {
    // Validation des champs obligatoires
    if (!formData.caisseProvenance || !formData.caisseDestination) {
      showSnackbar('Veuillez sélectionner les caisses de provenance et destination', 'error');
      return;
    }
    
    if (formData.caisseProvenance === formData.caisseDestination) {
      showSnackbar('Les caisses de provenance et destination doivent être différentes', 'error');
      return;
    }
    
    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      showSnackbar('Le montant doit être supérieur à 0', 'error');
      return;
    }
    
    // Vérifier que les caisses sont ouvertes
    if (caisseProvenance?.statut !== 'OUVERTE' && caisseProvenance?.statut !== 'EN_OPERATION') {
      showSnackbar(`La caisse ${formData.caisseProvenance} n'est pas ouverte`, 'error');
      return;
    }
    
    if (caisseDestination?.statut !== 'OUVERTE' && caisseDestination?.statut !== 'EN_OPERATION') {
      showSnackbar(`La caisse ${formData.caisseDestination} n'est pas ouverte`, 'error');
      return;
    }
    
    // Vérifier que les devises correspondent
    if (caisseProvenance?.devise !== caisseDestination?.devise) {
      showSnackbar('Les deux caisses doivent avoir la même devise', 'error');
      return;
    }
    
    // Vérifier le solde suffisant
    if (caisseProvenance && parseFloat(formData.montant) > caisseProvenance.solde) {
      showSnackbar('Solde insuffisant dans la caisse de provenance', 'error');
      return;
    }

    setConfirmationDialogOpen(true);
  };

  // Confirmer le transfert
  const handleConfirmTransfer = () => {
    if (confirmationInput.toUpperCase() !== 'OUI') {
      showSnackbar('Veuillez saisir "OUI" pour confirmer', 'error');
      return;
    }

    setConfirmationDialogOpen(false);
    setTransferInProgress(true);

    // Simulation du transfert
    setTimeout(() => {
      // Mettre à jour les soldes des caisses
      setCaisses(prev => prev.map(caisse => {
        if (caisse.code === formData.caisseProvenance) {
          return {
            ...caisse,
            solde: caisse.solde - parseFloat(formData.montant),
          };
        }
        if (caisse.code === formData.caisseDestination) {
          return {
            ...caisse,
            solde: caisse.solde + parseFloat(formData.montant),
          };
        }
        return caisse;
      }));

      // Ajouter à l'historique
      const newTransfer: TransfertHistory = {
        id: transfertHistory.length + 1,
        date: new Date().toISOString(),
        montant: parseFloat(formData.montant),
        devise: formData.devise,
        caisseSource: formData.caisseProvenance,
        caisseDestination: formData.caisseDestination,
        statut: 'REUSSI',
        reference: `TRF-${String(transfertHistory.length + 1).padStart(3, '0')}`,
        operateur: 'OP001',
      };

      setTransfertHistory(prev => [newTransfer, ...prev]);

      // Réinitialiser le formulaire
      setFormData({
        ...formData,
        montant: '',
        caisseProvenance: '',
        caisseDestination: '',
        nouveauSoldeProvenance: '0',
        nouveauSoldeDestination: '0',
      });

      setConfirmationInput('');
      setTransferInProgress(false);

      showSnackbar(
        `Transfert de ${formatCurrency(formData.montant)} réussi !`,
        'success'
      );
    }, 2000);
  };

  // Annuler le transfert
  const handleCancel = () => {
    setConfirmationDialogOpen(false);
    setConfirmationInput('');
    showSnackbar('Transfert annulé', 'info');
  };

  // Réinitialiser le formulaire
  const handleReset = () => {
    if (window.confirm('Réinitialiser le formulaire ?')) {
      setFormData({
        ...formData,
        caisseProvenance: '',
        caisseDestination: '',
        montant: '',
        nouveauSoldeProvenance: '0',
        nouveauSoldeDestination: '0',
      });
      showSnackbar('Formulaire réinitialisé', 'info');
    }
  };

  // Imprimer le reçu
  const handlePrint = () => {
    showSnackbar('Impression du reçu en cours...', 'info');
    setTimeout(() => {
      showSnackbar('Reçu imprimé avec succès', 'success');
    }, 1500);
  };

  // Exporter l'historique
  const handleExport = () => {
    showSnackbar('Exportation de l\'historique...', 'info');
    setTimeout(() => {
      showSnackbar('Historique exporté avec succès', 'success');
    }, 1500);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: `calc(100% - ${sidebarOpen ? '260px' : '80px'})`,
          transition: 'width 0.3s ease',
        }}
      >
        <TopBar sidebarOpen={sidebarOpen} />

        {/* Zone de travail */}
        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>
              Transfert Inter Caisse
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Transfert de fonds entre caisses de la même agence - Turbobank
            </Typography>
          </Box>

          {/* Statistiques des caisses */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <StatCard>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ bgcolor: '#E3F2FD', color: '#1976D2', width: 40, height: 40 }}>
                      <AccountBalanceWallet />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Caisses
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#1976D2">
                        {formatCurrency(caisses.reduce((sum, c) => sum + c.solde, 0))}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {caisses.length} caisses actives
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <StatCard>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ bgcolor: '#FFF3E0', color: '#F57C00', width: 40, height: 40 }}>
                      <SwapHoriz />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Transferts Aujourd'hui
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#F57C00">
                        {transfertHistory.filter(t => 
                          new Date(t.date).toDateString() === new Date().toDateString()
                        ).length}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(
                      transfertHistory.filter(t => 
                        new Date(t.date).toDateString() === new Date().toDateString() && 
                        t.statut === 'REUSSI'
                      ).reduce((sum, t) => sum + t.montant, 0)
                    )}
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <StatCard>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', width: 40, height: 40 }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Taux de Réussite
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#2E7D32">
                        {transfertHistory.length > 0 
                          ? Math.round((transfertHistory.filter(t => t.statut === 'REUSSI').length / transfertHistory.length) * 100)
                          : 100}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Transferts réussis
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <StatCard>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ bgcolor: '#FCE4EC', color: '#C2185B', width: 40, height: 40 }}>
                      <CurrencyExchange />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Devises Actives
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#C2185B">
                        {Array.from(new Set(caisses.map(c => c.devise))).length}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    FCFA, EUR, USD
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Formulaire principal */}
          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden', mb: 3 }}>
            <Box sx={{ p: 3, bgcolor: '#1976D2', color: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SwapHoriz /> Nouveau Transfert Inter Caisse
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Transfert de fonds entre caisses de la même agence
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              {/* Informations de base */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                  <InfoBox>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Code Agence
                    </Typography>
                    <Typography variant="body2" fontWeight={500} color="#1976D2">
                      {formData.agenceCode}
                    </Typography>
                  </InfoBox>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <InfoBox>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Agence
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formData.agenceNom}
                    </Typography>
                  </InfoBox>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Guichet"
                    name="guichet"
                    value={formData.guichet}
                    onChange={handleChange}
                    placeholder="Code guichet"
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Devise</InputLabel>
                    <Select
                      name="devise"
                      value={formData.devise}
                      label="Devise"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="FCFA">FCFA</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Section de transfert */}
              <TransferCard sx={{ mb: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 3, color: '#1976D2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CompareArrows /> Sélection des Caisses
                  </Typography>

                  <Grid container spacing={3} alignItems="center">
                    {/* Caisse de provenance */}
                    <Grid item xs={12} md={5}>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: '#D32F2F', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ArrowForward sx={{ transform: 'rotate(180deg)' }} /> Caisse de Provenance
                        </Typography>
                        <FormControl fullWidth size="small" required>
                          <InputLabel>Sélectionner la caisse source</InputLabel>
                          <Select
                            name="caisseProvenance"
                            value={formData.caisseProvenance}
                            label="Sélectionner la caisse source"
                            onChange={handleSelectChange}
                          >
                            <MenuItem value="">
                              <em>Sélectionner une caisse</em>
                            </MenuItem>
                            {caisses
                              .filter(c => c.devise === formData.devise)
                              .map((caisse) => (
                                <MenuItem key={caisse.id} value={caisse.code}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getCaisseStatusIcon(caisse.statut)}
                                    <Box>
                                      <Typography variant="body2">{caisse.code} - {caisse.nom}</Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatCurrency(caisse.solde)} • {caisse.type}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                        
                        {caisseProvenance && (
                          <Fade in={true}>
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#FFEBEE', borderRadius: 2 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Solde actuel:
                              </Typography>
                              <Typography variant="h6" color="#D32F2F" fontWeight={700}>
                                {formatCurrency(caisseProvenance.solde)}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Statut:
                                </Typography>
                                <Chip
                                  size="small"
                                  label={caisseProvenance.statut}
                                  sx={{ 
                                    backgroundColor: `${getCaisseStatusColor(caisseProvenance.statut)}15`,
                                    color: getCaisseStatusColor(caisseProvenance.statut),
                                  }}
                                  icon={getCaisseStatusIcon(caisseProvenance.statut)}
                                />
                              </Box>
                            </Box>
                          </Fade>
                        )}
                      </Box>
                    </Grid>

                    {/* Bouton d'échange */}
                    <Grid item xs={12} md={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="Échanger les caisses">
                          <IconButton
                            onClick={swapCaisses}
                            sx={{
                              bgcolor: '#1976D2',
                              color: 'white',
                              width: 56,
                              height: 56,
                              '&:hover': {
                                bgcolor: '#1565C0',
                              },
                            }}
                          >
                            <SwapHoriz />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
                        Échanger
                      </Typography>
                    </Grid>

                    {/* Caisse destination */}
                    <Grid item xs={12} md={5}>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: '#2E7D32', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ArrowForward /> Caisse Destination
                        </Typography>
                        <FormControl fullWidth size="small" required>
                          <InputLabel>Sélectionner la caisse destination</InputLabel>
                          <Select
                            name="caisseDestination"
                            value={formData.caisseDestination}
                            label="Sélectionner la caisse destination"
                            onChange={handleSelectChange}
                          >
                            <MenuItem value="">
                              <em>Sélectionner une caisse</em>
                            </MenuItem>
                            {caisses
                              .filter(c => c.devise === formData.devise && c.code !== formData.caisseProvenance)
                              .map((caisse) => (
                                <MenuItem key={caisse.id} value={caisse.code}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getCaisseStatusIcon(caisse.statut)}
                                    <Box>
                                      <Typography variant="body2">{caisse.code} - {caisse.nom}</Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatCurrency(caisse.solde)} • {caisse.type}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                        
                        {caisseDestination && (
                          <Fade in={true}>
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#E8F5E9', borderRadius: 2 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Solde actuel:
                              </Typography>
                              <Typography variant="h6" color="#2E7D32" fontWeight={700}>
                                {formatCurrency(caisseDestination.solde)}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Statut:
                                </Typography>
                                <Chip
                                  size="small"
                                  label={caisseDestination.statut}
                                  sx={{ 
                                    backgroundColor: `${getCaisseStatusColor(caisseDestination.statut)}15`,
                                    color: getCaisseStatusColor(caisseDestination.statut),
                                  }}
                                  icon={getCaisseStatusIcon(caisseDestination.statut)}
                                />
                              </Box>
                            </Box>
                          </Fade>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </TransferCard>

              {/* Montant et résumé */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                        Montant du Transfert
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        label="Montant à transférer"
                        name="montant"
                        value={formData.montant}
                        onChange={handleChange}
                        placeholder="0"
                        type="number"
                        required
                        InputProps={{
                          startAdornment: (
                            <Typography sx={{ mr: 1, color: 'text.secondary' }}>
                              {formData.devise}
                            </Typography>
                          ),
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Saisissez le montant en {formData.devise}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                        Résumé du Transfert
                      </Typography>
                      
                      {formData.caisseProvenance && formData.caisseDestination && formData.montant ? (
                        <Zoom in={true}>
                          <Box>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Caisse source:
                                </Typography>
                              </Grid>
                              <Grid item xs={6} textAlign="right">
                                <Typography variant="body2" fontWeight={600}>
                                  {formData.caisseProvenance}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Nouveau solde:
                                </Typography>
                              </Grid>
                              <Grid item xs={6} textAlign="right">
                                <Typography variant="body2" fontWeight={600} color="#D32F2F">
                                  {formatCurrency(formData.nouveauSoldeProvenance)}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                              </Grid>
                              
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Caisse destination:
                                </Typography>
                              </Grid>
                              <Grid item xs={6} textAlign="right">
                                <Typography variant="body2" fontWeight={600}>
                                  {formData.caisseDestination}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Nouveau solde:
                                </Typography>
                              </Grid>
                              <Grid item xs={6} textAlign="right">
                                <Typography variant="body2" fontWeight={600} color="#2E7D32">
                                  {formatCurrency(formData.nouveauSoldeDestination)}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                              </Grid>
                              
                              <Grid item xs={6}>
                                <Typography variant="body2" fontWeight={700}>
                                  Montant transféré:
                                </Typography>
                              </Grid>
                              <Grid item xs={6} textAlign="right">
                                <Typography variant="body2" fontWeight={700} color="#1976D2">
                                  {formatCurrency(formData.montant)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </Zoom>
                      ) : (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                          Sélectionnez les caisses et saisissez le montant pour voir le résumé
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Actions */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Réinitialiser le formulaire">
                    <IconButton onClick={handleReset} color="default" size="small">
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Raccourci clavier F4">
                    <IconButton color="default" size="small">
                      <Keyboard />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Aide">
                    <IconButton color="default" size="small">
                      <Help />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <SecondaryButton onClick={() => window.history.back()}>
                    Annuler
                  </SecondaryButton>
                  <GradientButton
                    variant="contained"
                    onClick={handleValidate}
                    startIcon={<CheckCircle />}
                    disabled={!formData.caisseProvenance || !formData.caisseDestination || !formData.montant}
                  >
                    Valider (F4)
                  </GradientButton>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Historique des transferts */}
          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 1 }}>
                <History /> Historique des Transferts
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Print />}
                  onClick={handlePrint}
                >
                  Imprimer
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download />}
                  onClick={handleExport}
                >
                  Exporter
                </Button>
              </Box>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {transfertHistory.map((transfert) => (
                    <TableRow key={transfert.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: '#E3F2FD',
                              color: '#1976D2',
                            }}
                          >
                            <SwapHoriz />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {transfert.reference}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(transfert.date)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {transfert.caisseSource} → {transfert.caisseDestination}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Opérateur: {transfert.operateur}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="#1976D2">
                          {formatCurrency(transfert.montant, transfert.devise)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getTransferStatusChip(transfert.statut)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <Info />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>

      {/* Dialog de confirmation */}
      <Dialog open={confirmationDialogOpen} onClose={() => setConfirmationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#1976D2', color: 'white' }}>
          <CheckCircle /> Confirmation de Transfert
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Confirmez le transfert inter caisse
          </Alert>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" gutterBottom fontWeight={600}>
              Détails du transfert:
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">De:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2">{formData.caisseProvenance}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Vers:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2">{formData.caisseDestination}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Montant:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2" fontWeight={600} color="#1976D2">
                  {formatCurrency(formData.montant)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="info" sx={{ borderRadius: 1 }}>
                  <Typography variant="caption">
                    Pour confirmer, saisissez <strong>"OUI"</strong> dans le champ ci-dessous
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label='Saisissez "OUI" pour confirmer'
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="OUI"
              autoFocus
              InputProps={{
                endAdornment: (
                  <Typography variant="caption" color="text.secondary">
                    Majuscules/minuscules autorisées
                  </Typography>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancel} color="inherit">
            Annuler
          </Button>
          <SuccessButton 
            onClick={handleConfirmTransfer}
            disabled={confirmationInput.toUpperCase() !== 'OUI'}
            autoFocus
          >
            Confirmer le transfert
          </SuccessButton>
        </DialogActions>
      </Dialog>

      {/* Transfert en cours */}
      {transferInProgress && (
        <Dialog open={transferInProgress} maxWidth="sm" fullWidth>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#1976D2',
                  color: 'white',
                  mb: 3,
                }}
              >
                <SwapHoriz />
              </Avatar>
              
              <Typography variant="h6" gutterBottom align="center">
                Transfert en cours...
              </Typography>
              
              <LinearProgress 
                sx={{ 
                  width: '100%', 
                  height: 8, 
                  borderRadius: 4, 
                  mb: 3,
                  backgroundColor: '#E3F2FD',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#1976D2',
                  }
                }} 
              />
              
              <Typography variant="body2" color="text.secondary" align="center">
                Transfert de {formatCurrency(formData.montant)}<br />
                de {formData.caisseProvenance} vers {formData.caisseDestination}<br />
                <Typography variant="caption" color="text.secondary">
                  Veuillez patienter pendant le traitement
                </Typography>
              </Typography>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransfertInterCaisse;