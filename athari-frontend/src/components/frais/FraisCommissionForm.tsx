import React, { useEffect, useState } from 'react';
import { useFrais } from '../../hooks/useFrais';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Alert,
  TextField,
  Button, 
  Card, 
  Typography, 
  FormControlLabel,
  Switch as MuiSwitch,
  Box,
  InputAdornment,
  Stack,
  Tabs,
  Tab,
  FormGroup,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon, 
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  AccountBalance as AccountBalanceIcon,
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  AccountTree as AccountTreeIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { fraisService } from '../../services/fraisService';

// Schéma de validation
const fraisCommissionSchema = yup.object().shape({
  type_compte_id: yup.number().required('Le type de compte est requis'),
  frais_ouverture: yup.number().min(0, 'Doit être positif').nullable(),
  frais_ouverture_actif: yup.boolean().default(false),
  frais_tenue_compte: yup.number().min(0, 'Doit être positif').nullable(),
  frais_tenue_actif: yup.boolean().default(false),
  commission_mouvement: yup.number().min(0, 'Doit être positif').nullable(),
  commission_mouvement_actif: yup.boolean().default(false),
  commission_retrait: yup.number().min(0, 'Doit être positif').nullable(),
  commission_retrait_actif: yup.boolean().default(false),
  commission_sms: yup.number().min(0, 'Doit être positif').nullable(),
  commission_sms_actif: yup.boolean().default(false),
  frais_deblocage: yup.number().min(0, 'Doit être positif').nullable(),
  frais_deblocage_actif: yup.boolean().default(false),
  frais_cloture_anticipe: yup.number().min(0, 'Doit être positif').nullable(),
  frais_cloture_anticipe_actif: yup.boolean().default(false),
  taux_interet_annuel: yup.number().min(0, 'Doit être positif').max(100, 'Max 100%').nullable(),
  frequence_calcul_interet: yup.string().nullable(),
  heure_calcul_interet: yup.string().nullable(),
  interets_actifs: yup.boolean().default(false),
  penalite_retrait_anticipe: yup.number().min(0, 'Doit être positif').nullable(),
  penalite_actif: yup.boolean().default(false),
  minimum_compte: yup.number().min(0, 'Doit être positif').nullable(),
  minimum_compte_actif: yup.boolean().default(false),
  seuil_commission_mensuelle: yup.number().min(0, 'Doit être positif').nullable(),
  commission_mensuelle_elevee: yup.number().min(0, 'Doit être positif').nullable(),
  commission_mensuelle_basse: yup.number().min(0, 'Doit être positif').nullable(),
  compte_commission_paiement: yup.string().nullable(),
  compte_produit_commission: yup.string().nullable(),
  compte_attente_produits: yup.string().nullable(),
  compte_attente_sms: yup.string().nullable(),
  retrait_anticipe_autorise: yup.boolean().default(false),
  validation_retrait_anticipe: yup.boolean().default(false),
  duree_blocage_min: yup.number().min(0, 'Doit être positif').nullable(),
  duree_blocage_max: yup.number().min(0, 'Doit être positif').nullable(),
  observations: yup.string().nullable()
});

type FraisCommissionFormData = yup.InferType<typeof fraisCommissionSchema>;

// Fonction utilitaire pour les propriétés d'accessibilité des onglets
function a11yProps(index: number) {
  return {
    id: `frais-tab-${index}`,
    'aria-controls': `frais-tabpanel-${index}`,
  };
}

