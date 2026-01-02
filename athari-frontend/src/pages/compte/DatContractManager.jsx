import React, { useEffect, useState } from "react";
import { 
  Box, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, TextField, 
  InputAdornment, Avatar, Paper, Typography, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem,
  LinearProgress, Card, CardContent, CircularProgress, Divider
} from "@mui/material";
import { 
  Add, Search, AccountBalanceWallet, 
  Calculate, InfoOutlined, Close
} from "@mui/icons-material";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";

export default function DatContractManager() {
  // --- ÉTATS DES DONNÉES ---
  const [contracts, setContracts] = useState([]);
  const [datTypes, setDatTypes] = useState([]);
  const [accounts, setAccounts] = useState([]); 
  
  // --- UI STATE ---
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // --- ÉTATS SIMULATION ---
  const [simuData, setSimuData] = useState({ amount: 1000000, typeId: '' });
  const [backendSimulation, setBackendSimulation] = useState(null);
  const [simuLoading, setSimuLoading] = useState(false);

  // --- ÉTAT CLÔTURE ---
  const [clotureDialog, setClotureDialog] = useState({ open: false, data: null, contract: null });

  // --- FORMULAIRE SOUSCRIPTION ---
  const [formData, setFormData] = useState({
    account_id: '',
    dat_type_id: '',
    montant: '',
    mode_versement: 'CAPITALISATION'
  });

  const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

  // 1. CHARGEMENT DES DONNÉES (Gestion flexible des clés data/donnees)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resContracts, resTypes, resAccounts] = await Promise.all([
        ApiClient.get("/dat/contracts"),
        ApiClient.get("/dat/types"),
        ApiClient.get("/comptes") 
      ]);

      // Extraction sécurisée (Clé 'data' ou 'donnees')
      const fetchedContracts = resContracts.data?.donnees || resContracts.data?.data || [];
      const fetchedTypes = resTypes.data?.donnees || resTypes.data?.data || [];
      
 // Dans DatContractManager.jsx
console.log("DEBUG ACCOUNTS FULL RES:", resAccounts.data); // Regardez ceci dans la console

const dataAccounts = resAccounts.data?.data?.data || resAccounts.data?.donnees || [];

