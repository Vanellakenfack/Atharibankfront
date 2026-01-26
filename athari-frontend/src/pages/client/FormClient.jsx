import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  ThemeProvider, createTheme, CssBaseline, Container, Box, Grid, TextField,
  Button, Stepper, Step, StepLabel, Select, MenuItem, InputLabel,
  FormControl, Typography, Divider, Paper, FormHelperText, Snackbar, Alert,
  IconButton
} from "@mui/material";
import { indigo, blueGrey, cyan } from "@mui/material/colors";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import ApiClient from "../../services/api/ApiClient";
import Layout from "../../components/layout/Layout";
import {
  Upload as UploadIcon,
  Close
} from "@mui/icons-material";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: indigo[700] },
    secondary: { main: cyan.A700 },
    background: { default: blueGrey[50] },
  },
  shape: { borderRadius: 12 },
});

const ETAPES = [
  "Identité & Agence",
  "Localisation & Contact",
  "Documents & Profession",
  "Famille & Biens",
  "Documents CNI & NUI"
];

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
    photo_localisation_domicile: Yup.mixed().required("La photo de localisation du domicile est obligatoire"),
    ville_activite: Yup.string().required("La ville d'activité est obligatoire"),
    quartier_activite: Yup.string().required("Le quartier d'activité est obligatoire"),
    lieu_dit_activite: Yup.string().required("Le lieu-dit d'activité est obligatoire"),
    photo_localisation_activite: Yup.mixed().required("La photo de localisation d'activité est obligatoire"),
  }),
  Yup.object({
    cni_numero: Yup.string().required("Le numéro de CNI est obligatoire"),
    profession: Yup.string().required("La profession est requise"),
    nui: Yup.string().required("Le NUI est obligatoire"),
    photo: Yup.mixed().required("La photo du client est obligatoire"),
    signature: Yup.mixed().required("La signature du client est obligatoire"),
  }),
  Yup.object({}),
  Yup.object({
    cni_recto: Yup.mixed().required("Le recto de la CNI est obligatoire"),
    cni_verso: Yup.mixed().required("Le verso de la CNI est obligatoire"),
    niu_image: Yup.mixed().required("La photocopie NUI est obligatoire"),
  }),
];

