import React, { useState, useEffect } from 'react';
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
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  CheckCircle,
  Person,
  Photo,
  AttachMoney,
  Description,
  Sms,
  Warning,
  Visibility,
  MonetizationOn,
  Close,
} from '@mui/icons-material';

// --- IMPORT DES COMPOSANTS DE LAYOUT ---
import Sidebar from '../../../components/layout/Sidebar';
import TopBar from '../../../components/layout/TopBar';

// --- IMPORT DU SERVICE D'AGENCES ---
import agenceService from '../../../services/agenceService';

// --- INTERFACES ---
interface Agence {
  id: number;
  code: string;
  name: string;
  shortName: string;
}

interface RetraitFormData {
  agenceCode: string;
  selectedAgence: string;
  guichet: string;
  caisse: string;
  typeRetrait: string;
  agenceCompte: string;
  soldeComptable: string;
  indisponible: string;
  autorisation: string;
  soldeIndicatif: string;
  compte: string;
  chapitre: string;
  client: string;
  motif: string;
  dateOperation: string;
  dateValeur: string;
  smsEnabled: boolean;
  telephone: string;
  fraisEnCompte: boolean;
  chequeClient: boolean;
  numeroCheque: string;
  montant: string;
  commissions: string;
  taxes: string;
  refLettrage: string;
  netAPayer: string;
  netADebiter: string;
  
  nomPorteur: string;
  adressePorteur: string;
  typeIdPorteur: string;
  numeroIdPorteur: string;
  delivreLePorteur: string;
  delivreAPorteur: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// --- COMPOSANTS STYLISÉS ---
const StyledTabs = styled(Tabs)({
  '& .MuiTab-root': {
    minHeight: 48,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  '& .Mui-selected': {
    color: '#1976D2',
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#1976D2',
    height: 3,
  },
});

const StyledCard = styled(Card)({
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  transition: 'box-shadow 0.2s',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
});

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  borderRadius: 6,
  padding: '8px 12px',
  border: '1px solid #dee2e6',
  fontSize: '0.875rem',
}));

const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
  color: 'white',
  fontWeight: 600,
  padding: '8px 24px',
  borderRadius: 6,
  '&:hover': {
    background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #BDBDBD 0%, #9E9E9E 100%)',
  },
});

const SecondaryButton = styled(Button)({
  backgroundColor: '#f5f5f5',
  color: '#424242',
  fontWeight: 500,
  padding: '8px 20px',
  borderRadius: 6,
  border: '1px solid #e0e0e0',
  '&:hover': {
    backgroundColor: '#eeeeee',
    border: '1px solid #bdbdbd',
  },
});

const BlueInfoBox = styled(InfoBox)({
  backgroundColor: '#e3f2fd',
  border: '1px solid #bbdefb',
});

