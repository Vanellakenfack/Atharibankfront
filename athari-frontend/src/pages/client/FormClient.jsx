import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  ThemeProvider, createTheme, CssBaseline, Container, Box, Grid, TextField,
  Button, Stepper, Step, StepLabel, Select, MenuItem, InputLabel, 
  FormControl, Typography, Divider, Paper, FormHelperText, Snackbar, Alert
} from "@mui/material";
import { indigo, blueGrey, cyan } from "@mui/material/colors";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import ApiClient from "../../services/api/ApiClient"; 
import Layout from "../../components/layout/Layout";
import { Upload as UploadIcon } from "@mui/icons-material";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: indigo[700] },
    secondary: { main: cyan.A700 },
    background: { default: blueGrey[50] },
  },
  shape: { borderRadius: 12 },
});

const STEPS = ["Identité & Agence", "Localisation & Contact", "Documents & Profession", "Famille & Biens", "Documents CNI"];

const schemas = [
  Yup.object({
    agency_id: Yup.string().required("L'agence est obligatoire"),
    nom_prenoms: Yup.string().required("Le nom est obligatoire"),
    sexe: Yup.string().required("Le sexe est obligatoire"),
    date_naissance: Yup.string().required("La date de naissance est obligatoire"),
  }),
  Yup.object({
    adresse_ville: Yup.string().required("La ville est obligatoire"),
    adresse_quartier: Yup.string().required("Le quartier est obligatoire"),
    telephone: Yup.string().required("Le téléphone est obligatoire"),
  }),
  Yup.object({
    cni_numero: Yup.string().required("Le numéro de CNI est obligatoire"),
    profession: Yup.string().required("La profession est requise"),
  }),
  Yup.object({}),
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

export default function FormClient() {
  const fileInputRef = useRef(null);
  const domicilePhotoRef = useRef(null);
  const activitePhotoRef = useRef(null);
  const cniRectoRef = useRef(null);
  const cniVersoRef = useRef(null);
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [activeStep, setActiveStep] = useState(0);
  const [agencies, setAgencies] = useState([]);
  const [generatedNumClient, setGeneratedNumClient] = useState("EN ATTENTE...");
  const [cniRectoPreview, setCniRectoPreview] = useState(null);
  const [cniVersoPreview, setCniVersoPreview] = useState(null);

  const { control, handleSubmit, trigger, watch, formState: { errors } } = useForm({
    defaultValues: {
      // Infos agence et type
      agency_id: "", 
      type_client: "physique",
      
      // Identité
      nom_prenoms: "", 
      sexe: "",
      date_naissance: "", 
      lieu_naissance: "", 
      nationalite: "Camerounaise",
      
      // Localisation principale
      adresse_ville: "", 
      adresse_quartier: "", 
      lieu_dit_domicile: "",
      photo_localisation_domicile: null,
      
      // Localisation activité
      lieu_dit_activite: "",
      ville_activite: "",
      quartier_activite: "",
      photo_localisation_activite: null,
      
      // Contact
      bp: "", 
      email: "", 
      telephone: "",
      pays_residence: "Cameroun",
      
      // Documents
      cni_numero: "", 
      cni_delivrance: "", 
      cni_expiration: "",
      nui: "",
      cni_recto: null,
      cni_verso: null,
      
      // Parents
      nom_mere: "", 
      nom_pere: "",
      nationalite_mere: "",
      nationalite_pere: "",
      
      // Profession
      profession: "", 
      employeur: "",
      
      // Situation familiale
      situation_familiale: "",
      nom_conjoint: "", 
      date_naissance_conjoint: "", 
      cni_conjoint: "",
      profession_conjoint: "", 
      salaire: "",
      tel_conjoint: "",
      
      // Biens
      solde_initial: "0",
      immobiliere: "",
      autres_biens: "",
      
      // Photos
      photo: null,
      signature: null,
    },
    resolver: yupResolver(schemas[activeStep]),
    mode: "onTouched",
    shouldUnregister: false,
  });

  const selectedAgency = watch("agency_id");
  const selectedVille = watch("adresse_ville");

  // 1. Charger les agences
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

  // 2. Générer le numéro client quand une agence est sélectionnée
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

  const quartiersOptions = useMemo(() => 
    (selectedVille ? CITY_DATA[selectedVille] || [] : []), 
    [selectedVille]
  );

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

  const handleCniRectoChange = (e, onChange) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
      setCniRectoPreview(URL.createObjectURL(file));
    }
  };

  const handleCniVersoChange = (e, onChange) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
      setCniVersoPreview(URL.createObjectURL(file));
    }
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
            if (msg.includes('cni_numero')) return "Ce numéro de CNI existe déjà";
            if (msg.includes('nom_prenoms')) return "Un client avec ce nom existe déjà";
          }
          if (msg.includes('must be an image')) return "Le fichier doit être une image";
          if (msg.includes('max:2048')) return "L'image ne doit pas dépasser 2MB";
          if (msg.includes('required')) {
            if (msg.includes('agency_id')) return "L'agence est obligatoire";
            if (msg.includes('nom_prenoms')) return "Le nom est obligatoire";
            if (msg.includes('cni_numero')) return "Le numéro de CNI est obligatoire";
            if (msg.includes('telephone')) return "Le téléphone est obligatoire";
          }
          return msg;
        });
        return translatedErrors.join(', ');
      }
    }
    
    if (errorData.message) {
      if (errorData.message.includes('already exists')) {
        return "Ce client existe déjà dans la base de données";
      }
      return errorData.message;
    }
    
    return "Une erreur est survenue lors de l'enregistrement";
  };

  const onSubmit = async (data) => {
    console.log("Données du formulaire physique:", data);
    
    try {
      const formData = new FormData();

      // 1. INFOS DE BASE DU CLIENT
      formData.append("agency_id", data.agency_id);
      formData.append("type_client", "physique");
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

      // 2. GESTION DES FICHIERS DE LOCALISATION
      if (data.photo_localisation_domicile) {
        formData.append("photo_localisation_domicile", data.photo_localisation_domicile);
      }

      if (data.photo_localisation_activite) {
        formData.append("photo_localisation_activite", data.photo_localisation_activite);
      }

      // 3. INFOS PHYSIQUES
      formData.append("nom_prenoms", data.nom_prenoms);
      formData.append("sexe", data.sexe);
      formData.append("date_naissance", data.date_naissance);
      formData.append("lieu_naissance", data.lieu_naissance || "");
      formData.append("nationalite", data.nationalite || "Camerounaise");
      formData.append("nui", data.nui || "");
      formData.append("cni_numero", data.cni_numero);
      formData.append("cni_delivrance", data.cni_delivrance || "");
      formData.append("cni_expiration", data.cni_expiration || "");
      formData.append("nom_pere", data.nom_pere || "");
      formData.append("nom_mere", data.nom_mere || "");
      formData.append("nationalite_pere", data.nationalite_pere || "");
      formData.append("nationalite_mere", data.nationalite_mere || "");
      formData.append("profession", data.profession || "");
      formData.append("employeur", data.employeur || "");
      formData.append("situation_familiale", data.situation_familiale || "");
      formData.append("regime_matrimonial", data.regime_matrimonial || "");
      formData.append("nom_conjoint", data.nom_conjoint || "");
      formData.append("date_naissance_conjoint", data.date_naissance_conjoint || "");
      formData.append("cni_conjoint", data.cni_conjoint || "");
      formData.append("profession_conjoint", data.profession_conjoint || "");
      formData.append("salaire", data.salaire || "");
      formData.append("tel_conjoint", data.tel_conjoint || "");

      // 4. GESTION DES FICHIERS PERSO
      if (data.photo) {
        formData.append("photo", data.photo);
      }

      if (data.signature) {
        formData.append("signature", data.signature);
      }

      // 5. FICHIERS CNI
      if (data.cni_recto) {
        formData.append("cni_recto", data.cni_recto);
      }

      if (data.cni_verso) {
        formData.append("cni_verso", data.cni_verso);
      }

      console.log("Envoi FormData...");
      const response = await ApiClient.post("/clients/physique", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Accept": "application/json"
        }
      });

      console.log("Réponse API:", response.data);

      if (response.data.success) {
        showSnackbar(`Client créé avec succès! Numéro: ${response.data.num_client}`, "success");
        setTimeout(() => {
          navigate("/client");
        }, 2000);
      } else {
        const errorMessage = formatErrorMessage(response.data);
        showSnackbar(errorMessage, "error");
      }
    } catch (error) {
      console.error("Erreur API détail:", error.response?.data || error.message);
      
      const errorMessage = formatErrorMessage(error.response?.data);
      showSnackbar(errorMessage, "error");
    }
  };

  return (
    <Layout>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Box sx={{ minHeight: "100vh", bgcolor: blueGrey[50], py: 5 }}>
          <Container maxWidth="lg">
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 4, color: indigo[900] }}>
                Nouveau Client Physique
              </Typography>
              
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
                {STEPS.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
              </Stepper>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ minHeight: "450px" }}>
                  
                  {/* ÉTAPE 0 : ADMINISTRATIF & IDENTITÉ */}
                  {activeStep === 0 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Infos Agence
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="agency_id" control={control} render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.agency_id} required>
                            <InputLabel>Agence *</InputLabel>
                            <Select label="Agence *" {...field} value={field.value || ""}>
                              {agencies.map((a) => (
                                <MenuItem key={a.id} value={a.id}>{a.code} - {a.agency_name || a.nom}</MenuItem>
                              ))}
                            </Select>
                            {errors.agency_id && <FormHelperText>{errors.agency_id.message}</FormHelperText>}
                          </FormControl>
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <TextField 
                          fullWidth 
                          size="small" 
                          label="ID Client" 
                          value={generatedNumClient} 
                          disabled 
                          variant="filled" 
                          InputProps={{ readOnly: true, style: { fontWeight: 'bold' } }} 
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Identité
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={8}>
                        <Controller name="nom_prenoms" control={control} render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Nom & Prénoms *" 
                            required 
                            error={!!errors.nom_prenoms} 
                            helperText={errors.nom_prenoms?.message} 
                          />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="sexe" control={control} render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.sexe} required>
                            <InputLabel>Sexe *</InputLabel>
                            <Select label="Sexe *" {...field} value={field.value || ""}>
                              <MenuItem value="M">Masculin</MenuItem>
                              <MenuItem value="F">Féminin</MenuItem>
                            </Select>
                          </FormControl>
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="date_naissance" control={control} render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            type="date" 
                            label="Date Naissance *" 
                            required 
                            InputLabelProps={{ shrink: true }} 
                            error={!!errors.date_naissance} 
                            helperText={errors.date_naissance?.message} 
                          />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="lieu_naissance" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Lieu Naissance" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="nationalite" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Nationalité" />
                        )} />
                      </Grid>
                    </Grid>
                  )}

                  {/* ÉTAPE 1 : LOCALISATION & CONTACT */}
                  {activeStep === 1 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Localisation Domicile
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="adresse_ville" control={control} render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.adresse_ville} required>
                            <InputLabel>Ville *</InputLabel>
                            <Select label="Ville *" {...field} value={field.value || ""}>
                              {Object.keys(CITY_DATA).map(v => (
                                <MenuItem key={v} value={v}>{v}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="adresse_quartier" control={control} render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.adresse_quartier} required>
                            <InputLabel>Quartier *</InputLabel>
                            <Select label="Quartier *" {...field} value={field.value || ""}>
                              {quartiersOptions.map(q => (
                                <MenuItem key={q} value={q}>{q}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="lieu_dit_domicile" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Lieu-dit Domicile" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                            Photo Localisation Domicile
                          </Typography>
                          <Controller name="photo_localisation_domicile" control={control} render={({ field }) => (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => field.onChange(e.target.files[0])}
                              ref={domicilePhotoRef}
                            />
                          )} />
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Localisation Activité
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="ville_activite" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Ville Activité" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="quartier_activite" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Quartier Activité" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="lieu_dit_activite" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Lieu-dit Activité" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                            Photo Localisation Activité
                          </Typography>
                          <Controller name="photo_localisation_activite" control={control} render={({ field }) => (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => field.onChange(e.target.files[0])}
                              ref={activitePhotoRef}
                            />
                          )} />
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Contact
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="telephone" control={control} render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Téléphone Principal *" 
                            required 
                            error={!!errors.telephone}
                            helperText={errors.telephone?.message}
                          />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="email" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Email" type="email" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="bp" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Boite Postale" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="pays_residence" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Pays de Résidence" value="Cameroun" disabled />
                        )} />
                      </Grid>
                    </Grid>
                  )}

                  {/* ÉTAPE 2 : DOCUMENTS & PROFESSION */}
                  {activeStep === 2 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Documents d'Identité
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="cni_numero" control={control} render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="N° CNI *" 
                            required 
                            error={!!errors.cni_numero} 
                            helperText={errors.cni_numero?.message} 
                          />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="cni_delivrance" control={control} render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            type="date" 
                            label="Délivré le" 
                            InputLabelProps={{ shrink: true }} 
                          />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="cni_expiration" control={control} render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            type="date" 
                            label="Expire le" 
                            InputLabelProps={{ shrink: true }} 
                          />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="nui" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="N° NUI" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Profession
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Controller name="profession" control={control} render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Profession *" 
                            required 
                            error={!!errors.profession} 
                            helperText={errors.profession?.message} 
                          />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Controller name="employeur" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Employeur" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Documents Personnels
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                            Photo du Client
                          </Typography>
                          <Controller name="photo" control={control} render={({ field }) => (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => field.onChange(e.target.files[0])}
                            />
                          )} />
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                            Signature du Client
                          </Typography>
                          <Controller name="signature" control={control} render={({ field }) => (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => field.onChange(e.target.files[0])}
                            />
                          )} />
                        </Box>
                      </Grid>
                    </Grid>
                  )}

                  {/* ÉTAPE 3 : FAMILLE & BIENS */}
                  {activeStep === 3 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Parents
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Controller name="nom_pere" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Nom du Père" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Controller name="nationalite_pere" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Nationalité Père" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Controller name="nom_mere" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Nom de la Mère" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Controller name="nationalite_mere" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Nationalité Mère" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Situation Familiale
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="situation_familiale" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Situation Familiale" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={8}>
                        <Controller name="nom_conjoint" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Nom du Conjoint" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="date_naissance_conjoint" control={control} render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            type="date" 
                            label="Date Naissance Conjoint" 
                            InputLabelProps={{ shrink: true }} 
                          />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="cni_conjoint" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="CNI Conjoint" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="profession_conjoint" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Profession Conjoint" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="salaire" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Salaire" type="number" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="tel_conjoint" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Téléphone Conjoint" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Biens et Patrimoine
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller name="solde_initial" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Solde Initial" type="number" />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={8}>
                        <Controller name="immobiliere" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Immobilière" multiline rows={2} />
                        )} />
                      </Grid>
                      
                      <Grid item xs={12} md={12}>
                        <Controller name="autres_biens" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Autres Biens" multiline rows={3} />
                        )} />
                      </Grid>
                    </Grid>
                  )}

                  {/* ÉTAPE 4 : DOCUMENTS CNI */}
                  {activeStep === 4 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Documents CNI (Recto et Verso)
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa', textAlign: 'center' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                            Recto de la CNI
                          </Typography>
                          {cniRectoPreview && (
                            <img 
                              src={cniRectoPreview} 
                              alt="Recto CNI" 
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '200px', 
                                borderRadius: '8px',
                                marginBottom: '10px'
                              }} 
                            />
                          )}
                          <Controller name="cni_recto" control={control} render={({ field }) => (
                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={<UploadIcon />}
                              sx={{ mt: 1 }}
                            >
                              {cniRectoPreview ? 'Changer le recto' : 'Télécharger le recto'}
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => handleCniRectoChange(e, field.onChange)}
                                ref={cniRectoRef}
                              />
                            </Button>
                          )} />
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa', textAlign: 'center' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                            Verso de la CNI
                          </Typography>
                          {cniVersoPreview && (
                            <img 
                              src={cniVersoPreview} 
                              alt="Verso CNI" 
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '200px', 
                                borderRadius: '8px',
                                marginBottom: '10px'
                              }} 
                            />
                          )}
                          <Controller name="cni_verso" control={control} render={({ field }) => (
                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={<UploadIcon />}
                              sx={{ mt: 1 }}
                            >
                              {cniVersoPreview ? 'Changer le verso' : 'Télécharger le verso'}
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => handleCniVersoChange(e, field.onChange)}
                                ref={cniVersoRef}
                              />
                            </Button>
                          )} />
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ mt: 2 }}>
                          Veuillez télécharger les deux côtés de la CNI (recto et verso). 
                          Format accepté : JPG, PNG (max 2MB par fichier)
                        </Alert>
                      </Grid>
                    </Grid>
                  )}

                </Box>

                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button 
                    variant="outlined" 
                    type="button" 
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
                      Enregistrer le client
                    </Button>
                  ) : (
                    <Button 
                      variant="contained" 
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        const isValid = await trigger();
                        if (isValid) {
                          setActiveStep((s) => s + 1);
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
        </Box>

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