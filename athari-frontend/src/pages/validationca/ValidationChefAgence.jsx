import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, CircularProgress, 
  Grid, Card, CardContent, Avatar, IconButton, TextField,
  Snackbar, Alert, Tabs, Tab, Chip, Divider
} from '@mui/material';
import { 
  Visibility, ImageNotSupported, Close, Assignment,
  HourglassEmpty, CheckCircle, Cancel, History, CopyAll
} from '@mui/icons-material';
import { indigo, green, orange, red } from "@mui/material/colors";

// Layout & API
import Layout from "../../components/layout/Layout"; 
import ApiClient from '../../services/api/ApiClient'; 

export default function ValidationChefAgence() {
    // --- ÉTATS ---
    const [tabValue, setTabValue] = useState(0); // 0: En attente, 1: Historique (Approuvés/Rejetés)
    const [demandes, setDemandes] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // États pour les actions
    const [openRejetModal, setOpenRejetModal] = useState(false);
    const [motifRejet, setMotifRejet] = useState('');
    const [validationCode, setValidationCode] = useState(null);
    const [openSuccessModal, setOpenSuccessModal] = useState(false);

    const BASE_URL = "http://localhost:8000"; 
    const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

    // --- LOGIQUE ---
    const getImageUrl = (path) => {
        if (!path) return null;
        const cleanPath = path.replace(/^public\//, '');
        return `${BASE_URL}/storage/${cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath}`;
    };

    const fetchDemandes = async (currentTab) => {
        setLoading(true);
        try {
            // Route dynamique selon l'onglet
            const endpoint = currentTab === 0 
                ? '/caisse/retrait-distance/en-attente' 
                : '/caisse/retrait-distance/rejetes'; // Vous pouvez aussi créer une route "historique" globale
            
            const response = await ApiClient.get(endpoint);
            setDemandes(response.data.data || []);
        } catch (error) {
            console.error("Erreur:", error);
            showSnackbar("Erreur lors du chargement des dossiers", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDemandes(tabValue);
    }, [tabValue]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // --- ACTIONS ---
    const handleApprouver = async (id) => {
        if (!window.confirm(`Voulez-vous vraiment approuver cette demande ?`)) return;
        try {
            const response = await ApiClient.post(`/caisse/retrait-distance/${id}/approuver`);
            if (response.data.success) {
                setValidationCode(response.data.code_validation);
                setOpenSuccessModal(true);
                setOpenModal(false);
                fetchDemandes(tabValue);
            }
        } catch (error) {
            showSnackbar(error.response?.data?.message || "Erreur serveur", "error");
        }
    };

    const handleConfirmRejet = async () => {
        if (!motifRejet.trim()) {
            showSnackbar("Le motif est obligatoire pour rejeter un dossier", "warning");
            return;
        }
        try {
            const response = await ApiClient.post(`/caisse/retrait-distance/${selectedTransaction.id}/rejeter`, {
                motif: motifRejet
            });
            if (response.data.success) {
                showSnackbar("Dossier rejeté avec succès", "info");
                setOpenRejetModal(false);
                setOpenModal(false);
                setMotifRejet('');
                fetchDemandes(tabValue);
            }
        } catch (error) {
            showSnackbar(error.response?.data?.message || "Erreur lors du rejet", "error");
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(validationCode);
        showSnackbar("Code copié !", "success");
    };

    return (
        <Layout>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
                
                {/* HEADER */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: indigo[500], background: activeGradient }}>
                                <Assignment />
                            </Avatar>
                            Espace Validation CA
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                            {tabValue === 0 ? `${demandes.length} dossiers en attente de décision` : `Consulter l'historique des décisions`}
                        </Typography>
                    </Box>
                    <Button 
                        variant="outlined" 
                        onClick={() => fetchDemandes(tabValue)}
                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold', bgcolor: 'white' }}
                    >
                        Actualiser
                    </Button>
                </Box>

                {/* ONGLETS DE NAVIGATION */}
                <Paper sx={{ borderRadius: 4, mb: 3, p: 0.5, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px' },
                            '& .MuiTab-root': { fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }
                        }}
                    >
                        <Tab icon={<HourglassEmpty />} iconPosition="start" label="Dossiers en attente" />
                        <Tab icon={<History />} iconPosition="start" label="Retraits Rejetés" />
                    </Tabs>
                </Paper>

                {/* TABLEAU DE DONNÉES */}
                <Paper sx={{ borderRadius: 5, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                <TableRow sx={{ '& th': { color: '#64748B', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' } }}>
                                    <TableCell>Référence</TableCell>
                                    <TableCell>Client & Compte</TableCell>
                                    <TableCell>Montant</TableCell>
                                    <TableCell>Statut</TableCell>
                                    <TableCell>Gestionnaire</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
                                ) : demandes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                            <Typography color="textSecondary" fontWeight="500">Aucune donnée disponible dans cette section</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    demandes.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell sx={{ fontWeight: 'bold', color: indigo[600] }}>{row.reference_unique}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="700">{row.compte?.client?.nom} {row.compte?.client?.prenom}</Typography>
                                                <Typography variant="caption" color="primary">{row.compte?.numero_compte}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '800', color: '#1E293B' }}>
                                                {new Intl.NumberFormat().format(row.montant_brut)} <small>FCFA</small>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.statut_workflow || row.statut} 
                                                    size="small"
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        bgcolor: row.statut_workflow === 'REJETE_CA' ? '#FEE2E2' : '#FEF3C7',
                                                        color: row.statut_workflow === 'REJETE_CA' ? '#991B1B' : '#92400E'
                                                    }} 
                                                />
                                            </TableCell>
                                            <TableCell>{row.gestionnaire?.gestionnaire_nom || 'N/A'}</TableCell>
                                            <TableCell align="right">
                                                <Button 
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<Visibility />} 
                                                    onClick={() => { setSelectedTransaction(row); setOpenModal(true); }}
                                                    sx={{ borderRadius: 2, textTransform: 'none', background: activeGradient }}
                                                >
                                                    {tabValue === 0 ? "Décider" : "Détails"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            {/* MODALE DE DÉTAILS / EXAMEN */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Examen du dossier : {selectedTransaction?.reference_unique}
                    <IconButton onClick={() => setOpenModal(false)}><Close /></IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ bgcolor: '#F8FAFC' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ borderRadius: 3, height: '100%' }}>
                                <CardContent>
                                    <Typography variant="caption" fontWeight="800" color="textSecondary">INFOS CLIENT</Typography>
                                    <Typography variant="h6" fontWeight="800" sx={{ mt: 1 }}>
                                        {selectedTransaction?.compte?.client?.physique.nom_prenoms  }    
                                    </Typography>
                                    <Typography variant="h6" fontWeight="800" sx={{ mt: 1 }}>
                                        {selectedTransaction?.compte?.client?.physique.cni}                                         
                                    </Typography>

                                     <Typography variant="h6" fontWeight="800" sx={{ mt: 1 }}>
                                        {selectedTransaction?.compte?.client?.telephone}                                         
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">Compte : {selectedTransaction?.compte?.numero_compte}</Typography>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Typography variant="caption" fontWeight="800" color="textSecondary">MONTANT DEMANDÉ</Typography>
                                    <Typography variant="h5" fontWeight="900" color={green[700]}>
                                        {new Intl.NumberFormat().format(selectedTransaction?.montant_brut)} FCFA
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Si rejeté, on montre le motif */}
                        {selectedTransaction?.statut_workflow === 'REJETE_CA' && (
                            <Grid item xs={12} md={6}>
                                <Card sx={{ borderRadius: 3, height: '100%', border: '1px solid #FECDD3', bgcolor: '#FFF1F2' }}>
                                    <CardContent>
                                        <Typography variant="caption" fontWeight="800" color="#991B1B" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Cancel fontSize="small"/> DOSSIER REJETÉ
                                        </Typography>
                                        <Typography variant="body1" sx={{ mt: 1, fontWeight: '600', color: '#991B1B' }}>
                                            Motif : {selectedTransaction?.motif_rejet || "Non spécifié"}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                        
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800 }}>PIÈCES JUSTIFICATIVES</Typography>
                            <Grid container spacing={2}>
                                {['pj_demande_retrait', 'pj_procuration'].map((key) => (
                                    <Grid item xs={12} sm={6} key={key}>
                                        <Paper variant="outlined" sx={{ p: 1, textAlign: 'center', borderRadius: 2, bgcolor: 'white' }}>
                                            <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                {key === 'pj_demande_retrait' ? "Demande de retrait" : "Identité / Procuration"}
                                            </Typography>
                                            {selectedTransaction?.[key] ? (
                                                <img src={getImageUrl(selectedTransaction[key])} style={{ width: '100%', height: '220px', objectFit: 'contain' }} alt="Justificatif" />
                                            ) : <ImageNotSupported sx={{ fontSize: 40, opacity: 0.2 }} />}
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3, bgcolor: '#F8FAFC' }}>
                    <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 'bold' }}>Fermer</Button>
                    <Box sx={{ flexGrow: 1 }} />
                    {tabValue === 0 && (
                        <>
                            <Button 
                                color="error" 
                                variant="outlined" 
                                onClick={() => setOpenRejetModal(true)} 
                                sx={{ borderRadius: 2, fontWeight: 'bold', px: 3 }}
                            >
                                Rejeter
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={() => handleApprouver(selectedTransaction.id)}
                                sx={{ background: activeGradient, borderRadius: 2, fontWeight: 'bold', px: 4 }}
                            >
                                Approuver le retrait
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* MODALE DE MOTIF DE REJET */}
            <Dialog open={openRejetModal} onClose={() => setOpenRejetModal(false)} fullWidth maxWidth="sm" sx={{ zIndex: 1600 }}>
                <DialogTitle sx={{ fontWeight: 800, color: red[700] }}>Confirmer le rejet</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Pourquoi rejetez-vous ce dossier ?"
                        multiline
                        rows={4}
                        variant="outlined"
                        value={motifRejet}
                        onChange={(e) => setMotifRejet(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenRejetModal(false)}>Annuler</Button>
                    <Button onClick={handleConfirmRejet} variant="contained" color="error" sx={{ fontWeight: 'bold', borderRadius: 2 }}>
                        Confirmer le Rejet
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODALE DE SUCCÈS (CODE OTP) */}
            <Dialog open={openSuccessModal} onClose={() => setOpenSuccessModal(false)} PaperProps={{ sx: { borderRadius: 5, maxWidth: '400px' } }}>
                <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
                    <Avatar sx={{ bgcolor: green[500], width: 60, height: 60, mx: 'auto', mb: 2 }}>
                        <CheckCircle sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h5" fontWeight="900">Approbation Réussie</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>Transmettez ce code au client :</Typography>
                    <Box sx={{ bgcolor: '#F0FDF4', border: '2px dashed #10B981', p: 2, borderRadius: 3, mb: 2, position: 'relative' }}>
                        <Typography variant="h3" sx={{ letterSpacing: 8, fontWeight: '900', color: '#047857' }}>
                            {validationCode}
                        </Typography>
                        <IconButton onClick={handleCopyCode} sx={{ position: 'absolute', top: 5, right: 5 }}><CopyAll fontSize="small"/></IconButton>
                    </Box>
                    <Button fullWidth variant="contained" onClick={() => setOpenSuccessModal(false)} sx={{ background: activeGradient, borderRadius: 3, py: 1.5, fontWeight: 'bold' }}>
                        J'ai transmis le code
                    </Button>
                </DialogContent>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({...snackbar, open: false})}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Layout>
    );
}