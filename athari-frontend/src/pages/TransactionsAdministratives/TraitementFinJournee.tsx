import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, Button, CircularProgress, 
    List, ListItem, ListItemIcon, ListItemText, Divider, Alert, Card, CardContent,
    Snackbar, Table, TableBody, TableCell, TableContainer, TableRow
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
    
    const agenceSessionId = localStorage.getItem('session_agence_id');
    const jourComptableId = localStorage.getItem('jour_comptable_id');
    const dateComptable = localStorage.getItem('date_comptable');

    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [statusData, setStatusData] = useState<any>(null);
    const [bilanData, setBilanData] = useState<any>(null);
    const [processDone, setProcessDone] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'error' | 'info' | 'success' });

    const checkStatus = async () => {
        if (!agenceSessionId) {
            setSnackbar({ open: true, message: "Aucune session active trouvée", severity: 'error' });
            setVerifying(false);
            return;
        }
        try {
            setVerifying(true);
            const response = await apiClient.get(`/sessions/etat-agence/${agenceSessionId}`);
            setStatusData(response.data);
        } catch (error) {
            setSnackbar({ open: true, message: "Erreur de connexion au serveur", severity: 'error' });
        } finally {
            setVerifying(false);
        }
    };

    useEffect(() => { checkStatus(); }, []);

    const handleLancerTFJ = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post('/sessions/traiter-bilan-agence', {
                agence_session_id: agenceSessionId,
                jour_comptable_id: jourComptableId
            });
            setBilanData(response.data.bilan || response.data.data); 
            setProcessDone(true);
            setSnackbar({ open: true, message: "Traitement terminé avec succès", severity: 'success' });
        } catch (error: any) {
            const msg = error.response?.data?.error || "Erreur lors du traitement";
            setSnackbar({ open: true, message: msg, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePrintPDF = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/sessions/imprimer-brouillard/${jourComptableId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Brouillard_Journee_${dateComptable}.pdf`);
            document.body.appendChild(link);
            link.click();
            setSnackbar({ open: true, message: "Téléchargement du rapport lancé", severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: "Erreur lors de la génération du PDF", severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (verifying) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress size={60} thickness={4} />
            <Typography sx={{ mt: 2, fontWeight: 600, color: 'text.secondary' }}>Vérification des guichets en cours...</Typography>
        </Box>
    );

    const canStart = statusData?.guichets_ouverts === 0;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            {/* SIDEBAR */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* CONTENU PRINCIPAL */}
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    width: `calc(100% - ${sidebarOpen ? '260px' : '80px'})`,
                    transition: 'width 0.3s ease'
                }}
            >
                {/* TOPBAR */}
                <TopBar sidebarOpen={sidebarOpen} />

                {/* ZONE DE TRAVAIL */}
                <Box sx={{ px: { xs: 2, md: 4 }, py: 4, flexGrow: 1 }}>
                    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                        Traitement de Fin de Journée (TFJ)
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Agence : <strong>{statusData?.nom_agence || 'Principale'}</strong> | Session du : <strong>{dateComptable || 'N/A'}</strong>
                    </Typography>
                </Box>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                            <ProcessIcon color="primary" /> Points de contrôle
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    {canStart ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Disponibilité des guichets" 
                                    secondary={canStart ? "Tous les guichets sont fermés et prêts." : `${statusData?.guichets_ouverts} guichet(s) encore actif(s).`} 
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                            <ListItem>
                                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                <ListItemText primary="Synchronisation" secondary="Toutes les écritures de la journée sont intégrées." />
                            </ListItem>
                        </List>
                        {!canStart && !processDone && (
                            <Alert severity="warning" sx={{ mt: 2, borderRadius: '8px' }}>
                                <strong>Action requise :</strong> Tous les guichets doivent être fermés.
                            </Alert>
                        )}
                    </Paper>

                    {processDone && (
                        <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #BBF7D0', bgcolor: '#F0FDF4' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#166534' }}>Récapitulatif Consolidé</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{ border: 0, px: 0 }}>Total Entrées</TableCell>
                                            <TableCell align="right" sx={{ border: 0, fontWeight: 700, color: 'green' }}>{bilanData?.total_especes_entree} XAF</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ border: 0, px: 0 }}>Total Sorties</TableCell>
                                            <TableCell align="right" sx={{ border: 0, fontWeight: 700, color: 'red' }}>{bilanData?.total_especes_sortie} XAF</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ border: 0, px: 0, pt: 2 }}><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Solde Théorique Global</Typography></TableCell>
                                            <TableCell align="right" sx={{ border: 0, pt: 2 }}><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{bilanData?.solde_theorique_global} XAF</Typography></TableCell>
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
                        <CardContent sx={{ py: 4 }}>
                            {!processDone ? (
                                <>
                                    <CalculateIcon sx={{ fontSize: 80, color: '#64748B', mb: 2 }} />
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Calcul des Bilans</Typography>
                                    <Button 
                                        variant="contained" fullWidth disabled={!canStart || loading}
                                        onClick={handleLancerTFJ}
                                        startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <CalculateIcon />}
                                        sx={{ borderRadius: '12px', py: 2, mt: 3 }}
                                    >
                                        Lancer le Traitement
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <CheckIcon sx={{ fontSize: 80, color: '#10B981', mb: 1 }} />
                                    <Typography variant="h5" sx={{ color: '#065F46', fontWeight: 700, mb: 3 }}>Traitement Réussi</Typography>
                                    
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={6}>
                                                <Button fullWidth variant="outlined" startIcon={<ReportIcon />} onClick={() => navigate('/rapports/bilan-agence')}>
                                                    Voir Bilan
                                                </Button>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Button fullWidth variant="outlined" color="secondary" startIcon={<PdfIcon />} onClick={handlePrintPDF}>
                                                    Exporter
                                                </Button>
                                            </Grid>
                                        </Grid>

                                        <Button 
                                            fullWidth variant="contained" color="success" startIcon={<LockIcon />}
                                            onClick={() => navigate('/cloture-finale')}
                                            sx={{ borderRadius: '10px', py: 1.5, fontWeight: 'bold' }}
                                        >
                                            Clôture Finale
                                        </Button>
                                        <Button size="small" onClick={() => setProcessDone(false)} sx={{ textTransform: 'none' }}>Réinitialiser</Button>
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default TraitementFinJournee;