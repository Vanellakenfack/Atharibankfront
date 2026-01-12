import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
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
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Chip,
  Avatar,
} from '@mui/material';
import {
  CheckCircle,
  AccountBalance,
  ArrowUpward,
  ArrowDownward,
  MonetizationOn,
  AccountBalanceWallet,
  Description,
  Send,
  Receipt,
  TrendingUp,
  TrendingDown,
  Print,
  Download,
  History,
  Refresh,
  Help,
  Info,
  Warning,
  Close,
  Add,
  Remove,
} from '@mui/icons-material';

// --- IMPORT DES COMPOSANTS DE LAYOUT ---
import Sidebar from '../../../components/layout/Sidebar';
import TopBar from '../../../components/layout/TopBar';

// --- INTERFACES ---
interface Agence {
  id: number;
  code: string;
  name: string;
  shortName: string;
}

interface TransactionFormData {
  // Informations de base
  agenceCode: string;
  agenceName: string;
  guichet: string;
  devise: string;
  caisse: string;
  
  // Type de transaction
  isEntree: boolean;
  isAgenceTransaction: boolean;
  
  // Montant et détails
  montant: string;
  codePartenaire: string;
  libelle: string;
  refLettrage: string;
  
  // Calculs
  soldeCaisse: string;
  nouveauSolde: string;
}

interface TransactionHistory {
  id: number;
  date: string;
  type: 'ENTREE' | 'SORTIE';
  montant: number;
  devise: string;
  partenaire: string;
  libelle: string;
  statut: 'VALIDEE' | 'EN_ATTENTE' | 'ANNULEE';
  reference: string;
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

const SuccessChip = styled(Chip)({
  backgroundColor: '#E8F5E9',
  color: '#2E7D32',
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: '#2E7D32',
  },
});

const WarningChip = styled(Chip)({
  backgroundColor: '#FFF3E0',
  color: '#F57C00',
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: '#F57C00',
  },
});

const ErrorChip = styled(Chip)({
  backgroundColor: '#FFEBEE',
  color: '#D32F2F',
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: '#D32F2F',
  },
});

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  borderRadius: 8,
  padding: '12px 16px',
  border: '1px solid #dee2e6',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#e9ecef',
    borderColor: '#adb5bd',
  },
}));

const CardStat = styled(Card)({
  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
  border: '1px solid #E0E0E0',
  borderRadius: 12,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  },
});

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
  });
};

