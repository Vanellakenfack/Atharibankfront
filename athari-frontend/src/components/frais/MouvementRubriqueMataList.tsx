import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  Chip, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Tooltip, 
  Divider, 
  Grid, 
  useTheme, 
  useMediaQuery,
  TablePagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon, 
  GridOn as ExcelIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  ArrowDownward as ArrowDownIcon,
  ArrowUpward as ArrowUpIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';

// Données factices pour le récapitulatif
const mockRecapitulatif: Recapitulatif = {
  totalEntrees: 350000,
  totalSorties: 130000,
  solde: 220000,
  nombreMouvements: 6
};

// Types pour les données
interface Mouvement {
  id: string;
  date: string;
  reference: string;
  libelle: string;
  type: 'entree' | 'sortie';
  montant: number;
  statut: 'validé' | 'annulé' | 'en_attente';
  motifAnnulation?: string;
}

interface Recapitulatif {
  totalEntrees: number;
  totalSorties: number;
  solde: number;
  nombreMouvements: number;
}

// Données factices pour le développement
const mockMouvements: Mouvement[] = [
  {
    id: '1',
    date: '2023-11-15',
    reference: 'VIR-001',
    libelle: 'Virement client',
    type: 'entree',
    montant: 150000,
    statut: 'validé'
  },
  {
    id: '2',
    date: '2023-11-10',
    reference: 'FRAIS-001',
    libelle: 'Frais de gestion',
    type: 'sortie',
    montant: 5000,
    statut: 'validé'
  },
  {
    id: '3',
    date: '2023-11-05',
    reference: 'DEP-001',
    libelle: 'Dépôt espèce',
    type: 'entree',
    montant: 200000,
    statut: 'validé'
  },
  {
    id: '4',
    date: '2023-10-28',
    reference: 'RET-001',
    libelle: 'Retrait DAB',
    type: 'sortie',
    montant: 50000,
    statut: 'annulé',
    motifAnnulation: 'Erreur de saisie'
  },
  {
    id: '5',
    date: '2023-10-25',
    reference: 'VIR-002',
    libelle: 'Virement fournisseur',
    type: 'sortie',
    montant: 75000,
    statut: 'validé'
  },
  {
    id: '6',
    date: '2023-10-20',
    reference: 'CHEQUE-001',
    libelle: 'Encaissement chèque',
    type: 'entree',
    montant: 300000,
    statut: 'en_attente'
  },
  {
    id: '7',
    date: '2023-11-01',
    reference: 'RET-001',
    libelle: 'Retrait DAB',
    type: 'sortie',
    montant: 100000,
    statut: 'annulé',
    motifAnnulation: 'Erreur de saisie'
  },
  {
    id: '8',
    date: '2023-10-28',
    reference: 'VIR-003',
    libelle: 'Virement reçu',
    type: 'entree',
    montant: 500000,
    statut: 'validé'
  }
];


