import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  ThemeProvider, createTheme, CssBaseline, Container, Box, Grid, TextField,
  Button, Stepper, Step, StepLabel, Select, MenuItem, InputLabel, 
  FormControl, Typography, Divider, Paper, FormHelperText, Snackbar, Alert,
  Tabs, Tab, Stack, Avatar, IconButton, Chip
} from "@mui/material";
import { indigo, blueGrey, cyan } from "@mui/material/colors";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import ApiClient from "../../services/api/ApiClient"; 
import { PhotoCamera, Close, CloudUpload, Delete } from "@mui/icons-material";

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

// Fonction pour les options de forme juridique
const getFormeJuridiqueOptions = (typeEntreprise) => {
  if (typeEntreprise === "entreprise") {
    return [
      "SA",
      "SNC", 
      "SCS",
      "SCA",
      "GIE",
      "ASBL"
    ];
  } else if (typeEntreprise === "association") {
    return [
      "Association à but lucratif",
      "Association à but non lucratif",
      "Association reconnue d'utilité publique",
      "Association corporative",
      "Association GIC",
      "Association communautaire",
      "Association religieuse"
    ];
  }
  return [];
};

// Créer des schémas de validation SIMPLIFIÉS
const createSchemas = (activeStep, formData) => {
  // Schéma pour l'étape 0
  const step0Schema = Yup.object({
    agency_id: Yup.string().required("L'agence est obligatoire"),
    raison_sociale: Yup.string().required("Raison sociale requise"),
    forme_juridique: Yup.string().required("Forme juridique requise"),
    type_entreprise: Yup.string().required("Type d'entreprise requis"),
  });

  // Schéma pour l'étape 1
  const step1Schema = Yup.object({
    adresse_ville: Yup.string().required("Ville requise"),
    adresse_quartier: Yup.string().required("Quartier requis"),
    telephone: Yup.string().required("Téléphone requis"),
  });

  // Schéma pour l'étape 2
  let step2Schema = Yup.object({
    nui: Yup.string().required("N° NUI requis"),
    rccm: Yup.string().nullable(),
  });

  // Schéma pour l'étape 3 - SIMPLIFIÉ
  const step3Schema = Yup.object({
    nom_gerant: Yup.string(),
    telephone_gerant: Yup.string(),
    nom_gerant2: Yup.string(),
    telephone_gerant2: Yup.string(),
    nom_signataire: Yup.string(),
    sexe_signataire: Yup.string(),
    telephone_signataire: Yup.string(),
    email_signataire: Yup.string().email("Email invalide"),
    cni_signataire: Yup.string(),
    nui_signataire: Yup.string(),
    ville_signataire: Yup.string(),
    quartier_signataire: Yup.string(),
    lieu_domicile_signataire: Yup.string(),
    lieu_dit_domicile_signataire: Yup.string(),
    nom_signataire2: Yup.string(),
    sexe_signataire2: Yup.string(),
    telephone_signataire2: Yup.string(),
    email_signataire2: Yup.string().email("Email invalide"),
    cni_signataire2: Yup.string(),
    nui_signataire2: Yup.string(),
    ville_signataire2: Yup.string(),
    quartier_signataire2: Yup.string(),
    lieu_domicile_signataire2: Yup.string(),
    lieu_dit_domicile_signataire2: Yup.string(),
    nom_signataire3: Yup.string(),
    sexe_signataire3: Yup.string(),
    telephone_signataire3: Yup.string(),
    email_signataire3: Yup.string().email("Email invalide"),
    cni_signataire3: Yup.string(),
    nui_signataire3: Yup.string(),
    ville_signataire3: Yup.string(),
    quartier_signataire3: Yup.string(),
    lieu_domicile_signataire3: Yup.string(),
    lieu_dit_domicile_signataire3: Yup.string(),
    solde_initial: Yup.string().matches(/^\d*$/, "Doit être un nombre"),
    immobiliere: Yup.string(),
    autres_biens: Yup.string(),
  });

  // Schéma pour l'étape 4 - Pas de validation Yup
  const step4Schema = Yup.object({});

  const schemas = [step0Schema, step1Schema, step2Schema, step3Schema, step4Schema];
  
  return schemas[activeStep];
};

