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
import { PhotoCamera, Close } from "@mui/icons-material";

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

// Créer des schémas dynamiques basés sur les données du formulaire
const createSchemas = (formData) => {
  const baseSchemas = [
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
      nui: Yup.string().required("N° NUI requis"),
    }),
    Yup.object({
      nom_gerant: Yup.string().required("Nom du gérant requis"),
    }),
    Yup.object({}),
  ];

  // Ajuster le schéma de l'étape 2 (Documents Légaux) en fonction du type d'entreprise
  const docSchema = {};
  
  if (formData?.type_entreprise === "entreprise") {
    docSchema.extrait_rccm_image = Yup.mixed().required("Extrait RCCM obligatoire");
    docSchema.titre_patente_image = Yup.mixed().required("Titre de patente obligatoire");
    docSchema.niu_image = Yup.mixed().required("Photocopie NUI obligatoire");
    docSchema.statuts_image = Yup.mixed().required("Photocopie des Statuts obligatoire");
    docSchema.acte_designation_signataires_pdf = Yup.mixed().required("Acte de désignation obligatoire");
    docSchema.attestation_conformite_pdf = Yup.mixed().required("Attestation de conformité obligatoire");
  } else if (formData?.type_entreprise === "association") {
    docSchema.pv_agc_image = Yup.mixed().required("PV AGC obligatoire");
    docSchema.attestation_non_redevance_image = Yup.mixed().required("Attestation de non redevance obligatoire");
    docSchema.proces_verbal_image = Yup.mixed().required("Procès-verbal obligatoire");
    docSchema.registre_coop_gic_image = Yup.mixed().required("Registre COOP-GIC obligatoire");
    docSchema.recepisse_declaration_association_image = Yup.mixed().required("Récépissé de déclaration obligatoire");
    docSchema.attestation_conformite_pdf = Yup.mixed().required("Attestation de conformité obligatoire");
  }
  
  baseSchemas[2] = Yup.object({
    rccm: Yup.string().nullable(),
    nui: Yup.string().required("N° NUI requis"),
    ...docSchema
  });

  return baseSchemas;
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
  
  // Prévisualisations
  const [gerantPreview, setGerantPreview] = useState([null, null]);
  const [signatairePreviews, setSignatairePreviews] = useState([null, null, null]);
  const [signaturePreviews, setSignaturePreviews] = useState([null, null, null]);
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
  
  // Références pour les fichiers
  const fileInputsRef = React.useRef({});

  // Définir les valeurs par défaut du formulaire
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
    
    // Photos signataires
    photo_signataire: null,
    photo_signataire2: null,
    photo_signataire3: null,
    signature_signataire: null,
    signature_signataire2: null,
    signature_signataire3: null,
    
    // Plans localisation signataires
    plan_localisation_signataire1_image: null,
    plan_localisation_signataire2_image: null,
    plan_localisation_signataire3_image: null,
    
    // Factures signataires
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

  const { control, handleSubmit, trigger, watch, setValue, getValues, formState: { errors } } = useForm({
    defaultValues,
    mode: "onTouched",
    shouldUnregister: false,
  });

  const selectedAgency = watch("agency_id");
  const selectedVille = watch("adresse_ville");
  const watchTypeEntreprise = watch("type_entreprise");
  const watchNomGerant2 = watch("nom_gerant2");
  const watchNomSignataire = watch("nom_signataire");
  const watchNomSignataire2 = watch("nom_signataire2");
  const watchNomSignataire3 = watch("nom_signataire3");
  const watchNui = watch("nui");
  
  // Mettre à jour les schémas de validation quand les données changent
  const formData = watch();
  const [schemas, setSchemas] = useState(createSchemas(formData));

  useEffect(() => {
    setSchemas(createSchemas(formData));
  }, [formData.type_entreprise]);

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

  // Mettre à jour les signataires remplis
  useEffect(() => {
    const nouveauxRemplis = [...signatairesRemplis];
    nouveauxRemplis[0] = !!watchNomSignataire?.trim();
    nouveauxRemplis[1] = !!watchNomSignataire2?.trim();
    nouveauxRemplis[2] = !!watchNomSignataire3?.trim();
    setSignatairesRemplis(nouveauxRemplis);
  }, [watchNomSignataire, watchNomSignataire2, watchNomSignataire3]);

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

  const handleFileChange = (field, e, setPreview = null) => {
    const file = e.target.files[0];
    if (file) {
      setValue(field, file, { shouldValidate: true });
      if (setPreview) {
        setPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleGerantPhotoChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'photo_gerant' : 'photo_gerant2';
      setValue(field, file, { shouldValidate: true });
      
      const newPreviews = [...gerantPreview];
      newPreviews[index] = URL.createObjectURL(file);
      setGerantPreview(newPreviews);
    }
  };

  const handleSignatairePhotoChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'photo_signataire' : index === 1 ? 'photo_signataire2' : 'photo_signataire3';
      setValue(field, file, { shouldValidate: true });
      
      const newPreviews = [...signatairePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setSignatairePreviews(newPreviews);
    }
  };

  const handleSignatureChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'signature_signataire' : index === 1 ? 'signature_signataire2' : 'signature_signataire3';
      setValue(field, file, { shouldValidate: true });
      
      const newPreviews = [...signaturePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setSignaturePreviews(newPreviews);
    }
  };

  const handlePlanSignataireChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'plan_localisation_signataire1_image' : index === 1 ? 'plan_localisation_signataire2_image' : 'plan_localisation_signataire3_image';
      setValue(field, file, { shouldValidate: true });
      
      const newPreviews = [...planSignatairePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setPlanSignatairePreviews(newPreviews);
    }
  };

  const handleFactureEauSignataireChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'facture_eau_signataire1_image' : index === 1 ? 'facture_eau_signataire2_image' : 'facture_eau_signataire3_image';
      setValue(field, file, { shouldValidate: true });
      
      const newPreviews = [...factureEauSignatairePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setFactureEauSignatairePreviews(newPreviews);
    }
  };

  const handleFactureElecSignataireChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const field = index === 0 ? 'facture_electricite_signataire1_image' : index === 1 ? 'facture_electricite_signataire2_image' : 'facture_electricite_signataire3_image';
      setValue(field, file, { shouldValidate: true });
      
      const newPreviews = [...factureElecSignatairePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setFactureElecSignatairePreviews(newPreviews);
    }
  };

  const removeFile = (field, setPreview = null) => {
    setValue(field, null, { shouldValidate: true });
    if (setPreview) {
      setPreview(null);
    }
    // Réinitialiser l'input file
    if (fileInputsRef.current[field]) {
      fileInputsRef.current[field].value = "";
    }
  };

  const FileUploadField = ({ 
    label, 
    fieldName, 
    accept = "image/*", 
    preview, 
    setPreview, 
    required = false, 
    description = "",
    disabled = false
  }) => {
    return (
      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ color: indigo[700] }}>
            {label} {required && <span style={{color: 'red'}}>*</span>}
          </Typography>
          {preview && !disabled && (
            <IconButton size="small" onClick={() => removeFile(fieldName, setPreview)}>
              <Close fontSize="small" />
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
        <Controller 
          name={fieldName} 
          control={control} 
          rules={{ required: required && !disabled ? `${label} est obligatoire` : false }}
          render={({ field }) => (
            <input
              type="file"
              accept={accept}
              onChange={(e) => handleFileChange(fieldName, e, setPreview)}
              style={{ width: '100%' }}
              disabled={disabled}
              ref={(el) => {
                fileInputsRef.current[fieldName] = el;
                field.ref(el);
              }}
            />
          )} 
        />
        {description && (
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
            {description}
          </Typography>
        )}
        {errors[fieldName] && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
            {errors[fieldName]?.message}
          </Typography>
        )}
      </Box>
    );
  };

  const PDFUploadField = ({ 
    label, 
    fieldName, 
    required = false, 
    description = "",
    disabled = false
  }) => {
    return (
      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
          {label} {required && <span style={{color: 'red'}}>*</span>}
        </Typography>
        <Controller 
          name={fieldName} 
          control={control} 
          rules={{ required: required && !disabled ? `${label} est obligatoire` : false }}
          render={({ field }) => (
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(fieldName, e, attestationConformitePreview ? setAttestationConformitePreview : null)}
              style={{ width: '100%' }}
              disabled={disabled}
              ref={(el) => {
                fileInputsRef.current[fieldName] = el;
                field.ref(el);
              }}
            />
          )} 
        />
        {description && (
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
            {description}
          </Typography>
        )}
        {errors[fieldName] && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
            {errors[fieldName]?.message}
          </Typography>
        )}
      </Box>
    );
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
      formData.append("rccm", data.rccm || "");
      formData.append("nui", data.nui);
      formData.append("nom_gerant", data.nom_gerant);
      formData.append("telephone_gerant", data.telephone_gerant || "");
      
      // Ajouter gérant 2 seulement si nom renseigné
      if (data.nom_gerant2) {
        formData.append("nom_gerant2", data.nom_gerant2);
        formData.append("telephone_gerant2", data.telephone_gerant2 || "");
      }
      
      // Ajouter signataires seulement si nom renseigné
      if (data.nom_signataire) {
        formData.append("nom_signataire", data.nom_signataire);
        formData.append("telephone_signataire", data.telephone_signataire || "");
      }
      if (data.nom_signataire2) {
        formData.append("nom_signataire2", data.nom_signataire2);
        formData.append("telephone_signataire2", data.telephone_signataire2 || "");
      }
      if (data.nom_signataire3) {
        formData.append("nom_signataire3", data.nom_signataire3);
        formData.append("telephone_signataire3", data.telephone_signataire3 || "");
      }

      // 4. FICHIERS GERANTS ET SIGNATAIRES
      if (data.photo_gerant) formData.append("photo_gerant", data.photo_gerant);
      if (data.nom_gerant2 && data.photo_gerant2) formData.append("photo_gerant2", data.photo_gerant2);
      
      if (data.nom_signataire && data.photo_signataire) formData.append("photo_signataire", data.photo_signataire);
      if (data.nom_signataire2 && data.photo_signataire2) formData.append("photo_signataire2", data.photo_signataire2);
      if (data.nom_signataire3 && data.photo_signataire3) formData.append("photo_signataire3", data.photo_signataire3);
      
      if (data.nom_signataire && data.signature_signataire) formData.append("signature_signataire", data.signature_signataire);
      if (data.nom_signataire2 && data.signature_signataire2) formData.append("signature_signataire2", data.signature_signataire2);
      if (data.nom_signataire3 && data.signature_signataire3) formData.append("signature_signataire3", data.signature_signataire3);

      // 5. DOCUMENTS ADMINISTRATIFS
      if (data.extrait_rccm_image) formData.append("extrait_rccm_image", data.extrait_rccm_image);
      if (data.titre_patente_image) formData.append("titre_patente_image", data.titre_patente_image);
      if (data.niu_image) formData.append("niu_image", data.niu_image);
      if (data.statuts_image) formData.append("statuts_image", data.statuts_image);
      if (data.pv_agc_image) formData.append("pv_agc_image", data.pv_agc_image);
      if (data.attestation_non_redevance_image) formData.append("attestation_non_redevance_image", data.attestation_non_redevance_image);
      if (data.proces_verbal_image) formData.append("proces_verbal_image", data.proces_verbal_image);
      if (data.registre_coop_gic_image) formData.append("registre_coop_gic_image", data.registre_coop_gic_image);
      if (data.recepisse_declaration_association_image) formData.append("recepisse_declaration_association_image", data.recepisse_declaration_association_image);

      // 6. DOCUMENTS PDF
      if (data.acte_designation_signataires_pdf) formData.append("acte_designation_signataires_pdf", data.acte_designation_signataires_pdf);
      if (data.liste_conseil_administration_pdf) formData.append("liste_conseil_administration_pdf", data.liste_conseil_administration_pdf);
      if (data.attestation_conformite_pdf) formData.append("attestation_conformite_pdf", data.attestation_conformite_pdf);

      // 7. PLANS DE LOCALISATION
      if (data.nom_signataire && data.plan_localisation_signataire1_image) formData.append("plan_localisation_signataire1_image", data.plan_localisation_signataire1_image);
      if (data.nom_signataire2 && data.plan_localisation_signataire2_image) formData.append("plan_localisation_signataire2_image", data.plan_localisation_signataire2_image);
      if (data.nom_signataire3 && data.plan_localisation_signataire3_image) formData.append("plan_localisation_signataire3_image", data.plan_localisation_signataire3_image);
      if (data.plan_localisation_siege_image) formData.append("plan_localisation_siege_image", data.plan_localisation_siege_image);

      // 8. FACTURES
      if (data.nom_signataire && data.facture_eau_signataire1_image) formData.append("facture_eau_signataire1_image", data.facture_eau_signataire1_image);
      if (data.nom_signataire2 && data.facture_eau_signataire2_image) formData.append("facture_eau_signataire2_image", data.facture_eau_signataire2_image);
      if (data.nom_signataire3 && data.facture_eau_signataire3_image) formData.append("facture_eau_signataire3_image", data.facture_eau_signataire3_image);
      if (data.nom_signataire && data.facture_electricite_signataire1_image) formData.append("facture_electricite_signataire1_image", data.facture_electricite_signataire1_image);
      if (data.nom_signataire2 && data.facture_electricite_signataire2_image) formData.append("facture_electricite_signataire2_image", data.facture_electricite_signataire2_image);
      if (data.nom_signataire3 && data.facture_electricite_signataire3_image) formData.append("facture_electricite_signataire3_image", data.facture_electricite_signataire3_image);
      if (data.facture_eau_siege_image) formData.append("facture_eau_siege_image", data.facture_eau_siege_image);
      if (data.facture_electricite_siege_image) formData.append("facture_electricite_siege_image", data.facture_electricite_siege_image);

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
                        required
                        control={control} 
                        render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.agency_id} sx={{ minWidth: 200 }} required>
                            <InputLabel>Agence *</InputLabel>
                            <Select {...field} label="Agence *" value={field.value || ""} required>
                              {agencies.map((a) => (
                                <MenuItem key={a.id} value={a.id} required>
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
                                label="Numéro RCCM" 
                                placeholder="Ex: RCCM/CM-CMR/2024/B/00123"
                              />
                            )} 
                          />
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
                        
                        <Grid item xs={12} md={4}>
                          <FileUploadField
                            label="Photocopie NUI (image) *"
                            fieldName="niu_image"
                            preview={niuPreview}
                            setPreview={setNiuPreview}
                            required={true}
                            description="Photocopie du document NUI"
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
                        
                        <Grid item xs={12}>
                          <FileUploadField
                            label="Récépissé de déclaration (image) *"
                            fieldName="recepisse_declaration_association_image"
                            preview={recepissePreview}
                            setPreview={setRecepissePreview}
                            required={true}
                            description="Récépissé de déclaration compétente"
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                )}

                {/* ÉTAPE 3 : GÉRANCE & SIGNATAIRES */}
                {activeStep === 3 && (
                  <Grid container spacing={3}>
                    
                    {/* Afficher uniquement si c'est une entreprise, pas une association */}
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
                            label="CAPITAL (FCFA)" 
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
                        Documents Obligatoires
                      </Typography>
                    </Grid>
                    
                    {/* NUI Champ */}
                    <Grid item xs={12} md={6}>
                      <TextField 
                        fullWidth 
                        size="small" 
                        label="Numéro NUI" 
                        value={watchNui || ""}
                        disabled
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FileUploadField
                        label="Photocopie NUI (image) *"
                        fieldName="niu_image"
                        preview={niuPreview}
                        setPreview={setNiuPreview}
                        required={true}
                        description="Photocopie du document NUI - max 2MB"
                      />
                    </Grid>
                    
                    {/* Photocopie des Statuts - Uniquement pour les entreprises */}
                    {watchTypeEntreprise === "entreprise" && (
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
                    )}
                    
                    {/* Acte de Désignation - Uniquement pour les entreprises */}
                    {watchTypeEntreprise === "entreprise" && (
                      <Grid item xs={12} md={6}>
                        <PDFUploadField
                          label="Acte de Désignation des Signataires (PDF) *"
                          fieldName="acte_designation_signataires_pdf"
                          required={true}
                          description="Document PDF - max 5MB"
                        />
                      </Grid>
                    )}
                    
                    {/* Attestation de conformité - Pour tous */}
                    <Grid item xs={12} md={watchTypeEntreprise === "entreprise" ? 6 : 12}>
                      <PDFUploadField
                        label="Attestation de Conformité (PDF) *"
                        fieldName="attestation_conformite_pdf"
                        required={true}
                        description="Document PDF attestant de la conformité - max 5MB"
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
                    
                    {/* Photos des Gérants - Uniquement pour les entreprises */}
                    {watchTypeEntreprise === "entreprise" && (
                      <>
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
                                  Photo Gérant Principal *
                                </Typography>
                                <Controller 
                                  name="photo_gerant" 
                                  control={control} 
                                  rules={{ required: "Photo du gérant principal obligatoire" }}
                                  render={({ field }) => (
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleGerantPhotoChange(0, e)}
                                      style={{ width: '100%' }}
                                      ref={(el) => {
                                        fileInputsRef.current['photo_gerant'] = el;
                                        field.ref(el);
                                      }}
                                    />
                                  )} 
                                />
                                {errors.photo_gerant && (
                                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                    {errors.photo_gerant?.message}
                                  </Typography>
                                )}
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
                                  Photo Gérant Secondaire {watchNomGerant2 && "*"}
                                </Typography>
                                <Controller 
                                  name="photo_gerant2" 
                                  control={control} 
                                  rules={{ required: watchNomGerant2 ? "Photo du gérant secondaire obligatoire" : false }}
                                  render={({ field }) => (
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleGerantPhotoChange(1, e)}
                                      style={{ width: '100%' }}
                                      disabled={!watchNomGerant2}
                                      ref={(el) => {
                                        fileInputsRef.current['photo_gerant2'] = el;
                                        field.ref(el);
                                      }}
                                    />
                                  )} 
                                />
                                {errors.photo_gerant2 && (
                                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                    {errors.photo_gerant2?.message}
                                  </Typography>
                                )}
                                {!watchNomGerant2 && (
                                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                                    (Renseignez le nom du gérant secondaire à l'étape précédente)
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          </Box>
                        </Grid>
                      </>
                    )}
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                        Photos et Signatures des Signataires
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Les documents ne sont requis que pour les signataires renseignés
                      </Typography>
                    </Grid>
                    
                    {/* Signataire 1 */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa', 
                        opacity: signatairesRemplis[0] ? 1 : 0.6 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                          Signataire 1 {signatairesRemplis[0] && "*"}
                        </Typography>
                        {!signatairesRemplis[0] && (
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                            (Non renseigné à l'étape précédente)
                          </Typography>
                        )}
                        <Stack spacing={2}>
                          <Controller 
                            name="photo_signataire" 
                            control={control} 
                            rules={{ required: signatairesRemplis[0] ? "Photo du signataire 1 obligatoire" : false }}
                            render={({ field }) => (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSignatairePhotoChange(0, e)}
                                placeholder="Photo"
                                style={{ width: '100%' }}
                                disabled={!signatairesRemplis[0]}
                                ref={(el) => {
                                  fileInputsRef.current['photo_signataire'] = el;
                                  field.ref(el);
                                }}
                              />
                            )} 
                          />
                          <Controller 
                            name="signature_signataire" 
                            control={control} 
                            rules={{ required: signatairesRemplis[0] ? "Signature du signataire 1 obligatoire" : false }}
                            render={({ field }) => (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSignatureChange(0, e)}
                                placeholder="Signature"
                                style={{ width: '100%' }}
                                disabled={!signatairesRemplis[0]}
                                ref={(el) => {
                                  fileInputsRef.current['signature_signataire'] = el;
                                  field.ref(el);
                                }}
                              />
                            )} 
                          />
                        </Stack>
                        {errors.photo_signataire && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                            {errors.photo_signataire?.message}
                          </Typography>
                        )}
                        {errors.signature_signataire && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                            {errors.signature_signataire?.message}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    
                    {/* Signataire 2 */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa',
                        opacity: signatairesRemplis[1] ? 1 : 0.6 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                          Signataire 2 {signatairesRemplis[1] && "*"}
                        </Typography>
                        {!signatairesRemplis[1] && (
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                            (Non renseigné à l'étape précédente)
                          </Typography>
                        )}
                        <Stack spacing={2}>
                          <Controller 
                            name="photo_signataire2" 
                            control={control} 
                            rules={{ required: signatairesRemplis[1] ? "Photo du signataire 2 obligatoire" : false }}
                            render={({ field }) => (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSignatairePhotoChange(1, e)}
                                placeholder="Photo"
                                style={{ width: '100%' }}
                                disabled={!signatairesRemplis[1]}
                                ref={(el) => {
                                  fileInputsRef.current['photo_signataire2'] = el;
                                  field.ref(el);
                                }}
                              />
                            )} 
                          />
                          <Controller 
                            name="signature_signataire2" 
                            control={control} 
                            rules={{ required: signatairesRemplis[1] ? "Signature du signataire 2 obligatoire" : false }}
                            render={({ field }) => (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSignatureChange(1, e)}
                                placeholder="Signature"
                                style={{ width: '100%' }}
                                disabled={!signatairesRemplis[1]}
                                ref={(el) => {
                                  fileInputsRef.current['signature_signataire2'] = el;
                                  field.ref(el);
                                }}
                              />
                            )} 
                          />
                        </Stack>
                        {errors.photo_signataire2 && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                            {errors.photo_signataire2?.message}
                          </Typography>
                        )}
                        {errors.signature_signataire2 && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                            {errors.signature_signataire2?.message}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    
                    {/* Signataire 3 */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa',
                        opacity: signatairesRemplis[2] ? 1 : 0.6 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                          Signataire 3 {signatairesRemplis[2] && "*"}
                        </Typography>
                        {!signatairesRemplis[2] && (
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                            (Non renseigné à l'étape précédente)
                          </Typography>
                        )}
                        <Stack spacing={2}>
                          <Controller 
                            name="photo_signataire3" 
                            control={control} 
                            rules={{ required: signatairesRemplis[2] ? "Photo du signataire 3 obligatoire" : false }}
                            render={({ field }) => (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSignatairePhotoChange(2, e)}
                                placeholder="Photo"
                                style={{ width: '100%' }}
                                disabled={!signatairesRemplis[2]}
                                ref={(el) => {
                                  fileInputsRef.current['photo_signataire3'] = el;
                                  field.ref(el);
                                }}
                              />
                            )} 
                          />
                          <Controller 
                            name="signature_signataire3" 
                            control={control} 
                            rules={{ required: signatairesRemplis[2] ? "Signature du signataire 3 obligatoire" : false }}
                            render={({ field }) => (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSignatureChange(2, e)}
                                placeholder="Signature"
                                style={{ width: '100%' }}
                                disabled={!signatairesRemplis[2]}
                                ref={(el) => {
                                  fileInputsRef.current['signature_signataire3'] = el;
                                  field.ref(el);
                                }}
                              />
                            )} 
                          />
                        </Stack>
                        {errors.photo_signataire3 && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                            {errors.photo_signataire3?.message}
                          </Typography>
                        )}
                        {errors.signature_signataire3 && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                            {errors.signature_signataire3?.message}
                          </Typography>
                        )}
                      </Box>
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
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                        Plans de Localisation des Signataires
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Requis seulement pour les signataires renseignés
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Plan localisation Signataire 1"
                        fieldName="plan_localisation_signataire1_image"
                        preview={planSignatairePreviews[0]}
                        setPreview={(url) => {
                          const newPreviews = [...planSignatairePreviews];
                          newPreviews[0] = url;
                          setPlanSignatairePreviews(newPreviews);
                        }}
                        required={signatairesRemplis[0]}
                        disabled={!signatairesRemplis[0]}
                        description={signatairesRemplis[0] ? "Plan de localisation du domicile" : "Non requis"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Plan localisation Signataire 2"
                        fieldName="plan_localisation_signataire2_image"
                        preview={planSignatairePreviews[1]}
                        setPreview={(url) => {
                          const newPreviews = [...planSignatairePreviews];
                          newPreviews[1] = url;
                          setPlanSignatairePreviews(newPreviews);
                        }}
                        required={signatairesRemplis[1]}
                        disabled={!signatairesRemplis[1]}
                        description={signatairesRemplis[1] ? "Plan de localisation du domicile" : "Non requis"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Plan localisation Signataire 3"
                        fieldName="plan_localisation_signataire3_image"
                        preview={planSignatairePreviews[2]}
                        setPreview={(url) => {
                          const newPreviews = [...planSignatairePreviews];
                          newPreviews[2] = url;
                          setPlanSignatairePreviews(newPreviews);
                        }}
                        required={signatairesRemplis[2]}
                        disabled={!signatairesRemplis[2]}
                        description={signatairesRemplis[2] ? "Plan de localisation du domicile" : "Non requis"}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                        Factures des Signataires
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Requises seulement pour les signataires renseignés
                      </Typography>
                    </Grid>
                    
                    {/* Factures Eau Signataires */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                        Factures d'eau
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Facture eau Signataire 1"
                        fieldName="facture_eau_signataire1_image"
                        preview={factureEauSignatairePreviews[0]}
                        setPreview={(url) => {
                          const newPreviews = [...factureEauSignatairePreviews];
                          newPreviews[0] = url;
                          setFactureEauSignatairePreviews(newPreviews);
                        }}
                        required={signatairesRemplis[0]}
                        disabled={!signatairesRemplis[0]}
                        description={signatairesRemplis[0] ? "Photocopie facture d'eau" : "Non requis"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Facture eau Signataire 2"
                        fieldName="facture_eau_signataire2_image"
                        preview={factureEauSignatairePreviews[1]}
                        setPreview={(url) => {
                          const newPreviews = [...factureEauSignatairePreviews];
                          newPreviews[1] = url;
                          setFactureEauSignatairePreviews(newPreviews);
                        }}
                        required={signatairesRemplis[1]}
                        disabled={!signatairesRemplis[1]}
                        description={signatairesRemplis[1] ? "Photocopie facture d'eau" : "Non requis"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Facture eau Signataire 3"
                        fieldName="facture_eau_signataire3_image"
                        preview={factureEauSignatairePreviews[2]}
                        setPreview={(url) => {
                          const newPreviews = [...factureEauSignatairePreviews];
                          newPreviews[2] = url;
                          setFactureEauSignatairePreviews(newPreviews);
                        }}
                        required={signatairesRemplis[2]}
                        disabled={!signatairesRemplis[2]}
                        description={signatairesRemplis[2] ? "Photocopie facture d'eau" : "Non requis"}
                      />
                    </Grid>
                    
                    {/* Factures Electricité Signataires */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, mt: 2 }}>
                        Factures d'électricité
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Facture électricité Signataire 1"
                        fieldName="facture_electricite_signataire1_image"
                        preview={factureElecSignatairePreviews[0]}
                        setPreview={(url) => {
                          const newPreviews = [...factureElecSignatairePreviews];
                          newPreviews[0] = url;
                          setFactureElecSignatairePreviews(newPreviews);
                        }}
                        required={signatairesRemplis[0]}
                        disabled={!signatairesRemplis[0]}
                        description={signatairesRemplis[0] ? "Photocopie facture d'électricité" : "Non requis"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Facture électricité Signataire 2"
                        fieldName="facture_electricite_signataire2_image"
                        preview={factureElecSignatairePreviews[1]}
                        setPreview={(url) => {
                          const newPreviews = [...factureElecSignatairePreviews];
                          newPreviews[1] = url;
                          setFactureElecSignatairePreviews(newPreviews);
                        }}
                        required={signatairesRemplis[1]}
                        disabled={!signatairesRemplis[1]}
                        description={signatairesRemplis[1] ? "Photocopie facture d'électricité" : "Non requis"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FileUploadField
                        label="Facture électricité Signataire 3"
                        fieldName="facture_electricite_signataire3_image"
                        preview={factureElecSignatairePreviews[2]}
                        setPreview={(url) => {
                          const newPreviews = [...factureElecSignatairePreviews];
                          newPreviews[2] = url;
                          setFactureElecSignatairePreviews(newPreviews);
                        }}
                        required={signatairesRemplis[2]}
                        disabled={!signatairesRemplis[2]}
                        description={signatairesRemplis[2] ? "Photocopie facture d'électricité" : "Non requis"}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 4 }}>
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
                    onClick={handleSubmit(onSubmit)}
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