// --- FONCTIONS UTILITAIRES ---
const formatCurrency = (value: string) => {
  const num = parseFloat(value || '0');
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`retrait-tabpanel-${index}`}
      aria-labelledby={`retrait-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const RetraitEspeces = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [billetageOpen, setBilletageOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const [formData, setFormData] = useState<RetraitFormData>({
    agenceCode: '',
    selectedAgence: '',
    guichet: '',
    caisse: '',
    typeRetrait: '',
    agenceCompte: '',
    soldeComptable: '2500000',
    indisponible: '150000',
    autorisation: '500000',
    soldeIndicatif: '2850000',
    compte: '',
    chapitre: '',
    client: '',
    motif: '',
    dateOperation: new Date().toISOString().split('T')[0],
    dateValeur: new Date().toISOString().split('T')[0],
    smsEnabled: false,
    telephone: '',
    fraisEnCompte: true,
    chequeClient: false,
    numeroCheque: '',
    montant: '',
    commissions: '0',
    taxes: '0',
    refLettrage: '',
    netAPayer: '0',
    netADebiter: '0',
    
    nomPorteur: '',
    adressePorteur: '',
    typeIdPorteur: '',
    numeroIdPorteur: '',
    delivreLePorteur: '',
    delivreAPorteur: '',
  });

  // Charger les agences au montage
  useEffect(() => {
    const loadAgences = async () => {
      try {
        setLoading(true);
        const agencesData = await agenceService.getAgences();
        setAgences(agencesData);
      } catch (error) {
        console.error('Erreur lors du chargement des agences:', error);
        showSnackbar('Erreur de chargement des agences', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadAgences();
  }, []);

  // Calculer les montants nets et solde indicatif
  useEffect(() => {
    const montant = parseFloat(formData.montant || '0');
    const commissions = parseFloat(formData.commissions || '0');
    const taxes = parseFloat(formData.taxes || '0');
    const soldeComptable = parseFloat(formData.soldeComptable || '0');
    const indisponible = parseFloat(formData.indisponible || '0');
    const autorisation = parseFloat(formData.autorisation || '0');
    
    const totalFrais = commissions + taxes;
    const netAPayer = montant;
    const netADebiter = formData.fraisEnCompte ? montant + totalFrais : montant;
    
    const soldeIndicatif = soldeComptable - indisponible + autorisation;
    
    setFormData(prev => ({
      ...prev,
      netAPayer: netAPayer.toString(),
      netADebiter: netADebiter.toString(),
      soldeIndicatif: soldeIndicatif.toString(),
    }));
  }, [
    formData.montant, 
    formData.commissions, 
    formData.taxes, 
    formData.fraisEnCompte,
    formData.soldeComptable,
    formData.indisponible,
    formData.autorisation
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      const newData = {
        ...formData,
        [name]: target.checked,
      };

      if (name === 'smsEnabled' && !target.checked) {
        newData.telephone = '';
      }

      setFormData(newData);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    const newData = {
      ...formData,
      [name]: value,
    };

    if (name === 'selectedAgence') {
      if (value) {
        const selectedAgence = agences.find(agence => agence.id.toString() === value);
        if (selectedAgence) {
          newData.agenceCode = selectedAgence.code;
        }
      } else {
        newData.agenceCode = '';
      }
    }

    setFormData(newData);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleValidate = () => {
    if (!formData.selectedAgence) {
      showSnackbar('Veuillez sélectionner une agence', 'error');
      return;
    }
    
    if (!formData.guichet) {
      showSnackbar('Le code guichet est obligatoire', 'error');
      return;
    }
    
    if (!formData.caisse) {
      showSnackbar('Le code caisse est obligatoire', 'error');
      return;
    }
    
    if (!formData.typeRetrait) {
      showSnackbar('Le type de retrait est obligatoire', 'error');
      return;
    }
    
    if (!formData.compte) {
      showSnackbar('Le numéro de compte est obligatoire', 'error');
      return;
    }
    
    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      showSnackbar('Le montant doit être supérieur à 0', 'error');
      return;
    }
    
    const montant = parseFloat(formData.montant);
    const soldeIndicatif = parseFloat(formData.soldeIndicatif);
    
    if (montant > soldeIndicatif) {
      showSnackbar('Montant supérieur au solde indicatif disponible', 'error');
      return;
    }

    const hasDisagreement = false;
    
    if (hasDisagreement) {
      setDialogOpen(true);
    } else {
      const caisseRequiresBilletage = true;
      if (caisseRequiresBilletage) {
        setBilletageOpen(true);
      } else {
        setConfirmationOpen(true);
      }
    }
  };

  const handleBilletageValidate = () => {
    setBilletageOpen(false);
    setConfirmationOpen(true);
  };

  const handleConfirmValidation = () => {
    setConfirmationOpen(false);
    showSnackbar('Transaction validée avec succès', 'success');
    
    setTimeout(() => {
      setFormData({
        agenceCode: '',
        selectedAgence: '',
        guichet: '',
        caisse: '',
        typeRetrait: '',
        agenceCompte: '',
        soldeComptable: '2500000',
        indisponible: '150000',
        autorisation: '500000',
        soldeIndicatif: '2850000',
        compte: '',
        chapitre: '',
        client: '',
        motif: '',
        dateOperation: new Date().toISOString().split('T')[0],
        dateValeur: new Date().toISOString().split('T')[0],
        smsEnabled: false,
        telephone: '',
        fraisEnCompte: true,
        chequeClient: false,
        numeroCheque: '',
        montant: '',
        commissions: '0',
        taxes: '0',
        refLettrage: '',
        netAPayer: '0',
        netADebiter: '0',
        nomPorteur: '',
        adressePorteur: '',
        typeIdPorteur: '',
        numeroIdPorteur: '',
        delivreLePorteur: '',
        delivreAPorteur: '',
      });
    }, 1000);
  };

  const handleCancelValidation = () => {
    setConfirmationOpen(false);
    showSnackbar('Transaction annulée', 'info');
  };

  const handleForceOperation = () => {
    setDialogOpen(false);
    showSnackbar('Transaction forcée avec succès', 'success');
  };

  const handleRequestDerogation = () => {
    setDialogOpen(false);
    showSnackbar('Dérogation demandée - En attente de forçage', 'warning');
  };

  const handleViewPendingTransactions = () => {
    showSnackbar('Ouvrir la liste des transactions en attente', 'info');
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
              Retrait Espèces
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Interface de retrait d'espèces - Turbobank
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            {/* Barre d'onglets */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f9fa' }}>
              <StyledTabs value={tabValue} onChange={handleTabChange} aria-label="retrait tabs">
                <Tab 
                  label="Retrait Espèces" 
                  icon={<AttachMoney fontSize="small" />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Porteur" 
                  icon={<Person fontSize="small" />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Condition" 
                  icon={<Description fontSize="small" />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Photo/signature" 
                  icon={<Photo fontSize="small" />} 
                  iconPosition="start"
                />
              </StyledTabs>
            </Box>

            {/* Contenu des onglets */}
            <Box sx={{ p: 3 }}>
              {/* Onglet Retrait Espèces */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                  {/* Colonne 1: Informations de base */}
                  <Grid item xs={12} md={6}>
                    <StyledCard sx={{ mb: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Informations Agence & Guichet
                        </Typography>
                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Code Agence"
                              name="agenceCode"
                              value={formData.agenceCode}
                              variant="outlined"
                              disabled
                              helperText="Code automatiquement rempli"
                            />
                          </Grid>
                          
                          <Grid item xs={6}>
                            <FormControl sx={{ minWidth: 200 }} size="small" required>
                              <InputLabel>Agence *</InputLabel>
                              <Select
                                name="selectedAgence"
                                value={formData.selectedAgence}
                                label="Agence *"
                                onChange={handleSelectChange}
                                variant="outlined"
                                disabled={loading}
                              >
                                <MenuItem value=""><em>Sélectionner une agence</em></MenuItem>
                                {agences.map((agence) => (
                                  <MenuItem key={agence.id} value={agence.id.toString()}>
                                    {agence.name} ({agence.code})
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Guichet *"
                              name="guichet"
                              value={formData.guichet}
                              onChange={handleChange}
                              placeholder="Code guichet"
                              required
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Caisse *"
                              name="caisse"
                              value={formData.caisse}
                              onChange={handleChange}
                              placeholder="Code caisse"
                              required
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Type retrait *"
                              name="typeRetrait"
                              value={formData.typeRetrait}
                              onChange={handleChange}
                              placeholder="Code opération"
                              required
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Agence Compte"
                              name="agenceCompte"
                              value={formData.agenceCompte}
                              onChange={handleChange}
                              placeholder="Code agence du compte"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>

                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Informations Solde
                        </Typography>
                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <BlueInfoBox>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Solde comptable
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="#1976D2">
                                {formatCurrency(formData.soldeComptable)} FCFA
                              </Typography>
                            </BlueInfoBox>
                          </Grid>
                          <Grid item xs={6}>
                            <InfoBox>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Indisponible
                              </Typography>
                              <Typography variant="body2" fontWeight={500} color="error.main">
                                {formatCurrency(formData.indisponible)} FCFA
                              </Typography>
                            </InfoBox>
                          </Grid>
                          <Grid item xs={6}>
                            <InfoBox>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Autorisation
                              </Typography>
                              <Typography variant="body2" fontWeight={500} color="warning.main">
                                {formatCurrency(formData.autorisation)} FCFA
                              </Typography>
                            </InfoBox>
                          </Grid>
                          <Grid item xs={6}>
                            <BlueInfoBox>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Solde indicatif
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="#1976D2">
                                {formatCurrency(formData.soldeIndicatif)} FCFA
                              </Typography>
                            </BlueInfoBox>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <StyledCard sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Détails du Retrait
                        </Typography>
                        <Grid container spacing={1.5}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Compte *"
                              name="compte"
                              value={formData.compte}
                              onChange={handleChange}
                              placeholder="Numéro de compte"
                              required
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <InfoBox>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Chapitre
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {formData.chapitre || 'N/A'}
                              </Typography>
                            </InfoBox>
                          </Grid>
                          <Grid item xs={6}>
                            <InfoBox>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Client
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {formData.client || 'N/A'}
                              </Typography>
                            </InfoBox>
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Motif"
                              name="motif"
                              value={formData.motif}
                              onChange={handleChange}
                              placeholder="Objet du retrait"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Date opération"
                              name="dateOperation"
                              type="date"
                              value={formData.dateOperation}
                              onChange={handleChange}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Date valeur"
                              name="dateValeur"
                              type="date"
                              value={formData.dateValeur}
                              onChange={handleChange}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>

                  <Grid item xs={12}>
                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    name="smsEnabled"
                                    checked={formData.smsEnabled}
                                    onChange={handleChange}
                                  />
                                }
                                label="SMS"
                              />
                              {formData.smsEnabled && (
                                <TextField
                                  size="small"
                                  label="Téléphone"
                                  name="telephone"
                                  value={formData.telephone}
                                  onChange={handleChange}
                                  placeholder="Numéro SMS"
                                />
                              )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    name="fraisEnCompte"
                                    checked={formData.fraisEnCompte}
                                    onChange={handleChange}
                                  />
                                }
                                label="Frais en compte"
                              />
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    name="chequeClient"
                                    checked={formData.chequeClient}
                                    onChange={handleChange}
                                  />
                                }
                                label="Chèque Client"
                              />
                            </Box>
                            
                            {formData.chequeClient && (
                              <TextField
                                fullWidth
                                size="small"
                                label="N° chèque"
                                name="numeroCheque"
                                value={formData.numeroCheque}
                                onChange={handleChange}
                                placeholder="Numéro du chèque"
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Grid>
                          
                          <Grid item xs={12} md={8}>
                            <Grid container spacing={1.5}>
                              <Grid item xs={4}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Montant *"
                                  name="montant"
                                  value={formData.montant}
                                  onChange={handleChange}
                                  placeholder="0"
                                  type="number"
                                  required
                                  InputProps={{
                                    startAdornment: 'FCFA',
                                  }}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Commissions"
                                  name="commissions"
                                  value={formData.commissions}
                                  onChange={handleChange}
                                  type="number"
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Taxes"
                                  name="taxes"
                                  value={formData.taxes}
                                  onChange={handleChange}
                                  type="number"
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Réf lettrage"
                                  name="refLettrage"
                                  value={formData.refLettrage}
                                  onChange={handleChange}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <StyledCard>
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                              Résumé Financier
                            </Typography>
                            <TableContainer>
                              <Table size="small">
                                <TableBody>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Net à payer au client</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                                      {formatCurrency(formData.netAPayer)} FCFA
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Net à débiter du compte</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#1976D2' }}>
                                      {formatCurrency(formData.netADebiter)} FCFA
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </CardContent>
                        </StyledCard>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <StyledCard sx={{ height: '100%' }}>
                          <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                              Transaction en attente
                            </Typography>
                            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <GradientButton
                                variant="contained"
                                onClick={handleViewPendingTransactions}
                                startIcon={<Visibility />}
                                size="small"
                                sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' }}
                              >
                                Voir les transactions
                              </GradientButton>
                            </Box>
                            <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>
                              Visualiser/traiter les transactions en dérogation et attente de forçage
                            </Alert>
                          </CardContent>
                        </StyledCard>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Identité du Porteur
                        </Typography>
                        <Grid container spacing={1.5}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nom"
                              name="nomPorteur"
                              value={formData.nomPorteur}
                              onChange={handleChange}
                              placeholder="Nom complet du porteur"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Adresse"
                              name="adressePorteur"
                              value={formData.adressePorteur}
                              onChange={handleChange}
                              placeholder="Adresse complète"
                              multiline
                              rows={2}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Type ID</InputLabel>
                              <Select
                                name="typeIdPorteur"
                                value={formData.typeIdPorteur}
                                label="Type ID"
                                onChange={handleSelectChange}
                              >
                                <MenuItem value="CNI">CNI</MenuItem>
                                <MenuItem value="PASSEPORT">Passeport</MenuItem>
                                <MenuItem value="PERMIS">Permis de conduire</MenuItem>
                                <MenuItem value="CARTE_SEJOUR">Carte de séjour</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="N° Identité"
                              name="numeroIdPorteur"
                              value={formData.numeroIdPorteur}
                              onChange={handleChange}
                              placeholder="Numéro de pièce"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Délivré le"
                              name="delivreLePorteur"
                              type="date"
                              value={formData.delivreLePorteur}
                              onChange={handleChange}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="A"
                              name="delivreAPorteur"
                              value={formData.delivreAPorteur}
                              onChange={handleChange}
                              placeholder="Lieu de délivrance"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <StyledCard sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Aperçu du Porteur
                        </Typography>
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Person sx={{ fontSize: 80, color: '#e0e0e0' }} />
                        </Box>
                        <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>
                          Informations sur la personne physique qui effectue le retrait des fonds
                        </Alert>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                      Conditions de Banque Applicables
                    </Typography>
                    <Alert severity="info">
                      <Typography variant="body2">
                        Conditions applicables au retrait d'espèces:
                        <br />
                        • Commission de retrait: 0.75% du montant (minimum 500 FCFA)
                        <br />
                        • Taxe: 0.25% du montant
                        <br />
                        • Plafond journalier: 5,000,000 FCFA
                        <br />
                        • Délai de valeur: J+1 pour les retraits avant 14h
                        <br />
                        • Justificatif d'identité obligatoire au-delà de 500,000 FCFA
                        <br />
                        • SMS automatique pour les retraits supérieurs à 100,000 FCFA
                        <br />
                        • Frais supplémentaires pour retrait hors agence titulaire: 1,000 FCFA
                      </Typography>
                    </Alert>
                  </CardContent>
                </StyledCard>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <StyledCard>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Photo sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Photo et signature du client
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cette section affiche la photo et la signature si elles ont été rattachées au compte
                    </Typography>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                      <Box sx={{ width: 150, height: 150, border: '1px dashed #bdbdbd', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Photo sx={{ fontSize: 40, color: '#e0e0e0' }} />
                      </Box>
                      <Box sx={{ width: 150, height: 150, border: '1px dashed #bdbdbd', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Signature
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </TabPanel>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <SecondaryButton onClick={() => window.history.back()}>
                  Annuler
                </SecondaryButton>
                <GradientButton
                  variant="contained"
                  onClick={handleValidate}
                  startIcon={<CheckCircle />}
                  disabled={!formData.selectedAgence || !formData.guichet || !formData.caisse || !formData.typeRetrait || !formData.compte || !formData.montant}
                >
                  Valider le retrait
                </GradientButton>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <Warning />
          Désaccord détecté
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Contraintes violées - Transaction ne peut se poursuivre
          </Alert>
          <Typography variant="body2">
            Motifs de désaccord:
            <br />
            • Montant supérieur au solde indicatif
            <br />
            • Plafond de retrait dépassé
            <br />
            • Compte avec restrictions
            <br />
            • Dépasse l'autorisation de découvert
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            NON (Annuler)
          </Button>
          <Button onClick={handleRequestDerogation} color="warning">
            DER (Dérogation)
          </Button>
          <Button onClick={handleForceOperation} variant="contained" sx={{ 
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            color: 'white'
          }}>
            FOR (Forcer)
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={billetageOpen} onClose={() => setBilletageOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
          <MonetizationOn />
          Billetage du montant
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Montant à billetter: <strong>{formatCurrency(formData.montant)} FCFA</strong>
          </Typography>
          <Grid container spacing={1.5}>
            {[10000, 5000, 2000, 1000, 500, 200, 100, 50, 25, 10, 5].map((value) => (
              <Grid item xs={4} key={value}>
                <TextField
                  fullWidth
                  size="small"
                  label={`${value} FCFA`}
                  type="number"
                  defaultValue="0"
                  InputProps={{
                    endAdornment: 'billets',
                  }}
                />
              </Grid>
            ))}
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            Saisir le nombre de billets pour chaque valeur
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBilletageOpen(false)} color="inherit">
            Annuler
          </Button>
          <GradientButton
            onClick={handleBilletageValidate}
            variant="contained"
          >
            Valider le billetage
          </GradientButton>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', color: 'primary.main' }}>
          Confirmation de validation
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Transaction validée avec succès
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Un reçu de caisse sera édité.
              <br />
              Souhaitez-vous confirmer définitivement cette transaction ?
            </Typography>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2">
                <strong>Détails:</strong>
                <br />
                • Retrait: {formatCurrency(formData.montant)} FCFA
                <br />
                • Compte: {formData.compte}
                <br />
                • Net à payer: {formatCurrency(formData.netAPayer)} FCFA
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
          <SecondaryButton onClick={handleCancelValidation}>
            NON (Annuler)
          </SecondaryButton>
          <GradientButton
            onClick={handleConfirmValidation}
            variant="contained"
            startIcon={<CheckCircle />}
            autoFocus
          >
            OUI (Confirmer)
          </GradientButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default RetraitEspeces;