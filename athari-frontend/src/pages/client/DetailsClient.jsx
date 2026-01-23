import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Grid, Divider, Chip, 
    Button, Avatar, Card, CardContent, List, ListItem, ListItemText,
    IconButton, CircularProgress, Stack, Alert,
    Dialog, DialogContent, DialogTitle, Tabs, Tab
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon, Edit as EditIcon, Person as PersonIcon,
    Business as BusinessIcon, PhotoCamera as PhotoCameraIcon,
    LocalPhone as PhoneIcon, Email as EmailIcon, Badge as BadgeIcon,
    Work as WorkIcon, LocationOn as LocationIcon, AccountBalanceWallet as WalletIcon,
    Home as HomeIcon, BusinessCenter as BusinessCenterIcon, CameraAlt as CameraIcon,
    Close as CloseIcon, ZoomIn as ZoomInIcon,
    CreditCard as CreditCardIcon, Description as DescriptionIcon,
    AttachFile as AttachFileIcon, PictureAsPdf as PdfIcon,
    AccountCircle as AccountIcon, Create as SignatureIcon,
    Receipt as ReceiptIcon, WaterDrop as WaterIcon, 
    Bolt as BoltIcon, Map as MapIcon
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
    const [openGerantModal, setOpenGerantModal] = useState([false, false]);
    const [openSignatairePhotoModal, setOpenSignatairePhotoModal] = useState([false, false, false]);
    const [openSignataireSignatureModal, setOpenSignataireSignatureModal] = useState([false, false, false]);
    const [openDocModal, setOpenDocModal] = useState({});
    const [activeDocTab, setActiveDocTab] = useState(0);
    
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
            default:
                if (title.includes('Gérant')) {
                    const index = title.includes('Principal') ? 0 : 1;
                    const newState = [...openGerantModal];
                    newState[index] = true;
                    setOpenGerantModal(newState);
                } else if (title.includes('Signataire') && title.includes('Photo')) {
                    const index = parseInt(title.match(/\d+/)?.[0]) - 1 || 0;
                    const newState = [...openSignatairePhotoModal];
                    newState[index] = true;
                    setOpenSignatairePhotoModal(newState);
                } else if (title.includes('Signataire') && title.includes('Signature')) {
                    const index = parseInt(title.match(/\d+/)?.[0]) - 1 || 0;
                    const newState = [...openSignataireSignatureModal];
                    newState[index] = true;
                    setOpenSignataireSignatureModal(newState);
                } else {
                    setOpenDocModal({...openDocModal, [title]: true});
                }
        }
    };

    const handleCloseModal = () => {
        setOpenDomicileModal(false);
        setOpenActiviteModal(false);
        setOpenPhotoModal(false);
        setOpenSignatureModal(false);
        setOpenGerantModal([false, false]);
        setOpenSignatairePhotoModal([false, false, false]);
        setOpenSignataireSignatureModal([false, false, false]);
        setOpenDocModal({});
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

    // URLs pour client physique
    const photoUrl = isPhysique ? getFullUrl(client.physique?.photo || client.physique?.photo_url) : null;
    const signatureUrl = isPhysique ? getFullUrl(client.physique?.signature || client.physique?.signature_url) : null;
    const cniRectoUrl = isPhysique ? getFullUrl(client.physique?.cni_recto || client.physique?.cni_recto_url) : null;
    const cniVersoUrl = isPhysique ? getFullUrl(client.physique?.cni_verso || client.physique?.cni_verso_url) : null;

    // URLs pour client moral
    const gerantPhotoUrls = [
        getFullUrl(client.morale?.photo_gerant || client.morale?.photo_gerant_url),
        getFullUrl(client.morale?.photo_gerant2 || client.morale?.photo_gerant2_url)
    ];
    
    const signatairePhotoUrls = [
        getFullUrl(client.morale?.photo_signataire || client.morale?.photo_signataire_url),
        getFullUrl(client.morale?.photo_signataire2 || client.morale?.photo_signataire2_url),
        getFullUrl(client.morale?.photo_signataire3 || client.morale?.photo_signataire3_url)
    ];
    
    const signataireSignatureUrls = [
        getFullUrl(client.morale?.signature_signataire || client.morale?.signature_signataire_url),
        getFullUrl(client.morale?.signature_signataire2 || client.morale?.signature_signataire2_url),
        getFullUrl(client.morale?.signature_signataire3 || client.morale?.signature_signataire3_url)
    ];

    // URLs pour documents juridiques
    const extraitRccmUrl = getFullUrl(client.morale?.extrait_rccm_image || client.morale?.extrait_rccm_image_url);
    const titrePatenteUrl = getFullUrl(client.morale?.titre_patente_image || client.morale?.titre_patente_image_url);
    const niuImageUrl = getFullUrl(client.morale?.niu_image || client.morale?.niu_image_url);
    const statutsUrl = getFullUrl(client.morale?.statuts_image || client.morale?.statuts_image_url);
    const pvAgcUrl = getFullUrl(client.morale?.pv_agc_image || client.morale?.pv_agc_image_url);
    const attestationUrl = getFullUrl(client.morale?.attestation_non_redevance_image || client.morale?.attestation_non_redevance_image_url);
    const procesVerbalUrl = getFullUrl(client.morale?.proces_verbal_image || client.morale?.proces_verbal_image_url);
    const registreCoopUrl = getFullUrl(client.morale?.registre_coop_gic_image || client.morale?.registre_coop_gic_image_url);
    const recepisseUrl = getFullUrl(client.morale?.recepisse_declaration_association_image || client.morale?.recepisse_declaration_association_image_url);
    
    // URLs pour PDF
    const acteDesignationPdfUrl = getFullUrl(client.morale?.acte_designation_signataires_pdf || client.morale?.acte_designation_signataires_pdf_url);
    const listeConseilPdfUrl = getFullUrl(client.morale?.liste_conseil_administration_pdf || client.morale?.liste_conseil_administration_pdf_url);
    
    // URLs pour plans et factures siège
    const planSiegeUrl = getFullUrl(client.morale?.plan_localisation_siege_image || client.morale?.plan_localisation_siege_image_url);
    const factureEauSiegeUrl = getFullUrl(client.morale?.facture_eau_siege_image || client.morale?.facture_eau_siege_image_url);
    const factureElecSiegeUrl = getFullUrl(client.morale?.facture_electricite_siege_image || client.morale?.facture_electricite_siege_image_url);
    
    // URLs pour plans signataires
    const planSignataireUrls = [
        getFullUrl(client.morale?.plan_localisation_signataire1_image || client.morale?.plan_localisation_signataire1_image_url),
        getFullUrl(client.morale?.plan_localisation_signataire2_image || client.morale?.plan_localisation_signataire2_image_url),
        getFullUrl(client.morale?.plan_localisation_signataire3_image || client.morale?.plan_localisation_signataire3_image_url)
    ];
    
    // URLs pour factures eau signataires
    const factureEauSignataireUrls = [
        getFullUrl(client.morale?.facture_eau_signataire1_image || client.morale?.facture_eau_signataire1_image_url),
        getFullUrl(client.morale?.facture_eau_signataire2_image || client.morale?.facture_eau_signataire2_image_url),
        getFullUrl(client.morale?.facture_eau_signataire3_image || client.morale?.facture_eau_signataire3_image_url)
    ];
    
    // URLs pour factures électricité signataires
    const factureElecSignataireUrls = [
        getFullUrl(client.morale?.facture_electricite_signataire1_image || client.morale?.facture_electricite_signataire1_image_url),
        getFullUrl(client.morale?.facture_electricite_signataire2_image || client.morale?.facture_electricite_signataire2_image_url),
        getFullUrl(client.morale?.facture_electricite_signataire3_image || client.morale?.facture_electricite_signataire3_image_url)
    ];

    // URLs communes
    const domicilePhotoUrl = getFullUrl(client.photo_localisation_domicile || client.photo_localisation_domicile_url);
    const activitePhotoUrl = getFullUrl(client.photo_localisation_activite || client.photo_localisation_activite_url);

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
                                    src={isPhysique ? photoUrl : gerantPhotoUrls[0]} 
                                    sx={{ 
                                        width: 120, 
                                        height: 120, 
                                        border: '4px solid #F1F5F9', 
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                        cursor: (isPhysique ? photoUrl : gerantPhotoUrls[0]) ? 'pointer' : 'default',
                                        '&:hover': (isPhysique ? photoUrl : gerantPhotoUrls[0]) ? { opacity: 0.9 } : {}
                                    }}
                                    onClick={() => {
                                        if (isPhysique && photoUrl) {
                                            handleOpenModal(photoUrl, 'Photo du client');
                                        } else if (!isPhysique && gerantPhotoUrls[0]) {
                                            handleOpenModal(gerantPhotoUrls[0], 'Photo Gérant Principal');
                                        }
                                    }}
                                >
                                    {isPhysique ? <PersonIcon fontSize="large" /> : <BusinessIcon fontSize="large" />}
                                </Avatar>
                                {(isPhysique ? photoUrl : gerantPhotoUrls[0]) && (
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
                                        onClick={() => {
                                            if (isPhysique && photoUrl) {
                                                handleOpenModal(photoUrl, 'Photo du client');
                                            } else if (!isPhysique && gerantPhotoUrls[0]) {
                                                handleOpenModal(gerantPhotoUrls[0], 'Photo Gérant Principal');
                                            }
                                        }}
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
                                {!isPhysique && detail?.type_entreprise && (
                                    <Chip 
                                        label={detail.type_entreprise.toUpperCase()} 
                                        size="small" 
                                        sx={{ fontWeight: '600', bgcolor: '#a855f7', color: '#fff' }} 
                                    />
                                )}
                            </Box>
                            {!isPhysique && detail?.forme_juridique && (
                                <Typography variant="body1" sx={{ mt: 1, color: '#64748b' }}>
                                    {detail.forme_juridique}
                                </Typography>
                            )}
                            {!isPhysique && detail?.rccm && (
                                <Typography variant="body2" sx={{ mt: 0.5, color: '#64748b' }}>
                                    RCCM: {detail.rccm}
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
                                    <Typography variant="overline" sx={{ opacity: 0.6, fontWeight: 'bold' }}>CAPITAL</Typography>
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
                    {/* Colonne Gauche - Contact et Documents */}
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
                                    {!isPhysique && detail?.telephone_gerant && (
                                        <ListItem disableGutters>
                                            <ListItemText 
                                                primary="Téléphone Gérant" 
                                                secondary={detail.telephone_gerant} 
                                                primaryTypographyProps={{fontWeight: '800', fontSize: '0.875rem'}}
                                                secondaryTypographyProps={{fontWeight: '500'}}
                                            />
                                        </ListItem>
                                    )}
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
                                
                                {isPhysique ? (
                                    // Documents pour client physique
                                    <Stack spacing={3}>
                                        {/* CNI */}
                                        {(cniRectoUrl || cniVersoUrl) && (
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
                                                            <ImagePreview 
                                                                src={cniRectoUrl}
                                                                title="CNI Recto"
                                                                onClick={() => handleOpenModal(cniRectoUrl, 'CNI Recto')}
                                                            />
                                                        </Grid>
                                                    )}
                                                    {cniVersoUrl && (
                                                        <Grid item xs={6}>
                                                            <ImagePreview 
                                                                src={cniVersoUrl}
                                                                title="CNI Verso"
                                                                onClick={() => handleOpenModal(cniVersoUrl, 'CNI Verso')}
                                                            />
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Box>
                                        )}
                                        
                                        {/* Photo client */}
                                        {photoUrl && (
                                            <ImagePreview 
                                                src={photoUrl}
                                                title="Photo du client"
                                                label="Photo du client"
                                                onClick={() => handleOpenModal(photoUrl, 'Photo du client')}
                                                height={150}
                                            />
                                        )}
                                        
                                        {/* Signature */}
                                        {signatureUrl && (
                                            <ImagePreview 
                                                src={signatureUrl}
                                                title="Signature"
                                                label="Signature"
                                                onClick={() => handleOpenModal(signatureUrl, 'Signature')}
                                                height={100}
                                            />
                                        )}
                                    </Stack>
                                ) : (
                                    // Documents pour client moral
                                    <Stack spacing={3}>
                                        {/* Photos des gérants */}
                                        <Box>
                                            <Typography variant="caption" fontWeight="700" color="textSecondary" sx={{ mb: 1 }}>
                                                Photos des Gérants
                                            </Typography>
                                            <Grid container spacing={2}>
                                                {gerantPhotoUrls.map((url, index) => (
                                                    url && (
                                                        <Grid item xs={6} key={index}>
                                                            <ImagePreview 
                                                                src={url}
                                                                title={`Photo Gérant ${index === 0 ? 'Principal' : 'Secondaire'}`}
                                                                label={`Gérant ${index + 1}`}
                                                                onClick={() => handleOpenModal(url, `Photo Gérant ${index === 0 ? 'Principal' : 'Secondaire'}`)}
                                                                height={120}
                                                            />
                                                        </Grid>
                                                    )
                                                ))}
                                            </Grid>
                                        </Box>
                                        
                                        {/* Photos et signatures des signataires */}
                                        {signatairePhotoUrls.some(url => url) && (
                                            <Box>
                                                <Typography variant="caption" fontWeight="700" color="textSecondary" sx={{ mb: 1 }}>
                                                    Signataires
                                                </Typography>
                                                <Tabs value={activeDocTab} onChange={(e, v) => setActiveDocTab(v)} sx={{ mb: 2 }}>
                                                    {signatairePhotoUrls.map((url, index) => (
                                                        url && <Tab key={index} label={`S${index + 1}`} />
                                                    ))}
                                                </Tabs>
                                                <Grid container spacing={2}>
                                                    {signatairePhotoUrls[activeDocTab] && (
                                                        <Grid item xs={6}>
                                                            <ImagePreview 
                                                                src={signatairePhotoUrls[activeDocTab]}
                                                                title={`Photo Signataire ${activeDocTab + 1}`}
                                                                label="Photo"
                                                                onClick={() => handleOpenModal(signatairePhotoUrls[activeDocTab], `Photo Signataire ${activeDocTab + 1}`)}
                                                                height={120}
                                                            />
                                                        </Grid>
                                                    )}
                                                    {signataireSignatureUrls[activeDocTab] && (
                                                        <Grid item xs={6}>
                                                            <ImagePreview 
                                                                src={signataireSignatureUrls[activeDocTab]}
                                                                title={`Signature Signataire ${activeDocTab + 1}`}
                                                                label="Signature"
                                                                onClick={() => handleOpenModal(signataireSignatureUrls[activeDocTab], `Signature Signataire ${activeDocTab + 1}`)}
                                                                height={120}
                                                            />
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Box>
                                        )}
                                        
                                        {/* Documents juridiques (un seul à la fois) */}
                                        <Box>
                                            <Typography variant="caption" fontWeight="700" color="textSecondary" sx={{ mb: 1 }}>
                                                Documents Juridiques
                                            </Typography>
                                            <Stack spacing={1}>
                                                {extraitRccmUrl && (
                                                    <DocumentPreview 
                                                        src={extraitRccmUrl}
                                                        title="Extrait RCCM"
                                                        onClick={() => handleOpenModal(extraitRccmUrl, 'Extrait RCCM')}
                                                    />
                                                )}
                                                {titrePatenteUrl && (
                                                    <DocumentPreview 
                                                        src={titrePatenteUrl}
                                                        title="Titre de Patente"
                                                        onClick={() => handleOpenModal(titrePatenteUrl, 'Titre de Patente')}
                                                    />
                                                )}
                                                {niuImageUrl && (
                                                    <DocumentPreview 
                                                        src={niuImageUrl}
                                                        title="Photocopie NUI"
                                                        onClick={() => handleOpenModal(niuImageUrl, 'Photocopie NUI')}
                                                    />
                                                )}
                                                {statutsUrl && (
                                                    <DocumentPreview 
                                                        src={statutsUrl}
                                                        title="Photocopie des Statuts"
                                                        onClick={() => handleOpenModal(statutsUrl, 'Photocopie des Statuts')}
                                                    />
                                                )}
                                                {pvAgcUrl && (
                                                    <DocumentPreview 
                                                        src={pvAgcUrl}
                                                        title="PV de l'AGC"
                                                        onClick={() => handleOpenModal(pvAgcUrl, 'PV de l\'AGC')}
                                                    />
                                                )}
                                                {attestationUrl && (
                                                    <DocumentPreview 
                                                        src={attestationUrl}
                                                        title="Attestation de non redevance"
                                                        onClick={() => handleOpenModal(attestationUrl, 'Attestation de non redevance')}
                                                    />
                                                )}
                                                {procesVerbalUrl && (
                                                    <DocumentPreview 
                                                        src={procesVerbalUrl}
                                                        title="Procès Verbal"
                                                        onClick={() => handleOpenModal(procesVerbalUrl, 'Procès Verbal')}
                                                    />
                                                )}
                                                {registreCoopUrl && (
                                                    <DocumentPreview 
                                                        src={registreCoopUrl}
                                                        title="Registre COOP-GIC"
                                                        onClick={() => handleOpenModal(registreCoopUrl, 'Registre COOP-GIC')}
                                                    />
                                                )}
                                                {recepisseUrl && (
                                                    <DocumentPreview 
                                                        src={recepisseUrl}
                                                        title="Récépissé de déclaration"
                                                        onClick={() => handleOpenModal(recepisseUrl, 'Récépissé de déclaration')}
                                                    />
                                                )}
                                            </Stack>
                                        </Box>
                                        
                                        {/* PDF */}
                                        <Box>
                                            <Typography variant="caption" fontWeight="700" color="textSecondary" sx={{ mb: 1 }}>
                                                Documents PDF
                                            </Typography>
                                            <Stack spacing={1}>
                                                {acteDesignationPdfUrl && (
                                                    <DocumentPreview 
                                                        src={acteDesignationPdfUrl}
                                                        title="Acte de Désignation des Signataires"
                                                        onClick={() => window.open(acteDesignationPdfUrl, '_blank')}
                                                        isPdf={true}
                                                    />
                                                )}
                                                {listeConseilPdfUrl && (
                                                    <DocumentPreview 
                                                        src={listeConseilPdfUrl}
                                                        title="Liste du Conseil d'Administration"
                                                        onClick={() => window.open(listeConseilPdfUrl, '_blank')}
                                                        isPdf={true}
                                                    />
                                                )}
                                            </Stack>
                                        </Box>
                                    </Stack>
                                )}
                                
                                {/* Photos de localisation (communes) */}
                                {(domicilePhotoUrl || activitePhotoUrl) && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="caption" fontWeight="700" color="textSecondary" sx={{ mb: 1 }}>
                                            Localisation
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {domicilePhotoUrl && (
                                                <Grid item xs={6}>
                                                    <ImagePreview 
                                                        src={domicilePhotoUrl}
                                                        title="Photo localisation domicile"
                                                        label="Domicile"
                                                        onClick={() => handleOpenModal(domicilePhotoUrl, 'Photo domicile')}
                                                        height={120}
                                                    />
                                                </Grid>
                                            )}
                                            {activitePhotoUrl && (
                                                <Grid item xs={6}>
                                                    <ImagePreview 
                                                        src={activitePhotoUrl}
                                                        title="Photo localisation activité"
                                                        label="Activité"
                                                        onClick={() => handleOpenModal(activitePhotoUrl, 'Photo activité')}
                                                        height={120}
                                                    />
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>
                                )}
                                
                                {!photoUrl && !signatureUrl && !cniRectoUrl && !cniVersoUrl && 
                                 !gerantPhotoUrls[0] && !signatairePhotoUrls[0] && !domicilePhotoUrl && !activitePhotoUrl && (
                                    <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                                        Aucun document disponible
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Colonne Droite - Détails */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ borderRadius: 5, p: 4, border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                            
                            {isPhysique ? (
                                // Détails client physique (existant)
                                <>
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
                                // Détails client moral (AJOUTÉ)
                                <>
                                    <SectionTitle icon={<BusinessIcon />} title="Identité de l'entreprise" />
                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        <DataField label="Raison sociale" value={detail?.raison_sociale} />
                                        <DataField label="Sigle" value={detail?.sigle} />
                                        <DataField label="Forme juridique" value={detail?.forme_juridique} />
                                        <DataField label="Type d'entreprise" value={detail?.type_entreprise} />
                                        <DataField label="RCCM" value={detail?.rccm} />
                                        <DataField label="NUI" value={detail?.nui} />
                                        <DataField label="Agence" value={client.agency?.name || client.agency?.code} />
                                    </Grid>

                                    <SectionTitle icon={<AccountIcon />} title="Gérance" />
                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        <DataField label="Gérant Principal" value={detail?.nom_gerant} />
                                        <DataField label="Téléphone Gérant Principal" value={detail?.telephone_gerant} />
                                        <DataField label="Gérant Secondaire" value={detail?.nom_gerant2} />
                                        <DataField label="Téléphone Gérant Secondaire" value={detail?.telephone_gerant2} />
                                    </Grid>

                                    <SectionTitle icon={<SignatureIcon />} title="Signataires" />
                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        <DataField label="Signataire 1" value={detail?.nom_signataire} />
                                        <DataField label="Téléphone Signataire 1" value={detail?.telephone_signataire} />
                                        <DataField label="Signataire 2" value={detail?.nom_signataire2} />
                                        <DataField label="Téléphone Signataire 2" value={detail?.telephone_signataire2} />
                                        <DataField label="Signataire 3" value={detail?.nom_signataire3} />
                                        <DataField label="Téléphone Signataire 3" value={detail?.telephone_signataire3} />
                                    </Grid>

                                    {/* Documents administratifs supplémentaires */}
                                    <SectionTitle icon={<DescriptionIcon />} title="Documents Administratifs" />
                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        {detail?.type_entreprise === 'entreprise' ? (
                                            <>
                                                <DataField label="Extrait RCCM" value={extraitRccmUrl ? "✓ Disponible" : "Non fourni"} />
                                                <DataField label="Titre de Patente" value={titrePatenteUrl ? "✓ Disponible" : "Non fourni"} />
                                                <DataField label="Photocopie NUI" value={niuImageUrl ? "✓ Disponible" : "Non fourni"} />
                                                <DataField label="Photocopie des Statuts" value={statutsUrl ? "✓ Disponible" : "Non fourni"} />
                                                <DataField label="Acte de Désignation" value={acteDesignationPdfUrl ? "✓ Disponible (PDF)" : "Non fourni"} />
                                            </>
                                        ) : (
                                            <>
                                                <DataField label="PV de l'AGC" value={pvAgcUrl ? "✓ Disponible" : "Non fourni"} />
                                                <DataField label="Attestation non redevance" value={attestationUrl ? "✓ Disponible" : "Non fourni"} />
                                                <DataField label="Procès Verbal" value={procesVerbalUrl ? "✓ Disponible" : "Non fourni"} />
                                                <DataField label="Registre COOP-GIC" value={registreCoopUrl ? "✓ Disponible" : "Non fourni"} />
                                                <DataField label="Récépissé de déclaration" value={recepisseUrl ? "✓ Disponible" : "Non fourni"} />
                                            </>
                                        )}
                                        <DataField label="Liste Conseil d'Administration" value={listeConseilPdfUrl ? "✓ Disponible (PDF)" : "Non fourni"} />
                                    </Grid>

                                    {/* Plans et factures siège */}
                                    <SectionTitle icon={<MapIcon />} title="Localisation du Siège" />
                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        <DataField label="Plan localisation siège" value={planSiegeUrl ? "✓ Disponible" : "Non fourni"} />
                                        <DataField label="Facture eau siège" value={factureEauSiegeUrl ? "✓ Disponible" : "Non fourni"} />
                                        <DataField label="Facture électricité siège" value={factureElecSiegeUrl ? "✓ Disponible" : "Non fourni"} />
                                    </Grid>

                                    {/* Plans signataires */}
                                    <SectionTitle icon={<LocationIcon />} title="Plans des Signataires" />
                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        {planSignataireUrls.map((url, index) => (
                                            <DataField 
                                                key={index}
                                                label={`Plan Signataire ${index + 1}`} 
                                                value={url ? "✓ Disponible" : "Non fourni"} 
                                            />
                                        ))}
                                    </Grid>

                                    {/* Factures signataires */}
                                    <SectionTitle icon={<ReceiptIcon />} title="Factures des Signataires" />
                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        {factureEauSignataireUrls.map((url, index) => (
                                            <DataField 
                                                key={index}
                                                label={`Facture eau S${index + 1}`} 
                                                value={url ? "✓ Disponible" : "Non fourni"} 
                                            />
                                        ))}
                                        {factureElecSignataireUrls.map((url, index) => (
                                            <DataField 
                                                key={index}
                                                label={`Facture électricité S${index + 1}`} 
                                                value={url ? "✓ Disponible" : "Non fourni"} 
                                            />
                                        ))}
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

            {/* Modal générique pour les images */}
            <Dialog
                open={openDomicileModal || openActiviteModal || openPhotoModal || openSignatureModal || 
                      openGerantModal.some(v => v) || openSignatairePhotoModal.some(v => v) || 
                      openSignataireSignatureModal.some(v => v) || Object.values(openDocModal).some(v => v)}
                onClose={handleCloseModal}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{currentImageTitle}</Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseModal}
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

function ImagePreview({ src, title, label, onClick, height = 120 }) {
    return (
        <Box sx={{ position: 'relative' }}>
            <Box 
                component="img"
                src={src} 
                alt={title} 
                sx={{ 
                    width: '100%', 
                    height: `${height}px`, 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    objectFit: 'cover',
                    '&:hover': { opacity: 0.8 }
                }}
                onClick={onClick}
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
                onClick={onClick}
            >
                <ZoomInIcon fontSize="small" />
            </IconButton>
            {label && (
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                    {label}
                </Typography>
            )}
        </Box>
    );
}

function DocumentPreview({ src, title, onClick, isPdf = false }) {
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                p: 1, 
                borderRadius: 1, 
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f1f5f9' }
            }}
            onClick={onClick}
        >
            {isPdf ? (
                <PdfIcon sx={{ color: '#ef4444' }} />
            ) : (
                <AttachFileIcon sx={{ color: '#6366f1' }} />
            )}
            <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>
                {title}
            </Typography>
            <IconButton size="small">
                <ZoomInIcon fontSize="small" />
            </IconButton>
        </Box>
    );
}