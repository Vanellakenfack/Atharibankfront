import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  CircularProgress,
  Menu,
  MenuItem,
  Divider,
  Card,
  CardContent
} from "@mui/material";
import {
  Description,
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  CheckCircle,
  Cancel,
  Search,
  ArrowBack,
  ContentCopy,
  ToggleOn,
  ToggleOff,
  Close
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";

export default function ModelesPage() {
  const navigate = useNavigate();
  const [modeles, setModeles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, modele: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedModele, setSelectedModele] = useState(null);

  useEffect(() => {
    fetchModeles();
  }, []);

  const fetchModeles = async () => {
    setLoading(true);
    try {
      // Route corrigée : /api/operation-diverses/modeles
      const response = await ApiClient.get('/operation-diverses/modeles');
      console.log('Réponse API modèles:', response.data);
      
      if (response.data.success) {
        // Vérifiez la structure de la réponse
        const data = response.data.data;
        if (Array.isArray(data)) {
          setModeles(data);
        } else if (data && data.data) {
          setModeles(data.data); // Pour la pagination
        } else {
          setModeles([]);
        }
      } else {
        showSnackbar(response.data.message || 'Erreur lors du chargement', 'error');
      }
    } catch (error) {
      console.error('Erreur API modèles:', error);
      showSnackbar(
        error.response?.data?.message || 
        'Erreur lors du chargement des modèles', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleMenuOpen = (event, modele) => {
    setAnchorEl(event.currentTarget);
    setSelectedModele(modele);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedModele(null);
  };

  const handleToggleActif = async (modele) => {
    try {
      // Note: Vous devez ajouter cette route dans votre backend
      // Route: PUT /api/operation-diverses/modeles/{modele}/toggle
      const response = await ApiClient.put(`/operation-diverses/modeles/${modele.id}/toggle`);
      
      if (response.data.success) {
        showSnackbar(`Modèle ${response.data.data.est_actif ? 'activé' : 'désactivé'}`, 'success');
        fetchModeles();
      } else {
        showSnackbar(response.data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur toggle:', error);
      showSnackbar(
        error.response?.data?.message || 
        'Erreur lors de la modification', 
        'error'
      );
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!deleteDialog.modele) return;

    try {
      // Route: DELETE /api/operation-diverses/modeles/{modele}
      const response = await ApiClient.delete(`/operation-diverses/modeles/${deleteDialog.modele.id}`);
      
      if (response.data.success) {
        showSnackbar('Modèle supprimé avec succès', 'success');
        fetchModeles();
      } else {
        showSnackbar(response.data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      showSnackbar(
        error.response?.data?.message || 
        'Erreur lors de la suppression', 
        'error'
      );
    } finally {
      setDeleteDialog({ open: false, modele: null });
    }
  };

  const handleDuplicate = async (modele) => {
    try {
      // Créer une copie du modèle
      const newModele = {
        code: `${modele.code}_COPY_${Date.now()}`,
        nom: `${modele.nom} (Copie)`,
        description: modele.description,
        type_operation: modele.type_operation,
        code_operation: modele.code_operation,
        lignes: modele.lignes?.map(ligne => ({
          compte_id: ligne.compte_id,
          sens: ligne.sens,
          libelle: ligne.libelle,
          montant_fixe: ligne.montant_fixe,
          taux: ligne.taux,
          ordre: ligne.ordre
        })) || []
      };

      // Route: POST /api/operation-diverses/modeles
      const response = await ApiClient.post('/operation-diverses/modeles', newModele);
      
      if (response.data.success) {
        showSnackbar('Modèle dupliqué avec succès', 'success');
        fetchModeles();
      } else {
        showSnackbar(response.data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur duplication:', error);
      showSnackbar(
        error.response?.data?.message || 
        'Erreur lors de la duplication', 
        'error'
      );
    }
    handleMenuClose();
  };

  const handleViewDetails = (modele) => {
    navigate(`/operations-diverses/modele/${modele.id}`);
    handleMenuClose();
  };

  const handleEdit = (modele) => {
    navigate(`/operations-diverses/modele/${modele.id}/modifier`);
    handleMenuClose();
  };

  const filteredModeles = modeles.filter(modele =>
    modele.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    modele.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    modele.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeOperationLabel = (type) => {
    const types = {
      'VIREMENT': 'Virement',
      'FRAIS': 'Frais',
      'COMMISSION': 'Commission',
      'REGULARISATION': 'Régularisation',
      'AUTRE': 'Autre'
    };
    return types[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'VIREMENT': 'primary',
      'FRAIS': 'warning',
      'COMMISSION': 'info',
      'REGULARISATION': 'secondary',
      'AUTRE': 'default'
    };
    return colors[type] || 'default';
  };

  return (
    <Layout>
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          {/* En-tête */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Button startIcon={<ArrowBack />} onClick={() => navigate('/ChoicePageOd')} sx={{ mb: 2 }}>
                Retour
              </Button>
              <Typography variant="h4" fontWeight="700" sx={{ display: 'flex', alignItems: 'center' }}>
                <Description sx={{ mr: 2, color: '#9c27b0' }} />
                Gestion des Modèles d'OD
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Créez et gérez des modèles prédéfinis pour les opérations diverses récurrentes
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/Nouveau-Model')}
              sx={{ height: 'fit-content' }}
            >
              Nouveau modèle
            </Button>
          </Box>

          {/* Barre de recherche et statistiques */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid #e0e0e0' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Rechercher un modèle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Card sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="h6">{modeles.length}</Typography>
                      <Typography variant="caption">Total</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card sx={{ textAlign: 'center', p: 1, bgcolor: '#e8f5e9' }}>
                      <Typography variant="h6" color="#4caf50">
                        {modeles.filter(m => m.est_actif).length}
                      </Typography>
                      <Typography variant="caption">Actifs</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card sx={{ textAlign: 'center', p: 1, bgcolor: '#fff3e0' }}>
                      <Typography variant="h6" color="#ff9800">
                        {modeles.filter(m => m.type_operation === 'FRAIS').length}
                      </Typography>
                      <Typography variant="caption">Frais</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card sx={{ textAlign: 'center', p: 1, bgcolor: '#e3f2fd' }}>
                      <Typography variant="h6" color="#2196f3">
                        {modeles.filter(m => m.type_operation === 'VIREMENT').length}
                      </Typography>
                      <Typography variant="caption">Virements</Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* Liste des modèles */}
          <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredModeles.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Description sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun modèle trouvé'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {searchTerm ? 'Essayez avec d\'autres termes' : 'Commencez par créer votre premier modèle'}
                </Typography>
                {!searchTerm && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/Nouveau-Model')}
                  >
                    Créer un modèle
                  </Button>
                )}
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell><strong>Code</strong></TableCell>
                      <TableCell><strong>Nom</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Lignes</strong></TableCell>
                      <TableCell><strong>Statut</strong></TableCell>
                      <TableCell><strong>Créé le</strong></TableCell>
                      <TableCell align="right"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredModeles.map((modele) => (
                      <TableRow key={modele.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {modele.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{modele.nom}</Typography>
                          {modele.description && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {modele.description.length > 50 
                                ? `${modele.description.substring(0, 50)}...` 
                                : modele.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getTypeOperationLabel(modele.type_operation)}
                            color={getTypeColor(modele.type_operation)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {modele.lignes?.length || 0} ligne(s)
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={modele.est_actif ? <CheckCircle /> : <Cancel />}
                            label={modele.est_actif ? 'Actif' : 'Inactif'}
                            color={modele.est_actif ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {modele.created_at ? new Date(modele.created_at).toLocaleDateString('fr-FR') : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleMenuOpen(e, modele)}
                            aria-label="actions"
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Information */}
          <Alert severity="info" sx={{ mt: 4, borderRadius: 4 }}>
            <Typography variant="body2">
              <strong>Astuce :</strong> Les modèles permettent de gagner du temps pour les opérations diverses récurrentes.
              Une fois créé, vous pouvez utiliser un modèle pour saisir rapidement une OD.
            </Typography>
          </Alert>
        </Container>
      </Box>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 200 } }}
      >
        <MenuItem onClick={() => handleViewDetails(selectedModele)}>
          <Visibility sx={{ mr: 2, fontSize: 20 }} /> Détails
        </MenuItem>
        
        <MenuItem onClick={() => handleEdit(selectedModele)}>
          <Edit sx={{ mr: 2, fontSize: 20 }} /> Modifier
        </MenuItem>
        
        <MenuItem onClick={() => handleDuplicate(selectedModele)}>
          <ContentCopy sx={{ mr: 2, fontSize: 20 }} /> Dupliquer
        </MenuItem>
        
        <MenuItem onClick={() => handleToggleActif(selectedModele)}>
          {selectedModele?.est_actif ? (
            <>
              <ToggleOff sx={{ mr: 2, fontSize: 20 }} /> Désactiver
            </>
          ) : (
            <>
              <ToggleOn sx={{ mr: 2, fontSize: 20 }} /> Activer
            </>
          )}
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => {
            setDeleteDialog({ open: true, modele: selectedModele });
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 2, fontSize: 20 }} /> Supprimer
        </MenuItem>
      </Menu>

      {/* Dialog de suppression */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, modele: null })}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le modèle <strong>"{deleteDialog.modele?.nom}"</strong> ?
          </Typography>
          {deleteDialog.modele?.lignes?.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Ce modèle contient {deleteDialog.modele.lignes.length} ligne(s) qui seront également supprimées.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, modele: null })}>
            Annuler
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        action={
          <Button color="inherit" size="small" onClick={handleCloseSnackbar}>
            <Close />
          </Button>
        }
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: snackbar.severity === 'success' ? '#4caf50' : 
                           snackbar.severity === 'error' ? '#f44336' : '#2196f3'
          }
        }}
      />
    </Layout>
  );
}