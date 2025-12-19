import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Grid, Divider, Chip, 
    Button, Avatar, Card, CardContent, List, ListItem, ListItemText,
    IconButton, Skeleton, CircularProgress
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon, Edit as EditIcon, Person as PersonIcon,
    Business as BusinessIcon, PhotoCamera as PhotoCameraIcon,
    LocalPhone as PhoneIcon, Email as EmailIcon, Badge as BadgeIcon,
    Work as WorkIcon, LocationOn as LocationIcon, AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import apiClient from '../../services/api/ApiClient';
import Layout from '../../components/layout/Layout';

export default function DetailsClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await apiClient.get(`/clients/${id}`);
                // On vérifie que la donnée existe dans la réponse
                if (response.data && response.data.data) {
                    setClient(response.data.data);
                } else {
                    setError("Données non trouvées");
                }
            } catch (err) {
                console.error("Erreur API:", err);
                setError("Impossible de charger les détails du client.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    // Gestion des états de chargement et d'erreur
    if (loading) return (
        <Layout>
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress sx={{ color: '#6366f1' }} />
                <Typography sx={{ mt: 2 }}>Chargement du profil...</Typography>
            </Box>
        </Layout>
    );

    if (error || !client) return (
        <Layout>
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error" variant="h6">{error || "Client introuvable"}</Typography>
                <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Retour</Button>
            </Box>
        </Layout>
    );

    // Définition sécurisée des variables
    const isPhysique = client.type_client === 'physique';
    const detail = isPhysique ? (client.physique || {}) : (client.morale || {});
    const name = isPhysique ? detail?.nom_prenoms : detail?.raison_sociale;
    const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

    return (
        <Layout>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
                
                {/* --- HEADER ACTIONS --- */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ fontWeight: 'bold', color: '#64748b', textTransform: 'none' }}>
                        Retour
                    </Button>
                    <Button variant="contained" startIcon={<EditIcon />} sx={{ borderRadius: 2, background: activeGradient, textTransform: 'none', fontWeight: 'bold' }}>
                        Modifier le profil
                    </Button>
                </Box>

                {/* --- BANDEAU HORIZONTAL (PROFIL & SOLDE) --- */}
                <Paper sx={{ p: 4, borderRadius: 5, mb: 4, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', background: '#fff' }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar 
                                    // On cherche l'URL dans l'objet physique pour un client physique
                                    src={isPhysique ? client.physique?.photo_url : ""} 
                                    sx={{ width: 120, height: 120, border: '4px solid #F1F5F9', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                >
                                    {isPhysique ? <PersonIcon fontSize="large" /> : <BusinessIcon fontSize="large" />}
                                </Avatar>
                                <IconButton sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#fff', boxShadow: 2 }} size="small">
                                    <PhotoCameraIcon fontSize="small" color="primary" />
                                </IconButton>
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm>
                            <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B' }}>{name || "Nom inconnu"}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mt: 1 }}>
                                <Typography variant="body1" color="textSecondary" fontWeight="700">ID: {client.num_client}</Typography>
                                <Chip label={client.type_client?.toUpperCase()} size="small" sx={{ fontWeight: '800', bgcolor: '#6366f1', color: '#fff' }} />
                                <Chip label={client.taxable ? "TAXABLE" : "NON TAXABLE"} variant="outlined" size="small" sx={{ fontWeight: '800' }} />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={{ 
                                bgcolor: '#1E293B', p: 3, borderRadius: 4, color: '#fff', 
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                boxShadow: '0 8px 20px rgba(30, 41, 59, 0.15)'
                            }}>
                                <Box>
                                    <Typography variant="overline" sx={{ opacity: 0.6, fontWeight: 'bold' }}>Solde Initial</Typography>
                                    <Typography variant="h4" fontWeight="900">{client.solde_initial || 0} <small style={{fontSize: '0.8rem'}}>FCFA</small></Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 50, height: 50 }}>
                                    <WalletIcon sx={{ fontSize: 30 }} />
                                </Avatar>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                <Grid container spacing={3}>
                    {/* Colonne Gauche */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ borderRadius: 5, p: 2, mb: 3 }}>
                            <CardContent>
                                <SectionTitle icon={<PhoneIcon sx={{fontSize: 20}} />} title="Contact Rapide" />
                                <List dense>
                                    <ListItem disableGutters>
                                        <ListItemText primary="Téléphone" secondary={client.telephone || "—"} primaryTypographyProps={{fontWeight: '800'}} />
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <ListItemText primary="Email" secondary={client.email || '—'} primaryTypographyProps={{fontWeight: '800'}} />
                                    </ListItem>
                                </List>
                                <Divider sx={{my: 2}} />
                                <StackStat label="Interdit Chéquier" value={client.interdit_chequier ? 'OUI' : 'NON'} color={client.interdit_chequier ? '#ef4444' : '#22c55e'} />
                                <StackStat label="Mandataire" value={client.mandataire ? 'OUI' : 'NON'} color="#334155" />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Colonne Droite - Détails */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ borderRadius: 5, p: 4, border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                            <SectionTitle icon={<BadgeIcon />} title="Identité & Filiation" />
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                <DataField label="Sexe" value={detail?.sexe === 'M' ? 'Masculin' : 'Féminin'} />
                                <DataField label="Nationalité" value={detail?.nationalite} />
                                <DataField label="Né(e) le" value={detail?.date_naissance} />
                                <DataField label="Lieu" value={detail?.lieu_naissance} />
                                <DataField label="CNI" value={detail?.cni1} />
                                <DataField label="Père" value={detail?.nom_pere} />
                                <DataField label="Mère" value={detail?.nom_mere} />
                                <DataField label="Situation Fam." value={detail?.situation_familiale} />
                                 <DataField label="regime matrimonial" value={detail?.regime_matrimonial} />
                               
                            </Grid>

                            <SectionTitle icon={<WorkIcon />} title="Professionnel" />
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                <DataField label="Profession" value={detail?.profession} />
                                <DataField label="Employeur" value={detail?.employeur} />
                                <DataField label="Tél Bureau" value={client?.tel_bureau} />
                                <DataField label="Gestionnaire" value={client?.gestionnaire} />
                            </Grid>

                            <SectionTitle icon={<LocationIcon />} title="Localisation" />
                            <Grid container spacing={2}>
                                <DataField label="Ville" value={client?.adresse_ville} />
                                <DataField label="Quartier" value={client?.adresse_quartier} />
                                <DataField label="Boîte Postale" value={client?.bp} />
                            </Grid>
                             <SectionTitle icon={<LocationIcon />} title="information du conjoint" />
                            <Grid container spacing={2}>
                                <DataField label="nom Conjoint" value={client?.nom_conjoint} />
                                <DataField label="cni conjoint" value={client?.cni_conjoint} />
                                <DataField label="date naissance  conjoint" value={client?.date_naissance_conjoint} />

                                <DataField label=" profession conjoint " value={client?.profession_conjoint} />
                                 <DataField label="salaire conjoint" value={client?.salaire} />

                                 <DataField label="telephone conjoint" value={client?.tel_conjoint} />

                                
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
}

// --- SOUS-COMPOSANTS ---
function SectionTitle({ icon, title }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ color: '#6366f1', display: 'flex' }}>{icon}</Box>
            <Typography variant="subtitle1" fontWeight="900" sx={{ color: '#1E293B', textTransform: 'uppercase', fontSize: '0.85rem' }}>{title}</Typography>
        </Box>
    );
}

function DataField({ label, value }) {
    return (
        <Grid item xs={12} sm={4}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>{label}</Typography>
            <Typography variant="body2" sx={{ color: '#334155', fontWeight: '700' }}>{value || "—"}</Typography>
        </Grid>
    );
}

function StackStat({ label, value, color }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, p: 1, borderRadius: 2, bgcolor: '#F8FAFC' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{label}</Typography>
            <Typography variant="caption" fontWeight="900" sx={{ color: color }}>{value}</Typography>
        </Box>
    );
}