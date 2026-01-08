import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, MenuItem,
  FormControl, InputLabel, Select, Grid, Card, CardContent,
  CircularProgress, Alert
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import agenceService from '../../services/agenceService';

const CaisseForm = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingAgences, setLoadingAgences] = useState(true);
  const [agences, setAgences] = useState([]);
  const [error, setError] = useState('');

  // États du formulaire
  const [formData, setFormData] = useState({
    agence: '',
    guichet: '',
    caisse: '',
    devise: 'FCFA',
    situationGuichet: 'FE',
    situationCaisse: 'FE',
    operation: 'OU',
    soldeCaisse: '',
    dateComptable: new Date(),
  });

  // Liste des devises
  const devises = [
    { code: 'FCFA', nom: 'Franc CFA' },
    { code: 'EURO', nom: 'Euro' },
    { code: 'DOLLAR', nom: 'Dollar US' }
  ];

  // Situations possibles
  const situations = [
    { code: 'FE', nom: 'Fermé(e)' },
    { code: 'OU', nom: 'Ouvert(e)' },
    { code: 'RE', nom: 'Rouvert(e)' }
  ];

  // Charger les agences depuis l'API
  useEffect(() => {
    const fetchAgences = async () => {
      try {
        setLoadingAgences(true);
        const data = await agenceService.getAgences();
        setAgences(data);
        setError('');
      } catch (err) {
        console.error('Erreur lors du chargement des agences:', err);
        setError('Impossible de charger la liste des agences');
      } finally {
        setLoadingAgences(false);
      }
    };

    fetchAgences();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Caisse ${formData.operation === 'OU' ? 'ouverte' : 'fermée'} avec succès !`);
      navigate('/');
    } catch (error) {
      alert('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

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
              Ouverture/Fermeture Caisse
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Gérer l'ouverture ou la fermeture des caisses
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Card sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Agence */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Agence</InputLabel>
                        <Select
                          name="agence"
                          value={formData.agence}
                          onChange={handleChange}
                          label="Agence"
                          required
                        >
                          <MenuItem value=""><em>Sélectionner une agence</em></MenuItem>
                          {agences.map((agence) => (
                            <MenuItem key={agence.id} value={agence.id}>
                              {agence.name} ({agence.code})
                            </MenuItem>
                          ))}
                          {/* Option pour saisir manuellement */}
                          <MenuItem value="autre">
                            <em>Autre (saisir manuellement)</em>
                          </MenuItem>
                        </Select>
                        {loadingAgences && (
                          <CircularProgress size={20} sx={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)' }} />
                        )}
                      </FormControl>
                      {formData.agence === 'autre' && (
                        <TextField
                          fullWidth
                          size="small"
                          label="Nom de l'agence"
                          sx={{ mt: 1 }}
                          required
                        />
                      )}
                    </Grid>

                    {/* Guichet */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Code du guichet"
                        name="guichet"
                        value={formData.guichet}
                        onChange={handleChange}
                        required
                        placeholder="Ex: G001"
                      />
                    </Grid>

                    {/* Caisse */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Code de la caisse"
                        name="caisse"
                        value={formData.caisse}
                        onChange={handleChange}
                        required
                        placeholder="Ex: C001"
                      />
                    </Grid>

                    {/* Devise */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Devise</InputLabel>
                        <Select
                          name="devise"
                          value={formData.devise}
                          onChange={handleChange}
                          label="Devise"
                          required
                        >
                          {devises.map((devise) => (
                            <MenuItem key={devise.code} value={devise.code}>
                              {devise.nom} ({devise.code})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Situation actuelle Guichet */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Situation actuelle Guichet</InputLabel>
                        <Select
                          name="situationGuichet"
                          value={formData.situationGuichet}
                          onChange={handleChange}
                          label="Situation actuelle Guichet"
                        >
                          {situations.filter(s => s.code !== 'RE').map((situation) => (
                            <MenuItem key={situation.code} value={situation.code}>
                              {situation.nom} ({situation.code})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Situation actuelle Caisse */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Situation actuelle Caisse</InputLabel>
                        <Select
                          name="situationCaisse"
                          value={formData.situationCaisse}
                          onChange={handleChange}
                          label="Situation actuelle Caisse"
                        >
                          {situations.map((situation) => (
                            <MenuItem key={situation.code} value={situation.code}>
                              {situation.nom} ({situation.code})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Votre choix */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Votre choix</InputLabel>
                        <Select
                          name="operation"
                          value={formData.operation}
                          onChange={handleChange}
                          label="Votre choix"
                          required
                        >
                          <MenuItem value="OU">Ouverture (OU)</MenuItem>
                          <MenuItem value="FE">Fermeture (FE)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Solde Caisse */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Solde Caisse"
                        name="soldeCaisse"
                        value={formData.soldeCaisse}
                        onChange={handleChange}
                        required
                        type="number"
                        placeholder="0.00"
                        InputProps={{ 
                          startAdornment: <span style={{ marginRight: 8, color: '#666' }}>{formData.devise}</span>
                        }}
                      />
                    </Grid>

                    {/* Date comptable */}
                    <Grid item xs={12}>
                      <DatePicker
                        label="Date comptable"
                        value={formData.dateComptable}
                        onChange={(date) => handleDateChange('dateComptable', date)}
                        slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
                      />
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
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                          sx={{
                            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                            borderRadius: '8px',
                            px: 4,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                            }
                          }}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Ouvrir'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </LocalizationProvider>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default CaisseForm;