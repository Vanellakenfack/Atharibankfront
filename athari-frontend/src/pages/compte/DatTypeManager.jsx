import React, { useEffect, useState } from "react";
import { 
  Box, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Typography, IconButton, 
  Switch, Dialog, DialogTitle, DialogContent, TextField, Grid, DialogActions,
  MenuItem, Avatar, Chip, InputAdornment, Divider, Stack
} from "@mui/material";
import { 
  Add, Edit, AccountBalance, Timer, MenuBook, History, 
  Gavel, SettingsSuggest, Security, Payments 
} from "@mui/icons-material";
import { indigo, green, orange, red, blue } from "@mui/material/colors";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";

export default function DatTypeManager() {
  const [types, setTypes] = useState([]);
  const [planComptable, setPlanComptable] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  
  // Style cohérent avec DatContractManager
  const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

  const initialFormState = {
    libelle: "", 
    taux_interet: "", 
    taux_penalite: "", 
    duree_mois: "", 
    plan_comptable_chapitre_id: "", 
    plan_comptable_interet_id: "",  
    plan_comptable_penalite_id: "", 
    periodicite_defaut: "E",         
    is_active: true
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      const [resTypes, resPlan] = await Promise.all([
        ApiClient.get("/dat/types"),
        ApiClient.get("/plan-comptable/comptes")
      ]);
      setTypes(resTypes.data?.donnees || resTypes.data?.data || []);
      setPlanComptable(resPlan.data?.data || resPlan.data || []);
    } catch (e) { console.error("Erreur de chargement:", e); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    try {
      const dataToSend = {
        ...formData,
        taux_interet: parseFloat(formData.taux_interet) / 100,
        taux_penalite: parseFloat(formData.taux_penalite) / 100,
      };

      if (editingType) {
        await ApiClient.put(`/dat/types/${editingType.id}`, dataToSend);
      } else {
        await ApiClient.post("/dat/types", dataToSend);
      }
      setOpen(false);
      fetchData();
    } catch (e) { 
      alert(e.response?.data?.message || "Erreur lors de l'enregistrement."); 
    }
  };

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        
        {/* HEADER MODERNE */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: indigo[500], background: activeGradient, width: 50, height: 50 }}>
                <SettingsSuggest fontSize="large" />
              </Avatar>
              Types d'Offres DAT
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, ml: 1 }}>
              Paramétrage des produits financiers et liaisons comptables
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => { setEditingType(null); setFormData(initialFormState); setOpen(true); }}
            sx={{ 
                background: activeGradient, 
                borderRadius: 3, 
                fontWeight: 'bold', 
                px: 3, 
                py: 1.2,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' 
            }}
          >
            Nouvelle Offre
          </Button>
        </Box>

        <Paper sx={{ borderRadius: 5, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: '800', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Produit / Durée</TableCell>
                  <TableCell sx={{ fontWeight: '800', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Conditions</TableCell>
                  <TableCell sx={{ fontWeight: '800', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Pénalité Sortie</TableCell>
                  <TableCell sx={{ fontWeight: '800', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Architecture Comptable</TableCell>
                  <TableCell sx={{ fontWeight: '800', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>État</TableCell>
                  <TableCell align="right" sx={{ fontWeight: '800', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {types.map((type) => (
                  <TableRow key={type.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFF' } }}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="800" color="primary.main">{type.libelle}</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                         <Timer sx={{ fontSize: 14, color: 'text.disabled' }} />
                         <Typography variant="caption" fontWeight="bold" color="textSecondary">{type.duree_mois} Mois</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${(type.taux_interet * 100).toFixed(2)} %`} 
                        size="small" 
                        sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: '800', borderRadius: 1.5 }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${(type.taux_penalite * 100).toFixed(2)} %`} 
                        size="small" 
                        sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: '800', borderRadius: 1.5 }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Security sx={{ fontSize: 14, color: indigo[300] }} />
                            <Typography variant="caption" sx={{ color: '#475569', fontWeight: '600' }}>
                                Bilan: {type.plan_comptable_chapitre_id || '---'}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Payments sx={{ fontSize: 14, color: orange[300] }} />
                            <Typography variant="caption" color="textSecondary">
                                Charge: {type.plan_comptable_interet_id || '---'}
                            </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Switch checked={Boolean(type.is_active)} color="success" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        sx={{ bgcolor: '#EEF2FF', color: '#6366f1', '&:hover': { bgcolor: '#6366f1', color: 'white' } }}
                        onClick={() => { 
                            setEditingType(type); 
                            setFormData({ 
                            ...type,
                            taux_interet: type.taux_interet * 100,
                            taux_penalite: (type.taux_penalite || 0) * 100
                            }); 
                            setOpen(true); 
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* MODALE DE CONFIGURATION (DIALOGUE) */}
        <Dialog 
            open={open} 
            onClose={() => setOpen(false)} 
            fullWidth 
            maxWidth="sm" 
            PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: '900', color: '#1E293B', fontSize: '1.2rem' }}>
            {editingType ? "Édition de l'Offre" : "Configuration d'un nouveau Produit"}
          </DialogTitle>
          <DialogContent>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 3, display: 'block' }}>
                Remplissez les informations financières et comptables du produit DAT.
            </Typography>
            
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField 
                    fullWidth 
                    label="Désignation du produit" 
                    variant="filled"
                    value={formData.libelle} 
                    onChange={(e) => setFormData({...formData, libelle: e.target.value})} 
                    placeholder="ex: DAT Privilège 12 mois" 
                />
              </Grid>
              
              <Grid item xs={4}>
                <TextField fullWidth type="number" label="Taux (%)" value={formData.taux_interet} 
                  onChange={(e) => setFormData({...formData, taux_interet: e.target.value})} 
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              </Grid>

              <Grid item xs={4}>
                <TextField fullWidth type="number" label="Pénalité (%)" value={formData.taux_penalite} 
                  onChange={(e) => setFormData({...formData, taux_penalite: e.target.value})} 
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              </Grid>
              
              <Grid item xs={4}>
                <TextField fullWidth type="number" label="Durée" value={formData.duree_mois} 
                  onChange={(e) => setFormData({...formData, duree_mois: e.target.value})} 
                  InputProps={{ endAdornment: <InputAdornment position="end">mois</InputAdornment> }} />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}><Chip label="Liaisons Plan Comptable" size="small" sx={{ fontWeight: 'bold' }} /></Divider>
              </Grid>

              <Grid item xs={12}>
                <TextField select fullWidth label="Compte de Capital (Bilan)" value={formData.plan_comptable_chapitre_id} 
                  onChange={(e) => setFormData({...formData, plan_comptable_chapitre_id: e.target.value})}
                  InputProps={{ startAdornment: <MenuBook sx={{ mr: 1, color: indigo[400] }} /> }}>
                  {planComptable.map((cpte) => (
                    <MenuItem key={cpte.id} value={cpte.id}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>{cpte.code}</Typography>
                        <Typography variant="body2" color="textSecondary">{cpte.libelle}</Typography>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField select fullWidth label="Compte de Charges (Intérêts)" value={formData.plan_comptable_interet_id} 
                  onChange={(e) => setFormData({...formData, plan_comptable_interet_id: e.target.value})}
                  InputProps={{ startAdornment: <History sx={{ mr: 1, color: orange[400] }} /> }}>
                  {planComptable.map((cpte) => (
                    <MenuItem key={cpte.id} value={cpte.id}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>{cpte.code}</Typography>
                        <Typography variant="body2" color="textSecondary">{cpte.libelle}</Typography>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField select fullWidth label="Compte de Produits (Pénalités)" value={formData.plan_comptable_penalite_id} 
                  onChange={(e) => setFormData({...formData, plan_comptable_penalite_id: e.target.value})}
                  InputProps={{ startAdornment: <Gavel sx={{ mr: 1, color: red[400] }} /> }}>
                  {planComptable.map((cpte) => (
                    <MenuItem key={cpte.id} value={cpte.id}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>{cpte.code}</Typography>
                        <Typography variant="body2" color="textSecondary">{cpte.libelle}</Typography>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#64748B', fontWeight: 'bold' }}>Annuler</Button>
            <Button 
                variant="contained" 
                onClick={handleSubmit} 
                sx={{ background: activeGradient, borderRadius: 2, px: 4, fontWeight: 'bold' }}
            >
              Sauvegarder l'Offre
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}