const CITY_DATA = {
  Douala: ["Akwa", "Bonapriso", "Deïdo", "Bali", "Makepe", "Bonanjo", "Logbessou", "Kotto", "Logpom", "Lendi", "Nyalla", "Ndogpassi", "Bepanda", "Bonamoussadi", "Ange Raphaël", "Ndoti", "New Bell", "Bassa", "Nylon", "Cité des Palmiers", "Bonabéri", "Sodiko", "Boanda", "Mabanda", "Yassa", "Japoma"],
  Yaoundé: ["Bastos", "Essos", "Mokolo", "Biyem-Assi", "Mvog-Ada", "Nkolbisson", "Ekounou", "Ngousso", "Santa Barbara", "Etoudi", "Mballa II", "Emana", "Messassi", "Olembe", "Nlongkak", "Etoa-Meki", "Mvog-Mbi", "Obili", "Ngoa-Ekelle", "Damase", "Mendong", "Simbock", "Efoulan", "Nsam", "Ahala", "Kondengui"],
  Bafoussam: ["Tamdja", "Banengo", "Djeleng", "Nkong-Zem", "Koptchou", "Famla", "Houkaha", "Kouékong", "Ndiangdam", "Kamkop", "Toungang", "Tocket", "Diadam", "Baleng"],
  Bamenda: ["Mankon", "Nkwen", "Bali", "Bafut", "Up-Station", "Old Church", "Mile 2", "Mile 3", "Mile 4", "Cow Street", "Abakwa", "Mulang", "Below Fongu"],
  Garoua: ["Lainde", "Yelwa", "Roumdé Adjia", "Djamboutou", "Nassarao", "Pitoa", "Poumpoumré", "Foulberé", "Louti", "Gashiga"],
  Maroua: ["Kakataré", "Doursoungo", "Douggoï", "Domayo", "Pitoaré", "Ouro-Tchédé", "Djarengol", "Baouliwol", "Zokok"],
  Ngaoundéré: ["Baladji I", "Baladji II", "Joli Soir", "Dang", "Bamyanga", "Sabongari", "Mboum", "Yelwa", "Haoussa"],
  Limbe: ["Down Beach", "Bota", "Middle Farms", "Mile 4", "New Town", "Ngéme", "Cassava Farms", "Man O' War Bay"],
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
  
  // État pour suivre quels signataires ont été renseignés
  const [signatairesRemplis, setSignatairesRemplis] = useState([false, false, false]);
  
  // Prévisualisations et fichiers - TOUTES restaurées
  const [gerantPreview, setGerantPreview] = useState([null, null]);
  const [signatairePreviews, setSignatairePreviews] = useState([null, null, null]);
  const [signaturePreviews, setSignaturePreviews] = useState([null, null, null]);
  
  // Prévisualisations des documents légaux - RESTAURÉES
  const [extraitRccmPreview, setExtraitRccmPreview] = useState(null);
  const [titrePatentePreview, setTitrePatentePreview] = useState(null);
  const [niuPreview, setNiuPreview] = useState(null);
  const [statutsPreview, setStatutsPreview] = useState(null);
  const [pvAgcPreview, setPvAgcPreview] = useState(null);
  const [attestationPreview, setAttestationPreview] = useState(null);
  const [procesVerbalPreview, setProcesVerbalPreview] = useState(null);
  const [registreCoopPreview, setRegistreCoopPreview] = useState(null);
  const [recepissePreview, setRecepissePreview] = useState(null);
  const [planSiegePreview, setPlanSiegePreview] = useState(null);
  const [factureEauSiegePreview, setFactureEauSiegePreview] = useState(null);
  const [factureElecSiegePreview, setFactureElecSiegePreview] = useState(null);
  const [planSignatairePreviews, setPlanSignatairePreviews] = useState([null, null, null]);
  const [factureEauSignatairePreviews, setFactureEauSignatairePreviews] = useState([null, null, null]);
  const [factureElecSignatairePreviews, setFactureElecSignatairePreviews] = useState([null, null, null]);
  const [photoDomicilePreview, setPhotoDomicilePreview] = useState(null);
  const [photoActivitePreview, setPhotoActivitePreview] = useState(null);
  const [attestationConformitePreview, setAttestationConformitePreview] = useState(null);
  
  // Nouveaux prévisualisations pour les champs manquants
  const [lieuDitDomicilePhotoPreviews, setLieuDitDomicilePhotoPreviews] = useState([null, null, null]);
  const [photoLocalisationDomicilePreviews, setPhotoLocalisationDomicilePreviews] = useState([null, null, null]);
  const [cniRectoPreviews, setCniRectoPreviews] = useState([null, null, null]);
  const [cniVersoPreviews, setCniVersoPreviews] = useState([null, null, null]);
  const [nuiSignatairePreviews, setNuiSignatairePreviews] = useState([null, null, null]);
  
  // États pour suivre les noms de fichiers
  const [fileNames, setFileNames] = useState({});
  
  // États pour la validation manuelle des fichiers
  const [fileErrors, setFileErrors] = useState({});
  const [requiredFiles, setRequiredFiles] = useState([]);

  // Définir les valeurs par défaut du formulaire - CORRIGÉ avec tous les champs manquants
  const defaultValues = {
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
    
    // Documents administratifs
    extrait_rccm_image: null,
    titre_patente_image: null,
    niu_image: null,
    statuts_image: null,
    pv_agc_image: null,
    attestation_non_redevance_image: null,
    proces_verbal_image: null,
    registre_coop_gic_image: null,
    recepisse_declaration_association_image: null,
    
    // Documents PDF
    acte_designation_signataires_pdf: null,
    liste_conseil_administration_pdf: null,
    attestation_conformite_pdf: null,
    liste_membres_pdf: null,
    
    // Gérance
    nom_gerant: "",
    telephone_gerant: "",
    nom_gerant2: "",
    telephone_gerant2: "",
    
    // SIGNATAIRE 1 - Informations personnelles
    nom_signataire: "",
    sexe_signataire: "",
    telephone_signataire: "",
    email_signataire: "",
    cni_signataire: "",
    nui_signataire: "",
    
    // SIGNATAIRE 1 - Localisation
    ville_signataire: "",
    quartier_signataire: "",
    lieu_domicile_signataire: "",
    lieu_dit_domicile_signataire: "",
    
    // SIGNATAIRE 2 - Informations personnelles
    nom_signataire2: "",
    sexe_signataire2: "",
    telephone_signataire2: "",
    email_signataire2: "",
    cni_signataire2: "",
    nui_signataire2: "",
    
    // SIGNATAIRE 2 - Localisation
    ville_signataire2: "",
    quartier_signataire2: "",
    lieu_domicile_signataire2: "",
    lieu_dit_domicile_signataire2: "",
    
    // SIGNATAIRE 3 - Informations personnelles
    nom_signataire3: "",
    sexe_signataire3: "",
    telephone_signataire3: "",
    email_signataire3: "",
    cni_signataire3: "",
    nui_signataire3: "",
    
    // SIGNATAIRE 3 - Localisation
    ville_signataire3: "",
    quartier_signataire3: "",
    lieu_domicile_signataire3: "",
    lieu_dit_domicile_signataire3: "",
    
    // SIGNATAIRE 1 - Fichiers (CHAMPS MANQUANTS AJOUTÉS)
    photo_signataire: null,
    signature_signataire: null,
    lieu_dit_domicile_photo_signataire: null,
    photo_localisation_domicile_signataire: null,
    cni_photo_recto_signataire: null,
    cni_photo_verso_signataire: null,
    nui_image_signataire: null,
    
    // SIGNATAIRE 2 - Fichiers (CHAMPS MANQUANTS AJOUTÉS)
    photo_signataire2: null,
    signature_signataire2: null,
    lieu_dit_domicile_photo_signataire2: null,
    photo_localisation_domicile_signataire2: null,
    cni_photo_recto_signataire2: null,
    cni_photo_verso_signataire2: null,
    nui_image_signataire2: null,
    
    // SIGNATAIRE 3 - Fichiers (CHAMPS MANQUANTS AJOUTÉS)
    photo_signataire3: null,
    signature_signataire3: null,
    lieu_dit_domicile_photo_signataire3: null,
    photo_localisation_domicile_signataire3: null,
    cni_photo_recto_signataire3: null,
    cni_photo_verso_signataire3: null,
    nui_image_signataire3: null,
    
    // Plans localisation signataires (NOMS CORRIGÉS selon API)
    plan_localisation_signataire1_image: null,
    plan_localisation_signataire2_image: null,
    plan_localisation_signataire3_image: null,
    
    // Factures signataires (NOMS CORRIGÉS selon API)
    facture_eau_signataire1_image: null,
    facture_eau_signataire2_image: null,
    facture_eau_signataire3_image: null,
    facture_electricite_signataire1_image: null,
    facture_electricite_signataire2_image: null,
    facture_electricite_signataire3_image: null,
    
    // Localisation siège
    plan_localisation_siege_image: null,
    facture_eau_siege_image: null,
    facture_electricite_siege_image: null,
    
    // Biens et patrimoine
    solde_initial: "0",
    immobiliere: "",
    autres_biens: "",
    
    // Fichiers communs
    photo_localisation_domicile: null,
    photo_localisation_activite: null,
    photo_gerant: null,
    photo_gerant2: null,
  };

  const currentSchema = createSchemas(activeStep, defaultValues);
  
  const { control, handleSubmit, trigger, watch, setValue, getValues, formState: { errors }, clearErrors } = useForm({
    defaultValues,
    resolver: yupResolver(currentSchema),
    mode: "onTouched",
  });

  const selectedAgency = watch("agency_id");
  const selectedVille = watch("adresse_ville");
  const watchTypeEntreprise = watch("type_entreprise");
  const watchNomGerant = watch("nom_gerant");
  const watchNomGerant2 = watch("nom_gerant2");
  const watchNomSignataire = watch("nom_signataire");
  const watchNomSignataire2 = watch("nom_signataire2");
  const watchNomSignataire3 = watch("nom_signataire3");
  const watchNui = watch("nui");
  const watchVilleSignataire = watch("ville_signataire");
  const watchVilleSignataire2 = watch("ville_signataire2");
  const watchVilleSignataire3 = watch("ville_signataire3");
  
  // Mettre à jour les signataires remplis
  useEffect(() => {
    const nouveauxRemplis = [...signatairesRemplis];
    nouveauxRemplis[0] = !!watchNomSignataire?.trim();
    nouveauxRemplis[1] = !!watchNomSignataire2?.trim();
    nouveauxRemplis[2] = !!watchNomSignataire3?.trim();
    setSignatairesRemplis(nouveauxRemplis);
  }, [watchNomSignataire, watchNomSignataire2, watchNomSignataire3]);

  const quartiersOptions = CITY_DATA[selectedVille] || [];
  const quartiersSignataire1 = CITY_DATA[watchVilleSignataire] || [];
  const quartiersSignataire2 = CITY_DATA[watchVilleSignataire2] || [];
  const quartiersSignataire3 = CITY_DATA[watchVilleSignataire3] || [];

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
        const translatedErrors = errorMessages.map(msg => {
          if (msg.includes('already been taken')) {
            if (msg.includes('rccm')) return "Ce numéro RCCM existe déjà";
            if (msg.includes('raison_sociale')) return "Une entreprise avec cette raison sociale existe déjà";
            if (msg.includes('nui')) return "Ce numéro NUI existe déjà";
          }
          if (msg.includes('must be an image')) return "Le fichier doit être une image";
          if (msg.includes('max:2048')) return "L'image ne doit pas dépasser 2MB";
          if (msg.includes('mimes:pdf')) return "Le fichier doit être un PDF";
          if (msg.includes('required')) {
            if (msg.includes('agency_id')) return "L'agence est obligatoire";
            if (msg.includes('raison_sociale')) return "La raison sociale est obligatoire";
            if (msg.includes('nui')) return "Le numéro NUI est obligatoire";
            if (msg.includes('nom_gerant')) return "Le nom du gérant est obligatoire";
            if (msg.includes('telephone')) return "Le téléphone est obligatoire";
            if (msg.includes('extrait_rccm_image')) return "L'extrait RCCM est obligatoire";
            if (msg.includes('titre_patente_image')) return "Le titre de patente est obligatoire";
            if (msg.includes('niu_image')) return "La photocopie NUI est obligatoire";
            if (msg.includes('statuts_image')) return "La photocopie des statuts est obligatoire";
            if (msg.includes('pv_agc_image')) return "Le PV AGC est obligatoire";
            if (msg.includes('acte_designation_signataires_pdf')) return "L'acte de désignation des signataires est obligatoire";
            if (msg.includes('attestation_conformite_pdf')) return "L'attestation de conformité est obligatoire";
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

  // Fonction générique pour gérer les changements de fichiers
  const handleFileChange = (field, e, setPreview = null, previewIndex = null) => {
    const file = e.target.files[0];
    if (file) {
      setValue(field, file, { shouldValidate: true });
      
      // Mettre à jour le nom du fichier
      setFileNames(prev => ({
        ...prev,
        [field]: file.name
      }));
      
      // Effacer l'erreur pour ce fichier
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      // Gérer la prévisualisation si fournie
      if (setPreview) {
        if (previewIndex !== null) {
          // Pour les tableaux de prévisualisations
          const newPreviews = [...setPreview];
          newPreviews[previewIndex] = URL.createObjectURL(file);
          setPreview(newPreviews);
        } else {
          // Pour les prévisualisations simples
          setPreview(URL.createObjectURL(file));
        }
      }
      
      // Effacer les erreurs de validation pour ce champ
      clearErrors(field);
    }
  };

  // Fonctions spécifiques pour les différents types de fichiers
  const handleGerantPhotoChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'photo_gerant' : 'photo_gerant2';
      setValue(field, file, { shouldValidate: true });
      
      setFileNames(prev => ({
        ...prev,
        [field]: file.name
      }));
      
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      const newPreviews = [...gerantPreview];
      newPreviews[index] = URL.createObjectURL(file);
      setGerantPreview(newPreviews);
      
      clearErrors(field);
    }
  };

  const handleSignatairePhotoChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'photo_signataire' : index === 1 ? 'photo_signataire2' : 'photo_signataire3';
      setValue(field, file, { shouldValidate: true });
      
      setFileNames(prev => ({
        ...prev,
        [field]: file.name
      }));
      
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      const newPreviews = [...signatairePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setSignatairePreviews(newPreviews);
      
      clearErrors(field);
    }
  };

  const handleSignatureChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'signature_signataire' : index === 1 ? 'signature_signataire2' : 'signature_signataire3';
      setValue(field, file, { shouldValidate: true });
      
      setFileNames(prev => ({
        ...prev,
        [field]: file.name
      }));
      
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      const newPreviews = [...signaturePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setSignaturePreviews(newPreviews);
      
      clearErrors(field);
    }
  };

  const handleLieuDitDomicilePhotoChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'lieu_dit_domicile_photo_signataire' : 
                    index === 1 ? 'lieu_dit_domicile_photo_signataire2' : 
                    'lieu_dit_domicile_photo_signataire3';
      setValue(field, file, { shouldValidate: true });
      
      setFileNames(prev => ({
        ...prev,
        [field]: file.name
      }));
      
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      const newPreviews = [...lieuDitDomicilePhotoPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setLieuDitDomicilePhotoPreviews(newPreviews);
      
      clearErrors(field);
    }
  };

  const handlePhotoLocalisationDomicileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'photo_localisation_domicile_signataire' : 
                    index === 1 ? 'photo_localisation_domicile_signataire2' : 
                    'photo_localisation_domicile_signataire3';
      setValue(field, file, { shouldValidate: true });
      
      setFileNames(prev => ({
        ...prev,
        [field]: file.name
      }));
      
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      const newPreviews = [...photoLocalisationDomicilePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setPhotoLocalisationDomicilePreviews(newPreviews);
      
      clearErrors(field);
    }
  };

  const handleCniRectoChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'cni_photo_recto_signataire' : 
                    index === 1 ? 'cni_photo_recto_signataire2' : 
                    'cni_photo_recto_signataire3';
      setValue(field, file, { shouldValidate: true });
      
      setFileNames(prev => ({
        ...prev,
        [field]: file.name
      }));
      
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      const newPreviews = [...cniRectoPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setCniRectoPreviews(newPreviews);
      
      clearErrors(field);
    }
  };

  const handleCniVersoChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'cni_photo_verso_signataire' : 
                    index === 1 ? 'cni_photo_verso_signataire2' : 
                    'cni_photo_verso_signataire3';
      setValue(field, file, { shouldValidate: true });
      
      setFileNames(prev => ({
        ...prev,
        [field]: file.name
      }));
      
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      const newPreviews = [...cniVersoPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setCniVersoPreviews(newPreviews);
      
      clearErrors(field);
    }
  };

  const handleNuiSignataireChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'nui_image_signataire' : 
                    index === 1 ? 'nui_image_signataire2' : 
                    'nui_image_signataire3';
      setValue(field, file, { shouldValidate: true });
      
      setFileNames(prev => ({
        ...prev,
        [field]: file.name
      }));
      
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      const newPreviews = [...nuiSignatairePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setNuiSignatairePreviews(newPreviews);
      
      clearErrors(field);
    }
  };

  const handlePlanSignataireChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'plan_localisation_signataire1_image' : index === 1 ? 'plan_localisation_signataire2_image' : 'plan_localisation_signataire3_image';
      setValue(field, file, { shouldValidate: true });
      
      setFileNames(prev => ({
        ...prev,
        [field]: file.name
      }));
      
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      const newPreviews = [...planSignatairePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setPlanSignatairePreviews(newPreviews);
      
      clearErrors(field);
    }
  };

  const handleFactureEauSignataireChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'facture_eau_signataire1_image' : index === 1 ? 'facture_eau_signataire2_image' : 'facture_eau_signataire3_image';
      setValue(field, file, { shouldValidate: true });
      
      setFileNames(prev => ({
        ...prev,
        [field]: file.name
      }));
      
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      const newPreviews = [...factureEauSignatairePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setFactureEauSignatairePreviews(newPreviews);
      
      clearErrors(field);
    }
  };

  const handleFactureElecSignataireChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'facture_electricite_signataire1_image' : index === 1 ? 'facture_electricite_signataire2_image' : 'facture_electricite_signataire3_image';
      setValue(field, file, { shouldValidate: true });
      
      setFileNames(prev => ({
        ...prev,
        [field]: file.name
      }));
      
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      const newPreviews = [...factureElecSignatairePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setFactureElecSignatairePreviews(newPreviews);
      
      clearErrors(field);
    }
  };

  // Fonction pour supprimer un fichier
  const removeFile = (field, setPreview = null, previewIndex = null) => {
    setValue(field, null, { shouldValidate: true });
    
    // Supprimer le nom du fichier
    setFileNames(prev => {
      const newFileNames = { ...prev };
      delete newFileNames[field];
      return newFileNames;
    });
    
    // Ajouter une erreur si le champ est requis
    if (requiredFiles.includes(field)) {
      setFileErrors(prev => ({
        ...prev,
        [field]: `${getFieldLabel(field)} est obligatoire`
      }));
    }
    
    // Gérer la prévisualisation
    if (setPreview) {
      if (previewIndex !== null) {
        const newPreviews = [...setPreview];
        newPreviews[previewIndex] = null;
        setPreview(newPreviews);
      } else {
        setPreview(null);
      }
    }
    
    // Déclencher la validation
    trigger(field);
  };

  // Fonction pour obtenir le label d'un champ
  const getFieldLabel = (fieldName) => {
    const labels = {
      extrait_rccm_image: "Extrait RCCM",
      titre_patente_image: "Titre de patente",
      niu_image: "Photocopie NUI",
      statuts_image: "Photocopie des Statuts",
      pv_agc_image: "PV de l'AGC",
      attestation_non_redevance_image: "Attestation de non redevance",
      proces_verbal_image: "Procès-verbal",
      registre_coop_gic_image: "Registre COOP-GIC",
      recepisse_declaration_association_image: "Récépissé de déclaration",
      acte_designation_signataires_pdf: "Acte de désignation des signataires",
      attestation_conformite_pdf: "Attestation de conformité",
      photo_gerant: "Photo du gérant principal",
      photo_gerant2: "Photo du gérant secondaire",
      photo_signataire: "Photo du signataire 1",
      signature_signataire: "Signature du signataire 1",
      lieu_dit_domicile_photo_signataire: "Photo lieu-dit domicile Signataire 1",
      photo_localisation_domicile_signataire: "Photo localisation domicile Signataire 1",
      cni_photo_recto_signataire: "CNI recto du signataire 1",
      cni_photo_verso_signataire: "CNI verso du signataire 1",
      nui_image_signataire: "NUI signataire 1",
      photo_signataire2: "Photo du signataire 2",
      signature_signataire2: "Signature du signataire 2",
      lieu_dit_domicile_photo_signataire2: "Photo lieu-dit domicile Signataire 2",
      photo_localisation_domicile_signataire2: "Photo localisation domicile Signataire 2",
      cni_photo_recto_signataire2: "CNI recto du signataire 2",
      cni_photo_verso_signataire2: "CNI verso du signataire 2",
      nui_image_signataire2: "NUI signataire 2",
      photo_signataire3: "Photo du signataire 3",
      signature_signataire3: "Signature du signataire 3",
      lieu_dit_domicile_photo_signataire3: "Photo lieu-dit domicile Signataire 3",
      photo_localisation_domicile_signataire3: "Photo localisation domicile Signataire 3",
      cni_photo_recto_signataire3: "CNI recto du signataire 3",
      cni_photo_verso_signataire3: "CNI verso du signataire 3",
      nui_image_signataire3: "NUI signataire 3",
      plan_localisation_signataire1_image: "Plan localisation Signataire 1",
      plan_localisation_signataire2_image: "Plan localisation Signataire 2",
      plan_localisation_signataire3_image: "Plan localisation Signataire 3",
      facture_eau_signataire1_image: "Facture eau Signataire 1",
      facture_eau_signataire2_image: "Facture eau Signataire 2",
      facture_eau_signataire3_image: "Facture eau Signataire 3",
      facture_electricite_signataire1_image: "Facture électricité Signataire 1",
      facture_electricite_signataire2_image: "Facture électricité Signataire 2",
      facture_electricite_signataire3_image: "Facture électricité Signataire 3",
    };
    
    return labels[fieldName] || fieldName;
  };

  // Composant amélioré pour l'upload de fichiers
  const FileUploadField = ({ 
    label, 
    fieldName, 
    accept = "image/*", 
    preview, 
    setPreview, 
    required = false, 
    description = "",
    disabled = false,
    previewIndex = null
  }) => {
    const fileName = fileNames[fieldName] || '';
    const error = fileErrors[fieldName] || errors[fieldName]?.message;
    
    return (
      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ color: indigo[700] }}>
            {label} {required && <span style={{color: 'red'}}>*</span>}
          </Typography>
          {fileName && !disabled && (
            <IconButton size="small" onClick={() => removeFile(fieldName, setPreview, previewIndex)}>
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>
        
        {preview && (
          <Box sx={{ mb: 2 }}>
            <img 
              src={preview} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '150px', 
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }} 
            />
          </Box>
        )}
        
        {fileName && (
          <Chip 
            label={fileName}
            color="primary"
            size="small"
            sx={{ mb: 1 }}
            onDelete={disabled ? undefined : () => removeFile(fieldName, setPreview, previewIndex)}
          />
        )}
        
        <Controller 
          name={fieldName} 
          control={control} 
          render={({ field }) => (
            <Box>
              <input
                type="file"
                accept={accept}
                onChange={(e) => handleFileChange(fieldName, e, setPreview, previewIndex)}
                style={{ display: 'none' }}
                disabled={disabled}
                id={`file-${fieldName}`}
                ref={field.ref}
              />
              <label htmlFor={`file-${fieldName}`}>
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  disabled={disabled}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  {fileName ? 'Changer le fichier' : 'Choisir un fichier'}
                </Button>
              </label>
            </Box>
          )} 
        />
        
        {description && (
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
            {description}
          </Typography>
        )}
        
        {error && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
            {error}
          </Typography>
        )}
      </Box>
    );
  };

  // Composant amélioré pour l'upload de PDF
  const PDFUploadField = ({ 
    label, 
    fieldName, 
    required = false, 
    description = "",
    disabled = false
  }) => {
    const fileName = fileNames[fieldName] || '';
    const error = fileErrors[fieldName] || errors[fieldName]?.message;
    
    return (
      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ color: indigo[700] }}>
            {label} {required && <span style={{color: 'red'}}>*</span>}
          </Typography>
          {fileName && !disabled && (
            <IconButton size="small" onClick={() => {
              setValue(fieldName, null, { shouldValidate: true });
              setFileNames(prev => {
                const newFileNames = { ...prev };
                delete newFileNames[fieldName];
                return newFileNames;
              });
              if (required) {
                setFileErrors(prev => ({
                  ...prev,
                  [fieldName]: `${label} est obligatoire`
                }));
              }
            }}>
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>
        
        {fileName && (
          <Chip 
            label={fileName}
            color="primary"
            size="small"
            sx={{ mb: 1 }}
            onDelete={disabled ? undefined : () => {
              setValue(fieldName, null, { shouldValidate: true });
              setFileNames(prev => {
                const newFileNames = { ...prev };
                delete newFileNames[fieldName];
                return newFileNames;
              });
              if (required) {
                setFileErrors(prev => ({
                  ...prev,
                  [fieldName]: `${label} est obligatoire`
                }));
              }
            }}
          />
        )}
        
        <Controller 
          name={fieldName} 
          control={control} 
          render={({ field }) => (
            <Box>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setValue(fieldName, file, { shouldValidate: true });
                    setFileNames(prev => ({
                      ...prev,
                      [fieldName]: file.name
                    }));
                    // Effacer l'erreur
                    setFileErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors[fieldName];
                      return newErrors;
                    });
                  }
                }}
                style={{ display: 'none' }}
                disabled={disabled}
                id={`pdf-${fieldName}`}
                ref={field.ref}
              />
              <label htmlFor={`pdf-${fieldName}`}>
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  disabled={disabled}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  {fileName ? 'Changer le PDF' : 'Choisir un PDF'}
                </Button>
              </label>
            </Box>
          )} 
        />
        
        {description && (
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
            {description}
          </Typography>
        )}
        
        {error && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
            {error}
          </Typography>
        )}
      </Box>
    );
  };

  // Fonction de validation manuelle pour l'étape 2 (Documents Légaux)
  const validateStep2 = (data) => {
    const errors = {};
    
    // Validation basée sur le type d'entreprise
    if (watchTypeEntreprise === "entreprise") {
      const requiredFields = [
        'extrait_rccm_image',
        'titre_patente_image',
        'niu_image',
        'statuts_image',
        'acte_designation_signataires_pdf',
        'attestation_conformite_pdf'
      ];
      
      requiredFields.forEach(field => {
        if (!data[field]) {
          errors[field] = `${getFieldLabel(field)} est obligatoire`;
        }
      });
    } else if (watchTypeEntreprise === "association") {
      const requiredFields = [
        'pv_agc_image',
        'attestation_non_redevance_image',
        'proces_verbal_image',
        'registre_coop_gic_image',
        'recepisse_declaration_association_image',
        'attestation_conformite_pdf'
      ];
      
      requiredFields.forEach(field => {
        if (!data[field]) {
          errors[field] = `${getFieldLabel(field)} est obligatoire`;
        }
      });
    }
    
    return errors;
  };

  // Fonction de validation manuelle pour l'étape 3
  const validateStep3 = (data) => {
    const errors = {};
    
    // Validation pour les entreprises
    if (watchTypeEntreprise === "entreprise") {
      if (!data.nom_gerant?.trim()) {
        errors.nom_gerant = "Nom du gérant requis pour les entreprises";
      }
    }
    
    return errors;
  };

  // Fonction de validation manuelle pour l'étape 4
  const validateStep4 = (data) => {
    const errors = {};
    
    // Validation pour les entreprises (photos des gérants)
    if (watchTypeEntreprise === "entreprise") {
      if (!data.photo_gerant) {
        errors.photo_gerant = "Photo du gérant principal obligatoire";
      }
      if (watchNomGerant2 && !data.photo_gerant2) {
        errors.photo_gerant2 = "Photo du gérant secondaire obligatoire";
      }
    }
    
    // Validation pour les signataires
    if (signatairesRemplis[0]) {
      const signataire1Fields = [
        'photo_signataire',
        'signature_signataire',
        'lieu_dit_domicile_photo_signataire',
        'photo_localisation_domicile_signataire',
        'cni_photo_recto_signataire',
        'cni_photo_verso_signataire',
        'nui_image_signataire',
        'plan_localisation_signataire1_image',
        'facture_eau_signataire1_image',
        'facture_electricite_signataire1_image'
      ];
      
      signataire1Fields.forEach(field => {
        if (!data[field]) {
          errors[field] = `${getFieldLabel(field)} est obligatoire pour le signataire 1`;
        }
      });
    }
    
    if (signatairesRemplis[1]) {
      const signataire2Fields = [
        'photo_signataire2',
        'signature_signataire2',
        'lieu_dit_domicile_photo_signataire2',
        'photo_localisation_domicile_signataire2',
        'cni_photo_recto_signataire2',
        'cni_photo_verso_signataire2',
        'nui_image_signataire2',
        'plan_localisation_signataire2_image',
        'facture_eau_signataire2_image',
        'facture_electricite_signataire2_image'
      ];
      
      signataire2Fields.forEach(field => {
        if (!data[field]) {
          errors[field] = `${getFieldLabel(field)} est obligatoire pour le signataire 2`;
        }
      });
    }
    
    if (signatairesRemplis[2]) {
      const signataire3Fields = [
        'photo_signataire3',
        'signature_signataire3',
        'lieu_dit_domicile_photo_signataire3',
        'photo_localisation_domicile_signataire3',
        'cni_photo_recto_signataire3',
        'cni_photo_verso_signataire3',
        'nui_image_signataire3',
        'plan_localisation_signataire3_image',
        'facture_eau_signataire3_image',
        'facture_electricite_signataire3_image'
      ];
      
      signataire3Fields.forEach(field => {
        if (!data[field]) {
          errors[field] = `${getFieldLabel(field)} est obligatoire pour le signataire 3`;
        }
      });
    }
    
    return errors;
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

      // Fichiers communs du client principal
      if (data.photo_localisation_domicile) {
        formData.append("photo_localisation_domicile", data.photo_localisation_domicile);
      }
      if (data.photo_localisation_activite) {
        formData.append("photo_localisation_activite", data.photo_localisation_activite);
      }

      // 2. INFOS MORALES (table clients_morales)
      formData.append("raison_sociale", data.raison_sociale);
      formData.append("sigle", data.sigle || "");
      formData.append("forme_juridique", data.forme_juridique);
      formData.append("type_entreprise", data.type_entreprise);
      formData.append("rccm", data.rccm || "");
      formData.append("nui", data.nui);
      
      // Gérants seulement pour les entreprises
      if (data.type_entreprise === "entreprise") {
        formData.append("nom_gerant", data.nom_gerant || "");
        formData.append("telephone_gerant", data.telephone_gerant || "");
        formData.append("nom_gerant2", data.nom_gerant2 || "");
        formData.append("telephone_gerant2", data.telephone_gerant2 || "");
      } else {
        // Pour les associations, envoyer des chaînes vides
        formData.append("nom_gerant", "");
        formData.append("telephone_gerant", "");
        formData.append("nom_gerant2", "");
        formData.append("telephone_gerant2", "");
      }

      // 3. DOCUMENTS ADMINISTRATIFS
      if (data.extrait_rccm_image) formData.append("extrait_rccm_image", data.extrait_rccm_image);
      if (data.titre_patente_image) formData.append("titre_patente_image", data.titre_patente_image);
      if (data.niu_image) formData.append("niu_image", data.niu_image);
      if (data.statuts_image) formData.append("statuts_image", data.statuts_image);
      if (data.pv_agc_image) formData.append("pv_agc_image", data.pv_agc_image);
      if (data.attestation_non_redevance_image) formData.append("attestation_non_redevance_image", data.attestation_non_redevance_image);
      if (data.proces_verbal_image) formData.append("proces_verbal_image", data.proces_verbal_image);
      if (data.registre_coop_gic_image) formData.append("registre_coop_gic_image", data.registre_coop_gic_image);
      if (data.recepisse_declaration_association_image) formData.append("recepisse_declaration_association_image", data.recepisse_declaration_association_image);

      // 4. DOCUMENTS PDF
      if (data.acte_designation_signataires_pdf) formData.append("acte_designation_signataires_pdf", data.acte_designation_signataires_pdf);
      if (data.liste_conseil_administration_pdf) formData.append("liste_conseil_administration_pdf", data.liste_conseil_administration_pdf);
      if (data.attestation_conformite_pdf) formData.append("attestation_conformite_pdf", data.attestation_conformite_pdf);
      if (data.liste_membres_pdf) formData.append("liste_membres_pdf", data.liste_membres_pdf);

      // 5. SIGNATAIRES - STRUCTURE CORRIGÉE selon l'API
      const signatairesData = [];
      
      // Fonction pour créer un signataire selon la structure API
      const createSignataire = (index, prefix, data) => {
        const signataire = {
          numero_signataire: (index + 1).toString(),
          nom: data[`nom_${prefix}`] || "",
          sexe: data[`sexe_${prefix}`] || "",
          telephone: data[`telephone_${prefix}`] || "",
          email: data[`email_${prefix}`] || "",
          cni: data[`cni_${prefix}`] || "",
          nui: data[`nui_${prefix}`] || "",
          ville: data[`ville_${prefix}`] || "",
          quartier: data[`quartier_${prefix}`] || "",
          lieu_domicile: data[`lieu_domicile_${prefix}`] || "",
          lieu_dit_domicile: data[`lieu_dit_domicile_${prefix}`] || "",
        };

        // Ajouter les fichiers
        const fileMappings = {
          photo: `photo_${prefix}`,
          signature: `signature_${prefix}`,
          lieu_dit_domicile_photo: `lieu_dit_domicile_photo_${prefix}`,
          photo_localisation_domicile: `photo_localisation_domicile_${prefix}`,
          cni_photo_recto: `cni_photo_recto_${prefix}`,
          cni_photo_verso: `cni_photo_verso_${prefix}`,
          nui_image: `nui_image_${prefix}`,
          plan_localisation_image: `plan_localisation_signataire${index + 1}_image`,
          facture_eau_image: `facture_eau_signataire${index + 1}_image`,
          facture_electricite_image: `facture_electricite_signataire${index + 1}_image`
        };

        Object.keys(fileMappings).forEach(apiField => {
          const formField = fileMappings[apiField];
          if (data[formField]) {
            signataire[apiField] = data[formField];
          }
        });

        return signataire;
      };

      // Signataire 1
      if (data.nom_signataire?.trim()) {
        const signataire1 = createSignataire(0, 'signataire', data);
        signatairesData.push(signataire1);
      }

      // Signataire 2
      if (data.nom_signataire2?.trim()) {
        const signataire2 = createSignataire(1, 'signataire2', data);
        signatairesData.push(signataire2);
      }

      // Signataire 3
      if (data.nom_signataire3?.trim()) {
        const signataire3 = createSignataire(2, 'signataire3', data);
        signatairesData.push(signataire3);
      }

      // Ajouter les signataires au FormData
      signatairesData.forEach((signataire, index) => {
        Object.keys(signataire).forEach(key => {
          if (signataire[key] instanceof File) {
            formData.append(`signataires[${index}][${key}]`, signataire[key]);
          } else {
            formData.append(`signataires[${index}][${key}]`, signataire[key]);
          }
        });
      });

      // 6. FICHIERS GERANTS
      if (data.type_entreprise === "entreprise") {
        if (data.photo_gerant) formData.append("photo_gerant", data.photo_gerant);
        if (data.photo_gerant2) formData.append("photo_gerant2", data.photo_gerant2);
      }

      // 7. PLANS DE LOCALISATION SIEGE
      if (data.plan_localisation_siege_image) formData.append("plan_localisation_siege_image", data.plan_localisation_siege_image);
      if (data.facture_eau_siege_image) formData.append("facture_eau_siege_image", data.facture_eau_siege_image);
      if (data.facture_electricite_siege_image) formData.append("facture_electricite_siege_image", data.facture_electricite_siege_image);

      // Debug: Afficher le contenu du FormData
      console.log("FormData à envoyer:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value instanceof File ? value.name : value);
      }

      const response = await ApiClient.post("/clients/morale", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Accept": "application/json"
        }
      });

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

  // Fonction pour passer à l'étape suivante avec validation
  const handleNext = async () => {
    // Validation spécifique pour chaque étape
    if (activeStep === 0 || activeStep === 1) {
      const isValid = await trigger();
      if (isValid) {
        setActiveStep(s => s + 1);
      } else {
        console.log("Erreurs de validation étape", activeStep, ":", errors);
        const firstError = Object.values(errors)[0]?.message;
        if (firstError) {
          showSnackbar(firstError, "error");
        }
      }
      return;
    }
    
    // Pour l'étape 2, validation manuelle des fichiers
    if (activeStep === 2) {
      const data = getValues();
      const step2Errors = validateStep2(data);
      
      const baseFieldsValid = await trigger(['nui', 'rccm']);
      
      if (!baseFieldsValid) {
        const firstError = Object.values(errors).find(e => e?.message)?.message;
        if (firstError) {
          showSnackbar(firstError, "error");
        }
        return;
      }
      
      if (Object.keys(step2Errors).length > 0) {
        setFileErrors(step2Errors);
        const firstError = Object.values(step2Errors)[0];
        showSnackbar(firstError, "error");
        return;
      }
      
      setActiveStep(s => s + 1);
      return;
    }
    
    // Pour l'étape 3, validation manuelle
    if (activeStep === 3) {
      const data = getValues();
      const step3Errors = validateStep3(data);
      
      if (Object.keys(step3Errors).length > 0) {
        const firstError = Object.values(step3Errors)[0];
        showSnackbar(firstError, "error");
        return;
      }
      
      if (watchTypeEntreprise === "entreprise" && !data.nom_gerant?.trim()) {
        showSnackbar("Nom du gérant requis pour les entreprises", "error");
        return;
      }
      
      setActiveStep(s => s + 1);
      return;
    }
    
    // Pour l'étape 4, validation manuelle
    if (activeStep === 4) {
      const data = getValues();
      const step4Errors = validateStep4(data);
      
      if (Object.keys(step4Errors).length > 0) {
        setFileErrors(step4Errors);
        const firstError = Object.values(step4Errors)[0];
        showSnackbar(firstError, "error");
        return;
      }
      
      handleSubmit(onSubmit)();
      return;
    }
  };

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
                          <FormControl fullWidth size="small" error={!!errors.agency_id} sx={{ minWidth: 200 }} required>
                            <InputLabel>Agence *</InputLabel>
                            <Select {...field} label="Agence *" value={field.value || ""} required>
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
                          <FormControl fullWidth size="small" error={!!errors.type_entreprise} sx={{ minWidth: 200 }}>
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
                    
                    <Grid item xs={12} md={6}>
                      <Controller 
                        name="forme_juridique" 
                        control={control} 
                        render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.forme_juridique} sx={{ minWidth: 200 }}>
                            <InputLabel>Forme Juridique *</InputLabel>
                            <Select {...field} label="Forme Juridique *" value={field.value || ""}>
                              {getFormeJuridiqueOptions(watchTypeEntreprise).map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                              ))}
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
                          <FormControl fullWidth size="small" error={!!errors.adresse_ville} sx={{ minWidth: 200 }}>
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
                          <FormControl fullWidth size="small" error={!!errors.adresse_quartier} sx={{ minWidth: 200 }}>
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
                    
                    <Grid item xs={12} md={6}>
                      <Controller 
                        name="nui" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            size="small" 
                            label="Numéro NUI *" 
                            error={!!errors.nui}
                            helperText={errors.nui?.message}
                            placeholder="Ex: M1234567890"
                          />
                        )} 
                      />
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
                            label="Numéro RCCM (Optionnel)" 
                            placeholder="Ex: RCCM/CM-CMR/2024/B/00123"
                          />
                        )} 
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FileUploadField
                        label="Photocopie des Statuts (image) *"
                        fieldName="statuts_image"
                        preview={statutsPreview}
                        setPreview={setStatutsPreview}
                        required={true}
                        description="Statuts de l'entreprise - max 2MB"
                          />
                    </Grid>                      
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Photocopie NUI (image) *"
                        fieldName="niu_image"
                        preview={niuPreview}
                        setPreview={setNiuPreview}
                        required={true}
                        description="Photocopie du document NUI - max 2MB"
                      />
                    </Grid> 
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>

                    {/* DOCUMENTS ENTREPRISE */}
                    {watchTypeEntreprise === "entreprise" && (
                      <>
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary">
                            Documents Obligatoires - Entreprise
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Les documents suivants sont obligatoires pour les entreprises
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <FileUploadField
                            label="Extrait RCCM (image) *"
                            fieldName="extrait_rccm_image"
                            preview={extraitRccmPreview}
                            setPreview={setExtraitRccmPreview}
                            required={true}
                            description="Format: JPEG, PNG (max 2MB)"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <FileUploadField
                            label="Titre de Patente (image) *"
                            fieldName="titre_patente_image"
                            preview={titrePatentePreview}
                            setPreview={setTitrePatentePreview}
                            required={true}
                            description="Patente de l'exercice en cours"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <PDFUploadField
                            label="Acte de Désignation des Signataires (PDF) *"
                            fieldName="acte_designation_signataires_pdf"
                            required={true}
                            description="Document PDF - max 5MB"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <PDFUploadField
                            label="Attestation de Conformité (PDF) *"
                            fieldName="attestation_conformite_pdf"
                            required={true}
                            description="Document PDF attestant de la conformité - max 5MB"
                          />
                        </Grid>
                      </>
                    )}

                    {/* DOCUMENTS ASSOCIATION */}
                    {watchTypeEntreprise === "association" && (
                      <>
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary">
                            Documents Obligatoires - Association
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Les documents suivants sont obligatoires pour les associations
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FileUploadField
                            label="PV de l'AGC (image) *"
                            fieldName="pv_agc_image"
                            preview={pvAgcPreview}
                            setPreview={setPvAgcPreview}
                            required={true}
                            description="Procès-Verbal de l'Assemblée Générale Constitutive"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FileUploadField
                            label="Attestation de non redevance (image) *"
                            fieldName="attestation_non_redevance_image"
                            preview={attestationPreview}
                            setPreview={setAttestationPreview}
                            required={true}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FileUploadField
                            label="Procès Verbal (image) *"
                            fieldName="proces_verbal_image"
                            preview={procesVerbalPreview}
                            setPreview={setProcesVerbalPreview}
                            required={true}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FileUploadField
                            label="Registre COOP-GIC (image) *"
                            fieldName="registre_coop_gic_image"
                            preview={registreCoopPreview}
                            setPreview={setRegistreCoopPreview}
                            required={true}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FileUploadField
                            label="Récépissé de déclaration (image) *"
                            fieldName="recepisse_declaration_association_image"
                            preview={recepissePreview}
                            setPreview={setRecepissePreview}
                            required={true}
                            description="Récépissé de déclaration compétente"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <PDFUploadField
                            label="Attestation de Conformité (PDF) *"
                            fieldName="attestation_conformite_pdf"
                            required={true}
                            description="Document PDF attestant de la conformité - max 5MB"
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                )}

                {/* ÉTAPE 3 : GÉRANCE & SIGNATAIRES */}
                {activeStep === 3 && (
                  <Grid container spacing={3}>
                    
                    {/* Gérants - Uniquement pour les entreprises */}
                    {watchTypeEntreprise === "entreprise" && ( 
                      <>
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
                                    helperText={errors.nom_gerant?.message || (watchTypeEntreprise === "entreprise" ? "Obligatoire pour les entreprises" : "")}
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
                      </>
                    )}
                    
                    {/* Pour les associations, afficher un message */}
                    {watchTypeEntreprise === "association" && (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 3, bgcolor: blueGrey[50], textAlign: 'center' }}>
                          <Typography variant="body1" color="textSecondary">
                            Pour les associations, la section "Gérants" n'est pas applicable.
                            Veuillez renseigner les signataires dans la section ci-dessous.
                          </Typography>
                        </Paper>
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
                    
                    {/* SIGNATAIRE 1 */}
                    {signataireTab === 0 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
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
                        <Grid item xs={12} md={4}>
                          <Controller 
                            name="sexe_signataire" 
                            control={control} 
                            render={({ field }) => (
                              <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Sexe</InputLabel>
                                <Select {...field} label="Sexe" value={field.value || ""}>
                                  <MenuItem value="M">Masculin</MenuItem>
                                  <MenuItem value="F">Féminin</MenuItem>
                                </Select>
                              </FormControl>
                            )} 
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
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
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="email_signataire" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Email Signataire 1" 
                                type="email"
                                placeholder="exemple@email.com"
                                error={!!errors.email_signataire}
                                helperText={errors.email_signataire?.message}
                              />
                            )} 
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="cni_signataire" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Numéro CNI Signataire 1" 
                                placeholder="Ex: 123456789012"
                              />
                            )} 
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="nui_signataire" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Numéro NUI Signataire 1" 
                                placeholder="Ex: M1234567890"
                              />
                            )} 
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" fontWeight="bold" color="primary">
                            Localisation Signataire 1
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="ville_signataire" 
                            control={control} 
                            render={({ field }) => (
                              <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Ville</InputLabel>
                                <Select {...field} label="Ville" value={field.value || ""}>
                                  {Object.keys(CITY_DATA).map(ville => (
                                    <MenuItem key={ville} value={ville}>{ville}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )} 
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="quartier_signataire" 
                            control={control} 
                            render={({ field }) => (
                              <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Quartier</InputLabel>
                                <Select {...field} label="Quartier" value={field.value || ""}>
                                  {quartiersSignataire1.map(quartier => (
                                    <MenuItem key={quartier} value={quartier}>{quartier}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )} 
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="lieu_domicile_signataire" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Lieu de domicile" 
                                placeholder="Adresse complète"
                              />
                            )} 
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="lieu_dit_domicile_signataire" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Lieu-dit du domicile" 
                                placeholder="Lieu-dit précis"
                              />
                            )} 
                          />
                        </Grid>
                      </Grid>
                    )}
                    
                    {/* SIGNATAIRE 2 */}
                    {signataireTab === 1 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
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
                        <Grid item xs={12} md={4}>
                          <Controller 
                            name="sexe_signataire2" 
                            control={control} 
                            render={({ field }) => (
                              <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Sexe</InputLabel>
                                <Select {...field} label="Sexe" value={field.value || ""}>
                                  <MenuItem value="M">Masculin</MenuItem>
                                  <MenuItem value="F">Féminin</MenuItem>
                                </Select>
                              </FormControl>
                            )} 
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Controller 
                            name="telephone_signataire2" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Téléphone Signataire 2" 
                                placeholder="Ex: 677333444"
                              />
                            )} 
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="email_signataire2" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Email Signataire 2" 
                                type="email"
                                placeholder="exemple@email.com"
                                error={!!errors.email_signataire2}
                                helperText={errors.email_signataire2?.message}
                              />
                            )} 
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="cni_signataire2" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Numéro CNI Signataire 2" 
                                placeholder="Ex: 123456789013"
                              />
                            )} 
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="nui_signataire2" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Numéro NUI Signataire 2" 
                                placeholder="Ex: M1234567891"
                              />
                            )} 
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" fontWeight="bold" color="primary">
                            Localisation Signataire 2
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="ville_signataire2" 
                            control={control} 
                            render={({ field }) => (
                              <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Ville</InputLabel>
                                <Select {...field} label="Ville" value={field.value || ""}>
                                  {Object.keys(CITY_DATA).map(ville => (
                                    <MenuItem key={ville} value={ville}>{ville}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )} 
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="quartier_signataire2" 
                            control={control} 
                            render={({ field }) => (
                              <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Quartier</InputLabel>
                                <Select {...field} label="Quartier" value={field.value || ""}>
                                  {quartiersSignataire2.map(quartier => (
                                    <MenuItem key={quartier} value={quartier}>{quartier}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )} 
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="lieu_domicile_signataire2" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Lieu de domicile" 
                                placeholder="Adresse complète"
                              />
                            )} 
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="lieu_dit_domicile_signataire2" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Lieu-dit du domicile" 
                                placeholder="Lieu-dit précis"
                              />
                            )} 
                          />
                        </Grid>
                      </Grid>
                    )}
                    
                    {/* SIGNATAIRE 3 */}
                    {signataireTab === 2 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
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
                        <Grid item xs={12} md={4}>
                          <Controller 
                            name="sexe_signataire3" 
                            control={control} 
                            render={({ field }) => (
                              <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Sexe</InputLabel>
                                <Select {...field} label="Sexe" value={field.value || ""}>
                                  <MenuItem value="M">Masculin</MenuItem>
                                  <MenuItem value="F">Féminin</MenuItem>
                                </Select>
                              </FormControl>
                            )} 
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
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
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="email_signataire3" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Email Signataire 3" 
                                type="email"
                                placeholder="exemple@email.com"
                                error={!!errors.email_signataire3}
                                helperText={errors.email_signataire3?.message}
                              />
                            )} 
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="cni_signataire3" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Numéro CNI Signataire 3" 
                                placeholder="Ex: 123456789014"
                              />
                            )} 
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="nui_signataire3" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Numéro NUI Signataire 3" 
                                placeholder="Ex: M1234567892"
                              />
                            )} 
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" fontWeight="bold" color="primary">
                            Localisation Signataire 3
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="ville_signataire3" 
                            control={control} 
                            render={({ field }) => (
                              <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Ville</InputLabel>
                                <Select {...field} label="Ville" value={field.value || ""}>
                                  {Object.keys(CITY_DATA).map(ville => (
                                    <MenuItem key={ville} value={ville}>{ville}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )} 
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="quartier_signataire3" 
                            control={control} 
                            render={({ field }) => (
                              <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Quartier</InputLabel>
                                <Select {...field} label="Quartier" value={field.value || ""}>
                                  {quartiersSignataire3.map(quartier => (
                                    <MenuItem key={quartier} value={quartier}>{quartier}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )} 
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="lieu_domicile_signataire3" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Lieu de domicile" 
                                placeholder="Adresse complète"
                              />
                            )} 
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Controller 
                            name="lieu_dit_domicile_signataire3" 
                            control={control} 
                            render={({ field }) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                size="small" 
                                label="Lieu-dit du domicile" 
                                placeholder="Lieu-dit précis"
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
                            label="CAPITAL (FCFA)" 
                            type="number"
                            InputProps={{ inputProps: { min: 0, step: 100 } }}
                            error={!!errors.solde_initial}
                            helperText={errors.solde_initial?.message}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                            }}
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
                        Fichiers et Photos
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Tous les champs marqués d'un * sont obligatoires pour les signataires renseignés
                      </Typography>
                    </Grid>
                    
                    {/* Photos des Gérants - Uniquement pour les entreprises */}
                    {watchTypeEntreprise === "entreprise" && (
                      <>
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                            Photos des Gérants
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FileUploadField
                            label="Photo Gérant Principal *"
                            fieldName="photo_gerant"
                            preview={gerantPreview[0]}
                            setPreview={setGerantPreview}
                            previewIndex={0}
                            required={true}
                            description="Format: JPEG, PNG (max 2MB)"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FileUploadField
                            label="Photo Gérant Secondaire"
                            fieldName="photo_gerant2"
                            preview={gerantPreview[1]}
                            setPreview={setGerantPreview}
                            previewIndex={1}
                            required={!!watchNomGerant2}
                            description="Format: JPEG, PNG (max 2MB)"
                            disabled={!watchNomGerant2}
                          />
                        </Grid>
                      </>
                    )}
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                        Photos et Signatures des Signataires
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Les documents sont requis uniquement pour les signataires renseignés
                      </Typography>
                    </Grid>
                    
                    {/* Signataire 1 - Section complète */}
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, bgcolor: signatairesRemplis[0] ? blueGrey[50] : '#f5f5f5', mb: 3 }}>
                        <Typography variant="h6" color={signatairesRemplis[0] ? indigo[700] : 'text.disabled'}>
                          Signataire 1 {signatairesRemplis[0] ? '' : '(Non renseigné)'}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Photo Signataire 1"
                        fieldName="photo_signataire"
                        preview={signatairePreviews[0]}
                        setPreview={setSignatairePreviews}
                        previewIndex={0}
                        required={signatairesRemplis[0]}
                        description="Format: JPEG, PNG (max 2MB)"
                        disabled={!signatairesRemplis[0]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Signature Signataire 1"
                        fieldName="signature_signataire"
                        preview={signaturePreviews[0]}
                        setPreview={setSignaturePreviews}
                        previewIndex={0}
                        required={signatairesRemplis[0]}
                        description="Format: JPEG, PNG (max 2MB)"
                        disabled={!signatairesRemplis[0]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Photo lieu-dit domicile Signataire 1"
                        fieldName="lieu_dit_domicile_photo_signataire"
                        preview={lieuDitDomicilePhotoPreviews[0]}
                        setPreview={setLieuDitDomicilePhotoPreviews}
                        previewIndex={0}
                        required={signatairesRemplis[0]}
                        description="Photo du lieu-dit du domicile"
                        disabled={!signatairesRemplis[0]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Photo localisation domicile Signataire 1"
                        fieldName="photo_localisation_domicile_signataire"
                        preview={photoLocalisationDomicilePreviews[0]}
                        setPreview={setPhotoLocalisationDomicilePreviews}
                        previewIndex={0}
                        required={signatairesRemplis[0]}
                        description="Photo de localisation du domicile"
                        disabled={!signatairesRemplis[0]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="CNI recto Signataire 1"
                        fieldName="cni_photo_recto_signataire"
                        preview={cniRectoPreviews[0]}
                        setPreview={setCniRectoPreviews}
                        previewIndex={0}
                        required={signatairesRemplis[0]}
                        description="Recto de la CNI"
                        disabled={!signatairesRemplis[0]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="CNI verso Signataire 1"
                        fieldName="cni_photo_verso_signataire"
                        preview={cniVersoPreviews[0]}
                        setPreview={setCniVersoPreviews}
                        previewIndex={0}
                        required={signatairesRemplis[0]}
                        description="Verso de la CNI"
                        disabled={!signatairesRemplis[0]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="NUI Signataire 1"
                        fieldName="nui_image_signataire"
                        preview={nuiSignatairePreviews[0]}
                        setPreview={setNuiSignatairePreviews}
                        previewIndex={0}
                        required={signatairesRemplis[0]}
                        description="Photocopie NUI du signataire - max 2MB"
                        disabled={!signatairesRemplis[0]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Plan localisation Signataire 1"
                        fieldName="plan_localisation_signataire1_image"
                        preview={planSignatairePreviews[0]}
                        setPreview={setPlanSignatairePreviews}
                        previewIndex={0}
                        required={signatairesRemplis[0]}
                        disabled={!signatairesRemplis[0]}
                        description={signatairesRemplis[0] ? "Plan de localisation du domicile" : "Non requis"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Facture eau Signataire 1"
                        fieldName="facture_eau_signataire1_image"
                        preview={factureEauSignatairePreviews[0]}
                        setPreview={setFactureEauSignatairePreviews}
                        previewIndex={0}
                        required={signatairesRemplis[0]}
                        disabled={!signatairesRemplis[0]}
                        description={signatairesRemplis[0] ? "Photocopie facture d'eau" : "Non requis"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Facture électricité Signataire 1"
                        fieldName="facture_electricite_signataire1_image"
                        preview={factureElecSignatairePreviews[0]}
                        setPreview={setFactureElecSignatairePreviews}
                        previewIndex={0}
                        required={signatairesRemplis[0]}
                        disabled={!signatairesRemplis[0]}
                        description={signatairesRemplis[0] ? "Photocopie facture d'électricité" : "Non requis"}
                      />
                    </Grid>
                    
                    {/* Signataire 2 - Section complète */}
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, bgcolor: signatairesRemplis[1] ? blueGrey[50] : '#f5f5f5', mb: 3, mt: 4 }}>
                        <Typography variant="h6" color={signatairesRemplis[1] ? indigo[700] : 'text.disabled'}>
                          Signataire 2 {signatairesRemplis[1] ? '' : '(Non renseigné)'}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Photo Signataire 2"
                        fieldName="photo_signataire2"
                        preview={signatairePreviews[1]}
                        setPreview={setSignatairePreviews}
                        previewIndex={1}
                        required={signatairesRemplis[1]}
                        description="Format: JPEG, PNG (max 2MB)"
                        disabled={!signatairesRemplis[1]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Signature Signataire 2"
                        fieldName="signature_signataire2"
                        preview={signaturePreviews[1]}
                        setPreview={setSignaturePreviews}
                        previewIndex={1}
                        required={signatairesRemplis[1]}
                        description="Format: JPEG, PNG (max 2MB)"
                        disabled={!signatairesRemplis[1]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Photo lieu-dit domicile Signataire 2"
                        fieldName="lieu_dit_domicile_photo_signataire2"
                        preview={lieuDitDomicilePhotoPreviews[1]}
                        setPreview={setLieuDitDomicilePhotoPreviews}
                        previewIndex={1}
                        required={signatairesRemplis[1]}
                        description="Photo du lieu-dit du domicile"
                        disabled={!signatairesRemplis[1]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Photo localisation domicile Signataire 2"
                        fieldName="photo_localisation_domicile_signataire2"
                        preview={photoLocalisationDomicilePreviews[1]}
                        setPreview={setPhotoLocalisationDomicilePreviews}
                        previewIndex={1}
                        required={signatairesRemplis[1]}
                        description="Photo de localisation du domicile"
                        disabled={!signatairesRemplis[1]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="CNI recto Signataire 2"
                        fieldName="cni_photo_recto_signataire2"
                        preview={cniRectoPreviews[1]}
                        setPreview={setCniRectoPreviews}
                        previewIndex={1}
                        required={signatairesRemplis[1]}
                        description="Recto de la CNI"
                        disabled={!signatairesRemplis[1]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="CNI verso Signataire 2"
                        fieldName="cni_photo_verso_signataire2"
                        preview={cniVersoPreviews[1]}
                        setPreview={setCniVersoPreviews}
                        previewIndex={1}
                        required={signatairesRemplis[1]}
                        description="Verso de la CNI"
                        disabled={!signatairesRemplis[1]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="NUI Signataire 2"
                        fieldName="nui_image_signataire2"
                        preview={nuiSignatairePreviews[1]}
                        setPreview={setNuiSignatairePreviews}
                        previewIndex={1}
                        required={signatairesRemplis[1]}
                        description="Photocopie NUI du signataire - max 2MB"
                        disabled={!signatairesRemplis[1]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Plan localisation Signataire 2"
                        fieldName="plan_localisation_signataire2_image"
                        preview={planSignatairePreviews[1]}
                        setPreview={setPlanSignatairePreviews}
                        previewIndex={1}
                        required={signatairesRemplis[1]}
                        disabled={!signatairesRemplis[1]}
                        description={signatairesRemplis[1] ? "Plan de localisation du domicile" : "Non requis"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Facture eau Signataire 2"
                        fieldName="facture_eau_signataire2_image"
                        preview={factureEauSignatairePreviews[1]}
                        setPreview={setFactureEauSignatairePreviews}
                        previewIndex={1}
                        required={signatairesRemplis[1]}
                        disabled={!signatairesRemplis[1]}
                        description={signatairesRemplis[1] ? "Photocopie facture d'eau" : "Non requis"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Facture électricité Signataire 2"
                        fieldName="facture_electricite_signataire2_image"
                        preview={factureElecSignatairePreviews[1]}
                        setPreview={setFactureElecSignatairePreviews}
                        previewIndex={1}
                        required={signatairesRemplis[1]}
                        disabled={!signatairesRemplis[1]}
                        description={signatairesRemplis[1] ? "Photocopie facture d'électricité" : "Non requis"}
                      />
                    </Grid>
                    
                    {/* Signataire 3 - Section complète */}
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, bgcolor: signatairesRemplis[2] ? blueGrey[50] : '#f5f5f5', mb: 3, mt: 4 }}>
                        <Typography variant="h6" color={signatairesRemplis[2] ? indigo[700] : 'text.disabled'}>
                          Signataire 3 {signatairesRemplis[2] ? '' : '(Non renseigné)'}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Photo Signataire 3"
                        fieldName="photo_signataire3"
                        preview={signatairePreviews[2]}
                        setPreview={setSignatairePreviews}
                        previewIndex={2}
                        required={signatairesRemplis[2]}
                        description="Format: JPEG, PNG (max 2MB)"
                        disabled={!signatairesRemplis[2]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Signature Signataire 3"
                        fieldName="signature_signataire3"
                        preview={signaturePreviews[2]}
                        setPreview={setSignaturePreviews}
                        previewIndex={2}
                        required={signatairesRemplis[2]}
                        description="Format: JPEG, PNG (max 2MB)"
                        disabled={!signatairesRemplis[2]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Photo lieu-dit domicile Signataire 3"
                        fieldName="lieu_dit_domicile_photo_signataire3"
                        preview={lieuDitDomicilePhotoPreviews[2]}
                        setPreview={setLieuDitDomicilePhotoPreviews}
                        previewIndex={2}
                        required={signatairesRemplis[2]}
                        description="Photo du lieu-dit du domicile"
                        disabled={!signatairesRemplis[2]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Photo localisation domicile Signataire 3"
                        fieldName="photo_localisation_domicile_signataire3"
                        preview={photoLocalisationDomicilePreviews[2]}
                        setPreview={setPhotoLocalisationDomicilePreviews}
                        previewIndex={2}
                        required={signatairesRemplis[2]}
                        description="Photo de localisation du domicile"
                        disabled={!signatairesRemplis[2]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="CNI recto Signataire 3"
                        fieldName="cni_photo_recto_signataire3"
                        preview={cniRectoPreviews[2]}
                        setPreview={setCniRectoPreviews}
                        previewIndex={2}
                        required={signatairesRemplis[2]}
                        description="Recto de la CNI"
                        disabled={!signatairesRemplis[2]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="CNI verso Signataire 3"
                        fieldName="cni_photo_verso_signataire3"
                        preview={cniVersoPreviews[2]}
                        setPreview={setCniVersoPreviews}
                        previewIndex={2}
                        required={signatairesRemplis[2]}
                        description="Verso de la CNI"
                        disabled={!signatairesRemplis[2]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="NUI Signataire 3"
                        fieldName="nui_image_signataire3"
                        preview={nuiSignatairePreviews[2]}
                        setPreview={setNuiSignatairePreviews}
                        previewIndex={2}
                        required={signatairesRemplis[2]}
                        description="Photocopie NUI du signataire - max 2MB"
                        disabled={!signatairesRemplis[2]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Plan localisation Signataire 3"
                        fieldName="plan_localisation_signataire3_image"
                        preview={planSignatairePreviews[2]}
                        setPreview={setPlanSignatairePreviews}
                        previewIndex={2}
                        required={signatairesRemplis[2]}
                        disabled={!signatairesRemplis[2]}
                        description={signatairesRemplis[2] ? "Plan de localisation du domicile" : "Non requis"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Facture eau Signataire 3"
                        fieldName="facture_eau_signataire3_image"
                        preview={factureEauSignatairePreviews[2]}
                        setPreview={setFactureEauSignatairePreviews}
                        previewIndex={2}
                        required={signatairesRemplis[2]}
                        disabled={!signatairesRemplis[2]}
                        description={signatairesRemplis[2] ? "Photocopie facture d'eau" : "Non requis"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Facture électricité Signataire 3"
                        fieldName="facture_electricite_signataire3_image"
                        preview={factureElecSignatairePreviews[2]}
                        setPreview={setFactureElecSignatairePreviews}
                        previewIndex={2}
                        required={signatairesRemplis[2]}
                        disabled={!signatairesRemplis[2]}
                        description={signatairesRemplis[2] ? "Photocopie facture d'électricité" : "Non requis"}
                      />
                    </Grid>
                    
                    {/* DOCUMENTS SUPPLEMENTAIRES */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 4 }}>
                        Documents Administratifs Supplémentaires
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <PDFUploadField
                        label="Liste du Conseil d'Administration (PDF)"
                        fieldName="liste_conseil_administration_pdf"
                        description="Document PDF - max 5MB"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <PDFUploadField
                        label="Liste des Membres (PDF)"
                        fieldName="liste_membres_pdf"
                        description="Liste des membres de l'entreprise/association - max 5MB"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                        Localisation du Siège
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Plan localisation siège"
                        fieldName="plan_localisation_siege_image"
                        preview={planSiegePreview}
                        setPreview={setPlanSiegePreview}
                        description="Plan de localisation du siège"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Facture eau siège"
                        fieldName="facture_eau_siege_image"
                        preview={factureEauSiegePreview}
                        setPreview={setFactureEauSiegePreview}
                        description="Photocopie facture d'eau du siège"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Facture électricité siège"
                        fieldName="facture_electricite_siege_image"
                        preview={factureElecSiegePreview}
                        setPreview={setFactureElecSiegePreview}
                        description="Photocopie facture d'électricité du siège"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                        Photos de Localisation
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FileUploadField
                        label="Photo localisation siège"
                        fieldName="photo_localisation_domicile"
                        preview={photoDomicilePreview}
                        setPreview={setPhotoDomicilePreview}
                        description="Format: JPEG, PNG (max 2MB)"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FileUploadField
                        label="Photo localisation activité"
                        fieldName="photo_localisation_activite"
                        preview={photoActivitePreview}
                        setPreview={setPhotoActivitePreview}
                        description="Format: JPEG, PNG (max 2MB)"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                        Documents PDF Communs
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FileUploadField
                        label="Photocopie des Statuts (image) *"
                        fieldName="statuts_image"
                        preview={statutsPreview}
                        setPreview={setStatutsPreview}
                        required={true}
                        description="Statuts de l'entreprise - max 2MB"
                          />
                    </Grid>  

                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Photocopie NUI (image) *"
                        fieldName="niu_image"
                        preview={niuPreview}
                        setPreview={setNiuPreview}
                        required={true}
                        description="Photocopie du document NUI - max 2MB"
                      />
                    </Grid> 
                    
                    <Grid item xs={12} md={4}>
                      <PDFUploadField
                        label="Acte de Désignation des Signataires (PDF)"
                        fieldName="acte_designation_signataires_pdf"
                        description="Acte de désignation des signataires - max 5MB"
                      />
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
                  onClick={() => {
                    setActiveStep(s => s - 1);
                    if (activeStep === 3 || activeStep === 4) {
                      setFileErrors({});
                    }
                  }}
                >
                  Précédent
                </Button>

                {activeStep === STEPS.length - 1 ? (
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    type="button" 
                    onClick={handleNext}
                    sx={{ px: 4 }}
                  >
                    Enregistrer l'Entreprise
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    variant="contained" 
                    onClick={handleNext}
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