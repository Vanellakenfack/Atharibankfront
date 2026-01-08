import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, IconButton, Chip, Typography, Box, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, 
  FormControlLabel, Checkbox, InputAdornment, Snackbar, Alert,
  Tooltip, Select, MenuItem, Pagination, FormControl, InputLabel,
  Tabs, Tab, Divider, Grid, Card, CardContent, CardHeader, List, ListItem, ListItemText,
  Autocomplete, LinearProgress
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
import BlockIcon from '@mui/icons-material/Block';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import ApiClient from '@/services/api/ApiClient';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

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

// Interface pour les chapitres
interface Chapitre {
  id: number;
  code: string;
  libelle: string;
  categorie?: {
    id: number;
    code: string;
    nom: string;
  };
}

const TypeCompteList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [typesCompte, setTypesCompte] = useState<TypeCompte[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<TypeCompte[]>([]);
  const [allChapitres, setAllChapitres] = useState<Chapitre[]>([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingType, setEditingType] = useState<TypeCompte | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  
  // États pour la confirmation
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirmer',
    confirmColor: 'primary' as 'primary' | 'error' | 'success' | 'warning'
  });
  
  // États pour la modale de visualisation
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TypeCompte | null>(null);
  
  // État pour le suivi du chargement des chapitres
  const [chapitresLoadingInfo, setChapitresLoadingInfo] = useState({
    loaded: 0,
    total: 0,
    isComplete: false,
    page: 1
  });
  
  // Schéma de validation
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
  
  // Surveiller les valeurs spécifiques pour les dépendances
  const fraisOuvertureActif = watch('frais_ouverture_actif');
  const fraisCarnetActif = watch('frais_carnet_actif');
  const commissionRetraitActif = watch('commission_retrait_actif');
  const interetsActifs = watch('interets_actifs');
  const penaliteActif = watch('penalite_actif');
  const fraisClotureActif = watch('frais_cloture_anticipe_actif');
  
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

  // Fonction pour ouvrir la modale de confirmation
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

  // Fonction pour fermer la modale de confirmation
  const closeConfirmModal = () => {
    setConfirmModal({
      ...confirmModal,
      open: false
    });
  };

  // Fonction utilitaire pour les onglets
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  // Composant TabPanel personnalisé
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

  // Récupération des types de compte avec react-query
  const { data: typesData, isLoading: loadingTypes, refetch: refetchTypesCompte } = useQuery<TypeCompte[]>({
    queryKey: ['typesCompte'],
    queryFn: async () => {
      const response = await ApiClient.get('/types-comptes');
      
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
    refetchOnWindowFocus: false
  });

  // Charger TOUS les chapitres avec PAGINATION AUTOMATIQUE
  const { data: chapitresData, isLoading: loadingChapitres, refetch: refetchChapitres } = useQuery<Chapitre[]>({
    queryKey: ['chapitres'],
    queryFn: async () => {
      console.log('Début du chargement intelligent des chapitres avec pagination...');
      setChapitresLoadingInfo({
        loaded: 0,
        total: 0,
        isComplete: false,
        page: 1
      });
      
      const loadAllChapitres = async (): Promise<Chapitre[]> => {
        let allChapitres: Chapitre[] = [];
        let currentPage = 1;
        const pageSize = 100; // Taille raisonnable par page
        let totalPages = 1;
        let lastSuccess = true;

        try {
          do {
            console.log(`Chargement page ${currentPage}...`);
            
            setChapitresLoadingInfo(prev => ({
              ...prev,
              page: currentPage,
              loaded: allChapitres.length
            }));
            
            const response = await ApiClient.get('/plan-comptable/comptes', {
              params: { page: currentPage, per_page: pageSize },
              timeout: 15000 // Timeout de 15 secondes par page
            });

            const responseData = response.data;
            let pageChapitres: Chapitre[] = [];

            // Gestion des différents formats de réponse
            if (Array.isArray(responseData)) {
              // Format 1: Tableau direct
              pageChapitres = responseData.map((item: any) => ({
                id: item.id,
                code: item.code,
                libelle: item.libelle,
                categorie: item.categorie
              }));
              lastSuccess = pageChapitres.length > 0;
              totalPages = pageChapitres.length < pageSize ? currentPage : currentPage + 1;
            } else if (responseData.data && Array.isArray(responseData.data)) {
              // Format 2: Laravel standard { data: [], meta: {}, links: {} }
              pageChapitres = responseData.data.map((item: any) => ({
                id: item.id,
                code: item.code,
                libelle: item.libelle,
                categorie: item.categorie
              }));
              lastSuccess = pageChapitres.length > 0;
              
              if (responseData.meta) {
                totalPages = responseData.meta.last_page || 1;
                // Mettre à jour le total estimé
                setChapitresLoadingInfo(prev => ({
                  ...prev,
                  total: responseData.meta.total || prev.total
                }));
              } else {
                totalPages = pageChapitres.length < pageSize ? currentPage : currentPage + 1;
              }
            } else if (responseData.results && Array.isArray(responseData.results)) {
              // Format 3: Autre format paginé { results: [] }
              pageChapitres = responseData.results.map((item: any) => ({
                id: item.id,
                code: item.code,
                libelle: item.libelle,
                categorie: item.categorie
              }));
              lastSuccess = pageChapitres.length > 0;
              totalPages = pageChapitres.length < pageSize ? currentPage : currentPage + 1;
            } else {
              console.warn('Format de réponse inattendu à la page', currentPage, ':', responseData);
              break;
            }

            if (pageChapitres.length === 0) {
              console.log(`Page ${currentPage} vide, arrêt du chargement.`);
              lastSuccess = false;
              break;
            }

            allChapitres = [...allChapitres, ...pageChapitres];
            console.log(`✓ Page ${currentPage}: ${pageChapitres.length} chapitres (total: ${allChapitres.length})`);
            
            // Mettre à jour les informations de chargement
            setChapitresLoadingInfo(prev => ({
              ...prev,
              loaded: allChapitres.length,
              page: currentPage
            }));
            
            currentPage++;
            
            // Limite de sécurité: ne pas dépasser 50 pages (5,000 chapitres)
            if (currentPage > 50) {
              console.warn('Limite de sécurité atteinte (50 pages). Arrêt du chargement.');
              break;
            }

          } while (lastSuccess && currentPage <= totalPages);

          console.log(`✅ Chargement terminé: ${allChapitres.length} chapitres récupérés`);
          
          setChapitresLoadingInfo(prev => ({
            ...prev,
            loaded: allChapitres.length,
            total: allChapitres.length,
            isComplete: true
          }));
          
          return allChapitres;

        } catch (error: any) {
          console.error('Erreur lors du chargement paginé:', error.message);
          
          // Si on a déjà récupéré des chapitres, les retourner
          if (allChapitres.length > 0) {
            console.log(`⚠️ Chargement interrompu. Retour de ${allChapitres.length} chapitres déjà récupérés`);
            return allChapitres;
          }
          
          // Fallback: essayer une seule requête avec une taille raisonnable
          try {
            console.log('Tentative de fallback avec per_page=200...');
            const fallbackResponse = await ApiClient.get('/plan-comptable/comptes', {
              params: { per_page: 200 },
              timeout: 10000
            });
            
            let fallbackChapitres: Chapitre[] = [];
            
            if (fallbackResponse.data?.data && Array.isArray(fallbackResponse.data.data)) {
              fallbackChapitres = fallbackResponse.data.data.map((item: any) => ({
                id: item.id,
                code: item.code,
                libelle: item.libelle,
                categorie: item.categorie
              }));
            } else if (Array.isArray(fallbackResponse.data)) {
              fallbackChapitres = fallbackResponse.data.map((item: any) => ({
                id: item.id,
                code: item.code,
                libelle: item.libelle,
                categorie: item.categorie
              }));
            }
            
            console.log(`✅ Fallback chargé: ${fallbackChapitres.length} chapitres`);
            return fallbackChapitres;
          } catch (fallbackError) {
            console.error('❌ Erreur du fallback:', fallbackError);
            throw new Error('Impossible de charger les chapitres');
          }
        }
      };

      return loadAllChapitres();
    },
    retry: 1,
    refetchOnWindowFocus: false,
    // Temps de cache plus long pour les chapitres (5 minutes)
    staleTime: 5 * 60 * 1000,
  });

  // Mutation pour la mise à jour du type de compte
  const updateTypeCompteMutation = useMutation({
    mutationFn: async (data: Partial<TypeCompte>) => {
      console.log('Envoi de la requête de mise à jour avec:', data);
      try {
        const response = await ApiClient.put(`/types-comptes/${data.id}`, data);
        console.log('Réponse de l\'API:', response);
        return response.data;
      } catch (error) {
        console.error('Erreur dans la mutation:', error);
        throw error;
      }
    },
    onSuccess: (responseData, variables) => {
      // Mettre à jour le tableau localement immédiatement
      if (variables.id && typesData) {
        const updatedTypes = typesData.map(type => 
          type.id === variables.id 
            ? { ...type, ...variables, updated_at: new Date().toISOString() }
            : type
        );
        
        setTypesCompte(updatedTypes);
      }
      
      // Recharger les données depuis le serveur
      refetchTypesCompte();
      
      enqueueSnackbar('✅ Type de compte mis à jour avec succès', { 
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
        autoHideDuration: 5000,
      });
      
      setOpenEditModal(false);
    },
    onError: (error: any) => {
      console.error('Erreur dans onError de la mutation:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du type de compte';
      enqueueSnackbar(`❌ ${errorMessage}`, { 
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
        autoHideDuration: 10000,
      });
    }
  });
  
  // Gestion du changement d'onglet
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Gestion de la soumission du formulaire avec confirmation
  const handleSubmitWithConfirmation = (data: TypeCompte) => {
    // Ouvrir la modale de confirmation
    openConfirmModal(
      'Confirmer la modification',
      `Êtes-vous sûr de vouloir modifier le type de compte "${data.libelle}" (${data.code}) ?`,
      () => {
        // Fonction exécutée après confirmation
        executeUpdate(data);
      },
      'Modifier',
      'primary'
    );
  };

  // Fonction qui exécute réellement la mise à jour
  const executeUpdate = (data: TypeCompte) => {
    console.log('Exécution de la mise à jour avec les données:', data);
    
    // Nettoyer les données null et les remplacer par undefined
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
    
    // Ajouter les chapitres seulement s'ils sont définis
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
    
    // Ajouter les valeurs numériques seulement si elles sont définies et non nulles
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

  // Mettre à jour les états quand les données sont chargées
  useEffect(() => {
    if (typesData) {
      setTypesCompte(typesData);
      setFilteredTypes(typesData);
    }
  }, [typesData]);

  useEffect(() => {
    if (chapitresData) {
      setAllChapitres(chapitresData);
    }
  }, [chapitresData]);

  // Gestion de la recherche
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

  // Gestion de l'édition
  const handleEditClick = (type: TypeCompte) => {
    console.log('Modification du type de compte:', type);
    
    // Préparer les valeurs avec des valeurs par défaut pour éviter null
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
    
    console.log('Valeurs préparées pour le formulaire:', preparedType);
    
    // Réinitialiser le formulaire avec les valeurs du type à modifier
    reset(preparedType);
    
    setEditingType(type);
    setOpenEditModal(true);
    setActiveTab(0);
  };

  // Fonction pour réactiver un type de compte
  const handleReactivate = async (typeId: number, typeName: string) => {
    try {
      await ApiClient.put(`/types-comptes/${typeId}`, { actif: true });
      
      // Mettre à jour le tableau localement immédiatement
      setTypesCompte(typesCompte.map(t => 
        t.id === typeId ? { ...t, actif: true, updated_at: new Date().toISOString() } : t
      ));
      
      enqueueSnackbar(`✅ Type de compte "${typeName}" réactivé avec succès`, { 
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
        autoHideDuration: 6000,
      });
      
      // Recharger les données
      refetchTypesCompte();
    } catch (error) {
      console.error('Erreur lors de la réactivation', error);
      enqueueSnackbar('❌ Erreur lors de la réactivation du type de compte', { 
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
        autoHideDuration: 6000,
      });
    }
  };

  // Gestion de la désactivation avec confirmation
  const handleDelete = (typeId: number, typeName: string) => {
    openConfirmModal(
      'Confirmer la désactivation',
      `Êtes-vous sûr de vouloir désactiver le type de compte "${typeName}" ?\n\nCette action est réversible.`,
      async () => {
        try {
          await ApiClient.put(`/types-comptes/${typeId}`, { actif: false });
          
          // Mettre à jour le tableau localement immédiatement
          setTypesCompte(typesCompte.map(type => 
            type.id === typeId ? { ...type, actif: false, updated_at: new Date().toISOString() } : type
          ));
          
          enqueueSnackbar(`✅ Type de compte "${typeName}" désactivé avec succès`, { 
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
            autoHideDuration: 6000,
          });
          
          // Recharger les données
          refetchTypesCompte();
        } catch (error) {
          console.error('Erreur lors de la désactivation', error);
          enqueueSnackbar('❌ Erreur lors de la désactivation du type de compte', { 
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
            autoHideDuration: 6000,
          });
        }
      },
      'Désactiver',
      'error'
    );
  };

  // Composant pour le sélecteur de chapitre
  const ChapitreSelect = ({ name, label, required = false, helperText = "" }: { 
    name: keyof TypeCompte; 
    label: string; 
    required?: boolean;
    helperText?: string;
  }) => {
    const value = watch(name) as number | null;
    const selectedChapitre = value ? allChapitres.find(ch => ch.id === value) : null;

    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <Autocomplete
              options={allChapitres}
              value={selectedChapitre}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return `${option.code} - ${option.libelle}`;
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(event, newValue) => {
                field.onChange(newValue ? newValue.id : null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={label + (required ? " *" : "")}
                  placeholder="Rechercher un chapitre..."
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || helperText}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loadingChapitres ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="body1">
                      <strong>{option.code}</strong> - {option.libelle}
                    </Typography>
                    {option.categorie && (
                      <Typography variant="caption" color="text.secondary">
                        Catégorie: {option.categorie.code} - {option.categorie.nom}
                      </Typography>
                    )}
                  </Box>
                </li>
              )}
              loading={loadingChapitres}
              loadingText="Chargement des chapitres..."
              noOptionsText={
                loadingChapitres 
                  ? "Chargement..." 
                  : allChapitres.length === 0 
                    ? "Aucun chapitre disponible" 
                    : "Aucun chapitre trouvé"
              }
              filterOptions={(options, state) => {
                const inputValue = state.inputValue.toLowerCase().trim();
                if (!inputValue) return options;
                
                return options.filter(option => 
                  option.code.toLowerCase().includes(inputValue) ||
                  option.libelle.toLowerCase().includes(inputValue) ||
                  (option.categorie?.nom?.toLowerCase()?.includes(inputValue) || false)
                );
              }}
              groupBy={(option) => option.categorie?.nom || 'Sans catégorie'}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              💡 Tapez pour rechercher par code, libellé ou catégorie
            </Typography>
          </FormControl>
        )}
      />
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

            {/* Indicateur de chargement des chapitres */}
            {loadingChapitres && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      {chapitresLoadingInfo.isComplete 
                        ? `Chargement terminé: ${chapitresLoadingInfo.loaded} chapitres`
                        : `Chargement des chapitres... (page ${chapitresLoadingInfo.page})`}
                      {chapitresLoadingInfo.loaded > 0 && 
                        !chapitresLoadingInfo.isComplete &&
                        ` - ${chapitresLoadingInfo.loaded} chargés`}
                    </Typography>
                    {chapitresLoadingInfo.loaded > 0 && !chapitresLoadingInfo.isComplete && (
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={chapitresLoadingInfo.total > 0 
                            ? Math.min((chapitresLoadingInfo.loaded / chapitresLoadingInfo.total) * 100, 100)
                            : 0
                          }
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            )}

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
                <TableHead style={{ backgroundColor:'#3479efff'}}>
                  <TableRow style={{ backgroundColor:'#3479efff'}}>
                    <TableCell  sx={{ color: 'black', fontWeight: 'bold' }}>Code</TableCell>
                    <TableCell  sx={{ color: 'black', fontWeight: 'bold' }}>Libellé</TableCell>
                    <TableCell  sx={{ color: 'black', fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell  align="center" sx={{ color: 'black', fontWeight: 'bold' }}>MATA</TableCell>
                    <TableCell  align="center" sx={{ color: 'black', fontWeight: 'bold' }}>Durée</TableCell>
                    <TableCell  align="center" sx={{ color: 'black', fontWeight: 'bold' }}>Islamique</TableCell>
                    <TableCell  align="center" sx={{ color: 'black', fontWeight: 'bold' }}>Statut</TableCell>
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
                  <ChapitreSelect 
                    name="chapitre_defaut_id" 
                    label="Chapitre par défaut"
                    helperText="Chapitre à utiliser par défaut pour les opérations"
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
                  <ChapitreSelect 
                    name="chapitre_frais_ouverture_id" 
                    label="Chapitre frais d'ouverture"
                    helperText="Chapitre pour comptabiliser les frais d'ouverture"
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
                  <ChapitreSelect 
                    name="chapitre_frais_carnet_id" 
                    label="Chapitre frais de carnet"
                    helperText="Chapitre pour comptabiliser les frais de carnet"
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
                  <ChapitreSelect 
                    name="chapitre_commission_retrait_id" 
                    label="Chapitre commission de retrait"
                    helperText="Chapitre pour comptabiliser les commissions de retrait"
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
                  <ChapitreSelect 
                    name="chapitre_interet_credit_id" 
                    label="Chapitre intérêts créditeurs"
                    helperText="Chapitre pour comptabiliser les intérêts créditeurs"
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
                    <ChapitreSelect 
                      name="chapitre_penalite_id" 
                      label="Chapitre pénalité de retrait"
                      helperText="Chapitre pour comptabiliser les pénalités de retrait anticipé"
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
                    <ChapitreSelect 
                      name="chapitre_cloture_anticipe_id" 
                      label="Chapitre frais de clôture anticipée"
                      helperText="Chapitre pour comptabiliser les frais de clôture anticipée"
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

          {/* Modal de confirmation générique */}
          <Dialog
            open={confirmModal.open}
            onClose={closeConfirmModal}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <WarningIcon color="warning" />
                <Typography variant="h6">
                  {confirmModal.title}
                </Typography>
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

          {/* Modal de visualisation des détails */}
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
                  {/* Colonne 1: Informations de base */}
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
                          <DetailItem 
                            label="ID Chapitre par défaut" 
                            value={selectedType.chapitre_defaut_id || 'Non défini'}
                          />
                        </List>
                      </CardContent>
                    </Card>

                    {/* Frais et commissions */}
                    <Card variant="outlined" sx={{ mb: 3 }}>
                      <CardHeader 
                        title="Frais et commissions" 
                        titleTypographyProps={{ variant: 'h6' }}
                        sx={{ bgcolor: 'grey.100' }}
                      />
                      <CardContent>
                        <List dense>
                          {selectedType.frais_ouverture_actif && (
                            <>
                              <DetailItem 
                                label="Frais d'ouverture" 
                                value={`${selectedType.frais_ouverture || 0} FCFA`} 
                              />
                              <DetailItem 
                                label="ID Chapitre frais d'ouverture" 
                                value={selectedType.chapitre_frais_ouverture_id || 'Non défini'}
                              />
                            </>
                          )}
                          
                          {selectedType.frais_carnet_actif && (
                            <>
                              <DetailItem 
                                label="Frais de carnet" 
                                value={`${selectedType.frais_carnet || 0} FCFA`} 
                              />
                              <DetailItem 
                                label="ID Chapitre frais carnet" 
                                value={selectedType.chapitre_frais_carnet_id || 'Non défini'}
                              />
                            </>
                          )}

                          {selectedType.frais_renouvellement_actif && (
                            <>
                              <DetailItem 
                                label="Frais renouvellement carnet" 
                                value={`${selectedType.frais_renouvellement_carnet || 0} FCFA`} 
                              />
                              <DetailItem 
                                label="ID Chapitre renouvellement" 
                                value={selectedType.chapitre_renouvellement_id || 'Non défini'}
                              />
                            </>
                          )}

                          {selectedType.frais_perte_actif && (
                            <>
                              <DetailItem 
                                label="Frais perte carnet" 
                                value={`${selectedType.frais_perte_carnet || 0} FCFA`} 
                              />
                              <DetailItem 
                                label="ID Chapitre perte" 
                                value={selectedType.chapitre_perte_id || 'Non défini'}
                              />
                            </>
                          )}

                          {selectedType.commission_retrait_actif && (
                            <>
                              <DetailItem 
                                label="Commission retrait" 
                                value={`${selectedType.commission_retrait || 0}%`} 
                              />
                              <DetailItem 
                                label="ID Chapitre commission retrait" 
                                value={selectedType.chapitre_commission_retrait_id || 'Non défini'}
                              />
                            </>
                          )}

                          {selectedType.commission_sms_actif && (
                            <>
                              <DetailItem 
                                label="Commission SMS" 
                                value={`${selectedType.commission_sms || 0} FCFA`} 
                              />
                              <DetailItem 
                                label="ID Chapitre commission SMS" 
                                value={selectedType.chapitre_commission_sms_id || 'Non défini'}
                              />
                            </>
                          )}

                          {selectedType.commission_mensuelle_actif && (
                            <>
                              <DetailItem 
                                label="Seuil commission" 
                                value={`${selectedType.seuil_commission || 0} FCFA`} 
                              />
                              <DetailItem 
                                label="Commission si > seuil" 
                                value={`${selectedType.commission_si_superieur || 0} FCFA`} 
                              />
                              <DetailItem 
                                label="Commission si < seuil" 
                                value={`${selectedType.commission_si_inferieur || 0} FCFA`} 
                              />
                            </>
                          )}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Colonne 2: Paramètres avancés */}
                  <Grid item xs={12} md={6}>
                    {/* Paramètres d'intérêts */}
                    {selectedType.interets_actifs && (
                      <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardHeader 
                          title="Paramètres d'intérêts" 
                          titleTypographyProps={{ variant: 'h6' }}
                          sx={{ bgcolor: 'grey.100' }}
                        />
                        <CardContent>
                          <List dense>
                            <DetailItem 
                              label="Taux d'intérêt annuel" 
                              value={`${selectedType.taux_interet_annuel || 0}%`} 
                            />
                            <DetailItem 
                              label="Fréquence calcul intérêt" 
                              value={selectedType.frequence_calcul_interet || 'Non défini'} 
                            />
                            <DetailItem 
                              label="Heure calcul intérêt" 
                              value={selectedType.heure_calcul_interet || 'Non défini'} 
                            />
                            <DetailItem 
                              label="ID Chapitre intérêts créditeurs" 
                              value={selectedType.chapitre_interet_credit_id || 'Non défini'}
                            />
                            <DetailItem 
                              label="Capitalisation intérêts" 
                              value={selectedType.capitalisation_interets ? 'Oui' : 'Non'}
                              color={selectedType.capitalisation_interets ? 'success' : 'default'}
                            />
                          </List>
                        </CardContent>
                      </Card>
                    )}

                    {/* Frais et pénalités */}
                    <Card variant="outlined" sx={{ mb: 3 }}>
                      <CardHeader 
                        title="Frais et pénalités" 
                        titleTypographyProps={{ variant: 'h6' }}
                        sx={{ bgcolor: 'grey.100' }}
                      />
                      <CardContent>
                        <List dense>
                          {selectedType.frais_deblocage_actif && (
                            <>
                              <DetailItem 
                                label="Frais de déblocage" 
                                value={`${selectedType.frais_deblocage || 0} FCFA`} 
                              />
                              <DetailItem 
                                label="ID Chapitre frais déblocage" 
                                value={selectedType.chapitre_frais_deblocage_id || 'Non défini'}
                              />
                            </>
                          )}

                          {selectedType.penalite_actif && (
                            <>
                              <DetailItem 
                                label="Pénalité de retrait anticipé" 
                                value={`${selectedType.penalite_retrait_anticipe || 0}%`} 
                              />
                              <DetailItem 
                                label="ID Chapitre pénalité" 
                                value={selectedType.chapitre_penalite_id || 'Non défini'}
                              />
                            </>
                          )}

                          {selectedType.frais_cloture_anticipe_actif && (
                            <>
                              <DetailItem 
                                label="Frais de clôture anticipée" 
                                value={`${selectedType.frais_cloture_anticipe || 0} FCFA`} 
                              />
                              <DetailItem 
                                label="ID Chapitre clôture anticipée" 
                                value={selectedType.chapitre_cloture_anticipe_id || 'Non défini'}
                              />
                            </>
                          )}

                          {selectedType.minimum_compte_actif && (
                            <DetailItem 
                              label="Solde minimum" 
                              value={`${selectedType.minimum_compte || 0} FCFA`} 
                            />
                          )}

                          <DetailItem 
                            label="ID Compte attente produits" 
                            value={selectedType.compte_attente_produits_id || 'Non défini'}
                          />

                          <DetailItem 
                            label="Retrait anticipé autorisé" 
                            value={selectedType.retrait_anticipe_autorise ? 'Oui' : 'Non'}
                            color={selectedType.retrait_anticipe_autorise ? 'success' : 'default'}
                          />

                          <DetailItem 
                            label="Validation retrait anticipé" 
                            value={selectedType.validation_retrait_anticipe ? 'Oui' : 'Non'}
                            color={selectedType.validation_retrait_anticipe ? 'success' : 'default'}
                          />

                          <DetailItem 
                            label="Durée blocage min (jours)" 
                            value={selectedType.duree_blocage_min || 'Non défini'} 
                          />

                          <DetailItem 
                            label="Durée blocage max (jours)" 
                            value={selectedType.duree_blocage_max || 'Non défini'} 
                          />
                        </List>
                      </CardContent>
                    </Card>

                    {/* Métadonnées */}
                    <Card variant="outlined">
                      <CardHeader 
                        title="Métadonnées" 
                        titleTypographyProps={{ variant: 'h6' }}
                        sx={{ bgcolor: 'grey.100' }}
                      />
                      <CardContent>
                        <List dense>
                          <DetailItem 
                            label="Observations" 
                            value={selectedType.observations || 'Aucune observation'} 
                            multiline
                          />
                          <DetailItem 
                            label="Date de création" 
                            value={selectedType.created_at ? new Date(selectedType.created_at).toLocaleString() : 'Inconnue'} 
                          />
                          <DetailItem 
                            label="Dernière mise à jour" 
                            value={selectedType.updated_at ? new Date(selectedType.updated_at).toLocaleString() : 'Jamais modifié'} 
                          />
                          {selectedType.deleted_at && (
                            <DetailItem 
                              label="Date de suppression" 
                              value={new Date(selectedType.deleted_at).toLocaleString()}
                              color="error"
                            />
                          )}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider', position: 'sticky', bottom: 0, bgcolor: 'background.paper' }}>
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

          {/* Snackbar pour les notifications */}
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