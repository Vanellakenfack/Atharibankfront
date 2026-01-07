import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useChapitres } from '../../hooks/useChapitres';
import type { Chapitre } from '../../hooks/useChapitres';
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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip
} from '@mui/material';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import { Grid } from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon, 
  AccountBalance as AccountBalanceIcon,
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  AccountTree as AccountTreeIcon,
  Info as InfoIcon,
  Percent as PercentIcon,
  Money as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import ApiClient from '../../services/api/ApiClient';
import { useMutation } from "@tanstack/react-query";

// Schéma de validation - SEULS code et libelle sont obligatoires
const fraisCommissionSchema = yup.object().shape({
  // Champs obligatoires SEULEMENT
  code: yup.string().required('Le code est requis'),
  libelle: yup.string().required('Le libellé est requis'),
  
  // Tous les autres champs sont facultatifs
  type_compte_id: yup.string().nullable(),
  chapitre_id: yup.number().nullable(),
  description: yup.string().nullable(),
  
  // Frais et Commissions - tous facultatifs
  frais_ouverture: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  frais_ouverture_actif: yup.boolean().default(false),
  chapitre_frais_ouverture_id: yup.number().nullable(),
  
  frais_carnet: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  frais_carnet_actif: yup.boolean().default(false),
  chapitre_frais_carnet_id: yup.number().nullable(),
  
  frais_renouvellement_carnet: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  frais_renouvellement_actif: yup.boolean().default(false),
  chapitre_renouvellement_id: yup.number().nullable(),
  
  frais_perte_carnet: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  frais_perte_actif: yup.boolean().default(false),
  chapitre_perte_id: yup.number().nullable(),
  
  commission_mensuelle_actif: yup.boolean().default(false),
  seuil_commission: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  commission_si_superieur: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  commission_si_inferieur: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  commission_retrait: yup.number()
    .min(0, 'Doit être positif')
    .max(100, 'Maximum 100%')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  commission_retrait_actif: yup.boolean().default(false),
  chapitre_commission_retrait_id: yup.number().nullable(),
  
  commission_sms: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  commission_sms_actif: yup.boolean().default(false),
  chapitre_commission_sms_id: yup.number().nullable(),
  
  // Intérêts - tous facultatifs
  taux_interet_annuel: yup.number()
    .min(0, 'Doit être positif')
    .max(100, 'Maximum 100%')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  interets_actifs: yup.boolean().default(false),
  frequence_calcul_interet: yup.string().nullable(),
  heure_calcul_interet: yup.string().nullable(),
  chapitre_interet_credit_id: yup.number().nullable(),
  capitalisation_interets: yup.boolean().default(false),
  
  // Frais déblocage - tous facultatifs
  frais_deblocage: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  frais_deblocage_actif: yup.boolean().default(false),
  chapitre_frais_deblocage_id: yup.number().nullable(),
  
  // Pénalités - tous facultatifs
  penalite_retrait_anticipe: yup.number()
    .min(0, 'Doit être positif')
    .max(100, 'Maximum 100%')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  penalite_actif: yup.boolean().default(false),
  chapitre_penalite_id: yup.number().nullable(),
  
  frais_cloture_anticipe: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  frais_cloture_anticipe_actif: yup.boolean().default(false),
  chapitre_cloture_anticipe_id: yup.number().nullable(),
  
  // Avancé - tous facultatifs
  minimum_compte: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  minimum_compte_actif: yup.boolean().default(false),
  retrait_anticipe_autorise: yup.boolean().default(false),
  validation_retrait_anticipe: yup.boolean().default(false),
  
  duree_blocage_min: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  duree_blocage_max: yup.number()
    .min(0, 'Doit être positif')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  // Observations - facultatif
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

// Composant mémoïsé pour les champs de chapitres avec largeur augmentée
const ChapterField = React.memo(({
  name,
  label,
  control,
  chapitres,
  isSubmitting,
  disabled = false
}: {
  name: keyof TypeCompteFormData;
  label: string;
  control: any;
  chapitres: Chapitre[];
  isSubmitting: boolean;
  disabled?: boolean;
}) => {
  // Options formatées pour l'autocomplete
  const chapterOptions = useMemo(() => {
    return chapitres.map(chapitre => ({
      ...chapitre,
      displayText: `${chapitre.code} - ${chapitre.libelle}`
    }));
  }, [chapitres]);

  return (
    <Box sx={{ minWidth: 250 }}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const selectedValue = field.value 
            ? chapterOptions.find(c => c.id === field.value)
            : null;

          return (
            <Autocomplete
              options={chapterOptions}
              getOptionLabel={(option) => option?.displayText || ''}
              isOptionEqualToValue={(option, value) => 
                option && value ? option.id === value.id : false
              }
              value={selectedValue}
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
                  helperText={error?.message || 'Tapez pour rechercher...'}
                  disabled={disabled || isSubmitting}
                  placeholder="Rechercher un chapitre..."
                  sx={{ minWidth: 250 }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <React.Fragment>
                        <SearchIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                        {params.InputProps.startAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" fontWeight="medium">
                      {option.code} - {option.libelle}
                    </Typography>
                    {option.categorie && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <FilterListIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.75rem' }} />
                        <Typography variant="caption" color="text.secondary">
                          {option.categorie.nom}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </li>
              )}
              filterOptions={(options, { inputValue }) => {
                if (!inputValue.trim()) return options;
                
                const searchTerm = inputValue.toLowerCase();
                return options.filter(option => 
                  option.code.toLowerCase().includes(searchTerm) ||
                  option.libelle.toLowerCase().includes(searchTerm) ||
                  (option.categorie?.nom?.toLowerCase()?.includes(searchTerm) || false)
                );
              }}
              loading={chapitres.length === 0}
              loadingText="Chargement des chapitres..."
              noOptionsText={
                chapitres.length === 0 
                  ? "Aucun chapitre disponible" 
                  : "Aucun chapitre correspondant"
              }
              fullWidth
              clearOnBlur={false}
              blurOnSelect
              sx={{ minWidth: 250 }}
            />
          );
        }}
      />
    </Box>
  );
});

ChapterField.displayName = 'ChapterField';

const TypeCompteForm: React.FC<{ isEdit?: boolean }> = ({ isEdit = false }) => {
  const { id } = useParams<{ id?: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdTypeCompte, setCreatedTypeCompte] = useState<any>(null);

  const { chapitres, loading: loadingChapitres, error: chapitresError, totalChapitres } = useChapitres();

  // Fonction pour soumettre le formulaire
  const saveTypeCompte = async (data: any) => {
    try {
      console.log('Données envoyées à l\'API:', data);
      
      // Formater les données avant envoi - OPTION 1: Envoyer 0 au lieu de null
      const formData = {
        ...data,
        // Convertir les valeurs null en 0 pour les champs qui ne peuvent pas être null
        frais_ouverture: data.frais_ouverture || 0,
        frais_carnet: data.frais_carnet || 0,
        frais_renouvellement_carnet: data.frais_renouvellement_carnet || 0,
        frais_perte_carnet: data.frais_perte_carnet || 0,
        seuil_commission: data.seuil_commission || 0,
        commission_si_superieur: data.commission_si_superieur || 0,
        commission_si_inferieur: data.commission_si_inferieur || 0,
        commission_retrait: data.commission_retrait || 0,
        commission_sms: data.commission_sms || 0,
        taux_interet_annuel: data.taux_interet_annuel || 0,
        frais_deblocage: data.frais_deblocage || 0,
        penalite_retrait_anticipe: data.penalite_retrait_anticipe || 0,
        frais_cloture_anticipe: data.frais_cloture_anticipe || 0,
        minimum_compte: data.minimum_compte || 0,
        duree_blocage_min: data.duree_blocage_min || 0,
        duree_blocage_max: data.duree_blocage_max || 0,
      };

      const response = await ApiClient.post('/types-comptes/creer', formData);
      return response.data;
    } catch (error: any) {
      console.error('Erreur API:', error);
      
      // Extraire le message d'erreur de la réponse
      let errorMessage = 'Erreur lors de la création du type de compte';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Afficher les détails de l'erreur SQL si disponible
      if (error.response?.data?.errors) {
        console.error('Erreurs de validation:', error.response.data.errors);
      }
      
      throw new Error(errorMessage);
    }
  };

  // Configuration de la mutation
  const { mutate: createTypeCompte, isPending: isSubmitting } = useMutation({
    mutationFn: saveTypeCompte,
    onSuccess: (data) => {
      console.log('Succès de la création:', data);
      
      // Stocker les données créées pour les afficher dans la modal
      setCreatedTypeCompte(data);
      
      // Ouvrir la modal de confirmation au lieu de rediriger immédiatement
      setSuccessModalOpen(true);
      
      // Notification toast
      enqueueSnackbar('Type de compte créé avec succès', { 
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        }
      });
    },
    onError: (error: any) => {
      console.error('Erreur de mutation:', error);
      const errorMessage = error?.message || 'Une erreur est survenue lors de la création du type de compte';
      setSubmitError(errorMessage);
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        }
      });
    }
  });

  // Fonction pour fermer la modal et rediriger
  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    navigate('/Liste-type-de-compte');
  };

  // Fonction pour rester sur la page (créer un nouveau type de compte)
  const handleStayAndCreateNew = () => {
    setSuccessModalOpen(false);
    // Réinitialiser le formulaire
    reset();
    // Réinitialiser les autres états si nécessaire
    setCreatedTypeCompte(null);
    setSubmitError(null);
    setActiveTab(0);
  };

  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    watch, 
    setValue,
    reset
  } = useForm<TypeCompteFormData>({
    resolver: yupResolver(fraisCommissionSchema),
    mode: 'onChange',
    defaultValues: {
      // Champs obligatoires
      code: '',
      libelle: '',
      
      // Onglet Général
      type_compte_id: '',
      chapitre_id: null,
      description: '',

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

  // Fonction pour soumettre le formulaire
  const onSubmit = async (data: TypeCompteFormData) => {
    console.log('Données du formulaire:', data);
    
    try {
      // Vérification des champs obligatoires seulement
      if (!data.code || !data.libelle) {
        setSubmitError('Veuillez remplir les champs obligatoires (Code et Libellé)');
        return;
      }

      // Appel de la mutation
      createTypeCompte(data);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setSubmitError('Une erreur est survenue lors de la soumission du formulaire');
    }
  };

  // Fonction utilitaire pour les champs numériques
  const renderNumberField = useCallback((
    fieldName: keyof TypeCompteFormData,
    label: string,
    controlParam: any,
    adornment?: React.ReactNode,
    step: string = "0.01"
  ) => {
    return (
      <Box sx={{ minWidth: 250 }}>
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
              sx={{ minWidth: 250 }}
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
      </Box>
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
      <Box sx={{ minWidth: 250 }}>
        <ChapterField
          name={fieldName}
          label={label}
          control={controlParam}
          chapitres={chapitres}
          isSubmitting={isSubmitting}
          disabled={disabled}
        />
      </Box>
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
                    onChange={(e) => field.onChange(e.target.checked)}
                    color="primary"
                    disabled={isSubmitting}
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
                  <Box sx={{ minWidth: 250 }}>
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
                          sx={{ minWidth: 250 }}
                        >
                          {field.options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Box>
                ) : field.type === 'chapter' ? (
                  renderChapterField(field.name, field.label, control, !isActive)
                ) : (
                  <Box sx={{ minWidth: 250 }}>
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
                          sx={{ minWidth: 250 }}
                        />
                      )}
                    />
                  </Box>
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
          {/* Indicateur de chargement des chapitres */}
          {loadingChapitres && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <CircularProgress size={20} sx={{ mr: 2 }} />
              <Typography variant="body2">
                Chargement des chapitres... ({totalChapitres} trouvés)
              </Typography>
            </Box>
          )}

          {chapitresError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {chapitresError}
            </Alert>
          )}

          {!loadingChapitres && chapitres.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Chip 
                label={`${totalChapitres} chapitres disponibles`}
                color="primary"
                size="small"
                variant="outlined"
              />
            </Box>
          )}

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
                disabled={isSubmitting}
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
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                onClose={() => setSubmitError(null)}
              >
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
                  {/* Code - Champ OBLIGATOIRE */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ minWidth: 250 }}>
                      <Controller
                        name="code"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Code *"
                            fullWidth
                            variant="outlined"
                            size="small"
                            error={!!error}
                            helperText={error?.message}
                            disabled={isSubmitting}
                            required
                            sx={{ minWidth: 250 }}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  
                  {/* Libellé - Champ OBLIGATOIRE */}
                  <Grid item xs={12} md={8}>
                    <Box sx={{ minWidth: 250 }}>
                      <Controller
                        name="libelle"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Libellé *"
                            fullWidth
                            variant="outlined"
                            size="small"
                            error={!!error}
                            helperText={error?.message}
                            disabled={isSubmitting}
                            required
                            sx={{ minWidth: 250 }}
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  {/* Type de compte - Champ FACULTATIF */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ minWidth: 250 }}>
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
                            helperText={error?.message}
                            disabled={isSubmitting}
                            placeholder="Entrez le type de compte"
                            sx={{ minWidth: 250 }}
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  {/* Chapitre principal - Champ FACULTATIF */}
                  <Grid item xs={12} md={6}>
                    {renderChapterField('chapitre_id', 'Chapitre principal', control)}
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <Box sx={{ minWidth: 250 }}>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            size="small"
                            error={!!error}
                            helperText={error?.message}
                            disabled={isSubmitting}
                            placeholder="Description du type de compte"
                            sx={{ minWidth: 250 }}
                          />
                        )}
                      />
                    </Box>
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
                        adornment: <InputAdornment position="end">FCFA</InputAdornment>
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
                        adornment: <InputAdornment position="end">FCFA</InputAdornment>
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
                        adornment: <InputAdornment position="end">FCFA</InputAdornment>
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
                        adornment: <InputAdornment position="end">FCFA</InputAdornment>
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
                    <SectionTitle title="frais d'entretien de compte" icon={PercentIcon} />
                  </Grid>

                  <Grid item xs={12}>
                    {renderToggleSection('commission_mensuelle_actif', 'frais d\'entretien de compte', [
                      { 
                        name: 'seuil_commission', 
                        label: 'Seuil de commission', 
                        type: 'number',
                        adornment: <InputAdornment position="end">FCFA</InputAdornment>
                      },
                      { 
                        name: 'commission_si_superieur', 
                        label: 'Commission si supérieur au seuil', 
                        type: 'number',
                        adornment: <InputAdornment position="end">FCFA</InputAdornment>
                      },
                      { 
                        name: 'commission_si_inferieur', 
                        label: 'Commission si inférieur au seuil', 
                        type: 'number',
                        adornment: <InputAdornment position="end">FCFA</InputAdornment>
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
                        adornment: <InputAdornment position="end">%</InputAdornment>,
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
                        adornment: <InputAdornment position="end">FCFA</InputAdornment>
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
                        adornment: <InputAdornment position="end">%</InputAdornment>,
                        step: "0.01"
                      },
                      { 
                        name: 'frequence_calcul_interet', 
                        label: 'Fréquence de calcul', 
                        type: 'select',
                        options: [
                          { value: 'JOURNALIER', label: 'Journalier' },
                          { value: 'MENSUEL', label: 'Mensuel' },
                          { value: 'ANNUEL', label: 'Annuel' }
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
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    color="primary"
                                    disabled={isSubmitting}
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
                        adornment: <InputAdornment position="end">FCFA</InputAdornment>
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
                        adornment: <InputAdornment position="end">%</InputAdornment>,
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
                        adornment: <InputAdornment position="end">FCFA</InputAdornment>
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
                        adornment: <InputAdornment position="end">FCFA</InputAdornment>
                      }
                    ])}
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
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  color="primary"
                                  disabled={isSubmitting}
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
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        color="primary"
                                        disabled={isSubmitting}
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
                    <Box sx={{ minWidth: 250 }}>
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
                            sx={{ minWidth: 250 }}
                          />
                        )}
                      />
                    </Box>
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
                    borderRadius: '8px'
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

      {/* Modal de confirmation de succès */}
      <Dialog
        open={successModalOpen}
        onClose={handleCloseSuccessModal}
        aria-labelledby="success-dialog-title"
        aria-describedby="success-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="success-dialog-title" sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          bgcolor: '#f0f9ff',
          color: '#0369a1'
        }}>
          <CheckCircleIcon color="success" fontSize="large" />
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            Type de compte créé avec succès
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText id="success-dialog-description">
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Le type de compte a été créé avec succès.
              </Typography>
              {createdTypeCompte && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Détails du type de compte :
                  </Typography>
                  <Typography variant="body2">
                    <strong>Code :</strong> {createdTypeCompte.code}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Libellé :</strong> {createdTypeCompte.libelle}
                  </Typography>
                  {createdTypeCompte.type_compte_id && (
                    <Typography variant="body2">
                      <strong>Type :</strong> {createdTypeCompte.type_compte_id}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
            <Typography variant="body2" color="textSecondary">
              Que souhaitez-vous faire maintenant ?
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleStayAndCreateNew}
            variant="outlined"
            color="primary"
            sx={{ 
              textTransform: 'none',
              px: 3
            }}
          >
            Créer un autre type de compte
          </Button>
          <Button
            onClick={handleCloseSuccessModal}
            variant="contained"
            color="primary"
            autoFocus
            sx={{ 
              textTransform: 'none',
              px: 4
            }}
          >
            Voir la liste des types de compte
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TypeCompteForm;