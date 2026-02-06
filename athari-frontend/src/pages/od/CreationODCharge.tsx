import React, { useEffect, useState } from "react";
import {
  Box, Button, Paper, Typography, TextField, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  Chip, Stack, IconButton, CircularProgress, Alert, Snackbar,
  InputAdornment, FormHelperText, Autocomplete, Divider, Card, CardContent,
  Switch, FormControlLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableFooter
} from "@mui/material";
import {
  Add, AttachFile, Description, Euro, Close, Upload,
  Receipt, Business, Paid, Event, Assignment, Warning,
  ArrowDownward, ArrowUpward, AccountBalance, TrendingDown, TrendingUp, ArrowBack
} from "@mui/icons-material";
import { indigo, red, orange, green, blue, grey, purple } from "@mui/material/colors";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";
import { useNavigate } from "react-router-dom";

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

interface ODChargeData {
  agence_id: number | string;
  date_operation: string;
  date_valeur: string;
  montant: number | string;
  compte_charge_id: number | string;
  compte_passage_id: number | string;
  numero_guichet: string;
  numero_piece: string;
  justificatif_type: string;
  justificatif_numero: string;
  justificatif_date: string;
  nom_fournisseur: string;
  est_urgence: boolean;
  description: string;
  reference_client: string;
  justificatif?: File;
}

interface EcritureComptable {
  compte: string;
  libelle: string;
  reference: string;
  debit: number;
  credit: number;
}

