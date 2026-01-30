import React, { useState, useEffect } from 'react';
import { 
    Box, Grid, Paper, Typography, Button, TextField, 
    Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress, Card, CardContent, Divider,
    IconButton, Chip, Avatar, Tabs, Tab
} from '@mui/material';
import { 
    ReceiptLong, Person, LockOpen, Fingerprint, Close, 
    AccountBalanceWallet, InfoOutlined, ErrorOutline, 
    History, CheckCircleOutline, CancelOutlined
} from '@mui/icons-material';
import { indigo, red, green } from "@mui/material/colors";

import Layout from "../../../../components/layout/Layout"; 

import ApiClient from '../../../../services/api/ApiClient';

const ListeValidationRetrait = () => {
    // --- ÉTATS ---
    const [tabValue, setTabValue] = useState(0); // 0: Approuvés, 1: Rejetés
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedTr, setSelectedTr] = useState(null);
    const [otpCode, setOtpCode] = useState('');

    const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

    // --- LOGIQUE ---
    const loadTransactions = async (statusTab) => {
        setLoading(true);
        try {
            // On change l'URL selon l'onglet sélectionné
            const endpoint = statusTab === 0 
                ? '/caisse/retrait-distance/approuvees' 
                : '/caisse/retrait-distance/rejetes'; // Assurez-vous que cette route existe côté API
                
            const res = await ApiClient.get(endpoint);
            setTransactions(res.data.data || []);
        } catch (err) {
            console.error("Erreur chargement:", err);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions(tabValue);
    }, [tabValue]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleOpenConfirm = (tr) => {
        setSelectedTr(tr);
        setOtpCode('');
        setOpenModal(true);
    };

    const handleFinalSubmit = async () => {
        setConfirmLoading(true);
        try {
            await ApiClient.post(`/caisse/retrait-distance/${selectedTr.id}/confirmer`, {
                code_validation: otpCode
            });
            setOpenModal(false);
            loadTransactions(0);
            alert("Paiement effectué avec succès !");
        } catch (err) {
            alert(err.response?.data?.message || "Code invalide");
        } finally {
            setConfirmLoading(false);
        }
    };

    return (
        <Layout>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
                
                {/* --- HEADER --- */}
                <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: indigo[500], background: activeGradient }}>
                                <ReceiptLong />
                            </Avatar>
                            Suivi des Retraits a distance
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                            Gestion des décaissements et historique des décisions
                        </Typography>
                    </Box>
                    <Button 
                        startIcon={<InfoOutlined />} 
                        variant="outlined" 
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 'bold' }}
                        onClick={() => loadTransactions(tabValue)}
                    >
                        Actualiser
                    </Button>
                </Box>

                {/* --- ONGLETS --- */}
                <Paper sx={{ borderRadius: 4, mb: 4, bgcolor: '#fff', p: 0.5, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange} 
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        sx={{
                            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px' },
                            '& .MuiTab-root': { fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }
                        }}
                    >
                        <Tab icon={<CheckCircleOutline />} iconPosition="start" label="En attente de paiement" />
                        <Tab icon={<CancelOutlined />} iconPosition="start" label="Retraits rejetés" />
                    </Tabs>
                </Paper>

                {/* --- CONTENU --- */}
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 10 }}>
                        <CircularProgress size={50} thickness={4} sx={{ mb: 2, color: indigo[500] }} />
                        <Typography variant="body1" color="textSecondary" fontWeight="500">Synchronisation des données...</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {transactions.length === 0 ? (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 6, border: '2px dashed #CBD5E1', bgcolor: 'transparent' }}>
                                    {tabValue === 0 ? <AccountBalanceWallet sx={{ fontSize: 60, color: '#CBD5E1', mb: 2 }} /> : <History sx={{ fontSize: 60, color: '#CBD5E1', mb: 2 }} />}
                                    <Typography variant="h6" color="textSecondary" fontWeight="600">
                                        {tabValue === 0 ? "Aucun retrait prêt pour décaissement." : "Aucun retrait rejeté dans l'historique."}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ) : (
                            transactions.map((tr) => (
                                <Grid item xs={12} md={6} lg={4} key={tr.id}>
                                    <Card sx={{ 
                                        borderRadius: 5, 
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.04)', 
                                        border: '1px solid #F1F5F9',
                                        position: 'relative',
                                        overflow: 'visible'
                                    }}>
                                        {/* Badge de statut personnalisé */}
                                        <Box sx={{ 
                                            position: 'absolute', top: -10, right: 20,
                                            bgcolor: tabValue === 0 ? green[500] : red[500],
                                            color: 'white', px: 2, py: 0.5, borderRadius: '20px',
                                            fontSize: '0.75rem', fontWeight: 'bold', boxShadow: 3
                                        }}>
                                            {tabValue === 0 ? 'APPROUVÉ CA' : 'REJETÉ'}
                                        </Box>

                                        <CardContent sx={{ p: 3, pt: 4 }}>
                                            <Typography variant="h6" sx={{ fontWeight: '800', color: '#1E293B' }}>
                                                {tr.compte?.client?.nom_complet}
                                            </Typography>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 1 }}>
                                                <Person fontSize="small" sx={{ mr: 0.5 }} />
                                                <Typography variant="body2">Compte: {tr.compte?.numero_compte}</Typography>
                                            </Box>

                                            <Divider sx={{ my: 2.5, borderStyle: 'dashed' }} />

                                            {/* Si rejeté, afficher le motif */}
                                            {tabValue === 1 && (
                                                <Box sx={{ mb: 2, p: 1.5, bgcolor: '#FFF1F2', borderRadius: 2, border: '1px solid #FECDD3' }}>
                                                    <Typography variant="caption" color="#BE123C" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <ErrorOutline sx={{ fontSize: 16 }} /> MOTIF DU REJET :
                                                    </Typography>
                                                    <Typography variant="body2" color="#9F1239" sx={{ mt: 0.5 }}>
                                                        {tr.motif_rejet || "Non spécifié par le responsable"}
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="caption" display="block" color="textSecondary">Montant</Typography>
                                                    <Typography variant="h5" sx={{ fontWeight: '900', color: tabValue === 0 ? indigo[600] : '#64748B' }}>
                                                        {new Intl.NumberFormat().format(tr.montant_brut)} <small style={{ fontSize: '0.7rem' }}>FCFA</small>
                                                    </Typography>
                                                </Box>

                                                {tabValue === 0 && (
                                                    <Button 
                                                        variant="contained" 
                                                        onClick={() => handleOpenConfirm(tr)}
                                                        startIcon={<LockOpen />}
                                                        sx={{ 
                                                            borderRadius: '12px', 
                                                            background: activeGradient,
                                                            fontWeight: 'bold', textTransform: 'none'
                                                        }}
                                                    >
                                                        decaisser
                                                    </Button>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        )}
                    </Grid>
                )}

                {/* --- MODAL OTP (Inchangé) --- */}
                <Dialog open={openModal} onClose={() => !confirmLoading && setOpenModal(false)} PaperProps={{ sx: { borderRadius: 5 } }} maxWidth="xs" fullWidth>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 3 }}>
                        <Typography variant="h6" fontWeight="900">Validation OTP</Typography>
                        <IconButton onClick={() => setOpenModal(false)} disabled={confirmLoading}><Close /></IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ textAlign: 'center', py: 2 }}>
                        <Avatar sx={{ width: 70, height: 70, bgcolor: '#EEF2FF', color: indigo[500], mx: 'auto', mb: 2 }}><Fingerprint sx={{ fontSize: 40 }} /></Avatar>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>Saisissez le code secret fourni par le client pour finaliser le décaissement.</Typography>
                        <TextField
                            fullWidth
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                            inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '2rem', letterSpacing: '0.5rem', fontWeight: '900' } }}
                            placeholder="000000"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: '15px', bgcolor: '#F8FAFC' } }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button fullWidth variant="contained" size="large" disabled={otpCode.length !== 6 || confirmLoading} onClick={handleFinalSubmit} sx={{ py: 1.5, borderRadius: '15px', fontWeight: 'bold', background: activeGradient }}>
                            {confirmLoading ? <CircularProgress size={24} color="inherit" /> : "VALIDER LE PAIEMENT"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default ListeValidationRetrait;