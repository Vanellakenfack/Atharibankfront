// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, Button, CircularProgress, 
    List, ListItem, ListItemIcon, ListItemText, Divider, Alert, Card, CardContent,
    Snackbar, Table, TableBody, TableCell, TableRow, TableContainer
} from '@mui/material';
import { 
    CheckCircle as CheckIcon, 
    ErrorOutline as ErrorIcon, 
    Calculate as CalculateIcon,
    HistoryEdu as ReportIcon,
    SettingsSuggest as ProcessIcon,
    PictureAsPdf as PdfIcon,
    LockOutlined as LockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api/ApiClient';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';

const TraitementFinJournee = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    const [activeSession, setActiveSession] = useState<any>(null);
    const [statusData, setStatusData] = useState<any>(null);
    const [bilanData, setBilanData] = useState<any>(null);
    
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [processDone, setProcessDone] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'error' | 'info' | 'success' });

    const initPage = async () => {
        try {
            setVerifying(true);
            const sessionResponse = await apiClient.get('/sessions/agence/active');
            
            if (sessionResponse.data.statut === 'success' && sessionResponse.data.session) {
                const session = sessionResponse.data.session;
                setActiveSession(session);

                const statusResponse = await apiClient.get(`/sessions/etat-agence/${session.id}`);
                setStatusData(statusResponse.data);
            } else {
                setSnackbar({ 
                    open: true, 
                    message: "Aucune session agence ouverte n'a été trouvée.", 
                    severity: 'error' 
                });
            }
        } catch (error) {
            console.error("Erreur d'initialisation:", error);
            setSnackbar({ open: true, message: "Erreur de communication avec le serveur", severity: 'error' });
        } finally {
            setVerifying(false);
        }
    };

    useEffect(() => {
        initPage();
    }, []);

    const handleLancerTFJ = async () => {
        if (!activeSession?.id || !activeSession?.jour_comptable_id) {
            setSnackbar({ open: true, message: "Données de session incomplètes", severity: 'error' });
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post('/sessions/traiter-bilan-agence', {
                agence_session_id: activeSession.id,
                jour_comptable_id: activeSession.jour_comptable_id
            });
            
            setBilanData(response.data.bilan || response.data.data); 
            setProcessDone(true);
            setSnackbar({ open: true, message: "TFJ calculé avec succès", severity: 'success' });
        } catch (error: any) {
            const msg = error.response?.data?.error || error.response?.data?.message || "Erreur lors du traitement";
            setSnackbar({ open: true, message: msg, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePrintPDF = async () => {
        // CORRECTION : Vérification avant appel pour éviter le /null
        if (!activeSession?.jour_comptable_id) {
            setSnackbar({ open: true, message: "Identifiant de journée manquant pour l'impression", severity: 'error' });
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.get(`/sessions/imprimer-brouillard/${activeSession.jour_comptable_id}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Brouillard_Agence_${activeSession.date_comptable || 'export'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove(); // Nettoyage du DOM
            setSnackbar({ open: true, message: "Téléchargement du rapport lancé", severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: "Erreur lors de la génération du PDF", severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const canStart = statusData?.guichets_ouverts === 0;

    if (verifying) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress size={60} thickness={4} />
            <Typography sx={{ mt: 2, fontWeight: 600, color: 'text.secondary' }}>Synchronisation avec le serveur...</Typography>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <Box component="main" sx={{ 
                flexGrow: 1, 
                width: `calc(100% - ${sidebarOpen ? '260px' : '80px'})`,
                transition: 'width 0.3s ease'
            }}>
                <TopBar sidebarOpen={sidebarOpen} />

                <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
                    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
                        
                        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Traitement de Fin de Journée (TFJ)
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Agence : <strong>{activeSession?.nom_agence || 'Principale'}</strong> | 
                                Date Comptable : <strong>{activeSession?.date_comptable || 'N/A'}</strong>
                            </Typography>
                        </Paper>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={7}>
                                <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', mb: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                                        <ProcessIcon color="primary" /> État des contrôles
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                {canStart ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Clôture des guichets" 
                                                secondary={canStart ? "Tous les guichets sont fermés." : `${statusData?.guichets_ouverts} guichet(s) encore en activité.`} 
                                            />
                                        </ListItem>
                                        <Divider variant="inset" component="li" />
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckIcon color="success" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Flux de données" 
                                                secondary="Toutes les transactions sont prêtes pour la consolidation." 
                                            />
                                        </ListItem>
                                    </List>

                                    {!canStart && !processDone && (
                                        <Alert severity="error" sx={{ mt: 2, borderRadius: '8px' }}>
                                            <strong>Traitement bloqué :</strong> Veuillez fermer toutes les sessions de guichet avant de continuer.
                                        </Alert>
                                    )}
                                </Paper>

                                {processDone && bilanData && (
                                    <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #BBF7D0', bgcolor: '#F0FDF4' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#166534' }}>Bilan Consolidé de l'Agence</Typography>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ border: 0, px: 0 }}>Cumul Entrées (Espèces)</TableCell>
                                                        <TableCell align="right" sx={{ border: 0, fontWeight: 700, color: 'green' }}>{bilanData.total_especes_entree} XAF</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell sx={{ border: 0, px: 0 }}>Cumul Sorties (Espèces)</TableCell>
                                                        <TableCell align="right" sx={{ border: 0, fontWeight: 700, color: 'red' }}>{bilanData.total_especes_sortie} XAF</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell sx={{ border: 0, px: 0, pt: 2 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Encaisse Théorique Finale</Typography>
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ border: 0, pt: 2 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{bilanData.solde_theorique_global} XAF</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                )}
                            </Grid>

                            <Grid item xs={12} md={5}>
                                <Card sx={{ 
                                    height: '100%', borderRadius: '16px', border: '2px dashed',
                                    borderColor: processDone ? '#10B981' : '#CBD5E1', textAlign: 'center'
                                }}>
                                    <CardContent sx={{ py: 6 }}>
                                        {!processDone ? (
                                            <>
                                                <CalculateIcon sx={{ fontSize: 80, color: (canStart && activeSession) ? 'primary.main' : '#E2E8F0', mb: 2 }} />
                                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Calcul Global</Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                                                    Générer les écritures de synthèse pour l'agence.
                                                </Typography>
                                                <Button 
                                                    variant="contained" 
                                                    fullWidth 
                                                    disabled={!canStart || loading || !activeSession}
                                                    onClick={handleLancerTFJ}
                                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />}
                                                    sx={{ borderRadius: '12px', py: 2 }}
                                                >
                                                    Lancer le Traitement
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <CheckIcon sx={{ fontSize: 80, color: '#10B981', mb: 1 }} />
                                                <Typography variant="h5" sx={{ color: '#065F46', fontWeight: 700, mb: 3 }}>Synthèse Terminée</Typography>
                                                
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <Grid container spacing={1}>
                                                        <Grid item xs={6}>
                                                            <Button fullWidth variant="outlined" startIcon={<ReportIcon />} onClick={() => navigate('/rapports/bilan-agence')}>
                                                                Détails
                                                            </Button>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            {/* CORRECTION : Bouton désactivé si l'ID est null */}
                                                            <Button 
                                                                fullWidth 
                                                                variant="outlined" 
                                                                color="secondary" 
                                                                startIcon={<PdfIcon />} 
                                                                onClick={handlePrintPDF}
                                                                disabled={loading || !activeSession?.jour_comptable_id}
                                                            >
                                                                PDF
                                                            </Button>
                                                        </Grid>
                                                    </Grid>

                                                    <Button 
                                                        fullWidth variant="contained" color="success" startIcon={<LockIcon />}
                                                        onClick={() => navigate('/cloture-finale')}
                                                        sx={{ borderRadius: '10px', py: 1.5, fontWeight: 'bold' }}
                                                    >
                                                        Aller à la Clôture Finale
                                                    </Button>
                                                    <Button size="small" onClick={() => setProcessDone(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                                                        Refaire le calcul
                                                    </Button>
                                                </Box>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <Snackbar 
                            open={snackbar.open} 
                            autoHideDuration={6000} 
                            onClose={() => setSnackbar({ ...snackbar, open: false })}
                        >
                            <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                                {snackbar.message}
                            </Alert>
                        </Snackbar>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default TraitementFinJournee;