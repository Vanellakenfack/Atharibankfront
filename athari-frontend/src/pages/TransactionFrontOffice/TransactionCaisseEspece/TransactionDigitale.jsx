import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, TextField, Button, 
  CircularProgress, Card, CardContent, Autocomplete,
  Avatar, Snackbar, Alert, InputAdornment, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { 
  Send, AccountBalanceWallet, AttachMoney, PhoneIphone, 
  PersonSearch, Dialpad, ReceiptLong, AccountCircle
} from '@mui/icons-material';
import { indigo, orange, yellow } from "@mui/material/colors";
import Layout from "../../../components/layout/Layout"; 
import ApiClient from '../../../services/api/ApiClient';
import compteService from '../../../services/api/compteService';

const TransactionDigitale = () => {
    const [loading, setLoading] = useState(false);
    const [comptes, setComptes] = useState([]);
    const [clientNature, setClientNature] = useState('passage'); // 'passage' ou 'banque'
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const [formData, setFormData] = useState({
        type_flux: 'VERSEMENT',
        type_versement: 'ORANGE_MONEY',
        montant_brut: '',
        compte_id: null,
        telephone_client: '',
        reference_externe: '',
        commissions: 0
    });

    const activeGradient = formData.type_versement === 'ORANGE_MONEY' 
        ? 'linear-gradient(135deg, #FF7900 0%, #ff9d45 100%)' // Orange Style
        : 'linear-gradient(135deg, #ffcc00 0%, #ffdb4d 100%)'; // MTN Style

    const fieldStyle = {
        width: '100%',
        "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: "#fff" }
    };

    useEffect(() => {
        if (clientNature === 'banque') {
            const loadComptes = async () => {
                try {
                    const res = await compteService.getComptes();
                    setComptes(res || []);
                } catch (error) { console.error(error); }
            };
            loadComptes();
        } else {
            setFormData(prev => ({ ...prev, compte_id: null }));
        }
    }, [clientNature]);

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // Construction du payload SANS l'enveloppe "data"
        const payload = {
            type_flux: formData.type_flux,
            type_versement: formData.type_versement,
            montant_brut: formData.montant_brut,
            compte_id: formData.compte_id,
            telephone_client: formData.telephone_client,
            reference_externe: formData.reference_externe,
            commissions: formData.commissions,
            nature_client: clientNature,
            // On envoie le billetage à plat au même niveau
            billetage: formData.type_flux === 'RETRAIT' ? billetage : []
        };

        // Debug pour vérifier la structure dans ta console avant l'envoi
        console.log("Payload envoyé au backend:", payload);

        const response = await ApiClient.post('/caisse/operation', payload);

        if (response.data.status === 'success') {
            alert('Transaction validée ! Réf: ' + response.data.reference_bancaire);
            setSnackbar({ 
                open: true, 
                message: 'Transaction validée ! Ref: ' + response.data.reference_bancaire, 
                severity: 'success' 
            });
            // Reset form...
        }
    } catch (error) {
        console.error("Erreur détaillée:", error.response?.data);
        alert('Erreur de validation: ' + (error.response?.data?.message || error.message));     
        setSnackbar({ 
            open: true, 
            message: error.response?.data?.message || 'Erreur de validation', 
            severity: 'error' 
        });
    } finally { 
        setLoading(false); 
    }
};
    const [billetage, setBilletage] = useState([
    { valeur: 10000, quantite: 0 },
    { valeur: 5000, quantite: 0 },
    { valeur: 2000, quantite: 0 },
    { valeur: 1000, quantite: 0 },
    { valeur: 500, quantite: 0 },
]);

// Fonction pour mettre à jour une coupure
const handleBilletageChange = (valeur, qty) => {
    setBilletage(prev => prev.map(b => 
        b.valeur === valeur ? { ...b, quantite: parseInt(qty) || 0 } : b
    ));
};