export default function CreationODCharge() {
  const navigate = useNavigate();
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agences, setAgences] = useState<Agency[]>([]);
  const [comptesCharges, setComptesCharges] = useState<ComptePlan[]>([]);
  const [comptesPassage, setComptesPassage] = useState<ComptePlan[]>([]);
  const [justificatifFile, setJustificatifFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [ecritures, setEcritures] = useState<EcritureComptable[]>([]);

  const [formData, setFormData] = useState<ODChargeData>({
    agence_id: "",
    date_operation: new Date().toISOString().split('T')[0],
    date_valeur: new Date().toISOString().split('T')[0],
    montant: "",
    compte_charge_id: "",
    compte_passage_id: "",
    numero_guichet: "",
    numero_piece: "",
    justificatif_type: "FACTURE",
    justificatif_numero: "",
    justificatif_date: new Date().toISOString().split('T')[0],
    nom_fournisseur: "",
    est_urgence: false,
    description: "",
    reference_client: ""
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ODChargeData, string>>>({});

  // Charger les données initiales
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Mettre à jour les écritures comptables lorsque les données changent
  useEffect(() => {
    updateEcrituresComptables();
  }, [formData.montant, formData.compte_charge_id, formData.compte_passage_id, formData.numero_piece, formData.nom_fournisseur]);

  const fetchInitialData = async () => {
    try {
      const [agencesRes, chargesRes, passageRes] = await Promise.all([
        ApiClient.get("/operation-diverses/agences/liste"),
        ApiClient.get("/operation-diverses/comptes/charges"),
        ApiClient.get("/operation-diverses/comptes/passage")
      ]);

      setAgences(agencesRes.data?.data || agencesRes.data?.agences || []);
      setComptesCharges(chargesRes.data?.data || []);
      setComptesPassage(passageRes.data?.data || []);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    }
  };

  const updateEcrituresComptables = () => {
    const montant = Number(formData.montant) || 0;
    const compteCharge = comptesCharges.find(c => c.id === Number(formData.compte_charge_id));
    const comptePassage = comptesPassage.find(c => c.id === Number(formData.compte_passage_id));

    const newEcritures: EcritureComptable[] = [];

    // Écriture de débit (compte charge)
    if (compteCharge && montant > 0) {
      newEcritures.push({
        compte: compteCharge.code,
        libelle: compteCharge.libelle,
        reference: formData.numero_piece || `CHARGE-${new Date().getTime()}`,
        debit: montant,
        credit: 0
      });
    }

    // Écriture de crédit (compte passage)
    if (comptePassage && montant > 0) {
      newEcritures.push({
        compte: comptePassage.code,
        libelle: comptePassage.libelle,
        reference: formData.numero_piece || `CHARGE-${new Date().getTime()}`,
        debit: 0,
        credit: montant
      });
    }

    setEcritures(newEcritures);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setJustificatifFile(file);
      
      // Auto-détection du type de justificatif basé sur le nom
      const fileName = file.name.toLowerCase();
      let type = "AUTRE";
      if (fileName.includes("facture")) type = "FACTURE";
      else if (fileName.includes("quittance")) type = "QUITTANCE";
      else if (fileName.includes("bon")) type = "BON";
      else if (fileName.includes("ticket")) type = "TICKET";
      else if (fileName.includes("autorisation") || fileName.includes("décaissement")) type = "AUTORISATION_DECAISSEMENT";

      setFormData(prev => ({
        ...prev,
        justificatif_type: type
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ODChargeData, string>> = {};

    if (!formData.agence_id) newErrors.agence_id = "L'agence est requise";
    if (!formData.montant || Number(formData.montant) <= 0) newErrors.montant = "Montant invalide";
    if (!formData.compte_charge_id) newErrors.compte_charge_id = "Compte charge requis";
    if (!formData.compte_passage_id) newErrors.compte_passage_id = "Compte passage requis";
    if (!formData.numero_guichet) newErrors.numero_guichet = "Numéro guichet requis";
    if (!formData.numero_piece) newErrors.numero_piece = "Numéro pièce requis";
    if (!formData.justificatif_numero) newErrors.justificatif_numero = "Numéro justificatif requis";
    if (!formData.nom_fournisseur) newErrors.nom_fournisseur = "Nom fournisseur requis";
    if (!justificatifFile) newErrors.justificatif = "Justificatif requis";

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
      // Créer un objet FormData
      const formDataToSend = new FormData();
      
      // Ajouter tous les champs sauf le fichier
      const dataToSend: Record<string, any> = {
        ...formData,
        montant: Number(formData.montant),
        est_urgence: formData.est_urgence // Déjà un booléen
      };

      // Ajouter les champs au FormData
      Object.entries(dataToSend).forEach(([key, value]) => {
        if (key !== 'justificatif' && value !== undefined && value !== null) {
          // Pour les booléens, envoyer 1/0 au lieu de true/false
          if (typeof value === 'boolean') {
            formDataToSend.append(key, value ? '1' : '0');
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      // Ajouter le fichier justificatif
      if (justificatifFile) {
        formDataToSend.append("justificatif", justificatifFile);
      }

      // Alternative: envoyer en JSON avec FormData
      const response = await ApiClient.post("/operation-diverses/charges", formDataToSend, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Accept": "application/json"
        }
      });

      if (response.data.success) {
        setSnackbar({ open: true, message: "OD Charge créée avec succès", severity: "success" });
        handleClose();
      }
    } catch (error: any) {
      console.error("Erreur détaillée:", error.response?.data);
      
      // Gestion spécifique des erreurs de validation
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages: string[] = [];
        const newFieldErrors: Partial<Record<keyof ODChargeData, string>> = {};
        
        Object.entries(validationErrors).forEach(([field, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : messages;
          errorMessages.push(`${field}: ${message}`);
          newFieldErrors[field as keyof ODChargeData] = message as string;
        });
        
        setErrors(newFieldErrors);
        setSnackbar({ 
          open: true, 
          message: `Validation échouée: ${errorMessages.join(', ')}`, 
          severity: "error" 
        });
      } else {
        const message = error.response?.data?.message || "Erreur lors de la création";
        setSnackbar({ open: true, message, severity: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      agence_id: "",
      date_operation: new Date().toISOString().split('T')[0],
      date_valeur: new Date().toISOString().split('T')[0],
      montant: "",
      compte_charge_id: "",
      compte_passage_id: "",
      numero_guichet: "",
      numero_piece: "",
      justificatif_type: "FACTURE",
      justificatif_numero: "",
      justificatif_date: new Date().toISOString().split('T')[0],
      nom_fournisseur: "",
      est_urgence: false,
      description: "",
      reference_client: ""
    });
    setJustificatifFile(null);
    setErrors({});
    setEcritures([]);
  };

  const getCompteLabel = (id: number | string, comptes: ComptePlan[]) => {
    const compte = comptes.find(c => c.id === Number(id));
    return compte ? `${compte.code} - ${compte.libelle}` : "";
  };

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        {/* Header */}
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/ChoicePageOd')} sx={{ mb: 2 }}>
            Retour
        </Button>            
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assignment sx={{ color: indigo[500] }} />
            Opérations Diverses - Charges
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 3, bgcolor: indigo[500], '&:hover': { bgcolor: indigo[600] } }}
          >
            Nouvelle Charge
          </Button>
        </Box>

        {/* Section informative */}
        <Card sx={{ mb: 4, bgcolor: '#FFF8E1' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Receipt color="warning" />
              Procédure des Charges
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pour le règlement des charges (électricité, entretien, communication, eau...)
            </Typography>
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Chip label="1. Débit: Compte classe 6 (Charge)" size="small" color="primary" />
              <Chip label="2. Crédit: Compte passage 47" size="small" color="secondary" />
              <Chip label="3. Validation: Chef d'agence → Chef comptable → DG" size="small" color="info" />
            </Stack>
          </CardContent>
        </Card>

        {/* Modal de création */}
        <Dialog 
          open={open} 
          onClose={handleClose} 
          maxWidth="lg" 
          fullWidth
          sx={{ '& .MuiDialog-paper': { maxHeight: '90vh', height: 'auto' } }}
        >
          <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Receipt color="primary" />
              <Typography variant="h6">Nouvelle OD Charge</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Règlement des charges - Workflow de validation à 3 niveaux
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: 3, maxHeight: 'calc(90vh - 200px)', overflow: 'auto' }}>
            <Grid container spacing={3}>
              {/* Section 1: Informations de base */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Event color="action" />
                  Informations générales
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl sx={{minWidth:250}} error={!!errors.agence_id} size="medium">
                      <InputLabel>Agence</InputLabel>
                      <Select
                        value={formData.agence_id}
                        onChange={(e) => setFormData({ ...formData, agence_id: e.target.value })}
                        label="Agence"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        {agences.map(agence => (
                          <MenuItem key={agence.id} value={agence.id}>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {agence.code} - {agence.name}
                              </Typography>
                            </Box>
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
                      size="medium"
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Section 2: Dates (désactivées) */}
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
                      disabled
                      size="medium"
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
                      disabled
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date justificatif"
                      value={formData.justificatif_date}
                      onChange={(e) => setFormData({ ...formData, justificatif_date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      disabled
                      size="medium"
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Section 3: Montant et comptes */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Paid color="action" />
                  Écriture comptable
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Montant"
                      type="number"
                      value={formData.montant}
                      onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                      }}
                      error={!!errors.montant}
                      helperText={errors.montant}
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl sx={{minWidth:250}} error={!!errors.compte_charge_id} size="medium">
                      <InputLabel>Compte charge (6*)</InputLabel>
                      <Select
                        value={formData.compte_charge_id}
                        onChange={(e) => setFormData({ ...formData, compte_charge_id: e.target.value })}
                        label="Compte charge (6*)"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        {comptesCharges.map(compte => (
                          <MenuItem key={compte.id} value={compte.id}>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {compte.code}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {compte.libelle}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.compte_charge_id && <FormHelperText>{errors.compte_charge_id}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl sx={{minWidth:250}} error={!!errors.compte_passage_id} size="medium">
                      <InputLabel>Compte passage (47*)</InputLabel>
                      <Select
                        value={formData.compte_passage_id}
                        onChange={(e) => setFormData({ ...formData, compte_passage_id: e.target.value })}
                        label="Compte passage (47*)"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        {comptesPassage.map(compte => (
                          <MenuItem key={compte.id} value={compte.id}>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {compte.code}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {compte.libelle}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.compte_passage_id && <FormHelperText>{errors.compte_passage_id}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl sx={{minWidth:250}} size="medium">
                      <InputLabel>Type justificatif</InputLabel>
                      <Select
                        value={formData.justificatif_type}
                        onChange={(e) => setFormData({ ...formData, justificatif_type: e.target.value })}
                        label="Type justificatif"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        <MenuItem value="FACTURE">Facture</MenuItem>
                        <MenuItem value="QUITTANCE">Quittance</MenuItem>
                        <MenuItem value="AUTORISATION_DECAISSEMENT">Autorisation de décaissement</MenuItem>
                        <MenuItem value="BON">Bon</MenuItem>
                        <MenuItem value="TICKET">Ticket</MenuItem>
                        <MenuItem value="AUTRE">Autre</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              {/* Section 4: Fournisseur et références */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business color="action" />
                  Fournisseur et références
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nom du fournisseur"
                      value={formData.nom_fournisseur}
                      onChange={(e) => setFormData({ ...formData, nom_fournisseur: e.target.value })}
                      error={!!errors.nom_fournisseur}
                      helperText={errors.nom_fournisseur}
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Référence client"
                      value={formData.reference_client}
                      onChange={(e) => setFormData({ ...formData, reference_client: e.target.value })}
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Numéro pièce comptable"
                      value={formData.numero_piece}
                      onChange={(e) => setFormData({ ...formData, numero_piece: e.target.value })}
                      error={!!errors.numero_piece}
                      helperText={errors.numero_piece || "Format: AAMMJJ-numéro"}
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Numéro justificatif"
                      value={formData.justificatif_numero}
                      onChange={(e) => setFormData({ ...formData, justificatif_numero: e.target.value })}
                      error={!!errors.justificatif_numero}
                      helperText={errors.justificatif_numero}
                      size="medium"
                    />
                  </Grid>
                  
                  {/* Champ est_urgence avec Switch */}
                  <Grid item xs={12}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        borderColor: formData.est_urgence ? orange[500] : 'divider',
                        bgcolor: formData.est_urgence ? `${orange[50]} !important` : 'transparent'
                      }}
                    >
                      <CardContent sx={{ py: 2 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.est_urgence}
                              onChange={(e) => setFormData({ ...formData, est_urgence: e.target.checked })}
                              color="warning"
                              size="medium"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Warning sx={{ color: formData.est_urgence ? orange[600] : 'inherit' }} />
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  color: formData.est_urgence ? orange[800] : 'inherit',
                                  fontWeight: formData.est_urgence ? 'bold' : 'normal'
                                }}
                              >
                                Opération urgente
                              </Typography>
                              {formData.est_urgence && (
                                <Chip 
                                  label="URGENT" 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: orange[100], 
                                    color: orange[800],
                                    fontWeight: 'bold',
                                    ml: 1
                                  }} 
                                />
                              )}
                            </Box>
                          }
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block' }}>
                          {formData.est_urgence 
                            ? "Cette opération sera traitée en priorité et nécessite une validation accélérée"
                            : "Cocher si cette opération nécessite un traitement urgent"}
                        </Typography>
                        {errors.est_urgence && (
                          <FormHelperText error sx={{ ml: 4, mt: 1 }}>
                            {errors.est_urgence}
                          </FormHelperText>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* Section 5: Justificatif */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachFile color="action" />
                  Justificatif
                </Typography>
                <Box sx={{ border: '2px dashed', borderColor: errors.justificatif ? 'error.main' : 'grey.300', borderRadius: 2, p: 3, textAlign: 'center' }}>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="justificatif-upload"
                  />
                  <label htmlFor="justificatif-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<Upload />}
                      sx={{ mb: 2 }}
                      size="medium"
                    >
                      Choisir le fichier
                    </Button>
                  </label>
                  {justificatifFile ? (
                    <Box>
                      <Chip
                        label={justificatifFile.name}
                        onDelete={() => setJustificatifFile(null)}
                        sx={{ mt: 1 }}
                        size="medium"
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Taille: {(justificatifFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Formats acceptés: PDF, JPG, PNG (Max 5MB)
                    </Typography>
                  )}
                  {errors.justificatif && (
                    <FormHelperText error sx={{ mt: 1 }}>
                      {errors.justificatif}
                    </FormHelperText>
                  )}
                </Box>
              </Grid>

              {/* Section 6: Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Détails supplémentaires sur la charge..."
                  size="medium"
                />
              </Grid>

              {/* Section 7: Aperçu des écritures comptables - À LA FIN */}
              {ecritures.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ 
                    mt: 2, 
                    p: 3, 
                    border: `2px solid ${indigo[100]}`,
                    borderRadius: 2,
                    bgcolor: '#F8FAFF'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <AccountBalance sx={{ color: indigo[600], fontSize: 32 }} />
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color={indigo[700]}>
                          Aperçu de l'écriture comptable
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Visualisation des impacts comptables de cette opération
                        </Typography>
                      </Box>
                    </Box>

                    {/* Résumé de l'opération */}
                    <Card sx={{ mb: 3, bgcolor: indigo[50], border: `1px solid ${indigo[200]}` }}>
                      <CardContent sx={{ py: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                              Fournisseur
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {formData.nom_fournisseur || "-"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                              Montant total
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color={purple[700]}>
                              {Number(formData.montant).toLocaleString()} FCFA
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                              Statut
                            </Typography>
                            <Chip 
                              label={formData.est_urgence ? "URGENT" : "Normal"} 
                              size="small"
                              sx={{ 
                                bgcolor: formData.est_urgence ? orange[100] : green[100],
                                color: formData.est_urgence ? orange[800] : green[800],
                                fontWeight: 'bold'
                              }} 
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Tableau des écritures */}
                    <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${grey[300]}` }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: indigo[100] }}>
                            <TableCell sx={{ width: '15%', fontWeight: 'bold', color: indigo[800] }}>
                              Compte
                            </TableCell>
                            <TableCell sx={{ width: '35%', fontWeight: 'bold', color: indigo[800] }}>
                              Libellé
                            </TableCell>
                            <TableCell sx={{ width: '25%', fontWeight: 'bold', color: indigo[800] }}>
                              Référence
                            </TableCell>
                            <TableCell align="center" sx={{ width: '12.5%', fontWeight: 'bold', color: red[800] }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <TrendingDown fontSize="small" />
                                Débit
                              </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ width: '12.5%', fontWeight: 'bold', color: green[800] }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <TrendingUp fontSize="small" />
                                Crédit
                              </Box>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ecritures.map((ecriture, index) => (
                            <TableRow 
                              key={index}
                              sx={{ 
                                '&:hover': { bgcolor: grey[50] },
                                '&:last-child td, &:last-child th': { border: 0 }
                              }}
                            >
                              <TableCell>
                                <Chip 
                                  label={ecriture.compte} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: ecriture.debit > 0 ? red[50] : green[50],
                                    color: ecriture.debit > 0 ? red[700] : green[700],
                                    fontWeight: 'bold'
                                  }} 
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {ecriture.libelle}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {ecriture.reference}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {ecriture.debit > 0 ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <Typography fontWeight="bold" color={red[700]}>
                                      {ecriture.debit.toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" color={red[600]}>
                                      FCFA
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography color="text.secondary">-</Typography>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {ecriture.credit > 0 ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <Typography fontWeight="bold" color={green[700]}>
                                      {ecriture.credit.toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" color={green[600]}>
                                      FCFA
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography color="text.secondary">-</Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow sx={{ bgcolor: blue[50] }}>
                            <TableCell colSpan={3}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                TOTAUX
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold" color={red[700]}>
                                  {ecritures.reduce((sum, e) => sum + e.debit, 0).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color={red[600]}>
                                  FCFA
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold" color={green[700]}>
                                  {ecritures.reduce((sum, e) => sum + e.credit, 0).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color={green[600]}>
                                  FCFA
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                          {/* Ligne d'équilibre */}
                          <TableRow sx={{ bgcolor: grey[100] }}>
                            <TableCell colSpan={5} align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="medium">
                                  Équilibre comptable:
                                </Typography>
                                <Chip 
                                  label={
                                    ecritures.reduce((sum, e) => sum + e.debit, 0) === 
                                    ecritures.reduce((sum, e) => sum + e.credit, 0) 
                                      ? "ÉQUILIBRÉ" 
                                      : "DÉSÉQUILIBRÉ"
                                  } 
                                  size="small"
                                  color={
                                    ecritures.reduce((sum, e) => sum + e.debit, 0) === 
                                    ecritures.reduce((sum, e) => sum + e.credit, 0) 
                                      ? "success" 
                                      : "error"
                                  }
                                  sx={{ fontWeight: 'bold' }}
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </TableContainer>

                    {/* Légende */}
                    <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: red[100], border: `1px solid ${red[300]}` }} />
                        <Typography variant="caption" color="text.secondary">
                          Débit (Sortie de fonds)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: green[100], border: `1px solid ${green[300]}` }} />
                        <Typography variant="caption" color="text.secondary">
                          Crédit (Compte de passage)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={handleClose} color="inherit">
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || ecritures.length === 0}
              startIcon={loading ? <CircularProgress size={20} /> : <Add />}
              sx={{ bgcolor: indigo[500], '&:hover': { bgcolor: indigo[600] } }}
              size="medium"
            >
              {loading ? "Création en cours..." : "Créer la charge"}
            </Button>
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