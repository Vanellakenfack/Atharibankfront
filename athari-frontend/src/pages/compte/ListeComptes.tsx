import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';

// Fonction utilitaire pour obtenir le code de devise ISO 4217
const getIsoCurrency = (customCurrency: string): string => {
  const currencyMap: Record<string, string> = {
    'FCFA': 'XOF',
    'EURO': 'EUR',
    'DOLLAR': 'USD',
    'POUND': 'GBP',
  };
  
  // Retourne le code ISO correspondant ou 'XOF' par défaut
  return currencyMap[customCurrency?.toUpperCase()] || 'XOF';
};
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
  Paper,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TableSortLabel,
  InputAdornment,
  Chip,
  Avatar,
  Pagination,
  styled
} from '@mui/material';
import { 
  Visibility as ViewIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import compteService from '../../services/api/compteService';
import DetailCompteModal from '../../components/compte/DetailCompteModal';
import ModifierCompteModal from '../../components/compte/ModifierCompteModal';

interface Compte {
  id: number;
  numero_compte: string;
  solde: number;
  devise: string;
  statut: 'actif' | 'inactif' | 'cloture';
  type_compte: {
    libelle: string;
  };
  client: {
    nom: string;
    prenom: string;
  };
  created_at: string;
}

const StyledTableHead = styled(MuiTableHead)({
  '&.MuiTableHead-root': {
    backgroundColor: '#F8FAFC',
    '& .MuiTableCell-head': {
      color: '#475569',
      fontWeight: 'bold',
      py: 2,
      borderBottom: '1px solid #edf2f7',
    },
  },
});

const StyledTableCell = styled(TableCell)({
  padding: '16px',
  color: '#1E293B',
  borderBottom: '1px solid #edf2f7',
});

const TableRow = styled(MuiTableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '& .MuiTableCell-root': {
    padding: '16px',
    color: '#1E293B',
    borderBottom: '1px solid #edf2f7',
  },
}));

const headCells = [
  { id: 'numero_compte', label: 'N° Compte' },
  { id: 'client', label: 'Client' },
  { id: 'type_compte', label: 'Type de compte' },
  { id: 'solde', label: 'Solde' },
  { id: 'devise', label: 'Devise' },
  { id: 'created_at', label: 'Date création' },
  { id: 'statut', label: 'Statut' },
  { id: 'actions', label: 'Actions', disableSorting: true },
];