const EntreesSortiesCaisse = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [billetageDialogOpen, setBilletageDialogOpen] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [agences, setAgences] = useState<Agence[]>([
    { id: 1, code: 'AG001', name: 'Agence Principale', shortName: 'AG-PRINC' },
    { id: 2, code: 'AG002', name: 'Agence Centrale', shortName: 'AG-CENTR' },
    { id: 3, code: 'AG003', name: 'Agence Commerciale', shortName: 'AG-COM' },
  ]);
  
  // Données historiques simulées
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([
    { id: 1, date: '2024-01-15T10:30:00', type: 'ENTREE', montant: 5000000, devise: 'FCFA', partenaire: 'AG002', libelle: 'Versement espèces', statut: 'VALIDEE', reference: 'TRX-001' },
    { id: 2, date: '2024-01-15T14:45:00', type: 'SORTIE', montant: 2500000, devise: 'FCFA', partenaire: 'BANQUE-A', libelle: 'Retrait banque', statut: 'VALIDEE', reference: 'TRX-002' },
    { id: 3, date: '2024-01-16T09:15:00', type: 'ENTREE', montant: 3000000, devise: 'FCFA', partenaire: 'AG003', libelle: 'Transfert agence', statut: 'EN_ATTENTE', reference: 'TRX-003' },
    { id: 4, date: '2024-01-16T11:20:00', type: 'SORTIE', montant: 1500000, devise: 'FCFA', partenaire: 'AG001', libelle: 'Décaissement', statut: 'ANNULEE', reference: 'TRX-004' },
  ]);

  const [formData, setFormData] = useState<TransactionFormData>({
    // Informations de base
    agenceCode: 'AG001',
    agenceName: 'Agence Principale',
    guichet: 'G001',
    devise: 'FCFA',
    caisse: 'C001',
    
    // Type de transaction
    isEntree: true,
    isAgenceTransaction: true,
    
    // Montant et détails
    montant: '',
    codePartenaire: '',
    libelle: '',
    refLettrage: '',
    
    // Calculs
    soldeCaisse: '15000000',
    nouveauSolde: '15000000',
  });

  // Effet pour calculer le nouveau solde
  useEffect(() => {
    const solde = parseFloat(formData.soldeCaisse || '0');
    const montant = parseFloat(formData.montant || '0');
    
    if (formData.isEntree) {
      setFormData(prev => ({
        ...prev,
        nouveauSolde: (solde + montant).toString(),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        nouveauSolde: (solde - montant).toString(),
      }));
    }
  }, [formData.montant, formData.isEntree, formData.soldeCaisse]);

  // Gestion des changements de formulaire
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fonction pour basculer entre Entrée/Sortie
  const toggleTransactionType = () => {
    setFormData(prev => ({
      ...prev,
      isEntree: !prev.isEntree,
    }));
  };

  // Fonction pour basculer entre Agence/Banque
  const togglePartenaireType = () => {
    setFormData(prev => ({
      ...prev,
      isAgenceTransaction: !prev.isAgenceTransaction,
      codePartenaire: '', // Réinitialiser le code partenaire
    }));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Validation du formulaire
  const handleValidate = () => {
    // Validation des champs obligatoires
    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      showSnackbar('Le montant doit être supérieur à 0', 'error');
      return;
    }
    
    if (!formData.codePartenaire) {
      showSnackbar('Le code partenaire est obligatoire', 'error');
      return;
    }
    
    if (!formData.libelle) {
      showSnackbar('Le libellé est obligatoire', 'error');
      return;
    }

    setDialogOpen(true);
  };

  // Simuler le billetage
  const handleBilletage = () => {
    setDialogOpen(false);
    setBilletageDialogOpen(true);
    
    // Simulation du billetage
    setTimeout(() => {
      setBilletageDialogOpen(false);
      setConfirmationDialogOpen(true);
    }, 2000);
  };

  // Confirmer la transaction
  const handleConfirmTransaction = () => {
    // Simulation d'une transaction réussie
    setConfirmationDialogOpen(false);
    
    // Générer une nouvelle transaction pour l'historique
    const newTransaction: TransactionHistory = {
      id: transactionHistory.length + 1,
      date: new Date().toISOString(),
      type: formData.isEntree ? 'ENTREE' : 'SORTIE',
      montant: parseFloat(formData.montant),
      devise: formData.devise,
      partenaire: formData.codePartenaire,
      libelle: formData.libelle,
      statut: 'VALIDEE',
      reference: `TRX-${String(transactionHistory.length + 1).padStart(3, '0')}`,
    };
    
    // Ajouter à l'historique
    setTransactionHistory(prev => [newTransaction, ...prev]);
    
    // Mettre à jour le solde de la caisse
    setFormData(prev => ({
      ...prev,
      soldeCaisse: prev.nouveauSolde,
      montant: '',
      codePartenaire: '',
      libelle: '',
      refLettrage: '',
    }));
    
    showSnackbar(
      `Transaction ${formData.isEntree ? 'd\'entrée' : 'de sortie'} validée avec succès!`,
      'success'
    );
  };

  // Annuler la transaction
  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette transaction ?')) {
      setDialogOpen(false);
      setBilletageDialogOpen(false);
      setConfirmationDialogOpen(false);
      showSnackbar('Transaction annulée', 'info');
    }
  };

  // Réinitialiser le formulaire
  const handleReset = () => {
    if (window.confirm('Réinitialiser le formulaire ?')) {
      setFormData({
        ...formData,
        montant: '',
        codePartenaire: '',
        libelle: '',
        refLettrage: '',
      });
      showSnackbar('Formulaire réinitialisé', 'info');
    }
  };

  // Imprimer la transaction
  const handlePrint = () => {
    showSnackbar('Impression démarrée...', 'info');
    // Simulation d'impression
    setTimeout(() => {
      showSnackbar('Document imprimé avec succès', 'success');
    }, 1500);
  };

  // Télécharger le reçu
  const handleDownload = () => {
    showSnackbar('Téléchargement du reçu...', 'info');
    // Simulation de téléchargement
    setTimeout(() => {
      showSnackbar('Reçu téléchargé avec succès', 'success');
    }, 1500);
  };

  // Obtenir le statut de la transaction
  const getStatusChip = (statut: string) => {
    switch (statut) {
      case 'VALIDEE':
        return <SuccessChip size="small" label="Validée" icon={<CheckCircle />} />;
      case 'EN_ATTENTE':
        return <WarningChip size="small" label="En attente" icon={<Warning />} />;
      case 'ANNULEE':
        return <ErrorChip size="small" label="Annulée" icon={<Close />} />;
      default:
        return null;
    }
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
              Entrées / Sorties Caisse
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Transactions d'encaissement et décaissement de fonds - Turbobank
            </Typography>
          </Box>

          {/* Statistiques rapides */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <CardStat>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ bgcolor: '#E3F2FD', color: '#1976D2', width: 40, height: 40 }}>
                      <AccountBalanceWallet />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Solde Caisse
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#1976D2">
                        {formatCurrency(formData.soldeCaisse)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Agence: {formData.agenceCode}
                  </Typography>
                </CardContent>
              </CardStat>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <CardStat>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', width: 40, height: 40 }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Entrées du jour
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#2E7D32">
                        5,000,000 FCFA
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    2 transactions
                  </Typography>
                </CardContent>
              </CardStat>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <CardStat>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ bgcolor: '#FFEBEE', color: '#D32F2F', width: 40, height: 40 }}>
                      <TrendingDown />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Sorties du jour
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#D32F2F">
                        2,500,000 FCFA
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    1 transaction
                  </Typography>
                </CardContent>
              </CardStat>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <CardStat>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ bgcolor: '#FFF3E0', color: '#F57C00', width: 40, height: 40 }}>
                      <MonetizationOn />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Nouveau Solde
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#F57C00">
                        {formatCurrency(formData.nouveauSolde)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Après transaction
                  </Typography>
                </CardContent>
              </CardStat>
            </Grid>
          </Grid>

          {/* Formulaire principal */}
          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden', mb: 3 }}>
            <Box sx={{ p: 3, bgcolor: '#1976D2', color: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalance /> Nouvelle Transaction
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Remplissez les informations de la transaction d'entrée/sortie de caisse
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Colonne 1: Informations de base */}
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                        Informations Agence & Caisse
                      </Typography>
                      <Grid container spacing={1.5}>
                        <Grid item xs={6}>
                          <InfoBox>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Code Agence
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {formData.agenceCode}
                            </Typography>
                          </InfoBox>
                        </Grid>
                        <Grid item xs={6}>
                          <InfoBox>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Agence
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {formData.agenceName}
                            </Typography>
                          </InfoBox>
                        </Grid>
                        <Grid item xs={6}>
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
                        <Grid item xs={6}>
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
                              <MenuItem value="XOF">XOF</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Caisse"
                            name="caisse"
                            value={formData.caisse}
                            onChange={handleChange}
                            placeholder="Code caisse"
                            required
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Type de transaction */}
                  <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                        Type de Transaction
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {formData.isEntree ? 'Entrée de fonds' : 'Sortie de fonds'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formData.isEntree ? 'Encaissement' : 'Décaissement'}
                              </Typography>
                            </Box>
                            <Tooltip title={`Basculer en ${formData.isEntree ? 'sortie' : 'entrée'}`}>
                              <IconButton
                                onClick={toggleTransactionType}
                                sx={{
                                  bgcolor: formData.isEntree ? '#E8F5E9' : '#FFEBEE',
                                  color: formData.isEntree ? '#2E7D32' : '#D32F2F',
                                  '&:hover': {
                                    bgcolor: formData.isEntree ? '#C8E6C9' : '#FFCDD2',
                                  },
                                }}
                              >
                                {formData.isEntree ? <ArrowUpward /> : <ArrowDownward />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {formData.isAgenceTransaction ? 'Transaction avec Agence' : 'Transaction avec Banque'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formData.isAgenceTransaction ? 'Autre agence' : 'Autre banque'}
                              </Typography>
                            </Box>
                            <Tooltip title={`Basculer vers ${formData.isAgenceTransaction ? 'banque' : 'agence'}`}>
                              <IconButton
                                onClick={togglePartenaireType}
                                sx={{
                                  bgcolor: formData.isAgenceTransaction ? '#E3F2FD' : '#FFF3E0',
                                  color: formData.isAgenceTransaction ? '#1976D2' : '#F57C00',
                                  '&:hover': {
                                    bgcolor: formData.isAgenceTransaction ? '#BBDEFB' : '#FFE0B2',
                                  },
                                }}
                              >
                                {formData.isAgenceTransaction ? <AccountBalance /> : <MonetizationOn />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Colonne 2: Détails de la transaction */}
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                        Détails de la Transaction
                      </Typography>
                      <Grid container spacing={1.5}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Montant"
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
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label={`Code ${formData.isAgenceTransaction ? 'Agence' : 'Banque'}`}
                            name="codePartenaire"
                            value={formData.codePartenaire}
                            onChange={handleChange}
                            placeholder={formData.isAgenceTransaction ? "Ex: AG002" : "Ex: BNK001"}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Libellé / Motif"
                            name="libelle"
                            value={formData.libelle}
                            onChange={handleChange}
                            placeholder="Description de la transaction"
                            required
                            multiline
                            rows={2}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Référence Lettrage"
                            name="refLettrage"
                            value={formData.refLettrage}
                            onChange={handleChange}
                            placeholder="Réf. comptable"
                          />
                        </Grid>
                        
                        {/* Résumé de la transaction */}
                        <Grid item xs={12}>
                          <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              Résumé de la transaction:
                            </Typography>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Solde actuel:
                                </Typography>
                              </Grid>
                              <Grid item xs={6} textAlign="right">
                                <Typography variant="body2" fontWeight={600}>
                                  {formatCurrency(formData.soldeCaisse)}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Transaction:
                                </Typography>
                              </Grid>
                              <Grid item xs={6} textAlign="right">
                                <Typography variant="body2" fontWeight={600} color={formData.isEntree ? '#2E7D32' : '#D32F2F'}>
                                  {formData.isEntree ? '+' : '-'}{formatCurrency(formData.montant || '0')}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                              </Grid>
                              
                              <Grid item xs={6}>
                                <Typography variant="body2" fontWeight={700}>
                                  Nouveau solde:
                                </Typography>
                              </Grid>
                              <Grid item xs={6} textAlign="right">
                                <Typography variant="body2" fontWeight={700} color="#1976D2">
                                  {formatCurrency(formData.nouveauSolde)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </Grid>
                      </Grid>
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
                    disabled={!formData.montant || !formData.codePartenaire || !formData.libelle}
                  >
                    Valider
                  </GradientButton>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Historique des transactions */}
          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 1 }}>
                <History /> Historique des Transactions
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
                  onClick={handleDownload}
                >
                  Exporter
                </Button>
              </Box>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {transactionHistory.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: transaction.type === 'ENTREE' ? '#E8F5E9' : '#FFEBEE',
                              color: transaction.type === 'ENTREE' ? '#2E7D32' : '#D32F2F',
                            }}
                          >
                            {transaction.type === 'ENTREE' ? <ArrowUpward /> : <ArrowDownward />}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {transaction.libelle}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(transaction.date)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.partenaire}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Réf: {transaction.reference}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={transaction.type === 'ENTREE' ? '#2E7D32' : '#D32F2F'}>
                          {transaction.type === 'ENTREE' ? '+' : '-'}{formatCurrency(transaction.montant, transaction.devise)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(transaction.statut)}
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

      {/* Dialog de validation */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#1976D2', color: 'white' }}>
          <CheckCircle /> Validation de Transaction
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            Vérifiez les informations de la transaction avant validation
          </Alert>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
              Détails de la transaction:
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Type:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Chip
                  size="small"
                  label={formData.isEntree ? 'Entrée' : 'Sortie'}
                  color={formData.isEntree ? 'success' : 'error'}
                  icon={formData.isEntree ? <ArrowUpward /> : <ArrowDownward />}
                />
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Partenaire:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2">
                  {formData.isAgenceTransaction ? 'Agence' : 'Banque'}: {formData.codePartenaire}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Montant:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(formData.montant)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Libellé:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2">{formData.libelle}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Nouveau solde:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2" fontWeight={700} color="#1976D2">
                  {formatCurrency(formData.nouveauSolde)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Cliquez sur "Faire le billetage" pour continuer
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancel} color="inherit">
            Annuler
          </Button>
          <GradientButton onClick={handleBilletage} autoFocus>
            Faire le billetage
          </GradientButton>
        </DialogActions>
      </Dialog>

      {/* Dialog de billetage */}
      <Dialog open={billetageDialogOpen} onClose={() => setBilletageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F57C00', color: 'white' }}>
          <MonetizationOn /> Billetage en cours
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 2, color: '#F57C00' }} />
            <Typography variant="h6" gutterBottom>
              Billetage en cours...
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Vérification et comptage des billets
              <br />
              Cette opération peut prendre quelques secondes
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation */}
      <Dialog open={confirmationDialogOpen} onClose={() => setConfirmationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#2E7D32', color: 'white' }}>
          <CheckCircle /> Confirmation
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mt: 2 }}>
            Billetage terminé avec succès!
          </Alert>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" gutterBottom>
              Tous les billets ont été vérifiés et comptés.
            </Typography>
            <Typography variant="body2">
              Le montant correspond exactement à la transaction.
            </Typography>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            Confirmez la transaction pour finaliser l'opération
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancel} color="inherit">
            Annuler
          </Button>
          <GradientButton onClick={handleConfirmTransaction} autoFocus>
            Confirmer la transaction
          </GradientButton>
        </DialogActions>
      </Dialog>

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

export default EntreesSortiesCaisse;