setAccounts(dataAccounts);
      setContracts(fetchedContracts);
      setDatTypes(fetchedTypes);
      
      // Auto-sélection du premier type pour le simulateur
      if (fetchedTypes.length > 0) {
        setSimuData(prev => ({ ...prev, typeId: fetchedTypes[0].id }));
      }
    } catch (error) { 
      console.error("Erreur chargement API:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. SIMULATION (Correction de l'erreur 405 côté Front)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (simuData.amount >= 1000 && simuData.typeId) {
        setSimuLoading(true);
        try {
          const res = await ApiClient.post("/dat/simulate", { 
            montant: simuData.amount, 
            dat_type_id: simuData.typeId 
          });
          setBackendSimulation(res.data.simulation);
        } catch (e) { 
          console.error("Erreur simulation:", e); 
        } finally { 
          setSimuLoading(false); 
        }
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [simuData]);

  // 3. LOGIQUE DE CLÔTURE
  const handleOpenCloture = async (contract) => {
    try {
      const res = await ApiClient.get(`/dat/${contract.id}`);
      setClotureDialog({ 
        open: true, 
        data: res.data.donnees || res.data.data, 
        contract 
      });
    } catch (e) { 
      alert("Impossible de récupérer les détails de clôture"); 
    }
  };

  const confirmCloture = async () => {
    setSubmitLoading(true);
    try {
      await ApiClient.post(`/dat/${clotureDialog.contract.id}/cloturer`);
      setClotureDialog({ open: false, data: null, contract: null });
      fetchData();
    } catch (e) { 
      alert(e.response?.data?.message || "Erreur lors de la clôture"); 
    } finally { 
      setSubmitLoading(false); 
    }
  };

  // 4. SOUMISSION SOUSCRIPTION
  const handleSubscribe = async () => {
    if(!formData.account_id || !formData.dat_type_id || !formData.montant) {
        alert("Veuillez remplir tous les champs");
        return;
    }
    setSubmitLoading(true);
    try {
      await ApiClient.post("/dat/subscribe", formData);
      setOpen(false);
      fetchData();
      setFormData({ account_id: '', dat_type_id: '', montant: '', mode_versement: 'CAPITALISATION' });
    } catch (error) { 
      alert(error.response?.data?.message || "Erreur de souscription"); 
    } finally { 
      setSubmitLoading(false); 
    }
  };

  const filteredContracts = Array.isArray(contracts) ? contracts.filter(c => 
    (c.compte?.numero_compte || "").includes(search) || (c.statut || "").includes(search.toUpperCase())
  ) : [];

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        
        {/* HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B' }}>Gestion des DAT</Typography>
            <Typography variant="body2" color="textSecondary">Suivi et souscription des dépôts à terme</Typography>
          </Box>
          <Button 
            variant="contained" 
            onClick={() => setOpen(true)} 
            startIcon={<Add />} 
            sx={{ background: activeGradient, borderRadius: 3, px: 3, fontWeight: 'bold', textTransform: 'none' }}
          >
            Nouvelle Souscription
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* LISTE DES CONTRATS */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ borderRadius: 5, p: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
              <TextField 
                fullWidth placeholder="Rechercher par numéro de compte..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ mb: 3 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search color="primary" /></InputAdornment> }}
              />
              <TableContainer>
                {loading ? <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box> : (
                  <Table>
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 'bold', color: '#64748B', fontSize: '0.75rem' } }}>
                        <TableCell>COMPTE</TableCell>
                        <TableCell>CAPITAL</TableCell>
                        <TableCell>PROGRESSION</TableCell>
                        <TableCell>STATUT</TableCell>
                        <TableCell align="right">ACTIONS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredContracts.length > 0 ? (
                        filteredContracts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((contract) => (
                            <TableRow key={contract.id} hover>
                            <TableCell>
                                <Typography variant="body2" fontWeight="bold">{contract.compte?.numero_compte || 'N/A'}</Typography>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{new Intl.NumberFormat().format(contract.capital_initial)} F</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>
                                <LinearProgress variant="determinate" value={contract.progression_temps || 0} sx={{ height: 6, borderRadius: 5, mb: 0.5 }} />
                                <Typography variant="caption" color="textSecondary">{contract.progression_temps || 0}% complété</Typography>
                            </TableCell>
                            <TableCell>
                                <Chip 
                                    label={contract.statut} 
                                    size="small" 
                                    color={contract.statut === 'ACTIF' ? 'success' : 'warning'} 
                                    sx={{ fontWeight: 'bold', fontSize: '0.7rem' }} 
                                />
                            </TableCell>
                            <TableCell align="right">
                                <IconButton size="small" onClick={() => handleOpenCloture(contract)} color="error">
                                <Close fontSize="small" />
                                </IconButton>
                            </TableCell>
                            </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={5} align="center">Aucun contrat trouvé</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </TableContainer>
              <TablePagination component="div" count={filteredContracts.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)} />
            </Paper>
          </Grid>

          {/* SIMULATEUR */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Calculate color="primary" /> Simulation de Gain
                </Typography>
                
                <TextField 
                  fullWidth label="Montant du dépôt" type="number" value={simuData.amount} 
                  onChange={(e) => setSimuData({...simuData, amount: e.target.value})} sx={{ mb: 2 }} 
                />
                
                <TextField 
                  select fullWidth label="Choisir une offre" value={simuData.typeId} 
                  onChange={(e) => setSimuData({...simuData, typeId: e.target.value})} sx={{ mb: 3 }}
                >
                  {Array.isArray(datTypes) && datTypes.map(t => (
                    <MenuItem key={t.id} value={t.id}>{t.libelle}</MenuItem>
                  ))}
                </TextField>

                {simuLoading ? <Box sx={{ textAlign: 'center' }}><CircularProgress size={24} /></Box> : backendSimulation && (
                  <Box sx={{ p: 2, bgcolor: '#F0F4FF', borderRadius: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Intérêts estimés :</Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary">+{new Intl.NumberFormat().format(backendSimulation.gain_net)} F</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Échéance :</Typography>
                      <Typography variant="body2" fontWeight="bold">{backendSimulation.date_fin}</Typography>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="h5" align="center" fontWeight="900" color="primary">
                      {new Intl.NumberFormat().format(backendSimulation.total_echeance)} F
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* MODALE SOUSCRIPTION (FIX COMPTES) */}
        <Dialog open={open} onClose={() => !submitLoading && setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Nouveau Contrat DAT</DialogTitle>
          <DialogContent sx={{ mt: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                   <TextField 
                  select 
                  fullWidth 
                  label="Compte Source" 
                  value={formData.account_id} 
                  onChange={(e) => setFormData({...formData, account_id: e.target.value})}
                >
                  {accounts.length > 0 ? (
                    accounts.map((acc) => (
                      <MenuItem key={acc.id} value={acc.id}>
                        {acc.numero_compte} — {new Intl.NumberFormat().format(acc.solde)} F
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Aucun compte trouvé (vérifiez la pagination)</MenuItem>
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  select fullWidth label="Type de DAT" value={formData.dat_type_id} 
                  onChange={(e) => setFormData({...formData, dat_type_id: e.target.value})}
                >
                  {Array.isArray(datTypes) && datTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>{type.libelle} - {type.duree_mois} mois</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth type="number" label="Montant à investir" value={formData.montant} 
                  onChange={(e) => setFormData({...formData, montant: e.target.value})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={handleSubscribe} disabled={submitLoading} sx={{ background: activeGradient }}>
              Confirmer la souscription
            </Button>
          </DialogActions>
        </Dialog>

        {/* MODALE CLÔTURE */}
        <Dialog open={clotureDialog.open} onClose={() => setClotureDialog({ ...clotureDialog, open: false })} PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>Confirmation de clôture</DialogTitle>
          <DialogContent>
            {clotureDialog.data && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>Récapitulatif financier avant remboursement :</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#FFF5F5' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption">Capital :</Typography>
                    <Typography variant="body2">{new Intl.NumberFormat().format(clotureDialog.data.capital)} F</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="error">Pénalité retrait anticipé :</Typography>
                    <Typography variant="body2" color="error">-{new Intl.NumberFormat().format(clotureDialog.data.penalites)} F</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" fontWeight="bold">Net à reverser :</Typography>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      {new Intl.NumberFormat().format(clotureDialog.data.montant_final)} F
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setClotureDialog({ ...clotureDialog, open: false })}>Annuler</Button>
            <Button variant="contained" color="error" onClick={confirmCloture} disabled={submitLoading}>
              Clôturer maintenant
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}