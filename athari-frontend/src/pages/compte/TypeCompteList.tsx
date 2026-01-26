import React, { useState, useEffect, useMemo, useCallback, useRef  } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, IconButton, Chip, Typography, Box, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, 
  FormControlLabel, Checkbox, InputAdornment, Snackbar, Alert,
  Tooltip, Select, MenuItem, Pagination, FormControl, InputLabel,
  Tabs, Tab, Divider, Grid, Card, CardContent, CardHeader, List, ListItem, ListItemText,
  Autocomplete
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQuery } from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import PercentIcon from '@mui/icons-material/Percent';
import WarningIcon from '@mui/icons-material/Warning';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import ApiClient from '@/services/api/ApiClient';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

// Interface pour les chapitres
interface Chapitre {
  id: number;
  code: string;
  libelle: string;
  categorie?: {
    id: number;
    code: string;
    libelle: string; // Changé de 'nom' à 'libelle'
  };
}

// Hook personnalisé pour la gestion des chapitres
const useChapitres = () => {
  const [searchResults, setSearchResults] = useState<Chapitre[]>([]);
  const [loading, setLoading] = useState(false);
  const cache = useRef<Map<number, Chapitre>>(new Map());
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Options fréquemment utilisées (préchargées)
  const { 
    data: frequentOptions = [], 
    isLoading: loadingFrequent 
  } = useQuery({
    queryKey: ['frequentChapitres'],
    queryFn: async () => {
      try {
        const response = await ApiClient.get('/plan-comptable/comptes/options', {
          params: { limit: 30 }
        });
        return response.data?.data || [];
      } catch (error) {
        console.error('Erreur chargement chapitres fréquents:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  // Recherche avec debounce
  const searchChapitres = useCallback(async (query: string): Promise<Chapitre[]> => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return [];
    }

    // Debounce
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    return new Promise((resolve) => {
      searchTimeout.current = setTimeout(async () => {
        setLoading(true);
        try {
          const response = await ApiClient.get('/plan-comptable/comptes/search', {
            params: { q: query, limit: 50 }
          });

          const results = response.data?.data || [];
          setSearchResults(results);
          
          // Mettre en cache
          results.forEach((chapitre: Chapitre) => {
            cache.current.set(chapitre.id, chapitre);
          });
          
          resolve(results);
        } catch (error) {
          console.error('Erreur recherche chapitres:', error);
          setSearchResults([]);
          resolve([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    });
  }, []);

  // Récupérer un chapitre par ID
  const getChapitreById = useCallback(async (id: number): Promise<Chapitre | null> => {
    // Vérifier le cache
    if (cache.current.has(id)) {
      return cache.current.get(id) || null;
    }

    try {
      const response = await ApiClient.get(`/plan-comptable/comptes/${id}`);
      const chapitre = response.data?.data || null;
      
      if (chapitre) {
        cache.current.set(id, chapitre);
      }
      
      return chapitre;
    } catch (error) {
      console.error('Erreur chargement chapitre:', error);
      return null;
    }
  }, []);

  // Nettoyage du timeout
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  return {
    searchResults,
    loading,
    loadingFrequent,
    searchChapitres,
    getChapitreById,
    frequentOptions,
    cache: cache.current
  };
};

// Composant DetailItem réutilisable
interface DetailItemProps {
  label: string;
  value: string | number | null | undefined;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | string;
  multiline?: boolean;
}

const DetailItem = ({ label, value, color = 'default', multiline = false }: DetailItemProps) => {
  const displayValue = value === undefined || value === null ? 'Non défini' : value.toString();
  
  return (
    <>
      <ListItem sx={{ py: 1 }}>
        <ListItemText 
          primary={
            <Typography variant="subtitle2" color="text.secondary">
              {label}
            </Typography>
          }
          secondary={
            <Typography 
              variant="body2" 
              color={color === 'default' ? 'text.primary' : color}
              sx={{ 
                wordBreak: 'break-word',
                whiteSpace: multiline ? 'pre-line' : 'normal',
                overflow: 'visible'
              }}
            >
              {displayValue}
            </Typography>
          }
          secondaryTypographyProps={{
            component: 'div'
          }}
        />
      </ListItem>
      <Divider component="li" />
    </>
  );
};

interface TypeCompte {
  id: number;
  code: string;
  libelle: string;
  description: string | null;
  est_mata: boolean;
  necessite_duree: boolean;
  est_islamique: boolean;
  actif: boolean;
  frais_ouverture?: number | null;
  frais_ouverture_actif?: boolean;
  chapitre_frais_ouverture_id?: number | null;
  frais_carnet?: number | null;
  frais_carnet_actif?: boolean;
  chapitre_frais_carnet_id?: number | null;
  frais_renouvellement_carnet?: number | null;
  frais_renouvellement_actif?: boolean;
  chapitre_renouvellement_id?: number | null;
  frais_perte_carnet?: number | null;
  frais_perte_actif?: boolean;
  chapitre_perte_id?: number | null;
  commission_mensuelle_actif?: boolean;
  seuil_commission?: number | null;
  commission_si_superieur?: number | null;
  commission_si_inferieur?: number | null;
  commission_retrait?: number | null;
  commission_retrait_actif?: boolean;
  chapitre_commission_retrait_id?: number | null;
  commission_sms?: number | null;
  commission_sms_actif?: boolean;
  chapitre_commission_sms_id?: number | null;
  taux_interet_annuel?: number | null;
  interets_actifs?: boolean;
  frequence_calcul_interet?: string | null;
  heure_calcul_interet?: string | null;
  chapitre_interet_credit_id?: number | null;
  capitalisation_interets?: boolean;
  frais_deblocage?: number | null;
  frais_deblocage_actif?: boolean;
  chapitre_frais_deblocage_id?: number | null;
  penalite_retrait_anticipe?: number | null;
  penalite_actif?: boolean;
  chapitre_penalite_id?: number | null;
  frais_cloture_anticipe?: number | null;
  frais_cloture_anticipe_actif?: boolean;
  chapitre_cloture_anticipe_id?: number | null;
  chapitre_id?: number | null;
  type_compte_id?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  a_vue?: boolean;
  observations?: string;
  chapitre_defaut_id?: number | null;
  compte_attente_produits_id?: number | null;
  retrait_anticipe_autorise?: boolean;
  validation_retrait_anticipe?: boolean;
  duree_blocage_min?: number | null;
  duree_blocage_max?: number | null;
  minimum_compte_actif?: boolean;
  minimum_compte?: number | null;
}

// Composant ChapitreSelect réutilisable
interface ChapitreSelectProps {
  field: any;
  fieldState: any;
  label: string;
  helperText?: string;
  disabled?: boolean;
}

const ChapitreSelectComponent: React.FC<ChapitreSelectProps> = ({
  field,
  fieldState,
  label,
  helperText = "",
  disabled = false
}) => {
  const {
    searchResults,
    loading,
    loadingFrequent,
    searchChapitres,
    getChapitreById,
    frequentOptions
  } = useChapitres();

  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<any>(null);

  // Charger le chapitre sélectionné
  useEffect(() => {
    const loadSelectedChapitre = async () => {
      if (field.value && typeof field.value === 'number') {
        const chapitre = await getChapitreById(field.value);
        if (chapitre) {
          const option = {
            id: chapitre.id,
            label: `${chapitre.code} - ${chapitre.libelle}`,
            value: chapitre.id,
            chapitre
          };
          setSelectedOption(option);
        }
      } else {
        setSelectedOption(null);
      }
    };

    loadSelectedChapitre();
  }, [field.value, getChapitreById]);

  // Initialiser avec les options fréquentes
  useEffect(() => {
    if (frequentOptions.length > 0) {
      const frequentOpts = frequentOptions.map(chapitre => ({
        id: chapitre.id,
        label: `${chapitre.code} - ${chapitre.libelle}`,
        value: chapitre.id,
        chapitre
      }));
      setOptions(frequentOpts);
    }
  }, [frequentOptions]);

  // Mettre à jour avec les résultats de recherche
  useEffect(() => {
    if (searchResults.length > 0) {
      const searchOpts = searchResults.map(chapitre => ({
        id: chapitre.id,
        label: `${chapitre.code} - ${chapitre.libelle}`,
        value: chapitre.id,
        chapitre
      }));
      
      // Fusionner avec les options fréquentes sans doublons
      setOptions(prev => {
        const allOptions = [...searchOpts];
        const existingIds = new Set(allOptions.map(opt => opt.id));
        
        // Ajouter les options fréquentes qui ne sont pas déjà présentes
        frequentOptions.forEach(chapitre => {
          if (!existingIds.has(chapitre.id)) {
            allOptions.push({
              id: chapitre.id,
              label: `${chapitre.code} - ${chapitre.libelle}`,
              value: chapitre.id,
              chapitre
            });
          }
        });
        
        // Garder l'option sélectionnée même si pas dans la liste
        if (selectedOption && !allOptions.some(opt => opt.id === selectedOption.id)) {
          allOptions.unshift(selectedOption);
        }
        
        return allOptions;
      });
    }
  }, [searchResults, frequentOptions, selectedOption]);

  const handleInputChange = useCallback((event: any, newInputValue: string) => {
    setInputValue(newInputValue);
    
    if (newInputValue.length >= 2) {
      searchChapitres(newInputValue);
    } else if (newInputValue.length === 0) {
      // Réinitialiser aux options fréquentes
      if (frequentOptions.length > 0) {
        const frequentOpts = frequentOptions.map(chapitre => ({
          id: chapitre.id,
          label: `${chapitre.code} - ${chapitre.libelle}`,
          value: chapitre.id,
          chapitre
        }));
        setOptions(frequentOpts);
      }
    }
  }, [searchChapitres, frequentOptions]);

  const handleChange = useCallback((event: any, newValue: any) => {
    setSelectedOption(newValue);
    field.onChange(newValue ? newValue.value : null);
  }, [field]);

  const getOptionLabel = useCallback((option: any) => {
    if (typeof option === 'string') return option;
    if (option && option.label) return option.label;
    return '';
  }, []);

  const renderOption = useCallback((props: any, option: any) => {
    const { chapitre } = option;
    return (
      <li {...props} key={option.id}>
        <Box>
          <Typography variant="body1">
            <strong>{chapitre.code}</strong> - {chapitre.libelle}
          </Typography>
          {chapitre.categorie && (
            <Typography variant="caption" color="text.secondary">
              Catégorie: {chapitre.categorie.code} - {chapitre.categorie.libelle}
            </Typography>
          )}
        </Box>
      </li>
    );
  }, []);

  // Fonction de filtrage personnalisée
  const filterOptions = useCallback((options: any[], { inputValue }: any) => {
    if (!inputValue || inputValue.length < 2) {
      return options;
    }
    
    const inputLower = inputValue.toLowerCase();
    return options.filter(option => {
      const code = option.chapitre?.code?.toLowerCase() || '';
      const libelle = option.chapitre?.libelle?.toLowerCase() || '';
      return code.includes(inputLower) || libelle.includes(inputLower);
    });
  }, []);

  return (
    <Autocomplete
      id={field.name}
      options={options}
      value={selectedOption}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      onChange={handleChange}
      onInputChange={handleInputChange}
      loading={loading || loadingFrequent}
      disabled={disabled}
      filterOptions={filterOptions}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Tapez 2 caractères pour rechercher..."
          error={!!fieldState.error}
          helperText={fieldState.error?.message || helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading || loadingFrequent ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderOption={renderOption}
      loadingText="Chargement..."
      noOptionsText={
        inputValue.length < 2 
          ? "Tapez au moins 2 caractères pour rechercher"
          : loading ? "Recherche en cours..." : "Aucun chapitre trouvé"
      }
      sx={{ mb: 2 }}
    />
  );
};

const TypeCompteList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [typesCompte, setTypesCompte] = useState<TypeCompte[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<TypeCompte[]>([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingType, setEditingType] = useState<TypeCompte | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirmer',
    confirmColor: 'primary' as 'primary' | 'error' | 'success' | 'warning'
  });
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TypeCompte | null>(null);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const openConfirmModal = (
    title: string, 
    message: string, 
    onConfirm: () => void,
    confirmText = 'Confirmer',
    confirmColor: 'primary' | 'error' | 'success' | 'warning' = 'primary'
  ) => {
    setConfirmModal({
      open: true,
      title,
      message,
      onConfirm,
      confirmText,
      confirmColor
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      ...confirmModal,
      open: false
    });
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  function TabPanel(props: { children?: React.ReactNode; value: number; index: number }) {
    const { children, value, index } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
      >
        {value === index && (
          <Box sx={{ pt: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

  const schema = yup.object().shape({
    code: yup.string().required('Le code est requis'),
    libelle: yup.string().required('Le libellé est requis'),
    description: yup.string().nullable(),
    est_mata: yup.boolean().default(false),
    necessite_duree: yup.boolean().default(false),
    est_islamique: yup.boolean().default(false),
    actif: yup.boolean().default(true),
    frais_ouverture: yup.number().nullable(),
    frais_ouverture_actif: yup.boolean().default(false),
    chapitre_frais_ouverture_id: yup.number().nullable(),
    frais_carnet: yup.number().nullable(),
    frais_carnet_actif: yup.boolean().default(false),
    chapitre_frais_carnet_id: yup.number().nullable(),
    commission_retrait: yup.number().nullable(),
    commission_retrait_actif: yup.boolean().default(false),
    chapitre_commission_retrait_id: yup.number().nullable(),
    interets_actifs: yup.boolean().default(false),
    taux_interet_annuel: yup.number().nullable(),
    chapitre_interet_credit_id: yup.number().nullable(),
    capitalisation_interets: yup.boolean().default(false),
    penalite_retrait_anticipe: yup.number().nullable(),
    penalite_actif: yup.boolean().default(false),
    chapitre_penalite_id: yup.number().nullable(),
    frais_cloture_anticipe: yup.number().nullable(),
    frais_cloture_anticipe_actif: yup.boolean().default(false),
    chapitre_cloture_anticipe_id: yup.number().nullable(),
    chapitre_defaut_id: yup.number().nullable(),
  });
  
  const { control, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<TypeCompte>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      description: '',
      frais_ouverture: null,
      frais_carnet: null,
      commission_retrait: null,
      taux_interet_annuel: null,
      penalite_retrait_anticipe: null,
      frais_cloture_anticipe: null,
      chapitre_defaut_id: null,
      chapitre_frais_ouverture_id: null,
      chapitre_frais_carnet_id: null,
      chapitre_commission_retrait_id: null,
      chapitre_interet_credit_id: null,
      chapitre_penalite_id: null,
      chapitre_cloture_anticipe_id: null,
      est_mata: false,
      necessite_duree: false,
      est_islamique: false,
      actif: true,
      frais_ouverture_actif: false,
      frais_carnet_actif: false,
      commission_retrait_actif: false,
      interets_actifs: false,
      penalite_actif: false,
      frais_cloture_anticipe_actif: false,
      capitalisation_interets: false,
    }
  });
  
  const fraisOuvertureActif = watch('frais_ouverture_actif');
  const fraisCarnetActif = watch('frais_carnet_actif');
  const commissionRetraitActif = watch('commission_retrait_actif');
  const interetsActifs = watch('interets_actifs');
  const penaliteActif = watch('penalite_actif');
  const fraisClotureActif = watch('frais_cloture_anticipe_actif');

  const { data: typesData, isLoading: loadingTypes, refetch: refetchTypesCompte } = useQuery<TypeCompte[]>({
    queryKey: ['typesCompte'],
    queryFn: async () => {
      const response = await ApiClient.get('/types-comptes', {
        params: { per_page: 100, page: 1 }
      });
      
      const extractArrays = (obj: any): any[] => {
        if (Array.isArray(obj)) return obj;
        if (typeof obj !== 'object' || obj === null) return [];
        
        for (const key in obj) {
          if (Array.isArray(obj[key])) {
            return obj[key];
          }
          const nestedArray = extractArrays(obj[key]);
          if (nestedArray.length > 0) return nestedArray;
        }
        
        return Object.values(obj).filter(v => v !== null && typeof v === 'object');
      };
      
      let data: any[] = [];
      if (response.data) {
        data = extractArrays(response.data);
        if (!Array.isArray(data) || data.length === 0) {
          data = Object.values(response.data);
        }
      }
      
      if (!Array.isArray(data)) {
        data = [data];
      }
      
      return data.filter((item: any) => item !== null && item !== undefined);
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000
  });

  const updateTypeCompteMutation = useMutation({
    mutationFn: async (data: Partial<TypeCompte>) => {
      const response = await ApiClient.put(`/types-comptes/${data.id}`, data);
      return response.data;
    },
    onSuccess: (responseData, variables) => {
      if (variables.id && typesData) {
        const updatedTypes = typesData.map(type => 
          type.id === variables.id 
            ? { ...type, ...variables, updated_at: new Date().toISOString() }
            : type
        );
        
        setTypesCompte(updatedTypes);
      }
      
      refetchTypesCompte();
      
      enqueueSnackbar('✅ Type de compte mis à jour avec succès', { 
        variant: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        autoHideDuration: 5000,
      });
      
      setOpenEditModal(false);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du type de compte';
      enqueueSnackbar(`❌ ${errorMessage}`, { 
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        autoHideDuration: 10000,
      });
    }
  });
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleSubmitWithConfirmation = (data: TypeCompte) => {
    openConfirmModal(
      'Confirmer la modification',
      `Êtes-vous sûr de vouloir modifier le type de compte "${data.libelle}" (${data.code}) ?`,
      () => executeUpdate(data),
      'Modifier',
      'primary'
    );
  };

  const executeUpdate = (data: TypeCompte) => {
    const cleanData: Partial<TypeCompte> = {
      id: editingType?.id,
      code: data.code,
      libelle: data.libelle,
      description: data.description || '',
      est_mata: data.est_mata,
      necessite_duree: data.necessite_duree,
      est_islamique: data.est_islamique,
      actif: data.actif,
      frais_ouverture_actif: data.frais_ouverture_actif,
      frais_carnet_actif: data.frais_carnet_actif,
      commission_retrait_actif: data.commission_retrait_actif,
      interets_actifs: data.interets_actifs,
      penalite_actif: data.penalite_actif,
      frais_cloture_anticipe_actif: data.frais_cloture_anticipe_actif,
      capitalisation_interets: data.capitalisation_interets,
    };
    
    if (data.chapitre_defaut_id !== null && data.chapitre_defaut_id !== undefined) {
      cleanData.chapitre_defaut_id = data.chapitre_defaut_id;
    }
    
    if (data.frais_ouverture_actif && data.chapitre_frais_ouverture_id) {
      cleanData.chapitre_frais_ouverture_id = data.chapitre_frais_ouverture_id;
    }
    
    if (data.frais_carnet_actif && data.chapitre_frais_carnet_id) {
      cleanData.chapitre_frais_carnet_id = data.chapitre_frais_carnet_id;
    }
    
    if (data.commission_retrait_actif && data.chapitre_commission_retrait_id) {
      cleanData.chapitre_commission_retrait_id = data.chapitre_commission_retrait_id;
    }
    
    if (data.interets_actifs && data.chapitre_interet_credit_id) {
      cleanData.chapitre_interet_credit_id = data.chapitre_interet_credit_id;
    }
    
    if (data.penalite_actif && data.chapitre_penalite_id) {
      cleanData.chapitre_penalite_id = data.chapitre_penalite_id;
    }
    
    if (data.frais_cloture_anticipe_actif && data.chapitre_cloture_anticipe_id) {
      cleanData.chapitre_cloture_anticipe_id = data.chapitre_cloture_anticipe_id;
    }
    
    if (data.frais_ouverture !== null && data.frais_ouverture !== undefined) {
      cleanData.frais_ouverture = data.frais_ouverture;
    }
    
    if (data.frais_carnet !== null && data.frais_carnet !== undefined) {
      cleanData.frais_carnet = data.frais_carnet;
    }
    
    if (data.commission_retrait !== null && data.commission_retrait !== undefined) {
      cleanData.commission_retrait = data.commission_retrait;
    }
    
    if (data.taux_interet_annuel !== null && data.taux_interet_annuel !== undefined) {
      cleanData.taux_interet_annuel = data.taux_interet_annuel;
    }
    
    if (data.frequence_calcul_interet) {
      cleanData.frequence_calcul_interet = data.frequence_calcul_interet;
    }
    
    if (data.penalite_retrait_anticipe !== null && data.penalite_retrait_anticipe !== undefined) {
      cleanData.penalite_retrait_anticipe = data.penalite_retrait_anticipe;
    }
    
    if (data.frais_cloture_anticipe !== null && data.frais_cloture_anticipe !== undefined) {
      cleanData.frais_cloture_anticipe = data.frais_cloture_anticipe;
    }
    
    updateTypeCompteMutation.mutate(cleanData);
  };

  useEffect(() => {
    if (typesData) {
      setTypesCompte(typesData);
      setFilteredTypes(typesData);
    }
  }, [typesData]);

  useEffect(() => {
    const filtered = typesCompte.filter(type => {
      if (!type) return false;
      
      const searchTermLower = searchTerm.toLowerCase();
      const code = type.code ? type.code.toLowerCase() : '';
      const libelle = type.libelle ? type.libelle.toLowerCase() : '';
      
      return code.includes(searchTermLower) || libelle.includes(searchTermLower);
    });
    
    setFilteredTypes(filtered);
    setPage(0);
  }, [searchTerm, typesCompte]);

  const handleEditClick = (type: TypeCompte) => {
    const preparedType = {
      ...type,
      description: type.description || '',
      frais_ouverture: type.frais_ouverture || null,
      frais_carnet: type.frais_carnet || null,
      commission_retrait: type.commission_retrait || null,
      taux_interet_annuel: type.taux_interet_annuel || null,
      penalite_retrait_anticipe: type.penalite_retrait_anticipe || null,
      frais_cloture_anticipe: type.frais_cloture_anticipe || null,
      chapitre_defaut_id: type.chapitre_defaut_id || null,
      chapitre_frais_ouverture_id: type.chapitre_frais_ouverture_id || null,
      chapitre_frais_carnet_id: type.chapitre_frais_carnet_id || null,
      chapitre_commission_retrait_id: type.chapitre_commission_retrait_id || null,
      chapitre_interet_credit_id: type.chapitre_interet_credit_id || null,
      chapitre_penalite_id: type.chapitre_penalite_id || null,
      chapitre_cloture_anticipe_id: type.chapitre_cloture_anticipe_id || null,
    };
    
    reset(preparedType);
    setEditingType(type);
    setOpenEditModal(true);
    setActiveTab(0);
  };

  const handleReactivate = async (typeId: number, typeName: string) => {
    try {
      await ApiClient.put(`/types-comptes/${typeId}`, { actif: true });
      
      setTypesCompte(typesCompte.map(t => 
        t.id === typeId ? { ...t, actif: true, updated_at: new Date().toISOString() } : t
      ));
      
      enqueueSnackbar(`✅ Type de compte "${typeName}" réactivé avec succès`, { 
        variant: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        autoHideDuration: 6000,
      });
      
      refetchTypesCompte();
    } catch (error) {
      console.error('Erreur lors de la réactivation', error);
      enqueueSnackbar('❌ Erreur lors de la réactivation du type de compte', { 
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        autoHideDuration: 6000,
      });
    }
  };

  const handleDelete = (typeId: number, typeName: string) => {
    openConfirmModal(
      'Confirmer la désactivation',
      `Êtes-vous sûr de vouloir désactiver le type de compte "${typeName}" ?\n\nCette action est réversible.`,
      async () => {
        try {
          await ApiClient.put(`/types-comptes/${typeId}`, { actif: false });
          
          setTypesCompte(typesCompte.map(type => 
            type.id === typeId ? { ...type, actif: false, updated_at: new Date().toISOString() } : type
          ));
          
          enqueueSnackbar(`✅ Type de compte "${typeName}" désactivé avec succès`, { 
            variant: 'success',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
            autoHideDuration: 6000,
          });
          
          refetchTypesCompte();
        } catch (error) {
          console.error('Erreur lors de la désactivation', error);
          enqueueSnackbar('❌ Erreur lors de la désactivation du type de compte', { 
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
            autoHideDuration: 6000,
          });
        }
      },
      'Désactiver',
      'error'
    );
  };

  if (loadingTypes) {
    return (
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          width: '100%',
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* CONTENU PRINCIPAL */}
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
        {/* TOPBAR */}
        <TopBar sidebarOpen={sidebarOpen} />

        {/* ZONE DE TRAVAIL */}
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Gestion des types de compte</Typography>
              </Box>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                component={Link}
                to="/ajout-type-de-compte"
                sx={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
              >
                Nouveau type
              </Button>
            </Box>

            {/* Barre de recherche */}
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Rechercher par code ou libellé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { 
                  backgroundColor: 'background.paper',
                  borderRadius: 1
                }
              }}
            />
          </Paper>

          <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
              <Table stickyHeader size="small">
                <TableHead style={{ backgroundColor:'#2277fa'}}>
                  <TableRow style={{ backgroundColor:'#2277fa'}}>
                    <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Code</TableCell>
                    <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Libellé</TableCell>
                    <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell align="center" sx={{ color: 'black', fontWeight: 'bold' }}>MATA</TableCell>
                    <TableCell align="center" sx={{ color: 'black', fontWeight: 'bold' }}>Durée</TableCell>
                    <TableCell align="center" sx={{ color: 'black', fontWeight: 'bold' }}>Islamique</TableCell>
                    <TableCell align="center" sx={{ color: 'black', fontWeight: 'bold' }}>Statut</TableCell>
                    <TableCell align="center" sx={{ color: 'black', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTypes
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((type) => (
                      <TableRow 
                        key={type.id}
                        sx={{ 
                          opacity: type.actif ? 1 : 0.7,
                          backgroundColor: type.actif ? 'inherit' : 'rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        <TableCell>{type.code} {!type.actif && '(Désactivé)'}</TableCell>
                        <TableCell>{type.libelle}</TableCell>
                        <TableCell sx={{ 
                          maxWidth: '200px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>{type.description || '-'}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={type.est_mata ? 'Oui' : 'Non'} 
                            size="small"
                            color={type.est_mata ? 'primary' : 'default'}
                            variant={type.est_mata ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={type.necessite_duree ? 'Oui' : 'Non'} 
                            size="small"
                            color={type.necessite_duree ? 'secondary' : 'default'}
                            variant={type.necessite_duree ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={type.est_islamique ? 'Oui' : 'Non'} 
                            size="small"
                            color={type.est_islamique ? 'success' : 'default'}
                            variant={type.est_islamique ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={type.actif ? 'Actif' : 'Inactif'} 
                            color={type.actif ? 'success' : 'default'} 
                            size="small"
                            sx={{ 
                              cursor: 'default',
                              opacity: 0.8,
                              '& .MuiChip-label': {
                                paddingLeft: 1.5,
                                paddingRight: 1.5
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Voir les détails">
                            <IconButton 
                              onClick={() => {
                                setSelectedType(type);
                                setViewModalOpen(true);
                              }}
                              size="small"
                              sx={{ '&:hover': { color: 'info.main' } }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Modifier">
                            <IconButton 
                              onClick={() => handleEditClick(type)}
                              size="small"
                              sx={{ '&:hover': { color: 'primary.main' } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {type.actif ? (
                            <Tooltip title="Désactiver">
                              <IconButton 
                                onClick={() => handleDelete(type.id, type.libelle)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Réactiver">
                              <IconButton
                                onClick={() => handleReactivate(type.id, type.libelle)}
                                color="primary"
                                size="small"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                  <path d="M3 3v5h5"/>
                                  <path d="M12 7v5l3 3"/>
                                </svg>
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  {filteredTypes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="textSecondary">
                          Aucun type de compte trouvé
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filteredTypes.length)} sur ${filteredTypes.length}`}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Pagination 
                  count={Math.ceil(filteredTypes.length / rowsPerPage)} 
                  page={page + 1} 
                  onChange={(event, value) => setPage(value - 1)} 
                  color="primary" 
                  shape="rounded"
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Lignes:
                  </Typography>
                  <Select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(0);
                    }}
                    size="small"
                    sx={{
                      '& .MuiSelect-select': {
                        py: 0.5,
                        px: 1,
                        fontSize: '0.875rem',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'divider',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'text.secondary',
                      },
                    }}
                  >
                    {[5, 10, 25, 50].map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                </Select>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Modal d'édition */}
          <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit(handleSubmitWithConfirmation)}>
              <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                  <EditIcon color="primary" />
                  <Typography variant="h6" component="span">
                    Modifier le type de compte
                  </Typography>
                </Box>
                {editingType && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Code: <strong>{editingType.code}</strong>
                  </Typography>
                )}
              </DialogTitle>
              
              <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={activeTab} onChange={handleTabChange} aria-label="onglets type compte">
                    <Tab label="Général" {...a11yProps(0)} />
                    <Tab label="Frais & Commissions" {...a11yProps(1)} />
                    <Tab label="Intérêts" {...a11yProps(2)} />
                    <Tab label="Pénalités" {...a11yProps(3)} />
                  </Tabs>
                </Box>

                {/* Onglet Général */}
                <TabPanel value={activeTab} index={0}>
                  <Controller
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        margin="dense"
                        label="Code"
                        fullWidth
                        disabled
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                  
                  <Controller
                    name="libelle"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        margin="dense"
                        label="Libellé *"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                  
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={field.value || ''}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                                    
                  {/* Chapitre par défaut */}
                  <Controller
                    name="chapitre_defaut_id"
                    control={control}
                    render={({ field, fieldState }) => (
                      <ChapitreSelectComponent
                        field={field}
                        fieldState={fieldState}
                        label="Chapitre par défaut"
                        helperText="Chapitre à utiliser par défaut pour les opérations"
                      />
                    )}
                  />
                  
                  <Controller
                    name="actif"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="Actif"
                      />
                    )}
                  />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, ml: 1 }}>
                    <Controller
                      name="est_islamique"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value || false}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="Est Islamique"
                        />
                      )}
                    />
                    
                    <Controller
                      name="est_mata"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value || false}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="Est MATA"
                        />
                      )}
                    />
                    
                    <Controller
                      name="a_vue"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value || false}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="À vue"
                        />
                      )}
                    />
                  </Box>
                </TabPanel>

                {/* Onglet Frais & Commissions */}
                <TabPanel value={activeTab} index={1}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <MoneyIcon sx={{ mr: 1 }} />
                    Frais d'ouverture
                  </Typography>
                  
                  <Box display="flex" gap={2} alignItems="center" mb={2}>
                    <Controller
                      name="frais_ouverture_actif"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value || false}
                              onChange={(e) => {
                                field.onChange(e.target.checked);
                                if (!e.target.checked) {
                                  setValue('frais_ouverture', null);
                                  setValue('chapitre_frais_ouverture_id', null);
                                }
                              }}
                            />
                          }
                          label="Activer"
                        />
                      )}
                    />
                    
                    <Controller
                      name="frais_ouverture"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          margin="dense"
                          label="Montant"
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                          }}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          disabled={!fraisOuvertureActif}
                          sx={{ flex: 1 }}
                        />
                      )}
                    />
                  </Box>
                  
                  {/* Chapitre pour frais d'ouverture */}
                  <Controller
                    name="chapitre_frais_ouverture_id"
                    control={control}
                    render={({ field, fieldState }) => (
                      <ChapitreSelectComponent
                        field={field}
                        fieldState={fieldState}
                        label="Chapitre frais d'ouverture"
                        helperText="Chapitre pour comptabiliser les frais d'ouverture"
                      />
                    )}
                  />

                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReceiptIcon sx={{ mr: 1 }} />
                    Frais de carnet
                  </Typography>
                  
                  <Box display="flex" gap={2} alignItems="center" mb={2}>
                    <Controller
                      name="frais_carnet_actif"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value || false}
                              onChange={(e) => {
                                field.onChange(e.target.checked);
                                if (!e.target.checked) {
                                  setValue('frais_carnet', null);
                                  setValue('chapitre_frais_carnet_id', null);
                                }
                              }}
                            />
                          }
                          label="Activer"
                        />
                      )}
                    />
                    
                    <Controller
                      name="frais_carnet"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          margin="dense"
                          label="Montant"
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                          }}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          disabled={!fraisCarnetActif}
                          sx={{ flex: 1 }}
                        />
                      )}
                    />
                  </Box>
                  
                  {/* Chapitre pour frais de carnet */}
                  <Controller
                    name="chapitre_frais_carnet_id"
                    control={control}
                    render={({ field, fieldState }) => (
                      <ChapitreSelectComponent
                        field={field}
                        fieldState={fieldState}
                        label="Chapitre frais de carnet"
                        helperText="Chapitre pour comptabiliser les frais de carnet"
                      />
                    )}
                  />

                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PercentIcon sx={{ mr: 1 }} />
                    Commission de retrait
                  </Typography>
                  
                  <Box display="flex" gap={2} alignItems="center" mb={2}>
                    <Controller
                      name="commission_retrait_actif"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value || false}
                              onChange={(e) => {
                                field.onChange(e.target.checked);
                                if (!e.target.checked) {
                                  setValue('commission_retrait', null);
                                  setValue('chapitre_commission_retrait_id', null);
                                }
                              }}
                            />
                          }
                          label="Activer"
                        />
                      )}
                    />
                    
                    <Controller
                      name="commission_retrait"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          margin="dense"
                          label="Pourcentage"
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          disabled={!commissionRetraitActif}
                          sx={{ flex: 1 }}
                        />
                      )}
                    />
                  </Box>
                  
                  {/* Chapitre pour commission de retrait */}
                  <Controller
                    name="chapitre_commission_retrait_id"
                    control={control}
                    render={({ field, fieldState }) => (
                      <ChapitreSelectComponent
                        field={field}
                        fieldState={fieldState}
                        label="Chapitre commission de retrait"
                        helperText="Chapitre pour comptabiliser les commissions de retrait"
                      />
                    )}
                  />
                </TabPanel>

                {/* Onglet Intérêts */}
                <TabPanel value={activeTab} index={2}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalanceIcon sx={{ mr: 1 }} />
                    Paramètres des intérêts
                  </Typography>
                  
                  <Controller
                    name="interets_actifs"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value || false}
                            onChange={(e) => {
                              field.onChange(e.target.checked);
                              if (!e.target.checked) {
                                setValue('taux_interet_annuel', null);
                                setValue('capitalisation_interets', false);
                                setValue('chapitre_interet_credit_id', null);
                              }
                            }}
                          />
                        }
                        label="Activer les intérêts"
                        sx={{ mb: 2, display: 'block' }}
                      />
                    )}
                  />
                  
                  <Box display="flex" gap={2} sx={{ mb: 2 }}>
                    <Controller
                      name="taux_interet_annuel"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          margin="dense"
                          label="Taux d'intérêt annuel"
                          type="number"
                          fullWidth
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          disabled={!interetsActifs}
                        />
                      )}
                    />
                    
                    <Controller
                      name="frequence_calcul_interet"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth margin="dense">
                          <InputLabel>Fréquence de calcul</InputLabel>
                          <Select
                            {...field}
                            label="Fréquence de calcul"
                            value={field.value || ''}
                            disabled={!interetsActifs}
                          >
                            <MenuItem value="JOURNALIER">Journalier</MenuItem>
                            <MenuItem value="MENSUEL">Mensuel</MenuItem>
                            <MenuItem value="ANNUEL">Annuel</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Box>
                  
                  <Controller
                    name="capitalisation_interets"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={!interetsActifs}
                          />
                        }
                        label="Capitalisation des intérêts"
                        sx={{ display: 'block', mb: 2 }}
                      />
                    )}
                  />
                  
                  {/* Chapitre pour intérêts créditeurs */}
                  <Controller
                    name="chapitre_interet_credit_id"
                    control={control}
                    render={({ field, fieldState }) => (
                      <ChapitreSelectComponent
                        field={field}
                        fieldState={fieldState}
                        label="Chapitre intérêts créditeurs"
                        helperText="Chapitre pour comptabiliser les intérêts créditeurs"
                      />
                    )}
                  />
                </TabPanel>

                {/* Onglet Pénalités */}
                <TabPanel value={activeTab} index={3}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningIcon sx={{ mr: 1 }} />
                    Paramètres des pénalités
                  </Typography>
                  
                  <Box mb={3}>
                    <Typography variant="subtitle1" gutterBottom>
                      Pénalité de retrait anticipé
                    </Typography>
                    <Box display="flex" gap={2} alignItems="center" mb={2}>
                      <Controller
                        name="penalite_actif"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value || false}
                                onChange={(e) => {
                                  field.onChange(e.target.checked);
                                  if (!e.target.checked) {
                                    setValue('penalite_retrait_anticipe', null);
                                    setValue('chapitre_penalite_id', null);
                                  }
                                }}
                              />
                            }
                            label="Activer"
                          />
                        )}
                      />
                      
                      <Controller
                        name="penalite_retrait_anticipe"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            margin="dense"
                            label="Taux de pénalité"
                            type="number"
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            }}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            disabled={!penaliteActif}
                            sx={{ flex: 1 }}
                          />
                        )}
                      />
                    </Box>
                    
                    {/* Chapitre pour pénalité */}
                    <Controller
                      name="chapitre_penalite_id"
                      control={control}
                      render={({ field, fieldState }) => (
                        <ChapitreSelectComponent
                          field={field}
                          fieldState={fieldState}
                          label="Chapitre pénalité de retrait"
                          helperText="Chapitre pour comptabiliser les pénalités de retrait anticipé"
                        />
                      )}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Frais de clôture anticipée
                    </Typography>
                    <Box display="flex" gap={2} alignItems="center" mb={2}>
                      <Controller
                        name="frais_cloture_anticipe_actif"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value || false}
                                onChange={(e) => {
                                  field.onChange(e.target.checked);
                                  if (!e.target.checked) {
                                    setValue('frais_cloture_anticipe', null);
                                    setValue('chapitre_cloture_anticipe_id', null);
                                  }
                                }}
                              />
                            }
                            label="Activer"
                          />
                        )}
                      />
                      
                      <Controller
                        name="frais_cloture_anticipe"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            margin="dense"
                            label="Montant"
                            type="number"
                            InputProps={{
                              endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                            }}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            disabled={!fraisClotureActif}
                            sx={{ flex: 1 }}
                          />
                        )}
                      />
                    </Box>
                    
                    {/* Chapitre pour frais de clôture anticipée */}
                    <Controller
                      name="chapitre_cloture_anticipe_id"
                      control={control}
                      render={({ field, fieldState }) => (
                        <ChapitreSelectComponent
                          field={field}
                          fieldState={fieldState}
                          label="Chapitre frais de clôture anticipée"
                          helperText="Chapitre pour comptabiliser les frais de clôture anticipée"
                        />
                      )}
                    />
                  </Box>
                </TabPanel>
              </DialogContent>
              
              <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                <Box>
                  {activeTab > 0 && (
                    <Button 
                      onClick={() => setActiveTab(activeTab - 1)}
                      variant="outlined"
                      sx={{ mr: 1 }}
                    >
                      Précédent
                    </Button>
                  )}
                  {activeTab < 3 && (
                    <Button 
                      onClick={() => setActiveTab(activeTab + 1)}
                      variant="contained"
                      color="primary"
                    >
                      Suivant
                    </Button>
                  )}
                </Box>
                
                <Box>
                  <Button 
                    onClick={() => setOpenEditModal(false)} 
                    variant="outlined"
                    sx={{ mr: 1 }}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={updateTypeCompteMutation.isPending}
                    startIcon={updateTypeCompteMutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
                  >
                    {updateTypeCompteMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </Box>
              </DialogActions>
            </form>
          </Dialog>

          {/* Modal de confirmation */}
          <Dialog open={confirmModal.open} onClose={closeConfirmModal} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <WarningIcon color="warning" />
                <Typography variant="h6">{confirmModal.title}</Typography>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Alert 
                severity={confirmModal.confirmColor === 'error' ? 'warning' : 'info'} 
                sx={{ mb: 2 }}
              >
                {confirmModal.message}
              </Alert>
              
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Cliquez sur "Confirmer" pour valider cette action.
                </Typography>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, gap: 1 }}>
              <Button 
                onClick={closeConfirmModal}
                variant="outlined"
                color="inherit"
              >
                Annuler
              </Button>
              <Button 
                onClick={() => {
                  confirmModal.onConfirm();
                  closeConfirmModal();
                }}
                variant="contained" 
                color={confirmModal.confirmColor}
                startIcon={<CheckIcon />}
              >
                {confirmModal.confirmText}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Modal de visualisation */}
          <Dialog 
            open={viewModalOpen} 
            onClose={() => setViewModalOpen(false)}
            maxWidth="lg"
            fullWidth
            scroll="paper"
          >
            <DialogTitle sx={{ 
              backgroundColor: 'primary.main',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <Box>
                <Typography variant="h6" component="div">
                  Détails du type de compte: {selectedType?.libelle}
                </Typography>
                <Typography variant="subtitle2">
                  Code: {selectedType?.code} | Créé le: {selectedType?.created_at ? new Date(selectedType.created_at).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={() => setViewModalOpen(false)}
                aria-label="fermer"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
              {selectedType && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ mb: 3 }}>
                      <CardHeader 
                        title="Informations générales" 
                        titleTypographyProps={{ variant: 'h6' }}
                        sx={{ bgcolor: 'grey.100' }}
                      />
                      <CardContent>
                        <List dense>
                          <DetailItem label="Code" value={selectedType.code} />
                          <DetailItem label="Libellé" value={selectedType.libelle} />
                          <DetailItem label="Description" value={selectedType.description} />
                          <DetailItem 
                            label="À vue" 
                            value={selectedType.a_vue ? 'Oui' : 'Non'} 
                            color={selectedType.a_vue ? 'success' : 'default'}
                          />
                          <DetailItem 
                            label="Compte MATA" 
                            value={selectedType.est_mata ? 'Oui' : 'Non'} 
                            color={selectedType.est_mata ? 'primary' : 'default'}
                          />
                          <DetailItem 
                            label="Nécessite durée" 
                            value={selectedType.necessite_duree ? 'Oui' : 'Non'} 
                            color={selectedType.necessite_duree ? 'info' : 'default'}
                          />
                          <DetailItem 
                            label="Statut" 
                            value={selectedType.actif ? 'Actif' : 'Inactif'} 
                            color={selectedType.actif ? 'success' : 'error'}
                          />
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardHeader 
                        title="Métadonnées" 
                        titleTypographyProps={{ variant: 'h6' }}
                        sx={{ bgcolor: 'grey.100' }}
                      />
                      <CardContent>
                        <List dense>
                          <DetailItem 
                            label="Date de création" 
                            value={selectedType.created_at ? new Date(selectedType.created_at).toLocaleString() : 'Inconnue'} 
                          />
                          <DetailItem 
                            label="Dernière mise à jour" 
                            value={selectedType.updated_at ? new Date(selectedType.updated_at).toLocaleString() : 'Jamais modifié'} 
                          />
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button 
                onClick={() => setViewModalOpen(false)} 
                color="primary"
                variant="contained"
                startIcon={<CloseIcon />}
              >
                Fermer
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity} 
              sx={{ width: '100%' }}
              elevation={6}
              variant="filled"
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </Box>
  );
};

export default TypeCompteList;