// Composant pour les onglets personnalisés
function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`frais-tabpanel-${index}`}
      aria-labelledby={`frais-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FraisCommissionForm: React.FC<{ isEdit?: boolean }> = ({ isEdit = false }) => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  
  const { 
    typeComptes,
    loadTypeComptes,
    createFraisCommission,
    updateFraisCommission
  } = useFrais();

  const { control, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, reset } = useForm<FraisCommissionFormData>({
    resolver: yupResolver(fraisCommissionSchema),
    defaultValues: {
      type_compte_id: 0,
      frais_ouverture: 0,
      frais_ouverture_actif: false,
      frais_tenue_compte: 0,
      frais_tenue_actif: false,
      commission_mouvement: 0,
      commission_mouvement_type: 'POURCENTAGE',
      commission_mouvement_actif: false,
      commission_retrait: 0,
      commission_retrait_actif: false,
      commission_sms: 0,
      commission_sms_actif: false,
      frais_deblocage: 0,
      frais_deblocage_actif: false,
      frais_cloture_anticipe: 0,
      frais_cloture_anticipe_actif: false,
      taux_interet_annuel: 0,
      frequence_calcul_interet: 'MENSUEL',
      heure_calcul_interet: '00:00',
      interets_actifs: false,
      penalite_retrait_anticipe: 0,
      penalite_actif: false,
      minimum_compte: 0,
      minimum_compte_actif: false,
      seuil_commission_mensuelle: 0,
      commission_mensuelle_elevee: 0,
      commission_mensuelle_basse: 0,
      compte_commission_paiement: '',
      compte_produit_commission: '',
      compte_attente_produits: '',
      compte_attente_sms: '',
      retrait_anticipe_autorise: false,
      validation_retrait_anticipe: false,
      duree_blocage_min: 0,
      duree_blocage_max: 0,
      observations: ''
    }
  });

  // Charger les données existantes en mode édition
  useEffect(() => {
    const loadFraisData = async () => {
      if (isEdit && id) {
        try {
          setIsLoading(true);
          const fraisData = await fraisService.getFraisCommission(parseInt(id));
          
          // Afficher les données reçues dans la console pour le débogage
          console.log('Données du frais chargées:', fraisData);
          
          // Mise à jour des valeurs du formulaire avec les données récupérées
          Object.entries(fraisData).forEach(([key, value]) => {
            if (key in fraisCommissionSchema.fields) {
              // Convertir les valeurs numériques null en 0 pour éviter les erreurs
              const fieldValue = value === null && key.startsWith('frais_') ? 0 : value;
              setValue(key as keyof FraisCommissionFormData, fieldValue);
            }
          });
          
          enqueueSnackbar('Configuration des frais chargée avec succès', { 
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'center' }
          });
        } catch (error) {
          console.error('Erreur lors du chargement des données du frais:', error);
          enqueueSnackbar('Erreur lors du chargement de la configuration des frais', { 
            variant: 'error',
            autoHideDuration: 5000,
            anchorOrigin: { vertical: 'top', horizontal: 'center' }
          });
          // Rediriger vers la liste en cas d'erreur
          navigate('/frais-commissions');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    // Charger les types de compte
    const loadData = async () => {
      try {
        await loadTypeComptes();
        await loadFraisData();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        enqueueSnackbar('Erreur lors du chargement des données', { 
          variant: 'error',
          autoHideDuration: 5000,
          anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, isEdit, setValue, enqueueSnackbar, loadTypeComptes]);

  // Fonction utilitaire pour afficher un champ avec un interrupteur
  const renderFieldWithToggle = (
    name: keyof FraisCommissionFormData,
    label: string,
    control: any,
    toggleName: keyof FraisCommissionFormData,
    toggleLabel: string,
    startAdornment?: React.ReactNode,
    type: string = 'number'
  ) => {
    const value = watch(name);
    const isActive = watch(toggleName as any);

    return (
      <Grid item xs={12} sm={6} md={4}>
        <FormGroup>
          <Box display="flex" alignItems="center" mb={1}>
            <FormControlLabel
              control={
                <Controller
                  name={toggleName as any}
                  control={control}
                  render={({ field }) => (
                    <MuiSwitch
                      {...field}
                      checked={field.value}
                      color="primary"
                      icon={<ToggleOffIcon />}
                      checkedIcon={<ToggleOnIcon color="primary" />}
                    />
                  )}
                />
              }
              label={toggleLabel}
              labelPlacement="start"
            />
          </Box>
          
          <Controller
            name={name as any}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label={label}
                fullWidth
                variant="outlined"
                size="small"
                type={type}
                disabled={!isActive}
                error={!!error}
                helperText={error?.message}
                InputProps={{
                  startAdornment: startAdornment || null,
                  readOnly: !isActive
                }}
                value={isActive ? (field.value || '') : ''}
                onChange={(e) => field.onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
              />
            )}
          />
        </FormGroup>
      </Grid>
    );
  };

  // Gestion de la soumission du formulaire
  const onSubmit = async (data: FraisCommissionFormData) => {
    if (!window.confirm('Êtes-vous sûr de vouloir enregistrer ces modifications ?')) {
      return;
    }

    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      
      if (isEdit && id) {
        await updateFraisCommission(parseInt(id), data);
        enqueueSnackbar('Configuration des frais mise à jour avec succès', { 
          variant: 'success',
          autoHideDuration: 5000,
          anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
        setSubmitSuccess('La configuration des frais a été mise à jour avec succès');
      } else {
        await createFraisCommission(data);
        enqueueSnackbar('Nouvelle configuration de frais créée avec succès', { 
          variant: 'success',
          autoHideDuration: 5000,
          anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
        setSubmitSuccess('Nouvelle configuration de frais créée avec succès');
        setTimeout(() => {
          navigate('/frais-commissions');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de la soumission du formulaire';
      setSubmitError(errorMessage);
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        autoHideDuration: 5000,
        anchorOrigin: { vertical: 'top', horizontal: 'center' }
      });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
        <Box ml={2}>Chargement de la configuration des frais...</Box>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 1400, mx: 'auto' }}>
      <Card component={Paper} sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h1">
              {isEdit ? 'Modifier les frais de commission' : 'Nouveaux frais de commission'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
            >
              Retour
            </Button>
          </Stack>

          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            <Tab icon={<InfoIcon />} label="Général" {...a11yProps(0)} />
            <Tab icon={<ReceiptIcon />} label="Frais & Commissions" {...a11yProps(1)} />
            <Tab icon={<AccountBalanceIcon />} label="Intérêts" {...a11yProps(2)} />
            <Tab icon={<AccountTreeIcon />} label="Comptes" {...a11yProps(3)} />
            <Tab icon={<SettingsIcon />} label="Avancé" {...a11yProps(4)} />
          </Tabs>

          {submitError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, '& .MuiAlert-message': { width: '100%' } }}
          onClose={() => setSubmitError(null)}
        >
          <Box display="flex" alignItems="center">
            <InfoIcon color="error" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">Erreur</Typography>
              <Typography variant="body2">{submitError}</Typography>
            </Box>
          </Box>
        </Alert>
      )}
      {submitSuccess && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, '& .MuiAlert-message': { width: '100%' } }}
          onClose={() => setSubmitSuccess(null)}
        >
          <Box display="flex" alignItems="center">
            <InfoIcon color="success" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">Succès</Typography>
              <Typography variant="body2">{submitSuccess}</Typography>
            </Box>
          </Box>
        </Alert>
      )}

          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="type_compte_id"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      variant="outlined"
                      error={!!error}
                      helperText={error?.message}
                      SelectProps={{
                        native: true
                      }}
                      disabled={isSubmitting}
                    >
                      <option value="">Sélectionner un type de compte</option>
                      {typeComptes?.map((type: any) => (
                        <option key={type.id} value={type.id}>
                          {type.libelle}
                        </option>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              {renderFieldWithToggle(
                'frais_ouverture',
                "Frais d'ouverture",
                control,
                'frais_ouverture_actif',
                "Activer les frais d'ouverture",
                <InputAdornment position="start">FCFA</InputAdornment>
              )}

              {renderFieldWithToggle(
                'frais_tenue_compte',
                'Frais de tenue de compte',
                control,
                'frais_tenue_actif',
                'Activer les frais de tenue',
                <InputAdornment position="start">FCFA</InputAdornment>
              )}

              {renderFieldWithToggle(
                'commission_mouvement',
                'Commission sur mouvements',
                control,
                'commission_mouvement_actif',
                'Activer la commission sur mouvements',
                <InputAdornment position="start">
                  {watch('commission_mouvement_type') === 'POURCENTAGE' ? '%' : 'FCFA'}
                </InputAdornment>
              )}

              {watch('commission_mouvement_actif') && (
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="commission_mouvement_type"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Type de commission"
                        fullWidth
                        variant="outlined"
                        size="small"
                        disabled={isSubmitting}
                      >
                        <option value="POURCENTAGE">Pourcentage</option>
                        <option value="MONTANT_FIXE">Montant fixe</option>
                      </TextField>
                    )}
                  />
                </Grid>
              )}

              {renderFieldWithToggle(
                'commission_retrait',
                'Commission sur retrait',
                control,
                'commission_retrait_actif',
                'Activer la commission sur retrait',
                <InputAdornment position="start">FCFA</InputAdornment>
              )}

              {renderFieldWithToggle(
                'commission_sms',
                'Commission SMS',
                control,
                'commission_sms_actif',
                'Activer la commission SMS',
                <InputAdornment position="start">FCFA</InputAdornment>
              )}

              {renderFieldWithToggle(
                'frais_deblocage',
                'Frais de déblocage',
                control,
                'frais_deblocage_actif',
                'Activer les frais de déblocage',
                <InputAdornment position="start">FCFA</InputAdornment>
              )}

              {renderFieldWithToggle(
                'frais_cloture_anticipe',
                'Frais de clôture anticipée',
                control,
                'frais_cloture_anticipe_actif',
                'Activer les frais de clôture anticipée',
                <InputAdornment position="start">FCFA</InputAdornment>
              )}
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Controller
                        name="interets_actifs"
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            {...field}
                            checked={field.value}
                            color="primary"
                            icon={<ToggleOffIcon />}
                            checkedIcon={<ToggleOnIcon color="primary" />}
                          />
                        )}
                      />
                    }
                    label="Activer les intérêts"
                    labelPlacement="start"
                  />
                </FormGroup>
              </Grid>

              {watch('interets_actifs') && (
                <>
                  {renderFieldWithToggle(
                    'taux_interet_annuel',
                    'Taux d\'intérêt annuel',
                    control,
                    'interets_actifs',
                    ' ',
                    <InputAdornment position="start">%</InputAdornment>
                  )}

                  <Grid item xs={12} sm={6} md={4}>
                    <Controller
                      name="frequence_calcul_interet"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="Fréquence de calcul"
                          fullWidth
                          variant="outlined"
                          size="small"
                          disabled={!watch('interets_actifs') || isSubmitting}
                        >
                          <option value="QUOTIDIEN">Quotidien</option>
                          <option value="MENSUEL">Mensuel</option>
                          <option value="TRIMESTRIEL">Trimestriel</option>
                          <option value="ANNUEL">Annuel</option>
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Controller
                      name="heure_calcul_interet"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="time"
                          label="Heure de calcul"
                          fullWidth
                          variant="outlined"
                          size="small"
                          disabled={!watch('interets_actifs') || isSubmitting}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {renderFieldWithToggle(
                    'penalite_retrait_anticipe',
                    'Pénalité de retrait anticipé',
                    control,
                    'penalite_actif',
                    'Activer la pénalité',
                    <InputAdornment position="start">%</InputAdornment>
                  )}
                </>
              )}
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="compte_commission_paiement"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Compte commission paiement"
                      fullWidth
                      variant="outlined"
                      size="small"
                      error={!!error}
                      helperText={error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="compte_produit_commission"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Compte produit commission"
                      fullWidth
                      variant="outlined"
                      size="small"
                      error={!!error}
                      helperText={error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="compte_attente_produits"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Compte attente produits"
                      fullWidth
                      variant="outlined"
                      size="small"
                      error={!!error}
                      helperText={error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="compte_attente_sms"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Compte attente SMS"
                      fullWidth
                      variant="outlined"
                      size="small"
                      error={!!error}
                      helperText={error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Controller
                        name="retrait_anticipe_autorise"
                        control={control}
                        render={({ field }) => (
                          <MuiSwitch
                            {...field}
                            checked={field.value}
                            color="primary"
                          />
                        )}
                      />
                    }
                    label="Autoriser les retraits anticipés"
                  />
                </FormGroup>
              </Grid>

              {watch('retrait_anticipe_autorise') && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Controller
                            name="validation_retrait_anticipe"
                            control={control}
                            render={({ field }) => (
                              <MuiSwitch
                                {...field}
                                checked={field.value}
                                color="primary"
                              />
                            )}
                          />
                        }
                        label="Validation requise pour les retraits anticipés"
                      />
                    </FormGroup>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="duree_blocage_min"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Durée de blocage minimale (jours)"
                          fullWidth
                          variant="outlined"
                          size="small"
                          error={!!error}
                          helperText={error?.message}
                          disabled={!watch('retrait_anticipe_autorise') || isSubmitting}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">jours</InputAdornment>,
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="duree_blocage_max"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Durée de blocage maximale (jours)"
                          fullWidth
                          variant="outlined"
                          size="small"
                          error={!!error}
                          helperText={error?.message}
                          disabled={!watch('retrait_anticipe_autorise') || isSubmitting}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">jours</InputAdornment>,
                          }}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Controller
                  name="observations"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Observations"
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      error={!!error}
                      helperText={error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={isLoading || isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default FraisCommissionForm;