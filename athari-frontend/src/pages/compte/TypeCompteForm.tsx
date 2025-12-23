import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import ApiClient from '@/services/api/ApiClient';
import { 
  Button, 
  TextField, 
  Checkbox, 
  FormControl, 
  FormControlLabel, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Box, 
  Grid,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  RadioGroup,
  Radio,
  FormLabel,
  Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ListAltIcon from '@mui/icons-material/ListAlt';

// Schéma de validation avec Zod
const typeCompteSchema = z.object({
  code: z.string()
    .min(1, 'Le code est requis')
    .max(2, 'Le code ne doit pas dépasser 2 caractères')
    .refine(val => val.length === 2, {
      message: 'Le code doit faire exactement 2 caractères'
    }),
  libelle: z.string()
    .min(1, 'Le libellé est requis')
    .max(255, 'Le libellé ne doit pas dépasser 255 caractères'),
  description: z.string().nullable().optional(),
  est_mata: z.boolean().default(false),
  necessite_duree: z.boolean().default(false),
  est_islamique: z.boolean().default(false),
  actif: z.boolean().default(true),
});

type TypeCompteFormValues = z.infer<typeof typeCompteSchema>;

const TypeCompteForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Gestionnaire de changement pour le champ code
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toUpperCase();
    setValue('code', value, { shouldValidate: true });
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TypeCompteFormValues>({
    resolver: zodResolver(typeCompteSchema),
    defaultValues: {
      est_mata: false,
      necessite_duree: false,
      est_islamique: false,
      actif: true,
    },
  });

  const onSubmit = async (data: TypeCompteFormValues) => {
    // Vérifier les erreurs de validation avant envoi
    if (Object.keys(errors).length > 0) {
      setErrorMessage('Veuillez corriger les erreurs dans le formulaire');
      setOpenError(true);
      return;
    }
    
    setIsLoading(true);
    try {
      // Préparer les données exactement comme le serveur les attend
      const requestData = {
        code: data.code.trim().toUpperCase(),
        libelle: data.libelle.trim(),
        description: data.description?.trim() || undefined,
        est_mata: data.est_mata ? 1 : 0,
        necessite_duree: data.necessite_duree ? 1 : 0,
        est_islamique: data.est_islamique ? 1 : 0,
        actif: 1 // Toujours actif par défaut
      };

      console.log('Données envoyées au serveur:', JSON.stringify(requestData, null, 2));
      
      // Envoyer les données avec les en-têtes appropriés
      const response = await ApiClient.post('/types-comptes', requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: true
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur lors de la création du type de compte');
      }
      
      console.log('Réponse du serveur:', response.data);
      
      setOpenSuccess(true);
      reset({
        code: '',
        libelle: '',
        description: '',
        est_mata: false,
        necessite_duree: false,
        est_islamique: false,
        actif: true,
      });
    } catch (error: any) {
      console.error('Erreur complète:', error);
      console.error('Réponse d\'erreur:', error.response?.data);
      
      let errorMessage = 'Une erreur est survenue lors de la création';
      
      console.error('Détails de l\'erreur:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      if (error.response?.data?.errors) {
        // Gestion des erreurs de validation Laravel
        const errorMessages = [];
        
        for (const [field, messages] of Object.entries(error.response.data.errors)) {
          const fieldName = 
            field === 'code' ? 'Code' : 
            field === 'libelle' ? 'Libellé' : 
            field === 'est_mata' ? 'Type MATA' :
            field === 'necessite_duree' ? 'Nécessite durée' :
            field === 'est_islamique' ? 'Type islamique' :
            field === 'actif' ? 'Statut' :
            field;
            
          if (Array.isArray(messages)) {
            errorMessages.push(`${fieldName}: ${messages.join(', ')}`);
          } else if (typeof messages === 'string') {
            errorMessages.push(`${fieldName}: ${messages}`);
          } else if (messages && typeof messages === 'object') {
            errorMessages.push(...Object.values(messages).flat().map(msg => `${fieldName}: ${msg}`));
          }
        }
        
        errorMessage = errorMessages.join('\n');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrorMessage(errorMessage);
      setOpenError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <Box sx={{ py: 4, px: { xs: 1, sm: 2, md: 3 } }}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={10} lg={8} xl={6}>
          <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Card>
              <CardHeader 
                title={
                  <Box display="flex" alignItems="center" gap={2}>
                    <AccountBalanceIcon color="primary" />
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'medium' }}>
                      Nouveau Type de Compte
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/Liste-type-de-compte"
                      variant="outlined"
                      color="inherit"
                      size="small"
                      startIcon={<ListAltIcon />}
                      sx={{
                        ml: 1,
                        color: 'primary.contrastText',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.7)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      Voir la liste
                    </Button>
                  </Box>
                }
                subheader="Remplissez les informations pour créer un nouveau type de compte"
                sx={{ 
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiCardHeader-subheader': {
                    color: 'primary.contrastText',
                    opacity: 0.9
                  }
                }}
              />
              <CardContent>
                <Box 
                  component="form" 
                  onSubmit={handleSubmit(onSubmit)} 
                  sx={{ 
                    '& .MuiTextField-root': { 
                      mb: 2,
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'primary.main',
                      },
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiFormControlLabel-root': {
                      alignItems: 'flex-start',
                      '& .MuiCheckbox-root': {
                        paddingTop: 0,
                        paddingBottom: 0,
                      },
                    },
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('code', {
                          onChange: (e) => handleCodeChange(e as React.ChangeEvent<HTMLInputElement>)
                        })}
                        label="Code*"
                        fullWidth
                        margin="normal"
                        error={!!errors.code}
                        helperText={errors.code?.message || '2 caractères maximum'}
                        disabled={isLoading}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: <VpnKeyIcon color="action" sx={{ mr: 1, color: 'text.secondary' }} />,
                          inputProps: { 
                            maxLength: 2, 
                            style: { 
                              textTransform: 'uppercase',
                              padding: '10px 14px',
                            } 
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'background.paper',
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Libellé*"
                        id="libelle"
                        placeholder="Ex: Compte Courant"
                        {...register('libelle')}
                        error={!!errors.libelle}
                        helperText={errors.libelle?.message}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: <DescriptionIcon color="action" sx={{ mr: 1, color: 'text.secondary' }} />,
                          inputProps: { 
                            style: { padding: '10px 14px' } 
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'background.paper',
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description"
                        id="description"
                        placeholder="Description du type de compte"
                        {...register('description')}
                        InputProps={{
                          startAdornment: <DescriptionIcon color="action" sx={{ mr: 1, mt: 1.5, alignSelf: 'flex-start' }} />,
                          inputProps: { 
                            style: { 
                              padding: '10px 14px',
                              minHeight: '80px',
                            } 
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'background.paper',
                            alignItems: 'flex-start',
                            '& textarea': {
                              minHeight: '80px !important',
                            },
                          },
                        }}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              id="est_mata"
                              {...register('est_mata')}
                            />
                          }
                          label="Est un compte de type MATA"
                        />

                        <FormControlLabel
                          control={
                            <Checkbox
                              id="necessite_duree"
                              {...register('necessite_duree')}
                            />
                          }
                          label="Nécessite une durée"
                        />

                        <FormControlLabel
                          control={
                            <Checkbox
                              id="est_islamique"
                              {...register('est_islamique')}
                            />
                          }
                          label="Compte islamique"
                        />

                        <FormControlLabel
                          control={
                            <Radio
                              checked={true}
                              disabled
                              color="primary"
                              sx={{
                                '&.Mui-checked': {
                                  color: 'success.main',
                                },
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight="medium">Actif</Typography>
                              <Typography variant="caption" color="success.main">Toujours actif</Typography>
                            </Box>
                          }
                          sx={{ 
                            m: 0,
                            '& .MuiFormControlLabel-label': {
                              display: 'flex',
                              flexDirection: 'column',
                              ml: 1,
                            },
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                      <Button
                        type="button"
                        variant="outlined"
                        sx={{ minWidth: 200 }}
                        onClick={handleCancel}
                        disabled={isLoading}
                        startIcon={<CancelIcon />}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={isLoading}
                        fullWidth
                      >
                        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
      </Grid>

      {/* Notifications */}
      <Snackbar
        open={openSuccess}
        autoHideDuration={6000}
        onClose={() => setOpenSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Le type de compte a été créé avec succès
        </Alert>
      </Snackbar>

      <Snackbar
        open={openError}
        autoHideDuration={6000}
        onClose={() => setOpenError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenError(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TypeCompteForm;
