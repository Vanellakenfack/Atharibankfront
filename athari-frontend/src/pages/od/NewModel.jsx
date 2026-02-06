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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Divider,
  InputAdornment,
  FormHelperText,
  Autocomplete
} from "@mui/material";
import {
  Description,
  Save,
  ArrowBack,
  Add,
  Delete,
  Edit,
  Check,
  Close,
  Search,
  ArrowUpward,
  ArrowDownward,
  AttachMoney,
  Percent,
  TrendingUp,
  TrendingDown
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";

export default function NewModel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [comptesPlan, setComptesPlan] = useState([]);
  const [compteDialog, setCompteDialog] = useState({ open: false, index: null });
  const [editingIndex, setEditingIndex] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Types d'opération selon votre backend
  const typeOperations = [
    { value: 'VIREMENT', label: 'Virement' },
    { value: 'FRAIS', label: 'Frais' },
    { value: 'COMMISSION', label: 'Commission' },
    { value: 'REGULARISATION', label: 'Régularisation' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  // Sens des lignes
  const sensOptions = [
    { value: 'D', label: 'Débit', icon: <TrendingUp color="error" /> },
    { value: 'C', label: 'Crédit', icon: <TrendingDown color="success" /> }
  ];

  // Validation schéma selon votre backend
  const validationSchema = Yup.object({
    code: Yup.string()
      .required("Le code est requis")
      .max(50, "Maximum 50 caractères"),
    nom: Yup.string()
      .required("Le nom est requis")
      .max(255, "Maximum 255 caractères"),
    description: Yup.string(),
    type_operation: Yup.string()
      .required("Le type d'opération est requis")
      .oneOf(['VIREMENT', 'FRAIS', 'COMMISSION', 'REGULARISATION', 'AUTRE']),
    code_operation: Yup.string().max(50, "Maximum 50 caractères"),
    lignes: Yup.array()
      .of(
        Yup.object({
          compte_id: Yup.string().required("Le compte est requis"),
          sens: Yup.string().required("Le sens est requis").oneOf(['D', 'C']),
          libelle: Yup.string().required("Le libellé est requis").max(255, "Maximum 255 caractères"),
          montant_fixe: Yup.number().min(0, "Le montant doit être positif").nullable(),
          taux: Yup.number().min(0, "Le taux doit être positif").max(100, "Le taux ne peut dépasser 100%").nullable(),
          ordre: Yup.number().min(0, "L'ordre doit être positif").nullable()
        })
      )
      .min(2, "Au moins 2 lignes sont requises")
      .required("Les lignes sont requises")
  });

  const formik = useFormik({
    initialValues: {
      code: '',
      nom: '',
      description: '',
      type_operation: '',
      code_operation: '',
      lignes: []
    },
    validationSchema,
    onSubmit: async (values) => {
      // Vérifier l'équilibre du modèle
      if (!estModelEquilibre()) {
        showSnackbar("Le modèle n'est pas équilibré (total débit ≠ total crédit)", "error");
        return;
      }

      setLoading(true);
      try {
        // Préparer les données selon votre backend
        const requestData = {
          code: values.code,
          nom: values.nom,
          description: values.description || '',
          type_operation: values.type_operation,
          code_operation: values.code_operation || '',
          lignes: values.lignes.map((ligne, index) => ({
            compte_id: ligne.compte_id,
            sens: ligne.sens,
            libelle: ligne.libelle,
            montant_fixe: ligne.montant_fixe || null,
            taux: ligne.taux || null,
            ordre: ligne.ordre || index
          }))
        };

        const response = await ApiClient.post('/operation-diverses/modeles', requestData);

        if (response.data.success) {
          showSnackbar('Modèle créé avec succès !', 'success');
          setTimeout(() => navigate('/CreerOdModelesPage'), 1500);
        } else {
          showSnackbar(response.data.message, 'error');
        }
      } catch (error) {
        console.error('Erreur:', error.response?.data || error);
        showSnackbar(
          error.response?.data?.message || 'Erreur lors de la création du modèle', 
          'error'
        );
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    fetchComptesPlan();
  }, []);

  const fetchComptesPlan = async () => {
    try {
      const response = await ApiClient.get('/operation-diverses/comptes/plan');
      if (response.data.success) {
        setComptesPlan(response.data.data);
      }
    } catch (error) {
      showSnackbar('Erreur lors du chargement des comptes', 'error');
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

  // Gestion des lignes du modèle
  const handleAddLigne = () => {
    const newLigne = {
      compte_id: '',
      sens: 'D',
      libelle: '',
      montant_fixe: '',
      taux: '',
      ordre: formik.values.lignes.length
    };
    formik.setFieldValue('lignes', [...formik.values.lignes, newLigne]);
    setEditingIndex(formik.values.lignes.length);
    setCompteDialog({ open: true, index: formik.values.lignes.length });
  };

  const handleEditLigne = (index) => {
    setEditingIndex(index);
    setCompteDialog({ open: true, index });
  };

  const handleDeleteLigne = (index) => {
    const newLignes = formik.values.lignes.filter((_, i) => i !== index);
    // Réordonner les lignes
    const reorderedLignes = newLignes.map((ligne, idx) => ({
      ...ligne,
      ordre: idx
    }));
    formik.setFieldValue('lignes', reorderedLignes);
  };

  const handleMoveLigne = (index, direction) => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === formik.values.lignes.length - 1)) {
      return;
    }

    const newLignes = [...formik.values.lignes];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Échanger les positions
    [newLignes[index], newLignes[newIndex]] = [newLignes[newIndex], newLignes[index]];
    
    // Mettre à jour les ordres
    const updatedLignes = newLignes.map((ligne, idx) => ({
      ...ligne,
      ordre: idx
    }));
    
    formik.setFieldValue('lignes', updatedLignes);
  };

  const handleSaveLigne = (ligneData) => {
    const newLignes = [...formik.values.lignes];
    newLignes[editingIndex] = ligneData;
    formik.setFieldValue('lignes', newLignes);
    setCompteDialog({ open: false, index: null });
    setEditingIndex(null);
  };

  // Calculer l'équilibre du modèle
  const estModelEquilibre = () => {
    const lignes = formik.values.lignes;
    if (lignes.length < 2) return false;

    const totalDebit = lignes
      .filter(l => l.sens === 'D')
      .reduce((sum, ligne) => sum + (parseFloat(ligne.montant_fixe) || 0), 0);
    
    const totalCredit = lignes
      .filter(l => l.sens === 'C')
      .reduce((sum, ligne) => sum + (parseFloat(ligne.montant_fixe) || 0), 0);

    return Math.abs(totalDebit - totalCredit) < 0.01;
  };

  const calculerMontantsParTaux = (montantTotal) => {
    const lignesAvecTaux = formik.values.lignes.filter(l => l.taux && !l.montant_fixe);
    const totalTaux = lignesAvecTaux.reduce((sum, ligne) => sum + (parseFloat(ligne.taux) || 0), 0);
    
    if (totalTaux === 0) return {};

    const montants = {};
    lignesAvecTaux.forEach(ligne => {
      montants[ligne.ordre] = (montantTotal * (parseFloat(ligne.taux) / 100)).toFixed(2);
    });
    
    return montants;
  };

  const getCompteInfo = (compteId) => {
    return comptesPlan.find(c => c.id === compteId);
  };

  const getTotalDebit = () => {
    return formik.values.lignes
      .filter(l => l.sens === 'D')
      .reduce((sum, ligne) => sum + (parseFloat(ligne.montant_fixe) || 0), 0)
      .toFixed(2);
  };

  const getTotalCredit = () => {
    return formik.values.lignes
      .filter(l => l.sens === 'C')
      .reduce((sum, ligne) => sum + (parseFloat(ligne.montant_fixe) || 0), 0)
      .toFixed(2);
  };

  return (
    <Layout>
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          {/* En-tête */}
          <Box sx={{ mb: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/CreerOdModelesPage')} sx={{ mb: 2 }}>
              Retour
            </Button>
            <Typography variant="h4" fontWeight="700" sx={{ display: 'flex', alignItems: 'center' }}>
              <Description sx={{ mr: 2, color: '#9c27b0' }} />
              Créer un Modèle d'OD
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Créez un modèle prédéfini pour les opérations diverses récurrentes
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Formulaire de base */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0', height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Description sx={{ mr: 1, color: '#9c27b0' }} />
                  Informations du modèle
                </Typography>
                
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Code du modèle *"
                      name="code"
                      value={formik.values.code}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.code && Boolean(formik.errors.code)}
                      helperText={formik.touched.code && formik.errors.code}
                      placeholder="Ex: MODELE_FRAIS_GENERAUX"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nom du modèle *"
                      name="nom"
                      value={formik.values.nom}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.nom && Boolean(formik.errors.nom)}
                      helperText={formik.touched.nom && formik.errors.nom}
                      placeholder="Ex: Modèle pour frais généraux"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl sx={{minWidth:200}} error={formik.touched.type_operation && Boolean(formik.errors.type_operation)}>
                      <InputLabel>Type d'opération *</InputLabel>
                      <Select
                        name="type_operation"
                        value={formik.values.type_operation}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Type d'opération *"
                      >
                        {typeOperations.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.type_operation && formik.errors.type_operation && (
                        <FormHelperText error>{formik.errors.type_operation}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Code opération"
                      name="code_operation"
                      value={formik.values.code_operation}
                      onChange={formik.handleChange}
                      placeholder="Ex: FRAIS_GEN"
                      helperText="Code interne pour identifier le type d'opération"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      multiline
                      rows={3}
                      placeholder="Description du modèle..."
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Gestion des lignes */}
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    Lignes du modèle
                    <Chip 
                      label={`${formik.values.lignes.length} ligne(s)`} 
                      size="small" 
                      color="primary" 
                      sx={{ ml: 2 }}
                    />
                  </Typography>
                  
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddLigne}
                    disabled={formik.values.lignes.length >= 10}
                  >
                    Ajouter une ligne
                  </Button>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Liste des lignes */}
                {formik.values.lignes.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Description sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Aucune ligne définie
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Commencez par ajouter des lignes au modèle
                    </Typography>
                    <Button variant="outlined" startIcon={<Add />} onClick={handleAddLigne}>
                      Ajouter la première ligne
                    </Button>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell width="50">Ordre</TableCell>
                            <TableCell>Sens</TableCell>
                            <TableCell>Compte</TableCell>
                            <TableCell>Libellé</TableCell>
                            <TableCell align="right">Montant fixe</TableCell>
                            <TableCell align="right">Taux %</TableCell>
                            <TableCell align="center" width="150">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formik.values.lignes.map((ligne, index) => {
                            const compteInfo = getCompteInfo(ligne.compte_id);
                            return (
                              <TableRow key={index} hover>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="600">
                                    {index + 1}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={ligne.sens === 'D' ? <TrendingUp /> : <TrendingDown />}
                                    label={ligne.sens === 'D' ? 'Débit' : 'Crédit'}
                                    color={ligne.sens === 'D' ? 'error' : 'success'}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  {compteInfo ? (
                                    <>
                                      <Typography variant="body2" fontWeight="600">
                                        {compteInfo.code}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {compteInfo.libelle}
                                      </Typography>
                                    </>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      Non défini
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {ligne.libelle || '-'}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="600">
                                    {ligne.montant_fixe ? `${parseFloat(ligne.montant_fixe).toFixed(2)} FCFA` : '-'}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  {ligne.taux ? (
                                    <Chip label={`${ligne.taux}%`} size="small" color="info" />
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleMoveLigne(index, 'up')}
                                    disabled={index === 0}
                                  >
                                    <ArrowUpward fontSize="small" />
                                  </IconButton>
                                  
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleMoveLigne(index, 'down')}
                                    disabled={index === formik.values.lignes.length - 1}
                                  >
                                    <ArrowDownward fontSize="small" />
                                  </IconButton>
                                  
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleEditLigne(index)}
                                    color="primary"
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleDeleteLigne(index)}
                                    color="error"
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Résumé de l'équilibre */}
                    <Card sx={{ mt: 3, bgcolor: '#f8f9fa' }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" color="text.secondary">Total Débit</Typography>
                            <Typography variant="h6" color="error.main">
                              {getTotalDebit()} FCFA
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" color="text.secondary">Total Crédit</Typography>
                            <Typography variant="h6" color="success.main">
                              {getTotalCredit()} FCFA
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" color="text.secondary">Équilibre</Typography>
                            <Chip
                              icon={estModelEquilibre() ? <Check /> : <Close />}
                              label={estModelEquilibre() ? 'Équilibré' : 'Déséquilibré'}
                              color={estModelEquilibre() ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </Grid>
                        </Grid>
                        {!estModelEquilibre() && formik.values.lignes.length >= 2 && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            Le modèle n'est pas équilibré. Ajustez les montants pour que le total débit soit égal au total crédit.
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Bouton de sauvegarde */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    onClick={formik.handleSubmit}
                    disabled={loading || formik.values.lignes.length < 2 || !estModelEquilibre()}
                    sx={{ minWidth: 200 }}
                  >
                    {loading ? 'Création...' : 'Créer le modèle'}
                  </Button>
                </Box>
              </Paper>

              {/* Information */}
              <Alert severity="info" sx={{ mt: 3, borderRadius: 4 }}>
                <Typography variant="body2">
                  <strong>Note :</strong> Un modèle doit contenir au moins 2 lignes et être équilibré (total débit = total crédit).
                  Vous pouvez utiliser des montants fixes ou des pourcentages pour les lignes avec taux.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Dialog pour ajouter/modifier une ligne */}
      <Dialog 
        open={compteDialog.open} 
        onClose={() => setCompteDialog({ open: false, index: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingIndex !== null ? 'Modifier la ligne' : 'Ajouter une ligne'}
        </DialogTitle>
        <DialogContent>
          <CompteLigneForm
            ligne={editingIndex !== null ? formik.values.lignes[editingIndex] : null}
            comptesPlan={comptesPlan}
            onSave={handleSaveLigne}
            onCancel={() => setCompteDialog({ open: false, index: null })}
          />
        </DialogContent>
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

// Composant pour le formulaire de ligne
function CompteLigneForm({ ligne, comptesPlan, onSave, onCancel }) {
  const [formData, setFormData] = useState(ligne || {
    compte_id: '',
    sens: 'D',
    libelle: '',
    montant_fixe: '',
    taux: '',
    ordre: 0
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Si on change de montant fixe, on réinitialise le taux
    if (field === 'montant_fixe' && value) {
      setFormData(prev => ({
        ...prev,
        taux: ''
      }));
    }
    
    // Si on change de taux, on réinitialise le montant fixe
    if (field === 'taux' && value) {
      setFormData(prev => ({
        ...prev,
        montant_fixe: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.compte_id) {
      newErrors.compte_id = 'Le compte est requis';
    }
    
    if (!formData.libelle.trim()) {
      newErrors.libelle = 'Le libellé est requis';
    }
    
    if (!formData.montant_fixe && !formData.taux) {
      newErrors.montant_fixe = 'Le montant fixe ou le taux est requis';
    }
    
    if (formData.montant_fixe && parseFloat(formData.montant_fixe) < 0) {
      newErrors.montant_fixe = 'Le montant doit être positif';
    }
    
    if (formData.taux && (parseFloat(formData.taux) < 0 || parseFloat(formData.taux) > 100)) {
      newErrors.taux = 'Le taux doit être entre 0 et 100%';
    }
    
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Préparer les données
    const ligneData = {
      compte_id: formData.compte_id,
      sens: formData.sens,
      libelle: formData.libelle,
      montant_fixe: formData.montant_fixe ? parseFloat(formData.montant_fixe) : null,
      taux: formData.taux ? parseFloat(formData.taux) : null,
      ordre: formData.ordre
    };
    
    onSave(ligneData);
  };

  return (
    <Box sx={{ pt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={Boolean(errors.sens)}>
            <InputLabel>Sens *</InputLabel>
            <Select
              value={formData.sens}
              onChange={(e) => handleChange('sens', e.target.value)}
              label="Sens *"
            >
              <MenuItem value="D">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ mr: 1, color: 'error.main' }} />
                  Débit
                </Box>
              </MenuItem>
              <MenuItem value="C">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingDown sx={{ mr: 1, color: 'success.main' }} />
                  Crédit
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={Boolean(errors.compte_id)}>
            <InputLabel>Compte *</InputLabel>
            <Select
              value={formData.compte_id}
              onChange={(e) => handleChange('compte_id', e.target.value)}
              label="Compte *"
              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
            >
              {comptesPlan.map((compte) => (
                <MenuItem key={compte.id} value={compte.id}>
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      {compte.code}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {compte.libelle}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.compte_id && (
              <FormHelperText error>{errors.compte_id}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Libellé de la ligne *"
            value={formData.libelle}
            onChange={(e) => handleChange('libelle', e.target.value)}
            error={Boolean(errors.libelle)}
            helperText={errors.libelle}
            placeholder="Ex: Frais de communication"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Montant fixe (FCFA)"
            type="number"
            value={formData.montant_fixe}
            onChange={(e) => handleChange('montant_fixe', e.target.value)}
            error={Boolean(errors.montant_fixe)}
            helperText={errors.montant_fixe || "Laisser vide si utilisation de taux"}
            InputProps={{
              startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
            }}
            disabled={!!formData.taux}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Taux (%)"
            type="number"
            value={formData.taux}
            onChange={(e) => handleChange('taux', e.target.value)}
            error={Boolean(errors.taux)}
            helperText={errors.taux || "Pourcentage à appliquer au montant total"}
            InputProps={{
              endAdornment: <InputAdornment position="end"><Percent /></InputAdornment>,
              inputProps: { min: 0, max: 100, step: 0.01 }
            }}
            disabled={!!formData.montant_fixe}
          />
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info" sx={{ mt: 1 }}>
            <Typography variant="body2">
              Utilisez soit un montant fixe, soit un pourcentage. Le pourcentage sera appliqué au montant total lors de l'utilisation du modèle.
            </Typography>
          </Alert>
        </Grid>
      </Grid>

      <DialogActions sx={{ mt: 3, px: 0 }}>
        <Button onClick={onCancel} color="inherit">
          Annuler
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {ligne ? 'Modifier' : 'Ajouter'}
        </Button>
      </DialogActions>
    </Box>
  );
}