// Calcul du total billetage pour vérification visuelle
const totalBilletage = billetage.reduce((sum, b) => sum + (b.valeur * b.quantite), 0);

    return (
        <Layout>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
                
                {/* Header avec switch Opérateur */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ sx: 56, bg: indigo[500], background: activeGradient }}>
                            <PhoneIphone />
                        </Avatar>
                        Flux Digital {formData.type_versement.replace('_', ' ')}
                    </Typography>

                    <ToggleButtonGroup
                        value={formData.type_versement}
                        exclusive
                        onChange={(e, val) => val && setFormData({...formData, type_versement: val})}
                        sx={{ bgcolor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                    >
                        <ToggleButton value="ORANGE_MONEY" sx={{ fontWeight: 'bold', color: orange[800] }}>Orange Money</ToggleButton>
                        <ToggleButton value="MOBILE_MONEY" sx={{ fontWeight: 'bold', color: '#EAB308' }}>MTN MoMo</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} lg={8}>
                            <Paper sx={{ p: 4, borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                                
                                <Typography variant="h6" fontWeight="800" sx={{ mb: 3, color: indigo[900], display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccountCircle color="primary" /> Nature du Client & Destination
                                </Typography>

                                <Box sx={{ mb: 4, p: 2, bgcolor: '#F1F5F9', borderRadius: 3, textAlign: 'center' }}>
                                    <ToggleButtonGroup
                                        color="primary"
                                        value={clientNature}
                                        exclusive
                                        onChange={(e, val) => val && setClientNature(val)}
                                        fullWidth
                                    >
                                        <ToggleButton value="passage">CLIENT DE PASSAGE (EXTERNE)</ToggleButton>
                                        <ToggleButton value="banque">CLIENT DE LA BANQUE (INTERNE)</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>

                                <Grid container spacing={3}>
                                    {clientNature === 'banque' ? (
                                        <Grid item xs={12}>
                                            <Autocomplete
                                                options={comptes}
                                                getOptionLabel={(option) => `${option.numero_compte} - ${option.client?.nom_complet}`}
                                                onChange={(e, val) => setFormData({...formData, compte_id: val?.id})}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Compte du client bancaire *" sx={fieldStyle} 
                                                        InputProps={{ ...params.InputProps, startAdornment: <PersonSearch sx={{mr:1}} /> }}
                                                    />

                                                    
                                                )}
                                                
                                            /><br />
                                            <TextField 
                                                fullWidth label="Numéro de téléphone (Momo/OM) *" 
                                                placeholder="Ex: +221770000000"
                                                value={formData.telephone_client}
                                                onChange={(e) => setFormData({...formData, telephone_client: e.target.value})}
                                                sx={fieldStyle}
                                                InputProps={{ startAdornment: <Dialpad sx={{mr:1, color: 'gray'}} /> }}
                                            />
                                        </Grid>

                                        
                                    ) : (
                                        <Grid item xs={12}>
                                            <TextField 
                                                fullWidth label="Numéro de téléphone (Momo/OM) *" 
                                                placeholder="Ex: +221770000000"
                                                value={formData.telephone_client}
                                                onChange={(e) => setFormData({...formData, telephone_client: e.target.value})}
                                                sx={fieldStyle}
                                                InputProps={{ startAdornment: <Dialpad sx={{mr:1, color: 'gray'}} /> }}
                                            />
                                        </Grid>
                                    )}

                                    {formData.type_flux === 'RETRAIT' && (
                                        <Grid item xs={12}>
                                            <Box sx={{ mt: 2, p: 3, border: '1px dashed #cbd5e1', borderRadius: 4, bgcolor: '#f8fafc' }}>
                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: indigo[500] }}>
                                                    BILLETAGE PHYSIQUE (SORTIE DE CAISSE)
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    {billetage.map((billet) => (
                                                        <Grid item xs={6} sm={4} md={2.4} key={billet.valeur}>
                                                            <TextField
                                                                label={`${billet.valeur} FCFA`}
                                                                type="number"
                                                                size="small"
                                                                value={billet.quantite}
                                                                onChange={(e) => handleBilletageChange(billet.valeur, e.target.value)}
                                                                sx={fieldStyle}
                                                            />
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                                    <Typography variant="body2" color={totalBilletage !== Number(formData.montant_brut) ? "error" : "success.main"} fontWeight="bold">
                                                        Total Billetage: {totalBilletage.toLocaleString()} / {Number(formData.montant_brut).toLocaleString()} FCFA
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    )}

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            select
                                            fullWidth label="Type d'opération *"
                                            SelectProps={{ native: true }}
                                            value={formData.type_flux}
                                            onChange={(e) => setFormData({...formData, type_flux: e.target.value})}
                                            sx={fieldStyle}
                                        >
                                            <option value="VERSEMENT">VERSEMENT (Cash vers Mobile)</option>
                                            <option value="RETRAIT">RETRAIT (Mobile vers Cash)</option>
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth label="Montant Brut (FCFA) *"
                                            type="number"
                                            value={formData.montant_brut}
                                            onChange={(e) => setFormData({...formData, montant_brut: e.target.value})}
                                            sx={fieldStyle}
                                            InputProps={{ startAdornment: <AttachMoney /> }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <Paper sx={{ p: 4, borderRadius: 5, border: '1px solid #F1F5F9' }}>
                                <Typography variant="h6" fontWeight="800" sx={{ mb: 3, color: indigo[900], display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ReceiptLong color="secondary" /> Détails Opérateur
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <TextField
                                        fullWidth label="Référence de l'Opérateur *"
                                        placeholder="Ex: PP260131.0824..."
                                        value={formData.reference_externe}
                                        onChange={(e) => setFormData({...formData, reference_externe: e.target.value})}
                                        sx={fieldStyle}
                                        helperText="Saisissez l'ID de transaction reçu sur le terminal"
                                    />

                                    <TextField
                                        fullWidth label="Commissions (Optionnel)"
                                        type="number"
                                        value={formData.commissions}
                                        onChange={(e) => setFormData({...formData, commissions: e.target.value})}
                                        sx={fieldStyle}
                                    />

                                    <Card sx={{ bgcolor: indigo[50], borderRadius: 3, mt: 2 }}>
                                        <CardContent>
                                            <Typography variant="caption" color="textSecondary" uppercase>Récapitulatif</Typography>
                                            <Typography variant="h5" fontWeight="bold" color={indigo[900]}>
                                                {Number(formData.montant_brut).toLocaleString()} FCFA
                                            </Typography>
                                            <Typography variant="body2">
                                                Mode: <strong>{formData.type_versement}</strong>
                                            </Typography>
                                        </CardContent>
                                    </Card>

                                    <Button 
                                        type="submit" 
                                        variant="contained" 
                                        fullWidth
                                        disabled={loading || !formData.montant_brut || !formData.reference_externe}
                                        sx={{ 
                                            background: activeGradient, 
                                            borderRadius: 3, py: 2, fontWeight: 'bold',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                    >
                                        Valider la Transaction
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Layout>
    );
};

export default TransactionDigitale;