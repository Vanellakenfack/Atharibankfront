import React, { useEffect, useMemo, useState,useRef } from "react";
import {
  ThemeProvider, createTheme, CssBaseline, Container, Box, Grid, TextField,
  Button, Stepper, Step, StepLabel, Select, MenuItem, InputLabel, 
  FormControl, Typography, Checkbox, FormGroup, FormControlLabel, 
  Divider, Paper, FormHelperText
} from "@mui/material";
import { indigo, blueGrey, cyan } from "@mui/material/colors";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import ApiClient from "../../services/api/ApiClient"; 
import Layout from "../../components/layout/Layout";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: indigo[700] },
    secondary: { main: cyan.A700 },
    background: { default: blueGrey[50] },
  },
  shape: { borderRadius: 12 },
});

const STEPS = ["Identité & Agence", "Localisation & Contact", "Documents & Banque", "Famille & Profession"];

const schemas = [
  Yup.object({
    num_agence: Yup.string().required("L'agence est obligatoire"),
    nom_prenoms: Yup.string().required("Le nom est obligatoire"),
    sexe: Yup.string().required("Le sexe est obligatoire"),
    date_naissance: Yup.string().required("La date de naissance est obligatoire"),
  }),
  Yup.object({
    adresse_ville: Yup.string().required("La ville est obligatoire"),
  }),
  Yup.object({
    cni1: Yup.string().required("Le numéro de CNI est obligatoire"),
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

export default function FormClient() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // 1. Déclarer tous les useState en premier
  const [activeStep, setActiveStep] = useState(0);
  const [agencies, setAgencies] = useState([]);
  const [generatedNumClient, setGeneratedNumClient] = useState("EN ATTENTE...");

  // 2. Initialiser useForm (pour obtenir 'watch')
  const { control, handleSubmit, trigger, watch, formState: { errors } } = useForm({
    defaultValues: {
      type_client: "physique", num_agence: "", nom_prenoms: "", sexe: "",
      adresse_ville: "", adresse_quartier: "", bp: "", email: "", tel_domicile: "", tel_bureau: "",
      cni1: "", du1: "", au1: "", cni2: "", du2: "", au2: "",
      date_naissance: "", lieu_naissance: "", nom_mere: "", nom_pere: "",
      profession: "", employeur: "", situation_familiale: "", regime_matrimonial: "",
      nom_epoux: "", date_naissance_epoux: "", lieu_naissance_epoux: "",
      fonction_epoux: "", adresse_epoux: "", numero_epoux: "", photo: "",
      nationalite: "Camerounaise", pays_residence: "Cameroun",
      Qualite: "", gestionnaire: "", profil: "", autre_preciser: "",
      client_checkbox: true, signataire: false, mantaire: false,
      interdit_chequier: false, taxable: false,
    },
    resolver: yupResolver(schemas[activeStep]),
    mode: "onTouched",
    shouldUnregister: false, 
  });

  // 3. Déclarer les variables 'watch' APRES useForm
  const selectedAgency = watch("num_agence");
  const selectedVille = watch("adresse_ville");

  // 4. Utiliser les useEffect
  useEffect(() => {
    ApiClient.get("/agencies")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAgencies(list);
      })
      .catch((err) => console.error("Erreur agences:", err));
  }, []);

  useEffect(() => {
    if (selectedAgency) {
      ApiClient.get(`/agencies/${selectedAgency}/next-number`)
        .then((res) => setGeneratedNumClient(res.data.next_number))
        .catch((err) => {
          console.error("Erreur génération numéro:", err);
          setGeneratedNumClient("ERREUR");
        });
    } else {
      setGeneratedNumClient("AUTO-GÉNÉRÉ");
    }
  }, [selectedAgency]);

  const quartiersOptions = useMemo(() => (selectedVille ? CITY_DATA[selectedVille] || [] : []), [selectedVille]);

const onSubmit = async (data) => {
  console.log("Données reçues du formulaire:", data);
  try {
    const formData = new FormData();

    // --- 1. INFOS DE BASE (CLIENT) ---
    formData.append("agency_id", data.num_agence);
    formData.append("type_client", "physique");
    formData.append("telephone", data.tel_bureau || data.tel_domicile || "");
    formData.append("email", data.email || "");
    formData.append("adresse_ville", data.adresse_ville || "");
    formData.append("adresse_quartier", data.adresse_quartier || "");
    formData.append("bp", data.bp || "");
    formData.append("pays_residence", data.pays_residence || "Cameroun");
    formData.append("gestionnaire", data.gestionnaire || "");
    formData.append("profil", data.profil || "");
    formData.append("qualite", data.Qualite || "");
    formData.append("autre_precision", data.autre_preciser || "");

    // --- 2. IDENTITÉ (PHYSIQUE) ---
    formData.append("nom_prenoms", data.nom_prenoms);
    formData.append("sexe", data.sexe);
    formData.append("date_naissance", data.date_naissance);
    formData.append("lieu_naissance", data.lieu_naissance || "");
    formData.append("nationalite", data.nationalite || "Camerounaise");
    formData.append("nom_pere", data.nom_pere || "");
    formData.append("nom_mere", data.nom_mere || "");
    
    // --- 3. DOCUMENTS ---
    formData.append("cni_numero", data.cni1);
    formData.append("cni_delivrance", data.du1 || "");
    formData.append("cni_expiration", data.au1 || "");
    formData.append("cni2_numero", data.cni2 || "");
    formData.append("cni2_delivrance", data.du2 || "");
    formData.append("cni2_expiration", data.au2 || "");

    // --- 4. PROFESSION & FAMILLE (INCLUANT CONJOINT) ---
    formData.append("profession", data.profession || "");
    formData.append("employeur", data.employeur || "");
    formData.append("situation_familiale", data.situation_familiale || "");
    formData.append("regime_matrimonial", data.regime_matrimonial || "");
    
    // Champs Conjoint corrigés
    formData.append("nom_conjoint", data.nom_epoux || "");
    formData.append("tel_conjoint", data.numero_epoux || "");
        formData.append("cni_conjoint",String(data.cni_epoux || "") );
    formData.append("profession_conjoint", data.fonction_epoux || ""); // Profession conjoint
    formData.append("date_naissance_conjoint", data.date_naissance_epoux || "");
    formData.append("lieu_naissance_conjoint", data.lieu_naissance_epoux || "");
   formData.append("salaire_conjoint", data.salaire_epoux || "");

    formData.append("tel_conjoint", data.tel_epoux || "");
    const file = fileInputRef.current?.files[0]; 
    if (file) {
      formData.append("photo", file);
      console.log("Photo récupérée via Ref et ajoutée au FormData:", file.name);
    } else {
      console.log("Aucun fichier sélectionné dans l'input.");
    }
    // --- 5. BOOLÉENS (CHECKBOXES) ---
    // Laravel reçoit les FormData comme des strings, on envoie 1 ou 0
    
    formData.append("taxable", data.taxable ? 1 : 0);
    formData.append("interdit_chequier", data.interdit_chequier ? 1 : 0);
    formData.append("is_client", data.client_checkbox ? 1 : 0);
    formData.append("is_signataire", data.signataire ? 1 : 0);
    formData.append("is_mandataire", data.mantaire ? 1 : 0);

    // --- 6. LA PHOTO (LE NOUVEAU CHAMP) ---
    if (data.photo) {
      formData.append("photo", data.photo);
    }

    // --- ENVOI ---
    const response = await ApiClient.post("/clients/physique", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    if (response.data.success) {
      alert("Félicitations ! Client créé avec succès.");
      navigate("/client");
    }
  } catch (error) {
    console.error("Erreur API détail:", error.response?.data);
    alert("Erreur lors de l'enregistrement. Vérifiez la console.");
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
              <Box sx={{ display: activeStep === 0 ? "block" : "none" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}><Typography variant="subtitle1" fontWeight="bold" color="primary">Infos Agence</Typography></Grid>
                  <Grid item xs={12} md={4}>
                    <Controller name="num_agence" control={control} render={({ field }) => (
                      <FormControl fullWidth size="small" error={!!errors.num_agence} required>
                        <InputLabel>Agence *</InputLabel>
                        <Select label="Agence *" {...field} value={field.value || ""}>
                          {agencies.map((a) => (<MenuItem key={a.id} value={a.id}>{a.code} - {a.agency_name}</MenuItem>))}
                        </Select>
                        {errors.num_agence && <FormHelperText>{errors.num_agence.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth size="small" label="ID Client" value={generatedNumClient} disabled variant="filled" InputProps={{ readOnly: true, style: { fontWeight: 'bold' } }} />
                      </Grid>
                  <Grid item xs={12} md={4}>
                    <Controller name="type_client" control={control} render={({ field }) => (
                      <FormControl fullWidth size="small"><InputLabel>Type</InputLabel>
                        <Select label="Type" {...field} value={field.value || ""}><MenuItem value="physique">Physique</MenuItem></Select>
                      </FormControl>
                    )} />
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle1" fontWeight="bold" color="primary">Identité</Typography></Grid>
                  <Grid item xs={12} md={8}><Controller name="nom_prenoms" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Nom & Prénoms" required error={!!errors.nom_prenoms} helperText={errors.nom_prenoms?.message} />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="sexe" control={control} render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.sexe} required><InputLabel>Sexe *</InputLabel>
                      <Select label="Sexe *" {...field} value={field.value || ""}><MenuItem value="M">Masculin</MenuItem><MenuItem value="F">Féminin</MenuItem></Select>
                    </FormControl>
                  )} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="date_naissance" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" type="date" label="Date Naissance" required InputLabelProps={{ shrink: true }} error={!!errors.date_naissance} helperText={errors.date_naissance?.message} />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="lieu_naissance" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Lieu Naissance" />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="nationalite" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Nationalité" />)} /></Grid>

                  {/* AJOUT CHAMP PHOTO DANS ÉTAPE 0 */}
                  <Grid item xs={12} md={12}>
                    <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700], fontWeight: 'bold' }}>
      Photo du client (Méthode Ref)
                    </Typography>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef} // <--- On attache la référence ici
                      style={{ display: 'block', margin: '10px auto' }}
                    />
                                  
                  <Typography variant="caption" display="block" color="textSecondary">
                    Le fichier sera envoyé lors de la validation finale.
                  </Typography>
                                  </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* ÉTAPE 1 : CONTACT & LOCALISATION (Pas de changement) */}
              <Box sx={{ display: activeStep === 1 ? "block" : "none" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}><Typography variant="subtitle1" fontWeight="bold" color="primary">Localisation</Typography></Grid>
                  <Grid item xs={12} md={4}><Controller name="adresse_ville" control={control} render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.adresse_ville} required><InputLabel>Ville *</InputLabel>
                      <Select label="Ville *" {...field} value={field.value || ""}>{Object.keys(CITY_DATA).map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}</Select>
                    </FormControl>
                  )} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="adresse_quartier" control={control} render={({ field }) => (
                    <FormControl fullWidth size="small"><InputLabel>Quartier</InputLabel>
                      <Select label="Quartier" {...field} value={field.value || ""}>{quartiersOptions.map(q => <MenuItem key={q} value={q}>{q}</MenuItem>)}</Select>
                    </FormControl>
                  )} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="pays_residence" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Pays de Résidence" />)} /></Grid>
                  
                  <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle1" fontWeight="bold" color="primary">Contact</Typography></Grid>
                  <Grid item xs={12} md={4}><Controller name="email" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Email" />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="tel_bureau" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Téléphone Principal" />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="tel_domicile" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Téléphone Domicile" />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="bp" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Boite Postale" />)} /></Grid>
                </Grid>
              </Box>

              {/* ÉTAPE 2 : DOCUMENTS & BANQUE (Pas de changement) */}
              <Box sx={{ display: activeStep === 2 ? "block" : "none" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}><Typography variant="subtitle1" fontWeight="bold" color="primary">Pièce d'identité principale</Typography></Grid>
                  <Grid item xs={12} md={4}><Controller name="cni1" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="N° Pièce *" required error={!!errors.cni1} helperText={errors.cni1?.message} />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="du1" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" type="date" label="Délivré le" InputLabelProps={{ shrink: true }} />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="au1" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" type="date" label="Expire le" InputLabelProps={{ shrink: true }} />)} /></Grid>
                  
                  <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle1" fontWeight="bold" color="primary">Pièce d'identité secondaire (Optionnel)</Typography></Grid>
                  <Grid item xs={12} md={4}><Controller name="cni2" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="N° 2ème Pièce" />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="du2" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" type="date" label="Délivré le" InputLabelProps={{ shrink: true }} />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="au2" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" type="date" label="Expire le" InputLabelProps={{ shrink: true }} />)} /></Grid>

                  <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle1" fontWeight="bold" color="primary">Gestion Interne</Typography></Grid>
                  <Grid item xs={12} md={4}><Controller name="gestionnaire" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Gestionnaire" />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="profil" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Profil Client" />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="Qualite" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Qualité" />)} /></Grid>
                </Grid>
              </Box>

              {/* ÉTAPE 3 : SITUATION FAMILIALE & OPTIONS (AJOUTS CONJOINT) */}
              <Box sx={{ display: activeStep === 3 ? "block" : "none" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}><Typography variant="subtitle1" fontWeight="bold" color="primary">Emploi & Parents</Typography></Grid>
                  <Grid item xs={12} md={4}><Controller name="profession" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Profession" />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="employeur" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Employeur" />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="nom_pere" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Nom du Père" />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="nom_mere" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Nom de la Mère" />)} /></Grid>
                  
                  <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle1" fontWeight="bold" color="primary">Situation Matrimoniale & Conjoint</Typography></Grid>
                  <Grid item xs={12} md={4}><Controller name="situation_familiale" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Situation Familiale" />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="regime_matrimonial" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Régime Matrimonial" />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="nom_epoux" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Nom Conjoint" />)} /></Grid>
                  
                  {/* AJOUTS DES NOUVEAUX CHAMPS CONJOINT ICI */}
                  <Grid item xs={12} md={4}><Controller name="date_naissance_epoux" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" type="date" label="Date Naissance Conjoint" InputLabelProps={{ shrink: true }} />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="lieu_naissance_epoux" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Lieu Naissance Conjoint" />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="fonction_epoux" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Profession Conjoint" />)} /></Grid>
                  <Grid item xs={12} md={4}><Controller name="numero_epoux" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Tel Conjoint" />)} /></Grid>
                   <Grid item xs={12} md={4}><Controller name="tel_epoux" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Tel Conjoint" />)} /></Grid>
                        <Grid item xs={12} md={4}><Controller name="salaire_epoux" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Salaire Conjoint" />)} /></Grid>

                  <Grid item xs={12} md={4}><Controller name="cni_epoux" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="N° Pièce Conjoint" />)} /></Grid>
                  <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle1" fontWeight="bold" color="primary">Options de compte</Typography></Grid>
                  <Grid item xs={12}>
                    <FormGroup row>
                      <FormControlLabel control={<Controller name="taxable" control={control} render={({ field }) => (<Checkbox {...field} checked={field.value} />)} />} label="Assujetti Taxe" />
                      <FormControlLabel control={<Controller name="interdit_chequier" control={control} render={({ field }) => (<Checkbox {...field} checked={field.value} />)} />} label="Interdit Chéquier" />
                      <FormControlLabel control={<Controller name="client_checkbox" control={control} render={({ field }) => (<Checkbox {...field} checked={field.value} />)} />} label="Est Client" />
                      <FormControlLabel control={<Controller name="signataire" control={control} render={({ field }) => (<Checkbox {...field} checked={field.value} />)} />} label="Signataire" />
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12}><Controller name="autre_preciser" control={control} render={({ field }) => (<TextField {...field} fullWidth size="small" label="Autres précisions" multiline rows={2} />)} /></Grid>
                </Grid>
              </Box>

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
                  key="next-btn"
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
  </ThemeProvider>
  </Layout>
);
}