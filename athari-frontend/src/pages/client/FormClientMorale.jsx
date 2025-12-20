import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
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

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: indigo[700] },
    secondary: { main: cyan.A700 },
    background: { default: blueGrey[50] },
  },
  shape: { borderRadius: 12 },
});

const STEPS = ["Identité Entreprise", "Siège & Contact", "Documents Légaux", "Gérance & Fiscalité"];

const schemas = [
  Yup.object({
    num_agence: Yup.string().required("L'agence est obligatoire"),
    raison_sociale: Yup.string().required("Raison sociale requise"),
    forme_juridique: Yup.string().required("Forme juridique requise"),
  }),
  Yup.object({
    adresse_ville: Yup.string().required("Ville requise"),
    adresse_quartier: Yup.string().required("Quartier requis"),
    tel_bureau: Yup.string().required("Téléphone requis"),
  }),
  Yup.object({
    rccm: Yup.string().required("N° RCCM requis"),
    nui: Yup.string().required("N° NUI requis"),
  }),
  Yup.object({
    nom_gerant: Yup.string().required("Nom du gérant requis"),
  }),
];

export default function FormClientMorale() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [agencies, setAgencies] = useState([]); // État pour les agences de la BD

  // CHARGEMENT DES AGENCES (Inspiré de Personne Physique)
  useEffect(() => {
    ApiClient.get("/agencies")
      .then((res) => {
        // On s'adapte à la structure de votre API
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAgencies(list);
      })
      .catch((err) => console.error("Erreur lors du chargement des agences:", err));
  }, []);

  const { control, handleSubmit, trigger, watch, formState: { errors } } = useForm({
    defaultValues: {
      type_client: "morale",
      num_agence: "",
      raison_sociale: "",
      sigle: "",
      forme_juridique: "",
      adresse_ville: "",
      adresse_quartier: "",
      bp: "",
      tel_bureau: "",
      email: "",
      rccm: "",
      nui: "",
      nom_gerant: "",
      fonction_gerant: "",
      taxable: false,
    },
    resolver: yupResolver(schemas[activeStep]),
    mode: "onTouched",
  });

  const onSubmit = async (data) => {
    try {
      // Préparation du payload pour ClientController.php
      const payload = {
        agency_id: data.num_agence, // Utilisé par le service de génération de numéro
        type_client: "morale",
        telephone: data.tel_bureau,
        email: data.email || "",
        adresse_ville: data.adresse_ville,
        adresse_quartier: data.adresse_quartier,
        bp: data.bp || "",
        pays_residence: "Cameroun",
        taxable: data.taxable ? 1 : 0,
        interdit_chequier: 0,
        // Champs pour StoreMoraleClientRequest
        raison_sociale: data.raison_sociale,
        sigle: data.sigle || "",
        forme_juridique: data.forme_juridique,
        rccm: data.rccm,
        nui: data.nui,
        nom_gerant: data.nom_gerant,
        fonction_gerant: data.fonction_gerant || ""
      };

      const response = await ApiClient.post("/clients/morale", payload);

      if (response.data.success) {
        alert(`Entreprise enregistrée ! Numéro Client : ${response.data.num_client}`);
        navigate("/client");
      }
    } catch (error) {
      console.error("Erreur API:", error.response?.data);
      alert("Erreur: " + (error.response?.data?.message || "Échec de l'enregistrement"));
    }
  };

  return (

    <Layout>
    <ThemeProvider theme={muiTheme}>
    <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 4, color: indigo[900] }}>
            Fiche Personne Morale
          </Typography>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
            {STEPS.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
          </Stepper>

          <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
            <Box sx={{ minHeight: "400px" }}>
              
              {/* ÉTAPE 0 : IDENTITÉ & AGENCE */}
              {activeStep === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Controller name="num_agence" control={control} render={({ field }) => (
                      <FormControl fullWidth size="small" error={!!errors.num_agence}>
                        <InputLabel>Agence *</InputLabel>
                        <Select {...field} label="Agence *">
                          {agencies.map((a) => (
                            <MenuItem key={a.id} value={a.id}>{a.code} - {a.agency_name}</MenuItem>
                          ))}
                        </Select>
                        {errors.num_agence && <FormHelperText>{errors.num_agence.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth size="small" label="ID Client" value="AUTO-GÉNÉRÉ" disabled variant="filled" />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Controller name="raison_sociale" control={control} render={({ field }) => (
                      <TextField {...field} fullWidth size="small" label="Raison Sociale *" error={!!errors.raison_sociale} helperText={errors.raison_sociale?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Controller name="forme_juridique" control={control} render={({ field }) => (
                      <FormControl fullWidth size="small" error={!!errors.forme_juridique}>
                        <InputLabel>Forme Juridique *</InputLabel>
                        <Select {...field} label="Forme Juridique *">
                          <MenuItem value="SARL">SARL</MenuItem>
                          <MenuItem value="SA">SA</MenuItem>
                          <MenuItem value="ETS">ETS</MenuItem>
                          <MenuItem value="GIE">GIE</MenuItem>
                        </Select>
                      </FormControl>
                    )} />
                  </Grid>
                </Grid>
              )}

              {/* ÉTAPE 1 : SIÈGE (Les autres étapes suivent le même pattern) */}
              {activeStep === 1 && (
                <Grid container spacing={3}>
                   <Grid item xs={12} md={6}><Controller name="adresse_ville" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Ville du siège *" error={!!errors.adresse_ville}/>} /></Grid>
                   <Grid item xs={12} md={6}><Controller name="adresse_quartier" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Quartier *" error={!!errors.adresse_quartier}/>} /></Grid>
                   <Grid item xs={12} md={6}><Controller name="tel_bureau" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Téléphone Bureau *" error={!!errors.tel_bureau}/>} /></Grid>
                   <Grid item xs={12} md={6}><Controller name="email" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Email" />} /></Grid>
                </Grid>
              )}

              {/* ÉTAPE 2 : DOCUMENTS */}
              {activeStep === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}><Controller name="rccm" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="N° RCCM *" error={!!errors.rccm}/>} /></Grid>
                  <Grid item xs={12} md={6}><Controller name="nui" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="N° NUI *" error={!!errors.nui}/>} /></Grid>
                </Grid>
              )}

              {/* ÉTAPE 3 : GÉRANCE */}
              {activeStep === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}><Controller name="nom_gerant" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Nom du Gérant *" error={!!errors.nom_gerant}/>} /></Grid>
                  <Grid item xs={12} md={6}><Controller name="fonction_gerant" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Fonction" />} /></Grid>
                  <Grid item xs={12}>
                    <FormControlLabel control={<Controller name="taxable" control={control} render={({ field }) => <Checkbox {...field} checked={field.value} />} />} label="Assujetti TVA" />
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
                <Button variant="contained" color="secondary" type="submit" sx={{ px: 4 }}>
                  Enregistrer l'Entreprise
                </Button>
              ) : (
                <Button 
                  type="button" 
                  variant="contained" 
                  onClick={async () => (await trigger()) && setActiveStep(s => s + 1)}
                >
                  Suivant
                </Button>
              )}
            </Box>
          </form>
        </Paper>
      </Container>
    </ThemeProvider>
    </Layout>
  );
}