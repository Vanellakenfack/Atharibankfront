import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Grid, Divider, Chip, 
    Button, Avatar, Card, CardContent, List, ListItem, ListItemText
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    Event as EventIcon,
    Public as PublicIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import Header from '../../components/layout/TopBar';
import apiClient from '../../services/api/ApiClient';

export default function DetailsClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await apiClient.get(`/clients/${id}`);
                setClient(response.data.data);
            } catch (error) {
                console.error("Erreur API:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return <Typography sx={{ p: 4 }}>Chargement des données...</Typography>;
    if (!client) return <Typography sx={{ p: 4 }}>Client non trouvé.</Typography>;

    const isPhysique = client.type_client === 'physique';
    const detail = isPhysique ? client.physique : client.morale;
    const name = isPhysique ? detail?.nom_prenoms : detail?.raison_sociale;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F4F7FE', pb: 5 }}>
            <Header />
            
            <Box sx={{ px: { xs: 2, md: 6 }, py: 3 }}>
                {/* Header d'action */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                        Retour
                    </Button>
                    <Button variant="contained" startIcon={<EditIcon />} sx={{ borderRadius: 2 }}>
                        Modifier le profil
                    </Button>
                </Box>

                {/* --- SECTION 1: ENTÊTE PRINCIPALE --- */}
                <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <Avatar sx={{ width: 80, height: 80, bgcolor: isPhysique ? '#4A3AFF' : '#00C58E' }}>
                                {isPhysique ? <PersonIcon fontSize="large" /> : <BusinessIcon fontSize="large" />}
                            </Avatar>
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h5" fontWeight="800">{name}</Typography>
                            <Typography color="textSecondary">Code Client : {client.num_client}</Typography>
                            <Box sx={{ mt: 1 }}>
                                <Chip label={client.type_client.toUpperCase()} size="small" color="primary" sx={{ mr: 1 }} />
                                <Chip label={client.agency?.name} size="small" variant="outlined" icon={<InfoIcon />} />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                <Grid container spacing={3}>
                    {/* --- SECTION 2: INFOS PERSONNELLES / MORALES --- */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{ borderRadius: 3, mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom fontWeight="700">Détails de l'identité</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    {isPhysique ? (
                                        <>
                                            <DataField label="Nom complet" value={detail.nom_prenoms} />
                                            <DataField label="Sexe" value={detail.sexe === 'M' ? 'Masculin' : 'Féminin'} />
                                            <DataField label="Date de naissance" value={detail.date_naissance} />
                                            <DataField label="Lieu de naissance" value={detail.lieu_naissance} />
                                            <DataField label="Nationalité" value={detail.nationalite} />
                                            <DataField label="N° CNI" value={detail.cni_numero} />
                                            <DataField label="Délivrée le" value={detail.cni_delivrance} />
                                            <DataField label="Expire le" value={detail.cni_expiration} />
                                            <DataField label="Profession" value={detail.profession} />
                                            <DataField label="Employeur" value={detail.employeur} />
                                            <DataField label="Situation Familiale" value={detail.situation_familiale} />
                                            <DataField label="Régime Matrimonial" value={detail.regime_matrimonial} />
                                            <DataField label="Nom Père" value={detail.nom_pere} />
                                            <DataField label="Nom Mère" value={detail.nom_mere} />
                                        </>
                                    ) : (
                                        <>
                                            <DataField label="Raison Sociale" value={detail.raison_sociale} />
                                            <DataField label="N° RCCM" value={detail.rccm} />
                                            <DataField label="N° NIU" value={detail.niu} />
                                        </>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>

                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom fontWeight="700">Localisation & Contact</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    <DataField label="Téléphone" value={client.telephone} />
                                    <DataField label="Email" value={client.email} />
                                    <DataField label="Ville" value={client.adresse_ville} />
                                    <DataField label="Quartier" value={client.adresse_quartier} />
                                    <DataField label="Boite Postale" value={client.bp} />
                                    <DataField label="Pays" value={client.pays_residence} />
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* --- SECTION 3: STATUTS ET AGENCE --- */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ borderRadius: 3, mb: 3, bgcolor: '#1E293B', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Statut Financier</Typography>
                                <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>Solde Initial</Typography>
                                    <Typography variant="h5" fontWeight="bold">{client.solde_initial} FCFA</Typography>
                                </Box>
                                <StackStat label="Taxable" value={client.taxable === 1 ? 'OUI' : 'NON'} color={client.taxable ? '#F59E0B' : '#10B981'} />
                                <StackStat label="Interdit Chéquier" value={client.interdit_chequier === 1 ? 'OUI' : 'NON'} color={client.interdit_chequier ? '#EF4444' : '#10B981'} />
                            </CardContent>
                        </Card>

                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom fontWeight="700">Agence de rattachement</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <List disablePadding>
                                    <ListItem disableGutters>
                                        <ListItemText primary="Nom" secondary={client.agency?.name} />
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <ListItemText primary="Code" secondary={client.agency?.code} />
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <ListItemText primary="Sigle" secondary={client.agency?.short_name} />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

// Sous-composant pour l'affichage propre des champs
function DataField({ label, value }) {
    return (
        <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {label}
            </Typography>
            <Typography variant="body1" fontWeight="600">
                {value || <Typography component="span" variant="body2" color="error" sx={{ fontStyle: 'italic', opacity: 0.5 }}>Non renseigné</Typography>}
            </Typography>
        </Grid>
    );
}

// Sous-composant pour les statuts colorés
function StackStat({ label, value, color }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
            <Typography variant="body2">{label}</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ color: color, bgcolor: 'rgba(255,255,255,0.05)', px: 1, borderRadius: 1 }}>
                {value}
            </Typography>
        </Box>
    );
}