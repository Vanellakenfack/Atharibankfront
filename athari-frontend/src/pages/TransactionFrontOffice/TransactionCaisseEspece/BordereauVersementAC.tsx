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
  styled,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Badge,
  IconButton,
} from '@mui/material';
import {
  Save,
  Print,
  ArrowBack,
  AttachMoney,
  AccountBalance,
  Person,
  Receipt,
  Groups,
  CheckCircle,
  ArrowForward,
  MonetizationOn,
  QrCode,
  Download,
  Share,
  Visibility,
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
}

interface LoanOfficerDepositFormData {
  // Informations générales
  bordereauNumber: string;
  date: string;
  agency: string;
  currencyCode: string;
  
  // Informations du personnel
  branchManager: string;
  loanOfficer: string;
  cashier: string;
  
  // Informations du dépôt
  depositorName: string;
  
  // Montants
  coins: Denomination[];
  notes: Denomination[];
  totalAmount: number;
  amountInWords: string;
  
  // Autres
  depositReason: string;
}

// --- COMPOSANTS STYLISÉS ---
const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
  color: 'white',
  fontWeight: 600,
  padding: '10px 24px',
  borderRadius: 8,
  fontSize: '0.95rem',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
  },
});

const PrimaryCard = styled(Card)({
  border: '1px solid #E0E0E0',
  borderRadius: 12,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  },
});

const DenominationCard = styled(Card)({
  border: '2px solid #E3F2FD',
  borderRadius: 8,
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#2196F3',
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
  },
});

// Étapes du formulaire
const steps = [
  'Informations générales',
  'Personnel bancaire',
  'Dénomination',
  'Validation',
];

