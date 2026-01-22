import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Grid, Divider, Chip, 
    Button, Avatar, Card, CardContent, List, ListItem, ListItemText,
    IconButton, CircularProgress, Stack, ImageList, ImageListItem, Alert,
    Dialog, DialogContent, DialogTitle, CardMedia
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon, Edit as EditIcon, Person as PersonIcon,
    Business as BusinessIcon, PhotoCamera as PhotoCameraIcon,
    LocalPhone as PhoneIcon, Email as EmailIcon, Badge as BadgeIcon,
    Work as WorkIcon, LocationOn as LocationIcon, AccountBalanceWallet as WalletIcon,
    Home as HomeIcon, BusinessCenter as BusinessCenterIcon, CameraAlt as CameraIcon,
    Close as CloseIcon, ZoomIn as ZoomInIcon,
    CreditCard as CreditCardIcon // Nouvelle icône pour CNI
} from '@mui/icons-material';
import apiClient from '../../services/api/ApiClient';
import Layout from '../../components/layout/Layout';

export default function DetailsClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // États pour les modales d'aperçu
    const [openDomicileModal, setOpenDomicileModal] = useState(false);
    const [openActiviteModal, setOpenActiviteModal] = useState(false);
    const [openPhotoModal, setOpenPhotoModal] = useState(false);
    const [openSignatureModal, setOpenSignatureModal] = useState(false);
    const [openCniRectoModal, setOpenCniRectoModal] = useState(false);
    const [openCniVersoModal, setOpenCniVersoModal] = useState(false);
    
    // URLs des images pour les modales
    const [currentImage, setCurrentImage] = useState(null);
    const [currentImageTitle, setCurrentImageTitle] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await apiClient.get(`/clients/${id}`);
                console.log('Données reçues:', response.data);
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

    const handleOpenModal = (imageUrl, title) => {
        setCurrentImage(imageUrl);
        setCurrentImageTitle(title);
        
        switch(title) {
            case 'Photo domicile':
                setOpenDomicileModal(true);
                break;
            case 'Photo activité':
                setOpenActiviteModal(true);
                break;
            case 'Photo du client':
                setOpenPhotoModal(true);
                break;
            case 'Signature':
                setOpenSignatureModal(true);
                break;
            case 'CNI Recto':
                setOpenCniRectoModal(true);
                break;
            case 'CNI Verso':
                setOpenCniVersoModal(true);
                break;
        }
    };

    const handleCloseDomicileModal = () => {
        setOpenDomicileModal(false);
        setCurrentImage(null);
        setCurrentImageTitle('');
    };

    const handleCloseActiviteModal = () => {
        setOpenActiviteModal(false);
        setCurrentImage(null);
        setCurrentImageTitle('');
    };

    const handleClosePhotoModal = () => {
        setOpenPhotoModal(false);
        setCurrentImage(null);
        setCurrentImageTitle('');
    };

    const handleCloseSignatureModal = () => {
        setOpenSignatureModal(false);
        setCurrentImage(null);
        setCurrentImageTitle('');
    };

    const handleCloseCniRectoModal = () => {
        setOpenCniRectoModal(false);
        setCurrentImage(null);
        setCurrentImageTitle('');
    };

    const handleCloseCniVersoModal = () => {
        setOpenCniVersoModal(false);
        setCurrentImage(null);
        setCurrentImageTitle('');
    };

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
                <Alert severity="error" sx={{ mb: 2 }}>{error || "Client introuvable"}</Alert>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2 }}>Retour</Button>
            </Box>
        </Layout>
    );

    const isPhysique = client.type_client === 'physique';
    const detail = isPhysique ? (client.physique || {}) : (client.morale || {});
    const name = isPhysique ? detail?.nom_prenoms : detail?.raison_sociale;
    
    // URLs des photos - construction manuelle si les URLs ne sont pas fournies
    const getFullUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        if (path.startsWith('/storage/')) return `http://localhost:8000${path}`;
        return `http://localhost:8000/storage/${path}`;
    };

    const photoUrl = isPhysique ? getFullUrl(client.physique?.photo || client.physique?.photo_url) : null;
    const signatureUrl = isPhysique ? getFullUrl(client.physique?.signature || client.physique?.signature_url) : null;
    const domicilePhotoUrl = getFullUrl(client.photo_localisation_domicile || client.photo_localisation_domicile_url);
    const activitePhotoUrl = getFullUrl(client.photo_localisation_activite || client.photo_localisation_activite_url);
    
    // URLs pour CNI recto et verso
    const cniRectoUrl = isPhysique ? getFullUrl(client.physique?.cni_recto || client.physique?.cni_recto_url) : null;
    const cniVersoUrl = isPhysique ? getFullUrl(client.physique?.cni_verso || client.physique?.cni_verso_url) : null;

    return (
        <Layout>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
                
                {/* --- HEADER ACTIONS --- */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Button 
                        startIcon={<ArrowBackIcon />} 
                        onClick={() => navigate('/client')} 
                        sx={{ fontWeight: 'bold', color: '#64748b', textTransform: 'none' }}
                    >
                        Retour à la liste
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<EditIcon />} 
                        onClick={() => navigate(`/client/${id}/edit`)}
                        sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', textTransform: 'none', fontWeight: 'bold' }}
                    >
                        Modifier le profil
                    </Button>
                </Box>

                {/* --- BANDEAU PROFIL --- */}
                <Paper sx={{ p: 4, borderRadius: 5, mb: 4, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', background: '#fff' }}>
                    <Grid container spacing={3} alignItems="center">
                        {/* Photo */}
                        <Grid item>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar 
                                    src={photoUrl} 
                                    sx={{ 
                                        width: 120, 
                                        height: 120, 
                                        border: '4px solid #F1F5F9', 
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                        cursor: photoUrl ? 'pointer' : 'default',
                                        '&:hover': photoUrl ? { opacity: 0.9 } : {}
                                    }}
                                    onClick={() => photoUrl && handleOpenModal(photoUrl, 'Photo du client')}
                                >
                                    {isPhysique ? <PersonIcon fontSize="large" /> : <BusinessIcon fontSize="large" />}
                                </Avatar>
                                {photoUrl && (
                                    <IconButton
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            bottom: -8,
                                            right: -8,
                                            backgroundColor: 'white',
                                            border: '1px solid #e0e0e0',
                                            '&:hover': { backgroundColor: '#f5f5f5' }
                                        }}
                                        onClick={() => handleOpenModal(photoUrl, 'Photo du client')}
                                    >
                                        <ZoomInIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                        </Grid>

                        {/* Informations principales */}
                        <Grid item xs={12} sm>
                            <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B' }}>
                                {name || "Nom inconnu"}
                                {detail?.sigle && ` (${detail.sigle})`}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mt: 1 }}>
                                <Typography variant="body1" fontWeight="700" sx={{ color: '#6366f1' }}>
                                    ID: {client.num_client}
                                </Typography>
                                <Chip 
                                    label={client.type_client?.toUpperCase()} 
                                    size="small" 
                                    sx={{ fontWeight: '800', bgcolor: '#6366f1', color: '#fff' }} 
                                />
                                <Chip 
                                    label={client.etat === 'present' ? 'ACTIF' : 'SUPPRIMÉ'} 
                                    size="small" 
                                    color={client.etat === 'present' ? 'success' : 'error'}
                                />
                            </Box>
                            {!isPhysique && detail?.forme_juridique && (
                                <Typography variant="body1" sx={{ mt: 1, color: '#64748b' }}>
                                    {detail.forme_juridique}
                                </Typography>
                            )}
                        </Grid>

                        {/* Solde */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ 
                                bgcolor: '#1E293B', p: 3, borderRadius: 4, color: '#fff', 
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                boxShadow: '0 8px 20px rgba(30, 41, 59, 0.15)'
                            }}>
                                <Box>
                                    <Typography variant="overline" sx={{ opacity: 0.6, fontWeight: 'bold' }}>Solde Initial</Typography>
                                    <Typography variant="h4" fontWeight="900">
                                        {parseFloat(client.solde_initial || 0).toLocaleString('fr-FR')} 
                                        <small style={{fontSize: '0.8rem'}}> FCFA</small>
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 50, height: 50 }}>
                                    <WalletIcon sx={{ fontSize: 30 }} />
                                </Avatar>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                <Grid container spacing={3}>
                    {/* Colonne Gauche - Contact et Photos */}
                    <Grid item xs={12} md={4}>
                        {/* Contact */}
                        <Card sx={{ borderRadius: 5, p: 2, mb: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                            <CardContent>
                                <SectionTitle icon={<PhoneIcon />} title="Contact" />
                                <List dense>
                                    <ListItem disableGutters>
                                        <ListItemText 
                                            primary="Téléphone" 
                                            secondary={client.telephone || "Non renseigné"} 
                                            primaryTypographyProps={{fontWeight: '800', fontSize: '0.875rem'}}
                                            secondaryTypographyProps={{fontWeight: '500'}}
                                        />
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <ListItemText 
                                            primary="Email" 
                                            secondary={client.email || 'Non renseigné'} 
                                            primaryTypographyProps={{fontWeight: '800', fontSize: '0.875rem'}}
                                            secondaryTypographyProps={{fontWeight: '500'}}
                                        />
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <ListItemText 
                                            primary="Boîte Postale" 
                                            secondary={client.bp || 'Non renseignée'} 
                                            primaryTypographyProps={{fontWeight: '800', fontSize: '0.875rem'}}
                                            secondaryTypographyProps={{fontWeight: '500'}}
                                        />
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <ListItemText 
                                            primary="Pays de résidence" 
                                            secondary={client.pays_residence || 'Cameroun'} 
                                            primaryTypographyProps={{fontWeight: '800', fontSize: '0.875rem'}}
                                            secondaryTypographyProps={{fontWeight: '500'}}
                                        />
                                    </ListItem>
                                </List>
                                <Divider sx={{my: 2}} />
                                <StackStat label="Agence" value={client.agency?.name || client.agency?.code || 'Non assignée'} color="#6366f1" />
                            </CardContent>
                        </Card>

                        {/* Documents & Photos */}
                        <Card sx={{ borderRadius: 5, p: 2, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                            <CardContent>
                                <SectionTitle icon={<CameraIcon />} title="Documents & Photos" />
                                <Stack spacing={3} sx={{ maxWidth:350 }}>
                                    {/* Section CNI */}
                                    {isPhysique && (cniRectoUrl || cniVersoUrl) && (
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <CreditCardIcon fontSize="small" sx={{ color: '#6366f1' }} />
                                                <Typography variant="caption" fontWeight="700" color="textSecondary">
                                                    Carte Nationale d'Identité
                                                </Typography>
                                            </Box>
                                            <Grid container spacing={2}>
                                                {cniRectoUrl && (
                                                    <Grid item xs={6}>
                                                        <Box sx={{ position: 'relative' }}>
                                                            <Box 
                                                                component="img"
                                                                src={cniRectoUrl} 
                                                                alt="CNI Recto" 
                                                                sx={{ 
                                                                    width: '100%', 
                                                                    height: '120px', 
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #e2e8f0',
                                                                    cursor: 'pointer',
                                                                    objectFit: 'cover',
                                                                    '&:hover': { opacity: 0.8 }
                                                                }}
                                                                onClick={() => handleOpenModal(cniRectoUrl, 'CNI Recto')}
                                                            />
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    position: 'absolute',
                                                                    bottom: 8,
                                                                    right: 8,
                                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                                    border: '1px solid #e0e0e0',
                                                                    '&:hover': { backgroundColor: 'white' }
                                                                }}
                                                                onClick={() => handleOpenModal(cniRectoUrl, 'CNI Recto')}
                                                            >
                                                                <ZoomInIcon fontSize="small" />
                                                            </IconButton>
                                                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                                                                Recto
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                )}
                                                {cniVersoUrl && (
                                                    <Grid item xs={6}>
                                                        <Box sx={{ position: 'relative' }}>
                                                            <Box 
                                                                component="img"
                                                                src={cniVersoUrl} 
                                                                alt="CNI Verso" 
                                                                sx={{ 
                                                                    width: '100%', 
                                                                    height: '120px', 
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #e2e8f0',
                                                                    cursor: 'pointer',
                                                                    objectFit: 'cover',
                                                                    '&:hover': { opacity: 0.8 }
                                                                }}
                                                                onClick={() => handleOpenModal(cniVersoUrl, 'CNI Verso')}
                                                            />
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    position: 'absolute',
                                                                    bottom: 8,
                                                                    right: 8,
                                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                                    border: '1px solid #e0e0e0',
                                                                    '&:hover': { backgroundColor: 'white' }
                                                                }}
                                                                onClick={() => handleOpenModal(cniVersoUrl, 'CNI Verso')}
                                                            >
                                                                <ZoomInIcon fontSize="small" />
                                                            </IconButton>
                                                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                                                                Verso
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Box>
                                    )}

                                    {/* Photo du client */}
                                    {photoUrl && (
                                        <Box>
                                            <Typography variant="caption" fontWeight="700" color="textSecondary">
                                                Photo du client
                                            </Typography>
                                            <Box sx={{ position: 'relative', mt: 1 }}>
                                                <Box 
                                                    component="img"
                                                    src={photoUrl} 
                                                    alt="Photo client" 
                                                    sx={{ 
                                                        width: '50%', 
                                                        height: '150px', 
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0',
                                                        cursor: 'pointer',
                                                        '&:hover': { opacity: 0.8 }
                                                    }}
                                                    onClick={() => handleOpenModal(photoUrl, 'Photo du client')}
                                                />
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 8,
                                                        right: '25%',
                                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                                        border: '1px solid #e0e0e0',
                                                        '&:hover': { backgroundColor: 'white' }
                                                    }}
                                                    onClick={() => handleOpenModal(photoUrl, 'Photo du client')}
                                                >
                                                    <ZoomInIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    )}
                                    
                                    {/* Signature */}
                                    {signatureUrl && (
                                        <Box>
                                            <Typography variant="caption" fontWeight="700" color="textSecondary">
                                                Signature
                                            </Typography>
                                            <Box sx={{ position: 'relative', mt: 1 }}>
                                                <Box 
                                                    component="img"
                                                    src={signatureUrl} 
                                                    alt="Signature" 
                                                    sx={{ 
                                                        width: '100%', 
                                                        maxHeight: '100px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0',
                                                        objectFit: 'contain',
                                                        backgroundColor: '#f8fafc',
                                                        cursor: 'pointer',
                                                        '&:hover': { opacity: 0.8 }
                                                    }}
                                                    onClick={() => handleOpenModal(signatureUrl, 'Signature')}
                                                />
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 8,
                                                        right: 8,
                                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                                        border: '1px solid #e0e0e0',
                                                        '&:hover': { backgroundColor: 'white' }
                                                    }}
                                                    onClick={() => handleOpenModal(signatureUrl, 'Signature')}
                                                >
                                                    <ZoomInIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    )}
                                    
                                    {/* Photo Domicile */}
                                    {domicilePhotoUrl && (
                                        <Box>
                                            <Typography variant="caption" fontWeight="700" color="textSecondary">
                                                Photo localisation domicile
                                            </Typography>
                                            <Box sx={{ position: 'relative', mt: 1 }}>
                                                <Box 
                                                    component="img"
                                                    src={domicilePhotoUrl} 
                                                    alt="Localisation domicile" 
                                                    sx={{ 
                                                        width: '100%', 
                                                        height: 'auto', 
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0',
                                                        cursor: 'pointer',
                                                        '&:hover': { opacity: 0.8 }
                                                    }}
                                                    onClick={() => handleOpenModal(domicilePhotoUrl, 'Photo domicile')}
                                                />
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 8,
                                                        right: 8,
                                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                                        border: '1px solid #e0e0e0',
                                                        '&:hover': { backgroundColor: 'white' }
                                                    }}
                                                    onClick={() => handleOpenModal(domicilePhotoUrl, 'Photo domicile')}
                                                >
                                                    <ZoomInIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    )}
                                    
                                    {/* Photo Activité */}
                                    {activitePhotoUrl && (
                                        <Box>
                                            <Typography variant="caption" fontWeight="700" color="textSecondary">
                                                Photo localisation activité
                                            </Typography>
                                            <Box sx={{ position: 'relative', mt: 1 }}>
                                                <Box 
                                                    component="img"
                                                    src={activitePhotoUrl} 
                                                    alt="Localisation activité" 
                                                    sx={{ 
                                                        width: '100%', 
                                                        height: 'auto', 
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0',
                                                        cursor: 'pointer',
                                                        '&:hover': { opacity: 0.8 }
                                                    }}
                                                    onClick={() => handleOpenModal(activitePhotoUrl, 'Photo activité')}
                                                />
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 8,
                                                        right: 8,
                                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                                        border: '1px solid #e0e0e0',
                                                        '&:hover': { backgroundColor: 'white' }
                                                    }}
                                                    onClick={() => handleOpenModal(activitePhotoUrl, 'Photo activité')}
                                                >
                                                    <ZoomInIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    )}
                                    
                                    {!photoUrl && !signatureUrl && !domicilePhotoUrl && !activitePhotoUrl && !cniRectoUrl && !cniVersoUrl && (
                                        <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                                            Aucun document disponible
                                        </Typography>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Colonne Droite - Détails */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ borderRadius: 5, p: 4, border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                            
                            {isPhysique ? (
                                <>
                                    {/* CLIENT PHYSIQUE */}
                                    <SectionTitle icon={<BadgeIcon />} title="Identité & Filiation" />
                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        <DataField label="Sexe" value={detail?.sexe === 'M' ? 'Masculin' : (detail?.sexe === 'F' ? 'Féminin' : 'Non renseigné')} />
                                        <DataField label="Nationalité" value={detail?.nationalite} />
                                        <DataField label="Né(e) le" value={detail?.date_naissance ? new Date(detail.date_naissance).toLocaleDateString('fr-FR') : ''} />
                                        <DataField label="Lieu de naissance" value={detail?.lieu_naissance} />
                                        <DataField label="CNI" value={detail?.cni_numero} />
                                        <DataField label="NUI" value={detail?.nui} />
                                        <DataField label="Délivrance CNI" value={detail?.cni_delivrance ? new Date(detail.cni_delivrance).toLocaleDateString('fr-FR') : ''} />
                                        <DataField label="Expiration CNI" value={detail?.cni_expiration ? new Date(detail.cni_expiration).toLocaleDateString('fr-FR') : ''} />
                                    </Grid>

                                    <SectionTitle icon={<PersonIcon />} title="Filiation" />
                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        <DataField label="Nom du père" value={detail?.nom_pere} />
                                        <DataField label="Nationalité père" value={detail?.nationalite_pere} />
                                        <DataField label="Nom de la mère" value={detail?.nom_mere} />
                                        <DataField label="Nationalité mère" value={detail?.nationalite_mere} />
                                    </Grid>

                                    <SectionTitle icon={<WorkIcon />} title="Professionnel" />
                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        <DataField label="Profession" value={detail?.profession} />
                                        <DataField label="Employeur" value={detail?.employeur} />
                                        <DataField label="Situation familiale" value={detail?.situation_familiale} />
                                        <DataField label="Régime matrimonial" value={detail?.regime_matrimonial} />
                                    </Grid>

                                    {/* Conjoint */}
                                    {(detail?.nom_conjoint || detail?.cni_conjoint) && (
                                        <>
                                            <SectionTitle icon={<PersonIcon />} title="Conjoint(e)" />
                                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                                <DataField label="Nom du conjoint" value={detail?.nom_conjoint} />
                                                <DataField label="CNI conjoint" value={detail?.cni_conjoint} />
                                                <DataField label="Date naissance conjoint" value={detail?.date_naissance_conjoint ? new Date(detail.date_naissance_conjoint).toLocaleDateString('fr-FR') : ''} />
                                                <DataField label="Profession conjoint" value={detail?.profession_conjoint} />
                                                <DataField label="Salaire conjoint" value={detail?.salaire ? `${parseFloat(detail.salaire).toLocaleString('fr-FR')} FCFA` : ''} />
                                                <DataField label="Téléphone conjoint" value={detail?.tel_conjoint} />
                                            </Grid>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* CLIENT MORAL */}
                                    <SectionTitle icon={<BusinessIcon />} title="Identité de l'entreprise" />
                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        <DataField label="Raison sociale" value={detail?.raison_sociale} />
                                        <DataField label="Sigle" value={detail?.sigle} />
                                        <DataField label="Forme juridique" value={detail?.forme_juridique} />
                                        <DataField label="RCCM" value={detail?.rccm} />
                                        <DataField label="NUI" value={detail?.nui} />
                                        <DataField label="Gérant" value={detail?.nom_gerant} />
                                    </Grid>
                                </>
                            )}

                            {/* Localisation (commun aux deux types) */}
                            <SectionTitle icon={<LocationIcon />} title="Localisation" />
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                <DataField label="Ville" value={client?.adresse_ville} />
                                <DataField label="Quartier" value={client?.adresse_quartier} />
                                <DataField label="Lieu-dit domicile" value={client?.lieu_dit_domicile} />
                                <DataField label="Ville activité" value={client?.ville_activite} />
                                <DataField label="Quartier activité" value={client?.quartier_activite} />
                                <DataField label="Lieu-dit activité" value={client?.lieu_dit_activite} />
                            </Grid>

                            {/* Biens et patrimoine */}
                            <SectionTitle icon={<WalletIcon />} title="Patrimoine" />
                            <Grid container spacing={2}>
                                <DataField label="Immobilière" value={client?.immobiliere} />
                                <DataField label="Autres biens" value={client?.autres_biens} />
                                <DataField label="Créé le" value={client?.created_at ? new Date(client.created_at).toLocaleDateString('fr-FR') : ''} />
                                <DataField label="Dernière modification" value={client?.updated_at ? new Date(client.updated_at).toLocaleDateString('fr-FR') : ''} />
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Modal pour Photo Domicile */}
            <Dialog
                open={openDomicileModal}
                onClose={handleCloseDomicileModal}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Photo Localisation Domicile</Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseDomicileModal}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ textAlign: 'center', p: 0 }}>
                    {currentImage && (
                        <img
                            src={currentImage}
                            alt={currentImageTitle}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '70vh',
                                objectFit: 'contain'
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal pour Photo Activité */}
            <Dialog
                open={openActiviteModal}
                onClose={handleCloseActiviteModal}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Photo Localisation Activité</Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseActiviteModal}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ textAlign: 'center', p: 0 }}>
                    {currentImage && (
                        <img
                            src={currentImage}
                            alt={currentImageTitle}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '70vh',
                                objectFit: 'contain'
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal pour Photo Client */}
            <Dialog
                open={openPhotoModal}
                onClose={handleClosePhotoModal}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Photo du Client</Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleClosePhotoModal}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ textAlign: 'center', p: 0 }}>
                    {currentImage && (
                        <img
                            src={currentImage}
                            alt={currentImageTitle}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '70vh',
                                objectFit: 'contain'
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal pour Signature */}
            <Dialog
                open={openSignatureModal}
                onClose={handleCloseSignatureModal}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Signature</Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseSignatureModal}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ textAlign: 'center', p: 0 }}>
                    {currentImage && (
                        <img
                            src={currentImage}
                            alt={currentImageTitle}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '70vh',
                                objectFit: 'contain'
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal pour CNI Recto */}
            <Dialog
                open={openCniRectoModal}
                onClose={handleCloseCniRectoModal}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">CNI - Recto</Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseCniRectoModal}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ textAlign: 'center', p: 0 }}>
                    {currentImage && (
                        <img
                            src={currentImage}
                            alt={currentImageTitle}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '70vh',
                                objectFit: 'contain'
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal pour CNI Verso */}
            <Dialog
                open={openCniVersoModal}
                onClose={handleCloseCniVersoModal}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">CNI - Verso</Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseCniVersoModal}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ textAlign: 'center', p: 0 }}>
                    {currentImage && (
                        <img
                            src={currentImage}
                            alt={currentImageTitle}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '70vh',
                                objectFit: 'contain'
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Layout>
    );
}

// --- SOUS-COMPOSANTS ---
function SectionTitle({ icon, title }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{ color: '#6366f1', display: 'flex', alignItems: 'center' }}>{icon}</Box>
            <Typography variant="h6" fontWeight="800" sx={{ color: '#1E293B' }}>{title}</Typography>
        </Box>
    );
}

function DataField({ label, value }) {
    return (
        <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>
                {label}
            </Typography>
            <Typography variant="body1" sx={{ color: '#334155', fontWeight: '600', wordBreak: 'break-word' }}>
                {value || "Non renseigné"}
            </Typography>
        </Grid>
    );
}

function StackStat({ label, value, color }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC' }}>
            <Typography variant="body2" sx={{ fontWeight: '700' }}>{label}</Typography>
            <Typography variant="body2" fontWeight="900" sx={{ color: color || '#334155' }}>
                {value}
            </Typography>
        </Box>
    );
}