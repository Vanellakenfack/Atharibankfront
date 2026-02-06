import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Alert,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Autocomplete
} from "@mui/material";
import {
  Savings,
  Save,
  ArrowBack,
  AttachMoney,
  Person,
  Upload,
  Close
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { debounce } from "lodash";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";
import agenceService from "../../services/agenceService";
import gestionnaireService from "../../services/gestionnaireService/gestionnaireApi";

export default function EpargneJournaliereCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [loadingGestionnaires, setLoadingGestionnaires] = useState(false);
  const [loadingCollecteurs, setLoadingCollecteurs] = useState(false);
  const [loadingEpargne, setLoadingEpargne] = useState(false);
  
  const [agences, setAgences] = useState([]);
  const [comptesCollecteurs, setComptesCollecteurs] = useState([]);
  const [comptesEpargne, setComptesEpargne] = useState([]);
  const [gestionnaires, setGestionnaires] = useState([]);
  
  const [uploadDialog, setUploadDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [justificatif, setJustificatif] = useState(null);
  
  const [searchGestionnaire, setSearchGestionnaire] = useState('');
  const [searchCollecteur, setSearchCollecteur] = useState('');
  const [searchEpargne, setSearchEpargne] = useState('');
  
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const steps = ['Informations de base', 'Comptes & montant', 'Validation'];

  const validationSchema = Yup.object({
    agence_id: Yup.string().required("L'agence est requise"),
    date_operation: Yup.date().required("La date d'opération est requise"),
    montant: Yup.number()
      .required("Le montant est requis")
      .min(0.01, "Le montant doit être supérieur à 0"),
    compte_collecteur_id: Yup.string().required("Le compte collecteur est requis"),
    compte_epargne_id: Yup.string().required("Le compte épargne est requis"),
    numero_guichet: Yup.string().required("Le numéro de guichet est requis"),
    numero_bordereau: Yup.string().required("Le numéro de bordereau est requis"),
    nom_agent: Yup.string().required("Le nom de l'agent est requis")
  });

  const formik = useFormik({
    initialValues: {
      agence_id: '',
      date_operation: new Date().toISOString().split('T')[0],
      date_valeur: new Date().toISOString().split('T')[0],
      date_comptable: new Date().toISOString().split('T')[0],
      montant: '',
      compte_collecteur_id: '',
      compte_epargne_id: '',
      est_bloque: false,
      numero_guichet: '',
      numero_bordereau: '',
      nom_agent: '',
      reference_client: '',
      description: '',
      devise: 'FCFA',
      libelle: 'Collecte Épargne Journalière'
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const requestData = {
          agence_id: values.agence_id,
          date_operation: values.date_operation,
          montant: parseFloat(values.montant),
          compte_collecteur_id: values.compte_collecteur_id,
          compte_epargne_id: values.compte_epargne_id,
          est_bloque: values.est_bloque ? 1 : 0,
          numero_guichet: values.numero_guichet,
          numero_bordereau: values.numero_bordereau,
          nom_agent: values.nom_agent,
          reference_client: values.reference_client || '',
          description: values.description || '',
          devise: values.devise,
          date_valeur: values.date_valeur,
          date_comptable: values.date_comptable
        };

        if (justificatif) {
          const formData = new FormData();
          Object.keys(requestData).forEach(key => {
            let value = requestData[key];
            if (key === 'est_bloque') {
              value = value ? '1' : '0';
            }
            formData.append(key, value);
          });
          formData.append('justificatif', justificatif);

          const response = await ApiClient.post('/operation-diverses/epargne-journaliere', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (response.data.success) {
            showSnackbar('OD Épargne Journalière créée avec succès !', 'success');
            setTimeout(() => navigate('/ChoicePageOd'), 1500);
          } else {
            showSnackbar(response.data.message, 'error');
          }
        } else {
          const response = await ApiClient.post('/operation-diverses/epargne-journaliere', requestData);
          
          if (response.data.success) {
            showSnackbar('OD Épargne Journalière créée avec succès !', 'success');
            setTimeout(() => navigate('/ChoicePageOd'), 1500);
          } else {
            showSnackbar(response.data.message, 'error');
          }
        }
      } catch (error) {
        console.error('Erreur:', error.response?.data || error);
        showSnackbar(
          error.response?.data?.message || 'Erreur lors de la création', 
          'error'
        );
      } finally {
        setLoading(false);
      }
    }
  });

  // Fonction pour trouver l'agent sélectionné
  const getSelectedAgent = () => {
    if (!formik.values.nom_agent) return null;
    
    if (selectedAgent && selectedAgent.nom_complet === formik.values.nom_agent) {
      return selectedAgent;
    }
    
    const found = gestionnaires.find(g => {
      const nomComplet = g.nom_complet || `${g.gestionnaire_prenom} ${g.gestionnaire_nom}`;
      return nomComplet === formik.values.nom_agent || g.nom === formik.values.nom_agent;
    });
    
    return found || null;
  };

  // Fonction de recherche débourrée pour les gestionnaires
  const searchGestionnairesDebounced = useCallback(
    debounce(async (searchTerm) => {
      try {
        setLoadingGestionnaires(true);
        
        if (!searchTerm || searchTerm.length < 2) {
          if (formik.values.agence_id) {
            await loadGestionnairesByAgence(formik.values.agence_id);
          } else {
            const response = await gestionnaireService.getAllGestionnaires(1, 50);
            if (response.success) {
              const formattedGestionnaires = response.data.map(g => ({
                id: g.id,
                nom: `${g.gestionnaire_prenom} ${g.gestionnaire_nom}`.trim(),
                code: g.gestionnaire_code,
                nom_complet: g.nom_complet || `${g.gestionnaire_prenom} ${g.gestionnaire_nom}`,
                agence: g.agence?.name || g.agence?.agency_name,
                label: `${g.gestionnaire_code} - ${g.gestionnaire_prenom} ${g.gestionnaire_nom}`,
                value: g.id,
                gestionnaire_prenom: g.gestionnaire_prenom,
                gestionnaire_nom: g.gestionnaire_nom
              }));
              setGestionnaires(formattedGestionnaires);
            }
          }
          return;
        }

        const response = await gestionnaireService.getAllGestionnaires(1, 20, searchTerm);
        
        if (response.success) {
          const formattedGestionnaires = response.data.map(g => ({
            id: g.id,
            nom: `${g.gestionnaire_prenom} ${g.gestionnaire_nom}`.trim(),
            code: g.gestionnaire_code,
            nom_complet: g.nom_complet || `${g.gestionnaire_prenom} ${g.gestionnaire_nom}`,
            agence: g.agence?.name || g.agence?.agency_name,
            label: `${g.gestionnaire_code} - ${g.gestionnaire_prenom} ${g.gestionnaire_nom}`,
            value: g.id,
            gestionnaire_prenom: g.gestionnaire_prenom,
            gestionnaire_nom: g.gestionnaire_nom
          }));
          setGestionnaires(formattedGestionnaires);
        }
      } catch (error) {
        console.error('Erreur recherche gestionnaires:', error);
        showSnackbar('Erreur lors de la recherche des gestionnaires', 'error');
      } finally {
        setLoadingGestionnaires(false);
      }
    }, 500),
    [formik.values.agence_id]
  );

  // Fonction de recherche pour les comptes collecteurs
  const searchCollecteursDebounced = useCallback(
    debounce(async (searchTerm) => {
      try {
        setLoadingCollecteurs(true);
        const response = await ApiClient.get('/operation-diverses/comptes/collecteurs', {
          params: { search: searchTerm }
        });
        
        if (response.data.success) {
          setComptesCollecteurs(response.data.data.map(c => ({
            ...c,
            label: `${c.code} - ${c.libelle}`,
            value: c.id
          })));
        }
      } catch (error) {
        console.error('Erreur recherche collecteurs:', error);
      } finally {
        setLoadingCollecteurs(false);
      }
    }, 500),
    []
  );

  // Fonction de recherche pour les comptes épargne
  const searchEpargneDebounced = useCallback(
    debounce(async (searchTerm) => {
      try {
        setLoadingEpargne(true);
        const response = await ApiClient.get('/operation-diverses/comptes/epargne-journaliere', {
          params: { search: searchTerm }
        });
        
        if (response.data.success) {
          setComptesEpargne(response.data.data.map(c => ({
            ...c,
            label: `${c.code} - ${c.libelle}`,
            value: c.id
          })));
        }
      } catch (error) {
        console.error('Erreur recherche comptes épargne:', error);
      } finally {
        setLoadingEpargne(false);
      }
    }, 500),
    []
  );

  // Charger les données initiales
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Charger les agences
      setLoadingAgences(true);
      const agencesData = await agenceService.getAgences();
      
      const formattedAgences = agencesData.map(agence => ({
        id: agence.id,
        nom: agence.name,
        code: agence.code,
        label: `${agence.code} - ${agence.name}`,
        value: agence.id
      }));
      
      setAgences(formattedAgences);
      
      // Charger les gestionnaires initiaux
      setLoadingGestionnaires(true);
      const gestionnairesResponse = await gestionnaireService.getAllGestionnaires(1, 50);
      if (gestionnairesResponse.success) {
        const formattedGestionnaires = gestionnairesResponse.data.map(g => ({
          id: g.id,
          nom: `${g.gestionnaire_prenom} ${g.gestionnaire_nom}`.trim(),
          code: g.gestionnaire_code,
          nom_complet: g.nom_complet || `${g.gestionnaire_prenom} ${g.gestionnaire_nom}`,
          agence: g.agence?.name || g.agence?.agency_name,
          label: `${g.gestionnaire_code} - ${g.gestionnaire_prenom} ${g.gestionnaire_nom}`,
          value: g.id,
          gestionnaire_prenom: g.gestionnaire_prenom,
          gestionnaire_nom: g.gestionnaire_nom
        }));
        setGestionnaires(formattedGestionnaires);
      }
      
      // Charger les autres données
      const [collecteursRes, epargneRes] = await Promise.all([
        ApiClient.get('/operation-diverses/comptes/collecteurs'),
        ApiClient.get('/operation-diverses/comptes/epargne-journaliere')
      ]);

      if (collecteursRes.data.success) {
        setComptesCollecteurs(collecteursRes.data.data.map(c => ({
          ...c,
          label: `${c.code} - ${c.libelle}`,
          value: c.id
        })));
      }
      
      if (epargneRes.data.success) {
        setComptesEpargne(epargneRes.data.data.map(c => ({
          ...c,
          label: `${c.code} - ${c.libelle}`,
          value: c.id
        })));
      }
      
      showSnackbar('Données chargées avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showSnackbar(
        error.message || 'Erreur lors du chargement des données', 
        'error'
      );
    } finally {
      setLoadingAgences(false);
      setLoadingGestionnaires(false);
      setLoadingCollecteurs(false);
      setLoadingEpargne(false);
    }
  };

  // Charger les gestionnaires quand l'agence change
  useEffect(() => {
    if (formik.values.agence_id) {
      loadGestionnairesByAgence(formik.values.agence_id);
    } else {
      loadAllGestionnaires();
    }
  }, [formik.values.agence_id]);

  const loadGestionnairesByAgence = async (agenceId) => {
    try {
      setLoadingGestionnaires(true);
      const response = await gestionnaireService.getGestionnairesByAgence(agenceId);
      
      if (response.success) {
        const formattedGestionnaires = response.data.map(g => ({
          id: g.id,
          nom: `${g.gestionnaire_prenom} ${g.gestionnaire_nom}`.trim(),
          code: g.gestionnaire_code,
          nom_complet: g.nom_complet || `${g.gestionnaire_prenom} ${g.gestionnaire_nom}`,
          agence: g.agence?.name || g.agence?.agency_name,
          label: `${g.gestionnaire_code} - ${g.gestionnaire_prenom} ${g.gestionnaire_nom}`,
          value: g.id,
          gestionnaire_prenom: g.gestionnaire_prenom,
          gestionnaire_nom: g.gestionnaire_nom
        }));
        setGestionnaires(formattedGestionnaires);
      }
    } catch (error) {
      console.error('Erreur chargement gestionnaires par agence:', error);
      await loadAllGestionnaires();
    } finally {
      setLoadingGestionnaires(false);
    }
  };

  const loadAllGestionnaires = async () => {
    try {
      setLoadingGestionnaires(true);
      const response = await gestionnaireService.getAllGestionnaires(1, 50);
      
      if (response.success) {
        const formattedGestionnaires = response.data.map(g => ({
          id: g.id,
          nom: `${g.gestionnaire_prenom} ${g.gestionnaire_nom}`.trim(),
          code: g.gestionnaire_code,
          nom_complet: g.nom_complet || `${g.gestionnaire_prenom} ${g.gestionnaire_nom}`,
          agence: g.agence?.name || g.agence?.agency_name,
          label: `${g.gestionnaire_code} - ${g.gestionnaire_prenom} ${g.gestionnaire_nom}`,
          value: g.id,
          gestionnaire_prenom: g.gestionnaire_prenom,
          gestionnaire_nom: g.gestionnaire_nom
        }));
        setGestionnaires(formattedGestionnaires);
      }
    } catch (error) {
      console.error('Erreur chargement de tous les gestionnaires:', error);
    } finally {
      setLoadingGestionnaires(false);
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

  const handleNext = () => {
    if (activeStep === 0) {
      const errors = {};
      if (!formik.values.agence_id) errors.agence_id = 'Requis';
      if (!formik.values.date_operation) errors.date_operation = 'Requis';
      if (!formik.values.numero_guichet) errors.numero_guichet = 'Requis';
      if (!formik.values.numero_bordereau) errors.numero_bordereau = 'Requis';
      if (!formik.values.nom_agent) errors.nom_agent = 'Requis';
      
      if (Object.keys(errors).length > 0) {
        formik.setErrors(errors);
        return;
      }
    } else if (activeStep === 1) {
      const errors = {};
      if (!formik.values.montant || formik.values.montant <= 0) errors.montant = 'Requis';
      if (!formik.values.compte_collecteur_id) errors.compte_collecteur_id = 'Requis';
      if (!formik.values.compte_epargne_id) errors.compte_epargne_id = 'Requis';
      
      if (Object.keys(errors).length > 0) {
        formik.setErrors(errors);
        return;
      }
    }
    
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleJustificatifChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('Le fichier est trop volumineux (max 5MB)', 'error');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) {
        showSnackbar('Format de fichier non supporté (JPEG, PNG, PDF uniquement)', 'error');
        return;
      }
      setJustificatif(file);
      showSnackbar('Fichier sélectionné avec succès', 'success');
    }
  };

  return (
    <Layout>
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/ChoicePageOd')} sx={{ mb: 2, minWidth: 150 }}>
              Retour
            </Button>
            <Typography variant="h4" fontWeight="700" sx={{ display: 'flex', alignItems: 'center' }}>
              <Savings sx={{ mr: 2, color: '#2196f3' }} />
              Nouvelle OD - Épargne Journalière
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Saisie des collectes d'épargne journalière
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0' }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>

            <Divider sx={{ mb: 4 }} />

            {activeStep === 0 && (
              <Grid container spacing={3}>
                {/* Agence - Autocomplete */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={agences}
                    value={agences.find(a => a.id === formik.values.agence_id) || null}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('agence_id', newValue?.id || '');
                    }}
                    onBlur={formik.handleBlur}
                    loading={loadingAgences}
                    getOptionLabel={(option) => option.label || ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Agence *"
                        error={formik.touched.agence_id && Boolean(formik.errors.agence_id)}
                        helperText={formik.touched.agence_id && formik.errors.agence_id}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingAgences ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    sx={{ minWidth: 250 }}
                  />
                </Grid>

                {/* Numéro de guichet */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Numéro de guichet *"
                    name="numero_guichet"
                    value={formik.values.numero_guichet}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.numero_guichet && Boolean(formik.errors.numero_guichet)}
                    helperText={formik.touched.numero_guichet && formik.errors.numero_guichet}
                    sx={{ minWidth: 250 }}
                  />
                </Grid>

                {/* Date d'opération */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date d'opération *"
                    type="date"
                    name="date_operation"
                    value={formik.values.date_operation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    InputLabelProps={{ shrink: true }}
                    error={formik.touched.date_operation && Boolean(formik.errors.date_operation)}
                    helperText={formik.touched.date_operation && formik.errors.date_operation}
                    sx={{ minWidth: 250 }}
                  />
                </Grid>

                {/* Numéro de bordereau */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Numéro de bordereau *"
                    name="numero_bordereau"
                    value={formik.values.numero_bordereau}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.numero_bordereau && Boolean(formik.errors.numero_bordereau)}
                    helperText={formik.touched.numero_bordereau && formik.errors.numero_bordereau}
                    sx={{ minWidth: 250 }}
                  />
                </Grid>

                {/* Agent (Gestionnaire) - Autocomplete */}
                <Grid item xs={12}>
                  <Autocomplete
                    options={gestionnaires}
                    value={getSelectedAgent()}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setSelectedAgent(newValue);
                        const nomComplet = newValue.nom_complet || 
                                         `${newValue.gestionnaire_prenom} ${newValue.gestionnaire_nom}`;
                        formik.setFieldValue('nom_agent', nomComplet);
                      } else {
                        setSelectedAgent(null);
                        formik.setFieldValue('nom_agent', '');
                      }
                    }}
                    onInputChange={(event, newInputValue) => {
                      setSearchGestionnaire(newInputValue);
                      searchGestionnairesDebounced(newInputValue);
                    }}
                    onBlur={formik.handleBlur}
                    loading={loadingGestionnaires}
                    getOptionLabel={(option) => {
                      if (!option) return '';
                      return option.nom_complet || 
                             `${option.gestionnaire_prenom} ${option.gestionnaire_nom}` || 
                             option.nom || 
                             option.label || 
                             '';
                    }}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return option.id === value.id;
                    }}
                    filterOptions={(x) => x}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Nom de l'agent *"
                        error={formik.touched.nom_agent && Boolean(formik.errors.nom_agent)}
                        helperText={formik.touched.nom_agent && formik.errors.nom_agent}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
                          endAdornment: (
                            <>
                              {loadingGestionnaires ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        <Box>
                          <Typography variant="body2">
                            {option.nom_complet || `${option.gestionnaire_prenom} ${option.gestionnaire_nom}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Code: {option.code || option.gestionnaire_code} | 
                            Agence: {option.agence || 'Non assigné'}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    sx={{ minWidth: 250 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    {formik.values.agence_id 
                      ? 'Gestionnaires de l\'agence sélectionnée' 
                      : 'Tous les gestionnaires (sélectionnez une agence pour filtrer)'}
                  </Typography>
                </Grid>
              </Grid>
            )}

            {activeStep === 1 && (
              <Grid container spacing={3}>
                {/* Montant */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Montant *"
                    name="montant"
                    type="number"
                    value={formik.values.montant}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.montant && Boolean(formik.errors.montant)}
                    helperText={formik.touched.montant && formik.errors.montant}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                      endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                    }}
                    sx={{ minWidth: 250 }}
                  />
                </Grid>

                {/* Épargne bloquée */}
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.est_bloque}
                        onChange={formik.handleChange}
                        name="est_bloque"
                        color="primary"
                      />
                    }
                    label="Épargne bloquée"
                    sx={{ minWidth: 250 }}
                  />
                </Grid>

                {/* Compte collecteur - Autocomplete */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={comptesCollecteurs}
                    value={comptesCollecteurs.find(c => c.id === formik.values.compte_collecteur_id) || null}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('compte_collecteur_id', newValue?.id || '');
                    }}
                    onInputChange={(event, newInputValue) => {
                      setSearchCollecteur(newInputValue);
                      searchCollecteursDebounced(newInputValue);
                    }}
                    onBlur={formik.handleBlur}
                    loading={loadingCollecteurs}
                    getOptionLabel={(option) => option.label || `${option.code} - ${option.libelle}`}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    filterOptions={(x) => x}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Compte collecteur (468) *"
                        error={formik.touched.compte_collecteur_id && Boolean(formik.errors.compte_collecteur_id)}
                        helperText={formik.touched.compte_collecteur_id && formik.errors.compte_collecteur_id}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingCollecteurs ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        <Box>
                          <Typography variant="body2">
                            {option.code} - {option.libelle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Solde: {option.solde || 'N/A'} {option.devise || 'FCFA'}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    sx={{ minWidth: 250 }}
                  />
                </Grid>

                {/* Compte Épargne Journalière - Autocomplete */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={comptesEpargne}
                    value={comptesEpargne.find(c => c.id === formik.values.compte_epargne_id) || null}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('compte_epargne_id', newValue?.id || '');
                    }}
                    onInputChange={(event, newInputValue) => {
                      setSearchEpargne(newInputValue);
                      searchEpargneDebounced(newInputValue);
                    }}
                    onBlur={formik.handleBlur}
                    loading={loadingEpargne}
                    getOptionLabel={(option) => option.label || `${option.code} - ${option.libelle}`}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    filterOptions={(x) => x}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Compte Épargne Journalière *"
                        error={formik.touched.compte_epargne_id && Boolean(formik.errors.compte_epargne_id)}
                        helperText={formik.touched.compte_epargne_id && formik.errors.compte_epargne_id}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingEpargne ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        <Box>
                          <Typography variant="body2">
                            {option.code} - {option.libelle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Type: {option.type || 'Standard'} | Devise: {option.devise || 'FCFA'}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    sx={{ minWidth: 250 }}
                  />
                </Grid>

                {/* Référence client */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Référence client"
                    name="reference_client"
                    value={formik.values.reference_client}
                    onChange={formik.handleChange}
                    sx={{ minWidth: 250 }}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    multiline
                    rows={2}
                    sx={{ minWidth: 250 }}
                  />
                </Grid>
              </Grid>
            )}

{activeStep === 2 && (
  <Box>
    <Alert severity="info" sx={{ mb: 3 }}>
      <Typography variant="body2">
        <strong>Important :</strong> Validation requise du chef d'agence et du chef comptable.
      </Typography>
    </Alert>

    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Aperçu de l'écriture comptable</Typography>
        
        {/* Header du tableau d'écriture comptable */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 2fr 1fr 1fr',
          gap: 1,
          mb: 2,
          p: 1,
          bgcolor: 'grey.100',
          borderRadius: 1
        }}>
          <Typography variant="subtitle2" fontWeight="bold">N° Compte</Typography>
          <Typography variant="subtitle2" fontWeight="bold">Libellé</Typography>
          <Typography variant="subtitle2" fontWeight="bold" align="right">Débit</Typography>
          <Typography variant="subtitle2" fontWeight="bold" align="right">Crédit</Typography>
        </Box>

        {/* Ligne 1: Compte collecteur (débit) */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 2fr 1fr 1fr',
          gap: 1,
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="body2" fontWeight="medium">
            {comptesCollecteurs.find(c => c.id === formik.values.compte_collecteur_id)?.code || '468XXX'}
          </Typography>
          <Typography variant="body2">
            {comptesCollecteurs.find(c => c.id === formik.values.compte_collecteur_id)?.libelle || 'Compte collecteur'}
          </Typography>
          <Typography variant="body2" align="right" color="error.main" fontWeight="bold">
            {formik.values.montant ? Number(formik.values.montant).toLocaleString('fr-FR') : '0'} FCFA
          </Typography>
          <Typography variant="body2" align="right">-</Typography>
        </Box>

        {/* Ligne 2: Compte Épargne Journalière (crédit) */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 2fr 1fr 1fr',
          gap: 1,
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="body2" fontWeight="medium">
            {comptesEpargne.find(c => c.id === formik.values.compte_epargne_id)?.code || 
             (formik.values.est_bloque ? '372240XX' : '37224000')}
          </Typography>
          <Typography variant="body2">
            {comptesEpargne.find(c => c.id === formik.values.compte_epargne_id)?.libelle || 
             (formik.values.est_bloque ? 'Épargne bloquée' : 'Épargne journalière')}
          </Typography>
          <Typography variant="body2" align="right">-</Typography>
          <Typography variant="body2" align="right" color="success.main" fontWeight="bold">
            {formik.values.montant ? Number(formik.values.montant).toLocaleString('fr-FR') : '0'} FCFA
          </Typography>
        </Box>

        {/* Totaux */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 2fr 1fr 1fr',
          gap: 1,
          p: 1,
          mt: 2,
          bgcolor: 'grey.50',
          borderRadius: 1
        }}>
          <Typography variant="body2" fontWeight="bold">TOTAUX</Typography>
          <Typography variant="body2"></Typography>
          <Typography variant="body2" align="right" fontWeight="bold" color="error.main">
            {formik.values.montant ? Number(formik.values.montant).toLocaleString('fr-FR') : '0'} FCFA
          </Typography>
          <Typography variant="body2" align="right" fontWeight="bold" color="success.main">
            {formik.values.montant ? Number(formik.values.montant).toLocaleString('fr-FR') : '0'} FCFA
          </Typography>
        </Box>

        {/* Informations supplémentaires */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Référence</Typography>
            <Typography variant="body1" fontWeight="medium">
              OD-EJ-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 10000)).padStart(4, '0')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Date d'opération</Typography>
            <Typography variant="body1">
              {new Date(formik.values.date_operation).toLocaleDateString('fr-FR')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Agence</Typography>
            <Typography variant="body1">
              {agences.find(a => a.id === formik.values.agence_id)?.nom || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Agent</Typography>
            <Typography variant="body1">{formik.values.nom_agent}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Type d'épargne</Typography>
            <Typography variant="body1" fontWeight="medium">
              {formik.values.est_bloque ? 'Épargne bloquée' : 'Épargne journalière'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Bordereau</Typography>
            <Typography variant="body1">{formik.values.numero_bordereau || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Description</Typography>
            <Typography variant="body1">
              {formik.values.description || 'Collecte épargne journalière'}
            </Typography>
          </Grid>
        </Grid>

        {/* Explication de l'écriture */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Écriture comptable :</strong> Débit du compte collecteur (468) et crédit du compte épargne journalière (37224000-37224012)
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Comptes d'épargne :</strong> 
            {formik.values.est_bloque 
              ? ' 37224000 (bloquée) à 37224012 (bloquée)' 
              : ' 37224000 (journalière) à 37224012 (journalière)'}
          </Typography>
        </Alert>
      </CardContent>
    </Card>

    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom>Justificatif (optionnel)</Typography>
      <Button
        variant="outlined"
        startIcon={<Upload />}
        onClick={() => setUploadDialog(true)}
        sx={{ mr: 2, minWidth: 250 }}
      >
        {justificatif ? 'Changer le fichier' : 'Ajouter un justificatif'}
      </Button>
      {justificatif && (
        <Typography variant="body2" color="text.secondary">
          {justificatif.name}
        </Typography>
      )}
    </Box>
  </Box>
)}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
                sx={{ minWidth: 150 }}
              >
                Retour
              </Button>

              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={formik.handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    sx={{ minWidth: 200 }}
                  >
                    {loading ? 'Création...' : 'Créer l\'OD'}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext} sx={{ minWidth: 150 }}>
                    Suivant
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, mt: 4, borderRadius: 4, bgcolor: '#e3f2fd' }}>
            <Typography variant="h6" gutterBottom>📝 Processus Épargne Journalière</Typography>
            <Typography variant="body2" paragraph>
              <strong>À la caisse :</strong> Débit caisse (57) → Crédit compte collecteur agent (468)
            </Typography>
            <Typography variant="body2">
              <strong>À la comptabilité :</strong> Débit compte collecteur (468) → Crédit compte épargne journalière (37224000 à 37224012)
            </Typography>
          </Paper>
        </Container>
      </Box>

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

      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)}>
        <DialogTitle>Ajouter un justificatif</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Formats acceptés : PDF, JPG, PNG (max 5MB)
          </Typography>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<Upload />}
            sx={{ mt: 2, minWidth: 250 }}
          >
            Choisir un fichier
            <input
              type="file"
              hidden
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleJustificatifChange}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)} sx={{ minWidth: 100 }}>Annuler</Button>
          <Button onClick={() => setUploadDialog(false)} variant="contained" sx={{ minWidth: 100 }}>
            Valider
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}