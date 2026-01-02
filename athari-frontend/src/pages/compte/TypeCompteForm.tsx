import React, { useEffect, useState, useCallback } from 'react';
import { useChapitres } from '../../hooks/useChapitres';
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
  Tabs,
  Tab,
  FormGroup,
  CircularProgress,
  Divider,
  Container,
  MenuItem,
  Autocomplete,
  Paper
} from '@mui/material';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import { Grid } from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon, 
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  AccountBalance as AccountBalanceIcon,
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  AccountTree as AccountTreeIcon,
  Info as InfoIcon,
  Percent as PercentIcon,
  AccessTime as AccessTimeIcon,
  Money as MoneyIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import ApiClient  from '../../services/api/ApiClient'
import { useMutation } from "@tanstack/react-query";

// Schéma de validation amélioré pour les décimales
const fraisCommissionSchema = yup.object().shape({

  // Champs obligatoires
  code: yup.string().required('Le code est requis'),
  libelle: yup.string().required('Le libellé est requis'),
  
  // Champs du gestionnaire
  gestionnaire_nom: yup.string().required('Le nom du gestionnaire est requis'),
  gestionnaire_prenom: yup.string().required('Le prénom du gestionnaire est requis'),
  gestionnaire_code: yup.string().required('Le code du gestionnaire est requis'),
  
  // Onglet Général
  type_compte_id: yup.string().required('Le type de compte est requis'),
  chapitre_id: yup.number().nullable(),
  description: yup.string().nullable(),
  
  // Frais et Commissions
  // Frais ouverture
  frais_ouverture: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimal', 'Maximum 2 décimales', value => 
      value === null || value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  frais_ouverture_actif: yup.boolean().default(false),
  chapitre_frais_ouverture_id: yup.number().nullable(),
  
  // Frais carnet
  frais_carnet: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimal', 'Maximum 2 décimales', value => 
      value === null || value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  frais_carnet_actif: yup.boolean().default(false),
  chapitre_frais_carnet_id: yup.number().nullable(),
  
  // Frais renouvellement carnet
  frais_renouvellement_carnet: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimal', 'Maximum 2 décimales', value => 
      value === null || value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  frais_renouvellement_actif: yup.boolean().default(false),
  chapitre_renouvellement_id: yup.number().nullable(),
  
  // Frais perte carnet
  frais_perte_carnet: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimal', 'Maximum 2 décimales', value => 
      value === null || value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  frais_perte_actif: yup.boolean().default(false),
  chapitre_perte_id: yup.number().nullable(),
  
  // Commission mensuelle
  commission_mensuelle_actif: yup.boolean().default(false),
  seuil_commission: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimal', 'Maximum 2 décimales', value => 
      value === null || value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  commission_si_superieur: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimal', 'Maximum 2 décimales', value => 
      value === null || value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  commission_si_inferieur: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimal', 'Maximum 2 décimales', value => 
      value === null || value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  
  // Commission retrait
  commission_retrait: yup.number()
    .min(0, 'Doit être positif')
    .max(100, 'Maximum 100%')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimal', 'Maximum 2 décimales', value => 
      value === null || value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  commission_retrait_actif: yup.boolean().default(false),
  chapitre_commission_retrait_id: yup.number().nullable(),
  
  // Commission SMS
  commission_sms: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimal', 'Maximum 2 décimales', value => 
      value === null || value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  commission_sms_actif: yup.boolean().default(false),
  chapitre_commission_sms_id: yup.number().nullable(),
  
  // Intérêts
  taux_interet_annuel: yup.number()
    .min(0, 'Doit être positif')
    .max(100, 'Maximum 100%')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimal', 'Maximum 2 décimales', value => 
      value === null || value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  interets_actifs: yup.boolean().default(false),
  frequence_calcul_interet: yup.string().nullable(),
  heure_calcul_interet: yup.string().nullable(),
  chapitre_interet_credit_id: yup.number().nullable(),
  capitalisation_interets: yup.boolean().default(false),
  
  // Frais déblocage
  frais_deblocage: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimal', 'Maximum 2 décimales', value => 
      value === null || value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  frais_deblocage_actif: yup.boolean().default(false),
  chapitre_frais_deblocage_id: yup.number().nullable(),
  
  // Pénalités
  penalite_retrait_anticipe: yup.number()
    .min(0, 'Doit être positif')
    .max(100, 'Maximum 100%')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimal', 'Maximum 2 décimales', value => 
      value === null || value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  penalite_actif: yup.boolean().default(false),
  chapitre_penalite_id: yup.number().nullable(),
  frais_cloture_anticipe: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimal', 'Maximum 2 décimales', value => 
      value === null || value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  frais_cloture_anticipe_actif: yup.boolean().default(false),
  chapitre_cloture_anticipe_id: yup.number().nullable(),
  
  // Avancé
  minimum_compte: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .test('decimal', 'Maximum 2 décimales', value => 
      value === null || value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  minimum_compte_actif: yup.boolean().default(false),
  // compte_attente_produits_id: yup.number().nullable(),
  retrait_anticipe_autorise: yup.boolean().default(false),
  validation_retrait_anticipe: yup.boolean().default(false),
  duree_blocage_min: yup.number()
    .min(0, 'Doit être positif')
    .nullable(),
  duree_blocage_max: yup.number()
    .min(0, 'Doit être positif')
    .nullable(),
  
  // Observations
  observations: yup.string().nullable()
});

type TypeCompteFormData = yup.InferType<typeof fraisCommissionSchema>;

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
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Composant pour les sections
const SectionTitle = ({ title, icon: Icon }: { title: string, icon?: any }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 4 }}>
    {Icon && <Icon color="primary" sx={{ mr: 1 }} />}
    <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
      {title}
    </Typography>
  </Box>
);

