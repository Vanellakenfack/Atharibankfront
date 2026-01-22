import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { indigo, blueGrey, cyan } from '@mui/material/colors';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '../../components/layout/Layout';
import { gestionnaireService, type Gestionnaire } from '../../services/gestionnaireService/gestionnaireApi';

export default function EditGestionnaire() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [gestionnaire, setGestionnaire] = useState<Gestionnaire | null>(null);
  const [formData, setFormData] = useState({
    gestionnaire_code: '',
    gestionnaire_nom: '',
    gestionnaire_prenom: '',
    telephone: '',
    email: '',
    ville: '',
    quartier: '',
    agence_id: '',
  });
  const [files, setFiles] = useState({
    cni_recto: null as File | null,
    cni_verso: null as File | null,
    plan_localisation_domicile: null as File | null,
  });
  const [previews, setPreviews] = useState({
    cni_recto: null as string | null,
    cni_verso: null as string | null,
    plan_localisation_domicile: null as string | null,
  });

  // Charger les données
  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [agenciesRes, gestionnaireRes] = await Promise.all([
        gestionnaireService.getAllAgencies(),
        gestionnaireService.getGestionnaireById(parseInt(id!)),
      ]);

      if (agenciesRes.success) {
        setAgencies(agenciesRes.data);
      }

      if (gestionnaireRes.success) {
        const g = gestionnaireRes.data;
        setGestionnaire(g);
        setFormData({
          gestionnaire_code: g.gestionnaire_code,
          gestionnaire_nom: g.gestionnaire_nom,
          gestionnaire_prenom: g.gestionnaire_prenom,
          telephone: g.telephone || '',
          email: g.email || '',
          ville: g.ville || '',
          quartier: g.quartier || '',
          agence_id: g.agence_id.toString(),
        });
        
        // Mettre les URLs existantes dans les previews
        setPreviews({
          cni_recto: g.cni_recto_url || null,
          cni_verso: g.cni_verso_url || null,
          plan_localisation_domicile: g.plan_localisation_domicile_url || null,
        });
      } else {
        setError('Gestionnaire non trouvé');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les données');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleFileChange = (field: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError(`Le fichier ${field} ne doit pas dépasser 2MB`);
        return;
      }
      
      // Vérifier le type (images seulement)
      if (!file.type.startsWith('image/')) {
        setError(`Le fichier ${field} doit être une image (JPG, PNG)`);
        return;
      }
      
      setFiles(prev => ({ ...prev, [field]: file }));
      setPreviews(prev => {
        // Libérer l'ancienne URL si c'est une preview locale
        if (prev[field] && prev[field]!.startsWith('blob:')) {
          URL.revokeObjectURL(prev[field]!);
        }
        return { ...prev, [field]: URL.createObjectURL(file) };
      });
      if (error) setError(null);
    }
  };

  const removeFile = (field: keyof typeof files) => {
    setFiles(prev => ({ ...prev, [field]: null }));
    setPreviews(prev => {
      // Libérer l'URL si c'est une preview locale
      if (prev[field] && prev[field]!.startsWith('blob:')) {
        URL.revokeObjectURL(prev[field]!);
      }
      return { ...prev, [field]: null };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.gestionnaire_code || !formData.gestionnaire_nom || !formData.gestionnaire_prenom || !formData.agence_id) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      const updateData: any = {
        gestionnaire_code: formData.gestionnaire_code,
        gestionnaire_nom: formData.gestionnaire_nom,
        gestionnaire_prenom: formData.gestionnaire_prenom,
        telephone: formData.telephone,
        email: formData.email,
        ville: formData.ville,
        quartier: formData.quartier,
        agence_id: parseInt(formData.agence_id),
      };

      // Gérer les fichiers seulement s'ils ont été modifiés
      if (files.cni_recto !== null) {
        updateData.cni_recto = files.cni_recto;
      }
      if (files.cni_verso !== null) {
        updateData.cni_verso = files.cni_verso;
      }
      if (files.plan_localisation_domicile !== null) {
        updateData.plan_localisation_domicile = files.plan_localisation_domicile;
      }

      const result = await gestionnaireService.updateGestionnaire(
        parseInt(id!),
        updateData
      );

      if (result.success) {
        setSuccessMessage(`Gestionnaire ${result.data.gestionnaire_code} modifié avec succès !`);
        
        // Mettre à jour les données locales
        setGestionnaire(result.data);
        
        // Réinitialiser les fichiers modifiés après 2 secondes
        setTimeout(() => {
          setSuccessMessage(null);
        }, 2000);
      } else {
        setError(result.message || 'Erreur lors de la modification du gestionnaire');
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await gestionnaireService.deleteGestionnaire(parseInt(id!));
      if (result.success) {
        setSuccessMessage('Gestionnaire supprimé avec succès');
        setTimeout(() => {
          navigate('/gestionnaire');
        }, 1500);
      } else {
        setError(result.message || 'Erreur lors de la suppression');
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      setError('Impossible de supprimer le gestionnaire');
    } finally {
      setDeleteDialog(false);
    }
  };

  if (loadingData) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Chargement des données...</Typography>
        </Box>
      </Layout>
    );
  }

  if (!gestionnaire) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">
            Gestionnaire non trouvé
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/gestionnaire')}
            sx={{ mt: 2 }}
          >
            Retour à la liste
          </Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ minHeight: '100vh', bgcolor: blueGrey[50], py: 4 }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/gestionnaire')}
                  sx={{ mb: 1 }}
                >
                  Retour
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 700, color: indigo[900] }}>
                  Modifier le Gestionnaire
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {gestionnaire.id} • Créé le: {new Date(gestionnaire.created_at).toLocaleDateString()}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeleteDialog(true)}
                disabled={gestionnaire.etat === 'supprime'}
              >
                Supprimer
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Informations de base */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: indigo[700], mb: 2 }}>
                    Informations de base
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Code Gestionnaire *"
                    name="gestionnaire_code"
                    value={formData.gestionnaire_code}
                    onChange={handleInputChange}
                    size="small"
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Agence *</InputLabel>
                    <Select
                      name="agence_id"
                      value={formData.agence_id}
                      label="Agence *"
                      onChange={handleSelectChange}
                    >
                      {agencies.map((agence) => (
                        <MenuItem key={agence.id} value={agence.id}>
                          {agence.code} - {agence.name || agence.agency_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom *"
                    name="gestionnaire_nom"
                    value={formData.gestionnaire_nom}
                    onChange={handleInputChange}
                    size="small"
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Prénom *"
                    name="gestionnaire_prenom"
                    value={formData.gestionnaire_prenom}
                    onChange={handleInputChange}
                    size="small"
                    required
                  />
                </Grid>

                {/* Contact */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: indigo[700], mb: 2, mt: 2 }}>
                    Contact
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    size="small"
                  />
                </Grid>

                {/* Localisation */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: indigo[700], mb: 2, mt: 2 }}>
                    Localisation
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ville"
                    name="ville"
                    value={formData.ville}
                    onChange={handleInputChange}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Quartier"
                    name="quartier"
                    value={formData.quartier}
                    onChange={handleInputChange}
                    size="small"
                  />
                </Grid>

                {/* Documents */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: indigo[700], mb: 2, mt: 2 }}>
                    Documents
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Note: Les documents existants restent inchangés si vous ne téléchargez pas de nouveaux fichiers
                  </Typography>
                </Grid>

                {/* CNI Recto */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: indigo[600] }}>
                        CNI Recto
                      </Typography>
                      {previews.cni_recto ? (
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={previews.cni_recto}
                            alt="CNI Recto"
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              marginBottom: '10px',
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeFile('cni_recto')}
                            sx={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              backgroundColor: 'white',
                              '&:hover': { backgroundColor: '#f5f5f5' },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Button
                          component="label"
                          variant="outlined"
                          fullWidth
                          startIcon={<CloudUploadIcon />}
                          sx={{ py: 2 }}
                        >
                          Télécharger le recto
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange('cni_recto', e)}
                          />
                        </Button>
                      )}
                      {gestionnaire.cni_recto && !files.cni_recto && !previews.cni_recto?.startsWith('blob:') && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Document existant conservé
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* CNI Verso */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: indigo[600] }}>
                        CNI Verso
                      </Typography>
                      {previews.cni_verso ? (
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={previews.cni_verso}
                            alt="CNI Verso"
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              marginBottom: '10px',
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeFile('cni_verso')}
                            sx={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              backgroundColor: 'white',
                              '&:hover': { backgroundColor: '#f5f5f5' },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Button
                          component="label"
                          variant="outlined"
                          fullWidth
                          startIcon={<CloudUploadIcon />}
                          sx={{ py: 2 }}
                        >
                          Télécharger le verso
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange('cni_verso', e)}
                          />
                        </Button>
                      )}
                      {gestionnaire.cni_verso && !files.cni_verso && !previews.cni_verso?.startsWith('blob:') && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Document existant conservé
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Plan de localisation */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: indigo[600] }}>
                        Plan de localisation du domicile
                      </Typography>
                      {previews.plan_localisation_domicile ? (
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={previews.plan_localisation_domicile}
                            alt="Plan localisation"
                            style={{
                              width: '100%',
                              maxHeight: '200px',
                              objectFit: 'contain',
                              borderRadius: '8px',
                              marginBottom: '10px',
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeFile('plan_localisation_domicile')}
                            sx={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              backgroundColor: 'white',
                              '&:hover': { backgroundColor: '#f5f5f5' },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Button
                          component="label"
                          variant="outlined"
                          fullWidth
                          startIcon={<PhotoCamera />}
                          sx={{ py: 2 }}
                        >
                          Télécharger le plan
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange('plan_localisation_domicile', e)}
                          />
                        </Button>
                      )}
                      {gestionnaire.plan_localisation_domicile && !files.plan_localisation_domicile && !previews.plan_localisation_domicile?.startsWith('blob:') && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Document existant conservé
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Boutons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/gestionnaire')}
                      disabled={loading}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                      sx={{
                        background: `linear-gradient(135deg, ${indigo[600]} 0%, ${cyan[700]} 100%)`,
                        color: 'white',
                        px: 4,
                      }}
                    >
                      {loading ? 'Modification en cours...' : 'Mettre à jour'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>
      </Box>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Êtes-vous sûr de vouloir supprimer le gestionnaire <strong>{gestionnaire.gestionnaire_nom} {gestionnaire.gestionnaire_prenom}</strong> ?
            <br />
            Cette action est irréversible. L'état sera changé à "supprimé".
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Confirmer la suppression
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}