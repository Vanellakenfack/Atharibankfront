import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Alert,
  Snackbar,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Divider,
  FormHelperText,
  Container,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ApiClient from '../../services/api/ApiClient';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';

// Couleurs des rôles
const roleColors = {
  'DG': 'error',
  'Admin': 'error',
  'Chef Comptable': 'warning',
  "Chef d'Agence (CA)": 'info',
  'Assistant Juridique (AJ)': 'secondary',
  'Assistant Comptable (AC)': 'success',
  'Caissière': 'primary',
  'Agent de Crédit (AC)': 'default',
  'Collecteur': 'default',
  'Audit/Contrôle (IV)': 'secondary',
};

// Composant principal
const UserManagement = () => {
  // --- États pour le Layout ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // États
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  
  // États du dialogue
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  
  // États du formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  // État de suppression
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // État des notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Récupérer les utilisateurs
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: search || undefined,
        role: filterRole || undefined,
      };
      
      const response = await ApiClient.get('/users', { params });
      setUsers(response.data.data);
      setTotalUsers(response.data.total);
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || 'Erreur lors du chargement des utilisateurs',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, filterRole]);

  // Récupérer les rôles
  const fetchRoles = async () => {
    try {
      const response = await ApiClient.get('/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error);
    }
  };

  // Effets
  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Afficher une notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fermer la notification
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Ouvrir le dialogue d'ajout
  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: '',
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Ouvrir le dialogue de modification
  const handleOpenEditDialog = (user) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      role: user.role || '',
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Fermer le dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormErrors({});
  };

  // Gérer les changements du formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ modifié
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Le nom est obligatoire';
    }
    
    if (!formData.email.trim()) {
      errors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "L'email n'est pas valide";
    }
    
    if (dialogMode === 'add') {
      if (!formData.password) {
        errors.password = 'Le mot de passe est obligatoire';
      } else if (formData.password.length < 8) {
        errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      }
      
      if (formData.password !== formData.password_confirmation) {
        errors.password_confirmation = 'Les mots de passe ne correspondent pas';
      }
    } else if (formData.password && formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }
    
    if (!formData.role) {
      errors.role = 'Le rôle est obligatoire';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password) {
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }

      if (dialogMode === 'add') {
        await ApiClient.post('/users', payload);
        showSnackbar('Utilisateur créé avec succès');
      } else {
        await ApiClient.put(`/users/${selectedUser.id}`, payload);
        showSnackbar('Utilisateur modifié avec succès');
      }

      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      if (error.response?.status === 422) {
        // Erreurs de validation du serveur
        const serverErrors = error.response.data.errors || {};
        const formattedErrors = {};
        Object.keys(serverErrors).forEach((key) => {
          formattedErrors[key] = serverErrors[key][0];
        });
        setFormErrors(formattedErrors);
      } else {
        showSnackbar(
          error.response?.data?.message || 'Une erreur est survenue',
          'error'
        );
      }
    }
  };

  // Ouvrir le dialogue de suppression
  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialog(true);
  };

  // Confirmer la suppression
  const handleConfirmDelete = async () => {
    try {
      await ApiClient.delete(`/users/${userToDelete.id}`);
      showSnackbar('Utilisateur supprimé avec succès');
      setDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || 'Erreur lors de la suppression',
        'error'
      );
    }
  };

  // Gérer le changement de page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Gérer le changement du nombre de lignes par page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Gérer la recherche avec délai
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* 1. SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* 2. CONTENU PRINCIPAL */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          width: `calc(100% - ${sidebarOpen ? '260px' : '80px'})`,
          transition: 'width 0.3s ease',
          overflowX: 'hidden'
        }}
      >
        {/* 3. TOPBAR */}
        <TopBar sidebarOpen={sidebarOpen} />

        {/* 4. ZONE DE TRAVAIL */}
        <Box sx={{ 
          flex: 1,
          px: { xs: 2, md: 4 }, 
          py: 4,
          backgroundColor: '#F8FAFC',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {/* En-tête */}
          <Card sx={{ 
            mb: 2, 
            boxShadow: 'none', 
            backgroundColor: 'transparent',
            border: 'none',
            flexShrink: 0
          }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
              }}>
                <Typography variant="h6" component="h1" sx={{ 
                  fontWeight: 600, 
                  color: '#1e293b',
                  fontSize: '1.125rem'
                }}>
                  Gestion des Utilisateurs
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<PersonAddIcon fontSize="small" />}
                  onClick={handleOpenAddDialog}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: 'none',
                    borderRadius: '8px',
                    px: 2,
                    py: 0.8,
                    '&:hover': {
                      boxShadow: 'none'
                    }
                  }}
                >
                  Nouvel Utilisateur
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Filtres */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Rechercher par nom ou email..."
                    value={search}
                    onChange={handleSearchChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filtrer par rôle</InputLabel>
                    <Select
                      value={filterRole}
                      label="Filtrer par rôle"
                      onChange={(e) => {
                        setFilterRole(e.target.value);
                        setPage(0);
                      }}
                      sx={{
                        borderRadius: '8px',
                      }}
                    >
                      <MenuItem value="">Tous les rôles</MenuItem>
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.name}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchUsers}
                    sx={{
                      borderRadius: '8px',
                      py: 0.8
                    }}
                  >
                    Actualiser
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tableau des utilisateurs */}
          <Paper elevation={0} sx={{ 
            overflow: 'hidden',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.08)'
          }}>
            <TableContainer sx={{ flex: 1 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      color: '#64748b', 
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      py: 1.5,
                      px: 2,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      border: 'none',
                      backgroundColor: '#f8fafc'
                    }}>ID</TableCell>
                    <TableCell sx={{ 
                      color: '#64748b', 
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      py: 1.5,
                      px: 2,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      border: 'none',
                      backgroundColor: '#f8fafc'
                    }}>Nom</TableCell>
                    <TableCell sx={{ 
                      color: '#64748b', 
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      py: 1.5,
                      px: 2,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      border: 'none',
                      backgroundColor: '#f8fafc'
                    }}>Email</TableCell>
                    <TableCell sx={{ 
                      color: '#64748b', 
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      py: 1.5,
                      px: 2,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      border: 'none',
                      backgroundColor: '#f8fafc'
                    }}>Rôle</TableCell>
                    <TableCell sx={{ 
                      color: '#64748b', 
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      py: 1.5,
                      px: 2,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      border: 'none',
                      backgroundColor: '#f8fafc'
                    }}>Date de création</TableCell>
                    <TableCell sx={{ 
                      color: '#64748b', 
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      py: 1.5,
                      px: 2,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      border: 'none',
                      backgroundColor: '#f8fafc'
                    }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <CircularProgress size={32} />
                        <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
                          Chargement des utilisateurs...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Box sx={{ color: '#94a3b8' }}>
                          <SearchIcon sx={{ fontSize: 48, mb: 2 }} />
                          <Typography variant="body1" color="textSecondary">
                            Aucun utilisateur trouvé
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, color: '#94a3b8' }}>
                            Essayez de modifier vos critères de recherche
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow 
                        hover 
                        key={user.id}
                        sx={{ 
                          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                          '& td': { 
                            py: 1.5,
                            px: 2,
                            color: '#334155',
                            fontSize: '0.875rem',
                            border: 'none',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                          },
                          '&:last-child td': { borderBottom: 'none' }
                        }}
                      >
                        <TableCell>{user.id}</TableCell>
                        <TableCell sx={{ fontWeight: 500, color: '#0f172a' }}>{user.name}</TableCell>
                        <TableCell sx={{ color: '#475569' }}>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role || 'Aucun rôle'}
                            size="small"
                            sx={{
                              bgcolor: roleColors[user.role] ? `${roleColors[user.role]}.50` : 'grey.100',
                              color: roleColors[user.role] ? `${roleColors[user.role]}.700` : 'grey.700',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                              height: 24,
                              borderRadius: '4px'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Modifier">
                              <IconButton
                                onClick={() => handleOpenEditDialog(user)}
                                size="small"
                                sx={{
                                  color: '#3b82f6',
                                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                  '&:hover': { 
                                    backgroundColor: 'rgba(59, 130, 246, 0.12)'
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                onClick={() => handleOpenDeleteDialog(user)}
                                size="small"
                                sx={{
                                  color: '#ef4444',
                                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                  '&:hover': { 
                                    backgroundColor: 'rgba(239, 68, 68, 0.12)'
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
            </TableContainer>
            
            {/* Pagination */}
            <TablePagination
              component="div"
              count={totalUsers}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
              }
              sx={{
                borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: '0.875rem',
                  color: '#64748b'
                }
              }}
            />
          </Paper>
        </Box>

        {/* Dialogue Ajout/Modification */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: '12px' }
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 600,
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            pb: 2
          }}>
            {dialogMode === 'add' ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur'}
          </DialogTitle>
          <DialogContent dividers sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nom complet"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                error={Boolean(formErrors.name)}
                helperText={formErrors.name}
                fullWidth
                required
                size="small"
              />
              
              <TextField
                label="Adresse email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                error={Boolean(formErrors.email)}
                helperText={formErrors.email}
                fullWidth
                required
                size="small"
              />
              
              <TextField
                label={dialogMode === 'add' ? 'Mot de passe' : 'Nouveau mot de passe (laisser vide pour ne pas changer)'}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleFormChange}
                error={Boolean(formErrors.password)}
                helperText={formErrors.password}
                fullWidth
                required={dialogMode === 'add'}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                label="Confirmer le mot de passe"
                name="password_confirmation"
                type={showPassword ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={handleFormChange}
                error={Boolean(formErrors.password_confirmation)}
                helperText={formErrors.password_confirmation}
                fullWidth
                required={dialogMode === 'add' || formData.password}
                size="small"
              />
              
              <FormControl fullWidth error={Boolean(formErrors.role)} required size="small">
                <InputLabel>Rôle</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label="Rôle"
                  onChange={handleFormChange}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.name}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.role && <FormHelperText>{formErrors.role}</FormHelperText>}
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Annuler
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ borderRadius: '8px' }}>
              {dialogMode === 'add' ? 'Créer' : 'Enregistrer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialogue de suppression */}
        <Dialog 
          open={deleteDialog} 
          onClose={() => setDeleteDialog(false)}
          PaperProps={{
            sx: { borderRadius: '12px' }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2, borderRadius: '8px' }}>
              Cette action est irréversible !
            </Alert>
            <Typography>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <strong>{userToDelete?.name}</strong> ({userToDelete?.email}) ?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setDeleteDialog(false)} color="inherit">
              Annuler
            </Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ borderRadius: '8px' }}>
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar pour les notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ 
              width: '100%',
              borderRadius: '8px'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default UserManagement;