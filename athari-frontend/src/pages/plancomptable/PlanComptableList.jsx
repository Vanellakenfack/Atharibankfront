import React, { useEffect, useState } from "react";
import { 
  Box, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, TextField, 
  InputAdornment, Avatar, Paper, Typography, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem 
} from "@mui/material";
import { Add, Edit, Search, FilterList, AccountBalance } from "@mui/icons-material";
import { indigo } from "@mui/material/colors";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";

export default function PlanComptableList() {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  
  // États pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // États pour la Modale (Ajout & Modification)
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState(null);
  
  const [newAccount, setNewAccount] = useState({
    code: '',
    libelle: '',
    categorie_id: '',
    nature_solde: 'DEBIT',
    est_actif: true
  });

  const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

  // Chargement des données
  const fetchInitialData = async () => {
    try {
      const [resAccounts, resCategories] = await Promise.all([
      ApiClient.get("/plan-comptable/comptes"),
      ApiClient.get("/plan-comptable/categories")
      ]);
      setAccounts(resAccounts.data.data);
      setCategories(resCategories.data.data);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Gestionnaires Modale
  const handleOpen = () => {
    setEditMode(false);
    setOpen(true);
  };

  const handleEditOpen = (account) => {
    setEditMode(true);
    setCurrentAccountId(account.id);
    // On pré-remplit avec les données actuelles
    setNewAccount({
      code: account.code,
      libelle: account.libelle,
      categorie_id: account.categorie?.id || '',
      nature_solde: account.comptabilite?.nature_solde || 'DEBIT',
      est_actif: account.statut?.est_actif ?? true
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentAccountId(null);
    setNewAccount({ 
        code: '', 
        libelle: '', 
        categorie_id: '', 
        nature_solde: 'DEBIT', 
        est_actif: true 
    });
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        // Mode Modification
        await ApiClient.put(`/plan-comptable/comptes/${currentAccountId}`, newAccount);
      } else {
        // Mode Création
        await ApiClient.post("/plan-comptable/comptes", newAccount);
      }
      fetchInitialData(); 
      handleClose();
    } catch (error) {
      // Si erreur 422, Laravel renvoie les détails dans error.response.data.errors
      console.error("Erreur lors de la sauvegarde:", error.response?.data || error);
      alert("Erreur de validation. Vérifiez les champs (le code doit être unique).");
    }
  };

  // Pagination & Filtrage
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredAccounts = accounts.filter(a => 
    a.code.includes(search) || 
    a.libelle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        
        {/* HEADER SECTION */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: indigo[500], background: activeGradient }}>
                <AccountBalance />
              </Avatar>
              Plan Comptable
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Gestion du référentiel comptable et des catégories
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={handleOpen}
            sx={{ borderRadius: 3, background: activeGradient, textTransform: 'none', fontWeight: 'bold', px: 3, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
          >
            Nouveau Compte
          </Button>
        </Box>

        <Paper sx={{ borderRadius: 5, p: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
          
          {/* BARRE DE RECHERCHE */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField 
              fullWidth 
              placeholder="Rechercher un code ou un intitulé..."
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#FBFDFF' } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search color="primary" /></InputAdornment> }}
            />
            <Button variant="outlined" startIcon={<FilterList />} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold', px: 3 }}>
              Filtres
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { borderBottom: '2px solid #F1F5F9', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem' } }}>
                  <TableCell>Code</TableCell>
                  <TableCell>Intitulé du Compte</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Type / Nature</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((acc) => (
                    <TableRow key={acc.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFF' } }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#6366f1' }}>{acc.code}</TableCell>
                      <TableCell sx={{ fontWeight: '600', color: '#1E293B' }}>{acc.libelle}</TableCell>
                      <TableCell>
                        {acc.categorie ? (
                          <Typography variant="body2" sx={{ fontWeight: '700', color: '#1E293B', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                            {acc.categorie.nom} 
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled">Non classé</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={acc.comptabilite?.nature_technique || "DEBIT"} 
                          size="small" 
                          sx={{ fontWeight: 'bold', fontSize: '0.7rem' }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: acc.statut?.est_actif ? '#10B981' : '#EF4444' }} />
                          <Typography variant="body2" fontWeight="600">{acc.statut?.label || 'Actif'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditOpen(acc)}
                          sx={{ color: '#6366f1', bgcolor: '#EEF2FF', '&:hover': { bgcolor: '#E0E7FF' } }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredAccounts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page:"
          />
        </Paper>
      </Box>

      {/* MODALE UNIQUE (AJOUT & MODIFICATION) */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: indigo[900] }}>
          {editMode ? "Modifier le Compte" : "Nouveau Compte"}
        </DialogTitle>      
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth label="Code" 
                value={newAccount.code} 
                onChange={(e) => setNewAccount({...newAccount, code: e.target.value})} 
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField 
                fullWidth label="Intitulé" 
                value={newAccount.libelle} 
                onChange={(e) => setNewAccount({...newAccount, libelle: e.target.value})} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select fullWidth label="Catégorie"
                value={newAccount.categorie_id}
                onChange={(e) => setNewAccount({...newAccount, categorie_id: e.target.value})}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.code} - {cat.nom || cat.libelle}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select fullWidth label="Nature"
                value={newAccount.nature_solde}
                onChange={(e) => setNewAccount({...newAccount, nature_solde: e.target.value})}
              >
                <MenuItem value="DEBIT">DÉBIT (Actif / Charge)</MenuItem>
                <MenuItem value="CREDIT">CRÉDIT (Passif / Produit)</MenuItem>
                <MenuItem value="MIXTE">INDETERMINE</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit">Annuler</Button>
          <Button variant="contained" onClick={handleSave} sx={{ background: activeGradient, borderRadius: 2 }}>
            {editMode ? "Mettre à jour" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}