import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, IconButton, Chip, Typography, Box, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, 
  FormControlLabel, Checkbox, InputAdornment, Snackbar, Alert,
  Tooltip, Select, MenuItem, Pagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ApiClient from '@/services/api/ApiClient';

interface TypeCompte {
  id: number;
  code: string;
  libelle: string;
  description: string | null;
  est_mata: boolean;
  necessite_duree: boolean;
  est_islamique: boolean;
  actif: boolean;
}

const TypeCompteList = () => {
  const navigate = useNavigate();
  const [typesCompte, setTypesCompte] = useState<TypeCompte[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<TypeCompte[]>([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingType, setEditingType] = useState<TypeCompte | null>(null);
  const [formData, setFormData] = useState<Partial<TypeCompte>>({});
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

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Charger la liste des types de compte
  useEffect(() => {
    const fetchTypesCompte = async () => {
      try {
        console.log('Début du chargement des types de compte...');
        const response = await ApiClient.get('/types-comptes');
        console.log('Réponse complète de l\'API:', response);
        
        // Fonction pour extraire récursivement les tableaux d'un objet
        const extractArrays = (obj) => {
          if (Array.isArray(obj)) return obj;
          if (typeof obj !== 'object' || obj === null) return [];
          
          // Vérifier chaque valeur de l'objet
          for (const key in obj) {
            if (Array.isArray(obj[key])) {
              return obj[key];
            }
            const nestedArray = extractArrays(obj[key]);
            if (nestedArray.length > 0) return nestedArray;
          }
          
          // Si aucun tableau n'est trouvé, retourner les valeurs de l'objet
          return Object.values(obj).filter(v => v !== null && typeof v === 'object');
        };
        
        // Extraire les données de la réponse
        let data = [];
        if (response.data) {
          data = extractArrays(response.data);
          // Si on n'a toujours pas de tableau, on essaie de tout récupérer
          if (!Array.isArray(data) || data.length === 0) {
            data = Object.values(response.data);
          }
        }
        
        console.log('Données extraites:', data);
        
        // S'assurer que data est un tableau
        if (!Array.isArray(data)) {
          data = [data];
        }
        
        // Filtrer les éléments null/undefined
        const cleanData = data.filter(item => item !== null && item !== undefined);
        
        setTypesCompte(cleanData);
        setFilteredTypes(cleanData);
      } catch (error) {
        console.error('Erreur lors du chargement des types de compte', error);
        // Initialiser avec un tableau vide en cas d'erreur
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
    setPage(0); // Réinitialiser à la première page lors d'une nouvelle recherche
  }, [searchTerm, typesCompte]);

  // Gestion du changement de page
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Gestion du changement du nombre de lignes par page
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Effet temporaire pour déboguer la réponse de l'API
  useEffect(() => {
    const testApiCall = async () => {
      try {
        const response = await ApiClient.get('/types-comptes');
        console.log('Test API Response:', response);
        console.log('Response Data Type:', typeof response.data);
        console.log('Is Array:', Array.isArray(response.data));
        console.log('Data Structure:', response.data);
      } catch (error) {
        console.error('Test API Error:', error);
      }
    };
    
    testApiCall();
  }, []);

  // Gestion de la désactivation
  const handleDelete = async () => {
    if (!deleteModal.typeId) return;

    try {
      // Utiliser PUT au lieu de PATCH pour la mise à jour
      await ApiClient.put(`/types-comptes/${deleteModal.typeId}`, { actif: false });
      
      // Mettre à jour l'état local
      setTypesCompte(typesCompte.map(type => 
        type.id === deleteModal.typeId ? { ...type, actif: false } : type
      ));
      
      setSnackbar({
        open: true,
        message: 'Type de compte désactivé avec succès',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de la désactivation', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la désactivation du type de compte',
        severity: 'error'
      });
    } finally {
      setDeleteModal({ open: false, typeId: null, typeName: '' });
    }
  };

  // Gestion du toggle actif/inactif
  const toggleActif = async (id: number, currentStatus: boolean) => {
    try {
      await ApiClient.patch(`/types-comptes/${id}/toggle-actif`);
      setTypesCompte(typesCompte.map(type => 
        type.id === id ? { ...type, actif: !currentStatus } : type
      ));
    } catch (error) {
      console.error('Erreur lors du changement de statut', error);
    }
  };

  // Gestion de l'édition
  const handleEditClick = (type: TypeCompte) => {
    setEditingType(type);
    setFormData({ ...type });
    setOpenEditModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;

    try {
      const response = await ApiClient.put(`/types-comptes/${editingType.id}`, formData);
      setTypesCompte(typesCompte.map(type => 
        type.id === editingType.id ? response.data : type
      ));
      setSnackbar({
        open: true,
        message: 'Type de compte mis à jour avec succès',
        severity: 'success'
      });
      setOpenEditModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la mise à jour du type de compte',
        severity: 'error'
      });
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
    <Box sx={{ p: { xs: 1, sm: 3 }, width: '100%', overflow: 'hidden' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Retour au tableau de bord">
              <IconButton 
                onClick={() => navigate('/dashboard')}
                color="primary"
                sx={{ 
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white'
                  }
                }}
              >
                <DashboardIcon />
              </IconButton>
            </Tooltip>
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
            <TableHead  sx={{ bgcolor: "linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)"  }}>
              <TableRow>
                <TableCell  sx={{ bgcolor: "linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)"  }}>Code</TableCell>
                <TableCell  sx={{ bgcolor: "linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)"  }}>Libellé</TableCell>
                <TableCell  sx={{ bgcolor: "linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)"  }}>Description</TableCell>
                <TableCell align="center"  sx={{ bgcolor: "linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)"  }}>MATA</TableCell>
                <TableCell align="center"  sx={{ bgcolor: "linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)"  }}>Durée</TableCell>
                <TableCell align="center"  sx={{ bgcolor: "linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)"  }}>Islamique</TableCell>
                <TableCell align="center"  sx={{ bgcolor: "linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)"  }}>Statut</TableCell>
                <TableCell align="center"  sx={{ bgcolor: "linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)"  }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTypes
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((type, index) => (
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
                      <IconButton 
                        onClick={() => handleEditClick(type)}
                        size="small"
                        sx={{ '&:hover': { color: 'primary.main' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {type.actif ? (
                        <Tooltip title="Désactiver">
                          <IconButton 
                            onClick={() => setDeleteModal({ 
                              open: true, 
                              typeId: type.id, 
                              typeName: type.libelle 
                            })}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Réactiver">
                          <IconButton
                            onClick={async () => {
                              try {
                                await ApiClient.put(`/types-comptes/${type.id}`, { actif: true });
                                setTypesCompte(typesCompte.map(t => 
                                  t.id === type.id ? { ...t, actif: true } : t
                                ));
                                setSnackbar({
                                  open: true,
                                  message: 'Type de compte réactivé avec succès',
                                  severity: 'success'
                                });
                              } catch (error) {
                                console.error('Erreur lors de la réactivation', error);
                                setSnackbar({
                                  open: true,
                                  message: 'Erreur lors de la réactivation du type de compte',
                                  severity: 'error'
                                });
                              }
                            }}
                            color="primary"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Pagination personnalisée */}
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
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmitEdit}>
          <DialogTitle>Modifier le type de compte</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              name="code"
              label="Code"
              fullWidth
              value={formData.code || ''}
              onChange={handleFormChange}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="libelle"
              label="Libellé"
              fullWidth
              value={formData.libelle || ''}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description || ''}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="est_mata"
                  checked={formData.est_mata || false}
                  onChange={handleFormChange}
                />
              }
              label="Est un compte de type MATA"
              sx={{ display: 'block', mb: 1 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="necessite_duree"
                  checked={formData.necessite_duree || false}
                  onChange={handleFormChange}
                />
              }
              label="Nécessite une durée"
              sx={{ display: 'block', mb: 1 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="est_islamique"
                  checked={formData.est_islamique || false}
                  onChange={handleFormChange}
                />
              }
              label="Compte islamique"
              sx={{ display: 'block', mb: 1 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="actif"
                  checked={formData.actif || false}
                  onChange={handleFormChange}
                />
              }
              label="Actif"
              sx={{ display: 'block' }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenEditModal(false)} variant="outlined">
              Annuler
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Enregistrer
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog
        open={deleteModal.open}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmer la désactivation</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir désactiver le type de compte "{deleteModal.typeName}" ?
            Il pourra être réactivé ultérieurement.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDeleteModal({ ...deleteModal, open: false })}
            variant="outlined"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Désactiver
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
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TypeCompteList;