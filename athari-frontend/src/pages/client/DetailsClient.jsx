import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Grid, Divider, Chip, 
    Button, Avatar, Card, CardContent, List, ListItem, ListItemText,
    IconButton, CircularProgress, Stack, Alert,
    Dialog, DialogContent, DialogTitle, Tabs, Tab,
    Accordion, AccordionSummary, AccordionDetails
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
    Bolt as BoltIcon, Map as MapIcon, ExpandMore as ExpandMoreIcon,
    Fingerprint as FingerprintIcon, DateRange as DateRangeIcon,
    Language as LanguageIcon, School as SchoolIcon,
    CorporateFare as CorporateFareIcon, Group as GroupIcon,
    DocumentScanner as DocumentScannerIcon, Task as TaskIcon,
    PermIdentity as PermIdentityIcon, HomeWork as HomeWorkIcon,
    Apartment as ApartmentIcon, AccountBalance as AccountBalanceIcon,
    LocalAtm as LocalAtmIcon, MonetizationOn as MonetizationOnIcon,
    AttachMoney as AttachMoneyIcon, AccountTree as AccountTreeIcon,
    ContactPhone as ContactPhoneIcon, LocationCity as LocationCityIcon,
    Domain as DomainIcon, Business as BusinessOutlineIcon,
    Description as DescriptionOutlineIcon, ListAlt as ListAltIcon,
    Assignment as AssignmentIcon, InsertDriveFile as InsertDriveFileIcon,
    NoteAdd as NoteAddIcon, ReceiptLong as ReceiptLongIcon,
    Paid as PaidIcon, AccountBox as AccountBoxIcon,
    SupervisorAccount as SupervisorAccountIcon,
    HowToReg as HowToRegIcon, BadgeOutlined as BadgeOutlinedIcon
} from '@mui/icons-material';
import apiClient from '../../services/api/ApiClient';
import Layout from '../../components/layout/Layout';