const ListeComptes: React.FC = () => {
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');// on recherche par numero_compte nom ou prenom du client libelle de type de compte.
  const [selectedCompte, setSelectedCompte] = useState<Compte | null>(null);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('numero_compte');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // 10 éléments par défaut
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage - 1);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Charger les comptes
  useEffect(() => {
    const fetchComptes = async () => {
      try {
        setLoading(true);
        const response = await compteService.getComptes();
        console.log('Réponse de l\'API:', response);
        
        // S'assurer que nous avons bien un tableau
        let comptesData = [];
        
        if (Array.isArray(response)) {
          // Si la réponse est déjà un tableau
          comptesData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          // Si la réponse est un objet avec une propriété data qui est un tableau
          comptesData = response.data;
        } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
          // Si la réponse est un objet avec data.data qui est un tableau
          comptesData = response.data.data;
        }
        
        console.log('Comptes formatés:', comptesData);
        setComptes(comptesData);
      } catch (error) {
        console.error('Erreur lors du chargement des comptes:', error);
        setSnackbar({
          open: true,
          message: 'Erreur lors du chargement des comptes',
          severity: 'error'
        });
        setComptes([]); // S'assurer que comptes est un tableau vide en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchComptes();
  }, []);

  // Filtrer les comptes selon le terme de recherche
  const filteredComptes = (comptes || []).filter(compte => {
    try {
      const searchTermLower = searchTerm.toLowerCase();
      const nomComplet = `${compte?.client?.prenom || ''} ${compte?.client?.nom || ''}`.toLowerCase();
      const typeCompte = compte?.type_compte?.libelle?.toLowerCase() || '';
      const numCompte = compte?.numero_compte?.toLowerCase() || '';
      
      return (
        numCompte.includes(searchTermLower) ||
        nomComplet.includes(searchTermLower) ||
        typeCompte.includes(searchTermLower)
      );
    } catch (error) {
      console.error('Erreur lors du filtrage des comptes:', error, compte);
      return false;
    }
  });

  // Gérer l'ouverture du détail
  const handleOpenDetail = (compte: Compte) => {
    setSelectedCompte(compte);
    setOpenDetail(true);
  };

  // Gérer l'ouverture de la modification
  const handleOpenEdit = (compte: Compte) => {
    setSelectedCompte(compte);
    setOpenEdit(true);
  };

  // Gérer l'ouverture de la suppression
  const handleOpenDelete = (compte: Compte) => {
    setSelectedCompte(compte);
    setOpenDelete(true);
  };

  // Gérer la suppression
  const handleDelete = async () => {
    if (!selectedCompte) return;
    
    try {
      await compteService.toggleStatus(selectedCompte.id);
      setComptes(comptes.map(compte => 
        compte.id === selectedCompte.id 
          ? { ...compte, statut: compte.statut === 'actif' ? 'inactif' : 'actif' } 
          : compte
      ));
      
      setSnackbar({
        open: true,
        message: `Compte ${selectedCompte.statut === 'actif' ? 'désactivé' : 'réactivé'} avec succès`,
        severity: 'success'
      });
      
      setOpenDelete(false);
    } catch (error) {
      console.error('Erreur lors de la modification du statut du compte:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la modification du statut du compte',
        severity: 'error'
      });
    }
  };

  // Fermer les modales
  const handleCloseDetail = () => setOpenDetail(false);
  const handleCloseEdit = () => setOpenEdit(false);
  const handleCloseDelete = () => setOpenDelete(false);

  // Fermer la notification
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          width: `calc(100% - ${sidebarOpen ? '260px' : '80px'})`,
          transition: 'width 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* TopBar */}
        <TopBar sidebarOpen={sidebarOpen} />

        {/* Page Content */}
        <Box sx={{ 
          px: { xs: 2, md: 4 }, 
          py: 4, 
          flex: 1,
          overflow: 'auto'
        }}>
          {/* Page Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4 
          }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
                Gestion des Comptes
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                {loading ? 'Chargement...' : `${filteredComptes.length} comptes trouvés`}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/compte')}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                borderRadius: '10px', 
                px: 3, 
                py: 1.2, 
                textTransform: 'none', 
                fontWeight: 'bold',
                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
                '&:hover': { opacity: 0.9 }
              }}
            >
              Nouveau Compte
            </Button>
          </Box>

          {/* Search and Table */}
          <Paper sx={{ 
            borderRadius: '16px', 
            overflow: 'hidden', 
            border: '1px solid #edf2f7', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
          }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #edf2f7' }}>
              <TextField
                size="small"
                placeholder="Rechercher un compte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: '8px', 
                    bgcolor: '#F1F5F9', 
                    border: 'none', 
                    '& fieldset': { border: 'none' } 
                  }
                }}
                sx={{ width: 350 }}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <StyledTableHead>
                      <TableRow>
                        {headCells.map((headCell) => (
                          <StyledTableCell 
                            key={headCell.id} 
                            sx={{
                              py: 2,
                              px: 2,
                              fontSize: '0.8rem',
                              fontWeight: 'bold', 
                              color: '#3074d3ff',
                              cursor: headCell.disableSorting ? 'default' : 'pointer',
                              lineHeight: 1.2,
                              backgroundColor: '#F8FAFC',
                              borderBottom: '1px solid #edf2f7',
                            }}
                            onClick={headCell.disableSorting ? undefined : () => handleRequestSort(headCell.id)}
                          >
                            {headCell.disableSorting ? (
                              headCell.label
                            ) : (
                              <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                              >
                                {headCell.label}
                              </TableSortLabel>
                            )}
                          </StyledTableCell>
                        ))}
                      </TableRow>
                    </StyledTableHead>
                    <TableBody>
                      {filteredComptes.length > 0 ? (
                        filteredComptes
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((compte) => (
                            <TableRow 
                              key={compte.id} 
                              hover 
                              sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}
                            >
                              <StyledTableCell sx={{ color: '#1E293B', fontWeight: 500 }}>
                                {compte.numero_compte}
                              </StyledTableCell>
                              <StyledTableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar 
                                    sx={{ 
                                      width: 36, 
                                      height: 36, 
                                      bgcolor: '#E0E7FF',
                                      color: '#6366F1',
                                      fontWeight: 600,
                                      fontSize: '0.875rem'
                                    }}
                                  >
                                    {`${compte.client?.prenom?.[0] || ''}${compte.client?.nom?.[0] || ''}`.toUpperCase()}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                                      {`${compte.client?.prenom || ''} ${compte.client?.nom || ''}`.trim()}
                                    </Typography>
                                  </Box>
                                </Box>
                              </StyledTableCell>
                              <StyledTableCell>
                                <Chip 
                                  label={compte.type_compte?.libelle || 'N/A'} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: '#E0F2FE', 
                                    color: '#0369A1',
                                    fontWeight: 500,
                                    textTransform: 'capitalize'
                                  }} 
                                />
                              </StyledTableCell>
                              <StyledTableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                {new Intl.NumberFormat('fr-FR', { 
                                  style: 'currency', 
                                  currency: getIsoCurrency(compte.devise),
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0
                                }).format(compte.solde || 0)}
                              </StyledTableCell>
                              <StyledTableCell>
                                <Chip 
                                  label={compte.devise === 'FCFA' ? 'FCFA' : (compte.devise || 'XOF')} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ 
                                    borderColor: '#E2E8F0',
                                    color: '#475569',
                                    fontWeight: 500
                                  }} 
                                />
                              </StyledTableCell>
                              <StyledTableCell sx={{ color: '#64748B' }}>
                                {formatDate(compte.created_at)}
                              </StyledTableCell>
                              <StyledTableCell>
                                <Chip 
                                  label={compte.statut === 'actif' ? 'Actif' : 'Inactif'} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: compte.statut === 'actif' ? '#D1FAE5' : '#FEE2E2', 
                                    color: compte.statut === 'actif' ? '#065F46' : '#B91C1C',
                                    fontWeight: 600,
                                    textTransform: 'capitalize'
                                  }} 
                                />
                              </StyledTableCell>
                              <StyledTableCell align="right" sx={{ pr: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                  <Tooltip title="Voir les détails">
                                    <IconButton 
                                      onClick={() => handleOpenDetail(compte)}
                                      size="small"
                                      sx={{ 
                                        color: '#64748B',
                                        '&:hover': { 
                                          bgcolor: 'rgba(99, 102, 241, 0.1)',
                                          color: '#6366F1'
                                        }
                                      }}
                                    >
                                      <ViewIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Modifier">
                                    <IconButton 
                                      onClick={() => handleOpenEdit(compte)}
                                      size="small"
                                      sx={{ 
                                        color: '#64748B',
                                        '&:hover': { 
                                          bgcolor: 'rgba(59, 130, 246, 0.1)',
                                          color: '#3B82F6'
                                        }
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={compte.statut === 'actif' ? 'Désactiver' : 'Activer'}>
                                    <IconButton 
                                      onClick={() => handleOpenDelete(compte)}
                                      size="small"
                                      sx={{ 
                                        color: compte.statut === 'actif' ? '#EF4444' : '#10B981',
                                        '&:hover': { 
                                          bgcolor: compte.statut === 'actif' 
                                            ? 'rgba(239, 68, 68, 0.1)' 
                                            : 'rgba(16, 185, 129, 0.1)',
                                        }
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </StyledTableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <StyledTableCell colSpan={headCells.length} align="center" sx={{ py: 6 }}>
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                              <img 
                                src="/empty-state.svg" 
                                alt="Aucune donnée" 
                                style={{ width: 120, opacity: 0.7, marginBottom: 2 }}
                              />
                              <Typography variant="body1" color="textSecondary">
                                Aucun compte trouvé
                              </Typography>
                              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                Essayez de modifier vos critères de recherche
                              </Typography>
                            </Box>
                          </StyledTableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {filteredComptes.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', p: 2, borderTop: '1px solid #E2E8F0', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          Lignes par page :
                        </Typography>
                        <select
                          value={rowsPerPage}
                          onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setPage(0);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            cursor: 'pointer'
                          }}
                        >
                          {[5, 10, 25, 50, 100].map((rows) => (
                            <option key={rows} value={rows}>
                              {rows}
                            </option>
                          ))}
                        </select>
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary">
                        Affichage de {Math.min(page * rowsPerPage + 1, filteredComptes.length)} à {Math.min((page + 1) * rowsPerPage, filteredComptes.length)} sur {filteredComptes.length} comptes
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Pagination 
                        count={Math.ceil(filteredComptes.length / rowsPerPage)}
                        page={page + 1}
                        onChange={(e, newPage) => handleChangePage(e, newPage)}
                        color="primary"
                        showFirstButton 
                        showLastButton
                        size="large"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            color: '#3b82f6',
                            '&.Mui-selected': {
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              color: 'white',
                              '&:hover': {
                                opacity: 0.9
                              }
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(59, 130, 246, 0.1)'
                            }
                          }
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Paper>

        </Box>

        {/* Modals */}
        <DetailCompteModal 
          open={openDetail} 
          onClose={handleCloseDetail} 
          compte={selectedCompte} 
        />

        <ModifierCompteModal
          open={openEdit}
          onClose={handleCloseEdit}
          compte={selectedCompte}
          onUpdate={(updatedCompte) => {
            setComptes(comptes.map(c => c.id === updatedCompte.id ? updatedCompte : c));
            setSnackbar({
              open: true,
              message: 'Compte mis à jour avec succès',
              severity: 'success'
            });
          }}
        />

        <Dialog open={openDelete} onClose={handleCloseDelete}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Êtes-vous sûr de vouloir {selectedCompte?.statut === 'actif' ? 'désactiver' : 'réactiver'} le compte n°{selectedCompte?.numero_compte} ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDelete} color="primary">
              Annuler
            </Button>
            <Button onClick={handleDelete} color={selectedCompte?.statut === 'actif' ? 'error' : 'success'} variant="contained">
              {selectedCompte?.statut === 'actif' ? 'Désactiver' : 'Réactiver'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ListeComptes;
