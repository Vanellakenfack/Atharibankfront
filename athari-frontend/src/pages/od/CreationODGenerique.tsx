import React, { useEffect, useState } from "react";
import {
  Box, Button, Paper, Typography, TextField, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  Chip, Stack, IconButton, CircularProgress, Alert, Snackbar,
  InputAdornment, FormHelperText, Autocomplete, Divider, Card, CardContent,
  Tabs, Tab, Switch, FormControlLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip
} from "@mui/material";
import {
  Add, AttachFile, Description, Euro, Close, Upload,
  Receipt, Business, Paid, Event, Assignment, AccountBalance,
  ArrowForward, ArrowBack, Functions, SyncAlt, Delete, AddCircle,  
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import { indigo, green, blue, red, orange } from "@mui/material/colors";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";

interface ComptePlan {
  id: number;
  code: string;
  libelle: string;
}

interface Agency {
  id: number;
  name: string;
  code: string;
}

interface CompteMontant {
  compte_id: number | string;
  montant: number | string;
}

interface ODGeneriqueData {
  agence_id: number | string;
  date_operation: string;
  date_valeur: string;
  date_comptable: string;
  type_operation: string;
  type_collecte: string;
  code_operation: string;
  libelle: string;
  description: string;
  montant_total: number | string;
  devise: string;
  compte_debit_id: number | string;
  comptes_credits: CompteMontant[];
  compte_credit_id: number | string;
  comptes_debits: CompteMontant[];
  sens_operation: "DEBIT" | "CREDIT";
  est_collecte: boolean;
  est_urgence: boolean;
  numero_guichet: string;
  numero_piece: string;
  ref_lettrage: string;
  justificatif_type: string;
  justificatif_numero: string;
  justificatif_date: string;
  reference_client: string;
  nom_tiers: string;
  justificatif_path?: string;
}

interface JustificatifFile {
  file: File | null;
  base64?: string;
}

export default function CreationODGenerique() {

  const navigate = useNavigate();
  

  const [open, setOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agences, setAgences] = useState<Agency[]>([]);
  const [comptesPlan, setComptesPlan] = useState<ComptePlan[]>([]);
  const [justificatifFile, setJustificatifFile] = useState<JustificatifFile>({ file: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [montantTotal, setMontantTotal] = useState<number>(0);

  const [formData, setFormData] = useState<ODGeneriqueData>({
    agence_id: "",
    date_operation: new Date().toISOString().split('T')[0],
    date_valeur: new Date().toISOString().split('T')[0],
    date_comptable: new Date().toISOString().split('T')[0],
    type_operation: "REGULARISATION",
    type_collecte: "AUTRE",
    code_operation: "",
    libelle: "",
    description: "",
    montant_total: "",
    devise: "FCFA",
    compte_debit_id: "",
    comptes_credits: [{ compte_id: "", montant: "" }],
    compte_credit_id: "",
    comptes_debits: [{ compte_id: "", montant: "" }],
    sens_operation: "DEBIT",
    est_collecte: false,
    est_urgence: false,
    numero_guichet: "",
    numero_piece: "",
    ref_lettrage: "",
    justificatif_type: "AUTRE",
    justificatif_numero: "",
    justificatif_date: new Date().toISOString().split('T')[0],
    reference_client: "",
    nom_tiers: ""
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ODGeneriqueData, string>>>({});

  // Types d'opérations disponibles
  const typesOperation = [
    { value: "VIREMENT", label: "Virement" },
    { value: "FRAIS", label: "Frais" },
    { value: "COMMISSION", label: "Commission" },
    { value: "REGULARISATION", label: "Régularisation" },
    { value: "AUTRE", label: "Autre" }
  ];

  // Types de collecte
  const typesCollecte = [
    { value: "MATA_BOOST", label: "MATA BOOST" },
    { value: "EPARGNE_JOURNALIERE", label: "Épargne Journalière" },
    { value: "CHARGE", label: "Charge" },
    { value: "AUTRE", label: "Autre (Générique)" }
  ];

  // Devises
  const devises = ["FCFA", "EURO", "DOLLAR", "POUND"];

  // Types de justificatifs
  const typesJustificatif = [
    { value: "FACTURE", label: "Facture" },
    { value: "QUITTANCE", label: "Quittance" },
    { value: "BON", label: "Bon" },
    { value: "TICKET", label: "Ticket" },
    { value: "AUTRE_VIREMENT", label: "Autre virement" },
    { value: "NOTE_CORRECTION", label: "Note de correction" },
    { value: "AUTRE", label: "Autre" }
  ];

  // Charger les données initiales
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Calculer le montant total
  useEffect(() => {
    let total = 0;
    
    if (formData.sens_operation === "DEBIT") {
      total = formData.comptes_credits.reduce((sum, item) => {
        return sum + (Number(item.montant) || 0);
      }, 0);
    } else { // Mode CREDIT
      total = formData.comptes_debits.reduce((sum, item) => {
        return sum + (Number(item.montant) || 0);
      }, 0);
    }
    
    setMontantTotal(total);
    setFormData(prev => ({ ...prev, montant_total: total }));
  }, [formData.comptes_credits, formData.comptes_debits, formData.sens_operation]);

  const fetchInitialData = async () => {
    try {
      const [agencesRes, comptesRes] = await Promise.all([
        ApiClient.get("/operation-diverses/agences/liste"),
        ApiClient.get("/operation-diverses/comptes/plan")
      ]);

      setAgences(agencesRes.data?.data || agencesRes.data?.agences || []);
      setComptesPlan(comptesRes.data?.data || []);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    }
  };

  const generateNumeroPiece = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 99) + 1;
    return `${dateStr}-${randomNum.toString().padStart(2, '0')}`;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ open: true, message: "Le fichier est trop volumineux (max 5MB)", severity: "error" });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1];
        setJustificatifFile({ file, base64: base64Data });
      };
      reader.readAsDataURL(file);
    }
  };

  // Gestion des comptes crédits
  const handleAddCompteCredit = () => {
    setFormData(prev => ({
      ...prev,
      comptes_credits: [...prev.comptes_credits, { compte_id: "", montant: "" }]
    }));
  };

  const handleRemoveCompteCredit = (index: number) => {
    if (formData.comptes_credits.length > 1) {
      setFormData(prev => ({
        ...prev,
        comptes_credits: prev.comptes_credits.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCompteCreditChange = (index: number, field: keyof CompteMontant, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      comptes_credits: prev.comptes_credits.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Gestion des comptes débits
  const handleAddCompteDebit = () => {
    setFormData(prev => ({
      ...prev,
      comptes_debits: [...prev.comptes_debits, { compte_id: "", montant: "" }]
    }));
  };

  const handleRemoveCompteDebit = (index: number) => {
    if (formData.comptes_debits.length > 1) {
      setFormData(prev => ({
        ...prev,
        comptes_debits: prev.comptes_debits.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCompteDebitChange = (index: number, field: keyof CompteMontant, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      comptes_debits: prev.comptes_debits.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ODGeneriqueData, string>> = {};

    if (!formData.agence_id) newErrors.agence_id = "L'agence est requise";
    if (!formData.libelle) newErrors.libelle = "Libellé requis";
    if (!formData.montant_total || Number(formData.montant_total) <= 0) newErrors.montant_total = "Montant invalide";
    
    if (formData.sens_operation === "DEBIT") {
      if (!formData.compte_debit_id) newErrors.compte_debit_id = "Compte débit requis";
      
      // Validation des comptes crédits
      let hasCreditError = false;
      formData.comptes_credits.forEach((item, index) => {
        if (!item.compte_id) {
          newErrors[`compte_credit_${index}` as keyof ODGeneriqueData] = "Compte crédit requis";
          hasCreditError = true;
        }
        if (!item.montant || Number(item.montant) <= 0) {
          newErrors[`montant_credit_${index}` as keyof ODGeneriqueData] = "Montant crédit invalide";
          hasCreditError = true;
        }
      });
      
      if (hasCreditError) {
        newErrors.comptes_credits = "Veuillez vérifier les comptes crédits";
      }
    } else { // Mode CREDIT
      if (!formData.compte_credit_id) newErrors.compte_credit_id = "Compte crédit requis";
      
      // Validation des comptes débits
      let hasDebitError = false;
      formData.comptes_debits.forEach((item, index) => {
        if (!item.compte_id) {
          newErrors[`compte_debit_${index}` as keyof ODGeneriqueData] = "Compte débit requis";
          hasDebitError = true;
        }
        if (!item.montant || Number(item.montant) <= 0) {
          newErrors[`montant_debit_${index}` as keyof ODGeneriqueData] = "Montant débit invalide";
          hasDebitError = true;
        }
      });
      
      if (hasDebitError) {
        newErrors.comptes_debits = "Veuillez vérifier les comptes débits";
      }
    }
    
    if (!formData.numero_guichet) newErrors.numero_guichet = "Numéro guichet requis";
    if (!formData.numero_piece) newErrors.numero_piece = "Numéro pièce requis";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({ open: true, message: "Veuillez corriger les erreurs", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        montant_total: Number(formData.montant_total),
        comptes_credits: formData.sens_operation === "DEBIT" ? 
          formData.comptes_credits.map(item => ({
            compte_id: item.compte_id,
            montant: Number(item.montant)
          })) : [],
        comptes_debits: formData.sens_operation === "CREDIT" ?
          formData.comptes_debits.map(item => ({
            compte_id: item.compte_id,
            montant: Number(item.montant)
          })) : [],
        ...(justificatifFile.base64 && {
          justificatif_base64: justificatifFile.base64,
          justificatif_filename: justificatifFile.file?.name,
          justificatif_mime_type: justificatifFile.file?.type
        })
      };

      if (!payload.justificatif_path) {
        delete payload.justificatif_path;
      }

      const response = await ApiClient.post("/operation-diverses/odGenerique", payload, {
        headers: { "Content-Type": "application/json" }
      });

      if (response.data.success) {
        setSnackbar({ open: true, message: "OD Générique créée avec succès", severity: "success" });
        handleClose();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || "Erreur lors de la création";
      setSnackbar({ open: true, message, severity: "error" });
      console.error("Erreur détaillée:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTabIndex(0);
    setFormData({
      agence_id: "",
      date_operation: new Date().toISOString().split('T')[0],
      date_valeur: new Date().toISOString().split('T')[0],
      date_comptable: new Date().toISOString().split('T')[0],
      type_operation: "REGULARISATION",
      type_collecte: "AUTRE",
      code_operation: "",
      libelle: "",
      description: "",
      montant_total: "",
      devise: "FCFA",
      compte_debit_id: "",
      comptes_credits: [{ compte_id: "", montant: "" }],
      compte_credit_id: "",
      comptes_debits: [{ compte_id: "", montant: "" }],
      sens_operation: "DEBIT",
      est_collecte: false,
      est_urgence: false,
      numero_guichet: "",
      numero_piece: "",
      ref_lettrage: "",
      justificatif_type: "AUTRE",
      justificatif_numero: "",
      justificatif_date: new Date().toISOString().split('T')[0],
      reference_client: "",
      nom_tiers: ""
    });
    setJustificatifFile({ file: null });
    setErrors({});
    setMontantTotal(0);
  };

  const handleGenerateNumeroPiece = () => {
    setFormData({ ...formData, numero_piece: generateNumeroPiece() });
  };

  // Fonction pour obtenir l'intitulé d'un compte
  const getCompteIntitule = (compteId: number | string) => {
    const compte = comptesPlan.find(c => c.id === compteId);
    return compte ? `${compte.code} - ${compte.libelle}` : "...";
  };

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>

        <Button startIcon={<ArrowBack />} onClick={() => navigate('/ChoicePageOd')} sx={{ mb: 2 }}>
            Retour
        </Button>            
        
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assignment sx={{ color: blue[500] }} />
            Opérations Diverses - Générique
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 3, bgcolor: blue[500], '&:hover': { bgcolor: blue[600] } }}
          >
            Nouvelle OD Générique
          </Button>
        </Box>

        {/* Section informative */}
        <Card sx={{ mb: 4, bgcolor: '#E3F2FD' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SyncAlt color="primary" />
              Utilisation des OD Génériques
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pour les régularisations, ajustements, différé ordinateur et autres opérations diverses
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight="bold">Fonctionnalités:</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Chip label="✔ Mode Débit (1 débit → N crédits)" size="small" color="error" variant="outlined" />
                  <Chip label="✔ Mode Crédit (1 crédit → N débits)" size="small" color="success" variant="outlined" />
                  <Chip label="✔ Types de justificatifs étendus" size="small" color="primary" variant="outlined" />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight="bold">Workflow:</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Chip label="1. Saisie par comptable" size="small" />
                  <Chip label="2. Validation chef d'agence" size="small" color="warning" />
                  <Chip label="3. Validation chef comptable" size="small" color="success" />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Modal de création avec onglets */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <SyncAlt color="primary" />
              <Typography variant="h6">Nouvelle OD Générique</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Création d'une opération diverse standard avec multi-comptes
            </Typography>
          </DialogTitle>

          <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="1. Informations" icon={<Assignment />} iconPosition="start" />
            <Tab label="2. Comptabilité" icon={<AccountBalance />} iconPosition="start" />
            <Tab label="3. Justificatif" icon={<AttachFile />} iconPosition="start" />
          </Tabs>

          <DialogContent sx={{ pt: 3 }}>
            {/* Onglet 1: Informations */}
            {tabIndex === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Informations générales
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl sx={{minWidth:250}} error={!!errors.agence_id}>
                        <InputLabel>Agence</InputLabel>
                        <Select
                          value={formData.agence_id}
                          onChange={(e) => setFormData({ ...formData, agence_id: e.target.value })}
                          label="Agence"
                        >
                          {agences.map(agence => (
                            <MenuItem key={agence.id} value={agence.id}>
                              {agence.code} - {agence.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.agence_id && <FormHelperText>{errors.agence_id}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Numéro guichet"
                        value={formData.numero_guichet}
                        onChange={(e) => setFormData({ ...formData, numero_guichet: e.target.value })}
                        error={!!errors.numero_guichet}
                        helperText={errors.numero_guichet}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Dates
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Date opération"
                        value={formData.date_operation}
                        onChange={(e) => setFormData({ ...formData, date_operation: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Date valeur"
                        value={formData.date_valeur}
                        onChange={(e) => setFormData({ ...formData, date_valeur: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Date comptable"
                        value={formData.date_comptable}
                        onChange={(e) => setFormData({ ...formData, date_comptable: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Type et libellé
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl sx={{minWidth:250}}>
                        <InputLabel>Type opération</InputLabel>
                        <Select
                          value={formData.type_operation}
                          onChange={(e) => setFormData({ ...formData, type_operation: e.target.value })}
                          label="Type opération"
                        >
                          {typesOperation.map(type => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl sx={{minWidth:250}}>
                        <InputLabel>Type collecte</InputLabel>
                        <Select
                          value={formData.type_collecte}
                          onChange={(e) => setFormData({ ...formData, type_collecte: e.target.value })}
                          label="Type collecte"
                        >
                          {typesCollecte.map(type => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Libellé"
                        value={formData.libelle}
                        onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                        error={!!errors.libelle}
                        helperText={errors.libelle}
                        placeholder="Ex: Différé ordinateur - Régularisation solde client"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description détaillée de l'opération..."
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Sens de l'opération
                  </Typography>
                  <FormControl sx={{minWidth:250}}>
                    <InputLabel>Sens de l'opération</InputLabel>
                    <Select
                      value={formData.sens_operation}
                      onChange={(e) => {
                        const newSens = e.target.value as "DEBIT" | "CREDIT";
                        setFormData({ 
                          ...formData, 
                          sens_operation: newSens,
                          // Réinitialiser les comptes selon le sens
                          compte_debit_id: newSens === "DEBIT" ? formData.compte_debit_id : "",
                          compte_credit_id: newSens === "CREDIT" ? formData.compte_credit_id : "",
                          comptes_credits: newSens === "DEBIT" ? formData.comptes_credits : [{ compte_id: "", montant: "" }],
                          comptes_debits: newSens === "CREDIT" ? formData.comptes_debits : [{ compte_id: "", montant: "" }]
                        });
                      }}
                      label="Sens de l'opération"
                    >
                      <MenuItem value="DEBIT">Mode Débit (1 compte débit, N comptes crédits)</MenuItem>
                      <MenuItem value="CREDIT">Mode Crédit (1 compte crédit, N comptes débits)</MenuItem>
                    </Select>
                    <FormHelperText>
                      {formData.sens_operation === "DEBIT" 
                        ? "Un compte sera débité, plusieurs comptes seront crédités" 
                        : "Un compte sera crédité, plusieurs comptes seront débités"}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Montant total
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Montant total"
                        type="number"
                        value={formData.montant_total}
                        onChange={(e) => setFormData({ ...formData, montant_total: e.target.value })}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                          readOnly: true
                        }}
                        error={!!errors.montant_total}
                        helperText={errors.montant_total || "Calculé automatiquement à partir des sous-montants"}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Devise</InputLabel>
                        <Select
                          value={formData.devise}
                          onChange={(e) => setFormData({ ...formData, devise: e.target.value })}
                          label="Devise"
                        >
                          {devises.map(devise => (
                            <MenuItem key={devise} value={devise}>
                              {devise}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total calculé: <strong>{new Intl.NumberFormat().format(montantTotal)} FCFA</strong>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* Onglet 2: Comptabilité */}
            {tabIndex === 1 && (
              <Grid container spacing={3}>
                {/* Mode DÉBIT */}
                {formData.sens_operation === "DEBIT" ? (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ArrowBack color="error" />
                        Compte Débit
                      </Typography>
                      <FormControl sx={{minWidth:250}} error={!!errors.compte_debit_id}>
                        <Autocomplete
                          options={comptesPlan}
                          getOptionLabel={(option) => `${option.code} - ${option.libelle}`}
                          value={comptesPlan.find(c => c.id === formData.compte_debit_id) || null}
                          onChange={(e, newValue) => {
                            setFormData({ ...formData, compte_debit_id: newValue?.id || "" });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Rechercher un compte débit"
                              error={!!errors.compte_debit_id}
                              helperText={errors.compte_debit_id || "Compte qui sera débité du montant total"}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ArrowForward color="success" />
                          Comptes Crédits
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddCircle />}
                          onClick={handleAddCompteCredit}
                          size="small"
                        >
                          Ajouter un compte
                        </Button>
                      </Box>
                      
                      {formData.comptes_credits.map((compteCredit, index) => (
                        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <FormControl sx={{minWidth:250}} error={!!errors[`compte_credit_${index}` as keyof ODGeneriqueData]}>
                              <Autocomplete
                                options={comptesPlan}
                                getOptionLabel={(option) => `${option.code} - ${option.libelle}`}
                                value={comptesPlan.find(c => c.id === compteCredit.compte_id) || null}
                                onChange={(e, newValue) => {
                                  handleCompteCreditChange(index, "compte_id", newValue?.id || "");
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label={`Compte crédit ${index + 1}`}
                                    error={!!errors[`compte_credit_${index}` as keyof ODGeneriqueData]}
                                    helperText={errors[`compte_credit_${index}` as keyof ODGeneriqueData]}
                                  />
                                )}
                              />
                            </FormControl>
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              label="Montant"
                              type="number"
                              value={compteCredit.montant}
                              onChange={(e) => handleCompteCreditChange(index, "montant", e.target.value)}
                              error={!!errors[`montant_credit_${index}` as keyof ODGeneriqueData]}
                              helperText={errors[`montant_credit_${index}` as keyof ODGeneriqueData]}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                              }}
                            />
                          </Grid>
                          <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                            {formData.comptes_credits.length > 1 && (
                              <IconButton 
                                color="error" 
                                onClick={() => handleRemoveCompteCredit(index)}
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                            )}
                          </Grid>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                ) : (
                  /* Mode CRÉDIT */
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ArrowForward color="success" />
                        Compte Crédit
                      </Typography>
                      <FormControl sx={{minWidth:250}} error={!!errors.compte_credit_id}>
                        <Autocomplete
                          options={comptesPlan}
                          getOptionLabel={(option) => `${option.code} - ${option.libelle}`}
                          value={comptesPlan.find(c => c.id === formData.compte_credit_id) || null}
                          onChange={(e, newValue) => {
                            setFormData({ ...formData, compte_credit_id: newValue?.id || "" });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Rechercher un compte crédit"
                              error={!!errors.compte_credit_id}
                              helperText={errors.compte_credit_id || "Compte qui sera crédité du montant total"}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ArrowBack color="error" />
                          Comptes Débits
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddCircle />}
                          onClick={handleAddCompteDebit}
                          size="small"
                        >
                          Ajouter un compte
                        </Button>
                      </Box>
                      
                      {formData.comptes_debits.map((compteDebit, index) => (
                        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <FormControl sx={{minWidth:250}} error={!!errors[`compte_debit_${index}` as keyof ODGeneriqueData]}>
                              <Autocomplete
                                options={comptesPlan}
                                getOptionLabel={(option) => `${option.code} - ${option.libelle}`}
                                value={comptesPlan.find(c => c.id === compteDebit.compte_id) || null}
                                onChange={(e, newValue) => {
                                  handleCompteDebitChange(index, "compte_id", newValue?.id || "");
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label={`Compte débit ${index + 1}`}
                                    error={!!errors[`compte_debit_${index}` as keyof ODGeneriqueData]}
                                    helperText={errors[`compte_debit_${index}` as keyof ODGeneriqueData]}
                                  />
                                )}
                              />
                            </FormControl>
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              label="Montant"
                              type="number"
                              value={compteDebit.montant}
                              onChange={(e) => handleCompteDebitChange(index, "montant", e.target.value)}
                              error={!!errors[`montant_debit_${index}` as keyof ODGeneriqueData]}
                              helperText={errors[`montant_debit_${index}` as keyof ODGeneriqueData]}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                              }}
                            />
                          </Grid>
                          <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                            {formData.comptes_debits.length > 1 && (
                              <IconButton 
                                color="error" 
                                onClick={() => handleRemoveCompteDebit(index)}
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                            )}
                          </Grid>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}

                {/* Section commune des références */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Références
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Numéro pièce comptable"
                        value={formData.numero_piece}
                        onChange={(e) => setFormData({ ...formData, numero_piece: e.target.value })}
                        error={!!errors.numero_piece}
                        helperText={errors.numero_piece || "Format: AAMMJJ-numéro"}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={handleGenerateNumeroPiece} size="small">
                                <Functions />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Référence lettrage"
                        value={formData.ref_lettrage}
                        onChange={(e) => setFormData({ ...formData, ref_lettrage: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Référence client"
                        value={formData.reference_client}
                        onChange={(e) => setFormData({ ...formData, reference_client: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nom tiers"
                        value={formData.nom_tiers}
                        onChange={(e) => setFormData({ ...formData, nom_tiers: e.target.value })}
                        placeholder="Nom du client, fournisseur ou tiers concerné"
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.est_collecte}
                          onChange={(e) => setFormData({ ...formData, est_collecte: e.target.checked })}
                        />
                      }
                      label="Est une collecte"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.est_urgence}
                          onChange={(e) => setFormData({ ...formData, est_urgence: e.target.checked })}
                        />
                      }
                      label="Urgence"
                    />
                  </Stack>
                </Grid>
              </Grid>
            )}

            {/* Onglet 3: Justificatif */}
            {tabIndex === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Informations justificatif
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Type justificatif</InputLabel>
                        <Select
                          value={formData.justificatif_type}
                          onChange={(e) => setFormData({ ...formData, justificatif_type: e.target.value })}
                          label="Type justificatif"
                        >
                          {typesJustificatif.map(type => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Numéro justificatif"
                        value={formData.justificatif_numero}
                        onChange={(e) => setFormData({ ...formData, justificatif_numero: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Date justificatif"
                        value={formData.justificatif_date}
                        onChange={(e) => setFormData({ ...formData, justificatif_date: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Fichier justificatif
                  </Typography>
                  <Box sx={{ border: '2px dashed', borderColor: 'grey.300', borderRadius: 2, p: 3, textAlign: 'center' }}>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="justificatif-generique-upload"
                    />
                    <label htmlFor="justificatif-generique-upload">
                      <Button
                        component="span"
                        variant="outlined"
                        startIcon={<Upload />}
                        sx={{ mb: 2 }}
                      >
                        Choisir le fichier
                      </Button>
                    </label>
                    {justificatifFile.file ? (
                      <Box>
                        <Chip
                          label={justificatifFile.file.name}
                          onDelete={() => setJustificatifFile({ file: null })}
                          sx={{ mt: 1 }}
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Taille: {(justificatifFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'green' }}>
                          Prêt pour envoi en JSON
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Formats acceptés: PDF, JPG, PNG (Max 5MB)
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Aperçu amélioré de l'écriture comptable */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Aperçu de l'écriture comptable
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell><strong>Compte</strong></TableCell>
                          <TableCell><strong>Libellé</strong></TableCell>
                          <TableCell><strong>Intitulé du compte</strong></TableCell>
                          <TableCell align="right"><strong>Débit (FCFA)</strong></TableCell>
                          <TableCell align="right"><strong>Crédit (FCFA)</strong></TableCell>
                          <TableCell><strong>Sens</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Mode DÉBIT */}
                        {formData.sens_operation === "DEBIT" && (
                          <>
                            {/* Ligne du compte débit */}
                            {formData.compte_debit_id && (
                              <TableRow sx={{ bgcolor: '#fff5f5' }}>
                                <TableCell>
                                  <strong>
                                    {comptesPlan.find(c => c.id === formData.compte_debit_id)?.code || "..."}
                                  </strong>
                                </TableCell>
                                <TableCell>{formData.libelle || "..."}</TableCell>
                                <TableCell>
                                  {getCompteIntitule(formData.compte_debit_id)}
                                </TableCell>
                                <TableCell align="right">
                                  <strong style={{ color: red[600] }}>
                                    {formData.montant_total ? new Intl.NumberFormat().format(Number(formData.montant_total)) : "0"}
                                  </strong>
                                </TableCell>
                                <TableCell align="right">-</TableCell>
                                <TableCell>
                                  <Chip label="DÉBIT" size="small" color="error" variant="outlined" />
                                </TableCell>
                              </TableRow>
                            )}

                            {/* Lignes des comptes crédits */}
                            {formData.comptes_credits.map((compteCredit, index) => {
                              const compte = comptesPlan.find(c => c.id === compteCredit.compte_id);
                              if (!compte || !compteCredit.montant || Number(compteCredit.montant) <= 0) return null;
                              
                              return (
                                <TableRow key={index} sx={{ 
                                  bgcolor: index % 2 === 0 ? '#f8fff5' : 'white',
                                  borderLeft: `4px solid ${green[100]}`
                                }}>
                                  <TableCell>
                                    <strong>{compte.code}</strong>
                                  </TableCell>
                                  <TableCell>{formData.libelle || "..."}</TableCell>
                                  <TableCell>{compte.libelle}</TableCell>
                                  <TableCell align="right">-</TableCell>
                                  <TableCell align="right">
                                    <strong style={{ color: green[600] }}>
                                      {compteCredit.montant ? new Intl.NumberFormat().format(Number(compteCredit.montant)) : "0"}
                                    </strong>
                                  </TableCell>
                                  <TableCell>
                                    <Chip label="CRÉDIT" size="small" color="success" variant="outlined" />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </>
                        )}

                        {/* Mode CRÉDIT */}
                        {formData.sens_operation === "CREDIT" && (
                          <>
                            {/* Ligne du compte crédit */}
                            {formData.compte_credit_id && (
                              <TableRow sx={{ bgcolor: '#f8fff5' }}>
                                <TableCell>
                                  <strong>
                                    {comptesPlan.find(c => c.id === formData.compte_credit_id)?.code || "..."}
                                  </strong>
                                </TableCell>
                                <TableCell>{formData.libelle || "..."}</TableCell>
                                <TableCell>
                                  {getCompteIntitule(formData.compte_credit_id)}
                                </TableCell>
                                <TableCell align="right">-</TableCell>
                                <TableCell align="right">
                                  <strong style={{ color: green[600] }}>
                                    {formData.montant_total ? new Intl.NumberFormat().format(Number(formData.montant_total)) : "0"}
                                  </strong>
                                </TableCell>
                                <TableCell>
                                  <Chip label="CRÉDIT" size="small" color="success" variant="outlined" />
                                </TableCell>
                              </TableRow>
                            )}

                            {/* Lignes des comptes débits */}
                            {formData.comptes_debits.map((compteDebit, index) => {
                              const compte = comptesPlan.find(c => c.id === compteDebit.compte_id);
                              if (!compte || !compteDebit.montant || Number(compteDebit.montant) <= 0) return null;
                              
                              return (
                                <TableRow key={index} sx={{ 
                                  bgcolor: index % 2 === 0 ? '#fff5f5' : 'white',
                                  borderLeft: `4px solid ${red[100]}`
                                }}>
                                  <TableCell>
                                    <strong>{compte.code}</strong>
                                  </TableCell>
                                  <TableCell>{formData.libelle || "..."}</TableCell>
                                  <TableCell>{compte.libelle}</TableCell>
                                  <TableCell align="right">
                                    <strong style={{ color: red[600] }}>
                                      {compteDebit.montant ? new Intl.NumberFormat().format(Number(compteDebit.montant)) : "0"}
                                    </strong>
                                  </TableCell>
                                  <TableCell align="right">-</TableCell>
                                  <TableCell>
                                    <Chip label="DÉBIT" size="small" color="error" variant="outlined" />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </>
                        )}

                        {/* Ligne de total */}
                        <TableRow sx={{ bgcolor: '#f0f0f0', fontWeight: 'bold' }}>
                          <TableCell colSpan={3} align="right">
                            <strong>TOTAL</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>{new Intl.NumberFormat().format(montantTotal)}</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>{new Intl.NumberFormat().format(montantTotal)}</strong>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ 
                              color: montantTotal > 0 ? "success.main" : "text.secondary",
                              fontWeight: 'bold'
                            }}>
                              {montantTotal > 0 ? "✓ Équilibré" : "En attente"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Légende */}
                  <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#fff5f5', border: '1px solid #ffcdd2' }} />
                      <Typography variant="caption">Compte débit</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#f8fff5', border: '1px solid #c8e6c9' }} />
                      <Typography variant="caption">Compte crédit</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 16, height: 4, bgcolor: green[100] }} />
                      <Typography variant="caption">Bordure compte crédit</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 16, height: 4, bgcolor: red[100] }} />
                      <Typography variant="caption">Bordure compte débit</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={handleClose} color="inherit">
              Annuler
            </Button>
            {tabIndex > 0 && (
              <Button onClick={() => setTabIndex(tabIndex - 1)}>
                Précédent
              </Button>
            )}
            {tabIndex < 2 ? (
              <Button
                variant="contained"
                onClick={() => setTabIndex(tabIndex + 1)}
              >
                Suivant
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Add />}
                sx={{ bgcolor: blue[500], '&:hover': { bgcolor: blue[600] } }}
              >
                {loading ? "Création en cours..." : "Créer l'OD"}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Snackbar pour feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
}