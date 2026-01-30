import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, TextField, Button, 
  CircularProgress, Card, CardContent, Autocomplete,
  Avatar, Snackbar, Alert, InputAdornment
} from '@mui/material';
import { 
  CloudUpload, Send, CheckCircle, AccountBalanceWallet, 
  Description, AttachMoney, AssignmentInd, Numbers,Fingerprint, ErrorOutline
} from '@mui/icons-material';
import { indigo } from "@mui/material/colors";
import { useNavigate } from 'react-router-dom';
import { 
  // ... vos autres icônes
  History, ArrowBack 
} from '@mui/icons-material';
// Layout & API
import Layout from "../../../components/layout/Layout"; 
import ApiClient from '../../../services/api/ApiClient';
import compteService from '../../../services/api/compteService';
import { gestionnaireService } from '../../../services/gestionnaireService/gestionnaireApi';

const RetraitDistance = () => {
    const [loading, setLoading] = useState(false);
    const [comptes, setComptes] = useState([]);
    const [gestionnaires, setGestionnaires] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const navigate = useNavigate()
    const [selectedCompte, setSelectedCompte] = useState(null); // Pour stocker l'objet compte complet
    const [cniVerif, setCniVerif] = useState(''); // Ce que le caissier tape
    const [isCniValid, setIsCniValid] = useState(null); // null (attente), true (ok), false (erreur)
    const [formData, setFormData] = useState({
        compte_id: '',
        montant_brut: '',
        gestionnaire_id: '',
        numero_bordereau: '',
        type_bordereau: 'RETRAIT_DISTANCE',

        commissions: 0,
        taxes: 0,
        origine_fonds: '',
        reference_externe: ''
    });

    const [files, setFiles] = useState({
        pj_demande_retrait: null,
        pj_procuration: null
    });

    const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

    // Style pour s'assurer que les champs prennent toute la largeur et sont bien lisibles
    const fieldStyle = {
        width: '100%',
        "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            backgroundColor: "#fff",
        }
    };

    const [sessionInfo, setSessionInfo] = useState({
    agenceNom: 'Chargement...',
    guichetNom: 'Chargement...',
    caisseNom: 'Chargement...',
    dateOperation: '' // Nouvelle clé
});

