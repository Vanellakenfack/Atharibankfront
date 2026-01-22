import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Grid, TextField, Button, 
    Divider, CircularProgress, Card, CardContent, 
    MenuItem, Avatar, IconButton, Badge, Alert, 
    Snackbar, Stack, Tabs, Tab
} from '@mui/material';
import { 
    Save as SaveIcon, 
    ArrowBack as ArrowBackIcon, 
    PhotoCamera as PhotoCameraIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    Upload as UploadIcon
} from '@mui/icons-material';
import apiClient from '../../services/api/ApiClient';
import Layout from '../../components/layout/Layout';

export default function ModifierClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const photoRef = useRef(null);
    const signatureRef = useRef(null);
    const domicilePhotoRef = useRef(null);
    const activitePhotoRef = useRef(null);
    const cniRectoRef = useRef(null);
    const cniVersoRef = useRef(null);
    const gerantPhotoRefs = [useRef(null), useRef(null)];
    const signatairePhotoRefs = [useRef(null), useRef(null), useRef(null)];
    const signatureSignataireRefs = [useRef(null), useRef(null), useRef(null)];
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [activeTab, setActiveTab] = useState(0);
    
    const [photoPreview, setPhotoPreview] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState(null);
    const [domicilePreview, setDomicilePreview] = useState(null);
    const [activitePreview, setActivitePreview] = useState(null);
    const [cniRectoPreview, setCniRectoPreview] = useState(null);
    const [cniVersoPreview, setCniVersoPreview] = useState(null);
    const [gerantPreviews, setGerantPreviews] = useState([null, null]);
    const [signatairePreviews, setSignatairePreviews] = useState([null, null, null]);
    const [signatureSignatairePreviews, setSignatureSignatairePreviews] = useState([null, null, null]);
    
    const [formDataState, setFormDataState] = useState({
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
        type_entreprise: 'entreprise',
        
        photo: null,
        signature: null,
        photo_localisation_domicile: null,
        photo_localisation_activite: null,
        cni_recto: null,
        cni_verso: null,
        
        physique: {},
        morale: {}
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

                const initialData = {
                    ...data,
                    solde_initial: parseFloat(data.solde_initial) || 0,
                    type_entreprise: data.morale?.type_entreprise || 'entreprise',
                    physique: {
                        nom_prenoms: '',
                        sexe: '',
                        date_naissance: '',
                        lieu_naissance: '',
                        nationalite: '',
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
                        nom_signataire: '',
                        telephone_signataire: '',
                        nom_signataire2: '',
                        telephone_signataire2: '',
                        nom_signataire3: '',
                        telephone_signataire3: '',
                        ...data.morale
                    }
                };
                
                setFormDataState(initialData);
                
                // Définir les prévisualisations d'images
                if (data.type_client === 'physique' && data.physique) {
                    if (data.physique.photo_url) setPhotoPreview(data.physique.photo_url);
                    if (data.physique.signature_url) setSignaturePreview(data.physique.signature_url);
                    if (data.physique.cni_recto_url) setCniRectoPreview(data.physique.cni_recto_url);
                    if (data.physique.cni_verso_url) setCniVersoPreview(data.physique.cni_verso_url);
                }
                
                if (data.type_client === 'morale' && data.morale) {
                    if (data.morale.photo_gerant_url) setGerantPreviews([data.morale.photo_gerant_url, null]);
                    if (data.morale.photo_gerant2_url) setGerantPreviews(prev => [prev[0], data.morale.photo_gerant2_url]);
                    if (data.morale.photo_signataire_url) setSignatairePreviews(prev => [data.morale.photo_signataire_url, prev[1], prev[2]]);
                    if (data.morale.photo_signataire2_url) setSignatairePreviews(prev => [prev[0], data.morale.photo_signataire2_url, prev[2]]);
                    if (data.morale.photo_signataire3_url) setSignatairePreviews(prev => [prev[0], prev[1], data.morale.photo_signataire3_url]);
                    if (data.morale.signature_signataire_url) setSignatureSignatairePreviews(prev => [data.morale.signature_signataire_url, prev[1], prev[2]]);
                    if (data.morale.signature_signataire2_url) setSignatureSignatairePreviews(prev => [prev[0], data.morale.signature_signataire2_url, prev[2]]);
                    if (data.morale.signature_signataire3_url) setSignatureSignatairePreviews(prev => [prev[0], prev[1], data.morale.signature_signataire3_url]);
                }
                
                if (data.photo_localisation_domicile_url) setDomicilePreview(data.photo_localisation_domicile_url);
                if (data.photo_localisation_activite_url) setActivitePreview(data.photo_localisation_activite_url);
                
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

    const handleFileChange = (field, e) => {
        const file = e.target.files[0];
        if (file) {
            setFormDataState(prev => ({
                ...prev,
                [field]: file
            }));
            
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
            const commonFileFields = ['photo_localisation_domicile', 'photo_localisation_activite'];
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
                const physiqueFileFields = ['photo', 'signature', 'cni_recto', 'cni_verso'];
                physiqueFileFields.forEach(field => {
                    if (formDataState[field] instanceof File) {
                        formData.append(field, formDataState[field]);
                    }
                });
            } else {
                const moraleFields = [
                    'raison_sociale', 'sigle', 'forme_juridique', 'type_entreprise',
                    'rccm', 'nui', 'nom_gerant', 'telephone_gerant',
                    'nom_gerant2', 'telephone_gerant2',
                    'nom_signataire', 'telephone_signataire',
                    'nom_signataire2', 'telephone_signataire2',
                    'nom_signataire3', 'telephone_signataire3'
                ];
                
                moraleFields.forEach(field => {
                    const value = formDataState.morale[field];
                    formData.append(field, value !== undefined && value !== null ? value : '');
                });
                
                // Fichiers morale
                const moraleFileFields = [
                    'photo_gerant', 'photo_gerant2',
                    'photo_signataire', 'photo_signataire2', 'photo_signataire3',
                    'signature_signataire', 'signature_signataire2', 'signature_signataire3'
                ];
                
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
                    navigate(`/clients/${id}`);
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
                                onClick={() => navigate(`/clients/${id}`)}
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

                    <Grid container spacing={3}>
                        
                        {/* COLONNE GAUCHE */}
                        <Grid item xs={12} md={4}>
                            <Stack spacing={3}>
                                
                                <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            badgeContent={
                                                <IconButton 
                                                    onClick={() => photoRef.current.click()}
                                                    sx={{ bgcolor: '#6366f1', color: 'white', '&:hover': { bgcolor: '#4f46e5' }, border: '3px solid #fff' }}
                                                    size="small"
                                                >
                                                    <PhotoCameraIcon fontSize="small" />
                                                </IconButton>
                                            }
                                        >
                                            <Avatar 
                                                src={photoPreview} 
                                                sx={{ width: 150, height: 150, border: '4px solid #F1F5F9', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
                                            >
                                                {isPhysique ? <PersonIcon sx={{ fontSize: 80 }} /> : <BusinessIcon sx={{ fontSize: 80 }} />}
                                            </Avatar>
                                        </Badge>
                                        <input 
                                            type="file" 
                                            hidden 
                                            ref={photoRef} 
                                            onChange={(e) => handleFileChange('photo', e)} 
                                            accept="image/*" 
                                        />
                                        <Typography variant="h6" sx={{ mt: 2, fontWeight: '800' }}>Photo de profil</Typography>
                                    </CardContent>
                                </Card>
                                
                                {isPhysique ? (
                                    <>
                                        <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                            <CardContent>
                                                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Signature</Typography>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                    {signaturePreview && (
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
                                        
                                        <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                            <CardContent>
                                                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Documents CNI</Typography>
                                                <Stack spacing={2}>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Recto CNI</Typography>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            {cniRectoPreview && (
                                                                <Avatar 
                                                                    variant="rounded"
                                                                    src={cniRectoPreview}
                                                                    sx={{ width: 60, height: 60 }}
                                                                />
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
                                                                <Avatar 
                                                                    variant="rounded"
                                                                    src={cniVersoPreview}
                                                                    sx={{ width: 60, height: 60 }}
                                                                />
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
                                ) : (
                                    <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Gérants</Typography>
                                            <Stack spacing={2}>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Gérant Principal</Typography>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        {gerantPreviews[0] && (
                                                            <Avatar 
                                                                src={gerantPreviews[0]}
                                                                sx={{ width: 60, height: 60 }}
                                                            />
                                                        )}
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<PhotoCameraIcon />}
                                                            onClick={() => gerantPhotoRefs[0].current.click()}
                                                        >
                                                            {gerantPreviews[0] ? 'Changer' : 'Ajouter'}
                                                        </Button>
                                                        <input 
                                                            type="file" 
                                                            hidden 
                                                            ref={gerantPhotoRefs[0]} 
                                                            onChange={(e) => handleGerantPhotoChange(0, e)} 
                                                            accept="image/*" 
                                                        />
                                                    </Stack>
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Gérant Secondaire</Typography>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        {gerantPreviews[1] && (
                                                            <Avatar 
                                                                src={gerantPreviews[1]}
                                                                sx={{ width: 60, height: 60 }}
                                                            />
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
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                )}
                                
                                <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Localisation</Typography>
                                        
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Photo domicile</Typography>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                {domicilePreview && (
                                                    <Avatar 
                                                        variant="rounded"
                                                        src={domicilePreview}
                                                        sx={{ width: 60, height: 60 }}
                                                    />
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
                                                    <Avatar 
                                                        variant="rounded"
                                                        src={activitePreview}
                                                        sx={{ width: 60, height: 60 }}
                                                    />
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
                                
                                {!isPhysique && (
                                    <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Signataires</Typography>
                                            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                                                <Tab label="1" />
                                                <Tab label="2" />
                                                <Tab label="3" />
                                            </Tabs>
                                            <Box>
                                                <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Photo Signataire {activeTab + 1}</Typography>
                                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                                    {signatairePreviews[activeTab] && (
                                                        <Avatar 
                                                            src={signatairePreviews[activeTab]}
                                                            sx={{ width: 60, height: 60 }}
                                                        />
                                                    )}
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<PhotoCameraIcon />}
                                                        onClick={() => signatairePhotoRefs[activeTab].current.click()}
                                                    >
                                                        {signatairePreviews[activeTab] ? 'Changer' : 'Ajouter'}
                                                    </Button>
                                                    <input 
                                                        type="file" 
                                                        hidden 
                                                        ref={signatairePhotoRefs[activeTab]} 
                                                        onChange={(e) => handleSignatairePhotoChange(activeTab, e)} 
                                                        accept="image/*" 
                                                    />
                                                </Stack>
                                                <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>Signature Signataire {activeTab + 1}</Typography>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    {signatureSignatairePreviews[activeTab] && (
                                                        <Avatar 
                                                            variant="rounded"
                                                            src={signatureSignatairePreviews[activeTab]}
                                                            sx={{ width: 60, height: 60 }}
                                                        />
                                                    )}
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<PhotoCameraIcon />}
                                                        onClick={() => signatureSignataireRefs[activeTab].current.click()}
                                                    >
                                                        {signatureSignatairePreviews[activeTab] ? 'Changer' : 'Ajouter'}
                                                    </Button>
                                                    <input 
                                                        type="file" 
                                                        hidden 
                                                        ref={signatureSignataireRefs[activeTab]} 
                                                        onChange={(e) => handleSignatureSignataireChange(activeTab, e)} 
                                                        accept="image/*" 
                                                    />
                                                </Stack>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                )}
                                
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
                                
                            </Stack>
                        </Grid>

                        {/* COLONNE DROITE */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ borderRadius: 5, p: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                
                                <Typography variant="h6" fontWeight="800" gutterBottom>
                                    {isPhysique ? 'Informations Personnelles' : 'Informations Entreprise'}
                                </Typography>
                                <Divider sx={{ mb: 3 }} />
                                
                                <Grid container spacing={2}>
                                    {isPhysique ? (
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
                                                <TextField 
                                                    fullWidth 
                                                    label="Forme Juridique" 
                                                    name="forme_juridique" 
                                                    value={formDataState.morale?.forme_juridique || ''} 
                                                    onChange={(e) => handleNestedChange('morale', e)} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    select
                                                    fullWidth 
                                                    label="Type d'entreprise" 
                                                    name="type_entreprise" 
                                                    value={formDataState.type_entreprise || ''} 
                                                    onChange={handleChange}
                                                >
                                                    <MenuItem value="entreprise">Entreprise</MenuItem>
                                                    <MenuItem value="association">Association</MenuItem>
                                                </TextField>
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
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Nom Signataire 1" 
                                                    name="nom_signataire" 
                                                    value={formDataState.morale?.nom_signataire || ''} 
                                                    onChange={(e) => handleNestedChange('morale', e)} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Téléphone Signataire 1" 
                                                    name="telephone_signataire" 
                                                    value={formDataState.morale?.telephone_signataire || ''} 
                                                    onChange={(e) => handleNestedChange('morale', e)} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Nom Signataire 2" 
                                                    name="nom_signataire2" 
                                                    value={formDataState.morale?.nom_signataire2 || ''} 
                                                    onChange={(e) => handleNestedChange('morale', e)} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Téléphone Signataire 2" 
                                                    name="telephone_signataire2" 
                                                    value={formDataState.morale?.telephone_signataire2 || ''} 
                                                    onChange={(e) => handleNestedChange('morale', e)} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Nom Signataire 3" 
                                                    name="nom_signataire3" 
                                                    value={formDataState.morale?.nom_signataire3 || ''} 
                                                    onChange={(e) => handleNestedChange('morale', e)} 
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth 
                                                    label="Téléphone Signataire 3" 
                                                    name="telephone_signataire3" 
                                                    value={formDataState.morale?.telephone_signataire3 || ''} 
                                                    onChange={(e) => handleNestedChange('morale', e)} 
                                                />
                                            </Grid>
                                        </>
                                    )}
                                </Grid>

                                {/* Champs supplémentaires pour physique */}
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

                                <Typography variant="h6" fontWeight="800" sx={{ mt: 4, mb: 1 }}>
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