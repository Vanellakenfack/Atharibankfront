import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/layout/TopBar";
import {
  ThemeProvider, createTheme, CssBaseline, Container, Box, Grid, TextField,
  Button, Stepper, Step, StepLabel, Select, MenuItem, InputLabel, 
  FormControl, Avatar, Typography, Checkbox, FormGroup, FormLabel, 
  Divider, Paper,
} from "@mui/material";
import { indigo, blueGrey, cyan } from "@mui/material/colors";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: indigo[700], light: indigo[500], dark: indigo[900], contrastText: "#fff" },
    secondary: { main: cyan.A700 },
    background: { default: blueGrey[50], paper: "#ffffff" },
  },
  typography: { fontFamily: "Inter, Roboto, Arial" },
  shape: { borderRadius: 12 },
});

const STEPS = ["Identité Entreprise", "Siège & Contact", "Documents Légaux", "Gérance & Fiscalité"];

const schema = [
  Yup.object({
    num_agence: Yup.string().required("Agence requise"),
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
  const [activeStep, setActiveStep] = useState(0);
  const [logoPreview, setLogoPreview] = useState(null);

  const { control, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      type_client: "morale",
      num_agence: "",
      idclient: "",
      raison_sociale: "",
      sigle: "",
      forme_juridique: "",
      adresse_ville: "",
      adresse_quartier: "",
      adresse_precision: "",
      bp: "",
      tel_bureau: "",
      email: "",
      rccm: "",
      nui: "",
      date_creation: "",
      nom_gerant: "",
      fonction_gerant: "",
      regime_fiscal: "",
      taxable: false,
      signataire: false,
      logo: null,
    },
    resolver: yupResolver(schema[activeStep]),
    mode: "onTouched",
  });

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("logo", file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleNext = async () => (await trigger()) && setActiveStep((s) => s + 1);
  const handleBack = () => setActiveStep((s) => s - 1);

  const onSubmit = async (data) => {
    console.log("Données Entreprise :", data);
    alert("Entreprise enregistrée avec succès !");
  };

  const renderFields = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Controller name="num_agence" control={control} render={({ field }) => (
                <FormControl fullWidth size="small" error={!!errors.num_agence}>
                  <InputLabel>Agence</InputLabel>
                  <Select {...field} label="Agence">
                    <MenuItem value="001">001 - Ekounou</MenuItem>
                    <MenuItem value="002">002 - Essos</MenuItem>
                  </Select>
                </FormControl>
              )} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Controller name="raison_sociale" control={control} render={({ field }) => (
                <TextField {...field} fullWidth size="small" label="Raison Sociale" error={!!errors.raison_sociale} />
              )} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller name="sigle" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Sigle / Nom commercial" />} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller name="forme_juridique" control={control} render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Forme Juridique</InputLabel>
                  <Select {...field} label="Forme Juridique">
                    <MenuItem value="SARL">SARL</MenuItem>
                    <MenuItem value="SA">SA</MenuItem>
                    <MenuItem value="ETS">ETS (Ets)</MenuItem>
                    <MenuItem value="GIE">GIE</MenuItem>
                  </Select>
                </FormControl>
              )} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box className="flex flex-col items-center border-2 border-dashed border-indigo-300 p-2 rounded-xl bg-indigo-50/50" onClick={() => document.getElementById("logo-in").click()} sx={{ cursor: "pointer" }}>
                <input id="logo-in" type="file" hidden onChange={handleLogoChange} />
                <Avatar src={logoPreview} sx={{ width: 50, height: 50, border: `2px solid ${indigo[500]}` }} variant="rounded" />
                <Typography variant="caption" sx={{ mt: 0.5 }}>Logo Entreprise</Typography>
              </Box>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller name="adresse_ville" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Ville du siège" error={!!errors.adresse_ville}/>} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller name="adresse_quartier" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Quartier" error={!!errors.adresse_quartier}/>} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller name="tel_bureau" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Téléphone Bureau" error={!!errors.tel_bureau}/>} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Controller name="email" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Email Entreprise" />} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="adresse_precision" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Localisation précise (Rue, Immeuble...)" multiline rows={2} />} />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller name="rccm" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="N° RCCM" error={!!errors.rccm}/>} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller name="nui" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="N° Identifiant Unique (NUI)" error={!!errors.nui}/>} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller name="date_creation" control={control} render={({ field }) => <TextField {...field} type="date" fullWidth size="small" label="Date de création" InputLabelProps={{shrink:true}} />} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller name="bp" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Boîte Postale" />} />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller name="nom_gerant" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Nom du Gérant / Représentant" error={!!errors.nom_gerant}/>} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller name="fonction_gerant" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" label="Fonction (DG, PCA...)" />} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller name="regime_fiscal" control={control} render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Régime Fiscal</InputLabel>
                  <Select {...field} label="Régime Fiscal">
                    <MenuItem value="Réel">Réel</MenuItem>
                    <MenuItem value="Simplifié">Simplifié</MenuItem>
                    <MenuItem value="Libératoire">Libératoire</MenuItem>
                  </Select>
                </FormControl>
              )} />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <FormGroup row>
                <Controller name="taxable" control={control} render={({ field }) => <FormControlLabel control={<Checkbox {...field} checked={!!field.value} />} label="Assujetti TVA" />} />
                <Controller name="signataire" control={control} render={({ field }) => <FormControlLabel control={<Checkbox {...field} checked={!!field.value} />} label="Pouvoir de signature" />} />
              </FormGroup>
            </Grid>
          </Grid>
        );
      default: return null;
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Header /><CssBaseline />
      <Container maxWidth="lg" sx={{ py: 6, minHeight: '100vh' }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Typography variant="h4" sx={{ color: blueGrey[800], fontWeight: 'bold', mb: 1 }}>Fiche Personne Morale</Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>Enregistrement des entreprises et entités juridiques.</Typography>
          
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          <Box sx={{ width: '100%', bgcolor: blueGrey[200], borderRadius: 1, height: 10, mb: 4, overflow: 'hidden' }}>
            <Box sx={{ height: 10, bgcolor: indigo[500], transition: 'width 300ms', width: `${((activeStep + 1) / STEPS.length) * 100}%` }} />
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ minHeight: "350px" }}>{renderFields()}</Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 4, borderTop: `1px solid ${blueGrey[200]}` }}>
              <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0} sx={{ minWidth: 120 }}>Précédent</Button>
              {activeStep < STEPS.length - 1 ? (
                <Button variant="contained" onClick={handleNext} sx={{ minWidth: 120 }}>Suivant</Button>
              ) : (
                <Button type="submit" variant="contained" color="secondary" sx={{ minWidth: 180 }}>✅ Enregistrer l'Entreprise</Button>
              )}
            </Box>
          </form>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}