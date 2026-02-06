// components/credit/PVGeneration.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Paper,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import frLocale from 'date-fns/locale/fr';
import creditService from '../../services/creditService';

const PVGeneration = ({ creditApplication, onPVGenerated, disabled }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // PV Form data
  const [pvData, setPvData] = useState({
    numero_pv: '',
    date_pv: new Date(),
    montant_principal: parseFloat(creditApplication?.montant || 0),
    compte_destination: '',
    observations: '',
    frais_dossier: 0,
    frais_assurance: 0,
    taux_commission: 0
  });

  useEffect(() => {
    // Generate PV number
    const pvNumber = `PV-${creditApplication?.numero_demande || creditApplication?.id}-${Date.now().toString().slice(-6)}`;
    setPvData(prev => ({ ...prev, numero_pv: pvNumber }));
  }, [creditApplication]);

  const calculateTotalAmount = () => {
    const principal = pvData.montant_principal || 0;
    const fraisDossier = pvData.frais_dossier || 0;
    const fraisAssurance = pvData.frais_assurance || 0;
    const commission = (principal * (pvData.taux_commission || 0)) / 100;
    return principal + fraisDossier + fraisAssurance + commission;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const totalAmount = calculateTotalAmount();
      const finalPvData = {
        ...pvData,
        date_pv: pvData.date_pv.toISOString().split('T')[0],
        montant_total: totalAmount,
        credit_application_id: creditApplication.id
      };

      const response = await creditService.generatePV(creditApplication.id, finalPvData);
      
      if (response.success) {
        onPVGenerated(response.data);
      } else {
        setError(response.error?.message || 'Erreur lors de la génération du PV');
      }
    } catch (err) {
      setError('Erreur lors de la génération du PV');
      console.error('PV generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPvData(prev => ({ 
      ...prev, 
      [name]: name.includes('taux') ? parseFloat(value) || 0 : value 
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Numéro PV"
              name="numero_pv"
              value={pvData.numero_pv}
              onChange={handleChange}
              required
              disabled={disabled || loading}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Date du PV"
              value={pvData.date_pv}
              onChange={(newValue) => setPvData(prev => ({ ...prev, date_pv: newValue || new Date() }))}
              disabled={disabled || loading}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Compte Destination"
              name="compte_destination"
              value={pvData.compte_destination}
              onChange={handleChange}
              required
              disabled={disabled || loading}
              margin="normal"
              placeholder="Numéro de compte"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Montant Principal"
              name="montant_principal"
              value={pvData.montant_principal}
              onChange={handleChange}
              required
              type="number"
              disabled={disabled || loading}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Frais et Commissions
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Frais de Dossier"
              name="frais_dossier"
              type="number"
              value={pvData.frais_dossier}
              onChange={handleChange}
              disabled={disabled || loading}
              margin="normal"
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Frais d'Assurance"
              name="frais_assurance"
              type="number"
              value={pvData.frais_assurance}
              onChange={handleChange}
              disabled={disabled || loading}
              margin="normal"
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Taux Commission (%)"
              name="taux_commission"
              type="number"
              value={pvData.taux_commission}
              onChange={handleChange}
              disabled={disabled || loading}
              margin="normal"
              InputProps={{
                inputProps: { min: 0, max: 100, step: 0.1 }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observations"
              name="observations"
              value={pvData.observations}
              onChange={handleChange}
              disabled={disabled || loading}
              multiline
              rows={3}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    Montant Principal:
                  </Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body1" fontWeight="bold">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XAF'
                    }).format(pvData.montant_principal)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1">
                    Frais de Dossier:
                  </Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body1">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XAF'
                    }).format(pvData.frais_dossier)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1">
                    Frais d'Assurance:
                  </Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body1">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XAF'
                    }).format(pvData.frais_assurance)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1">
                    Commission ({pvData.taux_commission}%):
                  </Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body1">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XAF'
                    }).format((pvData.montant_principal * pvData.taux_commission) / 100)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="h6">
                    Montant Total:
                  </Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XAF'
                    }).format(calculateTotalAmount())}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={disabled || loading}
              size="large"
              fullWidth
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Génération en cours...
                </>
              ) : (
                'Générer le PV'
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default PVGeneration;