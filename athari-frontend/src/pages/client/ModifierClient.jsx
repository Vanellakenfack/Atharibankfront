import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Grid, TextField, Button, 
    Divider, CircularProgress, Card, CardContent, 
    MenuItem, Avatar, IconButton, Badge, Alert, 
    Snackbar, Stack, Tabs, Tab, FormControl, InputLabel,
    Select, FormHelperText
} from '@mui/material';
import { 
    Save as SaveIcon, 
    ArrowBack as ArrowBackIcon, 
    PhotoCamera as PhotoCameraIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    Upload as UploadIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import apiClient from '../../services/api/ApiClient';
import Layout from '../../components/layout/Layout';

export default function ModifierClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Références pour les fichiers
    const photoRef = useRef(null);
    const signatureRef = useRef(null);
    const domicilePhotoRef = useRef(null);
    const activitePhotoRef = useRef(null);
    const cniRectoRef = useRef(null);
    const cniVersoRef = useRef(null);
    const nuiImageRef = useRef(null);
    const attestationConformitePdfRef = useRef(null);
    const demandeOuverturePdfRef = useRef(null);
    const formulaireOuverturePdfRef = useRef(null);
    const listeMembresPdfRef = useRef(null);
    
    // Références pour client moral
    const gerantPhotoRefs = [useRef(null), useRef(null)];
    const signatairePhotoRefs = [useRef(null), useRef(null), useRef(null)];
    const signatureSignataireRefs = [useRef(null), useRef(null), useRef(null)];
    const extraitRccmRef = useRef(null);
    const titrePatenteRef = useRef(null);
    const niuImageMoraleRef = useRef(null);
    const statutsRef = useRef(null);
    const pvAgcRef = useRef(null);
    const attestationRef = useRef(null);
    const procesVerbalRef = useRef(null);
    const registreCoopRef = useRef(null);
    const recepisseRef = useRef(null);
    const acteDesignationPdfRef = useRef(null);
    const listeConseilPdfRef = useRef(null);
    const planSiegeRef = useRef(null);
    const factureEauSiegeRef = useRef(null);
    const factureElecSiegeRef = useRef(null);
    const planSignataireRefs = [useRef(null), useRef(null), useRef(null)];
    const factureEauSignataireRefs = [useRef(null), useRef(null), useRef(null)];
    const factureElecSignataireRefs = [useRef(null), useRef(null), useRef(null)];
    
    // Références pour fichiers signataires
    const cniRectoSignataireRefs = [useRef(null), useRef(null), useRef(null)];
    const cniVersoSignataireRefs = [useRef(null), useRef(null), useRef(null)];
    const nuiImageSignataireRefs = [useRef(null), useRef(null), useRef(null)];
    const lieuDitDomicilePhotoRefs = [useRef(null), useRef(null), useRef(null)];
    const photoLocalisationDomicileRefs = [useRef(null), useRef(null), useRef(null)];
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [activeTab, setActiveTab] = useState(0);
    const [activeSignataireTab, setActiveSignataireTab] = useState(0);
    
    // Prévisualisations
    const [photoPreview, setPhotoPreview] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState(null);
    const [domicilePreview, setDomicilePreview] = useState(null);
    const [activitePreview, setActivitePreview] = useState(null);
    const [cniRectoPreview, setCniRectoPreview] = useState(null);
    const [cniVersoPreview, setCniVersoPreview] = useState(null);
    const [nuiImagePreview, setNuiImagePreview] = useState(null);
    const [demandeOuverturePdfName, setDemandeOuverturePdfName] = useState('');
    const [formulaireOuverturePdfName, setFormulaireOuverturePdfName] = useState('');
    const [listeMembresPdfName, setListeMembresPdfName] = useState('');
    const [attestationConformitePdfName, setAttestationConformitePdfName] = useState('');
    
    // Prévisualisations client moral
    const [gerantPreviews, setGerantPreviews] = useState([null, null]);
    const [signatairePreviews, setSignatairePreviews] = useState([null, null, null]);
    const [signatureSignatairePreviews, setSignatureSignatairePreviews] = useState([null, null, null]);
    const [cniRectoSignatairePreviews, setCniRectoSignatairePreviews] = useState([null, null, null]);
    const [cniVersoSignatairePreviews, setCniVersoSignatairePreviews] = useState([null, null, null]);
    const [nuiImageSignatairePreviews, setNuiImageSignatairePreviews] = useState([null, null, null]);
    const [lieuDitDomicilePhotoPreviews, setLieuDitDomicilePhotoPreviews] = useState([null, null, null]);
    const [photoLocalisationDomicilePreviews, setPhotoLocalisationDomicilePreviews] = useState([null, null, null]);
    const [extraitRccmPreview, setExtraitRccmPreview] = useState(null);
    const [titrePatentePreview, setTitrePatentePreview] = useState(null);
    const [niuImageMoralePreview, setNiuImageMoralePreview] = useState(null);
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
    
    const [formDataState, setFormDataState] = useState({
        // Champs communs
        telephone: '',
        email: '',
        adresse_ville: '',
        adresse_quartier: '',
        lieu_dit_domicile: '',
        lieu_dit_activite: '',
        ville_activite: '',
        quartier_activite: '',
        bp: '',
        pays_residence: 'Cameroun',
        solde_initial: 0,
        immobiliere: '',
        autres_biens: '',
        type_client: '',
        num_client: '',
        
        // Fichiers communs
        photo: null,
        signature: null,
        photo_localisation_domicile: null,
        photo_localisation_activite: null,
        cni_recto: null,
        cni_verso: null,
        niu_image: null,
        liste_membres_pdf: null,
        attestation_conformite_pdf: null,
        
        // Client physique
        physique: {
            nom_prenoms: '',
            sexe: '',
            date_naissance: '',
            lieu_naissance: '',
            nationalite: 'Camerounaise',
            nui: '',
            cni_numero: '',
            cni_delivrance: '',
            cni_expiration: '',
            nom_pere: '',
            nom_mere: '',
            nationalite_pere: '',
            nationalite_mere: '',
            profession: '',
            employeur: '',
            situation_familiale: '',
            regime_matrimonial: '',
            nom_conjoint: '',
            date_naissance_conjoint: '',
            cni_conjoint: '',
            profession_conjoint: '',
            salaire: '',
            tel_conjoint: '',
        },
        
        // Client moral
        morale: {
            raison_sociale: '',
            sigle: '',
            forme_juridique: '',
            type_entreprise: 'entreprise',
            rccm: '',
            nui: '',
            nom_gerant: '',
            telephone_gerant: '',
            nom_gerant2: '',
            telephone_gerant2: '',
        },
        
        // Signataires (champs dynamiques)
        signataires: [
            {
                numero_signataire: 1,
                nom: '',
                sexe: '',
                ville: '',
                quartier: '',
                lieu_domicile: '',
                lieu_dit_domicile: '',
                telephone: '',
                email: '',
                cni: '',
                nui: '',
            },
            {
                numero_signataire: 2,
                nom: '',
                sexe: '',
                ville: '',
                quartier: '',
                lieu_domicile: '',
                lieu_dit_domicile: '',
                telephone: '',
                email: '',
                cni: '',
                nui: '',
            },
            {
                numero_signataire: 3,
                nom: '',
                sexe: '',
                ville: '',
                quartier: '',
                lieu_domicile: '',
                lieu_dit_domicile: '',
                telephone: '',
                email: '',
                cni: '',
                nui: '',
            }
        ],
        
        // Fichiers client moral
        photo_gerant: null,
        photo_gerant2: null,
        extrait_rccm_image: null,
        titre_patente_image: null,
        niu_image_morale: null,
        statuts_image: null,
        pv_agc_image: null,
        attestation_non_redevance_image: null,
        proces_verbal_image: null,
        registre_coop_gic_image: null,
        recepisse_declaration_association_image: null,
        acte_designation_signataires_pdf: null,
        liste_conseil_administration_pdf: null,
        plan_localisation_siege_image: null,
        facture_eau_siege_image: null,
        facture_electricite_siege_image: null,
        plan_localisation_signataire1_image: null,
        plan_localisation_signataire2_image: null,
        plan_localisation_signataire3_image: null,
        facture_eau_signataire1_image: null,
        facture_eau_signataire2_image: null,
        facture_eau_signataire3_image: null,
        facture_electricite_signataire1_image: null,
        facture_electricite_signataire2_image: null,
        facture_electricite_signataire3_image: null,
    });

    useEffect(() => {
        const fetchClient = async () => {
            try {
                const response = await apiClient.get(`/clients/${id}`);
                const data = response.data.data;
                
                const formatDate = (dateString) => {
                    if (!dateString) return '';
                    const date = new Date(dateString);
                    return date.toISOString().split('T')[0];
                };

                const getFullUrl = (path) => {
                    if (!path) return null;
                    if (path.startsWith('http')) return path;
                    if (path.startsWith('/storage/')) return `http://localhost:8000${path}`;
                    return `http://localhost:8000/storage/${path}`;
                };

                // Préparer les données des signataires
                const signatairesData = [
                    {
                        numero_signataire: 1,
                        nom: '',
                        sexe: '',
                        ville: '',
                        quartier: '',
                        lieu_domicile: '',
                        lieu_dit_domicile: '',
                        telephone: '',
                        email: '',
                        cni: '',
                        nui: '',
                    },
                    {
                        numero_signataire: 2,
                        nom: '',
                        sexe: '',
                        ville: '',
                        quartier: '',
                        lieu_domicile: '',
                        lieu_dit_domicile: '',
                        telephone: '',
                        email: '',
                        cni: '',
                        nui: '',
                    },
                    {
                        numero_signataire: 3,
                        nom: '',
                        sexe: '',
                        ville: '',
                        quartier: '',
                        lieu_domicile: '',
                        lieu_dit_domicile: '',
                        telephone: '',
                        email: '',
                        cni: '',
                        nui: '',
                    }
                ];

                // Charger les données des signataires si disponibles
                if (data.type_client === 'morale' && data.morale && data.morale.signataires) {
                    data.morale.signataires.forEach(signataire => {
                        const index = signataire.numero_signataire - 1;
                        if (index >= 0 && index < 3) {
                            signatairesData[index] = {
                                ...signatairesData[index],
                                ...signataire
                            };
                        }
                    });
                }

                const initialData = {
                    ...data,
                    solde_initial: parseFloat(data.solde_initial) || 0,
                    physique: {
                        nom_prenoms: '',
                        sexe: '',
                        date_naissance: '',
                        lieu_naissance: '',
                        nationalite: 'Camerounaise',
                        nui: '',
                        cni_numero: '',
                        cni_delivrance: '',
                        cni_expiration: '',
                        nom_pere: '',
                        nom_mere: '',
                        nationalite_pere: '',
                        nationalite_mere: '',
                        profession: '',
                        employeur: '',
                        situation_familiale: '',
                        regime_matrimonial: '',
                        nom_conjoint: '',
                        date_naissance_conjoint: '',
                        cni_conjoint: '',
                        profession_conjoint: '',
                        salaire: '',
                        tel_conjoint: '',
                        ...data.physique,
                        date_naissance: formatDate(data.physique?.date_naissance),
                        cni_delivrance: formatDate(data.physique?.cni_delivrance),
                        cni_expiration: formatDate(data.physique?.cni_expiration),
                        date_naissance_conjoint: formatDate(data.physique?.date_naissance_conjoint)
                    },
                    morale: {
                        raison_sociale: '',
                        sigle: '',
                        forme_juridique: '',
                        type_entreprise: 'entreprise',
                        rccm: '',
                        nui: '',
                        nom_gerant: '',
                        telephone_gerant: '',
                        nom_gerant2: '',
                        telephone_gerant2: '',
                        ...data.morale
                    },
                    signataires: signatairesData
                };
                
                setFormDataState(initialData);
                
                // Définir les prévisualisations d'images
                if (data.type_client === 'physique' && data.physique) {
                    if (data.physique.photo_url) setPhotoPreview(getFullUrl(data.physique.photo_url));
                    if (data.physique.signature_url) setSignaturePreview(getFullUrl(data.physique.signature_url));
                    if (data.physique.cni_recto_url) setCniRectoPreview(getFullUrl(data.physique.cni_recto_url));
                    if (data.physique.cni_verso_url) setCniVersoPreview(getFullUrl(data.physique.cni_verso_url));
                    if (data.physique.niu_image_url) setNuiImagePreview(getFullUrl(data.physique.niu_image_url));
                    if (data.physique.attestation_conformite_pdf_url) setAttestationConformitePdfName('Attestation conformité.pdf');
                }
                
                if (data.type_client === 'morale' && data.morale) {
                    // Photos gérants
                    if (data.morale.photo_gerant_url) setGerantPreviews([getFullUrl(data.morale.photo_gerant_url), null]);
                    if (data.morale.photo_gerant2_url) setGerantPreviews(prev => [prev[0], getFullUrl(data.morale.photo_gerant2_url)]);
                    
                    // Photos signataires
                    const signatairePreviewsTemp = [null, null, null];
                    const signaturePreviewsTemp = [null, null, null];
                    const cniRectoSignatairePreviewsTemp = [null, null, null];
                    const cniVersoSignatairePreviewsTemp = [null, null, null];
                    const nuiImageSignatairePreviewsTemp = [null, null, null];
                    const lieuDitDomicilePhotoPreviewsTemp = [null, null, null];
                    const photoLocalisationDomicilePreviewsTemp = [null, null, null];
                    
                    if (data.morale.signataires) {
                        data.morale.signataires.forEach((signataire, index) => {
                            if (signataire.photo_url) signatairePreviewsTemp[index] = getFullUrl(signataire.photo_url);
                            if (signataire.signature_url) signaturePreviewsTemp[index] = getFullUrl(signataire.signature_url);
                            if (signataire.cni_photo_recto_url) cniRectoSignatairePreviewsTemp[index] = getFullUrl(signataire.cni_photo_recto_url);
                            if (signataire.cni_photo_verso_url) cniVersoSignatairePreviewsTemp[index] = getFullUrl(signataire.cni_photo_verso_url);
                            if (signataire.nui_image_url) nuiImageSignatairePreviewsTemp[index] = getFullUrl(signataire.nui_image_url);
                            if (signataire.lieu_dit_domicile_photo_url) lieuDitDomicilePhotoPreviewsTemp[index] = getFullUrl(signataire.lieu_dit_domicile_photo_url);
                            if (signataire.photo_localisation_domicile_url) photoLocalisationDomicilePreviewsTemp[index] = getFullUrl(signataire.photo_localisation_domicile_url);
                        });
                    }
                    
                    setSignatairePreviews(signatairePreviewsTemp);
                    setSignatureSignatairePreviews(signaturePreviewsTemp);
                    setCniRectoSignatairePreviews(cniRectoSignatairePreviewsTemp);
                    setCniVersoSignatairePreviews(cniVersoSignatairePreviewsTemp);
                    setNuiImageSignatairePreviews(nuiImageSignatairePreviewsTemp);
                    setLieuDitDomicilePhotoPreviews(lieuDitDomicilePhotoPreviewsTemp);
                    setPhotoLocalisationDomicilePreviews(photoLocalisationDomicilePreviewsTemp);
                    
                    // Documents juridiques
                    if (data.morale.extrait_rccm_image_url) setExtraitRccmPreview(getFullUrl(data.morale.extrait_rccm_image_url));
                    if (data.morale.titre_patente_image_url) setTitrePatentePreview(getFullUrl(data.morale.titre_patente_image_url));
                    if (data.morale.niu_image_url) setNiuImageMoralePreview(getFullUrl(data.morale.niu_image_url));
                    if (data.morale.statuts_image_url) setStatutsPreview(getFullUrl(data.morale.statuts_image_url));
                    if (data.morale.pv_agc_image_url) setPvAgcPreview(getFullUrl(data.morale.pv_agc_image_url));
                    if (data.morale.attestation_non_redevance_image_url) setAttestationPreview(getFullUrl(data.morale.attestation_non_redevance_image_url));
                    if (data.morale.proces_verbal_image_url) setProcesVerbalPreview(getFullUrl(data.morale.proces_verbal_image_url));
                    if (data.morale.registre_coop_gic_image_url) setRegistreCoopPreview(getFullUrl(data.morale.registre_coop_gic_image_url));
                    if (data.morale.recepisse_declaration_association_image_url) setRecepissePreview(getFullUrl(data.morale.recepisse_declaration_association_image_url));
                    
                    // Plans et factures siège
                    if (data.morale.plan_localisation_siege_image_url) setPlanSiegePreview(getFullUrl(data.morale.plan_localisation_siege_image_url));
                    if (data.morale.facture_eau_siege_image_url) setFactureEauSiegePreview(getFullUrl(data.morale.facture_eau_siege_image_url));
                    if (data.morale.facture_electricite_siege_image_url) setFactureElecSiegePreview(getFullUrl(data.morale.facture_electricite_siege_image_url));
                    
                    // Plans signataires
                    const planSignatairePreviewsTemp = [null, null, null];
                    if (data.morale.plan_localisation_signataire1_image_url) planSignatairePreviewsTemp[0] = getFullUrl(data.morale.plan_localisation_signataire1_image_url);
                    if (data.morale.plan_localisation_signataire2_image_url) planSignatairePreviewsTemp[1] = getFullUrl(data.morale.plan_localisation_signataire2_image_url);
                    if (data.morale.plan_localisation_signataire3_image_url) planSignatairePreviewsTemp[2] = getFullUrl(data.morale.plan_localisation_signataire3_image_url);
                    setPlanSignatairePreviews(planSignatairePreviewsTemp);
                    
                    // Factures signataires
                    const factureEauPreviewsTemp = [null, null, null];
                    if (data.morale.facture_eau_signataire1_image_url) factureEauPreviewsTemp[0] = getFullUrl(data.morale.facture_eau_signataire1_image_url);
                    if (data.morale.facture_eau_signataire2_image_url) factureEauPreviewsTemp[1] = getFullUrl(data.morale.facture_eau_signataire2_image_url);
                    if (data.morale.facture_eau_signataire3_image_url) factureEauPreviewsTemp[2] = getFullUrl(data.morale.facture_eau_signataire3_image_url);
                    setFactureEauSignatairePreviews(factureEauPreviewsTemp);
                    
                    const factureElecPreviewsTemp = [null, null, null];
                    if (data.morale.facture_electricite_signataire1_image_url) factureElecPreviewsTemp[0] = getFullUrl(data.morale.facture_electricite_signataire1_image_url);
                    if (data.morale.facture_electricite_signataire2_image_url) factureElecPreviewsTemp[1] = getFullUrl(data.morale.facture_electricite_signataire2_image_url);
                    if (data.morale.facture_electricite_signataire3_image_url) factureElecPreviewsTemp[2] = getFullUrl(data.morale.facture_electricite_signataire3_image_url);
                    setFactureElecSignatairePreviews(factureElecPreviewsTemp);
                    
                    // PDFs
                    if (data.morale.liste_membres_pdf_url) setListeMembresPdfName('Liste membres.pdf');
                    if (data.morale.attestation_conformite_pdf_url) setAttestationConformitePdfName('Attestation conformité.pdf');
                }
                
                // Photos de localisation (communes)
                if (data.photo_localisation_domicile_url) setDomicilePreview(getFullUrl(data.photo_localisation_domicile_url));
                if (data.photo_localisation_activite_url) setActivitePreview(getFullUrl(data.photo_localisation_activite_url));
                
                // PDFs communs
                if (data.liste_membres_pdf_url) setListeMembresPdfName('Liste membres.pdf');
                
            } catch (error) { 
                console.error("Erreur lors de la récupération:", error);
                showSnackbar('Erreur lors du chargement des données', 'error');
            } finally { 
                setLoading(false); 
            }
        };
        fetchClient();
    }, [id]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const formatErrorMessage = (errorData) => {
        if (!errorData) return "Une erreur est survenue lors de la mise à jour";
        
        if (typeof errorData === 'string') {
            return errorData;
        }
        
        if (errorData.errors) {
            const errorMessages = Object.values(errorData.errors).flat();
            if (errorMessages.length > 0) {
                const translatedErrors = errorMessages.map(msg => {
                    if (msg.includes('already been taken')) {
                        if (msg.includes('cni_numero')) return "Ce numéro de CNI existe déjà";
                        if (msg.includes('rccm')) return "Ce numéro RCCM existe déjà";
                        if (msg.includes('nom_prenoms')) return "Un client avec ce nom existe déjà";
                        if (msg.includes('raison_sociale')) return "Une entreprise avec cette raison sociale existe déjà";
                    }
                    if (msg.includes('must be an image')) return "Le fichier doit être une image";
                    if (msg.includes('max:2048')) return "L'image ne doit pas dépasser 2MB";
                    if (msg.includes('mimes:pdf')) return "Le fichier doit être un PDF";
                    return msg;
                });
                return translatedErrors.join(', ');
            }
        }
        
        if (errorData.message) {
            if (errorData.message.includes('already exists')) {
                return "Cet enregistrement existe déjà dans la base de données";
            }
            return errorData.message;
        }
        
        return "Une erreur est survenue lors de la mise à jour";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormDataState(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNestedChange = (type, e) => {
        const { name, value } = e.target;
        setFormDataState(prev => ({
            ...prev,
            [type]: { 
                ...prev[type], 
                [name]: value 
            }
        }));
    };

    const handleSignataireChange = (index, e) => {
        const { name, value } = e.target;
        setFormDataState(prev => {
            const newSignataires = [...prev.signataires];
            newSignataires[index] = {
                ...newSignataires[index],
                [name]: value
            };
            return {
                ...prev,
                signataires: newSignataires
            };
        });
    };

    const handleFileChange = (field, e) => {
        const file = e.target.files[0];
        if (file) {
            setFormDataState(prev => ({
                ...prev,
                [field]: file
            }));
            
            // Mettre à jour le nom du fichier pour les PDFs
            if (field === 'liste_membres_pdf') {
                setListeMembresPdfName(file.name);
            } else if (field === 'attestation_conformite_pdf') {
                setAttestationConformitePdfName(file.name);
            }
            
            const previewUrl = URL.createObjectURL(file);
            switch(field) {
                case 'photo':
                    setPhotoPreview(previewUrl);
                    break;
                case 'signature':
                    setSignaturePreview(previewUrl);
                    break;
                case 'photo_localisation_domicile':
                    setDomicilePreview(previewUrl);
                    break;
                case 'photo_localisation_activite':
                    setActivitePreview(previewUrl);
                    break;
                case 'cni_recto':
                    setCniRectoPreview(previewUrl);
                    break;
                case 'cni_verso':
                    setCniVersoPreview(previewUrl);
                    break;
                case 'niu_image':
                    setNuiImagePreview(previewUrl);
                    break;
                case 'extrait_rccm_image':
                    setExtraitRccmPreview(previewUrl);
                    break;
                case 'titre_patente_image':
                    setTitrePatentePreview(previewUrl);
                    break;
                case 'niu_image_morale':
                    setNiuImageMoralePreview(previewUrl);
                    break;
                case 'statuts_image':
                    setStatutsPreview(previewUrl);
                    break;
                case 'pv_agc_image':
                    setPvAgcPreview(previewUrl);
                    break;
                case 'attestation_non_redevance_image':
                    setAttestationPreview(previewUrl);
                    break;
                case 'proces_verbal_image':
                    setProcesVerbalPreview(previewUrl);
                    break;
                case 'registre_coop_gic_image':
                    setRegistreCoopPreview(previewUrl);
                    break;
                case 'recepisse_declaration_association_image':
                    setRecepissePreview(previewUrl);
                    break;
                case 'plan_localisation_siege_image':
                    setPlanSiegePreview(previewUrl);
                    break;
                case 'facture_eau_siege_image':
                    setFactureEauSiegePreview(previewUrl);
                    break;
                case 'facture_electricite_siege_image':
                    setFactureElecSiegePreview(previewUrl);
                    break;
            }
        }
    };

    const handleGerantPhotoChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const field = index === 0 ? 'photo_gerant' : 'photo_gerant2';
            setFormDataState(prev => ({
                ...prev,
                [field]: file
            }));
            
            const newPreviews = [...gerantPreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setGerantPreviews(newPreviews);
        }
    };

    const handleSignatairePhotoChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const field = index === 0 ? 'photo_signataire' : index === 1 ? 'photo_signataire2' : 'photo_signataire3';
            setFormDataState(prev => ({
                ...prev,
                [field]: file
            }));
            
            const newPreviews = [...signatairePreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setSignatairePreviews(newPreviews);
        }
    };

    const handleSignatureSignataireChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const field = index === 0 ? 'signature_signataire' : index === 1 ? 'signature_signataire2' : 'signature_signataire3';
            setFormDataState(prev => ({
                ...prev,
                [field]: file
            }));
            
            const newPreviews = [...signatureSignatairePreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setSignatureSignatairePreviews(newPreviews);
        }
    };

    const handleCniRectoSignataireChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const field = index === 0 ? 'cni_photo_recto_signataire' : 
                         index === 1 ? 'cni_photo_recto_signataire2' : 
                         'cni_photo_recto_signataire3';
            setFormDataState(prev => ({
                ...prev,
                [field]: file
            }));
            
            const newPreviews = [...cniRectoSignatairePreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setCniRectoSignatairePreviews(newPreviews);
        }
    };

    const handleCniVersoSignataireChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const field = index === 0 ? 'cni_photo_verso_signataire' : 
                         index === 1 ? 'cni_photo_verso_signataire2' : 
                         'cni_photo_verso_signataire3';
            setFormDataState(prev => ({
                ...prev,
                [field]: file
            }));
            
            const newPreviews = [...cniVersoSignatairePreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setCniVersoSignatairePreviews(newPreviews);
        }
    };

    const handleNuiImageSignataireChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const field = index === 0 ? 'nui_image_signataire' : 
                         index === 1 ? 'nui_image_signataire2' : 
                         'nui_image_signataire3';
            setFormDataState(prev => ({
                ...prev,
                [field]: file
            }));
            
            const newPreviews = [...nuiImageSignatairePreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setNuiImageSignatairePreviews(newPreviews);
        }
    };

    const handleLieuDitDomicilePhotoChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const field = index === 0 ? 'lieu_dit_domicile_photo_signataire' : 
                         index === 1 ? 'lieu_dit_domicile_photo_signataire2' : 
                         'lieu_dit_domicile_photo_signataire3';
            setFormDataState(prev => ({
                ...prev,
                [field]: file
            }));
            
            const newPreviews = [...lieuDitDomicilePhotoPreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setLieuDitDomicilePhotoPreviews(newPreviews);
        }
    };

    const handlePhotoLocalisationDomicileChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const field = index === 0 ? 'photo_localisation_domicile_signataire' : 
                         index === 1 ? 'photo_localisation_domicile_signataire2' : 
                         'photo_localisation_domicile_signataire3';
            setFormDataState(prev => ({
                ...prev,
                [field]: file
            }));
            
            const newPreviews = [...photoLocalisationDomicilePreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setPhotoLocalisationDomicilePreviews(newPreviews);
        }
    };

    const handlePlanSignataireChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const field = index === 0 ? 'plan_localisation_signataire1_image' : 
                         index === 1 ? 'plan_localisation_signataire2_image' : 
                         'plan_localisation_signataire3_image';
            setFormDataState(prev => ({
                ...prev,
                [field]: file
            }));
            
            const newPreviews = [...planSignatairePreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setPlanSignatairePreviews(newPreviews);
        }
    };

    const handleFactureEauSignataireChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const field = index === 0 ? 'facture_eau_signataire1_image' : 
                         index === 1 ? 'facture_eau_signataire2_image' : 
                         'facture_eau_signataire3_image';
            setFormDataState(prev => ({
                ...prev,
                [field]: file
            }));
            
            const newPreviews = [...factureEauSignatairePreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setFactureEauSignatairePreviews(newPreviews);
        }
    };

    const handleFactureElecSignataireChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const field = index === 0 ? 'facture_electricite_signataire1_image' : 
                         index === 1 ? 'facture_electricite_signataire2_image' : 
                         'facture_electricite_signataire3_image';
            setFormDataState(prev => ({
                ...prev,
                [field]: file
            }));
            
            const newPreviews = [...factureElecSignatairePreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setFactureElecSignatairePreviews(newPreviews);
        }
    };

    const removeFile = (field, setPreview = null, setFileName = null) => {
        setFormDataState(prev => ({
            ...prev,
            [field]: null
        }));
        if (setPreview) {
            setPreview(null);
        }
        if (setFileName) {
            setFileName('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const formData = new FormData();
            const isPhysique = formDataState.type_client === 'physique';
            
            // Ajouter la méthode PUT via _method
            formData.append('_method', 'PUT');
            
            // Ajouter tous les champs communs
            const commonFields = [
                'telephone', 'email', 'adresse_ville', 'adresse_quartier',
                'lieu_dit_domicile', 'lieu_dit_activite', 'ville_activite',
                'quartier_activite', 'bp', 'pays_residence', 'solde_initial',
                'immobiliere', 'autres_biens'
            ];
            
            commonFields.forEach(field => {
                const value = formDataState[field];
                formData.append(field, value !== undefined && value !== null ? value : '');
            });
            
            // Ajouter les fichiers communs
            const commonFileFields = [
                'photo_localisation_domicile', 'photo_localisation_activite'
            ];
            
            if (!isPhysique) {
                commonFileFields.push('liste_membres_pdf');
            }
            
            commonFileFields.forEach(field => {
                if (formDataState[field] instanceof File) {
                    formData.append(field, formDataState[field]);
                }
            });
            
            // Ajouter les champs selon le type
            if (isPhysique) {
                const physiqueFields = [
                    'nom_prenoms', 'sexe', 'date_naissance', 'lieu_naissance',
                    'nationalite', 'nui', 'cni_numero', 'cni_delivrance',
                    'cni_expiration', 'nom_pere', 'nom_mere', 'nationalite_pere',
                    'nationalite_mere', 'profession', 'employeur', 'situation_familiale',
                    'regime_matrimonial', 'nom_conjoint', 'date_naissance_conjoint', 
                    'cni_conjoint', 'profession_conjoint', 'salaire', 'tel_conjoint'
                ];
                
                physiqueFields.forEach(field => {
                    const value = formDataState.physique[field];
                    formData.append(field, value !== undefined && value !== null ? value : '');
                });
                
                // Fichiers physique
                const physiqueFileFields = [
                    'photo', 'signature', 'cni_recto', 'cni_verso', 
                    'niu_image', 'attestation_conformite_pdf'
                ];
                
                physiqueFileFields.forEach(field => {
                    if (formDataState[field] instanceof File) {
                        formData.append(field, formDataState[field]);
                    }
                });
            } else {
                // Champs client moral
                const moraleFields = [
                    'raison_sociale', 'sigle', 'forme_juridique', 'type_entreprise',
                    'rccm', 'nui', 'nom_gerant', 'telephone_gerant',
                    'nom_gerant2', 'telephone_gerant2'
                ];
                
                moraleFields.forEach(field => {
                    const value = formDataState.morale[field];
                    formData.append(field, value !== undefined && value !== null ? value : '');
                });
                
                // Champs des signataires
                formDataState.signataires.forEach((signataire, index) => {
                    if (signataire.nom) {
                        const prefix = index === 0 ? '' : index + 1;
                        formData.append(`nom_signataire${prefix}`, signataire.nom);
                        formData.append(`sexe_signataire${prefix}`, signataire.sexe);
                        formData.append(`ville_signataire${prefix}`, signataire.ville);
                        formData.append(`quartier_signataire${prefix}`, signataire.quartier);
                        formData.append(`lieu_domicile_signataire${prefix}`, signataire.lieu_domicile);
                        formData.append(`lieu_dit_domicile_signataire${prefix}`, signataire.lieu_dit_domicile);
                        formData.append(`telephone_signataire${prefix}`, signataire.telephone);
                        formData.append(`email_signataire${prefix}`, signataire.email);
                        formData.append(`cni_signataire${prefix}`, signataire.cni);
                        formData.append(`nui_signataire${prefix}`, signataire.nui);
                    }
                });
                
                // Fichiers client moral
                const moraleFileFields = [
                    'photo_gerant', 'photo_gerant2',
                    'extrait_rccm_image', 'titre_patente_image', 'niu_image_morale',
                    'statuts_image', 'pv_agc_image', 'attestation_non_redevance_image',
                    'proces_verbal_image', 'registre_coop_gic_image', 'recepisse_declaration_association_image',
                    'acte_designation_signataires_pdf', 'liste_conseil_administration_pdf',
                    'plan_localisation_siege_image', 'facture_eau_siege_image', 'facture_electricite_siege_image',
                    'plan_localisation_signataire1_image', 'plan_localisation_signataire2_image', 'plan_localisation_signataire3_image',
                    'facture_eau_signataire1_image', 'facture_eau_signataire2_image', 'facture_eau_signataire3_image',
                    'facture_electricite_signataire1_image', 'facture_electricite_signataire2_image', 'facture_electricite_signataire3_image',
                    'attestation_conformite_pdf'
                ];
                
                // Fichiers des signataires
                for (let i = 0; i < 3; i++) {
                    const fields = [
                        `photo_signataire${i === 0 ? '' : i + 1}`,
                        `signature_signataire${i === 0 ? '' : i + 1}`,
                        `cni_photo_recto_signataire${i === 0 ? '' : i + 1}`,
                        `cni_photo_verso_signataire${i === 0 ? '' : i + 1}`,
                        `nui_image_signataire${i === 0 ? '' : i + 1}`,
                        `lieu_dit_domicile_photo_signataire${i === 0 ? '' : i + 1}`,
                        `photo_localisation_domicile_signataire${i === 0 ? '' : i + 1}`
                    ];
                    
                    fields.forEach(field => {
                        if (formDataState[field] instanceof File) {
                            formData.append(field, formDataState[field]);
                        }
                    });
                }
                
                moraleFileFields.forEach(field => {
                    if (formDataState[field] instanceof File) {
                        formData.append(field, formDataState[field]);
                    }
                });
            }
            
            // Utiliser POST avec _method=PUT
            const response = await apiClient.post(`/clients/${id}`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                }
            });
            
            if (response.data.success) {
                showSnackbar('Client mis à jour avec succès!', 'success');
                
                setTimeout(() => {
                    navigate(`/client`);
                }, 2000);
            } else {
                const errorMessage = formatErrorMessage(response.data);
                showSnackbar(errorMessage, 'error');
            }
            
        } catch (error) {
            console.error('=== ERREUR COMPLÈTE ===', error);
            
            const errorMessage = formatErrorMessage(error.response?.data);
            showSnackbar(errorMessage, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <Layout>
            <Box sx={{ p: 5, textAlign: 'center' }}>
                <CircularProgress sx={{ color: '#6366f1' }} />
                <Typography sx={{ mt: 2 }}>Chargement des données...</Typography>
            </Box>
        </Layout>
    );

    const isPhysique = formDataState.type_client === 'physique';
    const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';
    const typeEntreprise = formDataState.morale?.type_entreprise || 'entreprise';
    const currentSignataire = formDataState.signataires[activeSignataireTab];

    return (
        <Layout>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
                <form onSubmit={handleSubmit}>
                    
                    {/* HEADER */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B' }}>
                                Modifier {isPhysique ? 'le client' : "l'entreprise"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                ID: <strong>{formDataState.num_client}</strong> • Type: <strong>{formDataState.type_client?.toUpperCase()}</strong>
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                                variant="outlined" 
                                startIcon={<ArrowBackIcon />} 
                                onClick={() => navigate(`/client`)}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                            >
                                Annuler
                            </Button>
                            <Button 
                                variant="contained" 
                                type="submit" 
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
                                disabled={saving}
                                sx={{ borderRadius: 2, background: activeGradient, textTransform: 'none', fontWeight: 'bold' }}
                            >
                                {saving ? 'Enregistrement...' : 'Sauvegarder'}
                            </Button>
                        </Box>
                    </Box>

                    <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                        <Tab label="Informations de base" />
                        <Tab label="Documents" />
                        <Tab label="Localisation & Patrimoine" />
                        {!isPhysique && <Tab label="Signataires" />}
                    </Tabs>

                    <Grid container spacing={3}>
                        
                        {/* COLONNE GAUCHE */}
                        <Grid item xs={12} md={4}>
                            <Stack spacing={3}>
                                
                                {/* Photo de profil */}
                                <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            badgeContent={
                                                <IconButton 
                                                    onClick={() => {
                                                        if (isPhysique) {
                                                            photoRef.current.click();
                                                        } else {
                                                            gerantPhotoRefs[0].current.click();
                                                        }
                                                    }}
                                                    sx={{ bgcolor: '#6366f1', color: 'white', '&:hover': { bgcolor: '#4f46e5' }, border: '3px solid #fff' }}
                                                    size="small"
                                                >
                                                    <PhotoCameraIcon fontSize="small" />
                                                </IconButton>
                                            }
                                        >
                                            <Avatar 
                                                src={isPhysique ? photoPreview : gerantPreviews[0]} 
                                                sx={{ width: 150, height: 150, border: '4px solid #F1F5F9', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
                                            >
                                                {isPhysique ? <PersonIcon sx={{ fontSize: 80 }} /> : <BusinessIcon sx={{ fontSize: 80 }} />}
                                            </Avatar>
                                        </Badge>
                                        <input 
                                            type="file" 
                                            hidden 
                                            ref={isPhysique ? photoRef : gerantPhotoRefs[0]} 
                                            onChange={(e) => isPhysique ? handleFileChange('photo', e) : handleGerantPhotoChange(0, e)} 
                                            accept="image/*" 
                                        />
                                        <Typography variant="h6" sx={{ mt: 2, fontWeight: '800' }}>
                                            {isPhysique ? 'Photo de profil' : 'Photo Gérant Principal'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                                
                                {activeTab === 0 && isPhysique && (
                                    <>
                                        {/* Signature (physique) */}
                                        <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                            <CardContent>
                                                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Signature</Typography>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                    {signaturePreview && (
                                                        <>
                                                            <img 
                                                                src={signaturePreview} 
                                                                alt="Signature"
                                                                style={{ 
                                                                    width: '100%', 
                                                                    maxHeight: '100px',
                                                                    borderRadius: '8px',
                                                                    objectFit: 'contain'
                                                                }}
                                                            />
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => removeFile('signature', setSignaturePreview)}
                                                                sx={{ position: 'absolute', right: 10, top: 10 }}
                                                            >
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<UploadIcon />}
                                                        onClick={() => signatureRef.current.click()}
                                                        fullWidth
                                                    >
                                                        {signaturePreview ? 'Changer la signature' : 'Ajouter une signature'}
                                                    </Button>
                                                    <input 
                                                        type="file" 
                                                        hidden 
                                                        ref={signatureRef} 
                                                        onChange={(e) => handleFileChange('signature', e)} 
                                                        accept="image/*" 
                                                    />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                        
                                        {/* CNI (physique) */}
                                        <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                            <CardContent>
                                                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Documents CNI</Typography>
                                                <Stack spacing={2}>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Recto CNI</Typography>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            {cniRectoPreview && (
                                                                <>
                                                                    <Avatar 
                                                                        variant="rounded"
                                                                        src={cniRectoPreview}
                                                                        sx={{ width: 60, height: 60 }}
                                                                    />
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={() => removeFile('cni_recto', setCniRectoPreview)}
                                                                    >
                                                                        <CloseIcon fontSize="small" />
                                                                    </IconButton>
                                                                </>
                                                            )}
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<PhotoCameraIcon />}
                                                                onClick={() => cniRectoRef.current.click()}
                                                            >
                                                                {cniRectoPreview ? 'Changer' : 'Ajouter'}
                                                            </Button>
                                                            <input 
                                                                type="file" 
                                                                hidden 
                                                                ref={cniRectoRef} 
                                                                onChange={(e) => handleFileChange('cni_recto', e)} 
                                                                accept="image/*" 
                                                            />
                                                        </Stack>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Verso CNI</Typography>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            {cniVersoPreview && (
                                                                <>
                                                                    <Avatar 
                                                                        variant="rounded"
                                                                        src={cniVersoPreview}
                                                                        sx={{ width: 60, height: 60 }}
                                                                    />
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={() => removeFile('cni_verso', setCniVersoPreview)}
                                                                    >
                                                                        <CloseIcon fontSize="small" />
                                                                    </IconButton>
                                                                </>
                                                            )}
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<PhotoCameraIcon />}
                                                                onClick={() => cniVersoRef.current.click()}
                                                            >
                                                                {cniVersoPreview ? 'Changer' : 'Ajouter'}
                                                            </Button>
                                                            <input 
                                                                type="file" 
                                                                hidden 
                                                                ref={cniVersoRef} 
                                                                onChange={(e) => handleFileChange('cni_verso', e)} 
                                                                accept="image/*" 
                                                            />
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                                
                                {activeTab === 0 && !isPhysique && (
                                    <>
                                        {/* Gérant secondaire */}
                                        <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                            <CardContent>
                                                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Gérant Secondaire</Typography>
                                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                                    {gerantPreviews[1] && (
                                                        <>
                                                            <Avatar 
                                                                src={gerantPreviews[1]}
                                                                sx={{ width: 60, height: 60 }}
                                                            />
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => removeFile('photo_gerant2', () => {
                                                                    const newPreviews = [...gerantPreviews];
                                                                    newPreviews[1] = null;
                                                                    setGerantPreviews(newPreviews);
                                                                })}
                                                            >
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<PhotoCameraIcon />}
                                                        onClick={() => gerantPhotoRefs[1].current.click()}
                                                    >
                                                        {gerantPreviews[1] ? 'Changer' : 'Ajouter'}
                                                    </Button>
                                                    <input 
                                                        type="file" 
                                                        hidden 
                                                        ref={gerantPhotoRefs[1]} 
                                                        onChange={(e) => handleGerantPhotoChange(1, e)} 
                                                        accept="image/*" 
                                                    />
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                                
                                {activeTab === 1 && (
                                    <>
                                        {/* Photos de localisation */}
                                        <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                            <CardContent>
                                                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Localisation</Typography>
                                                
                                                <Box sx={{ mb: 3 }}>
                                                    <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Photo domicile</Typography>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        {domicilePreview && (
                                                            <>
                                                                <Avatar 
                                                                    variant="rounded"
                                                                    src={domicilePreview}
                                                                    sx={{ width: 60, height: 60 }}
                                                                />
                                                                <IconButton 
                                                                    size="small" 
                                                                    onClick={() => removeFile('photo_localisation_domicile', setDomicilePreview)}
                                                                >
                                                                    <CloseIcon fontSize="small" />
                                                                </IconButton>
                                                            </>
                                                        )}
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<PhotoCameraIcon />}
                                                            onClick={() => domicilePhotoRef.current.click()}
                                                        >
                                                            {domicilePreview ? 'Changer' : 'Ajouter'}
                                                        </Button>
                                                        <input 
                                                            type="file" 
                                                            hidden 
                                                            ref={domicilePhotoRef} 
                                                            onChange={(e) => handleFileChange('photo_localisation_domicile', e)} 
                                                            accept="image/*" 
                                                        />
                                                    </Stack>
                                                </Box>
                                                
                                                <Box>
                                                    <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Photo activité</Typography>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        {activitePreview && (
                                                            <>
                                                                <Avatar 
                                                                    variant="rounded"
                                                                    src={activitePreview}
                                                                    sx={{ width: 60, height: 60 }}
                                                                />
                                                                <IconButton 
                                                                    size="small" 
                                                                    onClick={() => removeFile('photo_localisation_activite', setActivitePreview)}
                                                                >
                                                                    <CloseIcon fontSize="small" />
                                                                </IconButton>
                                                            </>
                                                        )}
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<PhotoCameraIcon />}
                                                            onClick={() => activitePhotoRef.current.click()}
                                                        >
                                                            {activitePreview ? 'Changer' : 'Ajouter'}
                                                        </Button>
                                                        <input 
                                                            type="file" 
                                                            hidden 
                                                            ref={activitePhotoRef} 
                                                            onChange={(e) => handleFileChange('photo_localisation_activite', e)} 
                                                            accept="image/*" 
                                                        />
                                                    </Stack>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                        
                                        {/* Documents PDF communs */}
                                        <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                            <CardContent>
                                                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Documents communs</Typography>
                                                <Stack spacing={2}>
                                                    {isPhysique ? (
                                                        <>
                                                            <FileUploadPdfField
                                                                label="Attestation de conformité (PDF)"
                                                                fileName={attestationConformitePdfName}
                                                                onClick={() => attestationConformitePdfRef.current.click()}
                                                                inputRef={attestationConformitePdfRef}
                                                                onChange={(e) => handleFileChange('attestation_conformite_pdf', e)}
                                                                onRemove={() => removeFile('attestation_conformite_pdf', null, setAttestationConformitePdfName)}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileUploadPdfField
                                                                label="Liste des membres (PDF)"
                                                                fileName={listeMembresPdfName}
                                                                onClick={() => listeMembresPdfRef.current.click()}
                                                                inputRef={listeMembresPdfRef}
                                                                onChange={(e) => handleFileChange('liste_membres_pdf', e)}
                                                                onRemove={() => removeFile('liste_membres_pdf', null, setListeMembresPdfName)}
                                                            />
                                                            <FileUploadPdfField
                                                                label="Attestation de conformité (PDF)"
                                                                fileName={attestationConformitePdfName}
                                                                onClick={() => attestationConformitePdfRef.current.click()}
                                                                inputRef={attestationConformitePdfRef}
                                                                onChange={(e) => handleFileChange('attestation_conformite_pdf', e)}
                                                                onRemove={() => removeFile('attestation_conformite_pdf', null, setAttestationConformitePdfName)}
                                                            />
                                                        </>
                                                    )}
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                        
                                        {/* Documents supplémentaires pour client physique */}
                                        {isPhysique && (
                                            <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                                <CardContent>
                                                    <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Documents supplémentaires</Typography>
                                                    <Stack spacing={2}>
                                                        <FileUploadField
                                                            label="Photocopie NUI"
                                                            preview={nuiImagePreview}
                                                            onRemove={() => removeFile('niu_image', setNuiImagePreview)}
                                                            onClick={() => nuiImageRef.current.click()}
                                                            inputRef={nuiImageRef}
                                                            onChange={(e) => handleFileChange('niu_image', e)}
                                                        />
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        )}
                                        
                                        {!isPhysique && (
                                            <>
                                                {/* Documents juridiques selon le type d'entreprise */}
                                                <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                                    <CardContent>
                                                        <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>
                                                            Documents {typeEntreprise === 'entreprise' ? 'Entreprise' : 'Association'}
                                                        </Typography>
                                                        <Stack spacing={2}>
                                                            {typeEntreprise === 'entreprise' ? (
                                                                <>
                                                                    <FileUploadField
                                                                        label="Extrait RCCM"
                                                                        preview={extraitRccmPreview}
                                                                        onRemove={() => removeFile('extrait_rccm_image', setExtraitRccmPreview)}
                                                                        onClick={() => extraitRccmRef.current.click()}
                                                                        inputRef={extraitRccmRef}
                                                                        onChange={(e) => handleFileChange('extrait_rccm_image', e)}
                                                                    />
                                                                    <FileUploadField
                                                                        label="Titre de Patente"
                                                                        preview={titrePatentePreview}
                                                                        onRemove={() => removeFile('titre_patente_image', setTitrePatentePreview)}
                                                                        onClick={() => titrePatenteRef.current.click()}
                                                                        inputRef={titrePatenteRef}
                                                                        onChange={(e) => handleFileChange('titre_patente_image', e)}
                                                                    />
                                                                    <FileUploadField
                                                                        label="Photocopie NUI"
                                                                        preview={niuImageMoralePreview}
                                                                        onRemove={() => removeFile('niu_image_morale', setNiuImageMoralePreview)}
                                                                        onClick={() => niuImageMoraleRef.current.click()}
                                                                        inputRef={niuImageMoraleRef}
                                                                        onChange={(e) => handleFileChange('niu_image_morale', e)}
                                                                    />
                                                                    <FileUploadField
                                                                        label="Photocopie des Statuts"
                                                                        preview={statutsPreview}
                                                                        onRemove={() => removeFile('statuts_image', setStatutsPreview)}
                                                                        onClick={() => statutsRef.current.click()}
                                                                        inputRef={statutsRef}
                                                                        onChange={(e) => handleFileChange('statuts_image', e)}
                                                                    />
                                                                    <FileUploadPdfField
                                                                        label="Acte de Désignation (PDF)"
                                                                        onClick={() => acteDesignationPdfRef.current.click()}
                                                                        inputRef={acteDesignationPdfRef}
                                                                        onChange={(e) => handleFileChange('acte_designation_signataires_pdf', e)}
                                                                    />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FileUploadField
                                                                        label="PV de l'AGC"
                                                                        preview={pvAgcPreview}
                                                                        onRemove={() => removeFile('pv_agc_image', setPvAgcPreview)}
                                                                        onClick={() => pvAgcRef.current.click()}
                                                                        inputRef={pvAgcRef}
                                                                        onChange={(e) => handleFileChange('pv_agc_image', e)}
                                                                    />
                                                                    <FileUploadField
                                                                        label="Attestation de non redevance"
                                                                        preview={attestationPreview}
                                                                        onRemove={() => removeFile('attestation_non_redevance_image', setAttestationPreview)}
                                                                        onClick={() => attestationRef.current.click()}
                                                                        inputRef={attestationRef}
                                                                        onChange={(e) => handleFileChange('attestation_non_redevance_image', e)}
                                                                    />
                                                                    <FileUploadField
                                                                        label="Procès Verbal"
                                                                        preview={procesVerbalPreview}
                                                                        onRemove={() => removeFile('proces_verbal_image', setProcesVerbalPreview)}
                                                                        onClick={() => procesVerbalRef.current.click()}
                                                                        inputRef={procesVerbalRef}
                                                                        onChange={(e) => handleFileChange('proces_verbal_image', e)}
                                                                    />
                                                                    <FileUploadField
                                                                        label="Registre COOP-GIC"
                                                                        preview={registreCoopPreview}
                                                                        onRemove={() => removeFile('registre_coop_gic_image', setRegistreCoopPreview)}
                                                                        onClick={() => registreCoopRef.current.click()}
                                                                        inputRef={registreCoopRef}
                                                                        onChange={(e) => handleFileChange('registre_coop_gic_image', e)}
                                                                    />
                                                                    <FileUploadField
                                                                        label="Récépissé de déclaration"
                                                                        preview={recepissePreview}
                                                                        onRemove={() => removeFile('recepisse_declaration_association_image', setRecepissePreview)}
                                                                        onClick={() => recepisseRef.current.click()}
                                                                        inputRef={recepisseRef}
                                                                        onChange={(e) => handleFileChange('recepisse_declaration_association_image', e)}
                                                                    />
                                                                </>
                                                            )}
                                                            <FileUploadPdfField
                                                                label="Liste Conseil d'Administration (PDF)"
                                                                onClick={() => listeConseilPdfRef.current.click()}
                                                                inputRef={listeConseilPdfRef}
                                                                onChange={(e) => handleFileChange('liste_conseil_administration_pdf', e)}
                                                            />
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                                
                                                {/* Plans et factures siège */}
                                                <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                                    <CardContent>
                                                        <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Localisation Siège</Typography>
                                                        <Stack spacing={2}>
                                                            <FileUploadField
                                                                label="Plan localisation siège"
                                                                preview={planSiegePreview}
                                                                onRemove={() => removeFile('plan_localisation_siege_image', setPlanSiegePreview)}
                                                                onClick={() => planSiegeRef.current.click()}
                                                                inputRef={planSiegeRef}
                                                                onChange={(e) => handleFileChange('plan_localisation_siege_image', e)}
                                                            />
                                                            <FileUploadField
                                                                label="Facture eau siège"
                                                                preview={factureEauSiegePreview}
                                                                onRemove={() => removeFile('facture_eau_siege_image', setFactureEauSiegePreview)}
                                                                onClick={() => factureEauSiegeRef.current.click()}
                                                                inputRef={factureEauSiegeRef}
                                                                onChange={(e) => handleFileChange('facture_eau_siege_image', e)}
                                                            />
                                                            <FileUploadField
                                                                label="Facture électricité siège"
                                                                preview={factureElecSiegePreview}
                                                                onRemove={() => removeFile('facture_electricite_siege_image', setFactureElecSiegePreview)}
                                                                onClick={() => factureElecSiegeRef.current.click()}
                                                                inputRef={factureElecSiegeRef}
                                                                onChange={(e) => handleFileChange('facture_electricite_siege_image', e)}
                                                            />
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            </>
                                        )}
                                    </>
                                )}
                                
                                {activeTab === 2 && (
                                    <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Patrimoine</Typography>
                                            <TextField
                                                fullWidth
                                                label="Solde initial (FCFA)"
                                                name="solde_initial"
                                                type="number"
                                                value={formDataState.solde_initial}
                                                onChange={handleChange}
                                                sx={{ mb: 2 }}
                                            />
                                            <TextField
                                                fullWidth
                                                label="Immobilière"
                                                name="immobiliere"
                                                value={formDataState.immobiliere || ''}
                                                onChange={handleChange}
                                                multiline
                                                rows={2}
                                                sx={{ mb: 2 }}
                                            />
                                            <TextField
                                                fullWidth
                                                label="Autres biens"
                                                name="autres_biens"
                                                value={formDataState.autres_biens || ''}
                                                onChange={handleChange}
                                                multiline
                                                rows={2}
                                            />
                                        </CardContent>
                                    </Card>
                                )}
                                
                            </Stack>
                        </Grid>

                        {/* COLONNE DROITE */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ borderRadius: 5, p: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                
                                {activeTab === 0 && (
                                    <>
                                        <Typography variant="h6" fontWeight="800" gutterBottom>
                                            {isPhysique ? 'Informations Personnelles' : 'Informations Entreprise'}
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />
                                        
                                        <Grid container spacing={2}>
                                            {isPhysique ? (
                                                // Formulaire client physique
                                                <>
                                                    <Grid item xs={12} md={8}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Nom et Prénoms" 
                                                            name="nom_prenoms" 
                                                            value={formDataState.physique?.nom_prenoms || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={4}>
                                                        <TextField 
                                                            select 
                                                            fullWidth 
                                                            label="Sexe" 
                                                            name="sexe" 
                                                            value={formDataState.physique?.sexe || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)}
                                                        >
                                                            <MenuItem value="">Sélectionner</MenuItem>
                                                            <MenuItem value="M">Masculin</MenuItem>
                                                            <MenuItem value="F">Féminin</MenuItem>
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            type="date" 
                                                            InputLabelProps={{ shrink: true }} 
                                                            label="Date de Naissance" 
                                                            name="date_naissance" 
                                                            value={formDataState.physique?.date_naissance || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Lieu de Naissance" 
                                                            name="lieu_naissance" 
                                                            value={formDataState.physique?.lieu_naissance || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Nationalité" 
                                                            name="nationalite" 
                                                            value={formDataState.physique?.nationalite || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="NUI" 
                                                            name="nui" 
                                                            value={formDataState.physique?.nui || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="CNI" 
                                                            name="cni_numero" 
                                                            value={formDataState.physique?.cni_numero || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            type="date" 
                                                            InputLabelProps={{ shrink: true }} 
                                                            label="Délivrance CNI" 
                                                            name="cni_delivrance" 
                                                            value={formDataState.physique?.cni_delivrance || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            type="date" 
                                                            InputLabelProps={{ shrink: true }} 
                                                            label="Expiration CNI" 
                                                            name="cni_expiration" 
                                                            value={formDataState.physique?.cni_expiration || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                </>
                                            ) : (
                                                // Formulaire client moral
                                                <>
                                                    <Grid item xs={12} md={8}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Raison Sociale" 
                                                            name="raison_sociale" 
                                                            value={formDataState.morale?.raison_sociale || ''} 
                                                            onChange={(e) => handleNestedChange('morale', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={4}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Sigle" 
                                                            name="sigle" 
                                                            value={formDataState.morale?.sigle || ''} 
                                                            onChange={(e) => handleNestedChange('morale', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <FormControl fullWidth>
                                                            <InputLabel>Forme Juridique</InputLabel>
                                                            <Select 
                                                                label="Forme Juridique"
                                                                name="forme_juridique" 
                                                                value={formDataState.morale?.forme_juridique || ''} 
                                                                onChange={(e) => handleNestedChange('morale', e)}
                                                            >
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
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <FormControl fullWidth>
                                                            <InputLabel>Type d'entreprise</InputLabel>
                                                            <Select 
                                                                label="Type d'entreprise"
                                                                name="type_entreprise" 
                                                                value={formDataState.morale?.type_entreprise || 'entreprise'} 
                                                                onChange={(e) => handleNestedChange('morale', e)}
                                                            >
                                                                <MenuItem value="entreprise">Entreprise</MenuItem>
                                                                <MenuItem value="association">Association</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="RCCM" 
                                                            name="rccm" 
                                                            value={formDataState.morale?.rccm || ''} 
                                                            onChange={(e) => handleNestedChange('morale', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="NUI" 
                                                            name="nui" 
                                                            value={formDataState.morale?.nui || ''} 
                                                            onChange={(e) => handleNestedChange('morale', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Nom du Gérant Principal" 
                                                            name="nom_gerant" 
                                                            value={formDataState.morale?.nom_gerant || ''} 
                                                            onChange={(e) => handleNestedChange('morale', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Téléphone Gérant Principal" 
                                                            name="telephone_gerant" 
                                                            value={formDataState.morale?.telephone_gerant || ''} 
                                                            onChange={(e) => handleNestedChange('morale', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Nom du Gérant Secondaire" 
                                                            name="nom_gerant2" 
                                                            value={formDataState.morale?.nom_gerant2 || ''} 
                                                            onChange={(e) => handleNestedChange('morale', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Téléphone Gérant Secondaire" 
                                                            name="telephone_gerant2" 
                                                            value={formDataState.morale?.telephone_gerant2 || ''} 
                                                            onChange={(e) => handleNestedChange('morale', e)} 
                                                        />
                                                    </Grid>
                                                </>
                                            )}
                                        </Grid>

                                        {/* Informations supplémentaires pour client physique */}
                                        {isPhysique && (
                                            <>
                                                <Typography variant="h6" fontWeight="800" sx={{ mt: 4, mb: 1 }}>
                                                    Informations Professionnelles
                                                </Typography>
                                                <Divider sx={{ mb: 3 }} />
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Profession" 
                                                            name="profession" 
                                                            value={formDataState.physique?.profession || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Employeur" 
                                                            name="employeur" 
                                                            value={formDataState.physique?.employeur || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Situation Familiale" 
                                                            name="situation_familiale" 
                                                            value={formDataState.physique?.situation_familiale || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Régime Matrimonial" 
                                                            name="regime_matrimonial" 
                                                            value={formDataState.physique?.regime_matrimonial || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <Typography variant="h6" fontWeight="800" sx={{ mt: 4, mb: 1 }}>
                                                    Filiation
                                                </Typography>
                                                <Divider sx={{ mb: 3 }} />
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Nom du Père" 
                                                            name="nom_pere" 
                                                            value={formDataState.physique?.nom_pere || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Nationalité Père" 
                                                            name="nationalite_pere" 
                                                            value={formDataState.physique?.nationalite_pere || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Nom de la Mère" 
                                                            name="nom_mere" 
                                                            value={formDataState.physique?.nom_mere || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Nationalité Mère" 
                                                            name="nationalite_mere" 
                                                            value={formDataState.physique?.nationalite_mere || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <Typography variant="h6" fontWeight="800" sx={{ mt: 4, mb: 1 }}>
                                                    Conjoint(e)
                                                </Typography>
                                                <Divider sx={{ mb: 3 }} />
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Nom du Conjoint" 
                                                            name="nom_conjoint" 
                                                            value={formDataState.physique?.nom_conjoint || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            type="date" 
                                                            InputLabelProps={{ shrink: true }} 
                                                            label="Date Naissance Conjoint" 
                                                            name="date_naissance_conjoint" 
                                                            value={formDataState.physique?.date_naissance_conjoint || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="CNI Conjoint" 
                                                            name="cni_conjoint" 
                                                            value={formDataState.physique?.cni_conjoint || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Profession Conjoint" 
                                                            name="profession_conjoint" 
                                                            value={formDataState.physique?.profession_conjoint || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Salaire Conjoint (FCFA)" 
                                                            name="salaire" 
                                                            type="number"
                                                            value={formDataState.physique?.salaire || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField 
                                                            fullWidth 
                                                            label="Téléphone Conjoint" 
                                                            name="tel_conjoint" 
                                                            value={formDataState.physique?.tel_conjoint || ''} 
                                                            onChange={(e) => handleNestedChange('physique', e)} 
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </>
                                        )}
                                    </>
                                )}
                                
                                {activeTab === 1 && (
                                    <>
                                        <Typography variant="h6" fontWeight="800" gutterBottom>
                                            Documents et Fichiers
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />
                                        
                                        {!isPhysique && (
                                            <Box sx={{ mb: 4 }}>
                                                <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 2 }}>
                                                    Documents Signataires
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={6}>
                                                        <FileUploadField
                                                            label="Plan Signataire 1"
                                                            preview={planSignatairePreviews[0]}
                                                            onRemove={() => removeFile('plan_localisation_signataire1_image', () => {
                                                                const newPreviews = [...planSignatairePreviews];
                                                                newPreviews[0] = null;
                                                                setPlanSignatairePreviews(newPreviews);
                                                            })}
                                                            onClick={() => planSignataireRefs[0].current.click()}
                                                            inputRef={planSignataireRefs[0]}
                                                            onChange={(e) => handlePlanSignataireChange(0, e)}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <FileUploadField
                                                            label="Plan Signataire 2"
                                                            preview={planSignatairePreviews[1]}
                                                            onRemove={() => removeFile('plan_localisation_signataire2_image', () => {
                                                                const newPreviews = [...planSignatairePreviews];
                                                                newPreviews[1] = null;
                                                                setPlanSignatairePreviews(newPreviews);
                                                            })}
                                                            onClick={() => planSignataireRefs[1].current.click()}
                                                            inputRef={planSignataireRefs[1]}
                                                            onChange={(e) => handlePlanSignataireChange(1, e)}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <FileUploadField
                                                            label="Plan Signataire 3"
                                                            preview={planSignatairePreviews[2]}
                                                            onRemove={() => removeFile('plan_localisation_signataire3_image', () => {
                                                                const newPreviews = [...planSignatairePreviews];
                                                                newPreviews[2] = null;
                                                                setPlanSignatairePreviews(newPreviews);
                                                            })}
                                                            onClick={() => planSignataireRefs[2].current.click()}
                                                            inputRef={planSignataireRefs[2]}
                                                            onChange={(e) => handlePlanSignataireChange(2, e)}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        )}
                                    </>
                                )}
                                
                                {activeTab === 2 && (
                                    <>
                                        <Typography variant="h6" fontWeight="800" gutterBottom>
                                            Coordonnées
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Téléphone" 
                                                    name="telephone" 
                                                    value={formDataState.telephone || ''} 
                                                    onChange={handleChange} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Email" 
                                                    name="email" 
                                                    type="email"
                                                    value={formDataState.email || ''} 
                                                    onChange={handleChange} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Ville" 
                                                    name="adresse_ville" 
                                                    value={formDataState.adresse_ville || ''} 
                                                    onChange={handleChange} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Quartier" 
                                                    name="adresse_quartier" 
                                                    value={formDataState.adresse_quartier || ''} 
                                                    onChange={handleChange} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Boîte Postale" 
                                                    name="bp" 
                                                    value={formDataState.bp || ''} 
                                                    onChange={handleChange} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Lieu-dit Domicile" 
                                                    name="lieu_dit_domicile" 
                                                    value={formDataState.lieu_dit_domicile || ''} 
                                                    onChange={handleChange} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Lieu-dit Activité" 
                                                    name="lieu_dit_activite" 
                                                    value={formDataState.lieu_dit_activite || ''} 
                                                    onChange={handleChange} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Ville Activité" 
                                                    name="ville_activite" 
                                                    value={formDataState.ville_activite || ''} 
                                                    onChange={handleChange} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Quartier Activité" 
                                                    name="quartier_activite" 
                                                    value={formDataState.quartier_activite || ''} 
                                                    onChange={handleChange} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Pays de Résidence" 
                                                    name="pays_residence" 
                                                    value={formDataState.pays_residence || ''} 
                                                    onChange={handleChange} 
                                                />
                                            </Grid>
                                        </Grid>
                                    </>
                                )}
                                
                                {activeTab === 3 && !isPhysique && (
                                    <>
                                        <Typography variant="h6" fontWeight="800" gutterBottom>
                                            Signataires
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />
                                        
                                        <Tabs value={activeSignataireTab} onChange={(e, v) => setActiveSignataireTab(v)} sx={{ mb: 3 }}>
                                            <Tab label="Signataire 1" />
                                            <Tab label="Signataire 2" />
                                            <Tab label="Signataire 3" />
                                        </Tabs>
                                        
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label={`Nom Signataire ${activeSignataireTab + 1}`} 
                                                    name="nom" 
                                                    value={currentSignataire?.nom || ''} 
                                                    onChange={(e) => handleSignataireChange(activeSignataireTab, e)} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    select 
                                                    fullWidth 
                                                    label="Sexe" 
                                                    name="sexe" 
                                                    value={currentSignataire?.sexe || ''} 
                                                    onChange={(e) => handleSignataireChange(activeSignataireTab, e)}
                                                >
                                                    <MenuItem value="">Sélectionner</MenuItem>
                                                    <MenuItem value="M">Masculin</MenuItem>
                                                    <MenuItem value="F">Féminin</MenuItem>
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Ville" 
                                                    name="ville" 
                                                    value={currentSignataire?.ville || ''} 
                                                    onChange={(e) => handleSignataireChange(activeSignataireTab, e)} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Quartier" 
                                                    name="quartier" 
                                                    value={currentSignataire?.quartier || ''} 
                                                    onChange={(e) => handleSignataireChange(activeSignataireTab, e)} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Lieu Domicile" 
                                                    name="lieu_domicile" 
                                                    value={currentSignataire?.lieu_domicile || ''} 
                                                    onChange={(e) => handleSignataireChange(activeSignataireTab, e)} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Lieu-dit Domicile" 
                                                    name="lieu_dit_domicile" 
                                                    value={currentSignataire?.lieu_dit_domicile || ''} 
                                                    onChange={(e) => handleSignataireChange(activeSignataireTab, e)} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Téléphone" 
                                                    name="telephone" 
                                                    value={currentSignataire?.telephone || ''} 
                                                    onChange={(e) => handleSignataireChange(activeSignataireTab, e)} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Email" 
                                                    name="email" 
                                                    type="email"
                                                    value={currentSignataire?.email || ''} 
                                                    onChange={(e) => handleSignataireChange(activeSignataireTab, e)} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="CNI" 
                                                    name="cni" 
                                                    value={currentSignataire?.cni || ''} 
                                                    onChange={(e) => handleSignataireChange(activeSignataireTab, e)} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="NUI" 
                                                    name="nui" 
                                                    value={currentSignataire?.nui || ''} 
                                                    onChange={(e) => handleSignataireChange(activeSignataireTab, e)} 
                                                />
                                            </Grid>
                                        </Grid>
                                        
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 2 }}>
                                                Documents Signataire {activeSignataireTab + 1}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <Stack spacing={2}>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Photo</Typography>
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                {signatairePreviews[activeSignataireTab] && (
                                                                    <>
                                                                        <Avatar 
                                                                            src={signatairePreviews[activeSignataireTab]}
                                                                            sx={{ width: 60, height: 60 }}
                                                                        />
                                                                        <IconButton 
                                                                            size="small" 
                                                                            onClick={() => {
                                                                                const newPreviews = [...signatairePreviews];
                                                                                newPreviews[activeSignataireTab] = null;
                                                                                setSignatairePreviews(newPreviews);
                                                                            }}
                                                                        >
                                                                            <CloseIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </>
                                                                )}
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<PhotoCameraIcon />}
                                                                    onClick={() => signatairePhotoRefs[activeSignataireTab].current.click()}
                                                                >
                                                                    {signatairePreviews[activeSignataireTab] ? 'Changer' : 'Ajouter'}
                                                                </Button>
                                                                <input 
                                                                    type="file" 
                                                                    hidden 
                                                                    ref={signatairePhotoRefs[activeSignataireTab]} 
                                                                    onChange={(e) => handleSignatairePhotoChange(activeSignataireTab, e)} 
                                                                    accept="image/*" 
                                                                />
                                                            </Stack>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Signature</Typography>
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                {signatureSignatairePreviews[activeSignataireTab] && (
                                                                    <>
                                                                        <Avatar 
                                                                            variant="rounded"
                                                                            src={signatureSignatairePreviews[activeSignataireTab]}
                                                                            sx={{ width: 60, height: 60 }}
                                                                        />
                                                                        <IconButton 
                                                                            size="small" 
                                                                            onClick={() => {
                                                                                const newPreviews = [...signatureSignatairePreviews];
                                                                                newPreviews[activeSignataireTab] = null;
                                                                                setSignatureSignatairePreviews(newPreviews);
                                                                            }}
                                                                        >
                                                                            <CloseIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </>
                                                                )}
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<PhotoCameraIcon />}
                                                                    onClick={() => signatureSignataireRefs[activeSignataireTab].current.click()}
                                                                >
                                                                    {signatureSignatairePreviews[activeSignataireTab] ? 'Changer' : 'Ajouter'}
                                                                </Button>
                                                                <input 
                                                                    type="file" 
                                                                    hidden 
                                                                    ref={signatureSignataireRefs[activeSignataireTab]} 
                                                                    onChange={(e) => handleSignatureSignataireChange(activeSignataireTab, e)} 
                                                                    accept="image/*" 
                                                                />
                                                            </Stack>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Recto CNI</Typography>
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                {cniRectoSignatairePreviews[activeSignataireTab] && (
                                                                    <>
                                                                        <Avatar 
                                                                            variant="rounded"
                                                                            src={cniRectoSignatairePreviews[activeSignataireTab]}
                                                                            sx={{ width: 60, height: 60 }}
                                                                        />
                                                                        <IconButton 
                                                                            size="small" 
                                                                            onClick={() => {
                                                                                const newPreviews = [...cniRectoSignatairePreviews];
                                                                                newPreviews[activeSignataireTab] = null;
                                                                                setCniRectoSignatairePreviews(newPreviews);
                                                                            }}
                                                                        >
                                                                            <CloseIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </>
                                                                )}
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<PhotoCameraIcon />}
                                                                    onClick={() => cniRectoSignataireRefs[activeSignataireTab].current.click()}
                                                                >
                                                                    {cniRectoSignatairePreviews[activeSignataireTab] ? 'Changer' : 'Ajouter'}
                                                                </Button>
                                                                <input 
                                                                    type="file" 
                                                                    hidden 
                                                                    ref={cniRectoSignataireRefs[activeSignataireTab]} 
                                                                    onChange={(e) => handleCniRectoSignataireChange(activeSignataireTab, e)} 
                                                                    accept="image/*" 
                                                                />
                                                            </Stack>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Verso CNI</Typography>
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                {cniVersoSignatairePreviews[activeSignataireTab] && (
                                                                    <>
                                                                        <Avatar 
                                                                            variant="rounded"
                                                                            src={cniVersoSignatairePreviews[activeSignataireTab]}
                                                                            sx={{ width: 60, height: 60 }}
                                                                        />
                                                                        <IconButton 
                                                                            size="small" 
                                                                            onClick={() => {
                                                                                const newPreviews = [...cniVersoSignatairePreviews];
                                                                                newPreviews[activeSignataireTab] = null;
                                                                                setCniVersoSignatairePreviews(newPreviews);
                                                                            }}
                                                                        >
                                                                            <CloseIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </>
                                                                )}
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<PhotoCameraIcon />}
                                                                    onClick={() => cniVersoSignataireRefs[activeSignataireTab].current.click()}
                                                                >
                                                                    {cniVersoSignatairePreviews[activeSignataireTab] ? 'Changer' : 'Ajouter'}
                                                                </Button>
                                                                <input 
                                                                    type="file" 
                                                                    hidden 
                                                                    ref={cniVersoSignataireRefs[activeSignataireTab]} 
                                                                    onChange={(e) => handleCniVersoSignataireChange(activeSignataireTab, e)} 
                                                                    accept="image/*" 
                                                                />
                                                            </Stack>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Photocopie NUI</Typography>
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                {nuiImageSignatairePreviews[activeSignataireTab] && (
                                                                    <>
                                                                        <Avatar 
                                                                            variant="rounded"
                                                                            src={nuiImageSignatairePreviews[activeSignataireTab]}
                                                                            sx={{ width: 60, height: 60 }}
                                                                        />
                                                                        <IconButton 
                                                                            size="small" 
                                                                            onClick={() => {
                                                                                const newPreviews = [...nuiImageSignatairePreviews];
                                                                                newPreviews[activeSignataireTab] = null;
                                                                                setNuiImageSignatairePreviews(newPreviews);
                                                                            }}
                                                                        >
                                                                            <CloseIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </>
                                                                )}
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<PhotoCameraIcon />}
                                                                    onClick={() => nuiImageSignataireRefs[activeSignataireTab].current.click()}
                                                                >
                                                                    {nuiImageSignatairePreviews[activeSignataireTab] ? 'Changer' : 'Ajouter'}
                                                                </Button>
                                                                <input 
                                                                    type="file" 
                                                                    hidden 
                                                                    ref={nuiImageSignataireRefs[activeSignataireTab]} 
                                                                    onChange={(e) => handleNuiImageSignataireChange(activeSignataireTab, e)} 
                                                                    accept="image/*" 
                                                                />
                                                            </Stack>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Photo lieu-dit domicile</Typography>
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                {lieuDitDomicilePhotoPreviews[activeSignataireTab] && (
                                                                    <>
                                                                        <Avatar 
                                                                            variant="rounded"
                                                                            src={lieuDitDomicilePhotoPreviews[activeSignataireTab]}
                                                                            sx={{ width: 60, height: 60 }}
                                                                        />
                                                                        <IconButton 
                                                                            size="small" 
                                                                            onClick={() => {
                                                                                const newPreviews = [...lieuDitDomicilePhotoPreviews];
                                                                                newPreviews[activeSignataireTab] = null;
                                                                                setLieuDitDomicilePhotoPreviews(newPreviews);
                                                                            }}
                                                                        >
                                                                            <CloseIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </>
                                                                )}
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<PhotoCameraIcon />}
                                                                    onClick={() => lieuDitDomicilePhotoRefs[activeSignataireTab].current.click()}
                                                                >
                                                                    {lieuDitDomicilePhotoPreviews[activeSignataireTab] ? 'Changer' : 'Ajouter'}
                                                                </Button>
                                                                <input 
                                                                    type="file" 
                                                                    hidden 
                                                                    ref={lieuDitDomicilePhotoRefs[activeSignataireTab]} 
                                                                    onChange={(e) => handleLieuDitDomicilePhotoChange(activeSignataireTab, e)} 
                                                                    accept="image/*" 
                                                                />
                                                            </Stack>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Photo localisation domicile</Typography>
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                {photoLocalisationDomicilePreviews[activeSignataireTab] && (
                                                                    <>
                                                                        <Avatar 
                                                                            variant="rounded"
                                                                            src={photoLocalisationDomicilePreviews[activeSignataireTab]}
                                                                            sx={{ width: 60, height: 60 }}
                                                                        />
                                                                        <IconButton 
                                                                            size="small" 
                                                                            onClick={() => {
                                                                                const newPreviews = [...photoLocalisationDomicilePreviews];
                                                                                newPreviews[activeSignataireTab] = null;
                                                                                setPhotoLocalisationDomicilePreviews(newPreviews);
                                                                            }}
                                                                        >
                                                                            <CloseIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </>
                                                                )}
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<PhotoCameraIcon />}
                                                                    onClick={() => photoLocalisationDomicileRefs[activeSignataireTab].current.click()}
                                                                >
                                                                    {photoLocalisationDomicilePreviews[activeSignataireTab] ? 'Changer' : 'Ajouter'}
                                                                </Button>
                                                                <input 
                                                                    type="file" 
                                                                    hidden 
                                                                    ref={photoLocalisationDomicileRefs[activeSignataireTab]} 
                                                                    onChange={(e) => handlePhotoLocalisationDomicileChange(activeSignataireTab, e)} 
                                                                    accept="image/*" 
                                                                />
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Stack spacing={2}>
                                                        <FileUploadField
                                                            label="Facture eau"
                                                            preview={factureEauSignatairePreviews[activeSignataireTab]}
                                                            onRemove={() => {
                                                                const newPreviews = [...factureEauSignatairePreviews];
                                                                newPreviews[activeSignataireTab] = null;
                                                                setFactureEauSignatairePreviews(newPreviews);
                                                            }}
                                                            onClick={() => factureEauSignataireRefs[activeSignataireTab].current.click()}
                                                            inputRef={factureEauSignataireRefs[activeSignataireTab]}
                                                            onChange={(e) => handleFactureEauSignataireChange(activeSignataireTab, e)}
                                                        />
                                                        <FileUploadField
                                                            label="Facture électricité"
                                                            preview={factureElecSignatairePreviews[activeSignataireTab]}
                                                            onRemove={() => {
                                                                const newPreviews = [...factureElecSignatairePreviews];
                                                                newPreviews[activeSignataireTab] = null;
                                                                setFactureElecSignatairePreviews(newPreviews);
                                                            }}
                                                            onClick={() => factureElecSignataireRefs[activeSignataireTab].current.click()}
                                                            inputRef={factureElecSignataireRefs[activeSignataireTab]}
                                                            onChange={(e) => handleFactureElecSignataireChange(activeSignataireTab, e)}
                                                        />
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </form>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Layout>
    );
}

// Composant pour l'upload de fichiers images
function FileUploadField({ label, preview, onRemove, onClick, inputRef, onChange, isPdf = false }) {
    return (
        <Box>
            <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>{label}</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
                {preview && !isPdf && (
                    <>
                        <Avatar 
                            variant="rounded"
                            src={preview}
                            sx={{ width: 60, height: 60 }}
                        />
                        <IconButton size="small" onClick={onRemove}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </>
                )}
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={isPdf ? <UploadIcon /> : <PhotoCameraIcon />}
                    onClick={onClick}
                >
                    {preview ? 'Changer' : 'Ajouter'}
                </Button>
                <input 
                    type="file" 
                    hidden 
                    ref={inputRef} 
                    onChange={onChange} 
                    accept={isPdf ? ".pdf" : "image/*"} 
                />
            </Stack>
        </Box>
    );
}

// Composant pour l'upload de fichiers PDF
function FileUploadPdfField({ label, fileName, onClick, inputRef, onChange, onRemove }) {
    return (
        <Box>
            <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>{label}</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
                {fileName && (
                    <>
                        <Typography variant="body2" sx={{ color: '#6366f1' }}>
                            {fileName}
                        </Typography>
                        <IconButton size="small" onClick={onRemove}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </>
                )}
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<UploadIcon />}
                    onClick={onClick}
                >
                    {fileName ? 'Changer' : 'Ajouter'}
                </Button>
                <input 
                    type="file" 
                    hidden 
                    ref={inputRef} 
                    onChange={onChange} 
                    accept=".pdf" 
                />
            </Stack>
        </Box>
    );
}