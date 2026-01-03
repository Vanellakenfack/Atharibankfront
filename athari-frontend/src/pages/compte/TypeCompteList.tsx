import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, IconButton, Chip, Typography, Box, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, 
  FormControlLabel, Checkbox, InputAdornment, Snackbar, Alert,
  Tooltip, Select, MenuItem, Pagination, FormControl, InputLabel,
  Tabs, Tab, Divider, Grid, Card, CardContent, CardHeader, List, ListItem, ListItemText
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
import ApiClient from '@/services/api/ApiClient';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

// Composant DetailItem réutilisable - DÉPLACÉ EN DEHORS DU COMPOSANT PRINCIPAL
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

const TypeCompteList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [typesCompte, setTypesCompte] = useState<TypeCompte[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<TypeCompte[]>([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingType, setEditingType] = useState<TypeCompte | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  
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
    frais_carnet: yup.number().nullable(),
    frais_carnet_actif: yup.boolean().default(false),
    commission_retrait: yup.number().nullable(),
    commission_retrait_actif: yup.boolean().default(false),
    interets_actifs: yup.boolean().default(false),
    taux_interet_annuel: yup.number().nullable(),
    capitalisation_interets: yup.boolean().default(false),
    penalite_retrait_anticipe: yup.number().nullable(),
    penalite_actif: yup.boolean().default(false),
    frais_cloture_anticipe: yup.number().nullable(),
    frais_cloture_anticipe_actif: yup.boolean().default(false),
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
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    typeId: null as number | null,
    typeName: ''
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TypeCompte | null>(null);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fonction pour ouvrir la modale de visualisation
  const handleOpenViewModal = (type: TypeCompte) => {
    setSelectedType(type);
    setViewModalOpen(true);
  };

  // Fonction pour fermer la modale de visualisation
  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedType(null);
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

  // Récupération des données avec useQuery
  const { refetch } = useQuery<TypeCompte[]>({
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
    onSuccess: (data) => {
      setTypesCompte(data);
      setFilteredTypes(data);
      setLoading(false);
    },
    onError: (error: any) => {
      console.error('Erreur lors du chargement des types de compte', error);
      enqueueSnackbar('Erreur lors du chargement des types de compte', { variant: 'error' });
      setTypesCompte([]);
      setFilteredTypes([]);
      setLoading(false);
    }
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
    onSuccess: () => {
      enqueueSnackbar('✅ Type de compte mis à jour avec succès', { 
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
        autoHideDuration: 5000,
      });
      setOpenEditModal(false);
      refetch();
    },
    onError: (error: any) => {
      console.error('Erreur dans onError de la mutation:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du type de compte';
      enqueueSnackbar(`❌ ${errorMessage}`, { 
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
        autoHideDuration: 10000,
      });
    }
  });
  
  // Gestion du changement d'onglet
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Gestion de la soumission du formulaire
  const onSubmit = (data: TypeCompte) => {
    console.log('Soumission du formulaire avec les données:', data);
    
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
    };
    
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
    if (data.capitalisation_interets !== null && data.capitalisation_interets !== undefined) {
      cleanData.capitalisation_interets = data.capitalisation_interets;
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
    
    updateTypeCompteMutation.mutate(cleanData, {
      onSuccess: (response) => {
        console.log('Réponse de l\'API (succès):', response);
        const message = `✅ Le type de compte "${data.libelle}" a été modifié avec succès !`;
        enqueueSnackbar(message, { 
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
          autoHideDuration: 8000,
          style: { whiteSpace: 'pre-line' },
          action: (key) => (
            <IconButton 
              size="small" 
              color="inherit" 
              onClick={() => closeSnackbar(key)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ),
        });
        setOpenEditModal(false);
        refetch();
      },
      onError: (error: any) => {
        console.error('Erreur lors de la mise à jour:', error);
        let errorMessage = '❌ Échec de la modification\n';
        
        if (error.response) {
          if (error.response.data?.errors) {
            errorMessage += 'Veuillez corriger les erreurs suivantes :\n';
            Object.entries(error.response.data.errors).forEach(([field, messages]) => {
              errorMessage += `• ${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}\n`;
            });
          } else {
            errorMessage += error.response.data?.message || 'Erreur inconnue du serveur';
          }
        } else if (error.request) {
          errorMessage += 'Le serveur ne répond pas. Veuillez vérifier votre connexion.';
        } else {
          errorMessage += 'Erreur lors de la préparation de la requête';
        }
        
        enqueueSnackbar(errorMessage, { 
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
          autoHideDuration: 15000,
          style: { whiteSpace: 'pre-line' },
          action: (key) => (
            <IconButton 
              size="small" 
              color="inherit" 
              onClick={() => closeSnackbar(key)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ),
        });
      }
    });
  };
  
  // Charger la liste des types de compte
  useEffect(() => {
    const fetchTypesCompte = async () => {
      try {
        console.log('Début du chargement des types de compte...');
        const response = await ApiClient.get('/types-comptes');
        console.log('Réponse complète de l\'API:', response);
        
        const extractArrays = (obj: any) => {
          if (Array.isArray(obj)) return obj;
          if (typeof obj !== 'object' || obj === null) return [];
          
          for (const key in obj) {
            if (Array.isArray(obj[key])) {
              return obj[key];
            }
            const nestedArray = extractArrays(obj[key]);
            if (nestedArray.length > 0) return nestedArray;
          }
          
          return Object.values(obj).filter((v: any) => v !== null && typeof v === 'object');
        };
        
        let data: any[] = [];
        if (response.data) {
          data = extractArrays(response.data);
          if (!Array.isArray(data) || data.length === 0) {
            data = Object.values(response.data);
          }
        }
        
        console.log('Données extraites:', data);
        
        if (!Array.isArray(data)) {
          data = [data];
        }
        
        const cleanData = data.filter((item: any) => item !== null && item !== undefined);
        
        setTypesCompte(cleanData);
        setFilteredTypes(cleanData);
      } catch (error) {
        console.error('Erreur lors du chargement des types de compte', error);
        enqueueSnackbar('Erreur lors du chargement des types de compte', { variant: 'error' });
        setTypesCompte([]);
        setFilteredTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTypesCompte();
  }, []);

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
    };
    
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
      setTypesCompte(typesCompte.map(t => 
        t.id === typeId ? { ...t, actif: true } : t
      ));
      enqueueSnackbar(`✅ Type de compte "${typeName}" réactivé avec succès`, { 
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
        autoHideDuration: 6000,
      });
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

  // Gestion de la désactivation
  const handleDelete = async () => {
    if (!deleteModal.typeId) return;

    try {
      await ApiClient.put(`/types-comptes/${deleteModal.typeId}`, { actif: false });
      
      setTypesCompte(typesCompte.map(type => 
        type.id === deleteModal.typeId ? { ...type, actif: false } : type
      ));
      
      enqueueSnackbar(`✅ Type de compte "${deleteModal.typeName}" désactivé avec succès`, { 
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
        autoHideDuration: 6000,
        action: (key) => (
          <IconButton 
            size="small" 
            color="inherit" 
            onClick={() => closeSnackbar(key)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        ),
      });
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
    } finally {
      setDeleteModal({ open: false, typeId: null, typeName: '' });
    }
  };

  if (loading) {
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
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Code</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Libellé</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>MATA</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Durée</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Islamique</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
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
                              onClick={() => handleOpenViewModal(type)}
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
                                onClick={() => setDeleteModal({ 
                                  open: true, 
                                  typeId: type.id, 
                                  typeName: type.libelle 
                                })}
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
            <form onSubmit={handleSubmit(onSubmit)}>
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
                    startIcon={updateTypeCompteMutation.isPending ? <CircularProgress size={20} /> : <EditIcon />}
                  >
                    {updateTypeCompteMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </Button>
                </Box>
              </DialogActions>
            </form>
          </Dialog>

          {/* Modal de confirmation de suppression */}
          <Dialog
            open={deleteModal.open}
            onClose={() => setDeleteModal({ ...deleteModal, open: false })}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <WarningIcon color="warning" />
                <Typography variant="h6">
                  Confirmation de désactivation
                </Typography>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Cette action est réversible. Vous pourrez réactiver ce type de compte ultérieurement.
              </Alert>
              
              <Typography variant="body1" paragraph>
                Êtes-vous sûr de vouloir désactiver le type de compte :
              </Typography>
              
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                <Typography variant="h6" color="text.primary">
                  {deleteModal.typeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Une fois désactivé, ce type de compte ne pourra plus être utilisé pour créer de nouveaux comptes.
                </Typography>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, gap: 1 }}>
              <Button 
                onClick={() => setDeleteModal({ ...deleteModal, open: false })}
                variant="outlined"
                color="inherit"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleDelete}
                variant="contained" 
                color="error"
                startIcon={<BlockIcon />}
              >
                Désactiver
              </Button>
            </DialogActions>
          </Dialog>

          {/* Modal de visualisation des détails */}
          <Dialog 
            open={viewModalOpen} 
            onClose={handleCloseViewModal}
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
                onClick={handleCloseViewModal}
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
                                label="Pénalité retrait anticipé" 
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
                                label="Frais clôture anticipée" 
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
                onClick={handleCloseViewModal} 
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