const BordereauVersementAC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<LoanOfficerDepositFormData>({
    bordereauNumber: 'BV-AC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
    date: new Date().toISOString().split('T')[0],
    agency: 'Agence Centre Ville',
    currencyCode: 'XAF',
    branchManager: 'Marie Koné',
    loanOfficer: 'Ahmed Diallo',
    cashier: 'Fatima Sow',
    depositorName: 'Jean Dupont',
    coins: [
      { label: '500 XAF', value: 500, quantity: 2, amount: 1000 },
      { label: '100 XAF', value: 100, quantity: 5, amount: 500 },
      { label: '50 XAF', value: 50, quantity: 10, amount: 500 },
      { label: '25 XAF', value: 25, quantity: 8, amount: 200 },
      { label: '10 XAF', value: 10, quantity: 15, amount: 150 },
      { label: '5 XAF', value: 5, quantity: 20, amount: 100 },
      { label: '1 XAF', value: 1, quantity: 30, amount: 30 },
    ],
    notes: [
      { label: '10,000 XAF', value: 10000, quantity: 25, amount: 250000 },
      { label: '5,000 XAF', value: 5000, quantity: 12, amount: 60000 },
      { label: '2,000 XAF', value: 2000, quantity: 8, amount: 16000 },
      { label: '1,000 XAF', value: 1000, quantity: 15, amount: 15000 },
      { label: '500 XAF', value: 500, quantity: 10, amount: 5000 },
    ],
    totalAmount: 348480,
    amountInWords: 'trois cent quarante-huit mille quatre cent quatre-vingts francs CFA',
    depositReason: 'Recouvrement de prêts de la semaine',
  });

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

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

  const handleNext = () => {
    if (activeStep === 0) {
      // Validation étape 1
      if (!formData.agency || !formData.date || !formData.depositorName) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
    } else if (activeStep === 1) {
      // Validation étape 2
      if (!formData.loanOfficer || !formData.cashier) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    console.log('Bordereau AC soumis:', formData);
    setShowReceipt(true);
    setReceiptDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      ...formData,
      bordereauNumber: 'BV-AC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      date: new Date().toISOString().split('T')[0],
      coins: formData.coins.map(coin => ({ ...coin, quantity: 0, amount: 0 })),
      notes: formData.notes.map(note => ({ ...note, quantity: 0, amount: 0 })),
      totalAmount: 0,
      amountInWords: 'zéro franc CFA',
      depositReason: '',
      loanOfficer: '',
      cashier: '',
      depositorName: '',
    });
    setShowReceipt(false);
    setActiveStep(0);
    setReceiptDialogOpen(false);
  };

  const totalCoins = formData.coins.reduce((sum, coin) => sum + coin.amount, 0);
  const totalNotes = formData.notes.reduce((sum, note) => sum + note.amount, 0);
  const totalCoinsCount = formData.coins.reduce((sum, coin) => sum + coin.quantity, 0);
  const totalNotesCount = formData.notes.reduce((sum, note) => sum + note.quantity, 0);

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Remplissez les informations générales du versement
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Agence *"
                  value={formData.agency}
                  onChange={(e) => setFormData({...formData, agency: e.target.value})}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date *"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Effectué par *"
                  value={formData.depositorName}
                  onChange={(e) => setFormData({...formData, depositorName: e.target.value})}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Motif du versement"
                  value={formData.depositReason}
                  onChange={(e) => setFormData({...formData, depositReason: e.target.value})}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Informations du personnel bancaire impliqué
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderLeft: '4px solid #8E24AA', height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="#8E24AA" gutterBottom>
                      Agent de crédit *
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.loanOfficer}
                      onChange={(e) => setFormData({...formData, loanOfficer: e.target.value})}
                      variant="outlined"
                      size="small"
                      placeholder="Nom de l'agent de crédit"
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderLeft: '4px solid #4CAF50', height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="#4CAF50" gutterBottom>
                      Caissière *
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.cashier}
                      onChange={(e) => setFormData({...formData, cashier: e.target.value})}
                      variant="outlined"
                      size="small"
                      placeholder="Nom de la caissière"
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ borderLeft: '4px solid #FF9800', mt: 1 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="#FF9800" gutterBottom>
                      Chef d'agence
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.branchManager}
                      onChange={(e) => setFormData({...formData, branchManager: e.target.value})}
                      variant="outlined"
                      size="small"
                      placeholder="Nom du chef d'agence"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Sélectionnez les coupures et quantités
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <PrimaryCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <MonetizationOn color="primary" />
                      <Typography variant="h6">Monnaie / Coins</Typography>
                    </Box>
                    
                    <Grid container spacing={1}>
                      {formData.coins.map((coin, index) => (
                        <Grid item xs={6} key={index}>
                          <DenominationCard>
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                {coin.label}
                              </Typography>
                              <TextField
                                type="number"
                                value={coin.quantity}
                                onChange={(e) => handleQuantityChange(index, 'coins', e.target.value)}
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, style: { textAlign: 'center' } }
                                }}
                                fullWidth
                              />
                              <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                                {(coin.quantity * coin.value).toLocaleString()} XAF
                              </Typography>
                            </CardContent>
                          </DenominationCard>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </PrimaryCard>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <PrimaryCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AttachMoney color="primary" />
                      <Typography variant="h6">Billets / Notes</Typography>
                    </Box>
                    
                    <Grid container spacing={1}>
                      {formData.notes.map((note, index) => (
                        <Grid item xs={6} key={index}>
                          <DenominationCard>
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                {note.label}
                              </Typography>
                              <TextField
                                type="number"
                                value={note.quantity}
                                onChange={(e) => handleQuantityChange(index, 'notes', e.target.value)}
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, style: { textAlign: 'center' } }
                                }}
                                fullWidth
                              />
                              <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                                {(note.quantity * note.value).toLocaleString()} XAF
                              </Typography>
                            </CardContent>
                          </DenominationCard>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </PrimaryCard>
              </Grid>
            </Grid>
            
            {/* Résumé des totaux */}
            <Card sx={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Total pièces</Typography>
                      <Typography variant="h6" color="#4CAF50" fontWeight={700}>
                        {totalCoins.toLocaleString()} XAF
                      </Typography>
                      <Typography variant="caption">
                        {totalCoinsCount} unités
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Total billets</Typography>
                      <Typography variant="h6" color="#2196F3" fontWeight={700}>
                        {totalNotes.toLocaleString()} XAF
                      </Typography>
                      <Typography variant="caption">
                        {totalNotesCount} unités
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Total général</Typography>
                      <Typography variant="h6" color="#9C27B0" fontWeight={700}>
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
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Vérifiez et confirmez les informations
            </Typography>
            
            <PrimaryCard>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Résumé du versement
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
                            <TableCell sx={{ fontWeight: 600 }}>Agence</TableCell>
                            <TableCell>{formData.agency}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Effectué par</TableCell>
                            <TableCell>{formData.depositorName}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Agent de crédit</TableCell>
                            <TableCell>{formData.loanOfficer}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Caissière</TableCell>
                            <TableCell>{formData.cashier}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                      color: 'white',
                      height: '100%'
                    }}>
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Montant total
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                          {formData.totalAmount.toLocaleString()} XAF
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                          {formData.amountInWords}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                            Pièces: {totalCoins.toLocaleString()} XAF
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                            Billets: {totalNotes.toLocaleString()} XAF
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </PrimaryCard>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>
                  Bordereau de Versement AC
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Formulaire de dépôt pour agent de crédit - Interface simplifiée
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={`${formData.bordereauNumber}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                <Chip 
                  label={`${formData.totalAmount.toLocaleString()} XAF`}
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Box>

          {/* Formulaire principal avec stepper */}
          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            {/* Barre d'état */}
            <Box sx={{ p: 2, bgcolor: '#1976D2', color: 'white' }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'white', color: '#1976D2' }}>
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
                    <Chip 
                      label="Athari Financial Coop-Ca" 
                      size="small"
                      sx={{ background: 'white', color: '#1976D2' }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Contenu du formulaire */}
            <Box sx={{ p: 3 }}>
              {/* Stepper horizontal pour plus de compacité */}
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Contenu de l'étape */}
              <Box sx={{ mb: 4 }}>
                {getStepContent(activeStep)}
              </Box>

              {/* Boutons de navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  startIcon={<ArrowBack />}
                  sx={{ minWidth: 120 }}
                >
                  Retour
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <GradientButton
                    variant="contained"
                    onClick={handleSubmit}
                    endIcon={<CheckCircle />}
                    disabled={formData.totalAmount <= 0 || !formData.loanOfficer || !formData.cashier}
                    sx={{ minWidth: 200 }}
                  >
                    Valider le versement
                  </GradientButton>
                ) : (
                  <GradientButton
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForward />}
                    sx={{ minWidth: 150 }}
                  >
                    Continuer
                  </GradientButton>
                )}
              </Box>
            </Box>
          </Paper>

          {/* Quick stats en bas */}
          {!showReceipt && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Monnaie total</Typography>
                  <Typography variant="h6" color="#4CAF50" fontWeight={700}>
                    {totalCoins.toLocaleString()} XAF
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Billets total</Typography>
                  <Typography variant="h6" color="#2196F3" fontWeight={700}>
                    {totalNotes.toLocaleString()} XAF
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Total général</Typography>
                  <Typography variant="h6" color="#9C27B0" fontWeight={700}>
                    {formData.totalAmount.toLocaleString()} XAF
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Statut</Typography>
                  <Typography variant="h6" color={showReceipt ? "#4CAF50" : "#FF9800"} fontWeight={700}>
                    {showReceipt ? "Validé" : "En cours"}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>

      {/* Dialog du reçu */}
      <Dialog 
        open={receiptDialogOpen} 
        onClose={() => setReceiptDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#4CAF50', color: 'white', textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <CheckCircle sx={{ fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Versement validé avec succès
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {/* En-tête du reçu */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" color="#8E24AA" fontWeight={700}>
              Athari Financial Coop-Ca
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Établissement de microfinance de 1ère catégorie
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Numéro de bordereau</TableCell>
                      <TableCell>{formData.bordereauNumber}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell>{new Date(formData.date).toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Agence</TableCell>
                      <TableCell>{formData.agency}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Effectué par</TableCell>
                      <TableCell>{formData.depositorName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Motif</TableCell>
                      <TableCell>{formData.depositReason}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Agent de crédit</TableCell>
                      <TableCell>{formData.loanOfficer}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Caissière</TableCell>
                      <TableCell>{formData.cashier}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Total pièces</TableCell>
                      <TableCell>{totalCoins.toLocaleString()} XAF ({totalCoinsCount} unités)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Total billets</TableCell>
                      <TableCell>{totalNotes.toLocaleString()} XAF ({totalNotesCount} unités)</TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: '#E8F5E8' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Total général</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#2E7D32' }}>
                        {formData.totalAmount.toLocaleString()} XAF
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Card sx={{ mt: 3, p: 2, bgcolor: '#F8F9FA' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Montant en lettres:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formData.amountInWords}
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Code QR
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
                    <QrCode sx={{ fontSize: 120, color: '#1976D2' }} />
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" align="center" display="block">
                    Scannez pour vérifier la transaction
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    <GradientButton
                      fullWidth
                      variant="contained"
                      startIcon={<Print />}
                      onClick={() => window.print()}
                      sx={{ mb: 1 }}
                    >
                      Imprimer
                    </GradientButton>
                    
                    <GradientButton
                      fullWidth
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => {/* Télécharger le PDF */}}
                      sx={{ mb: 1, borderColor: '#1976D2', color: '#1976D2' }}
                    >
                      Télécharger
                    </GradientButton>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Receipt />}
                      onClick={resetForm}
                      sx={{ borderColor: '#4CAF50', color: '#4CAF50' }}
                    >
                      Nouveau bordereau
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button onClick={() => setReceiptDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BordereauVersementAC;