export default function DetailsClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // États pour les modales
    const [openImageModal, setOpenImageModal] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [currentImageTitle, setCurrentImageTitle] = useState('');
    
    // Onglets
    const [activeDocTab, setActiveDocTab] = useState(0);
    const [activeSignataireTab, setActiveSignataireTab] = useState(0);
    
    // Accordions
    const [expandedAccordions, setExpandedAccordions] = useState({
        identite: true,
        professionnel: true,
        filiation: true,
        conjoint: true,
        localisation: true,
        patrimoine: true,
        documents: true,
        entreprise: true,
        gerants: true,
        signataires: true,
        documentsJuridiques: true
    });

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpandedAccordions({
            ...expandedAccordions,
            [panel]: isExpanded
        });
    };

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

    const handleOpenImageModal = (imageUrl, title) => {
        setCurrentImage(imageUrl);
        setCurrentImageTitle(title);
        setOpenImageModal(true);
    };

    const handleCloseModal = () => {
        setOpenImageModal(false);
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
    const detail = isPhysique ? client.physique : client.morale;
    const name = isPhysique ? detail?.nom_prenoms : detail?.raison_sociale;
    
    // Formater la date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR');
        } catch {
            return dateString;
        }
    };

    // Vérifier si une valeur existe
    const hasValue = (value) => {
        return value !== null && value !== undefined && value !== '';
    };

    // Récupérer les URLs correctement selon le type de client
    const getUrls = () => {
        if (isPhysique && client.physique) {
            return {
                // Documents images
                photoUrl: client.physique.photo_url,
                signatureUrl: client.physique.signature_url,
                cniRectoUrl: client.physique.cni_recto_url,
                cniVersoUrl: client.physique.cni_verso_url,
                niuImageUrl: client.physique.niu_image_url,
                
                // Documents PDF
                attestationConformitePdfUrl: null, // Pas dans votre exemple pour physique
            };
        } else if (!isPhysique && client.morale) {
            return {
                // Photos gérants
                gerantPhotoUrls: [
                    client.morale.photo_gerant_url,
                    client.morale.photo_gerant2_url
                ],
                
                // Signataires
                signataires: client.morale.signataires || [],
                
                // Documents juridiques images
                extraitRccmUrl: client.morale.extrait_rccm_image_url,
                titrePatenteUrl: client.morale.titre_patente_image_url,
                niuImageMoraleUrl: client.morale.niu_image_url,
                statutsUrl: client.morale.statuts_image_url,
                pvAgcUrl: client.morale.pv_agc_image_url,
                attestationNonRedevanceUrl: client.morale.attestation_non_redevance_image_url,
                procesVerbalUrl: client.morale.proces_verbal_image_url,
                registreCoopUrl: client.morale.registre_coop_gic_image_url,
                recepisseDeclarationUrl: client.morale.recepisse_declaration_association_image_url,
                
                // Documents juridiques PDF
                acteDesignationPdfUrl: client.morale.acte_designation_signataires_pdf_url,
                listeConseilPdfUrl: client.morale.liste_conseil_administration_pdf_url,
                listeMembresPdfUrl: client.morale.liste_membres_pdf_url,
                attestationConformitePdfMoraleUrl: null, // Pas dans votre exemple
                
                // Plans et factures siège
                planSiegeUrl: client.morale.plan_localisation_siege_image_url,
                factureEauSiegeUrl: client.morale.facture_eau_siege_image_url,
                factureElecSiegeUrl: client.morale.facture_electricite_siege_image_url,
                
                // Plans signataires
                planSignataireUrls: [
                    client.morale.plan_localisation_signataire1_image_url,
                    client.morale.plan_localisation_signataire2_image_url,
                    client.morale.plan_localisation_signataire3_image_url
                ],
                
                // Factures signataires
                factureEauSignataireUrls: [
                    client.morale.facture_eau_signataire1_image_url,
                    client.morale.facture_eau_signataire2_image_url,
                    client.morale.facture_eau_signataire3_image_url
                ],
                factureElecSignataireUrls: [
                    client.morale.facture_electricite_signataire1_image_url,
                    client.morale.facture_electricite_signataire2_image_url,
                    client.morale.facture_electricite_signataire3_image_url
                ]
            };
        }
        return {};
    };

    const urls = getUrls();
    
    // URLs communes
    const domicilePhotoUrl = client.photo_localisation_domicile_url;
    const activitePhotoUrl = client.photo_localisation_activite_url;

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
                                    src={isPhysique ? urls.photoUrl : (urls.gerantPhotoUrls ? urls.gerantPhotoUrls[0] : null)} 
                                    sx={{ 
                                        width: 120, 
                                        height: 120, 
                                        border: '4px solid #F1F5F9', 
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                        '&:hover': { opacity: 0.9 }
                                    }}
                                    onClick={() => {
                                        if (isPhysique && urls.photoUrl) {
                                            handleOpenImageModal(urls.photoUrl, 'Photo du client');
                                        } else if (!isPhysique && urls.gerantPhotoUrls && urls.gerantPhotoUrls[0]) {
                                            handleOpenImageModal(urls.gerantPhotoUrls[0], 'Photo Gérant Principal');
                                        }
                                    }}
                                >
                                    {isPhysique ? <PersonIcon fontSize="large" /> : <BusinessIcon fontSize="large" />}
                                </Avatar>
                                {((isPhysique && urls.photoUrl) || (!isPhysique && urls.gerantPhotoUrls && urls.gerantPhotoUrls[0])) && (
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
                                            if (isPhysique && urls.photoUrl) {
                                                handleOpenImageModal(urls.photoUrl, 'Photo du client');
                                            } else if (!isPhysique && urls.gerantPhotoUrls && urls.gerantPhotoUrls[0]) {
                                                handleOpenImageModal(urls.gerantPhotoUrls[0], 'Photo Gérant Principal');
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
                                {!isPhysique && detail?.sigle && ` (${detail.sigle})`}
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
                    {/* Colonne Gauche - Informations principales */}
                    <Grid item xs={12} md={4}>
                        {/* Contact */}
                        <Card sx={{ borderRadius: 5, mb: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
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

                        {/* Informations rapides */}
                        <Card sx={{ borderRadius: 5, mb: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                            <CardContent>
                                <SectionTitle icon={<BadgeOutlinedIcon />} title="Informations Rapides" />
                                {isPhysique ? (
                                    <>
                                        <InfoRow label="Sexe" value={detail?.sexe === 'M' ? 'Masculin' : (detail?.sexe === 'F' ? 'Féminin' : 'Non renseigné')} />
                                        <InfoRow label="Nationalité" value={detail?.nationalite} />
                                        <InfoRow label="Date de naissance" value={formatDate(detail?.date_naissance)} />
                                        <InfoRow label="Lieu de naissance" value={detail?.lieu_naissance} />
                                        <InfoRow label="CNI" value={detail?.cni_numero} />
                                        <InfoRow label="NUI" value={detail?.nui} />
                                        <InfoRow label="Profession" value={detail?.profession} />
                                        <InfoRow label="Employeur" value={detail?.employeur} />
                                    </>
                                ) : (
                                    <>
                                        <InfoRow label="Forme juridique" value={detail?.forme_juridique} />
                                        <InfoRow label="RCCM" value={detail?.rccm} />
                                        <InfoRow label="NUI" value={detail?.nui} />
                                        <InfoRow label="Sigle" value={detail?.sigle} />
                                        <InfoRow label="Gérant Principal" value={detail?.nom_gerant} />
                                        <InfoRow label="Gérant Secondaire" value={detail?.nom_gerant2} />
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Localisation */}
                        <Card sx={{ borderRadius: 5, mb: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                            <CardContent>
                                <SectionTitle icon={<LocationIcon />} title="Localisation" />
                                <InfoRow label="Ville" value={client.adresse_ville} />
                                <InfoRow label="Quartier" value={client.adresse_quartier} />
                                <InfoRow label="Lieu-dit domicile" value={client.lieu_dit_domicile} />
                                <InfoRow label="Ville activité" value={client.ville_activite} />
                                <InfoRow label="Quartier activité" value={client.quartier_activite} />
                                <InfoRow label="Lieu-dit activité" value={client.lieu_dit_activite} />
                            </CardContent>
                        </Card>

                        {/* Patrimoine */}
                        <Card sx={{ borderRadius: 5, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                            <CardContent>
                                <SectionTitle icon={<WalletIcon />} title="Patrimoine" />
                                <InfoRow 
                                    label="Solde initial" 
                                    value={client.solde_initial ? `${parseFloat(client.solde_initial).toLocaleString('fr-FR')} FCFA` : '0 FCFA'} 
                                />
                                <InfoRow label="Immobilière" value={client.immobiliere} />
                                <InfoRow label="Autres biens" value={client.autres_biens} />
                                <Divider sx={{my: 2}} />
                                <InfoRow label="Créé le" value={formatDate(client.created_at)} />
                                <InfoRow label="Dernière modification" value={formatDate(client.updated_at)} />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Colonne Droite - Détails complets */}
                    <Grid item xs={12} md={8}>
                        {isPhysique ? (
                            /* Détails client physique */
                            <>
                                {/* Identité & Filiation */}
                                <Accordion 
                                    expanded={expandedAccordions.identite}
                                    onChange={handleAccordionChange('identite')}
                                    sx={{ borderRadius: '8px !important', mb: 2 }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <FingerprintIcon sx={{ color: '#6366f1' }} />
                                            <Typography variant="h6" fontWeight="700">Identité & Filiation</Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            <DetailField label="Nom complet" value={detail?.nom_prenoms} icon={<PermIdentityIcon />} />
                                            <DetailField label="Sexe" value={detail?.sexe === 'M' ? 'Masculin' : (detail?.sexe === 'F' ? 'Féminin' : 'Non renseigné')} icon={<PermIdentityIcon />} />
                                            <DetailField label="Date de naissance" value={formatDate(detail?.date_naissance)} icon={<DateRangeIcon />} />
                                            <DetailField label="Lieu de naissance" value={detail?.lieu_naissance} icon={<LocationIcon />} />
                                            <DetailField label="Nationalité" value={detail?.nationalite} icon={<LanguageIcon />} />
                                            <DetailField label="Numéro CNI" value={detail?.cni_numero} icon={<BadgeIcon />} />
                                            <DetailField label="Délivrance CNI" value={formatDate(detail?.cni_delivrance)} icon={<DateRangeIcon />} />
                                            <DetailField label="Expiration CNI" value={formatDate(detail?.cni_expiration)} icon={<DateRangeIcon />} />
                                            <DetailField label="Numéro NUI" value={detail?.nui} icon={<FingerprintIcon />} />
                                            <DetailField label="Nom du père" value={detail?.nom_pere} icon={<PersonIcon />} />
                                            <DetailField label="Nationalité père" value={detail?.nationalite_pere} icon={<LanguageIcon />} />
                                            <DetailField label="Nom de la mère" value={detail?.nom_mere} icon={<PersonIcon />} />
                                            <DetailField label="Nationalité mère" value={detail?.nationalite_mere} icon={<LanguageIcon />} />
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Informations professionnelles */}
                                {(detail?.profession || detail?.employeur) && (
                                    <Accordion 
                                        expanded={expandedAccordions.professionnel}
                                        onChange={handleAccordionChange('professionnel')}
                                        sx={{ borderRadius: '8px !important', mb: 2 }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <WorkIcon sx={{ color: '#6366f1' }} />
                                                <Typography variant="h6" fontWeight="700">Informations Professionnelles</Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={2}>
                                                <DetailField label="Profession" value={detail?.profession} icon={<WorkIcon />} />
                                                <DetailField label="Employeur" value={detail?.employeur} icon={<BusinessCenterIcon />} />
                                                <DetailField label="Situation familiale" value={detail?.situation_familiale} icon={<GroupIcon />} />
                                                <DetailField label="Régime matrimonial" value={detail?.regime_matrimonial} icon={<AccountBalanceIcon />} />
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                )}

                                {/* Conjoint(e) */}
                                {detail?.nom_conjoint && (
                                    <Accordion 
                                        expanded={expandedAccordions.conjoint}
                                        onChange={handleAccordionChange('conjoint')}
                                        sx={{ borderRadius: '8px !important', mb: 2 }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <PersonIcon sx={{ color: '#6366f1' }} />
                                                <Typography variant="h6" fontWeight="700">Conjoint(e)</Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={2}>
                                                <DetailField label="Nom du conjoint" value={detail?.nom_conjoint} icon={<PersonIcon />} />
                                                <DetailField label="Date naissance conjoint" value={formatDate(detail?.date_naissance_conjoint)} icon={<DateRangeIcon />} />
                                                <DetailField label="CNI conjoint" value={detail?.cni_conjoint} icon={<BadgeIcon />} />
                                                <DetailField label="Profession conjoint" value={detail?.profession_conjoint} icon={<WorkIcon />} />
                                                <DetailField label="Salaire" value={detail?.salaire ? `${parseFloat(detail.salaire).toLocaleString('fr-FR')} FCFA` : ''} icon={<AttachMoneyIcon />} />
                                                <DetailField label="Téléphone conjoint" value={detail?.tel_conjoint} icon={<PhoneIcon />} />
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                )}

                                {/* Documents */}
                                <Accordion 
                                    expanded={expandedAccordions.documents}
                                    onChange={handleAccordionChange('documents')}
                                    sx={{ borderRadius: '8px !important', mb: 2 }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <DescriptionIcon sx={{ color: '#6366f1' }} />
                                            <Typography variant="h6" fontWeight="700">Documents</Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack spacing={3}>
                                            {/* Documents images */}
                                            {(urls.photoUrl || urls.signatureUrl || urls.cniRectoUrl || urls.cniVersoUrl || urls.niuImageUrl || domicilePhotoUrl || activitePhotoUrl) && (
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2 }}>Documents Images</Typography>
                                                    <Grid container spacing={2}>
                                                        {urls.cniRectoUrl && (
                                                            <Grid item xs={12} md={6}>
                                                                <DocumentCard 
                                                                    title="Recto CNI"
                                                                    icon={<CreditCardIcon />}
                                                                    onClick={() => handleOpenImageModal(urls.cniRectoUrl, 'Recto CNI')}
                                                                />
                                                            </Grid>
                                                        )}
                                                        {urls.cniVersoUrl && (
                                                            <Grid item xs={12} md={6}>
                                                                <DocumentCard 
                                                                    title="Verso CNI"
                                                                    icon={<CreditCardIcon />}
                                                                    onClick={() => handleOpenImageModal(urls.cniVersoUrl, 'Verso CNI')}
                                                                />
                                                            </Grid>
                                                        )}
                                                        {urls.niuImageUrl && (
                                                            <Grid item xs={12} md={6}>
                                                                <DocumentCard 
                                                                    title="Photocopie NUI"
                                                                    icon={<FingerprintIcon />}
                                                                    onClick={() => handleOpenImageModal(urls.niuImageUrl, 'Photocopie NUI')}
                                                                />
                                                            </Grid>
                                                        )}
                                                        {urls.photoUrl && (
                                                            <Grid item xs={12} md={6}>
                                                                <DocumentCard 
                                                                    title="Photo du client"
                                                                    icon={<CameraIcon />}
                                                                    onClick={() => handleOpenImageModal(urls.photoUrl, 'Photo du client')}
                                                                />
                                                            </Grid>
                                                        )}
                                                        {urls.signatureUrl && (
                                                            <Grid item xs={12} md={6}>
                                                                <DocumentCard 
                                                                    title="Signature"
                                                                    icon={<SignatureIcon />}
                                                                    onClick={() => handleOpenImageModal(urls.signatureUrl, 'Signature')}
                                                                />
                                                            </Grid>
                                                        )}
                                                        {domicilePhotoUrl && (
                                                            <Grid item xs={12} md={6}>
                                                                <DocumentCard 
                                                                    title="Photo domicile"
                                                                    icon={<HomeIcon />}
                                                                    onClick={() => handleOpenImageModal(domicilePhotoUrl, 'Photo domicile')}
                                                                />
                                                            </Grid>
                                                        )}
                                                        {activitePhotoUrl && (
                                                            <Grid item xs={12} md={6}>
                                                                <DocumentCard 
                                                                    title="Photo activité"
                                                                    icon={<BusinessIcon />}
                                                                    onClick={() => handleOpenImageModal(activitePhotoUrl, 'Photo activité')}
                                                                />
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                </Box>
                                            )}
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                            </>
                        ) : (
                            /* Détails client moral */
                            <>
                                {/* Informations de l'entreprise */}
                                <Accordion 
                                    expanded={expandedAccordions.entreprise}
                                    onChange={handleAccordionChange('entreprise')}
                                    sx={{ borderRadius: '8px !important', mb: 2 }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <BusinessIcon sx={{ color: '#6366f1' }} />
                                            <Typography variant="h6" fontWeight="700">Informations de l'Entreprise</Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            <DetailField label="Raison sociale" value={detail?.raison_sociale} icon={<CorporateFareIcon />} />
                                            <DetailField label="Sigle" value={detail?.sigle} icon={<BadgeIcon />} />
                                            <DetailField label="Forme juridique" value={detail?.forme_juridique} icon={<AccountTreeIcon />} />
                                            <DetailField label="Type d'entreprise" value={detail?.type_entreprise} icon={<BusinessOutlineIcon />} />
                                            <DetailField label="Numéro RCCM" value={detail?.rccm} icon={<DocumentScannerIcon />} />
                                            <DetailField label="Numéro NUI" value={detail?.nui} icon={<FingerprintIcon />} />
                                            <DetailField label="Solde initial" value={`${parseFloat(client.solde_initial || 0).toLocaleString('fr-FR')} FCFA`} icon={<MonetizationOnIcon />} />
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Gérants */}
                                {(detail?.nom_gerant || detail?.nom_gerant2) && (
                                    <Accordion 
                                        expanded={expandedAccordions.gerants}
                                        onChange={handleAccordionChange('gerants')}
                                        sx={{ borderRadius: '8px !important', mb: 2 }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <SupervisorAccountIcon sx={{ color: '#6366f1' }} />
                                                <Typography variant="h6" fontWeight="700">Gérants</Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={3}>
                                                {/* Gérant principal */}
                                                {detail?.nom_gerant && (
                                                    <Grid item xs={12} md={6}>
                                                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                                            <CardContent>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                                    <Avatar 
                                                                        src={urls.gerantPhotoUrls && urls.gerantPhotoUrls[0]}
                                                                        sx={{ width: 60, height: 60 }}
                                                                        onClick={() => urls.gerantPhotoUrls && urls.gerantPhotoUrls[0] && handleOpenImageModal(urls.gerantPhotoUrls[0], 'Photo Gérant Principal')}
                                                                    >
                                                                        <AccountBoxIcon />
                                                                    </Avatar>
                                                                    <Box>
                                                                        <Typography variant="subtitle1" fontWeight="700">Gérant Principal</Typography>
                                                                        <Typography variant="body2" color="textSecondary">{detail.nom_gerant}</Typography>
                                                                    </Box>
                                                                </Box>
                                                                <InfoRow label="Téléphone" value={detail.telephone_gerant} small />
                                                                <InfoRow label="Photo" value={urls.gerantPhotoUrls && urls.gerantPhotoUrls[0] ? "✓ Disponible" : "Non fournie"} small />
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                )}

                                                {/* Gérant secondaire */}
                                                {detail?.nom_gerant2 && (
                                                    <Grid item xs={12} md={6}>
                                                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                                            <CardContent>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                                    <Avatar 
                                                                        src={urls.gerantPhotoUrls && urls.gerantPhotoUrls[1]}
                                                                        sx={{ width: 60, height: 60 }}
                                                                        onClick={() => urls.gerantPhotoUrls && urls.gerantPhotoUrls[1] && handleOpenImageModal(urls.gerantPhotoUrls[1], 'Photo Gérant Secondaire')}
                                                                    >
                                                                        <AccountBoxIcon />
                                                                    </Avatar>
                                                                    <Box>
                                                                        <Typography variant="subtitle1" fontWeight="700">Gérant Secondaire</Typography>
                                                                        <Typography variant="body2" color="textSecondary">{detail.nom_gerant2}</Typography>
                                                                    </Box>
                                                                </Box>
                                                                <InfoRow label="Téléphone" value={detail.telephone_gerant2} small />
                                                                <InfoRow label="Photo" value={urls.gerantPhotoUrls && urls.gerantPhotoUrls[1] ? "✓ Disponible" : "Non fournie"} small />
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                )}

                                {/* Signataires */}
                                {urls.signataires && urls.signataires.length > 0 && (
                                    <Accordion 
                                        expanded={expandedAccordions.signataires}
                                        onChange={handleAccordionChange('signataires')}
                                        sx={{ borderRadius: '8px !important', mb: 2 }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <HowToRegIcon sx={{ color: '#6366f1' }} />
                                                <Typography variant="h6" fontWeight="700">Signataires</Typography>
                                                <Chip label={`${urls.signataires.length} signataire(s)`} size="small" />
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Tabs 
                                                value={activeSignataireTab} 
                                                onChange={(e, v) => setActiveSignataireTab(v)} 
                                                sx={{ mb: 3 }}
                                            >
                                                {urls.signataires.map((signataire, index) => (
                                                    <Tab key={index} label={`Signataire ${index + 1}`} />
                                                ))}
                                            </Tabs>

                                            <Grid container spacing={3}>
                                                {urls.signataires.map((signataire, index) => (
                                                    activeSignataireTab === index && (
                                                        <React.Fragment key={index}>
                                                            <Grid item xs={12} md={6}>
                                                                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                                                    <CardContent>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                                                            <Avatar 
                                                                                src={signataire.photo_url}
                                                                                sx={{ width: 80, height: 80 }}
                                                                                onClick={() => signataire.photo_url && handleOpenImageModal(signataire.photo_url, `Photo Signataire ${index + 1}`)}
                                                                            >
                                                                                <AccountBoxIcon />
                                                                            </Avatar>
                                                                            <Box>
                                                                                <Typography variant="h6" fontWeight="700">{signataire.nom}</Typography>
                                                                                <Typography variant="body2" color="textSecondary">Signataire {index + 1}</Typography>
                                                                            </Box>
                                                                        </Box>

                                                                        <Grid container spacing={2}>
                                                                            <DetailField label="Sexe" value={signataire.sexe === 'M' ? 'Masculin' : 'Féminin'} small />
                                                                            <DetailField label="Téléphone" value={signataire.telephone} small />
                                                                            <DetailField label="Email" value={signataire.email} small />
                                                                            <DetailField label="CNI" value={signataire.cni} small />
                                                                            <DetailField label="NUI" value={signataire.nui} small />
                                                                            <DetailField label="Ville" value={signataire.ville} small />
                                                                            <DetailField label="Quartier" value={signataire.quartier} small />
                                                                            <DetailField label="Lieu domicile" value={signataire.lieu_domicile} small />
                                                                            <DetailField label="Lieu-dit domicile" value={signataire.lieu_dit_domicile} small />
                                                                        </Grid>
                                                                    </CardContent>
                                                                </Card>
                                                            </Grid>

                                                            <Grid item xs={12} md={6}>
                                                                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                                                    <CardContent>
                                                                        <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 2 }}>Documents du Signataire</Typography>
                                                                        <Grid container spacing={2}>
                                                                            {/* Images */}
                                                                            <Grid item xs={12}>
                                                                                <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>Images</Typography>
                                                                                <Grid container spacing={1}>
                                                                                    {signataire.photo_url && (
                                                                                        <Grid item xs={6}>
                                                                                            <DocumentCard 
                                                                                                title="Photo"
                                                                                                icon={<CameraIcon />}
                                                                                                small
                                                                                                onClick={() => handleOpenImageModal(signataire.photo_url, `Photo Signataire ${index + 1}`)}
                                                                                            />
                                                                                        </Grid>
                                                                                    )}
                                                                                    {signataire.signature_url && (
                                                                                        <Grid item xs={6}>
                                                                                            <DocumentCard 
                                                                                                title="Signature"
                                                                                                icon={<SignatureIcon />}
                                                                                                small
                                                                                                onClick={() => handleOpenImageModal(signataire.signature_url, `Signature Signataire ${index + 1}`)}
                                                                                            />
                                                                                        </Grid>
                                                                                    )}
                                                                                    {signataire.cni_photo_recto_url && (
                                                                                        <Grid item xs={6}>
                                                                                            <DocumentCard 
                                                                                                title="CNI Recto"
                                                                                                icon={<CreditCardIcon />}
                                                                                                small
                                                                                                onClick={() => handleOpenImageModal(signataire.cni_photo_recto_url, `CNI Recto S${index + 1}`)}
                                                                                            />
                                                                                        </Grid>
                                                                                    )}
                                                                                    {signataire.cni_photo_verso_url && (
                                                                                        <Grid item xs={6}>
                                                                                            <DocumentCard 
                                                                                                title="CNI Verso"
                                                                                                icon={<CreditCardIcon />}
                                                                                                small
                                                                                                onClick={() => handleOpenImageModal(signataire.cni_photo_verso_url, `CNI Verso S${index + 1}`)}
                                                                                            />
                                                                                        </Grid>
                                                                                    )}
                                                                                    {signataire.nui_image_url && (
                                                                                        <Grid item xs={6}>
                                                                                            <DocumentCard 
                                                                                                title="NUI"
                                                                                                icon={<FingerprintIcon />}
                                                                                                small
                                                                                                onClick={() => handleOpenImageModal(signataire.nui_image_url, `NUI S${index + 1}`)}
                                                                                            />
                                                                                        </Grid>
                                                                                    )}
                                                                                </Grid>
                                                                            </Grid>
                                                                        </Grid>
                                                                    </CardContent>
                                                                </Card>
                                                            </Grid>
                                                        </React.Fragment>
                                                    )
                                                ))}
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                )}

                                {/* Documents juridiques */}
                                <Accordion 
                                    expanded={expandedAccordions.documentsJuridiques}
                                    onChange={handleAccordionChange('documentsJuridiques')}
                                    sx={{ borderRadius: '8px !important', mb: 2 }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <DescriptionOutlineIcon sx={{ color: '#6366f1' }} />
                                            <Typography variant="h6" fontWeight="700">Documents Juridiques</Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Tabs value={activeDocTab} onChange={(e, v) => setActiveDocTab(v)} sx={{ mb: 3 }}>
                                            <Tab label="Images" />
                                            <Tab label="PDF" />
                                            <Tab label="Localisation" />
                                        </Tabs>

                                        {activeDocTab === 0 && (
                                            <Grid container spacing={2}>
                                                {/* Documents images selon type d'entreprise */}
                                                {detail?.type_entreprise === 'association' ? (
                                                    <>
                                                        {urls.pvAgcUrl && (
                                                            <Grid item xs={12} md={4}>
                                                                <DocumentCard 
                                                                    title="PV de l'AGC"
                                                                    icon={<DocumentScannerIcon />}
                                                                    onClick={() => handleOpenImageModal(urls.pvAgcUrl, 'PV de l\'AGC')}
                                                                />
                                                            </Grid>
                                                        )}
                                                        {urls.attestationNonRedevanceUrl && (
                                                            <Grid item xs={12} md={4}>
                                                                <DocumentCard 
                                                                    title="Attestation de non redevance"
                                                                    icon={<AssignmentIcon />}
                                                                    onClick={() => handleOpenImageModal(urls.attestationNonRedevanceUrl, 'Attestation de non redevance')}
                                                                />
                                                            </Grid>
                                                        )}
                                                        {urls.procesVerbalUrl && (
                                                            <Grid item xs={12} md={4}>
                                                                <DocumentCard 
                                                                    title="Procès Verbal"
                                                                    icon={<InsertDriveFileIcon />}
                                                                    onClick={() => handleOpenImageModal(urls.procesVerbalUrl, 'Procès Verbal')}
                                                                />
                                                            </Grid>
                                                        )}
                                                        {urls.registreCoopUrl && (
                                                            <Grid item xs={12} md={4}>
                                                                <DocumentCard 
                                                                    title="Registre COOP-GIC"
                                                                    icon={<ListAltIcon />}
                                                                    onClick={() => handleOpenImageModal(urls.registreCoopUrl, 'Registre COOP-GIC')}
                                                                />
                                                            </Grid>
                                                        )}
                                                        {urls.recepisseDeclarationUrl && (
                                                            <Grid item xs={12} md={4}>
                                                                <DocumentCard 
                                                                    title="Récépissé de déclaration"
                                                                    icon={<NoteAddIcon />}
                                                                    onClick={() => handleOpenImageModal(urls.recepisseDeclarationUrl, 'Récépissé de déclaration')}
                                                                />
                                                            </Grid>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {urls.extraitRccmUrl && (
                                                            <Grid item xs={12} md={4}>
                                                                <DocumentCard 
                                                                    title="Extrait RCCM"
                                                                    icon={<DocumentScannerIcon />}
                                                                    onClick={() => handleOpenImageModal(urls.extraitRccmUrl, 'Extrait RCCM')}
                                                                />
                                                            </Grid>
                                                        )}
                                                        {urls.titrePatenteUrl && (
                                                            <Grid item xs={12} md={4}>
                                                                <DocumentCard 
                                                                    title="Titre de Patente"
                                                                    icon={<AssignmentIcon />}
                                                                    onClick={() => handleOpenImageModal(urls.titrePatenteUrl, 'Titre de Patente')}
                                                                />
                                                            </Grid>
                                                        )}
                                                        {urls.niuImageMoraleUrl && (
                                                            <Grid item xs={12} md={4}>
                                                                <DocumentCard 
                                                                    title="Photocopie NUI"
                                                                    icon={<FingerprintIcon />}
                                                                    onClick={() => handleOpenImageModal(urls.niuImageMoraleUrl, 'Photocopie NUI Entreprise')}
                                                                />
                                                            </Grid>
                                                        )}
                                                        {urls.statutsUrl && (
                                                            <Grid item xs={12} md={4}>
                                                                <DocumentCard 
                                                                    title="Photocopie des Statuts"
                                                                    icon={<InsertDriveFileIcon />}
                                                                    onClick={() => handleOpenImageModal(urls.statutsUrl, 'Photocopie des Statuts')}
                                                                />
                                                            </Grid>
                                                        )}
                                                    </>
                                                )}
                                            </Grid>
                                        )}

                                        {activeDocTab === 1 && (
                                            <Grid container spacing={2}>
                                                {urls.acteDesignationPdfUrl && (
                                                    <Grid item xs={12} md={6}>
                                                        <PdfDocumentCard 
                                                            title="Acte de Désignation des Signataires"
                                                            onClick={() => window.open(urls.acteDesignationPdfUrl, '_blank')}
                                                        />
                                                    </Grid>
                                                )}
                                                {urls.listeConseilPdfUrl && (
                                                    <Grid item xs={12} md={6}>
                                                        <PdfDocumentCard 
                                                            title="Liste Conseil d'Administration"
                                                            onClick={() => window.open(urls.listeConseilPdfUrl, '_blank')}
                                                        />
                                                    </Grid>
                                                )}
                                                {urls.listeMembresPdfUrl && (
                                                    <Grid item xs={12} md={6}>
                                                        <PdfDocumentCard 
                                                            title="Liste des Membres"
                                                            onClick={() => window.open(urls.listeMembresPdfUrl, '_blank')}
                                                        />
                                                    </Grid>
                                                )}
                                            </Grid>
                                        )}

                                        {activeDocTab === 2 && (
                                            <Grid container spacing={2}>
                                                {urls.planSiegeUrl && (
                                                    <Grid item xs={12} md={4}>
                                                        <DocumentCard 
                                                            title="Plan localisation siège"
                                                            icon={<MapIcon />}
                                                            onClick={() => handleOpenImageModal(urls.planSiegeUrl, 'Plan localisation siège')}
                                                        />
                                                    </Grid>
                                                )}
                                                {urls.factureEauSiegeUrl && (
                                                    <Grid item xs={12} md={4}>
                                                        <DocumentCard 
                                                            title="Facture eau siège"
                                                            icon={<WaterIcon />}
                                                            onClick={() => handleOpenImageModal(urls.factureEauSiegeUrl, 'Facture eau siège')}
                                                        />
                                                    </Grid>
                                                )}
                                                {urls.factureElecSiegeUrl && (
                                                    <Grid item xs={12} md={4}>
                                                        <DocumentCard 
                                                            title="Facture électricité siège"
                                                            icon={<BoltIcon />}
                                                            onClick={() => handleOpenImageModal(urls.factureElecSiegeUrl, 'Facture électricité siège')}
                                                        />
                                                    </Grid>
                                                )}
                                                {domicilePhotoUrl && (
                                                    <Grid item xs={12} md={4}>
                                                        <DocumentCard 
                                                            title="Photo localisation domicile"
                                                            icon={<HomeIcon />}
                                                            onClick={() => handleOpenImageModal(domicilePhotoUrl, 'Photo localisation domicile')}
                                                        />
                                                    </Grid>
                                                )}
                                                {activitePhotoUrl && (
                                                    <Grid item xs={12} md={4}>
                                                        <DocumentCard 
                                                            title="Photo localisation activité"
                                                            icon={<BusinessIcon />}
                                                            onClick={() => handleOpenImageModal(activitePhotoUrl, 'Photo localisation activité')}
                                                        />
                                                    </Grid>
                                                )}
                                            </Grid>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            </>
                        )}
                    </Grid>
                </Grid>
            </Box>

            {/* Modal pour afficher les images */}
            <Dialog
                open={openImageModal}
                onClose={handleCloseModal}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{currentImageTitle}</Typography>
                    <IconButton onClick={handleCloseModal}>
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

function InfoRow({ label, value, small = false }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant={small ? "body2" : "body1"} sx={{ color: '#64748b', fontWeight: small ? 500 : 600 }}>
                {label}
            </Typography>
            <Typography variant={small ? "body2" : "body1"} sx={{ color: '#1E293B', fontWeight: small ? 600 : 700 }}>
                {value || "Non renseigné"}
            </Typography>
        </Box>
    );
}

function DetailField({ label, value, icon, small = false }) {
    return (
        <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                {icon && <Box sx={{ color: '#94A3B8', mt: 0.5 }}>{icon}</Box>}
                <Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                        {label}
                    </Typography>
                    <Typography variant={small ? "body2" : "body1"} sx={{ color: '#334155', fontWeight: small ? 600 : 700 }}>
                        {value || "Non renseigné"}
                    </Typography>
                </Box>
            </Box>
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

function DocumentCard({ title, icon, onClick, small = false }) {
    return (
        <Card 
            variant="outlined" 
            sx={{ 
                borderRadius: 2, 
                cursor: 'pointer', 
                '&:hover': { borderColor: '#6366f1', bgcolor: '#f8fafc' },
                height: small ? 80 : 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2
            }}
            onClick={onClick}
        >
            <Box sx={{ color: '#6366f1', mb: 1 }}>{icon}</Box>
            <Typography 
                variant={small ? "caption" : "body2"} 
                sx={{ 
                    fontWeight: 600, 
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: small ? 2 : 3,
                    WebkitBoxOrient: 'vertical'
                }}
            >
                {title}
            </Typography>
        </Card>
    );
}

function PdfDocumentCard({ title, onClick }) {
    return (
        <Card 
            variant="outlined" 
            sx={{ 
                borderRadius: 2, 
                cursor: 'pointer', 
                '&:hover': { borderColor: '#ef4444', bgcolor: '#fef2f2' },
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2
            }}
            onClick={onClick}
        >
            <PdfIcon sx={{ color: '#ef4444', fontSize: 40, mb: 1 }} />
            <Typography 
                variant="body2" 
                sx={{ 
                    fontWeight: 600, 
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                }}
            >
                {title}
            </Typography>
        </Card>
    );
}