import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Grid, TextField, Button, 
    Divider, CircularProgress, Switch, FormControlLabel,
    Card, CardContent, MenuItem, Avatar, IconButton, Badge
} from '@mui/material';
import { 
    Save as SaveIcon, 
    ArrowBack as ArrowBackIcon, 
    PhotoCamera as PhotoCameraIcon,
    Person as PersonIcon,
    Business as BusinessIcon 
} from '@mui/icons-material';
import apiClient from '../../services/api/ApiClient';
import Layout from '../../components/layout/Layout';

export default function ModifierClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    
    const [formData, setFormData] = useState({
        telephone: '', email: '', adresse_ville: '', adresse_quartier: '',
        bp: '', pays_residence: '', taxable: false, interdit_chequier: false,
        physique: {}, morale: {}
    });

    useEffect(() => {
        const fetchClient = async () => {
            try {
                const response = await apiClient.get(`/clients/${id}`);
                const data = response.data.data;
                setFormData({
                    ...data,
                    taxable: data.taxable === 1,
                    interdit_chequier: data.interdit_chequier === 1,
                    physique: data.physique || {},
                    morale: data.morale || {}
                });
                
                // Pré-remplir la prévisualisation si une photo existe déjà
                if (data.type_client === 'physique' && data.physique?.photo_url) {
                    setPhotoPreview(data.physique.photo_url);
                }
            } catch (error) { 
                console.error("Erreur lors de la récupération:", error); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchClient();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (type, e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [type]: { ...prev[type], [name]: value }
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            // Utilisation de FormData pour supporter l'envoi de fichier avec PUT (via _method)
            const dataToSend = new FormData();
            dataToSend.append('_method', 'PUT'); // Trick Laravel pour le multipart en PUT
            
            // Champs de base
            dataToSend.append('telephone', formData.telephone || '');
            dataToSend.append('email', formData.email || '');
            dataToSend.append('adresse_ville', formData.adresse_ville || '');
            dataToSend.append('adresse_quartier', formData.adresse_quartier || '');
            dataToSend.append('bp', formData.bp || '');
            dataToSend.append('pays_residence', formData.pays_residence || '');
            dataToSend.append('taxable', formData.taxable ? 1 : 0);
            dataToSend.append('interdit_chequier', formData.interdit_chequier ? 1 : 0);

            // Champs spécifiques (Physique ou Moral)
            if (formData.type_client === 'physique') {
                Object.keys(formData.physique).forEach(key => {
                    if (key !== 'photo' && key !== 'photo_url') {
                        dataToSend.append(`physique[${key}]`, formData.physique[key] || '');
                    }
                });
                // Ajout de la photo si sélectionnée
                if (fileInputRef.current?.files[0]) {
                    dataToSend.append('photo', fileInputRef.current.files[0]);
                }
            } else {
                Object.keys(formData.morale).forEach(key => {
                    dataToSend.append(`morale[${key}]`, formData.morale[key] || '');
                });
            }

            await apiClient.post(`/clients/${id}`, dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            navigate(`/clients/${id}`);
        } catch (error) { 
            console.error("Erreur lors de la sauvegarde:", error); 
        } finally { 
            setSaving(false); 
        }
    };

    if (loading) return (
        <Layout>
            <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        </Layout>
    );

    const isPhysique = formData.type_client === 'physique';
    const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

    return (
        <Layout>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
                <form onSubmit={handleSubmit}>
                    
                    {/* HEADER ACTIONS */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B' }}>
                                Modifier {isPhysique ? 'le Profil' : "l'Entreprise"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                ID Client: <strong>{formData.num_client}</strong>
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                                variant="outlined" 
                                startIcon={<ArrowBackIcon />} 
                                onClick={() => navigate(-1)}
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
                        
                        {/* COLONNE GAUCHE - PHOTO & STATUS */}
                        <Grid item xs={12} md={4}>
                            <Card sx={{ borderRadius: 5, mb: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        badgeContent={
                                            <IconButton 
                                                onClick={() => fileInputRef.current.click()}
                                                sx={{ bgcolor: '#6366f1', color: 'white', '&:hover': { bgcolor: '#4f46e5' }, border: '4px solid #fff' }}
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
                                        ref={fileInputRef} 
                                        onChange={handlePhotoChange} 
                                        accept="image/*" 
                                    />
                                    <Typography variant="h6" sx={{ mt: 2, fontWeight: '800' }}>Photo de Profil</Typography>
                                    <Typography variant="caption" color="textSecondary">Format conseillé: JPG, PNG (Max 2Mo)</Typography>
                                </CardContent>
                            </Card>

                            <Card sx={{ borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Paramètres de Gestion</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <FormControlLabel
                                        control={<Switch checked={formData.taxable} onChange={(e) => setFormData({...formData, taxable: e.target.checked})} />}
                                        label={<Typography fontWeight="700">Assujetti aux Taxes</Typography>}
                                    />
                                    <FormControlLabel
                                        control={<Switch checked={formData.interdit_chequier} color="error" onChange={(e) => setFormData({...formData, interdit_chequier: e.target.checked})} />}
                                        label={<Typography fontWeight="700">Interdit de Chéquier</Typography>}
                                        sx={{ mt: 1 }}
                                    />
                                    <TextField fullWidth label="Pays de Résidence" name="pays_residence" sx={{ mt: 3 }} value={formData.pays_residence || ''} onChange={handleInputChange} />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* COLONNE DROITE - FORMULAIRE DÉTAILLÉ */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ borderRadius: 5, p: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                                <Typography variant="h6" fontWeight="800" gutterBottom>Informations Générales</Typography>
                                <Divider sx={{ mb: 3 }} />
                                
                                <Grid container spacing={2}>
                                    {isPhysique ? (
                                        <>
                                            <Grid item xs={12} md={8}><TextField fullWidth label="Nom et Prénoms" name="nom_prenoms" value={formData.physique.nom_prenoms || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                            <Grid item xs={12} md={4}><TextField select fullWidth label="Sexe" name="sexe" value={formData.physique.sexe || ''} onChange={(e) => handleNestedChange('physique', e)}><MenuItem value="M">Masculin</MenuItem><MenuItem value="F">Féminin</MenuItem></TextField></Grid>
                                            <Grid item xs={12} md={6}><TextField fullWidth label="Nationalité" name="nationalite" value={formData.physique.nationalite || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                            <Grid item xs={12} md={6}><TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="Date de Naissance" name="date_naissance" value={formData.physique.date_naissance || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                            <Grid item xs={12} md={6}><TextField fullWidth label="Profession" name="profession" value={formData.physique.profession || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                            <Grid item xs={12} md={6}><TextField fullWidth label="Employeur" name="employeur" value={formData.physique.employeur || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                        </>
                                    ) : (
                                        <>
                                            <Grid item xs={12} md={12}><TextField fullWidth label="Raison Sociale" name="raison_sociale" value={formData.morale.raison_sociale || ''} onChange={(e) => handleNestedChange('morale', e)} /></Grid>
                                            <Grid item xs={12} md={6}><TextField fullWidth label="RCCM" name="rccm" value={formData.morale.rccm || ''} onChange={(e) => handleNestedChange('morale', e)} /></Grid>
                                            <Grid item xs={12} md={6}><TextField fullWidth label="NIU" name="niu" value={formData.morale.niu || ''} onChange={(e) => handleNestedChange('morale', e)} /></Grid>
                                        </>
                                    )}
                                </Grid>

                                <Typography variant="h6" fontWeight="800" sx={{ mt: 4, mb: 1 }}>Coordonnées & Localisation</Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}><TextField fullWidth label="Téléphone" name="telephone" value={formData.telephone || ''} onChange={handleInputChange} /></Grid>
                                    <Grid item xs={12} md={6}><TextField fullWidth label="Email" name="email" value={formData.email || ''} onChange={handleInputChange} /></Grid>
                                    <Grid item xs={12} md={4}><TextField fullWidth label="Ville" name="adresse_ville" value={formData.adresse_ville || ''} onChange={handleInputChange} /></Grid>
                                    <Grid item xs={12} md={4}><TextField fullWidth label="Quartier" name="adresse_quartier" value={formData.adresse_quartier || ''} onChange={handleInputChange} /></Grid>
                                    <Grid item xs={12} md={4}><TextField fullWidth label="Boite Postale" name="bp" value={formData.bp || ''} onChange={handleInputChange} /></Grid>
                                </Grid>

                                 <Typography variant="h6" fontWeight="800" sx={{ mt: 4, mb: 1 }}>information du conjoint </Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}><TextField fullWidth label="Nom conjoint" name="nom_conjoint" value={formData.nom_conjoint || ''} onChange={handleInputChange} /></Grid>
                                    <Grid item xs={12} md={6}><TextField fullWidth type="date" name="date_naissance_conjoint"InputLabelProps={{ shrink: true }} value={formData.date_naissance_conjoint || ''} onChange={handleInputChange} /></Grid>
                                    <Grid item xs={12} md={4}><TextField fullWidth label="cni conjoint" name="cni_conjoint" value={formData.cni_conjoint || ''} onChange={handleInputChange} /></Grid>
                                    <Grid item xs={12} md={4}><TextField fullWidth label="salaire" name="salaire" value={formData.salaire|| ''} onChange={handleInputChange} /></Grid>
                                    <Grid item xs={12} md={4}><TextField fullWidth label=" profession conjoint" name="profession_conjoint" value={formData.profession_conjoint || ''} onChange={handleInputChange} /></Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Layout>
    );
}