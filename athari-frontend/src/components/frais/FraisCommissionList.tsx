import React, { useState, useEffect } from 'react';
import { useFrais } from '../../hooks/useFrais';
import { useNavigate } from 'react-router-dom';
import {
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer,
  TableHead, 
  TableRow, 
  TableSortLabel, 
  Pagination,
  Box,
  IconButton, 
  Typography, 
  TextField, 
  InputAdornment,
  Button, 
  Chip, 
  Avatar, 
  Tooltip, 
  CircularProgress, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Alert, 
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface FraisCommission {
  id: number;
  type_compte_id: number;
  type_compte?: {
    libelle: string;
  };
  frais_ouverture: string | null;
  frais_ouverture_actif: boolean;
  frais_tenue_compte: string | null;
  frais_tenue_compte_actif: boolean;
  commission_mouvement: string | null;
  commission_mouvement_actif: boolean;
  commission_retrait: string | null;
  commission_retrait_actif: boolean;
  commission_sms: string | null;
  commission_sms_actif: boolean;
  taux_interet_annuel: string | null;
  penalite_retrait_anticipe: string | null;
  minimum_compte: string | null;
  seuil_commission_mensuelle: string | null;
  commission_mensuelle_elevee: string | null;
  commission_mensuelle_basse: string | null;
  actif: boolean;
}

interface HeadCell {
  id: keyof FraisCommission | 'actions';
  label: string;
  numeric?: boolean;
  disableSorting?: boolean;
}

const headCells: HeadCell[] = [
  { id: 'type_compte_id', label: 'Type de compte' },
  { id: 'frais_ouverture', label: 'Frais d\'ouverture', numeric: true },
  { id: 'frais_tenue_compte', label: 'Frais de tenue', numeric: true },
  { id: 'commission_mouvement', label: 'Commission mouvement', numeric: true },
  { id: 'commission_retrait', label: 'Commission retrait', numeric: true },
  { id: 'commission_sms', label: 'Commission SMS', numeric: true },
  { id: 'taux_interet_annuel', label: 'Taux intérêt', numeric: true },
  { id: 'actif', label: 'Statut' },
  { id: 'actions', label: 'Actions', disableSorting: true },
];

const FraisCommissionList: React.FC = () => {
  const { 
    fraisCommissions, 
    loading, 
    deleteFraisCommission,
    loadFraisCommissions 
  } = useFrais();
  
  const navigate = useNavigate();
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof FraisCommission>('type_compte_id');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadFraisCommissions();
  }, [loadFraisCommissions]);

  const handleRequestSort = (property: keyof FraisCommission) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedId !== null) {
      setDeleteLoading(true);
      try {
        const result = await deleteFraisCommission(selectedId);
        if (result?.success) {
          setNotification({
            open: true,
            message: 'Configuration supprimée avec succès',
            severity: 'success'
          });
        } else {
          setNotification({
            open: true,
            message: result?.error || 'Erreur lors de la suppression',
            severity: 'error'
          });
        }
        setOpenConfirm(false);
      } catch (error) {
        setNotification({
          open: true,
          message: 'Une erreur est survenue lors de la suppression',
          severity: 'error'
        });
      } finally {
        setDeleteLoading(false);
        setSelectedId(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setSelectedId(null);
  };

  const formatValue = (value: string | number | null, isActive: boolean = true, suffix: string = '') => {
    if (!isActive) return 'Désactivé';
    if (value === null || value === undefined || value === '') return '-';
    return `${value}${suffix}`;
  };

  // Fonction de tri
  function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  function getComparator<Key extends keyof any>(
    order: 'asc' | 'desc',
    orderBy: Key,
  ): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  // Filtrage par recherche
  const filteredData = fraisCommissions.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      (item.type_compte?.libelle?.toLowerCase().includes(search) || 
       `Type de compte ${item.type_compte_id}`.toLowerCase().includes(search))
    );
  });

  // Tri des données
  const sortedData = stableSort(filteredData, getComparator(order, orderBy));
  
  // Calcul du nombre total de pages
  const pageCount = Math.ceil(sortedData.length / rowsPerPage);
  
  // Mise à jour de la page si nécessaire (si on est sur une page qui n'existe plus après filtrage)
  useEffect(() => {
    if (page > 0 && page >= pageCount) {
      setPage(Math.max(0, pageCount - 1));
    }
  }, [pageCount, page]);
  
  // Récupération des lignes visibles pour la page courante
  const visibleRows = sortedData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 1400, mx: 'auto' }}>
      {/* Header de la page */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
            Gestion des Frais et Commissions
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            {loading ? 'Chargement...' : `${filteredData.length} configurations trouvées`}
          </Typography>
        </Box>

        {/*<Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/frais/commissions/nouveau')}
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
          Nouvelle Configuration
        </Button>*/}
      </Box>

      {/* Barre de Recherche et Table */}
      <Paper sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #1471ceff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        mb: 4
      }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #edf2f7' }}>
          <TextField
            size="small"
            placeholder="Rechercher un type de compte..."
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
            sx={{ width: { xs: '100%', sm: 420 } }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 980 }}>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.numeric ? 'right' : 'left'}
                      sortDirection={orderBy === headCell.id ? order : false}
                      sx={{
                        py: 2,
                        fontWeight: 'bold',
                        color: '#475569',
                        cursor: headCell.disableSorting ? 'default' : 'pointer'
                      }}
                      onClick={headCell.disableSorting ? undefined : () => handleRequestSort(headCell.id as keyof FraisCommission)}
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
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headCells.length} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        Aucune configuration de frais trouvée.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/frais/commissions/nouveau')}
                        sx={{
                          mt: 2,
                          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                          '&:hover': { opacity: 0.9 }
                        }}
                      >
                        Ajouter une configuration
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleRows.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{ '&:hover': { backgroundColor: '#F8FAFF' } }}
                    >
                        <TableCell sx={{ py: 2.5, borderBottom: '1px solid #edf2f7' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: 'rgba(99, 102, 241, 0.1)', 
                                color: '#6366f1',
                                mr: 2,
                                width: 36,
                                height: 36,
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}
                            >
                              {row.type_compte?.libelle?.charAt(0) || 'T'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                                {row.type_compte?.libelle || `Type de compte ${row.type_compte_id}`}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.5, borderBottom: '1px solid #edf2f7' }}>
                          <Typography variant="body2">
                            {formatValue(row.frais_ouverture, row.frais_ouverture_actif, ' FCFA')}
                          </Typography>
                          {!row.frais_ouverture_actif && (
                            <Chip 
                              label="Désactivé" 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                fontSize: '0.65rem',
                                bgcolor: '#FEE2E2',
                                color: '#B91C1C',
                                mt: 0.5
                              }} 
                            />
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.5, borderBottom: '1px solid #edf2f7' }}>
                          <Typography variant="body2">
                            {formatValue(row.frais_tenue_compte, row.frais_tenue_compte_actif, ' FCFA')}
                          </Typography>
                          {!row.frais_tenue_compte_actif && (
                            <Chip 
                              label="Désactivé" 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                fontSize: '0.65rem',
                                bgcolor: '#FEE2E2',
                                color: '#B91C1C',
                                mt: 0.5
                              }} 
                            />
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.5, borderBottom: '1px solid #edf2f7' }}>
                          <Typography variant="body2">
                            {formatValue(row.commission_mouvement, row.commission_mouvement_actif, ' FCFA')}
                          </Typography>
                          {!row.commission_mouvement_actif && (
                            <Chip 
                              label="Désactivé" 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                fontSize: '0.65rem',
                                bgcolor: '#FEE2E2',
                                color: '#B91C1C',
                                mt: 0.5
                              }} 
                            />
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.5, borderBottom: '1px solid #edf2f7' }}>
                          <Typography variant="body2">
                            {formatValue(row.commission_retrait, row.commission_retrait_actif, ' FCFA')}
                          </Typography>
                          {!row.commission_retrait_actif && (
                            <Chip 
                              label="Désactivé" 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                fontSize: '0.65rem',
                                bgcolor: '#FEE2E2',
                                color: '#B91C1C',
                                mt: 0.5
                              }} 
                            />
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.5, borderBottom: '1px solid #edf2f7' }}>
                          <Typography variant="body2">
                            {formatValue(row.commission_sms, row.commission_sms_actif, ' FCFA')}
                          </Typography>
                          {!row.commission_sms_actif && (
                            <Chip 
                              label="Désactivé" 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                fontSize: '0.65rem',
                                bgcolor: '#FEE2E2',
                                color: '#B91C1C',
                                mt: 0.5
                              }} 
                            />
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.5, borderBottom: '1px solid #edf2f7' }}>
                          <Chip 
                            label={formatValue(row.taux_interet_annuel, true, '%')} 
                            size="small"
                            sx={{ 
                              bgcolor: '#D1FAE5',
                              color: '#065F46',
                              fontWeight: 500,
                              height: 24
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2.5, borderBottom: '1px solid #edf2f7' }}>
                          <Chip 
                            label={row.actif ? 'Actif' : 'Inactif'} 
                            size="small"
                            sx={{ 
                              bgcolor: row.actif ? '#D1FAE5' : '#FEE2E2',
                              color: row.actif ? '#065F46' : '#B91C1C',
                              fontWeight: 500,
                              height: 24
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2.5, borderBottom: '1px solid #edf2f7' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title="Détails">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/frais/commissions/detail/${row.id}`)}
                                sx={{
                                  color: '#0EA5E9',
                                  '&:hover': {
                                    bgcolor: 'rgba(14, 165, 233, 0.12)'
                                  }
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier">
                              <IconButton 
                                size="small" 
                                onClick={() => navigate(`/frais/commissions/edit/${row.id}`)}
                                sx={{ 
                                  color: '#6366F1',
                                  '&:hover': { 
                                    bgcolor: 'rgba(99, 102, 241, 0.1)' 
                                  } 
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteClick(row.id)}
                                sx={{ 
                                  color: '#EF4444',
                                  '&:hover': { 
                                    bgcolor: 'rgba(239, 68, 68, 0.1)' 
                                  } 
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 2,
              borderTop: '1px solid #edf2f7',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Typography variant="body2" color="text.secondary">
                {`${filteredData.length} élément${filteredData.length > 1 ? 's' : ''} au total`}
              </Typography>
              <Pagination 
                count={Math.ceil(filteredData.length / rowsPerPage)}
                page={page + 1}
                onChange={(_, value) => setPage(value - 1)}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    margin: '0 4px',
                    minWidth: '32px',
                    height: '32px',
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      color: 'white',
                      '&:hover': {
                        opacity: 0.9,
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    },
                  },
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Lignes par page:
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
                    backgroundColor: 'white',
                    cursor: 'pointer',
                  }}
                >
                  {[5, 10, 25].map((rows) => (
                    <option key={rows} value={rows}>
                      {rows}
                    </option>
                  ))}
                </select>
              </Box>
            </Box>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={openConfirm}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '100%',
            p: 2
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{
          fontWeight: 700,
          color: '#1E293B',
          pb: 1,
          fontSize: '1.25rem'
        }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: '#64748B' }}>
            Êtes-vous sûr de vouloir supprimer cette configuration de frais ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={handleCancelDelete}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              py: 1,
              borderColor: '#E2E8F0',
              color: '#64748B',
              '&:hover': {
                borderColor: '#CBD5E1',
                bgcolor: '#F8FAFC'
              }
            }}
            disabled={deleteLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            autoFocus
            disabled={deleteLoading}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              py: 1,
              bgcolor: '#EF4444',
              '&:hover': {
                bgcolor: '#DC2626'
              }
            }}
          >
            {deleteLoading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Suppression...
              </>
            ) : (
              'Supprimer définitivement'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FraisCommissionList;
