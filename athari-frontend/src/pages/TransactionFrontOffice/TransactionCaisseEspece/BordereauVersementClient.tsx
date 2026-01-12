import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Alert,
  styled,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Save,
  Print,
  ArrowBack,
  AttachMoney,
  AccountBalance,
  Person,
  Receipt,
  ArrowForward,
  CheckCircle,
  Description,
  MonetizationOn,
  Photo,
  Fingerprint,
  VerifiedUser,
  QrCode,
  Download,
  Share,
  Refresh,
  Add,
  Remove,
  TrendingUp,
} from '@mui/icons-material';

// --- IMPORT DES COMPOSANTS DE LAYOUT ---
import Sidebar from '../../../components/layout/Sidebar';
import TopBar from '../../../components/layout/TopBar';

// --- INTERFACES ---
interface Denomination {
  label: string;
  value: number;
  quantity: number;
  amount: number;
  color: string;
}

interface ClientDepositFormData {
  // Informations générales
  bordereauNumber: string;
  date: string;
  agency: string;
  currencyCode: string;
  
  // Informations du compte
  branchCode: string;
  accountNumber: string;
  accountKey: string;
  
  // Informations personnelles
  depositorName: string;
  beneficiaryName: string;
  
  // Pièce d'identité
  idDocumentNumber: string;
  idValidFrom: string;
  idValidTo: string;
  
  // Montants
  coins: Denomination[];
  notes: Denomination[];
  totalAmount: number;
  amountInWords: string;
  
  // Autres
  depositReason: string;
  fundOrigin: string;
}

// --- COULEURS UNIFORMES (DÉGRADÉS DE BLEU) ---
const blueGradient = 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
const blueGradientHover = 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)';
const blueLight = '#E3F2FD';
const blueMedium = '#2196F3';
const blueDark = '#1976D2';
const blueDarker = '#0D47A1';
const successColor = '#4CAF50';
const infoColor = '#2196F3';
const warningColor = '#FF9800';

// --- COMPOSANTS STYLISÉS ---
const GradientButton = styled(Button)({
  background: blueGradient,
  color: 'white',
  fontWeight: 600,
  padding: '12px 32px',
  borderRadius: 10,
  fontSize: '0.95rem',
  textTransform: 'none',
  '&:hover': {
    background: blueGradientHover,
    boxShadow: `0 6px 20px rgba(25, 118, 210, 0.4)`,
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #BDBDBD 0%, #9E9E9E 100%)',
  },
});

const SecondaryButton = styled(Button)({
  background: 'linear-gradient(135deg, #F5F7FA 0%, #E4E7EB 100%)',
  color: '#424242',
  fontWeight: 600,
  padding: '12px 28px',
  borderRadius: 10,
  border: '1px solid #E0E0E0',
  fontSize: '0.95rem',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(135deg, #E4E7EB 0%, #CBD2D9 100%)',
    border: '1px solid #BDBDBD',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
});

const StyledCard = styled(Card)({
  border: '1px solid #E0E0E0',
  borderRadius: 12,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  },
});

