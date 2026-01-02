import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box,
  Card, 
  Typography, 
  Button, 
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  useTheme,
  useMediaQuery,
  Select,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
// Using Material-UI Typography instead of Ant Design
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon, 
  FileDownload as FileDownloadIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { useFrais } from '../../hooks/useFrais';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import moment from 'moment';
import Sidebar from '../layout/Sidebar';
import TopBar from '../layout/TopBar';

// Interface pour les filtres
interface Filters {
  typeFrais?: string;
  statut?: string;
  dateDebut?: Date | null;
  dateFin?: Date | null;
  searchText?: string;
}

// Interface pour la pagination
interface Pagination {
  current: number;
  pageSize: number;
  total?: number;
  per_page?: number; // Pour la compatibilité avec l'API
  last_page?: number; // Dernière page disponible
  from?: number; // Premier élément de la page
  to?: number; // Dernier élément de la page
}

// Interface pour les données de frais
interface FraisApplication {
  id: string | number;
  reference?: string;
  type_frais?: string;
  typeFrais?: string; // Pour la rétrocompatibilité
  montant: number | string;
  statut?: string;
  date_application?: string;
  dateApplication?: string; // Pour la rétrocompatibilité
  compte_id?: string | number;
  compteClient?: string;
  frais_commission_id?: string | number;
  solde_avant?: number | string;
  solde_apres?: number | string;
  created_at?: string;
  updated_at?: string;
  // Pour la compatibilité avec les données existantes
  [key: string]: any;
}

