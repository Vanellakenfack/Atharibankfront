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
  AccountBalance,
  Person,
  CloudUpload,
  Cancel,
  Photo,
  AttachMoney,
  Description,
  Sms,
  Settings,
  Visibility,
  Close,
  Warning,
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

interface VersementFormData {
  // Onglet Versement Espèces
  agenceCode: string;
  selectedAgence: string; // AJOUTÉ: pour la sélection d'agence
  guichet: string;
  caisse: string;
  typeVersement: string;
  agenceCompte: string;
  compte: string;
  chapitre: string;
  client: string;
  motif: string;
  dateOperation: string;
  dateValeur: string;
  dateIndisponible: string;
  smsEnabled: boolean;
  telephone: string;
  fraisEnCompte: boolean;
  montant: string;
  commissions: string;
  taxes: string;
  refLettrage: string;
  
  // Onglet Remettant
  nomRemettant: string;
  adresse: string;
  typeId: string;
  numeroId: string;
  delivreLe: string;
  delivreA: string;
  
  // Calculs
  soldeComptable: string;
  indisponible: string;
  netEncaisser: string;
  netCrediter: string;
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
      id={`versement-tabpanel-${index}`}
      aria-labelledby={`versement-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const Versement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const [formData, setFormData] = useState<VersementFormData>({
    // Onglet Versement Espèces
    agenceCode: '',
    selectedAgence: '', // AJOUTÉ
    guichet: '',
    caisse: '',
    typeVersement: '',
    agenceCompte: '',
    compte: '',
    chapitre: '',
    client: '',
    motif: '',
    dateOperation: new Date().toISOString().split('T')[0],
    dateValeur: new Date().toISOString().split('T')[0],
    dateIndisponible: '',
    smsEnabled: false,
    telephone: '',
    fraisEnCompte: false,
    montant: '',
    commissions: '0',
    taxes: '0',
    refLettrage: '',
    
    // Onglet Remettant
    nomRemettant: '',
    adresse: '',
    typeId: '',
    numeroId: '',
    delivreLe: '',
    delivreA: '',
    
    // Calculs
    soldeComptable: '1500000',
    indisponible: '0',
    netEncaisser: '0',
    netCrediter: '0',
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

  // Calculer les montants nets
  useEffect(() => {
    const montant = parseFloat(formData.montant || '0');
    const commissions = parseFloat(formData.commissions || '0');
    const taxes = parseFloat(formData.taxes || '0');
    
    const totalFrais = commissions + taxes;
    const netEncaisser = formData.fraisEnCompte ? montant : montant + totalFrais;
    const netCrediter = formData.fraisEnCompte ? montant - totalFrais : montant;
    
    setFormData(prev => ({
      ...prev,
      netEncaisser: netEncaisser.toString(),
      netCrediter: netCrediter.toString(),
    }));
  }, [formData.montant, formData.commissions, formData.taxes, formData.fraisEnCompte]);

  // ==================== FONCTIONS DU CODE 1 ====================
  
  // Fonction pour récupérer le code de l'agence sélectionnée
  const getSelectedAgenceCode = () => {
    if (!formData.selectedAgence) return '';
    const selectedAgence = agences.find(agence => agence.id.toString() === formData.selectedAgence);
    return selectedAgence ? selectedAgence.code : '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      const newData = {
        ...formData,
        [name]: target.checked,
      };

      // Si on décoche SMS, on vide le numéro SMS
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

  // FONCTION DU CODE 1 POUR LE SELECT D'AGENCE
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    const newData = {
      ...formData,
      [name]: value,
    };

    // Si on change l'agence, mettre à jour automatiquement le code d'agence
    if (name === 'selectedAgence') {
      if (value) {
        const selectedAgence = agences.find(agence => agence.id.toString() === value);
        if (selectedAgence) {
          newData.agenceCode = selectedAgence.code;
        }
      } else {
        // Si on désélectionne l'agence, vider le code
        newData.agenceCode = '';
      }
    }

    setFormData(newData);
  };

  // =============================================================

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
    // Validation des champs obligatoires
    if (!formData.selectedAgence) {
      showSnackbar('Veuillez sélectionner une agence', 'error');
      return;
    }
    
    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      showSnackbar('Le montant doit être supérieur à 0', 'error');
      return;
    }
    
    if (!formData.compte) {
      showSnackbar('Le numéro de compte est obligatoire', 'error');
      return;
    }
    
    if (!formData.nomRemettant) {
      showSnackbar('Le nom du remettant est obligatoire', 'error');
      return;
    }
    
    if (!formData.typeId || !formData.numeroId) {
      showSnackbar('Les informations de pièce d\'identité sont obligatoires', 'error');
      return;
    }

    setDialogOpen(true);
  };

  const handleConfirmValidation = () => {
    // Simulation d'une transaction réussie
    setDialogOpen(false);
    showSnackbar('Transaction validée avec succès', 'success');
    
    // Réinitialiser le formulaire
    setTimeout(() => {
      setFormData({
        agenceCode: '',
        selectedAgence: '',
        guichet: '',
        caisse: '',
        typeVersement: '',
        agenceCompte: '',
        compte: '',
        chapitre: '',
        client: '',
        motif: '',
        dateOperation: new Date().toISOString().split('T')[0],
        dateValeur: new Date().toISOString().split('T')[0],
        dateIndisponible: '',
        smsEnabled: false,
        telephone: '',
        fraisEnCompte: false,
        montant: '',
        commissions: '0',
        taxes: '0',
        refLettrage: '',
        nomRemettant: '',
        adresse: '',
        typeId: '',
        numeroId: '',
        delivreLe: '',
        delivreA: '',
        soldeComptable: '1500000',
        indisponible: '0',
        netEncaisser: '0',
        netCrediter: '0',
      });
    }, 1000);
  };

  const handleForceOperation = () => {
    // Logique de forçage
    setDialogOpen(false);
    showSnackbar('Transaction forcée avec succès', 'success');
  };

  const handleRequestDerogation = () => {
    // Logique de demande de dérogation
    setDialogOpen(false);
    showSnackbar('Dérogation demandée - En attente de forçage', 'warning');
  };

  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette transaction ?')) {
      setDialogOpen(false);
      showSnackbar('Transaction annulée', 'info');
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
              Versement Espèces
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Interface de versement d'espèces - Turbobank
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            {/* Barre d'onglets */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f9fa' }}>
              <StyledTabs value={tabValue} onChange={handleTabChange} aria-label="versement tabs">
                <Tab 
                  label="Versement Espèces" 
                  icon={<AttachMoney fontSize="small" />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Remettant" 
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
              {/* Onglet Versement Espèces */}
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
                          {/* ================= COMPOSANT CODE AGENCE DU CODE 1 ================= */}
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Code Agence"
                              name="agenceCode"
                              value={formData.agenceCode}
                              variant="outlined"
                              disabled
                              helperText={formData.selectedAgence ? "Code automatiquement rempli" : "Sélectionnez d'abord une agence"}
                            />
                          </Grid>
                          
                          {/* ================= COMPOSANT SELECTION AGENCE DU CODE 1 ================= */}
                          <Grid item xs={6}>
                            <FormControl sx={{ minWidth: 200}} size="small" required>
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
                          {/* ============================================================= */}

                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Guichet"
                              name="guichet"
                              value={formData.guichet}
                              onChange={handleChange}
                              placeholder="Code guichet"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Caisse"
                              name="caisse"
                              value={formData.caisse}
                              onChange={handleChange}
                              placeholder="Code caisse"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <FormControl sx={{ minWidth: 200}} size="small">
                              <InputLabel>Type versement</InputLabel>
                              <Select
                                name="typeVersement"
                                value={formData.typeVersement}
                                label="Type versement"
                                onChange={handleSelectChange}
                              >
                                <MenuItem value="01">01 - Versement espèces</MenuItem>
                                <MenuItem value="02">02 - Versement chèque</MenuItem>
                                <MenuItem value="03">03 - Virement interne</MenuItem>
                                <MenuItem value="04">04 - Virement externe</MenuItem>
                              </Select>
                            </FormControl>
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

                    {/* Infos solde */}
                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Informations Compte
                        </Typography>
                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <InfoBox>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Solde comptable
                              </Typography>
                              <Typography variant="body2" fontWeight={500} color="success.main">
                                {formatCurrency(formData.soldeComptable)} FCFA
                              </Typography>
                            </InfoBox>
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
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>

                  {/* Colonne 2: Détails du versement */}
                  <Grid item xs={12} md={6}>
                    <StyledCard sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Détails du Versement
                        </Typography>
                        <Grid container spacing={1.5}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Compte"
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
                              placeholder="Objet du versement"
                            />
                          </Grid>
                          <Grid item xs={4}>
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
                          <Grid item xs={4}>
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
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Date indisponible"
                              name="dateIndisponible"
                              type="date"
                              value={formData.dateIndisponible}
                              onChange={handleChange}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>

                  {/* Section SMS et Frais */}
                  <Grid item xs={12}>
                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                          </Grid>
                          
                          <Grid item xs={12} md={8}>
                            <Grid container spacing={1.5}>
                              <Grid item xs={4}>
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

                  {/* Résumé financier */}
                  <Grid item xs={12}>
                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Résumé Financier
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Net à encaisser</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#1976D2' }}>
                                  {formatCurrency(formData.netEncaisser)} FCFA
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Net à créditer</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                                  {formatCurrency(formData.netCrediter)} FCFA
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Onglet Remettant */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <StyledCard>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                          Identité du Remettant
                        </Typography>
                        <Grid container spacing={1.5}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nom"
                              name="nomRemettant"
                              value={formData.nomRemettant}
                              onChange={handleChange}
                              placeholder="Nom complet"
                              required
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Adresse"
                              name="adresse"
                              value={formData.adresse}
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
                                name="typeId"
                                value={formData.typeId}
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
                              name="numeroId"
                              value={formData.numeroId}
                              onChange={handleChange}
                              placeholder="Numéro de pièce"
                              required
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Délivré le"
                              name="delivreLe"
                              type="date"
                              value={formData.delivreLe}
                              onChange={handleChange}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="A"
                              name="delivreA"
                              value={formData.delivreA}
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
                          Transaction en attente
                        </Typography>
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Button
                            variant="outlined"
                            startIcon={<Visibility />}
                            size="small"
                          >
                            Voir les transactions en attente
                          </Button>
                        </Box>
                        <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>
                          Permet de visualiser et/ou traiter les transactions en dérogation
                        </Alert>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Onglet Condition */}
              <TabPanel value={tabValue} index={2}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
                      Conditions de Banque
                    </Typography>
                    <Alert severity="info">
                      <Typography variant="body2">
                        Les conditions applicables à cette transaction s'affichent ici.
                        <br />
                        • Taux de commission: 0.5%
                        <br />
                        • Taxe: 100 FCFA fixe
                        <br />
                        • Montant minimum: 1000 FCFA
                        <br />
                        • Montant maximum: 10,000,000 FCFA
                      </Typography>
                    </Alert>
                  </CardContent>
                </StyledCard>
              </TabPanel>

              {/* Onglet Photo/signature */}
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
                  </CardContent>
                </StyledCard>
              </TabPanel>

              {/* Boutons d'action */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <SecondaryButton onClick={() => window.history.back()}>
                  Annuler
                </SecondaryButton>
                <GradientButton
                  variant="contained"
                  onClick={handleValidate}
                  startIcon={<CheckCircle />}
                  disabled={!formData.selectedAgence || !formData.montant || !formData.compte}
                >
                  Valider le versement
                </GradientButton>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Dialog de confirmation */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle color="primary" />
          Confirmation de validation
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Aucun désaccord détecté. La caisse est soumise à billetage.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Souhaitez-vous confirmer cette transaction ?
            <br />
            Un reçu de caisse sera édité après confirmation.
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" display="block" color="text.secondary">
              Détails de la transaction:
            </Typography>
            <Typography variant="body2">
              • Agence: {formData.agenceCode}
              <br />
              • Type versement: {formData.typeVersement === '01' ? 'Versement espèces' : 
                                formData.typeVersement === '02' ? 'Versement chèque' :
                                formData.typeVersement === '03' ? 'Virement interne' : 'Virement externe'}
              <br />
              • Montant: {formatCurrency(formData.montant)} FCFA
              <br />
              • Compte: {formData.compte}
              <br />
              • Remettant: {formData.nomRemettant}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            NON (Annuler)
          </Button>
          <Button onClick={handleConfirmValidation} variant="contained" color="primary" autoFocus>
            OUI (Confirmer)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de désaccord (exemple) */}
      <Dialog open={false} maxWidth="sm" fullWidth>
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
            • Solde insuffisant
            <br />
            • Plafond de versement dépassé
            <br />
            • Compte bloqué
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancel} color="inherit">
            NON (Annuler)
          </Button>
          <Button onClick={handleRequestDerogation} color="warning">
            DER (Dérogation)
          </Button>
          <Button onClick={handleForceOperation} variant="contained" color="error">
            FOR (Forcer)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default Versement;