// Ajoutez cet useEffect pour charger les infos de la caisse au montage du composant
useEffect(() => {
    const fetchSessionActive = async () => {
        try {
            const response = await ApiClient.get('/caisse/session-active'); // Adaptez l'URL selon votre API
            if (response.data) {
                const { caisse, date_operation } = response.data; // Assure-toi que l'API renvoie date_operation
                setSessionInfo({
                    agenceNom: caisse.guichet.agence.nom,
                    guichetNom: caisse.guichet.nom,
                    caisseNom: caisse.libelle || caisse.code,
                    // Utilise la date du serveur, c'est crucial en banque !
                    dateOperation: date_operation || new Date().toLocaleDateString('fr-FR') 
                });
            }
        } catch (error) {
            console.error("Erreur session:", error);
        }
    };
    fetchSessionActive();
}, []);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [accountsRes, managersRes] = await Promise.all([
                    compteService.getComptes(),
                    gestionnaireService.getAllGestionnaires()
                ]);
                setComptes(accountsRes || []);
                setGestionnaires(managersRes.data || []);
            } catch (error) {
                console.error("Erreur de chargement:", error);
                showSnackbar("Erreur lors du chargement des données", "error");
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
    if (selectedCompte && cniVerif) {
                // Nettoyage des espaces pour éviter les erreurs de saisie inutiles
                const cniSaisie = cniVerif.trim().toLowerCase();
                const cniEnBD = (selectedCompte.client?.physique?.cni_numero || '').trim().toLowerCase();
                
                setIsCniValid(cniSaisie === cniEnBD);
            } else {
                setIsCniValid(null);
            }
        }, [cniVerif, selectedCompte]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleFileChange = (e, type) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [type]: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
        dataToSend.append('pj_demande_retrait', files.pj_demande_retrait);
        dataToSend.append('pj_procuration', files.pj_procuration);
        dataToSend.append('bordereau_retrait', files.bordereau_retrait);

        dataToSend.append('billetage', '');

        try {
            const response = await ApiClient.post('/caisse/retrait-distance', dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.success) {
                showSnackbar("Demande envoyée avec succès au Chef d'Agence !");
                setFormData({ compte_id: '', montant_brut: '', gestionnaire_id: '', numero_bordereau: '', type_bordereau: 'RETRAIT_DISTANCE' });
                setFiles({ pj_demande_retrait: null, pj_procuration: null , bordereau_retrait: null});
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Erreur lors de l'envoi";
            showSnackbar(errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
                
                <Box sx={{ mb: 4 , 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', // Aligne le titre à gauche et le bouton à droite
                    flexWrap: 'wrap',
                    gap: 2}}>

                    
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: indigo[500], background: activeGradient }}>
                            <AccountBalanceWallet />
                        </Avatar>
                        Retrait à Distance
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        Initialisation d'un dossier de retrait pour validation hiérarchique
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<History />}
                    onClick={() => navigate('/listevalidationRD')} // Changez l'URL ici
                    sx={{ 
                        borderRadius: '10px', 
                        textTransform: 'none', 
                        fontWeight: 'bold',
                        borderColor: indigo[500],
                        color: indigo[500],
                        '&:hover': {
                            borderWidth: '2px',
                            backgroundColor: 'rgba(99, 102, 241, 0.04)'
                        }
                    }}
                    >
                        VOIR ETAT DES RETRAITS A DISTANCES EN ATTENTE
                    </Button>

               <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[
                        { label: "Date Comptable", value: sessionInfo.dateOperation, icon: "📅" },
                        { label: "Agence", value: sessionInfo.agenceNom, icon: "🏦" },
                        { label: "Guichet", value: sessionInfo.guichetNom, icon: "🏢" },
                        { label: "Caisse", value: sessionInfo.caisseNom, icon: "💰" }
                    ].map((field, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <TextField
                                fullWidth
                                label={field.label}
                                value={field.value}
                                InputProps={{ 
                                    readOnly: true,
                                    startAdornment: <InputAdornment position="start">{field.icon}</InputAdornment>
                                }}
                                variant="filled"
                                size="small"
                                sx={{ 
                                    bgcolor: '#FFFFFF', 
                                    borderRadius: 2,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    "& .MuiFilledInput-root": { backgroundColor: 'transparent' }
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Section Principale élargie à lg={8} */}
                        <Grid item xs={12} lg={8}>
                            <Paper sx={{ p: 4, borderRadius: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                                <Typography variant="h6" fontWeight="800" sx={{ mb: 3, color: indigo[900], display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AttachMoney color="primary" /> Informations de l'opération
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    {/* CHAMP NUMÉRO DE COMPTE : Maintenant sur toute la largeur de la section */}
                                      <Grid item xs={12}>
                                        <Autocomplete
                                            fullWidth
                                            options={comptes}
                                            // Permet de s'assurer que la liste déroulante peut être plus large que le champ si nécessaire
                                            slotProps={{
                                            popper: {
                                                sx: { width: 'fit-content', minWidth: '300px' }
                                            }
                                            }}
                                            getOptionLabel={(option) => 
                                            option ? `${option.numero_compte} - ${option.client?.nom_complet} ` : ''
                                            }
                                                onChange={(event, newValue) => {
                                                    setSelectedCompte(newValue); // Crucial pour avoir accès à newValue.client.cni
                                                    setFormData({...formData, compte_id: newValue ? newValue.id : ''});
                                                }}                                            
                                            // PERSONNALISATION DE L'AFFICHAGE DES OPTIONS
                                            renderOption={(props, option) => (
                                            <Box component="li" {...props} sx={{ whiteSpace: 'nowrap', px: 2 }}>
                                                <Typography variant="body1">
                                                <strong>{option.numero_compte}</strong> — {option.client?.nom_complet} 
                                                </Typography>
                                            </Box>
                                            )}

                                            renderInput={(params) => (
                                            <TextField 
                                                {...params} 
                                                label="Compte à débiter *" 
                                                variant="outlined" 
                                                sx={{
                                                ...fieldStyle,
                                                "& .MuiInputBase-input": {
                                                    // Empêche le texte de se cacher derrière les icônes à droite
                                                    overflow: 'visible', 
                                                    textOverflow: 'clip' 
                                                },
                                                minWidth: '350px'
                                                }} 
                                            />
                                            )}
                                        />
                                       </Grid>

                                       <Grid item xs={12}>
                                            <Box sx={{ 
                                                p: 2, mt: 1, borderRadius: 3, border: '1px dashed',
                                                bgcolor: isCniValid === true ? '#F0FDF4' : isCniValid === false ? '#FEF2F2' : '#F8FAFC', 
                                                borderColor: isCniValid === true ? 'success.main' : isCniValid === false ? 'error.main' : '#CBD5E1'
                                            }}>
                                                <TextField
                                                    fullWidth
                                                    label="Contrôle CNI (Vérification physique)"
                                                    placeholder="Saisissez le numéro de CNI présenté par le client"
                                                    value={cniVerif}
                                                    onChange={(e) => setCniVerif(e.target.value)}
                                                    disabled={!selectedCompte}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Fingerprint color={isCniValid === true ? "success" : "action"} />
                                                            </InputAdornment>
                                                        ),
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                {isCniValid === true && <CheckCircle color="success" />}
                                                                {isCniValid === false && <ErrorOutline color="error" />}
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                    error={isCniValid === false}
                                                    helperText={isCniValid === false ? "Le numéro ne correspond pas au titulaire !" : "La comparaison est sensible à la casse et aux espaces."}
                                                />
                                            </Box>
                                        </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth label="Montant Brut (FCFA) *"
                                            type="number"
                                            value={formData.montant_brut}
                                            onChange={(e) => setFormData({...formData, montant_brut: e.target.value})}
                                            sx={fieldStyle}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth label="Numéro du Bordereau *"
                                            value={formData.numero_bordereau}
                                            onChange={(e) => setFormData({...formData, numero_bordereau: e.target.value})}
                                            sx={fieldStyle}
                                        />
                                    </Grid>
                                    {/* ... après le champ Numéro du Bordereau ... */}

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Commissions (FCFA)"
                                            type="number"
                                            value={formData.commissions}
                                            onChange={(e) => setFormData({...formData, commissions: e.target.value})}
                                            sx={fieldStyle}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">💰</InputAdornment>,
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Taxes (FCFA)"
                                            type="number"
                                            value={formData.taxes}
                                            onChange={(e) => setFormData({...formData, taxes: e.target.value})}
                                            sx={fieldStyle}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Origine des Fonds"
                                            placeholder="Ex: Épargne, Salaire..."
                                            value={formData.origine_fonds}
                                            onChange={(e) => setFormData({...formData, origine_fonds: e.target.value})}
                                            sx={fieldStyle}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Référence Externe"
                                            placeholder="Ex: N° Chèque ou référence virement"
                                            value={formData.reference_externe}
                                            onChange={(e) => setFormData({...formData, reference_externe: e.target.value})}
                                            sx={fieldStyle}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Autocomplete
                                            fullWidth
                                            options={gestionnaires}
                                            getOptionLabel={(option) => `${option.gestionnaire_nom} ${option.gestionnaire_prenom}`}
                                            onChange={(event, newValue) => setFormData({...formData, gestionnaire_id: newValue ? newValue.id : ''})}
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params} 
                                                    label="Gestionnaire Responsable *" 
                                                    variant="outlined" 
                                                    sx={fieldStyle}
                                                    InputProps={{ ...params.InputProps, startAdornment: <AssignmentInd sx={{ mr: 1, color: 'action.active' }} /> }} 
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <Paper sx={{ p: 4, borderRadius: 5, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', height: '100%' }}>
                                <Typography variant="h6" fontWeight="800" sx={{ mb: 3, color: indigo[900], display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Description color="secondary" /> Pièces Jointes
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, borderStyle: 'dashed', bgcolor: files.pj_demande_retrait ? '#F0FDF4' : '#F8FAFC' }}>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="700" gutterBottom>Demande de retrait signée</Typography>
                                            <Button
                                                component="label"
                                                variant={files.pj_demande_retrait ? "contained" : "outlined"}
                                                color={files.pj_demande_retrait ? "success" : "primary"}
                                                startIcon={files.pj_demande_retrait ? <CheckCircle /> : <CloudUpload />}
                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                            >
                                                {files.pj_demande_retrait ? "Document prêt" : "Choisir le fichier"}
                                                <input type="file" hidden accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'pj_demande_retrait')} />
                                            </Button>
                                            {files.pj_demande_retrait && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{files.pj_demande_retrait.name}</Typography>}
                                        </CardContent>
                                    </Card>

                                    <Card variant="outlined" sx={{ borderRadius: 3, borderStyle: 'dashed', bgcolor: files.pj_procuration ? '#F0FDF4' : '#F8FAFC' }}>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="700" gutterBottom> Procuration</Typography>
                                            <Button
                                                component="label"
                                                variant={files.pj_procuration ? "contained" : "outlined"}
                                                color={files.pj_procuration ? "success" : "primary"}
                                                startIcon={files.pj_procuration ? <CheckCircle /> : <CloudUpload />}
                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                            >
                                                {files.pj_procuration ? "Document prêt" : "Choisir le fichier"}
                                                <input type="file" hidden accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'pj_procuration')} />
                                            </Button>
                                            {files.pj_procuration && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{files.pj_procuration.name}</Typography>}
                                        </CardContent>
                                    </Card>

                                    <Card variant="outlined" sx={{ borderRadius: 3, borderStyle: 'dashed', bgcolor: files.bordereau_retrait ? '#F0FDF4' : '#F8FAFC' }}>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="700" gutterBottom> Bordereau de retrait</Typography>
                                            <Button
                                                component="label"
                                                variant={files.bordereau_retrait ? "contained" : "outlined"}
                                                color={files.bordereau_retrait ? "success" : "primary"}
                                                startIcon={files.bordereau_retrait ? <CheckCircle /> : <CloudUpload />}
                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                            >
                                                {files.bordereau_retrait ? "Document prêt" : "Choisir le fichier"}
                                                <input type="file" hidden accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'bordereau_retrait')} />
                                            </Button>
                                            {files.bordereau_retrait && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{files.bordereau_retrait.name}</Typography>}
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                <Button variant="text" color="inherit" sx={{ fontWeight: 'bold' }}>Annuler</Button>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    size="large"
                                    disabled={loading || !files.pj_demande_retrait || !files.pj_procuration || isCniValid !== true || !formData.compte_id}
                                    sx={{ 
                                        background: activeGradient, 
                                        borderRadius: 3, 
                                        px: 6, 
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                                    }}
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                >
                                    {loading ? "Traitement..." : "Soumettre pour Validation"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>

                <Snackbar 
                    open={snackbar.open} 
                    autoHideDuration={6000} 
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Layout>
    );
};

export default RetraitDistance;

