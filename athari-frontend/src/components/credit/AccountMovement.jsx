// components/credit/AccountMovement.jsx
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
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  FormControl
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import frLocale from 'date-fns/locale/fr';

const AccountMovement = ({ creditApplication, pvData, onMovementExecuted, disabled }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Movement Form data
  const [movementData, setMovementData] = useState({
    type_mouvement: 'debit',
    montant: pvData?.montant_total || parseFloat(creditApplication?.montant || 0),
    compte_source: '',
    compte_destination: pvData?.compte_destination || '',
    date_mouvement: new Date(),
    reference: '',
    description: `Décaissement crédit ${creditApplication?.numero_demande || creditApplication?.id}`,
    mode_paiement: 'virement'
  });

  useEffect(() => {
    // Generate reference
    const ref = `MV-${creditApplication?.numero_demande || creditApplication?.id}-${Date.now().toString().slice(-6)}`;
    setMovementData(prev => ({ ...prev, reference: ref }));
  }, [creditApplication]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const finalMovementData = {
        ...movementData,
        date_mouvement: movementData.date_mouvement.toISOString().split('T')[0],
        credit_application_id: creditApplication.id,
        pv_id: pvData?.id
      };

      onMovementExecuted(finalMovementData);
    } catch (err) {
      setError('Erreur lors de l\'exécution du mouvement');
      console.error('Movement execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovementData(prev => ({
      ...prev,
      [name]: name === 'montant' ? parseFloat(value) || 0 : value
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
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Type de Mouvement</FormLabel>
              <RadioGroup
                row
                name="type_mouvement"
                value={movementData.type_mouvement}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="debit"
                  control={<Radio />}
                  label="Débit (Décaissement)"
                  disabled={disabled || loading}
                />
                <FormControlLabel
                  value="credit"
                  control={<Radio />}
                  label="Crédit (Remboursement)"
                  disabled={disabled || loading}
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} size={{ md: 6 }}>
            <TextField
              fullWidth
              label="Référence"
              name="reference"
              value={movementData.reference}
              onChange={handleChange}
              required
              disabled={disabled || loading}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} size={{ md: 6 }}>
            <DatePicker
              label="Date du Mouvement"
              value={movementData.date_mouvement}
              onChange={(newValue) => setMovementData(prev => ({ ...prev, date_mouvement: newValue || new Date() }))}
              disabled={disabled || loading}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </Grid>

          <Grid item xs={12} size={{ md: 6 }}>
            <TextField
              fullWidth
              label="Compte Source"
              name="compte_source"
              value={movementData.compte_source}
              onChange={handleChange}
              required
              disabled={disabled || loading}
              margin="normal"
              placeholder="Numéro de compte source"
            />
          </Grid>

          <Grid item xs={12} size={{ md: 6 }}>
            <TextField
              fullWidth
              label="Compte Destination"
              name="compte_destination"
              value={movementData.compte_destination}
              onChange={handleChange}
              required
              disabled={disabled || loading}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} size={{ md: 6 }}>
            <TextField
              fullWidth
              label="Montant"
              name="montant"
              type="number"
              value={movementData.montant}
              onChange={handleChange}
              required
              disabled={disabled || loading}
              margin="normal"
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          </Grid>

          <Grid item xs={12} size={{ md: 6 }}>
            <TextField
              fullWidth
              label="Mode de Paiement"
              name="mode_paiement"
              value={movementData.mode_paiement}
              onChange={handleChange}
              select
              disabled={disabled || loading}
              margin="normal"
            >
              <MenuItem value="virement">Virement</MenuItem>
              <MenuItem value="cheque">Chèque</MenuItem>
              <MenuItem value="especes">Espèces</MenuItem>
              <MenuItem value="carte">Carte</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={movementData.description}
              onChange={handleChange}
              disabled={disabled || loading}
              multiline
              rows={3}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom>
                Récapitulatif
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Type:
                  </Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body1">
                    {movementData.type_mouvement === 'debit' ? 'Décaissement' : 'Remboursement'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Montant:
                  </Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XAF'
                    }).format(movementData.montant)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Compte Source:
                  </Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body1">
                    {movementData.compte_source || 'À définir'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Compte Destination:
                  </Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body1">
                    {movementData.compte_destination}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={disabled || loading}
              size="large"
              fullWidth
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Exécution en cours...
                </>
              ) : (
                'Exécuter le Mouvement'
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default AccountMovement;