const MouvementRubriqueMataList: React.FC<{ compteId?: string }> = ({ compteId: propCompteId }) => {
  const params = useParams<{ compteId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Utiliser la prop compteId si fournie, sinon utiliser le paramètre d'URL
  const compteId = propCompteId || params.compteId;
  
  // États pour les données
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [recapitulatif, setRecapitulatif] = useState<Recapitulatif>({
    totalEntrees: 0,
    totalSorties: 0,
    solde: 0,
    nombreMouvements: 0
  });
  
  // États pour la pagination et le tri
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof Mouvement>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  
  // États pour les filtres
  const [filters, setFilters] = useState<{
    dateDebut?: string | null;
    dateFin?: string | null;
    type?: 'entree' | 'sortie' | '';
    statut?: string;
    search?: string;
  }>({});
  
  // États pour la boîte de dialogue d'annulation
  const [openAnnulation, setOpenAnnulation] = useState(false);
  const [selectedMouvement, setSelectedMouvement] = useState<Mouvement | null>(null);
  const [motifAnnulation, setMotifAnnulation] = useState('');
  
  // État de chargement
  const [loading, setLoading] = useState(true);
  
  // Définition du type pour les événements de sélection
  type SelectChangeEvent = React.ChangeEvent<{ name?: string; value: unknown }>;
  
  // Fonction pour charger les données
  const loadMouvements = async () => {
    try {
      setLoading(true);
      // Simulation de chargement asynchrone
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Utilisation des données factices pour le développement
      setMouvements(mockMouvements);
      
      // Calcul du récapitulatif
      const totalEntrees = mockMouvements
        .filter(m => m.type === 'entree')
        .reduce((sum, m) => sum + m.montant, 0);
        
      const totalSorties = mockMouvements
        .filter(m => m.type === 'sortie')
        .reduce((sum, m) => sum + m.montant, 0);
        
      setRecapitulatif({
        totalEntrees,
        totalSorties,
        solde: totalEntrees - totalSorties,
        nombreMouvements: mockMouvements.length
      });
      
      return mockMouvements;
    } catch (error) {
      console.error('Erreur lors du chargement des mouvements:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Gestion de l'annulation d'un mouvement
  const handleAnnulerMouvement = async () => {
    if (!selectedMouvement || !motifAnnulation.trim()) return;
    
    try {
      setLoading(true);
      
      // Simulation de requête API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mise à jour de l'état local
      const updatedMouvements = mouvements.map(m => 
        m.id === selectedMouvement.id 
          ? { ...m, statut: 'annulé', motifAnnulation } 
          : m
      );
      
      setMouvements(updatedMouvements);
      
      // Mise à jour du récapitulatif
      const totalEntrees = updatedMouvements
        .filter(m => m.type === 'entree')
        .reduce((sum, m) => sum + m.montant, 0);
        
      const totalSorties = updatedMouvements
        .filter(m => m.type === 'sortie')
        .reduce((sum, m) => sum + m.montant, 0);
        
      setRecapitulatif({
        totalEntrees,
        totalSorties,
        solde: totalEntrees - totalSorties,
        nombreMouvements: updatedMouvements.length
      });
      
      // Fermeture de la boîte de dialogue
      handleCloseAnnulationDialog();
      
      // Afficher un message de succès
      console.log('Mouvement annulé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'annulation du mouvement:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  // Gestion du changement de page
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Gestion du tri
  const handleRequestSort = (property: keyof Mouvement) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Fonction de formatage des montants
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };
  
  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'validé':
        return 'success';
      case 'annulé':
        return 'error';
      case 'en_attente':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Fonction pour ouvrir la boîte de dialogue d'annulation
  const handleOpenAnnulationDialog = (mouvement: Mouvement) => {
    setSelectedMouvement(mouvement);
    setMotifAnnulation(mouvement.motifAnnulation || '');
    setOpenAnnulation(true);
  };

  // Fonction pour fermer la boîte de dialogue d'annulation
  const handleCloseAnnulationDialog = () => {
    setOpenAnnulation(false);
    setSelectedMouvement(null);
    setMotifAnnulation('');
  };

  // Filtrer et trier les mouvements
  const filteredMouvements = useMemo(() => {
    let result = [...mouvements];
    
    // Appliquer les filtres
    if (filters.dateDebut) {
      result = result.filter(m => m.date >= filters.dateDebut!);
    }
    
    if (filters.dateFin) {
      result = result.filter(m => m.date <= filters.dateFin!);
    }
    
    if (filters.type) {
      result = result.filter(m => m.type === filters.type);
    }
    
    if (filters.statut) {
      result = result.filter(m => m.statut === filters.statut);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(m => 
        m.reference.toLowerCase().includes(searchLower) ||
        m.libelle.toLowerCase().includes(searchLower)
      );
    }
    
    // Trier les résultats
    result.sort((a, b) => {
      let comparison = 0;
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
    
    return result;
  }, [mouvements, filters, orderBy, order]);
  
  // Pagination des résultats
  const paginatedMouvements = useMemo(() => {
    return filteredMouvements.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredMouvements, page, rowsPerPage]);

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await loadMouvements();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (!compteId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Aucun compte sélectionné</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ p: isMobile ? 1 : 3 }}>
        {/* En-tête */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Mouvements de la rubrique MATA
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate(`/mata/${compteId}/nouveau`)}
          >
            Nouveau mouvement
          </Button>
        </Box>
        
        {/* Filtres */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>Filtres</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Date début"
                value={filters.dateDebut ? moment(filters.dateDebut) : null}
                onChange={(date) => handleFilterChange('dateDebut', date?.format('YYYY-MM-DD') || '')}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Date fin"
                value={filters.dateFin ? moment(filters.dateFin) : null}
                onChange={(date) => handleFilterChange('dateFin', date?.format('YYYY-MM-DD') || '')}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value as 'entree' | 'sortie' | '')}
                  label="Type"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="entree">Entrée</MenuItem>
                  <MenuItem value="sortie">Sortie</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.statut || ''}
                  onChange={(e) => handleFilterChange('statut', e.target.value as string)}
                  label="Statut"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="validé">Validé</MenuItem>
                  <MenuItem value="en_attente">En attente</MenuItem>
                  <MenuItem value="annulé">Annulé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button 
                variant="outlined" 
                onClick={handleResetFilters}
                startIcon={<FilterListIcon />}
                fullWidth
                sx={{ height: '56px' }}
              >
                Réinitialiser
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par référence ou libellé..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Box>
        </Card>
        
        {/* Cartes de synthèse */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total des entrées
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  {formatMontant(recapitulatif.totalEntrees)}
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total des sorties
                </Typography>
                <Typography variant="h5" color="error.main" fontWeight="bold">
                  {formatMontant(recapitulatif.totalSorties)}
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Solde actuel
                </Typography>
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  {formatMontant(recapitulatif.solde)}
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Nombre de mouvements
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {recapitulatif.nombreMouvements}
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
        
        {/* Tableau des mouvements */}
        <Card>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1">
            Liste des mouvements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredMouvements.length} mouvements trouvés
          </Typography>
        </Box>
        
        <Divider />
        
        <TableContainer>
          <Table size={isMobile ? 'small' : 'medium'}>
            {loading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress />
                      <Typography variant="body1" sx={{ ml: 2 }}>Chargement des mouvements...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sortDirection={orderBy === 'date' ? order : false}
                      onClick={() => handleRequestSort('date')}
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Date
                        {orderBy === 'date' ? (
                          order === 'desc' ? <ArrowDownIcon fontSize="small" /> : <ArrowUpIcon fontSize="small" />
                        ) : <FilterListIcon fontSize="small" color="disabled" />}
                      </Box>
                    </TableCell>
                    <TableCell>Référence</TableCell>
                    <TableCell>Libellé</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell 
                      align="right"
                      sortDirection={orderBy === 'montant' ? order : false}
                      onClick={() => handleRequestSort('montant')}
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        Montant
                        {orderBy === 'montant' ? (
                          order === 'desc' ? <ArrowDownIcon fontSize="small" /> : <ArrowUpIcon fontSize="small" />
                        ) : <FilterListIcon fontSize="small" color="disabled" />}
                      </Box>
                    </TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMouvements.length > 0 ? (
                    paginatedMouvements.map((mouvement) => (
                      <TableRow 
                        key={mouvement.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          {moment(mouvement.date).format('DD/MM/YYYY')}
                        </TableCell>
                        <TableCell>{mouvement.reference}</TableCell>
                        <TableCell>{mouvement.libelle}</TableCell>
                        <TableCell>
                          <Chip 
                            label={mouvement.type === 'entree' ? 'Entrée' : 'Sortie'}
                            color={mouvement.type === 'entree' ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{
                            color: mouvement.type === 'entree' ? 'success.main' : 'error.main',
                            fontWeight: 'medium'
                          }}
                        >
                          {mouvement.type === 'entree' ? '+' : '-'} {formatMontant(mouvement.montant)}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={mouvement.statut}
                            color={getStatusColor(mouvement.statut) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Voir les détails">
                              <IconButton 
                                size="small"
                                onClick={() => navigate(`/comptes/${compteId}/mouvements/${mouvement.id}`)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {mouvement.statut === 'validé' && (
                              <Tooltip title="Annuler le mouvement">
                                <IconButton 
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenAnnulationDialog(mouvement)}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Aucun mouvement trouvé
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}
          </Table>
          
          {!loading && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredMouvements.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
              }
            />
          )}
        </TableContainer>
      </Card>
        
        {/* Boîte de dialogue d'annulation */}
        <Dialog
          open={openAnnulation}
          onClose={handleCloseAnnulationDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Annuler un mouvement</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Êtes-vous sûr de vouloir annuler ce mouvement ? Cette action est irréversible.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Motif d'annulation"
              type="text"
              fullWidth
              variant="outlined"
              value={motifAnnulation}
              onChange={(e) => setMotifAnnulation(e.target.value)}
              required
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseAnnulationDialog}>
              Annuler
            </Button>
            <Button 
              onClick={handleAnnulerMouvement} 
              variant="contained" 
              color="error"
              disabled={!motifAnnulation.trim()}
            >
              Confirmer l'annulation
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default MouvementRubriqueMataList;
