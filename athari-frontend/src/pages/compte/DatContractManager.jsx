import React, { useEffect, useState } from "react";
import { 
  Box, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, TextField, 
  Avatar, Paper, Typography, Dialog, DialogTitle, DialogContent, 
  DialogActions, Grid, MenuItem, LinearProgress, CircularProgress, 
  Divider, Tabs, Tab, Stack, Tooltip, InputAdornment
} from "@mui/material";
import { 
  Add, Search, Assignment, Close, CheckCircleOutline, InfoOutlined, 
  AccountBalanceWallet, DateRange, Redo
} from "@mui/icons-material";
import { indigo, green, blue } from "@mui/material/colors";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";

export default function DatContractManager() {
  // --- ÉTATS DES DONNÉES ---
  const [contracts, setContracts] = useState([]);
  const [datTypes, setDatTypes] = useState([]);
  const [accounts, setAccounts] = useState([]); 
  
  // --- ÉTATS DE L'UI ---
  const [tabIndex, setTabIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openCloture, setOpenCloture] = useState(false);

  // --- ÉTATS CALCULS / DÉTAILS ---
  const [selectedContract, setSelectedContract] = useState(null);
  const [calculatedDetails, setCalculatedDetails] = useState(null);
  const [simuData, setSimuData] = useState({ amount: 1000000, typeId: '' });
  const [backendSimulation, setBackendSimulation] = useState(null);
  const [simuLoading, setSimuLoading] = useState(false);

  // --- ÉTAT FORMULAIRE CORRIGÉ (DATE EXECUTION + MATURITE) ---
  const [formData, setFormData] = useState({
    client_source_account_id: '',
    account_id: '', 
    dat_type_id: '',
    montant: '',
    taux_interet_annuel: '',
    periodicite: 'E',
    date_execution: new Date().toISOString().split('T')[0], 
            date_valeur: new Date().toISOString().split('T')[0],

    date_maturite: '', 
    destination_interet_id: '',
    destination_capital_id: ''
  });

  const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

  // --- CHARGEMENT INITIAL ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resC, resT, resA] = await Promise.all([
        ApiClient.get("/dat/contracts"),
        ApiClient.get("/dat/types"),
        ApiClient.get("/comptes") 
      ]);
      setContracts(resC.data?.donnees || []);
      setDatTypes(resT.data?.donnees || []);
      setAccounts(resA.data?.data?.data || resA.data?.donnees || []);
      
      if (resT.data?.donnees?.length > 0 && !simuData.typeId) {
        setSimuData(prev => ({ ...prev, typeId: resT.data.donnees[0].id }));
      }
    } catch (error) { console.error("Erreur de chargement:", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- LOGIQUE SIMULATION LATERALE ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (simuData.amount && simuData.typeId) runSimulation();
    }, 600);
    return () => clearTimeout(timer);
  }, [simuData]);

  const runSimulation = async () => {
    setSimuLoading(true);
    try {
      const res = await ApiClient.post("/dat/simulate", { montant: simuData.amount, dat_type_id: simuData.typeId });
      setBackendSimulation(res.data.simulation);
    } catch (e) { setBackendSimulation(null); } 
    finally { setSimuLoading(false); }
  };

  // --- ACTIONS CONTRATS ---
  const handleShowDetails = async (contract) => {
    setCalculatedDetails(null);
    setSelectedContract(contract);
    setOpenDetails(true);
    try {
      const res = await ApiClient.get(`/dat/${contract.id}`);
      setCalculatedDetails(res.data.donnees);
    } catch (e) { setOpenDetails(false); }
  };

  const handleValidateContract = async (id) => {
    if(!window.confirm("Valider l'activation du contrat et générer les écritures ?")) return;
    setLoading(true);
    try {
        await ApiClient.post(`/dat/${id}/valider`);
        fetchData();
    } catch (e) { alert(e.response?.data?.message || "Erreur de validation"); } 
    finally { setLoading(false); }
  };

  const handleOpenClotureModal = async (contract) => {
    setSelectedContract(contract);
    setOpenCloture(true);
    try {
        const res = await ApiClient.get(`/dat/${contract.id}`);
        setCalculatedDetails(res.data.donnees);
    } catch (e) { console.error(e); }
  };

  const handleConfirmCloturer = async () => {
    setSubmitLoading(true);
    try {
      await ApiClient.post(`/dat/${selectedContract.id}/cloturer`);
      setOpenCloture(false);
      fetchData(); 
    } catch (error) { alert(error.response?.data?.message); } 
    finally { setSubmitLoading(false); }
  };

  // --- LOGIQUE FORMULAIRE : CALCUL MATURITÉ AUTO ---
  const handleTypeSelection = (typeId) => {
    const type = datTypes.find(t => t.id === typeId);
    if (type) {
      // Calcul automatique de la date de maturité basé sur la date d'exécution
      const dateBase = new Date(formData.date_execution);
      dateBase.setMonth(dateBase.getMonth() + parseInt(type.duree_mois || 0));
      const formattedDate = dateBase.toISOString().split('T')[0];

      setFormData({ 
        ...formData, 
        dat_type_id: typeId, 
        taux_interet_annuel: type.taux_interet,
        date_maturite: formattedDate 
      });
    }
  };

  const handleSubscribe = async () => {
    setSubmitLoading(true);
    try {
      await ApiClient.post("/dat/contracts", formData);
      setOpen(false);
      fetchData();
    } catch (error) { 
      alert(error.response?.data?.message || "Erreur lors de la création. Vérifiez les champs obligatoires."); 
    } 
    finally { setSubmitLoading(false); }
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'ACTIF': return 'success';
          case 'EN_ATTENTE': return 'warning';
          case 'CLOTURE': return 'default';
          default: return 'primary';
      }
  };

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        
        {/* HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: indigo[500], background: activeGradient }}><Assignment /></Avatar>
            Gestion des DAT
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setTabIndex(0); setOpen(true); }}
            sx={{ borderRadius: 3, background: activeGradient, fontWeight: 'bold' }}>
            Nouvelle Souscription
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* LISTE DES CONTRATS */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ borderRadius: 5, p: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
              <TextField fullWidth placeholder="Rechercher par référence..." onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />

              <TableContainer>
                {loading ? <LinearProgress /> : (
                  <Table>
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 'bold', color: '#64748B' } }}>
                        <TableCell>Référence / Compte</TableCell>
                        <TableCell>Capital</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contracts.filter(c => c.numero_ordre?.includes(search)).map((c) => (
                        <TableRow key={c.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">{c.numero_ordre || 'Saisie...'}</Typography>
                            <Typography variant="caption" color="textSecondary">{c.compte?.numero_compte}</Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{new Intl.NumberFormat().format(c.montant_initial)} F</TableCell>
                          <TableCell>
                            <Chip label={c.statut} size="small" color={getStatusColor(c.statut)} sx={{ fontWeight: 'bold' }} />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              {c.statut === 'EN_ATTENTE' && (
                                <Tooltip title="Activer"><IconButton size="small" sx={{ color: green[600], bgcolor: green[50] }} onClick={() => handleValidateContract(c.id)}><CheckCircleOutline fontSize="small" /></IconButton></Tooltip>
                              )}
                              <Tooltip title="Détails"><IconButton size="small" onClick={() => handleShowDetails(c)} sx={{ color: blue[600] }}><InfoOutlined fontSize="small" /></IconButton></Tooltip>
                              {c.statut === 'ACTIF' && (
                                <Tooltip title="Rupture"><IconButton size="small" color="error" onClick={() => handleOpenClotureModal(c)}><Close fontSize="small" /></IconButton></Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TableContainer>
            </Paper>
          </Grid>

          {/* SIMULATEUR LATÉRAL */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ borderRadius: 5, p: 3, border: '1px solid #E2E8F0' }}>
              <Typography variant="h6" fontWeight="800" gutterBottom><InfoOutlined color="primary" sx={{mr:1}}/> Simulation Rapide</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField fullWidth label="Montant" type="number" value={simuData.amount} onChange={(e) => setSimuData({...simuData, amount: e.target.value})} />
                <TextField select fullWidth label="Offre DAT" value={simuData.typeId} onChange={(e) => setSimuData({...simuData, typeId: e.target.value})}>
                  {datTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.libelle}</MenuItem>)}
                </TextField>
                <Box sx={{ p: 2, bgcolor: '#F1F5F9', borderRadius: 3 }}>
                    {simuLoading ? <CircularProgress size={20} /> : (
                        <Box>
                            <Typography variant="caption" color="textSecondary">Échéance : {backendSimulation?.date_fin || '...'}</Typography>
                            <Typography variant="h5" fontWeight="900" color="primary">{new Intl.NumberFormat().format(backendSimulation?.total_echeance || 0)} F</Typography>
                        </Box>
                    )}
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* --- MODALE SOUSCRIPTION (3 ÉTAPES) --- */}
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
          <DialogTitle sx={{ fontWeight: 800, bgcolor: '#F8FAFC' }}>
              <Stack direction="row" alignItems="center" spacing={1}><Add color="primary"/> Nouvelle Souscription DAT</Stack>
          </DialogTitle>
          <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="1. Comptes" icon={<AccountBalanceWallet/>} iconPosition="start" />
            <Tab label="2. Conditions" icon={<DateRange/>} iconPosition="start" />
            <Tab label="3. Destination" icon={<Redo/>} iconPosition="start" />
          </Tabs>
          
          <DialogContent sx={{ p: 4 }}>
            {tabIndex === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    type="date" 
                    label="Date d'exécution (Mise en place)" 
                    value={formData.date_execution} 
                    onChange={(e) => setFormData({...formData, date_execution: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    helperText="Requis par le système"
                  />
                </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField 
                        fullWidth 
                        type="date" 
                        label="Date Valeur (Intérêts)" 
                        value={formData.date_valeur} 
                        onChange={(e) => setFormData({...formData, date_valeur: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                <Grid item xs={12} md={6}>
                  <TextField select sx={{ minWidth: 200}} label="Compte Source (Débit)" value={formData.client_source_account_id}
                    onChange={(e) => setFormData({...formData, client_source_account_id: e.target.value, destination_interet_id: e.target.value, destination_capital_id: e.target.value})}>
                    {accounts.filter(a => !a.numero_compte.startsWith('25') && !a.numero_compte.startsWith('36')).map(acc => (
                      <MenuItem key={acc.id} value={acc.id}>{acc.numero_compte} - {acc.intitule}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField select sx={{ minWidth: 200}}  label="Compte Scellement (36xx)" value={formData.account_id}
                    onChange={(e) => setFormData({...formData, account_id: e.target.value})}>
                    {accounts.filter(a => a.numero_compte.startsWith('36') || a.numero_compte.startsWith('25')).map(acc => (
                      <MenuItem key={acc.id} value={acc.id}>{acc.numero_compte}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField select sx={{minWidth: 200}} label="Offre DAT" value={formData.dat_type_id} onChange={(e) => handleTypeSelection(e.target.value)}>
                    {datTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.libelle} ({t.duree_mois} mois)</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Montant DAT" type="number" value={formData.montant} onChange={(e) => setFormData({...formData, montant: e.target.value})} 
                  InputProps={{ endAdornment: <InputAdornment position="end">F CFA</InputAdornment> }}/>
                </Grid>
              </Grid>
            )}

            {tabIndex === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <TextField fullWidth label="Taux Annuel (%)" value={formData.taux_interet_annuel} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField select fullWidth label="Paiement Intérêts" value={formData.periodicite} onChange={(e) => setFormData({...formData, periodicite: e.target.value})}>
                    <MenuItem value="E">À l'échéance</MenuItem>
                    <MenuItem value="M">Mensuel</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Tooltip title="Calculée automatiquement selon la date d'exécution et l'offre">
                    <TextField fullWidth type="date" label="Date de Maturité" value={formData.date_maturite} 
                        InputLabelProps={{ shrink: true }} 
                        InputProps={{ readOnly: true, sx: { bgcolor: '#F1F5F9' } }} 
                    />
                  </Tooltip>
                </Grid>
              </Grid>
            )}

            {tabIndex === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField select sx={{minWidth: 250}} label="Retour Capital vers..." value={formData.destination_capital_id}
                    onChange={(e) => setFormData({...formData, destination_capital_id: e.target.value})}>
                    {accounts.map(acc => <MenuItem key={acc.id} value={acc.id}>{acc.numero_compte} - {acc.intitule}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField select sx={{minWidth: 250}} label="Versement Intérêts vers..." value={formData.destination_interet_id}
                    onChange={(e) => setFormData({...formData, destination_interet_id: e.target.value})}>
                    {accounts.map(acc => <MenuItem key={acc.id} value={acc.id}>{acc.numero_compte} - {acc.intitule}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, bgcolor: '#F8FAFC' }}>
            <Button onClick={() => setOpen(false)} color="inherit">Annuler</Button>
            {tabIndex > 0 && <Button onClick={() => setTabIndex(tabIndex - 1)}>Précédent</Button>}
            {tabIndex < 2 ? (
              <Button variant="contained" onClick={() => setTabIndex(tabIndex + 1)}>Suivant</Button>
            ) : (
              <Button variant="contained" onClick={handleSubscribe} disabled={submitLoading} sx={{background: activeGradient}}>
                {submitLoading ? <CircularProgress size={20} /> : "Confirmer le Placement"}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* --- MODALE DÉTAILS --- */}
        <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800 }}>Détails : {selectedContract?.numero_ordre}</DialogTitle>
            <DialogContent>
                {calculatedDetails ? (
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <Box sx={{ p: 2, bgcolor: indigo[50], borderRadius: 3 }}>
                            <Typography variant="subtitle2" color="indigo">Situation Actuelle</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2">Initial :</Typography>
                                <Typography variant="body2" fontWeight="bold">{new Intl.NumberFormat().format(selectedContract?.montant_initial)} F</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Intérêts courus :</Typography>
                                <Typography variant="body2" fontWeight="bold" color="success.main">+{new Intl.NumberFormat().format(calculatedDetails?.interets_courus || 0)} F</Typography>
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="caption">Progression Temps ({calculatedDetails?.jours_ecoules}j / {calculatedDetails?.duree_totale_jours}j)</Typography>
                            <LinearProgress variant="determinate" value={(calculatedDetails?.jours_ecoules / calculatedDetails?.duree_totale_jours) * 100 || 0} sx={{ height: 10, borderRadius: 5, mt: 1 }} />
                        </Box>
                    </Stack>
                ) : <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
            </DialogContent>
            <DialogActions><Button onClick={() => setOpenDetails(false)}>Fermer</Button></DialogActions>
        </Dialog>

        {/* --- MODALE CLÔTURE --- */}
        <Dialog open={openCloture} onClose={() => setOpenCloture(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ color: 'error.main', fontWeight: 800 }}>Rupture de Contrat</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2">Capital :</Typography><Typography fontWeight="bold">{new Intl.NumberFormat().format(calculatedDetails?.capital_actuel || 0)} F</Typography></Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="error">Pénalités :</Typography><Typography fontWeight="bold" color="error">-{new Intl.NumberFormat().format(calculatedDetails?.penalites || 0)} F</Typography></Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography fontWeight="bold">Net à reverser :</Typography><Typography variant="h6" fontWeight="900" color="primary">{new Intl.NumberFormat().format(calculatedDetails?.montant_final || 0)} F</Typography></Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenCloture(false)}>Annuler</Button>
                <Button variant="contained" color="error" onClick={handleConfirmCloturer} disabled={submitLoading}>Confirmer la Rupture</Button>
            </DialogActions>
        </Dialog>

      </Box>
    </Layout>
  );
}