import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  InputAdornment,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteFileIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { indigo, blueGrey, cyan, red, green, orange } from '@mui/material/colors';
import Layout from '../../components/layout/Layout';
import { gestionnaireService, type Gestionnaire, type UpdateGestionnaireData } from '../../services/gestionnaireService/gestionnaireApi';
import agenceService from '../../services/agenceService';

// Composant Alert personnalisé pour Snackbar
const CustomAlert = ({ 
  onClose, 
  severity, 
  children, 
  ...props 
}: { 
  onClose?: () => void;
  severity: 'success' | 'error' | 'info' | 'warning';
  children: React.ReactNode;
}) => {
  return (
    <Alert 
      onClose={onClose} 
      severity={severity} 
      elevation={6} 
      variant="filled" 
      {...props}
      sx={{ width: '100%' }}
    >
      {children}
    </Alert>
  );
};

export default function ListGestionnaire() {
  const navigate = useNavigate();
  const [gestionnaires, setGestionnaires] = useState<Gestionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null; name: string }>({
    open: false,
    id: null,
    name: '',
  });
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; gestionnaire: Gestionnaire | null }>({
    open: false,
    gestionnaire: null,
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; gestionnaire: Gestionnaire | null }>({
    open: false,
    gestionnaire: null,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // États pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  
  const [agences, setAgences] = useState<any[]>([]);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdateGestionnaireData>({});
  const [editFiles, setEditFiles] = useState<{
    cni_recto: File | null;
    cni_verso: File | null;
    plan_localisation_domicile: File | null;
    signature: File | null;
  }>({
    cni_recto: null,
    cni_verso: null,
    plan_localisation_domicile: null,
    signature: null,
  });
  const [editPreviews, setEditPreviews] = useState<{
    cni_recto: string | null;
    cni_verso: string | null;
    plan_localisation_domicile: string | null;
    signature: string | null;
  }>({
    cni_recto: null,
    cni_verso: null,
    plan_localisation_domicile: null,
    signature: null,
  });

  // Charger les gestionnaires
  useEffect(() => {
    fetchGestionnaires();
  }, [page, rowsPerPage, search]);

  // Charger les agences une seule fois
  useEffect(() => {
    fetchAgences();
  }, []);

  const fetchAgences = async () => {
    try {
      setLoadingAgences(true);
      const response = await agenceService.getAgences();
      setAgences(response);
    } catch (err: any) {
      console.error('Erreur lors du chargement des agences:', err);
      showSnackbar(`Erreur lors du chargement des agences: ${err.message || 'Vérifiez votre connexion internet'}`, 'error');
    } finally {
      setLoadingAgences(false);
    }
  };

  const fetchGestionnaires = async () => {
    try {
      setLoading(true);
      const response = await gestionnaireService.getAllGestionnaires(
        page + 1,
        rowsPerPage,
        search
      );
      
      if (response.success) {
        setGestionnaires(response.data);
        setTotal(response.pagination.total);
      } else {
        showSnackbar('Erreur lors du chargement des gestionnaires', 'error');
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      showSnackbar('Impossible de charger les gestionnaires. Vérifiez votre connexion internet.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const handleViewDetails = async () => {
    if (selectedId) {
      try {
        const response = await gestionnaireService.getGestionnaireById(selectedId);
        if (response.success) {
          setDetailDialog({
            open: true,
            gestionnaire: response.data,
          });
          showSnackbar('Détails du gestionnaire chargés avec succès', 'success');
        }
      } catch (err: any) {
        console.error('Erreur:', err);
        showSnackbar('Impossible de charger les détails du gestionnaire', 'error');
      }
    }
    handleMenuClose();
  };

  const openEditModal = (gestionnaire: Gestionnaire) => {
    setEditDialog({
      open: true,
      gestionnaire: gestionnaire,
    });
    
    // Initialiser le formulaire avec les données du gestionnaire
    setEditFormData({
      gestionnaire_code: gestionnaire.gestionnaire_code,
      gestionnaire_nom: gestionnaire.gestionnaire_nom,
      gestionnaire_prenom: gestionnaire.gestionnaire_prenom,
      telephone: gestionnaire.telephone || '',
      email: gestionnaire.email || '',
      ville: gestionnaire.ville || '',
      quartier: gestionnaire.quartier || '',
      agence_id: gestionnaire.agence_id,
    });
    
    // Initialiser les prévisualisations des images existantes
    setEditPreviews({
      cni_recto: gestionnaire.cni_recto_url || null,
      cni_verso: gestionnaire.cni_verso_url || null,
      plan_localisation_domicile: gestionnaire.plan_localisation_domicile_url || null,
      signature: gestionnaire.signature_url || null,
    });
    
    // Réinitialiser les fichiers
    setEditFiles({
      cni_recto: null,
      cni_verso: null,
      plan_localisation_domicile: null,
      signature: null,
    });
  };

  const handleEditClick = () => {
    if (selectedId) {
      const gestionnaire = gestionnaires.find(g => g.id === selectedId);
      if (gestionnaire) {
        openEditModal(gestionnaire);
      }
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    const gestionnaire = gestionnaires.find(g => g.id === selectedId);
    if (gestionnaire) {
      setDeleteDialog({
        open: true,
        id: selectedId,
        name: `${gestionnaire.gestionnaire_nom} ${gestionnaire.gestionnaire_prenom}`,
      });
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.id) {
      try {
        const response = await gestionnaireService.deleteGestionnaire(deleteDialog.id);
        if (response.success) {
          showSnackbar('✅ Gestionnaire supprimé avec succès !', 'success');
          fetchGestionnaires();
          setDeleteDialog({ open: false, id: null, name: '' });
        } else {
          showSnackbar(`❌ Erreur : ${response.message || 'Erreur lors de la suppression'}`, 'error');
        }
      } catch (err: any) {
        console.error('Erreur:', err);
        showSnackbar('❌ Impossible de supprimer le gestionnaire', 'error');
      }
    }
  };

  const handleCloseDetailDialog = () => {
    setDetailDialog({ open: false, gestionnaire: null });
  };

  const handleCloseEditDialog = () => {
    setEditDialog({ open: false, gestionnaire: null });
    setEditFormData({});
    setEditFiles({
      cni_recto: null,
      cni_verso: null,
      plan_localisation_domicile: null,
      signature: null,
    });
    setEditPreviews({
      cni_recto: null,
      cni_verso: null,
      plan_localisation_domicile: null,
      signature: null,
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSelectChange = (e: any) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditFileChange = (field: keyof typeof editFiles, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        const fileNames = {
          cni_recto: 'CNI Recto',
          cni_verso: 'CNI Verso',
          plan_localisation_domicile: 'Plan de localisation',
          signature: 'Signature'
        };
        
        showSnackbar(`Le fichier ${fileNames[field]} ne doit pas dépasser 2MB.`, 'error');
        return;
      }
      
      // Vérifier le type (images seulement)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        showSnackbar(`Le fichier doit être une image (JPG, PNG, GIF). Type détecté: ${file.type}`, 'error');
        return;
      }
      
      setEditFiles(prev => ({ ...prev, [field]: file }));
      setEditPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
      
      const fileNames = {
        cni_recto: 'CNI Recto',
        cni_verso: 'CNI Verso',
        plan_localisation_domicile: 'Plan de localisation',
        signature: 'Signature'
      };
      
      showSnackbar(`Fichier ${fileNames[field]} téléchargé avec succès.`, 'success');
    }
  };

  const removeEditFile = (field: keyof typeof editFiles) => {
    setEditFiles(prev => ({ ...prev, [field]: null }));
    setEditPreviews(prev => {
      // Si on supprime un fichier téléchargé, supprimer l'URL d'objet
      if (prev[field] && prev[field]?.startsWith('blob:')) {
        URL.revokeObjectURL(prev[field]!);
      }
      return { ...prev, [field]: null };
    });
    
    // CORRECTION : Ne pas mettre à jour editFormData car on veut
    // envoyer explicitement null au backend pour supprimer l'image
    // La logique de suppression est gérée dans le service
    
    const fileNames = {
      cni_recto: 'CNI Recto',
      cni_verso: 'CNI Verso',
      plan_localisation_domicile: 'Plan de localisation',
      signature: 'Signature'
    };
    
    showSnackbar(`Fichier ${fileNames[field]} marqué pour suppression.`, 'info');
  };

  const validateEditForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validation des champs obligatoires
    if (!editFormData.gestionnaire_code?.trim()) {
      errors.push('Le code gestionnaire est obligatoire');
    }
    if (!editFormData.gestionnaire_nom?.trim()) {
      errors.push('Le nom est obligatoire');
    }
    if (!editFormData.gestionnaire_prenom?.trim()) {
      errors.push('Le prénom est obligatoire');
    }
    if (!editFormData.agence_id) {
      errors.push('La sélection d\'une agence est obligatoire');
    }

    // Validation format email
    if (editFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.push('L\'adresse email n\'est pas valide');
    }

    // Validation format téléphone
    if (editFormData.telephone && !/^[\d\s\-\+\(\)]{8,20}$/.test(editFormData.telephone)) {
      errors.push('Le numéro de téléphone n\'est pas valide (8 à 20 chiffres)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDialog.gestionnaire) return;
    
    // Validation du formulaire
    const validation = validateEditForm();
    if (!validation.isValid) {
      // Afficher la première erreur
      if (validation.errors.length > 0) {
        showSnackbar(validation.errors[0], 'error');
      }
      return;
    }

    setLoadingEdit(true);

    try {
      // Préparer les données pour l'update
      const updateData: UpdateGestionnaireData = { ...editFormData };
      
      // CORRECTION : Gérer les fichiers correctement
      // Pour chaque fichier, si editFiles[field] est null mais qu'il y avait une preview,
      // on envoie null pour supprimer. Si editFiles[field] est un File, on l'envoie.
      
      if (editFiles.cni_recto !== undefined) {
        updateData.cni_recto = editFiles.cni_recto;
      }
      
      if (editFiles.cni_verso !== undefined) {
        updateData.cni_verso = editFiles.cni_verso;
      }
      
      if (editFiles.plan_localisation_domicile !== undefined) {
        updateData.plan_localisation_domicile = editFiles.plan_localisation_domicile;
      }
      
      // CORRECTION CRITIQUE pour la signature
      if (editFiles.signature === null && editPreviews.signature) {
        // Si on a cliqué sur "supprimer" et qu'il y avait une signature, envoyer null
        updateData.signature = null;
      } else if (editFiles.signature instanceof File) {
        // Si un nouveau fichier a été téléchargé
        updateData.signature = editFiles.signature;
      }
      // Note: Si signature n'est pas défini, on ne l'envoie pas (garder l'existant)

      const result = await gestionnaireService.updateGestionnaire(
        editDialog.gestionnaire.id,
        updateData
      );

      if (result.success) {
        showSnackbar(`✅ Gestionnaire "${result.data.gestionnaire_code}" modifié avec succès !`, 'success');
        fetchGestionnaires();
        handleCloseEditDialog();
      } else {
        showSnackbar(`❌ Erreur : ${result.message || 'Impossible de modifier le gestionnaire'}`, 'error');
      }
    } catch (err: any) {
      console.error('Erreur lors de la modification:', err);
      
      let errorMessage = 'Une erreur est survenue lors de la modification du gestionnaire.';
      
      if (err.response) {
        const { status, data } = err.response;
        
        switch (status) {
          case 400:
            errorMessage = 'Données invalides. Vérifiez les informations saisies.';
            if (data?.errors) {
              const validationErrors = Object.values(data.errors).flat().join(', ');
              errorMessage = `Erreur de validation : ${validationErrors}`;
            }
            break;
          case 401:
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            break;
          case 403:
            errorMessage = 'Vous n\'avez pas la permission de modifier ce gestionnaire.';
            break;
          case 404:
            errorMessage = 'Gestionnaire ou agence non trouvé(e).';
            break;
          case 409:
            errorMessage = 'Un gestionnaire avec ce code existe déjà.';
            break;
          case 413:
            errorMessage = 'Les fichiers sont trop volumineux. Taille maximale : 2MB par fichier.';
            break;
          case 422:
            errorMessage = 'Données de formulaire invalides. Veuillez vérifier tous les champs.';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez contacter l\'administrateur.';
            break;
          default:
            errorMessage = `Erreur ${status}: ${data?.message || 'Erreur serveur'}`;
        }
      } else if (err.request) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      }
      
      showSnackbar(`❌ ${errorMessage}`, 'error');
    } finally {
      setLoadingEdit(false);
    }
  };

  const getEtatColor = (etat: string) => {
    switch (etat) {
      case 'present':
        return green[500];
      case 'supprime':
        return red[500];
      default:
        return orange[500];
    }
  };

  const getEtatLabel = (etat: string) => {
    switch (etat) {
      case 'present':
        return 'Actif';
      case 'supprime':
        return 'Supprimé';
      default:
        return 'Inconnu';
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Action pour fermer le Snackbar
  const snackbarAction = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseSnackbar}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <Layout>
      <Box sx={{ minHeight: '100vh', bgcolor: blueGrey[50], py: 4 }}>
        <Container maxWidth="xl">
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: indigo[900] }}>
                Liste des Gestionnaires
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/AddGestionnaire')}
                sx={{
                  background: `linear-gradient(135deg, ${indigo[600]} 0%, ${cyan[700]} 100%)`,
                  color: 'white',
                }}
              >
                Ajouter un Gestionnaire
              </Button>
            </Box>

            {/* Recherche et statistiques */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Rechercher par nom, prénom, code..."
                  value={search}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth:230 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total des gestionnaires actifs :
                      </Typography>
                      <Badge
                        badgeContent={gestionnaires.filter(g => g.etat === 'present').length}
                        color="primary"
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: indigo[500],
                            fontSize: '1rem',
                            padding: '0 8px',
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: indigo[50] }}>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Nom & Prénom</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Localisation</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Agence</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: indigo[700] }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                        <CircularProgress />
                        <Typography sx={{ mt: 2 }}>Chargement des gestionnaires...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : gestionnaires.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                        <Typography color="text.secondary">
                          {search ? 'Aucun gestionnaire ne correspond à votre recherche' : 'Aucun gestionnaire trouvé'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    gestionnaires.map((gestionnaire) => (
                      <TableRow 
                        key={gestionnaire.id}
                        hover
                        sx={{ 
                          '&:hover': { backgroundColor: blueGrey[50] },
                          opacity: gestionnaire.etat === 'supprime' ? 0.6 : 1,
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight="medium" color="primary">
                            {gestionnaire.gestionnaire_code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: indigo[100], color: indigo[700] }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography fontWeight="medium">
                                {gestionnaire.gestionnaire_nom} {gestionnaire.gestionnaire_prenom}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {gestionnaire.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {gestionnaire.telephone && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <PhoneIcon fontSize="small" color="action" />
                                <Typography variant="body2">{gestionnaire.telephone}</Typography>
                              </Box>
                            )}
                            {gestionnaire.email && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {gestionnaire.email}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {gestionnaire.ville && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {gestionnaire.ville}
                                {gestionnaire.quartier && `, ${gestionnaire.quartier}`}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          {gestionnaire.agence && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <BusinessIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {gestionnaire.agence.code}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getEtatLabel(gestionnaire.etat)}
                            size="small"
                            sx={{
                              backgroundColor: getEtatColor(gestionnaire.etat),
                              color: 'white',
                              fontWeight: 'medium',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Voir les détails">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDetailDialog({ open: true, gestionnaire });
                                  showSnackbar('Chargement des détails...', 'info');
                                }}
                                color="primary"
                                disabled={gestionnaire.etat === 'supprime'}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier">
                              <IconButton
                                size="small"
                                onClick={() => openEditModal(gestionnaire)}
                                color="warning"
                                disabled={gestionnaire.etat === 'supprime'}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Options">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, gestionnaire.id)}
                              >
                                <MoreVertIcon />
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
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page :"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />

            {/* Menu contextuel */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleViewDetails}>
                <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                Voir les détails
              </MenuItem>
              <MenuItem onClick={handleEditClick}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Modifier
              </MenuItem>
              <MenuItem onClick={handleDeleteClick}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Supprimer
              </MenuItem>
            </Menu>

            {/* Dialog de confirmation de suppression */}
            <Dialog
              open={deleteDialog.open}
              onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}
            >
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Êtes-vous sûr de vouloir supprimer le gestionnaire <strong>{deleteDialog.name}</strong> ?
                  <br />
                  Cette action est irréversible. L'état sera changé à "supprimé".
                </Alert>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}>
                  Annuler
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                >
                  Confirmer la suppression
                </Button>
              </DialogActions>
            </Dialog>

            {/* Dialog de détails */}
            <Dialog
              open={detailDialog.open}
              onClose={handleCloseDetailDialog}
              maxWidth="md"
              fullWidth
            >
              {detailDialog.gestionnaire && (
                <>
                  <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: indigo[100], color: indigo[700] }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {detailDialog.gestionnaire.gestionnaire_nom} {detailDialog.gestionnaire.gestionnaire_prenom}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Code: {detailDialog.gestionnaire.gestionnaire_code}
                        </Typography>
                      </Box>
                    </Box>
                  </DialogTitle>
                  <DialogContent dividers>
                    <Grid container spacing={3}>
                      {/* Informations de base */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                          Informations de base
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Code
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {detailDialog.gestionnaire.gestionnaire_code}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Statut
                        </Typography>
                        <Chip
                          label={getEtatLabel(detailDialog.gestionnaire.etat)}
                          size="small"
                          sx={{
                            backgroundColor: getEtatColor(detailDialog.gestionnaire.etat),
                            color: 'white',
                          }}
                        />
                      </Grid>

                      {/* Contact */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2, mt: 2 }}>
                          Contact
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Téléphone
                        </Typography>
                        <Typography variant="body1">
                          {detailDialog.gestionnaire.telephone || 'Non renseigné'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {detailDialog.gestionnaire.email || 'Non renseigné'}
                        </Typography>
                      </Grid>

                      {/* Localisation */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2, mt: 2 }}>
                          Localisation
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Ville
                        </Typography>
                        <Typography variant="body1">
                          {detailDialog.gestionnaire.ville || 'Non renseignée'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Quartier
                        </Typography>
                        <Typography variant="body1">
                          {detailDialog.gestionnaire.quartier || 'Non renseigné'}
                        </Typography>
                      </Grid>

                      {/* Agence */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2, mt: 2 }}>
                          Agence
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        {detailDialog.gestionnaire.agence ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: blueGrey[50], borderRadius: 2 }}>
                            <BusinessIcon color="primary" />
                            <Box>
                              <Typography fontWeight="medium">
                                {detailDialog.gestionnaire.agence.code} - {detailDialog.gestionnaire.agence.name || detailDialog.gestionnaire.agence.agency_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {detailDialog.gestionnaire.agence.id}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Typography color="text.secondary">Aucune agence assignée</Typography>
                        )}
                      </Grid>

                      {/* Documents */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2, mt: 2 }}>
                          Documents
                        </Typography>
                      </Grid>
                      
                      {/* CNI Recto */}
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              CNI Recto
                            </Typography>
                            {detailDialog.gestionnaire.cni_recto_url ? (
                              <img
                                src={detailDialog.gestionnaire.cni_recto_url}
                                alt="CNI Recto"
                                style={{
                                  width: '100%',
                                  maxHeight: '150px',
                                  objectFit: 'contain',
                                  borderRadius: '4px',
                                }}
                              />
                            ) : (
                              <Box sx={{ py: 3 }}>
                                <ImageIcon sx={{ fontSize: 40, color: blueGrey[300] }} />
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Non disponible
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* CNI Verso */}
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              CNI Verso
                            </Typography>
                            {detailDialog.gestionnaire.cni_verso_url ? (
                              <img
                                src={detailDialog.gestionnaire.cni_verso_url}
                                alt="CNI Verso"
                                style={{
                                  width: '100%',
                                  maxHeight: '150px',
                                  objectFit: 'contain',
                                  borderRadius: '4px',
                                }}
                              />
                            ) : (
                              <Box sx={{ py: 3 }}>
                                <ImageIcon sx={{ fontSize: 40, color: blueGrey[300] }} />
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Non disponible
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Plan de localisation */}
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Plan de localisation
                            </Typography>
                            {detailDialog.gestionnaire.plan_localisation_domicile_url ? (
                              <img
                                src={detailDialog.gestionnaire.plan_localisation_domicile_url}
                                alt="Plan de localisation"
                                style={{
                                  width: '100%',
                                  maxHeight: '150px',
                                  objectFit: 'contain',
                                  borderRadius: '4px',
                                }}
                              />
                            ) : (
                              <Box sx={{ py: 3 }}>
                                <ImageIcon sx={{ fontSize: 40, color: blueGrey[300] }} />
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Non disponible
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Signature */}
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Signature
                            </Typography>
                            {detailDialog.gestionnaire.signature_url ? (
                              <Box sx={{ 
                                bgcolor: '#f5f5f5', 
                                p: 2, 
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                minHeight: '120px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <img
                                  src={detailDialog.gestionnaire.signature_url}
                                  alt="Signature"
                                  style={{
                                    width: '100%',
                                    maxHeight: '150px',
                                    objectFit: 'contain',
                                  }}
                                />
                              </Box>
                            ) : (
                              <Box sx={{ py: 3 }}>
                                <ImageIcon sx={{ fontSize: 40, color: blueGrey[300] }} />
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Non disponible
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseDetailDialog}>Fermer</Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        handleCloseDetailDialog();
                        openEditModal(detailDialog.gestionnaire!);
                      }}
                    >
                      Modifier
                    </Button>
                  </DialogActions>
                </>
              )}
            </Dialog>

            {/* Dialog de modification */}
            <Dialog
              open={editDialog.open}
              onClose={handleCloseEditDialog}
              maxWidth="md"
              fullWidth
            >
              {editDialog.gestionnaire && (
                <>
                  <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: indigo[100], color: indigo[700] }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          Modifier le gestionnaire
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Code: {editDialog.gestionnaire.gestionnaire_code}
                        </Typography>
                      </Box>
                    </Box>
                  </DialogTitle>
                  <DialogContent dividers>
                    <Box sx={{ mb: 3 }}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          Modification
                        </Typography>
                        <Typography variant="body2">
                          Modifiez les informations du gestionnaire. Les fichiers image doivent être au format JPG, PNG ou GIF et ne pas dépasser 2MB.
                          <br />
                          <strong>Note:</strong> Cliquez sur l'icône de suppression pour supprimer un fichier existant.
                        </Typography>
                      </Alert>
                    </Box>
                    
                    <form onSubmit={handleEditSubmit}>
                      <Grid container spacing={3}>
                        {/* Informations de base */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Code Gestionnaire *"
                            name="gestionnaire_code"
                            value={editFormData.gestionnaire_code || ''}
                            onChange={handleEditInputChange}
                            size="small"
                            required
                            helperText="Identifiant unique du gestionnaire"
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small" required>
                            <InputLabel>Agence *</InputLabel>
                            <Select
                              name="agence_id"
                              value={editFormData.agence_id || ''}
                              label="Agence *"
                              onChange={handleEditSelectChange}
                              disabled={loadingAgences}
                            >
                              {loadingAgences ? (
                                <SelectMenuItem value="">
                                  <em>Chargement des agences...</em>
                                </SelectMenuItem>
                              ) : (
                                agences.map((agence) => (
                                  <SelectMenuItem key={agence.id} value={agence.id}>
                                    {agence.code} - {agence.name}
                                  </SelectMenuItem>
                                ))
                              )}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Nom *"
                            name="gestionnaire_nom"
                            value={editFormData.gestionnaire_nom || ''}
                            onChange={handleEditInputChange}
                            size="small"
                            required
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Prénom *"
                            name="gestionnaire_prenom"
                            value={editFormData.gestionnaire_prenom || ''}
                            onChange={handleEditInputChange}
                            size="small"
                            required
                          />
                        </Grid>

                        {/* Contact */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Téléphone"
                            name="telephone"
                            value={editFormData.telephone || ''}
                            onChange={handleEditInputChange}
                            size="small"
                            placeholder="Ex: +243 81 234 5678"
                            helperText="Format : 8 à 20 chiffres"
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={editFormData.email || ''}
                            onChange={handleEditInputChange}
                            size="small"
                            placeholder="exemple@domaine.com"
                            helperText="Adresse email valide"
                          />
                        </Grid>

                        {/* Localisation */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Ville"
                            name="ville"
                            value={editFormData.ville || ''}
                            onChange={handleEditInputChange}
                            size="small"
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Quartier"
                            name="quartier"
                            value={editFormData.quartier || ''}
                            onChange={handleEditInputChange}
                            size="small"
                          />
                        </Grid>

                        {/* Documents */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 2, mt: 2 }}>
                            Documents
                          </Typography>
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            <strong>Instructions:</strong>
                            <br />
                            • Pour garder le fichier existant, ne touchez pas au champ.
                            <br />
                            • Pour changer le fichier, téléchargez un nouveau.
                            <br />
                            • Pour supprimer le fichier existant, cliquez sur l'icône de suppression.
                          </Alert>
                        </Grid>

                        {/* CNI Recto */}
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle2" sx={{ mb: 2, color: indigo[600] }}>
                                CNI Recto
                                {editPreviews.cni_recto && (
                                  <Typography variant="caption" color="success" sx={{ ml: 1 }}>
                                    {editPreviews.cni_recto.startsWith('blob:') ? 'Nouveau fichier' : 'Fichier existant'}
                                  </Typography>
                                )}
                              </Typography>
                              {editPreviews.cni_recto ? (
                                <Box sx={{ position: 'relative' }}>
                                  <img
                                    src={editPreviews.cni_recto}
                                    alt="CNI Recto"
                                    style={{
                                      width: '100%',
                                      height: '150px',
                                      objectFit: 'cover',
                                      borderRadius: '8px',
                                      marginBottom: '10px',
                                      border: editPreviews.cni_recto.startsWith('blob:') ? '2px solid #4caf50' : '1px solid #ddd',
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => removeEditFile('cni_recto')}
                                    sx={{
                                      position: 'absolute',
                                      top: 5,
                                      right: 5,
                                      backgroundColor: 'white',
                                      '&:hover': { backgroundColor: '#f5f5f5' },
                                    }}
                                  >
                                    <DeleteFileIcon />
                                  </IconButton>
                                </Box>
                              ) : null}
                              <Button
                                component="label"
                                variant="outlined"
                                fullWidth
                                startIcon={<CloudUploadIcon />}
                                sx={{ py: 1 }}
                              >
                                {editPreviews.cni_recto ? 'Changer le recto' : 'Télécharger le recto'}
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => handleEditFileChange('cni_recto', e)}
                                />
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* CNI Verso */}
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle2" sx={{ mb: 2, color: indigo[600] }}>
                                CNI Verso
                                {editPreviews.cni_verso && (
                                  <Typography variant="caption" color="success" sx={{ ml: 1 }}>
                                    {editPreviews.cni_verso.startsWith('blob:') ? 'Nouveau fichier' : 'Fichier existant'}
                                  </Typography>
                                )}
                              </Typography>
                              {editPreviews.cni_verso ? (
                                <Box sx={{ position: 'relative' }}>
                                  <img
                                    src={editPreviews.cni_verso}
                                    alt="CNI Verso"
                                    style={{
                                      width: '100%',
                                      height: '150px',
                                      objectFit: 'cover',
                                      borderRadius: '8px',
                                      marginBottom: '10px',
                                      border: editPreviews.cni_verso.startsWith('blob:') ? '2px solid #4caf50' : '1px solid #ddd',
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => removeEditFile('cni_verso')}
                                    sx={{
                                      position: 'absolute',
                                      top: 5,
                                      right: 5,
                                      backgroundColor: 'white',
                                      '&:hover': { backgroundColor: '#f5f5f5' },
                                    }}
                                  >
                                    <DeleteFileIcon />
                                  </IconButton>
                                </Box>
                              ) : null}
                              <Button
                                component="label"
                                variant="outlined"
                                fullWidth
                                startIcon={<CloudUploadIcon />}
                                sx={{ py: 1 }}
                              >
                                {editPreviews.cni_verso ? 'Changer le verso' : 'Télécharger le verso'}
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => handleEditFileChange('cni_verso', e)}
                                />
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* Plan de localisation */}
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle2" sx={{ mb: 2, color: indigo[600] }}>
                                Plan de localisation du domicile
                                {editPreviews.plan_localisation_domicile && (
                                  <Typography variant="caption" color="success" sx={{ ml: 1 }}>
                                    {editPreviews.plan_localisation_domicile.startsWith('blob:') ? 'Nouveau fichier' : 'Fichier existant'}
                                  </Typography>
                                )}
                              </Typography>
                              {editPreviews.plan_localisation_domicile ? (
                                <Box sx={{ position: 'relative' }}>
                                  <img
                                    src={editPreviews.plan_localisation_domicile}
                                    alt="Plan localisation"
                                    style={{
                                      width: '100%',
                                      height: '150px',
                                      objectFit: 'cover',
                                      borderRadius: '8px',
                                      marginBottom: '10px',
                                      border: editPreviews.plan_localisation_domicile.startsWith('blob:') ? '2px solid #4caf50' : '1px solid #ddd',
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => removeEditFile('plan_localisation_domicile')}
                                    sx={{
                                      position: 'absolute',
                                      top: 5,
                                      right: 5,
                                      backgroundColor: 'white',
                                      '&:hover': { backgroundColor: '#f5f5f5' },
                                    }}
                                  >
                                    <DeleteFileIcon />
                                  </IconButton>
                                </Box>
                              ) : null}
                              <Button
                                component="label"
                                variant="outlined"
                                fullWidth
                                startIcon={<CloudUploadIcon />}
                                sx={{ py: 1 }}
                              >
                                {editPreviews.plan_localisation_domicile ? 'Changer le plan' : 'Télécharger le plan'}
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => handleEditFileChange('plan_localisation_domicile', e)}
                                />
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* Signature - Section corrigée */}
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle2" sx={{ mb: 2, color: indigo[600] }}>
                                Signature
                                {editPreviews.signature && (
                                  <Typography variant="caption" color="success" sx={{ ml: 1 }}>
                                    {editPreviews.signature.startsWith('blob:') ? 'Nouveau fichier' : 'Fichier existant'}
                                  </Typography>
                                )}
                              </Typography>
                              {editPreviews.signature ? (
                                <Box sx={{ position: 'relative' }}>
                                  <Box sx={{ 
                                    bgcolor: '#f5f5f5', 
                                    p: 2, 
                                    borderRadius: '8px',
                                    border: editPreviews.signature.startsWith('blob:') ? '2px solid #4caf50' : '1px solid #ddd',
                                    minHeight: '150px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    <img
                                      src={editPreviews.signature}
                                      alt="Signature"
                                      style={{
                                        width: '100%',
                                        maxHeight: '140px',
                                        objectFit: 'contain',
                                      }}
                                    />
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={() => removeEditFile('signature')}
                                    sx={{
                                      position: 'absolute',
                                      top: 5,
                                      right: 5,
                                      backgroundColor: 'white',
                                      '&:hover': { backgroundColor: '#f5f5f5' },
                                    }}
                                  >
                                    <DeleteFileIcon />
                                  </IconButton>
                                </Box>
                              ) : null}
                              <Button
                                component="label"
                                variant="outlined"
                                fullWidth
                                startIcon={<CloudUploadIcon />}
                                sx={{ py: 1, mt: editPreviews.signature ? 2 : 0 }}
                              >
                                {editPreviews.signature ? 'Changer la signature' : 'Télécharger la signature'}
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => handleEditFileChange('signature', e)}
                                />
                              </Button>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Recommandé : Image avec fond transparent (PNG)
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </form>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseEditDialog} disabled={loadingEdit}>
                      Annuler
                    </Button>
                    <Button
                      onClick={handleEditSubmit}
                      variant="contained"
                      disabled={loadingEdit}
                      startIcon={loadingEdit ? <CircularProgress size={20} color="inherit" /> : null}
                      sx={{
                        background: `linear-gradient(135deg, ${indigo[600]} 0%, ${cyan[700]} 100%)`,
                        color: 'white',
                        '&:disabled': {
                          background: 'grey',
                        },
                      }}
                    >
                      {loadingEdit ? 'Modification en cours...' : 'Modifier le gestionnaire'}
                    </Button>
                  </DialogActions>
                </>
              )}
            </Dialog>
          </Paper>
        </Container>

        {/* Snackbar pour les notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          action={snackbarAction}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <CustomAlert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </CustomAlert>
        </Snackbar>
      </Box>
    </Layout>
  );
}