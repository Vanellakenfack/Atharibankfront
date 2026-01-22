import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  ThemeProvider, createTheme, CssBaseline, Container, Box, Grid, TextField,
  Button, Stepper, Step, StepLabel, Select, MenuItem, InputLabel, 
  FormControl, Typography, Divider, Paper, FormHelperText, Snackbar, Alert,
  Tabs, Tab, Stack, Avatar, IconButton
} from "@mui/material";
import { indigo, blueGrey, cyan } from "@mui/material/colors";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import ApiClient from "../../services/api/ApiClient"; 
import { PhotoCamera, Upload } from "@mui/icons-material";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: indigo[700] },
    secondary: { main: cyan.A700 },
    background: { default: blueGrey[50] },
  },
  shape: { borderRadius: 12 },
});

const STEPS = ["Identité Entreprise", "Siège & Contact", "Documents Légaux", "Gérance & Signataires", "Fichiers & Photos"];

const schemas = [
  Yup.object({
    agency_id: Yup.string().required("L'agence est obligatoire"),
    raison_sociale: Yup.string().required("Raison sociale requise"),
    forme_juridique: Yup.string().required("Forme juridique requise"),
    type_entreprise: Yup.string().required("Type d'entreprise requis"),
  }),
  Yup.object({
    adresse_ville: Yup.string().required("Ville requise"),
    adresse_quartier: Yup.string().required("Quartier requis"),
    telephone: Yup.string().required("Téléphone requis"),
  }),
  Yup.object({
    rccm: Yup.string().required("N° RCCM requis"),
  }),
  Yup.object({
    nom_gerant: Yup.string().required("Nom du gérant requis"),
  }),
  Yup.object({}),
];

const CITY_DATA = {
  Douala: ["Akwa", "Bonapriso", "Deïdo", "Bali", "Makepe", "Bonanjo", "Logbessou", "Kotto", "Logpom", "Lendi", "Nyalla", "Ndogpassi", "Bepanda", "Bonamoussadi", "Ange Raphaël", "Ndoti", "New Bell", "Bassa", "Nylon", "Cité des Palmiers", "Bonabéri", "Sodiko", "Boanda", "Mabanda", "Yassa", "Japoma"],
  Yaoundé: ["Bastos", "Essos", "Mokolo", "Biyem-Assi", "Mvog-Ada", "Nkolbisson", "Ekounou", "Ngousso", "Santa Barbara", "Etoudi", "Mballa II", "Emana", "Messassi", "Olembe", "Nlongkak", "Etoa-Meki", "Mvog-Mbi", "Obili", "Ngoa-Ekelle", "Damase", "Mendong", "Simbock", "Efoulan", "Nsam", "Ahala", "Kondengui"],
  Bafoussam: ["Tamdja", "Banengo", "Djeleng", "Nkong-Zem", "Koptchou", "Famla", "Houkaha", "Kouékong", "Ndiangdam", "Kamkop", "Toungang", "Tocket", "Diadam", "Baleng"],
  Bamenda: ["Mankon", "Nkwen", "Bali", "Bafut", "Up-Station", "Old Church", "Mile 2", "Mile 3", "Mile 4", "Cow Street", "Abakwa", "Mulang", "Below Fongu"],
  Garoua: ["Lainde", "Yelwa", "Roumdé Adjia", "Djamboutou", "Nassarao", "Pitoa", "Poumpoumré", "Foulberé", "Louti", "Gashiga"],
  Maroua: ["Kakataré", "Doursoungo", "Douggoï", "Domayo", "Pitoaré", "Ouro-Tchédé", "Djarengol", "Baouliwol", "Zokok"],
  Ngaoundéré: ["Baladji I", "Baladji II", "Joli Soir", "Dang", "Bamyanga", "Sabongari", "Mboum", "Yelwa", "Haoussa"],
  Limbe: ["Down Beach", "Bota", "Middle Farms", "Mile 4", "New Town", "Ngeme", "Cassava Farms", "Man O' War Bay"],
  Buea: ["Molyko", "Mile 17", "Check Point", "Bonduma", "Great Soppo", "Bokwango", "Buea Town", "Bolifamba"],
  Bertoua: ["Enia", "Yadémé", "Kpokolota", "Ndokayo", "Monou", "Tigaza", "Bonis"],
  Ebolowa: ["Mekalat", "Angalé", "Biyébe", "New Bell", "Nko'ovos", "Ebolowa Si II"],
  Kribi: ["Dôme", "Mboa Manga", "Talla", "Nziou", "Bwanjo", "Mpangou", "Londji"],
  Nkongsamba: ["Baré", "Quartier 1", "Quartier 2", "Quartier 3", "Ekel-Ko", "Mbaressoumtou"],
  Dschang: ["Foréké", "Foto", "Keleng", "Tsinfing", "Apouh", "Mingmeto"]
};

