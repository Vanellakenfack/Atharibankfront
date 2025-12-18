import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Grid, TextField, Button, 
    Divider, CircularProgress, Switch, FormControlLabel,
    Breadcrumbs, Link, Card, CardContent, MenuItem
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Header from '../../components/layout/TopBar';
import apiClient from '../../services/api/ApiClient';

export default function ModifierClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
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
            } catch (error) { console.error(error); } finally { setLoading(false); }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                taxable: formData.taxable ? 1 : 0,
                interdit_chequier: formData.interdit_chequier ? 1 : 0
            };
            await apiClient.put(`/clients/${id}`, payload);
            navigate(`/clients/${id}`);
        } catch (error) { console.error(error); } finally { setSaving(false); }
    };

    if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    const isPhysique = formData.type_client === 'physique';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F4F7FE' }}>
            <Header />
            <Box sx={{ px: { xs: 2, md: 6 }, py: 4 }}>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" fontWeight="800">Modifier {isPhysique ? 'le Particulier' : "l'Entreprise"}</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Annuler</Button>
                            <Button variant="contained" type="submit" startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />} disabled={saving}>
                                Sauvegarder
                            </Button>
                        </Box>
                    </Box>

                    <Grid container spacing={3}>
                        {/* INFOS IDENTITÉ */}
                        <Grid item xs={12} md={8}>
                            <Card sx={{ borderRadius: 3, mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom fontWeight="700">Identité Complète</Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    <Grid container spacing={2}>
                                        {isPhysique ? (
                                            <>
                                                <Grid item xs={12} md={6}><TextField fullWidth label="Nom et Prénoms" name="nom_prenoms" value={formData.physique.nom_prenoms || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                                <Grid item xs={12} md={3}><TextField select fullWidth label="Sexe" name="sexe" value={formData.physique.sexe || ''} onChange={(e) => handleNestedChange('physique', e)}><MenuItem value="M">Masculin</MenuItem><MenuItem value="F">Féminin</MenuItem></TextField></Grid>
                                                <Grid item xs={12} md={3}><TextField fullWidth label="Nationalité" name="nationalite" value={formData.physique.nationalite || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                                <Grid item xs={12} md={6}><TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="Date de Naissance" name="date_naissance" value={formData.physique.date_naissance || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                                <Grid item xs={12} md={6}><TextField fullWidth label="Lieu de Naissance" name="lieu_naissance" value={formData.physique.lieu_naissance || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                                <Grid item xs={12} md={4}><TextField fullWidth label="N° CNI" name="cni_numero" value={formData.physique.cni_numero || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                                <Grid item xs={12} md={4}><TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="CNI Délivrance" name="cni_delivrance" value={formData.physique.cni_delivrance || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                                <Grid item xs={12} md={4}><TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="CNI Expiration" name="cni_expiration" value={formData.physique.cni_expiration || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                                <Grid item xs={12} md={6}><TextField fullWidth label="Nom du Père" name="nom_pere" value={formData.physique.nom_pere || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                                <Grid item xs={12} md={6}><TextField fullWidth label="Nom de la Mère" name="nom_mere" value={formData.physique.nom_mere || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                                <Grid item xs={12} md={6}><TextField fullWidth label="Profession" name="profession" value={formData.physique.profession || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                                <Grid item xs={12} md={6}><TextField fullWidth label="Employeur" name="employeur" value={formData.physique.employeur || ''} onChange={(e) => handleNestedChange('physique', e)} /></Grid>
                                            </>
                                        ) : (
                                            <>
                                                <Grid item xs={12} md={6}><TextField fullWidth label="Raison Sociale" name="raison_sociale" value={formData.morale.raison_sociale || ''} onChange={(e) => handleNestedChange('morale', e)} /></Grid>
                                                <Grid item xs={12} md={6}><TextField fullWidth label="RCCM" name="rccm" value={formData.morale.rccm || ''} onChange={(e) => handleNestedChange('morale', e)} /></Grid>
                                                <Grid item xs={12} md={6}><TextField fullWidth label="NIU" name="niu" value={formData.morale.niu || ''} onChange={(e) => handleNestedChange('morale', e)} /></Grid>
                                            </>
                                        )}
                                    </Grid>
                                </CardContent>
                            </Card>

                            <Card sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom fontWeight="700">Contact & Adresse</Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}><TextField fullWidth label="Téléphone" name="telephone" value={formData.telephone || ''} onChange={handleInputChange} /></Grid>
                                        <Grid item xs={12} md={6}><TextField fullWidth label="Email" name="email" value={formData.email || ''} onChange={handleInputChange} /></Grid>
                                        <Grid item xs={12} md={4}><TextField fullWidth label="Ville" name="adresse_ville" value={formData.adresse_ville || ''} onChange={handleInputChange} /></Grid>
                                        <Grid item xs={12} md={4}><TextField fullWidth label="Quartier" name="adresse_quartier" value={formData.adresse_quartier || ''} onChange={handleInputChange} /></Grid>
                                        <Grid item xs={12} md={4}><TextField fullWidth label="Boite Postale" name="bp" value={formData.bp || ''} onChange={handleInputChange} /></Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* STATUTS FINANCIERS */}
                        <Grid item xs={12} md={4}>
                            <Card sx={{ borderRadius: 3, mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom fontWeight="700">Paramètres de Gestion</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <FormControlLabel
                                        control={<Switch checked={formData.taxable} onChange={(e) => setFormData({...formData, taxable: e.target.checked})} />}
                                        label="Assujetti aux Taxes"
                                    />
                                    <FormControlLabel
                                        control={<Switch checked={formData.interdit_chequier} color="error" onChange={(e) => setFormData({...formData, interdit_chequier: e.target.checked})} />}
                                        label="Interdit de Chéquier"
                                        sx={{ mt: 1 }}
                                    />
                                    <TextField fullWidth label="Pays de Résidence" name="pays_residence" sx={{ mt: 3 }} value={formData.pays_residence || ''} onChange={handleInputChange} />
                                    <TextField fullWidth label="Solde Initial" disabled sx={{ mt: 2 }} value={formData.solde_initial} />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Box>
    );
}