const DONNEES_VILLES = {
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

export default function FormulaireClient() {
  const domicilePhotoRef = useRef(null);
  const activitePhotoRef = useRef(null);
  const cniRectoRef = useRef(null);
  const cniVersoRef = useRef(null);
  const niuImageRef = useRef(null);
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    ouvert: false,
    message: "",
    severite: "success"
  });

  const [etapeActive, setEtapeActive] = useState(0);
  const [agences, setAgences] = useState([]);
  const [numeroClientGenere, setNumeroClientGenere] = useState("EN ATTENTE...");
  const [apercuCniRecto, setApercuCniRecto] = useState(null);
  const [apercuCniVerso, setApercuCniVerso] = useState(null);
  const [apercuNiuImage, setApercuNiuImage] = useState(null);

  // CORRECTION : Utilisation correcte de formState
  const { 
    control, 
    handleSubmit, 
    trigger, 
    watch, 
    setValue, 
    formState 
  } = useForm({
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
      niu_image: null,

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
    resolver: yupResolver(schemas[etapeActive]),
    mode: "onTouched",
    shouldUnregister: false,
  });

  // CORRECTION : Déstructuration correcte après avoir obtenu formState
  const { errors: erreurs } = formState;

  const agenceSelectionnee = watch("agency_id");
  const villeSelectionnee = watch("adresse_ville");

  // 1. Charger les agences
  useEffect(() => {
    ApiClient.get("/agencies")
      .then((res) => {
        const liste = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAgences(liste);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des agences:", err);
        afficherSnackbar("Erreur lors du chargement des agences", "error");
      });
  }, []);

  // 2. Générer le numéro client quand une agence est sélectionnée
  useEffect(() => {
    if (agenceSelectionnee) {
      ApiClient.get(`/agencies/${agenceSelectionnee}/next-number`)
        .then((res) => {
          setNumeroClientGenere(res.data.next_number);
          console.log("Numéro client généré:", res.data.next_number);
        })
        .catch((err) => {
          console.error("Erreur de génération du numéro:", err);
          setNumeroClientGenere("ERREUR");
          afficherSnackbar("Erreur de génération du numéro client", "error");
        });
    } else {
      setNumeroClientGenere("Sélectionnez une agence");
    }
  }, [agenceSelectionnee]);

  const optionsQuartiers = useMemo(() =>
    (villeSelectionnee ? DONNEES_VILLES[villeSelectionnee] || [] : []),
    [villeSelectionnee]
  );

  const afficherSnackbar = (message, severite = "success") => {
    setSnackbar({
      ouvert: true,
      message,
      severite
    });
  };

  const fermerSnackbar = () => {
    setSnackbar({ ...snackbar, ouvert: false });
  };

  const gererChangementCniRecto = (e, onChange) => {
    const fichier = e.target.files[0];
    if (fichier) {
      onChange(fichier);
      setApercuCniRecto(URL.createObjectURL(fichier));
    }
  };

  const gererChangementCniVerso = (e, onChange) => {
    const fichier = e.target.files[0];
    if (fichier) {
      onChange(fichier);
      setApercuCniVerso(URL.createObjectURL(fichier));
    }
  };

  const gererChangementNiuImage = (e, onChange) => {
    const fichier = e.target.files[0];
    if (fichier) {
      onChange(fichier);
      setApercuNiuImage(URL.createObjectURL(fichier));
    }
  };

  const supprimerFichier = (champ, setApercu = null) => {
    setValue(champ, null, { shouldValidate: true });
    if (setApercu) {
      setApercu(null);
    }
  };

  const formaterMessageErreur = (donneesErreur) => {
    if (!donneesErreur) return "Une erreur est survenue";

    if (typeof donneesErreur === 'string') {
      return donneesErreur;
    }

    if (donneesErreur.errors) {
      const messagesErreur = Object.values(donneesErreur.errors).flat();
      if (messagesErreur.length > 0) {
        const erreursTraduites = messagesErreur.map(msg => {
          if (msg.includes('already been taken')) {
            if (msg.includes('cni_numero')) return "Ce numéro de CNI existe déjà";
            if (msg.includes('nom_prenoms')) return "Un client avec ce nom existe déjà";
            if (msg.includes('nui')) return "Ce NUI est déjà utilisé";
          }
          if (msg.includes('must be an image')) return "Le fichier doit être une image";
          if (msg.includes('max:2048')) return "L'image ne doit pas dépasser 2MB";
          if (msg.includes('required')) {
            if (msg.includes('agency_id')) return "L'agence est obligatoire";
            if (msg.includes('nom_prenoms')) return "Le nom est obligatoire";
            if (msg.includes('cni_numero')) return "Le numéro de CNI est obligatoire";
            if (msg.includes('telephone')) return "Le téléphone est obligatoire";
            if (msg.includes('photo_localisation_domicile')) return "La photo de localisation du domicile est obligatoire";
            if (msg.includes('ville_activite')) return "La ville d'activité est obligatoire";
            if (msg.includes('quartier_activite')) return "Le quartier d'activité est obligatoire";
            if (msg.includes('lieu_dit_activite')) return "Le lieu-dit d'activité est obligatoire";
            if (msg.includes('photo_localisation_activite')) return "La photo de localisation d'activité est obligatoire";
            if (msg.includes('nui')) return "Le NUI est obligatoire";
            if (msg.includes('niu_image')) return "La photocopie NUI est obligatoire";
            if (msg.includes('photo')) return "La photo du client est obligatoire";
            if (msg.includes('signature')) return "La signature du client est obligatoire";
            if (msg.includes('cni_recto')) return "Le recto de la CNI est obligatoire";
            if (msg.includes('cni_verso')) return "Le verso de la CNI est obligatoire";
          }
          return msg;
        });
        return erreursTraduites.join(', ');
      }
    }

    if (donneesErreur.message) {
      if (donneesErreur.message.includes('already exists')) {
        return "Ce client existe déjà dans la base de données";
      }
      return donneesErreur.message;
    }

    return "Une erreur est survenue lors de l'enregistrement";
  };

  const soumettreFormulaire = async (donnees) => {
    console.log("Données du formulaire physique:", donnees);

    try {
      const formData = new FormData();

      // 1. INFOS DE BASE DU CLIENT
      formData.append("agency_id", donnees.agency_id);
      formData.append("type_client", "physique");
      formData.append("telephone", donnees.telephone || "");
      formData.append("email", donnees.email || "");
      formData.append("adresse_ville", donnees.adresse_ville || "");
      formData.append("adresse_quartier", donnees.adresse_quartier || "");
      formData.append("lieu_dit_domicile", donnees.lieu_dit_domicile || "");
      formData.append("lieu_dit_activite", donnees.lieu_dit_activite || "");
      formData.append("ville_activite", donnees.ville_activite || "");
      formData.append("quartier_activite", donnees.quartier_activite || "");
      formData.append("bp", donnees.bp || "");
      formData.append("pays_residence", donnees.pays_residence || "Cameroun");
      formData.append("nui", donnees.nui || "");
      formData.append("solde_initial", donnees.solde_initial || "0");
      formData.append("immobiliere", donnees.immobiliere || "");
      formData.append("autres_biens", donnees.autres_biens || "");

      // 2. GESTION DES FICHIERS DE LOCALISATION
      if (donnees.photo_localisation_domicile) {
        formData.append("photo_localisation_domicile", donnees.photo_localisation_domicile);
      }

      if (donnees.photo_localisation_activite) {
        formData.append("photo_localisation_activite", donnees.photo_localisation_activite);
      }

      // 3. INFOS PHYSIQUES
      formData.append("nom_prenoms", donnees.nom_prenoms);
      formData.append("sexe", donnees.sexe);
      formData.append("date_naissance", donnees.date_naissance);
      formData.append("lieu_naissance", donnees.lieu_naissance || "");
      formData.append("nationalite", donnees.nationalite || "Camerounaise");
      formData.append("cni_numero", donnees.cni_numero);
      formData.append("cni_delivrance", donnees.cni_delivrance || "");
      formData.append("cni_expiration", donnees.cni_expiration || "");
      formData.append("nom_pere", donnees.nom_pere || "");
      formData.append("nom_mere", donnees.nom_mere || "");
      formData.append("nationalite_pere", donnees.nationalite_pere || "");
      formData.append("nationalite_mere", donnees.nationalite_mere || "");
      formData.append("profession", donnees.profession || "");
      formData.append("employeur", donnees.employeur || "");
      formData.append("situation_familiale", donnees.situation_familiale || "");
      formData.append("regime_matrimonial", donnees.regime_matrimonial || "");
      formData.append("nom_conjoint", donnees.nom_conjoint || "");
      formData.append("date_naissance_conjoint", donnees.date_naissance_conjoint || "");
      formData.append("cni_conjoint", donnees.cni_conjoint || "");
      formData.append("profession_conjoint", donnees.profession_conjoint || "");
      formData.append("salaire", donnees.salaire || "");
      formData.append("tel_conjoint", donnees.tel_conjoint || "");

      // 4. GESTION DES FICHIERS PERSO
      if (donnees.photo) {
        formData.append("photo", donnees.photo);
      }

      if (donnees.signature) {
        formData.append("signature", donnees.signature);
      }

      // 5. FICHIERS CNI
      if (donnees.cni_recto) {
        formData.append("cni_recto", donnees.cni_recto);
      }

      if (donnees.cni_verso) {
        formData.append("cni_verso", donnees.cni_verso);
      }

      // 6. FICHIER NUI
      if (donnees.niu_image) {
        formData.append("niu_image", donnees.niu_image);
      }

      console.log("Envoi FormData...");
      const reponse = await ApiClient.post("/clients/physique", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Accept": "application/json"
        }
      });

      console.log("Réponse API:", reponse.data);

      if (reponse.data.success) {
        afficherSnackbar(`Client créé avec succès! Numéro: ${reponse.data.num_client}`, "success");
        setTimeout(() => {
          navigate("/client");
        }, 2000);
      } else {
        const messageErreur = formaterMessageErreur(reponse.data);
        afficherSnackbar(messageErreur, "error");
      }
    } catch (erreur) {
      console.error("Erreur API détail:", erreur.response?.data || erreur.message);

      const messageErreur = formaterMessageErreur(erreur.response?.data);
      afficherSnackbar(messageErreur, "error");
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

              <Stepper activeStep={etapeActive} alternativeLabel sx={{ mb: 5 }}>
                {ETAPES.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
              </Stepper>

              <form onSubmit={handleSubmit(soumettreFormulaire)}>
                <Box sx={{ minHeight: "450px" }}>

                  {/* ÉTAPE 0 : ADMINISTRATIF & IDENTITÉ */}
                  {etapeActive === 0 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Infos Agence
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="agency_id" control={control} render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!erreurs?.agency_id} required sx={{ minWidth: 200 }}>
                            <InputLabel>Agence *</InputLabel>
                            <Select label="Agence *" {...field} value={field.value || ""}>
                              {agences.map((a) => (
                                <MenuItem key={a.id} value={a.id}>{a.code} - {a.agency_name || a.nom}</MenuItem>
                              ))}
                            </Select>
                            {erreurs?.agency_id && <FormHelperText>{erreurs.agency_id.message}</FormHelperText>}
                          </FormControl>
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="ID Client"
                          value={numeroClientGenere}
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
                            error={!!erreurs?.nom_prenoms}
                            helperText={erreurs?.nom_prenoms?.message}
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="sexe" control={control} render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!erreurs?.sexe} required sx={{ minWidth: 200 }}>
                            <InputLabel>Sexe *</InputLabel>
                            <Select label="Sexe *" {...field} value={field.value || ""}>
                              <MenuItem value="M">Masculin</MenuItem>
                              <MenuItem value="F">Féminin</MenuItem>
                            </Select>
                            {erreurs?.sexe && <FormHelperText>{erreurs.sexe.message}</FormHelperText>}
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
                            error={!!erreurs?.date_naissance}
                            helperText={erreurs?.date_naissance?.message}
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
                  {etapeActive === 1 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Localisation Domicile
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="adresse_ville" control={control} render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!erreurs?.adresse_ville} required sx={{ minWidth: 200 }}>
                            <InputLabel>Ville *</InputLabel>
                            <Select label="Ville *" {...field} value={field.value || ""}>
                              {Object.keys(DONNEES_VILLES).map(v => (
                                <MenuItem key={v} value={v}>{v}</MenuItem>
                              ))}
                            </Select>
                            {erreurs?.adresse_ville && <FormHelperText>{erreurs.adresse_ville.message}</FormHelperText>}
                          </FormControl>
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="adresse_quartier" control={control} render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!erreurs?.adresse_quartier} required sx={{ minWidth: 200 }}>
                            <InputLabel>Quartier *</InputLabel>
                            <Select label="Quartier *" {...field} value={field.value || ""}>
                              {optionsQuartiers.map(q => (
                                <MenuItem key={q} value={q}>{q}</MenuItem>
                              ))}
                            </Select>
                            {erreurs?.adresse_quartier && <FormHelperText>{erreurs.adresse_quartier.message}</FormHelperText>}
                          </FormControl>
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="lieu_dit_domicile" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Lieu-dit Domicile"
                            error={!!erreurs?.lieu_dit_domicile}
                            helperText={erreurs?.lieu_dit_domicile?.message} />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                            Photo Localisation Domicile *
                          </Typography>
                          <Controller name="photo_localisation_domicile" control={control} render={({ field }) => (
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => field.onChange(e.target.files[0])}
                                ref={domicilePhotoRef}
                              />
                              {erreurs?.photo_localisation_domicile && (
                                <FormHelperText error>{erreurs.photo_localisation_domicile.message}</FormHelperText>
                              )}
                            </div>
                          )} />
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Localisation Activité *
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="ville_activite" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            label="Ville Activité *"
                            required
                            error={!!erreurs?.ville_activite}
                            helperText={erreurs?.ville_activite?.message}
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="quartier_activite" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            label="Quartier Activité *"
                            required
                            error={!!erreurs?.quartier_activite}
                            helperText={erreurs?.quartier_activite?.message}
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="lieu_dit_activite" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            label="Lieu-dit Activité *"
                            required
                            error={!!erreurs?.lieu_dit_activite}
                            helperText={erreurs?.lieu_dit_activite?.message}
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                            Photo Localisation Activité *
                          </Typography>
                          <Controller name="photo_localisation_activite" control={control} render={({ field }) => (
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => field.onChange(e.target.files[0])}
                                ref={activitePhotoRef}
                              />
                              {erreurs?.photo_localisation_activite && (
                                <FormHelperText error>{erreurs.photo_localisation_activite.message}</FormHelperText>
                              )}
                            </div>
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
                            error={!!erreurs?.telephone}
                            helperText={erreurs?.telephone?.message}
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
                  {etapeActive === 2 && (
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
                            error={!!erreurs?.cni_numero}
                            helperText={erreurs?.cni_numero?.message}
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

                      <Grid item xs={12} md={6}>
                        <Controller name="nui" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            label="N° NUI *"
                            required
                            error={!!erreurs?.nui}
                            helperText={erreurs?.nui?.message}
                            placeholder="Ex: M1234567890"
                          />
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
                            error={!!erreurs?.profession}
                            helperText={erreurs?.profession?.message}
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
                          Documents Personnels *
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                            Photo du Client *
                          </Typography>
                          <Controller name="photo" control={control} render={({ field }) => (
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => field.onChange(e.target.files[0])}
                              />
                              {erreurs?.photo && (
                                <FormHelperText error>{erreurs.photo.message}</FormHelperText>
                              )}
                            </div>
                          )} />
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                            Signature du Client *
                          </Typography>
                          <Controller name="signature" control={control} render={({ field }) => (
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => field.onChange(e.target.files[0])}
                              />
                              {erreurs?.signature && (
                                <FormHelperText error>{erreurs.signature.message}</FormHelperText>
                              )}
                            </div>
                          )} />
                        </Box>
                      </Grid>
                    </Grid>
                  )}

                  {/* ÉTAPE 3 : FAMILLE & BIENS */}
                  {etapeActive === 3 && (
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
                          <TextField {...field} fullWidth size="small" label="CAPITAL" type="number" />
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

                  {/* ÉTAPE 4 : DOCUMENTS CNI & NUI */}
                  {etapeActive === 4 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Documents CNI (Recto et Verso) *
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa', textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: indigo[700] }}>
                              Recto de la CNI *
                            </Typography>
                            {apercuCniRecto && (
                              <IconButton size="small" onClick={() => supprimerFichier('cni_recto', setApercuCniRecto)}>
                                <Close fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          {apercuCniRecto && (
                            <img
                              src={apercuCniRecto}
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
                            <div>
                              <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadIcon />}
                                sx={{ mt: 1 }}
                              >
                                {apercuCniRecto ? 'Changer le recto' : 'Télécharger le recto'}
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => gererChangementCniRecto(e, field.onChange)}
                                  ref={cniRectoRef}
                                />
                              </Button>
                              {erreurs?.cni_recto && (
                                <FormHelperText error sx={{ mt: 1 }}>{erreurs.cni_recto.message}</FormHelperText>
                              )}
                            </div>
                          )} />
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa', textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: indigo[700] }}>
                              Verso de la CNI *
                            </Typography>
                            {apercuCniVerso && (
                              <IconButton size="small" onClick={() => supprimerFichier('cni_verso', setApercuCniVerso)}>
                                <Close fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          {apercuCniVerso && (
                            <img
                              src={apercuCniVerso}
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
                            <div>
                              <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadIcon />}
                                sx={{ mt: 1 }}
                              >
                                {apercuCniVerso ? 'Changer le verso' : 'Télécharger le verso'}
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => gererChangementCniVerso(e, field.onChange)}
                                  ref={cniVersoRef}
                                />
                              </Button>
                              {erreurs?.cni_verso && (
                                <FormHelperText error sx={{ mt: 1 }}>{erreurs.cni_verso.message}</FormHelperText>
                              )}
                            </div>
                          )} />
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 4 }}>
                          Photocopie NUI *
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa', textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: indigo[700] }}>
                              Photocopie NUI *
                            </Typography>
                            {apercuNiuImage && (
                              <IconButton size="small" onClick={() => supprimerFichier('niu_image', setApercuNiuImage)}>
                                <Close fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          {apercuNiuImage && (
                            <img
                              src={apercuNiuImage}
                              alt="Photocopie NUI"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                borderRadius: '8px',
                                marginBottom: '10px'
                              }}
                            />
                          )}
                          <Controller name="niu_image" control={control} render={({ field }) => (
                            <div>
                              <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadIcon />}
                                sx={{ mt: 1 }}
                              >
                                {apercuNiuImage ? 'Changer la photocopie NUI' : 'Télécharger la photocopie NUI'}
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => gererChangementNiuImage(e, field.onChange)}
                                  ref={niuImageRef}
                                />
                              </Button>
                              {erreurs?.niu_image && (
                                <FormHelperText error sx={{ mt: 1 }}>{erreurs.niu_image.message}</FormHelperText>
                              )}
                            </div>
                          )} />
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                            Photocopie du document NUI - Format: JPG, PNG (max 2MB)
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ mt: 2 }}>
                          Veuillez télécharger les deux côtés de la CNI (recto et verso) ainsi que la photocopie du NUI.
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
                    disabled={etapeActive === 0}
                    onClick={() => setEtapeActive(s => s - 1)}
                  >
                    Précédent
                  </Button>

                  {etapeActive === ETAPES.length - 1 ? (
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
                        const valide = await trigger();
                        if (valide) {
                          setEtapeActive((s) => s + 1);
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
          open={snackbar.ouvert}
          autoHideDuration={6000}
          onClose={fermerSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={fermerSnackbar}
            severity={snackbar.severite}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </Layout>
  );
}