export default function FormClientMorale() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [agencies, setAgencies] = useState([]);
  const [generatedNumClient, setGeneratedNumClient] = useState("Sélectionnez une agence");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [gerantTab, setGerantTab] = useState(0);
  const [signataireTab, setSignataireTab] = useState(0);
  const [gerantPreview, setGerantPreview] = useState([null, null]);
  const [signatairePreviews, setSignatairePreviews] = useState([null, null, null]);
  const [signaturePreviews, setSignaturePreviews] = useState([null, null, null]);

  const { control, handleSubmit, trigger, watch, formState: { errors } } = useForm({
    defaultValues: {
      // Infos agence et type
      agency_id: "",
      type_client: "morale",
      type_entreprise: "entreprise",
      
      // Identité entreprise
      raison_sociale: "",
      sigle: "",
      forme_juridique: "",
      
      // Localisation siège
      adresse_ville: "",
      adresse_quartier: "",
      lieu_dit_domicile: "",
      
      // Localisation activité
      lieu_dit_activite: "",
      ville_activite: "",
      quartier_activite: "",
      
      // Contact
      telephone: "",
      email: "",
      bp: "",
      pays_residence: "Cameroun",
      
      // Documents légaux
      rccm: "",
      nui: "",
      
      // Gérance
      nom_gerant: "",
      telephone_gerant: "",
      nom_gerant2: "",
      telephone_gerant2: "",
      
      // Signataires
      nom_signataire: "",
      telephone_signataire: "",
      nom_signataire2: "",
      telephone_signataire2: "",
      nom_signataire3: "",
      telephone_signataire3: "",
      
      // Biens et patrimoine
      solde_initial: "0",
      immobiliere: "",
      autres_biens: "",
      
      // Fichiers
      photo_localisation_domicile: null,
      photo_localisation_activite: null,
      photo_gerant: null,
      photo_gerant2: null,
      photo_signataire: null,
      photo_signataire2: null,
      photo_signataire3: null,
      signature_signataire: null,
      signature_signataire2: null,
      signature_signataire3: null,
    },
    resolver: yupResolver(schemas[activeStep]),
    mode: "onTouched",
    shouldUnregister: false,
  });

  const selectedAgency = watch("agency_id");
  const selectedVille = watch("adresse_ville");

  useEffect(() => {
    ApiClient.get("/agencies")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAgencies(list);
      })
      .catch((err) => {
        console.error("Erreur chargement agences:", err);
        showSnackbar("Erreur lors du chargement des agences", "error");
      });
  }, []);

  useEffect(() => {
    if (selectedAgency) {
      ApiClient.get(`/agencies/${selectedAgency}/next-number`)
        .then((res) => {
          setGeneratedNumClient(res.data.next_number);
          console.log("Numéro client généré:", res.data.next_number);
        })
        .catch((err) => {
          console.error("Erreur génération numéro:", err);
          setGeneratedNumClient("ERREUR");
          showSnackbar("Erreur de génération du numéro client", "error");
        });
    } else {
      setGeneratedNumClient("Sélectionnez une agence");
    }
  }, [selectedAgency]);

  const quartiersOptions = CITY_DATA[selectedVille] || [];

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatErrorMessage = (errorData) => {
    if (!errorData) return "Une erreur est survenue";
    
    if (typeof errorData === 'string') {
      return errorData;
    }
    
    if (errorData.errors) {
      const errorMessages = Object.values(errorData.errors).flat();
      if (errorMessages.length > 0) {
        // Traduire les messages d'erreur
        const translatedErrors = errorMessages.map(msg => {
          if (msg.includes('already been taken')) {
            if (msg.includes('rccm')) return "Ce numéro RCCM existe déjà";
            if (msg.includes('raison_sociale')) return "Une entreprise avec cette raison sociale existe déjà";
          }
          if (msg.includes('must be an image')) return "Le fichier doit être une image";
          if (msg.includes('max:2048')) return "L'image ne doit pas dépasser 2MB";
          if (msg.includes('required')) {
            if (msg.includes('agency_id')) return "L'agence est obligatoire";
            if (msg.includes('raison_sociale')) return "La raison sociale est obligatoire";
            if (msg.includes('rccm')) return "Le numéro RCCM est obligatoire";
            if (msg.includes('nom_gerant')) return "Le nom du gérant est obligatoire";
            if (msg.includes('telephone')) return "Le téléphone est obligatoire";
          }
          return msg;
        });
        return translatedErrors.join(', ');
      }
    }
    
    if (errorData.message) {
      if (errorData.message.includes('already exists')) {
        return "Cette entreprise existe déjà dans la base de données";
      }
      return errorData.message;
    }
    
    return "Une erreur est survenue lors de l'enregistrement";
  };

  const handleGerantPhotoChange = (index, e, onChange) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
      const newPreviews = [...gerantPreview];
      newPreviews[index] = URL.createObjectURL(file);
      setGerantPreview(newPreviews);
    }
  };

  const handleSignatairePhotoChange = (index, e, onChange) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
      const newPreviews = [...signatairePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setSignatairePreviews(newPreviews);
    }
  };

  const handleSignatureChange = (index, e, onChange) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
      const newPreviews = [...signaturePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setSignaturePreviews(newPreviews);
    }
  };

  const onSubmit = async (data) => {
    console.log("Données du formulaire client moral:", data);
    
    try {
      const formData = new FormData();

      // 1. INFOS DE BASE DU CLIENT (table clients)
      formData.append("agency_id", data.agency_id);
      formData.append("type_client", "morale");
      formData.append("telephone", data.telephone || "");
      formData.append("email", data.email || "");
      formData.append("adresse_ville", data.adresse_ville || "");
      formData.append("adresse_quartier", data.adresse_quartier || "");
      formData.append("lieu_dit_domicile", data.lieu_dit_domicile || "");
      formData.append("lieu_dit_activite", data.lieu_dit_activite || "");
      formData.append("ville_activite", data.ville_activite || "");
      formData.append("quartier_activite", data.quartier_activite || "");
      formData.append("bp", data.bp || "");
      formData.append("pays_residence", data.pays_residence || "Cameroun");
      formData.append("solde_initial", data.solde_initial || "0");
      formData.append("immobiliere", data.immobiliere || "");
      formData.append("autres_biens", data.autres_biens || "");

      // 2. FICHIERS DE LOCALISATION
      if (data.photo_localisation_domicile) {
        formData.append("photo_localisation_domicile", data.photo_localisation_domicile);
      }

      if (data.photo_localisation_activite) {
        formData.append("photo_localisation_activite", data.photo_localisation_activite);
      }

      // 3. INFOS MORALES (table clients_morales)
      formData.append("raison_sociale", data.raison_sociale);
      formData.append("sigle", data.sigle || "");
      formData.append("forme_juridique", data.forme_juridique);
      formData.append("type_entreprise", data.type_entreprise);
      formData.append("rccm", data.rccm);
      formData.append("nui", data.nui || "");
      formData.append("nom_gerant", data.nom_gerant);
      formData.append("telephone_gerant", data.telephone_gerant || "");
      formData.append("nom_gerant2", data.nom_gerant2 || "");
      formData.append("telephone_gerant2", data.telephone_gerant2 || "");
      formData.append("nom_signataire", data.nom_signataire || "");
      formData.append("telephone_signataire", data.telephone_signataire || "");
      formData.append("nom_signataire2", data.nom_signataire2 || "");
      formData.append("telephone_signataire2", data.telephone_signataire2 || "");
      formData.append("nom_signataire3", data.nom_signataire3 || "");
      formData.append("telephone_signataire3", data.telephone_signataire3 || "");

      // 4. FICHIERS GERANTS ET SIGNATAIRES
      if (data.photo_gerant) formData.append("photo_gerant", data.photo_gerant);
      if (data.photo_gerant2) formData.append("photo_gerant2", data.photo_gerant2);
      if (data.photo_signataire) formData.append("photo_signataire", data.photo_signataire);
      if (data.photo_signataire2) formData.append("photo_signataire2", data.photo_signataire2);
      if (data.photo_signataire3) formData.append("photo_signataire3", data.photo_signataire3);
      if (data.signature_signataire) formData.append("signature_signataire", data.signature_signataire);
      if (data.signature_signataire2) formData.append("signature_signataire2", data.signature_signataire2);
      if (data.signature_signataire3) formData.append("signature_signataire3", data.signature_signataire3);

      console.log("Envoi FormData client moral...");
      const response = await ApiClient.post("/clients/morale", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Accept": "application/json"
        }
      });

      console.log("Réponse API client moral:", response.data);

      if (response.data.success) {
        showSnackbar(`Entreprise créée avec succès! Numéro: ${response.data.num_client}`, "success");
        setTimeout(() => {
          navigate("/client");
        }, 2000);
      } else {
        const errorMessage = formatErrorMessage(response.data);
        showSnackbar(errorMessage, "error");
      }
    } catch (error) {
      console.error("Erreur API détail client moral:", error.response?.data || error.message);
      
      const errorMessage = formatErrorMessage(error.response?.data);
      showSnackbar(errorMessage, "error");
    }
  };

  return (
    <Layout>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 4, color: indigo[900] }}>
              Fiche Personne Morale (Entreprise)
            </Typography>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
              <Box sx={{ minHeight: "450px" }}>
                
                {/* ÉTAPE 0 : IDENTITÉ & AGENCE */}
                {activeStep === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary">
                        Informations Agence
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Controller 
                        name="agency_id" 
                        control={control} 
                        render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.agency_id}>
                            <InputLabel>Agence *</InputLabel>
                            <Select {...field} label="Agence *" value={field.value || ""}>
                              {agencies.map((a) => (
                                <MenuItem key={a.id} value={a.id}>
                                  {a.code} - {a.agency_name || a.nom}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors.agency_id && <FormHelperText>{errors.agency_id.message}</FormHelperText>}
                          </FormControl>
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField 
                        fullWidth 
                        size="small" 
                        label="Numéro Client" 
                        value={generatedNumClient} 
                        disabled 
                        variant="filled"
                        InputProps={{ style: { fontWeight: 'bold' } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Controller 
                        name="type_entreprise" 
                        control={control} 
                        render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.type_entreprise}>
                            <InputLabel>Type d'entreprise *</InputLabel>
                            <Select {...field} label="Type d'entreprise *" value={field.value || ""}>
                              <MenuItem value="entreprise">Entreprise</MenuItem>
                              <MenuItem value="association">Association</MenuItem>
                            </Select>
                            {errors.type_entreprise && <FormHelperText>{errors.type_entreprise.message}</FormHelperText>}
                          </FormControl>
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                        Identité de l'Entreprise
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={8}>
                      <Controller 
                        name="raison_sociale" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Raison Sociale *" 
                            error={!!errors.raison_sociale} 
                            helperText={errors.raison_sociale?.message}
                          />
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Controller 
                        name="sigle" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Sigle (Optionnel)" 
                          />
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Controller 
                        name="forme_juridique" 
                        control={control} 
                        render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.forme_juridique}>
                            <InputLabel>Forme Juridique *</InputLabel>
                            <Select {...field} label="Forme Juridique *" value={field.value || ""}>
                              <MenuItem value="SARL">SARL</MenuItem>
                              <MenuItem value="SA">SA</MenuItem>
                              <MenuItem value="SNC">SNC</MenuItem>
                              <MenuItem value="SCS">SCS</MenuItem>
                              <MenuItem value="SCA">SCA</MenuItem>
                              <MenuItem value="GIE">GIE</MenuItem>
                              <MenuItem value="ETS">Établissement</MenuItem>
                              <MenuItem value="ASBL">ASBL</MenuItem>
                              <MenuItem value="ONG">ONG</MenuItem>
                              <MenuItem value="COOP">Coopérative</MenuItem>
                            </Select>
                            {errors.forme_juridique && <FormHelperText>{errors.forme_juridique.message}</FormHelperText>}
                          </FormControl>
                        )} 
                      />
                    </Grid>
                  </Grid>
                )}

                {/* ÉTAPE 1 : SIÈGE & CONTACT */}
                {activeStep === 1 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary">
                        Siège Social
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller 
                        name="adresse_ville" 
                        control={control} 
                        render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.adresse_ville}>
                            <InputLabel>Ville du siège *</InputLabel>
                            <Select {...field} label="Ville du siège *" value={field.value || ""}>
                              {Object.keys(CITY_DATA).map(ville => (
                                <MenuItem key={ville} value={ville}>{ville}</MenuItem>
                              ))}
                            </Select>
                            {errors.adresse_ville && <FormHelperText>{errors.adresse_ville.message}</FormHelperText>}
                          </FormControl>
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller 
                        name="adresse_quartier" 
                        control={control} 
                        render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.adresse_quartier}>
                            <InputLabel>Quartier *</InputLabel>
                            <Select {...field} label="Quartier *" value={field.value || ""}>
                              {quartiersOptions.map(quartier => (
                                <MenuItem key={quartier} value={quartier}>{quartier}</MenuItem>
                              ))}
                            </Select>
                            {errors.adresse_quartier && <FormHelperText>{errors.adresse_quartier.message}</FormHelperText>}
                          </FormControl>
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller 
                        name="lieu_dit_domicile" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Lieu-dit du siège" 
                          />
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                        Localisation de l'Activité
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Controller 
                        name="ville_activite" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Ville de l'activité" 
                          />
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Controller 
                        name="quartier_activite" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Quartier de l'activité" 
                          />
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Controller 
                        name="lieu_dit_activite" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Lieu-dit de l'activité" 
                          />
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                        Contact
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller 
                        name="telephone" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Téléphone *" 
                            error={!!errors.telephone} 
                            helperText={errors.telephone?.message}
                          />
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller 
                        name="email" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Email" 
                            type="email"
                          />
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller 
                        name="bp" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Boîte Postale" 
                          />
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller 
                        name="pays_residence" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Pays de résidence" 
                            value="Cameroun" 
                            disabled
                          />
                        )} 
                      />
                    </Grid>
                  </Grid>
                )}

                {/* ÉTAPE 2 : DOCUMENTS LÉGAUX */}
                {activeStep === 2 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary">
                        Registres Légaux
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller 
                        name="rccm" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Numéro RCCM *" 
                            error={!!errors.rccm} 
                            helperText={errors.rccm?.message}
                            placeholder="Ex: RCCM/CM-CMR/2024/B/00123"
                          />
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller 
                        name="nui" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Numéro NUI" 
                            placeholder="Ex: M1234567890"
                          />
                        )} 
                      />
                    </Grid>
                  </Grid>
                )}

                {/* ÉTAPE 3 : GÉRANCE & SIGNATAIRES */}
                {activeStep === 3 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary">
                        Gérants (Maximum 2)
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Tabs value={gerantTab} onChange={(e, v) => setGerantTab(v)}>
                        <Tab label="Gérant Principal" />
                        <Tab label="Gérant Secondaire (Optionnel)" />
                      </Tabs>
                    </Grid>
                    
                    {gerantTab === 0 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="nom_gerant" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Nom du Gérant Principal *" 
                                error={!!errors.nom_gerant} 
                                helperText={errors.nom_gerant?.message}
                                placeholder="Nom et prénoms du gérant"
                              />
                            )} 
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="telephone_gerant" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Téléphone Gérant Principal" 
                                placeholder="Ex: 677123456"
                              />
                            )} 
                          />
                        </Grid>
                      </Grid>
                    )}
                    
                    {gerantTab === 1 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="nom_gerant2" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Nom du Gérant Secondaire" 
                                placeholder="Nom et prénoms"
                              />
                            )} 
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="telephone_gerant2" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Téléphone Gérant Secondaire" 
                                placeholder="Ex: 699987654"
                              />
                            )} 
                          />
                        </Grid>
                      </Grid>
                    )}
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 4 }}>
                        Signataires (Maximum 3)
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Tabs value={signataireTab} onChange={(e, v) => setSignataireTab(v)}>
                        <Tab label="Signataire 1" />
                        <Tab label="Signataire 2" />
                        <Tab label="Signataire 3" />
                      </Tabs>
                    </Grid>
                    
                    {signataireTab === 0 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="nom_signataire" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Nom Signataire 1" 
                                placeholder="Nom et prénoms"
                              />
                            )} 
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="telephone_signataire" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Téléphone Signataire 1" 
                                placeholder="Ex: 677111222"
                              />
                            )} 
                          />
                        </Grid>
                      </Grid>
                    )}
                    
                    {signataireTab === 1 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="nom_signataire2" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Nom Signataire 2" 
                                placeholder="Nom et prénoms"
                              />
                            )} 
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="telephone_signataire2" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Téléphone Signataire 2" 
                                placeholder="Ex: 699333444"
                              />
                            )} 
                          />
                        </Grid>
                      </Grid>
                    )}
                    
                    {signataireTab === 2 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="nom_signataire3" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Nom Signataire 3" 
                                placeholder="Nom et prénoms"
                              />
                            )} 
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="telephone_signataire3" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Téléphone Signataire 3" 
                                placeholder="Ex: 677555666"
                              />
                            )} 
                          />
                        </Grid>
                      </Grid>
                    )}
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 4 }}>
                        Patrimoine et Capitaux
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Controller 
                        name="solde_initial" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Solde Initial (FCFA)" 
                            type="number"
                            InputProps={{ inputProps: { min: 0, step: 100 } }}
                          />
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={8}>
                      <Controller 
                        name="immobiliere" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Biens Immobiliers" 
                            multiline 
                            rows={2}
                            placeholder="Décrivez les biens immobiliers..."
                          />
                        )} 
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Controller 
                        name="autres_biens" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Autres Biens et Actifs" 
                            multiline 
                            rows={3}
                            placeholder="Matériel, équipements, véhicules, stocks..."
                          />
                        )} 
                      />
                    </Grid>
                  </Grid>
                )}

                {/* ÉTAPE 4 : FICHIERS & PHOTOS */}
                {activeStep === 4 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary">
                        Photos de Localisation
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                          Photo localisation siège
                        </Typography>
                        <Controller 
                          name="photo_localisation_domicile" 
                          control={control} 
                          render={({ field }) => (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => field.onChange(e.target.files[0])}
                              style={{ width: '100%' }}
                            />
                          )} 
                        />
                        <Typography variant="caption" color="textSecondary">
                          Format: JPEG, PNG (max 2MB)
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                          Photo localisation activité
                        </Typography>
                        <Controller 
                          name="photo_localisation_activite" 
                          control={control} 
                          render={({ field }) => (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => field.onChange(e.target.files[0])}
                              style={{ width: '100%' }}
                            />
                          )} 
                        />
                        <Typography variant="caption" color="textSecondary">
                          Format: JPEG, PNG (max 2MB)
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                        Photos des Gérants
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar 
                            src={gerantPreview[0]} 
                            sx={{ width: 60, height: 60 }}
                          >
                            <PhotoCamera />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: indigo[700] }}>
                              Photo Gérant Principal
                            </Typography>
                            <Controller 
                              name="photo_gerant" 
                              control={control} 
                              render={({ field }) => (
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleGerantPhotoChange(0, e, field.onChange)}
                                  style={{ width: '100%' }}
                                />
                              )} 
                            />
                          </Box>
                        </Stack>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar 
                            src={gerantPreview[1]} 
                            sx={{ width: 60, height: 60 }}
                          >
                            <PhotoCamera />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: indigo[700] }}>
                              Photo Gérant Secondaire
                            </Typography>
                            <Controller 
                              name="photo_gerant2" 
                              control={control} 
                              render={({ field }) => (
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleGerantPhotoChange(1, e, field.onChange)}
                                  style={{ width: '100%' }}
                                />
                              )} 
                            />
                          </Box>
                        </Stack>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                        Photos et Signatures des Signataires
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                          Signataire 1
                        </Typography>
                        <Stack spacing={2}>
                          <Controller 
                            name="photo_signataire" 
                            control={control} 
                            render={({ field }) => (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSignatairePhotoChange(0, e, field.onChange)}
                                placeholder="Photo"
                                style={{ width: '100%' }}
                              />
                            )} 
                          />
                          <Controller 
                            name="signature_signataire" 
                            control={control} 
                            render={({ field }) => (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSignatureChange(0, e, field.onChange)}
                                placeholder="Signature"
                                style={{ width: '100%' }}
                              />
                            )} 
                          />
                        </Stack>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                          Signataire 2
                        </Typography>
                        <Stack spacing={2}>
                          <Controller 
                            name="photo_signataire2" 
                            control={control} 
                            render={({ field }) => (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSignatairePhotoChange(1, e, field.onChange)}
                                placeholder="Photo"
                                style={{ width: '100%' }}
                              />
                            )} 
                          />
                          <Controller 
                            name="signature_signataire2" 
                            control={control} 
                            render={({ field }) => (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSignatureChange(1, e, field.onChange)}
                                placeholder="Signature"
                                style={{ width: '100%' }}
                              />
                            )} 
                          />
                        </Stack>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                          Signataire 3
                        </Typography>
                        <Stack spacing={2}>
                          <Controller 
                            name="photo_signataire3" 
                            control={control} 
                            render={({ field }) => (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSignatairePhotoChange(2, e, field.onChange)}
                                placeholder="Photo"
                                style={{ width: '100%' }}
                              />
                            )} 
                          />
                          <Controller 
                            name="signature_signataire3" 
                            control={control} 
                            render={({ field }) => (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSignatureChange(2, e, field.onChange)}
                                placeholder="Signature"
                                style={{ width: '100%' }}
                              />
                            )} 
                          />
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                )}

              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button 
                  type="button" 
                  variant="outlined" 
                  disabled={activeStep === 0} 
                  onClick={() => setActiveStep(s => s - 1)}
                >
                  Précédent
                </Button>

                {activeStep === STEPS.length - 1 ? (
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    type="submit" 
                    sx={{ px: 4 }}
                  >
                    Enregistrer l'Entreprise
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    variant="contained" 
                    onClick={async () => {
                      const isValid = await trigger();
                      if (isValid) {
                        setActiveStep(s => s + 1);
                      }
                    }}
                  >
                    Suivant
                  </Button>
                )}
              </Box>
            </form>
          </Paper>
        </Container>

        {/* Snackbar pour les notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </Layout>
  );
}