const FraisApplicationList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { 
    fraisApplications = [], 
    loading, 
    loadFraisApplications: loadFraisApplicationsFromHook,
    annulerFraisApplication
  } = useFrais();
  
  // Créer une version wrapper de loadFraisApplications pour le débogage
  const loadFraisApplications = useCallback(async (params: any) => {
    console.log('Appel de loadFraisApplications avec params:', params);
    try {
      const result = await loadFraisApplicationsFromHook(params);
      console.log('Réponse de loadFraisApplications:', {
        result,
        hasData: !!result?.data,
        dataType: result?.data ? (Array.isArray(result.data) ? 'array' : typeof result.data) : 'undefined',
        dataLength: Array.isArray(result?.data) ? result.data.length : 'N/A'
      });
      return result;
    } catch (error) {
      console.error('Erreur dans loadFraisApplications:', error);
      throw error;
    }
  }, [loadFraisApplicationsFromHook]);
  
  const [filters, setFilters] = useState<Filters>({});
  const [pagination, setPagination] = useState<Pagination>({ 
    current: 1, 
    pageSize: 10,
    total: 0
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [fraisData, setFraisData] = useState<FraisApplication[]>([]);
  const [searchForm, setSearchForm] = useState({
    search: '',
    type_frais: '',
    dateRange: null as Date | null
  });

  // Gestion de la soumission du formulaire de recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mettre à jour les filtres avec les valeurs du formulaire
    const newFilters: Filters = {};
    
    if (searchForm.search) {
      newFilters.searchText = searchForm.search;
    }
    
    if (searchForm.type_frais) {
      newFilters.typeFrais = searchForm.type_frais;
    }
    
    if (searchForm.dateRange) {
      newFilters.dateDebut = searchForm.dateRange[0];
      newFilters.dateFin = searchForm.dateRange[1];
    }
    
    // Réinitialiser la pagination à la première page lors d'une nouvelle recherche
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
    
    // Mettre à jour les filtres
    setFilters(newFilters);
  };

  // Gestion du changement des champs du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target as HTMLInputElement;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchForm({
      search: '',
      type_frais: '',
      dateRange: null
    });
    setFilters({});
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPagination({
      ...pagination,
      current: newPage + 1, // +1 car Material-UI utilise un index 0-based
    });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination({
      ...pagination,
      pageSize: parseInt(event.target.value, 10),
      current: 1, // Retour à la première page lors du changement de taille de page
    });
  };

  const handleFilterChange = (field: keyof Filters, value: any) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  const handleResetFilters = () => {
    setFilters({});
    setPagination({
      ...pagination,
      current: 1
    });
  };

  const handleOpenCancelDialog = (id: string | number) => {
    setSelectedId(id.toString());
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setSelectedId(null);
    setCancelDialogOpen(false);
  };

  const handleConfirmCancel = async () => {
    if (!selectedId) {
      console.error('Aucun ID de frais sélectionné pour l\'annulation');
      return;
    }

    try {
      setLoading(true);
      await annulerFraisApplication(selectedId);
      
      // Afficher un message de succès
      enqueueSnackbar('Le frais a été annulé avec succès', { variant: 'success' });
      
      // Recharger les données pour refléter les changements
      await loadData();
    } catch (error: any) {
      // Gérer l'erreur de manière plus détaillée
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'annulation du frais';
      console.error('Erreur lors de l\'annulation du frais:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Afficher un message d'erreur à l'utilisateur
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
      handleCloseCancelDialog();
    }
  };

  // Charger les données avec les filtres actuels
const loadData = useCallback(async () => {
  console.log('Chargement des données avec les paramètres:', {
    pagination,
    filters
  });

  const params: any = {
    page: pagination.current,
    per_page: pagination.pageSize,
    ...filters
  };
  
  if (filters.dateDebut && filters.dateFin) {
    params.date_debut = moment(filters.dateDebut).format('YYYY-MM-DD');
    params.date_fin = moment(filters.dateFin).format('YYYY-MM-DD');
  }

  try {
    console.log('Appel à loadFraisApplications avec params:', params);
    const response = await loadFraisApplications(params);
    console.log('Réponse complète de l\'API:', response);
    
    // Extraire les données de la réponse
    let data = [];
    if (response?.data?.data && Array.isArray(response.data.data)) {
      // Format Laravel paginé
      data = response.data.data;
      console.log('Données extraites (format paginé):', data);
    } else if (Array.isArray(response?.data)) {
      // Format tableau simple
      data = response.data;
      console.log('Données extraites (format tableau simple):', data);
    } else if (response?.data?.data && typeof response.data.data === 'object') {
      // Format avec data imbriqué
      data = response.data.data;
      console.log('Données extraites (format data imbriqué):', data);
    } else {
      console.warn('Format de réponse inattendu:', response);
      return [];
    }

    // Extraire les données du tableau data si elles existent
    const itemsToNormalize = Array.isArray(data) ? data : (data?.data || [data]);
    
    console.log('Données brutes avant normalisation:', JSON.parse(JSON.stringify(itemsToNormalize)));
    
    const normalizedData = itemsToNormalize.map((item: any) => {
      // Si l'élément est un objet de pagination, on le saute
      if (item.data && Array.isArray(item.data)) {
        return null;
      }
      
      const normalizedItem = {
        ...item,
        typeFrais: item.typeFrais || item.type_frais || 'Non spécifié',
        dateApplication: item.dateApplication || item.date_application,
        reference: item.reference || `FRAIS-${item.id || 'N/A'}`,
        montant: item.montant ? Number(item.montant) : 0,
        statut: item.statut || 'EN_ATTENTE',
        compteClient: item.compteClient || `Compte ${item.compte_id || 'N/A'}`,
        // Ajout des champs bruts pour le débogage
        _rawTypeFrais: item.type_frais,
        _rawTypeFrais2: item.typeFrais,
        _rawDateApplication: item.date_application,
        _rawDateApplication2: item.dateApplication
      };
      
      console.log('Élément normalisé:', JSON.parse(JSON.stringify(normalizedItem)));
      return normalizedItem;
    }).filter(Boolean); // Filtrer les valeurs null

    console.log('Données normalisées:', normalizedData);
    return normalizedData;
  } catch (error) {
    console.error('Erreur lors du chargement des frais:', error);
    enqueueSnackbar('Erreur lors du chargement des données', { variant: 'error' });
    return [];
  }
}, [pagination.current, pagination.pageSize, filters, loadFraisApplications, enqueueSnackbar]);
  // Recharger les données quand les filtres ou la pagination changent
  useEffect(() => {
    console.log('useEffect - Chargement des données');
    let isMounted = true;
    
    const fetchData = async () => {
      console.log('Début du chargement des données...');
      try {
        const result = await loadData();
        
        if (!isMounted) return;
        
        // Extraire les données de la réponse
        let dataToDisplay = [];
        
        // Si le résultat est un tableau avec un élément qui contient une propriété data
        if (Array.isArray(result) && result.length > 0 && result[0].data) {
          dataToDisplay = result[0].data;
          console.log('Données extraites du format imbriqué:', dataToDisplay);
        } 
        // Si le résultat est directement un tableau
        else if (Array.isArray(result)) {
          dataToDisplay = result;
          console.log('Données extraites (format tableau simple):', dataToDisplay);
        } 
        // Si le résultat est un objet avec une propriété data
        else if (result && result.data) {
          dataToDisplay = Array.isArray(result.data) ? result.data : [result.data];
          console.log('Données extraites de la propriété data:', dataToDisplay);
        }
        // Si aucune des conditions ci-dessus n'est remplie
        else {
          console.warn('Format de données inattendu, utilisation directe:', result);
          dataToDisplay = Array.isArray(result) ? result : [result];
        }
        
        console.log('Données à afficher:', {
          dataToDisplay,
          type: typeof dataToDisplay,
          isArray: Array.isArray(dataToDisplay),
          length: dataToDisplay.length,
          firstItem: dataToDisplay[0] || 'Aucun élément'
        });
        
        setFraisData(dataToDisplay);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        if (isMounted) {
          enqueueSnackbar('Erreur lors du chargement des données', { variant: 'error' });
        }
      }
    };
    
    fetchData();
    
    // Nettoyage en cas de démontage du composant
    return () => {
      isMounted = false;
    };
  }, [loadData, enqueueSnackbar]);

  const handlePageChange = (event: unknown, newPage: number) => {
    console.log('Changement de page:', newPage + 1);
    setPagination(prev => {
      // Vérifier si la page a réellement changé pour éviter des re-rendus inutiles
      if (prev.current === newPage + 1) return prev;
      
      return {
        ...prev,
        current: newPage + 1, // +1 car Material-UI utilise un index 0-based
      };
    });
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    console.log('Changement du nombre de lignes par page:', newPageSize);
    setPagination(prev => ({
      ...prev,
      pageSize: newPageSize,
      current: 1, // Retour à la première page lors du changement de taille de page
    }));
  };

  // Colonnes du tableau
  const columns = [
    {
      id: 'reference',
      label: 'Référence',
      minWidth: 150,
      align: 'left' as const,
      format: (value: string, row: any) => value || `FRAIS-${row.id || ''}`,
    },
    {
      id: 'typeFrais',
      label: 'Type de frais',
      minWidth: 150,
      align: 'left' as const,
      format: (value: string) => {
        // Valeurs possibles : 'TENUE', 'OUVERTURE', 'COMMISSION', etc.
        const types: { [key: string]: { text: string; color: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default' } } = {
          TENUE: { text: 'Tenue de compte', color: 'primary' },
          OUVERTURE: { text: 'Ouverture', color: 'secondary' },
          COMMISSION: { text: 'Commission', color: 'info' },
          // Ajoutez d'autres types si nécessaire
        };
        
        // Convertir la valeur en majuscules pour la correspondance
        const typeKey = value ? value.toUpperCase() : '';
        const typeInfo = types[typeKey] || { text: value || 'Non spécifié', color: 'default' };
        
        return (
          <Chip 
            label={typeInfo.text} 
            color={typeInfo.color} 
            variant="outlined"
            size="small"
            sx={{ minWidth: 120 }}
          />
        );
      },
    },
    {
      id: 'montant',
      label: 'Montant',
      minWidth: 150,
      align: 'right' as const,
      format: (value: number | string) => {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('fr-FR', { 
          style: 'currency', 
          currency: 'XOF',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(numericValue || 0).replace('XOF', 'FCFA');
      },
    },
    {
      id: 'statut',
      label: 'Statut',
      minWidth: 150,
      align: 'left' as const,
      format: (value: string) => {
        const status: { [key: string]: { 
          text: string; 
          icon: React.ReactNode; 
          color: 'success' | 'error' | 'warning' | 'info' | 'default' 
        } } = {
          APPLIQUE: { 
            text: 'Appliqué', 
            icon: <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />, 
            color: 'success' 
          },
          ANNULE: { 
            text: 'Annulé', 
            icon: <CancelIcon fontSize="small" sx={{ mr: 0.5 }} />, 
            color: 'error' 
          },
          EN_ATTENTE: { 
            text: 'En attente', 
            icon: <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} color="warning" />, 
            color: 'warning' 
          },
          // Ajoutez d'autres statuts si nécessaire
        };
        
        const statusKey = value ? value.toUpperCase() : 'EN_ATTENTE';
        const statusInfo = status[statusKey] || { 
          text: value || 'Inconnu', 
          icon: <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} color="default" />, 
          color: 'default' 
        };
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {statusInfo.icon}
            <Chip 
              label={statusInfo.text}
              color={statusInfo.color}
              size="small"
              variant="outlined"
              sx={{ minWidth: 100 }}
            />
          </Box>
        );
      },
    },
    {
      id: 'dateApplication',
      label: 'Date application',
      minWidth: 180,
      align: 'left' as const,
      format: (value: string) => {
        if (!value) return 'Non spécifiée';
        try {
          return new Date(value).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch (e) {
          return value; // Retourne la valeur originale en cas d'erreur de format
        }
      },
    },
    {
      id: 'compteClient',
      label: 'Compte client',
      minWidth: 150,
      align: 'left' as const,
    },
    // Colonne des actions commentée
    // {
    //   id: 'actions',
    //   label: 'Actions',
    //   minWidth: 120,
    //   align: 'center' as const,
    //   format: (value: any, row: FraisApplication) => {
    //     // Vérifier si la ligne est valide
    //     if (!row || !row.id) return null;
    //     
    //     // Récupérer le statut en vérifiant les différentes propriétés possibles
    //     const statut = row.statut || 'EN_ATTENTE';
    //     
    //     return (
    //       <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    //         <Tooltip title="Voir les détails">
    //           <IconButton 
    //             size="small"
    //             onClick={() => navigate(`/frais/applications/${row.id}`)}
    //             color="primary"
    //           >
    //             <VisibilityIcon fontSize="small" />
    //           </IconButton>
    //         </Tooltip>
    //         
    //         {/* Afficher le bouton d'annulation uniquement si le statut est APPLIQUE */}
    //         {statut === 'APPLIQUE' && (
    //           <Tooltip title="Annuler le frais">
    //             <IconButton 
    //               size="small"
    //               onClick={() => row.id && handleOpenCancelDialog(row.id.toString())}
    //               color="error"
    //               sx={{ ml: 1 }}
    //             >
    //               <CancelIcon fontSize="small" />
    //             </IconButton>
    //           </Tooltip>
    //         )}
    //       </Box>
    //     );
    //   },
    // },
  ];

  // Log du contenu de fraisData au moment du rendu
  console.log('Rendu du composant - fraisData:', {
    fraisData,
    length: fraisData?.length,
    firstItem: fraisData?.[0],
    loading
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}  />

      {/* Contenu principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          width: `calc(100% - ${sidebarOpen ? 260 : 80}px)`,
          transition: 'width 0.3s ease',
          ml: 'auto'
        }}
      >
        {/* TopBar */}
        <TopBar sidebarOpen={true} />

        {/* Zone de travail */}
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4, flexGrow: 1 }}>
      {/* En-tête de la page */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
          Historique des frais appliqués
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          Consultation des frais facturés aux clients
        </Typography>
      </Box>

      {/* Barre de recherche et filtres */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: '16px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid #edf2f7'
      }}>
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="N° compte, client..."
            name="search"
            value={searchForm.search}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: '8px', 
                bgcolor: '#F1F5F9', 
                '& fieldset': { border: 'none' },
                minWidth: '300px'
              }
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              name="type_frais"
              value={searchForm.type_frais}
              onChange={(e) => handleInputChange(e as SelectChangeEvent<string>)}
              displayEmpty
              sx={{
                bgcolor: '#F1F5F9',
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                }
              }}
            >
              <MenuItem value="">Tous les types de frais</MenuItem>
              <MenuItem value="TENUE">Tenue de compte</MenuItem>
              <MenuItem value="OUVERTURE">Ouverture</MenuItem>
              <MenuItem value="COMMISSION">Commission</MenuItem>
            </Select>
          </FormControl>
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DatePicker
              label="Période"
              value={searchForm.dateRange}
              onChange={(newValue) => {
                setSearchForm(prev => ({
                  ...prev,
                  dateRange: newValue
                }));
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  size="small"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '8px',
                      bgcolor: '#F1F5F9',
                    },
                    '& fieldset': { border: 'none' },
                    minWidth: '250px'
                  }}
                />
              )}
            />
          </LocalizationProvider>

          <Button
            variant="outlined"
            onClick={resetFilters}
            startIcon={<RefreshIcon />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              borderColor: '#E2E8F0',
              color: '#475569',
              '&:hover': {
                borderColor: '#CBD5E1',
                backgroundColor: 'rgba(226, 232, 240, 0.2)'
              }
            }}
          >
            Réinitialiser
          </Button>

          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: '#4F46E5',
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                bgcolor: '#4338CA',
              }
            }}
          >
            Rechercher
          </Button>

          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => {}}
            sx={{
              ml: 'auto',
              borderRadius: '8px',
              textTransform: 'none',
              borderColor: '#E2E8F0',
              color: '#475569',
              '&:hover': {
                borderColor: '#CBD5E1',
                backgroundColor: 'rgba(226, 232, 240, 0.2)'
              }
            }}
          >
            Exporter
          </Button>
        </Box>
      </Paper>

      {/* Tableau des frais */}
      <Paper sx={{ 
        borderRadius: '16px', 
        overflow: 'hidden', 
        border: '1px solid #edf2f7', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
      }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                {columns.map((column) => (
                  <TableCell 
                    key={column.id}
                    align={column.align}
                    sx={{ 
                      py: 2, 
                      fontWeight: '600', 
                      color: '#475569',
                      fontSize: '0.875rem',
                      borderBottom: '1px solid #E2E8F0',
                      minWidth: column.minWidth
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : fraisData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: '#64748B' }}>
                    Aucune donnée disponible
                  </TableCell>
                </TableRow>
              ) : (
                fraisData.map((row) => (
                  <TableRow hover key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id as keyof typeof row];
                      return (
                        <TableCell 
                          key={column.id} 
                          align={column.align}
                          sx={{ 
                            py: 1.5,
                            borderBottom: '1px solid #F1F5F9',
                            color: '#334155',
                            fontSize: '0.875rem'
                          }}
                        >
                          {column.format && typeof value !== 'object'
                            ? column.format(value as any, row)
                            : String(value || '')}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={pagination.total || 0}
          rowsPerPage={pagination.pageSize}
          page={pagination.current - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
          }
          sx={{
            borderTop: '1px solid #E2E8F0',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem',
              color: '#64748B',
              my: 1
            },
            '& .MuiSelect-select': {
              fontSize: '0.875rem',
              py: 0.5
            },
            '& .MuiTablePagination-actions': {
              ml: 2
            }
          }}
        />
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog}>
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir annuler ce frais ? Cette action est irréversible.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleConfirmCancel} color="error" variant="contained">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default FraisApplicationList;
