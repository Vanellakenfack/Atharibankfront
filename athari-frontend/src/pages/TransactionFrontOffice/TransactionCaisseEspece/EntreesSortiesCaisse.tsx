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
  InputAdornment,
  TableHead,
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
  AttachMoney,
  AutoFixHigh,
  RestartAlt,
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

interface BilletItem {
  id: number;
  label: string;
  valeur: number;
  quantite: number;
  total: number;
  type: 'BILLET' | 'PIECE';
  codeApi: string;
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

  // État pour le billetage
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

  // Effet pour calculer le billetage
  useEffect(() => {
    calculateBilletage();
  }, [billets, formData.montant]);

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

  // Gestion du billetage
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
    const montant = parseFloat(formData.montant || '0');
    const total = billets.reduce((sum, billet) => sum + billet.total, 0);
    setTotalBilletage(total);
    
    const diff = montant - total;
    setDifference(diff);
    
    if (montant === 0 && total === 0) {
      setValidationMessage('✅ Montant 0 - Billetage correct');
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

  const suggestBilletage = () => {
    const montant = parseFloat(formData.montant || '0');
    if (montant <= 0) {
      showSnackbar('Veuillez d\'abord saisir un montant valide', 'warning');
      return;
    }
    
    if (montant === 0) {
      resetBilletage();
      showSnackbar('Billetage réinitialisé', 'info');
      return;
    }
    
    let remaining = Math.floor(montant);
    const newBillets = [...billets];
    
    // Réinitialiser les quantités
    newBillets.forEach(billet => {
      billet.quantite = 0;
      billet.total = 0;
    });
    
    // Trier par valeur décroissante
    const sortedBillets = [...newBillets].sort((a, b) => b.valeur - a.valeur);
    
    // Calculer les quantités optimales
    for (const billet of sortedBillets) {
      if (remaining >= billet.valeur && billet.valeur > 0) {
        if (billet.valeur === 500 && billet.type === 'PIECE') {
          continue; // On gère les pièces de 500 séparément
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
    
    // Gérer le reste avec des pièces de 1
    if (remaining > 0) {
      const index = newBillets.findIndex(b => b.valeur === 1 && b.type === 'PIECE');
      if (index !== -1) {
        newBillets[index].quantite += remaining;
        newBillets[index].total += remaining;
        remaining = 0;
      }
    }
    
    setBillets(newBillets);
    showSnackbar('Billetage suggéré automatiquement', 'info');
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

  // Ouvrir la modal de billetage
  const handleOpenBilletage = () => {
    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      showSnackbar('Veuillez d\'abord saisir un montant valide', 'warning');
      return;
    }
    setDialogOpen(false);
    setBilletageDialogOpen(true);
  };

  // Valider le billetage
  const handleValidateBilletage = () => {
    if (Math.abs(difference) > 1) {
      showSnackbar('Le billetage n\'est pas correct. Ajustez les quantités.', 'error');
      return;
    }
    
    setBilletageDialogOpen(false);
    setConfirmationDialogOpen(true);
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
    
    // Réinitialiser le billetage
    resetBilletage();
    
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
      resetBilletage();
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
      resetBilletage();
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

  // Filtrer les billets et pièces
  const billetsFiltres = billets.filter(b => b.type === 'BILLET');
  const piecesFiltrees = billets.filter(b => b.type === 'PIECE');

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
                              endAdornment: (
                                <Tooltip title="Faire le billetage">
                                  <span>
                                    <IconButton 
                                      size="small" 
                                      onClick={handleOpenBilletage}
                                      disabled={!formData.montant || parseFloat(formData.montant) <= 0}
                                    >
                                      <AttachMoney />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )
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
          <GradientButton onClick={handleOpenBilletage} autoFocus>
            Faire le billetage
          </GradientButton>
        </DialogActions>
      </Dialog>

      {/* Dialog de billetage */}
      <Dialog 
        open={billetageDialogOpen} 
        onClose={() => setBilletageDialogOpen(false)}
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
                Montant à billeter: {formatCurrency(formData.montant)} {formData.devise}
              </Typography>
            </Box>
            <IconButton onClick={() => setBilletageDialogOpen(false)} size="small">
              <Close />
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
                    Montant à billeter
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {formatCurrency(parseFloat(formData.montant || '0'))} FCFA
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
              icon={Math.abs(difference) <= 1 ? <CheckCircle /> : <Warning />}
            >
              <Typography variant="body1" fontWeight="bold">
                {validationMessage}
              </Typography>
              {Math.abs(difference) > 1 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Le billetage doit correspondre exactement au montant saisi (± 1 FCFA).
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
                startIcon={<AutoFixHigh />}
                sx={{ mr: 1 }}
                disabled={parseFloat(formData.montant || '0') === 0}
                size="medium"
              >
                Suggérer automatiquement
              </Button>
              <Button 
                onClick={resetBilletage} 
                variant="outlined"
                startIcon={<RestartAlt />}
                size="medium"
              >
                Réinitialiser
              </Button>
            </Box>
            <Box>
              <Button 
                onClick={() => setBilletageDialogOpen(false)} 
                variant="outlined"
                sx={{ mr: 1 }}
                size="medium"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleValidateBilletage}
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
            <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Récapitulatif:
              </Typography>
              <Typography variant="body2">
                • Montant: {formatCurrency(formData.montant)}
              </Typography>
              <Typography variant="body2">
                • Billetage: {formatCurrency(totalBilletage)}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                • Différence: {formatCurrency(difference)} (Acceptable: ±1)
              </Typography>
            </Box>
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