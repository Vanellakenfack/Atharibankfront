import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Snackbar,
  Divider,
} from '@mui/material';
import { indigo, blueGrey, cyan } from '@mui/material/colors';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import Layout from '../../components/layout/Layout';
import { gestionnaireService } from '../../services/gestionnaireService/gestionnaireApi';
import agenceService from '../../services/agenceService';

// Composant Alert personnalisé pour Snackbar (version simplifiée)
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

export default function AddGestionnaire() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(true);
  const [formData, setFormData] = useState({
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
    signature: null as File | null,
  });
  const [previews, setPreviews] = useState({
    cni_recto: null as string | null,
    cni_verso: null as string | null,
    plan_localisation_domicile: null as string | null,
    signature: null as string | null,
  });

  // États pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Charger les agences au démarrage
  useEffect(() => {
    fetchAgencies();
    return () => {
      // Nettoyer les URLs de prévisualisation
      Object.values(previews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const fetchAgencies = async () => {
    try {
      setLoadingAgencies(true);
      const response = await agenceService.getAgences();
      setAgencies(response);
      
      // Afficher un message d'info si aucune agence n'est trouvée
      if (response.length === 0) {
        setSnackbar({
          open: true,
          message: 'Aucune agence disponible. Veuillez d\'abord créer une agence.',
          severity: 'info',
        });
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des agences:', err);
      setSnackbar({
        open: true,
        message: `Erreur lors du chargement des agences: ${err.message || 'Vérifiez votre connexion internet'}`,
        severity: 'error',
      });
    } finally {
      setLoadingAgencies(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (field: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: `Le fichier ${field === 'cni_recto' ? 'CNI Recto' : field === 'cni_verso' ? 'CNI Verso' : field === 'signature' ? 'Signature' : 'Plan de localisation'} ne doit pas dépasser 2MB.`,
          severity: 'error',
        });
        return;
      }
      
      // Vérifier le type (images seulement)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: `Le fichier doit être une image (JPG, PNG). Type détecté: ${file.type}`,
          severity: 'error',
        });
        return;
      }
      
      setFiles(prev => ({ ...prev, [field]: file }));
      setPreviews(prev => {
        // Libérer l'ancienne URL si elle existe
        if (prev[field]) URL.revokeObjectURL(prev[field]!);
        return { ...prev, [field]: URL.createObjectURL(file) };
      });
      
      // Confirmation de téléchargement
      setSnackbar({
        open: true,
        message: `Fichier ${field === 'cni_recto' ? 'CNI Recto' : field === 'cni_verso' ? 'CNI Verso' : field === 'signature' ? 'Signature' : 'Plan de localisation'} téléchargé avec succès.`,
        severity: 'success',
      });
    }
  };

  const removeFile = (field: keyof typeof files) => {
    setFiles(prev => ({ ...prev, [field]: null }));
    setPreviews(prev => {
      if (prev[field]) URL.revokeObjectURL(prev[field]!);
      return { ...prev, [field]: null };
    });
    
    setSnackbar({
      open: true,
      message: `Fichier ${field === 'cni_recto' ? 'CNI Recto' : field === 'cni_verso' ? 'CNI Verso' : field === 'signature' ? 'Signature' : 'Plan de localisation'} supprimé.`,
      severity: 'info',
    });
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validation des champs obligatoires
    if (!formData.gestionnaire_nom.trim()) {
      errors.push('Le nom est obligatoire');
    }
    if (!formData.gestionnaire_prenom.trim()) {
      errors.push('Le prénom est obligatoire');
    }
    if (!formData.agence_id) {
      errors.push('La sélection d\'une agence est obligatoire');
    }

    // Validation des documents obligatoires
    if (!files.cni_recto) {
      errors.push('La CNI recto est obligatoire');
    }
    if (!files.cni_verso) {
      errors.push('La CNI verso est obligatoire');
    }
    if (!files.signature) {
      errors.push('La signature est obligatoire');
    }

    // Validation format email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('L\'adresse email n\'est pas valide');
    }

    // Validation format téléphone (optionnel mais si fourni)
    if (formData.telephone && !/^[\d\s\-\+\(\)]{8,20}$/.test(formData.telephone)) {
      errors.push('Le numéro de téléphone n\'est pas valide (8 à 20 chiffres)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du formulaire
    const validation = validateForm();
    if (!validation.isValid) {
      // Afficher la première erreur
      if (validation.errors.length > 0) {
        setSnackbar({
          open: true,
          message: validation.errors[0],
          severity: 'error',
        });
      }
      return;
    }

    setLoading(true);

    try {
      const result = await gestionnaireService.createGestionnaire({
        ...formData,
        agence_id: parseInt(formData.agence_id),
        cni_recto: files.cni_recto,
        cni_verso: files.cni_verso,
        plan_localisation_domicile: files.plan_localisation_domicile,
        signature: files.signature,
      });

      if (result.success) {
        setSnackbar({
          open: true,
          message: `✅ Gestionnaire "${result.data.gestionnaire_code}" créé avec succès ! Redirection vers la liste dans 3 secondes...`,
          severity: 'success',
        });

        // Réinitialiser le formulaire
        setFormData({
          gestionnaire_nom: '',
          gestionnaire_prenom: '',
          telephone: '',
          email: '',
          ville: '',
          quartier: '',
          agence_id: '',
        });
        setFiles({
          cni_recto: null,
          cni_verso: null,
          plan_localisation_domicile: null,
          signature: null,
        });
        setPreviews({
          cni_recto: null,
          cni_verso: null,
          plan_localisation_domicile: null,
          signature: null,
        });

        // Redirection après 5 secondes
        setTimeout(() => {
          navigate('/AddGestionnaire');
        }, 5000);

      } else {
        setSnackbar({
          open: true,
          message: `❌ Erreur : ${result.message || 'Impossible de créer le gestionnaire. Veuillez réessayer.'}`,
          severity: 'error',
        });
      }
    } catch (err: any) {
      console.error('Erreur lors de la création:', err);
      
      let errorMessage = 'Une erreur est survenue lors de la création du gestionnaire.';
      
      if (err.response) {
        const { status, data } = err.response;
        
        switch (status) {
          case 400:
            errorMessage = 'Données invalides. Vérifiez les informations saisies.';
            if (data?.errors) {
              // Extraire les erreurs de validation Laravel
              const validationErrors = Object.values(data.errors).flat().join(', ');
              errorMessage = `Erreur de validation : ${validationErrors}`;
            }
            break;
          case 401:
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            break;
          case 403:
            errorMessage = 'Vous n\'avez pas la permission de créer un gestionnaire.';
            break;
          case 404:
            errorMessage = 'Agence non trouvée. Veuillez sélectionner une agence valide.';
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
      
      setSnackbar({
        open: true,
        message: `❌ ${errorMessage}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Action pour fermer le Snackbar
  const action = (
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
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 4, color: indigo[900] }}>
              Ajouter un Nouveau Gestionnaire
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Information importante
                </Typography>
                <Typography variant="body2">
                  Tous les champs marqués d'un astérisque (*) sont obligatoires. 
                  Les fichiers image doivent être au format JPG ou PNG et ne pas dépasser 2MB.
                  Le code gestionnaire sera généré automatiquement (format: G001, G002, etc.)
                </Typography>
              </Alert>
            </Box>

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

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Agence *</InputLabel>
                    <Select
                      name="agence_id"
                      value={formData.agence_id}
                      label="Agence *"
                      onChange={handleSelectChange}
                      disabled={loadingAgencies || agencies.length === 0}
                      required
                      sx={{minWidth: 200}}
                    >
                      {loadingAgencies ? (
                        <MenuItem value="">
                          <em>Chargement des agences...</em>
                        </MenuItem>
                      ) : agencies.length === 0 ? (
                        <MenuItem value="">
                          <em>Aucune agence disponible</em>
                        </MenuItem>
                      ) : (
                        agencies.map((agence) => (
                          <MenuItem key={agence.id} value={agence.id}>
                            {agence.code} - {agence.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {!loadingAgencies && agencies.length === 0 && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                        Veuillez créer une agence d'abord
                      </Typography>
                    )}
                  </FormControl>
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
                    label="Téléphone *"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    size="small"
                    placeholder="Ex: +237 6 81 23 45 78"
                    helperText="Format : 8 à 20 chiffres"
                    required
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
                    placeholder="exemple@domaine.com"
                    helperText="Adresse email valide"
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
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Les fichiers CNI (recto et verso) et la signature sont obligatoires. Format accepté : JPG, PNG (max 2MB)
                  </Alert>
                </Grid>

                {/* CNI Recto */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: indigo[600] }}>
                        CNI Recto *
                        {previews.cni_recto && (
                          <Typography variant="caption" color="success" sx={{ ml: 1 }}>
                            ✓ Téléchargé
                          </Typography>
                        )}
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
                              border: '2px solid #4caf50',
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
                    </CardContent>
                  </Card>
                </Grid>

                {/* CNI Verso */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: indigo[600] }}>
                        CNI Verso *
                        {previews.cni_verso && (
                          <Typography variant="caption" color="success" sx={{ ml: 1 }}>
                            ✓ Téléchargé
                          </Typography>
                        )}
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
                              border: '2px solid #4caf50',
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
                    </CardContent>
                  </Card>
                </Grid>

                {/* Plan de localisation */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: indigo[600] }}>
                        Plan de localisation du domicile (Optionnel)
                        {previews.plan_localisation_domicile && (
                          <Typography variant="caption" color="success" sx={{ ml: 1 }}>
                            ✓ Téléchargé
                          </Typography>
                        )}
                      </Typography>
                      {previews.plan_localisation_domicile ? (
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={previews.plan_localisation_domicile}
                            alt="Plan localisation"
                            style={{
                              width: '100%',
                              height: '150px',
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
                    </CardContent>
                  </Card>
                </Grid>

                {/* Signature */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: indigo[600] }}>
                        Signature *
                        {previews.signature && (
                          <Typography variant="caption" color="success" sx={{ ml: 1 }}>
                            ✓ Téléchargé
                          </Typography>
                        )}
                      </Typography>
                      {previews.signature ? (
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={previews.signature}
                            alt="Signature"
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'contain',
                              borderRadius: '8px',
                              marginBottom: '10px',
                              border: '2px solid #4caf50',
                              backgroundColor: 'white',
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeFile('signature')}
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
                          Télécharger la signature
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange('signature', e)}
                          />
                        </Button>
                      )}
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Format accepté : JPG, PNG (max 2MB)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Boutons */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/gestionnaire')}
                      disabled={loading}
                      sx={{  mr: 5  }}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || loadingAgencies || agencies.length === 0 || !files.cni_recto || !files.cni_verso || !files.signature}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                      sx={{
                        background: `linear-gradient(135deg, ${indigo[600]} 0%, ${cyan[700]} 100%)`,
                        color: 'white',
                        px: 4,
                        '&:disabled': {
                          background: 'grey',
                          cursor: 'not-allowed',
                        },
                      }}
                    >
                      {loading ? 'Création en cours...' : 'Créer le Gestionnaire'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>

        {/* Snackbar pour les notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          action={action}
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