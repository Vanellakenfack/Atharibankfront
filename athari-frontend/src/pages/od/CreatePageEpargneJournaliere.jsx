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
  Autocomplete,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormHelperText
} from "@mui/material";
import {
  Savings,
  Save,
  ArrowBack,
  AttachMoney,
  Person,
  Upload,
  Close,
  AddCircle,
  Delete,
  AccountBalance,
  Group,
  Receipt,
  EmojiEvents
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { debounce } from "lodash";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";
import agenceService from "../../services/agenceService";
import gestionnaireService from "../../services/gestionnaireService/gestionnaireApi";

const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export default function EpargneClientsCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [loadingGestionnaires, setLoadingGestionnaires] = useState(false);
  const [loadingCollecteurs, setLoadingCollecteurs] = useState(false);
  const [loadingEpargne, setLoadingEpargne] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  
  const [agences, setAgences] = useState([]);
  const [comptesCollecteurs, setComptesCollecteurs] = useState([]);
  const [comptesEpargne, setComptesEpargne] = useState([]);
  const [comptesClients, setComptesClients] = useState([]);
  const [gestionnaires, setGestionnaires] = useState([]);
  
  const [uploadDialog, setUploadDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [justificatif, setJustificatif] = useState(null);
  
  const [searchGestionnaire, setSearchGestionnaire] = useState('');
  const [searchCollecteur, setSearchCollecteur] = useState('');
  const [searchEpargne, setSearchEpargne] = useState('');
  const [searchClient, setSearchClient] = useState('');
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // États pour la gestion dynamique des comptes
  const [comptesCollecteursList, setComptesCollecteursList] = useState([{ compte_id: "", montant: "" }]);
  const [comptesClientsList, setComptesClientsList] = useState([{ compte_client_id: "", montant: "" }]);
  const [montantTotal, setMontantTotal] = useState(0);
  const [selectedCompteEpargne, setSelectedCompteEpargne] = useState(null);

  const [selectedAgent, setSelectedAgent] = useState(null);

  const steps = ['Informations de base', 'Comptes collecteurs', 'Répartition clients', 'Validation'];

  // Fonctions pour gérer les comptes collecteurs
  const handleAddCompteCollecteur = () => {
    setComptesCollecteursList([...comptesCollecteursList, { compte_id: "", montant: "" }]);
  };

  const handleRemoveCompteCollecteur = (index) => {
    if (comptesCollecteursList.length > 1) {
      setComptesCollecteursList(comptesCollecteursList.filter((_, i) => i !== index));
    }
  };

  const handleCompteCollecteurChange = (index, field, value) => {
    const newComptesCollecteurs = [...comptesCollecteursList];
    newComptesCollecteurs[index][field] = value;
    setComptesCollecteursList(newComptesCollecteurs);
  };

  // Fonctions pour gérer les comptes clients
  const handleAddCompteClient = () => {
    setComptesClientsList([...comptesClientsList, { compte_client_id: "", montant: "" }]);
  };

  const handleRemoveCompteClient = (index) => {
    if (comptesClientsList.length > 1) {
      setComptesClientsList(comptesClientsList.filter((_, i) => i !== index));
    }
  };

  const handleCompteClientChange = (index, field, value) => {
    const newComptesClients = [...comptesClientsList];
    newComptesClients[index][field] = value;
    setComptesClientsList(newComptesClients);
  };

  // Calculer le montant total
  useEffect(() => {
    const totalCollecteurs = comptesCollecteursList.reduce((sum, item) => {
      return sum + (Number(item.montant) || 0);
    }, 0);
    
    const totalClients = comptesClientsList.reduce((sum, item) => {
      return sum + (Number(item.montant) || 0);
    }, 0);
    
    setMontantTotal(totalCollecteurs);
    formik.setFieldValue('montant', totalCollecteurs);
  }, [comptesCollecteursList, comptesClientsList]);

  // Charger les clients quand un compte Épargne est sélectionné
  useEffect(() => {
    if (selectedCompteEpargne) {
      loadClientsParCompteEpargne(selectedCompteEpargne.id);
    } else {
      setComptesClients([]);
    }
  }, [selectedCompteEpargne]);

const loadClientsParCompteEpargne = async (compteEpargneId) => {
  try {
    setLoadingClients(true);
    console.log('🔍 Début chargement clients pour le compte épargne ID:', compteEpargneId);
    console.log('📊 Compte épargne sélectionné:', selectedCompteEpargne);
    
    const response = await ApiClient.get(`/operation-diverses/comptes/epargne/${compteEpargneId}/clients`);
    
    // DIAGNOSTIC COMPLET
    console.log('📥 RESPONSE COMPLETE:', response);
    console.log('📥 response.data:', response.data);
    console.log('📥 response.data.success:', response.data?.success);
    console.log('📥 response.data.data:', response.data?.data);
    console.log('📥 response.data.message:', response.data?.message);
    console.log('📥 response.status:', response.status);
    console.log('📥 response.headers:', response.headers);
    
    // Vérifier si response.data.data existe et est un tableau
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log('✅ Données clients reçues (tableau):', response.data.data);
      console.log('📊 Nombre de clients:', response.data.data.length);
      
      setComptesClients(response.data.data.map(c => ({
        ...c,
        label: `${c.client_nom} - ${c.numero_compte} - ${c.libelle}`,
        value: c.id
      })));
    } 
    // Si la structure est différente (peut-être les données sont directement dans response.data)
    else if (response.data && Array.isArray(response.data)) {
      console.log('✅ Données clients reçues (directement dans response.data):', response.data);
      setComptesClients(response.data.map(c => ({
        ...c,
        label: `${c.client_nom} - ${c.numero_compte} - ${c.libelle}`,
        value: c.id
      })));
    }
    // Si les données sont dans response.data.clients ou autre propriété
    else if (response.data && response.data.clients && Array.isArray(response.data.clients)) {
      console.log('✅ Données clients reçues (dans response.data.clients):', response.data.clients);
      setComptesClients(response.data.clients.map(c => ({
        ...c,
        label: `${c.client_nom} - ${c.numero_compte} - ${c.libelle}`,
        value: c.id
      })));
    }
    else {
      console.error('❌ Structure de réponse inattendue:', response.data);
      showSnackbar('Format de réponse API inattendu', 'error');
      setComptesClients([]);
    }
    
  } catch (error) {
    console.error('❌ Erreur chargement clients:', error);
    console.error('Détails erreur:', error.response?.data || error.message);
    showSnackbar('Erreur lors du chargement des comptes clients', 'error');
    setComptesClients([]);
  } finally {
    setLoadingClients(false);
  }
};

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      agence_id: '',
      date_operation: new Date().toISOString().split('T')[0],
      date_valeur: new Date().toISOString().split('T')[0],
      date_comptable: new Date().toISOString().split('T')[0],
      montant: '',
      compte_epargne_id: '',
      est_bloque: false,
      numero_guichet: '',
      numero_bordereau: '',
      nom_agent: '',
      reference_client: '',
      description: '',
      devise: 'FCFA',
      libelle: 'Collecte Épargne Journalière - Répartition clients'
    },
    validationSchema: Yup.object({
      agence_id: Yup.string().required("L'agence est requise"),
      date_operation: Yup.date().required("La date d'opération est requise"),
      montant: Yup.number()
        .required("Le montant est requis")
        .min(0.01, "Le montant doit être supérieur à 0"),
      compte_epargne_id: Yup.string().required("Le compte Épargne est requis"),
      numero_guichet: Yup.string().required("Le numéro de guichet est requis"),
      numero_bordereau: Yup.string().required("Le numéro de bordereau est requis"),
      nom_agent: Yup.string().required("Le nom de l'agent est requis")
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Vérifier l'équilibre
        const totalCollecteurs = comptesCollecteursList.reduce((sum, item) => sum + (Number(item.montant) || 0), 0);
        const totalClients = comptesClientsList.reduce((sum, item) => sum + (Number(item.montant) || 0), 0);

        if (Math.abs(totalCollecteurs - totalClients) > 0.01) {
          showSnackbar('Les totaux collecteurs et crédits clients ne sont pas équilibrés', 'error');
          setLoading(false);
          return;
        }

        // Préparer les données
        const comptesCollecteursFormatted = comptesCollecteursList
          .filter(item => item.compte_id && item.montant)
          .map(item => ({
            compte_id: item.compte_id,
            montant: parseFloat(item.montant)
          }));

        const comptesClientsFormatted = comptesClientsList
          .filter(item => item.compte_client_id && item.montant)
          .map(item => ({
            compte_client_id: item.compte_client_id,
            montant: parseFloat(item.montant)
          }));

        const requestData = {
          agence_id: values.agence_id,
          date_operation: values.date_operation,
          date_valeur: values.date_valeur,
          date_comptable: values.date_comptable,
          montant: parseFloat(values.montant),
          comptes_collecteurs: comptesCollecteursFormatted,
          compte_epargne_id: values.compte_epargne_id,
          comptes_clients: comptesClientsFormatted,
          est_bloque: values.est_bloque,
          numero_guichet: values.numero_guichet,
          numero_bordereau: values.numero_bordereau,
          nom_agent: values.nom_agent,
          reference_client: values.reference_client || '',
          description: values.description || '',
          devise: values.devise,
          libelle: values.libelle
        };

        // Convertir le fichier en base64 si présent
        if (justificatif) {
          const base64File = await convertFileToBase64(justificatif);
          requestData.justificatif_base64 = base64File;
          requestData.justificatif_filename = justificatif.name;
          requestData.justificatif_mime_type = justificatif.type;
        }

        const response = await ApiClient.post('/operation-diverses/epargne-journaliere-avec-clients', requestData, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.data.success) {
          showSnackbar('OD Épargne Journalière avec répartition clients créée avec succès !', 'success');
          setTimeout(() => navigate('/ChoicePageOd'), 1500);
        } else {
          showSnackbar(response.data.message, 'error');
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

  // Recherches debounced
  const searchGestionnairesDebounced = useCallback(
    debounce(async (searchTerm) => {
      try {
        setLoadingGestionnaires(true);
        if (!searchTerm || searchTerm.length < 2) {
          if (formik.values.agence_id) {
            await loadGestionnairesByAgence(formik.values.agence_id);
          }
          return;
        }
        const response = await gestionnaireService.getAllGestionnaires(1, 20, searchTerm);
        if (response.success) {
          setGestionnaires(formatGestionnaires(response.data));
        }
      } catch (error) {
        console.error('Erreur recherche gestionnaires:', error);
      } finally {
        setLoadingGestionnaires(false);
      }
    }, 500),
    [formik.values.agence_id]
  );

  const searchCollecteursDebounced = useCallback(
    debounce(async (searchTerm) => {
      try {
        setLoadingCollecteurs(true);
        const response = await ApiClient.get('/operation-diverses/comptes/collecteurs', {
          params: { search: searchTerm }
        });
        if (response.data.success) {
          setComptesCollecteurs(formatComptes(response.data.data));
        }
      } catch (error) {
        console.error('Erreur recherche collecteurs:', error);
      } finally {
        setLoadingCollecteurs(false);
      }
    }, 500),
    []
  );

  const searchEpargneDebounced = useCallback(
    debounce(async (searchTerm) => {
      try {
        setLoadingEpargne(true);
        const response = await ApiClient.get('/operation-diverses/comptes/epargne-journaliere', {
          params: { search: searchTerm }
        });
        if (response.data.success) {
          setComptesEpargne(formatComptes(response.data.data));
        }
      } catch (error) {
        console.error('Erreur recherche épargne:', error);
      } finally {
        setLoadingEpargne(false);
      }
    }, 500),
    []
  );

  const searchClientsDebounced = useCallback(
    debounce(async (searchTerm) => {
      if (selectedCompteEpargne) {
        await loadClientsParCompteEpargne(selectedCompteEpargne.id);
      }
    }, 500),
    [selectedCompteEpargne]
  );

  // Formateurs
  const formatGestionnaires = (data) => {
    return data.map(g => ({
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
  };

  const formatComptes = (data) => {
    return data.map(c => ({
      ...c,
      label: `${c.code} - ${c.libelle}`,
      value: c.id
    }));
  };

  // Chargement initial
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoadingAgences(true);
      const agencesData = await agenceService.getAgences();
      setAgences(agencesData.map(a => ({
        id: a.id,
        nom: a.name,
        code: a.code,
        label: `${a.code} - ${a.name}`,
        value: a.id
      })));

      const [collecteursRes, epargneRes] = await Promise.all([
        ApiClient.get('/operation-diverses/comptes/collecteurs'),
        ApiClient.get('/operation-diverses/comptes/epargne-journaliere')
      ]);

      if (collecteursRes.data.success) {
        setComptesCollecteurs(formatComptes(collecteursRes.data.data));
      }
      
      if (epargneRes.data.success) {
        setComptesEpargne(formatComptes(epargneRes.data.data));
      }
      
      await loadAllGestionnaires();
      
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
    } finally {
      setLoadingAgences(false);
    }
  };

  const loadGestionnairesByAgence = async (agenceId) => {
    try {
      setLoadingGestionnaires(true);
      const response = await gestionnaireService.getGestionnairesByAgence(agenceId);
      if (response.success) {
        setGestionnaires(formatGestionnaires(response.data));
      }
    } catch (error) {
      console.error('Erreur:', error);
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
        setGestionnaires(formatGestionnaires(response.data));
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoadingGestionnaires(false);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const getSelectedAgent = () => {
    if (!formik.values.nom_agent) return null;
    if (selectedAgent && selectedAgent.nom_complet === formik.values.nom_agent) {
      return selectedAgent;
    }
    return gestionnaires.find(g => 
      g.nom_complet === formik.values.nom_agent || 
      g.nom === formik.values.nom_agent
    ) || null;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      const errors = {};
      if (!formik.values.agence_id) errors.agence_id = 'Requis';
      if (!formik.values.date_operation) errors.date_operation = 'Requis';
      if (!formik.values.numero_guichet) errors.numero_guichet = 'Requis';
      if (!formik.values.numero_bordereau) errors.numero_bordereau = 'Requis';
      if (!formik.values.nom_agent) errors.nom_agent = 'Requis';
      if (!formik.values.compte_epargne_id) errors.compte_epargne_id = 'Requis';
      
      if (Object.keys(errors).length > 0) {
        formik.setErrors(errors);
        return;
      }
    } else if (activeStep === 1) {
      // Validation des comptes collecteurs
      let hasError = false;
      comptesCollecteursList.forEach((item, index) => {
        if (!item.compte_id) {
          showSnackbar(`Compte collecteur ${index + 1} requis`, 'error');
          hasError = true;
        }
        if (!item.montant || Number(item.montant) <= 0) {
          showSnackbar(`Montant collecteur ${index + 1} invalide`, 'error');
          hasError = true;
        }
      });
      if (hasError) return;
    } else if (activeStep === 2) {
      // Validation des comptes clients
      let hasError = false;
      let totalClients = 0;
      
      comptesClientsList.forEach((item, index) => {
        if (!item.compte_client_id) {
          showSnackbar(`Compte client ${index + 1} requis`, 'error');
          hasError = true;
        }
        if (!item.montant || Number(item.montant) <= 0) {
          showSnackbar(`Montant client ${index + 1} invalide`, 'error');
          hasError = true;
        }
        totalClients += Number(item.montant) || 0;
      });
      
      if (hasError) return;
      
      if (Math.abs(montantTotal - totalClients) > 0.01) {
        showSnackbar(`Le total des crédits clients (${totalClients.toLocaleString()} FCFA) doit être égal au total collecteurs (${montantTotal.toLocaleString()} FCFA)`, 'error');
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

  const getCompteIntitule = (compteId, type) => {
    if (!compteId) return "...";
    
    if (type === 'collecteur') {
      const collecteur = comptesCollecteurs.find(c => c.id === compteId);
      return collecteur ? `${collecteur.code} - ${collecteur.libelle}` : "...";
    }
    return "...";
  };

  const getClientInfo = (compteClientId) => {
    if (!compteClientId) return null;
    return comptesClients.find(c => c.id === compteClientId) || null;
  };

  return (
    <Layout>
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/ChoicePageOd')} sx={{ mb: 2 }}>
              Retour
            </Button>
            <Typography variant="h4" fontWeight="700" sx={{ display: 'flex', alignItems: 'center' }}>
              <Group sx={{ mr: 2, color: '#4caf50' }} />
              Nouvelle OD - Épargne Journalière avec répartition clients
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Collecte multi-comptes avec crédit direct sur comptes clients d'épargne
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
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Agence *"
                        sx={{ minWidth: 200 }}
                        error={formik.touched.agence_id && Boolean(formik.errors.agence_id)}
                        helperText={formik.touched.agence_id && formik.errors.agence_id}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingAgences ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

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
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date d'opération *"
                    type="date"
                    name="date_operation"
                    value={formik.values.date_operation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled
                    InputLabelProps={{ shrink: true }}
                    error={formik.touched.date_operation && Boolean(formik.errors.date_operation)}
                    helperText={formik.touched.date_operation && formik.errors.date_operation}
                  />
                </Grid>

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
                  />
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    options={gestionnaires}
                    value={getSelectedAgent()}
                    onChange={(event, newValue) => {
                      setSelectedAgent(newValue);
                      formik.setFieldValue('nom_agent', newValue?.nom_complet || '');
                    }}
                    onInputChange={(event, newInputValue) => {
                      setSearchGestionnaire(newInputValue);
                      searchGestionnairesDebounced(newInputValue);
                    }}
                    loading={loadingGestionnaires}
                    getOptionLabel={(option) => option?.nom_complet || ''}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Nom de l'agent *"
                        sx={{ minWidth: 200 }}
                        error={formik.touched.nom_agent && Boolean(formik.errors.nom_agent)}
                        helperText={formik.touched.nom_agent && formik.errors.nom_agent}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
                          endAdornment: (
                            <>
                              {loadingGestionnaires ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
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
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    {formik.values.est_bloque ? "Compte épargne bloquée" : "Compte épargne à vue"}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    options={comptesEpargne}
                    value={comptesEpargne.find(c => c.id === formik.values.compte_epargne_id) || null}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('compte_epargne_id', newValue?.id || '');
                      setSelectedCompteEpargne(newValue);
                    }}
                    onInputChange={(event, newInputValue) => {
                      setSearchEpargne(newInputValue);
                      searchEpargneDebounced(newInputValue);
                    }}
                    loading={loadingEpargne}
                    getOptionLabel={(option) => option?.label || ''}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Compte Épargne Journalière générique *"
                        sx={{ minWidth: 600 }}
                        error={formik.touched.compte_epargne_id && Boolean(formik.errors.compte_epargne_id)}
                        helperText={formik.touched.compte_epargne_id && formik.errors.compte_epargne_id}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <InputAdornment position="start"><AccountBalance /></InputAdornment>,
                          endAdornment: (
                            <>
                              {loadingEpargne ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            )}

            {activeStep === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Comptes Collecteurs (468) - Débit
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddCircle />}
                      onClick={handleAddCompteCollecteur}
                      size="small"
                    >
                      Ajouter un collecteur
                    </Button>
                  </Box>
                  
                  {comptesCollecteursList.map((compteCollecteur, index) => (
                    <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                      <Grid item xs={7}>
                        <Autocomplete
                          options={comptesCollecteurs}
                          getOptionLabel={(option) => option?.label || ''}
                          value={comptesCollecteurs.find(c => c.id === compteCollecteur.compte_id) || null}
                          onChange={(e, newValue) => {
                            handleCompteCollecteurChange(index, "compte_id", newValue?.id || "");
                          }}
                          onInputChange={(event, newInputValue) => {
                            setSearchCollecteur(newInputValue);
                            searchCollecteursDebounced(newInputValue);
                          }}
                          loading={loadingCollecteurs}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={`Compte collecteur ${index + 1}`}
                              sx={{ minWidth: 300 }}
                              error={formik.errors[`collecteur_${index}`]}
                              helperText={formik.errors[`collecteur_${index}`]}
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {loadingCollecteurs ? <CircularProgress size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          label="Montant"
                          type="number"
                          value={compteCollecteur.montant}
                          onChange={(e) => handleCompteCollecteurChange(index, "montant", e.target.value)}
                          error={formik.errors[`collecteur_montant_${index}`]}
                          helperText={formik.errors[`collecteur_montant_${index}`]}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                        {comptesCollecteursList.length > 1 && (
                          <IconButton 
                            color="error" 
                            onClick={() => handleRemoveCompteCollecteur(index)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                  ))}
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total collecteurs
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {montantTotal.toLocaleString()} FCFA
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}

            {activeStep === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      <strong>Crédits clients :</strong> Le montant total des crédits clients 
                      <strong> ({montantTotal.toLocaleString()} FCFA)</strong> doit être réparti entre les comptes clients d'épargne.
                    </Typography>
                  </Alert>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Répartition par comptes clients d'épargne - Crédit
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddCircle />}
                      onClick={handleAddCompteClient}
                      size="small"
                      disabled={!selectedCompteEpargne}
                    >
                      Ajouter un client
                    </Button>
                  </Box>
                  
                  {!selectedCompteEpargne && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Veuillez d'abord sélectionner un compte Épargne générique à l'étape 1.
                    </Alert>
                  )}
                  
                  {comptesClientsList.map((compteClient, index) => {
                    const clientInfo = getClientInfo(compteClient.compte_client_id);
                    
                    return (
                      <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                        <Grid item xs={7}>
                          <Autocomplete
                            options={comptesClients}
                            getOptionLabel={(option) => option?.label || ''}
                            value={comptesClients.find(c => c.id === compteClient.compte_client_id) || null}
                            onChange={(e, newValue) => {
                              handleCompteClientChange(index, "compte_client_id", newValue?.id || "");
                            }}
                            onInputChange={(event, newInputValue) => {
                              setSearchClient(newInputValue);
                              searchClientsDebounced(newInputValue);
                            }}
                            loading={loadingClients}
                            disabled={!selectedCompteEpargne}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                sx={{ minWidth: 250 }}
                                label={`Compte client ${index + 1}`}
                                error={formik.errors[`client_${index}`]}
                                helperText={formik.errors[`client_${index}`]}
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: <InputAdornment position="start"><Receipt /></InputAdornment>,
                                  endAdornment: (
                                    <>
                                      {loadingClients ? <CircularProgress size={20} /> : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <li {...props} key={option.id}>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {option.client_nom}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Compte épargne: {option.numero_compte} | Solde: {option.solde?.toLocaleString()} {option.devise}
                                  </Typography>
                                </Box>
                              </li>
                            )}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            label="Montant à créditer"
                            type="number"
                            value={compteClient.montant}
                            onChange={(e) => handleCompteClientChange(index, "montant", e.target.value)}
                            error={formik.errors[`client_montant_${index}`]}
                            helperText={formik.errors[`client_montant_${index}`]}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                          {comptesClientsList.length > 1 && (
                            <IconButton 
                              color="error" 
                              onClick={() => handleRemoveCompteClient(index)}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </Grid>
                        {clientInfo && (
                          <Grid item xs={12}>
                            <FormHelperText sx={{ ml: 2 }}>
                              Client: {clientInfo.client_nom} | 
                              Code: {clientInfo.client_code} | 
                              Compte: {clientInfo.numero_compte}
                            </FormHelperText>
                          </Grid>
                        )}
                      </Grid>
                    );
                  })}
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Équilibre
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total collecteurs (débit)
                        </Typography>
                        <Typography variant="h6" color="error">
                          {montantTotal.toLocaleString()} FCFA
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total crédits clients
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {comptesClientsList.reduce((sum, item) => sum + (Number(item.montant) || 0), 0).toLocaleString()} FCFA
                        </Typography>
                      </Grid>
                    </Grid>
                    {Math.abs(montantTotal - comptesClientsList.reduce((sum, item) => sum + (Number(item.montant) || 0), 0)) > 0.01 && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Écart de {(montantTotal - comptesClientsList.reduce((sum, item) => sum + (Number(item.montant) || 0), 0)).toLocaleString()} FCFA
                      </Alert>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description (optionnel)"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            )}

            {activeStep === 3 && (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>OD prête à être créée :</strong> Vérifiez les informations ci-dessous avant validation.
                  </Typography>
                </Alert>

                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Écriture comptable détaillée</Typography>
                    
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                          <TableRow>
                            <TableCell><strong>Compte</strong></TableCell>
                            <TableCell><strong>Libellé</strong></TableCell>
                            <TableCell><strong>Détail</strong></TableCell>
                            <TableCell align="right"><strong>Débit (FCFA)</strong></TableCell>
                            <TableCell align="right"><strong>Crédit (FCFA)</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {/* Comptes Collecteurs (Débits) */}
                          {comptesCollecteursList.map((compteCollecteur, index) => {
                            if (!compteCollecteur.compte_id || !compteCollecteur.montant) return null;
                            return (
                              <TableRow key={`collecteur-${index}`} sx={{ bgcolor: '#fff5f5' }}>
                                <TableCell>
                                  <strong>{getCompteIntitule(compteCollecteur.compte_id, 'collecteur').split(' - ')[0]}</strong>
                                </TableCell>
                                <TableCell>{formik.values.libelle}</TableCell>
                                <TableCell>Collecte agent {formik.values.nom_agent}</TableCell>
                                <TableCell align="right">
                                  {Number(compteCollecteur.montant).toLocaleString()}
                                </TableCell>
                                <TableCell align="right">-</TableCell>
                              </TableRow>
                            );
                          })}

                          {/* Compte Épargne générique (Crédit) */}
                          {selectedCompteEpargne && (
                            <TableRow sx={{ bgcolor: '#f8fff5' }}>
                              <TableCell>
                                <strong>{selectedCompteEpargne.code}</strong>
                              </TableCell>
                              <TableCell>{formik.values.libelle}</TableCell>
                              <TableCell>Crédit épargne générique</TableCell>
                              <TableCell align="right">-</TableCell>
                              <TableCell align="right">
                                {montantTotal.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          )}

                          {/* Comptes clients (Crédits - Détail) */}
                          {comptesClientsList.map((compteClient, index) => {
                            const clientInfo = getClientInfo(compteClient.compte_client_id);
                            if (!clientInfo || !compteClient.montant) return null;
                            
                            return (
                              <TableRow key={`client-${index}`} sx={{ bgcolor: '#f0f7fa', fontStyle: 'italic' }}>
                                <TableCell>
                                  {clientInfo.numero_compte}
                                </TableCell>
                                <TableCell colSpan={1}>
                                  Crédit compte épargne client
                                </TableCell>
                                <TableCell>
                                  {clientInfo.client_nom}
                                </TableCell>
                                <TableCell align="right">-</TableCell>
                                <TableCell align="right">
                                  {Number(compteClient.montant).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            );
                          })}

                          {/* Ligne de total */}
                          <TableRow sx={{ bgcolor: '#e0e0e0', fontWeight: 'bold' }}>
                            <TableCell colSpan={3} align="right">
                              <strong>TOTAL</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>{montantTotal.toLocaleString()}</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>{montantTotal.toLocaleString()}</strong>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Grid container spacing={2}>
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
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Clients crédités</Typography>
                        <Box sx={{ mt: 1 }}>
                          {comptesClientsList.map((item, index) => {
                            const clientInfo = getClientInfo(item.compte_client_id);
                            if (!clientInfo) return null;
                            return (
                              <Chip
                                key={index}
                                label={`${clientInfo.client_nom}: ${Number(item.montant).toLocaleString()} FCFA`}
                                size="small"
                                sx={{ mr: 1, mb: 1 }}
                                color="success"
                                variant="outlined"
                              />
                            );
                          })}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>Justificatif (optionnel)</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Upload />}
                    onClick={() => setUploadDialog(true)}
                    sx={{ mr: 2 }}
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

          <Paper elevation={0} sx={{ p: 3, mt: 4, borderRadius: 4, bgcolor: '#e8f5e9' }}>
            <Typography variant="h6" gutterBottom>📝 Processus Épargne Journalière avec répartition clients</Typography>
            <Typography variant="body2" paragraph>
              <strong>Étape 1 :</strong> Débit des comptes collecteurs (468) → Crédit du compte épargne générique (37224xxx)
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Étape 2 (détail) :</strong> Les montants sont automatiquement affectés aux comptes clients d'épargne individuels
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Avantage :</strong> Traçabilité complète - On sait exactement quel montant a été crédité sur quel compte client d'épargne
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip label="Multi-collecteurs → Multi-clients épargne" size="small" sx={{ mr: 1, mb: 1 }} color="primary" />
              <Chip label="Compte épargne générique en crédit" size="small" sx={{ mr: 1, mb: 1 }} />
              <Chip label="Détail par client" size="small" sx={{ mr: 1, mb: 1 }} color="success" />
              <Chip label="Équilibre automatique" size="small" sx={{ mb: 1 }} />
            </Box>
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
            sx={{ mt: 2 }}
          >
            Choisir un fichier
            <input
              type="file"
              hidden
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleJustificatifChange}
            />
          </Button>
          {justificatif && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Fichier sélectionné : <strong>{justificatif.name}</strong>
              </Typography>
              <Typography variant="caption">
                Taille : {(justificatif.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Annuler</Button>
          <Button onClick={() => setUploadDialog(false)} variant="contained">
            Valider
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}