const AmountCard = styled(Card)({
  background: blueGradient,
  color: 'white',
  borderRadius: 12,
  padding: '24px',
  minHeight: '180px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const DenominationCard = styled(Card)({
  border: '2px solid',
  borderColor: blueLight,
  borderRadius: 10,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 6px 16px ${blueLight}80`,
  },
});

const steps = [
  'Informations du compte',
  'Détails personnels',
  'Dénomination',
  'Validation',
];

const BordereauVersementClient = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<ClientDepositFormData>({
    bordereauNumber: 'BV-CL-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
    date: new Date().toISOString().split('T')[0],
    agency: 'Agence Centre Ville',
    currencyCode: 'XAF',
    branchCode: '001',
    accountNumber: '1234567890',
    accountKey: '12',
    depositorName: 'Fatou Diop',
    beneficiaryName: 'Fatou Diop',
    idDocumentNumber: '1234567890AB',
    idValidFrom: '2020-01-01',
    idValidTo: '2030-12-31',
    coins: [
      { label: 'X 500', value: 500, quantity: 1, amount: 500, color: '#1E88E5' },
      { label: 'X 100', value: 100, quantity: 2, amount: 200, color: '#2196F3' },
      { label: 'X 50', value: 50, quantity: 0, amount: 0, color: '#42A5F5' },
      { label: 'X 25', value: 25, quantity: 0, amount: 0, color: '#64B5F6' },
      { label: 'X 10', value: 10, quantity: 5, amount: 50, color: '#90CAF9' },
      { label: 'X 5', value: 5, quantity: 0, amount: 0, color: '#BBDEFB' },
      { label: 'X 1', value: 1, quantity: 0, amount: 0, color: '#E3F2FD' },
    ],
    notes: [
      { label: 'X 10 000', value: 10000, quantity: 15, amount: 150000, color: '#0D47A1' },
      { label: 'X 5 000', value: 5000, quantity: 0, amount: 0, color: '#1565C0' },
      { label: 'X 2 000', value: 2000, quantity: 0, amount: 0, color: '#1976D2' },
      { label: 'X 1 000', value: 1000, quantity: 0, amount: 0, color: '#1E88E5' },
      { label: 'X 500', value: 500, quantity: 0, amount: 0, color: '#2196F3' },
    ],
    totalAmount: 150700,
    amountInWords: 'cent cinquante mille sept cents francs CFA',
    depositReason: 'Épargne mensuelle',
    fundOrigin: 'Économies personnelles',
  });

  // Calculer les totaux
  const calculateTotals = () => {
    const coinsTotal = formData.coins.reduce((sum, coin) => sum + (coin.quantity * coin.value), 0);
    const notesTotal = formData.notes.reduce((sum, note) => sum + (note.quantity * note.value), 0);
    const totalAmount = coinsTotal + notesTotal;
    
    const updatedCoins = formData.coins.map(coin => ({
      ...coin,
      amount: coin.quantity * coin.value
    }));
    
    const updatedNotes = formData.notes.map(note => ({
      ...note,
      amount: note.quantity * note.value
    }));

    setFormData(prev => ({
      ...prev,
      coins: updatedCoins,
      notes: updatedNotes,
      totalAmount,
      amountInWords: convertToWords(totalAmount)
    }));
  };

  const convertToWords = (num: number): string => {
    if (num === 0) return 'zéro';
    
    const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
    
    const n = Math.floor(num);
    if (n < 1000) {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) {
        const ten = Math.floor(n / 10);
        const unit = n % 10;
        let result = tens[ten];
        if (unit > 0) {
          if (ten === 7 || ten === 9) {
            result += '-' + teens[unit - 10];
          } else if (unit === 1 && ten !== 8) {
            result += ' et un';
          } else {
            result += '-' + ones[unit];
          }
        }
        if (ten === 8 && unit === 0) result += 's';
        return result;
      }
      const hundred = Math.floor(n / 100);
      const rest = n % 100;
      let result = hundred === 1 ? 'cent' : ones[hundred] + ' cents';
      if (rest > 0) result += ' ' + convertToWords(rest);
      return result;
    }
    
    if (n < 1000000) {
      const thousand = Math.floor(n / 1000);
      const rest = n % 1000;
      let result = thousand === 1 ? 'mille' : convertToWords(thousand) + ' mille';
      if (rest > 0) result += ' ' + convertToWords(rest);
      return result;
    }
    
    const million = Math.floor(n / 1000000);
    const rest = n % 1000000;
    let result = million === 1 ? 'un million' : convertToWords(million) + ' millions';
    if (rest > 0) result += ' ' + convertToWords(rest);
    return result;
  };

  useEffect(() => {
    calculateTotals();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (index: number, type: 'coins' | 'notes', value: string) => {
    const quantity = parseInt(value) || 0;
    const updatedData = { ...formData };
    
    if (type === 'coins') {
      updatedData.coins[index].quantity = quantity;
    } else {
      updatedData.notes[index].quantity = quantity;
    }
    
    setFormData(updatedData);
    setTimeout(() => calculateTotals(), 100);
  };

  const handleIncrement = (index: number, type: 'coins' | 'notes') => {
    handleQuantityChange(index, type, ((formData[type][index].quantity || 0) + 1).toString());
  };

  const handleDecrement = (index: number, type: 'coins' | 'notes') => {
    const current = formData[type][index].quantity || 0;
    if (current > 0) {
      handleQuantityChange(index, type, (current - 1).toString());
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmit = () => {
    console.log('Bordereau client soumis:', formData);
    setShowReceipt(true);
  };

  const resetForm = () => {
    setFormData({
      ...formData,
      bordereauNumber: 'BV-CL-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      date: new Date().toISOString().split('T')[0],
      coins: formData.coins.map(coin => ({ ...coin, quantity: 0, amount: 0 })),
      notes: formData.notes.map(note => ({ ...note, quantity: 0, amount: 0 })),
      totalAmount: 0,
      amountInWords: 'zéro franc CFA',
    });
    setShowReceipt(false);
    setActiveStep(0);
  };

  const totalCoins = formData.coins.reduce((sum, coin) => sum + coin.amount, 0);
  const totalNotes = formData.notes.reduce((sum, note) => sum + note.amount, 0);

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Remplissez les informations du compte bénéficiaire
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Code guichet"
                  name="branchCode"
                  value={formData.branchCode}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalance color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Numéro de compte"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="medium"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VerifiedUser color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Clé du compte"
                  name="accountKey"
                  value={formData.accountKey}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="medium"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Agence"
                  name="agency"
                  value={formData.agency}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="medium"
                  required
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Informations personnelles du déposant et du bénéficiaire
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderLeft: `4px solid ${blueMedium}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Avatar sx={{ bgcolor: blueMedium }}>
                        <Person />
                      </Avatar>
                      <Typography variant="h6" color={blueMedium}>
                        Déposant
                      </Typography>
                    </Box>
                    
                    <TextField
                      fullWidth
                      label="Nom complet"
                      name="depositorName"
                      value={formData.depositorName}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="medium"
                      sx={{ mb: 2 }}
                    />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="N° Pièce d'identité"
                          name="idDocumentNumber"
                          value={formData.idDocumentNumber}
                          onChange={handleInputChange}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Validité"
                          value={`${formData.idValidFrom} - ${formData.idValidTo}`}
                          variant="outlined"
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderLeft: `4px solid ${blueDark}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Avatar sx={{ bgcolor: blueDark }}>
                        <AccountBalance />
                      </Avatar>
                      <Typography variant="h6" color={blueDark}>
                        Bénéficiaire
                      </Typography>
                    </Box>
                    
                    <TextField
                      fullWidth
                      label="Nom du bénéficiaire"
                      name="beneficiaryName"
                      value={formData.beneficiaryName}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="medium"
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Motif du versement"
                      name="depositReason"
                      value={formData.depositReason}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                      multiline
                      rows={2}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Sélectionnez les coupures et quantités
            </Typography>
            
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab icon={<MonetizationOn />} label="Monnaie" />
              <Tab icon={<AttachMoney />} label="Billets" />
            </Tabs>
            
            {tabValue === 0 ? (
              <Grid container spacing={2}>
                {formData.coins.map((coin, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <DenominationCard sx={{ borderColor: coin.color }}>
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h6" sx={{ color: coin.color, fontWeight: 700, mb: 1 }}>
                          {coin.label}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDecrement(index, 'coins')}
                            sx={{ bgcolor: '#FFEBEE', color: '#D32F2F' }}
                          >
                            <Remove />
                          </IconButton>
                          
                          <TextField
                            type="number"
                            value={coin.quantity}
                            onChange={(e) => handleQuantityChange(index, 'coins', e.target.value)}
                            size="small"
                            sx={{ width: 70 }}
                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' } } }}
                          />
                          
                          <IconButton 
                            size="small" 
                            onClick={() => handleIncrement(index, 'coins')}
                            sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }}
                          >
                            <Add />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" sx={{ fontWeight: 600, color: coin.color }}>
                          {coin.amount.toLocaleString()} XAF
                        </Typography>
                      </CardContent>
                    </DenominationCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={2}>
                {formData.notes.map((note, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <DenominationCard sx={{ borderColor: note.color }}>
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h6" sx={{ color: note.color, fontWeight: 700, mb: 1 }}>
                          {note.label}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDecrement(index, 'notes')}
                            sx={{ bgcolor: '#FFEBEE', color: '#D32F2F' }}
                          >
                            <Remove />
                          </IconButton>
                          
                          <TextField
                            type="number"
                            value={note.quantity}
                            onChange={(e) => handleQuantityChange(index, 'notes', e.target.value)}
                            size="small"
                            sx={{ width: 70 }}
                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' } } }}
                          />
                          
                          <IconButton 
                            size="small" 
                            onClick={() => handleIncrement(index, 'notes')}
                            sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }}
                          >
                            <Add />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" sx={{ fontWeight: 600, color: note.color }}>
                          {note.amount.toLocaleString()} XAF
                        </Typography>
                      </CardContent>
                    </DenominationCard>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {/* Résumé des totaux */}
            <Card sx={{ mt: 3, bgcolor: '#F8F9FA' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Total pièces
                      </Typography>
                      <Typography variant="h5" color={blueMedium} fontWeight={700}>
                        {totalCoins.toLocaleString()} XAF
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Total billets
                      </Typography>
                      <Typography variant="h5" color={blueDark} fontWeight={700}>
                        {totalNotes.toLocaleString()} XAF
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Total général
                      </Typography>
                      <Typography variant="h5" color={blueDarker} fontWeight={700}>
                        {formData.totalAmount.toLocaleString()} XAF
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Vérifiez et confirmez les informations
            </Typography>
            
            <StyledCard>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Résumé de la transaction
                    </Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Numéro de bordereau</TableCell>
                            <TableCell>{formData.bordereauNumber}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell>{new Date(formData.date).toLocaleDateString('fr-FR')}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Compte bénéficiaire</TableCell>
                            <TableCell>{formData.accountNumber}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Déposant</TableCell>
                            <TableCell>{formData.depositorName}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <AmountCard>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Montant total
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {formData.totalAmount.toLocaleString()} XAF
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {formData.amountInWords}
                      </Typography>
                    </AmountCard>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Origine des fonds"
                      name="fundOrigin"
                      value={formData.fundOrigin}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="medium"
                      multiline
                      rows={2}
                      sx={{ mt: 2 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          </Box>
        );

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
              Bordereau de Versement Client
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Formulaire de dépôt client - Interface simplifiée et ergonomique
            </Typography>
          </Box>

          {!showReceipt ? (
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
              {/* Barre d'état */}
              <Box sx={{ p: 2, background: blueGradient, color: 'white' }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'white', color: blueMedium }}>
                        <Receipt />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {formData.bordereauNumber}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Date: {new Date(formData.date).toLocaleDateString('fr-FR')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Chip label={`${formData.totalAmount.toLocaleString()} XAF`} sx={{ background: 'white', color: blueMedium }} />
                      <Chip label={formData.currencyCode} variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Stepper */}
              <Box sx={{ p: 3 }}>
                <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
                  {steps.map((label, index) => (
                    <Step key={label} completed={index < activeStep} active={index === activeStep}>
                      <StepLabel 
                        StepIconProps={{
                          sx: {
                            '&.Mui-active': {
                              color: 'white',
                              bgcolor: blueMedium,
                            },
                            '&.Mui-completed': {
                              color: 'white',
                              bgcolor: successColor,
                            },
                            width: 32,
                            height: 32,
                          }
                        }}
                      >
                        <Typography variant="body1" fontWeight="medium">
                          {label}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Box sx={{ mb: 2 }}>
                          {getStepContent(index)}
                        </Box>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button
                            disabled={index === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                          >
                            Retour
                          </Button>
                          <GradientButton
                            variant="contained"
                            onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                            endIcon={index === steps.length - 1 ? <CheckCircle /> : <ArrowForward />}
                          >
                            {index === steps.length - 1 ? 'Valider le versement' : 'Continuer'}
                          </GradientButton>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>

                {/* Informations rapides */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={4}>
                    <StyledCard>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <MonetizationOn sx={{ fontSize: 40, color: blueMedium, mb: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Total pièces
                        </Typography>
                        <Typography variant="h6" color={blueMedium} fontWeight={700}>
                          {totalCoins.toLocaleString()} XAF
                        </Typography>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <StyledCard>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <AttachMoney sx={{ fontSize: 40, color: blueDark, mb: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Total billets
                        </Typography>
                        <Typography variant="h6" color={blueDark} fontWeight={700}>
                          {totalNotes.toLocaleString()} XAF
                        </Typography>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <StyledCard>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <TrendingUp sx={{ fontSize: 40, color: blueDarker, mb: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Total général
                        </Typography>
                        <Typography variant="h6" color={blueDarker} fontWeight={700}>
                          {formData.totalAmount.toLocaleString()} XAF
                        </Typography>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          ) : (
            /* RECU */
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
              <Box sx={{ p: 3, background: blueGradient, color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'white', color: blueMedium, width: 56, height: 56 }}>
                      <CheckCircle sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Versement validé avec succès
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Référence: {formData.bordereauNumber}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton sx={{ color: 'white' }} onClick={() => setPrintDialogOpen(true)}>
                      <Print />
                    </IconButton>
                    <IconButton sx={{ color: 'white' }} onClick={() => {/* Télécharger */}}>
                      <Download />
                    </IconButton>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <StyledCard>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 3, color: blueDark, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Description /> Détails de la transaction
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Date de l'opération
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {new Date().toLocaleDateString('fr-FR', { 
                                day: '2-digit', 
                                month: 'long', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Agence
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formData.agency}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Compte bénéficiaire
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formData.accountNumber}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Déposant
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formData.depositorName}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Total pièces
                            </Typography>
                            <Typography variant="body1" fontWeight={600} color={blueMedium}>
                              {totalCoins.toLocaleString()} XAF
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Total billets
                            </Typography>
                            <Typography variant="body1" fontWeight={600} color={blueDark}>
                              {totalNotes.toLocaleString()} XAF
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Box sx={{ p: 2, background: blueLight, borderRadius: 2 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Montant total
                              </Typography>
                              <Typography variant="h4" color={blueDarker} fontWeight={800}>
                                {formData.totalAmount.toLocaleString()} XAF
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {formData.amountInWords}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <StyledCard>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 3, color: blueDarker, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <QrCode /> QR Code
                        </Typography>
                        
                        <Box sx={{ 
                          width: '100%', 
                          height: 200, 
                          bgcolor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 2,
                          mb: 2
                        }}>
                          <QrCode sx={{ fontSize: 120, color: blueMedium }} />
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary" align="center" display="block">
                          Scannez pour vérifier la transaction
                        </Typography>
                        
                        <Box sx={{ mt: 3 }}>
                          <GradientButton
                            fullWidth
                            variant="contained"
                            startIcon={<Print />}
                            onClick={() => setPrintDialogOpen(true)}
                            sx={{ mb: 1 }}
                          >
                            Imprimer le reçu
                          </GradientButton>
                          
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={resetForm}
                            sx={{ borderColor: blueMedium, color: blueMedium }}
                          >
                            Nouveau versement
                          </Button>
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Dialog d'impression */}
      <Dialog open={printDialogOpen} onClose={() => setPrintDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Imprimer le reçu</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Le reçu de versement va être imprimé.
          </Typography>
          <LinearProgress sx={{ my: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintDialogOpen(false)}>Annuler</Button>
          <GradientButton 
            onClick={() => {
              setPrintDialogOpen(false);
              window.print();
            }}
          >
            Confirmer
          </GradientButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BordereauVersementClient;