const TypeCompteForm: React.FC<{ isEdit?: boolean }> = ({ isEdit = false }) => {
  const { id } = useParams<{ id?: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [typeComptes] = useState<any[]>([
    { id: 1, libelle: 'Compte Courant' },
    { id: 2, libelle: 'Compte Épargne' },
    { id: 3, libelle: 'Compte Terme' }
  ]);

  const { chapitres } = useChapitres();

  // Fonction pour soumettre le formulaire
  const saveTypeCompte = async (data: any) => {
    try {
      // Formater les données avant envoi
      const formData = {
        ...data,
        // Convertir les valeurs vides en null
        frais_ouverture: data.frais_ouverture || null,
        frais_carnet: data.frais_carnet || null,
        frais_renouvellement_carnet: data.frais_renouvellement_carnet || null,
        frais_perte_carnet: data.frais_perte_carnet || null,
        seuil_commission: data.seuil_commission || null,
        commission_si_superieur: data.commission_si_superieur || null,
        commission_si_inferieur: data.commission_si_inferieur || null,
        commission_retrait: data.commission_retrait || null,
        commission_sms: data.commission_sms || null,
        taux_interet_annuel: data.taux_interet_annuel || null,
        frais_deblocage: data.frais_deblocage || null,
        penalite_retrait_anticipe: data.penalite_retrait_anticipe || null,
        frais_cloture_anticipe: data.frais_cloture_anticipe || null,
        minimum_compte: data.minimum_compte || null,
        duree_blocage_min: data.duree_blocage_min || null,
        duree_blocage_max: data.duree_blocage_max || null,
      };

      const response = await ApiClient.post('/types-comptes/creer', formData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  };

  // Configuration de la mutation pour la création
  const { mutate: createTypeCompte, isLoading: isCreating } = useMutation({
    mutationFn: saveTypeCompte,
    onSuccess: (data) => {
      enqueueSnackbar('Type de compte créé avec succès', { variant: 'success' });
      navigate('/types-comptes'); // Rediriger vers la liste des types de comptes
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Une erreur est survenue lors de la création du type de compte';
      enqueueSnackbar(errorMessage, { variant: 'error' });

      // Afficher les erreurs de validation si elles existent
      if (error?.errors) {
        Object.values(error.errors).forEach((messages: any) => {
          if (Array.isArray(messages)) {
            messages.forEach((message) => {
              enqueueSnackbar(message, { variant: 'error' });
            });
          }
        });
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Fonction de soumission du formulaire
  const onSubmit = (data: any) => {
    setIsSubmitting(true);
    setSubmitError(null);
    createTypeCompte(data, {
      onSettled: () => {
        setIsSubmitting(false);
      }
    });
  };

  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<TypeCompteFormData>({
    resolver: yupResolver(fraisCommissionSchema),
    defaultValues: {
      // Onglet Général
      type_compte_id: '',
      chapitre_id: null,

      // Frais et Commissions
      frais_ouverture: null,
      frais_ouverture_actif: false,
      chapitre_frais_ouverture_id: null,

      frais_carnet: null,
      frais_carnet_actif: false,
      chapitre_frais_carnet_id: null,

      frais_renouvellement_carnet: null,
      frais_renouvellement_actif: false,
      chapitre_renouvellement_id: null,

      frais_perte_carnet: null,
      frais_perte_actif: false,
      chapitre_perte_id: null,

      commission_mensuelle_actif: false,
      seuil_commission: null,
      commission_si_superieur: null,
      commission_si_inferieur: null,

      commission_retrait: null,
      commission_retrait_actif: false,
      chapitre_commission_retrait_id: null,

      commission_sms: null,
      commission_sms_actif: false,
      chapitre_commission_sms_id: null,

      // Intérêts
      taux_interet_annuel: null,
      interets_actifs: false,
      frequence_calcul_interet: 'MENSUEL',
      heure_calcul_interet: '00:00',
      chapitre_interet_credit_id: null,
      capitalisation_interets: false,

      // Frais déblocage
      frais_deblocage: null,
      frais_deblocage_actif: false,
      chapitre_frais_deblocage_id: null,

      // Pénalités
      penalite_retrait_anticipe: null,
      penalite_actif: false,
      chapitre_penalite_id: null,

      frais_cloture_anticipe: null,
      frais_cloture_anticipe_actif: false,
      chapitre_cloture_anticipe_id: null,

      // Avancé
      minimum_compte: null,
      minimum_compte_actif: false,

      retrait_anticipe_autorise: false,
      validation_retrait_anticipe: false,
      duree_blocage_min: null,
      duree_blocage_max: null,

      // Observations
      observations: ''
    }
  });

  // Fonction utilitaire pour les champs numériques avec décimales
  const renderNumberField = useCallback((
    fieldName: keyof TypeCompteFormData,
    label: string,
    controlParam: any,
    adornment?: React.ReactNode,
    step: string = "0.01"
  ) => {
    return (
      <Controller
        name={fieldName}
        control={controlParam}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            type="number"
            label={label}
            fullWidth
            variant="outlined"
            size="small"
            error={!!error}
            helperText={error?.message}
            disabled={isSubmitting}
            InputProps={{
              endAdornment: adornment,
              inputProps: { 
                min: 0,
                step: step
              }
            }}
            value={field.value === null || field.value === undefined ? '' : field.value}
            onChange={(e) => {
              const value = e.target.value === '' ? null : parseFloat(e.target.value);
              field.onChange(value);
            }}
          />
        )}
      />
    );
  }, [isSubmitting]);

  // Fonction utilitaire pour les chapitres avec recherche
  const renderChapterField = useCallback((
    fieldName: keyof TypeCompteFormData,
    label: string,
    controlParam: any,
    disabled: boolean = false
  ) => {
    return (
      <Controller
        name={fieldName}
        control={controlParam}
        render={({ field, fieldState: { error } }) => (
          <Autocomplete
            options={chapitres}
            getOptionLabel={(option) => 
              option ? `${option.code} - ${option.libelle}` : ''
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={chapitres.find(c => c.id === field.value) || null}
            onChange={(_, newValue) => {
              field.onChange(newValue ? newValue.id : null);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                variant="outlined"
                size="small"
                error={!!error}
                helperText={error?.message}
                disabled={disabled || isSubmitting || !chapitres.length}
                placeholder="Sélectionnez un chapitre..."
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body2">
                    <strong>{option.code}</strong> - {option.libelle}
                  </Typography>
                </Box>
              </li>
            )}
            fullWidth
          />
        )}
      />

    );
  }, [chapitres, isSubmitting]);

  // Fonction utilitaire pour les champs avec toggle
  const renderToggleSection = useCallback((
    toggleFieldName: keyof TypeCompteFormData,
    toggleLabel: string,
    fields: Array<{
      name: keyof TypeCompteFormData,
      label: string,
      type: 'number' | 'select' | 'chapter' | 'text',
      adornment?: React.ReactNode,
      step?: string,
      options?: Array<{ value: string, label: string }>
    }>
  ) => {
    const isActive = watch(toggleFieldName);

    return (
      <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1, mb: 3 }}>
        <FormGroup>
          <FormControlLabel
            control={
              <Controller
                name={toggleFieldName}
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
            label={toggleLabel}
            sx={{ mb: isActive ? 2 : 0 }}
          />
        </FormGroup>

        {isActive && (
          <Grid container spacing={2} sx={{ pl: 3, mt: 1 }}>
            {fields.map((field, index) => (
              <Grid item xs={12} md={6} key={index}>
                {field.type === 'number' ? (
                  renderNumberField(field.name, field.label, control, field.adornment, field.step)
                ) : field.type === 'select' && field.options ? (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: selectField }) => (
                      <TextField
                        {...selectField}
                        select
                        label={field.label}
                        fullWidth
                        variant="outlined"
                        size="small"
                        disabled={isSubmitting}
                      >
                        {field.options.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                ) : field.type === 'chapter' ? (
                  renderChapterField(field.name, field.label, control, !isActive)
                ) : (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: textField, fieldState: { error } }) => (
                      <TextField
                        {...textField}
                        label={field.label}
                        fullWidth
                        variant="outlined"
                        size="small"
                        error={!!error}
                        helperText={error?.message}
                        disabled={isSubmitting}
                        multiline={field.type === 'text'}
                        rows={field.type === 'text' ? 4 : 1}
                      />
                    )}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    );
  }, [watch, control, renderNumberField, renderChapterField, isSubmitting]);

  // Gestionnaire pour changer d'onglet
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
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
          transition: 'width 0.3s ease'
        }}
      >
        {/* TopBar */}
        <TopBar sidebarOpen={sidebarOpen} />

        {/* Conteneur principal */}
        <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
          <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            {/* En-tête de la page */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 4,
              pb: 2,
              borderBottom: '1px solid #edf2f7'
            }}>
              <Box>
                <Typography variant="h5" component="h1" sx={{ 
                  fontWeight: 600, 
                  color: '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <AccountBalanceIcon color="primary" />
                  {isEdit ? 'Modifier le type de compte' : 'Nouveau type de compte'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {isEdit ? 'Modifiez les détails du type de compte' : 'Remplissez les informations pour créer un nouveau type de compte'}
                </Typography>
              </Box>

              {/* Bouton de retour */}
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 3,
                  py: 1
                }}
              >
                Retour
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}

            {/* Onglets */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                aria-label="Onglets configuration"
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab 
                  label="Général" 
                  {...a11yProps(0)} 
                  icon={<SettingsIcon fontSize="small" />} 
                  iconPosition="start"
                  sx={{ minHeight: 48 }}
                />
                <Tab 
                  label="Frais & Commissions" 
                  {...a11yProps(1)} 
                  icon={<ReceiptIcon fontSize="small" />} 
                  iconPosition="start"
                  sx={{ minHeight: 48 }}
                />
                <Tab 
                  label="Intérêts" 
                  {...a11yProps(2)} 
                  icon={<AccountTreeIcon fontSize="small" />} 
                  iconPosition="start"
                  sx={{ minHeight: 48 }}
                />
                <Tab 
                  label="Avancé" 
                  {...a11yProps(3)} 
                  icon={<InfoIcon fontSize="small" />} 
                  iconPosition="start"
                  sx={{ minHeight: 48 }}
                />
              </Tabs>
            </Box>

            {/* Formulaire */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Onglet Général */}
              <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="type_compte_id"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Type de compte"
                          fullWidth
                          variant="outlined"
                          size="small"
                          error={!!error}
                          helperText={error?.message || ' '}
                          disabled={isSubmitting}
                          placeholder="Entrez le type de compte"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    {renderChapterField('chapitre_id', 'Chapitre principal', control)}
                  </Grid>
                  <Grid container spacing={2}>
  <Grid item xs={12} md={4}>
    <Controller
      name="code"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          label="Code *"
          error={!!errors.code}
          helperText={errors.code?.message}
          fullWidth
        />
      )}
    />
  </Grid>
  
  <Grid item xs={12} md={8}>
    <Controller
      name="libelle"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          label="Libellé *"
          error={!!errors.libelle}
          helperText={errors.libelle?.message}
          fullWidth
        />
        
      )}
    />
  </Grid>
</Grid>
                </Grid>
              </TabPanel>

              {/* Onglet Frais & Commissions */}
              <TabPanel value={activeTab} index={1}>
                <Grid container spacing={3}>
                  {/* Section Frais */}
                  <Grid item xs={12}>
                    <SectionTitle title="Frais" icon={MoneyIcon} />
                  </Grid>

                  <Grid item xs={12}>
                    {renderToggleSection('frais_ouverture_actif', 'Frais d\'ouverture', [
                      { 
                        name: 'frais_ouverture', 
                        label: 'Montant des frais d\'ouverture', 
                        type: 'number',
                        adornment: <InputAdornment position="start">FCFA</InputAdornment>
                      },
                      { 
                        name: 'chapitre_frais_ouverture_id', 
                        label: 'Chapitre des frais d\'ouverture', 
                        type: 'chapter' 
                      }
                    ])}
                  </Grid>

                  <Grid item xs={12}>
                    {renderToggleSection('frais_carnet_actif', 'Frais de carnet', [
                      { 
                        name: 'frais_carnet', 
                        label: 'Montant des frais de carnet', 
                        type: 'number',
                        adornment: <InputAdornment position="start">FCFA</InputAdornment>
                      },
                      { 
                        name: 'chapitre_frais_carnet_id', 
                        label: 'Chapitre des frais de carnet', 
                        type: 'chapter' 
                      }
                    ])}
                  </Grid>

                  <Grid item xs={12}>
                    {renderToggleSection('frais_renouvellement_actif', 'Frais de renouvellement', [
                      { 
                        name: 'frais_renouvellement_carnet', 
                        label: 'Montant des frais de renouvellement', 
                        type: 'number',
                        adornment: <InputAdornment position="start">FCFA</InputAdornment>
                      },
                      { 
                        name: 'chapitre_renouvellement_id', 
                        label: 'Chapitre des frais de renouvellement', 
                        type: 'chapter' 
                      }
                    ])}
                  </Grid>

                  <Grid item xs={12}>
                    {renderToggleSection('frais_perte_actif', 'Frais de perte de carnet', [
                      { 
                        name: 'frais_perte_carnet', 
                        label: 'Montant des frais de perte', 
                        type: 'number',
                        adornment: <InputAdornment position="start">FCFA</InputAdornment>
                      },
                      { 
                        name: 'chapitre_perte_id', 
                        label: 'Chapitre des frais de perte', 
                        type: 'chapter' 
                      }
                    ])}
                  </Grid>

                  {/* Section Commission mensuelle */}
                  <Grid item xs={12}>
                    <SectionTitle title=" frais d'entretien de compte" icon={PercentIcon} />
                  </Grid>

                  <Grid item xs={12}>
                    {renderToggleSection('commission_mensuelle_actif', ' frais d\'entretien de compte', [
                      { 
                        name: 'seuil_commission', 
                        label: 'Seuil de commission', 
                        type: 'number',
                        adornment: <InputAdornment position="start">FCFA</InputAdornment>
                      },
                      { 
                        name: 'commission_si_superieur', 
                        label: 'Commission si supérieur au seuil', 
                        type: 'number',
                        adornment: <InputAdornment position="start">FCFA</InputAdornment>
                      },
                      { 
                        name: 'commission_si_inferieur', 
                        label: 'Commission si inférieur au seuil', 
                        type: 'number',
                        adornment: <InputAdornment position="start">FCFA</InputAdornment>
                      }
                    ])}
                  </Grid>

                  {/* Section Commission retrait */}
                  <Grid item xs={12}>
                    <SectionTitle title="Commission de retrait" icon={PercentIcon} />
                  </Grid>

                  <Grid item xs={12}>
                    {renderToggleSection('commission_retrait_actif', 'Commission de retrait', [
                      { 
                        name: 'commission_retrait', 
                        label: 'Taux de commission', 
                        type: 'number',
                        adornment: <InputAdornment position="start">%</InputAdornment>,
                        step: "0.01"
                      },
                      { 
                        name: 'chapitre_commission_retrait_id', 
                        label: 'Chapitre de la commission', 
                        type: 'chapter' 
                      }
                    ])}
                  </Grid>

                  {/* Section Commission SMS */}
                  <Grid item xs={12}>
                    <SectionTitle title="Commission SMS" icon={MoneyIcon} />
                  </Grid>

                  <Grid item xs={12}>
                    {renderToggleSection('commission_sms_actif', 'Commission SMS', [
                      { 
                        name: 'commission_sms', 
                        label: 'Montant commission SMS', 
                        type: 'number',
                        adornment: <InputAdornment position="start">FCFA</InputAdornment>
                      },
                      { 
                        name: 'chapitre_commission_sms_id', 
                        label: 'Chapitre commission SMS', 
                        type: 'chapter' 
                      }
                    ])}
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Onglet Intérêts */}
              <TabPanel value={activeTab} index={2}>
                <Grid container spacing={3}>
                  {/* Section Intérêts */}
                  <Grid item xs={12}>
                    <SectionTitle title="Intérêts" icon={PercentIcon} />
                  </Grid>

                  <Grid item xs={12}>
                    {renderToggleSection('interets_actifs', 'Intérêts', [
                      { 
                        name: 'taux_interet_annuel', 
                        label: 'Taux d\'intérêt annuel', 
                        type: 'number',
                        adornment: <InputAdornment position="start">%</InputAdornment>,
                        step: "0.01"
                      },
                      { 
                        name: 'frequence_calcul_interet', 
                        label: 'Fréquence de calcul', 
                        type: 'select',
                        options: [
                          { value: 'JOURNALIER', label: 'JOURNALIER' },
                          { value: 'MENSUEL', label: 'Mensuel' },
                          { value: 'ANNUEL', label: 'ANNUEL' }
                        ]
                      },
                      { 
                        name: 'heure_calcul_interet', 
                        label: 'Heure de calcul', 
                        type: 'text' 
                      },
                      { 
                        name: 'chapitre_interet_credit_id', 
                        label: 'Chapitre des intérêts créditeurs', 
                        type: 'chapter' 
                      }
                    ])}
                  </Grid>

                  {watch('interets_actifs') && (
                    <Grid item xs={12}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1, mb: 3 }}>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Controller
                                name="capitalisation_interets"
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
                            label="Capitalisation des intérêts"
                          />
                        </FormGroup>
                      </Paper>
                    </Grid>
                  )}

                  {/* Section Frais déblocage */}
                  <Grid item xs={12}>
                    <SectionTitle title="Frais de déblocage" icon={MoneyIcon} />
                  </Grid>

                  <Grid item xs={12}>
                    {renderToggleSection('frais_deblocage_actif', 'Frais de déblocage', [
                      { 
                        name: 'frais_deblocage', 
                        label: 'Montant des frais de déblocage', 
                        type: 'number',
                        adornment: <InputAdornment position="start">FCFA</InputAdornment>
                      },
                      { 
                        name: 'chapitre_frais_deblocage_id', 
                        label: 'Chapitre des frais de déblocage', 
                        type: 'chapter' 
                      }
                    ])}
                  </Grid>

                  {/* Section Pénalités */}
                  <Grid item xs={12}>
                    <SectionTitle title="Pénalités" icon={WarningIcon} />
                  </Grid>

                  <Grid item xs={12}>
                    {renderToggleSection('penalite_actif', 'Pénalité de retrait anticipé', [
                      { 
                        name: 'penalite_retrait_anticipe', 
                        label: 'Taux de pénalité', 
                        type: 'number',
                        adornment: <InputAdornment position="start">%</InputAdornment>,
                        step: "0.01"
                      },
                      { 
                        name: 'chapitre_penalite_id', 
                        label: 'Chapitre des pénalités', 
                        type: 'chapter' 
                      }
                    ])}
                  </Grid>

                  <Grid item xs={12}>
                    {renderToggleSection('frais_cloture_anticipe_actif', 'Frais de clôture anticipée', [
                      { 
                        name: 'frais_cloture_anticipe', 
                        label: 'Montant des frais de clôture', 
                        type: 'number',
                        adornment: <InputAdornment position="start">FCFA</InputAdornment>
                      },
                      { 
                        name: 'chapitre_cloture_anticipe_id', 
                        label: 'Chapitre des frais de clôture', 
                        type: 'chapter' 
                      }
                    ])}
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Onglet Avancé */}
              <TabPanel value={activeTab} index={3}>
                <Grid container spacing={3}>
                  {/* Section Minimum de compte */}
                  <Grid item xs={12}>
                    <SectionTitle title="Minimum de compte" icon={MoneyIcon} />
                  </Grid>

                  <Grid item xs={12}>
                    {renderToggleSection('minimum_compte_actif', 'Minimum de compte', [
                      { 
                        name: 'minimum_compte', 
                        label: 'Montant minimum', 
                        type: 'number',
                        adornment: <InputAdornment position="start">FCFA</InputAdornment>
                      }
                    ])}
                  </Grid>

                  {/* Section Compte attente 
                  <Grid item xs={12}>
                    <SectionTitle title="Compte d'attente" />
                  </Grid>*/}

                  <Grid item xs={12}>
                    {/* renderChapterField('compte_attente_produits_id', 'Compte d\'attente des produits', control) */}
                  </Grid>

                  {/* Section Retraits anticipés */}
                  <Grid item xs={12}>
                    <SectionTitle title="Retraits anticipés" />
                  </Grid>

                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1, mb: 3 }}>
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

                      {watch('retrait_anticipe_autorise') && (
                        <Grid container spacing={2} sx={{ pl: 3, mt: 1 }}>
                          <Grid item xs={12}>
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

                          <Grid item xs={12} md={6}>
                            {renderNumberField('duree_blocage_min', 'Durée blocage minimum (jours)', control, undefined, "1")}
                          </Grid>

                          <Grid item xs={12} md={6}>
                            {renderNumberField('duree_blocage_max', 'Durée blocage maximum (jours)', control, undefined, "1")}
                          </Grid>
                        </Grid>
                      )}
                    </Paper>
                  </Grid>

                  {/* Section Observations */}
                  <Grid item xs={12}>
                    <SectionTitle title="Observations" />
                  </Grid>

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
                          placeholder="Ajoutez des notes ou observations supplémentaires..."
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Boutons d'action */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: 2, 
                mt: 4,
                pt: 3,
                borderTop: '1px solid #edf2f7'
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                  sx={{ 
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    borderColor: '#d1d5db',
                    color: '#4b5563',
                    '&:hover': {
                      borderColor: '#9ca3af',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{ 
                    textTransform: 'none',
                    px: 4,
                    py: 1,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
                    '&:hover': {
                      boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                    }
                  }}
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </Box>
            </form>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default TypeCompteForm;