import React, { useEffect, useState } from "react";
import { 
  Box, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Typography, IconButton, 
  Switch, Dialog, DialogTitle, DialogContent, TextField, Grid, DialogActions,
  MenuItem, Avatar, Chip, InputAdornment
} from "@mui/material";
import { Add, Edit, AccountBalance, Percent, Timer, SettingsSuggest } from "@mui/icons-material";
import { indigo } from "@mui/material/colors";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";

export default function DatTypeManager() {
  const [types, setTypes] = useState([]);
  const [planComptable, setPlanComptable] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  
  const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

  const initialFormState = {
    libelle: "", 
    taux_interet: "", 
    taux_penalite: "", 
    duree_mois: "", 
    is_active: true,
    plan_comptable_interet_id: "",
    plan_comptable_penalite_id: ""
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
      // TRÈS IMPORTANT : Conversion pour le decimal(5,4) de la base de données
      // On envoie 0.05 si l'utilisateur a saisi 5
      const dataToSend = {
        ...formData,
        taux_interet: parseFloat(formData.taux_interet) / 100,
        taux_penalite: parseFloat(formData.taux_penalite || 0) / 100,
      };

      if (editingType) {
        await ApiClient.put(`/dat/types/${editingType.id}`, dataToSend);
      } else {
        await ApiClient.post("/dat/types", dataToSend);
      }
      setOpen(false);
      fetchData();
    } catch (e) { 
      console.error(e.response?.data);
      alert(e.response?.data?.message || "Erreur lors de l'enregistrement."); 
    }
  };

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        
        {/* HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: indigo[500], background: activeGradient }}>
                <AccountBalance />
              </Avatar>
              Offres de Dépôts (DAT)
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Configurez les taux (format %) et liaisons comptables
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => { 
              setEditingType(null); 
              setFormData(initialFormState);
              setOpen(true); 
            }}
            sx={{ background: activeGradient, borderRadius: '12px', fontWeight: 'bold', px: 3 }}
          >
            Nouvelle Offre
          </Button>
        </Box>

        {/* TABLEAU */}
        <Paper sx={{ borderRadius: 5, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nom de l'offre</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Taux (Annuel / Pén.)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Durée</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Imputation Comptable</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {types.map((type) => (
                  <TableRow key={type.id} hover>
                    <TableCell sx={{ fontWeight: '700' }}>{type.libelle}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {/* Multiplication par 100 pour l'affichage humain */}
                        <Chip label={`Int: ${(type.taux_interet * 100).toFixed(2)}%`} size="small" sx={{ bgcolor: '#EEF2FF', color: '#6366f1', fontWeight: 'bold' }} />
                        <Chip label={`Pén: ${(type.taux_penalite * 100).toFixed(2)}%`} size="small" sx={{ bgcolor: '#FFF7ED', color: '#f59e0b', fontWeight: 'bold' }} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Timer fontSize="small" color="disabled" />
                        <Typography variant="body2">{type.duree_mois} mois</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 'bold' }}>
                          Intérêt: {type.compte_interet?.code || 'Non lié'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 'bold' }}>
                          Pénalité: {type.compte_penalite?.code || 'Non lié'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Switch checked={Boolean(type.is_active)} color="primary" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => { 
                        setEditingType(type); 
                        setFormData({ 
                          ...type,
                          // Conversion inverse pour le formulaire lors de l'édition
                          taux_interet: type.taux_interet * 100,
                          taux_penalite: type.taux_penalite * 100
                        }); 
                        setOpen(true); 
                      }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* DIALOGUE */}
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            {editingType ? "Modifier l'offre" : "Nouvelle Offre DAT"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField fullWidth label="Nom de l'offre" value={formData.libelle} onChange={(e) => setFormData({...formData, libelle: e.target.value})} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth type="number" label="Taux Intérêt (%)" value={formData.taux_interet} onChange={(e) => setFormData({...formData, taux_interet: e.target.value})} 
                  InputProps={{ startAdornment: <InputAdornment position="start"><Percent fontSize="small"/></InputAdornment> }} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth type="number" label="Taux Pénalité (%)" value={formData.taux_penalite} onChange={(e) => setFormData({...formData, taux_penalite: e.target.value})} 
                  InputProps={{ startAdornment: <InputAdornment position="start"><Percent fontSize="small"/></InputAdornment> }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth type="number" label="Durée (Mois)" value={formData.duree_mois} onChange={(e) => setFormData({...formData, duree_mois: e.target.value})} 
                  InputProps={{ startAdornment: <InputAdornment position="start"><Timer fontSize="small"/></InputAdornment> }} />
              </Grid>
              <Grid item xs={12}><Typography variant="subtitle2" sx={{ color: indigo[700], fontWeight: 'bold', mt: 1 }}>Liaisons Comptables</Typography></Grid>
              <Grid item xs={12}>
                <TextField select fullWidth label="Compte Intérêts" value={formData.plan_comptable_interet_id} onChange={(e) => setFormData({...formData, plan_comptable_interet_id: e.target.value})}>
                  {planComptable.map((cpte) => (
                    <MenuItem key={cpte.id} value={cpte.id}>{cpte.code} - {cpte.libelle}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField select fullWidth label="Compte Pénalités" value={formData.plan_comptable_penalite_id} onChange={(e) => setFormData({...formData, plan_comptable_penalite_id: e.target.value})}>
                  {planComptable.map((cpte) => (
                    <MenuItem key={cpte.id} value={cpte.id}>{cpte.code} - {cpte.libelle}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={handleSubmit} sx={{ background: activeGradient }}>Confirmer</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}